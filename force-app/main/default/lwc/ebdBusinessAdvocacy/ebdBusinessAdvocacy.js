import { LightningElement,api,track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteBusinessRecord from '@salesforce/apex/EBDController.deleteBusinessRecord';
import deleteAdvocacyRecord from '@salesforce/apex/EBDController.deleteAdvocacyRecord';
export default class EbdBusinessAdvocacy extends LightningElement {
     @api isEditMode;
     @track keyIndex =0;
     @track showConfirmModalBusiness = false;
     @track showConfirmModalForAdvocay = false;
     @api businessData =[];
     @track businessDeleteIds=[];
     @api recordId;
     @api advocacyData =[];
     @track advocacyDeleteIds = [];
     @api ebdId;
    deleteAllBusinessRows(){
        this.showConfirmModalBusiness = true;
     }
    deleteAdvocacyRows(){
        this.showConfirmModalForAdvocay = true;
    }
    handleCancelDelete(){
        this.showConfirmModalBusiness = false;
        this.showConfirmModalForAdvocay = false;
    }
    handleChange(event) {
        let index = event.target.dataset.index;
        let fieldName = event.target.name;
        let value = event.target.value;
        let updatedBusinessList = [...this.businessData];
        updatedBusinessList[index] = { ...updatedBusinessList[index], [fieldName]: value };
        this.businessData = updatedBusinessList;
        this.dispatchChangeEvent();
        console.log('businessData after handlechange updated:', this.businessData);
    }
    
    handleChangeAdvocacy(event){
        const index = event.target.dataset.index;
        const fieldName = event.target.name;
        const value = event.target.value;
        let updatedAdvocacyList = [...this.advocacyData];
        updatedAdvocacyList[index] = { ...updatedAdvocacyList[index], [fieldName]: value };
        this.advocacyData = updatedAdvocacyList;
        this.dispatchChangeAdvocacyEvent();
    }

    addBusinessRow(event) {
        this.keyIndex++;
        const newRow = {
            Service_Solution__c: '',
            UHG_Business_Segment__c: '',
            UHG_Buyer_or_Decision_Make__c: ''
        };
        this.businessData = [...this.businessData, newRow];
        console.log('businessData after adding row in add row:', this.businessData);
        console.log('businessData after adding row: in add row with json', JSON.stringify(this.businessData));


        this.dispatchChangeEvent();
    }
    
    addAdvocacyRow(event) {
        this.keyIndex++;
        const newRow = {
            Service__c: '',
            Vendor_Model__c: '',
            Site_if_in_house__c: ''
        };
        this.advocacyData = [...this.advocacyData, newRow];
        this.dispatchChangeAdvocacyEvent();
    }

    removeBusinessRow(event) {
        let index = parseInt(event.target.dataset.index, 10);
        let updatedBusinessList = [...this.businessData];
        const record = updatedBusinessList[index];
        if (record && record.Id) {
            this.businessDeleteIds = [...this.businessDeleteIds, record.Id];
             }
        updatedBusinessList.splice(index, 1);
        this.businessData = updatedBusinessList;
        console.log('businessData after adding row in remove row:', this.businessDeleteIds);
        console.log('businessData after adding row: in remove row with json', JSON.stringify(this.businessDeleteIds));
        this.dispatchChangeEvent();
    }
    removeAdvocacyRow(event) {
        let index = parseInt(event.target.dataset.index,10);
        let updatedList =[...this.advocacyData];
        const record = updatedList[index];
        if (record && record.Id) {
            this.advocacyDeleteIds = [...this.advocacyDeleteIds, record.Id];
        }
        updatedList.splice(index, 1);
        this.advocacyData = updatedList;
        this.dispatchChangeAdvocacyEvent();
    }
     handleConfirmDeleteBusiness() {
            console.log('ebdId in delete:', JSON.stringify(this.ebdId));
            const ebdIdToPass =JSON.stringify(this.ebdId);
            console.log('ebdIdToPass in delete:', ebdIdToPass);
        deleteBusinessRecord({  ebdId: ebdIdToPass  })
            .then(() => {
               // this.businessData = [];
                this.businessData = [
                    {
                        Service_Solution__c: '',
                        UHG_Business_Segment__c: '',
                        UHG_Buyer_or_Decision_Make__c: '',
                        Revenue__c:''
                    }
                ];
                this.businessDeleteIds = [];
                this.dispatchChangeEvent(true);

                this.showToast('Success', 'All B2B data deleted.', 'success');
            })
            .catch(error => {
                console.error('Error deleting client priorities', error);
                this.showToast('Error', 'Failed to delete B2B  records.', 'error');
            })
            .finally(() => {
                this.showConfirmModalBusiness = false;
            });
    }
     handleConfirmDeleteAdvocacy() {
            console.log('ebdId in delete:', JSON.stringify(this.ebdId));
            const ebdIdToPass =JSON.stringify(this.ebdId);
            console.log('ebdIdToPass in delete:', ebdIdToPass);
        deleteAdvocacyRecord({  ebdId: ebdIdToPass  })
            .then(() => {
                //this.advocacyData = [];
                 this.advocacyData = [
                    {
                        Service__c: '',
                        Vendor_Model__c: '',
                        Site_if_in_house__c: ''
                    }
                ];
                this.advocacyDeleteIds = [];
                this.dispatchChangeAdvocacyEvent(true);

                this.showToast('Success', 'All Advocacy data deleted.', 'success');
            })
            .catch(error => {
                console.error('Error deleting Advocay data', error);
                this.showToast('Error', 'Failed to delete Advocacy  records.', 'error');
            })
            .finally(() => {
                this.showConfirmModalForAdvocay = false;
            });
    }
   
   /*dispatchChangeEvent(){
    this.dispatchEvent(new CustomEvent('ebdchange',{
        detail:{
            objectType: ['Business', 'Advocacy'],  
            data: [this.businessData, this.advocacyData],
            deleteIds: [this.businessDeleteIds, this.advocacyDeleteIds]
        }

    }));
    //console.log('Dispatched ebdchange event with businessData:', detail);
   }*/
  dispatchChangeAdvocacyEvent(isDeleted = false){
    this.dispatchEvent(new CustomEvent('ebdchange', {
            detail: {
                objectType: 'Advocacy',
                data: this.advocacyData,
                deleteIds: this.advocacyDeleteIds || [],
                refresh: isDeleted 
            }
        }));
        console.log('Dispatched ebdchange event with businessData:', JSON.stringify(this.businessData));
    }

  
   dispatchChangeEvent(isDeleted = false) {
        this.dispatchEvent(new CustomEvent('ebdchange', {
            detail: {
                objectType: 'Business',
                data: this.businessData,
                deleteIds: this.businessDeleteIds || [],
                refresh: isDeleted 
            }
        }));
        console.log('Dispatched ebdchange event with businessData:', JSON.stringify(this.businessData));
    }
   showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}