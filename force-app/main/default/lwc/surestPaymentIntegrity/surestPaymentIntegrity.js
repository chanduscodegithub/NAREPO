/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 11-22-2024
 * @last modified by  : Spoorthy
**/
import { api,track,wire,LightningElement } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import SccObject from '@salesforce/schema/Sold_Case_Checklist__c';
import payInteg from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Payment_Integrity__c';

export default class SurestPaymentIntegrity extends LightningElement {

    @api soldCaseDataCopy;
    @api editmode;
    @api payIntegValues ;
    @api cmType;
    @api currentPayIntVal;
    @api showPayIntFields = false;
    @api option1234 = false;
    @api option5 = false;
    @api clientDataRecord;
    @track isCM = false;
    @track simplified123 = false;
    @track simplified1Only =false;
    // @track isdisbaledsimplified1Only =true;

    @track includedCarveOut = [
        { label: '', value: '' },
        { label: 'Included', value: 'Included' },
        { label: 'Carveout', value: 'Carveout' }
    ];

    @track enhancedCOB = [
        { label: '', value: '' },
        { label: 'COB Lite', value: 'COB Lite'},
        { label: 'Enhanced COB', value: 'Enhanced COB'}
    ]

    connectedCallback() {

        this.currentPayIntVal = this.soldCaseDataCopy['Surest_Payment_Integrity__c'];
        if (this.soldCaseDataCopy.Surest_Payment_Integrity__c === null || this.soldCaseDataCopy.Surest_Payment_Integrity__c === undefined ||
            this.soldCaseDataCopy.Surest_Payment_Integrity__c === '') {
            this.showPayIntFields = false;
        }
        else {
            this.showPayIntFields = true;
        }
        if (this.soldCaseDataCopy.Surest_Payment_Integrity__c == 'Simplified Option 1' ||
            this.soldCaseDataCopy.Surest_Payment_Integrity__c == 'Simplified Option 2' ||
            this.soldCaseDataCopy.Surest_Payment_Integrity__c == 'Simplified Option 3' ||
            this.soldCaseDataCopy.Surest_Payment_Integrity__c == 'Simplified Non-Standard') {
			this.option1234 = true;
            this.option5 = false;
            if( this.soldCaseDataCopy.Surest_Payment_Integrity__c == 'Simplified Non-Standard'){
                this.simplified123 = false;
            }else{
                this.simplified123 = true;
            }
            if( this.soldCaseDataCopy.Surest_Payment_Integrity__c == 'Simplified Option 1'){
                this.simplified1Only = true;
                // this.isdisbaledsimplified1Only =false;
            }else{
                this.simplified1Only = false;
                // this.isdisbaledsimplified1Only =true;
            }
        }
        if (this.soldCaseDataCopy.Surest_Payment_Integrity__c == 'Surest Legacy') {
            this.option1234 = false;
            this.option5 = true;   
        }
    }

    @wire(getObjectInfo, {
        objectApiName: SccObject
    })
    sccObjInfo;

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: payInteg })
    payIntegData({ error, data }) {
        if (data) {
            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    if (this.cmType) {
                            testPickListvalues.push(data.values[i]);
                    } else{
                        if (data.values[i].label != 'Simplified Option 1' && data.values[i].label != 'Surest Legacy') {
                         testPickListvalues.push(data.values[i]);
                        }
                    }
                }

            }
            this.payIntegValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @track  editfielddetails = [];
    FieldChangeHandler(event) {
        if (event.target.name == 'Sold_Case_Checklist__c.Surest_Payment_Integrity__c') {
            if (event.target.value.length === 0) {
                this.showPayIntFields = false;
            }
            else {
                this.showPayIntFields = true;
            }

            if (event.target.value == 'Simplified Option 1' ||
                event.target.value == 'Simplified Option 2' || 
                event.target.value == 'Simplified Option 3' ||
                event.target.value == 'Simplified Non-Standard') {
                this.option1234 = true;
                this.option5 = false;   
            }
            if (event.target.value == 'Surest Legacy') {
                this.option1234 = false;
                this.option5 = true;   
            }
            //----------------PAYMENT INTEGRITY FINAL FEEDBACK----------------
            if (event.target.value == 'Simplified Option 1' || event.target.value == 'Simplified Option 2' || event.target.value == 'Simplified Option 3'
                || event.target.value == 'Simplified Non-Standard') {
                setTimeout(() => {
                    this.template.querySelectorAll('.refreshValueOnChangeSO').forEach(element => {
                        element.value = 'Included';
                    });
                    this.template.querySelector('.refreshValueOnChangeCB').value = 'COB Lite';
                }, 300);

                this.editfielddetails.push(
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Pre_Pay__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Post_Pay__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Coordination_of_Benefits__c',
                        fieldvalue: 'COB Lite'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_CTV_Audit__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_CTV_Audit_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Fraud_Waste_and_Abuse_Mgmt_prgrm__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Credit_Balance_Rcvry_Prgrm_Prcnt__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation_Services_Percentage__c',
                        fieldvalue: ''
                    });
            }
            if (event.target.value == 'Simplified Option 1' || event.target.value == 'Simplified Option 2' || event.target.value == 'Simplified Option 3') {
                this.simplified123 = true;
                setTimeout(() => {
                    this.template.querySelector('.prePay').value = '30.00';
                    this.template.querySelector('.postPay').value = '30.00';
                    this.template.querySelector('.subro').value = '33.30';
                    this.template.querySelector('.coOrdBenSO').value = '0.00';
                }, 300);
    
                this.editfielddetails.push({
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Pre_Pay_Percentage__c',
                        fieldvalue: '30.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Post_Pay_Percentage__c',
                        fieldvalue: '30.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation_Percentage__c',
                        fieldvalue: '33.30'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Coordination_of_Benefit_Percent__c',
                        fieldvalue: '0.00'
                    });
                }
                if (event.target.value == 'Simplified Option 1') {
                    this.simplified1Only = true;
                    setTimeout(() => {
                        this.template.querySelector('.prePay').value = '22.00';
                        this.template.querySelector('.postPay').value = '22.00';
                    }, 300);
        
                    this.editfielddetails.push({
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Pre_Pay_Percentage__c',
                            fieldvalue: '22.00'
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Post_Pay_Percentage__c',
                            fieldvalue: '22.00'
                        });
                }else{
                    this.simplified1Only = false;
                }
                if (event.target.value == 'Simplified Option 3') {
                    setTimeout(() => {
                        this.template.querySelector('.coOrdBenSO').value = '30.00';
                        this.template.querySelector('.refreshValueOnChangeCB').value = 'Enhanced COB';
                    }, 300);
                    this.editfielddetails.push({
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Coordination_of_Benefit_Percent__c',
                        fieldvalue: '30.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Coordination_of_Benefits__c',
                        fieldvalue: 'Enhanced COB'
                    });
                }
                if (event.target.value == 'Simplified Non-Standard') {
                    this.simplified123 = false;
                    setTimeout(() => {
                        this.template.querySelector('.prePay').value = '';
                        this.template.querySelector('.postPay').value = '';
                        this.template.querySelector('.subro').value = '';
                        this.template.querySelector('.coOrdBenSO').value = '';
                        this.template.querySelector('.claimTrk').value = '';
                        this.template.querySelector('.refreshValueOnChangeCB').value = '';
                        this.template.querySelectorAll('.refreshValueOnChangeSO').forEach(element => {
                            element.value = '';
                        });
                    }, 300);
                    this.editfielddetails.push({
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Pre_Pay_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Post_Pay_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Coordination_of_Benefit_Percent__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_CTV_Audit_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_CTV_Audit__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Pre_Pay__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Post_Pay__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Coordination_of_Benefits__c',
                        fieldvalue: ''
                    });
                }
                if (event.target.value == 'Surest Legacy') {
                    this.simplified123 = false;
                    setTimeout(() => {
                        this.template.querySelector('.fwamp').value = '';
                        this.template.querySelector('.cbrp').value = '';
                        this.template.querySelector('.coOrdBen').value = '';
                        this.template.querySelector('.subroSP').value = '';
                    }, 300);
                    this.editfielddetails.push({
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Fraud_Waste_and_Abuse_Mgmt_prgrm__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Credit_Balance_Rcvry_Prgrm_Prcnt__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Coordination_of_Benefit_Percent__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation_Services_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Pre_Pay__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Post_Pay__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Coordination_of_Benefits__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_CTV_Audit__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Pre_Pay_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Post_Pay_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Surest_CTV_Audit_Percentage__c',
                        fieldvalue: ''
                    });
                }
            
                if (event.target.value.length == 0) {
                    this.soldCaseDataCopy = {
                        ...this.soldCaseDataCopy,
                        Surest_Pre_Pay__c: '',
                        Surest_Post_Pay__c: '',
                        Surest_Subrogation__c: '',
                        Surest_Coordination_of_Benefits__c: '',
                        Surest_CTV_Audit__c: '',
                        Surest_Pre_Pay_Percentage__c: '',
                        Surest_Post_Pay_Percentage__c: '',
                        Surest_Subrogation_Percentage__c: '',
                        Surest_Coordination_of_Benefit_Percent__c: '',
                        Surest_CTV_Audit_Percentage__c: '',
                        Surest_Fraud_Waste_and_Abuse_Mgmt_prgrm__c: '',
                        Surest_Credit_Balance_Rcvry_Prgrm_Prcnt__c: '',
                        Surest_Subrogation_Services_Percentage__c: ''
                    };

                   this.editfielddetails.push({
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Pre_Pay__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Post_Pay__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Coordination_of_Benefits__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_CTV_Audit__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Pre_Pay_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Post_Pay_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Coordination_of_Benefit_Percent__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_CTV_Audit_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Fraud_Waste_and_Abuse_Mgmt_prgrm__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Credit_Balance_Rcvry_Prgrm_Prcnt__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Surest_Subrogation_Services_Percentage__c',
                            fieldvalue: ''
                        }
                    );
                } 

                this.currentPayIntVal = event.target.value;  
        }

                let selectedrecords = {};
                let selectedname = event.target.name;
                selectedrecords[selectedname] = event.target.value;
                this.Clientdatarecord = selectedrecords;

                this.editfielddetails.push({
                    fieldedited: event.target.name,
                    fieldvalue: event.target.value
                });
        
                const ClientDetailRecord = new CustomEvent("progressvaluechange", {
                    detail: this.editfielddetails
                });
                this.dispatchEvent(ClientDetailRecord);

    }
}