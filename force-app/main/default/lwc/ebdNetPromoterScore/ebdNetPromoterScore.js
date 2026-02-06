import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteNpsRecord from '@salesforce/apex/EBDController.deleteNpsRecord';
import getStrategyOptions from '@salesforce/apex/EBDController.getStrategyOptions';
export default class EbdNetPromoterScore extends LightningElement {
    @api isEditMode;
    @track keyIndex = 0;
    @api recordId;
    //@api npsData = [];
    @track _npsData = [];
    @track npsDeleteIds = [];
    @track showConfirmModalForNps = false;
    @api ebdId;
    @track otherStrategy = false;

    // @api finanicalData;
    latestFourYear0 = '';
    latestFourYear1 = '';
    latestFourYear2 = '';
    latestFourYear3 = '';

    liklihoodJson = {};
    overAllSatisfactionjson = {};
    netPromoterjson = {};

    SurestliklihoodJson = {};
    SurestnetPromoterjson = {};

    clientPlanSurveyData = {};
    @api
    get finanicalData() {
        return this.clientPlanSurveyData;
    }

    set finanicalData(value) {

        this.clientPlanSurveyData = value;
        let clientPlanSurveyData = this.clientPlanSurveyData;

        this.isClientPlanSurveyData = false;
        console.log('clientPlanSurveyData======' + JSON.stringify(clientPlanSurveyData));


        if (clientPlanSurveyData.hasOwnProperty('LastFourYears')) {

            this.latestFourYear0 = clientPlanSurveyData.LastFourYears[3];
            this.latestFourYear1 = clientPlanSurveyData.LastFourYears[2];
            this.latestFourYear2 = clientPlanSurveyData.LastFourYears[1];
            this.latestFourYear3 = clientPlanSurveyData.LastFourYears[0];

        }
        if (clientPlanSurveyData.hasOwnProperty('CSRFinalList')) {

            let clientPlanSurveyList = clientPlanSurveyData.CSRFinalList;
            if (!this.isListEmpty(clientPlanSurveyList)) {


                let liklihoodJson = {};
                let overAllSatisfactionjson = {};
                let netPromoterjson = {};

                let SurestliklihoodJson = {};
                let SurestnetPromoterjson = {};

                let liklihoodData = clientPlanSurveyList[0];
                let overAllSatisfactionData = clientPlanSurveyList[1];
                let netPromoterData = clientPlanSurveyList[2];
                let SurestliklihoodData = clientPlanSurveyList[3];
                let SurestnetPromoterData = clientPlanSurveyList[4];
                console.log('liklihoodData----' + liklihoodData);
                for (let k in liklihoodData) {

                    if (k > 0) {
                        liklihoodJson['coloumn' + k + 'Data'] = liklihoodData[k];
                    }

                }
                this.liklihoodJson = liklihoodJson;
                for (let k in overAllSatisfactionData) {

                    if (k > 0) {
                        overAllSatisfactionjson['coloumn' + k + 'Data'] = overAllSatisfactionData[k];
                    }

                }
                this.overAllSatisfactionjson = overAllSatisfactionjson;
                for (let k in netPromoterData) {

                    if (k > 0) {
                        netPromoterjson['coloumn' + k + 'Data'] = netPromoterData[k];
                    }

                }
                this.netPromoterjson = netPromoterjson;
                 for (let k in SurestliklihoodData) {

                    if (k > 0) {
                        SurestliklihoodJson['coloumn' + k + 'Data'] = SurestliklihoodData[k];
                    }

                }
                this.SurestliklihoodJson = SurestliklihoodJson;
                 for (let k in SurestnetPromoterData) {

                    if (k > 0) {
                        SurestnetPromoterjson['coloumn' + k + 'Data'] = SurestnetPromoterData[k];
                    }

                }
                this.SurestnetPromoterjson = SurestnetPromoterjson;

            }

        }
    }
    //second nps 
    @api
    get npsData() {
        return this._npsData;
    }
    set npsData(value) {
        if (value) {
            this._npsData = value.map(rec => ({
                ...rec,
                FormattedCompletionDate: this.formatDateMMDDYYYY(rec.Estimated_Completion_Date__c),
                isOther: rec.Strategy__c === 'Other'
            }));
        } else {
            this._npsData = [];
        }
    }
    @wire(getStrategyOptions)
    wiredOptions({ data, error }) {
        if (data) {
            this.options = data.map(option => ({ label: option, value: option }));
        } else if (error) {
            console.error('Error fetching picklist options:', error);
        }
    }

    deleteAllNpsRows() {
        this.showConfirmModalForNps = true;
    }
    handleCancelDelete() {
        this.showConfirmModalForNps = false;
    }
    handleConfirmDelete() {
        console.log('ebdId in delete:', JSON.stringify(this.ebdId));
        const ebdIdToPass = JSON.stringify(this.ebdId);
        console.log('ebdIdToPass in delete:', ebdIdToPass);
        deleteNpsRecord({ ebdId: ebdIdToPass })
            .then(() => {
               // this.npsData = [];
                this.npsData = [
                    {
                        Strategy__c: '',
                        Action_Steps_Planned_Taken__c: '',
                        Estimated_Completion_Date__c: '',
                        isOther: false
                    }
                ];
                this.npsIdsToDelete = [];
                this.dispatchChangeEvent(true);
                this.showToast('Success', 'All Nps data deleted.', 'success');
            })
            .catch(error => {
                console.error('Error deleting Nps priorities', error);
                this.showToast('Error', 'Failed to delete Client Priority records.', 'error');
            })
            .finally(() => {
                this.showConfirmModalForNps = false;
            });
    }

    addRow(event) {
        const currentIndex = parseInt(event.target.dataset.index);
        this.keyIndex++;
        const newRow = {
            Strategy__c: '',
            Action_Steps_Planned_Taken__c: '',
            Estimated_Completion_Date__c: ''

        };
        let updatedNpsData = [...this._npsData];
        updatedNpsData.splice(updatedNpsData.length, 0, newRow);
        this._npsData = updatedNpsData;
        this.dispatchChangeEvent();

    }
    // handleChange(event) {
    //     let index = event.target.dataset.index;
    //     let fieldName = event.target.name;
    //     let value = event.target.value;
    //     let updatedNpsList = [...this.npsData];
    //     console.log('nps before changing updated index handlechange updated:', this.npsData);
    //     /*
    //     updatedEntertainmentList[index] = { ...updatedEntertainmentList[index], [fieldName]: value };*/
    //     updatedNpsList[index] = {
    //         ...this.npsData[index], // ensure you keep existing fields like Id
    //         [fieldName]: value,

    //     };

    //     //console.log('clientPriorityDetails after handlechange updated:', this.updatedClientPriorityList);
    //     this.npsData = updatedNpsList;
    //     this.otherStrategy = fieldName === 'Strategy__c' && value === 'Other';
    //     console.log('updatedNpsList after handlechange updated:', this.npsData);
    //     this.dispatchChangeEvent();
    // }
    formatDateMMDDYYYY(dateStr) {
        if (!dateStr) return '';
        let date = new Date(dateStr);
        // Adjust for timezone offset
        date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        let mm = date.getMonth() + 1; 
        let dd = date.getDate();      
        let yyyy = date.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    }

    handleChange(event) {
        const index = event.target.dataset.index;
        const fieldName = event.target.name;
        const value = event.target.value;

        let updatedNpsList = [...this.npsData];

        // Update field normally
        updatedNpsList[index] = {
            ...updatedNpsList[index],
            [fieldName]: value,
        };

        // If "Other" selected → initialize Other_Strategy_Description__c
        if (fieldName === 'Strategy__c') {
            if (value === 'Other') {
                updatedNpsList[index].isOther = true;
                if (!updatedNpsList[index].Other_Strategy__c) {
                    updatedNpsList[index].Other_Strategy__c = '';
                }
            } else {
                updatedNpsList[index].isOther = false;
                updatedNpsList[index].Other_Strategy__c = null;
            }
        }
        this._npsData = updatedNpsList;
        this.dispatchChangeEvent();
    }


    removeRow(event) {
        let index = parseInt(event.target.dataset.index, 10);
        // let recordId = this.clientPriorityDetails[index];
        console.log('index:', index);
        console.log('this.entertainmentsData in delete:', this.entertainmentsData);
        let updatedNpList = [...this._npsData];
        //const record = this.updatedList[index];
        const record = updatedNpList[index];
        // console.log('this.clientPriorityDetails[index]:', this.clientPriorityDetails[index]);
        console.log('record to be deleted:', JSON.stringify(record));
        if (record && record.Id) {
            this.npsDeleteIds = [...this.npsDeleteIds, record.Id];
            //this.deletedClientPriorityIds.push(record.Id);
        }
        //this.updatedList.splice(index, 1);
        updatedNpList.splice(index, 1);
        this._npsData = updatedNpList
        this.dispatchChangeEvent();
        console.log('Entertainment Ids to be deleted:', JSON.stringify(this.npsDeleteIds));

    }
    dispatchChangeEvent(isDeleted = false) {
        this.dispatchEvent(new CustomEvent('ebdchange', {
            detail: {
                objectType: 'Nps',
                data: this._npsData,
                deleteIds: this.npsDeleteIds || [],
                refresh: isDeleted
            }
        }));
    }
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }


    connectedCallback() {
        console.log('connectedcall in child for financialdata', this.finanicalData);
        console.log('connectedcall in child for financialdata in json', JSON.stringify(this.finanicalData));

    }
    isListEmpty(lst) {
        let isListEmpty = true;
        if (lst !== null && lst !== undefined && lst.length !== 0) {
            isListEmpty = false;
        }

        return isListEmpty;

    }


}