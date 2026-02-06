import { LightningElement,api,wire,track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import USER_ID from '@salesforce/user/Id';
import userProfileId from '@salesforce/schema/User.Profile.Name';
import userRoleId from '@salesforce/schema/User.UserRole.Name';
import userDetails from '@salesforce/apex/BicCompanyWideInformation.userDetails';

const ACCOUNT_FIELDS = [
    'Account.Name',
    'Account.RecordType.Name'
];

export default class BicTopmarketInformation extends LightningElement {
    
    @api recordId;
    //for sequencing 
    @track recordIdTemp
    expandSection = false;
    showEditBtn = true;
    showSpinner = false;
    hasRendered = false;
    isBicFormUpdate = false;
    isTopMarketFormUpdated = false;
    isAdminProfile = false;
    isReadonly = true;
    profileName;
    
    
    @wire(userDetails, { recordId: USER_ID}) 
    userDetails({error, data}) {
        if (data) {
            console.log(data);
            console.log('data.Profile.Name '+data.Profile.Name);
            this.profileName = data.Profile.Name;
            if(data.Profile.Name == 'System Administrator' || data.UserRole.Name == 'CRMIT Administrator' ){
               this.isAdminProfile = true; 
            }
            this.recordIdTemp = this.recordId;
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getRecord, { recordId: '$recordIdTemp', fields: ACCOUNT_FIELDS}) 
    accountDetails({error, data}) {
        if (data) {
            const recodtype = data.fields.RecordType.displayValue;
            console.log('recodtype '+recodtype);
            if(!this.isAdminProfile){
                //cm accounts
                if(recodtype == 'Existing Client' 
                || recodtype == 'Client Subsidiary' 
                || recodtype == 'Pending Transfer in Client' 
                || recodtype == 'Sold Client' || this.profileName == 'General Executives'  ||  this.profileName == 'Benefit Strategist' 
                || this.profileName == 'Senior Executives'
                || this.profileName == 'IPM Advanced Profile' 
                || this.profileName == 'IPM Standard Profile'){
                    this.isReadonly = true;

                }else if(recodtype == 'Prospect' || recodtype == 'Suspect' || recodtype == 'Prospect Subsidiary' || recodtype == 'Aggregator'){
                    this.isReadonly = false;
                }
            }else{
                this.isReadonly = false;
            }
            console.log('this.isReadonly');
            console.log(this.isReadonly);
            console.log(this.isAdminProfile);
        } else if (error) {
            console.log(error);
        }
    }

    toggleSection(){
        
        if(this.expandSection){
            this.expandSection = false;
        }else{
            this.expandSection = true;
        }
    }

    
    checkRecordUpdateInfo(event){
        console.log(event.detail+' update');
        if(event.detail == 'companywideupdate'){
            this.isBicFormUpdate  = true;
        }else{
            this.isTopMarketFormUpdated = true;
        }
       
        if(this.isBicFormUpdate  && this.isTopMarketFormUpdated){
            this.disableEdit();
            this.isBicFormUpdate = false;
            this.isTopMarketFormUpdated = false;
            this.showSpinner = false;
        }
        
    }


    enableEdit(){
        this.showEditBtn = false;
        this.template.querySelector("c-top-market-information").enableEdit();
        this.template.querySelector("c-company-wide-biC-infromation").enableEdit();
    }

    disableEdit(){
        this.showEditBtn = true;
        this.template.querySelector("c-top-market-information").disableEdit();
        this.template.querySelector("c-company-wide-biC-infromation").disableEdit();
    }
    
    initiateSubmit(){
      
        this.showSpinner = true;
        this.template.querySelector("c-top-market-information").initiateSubmit();
        this.template.querySelector("c-company-wide-biC-infromation").updateBicInformation ();
    
    }

    renderedCallback() {
        if(!this.hasRendered){
            const style = document.createElement('style');
            style.innerText = `.bicTopMarket lightning-helptext{display:none;} .bicTopMarket .mainHeading lightning-helptext{display:inline-flex !important;}`;            
            this.template.querySelector('.cssContainer').appendChild(style);
            this.hasRendered = true;
        }
        
    }
}