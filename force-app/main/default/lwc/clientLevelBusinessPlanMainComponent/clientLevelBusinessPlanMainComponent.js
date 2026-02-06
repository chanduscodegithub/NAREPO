/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-concat */
/* eslint-disable guard-for-in */
/* eslint-disable no-console */
import { LightningElement, track, api, wire } from 'lwc';
import getClientLevelBusinessPlan from '@salesforce/apex/ClientLevelBusinessPlanController.getClientLevelBusinessPlan';
import createOrUpdateClientPlanRecords from '@salesforce/apex/ClientLevelBusinessPlanController.createOrUpdateClientPlanRecords';
import fetchPicklist from '@salesforce/apex/ClientLevelBusinessPlanController.fetchPicklist';
import Client_Plan_Mandatory_Goals from '@salesforce/label/c.Client_Plan_Mandatory_Goals';
import No_Client_Plan_Records_Message from '@salesforce/label/c.No_Client_Plan_Records_Message';
import Need_Help_Click_Here from '@salesforce/label/c.Need_Help_Click_Here';
//import createOrUpdateClientPlanRecords1 from '@salesforce/apex/ClientLevelBusinessPlanController.createOrUpdateClientPlanRecords1';
import copyPreviousSalesSeasonData from '@salesforce/apex/ClientLevelBusinessPlanController.copyPreviousSalesSeasonData';
import getTemplateInXML from '@salesforce/apex/ClientLevelBusinessPlanController.getTemplateInXML';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { fireEvent, registerListener } from 'c/pubsub';

import ClientPlan_Goal_DisplayOrder from '@salesforce/label/c.ClientPlan_Goal_DisplayOrder';

export default class ClientLevelBusinessPlanMainComponent extends LightningElement {
    @api recordId;
    @track cssDisplay = '';
    @track salesSeason = '';
    @track goalList = [];
    @track isgoalListEmpty;
    @track salesSeasonPicklist;
    // @track salesSeasonSelected;
    @track isEdit = false;
    @track mandatoryGoalList;
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
    //@track isNewGoalLoaded = true;

    handleIconDirection = false;
    isOnLoad = true;
    handleRenderLoop = false;
    handleExpandCollapse = false;
    salesSeasonChangeCount;

    @track Need_Help_Click_Here;
    @track openPopUp = false;
    @track enableOtherPleaseSpecify = false;
    disableAlertMessage = false; //Variable created to hide and show the alerts based on Other (please specify below)....!!!
    isNewGoalAdded;
    newGoalName;
    @track isEmptyGoalWriteIn = false; //Paramters for showing Empty Goal Write in Alert message
    @track emptyGoalWriteInContent = '';
    trackRecordId = [];
    @track otherPleaseSpecifyEmpty = '';
    @track isOtherPleaseSpecifyEmpty = false;

    connectedCallback() {
        this.getClientBusinessPlan();
        registerListener('goalUsedPicklist', this.goalUsedPicklist, this);
    }

    /* Fetch Sales Season picklist value - START */

    @wire(fetchPicklist, { objectPassed: 'Goal__c', fieldPassed: 'Sales_Season__c' })
    regionPicklistValues(result) {
        if (result.data) {
            this.salesSeasonPicklist = [];
            if (result.data !== undefined) {
                // console.log(result.data);
                result.data.forEach(opt => {
                    this.salesSeasonPicklist.push(opt);

                });
                /*  for(let i = result.data.length ; i > 0 ; i--) {
                      this.salesSeasonPicklist.push(result.data[i-1]);
                  } */
                console.log('this.salesSeasonPicklist');
                console.log(this.salesSeasonPicklist);
            }
        } else if (result.error) {
            this.error = result.error;
        }
    }

    /* Fetch Sales Season picklist value - END */

    goalUsedPicklist(picklistValues) {
        if (picklistValues !== null && picklistValues !== undefined && picklistValues !== '') {
            this.goalUsedPicklistValues = this.goalUsedPicklistValues.filter(value => value !== picklistValues.oldValue);
            if (!this.goalUsedPicklistValues.includes(picklistValues.newValue) && picklistValues.newValue !== '' && picklistValues.newValue !== 'New Goal and Strategy Information' && picklistValues.newValue !== 'Other client specific goals (Free Form/Write In)') {
                this.goalUsedPicklistValues.push(picklistValues.newValue);
                if (picklistValues.isGoalChange !== undefined && picklistValues.isGoalChange === true) {
                    //this.activeSections.pop();
                    //this.activeSections.push(picklistValues.newValue);
                    this.newPickListValue = picklistValues.newValue;
                    this.openSections = this.activeSections;
                }
            }
            /* Code for adding Other client specific goals (Free Form/Write In) to active sections - START */
            if (picklistValues.newValue === 'Other client specific goals (Free Form/Write In)' && picklistValues.isGoalChange !== undefined && picklistValues.isGoalChange === true) {
                //this.activeSections.pop();
                //this.activeSections.push(picklistValues.newValue);
                this.newPickListValue = picklistValues.newValue;
                this.openSections = this.activeSections;
            }
            /* Code for adding Other client specific goals (Free Form/Write In) to active sections - END */

            if (this.goalUsedPicklistValues.length === this.goalPicklist.length - 1) {
                this.isAddGoalButtonDisabled = true;
            }
            fireEvent(this.pageRef, 'getUsedPicklistInGoal', this.goalUsedPicklistValues);
        }

    }

    getClientBusinessPlan() {
        this.cssDisplay = '';
        getClientLevelBusinessPlan({ accountId: this.recordId, salesSeason: this.salesSeason })
            .then(result => {
                console.log('getClientLevelBusinessPlan = ', JSON.stringify(result));
                let sectionNameList = [];
                var clientBusinessPlanData = result;
                //var salesSeasonPicklist = [];
                var goalPicklistValue = [];
                let goalNameMap = {};
                let goalNames = [];
                let goalAndStrategyListEdited = [];
                let emptyStrategyAddedForNonEmptyGoal;
                let goalList = [];
                console.log('clientBusinessPlanData==>' + JSON.stringify(clientBusinessPlanData));

                this.goalList = [];
                //this.goalList = clientBusinessPlanData.goalList;
                this.Need_Help_Click_Here = Need_Help_Click_Here;
                this.hasEditAccess = clientBusinessPlanData.hasEditAccess;
                if (clientBusinessPlanData.goalList !== undefined && clientBusinessPlanData.goalList !== null &&
                    clientBusinessPlanData.goalList.length !== 0) {
                    this.isgoalListEmpty = false;

                    for (let i = 0; i < clientBusinessPlanData.goalList.length; i++) {
                        //sectionNameList.push(i);
                        if (clientBusinessPlanData.goalList[i].hasOwnProperty('Goal__c')
                            && !this.isBlank(clientBusinessPlanData.goalList[i].Goal__c)) {
                            goalNameMap[clientBusinessPlanData.goalList[i]] = true;
                            goalNames.push(clientBusinessPlanData.goalList[i]);
                            sectionNameList.push(clientBusinessPlanData.goalList[i].Name);

                        } else {
                            goalNames.push('');
                        }

                    }
                    this.goalNames = goalNames;

                    //this.expandCollapse = 'Collapse All';
                    //this.iconDirection = 'utility:chevrondown';

                    if (this.salesSeasonChange === true) {
                        this.activeSections = [];
                        this.salesSeasonChangeCount++;
                        if (this.salesSeasonChangeCount === 1) {
                            this.salesSeasonChange = false;
                        }
                        this.handleIconDirection = false;
                        window.clearTimeout(this.delayRefresh1);
                        // eslint-disable-next-line @lwc/lwc/no-async-operation
                        this.delayRefresh1 = setTimeout(() => {
                            //this.activeSections = sectionNameList;
                            if (sectionNameList !== undefined) {
                                this.activeSections = JSON.parse(JSON.stringify(sectionNameList));
                            }
                        }, 0);
                    } else if (this.isCancel === true) {
                        this.activeSections = sectionNameList;
                    }
                    //this.activeSections = sectionNameList;
                    //this.iconDirection = 'utility:chevrondown';

                } else {
                    this.isgoalListEmpty = true;
                    if (this.salesSeasonChange === true) {
                        this.salesSeasonChange = false;
                    }
                    this.previousSalesSeasonRecords = clientBusinessPlanData.previousGoalList;
                    this.noGoalRecordsMessage = No_Client_Plan_Records_Message;
                    if (clientBusinessPlanData.disableCopyPreviousButton === false) {
                        this.disableCopyPreviousButton = false;
                    }
                }

                if (clientBusinessPlanData.picklistFieldMap !== undefined && clientBusinessPlanData.picklistFieldMap !== null) {
                    /* if (clientBusinessPlanData.picklistFieldMap.hasOwnProperty('Sales_Season__c')) {
                         clientBusinessPlanData.picklistFieldMap.Sales_Season__c.forEach(function (element) {
                             if (element !== '') {
                                 salesSeasonPicklist.push({ label: element, value: element });
                             }
 
                         });
                     }  */

                    if (clientBusinessPlanData.picklistFieldMap.hasOwnProperty('Goal__c')) {
                        clientBusinessPlanData.picklistFieldMap.Goal__c.forEach(function (element) {

                            goalPicklistValue.push(element);


                        });
                    }
                }

                /* Code for copying Goal Names  */
                /*clientBusinessPlanData.goalList.forEach(function (element) {
                    if (element.Name !== null) {
                        goalNames.push(element.Name);

                    }
                });
                this.goalNames = goalNames;
                this.activeSections=this.goalNames;*/
                /* Code for Copying Goal Names End */
                //this.salesSeasonPicklist = salesSeasonPicklist;
                this.salesSeason = clientBusinessPlanData.salesSeason;

                this.mandatoryGoalList = this.getListFromValueSeparatedStr(Client_Plan_Mandatory_Goals, '##');
                this.picklistFieldMap = clientBusinessPlanData.picklistFieldMap;



                //this.goalList = this.sortRecords('Goal__c', clientBusinessPlanData.goalList, this.mandatoryGoalList);
                this.goalList = this.sortClientPlanRecords(clientBusinessPlanData.goalList, 'Goal__c',
                    this.getListFromValueSeparatedStr(ClientPlan_Goal_DisplayOrder, ';'));
                this.goalList = this.removeAttainNpsPromoter(this.goalList);
                goalList = [...this.goalList];
                console.log('getClientLevelBusinessPlan this.goalList= ', JSON.stringify(this.goalList));
                this.goalPicklist = this.setPicklistValue(goalNameMap, goalPicklistValue);

                this.goalAndStrategyListEdited = [];

                for (let i in goalList) {
                    let eachGoal = Object.assign({}, goalList[i]);
                    if (goalList[i].hasOwnProperty("Goal__c") && !this.isBlank(goalList[i].Goal__c)) {
                        emptyStrategyAddedForNonEmptyGoal = goalList[i];
                        if (!goalList[i].hasOwnProperty('Strategies__r')) {
                            emptyStrategyAddedForNonEmptyGoal = this.createGoalStrategyJSON(eachGoal, [{ 'sobjectType': 'Strategy__c', 'Goal__c': goalList[i].Id, 'Strategy__c': '', 'Action_Steps_PlannedTaken__c': '', 'Applicable_for__c': ''}]);
                        }
                        goalAndStrategyListEdited.push(emptyStrategyAddedForNonEmptyGoal);
                    } else {
                        goalAndStrategyListEdited.push(goalList[i]);
                    }
                }

                this.goalAndStrategyListEdited = goalAndStrategyListEdited;
                if (this.goalUsedPicklistValues.length === this.goalPicklist.length - 1) {
                    this.isAddGoalButtonDisabled = true;
                } else {
                    this.isAddGoalButtonDisabled = false;
                }
                this.isEditButtonDisabled = false;
                this.isPrintButtonDisabled = false;

                /*this.activeSections = [''];
                this.expandCollapse = 'Expand All';
                this.iconDirection = 'utility:chevronright';*/

                this.strategyEditedMap = {};
                this.goalEditedMap = {};
                this.goalStrategyToInsertList = [];
                this.goalTobeDeletedMap = {};
                this.strategyTobeDeletedMap = {};
                this.isReminderOkClicked = false;
                this.trackRecordId = [];


                this.cssDisplay = 'hidemodel';
            })
            .catch(error => {
                console.log('Error==>' + error);
                this.cssDisplay = 'hidemodel';
            });


    }

    salesSeasonChangeHandler(event) {
        this.salesSeason = event.target.value;
        //Issues Fixed by Awais on 10/25/2019 start
        this.goalUsedPicklistValues = [];
        //Issues Fixed by Awais on 10/25/2019 end

        this.salesSeasonChangeCount = 0;
        this.salesSeasonChange = true;
        this.disableCopyPreviousButton = true;
        this.isNewGoalAdded = false;
        this.newGoalName = '';
        this.getClientBusinessPlan();
        this.isEdit = false;
        this.isEditButtonDisabled = false;
        this.isPrintButtonDisabled = false;
        this.isAddGoalButtonDisabled = false;
        this.backupUsedGoals = [];
        this.emptyStrategyReminderMsgContent = '';
        this.actionStepWithoutStrategyReminderMsgContent = '';
        this.emptyGoalWriteInContent = '';
        this.otherPleaseSpecifyEmpty = '';
    }

    editClientPlanRecords() {
        this.backupUsedGoals = this.goalUsedPicklistValues;
        fireEvent(this.pageRef, 'editCancelPicklistChanges', true);
        // this.cssDisplay = '';
        let sectionNameList = [];
        let goalCmpArray = [];

        this.isEdit = true;
        this.isEditButtonDisabled = true;
        this.isPrintButtonDisabled = true;


        /*  for (let i = 0; i < this.goalList.length; i++) {
              sectionNameList.push(i);
          }
  
          this.activeSections = sectionNameList; 
        this.expandCollapse = 'Collapse All';
        this.iconDirection = 'utility:chevrondown'; */


        goalCmpArray = this.template.querySelectorAll('c-goal-cmp');

        /*if(Array.isArray(goalCmpArray)) {
            for(let i=0;i<goalCmpArray.length;i++) {
                
                goalCmpArray[i].editGoalFields();
            } 
        } else {
            goalCmpArray.editGoalFields();
        } */

        for (let i = 0; i < goalCmpArray.length; i++) {

            goalCmpArray[i].editGoalFields();
            goalCmpArray[i].checkBlankFields();
        }

        /* Code for highlighting Blank goal and strategy - START */
        /* goalCmpArray = this.template.querySelectorAll('c-goal-cmp');
         for (let i = 0; i < goalCmpArray.length; i++) {
             goalCmpArray[i].checkBlankFields();
         } */
        /* Code for highlighting Blank goal and strategy - END */

        //this.template.querySelectorAll('c-goal-cmp').editGoalFields();

    }



    saveClientPlanRecords() {

        let goalListTobeDeleted = [];
        //let strategtListTobeDeleted=[];
        let goalListTobeUpdated = [];
        let strategyListTobeUpdated = [];
        let goalAndStrategyListTobeCreated = [];
        let strategyListTobeCreated = [];
        let goalAlreadyAddedToDeleteListMap = {};
        let strategyTobeDeletedList = [];

        let isStrategyListEmptyForGoal = false;
        let emptyStrategyCount = 0;
        let emptyStrategyGoalName = '';


        this.emptyStrategyGoalName = '';
        let strategyRecHavingActionStepWithoutStrategy = false;
        let isOthrSpcfcStrtgyRecEmpty = false;
        let othrSpcfcStrtgyRecHvngActnStpWthoutStrtgy = false;
        let emptyGoalWriteIn = false; //Parameter to show if Other Client Specific Goal has Goal write in or Blank
        this.isEmptyGoalWriteIn = false;

        //Parameters to seperate based on goal and strategy
        let newListOfGoalsToInsert;
        let newMapOfStrategyToInsert = {};

        //Parameter for querying child components
        let goalCmpArray = [];

        if (this.goalUsedPicklistValues.length === this.goalPicklist.length - 1) {
            this.isAddGoalButtonDisabled = true;
        }

        /* Method for serializing data to be sent for APEX class - START*/
        if (this.isCreateOrCopyNewRecords) {
            newListOfGoalsToInsert = this.newGoalsListToBeCreated;
            this.newGoalsListToBeCreated = [];
            /* Seperating to two seperate lists based on GOAL and Strategies - START */
            /* Removing New Goal and Strategy Information Record from List - START */
            for (let i in newListOfGoalsToInsert) {
                if (newListOfGoalsToInsert[i].Goal__c !== 'New Goal and Strategy Information') {
                    this.newGoalsListToBeCreated.push(newListOfGoalsToInsert[i]);
                }
            }
            /* Removing New Goal and Strategy Information Record from List - END */
            for (let i in this.newGoalsListToBeCreated) {
                if (this.newGoalsListToBeCreated[i].hasOwnProperty('Strategies__r')) {
                    newMapOfStrategyToInsert[this.newGoalsListToBeCreated[i].Name] = this.newGoalsListToBeCreated[i].Strategies__r;
                }
            }
            console.log('newMapOfStrategyToInsert before sending APEX ' + JSON.stringify(newMapOfStrategyToInsert));
            /* Seperating to two seperate lists based on GOAL and Strategies - END */
            /* Code for Checking empty fields and showing an Alert - START */
            if (!this.isReminderOkClicked) {
                for (let i in this.newGoalsListToBeCreated) {
                    emptyStrategyCount = 0;
                    if (this.newGoalsListToBeCreated[i].hasOwnProperty('Goal__c') &&
                        !this.isBlank(this.newGoalsListToBeCreated[i].Goal__c)) {
                        if (this.newGoalsListToBeCreated[i].hasOwnProperty('Strategies__r')) {
                            for (let j in this.newGoalsListToBeCreated[i].Strategies__r) {
                                if (this.strtgyRecHvngActnStpWthoutStrtgy(this.newGoalsListToBeCreated[i].Strategies__r[j])) {
                                    strategyRecHavingActionStepWithoutStrategy = true;

                                    if (this.otherSpecificStrategyRecHvngActnStpWthoutStrtgy(this.newGoalsListToBeCreated[i].Strategies__r[j])) {
                                        othrSpcfcStrtgyRecHvngActnStpWthoutStrtgy = true;
                                    }
                                }
                                else if (this.isStrategyRecEmpty(this.newGoalsListToBeCreated[i].Strategies__r[j])) {
                                    emptyStrategyCount++;
                                    if (this.isOtherSpecificStrategyRecEmpty(this.newGoalsListToBeCreated[i].Strategies__r[j])) {
                                        isOthrSpcfcStrtgyRecEmpty = true;
                                    }
                                }
                            }
                            /* Code for showing alert message when Goal Write In value is blank - START */
                            if (this.isGoalWriteInEmpty(this.newGoalsListToBeCreated[i])) {
                                emptyGoalWriteIn = true;
                            }
                            /* Code for showing alert message when Goal Write In value is blank - END */
                            if (emptyStrategyCount === this.newGoalsListToBeCreated[i].Strategies__r.length) {
                                isStrategyListEmptyForGoal = true;

                                if (emptyStrategyGoalName === '' && emptyStrategyGoalName.indexOf(';') === -1) {
                                    emptyStrategyGoalName = this.newGoalsListToBeCreated[i].Goal__c;

                                } else {
                                    emptyStrategyGoalName = emptyStrategyGoalName + ';' + this.newGoalsListToBeCreated[i].Goal__c;
                                }
                            }
                        } else {
                            isStrategyListEmptyForGoal = true;
                            /* Ignore Alert for New Goal and Strategy Information - START */
                            if (this.newGoalsListToBeCreated[i].Goal__c === 'New Goal and Strategy Information') {
                                isStrategyListEmptyForGoal = false;
                            }
                            /* Ignore Alert for New Goal and Strategy Information - END */
                            if (emptyStrategyGoalName === '' && emptyStrategyGoalName.indexOf(';') === -1) {
                                emptyStrategyGoalName = this.newGoalsListToBeCreated[i].Goal__c;

                            } else {
                                emptyStrategyGoalName = emptyStrategyGoalName + ';' + this.newGoalsListToBeCreated[i].Goal__c;
                            }
                        }
                    }
                }
                this.emptyStrategyGoalName = emptyStrategyGoalName;
                this.isStrategyListEmptyForGoal = isStrategyListEmptyForGoal;
                this.strategyRecHavingActionStepWithoutStrategy = strategyRecHavingActionStepWithoutStrategy;
                this.isOtherPleaseSpecifyEmpty = isOthrSpcfcStrtgyRecEmpty;

                if (isStrategyListEmptyForGoal && strategyRecHavingActionStepWithoutStrategy) {
                    this.reminderMsgContent = 'You have added a Goal without a Strategy. Please make sure that every Goal has at least one corresponding Strategy. Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below. Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                }
                if (isStrategyListEmptyForGoal) {
                    //this.reminderMsgContent='You have added a goal without a Strategy. Please make sure that you add at least one Strategy for each Goal';
                    if (isOthrSpcfcStrtgyRecEmpty) {
                        this.reminderMsgContent = 'You have added a Goal without a Strategy. Please make sure that every Goal has at least one corresponding Strategy. Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below. Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                        this.emptyStrategyReminderMsgContent = 'You have added a Goal without a Strategy. Please make sure that every Goal has at least one corresponding Strategy. Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below. Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                    } else {
                        this.reminderMsgContent = 'You have added a Goal without a Strategy. Please make sure that every Goal has at least one corresponding Strategy. Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below. Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                        this.emptyStrategyReminderMsgContent = 'You have added a Goal without a Strategy. Please make sure that every Goal has at least one corresponding Strategy. Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below. Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                    }

                }

                if (isOthrSpcfcStrtgyRecEmpty) {
                    this.otherPleaseSpecifyEmpty = 'You have selected a Strategy of “Other (please specify below)” , please make sure to write in your strategy in the box below. Refer to the field highlighted in yellow for the missing information (visible only in the edit mode).';
                }

                if (emptyGoalWriteIn) {
                    this.emptyGoalWriteInContent = 'You have selected a goal of “Other client specific goals (Free Form/Write In)” , please make sure to write in your goal. Refer to the field highlighted in yellow for the missing information (visible only in the edit mode).';
                    this.isEmptyGoalWriteIn = true;
                }

                if (strategyRecHavingActionStepWithoutStrategy) {
                    if (othrSpcfcStrtgyRecHvngActnStpWthoutStrtgy) {
                        this.reminderMsgContent = 'You have added an Action Step without a Strategy. Please make sure that every Action Step has a corresponding  Strategy.  Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below.  Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                        this.actionStepWithoutStrategyReminderMsgContent = 'You have added an Action Step without a Strategy. Please make sure that every Action Step has a corresponding  Strategy.  Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below.  Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                    } else {
                        this.reminderMsgContent = 'You have added an Action Step without a Strategy. Please make sure that every Action Step has a corresponding  Strategy.  Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below.  Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                        this.actionStepWithoutStrategyReminderMsgContent = 'You have added an Action Step without a Strategy. Please make sure that every Action Step has a corresponding  Strategy.  Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below.  Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                    }

                }

            }


            if (this.isReminderOkClicked || (!isStrategyListEmptyForGoal && !strategyRecHavingActionStepWithoutStrategy && !emptyGoalWriteIn && !isOthrSpcfcStrtgyRecEmpty)) {

                this.cssDisplay = '';

                this.upsertClientPlanRecords(null, null, null,
                    null, null, null, this.newGoalsListToBeCreated, newMapOfStrategyToInsert);
            } else {
                this.showReminderModal = true;
            }
            if (this.goalUsedPicklistValues.length === this.goalPicklist.length - 1) {
                this.isAddGoalButtonDisabled = true;
            }
            /* Code for Checking empty fields and showing an Alert - END */
        }
        /* Method for serializing data to be sent for APEX class - END*/
        if (this.isCreateOrCopyNewRecords === false) {
            if (!this.isReminderOkClicked) {
                for (let i in this.goalAndStrategyListEdited) {
                    emptyStrategyCount = 0;
                    if (this.goalAndStrategyListEdited[i] !== null && this.goalAndStrategyListEdited[i] !== undefined && this.goalAndStrategyListEdited[i].hasOwnProperty('Goal__c') &&
                        !this.isBlank(this.goalAndStrategyListEdited[i].Goal__c)) {
                        if (this.goalAndStrategyListEdited[i].hasOwnProperty('Strategies__r')) {
                            for (let j in this.goalAndStrategyListEdited[i].Strategies__r) {
                                if (this.strtgyRecHvngActnStpWthoutStrtgy(this.goalAndStrategyListEdited[i].Strategies__r[j])) {
                                    strategyRecHavingActionStepWithoutStrategy = true;

                                    if (this.otherSpecificStrategyRecHvngActnStpWthoutStrtgy(this.goalAndStrategyListEdited[i].Strategies__r[j])) {
                                        othrSpcfcStrtgyRecHvngActnStpWthoutStrtgy = true;
                                    }
                                }
                                else if (this.isStrategyRecEmpty(this.goalAndStrategyListEdited[i].Strategies__r[j])) {
                                    emptyStrategyCount++;
                                    if (this.isOtherSpecificStrategyRecEmpty(this.goalAndStrategyListEdited[i].Strategies__r[j])) {
                                        isOthrSpcfcStrtgyRecEmpty = true;

                                    }
                                }
                            }
                            /* Code for showing alert message when Goal Write In value is blank - START */
                            if (this.isGoalWriteInEmpty(this.goalAndStrategyListEdited[i])) {
                                emptyGoalWriteIn = true;
                            }
                            /* Code for showing alert message when Goal Write In value is blank - END */
                            if (emptyStrategyCount === this.goalAndStrategyListEdited[i].Strategies__r.length) {
                                isStrategyListEmptyForGoal = true;

                                if (emptyStrategyGoalName === '' && emptyStrategyGoalName.indexOf(';') === -1) {
                                    emptyStrategyGoalName = this.goalAndStrategyListEdited[i].Goal__c;

                                } else {
                                    emptyStrategyGoalName = emptyStrategyGoalName + ';' + this.goalAndStrategyListEdited[i].Goal__c;
                                }
                            }
                        } else {
                            isStrategyListEmptyForGoal = true;
                            /* Ignore Alert for New Goal and Strategy Information - START */
                            if (this.goalAndStrategyListEdited[i].Goal__c === 'New Goal and Strategy Information') {
                                isStrategyListEmptyForGoal = false;
                            }
                            /* Ignore Alert for New Goal and Strategy Information - END */
                            if (emptyStrategyGoalName === '' && emptyStrategyGoalName.indexOf(';') === -1) {
                                emptyStrategyGoalName = this.goalAndStrategyListEdited[i].Goal__c;

                            } else {
                                emptyStrategyGoalName = emptyStrategyGoalName + ';' + this.goalAndStrategyListEdited[i].Goal__c;
                            }
                        }
                    }
                }
                this.emptyStrategyGoalName = emptyStrategyGoalName;
                this.isStrategyListEmptyForGoal = isStrategyListEmptyForGoal;
                this.strategyRecHavingActionStepWithoutStrategy = strategyRecHavingActionStepWithoutStrategy;
                this.isOtherPleaseSpecifyEmpty = isOthrSpcfcStrtgyRecEmpty;

                console.log('emptyStrategyGoalName ' + emptyStrategyGoalName + '\n isStrategyListEmptyForGoal ' + isStrategyListEmptyForGoal + '\n strategyRecHavingActionStepWithoutStrategy ' + strategyRecHavingActionStepWithoutStrategy + '\n isOthrSpcfcStrtgyRecEmpty ' + isOthrSpcfcStrtgyRecEmpty);
                if (isStrategyListEmptyForGoal && strategyRecHavingActionStepWithoutStrategy) {
                    this.reminderMsgContent = 'You have added a Goal without a Strategy. Please make sure that every Goal has at least one corresponding Strategy. Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below. Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                }
                if (isStrategyListEmptyForGoal) {
                    //this.reminderMsgContent='You have added a goal without a Strategy. Please make sure that you add at least one Strategy for each Goal';
                    if (isOthrSpcfcStrtgyRecEmpty) {
                        this.reminderMsgContent = 'You have added a Goal without a Strategy. Please make sure that every Goal has at least one corresponding Strategy. Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below. Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                        this.emptyStrategyReminderMsgContent = 'You have added a Goal without a Strategy. Please make sure that every Goal has at least one corresponding Strategy. Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below. Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                    } else {
                        this.reminderMsgContent = 'You have added a Goal without a Strategy. Please make sure that every Goal has at least one corresponding Strategy. Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below. Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                        this.emptyStrategyReminderMsgContent = 'You have added a Goal without a Strategy. Please make sure that every Goal has at least one corresponding Strategy. Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below. Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                    }

                }

                if (isOthrSpcfcStrtgyRecEmpty) {
                    this.otherPleaseSpecifyEmpty = 'You have selected a Strategy of “Other (please specify below)” , please make sure to write in your strategy in the box below. Refer to the field highlighted in yellow for the missing information (visible only in the edit mode).';
                }

                if (emptyGoalWriteIn) {
                    this.emptyGoalWriteInContent = 'You have selected a goal of “Other client specific goals (Free Form/Write In)” , please make sure to write in your goal. Refer to the field highlighted in yellow for the missing information (visible only in the edit mode).';
                    this.isEmptyGoalWriteIn = true;
                }

                if (strategyRecHavingActionStepWithoutStrategy) {
                    if (othrSpcfcStrtgyRecHvngActnStpWthoutStrtgy) {
                        this.reminderMsgContent = 'You have added an Action Step without a Strategy. Please make sure that every Action Step has a corresponding  Strategy.  Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below.  Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                        this.actionStepWithoutStrategyReminderMsgContent = 'You have added an Action Step without a Strategy. Please make sure that every Action Step has a corresponding  Strategy.  Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below.  Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                    } else {
                        this.reminderMsgContent = 'You have added an Action Step without a Strategy. Please make sure that every Action Step has a corresponding  Strategy.  Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below.  Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                        this.actionStepWithoutStrategyReminderMsgContent = 'You have added an Action Step without a Strategy. Please make sure that every Action Step has a corresponding  Strategy.  Also, if you have selected a Strategy of “Other (please specify below)”, please make sure to write in your Strategy in the box below.  Refer to the fields highlighted in yellow for the missing information (visible only in the edit mode).';
                    }

                }

            }

            /* Code for highlighting Blank goal and strategy - START */
            /* goalCmpArray = this.template.querySelectorAll('c-goal-cmp');
             for (let i = 0; i < goalCmpArray.length; i++) {
                 goalCmpArray[i].checkBlankFields();
             } */
            /* Code for highlighting Blank goal and strategy - END */

            if (this.isReminderOkClicked || (!isStrategyListEmptyForGoal && !strategyRecHavingActionStepWithoutStrategy && !emptyGoalWriteIn && !isOthrSpcfcStrtgyRecEmpty)) {
                /*if (this.goalStrategyToInsertList !== undefined) {
                    this.goalStrategyToInsertList.forEach(function (element) {
        
                        goalAndStrategyListTobeCreated.push(element);
                        if (element.hasOwnProperty('Strategies__r')) {
                            element.Strategies__r.forEach(function (elmnt) {
                                strategyListTobeCreated.push(elmnt);
                            });
                        }
        
        
                    });
                }*/
                this.cssDisplay = '';
                if (this.goalStrategyToInsertList !== undefined) {
                    for (let i in this.goalStrategyToInsertList) {
                        if (this.goalStrategyToInsertList[i].hasOwnProperty('Goal__c') && !this.isBlank(this.goalStrategyToInsertList[i].Goal__c)) {
                            goalAndStrategyListTobeCreated.push(this.goalStrategyToInsertList[i]);
                            if (this.goalStrategyToInsertList[i].hasOwnProperty('Strategies__r')) {
                                /*this.goalStrategyToInsertList[i].Strategies__r.forEach(function (elmnt) {
                                    strategyListTobeCreated.push(elmnt);
                                });*/
                                for (let j in this.goalStrategyToInsertList[i].Strategies__r) {
                                    if (this.goalStrategyToInsertList[i].Strategies__r[j] !== undefined && !this.isPredeterminedStrategyRecEmpty(this.goalStrategyToInsertList[i].Strategies__r[j])) {
                                        strategyListTobeCreated.push(this.goalStrategyToInsertList[i].Strategies__r[j]);
                                    }

                                }
                            }
                        }
                    }
                }





                for (let i in this.goalEditedMap) {
                    if (this.isBlank(this.goalEditedMap[i].Goal__c)) {

                        goalListTobeDeleted.push(this.goalEditedMap[i]);
                        goalAlreadyAddedToDeleteListMap[i] = this.goalEditedMap[i];
                    } else if (!this.isBlank(this.goalEditedMap[i].Goal__c)) {
                        goalListTobeUpdated.push(this.goalEditedMap[i]);
                    }

                }

                /*if(this.strategyEditedMap!==undefined && (this.strategyEditedMap.size!==undefined || this.strategyEditedMap.size!==0)){
                    for (const [key, value] of this.strategyEditedMap.entries()) {
                        console.log(key, value);
                        strategyListTobeUpdated.push(...value);
            
                      }
                }*/


                for (let k in this.strategyEditedMap) {
                    //if (k !== undefined) {
                    if (this.strategyEditedMap[k] !== undefined) {
                        /*this.strategyEditedMap[k].forEach(function (element) {
                            
        
                            strategyListTobeUpdated.push(element);
                            
        
        
                        });*/

                        for (let i in this.strategyEditedMap[k]) {
                            if (this.strategyEditedMap[k][i] !== undefined && !this.isPredeterminedStrategyRecEmpty(this.strategyEditedMap[k][i])) {
                                strategyListTobeUpdated.push(this.strategyEditedMap[k][i]);
                            } else if (this.strategyEditedMap[k][i].hasOwnProperty('Id') && !this.isBlank(this.strategyEditedMap[k][i].Id)) {
                                strategyTobeDeletedList.push(this.strategyEditedMap[k][i]);
                            }

                        }
                    }


                    // }


                }

                for (let i in this.goalTobeDeletedMap) {
                    if (!this.isMapEmpty(goalAlreadyAddedToDeleteListMap)
                        && this.goalAlreadyAddedToDeleteListMap.hasOwnProperty(i)) {
                        //don't add the goal to delete list,since it's already added
                    } else {
                        goalListTobeDeleted.push(this.goalTobeDeletedMap[i]);
                    }

                }



                for (let i in this.strategyTobeDeletedMap) {
                    if (!this.isMapEmpty(this.goalTobeDeletedMap)
                        && this.goalTobeDeletedMap.hasOwnProperty(this.strategyTobeDeletedMap[i].Goal__c)) {
                        //don't add the strategy to delete list,since it's already added
                    } else {
                        strategyTobeDeletedList.push(this.strategyTobeDeletedMap[i]);
                    }

                }








                this.upsertClientPlanRecords(goalListTobeDeleted, goalListTobeUpdated, strategyListTobeUpdated,
                    goalAndStrategyListTobeCreated, strategyListTobeCreated, strategyTobeDeletedList, null, null);
            } else {
                this.showReminderModal = true;
            }
            if (this.goalUsedPicklistValues.length === this.goalPicklist.length - 1) {
                this.isAddGoalButtonDisabled = true;
            }
        }
    }

    cancelChanges() {
        this.goalUsedPicklistValues = this.backupUsedGoals;
        this.isCancel = false;
        this.isEdit = false;
        this.getClientBusinessPlan();
        /* Code for checking if create or copy new records button is Checked - START */
        if (this.isCreateOrCopyNewRecords) {
            this.isCreateOrCopyNewRecords = false;
        }
        /* Code for checking if create or copy new records button is Checked - END */
        fireEvent(this.pageRef, 'editCancelPicklistChanges', false);

    }


    upsertClientPlanRecords(goalListTobeDeleted, goalListTobeUpdated, strategyListTobeUpdated,
        goalAndStrategyListTobeCreated, strategyListTobeCreated, strategyTobeDeletedList, newGoalsListToBeCreated, newMapOfStrategyToInsert) {

        console.log('Before sending to apex \n ' + JSON.stringify(newGoalsListToBeCreated));
        createOrUpdateClientPlanRecords({
            goalListTobeDeleted: goalListTobeDeleted,
            goalListToUpdate: goalListTobeUpdated, strategyListToUpdate: strategyListTobeUpdated,
            goalAndStrategyRecordsToCreate: goalAndStrategyListTobeCreated, strategyListTobeCreated: strategyListTobeCreated
            , accountId: this.recordId, salesSeason: this.salesSeason,
            strategyRecordsToBeDeleted: strategyTobeDeletedList,
            goalRecordsToBeDeleted: this.goalRecordsToBeDeleted,
            newGoalsListToBeCreated: newGoalsListToBeCreated,
            newMapOfStrategyToInsert: newMapOfStrategyToInsert,
            trackRecordId: this.trackRecordId
        })
            .then(result => {

                var clientBusinessPlanData = result;
                var salesSeasonPicklist = [];
                var goalPicklistValue = [];
                //let goalNames = [];
                let goalNameMap = {};
                let goalAndStrategyListEdited = [];
                let emptyStrategyAddedForNonEmptyGoal;
                let goalList = [];
                console.log('clientBusinessPlanData==>' + JSON.stringify(clientBusinessPlanData));


                this.goalList = [];
                if (clientBusinessPlanData.goalList !== undefined && clientBusinessPlanData.goalList !== null &&
                    clientBusinessPlanData.goalList.length !== 0) {
                    this.isgoalListEmpty = false;
                    for (let i = 0; i < clientBusinessPlanData.goalList.length; i++) {

                        if (clientBusinessPlanData.goalList[i].hasOwnProperty('Goal__c')
                            && !this.isBlank(clientBusinessPlanData.goalList[i].Goal__c)) {
                            goalNameMap[clientBusinessPlanData.goalList[i]] = true;
                        }

                    }
                } else {
                    this.isgoalListEmpty = true;

                }

                if (clientBusinessPlanData.picklistFieldMap !== undefined && clientBusinessPlanData.picklistFieldMap !== null) {
                    if (clientBusinessPlanData.picklistFieldMap.hasOwnProperty('Sales_Season__c')) {
                        clientBusinessPlanData.picklistFieldMap.Sales_Season__c.forEach(function (element) {
                            if (element !== '') {
                                salesSeasonPicklist.push({ label: element, value: element });
                            }

                        });
                    }
                    if (clientBusinessPlanData.picklistFieldMap.hasOwnProperty('Goal__c')) {
                        clientBusinessPlanData.picklistFieldMap.Goal__c.forEach(function (element) {

                            goalPicklistValue.push(element);


                        });
                    }

                }

                /* Code for copying Goal Names  */
                /*clientBusinessPlanData.goalList.forEach(function (element) {
                    if (element.Name !== null) {
                        goalNames.push(element.Name);

                    }
                });
                this.goalNames = goalNames;
                this.activeSections=this.goalNames;*/
                /* Code for Copying Goal Names End */
                /* Code for checking goals created from New/Copy Client plan button - START */
                if (this.isCreateOrCopyNewRecords) {
                    this.isCreateOrCopyNewRecords = false;
                    /* Code created for copying new Auto Goal Numbers when user creates records using Create new CLient plan Button - START */
                    for (let i = 0; i < clientBusinessPlanData.goalList.length; i++) {
                        //sectionNameList.push(i);
                        if (clientBusinessPlanData.goalList[i].hasOwnProperty('Goal__c')
                            && !this.isBlank(clientBusinessPlanData.goalList[i].Goal__c)) {
                            this.activeSections.push(clientBusinessPlanData.goalList[i].Name);
                        }
                    }
                    /* Code created for copying new Auto Goal Numbers when user creates records using Create new CLient plan Button - END */
                }
                /* Code for checking goals created from New/Copy Client plan button - END*/
                //this.salesSeasonPicklist = salesSeasonPicklist;
                this.salesSeason = clientBusinessPlanData.salesSeason;

                this.mandatoryGoalList = this.getListFromValueSeparatedStr(Client_Plan_Mandatory_Goals, '##');
                this.picklistFieldMap = clientBusinessPlanData.picklistFieldMap;

                /*clientBusinessPlanData.picklistFieldMap.Goal__c.forEach(function (element) {

                    goalPicklist.push({ label: element, value: element });


                });


                this.goalPicklist = goalPicklist;*/

                this.goalPicklist = this.setPicklistValue(goalNameMap, goalPicklistValue);
                this.isEdit = false;
                if (this.goalUsedPicklistValues.length === this.goalPicklist.length - 1) {
                    this.isAddGoalButtonDisabled = true;
                } else {
                    this.isAddGoalButtonDisabled = false;
                }
                this.isEditButtonDisabled = false;
                this.isPrintButtonDisabled = false;

                /*this.activeSections = [''];
                this.expandCollapse = 'Expand All';
                this.iconDirection = 'utility:chevronright';*/


                this.strategyEditedMap = {};
                this.goalEditedMap = {};
                this.goalStrategyToInsertList = [];
                this.goalTobeDeletedMap = {};
                this.strategyTobeDeletedMap = {};
                this.isReminderOkClicked = false;

                // this.goalList = clientBusinessPlanData.goalList;
                //this.goalList = this.sortRecords('Goal__c', clientBusinessPlanData.goalList, this.mandatoryGoalList);
                this.goalList = this.sortClientPlanRecords(clientBusinessPlanData.goalList, 'Goal__c',
                    this.getListFromValueSeparatedStr(ClientPlan_Goal_DisplayOrder, ';'));
                goalList = [...this.goalList];
                this.goalList = this.removeAttainNpsPromoter(this.goalList);

                this.goalAndStrategyListEdited = [];


                for (let i in goalList) {
                    if (goalList[i].hasOwnProperty("Goal__c") && !this.isBlank(goalList[i].Goal__c)) {
                        emptyStrategyAddedForNonEmptyGoal = goalList[i];
                        if (!goalList[i].hasOwnProperty('Strategies__r')) {
                            emptyStrategyAddedForNonEmptyGoal = this.createGoalStrategyJSON(goalList[i], [{ 'sobjectType': 'Strategy__c', 'Goal__c': goalList[i].Id, 'Strategy__c': '', 'Action_Steps_PlannedTaken__c': '', 'Applicable_for__c': '' }]);
                        }
                        goalAndStrategyListEdited.push(emptyStrategyAddedForNonEmptyGoal);
                    } else {
                        goalAndStrategyListEdited.push(goalList[i]);
                    }
                }


                for (let i = 0; i < clientBusinessPlanData.goalList.length; i++) {
                    if (goalList[i].hasOwnProperty('Goal__c')
                        && !this.isBlank(goalList[i].Goal__c)) {
                        /* Below conditionTo check if new Goal is added and added to Active Sections */
                        if (this.isNewGoalAdded && this.newGoalName !== undefined) {
                            if (clientBusinessPlanData.goalList[i].Goal__c !== 'Other client specific goals (Free Form/Write In)') {
                                if (this.newGoalName === clientBusinessPlanData.goalList[i].Goal__c) {
                                    this.activeSections.push(clientBusinessPlanData.goalList[i].Name);
                                    this.newGoalName = '';
                                    this.isNewGoalAdded = false;
                                }
                            } else if (clientBusinessPlanData.goalList[i].Goal__c === 'Other client specific goals (Free Form/Write In)') {
                                if (this.newGoalName === clientBusinessPlanData.goalList[i].Goal_Write_In__c && clientBusinessPlanData.goalList[i].Goal_Write_In__c !== undefined) {
                                    this.activeSections.push(clientBusinessPlanData.goalList[i].Name);
                                    this.newGoalName = '';
                                    this.isNewGoalAdded = false;
                                } else if (this.newGoalName === clientBusinessPlanData.goalList[i].Goal__c && clientBusinessPlanData.goalList[i].Goal_Write_In__c === undefined) {
                                    if (clientBusinessPlanData.goalList[i].hasOwnProperty('CreatedDate')) {
                                        this.activeSections.push(clientBusinessPlanData.goalList[clientBusinessPlanData.goalList.length - 1].Name);
                                        this.newGoalName = '';
                                        this.isNewGoalAdded = false;
                                    }
                                }
                            }
                        }
                    }

                }
                this.goalAndStrategyListEdited = goalAndStrategyListEdited;
                this.trackRecordId = [];

                this.cssDisplay = 'hidemodel';

                this.retainExpandCollapse();
            })
            .catch(error => {
                console.log('Error==>' + error);

                this.isEdit = false;
                if (this.goalUsedPicklistValues.length === this.goalPicklist.length - 1) {
                    this.isAddGoalButtonDisabled = true;
                } else {
                    this.isAddGoalButtonDisabled = false;
                }
                this.isEditButtonDisabled = false;
                this.isPrintButtonDisabled = false;

                this.strategyEditedMap = {};
                this.goalEditedMap = {};
                this.goalStrategyToInsertList = [];

                this.cssDisplay = 'hidemodel';
            });








    }


    getListFromValueSeparatedStr(valueSeparatedStr, valueSeparator) {
        var returnList = [];
        if (!this.isBlank(valueSeparatedStr)) {
            if (valueSeparatedStr.indexOf(valueSeparator) !== -1) {
                returnList = valueSeparatedStr.split(valueSeparator);
            }
            else {
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

    handleSectionToggle(event) {
        if (event === undefined) {
            let sectionNameList = this.activeSections;
            let goalList = [];
            goalList = this.goalList;
            this.activeSections = [];
            if (sectionNameList !== undefined) {
                this.activeSections = JSON.parse(JSON.stringify(sectionNameList));
            }
            /*for (let i = 0; i < goalList.length; i++) {
                sectionNameList.push(goalList[i].Goal__c);
                console.log(i);
            } */
            //console.log(sectionNameList.length);
            console.log('this.active section s ' + JSON.stringify(this.activeSections));
            //this.openSections.push(sectionNameList[sectionNameList.length - 1]);
            window.clearTimeout(this.delayRefresh);
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this.delayRefresh = setTimeout(() => {
                //this.activeSections = sectionNameList;
                if (sectionNameList !== undefined) {
                    this.activeSections = JSON.parse(JSON.stringify(sectionNameList));
                }
            }, 0);

        } else if (event !== undefined) {
            const openSections = event.detail.openSections;
            this.openSections = openSections;
            //this.activeSections = openSections;
            window.clearTimeout(this.delayRefresh);
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this.delayRefresh = setTimeout(() => {
                //this.activeSections = sectionNameList;
                if (openSections !== undefined) {
                    this.activeSections = JSON.parse(JSON.stringify(openSections));
                }
            }, 0);
            /*let temp = openSections;
            let found = false;
            let value = this.newPickListValue;
            if(value !== undefined){
                temp.forEach(function(t){
                    if(t === value){
                        found = true;
                    }
                });
                if(found === false){
                    temp.push(value);
                }
            }
            //this.activeSections = temp;*/
            console.log('Open Sections ' + openSections);
            if (openSections !== undefined) {
                if (openSections.length === 0) {
                    this.iconDirection = 'utility:chevronright';
                    this.handleExpandCollapse = true;
                    this.handleRenderLoop = false;
                    this.handleIconDirection = false;
                }
                if (this.goalList !== undefined && this.goalList.length > 0 && openSections.length > 0) {
                    this.iconDirection = 'utility:chevrondown';
                }
            }
        }
    }

    retainExpandCollapse() {
        var storeActiveSections = this.activeSections;
        this.activeSections = [];
        if (storeActiveSections !== undefined) {
            if (storeActiveSections !== undefined) {
                this.activeSections = JSON.parse(JSON.stringify(storeActiveSections));
            }
        }
        /*let temp = storeActiveSections;
        let found = false;
        let value = this.newPickListValue;
        if(value !== undefined){
            temp.forEach(function(t){
                if(t === value){
                    found = true;
                }
            });
            if(found === false){
                temp.push(value);
            }
        }
        storeActiveSections = temp;*/

        console.log('Open sections After Save ' + storeActiveSections);
        window.clearTimeout(this.delayRefresh1);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayRefresh1 = setTimeout(() => {
            //this.activeSections = storeActiveSections;
            if (storeActiveSections !== undefined) {
                this.activeSections = JSON.parse(JSON.stringify(storeActiveSections));
            }
        }, 0);
        if (this.activeSections.length > 0) {
            this.handleIconDirection = true;
        }
    }

    renderedCallback() {
        if (this.isAddAnotherGoal) {
            this.isAddAnotherGoal = false;
            const spann = this.template.querySelector('spann');
            const accordianOffsetTop = spann.offsetTop;
            window.scrollTo(0, accordianOffsetTop);
        }
        if (this.handleIconDirection) {
            this.iconDirection = 'utility:chevrondown';
        } else if (this.handleIconDirection === false && this.isOnLoad) {
            this.isOnLoad = false;
            this.iconDirection = 'utility:chevrondown';
        } else if (this.handleIconDirection === false && this.handleRenderLoop) {
            this.handleRenderLoop = false;
            this.iconDirection = 'utility:chevronright';
        } else if (this.salesSeasonChange) {
            this.iconDirection = 'utility:chevrondown';
            //this.salesSeasonChange = false;
        } else if (this.handleIconDirection === false && this.handleExpandCollapse) {
            this.handleExpandCollapse = false
            this.iconDirection = 'utility:chevronright';
        }
    }

    expandCollapseRecords1(event) {
        var buttonName = event.target.name;
        //var lightningAccordianName = this.template.querySelectorAll('.accordianClass'); //should query class
        //var count = lightningAccordianName.length;
        //console.log('count '+count);

        let sectionNameList = [];
        if (buttonName === 'Expand All') {
            for (let i = 0; i < this.goalList.length; i++) {
                sectionNameList.push(i);
            }

            this.activeSections = sectionNameList;
            this.expandCollapse = 'Collapse All';
            this.iconDirection = 'utility:chevrondown';
        } else if (buttonName === 'Collapse All') {
            this.activeSections = [''];
            this.expandCollapse = 'Expand All';
            this.iconDirection = 'utility:chevronright';
        }
    }

    expandCollapseRecords(event) {
        var iconName = event.target.iconName;
        //var lightningAccordianName = this.template.querySelectorAll('.accordianClass'); //should query class
        //var count = lightningAccordianName.length;
        //console.log('count '+count);

        let sectionNameList = [];
        if (iconName === 'utility:chevronright') {
            for (let i = 0; i < this.goalList.length; i++) {
                sectionNameList.push(this.goalList[i].Name);
            }

            this.activeSections = sectionNameList;
            this.iconDirection = 'utility:chevrondown';
        } else if (iconName === 'utility:chevrondown') {
            this.activeSections = [''];
            this.iconDirection = 'utility:chevronright';
        }
    }

    addGoal() {
        let goalList = [];
        let sectionNameList = [];
        let scrollingElement;
        let goalCmpArray = [];
        let goalAndStrategyListEdited = [];
        let autoNumber = 'GL-0000' + Math.round(Math.random() * 10);

        //this.isNewGoalLoaded = false;
        goalAndStrategyListEdited = this.goalAndStrategyListEdited;
        //goalList = [...this.goalList, {  "sobjectType":"Goal__c","Name": "", "Sales_Season__c": "", "Goal__c": "", "Company__c": this.recordId, "Strategies__r": [{ "sobjectType":"Strategy__c","Goal__c": "",  "Name": "", "Strategy__c": "", "Action_Steps_PlannedTaken__c": "" }] }];
        goalList = [...this.goalList, { "sobjectType": "Goal__c", "Name": autoNumber, "Sales_Season__c": this.salesSeason, "Goal__c": "New Goal and Strategy Information", "Company__c": this.recordId, "Goal_Write_In__c": "" }];
        this.goalList = goalList;



        // if (this.activeSections !== undefined && this.activeSections.length > 1) {
        /*for (let i = 0; i < goalList.length; i++) {
            sectionNameList.push(i);
            console.log(i);
        }
        console.log(sectionNameList.length);
        this.activeSections = sectionNameList;
        this.expandCollapse = 'Collapse All';
        this.iconDirection = 'utility:chevrondown';*/
        //}

        this.isEdit = true;

        this.isAddGoalButtonDisabled = true;
        this.isEditButtonDisabled = true;
        this.isPrintButtonDisabled = true;

        goalAndStrategyListEdited.push({ "sobjectType": "Goal__c", "Name": autoNumber, "Sales_Season__c": this.salesSeason, "Goal__c": "New Goal and Strategy Information", "Company__c": this.recordId, "Goal_Write_In__c": "" });
        this.goalAndStrategyListEdited = goalAndStrategyListEdited;


        scrollingElement = (document.scrollingElement || document.body);
        scrollingElement.scrollTop = scrollingElement.scrollHeight;

        this.isNewGoalAdded = true; //Creating variable to store Goal Name and expand it on save 
        this.activeSections.push(autoNumber); //Adding New Goal to Active Sections to expand

        this.handleSectionToggle();

        goalCmpArray = this.template.querySelectorAll('c-goal-cmp');
        for (let i = 0; i < goalCmpArray.length; i++) {

            goalCmpArray[i].editGoalFields();
        }

        /*this.activeSections = sectionNameList;
        window.clearTimeout(this.delayRefresh);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayRefresh = setTimeout(() => {
            this.isNewGoalLoaded = true;
        }, 250);*/
        this.isAddAnotherGoal = true;
        if (this.iconDirection === 'utility:chevrondown') {
            /*  this.activeSections = [];
              window.clearTimeout(this.delayRefresh);
              // eslint-disable-next-line @lwc/lwc/no-async-operation
              this.delayRefresh = setTimeout(() => {
              this.activeSections = ;
              //const scrollWidth = (187.5 * this.goalList.length)*3;
              //window.scrollTo(0, scrollWidth); 
              //const spann = this.template.querySelector('spann');
              const accordianOffsetTop = document.scrollingElement.scrollWidth;
              window.scrollTo(0, accordianOffsetTop);
              }, 250); */
            this.renderedCallback();
        } else {
            const spann = this.template.querySelector('spann');
            const accordianOffsetTop = spann.offsetTop;
            window.scrollTo(0, accordianOffsetTop);
        }
        this.iconDirection = 'utility:chevrondown';
    }



    createOrEditGoalHandler(event) {
        let evntData = event.detail;
        let strategyEditedMap = {};
        let goalEditedMap = {};
        let goalStrategyToInsertList = [];
        let goalAndStrategyListEdited = [];
        let strategyEditedGoal = {};
        let strategyList = [];
        let recordsAfterDelete;
        let goalNotFound = true;
        goalAndStrategyListEdited = [...this.goalAndStrategyListEdited];
        ///let strategyMap=new Map();

        /*  Code for adding new Goals - START */
        if (this.isCreateOrCopyNewRecords) {
            let newGoalList = this.newGoalsListToBeCreated;
            if (evntData.operation === 'Delete') {

                this.recordTobeDeleted = evntData;
                //this.deleteObjName = evntData.objectEdited;
                if (evntData.objectEdited === 'Goal') {
                    this.deleteMsgContent = 'You are about to remove this goal. If you do remove this goal, all strategies and action steps associated with this goal will be removed as well. If you wish to continue, press delete.';
                } else if (evntData.objectEdited === 'Strategy') {
                    this.deleteMsgContent = 'You are about to remove this strategy. If you do remove this strategy, it will remove the action steps associated with this strategy. Please note that this will only remove this specific strategy, and will not remove other strategies associated with this goal nor the goal itself. If you wish to continue, press delete.';
                }
                this.showModal = true;
            } else if (evntData.operation === 'Create') {
                if (evntData.objectEdited === 'Goal') {
                    let newOtherGoalFound = false; //Variable created to check if the other goal edited is copied from previous year sales cycle or Created using add another goal button.
                    for (let i = 0; i < newGoalList.length; i++) {
                        /* Code to check if new goal added is Other CLient SPecific Goal - START */
                        if (evntData.record.Goal__c === 'Other client specific goals (Free Form/Write In)') {
                            if (newGoalList[i].Name === evntData.record.Name) {
                                newGoalList[i] = evntData.record;
                                this.disableAlertMessage = evntData.disableAlertMessage
                                goalNotFound = false;
                                newOtherGoalFound = true;
                            }
                        } else if (newGoalList[i].Goal__c === evntData.record.Goal__c) {
                            newGoalList[i] = evntData.record;
                            this.disableAlertMessage = evntData.disableAlertMessage
                            goalNotFound = false;

                        }
                        if (goalNotFound === true && i === newGoalList.length - 1) {
                            //newGoalList.push(evntData.record);
                            //newGoalList.pop(evntData.goalIndex);
                            newGoalList[evntData.goalIndex] = evntData.record;
                        } else if (!newOtherGoalFound && i === newGoalList.length - 1) {
                            newGoalList[evntData.goalIndex] = evntData.record;
                        }

                    }
                } else if (evntData.objectEdited === 'Strategy') {
                    /*if(this.strategyEditedMap.size===undefined || this.strategyEditedMap.size===0){
                        //strategyMap
                    }*/
                    /* for (let i = 0; i < newGoalList.length; i++) {
                         if (newGoalList[i].Goal__c === evntData.record.Goal__c) {
                             newGoalList[i] = evntData.record;
                         }
                     } 
                     this.newGoalsListToBeCreated = newGoalList; */
                    strategyEditedGoal = newGoalList[evntData.goalIndex];
                    for (let k in evntData.record.Strategies__r) {
                        strategyList.push(evntData.record.Strategies__r[k]);
                    }

                    newGoalList[evntData.goalIndex] = this.createGoalStrategyJSON(strategyEditedGoal, strategyList);
                    this.newGoalsListToBeCreated = newGoalList;
                }
                console.log('After update ' + JSON.stringify(this.newGoalsListToBeCreated));
            }
        }
        /*  Code for adding new Goals - END */

        if (this.isCreateOrCopyNewRecords === false) {
            if (evntData.operation === 'Edit') {
                if (evntData.objectEdited === 'Strategy') {
                    /*if(this.strategyEditedMap.size===undefined || this.strategyEditedMap.size===0){
                        //strategyMap
                    }*/

                    //code commented for Strategy lastModifedDate issue fix - start
                    /*strategyEditedMap = Object.assign({}, this.strategyEditedMap);
                    strategyEditedMap[evntData.record[0].Goal__c] = evntData.record;
                    this.strategyEditedMap = strategyEditedMap;*/
                    //code commented for Strategy lastModifedDate issue fix - end 

                    //code change for Strategy lastModifedDate issue fix - start

                    strategyEditedMap = Object.assign({}, this.strategyEditedMap);


                    let editedStrategyIdMap = {};
                    let editedStrategyLst = [];

                    let strtgyLst = evntData.record;

                    if (!this.isMapEmpty(strategyEditedMap)) {
                        if (strategyEditedMap.hasOwnProperty(strtgyLst[0].Goal__c)) {
                            let editedStrategyLstTemp = [...strategyEditedMap[strtgyLst[0].Goal__c]];
                            for (let k in editedStrategyLstTemp) {
                                if (editedStrategyLstTemp[k].hasOwnProperty('Id')
                                    && !this.isBlank(editedStrategyLstTemp[k].Id)) {

                                    editedStrategyIdMap[editedStrategyLstTemp[k].Id] = editedStrategyLstTemp[k];

                                }


                            }

                            for (let i = 0; i < strtgyLst.length; i++) {
                                if (strtgyLst[i].hasOwnProperty('Id')
                                    && !this.isBlank(strtgyLst[i].Id)) {

                                    if (!this.isMapEmpty(editedStrategyIdMap)
                                        && editedStrategyIdMap.hasOwnProperty(strtgyLst[i].Id)
                                    ) {
                                        editedStrategyLst.push(strtgyLst[i]);
                                    } else if (evntData.strategyIndex === i) {
                                        editedStrategyLst.push(strtgyLst[i]);
                                    }

                                } else {
                                    editedStrategyLst.push(strtgyLst[i]);
                                }

                            }




                        } else {
                            editedStrategyLst.push(strtgyLst[evntData.strategyIndex]);


                        }
                    } else {
                        editedStrategyLst.push(strtgyLst[evntData.strategyIndex]);

                    }


                    strategyEditedMap[strtgyLst[0].Goal__c] = editedStrategyLst;
                    this.strategyEditedMap = strategyEditedMap;





                    //code change for Strategy lastModifedDate issue fix -end

                    strategyEditedGoal = Object.assign({}, goalAndStrategyListEdited[evntData.goalIndex]);
                    for (let k in evntData.record) {
                        strategyList.push(evntData.record[k]);
                    }

                    goalAndStrategyListEdited[evntData.goalIndex] = this.createGoalStrategyJSON(strategyEditedGoal, strategyList);


                } else if (evntData.objectEdited === 'Goal') {
                    goalEditedMap = Object.assign({}, this.goalEditedMap);
                    goalEditedMap[evntData.record.Id] = evntData.record;
                    this.goalEditedMap = goalEditedMap;
                    this.disableAlertMessage = evntData.disableAlertMessage

                    goalAndStrategyListEdited[evntData.goalIndex] = evntData.record;

                    let eventRecord = {};
                    let trackRecordId = [];
                    eventRecord = Object.assign({}, evntData.record);
                    /* Code to push new Goal Name for Expand Collapse - START */
                    this.isNewGoalAdded = true;
                    if (this.isNewGoalAdded) {
                        if (evntData.record.Goal__c !== 'Other client specific goals (Free Form/Write In)') {
                            this.newGoalName = evntData.record.Goal__c;
                        } else if (evntData.record.Goal__c === 'Other client specific goals (Free Form/Write In)' && evntData.record.Goal_Write_In__c !== '') {
                            this.newGoalName = evntData.record.Goal_Write_In__c;
                        } else if (evntData.record.Goal__c === 'Other client specific goals (Free Form/Write In)' && (evntData.record.Goal_Write_In__c === '' || evntData.record.Goal_Write_In__c === undefined)) {
                            this.newGoalName = evntData.record.Goal__c;
                            this.activeSections.push(evntData.record.Name);
                        }
                    }
                    /* Code to push new Goal Name for Expand Collapse - END */
                    /* Code to Push Other Client Specific Goals Id's to a list - START */
                    trackRecordId = [...this.trackRecordId];
                    if (eventRecord.Goal__c === 'Other client specific goals (Free Form/Write In)' && eventRecord.hasOwnProperty('Id') && !this.isBlank(eventRecord.Id)
                        && !evntData.goalWriteInChange) {
                        if (trackRecordId.indexOf(eventRecord.Id) === -1) {
                            trackRecordId.push(eventRecord.Id);

                        }

                    } else if (eventRecord.Goal__c !== 'Other client specific goals (Free Form/Write In)' && eventRecord.hasOwnProperty('Id') && !this.isBlank(eventRecord.Id)) {
                        if (trackRecordId.includes(eventRecord.Id)) {
                            trackRecordId.splice(eventRecord.Id);
                        }
                    }
                    this.trackRecordId = [...trackRecordId];
                    /* Code to Push Other Client Specific Goals Id's to a list - END */

                }
            } else if (evntData.operation === 'Create') {
                if (this.isNewGoalAdded) {
                    if (evntData.record.Goal__c !== 'Other client specific goals (Free Form/Write In)') {
                        this.newGoalName = evntData.record.Goal__c;
                    } else if (evntData.record.Goal__c === 'Other client specific goals (Free Form/Write In)' && evntData.record.Goal_Write_In__c !== '') {
                        this.newGoalName = evntData.record.Goal_Write_In__c;
                    } else if (evntData.record.Goal__c === 'Other client specific goals (Free Form/Write In)' && (evntData.record.Goal_Write_In__c === '' || evntData.record.Goal_Write_In__c === undefined)) {
                        this.newGoalName = evntData.record.Goal__c;
                        this.activeSections.push(evntData.record.Name);
                    }
                }
                goalStrategyToInsertList.push(evntData.record);
                this.goalStrategyToInsertList = [];
                this.goalStrategyToInsertList = [...goalStrategyToInsertList];

                this.disableAlertMessage = evntData.disableAlertMessage

                goalAndStrategyListEdited[evntData.goalIndex] = evntData.record;
            } else if (evntData.operation === 'Delete') {

                this.recordTobeDeleted = evntData;
                //this.deleteObjName = evntData.objectEdited;
                if (evntData.objectEdited === 'Goal') {
                    this.deleteMsgContent = 'You are about to remove this goal. If you do remove this goal, all strategies and action steps associated with this goal will be removed as well. If you wish to continue, press delete.';
                } else if (evntData.objectEdited === 'Strategy') {
                    this.deleteMsgContent = 'You are about to remove this strategy. If you do remove this strategy, it will remove the action steps associated with this strategy. Please note that this will only remove this specific strategy, and will not remove other strategies associated with this goal nor the goal itself. If you wish to continue, press delete.';
                }
                this.showModal = true;


            }
        }
        this.goalAndStrategyListEdited = goalAndStrategyListEdited;

    }

    setPicklistValue(removeValueMap, pickListValue) {
        let returnList = [];
        if (removeValueMap !== undefined && removeValueMap !== null) {
            if (pickListValue !== undefined && pickListValue !== null && pickListValue.length !== 0) {
                pickListValue.forEach(function (element) {
                    if (!removeValueMap.hasOwnProperty(element)) {
                        returnList.push(element);
                    }

                });
            }

        } else if (pickListValue !== undefined && pickListValue !== null && pickListValue.length !== 0) {
            returnList = [...pickListValue];
        }
        return returnList;
    }

    deleteids(event) {
        let strategyRecordsToBeDeleted = [];
        //this.strategyRecordsToBeDeleted = [];
        let goalRecordsToBeDeleted = [];
        if (event.detail.deleteStrategyData.length > 0) {

            event.detail.deleteStrategyData.forEach(function (element) {

                strategyRecordsToBeDeleted.push(element);


            });
            //strategyRecordsToBeDeleted=[...event.detail.deleteStrategyData];
            this.strategyRecordsToBeDeleted = strategyRecordsToBeDeleted;
        }
        if (event.detail.deleteGoalData.length > 0) {

            event.detail.deleteGoalData.forEach(function (element) {

                goalRecordsToBeDeleted.push(element);


            });
            this.goalRecordsToBeDeleted = goalRecordsToBeDeleted;
        }
        console.log('event called in client level business plan and Ids are ' + JSON.stringify(this.strategyRecordsToBeDeleted) + ' \n Goal Records in clent level business plan is ' + this.goalRecordsToBeDeleted);
    }


    /*childLoadHandler(event) {
        console.log(event);



        this.count++;

        if (this.goalList.length === this.count) {
            this.cssDisplay = 'hidemodel';
        }
    }*/

    sortRecords1(sortByField, listTobeSorted, sortByOrder) {
        let returnList = [];
        let tempListVar = [];
        let sortByOrderMap = {};

        for (let k in sortByOrder) {
            if (k !== undefined) {
                sortByOrderMap[sortByOrder[k]] = true;
            }

        }

        if (!this.isListEmpty(listTobeSorted)) {
            if (sortByOrderMap !== undefined && !this.isBlank(sortByField)) {


                for (let i in listTobeSorted) {
                    if (listTobeSorted[i].hasOwnProperty('Goal__c') && sortByOrderMap.hasOwnProperty(listTobeSorted[i].Goal__c)) {
                        returnList.push(listTobeSorted[i]);
                        //listTobeSorted.splice(i,1);
                    } else {
                        tempListVar.push(listTobeSorted[i]);
                    }
                }


            } else {
                tempListVar = [...listTobeSorted];
            }

            returnList.push(...tempListVar);

        }

        return returnList;

    }

    isListEmpty(lst) {
        let isListEmpty = true;
        if (lst !== null && lst !== undefined && lst.length !== 0) {
            isListEmpty = false;
        }

        return isListEmpty;

    }

    /*isObjectPropertyHasValue(obj) {
        let isObjectPropertyHasValue = false;

        for (let prop in obj) {

            if (!this.isBlank(obj[prop])) {
                isObjectPropertyHasValue = true;

            }
        }


        return isObjectPropertyHasValue;
    }*/

    isStrategyRecEmpty(strategy) {
        let isStrategyRecEmpty = true;

        if (strategy !== undefined) {
            if ((strategy.hasOwnProperty('Strategy__c') && !this.isBlank(strategy.Strategy__c) && strategy.Strategy__c !== 'Other (please specify below)') ||
                (strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') && !this.isBlank(strategy.Action_Steps_PlannedTaken__c))) {
                isStrategyRecEmpty = false;
            }
            if ((strategy.hasOwnProperty('Strategy__c') && !this.isBlank(strategy.Strategy__c) && strategy.Strategy__c === 'Other (please specify below)'
                && strategy.hasOwnProperty('Strategy_Write_In__c') && !this.isBlank(strategy.Strategy_Write_In__c)) ||
                (strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') && !this.isBlank(strategy.Action_Steps_PlannedTaken__c))) {
                isStrategyRecEmpty = false;
            }

        }

        /*if (strategy !== undefined) {
            if ((strategy.hasOwnProperty('Strategy__c') && !this.isBlank(strategy.Strategy__c) && strategy.Strategy__c==='Other (please specify)'
                && (!strategy.hasOwnProperty('Strategy_Write_In__c') || (strategy.hasOwnProperty('Strategy_Write_In__c') && this.isBlank(strategy.Strategy_Write_In__c)))) 
                && (!strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') || (strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') && this.isBlank(strategy.Action_Steps_PlannedTaken__c)))) {
                    isStrategyRecEmpty = true;
            }
            if ((!strategy.hasOwnProperty('Strategy__c') || (strategy.hasOwnProperty('Strategy__c') && this.isBlank(strategy.Strategy__c))) &&
                (!strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') || (strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') && this.isBlank(strategy.Action_Steps_PlannedTaken__c)))) {
                    isStrategyRecEmpty = true;
            }
            
            
        }*/



        return isStrategyRecEmpty;
    }

    isPredeterminedStrategyRecEmpty(strategy) {
        let isPredeterminedStrategyRecEmpty = true;

        if (strategy !== undefined) {
            if ((strategy.hasOwnProperty('Strategy__c') && !this.isBlank(strategy.Strategy__c)) ||
                (strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') && !this.isBlank(strategy.Action_Steps_PlannedTaken__c))) {
                isPredeterminedStrategyRecEmpty = false;
            }


        }


        return isPredeterminedStrategyRecEmpty;

    }

    isOtherSpecificStrategyRecEmpty(strategy) {
        let isOtherSpecificStrategyRecEmpty = false;

        if (strategy !== undefined) {

            if ((strategy.hasOwnProperty('Strategy__c') && !this.isBlank(strategy.Strategy__c) && strategy.Strategy__c === 'Other (please specify below)'
                && (!strategy.hasOwnProperty('Strategy_Write_In__c') || (strategy.hasOwnProperty('Strategy_Write_In__c') && this.isBlank(strategy.Strategy_Write_In__c))))
                && (!strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') || (strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') && this.isBlank(strategy.Action_Steps_PlannedTaken__c)))) {
                isOtherSpecificStrategyRecEmpty = true;
            }

        }





        return isOtherSpecificStrategyRecEmpty;

    }

    strtgyRecHvngActnStpWthoutStrtgy(strategy) {
        let returnValue = false;

        if (strategy !== undefined) {
            if ((!strategy.hasOwnProperty('Strategy__c') || (strategy.hasOwnProperty('Strategy__c') && this.isBlank(strategy.Strategy__c)))) {
                if (strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') && !this.isBlank(strategy.Action_Steps_PlannedTaken__c)) {
                    returnValue = true;
                } else {
                    returnValue = false;
                }

            } else if (strategy.hasOwnProperty('Strategy__c') && !this.isBlank(strategy.Strategy__c) && strategy.Strategy__c === 'Other (please specify below)') {
                if (!strategy.hasOwnProperty('Strategy_Write_In__c') || (strategy.hasOwnProperty('Strategy_Write_In__c') && this.isBlank(strategy.Strategy_Write_In__c))) {
                    if (strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') && !this.isBlank(strategy.Action_Steps_PlannedTaken__c)) {
                        returnValue = true;
                    } else {
                        returnValue = false;
                    }

                }
            }
        }

        return returnValue;
    }

    otherSpecificStrategyRecHvngActnStpWthoutStrtgy(strategy) {
        let returnValue = false;

        if (strategy !== undefined) {
            if (strategy.hasOwnProperty('Strategy__c') && !this.isBlank(strategy.Strategy__c) && strategy.Strategy__c === 'Other (please specify below)') {
                if (!strategy.hasOwnProperty('Strategy_Write_In__c') || (strategy.hasOwnProperty('Strategy_Write_In__c') && this.isBlank(strategy.Strategy_Write_In__c))) {
                    if (strategy.hasOwnProperty('Action_Steps_PlannedTaken__c') && !this.isBlank(strategy.Action_Steps_PlannedTaken__c)) {
                        returnValue = true;
                    } else {
                        returnValue = false;
                    }

                }
            }
        }

        return returnValue;
    }

    isGoalWriteInEmpty(goal) {
        //Checking empty Goal Write in Goes here */
        let returnValue = false;

        if (goal !== undefined) {
            if (goal.hasOwnProperty('Goal__c') && !this.isBlank(goal.Goal__c) && goal.Goal__c === 'Other client specific goals (Free Form/Write In)') {
                if (!goal.hasOwnProperty('Goal_Write_In__c') || (goal.hasOwnProperty('Goal_Write_In__c') && this.isBlank(goal.Goal_Write_In__c))) {
                    returnValue = true;
                } else {
                    returnValue = false;
                }

            }
        }

        return returnValue;
    }

    isObjectHasSameValue(obj1, obj2) {

        for (let key in obj1) {
            if (obj2.hasOwnProperty(key) && obj2[key] === obj1[key]) {
                //
            } else {
                return false;
            }
        }
        return true;
    }


    confirmCancel() {
        this.recordTobeDeleted = undefined;
        this.showModal = false;
    }

    confirmDelete() {
        let goalTobeDeletedMap = {};
        let strategyEditedMap = {};
        //let strategyToBeEditedList=[];
        let strategyTobeDeletedMap = {};
        let goalList = [];
        let goalCmpArray = [];
        let goalEditedMap = {};
        this.showModal = false;
        let tempListVar = [];
        let goalListTobeDeleted = [];
        let strategtListTobeDeleted = [];
        let recordTobeDeleted = Object.assign({}, this.recordTobeDeleted);
        //ram
        let goalStrategyToInsertList = [];
        let strtgyLst = [];
        let finalGoalAndStrategyListToInsert = [];
        let goalAndStrategyListEdited = [];
        let strategyEditedGoal = {};
        let strategyLst = [];
        let strategyIndex;

        goalAndStrategyListEdited = this.goalAndStrategyListEdited;
        let newGoalsListToBeCreated = this.newGoalsListToBeCreated;
        if (this.activeSections.length > 0) {
            this.handleIconDirection = true;
            this.handleRenderLoop = true;
        } else if (this.activeSections.length === 0) {
            this.handleIconDirection = false;
            this.handleRenderLoop = true;
        }
        if (this.isEdit) {
            if (this.recordTobeDeleted !== undefined) {
                if (this.isCreateOrCopyNewRecords === false) { //To check records are not copied
                    if (this.recordTobeDeleted.objectEdited === 'Goal') {

                        if (this.recordTobeDeleted.record.hasOwnProperty('Id') &&
                            !this.isBlank(this.recordTobeDeleted.record.Id)) {
                            goalTobeDeletedMap = Object.assign({}, this.goalTobeDeletedMap);
                            goalTobeDeletedMap[this.recordTobeDeleted.record.Id] = this.recordTobeDeleted.record;
                            this.goalTobeDeletedMap = goalTobeDeletedMap;

                            goalEditedMap = Object.assign({}, this.goalEditedMap);
                            if (!this.isMapEmpty(goalEditedMap) && goalEditedMap.hasOwnProperty(this.recordTobeDeleted.record.Id)) {
                                delete goalEditedMap[this.recordTobeDeleted.record.Id];
                                this.goalEditedMap = goalEditedMap;
                            }


                        } else {
                            this.goalStrategyToInsertList = [];
                        }
                        goalList = [...this.goalList];
                        goalList.splice(this.recordTobeDeleted.goalIndex, 1);
                        this.goalList = goalList;

                        goalAndStrategyListEdited.splice(this.recordTobeDeleted.goalIndex, 1);
                        this.goalAndStrategyListEdited = goalAndStrategyListEdited;

                    }
                    else if (this.recordTobeDeleted.objectEdited === 'Strategy') {
                        if (this.recordTobeDeleted.record.hasOwnProperty('Id') &&
                            !this.isBlank(this.recordTobeDeleted.record.Id)) {
                            strategyTobeDeletedMap = Object.assign({}, this.strategyTobeDeletedMap);
                            strategyTobeDeletedMap[this.recordTobeDeleted.record.Id] = this.recordTobeDeleted.record;
                            this.strategyTobeDeletedMap = strategyTobeDeletedMap;

                            strategyEditedMap = Object.assign({}, this.strategyEditedMap);
                            if (!this.isMapEmpty(strategyEditedMap) && strategyEditedMap.hasOwnProperty(this.recordTobeDeleted.record.Goal__c)) {
                                //strategyToBeEditedList=[...strategyEditedMap[this.recordTobeDeleted.record.Goal__c]];
                                if (strategyEditedMap[recordTobeDeleted.record.Goal__c] !== undefined && strategyEditedMap[recordTobeDeleted.record.Goal__c].length !== 0) {
                                    strategyEditedMap[recordTobeDeleted.record.Goal__c].forEach(function (element) {
                                        if (element.Id === recordTobeDeleted.record.Id) {
                                            //
                                        } else {
                                            tempListVar.push(element);
                                        }

                                    });

                                    strategyEditedMap[recordTobeDeleted.record.Goal__c] = tempListVar;
                                }

                                this.strategyEditedMap = strategyEditedMap;
                            }
                        } else {
                            if (recordTobeDeleted.record.hasOwnProperty('Goal__c') && !this.isBlank(recordTobeDeleted.record.Goal__c)) {
                                strategyEditedMap = Object.assign({}, this.strategyEditedMap);
                                if (!this.isMapEmpty(strategyEditedMap) && strategyEditedMap.hasOwnProperty(recordTobeDeleted.record.Goal__c)) {
                                    //strategyToBeEditedList=[...strategyEditedMap[this.recordTobeDeleted.record.Goal__c]];
                                    if (strategyEditedMap[recordTobeDeleted.record.Goal__c] !== undefined && strategyEditedMap[recordTobeDeleted.record.Goal__c].length !== 0) {
                                        for (let i in strategyEditedMap[recordTobeDeleted.record.Goal__c]) {


                                            if (strategyEditedMap[recordTobeDeleted.record.Goal__c][i].hasOwnProperty('Id') && !this.isBlank(strategyEditedMap[recordTobeDeleted.record.Goal__c][i].Id)) {
                                                tempListVar.push(strategyEditedMap[recordTobeDeleted.record.Goal__c][i]);
                                            } else {
                                                if (!this.isObjectHasSameValue(strategyEditedMap[recordTobeDeleted.record.Goal__c][i], recordTobeDeleted.record)) {
                                                    tempListVar.push(strategyEditedMap[recordTobeDeleted.record.Goal__c][i]);
                                                }
                                            }

                                        }

                                        strategyEditedMap[recordTobeDeleted.record.Goal__c] = tempListVar;
                                    }

                                    this.strategyEditedMap = strategyEditedMap;
                                }
                            } else {
                                goalStrategyToInsertList = [...this.goalStrategyToInsertList];
                                finalGoalAndStrategyListToInsert = [...this.goalStrategyToInsertList];

                                for (let i in goalStrategyToInsertList) {

                                    if (!this.isMapEmpty(goalStrategyToInsertList[i]) && goalStrategyToInsertList[i].hasOwnProperty('Strategies__r')
                                        && !this.isBlank(goalStrategyToInsertList[i].Strategies__r)) {
                                        strtgyLst = [...goalStrategyToInsertList[i].Strategies__r];
                                        for (let j in strtgyLst) {
                                            if (!this.isObjectHasSameValue(strtgyLst[j], recordTobeDeleted.record)) {
                                                tempListVar.push(strtgyLst[j]);
                                            }
                                        }
                                        console.log('tempListVar' + tempListVar);
                                        finalGoalAndStrategyListToInsert[i] = this.createGoalStrategyJSON(goalStrategyToInsertList[i], tempListVar);

                                    }
                                }

                                this.goalStrategyToInsertList = [];
                                this.goalStrategyToInsertList = [...finalGoalAndStrategyListToInsert];

                            }


                        }

                        strategyEditedGoal = Object.assign({}, goalAndStrategyListEdited[recordTobeDeleted.goalIndex]);
                        if (strategyEditedGoal.hasOwnProperty('Strategies__r')) {
                            //strategyLst = [...strategyEditedGoal.Strategies__r];
                            strategyLst = strategyEditedGoal.Strategies__r;

                            strategyIndex = recordTobeDeleted.strategyIndex;

                            /*for(let i in strategyEditedGoal.Strategies__r)
                            {
                                if(strategyIndex!==i){
                                    strategyLst.push(strategyEditedGoal.Strategies__r[i]);
                                }
                                
    
                            }*/

                            strategyLst.splice(strategyIndex, 1);

                            if (strategyLst === undefined || strategyLst.length === 0) {
                                delete strategyEditedGoal.Strategies__r;
                                goalAndStrategyListEdited[recordTobeDeleted.goalIndex] = strategyEditedGoal;
                            } else {
                                goalAndStrategyListEdited[recordTobeDeleted.goalIndex] = this.createGoalStrategyJSON(strategyEditedGoal, strategyLst);
                            }
                        }

                        this.goalAndStrategyListEdited = goalAndStrategyListEdited;

                        goalCmpArray = this.template.querySelectorAll('c-goal-cmp');
                        console.log('goalIndex==>' + this.recordTobeDeleted.goalIndex + 'strategyIndex==>' + this.recordTobeDeleted.strategyIndex);
                        goalCmpArray[recordTobeDeleted.goalIndex].removeStrategyFromList(recordTobeDeleted.strategyIndex);
                    }
                } else if (this.isCreateOrCopyNewRecords) {
                    if (this.recordTobeDeleted.objectEdited === 'Goal') {
                        /*for (let i in this.newGoalsListToBeCreated) {
                            if (this.newGoalsListToBeCreated[i].Goal__c === this.recordTobeDeleted.record.Goal__c) {
                                //records after Delete 
                                console.log('Pop called');
                                this.newGoalsListToBeCreated.pop(newGoalList[i]);
                            }
                        } */
                        this.goalList.splice(this.recordTobeDeleted.goalIndex, 1);
                        newGoalsListToBeCreated.splice(this.recordTobeDeleted.goalIndex, 1);
                        this.newGoalsListToBeCreated = newGoalsListToBeCreated;
                    } else if (this.recordTobeDeleted.objectEdited === 'Strategy') {
                        /* for (let i in this.newGoalsListToBeCreated) {
                             for (let j in this.newGoalsListToBeCreated[i].Strategies__r) {
                                 if (this.newGoalsListToBeCreated[i].Strategies__r[j].Strategy__c === this.recordTobeDeleted.record.Strategy__c) {
                                     console.log('pop called for strategy \n ' + this.newGoalsListToBeCreated[i].Strategies__r[j].Strategy__c + '  --------->  ' + this.recordTobeDeleted.record.Strategy__c);
                                     this.newGoalsListToBeCreated[i].Strategies__r.splice(j, 1);
                                     console.log('\n new List ' + JSON.stringify(this.newGoalsListToBeCreated));
                                     break;
                                 }
                             }
                         } */
                        strategyEditedGoal = this.newGoalsListToBeCreated[this.recordTobeDeleted.goalIndex];
                        console.log('this.newGoalsListToBeCreated[this.recordTobeDeleted.goalIndex] ' + JSON.stringify(this.newGoalsListToBeCreated[this.recordTobeDeleted.goalIndex]));
                        if (strategyEditedGoal !== undefined) {
                            if (strategyEditedGoal.hasOwnProperty('Strategies__r')) {
                                console.log('Inside Strategy ');
                                strategyLst = strategyEditedGoal.Strategies__r;
                                strategyIndex = recordTobeDeleted.strategyIndex;

                                /*for(let i in strategyEditedGoal.Strategies__r)
                                {
                                    if(strategyIndex!==i){
                                        strategyLst.push(strategyEditedGoal.Strategies__r[i]);
                                    }
                                    
        
                                }*/

                                strategyLst.splice(strategyIndex, 1);

                                if (strategyLst === undefined || strategyLst.length === 0) {
                                    delete strategyEditedGoal.Strategies__r;
                                    newGoalsListToBeCreated[this.recordTobeDeleted.goalIndex] = strategyEditedGoal;
                                } else {
                                    newGoalsListToBeCreated[this.recordTobeDeleted.goalIndex] = this.createGoalStrategyJSON(strategyEditedGoal, strategyLst);
                                }
                            }
                        }

                        this.newGoalsListToBeCreated = newGoalsListToBeCreated;
                        goalCmpArray = this.template.querySelectorAll('c-goal-cmp');
                        console.log('goalIndex==>' + this.recordTobeDeleted.goalIndex + 'strategyIndex==>' + this.recordTobeDeleted.strategyIndex);
                        goalCmpArray[this.recordTobeDeleted.goalIndex].removeStrategyFromList(this.recordTobeDeleted.strategyIndex);
                        console.log('\n new List ' + JSON.stringify(this.newGoalsListToBeCreated) + '\n and GoalList for UI ' + JSON.stringify(this.goalList));
                    }
                }
            }
        }
        else if (!this.isEdit) {
            this.iconDirection = 'utility:chevrondown';
            if (this.recordTobeDeleted !== undefined) {
                if (this.recordTobeDeleted.objectEdited === 'Goal') {
                    this.cssDisplay = '';
                    goalListTobeDeleted.push(this.recordTobeDeleted.record);

                    this.upsertClientPlanRecords(goalListTobeDeleted, null, null,
                        null, null, null, null, null);
                }
                else if (this.recordTobeDeleted.objectEdited === 'Strategy') {
                    this.cssDisplay = '';
                    if (this.recordTobeDeleted.record.hasOwnProperty('Id') &&
                        !this.isBlank(this.recordTobeDeleted.record.Id)) {
                        strategtListTobeDeleted.push(this.recordTobeDeleted.record);

                        this.upsertClientPlanRecords(null, null, null,
                            null, null, strategtListTobeDeleted, null, null);
                    }
                    else {
                        goalCmpArray = this.template.querySelectorAll('c-goal-cmp');
                        goalCmpArray[this.recordTobeDeleted.goalIndex].removeStrategyFromList(this.recordTobeDeleted.strategyIndex);
                        this.cssDisplay = 'hidemodel';
                    }
                }
            }
        }

    }

    isMapEmpty(map1) {
        for (let key in map1) {
            if (map1.hasOwnProperty(key)) return false;
        }
        return true;
    }

    createGoalStrategyJSON(goalRec, strategyList) {
        if (goalRec !== undefined) {
            goalRec.Strategies__r = strategyList;
        }
        return goalRec;
    }

    printClientPlan() {
        console.log('Print clicked');
        console.log('this.salesSeason = ', this.salesSeason);
        this.cssDisplay = '';
        getTemplateInXML({ accountId: this.recordId, salesSeason: this.salesSeason })
            .then(result => {
                console.log(result);

                let goalList = result;
                console.log(goalList);

                let accountName = result.accountName;
                let objectItagesMap = result.objectItags;
                let modxmlString = result.xmlString;
                // let goalListData = result.goalList;
                let today;

                //let goalListData = this.sortRecords('Goal__c', result.goalList, this.mandatoryGoalList);
                let goalListData = this.sortClientPlanRecords(result.goalList, 'Goal__c',
                    this.getListFromValueSeparatedStr(ClientPlan_Goal_DisplayOrder, ';'));

                goalListData = this.removeAttainNpsPromoter(goalListData);

                console.log('goalListData = ', JSON.stringify(goalListData));
                for (let objectName in objectItagesMap) {

                    if (objectItagesMap.hasOwnProperty(objectName)) {

                        if (objectName === 'Account') {
                            console.log('Test');

                            for (let k in objectItagesMap[objectName]) {
                                let key = objectItagesMap[objectName][k];
                                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                                let value = '';
                                if (key === 'Name') {
                                    value = goalList.accountName;
                                }
                                else if (key === 'Sales_Season__c') {
                                    value = this.salesSeason;
                                }

                                else if (key === 'today_Date') {
                                    today = this.formatDate();
                                    value = today;
                                }

                                if (value !== '' && value !== null && value !== undefined) {
                                    modxmlString = modxmlString.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                                } else {
                                    modxmlString = modxmlString.split(replaceItagName).join('');
                                }
                            }

                        }
                        else if (objectName === 'Goal') {
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
                            console.log('startItag' + startItag + ' : endItag : ' + endItag);
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


                            modxmlString = this.returnChildData(rowToReccurse, TableToReccurse, goalListData, objectName, objectItagesMap, stIdx, endIdx, modxmlString, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx);



                        }
                    }
                }



                let a = window.document.createElement('a');
                a.href = window.URL.createObjectURL(new Blob([modxmlString]));
                let templateName = 'Client Plan ' + this.salesSeason + ' ' + accountName;
                a.download = templateName + '.doc';
                document.body.appendChild(a);
                a.click();
                const event = new ShowToastEvent({
                    title: '',
                    message: 'Client Plan Printed Successfully.',
                });
                this.dispatchEvent(event);
                this.cssDisplay = 'hidemodel';

            })
            .catch(error => {
                console.log('Error==>' + error);
                this.cssDisplay = 'hidemodel';
            });




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

    returnChildData(rowToReccurse, TableToReccurse, NPSFinalData, objectName, objectItagesMap, stIdx, endIdx, xmlWsectTag, stTableIdx, endTableIdx, startItag, endItag, TableHeader, stHeaderIdx, endHeaderIdx) {
        let FinalTable = '';
        let totalRows = '';
        let count = 0;
        let startIndex = TableToReccurse.lastIndexOf(startItag);
        let endIndex = TableToReccurse.indexOf(endItag);
        let stIndxTbl = TableToReccurse.lastIndexOf('<w:tr ', startIndex);
        let endIndxTbl = TableToReccurse.indexOf('</w:tr>', endIndex);
        endIndxTbl += '</w:tr>'.length;

        for (let i in NPSFinalData) {
            let TableToIterate = TableToReccurse;
            let strategyList;
            let allStrategyRows = '';
            if (NPSFinalData[i].Strategies__r !== null && NPSFinalData[i].Strategies__r !== undefined) {
                strategyList = NPSFinalData[i].Strategies__r;

            }
            console.log(TableToIterate);
            console.log(endHeaderIdx);
            count = count + 1;
            let eachRow = rowToReccurse;
            // eslint-disable-next-line no-useless-concat
            let replaceGoal = '%%' + objectName + '.' + 'Goal__c' + '@@';
            let replaceGoalWriteIn = '%%' + objectName + '.' + 'Goal_Write_In__c' + '@@';

            if (NPSFinalData[i].Goal__c !== null) {
                if (NPSFinalData[i].Goal__c === 'Other client specific goals (Free Form/Write In)' && NPSFinalData[i].Goal_Write_In__c !== null && NPSFinalData[i].Goal_Write_In__c !== undefined && (NPSFinalData[i].Goal__c !== null && NPSFinalData[i].Goal__c.indexOf('Other client specific goals') !== -1)) {
                    eachRow = eachRow.split(replaceGoal).join(NPSFinalData[i].Goal_Write_In__c.substring(0, 100));
                } else if (NPSFinalData[i].Goal__c === 'Other client specific goals (Free Form/Write In)' && (NPSFinalData[i].Goal_Write_In__c === null || NPSFinalData[i].Goal_Write_In__c === undefined)) {
                    eachRow = eachRow.split(replaceGoal).join(NPSFinalData[i].Goal__c);
                } else if (NPSFinalData[i].Goal__c !== 'Other client specific goals (Free Form/Write In)') {
                    eachRow = eachRow.split(replaceGoal).join(NPSFinalData[i].Goal__c);
                }
            } else {
                eachRow = eachRow.split(replaceGoal).join('');
            }

            if (NPSFinalData[i].Goal_Write_In__c !== null && NPSFinalData[i].Goal_Write_In__c !== undefined && (NPSFinalData[i].Goal__c !== null && NPSFinalData[i].Goal__c.indexOf('Other client specific goals') !== -1)) {
                //eachRow = eachRow.split(replaceGoalWriteIn).join(': ' + NPSFinalData[i].Goal_Write_In__c);
                eachRow = eachRow.split(replaceGoalWriteIn).join(' ');
            } else {
                eachRow = eachRow.split(replaceGoalWriteIn).join('');
            }



            let startStrategyIndex = eachRow.lastIndexOf('%%Goal.Strategy__c@@');
            let endStartegyIndex = eachRow.indexOf('%%Goal.Action_Steps_PlannedTaken__c@@');
            let stStrategyIndxTbl = eachRow.lastIndexOf('<w:tr ', startStrategyIndex);
            let endStrategyIndxTbl = eachRow.indexOf('</w:tr>', endStartegyIndex);
            endStrategyIndxTbl += '</w:tr>'.length;

            let rowToStrategyReccurse = eachRow.substring(stStrategyIndxTbl, endStrategyIndxTbl);
            console.log('rowToStrategyReccurse ::::  ' + rowToStrategyReccurse);

            /* let stStrategyIdx = eachRow.lastIndexOf('w:tr w:fill="strategystart"');
             stStrategyIdx -= 1;
             //let endStrategyIdx = eachRow.lastIndexOf('</w:tbl w:fill="strategyend">');
             let endStrategyIdx = eachRow.lastIndexOf('</w:tr w:fill="strategyend">');
             //endHeaderIdx +='</w:tr w:fill="strategyend">'.length; 
             let rowToStrategyReccurse = eachRow.substring(stStrategyIdx, endStrategyIdx);
 
             console.log('rowToStrategyReccurse :::   '+rowToStrategyReccurse);*/

            for (let j in strategyList) {
                let eachStrategyRow = rowToStrategyReccurse;
                for (let k in objectItagesMap[objectName]) {
                    let key = objectItagesMap[objectName][k];
                    let replaceItagName = '%%' + objectName + '.' + key + '@@';

                    if (strategyList[j][key] !== null && strategyList[j][key] !== '' && strategyList[j][key] !== undefined) {
                        console.log('strategyList[j][key] ::::::: ' + strategyList[j][key]);
                        let value = strategyList[j][key];
                        eachStrategyRow = eachStrategyRow.split(replaceItagName).join(this.replaceXmlSpecialCharacters(value));
                    } else {
                        console.log('strategyList[j][key] ::::::: ');
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

        }

        if (NPSFinalData !== null) {
            FinalTable += TableToReccurse.substring(0, stIndxTbl) + totalRows + TableToReccurse.substring(endIndxTbl);
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + FinalTable + xmlWsectTag.substring(endTableIdx);
        return xmlWsectTag;

    }

    replaceBetweenString(startIndex, endIndex, eachRow, value) {
        return eachRow.substring(0, startIndex) + value + this.substring(endIndex);
    }


    addStrategyHandler(event) {
        let goalAndStrategyListEdited = [];
        let strategyEditedGoal = {};
        let evntData = event.detail;

        goalAndStrategyListEdited = this.goalAndStrategyListEdited;

        strategyEditedGoal = Object.assign({}, goalAndStrategyListEdited[evntData.goalIndex]);
        goalAndStrategyListEdited[evntData.goalIndex] = this.createGoalStrategyJSON(strategyEditedGoal, evntData.record);

        this.goalAndStrategyListEdited = goalAndStrategyListEdited;

        this.editClientPlanRecords();
    }

    confirmReminderCancel() {
        this.showReminderModal = false;
        this.isReminderOkClicked = false;
    }

    confirmOk() {
        this.showReminderModal = false;
        this.isReminderOkClicked = true;
        this.saveClientPlanRecords();
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


    fetchPreviousSalesCycleRecords() {
        var splitSalesCycle;
        var splitSingleNumArray;
        var splitDateArray;
        var splitDateonSlash;
        var seperatedYear;
        let goalList = [];
        let sectionNameList = [];
        var goalPicklistValue = [];
        let goalNameMap = {};
        let goalNames = [];
        let previousSalesSeasonRecords;
        var previousSalesSeason = this.salesSeason;
        splitSalesCycle = previousSalesSeason.split(',');
        splitSingleNumArray = splitSalesCycle[0].split(' ');
        let numberObtained = splitSingleNumArray[1] - 1;
        splitDateArray = splitSalesCycle.slice(1);
        console.log('splitDateArray ' + splitDateArray);
        splitDateonSlash = splitDateArray[0].split('/');
        console.log('splitDateonSlash ' + splitDateonSlash);
        seperatedYear = splitDateonSlash[2];
        console.log('seperatedYear ' + seperatedYear);
        let yearObatained = seperatedYear - 1;
        previousSalesSeason = '';
        previousSalesSeason = 'IY ' + numberObtained + ', ' + '1/1/' + yearObatained;
        console.log('previousSalesSeason ' + previousSalesSeason);

        /* Copying Previous Sales Cycle Goal and Strategy Records - START */
        this.goalList = [];
        this.newGoalsListToBeCreated = [];
        this.isCreateOrCopyNewRecords = true;
        /* Code for Clearing out Id's for Goals and Strategy's - START  */
        if (this.previousSalesSeasonRecords !== undefined) {
            for (let i in this.previousSalesSeasonRecords) {
                this.previousSalesSeasonRecords[i].Id = '';
                for (let j in this.previousSalesSeasonRecords[i].Strategies__r) {
                    this.previousSalesSeasonRecords[i].Strategies__r[j].Id = '';
                    this.previousSalesSeasonRecords[i].Strategies__r[j].Goal__c = '';
                }
            }
            /* Code for Clearing out Id's for Goals and Strategy's - END  */
            if (this.previousSalesSeasonRecords !== undefined && this.previousSalesSeasonRecords !== null &&
                this.previousSalesSeasonRecords.length > 0) {
                this.isgoalListEmpty = false;

                for (let i = 0; i < this.previousSalesSeasonRecords.length; i++) {
                    //sectionNameList.push(i);
                    if (this.previousSalesSeasonRecords[i].hasOwnProperty('Goal__c')
                        && !this.isBlank(this.previousSalesSeasonRecords[i].Goal__c)) {
                        goalNameMap[this.previousSalesSeasonRecords[i]] = true;
                        goalNames.push(this.previousSalesSeasonRecords[i]);
                        sectionNameList.push(this.previousSalesSeasonRecords[i].Name);
                    } else {
                        goalNames.push('');
                    }

                }
                this.goalNames = goalNames;


                //this.expandCollapse = 'Collapse All';
                //this.iconDirection = 'utility:chevrondown';
                this.activeSections = sectionNameList;


            } else {
                this.isgoalListEmpty = true;

            }
            this.mandatoryGoalList = this.getListFromValueSeparatedStr(Client_Plan_Mandatory_Goals, '##');
            for (let i = 0; i < this.previousSalesSeasonRecords.length; i++) {
                this.previousSalesSeasonRecords[i].Sales_Season__c = this.salesSeason;
            }
            this.goalList = this.sortClientPlanRecords(this.previousSalesSeasonRecords, 'Goal__c',
                this.getListFromValueSeparatedStr(ClientPlan_Goal_DisplayOrder, ';'));
                this.goalList = this.removeAttainNpsPromoter(this.goalList);
            goalList = [...this.goalList];
            this.newGoalsListToBeCreated = [...this.goalList];

            this.goalPicklist = this.setPicklistValue(goalNameMap, goalPicklistValue);


            if (this.goalUsedPicklistValues.length === this.goalPicklist.length - 1) {
                this.isAddGoalButtonDisabled = true;
            } else {
                this.isAddGoalButtonDisabled = false;
            }
            this.isEditButtonDisabled = false;
            this.isPrintButtonDisabled = false;
            this.isEdit = true;

            /*this.activeSections = [''];
            this.expandCollapse = 'Expand All';
            this.iconDirection = 'utility:chevronright';*/

            this.strategyEditedMap = {};
            this.goalEditedMap = {};
            this.goalStrategyToInsertList = [];
            this.goalTobeDeletedMap = {};
            this.strategyTobeDeletedMap = {};
            this.isReminderOkClicked = false;

            this.isAddGoalButtonDisabled = false;
            this.isEditButtonDisabled = true;
            this.isPrintButtonDisabled = true;
            this.isEdit = true;

            this.cssDisplay = 'hidemodel';
        }


        /* Copying Previous Sales Cycle Goal and Strategy Records - END */


    }

    createNewGoal() {
        let newGoalsListToBeCreated = [];
        var i;
        let goalList = [];
        this.goalList = [];
        this.goalStrategyToInsertList = [];
        this.isCreateOrCopyNewRecords = true;
        let sectionNameList = [];
        this.activeSections = [];
        this.mandatoryGoalList = this.getListFromValueSeparatedStr(Client_Plan_Mandatory_Goals, '##');
        console.log('this.mandatoryGoalList ' + this.mandatoryGoalList);
        for (i = 0; i < this.mandatoryGoalList.length; i++) {
            newGoalsListToBeCreated.push(this.mandatoryGoalList[i]);
        }
        newGoalsListToBeCreated.push('New Goal and Strategy Information');
        console.log('Create new goal called ' + newGoalsListToBeCreated);

        if (newGoalsListToBeCreated !== undefined && newGoalsListToBeCreated !== null &&
            newGoalsListToBeCreated.length > 0) {
            for (i = 0; i < newGoalsListToBeCreated.length; i++) {
                sectionNameList.push('GL-000' + i + 1);
                goalList.push({ "sobjectType": "Goal__c", "Name": "GL-000" + i + 1, "Sales_Season__c": this.salesSeason, "Goal__c": newGoalsListToBeCreated[i], "Company__c": this.recordId, "Goal_Write_In__c": "" });
                console.log('goal List ' + goalList);
                this.goalStrategyToInsertList = [...goalList];
            }
            //this.goalList = goalList;
            this.goalList = this.removeAttainNpsPromoter(goalList);
            this.goalStrategyToInsertList = this.removeAttainNpsPromoter(this.goalStrategyToInsertList);
            console.log('goal List ' + goalList + '\n this.goalList ' + JSON.stringify(this.goalList) + '\n this.goalStrategyToInsertList ' + JSON.stringify(this.goalStrategyToInsertList));
        }
        /* Code for pushing Active Sections Manually - START */
        this.activeSections = sectionNameList;
        /* Code for pushing Active Sections Manually - END */
        this.newGoalsListToBeCreated = this.goalStrategyToInsertList;
        if (this.goalList.length > 0) {
            this.isgoalListEmpty = false;
            this.isEditButtonDisabled = true;
            this.isPrintButtonDisabled = true;
            this.isAddGoalButtonDisabled = true;
            this.isEdit = true;
        }

    }


    closePopUp() {
        this.openPopUp = false;
    }

    openHelpPopup() {
        this.openPopUp = true;
    }

    // added by varun as per case #3559
    removeAttainNpsPromoter(recordList) {
        if (recordList.length > 0) {
            const index = recordList.findIndex((record) => {
                return record.hasOwnProperty('Sales_Season__c') && record.hasOwnProperty('Goal__c') &&
                    record.Sales_Season__c == "IY 24, 1/1/2025" &&
                    record.Goal__c.includes("Attain / Maintain NPS Promoter Rating");
            })
            if (index !== -1) {
                recordList.splice(index, 1);
            }
        }
        return recordList;
    }

}