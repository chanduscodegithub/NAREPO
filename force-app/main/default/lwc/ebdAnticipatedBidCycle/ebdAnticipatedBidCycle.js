import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteAnticipatedRecord from '@salesforce/apex/EBDController.deleteAnticipatedRecord';
import deleteAdditionalComments from '@salesforce/apex/EBDController.deleteAdditionalComments';
import getStatusOptions from '@salesforce/apex/EBDController.getStatusOptions';


const FIXED_PRODUCTS = [
    'Medical',
    'Pharmacy',
    'Dental',
    'Vision',
    'Financial Products'
];
export default class EbdAnticipatedBidCycle extends LightningElement {
    @api isEditMode;
    @track keyIndex = 0;
    @api ebdId;
    @api recordId;
    // @api anticipatedDetailsData = [];
    @track anticipatedDeleteIds = [];
    @track showConfirmModalAnticipated = false;
    @api ebdListData;
    @api incumbentMedical;
    @api incumbentPharmacy;
    @api incumbentDental;
    @api incumbentVision;
    @track isFixed = false;
    @track internalData = [];
    //_anticipatedDetailsData = [];
    @api
    get anticipatedDetailsData() {
        return this.internalData;
    }
    set anticipatedDetailsData(value) {
        if (value) {
            this.internalData =value;
            // make deep copy
            let tempData = value.map((rec, index) => ({
                ...rec,
                //id: rec.id || index,
                isFixed: ['Medical','Dental','Vision','Pharmacy'].includes(rec.Product__c),
                //index < 4 
            }));

            // if (tempData.length >= 4) {
            //     tempData[0].Product__c = 'Medical';
            //     tempData[0].Incumbent__c = this.incumbentMedical || '';

            //     tempData[1].Product__c = 'Pharmacy';
            //     tempData[1].Incumbent__c = this.incumbentPharmacy || '';

            //     tempData[2].Product__c = 'Dental';
            //     tempData[2].Incumbent__c = this.incumbentDental || '';

            //     tempData[3].Product__c = 'Vision';
            //     tempData[3].Incumbent__c = this.incumbentVision || '';
            // }

            this.internalData = tempData;
        }
    }


    @wire(getStatusOptions)
    wiredOptions({ data, error }) {
        if (data) {
            let mappedOptions = data.map(option => ({ label: option, value: option }));
            mappedOptions.unshift({ label: '--None--', value: '' });
            this.options = mappedOptions;
            // this.options = data.map(option => ({ label: option, value: option }));
        } else if (error) {
            console.error('Error fetching picklist options:', error);
        }
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
            //detail : {fieldName: name, fieldValue: value}
            /*detail: {
               ...this.ebdListData,
               Additional_Comments__c: ''
           }*/

            detail: { fieldName: name, fieldValue: value }
        }));


    }
    deleteAllAnticipatedRows() {
        this.showConfirmModalAnticipated = true;
    }
    handleCancelDelete() {
        this.showConfirmModalAnticipated = false;
    }
    handleConfirmDeleteAnticipated() {
        console.log('ebdId in delete:', JSON.stringify(this.ebdId));
        const ebdIdToPass = JSON.stringify(this.ebdId);
        console.log('ebdIdToPass in delete:', ebdIdToPass);
        deleteAnticipatedRecord({ ebdId: ebdIdToPass })
            .then(() => {
                //this.internalData = [];
               this.internalData=[
                { Product__c: 'Medical', Incumbent__c:this.incumbentMedical, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Pharmacy', Incumbent__c:this.incumbentPharmacy, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Dental', Incumbent__c:this.incumbentDental, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Vision', Incumbent__c:this.incumbentVision, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Financial Products', Incumbent__c: '', Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true }
                
               ];
                this.anticipatedDeleteIds = [];
                 setTimeout(() => {
                    this.dispatchChangeEvent(true);
                }, 2000);
                this.showToast('Success', 'All Anticipated data deleted.', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'Failed to delete  Anticipated data.', 'error');
            })
            .finally(() => {
                this.showConfirmModalAnticipated = false;
            });



    }

    handleConfirmComments() {
        const ebdIdToPass = JSON.stringify(this.ebdId);
        deleteAdditionalComments({ ebdId: ebdIdToPass })
            .then(() => {
                /* this.ebdListData = JSON.parse(JSON.stringify({
                   ...this.ebdListData,
                   Additional_Comments__c: ''
               }));*/
                //this.ebdListData.Additional_Comments__c='';
                this.dispatchEvent(new CustomEvent('ebdchange', {
                    detail: {
                        fieldName: 'Additional_Comments__c',
                        fieldValue: ''
                    }
                }));


                // this.dispatchChangeEvent();
                this.showToast('Success', 'Comments deleted.', 'success');
            })
            .catch(error => {
                console.error('Error deleting  ', error);
                this.showToast('Error', 'Failed to delete.', 'error');
            })
            .finally(() => {
                this.showConfirmModalAnticipated = false;
            });

    }
    // handleChange(event) {
    //     const index = event.target.dataset.index;
    //     const fieldName = event.target.name;
    //     const value = event.target.value;

    //     let updatedAnticipatedList = [...this.anticipatedDetailsData];
    //     updatedAnticipatedList[index] = { ...updatedAnticipatedList[index], [fieldName]: value };

    //     this.anticipatedDetailsData = updatedAnticipatedList;

    //     this.dispatchChangeEvent();
    // }
    handleChange(event) {
        const index = parseInt(event.target.dataset.index, 10); // row index
        const fieldName = event.target.name;                     // field being edited
        const value = event.target.value;                        // new value

        // Do not allow editing of first 4 fixed rows for Product__c / Incumbent__c
        if (this.internalData[index].isFixed && (fieldName === 'Product__c' || fieldName === 'Incumbent__c')) {
            return;
        }

        // Update internal copy for the edited field
        this.internalData[index] = {
            ...this.internalData[index],
            [fieldName]: value
        };
        this.dispatchChangeEvent();

    }

    addAnticipatedRow(event) {
        const newRow = {
            Product__c: '',
            Incumbent__c: '',
            Deal_Cycle__c: '',
            Red_Yellow_Green__c: '',
            isFixed: false

        };
        this.internalData = [...this.internalData, newRow];
        //this.dispatchChangeEvent();
    }
    // removeAnticipatedRow(event) {
    //     let index = parseInt(event.target.dataset.index, 10);
    //     let updatedAnticpatedDelete = [...this.anticipatedDetailsData];
    //     const record = updatedAnticpatedDelete[index];
    //     if (record && record.Id) {
    //         this.anticipatedDeleteIds = [...this.anticipatedDeleteIds, record.Id];
    //     }
    //     updatedAnticpatedDelete.splice(index, 1);
    //     this.anticipatedDetailsData = updatedAnticpatedDelete;
    //     console.log('anticipatedDetailsData after adding row in remove row:', this.anticipatedDeleteIds);
    //     console.log('anticipatedDetailsData after adding row: in remove row with json', JSON.stringify(this.anticipatedDeleteIds));

    //     this.dispatchChangeEvent();
    // }
    removeAnticipatedRow(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const record = this.internalData[index];
        if (record && record.Id) {
            this.anticipatedDeleteIds = [...this.anticipatedDeleteIds, record.Id];
        }
        this.internalData.splice(index, 1);
        this.internalData = [...this.internalData];
        this.dispatchChangeEvent();
    }
    syncDataBeforeSave() {
    const inputs = [...this.template.querySelectorAll('lightning-input, lightning-combobox')];
    inputs.forEach(input => {
        const index = input.dataset.index;
        const fieldName = input.name;
        if (index !== undefined && fieldName) {
            this.internalData[index][fieldName] = input.type === 'checkbox'
                ? input.checked
                : input.value;
        }
    });
}


    dispatchChangeEvent(isDeleted = false) {
        console.log('DISPATCHING from child:', JSON.stringify(this.anticipatedDetailsData));
         //this.syncDataBeforeSave(); 
         this.dispatchEvent(new CustomEvent('ebdchange', {
            detail: {
                objectType: 'Anticipated',
                data:[...this.internalData] ,
                deleteIds: this.anticipatedDeleteIds || [],
                refresh: isDeleted
            }
        }));
    }
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}