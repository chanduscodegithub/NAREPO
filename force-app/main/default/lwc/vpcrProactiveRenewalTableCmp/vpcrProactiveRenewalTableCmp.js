import { LightningElement,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class VpcrProactiveRenewalTableCmp extends NavigationMixin(LightningElement) {

    proactiveRenewalRec;
    onLoad=true;
    @api loggedInUserTimeZone;
    addClass;
    scesReceivingCompensation='';
    hasRetenionPercentage=false;

    @api
    get proactiveRenewalData() {

        return this.proactiveRenewalRec;
    }
    set proactiveRenewalData(value) {
        this.proactiveRenewalRec = value;
        if (!this.onLoad) {
            this.setProactiveRenewalData();
        }
        
    }

    setProactiveRenewalData(){
      this.scesReceivingCompensation='';
      this.hasRetenionPercentage=false;
        if(this.proactiveRenewalRec.hasOwnProperty('proactiveRenewalStatus')
        && !this.isBlank(this.proactiveRenewalRec.proactiveRenewalStatus)){

        if(this.proactiveRenewalRec.proactiveRenewalStatus.indexOf('Pending Qualification')!== -1){
          this.addClass='slds-truncate boldtxt';
          this.scesReceivingCompensation='Pending Qualification';
        }else if(this.proactiveRenewalRec.proactiveRenewalStatus.indexOf('Fully Validated')!== -1){
          this.scesReceivingCompensation=this.proactiveRenewalRec.opportunityOwnerName;
          if(this.proactiveRenewalRec.hasOwnProperty('opportunityOwnerId') && !this.isBlank(this.proactiveRenewalRec.opportunityOwnerId)
            && this.proactiveRenewalRec.hasOwnProperty('accountOwnerId') && !this.isBlank(this.proactiveRenewalRec.accountOwnerId)
            && this.proactiveRenewalRec.opportunityOwnerId!== this.proactiveRenewalRec.accountOwnerId){
            this.addClass='slds-truncate colourtxt';
          }else{
            this.addClass='';
          }
          
        }
      }else{
        this.addClass='';
      }
      if(this.proactiveRenewalRec.hasOwnProperty('retentionPercentage')
        && !this.isBlank(this.proactiveRenewalRec.retentionPercentage)){
          this.hasRetenionPercentage=true;
        }
    }

    connectedCallback() {
      this.scesReceivingCompensation='';
      this.hasRetenionPercentage=false;
        if(this.proactiveRenewalRec.hasOwnProperty('proactiveRenewalStatus')
        && !this.isBlank(this.proactiveRenewalRec.proactiveRenewalStatus)){

        if(this.proactiveRenewalRec.proactiveRenewalStatus.indexOf('Pending Qualification')!== -1){
          this.addClass='slds-truncate boldtxt';
          this.scesReceivingCompensation='Pending Qualification';
        }else if(this.proactiveRenewalRec.proactiveRenewalStatus.indexOf('Fully Validated')!== -1){
          this.scesReceivingCompensation=this.proactiveRenewalRec.opportunityOwnerName;
          if(this.proactiveRenewalRec.hasOwnProperty('opportunityOwnerId') && !this.isBlank(this.proactiveRenewalRec.opportunityOwnerId)
            && this.proactiveRenewalRec.hasOwnProperty('accountOwnerId') && !this.isBlank(this.proactiveRenewalRec.accountOwnerId)
            && this.proactiveRenewalRec.opportunityOwnerId!== this.proactiveRenewalRec.accountOwnerId){
            this.addClass='slds-truncate colourtxt';
          }else{
            this.addClass='';
          }
          
        }
      }else{
        this.addClass='';
      }

      if(this.proactiveRenewalRec.hasOwnProperty('retentionPercentage')
        && !this.isBlank(this.proactiveRenewalRec.retentionPercentage)){
          this.hasRetenionPercentage=true;
        }
    }

    handleOpportunityRecordView(event){
        console.log('oppId==>'+event.target.value);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId:this.proactiveRenewalRec.Id,
                objectApiName:'Opportunity',
                actionName:'view'
            
            }
        });
    }

    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }


}