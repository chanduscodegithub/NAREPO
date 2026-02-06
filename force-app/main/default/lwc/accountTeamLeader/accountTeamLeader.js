// accountTeamLeader.js
import { LightningElement } from 'lwc';

export default class AccountTeamLeader extends LightningElement {
    handleInputChange(event) {
        const fieldName = event.target.dataset.field; // 'vpcrRvp' or 'sce'
        const value = event.target.value;

        // Create an object with the updated data
        const data = { [fieldName]: value };

        // Dispatch the data with section info
        this.dispatchEvent(new CustomEvent('datachange', {
            detail: {
                section: 'accountTeamLeader',
                data: data
            }
        }));
    }
}