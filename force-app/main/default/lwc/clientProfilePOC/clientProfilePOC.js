/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 03-14-2024
 * @last modified by  : Spoorthy
**/
import {
    LightningElement,
    api,
    wire,
    track
} from 'lwc';
import getClientProfileData from '@salesforce/apex/ClientProfileController.getClientProfileData';
import getTemplateInXML from '@salesforce/apex/ClientProfileEBDDownload.getTemplateInXML';
import getAccountIdList from '@salesforce/apex/ClientProfileEBDDownload.getAccountIdList';
import returnDocIds from '@salesforce/apex/ClientProfileEBDDownload.returnDocIds';


import ClientPlan_Goal_DisplayOrder from '@salesforce/label/c.ClientPlan_Goal_DisplayOrder';
import getClientPlanData from '@salesforce/apex/ClientProfilePrintController.getClientPlanData';


import {
    refreshApex
} from '@salesforce/apex';

export default class ClientProfilePOC extends LightningElement {

    @api recordId;
    @track clientProfileData = {};
    isClientProfileDataEmpty = true;
    corporationOverviewData = {};
    seniorExecutiveData = {};
    coreUHGTeamData = [];
    financialData = {};
    competitorData = {};
    clientSurveyResultData = {};
    companyConsultantData = [];
    currentDealStartDateStr = '';
    currentDealRenewalDateStr = '';
    medListData;
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
    accountIdList = [];
    contentIds = [];
    sfdcBaseURL = '';
    returnDocIdsList = [];
    loaded = true;

    @wire(getAccountIdList)
    wiredgetAccountIdList(response) {
        //console.log(response);
        this.accountIdList = response.data;
    }

    // @wire(returnDocIds)
    // wiredreturnDocIds(response) {
    //     //console.log(JSON.stringify(response));
    //     // this.returnDocIdsList = [];
    //     //console.log('response.data '+response.data);
    //     if(response.data !== null || response.data !== undefined){
    //         this.returnDocIdsList = response.data;
    //     }
    //     this.sfdcBaseURL = window.location.origin;
    //     this.loaded = true;
    // }   
    ebdloaded = false;

    exportEBD() {
        for (var kk = 0; kk < this.accountIdList.length; kk++) {
            this.ebdloaded = true;
            this.loaded = false;
            returnDocIds({
                    accountId: this.accountIdList[kk].Id
                })
                .then(result => {
                    // this.ebdloaded=false;
                    // this.loaded=true;
                    this.returnDocIdsList = result;
                    if (this.returnDocIdsList != null || this.returnDocIdsList != undefined) { //SAMARTH
                        //console.log('Entering EBD if');
                        for (var i = 0; i < this.returnDocIdsList.length; i++) {
                            //console.log('Entering EBD for');
                            window.open(this.sfdcBaseURL + '/sfc/servlet.shepherd/document/download/' + this.returnDocIdsList[i].ContentDocumentId + '?operationContext=S1');
                        }
                    }

                });

            setTimeout(() => {
                this.ebdloaded = false;
                this.loaded = true;
            }, 60000);

        }

        // setTimeout(() => {
        //     this.loaded = true;
        // }, 3000);
        // //console.log('Entering EBD');
        // //console.log('this.returnDocIdsList '+this.returnDocIdsList);
        // if (this.returnDocIdsList != null || this.returnDocIdsList != undefined) { //SAMARTH
        //     //console.log('Entering EBD if');
        //     for (var i = 0; i < this.returnDocIdsList.length; i++) {
        //         //console.log('Entering EBD for');
        //         window.open(this.sfdcBaseURL + '/sfc/servlet.shepherd/document/download/' + this.returnDocIdsList[i].ContentDocumentId + '?operationContext=S1');
        //     }
        // }
    }
    clientloaded = false;

    exportRecords() {

        for (var kk = 0; kk < this.accountIdList.length; kk++) {
            this.loaded = false;
            this.clientloaded = true;
            getTemplateInXML({
                    accountId: this.accountIdList[kk].Id
                })
                .then(result => {

                    this.downloadFiles(result, kk);


                });

        }
        setTimeout(() => {
            this.clientloaded = false;
            this.loaded = true;
        }, 300000);

    }


    downloadFiles(response, kk) {



        let result = response;
        let clientData = result;
        let objectItagesMap = result.objectItags;
        let modxmlString = result.xmlString;
        let clientDataData = clientData;
        let today;
        let otherDataList = [];
        let otherDataObj = {};
        let dataValue = clientData.getSeniorExecutiveData;
        if (clientData.getSeniorExecutiveData != undefined) {

            if (dataValue.OtherExecutiveTitle1__c != undefined && dataValue.OtherExecutiveTitle1__c != '') {
                otherDataObj['OtherExecutiveTitle__c'] = dataValue.OtherExecutiveTitle1__c;
            }
            if (dataValue.OtherExecutiveName1__c != undefined && dataValue.OtherExecutiveName1__c != '') {
                otherDataObj['OtherExecutiveName__c'] = dataValue.OtherExecutiveName1__c;
            }
            if (dataValue.OtherExecutiveResponsibilities1__c != undefined && dataValue.OtherExecutiveResponsibilities1__c != '') {
                otherDataObj['OtherExecutiveResponsibilities__c'] = dataValue.OtherExecutiveResponsibilities1__c;
            }
            if (Object.keys(otherDataObj).length != 0 && otherDataObj.constructor === Object && otherDataObj.OtherExecutiveTitle__c != undefined)
                otherDataList.push(otherDataObj);
            let otherDataObj1 = {};
            if (dataValue.OtherExecutiveTitle2__c != undefined && dataValue.OtherExecutiveTitle2__c != '') {
                otherDataObj1['OtherExecutiveTitle__c'] = dataValue.OtherExecutiveTitle2__c;
            }
            if (dataValue.OtherExecutiveName2__c != undefined && dataValue.OtherExecutiveName2__c != '') {
                otherDataObj1['OtherExecutiveName__c'] = dataValue.OtherExecutiveName2__c;
            }
            if (dataValue.OtherExecutiveResponsibilities2__c != undefined && dataValue.OtherExecutiveResponsibilities2__c != '') {
                otherDataObj1['OtherExecutiveResponsibilities__c'] = dataValue.OtherExecutiveResponsibilities2__c;
            }
            if (Object.keys(otherDataObj1).length != 0 && otherDataObj1.constructor === Object && otherDataObj1.OtherExecutiveTitle__c != undefined)
                otherDataList.push(otherDataObj1);
            let otherDataObj2 = {};
            if (dataValue.OtherExecutiveTitle3__c != undefined && dataValue.OtherExecutiveTitle3__c != '') {
                otherDataObj2['OtherExecutiveTitle__c'] = dataValue.OtherExecutiveTitle3__c;
            }
            if (dataValue.OtherExecutiveName3__c != undefined && dataValue.OtherExecutiveName3__c != '') {
                otherDataObj2['OtherExecutiveName__c'] = dataValue.OtherExecutiveName3__c;
            }
            if (dataValue.OtherExecutiveResponsibilities3__c != undefined && dataValue.OtherExecutiveResponsibilities3__c != '') {
                otherDataObj2['OtherExecutiveResponsibilities__c'] = dataValue.OtherExecutiveResponsibilities3__c;
            }
            if (Object.keys(otherDataObj2).length != 0 && otherDataObj2.constructor === Object && otherDataObj2.OtherExecutiveTitle__c != undefined)
                otherDataList.push(otherDataObj2);
            let otherDataObj3 = {};
            if (dataValue.OtherExecutiveTitle4__c != undefined && dataValue.OtherExecutiveTitle4__c != '') {
                otherDataObj3['OtherExecutiveTitle__c'] = dataValue.OtherExecutiveTitle4__c;
            }
            if (dataValue.OtherExecutiveName4__c != undefined && dataValue.OtherExecutiveName4__c != '') {
                otherDataObj3['OtherExecutiveName__c'] = dataValue.OtherExecutiveName4__c;
            }
            if (dataValue.OtherExecutiveResponsibilities4__c != undefined && dataValue.OtherExecutiveResponsibilities4__c != '') {
                otherDataObj3['OtherExecutiveResponsibilities__c'] = dataValue.OtherExecutiveResponsibilities4__c;
            }
            if (Object.keys(otherDataObj3).length != 0 && otherDataObj3.constructor === Object && otherDataObj3.OtherExecutiveTitle__c != undefined)
                otherDataList.push(otherDataObj3);
            let otherDataObj4 = {};
            if (dataValue.OtherExecutiveTitle5__c != undefined && dataValue.OtherExecutiveTitle5__c != '') {
                otherDataObj4['OtherExecutiveTitle__c'] = dataValue.OtherExecutiveTitle5__c;
            }
            if (dataValue.OtherExecutiveName5__c != undefined && dataValue.OtherExecutiveName5__c != '') {
                otherDataObj4['OtherExecutiveName__c'] = dataValue.OtherExecutiveName5__c;
            }
            if (dataValue.OtherExecutiveResponsibilities5__c != undefined && dataValue.OtherExecutiveResponsibilities5__c != '') {
                otherDataObj4['OtherExecutiveResponsibilities__c'] = dataValue.OtherExecutiveResponsibilities5__c;
            }
            if (Object.keys(otherDataObj4).length != 0 && otherDataObj4.constructor === Object && otherDataObj4.OtherExecutiveTitle__c != undefined)
                otherDataList.push(otherDataObj4);

        }
        //console.log('vother');
        //console.log(otherDataList);

        //console.log(this.protectCurrentGoalStartegy);
        //console.log(this.attainNPSGoalStrategy);
        //let clientDataData = this.sortRecords('Goal__c', result.clientData, this.mandatoryclientData);
        // let clientDataData = this.sortClientPlanRecords(result.clientData, 'Goal__c',
        //     this.getListFromValueSeparatedStr(ClientPlan_Goal_DisplayOrder, ';'));

        for (let objectName in objectItagesMap) {

            if (objectItagesMap.hasOwnProperty(objectName)) {

                if (objectName === 'Account') {
                    //console.log(clientData.getCorporationOverviewData.Current_Deal_Start_Date__c);

                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (key === "CMVPCRRVP__c") {
                            if (clientData.getCorporationOverviewData != undefined) {
                                if (clientData.getCorporationOverviewData.CMVPCRRVP__r != undefined) {
                                    if (clientData.getCorporationOverviewData.CMVPCRRVP__r.Name != undefined) {
                                        value = clientData.getCorporationOverviewData.CMVPCRRVP__r.Name;
                                    }
                                }
                            }
                        } else if (key === "CM_SCE__c") {
                            if (clientData.getCorporationOverviewData != undefined) {
                                if (clientData.getCorporationOverviewData.CM_SCE__r != undefined) {
                                    if (clientData.getCorporationOverviewData.CM_SCE__r.Name != undefined) {
                                        value = clientData.getCorporationOverviewData.CM_SCE__r.Name;
                                    }
                                }
                            }
                        }
                        if (clientData.getSeniorExecutiveData != undefined && key !== "CMVPCRRVP__c" && key !== "CM_SCE__c") {
                            if (clientData.getSeniorExecutiveData[key] !== null && clientData.getSeniorExecutiveData[key] !== '' && clientData.getSeniorExecutiveData[key] !== undefined)
                                value = clientData.getSeniorExecutiveData[key];
                        }
                        if (clientData.getCorporationOverviewData != undefined && key !== "CMVPCRRVP__c" && key !== "CM_SCE__c") {
                            if (clientData.getCorporationOverviewData[key] !== null && clientData.getCorporationOverviewData[key] !== '' && clientData.getCorporationOverviewData[key] !== undefined)
                                if (key == 'BillingAddress') {
                                    if (clientData.getCorporationOverviewData[key] != undefined) {
                                        if (clientData.getCorporationOverviewData[key].street != undefined)
                                            value = clientData.getCorporationOverviewData[key].street + ', ';
                                        if (clientData.getCorporationOverviewData[key].city != undefined)
                                            value = value + clientData.getCorporationOverviewData[key].city + ', ';
                                        if (clientData.getCorporationOverviewData[key].stateCode != undefined)
                                            value = value + clientData.getCorporationOverviewData[key].stateCode;
                                        if (clientData.getCorporationOverviewData[key].postalCode != undefined)
                                            value = value + ' ' + clientData.getCorporationOverviewData[key].postalCode + ', ';
                                        if (clientData.getCorporationOverviewData[key].country != undefined)
                                            value = value + clientData.getCorporationOverviewData[key].country;

                                    }

                                }
                            else if (key == 'AnnualRevenue__c' || key == 'AnnualB2BSpend__c') {
                                value = '$' + this.thousands_separators(clientData.getCorporationOverviewData[key].toFixed(2));
                            } else if (key == 'Fortune_500_Ranking__c' || key == 'Eligible_US_EEs__c' || key == 'Worldwide_EEs__c') {
                                value = this.thousands_separators(clientData.getCorporationOverviewData[key]);
                            } else
                                value = clientData.getCorporationOverviewData[key];

                            if (key == 'bghData') {
                                value = clientData[key];
                            }
                            if (key == 'currentDealStartDate') {
                                value = clientData[key];
                            }
                            if (key == 'currentDealRenewalDate') {
                                value = clientData[key];
                            }
                            if (key == 'surestCurrentDealStartDate') {
                                value = clientData[key];
                            }
                            if (key == 'surestNextRenewalDate') {
                                value = clientData[key];
                            }
                        }

                        // else if (clientData.getSeniorExecutiveData != undefined) {
                        //     if (clientData.getSeniorExecutiveData[key] !== null && clientData.getSeniorExecutiveData[key] !== '' && clientData.getSeniorExecutiveData[key] !== undefined)
                        //         value = clientData.getSeniorExecutiveData[key];
                        // }
                        // } else if (key === 'today_Date') {
                        //     today = this.formatDate();
                        //     value = today;
                        // }

                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }

                } else if (objectName === 'Contact') {
                    let itagSets = objectItagesMap[objectName];
                    let startItag = '';
                    let endItag = '';
                    let setCount = 0;
                    for (let itagStrIndex in itagSets) {
                        setCount++;
                        if (setCount === 1) {
                            startItag = itagSets[itagStrIndex];
                        }
                        if (setCount === itagSets.length) {
                            endItag = itagSets[itagStrIndex];
                        }
                    }
                    startItag = '%%' + objectName + '.' + startItag + '@@';
                    endItag = '%%' + objectName + '.' + endItag + '@@';
                    //console.log('startItag' + startItag + ' : endItag : ' + endItag);
                    let startIndex = modxmlString.lastIndexOf(startItag);
                    let endIndex = modxmlString.indexOf(endItag);

                    let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                    let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                    endHeaderIdx += '</w:tbl>'.length;
                    let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);

                    let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                    let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                    if (stIdx === -1) {
                        stIdx = 0;
                    }

                    if (stTableIdx === -1) {
                        stTableIdx = 0;
                    }

                    let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                    let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);


                    endIdx += '</w:tr>'.length;
                    endTableIdx += '</w:tbl>'.length;

                    let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                    let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);


                    modxmlString = this.returnChildData(rowToReccurse, TableToReccurse, clientDataData, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);



                } else if (objectName === 'Financial') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getFinancialData != undefined) {
                            if (key === "Year1") {
                                if (clientData.getFinancialData.YearArrayMed[3] != 0)
                                    value = clientData.getFinancialData.YearArrayMed[3];
                            } else if (key === "Year2") {
                                if (clientData.getFinancialData.YearArrayMed[2] != 0)
                                    value = clientData.getFinancialData.YearArrayMed[2];
                            } else if (key === "Year3") {
                                if (clientData.getFinancialData.YearArrayMed[1] != 0)
                                    value = clientData.getFinancialData.YearArrayMed[1];
                            } else if (key === "Year4") {
                                if (clientData.getFinancialData.YearArrayMed[0] != 0)
                                    value = 'Projected ' + clientData.getFinancialData.YearArrayMed[0];
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'OptumRx') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getFinancialData != undefined) {
                            if (key === "Year1") {
                                if (clientData.getFinancialData.YearArrayRx[3] != 0)
                                    value = clientData.getFinancialData.YearArrayRx[3];
                            } else if (key === "Year2") {
                                if (clientData.getFinancialData.YearArrayRx[2] != 0)
                                    value = clientData.getFinancialData.YearArrayRx[2];
                            } else if (key === "Year3") {
                                if (clientData.getFinancialData.YearArrayRx[1] != 0)
                                    value = clientData.getFinancialData.YearArrayRx[1];
                            } else if (key === "Year4") {
                                if (clientData.getFinancialData.YearArrayRx[0] != 0)
                                    value = 'Projected ' + clientData.getFinancialData.YearArrayRx[0];
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'OtherSpeciality') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (key) {
                            if (clientData.getCompetitorData != undefined)
                                if (clientData.getCompetitorData[key] != undefined)
                                    value = clientData.getCompetitorData[key];
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }

                } else if (objectName === 'NPS') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getClientSurveyResultData != undefined) {
                            if (key == 'Year1') {
                                value = clientData.getClientSurveyResultData.LastFourYears[3];
                            } else if (key == 'Year2') {
                                value = clientData.getClientSurveyResultData.LastFourYears[2];
                            } else if (key == 'Year3') {
                                value = clientData.getClientSurveyResultData.LastFourYears[1];
                            } else if (key == 'Year4') {
                                value = clientData.getClientSurveyResultData.LastFourYears[0];
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'Likelihood') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getClientSurveyResultData != undefined) {
                            if (key == 'Year1') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[0][1];
                            } else if (key == 'Year2') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[0][2];
                            } else if (key == 'Year3') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[0][3];
                            } else if (key == 'Year4') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[0][4];
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'Overall') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getClientSurveyResultData != undefined) {
                            if (key == 'Year1') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[1][1];
                            } else if (key == 'Year2') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[1][2];
                            } else if (key == 'Year3') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[1][3];
                            } else if (key == 'Year4') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[1][4];
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'Promoter') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getClientSurveyResultData != undefined) {
                            if (key == 'Year1') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[2][1];
                            } else if (key == 'Year2') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[2][2];
                            } else if (key == 'Year3') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[2][3];
                            } else if (key == 'Year4') {
                                value = clientData.getClientSurveyResultData.CSRFinalList[2][4];
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'Revenue') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getFinancialData != undefined) {
                            if (key == 'Year1V') {
                                if (clientData.getFinancialData.Medical[1][1] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[1][1]);
                            } else if (key == 'Year2V') {
                                if (clientData.getFinancialData.Medical[1][2] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[1][2]);
                            } else if (key == 'Year3V') {
                                if (clientData.getFinancialData.Medical[1][3] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[1][3]);
                            } else if (key == 'Year4V') {
                                if (clientData.getFinancialData.Medical[1][4] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[1][4]);
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'Membership') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getFinancialData != undefined) {
                            if (key == 'Year1V') {
                                if (clientData.getFinancialData.Medical[0][1] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[0][1]);
                            } else if (key == 'Year2V') {
                                if (clientData.getFinancialData.Medical[0][2] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[0][2]);
                            } else if (key == 'Year3V') {
                                if (clientData.getFinancialData.Medical[0][3] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[0][3]);
                            } else if (key == 'Year4V') {
                                if (clientData.getFinancialData.Medical[0][4] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[0][4]);
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'Margin') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getFinancialData != undefined) {
                            if (key == 'Year1V') {
                                if (clientData.getFinancialData.Medical[2][1] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[2][1]);
                            } else if (key == 'Year2V') {
                                if (clientData.getFinancialData.Medical[2][2] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[2][2]);
                            } else if (key == 'Year3V') {
                                if (clientData.getFinancialData.Medical[2][3] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[2][3]);
                            } else if (key == 'Year4V') {
                                if (clientData.getFinancialData.Medical[2][4] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.Medical[2][4]);
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'OMargin') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getFinancialData != undefined) {
                            if (key == 'Year1V') {
                                if (clientData.getFinancialData.rxData[2][1] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[2][1]);
                            } else if (key == 'Year2V') {
                                if (clientData.getFinancialData.rxData[2][2] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[2][2]);
                            } else if (key == 'Year3V') {
                                if (clientData.getFinancialData.rxData[2][3] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[2][3]);
                            } else if (key == 'Year4V') {
                                if (clientData.getFinancialData.rxData[2][4] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[2][4]);
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'ORevenue') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getFinancialData != undefined) {
                            if (key == 'Year1V') {
                                if (clientData.getFinancialData.rxData[1][1] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[1][1]);
                            } else if (key == 'Year2V') {
                                if (clientData.getFinancialData.rxData[1][2] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[1][2]);
                            } else if (key == 'Year3V') {
                                if (clientData.getFinancialData.rxData[1][3] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[1][3]);
                            } else if (key == 'Year4V') {
                                if (clientData.getFinancialData.rxData[1][4] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[1][4]);
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'Optum') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getFinancialData != undefined) {
                            if (key == 'Year1V') {
                                if (clientData.getFinancialData.rxData[0][1] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[0][1]);
                            } else if (key == 'Year2V') {
                                if (clientData.getFinancialData.rxData[0][2] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[0][2]);
                            } else if (key == 'Year3V') {
                                if (clientData.getFinancialData.rxData[0][3] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[0][3]);
                            } else if (key == 'Year4V') {
                                if (clientData.getFinancialData.rxData[0][4] != '')
                                    value = this.thousands_separators(clientData.getFinancialData.rxData[0][4]);
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'Other') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (key == 'Type_Of_Products_Services_Provided__c') {
                            if (clientData.getCompetitorData != undefined)
                                if (clientData.getCompetitorData.otherproductsCompetitor != undefined)
                                    if (clientData.getCompetitorData.otherproductsCompetitor.Type_of_Products_Services_Provided__c != undefined)
                                        value = clientData.getCompetitorData.otherproductsCompetitor.Type_of_Products_Services_Provided__c;
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'Medical') {
                    let lastYear;
                    let medList = clientData.medList;
                    let medListSurest = clientData.medListSurest;
                    let yearlist = {
                        Year1: '',
                        Year2: '',
                        Year3: '',
                        Year4: '',
                        Year1V: '',
                        Year2V: '',
                        Year3V: '',
                        Year4V: '',
                    };
                    let yearlistSurest = {
                        YearS1: '',YearS2: '',YearS3: '',YearS4: '',YearS1V: '',YearS2V: '',YearS3V: '',YearS4V: '',
                    };
                    if (medList != undefined)
                        for (var i = 0; i < medList.length; i++) {
                            if (i == 4) break;
                            let yearVal = parseInt(medList[i].Year__c);//(new Date(medList[i].Year__c)).getFullYear();
                            yearlist['Year' + (4 - i)] = yearVal;
                            if (medList[i].Policy_level_medical_trends__c != undefined) {
                                yearlist['Year' + (4 - i) + 'Value'] = medList[i].Policy_level_medical_trends__c + '%';
                                // yearValueList[3-i]=medList[i].Policy_level_medical_trends__c + '%';
                            }
                        }
                    if (medListSurest != undefined)
                        for (var i = 0; i < medListSurest.length; i++) {
                            if (i == 4) break;
                            let yearVal = parseInt(medListSurest[i].Year__c);//(new Date(medList[i].Year__c)).getFullYear();
                            yearlistSurest['YearS' + (4 - i)] = yearVal;
                            if (medListSurest[i].Policy_level_medical_trends__c != undefined) {
                                yearlistSurest['YearS' + (4 - i) + 'Value'] = medListSurest[i].Policy_level_medical_trends__c + '%';
                            }
                        }
                    console.log('v' + yearlist)
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        let value2 = '';
                        if (key) {
                            value = yearlist[key];
                            value2 = yearlistSurest[key];
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                        if (value2 !== '' && value2 !== null && value2 !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value2));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                } else if (objectName === 'MedicalCarrier') {

                    let itagSets = objectItagesMap[objectName];
                    let startItag = '';
                    let endItag = '';
                    let setCount = 0;
                    for (let itagStrIndex in itagSets) {
                        setCount++;
                        if (setCount === 1) {
                            startItag = itagSets[itagStrIndex];
                        }
                        if (setCount === itagSets.length) {
                            endItag = itagSets[itagStrIndex];
                        }
                    }
                    startItag = '%%' + objectName + '.' + startItag + '@@';
                    endItag = '%%' + objectName + '.' + endItag + '@@';
                    //console.log('startItag' + startItag + ' : endItag : ' + endItag);
                    let startIndex = modxmlString.lastIndexOf(startItag);
                    let endIndex = modxmlString.indexOf(endItag);

                    let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                    let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                    endHeaderIdx += '</w:tbl>'.length;
                    let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);

                    let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                    let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                    if (stIdx === -1) {
                        stIdx = 0;
                    }

                    if (stTableIdx === -1) {
                        stTableIdx = 0;
                    }

                    let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                    let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);


                    endIdx += '</w:tr>'.length;
                    endTableIdx += '</w:tbl>'.length;

                    let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                    let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);
                    let resultList = [];
                    if (clientData.getCompetitorData != undefined)
                        if (clientData.getCompetitorData.medicalCompetitorList != undefined)
                            resultList = clientData.getCompetitorData.medicalCompetitorList;
                    modxmlString = this.returnChildDataMedicalCarrier(rowToReccurse, TableToReccurse, resultList, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);


                } else if (objectName === 'Dental') {
                    /* for (let k in objectItagesMap[objectName]) {
                         let key = objectItagesMap[objectName][k];
                         let replaceItagName = '%%' + objectName + '.' + key + '@@';
                         let value = '';
                         if (key == 'Name') {
                             if (clientData.getCompetitorData != undefined)
                                 if (clientData.getCompetitorData.dentalCompetitorList[0] != undefined)
                                     if (clientData.getCompetitorData.dentalCompetitorList[0].CompetitorAccount__r != undefined)
                                         value = clientData.getCompetitorData.dentalCompetitorList[0].CompetitorAccount__r.Name;
                         } else if (key == 'MembershipEstimate__c') {
                             if (clientData.getCompetitorData != undefined)
                                 if (clientData.getCompetitorData.dentalCompetitorList[0] != undefined)
                                     if (clientData.getCompetitorData.dentalCompetitorList[0].NumberOfMembersHeld__c != undefined)
                                         value = clientData.getCompetitorData.dentalCompetitorList[0].NumberOfMembersHeld__c;
                         } else if (key == 'Total') {
                             if (clientData.getCompetitorData != undefined)
                                 if (clientData.getCompetitorData.dentalTotalCompetitorObj != undefined)
                                     if (clientData.getCompetitorData.dentalTotalCompetitorObj.NumberOfMembersHeld__c != undefined)
                                         value = clientData.getCompetitorData.dentalTotalCompetitorObj.NumberOfMembersHeld__c;
                         }
                         if (value !== '' && value !== null && value !== undefined) {
                             modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                         } else {
                             modxmlString = modxmlString.split(replaceItagName).join('');
                         }
                     }*/

                    let itagSets = objectItagesMap[objectName];
                    let startItag = '';
                    let endItag = '';
                    let setCount = 0;
                    for (let itagStrIndex in itagSets) {
                        setCount++;
                        if (setCount === 1) {
                            startItag = itagSets[itagStrIndex];
                        }
                        if (setCount === itagSets.length) {
                            endItag = itagSets[itagStrIndex];
                        }
                    }
                    startItag = '%%' + objectName + '.' + startItag + '@@';
                    endItag = '%%' + objectName + '.' + endItag + '@@';
                    //console.log('startItag' + startItag + ' : endItag : ' + endItag);
                    let startIndex = modxmlString.lastIndexOf(startItag);
                    let endIndex = modxmlString.indexOf(endItag);

                    let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                    let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                    endHeaderIdx += '</w:tbl>'.length;
                    let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);

                    let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                    let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                    if (stIdx === -1) {
                        stIdx = 0;
                    }

                    if (stTableIdx === -1) {
                        stTableIdx = 0;
                    }

                    let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                    let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);


                    endIdx += '</w:tr>'.length;
                    endTableIdx += '</w:tbl>'.length;

                    let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                    let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);
                    let resultList = [];
                    if (clientData.getCompetitorData != undefined)
                        if (clientData.getCompetitorData.dentalCompetitorList != undefined)
                            resultList = clientData.getCompetitorData.dentalCompetitorList;
                    modxmlString = this.returnChildDataVisionPharma(rowToReccurse, TableToReccurse, resultList, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);

                } else if (objectName === 'Pharma') {
                    /*  for (let k in objectItagesMap[objectName]) {
                          let key = objectItagesMap[objectName][k];
                          let replaceItagName = '%%' + objectName + '.' + key + '@@';
                          let value = '';
                          if (key == 'Name') {
                              if (clientData.getCompetitorData != undefined)
                                  if (clientData.getCompetitorData.pharmacyCompetitorList[0] != undefined)
                                      if (clientData.getCompetitorData.pharmacyCompetitorList[0].CompetitorAccount__r != undefined)
                                          value = clientData.getCompetitorData.pharmacyCompetitorList[0].CompetitorAccount__r.Name;
                          } else if (key == 'NumberOfMembersHeld__c') {
                              if (clientData.getCompetitorData != undefined)
                                  if (clientData.getCompetitorData.pharmacyCompetitorList[0] != undefined)
                                      if (clientData.getCompetitorData.pharmacyCompetitorList[0].NumberOfMembersHeld__c != undefined)
                                          value = clientData.getCompetitorData.pharmacyCompetitorList[0].NumberOfMembersHeld__c;
                          } else if (key == 'Total') {
                              if (clientData.getCompetitorData != undefined)
                                  if (clientData.getCompetitorData.pharmacyTotalCompetitorObj != undefined)
                                      if (clientData.getCompetitorData.pharmacyTotalCompetitorObj.NumberOfMembersHeld__c != undefined)
                                          value = clientData.getCompetitorData.pharmacyTotalCompetitorObj.NumberOfMembersHeld__c;
                          }
                          if (value !== '' && value !== null && value !== undefined) {
                              modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                          } else {
                              modxmlString = modxmlString.split(replaceItagName).join('');
                          }
                      }*/
                    let itagSets = objectItagesMap[objectName];
                    let startItag = '';
                    let endItag = '';
                    let setCount = 0;
                    for (let itagStrIndex in itagSets) {
                        setCount++;
                        if (setCount === 1) {
                            startItag = itagSets[itagStrIndex];
                        }
                        if (setCount === itagSets.length) {
                            endItag = itagSets[itagStrIndex];
                        }
                    }
                    startItag = '%%' + objectName + '.' + startItag + '@@';
                    endItag = '%%' + objectName + '.' + endItag + '@@';
                    //console.log('startItag' + startItag + ' : endItag : ' + endItag);
                    let startIndex = modxmlString.lastIndexOf(startItag);
                    let endIndex = modxmlString.indexOf(endItag);

                    let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                    let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                    endHeaderIdx += '</w:tbl>'.length;
                    let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);

                    let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                    let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                    if (stIdx === -1) {
                        stIdx = 0;
                    }

                    if (stTableIdx === -1) {
                        stTableIdx = 0;
                    }

                    let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                    let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);


                    endIdx += '</w:tr>'.length;
                    endTableIdx += '</w:tbl>'.length;

                    let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                    let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);
                    let resultList = [];
                    if (clientData.getCompetitorData != undefined)
                        if (clientData.getCompetitorData.pharmacyCompetitorList != undefined)
                            resultList = clientData.getCompetitorData.pharmacyCompetitorList;
                    modxmlString = this.returnChildDataVisionPharma(rowToReccurse, TableToReccurse, resultList, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);

                } else if (objectName === 'Vision') {
                    // for (let k in objectItagesMap[objectName]) {
                    //     let key = objectItagesMap[objectName][k];
                    //     let replaceItagName = '%%' + objectName + '.' + key + '@@';
                    //     let value = '';
                    //     if (key == 'Name') {
                    //         if (clientData.getCompetitorData != undefined)
                    //             if (clientData.getCompetitorData.visionCompetitorList[0] != undefined)
                    //                 if (clientData.getCompetitorData.visionCompetitorList[0].CompetitorAccount__r != undefined)
                    //                     if (clientData.getCompetitorData.visionCompetitorList[0].CompetitorAccount__r.Name != undefined)
                    //                         value = clientData.getCompetitorData.visionCompetitorList[0].CompetitorAccount__r.Name;
                    //     } else if (key == 'NumberOfMembersHeld__c') {
                    //         if (clientData.getCompetitorData != undefined)
                    //             if (clientData.getCompetitorData.visionCompetitorList[0] != undefined)
                    //                 if (clientData.getCompetitorData.visionCompetitorList[0].NumberOfMembersHeld__c != undefined)

                    //                     value = clientData.getCompetitorData.visionCompetitorList[0].NumberOfMembersHeld__c;
                    //     } else if (key == 'Total') {
                    //         if (clientData.getCompetitorData != undefined)
                    //             if (clientData.getCompetitorData.visionTotalCompetitorObj != undefined)
                    //                 if (clientData.getCompetitorData.visionTotalCompetitorObj.NumberOfMembersHeld__c != undefined)

                    //                     value = clientData.getCompetitorData.visionTotalCompetitorObj.NumberOfMembersHeld__c;
                    //     }
                    //     if (value !== '' && value !== null && value !== undefined) {
                    //         modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    //     } else {
                    //         modxmlString = modxmlString.split(replaceItagName).join('');
                    //     }
                    // }
                    let itagSets = objectItagesMap[objectName];
                    let startItag = '';
                    let endItag = '';
                    let setCount = 0;
                    for (let itagStrIndex in itagSets) {
                        setCount++;
                        if (setCount === 1) {
                            startItag = itagSets[itagStrIndex];
                        }
                        if (setCount === itagSets.length) {
                            endItag = itagSets[itagStrIndex];
                        }
                    }
                    startItag = '%%' + objectName + '.' + startItag + '@@';
                    endItag = '%%' + objectName + '.' + endItag + '@@';
                    //console.log('startItag' + startItag + ' : endItag : ' + endItag);
                    let startIndex = modxmlString.lastIndexOf(startItag);
                    let endIndex = modxmlString.indexOf(endItag);

                    let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                    let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                    endHeaderIdx += '</w:tbl>'.length;
                    let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);

                    let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                    let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                    if (stIdx === -1) {
                        stIdx = 0;
                    }

                    if (stTableIdx === -1) {
                        stTableIdx = 0;
                    }

                    let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                    let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);


                    endIdx += '</w:tr>'.length;
                    endTableIdx += '</w:tbl>'.length;

                    let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                    let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);
                    let resultList = [];
                    if (clientData.getCompetitorData != undefined)
                        if (clientData.getCompetitorData.visionCompetitorList != undefined)
                            resultList = clientData.getCompetitorData.visionCompetitorList;
                    modxmlString = this.returnChildDataVisionPharma(rowToReccurse, TableToReccurse, resultList, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);

                } else if (objectName === 'SeniorOther') {
                    let itagSets = objectItagesMap[objectName];
                    let startItag = '';
                    let endItag = '';
                    let setCount = 0;
                    for (let itagStrIndex in itagSets) {
                        setCount++;
                        if (setCount === 1) {
                            startItag = itagSets[itagStrIndex];
                        }
                        if (setCount === itagSets.length) {
                            endItag = itagSets[itagStrIndex];
                        }
                    }
                    startItag = '%%' + objectName + '.' + startItag + '@@';
                    endItag = '%%' + objectName + '.' + endItag + '@@';
                    //console.log('startItag' + startItag + ' : endItag : ' + endItag);
                    let startIndex = modxmlString.lastIndexOf(startItag);
                    let endIndex = modxmlString.indexOf(endItag);

                    let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                    let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                    endHeaderIdx += '</w:tbl>'.length;
                    let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);

                    let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                    let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                    if (stIdx === -1) {
                        stIdx = 0;
                    }

                    if (stTableIdx === -1) {
                        stTableIdx = 0;
                    }

                    let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                    let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);


                    endIdx += '</w:tr>'.length;
                    endTableIdx += '</w:tbl>'.length;

                    let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                    let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);


                    modxmlString = this.returnChildDataSeniorOther(rowToReccurse, TableToReccurse, otherDataList, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);



                } else if (objectName === 'Attain') {
                    let itagSets = objectItagesMap[objectName];
                    let startItag = '';
                    let endItag = '';
                    let setCount = 0;
                    for (let itagStrIndex in itagSets) {
                        setCount++;
                        if (setCount === 1) {
                            startItag = itagSets[itagStrIndex];
                        }
                        if (setCount === itagSets.length) {
                            endItag = itagSets[itagStrIndex];
                        }
                    }
                    startItag = '%%' + objectName + '.' + startItag + '@@';
                    endItag = '%%' + objectName + '.' + endItag + '@@';
                    //console.log('startItag' + startItag + ' : endItag : ' + endItag);
                    let startIndex = modxmlString.lastIndexOf(startItag);
                    let endIndex = modxmlString.indexOf(endItag);

                    let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                    let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                    endHeaderIdx += '</w:tbl>'.length;
                    let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);

                    let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                    let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                    if (stIdx === -1) {
                        stIdx = 0;
                    }

                    if (stTableIdx === -1) {
                        stTableIdx = 0;
                    }

                    let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                    let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);


                    endIdx += '</w:tr>'.length;
                    endTableIdx += '</w:tbl>'.length;

                    let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                    let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);


                    modxmlString = this.returnChildDataAttain(rowToReccurse, TableToReccurse, this.attainNPSGoalStrategy, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);



                } else if (objectName === 'Protect') {
                    let itagSets = objectItagesMap[objectName];
                    let startItag = '';
                    let endItag = '';
                    let setCount = 0;
                    for (let itagStrIndex in itagSets) {
                        setCount++;
                        if (setCount === 1) {
                            startItag = itagSets[itagStrIndex];
                        }
                        if (setCount === itagSets.length) {
                            endItag = itagSets[itagStrIndex];
                        }
                    }
                    startItag = '%%' + objectName + '.' + startItag + '@@';
                    endItag = '%%' + objectName + '.' + endItag + '@@';
                    //console.log('startItag' + startItag + ' : endItag : ' + endItag);
                    let startIndex = modxmlString.lastIndexOf(startItag);
                    let endIndex = modxmlString.indexOf(endItag);

                    let stHeaderIdx = modxmlString.lastIndexOf('<w:tbl>', startIndex);
                    let endHeaderIdx = modxmlString.indexOf('</w:tbl>', endIndex);
                    endHeaderIdx += '</w:tbl>'.length;
                    let TableHeader = modxmlString.substring(stHeaderIdx, endHeaderIdx);

                    let stIdx = modxmlString.lastIndexOf('<w:tr ', startIndex);
                    let stTableIdx = modxmlString.lastIndexOf('<w:tbl>', stIdx);

                    if (stIdx === -1) {
                        stIdx = 0;
                    }

                    if (stTableIdx === -1) {
                        stTableIdx = 0;
                    }

                    let endIdx = modxmlString.indexOf('</w:tr>', endIndex);
                    let endTableIdx = modxmlString.indexOf('</w:tbl>', endIdx);


                    endIdx += '</w:tr>'.length;
                    endTableIdx += '</w:tbl>'.length;

                    let rowToReccurse = modxmlString.substring(stIdx, endIdx);
                    let TableToReccurse = modxmlString.substring(stTableIdx, endTableIdx);


                    modxmlString = this.returnChildDataProtect(rowToReccurse, TableToReccurse, this.protectCurrentGoalStartegy, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);



                } else if (objectName === 'MedicalCarrierTotal') {
                    for (let k in objectItagesMap[objectName]) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';
                        if (clientData.getCompetitorData != undefined) {
                            if (key == 'MedicalTotal') {
                                if (clientData.getCompetitorData != undefined)
                                    if (clientData.getCompetitorData.medicalTotalCompetitorObj != undefined)
                                        if (clientData.getCompetitorData.medicalTotalCompetitorObj.MembershipEstimate__c != undefined)
                                            value = this.thousands_separators(clientData.getCompetitorData.medicalTotalCompetitorObj.MembershipEstimate__c);

                            } else if (key == 'PharmaTotal') {
                                if (clientData.getCompetitorData != undefined)
                                    if (clientData.getCompetitorData.pharmacyTotalCompetitorObj != undefined)
                                        if (clientData.getCompetitorData.pharmacyTotalCompetitorObj.NumberOfMembersHeld__c != undefined)
                                            value = this.thousands_separators(clientData.getCompetitorData.pharmacyTotalCompetitorObj.NumberOfMembersHeld__c);
                            } else if (key == 'DentalTotal') {
                                if (clientData.getCompetitorData != undefined)
                                    if (clientData.getCompetitorData.dentalTotalCompetitorObj != undefined)
                                        if (clientData.getCompetitorData.dentalTotalCompetitorObj.NumberOfMembersHeld__c != undefined)
                                            value = this.thousands_separators(clientData.getCompetitorData.dentalTotalCompetitorObj.NumberOfMembersHeld__c);
                            } else if (key == 'VisionTotal') {
                                if (clientData.getCompetitorData != undefined)
                                    if (clientData.getCompetitorData.visionTotalCompetitorObj != undefined)
                                        if (clientData.getCompetitorData.visionTotalCompetitorObj.NumberOfMembersHeld__c != undefined)

                                            value = this.thousands_separators(clientData.getCompetitorData.visionTotalCompetitorObj.NumberOfMembersHeld__c);
                            }
                        }
                        if (value !== '' && value !== null && value !== undefined) {
                            modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                        } else {
                            modxmlString = modxmlString.split(replaceItagName).join('');
                        }
                    }
                }
            }
        }



        let a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([modxmlString]));
        let templateName = 'Client Profile -' + clientData.getCorporationOverviewData.Name;
        // if(clientData.medicalDirector!='')
        //  templateName = templateName+' - '+clientData.medicalDirector;
        //  if(clientData.clinicalNurse!='')
        //  templateName = templateName+' - '+clientData.clinicalNurse;
        a.download = templateName + '.doc';
        document.body.appendChild(a);
        a.click();
        // const event = new ShowToastEvent({
        //     title: '',
        //     message: 'Client Plan Printed Successfully.',
        // });
        // this.dispatchEvent(event);
        this.cssDisplay = 'hidemodel';
        //this.loaded = true;
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

    returnChildData(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {
        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData.getCompanyConsultantData;
        let TableToIterate = TableToReccurse;
        let allStrategyRows = '';
        count = count + 1;
        let eachRow = rowToReccurse;
        let startStrategyIndex = eachRow.lastIndexOf('%%Contact.LastName@@');
        let endStartegyIndex = eachRow.indexOf('%%Contact.MailingCity@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;

        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);


        //console.log('v' + strategyList);
        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (key == 'MailingCity') {
                    if (strategyList[j].Contact[key] !== null && strategyList[j].Contact[key] !== '' && strategyList[j].Contact[key] !== undefined) {
                        let value = strategyList[j].Contact[key];
                        if (strategyList[j].Contact['MailingStateCode'] !== null && strategyList[j].Contact['MailingStateCode'] !== '' && strategyList[j].Contact['MailingStateCode'] !== undefined) {
                            value = value + ', ' + strategyList[j].Contact['MailingStateCode'];
                        }
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    } else if (strategyList[j].Contact['MailingStateCode'] !== null && strategyList[j].Contact['MailingStateCode'] !== '' && strategyList[j].Contact['MailingStateCode'] !== undefined) {
                        let value = strategyList[j].Contact['MailingStateCode'];
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    }
                }
                if (key != 'MailingCity' && strategyList[j].Contact[key] !== null && strategyList[j].Contact[key] !== '' && strategyList[j].Contact[key] !== undefined) {
                    let value = strategyList[j].Contact[key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                } else if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = '';
                    if (key == 'Primary__c') {
                        if (strategyList[j][key]) {
                            value = 'Yes';
                        } else {
                            value = '';
                        }
                    } else
                        value = strategyList[j][key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                } else if (strategyList[j].Contact.Account[key] !== null && strategyList[j].Contact.Account[key] !== '' && strategyList[j].Contact.Account[key] !== undefined) {
                    let value = strategyList[j].Contact.Account[key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                } else {
                    //console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }
            }

            allStrategyRows += eachStrategyRow;

        }

        //eachRow = this.replaceBetweenString(stStrategyIndxTbl,endStrategyIndxTbl,eachRow,allStrategyRows);
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;



        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;

    }

    returnChildDataSeniorOther(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {

        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;

        let allStrategyRows = '';

        count = count + 1;
        let eachRow = rowToReccurse;


        let startStrategyIndex = eachRow.lastIndexOf('%%SeniorOther.OtherExecutiveName__c@@');
        let endStartegyIndex = eachRow.indexOf('%%SeniorOther.OtherExecutiveResponsibilities__c@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;

        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                } else {
                    //console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }
            }

            allStrategyRows += eachStrategyRow;

        }

        //eachRow = this.replaceBetweenString(stStrategyIndxTbl,endStrategyIndxTbl,eachRow,allStrategyRows);
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;



        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;


    }

    returnChildDataAttain(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {

        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;

        let allStrategyRows = '';

        count = count + 1;
        let eachRow = rowToReccurse;


        let startStrategyIndex = eachRow.lastIndexOf('%%Attain.Action_Steps_PlannedTaken__c@@');
        let endStartegyIndex = eachRow.indexOf('%%Attain.Action_Steps_PlannedTaken__c@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;

        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];
                    if (strategyList[j][key] == 'Other (please specify below)') {
                        if (strategyList[j]['Strategy_Write_In__c'] != undefined)
                            value = strategyList[j]['Strategy_Write_In__c'];
                        else
                            value = '';
                    }
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                } else {
                    //console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }
            }

            allStrategyRows += eachStrategyRow;

        }

        //eachRow = this.replaceBetweenString(stStrategyIndxTbl,endStrategyIndxTbl,eachRow,allStrategyRows);
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;



        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;


    }

    returnChildDataProtect(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {

        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;

        let allStrategyRows = '';

        count = count + 1;
        let eachRow = rowToReccurse;


        let startStrategyIndex = eachRow.lastIndexOf('%%Protect.Action_Steps_PlannedTaken__c@@');
        let endStartegyIndex = eachRow.indexOf('%%Protect.Action_Steps_PlannedTaken__c@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;

        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                    let value = strategyList[j][key];
                    if (strategyList[j][key] == 'Other (please specify below)') {
                        if (strategyList[j]['Strategy_Write_In__c'] != undefined)
                            value = strategyList[j]['Strategy_Write_In__c'];
                        else
                            value = '';
                    }
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                } else {
                    //console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }
            }

            allStrategyRows += eachStrategyRow;

        }

        //eachRow = this.replaceBetweenString(stStrategyIndxTbl,endStrategyIndxTbl,eachRow,allStrategyRows);
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;



        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;


    }

    returnChildDataMedicalCarrier(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {

        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;

        let allStrategyRows = '';

        count = count + 1;
        let eachRow = rowToReccurse;

        let indexStart = '%%' + objectName + '.' + 'MembershipEstimate__c@@';
        let indexEnd = '%%' + objectName + '.' + 'MembershipEstimate__c@@';
        let startStrategyIndex = eachRow.lastIndexOf(indexStart);
        let endStartegyIndex = eachRow.indexOf(indexEnd);
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;

        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (key == 'Name') {
                    if (strategyList[j].CompetitorAccount__r != undefined) {
                        let value = strategyList[j].CompetitorAccount__r.Name;
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));

                    }
                } else if (key == 'MembershipEstimate__c') {
                    if (strategyList[j].MembershipEstimate__c != undefined) {
                        let value = this.thousands_separators(strategyList[j].MembershipEstimate__c);
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));

                    }

                } else {
                    //console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }
            }

            allStrategyRows += eachStrategyRow;

        }

        //eachRow = this.replaceBetweenString(stStrategyIndxTbl,endStrategyIndxTbl,eachRow,allStrategyRows);
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;



        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;


    }


    returnChildDataVisionPharma(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {

        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;
        let strategyList = NPSFinalData;
        let TableToIterate = TableToReccurse;

        let allStrategyRows = '';

        count = count + 1;
        let eachRow = rowToReccurse;
        let indexStart = '%%' + objectName + '.' + 'NumberOfMembersHeld__c@@';
        let indexEnd = '%%' + objectName + '.' + 'NumberOfMembersHeld__c@@';
        let startStrategyIndex = eachRow.lastIndexOf(indexStart);
        let endStartegyIndex = eachRow.indexOf(indexEnd);

        // let startStrategyIndex = eachRow.lastIndexOf('%%MedicalCarrier.MembershipEstimate__c@@');
        // let endStartegyIndex = eachRow.indexOf('%%MedicalCarrier.MembershipEstimate__c@@');
        let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
        let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
        endStrategyIndxTbl += '</w:tr>'.length;

        let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
        for (let j in strategyList) {
            let eachStrategyRow = rowToStrategyReccurse;
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                if (key == 'Name') {
                    if (strategyList[j].CompetitorAccount__r != undefined) {
                        let value = strategyList[j].CompetitorAccount__r.Name;
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));

                    }
                } else if (key == 'NumberOfMembersHeld__c') {
                    if (strategyList[j].NumberOfMembersHeld__c != undefined) {
                        let value = this.thousands_separators(strategyList[j].NumberOfMembersHeld__c);
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));

                    }

                } else {
                    //console.log('strategyList[j][key] ::::::: ');
                    eachStrategyRow = eachStrategyRow.split(replaceItagName).join('');
                }
            }

            allStrategyRows += eachStrategyRow;

        }

        //eachRow = this.replaceBetweenString(stStrategyIndxTbl,endStrategyIndxTbl,eachRow,allStrategyRows);
        let beforeStrategy = eachRow.substring(0, stStrategyIndxTbl);
        let afterStrategy = eachRow.substring(endStrategyIndxTbl);

        let updatedVal = beforeStrategy + allStrategyRows + afterStrategy;
        totalRows += updatedVal;



        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;


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

    replaceXmlSpecialCharacters(value) {
        if (value != null && value !== undefined && value !== '') {
            if (typeof (value) == 'string') {
                value = value.replace(/&/g, '&amp;');
                value = value.replace(/>/g, '&gt;');
                value = value.replace(/</g, '&lt;');
                value = value.replace(/\n/g, '<w:br/>');
            }
            return value;
        }
        return '';
    }

    thousands_separators(num) {
        if (num != 0 && num != '') {
            var num_parts = num.toString().split(".");
            num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return num_parts.join(".");
        } else
            return num;
    }
}