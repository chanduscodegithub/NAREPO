import { LightningElement, api, wire, track } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import Renewal_Checklist from '@salesforce/schema/Renewal_Checklist__c';

import Payment_Integrity_Bundles from '@salesforce/schema/Renewal_Checklist__c.Payment_Integrity_Bundles__c';
import Pre_Pay_Status from '@salesforce/schema/Renewal_Checklist__c.Pre_Pay_Status__c';
import Post_Pay_Status from '@salesforce/schema/Renewal_Checklist__c.Post_Pay_Status__c';
import Subrogation from '@salesforce/schema/Renewal_Checklist__c.Subrogation_Status__c';
import Coordination_of_Benefits_Status from '@salesforce/schema/Renewal_Checklist__c.Coordination_of_Benefits_Status__c';
import Payment_Policy_Status from '@salesforce/schema/Renewal_Checklist__c.Payment_Policy_Status__c';
import Enhanced_Fraud_Abuse_CCD_Status from '@salesforce/schema/Renewal_Checklist__c.Enhanced_Fraud_Abuse_CCD_Status__c';
import Itemized_Bill_Review_Status from '@salesforce/schema/Renewal_Checklist__c.Itemized_Bill_Review_Status__c';
import Focused_Claim_Review_Status from '@salesforce/schema/Renewal_Checklist__c.Focused_Claim_Review_Status__c';
import Third_Party_Liability_Recovery from '@salesforce/schema/Renewal_Checklist__c.Third_Party_Liability_Recovery_Subro_S__c';
import Third_Party_Liability_Recovery_ICC from '@salesforce/schema/Renewal_Checklist__c.Third_Party_Liability_Recovery_ICC_Sta__c';
import Advanced_Analytic_and_Recovery_Service from '@salesforce/schema/Renewal_Checklist__c.Advanced_Analytic_and_Recovery_Service_S__c';
import Claims_Tracking_and_Validation_CTV_Audit from '@salesforce/schema/Renewal_Checklist__c.Claims_Tracking_and_Validation_CTV_St__c';
import Credit_Balance_Recovery_Services_Status from '@salesforce/schema/Renewal_Checklist__c.Credit_Balance_Recovery_Services_Status__c';
import PCC_Payment_Integrity_Text from '@salesforce/label/c.PCC_Payment_Integrity_Text';

const simplifiedOptions = ['Simplified Option 1', 'Simplified Option 2', 'Simplified Option 3', 'Simplified Non-Standard', 'Blackstone Equity Health 2025'];
const legecyOptions = ['Legacy Option 1', 'Legacy Option 2', 'Legacy Option 3', 'Legacy Non-Standard'];

export default class PccPaymentIntegritySection extends LightningElement {
    @track renewalChecklistData;
    isSimplified = false;
    isLegecy = false;
    isCreditBalance = false;
    isEdit = false;
    isClaimsTracking = false;
    isSimplified1 = false;
    isSimplifiedReadonly = false;

    supplimentalCompensationPickListOptions = [];
    @track paymentPolicyOptions = [];
    paymentIntegBundlesOptions = [];
    claimsTrackingOptions = [];
    advancedAnalyticsOptions = [];
    @track tplRecoveryIccOptions = [];
    @track tplRecoveryOptions = [];
    @track focusedClaimOptions = [];
    @track itemizedBillOptions = [];
    @track enhancedFraudOptions = [];
    @track benifitOptions = [];
    SubrogationOptions = [];
    postPayOptions = [];
    prePayOptions = [];
    @track creditBalanceOptions = [];
    legecyOption123;
    nonStandardOptions;
    paymentIntegretyToBackend = {};
    prospectivefraudOptions = [{ "label": 'Included', "value": 'Included' }];
    retroFraudOptions = [{ "label": 'Included', "value": 'Included' }];
    edcOptions = [{ "label": 'Included', "value": 'Included' }];
    @api hideEdit;

    label = {
        PCC_Payment_Integrity_Text
    };

    @api
    get renewalChecklistDataFromParent() {
        return this.renewalChecklistData;
    }
    set renewalChecklistDataFromParent(value) {
        this.renewalChecklistData = JSON.parse(JSON.stringify(value));
        if (this.renewalChecklistData.hasOwnProperty('Payment_Integrity_Bundles__c')) {
            let field = this.renewalChecklistData.Payment_Integrity_Bundles__c;
            this.setLegecySImplifiedValue(field);
            this.paymentIntegrityDependency(field);
        }
        else{
            this.isLegecy = false;
            this.isSimplified = false;
        }
    }

    @wire(getObjectInfo, { objectApiName: Renewal_Checklist })
    renewalObjData;

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Payment_Integrity_Bundles })
    paymentIntegBundlesPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.paymentIntegBundlesOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            this.paymentIntegBundlesOptions.unshift('');
            console.log('this.paymentIntegBundlesOptions = ', this.paymentIntegBundlesOptions);
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Pre_Pay_Status })
    prePayPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.prePayOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.prePayOptions = ',JSON.stringify(this.prePayOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Credit_Balance_Recovery_Services_Status })
    creditBalanceList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.creditBalanceOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.creditBalanceOptions = ',JSON.stringify(this.creditBalanceOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Post_Pay_Status })
    postPayPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.postPayOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.postPayOptions = ',JSON.stringify(this.postPayOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Subrogation })
    SubrogationPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.SubrogationOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.SubrogationOptions = ',JSON.stringify(this.SubrogationOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Coordination_of_Benefits_Status })
    benifitPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.benifitOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.benifitOptions = ',JSON.stringify(this.benifitOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Payment_Policy_Status })
    paymentPolicyPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.paymentPolicyOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.paymentPolicyOptions = ',JSON.stringify(this.paymentPolicyOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Enhanced_Fraud_Abuse_CCD_Status })
    enhancedFraudPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.enhancedFraudOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.enhancedFraudOptions = ',JSON.stringify(this.enhancedFraudOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Itemized_Bill_Review_Status })
    itemizedBillPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.itemizedBillOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.itemizedBillOptions = ',JSON.stringify(this.itemizedBillOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Focused_Claim_Review_Status })
    focusedClaimPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.focusedClaimOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.focusedClaimOptions = ',JSON.stringify(this.focusedClaimOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Third_Party_Liability_Recovery })
    tplRecoveryPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.tplRecoveryOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.tplRecoveryOptions = ',JSON.stringify(this.tplRecoveryOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Third_Party_Liability_Recovery_ICC })
    tplRecoveryIccPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.tplRecoveryIccOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.tplRecoveryIccOptions = ',JSON.stringify(this.tplRecoveryIccOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Advanced_Analytic_and_Recovery_Service })
    advancedAnalyticsPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.advancedAnalyticsOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.advancedAnalyticsOptions = ',JSON.stringify(this.advancedAnalyticsOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Claims_Tracking_and_Validation_CTV_Audit })
    claimsTrackingPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.claimsTrackingOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            console.log('this.claimsTrackingOptions = ',JSON.stringify(this.claimsTrackingOptions));
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }
    
    handleChange(event) {
        
        let value = event.target.value;
        let fieldName = event.target.dataset.api;
        let paymentIntegretyObj = {};
        paymentIntegretyObj[event.target.dataset.api] = value;
        if (fieldName === 'Payment_Integrity_Bundles__c') {
            this.setLegecySImplifiedValue(value);
            this.paymentIntegrityDependency(value);
            this.autoPopulatePaymentIntegrity(value);
        }
        this.renewalChecklistData[event.target.dataset.api] = value;
        this.paymentIntegretyToBackend = { ...this.paymentIntegretyToBackend, ...paymentIntegretyObj };
        console.log('this.renewalChecklistData child = ', JSON.stringify(this.renewalChecklistData) );
    }

    setLegecySImplifiedValue(fieldValue) {
        this.isSimplified = simplifiedOptions.includes(fieldValue) ? true : false;
        this.isLegecy = legecyOptions.includes(fieldValue) ? true : false;
    }

    paymentIntegrityDependency(value) {
        let legacyOptions = ['Legacy Option 1', 'Legacy Option 2', 'Legacy Option 3'];
        let nonStandard = ['Simplified Non-Standard', 'Legacy Non-Standard'];
        this.legecyOption123 = legacyOptions.includes(value) ? true : false;
        this.nonStandardOptions = nonStandard.includes(value) ? true : false;
        this.isClaimsTracking = this.nonStandardOptions || value === 'Legacy Option 1' || value === 'Simplified Option 1' ? true : false;
        this.isSimplified1 = value === 'Simplified Option 1';
        this.isSimplifiedReadonly = value === 'Simplified Option 1' || value === 'Simplified Non-Standard';
    }

    autoPopulatePaymentIntegrity(value) {
        switch (value) {
            case 'Simplified Option 1':
                this.renewalChecklistData.Pre_Pay_Rate__c = 22.00;
                this.renewalChecklistData.Pre_Pay_Status__c = 'Included';
                this.renewalChecklistData.Post_Pay_Rate__c = 22.00;
                this.renewalChecklistData.Post_Pay_Status__c = 'Included';
                this.renewalChecklistData.Subrogation_Rate__c = 33.30;
                this.renewalChecklistData.Subrogation_Status__c = 'Included';
                this.renewalChecklistData.Coordination_of_Benefits_Rate__c = 0.00;
                this.renewalChecklistData.Coordination_of_Benefits_Status__c = 'COB Lite';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_Rt__c =  '';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_St__c = '';

                this.paymentIntegretyToBackend = {
                    Pre_Pay_Rate__c: 22,
                    Pre_Pay_Status__c: 'Included',
                    Post_Pay_Rate__c: 22,
                    Post_Pay_Status__c: 'Included',
                    Subrogation_Rate__c: 33.3,
                    Subrogation_Status__c: 'Included',
                    Coordination_of_Benefits_Rate__c: 0,
                    Coordination_of_Benefits_Status__c: 'COB Lite',
                    Claims_Tracking_and_Validation_CTV_Rt__c: 0,
                    Claims_Tracking_and_Validation_CTV_St__c: 'Included',
                    Payment_Policy_Rate__c: '',
                    Payment_Policy_Status__c: '',
                    Prospective_Fraud_Abuse_Rate__c: '',
                    Prospective_Fraud_Abuse_Status__c: '',
                    Retrospective_Fraud_Abuse_Rate__c: '',
                    Retrospective_Fraud_Abuse_Status__c: '',
                    Enhanced_Fraud_Abuse_CCD_Rate__c: '',
                    Enhanced_Fraud_Abuse_CCD_Status__c: '',
                    EDC_Analyzer_Rate__c: '',
                    EDC_Analyzer_Status__c: '',
                    Itemized_Bill_Review_Rate__c: '',
                    Itemized_Bill_Review_Status__c: '',
                    Focused_Claim_Review_Rate__c: '',
                    Focused_Claim_Review_Status__c: '',
                    Hospital_Bill_Audit_Rate__c: '',
                    Hospital_Bill_Audit_Status__c: '',
                    Credit_Balance_Recovery_Services_Rate__c: '',
                    Credit_Balance_Recovery_Services_Status__c: '',
                    Third_Party_Liability_Recovery_Subro_R__c: '',
                    Third_Party_Liability_Recovery_Subro_S__c: '',
                    Third_Party_Liability_Recovery_ICC_Rat__c: '',
                    Third_Party_Liability_Recovery_ICC_Sta__c: '',
                    Advanced_Analytic_and_Recovery_Service_R__c: '',
                    Advanced_Analytic_and_Recovery_Service_S__c: '',
                    Hospital_Bill_Audit_Optum__c: '',
                    Hospital_Bill_Audit_Optum_Status__c: '',
                    Hospital_Bill_Audit_Vendor_Rate__c: '',
                    Hospital_Bill_Audit_Vendor_Status__c: ''
                }
                break;
            case 'Simplified Option 2':
                this.renewalChecklistData.Pre_Pay_Rate__c = 30.00;
                this.renewalChecklistData.Pre_Pay_Status__c = 'Included';
                this.renewalChecklistData.Post_Pay_Rate__c = 30.00;
                this.renewalChecklistData.Post_Pay_Status__c = 'Included';
                this.renewalChecklistData.Subrogation_Rate__c = 33.30;
                this.renewalChecklistData.Subrogation_Status__c = 'Included';
                this.renewalChecklistData.Coordination_of_Benefits_Rate__c = 0.00;
                this.renewalChecklistData.Coordination_of_Benefits_Status__c = 'COB Lite';

                this.paymentIntegretyToBackend = {
                    Payment_Policy_Rate__c: '',
                    Payment_Policy_Status__c: '',
                    Prospective_Fraud_Abuse_Rate__c: '',
                    Prospective_Fraud_Abuse_Status__c: '',
                    Retrospective_Fraud_Abuse_Rate__c: '',
                    Retrospective_Fraud_Abuse_Status__c: '',
                    Enhanced_Fraud_Abuse_CCD_Rate__c: '',
                    Enhanced_Fraud_Abuse_CCD_Status__c: '',
                    EDC_Analyzer_Rate__c: '',
                    EDC_Analyzer_Status__c: '',
                    Itemized_Bill_Review_Rate__c: '',
                    Itemized_Bill_Review_Status__c: '',
                    Focused_Claim_Review_Rate__c: '',
                    Focused_Claim_Review_Status__c: '',
                    Hospital_Bill_Audit_Rate__c: '',
                    Hospital_Bill_Audit_Status__c: '',
                    Credit_Balance_Recovery_Services_Rate__c: '',
                    Credit_Balance_Recovery_Services_Status__c: '',
                    Third_Party_Liability_Recovery_Subro_R__c: '',
                    Third_Party_Liability_Recovery_Subro_S__c: '',
                    Third_Party_Liability_Recovery_ICC_Rat__c: '',
                    Third_Party_Liability_Recovery_ICC_Sta__c: '',
                    Advanced_Analytic_and_Recovery_Service_R__c: '',
                    Advanced_Analytic_and_Recovery_Service_S__c: '',
                    Claims_Tracking_and_Validation_CTV_Rt__c: '',
                    Claims_Tracking_and_Validation_CTV_St__c: '',
                    Pre_Pay_Rate__c: 30,
                    Pre_Pay_Status__c: 'Included',
                    Post_Pay_Rate__c: 30,
                    Post_Pay_Status__c: 'Included',
                    Subrogation_Rate__c: 33.3,
                    Subrogation_Status__c: 'Included',
                    Coordination_of_Benefits_Rate__c: 0,
                    Coordination_of_Benefits_Status__c: 'COB Lite',
                    Hospital_Bill_Audit_Optum__c: '',
                    Hospital_Bill_Audit_Optum_Status__c: '',
                    Hospital_Bill_Audit_Vendor_Rate__c: '',
                    Hospital_Bill_Audit_Vendor_Status__c: ''
                }
                break;
            case 'Simplified Option 3':
                this.renewalChecklistData.Pre_Pay_Rate__c = 30.00;
                this.renewalChecklistData.Pre_Pay_Status__c = 'Included';
                this.renewalChecklistData.Post_Pay_Rate__c = 30.00;
                this.renewalChecklistData.Post_Pay_Status__c = 'Included';
                this.renewalChecklistData.Subrogation_Rate__c = 33.30;
                this.renewalChecklistData.Subrogation_Status__c = 'Included';
                this.renewalChecklistData.Coordination_of_Benefits_Rate__c = 30.00;
                this.renewalChecklistData.Coordination_of_Benefits_Status__c = 'Enhanced COB';

                this.paymentIntegretyToBackend = {
                    Pre_Pay_Rate__c: 30,
                    Pre_Pay_Status__c: 'Included',
                    Post_Pay_Rate__c: 30,
                    Post_Pay_Status__c: 'Included',
                    Subrogation_Rate__c: 33.3,
                    Subrogation_Status__c: 'Included',
                    Coordination_of_Benefits_Rate__c: 30,
                    Coordination_of_Benefits_Status__c: 'Enhanced COB',
                    Payment_Policy_Rate__c: '',
                    Payment_Policy_Status__c: '',
                    Prospective_Fraud_Abuse_Rate__c: '',
                    Prospective_Fraud_Abuse_Status__c: '',
                    Retrospective_Fraud_Abuse_Rate__c: '',
                    Retrospective_Fraud_Abuse_Status__c: '',
                    Enhanced_Fraud_Abuse_CCD_Rate__c: '',
                    Enhanced_Fraud_Abuse_CCD_Status__c: '',
                    EDC_Analyzer_Rate__c: '',
                    EDC_Analyzer_Status__c: '',
                    Itemized_Bill_Review_Rate__c: '',
                    Itemized_Bill_Review_Status__c: '',
                    Focused_Claim_Review_Rate__c: '',
                    Focused_Claim_Review_Status__c: '',
                    Hospital_Bill_Audit_Rate__c: '',
                    Hospital_Bill_Audit_Status__c: '',
                    Credit_Balance_Recovery_Services_Rate__c: '',
                    Credit_Balance_Recovery_Services_Status__c: '',
                    Third_Party_Liability_Recovery_Subro_R__c: '',
                    Third_Party_Liability_Recovery_Subro_S__c: '',
                    Third_Party_Liability_Recovery_ICC_Rat__c: '',
                    Third_Party_Liability_Recovery_ICC_Sta__c: '',
                    Advanced_Analytic_and_Recovery_Service_R__c: '',
                    Advanced_Analytic_and_Recovery_Service_S__c: '',
                    Claims_Tracking_and_Validation_CTV_Rt__c: '',
                    Claims_Tracking_and_Validation_CTV_St__c: '',
                    Hospital_Bill_Audit_Optum__c: '',
                    Hospital_Bill_Audit_Optum_Status__c: '',
                    Hospital_Bill_Audit_Vendor_Rate__c: '',
                    Hospital_Bill_Audit_Vendor_Status__c: ''
                }
                break;

            case 'Simplified Non-Standard':
                this.renewalChecklistData.Pre_Pay_Rate__c = '';
                this.renewalChecklistData.Pre_Pay_Status__c = '';
                this.renewalChecklistData.Post_Pay_Rate__c = '';
                this.renewalChecklistData.Post_Pay_Status__c = '';
                this.renewalChecklistData.Subrogation_Rate__c = '';
                this.renewalChecklistData.Subrogation_Status__c = '';
                this.renewalChecklistData.Coordination_of_Benefits_Rate__c = '';
                this.renewalChecklistData.Coordination_of_Benefits_Status__c = '';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_Rt__c =  '';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_St__c = '';
                

                this.paymentIntegretyToBackend = {
                    Pre_Pay_Rate__c: '',
                    Pre_Pay_Status__c: '',
                    Post_Pay_Rate__c: '',
                    Post_Pay_Status__c: '',
                    Subrogation_Rate__c: '',
                    Subrogation_Status__c: '',
                    Coordination_of_Benefits_Rate__c: '',
                    Coordination_of_Benefits_Status__c: '',
                    Payment_Policy_Rate__c: '',
                    Payment_Policy_Status__c: '',
                    Prospective_Fraud_Abuse_Rate__c: '',
                    Prospective_Fraud_Abuse_Status__c: '',
                    Retrospective_Fraud_Abuse_Rate__c: '',
                    Retrospective_Fraud_Abuse_Status__c: '',
                    Enhanced_Fraud_Abuse_CCD_Rate__c: '',
                    Enhanced_Fraud_Abuse_CCD_Status__c: '',
                    EDC_Analyzer_Rate__c: '',
                    EDC_Analyzer_Status__c: '',
                    Itemized_Bill_Review_Rate__c: '',
                    Itemized_Bill_Review_Status__c: '',
                    Focused_Claim_Review_Rate__c: '',
                    Focused_Claim_Review_Status__c: '',
                    Hospital_Bill_Audit_Rate__c: '',
                    Hospital_Bill_Audit_Status__c: '',
                    Credit_Balance_Recovery_Services_Rate__c: '',
                    Credit_Balance_Recovery_Services_Status__c: '',
                    Third_Party_Liability_Recovery_Subro_R__c: '',
                    Third_Party_Liability_Recovery_Subro_S__c: '',
                    Third_Party_Liability_Recovery_ICC_Rat__c: '',
                    Third_Party_Liability_Recovery_ICC_Sta__c: '',
                    Advanced_Analytic_and_Recovery_Service_R__c: '',
                    Advanced_Analytic_and_Recovery_Service_S__c: '',
                    Claims_Tracking_and_Validation_CTV_Rt__c: '',
                    Claims_Tracking_and_Validation_CTV_St__c: '',
                    Hospital_Bill_Audit_Optum__c: '',
                    Hospital_Bill_Audit_Optum_Status__c: '',
                    Hospital_Bill_Audit_Vendor_Rate__c: '',
                    Hospital_Bill_Audit_Vendor_Status__c: ''
                }
                break;

            case 'Legacy Option 1':
                this.renewalChecklistData.Payment_Policy_Rate__c = 0.00;
                this.renewalChecklistData.Payment_Policy_Status__c = 'Included';
                this.renewalChecklistData.Coordination_of_Benefits_Rate__c = 0.00;
                this.renewalChecklistData.Coordination_of_Benefits_Status__c = 'COB Lite';
                this.renewalChecklistData.Prospective_Fraud_Abuse_Rate__c = 0.00;
                this.renewalChecklistData.Prospective_Fraud_Abuse_Status__c = 'Included';
                this.renewalChecklistData.Retrospective_Fraud_Abuse_Rate__c = 22.00;
                this.renewalChecklistData.Retrospective_Fraud_Abuse_Status__c = 'Included';
                this.renewalChecklistData.Enhanced_Fraud_Abuse_CCD_Rate__c = 22.00;
                this.renewalChecklistData.Enhanced_Fraud_Abuse_CCD_Status__c = 'Included';
                this.renewalChecklistData.EDC_Analyzer_Rate__c = 22.00;
                this.renewalChecklistData.EDC_Analyzer_Status__c = 'Included';
                this.renewalChecklistData.Itemized_Bill_Review_Rate__c = 22.00;
                this.renewalChecklistData.Itemized_Bill_Review_Status__c = 'Included';
                this.renewalChecklistData.Focused_Claim_Review_Rate__c = 22.00;
                this.renewalChecklistData.Focused_Claim_Review_Status__c = 'Included';
                this.renewalChecklistData.Hospital_Bill_Audit_Rate__c = 22.00;
                this.renewalChecklistData.Hospital_Bill_Audit_Status__c = 'Included';
                this.renewalChecklistData.Credit_Balance_Recovery_Services_Rate__c = 10.00;
                this.renewalChecklistData.Credit_Balance_Recovery_Services_Status__c = 'Included';
                this.renewalChecklistData.Third_Party_Liability_Recovery_Subro_R__c = 33.30;
                this.renewalChecklistData.Third_Party_Liability_Recovery_Subro_S__c = 'Included';
                this.renewalChecklistData.Third_Party_Liability_Recovery_ICC_Rat__c = 33.30;
                this.renewalChecklistData.Third_Party_Liability_Recovery_ICC_Sta__c = 'Included';
                this.renewalChecklistData.Advanced_Analytic_and_Recovery_Service_R__c = 24.00;
                this.renewalChecklistData.Advanced_Analytic_and_Recovery_Service_S__c = 'Included';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_Rt__c = '';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_St__c = '';

                this.paymentIntegretyToBackend = {
                    Pre_Pay_Rate__c: '',
                    Pre_Pay_Status__c: '',
                    Post_Pay_Rate__c: '',
                    Post_Pay_Status__c: '',
                    Subrogation_Rate__c: '',
                    Subrogation_Status__c: '',
                    Coordination_of_Benefits_Rate__c: '',
                    Coordination_of_Benefits_Status__c: '',
                    Payment_Policy_Rate__c: 0.00,
                    Payment_Policy_Status__c: 'Included',
                    Coordination_of_Benefits_Rate__c: 0.00,
                    Coordination_of_Benefits_Status__c: 'COB Lite',
                    Prospective_Fraud_Abuse_Rate__c: 0.00,
                    Prospective_Fraud_Abuse_Status__c: 'Included',
                    Retrospective_Fraud_Abuse_Rate__c: 22.00,
                    Retrospective_Fraud_Abuse_Status__c: 'Included',
                    Enhanced_Fraud_Abuse_CCD_Rate__c: 22.00,
                    Enhanced_Fraud_Abuse_CCD_Status__c: 'Included',
                    EDC_Analyzer_Rate__c: 22.00,
                    EDC_Analyzer_Status__c: 'Included',
                    Itemized_Bill_Review_Rate__c: 22.00,
                    Itemized_Bill_Review_Status__c: 'Included',
                    Focused_Claim_Review_Rate__c: 22.00,
                    Focused_Claim_Review_Status__c: 'Included',
                    Hospital_Bill_Audit_Rate__c: 22.00,
                    Hospital_Bill_Audit_Status__c: 'Included',
                    Credit_Balance_Recovery_Services_Rate__c: 10.00,
                    Credit_Balance_Recovery_Services_Status__c: 'Included',
                    Third_Party_Liability_Recovery_Subro_R__c: 33.30,
                    Third_Party_Liability_Recovery_Subro_S__c: 'Included',
                    Third_Party_Liability_Recovery_ICC_Rat__c: 33.30,
                    Third_Party_Liability_Recovery_ICC_Sta__c: 'Included',
                    Advanced_Analytic_and_Recovery_Service_R__c: 24.00,
                    Advanced_Analytic_and_Recovery_Service_S__c: 'Included',
                    Claims_Tracking_and_Validation_CTV_Rt__c: '',
                    Claims_Tracking_and_Validation_CTV_St__c: '',
                    Hospital_Bill_Audit_Optum__c: '',
                    Hospital_Bill_Audit_Optum_Status__c: '',
                    Hospital_Bill_Audit_Vendor_Rate__c: '',
                    Hospital_Bill_Audit_Vendor_Status__c: ''
                }
                break;
            case 'Legacy Option 2':
                this.renewalChecklistData.Payment_Policy_Rate__c = 0.00;
                this.renewalChecklistData.Payment_Policy_Status__c = 'Included';
                this.renewalChecklistData.Coordination_of_Benefits_Rate__c = 0.00;
                this.renewalChecklistData.Coordination_of_Benefits_Status__c = 'COB Lite';
                this.renewalChecklistData.Prospective_Fraud_Abuse_Rate__c = 30.00;
                this.renewalChecklistData.Prospective_Fraud_Abuse_Status__c = 'Included';
                this.renewalChecklistData.Retrospective_Fraud_Abuse_Rate__c = 30.00;
                this.renewalChecklistData.Retrospective_Fraud_Abuse_Status__c = 'Included';
                this.renewalChecklistData.Enhanced_Fraud_Abuse_CCD_Rate__c = 30.00;
                this.renewalChecklistData.Enhanced_Fraud_Abuse_CCD_Status__c = 'Included';
                this.renewalChecklistData.EDC_Analyzer_Rate__c = 30.00;
                this.renewalChecklistData.EDC_Analyzer_Status__c = 'Included';
                this.renewalChecklistData.Itemized_Bill_Review_Rate__c = 30.00;
                this.renewalChecklistData.Itemized_Bill_Review_Status__c = 'Included';
                this.renewalChecklistData.Focused_Claim_Review_Rate__c = 30.00;
                this.renewalChecklistData.Focused_Claim_Review_Status__c = 'Included';
                this.renewalChecklistData.Hospital_Bill_Audit_Rate__c = 30.00;
                this.renewalChecklistData.Hospital_Bill_Audit_Status__c = 'Included';
                this.renewalChecklistData.Credit_Balance_Recovery_Services_Rate__c = 30.00;
                this.renewalChecklistData.Credit_Balance_Recovery_Services_Status__c = 'Included';
                this.renewalChecklistData.Third_Party_Liability_Recovery_Subro_R__c = 33.30;
                this.renewalChecklistData.Third_Party_Liability_Recovery_Subro_S__c = 'Included';
                this.renewalChecklistData.Third_Party_Liability_Recovery_ICC_Rat__c = 33.30;
                this.renewalChecklistData.Third_Party_Liability_Recovery_ICC_Sta__c = 'Included';
                this.renewalChecklistData.Advanced_Analytic_and_Recovery_Service_R__c = 30.00;
                this.renewalChecklistData.Advanced_Analytic_and_Recovery_Service_S__c = 'Included';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_Rt__c = 0;
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_St__c = 'Included';

                this.paymentIntegretyToBackend = {
                    Pre_Pay_Rate__c: '',
                    Pre_Pay_Status__c: '',
                    Post_Pay_Rate__c: '',
                    Post_Pay_Status__c: '',
                    Subrogation_Rate__c: '',
                    Subrogation_Status__c: '',
                    Coordination_of_Benefits_Rate__c: '',
                    Coordination_of_Benefits_Status__c: '',
                    Payment_Policy_Rate__c: 0.00,
                    Payment_Policy_Status__c: 'Included',
                    Coordination_of_Benefits_Rate__c: 0.00,
                    Coordination_of_Benefits_Status__c: 'COB Lite',
                    Prospective_Fraud_Abuse_Rate__c: 30.00,
                    Prospective_Fraud_Abuse_Status__c: 'Included',
                    Retrospective_Fraud_Abuse_Rate__c: 30.00,
                    Retrospective_Fraud_Abuse_Status__c: 'Included',
                    Enhanced_Fraud_Abuse_CCD_Rate__c: 30.00,
                    Enhanced_Fraud_Abuse_CCD_Status__c: 'Included',
                    EDC_Analyzer_Rate__c: 30.00,
                    EDC_Analyzer_Status__c: 'Included',
                    Itemized_Bill_Review_Rate__c: 30.00,
                    Itemized_Bill_Review_Status__c: 'Included',
                    Focused_Claim_Review_Rate__c: 30.00,
                    Focused_Claim_Review_Status__c: 'Included',
                    Hospital_Bill_Audit_Rate__c: 30.00,
                    Hospital_Bill_Audit_Status__c: 'Included',
                    Credit_Balance_Recovery_Services_Rate__c: 30.00,
                    Credit_Balance_Recovery_Services_Status__c: 'Included',
                    Third_Party_Liability_Recovery_Subro_R__c: 33.30,
                    Third_Party_Liability_Recovery_Subro_S__c: 'Included',
                    Third_Party_Liability_Recovery_ICC_Rat__c: 33.30,
                    Third_Party_Liability_Recovery_ICC_Sta__c: 'Included',
                    Advanced_Analytic_and_Recovery_Service_R__c: 30.00,
                    Advanced_Analytic_and_Recovery_Service_S__c: 'Included',
                    Claims_Tracking_and_Validation_CTV_Rt__c: 0,
                    Claims_Tracking_and_Validation_CTV_St__c: 'Included',
                    Hospital_Bill_Audit_Optum__c: '',
                    Hospital_Bill_Audit_Optum_Status__c: '',
                    Hospital_Bill_Audit_Vendor_Rate__c: '',
                    Hospital_Bill_Audit_Vendor_Status__c: ''
                }
                break;
            case 'Legacy Option 3':
                this.renewalChecklistData.Payment_Policy_Rate__c = 0.00;
                this.renewalChecklistData.Payment_Policy_Status__c = 'Included';
                this.renewalChecklistData.Coordination_of_Benefits_Rate__c = 30.00;
                this.renewalChecklistData.Coordination_of_Benefits_Status__c = 'Enhanced COB';
                this.renewalChecklistData.Prospective_Fraud_Abuse_Rate__c = 30.00;
                this.renewalChecklistData.Prospective_Fraud_Abuse_Status__c = 'Included';
                this.renewalChecklistData.Retrospective_Fraud_Abuse_Rate__c = 30.00;
                this.renewalChecklistData.Retrospective_Fraud_Abuse_Status__c = 'Included';
                this.renewalChecklistData.Enhanced_Fraud_Abuse_CCD_Rate__c = 30.00;
                this.renewalChecklistData.Enhanced_Fraud_Abuse_CCD_Status__c = 'Included';
                this.renewalChecklistData.EDC_Analyzer_Rate__c = 30.00;
                this.renewalChecklistData.EDC_Analyzer_Status__c = 'Included';
                this.renewalChecklistData.Itemized_Bill_Review_Rate__c = 30.00;
                this.renewalChecklistData.Itemized_Bill_Review_Status__c = 'Included';
                this.renewalChecklistData.Focused_Claim_Review_Rate__c = 30.00;
                this.renewalChecklistData.Focused_Claim_Review_Status__c = 'Included';
                this.renewalChecklistData.Hospital_Bill_Audit_Rate__c = 30.00;
                this.renewalChecklistData.Hospital_Bill_Audit_Status__c = 'Included';
                this.renewalChecklistData.Credit_Balance_Recovery_Services_Rate__c = 30.00;
                this.renewalChecklistData.Credit_Balance_Recovery_Services_Status__c = 'Included';
                this.renewalChecklistData.Third_Party_Liability_Recovery_Subro_R__c = 33.30;
                this.renewalChecklistData.Third_Party_Liability_Recovery_Subro_S__c = 'Included';
                this.renewalChecklistData.Third_Party_Liability_Recovery_ICC_Rat__c = 33.30;
                this.renewalChecklistData.Third_Party_Liability_Recovery_ICC_Sta__c = 'Included';
                this.renewalChecklistData.Advanced_Analytic_and_Recovery_Service_R__c = 30.00;
                this.renewalChecklistData.Advanced_Analytic_and_Recovery_Service_S__c = 'Included';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_Rt__c = 0;
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_St__c = 'Included';

                this.paymentIntegretyToBackend = {
                    Pre_Pay_Rate__c: '',
                    Pre_Pay_Status__c: '',
                    Post_Pay_Rate__c: '',
                    Post_Pay_Status__c: '',
                    Subrogation_Rate__c: '',
                    Subrogation_Status__c: '',
                    Coordination_of_Benefits_Rate__c: '',
                    Coordination_of_Benefits_Status__c: '',
                    Payment_Policy_Rate__c: 0.00,
                    Payment_Policy_Status__c: 'Included',
                    Coordination_of_Benefits_Rate__c: 30.00,
                    Coordination_of_Benefits_Status__c: 'Enhanced COB',
                    Prospective_Fraud_Abuse_Rate__c: 30.00,
                    Prospective_Fraud_Abuse_Status__c: 'Included',
                    Retrospective_Fraud_Abuse_Rate__c: 30.00,
                    Retrospective_Fraud_Abuse_Status__c: 'Included',
                    Enhanced_Fraud_Abuse_CCD_Rate__c: 30.00,
                    Enhanced_Fraud_Abuse_CCD_Status__c: 'Included',
                    EDC_Analyzer_Rate__c: 30.00,
                    EDC_Analyzer_Status__c: 'Included',
                    Itemized_Bill_Review_Rate__c: 30.00,
                    Itemized_Bill_Review_Status__c: 'Included',
                    Focused_Claim_Review_Rate__c: 30.00,
                    Focused_Claim_Review_Status__c: 'Included',
                    Hospital_Bill_Audit_Rate__c: 30.00,
                    Hospital_Bill_Audit_Status__c: 'Included',
                    Credit_Balance_Recovery_Services_Rate__c: 30.00,
                    Credit_Balance_Recovery_Services_Status__c: 'Included',
                    Third_Party_Liability_Recovery_Subro_R__c: 33.30,
                    Third_Party_Liability_Recovery_Subro_S__c: 'Included',
                    Third_Party_Liability_Recovery_ICC_Rat__c: 33.30,
                    Third_Party_Liability_Recovery_ICC_Sta__c: 'Included',
                    Advanced_Analytic_and_Recovery_Service_R__c: 30.00,
                    Advanced_Analytic_and_Recovery_Service_S__c: 'Included',
                    Claims_Tracking_and_Validation_CTV_Rt__c: 0,
                    Claims_Tracking_and_Validation_CTV_St__c: 'Included',
                    Hospital_Bill_Audit_Optum__c: '',
                    Hospital_Bill_Audit_Optum_Status__c: '',
                    Hospital_Bill_Audit_Vendor_Rate__c: '',
                    Hospital_Bill_Audit_Vendor_Status__c: ''
                }
                break;
            case 'Legacy Non-Standard':

                this.renewalChecklistData.Payment_Policy_Rate__c = 0.00;
                this.renewalChecklistData.Payment_Policy_Status__c = 'Included';
                this.renewalChecklistData.Coordination_of_Benefits_Rate__c = '';
                this.renewalChecklistData.Coordination_of_Benefits_Status__c = '';
                this.renewalChecklistData.Prospective_Fraud_Abuse_Rate__c = '';
                this.renewalChecklistData.Prospective_Fraud_Abuse_Status__c = 'Included';
                this.renewalChecklistData.Retrospective_Fraud_Abuse_Rate__c = '';
                this.renewalChecklistData.Retrospective_Fraud_Abuse_Status__c = 'Included';
                this.renewalChecklistData.Enhanced_Fraud_Abuse_CCD_Rate__c = '';
                this.renewalChecklistData.Enhanced_Fraud_Abuse_CCD_Status__c = '';
                this.renewalChecklistData.EDC_Analyzer_Rate__c = '';
                this.renewalChecklistData.EDC_Analyzer_Status__c = 'Included';
                this.renewalChecklistData.Itemized_Bill_Review_Rate__c = '';
                this.renewalChecklistData.Itemized_Bill_Review_Status__c = '';
                this.renewalChecklistData.Focused_Claim_Review_Rate__c = '';
                this.renewalChecklistData.Focused_Claim_Review_Status__c = '';
                this.renewalChecklistData.Hospital_Bill_Audit_Rate__c = '';
                this.renewalChecklistData.Hospital_Bill_Audit_Status__c = 'Included';
                this.renewalChecklistData.Credit_Balance_Recovery_Services_Rate__c = '';
                this.renewalChecklistData.Credit_Balance_Recovery_Services_Status__c = 'Included';
                this.renewalChecklistData.Third_Party_Liability_Recovery_Subro_R__c = '';
                this.renewalChecklistData.Third_Party_Liability_Recovery_Subro_S__c = '';
                this.renewalChecklistData.Third_Party_Liability_Recovery_ICC_Rat__c = '';
                this.renewalChecklistData.Third_Party_Liability_Recovery_ICC_Sta__c = '';
                this.renewalChecklistData.Advanced_Analytic_and_Recovery_Service_R__c = '';
                this.renewalChecklistData.Advanced_Analytic_and_Recovery_Service_S__c = '';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_Rt__c = '';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_St__c = '';
                this.renewalChecklistData.Hospital_Bill_Audit_Optum__c = '';
                this.renewalChecklistData.Hospital_Bill_Audit_Optum_Status__c = '';
                this.renewalChecklistData.Hospital_Bill_Audit_Vendor_Rate__c = '';
                this.renewalChecklistData.Hospital_Bill_Audit_Vendor_Status__c = '';

                this.paymentIntegretyToBackend = {
                    Pre_Pay_Rate__c: '',
                    Pre_Pay_Status__c: '',
                    Post_Pay_Rate__c: '',
                    Post_Pay_Status__c: '',
                    Subrogation_Rate__c: '',
                    Subrogation_Status__c: '',
                    Coordination_of_Benefits_Rate__c: '',
                    Coordination_of_Benefits_Status__c: '',
                    Payment_Policy_Rate__c: 0.00,
                    Payment_Policy_Status__c: 'Included',
                    Coordination_of_Benefits_Rate__c: '',
                    Coordination_of_Benefits_Status__c: '',
                    Prospective_Fraud_Abuse_Rate__c: '',
                    Prospective_Fraud_Abuse_Status__c: 'Included',
                    Retrospective_Fraud_Abuse_Rate__c: '',
                    Retrospective_Fraud_Abuse_Status__c: 'Included',
                    Enhanced_Fraud_Abuse_CCD_Rate__c: '',
                    Enhanced_Fraud_Abuse_CCD_Status__c: '',
                    EDC_Analyzer_Rate__c: '',
                    EDC_Analyzer_Status__c: 'Included',
                    Itemized_Bill_Review_Rate__c: '',
                    Itemized_Bill_Review_Status__c: '',
                    Focused_Claim_Review_Rate__c: '',
                    Focused_Claim_Review_Status__c: '',
                    Hospital_Bill_Audit_Rate__c: '',
                    Hospital_Bill_Audit_Status__c: 'Included',
                    Credit_Balance_Recovery_Services_Rate__c: '',
                    Credit_Balance_Recovery_Services_Status__c: 'Included',
                    Third_Party_Liability_Recovery_Subro_R__c: '',
                    Third_Party_Liability_Recovery_Subro_S__c: '',
                    Third_Party_Liability_Recovery_ICC_Rat__c: '',
                    Third_Party_Liability_Recovery_ICC_Sta__c: '',
                    Advanced_Analytic_and_Recovery_Service_R__c: '',
                    Advanced_Analytic_and_Recovery_Service_S__c: '',
                    Claims_Tracking_and_Validation_CTV_Rt__c: '',
                    Claims_Tracking_and_Validation_CTV_St__c: '',
                    Hospital_Bill_Audit_Optum__c: '',
                    Hospital_Bill_Audit_Optum_Status__c: '',
                    Hospital_Bill_Audit_Vendor_Rate__c: '',
                    Hospital_Bill_Audit_Vendor_Status__c: ''
                }
                break;
        }
        console.log('this.paymentIntegretyToBackend = ', this.paymentIntegretyToBackend);
    }

    handlePaymentIntegrity(event) {
        this.renewalChecklistData = JSON.parse(JSON.stringify(this.renewalChecklistData));
        this.isEdit = true;
        const validationButton = new CustomEvent('hidevalidation', { detail: true});
        this.dispatchEvent(validationButton);
    }

    handleCancel(event) {
        const cancelEvent = new CustomEvent('canceledit', { detail: {cancel : true, showValidation: false} });
        this.dispatchEvent(cancelEvent);
        this.isEdit = false;
    }

    handleSave(event) {
        const paymentIntegrity = new CustomEvent('paymentintegritydata', { detail: { renewalData: this.renewalChecklistData, dataToBackend: this.paymentIntegretyToBackend, showValidation: false } });
        this.dispatchEvent(paymentIntegrity);
        this.isEdit = false;
    }
}