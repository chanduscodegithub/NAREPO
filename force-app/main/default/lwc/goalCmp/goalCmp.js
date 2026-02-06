/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';
import { fireEvent, registerListener } from 'c/pubsub';

export default class GoalCmp extends LightningElement {

    //@api goal;
    @api goalUsedPicklistValues;
    @track usedGoals = [];
    @api mandatoryGoalList;
    @api picklistFieldMap;
    @api isEdit;
    @track goalSelected;
    @track goalPicklist;
    @track goalPickListValue;
    @track enableGoalWriteIn = false;
    @track strategyPicklist = [];
    @track isGoalAMandatoryGoal;
    @track goalRec;
    @api index;
    @track goalSectionName = 'New Goal and Strategy Information';
    @track strategyList;
    @track isGoalValueEmpty = true;
    existingRec;
    @api goalNames;
    @track deleteStrategyData = [];
    @track deleteGoalData = [];
    @track openmodel = false;
    @track count = 0;
    @track onLoad = true;

    @track strategyUsedPicklistValues = [];
    @track completeStrategyPicklist = [];

    @track backupUsedStrategies=[];

    @api hasEditAccess;
    disableAlertMessage;

    @api
    get goal() {

        return this.goalRec;
    }
    set goal(value) {

        //this.goalRec = value;
        //console.log(this.goalRec.Goal__c);
        if (!this.onLoad) {
            this.setGoalValue(value);
        }
        else {
            this.goalRec = value;
            console.log('goalcmp----',JSON.stringify(this.goalRec));
        }

    }


    setGoalValue(value) {
        console.log('goal value = ',JSON.stringify(value));
        let goalRec = {};
        let isGoalAMandatoryGoal = false;
        let strategyList = [];
        let isGoalValueEmpty = true;
        let strategyPicklist = [];
        let picklistMap = {};
        let goalPicklist = [];
        let existingRec;

        this.goalRec = value;
        goalRec = Object.assign({}, this.goalRec);


        picklistMap = this.picklistFieldMap;

        if (this.mandatoryGoalList !== undefined) {
            this.mandatoryGoalList.forEach(function (element) {
                if (goalRec.hasOwnProperty("Goal__c") && element === goalRec.Goal__c) {
                    isGoalAMandatoryGoal = true;
                }
            });
        }


        this.isGoalAMandatoryGoal = isGoalAMandatoryGoal;

        if (goalRec.hasOwnProperty('Strategies__r')) {

            goalRec.Strategies__r.forEach(function (element) {

                strategyList.push(element);

            });
        }



        if (goalRec.hasOwnProperty("Goal__c") && !this.isBlank(goalRec.Goal__c)) {
            isGoalValueEmpty = false;
            this.goalSectionName = goalRec.Goal__c;


            if (goalRec.Goal__c === 'Other client specific goals (Free Form/Write In)') {
                this.enableGoalWriteIn = true;
            }else{
                this.enableGoalWriteIn = false;
            }

        }

        /* Logic to change the accordian name of Other client Specific goal if Write in value is defined - START */
            if (goalRec.Goal__c === 'Other client specific goals (Free Form/Write In)') {
                if (goalRec.Goal_Write_In__c !== undefined) {
                    this.goalSectionName = goalRec.Goal_Write_In__c.substring(0,100);
                } else {
                    this.goalSectionName = goalRec.Goal__c;
                }
            } 
        /* Logic to change the accordian name of Other client Specific goal if Write in value is defined - END */

        if (!isGoalValueEmpty && strategyList !== undefined && strategyList.length === 0) {
            strategyList.push({ 'sobjectType': 'Strategy__c', 'Goal__c': goalRec.Id, 'Strategy__c': '', 'Action_Steps_PlannedTaken__c': '', 'Applicable_for__c': '' });
        }

        if (goalRec.hasOwnProperty("Goal__c") && picklistMap.hasOwnProperty(goalRec.Goal__c)) {
            strategyPicklist.push({ label: '', value: '' });
            picklistMap[goalRec.Goal__c].forEach(function (element) {

                strategyPicklist.push({ label: element, value: element });

            });
        }

        if (this.strategyUsedPicklistValues !== null && this.strategyUsedPicklistValues !== undefined) {
            this.strategyUsedPicklistValues.forEach(picklistOption => {
                strategyPicklist = strategyPicklist.filter(option => option.value !== picklistOption);
            })
        }


        if (picklistMap !== undefined && picklistMap !== null && picklistMap.hasOwnProperty('Goal__c')) {
            picklistMap.Goal__c.forEach(function (element) {
                if (element !== 'Protect / Renew Current Book of Business (Mandatory Goal)' && element !== 'Attain / Maintain NPS Promoter Rating (Mandatory Goal)') {
                    goalPicklist.push({ label: element, value: element });
                }

            });
        }

        if (this.usedGoals !== null && this.usedGoals !== undefined) {
            this.usedGoals = this.usedGoals.filter(goal => goal !== this.goalSelected);
            this.usedGoals.forEach(picklistOption => {
                goalPicklist = goalPicklist.filter(option => option.value !== picklistOption);
            })
        }

        if (!this.isBlank(goalRec.Id)) {
            existingRec = true;
        } else {
            existingRec = false;
        }
        this.existingRec = existingRec;


        this.goalPicklist = goalPicklist;

        this.strategyPicklist = strategyPicklist;

        this.isGoalValueEmpty = isGoalValueEmpty;

        this.strategyList = strategyList;
    }

    /*@api
    get goalPicklist(){
        return this.goalPickListValue;
    }
    set goalPicklist(value) {
        let goalPickListValue=[];
        if (value !== undefined && value !== null && value.length!==0) {


            value.forEach(function (element) {

                goalPickListValue.push({ label: element, value: element });

            });

        }
        this.goalPickListValue = goalPickListValue;
    }*/


    /* connectedCallback() {
 
         let goalData = {};
         let isGoalAMandatoryGoal = false;
         let goalPicklistValue = [];
         let picklistMap = {};
         let strategyPicklist = [];
         let strategyList = [];
         let existingRec;
         let isGoalValueEmpty = true;
         let goalNames=[];
         let goalNameMap = {};
         let goalPicklist=[];
 
         goalData = Object.assign({}, this.goal);
         this.goalRec = goalData;
 
         picklistMap = this.picklistFieldMap;
 
         if (this.mandatoryGoalList !== undefined) {
             this.mandatoryGoalList.forEach(function (element) {
                 if (goalData.hasOwnProperty("Goal__c") && element === goalData.Goal__c) {
                     isGoalAMandatoryGoal = true;
                 }
             });
         }
 
 
         this.isGoalAMandatoryGoal = isGoalAMandatoryGoal;
         this.goalSelected = this.goal.Goal__c;
 
         goalNames=[...this.goalNames];
 
         if(goalNames!==undefined && goalNames.length!==0){
             goalNames.forEach(function (element) {
                 goalNameMap[element] = true;
 
             });
         }
             
         
 
         
 
         if (picklistMap !== undefined && picklistMap !== null && picklistMap.hasOwnProperty('Goal__c')) {
 
 
             picklistMap.Goal__c.forEach(function (element) {
 
                 goalPicklistValue.push(element);
                 goalPicklist.push({ label: element, value: element });
 
             });
 
            
 
         }
 
         
 
 
         this.goalPicklist = goalPicklist;
 
 
 
 
         if (goalData.hasOwnProperty("Goal__c") && picklistMap.hasOwnProperty(goalData.Goal__c)) {
             picklistMap[goalData.Goal__c].forEach(function (element) {
 
                 strategyPicklist.push({ label: element, value: element });
 
             });
         }
         this.strategyPicklist = strategyPicklist;
 
         if (goalData.hasOwnProperty('Strategies__r')) {
 
             goalData.Strategies__r.forEach(function (element) {
 
                 strategyList.push(element);
 
             });
         }
 
 
 
         if (goalData.hasOwnProperty("Goal__c") && !this.isBlank(goalData.Goal__c)) {
             isGoalValueEmpty = false;
             this.goalSectionName = goalData.Goal__c;
             goalNameMap[goalData.Goal__c]=true;
 
             if (goalData.Goal__c === 'Other client specific goals (Free Form/Write In)') {
                 this.enableGoalWriteIn = true;
             }
            
         }
 
 
         if (!isGoalValueEmpty && strategyList !== undefined && strategyList.length === 0) {
             strategyList.push({ 'sobjectType': 'Strategy__c', 'Goal__c': goalData.Id, 'Strategy__c': '', 'Action_Steps_PlannedTaken__c': ''});
         }
 
         this.isGoalValueEmpty = isGoalValueEmpty;
 
         this.strategyList = strategyList;
 
 
 
         //this.goalSectionName='Goal and Strategy Information'+this.index;
 
 
         if (!this.isBlank(goalData.Id)) {
             existingRec = true;
         } else {
             existingRec = false;
         }
         this.existingRec = existingRec;
 
 
 
 
         
 
     }*/

    getUsedPicklistInGoal(values) {
        let picklistMap = {};
        let goalPicklist = [];
        this.usedGoals = values;
        picklistMap = this.picklistFieldMap;
        console.log('GoalUsedPicklistValues in child' + this.usedGoals);
        if (picklistMap !== undefined && picklistMap !== null && picklistMap.hasOwnProperty('Goal__c')) {
            picklistMap.Goal__c.forEach(function (element) {
                if (element !== 'Protect / Renew Current Book of Business (Mandatory Goal)' && element !== 'Attain / Maintain NPS Promoter Rating (Mandatory Goal)') {
                    goalPicklist.push({ label: element, value: element });
                }

            });
        }
        if (this.usedGoals !== null && this.usedGoals !== undefined) {
            this.usedGoals = this.usedGoals.filter(goal => goal !== this.goalSelected);
            this.usedGoals.forEach(picklistOption => {
                goalPicklist = goalPicklist.filter(option => option.value !== picklistOption);
            })
        }
        this.goalPicklist = goalPicklist;
    }

    strategyUsedPicklist(event) {
        var picklistValues = event.detail;
        if (picklistValues !== null && picklistValues !== undefined && picklistValues !== '') {
            //as requested by client to allow duplicate strategies
            // this.strategyUsedPicklistValues = this.strategyUsedPicklistValues.filter(value => value !== picklistValues.oldValue);
            // if (!this.strategyUsedPicklistValues.includes(picklistValues.newValue) && picklistValues.newValue !== '' && picklistValues.newValue !== 'Other (please specify below)') {
            //     this.strategyUsedPicklistValues.push(picklistValues.newValue);
            // }
            // console.log('Used Strategy Picklist Values:' + this.strategyUsedPicklistValues);
            this.editGoalFields();
            //this.template.querySelector('c-strategy-cmp').getUsedPicklistInStrategy(this.strategyUsedPicklistValues);
            //fireEvent(this.pageRef, 'getUsedPicklistInStrategy',this.strategyUsedPicklistValues);
        }

    }

    editCancelPicklistChanges(value){
        if(value){
           this.backupUsedStrategies = this.strategyUsedPicklistValues;
        }else{
           this.strategyUsedPicklistValues = this.backupUsedStrategies;
        }  
        
      }


    connectedCallback() {
        registerListener('strategyUsedPicklist', this.strategyUsedPicklist, this);
        registerListener('getUsedPicklistInGoal', this.getUsedPicklistInGoal, this);
        registerListener('editCancelPicklistChanges', this.editCancelPicklistChanges, this);
        console.log('Inside connectedCallBack GoalCmp');
        let goalRec = {};
        let isGoalAMandatoryGoal = false;
        let strategyList = [];
        let isGoalValueEmpty = true;
        let strategyPicklist = [];
        let picklistMap = {};
        let goalPicklist = [];
        let existingRec;


        goalRec = Object.assign({}, this.goal);
        this.goalRec = goalRec;

        picklistMap = this.picklistFieldMap;

        if (this.mandatoryGoalList !== undefined) {
            this.mandatoryGoalList.forEach(function (element) {
                if (goalRec.hasOwnProperty("Goal__c") && element === goalRec.Goal__c) {
                    isGoalAMandatoryGoal = true;
                }
            });
        }


        this.isGoalAMandatoryGoal = isGoalAMandatoryGoal;



        if (goalRec.hasOwnProperty('Strategies__r')) {

            goalRec.Strategies__r.forEach(function (element) {

                strategyList.push(element);

            });
        }



        if (goalRec.hasOwnProperty("Goal__c") && !this.isBlank(goalRec.Goal__c)) {
            isGoalValueEmpty = false;
            if (goalRec.Goal__c === 'Other client specific goals (Free Form/Write In)') {
                if (goalRec.Goal_Write_In__c !== undefined) {
                    this.goalSectionName = goalRec.Goal_Write_In__c.substring(0,100);
                } else {
                    this.goalSectionName = goalRec.Goal__c;
                }
            } else if (goalRec.Goal__c !== 'Other client specific goals (Free Form/Write In)') {
                this.goalSectionName = goalRec.Goal__c;
            }


            if (goalRec.Goal__c === 'Other client specific goals (Free Form/Write In)') {
                this.enableGoalWriteIn = true;
            }

        }


        if (!isGoalValueEmpty && strategyList !== undefined && strategyList.length === 0 && goalRec.Goal__c !== 'New Goal and Strategy Information') {
            strategyList.push({ 'sobjectType': 'Strategy__c', 'Goal__c': goalRec.Id, 'Strategy__c': '', 'Action_Steps_PlannedTaken__c': '', 'Applicable_for__c': '' });
        }
		
		if(goalRec.Goal__c === 'New Goal and Strategy Information') {
			isGoalValueEmpty = true;
		}

        console.log('goalRec---',goalRec);

        if (goalRec.hasOwnProperty("Goal__c") && picklistMap.hasOwnProperty(goalRec.Goal__c)) {
            strategyPicklist.push({ label: '', value: '' });
            picklistMap[goalRec.Goal__c].forEach(function (element) {
                console.log('element---',element);
                strategyPicklist.push({ label: element, value: element });

            });
        }

        strategyPicklist.forEach(picklistOption => {
            this.completeStrategyPicklist.push(picklistOption.value);
        })
        //this.template.querySelector('c-strategy-cmp').getcompletePicklistInStrategy(this.completeStrategyPicklist);
        if (this.strategyUsedPicklistValues !== null && this.strategyUsedPicklistValues !== undefined) {
            this.strategyUsedPicklistValues.forEach(picklistOption => {
                strategyPicklist = strategyPicklist.filter(option => option.value !== picklistOption);
            })
        }


        if (picklistMap !== undefined && picklistMap !== null && picklistMap.hasOwnProperty('Goal__c')) {
            picklistMap.Goal__c.forEach(function (element) {
                if (element !== 'Protect / Renew Current Book of Business (Mandatory Goal)' && element !== 'Attain / Maintain NPS Promoter Rating (Mandatory Goal)') {
                    goalPicklist.push({ label: element, value: element });
                }

            });
        }


        if (this.usedGoals !== null && this.usedGoals !== undefined) {
            this.usedGoals = this.usedGoals.filter(goal => goal !== this.goalSelected);
            this.usedGoals.forEach(picklistOption => {
                // console.log('Used in goal:'+picklistOption);
                //console.log('Goal PickList:'+goalPicklist);
                //console.log('Goal PickList:'+goalPicklist.value);
                goalPicklist = goalPicklist.filter(option => option.value !== picklistOption);
            })
        }

        if (!this.isBlank(goalRec.Id)) {
            existingRec = true;
        } else {
            existingRec = false;
        }
        this.existingRec = existingRec;


        this.goalPicklist = goalPicklist;

        this.strategyPicklist = strategyPicklist;

        this.isGoalValueEmpty = isGoalValueEmpty;

        this.strategyList = strategyList;

        this.onLoad = false;

        let goalPicklistValues = { oldValue: '', newValue: goalRec.Goal__c };
        fireEvent(this.pageRef, 'goalUsedPicklist', goalPicklistValues);

        
    }

    @api
    editGoalFields() {
        let picklistMap = {};
        let strategyPicklist = [];
        let goalRec = {};
        let existingRec;
        let goalPicklist = [];
        let strategyCmpArray = [];

        goalRec = Object.assign({}, this.goalRec);

        
        picklistMap = this.picklistFieldMap;

        if (picklistMap !== undefined && picklistMap !== null && picklistMap.hasOwnProperty('Goal__c')) {
            picklistMap.Goal__c.forEach(function (element) {
                if (element !== 'Protect / Renew Current Book of Business (Mandatory Goal)' && element !== 'Attain / Maintain NPS Promoter Rating (Mandatory Goal)') {
                    goalPicklist.push({ label: element, value: element });
                }

            });
        }

        if (this.usedGoals !== null && this.usedGoals !== undefined) {
            this.usedGoals = this.usedGoals.filter(goal => goal !== this.goalSelected);
            this.usedGoals.forEach(picklistOption => {
                goalPicklist = goalPicklist.filter(option => option.value !== picklistOption);
            })
        }


        this.goalPicklist = goalPicklist;


        if (goalRec.hasOwnProperty("Goal__c") && picklistMap.hasOwnProperty(goalRec.Goal__c)) {
            strategyPicklist.push({ label: '', value: '' });
            picklistMap[goalRec.Goal__c].forEach(function (element) {

                strategyPicklist.push({ label: element, value: element });

            });
        }

        strategyPicklist.forEach(picklistOption => {
            this.completeStrategyPicklist.push(picklistOption.value);
        })

        if (this.strategyUsedPicklistValues !== null && this.strategyUsedPicklistValues !== undefined) {
            this.strategyUsedPicklistValues.forEach(picklistOption => {
                strategyPicklist = strategyPicklist.filter(option => option.value !== picklistOption);
            })
        }

        this.strategyPicklist = strategyPicklist;

        if(goalRec.Goal__c === '' || goalRec.Goal__c === 'New Goal and Strategy Information'){
            this.template.querySelector('.goal3').style = 'box-shadow: 0 0 15px yellow';
        }

        this.goalSelected = goalRec.Goal__c;

        if (!this.isBlank(goalRec.Id)) {
            existingRec = true;
        } else {
            existingRec = false;
        }
        this.existingRec = existingRec;

        if (!this.isGoalValueEmpty) {
            strategyCmpArray = this.template.querySelectorAll('c-strategy-cmp');

            /*if(Array.isArray(strategyCmpArray)) {
                for(let i=0;i<strategyCmpArray.length;i++) {
                    strategyCmpArray[i].editStrategyFields();
                } 
            } else {
                strategyCmpArray.editStrategyFields();
            } */
            //this.template.querySelectorAll('c-strategy-cmp').editStrategyFields();
            for (let i = 0; i < strategyCmpArray.length; i++) {
                strategyCmpArray[i].editStrategyFields();
                strategyCmpArray[i].getcompletePicklistInStrategy(this.completeStrategyPicklist);
            }
        }

        //this.template.querySelector('[data-id="goalPickList"]').focus();

        let goalPicklistValues = { oldValue: '', newValue: this.goalSelected };
        fireEvent(this.pageRef, 'goalUsedPicklist', goalPicklistValues);



    }

    goalChangeHandler(event) {
        var goalVal = event.target.value;
        var strategyPicklist = [];
        var picklistMap = {};
        let isGoalValueEmpty = true;
        let strategyList = [];
        let strategyListToDelete = [];
        let eventData;
        let goalData = {};

        if(this.goalSelected === 'New Goal and Strategy Information'){
            this.goalSelected = '';
        }

        /* Removing highlight if a valid Goal is selected - START */
        if(goalVal !== '' && goalVal !== 'New Goal and Strategy Information'){
            this.template.querySelector('.goal3').style = '';
        }else if(goalVal === '' || goalVal === 'New Goal and Strategy Information'){
            this.template.querySelector('.goal3').style = 'box-shadow: 0 0 15px yellow';
        }
        /* Removing highlight if a valid Goal is selected - END */

        if(goalVal !== this.goalSelected){
            this.strategyUsedPicklistValues = [];
            this.completeStrategyPicklist = [];
            let strategyCmps = this.template.querySelectorAll('c-strategy-cmp');
            for (let i = 0; i < strategyCmps.length; i++) {
                strategyCmps[i].onGoalChange();
            }
        }

        let strategyCmpArray = [];

        let goalPicklistValues = { oldValue: this.goalSelected, newValue: goalVal, isGoalChange: true };
        this.goalSelected = goalVal;



        if (goalVal === 'Other client specific goals (Free Form/Write In)') {
            this.enableGoalWriteIn = true;
        }
        else {
            this.enableGoalWriteIn = false;
        }


        if (!this.isBlank(goalVal)) {
            isGoalValueEmpty = false;
            picklistMap = this.picklistFieldMap;
            if (picklistMap !== undefined && picklistMap !== null && picklistMap.hasOwnProperty(goalVal)) {
                strategyPicklist.push({ label: '', value: '' })
                picklistMap[goalVal].forEach(function (element) {

                    strategyPicklist.push({ label: element, value: element });

                });
            }

            strategyPicklist.forEach(picklistOption=>{
                this.completeStrategyPicklist.push(picklistOption.value);
            })
            strategyCmpArray = this.template.querySelectorAll('c-strategy-cmp');

            for (let i = 0; i < strategyCmpArray.length; i++) {
                strategyCmpArray[i].getcompletePicklistInStrategy(this.completeStrategyPicklist);
                strategyCmpArray[i].editStrategyFields();
            }

            if (this.strategyUsedPicklistValues !== null && this.strategyUsedPicklistValues !== undefined) {
                this.strategyUsedPicklistValues.forEach(picklistOption => {
                    strategyPicklist = strategyPicklist.filter(option => option.value !== picklistOption);
                })
            }

            /*if(this.strategyList!==undefined && this.strategyList!==null && this.strategyList.length!==0){
                this.strategyList.forEach(function (element) {

                    if(strategyList.length===0){
                        for (const [key, value] of Object.entries(element)) {
                            console.log('Key==>'+key+' value==>'+value);
                           if(key!=='Id' && key!=='Name' && key!=='Goal__c'){
                            element[key]='';
                            strategyList.push(element);
                           }
                        }
                    }else{
                        strategyListToDelete.push(element);
                    }
                    
                    
        
                });
            }else{
                strategyList.push({ 'Goal__c': this.goalRec.Id, 'Strategy__c': '', 'Action_Steps_PlannedTaken__c': '', 'Id': '' });
            }*/
            strategyList.push({ 'sobjectType': 'Strategy__c', 'Goal__c': this.goalRec.Id, 'Strategy__c': '', 'Action_Steps_PlannedTaken__c': '','Applicable_for__c': '' });
            this.goalSectionName = goalVal;
        }
        else {
            isGoalValueEmpty = true;
            this.goalSectionName = 'New Goal and Strategy Information';

        }
        if (this.strategyList !== undefined && this.strategyList !== null && this.strategyList.length !== 0) {
            strategyListToDelete = [...this.strategyList];
            console.log(strategyListToDelete);

        }

        this.strategyList = [...strategyList];
        this.strategyPicklist = strategyPicklist;

        goalData = Object.assign({}, this.goalRec);
        goalData.Goal__c = goalVal;
        goalData.Goal_Write_In__c = '';
        this.goalRec = goalData;
        this.renderedCallback();
        //this.goalRec=Object.assign({}, goalData);
        //this.goalRec = JSON.stringify(goalData);
        this.isGoalValueEmpty = isGoalValueEmpty;


        if (this.existingRec) {
           // eventData = { 'operation': 'Edit', 'objectEdited': 'Goal', 'record': this.goalRec, 'goalIndex': this.index};
           eventData = { 'operation': 'Edit', 'objectEdited': 'Goal', 'record': this.createGoalStrategyJSON(this.goalRec, this.strategyList), 'goalIndex': this.index,'goalWriteInChange':false};
        } else {
            eventData = { 'operation': 'Create', 'objectEdited': 'Goal', 'record': this.createGoalStrategyJSON(this.goalRec, this.strategyList) 
                            , 'goalIndex': this.index,'goalWriteInChange':false};
        }



        const evnt = new CustomEvent('createoreditgoal', {
            // detail contains only primitives
            detail: eventData
        });
        // Fire the event 
        this.dispatchEvent(evnt);
        fireEvent(this.pageRef, 'goalUsedPicklist', goalPicklistValues);
    }


    goalWriteInChangeHandler(event) {
        var goalWriteInVal = event.target.value;
        let eventData;
        let goalData = {};



        goalData = Object.assign({}, this.goalRec);
        goalData.Goal_Write_In__c = goalWriteInVal;
        this.goalRec = goalData;
        //this.goalRec=Object.assign({}, goalData);

        /* Removing highlight if a valid Goal is selected - START */
        if(goalWriteInVal !== ''){
            this.template.querySelector('.GoalWriteIn').style = '';
        }
        /* Removing highlight if a valid Goal is selected - END */

        if(this.goalRec.Goal__c === 'Other client specific goals (Free Form/Write In)' && this.goalRec.Goal_Write_In__c !== undefined) {
            this.goalSectionName = this.goalRec.Goal_Write_In__c.substring(0,100);
        } else if(this.goalRec.Goal__c === 'Other client specific goals (Free Form/Write In)' && this.goalRec.Goal_Write_In__c === undefined) {
            this.goalSectionName = this.goalRec.Goal__c;
        } 
         if(this.goalRec.Goal__c === 'Other client specific goals (Free Form/Write In)' && goalWriteInVal === '') {
            this.goalSectionName = this.goalRec.Goal__c;
            if (this.template.querySelector('.GoalWriteIn') !== null) {
                if (this.goalRec.hasOwnProperty('Goal_Write_In__c') && (this.goalRec.Goal_Write_In__c === '' || this.goalRec.Goal_Write_In__c === undefined)) {
                    this.template.querySelector('.GoalWriteIn').style = 'box-shadow: 0 0 15px yellow';
                    
                }
            }
         }
         let strategyList=[...this.strategyList];

        if (this.existingRec) {
            //eventData = { 'operation': 'Edit', 'objectEdited': 'Goal', 'record': this.goalRec, 'goalIndex': this.index };
            eventData = { 'operation': 'Edit', 'objectEdited': 'Goal', 'record': this.createGoalStrategyJSON(this.goalRec, strategyList), 'goalIndex': this.index ,'goalWriteInChange':true};
   
        } else {
            eventData = { 'operation': 'Create', 'objectEdited': 'Goal', 'record': this.createGoalStrategyJSON(this.goalRec, strategyList) 
            , 'goalIndex': this.index,'goalWriteInChange':true};
        }



        const evnt = new CustomEvent('createoreditgoal', {
            // detail contains only primitives
            detail: eventData
        });
        // Fire the event 
        this.dispatchEvent(evnt);
    }


    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }

    addStrategy() {
        //var strategyPicklist = [];
        //var picklistMap = {};
        //let isGoalValueEmpty = true;
        let strategyList = [];
        //let strategyListToDelete=[];




        strategyList = [...this.strategyList]
        strategyList.push({ 'sobjectType': 'Strategy__c', 'Goal__c': this.goalRec.Id, 'Strategy__c': '', 'Action_Steps_PlannedTaken__c': '', 'Applicable_for__c': '' });

        if (!this.isEdit) {
            const evnt = new CustomEvent('addstrategy',{detail:{'goalIndex': this.index,'record':this.strategyList}});
            // Fire the event 
            this.dispatchEvent(evnt);
        }

        this.strategyList = strategyList;

    }

    strategyEditHandler(event) {
        let sendEventData;
        let evntData = event.detail;
        let strategyList;
        console.log('index==>' + evntData.index);
        console.log('strategyList==>' + JSON.stringify(evntData.record));
        if (evntData.operation === 'Delete') {


            sendEventData = {
                'operation': 'Delete', 'objectEdited': 'Strategy', 'record': evntData.record
                , 'strategyIndex': evntData.index, 'goalIndex': this.index, 'disableAlertMessage' : evntData.disableAlertMessage 
            };
        }
        else {
            strategyList = [...this.strategyList];
            strategyList[evntData.index] = evntData.record;
            this.strategyList = strategyList;

            if (this.existingRec) {
                sendEventData = { 'operation': 'Edit', 'objectEdited': 'Strategy', 'record': this.strategyList
                , 'strategyIndex': evntData.index, 'goalIndex': this.index,  'disableAlertMessage' : evntData.disableAlertMessage};
            } else {
                sendEventData = { 'operation': 'Create', 'objectEdited': 'Strategy', 'record': this.createGoalStrategyJSON(this.goalRec, this.strategyList) 
                , 'strategyIndex': evntData.index, 'goalIndex': this.index,  'disableAlertMessage' : evntData.disableAlertMessage};
            }
        }



        const evnt = new CustomEvent('createoreditgoal', {
            // detail contains only primitives
            detail: sendEventData
        });
        // Fire the event 
        this.dispatchEvent(evnt);
    }

    createGoalStrategyJSON(goalRec, strategyList) {
        goalRec.Strategies__r = strategyList;
        return goalRec;
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

    deleteRecord() {
        let strategyList = [];
        let deleteData;
        var deleteDataLength;
        /* delete strategy goes here */
        /*var deleteId = [];
        var selectedItem = event.currentTarget;
        var recordId = selectedItem.dataset.recordid;
        console.log('Record Id '+recordId);
        this.openmodel = true;
        deleteId.add(recordId);
        this.deleteStrategyIds = deleteId; */
        deleteData = [...this.deleteStrategyData];
        deleteDataLength = deleteData.length - 1;
        strategyList = [...this.strategyList];
        console.log('deleteData ' + JSON.stringify(deleteData));

        if (this.goalRec.hasOwnProperty('Strategies__r')) {
            /*  strategyList.forEach(function (element) {
                  if(deleteData !== null && deleteData[0].hasOwnProperty('Id')
                          && deleteData !== undefined && element.Id === deleteData[deleteDataLength].Id){
                      strategyList.pop(element); 
                      console.log('Inside condition '+element.Name+' ===== '+deleteData[deleteDataLength].Name); 
                  }
              }); */
            this.strategyList = strategyList.filter(element => element.hasOwnProperty('Id') && element.Id !== deleteData[deleteDataLength].Id)
        }
        //this.strategyList = strategyList;
        console.log(' delete Record method this.strategyList \n ' + this.strategyList);
        this.openmodel = false;
        this.dispatchEvent(new CustomEvent('deleteids', { detail: { 'deleteStrategyData': this.deleteStrategyData, 'deleteGoalData': this.deleteGoalData } }));

    }

    closeModal() {
        this.openmodel = false;

    }

    deleteid(event) {
        var tempRecords = [];
        //var listOfIdstoBeDeleted = [];
        //var goalId;
        if (event.currentTarget.dataset.name === 'Goal') {
            //this.deleteGoalData.sobjectType = 'Goal__c';
            //goalId  = event.currentTarget.dataset.recordid;
            console.log('Goal Delete method called ' + this.goal);
            tempRecords.push(...this.deleteGoalData, this.goal);
            this.deleteGoalData = tempRecords;
            this.openmodel = true;
        } else {

            console.log('Strategy Delete method called ' + event.detail);
            this.openmodel = true;
            //listOfIdstoBeDeleted.push(event.detail);
            //this.deleteStrategyData.sobjectType = 'Strategy__c';
            tempRecords.push(...this.deleteStrategyData, event.detail);
            this.deleteStrategyData = tempRecords;
            console.log('listOfIdstoBeDeleted ' + JSON.stringify(this.deleteStrategyData));
        }

    }

    /*strategyLoadHandler(event) {
        console.log(event);

        this.count++;

        if (this.strategyList.length === this.count) {
            const evnt = new CustomEvent('childload');
            // Fire the event 
            this.dispatchEvent(evnt);
        }

    }*/

    deleteGoalRec() {
        let sendEventData;
        sendEventData = {
            'operation': 'Delete', 'objectEdited': 'Goal', 'record': this.goalRec
            , 'goalIndex': this.index
        };
        const evnt = new CustomEvent('createoreditgoal', {
            // detail contains only primitives
            detail: sendEventData
        });
        // Fire the event 
        this.dispatchEvent(evnt);

        let goalPicklistValues = { oldValue: this.goalRec.Goal__c, newValue: '' };
        fireEvent(this.pageRef, 'goalUsedPicklist', goalPicklistValues);
    }

    @api
    removeStrategyFromList(strategyIndex) {
        console.log('Inside removeStrategyFromList ' + strategyIndex);
        let strategyList = [];
        //let strategyCmpArray=[];
        strategyList = [...this.strategyList];
        for (let i in strategyList) { if (i !== undefined) { console.log(strategyList[i].Strategy__c); } }
        strategyList.splice(strategyIndex, 1);
        
        console.log('After==>'+JSON.stringify(strategyList));
        this.strategyList=[];
        this.strategyList = [...strategyList];

        /*if(strategyList.length!==0){
            strategyCmpArray = this.template.querySelectorAll('c-strategy-cmp');
            for (let i = 0; i < strategyCmpArray.length; i++) {
                strategyCmpArray[i].editStrategyFields();
            }
        }*/
    }

    @api
    checkBlankFields() {
        let strategyCmpArray = [];
        var goalRec = this.goalRec;
        console.log('Inside goal Component to check blank Goals and strategy \n Goal Record '+goalRec);
        if(goalRec.Goal__c === '' || goalRec.Goal__c === 'New Goal and Strategy Information') {
            this.template.querySelector('.goal3').style = 'box-shadow: 0 0 15px yellow';
        } else if(goalRec.Goal__c === 'Other client specific goals (Free Form/Write In)' && goalRec.Goal_Write_In__c === '') {
            this.template.querySelector('.GoalWriteIn').style = 'box-shadow: 0 0 15px yellow';
        }

        strategyCmpArray = this.template.querySelectorAll('c-strategy-cmp');

        if (goalRec.Strategies__r !== undefined) {
            for (let i = 0; i < goalRec.Strategies__r.length; i++) {
                if (goalRec.Strategies__r[i].Strategy__c !== '' && goalRec.Strategies__r[i].Strategy__c !== undefined) {
                    strategyCmpArray[i].checkBlankStrategyRecords();
                } else if(goalRec.Goal__c === 'Other client specific goals (Free Form/Write In)' && (!goalRec.hasOwnProperty('Goal_Write_In__c') || goalRec.Goal_Write_In__c === '')) {
                    this.renderedCallback();
                }
            }
        }        
    }

    renderedCallback() {
        if (this.enableGoalWriteIn) {
            if (this.template.querySelector('.GoalWriteIn') !== null) {
                if (!this.goalRec.hasOwnProperty('Goal_Write_In__c') && (this.goalRec.Goal_Write_In__c === '' || this.goalRec.Goal_Write_In__c === undefined)) {
                    this.template.querySelector('.GoalWriteIn').style = 'box-shadow: 0 0 15px yellow';
                } else if (this.goalRec.hasOwnProperty('Goal_Write_In__c') && (this.goalRec.Goal_Write_In__c === '' || this.goalRec.Goal_Write_In__c === undefined)) {
                    this.template.querySelector('.GoalWriteIn').style = 'box-shadow: 0 0 15px yellow';
                }

            }
        }
    }

}