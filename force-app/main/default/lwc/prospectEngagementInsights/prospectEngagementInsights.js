import { LightningElement,track } from 'lwc';
import sendPortfolioEngagementPrompt from '@salesforce/apex/ProspectEngagementInsightsController.sendPortfolioEngagementPrompt';

export default class ProspectEngagementInsights extends LightningElement {
    @track summary;
    @track errorMessgae;
    @track isLoading = false;
    @track sections = [];
    generateSummary(){
         this.isLoading = true;
        this.errorMessage = null;
        this.summary = null;
                sendPortfolioEngagementPrompt()
                .then(result =>{
                     this.summary = result.finalContent;
                     const responseData = JSON.parse(result.finalContent);
                     this.sections =this.buildSections(responseData);

                })
                .catch(error => {

                this.errorMessage =
                    error?.body?.message ||
                    error.message;

            })

            .finally(() => {

                this.isLoading = false;

            });

    }

getScoreStyle(score) {

    let value = Number(score);

    if (value >= 90) {
        return 'score-high';
    }

    if (value >= 70) {
        return 'score-medium';
    }

    return 'score-low';
}

    buildSections(data) {

    let sections = [];

    /*
     * Top Engaged Contacts
     */
    let contactData = [];

    if (data.Contacts_Engaged__c) {

        Object.keys(data.Contacts_Engaged__c)
            .forEach(contactName => {

                const contact =
                    data.Contacts_Engaged__c[
                        contactName
                    ];

                contactData.push({
                    name: contactName,
                    title: contact.title || '',
                    email: contact.email || '',
                    score: contact.score || '',
                    scoreStyle:
                        this.getScoreStyle(
                            contact.score
                        )
                });

            });

        sections.push({
            id: 'topContacts',
            label: 'Top Engaged Contacts',
            isTopEngagedSection: true,
            contactData: contactData
        });
    }

    /*
     * Engagement Channels
     */
    sections.push({
        id: 'channelPerformance',
        label:
            'Engagement Channels & Performance',
        cards: [
            {
                title:
                    'Top Performing Channels',
                icon: 'utility:favorite',
                hasItems: true,
                items:
                    data
                        ?.Engagement_Channels_and_Performance__c
                        ?.['Top Performing Channels']
                        || []
            },
            {
                title:
                    'Low Performing Channels',
                icon: 'utility:warning',
                hasItems: true,
                items:
                    data
                        ?.Engagement_Channels_and_Performance__c
                        ?.['Low Performing Channels']
                        || []
            }
        ]
    });

    /*
     * Preferred Channels
     */
    let sliderData = [];

    if (
        data
            ?.Preferred_Channels_by_Top_Contacts__c
    ) {

        Object.keys(
            data
                .Preferred_Channels_by_Top_Contacts__c
        ).forEach(contactName => {

            sliderData.push({
                title: contactName,
                icon: 'utility:user',
                hasItems: true,
                items:
                    data
                        .Preferred_Channels_by_Top_Contacts__c[
                            contactName
                        ]
            });

        });

        sections.push({
            id: 'preferredChannels',
            label:
                'Preferred Channels by Top Contacts',
            hasSlider: true,
            sliderData: sliderData
        });
    }

    /*
     * Collective Insights
     */
    sections.push({
        id: 'collectiveInsights',
        label:
            'Collective Engagement Insights',
        cards: [
            {
                title:
                    'Best Performing Channels',
                icon: 'utility:success',
                hasItems: true,
                items:
                    data
                        ?.Collective_Engagement_Insights__c
                        ?.['Best Performing Channels']
                        || []
            },
            {
                title:
                    'Underperforming Channels',
                icon: 'utility:warning',
                hasItems: true,
                items:
                    data
                        ?.Collective_Engagement_Insights__c
                        ?.['Underperforming Channels']
                        || []
            }
        ]
    });

    /*
     * Recommendations
     */
    sections.push({
        id: 'recommendations',
        label:
            'Key Takeaways & Recommendations',
        items:
            data
                ?.Key_Takeaways_and_Recommendations__c
                || []
    });

    return sections;
}

}