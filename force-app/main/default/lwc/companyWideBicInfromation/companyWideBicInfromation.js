import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import getcompanyWideRecords from '@salesforce/apex/BicCompanyWideInformation.getBicInformation';
import updateCompanyWideRecords from '@salesforce/apex/BicCompanyWideInformation.updateBicInformation';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';

import COMPANYWIDE_OBJECT from '@salesforce/schema/Company_Wide_BiC_Information__c';
import BIC_SOURCE from '@salesforce/schema/Company_Wide_BiC_Information__c.BiC_Source__c';
import BIC_SOURCE_DATE from '@salesforce/schema/Company_Wide_BiC_Information__c.BiC_Source_Date__c';
import BIC_YEAR from '@salesforce/schema/Company_Wide_BiC_Information__c.Year__c';
import BIC_TYPE from '@salesforce/schema/Company_Wide_BiC_Information__c.Type__c';
import { refreshApex } from '@salesforce/apex';

import helpTextFromCustomLabel from '@salesforce/label/c.CompanyWideBicInfo'; //SAMARTH 3 AUG 2022

const percentFields = new Set(['Overall_BiC__c', 'vs_Aetna__c', 'vs_Anthem__c', 'vs_Blues__c', 'vs_Blues_Alt__c', 'vs_Cigna__c']);

export default class CompanyWideBicInfromation extends LightningElement {

    @api recordId;
    @track records;
    @track sortedRecords = [];

    recordsTemp = [];
    changedRecords = [];
    noRecords = false;
    oldValues;
    readOnly = true;

    @api isAdminProfile;
    @api isReadonly;

    helpText = helpTextFromCustomLabel;

    @wire(getcompanyWideRecords, { recordId: '$recordId' })
    wiredRecords({ error, data }) {
        if (data) {
            let filteredData = data.map((item) => Object.assign({}, item));
            filteredData.forEach((item, index) => {
                if ((item.Type__c === 'Mid Year' && item.Year__c === '2019')) {
                    filteredData.splice(index, 1);
                }
            });
            this.processData(filteredData);
            console.log(`SortedRecords ---> ${JSON.stringify(this.sortedRecords)}`);
        } else if (error) {
            console.log(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error retreiving the records',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }

    processData(data) {
        this.noRecords = false;
        let oldValuesLocal = [];
        this.sortedRecords = [];
        let yearVsBic = [];

        if (data.length > 0) {
            data.forEach(currentItem => {
                if (yearVsBic[currentItem.Year__c] == undefined) {
                    yearVsBic[currentItem.Year__c] = [];
                }
                yearVsBic[currentItem.Year__c].push(currentItem);
                oldValuesLocal[currentItem.Id] = currentItem;
            });

            for (let key in yearVsBic) {
                let temp = this.sortarray(yearVsBic[key]);
                this.sortedRecords = this.sortedRecords.concat(temp);
            }

            this.oldValues = oldValuesLocal;
            this.recordsTemp = JSON.parse(JSON.stringify(data));
            this.assignNewFields();
            console.log('this.sortedRecords');
            console.log(this.sortedRecords);
        } else {
            this.noRecords = true;
        }
    }

    sortarray(bicRecords) {
        bicRecords.sort(function (first, second) {
            if ((first.Type__c == 'Mid Year' && second.Type__c == 'Full Year') ||
                (first.Type__c == 'Mid Year' && second.Type__c == 'Projected') ||
                (first.Type__c == 'Full Year' && second.Type__c == 'Projected')
            ) {
                return -1;
            } else {
                return 1;
            }
        });
        return bicRecords;
    }

    assignNewFields() {
        let isAdmin = this.isAdminProfile;
        let isReadonly = this.readOnly
        //console.log(isAdmin+'=='+isReadonly);
        let sortedRecords = []; //JSON.parse(JSON.stringify(this.sortedRecords));
        this.sortedRecords.forEach((recs) => {
            sortedRecords.push(Object.assign({}, recs));
        });
        //console.log(`sortedRecords ---> `+JSON.stringify(sortedRecords));
        sortedRecords.forEach(function (val, index, mainArray) {
            Object.keys(mainArray[index]).forEach(function (key) {
                if (percentFields.has(key)) {
                    mainArray[index]['Text_' + key] = parseFloat(mainArray[index][key]).toFixed(2) + ' %';

                }
                if (isAdmin && !isReadonly) {
                    mainArray[index]['IsEditable'] = true;
                }
                /* else if( mainArray[index]['Type__c'] == 'Projected' && !isReadonly){
                    mainArray[index]['IsEditable'] = true;
                } */
                else {
                    mainArray[index]['IsEditable'] = false;
                }
            });
        });
        console.log(sortedRecords);
        this.sortedRecords = sortedRecords;
    }

    formatRecords(records) {
        let returnRecords = [];
        records.forEach(currentEle => {
            let currentEleTemp = {};
            Object.keys(currentEle).forEach(function (key) {
                if (percentFields.has(key)) {
                    currentEleTemp[key] = parseFloat(currentEle[key]).toFixed(2) + ' %';
                } else if (key == 'BiC_Source_Records__c' && currentEle[key] != undefined) {
                    currentEleTemp[key] = currentEle[key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                } else {
                    currentEleTemp[key] = currentEle[key];
                }
            });
            returnRecords.push(currentEleTemp);
        });
        return returnRecords;
    }

    @api updateBicInformation() {
        if (!this.noRecords) {
            let recordsToUpdate = [];
            const oldValueLocal = this.oldValues;

            this.recordsTemp.forEach(function (val, index, mainArray) {
                const oldRecord = oldValueLocal[mainArray[index].Id];
                const newRecord = mainArray[index]
                let isChanged = false;
                Object.keys(newRecord).forEach(function (key) {
                    if (newRecord[key] != oldRecord[key]) {
                        console.log(key + '===>' + newRecord[key] + '===' + oldRecord[key])
                        isChanged = true;
                    }
                });
                if (isChanged)
                    recordsToUpdate.push(newRecord);

            });

            if (recordsToUpdate.length > 0) {
                updateCompanyWideRecords({ bicInformationLst: recordsToUpdate })
                    .then((result) => {
                        this.readOnly = true;
                        this.processData(this.recordsTemp);
                        this.dispatchEvent(new CustomEvent('recordupdateinfo', { detail: 'companywideupdate' }));
                        this.changedRecords = [];
                    })
                    .catch((error) => {
                        console.log(error);
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error updating record',
                                message: error.body.message,
                                variant: 'error',
                            }),
                        );
                    });
            } else {
                this.dispatchEvent(new CustomEvent('recordupdateinfo', { detail: 'companywideupdate' }));
            }
        } else {
            this.dispatchEvent(new CustomEvent('recordupdateinfo', { detail: 'companywideupdate' }));
        }
    }

    @wire(getObjectInfo, { objectApiName: COMPANYWIDE_OBJECT })
    wiredObjectInfo;

    @wire(getPicklistValues, {
        recordTypeId: "$wiredObjectInfo.data.defaultRecordTypeId",
        fieldApiName: BIC_SOURCE
    })
    bicSourcePicklistValues;

    @wire(getPicklistValues, {
        recordTypeId: "$wiredObjectInfo.data.defaultRecordTypeId",
        fieldApiName: BIC_YEAR
    })
    bicYearPicklistValues;

    @wire(getPicklistValues, {
        recordTypeId: "$wiredObjectInfo.data.defaultRecordTypeId",
        fieldApiName: BIC_TYPE
    })
    bicTypePicklistValues;

    @wire(getPicklistValues, {
        recordTypeId: "$wiredObjectInfo.data.defaultRecordTypeId",
        fieldApiName: BIC_SOURCE_DATE
    })
    bicSourceDatePicklistValues;

    @api enableEdit() {
        this.readOnly = false;
        this.assignNewFields();
    }

    @api disableEdit() {
        this.readOnly = true;
        this.assignNewFields();
    }

    @api validateFields() {
        const isInputsCorrect = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        return isInputsCorrect;
    }

    assignValueToRecord(event) {
        const value = event.target.value;
        const name = event.target.name;
        const targetId = event.target.dataset.id;
        this.recordsTemp.forEach(function (val, index, mainArray) {
            if (mainArray[index].Id == targetId) {
                if (percentFields.has(name)) {
                    mainArray[index][name] = parseFloat(value).toFixed(2);
                } else {
                    mainArray[index][name] = value;
                }
            }
        });
    }
}