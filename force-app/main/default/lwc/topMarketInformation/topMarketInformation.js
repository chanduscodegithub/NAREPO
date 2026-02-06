import { LightningElement,api,wire,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class TopMarketInformation extends LightningElement {
    @api recordId;
    showEdit = false;
  
    existingRecords;
    

    @api enableEdit(){
        this.showEdit = true;
    }

    @api disableEdit(){
        this.showEdit = false;
    }

    handleOnSuccess(){
        this.dispatchEvent(new CustomEvent('recordupdateinfo' , { detail: 'topMarketInfo'}));
    }

    onSubmitHandler(event){
        event.preventDefault();
        let isChanged = false;
        const fields = event.detail.fields;
        
        if(this.existingRecords.TopMarket1__c.value != fields.TopMarket1__c
        || this.existingRecords.TopMarket2__c.value != fields.TopMarket2__c
        || this.existingRecords.TopMarket3__c.value != fields.TopMarket3__c
        || this.existingRecords.TopMarket4__c.value != fields.TopMarket4__c
        || this.existingRecords.TopMarket5__c.value != fields.TopMarket5__c
        || this.existingRecords.TopMarket1Records__c.value != fields.TopMarket1Records__c
        || this.existingRecords.TopMarket2Records__c.value != fields.TopMarket2Records__c
        || this.existingRecords.TopMarket3Records__c.value != fields.TopMarket3Records__c
        || this.existingRecords.TopMarket4Records__c.value != fields.TopMarket4Records__c
        || this.existingRecords.TopMarket5Records__c.value != fields.TopMarket5Records__c
        ){
            isChanged = true;
        }
        
        if(isChanged){
            var newDate = new Date();      
            fields.Bic_and_Top_Market_Last_Modified_Date__c	= newDate.getFullYear()+'-'+(parseInt(newDate.getMonth())+1)+'-'+newDate.getDate();
            this.template.querySelector('lightning-record-edit-form').submit(fields);
        }else{
            this.handleOnSuccess();
        }
        
    }

    handleOnLoad(event) {
        const record = event.detail.records;
        this.existingRecords = record[this.recordId].fields;
        console.log(this.existingRecords)
    }

    

    handleError(event){
        console.log(event.detail)
        console.log(event.detail.message);
        console.log(event);
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error creating record',
                message: event.detail.message,
                variant: 'error',
            }),
        );
    }
 
   
    @api initiateSubmit(){
        const btn = this.template.querySelector('.submitbutton');
        btn.click();
    }

}