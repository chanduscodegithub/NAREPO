import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import fetchSalesDebreiefSummaryData from '@salesforce/apex/SalesDebriefSummaryController.fetchSalesDebreiefSummaryData';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class SalesDebriefSummary extends NavigationMixin( LightningElement ) {

    isLoaded = false;
    isUserAuthorized = false;
    currentSlaesCycle = '';
    salesDebreiefSummaryData = [];

    connectedCallback(){
        this.fetchSalesDebreiefSummaryDataFromSF();
    }

    get containsSalesDebriefSummaryData(){
        return this.salesDebreiefSummaryData.length > 0;
    }

    fetchSalesDebreiefSummaryDataFromSF(){
        this.isLoaded = false;
        this.isUserAuthorized = false;
        this.currentSlaesCycle = '';
        this.salesDebreiefSummaryData = [];
        
        fetchSalesDebreiefSummaryData()
        .then( result => {
            let startDate = new Date( result.startDate );
            let endDate = new Date( result.endDate );
            this.currentSlaesCycle = `IY ${startDate.getFullYear()}, ${this.formatDate( { toFormatDate: endDate, prefix: '' } )}`;
            this.isUserAuthorized = result.isUserAuthorizedViewData;

            if( result.salesDebriefSummaryList?.length > 0 ){
                this.salesDebreiefSummaryData = result.salesDebriefSummaryList.map( value => {

                    const effectiveDate = new Date( value.EffectiveDate__c );
                    
                    console.log("Sales Override Value --->"+value.Sales_Debrief_Override__c);
                    console.log("Sales Type Value --->"+value.Sales_Debrief__c);
                    if(value.Sales_Debrief_Override__c==null || value.Sales_Debrief_Override__c==undefined || value.Sales_Debrief_Override__c==''){
                        return { 
                            ...value, 
                            membershipActivityUrl:  `/${value.Id}`,
                            salesDebriefType: ( value.Sales_Debrief__c )? value.Sales_Debrief__c : '',
                            salesDebriefStatus: ( value.Sales_Debriefs__r?.length > 0 && 
                                                    value.Sales_Debriefs__r[0].Debrief_Complete_Incomplete__c === 'Complete'
                                                )? 'Complete' : 'Incomplete',
                            effectiveDate: this.formatDate({  toFormatDate: effectiveDate })
                        }
                    }
                    else {
                        return { 
                            ...value, 
                            membershipActivityUrl:  `/${value.Id}`,
                            salesDebriefType: ( value.Sales_Debrief_Override__c )? value.Sales_Debrief_Override__c : '',
                            salesDebriefStatus: ( value.Sales_Debriefs__r?.length > 0 && 
                                                    value.Sales_Debriefs__r[0].Debrief_Complete_Incomplete__c === 'Complete'
                                                )? 'Complete' : 'Incomplete',
                            effectiveDate: this.formatDate({  toFormatDate: effectiveDate })
                        }
                    } 
                    
                });
            }
            
            this.isLoaded = true;
        })
        .catch( err => {
            if( err?.body?.message?.includes('do not have access') ){
                this.dispatchEvent( 
                    new ShowToastEvent({
                        title: 'Access Error',
                        variant: 'error',
                        message: 'Please contact admin for the required access',
                        mode: 'sticky'
                    })
                );
            } else {
                console.log( err );
            }
        });
    }

    navigateToMembershipActivity( event ){
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                objectApiName: 'Opportunity',
                recordId: event.target.dataset.opportunityid,
                actionName: 'view',
            }
        });
    }

    formatDate({ toFormatDate }){
        if( toFormatDate ){
            const offsetHrs = 16;
            toFormatDate.setTime( toFormatDate.getTime() + ( offsetHrs*60*60*1000 ) );
            return toFormatDate.toLocaleDateString("en-US");
        }
    }
}