import { LightningElement, api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import reprocessChunks from '@salesforce/apex/OpenAIBatchReprocessor.reprocessFailedChunks';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ReprocessFailedChunks extends LightningElement {
    @api recordId; // RFP__c Id
    showModal = true;

    closeModal() {
        this.showModal = false;
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    handleReprocess() {
        reprocessChunks({ rfpId: this.recordId })
            .then(() => {
                this.showModal = false;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Reprocessing Started',
                    message: 'The failed chunks are being reprocessed. You will be notified by email once done.',
                    variant: 'success'
                }));
                 this.dispatchEvent(new CloseActionScreenEvent());
            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: 'Something went wrong while reprocessing chunks.',
                    variant: 'error'
                }));
            });
    }
}