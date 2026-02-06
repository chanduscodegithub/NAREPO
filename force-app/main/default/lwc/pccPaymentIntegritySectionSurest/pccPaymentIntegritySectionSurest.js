import { LightningElement, wire, api, track } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import Renewal_Checklist from '@salesforce/schema/Renewal_Checklist__c';


import Payment_Integrity_Bundles_Surest from '@salesforce/schema/Renewal_Checklist__c.Payment_Integrity_Bundles_Surest__c';
import Surest_Coordination_of_Benefits_Status from '@salesforce/schema/Renewal_Checklist__c.Surest_Coordination_of_Benefits_Status__c';
import Surest_CTV_Audit_Status from '@salesforce/schema/Renewal_Checklist__c.Surest_CTV_Audit_Status__c';
import Surest_Post_Pay_Status from '@salesforce/schema/Renewal_Checklist__c.Surest_Post_Pay_Status__c';
import Surest_Pre_Pay_Status from '@salesforce/schema/Renewal_Checklist__c.Surest_Pre_Pay_Status__c';
import Surest_Subrogation_Status from '@salesforce/schema/Renewal_Checklist__c.Surest_Subrogation_Status__c';
import PCC_Payment_Integrity_Text from '@salesforce/label/c.PCC_Payment_Integrity_Text';

const simplifiedOptions = ['Simplified Option 1', 'Simplified Option 2', 'Simplified Option 3', 'Simplified Non-Standard'];
const legecyOptions = ['Surest Legacy'];


export default class PccPaymentIntegritySectionSurest extends LightningElement {
    @api hideEdit;
    paymentIntegBundlesOptions = [];
    prePayOptions = [];
    postPayOptions = [];
    subrogationOptions = [];
    coOrdinationOfBenifitsOptions = [];
    ctvAuditOptions = [];
    isSimplified = false;
    isLegecy = false;
    nonStandardOptions = false;
    @track renewalChecklistData;
    @track hideEditButton;
    paymentIntegretyToBackend = [];

    label = {
        PCC_Payment_Integrity_Text
    };
   
    @api
    get renewalChecklistDataFromParent() {
        return this.renewalChecklistData;
    }
    set renewalChecklistDataFromParent(value) {
        this.renewalChecklistData = JSON.parse(JSON.stringify(value));
        if (this.renewalChecklistData.hasOwnProperty('Payment_Integrity_Bundles_Surest__c')) {
            let field = this.renewalChecklistData.Payment_Integrity_Bundles_Surest__c;
            this.setLegecySImplifiedValue(field);
            this.paymentIntegrityDependency(field);
        }
        else {
            this.isLegecy = false;
            this.isSimplified = false;
        }
    }


    @wire(getObjectInfo, { objectApiName: Renewal_Checklist })
    renewalObjData;

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Payment_Integrity_Bundles_Surest })
    paymentIntegBundlesPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.paymentIntegBundlesOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            this.paymentIntegBundlesOptions.unshift('');
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Surest_Coordination_of_Benefits_Status })
    cobPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.coOrdinationOfBenifitsOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            this.coOrdinationOfBenifitsOptions.unshift('');
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Surest_CTV_Audit_Status })
    ctvPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.ctvAuditOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            this.ctvAuditOptions.unshift('');
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Surest_Post_Pay_Status })
    postPayPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.postPayOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            this.postPayOptions.unshift('');
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Surest_Pre_Pay_Status })
    prePayPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.prePayOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            this.prePayOptions.unshift('');
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Surest_Subrogation_Status })
    subrogationPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.subrogationOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
            this.subrogationOptions.unshift('');
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
        if (fieldName === 'Payment_Integrity_Bundles_Surest__c') {
            this.setLegecySImplifiedValue(value);
            this.paymentIntegrityDependency(value);
            this.autoPopulatePaymentIntegrity(value);
        }
        this.renewalChecklistData[event.target.dataset.api] = value;
        this.paymentIntegretyToBackend = { ...this.paymentIntegretyToBackend, ...paymentIntegretyObj };
        console.log('this.renewalChecklistData child = ', JSON.stringify(this.renewalChecklistData));
    }

    setLegecySImplifiedValue(fieldValue) {
        this.isSimplified = simplifiedOptions.includes(fieldValue) ? true : false;
        this.isLegecy = legecyOptions.includes(fieldValue) ? true : false;
    }

    paymentIntegrityDependency(value) {
        let nonStandard = ['Simplified Non-Standard', 'Legacy Non-Standard'];
        this.nonStandardOptions = nonStandard.includes(value) ? true : false;
    }

    handlePaymentIntegrity(event) {
        this.renewalChecklistData = JSON.parse(JSON.stringify(this.renewalChecklistData));
        this.isEdit = true;
        const validationButton = new CustomEvent('suresthidevalidation', { detail: true });
        this.dispatchEvent(validationButton);
    }

    handleCancel(event) {
        const cancelEvent = new CustomEvent('surestcanceledit', { detail: { cancel: true, showValidation: false } });
        this.dispatchEvent(cancelEvent);
        this.isEdit = false;
    }

    handleSave(event) {
        if(this.paymentIntegretyToBackend.length!=0){
           
        const paymentIntegrity = new CustomEvent('surestpaymentintegritydata', { detail: { renewalData: this.renewalChecklistData, dataToBackend: this.paymentIntegretyToBackend, showValidation: false } });
        this.dispatchEvent(paymentIntegrity);
        this.isEdit = false;
        }else{
            this.handleCancel();
        }
    }

    autoPopulatePaymentIntegrity(value) {
        switch (value) {
            case 'Simplified Option 1':
                this.renewalChecklistData.Surest_Pre_Pay_Rate__c = 22.00;
                this.renewalChecklistData.Surest_Pre_Pay_Status__c = 'Included';
                this.renewalChecklistData.Surest_Post_Pay_Rate__c = 22.00;
                this.renewalChecklistData.Surest_Post_Pay_Status__c = 'Included';
                this.renewalChecklistData.Surest_Subrogation_Rate__c = 33.30;
                this.renewalChecklistData.Surest_Subrogation_Status__c = 'Included';
                this.renewalChecklistData.Surest_Coordination_of_Benefits_Rate__c = 0.00;
                this.renewalChecklistData.Surest_Coordination_of_Benefits_Status__c = 'COB Lite';
                this.renewalChecklistData.Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c = '';
                this.renewalChecklistData.Surest_Credit_Balance_Recovery_Prgm_Rate__c = '';
                this.renewalChecklistData.Surest_Subrogation_Services_Rate__c = '';
                this.renewalChecklistData.Surest_CTV_Audit_Rate__c = '';
                this.renewalChecklistData.Surest_CTV_Audit_Status__c = '';

                this.paymentIntegretyToBackend = {
                    Surest_Pre_Pay_Rate__c: 22,
                    Surest_Pre_Pay_Status__c: 'Included',
                    Surest_Post_Pay_Rate__c: 22,
                    Surest_Post_Pay_Status__c: 'Included',
                    Surest_Subrogation_Rate__c: 33.3,
                    Surest_Subrogation_Status__c: 'Included',
                    Surest_Coordination_of_Benefits_Rate__c: 0,
                    Surest_Coordination_of_Benefits_Status__c: 'COB Lite',
                    Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c: '',
                    Surest_Credit_Balance_Recovery_Prgm_Rate__c: '',
                    Surest_Subrogation_Services_Rate__c: '',
                    Surest_CTV_Audit_Rate__c: '',
                    Surest_CTV_Audit_Status__c: ''
                }
                break;
            case 'Simplified Option 2':
                this.renewalChecklistData.Surest_Pre_Pay_Rate__c = 30.00;
                this.renewalChecklistData.Surest_Pre_Pay_Status__c = 'Included';
                this.renewalChecklistData.Surest_Post_Pay_Rate__c = 30.00;
                this.renewalChecklistData.Surest_Post_Pay_Status__c = 'Included';
                this.renewalChecklistData.Surest_Subrogation_Rate__c = 33.30;
                this.renewalChecklistData.Surest_Subrogation_Status__c = 'Included';
                this.renewalChecklistData.Surest_Coordination_of_Benefits_Rate__c = 0.00;
                this.renewalChecklistData.Surest_Coordination_of_Benefits_Status__c = 'COB Lite';
                this.renewalChecklistData.Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c = '';
                this.renewalChecklistData.Surest_Credit_Balance_Recovery_Prgm_Rate__c = '';
                this.renewalChecklistData.Surest_Subrogation_Services_Rate__c = '';
                this.renewalChecklistData.Surest_CTV_Audit_Rate__c = '';
                this.renewalChecklistData.Surest_CTV_Audit_Status__c = '';

                this.paymentIntegretyToBackend = {
                    Claims_Tracking_and_Validation_CTV_Rt__c: '',
                    Claims_Tracking_and_Validation_CTV_St__c: '',
                    Surest_Pre_Pay_Rate__c: 30,
                    Surest_Pre_Pay_Status__c: 'Included',
                    Surest_Post_Pay_Rate__c: 30,
                    Surest_Post_Pay_Status__c: 'Included',
                    Surest_Subrogation_Rate__c: 33.3,
                    Surest_Subrogation_Status__c: 'Included',
                    Surest_Coordination_of_Benefits_Rate__c: 0,
                    Surest_Coordination_of_Benefits_Status__c: 'COB Lite',
                    Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c: '',
                    Surest_Credit_Balance_Recovery_Prgm_Rate__c: '',
                    Surest_Subrogation_Services_Rate__c: '',
                    Surest_CTV_Audit_Rate__c: '',
                    Surest_CTV_Audit_Status__c: ''
                }
                break;
            case 'Simplified Option 3':
                this.renewalChecklistData.Surest_Pre_Pay_Rate__c = 30.00;
                this.renewalChecklistData.Surest_Pre_Pay_Status__c = 'Included';
                this.renewalChecklistData.Surest_Post_Pay_Rate__c = 30.00;
                this.renewalChecklistData.Surest_Post_Pay_Status__c = 'Included';
                this.renewalChecklistData.Surest_Subrogation_Rate__c = 33.30;
                this.renewalChecklistData.Surest_Subrogation_Status__c = 'Included';
                this.renewalChecklistData.Surest_Coordination_of_Benefits_Rate__c = 30.00;
                this.renewalChecklistData.Surest_Coordination_of_Benefits_Status__c = 'Enhanced COB';
                this.renewalChecklistData.Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c = '';
                this.renewalChecklistData.Surest_Credit_Balance_Recovery_Prgm_Rate__c = '';
                this.renewalChecklistData.Surest_Subrogation_Services_Rate__c = '';
                this.renewalChecklistData.Surest_CTV_Audit_Rate__c = '';
                this.renewalChecklistData.Surest_CTV_Audit_Status__c = '';

                this.paymentIntegretyToBackend = {
                    Surest_Pre_Pay_Rate__c: 30,
                    Surest_Pre_Pay_Status__c: 'Included',
                    Surest_Post_Pay_Rate__c: 30,
                    Surest_Post_Pay_Status__c: 'Included',
                    Surest_Subrogation_Rate__c: 33.3,
                    Surest_Subrogation_Status__c: 'Included',
                    Surest_Coordination_of_Benefits_Rate__c: 30,
                    Surest_Coordination_of_Benefits_Status__c: 'Enhanced COB',
                    Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c: '',
                    Surest_Credit_Balance_Recovery_Prgm_Rate__c: '',
                    Surest_Subrogation_Services_Rate__c: '',
                    Surest_CTV_Audit_Rate__c: '',
                    Surest_CTV_Audit_Status__c: ''
                }
                break;

            case 'Simplified Non-Standard':
                this.renewalChecklistData.Surest_Pre_Pay_Rate__c = '';
                this.renewalChecklistData.Surest_Pre_Pay_Status__c = '';
                this.renewalChecklistData.Surest_Post_Pay_Rate__c = '';
                this.renewalChecklistData.Surest_Post_Pay_Status__c = '';
                this.renewalChecklistData.Surest_Subrogation_Rate__c = '';
                this.renewalChecklistData.Surest_Subrogation_Status__c = '';
                this.renewalChecklistData.Surest_Coordination_of_Benefits_Rate__c = '';
                this.renewalChecklistData.Surest_Coordination_of_Benefits_Status__c = '';
                this.renewalChecklistData.Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c = '';
                this.renewalChecklistData.Surest_Credit_Balance_Recovery_Prgm_Rate__c = '';
                this.renewalChecklistData.Surest_Subrogation_Services_Rate__c = '';
                this.renewalChecklistData.Surest_CTV_Audit_Rate__c = '';
                this.renewalChecklistData.Surest_CTV_Audit_Status__c = '';


                this.paymentIntegretyToBackend = {
                    Surest_Pre_Pay_Rate__c: '',
                    Surest_Pre_Pay_Status__c: '',
                    Surest_Post_Pay_Rate__c: '',
                    Surest_Post_Pay_Status__c: '',
                    Surest_Subrogation_Rate__c: '',
                    Surest_Subrogation_Status__c: '',
                    Surest_Coordination_of_Benefits_Rate__c: '',
                    Surest_Coordination_of_Benefits_Status__c: '',
                    Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c: '',
                    Surest_Credit_Balance_Recovery_Prgm_Rate__c: '',
                    Surest_Subrogation_Services_Rate__c: '',
                    Surest_CTV_Audit_Rate__c: '',
                    Surest_CTV_Audit_Status__c: ''
                }
                break;

            case 'Surest Legacy':
                this.renewalChecklistData.Surest_Pre_Pay_Rate__c = '';
                this.renewalChecklistData.Surest_Pre_Pay_Status__c = '';
                this.renewalChecklistData.Surest_Post_Pay_Rate__c = '';
                this.renewalChecklistData.Surest_Post_Pay_Status__c = '';
                this.renewalChecklistData.Surest_Subrogation_Rate__c = '';
                this.renewalChecklistData.Surest_Subrogation_Status__c = '';
                this.renewalChecklistData.Surest_Coordination_of_Benefits_Rate__c = '';
                this.renewalChecklistData.Surest_Coordination_of_Benefits_Status__c = '';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_Rt__c = '';
                this.renewalChecklistData.Claims_Tracking_and_Validation_CTV_St__c = '';
                this.renewalChecklistData.Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c = '';
                this.renewalChecklistData.Surest_Credit_Balance_Recovery_Prgm_Rate__c = '';
                this.renewalChecklistData.Surest_Subrogation_Services_Rate__c = '';
                this.renewalChecklistData.Surest_CTV_Audit_Rate__c = '';
                this.renewalChecklistData.Surest_CTV_Audit_Status__c = '';


                this.paymentIntegretyToBackend = {
                    Surest_Pre_Pay_Rate__c: '',
                    Surest_Pre_Pay_Status__c: '',
                    Surest_Post_Pay_Rate__c: '',
                    Surest_Post_Pay_Status__c: '',
                    Surest_Subrogation_Rate__c: '',
                    Surest_Subrogation_Status__c: '',
                    Surest_Coordination_of_Benefits_Rate__c: '',
                    Surest_Coordination_of_Benefits_Status__c: '',
                    Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c: '',
                    Surest_Credit_Balance_Recovery_Prgm_Rate__c: '',
                    Surest_Subrogation_Services_Rate__c: '',
                    Surest_CTV_Audit_Rate__c: '',
                    Surest_CTV_Audit_Status__c: ''
                }
                break;
        }
    }

}