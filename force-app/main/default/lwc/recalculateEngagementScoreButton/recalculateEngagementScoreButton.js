import { LightningElement, api, track, wire } from 'lwc';
import getLastRunDetailsWithActivityCount from '@salesforce/apex/EngagementScoreTriggerHandler.getLastRunDetailsWithActivityCount';
import recalculateEngagementScore from '@salesforce/apex/EngagementScoreTriggerHandler.recalculateEngagementScore';
import sendEngagementPrompt from '@salesforce/apex/EngagementSummaryController.sendEngagementPrompt';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RecalculateEngagementScoreButton extends LightningElement {
    @api recordId; // Account Id
    isProcessing = false;
    isModalOpen = false;
    nextRunFormatted = '';
    lastRunFormatted = 'Never';
    activityCount =0;
    isConfirmationModalOpen = false;

    refreshKey = 0; // New property to trigger re-render
    connectedCallback() {
        this.fetchLastRunTimeWithActivityCount();
         this.calculateNextMonday();
    }


    handleOpenModal() {
    console.log('inside handleOpenModal');
    this.isModalOpen = true;

    // Wait for the modal to render before accessing the child component
    setTimeout(() => {
        const childComponent = this.template.querySelector("c-engagement-summary-component");
        if (childComponent) {
            childComponent.temphandleOpenModal(this.isModalOpen);
            childComponent.refreshChildComponent();
        } else {
            console.error("Child component not found.");
        }
    }, 0);
}

handleCloseModal(event) {
    console.log(event.detail.message);
    this.isModalOpen = event.detail.message;
}

handleRefreshFromChild() {
    this.fetchLastRunTimeWithActivityCount();
}

 // Open confirmation modal
    openConfirmationModal() {
        this.isConfirmationModalOpen = true;
    }

    // Close modal without taking action
    closeConfirmationModal() {
        this.isConfirmationModalOpen = false;
    }

    async handleClick() {
       this.isConfirmationModalOpen = false; // Close modal 
    this.isProcessing = true; // Show spinner

    try {
        console.log('Starting Engagement Score Recalculation...');
        await recalculateEngagementScore({ accountId: this.recordId });
        console.log('Engagement Score Recalculated Successfully!');

        console.log('Sending Engagement Prompt...');
        await this.handlesendEngagementPrompt();
        console.log('Engagement Prompt Sent Successfully!');

        this.showToast('Success', 'View the updated engagement data in the Dashboard. Please note: It may take 5-6 minutes for the Dashboard to update.', 'success');
        // Force child component re-render
        this.refreshKey++;
    } catch (error) {
        console.error('Error:', error);
        this.showToast('Error', error.body?.message || error.message, 'error');
    } finally {
        this.isProcessing = false; // Hide spinner regardless of success or failure
    }
}

async handlesendEngagementPrompt() {
    try {
        const result = await sendEngagementPrompt({ recId: this.recordId });
        console.log('inside send engagement prompt');

        // Refresh the last run time and activity count
        await this.fetchLastRunTimeWithActivityCount();
    } catch (error) {
        console.error('Error Failed to generate summary:', error);
        throw error; // Ensure failure propagates to `handleClick`
    }
}

async fetchLastRunTimeWithActivityCount() {
    console.log('Fetching last run time and activity count...');
    try {
        const data = await getLastRunDetailsWithActivityCount({ accountId: this.recordId });
        if (data) {
            console.log('inside fetchlastrun');
            this.lastRunFormatted = data.lastRunFormatted;
            this.activityCount = data.activityCount;
        }
    } catch (error) {
        console.error('Error fetching last run time:', error);
    }
}


    

    showToast(title, message, variant) {
        const event = new ShowToastEvent({ title, message, variant});
        this.dispatchEvent(event);

    }

    // Get computed CSS class for generate button
    get generateButtonClass() {
        return this.isGenerating ? 'generate-summary-btn button-loading' : 'generate-summary-btn';
    }

    calculateNextMonday() {
        let today = new Date();
        let dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        // Calculate days to add to get next Monday
        let daysToAdd = dayOfWeek === 1 ? 7 : (8 - dayOfWeek); // If today is Monday, move to next Monday

        let nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysToAdd);
        nextMonday.setHours(0, 0, 0, 0); // Set time to 12:00 AM

        this.nextRunFormatted = this.formatDateTime(nextMonday);
        console.log('Next Run Scheduled for:', this.nextRunFormatted);
    }

    formatDateTime(date) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }
}