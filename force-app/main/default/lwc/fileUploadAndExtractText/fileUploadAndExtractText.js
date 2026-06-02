import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { CloseActionScreenEvent } from 'lightning/actions';


import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import JSZipLib from '@salesforce/resourceUrl/SA_jszip2';
// import Mammoth_Min from '@salesforce/resourceUrl/mammoth_min';
import SHEETJS from '@salesforce/resourceUrl/ExcelJSFile';
import IncreaseModalSize from "@salesforce/resourceUrl/SmartAnalyserModalSize";
import { CurrentPageReference } from 'lightning/navigation';




import uploadFile from '@salesforce/apex/OpenAIController.uploadFile';
import startBatchProcessing from '@salesforce/apex/OpenAIController.startBatchProcessing'; // Import startBatchProcessing
import updateRFPDigitize from '@salesforce/apex/OpenAIController.updateRFPDigitize'; // Import updateRFPDigitize
import insertQuestions from '@salesforce/apex/OpenAIController.insertQuestions';
// import getFileContent from '@salesforce/apex/OpenAIController.getFileContent'; // Import getFileContent (will be used after RFP creation)

import ACCOUNT_ID_FIELD from '@salesforce/schema/Opportunity.AccountId';
import PRIMARY_CONSULTANT_FIELD from '@salesforce/schema/Opportunity.PrimaryConsultant__c';
import CONSULTING_FIRM_FIELD from '@salesforce/schema/Opportunity.Primary_Consulting_Firm__c';
import SALES_SEASON_FIELD from '@salesforce/schema/Opportunity.Sales_Season1__c';

const FIELDS = [
    ACCOUNT_ID_FIELD,
    PRIMARY_CONSULTANT_FIELD,
    CONSULTING_FIRM_FIELD,
    SALES_SEASON_FIELD,
];
// NOTE: Ensure this matches the first code block's constant value.
const MAX_CHUNK_SIZE = 8192; // Target maximum size for the merged chunk (8 KB)

export default class FileUploadAndExtractText extends NavigationMixin(LightningElement) {
    @api recordId; // This recordId will be the Opportunity ID initially
    @track maId;
    @track rfpRecordId; // To store the newly created RFP Id
    company = '';
    primaryConsultant = '';
    consultingFirm = '';
    year = '';
    @track fileName;
    showSpinner = false;
    //uploading = false;
    //fileData;
    // Properties for digitization from NewFileUploadAndExtractAsHtml
    @track isProcessing = false;
    //@track mammothLoaded = false;
    //textChunks = [];
    // @track fileContentForDigitization = ''; // To hold base64 content for Mammoth
    @track currentRFPStatus = 'New'; // Initialize as New, will be updated by Apex call

    // Excel digitization var(s)
    isExcelMode = false;
    file;
    XLSX;
    sheetJsInitialized = false;

    // Excel state
    @track sheetOptions = [];
    @track selectedSheets = [];
    @track sheetRenderData = [];
    @track jsonData = [];
    @track showConfirmationForExcel = false;
    @track showInstructions = true;

    @track showErrorBanner = false;
    @track errorMessages = [];
    @track errorTitle = '';
    @track isLoaded = false;

    // noQuestionNumber = false;


    headerRowOptions = [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
        { label: '6', value: '6' },
        { label: '7', value: '7' },
        { label: '8', value: '8' },
        { label: '9', value: '9' },
        { label: '10', value: '10' }
    ];



    @track outputChunks = [];
    //@track jsZipLoaded = false;
    @track isLoading = false;
    @track error = '';

    jsZipLoaded = false;

    get effectiveRecordId() {
        return this.recordId || this.maId;
    }
    accountFilter = {
        criteria: [

            {
                fieldPath: 'Status__c',
                operator: 'eq',
                value: 'Open',
            },
        //    {
        //         fieldPath: 'RecordTypeId',
        //         operator: 'eq',
        //         value: '0126A000000T7oWQAS',
        //     } 
        ],
       // filterLogic: '1 AND 2'

    };



    // ====== Dynamic Header ======
    get panelHeader() {
        // return this.isExcelMode && this.fileName ? this.fileName : 'Upload and Process RFP Response';
        if (this.recordId) {
            return this.isExcelMode && this.fileName ? this.fileName : 'Upload and Process RFP Response';
        }
        else {
            return '';

        }
    }

    handleMaChange(event) {
        this.maId = event.detail.recordId;
    }


    connectedCallback() {
        loadStyle(this, IncreaseModalSize);

        // Load Mammoth.js when the component loads
        // if (!this.mammothLoaded) {
        // 	loadScript(this, Mammoth_Min)
        // 		.then(() => {
        // 			this.mammothLoaded = true;
        // 			//console.log('Mammoth.js loaded successfully.');
        // 		})
        // 		.catch(error => {
        // 			console.error('Mammoth.js failed to load:', error);
        // 			this.toast('Error', 'Failed to load document processor: ' + error.message, 'error');
        // 		});
        // }

        if (!this.jsZipLoaded) {
            loadScript(this, JSZipLib)
                .then(() => {
                    this.jsZipLoaded = true;
                    //console.log('✅ JSZip loaded');
                })
                .catch(error => {
                    console.error('❌ Error loading JSZip:', error);
                    this.toast('Error', 'Failed to load DOCX parser library.', 'error');
                });
        }


        if (!this.sheetJsInitialized) {
            loadScript(this, SHEETJS).then(() => {
                this.sheetJsInitialized = true;
                this.XLSX = window.XLSX;
            });
        }
    }

    @wire(CurrentPageReference)
    handlePageRef() {
        // Force reset EVERY time tab becomes active
        this.isLoaded = false;
        this.resetComponentState();

        Promise.resolve().then(() => {
            this.isLoaded = true;
        });
    }

    resetComponentState() {
        this.file = null;
        this.fileName = null;
        this.isExcelMode = false;
        this.maId = null;
        this.company=null;
        this.consultingFirm=null;
        this.year=null;
        this.primaryConsultant=null;

        this.sheetOptions = [];
        this.selectedSheets = [];
        this.sheetRenderData = [];
        this.jsonData = [];

        this.showConfirmationForExcel = false;
        this.showInstructions = true;
        this.showSpinner = false;
        this.isProcessing = false;

        this.errorTitle = '';
        this.errorMessages = [];
        this.showErrorBanner = false;
    }



    @wire(getRecord, {
        //recordId: '$recordId',
        recordId: '$effectiveRecordId',
        fields: FIELDS,
        optionalFields: [
            'Opportunity.Account.Name',
            'Opportunity.PrimaryConsultant__r.Name',
            'Opportunity.Primary_Consulting_Firm__r.Name'
        ]
    })
    wiredOpportunity({ error, data }) {
        if (data) {
            this.company = data.fields.Account?.displayValue || '';
            this.primaryConsultant = data.fields.PrimaryConsultant__r?.displayValue || '';
            this.consultingFirm = data.fields.Primary_Consulting_Firm__r?.displayValue || '';
            this.year = data.fields.Sales_Season1__c?.value || '';
        } else if (error) {
            this.toast('Error', error.body.message, 'error');
        }
    }


    handleFileSelect(event) {
        this.file = event.target.files[0];

        if (!this.file) return;
        /* const maxSize = 2 * 1024 * 1024;
         if (this.file.size > maxSize) {
             this.toast('Error', 'File size exceeds the 2 MB limit.', 'error');
             event.target.value = null;  
             this.file = null;
             this.fileName = null;
             return;
         }*/

        this.fileName = this.file.name;
        const ext = this.fileName.split('.').pop().toLowerCase();

        if (ext === 'docx') {
            this.isExcelMode = false;
        } else if (ext === 'xls' || ext === 'xlsx') {
            this.isExcelMode = true;
            this.prepareExcel(this.file);
        } else {
            this.toast('Error', 'Unsupported file type. Upload .docx, .xls, .xlsx only.', 'error');
            this.fileName = null;
            this.file = null;
        }
    }

    async handleProceed() {
        this.clearErrorMessage();
        this.showSpinner = true;
        //this
        if (!this.file) {
            this.toast('Error', 'Please select a file.', 'error');
            this.showSpinner = false;
            return;
        }
        // if (this.file && this.file.size > 2.5 * 1024 * 1024) { 
        //     this.toast(
        //         'Error',
        //         'File is too large. Please upload a file smaller than 2.5 MB.',
        //         'error'
        //     );
        //     this.showSpinner = false;
        //     return;
        // }
        if (!this.effectiveRecordId) {
            this.toast('Error', 'Please select Membership Activity before Proceeding', 'error');
            this.showSpinner = false;
            return;
        }

        if (this.isExcelMode) {
            // --- Validation for mandatory column mappings ---
            let missingMappings = [];

            for (const sheet of this.sheetRenderData.filter(s => s.isSelected)) {
                const map = sheet.mapping || {};
                const missing = [];

                // if (!map.RFP_Question_Number__c?.length) {
                //     missing.push('RFP Question Number');
                // } 
                //questionNumberColumn
                // if (!map.RFP_Question_Number__c?.length && !sheet.noQuestionNumber) {
                //     missing.push('RFP Question Number');
                // }
                if (!sheet.noQuestionNumber && !map.RFP_Question_Number__c?.length) {
                    missing.push('RFP Question Number');
                }
                if (!map.Proposal_Gateway_Response__c?.length) {
                    missing.push('Proposal Gateway Response');
                }
                if (!map.RFP_Question__c?.length) {
                    missing.push('RFP Question');
                }

                if (missing.length > 0) {
                    missingMappings.push(`• ${sheet.name}: ${missing.join(', ')}`);
                }
            }

            /*if (missingMappings.length > 0) {
                this.toast(
                    'Error',
                    `Please complete the following mandatory mappings before proceeding:\n${missingMappings.join('\n \n')}`,
                    'error'
                );
                this.showErrorMessage(
                    'We hit a snag.',
                    [
                         `Please complete the following mandatory mappings before proceeding:`, 
                        ...missingMappings
                    ]
                );

                return;
            }*/
            if (missingMappings.length > 0) {
                this.showErrorMessage(
                    'We hit a snag.',
                    [
                        `Please complete the following mandatory mappings before proceeding:`,
                        ...missingMappings
                    ]
                );
                this.showSpinner = false;
                return;
            }


            // this.handleReadExcel();
            //setTimeout(() => {
            this.showConfirmationForExcel = true;
            this.showSpinner = false;
            //}, 3000);
        } else {
            // this.processDocx();
            this.processDocxWithoutMammoth();
            this.showSpinner = true;

        }
    }


    closeConfirmationForExcel() {
        this.showConfirmationForExcel = false;
    }

    handleConfirmAndContinueToGenerateAIResponses() {
        this.showConfirmationForExcel = false;
        this.handleReadExcel();
    }


    // async processDocx() {
    // 	// same as FileUploadAndExtractText.saveRFPDocument()
    // 	this.showSpinner = true;
    // 	const reader = new FileReader();
    // 	reader.onload = () => {
    // 		//console.log('Reader RESULT::: ', reader.result);
    // 		const base64 = reader.result.split(',')[1];
    // 		this.fileContentForDigitization = base64;
    // 		// this.processFileContentForDigitization();
    // 		uploadFile({ base64, filename: this.fileName, recordId: this.recordId })
    // 			.then(res => {
    // 				this.rfpRecordId = res.rfpId;
    // 				this.toast('Success', 'RFP created successfully.', 'success');
    // 				this.initiateRFPDigitization();
    // 				this.navigateToRFP(this.rfpRecordId);
    // 				this.closeQuickAction();
    // 			})
    // 			.catch(err => this.toast('Error', err.body?.message || err.message, 'error'))
    // 			.finally(() => this.showSpinner = false);
    // 	};
    // 	reader.readAsDataURL(this.file);
    // }

    get instructionsIcon() {
        return this.showInstructions ? 'utility:chevrondown' : 'utility:chevronright';
    }

    toggleInstructions() {
        this.showInstructions = !this.showInstructions;
    }

    handleSelectAllSheets() {
        this.selectedSheets = this.sheetOptions.map(opt => opt.value);
        this.sheetRenderData = this.sheetRenderData.map(s => ({
            ...s,
            isSelected: this.selectedSheets.includes(s.name)
        }));
        if (this.showInstructions) {
            this.showInstructions = false;
        }
    }


    // ====== Collapsible per Sheet ======
    collapsedSheets = new Set();

    toggleSheetCollapse(event) {
        const sheetName = event.currentTarget.dataset.sheet;
        if (this.collapsedSheets.has(sheetName)) {
            this.collapsedSheets.delete(sheetName);
        } else {
            this.collapsedSheets.add(sheetName);
        }
        // Force re-render
        this.collapsedSheets = new Set(this.collapsedSheets);
    }


    // ====== Computed Sheets for Unified Mapping ======
    get hasSelectedSheets() {
        return this.selectedSheets && this.selectedSheets.length > 0;
    }

    get selectedSheetRenderData() {
        return this.sheetRenderData
            .filter(s => this.selectedSheets.includes(s.name))
            .map((s, i) => ({
                ...s,
                displayIndex: i + 1,
                isCollapsed: this.collapsedSheets.has(s.name),
                iconName: this.collapsedSheets.has(s.name)
                    ? 'utility:chevronright'
                    : 'utility:chevrondown'
            }));
    }


    /** ========== EXCEL FLOW (integrates ExcelReader) ========== */
    prepareExcel(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = this.XLSX.read(data, { type: 'array' });
            this.sheetOptions = workbook.SheetNames.map(n => ({ label: n, value: n }));
            this.sheetRenderData = workbook.SheetNames.map(n => ({
                name: n,
                rows: this.XLSX.utils.sheet_to_json(workbook.Sheets[n], { header: 1, raw: false, cellDates: true, defval: '' }),
                headerRow: '',
                headers: [],
                mapping: {
                    RFP_Question_Number__c: [],
                    RFP_Question__c: [],
                    Answer_size_limit__c: [],
                    Proposal_Gateway_Response__c: []
                },
                isSelected: false,
                noQuestionNumber: false //questionNumberColumn - Chandrika
            }));
        };
        reader.readAsArrayBuffer(file);
    }

    //questionNumberColumn
    handleNoQuestionNumberToggle(event) {
        const sheetName = event.target.dataset.sheet;
        const checked = event.target.checked;

        this.sheetRenderData = this.sheetRenderData.map(s => {
            if (s.name !== sheetName) return s;

            return {
                ...s,
                noQuestionNumber: checked,
                mapping: {
                    ...s.mapping,
                    RFP_Question_Number__c: checked ? [] : s.mapping.RFP_Question_Number__c
                }
            };
        });
    }




    handleSheetSelection(e) {
        this.selectedSheets = e.detail.value;
        this.sheetRenderData = this.sheetRenderData.map(s => ({ ...s, isSelected: this.selectedSheets.includes(s.name) }));
        if (this.showInstructions) {
            this.showInstructions = false;
        }

    }


    handleHeaderRowChange(event) {
        const sheetName = event.target.dataset.sheet;
        const selectedValue = event.detail.value; // string like "1", "2", ...
        const headerRowStr = selectedValue ? String(selectedValue) : '';

        this.sheetRenderData = this.sheetRenderData.map(s => {
            if (s.name !== sheetName) return s;

            const headerRowNum = headerRowStr ? Math.max(1, parseInt(headerRowStr, 10)) : null;
            const headerRowIndex = headerRowNum ? headerRowNum - 1 : null;
            const rows = s.rows || [];

            let headers = [];
            function getExcelColumnLetter(index) {
                let letter = ' Column ';
                let tempIndex = index;//added newly
                while (tempIndex >= 0) {
                    //letter = letter + String.fromCharCode((index % 26) + 65);
                    letter = String.fromCharCode((tempIndex % 26) + 65) + letter; // Modified for correct letter concatenation
                    tempIndex = Math.floor(tempIndex / 26) - 1;
                    //index = Math.floor(index / 26) - 1;
                }
                return letter.trim();
            }

            if (headerRowIndex !== null && rows.length > headerRowIndex) {
                headers = (rows[headerRowIndex] || []).map((col, idx) => {
                    const label =
                        col === null || col === undefined || String(col).trim() === ''
                            ? getExcelColumnLetter(idx)
                            : String(col);
                    return { label, value: idx.toString() };
                });
            }

            // ===== Auto-mapping logic =====
            let autoMapping = {
                RFP_Question_Number__c: [],
                RFP_Question__c: [],
                Answer_size_limit__c: [],
                Proposal_Gateway_Response__c: []
            };

            headers.forEach(h => {
                const text = h.label.toLowerCase();
                //if (text.includes('question number') || text.includes('id')) {
                if (text.includes('question number')) {    
                    autoMapping.RFP_Question_Number__c.push(h.value);
                } else if (text.includes('question')) {
                    autoMapping.RFP_Question__c.push(h.value);
                } else if (text.includes('limit') || text.includes('option') || text.includes('size')) {
                    autoMapping.Answer_size_limit__c.push(h.value);
                } else if (text.includes('response') || text.includes('answer') || text.includes('comment') || text.includes('reply')) {
                    autoMapping.Proposal_Gateway_Response__c.push(h.value);
                }
            });

            // ===== Compute filteredHeaders immediately =====
            const allSelected = Object.values(autoMapping).flat();
            const filteredHeaders = {
                RFP_Question_Number__c: headers.filter(h => !allSelected.includes(h.value) || autoMapping.RFP_Question_Number__c.includes(h.value)),
                RFP_Question__c: headers.filter(h => !allSelected.includes(h.value) || autoMapping.RFP_Question__c.includes(h.value)),
                Answer_size_limit__c: headers.filter(h => !allSelected.includes(h.value) || autoMapping.Answer_size_limit__c.includes(h.value)),
                Proposal_Gateway_Response__c: headers.filter(h => !allSelected.includes(h.value) || autoMapping.Proposal_Gateway_Response__c.includes(h.value))
            };

            return {
                ...s,
                headerRow: headerRowStr,
                headers: headers,
                previewRows: [], // keep empty for now
                headerSelected: headers.length > 0,
                mapping: autoMapping,
                filteredHeaders: filteredHeaders
            };
        });
    }

    handleMappingChange(event) {
        const sheetName = event.target.dataset.sheet;
        const field = event.target.dataset.field;
        const selectedValues = event.detail.value || [];

        this.sheetRenderData = this.sheetRenderData.map(s => {
            if (s.name !== sheetName) return s;

            // Update mapping for the field
            const newMapping = {
                ...s.mapping,
                [field]: Array.isArray(selectedValues) ? selectedValues : [selectedValues]
            };

            // Compute filteredHeaders dynamically based on all selections
            const allSelected = Object.entries(newMapping).flatMap(([key, val]) => val || []);
            const filteredHeaders = {
                RFP_Question_Number__c: s.headers.filter(h => !allSelected.includes(h.value) || newMapping.RFP_Question_Number__c.includes(h.value)),
                RFP_Question__c: s.headers.filter(h => !allSelected.includes(h.value) || newMapping.RFP_Question__c.includes(h.value)),
                Answer_size_limit__c: s.headers.filter(h => !allSelected.includes(h.value) || newMapping.Answer_size_limit__c.includes(h.value)),
                Proposal_Gateway_Response__c: s.headers.filter(h => !allSelected.includes(h.value) || newMapping.Proposal_Gateway_Response__c.includes(h.value))
            };

            return {
                ...s,
                mapping: newMapping,
                filteredHeaders: filteredHeaders
            };
        });
    }



    /** Read Excel and build records (uses multi-column mappings).
     * Skip rows where both options and answer are empty (per your request).
     */
    handleReadExcel() {
        if (!this.file || !this.selectedSheets.length) {
            this.toast('Error', 'Please upload and configure Excel before proceeding.', 'error');
            return;
        }

        // --- Extra validation (safety net) ---
        let missingMappings = [];

        for (const sheet of this.sheetRenderData.filter(s => s.isSelected)) {
            const map = sheet.mapping || {};
            const missing = [];

            // if (!map.RFP_Question_Number__c?.length) {
            //     missing.push('RFP Question Number');
            // }
            if (!sheet.noQuestionNumber && !map.RFP_Question_Number__c?.length) {
                missing.push('RFP Question Number');
            }
            if (!map.Proposal_Gateway_Response__c?.length) {
                missing.push('Proposal Gateway Response');
            }
            if (!map.RFP_Question__c?.length) {
                missing.push('RFP Question');
            }

            if (missing.length > 0) {
                missingMappings.push(`• ${sheet.name}: ${missing.join(', ')}`);
            }
        }

        if (missingMappings.length > 0) {
            // this.toast(
            // 	'Error',
            // 	`Please complete the following mandatory mappings before proceeding:\n${missingMappings.join('\n\n')}`,
            // 	'error'
            // );
            this.showErrorMessage(
                'We hit a snag.',
                [`Please complete the following mandatory mappings before proceeding:`, ...missingMappings]
            );
            return;
        }


        this.showSpinner = true;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];

            // Step 1: upload file and get rfp id
            //uploadFile({ base64, filename: this.fileName, recordId: this.recordId })
            uploadFile({ base64, filename: this.fileName, recordId: this.effectiveRecordId })

                .then(res => {
                    this.rfpRecordId = res.rfpId;
                    let records = [];

                    for (const sheetName of this.selectedSheets) {
                        const sheetObj = this.sheetRenderData.find(s => s.name === sheetName);
                        if (!sheetObj) continue;

                        const rows = sheetObj.rows || [];
                        const headerRowIndex = sheetObj.headerRow ? parseInt(sheetObj.headerRow, 10) - 1 : 0;
                        if (rows.length <= headerRowIndex) continue;

                        const map = sheetObj.mapping || {};
                        const hasQNumMapping =
                            Array.isArray(map.RFP_Question_Number__c) &&
                            map.RFP_Question_Number__c.length > 0;

                        // If "No Question Number Column" is NOT checked → require Question Number mapping
                        if (!sheetObj.noQuestionNumber && !hasQNumMapping) {
                            continue;
                        }

                        // Question column is always mandatory
                        if (!map.RFP_Question__c?.length) {
                            continue;
                        }
                        // require at least question number & question mapping
                        // if (!map.RFP_Question_Number__c?.length || !map.RFP_Question__c?.length) continue;

                        const getConcat = (colIdxArray, row, separator = '') => {
                            if (!colIdxArray || !colIdxArray.length) return '';
                            return colIdxArray
                                .map(idx => {
                                    const i = parseInt(idx, 10);
                                    return (row[i] !== undefined && row[i] !== null) ? String(row[i]).trim() : '';
                                })
                                .filter(v => v !== '')
                                .join(separator)
                                .trim();
                        };
                        let currentMainQNum = null; 	// Stores the numeric root of the current main question
                        let mainQuestionText = '';
                        let previousQNum = null;

                        // Helper to extract numeric root from a question number (e.g., "1 a" → "1", "4.1b" → "4.1")
                        const getRootNumber = (qNum) => {
                            if (!qNum) return '';
                            const match = qNum.trim().match(/^(\d+(?:\.\d+)*)/);
                            return match ? match[1] : '';
                        };

                        for (let r = headerRowIndex + 1; r < rows.length; r++) {
                            const row = rows[r] || [];

                            //const qNumRaw = getConcat(map.RFP_Question_Number__c, row, ''); // no space
                            const question = getConcat(map.RFP_Question__c, row, ' '); 	// space between columns
                            const options = getConcat(map.Answer_size_limit__c, row, ' '); 	// space between columns
                            const answer = getConcat(map.Proposal_Gateway_Response__c, row, ' '); // space between columns
                            let qNumRaw = '';
                            /////////new code added ----
                            const hasQNumMapping =
                                Array.isArray(map.RFP_Question_Number__c) &&
                                map.RFP_Question_Number__c.length > 0;

                            // CASE 1: Checkbox ON → use Excel row number as question number
                            if (sheetObj.noQuestionNumber === true) {
                                if (question || options || answer) {
                                    qNumRaw = String(r + 1);      // Excel row number
                                } else {
                                    qNumRaw = '';
                                }
                            }
                            // CASE 2: Normal behavior → use question number column mapping
                            else {
                                qNumRaw = getConcat(map.RFP_Question_Number__c, row, '').trim();
                            }
                            /////////new code added ----


                            // Skip completely empty rows
                            if (!qNumRaw && !question && !options && !answer) continue;
                            if (!answer || answer.trim() === "") continue;


                            const rootNum = getRootNumber(qNumRaw);
                            const currentRoot = getRootNumber(currentMainQNum);

                            // Case 1: Repeating question number → treat as sub-question of same main
                            if (qNumRaw && previousQNum && qNumRaw === previousQNum && currentMainQNum) {
                                records.push({
                                    RFP__c: this.rfpRecordId,
                                    RFP_Question_Number__c: qNumRaw,
                                    RFP_Question__c: `${mainQuestionText}\n ${question}`.trim(),
                                    Answer_size_limit__c: options,
                                    Proposal_Gateway_Response__c: answer,
                                    Sheet_Name__c: sheetName
                                });
                            }
                            // Case 2: New main question (numeric root matches a "main question" pattern)
                            else if (this.isMainQuestion(qNumRaw)) // or rootNum need to test.
                            {
                                currentMainQNum = rootNum;
                                mainQuestionText = question;

                                records.push({
                                    RFP__c: this.rfpRecordId,
                                    RFP_Question_Number__c: qNumRaw,
                                    RFP_Question__c: question,
                                    Answer_size_limit__c: options,
                                    Proposal_Gateway_Response__c: answer,
                                    Sheet_Name__c: sheetName
                                });
                            }
                            // Case 3: Sub-question with matching root → attach to current main
                            else if (currentMainQNum && rootNum === currentRoot) {
                                // Attach main question text to sub-question
                                //const combinedQuestion = `${mainQuestionText}\n ${question}`.trim();
                                const combinedQuestion = `${mainQuestionText}\n${question}`.trim();
                                records.push({
                                    RFP__c: this.rfpRecordId,
                                    RFP_Question_Number__c: qNumRaw,
                                    RFP_Question__c: combinedQuestion,
                                    Answer_size_limit__c: options,
                                    Proposal_Gateway_Response__c: answer,
                                    Sheet_Name__c: sheetName
                                });
                            }
                            // Case 3b: Alphabetic-only sub-questions like "a", "b", "c" under current main
                            else if (
                                currentMainQNum &&
                                /^[a-zA-Z]+$/.test(qNumRaw.trim())
                            ) {
                                const composedQNum = `${currentMainQNum}${qNumRaw.trim()}`; // e.g., "9a"
                                const combinedQuestion = `${mainQuestionText}\n${question}`.trim();

                                records.push({
                                    RFP__c: this.rfpRecordId,
                                    RFP_Question_Number__c: composedQNum,
                                    RFP_Question__c: combinedQuestion,
                                    Answer_size_limit__c: options,
                                    Proposal_Gateway_Response__c: answer,
                                    Sheet_Name__c: sheetName
                                });

                                previousQNum = composedQNum;
                            }


                            // Case 4: Sub-question without matching main → standalone record
                            else if (qNumRaw) {
                                records.push({
                                    RFP__c: this.rfpRecordId,
                                    RFP_Question_Number__c: qNumRaw,
                                    RFP_Question__c: question,
                                    Answer_size_limit__c: options,
                                    Proposal_Gateway_Response__c: answer,
                                    Sheet_Name__c: sheetName
                                });

                                // Optional: update currentMainQNum to rootNum if you want this sub-question to be treated as "pseudo main" for future sub-questions
                                // currentMainQNum = rootNum;
                                // mainQuestionText = question;
                                currentMainQNum = null;
                                mainQuestionText = '';
                            }
                            // Case 5: Continuation row → append to last record
                            else {
                                let lastRecord = records[records.length - 1];
                                if (lastRecord) {
                                    if (question) lastRecord.RFP_Question__c += ', ' + question;
                                    if (options) lastRecord.Answer_size_limit__c += ' ' + options;
                                    if (answer) lastRecord.Proposal_Gateway_Response__c += ', ' + answer;
                                }
                            }

                            // Update previousQNum for next iteration
                            if (qNumRaw) previousQNum = qNumRaw;
                        }
                    }

                    this.jsonData = records;
                    //console.log('JSON DATA ::', this.jsonData);

                    if (!records.length) {
                        this.toast('Info', 'No valid data found in Excel (or all rows skipped).', 'info');
                        // still return early (no insert)
                        this.showSpinner = false;
                        return null;
                    }
                    let noQFlag = false;

                    for (const sheetName of this.selectedSheets) {
                        const sheetObj = this.sheetRenderData.find(s => s.name === sheetName);
                        if (sheetObj?.noQuestionNumber === true) {
                            noQFlag = true;
                            break;
                        }
                    }


                    // Insert into Salesforce
                    return insertQuestions({ questions: this.jsonData, rfpId: this.rfpRecordId, noQuestionFlag: noQFlag });
                })
                .then(results => {
                    if (!results) return;
                    let success = results.filter(r => r.startsWith('Inserted')).length;
                    let errors = results.filter(r => r.startsWith('Failed')).length;

                    if (success) {
                        this.toast('Success', `Inserted ${success} records with ${errors} errors.`, 'success');
                    }
                    if (errors) {
                        console.error('Insert errors:', results);
                        this.toast('Error', `Some records failed.`, 'error');
                    }

                    // un-comment after testing.
                    const newStatus = errors > 0 ? 'Digitization Completed with Errors' : 'Digitization Successful';
                    if (this.rfpRecordId) {
                        this.toast('Success', 'RFP Review initiated successfully.', 'success');
                          if (this.recordId) {
                            this.navigateToRFP(this.rfpRecordId);
                            this.closeQuickAction();
                        } else {
                            this.navigateToRFP(this.rfpRecordId);
                            this.resetAndNavigate();
                        }
                        //this.navigateToRFP(this.rfpRecordId);
                        //this.closeQuickAction();
                    }
                    return updateRFPDigitize({ rfpId: this.rfpRecordId, newStatusDigitize: newStatus });
                })
                // .then(() => {
                // 	if (this.rfpRecordId) {
                // 		this.toast('Success', 'RFP Review initiated successfully.', 'success');
                // 		this.navigateToRFP(this.rfpRecordId);
                // 		this.closeQuickAction();
                // 	}
                // })
                .catch(err => {
                    console.error(err);
                    this.toast('Error', err.body?.message || err.message, 'error');
                })
                .finally(() => {
                    this.showSpinner = false;
                });
        };

        reader.readAsDataURL(this.file);
    }

    isMainQuestion(qNum) {
        if (!qNum) return false;
        // Must be purely numeric — no trailing letters allowed
        return /^[0-9]+(\.[0-9]+)*$/.test(qNum.trim()) && !/[a-zA-Z]$/.test(qNum.trim());
    }

    resetAndNavigate() {
        this.fileName = null;
        this.file = null;
        this.isExcelMode = false;
        this.maId = null;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.rfpRecordId,
                objectApiName: 'RFP__c',
                actionName: 'view'
            }
        });
        setTimeout(() => {
            window.location.reload();
        }, 200);
    }
    // Docx Implementation 	Phase - 1


    // *** REMOVED LEGACY MAMMOTH.JS/OLD CHUNKING CODE ***




    // 	DOc imp PHASE - 2 


    /** Replaces the old processDocx() + Mammoth.js flow */
    async processDocxWithoutMammoth() {
        this.showSpinner = true;
        this.isProcessing = true;

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                if (!window.JSZip) {
                    throw new Error('JSZip is not available. Ensure the static resource loads successfully.');
                }


                const zip = await window.JSZip.loadAsync(arrayBuffer);
                const documentXmlText = await zip.file('word/document.xml').async('string');
                //console.log('documentXmlText', documentXmlText);
                const numberingXmlText = await zip.file('word/numbering.xml')?.async('string').catch(() => null);
                //console.log('numberingXmlText', numberingXmlText);
                const stylesXmlText = await zip.file('word/styles.xml')?.async('string').catch(() => null);



                //console.log('stylesXmlText', stylesXmlText);
                // --- STAGE 1 LOGGING: RAW XML CONTENT ---
                //console.log('--- STAGE 1: RAW XML CONTENT ---');
                //console.log('document.xml (truncated):', documentXmlText.substring(0, 500) + '...');
                // if (numberingXmlText) //console.log('numbering.xml (truncated):', numberingXmlText.substring(0, 500) + '...');
                //if (stylesXmlText) //console.log('styles.xml (truncated):', stylesXmlText.substring(0, 500) + '...');
                //console.log('------------------------------------');


                const parser = new DOMParser();
                const documentDom = parser.parseFromString(documentXmlText, 'application/xml');
                const numberingDom = numberingXmlText ? parser.parseFromString(numberingXmlText, 'application/xml') : null;
                const stylesDom = stylesXmlText ? parser.parseFromString(stylesXmlText, 'application/xml') : null;

                const numberingMap = this.buildNumberingMapFromDom(numberingDom);
                const styleNumMap = this.buildStyleNumberingMap(stylesDom);
                const paragraphs = this.extractParagraphsFromDom(documentDom, numberingMap, styleNumMap);
                //console.log('paragraphs', paragraphs);
                //New changes 27/Nov/25
                //console.log('--- STAGE 2: PARAGRAPH EXTRACTION RESULTS (Simplified Text Array) ---');

                paragraphs.forEach((p, index) => {
                    //console.log(`P${index + 1} (${p.type}): ${p.text.substring(0, 150)}...`);
                });
                //console.log('------------------------------------');


                // 2. Perform semantic question-wise chunking
                const semanticChunks = this.smartChunkByQuestions(paragraphs);

                // 3. Merge semantic chunks to hit the target size limit
                const finalChunks = this.mergeChunksBySize(semanticChunks);

                this.outputChunks = finalChunks;

                // --- STAGE 3 LOGGING: FINAL CHUNKING RESULTS ---
                //console.log('--- STAGE 3: FINAL MERGED CHUNKING RESULTS (Size-Optimized for AI Prompt) ---');
                this.outputChunks.forEach((chunk, index) => {
                    //console.log(`Chunk ${index + 1} Title: ${chunk.title}`);
                    //console.log(`Chunk ${index + 1} Content (truncated, size ${chunk.content.length}): ${chunk.content.substring(0, 250)}...`);
                });
                //console.log('Total Final Chunks:', this.outputChunks.length);
                //console.log('------------------------------------');
                //End----New changes 27/Nov/25


                // // --- NEW CHUNKING LOGIC (Replaces old chunkByQuestion) ---
                // let questionChunks = this.smartChunkByQuestions(paragraphs);
                // this.outputChunks = this.applySizeBasedChunking(questionChunks);
                // // --- END NEW CHUNKING LOGIC ---

                // //console.log('✅ Final Chunks (after size optimization):', JSON.parse(JSON.stringify(this.outputChunks)));

                // Step 4: Convert each remaining chunk into same structure old code used
                // This prepares the array of JSON strings for the Apex batch input.
                const formattedChunks = this.outputChunks.map(chunk => {
                    const contentArray = [
                        {
                            type: "text",
                            //content: `${chunk.title ? chunk.title + '\n' : ''}${chunk.content ? chunk.content.trim() : ''}`
                            content: chunk.content ? chunk.content.trim() : ''
                        }
                    ];
                    if (contentArray[0].content.length === 0) return null;

                    return JSON.stringify(contentArray);
                }).filter(c => c !== null); // Filter out null entries (empty chunks)
                // --- STAGE 4 LOGGING: FINAL APEX PAYLOAD ---
                //console.log('--- STAGE 4: FINAL APEX PAYLOAD (Input for AI Prompt/Batch) ---');
                //console.log('RFP Record ID (Pre-Upload):', this.rfpRecordId);
                //console.log('Total Chunks/AI Prompts:', formattedChunks.length);
                formattedChunks.forEach((chunk, index) => {
                    //console.log(`Payload Chunk ${index + 1} (Truncated JSON): ${chunk.substring(0, 500)}...`);
                });
                //console.log('------------------------------------');

                //console.log('formattedChunks ::::' ,formattedChunks);


                // --- Upload file and initiate batch processing ---


                //console.log('✅ Final formatted chunks to send to Apex:', formattedChunks);

                // --- Upload file and initiate batch processing ---
                const base64 = btoa(
                    new Uint8Array(arrayBuffer)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );

                //const uploadRes = await uploadFile({ base64, filename: this.fileName, recordId: this.recordId });
                const uploadRes = await uploadFile({ base64, filename: this.fileName, recordId: this.effectiveRecordId });



                this.rfpRecordId = uploadRes.rfpId;

                await updateRFPDigitize({ rfpId: this.rfpRecordId, newStatusDigitize: 'Digitization In-Progress' });

                // Call the batch processing method with the prepared chunks
                await this.startBatch(this.rfpRecordId, formattedChunks);

                this.toast('Success', 'RFP Digitization & Batch Processing started successfully.', 'success');
                if (this.recordId) {
                    this.navigateToRFP(this.rfpRecordId); // Navigate after everything is done
                    this.closeQuickAction();
                } else {
                    // this.closeQuickAction();
                    this.navigateToRFP(this.rfpRecordId);
                    this.resetAndNavigate();
                }

                // this.navigateToRFP(this.rfpRecordId);
                //this.closeQuickAction();
            };

            reader.readAsArrayBuffer(this.file);
        } catch (error) {
            console.error('❌ Error processing DOCX:', error);
            this.toast('Error', 'Failed to process DOCX file.', 'error');
        } finally {
            this.showSpinner = false;
            this.isProcessing = false;
        }
    }

    startBatch(rfpId, chunks) {
        startBatchProcessing({ rfpId: rfpId, chunks: chunks })
            .then(result => {
                //console.log('Batch job initiated successfully: ' + JSON.stringify(result));
            })
            .catch(error => {
                console.error('Error starting batch job: ' + JSON.stringify(error));
                this.toast('Error', 'Failed to initiate batch process.', 'error');
            })
    }

    navigateToRFP(rfpId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: rfpId,
                objectApiName: 'RFP__c',
                actionName: 'view'
            }
        });
    }

    toast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant,
                mode: 'dismissable'
            })
        );
    }

    /*closeQuickAction() {
        if (this.isExcelMode) {
            this.fileName = null;
            this.file = null;
            this.isExcelMode = false;
            return;
        }
        this.dispatchEvent(new CloseActionScreenEvent());
    }*/
    closeQuickAction() {
        if (this.isExcelMode) {
            this.fileName = null;
            this.file = null;
            this.isExcelMode = false;
            return;
        }
        if (this.recordId) {
            this.dispatchEvent(new CloseActionScreenEvent());
        } else {
            this.fileName = null;
            this.file = null;
            this.isExcelMode = false;
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'RFP__c',
                    actionName: 'list'
                }
            });
            setTimeout(() => {
                window.location.reload();
            }, 200);
        }
    }

    showErrorMessage(title, messages) {
        this.errorTitle = title;
        this.errorMessages = Array.isArray(messages) ? messages : [messages];
        this.showErrorBanner = true;
    }

    clearErrorMessage() {
        this.errorTitle = '';
        this.errorMessages = [];
        this.showErrorBanner = false;
    }

    // --------------------------------------------------------------------------
    // ★★★ START OF PORTED UTILITY/CHUNKING LOGIC FROM THE FIRST BLOCK ★★★
    // --------------------------------------------------------------------------

    /**
     * Helper to convert number to lower-case Roman numerals.
     */
    toRoman(num) {
        if (typeof num !== 'number') return '';
        const map = {
            M: 1000, CM: 900, D: 500, CD: 400,
            C: 100, XC: 90, L: 50, XL: 40,
            X: 10, IX: 9, V: 5, IV: 4, I: 1
        };
        let result = '';
        let number = num;
        for (const i in map) {
            while (number >= map[i]) {
                result += i;
                number -= map[i];
            }
        }
        return result.toLowerCase();
    }

    /**
     * Helper to convert number to lower-case letters (a, b, c, aa, ab, ...)
     */
    toLetter(num) {
        if (typeof num !== 'number' || num < 1) return '';
        let res = '';
        let cur = num;
        while (cur > 0) {
            cur--;
            res = String.fromCharCode(97 + (cur % 26)) + res;
            cur = Math.floor(cur / 26);
        }
        return res;
    }

    /**
    * Builds a map of numId -> abstractNum definitions, including format and text pattern.
    */
    buildNumberingMapFromDom(numberingXmlDom) {
        const map = {};
        if (!numberingXmlDom) return map;

        const abstractMap = {};

        // Build abstract numbering (template)
        const abstractNums = numberingXmlDom.getElementsByTagName('w:abstractNum');
        for (const abs of Array.from(abstractNums)) {
            const absId = abs.getAttribute('w:abstractNumId');
            if (!absId) continue;

            const levelMap = {};
            const levels = abs.getElementsByTagName('w:lvl');
            for (const lvl of Array.from(levels)) {
                const ilvl = lvl.getAttribute('w:ilvl') || '0';
                const lvlText = lvl.getElementsByTagName('w:lvlText')[0];
                const numFmtElem = lvl.getElementsByTagName('w:numFmt')[0];
                const numFmt = numFmtElem ? numFmtElem.getAttribute('w:val') : 'decimal';

                levelMap[ilvl] = {
                    //textPattern: lvlText ? lvlText.getAttribute('w:val') : '%1.',
                    textPattern: lvlText ? lvlText.getAttribute('w:val') : `%${parseInt(ilvl) + 1}.`, //newly added
                    numFmt: numFmt
                };
            }
            abstractMap[absId] = levelMap;
        }

        // Build numId → abstractNum mapping
        const nums = numberingXmlDom.getElementsByTagName('w:num');
        for (const num of Array.from(nums)) {
            const numId = num.getAttribute('w:numId');
            const absElem = num.getElementsByTagName('w:abstractNumId')[0];
            const absId = absElem ? absElem.getAttribute('w:val') : null;
            if (numId && absId && abstractMap[absId]) {
                map[numId] = abstractMap[absId];
            }
        }

        return map;
    }

    /**
     * Extracts numbering IDs linked directly via paragraph styles in styles.xml.
     */
    buildStyleNumberingMap(stylesXmlDom) {
        const map = {};
        if (!stylesXmlDom) return map;

        const styles = stylesXmlDom.getElementsByTagName('w:style');
        for (const style of Array.from(styles)) {
            const styleId = style.getAttribute('w:styleId');
            const pPr = style.getElementsByTagName('w:pPr')[0];
            if (!pPr) continue;

            const numPr = pPr.getElementsByTagName('w:numPr')[0];
            if (numPr) {
                const numIdElem = numPr.getElementsByTagName('w:numId')[0];
                const numId = numIdElem ? numIdElem.getAttribute('w:val') : null;
                if (styleId && numId) {
                    map[styleId] = numId;
                }
            }
        }
        return map;
    }

    parseHeadingStyle(styleVal) {
        if (!styleVal) return null;
        const s = styleVal.trim();
        // Accept: "Heading1", "Heading 1", "heading2", "H2", "h 3", "Heading"
        const m1 = s.match(/^heading[\s_-]*?(\d+)$/i);
        if (m1) return { level: parseInt(m1[1], 10), style: s };
        const m2 = s.match(/^h(?:ead)?[\s]*?(\d+)$/i); // catches "H2" or "h 2"
        if (m2) return { level: parseInt(m2[1], 10), style: s };
        // Also accept exact "Heading" (no number) as level 1
        if (/^heading$/i.test(s)) return { level: 1, style: s };
        return null;
    }

    getAttr(elem, attrName) {
        return elem && elem.getAttribute ? elem.getAttribute(attrName) : null;
    }

    readRunsText(runs) {
        let text = '';
        for (const rElem of Array.from(runs)) {
            const tElems = rElem.getElementsByTagName && rElem.getElementsByTagName('w:t') || [];
            for (const t of Array.from(tElems)) {
                const xmlSpace = this.getAttr(t, 'xml:space');
                const txt = t.textContent || '';
                text += (xmlSpace === 'preserve') ? txt : txt.replace(/\s+/g, ' ');
            }
        }
        return text;
    }

    @track headings = [];
    /**
    * Extracts all paragraphs and tables from document.xml, applying numbering logic.
    */
    extractParagraphsFromDom(documentXmlDom, numberingMap, styleNumMap) {
        let textHeading = '';
        const paragraphs = [];
        const body = documentXmlDom.getElementsByTagName('w:body')[0];
        if (!body) return paragraphs;

        const children = Array.from(body.childNodes).filter(n => n.nodeType === 1);
        const listCounters = {};

        const allowedFormats = new Set([
            "decimal", "lowerRoman", "upperRoman", "lowerLetter", "upperLetter"
        ]);

        const formatNumber = (num, format) => {
            if (format === 'decimal') return num.toString();
            if (format === 'lowerRoman') return this.toRoman(num);
            if (format === 'upperRoman') return this.toRoman(num).toUpperCase();
            if (format === 'lowerLetter') return this.toLetter(num);
            if (format === 'upperLetter') return this.toLetter(num).toUpperCase();
            return num.toString();
        };

        for (const node of children) {
            // --- PARAGRAPH HANDLING ---
            if (node.nodeName === 'w:p') {
                let prefix = '';
                let numId = null;
                let ilvl = 0;
                // let numFmt = null; // not strictly needed outside the loop

                const pPr = node.getElementsByTagName('w:pPr')[0];
                if (pPr) {


                    let numPr = pPr.getElementsByTagName('w:numPr')[0];

                    if (numPr) {
                        const numIdElem = numPr.getElementsByTagName('w:numId')[0];
                        const ilvlElem = numPr.getElementsByTagName('w:ilvl')[0];

                        numId = numIdElem ? numIdElem.getAttribute("w:val") : null;
                        ilvl = ilvlElem ? parseInt(ilvlElem.getAttribute("w:val") || "0", 10) : 0;
                    } else {
                        // Check if numbering is defined via paragraph style
                        const pStyle = pPr.getElementsByTagName("w:pStyle")[0];
                        if (pStyle) {
                            const id = pStyle.getAttribute("w:val");
                            const heading = this.parseHeadingStyle(id);
                            if (heading) {
                                // Collect full paragraph text (all w:t inside the paragraph)
                                const runs = node.getElementsByTagName ? node.getElementsByTagName('w:r') : [];
                                textHeading = this.readRunsText(runs).replace(/\s+/g, ' ').trim();
                                this.headings.push(textHeading);
                            }
                            if (styleNumMap[id]) {
                                numId = styleNumMap[id];
                                ilvl = 0; // Assume top level for style-based list unless explicitly overridden
                            }
                        }
                    }

                    if (numId && numberingMap[numId] && numberingMap[numId][ilvl]) {
                        const { numFmt: fmt } = numberingMap[numId][ilvl];
                        // numFmt = fmt; // not strictly needed outside the loop

                        if (allowedFormats.has(fmt)) {
                            // 1. Ensure the list counter array exists before accessing it
                            if (!listCounters[numId]) {
                                listCounters[numId] = new Array(10).fill(0);
                            }

                            // 2. Increment the current level counter
                            listCounters[numId][ilvl] = (listCounters[numId][ilvl] || 0) + 1;

                            // 3. Reset counters for all deeper levels (levels > ilvl)
                            for (let resetLvl = ilvl + 1; resetLvl < 10; resetLvl++) {
                                listCounters[numId][resetLvl] = 0;
                            }

                            // 4. Form the dot-joined prefix
                            let parts = [];
                            // For simplicity and common use cases, we only construct the prefix up to the current level
                            for (let lvl = 0; lvl <= ilvl; lvl++) {
                                if (numberingMap[numId][lvl]) {
                                    // Use the specific format for the current level
                                    parts.push(formatNumber(listCounters[numId][lvl], numberingMap[numId][lvl].numFmt));
                                }
                            }

                            prefix = parts.join(".") + ". ";
                        }
                    }
                }

                const runs = node.getElementsByTagName("w:r");
                let text = "";
                for (const rElem of Array.from(runs)) {
                    const tElems = rElem.getElementsByTagName("w:t");
                    for (const t of Array.from(tElems)) text += t.textContent;
                }

                // Normalize whitespace and remove internal line breaks within a single paragraph.
                const normalizedText = text.trim().replace(/\s+/g, ' ');

                if (normalizedText || prefix) {
                    paragraphs.push({
                        type: "paragraph",
                        text: (prefix + normalizedText).trim() // Prefix is included here
                    });
                }
            }
            // --- TABLE HANDLING ---
            else if (node.nodeName === 'w:tbl') {
                const tableRows = Array.from(node.getElementsByTagName('w:tr'));
                const rowCount = tableRows.length;
                const colCount = tableRows[0] ? tableRows[0].getElementsByTagName('w:tc').length : 0;
                // Treat as a table only if it looks like a multi-cell structure
                const isRealTable = rowCount >= 3 && colCount >= 2;

                const tableData = tableRows.map(row => {
                    const cells = Array.from(row.getElementsByTagName('w:tc'));
                    return cells.map(cell => {
                        const cellText = Array.from(cell.getElementsByTagName('w:t'))
                            .map(t => t.textContent)
                            .join(' ');
                        return cellText.trim().replace(/\s+/g, ' '); // Normalize table cell text too
                    }).join(' | '); // Cells separated by |
                }).join('\n'); // Rows separated by \n

                if (tableData.trim()) {
                    paragraphs.push({
                        // Crucial: we explicitly mark it as 'table' here
                        type: isRealTable ? 'table' : 'paragraph',
                        text: tableData,
                        numId: null, // table properties are not used for flow control
                        ilvl: -1,
                        hasNumbering: false
                    });
                }
            }
        }

        return paragraphs;
    }


    /**
     * Universal chunking logic with FIXED answer detection
     * - Simple numbering: 1., 2., 3. → Each is a separate chunk (unless they're answers)
     * - Hierarchical: 2.1, 2.1.1, 2.1.2 → Each is a separate chunk
     * - Answer numbering: After Q2, seeing "1. 2. 3." means answers (stay with Q2)
     * Uses EXACT numbering from document, no modifications
     */
    smartChunkByQuestions(paragraphs) {
        console.log(this.headings);
        const semanticChunks = [];
        let currentChunk = null;

        let lastQuestionIndex = -1;
        let lastMajorQuestionNumber = 0;

        // Regex for hierarchical numbering (1.1, 1.1.1) - Major Split
        const HIER = /^(\d+(?:\.\d+)+)[\.\)]\s*/;
        // Regex for simple sequential numbering (1, 2, 3) - Potential Major Split
        const SIMPLE = /^(\d+)[\.\)]\s*/;
        // Regex for common bullet/subpoint styles - KEEP in current chunk
        const BULLET = /^[■•\-\*○●◆◇□▪▫]/;
        // Regex for letter/roman subpoints (a, b, i, ii) - KEEP in current chunk
        const SUBPOINT = /^([a-z]|[ivxlcdm]+)[\.\)]\s*/i;
        // Regex for Question Number followed by a sub-letter (e.g., 12.a.) - KEEP in current chunk, but update title
        const MAJOR_Q_SUB = /^(\d+)\.([a-z])[\.\)]\s*/i;

        // Regex to detect a section header that is also numbered (e.g., 10. Data Access) - Major Split
        const NUMBERED_HEADER_WITH_TEXT = /^(\d+)\.\s[A-Z][a-zA-Z\s&-:]+$/;


        const isAnswerList = (num, idx) => {
            if (lastQuestionIndex === -1) return false;

            // If current number is exactly one more than the last major question number, it's a new question.
            // Otherwise, if it's smaller, it's a sub-list *unless* it's the start of a completely new sequence (num === 1)
            // The purpose here is to prevent 1., 2., 3. in the *middle* of a long answer from creating a new chunk.
            if (num > lastMajorQuestionNumber || (num === 1 && lastMajorQuestionNumber > 1)) {
                return false; // This is a new question, not an answer list item
            }

            // If the number is smaller or equal (and not a reset to 1), it's likely part of a list *within* the answer.
            return true;
        };

        const flushCurrentChunk = (title, content, nextTitle) => {
            if (currentChunk) {
                const chunkToPush = {
                    // Prioritize a sub-question title if set
                    title: currentChunk.nextTitle || currentChunk.title,
                    content: currentChunk.content.trim()
                };
                semanticChunks.push(chunkToPush);
                //console.log(`[SEMANTIC CHUNK FLUSHED] Title: ${chunkToPush.title}. Content length: ${chunkToPush.content.length}`); 
            }
            // Start a new chunk immediately
            currentChunk = {
                // Use the detected number/header as the title, or a content snippet if no title found
                title: title || content.slice(0, 80),
                content: content,
                nextTitle: nextTitle
            };
        }


        // Build ***semantic chunks*** (Question → Answer/Paragraphs → Tables)
        for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            const raw = (p.text || '').trim();
            if (!raw && p.type !== 'table') continue;

            let isNewMajorQuestion = false;
            let title = null;
            let isSubQuestion = false;

            // Priority 1: Check for Hierarchical Header (1.1, 1.1.1)
            if (p.type !== 'table' && HIER.test(raw)) {
                const m = raw.match(HIER);
                title = m[1] + ".";
                isNewMajorQuestion = true;
            }
            // Priority 2: Check for Major Question + Sub-letter (e.g., 12.a.) - KEEP in chunk, set as nextTitle
            else if (p.type !== 'table' && MAJOR_Q_SUB.test(raw)) {
                isNewMajorQuestion = false;
                isSubQuestion = true;
            }
            // Priority 3: Check for Simple Sequential Numbered List item (1, 2, 3, 10, 13)
            else if (p.type !== 'table' && SIMPLE.test(raw)) {
                const m = raw.match(SIMPLE);
                const num = parseInt(m[1], 10);

                // Ignore if it looks like a lower-level list item (a., i., bullet)
                if (SUBPOINT.test(raw) || BULLET.test(raw)) {
                    isNewMajorQuestion = false;
                } else if (isAnswerList(num, i)) {
                    isNewMajorQuestion = false; // It's part of an internal answer list
                } else {
                    // Check if this number is logically a new major question (i.e., higher than the last one seen, or a reset to 1)
                    if (num > lastMajorQuestionNumber || (num === 1 && lastMajorQuestionNumber > 1)) {
                        // This is a new major question number
                        title = raw;
                        isNewMajorQuestion = true;
                        lastMajorQuestionNumber = num;
                    } else {
                        isNewMajorQuestion = false; // Treat as part of the current prose if not triggering a split
                    }
                }
            }
            // Priority 4: Check for Section Header with Numbering (e.g., 10. Data Access)
            else if (p.type !== 'table' && NUMBERED_HEADER_WITH_TEXT.test(raw)) {
                const m = raw.match(SIMPLE);
                const num = parseInt(m[1], 10);
                if (num > lastMajorQuestionNumber || (num === 1 && lastMajorQuestionNumber > 1)) {
                    title = raw; // Capture the entire header text as the title
                    isNewMajorQuestion = true;
                    lastMajorQuestionNumber = num;
                } else {
                    isNewMajorQuestion = false;
                }
            }
            else {
                // Any other text (prose, tables, un-numbered headers) continues the chunk
                isNewMajorQuestion = false;
            }


            let contentToAdd = raw;
            if (p.type === 'table') {
                // Replacing table content with the user-specified descriptor string.
                contentToAdd = "This question contains a table";
            }

            if (isNewMajorQuestion) {
                // Flush the old chunk and start a new one
                flushCurrentChunk(title, raw, null);

                lastQuestionIndex = i;
            }
            else {
                // Add to the current chunk
                if (!currentChunk) {
                    // Only start a "Preamble" if the content is substantial
                    if (raw.length > 50 || p.type === 'table') {
                        currentChunk = { title: "Preamble", content: contentToAdd, nextTitle: null };
                    }
                } else {
                    // Standard separation between paragraphs is two newlines
                    currentChunk.content += "\n\n" + contentToAdd;

                    // If we encounter a sub-question (e.g., 12.c.), update the potential next title for better chunk labeling
                    if (isSubQuestion) {
                        currentChunk.nextTitle = raw.match(/^(\d+\.[a-z]+)/i)?.[1] + ".";
                    }
                }
            }
        }

        // Add the very last chunk
        if (currentChunk) {
            const chunkToPush = {
                title: currentChunk.nextTitle || currentChunk.title,
                content: currentChunk.content.trim()
            };
            semanticChunks.push(chunkToPush);
            //console.log(`[SEMANTIC CHUNK FLUSHED] Title: ${chunkToPush.title}. Content length: ${chunkToPush.content.length}`); 
        }

        return semanticChunks;
    }
    // ------------------------------------------------------------
    // SIZE-BASED CHUNK MERGING
    // ------------------------------------------------------------
    mergeChunksBySize(semanticChunks) {
        if (!semanticChunks || semanticChunks.length === 0) return [];

        //console.log(`--- Starting Chunk Merging Process (Max Size: ${MAX_CHUNK_SIZE} chars) ---`);
        const mergedChunks = [];
        let i = 0;

        while (i < semanticChunks.length) {
            const initialChunk = semanticChunks[i];
            let mergedContent = initialChunk.content;
            let mergedTitle = initialChunk.title; // Corrected variable name access here (initialChunk.title)
            let j = i + 1; // Start looking at the next chunk

            // Try to merge consecutive chunks
            while (j < semanticChunks.length) {
                const nextChunk = semanticChunks[j];
                // Use triple newline separator to differentiate merged semantic units
                const contentToMerge = "\n\n\n" + nextChunk.content;

                // Calculate the potential new size
                const potentialSize = mergedContent.length + contentToMerge.length;

                if (potentialSize <= MAX_CHUNK_SIZE) {
                    // Merge if the size limit is not exceeded
                    mergedContent += contentToMerge;
                    // Keep the title of the first semantic chunk for the merged chunk
                    j++;
                } else {
                    // Stop merging if the next chunk is too large
                    break;
                }
            }

            // Finalize the merged chunk
            const chunkToPush = {
                title: mergedTitle,
                content: mergedContent
            };
            mergedChunks.push(chunkToPush);

            //console.log(`[MERGED CHUNK CREATED] Title: ${mergedTitle}. Final Size: ${mergedContent.length}. Merged ${j - i} semantic units.`);

            // Move the index 'i' past all the chunks that were just merged
            i = j;
        }

        //console.log(`--- Merging Complete. Total merged chunks: ${mergedChunks.length} ---`);
        return mergedChunks;
    }

    /**
     * Size-based chunking optimization:
     * - Split chunks larger than 4KB into smaller chunks
     * - Merge adjacent chunks smaller than 8KB to optimize size
     */
    /*applySizeBasedChunking(chunks) {
        const SPLIT_SIZE = 4 * 1024; // 4 KB
        const MERGE_SIZE = 8 * 1024; // 8 KB
        let processedChunks = [];
        let chunkId = 1;

        // Step 1: Split large chunks
        let splitChunks = [];
        for (const chunk of chunks) {
            // Using Blob for more accurate byte size calculation for large strings
            const contentSize = new Blob([chunk.content]).size;

            if (contentSize > SPLIT_SIZE) {
                // Split into smaller chunks
                const subChunks = this.splitLargeChunk(chunk, SPLIT_SIZE);
                splitChunks.push(...subChunks);
            } else {
                splitChunks.push(chunk);
            }
        }

        // Step 2: Merge small adjacent chunks
        let i = 0;
        while (i < splitChunks.length) {
            let currentChunk = splitChunks[i];
            let currentSize = new Blob([currentChunk.content]).size;

            // Try to merge with next chunks if under MERGE_SIZE
            while (i + 1 < splitChunks.length && currentSize < MERGE_SIZE) {
                const nextChunk = splitChunks[i + 1];
                const nextSize = new Blob([nextChunk.content]).size;

                if (currentSize + nextSize <= MERGE_SIZE) {
                    // Merge chunks
                    currentChunk = {
                        title: `${currentChunk.title} + ${nextChunk.title}`,
                        content: `${currentChunk.content}\n\n--- ${nextChunk.title} ---\n${nextChunk.content}`,
                        hasTable: currentChunk.hasTable || nextChunk.hasTable
                    };
                    currentSize += nextSize;
                    i++;
                } else {
                    break;
                }
            }

            processedChunks.push({
                id: chunkId++,
                title: currentChunk.title,
                content: currentChunk.content,
                hasTable: currentChunk.hasTable,
                size: currentSize
            });

            i++;
        }

        return processedChunks;
    }*/

    /**
     * Split a large chunk into smaller sub-chunks
     */
    /*splitLargeChunk(chunk, maxSize) {
        const subChunks = [];
        const paragraphs = chunk.content.split('\n\n');
        let currentSubChunk = '';
        let subIndex = 1;

        for (const para of paragraphs) {
            const testContent = currentSubChunk ? `${currentSubChunk}\n\n${para}` : para;
            const testSize = new Blob([testContent]).size;

            if (testSize > maxSize && currentSubChunk) {
                // Save current sub-chunk and start new one
                subChunks.push({
                    title: `${chunk.title} (Part ${subIndex})`,
                    content: currentSubChunk,
                    hasTable: chunk.hasTable
                });
                currentSubChunk = para;
                subIndex++;
            } else {
                currentSubChunk = testContent;
            }
        }

        // Add remaining content
        if (currentSubChunk) {
            subChunks.push({
                title: subChunks.length > 0 ? `${chunk.title} (Part ${subIndex})` : chunk.title,
                content: currentSubChunk,
                hasTable: chunk.hasTable
            });
        }

        return subChunks.length > 0 ? subChunks : [chunk];
    }*/
}