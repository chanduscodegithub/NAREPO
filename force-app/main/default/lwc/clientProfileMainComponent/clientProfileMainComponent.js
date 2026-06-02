/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 03-01-2024
 * @last modified by  : Spoorthy
**/
import {LightningElement,api,wire,track} from 'lwc';
import getClientProfileData from '@salesforce/apex/ClientProfileController.getClientProfileData';
import getTemplateInXML from '@salesforce/apex/ClientProfilePrintController.getTemplateInXML';
import getClientPlanData from '@salesforce/apex/ClientProfilePrintController.getClientPlanData';
import uhgAccountTeamEnhancement from '@salesforce/apex/ClientProfileController.uhgAccountTeamEnhancement';

import getUserProfile from '@salesforce/apex/ClientProfileController.getUserProfile';

import {
    refreshApex
} from '@salesforce/apex';

export default class ClientPlanMainComponent extends LightningElement {

    @api recordId;
    @track clientProfileData = {};
    isClientProfileDataEmpty = true;
    corporationOverviewData = {};
    seniorExecutiveData = {};
    coreUHGTeamData = [];
    financialData = {};
    financialDataSurest = {};
    competitorData = {};
    clientSurveyResultData = {};
    companyConsultantData = [];
    currentDealStartDateStr = '';
    currentDealRenewalDateStr = '';
    surestCurrentDealStartDateStr = '';
    surestNextRenewalDateStr = '';
    loaded = false;
    medListData;
    medListDataSurest;
    bghData = '';
    refresh = false;
    refreshObj;

    //Print Variables

    @track cssDisplay = '';
    @track salesSeason = '';
    @track clientData = [];
    @track isclientDataEmpty;
    @track salesSeasonPicklist;
    // @track salesSeasonSelected;
    @track isEdit = false;
    @track mandatoryclientData;
    @track picklistFieldMap;
    @track goalPicklist;
    @track goalNames = [];
    @track activeSections = [];
    @track strategyEditedMap = {};
    @track goalEditedMap = {};
    @track goalStrategyToInsertList = [];
    @track isAddGoalButtonDisabled;
    @track isEditButtonDisabled;
    @track isPrintButtonDisabled;
    @track expandCollapse = 'Collapse All';
    @track iconDirection = 'utility:chevrondown';
    @track strategyRecordsToBeDeleted;
    @track goalRecordsToBeDeleted;
    @track count = 0;
    @track isCancel = true;
    @track openSections;
    @track showModal = false;
    @track goalTobeDeletedMap = {};
    @track strategyTobeDeletedMap = {};
    @track recordTobeDeleted = {};

    @track goalUsedPicklistValues = [];

    @track hasEditAccess;
    @track backupUsedGoals = [];

    @track deleteObjName;
    @track showReminderModal = false;

    @track goalAndStrategyListEdited = [];
    @track isReminderOkClicked = false;
    @track emptyStrategyGoalName = '';
    @track deleteMsgContent = '';
    @track emptyStrategyReminderMsgContent = '';
    @track actionStepWithoutStrategyReminderMsgContent = '';
    @track reminderMsgContent = '';
    @track isStrategyListEmptyForGoal;
    @track strategyRecHavingActionStepWithoutStrategy;

    @track disableCopyPreviousButton = true;
    @api noGoalRecordsMessage;
    salesSeasonChange = false;
    @track newGoalsListToBeCreated;
    isCreateOrCopyNewRecords = false;
    @track previousSalesSeasonRecords = [];
    openSections1;
    newPickListValue = '';
    isAddAnotherGoal = false;


    isClientPlanData = true;
    attainNPSGoalStrategy = [];
    defaultSeasonSale = '';
    protectCurrentGoalStartegy = [];
    refreshObjClientPlan = [];

    @api uhgAccountTeamEnhancementList;
    @api specialtyBenefitInvolved;

    @api contactRoleMap = [];
    @api finalContactRoleMap = [];
    isNotISBAuser =false;
    load(event){
        this.loaded = event.detail;
    }
    connectedCallback(){
        

        getUserProfile().then(result => {
            this.isNotISBAuser = result;
        });
    }
    @wire(uhgAccountTeamEnhancement, {
        accountId: '$recordId'
    })
    wireduhgAccountTeamEnhancement(response) {
        if (response.data != undefined && response.data != null) {
            //console.log('response data ' + JSON.stringify(response.data));
            this.uhgAccountTeamEnhancementList = response.data;
        }
        
    }

    @wire(getClientProfileData, {
        accountId: '$recordId'
    })
    wiredClientProfileResponse(response) {
        // console.log('inside the wired response client profile');
        //  console.log('response=====>>>>>' + response);
        this.refreshObj = response;
        if (response.data != undefined && response.data != null) {
            this.medListData = undefined;
            this.medListDataSurest = undefined;
            this.bghData = '';
            this.corporationOverviewData = {};
            this.seniorExecutiveData = {};
            this.coreUHGTeamData = [];
            this.financialData = {};
            this.financialDataSurest = {};
            this.competitorData = {};
            this.clientSurveyResultData = {};
            this.companyConsultantData = [];
            this.currentDealStartDateStr = '';
            this.currentDealRenewalDateStr = '';
            this.surestCurrentDealStartDateStr = ''; 
            this.surestNextRenewalDateStr = '';
            this.clientProfileData = response.data;
            let clientProfileData = this.clientProfileData;
            //  console.log('client profile response========>' + JSON.stringify(this.clientProfileData));
            this.isClientProfileDataEmpty = false;

            this.contactRoleMap = [];
            this.finalContactRoleMap = [];

            if (clientProfileData.specialtyBenefitInvolved !== null || clientProfileData.specialtyBenefitInvolved !== undefined) {
                this.specialtyBenefitInvolved = clientProfileData.specialtyBenefitInvolved;
            }

            if (clientProfileData.hasOwnProperty('getCorporationOverviewData')) {
                let corporationOverviewData = clientProfileData.getCorporationOverviewData;
                if (!this.isListEmpty(corporationOverviewData)) {
                    this.corporationOverviewData = clientProfileData.getCorporationOverviewData;
                }
            }

            if (clientProfileData.hasOwnProperty('currentDealStartDate')) {
                let currentDealStartDateStr = clientProfileData.currentDealStartDate;
                if (!this.isListEmpty(currentDealStartDateStr)) {
                    this.currentDealStartDateStr = clientProfileData.currentDealStartDate;
                }
            }
            if (clientProfileData.hasOwnProperty('currentDealRenewalDate')) {
                let currentDealRenewalDateStr = clientProfileData.currentDealRenewalDate;
                if (!this.isListEmpty(currentDealRenewalDateStr)) {
                    this.currentDealRenewalDateStr = clientProfileData.currentDealRenewalDate;
                }
            }
            if (clientProfileData.hasOwnProperty('surestCurrentDealStartDate')) {
                let surestCurrentDealStartDateStr = clientProfileData.surestCurrentDealStartDate;
                if (!this.isListEmpty(surestCurrentDealStartDateStr)) {
                    this.surestCurrentDealStartDateStr = clientProfileData.surestCurrentDealStartDate;
                }
            }
            if (clientProfileData.hasOwnProperty('surestNextRenewalDate')) {
                let surestNextRenewalDateStr = clientProfileData.surestNextRenewalDate;
                if (!this.isListEmpty(surestNextRenewalDateStr)) {
                    this.surestNextRenewalDateStr = clientProfileData.surestNextRenewalDate;
                }
            }
            if (clientProfileData.hasOwnProperty('getSeniorExecutiveData')) {
                let seniorExecutiveData = clientProfileData.getSeniorExecutiveData;
                if (!this.isListEmpty(seniorExecutiveData)) {
                    this.seniorExecutiveData = clientProfileData.getSeniorExecutiveData;
                }
            }
            if (clientProfileData.hasOwnProperty('getCoreUHGTeamData')) {
                let coreUHGTeamData = clientProfileData.getCoreUHGTeamData;
                if (!this.isListEmpty(coreUHGTeamData)) {
                    this.coreUHGTeamData = clientProfileData.getCoreUHGTeamData;
                }

                for (let i = 0; i < this.coreUHGTeamData.length; i++) {
                    if (this.contactRoleMap == null || this.contactRoleMap == undefined || this.contactRoleMap == '') {
                        this.contactRoleMap.push({
                            'Contact_Role': this.coreUHGTeamData[i].Contact_Role__c,
                            'Name': (this.coreUHGTeamData[i].First_Name__c!=null&&this.coreUHGTeamData[i].First_Name__c!=undefined&&this.coreUHGTeamData[i].First_Name__c!=''?this.coreUHGTeamData[i].First_Name__c:'') + ' ' + (this.coreUHGTeamData[i].Last_Name__c!=null&&this.coreUHGTeamData[i].Last_Name__c!=undefined&&this.coreUHGTeamData[i].Last_Name__c!=''?this.coreUHGTeamData[i].Last_Name__c:'')
                        });
                    }
                    else {
                        let flag = true;
                        if (flag === true) {
                            for (let j = 0; j < this.contactRoleMap.length; j++) {
                                if (this.coreUHGTeamData[i].Contact_Role__c == this.contactRoleMap[j].Contact_Role) {
                                    this.contactRoleMap[j].Name = this.contactRoleMap[j].Name + '; ' +(this.coreUHGTeamData[i].First_Name__c!=null&&this.coreUHGTeamData[i].First_Name__c!=undefined&&this.coreUHGTeamData[i].First_Name__c!=''?this.coreUHGTeamData[i].First_Name__c:'') + ' ' + (this.coreUHGTeamData[i].Last_Name__c!=null&&this.coreUHGTeamData[i].Last_Name__c!=undefined&&this.coreUHGTeamData[i].Last_Name__c!=''?this.coreUHGTeamData[i].Last_Name__c:'');

                                    flag = false;
                                    break;
                                }
                            }
                        }

                        if (flag === true) {
                            for (let j = 0; j < this.contactRoleMap.length; j++) {
                                if (this.coreUHGTeamData[i].Contact_Role__c != this.contactRoleMap[j].Contact_Role) {
                                    this.contactRoleMap.push({
                                        'Contact_Role': this.coreUHGTeamData[i].Contact_Role__c,
                                        'Name': (this.coreUHGTeamData[i].First_Name__c!=null&&this.coreUHGTeamData[i].First_Name__c!=undefined&&this.coreUHGTeamData[i].First_Name__c!=''?this.coreUHGTeamData[i].First_Name__c:'') + ' ' + (this.coreUHGTeamData[i].Last_Name__c!=null&&this.coreUHGTeamData[i].Last_Name__c!=undefined&&this.coreUHGTeamData[i].Last_Name__c!=''?this.coreUHGTeamData[i].Last_Name__c:'')
                                    });

                                    flag = false;
                                    break;
                                }
                            }
                        }
                    }
                }

                var order = ['Specialty Benefits Client Manager', 'Client Manager', 'Client Management Consultant', 'Service Account Manager',
                    'UHC Medical Director', 'Clinical Account Executive', 'Health Analytics Consultant', 'Engagement Solutions Consultant'];

                this.finalContactRoleMap = this.contactRoleMap.sort(function (a, b) {
                    return order.indexOf(a.Contact_Role) - order.indexOf(b.Contact_Role);
                });
                console.log('finalContactRoleMap ' + JSON.stringify(this.finalContactRoleMap));
            }

            if (clientProfileData.hasOwnProperty('getCompanyConsultantData')) {
                let companyConsultantData = clientProfileData.getCompanyConsultantData;
                if (!this.isListEmpty(companyConsultantData)) {
                    this.companyConsultantData = clientProfileData.getCompanyConsultantData;
                }
            }

            if (clientProfileData.hasOwnProperty('getFinancialData')) {
                let financialData = clientProfileData.getFinancialData;
                if (!this.isListEmpty(financialData)) {
                    this.financialData = clientProfileData.getFinancialData;
                }
            }
            if (clientProfileData.hasOwnProperty('getFinancialDataSurest')) {
                let financialDataSurest = clientProfileData.getFinancialDataSurest;
                if (!this.isListEmpty(financialDataSurest)) {
                    this.financialDataSurest = clientProfileData.getFinancialDataSurest;
                }
            }
            if (clientProfileData.hasOwnProperty('getCompetitorData')) {
                let competitorData = clientProfileData.getCompetitorData;
                if (!this.isListEmpty(competitorData)) {
                    this.competitorData = clientProfileData.getCompetitorData;
                }
            }

            if (clientProfileData.hasOwnProperty('getClientSurveyResultData')) {
                let clientSurveyResultData = clientProfileData.getClientSurveyResultData;
                if (!this.isListEmpty(clientSurveyResultData)) {
                    this.clientSurveyResultData = clientProfileData.getClientSurveyResultData;
                }
            }
            if (clientProfileData.hasOwnProperty('medList')) {
                let medListData = clientProfileData.medList;
                if (!this.isListEmpty(medListData)) {
                    this.medListData = clientProfileData.medList;
                }
                //console.log('------faf------' + this.medListData);
            }

            if (clientProfileData.hasOwnProperty('medListSurest')) {
                let medListDataSurest = clientProfileData.medListSurest;
                if (!this.isListEmpty(medListDataSurest)) {
                    this.medListDataSurest = clientProfileData.medListSurest;
                }
            }

            if (clientProfileData.hasOwnProperty('bghData')) {
                let bghData = clientProfileData.bghData;
                if (!this.isListEmpty(bghData)) {
                    this.bghData = clientProfileData.bghData;
                }
            }
            this.loaded = true;
        } else if (response.error) {
            this.loaded = true;
        }

    }



    @wire(getClientPlanData, {
        accountId: '$recordId'
    })
    wiredClientPlanResponse(response) {
        this.refreshObjClientPlan = response;
        if (response.data != undefined && response.data != null) {
            this.isClientPlanData = false;
            let clientPlanData = response.data.clientPlanReturnMap;
            if (clientPlanData.hasOwnProperty('Protect_Renew_Current_Goal')) {
                let protectCurrentGoal = clientPlanData.Protect_Renew_Current_Goal;
                this.defaultSeasonSale = protectCurrentGoal.Sales_Season__c;
                this.protectCurrentGoalStartegy = protectCurrentGoal.Strategies__r;

            }
            if (clientPlanData.hasOwnProperty('Atain_Maintain_Nps_Goal')) {

                let attainNPSGoal = clientPlanData.Atain_Maintain_Nps_Goal;
                this.attainNPSGoalStrategy = attainNPSGoal.Strategies__r;
            }

        } else if (response.error) {
            console.log('Error in getCorporationOverviewData() ==>' + JSON.stringify(response.error));

        }

    }


    isListEmpty(lst) {
        let isListEmpty = true;
        if (lst !== null && lst !== undefined && lst.length !== 0) {
            isListEmpty = false;
        }

        return isListEmpty;

    }



    refreshData() {
        this.loaded = false;
        this.refresh = !this.refresh;
        refreshApex(this.refreshObjClientPlan);
        refreshApex(this.refreshObj)
            .then(() => this.loaded = true)
            .catch(() => this.loaded = true);

    }


    sortClientPlanRecords(clientPlanListTobeSorted, sortBy, sortOrder) {
        var sortedclientPlanList = [];
        var clientPlanRecordMap = {};
        for (let i in clientPlanListTobeSorted) {
            if (clientPlanListTobeSorted[i].hasOwnProperty('Goal__c') && clientPlanListTobeSorted[i].Goal__c !== 'Other client specific goals (Free Form/Write In)') {
                clientPlanRecordMap[clientPlanListTobeSorted[i][sortBy]] = clientPlanListTobeSorted[i];
            }
        }
        for (let i in sortOrder) {
            if (sortOrder[i] !== 'Other client specific goals (Free Form/Write In)') {
                if (clientPlanRecordMap.hasOwnProperty(sortOrder[i])) {
                    sortedclientPlanList.push(clientPlanRecordMap[sortOrder[i]]);
                }
            }
        }
        for (let j in clientPlanListTobeSorted) {
            if (clientPlanListTobeSorted[j].hasOwnProperty('Goal__c') && clientPlanListTobeSorted[j].Goal__c === 'Other client specific goals (Free Form/Write In)') {
                sortedclientPlanList.push(clientPlanListTobeSorted[j]);
            }
        }

        return sortedclientPlanList;
    }

    getListFromValueSeparatedStr(valueSeparatedStr, valueSeparator) {
        var returnList = [];
        if (!this.isBlank(valueSeparatedStr)) {
            if (valueSeparatedStr.indexOf(valueSeparator) !== -1) {
                returnList = valueSeparatedStr.split(valueSeparator);
            } else {
                returnList = valueSeparatedStr;
            }
        }
        return returnList;
    }



    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }


    formatDate() {

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //Because January is 0!
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        today = mm + '/' + dd + '/' + yyyy;
        return today;
    }

   
}