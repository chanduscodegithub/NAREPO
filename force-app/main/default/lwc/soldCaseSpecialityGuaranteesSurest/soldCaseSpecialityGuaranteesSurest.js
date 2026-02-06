/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 02-22-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement,track,api } from 'lwc';

export default class SoldCaseSpecialityGuaranteesSurest extends LightningElement {

    @track recordDetail;
    @track soldCaseDataCopy;
    @track medSold = true;
    @api isDataReceived;
    @track enableEdit;
    @track otherCustomGuaranteeMedLst = [];
    disableButtons;

    //otherSurest = SUREST_OTHER_GUARANTEE_MEDICAL_REF;

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
        // this.otherCustomGuaranteeMedLst = [];

        // this.otherCustomGuaranteeMedLst[0] = {
        //     showAddButton: true,
        //     showRemoveButton: false,
        //     rowHeading: SURESRT_OTHER_GUARANTEE_MEDICAL_HEADING,
        //     mainField: this.soldCaseDataCopy['Surest_Other_Custom_Guarantee_1__c'],
        //     writeIn: this.soldCaseDataCopy['Surest_Other_Custom_Guarantee_Write_In_1__c']
        // };

        // for (let i = 1; i < 5; i++) {
        //     this.createGuaranteeRecords(i, SUREST_OTHER_GUARANTEE_MEDICAL_REF, true)
        // }
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