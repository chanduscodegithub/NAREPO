import { LightningElement, api } from 'lwc';
export default class StrategyMemoTimeline extends LightningElement {
    @api recordId;
    @api finalistDate;
    @api anticipatedActualCloseDate;
    @api effectiveDate;
    @api relatedOpportunitiesInfo = [];
    @api proposalDueDate;
    @api isEditMode;
    @api strategyMemo;
    @api formattedIntentToBidDue;
    @api formattedIntentToBidder;
    @api formattedIntentToQuestions;
    @api formattedIntentToQa;
    @api formattedIntentToNac;
    @api formattedIntentToNps;
    @api formattedIntentToExe;
    @api formattedIntentToEship;
    @api formattedIntentToImp;
    formatDateMMDDYYYY(dateStr) {
       if (!dateStr) return '';
        var offset = new Date().getTimezoneOffset();
        dateStr = new Date(new Date(dateStr).setUTCMinutes(offset));
        let date = new Date(dateStr);
        if (isNaN(date)) return '';
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let yyyy = date.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    }
    get formattedIntentToBidDue() {
        return this.formatDateMMDDYYYY(this.strategyMemo.Intent_to_Bid_Due__c);
    }
    get formattedIntentToBidder() {
        return this.formatDateMMDDYYYY(this.strategyMemo.Bidder_s_Conference_Call_Date__c);
    }
    get formattedIntentToQuestions() {
        return this.formatDateMMDDYYYY(this.strategyMemo.Questions_to_Consultant_Due__c);
    }
    get formattedIntentToQa() {
        return this.formatDateMMDDYYYY(this.strategyMemo.Q_A_Responses_Due_Back__c);
    }
    get formattedIntentToNac() {
        return this.formatDateMMDDYYYY(this.strategyMemo.NAC_Deliverables_Due_to_CD_Dir__c);
    }
    get formattedIntentToNps() {
        return this.formatDateMMDDYYYY(this.strategyMemo.All_Optum_Pricing_Due_to_NPS_and_Sales__c);
    }
    get formattedIntentToExe() {
        return this.formatDateMMDDYYYY(this.strategyMemo.Executive_Summary_Cover_Letter_Due__c);
    }
    get formattedIntentToEship() {
        return this.formatDateMMDDYYYY(this.strategyMemo.E_Ship_Date__c);
    }
    get formattedIntentToImp() {
        return this.formatDateMMDDYYYY(this.strategyMemo.Implementation_Kick_Off_Date__c);
    }
    
    handleChange(event) {
        let name = event.target.name;
        let value = event.target.value;
        this.dispatchEvent(new CustomEvent('strategymemochange', {
            detail: { fieldName: name, fieldValue: value }
        }));
    }


}