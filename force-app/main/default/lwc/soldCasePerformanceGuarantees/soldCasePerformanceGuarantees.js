/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 11-08-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import SccObject from '@salesforce/schema/Sold_Case_Checklist__c';
import historicData from '@salesforce/schema/Sold_Case_Checklist__c.Historic_Data__c';

const OTHER_GUARANTEE_HEADING = 'Other Specialty Custom Guarantee';
const OTHER_GUARANTEE_REF = 'Other_Specialty_Custom_Guarantee';
const OTHER_GUARANTEE_WRITEIN = 'Othr_Spclty_Custm_Guarantee_Write_In';

const OTHER_GUARANTEE_MEDICAL_HEADING = 'Other Custom Guarantee';
const OTHER_GUARANTEE_MEDICAL_REF = 'Other_Custom_Medical_Guarantee';
const OTHER_GUARANTEE_MEDICAL_WRITEIN = 'Other_Custom_Guarantee_Write_In';

const OTHER_CUSTOM_CREDITS_HEADING = 'Other Custom Credit';
const OTHER_CUSTOM_CREDITS_REF = 'Other_Custom_Credit_Year';
const OTHER_CUSTOM_CREDITS_WRITEIN = 'Other_Custom_Credit_Write_In';



export default class soldCaseVendorPartners extends LightningElement {

    @track recordDetail;
    @api soldCaseCheckListInstructions;
    @api opportunityFieldLabels;
    @api accountFieldLabels;
    @api companyAddress;
    @api userTimeZone;
    @api completeDataFromParent;
    @track soldCaseDataCopy;
    @track historicDataValues;

    @api meddispValue;
    @api dentdispValue;
    @api otherProductsStatus;
    @api pharmdispValue;
    @api visiondispValue;

    @api medSold;
    @api dentSold;
    @api visSold;
    @api pharmSold;
    @api otherSold;

    @api isSurestProductMed;
    @api isTraditionalProductMed;
    @api isSurestProductPharmacy;
    @api isTraditionalProductPharmacy;
    @api medicalOrPhramaProdTrad;
    @api medicalOrPhramaProdSurest;

    @api medicalOrPhramaSold;
    @api dentVisOrBuyupSold;
    @api dentVisSold;
    disableButtons;
    hasRendered = false

    otherSpeciality = OTHER_GUARANTEE_REF
    otherMedical = OTHER_GUARANTEE_MEDICAL_REF
    otherCustomCreditsRef = OTHER_CUSTOM_CREDITS_REF

    otherMedicalWriteIn = OTHER_GUARANTEE_MEDICAL_WRITEIN;
    otherSpecialtyWriteIn = OTHER_GUARANTEE_WRITEIN;

    @api enableEdit;
    //@api disableButtons;

    //---------SAMARTH SCC NB UPGRADE 2023---------
    @api accCiHiHelpText;
    @api lifeDiHelpText;
    //---------SAMARTH SCC NB UPGRADE 2023---------


    @api
    async handleChange(updatedSoldCaseData) {
        let creditCmp = this.template.querySelector('c-sold-case-credits-and-allowances')
        if (creditCmp) {
            let updatedData = await creditCmp.generateParentData(updatedSoldCaseData);
            return updatedData;
        } else {
            return updatedSoldCaseData;
        }
    }

    @api
    async handleDataChange(updatedSoldCaseData) {
        let surestGuranteesCmp = this.template.querySelector('c-sold-case-guarantees-surest')
        if (surestGuranteesCmp) {
            let updatedData = await surestGuranteesCmp.generateParentData(updatedSoldCaseData);
            return updatedData;
        } else {
            return updatedSoldCaseData;
        }
    }

    @api
    get editmode() {
        return this.enableEdit
    }
    set editmode(value) {
        this.enableEdit = value;
        this.disableButtons = !value;
        console.log('enableEdit --- ' + this.enableEdit + '   disableButtons --- ' + this.disableButtons);
    }

     @track picklistValues = [
        { label: '', value: '' },
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    @track activeSections = [
        "Performance Guarantees and Credits/Allowances",
        "Guarantees - Traditional",
        "Guarantees - Surest",
        "Specialty Performance Guarantees",
        "Specialty Integration Guarantees",
        "Credits and Allowances - Traditional",
        "Credits and Allowances - Surest",
        "Specialty Credits & Allowances"
    ];
    @track otherCustomGuaranteeLst = [];
    @track otherCustomGuaranteeMedLst = [];
    @track otherCustomCreditsLst = [];

    @api
    get checkdetail() {
        return this.masterData;
    }
    set checkdetail(value) {
        this.masterData = Object.assign({}, value);
        this.recordDetail = Object.assign({}, value);
    }

    @api
    get soldCaseObjectData() {
        return soldCaseObjectData;
    }
    set soldCaseObjectData(value) {
        this.soldCaseDataCopy = Object.assign({}, value);

        this.otherCustomGuaranteeLst = [];
        this.otherCustomGuaranteeMedLst = [];
        this.otherCustomCreditsLst = [];

        this.otherCustomGuaranteeLst[0] = {
            showAddButton: true,
            showRemoveButton: false,
            rowHeading: OTHER_GUARANTEE_HEADING,
            mainField: this.soldCaseDataCopy['Other_Custom_Guarantee__c'],
            writeIn: this.soldCaseDataCopy['Othr_Spclty_Custm_Guarantee_Write_In__c']
        };

        this.otherCustomGuaranteeMedLst[0] = {
            showAddButton: true,
            showRemoveButton: false,
            rowHeading: OTHER_GUARANTEE_MEDICAL_HEADING,
            mainField: this.soldCaseDataCopy['Other_Custom_Guarantee_Medical__c'],
            writeIn: this.soldCaseDataCopy['Other_Custom_Guarantee_Write_In__c']
        };

        this.otherCustomCreditsLst[0] = {
            showAddButton: true,
            showRemoveButton: false,
            rowHeading: OTHER_CUSTOM_CREDITS_HEADING,
            year1: this.soldCaseDataCopy['Other_Custom_Credit_Year_1__c'],
            year2: this.soldCaseDataCopy['Other_Custom_Credit_Year_2__c'],
            year3: this.soldCaseDataCopy['Other_Custom_Credit_Year_3__c'],
            writeIn: this.soldCaseDataCopy['Other_Custom_Credit_Write_In__c']
        };


        for (let i = 1; i < 5; i++) {
            this.createGuaranteeRecords(i, OTHER_GUARANTEE_REF, true)
        }

        for (let i = 1; i < 5; i++) {
            this.createGuaranteeRecords(i, OTHER_GUARANTEE_MEDICAL_REF, true)
        }

        for (let i = 1; i < 5; i++) {
            this.createGuaranteeRecords(i, OTHER_CUSTOM_CREDITS_REF, true)
        }

    }

    createGuaranteeRecords(index, fieldReference, checkValue) {
        index = parseInt(index);
        let recordList;
        let writeInApi;
        let showButton = index < 4;

        if (fieldReference == OTHER_GUARANTEE_REF) {
            recordList = this.otherCustomGuaranteeLst;
            writeInApi = OTHER_GUARANTEE_WRITEIN;

            const fieldName = fieldReference + '_' + (index + 1) + '__c';
            const writeInName = writeInApi + '_' + (index + 1) + '__c';

            if (index == 0 || index > 4 || (checkValue && !this.soldCaseDataCopy[fieldName] && !this.soldCaseDataCopy[writeInName]))
                return;

            recordList[index] = {
                showAddButton: showButton,
                showRemoveButton: true,
                rowHeading: '',
                mainField: checkValue ? this.soldCaseDataCopy[fieldName] : '',
                writeIn: checkValue ? this.soldCaseDataCopy[writeInName] : ''
            };
        }
        else if (fieldReference == OTHER_GUARANTEE_MEDICAL_REF) {
            recordList = this.otherCustomGuaranteeMedLst;
            writeInApi = OTHER_GUARANTEE_MEDICAL_WRITEIN;

            const fieldName = fieldReference + '_' + (index + 1) + '__c';
            const writeInName = writeInApi + '_' + (index + 1) + '__c';

            if (index == 0 || index > 4 || (checkValue && !this.soldCaseDataCopy[fieldName] && !this.soldCaseDataCopy[writeInName]))
                return;

            recordList[index] = {
                showAddButton: showButton,
                showRemoveButton: true,
                rowHeading: '',
                mainField: checkValue ? this.soldCaseDataCopy[fieldName] : '',
                writeIn: checkValue ? this.soldCaseDataCopy[writeInName] : ''
            };
        }
        else if (fieldReference.includes(OTHER_CUSTOM_CREDITS_REF)) {
            recordList = this.otherCustomCreditsLst;
            writeInApi = OTHER_CUSTOM_CREDITS_WRITEIN;

            const year1FieldName = fieldReference + '_1_' + (index + 1) + '__c';
            const year2FieldName = fieldReference + '_2_' + (index + 1) + '__c';
            const year3FieldName = fieldReference + '_3_' + (index + 1) + '__c';
            const writeInName = writeInApi + '_' + (index + 1) + '__c';

            if (index == 0 || index > 4 || (checkValue && !this.soldCaseDataCopy[year1FieldName] && !this.soldCaseDataCopy[year2FieldName]
                && !this.soldCaseDataCopy[year3FieldName] && !this.soldCaseDataCopy[writeInName] && !this.soldCaseDataCopy[writeInName])) {
                return;
            }

            recordList[index] = {
                showAddButton: showButton,
                showRemoveButton: true,
                rowHeading: '',
                year1: checkValue ? this.soldCaseDataCopy[year1FieldName] : '',
                year2: checkValue ? this.soldCaseDataCopy[year2FieldName] : '',
                year3: checkValue ? this.soldCaseDataCopy[year3FieldName] : '',
                writeIn: checkValue ? this.soldCaseDataCopy[writeInName] : ''
            };
        }

        if (recordList[index - 1]) {
            recordList[index - 1].showAddButton = false;
        }
        recordList[0].showRemoveButton = true;
    }

    handleDynamicInputChange(event) {

        const index = parseInt(event.currentTarget.dataset.index);
        const fieldReference = event.currentTarget.dataset.fieldreference;
        const value = event.currentTarget.value;
        const type = event.currentTarget.dataset.type;
        console.log('index', index)
        console.log('fieldReference', fieldReference)
        console.log('value', value)
        console.log('type', type)
        let recordList;

        if (fieldReference == OTHER_GUARANTEE_REF) {
            recordList = this.otherCustomGuaranteeLst;
        } else if (fieldReference == OTHER_GUARANTEE_MEDICAL_REF) {
            recordList = this.otherCustomGuaranteeMedLst;
        } else if (fieldReference == OTHER_CUSTOM_CREDITS_REF) {
            recordList = this.otherCustomCreditsLst;
        }
        recordList[index][type] = value
        console.dir(recordList)
    }

    addGuaranteeFunction(event) {
        let index = parseInt(event.currentTarget.dataset.buttonindex) + 1;
        let fieldreference = event.currentTarget.dataset.fieldreference;
        this.createGuaranteeRecords(index, fieldreference);
    }

    deleteGuaranteeFunction(event) {
        let index = parseInt(event.currentTarget.dataset.buttonindex);
        let fieldreference = event.currentTarget.dataset.fieldreference;

        if (fieldreference == OTHER_GUARANTEE_REF) {
            this.rearrangeArray(this.otherCustomGuaranteeLst, OTHER_GUARANTEE_HEADING, index, OTHER_GUARANTEE_REF)
        }
        else if (fieldreference == OTHER_GUARANTEE_MEDICAL_REF) {
            this.rearrangeArray(this.otherCustomGuaranteeMedLst, OTHER_GUARANTEE_MEDICAL_HEADING, index, OTHER_GUARANTEE_MEDICAL_REF)
        }
        else if (fieldreference == OTHER_CUSTOM_CREDITS_REF) {
            this.rearrangeArray(this.otherCustomCreditsLst, OTHER_CUSTOM_CREDITS_HEADING, index, OTHER_CUSTOM_CREDITS_REF)
        }

    }

    rearrangeArray(listToUpdate, heading, index, fieldReferene) {
        listToUpdate.splice(index, 1)
        listToUpdate[listToUpdate.length - 1].showAddButton = true;
        listToUpdate[0].rowHeading = heading
        listToUpdate[0].showRemoveButton = listToUpdate.length > 1
    }

    async updateSoldCaseList(fieldreference, updatedSoldCaseData) {

        let firstElement;
        let firstWriteIn;
        let mainFieldRef;
        let writeInRef;
        let referenceList;

        if (fieldreference == OTHER_GUARANTEE_REF) {
            firstElement = 'Other_Custom_Guarantee__c';
            firstWriteIn = 'Othr_Spclty_Custm_Guarantee_Write_In__c'
            mainFieldRef = OTHER_GUARANTEE_REF
            writeInRef = OTHER_GUARANTEE_WRITEIN
            referenceList = this.otherCustomGuaranteeLst
            console.log(OTHER_GUARANTEE_REF)
            console.dir(referenceList)
        }
        else if (fieldreference == OTHER_GUARANTEE_MEDICAL_REF) {
            firstElement = 'Other_Custom_Guarantee_Medical__c';
            firstWriteIn = 'Other_Custom_Guarantee_Write_In__c'
            mainFieldRef = OTHER_GUARANTEE_MEDICAL_REF
            writeInRef = OTHER_GUARANTEE_MEDICAL_WRITEIN
            referenceList = this.otherCustomGuaranteeMedLst

        }

        let maxElement = 5;
        let previousIndex = 0;
        referenceList.forEach(element => {
            if (element.mainField || element.writeIn) {
                let mainField = previousIndex == 0 ? firstElement : mainFieldRef + '_' + (previousIndex + 1) + '__c';
                let writeIn = previousIndex == 0 ? firstWriteIn : writeInRef + '_' + (previousIndex + 1) + '__c';
                updatedSoldCaseData[mainField] = element.mainField;
                updatedSoldCaseData[writeIn] = element.writeIn;
                previousIndex++;
            }
        })

        for (let i = previousIndex; i < maxElement; i++) {
            let mainField = mainFieldRef + '_' + (i + 1) + '__c'
            let writeIn = writeInRef + '_' + (i + 1) + '__c'
            updatedSoldCaseData[mainField] = ''
            updatedSoldCaseData[writeIn] = ''

        }

        return updatedSoldCaseData;
    }

    async updateSoldCaseListCustomCredit(updatedSoldCaseData) {

        const firstYear1Field = 'Other_Custom_Credit_Year_1__c'
        const firstYear2Field = 'Other_Custom_Credit_Year_2__c'
        const firstYear3Field = 'Other_Custom_Credit_Year_3__c'
        const firstWriteIn = 'Other_Custom_Credit_Write_In__c'


        let maxElement = 5;
        let previousIndex = 0;
        this.otherCustomCreditsLst.forEach(element => {
            if (element.mainField || element.writeIn) {
                let year1 = previousIndex == 0 ? firstYear1Field : OTHER_CUSTOM_CREDITS_REF + '_1_' + (previousIndex + 1) + '__c';
                let year2 = previousIndex == 0 ? firstYear2Field : OTHER_CUSTOM_CREDITS_REF + '_2_' + (previousIndex + 1) + '__c';
                let year3 = previousIndex == 0 ? firstYear3Field : OTHER_CUSTOM_CREDITS_REF + '_3_' + (previousIndex + 1) + '__c';
                let writeIn = previousIndex == 0 ? firstWriteIn : OTHER_CUSTOM_CREDITS_WRITEIN + '_' + (previousIndex + 1) + '__c';
                updatedSoldCaseData[year1] = element.year1;
                updatedSoldCaseData[year2] = element.year2;
                updatedSoldCaseData[year3] = element.year3;
                updatedSoldCaseData[writeIn] = element.writeIn;
                previousIndex++;
            }
        })

        for (let i = previousIndex; i < maxElement; i++) {
            let year1 = OTHER_CUSTOM_CREDITS_REF + '_1_' + (i + 1) + '__c';
            let year2 = OTHER_CUSTOM_CREDITS_REF + '_2_' + (i + 1) + '__c';
            let year3 = OTHER_CUSTOM_CREDITS_REF + '_3_' + (i + 1) + '__c';
            let writeIn = OTHER_CUSTOM_CREDITS_WRITEIN + '_' + (i + 1) + '__c';
            updatedSoldCaseData[year1] = '';
            updatedSoldCaseData[year2] = '';
            updatedSoldCaseData[year3] = '';
            updatedSoldCaseData[writeIn] = '';

        }
        return updatedSoldCaseData;
    }


    @api
    async generateParentData(updatedSoldCaseData) {
        let cloneLookupRecord = JSON.parse(JSON.stringify(updatedSoldCaseData));
        cloneLookupRecord = await this.updateSoldCaseList(OTHER_GUARANTEE_REF, cloneLookupRecord);
        cloneLookupRecord = await this.updateSoldCaseList(OTHER_GUARANTEE_MEDICAL_REF, cloneLookupRecord);
        cloneLookupRecord = await this.updateSoldCaseListCustomCredit(cloneLookupRecord);

        return cloneLookupRecord;
    }


    get isDataReceived() {
        if (this.recordDetail !== undefined && this.accountFieldLabels !== undefined && this.opportunityFieldLabels !== undefined) {
            return true;
        }
        return false;
    }



    connectedCallback() {
        //------------------------------------SAMARTH SCC NB UPGRADE 2023------------------------------------
        for (let i in this.soldCaseCheckListInstructions) {
            if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.ACC_CI_HI') {
                this.accCiHiHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            } else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.Life_DI') {
                this.lifeDiHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
        }
        //------------------------------------SAMARTH SCC NB UPGRADE 2023------------------------------------

        //--------------------SOLD--------------------
        // 
        if (this.meddispValue == 'Sold' || this.meddispValue == 'Spin-Off' || this.meddispValue == 'Transfer In') {
            this.medSold = true;
        }
        else {
            this.medSold = false;
        }

        if (this.dentdispValue == 'Sold' || this.dentdispValue == 'Spin-Off' || this.dentdispValue == 'Transfer In') {
            this.dentSold = true;
        }
        else {
            this.dentSold = false;
        }

        if (this.visiondispValue == 'Sold' || this.visiondispValue == 'Spin-Off' || this.visiondispValue == 'Transfer In') {
            this.visSold = true;
        }
        else {
            this.visSold = false;
        }

        if (this.pharmdispValue == 'Sold'|| this.pharmdispValue == 'Spin-Off' || this.pharmdispValue == 'Transfer In') {
            this.pharmSold = true;
        }
        else {
            this.pharmSold = false;
        }

        if (this.otherProductsStatus == 'Sold' || this.otherProductsStatus == 'Spin-Off' || this.otherProductsStatus == 'Transfer In') {
            this.otherSold = true;
        }
        else {
            this.otherSold = false;
        }
        //--------------------SOLD--------------------

        if (this.medSold || this.pharmSold) {
            this.medicalOrPhramaSold = true;
        }
        else {
            this.medicalOrPhramaSold = false;
        }

        if (this.isTraditionalProductPharmacy || this.isTraditionalProductMed) {
            this.medicalOrPhramaProdTrad = true;
        }
        else {
            this.medicalOrPhramaProdTrad = false;
        }

        if (this.isSurestProductPharmacy || this.isSurestProductMed) {
            this.medicalOrPhramaProdSurest = true;
        }
        else {
            this.medicalOrPhramaProdSurest = false;
        }
        
        if (this.dentSold || this.visSold || this.otherSold) {
            this.dentVisOrBuyupSold = true;
        }
        else {
            this.dentVisOrBuyupSold = false;
        }

        if (this.dentSold || this.visSold) {
            this.dentVisSold = true;
        }
        else {
            this.dentVisSold = false;
        }

    }

    @wire(getObjectInfo, {
        objectApiName: SccObject
    })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: historicData })
    histDataValue({ error, data }) {
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
            this.historicDataValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;
    }

    FieldChangeHandler(event) {
        //console.log('Inside FieldChangeHandler Performance Guarantees');
        let editfielddetails;
        let choosenValue;

        if (event.target.name.indexOf('Sold_Case_Checklist__c.') !== -1) {
            //console.log('Entering if');
            choosenValue = event.target.value;
            editfielddetails = [{
                fieldedited: event.target.name,
                fieldvalue: choosenValue
            }];
            //console.log('editfielddetails '+JSON.stringify(editfielddetails));
        }

        const ClientDetailRecord = new CustomEvent("progressvaluechange", {
            detail: editfielddetails

        });
        this.dispatchEvent(ClientDetailRecord);
    }

    handleCreAndAllChanges(event) {
        console.log('editfielddetails in Parent comp ' + JSON.stringify(event.detail));
        let editfielddetails;

        editfielddetails = [{
            fieldedited: event.detail.editedFieldName,
            fieldvalue: event.detail.editedFieldValue
        }];
        const ClientDetailRecord2 = new CustomEvent("progressvaluechange", {
            detail: editfielddetails
        });
        this.dispatchEvent(ClientDetailRecord2);
    }

    handleSccExtVendorChanges(event) {
        console.log('editfielddetails in Vendor Partner comp ' + JSON.stringify(event.detail));
        let editfielddetails;

        editfielddetails = [{
            fieldedited: event.detail.fieldedited,
            fieldvalue: event.detail.fieldvalue
        }];
        const ClientDetailRecord2 = new CustomEvent("progressvaluechange", {
            detail: event.detail
        });
        this.dispatchEvent(ClientDetailRecord2);
    }
}