import { LightningElement,api,track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import DOC_ATTACHED_FIELD from '@salesforce/schema/Opportunity.Proactive_Renewal_Documents_Attached__c';
import ID_FIELD from '@salesforce/schema/Opportunity.Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FileUploadCustom extends NavigationMixin(LightningElement) {
    @api recordId;
    @track isFileUploaded;
    @track isLoaded = true;
    //uploadedInReadMode = false;
    linkPadding = 'slds-is-relative inReadMode'
    isEditMode;
    @api 
    get isEdit(){
        return this.isEditMode;        
    }
    set isEdit(val){
        this.isEditMode = val;
        if(val){
            this.linkPadding = 'slds-is-relative inEdit'
        }else{
            this.linkPadding = 'slds-is-relative inReadMode'
        }
    }

    @api
    get isFileAttached() {
        return this.isFileUploaded;
    }

    set isFileAttached(value) {
        this.isFileUploaded = value;              
    }

    handleUploadFinished(event) {
        this.isLoaded = false;
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[DOC_ATTACHED_FIELD.fieldApiName] = true;           
        const recordInput = { fields };      
        updateRecord(recordInput)
        .then(() => {
            this.isFileUploaded = true;
            this.isLoaded = true;
            //this.uploadedInReadMode = true;
        })
        .catch(error => {
            this.isLoaded = true;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating a record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    navigateToRelatedList(){      
        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Opportunity',
                relationshipApiName: 'CombinedAttachments',
                actionName: 'view'
            }
        });
    }
}