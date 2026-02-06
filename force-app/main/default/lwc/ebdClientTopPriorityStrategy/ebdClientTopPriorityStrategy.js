import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteClientPriorityRecord from '@salesforce/apex/EBDController.deleteClientPriorityRecord';
import deletePlanRecord from '@salesforce/apex/EBDController.deletePlanRecord';

export default class EbdClientTopPriorityStrategy extends LightningElement {
    @api isEditMode;
    @api clientPriorityDetails =[]; 
    @track deletedClientPriorityIds = [];
    @track showConfirmModalClient = false;
    @track showConfirmModalStrategy = false;
    @api ebdId;
    @api recordId;
    @api ebdListData;
    //tets
    deleteAllClientRows() {
        this.showConfirmModalClient = true;

    }
    deleteAllRows(){
        this.showConfirmModalStrategy =true;
    }
    handleCancelDelete() {
        this.showConfirmModalClient = false;
        this.showConfirmModalStrategy = false;
    }
    handleConfirmDelete() {
        console.log('ebdId in delete:', JSON.stringify(this.ebdId));
        const ebdIdToPass = JSON.stringify(this.ebdId);
        console.log('ebdIdToPass in delete:', ebdIdToPass);
        deleteClientPriorityRecord({ ebdId: ebdIdToPass })
            .then(() => {
                //this.clientPriorityDetails = [];
                 this.clientPriorityDetails = [
                    {
                        Client_Priority__c: '',
                        UHG_Strategy__c: ''
                    }
                ];
                this.deletedClientPriorityIds = [];
                this.dispatchChangeEvent(true);
                this.showToast('Success', 'All Client Priority data deleted.', 'success');
            })
            .catch(error => {
                console.error('Error deleting client priorities', error);
                this.showToast('Error', 'Failed to delete Client Priority records.', 'error');
            })
            .finally(() => {
                this.showConfirmModalClient = false;
            });
    }
    handleConfirmDeleteStrategy() {
        console.log('ebdId in delete:', JSON.stringify(this.ebdId));
        const ebdIdToPass = JSON.stringify(this.ebdId);
        console.log('ebdIdToPass in delete:', ebdIdToPass);
        deletePlanRecord({ ebdId: ebdIdToPass })
            .then(() => {
           // this.ebdListData = [];
           const clearedFields = {
                X5_Savings_Plan__c: '',
                X10_Savings_Plan__c: '',
                X20_Savings_Plan__c: ''
            };
            Object.keys(clearedFields).forEach(fieldName => {
                this.dispatchEvent(new CustomEvent('ebdchange', {
                    detail: {
                        fieldName: fieldName,
                        fieldValue: clearedFields[fieldName]
                    }
                }));
            });
            this.dispatchChangeEvent(true);
            this.showToast('Success', 'All strategy plan data deleted.', 'success');
            })
            .catch(error => {
                console.error('Error deleting  ', error);
                this.showToast('Error', 'Failed to delete   records.', 'error');
            })
            .finally(() => {
                this.showConfirmModalStrategy = false;
            });
    }

    addClientPriorityRow(event) {
        //const currentIndex = parseInt(event.target.dataset.index); 
        this.keyIndex++;
        const newRow = {
            Client_Priority__c: '',
            UHG_Strategy__c: ''
        };
       // this.clientPriorityDetails = [...this.clientPriorityDetails, newRow];
       /*let updatedClientData = [...this.clientPriorityDetails];
        updatedClientData.splice(updatedClientData.length,  0, newRow);
        this.clientPriorityDetails = updatedClientData;*/
        this.clientPriorityDetails = [...this.clientPriorityDetails, newRow];
        this.dispatchChangeEvent();

        console.log('entered here');
    }
    handleInputChange(event) {
        const name = event.target.name;
        let value;

        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        }
        else {
            value = event.target.value;
        }
        this.dispatchEvent(new CustomEvent('ebdchange', {
            detail: { fieldName: name, fieldValue: value }
        }));



    }
   
    handleChange(event) {
        let index = event.target.dataset.index;
        let fieldName = event.target.name;
        let value = event.target.value;
        let updatedClientPriorityList = [...this.clientPriorityDetails];
        console.log('clientPriorityDetails before changing updated index handlechange updated:', this.clientPriorityDetails);
        updatedClientPriorityList[index] = { ...this.clientPriorityDetails[index], [fieldName]: value };
        //console.log('clientPriorityDetails after handlechange updated:', this.updatedClientPriorityList);
        this.clientPriorityDetails = updatedClientPriorityList;
        console.log('clientPriorityDetails after handlechange updated:', this.clientPriorityDetails);
        this.dispatchChangeEvent();
    }
    removeClientPriorityRow(event) {
        let index = parseInt(event.target.dataset.index, 10);
        // let recordId = this.clientPriorityDetails[index];
        console.log('index:', index);
        console.log('this.clientPriorityDetails in delete:', this.clientPriorityDetails);
        let updatedList = [...this.clientPriorityDetails];
        //const record = this.updatedList[index];
        const record = updatedList[index];
        // console.log('this.clientPriorityDetails[index]:', this.clientPriorityDetails[index]);
        console.log('record to be deleted:', JSON.stringify(record));
        if (record && record.Id) {
            this.deletedClientPriorityIds = [...this.deletedClientPriorityIds, record.Id];
            //this.deletedClientPriorityIds.push(record.Id);
        }
        //this.updatedList.splice(index, 1);
        updatedList.splice(index, 1);
        this.clientPriorityDetails = updatedList
        this.dispatchChangeEvent();
        console.log('Entertainment Ids to be deleted:', JSON.stringify(this.deletedClientPriorityIds));

    }
    dispatchChangeEvent(isDeleted = false) {
        this.dispatchEvent(new CustomEvent('ebdchange', {
            detail: {
                objectType: 'ClientPriority',
                data: this.clientPriorityDetails,
                deleteIds: this.deletedClientPriorityIds || [],
                refresh: isDeleted 
            }
        }));
    }
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}