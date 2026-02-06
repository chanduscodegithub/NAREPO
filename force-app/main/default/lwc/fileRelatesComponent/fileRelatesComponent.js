import { LightningElement, api, wire } from 'lwc';
import fileRecords from '@salesforce/apex/SharePointIntegration.fileRecords';

export default class FileRelatesComponent extends LightningElement {
    @api recordId;
    files;
    fileRecordsList;
    isLoading = false;  

    get acceptedFormats() {
        return ['.pdf', '.png', '.txt', '.xlsx'];
    }

    get viewAllLink() {
        return `/lightning/r/${this.recordId}/related/ContentDocumentLink/view`;
    }

    connectedCallback() {
        this.loadFileRecords();
    }

    loadFileRecords() {
        this.isLoading = true; 

        fileRecords({ recordId: this.recordId })
            .then(result => {
                this.fileRecordsList = result.map(file => ({
                    ...file,
                    formattedDate: this.formatDate(file.CreatedDate)
                }));
                console.log('Loaded file records:', this.fileRecordsList);
                this.isLoading = false; 
            })
            .catch(error => {
                this.isLoading = false; 
                console.error('Error loading file records:', error);
            });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        console.log('Files uploaded successfully:', uploadedFiles);

        this.isLoading = true;

        this.loadFileRecords(); 
    }
}