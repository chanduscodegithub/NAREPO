/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 03-01-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, api, wire } from 'lwc';
//import getBGHData from '@salesforce/apex/ClientProfileController.getBGHData'; 


export default class CorporationOverviewComp extends LightningElement {
    
   

    @api recordId;
    @api isCorporationOverviewDataEmpty;
    @api corporationOverviewData;
    @api currentDealStartDateStr;
    @api currentDealRenewalDateStr;
    @api surestCurrentDealStartDateStr;
    @api surestNextRenewalDateStr;
    @api bghData;
   @api annualRevenue;
   @api annualB2B;
//     @wire(getBGHData, { accountId: '$recordId' })
// wiredBghResponse(response){
//     console.log('inside the wired response getBGHData');

//     if(response.data!=undefined && response.data!=null){
    
//     this.bghData =  response.data;
//     console.log('this.bghData ------'+this.bghData );
// }else if(response.error){
//     console.log('Error in getCorporationOverviewData() ==>' + JSON.stringify(response.error));
    
// }

// }
}