import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getQuestionStats from '@salesforce/apex/RFPDocumentController.getQuestionStats';
import getFilteredQuestions from '@salesforce/apex/RFPDocumentController.getFilteredQuestions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import downloadAudit from '@salesforce/apex/RFPDocumentController.downloadAudit';
import { loadScript } from 'lightning/platformResourceLoader';
import xlsx from '@salesforce/resourceUrl/ExcelJSFile';
import getDocumentFileName from '@salesforce/apex/RFPDocumentController.getDocumentFileName';

const RFP_FIELDS = ['RFP__c.Name', 'RFP__c.File_Type__c'];

export default class RfpDocumentDownload extends LightningElement {
    @api recordId;
    stats;
    rfpName;
    fileType;
    isLoading = true;
    xlsxInitialized = false;

    // helper to strip HTML and decode entities
    stripHTML(html) {
        if (!html) return '';
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    //  Cleans all HTML fields for reuse across Excel/Word
    sanitizeData(data) {
        return data.map(r => ({
            ...r,
            RFP_Question__c: this.stripHTML(r.RFP_Question__c),
            Proposal_Gateway_Response__c: this.stripHTML(r.Proposal_Gateway_Response__c),
            Final_Answer__c: this.stripHTML(r.Final_Answer__c)
        }));
    }

    @wire(getRecord, { recordId: '$recordId', fields: RFP_FIELDS })
    wiredRFP({ error, data }) {
        if (data) {
            this.rfpName = data.fields.Name.value;
            let ft = data.fields.File_Type__c?.value;
            this.fileType = ft ? ft.trim().toLowerCase() : '';
            this.loadStats();
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    renderedCallback() {
        if (this.xlsxInitialized) return;
        this.xlsxInitialized = true;
        loadScript(this, xlsx);
    }

    loadStats() {
        getQuestionStats({ rfpId: this.recordId })
            .then(result => {
                this.stats = result;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleFinalizedDownload() {
        if (this.stats && this.stats.finalizedCount === 0) {
            this.showCustomWarningToast('Warning', 'No finalized answers available. Please review and finalize the answers before attempting to download.');
        } else {
            if (this.fileType === 'excel') {
                this.downloadExcel();
            } else {
                this.downloadDocument(true, 'all');
            }
        }
    }

    handleStrategicDownload() {
        if (this.stats?.strategicFinalized === 0) {
            this.showCustomWarningToast('Warning', 'No finalized strategic answers available.');
        } else {
            if (this.fileType === 'excel') {
                this.downloadExcel('strategic');
            } else {
                this.downloadDocument(true, 'strategic');
            }
        }
    }

    handleNonStrategicDownload() {
        if (this.stats?.nonStrategicFinalized === 0) {
            this.showCustomWarningToast('Warning', 'No finalized non-strategic answers available.');
        } else {
            if (this.fileType === 'excel') {
                this.downloadExcel('non-strategic');
            } else {
                this.downloadDocument(true, 'non-strategic');
            }
        }
    }

    // Excel export (using cleaned data)
    downloadExcel(questionFilterType = 'all') {
        let finalizedOnly = true;
        getFilteredQuestions({ rfpId: this.recordId, finalizedOnly, questionFilterType })
            .then(async data => {
                if (!data || data.length === 0) {
                    this.showToast('Error', 'No RFP data available for Excel export.', 'error');
                    return;
                }

                // Clean HTML tags and entities before generating Excel
                const cleanedData = this.sanitizeData(data);

                let fileName = await getDocumentFileName({ rfpId: this.recordId });
                fileName = fileName.replace(/[^a-zA-Z0-9_\- ]/g, '_');

                const grouped = {};
                cleanedData.forEach(r => {
                    const sheetName = r.Sheet_Name__c || 'Sheet1';
                    if (!grouped[sheetName]) grouped[sheetName] = [];
                    grouped[sheetName].push(r);
                });

                const headers = ["RFP Question Number", "RFP Question", "Proposal Gateway Response", "Finalized Answer"];
                const wb = XLSX.utils.book_new();
                Object.keys(grouped).forEach(sheetName => {
                    const rows = grouped[sheetName].map(r => [
                        r.RFP_Question_Number__c,
                        r.RFP_Question__c,
                        r.Proposal_Gateway_Response__c,
                        r.Final_Answer__c
                    ]);
                    const worksheetData = [headers, ...rows];
                    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
                    ws['!cols'] = [
                        { wch: 18 }, { wch: 40 }, { wch: 40 }, { wch: 40 }
                    ];
                    XLSX.utils.book_append_sheet(wb, ws, sheetName);
                });

                XLSX.writeFile(wb, `${fileName}.xlsx`);
                this.closeModal();
            })
            .catch(error => {
                this.showToast('Error', 'Failed to fetch RFP data for Excel: ' + (error?.body?.message || error?.message), 'error');
            });
    }

    downloadDocument(finalizedOnly, questionFilterType) {
        let downloadType = 'All Finalized Answers';
        if (questionFilterType === 'strategic') {
            downloadType = 'Strategic Finalized Answers';
        }
        downloadAudit({
            downloadType: downloadType,
            numberOfQuestions: this.stats?.finalizedCount || 0,
            rfpId: this.recordId
        })
            .then(() => {
                const iframe = document.createElement('iframe');
                iframe.src = `/apex/RFP_Answer_Document?id=${this.recordId}&download=true&finalizedOnly=${finalizedOnly}&questionFilterType=${questionFilterType}`;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                setTimeout(() => document.body.removeChild(iframe), 5000);
                this.closeModal();
            })
            .catch(error => {
                console.error('Audit logging failed:', error);
                const errorMessage = error?.body?.message || error?.message || JSON.stringify(error);
                this.showToast('Error', 'Audit log failed: ' + errorMessage, 'error');
            });
    }

    closeModal() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }

    showCustomWarningToast(title, message) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: 'warning',
            mode: 'pester'
        });
        this.dispatchEvent(toastEvent);
    }
}