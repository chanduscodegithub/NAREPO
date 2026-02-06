import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
export default class RetentionChildCmp extends NavigationMixin(LightningElement) {

    @track eachValueChange;
    // @api eachdata;
      @track dataNotSent;
      @track isSplitExist;
      @track splitDoesNotExist;
      @track sceReceivingCompValues;
      @track addClass;
      @api 
      get eachdata(){
           return this.eachValueChange;
      
      }
      set eachdata(value){
         this.eachValueChange=value;
       
            if(this.eachValueChange.SalesSplitExist==='Yes'){
            this.addClass="slds-truncate colourtxt";
              this.sceReceivingCompValues=this.eachValueChange.Salesperson1+"  "+this.eachValueChange.Salesperson1Percent+"%, "+this.eachValueChange.Salesperson2+" "+this.eachValueChange.Salesperson2Percent+"%";
            }
            else if(this.eachValueChange.SalesSplitExist==='No' && this.eachValueChange.currentSCEId!==this.eachValueChange.salesUserId1 && this.eachValueChange.currentSCEId!==null && this.eachValueChange.salesUserId1!==null){
            //this.isSplitExist=true;
              //this.sceReceivingCompValues=this.eachValueChange.Salesperson1+"  "+this.eachValueChange.Salesperson1Percent+"%";
              if(this.eachValueChange.Salesperson1Percent && this.eachValueChange.Salesperson1){
                this.addClass="slds-truncate colourtxt";
                  this.sceReceivingCompValues=this.eachValueChange.Salesperson1+"  "+this.eachValueChange.Salesperson1Percent+"%";
              }else{
                this.addClass="slds-truncate boldtxt";
                  this.sceReceivingCompValues= 'Not Yet Sent to Incentive Comp Team';
              }
            }
           else{
          // this.isSplitExist=false;
           if(this.eachValueChange.SalesSplitExist==='No' && this.eachValueChange.currentSCEId===this.eachValueChange.salesUserId1 && this.eachValueChange.currentSCEId!==null && this.eachValueChange.salesUserId1!==null){
            this.addClass="slds-truncate";
            this.sceReceivingCompValues=this.eachValueChange.Salesperson1+"  "+this.eachValueChange.Salesperson1Percent+"%";
           }
           else{
            this.addClass="slds-truncate boldtxt";
              this.sceReceivingCompValues='Not Yet Sent to Incentive Comp Team';
           }
             }
            
      }
     connectedCallback() {
    
   // console.log(this.eachdata);
    let eachValueChange = {};
    eachValueChange = Object.assign({}, this.eachdata);
    this.eachValueChange = eachValueChange;
    if(this.eachValueChange.SalesSplitExist==='Yes'){
      this.addClass="slds-truncate colourtxt";
        this.sceReceivingCompValues=this.eachValueChange.Salesperson1+"  "+this.eachValueChange.Salesperson1Percent+"%, "+this.eachValueChange.Salesperson2+" "+this.eachValueChange.Salesperson2Percent+"%";
        }
        else if(this.eachValueChange.SalesSplitExist==='No' && this.eachValueChange.currentSCEId!==this.eachValueChange.salesUserId1 && this.eachValueChange.currentSCEId!==null && this.eachValueChange.salesUserId1!==null){
        //this.isSplitExist=true;
        //this.sceReceivingCompValues=this.eachValueChange.Salesperson1+"  "+this.eachValueChange.Salesperson1Percent+"%";
        if(this.eachValueChange.Salesperson1Percent && this.eachValueChange.Salesperson1){
          this.addClass="slds-truncate colourtxt";
            this.sceReceivingCompValues=this.eachValueChange.Salesperson1+"  "+this.eachValueChange.Salesperson1Percent+"%";
        }else{
          this.addClass="slds-truncate boldtxt";
            this.sceReceivingCompValues= 'Not Yet Sent to Incentive Comp Team';
        }
        }
       else{
      // this.isSplitExist=false;
       if(this.eachValueChange.SalesSplitExist==='No' && this.eachValueChange.currentSCEId===this.eachValueChange.salesUserId1 && this.eachValueChange.currentSCEId!==null && this.eachValueChange.salesUserId1!==null){
        this.addClass="slds-truncate";
        this.sceReceivingCompValues=this.eachValueChange.Salesperson1+"  "+this.eachValueChange.Salesperson1Percent+"%";
       }
       else{
        this.addClass="slds-truncate boldtxt";
          this.sceReceivingCompValues='Not Yet Sent to Incentive Comp Team';
       }
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

}