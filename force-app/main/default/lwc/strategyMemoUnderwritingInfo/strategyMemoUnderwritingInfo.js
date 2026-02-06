import { LightningElement, api } from 'lwc';
export default class StrategyMemoUnderwritingInfo extends LightningElement {
    @api recordId;
    @api averageContractSize;
    @api bicData;
    @api vsAetna;
    @api vsAnthem;
    @api vsBlues;
    @api vsBluesAlt;
    @api vsCigna;
    @api membersInProposal;
    @api eligibleEesAndRetirees;
    @api enrolledEmployeesProposal;
    @api isEditMode;
    @api strategyMemo;
    handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;

        this.dispatchEvent(new CustomEvent('strategymemochange', {
            detail: { fieldName: name, fieldValue: value }
        }));
    }
}