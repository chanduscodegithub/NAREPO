// dataManager.js
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; // Import toast event

export default class DataManager extends LightningElement {
    // ... existing code ...

    handleSave() {
        // Your save logic here

        // Show success message
        this.showSuccessToast('Data saved successfully!');
    }

    showSuccessToast(message) {
        const event = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
}