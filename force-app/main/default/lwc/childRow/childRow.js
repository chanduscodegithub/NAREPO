/* eslint-disable no-console */
import { LightningElement, api, track} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class ChildRow extends NavigationMixin(LightningElement) {


  @track eachValueChange;
  @api issbsceuser;
  @track dataNotSent;
  @track dataNotExtracted;
  @track saleSplitExist;
  @api 
  get eachdata(){
       return this.eachValueChange;
  
  }
  set eachdata(value){
     this.eachValueChange=value;
     if(this.eachValueChange.ReadyToSendDate==="Not Sent - Action Needed")
     {
      this.dataNotSent=true;
     }
     else{
       this.dataNotSent=false;
     }
     if(this.eachValueChange.SalesSplitExist==="Yes")
     {
      this.saleSplitExist=true;
     }
     else{
       this.saleSplitExist=false;
     }
     if(this.eachValueChange.ReadyToExtractDate==="Not Yet Extracted"){
       if(this.eachValueChange.HighLightExtractedDate==='Yes'){
        this.dataNotExtracted=true;
       }
       else if(this.eachValueChange.HighLightExtractedDate==='No'){
        this.dataNotExtracted=false;
       }
       
     }
     else{
      this.dataNotExtracted=false;
    }
    


  }
 connectedCallback() {
let eachValueChange = {};
eachValueChange = Object.assign({}, this.eachdata);
this.eachValueChange = eachValueChange;
   //console.log('in child row');
   //console.log(eachValueChange.ReadyToSendDate);
       if(eachValueChange.ReadyToSendDate==="Not Sent - Action Needed")
       {
        this.dataNotSent=true;
       }
       else{
         this.dataNotSent=false;
       }
       if(this.eachValueChange.SalesSplitExist==="Yes")
     {
      this.saleSplitExist=true;
     }
     else{
       this.saleSplitExist=false;
     }
       if(eachValueChange.ReadyToExtractDate==="Not Yet Extracted"){
        
          if(this.eachValueChange.HighLightExtractedDate==='Yes'){
           this.dataNotExtracted=true;
          }
          else if(this.eachValueChange.HighLightExtractedDate==='No'){
            this.dataNotExtracted=false;
           }
        
       }
       else{
         this.dataNotExtracted=false;
       }
       if(this.issbsceuser){
        this.issbsceuser = true;
    }
 }

 goToRecordPage() {
  // Navigate to Renewal_Status__c record page
  this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
          recordId:this.eachdata.renewalId,
          objectApiName: 'Renewal_Status__c',
          actionName: 'view', 
      
      },
  });
  
}





 /* @track dataSent;
  @track exctractDateValue;
  @track ShowDate=true;
  @track extractDate=true;
  connectedCallback() {
    //console.log(eachdata);
       // eslint-disable-next-line no-undef
       if(eachdata.Date_Submitted_For_Incentives__c==='' || eachdata.Date_Submitted_For_Incentives__c===null || eachdata.Date_Submitted_For_Incentives__c===undefined){
          this.dataSent="Not Sent";
          this.ShowDate=false;  
       }
       // eslint-disable-next-line no-undef
       if(eachdata.Date_sent_to_ISI_Site__c==='' || eachdata.Date_sent_to_ISI_Site__c===null || eachdata.Date_sent_to_ISI_Site__c===undefined){
       this.exctractDateValue="Not Extracted";
       this.extractDate=false;
      }

  }*/
}