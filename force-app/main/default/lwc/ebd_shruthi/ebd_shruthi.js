import { LightningElement, api, wire } from 'lwc';
import getAccount from '@salesforce/apex/EBDDataController_shruthi.getAccount';
import saveEBDRecord from '@salesforce/apex/EBDDataController_shruthi.saveEBDRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EbdShruthi extends LightningElement {
    @api recordId; // Injected automatically
    account;
    isLoading = true;

    // Input fields
    briefDescription = '';
    relationshipHistory = '';

    // Fetch account data
    @wire(getAccount, { accountId: '$recordId' })
    wiredAccount({ error, data }) {
        if (data) {
            this.account = {
                ...data,
                formattedStartDate: this.formatDate(data.Current_Deal_Start_Date__c),
                formattedNextRenewalDate: this.formatDate(data.Current_Deal_Next_Renewal_Date__c)
            };
            this.isLoading = false;
        } else if (error) {
            this.account = undefined;
            this.isLoading = false;
            console.error(error);
        }
    }

    // Format date as MM/DD/YYYY
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    // Handle input change for "Brief Company Description"
    handleDescriptionChange(event) {
        this.briefDescription = event.target.value;
    }

    // Handle input change for "Relationship History and Current State"
    handleHistoryChange(event) {
        this.relationshipHistory = event.target.value;
    }

    // Save button click handler
    handleSave() {
        // Call the Apex method to save data
        saveEBDRecord({
            accountId: this.recordId,
            briefDescription: this.briefDescription,
            relationshipHistory: this.relationshipHistory
        })
        .then(() => {
            this.showToast('Success', 'Record has been saved successfully', 'success');
        })
        .catch(error => {
            this.showToast('Error', error.body ? error.body.message : 'Error saving record', 'error');
            console.error(error);
        });
    }

    // Utility to show toast messages
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}