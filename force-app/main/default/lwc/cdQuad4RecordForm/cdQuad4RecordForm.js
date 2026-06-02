import { LightningElement, api,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import { getRecord,getFieldValue  } from 'lightning/uiRecordApi';
import ACCOUNT_NAME from '@salesforce/schema/Contact.Account.Name';


const FIELDS = [ACCOUNT_NAME];


export default class cdQuad4RecordForm  extends LightningElement {
    @api recordId;
     isLoading = true; 
 
    handleSubmit() {
        this.isLoading = true;
    }
    handleSuccess() {
        this.isLoading = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Contact updated successfully',
                variant: 'success'
            })
        );
        this.dispatchEvent(new CustomEvent('myevent'));
    }

    handleError(event) {
        console.error(event.detail);
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Error updating record',
                variant: 'error'
            })
        );

    }
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredContact({ data, error }) {
        if (data || error) {
            // 
            this.contactRecord = data;
            this.isLoading = false;
        //     setTimeout(() => {
         this.isLoading = false;
        // }, 1000);
        }
    }
    
    get accountName() {
        return getFieldValue(this.contactRecord, ACCOUNT_NAME);
    }

    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}