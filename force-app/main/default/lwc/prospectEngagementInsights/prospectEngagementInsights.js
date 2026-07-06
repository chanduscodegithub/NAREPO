import { LightningElement, track, wire } from 'lwc';
//import sendPortfolioEngagementPrompt from '@salesforce/apex/ProspectEngagementInsightsController.sendPortfolioEngagementPrompt';
import getUserInfo from '@salesforce/apex/ProspectEngagementInsightsController.getUserInfo';
import getAccountIdsPerUser from '@salesforce/apex/ProspectEngagementInsightsController.getAccountIdsPerUser'
//import getPromptForTile from '@salesforce/apex/ProspectEngagementInsightsController.getPromptForTile';
//import getFilteredAccountsForTiles from '@salesforce/apex/ProspectEngagementInsightsController.getFilteredAccountsForTiles';
import getTierPicklistValues from '@salesforce/apex/ProspectEngagementInsightsController.getTierPicklistValues';
import getPromptDataForUser from '@salesforce/apex/ProspectEngagementInsightsController.getPromptDataForUser';
import getOverallPortfolioSummary from '@salesforce/apex/ProspectEngagementInsightsController.getOverallPortfolioSummary';




export default class ProspectEngagementInsights extends LightningElement {
    // @track isLoading = false;
    @track sections = [];
    @track canViewSvpTab = false;
    @track canViewQuad4Tab = false;
    @track activeTab = 'SVP';
    @track quad4Labels = [];
    @track svpLabels = [];
    @track showDropdown = false;
    selectedUsers = [];
    @track errorMessage = '';
    selectVal = 'svp';
    selectDateVal = '30';
    @track showTierDropdown = false;
    // @track selectedTiers = ['1 - Whales', '2 - Top Priority'];
    @track accountIdsPerUser = {};
    @track tierOptions = [];
    @track selectedTiers = [];

    @track tileData = {};
    @track isGenerating = false;
    @track overallSummary='';
    @track overallSummarySVP   = '';
@track overallSummaryQuad4 = '';

get hasOverallSummarySVP() {
    return !!this.overallSummarySVP;
}

get hasOverallSummaryQuad4() {
    return !!this.overallSummaryQuad4;
}
if (result) {
    this.overallSummary = result.trim();
    console.log('Overall summary set:', this.overallSummary); // ← check this
}




    productOptions = [
        { label: 'SVP top targets', value: 'svp' }
    ];
    /*tierOptions = [
        { label: '1 - Whales', value: '1 - Whales', selected: true },
        { label: '2 - Top Priority', value: '2 - Top Priority', selected: true },
        { label: '3 - Nurtures', value: '3 - Nurtures', selected: false }
    ];*/
    /*dateOptions = [
        { label: 'Last 30 Days', value: '30' },
        { label: 'Last 60 Days', value: '60' },
        { label: 'Last 90 Days', value: '90' }
    ];*/
    async loadTierOptions() {
        try {
            const values = await getTierPicklistValues();
            console.log('Tier values:', values);
            const defaultSelected = [
                '1 - Whales',
                '2 - Top Priority',
                '1-Sales Agreement in Effect',
                '2-Sales Prospect',
                '1-Territory Top List',
                '2-SVP Next 25 Prospect',
                '1-Prospect Status Review Pending',
                '2-Defunct or Duplicate Company'
            ];

            this.tierOptions = values.map(val => ({
                label: val,
                value: val,
                selected: defaultSelected.includes(val)
            }));
            this.selectedTiers = values.filter(val => defaultSelected.includes(val));

        } catch (e) {
            console.error('Error loading tiers:', e);
        }
    }

    async connectedCallback() {
        // this.isLoading = true;
        try {
            await this.loadTierOptions();
            const result = await getUserInfo();
            this.canViewQuad4Tab = result.canViewQuad4Tab;
            this.canViewSvpTab = result.canViewSvpTab;
            this.activeTab = result.defaultTeam;
            this.svpLabels = result.svpLabels1;
            this.quad4Labels = result.quad4Labels1;
            this.selectedUsers = [...this.currentLabels];
            this.overallSummarySVP   = '';
this.overallSummaryQuad4 = '';
            await this.loadAccountIds();
             await this.loadOverallSummary();
        }
        catch (e) {
            this.errorMessage = 'Failed to load access info: ' + e.body?.message || e.message;
            console.error(e);
        } finally {
            //this.isLoading = false;
        }
    }

    async loadAccountIds() {
        try {
            // use selected users or fall back to all labels
            const svpUsers = this.activeTab === 'SVP' ? (this.selectedUsers.length ? this.selectedUsers : this.svpLabels) : this.svpLabels;
            const quad4Users = this.activeTab === 'Quad4' ? (this.selectedUsers.length ? this.selectedUsers : this.quad4Labels) : this.quad4Labels;
            const result = await getAccountIdsPerUser({
                svpUserNames: svpUsers,
                quad4UserNames: quad4Users,
                tiers: this.selectedTiers
            });

            this.accountIdsPerUser = result;
            console.log('Account IDs:', JSON.stringify(result));
            await this.loadTileData();
        }
        catch (e) {
            console.error('Error in loadAccountIds:', e);
            throw e; // rethrow so connectedCallback finally runs
        }

    }

  async handleGenerateSummary(){
     try {
        // clear old data
        this.tileData = {};

        // fetch ONLY selected users with current filters
        await this.loadAccountIds();
        //  this.overallSummary = '';
        this.overallSummarySVP   = '';
        this.overallSummaryQuad4 = '';

            // step 1 — fetch per user tiles
           

            // step 2 — overall summary from tileData
            await this.loadOverallSummary();

    } catch(e) {
        console.error('Error generating summary:', e);
    } 

   }


    // ADD this new method
    /*async loadTileData() {
        for (const userKey of Object.keys(this.accountIdsPerUser)) {
            const accountIds = this.accountIdsPerUser[userKey];
            if (!accountIds || !accountIds.length) continue;
    
            try {
                const result = await getPromptDataForUser({
                    accountIds : accountIds,
                    dateRange  : this.selectDateVal
                });
    
                if (result) {
                    const clean  = result
                        .replace(/```json/g, '')
                        .replace(/```/g, '')
                        .trim();
                    const parsed = JSON.parse(clean);
                    this.tileData = { ...this.tileData, [userKey]: parsed };
                    console.log('Tile data for', userKey, parsed);
                }
    
            } catch(e) {
                console.error('Error for user:', userKey, e);
            }
        }
    }*/

        
    // async loadTileData() {
    //     for (const userKey of Object.keys(this.accountIdsPerUser)) {
    //         const accountIds = this.accountIdsPerUser[userKey];
    //         if (!accountIds || !accountIds.length) continue;

    //         try {
    //             console.log('Calling prompt for:', userKey, 'accountIds:', accountIds);

    //             const result = await getPromptDataForUser({
    //                 accountIds: accountIds  // just accountIds for now
    //             });
    //             console.log('Raw result type:', typeof result);
    //             console.log('Raw result:', result);
    //             if (result) {
    //                 // parse in separate method
    //                 summary = this.parseTileData(result, userKey);
    //                 //console.log('filteredLabels key:', key, 'summary:', summary);

    //                 if (summary) {
    //                     this.tileData = { ...this.tileData, [userKey]: summary };
    //                     console.log('Tile data for', userKey, summary);
    //                 }
    //             }

    //             /*if (result) {
    //                 const clean  = result
    //                     .replace(/```json/g, '')
    //                     .replace(/```/g, '')
    //                     .trim();
    //                 const parsed = JSON.parse(clean);
    //                 this.tileData = { ...this.tileData, [userKey]: parsed };
    //                 console.log('Tile data for', userKey, parsed);
    //             }*/

    //         } catch (e) {
    //             console.error('Error for user:', userKey, e);
    //         }
    //     }
    // }

//new
    async loadTileData() {
    for (const userKey of Object.keys(this.accountIdsPerUser)) {
        const accountIds = this.accountIdsPerUser[userKey];
        if (!accountIds || !accountIds.length) continue;

        try {
            console.log('Calling prompt for:', userKey, 'accountIds:', accountIds);

            const result = await getPromptDataForUser({
                accountIds: accountIds
            });

            console.log('Raw result type:', typeof result);
            console.log('Raw result:', result);

            if (result) {
                const summary = this.parseTileData(result, userKey);  // ← declare inside if
                console.log('Summary built:', summary);

                if (summary) {
                    this.tileData = { ...this.tileData, [userKey]: summary };
                    console.log('Stored summary for:', userKey);
                }
            }

        } catch(e) {
            console.error('Error for user:', userKey, e.message);
        }
    }
}
    parseTileData(rawResult, userKey) {
    try {
        // rawResult might be a string or already parsed
        let parsed;
        
        if (typeof rawResult === 'string') {
            // clean markdown if present
            const clean = rawResult
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            parsed = JSON.parse(clean);
        } else {
            parsed = rawResult;
        }

        console.log('Parsed object:', parsed);

        const summary = {
            totalEngagements       : parsed.totalEngagements || '',
            weightedEngagementScore: parsed.weightedEngagementScore || '',
            engagementRate         : parsed.engagementRate || '',
            summaryText            : parsed.summaryText || '',

            topChannels : parsed.Engagement_Channels_and_Performance__c?.['Top Performing Channels'] || [],
            lowChannels : parsed.Engagement_Channels_and_Performance__c?.['Low Performing Channels'] || [],

            topEngagedAccounts : parsed.topEngagedAccounts || [],
            lowEngagedAccounts : parsed.lowEngagedAccounts || [],

            contacts : Object.entries(parsed.Contacts_Engaged__c || {})
                .filter(([key]) => key !== 'totalUniqueContacts')
                .map(([name, val]) => ({
                    name : name,
                    title:val.title,
                    score: val.score || ''
                })),

            totalUniqueContacts : parsed.Contacts_Engaged__c?.totalUniqueContacts || '',

            channelMix : (parsed.channelMix || []).map(m => ({
                label : m.label,
                pct   : m.pct,
                //style : `width:${m.pct}%;background:#b0b0b0`
            })),

            keyTakeaways           : parsed.Key_Takeaways_and_Recommendations__c || [],
            outreachCadence        : parsed.outreachCadence || '',
            bestChannels           : parsed.Collective_Engagement_Insights__c?.['Best Performing Channels'] || [],
            underperformingChannels: parsed.Collective_Engagement_Insights__c?.['Underperforming Channels'] || []
        };

        console.log('Summary built:', summary);
        return summary;

    } catch(e) {
        console.error('Error parsing tile data for', userKey, e);
        return null;
    }
}

    get currentLabels() {
        return this.activeTab === 'SVP' ? this.svpLabels : this.quad4Labels;
    }
    get userOptions() {
        return this.currentLabels.map(label => ({
            label: label,
            value: label,
            selected: this.selectedUsers.includes(label),
            disabled: label.length === 1

        }));
    }

    get filteredLabels() {
        if (!this.selectedUsers.length) {
            return [];
        }
        return this.currentLabels.filter(label => this.selectedUsers.includes(label)).map(label => {
            const key = this.activeTab === 'SVP' ? 'SVP_' + label : 'QUAD4_' + label;
            return {
                label: label,
                accountIds: this.accountIdsPerUser[key] || [],
                summary: this.tileData[key] || null
            };
        });
    }
    /* get filteredLabels() {
         if (!this.selectedUsers.length)
             //return this.currentLabels;
         return [];
         return this.currentLabels.filter(label => this.selectedUsers.includes(label)).map(label => {
             const key = this.activeTab === 'SVP' ? 'SVP_' + label : 'QUAD4_' + label;
                         const summary = this.tileData[key] || null;
 
             return {
                 label: label,
                 accountIds: this.accountIdsPerUser[key] || [],
                 summary    : this.tileData[key] || null
 
             };
         });
 
 
     }*/
    /* get tierOptionsWithSelection() {
     return this.tierOptions.map(tier => ({
         ...tier,
         isSelected: this.selectedTiers.includes(tier.value)
     }));
 }*/

    toggleTierDropdown() {
        this.showTierDropdown = !this.showTierDropdown;
    }
    handleTierMouseLeave() {
        this.showTierDropdown = false;
    }
    /*handleTierSelection(e) {
        const val = e.target.dataset.value;
        if (e.target.checked) {
            this.selectedTiers = [...this.selectedTiers, val];
        } else {
            this.selectedTiers = this.selectedTiers.filter(t => t !== val);
        }
    }*/
    handleTierSelection(e) {
        const val = e.target.dataset.value;
        const checked = e.target.checked;
        // update tierOptions to re-render checkboxes
        this.tierOptions = this.tierOptions.map(t => ({
            ...t,
            selected: t.value === val ? checked : t.selected
        }));

        // update selectedTiers array
        if (checked) {
            this.selectedTiers = [...this.selectedTiers, val];
        } else {
            this.selectedTiers = this.selectedTiers.filter(t => t !== val);
        }
    }
    /*get selectedUsersLabel() {
        const users = this.selectedUsers.length ? this.selectedUsers : this.currentLabels;
        if (users.length === 0) {
            return 'Select Users';
        }
        if (users.length <= 2) {
            return users.join(', ');
        }
        return `${users[0]}, ${users[1]} +${users.length - 2}`;
    }*/
    get selectedTiersLabel() {
        if (!this.selectedTiers.length)
            return 'choose tier';
        if (this.selectedTiers.length <= 2) {
            return this.tierOptions.filter(t => this.selectedTiers.includes(t.value)).map(t => t.label).join(', ');
        }
        //return this.selectedTiers[0],this.selectedTiers[1]+this.selectedTiers.length-2;
        return `${this.selectedTiers[0]}, ${this.selectedTiers[1]} +${this.selectedTiers.length - 2}`;

    }


    get selectedValues() {
        return this.value.join(',');
    }
    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
    }


    handleMouseLeave() {
        this.showDropdown = false;
    }

    //for date filters
    handleDateChange(e) {

        this.selectDateVal = e.detail.value;
    }

    handleChange(e) {
        this.value = e.detail.value;
    }


    get selectedUsersLabel() {
        const users = this.selectedUsers.length ? this.selectedUsers : this.currentLabels;
        if (users.length === 0) {
            return 'Select Users';
        }
        if (users.length <= 2) {
            return users.join(', ');
        }
        return `${users[0]}, ${users[1]} +${users.length - 2}`;
    }
    handleUserSelection(event) {
        const value = event.target.dataset.value;
        if (event.target.checked) {
            this.selectedUsers = [
                ...this.selectedUsers,
                value
            ];

        } else {

            this.selectedUsers =
                this.selectedUsers.filter(
                    item => item !== value
                );
        }

        console.log(
            'Selected',
            this.selectedUsers
        );
    }


    /* get selectedUsersLabel() {
 
         if (this.selectedUsers.length <= 2) {
             return this.selectedUsers.join(', ');
         }
 
         return `${this.selectedUsers[0]}, ${this.selectedUsers[1]} +${this.selectedUsers.length - 2}`;
     }*/


    get showSVPTab() {
        return this.canViewSvpTab;
    }
    get showQuad4Tab() {
        return this.canViewQuad4Tab;
    }
    get hasError() {
        return !!this.errorMessage;
    }

    async handleTabChange(event) {
        this.activeTab = event.target.value;
        this.showDropdown = false;

        this.selectedUsers = [...this.currentLabels];

    }


    // ── LOAD OVERALL SUMMARY ──────────────────────────────────────────────
  async loadOverallSummary() {
    try {
        let svpText   = '';
        let quad4Text = '';

        for (const userKey of Object.keys(this.tileData)) {
            const s = this.tileData[userKey];
            if (!s) continue;

            const userName = userKey
                .replace('SVP_', '')
                .replace('QUAD4_', '');
            const isSVP = userKey.startsWith('SVP_');

            let userText = '';
            userText += `\n${isSVP ? 'SVP' : 'Quad4'}: ${userName}\n`;
            userText += `Total Engagements: ${s.totalEngagements || '0'}\n`;
            userText += `WES: ${s.weightedEngagementScore || '0'}\n`;
            userText += `Engagement Rate: ${s.engagementRate || '0%'}\n`;

            if (s.topChannels?.length) {
                userText += `Top Channels: ${
                    s.topChannels
                     .map(c => c.channel +
                        ' (volume: ' + c.volume +
                        ', response: ' + c.responseRate + ')')
                     .join(', ')
                }\n`;
            }
            if (s.lowChannels?.length) {
                userText += `Low Channels: ${
                    s.lowChannels
                     .map(c => c.channel +
                        ' (volume: ' + c.volume +
                        ', response: ' + c.responseRate + ')')
                     .join(', ')
                }\n`;
            }
            if (s.topEngagedAccounts?.length) {
                userText += `Top Accounts: ${
                    s.topEngagedAccounts
                     .map(a => a.name +
                        ' (' + a.industry +
                        ', ' + a.tier + ')')
                     .join(', ')
                }\n`;
            }
            if (s.lowEngagedAccounts?.length) {
                userText += `Low Accounts: ${
                    s.lowEngagedAccounts
                     .map(a => a.name + ' - ' + a.reason)
                     .join(', ')
                }\n`;
            }
            if (s.channelMix?.length) {
                userText += `Channel Mix: ${
                    s.channelMix
                     .map(m => m.label + ': ' + m.pct + '%')
                     .join(', ')
                }\n`;
            }
            userText += '\n';

            // separate into SVP or Quad4
            if (isSVP) {
                svpText += userText;
            } else {
                quad4Text += userText;
            }
        }

        // call Einstein for SVP overall
        if (svpText.trim()) {
            console.log('SVP overall input:', svpText);
            const svpResult = await getOverallPortfolioSummary({
                userSummariesJson: svpText
            });
            if (svpResult) {
                this.overallSummarySVP = svpResult.trim();
            }
        }

        // call Einstein for Quad4 overall
        if (quad4Text.trim()) {
            console.log('Quad4 overall input:', quad4Text);
            const quad4Result = await getOverallPortfolioSummary({
                userSummariesJson: quad4Text
            });
            if (quad4Result) {
                this.overallSummaryQuad4 = quad4Result.trim();
            }
        }

    } catch(e) {
        console.error('Error loading overall summary:', e.message);
    }
}




    //overall summary 
   /*  async loadOverallSummary() {
        try {
            // build text from tileData
            let userSummariesText = '';

            for (const userKey of Object.keys(this.tileData)) {
                const s = this.tileData[userKey];
                if (!s) continue;

                const userName = userKey
                    .replace('SVP_', '')
                    .replace('QUAD4_', '');
                const userType = userKey.startsWith('SVP_') 
                    ? 'SVP' : 'Quad4';

                userSummariesText += `\n${userType}: ${userName}\n`;
                userSummariesText += `Total Engagements: ${s.totalEngagements || '0'}\n`;
                userSummariesText += `WES: ${s.weightedEngagementScore || '0'}\n`;
                userSummariesText += `Engagement Rate: ${s.engagementRate || '0%'}\n`;

                if (s.topChannels?.length) {
                    userSummariesText += `Top Channels: ${
                        s.topChannels
                         .map(c => c.channel + 
                            ' (volume: ' + c.volume + 
                            ', response: ' + c.responseRate + ')')
                         .join(', ')
                    }\n`;
                }

                if (s.lowChannels?.length) {
                    userSummariesText += `Low Channels: ${
                        s.lowChannels
                         .map(c => c.channel + 
                            ' (volume: ' + c.volume + 
                            ', response: ' + c.responseRate + ')')
                         .join(', ')
                    }\n`;
                }

                if (s.topEngagedAccounts?.length) {
                    userSummariesText += `Top Accounts: ${
                        s.topEngagedAccounts
                         .map(a => a.name + 
                            ' (' + a.industry + 
                            ', ' + a.tier + ')')
                         .join(', ')
                    }\n`;
                }

                if (s.lowEngagedAccounts?.length) {
                    userSummariesText += `Low Accounts: ${
                        s.lowEngagedAccounts
                         .map(a => a.name + ' - ' + a.reason)
                         .join(', ')
                    }\n`;
                }

                if (s.channelMix?.length) {
                    userSummariesText += `Channel Mix: ${
                        s.channelMix
                         .map(m => m.label + ': ' + m.pct + '%')
                         .join(', ')
                    }\n`;
                }

                userSummariesText += '\n';
            }

            if (!userSummariesText.trim()) {
                console.log('No tile data for overall summary');
                return;
            }

            console.log('Overall summary input text:', userSummariesText);

            const result = await getOverallPortfolioSummary({
                userSummariesJson: userSummariesText
            });

            if (result) {
                this.overallSummary = this.parseOverallSummary(result);
                console.log('Overall summary:', this.overallSummary);
            }

        } catch(e) {
            console.error('Error loading overall summary:', e.message);
        }
    }*/

    // ── PARSE OVERALL SUMMARY ─────────────────────────────────────────────
   /* parseOverallSummary(rawResult) {
        try {
            const clean = rawResult
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            return JSON.parse(clean);
        } catch(e) {
            console.error('Error parsing overall summary:', e);
            return null;
        }
    }*/

    // ── GENERATE SUMMARY BUTTON ───────────────────────────────────────────
   /* async handleGenerateSummary() {
        this.isLoading       = true;
        this.isGenerating    = true;
        this.summaryGenerated = false;
        try {
            // clear old data
            this.tileData       = {};
            //this.overallSummary = null;
             this.overallSummary = '';

            // step 1 — fetch per user tiles
            await this.loadAccountIds();

            // step 2 — overall summary from tileData
            await this.loadOverallSummary();

            this.summaryGenerated = true;

        } catch(e) {
            console.error('Error generating summary:', e);
        } finally {
            this.isLoading    = false;
            this.isGenerating = false;
        }
    }*/













}