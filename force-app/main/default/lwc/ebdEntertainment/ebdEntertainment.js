import { LightningElement, track, api } from 'lwc';
import deleteEntertainmentRecord from '@salesforce/apex/EBDController.deleteEntertainmentRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EbdEntertainment extends LightningElement {
    @api isEditMode;
    @api entertainmentsData = [];
    @track entertainmentDeleteIds = [];
    @track showConfirmModalForEntertainment = false;
    @api ebdId;
    //tets
    
    deleteAllRows() {
        this.showConfirmModalForEntertainment = true;
    }
    
    handleCancelDelete() {
        this.showConfirmModalForEntertainment = false;
    }
    handleConfirmDelete() {
        console.log('ebdId in delete:', JSON.stringify(this.ebdId));
        const ebdIdToPass = JSON.stringify(this.ebdId);
        console.log('ebdIdToPass in delete:', ebdIdToPass);
        deleteEntertainmentRecord({ ebdId: ebdIdToPass })
            .then(() => {
                //this.entertainmentsData = [];
                this.entertainmentsData = [
                    {
                        Client_Representative_s__c: '',
                        Event__c: '',
                        Timing__c: '',
                        UHG_Representative_s__c: ''
                    }
                ];
                this.entertainmentDeleteIds = [];

                this.dispatchChangeEvent(true);
                this.showToast('Success', 'All entertainment data deleted.', 'success');
            })
            .catch(error => {
                console.error('Error deleting client priorities', error);
                this.showToast('Error', 'Failed to delete data.', 'error');
            })
            .finally(() => {
                this.showConfirmModalForEntertainment = false;
            });
    }
    /*this.keyIndex++;
        const newRow = {
            Name: '',
            UHG_Business_Segment__c: '',
            UHG_Buyer_or_Decision_Make__c: ''
        };
        this.businessData = [...this.businessData, newRow];
        console.log('businessData after adding row in add row:', this.businessData);
        console.log('businessData after adding row: in add row with json', JSON.stringify(this.businessData));


        this.dispatchChangeEvent();*/

    addEntertainmentRow(event) {
       // const currentIndex = parseInt(event.target.dataset.index); 
        this.keyIndex++;
        const newRow = {
            Client_Representative_s__c: '',
            Event__c: '',
            Timing__c: '',
            UHG_Representative_s__c: ''
        };
        this.entertainmentsData = [...this.entertainmentsData, newRow];
        //let updatedData = [...this.entertainmentsData];
        /*updatedData.splice(updatedData.length,  0, newRow);
                this.entertainmentsData = updatedData;
       // console.log('entertainmentsData before adding new row:', this.entertainmentsData);
        //this.entertainmentsData = [...this.entertainmentsData, newRow];
        
        //this.entertainmentsData = newRow;*/
        this.dispatchChangeEvent();
        console.log('entertainmentsData after adding new row:', this.entertainmentsData);

    }
    handleChange(event) {
        let index = event.target.dataset.index;
        let fieldName = event.target.name;
        let value = event.target.value;
        let updatedEntertainmentList = [...this.entertainmentsData];
        console.log('clientPriorityDetails before changing updated index handlechange updated:', this.clientPriorityDetails);
        /*
        updatedEntertainmentList[index] = { ...updatedEntertainmentList[index], [fieldName]: value };*/
        updatedEntertainmentList[index] = {
            ...this.entertainmentsData[index], // ensure you keep existing fields like Id
            [fieldName]: value
        };

        //console.log('clientPriorityDetails after handlechange updated:', this.updatedClientPriorityList);
        this.entertainmentsData = updatedEntertainmentList;
        console.log('updatedEntertainmentList after handlechange updated:', this.entertainmentsData);
        this.dispatchChangeEvent();
    }
    removeEntertainmentRow(event) {
        let index = parseInt(event.target.dataset.index, 10);
        // let recordId = this.clientPriorityDetails[index];
        console.log('index:', index);
        console.log('this.entertainmentsData in delete:', this.entertainmentsData);
        let updatedList = [...this.entertainmentsData];
        //const record = this.updatedList[index];
        const record = updatedList[index];
        // console.log('this.clientPriorityDetails[index]:', this.clientPriorityDetails[index]);
        console.log('record to be deleted:', JSON.stringify(record));
        if (record && record.Id) {
            this.entertainmentDeleteIds = [...this.entertainmentDeleteIds, record.Id];
            //this.deletedClientPriorityIds.push(record.Id);
        }
        //this.updatedList.splice(index, 1);
        updatedList.splice(index, 1);
        this.entertainmentsData = updatedList
        this.dispatchChangeEvent();
        console.log('Entertainment Ids to be deleted:', JSON.stringify(this.entertainmentDeleteIds));

    }
    dispatchChangeEvent(isDeleted = false) {
        this.dispatchEvent(new CustomEvent('ebdchange', {
            detail: {
                objectType: 'Entertainment',
                data: this.entertainmentsData,
                deleteIds: this.entertainmentDeleteIds || [],
                refresh: isDeleted 
            }
        }));
    }
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }


}