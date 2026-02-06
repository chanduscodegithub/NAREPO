import { LightningElement, api } from 'lwc';

const COLOR_GRADIENT_ARRAY = ['#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ffff00', '#ccff00', '#99ff00', '#66ff00', '#33ff00', '#2de500']; //12
const OPTIONS_ARRAY = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];


export default class ClientStrartegyChildComp extends LightningElement {

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
        

        
      /*  if (
            fieldApiName === 'Earned_Full_Incentive__c' ||
            fieldApiName === 'Earned_Partial_Incentive__c' ||
            fieldApiName === 'Did_Not_Earn_Incentive__c'
        ) {
            // Parse the new value and existing values
        let full = Number(this.template.querySelector('[data-fieldapi="Earned_Full_Incentive__c"]')?.value) || 0;
        let partial = Number(this.template.querySelector('[data-fieldapi="Earned_Partial_Incentive__c"]')?.value) || 0;
        let didNot = Number(this.template.querySelector('[data-fieldapi="Did_Not_Earn_Incentive__c"]')?.value) || 0;


            let total = full + partial + didNot;

            // Inline >validation
            let errorMsg = "";
            if (total < 100) {
                errorMsg = "The Total percentage of employees that earned the incentive amount must be equal to 100%";
            } else if (total > 100) {
                errorMsg = "The Total percentage of employees that earned the incentive amount must be equal to 100%";
            }

        ["Did_Not_Earn_Incentive__c"].forEach(apiName => {
        let inputCmp = this.template.querySelector(`[data-fieldapi="${apiName}"]`);
        if (inputCmp) {
            inputCmp.setCustomValidity(errorMsg);
            inputCmp.reportValidity();
        }
        });

        }  */
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