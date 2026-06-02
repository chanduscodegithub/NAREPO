import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { updateRecord } from 'lightning/uiRecordApi';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import saveFinalAnswer from '@salesforce/apex/RFPController.saveFinalAnswer';
import rewriteLLMhit from '@salesforce/apex/RFPController.rewriteLLMhit';
import mergeLLMhit from '@salesforce/apex/RFPController.mergeLLMhit';
import styleLLMhit from '@salesforce/apex/RFPController.styleLLMhit';
import reGenerateLLMhit from '@salesforce/apex/RFPController.reGenerateLLMhit';
import checkAndLockQuestion from '@salesforce/apex/RFPController.checkAndLockQuestion';
import unlockQuestion from '@salesforce/apex/RFPController.unlockQuestion';
import trackVersion from '@salesforce/apex/RFPController.trackVersion';
import getUnmatchedSuggestedProducts from '@salesforce/apex/RFPController.getUnmatchedSuggestedProducts';
import getCategorizedProducts from '@salesforce/apex/RFPController.getCategorizedProducts';
import getRfpQnARecords from '@salesforce/apex/RFPController.getRfpQnARecords';
import eraseIcon from '@salesforce/resourceUrl/eraseIcon';
import uhc_Logo from '@salesforce/resourceUrl/UHC_Logo';
import IncreaseModalSize from "@salesforce/resourceUrl/UHC_Main_DIV_aiReview";
import DiffLib from '@salesforce/resourceUrl/DiffLib'

export default class AiReview2 extends LightningElement {

    @api recordId;
    @api objectApiName; // Detects whether it's on RFP__c or RFP_Question_And_Answer__c
    @api recordIdChild;
    @api objectApiNameChild;
    @api isChild = false;
    @track isOpen = true;
    @track records = []; // Stores all related RFP_Question_And_Answer__c records
    @track currentIndex = 0; // Tracks the index of the currently displayed record
    @track record = {}; // Current record
    @track finalAnswer = '';
    @track disablePrev = true;
    @track disableNext = true;
    @track noRecords = false;
    @track userInstructions = '';
    @track aiResponse = '';
    @track mergeUserInstructions = '';
    @track mergeAiResponse = '';
    @track copyIcon = 'utility:copy';
    @track copyIconPGR = 'utility:copy';
    @track showStyleModal = false;
    @track styleGuideResponse = '';
    // @track showDiffView = false;
    @track diffedProposalGatewayResponse = '';
    @track diffedRephrasedResponse = '';
    @track originalRecords = []; // to keep unfiltered list
    @track isLoading = false;
    @track loadingMessage = ''; // New message field
    @track isDiffStruck = false;
    @track rfpName = '';
    @track opportunityiD = '';
    @track selectedRating = ''; // can be 'Thumbs-Up', 'Thumbs-Down', or ''
    @track searchKey = '';
    @track searchResults = [];
    @track needsFinalization = false;
    @track showFinaliseModal = false;
    // @track showStyleDiffView = false;
    @track diffedStyledResponse = '';
    @track diffedFinalAnswerResponse = '';
    @track needsFinalizationMap = {};
    @track currentQuestionId;
    @track lockedByName = '';
    @track isSendDisabled = true;
    @track showPostRevisedModal = false;
    // @track showRevisedDiffView = false;
    @track diffedRevisedFinalAnswerResponse = '';
    @track diffedRevisededResponse = '';
    eraseicon = eraseIcon;
    uhcLogo = uhc_Logo;
    isAIRecommendedResponse = false;
    isProposalGatewayResponse = false;
    wiredRecordsResult;
    confirmedAIResponse = false;
    showNoRecordsModal = false;
    @track showFinalisedTable = false;
    @track showFeedback = false;
    @track showProductsTable = false;
    @track wordCount = 0;
    unmatchedProducts = [];
    @track showGenericModal = false;
    @track genericModalTitle = '';
    @track genericModalBody = '';
    @track genericModalButtons = [];
    @track isCustomSlotBody = false;
    @track productData = {};
    @track hasShownFinalisePopup = false;
    @track showMainDiffView = false; // For Main Modal
    @track showMergeDiffView = false; // For Merge Modal
    @track showStyleDiffView = false; // For Style Modal
    @track showRevisedDiffView = false; // For Post Revise Modal
    @track tempFinalAnswerBeforeStyling;
    @track selectedFilter = 'Not Finalised';//cr3
        @track summaryFilter ='Not Finalised'//cr3

    @track filteredRecords = [];//cr3
    //@track hasAutoFinalised = false;   // for current question
    autoFinalisedMap = {};
    @track skipStyleConfirmOnce = false;
    @track isStyleFlowFromFinalise = false;
    @track isStyleFlowFromFinalise = false;
    @track hasBulkAutoFinalised = false;
    // true when style was opened from Finalise

    get isShowNothing() {
        return !this.record?.Proposal_Gateway_Response__c?.trim() && !this.record?.IsAiProcessed__c;
    }

    get isShowRegenerateOnly() {
        const response = this.record?.Proposal_Gateway_Response__c;
        const isProcessed = this.record?.IsAiProcessed__c;

        // Remove all whitespace and line breaks
        const cleanedResponse = response?.replace(/[\s\r\n]+/g, '') || '';

        return cleanedResponse.length > 0 && !isProcessed;
    }


    get isShowAllIconsExceptRegenerate() {
        return !!(this.record?.Proposal_Gateway_Response__c?.trim() && this.record?.IsAiProcessed__c);
    }

    get wordCountClass() {
        const base = 'word-count slds-text-align_right slds-text-body_small slds-p-right_small';
        return this.isAnswerLimitExceeded
            ? `${base} slds-text-color_error slds-text-heading_small`
            : base;
    }
    connectedCallback() {
        Promise.all([
            loadStyle(this, IncreaseModalSize),
            loadScript(this, DiffLib)
        ])
            .then(() => {
                this.diffWordsWithSpace = window.Diff?.diffWordsWithSpace;
                this.handleOutsideClick = this.handleOutsideClick.bind(this);

            })
            .catch(error => {
                console.error('Failed to load Diff library', error);
            });
    }

    get revisedOrGatewayResponse() {
        const revised = this.record?.Revised_Response__c;
        const gateway = this.record?.Proposal_Gateway_Response__c;
        return revised && revised.trim() !== '' ? revised : gateway;
    }
    showGenericModalWithConfig({ title, body, buttons, isCustomBody = false }) {
        this.genericModalTitle = title;
        this.genericModalBody = body;
        this.genericModalButtons = buttons;
        this.isCustomSlotBody = isCustomBody;
        this.showGenericModal = true;
    }

    handleCloseGenericModal() {
        this.showGenericModal = false;
        this.isCustomSlotBody = false;
    }

    // component switching 
    handleGoingBacktoMainMenu() {
        const selectedEvent = new CustomEvent('backtoparent');
        this.dispatchEvent(selectedEvent);
    }

    getProducts(category) {
        return this.productData?.[category] || [];
    }

    get categorizedProductList() {
        if (!this.productData) return [];

        // Desired display order
        const order = ['Medical', 'Pharmacy', 'Dental', 'Vision'];

        // always total in the end
        const sortRecords = (records) => {
            return [
                ...records.filter(p => p.Product2.Name !== 'Total'),
                ...records.filter(p => p.Product2.Name === 'Total')
            ];
        };


        // Include only those categories present in data
        const orderedList = order
            .filter(cat => this.productData[cat])
            .map(cat => ({
                category: cat,
                // records: this.productData[cat]
                records: sortRecords(this.productData[cat])
            }));

        // Add remaining categories (like 'Others') not in predefined order
        const remainingCategories = Object.keys(this.productData)
            .filter(cat => !order.includes(cat))
            .map(cat => ({
                category: cat,
                // records: this.productData[cat]
                records: sortRecords(this.productData[cat])
            }));

        return [...orderedList, ...remainingCategories];
    }

    get hasAnyProducts() {
        return this.categorizedProductList.length > 0;
    }

    get productCategories() {
        return Object.keys(this.productData);
    }


    @wire(getCategorizedProducts, { opportunityId: '$opportunityiD' })
    wiredProducts({ error, data }) {
        if (data) {
            this.productData = data;
        } else if (error) {
            console.error('Error fetching product data:', error);
        }
    }
    //cr3 - by chandrika
    get filterOptions() {
        return [
            { label: 'Not Finalised', value: 'Not Finalised' },
            { label: 'Finalised', value: 'Finalised' },
            { label: 'Finalised by AI', value: 'Finalised by AI' },
            { label: 'All', value: 'All' },

        ];
    }
    //CR3 - filter by chandrika
    handleFilterChange(event) {
        this.selectedFilter = event.detail.value;
        this.applyFilter(true);
    }

    /////filter

    get filterCounts() {
        const all = this.originalRecords || [];

        const notFinalisedCount = all.filter(r => !r.IsFinalised__c).length;
        const finalisedByAICount = all.filter(r => this.isFinalisedByAI(r)).length;
        // const finalisedManualCount = all.filter(r => r.IsFinalised__c && !this.isFinalisedByAI(r)).length;
        const finalisedManualCount = all.filter(r => r.IsFinalised__c).length;
        return {
            notFinalised: notFinalisedCount,
            finalised: finalisedManualCount,
            finalisedByAI: finalisedByAICount,
            all: all.length
        };
    }

    get isNotFinalisedDisabled() {
        return this.filterCounts.notFinalised === 0;
    }

    get isFinalisedDisabled() {
        return this.filterCounts.finalised === 0;
    }

    get isFinalisedByAiDisabled() {
        return this.filterCounts.finalisedByAI === 0;
    }

    get isAllDisabled() {
        return this.filterCounts.all === 0;
    }

    handleFilterMenuSelect(event) {
        const value = event.detail.value;
        this.selectedFilter = value;
        this.applyFilter(true);
    }
     handleSummaryFilterChange(event) {
        
        const value = event.detail.value;
        this.summaryFilter = value;
        //this.applyFilter(true);

        }
 get summaryRecords() {
        const all = this.originalRecords || [];
        let filtered = [...all];

        if (this.summaryFilter === 'Not Finalised') {
            filtered = filtered.filter(r => !r.IsFinalised__c);
        } else if (this.summaryFilter === 'Finalised') {
            filtered = filtered.filter(r => r.IsFinalised__c);
        } else if (this.summaryFilter === 'Finalised by AI') {
            filtered = filtered.filter(r => this.isFinalisedByAI(r));
        } else if (this.summaryFilter === 'All') {
            // no filtering
        }

        return filtered.map(record => ({
            ...record,
            finalisedClass: record.IsFinalised__c ? 'finalised-true' : 'finalised-false',
            finalisedLabel: record.IsFinalised__c ? 'Finalised' : 'Not Finalised',
            finalisedBy: record.Auto_Finalised_By_AI__c
                ? 'Finalised by AI'
                : (record.LastModifiedBy?.Name || ' ')
        }));
    }





    processFetchedRecords(data) {
        this.records = data.map(record => ({
            ...record,
            showAnswer: false,
            displayAnswer: record.Proposal_Gateway_Response__c,
            iconName: 'utility:chevronright',
            finalisedClass: record.IsFinalised__c ? 'finalised-true' : 'finalised-false',
            finalisedLabel: record.IsFinalised__c ? 'Finalised' : 'Not Finalised',
            // finalisedBy: record.LastModifiedBy.Name || ' '
            //finalisedBy: this.isFinalisedByAI(record) ? 'Finalised by AI' : (record.LastModifiedBy?.Name || ' ') //cr2
            finalisedBy: record.Auto_Finalised_By_AI__c ? 'Finalised by AI' : (record.LastModifiedBy?.Name || ' ')


        }));

        this.originalRecords = [...data];

        if (this.records.length === 0) {
            this.isOpen = false;
            this.noRecords = true;
            this.record = null;
        } else {
            this.noRecords = false;
            // let index = this.records.findIndex(rec => rec.Id === this.recordId);
            // if (index === -1) index = 0;
            let targetId = this.currentQuestionId;
            let index = 0;
            if (targetId) {
                const foundIdx = this.records.findIndex(rec => rec.Id === targetId);
                if (foundIdx !== -1) {
                    index = foundIdx;
                }
            }

            this.currentIndex = index;
            this.record = this.records[this.currentIndex];
            this.rfpName = this.record?.RFP__r.Membership_Activity__r.Name || '';
            this.opportunityiD = this.record?.RFP__r.Membership_Activity__c || '';
            this.currentQuestionId = this.record.Id;

            this.loadQuestion(this.record.Id);
            this.updateButtonState();
            // hasShownFinalisePopup = false;
            this.hasShownFinalisePopup = false;
            this.checkIfAllFinalised();

            const total = this.records.length;
            const finalisedCount = this.records.filter(rec => rec.IsFinalised__c).length;
            const workInProgressCount = total - finalisedCount;
            this.analyticsLines = [
                `${finalisedCount} have been finalised, Out of ${total} questions and ${workInProgressCount} are work in progress.`
            ];
        }
    }

    /// -------CR2------------
    // isFinalisedByAI(record) {
    //     if (!record) return false;

    // return record.IsFinalised__c && !!this.autoFinalisedMap[record.Id];
    //     const pgr = record.Proposal_Gateway_Response__c?.trim();
    //     const rephrased = record.Rephrased_Response__c?.trim();
    //     const feedback = record.AI_Feedback__c?.trim();

    //     const isSame = pgr && rephrased && pgr === rephrased;
    //     const isFeedbackEmpty = !feedback || feedback === '[]' || feedback === '[ ]';
    //     return record.IsFinalised__c && isSame && isFeedbackEmpty;
    // }
    isFinalisedByAI(record) {
        return !!(record && record.IsFinalised__c && record.Auto_Finalised_By_AI__c);
    }


    applyFilter(triggeredByUser = false) {
        // If no data, just clear and exit
        if (!this.originalRecords || this.originalRecords.length === 0) {
            this.records = [];
            this.record = null;
            this.currentQuestionId = null;
            this.disablePrev = true;
            this.disableNext = true;
            return;
        }
        let filtered = [...this.originalRecords];
        if (this.selectedFilter === 'Not Finalised') {
            filtered = filtered.filter(r => !r.IsFinalised__c);
        } else if (this.selectedFilter === 'Finalised') {
            filtered = filtered.filter(r => r.IsFinalised__c);
        } else if (this.selectedFilter === 'Finalised by AI') {
            filtered = filtered.filter(r => this.isFinalisedByAI(r));
        } else if (this.selectedFilter === 'All') {
            // no filtering
        }
        if (!triggeredByUser && filtered.length === 0 && this.selectedFilter !== 'All') {
            this.selectedFilter = 'All';
            filtered = [...this.originalRecords];
             this.checkIfAllFinalised();
        }
        this.records = filtered.map(record => ({
            ...record,
            showAnswer: false,
            displayAnswer: record.Proposal_Gateway_Response__c,
            iconName: 'utility:chevronright',
            finalisedClass: record.IsFinalised__c ? 'finalised-true' : 'finalised-false',
            finalisedLabel: record.IsFinalised__c ? 'Finalised' : 'Not Finalised',
            finalisedBy: this.isFinalisedByAI(record)
                ? 'Finalised by AI'
                : (record.LastModifiedBy?.Name || ' ')
        }));

        if (this.records.length > 0) {
            let idx = -1;
            if (this.record) {
                idx = this.records.findIndex(r => r.Id === this.record.Id);
            }
            if (idx === -1) {
                idx = 0;
            }

            this.currentIndex = idx;
            this.record = this.records[this.currentIndex];
            this.currentQuestionId = this.record.Id;
            this.updateButtonState();
        } else {
            // No questions at all (very rare)
            this.currentIndex = 0;
            this.record = null;
            this.currentQuestionId = null;
            this.disablePrev = true;
            this.disableNext = true;
        }
    }



    /*applyFilter(triggeredByUser = false) {
       // applyFilter() {
            
        // If no data, just clear and exit
        if (!this.originalRecords || this.originalRecords.length === 0) {
            this.records = [];
            this.disablePrev = true;
            this.disableNext = true;
            return;
        }

        // Always start from the full list from Apex
        let filtered = [...this.originalRecords];

        // Apply filter based on current selection
        if (this.selectedFilter === 'Not Finalised') {
            filtered = filtered.filter(r => !r.IsFinalised__c);
        } else if (this.selectedFilter === 'Finalised') {
           
            //filtered = filtered.filter(r => r.IsFinalised__c && !this.isFinalisedByAI(r));
             filtered = filtered.filter(r => r.IsFinalised__c);
        } else if (this.selectedFilter === 'Finalised by AI') {
            filtered = filtered.filter(r => this.isFinalisedByAI(r));
        } else if (this.selectedFilter === 'All') {
            // no filtering
        }

        // 🔁 Initial behaviour: if Not Finalised selected BUT no records,
        // auto-switch to All (ONLY when NOT user-triggered).
        // 
        if (!triggeredByUser &&
            this.selectedFilter === 'Not Finalised' &&
            filtered.length === 0
        )
        // if (
        //    (this.selectedFilter === 'Not Finalised' &&filtered.length === 0)|| 
        //    (this.selectedFilter === 'Not Finalised' && filtered.length === 0) ||
        //    (this.selectedFilter === 'Not Finalised' && filtered.length === 0)
        // )
         {
            this.selectedFilter = 'All';
            filtered = [...this.originalRecords];
        }

        // Now build the UI records (same structure as processFetchedRecords)
        this.records = filtered.map(record => ({
            ...record,
            showAnswer: false,
            displayAnswer: record.Proposal_Gateway_Response__c,
            iconName: 'utility:chevronright',
            finalisedClass: record.IsFinalised__c ? 'finalised-true' : 'finalised-false',
            finalisedLabel: record.IsFinalised__c ? 'Finalised' : 'Not Finalised',
            finalisedBy: this.isFinalisedByAI(record)
                ? 'Finalised by AI'
                : (record.LastModifiedBy?.Name || ' ')
        }));

        if (this.records.length > 0) {
            // Try to keep same question selected if possible
            let idx = -1;
            if (this.record) {
                idx = this.records.findIndex(r => r.Id === this.record.Id);
            }
            if (idx === -1) {
                idx = 0;
            }

            this.currentIndex = idx;
            this.record = this.records[this.currentIndex];
            this.currentQuestionId = this.record.Id;
            this.updateButtonState();
        } else {
            // No questions for this filter
            this.disablePrev = true;
            this.disableNext = true;

            // if (triggeredByUser) {
            //     this.showToast('Info', 'No questions found for the selected filter.', 'info');
            // }
        }
    }*/


    @wire(getRfpQnARecords, { recordId: '$recordIdChild', objectName: '$objectApiNameChild', fetchStrategicOnly: true })
    // @wire(getMatchingStrategicRecords, { recordId: '$recordIdChild', objectName: '$objectApiNameChild' })
    wiredStrategicRecords(result) {
        this.wiredRecordsResult = result;
        const { data, error } = result;
        if (data) {
            this.processFetchedRecords(data);
            this.applyFilter(false);   // false = not user-triggered
            this.autoFinaliseEligibleQuestionsOnLoad();

        } else if (error) {

            console.error('Error fetching related records:', error);

        }

    }
    @wire(getRfpQnARecords, { recordId: '$recordId', objectName: '$objectApiName', fetchStrategicOnly: false })
    // @wire(getRelatedRecords, { recordId: '$recordId', objectName: '$objectApiName' })
    wiredRecords(result) {
        this.wiredRecordsResult = result; // <-- track the result for refresh
        const { data, error } = result;
        if (data) {
            this.processFetchedRecords(data);
            this.applyFilter(false);   // false = not user-triggered
            this.autoFinaliseEligibleQuestionsOnLoad();


        } else if (error) {
            console.error('Error fetching related records:', error);
        }
    }

    get currentStatus() {
        //this.record?.IsFinalised__c ? 'Finalised' : 'Work in Progress';
        let status = this.record.IsFinalised__c ? 'Finalised' : 'Work in Progress';
        if (this.record.IsFinalised__c) {
            let finalisedBy = this.record.Auto_Finalised_By_AI__c ? 'AI' : (this.record.LastModifiedBy?.Name || '');
            status = `${status} / ${finalisedBy}`;
        }
        return status;
    }

    get currentStatusClass() {
        return this.record?.IsFinalised__c ? 'finalised-true' : 'rating-yellow';
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(evt);
    }

    async loadQuestion(questionId) {
        this.currentQuestionId = questionId;
        try {
            const result = await checkAndLockQuestion({ questionId });
            if (result.isLockedByOther) {
                // this.lockedByName = result.lockedByName;
                // this.showLockPopup = true;
                this.showGenericModalWithConfig({
                    title: 'Currently Editing',
                    body: `${result.lockedByName} is currently working on this question.`,
                    buttons: [
                        {
                            label: 'Prev',
                            variant: 'neutral',
                            buttonClass: 'slds-m-horizontal_small',
                            action: this.handlePrev.bind(this),
                            disabled: this.disablePrev
                        },
                        {
                            label: 'Next',
                            variant: 'neutral',
                            action: this.handleNext.bind(this),
                            disabled: this.disableNext
                        }
                    ]
                });
            } else {
                this.showLockPopup = false;
                //this.triggerAutoFinaliseIfNeeded();
            }
        } catch (error) {
            this.showToast('Error', 'Error checking lock: ' + (error.body?.message || error.message), 'error');
        }
    }

    get isRephrasedSameAsProposal() {
        const pgr = this.record?.Proposal_Gateway_Response__c?.trim();
        const rephrased = this.record?.Rephrased_Response__c?.trim();
        const feedback = this.record?.AI_Feedback__c?.trim();

        const isSame = pgr && rephrased && pgr === rephrased;
        const isFeedbackEmpty = !feedback || feedback === '[]' || feedback === '[ ]';

        return isSame && isFeedbackEmpty;
    }
    // 🔹 Same logic, but for an arbitrary record (used for bulk auto-finalise)
    isRephrasedSameAsProposalRecord(rec) {
        if (!rec) return false;

        const pgr = rec.Proposal_Gateway_Response__c?.trim();
        const rephrased = rec.Rephrased_Response__c?.trim();
        const feedback = rec.AI_Feedback__c?.trim();

        const isSame = pgr && rephrased && pgr === rephrased;
        const isFeedbackEmpty = !feedback || feedback === '[]' || feedback === '[ ]';

        return isSame && isFeedbackEmpty;
    }


    get shouldBypassSaveValidation() {
        return this.isRephrasedSameAsProposal && !this.record?.Final_Answer__c;
    }


    handleNext() {
        this.navigateTo(this.currentIndex + 1);
    }

    handlePrev() {
        this.navigateTo(this.currentIndex - 1);
    }


    async navigateTo(index) {
        const isFinalised = this.record?.IsFinalised__c;
        const isSameAsSaved = this.finalAnswer === (this.record?.Final_Answer__c || '');

        /*if (!isFinalised && !this.shouldBypassSaveValidation && !isSameAsSaved) {
            this.showToast('Warning', 'Please save your answer before moving to another question.', 'warning');
            return;
        }*/
        const hasUnsavedChanges = !isFinalised &&  !this.shouldBypassSaveValidation && !isSameAsSaved;
        if (hasUnsavedChanges) {
            try {
                await this.autoSaveDraft();   
            } catch (error) {
                return;
            }
        }

        // if (!this.shouldBypassSaveValidation && this.finalAnswer !== (this.record?.Final_Answer__c || '')) {
        //     this.showToast('Warning', 'Please save your answer before moving to another question.', 'warning');
        //     return;
        // }

        // Unlock current question
        if (this.currentQuestionId) {
            try {
                await unlockQuestion({ questionId: this.currentQuestionId });
            } catch (error) {
                console.error('Unlock error', error);
            }
        }

        if (index >= 0 && index < this.records.length) {
            this.currentIndex = index;
            this.record = this.records[this.currentIndex];
            this.currentQuestionId = this.record.Id;
            this.updateButtonState();
            this.handleCloseGenericModal(); // optional
            await this.loadQuestion(this.currentQuestionId);
            this.checkIfAllFinalised();
        }
    }


    //  Bulk auto-finalise on initial load: runs once, not per-question
    async autoFinaliseEligibleQuestionsOnLoad() {
        if (this.hasBulkAutoFinalised) {
            return;
        }
        const all = this.originalRecords || [];
        if (!all.length) {
            this.hasBulkAutoFinalised = true;
            return;
        }
        const candidates = all.filter(
            rec => !rec.IsFinalised__c && this.isRephrasedSameAsProposalRecord(rec)
        );
        if (!candidates.length) {
            this.hasBulkAutoFinalised = true;
            return;
        }
        this.hasBulkAutoFinalised = true; // mark as run
        this.isLoading = true;
        this.loadingMessage = 'Auto-finalising by AI...';
        const failed = [];
        try {
            for (const rec of candidates) {
                const questionId = rec.Id;

                const answerToSave =
                    (rec.Rephrased_Response__c && rec.Rephrased_Response__c.trim()) ||
                    (rec.Proposal_Gateway_Response__c && rec.Proposal_Gateway_Response__c.trim()) ||
                    '';

                if (!answerToSave) {
                    continue;
                }
                try {
                    /*await trackVersion({
                        questionId,
                        answer: answerToSave,
                        actionType: 'Final'
                    });*/

                    await saveFinalAnswer({
                        rfpId: questionId,
                        finalAnswer: answerToSave
                    });

                    const fields = {
                        Id: questionId,
                        IsFinalised__c: true,
                        IsStyled__c: true,
                        Auto_Finalised_By_AI__c: true
                    };
                    await updateRecord({ fields });
                    this.autoFinalisedMap[questionId] = true;


                    // rec.IsFinalised__c = true;   // <-- removed
                    // rec.IsStyled__c = true;      // <-- removed
                    // rec.Final_Answer__c = answerToSave; // <-- removed
                } catch (errOne) {
                    console.error(
                        'Auto-finalise failed for questionId:',
                        questionId,
                        JSON.stringify(errOne)
                    );
                    failed.push(
                        errOne.body?.message ||
                        errOne.message ||
                        'Unknown error'
                    );
                }
            }

            if (this.wiredRecordsResult) {
                notifyRecordUpdateAvailable(
                    candidates.map(c => ({ recordId: c.Id }))
                );
                await refreshApex(this.wiredRecordsResult);
            }

            if (failed.length) {
                this.showToast(
                    'Error',
                    'Auto-finalise by AI failed for some questions.',
                    'error'
                );
            }
        } catch (error) {
            console.error('Bulk auto-finalise wrapper failed', error);
            this.showToast(
                'Error',
                'Auto-finalise by AI failed for some questions.',
                'error'
            );
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }




    ////// --auto finalise ----

    // Update Prev/Next button state
    updateButtonState() {
        this.disablePrev = this.currentIndex === 0;
        this.disableNext = this.currentIndex === this.records.length - 1;
        this.finalAnswer = this.record?.Final_Answer__c || '';
        const isFinalAnswerEmpty = !this.record?.Final_Answer__c?.trim();
        if (this.isRephrasedSameAsProposal && isFinalAnswerEmpty) {
            this.finalAnswer = this.record.Proposal_Gateway_Response__c;
        }
        if (this.showMainDiffView) {
            this.generateDiffView(); // refresh diff content for the new question
        }
        if (this.showMergeDiffView) {

            this.generateDiffView(); // Same function reused
        }

        this.wordCount = this.calculateWordCount(this.finalAnswer);
        this.selectedRating = '';
        this.checkUnmatchedProducts(this.record.Rephrased_Response__c, this.opportunityiD);
        //this.triggerAutoFinaliseIfNeeded(); //cr2
        this.skipStyleConfirmOnce = false; //cr4


    }

    async checkUnmatchedProducts(text, opportunityId) {
        const suggestedProducts = this.extractHashtagWords(text);
        if (suggestedProducts.length === 0 || !opportunityId) {
            this.unmatchedProducts = [];
            return;
        }

        try {
            const result = await getUnmatchedSuggestedProducts({
                suggestedProducts,
                opportunityId
            });
            this.unmatchedProducts = result || [];
        } catch (error) {
            console.error('Error fetching unmatched products:', error);
            this.unmatchedProducts = [];
        }
    }

    extractHashtagWords(text) {
        const regex = /#(.*?)#/g;
        const matches = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
            matches.push(match[1].trim());
        }

        // Remove duplicates
        return [...new Set(matches)];
    }

    get unmatchedProductsFormatted() {
        return this.unmatchedProducts?.length > 0
            ? this.unmatchedProducts.join(', ')
            : '';
    }


    handleInputChange(event) {
        const input = event.target.value;
        const words = input.trim().split(/\s+/);
        const wordLimit = this.maxAnswerWordLimit;

        if (wordLimit !== null && words.length > wordLimit) {
            // ✂️ Truncate to word limit
            // this.finalAnswer = words.slice(0, wordLimit).join(' ');
            // this.wordCount = wordLimit;

            // Optional: visual feedback
            this.showToast('Warning', `Answer limit exceeded. Only ${wordLimit} words allowed.`, 'warning');
            this.finalAnswer = input;
            this.wordCount = words.filter(word => word.length > 0).length;
        } else {
            this.finalAnswer = input;
            this.wordCount = words.filter(word => word.length > 0).length;
        }

        this.markRecordAsNeedingFinalization();
    }



    calculateWordCount(text) {
        if (!text) return 0;
        // Match words using a simple regex
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }


    copyProposalResponse() {
        if (this.record?.IsFinalised__c) return;
        if (!this.finalAnswer) {
            this.copyIconPGR = 'utility:check';
            this.finalAnswer = this.record.Revised_Response__c || this.record.Proposal_Gateway_Response__c;
            this.wordCount = this.calculateWordCount(this.finalAnswer);
            setTimeout(() => {
                this.copyIconPGR = 'utility:copy'; // Revert after 2 seconds
            }, 2000);
        }
        else {
            this.showGenericModalWithConfig({
                title: 'Are you sure?',
                body: 'This will overwrite the text entered in the Final Answer section. Would you like to continue?',
                buttons: [
                    { label: 'Go back', variant: 'neutral', buttonClass: 'slds-m-horizontal_small', action: this.handleCloseGenericModal.bind(this) },
                    { label: 'Continue', variant: 'brand', action: this.handleOverwriteProposalGatewayResponse.bind(this) }
                ]
            });
        }
    }

    handleOverwriteProposalGatewayResponse() {
        this.finalAnswer = this.record.Revised_Response__c || this.record.Proposal_Gateway_Response__c;
        this.copyIconPGR = 'utility:check';
        this.wordCount = this.calculateWordCount(this.finalAnswer);
        this.markRecordAsNeedingFinalization();
        setTimeout(() => this.copyIconPGR = 'utility:copy', 2000);
        this.handleCloseGenericModal();
    }



    copyRephrasedResponse() {
        if (this.record?.IsFinalised__c) return;
        if (!this.finalAnswer) {
            this.copyIcon = 'utility:check'; // Change to check icon
            this.finalAnswer = this.record.Rephrased_Response__c || '';
            this.wordCount = this.calculateWordCount(this.finalAnswer);
            this.updateIsAiRecommendationUsed();
            setTimeout(() => {
                this.copyIcon = 'utility:copy'; // Revert after 2 seconds
            }, 2000);
        }
        else {
            this.showGenericModalWithConfig({
                title: 'Are you sure?',
                body: 'This will overwrite the text entered in the Final Answer section. Would you like to continue?',
                buttons: [
                    { label: 'Go back', variant: 'neutral', buttonClass: 'slds-m-horizontal_small', action: this.handleCloseGenericModal.bind(this) },
                    { label: 'Continue', variant: 'brand', action: this.handleOverwriteAIResponse.bind(this) }
                ]
            });
        }
    }


    updateIsAiRecommendationUsed() {
        const fields = {
            Id: this.record.Id,
            IsAiRecommendationUsed__c: true
        };

        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                notifyRecordUpdateAvailable([{ recordId: this.record.Id }]);

            })
            .catch(error => {
                this.showToast('Error', 'Failed to update AI usage flag.', 'error');
                console.error('Error updating IsAiRecommendationUsed__c:', error);
            });
    }



    handleOverwriteAIResponse() {
        this.finalAnswer = this.record.Rephrased_Response__c;
        this.copyIconAI = 'utility:check';
        this.wordCount = this.calculateWordCount(this.finalAnswer);
        this.markRecordAsNeedingFinalization();
        setTimeout(() => this.copyIconAI = 'utility:copy', 2000);
        this.handleCloseGenericModal();
    }


    handleClearFinalAnswer() {
        if (this.record?.IsFinalised__c) return;
        if (this.finalAnswer && this.finalAnswer.trim() !== '') {
            this.showGenericModalWithConfig({
                title: 'Clear Final Answer?',
                body: 'This will clear the Final Answer section. Are you sure you want to continue?',
                buttons: [
                    { label: 'Cancel', variant: 'neutral',buttonClass: 'slds-m-horizontal_small', action: this.handleCloseGenericModal.bind(this) },
                    { label: 'Clear', variant: 'destructive', action: this.confirmClearFinalAnswer.bind(this) }
                ]
            });
        }
    }

    confirmClearFinalAnswer() {
        this.finalAnswer = '';
        this.wordCount = 0;
        this.markRecordAsNeedingFinalization();
        this.handleCloseGenericModal();
    }


    get likeIconClass() {
        return `slds-m-right_xx-small icon-hover-effect likeIcon ${this.selectedRating === 'Thumbs-Up' ? 'active-like' : ''}`;
    }

    get dislikeIconClass() {
        return `slds-m-left_xx-small icon-hover-effect dislikeIcon ${this.selectedRating === 'Thumbs-Down' ? 'active-dislike' : ''}`;
    }


    handleThumbsUp() {
        if (this.record?.IsFinalised__c) return;
        this.updateRating('Thumbs-Up');
    }

    handleThumbsDown() {
        if (this.record?.IsFinalised__c) return;
        this.updateRating('Thumbs-Down');
    }

    updateRating(value) {
        const fields = {
            Id: this.record.Id,
            Rating__c: value
        };

        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                this.selectedRating = value;
                this.showToast('Success', `Thank you for your feedback`, 'success');
                notifyRecordUpdateAvailable([{ recordId: this.record.Id }]);
            })
            .catch(error => {
                this.showToast('Error', 'Failed to update rating', 'error');
                console.error('Error updating rating:', error);
            });
    }


    get showNoIssuesMessage() {
        return this.feedbackList.length === 0 && this.unmatchedProducts.length === 0;
    }


    get feedbackList() {
        return this.getFeedbackList(this.record?.AI_Feedback__c);
    }

    getFeedbackList(feedback) {
        if (!feedback || feedback.trim() === '[]' || feedback.trim() === '[ ]') {
            return [];
        }

        const parts = feedback.split(/header:/i); // case-insensitive split
        const result = [];

        for (let part of parts) {
            if (part.trim()) {
                const lines = part.trim().split('\n');
                const issue = lines[0].replace(/(problem:)?/i, '').trim();
                const description = lines.slice(1).join(' ').replace(/description:/i, '').trim();

                result.push({
                    problem: issue,
                    description: description
                });
            }
        }

        return result;
    }

    togglePopover() {
        // this.showFeedback = !this.showFeedback;
        this.showFeedback = true;
        // Add global click listener
        document.addEventListener('click', this.handleOutsideClick);
    }

    handleOutsideClick(event) {
        // Check if the click was outside the component
        if (!this.template.contains(event.target)) {
            this.showFeedback = false;
            document.removeEventListener('click', this.handleOutsideClick);
        }
    }

    handleIconClick(event) {
        event.stopPropagation(); // prevent outside click from triggering immediately
        this.togglePopover();
    }


    get popoverClass() {
        return `slds-popover slds-nubbin_top-left custom-popover ${this.showFeedback ? 'visible' : ''}`;
    }

    // Helper: Check if draft is saved
    isDraftSaved() {
        return this.finalAnswer === (this.record?.Final_Answer__c || '');
    }

    // Helper: Auto-save draft (returns a Promise)
    async autoSaveDraft() {
        const currentRecordId = this.record.Id;
        try {
            await trackVersion({
                questionId: currentRecordId,
                answer: this.finalAnswer,
                actionType: 'Save as Draft'
            });
            await saveFinalAnswer({
                rfpId: currentRecordId,
                finalAnswer: this.finalAnswer
            });
            notifyRecordUpdateAvailable([{ recordId: currentRecordId }]);
            await refreshApex(this.wiredRecordsResult);
            this.currentIndex = this.records.findIndex(rec => rec.Id === currentRecordId);
            if (this.currentIndex === -1) this.currentIndex = 0;
            this.record = this.records[this.currentIndex];
            this.updateButtonState();
        } catch (error) {
            this.showToast('Error', 'Failed to auto-save draft', 'error');
            throw error;
        }
    }
    async handleRewriteTemplate() {
        if (!this.finalAnswer) {
            this.showToast('Warning', 'Please enter Final Answer before revising', 'warning');
            return;
        }
        if (!this.record.Final_Answer__c || !this.isDraftSaved()) {
            await this.autoSaveDraft();
        }
        this.showRewriteModal = true;
        this.isOpen = false;
    }

    // Capture textarea input
    handleRewriteFeedbackChange(event) {
        this.userInstructions = event.target.value;
    }

    // Call Apex method when 'Rewrite' button is clicked
    async handleRewriteTask() {
        if (!this.userInstructions.trim()) {
            this.showToast('Error', 'Provide instructions for revising the response.', 'error');
            return;
        }

        this.isLoading = true;
        this.loadingMessage = 'Answer is getting Revised...';

        try {
            setTimeout(() => {
                this.loadingMessage = 'Please wait while the answer is being revised...';
            }, 1500);

            setTimeout(() => {
                this.loadingMessage = 'Almost done...';
            }, 3000);

            const response = await rewriteLLMhit({
                rfpIdString: this.record.Id,
                User_Instructions: this.userInstructions
            });

            this.aiResponse = response || 'No response received from AI.';
            this.showToast('Success', 'Answer is revised.', 'success');

            this.showRewriteModal = false;
            this.showPostRevisedModal = true;
            this.markRecordAsNeedingFinalization();

        } catch (error) {
            console.error('Error calling AI:', error);
            this.showToast('Error', 'Failed to revise the answer.', 'error');
        }
        finally {
            this.isLoading = false;
            this.loadingMessage = '';
            this.userInstructions = '';
        }
    }

    async handleRevisedResponse() {
        this.isLoading = true;
        this.loadingMessage = 'Applying changes...';

        const currentRecordId = this.record.Id;

        try {

            const fields = {
                Id: currentRecordId,
                IsRevised__c: true
            };
            const recordInput = { fields };

            await updateRecord(recordInput);
            await notifyRecordUpdateAvailable([{ recordId: currentRecordId }]);
            await refreshApex(this.wiredRecordsResult);

            this.currentIndex = this.records.findIndex(rec => rec.Id === currentRecordId);
            if (this.currentIndex === -1) {
                this.currentIndex = 0;
            }
            this.record = this.records[this.currentIndex];
            this.finalAnswer = this.aiResponse;
            this.wordCount = this.calculateWordCount(this.finalAnswer);
            this.markRecordAsNeedingFinalization();
            this.updateButtonStateForStyle();

            this.showToast('Success', 'Answer revised.', 'success');
            this.showPostRevisedModal = false;
            this.isOpen = true;
        } catch (error) {
            console.error('Error applying styled changes:', error);
            this.showToast('Error', 'Failed to apply styled changes.', 'error');
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }

    handleCloseRewriteModal() {
        this.showRewriteModal = false;
        this.isOpen = true;
    }

    handleClosePostRevisedModal() {
        this.showPostRevisedModal = false;
        this.showRewriteModal = true;
    }


    handleShowMergeTemplate() {
        this.showMergeModal = true;
        this.isOpen = false;
    }

    handleMergeFeedbackChange(event) {
        this.mergeUserInstructions = event.target.value;
    }

    // Call Apex method when 'Merge' button is clicked
    async handleMergeTask() {
        if (!this.mergeUserInstructions.trim()) {
            this.showToast('Warning', 'Provide instructions for merging the two responses.', 'warning');
            return;
        }

        this.isLoading = true;
        this.loadingMessage = 'Merge in progress...';

        try {
            setTimeout(() => {
                this.loadingMessage = 'Please wait while responses are being merged...';
            }, 1500);

            setTimeout(() => {
                this.loadingMessage = 'Almost done...';
            }, 3000);

            const response = await mergeLLMhit({
                rfpIdString: this.record.Id,
                User_Instructions: this.mergeUserInstructions
            });

            this.mergeAiResponse = response || 'No response received from AI.';
            this.showToast('Success', 'Responses Merged as per instructions.', 'success');

            const fields = {
                Id: this.record.Id,
                IsMerged__c: true
            };

            const recordInput = { fields };

            updateRecord(recordInput)
                .then(() => {
                    // this.showToast('Success', `Rating updated to ${value}`, 'success');
                    notifyRecordUpdateAvailable([{ recordId: this.record.Id }]);
                })
                .catch(error => {
                    this.showToast('Error', 'Failed to update rating', 'error');
                    console.error('Error updating rating:', error);
                });

            this.showMergeModal = false;
            this.isOpen = true;
            this.finalAnswer = this.mergeAiResponse;
            this.wordCount = this.calculateWordCount(this.finalAnswer);
            this.markRecordAsNeedingFinalization();

        } catch (error) {
            console.error('Error calling AI:', error);
            this.showToast('Error', 'Failed to process AI response.', 'error');
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
            this.mergeUserInstructions = '';
        }
    }

    handleCloseMergeModal() {
        this.showMergeModal = false;
        this.isOpen = true;
    }


    async handleStyleModal() {

        if (!this.finalAnswer) {
            this.showToast('Warning', 'Please enter Final Answer before styling.', 'warning');
            return;
        }
        // Always save the latest draft before styling
        if (!this.record.Final_Answer__c || !this.isDraftSaved()) {
            await this.autoSaveDraft();
        }
        if (this.record.Rephrased_Response__c === this.finalAnswer && !this.confirmedAIResponse) {
            // this.showWarningModalForAIResponse = true;
            this.showGenericModalWithConfig({
                title: 'Confirmation',
                body: 'You are about to Style the AI-Recommended Response without modifying its content. <br> Please confirm that you have reviewed it and would like to proceed.',
                buttons: [
                    { label: 'Go back', variant: 'neutral', buttonClass: 'slds-m-horizontal_small', action: this.handleCloseGenericModal.bind(this) },
                    { label: 'Continue', variant: 'brand', action: this.handleConfirmAndContinue.bind(this) }
                ]
            });
            return;
        }


        this.isLoading = true;
        this.loadingMessage = 'Styling in-progress...';

        try {
            setTimeout(() => {
                this.loadingMessage = 'Please wait while the answer is being styled...';
            }, 1500);
            setTimeout(() => {
                this.loadingMessage = 'Almost done...';
            }, 3000);

            const response = await styleLLMhit({ rfpIdString: this.record.Id });
            this.styleGuideResponse = response || 'No response received from AI.';
            // this.styleGuideResponse = 'Testing response';
            this.tempFinalAnswerBeforeStyling = this.finalAnswer;
            this.isOpen = false;
            this.showStyleModal = true;
        } catch (error) {
            console.error('Error calling AI:', error);
            this.showToast('Error', 'Failed to process AI response.', 'error');
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }

    handleConfirmAndContinue() {
        this.handleCloseGenericModal(); //
        this.showWarningModalForAIResponse = false;
        this.confirmedAIResponse = true;
        this.handleStyleModal(); // Re-call to continue execution
    }
    //-----------------cr4----------
    handleStyleCancel() {
        // Revert to old text if we had it saved
        if (this.tempFinalAnswerBeforeStyling !== null && this.tempFinalAnswerBeforeStyling !== undefined) {
            this.finalAnswer = this.tempFinalAnswerBeforeStyling;
            this.wordCount = this.calculateWordCount(this.finalAnswer);
        }
        this.tempFinalAnswerBeforeStyling = null;

        this.showStyleModal = false;
        this.isOpen = true;
        this.isStyleFlowFromFinalise = false;
    }

    // async handleStyleApplySaveDraft() {
    //     this.isLoading = true;
    //     this.loadingMessage = 'Applying styled changes and saving as draft...';

    //     const currentRecordId = this.record.Id;

    //     try {
    //         // Apply styled text
    //         this.finalAnswer = this.styleGuideResponse || this.finalAnswer;
    //         this.wordCount = this.calculateWordCount(this.finalAnswer);
    async handleStyleApplySaveDraft() {
        this.isLoading = true;
        this.loadingMessage = 'Applying styled changes and saving as draft...';

        const currentRecordId = this.record.Id;

        try {
            // 1) Apply styled text locally
            this.finalAnswer = this.styleGuideResponse || this.finalAnswer;
            this.record.Final_Answer__c = this.finalAnswer; // keep local record in sync
            this.wordCount = this.calculateWordCount(this.finalAnswer);

            // 2) Track as draft
            await trackVersion({
                questionId: currentRecordId,
                answer: this.finalAnswer,
                actionType: 'Save as Draft'
            });

            // 3) Save draft to server
            await saveFinalAnswer({
                rfpId: currentRecordId,
                finalAnswer: this.finalAnswer
            });

            // 4) Mark as styled but NOT finalised
            const fields = {
                Id: currentRecordId,
                IsStyled__c: true,
                IsFinalised__c: false
            };
            await updateRecord({ fields });

            notifyRecordUpdateAvailable([{ recordId: currentRecordId }]);
            await refreshApex(this.wiredRecordsResult);
            /*let idx = this.records.findIndex(r => r.Id === currentRecordId);
            if (idx === -1) {
                idx = 0;
            }
            this.currentIndex = idx;
            this.record = this.records[this.currentIndex];
            this.currentQuestionId = this.record.Id;*/

            this.updateButtonStateForStyle();
            this.markRecordAsNeedingFinalization();

            this.showToast('Success', 'Styled changes applied and saved as draft.', 'success');

            this.showStyleModal = false;
            this.isOpen = true;
        } catch (error) {
            console.error('Error applying styled draft:', error);
            this.showToast('Error', 'Failed to apply styled changes as draft.', 'error');
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
            this.isStyleFlowFromFinalise = false;
            this.tempFinalAnswerBeforeStyling = null;
        }
    }



    async handleStyleApplyFinalise() {
        this.isLoading = true;
        this.loadingMessage = 'Applying styled changes and finalising...';

        const currentRecordId = this.record.Id;

        try {
            // 1) Put styled text into finalAnswer (local state)
            this.finalAnswer = this.styleGuideResponse || this.finalAnswer;
            this.record.Final_Answer__c = this.finalAnswer; // keep local record in sync
            this.wordCount = this.calculateWordCount(this.finalAnswer);

            // 2) Close style modal context
            this.showStyleModal = false;
            this.isOpen = true;
            this.isStyleFlowFromFinalise = false;
            this.tempFinalAnswerBeforeStyling = null;

            // 3) Finalise with styled answer
            // This will:
            // - trackVersion (Final)
            // - saveFinalAnswer(this.finalAnswer)
            // - updateRecord({ IsFinalised__c: true, IsStyled__c: true })
            // - refreshApex + update local record
            await this.finalizeAnswer(true);
        } catch (error) {
            console.error('Error applying styled final answer:', error);
            this.showToast('Error', 'Failed to apply styled changes and finalise.', 'error');
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }





    /*async handleStyleGuideResponse() {
        this.tempFinalAnswerBeforeStyling = null;
        this.isLoading = true;
        this.loadingMessage = 'Applying changes...';

        const currentRecordId = this.record.Id;

        try {

            const fields = {
                Id: currentRecordId,
                //  Final_Answer__c: this.finalAnswer,
                IsStyled__c: true
            };

            const recordInput = { fields };

            await updateRecord(recordInput);
            await notifyRecordUpdateAvailable([{ recordId: currentRecordId }]);
            await refreshApex(this.wiredRecordsResult);

            this.currentIndex = this.records.findIndex(rec => rec.Id === currentRecordId);
            if (this.currentIndex === -1) {
                this.currentIndex = 0;
            }
            this.record = this.records[this.currentIndex];
            this.finalAnswer = this.styleGuideResponse;
            this.wordCount = this.calculateWordCount(this.finalAnswer);
            this.updateButtonStateForStyle();
            this.markRecordAsNeedingFinalization();

            this.showToast('Success', 'Answer styled.', 'success');

            this.showStyleModal = false;
            this.isOpen = true;
            this.showFinaliseModal = true;
        } catch (error) {
            console.error('Error applying styled changes:', error);
            this.showToast('Error', 'Failed to apply styled changes.', 'error');
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }*/

    updateButtonStateForStyle() {

        this.disablePrev = this.currentIndex === 0;
        this.disableNext = this.currentIndex === this.records.length - 1;
        //this.finalAnswer = this.record?.Final_Answer__c || '';
        this.selectedRating = '';

    }

    handleCloseFinaliseModal() {
        this.showFinaliseModal = false;
        this.isOpen = true;
    }


    handleCloseStyleModal() {
        this.finalAnswer = this.tempFinalAnswerBeforeStyling;
        this.wordCount = this.calculateWordCount(this.finalAnswer);
        this.showStyleModal = false;
        this.isOpen = true;
    }


    handleWarningModalForAIResponse() {
        this.showWarningModalForAIResponse = false;
    }


    handleSaveDraft() {
        // if (!this.finalAnswer) {
        //     this.showToast('Warning', 'Please enter final answer before saving as draft.', 'warning');
        //     return;
        // }

        const currentRecordId = this.record.Id;

        // Start tracking version FIRST
        trackVersion({
            questionId: currentRecordId,
            answer: this.finalAnswer,
            actionType: 'Save as Draft'
        })
            .then(() => {
                // THEN proceed with your EXISTING save flow unchanged
                return saveFinalAnswer({
                    rfpId: currentRecordId,
                    finalAnswer: this.finalAnswer
                });
            })
            .then(() => {
                this.showToast('Success', 'Draft Saved.', 'success');
                notifyRecordUpdateAvailable([{ recordId: currentRecordId }]);
                return refreshApex(this.wiredRecordsResult);
            })
            .then(() => {
                this.currentIndex = this.records.findIndex(rec => rec.Id === currentRecordId);
                if (this.currentIndex === -1) this.currentIndex = 0;
                this.record = this.records[this.currentIndex];
                this.updateButtonState();
            })
            .catch(error => {
                console.error('Error:', error);
                this.showToast('Error', 'Failed to save draft', 'error');
            });
    }


    // *** NEW GETTER: Logic to bypass mandatory styling ***
    get shouldBypassStyleValidation() {
        if (!this.record) return false;

        // 1. Check if the responses are identical (from existing getter)
        if (!this.isRephrasedSameAsProposal) {
            return false;
        }

        // 2. Check if visible character count is less than 50
        const sourceResponse = this.record.Proposal_Gateway_Response__c || '';
        // Strip HTML/Rich Text tags for a more accurate visible character count
        const cleanedText = sourceResponse.replace(/(<([^>]+)>)/gi, "").trim();

        // Condition: Text is identical AND short (less than 50 characters)
        return cleanedText.length > 0 && cleanedText.length < 50;
    }

    #CR1
    handleProceedAndReStyle() {
        this.skipStyleConfirmOnce = true;
        this.handleCloseGenericModal();
        this.handleStyleModal(); // opens styling flow
    }

    handleSkipAndFinalise() {
        this.skipStyleConfirmOnce = true;
        this.handleCloseGenericModal();
        this.handleSave(); // re-enter handleSave, now skipStyleConfirmOnce = true
    }
    // new version
    finalizeAnswer(canBypassStyle = false) {
        const currentRecordId = this.record.Id;
        const currentIndex = this.currentIndex;
        let targetRecordId = null;
        if (this.selectedFilter === 'Not Finalised') {
            if (currentIndex < this.records.length - 1) {
                // e.g. 30th in Not Finalised list → go to 31st in that list
                targetRecordId = this.records[currentIndex + 1].Id;
            } else if (currentIndex > 0) {
                // if it was the last one, go to previous in the list
                targetRecordId = this.records[currentIndex - 1].Id;
            }
        }

        // Use whatever is currently in this.finalAnswer (already styled / edited)
        return trackVersion({
            questionId: currentRecordId,
            answer: this.finalAnswer,
            actionType: 'Final'
        })
            .then(() => {
                // Save final answer to custom field
                return saveFinalAnswer({
                    rfpId: currentRecordId,
                    finalAnswer: this.finalAnswer
                });
            })
            .then(() => {
                this.showToast('Success', 'Answer is finalised and saved.', 'success');

                // Mark as finalised (and styled if applicable)
                const fields = { Id: currentRecordId, IsFinalised__c: true };
                if (canBypassStyle) {
                    fields.IsStyled__c = true;
                    fields.Auto_Finalised_By_AI__c = false;
                }
                return updateRecord({ fields });
            })
            .then(() => {
                this.autoFinalisedMap[currentRecordId] = false;
                notifyRecordUpdateAvailable([{ recordId: currentRecordId }]);
                return refreshApex(this.wiredRecordsResult);
            })
            .then(() => {
                // After refresh, this.records is rebuilt (with filters applied)

                if (!this.records || this.records.length === 0) {
                    // No records in current filter
                    this.currentIndex = 0;
                    this.record = null;
                    this.currentQuestionId = null;
                    this.disablePrev = true;
                    this.disableNext = true;
                    return;
                }

                // 1️⃣ Try to go to the “next” record we computed earlier
                let idx = -1;
                if (targetRecordId) {
                    idx = this.records.findIndex(r => r.Id === targetRecordId);
                }

                // 2️⃣ If that record is not in this filter anymore,
                //    fall back to the finalised record (works for "All" filter)
                if (idx === -1) {
                    idx = this.records.findIndex(r => r.Id === currentRecordId);
                }

                // 3️⃣ Final fallback: go to the first record
                if (idx === -1) {
                    idx = 0;
                }

                this.currentIndex = idx;
                this.record = this.records[this.currentIndex];
                this.currentQuestionId = this.record.Id;

                this.needsFinalizationMap[this.record.Id] = false;
                this.showFinaliseModal = false;
                this.updateButtonState();
                this.checkIfAllFinalised();
            })
            .catch(error => {
                console.error('Error:', error);
                this.showToast('Error', 'Failed to finalize answer', 'error');
            });
    }




    //new method for cr4
    // finalizeAnswer(canBypassStyle = false) {
    //     const currentRecordId = this.record.Id;

    //     // Use whatever is currently in this.finalAnswer (already styled / edited)
    //     return trackVersion({
    //         questionId: currentRecordId,
    //         answer: this.finalAnswer,
    //         actionType: 'Final'
    //     })
    //         .then(() => {
    //             // Save final answer to custom field
    //             return saveFinalAnswer({
    //                 rfpId: currentRecordId,
    //                 finalAnswer: this.finalAnswer
    //             });
    //         })
    //         .then(() => {
    //             this.showToast('Success', 'Answer is finalised and saved.', 'success');

    //             // Mark as finalised (and styled if applicable)
    //             const fields = { Id: currentRecordId, IsFinalised__c: true };
    //             if (canBypassStyle) {
    //                 fields.IsStyled__c = true;
    //                 fields.Auto_Finalised_By_AI__c = false;


    //             }
    //             return updateRecord({ fields });
    //         })
    //         .then(() => {
    //             this.autoFinalisedMap[currentRecordId] = false;
    //             notifyRecordUpdateAvailable([{ recordId: currentRecordId }]);
    //             return refreshApex(this.wiredRecordsResult);
    //         })
    //         .then(() => {
    //             this.currentIndex = this.records.findIndex(rec => rec.Id === currentRecordId);
    //             if (this.currentIndex === -1) this.currentIndex = 0;
    //             this.record = this.records[this.currentIndex];

    //             this.needsFinalizationMap[this.record.Id] = false;
    //             this.showFinaliseModal = false;
    //             this.updateButtonState();
    //             this.checkIfAllFinalised();
    //         })
    //         .catch(error => {
    //             console.error('Error:', error);
    //             this.showToast('Error', 'Failed to finalize answer', 'error');
    //             //throw error;
    //         });
    // }
    handleSave() {
        if (!this.finalAnswer) {
            this.showToast('Warning', 'Please enter final answer before you finalize.', 'warning');
            return;
        }

        const canBypassStyle = this.shouldBypassStyleValidation;

        // If already styled once and not bypassing, show confirm modal
        if (this.record.IsStyled__c && !canBypassStyle && !this.skipStyleConfirmOnce) {
            this.showGenericModalWithConfig({
                title: 'Please Confirm',
                body:
                    'You’ve already styled this answer.<br/>' +
                    'Would you like to apply styling again before finalizing?',
                buttons: [
                    {
                        label: 'Cancel',
                        variant: 'neutral',
                        buttonClass: 'left-cancel',
                        action: this.closeGenericModal.bind(this)   
                    },
                    {
                        label: 'Proceed and Re-Style',
                        variant: 'brand',
                        buttonClass: 'right-button',
                        action: this.handleProceedAndReStyle.bind(this)
                    },
                    {
                        label: 'Skip and Finalise',
                        variant: 'neutral',
                        buttonClass: 'right-button',
                        action: this.handleSkipAndFinalise.bind(this)
                    }
                ]
            });
            return;
        }

        // If NOT styled and cannot bypass → force user into Style flow
        if (!this.record.IsStyled__c && !canBypassStyle) {
            this.isStyleFlowFromFinalise = true;
            this.handleStyleModal();
            return;
        }

        // Otherwise directly finalise (manual / short answer / already styled / bypass condition)
        this.finalizeAnswer(canBypassStyle);
    }
    closeGenericModal() {
        this.showGenericModal = false;
    }




    //existing save method
    // handleSave() {
    //     if (!this.finalAnswer) {
    //         this.showToast('Warning', 'Please enter final answer before you finalize.', 'warning');
    //         return;
    //     }

    //     const canBypassStyle = this.shouldBypassStyleValidation;

    //     //CR1
    //     if (this.record.IsStyled__c && !canBypassStyle && !this.skipStyleConfirmOnce) {
    //         this.showGenericModalWithConfig({
    //             title: 'Please Confirm',
    //             body:
    //                 'You’ve already styled this answer.<br/>' +
    //                 'Would you like to apply styling again before finalizing?',
    //             buttons: [
    //                 {
    //                     label: 'Proceed and Re-Style',
    //                     variant: 'brand',
    //                     action: this.handleProceedAndReStyle.bind(this)
    //                 },
    //                 {
    //                     label: 'Skip and Finalise',
    //                     variant: 'neutral',
    //                     action: this.handleSkipAndFinalise.bind(this)
    //                 }
    //             ]
    //         });
    //         return;
    //     }


    //     if (!this.record.IsStyled__c && !canBypassStyle) {
    //         this.showToast('Warning', 'This answer is not styled. Please style it before finalizing.', 'warning');
    //         return;
    //     }
    //     i

    //     const currentRecordId = this.record.Id;

    //     // Start tracking version FIRST
    //     trackVersion({
    //         questionId: currentRecordId,
    //         answer: this.finalAnswer,
    //         actionType: 'Final'
    //     })
    //         .then(() => {
    //             // THEN proceed with your EXISTING save flow unchanged
    //             return saveFinalAnswer({
    //                 rfpId: currentRecordId,
    //                 finalAnswer: this.finalAnswer
    //             });
    //         })
    //         .then(() => {
    //             this.showToast('Success', 'Answer is finalised and saved.', 'success');

    //             // Your existing finalization logic unchanged
    //             const fields = { Id: currentRecordId, IsFinalised__c: true };
    //             if (canBypassStyle) {
    //                 fields.IsStyled__c = true;
    //             }
    //             const recordInput = { fields };
    //             return updateRecord(recordInput);
    //         })
    //         .then(() => {
    //             notifyRecordUpdateAvailable([{ recordId: currentRecordId }]);
    //             return refreshApex(this.wiredRecordsResult);
    //         })
    //         .then(() => {
    //             this.currentIndex = this.records.findIndex(rec => rec.Id === currentRecordId);
    //             if (this.currentIndex === -1) this.currentIndex = 0;
    //             this.record = this.records[this.currentIndex];
    //             this.needsFinalizationMap[this.record.Id] = false;
    //             this.showFinaliseModal = false;
    //             this.updateButtonState();
    //             this.checkIfAllFinalised();
    //         })
    //         .catch(error => {
    //             console.error('Error:', error);
    //             this.showToast('Error', 'Failed to finalize answer', 'error');
    //         });
    // }


    renderedCallback() {

        if (this.showDiffView) {
            this.generateDiffView();
        }
        if (this.showStyleDiffView) {
            this.generateStyledDiffView();
        }
        if (this.showRevisedDiffView) {
            this.generateRevisedDiffView();
        }
        if (!this.isCustomSlotBody && this.showGenericModal) {
            const bodyEl = this.template.querySelector('[data-id="modalBodySlot"]');
            if (bodyEl && this.genericModalBody) {
                bodyEl.innerHTML = this.genericModalBody; // be careful with HTML
            }
        }
    }


    get diffToggleClass() {
        return this.isDiffStruck ? 'strike-toggle active' : 'strike-toggle';
    }



    toggleMainDiffView() {
        this.showMainDiffView = !this.showMainDiffView;
        if (this.showMainDiffView) {
            this.generateDiffView(); // This prepares diffedProposalGatewayResponse and diffedRephrasedResponse
        }
    }

    get mainDiffIconClass() {
        return `slds-m-right_small icon-hover-effect preview-icon strike-toggle ${this.showMainDiffView ? 'active' : ''}`;
    }

    toggleMergeDiffView() {
        this.showMergeDiffView = !this.showMergeDiffView;
        if (this.showMergeDiffView) {
            this.generateDiffView(); // Same function reused
        }
    }

    get mergeDiffIconClass() {
        return `icon-hover-effect preview-icon slds-m-left_x-small strike-toggle ${this.showMergeDiffView ? 'active' : ''}`;
    }

    toggleStyleDiffView() {
        this.showStyleDiffView = !this.showStyleDiffView;
        if (this.showStyleDiffView) {
            this.generateStyledDiffView();
        }
    }

    get stlyeDiffIconClass() {
        return `icon-hover-effect preview-icon slds-m-left_x-small strike-toggle ${this.showStyleDiffView ? 'active' : ''}`;
    }

    toggleRevisedDiffView() {
        this.showRevisedDiffView = !this.showRevisedDiffView;
        if (this.showRevisedDiffView) {
            this.generateRevisedDiffView();
        }
    }

    get revisedDiffIconClass() {
        return `icon-hover-effect preview-icon slds-m-left_x-small strike-toggle ${this.showRevisedDiffView ? 'active' : ''}`;
    }

    generateDiff(baseText, updatedText) {
        const diffParts = window.Diff.diffWordsWithSpace(baseText, updatedText);

        return {
            removed: this.formatRemovedOnlyDiff(diffParts),
            added: this.formatAddedOnlyDiff(diffParts)
        };
    }


    formatRemovedOnlyDiff(diffParts) {
        return diffParts.map(part => {
            if (part.removed) {
                return `<span style="background-color: #f3a6a6; text-decoration: line-through;">${part.value}</span>`;
            } else if (!part.added) {
                return `<span>${part.value}</span>`; // unchanged
            }
            return ''; // skip added parts
        }).join('');
    }

    formatAddedOnlyDiff(diffParts) {
        return diffParts.map(part => {
            if (part.added) {
                return `<span style="background-color: #a6f3a6;">${part.value}</span>`;
            } else if (!part.removed) {
                return `<span>${part.value}</span>`; // unchanged
            }
            return ''; // skip removed parts
        }).join('');
    }


    generateDiffView() {
        const base = this.record?.Revised_Response__c || this.record.Proposal_Gateway_Response__c;
        const updated = this.record?.Rephrased_Response__c || '';
        const result = this.generateDiff(base, updated);
        this.diffedProposalGatewayResponse = result.removed;
        this.diffedRephrasedResponse = result.added;
    }


    generateStyledDiffView() {
        const base = this.record?.Final_Answer__c || '';
        const updated = this.styleGuideResponse || '';
        const result = this.generateDiff(base, updated);
        this.diffedFinalAnswerResponse = result.removed;
        this.diffedStyledResponse = result.added;
    }


    generateRevisedDiffView() {
        const base = this.record?.Final_Answer__c || '';
        const updated = this.aiResponse || '';
        const result = this.generateDiff(base, updated);
        this.diffedRevisedFinalAnswerResponse = result.removed;
        this.diffedRevisededResponse = result.added;
    }

    // Search Functionality
    get showDropdown() {
        return this.searchKey && this.searchResults && this.searchResults.length > 0;
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value.trim();
        this.isSendDisabled = true;

        if (this.searchKey) {
            this.searchResults = this.originalRecords
                .filter(
                    rec =>
                        rec.RFP_Question_Number__c &&
                        rec.RFP_Question_Number__c
                            .toLowerCase()
                            .startsWith(this.searchKey.toLowerCase())
                )
                .map((rec, index) => {
                    return {
                        ...rec,
                        index,
                        dropdownStyle: `background-color: ${index % 2 === 0 ? '#ffffff' : '#f2f2f2'
                            }; color: black;`
                    };
                });
        } else {
            this.searchResults = [];
        }
    }


    searchedId = '';
    handleSelectResult(event) {
        this.searchKey = event.currentTarget.dataset.name;
        this.searchedId = event.currentTarget.dataset.id;
        this.searchResults = [];
        this.isSendDisabled = false;
    }


    async handleSendClick() {

        const isFinalised = this.record?.IsFinalised__c;
        const isSameAsSaved = this.finalAnswer === (this.record?.Final_Answer__c || '');

        if (!isFinalised && !this.shouldBypassSaveValidation && !isSameAsSaved) {
            this.showToast('Warning', 'Please save your answer before moving to another question.', 'warning');
            return;
        }


        // // Warn if answer not saved
        // if (this.finalAnswer !== (this.record?.Final_Answer__c || '')) {
        //     this.showToast('Warning', 'Please save your answer before moving to the next question.', 'warning');
        //     return;
        // }

        const selectedRecord = this.originalRecords.find(
            rec => rec.Id === this.searchedId
        );

        if (selectedRecord) {
            //  Check if the question is locked by someone else
            try {
                const result = await checkAndLockQuestion({ questionId: selectedRecord.Id });

                if (result.isLockedByOther) {
                    this.lockedByName = result.lockedByName;
                    this.showLockPopup = true;
                    return; // stop navigation
                }

                //  Proceed to load the question
                // First, unlock the current one if needed
                if (this.currentQuestionId) {
                    await unlockQuestion({ questionId: this.currentQuestionId });
                }

                this.record = selectedRecord;
                this.currentQuestionId = selectedRecord.Id;
                this.currentIndex = this.records.findIndex(rec => rec.Id === selectedRecord.Id);
                this.updateButtonState();

            } catch (error) {
                this.showToast('Error', error.body?.message || error.message, 'error');
            }
        }
    }

    markRecordAsNeedingFinalization() {
        if (this.record.IsFinalised__c && this.record.IsStyled__c) {
            this.needsFinalizationMap[this.record.Id] = true;
            // this.resetFinalisedAndStyledFlags(); // backend update
        }
    }

    get currentRecordNeedsFinalization() {
        return this.needsFinalizationMap[this.record?.Id] || false;
    }

    get isStyleButtonDisabled() {
        return !this.finalAnswer || this.finalAnswer.trim() === '' || this.record?.IsFinalised__c === true;
    }

    handleShowFinalisedTable() {
        this.summaryFilter = this.selectedFilter
        // this.isOpen = false;
        this.showFinalisedTable = true;
    }

    closeFinalisedTable() {
        this.showFinalisedTable = false;
        // this.isOpen = true;
    }


    handleQuestionClick(event) {
        // Warn if answer not saved
        const isFinalised = this.record?.IsFinalised__c;
        const isSameAsSaved = this.finalAnswer === (this.record?.Final_Answer__c || '');

        if (!isFinalised && !this.shouldBypassSaveValidation && !isSameAsSaved) {
            this.showToast('Warning', 'Please save your answer before moving to another question.', 'warning');
            return;
        }

        // if (this.finalAnswer !== (this.record?.Final_Answer__c || '')) {
        //     this.showToast('Warning', 'Please save your answer before moving to the next question.', 'warning');
        //     return;
        // }

        const selectedQuestionNumber = event.currentTarget.dataset.qid;
         if (this.selectedFilter !== this.summaryFilter) {
            this.selectedFilter = this.summaryFilter;
            this.applyFilter(true);
        }
        const selectedRecord = this.records.find(
            rec => rec.Id === selectedQuestionNumber
        );

        if (selectedRecord) {
            this.record = selectedRecord;
            this.currentQuestionId = selectedRecord.Id;
            this.currentIndex = this.records.findIndex(rec => rec.Id === selectedRecord.Id);
            this.updateButtonState();
            this.showFinalisedTable = false;
            this.isOpen = true;

            this.loadQuestion(this.currentQuestionId); // for lock logic
        } else {
            this.showToast('Error', `No record found for question ${selectedQuestionNumber}`, 'error');
        }
    }


    handleUnlock() {
        const currentRecordId = this.record.Id;
        //const currentIndex = this.currentIndex;
        const shouldSwitchToAll =  this.selectedFilter === 'Finalised' || this.selectedFilter === 'Finalised by AI';
       // let targetRecordId = null;
        
        const fields = {
            Id: currentRecordId,
            IsFinalised__c: false,
            Auto_Finalised_By_AI__c: false
            // IsStyled__c: false//commented as cr1
        };
        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                this.showToast('Success', 'Record is now unlocked.', 'success');
                this.record.IsFinalised__c = false;
                //this.record.issStyled = false;
                this.isLocked = false;
                 if (shouldSwitchToAll) {
                this.selectedFilter = 'All';
            }
                return refreshApex(this.wiredRecordsResult);

            })
            .then(() => {
                if (!this.records || this.records.length === 0) {
                    this.applyFilter(false);
                    this.currentIndex = 0;
                    this.record = null;
                    this.currentQuestionId = null;
                    this.disablePrev = true;
                    this.disableNext = true;
                    return;
                }
                let idx = this.records.findIndex(r => r.Id === currentRecordId);
                if (idx === -1) {
                    idx = 0;
                }
                this.currentIndex = idx;
                this.record = this.records[this.currentIndex];
                this.currentQuestionId = this.record.Id;
                this.updateButtonState();
            })
            .catch(error => {
                this.showToast('Error', 'Failed to unlock the record.', 'error');
                console.error(error);
            });
    }

    openProductsTable() {
        this.showProductsTable = !this.showProductsTable;
    }

    get displayAnswerLimit() {
        const limit = this.record?.Answer_size_limit__c;
        if (!limit) return null;

        const text = String(limit).trim();

        // 1) If the whole value is just a number (e.g. "50"), accept it.
        if (/^\d+$/.test(text)) return limit;

        // 2) Otherwise accept flexible phrases like "Max 300 words", "Limit: 150 characters", "200 chars", etc.
        const pattern = /\b(?:limit|max|answer\s*limit)?[:\s-]*\d+\s*(?:words?|characters?|chars?)\b/i;
        return pattern.test(text) ? limit : null;
    }


    get maxAnswerWordLimit() {
        const limit = this.record?.Answer_size_limit__c;
        if (!limit) return null;

        const text = String(limit).trim();

        // 1) If the whole value is just a number (e.g. "50")
        if (/^\d+$/.test(text)) return parseInt(text, 10);

        // 2) Otherwise match patterns like "200 words", "Max 150 chars", etc.
        const pattern = /\b\d+\s*(?:words?|characters?|chars?)\b/i;
        const match = text.match(pattern);

        return match ? parseInt(match[0].match(/\d+/)[0], 10) : null;
    }


    get isAnswerLimitExceeded() {
        const limit = this.maxAnswerWordLimit;
        return limit !== null && this.wordCount > limit;
    }

    get isFinalAnswerDisabled() {
        return this.record?.IsFinalised__c || this.isAnswerLimitExceeded;
    }


    async handleReGenerateAiResponse() {
        const currentRecordId = this.record.Id;
        this.isLoading = true;
        this.loadingMessage = 'Re-Generating in-progress...';

        try {
            setTimeout(() => {
                this.loadingMessage = 'Please wait while we Re-generate the answer...';
            }, 1500);
            setTimeout(() => {
                this.loadingMessage = 'Almost done...';
            }, 3000);

            const response = await reGenerateLLMhit({ rfpQandAId: currentRecordId, rfpId: this.opportunityiD });
            this.reGenerateResponse = response || 'No response received from AI.';
            notifyRecordUpdateAvailable([{ recordId: currentRecordId }]);
            await refreshApex(this.wiredRecordsResult);

            this.currentIndex = this.records.findIndex(rec => rec.Id === currentRecordId);
            if (this.currentIndex === -1) this.currentIndex = 0;
            this.record = this.records[this.currentIndex];
            this.updateButtonState();

        } catch (error) {
            console.error('Error calling AI:', error);
            this.showToast('Error', 'Failed to process AI response.', 'error');
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }

    // checkIfAllFinalised() {
    //     const allFinalised = this.records.every(rec => rec.IsFinalised__c === true);

    //     if (allFinalised && !this.hasShownFinalisePopup) {
    //         this.hasShownFinalisePopup = true; //  prevent showing again
    //         this.showGenericModalWithConfig({
    //             title: 'All Responses Finalised 🎉',
    //             body: 'All Responses have been finalised. Please go ahead and download the RFP as you like.',
    //             buttons: [{ label: 'Close', variant: 'neutral', action: this.handleCloseGenericModal.bind(this) }]
    //         });
    //     }
    // }
    checkIfAllFinalised() {
        if (this.selectedFilter !== 'All') {
            return;
        }

        const { all, notFinalised } = this.filterCounts;
        const allFinalised = all > 0 && notFinalised === 0;

        if (allFinalised && !this.hasShownFinalisePopup) {
            this.hasShownFinalisePopup = true;
            this.showGenericModalWithConfig({
                title: 'All Responses Finalised ',
                body: 'All Responses have been finalised. Please go ahead and download the RFP as you like.',
                buttons: [
                    {
                        label: 'Close',
                        variant: 'neutral',
                        action: this.handleCloseGenericModal.bind(this)
                    }
                ]
            });
        }
    }


}