import { LightningElement, api, wire } from 'lwc';
export default class RfpTeamContacts extends LightningElement {
    @api recordId;
    @api covetedAccount;
    @api ownerName;
    @api surestSvpInvolved
    @api specialityBenefits;
    @api sceAssignment;
    @api financialStrategyLead;
    @api executiveSponsor;
    @api dealSponsor;
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