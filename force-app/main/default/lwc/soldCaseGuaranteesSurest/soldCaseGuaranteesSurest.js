/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 11-08-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, track, api, wire } from 'lwc';

const SURESRT_OTHER_GUARANTEE_MEDICAL_HEADING = 'Other Custom Guarantee';
const SUREST_OTHER_GUARANTEE_MEDICAL_REF = 'Surest_Other_Custom_Guarantee';
const SUREST_OTHER_GUARANTEE_MEDICAL_WRITEIN = 'Surest_Other_Custom_Guarantee_Write_In';

export default class SoldCaseGuaranteesSurest extends LightningElement {
    @track recordDetail;
    @track soldCaseDataCopy;
    @api medSold;
    @api pharmSold;
    @api isDataReceived;
    @api isSurestProductMed;
    @api medicalOrPhramaProdSurest;
    @api isSurestProductPharmacy;
    @track enableEdit;
    @track otherCustomGuaranteeMedLst = [];
    disableButtons;

    otherSurest = SUREST_OTHER_GUARANTEE_MEDICAL_REF;

    @api
    get editmode() {
        return this.enableEdit
    }
    set editmode(value) {
        this.enableEdit = value;
        this.disableButtons = !value
    }

    @api
    get soldCaseObjectData() {
        return this.soldCaseDataCopy;
    }
    set soldCaseObjectData(value) {
        this.soldCaseDataCopy = Object.assign({}, value);
        this.otherCustomGuaranteeMedLst = [];

        this.otherCustomGuaranteeMedLst[0] = {
            showAddButton: true,
            showRemoveButton: false,
            rowHeading: SURESRT_OTHER_GUARANTEE_MEDICAL_HEADING,
            mainField: this.soldCaseDataCopy['Surest_Other_Custom_Guarantee_1__c'],
            writeIn: this.soldCaseDataCopy['Surest_Other_Custom_Guarantee_Write_In_1__c']
        };

        for (let i = 1; i < 5; i++) {
            this.createGuaranteeRecords(i, SUREST_OTHER_GUARANTEE_MEDICAL_REF, true)
        }
    }

    createGuaranteeRecords(index, fieldReference, checkValue) {
        index = parseInt(index);
        let recordList;
        let writeInApi;
        let showButton = index < 4;

        if (fieldReference == SUREST_OTHER_GUARANTEE_MEDICAL_REF) {
            recordList = this.otherCustomGuaranteeMedLst;
            writeInApi = SUREST_OTHER_GUARANTEE_MEDICAL_WRITEIN;

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

        let recordList;

        if (fieldReference == SUREST_OTHER_GUARANTEE_MEDICAL_REF) {
            recordList = this.otherCustomGuaranteeMedLst;
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

        if (fieldreference == SUREST_OTHER_GUARANTEE_MEDICAL_REF) {
            this.rearrangeArray(this.otherCustomGuaranteeMedLst, SURESRT_OTHER_GUARANTEE_MEDICAL_HEADING, index, SUREST_OTHER_GUARANTEE_MEDICAL_REF)
        }

    }

    rearrangeArray(listToUpdate, heading, index) {
        listToUpdate.splice(index, 1)
        listToUpdate[listToUpdate.length - 1].showAddButton = true;
        listToUpdate[0].rowHeading = heading
        listToUpdate[0].showRemoveButton = listToUpdate.length > 1
    }

    async updateSoldCaseList(updatedSoldCaseData) {

        let firstElement;
        let firstWriteIn;
        let mainFieldRef;
        let writeInRef;
        let referenceList;
       
        firstElement = 'Surest_Other_Custom_Guarantee_1__c';
        firstWriteIn = 'Surest_Other_Custom_Guarantee_Write_In_1__c'
        mainFieldRef = SUREST_OTHER_GUARANTEE_MEDICAL_REF
        writeInRef = SUREST_OTHER_GUARANTEE_MEDICAL_WRITEIN
        referenceList = this.otherCustomGuaranteeMedLst

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
    @api
    async generateParentData(updatedSoldCaseData) {
        let cloneLookupRecord = JSON.parse(JSON.stringify(updatedSoldCaseData));
        cloneLookupRecord = await this.updateSoldCaseList(cloneLookupRecord);
        return cloneLookupRecord;
    }

    get isDataReceived() {
        if (this.soldCaseDataCopy !== undefined) {
            return true;
        }
        return false;
    }

    FieldChangeHandler(event) {
        let editfielddetails;
        let choosenValue;

        if (event.target.name.indexOf('Sold_Case_Checklist__c.') !== -1) {
            choosenValue = event.target.value;
            editfielddetails = {
                editedFieldName: event.target.name,
                editedFieldValue: choosenValue
            };
        }

        const ClientDetailRecord = new CustomEvent("guaranteesurestchange", {
            detail: editfielddetails
        });


        this.dispatchEvent(ClientDetailRecord);
    }
}