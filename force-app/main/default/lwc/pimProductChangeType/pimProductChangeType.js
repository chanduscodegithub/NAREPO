import { LightningElement, api, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import getDifferences from '@salesforce/apex/PimController.getDifferences';
import updateProductOnPublish from '@salesforce/apex/PimController.updateProductOnPublish';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PimProductChangeType extends LightningElement {

    @api recordId;

    differences = [];
    hasDifferences = false;
    isLoading = false; // ✅ FIXED

    // 🔹 Load differences
    @wire(getDifferences, { stageRecordId: '$recordId' })
    wiredDifferences({ data, error }) {
        if (data) {
            this.differences = data;
            this.hasDifferences = data.length > 0;
        } else if (error) {
            console.error(error);
            this.showToast(
                'Error',
                'Failed to load differences',
                'error'
            );
        }
    }

    // 🔹 Publish
    handleUpdate() {
        console.log('🔥 Publish clicked'); // DEBUG – keep for now

        this.isLoading = true;

        updateProductOnPublish({ stageRecordId: this.recordId })
            .then(() => {
                this.showToast(
                    'Success',
                    'Product updated successfully',
                    'success'
                );
                this.dispatchEvent(new CloseActionScreenEvent()); // ✅ FIXED
            })
            .catch(error => {
                console.error(error);
                this.showToast(
                    'Error',
                    error?.body?.message || 'Publish failed',
                    'error'
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // 🔹 Cancel
    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent()); // ✅ FIXED
    }

    // 🔹 Toast helper (THIS WAS MISSING ❗)
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}