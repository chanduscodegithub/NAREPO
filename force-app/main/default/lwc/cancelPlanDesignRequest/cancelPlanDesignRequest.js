import { LightningElement, api, wire, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

import STATUS_FIELD from '@salesforce/schema/Plan_Design_Request__c.Status__c';
import REASON_FIELD from '@salesforce/schema/Plan_Design_Request__c.Cancellation_Reason__c';
import DATE_FIELD from '@salesforce/schema/Plan_Design_Request__c.Cancelled_Date__c';


import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import PROFILE_NAME from '@salesforce/schema/User.Profile.Name';

export default class CancelPlanDesignRequest extends LightningElement {

    @api recordId;
 profileName;
    cancelReason = '';
    cancelledDate;
    isLoading = false;

    connectedCallback() {
        this.cancelledDate = this.getTodayDate();
    }

    // 🔹 Get Today Date (YYYY-MM-DD)
    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    handleChange(event) {
        this.cancelReason = event.target.value;
    }

    handleConfirm() {

        // 🔴 Validation
        if (!this.cancelReason) {
            this.showToast('Error', 'Please enter Cancellation Reason', 'error');
            return;
        }

        this.isLoading = true;

        const fields = {
            Id: this.recordId,
            [STATUS_FIELD.fieldApiName]: 'Cancelled',
            [REASON_FIELD.fieldApiName]: this.cancelReason,
            [DATE_FIELD.fieldApiName]: this.cancelledDate
        };

        updateRecord({ fields })
            .then(() => {
                this.showToast('Success', 'Plan Design Request Cancelled', 'success');
                this.dispatchEvent(new CloseActionScreenEvent());
            })
            .catch(error => {
                this.isLoading = false;
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleBack() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }

    get isConfirmDisabled() {
        return !this.cancelReason || this.cancelReason.trim().length === 0;
    }
    @wire(getRecord, { recordId: USER_ID, fields: [PROFILE_NAME] })
    wiredUser({ data }) {
        if (data) {
            this.profileName = data.fields.Profile.displayValue || data.fields.Profile.value;

            if (this.profileName === 'Benefit Strategist') {

                // Show toast first
                this.showToast(
                    'Error',
                    'You have no access to cancel the Plan Design Request',
                    'error'
                );

                // Close AFTER slight delay
                setTimeout(() => {
                    this.dispatchEvent(new CloseActionScreenEvent());
                }, 500);
            }
        }
    }

   get formattedCancelledDate() {
    return this.cancelledDate 
        ? new Date(this.cancelledDate).toLocaleDateString()
        : '';
}
}