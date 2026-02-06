import { LightningElement, api } from 'lwc';
export default class StrategyMemoCurrentOfferings extends LightningElement {
    @api recordId;
    @api isEditMode;
    @api competitorInMedical = [];
    @api competitorInOther = [];
    @api competitorInDental = [];
    @api competitorInVision = [];
    @api competitorInPharmacy = [];
    @api strategyMemo;
    handleChange(event) {
        const name = event.target.name;
        let value;

        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        }
        else if (event.target.dataset.picklist === 'multi') {
            value = event.detail.value;
        }
        else {
            value = event.target.value;
        }
        this.dispatchEvent(new CustomEvent('strategymemochange', {
            detail: { fieldName: name, fieldValue: value }
        }));
    }
}