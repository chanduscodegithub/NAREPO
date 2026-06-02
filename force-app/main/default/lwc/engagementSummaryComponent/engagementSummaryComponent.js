import { LightningElement, api, wire, track } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import ENGAGEMENT_DASHBOARD_URL from '@salesforce/label/c.Engagement_Dashboard_URL';


import getEngagementSummary from '@salesforce/apex/EngagementSummaryController.getEngagementSummary';
import sendEngagementPrompt from '@salesforce/apex/EngagementSummaryController.sendEngagementPrompt';
import recalculateEngagementScore from '@salesforce/apex/EngagementScoreTriggerHandler.recalculateEngagementScore';
import getAccountDetails from '@salesforce/apex/EngagementSummaryController.getAccountDetails';

export default class EngagementSummaryComponent extends LightningElement {
    //@track isLoading = false;
    @api recordId;
    isModalOpen = false;
    engagementData;
    isLoading = true;
    error;
    animating = false;
    isGenerating = false;
    lastRunDate = '';
    isEmpty;
    accountName;
    @track errorMessage;
    @track isSummaryLoading = false;
     engagementDashboardLink = ENGAGEMENT_DASHBOARD_URL;  

    connectedCallback() {
        console.log('Component connected, recordId:', this.recordId);
        // If recordId is undefined or null, that could be your issue
    }


    @wire(getAccountDetails, { accountId: '$recordId' })
    wiredAccount(result) {
        try {
            console.log('Record ID:', this.recordId);
            console.log('Wire function called');
            const { error, data } = result;
            this.isLoading = false;
            if (data) {
                this.accountName = data.Name;
                this.error = undefined;
                console.log(data);
                console.log('This is the account name:', this.accountName);
            } else if (error) {
                this.errorMessage = error;
            }
        } catch (e) {
            console.error('Exception in wire function:', e);
        }
    }


    // Store the wired result for refreshApex
    wiredEngagementResult;

    // For slider functionality
    currentSlideIndex = 0;
    channelContactsData = [];

    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }


    @api temphandleOpenModal(msg) {
        this.isModalOpen = msg;
    }
    @api refreshChildComponent() {
        console.log('Refreshing Child Component...');
        refreshApex(this.wiredEngagementResult);
    }

    handleOpenModal() {
        this.isModalOpen = true;
    }

    handleClose() {
        console.log('Close');
        this.isModalOpen = false;
        const event = new CustomEvent('notify', { detail: { 'message': this.isModalOpen } });
        this.dispatchEvent(event);
    }

    // Track which sections are open
    activeSections = ['channels'];
    sectionsData = {}; // Will store all processed section data

    @wire(getEngagementSummary, { accountId: '$recordId' })
    wiredEngagementData(result) {
        this.wiredEngagementResult = result;

        const { error, data } = result;
        this.isLoading = false;
        if (data) {
            if (Object.keys(data).length === 0 ||
                (Object.keys(data).length === 1 && data.__metadata)) {
                // If the data object is empty or contains only metadata, show empty message
                this.isEmpty = true;
            } else {
                this.isEmpty = false;


                // Extract metadata if it exists
                if (data.__metadata && data.__metadata.lastRunDate) {
                    this.lastRunDate = data.__metadata.lastRunDate;
                } else {
                    this.lastRunDate = 'Never';
                }

                // Create a filtered copy of the data without metadata
                const filteredData = {};
                Object.keys(data).forEach(key => {
                    if (key !== '__metadata') {
                        filteredData[key] = data[key];
                    }
                });

                this.engagementData = filteredData;

                // NEW: check if all sections are null/empty
                const hasValidContent = Object.values(this.engagementData).some(section => {
                    if (!section) return false;
                    if (Array.isArray(section)) return section.length > 0;
                    if (typeof section === 'object') return Object.keys(section).length > 0;
                    return true;
                });

                if (!hasValidContent) {
                    this.errorMessage = 'There was some error processing the engagement summary.';
                    this.engagementData = undefined;
                    return;
                }



                this.processData();
                this.error = undefined;

                // Initialize slider after data is processed
                this.initializeSlider();
            }
        } else if (error) {
            this.error = error;
            this.engagementData = undefined;
            this.lastRunDate = 'Error retrieving date';
            console.error('Error fetching engagement data', error);
        }
    }
    // Modified method to use refreshApex
    handleGenerateSummary() {
        this.isGenerating = true;
        this.isSummaryLoading = true;
        this.error = undefined;

        // Step 1: Recalculate Engagement Score
        recalculateEngagementScore({ accountId: this.recordId })
            .then(() => {
                console.log('Engagement Score Recalculated');
                return sendEngagementPrompt({ recId: this.recordId });
            })
            .then((result) => {
                if (result) {
                    return refreshApex(this.wiredEngagementResult);
                }
                throw new Error('Failed to generate summary');
            })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Engagement summary generated successfully',
                        variant: 'success'
                    })
                );
                //Dispatch event to parent for refresh
                this.dispatchEvent(new CustomEvent('refreshparent'));
            })
            .catch((error) => {
                this.error = error;
                console.error('Error generating engagement summary', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Failed to generate engagement summary: ' + (error.body?.message || error.message),
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.isGenerating = false;
                this.isSummaryLoading = false;
            });
    }

    // Process data into a more usable format for the template
    processData() {
        if (!this.engagementData) return;

        // Clear existing data
        this.sectionsData = {};

        // Process each section dynamically
        Object.keys(this.engagementData).forEach(sectionKey => {
            const sectionData = this.engagementData[sectionKey];
            const sectionId = this.getSectionId(sectionKey);

            // Initialize section if it doesn't exist
            if (!this.sectionsData[sectionId]) {
                this.sectionsData[sectionId] = {
                    id: sectionId,
                    label: sectionKey,
                    cards: [],
                    isChannelSection: sectionKey === 'Preferred Channels for our Top Contacts',
                    isTopEngagedSection: sectionKey === 'Top Engaged Contacts'
                };
            }

            if (sectionKey === 'Key Takeaways & Recommendations') {
                //this.sectionsData[sectionId].items = sectionData; // Direct array of items
                this.sectionsData[sectionId].items = sectionData && sectionData.length > 0 ? sectionData : [];//new

            }
            else if (sectionKey === 'Preferred Channels for our Top Contacts') {
                // Store the data for the slider
                this.sectionsData[sectionId].hasSlider = true;

                // Reset channelContactsData before processing
                this.channelContactsData = [];

                // Process cards for slider
                /* Object.keys(sectionData).forEach(cardKey => {
                     this.channelContactsData.push({
                         title: cardKey,
                         icon: this.getIconForTitle(cardKey, sectionKey),
                         items: sectionData[cardKey],
                         //hasItems: sectionData[cardKey] && sectionData[cardKey].length > 0 //new
                     });
                 });*/
                Object.keys(sectionData).forEach(cardKey => {
                    const items = sectionData[cardKey];
                    const hasItems = Array.isArray(items)
                        ? items.length > 0
                        : (items && Object.keys(items).length > 0);

                    this.channelContactsData.push({
                        title: cardKey,
                        icon: this.getIconForTitle(cardKey, sectionKey),
                        items: items,
                        hasItems: hasItems
                    });
                });

                // Store the slider data in the section
                this.sectionsData[sectionId].sliderData = this.channelContactsData;
            }
            else if (sectionKey === 'Top Engaged Contacts') {
                // Process contact data
                const contactData = [];

                Object.entries(sectionData).forEach(([name, contactInfo]) => {
                    const score = contactInfo.score;
                    const hue = this.calculateHue(score);
                    const scoreStyle = `background: conic-gradient(hsl(${hue}, 70%, 50%) ${score}%, #f5f5f5 ${score}%);`;

                    contactData.push({
                        name,
                        title: contactInfo.title,
                        email: contactInfo.email,
                        photoUrl: contactInfo.photoUrl,
                        score,
                        scoreStyle
                    });
                });

                // Store the contact data in the section
                this.sectionsData[sectionId].contactData = contactData;
            }
            else {
                // Process cards within the section
                Object.keys(sectionData).forEach(cardKey => {
                    this.sectionsData[sectionId].cards.push({
                        title: cardKey,
                        icon: this.getIconForTitle(cardKey, sectionKey),
                        items: sectionData[cardKey],
                        hasItems: sectionData[cardKey] && sectionData[cardKey].length > 0 //new
                    });
                });
            }
        });
    }

    // Calculate color hue based on score (0-100)
    calculateHue(score) {
        // 0 = red (0), 50 = yellow (60), 100 = green (120)
        return Math.min(score * 1.2, 120); // Cap at 120 (green)
    }

    // Get computed CSS class for generate button
    get generateButtonClass() {
        return this.isGenerating ? 'generate-summary-btn button-loading' : 'generate-summary-btn';
    }

    getSectionId(sectionName) {
        return sectionName.toLowerCase()
            .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric with underscore
            .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    }

    getIconForTitle(title, section) {
        const titleLower = title.toLowerCase().trim();
        const sectionLower = section.toLowerCase().trim();

        if (sectionLower.includes('preferred channels')) {
            if (titleLower.includes('email')) return 'standard:email';
            if (titleLower.includes('phone')) return 'standard:call';
            if (titleLower.includes('meeting')) return 'standard:event';
            if (titleLower.includes('social')) return 'standard:social';
            if (titleLower.includes('chat')) return 'standard:messaging_conversation';
            return 'standard:contact_list';
        }

        if (titleLower.includes('top engaged contacts')) {
            return 'standard:groups';
        }

        if (titleLower.includes('top performing')) {
            return 'standard:goals';  // Better visual for success
        } else if (titleLower.includes('best performing')) {
            return 'standard:investment_account';
        } else if (titleLower.includes('low performing')) {
            return 'standard:product_consumed';  // Simple downward arrow for clarity
        } else if (titleLower.includes('underperforming')) {
            return 'standard:problem';  // Highlights an issue clearly
        }

        return 'standard:insights';
    }

    get sections() {
        return Object.values(this.sectionsData);
    }

    handleSectionToggle(event) {
        this.activeSections = event.detail.openSections;
    }

    get currentSlide() {
        return this.channelContactsData.length > 0 ?
            this.channelContactsData[this.currentSlideIndex] : null;
    }

    get hasMultipleSlides() {
        return this.channelContactsData.length > 1;
    }

    get slideIndicators() {
        return this.channelContactsData.map((_, index) => ({
            id: index,
            class: index === this.currentSlideIndex ? 'active' : ''
        }));
    }

    initializeSlider() {
        this.currentSlideIndex = 0;

        // If there's at least one slide, start auto-rotation
        if (this.channelContactsData && this.channelContactsData.length > 1) {
            this.stopSliderAutoRotation();
            this.startSliderAutoRotation();
        }
    }

    handlePreviousSlide() {
        if (this.animating) return;
        this.animating = true;

        this.currentSlideIndex = (this.currentSlideIndex - 1 + this.channelContactsData.length) % this.channelContactsData.length;

        setTimeout(() => {
            this.animating = false;
        }, 400);
    }

    handleNextSlide() {
        if (this.animating) return;
        this.animating = true;

        this.currentSlideIndex = (this.currentSlideIndex + 1) % this.channelContactsData.length;

        setTimeout(() => {
            this.animating = false;
        }, 400);
    }

    handleSlideSelect(event) {
        if (this.animating) return;

        const slideIndex = parseInt(event.currentTarget.dataset.index, 10);
        if (!isNaN(slideIndex) && slideIndex !== this.currentSlideIndex) {
            this.animating = true;
            this.currentSlideIndex = slideIndex;

            setTimeout(() => {
                this.animating = false;
            }, 400);
        }
    }

    startSliderAutoRotation() {
        // if (this.channelContactsData.length > 1) {
        //     this._sliderInterval = setInterval(() => {
        //         this.handleNextSlide();
        //     }, 15000);
        // }
    }

    stopSliderAutoRotation() {
        // if (this._sliderInterval) {
        //     clearInterval(this._sliderInterval);
        // }
    }

    disconnectedCallback() {
        this.stopSliderAutoRotation();
    }
}