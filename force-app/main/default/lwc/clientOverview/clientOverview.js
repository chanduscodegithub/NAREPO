// clientOverview.js
import { LightningElement } from 'lwc';

export default class ClientOverview extends LightningElement {
    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        // Save only Column Name 1 input, as per your requirement
        if (field === 'column1') {
            this.dispatchEvent(new CustomEvent('datachange', {
                detail: {
                    section: 'clientOverview',
                    data: { [field]: value }
                }
            }));
        }
        // You can also include logic for other fields if needed
    }
}