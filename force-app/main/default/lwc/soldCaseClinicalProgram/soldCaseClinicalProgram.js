import { LightningElement, track, api, wire } from "lwc";
import getAccountPolicyInfoSurest from '@salesforce/apex/SoldChecklistHandler.getAccountPolicyInfoSurest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import SccObject from '@salesforce/schema/Sold_Case_Checklist__c';
import onePass from '@salesforce/schema/Sold_Case_Checklist__c.One_Pass_Subsidized__c';
import UpdateClientData from '@salesforce/apex/SoldChecklistHandler.UpdateSoldCheckList';
import fetchChecklistMappings from '@salesforce/apex/ChecklistMetadataService.fetchChecklistMappings';
import getOtherBuyUpProducts from '@salesforce/apex/SoldChecklistHandler.getOtherBuyUpProducts';

export default class SoldCaseClinicalProgram extends LightningElement {

    @track activeSections = "Clinical Programs - Surest";
    @api editmode;
    @api opportunityFieldLabels;
    @api userTimeZone;
    @api opplineitems;
    @track soldCaseDataCopy;
    @track masterData;
    @track clinicalPrgmDetail;
    @track accRecordId;
    @track opplineitemcopy = [];
    @track policyInfoRec = '';
    @api extraOnePassValues;
    @track updatedSoldCaseData = {};
    @track productInfoMap = {};

    @api
    get soldCaseObjectData() {
        return soldCaseObjectData;
    }
    set soldCaseObjectData(value) {
        this.soldCaseDataCopy = Object.assign({}, value);
        this.setDefaultPicklistValues();
        this.loadChecklistMetadata();      
    }

    @api
    get checkdetail() {
        return this.masterData;
    }
    set checkdetail(value) {
        this.masterData = Object.assign({}, value);
        this.clinicalPrgmDetail = Object.assign({}, value);
    }

    get isDataReceived() {
        if (this.clinicalPrgmDetail !== undefined && this.opportunityFieldLabels !== undefined) {
          return true;
        }
        return false;
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
        objectApiName: SccObject
    })
    sccObjInfo;

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: onePass })
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

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;
    }

    connectedCallback(){
        this.accRecordId = this.masterData.Account.Id;
        this.opplineitemcopy = this.opplineitems;
        console.log('this.opplineitems in --- ' + JSON.stringify(this.opplineitems));
        this.setDefaultPicklistValues();
        this.getaccPolicyInfoSurest(); 
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
            this.productActiveMap = {};
    
            const sortedMappings = mappings
                .slice() // copy to avoid modifying original
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    
            sortedMappings.forEach(m => {
                if (m.productCode) {
                    this.productCodeChecklistMap[m.productCode] = m.fieldApiName;
                    this.productActiveMap[m.productCode] = m.isActive;
                }
                this.displayConfig.push({
                    field: m.fieldApiName,
                    label: m.label,
                    isActive: m.isActive,
                    yesNoOnly: m.yesNoOnly
                });
            });
    
            this.setSCCFieldValues();
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
            if (!this.soldCaseDataCopy[field]) {
                this.soldCaseDataCopy[field] = defaultValue;
            }
        });

    }

    setSCCFieldValues() {
        let editfielddetails = [];
        const updatedSoldCaseDataCopy = { ...this.soldCaseDataCopy };
        const readOnlyFlags = {};
        const isDual = {};

        if (Array.isArray(this.opplineitemcopy)) {
            this.opplineitemcopy.forEach(item => {
                const fieldName = this.productCodeChecklistMap[item.ProductCode];
                if (!fieldName) return;

                let isSold = ['Sold', 'Transfer In', 'Spin-Off'].includes(item.Disposition_Other_Buy_Up_Programs__c);
                let isSoldPharmacy = ['Sold', 'Transfer In', 'Spin-Off'].includes(item.Opportunity?.Disposition_Pharmacy__c); 
                let isSurest = ['Surest Only', 'Surest & UNET'].includes(item.Buyup_Product_Selection__c);

                if (item.ProductCode === 'TWS-REALAPL') {
                    isSurest = true;
                    if (isSoldPharmacy) {
                        isSold = true;
                    }
                }

                if (isSold && isSurest) {
                    updatedSoldCaseDataCopy[fieldName] = 'Yes - Sold';
                    editfielddetails.push({
                        fieldedited: `Sold_Case_Checklist__c.${fieldName}`,
                        fieldvalue: 'Yes - Sold'
                    });
                    readOnlyFlags[fieldName] = true;
                } else {
                    readOnlyFlags[fieldName] = false;
                }

                // const displayCfg = this.displayConfig.find(cfg => cfg.field === fieldName);
                // const isActiveCMDT = displayCfg?.isActive;
                // const existingValue = this.soldCaseDataCopy?.[fieldName];

                // // If CMDT says product is inactive
                // if (isActiveCMDT === false) {
                //     if (existingValue && existingValue !== "") {
                //         // Case 1: inactive + existing data → mark READ-ONLY
                //         readOnlyFlags[fieldName] = true;
                //     } else {
                //         // Case 2: inactive + NO existing data → UI will filter it out
                //         return; 
                //     }
                // }
            });
        }

        this.displayConfig.forEach(({ field }) => {
            if (!updatedSoldCaseDataCopy.hasOwnProperty(field)) {
                updatedSoldCaseDataCopy[field] = '';
            }
        });

        Object.entries(this.productCodeChecklistMap).forEach(([productCode, fieldName]) => {
            const product = this.productInfoMap?.[productCode];
            const surestVal = product?.Surest_Applicable_Products__c;
            if (surestVal === 'Available for Surest only with UNET') {
                isDual[fieldName] = true;
            }
        
        });

        updatedSoldCaseDataCopy.Coronary_Artery_Disease_Management__c ||= 'No';
        updatedSoldCaseDataCopy.Calm_Health__c ||= 'Yes';
        updatedSoldCaseDataCopy.CPW_2nd_MD__c ||= '';
        if(updatedSoldCaseDataCopy.One_Pass_Select__c == ''){
            updatedSoldCaseDataCopy.One_Pass_Subsidized__c = '';    
        }
        this.soldCaseDataCopy = updatedSoldCaseDataCopy;

        Object.entries(updatedSoldCaseDataCopy).forEach(([fieldName, value]) => {
            const alreadyIncluded = editfielddetails.some(e => e.fieldedited === `Sold_Case_Checklist__c.${fieldName}`);
            if (!alreadyIncluded) {
                editfielddetails.push({
                    fieldedited: `Sold_Case_Checklist__c.${fieldName}`,
                    fieldvalue: value
                });
            }
        });

        this.readOnlyFlags = readOnlyFlags;
        this.isDual = isDual;

        editfielddetails.forEach(item => {
            if (item.fieldedited.indexOf('Sold_Case_Checklist__c.') !== -1) {
                let cloneLookupRecord = Object.assign({}, this.updatedSoldCaseData);
                cloneLookupRecord[item.fieldedited.split('.')[1]] = item.fieldvalue;
                this.updatedSoldCaseData = cloneLookupRecord;
            }
        });

        setTimeout(() => {
            this.handleDefaultValueSave();
        }, 0);

        const ClientDetailRecord = new CustomEvent("progressvaluechange", {
            detail: editfielddetails
        });
        this.dispatchEvent(ClientDetailRecord);
    }

    handleDefaultValueSave(){
        UpdateClientData({
            Updateddata: null,
            accupdate: null,
            opplineitem: null,
            auditTrailListToInsert: null,
            updatedSoldCaseData: this.updatedSoldCaseData
        })
            .then(result => {
                if (result) {
                this.isLoading = false;
                }
            })
            .catch((error) => {
                if(error){
                console.log('Error While Saving ---> ' + JSON.stringify(error));
                this.isLoading = false;
                }
            });
    
    }

    @track checklistDisplayData = [];

    prepareChecklistDisplayData() {
        this.checklistDisplayData = this.displayConfig
        .filter(item => {
            const existingValue = this.soldCaseDataCopy?.[item.field];
            if (item.isActive === false && (!existingValue || existingValue === "")) {
                return false;
            }

            return true;
        })
        .map(item => {
            const isOnePass = item.field === 'One_Pass_Select__c';
            const mainValue = this.soldCaseDataCopy?.[item.field];
            let finalReadOnly = false;

            // 1️⃣ Inactive CMDT + existing data = READONLY
            if (item.isActive === false && mainValue !== "" && mainValue != null) {
                finalReadOnly = true;
            }
            // 2️⃣ Otherwise fall back to whatever setSCCFieldValues set
            else {
                finalReadOnly = this.readOnlyFlags?.[item.field] || false;
            }

            const showRelatedField = isOnePass && (mainValue === 'Yes - Sold' || mainValue === 'Yes - Retained');

            const relatedField = showRelatedField ? {
                value: this.soldCaseDataCopy?.One_Pass_Subsidized__c || '',
                name: 'Sold_Case_Checklist__c.One_Pass_Subsidized__c',
                readonly: this.readOnlyFlags?.One_Pass_Subsidized__c || false
            } : null;

            const options = item.yesNoOnly
                ? [
                    { label: '', value: '' },
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' }
                ]
                : this.picklistValuesOP;

            return {
                label: item.label,
                value: mainValue,
                field: item.field,
                readonly: finalReadOnly,
                name: `Sold_Case_Checklist__c.${item.field}`,
                relatedField,
                options: options,
                isDual: this.isDual?.[item.field] || false,
                labelClass: isOnePass && showRelatedField
                    ? 'slds-col slds-size_1-of-4 slds-p-around_xx-small'
                    : 'slds-col slds-size_2-of-4 slds-p-around_xx-small',
                mainClass: 'slds-col slds-size_1-of-4 slds-p-around_xx-small slds-text-align_right'
            };
        });
        
        console.log('Checklist display data (readonly check):', 
        this.checklistDisplayData.map(i => `${i.label}: ${i.readonly}`).join(', ')
        );
    }

    @track policyListSurestRec;
    @track policyNumbersSurest = '';
    @track policyNamesSurest = '';
    getaccPolicyInfoSurest(){
        getAccountPolicyInfoSurest({ accountId: this.accRecordId})
        .then(data => {
            let policyInfo = [];
            policyInfo = data.length > 0 ? data : '';
            this.policyInfoRec = policyInfo;
            if(this.policyInfoRec){
                let policyNumbers = [];
                let policyNames = [];
                for(let rec of this.policyInfoRec){
                    if (rec.Name) {
                        policyNumbers.push(rec.Name);
                    }
                    if (rec.Policy__c) {
                        policyNames.push(rec.Policy__c);
                    }
                }
                this.policyNumbersSurest = policyNumbers.join('; ');
                this.policyNamesSurest = policyNames.join('; ');
            }    
            this.isLoading = false;
        })
        .catch(error => {
            console.log('error in getaccPolicyInfoSurest  ---> ' + JSON.stringify(error));
            this.isLoading = false;
        })
    }


    FieldChangeHandler(event) {
        let editfielddetails;
        let choosenValue;
        let fieldApi;
        if (event.target.name.indexOf('Sold_Case_Checklist__c.') !== -1) {
            choosenValue = event.target.value;
            fieldApi = event.target.name.replace('Sold_Case_Checklist__c.', '');
            this.soldCaseDataCopy[fieldApi] = choosenValue;
            editfielddetails = [{
                fieldedited: event.target.name,
                fieldvalue: choosenValue
            }];
            if (fieldApi === 'One_Pass_Select__c') {
                this.soldCaseDataCopy.One_Pass_Subsidized__c = '';
                editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.One_Pass_Subsidized__c',
                    fieldvalue: ''
                });
            }
        }
        const itemToUpdate = this.checklistDisplayData.find(item => item.field === fieldApi);
        if (itemToUpdate) {
            itemToUpdate.value = choosenValue;
        }
        this.prepareChecklistDisplayData();
        const ClientDetailRecord = new CustomEvent("progressvaluechange", {
            detail: editfielddetails
        });
        this.dispatchEvent(ClientDetailRecord);

        //console.log('sccData in fieldChangeHandler '+JSON.stringify(this.soldCaseDataCopy));
    }

    @api
    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
        .reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity();
            return validSoFar && inputCmp.checkValidity();
        }, true);
        return allValid;
    }

}