/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';

export default class StrategyCmp extends LightningElement {
    // @api strategy;
    //@api strategyPicklist;
    @track strategySelected;
    @api isEdit;
    @track strategyRec;
    @api strategyListIndex;
    @track enableStrategyWriteIn;
    @track strategyPicklistValue = [];
    @track enableOtherSpecifyStrategyWriteIn = false;
    @track onLoad = true;

    @track completeStrategyPicklist=[];

    @api hasEditAccess;
    @track enableOtherPleaseSpecify = false;

    get applicableOptions() {
        return [
            { label: 'Traditional Only', value: 'Traditional Only' },
            { label: 'Surest Only', value: 'Surest Only' },
            { label: 'Traditional & Surest', value: 'Traditional & Surest' },
        ];
    }

    @api
    get strategy() {
        return this.strategyRec;
    }
    set strategy(value) {
        //this.strategyRec = value;
        this.setStrategyValue(value);
    }

    @api
    get strategyPicklist() {
        return this.strategyPicklistValue;
    }
    set strategyPicklist(value) {
        this.strategyPicklistValue = value;
        console.log('Inside StrategyCmp==>' + this.isEditClicked);


        let enableStrategyWriteIn = true;
        let strategyPicklistValue = [];
        let strategyRec = Object.assign({}, this.strategyRec);
        if (value !== undefined && value !== null && value.length !== 0) {
            this.strategyPicklistValue.forEach(function (element) {

                strategyPicklistValue.push(element.value);
            });
            if (strategyRec!==undefined && strategyRec.hasOwnProperty('Strategy__c') && !this.isBlank(strategyRec.Strategy__c)&& this.completeStrategyPicklist!==undefined) {
                if (this.completeStrategyPicklist.indexOf(strategyRec.Strategy__c) !== -1) {
                    enableStrategyWriteIn = false;
                }

            } else {
                enableStrategyWriteIn = false;
            }
        }
		//Issues Fixed by Awais on 10/25/2019 start
        if((!strategyRec.hasOwnProperty('Strategy__c') || this.isBlank(strategyRec.Strategy__c)) && strategyPicklistValue.length === 1){
            enableStrategyWriteIn = true;
        }
        //Issues Fixed by Awais on 10/25/2019 end
        this.enableStrategyWriteIn = enableStrategyWriteIn;
        if(strategyRec.Strategy__c === "Other (please specify below)" && strategyPicklistValue.length === 0){
            this.enableOtherPleaseSpecify = true;
            this.enableOtherSpecifyStrategyWriteIn = false;
        }
        console.log('this.enableStrategyWriteIn==>' + this.enableStrategyWriteIn);

    }

    setStrategyValue(value) {
        this.strategyRec = value;
        let enableOtherSpecifyStrategyWriteIn=false;
        console.log(JSON.stringify(value));
        let strategyRec = Object.assign({}, this.strategyRec);

        if (strategyRec.hasOwnProperty("Strategy__c") && !this.isBlank(strategyRec.Strategy__c)) {


            if (strategyRec.Strategy__c === 'Other (please specify below)') {
                enableOtherSpecifyStrategyWriteIn = true;
            }

        }
        this.enableOtherSpecifyStrategyWriteIn=enableOtherSpecifyStrategyWriteIn;
        if(!this.onLoad){
            this.editStrategyFields();
        }

    }
    /*@api
    get isEdit() {
        return this.strategyRec;
    }
    set isEdit(value) {
        this.strategyRec = value;
    }*/




    /*connectedCallback() {

        var strategyData = {};

        strategyData = Object.assign({}, this.strategy);
        console.log('strategyData==>' + JSON.stringify(strategyData));
        this.strategyRec = strategyData;
        this.strategySelected = this.strategyRec.Strategy__c;

    }*/

    @api
    getcompletePicklistInStrategy(values){
        //console.log('Complete Piclist in Strategy: '+values);
        this.completeStrategyPicklist=values;
        //console.log('COMPLETE Piclist in Strategy: '+this.completeStrategyPicklist);
    }

    connectedCallback() {

        let strategyRec= Object.assign({}, this.strategy);
        
        if (strategyRec.hasOwnProperty("Strategy__c") && !this.isBlank(strategyRec.Strategy__c)) {
            
            
            if (strategyRec.Strategy__c === 'Other (please specify below)') {
                this.enableOtherSpecifyStrategyWriteIn = true;
            }else{
                this.enableOtherSpecifyStrategyWriteIn = false;
            }

        }
        this.onLoad=false;

        let strategyPicklistValues ={oldValue:'',newValue:strategyRec.Strategy__c};
        const picklistEvent = new CustomEvent("strategyusedpicklist", {
            detail: strategyPicklistValues
          });
      
          // Dispatches the event.
          this.dispatchEvent(picklistEvent);

    }


    @api
    editStrategyFields() {
        let enableStrategyWriteIn = true;
        let strategyRec = Object.assign({}, this.strategyRec);
        let strategyPicklistValue = [];
        if (this.strategyPicklistValue !== undefined && this.strategyPicklistValue !== null && this.strategyPicklistValue.length !== 0) {
            this.strategyPicklistValue.forEach(function (element) {

                strategyPicklistValue.push(element.value);
            });
            if (strategyRec.hasOwnProperty('Strategy__c') && !this.isBlank(strategyRec.Strategy__c) && this.completeStrategyPicklist!==undefined) {
                if (this.completeStrategyPicklist.indexOf(strategyRec.Strategy__c) !== -1) {
                    enableStrategyWriteIn = false;
                }

            } else {
                enableStrategyWriteIn = false;
            }

        }
		if((!strategyRec.hasOwnProperty('Strategy__c') || this.isBlank(strategyRec.Strategy__c))  && strategyPicklistValue.length === 1){
            enableStrategyWriteIn = true;
        }
        this.enableStrategyWriteIn = enableStrategyWriteIn;
        this.strategySelected = strategyRec.Strategy__c;



        /* const evnt = new CustomEvent('strategyload');
         // Fire the event 
         this.dispatchEvent(evnt);*/



    }


    otherSpecifyStrategyChangeHandler(event) {
        var otherSpecifyStrategyWriteInVal = event.target.value;
        let strategyRec = {};



        strategyRec = Object.assign({}, this.strategyRec);
        strategyRec.Strategy_Write_In__c = otherSpecifyStrategyWriteInVal;
        this.strategyRec = strategyRec;

        /* Removing highlight for strategy write in when the user enters Strategy - START */
        if(this.strategyRec.Strategy__c === 'Other (please specify below)' && this.strategyRec.Strategy_Write_In__c !== '') {
            this.template.querySelector('.StrategyWriteInName').style = '';
            //this.template.querySelector('.strategyName').style = '';
        }
        /* Removing highlight for strategy write in when the user enters Strategy - END */

        const evnt = new CustomEvent('editstrategy', {

            detail: { 'index': this.strategyListIndex, 'record': strategyRec ,'operation':'Edit'}
        });
        // Fire the event 
        this.dispatchEvent(evnt);

    }


    strategyChangeHandler(event) {
        let strategyVal = event.target.value;
        let strategyRec = {};

        let strategyPicklistValues ={oldValue:this.strategySelected,newValue:strategyVal};

        if (strategyVal === 'Other (please specify below)') {
            this.enableOtherSpecifyStrategyWriteIn = true;
        }
        else {
            this.enableOtherSpecifyStrategyWriteIn = false;
        }

        /* Code for Removing Highlight if strategy has been choosen - START */
        if(this.template.querySelector('.OtherGoalStrategyWriteIn') !== null) {
            if(strategyVal !== '') {
                this.template.querySelector('.OtherGoalStrategyWriteIn').style = '';
            }
        } 
         if(this.template.querySelector('.strategyName') !== null) {
             this.template.querySelector('.strategyName').style = '';
        }
        if(this.template.querySelector('.StrategyWriteInName') !== null) {
            this.template.querySelector('.StrategyWriteInName').style = '';
       }
        /* Code for Removing Highlight if strategy has been choosen - END */

        strategyRec = Object.assign({}, this.strategyRec);
        this.strategySelected = strategyVal;
        strategyRec.Strategy__c = strategyVal;
        strategyRec.Strategy_Write_In__c = '';
        this.strategyRec = strategyRec;
        const evnt = new CustomEvent('editstrategy', {
            // detail contains only primitives
            detail: { 'index': this.strategyListIndex, 'record': strategyRec ,'operation':'Edit'}
        });
        // Fire the event from c-tile
        this.dispatchEvent(evnt);

        const picklistEvent = new CustomEvent("strategyusedpicklist", {
            detail: strategyPicklistValues
          });
      
          // Dispatches the event.
          this.dispatchEvent(picklistEvent);
    }

    actionPlanChangeHandler(event) {

        let strategyRec = {};
        strategyRec = Object.assign({}, this.strategyRec);
        strategyRec.Action_Steps_PlannedTaken__c = event.target.value;
        this.strategyRec = strategyRec;

        const evnt = new CustomEvent('editstrategy', {
            // detail contains only primitives
            detail: { 'index': this.strategyListIndex, 'record': strategyRec ,'operation':'Edit'}
        });
        // Fire the event from c-tile
        this.dispatchEvent(evnt);
    }

    applicableChangeHandler(event){
        let strategyRec = {};
        strategyRec = Object.assign({}, this.strategyRec);
        strategyRec.Applicable_for__c = event.target.value;
        this.strategyRec = strategyRec;

        const evnt = new CustomEvent('editstrategy', {
            // detail contains only primitives
            detail: { 'index': this.strategyListIndex, 'record': strategyRec ,'operation':'Edit'}
        });
        // Fire the event from c-tile
        this.dispatchEvent(evnt);

    }

    deleteStrategy() {
        /* call an event goes here for delete */
        //var selectedItem = event.currentTarget;
        //var recordId = selectedItem.dataset.recordid;
        this.dispatchEvent(new CustomEvent('deleteid', { detail: this.strategyRec }));


    }


    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }

    deleteStrategyRec(){
        const evnt = new CustomEvent('editstrategy', {
            // detail contains only primitives
            detail: { 'index': this.strategyListIndex, 'record': this.strategyRec ,'operation':'Delete'}
        });
        // Fire the event from c-tile
        this.dispatchEvent(evnt);

        let strategyPicklistValues ={oldValue:this.strategyRec.Strategy__c,newValue:''};
        const picklistEvent = new CustomEvent("strategyusedpicklist", {
            detail: strategyPicklistValues
          });
      
          // Dispatches the event.
          this.dispatchEvent(picklistEvent);
    }

    @api
    onGoalChange(){
        this.strategyPicklistValue = [];
        this.enableOtherSpecifyStrategyWriteIn = false;
    }

    @api
    checkBlankStrategyRecords() {
        console.log('Inside checkBlankStrategyRecords '+this.strategyRec);
       /* if(this.strategyRec.Strategy__c === '') {
            if(this.enableStrategyWriteIn) {
                this.template.querySelector('.OtherGoalStrategyWriteIn').style = 'box-shadow: 0 0 15px yellow';
            } else if(!this.enableStrategyWriteIn) {
                this.template.querySelector('.strategyName').style = 'box-shadow: 0 0 15px yellow';
            }
        } else if(this.strategyRec.Strategy__c === 'Other (please specify below)' && this.strategyRec.Strategy_Write_In__c === '') {
            this.template.querySelector('.strategyName').style = 'box-shadow: 0 0 15px yellow';
            this.template.querySelector('.StrategyWriteInName').style = 'box-shadow: 0 0 15px yellow';
        } else if(this.strategyRec.Strategy__c === undefined && this.strategyRec.Action_Steps_PlannedTaken__c !== null) {
            //this.template.querySelector('.strategyName').style = 'box-shadow: 0 0 15px yellow';
            
        } */
        this.renderedCallback();
    }

    renderedCallback() {
        if (this.enableStrategyWriteIn && (this.strategyRec.Strategy__c === '' || this.strategyRec.Strategy__c === undefined) && (this.strategyRec.Action_Steps_PlannedTaken__c !== null || this.strategyRec.Action_Steps_PlannedTaken__c !== undefined)) {
            if (this.template.querySelector('.OtherGoalStrategyWriteIn') !== null) {
                this.template.querySelector('.OtherGoalStrategyWriteIn').style = 'box-shadow: 0 0 15px yellow';
            }
        } else if(this.strategyRec.Strategy__c === undefined && this.strategyRec.Action_Steps_PlannedTaken__c !== null) {
            if(this.template.querySelector('.strategyName') !== null) {
                this.template.querySelector('.strategyName').style = 'box-shadow: 0 0 15px yellow';
            }
        } else if(this.strategyRec.Strategy__c === '' && this.strategyRec.Action_Steps_PlannedTaken__c === '') {
            if(this.template.querySelector('.strategyName') !== null) {
                this.template.querySelector('.strategyName').style = 'box-shadow: 0 0 15px yellow';
            }
        } else if(this.strategyRec.Strategy__c === undefined && this.strategyRec.Action_Steps_PlannedTaken__c === undefined) {
            if(this.template.querySelector('.strategyName') !== null) {
                this.template.querySelector('.strategyName').style = 'box-shadow: 0 0 15px yellow';
            }
        } else if(this.strategyRec.Strategy__c === 'Other (please specify below)' && (this.strategyRec.Strategy_Write_In__c === '' || this.strategyRec.Strategy_Write_In__c === undefined)) {
            if(this.template.querySelector('.strategyName') !== null && this.template.querySelector('.StrategyWriteInName') !== null) {
                //this.template.querySelector('.strategyName').style = 'box-shadow: 0 0 15px yellow';
                this.template.querySelector('.StrategyWriteInName').style = 'box-shadow: 0 0 15px yellow';
            }
        }
    }


}