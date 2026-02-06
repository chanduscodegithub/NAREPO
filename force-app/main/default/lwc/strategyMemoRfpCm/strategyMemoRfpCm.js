import { LightningElement, api, track, wire } from 'lwc';
import getPicklistOptions from '@salesforce/apex/StrategyMemoController.getAMTOptions';
export default class StrategyMemoRfpCm extends LightningElement {
    @api recordId;
    @api isEditMode;
    @api bidStrategy;
    @api pharmacyProducts = [];
    @api visionProducts = [];
    @api dentalProducts = [];
    @api otherProductsInfo = [];
    @api medicalProductsInfo = [];
    @api competitorInMedical = [];
    @api competitorInOther = [];
    @api competitorInDental = [];
    @api competitorInVision = [];
    @api competitorInPharmacy = [];
    //@api strategyMemo;
    @track options = [];
    @track selectedCheckboxesArray = [];
    selectedCheckboxes = '';
    @track callRegionsMap = {};
    @track claimRegionsMap = {};
    @track checkedDisruption = false;

    @wire(getPicklistOptions)
    wiredOptions({ error, data }) {
        if (data) {
            this.options = data.map(option => ({ label: option, value: option }));
        } else if (error) {
            console.error('Error fetching picklist options:', error);
        }
    }
    _strategyMemo;
    @api
    get strategyMemo() {
        return this._strategyMemo;
    }
    set strategyMemo(value) {
        this._strategyMemo = value;
        this.initializeCheckboxValues();
        //this.checkedDisruption = value?.Disruption_Analysis__c === true;//
    }
    connectedCallback() {
        this.checkedDisruption = this.strategyMemo?.Disruption_Analysis__c === true;
    }

    /* connectedCallback() {
         if (this.strategyMemo.AMT_Names_Requested__c) {
             this.selectedCheckboxesArray = this.strategyMemo.AMT_Names_Requested__c.split(';');
         }
         if (this.strategyMemo.Call_Site__c) {
             const calls = this.strategyMemo.Call_Site__c.split(';');
             calls.forEach(city => this.callRegionsMap[city] = true);
         }
         if (this.strategyMemo.Claim__c) {
             const claims = this.strategyMemo.Claim__c.split(';');
             claims.forEach(city => this.claimRegionsMap[city] = true);
         }
     }*/
    initializeCheckboxValues() {
        /* if (this._strategyMemo?.AMT_Names_Requested__c) {
             this.selectedCheckboxesArray = this._strategyMemo.AMT_Names_Requested__c.split(';');
         } else {
             this.selectedCheckboxesArray = [];
         }*/
        const amtValue = this._strategyMemo?.AMT_Names_Requested__c;
        if (typeof amtValue === 'string') {
            this.selectedCheckboxesArray = amtValue.split(';');
        } else if (Array.isArray(amtValue)) {
            this.selectedCheckboxesArray = amtValue;
        } else {
            this.selectedCheckboxesArray = [];
        }

        this.callRegionsMap = {};
        if (this._strategyMemo?.Call_Site__c) {
            const calls = this._strategyMemo.Call_Site__c.split(';');
            calls.forEach(city => this.callRegionsMap[city] = true);
        }

        this.claimRegionsMap = {};
        if (this._strategyMemo?.Claim__c) {
            const claims = this._strategyMemo.Claim__c.split(';');
            claims.forEach(city => this.claimRegionsMap[city] = true);
        }
    }

    handleCheckboxChange(event) {
        if (event.detail && event.detail.value) {
            this.selectedCheckboxesArray = event.detail.value;

            console.log('Child selectedCheckboxesArray (AMT):', this.selectedCheckboxesArray);

            this.dispatchEvent(new CustomEvent('strategymemochange', {
                detail: { fieldName: 'AMT_Names_Requested__c', fieldValue: [...this.selectedCheckboxesArray] }
            }));
            return;
        }
        let city = event.target.name;
        let type = event.target.dataset.type;
        let isChecked = event.target.checked;
        if (type === 'call') {
            this.callRegionsMap[city] = isChecked;
            const selectedValuesCallClaim = Object.keys(this.callRegionsMap).filter(key => this.callRegionsMap[key]);

            this.dispatchEvent(new CustomEvent('strategymemochange', {
                detail: { fieldName: 'Call_Site__c', fieldValue: selectedValuesCallClaim.join(';') }
            }));
        } else if (type === 'claim') {
            this.claimRegionsMap[city] = isChecked;
            const selectedValuesCallClaim = Object.keys(this.claimRegionsMap).filter(key => this.claimRegionsMap[key]);

            this.dispatchEvent(new CustomEvent('strategymemochange', {
                detail: { fieldName: 'Claim__c', fieldValue: selectedValuesCallClaim.join(';') }
            }));
        }

    }

    /*handleCheckboxChange(event) {
        this.selectedCheckboxesArray = event.detail.value;
        console.log('Child selectedCheckboxesArray:', this.selectedCheckboxesArray);
        this.dispatchEvent(new CustomEvent('strategymemochange', {
            detail: { fieldName: 'AMT_Names_Requested__c', value: [...this.selectedCheckboxesArray] }
        }));
    }*/

    handleChange(event) {
        const name = event.target.name;
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        if (name === 'Disruption_Analysis__c') {
            this.checkedDisruption = value;
        }
        this.dispatchEvent(new CustomEvent('strategymemochange', {
            detail: { fieldName: name, fieldValue: value }
        }));
    }

}