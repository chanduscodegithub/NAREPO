import {LightningElement,track,api,wire} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

import Surest__c from '@salesforce/schema/ProductMix__c.Surest__c';
import Pharmacy__c from '@salesforce/schema/ProductMix__c.Pharmacy__c';
import Dental__c from '@salesforce/schema/ProductMix__c.Dental__c';
import Vision__c from '@salesforce/schema/ProductMix__c.Vision__c';
import Supplemental_Health__c from '@salesforce/schema/ProductMix__c.Supplemental_Health__c';
import Care_Management__c from '@salesforce/schema/ProductMix__c.Care_Management__c';
import Decision_Support__c from '@salesforce/schema/ProductMix__c.Decision_Support__c';
import Women_s_Health__c from '@salesforce/schema/ProductMix__c.Women_s_Health__c';
import Disease_Management__c from '@salesforce/schema/ProductMix__c.Disease_Management__c';
import Centers_of_Excellence__c from '@salesforce/schema/ProductMix__c.Centers_of_Excellence__c';
import Wellness_and_Wellness_Coaching__c from '@salesforce/schema/ProductMix__c.Wellness_and_Wellness_Coaching__c';
import Worksite_Wellness__c from '@salesforce/schema/ProductMix__c.Worksite_Wellness__c';
import Rally_Client_above_base__c from '@salesforce/schema/ProductMix__c.Rally_Client_above_base__c';
import Incentive_Products__c from '@salesforce/schema/ProductMix__c.Incentive_Products__c';
import Health_Savings_Account_HSA__c from '@salesforce/schema/ProductMix__c.Health_Savings_Account_HSA__c';
import Health_Reimbursement_Account_HRA__c from '@salesforce/schema/ProductMix__c.Health_Reimbursement_Account_HRA__c';
import Flexible_Spending_Account_FSA__c from '@salesforce/schema/ProductMix__c.Flexible_Spending_Account_FSA__c';
import Behavioral_Health__c from '@salesforce/schema/ProductMix__c.Behavioral_Health__c';
import EAP_Domestic__c from '@salesforce/schema/ProductMix__c.EAP_Domestic__c';
import EAP_Global__c from '@salesforce/schema/ProductMix__c.EAP_Global__c';
import Retiree_Products__c from '@salesforce/schema/ProductMix__c.Retiree_Products__c';
import Member_Digital_Tools_Vendor__c from '@salesforce/schema/ProductMix__c.Member_Digital_Tools_Vendor__c'; // Added CR - 4088
import Member_Service_Vendor__c from '@salesforce/schema/ProductMix__c.Member_Service_Vendor__c';  //Added CR-3847
import UHC_UMR_Member_Service_and_Tools__c from '@salesforce/schema/ProductMix__c.UHC_UMR_Member_Service_and_Tools__c';
import UHC_UMR_Telehealth_Solutions__c from '@salesforce/schema/ProductMix__c.UHC_UMR_Telehealth_Solutions__c';
import UMR_COBRA_Services__c from '@salesforce/schema/ProductMix__c.UMR_COBRA_Services__c';
import UHC_Cobra_Administration__c from '@salesforce/schema/ProductMix__c.UHC_Cobra_Administration__c';
import Financial_Accounts__c from '@salesforce/schema/ProductMix__c.Financial_Accounts__c';
import UHC_Hub__c from '@salesforce/schema/ProductMix__c.UHC_Hub__c';

import {
    getPicklistValues
} from 'lightning/uiObjectInfoApi';
import {
    getObjectInfo
} from 'lightning/uiObjectInfoApi';
import ProductMix from '@salesforce/schema/ProductMix__c';

import saveCurrentProductData from '@salesforce/apex/ClientSurveyCtrl.saveCurrentProductData';



export default class CurrentProductClientSurvey extends LightningElement {
    @api UMRClientPlatform

    @api cpList;
    @api recordId
    @api userRole;
    @api clientSurveyCustomPermission;
    @track surveyTypePickListValues = [];

    @track isEdit = true;
    @track Surest__c = [];
    @track Pharmacy__c = [];
    @track Dental__c = [];
    @track Vision__c = [];
    @track Supplemental_Health__c = [];
    @track Care_Management__c = [];
    @track Women_s_Health__c = [];
    @track Decision_Support__c = [];
    @track Disease_Management__c = [];
    @track Centers_of_Excellence__c = [];
    @track Worksite_Wellness__c = [];
    @track Wellness_and_Wellness_Coaching__c = [];
    @track Rally_Client_above_base__c = [];
    @track Incentive_Products__c = [];
    @track Health_Savings_Account_HSA__c = [];
    @track Health_Reimbursement_Account_HRA__c = [];
    @track Flexible_Spending_Account_FSA__c = [];
    @track Behavioral_Health__c = [];
    @track EAP_Domestic__c = [];
    @track EAP_Global__c = [];
    @track Retiree_Products__c = [];
    @track Member_Digital_Tools_Vendor__c = [];  
    @track Member_Service_Vendor__c = [];  //Added CR-3847
    @track UHC_UMR_Member_Service_and_Tools__c = [];
    @track UHC_UMR_Telehealth_Solutions__c = [];
    @track UMR_COBRA_Services__c = [];
    @track ProductMix__c = {};
    @track showSpinner = false;
    @track UHC_Cobra_Administration__c = [];
    @track Financial_Accounts__c = [];
    @track UHC_Hub__c = [];
    @track isRequired = false;
    @track isReq = false;
    hasTabAccess;
    showProductError = false;
    productFields = ['Surest__c', 'Pharmacy__c', 'Dental__c', 'Vision__c','UHC_Hub__c', 'Supplemental_Health__c', 'Care_Management__c', 'Women_s_Health__c', 'Decision_Support__c','Financial_Accounts__c', 'Centers_of_Excellence__c', 'Disease_Management__c', 'Worksite_Wellness__c', 'Wellness_and_Wellness_Coaching__c', 'Rally_Client_above_base__c', 'Incentive_Products__c', 'Health_Savings_Account_HSA__c', 'Health_Reimbursement_Account_HRA__c', 'Flexible_Spending_Account_FSA__c', 'Behavioral_Health__c', 'EAP_Domestic__c', 'EAP_Global__c', 'Retiree_Products__c', 'UHC_Cobra_Administration__c', 'UHC_UMR_Telehealth_Solutions__c', 'UHC_UMR_Member_Service_and_Tools__c', 'UMR_COBRA_Services__c', 'Member_Service_Vendor__c','Member_Digital_Tools_Vendor__c']

    @api hasEditAccess; //added by SAMARTH

    @wire(getObjectInfo, {
        objectApiName: ProductMix
    })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Pharmacy__c
    })
    wiredPickListValuesPharmacy__c({
        data,
        error
    }) {
        if (data) {

            this.Pharmacy__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Surest__c
    })
    wiredPickListValuesSurest__c({
        data,
        error
    }) {
        if (data) {

            this.Surest__c = data.values;
            console.log('Suresttt',this.Surest__c);
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Dental__c
    })
    wiredPickListValuesDental__c({
        data,
        error
    }) {
        if (data) {
            this.Dental__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Vision__c
    })
    wiredPickListValuesVision__c({
        data,
        error
    }) {
        if (data) {

            this.Vision__c = data.values;
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Supplemental_Health__c
    })
    wiredPickListValuesSupplemental_Health__c({
        data,
        error
    }) {
        if (data) {

            this.Supplemental_Health__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: UHC_Cobra_Administration__c
    })
    wiredPickListValuesUHC_Cobra_Administration__c({
        data,
        error
    }) {
        if (data) {

            this.UHC_Cobra_Administration__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Care_Management__c
    })
    wiredPickListValuesCare_Management__c({
        data,
        error
    }) {
        if (data) {

            this.Care_Management__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Women_s_Health__c
    })
    wiredPickListValuesWomen_s_Health__c({
        data,
        error
    }) {
        if (data) {

            this.Women_s_Health__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Decision_Support__c
    })
    wiredPickListValuesDecision_Support__c({
        data,
        error
    }) {
        if (data) {

            this.Decision_Support__c = data.values;
        }

    }


    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Disease_Management__c
    })
    wiredPickListValuesDisease_Management__c({
        data,
        error
    }) {
        if (data) {

            this.Disease_Management__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Centers_of_Excellence__c
    })
    wiredPickListValuesWellness__c({
        data,
        error
    }) {
        if (data) {

            this.Centers_of_Excellence__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Wellness_and_Wellness_Coaching__c
    })
    wiredPickListValuesWellness_and_Wellness_Coaching__c({
        data,
        error
    }) {
        if (data) {

            this.Wellness_and_Wellness_Coaching__c = data.values;
        }

    }
    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Worksite_Wellness__c
    })
    wiredPickListValuesWellness_Coaching__c({
        data,
        error
    }) {
        if (data) {

            this.Worksite_Wellness__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Rally_Client_above_base__c
    })
    wiredPickListValuesRally_Client_above_base__c({
        data,
        error
    }) {
        if (data) {

            this.Rally_Client_above_base__c = data.values;
        }

    }
    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Incentive_Products__c
    })
    wiredPickListValuesIncentive_Products__c({
        data,
        error
    }) {
        if (data) {

            this.Incentive_Products__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Health_Savings_Account_HSA__c
    })
    wiredPickListValuesHealth_Savings_Account_HSA__c({
        data,
        error
    }) {
        if (data) {

            this.Health_Savings_Account_HSA__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Health_Reimbursement_Account_HRA__c
    })
    wiredPickListValuesHealth_Reimbursement_Account_HRA__c({
        data,
        error
    }) {
        if (data) {

            this.Health_Reimbursement_Account_HRA__c = data.values;
        }

    }
    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Flexible_Spending_Account_FSA__c
    })
    wiredPickListValuesFlexible_Spending_Account_FSA__c({
        data,
        error
    }) {
        if (data) {

            this.Flexible_Spending_Account_FSA__c = data.values;
        }

    }

    //added by Vignesh
    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Financial_Accounts__c
    })
    wiredPickListValuesFinancial_Accounts__c({
        data,
        error
    }) {
        if (data) {

            this.Financial_Accounts__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: UHC_Hub__c
    })
    wiredPickListValuesUHC_Hub__c({
        data,
        error
    }) {
        if (data) {

            this.UHC_Hub__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Behavioral_Health__c
    })
    wiredPickListValuesBehavioral_Health__c({
        data,
        error
    }) {
        if (data) {

            this.Behavioral_Health__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: EAP_Domestic__c
    })
    wiredPickListValuesEAP_Domestic__c({
        data,
        error
    }) {
        if (data) {

            this.EAP_Domestic__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: EAP_Global__c
    })
    wiredPickListValuesEAP_Global__c({
        data,
        error
    }) {
        if (data) {

            this.EAP_Global__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Retiree_Products__c
    })
    wiredPickListValuesRetiree_Products__c({
        data,
        error
    }) {
        if (data) {

            this.Retiree_Products__c = data.values;
        }

    }

    //Added CR-3847
    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Member_Service_Vendor__c
    })
    wiredPickListValuesMember_Service_Vendor__c({
        data,
        error
    }) {
        if (data) {

            this.Member_Service_Vendor__c = data.values;
        }

    } 

     @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: Member_Digital_Tools_Vendor__c
    })
    wiredPickListValuesMember_Digital_Tools_Vendor__c({
        data,
        error
    }) {
        if (data) {

            this.Member_Digital_Tools_Vendor__c = data.values;
        }

    } 

    

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: UHC_UMR_Member_Service_and_Tools__c
    })
    wiredPickListValuesUHC_UMR_Member_Service_and_Tools__c({
        data,
        error
    }) {
        if (data) {

            this.UHC_UMR_Member_Service_and_Tools__c = data.values;
        }

    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: UHC_UMR_Telehealth_Solutions__c
    })
    wiredPickListValuesUHC_UMR_Telehealth_Solutions__c({
        data,
        error
    }) {
        if (data) {

            this.UHC_UMR_Telehealth_Solutions__c = data.values;
        }

    }
    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: UMR_COBRA_Services__c
    })
    wiredPickListValuesUMR_COBRA_Services__c({
        data,
        error
    }) {
        if (data) {

            this.UMR_COBRA_Services__c = data.values;
        }

    }

   

    connectedCallback() {

        this.surveyTypePickListValues.push({
            label: '--None--',
            value: ''
        });

        this.surveyTypePickListValues.push({
            label: 'Yes',
            value: 'Yes'
        });
        this.surveyTypePickListValues.push({
            label: 'No',
            value: 'No'
        });

        this.ProductMix__c = Object.assign({}, this.cpList);

        //(this.UMRClientPlatform != null && this.UMRClientPlatform != undefined) - added by SAMARTH
        if ((this.UMRClientPlatform != null && this.UMRClientPlatform != undefined) &&
            !this.UMRClientPlatform.includes('UMR - CPS') && !this.UMRClientPlatform.includes('Healthscope - HSB')) {               
            this.ProductMix__c.UHC_UMR_Telehealth_Solutions__c = this.ProductMix__c.UHC_UMR_Telehealth_Solutions__c ? this.ProductMix__c.UHC_UMR_Telehealth_Solutions__c : 'No';
            this.ProductMix__c.UHC_UMR_Member_Service_and_Tools__c = this.ProductMix__c.UHC_UMR_Member_Service_and_Tools__c ? this.ProductMix__c.UHC_UMR_Member_Service_and_Tools__c : 'No';
            this.ProductMix__c.UMR_COBRA_Services__c = this.ProductMix__c.UMR_COBRA_Services__c ? this.ProductMix__c.UMR_COBRA_Services__c : 'No';

        }
        //Added CR-3847
        if(this.UMRClientPlatform && this.UMRClientPlatform.includes('UMR')){
            this.isReq = true;           
        }


        if (this.userRole == 'CM VP' || this.userRole == 'CM SCE' || this.userRole == 'Surest CM SCE' || this.userRole == 'Surest CM SVP' ||
            this.userRole == 'CM VPCR/RVP' || this.userRole == 'Specialty Benefits SCE' ||
            this.userRole == 'CRM Administrator' || this.clientSurveyCustomPermission) {
            this.isRequired = true;
            
            this.hasTabAccess = true;
        }




    }

    handleEdit(event) {
        this.isEdit = false;
        const value = true;
        const valueChangeEvent = new CustomEvent("valuechange", {
            detail: {
                value
            }
        });
        // Fire the custom event
        this.dispatchEvent(valueChangeEvent);
    }

    handleCancel(event) {

        this.isEdit = true;
        this.ProductMix__c = Object.assign({}, this.cpList);
        const value = false;
        const valueChangeEvent = new CustomEvent("valuechange", {
            detail: {
                value
            }
        });
        // Fire the custom event
        this.dispatchEvent(valueChangeEvent);
        console.log(this.productFields)
        for (const field of this.productFields) {
            const element = this.template.querySelector(`[data-name="${field}"]`);
            if (element) {
                element.setCustomValidity("");
                element.reportValidity();
            }
        }
    }

    updateChanges(event) {
        console.log(event.currentTarget.dataset.name);
        this.ProductMix__c[event.currentTarget.dataset.name] = event.target.value;
    }

    validateRequiredFields() {
      //  const telehealthSolutions = this.template.querySelector('.telehealthSolutions');
        const memberServiceAndTools = this.template.querySelector('.memberServiceAndTools');
      //  const cobra = this.template.querySelector('.cobra');
        let error = 0;
        // if (!telehealthSolutions.value) {
        //     telehealthSolutions.setCustomValidity("Please select an option");
        //     telehealthSolutions.reportValidity();
        //     error++
        // } else {
        //     telehealthSolutions.setCustomValidity("");
        //     telehealthSolutions.reportValidity();
        // }

        if (!memberServiceAndTools.value) {
            if(this.isReq){
            memberServiceAndTools.setCustomValidity("Please complete this field");
            memberServiceAndTools.reportValidity();
            error++
            } 
        } else {
            memberServiceAndTools.setCustomValidity("");
            memberServiceAndTools.reportValidity();
        }

        // if (!cobra.value) {
        //     cobra.setCustomValidity("Please select an option");
        //     cobra.reportValidity();
        //     error++
        // } else {
        //     cobra.setCustomValidity("");
        //     cobra.reportValidity();
        // }

        return !(error > 0)
    }

    handleSave(event) {

        
        for (const field of this.productFields) {
            const element = this.template.querySelector(`[data-name="${field}"]`);
            if (element) {
                element.setCustomValidity("");
                element.reportValidity();
            }
        }

        if (this.isRequired && this.isReq &&(!this.validateRequiredFields() ||!this.validateOnSCEValidation(true))) return;
        this.showProductError = false;
        this.showSpinner = true;
        saveCurrentProductData({ ProductMix: this.ProductMix__c })
            .then(result => {

                this.ProductMix__c = result;

                this.cpList = Object.assign({}, this.ProductMix__c);
                this.showSpinner = false;
                
                const evt = new ShowToastEvent({
                    title: 'Success',
                    message: 'Data saved successfully',
                    variant: 'Success',
                });
                this.dispatchEvent(evt);
                this.isEdit = true;

            }).catch(error => {
                this.showSpinner = false;

                console.log('Error Occured while Saving ', error);
            });

        const value = false;
        const valueChangeEvent = new CustomEvent("valuechange", {
            detail: {
                value
            }
        });

        this.dispatchEvent(valueChangeEvent);
    }

    @api
    validateOnSCEValidation(onSaveValidation) {

        let showError = false;
        for (const field of this.productFields) {
            const element = this.template.querySelector(`[data-name="${field}"]`);
            if (element) {
                
                if (!this.ProductMix__c[field]) {
                    if(field == 'Member_Service_Vendor__c' || field =='Member_Digital_Tools_Vendor__c') {
                        if(this.isReq){
                            showError = true;
                            element.setCustomValidity("Please complete this field");
                        } 
                        else{
                         break;
                        }
                    }                
                    showError = true;
                    element.setCustomValidity("Please complete this field");
                    
                } else {
                    element.setCustomValidity("");
                }

                element.reportValidity();
            }
        }

        if (showError) {
            if (!onSaveValidation) {
                this.showProductError = true;
                /*
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: `The Product section needs to be completed before you can validate. Please ensure that a response is recorded for each product in this section and validate once you've made the updates.`,
                    variant: 'Error',
                    mode: 'dismissible'
                });
               
                this.dispatchEvent(evt);
                 */
            }
            return false;
        }

    
        return true;
    }

    closeModal() {
        this.showProductError = false;

    }

}