import { LightningElement, track } from 'lwc';
import getUserInfo from '@salesforce/apex/ProspectEngagementInsightsController.getUserInfo';
import getAccountIdsPerUser from '@salesforce/apex/ProspectEngagementInsightsController.getAccountIdsPerUser';
import getTierPicklistValues from '@salesforce/apex/ProspectEngagementInsightsController.getTierPicklistValues';
import getPromptDataForUser from '@salesforce/apex/ProspectEngagementInsightsController.getPromptDataForUser';
import getOverallPortfolioSummary from '@salesforce/apex/ProspectEngagementInsightsController.getOverallPortfolioSummary';

export default class ProspectEngagementInsights extends LightningElement {

    @track sections          = [];
    @track canViewSvpTab     = false;
    @track canViewQuad4Tab   = false;
    @track activeTab         = 'SVP';
    @track quad4Labels       = [];
    @track svpLabels         = [];
    @track showDropdown      = false;
    @track errorMessage      = '';
    @track showTierDropdown  = false;
    @track accountIdsPerUser = {};
    @track tierOptions       = [];
    @track selectedTiers     = [];
    @track tileData          = {};
    @track isGenerating      = false;
    @track isLoading         = false;
    @track overallSummarySVP   = '';
    @track overallSummaryQuad4 = '';

    selectedUsers  = [];
    selectVal      = 'svp';
    selectDateVal  = '30';

    productOptions = [{ label: 'SVP top targets', value: 'svp' }];

    // ── GETTERS ───────────────────────────────────────────────────────────
    get hasOverallSummarySVP()   { return !!this.overallSummarySVP; }
    get hasOverallSummaryQuad4() { return !!this.overallSummaryQuad4; }
    get showSVPTab()             { return this.canViewSvpTab; }
    get showQuad4Tab()           { return this.canViewQuad4Tab; }
    get hasError()               { return !!this.errorMessage; }

    get currentLabels() {
        return this.activeTab === 'SVP' ? this.svpLabels : this.quad4Labels;
    }

    get userOptions() {
        return this.currentLabels.map(label => ({
            label   : label,
            value   : label,
            selected: this.selectedUsers.includes(label),
            disabled: label.length === 1
        }));
    }

    get filteredLabels() {
        if (!this.selectedUsers.length) return [];
        return this.currentLabels
            .filter(label => this.selectedUsers.includes(label))
            .map(label => {
                const key = this.activeTab === 'SVP'
                    ? 'SVP_' + label
                    : 'QUAD4_' + label;
                return {
                    label     : label,
                    accountIds: this.accountIdsPerUser[key] || [],
                    summary   : this.tileData[key] || null
                };
            });
    }

    get selectedTiersLabel() {
        if (!this.selectedTiers.length) return 'choose tier';
        if (this.selectedTiers.length <= 2) {
            return this.tierOptions
                .filter(t => this.selectedTiers.includes(t.value))
                .map(t => t.label).join(', ');
        }
        return `${this.selectedTiers[0]}, ${this.selectedTiers[1]} +${this.selectedTiers.length - 2}`;
    }

    get selectedUsersLabel() {
        const users = this.selectedUsers.length ? this.selectedUsers : this.currentLabels;
        if (!users.length) return 'Select Users';
        if (users.length <= 2) return users.join(', ');
        return `${users[0]}, ${users[1]} +${users.length - 2}`;
    }

    get selectedValues() {
        return this.value ? this.value.join(',') : '';
    }

    // ── TIER OPTIONS ──────────────────────────────────────────────────────
    async loadTierOptions() {
        try {
            const values = await getTierPicklistValues();
            const defaultSelected = [
                '1 - Whales', '2 - Top Priority',
                '1-Sales Agreement in Effect', '2-Sales Prospect',
                '1-Territory Top List', '2-SVP Next 25 Prospect',
                '1-Prospect Status Review Pending', '2-Defunct or Duplicate Company'
            ];
            this.tierOptions = values.map(val => ({
                label: val, value: val,
                selected: defaultSelected.includes(val)
            }));
            this.selectedTiers = values.filter(val => defaultSelected.includes(val));
        } catch(e) {
            console.error('Error loading tiers:', e);
        }
    }

    // ── CONNECTED CALLBACK ────────────────────────────────────────────────
    async connectedCallback() {
        this.isLoading = true;
        try {
            await this.loadTierOptions();
            const result         = await getUserInfo();
            this.canViewQuad4Tab = result.canViewQuad4Tab;
            this.canViewSvpTab   = result.canViewSvpTab;
            this.activeTab       = result.defaultTeam;
            this.svpLabels       = result.svpLabels1;
            this.quad4Labels     = result.quad4Labels1;
            this.selectedUsers   = [...this.currentLabels];

            // fetch for default tab on load
            await this.fetchDataForCurrentTab();

        } catch(e) {
            this.errorMessage = 'Failed to load: ' + (e.body?.message || e.message);
            console.error(e);
        } finally {
            this.isLoading = false;
        }
    }

    // ── FETCH DATA FOR CURRENT TAB ────────────────────────────────────────
    // single method that fetches tiles + overall for current tab
    async fetchDataForCurrentTab() {
        await this.loadAccountIds();
        await this.loadOverallSummary();
    }

    // ── LOAD ACCOUNT IDS ──────────────────────────────────────────────────
    async loadAccountIds() {
        try {
            const svpUsers = this.activeTab === 'SVP'
                ? (this.selectedUsers.length ? this.selectedUsers : this.svpLabels)
                : this.svpLabels;
            const quad4Users = this.activeTab === 'Quad4'
                ? (this.selectedUsers.length ? this.selectedUsers : this.quad4Labels)
                : this.quad4Labels;

            console.log('SVP users:', svpUsers);
            console.log('Quad4 users:', quad4Users);

            const result = await getAccountIdsPerUser({
                svpUserNames   : svpUsers,
                quad4UserNames : quad4Users,
                tiers          : this.selectedTiers
            });

            this.accountIdsPerUser = result;
            console.log('Account IDs:', JSON.stringify(result));
            await this.loadTileData();

        } catch(e) {
            console.error('Error in loadAccountIds:', e);
            throw e;
        }
    }

    // ── LOAD TILE DATA ────────────────────────────────────────────────────
    async loadTileData() {
        for (const userKey of Object.keys(this.accountIdsPerUser)) {
            const accountIds = this.accountIdsPerUser[userKey];
            if (!accountIds || !accountIds.length) continue;
            try {
                console.log('Calling prompt for:', userKey);
                const result = await getPromptDataForUser({ accountIds });
                if (result) {
                    const summary = this.parseTileData(result, userKey);
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

    // ── PARSE TILE DATA ───────────────────────────────────────────────────
    parseTileData(rawResult, userKey) {
        try {
            let parsed;
            if (typeof rawResult === 'string') {
                const clean = rawResult
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();
                parsed = JSON.parse(clean);
            } else {
                parsed = rawResult;
            }

            return {
                totalEngagements       : parsed.totalEngagements || '',
                weightedEngagementScore: parsed.weightedEngagementScore || '',
                engagementRate         : parsed.engagementRate || '',
                summaryText            : parsed.summaryText || '',
                topChannels            : parsed.Engagement_Channels_and_Performance__c
                                            ?.['Top Performing Channels'] || [],
                lowChannels            : parsed.Engagement_Channels_and_Performance__c
                                            ?.['Low Performing Channels'] || [],
                topEngagedAccounts     : parsed.topEngagedAccounts || [],
                lowEngagedAccounts     : parsed.lowEngagedAccounts || [],
                contacts               : Object.entries(parsed.Contacts_Engaged__c || {})
                                            .filter(([key]) => key !== 'totalUniqueContacts')
                                            .map(([name, val]) => ({
                                                name : name,
                                                title: val.title || '',
                                                score: val.score || ''
                                            })),
                totalUniqueContacts    : parsed.Contacts_Engaged__c?.totalUniqueContacts || '',
                channelMix             : (parsed.channelMix || []).map(m => ({
                                            label: m.label, pct: m.pct
                                         })),
                keyTakeaways           : parsed.Key_Takeaways_and_Recommendations__c || [],
                outreachCadence        : parsed.outreachCadence || '',
                bestChannels           : parsed.Collective_Engagement_Insights__c
                                            ?.['Best Performing Channels'] || [],
                underperformingChannels: parsed.Collective_Engagement_Insights__c
                                            ?.['Underperforming Channels'] || []
            };
        } catch(e) {
            console.error('Error parsing tile data for:', userKey, e);
            return null;
        }
    }

    // ── LOAD OVERALL SUMMARY ──────────────────────────────────────────────
    async loadOverallSummary() {
        try {
            let svpText   = '';
            let quad4Text = '';

            for (const userKey of Object.keys(this.tileData)) {
                const s = this.tileData[userKey];
                if (!s) continue;

                const userName = userKey.replace('SVP_', '').replace('QUAD4_', '');
                const isSVP    = userKey.startsWith('SVP_');

                let userText = '';
                userText += `\n${isSVP ? 'SVP' : 'Quad4'}: ${userName}\n`;
                userText += `Total Engagements: ${s.totalEngagements || '0'}\n`;
                userText += `WES: ${s.weightedEngagementScore || '0'}\n`;
                userText += `Engagement Rate: ${s.engagementRate || '0%'}\n`;

                if (s.topChannels?.length) {
                    userText += `Top Channels: ${s.topChannels
                        .map(c => c.channel + ' (volume: ' + c.volume + ', response: ' + c.responseRate + ')')
                        .join(', ')}\n`;
                }
                if (s.lowChannels?.length) {
                    userText += `Low Channels: ${s.lowChannels
                        .map(c => c.channel + ' (volume: ' + c.volume + ', response: ' + c.responseRate + ')')
                        .join(', ')}\n`;
                }
                if (s.topEngagedAccounts?.length) {
                    userText += `Top Accounts: ${s.topEngagedAccounts
                        .map(a => a.name + ' (' + a.industry + ', ' + a.tier + ')')
                        .join(', ')}\n`;
                }
                if (s.lowEngagedAccounts?.length) {
                    userText += `Low Accounts: ${s.lowEngagedAccounts
                        .map(a => a.name + ' - ' + a.reason)
                        .join(', ')}\n`;
                }
                if (s.channelMix?.length) {
                    userText += `Channel Mix: ${s.channelMix
                        .map(m => m.label + ': ' + m.pct + '%')
                        .join(', ')}\n`;
                }
                userText += '\n';

                if (isSVP) {
                    svpText += userText;
                } else {
                    quad4Text += userText;
                }
            }

            // SVP overall
            if (svpText.trim()) {
                const svpResult = await getOverallPortfolioSummary({
                    userSummariesJson: svpText
                });
                if (svpResult) this.overallSummarySVP = svpResult.trim();
            }

            // Quad4 overall
            if (quad4Text.trim()) {
                const quad4Result = await getOverallPortfolioSummary({
                    userSummariesJson: quad4Text
                });
                if (quad4Result) this.overallSummaryQuad4 = quad4Result.trim();
            }

        } catch(e) {
            console.error('Error loading overall summary:', e.message);
        }
    }

    // ── GENERATE SUMMARY BUTTON ───────────────────────────────────────────
    async handleGenerateSummary() {
        this.isLoading    = true;
        this.isGenerating = true;
        try {
            // clear old data
            this.tileData          = {};
            this.overallSummarySVP   = '';
            this.overallSummaryQuad4 = '';

            // fetch tiles + overall for current tab
            await this.fetchDataForCurrentTab();

        } catch(e) {
            console.error('Error generating summary:', e);
        } finally {
            this.isLoading    = false;
            this.isGenerating = false;
        }
    }

    // ── TAB CHANGE ────────────────────────────────────────────────────────
    async handleTabChange(event) {
        this.activeTab     = event.target.value;
        this.showDropdown  = false;
        this.selectedUsers = [...this.currentLabels];

        // check if data already exists for this tab
        const hasDataForTab = this.currentLabels.some(label => {
            const key = this.activeTab === 'SVP'
                ? 'SVP_' + label
                : 'QUAD4_' + label;
            return !!this.tileData[key];
        });

        // only fetch if no data yet for this tab
        if (!hasDataForTab) {
            this.isLoading = true;
            try {
                await this.fetchDataForCurrentTab();
            } catch(e) {
                console.error('Error on tab change:', e);
            } finally {
                this.isLoading = false;
            }
        }
    }

    // ── HANDLERS ──────────────────────────────────────────────────────────
    toggleTierDropdown()   { this.showTierDropdown = !this.showTierDropdown; }
    handleTierMouseLeave() { this.showTierDropdown = false; }
    toggleDropdown()       { this.showDropdown = !this.showDropdown; }
    handleMouseLeave()     { this.showDropdown = false; }
    handleDateChange(e)    { this.selectDateVal = e.detail.value; }
    handleChange(e)        { this.value = e.detail.value; }

    handleTierSelection(e) {
        const val     = e.target.dataset.value;
        const checked = e.target.checked;
        this.tierOptions = this.tierOptions.map(t => ({
            ...t, selected: t.value === val ? checked : t.selected
        }));
        if (checked) {
            this.selectedTiers = [...this.selectedTiers, val];
        } else {
            this.selectedTiers = this.selectedTiers.filter(t => t !== val);
        }
    }

    handleUserSelection(event) {
        const value = event.target.dataset.value;
        if (event.target.checked) {
            this.selectedUsers = [...this.selectedUsers, value];
        } else {
            this.selectedUsers = this.selectedUsers.filter(i => i !== value);
        }
        console.log('Selected users:', this.selectedUsers);
    }
}