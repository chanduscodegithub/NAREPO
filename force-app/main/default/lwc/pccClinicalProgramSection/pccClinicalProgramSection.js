import { LightningElement, api, wire, track } from 'lwc';
import Renewal_Checklist_Additional_Information_instruction from '@salesforce/label/c.Renewal_Checklist_Additional_Information_instruction';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import LightningConfirm from 'lightning/confirm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import PccObject from '@salesforce/schema/Renewal_Checklist__c';
import onePass from '@salesforce/schema/Renewal_Checklist__c.One_Pass_Subsidized__c';
import saveRenewalData from '@salesforce/apex/renewalChecklistCls.saveRenewalData';
import fetchChecklistMappings from '@salesforce/apex/ChecklistMetadataService.fetchChecklistMappings';
import getOtherBuyUpProducts from '@salesforce/apex/SoldChecklistHandler.getOtherBuyUpProducts';

export default class PccClinicalProgramSection extends LightningElement {

    @api hideEdit;
    @api policyNumbers;
    @api policyNames;
    @api existingProducts;
    @track renewalChecklistData;
    @track lastYearChecklist;
    clinicalPrgmToBackend = {};
    isEdit = false;
    @api extraOnePassValues;
    @api selectedSalesSeason;
    @api accId;
    @track productInfoMap = {};

    label = {
        Renewal_Checklist_Additional_Information_instruction
    };

    @api
    get renewalChecklistDataFromParent() {
        return this.renewalChecklistData;
    }
    set renewalChecklistDataFromParent(value) {
        this.renewalChecklistData = JSON.parse(JSON.stringify(value));
        this.setDefaultPicklistValues();
    }

     @api
    get lastYearRenewalChecklist() {
        return this.lastYearChecklist;
    }
    set lastYearRenewalChecklist(value) {
        this.lastYearChecklist = JSON.parse(JSON.stringify(value));
    }

    @track picklistValues = [
        { label: '', value: '' },
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    get picklistValuesOP() {
        return [
            { label: '', value: '' },
            { label: 'Yes - Sold', value: 'Yes - Sold' },
            { label: 'Yes - Retained', value: 'Yes - Retained' },
            { label: 'No - N/A', value: 'No - N/A' },
            { label: 'No - Term', value: 'No - Term' }
        ];
    }

    @wire(getObjectInfo, {
            objectApiName: PccObject
        })
        pccObjInfo;
    
    @wire(getPicklistValues, { recordTypeId: '$pccObjInfo.data.defaultRecordTypeId', fieldApiName: onePass })
        onePassData({ error, data }) {
            if (data) {
                let testPickListvalues = [];
                for (let i in data.values) {
                    if (data.values[i] !== undefined) {
                        if (i === '0') {
                            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                        }
                        testPickListvalues.push(data.values[i]);
                    }
                }
                this.extraOnePassValues = testPickListvalues;
            }
            else if (error) {
                console.log(error);
            }
        }

    connectedCallback(){
        this.existingProductscopy = this.existingProducts;
        this.getOtherBuyUpProductsInfo()
        .then(() => {
            this.loadChecklistMetadata();
        });        
    }

    getOtherBuyUpProductsInfo(){
            return getOtherBuyUpProducts({})
            .then(data => {
                if (data && data.length > 0) {
                    this.productInfoMap = {};
                    data.forEach(prod => {
                        this.productInfoMap[prod.ProductCode] = prod;
                    });
                } else {
                    this.productInfoMap = {};
                } 
                this.isLoading = false;
            })
            .catch(error => {
                console.log('error in getOtherBuyUpProducts  ---> ' + JSON.stringify(error));
                this.isLoading = false;
            })
        }

     async loadChecklistMetadata() {
            try {
                const mappings = await fetchChecklistMappings();
                this.productCodeChecklistMap = {};
                this.displayConfig = [];
        
                const sortedMappings = mappings
                    .slice() // copy to avoid modifying original
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        
                sortedMappings.forEach(m => {
                    if (m.productCode) {
                        this.productCodeChecklistMap[m.productCode] = m.fieldApiName;
                    }
                    this.displayConfig.push({
                        field: m.fieldApiName,
                        label: m.label,
                        yesNoOnly: m.yesNoOnly,
                        restrictSurestOptions: m.restrictSurestOptions,
                        restrictDirectContractOption: m.restrictDirectContractOption
                    });
                });
        
                this.setPCCFieldValues();
                this.prepareChecklistDisplayData();
        
            } catch (e) {
                console.error('Error loading checklist metadata:', e);
            }
        }
        

    setDefaultPicklistValues() {
        const defaultValue = 'Yes';
        const fieldsToDefault = [
            'Transplant_Resource_Services__c',
            'Utilization_Management__c',
            'Cancer_Guidance_Program_CPSurest__c',
            'BHU_Management_ABA_UM__c',
            'Surest_Case_Management_CM_CPSurest__c',
            'Specialty_Guidance_Program_CPSurest__c',
            'Optum_Physical_Health_Network__c',
            'Optum_Behavioral_Network__c'
        ];
    
        fieldsToDefault.forEach(field => {
            if (!this.renewalChecklistData[field]) {
                this.renewalChecklistData[field] = defaultValue;
            }
            if(!this.clinicalPrgmToBackend[field]) {
                this.clinicalPrgmToBackend[field] = defaultValue;
            }
        });
    }

    setPCCFieldValues() {
        const soldFields = new Set();
        const readOnlyFlags = {};
        const isDual = {};
        const productFieldValues = {};

        this.existingProductscopy.forEach(item => {
            let dispositionValid = ['Sold', 'Transfer In', 'Spin-Off'].includes(item.Disposition_Other_Buy_Up_Programs__c);
            let isNetPositive = item.Net_Results__c > 0;
            let buyupValid = ['Surest Only', 'Surest & UNET'].includes(item.Buyup_Product_Selection__c);

            if (item.ProductCode === 'TWS-REALAPL') {
                buyupValid = true;
                if(item.Opportunity.Disposition_Pharmacy__c == 'Sold'){
                    dispositionValid = true;
                }
            }
            const fieldName = this.productCodeChecklistMap[item.ProductCode];
            if (dispositionValid && buyupValid && isNetPositive) {
                if (fieldName) {
                    this.renewalChecklistData[fieldName] = 'Yes - Sold';
                    this.clinicalPrgmToBackend[fieldName] = 'Yes - Sold';
                    soldFields.add(fieldName);
                    readOnlyFlags[fieldName] = true;
                }
            }
        });

        Object.entries(this.productCodeChecklistMap).forEach(([productCode, fieldName]) => {
            const product = this.productInfoMap?.[productCode];
            const surestVal = product?.Surest_Applicable_Products__c;
            if (surestVal === 'Available for Surest only with UNET') {
                isDual[fieldName] = true;
            }
            productFieldValues[fieldName] = product?.Surest_Implementation_Lead_Time__c ;
        
        });
    
        // Preserve existing values and leave blanks editable
        Object.values(this.productCodeChecklistMap).forEach(fieldName => {
            if (!this.renewalChecklistData[fieldName] && !soldFields.has(fieldName)) {
                this.renewalChecklistData[fieldName] = ''; // blank, editable
            }
        });

        this.readOnlyFlags = readOnlyFlags;
        this.isDual = isDual;
        this.productFieldValues = productFieldValues;

        this.renewalChecklistData = {
            ...this.renewalChecklistData, 
            //Coronary_Artery_Disease_Management__c: this.renewalChecklistData?.Coronary_Artery_Disease_Management__c || 'No',
            Calm_Health__c: this.renewalChecklistData?.Calm_Health__c || 'Yes',
            CPW_2nd_MD__c: this.renewalChecklistData?.CPW_2nd_MD__c || ''
        };
        this.clinicalPrgmToBackend = {
            ...this.clinicalPrgmToBackend, 
            //Coronary_Artery_Disease_Management__c: this.clinicalPrgmToBackend?.Coronary_Artery_Disease_Management__c || 'No',
            Calm_Health__c: this.clinicalPrgmToBackend?.Calm_Health__c || 'Yes',
            CPW_2nd_MD__c: this.clinicalPrgmToBackend?.CPW_2nd_MD__c || ''
        };
        this.handleDefaultValuesSave(this.clinicalPrgmToBackend);
        this.prepareChecklistDisplayData();
        
    }

    handleDefaultValuesSave(dataToSave) {
            dataToSave['Sales_Season__c'] = this.selectedSalesSeason;
            saveRenewalData({ valuesToBackend: dataToSave, accId: this.accId, currentSS: this.selectedSalesSeason })
                .then((results) => {
                    this.isLoading = true;
                })
                .catch((error) => {
                    console.log('Error While Saving ---> ' + JSON.stringify(error));
                    this.isLoading = false;
                })
    }

    @track checklistDisplayData = [];

    prepareChecklistDisplayData() {
        this.checklistDisplayData = this.displayConfig.map(item => {
            const value = this.renewalChecklistData?.[item.field];
            const readonly = this.readOnlyFlags?.[item.field] || false;
            const isOnePass = item.field === 'One_Pass_Select__c';
            const showRelatedField = isOnePass && (value === 'Yes - Sold' || value === 'Yes - Retained');
            const relatedField = showRelatedField ? {
                value: this.renewalChecklistData?.One_Pass_Subsidized__c || '',
                name: 'One_Pass_Subsidized__c',
                readonly: this.readOnlyFlags?.One_Pass_Subsidized__c || false
            } : null;

            // const options = item.yesNoOnly
            //     ? [
            //         { label: '', value: '' },
            //         { label: 'Yes', value: 'Yes' },
            //         { label: 'No', value: 'No' }
            //     ]
            //     : this.picklistValuesOP;

            let options;

            if (item.restrictSurestOptions) {
                options = [
                    { label: '', value: '' },
                    { label: 'Yes - Direct with Surest', value: 'Yes - Direct with Surest' },
                    { label: 'No', value: 'No' }
                ];
            }
            else if (item.restrictDirectContractOption){
                options =  [
                    { label: '', value: '' },
                    { label: 'Yes - Sold', value: 'Yes - Sold' },
                    { label: 'Yes - Retained', value: 'Yes - Retained' },
                    { label: 'Yes - Direct Contract', value: 'Yes - Direct Contract'},
                    { label: 'No - N/A', value: 'No - N/A' },
                    { label: 'No - Term', value: 'No - Term' }
                ];
            }
            else if (item.yesNoOnly) {
                options = [
                    { label: '', value: '' },
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' }
                ];
            }
            else {
                options = this.picklistValuesOP;
            }
            
            const productValue = this.productFieldValues?.[item.field] || '';

            return {
                label: item.label,
                value,
                field: item.field,
                readonly,
                name: `${item.field}`,
                relatedField,
                lastYearValue: this.lastYearChecklist?.[item.field] || '',
                isDual: this.isDual?.[item.field] || false,
                options: options,
                productValue,
                labelClass : isOnePass && (value === 'Yes - Sold' || value === 'Yes - Retained') ? 'slds-col slds-size_1-of-6 slds-p-around_xx-small' : 'slds-col slds-size_2-of-6 slds-p-around_xx-small',
                mainClass : 'slds-col slds-size_1-of-6 slds-p-around_xx-small slds-text-align_center'
                //labelClass: isOnePass ? 'slds-col slds-size_2-of-4 slds-p-around_xx-small' : 'slds-col slds-size_3-of-4 slds-p-around_xx-small'
            };
        });
        
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant, // 'success', 'error', 'warning', 'info'
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    showCopyPopup = false;
    handleCopyCPW() {
        this.showCopyPopup = true;
    }
    confirmCopy(){
        this.showCopyPopup = false;
        
        this.renewalChecklistData = {
            ...this.renewalChecklistData,
            ...this.lastYearChecklist
        };

        this.clinicalPrgmToBackend = {
            ...this.clinicalPrgmToBackend,
            ...this.lastYearChecklist
        };

        this.setPCCFieldValues();

        this.showToast('Success', 'Last year data copied', 'success');
    }

    cancelCopy() {
        this.showCopyPopup = false;
    }

    handleChange(event) {
        
        let value = event.target.value;
        let fieldName = event.target.dataset.api;
        let clinicalPrgmObj = {};
        clinicalPrgmObj[event.target.dataset.api] = value;
        this.renewalChecklistData[event.target.dataset.api] = value;
        if (fieldName === 'One_Pass_Select__c') {
            this.renewalChecklistData.One_Pass_Subsidized__c = '';
            clinicalPrgmObj['One_Pass_Subsidized__c'] = '';
        }
        this.clinicalPrgmToBackend = { ...this.clinicalPrgmToBackend, ...clinicalPrgmObj };
        const itemToUpdate = this.checklistDisplayData.find(item => item.field === fieldName);
        if (itemToUpdate) {
            itemToUpdate.value = value;
        }
        this.prepareChecklistDisplayData();

    }

    handleCPW(event) {
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
        this.clinicalPrgmToBackend.CPW__c =true;
        const clinicalProgram = new CustomEvent('clinicalprogramdata', { detail: { renewalData: this.renewalChecklistData, dataToBackend: this.clinicalPrgmToBackend, showValidation: false } });
        this.dispatchEvent(clinicalProgram);
        this.isEdit = false;
    }

}