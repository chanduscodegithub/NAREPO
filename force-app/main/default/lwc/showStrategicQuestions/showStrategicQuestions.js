import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import { loadStyle } from 'lightning/platformResourceLoader';

import { refreshApex } from '@salesforce/apex';
import getStrategicFeedback from '@salesforce/apex/RFPController.getStrategicFeedback';
import handleStrategicAIResponse from '@salesforce/apex/RFPController.handleStrategicAIResponse';
import reprocessStrategy from '@salesforce/apex/RFPController.reprocessStrategy';
import checkAndLockRFP from '@salesforce/apex/RFPController.checkAndLockRFP';
import unlockRFP from '@salesforce/apex/RFPController.unlockRFP';

import getRfpQnARecords from '@salesforce/apex/RFPController.getRfpQnARecords';

import hasStrategicQuestionNumber from '@salesforce/apex/RFPController.hasStrategicQuestionNumber';


import { updateRecord } from 'lightning/uiRecordApi';
import { getRecord } from 'lightning/uiRecordApi';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';

const FIELDS = ['RFP__c.IsBatchRunningForStrategicAiResponses__c', 'RFP__c.IsStrategicReviewCompleted__c'];
import IncreaseModalSize from "@salesforce/resourceUrl/UHC_Main_DIV_aiReview";
import uhc_Logo from '@salesforce/resourceUrl/UHC_Logo'



export default class ShowStrategicQuestions extends LightningElement {

    @api recordId;
    @api objectApiName; // Detects whether it's on RFP__c or RFP_Question_And_Answer__c
    @track menuisOpen = true;
    @track records = []; // Stores all related RFP_Question_And_Answer__c records
    @track currentIndex = 0; // Tracks the index of the currently displayed record
    @track record = {}; // Current record
    @track noRecords = false; 
    uhcLogo= uhc_Logo;
    @track originalRecords = []; // to keep unfiltered list
    @track isLoading = false;
    @track loadingMessage = ''; // New message field
    @track wiredRecordsResult;
    @track rfpName= '';
    @track opportunityiD = '';
    feedbackData = [];
    summaryText = '';
    activeSection = ['strategic','feedback']; // default open section
    @track editedAnswers = {}; // { [recordId]: 'new value' }
    @track selectedReason = '';
    @track isBatchRunning = false;
    @track isStrategicReviewCompleted = false;
    callChildCmp = false;
    @track showGenericModal = false;
    @track genericModalTitle = '';
    @track genericModalBody = '';
    @track genericModalButtons = [];


        @track hasStrategicQuestion = false;


    checkStrategicQuestionStatus() {
        // Call the Apex method with the Membership Activity Id
        // (you already get it from your main query or from parent RFP)
        hasStrategicQuestionNumber({ rfpId: this.recordId })
            .then(result => {
                this.hasStrategicQuestion = result;
                this.noRecords = !result;
            })
            .catch(error => {
                console.error('Error checking strategic question:', error);
            });
    }



    handleIconClicktoMA() {
        if (this.opportunityiD) {
            const baseUrl = window.location.origin;
            const url = `${baseUrl}/lightning/r/Opportunity/${this.opportunityiD}/view`;
            window.open(url, '_blank');
        } else {
            console.warn('Opportunity Id not found');
        }
    }


    async handleSaveStrategicAnswers() {
        
        const updatePromises = Object.entries(this.editedAnswers).map(([id, value]) => {
            const fields = {
                Id: id,
                Revised_Response__c: value
            };
           
            return updateRecord({ fields });
            
        });

        try {
            await Promise.all(updatePromises);
           
            this.showToast('Success', 'Answers saved.', 'success');
            this.editedAnswers = {}; // clear after save
            await notifyRecordUpdateAvailable([{ recordId: this.recordId }]);
            await refreshApex(this.wiredRecordsResult);

        //     this.records = this.records.map(rec => ({
        //     ...rec,
        //     displayAnswer: rec.Revised_Response__c ? rec.Revised_Response__c : rec.Proposal_Gateway_Response__c
        // }));
        } catch (error) {
            console.error(error);
            this.showToast('Error', 'Failed to save answers', 'error');
        }
    }

    handleProceedToNextSteps () {
        const allEmpty = this.records.every(
                rec => !rec.Revised_Response__c || rec.Revised_Response__c.trim() === ''
            );

            if (allEmpty) {
                // this.showWarningModalToGenerateAIResponsestwo = true; // Opens warning modal
                this.openNoChangesWarningModal();
                return;
            }
            // this.showWarningModalToGenerateAIResponses = true;
            this.openGenerateAIReviewConfirmationModal();

    }

    handleStratQuestion() {
        this.callChildCmp = true;
        this.menuisOpen = false;
        // this.isOpen = true;
    }


    handleToggleAnswer(event) {
        const questionId = event.currentTarget.dataset.id;
        this.records = this.records.map(rec => {
            if (rec.Id === questionId) {
                const newShowAnswer = !rec.showAnswer;
            return {
                ...rec,
                showAnswer: newShowAnswer,
                iconName: newShowAnswer ? 'utility:chevrondown' : 'utility:chevronright'
            };
            }
            return rec;
        });
    }

    handleAnswerChange(event) {
        const recordId = event.target.dataset.id;
        const newValue = event.target.value;

        this.records = this.records.map(rec => {
            if (rec.Id === recordId) {
                return { ...rec, displayAnswer: newValue };
            }
            return rec;
        });

        this.editedAnswers = {
            ...this.editedAnswers,
            [recordId]: newValue
        };
    }


    connectedCallback() {
        Promise.all([
            loadStyle(this, IncreaseModalSize)
        ])
        .then(() => {
            if (!this.isStrategicReviewCompleted) {
                this.lockRFPIfNeeded();
            }
        })
        .catch(error => {
            console.error('Failed to load Diff library', error);
        });
    }


    renderedCallback() {
        if (this.showGenericModal && this.genericModalBody) {
            const bodyEl = this.template.querySelector('[data-id="modalBodySlot"]');
            if (bodyEl) {
                bodyEl.innerHTML = this.genericModalBody;
            }
        }
    }


    async lockRFPIfNeeded() {
        try {
            const result = await checkAndLockRFP({ rfpId: this.recordId });
        if (result.isLockedByOther) {
        this.genericModalTitle = 'Currently Editing';
        this.genericModalBody = `${result.lockedByName} is currently working on this Strategic Feedback.`;
        this.genericModalButtons = [
            {
                label: 'Close',
                variant: 'neutral',
                action: this.handleCloseGenericModal.bind(this)
            }
        ];
        this.showGenericModal = true;
    }

        } catch (error) {
            console.error('Error locking RFP:', error);
        }
    }


disconnectedCallback() {
    if (!this.isStrategicReviewCompleted) {
        unlockRFP({ rfpId: this.recordId }).catch(error => {
            console.error('Error unlocking RFP:', error);
        });
    }
}


    @wire(getRecord, {recordId: '$recordId', fields: FIELDS })
    wiredRFPRecord({ error, data }) {
        if (data) {
            this.isBatchRunning = data.fields.IsBatchRunningForStrategicAiResponses__c.value;
            this.isStrategicReviewCompleted = data.fields.IsStrategicReviewCompleted__c.value;

            // call modal logic if needed
            if (this.isBatchRunning) {
                this.openCurrentlyProcessingModal();
            }
        } else if (error) {
            console.error('Error fetching RFP status fields', error);
        }
    }



    @wire(getStrategicFeedback, { rfpId: '$recordId' })
    wiredFeedback({ error, data }) {
        if (data) {
            try {
                const parsed = JSON.parse(data);

                // Validate structure
                const feedbackItems = Array.isArray(parsed.data) ? parsed.data : [];

                this.feedbackData = feedbackItems.map((item, index) => {
                    const rating = item['Assessment Rating'] || '';
                    let cssClass = '';

                    switch (rating) {
                        case 'Well Aligned':
                            cssClass = 'rating-green';
                            break;
                        case 'Partially Aligned':
                            cssClass = 'rating-yellow';
                            break;
                        case 'Opportunity for Stronger Alignment':
                            cssClass = 'rating-red';
                            break;
                        default:
                            cssClass = 'rating-default';
                    }

                   let rawQuestionNumbers = item['Question Numbers Addressed In'] || '';
                   let questionNumbers = rawQuestionNumbers
                        .split(',')
                        .map(q => q.trim())
                        .map(q => ({ label: q, value: q }));

                    let questionNumberString = questionNumbers.map(q => q.label).join(', ');

                    return {
                        key: index,
                        strategyPoint: item['Strategy Point'] || '—',
                        derivedFrom: item['Derived from'] || '—',
                        assessmentRating: rating || '—',
                        assessmentClass: cssClass,
                        questionNumbers: questionNumbers,
                        questionNumberString: questionNumberString, 
                        notes: item['Notes'] || '—'
                        
                    };
                });

                this.summaryText = parsed.Summary || 'No summary provided.';
            } catch (err) {
                console.error('JSON parse error:', err.message);
                this.feedbackData = [];
                this.summaryText = '⚠️ Error: Feedback data is not in valid JSON format.';
                this.showError('Failed to load feedback due to JSON parsing issue.');
            }
        } else if (error) {
            console.error('Wire error:', error);
            this.feedbackData = [];
            this.summaryText = '⚠️ Error: Unable to fetch feedback data.';
            this.showError('Error fetching feedback: ' + error.body?.message || error.message);
        }
    }


    showError(message) {
        console.error(message);
    }

    getAssessmentClass(rating) {
        switch (rating) {
            case 'Well Aligned':
                return 'rating-green';
            case 'Partially Aligned':
                return 'rating-yellow';
            case 'Opportunity for Stronger Alignment':
                return 'rating-red';
            default:
                return '';
        }
    }

    handleGoingBacktoMainMenu() {
        this.isOpen = false;
        this.menuisOpen = true;
        this.callChildCmp = false;
    }


        @wire(getRfpQnARecords, { recordId: '$recordId', objectName: '$objectApiName', fetchStrategicOnly: true })
    wiredStrategicRecords(result) {
        this.wiredRecordsResult = result;
        const { data, error } = result;

        if (data) {
            // Normalize records for LWC usage
            this.records = data.map(record => ({
                ...record,
                showAnswer: false,
                displayAnswer: record.Revised_Response__c != null ? record.Revised_Response__c : record.Proposal_Gateway_Response__c,
                iconName: 'utility:chevronright'
            }));
            this.originalRecords = [...data];

            if (this.records.length > 0) {
                // We have Q&A records — show them
                this.noRecords = false;
                //this.menuisOpen = true;
                let index = this.records.findIndex(rec => rec.Id === this.recordId);
                if (index === -1) { index = 0; }
                this.currentIndex = index;
                this.record = this.records[this.currentIndex];
                this.rfpName = this.record?.RFP__r?.Membership_Activity__r?.Name || '';
                this.opportunityiD = this.record?.RFP__r?.Membership_Activity__c || '';
            } else {
                // No Q&A records — consult Strategy_Memo__c
                // call Apex method to determine if Strategic_Question_No__c is populated
                hasStrategicQuestionNumber({ rfpId: this.recordId })
                    .then(hasStrategicNo => {
                        if (hasStrategicNo) {
                            // Strategy memo has numbers — keep accordion visible (noRecords = false)
                            this.noRecords = false;
                            this.menuisOpen = true;
                            // record remains null because there are no Q&A records to show
                            this.record = null;
                        } else {
                            // No Q&A records AND no strategic question numbers -> show "no records" card
                            this.noRecords = true;
                            this.menuisOpen = false;
                            this.record = null;
                        }
                    })
                    .catch(apexErr => {
                        console.error('Error calling hasStrategicQuestionNumber:', apexErr);
                        // Safer UX: if we can't determine, show the "no records" message
                        this.noRecords = true;
                        this.menuisOpen = false;
                        this.record = null;
                    });
            }
        } else if (error) {
            console.error('Error fetching related records:', error);
            // On wire error, attempt to check strategy memo as a fallback
            hasStrategicQuestionNumber({ rfpId: this.recordId })
                .then(hasStrategicNo => {
                    if (hasStrategicNo) {
                        this.noRecords = false;
                        this.menuisOpen = true;
                    } else {
                        this.noRecords = true;
                        this.menuisOpen = false;
                    }
                })
                .catch(() => {
                    this.noRecords = true;
                    this.menuisOpen = false;
                });
        }
    }




    showToast(title, message, variant) {
        const evt = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(evt);
    }


    handleConfirmAndContinueToGenerateAIResponses() {
        handleStrategicAIResponse({ rfpId: this.recordId })
            .then(result => {
                if (result === 'Started') {
                    this.showWarningModalToGenerateAIResponses = false; // ✅ Close modal  
                    getRecordNotifyChange([{ recordId: this.recordId }]);              
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Processing Started',
                            message: 'AI responses are being generated. You’ll be notified once complete.',
                            variant: 'success'
                        })
                    );
                    this.dispatchEvent(new CloseActionScreenEvent());
                } else if (result === 'AlreadyRunning') {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'In Progress',
                            message: 'AI response generation is already running.',
                            variant: 'warning'
                        })
                    );
                }
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }


 handleReprocessStrategy() {
        // this.showReasonModal = true;
        this.openReprocessReasonModal();
    }

    // Reason selection
    handleReasonChange(event) {
        this.selectedReason = event.detail.value;
    }

    // Confirm -> Save reason + call Apex batch
    handleConfirmReprocess() {
        if (!this.selectedReason) {
            this.showToast('Warning', 'Please select a reason.', 'warning');
            return;
        }

        this.isLoading = true;
        this.loadingMessage = 'Reprocessing...';


        const fields = {
            Id: this.recordId,
            IsStrategicReviewCompleted__c: false
        };

        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                notifyRecordUpdateAvailable([{ recordId: this.recordId }]);
                this.showToast('Processing Started', 'Strategy check started. You’ll be notified once complete.', 'success');
                 this.dispatchEvent(new CloseActionScreenEvent());
            })
            .catch(error => {
                this.showToast('Error', 'Failed to update IsStrategicReviewCompleted flag.', 'error');
                console.error('Error updating IsStrategicReviewCompleted__c:', error);
            });


        reprocessStrategy({ rfpId: this.recordId, reason: this.selectedReason })
            .then(() => {
                this.showToast('Processing Started', 'Strategy check started. You’ll be notified once complete.', 'success');
                // this.dispatchEvent(new CloseActionScreenEvent());
            })
            .catch(error => {
                this.showToast('Error', error.body?.message || error.message, 'error');
            })
            .finally(() => {
                this.isLoading = false;
                this.loadingMessage = '';
                this.showReasonModal = false;
                this.selectedReason = '';
            });
    }


    // Options
    get reasonOptions() {
        return [
            { label: 'Modified the Strategy', value: 'Modified the Strategy' },
            { label: 'Modified Strategic Questions', value: 'Modified Strategic Questions' },
            { label: 'No Changes, Reprocessing for Better Outcome' , value: 'No Changes,Reprocessing for Better Outcome'}
        ];
    }


    showGenericModalWithConfig({ title, body, buttons }) {
        this.genericModalTitle = title;
        this.genericModalBody = body;
        this.genericModalButtons = buttons;
        this.showGenericModal = true;
    }


openGenerateAIReviewConfirmationModal() {
    this.showGenericModalWithConfig({
        title: 'Confirmation',
        body: `The Revised Response will be reviewed against the general guidelines. <br> You will receive an email notification once your Responses are AI reviewed.`,
        buttons: [
            {
                label: 'Go back',
                variant: 'neutral',
                action: this.handleCloseGenericModal.bind(this)
            },
            {
                label: 'Continue',
                variant: 'brand',
                action: this.handleConfirmAndContinueToGenerateAIResponses.bind(this)
            }
        ]
    });
}



handleCloseGenericModal() {
    const bodyEl = this.template.querySelector('[data-id="modalBodySlot"]');
    if (bodyEl) {
        bodyEl.innerHTML = '';
    }

      // Optional: detect lock modal
    if (this.genericModalTitle === 'Currently Editing') {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
    this.showGenericModal = false;
}

openNoChangesWarningModal() {
    this.showGenericModalWithConfig({
        title: 'Are you sure?',
        body: `You haven't made any changes. Are you sure you want to proceed to the next steps?`,
        buttons: [
            {
                label: 'Go back',
                variant: 'neutral',
                action: this.handleCloseGenericModal.bind(this)
            },
            {
                label: 'Continue',
                variant: 'brand',
                action: this.handleConfirmAndContinueToGenerateAIResponses.bind(this)
            }
        ]
    });
}

openReprocessReasonModal() {
    this.showGenericModalWithConfig({
        title: 'Reprocess Strategy-Check',
        body: 'custom-body-reason',
        buttons: [
            {
                label: 'Cancel',
                variant: 'neutral',
                action: this.handleCloseGenericModal.bind(this)
            },
            {
                label: 'Reprocess',
                variant: 'brand',
                action: this.handleConfirmReprocess.bind(this)
            }
        ]
    });
}


openCurrentlyProcessingModal() {
    this.showGenericModalWithConfig({
        title: 'Currently Processing',
        body: 'The Revised responses are currently under review. We will notify you once the responses are ready. Thank you for your patience.',
        buttons: [
            {
                label: 'Close',
                variant: 'neutral',
                action: this.handleCloseGenericModal.bind(this)
            }
        ]
    });
}


    get isReasonModal() {
        return this.genericModalBody === 'custom-body-reason';
    }

    get isFeedbackAvailable() {
    return Array.isArray(this.feedbackData) && this.feedbackData.length > 0;
}
get isFeedbackEmpty() {
    return !this.feedbackData || this.feedbackData.length === 0;
}

}