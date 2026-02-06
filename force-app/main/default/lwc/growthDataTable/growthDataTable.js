import { LightningElement,track,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class GrowthDataTable extends NavigationMixin(LightningElement) {

    @track growthRec;
    @track isNonOtherByUpProduct;
    @track onLoad=false;
    @track hasRecSubmittedToICTeam;
    @track hasRecExtractedByICTeam;
    @api loggedInUserTimeZone;
    @api loggedInUserRole;
    @api loggedInUserId;
    @track isLoggedInUserRoleCMVPCRRVP=false;
    @track isLoggedInUserRoleCMSCEOrCDSVP=false;
    @track isLoggedInUserRoleSpecialitySVP=false;
    @track addClass;
    @track addClass1;
    @track isSpecialitySVPAnOpportunityOwner=false;
    @track icDataExtractedStatusStyle;
    @track salesIncentivesBeSplitStyle;
    @track scesReceivingCompensation;
    

    @api
    get growthData() {

        return this.growthRec;
    }
    set growthData(value) {
        if (!this.onLoad) {
            this.setGrowthData(value);
        }
        else {
            this.goalRec = value;
        }
        

    }

    setGrowthData(value){
        let growthRec = {};
        let scesReceivingCompensation='';
        this.growthRec = value;
        growthRec = Object.assign({}, this.growthRec);
        if(growthRec.hasOwnProperty('productName')
             && !this.isBlank(growthRec.productName) ){
            if(growthRec.productName==='Total'){
                this.isNonOtherByUpProduct=true;
            }else{
                this.isNonOtherByUpProduct=false;
            }
            
        }
        if(growthRec.hasOwnProperty('dateSentToIncentiveCompTeam')
             && !this.isBlank(growthRec.dateSentToIncentiveCompTeam) ){
              
            this.hasRecSubmittedToICTeam=true;
        }else{
            this.hasRecSubmittedToICTeam=false;
        }
        if(growthRec.hasOwnProperty('dateIncentiveCompTeamExtractedData')
             && !this.isBlank(growthRec.dateIncentiveCompTeamExtractedData) ){
              
            this.hasRecExtractedByICTeam=true;
        }else{
            this.hasRecExtractedByICTeam=false;
            if(growthRec.hasOwnProperty('effectiveDate') && !this.isBlank(growthRec.effectiveDate)
                && this.highlightICDataExtractedStatus(growthRec.effectiveDate)
                && growthRec.hasOwnProperty('dateSentToIncentiveCompTeam')
                && !this.isBlank(growthRec.dateSentToIncentiveCompTeam)){
                    this.icDataExtractedStatusStyle="slds-cell-wrap colourtxt";
            }else{
                this.icDataExtractedStatusStyle="slds-cell-wrap";
            }
        }
        if(growthRec.hasOwnProperty('willSalesIncentivesBeSplit')
        && !this.isBlank(growthRec.willSalesIncentivesBeSplit) && growthRec.willSalesIncentivesBeSplit==='Yes'){
            this.salesIncentivesBeSplitStyle="slds-cell-wrap colourtxt";
        }else{
            this.salesIncentivesBeSplitStyle="slds-cell-wrap";
        }
        if(this.isLoggedInUserRoleCMVPCRRVP)
        {
            
            if(growthRec.hasOwnProperty('salesPerson2Name')
            && !this.isBlank(growthRec.salesPerson2Name)){
                this.addClass="slds-cell-wrap colourtxt";
                this.addClass1="slds-cell-wrap colourtxt";
            }else if(growthRec.hasOwnProperty('salesPerson1Id')
            && !this.isBlank(growthRec.salesPerson1Id) && growthRec.hasOwnProperty('accountOwnerId')
            && !this.isBlank(growthRec.accountOwnerId) && growthRec.salesPerson1Id!==growthRec.accountOwnerId){
                this.addClass="slds-cell-wrap colourtxt";
                this.addClass1="slds-cell-wrap";
            }else{
                this.addClass="slds-cell-wrap";
                this.addClass1="slds-cell-wrap";
            }
            if(!growthRec.hasOwnProperty('salesPerson1Name') || this.isBlank(growthRec.salesPerson1Name)){
                scesReceivingCompensation='Not Yet Sent to Incentive Comp Team';
                this.addClass="slds-cell-wrap colourtxt";
            }else{
            if(growthRec.hasOwnProperty('salesPerson1Name') && !this.isBlank(growthRec.salesPerson1Name)){
                scesReceivingCompensation+=growthRec.salesPerson1Name;
            }
            if(growthRec.hasOwnProperty('salesPerson1SplitPercentage') && !this.isBlank(growthRec.salesPerson1SplitPercentage)){
                scesReceivingCompensation+=' '+growthRec.salesPerson1SplitPercentage+'%';
            }
            if(growthRec.hasOwnProperty('salesPerson2Name') && !this.isBlank(growthRec.salesPerson2Name)){
                scesReceivingCompensation+=', '+growthRec.salesPerson2Name;
            }
            if(growthRec.hasOwnProperty('salesPerson2SplitPercentage') && !this.isBlank(growthRec.salesPerson2SplitPercentage)){
                scesReceivingCompensation+=' '+growthRec.salesPerson2SplitPercentage+'%';
            }
        }
            this.scesReceivingCompensation=scesReceivingCompensation;
        }
        if(this.isLoggedInUserRoleSpecialitySVP){
            
            if(growthRec.hasOwnProperty('opportunityOwnerId') && !this.isBlank(this.loggedInUserId) 
                && !this.isBlank(growthRec.opportunityOwnerId) && growthRec.opportunityOwnerId===this.loggedInUserId){
                this.isSpecialitySVPAnOpportunityOwner=true;
            }else{
                this.isSpecialitySVPAnOpportunityOwner=false;
            }
        }

    }

    connectedCallback() {
        let growthRec = {};
        let scesReceivingCompensation='';
        growthRec = Object.assign({}, this.growthData);
        this.growthRec = growthRec;
        

        if(growthRec.hasOwnProperty('productName')
             && !this.isBlank(growthRec.productName) ){
            if(growthRec.productName==='Total'){
                this.isNonOtherByUpProduct=true;
            }else{
                this.isNonOtherByUpProduct=false;
            }
            
        }
        if(growthRec.hasOwnProperty('dateSentToIncentiveCompTeam')
             && !this.isBlank(growthRec.dateSentToIncentiveCompTeam) ){
              
            this.hasRecSubmittedToICTeam=true;
        }else{
            this.hasRecSubmittedToICTeam=false;
        }
        if(growthRec.hasOwnProperty('dateIncentiveCompTeamExtractedData')
             && !this.isBlank(growthRec.dateIncentiveCompTeamExtractedData) ){
              
            this.hasRecExtractedByICTeam=true;
        }else{
            this.hasRecExtractedByICTeam=false;
            if(growthRec.hasOwnProperty('effectiveDate') && !this.isBlank(growthRec.effectiveDate)
                && this.highlightICDataExtractedStatus(growthRec.effectiveDate)
                && growthRec.hasOwnProperty('dateSentToIncentiveCompTeam')
                && !this.isBlank(growthRec.dateSentToIncentiveCompTeam)){
                    this.icDataExtractedStatusStyle="slds-cell-wrap colourtxt";
            }else{
                this.icDataExtractedStatusStyle="slds-cell-wrap";
            }
        }
        if(growthRec.hasOwnProperty('willSalesIncentivesBeSplit')
        && !this.isBlank(growthRec.willSalesIncentivesBeSplit) && growthRec.willSalesIncentivesBeSplit==='Yes'){
            this.salesIncentivesBeSplitStyle="slds-cell-wrap colourtxt";
        }else{
            this.salesIncentivesBeSplitStyle="slds-cell-wrap";
        }
        //if(this.loggedInUserRole === 'CM VPCR/RVP' || this.loggedInUserRole ==='CRM Administrator')
        if(this.loggedInUserRole === 'CM VPCR/RVP')
        {
            this.isLoggedInUserRoleCMVPCRRVP=true;
            if(growthRec.hasOwnProperty('salesPerson2Name')
            && !this.isBlank(growthRec.salesPerson2Name)){
                
                this.addClass="slds-cell-wrap colourtxt";
                this.addClass1="slds-cell-wrap colourtxt";
            }else if(growthRec.hasOwnProperty('salesPerson1Id')
            && !this.isBlank(growthRec.salesPerson1Id) && growthRec.hasOwnProperty('accountOwnerId')
            && !this.isBlank(growthRec.accountOwnerId) && growthRec.salesPerson1Id!==growthRec.accountOwnerId){
                this.addClass="slds-cell-wrap colourtxt";
                this.addClass1="slds-cell-wrap";
                
            }else{
                this.addClass="slds-cell-wrap";
                this.addClass1="slds-cell-wrap";
                

            }
            if(!growthRec.hasOwnProperty('salesPerson1Name') || this.isBlank(growthRec.salesPerson1Name)){
                scesReceivingCompensation='Not Yet Sent to Incentive Comp Team';
                this.addClass="slds-cell-wrap boldtxt";
            }else{

            if(growthRec.hasOwnProperty('salesPerson1Name') && !this.isBlank(growthRec.salesPerson1Name)){
                scesReceivingCompensation+=growthRec.salesPerson1Name;
            }
            if(growthRec.hasOwnProperty('salesPerson1SplitPercentage') && !this.isBlank(growthRec.salesPerson1SplitPercentage)){
                scesReceivingCompensation+=' '+growthRec.salesPerson1SplitPercentage+'%';
            }
            if(growthRec.hasOwnProperty('salesPerson2Name') && !this.isBlank(growthRec.salesPerson2Name)){
                scesReceivingCompensation+=', '+growthRec.salesPerson2Name;
            }
            if(growthRec.hasOwnProperty('salesPerson2SplitPercentage') && !this.isBlank(growthRec.salesPerson2SplitPercentage)){
                scesReceivingCompensation+=' '+growthRec.salesPerson2SplitPercentage+'%';
            }
        }
            this.scesReceivingCompensation=scesReceivingCompensation;
        }
        //if(this.loggedInUserRole==='CM VP'){
            if(this.loggedInUserRole==='Specialty Benefits SVP'){
            this.isLoggedInUserRoleSpecialitySVP=true;
            if(growthRec.hasOwnProperty('opportunityOwnerId') && !this.isBlank(this.loggedInUserId) 
                && !this.isBlank(growthRec.opportunityOwnerId) && growthRec.opportunityOwnerId===this.loggedInUserId){
                this.isSpecialitySVPAnOpportunityOwner=true;
            }else{
                this.isSpecialitySVPAnOpportunityOwner=false;
            }
        }

        this.onLoad=true;

    }

    handleOpportunityRecordView(event){
        console.log('oppId==>'+event.target.value);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId:this.growthRec.opportunityId,
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

    highlightICDataExtractedStatus(effectiveDate){
        let highlightICDataExtractedStatus=false;
        if(!this.isBlank(effectiveDate)){
            let currentDate=new Date();
            currentDate.setHours(0,0,0,0);
            let effctvDt=this.parseDate(effectiveDate);
            if(effctvDt<currentDate){
                highlightICDataExtractedStatus=true;
            }
        }else{
            highlightICDataExtractedStatus=true;
        }
        return highlightICDataExtractedStatus;
    }

    parseDate(inputDate) {
        var parts = inputDate.match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
    }


}