/* eslint-disable no-console */
import { LightningElement, api, track } from 'lwc';
//import { registerListener } from 'c/pubsub';

export default class Competitivelandscapelwc extends LightningElement {
    @api typeOfOtherProductsOrServicesProvidedArrayPickListValues;
    @api otherProductsDataCompetitorAccount;
    @api fromAMTSection;
    @track cssWidth = 'width:auto';
    @track pickListValues = [];
    @track valueDisabled = 'highlightRow';

    selectedPickListValues = [];

    @api
    get isDisabled() {
        return this.valueDisabled;
    }

    set isDisabled(value) {
        //this.valueDisabled = value;
        if (value) {
            this.valueDisabled = 'isDisabled highlightRow';
        }
        else {
            this.valueDisabled = 'highlightRow';
        }
    }

    connectedCallback() {
        var i;
        let pickListValues = [];
        this.selectedPickListValues = [];
        console.log('lwc---', JSON.stringify(this.typeOfOtherProductsOrServicesProvidedArrayPickListValues));
        console.log('lwc------' + JSON.stringify(this.otherProductsDataCompetitorAccount));
        for (i = 0; i < this.typeOfOtherProductsOrServicesProvidedArrayPickListValues.length; i++) {
            if (this.typeOfOtherProductsOrServicesProvidedArrayPickListValues[i].hasOwnProperty('text')) {
                pickListValues.push(this.typeOfOtherProductsOrServicesProvidedArrayPickListValues[i].text);
                this.pickListValues = [...pickListValues];
                console.log('this.pickListValues ==' + this.pickListValues);
                console.log('this.pickListValues ==', this.pickListValues);
            }

        }


    }


    renderedCallback() {
        let firstClass = this.template.querySelector(".scrolldiv");
        console.log('firstClass---', firstClass);
        console.log();
        console.log('findhs-----', firstClass.scrollWidth > 148);
        if (this.fromAMTSection) {
            if (firstClass.scrollWidth > 148) {
                this.cssWidth = 'float:left';
            }
        }
        var i;
        if (this.typeOfOtherProductsOrServicesProvidedArrayPickListValues !== undefined) {
            for (i = 0; i < this.typeOfOtherProductsOrServicesProvidedArrayPickListValues.length; i++) {
                console.log('inside for loop--', this.typeOfOtherProductsOrServicesProvidedArrayPickListValues[i].value);
                console.log('inside for loop style--', this.template.querySelectorAll('highlightRow')[i]);
                if (!this.typeOfOtherProductsOrServicesProvidedArrayPickListValues[i].hasOwnProperty('selected')) {
                    if (this.template.querySelectorAll('.highlightRow')[i].style !== undefined) {
                        this.template.querySelectorAll('.highlightRow')[i].style = 'background-color: white; cursor: pointer;';
                        this.template.querySelectorAll('.addOrRemoveCheck')[i].style = 'opacity :0;';
                    }
                } else if (this.typeOfOtherProductsOrServicesProvidedArrayPickListValues[i].hasOwnProperty('selected')) {
                    console.log('inside selected condition');
                    if (this.template.querySelectorAll('.highlightRow')[i].style !== undefined) {
                        console.log('inside css applicable condition');
                        this.template.querySelectorAll('.highlightRow')[i].style = 'background-color: #0089ff; color : white;cursor: pointer;';
                        console.log('this.sec.first=', this.selectedPickListValues)
                        this.selectedPickListValues.push({ Id: this.otherProductsDataCompetitorAccount.Id, otherProductRecord: this.typeOfOtherProductsOrServicesProvidedArrayPickListValues[i].value });
                        console.log('this.sec=', this.selectedPickListValues);
                    }
                }
            }
        }
    }

    handleSelection(event) {
        var item = event.currentTarget;
        var value;
        var options;
        var i, j, k;
        let pickListValues = [];
        let selectedPickListValues1 = [];
        let selectedPickListValues2 = [];
        // eslint-disable-next-line no-unused-vars
        let found = false;
        if (item && item.dataset) {
            value = item.dataset.value;
            pickListValues = this.selectedPickListValues;
            options = pickListValues;
            console.log('initial pickListValues=', pickListValues);
            for (i = 0; i < options.length; i++) {
                console.log('value---1=', value);
                if (options[i].otherProductRecord === value) {
                    console.log('inside value already present');
                    found = true;
                    for (k = 0; k < this.typeOfOtherProductsOrServicesProvidedArrayPickListValues.length; k++) {
                        if (this.typeOfOtherProductsOrServicesProvidedArrayPickListValues[k].hasOwnProperty('text')) {
                            if (this.typeOfOtherProductsOrServicesProvidedArrayPickListValues[k].value === value) {
                                this.template.querySelectorAll('.highlightRow')[k].style = 'background-color: white; cursor: pointer;';
                                this.template.querySelectorAll('.addOrRemoveCheck')[k].style = 'opacity :0;';
                            }
                        }
                    }
                    delete pickListValues[i];
                }
            }
            console.log('value---2=', value);
            console.log('pickListValues before found', pickListValues);
            if (!found) {
                console.log(pickListValues);
                pickListValues.push({ Id: this.otherProductsDataCompetitorAccount.Id, otherProductRecord: value });
                for (i = 0; i < this.typeOfOtherProductsOrServicesProvidedArrayPickListValues.length; i++) {
                    if (this.typeOfOtherProductsOrServicesProvidedArrayPickListValues[i].hasOwnProperty('text')) {
                        if (this.typeOfOtherProductsOrServicesProvidedArrayPickListValues[i].value === value) {
                            this.template.querySelectorAll('.highlightRow')[i].style = 'background-color: #0089ff; color : white; cursor: pointer;';
                            this.template.querySelectorAll('.addOrRemoveCheck')[i].style = 'opacity :1;';
                        }
                    }
                }
            }
            console.log('pickListValues after found', pickListValues);
        }
        for (j = 0; j < pickListValues.length; j++) {
            if (pickListValues[j] !== undefined) {
                if (pickListValues[j].hasOwnProperty('otherProductRecord')) {

                    // if(!selectedPickListValues1.includes(pickListValues[j])){
                    selectedPickListValues1.push(pickListValues[j]);
                    // }


                    console.log('selectedPickListValues1---', selectedPickListValues1);
                }
            }
        }

        this.selectedPickListValues = selectedPickListValues1;
        console.log('selectedPickListValues1--', selectedPickListValues1);
        const picklistEvent = new CustomEvent("eventCall", {
            detail: selectedPickListValues1
        });

        //added to call this comp in competitive landscape other section lwc.
        const picklistEventOtherSection = new CustomEvent("eventcall", {
            detail: {
                value: selectedPickListValues1,
                record: this.otherProductsDataCompetitorAccount
            }
        });

        // Dispatches the event.
        this.dispatchEvent(picklistEvent);
        //Varun
        this.dispatchEvent(picklistEventOtherSection);
    }
}