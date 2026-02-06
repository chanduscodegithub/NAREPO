import { LightningElement, api, track } from 'lwc';

export default class MultiPickListGenericComponent extends LightningElement {

    @api receivedPickListValues;
    @api selectedValues;
    @api fieldApiName;
    @track pickListValues = [];
    @track fieldName;

    selectedPickListValues = [];

    connectedCallback() {
        var i;
        let pickListValues = [];
        if (this.receivedPickListValues !== undefined) {
            for (i = 0; i < this.receivedPickListValues.length; i++) {
                if (this.receivedPickListValues[i].hasOwnProperty('value')) {
                    pickListValues.push(this.receivedPickListValues[i].value);
                    this.pickListValues = [...pickListValues];
                }
            }
        }
    }

    renderedCallback() {
        var i;
        if (this.receivedPickListValues !== undefined) {
            for (i = 0; i < this.receivedPickListValues.length; i++) {
               /* if (this.receivedPickListValues[i].hasOwnProperty('isSelected')) {
                    if (this.receivedPickListValues[i].isSelected) {
                        if (this.template.querySelectorAll('.highlightRow')[i].style !== undefined) {
                            this.template.querySelectorAll('.highlightRow')[i].style = 'background-color: rgba(9, 106, 189, 0.85); color : white;cursor: pointer;';
                            this.selectedPickListValues.push(this.receivedPickListValues[i].value);
                        }
                    } else {
                        if (this.template.querySelectorAll('.highlightRow')[i].style !== undefined) {
                            this.template.querySelectorAll('.highlightRow')[i].style = 'background-color: white; cursor: pointer;';
                            this.template.querySelectorAll('.addOrRemoveCheck')[i].style = 'opacity :0;';
                        }
                    }
                } */

                if(this.selectedValues !== undefined && this.selectedValues.includes(this.receivedPickListValues[i].value)) {
                    if (this.template.querySelectorAll('.highlightRow')[i].style !== undefined) {
                        this.template.querySelectorAll('.highlightRow')[i].style = 'background-color: rgba(9, 106, 189, 0.85); color : white;cursor: pointer;';
                        this.selectedPickListValues.push(this.receivedPickListValues[i].value);
                    }
                } else {
                    if (this.template.querySelectorAll('.highlightRow')[i].style !== undefined) {
                        this.template.querySelectorAll('.highlightRow')[i].style = 'background-color: white; cursor: pointer;';
                        this.template.querySelectorAll('.addOrRemoveCheck')[i].style = 'opacity :0;';
                    }
                }
            }
        }
    }

    handleSelection(event) {
        var item = event.currentTarget;
        var valueChoosen;
        var options;
        var i, j, k;
        let pickListValues = [];
        let selectedPickListValues1 = [];
        // eslint-disable-next-line no-unused-vars
        let found = false;
        if (item && item.dataset) {
            valueChoosen = item.dataset.value;
            pickListValues = this.selectedPickListValues;
            options = pickListValues;

            for (i = 0; i < options.length; i++) {
                if (options[i] === valueChoosen) {
                    found = true;
                    for (k = 0; k < this.receivedPickListValues.length; k++) {
                        if (this.receivedPickListValues[k].hasOwnProperty('value')) {
                            if (this.receivedPickListValues[k].value.indexOf(valueChoosen) > -1 && this.receivedPickListValues[k].value ===valueChoosen) {
                                this.template.querySelectorAll('.highlightRow')[k].style = 'background-color: white; cursor: pointer;';
                                this.template.querySelectorAll('.addOrRemoveCheck')[k].style = 'opacity :0;';
                            }
                        }
                    }
                    delete pickListValues[i];
                }
            }

            if (!found) {
                pickListValues.push(valueChoosen);
                for (i = 0; i < this.receivedPickListValues.length; i++) {
                    if (this.receivedPickListValues[i].hasOwnProperty('value')) {
                        if (this.receivedPickListValues[i].value.indexOf(valueChoosen) > -1 && this.receivedPickListValues[i].value ===valueChoosen) {
                            this.template.querySelectorAll('.highlightRow')[i].style = 'background-color: rgba(9, 106, 189, 0.85); color : white; cursor: pointer;';
                            this.template.querySelectorAll('.addOrRemoveCheck')[i].style = 'opacity :1;';
                        }
                    }
                }
            }
        }
        for (j = 0; j < pickListValues.length; j++) {
            if (pickListValues[j] !== undefined) {
                selectedPickListValues1.push(pickListValues[j]);
            }
        }
        this.selectedPickListValues = selectedPickListValues1;

        /* Loop the Selected values and contact*/
        
        const picklistEvent = new CustomEvent("multipicklistgenericevent", {
            detail: {fieldName: this.fieldApiName, value : this.selectedPickListValues}

        });

        this.dispatchEvent(picklistEvent);
    }

}