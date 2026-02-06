/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 09-30-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, api, track, wire } from 'lwc';

const OTHER_CREDITS_HEADING = 'Other';
const OTHER_CREDITS_YEAR_REF = 'Credits_and_Allowances_Other_Year';
const OTHER_CREDITS_WRITEIN = 'Credits_and_Allowances_Other_Write_In';
const OTHER_CREDITS_SUREST_YEAR_REF = 'Surest_Credits_n_Allowances_OtherYear';
const OTHER_CREDITS_SUREST_WRITEIN = 'Surest_Credits_n_Allowance_OtherWriteIn';



export default class soldCaseVendorPartners extends LightningElement {
    @track recordDetail;
    //@api editmode;
    @track sccDataCredAndAll;
    @api isSurestProductMed;  
    @api isTraditionalProductMed;


    otherCredits1 = OTHER_CREDITS_YEAR_REF+'_1';
    otherCredits2 = OTHER_CREDITS_YEAR_REF+'_2';
    otherCredits3 = OTHER_CREDITS_YEAR_REF+'_3';
    otherCreditsWriteIn = OTHER_CREDITS_WRITEIN;

    otherSurestCredits1 = OTHER_CREDITS_SUREST_YEAR_REF+'1';
    otherSurestCredits2 = OTHER_CREDITS_SUREST_YEAR_REF+'2';
    otherSurestCredits3 = OTHER_CREDITS_SUREST_YEAR_REF+'3';
    otherSurestCreditsWriteIn = OTHER_CREDITS_SUREST_WRITEIN;

    @track otherCreditsLst = [];
    @track otherCreditsSurestLst = [];
    disableButtons;

    @api
    get editmode() {
        return this.enableEdit
    }
    set editmode(value) {
        this.enableEdit = value;
        this.disableButtons = !value
    }

    @api
    get soldCaseDataCopy() {
        return this.sccDataCredAndAll;
    }
    set soldCaseDataCopy(value) {
        this.sccDataCredAndAll = Object.assign({}, value);
        console.log('data on refresh')
        console.dir(JSON.parse(JSON.stringify(this.sccDataCredAndAll)))

        this.otherCreditsLst = [];
        this.otherCreditsLst[0] = {
            showAddButton: true,
            showRemoveButton: false,
            rowHeading: OTHER_CREDITS_HEADING,
            year1: this.sccDataCredAndAll['Credits_and_Allowances_Other_Year_1__c'],
            year2: this.sccDataCredAndAll['Credits_and_Allowances_Other_Year_2__c'],
            year3: this.sccDataCredAndAll['Credits_and_Allowances_Other_Year_3__c'],
            writeIn: this.sccDataCredAndAll['Credits_and_Allowances_Other_Write_In__c']
        };

        for (let i = 1; i < 5; i++) {
            this.createGuaranteeRecords(i, OTHER_CREDITS_YEAR_REF, true)
        }

        this.otherCreditsSurestLst = [];
        this.otherCreditsSurestLst[0] = {
            showAddButton: true,
            showRemoveButton: false,
            rowHeading: OTHER_CREDITS_HEADING,
            year1: this.sccDataCredAndAll['Surest_Credits_n_Allowances_OtherYear1__c'],
            year2: this.sccDataCredAndAll['Surest_Credits_n_Allowances_OtherYear2__c'],
            year3: this.sccDataCredAndAll['Surest_Credits_n_Allowances_OtherYear3__c'],
            writeIn: this.sccDataCredAndAll['Surest_Credits_n_Allowances_OtherWriteIn__c']
        };

        for (let i = 1; i < 5; i++) {
            this.createGuaranteeSurestRecords(i, OTHER_CREDITS_SUREST_YEAR_REF, true)
        }

    }

    createGuaranteeRecords(index, fieldReference, checkValue) {
        index = parseInt(index);
        let recordList;
        let writeInApi;
        recordList = this.otherCreditsLst;
        writeInApi = OTHER_CREDITS_WRITEIN;
        
        const year1FieldName = fieldReference + '_1_' + (index + 1) + '__c';
        const year2FieldName = fieldReference + '_2_' + (index + 1) + '__c';
        const year3FieldName = fieldReference + '_3_' + (index + 1) + '__c';
        const writeInName = writeInApi + '_' + (index + 1) + '__c';

        if (index == 0 || index > 4 || (checkValue && !this.sccDataCredAndAll[year1FieldName]&& !this.sccDataCredAndAll[year2FieldName] 
        && !this.sccDataCredAndAll[year3FieldName]&& !this.sccDataCredAndAll[writeInName]))
        {
            return;
        }

        let showButton = index < 4;

        recordList[index] = {
            showAddButton: showButton,
            showRemoveButton: true,
            rowHeading: '',
            year1: checkValue ? this.sccDataCredAndAll[year1FieldName] : '',
            year2: checkValue ? this.sccDataCredAndAll[year2FieldName] : '',
            year3: checkValue ? this.sccDataCredAndAll[year3FieldName] : '',
            writeIn: checkValue ? this.sccDataCredAndAll[writeInName] :''
        };

        if (recordList[index - 1]) {
            recordList[index - 1].showAddButton = false;
        }
        recordList[0].showRemoveButton = true;
    }

    createGuaranteeSurestRecords(index, fieldReference, checkValue) {
        index = parseInt(index);
        let recordList;
        let writeInApi;
        recordList = this.otherCreditsSurestLst;
        writeInApi = OTHER_CREDITS_SUREST_WRITEIN;
        
        const year1FieldName = fieldReference + '1_' + (index + 1) + '__c';
        const year2FieldName = fieldReference + '2_' + (index + 1) + '__c';
        const year3FieldName = fieldReference + '3_' + (index + 1) + '__c';
        const writeInName = writeInApi + (index + 1) + '__c';

        if (index == 0 || index > 4 || (checkValue && !this.sccDataCredAndAll[year1FieldName]&& !this.sccDataCredAndAll[year2FieldName] 
        && !this.sccDataCredAndAll[year3FieldName]&& !this.sccDataCredAndAll[writeInName]))
        {
            return;
        }

        let showButton = index < 4;

        recordList[index] = {
            showAddButton: showButton,
            showRemoveButton: true,
            rowHeading: '',
            year1: checkValue ? this.sccDataCredAndAll[year1FieldName] : '',
            year2: checkValue ? this.sccDataCredAndAll[year2FieldName] : '',
            year3: checkValue ? this.sccDataCredAndAll[year3FieldName] : '',
            writeIn: checkValue ? this.sccDataCredAndAll[writeInName] :''
        };

        if (recordList[index - 1]) {
            recordList[index - 1].showAddButton = false;
        }
        recordList[0].showRemoveButton = true;
    }

    addGuaranteeFunction(event) {
        let index = parseInt(event.currentTarget.dataset.buttonindex) + 1;
        let fieldreference = event.currentTarget.dataset.fieldreference;
        this.createGuaranteeRecords(index, fieldreference)
        console.log(Array.from(this.template.querySelectorAll('.writeInInpt')));
    }

    addGuaranteeSurestFunction(event) {
        let index = parseInt(event.currentTarget.dataset.buttonindex) + 1;
        let fieldreference = event.currentTarget.dataset.fieldreference;
        this.createGuaranteeSurestRecords(index, fieldreference)
        console.log(Array.from(this.template.querySelectorAll('.writeInInpt')));
    }

    deleteGuaranteeFunction(event) {
        let index = parseInt(event.currentTarget.dataset.buttonindex);
        let fieldreference = event.currentTarget.dataset.fieldreference;
        this.rearrangeArray(this.otherCreditsLst, OTHER_CREDITS_HEADING, index, OTHER_CREDITS_YEAR_REF)
    }

    deleteGuaranteeSurestFunction(event) {
        let index = parseInt(event.currentTarget.dataset.buttonindex);
        let fieldreference = event.currentTarget.dataset.fieldreference;
        this.rearrangeArray(this.otherCreditsSurestLst, OTHER_CREDITS_HEADING, index, OTHER_CREDITS_SUREST_YEAR_REF)
    }

    rearrangeArray(listToUpdate, heading, index, fieldReferene) {
        listToUpdate.splice(index, 1)
        listToUpdate[listToUpdate.length - 1].showAddButton = true;
        listToUpdate[0].rowHeading = heading
        listToUpdate[0].showRemoveButton = listToUpdate.length > 1
    }

    async updateInParent(listToUpdate, fieldreference, updatedSoldCaseData) {
        let firstElement;
        if(fieldreference.includes(OTHER_CREDITS_YEAR_REF) || fieldreference.includes(OTHER_CREDITS_SUREST_YEAR_REF)){
            firstElement = fieldreference+'__c';
        }else if(fieldreference == OTHER_CREDITS_WRITEIN){
            firstElement = 'Credits_and_Allowances_Other_Write_In__c';
        }else if(fieldreference == OTHER_CREDITS_SUREST_WRITEIN){
            firstElement = 'Surest_Credits_n_Allowances_OtherWriteIn__c';
        }

        let maxElement = 5;
        let previousIndex = 0;
        if(fieldreference == OTHER_CREDITS_SUREST_WRITEIN){
            listToUpdate.forEach(element => {
                if (element.value) {
                    let fieldedited = previousIndex == 0 ? firstElement : fieldreference + (previousIndex + 1) + '__c';
                    updatedSoldCaseData[fieldedited] = element.value;
                    previousIndex++;
                }
            })
        }

        else{
            listToUpdate.forEach(element => {
            if (element.value) {
                let fieldedited = previousIndex == 0 ? firstElement : fieldreference + '_' + (previousIndex + 1) + '__c';
                updatedSoldCaseData[fieldedited] = element.value;
                previousIndex++;
            }
            })
        }

        for (let i = previousIndex; i < maxElement; i++) {
            if(fieldreference == OTHER_CREDITS_SUREST_WRITEIN){
                let fieldedited = fieldreference + (i + 1) + '__c'
                updatedSoldCaseData[fieldedited] = ''
            }
            else{
                let fieldedited = fieldreference + '_' + (i + 1) + '__c'
                updatedSoldCaseData[fieldedited] = ''
            }
        }

        return updatedSoldCaseData;
    }

    @api
    async generateParentData(updatedSoldCaseData) {
        
        let cloneLookupRecord = JSON.parse(JSON.stringify(updatedSoldCaseData));

        let otherCreditsYear1 = Array.from(this.template.querySelectorAll('.yearoneInpt'));
        let otherCreditsYear2 = Array.from(this.template.querySelectorAll('.yeartwoInpt'));
        let otherCreditsYear3 = Array.from(this.template.querySelectorAll('.yearthreeInpt'));
        let otherCreditsWriteIn = Array.from(this.template.querySelectorAll('.writeInInpt'));

        let otherSurestCreditsYear1 = Array.from(this.template.querySelectorAll('.yearoneSurestInpt'));
        let otherSurestCreditsYear2 = Array.from(this.template.querySelectorAll('.yeartwoSurestInpt'));
        let otherSurestCreditsYear3 = Array.from(this.template.querySelectorAll('.yearthreeSurestInpt'));
        let otherSurestCreditsWriteIn = Array.from(this.template.querySelectorAll('.writeInSurestInpt'));

        if(otherCreditsYear1 && otherCreditsYear2 && otherCreditsYear3 && otherCreditsWriteIn){
            cloneLookupRecord = await this.updateInParent(otherCreditsYear1, OTHER_CREDITS_YEAR_REF+'_1', cloneLookupRecord);
            cloneLookupRecord = await this.updateInParent(otherCreditsYear2, OTHER_CREDITS_YEAR_REF+'_2', cloneLookupRecord);
            cloneLookupRecord = await this.updateInParent(otherCreditsYear3, OTHER_CREDITS_YEAR_REF+'_3', cloneLookupRecord);
            cloneLookupRecord = await this.updateInParent(otherCreditsWriteIn, OTHER_CREDITS_WRITEIN, cloneLookupRecord);
        }
        if(otherSurestCreditsYear1 && otherSurestCreditsYear2 && otherSurestCreditsYear3 && otherSurestCreditsWriteIn){
            cloneLookupRecord = await this.updateInParent(otherSurestCreditsYear1, OTHER_CREDITS_SUREST_YEAR_REF+'1', cloneLookupRecord);
            cloneLookupRecord = await this.updateInParent(otherSurestCreditsYear2, OTHER_CREDITS_SUREST_YEAR_REF+'2', cloneLookupRecord);
            cloneLookupRecord = await this.updateInParent(otherSurestCreditsYear3, OTHER_CREDITS_SUREST_YEAR_REF+'3', cloneLookupRecord);
            cloneLookupRecord = await this.updateInParent(otherSurestCreditsWriteIn, OTHER_CREDITS_SUREST_WRITEIN, cloneLookupRecord);
        }
        console.dir(cloneLookupRecord);

        return cloneLookupRecord;
    }

    get isDataReceived() {
        if (this.sccDataCredAndAll !== undefined) {
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

        const ClientDetailRecord = new CustomEvent("creditsandallowanceschange", {
            detail: editfielddetails
        });

        console.log('editfielddetails in child comp ' + JSON.stringify(editfielddetails));

        this.dispatchEvent(ClientDetailRecord);
    }
}