import { LightningElement, track, wire } from 'lwc';
import getUserInfo from '@salesforce/apex/ProspectEngagementInsightsController.getUserInfo';
import getAccountIdsPerUser from '@salesforce/apex/ProspectEngagementInsightsController.getAccountIdsPerUser'
import getTierPicklistValues from '@salesforce/apex/ProspectEngagementInsightsController.getTierPicklistValues';
import getPromptDataForUser from '@salesforce/apex/ProspectEngagementInsightsController.getPromptDataForUser';
import getOverallPortfolioSummary from '@salesforce/apex/ProspectEngagementInsightsController.getOverallPortfolioSummary';
import getAISummaryForUser from '@salesforce/apex/ProspectEngagementInsightsController.getAISummaryForUser';
export default class ProspectEngagementInsights extends LightningElement {
    @track isLoading = false;
    @track loadingMessage = '';
    @track sections = [];
    @track canViewSvpTab = false;
    @track canViewQuad4Tab = false;
    @track activeTab = 'SVP';
    @track quad4Labels = [];
    @track svpLabels = [];
    @track showDropdown = false;
    @track selectedUsers = [];
    @track errorMessage = '';
    selectVal = 'svp';
    selectDateVal = '30';
    @track showTierDropdown = false;
    @track accountIdsPerUser = {};
    @track tierOptions = [];
    @track selectedTiers = [];
    @track tileData = {};
    @track isGenerating = false;
    @track overallSummary = '';
    @track overallSummarySVP = '';
    @track overallSummaryQuad4 = '';
    @track overallStatsSVP = null;
    @track overallStatsQuad4 = null;
    @track svpViewMode = 'users';
    @track quadViewMode = 'users';
    @track isExpanded = false;
    expandedTiles = {};
    @track effectiveFrom = '';
    @track effectiveTo = '';
    @track showSummaryModal = false;
    @track selectedSummary = '';
    @track aiSummaryMap = {};
    handleSummaryClick(event) {
        this.selectedSummary = event.currentTarget.dataset.summary;
        this.showSummaryModal = true;
    }
    closeSummaryModal() {
        this.showSummaryModal = false;
        this.selectedSummary = '';
    }



    // toggleSummary(event) {
    //     const label = event.currentTarget.dataset.label;

    //     this.expandedTiles = {
    //         ...this.expandedTiles,
    //         [label]: !this.expandedTiles[label]
    //     };
    // }
    handleEffectiveFromChange(event) {
        this.effectiveFrom = event.detail.value;


    }

    handleEffectiveToChange(event) {
        this.effectiveTo = event.detail.value;


    }


    get showSvpToggle() {
        return this.svpLabels && this.svpLabels.length > 1;

    }
    get showQuadToggle() {

        return this.quad4Labels && this.quad4Labels.length > 1;
    }

    async handleSvpViewToggle(event) {
        this.svpViewMode = event.currentTarget.dataset.view;
        if (this.svpViewMode === 'overall' && !this.overallStatsSVP) {
            this.isLoading = true;
            this.loadingMessage = 'Generating SVP overall summary...';
            try {
                await this.loadOverallSummarySVP();
            } catch (e) {
                this.errorMessage = 'Failed to load SVP overall summary: ' + (e.body?.message || e.message);
                console.error(e);
            } finally {
                this.isLoading = false;
                this.loadingMessage = '';
            }
        }
    }
    async handleQuadViewToggle(event) {
        this.quadViewMode = event.currentTarget.dataset.view;
        if (this.quadViewMode === 'overall' && !this.overallStatsQuad4) {
            this.isLoading = true;
            this.loadingMessage = 'Generating Quad4 overall summary...';
            try {
                await this.loadOverallSummaryQuad4();
            } catch (e) {
                this.errorMessage = 'Failed to load Quad4 overall summary: ' + (e.body?.message || e.message);
                console.error(e);
            } finally {
                this.isLoading = false;
                this.loadingMessage = '';
            }
        }
    }
    get isQuadUsersView() {
        return this.quadViewMode === 'users';
    }
    get isQuadOverallView() {
        return this.quadViewMode === 'overall';
    }


    get isSvpUsersView() {
        return this.svpViewMode === 'users';
    }
    get isSvpOverallView() {
        return this.svpViewMode === 'overall';
    }
    get svpUsersBtnClass() {
        return this.svpViewMode === 'users' ? 'toggle-btn toggle-btn--active' : 'toggle-btn';
    }
    get svpOverallBtnClass() {
        return this.svpViewMode === 'overall' ? 'toggle-btn toggle-btn--active' : 'toggle-btn';
    }

    get quadUsersBtnClass() {
        return this.quadViewMode === 'users'
            ? 'toggle-btn toggle-btn--active'
            : 'toggle-btn';
    }

    get quadOverallBtnClass() {
        return this.quadViewMode === 'overall'
            ? 'toggle-btn toggle-btn--active'
            : 'toggle-btn';
    }
    get hasOverallStatsSVP() {
        return !!this.overallStatsSVP;
    }
    get hasOverallStatsQuad4() {
        return !!this.overallStatsQuad4;

    }
    get hasOverallSummarySVP() {
        return !!this.overallSummarySVP;
    }

    get hasOverallSummaryQuad4() {
        return !!this.overallSummaryQuad4;
    }
    productOptions = [
        { label: 'SVP top targets', value: 'svp' }
    ];


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
        const today = new Date();
        this.effectiveTo = today.toISOString().split('T')[0];

        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 1);
        this.effectiveFrom = twoYearsAgo.toISOString().split('T')[0];

        // this.isLoading = true;
        try {
            this.isLoading = true;
            this.loadingMessage = 'Preparing AI insights...';
            await this.loadTierOptions();
            const result = await getUserInfo();
            this.canViewQuad4Tab = result.canViewQuad4Tab;
            this.canViewSvpTab = result.canViewSvpTab;
            this.activeTab = result.defaultTeam;
            this.svpLabels = result.svpLabels1;
            this.quad4Labels = result.quad4Labels1;
            this.selectedUsers = [...this.currentLabels];
            this.overallSummarySVP = '';
            this.overallSummaryQuad4 = '';
            await this.loadAccountIds();
            await this.loadTileData();
            await this.loadAISummary();
            // await this.loadOverallSummary();
        }
        catch (e) {
            this.errorMessage = 'Failed to load access info: ' + e.body?.message || e.message;
            console.error(e);
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }

    async loadAccountIds() {
        try {
            const isSVP = this.activeTab === 'SVP';

            const svpUsers = isSVP
                ? (this.selectedUsers.length ? this.selectedUsers : this.svpLabels)
                : [];  // ← empty when on Quad4 tab

            const quad4Users = !isSVP
                ? (this.selectedUsers.length ? this.selectedUsers : this.quad4Labels)
                : [];  // ← empty when on SVP tab

            console.log('activeTab:', this.activeTab);
            console.log('svpUsers:', svpUsers);
            console.log('quad4Users:', quad4Users);

            const result = await getAccountIdsPerUser({
                svpUserNames: svpUsers,
                quad4UserNames: quad4Users,
                tiers: this.selectedTiers
            });

            // merge — keep existing tab data intact
            // this.accountIdsPerUser = {
            //     ...this.accountIdsPerUser,
            //     ...result
            // };
            //this.accountIdsPerUser = result;
            this.accountIdsPerUser = {
                ...this.accountIdsPerUser,
                ...result
            };


            console.log('Test Account IDs:', JSON.stringify(this.accountIdsPerUser));
            console.log('Loading tile data for:', Object.keys(this.accountIdsPerUser));
            // await this.loadTileData();

        } catch (e) {
            console.error('Error in loadAccountIds:', e);
            throw e;
        }
    }
    async handleGenerateSummary() {
        try {
            this.isLoading = true;
            this.loadingMessage = 'Preparing AI insights...';
            this.tileData = {};
            this.accountIdsPerUser = {};
            this.aiSummaryMap = {};
            this.overallSummarySVP = '';
            this.overallSummaryQuad4 = '';
            this.overallStatsSVP = null;
            this.overallStatsQuad4 = null;
            await this.loadAccountIds();
            await this.loadTileData();
            await this.loadAISummary();
            this.loadingMessage = 'Generating portfolio summary...';
            //await this.loadOverallSummary();
        } catch (e) {
            console.error('Error generating summary:', e);
        }
        finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }

    async loadTileData() {
        const tempTileData = { ...this.tileData };
        //const tempTileData = {};
        const userKeys = Object.keys(this.accountIdsPerUser).filter(key =>
            this.activeTab === 'SVP'
                ? key.startsWith('SVP_')
                : key.startsWith('QUAD4_')
        );

        /*for (const userKey of userKeys) {
            // for (const userKey of Object.keys(this.accountIdsPerUser)) {
            if (tempTileData[userKey]) {
                console.log('Skipping already loaded:', userKey);
                continue;
            }
            const accountIds = this.accountIdsPerUser[userKey];
            const userName = userKey.replace('SVP_', '').replace('QUAD4_', '');
            //this.loadingMessage = `Generating AI insights for ${userName}...`;
            this.loadingMessage = 'Generating Prospect Insights';

            if (!accountIds || !accountIds.length) {
                continue;
            }
            console.time('getPromptDataForUser');

            const result = await getPromptDataForUser({
                accountIds: accountIds,
                dateRange: parseInt(this.selectDateVal) || 1000




            });
            console.timeEnd('getPromptDataForUser');

            if (result) {

                const summary = this.parseTileData(result, userKey);

                tempTileData[userKey] = summary;
            }
        }*/
        const promises = userKeys.map(async (userKey) => {
            if (tempTileData[userKey]) {
                return;
            }
            const accountIds = this.accountIdsPerUser[userKey];
            if (!accountIds?.length) {
                return;
            }
            const result = await getPromptDataForUser({
                accountIds,
                startDate: this.effectiveFrom,
                endDate: this.effectiveTo
                // dateRange: parseInt(this.selectDateVal) || 1000
            });
            if (result) {
                tempTileData[userKey] = this.parseTileData(result, userKey);
            }
        });
        await Promise.all(promises);
        this.tileData = tempTileData;
        //this.tileData = tempTileData;
    }
   /* async loadAISummary() {

        const tempSummary = { ...this.aiSummaryMap };

        const userKeys = Object.keys(this.accountIdsPerUser)
            .filter(key =>
                this.activeTab === 'SVP'
                    ? key.startsWith('SVP_')
                    : key.startsWith('QUAD4_')
            );

        const promises = userKeys.map(async userKey => {

            const accountIds = this.accountIdsPerUser[userKey];

            const result = await getAISummaryForUser({

                accountIds,

                startDate: this.effectiveFrom,

                endDate: this.effectiveTo

            });
            let parsed = result;

            if (typeof result === 'string') {
                const clean = result
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();

                parsed = JSON.parse(clean);
            }

            tempSummary[userKey] =
                this.buildNarrativeSummary(parsed.AI_Narrative_Summary__c);

            //tempSummary[userKey]=result;

        });

        await Promise.all(promises);

        this.aiSummaryMap = tempSummary;

    }*/
   async loadAISummary() {
    const tempSummary = { ...this.aiSummaryMap };

    const userKeys = Object.keys(this.accountIdsPerUser)
        .filter(key => this.activeTab === 'SVP' ? key.startsWith('SVP_') : key.startsWith('QUAD4_'));

    const promises = userKeys.map(async (userKey) => {
        try {
            const accountIds = this.accountIdsPerUser[userKey];
            if (!accountIds?.length) {
                tempSummary[userKey] = '';
                return;
            }

            const result = await getAISummaryForUser({
                accountIds,
                startDate: this.effectiveFrom,
                endDate: this.effectiveTo
            });

            if (!result) {
                tempSummary[userKey] = '';
                return;
            }

            let parsed = result;
            if (typeof result === 'string') {
                const clean = result.replace(/```json/g, '').replace(/```/g, '').trim();
                parsed = JSON.parse(clean);
            }

            tempSummary[userKey] = this.buildNarrativeSummary(parsed?.AI_Narrative_Summary__c);
        } catch (e) {
            console.error('AI summary failed for', userKey, e);
            tempSummary[userKey] = '';
        }
    });

    await Promise.all(promises);
    //this.aiSummaryMap = tempSummary;
    this.aiSummaryMap = { ...tempSummary };
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

            console.log('Parsed object:', parsed)
            const summary = {
                totalEngagements: parsed.totalEngagements || '',
                weightedEngagementScore: parsed.weightedEngagementScore || '',
                engagementRate: parsed.engagementRate || '',
                //summaryText: parsed.summaryText || '',
                //summaryText: this.formatSummary(parsed.summaryText || ''),
                // summaryText: this.buildNarrativeSummary(parsed.AI_Narrative_Summary__c),

                topChannels: parsed.Engagement_Channels_and_Performance__c?.['Top Performing Channels'] || [],
                lowChannels: parsed.Engagement_Channels_and_Performance__c?.['Low Performing Channels'] || [],
                topEngagedAccounts: parsed.topEngagedAccounts || [],
                lowEngagedAccounts: parsed.lowEngagedAccounts || [],
                contacts: Object.entries(parsed.Contacts_Engaged__c || {})
                    .filter(([key]) => key !== 'totalUniqueContacts')
                    .map(([name, val]) => ({
                        name: name,
                        title: val.title,
                        score: val.score || ''
                    })),
                leastEngagedContacts: Object.entries(parsed.Least_Engaged_Contacts__c || {})
                    .map(([name, val]) => ({
                        name: name,
                        title: val.title,
                        score: val.score || '',
                        //reason: val.reason || ''
                    })),


                totalUniqueContacts: parsed.Contacts_Engaged__c?.totalUniqueContacts || '',
                channelMix: (parsed.channelMix || []).map(m => ({
                    label: m.label,
                    pct: m.pct,
                    //style : `width:${m.pct}%;background:#b0b0b0`
                })),
                keyTakeaways: parsed.Key_Takeaways_and_Recommendations__c || [],
                outreachCadence: parsed.outreachCadence || '',
                bestChannels: parsed.Collective_Engagement_Insights__c?.['Best Performing Channels'] || [],
                underperformingChannels: parsed.Collective_Engagement_Insights__c?.['Underperforming Channels'] || []
            };

            console.log('Summary built:', summary);
            return summary;

        } catch (e) {
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
        if (!this.selectedUsers.length) return [];

        const labelsForTab = this.activeTab === 'SVP'
            ? this.svpLabels
            : this.quad4Labels;

        return labelsForTab
            .filter(label => this.selectedUsers.includes(label))
            .map(label => {
                const key = this.activeTab === 'SVP'
                    ? 'SVP_' + label
                    : 'QUAD4_' + label;
                /* return {
                     label: label,
                     accountIds: this.accountIdsPerUser[key] || [],
                     summary: this.tileData[key] || null
                 };*/
                return {
                    label: label,
                    accountIds: this.accountIdsPerUser[key] || [],
                    summary: this.tileData[key] || null,
                    aiSummary: this.aiSummaryMap[key] || '',
                    isExpanded: false,
                    summaryClass: this.expandedTiles[label] ? 'summary-card expanded' : 'summary-card',
                    iconName: this.expandedTiles[label] ? 'utility:minimize_window' : 'utility:expand_alt'



                };
            });
    }

    toggleTierDropdown() {
        this.showTierDropdown = !this.showTierDropdown;
    }
    handleTierMouseLeave() {
        this.showTierDropdown = false;
    }

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



    get showSVPTab() {
        return this.canViewSvpTab;
    }
    get showQuad4Tab() {
        return this.canViewQuad4Tab;
    }
    get hasError() {
        return !!this.errorMessage;
    }
    /* async handleTabChange(event) {
 
         const newTab = event.target.value || event.detail.value;
 
         if (newTab === this.activeTab) {
             return;
         }
 
         this.activeTab = newTab;
         this.showDropdown = false;
             console.log('Tab changed to:', this.activeTab);
 
 
         // Reset users for selected tab
         this.selectedUsers = this.activeTab === 'SVP'
             ? [...this.svpLabels]
             : [...this.quad4Labels];
 
         // Clear previous data
         this.accountIdsPerUser = {};
         this.tileData = {};
 
         this.overallSummarySVP = '';
         this.overallSummaryQuad4 = '';
 
         this.isLoading = true;
 
         try {
 
 
             await this.loadAccountIds();
 
             await this.loadTileData();
 
             await this.loadOverallSummary();
 
         }
         finally {
 
             this.isLoading = false;
 
         }
     }*/
    async handleTabChange(event) {
        const newTab = event.target.value || event.detail?.value;
        if (!newTab || newTab === this.activeTab) return;

        this.activeTab = newTab;
        this.showDropdown = false;

        this.selectedUsers = this.activeTab === 'SVP'
            ? [...this.svpLabels]
            : [...this.quad4Labels];

        console.log('Tab changed to:', this.activeTab);

        const labelsForTab = this.activeTab === 'SVP'
            ? this.svpLabels
            : this.quad4Labels;

        const hasDataForTab = labelsForTab.some(label => {
            const key = this.activeTab === 'SVP'
                ? 'SVP_' + label
                : 'QUAD4_' + label;
            return !!this.tileData[key];
        });

        console.log('Has data for tab:', hasDataForTab);

        if (!hasDataForTab) {
            this.isLoading = true;
            try {
                await this.loadAccountIds();
                await this.loadTileData();
                await this.loadAISummary();
                // if (
                //     (this.activeTab === 'SVP' && !this.overallSummarySVP) ||
                //     (this.activeTab === 'Quad4' && !this.overallSummaryQuad4)
                // ) {
                //     //await this.loadOverallSummary();
                // }
                // await this.loadOverallSummary();
            } catch (e) {
                console.error('Error on tab change:', e);
            } finally {
                this.isLoading = false;
            }
        }
    }


    async loadOverallSummarySVP() {
        const allSvpIds = Object.entries(this.accountIdsPerUser)
            .filter(([key]) => key.startsWith('SVP_'))
            .flatMap(([, ids]) => ids);

        if (!allSvpIds.length) return;

        const svpCardResult = await getPromptDataForUser({
            accountIds: allSvpIds,
            startDate: this.effectiveFrom,
            endDate: this.effectiveTo
        });
        if (svpCardResult) {
            const parsed = this.parseTileData(svpCardResult, 'SVP_OVERALL');
            if (parsed) this.overallStatsSVP = parsed;
        }

        const svpText = this.buildSummaryText('SVP_');
        if (svpText.trim()) {
            const svpResult = await getOverallPortfolioSummary({ userSummariesJson: svpText });
            //if (svpResult) this.overallSummarySVP = svpResult.trim();
            if (svpResult) this.overallSummarySVP = this.parseOverallSummary(svpResult);
        }
    }

    async loadOverallSummaryQuad4() {
        const allQuad4Ids = Object.entries(this.accountIdsPerUser)
            .filter(([key]) => key.startsWith('QUAD4_'))
            .flatMap(([, ids]) => ids);

        if (!allQuad4Ids.length) return;

        const quad4CardResult = await getPromptDataForUser({
            accountIds: allQuad4Ids,
            startDate: this.effectiveFrom,
            endDate: this.effectiveTo
        });
        if (quad4CardResult) {
            const parsed = this.parseTileData(quad4CardResult, 'QUAD4_OVERALL');
            if (parsed) this.overallStatsQuad4 = parsed;
        }

        const quad4Text = this.buildSummaryText('QUAD4_');
        if (quad4Text.trim()) {
            const quad4Result = await getOverallPortfolioSummary({ userSummariesJson: quad4Text });
            //if (quad4Result) this.overallSummaryQuad4 = quad4Result.trim();
            if (quad4Result) this.overallSummaryQuad4 = this.parseOverallSummary(quad4Result);
        }
    }

    buildSummaryText(prefix) {
        let text = '';
        for (const userKey of Object.keys(this.tileData)) {
            if (!userKey.startsWith(prefix)) continue;
            const s = this.tileData[userKey];
            if (!s) continue;

            const userName = userKey.replace('SVP_', '').replace('QUAD4_', '');
            const isSVP = prefix === 'SVP_';

            let userText = `\n${isSVP ? 'SVP' : 'Quad4'}: ${userName}\n`;
            userText += `Total Engagements: ${s.totalEngagements || '0'}\n`;
            userText += `WES: ${s.weightedEngagementScore || '0'}\n`;
            userText += `Engagement Rate: ${s.engagementRate || '0%'}\n`;

            if (s.topChannels?.length) {
                userText += `Top Channels: ${s.topChannels.map(c => c.channel + ' (volume: ' + c.volume + ', response: ' + c.responseRate + ')').join(', ')}\n`;
            }
            if (s.lowChannels?.length) {
                userText += `Low Channels: ${s.lowChannels.map(c => c.channel + ' (volume: ' + c.volume + ', response: ' + c.responseRate + ')').join(', ')}\n`;
            }
            if (s.topEngagedAccounts?.length) {
                userText += `Top Accounts: ${s.topEngagedAccounts.map(a => a.name + ' (' + a.industry + ', ' + a.tier + ')').join(', ')}\n`;
            }
            if (s.lowEngagedAccounts?.length) {
                userText += `Low Accounts: ${s.lowEngagedAccounts.map(a => a.name + ' - ' + a.reason).join(', ')}\n`;
            }
            if (s.channelMix?.length) {
                userText += `Channel Mix: ${s.channelMix.map(m => m.label + ': ' + m.pct + '%').join(', ')}\n`;
            }
            userText += '\n';
            text += userText;
        }
        return text;
    }


    // ── LOAD OVERALL SUMMARY ──────────────────────────────────────────────
    /*async loadOverallSummary() {
        try {



            // ── SVP overall card data ──────────────────────────
            const allSvpIds = Object.entries(this.accountIdsPerUser)
                .filter(([key]) => key.startsWith('SVP_'))
                .flatMap(([, ids]) => ids);

            if (allSvpIds.length) {

                const svpCardResult = await getPromptDataForUser({
                    accountIds: allSvpIds,
                    effectiveFrom: this.effectiveFrom,
                    effectiveTo: this.effectiveTo
                    //dateRange: parseInt(this.selectDateVal) || 1000
                });
                if (svpCardResult) {
                    const parsed = this.parseTileData(svpCardResult, 'SVP_OVERALL');
                    if (parsed) this.overallStatsSVP = parsed;
                }
            }

            // ── Quad4 overall card data ────────────────────────
            const allQuad4Ids = Object.entries(this.accountIdsPerUser)
                .filter(([key]) => key.startsWith('QUAD4_'))
                .flatMap(([, ids]) => ids);

            if (allQuad4Ids.length) {
                const quad4CardResult = await getPromptDataForUser({
                    accountIds: allQuad4Ids,
                    effectiveFrom: this.effectiveFrom,
                    effectiveTo: this.effectiveTo
                    //dateRange: parseInt(this.selectDateVal) || 1000
                });
                if (quad4CardResult) {
                    const parsed = this.parseTileData(quad4CardResult, 'QUAD4_OVERALL');
                    if (parsed) this.overallStatsQuad4 = parsed;
                }
            }

            let svpText = '';
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
                    userText += `Top Channels: ${s.topChannels
                        .map(c => c.channel +
                            ' (volume: ' + c.volume +
                            ', response: ' + c.responseRate + ')')
                        .join(', ')
                        }\n`;
                }
                if (s.lowChannels?.length) {
                    userText += `Low Channels: ${s.lowChannels
                        .map(c => c.channel +
                            ' (volume: ' + c.volume +
                            ', response: ' + c.responseRate + ')')
                        .join(', ')
                        }\n`;
                }
                if (s.topEngagedAccounts?.length) {
                    userText += `Top Accounts: ${s.topEngagedAccounts
                        .map(a => a.name +
                            ' (' + a.industry +
                            ', ' + a.tier + ')')
                        .join(', ')
                        }\n`;
                }
                if (s.lowEngagedAccounts?.length) {
                    userText += `Low Accounts: ${s.lowEngagedAccounts
                        .map(a => a.name + ' - ' + a.reason)
                        .join(', ')
                        }\n`;
                }
                if (s.channelMix?.length) {
                    userText += `Channel Mix: ${s.channelMix
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

        } catch (e) {
            console.error('Error loading overall summary:', e.message);
        }
    }*/


    // buildNarrativeSummary(narrative) {
    //     if (!narrative) return '';

    //     const sections = [];

    //     if (narrative.Cultivated_vs_New_Accounts__c) {
    //         const n = narrative.Cultivated_vs_New_Accounts__c;
    //         sections.push(this.section('Cultivated vs. New Accounts', [
    //             n.recommendation,
    //             n.supportingDataPoint,
    //             n.actionStep ? `Next step: ${n.actionStep}` : ''
    //         ]));
    //     }

    //     if (narrative.Outreach_Pattern_That_Works__c) {
    //         const n = narrative.Outreach_Pattern_That_Works__c;
    //         sections.push(this.section('The Outreach Pattern That\'s Working', [
    //             n.stepOne ? `1. ${n.stepOne}` : '',
    //             n.stepTwo ? `2. ${n.stepTwo}` : '',
    //             n.stepThree ? `3. ${n.stepThree}` : '',
    //             n.trigger ? `Trigger: ${n.trigger}` : '',
    //             n.actionStep ? `Next step: ${n.actionStep}` : ''
    //         ]));
    //     }

    //     if (narrative.Accounts_Falling_Behind_Peers__c?.accounts?.length) {
    //         const list = narrative.Accounts_Falling_Behind_Peers__c.accounts
    //             .map(a => `- ${a.name} (${a.industry}, ${a.tier}): ${a.likelyReason} — ${a.actionStep}`);
    //         sections.push(this.section('Accounts Falling Behind Peers', list));
    //     }

    //     if (narrative.Where_Effort_Is_Wasted__c) {
    //         const n = narrative.Where_Effort_Is_Wasted__c;
    //         sections.push(this.section('Where Effort Is Being Wasted', [
    //             n.recommendation,
    //             n.supportingDataPoint,
    //             n.actionStep ? `Next step: ${n.actionStep}` : ''
    //         ]));
    //     }

    //     if (narrative.Over_Contacted_Accounts__c?.accounts?.length) {
    //         const list = narrative.Over_Contacted_Accounts__c.accounts
    //             .map(a => `- ${a.name}: ${a.reason} — ${a.actionStep}`);
    //         sections.push(this.section('Over-Contacted Accounts (Diminishing Returns)', list));
    //     }

    //     if (narrative.Priority_Accounts_to_Act_On_Now__c?.accounts?.length) {
    //         const list = narrative.Priority_Accounts_to_Act_On_Now__c.accounts
    //             .map(a => `- ${a.name}: ${a.whyNow}`);
    //         sections.push(this.section('Priority Accounts to Act On Now', list));
    //     }

    //     if (narrative.Other_Ways_to_Improve_Outreach__c) {
    //         const n = narrative.Other_Ways_to_Improve_Outreach__c;
    //         sections.push(this.section('Other Ways to Improve Outreach', [
    //             n.recommendation,
    //             n.actionStep ? `Next step: ${n.actionStep}` : ''
    //         ]));
    //     }

    //     if (narrative.Best_Near_Term_Opportunities__c?.accounts?.length) {
    //         const list = narrative.Best_Near_Term_Opportunities__c.accounts
    //             .map(a => `- ${a.name}: ${a.whyNow}`);
    //         sections.push(this.section('Best Near-Term Opportunities', list));
    //     }

    //     if (narrative.One_Behavioral_Change_That_Matters_Most__c) {
    //         const n = narrative.One_Behavioral_Change_That_Matters_Most__c;
    //         sections.push(this.section('The One Behavioral Change That Matters Most', [
    //             n.recommendation,
    //             n.supportingDataPoint,
    //             n.actionStep ? `Next step: ${n.actionStep}` : ''
    //         ]));
    //     }

    //     return sections.join('<br><br>');
    // }
    

    buildNarrativeSummary(narrative) {
    if (!narrative) return '';

    const sections = [];

    if (narrative.Cultivated_vs_New_Accounts__c) {
        const n = narrative.Cultivated_vs_New_Accounts__c;
        sections.push(this.section('Cultivated vs. New Accounts', [
            n.recommendation,
            n.supportingDataPoint,
            n.explanation,
            n.actionStep ? `Next step: ${n.actionStep}` : ''
        ]));
    }

    if (narrative.Outreach_Pattern_That_Works__c) {
        const n = narrative.Outreach_Pattern_That_Works__c;
        sections.push(this.section('Outreach Pattern That Works', [
            n.stepOne,
            n.stepTwo,
            n.stepThree,
            n.trigger ? `Trigger: ${n.trigger}` : '',
            n.explanation,
            n.actionStep ? `Next step: ${n.actionStep}` : ''
        ]));
    }

    if (narrative.Confirmed_Active_vs_Quiet_Engagement__c) {
        const n = narrative.Confirmed_Active_vs_Quiet_Engagement__c;
        const lines = [];

        if (n.confirmedActive?.length) {
            lines.push('Confirmed Active:');
            n.confirmedActive.forEach(a =>
                lines.push(`${a.name} - ${a.evidence}`)
            );
        }

        if (n.quietPassiveOnly?.length) {
            lines.push('Quiet / Passive Only:');
            n.quietPassiveOnly.forEach(a =>
                lines.push(`${a.name} - ${a.reason || ''}`)
            );
        }

        if (n.looksEngagedButUnconfirmed?.length) {
            lines.push('Looks Engaged but Unconfirmed:');
            n.looksEngagedButUnconfirmed.forEach(a =>
                lines.push(`${a.name} - ${a.reason}`)
            );
        }

        lines.push(n.explanation);

        sections.push(this.section('Confirmed Active vs Quiet Engagement', lines));
    }

    if (narrative.Engagement_Commonality_Across_Accounts__c) {
        const n = narrative.Engagement_Commonality_Across_Accounts__c;

        sections.push(this.section('Common Engagement Patterns', [
            `Rising Pattern: ${n.risingEngagementCommonPattern}`,
            `Rising Accounts: ${(n.risingEngagementAccounts || []).join(', ')}`,
            `Falling Pattern: ${n.fallingEngagementCommonPattern}`,
            `Falling Accounts: ${(n.fallingEngagementAccounts || []).join(', ')}`,
            n.explanation
        ]));
    }

    if (narrative.Accounts_Falling_Behind_Peers__c?.accounts?.length) {
        const list = [];

        narrative.Accounts_Falling_Behind_Peers__c.accounts.forEach(a => {
            list.push(`${a.name} (${a.industry}, ${a.tier})`);
            list.push(a.metric);
            list.push(a.likelyReason);
            list.push(`Action: ${a.actionStep}`);
        });

        list.push(narrative.Accounts_Falling_Behind_Peers__c.explanation);

        sections.push(this.section('Accounts Falling Behind Peers', list));
    }

    if (narrative.Where_Effort_Is_Wasted__c) {
        const n = narrative.Where_Effort_Is_Wasted__c;

        sections.push(this.section('Where Effort Is Wasted', [
            n.recommendation,
            n.supportingDataPoint,
            n.explanation,
            n.actionStep
        ]));
    }

    if (narrative.Over_Contacted_Accounts__c) {

        const list = [];

        narrative.Over_Contacted_Accounts__c.accounts?.forEach(a => {
            list.push(`${a.name}: ${a.reason}`);
            list.push(`Action: ${a.actionStep}`);
        });

        list.push(narrative.Over_Contacted_Accounts__c.explanation);

        sections.push(this.section('Over Contacted Accounts', list));
    }

    if (narrative.Negative_or_Zero_Engagement__c) {

        const list = [];

        narrative.Negative_or_Zero_Engagement__c.accounts?.forEach(a => {
            list.push(`${a.name} - ${a.metric}`);
            list.push(`Re-engagement: ${a.reengagementAction}`);
        });

        narrative.Negative_or_Zero_Engagement__c.contacts?.forEach(c => {
            list.push(`${c.name} (${c.title})`);
            list.push(`Score: ${c.score}`);
            list.push(`Re-engagement: ${c.reengagementAction}`);
        });

        sections.push(this.section('Negative / Zero Engagement', list));
    }

    if (narrative.Priority_Accounts_to_Act_On_Now__c?.accounts?.length) {

        const list = [];

        narrative.Priority_Accounts_to_Act_On_Now__c.accounts.forEach(a => {
            list.push(`${a.name}`);
            list.push(a.metric);
            list.push(a.whyNow);
        });

        sections.push(this.section('Priority Accounts To Act On Now', list));
    }

    if (narrative.Other_Ways_to_Improve_Outreach__c) {
        const n = narrative.Other_Ways_to_Improve_Outreach__c;

        sections.push(this.section('Other Ways To Improve Outreach', [
            n.recommendation,
            n.explanation,
            n.actionStep
        ]));
    }

    if (narrative.Best_Near_Term_Opportunities__c?.accounts?.length) {

        const list = [];

        narrative.Best_Near_Term_Opportunities__c.accounts.forEach(a => {
            list.push(`${a.name}`);
            list.push(a.whyNow);
        });

        sections.push(this.section('Best Near-Term Opportunities', list));
    }

    if (narrative.One_Behavioral_Change_That_Matters_Most__c) {
        const n = narrative.One_Behavioral_Change_That_Matters_Most__c;

        sections.push(this.section('One Behavioral Change That Matters Most', [
            n.recommendation,
            n.supportingDataPoint,
            n.explanation,
            n.actionStep
        ]));
    }

    if (narrative.Direct_Marketing_Lead_Stage_Movement_Analysis) {
        const n = narrative.Direct_Marketing_Lead_Stage_Movement_Analysis;

        sections.push(this.section('Direct Marketing Lead Stage Movement Analysis', [
            n.conclusion,
            n.detailedExplanation
        ]));
    }

    return sections.join('<br><br>');
}

    // section(title, lines) {
    //     const cleaned = lines
    //         .filter(Boolean)
    //         .map(line => this.stripMarkdown(line))
    //         .map(line => this.removeLeadingTitleEcho(line, title));

    //     const body = cleaned.filter(Boolean).join('<br>');
    //     return `<strong>${title}</strong><br>${body}`;
    // }
    section(title, lines) {
        const cleaned = lines
            .filter(Boolean)
            .map(line => this.stripMarkdown(line))
            .map(line => this.removeLeadingTitleEcho(line, title))
            .map(line => this.stripLeadingPunctuation(line))
            .filter(Boolean)
            .map(line => `&#8226; ${line}`);

        return `<strong>${title}</strong><br>${cleaned.join('<br>')}`;
    }
    stripMarkdown(text) {
        if (!text) return text;
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1')  // remove **bold** markers, keep the text inside
            .replace(/\*(.*?)\*/g, '$1');      // remove single *italic* markers too, just in case
    }

    stripLeadingPunctuation(text) {
        if (!text) return text;
        // removes any leading -, •, ., or whitespace the model added on its own
        return text.replace(/^[\s\-•.]+/, '').trim();
    }
    removeLeadingTitleEcho(text, title) {
        if (!text) return text;
        // if the field starts by repeating the section title, strip that leading echo
        const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`^${escapedTitle}\\s*`, 'i');
        return text.replace(pattern, '').trim();
    }

    // formatSummary(text) {
    //     if (!text) return '';

    //     return text
    //         // Bold
    //         .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    //         // Bullet lines
    //         .replace(/^- (.*)$/gm, '&#8226; $1')

    //         // Paragraphs
    //         .replace(/\n\n/g, '<br><br>')

    //         // Single line
    //         .replace(/\n/g, '<br>');
    // }

    parseOverallSummary(rawResult) {
        try {
            let parsed;
            if (typeof rawResult === 'string') {
                const clean = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
                parsed = JSON.parse(clean);
            } else {
                parsed = rawResult;
            }
            return this.buildOverallSummaryHtml(parsed);
        } catch (e) {
            console.error('Error parsing overall summary:', e);
            return '';
        }
    }

    buildOverallSummaryHtml(data) {
        if (!data) return '';

        const titles = {
            Portfolio_Wide_Engagement_Patterns__c: 'Portfolio-Wide Engagement Patterns',
            Month_Over_Month_Shifts__c: 'Month-Over-Month Shifts',
            Industries_Tiers_Engaging_Well__c: 'Industries and Tiers Engaging Well by Channel',
            Industries_Not_Engaging_Well__c: 'Industries Not Engaging Well by Channel',
            High_Effectiveness_Lower_Effort__c: 'High Effectiveness with Lower Effort',
            Volume_vs_Diminishing_Returns__c: 'Volume vs. Diminishing Returns',
            Optimal_Cadence_Stage_Movement__c: 'Optimal Cadence for Stage Movement'
        };

        const sections = [];
        for (const key of Object.keys(titles)) {
            const section = data[key];
            if (!section) continue;

            const points = (section.insufficientData
                ? [section.insight || 'Insufficient data to confirm this.']
                : (section.points || [])
            ).filter(Boolean).map(p => this.stripMarkdown(p));

            sections.push(this.section(titles[key], points));
        }
        return sections.join('<br><br>');
    }
}