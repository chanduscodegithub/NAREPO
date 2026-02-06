import { LightningElement, api, track, wire } from 'lwc';

//const COLOR_GRADIENT_ARRAY = ['#fe0410', '#fe3f00', '#fa5f00', '#f27900', '#e79000', '#d8a600', '#c6ba00', '#afcd00', '#93de00', '#6bef00', '#01ff13'];
const COLOR_GRADIENT_ARRAY = ['#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ffff00', '#ccff00', '#99ff00', '#66ff00', '#33ff00', '#2de500']; //12
//const COLOR_GRADIENT_ARRAY = ['#ff0000', '#ff4d00', '#ff9900', '#ffe600', '#ccff00', '#80ff00', '#33ff00', '#00ff1a', '#00ff66', '#00ffb3', '#00ffff']; //18

const OPTIONS_ARRAY = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default class salesDebriefChildComp extends LightningElement {
    @api isEditMode;
    @api componentType;
    @api fieldSet;
    @api optionsToDisplay;
    @api tableData;
    isRadioComponent = false;
    isTableComponent = false;
    isTextComponent = false;
    fieldSetArray = [];
    optionsToDisplayArray = [];
    value = '';
    productType;

    connectedCallback() {
        this.isEditMode = !this.isEditMode; //for disabling purpose

        if (this.componentType == 'Text') {
            this.isTextComponent = true;
            this.fieldSetArray = this.fieldSet.split(';');
            this.productType = this.tableData[0].productType;
        }

        if (this.componentType == 'Radio') {
            this.isRadioComponent = true;
            this.fieldSetArray = this.fieldSet.split(';');
            this.optionsToDisplayArray = this.optionsToDisplay.split(';');
        }

        if (this.componentType == 'Table') {
            this.isTableComponent = true;
            this.optionsToDisplayArray = this.optionsToDisplay.split(';');
        }

    }

    onchangeHandler(event) {
        let eventData;
        let fieldApiName = event.target.dataset.fieldapi;
        let fieldValue;

        if (fieldApiName == 'Employer_likely_to_change_administrators__c') {
            fieldValue = event.target.dataset.optvalue;

            //console.log('Color Array '+COLOR_GRADIENT_ARRAY);

            let targetColor = COLOR_GRADIENT_ARRAY[fieldValue];

            OPTIONS_ARRAY.forEach((opt) => {
                if (fieldValue == opt) {
                    let target = this.template.querySelector(`[data-optvalue="${fieldValue}"]`);
                    target.style = `background-color:${targetColor}; font-weight: bolder;`;
                }
                else {
                    let target = this.template.querySelector(`[data-optvalue="${opt}"]`);
                    target.style = 'background-color:none';
                }
            });
        }
        else {
            fieldValue = event.target.value;
        }

        eventData = {
            'fieldApiName': fieldApiName,
            'fieldValue': fieldValue
        };

        const sendDataToParent = new CustomEvent("childcomponentdata", {
            detail: eventData
        });


        this.dispatchEvent(sendDataToParent);
    }

    renderedCallback() {
        //console.log('Inside child RCB');
        //console.log('Color Array '+COLOR_GRADIENT_ARRAY);
        if (this.isTableComponent == true) {
            let targetOpt = this.tableData.currentVal;
            let targetColor = COLOR_GRADIENT_ARRAY[targetOpt];

            OPTIONS_ARRAY.forEach((opt) => {
                if (targetOpt == opt) {
                    let target = this.template.querySelector(`[data-optvalue="${targetOpt}"]`);
                    target.style = `background-color:${targetColor}; font-weight: bolder;`;
                }
                else {
                    let target = this.template.querySelector(`[data-optvalue="${opt}"]`);
                    target.style = 'background-color:none';
                }
            });
        }
    }
}