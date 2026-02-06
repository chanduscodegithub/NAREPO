import { LightningElement, api } from 'lwc';
export default class StrategyMemoRfpStrategy extends LightningElement {
    @api recordId;
    @api isEditMode;
    @api businessOverview;

    @api businessPressures = '';
    @api potentialCompelling = '';
    @api uniqueBusinessValues = '';
    @api keyRisks = '';
    @api outcomeDrivers = '';
    @api approachStrategy = '';
    @api lastAction = '';
    @api surestApproachStrategy = '';
    @api surestNetworkConstraints = '';
    @api networkContracting = '';
    @api surestComments = '';
    @api nextAction = '';
    @api notesTaken = '';
    @api strategyMemo;
    handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;

        this.dispatchEvent(new CustomEvent('strategymemochange', {
            detail: { fieldName: name, fieldValue: value }
        }));
    }
}