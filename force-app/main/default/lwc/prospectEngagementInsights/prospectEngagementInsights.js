import { LightningElement, track } from 'lwc';
import getUserInfo from '@salesforce/apex/ProspectEngagementInsightsController.getUserInfo';
import getAccountIdsPerUser from '@salesforce/apex/ProspectEngagementInsightsController.getAccountIdsPerUser';
import getTierPicklistValues from '@salesforce/apex/ProspectEngagementInsightsController.getTierPicklistValues';
import getPromptDataForUser from '@salesforce/apex/ProspectEngagementInsightsController.getPromptDataForUser';
import getOverallPortfolioSummary from '@salesforce/apex/ProspectEngagementInsightsController.getOverallPortfolioSummary';
import getAISummaryForUser from '@salesforce/apex/ProspectEngagementInsightsController.getAISummaryForUser';

export default class ProspectEngagementInsights extends LightningElement {

    // ── STATE ──────────────────────────────────────────────────
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
    @track showTierDropdown = false;
    @track accountIdsPerUser = {};
    @track tierOptions = [];
    @track selectedTiers = [];
    @track tileData = {};
    @track isGenerating = false;
    @track overallSummarySVP = '';
    @track overallSummaryQuad4 = '';
    @track overallStatsSVP = null;
    @track overallStatsQuad4 = null;
    @track svpViewMode = 'users';
    @track quadViewMode = 'users';
    @track effectiveFrom = '';
    @track effectiveTo = '';
    @track showSummaryModal = false;
    @track selectedSummary = '';
    @track aiSummaryMap = {};
    @track isDirty = false;

    // non-tracked — no re-render needed
    selectVal = 'svp';
    selectDateVal = '30';
    expandedTiles = {};

    productOptions = [
        { label: 'SVP top targets', value: 'svp' }
    ];

    // ── LIFECYCLE ──────────────────────────────────────────────
    async connectedCallback() {
        // set default dates first — before anything else
        const today = new Date();
        this.effectiveTo = today.toISOString().split('T')[0];

        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(
            twoYearsAgo.getFullYear() - 2
        );
        this.effectiveFrom =
            twoYearsAgo.toISOString().split('T')[0];

        try {
            this.isLoading = true;
            this.loadingMessage = 'Preparing AI insights...';

            // load tier options and user info in parallel
            // both are fast API calls — no dependency on each other
            await Promise.all([
                this.loadTierOptions(),
                this.loadUserInfo()
            ]);

            // load account IDs — needs user info first
            await this.loadAccountIds();

            // load tile data and AI summary in parallel
            // both only need accountIdsPerUser which is now ready
            this.loadingMessage = 'Generating AI insights...';
            await Promise.all([
                this.loadTileData(),
                this.loadAISummary()
            ]);

            // enable generate button after initial load
            this.isDirty = false;

        } catch (e) {
            this.errorMessage =
                'Failed to load: '
                + (e.body?.message || e.message);
            console.error(e);
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }

    // ── USER INFO ──────────────────────────────────────────────
    async loadUserInfo() {
        const result = await getUserInfo();
        this.canViewQuad4Tab = result.canViewQuad4Tab;
        this.canViewSvpTab = result.canViewSvpTab;
        this.activeTab = result.defaultTeam;
        this.svpLabels = result.svpLabels1;
        this.quad4Labels = result.quad4Labels1;
        this.selectedUsers = [...this.currentLabels];
        this.overallSummarySVP = '';
        this.overallSummaryQuad4 = '';
    }

    // ── TIER OPTIONS ───────────────────────────────────────────
    async loadTierOptions() {
        try {
            const values = await getTierPicklistValues();
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
            this.selectedTiers = values.filter(val =>
                defaultSelected.includes(val)
            );
        } catch (e) {
            console.error('Error loading tiers:', e);
        }
    }

    // ── ACCOUNT IDs ────────────────────────────────────────────
    async loadAccountIds() {
        try {
            const isSVP = this.activeTab === 'SVP';

            const svpUsers = isSVP
                ? (this.selectedUsers.length
                    ? this.selectedUsers
                    : this.svpLabels)
                : [];

            const quad4Users = !isSVP
                ? (this.selectedUsers.length
                    ? this.selectedUsers
                    : this.quad4Labels)
                : [];

            console.log('activeTab:', this.activeTab);
            console.log('svpUsers:', svpUsers);
            console.log('quad4Users:', quad4Users);

            const result = await getAccountIdsPerUser({
                svpUserNames: svpUsers,
                quad4UserNames: quad4Users,
                tiers: this.selectedTiers
            });

            // merge — keep existing tab data intact
            this.accountIdsPerUser = {
                ...this.accountIdsPerUser,
                ...result
            };

            console.log('Account IDs:',
                JSON.stringify(this.accountIdsPerUser));

        } catch (e) {
            console.error('Error in loadAccountIds:', e);
            throw e;
        }
    }

    // ── TILE DATA ──────────────────────────────────────────────
    // runs all users in parallel — Promise.all per user
    // updates tileData ONCE at end — one re-render only
    async loadTileData() {
        const userKeys = Object.keys(this.accountIdsPerUser)
            .filter(key =>
                this.activeTab === 'SVP'
                    ? key.startsWith('SVP_')
                    : key.startsWith('QUAD4_')
            );

        const results = await Promise.all(
            userKeys.map(async userKey => {
                // skip if already loaded
                if (this.tileData[userKey]) return null;

                const accountIds =
                    this.accountIdsPerUser[userKey];
                if (!accountIds?.length) return null;

                try {
                    const result = await getPromptDataForUser({
                        accountIds,
                        startDate: this.effectiveFrom,
                        endDate: this.effectiveTo
                    });

                    if (result) {
                        return {
                            key: userKey,
                            summary: this.parseTileData(
                                result, userKey)
                        };
                    }
                } catch (e) {
                    console.error(
                        'Tile data failed for',
                        userKey, e);
                }
                return null;
            })
        );

        // batch update tileData once
        // prevents multiple re-renders
        const newTileData = { ...this.tileData };
        results.forEach(r => {
            if (r?.key) newTileData[r.key] = r.summary;
        });
        this.tileData = newTileData;
    }

    // ── AI SUMMARY ─────────────────────────────────────────────
    // runs all users in parallel
    // updates aiSummaryMap ONCE at end — one re-render only
    async loadAISummary() {
        const userKeys = Object.keys(this.accountIdsPerUser)
            .filter(key =>
                this.activeTab === 'SVP'
                    ? key.startsWith('SVP_')
                    : key.startsWith('QUAD4_')
            );

        const results = await Promise.all(
            userKeys.map(async userKey => {
                const accountIds =
                    this.accountIdsPerUser[userKey];
                if (!accountIds?.length) {
                    return { key: userKey, summary: '' };
                }

                try {
                    const result = await getAISummaryForUser({
                        accountIds,
                        startDate: this.effectiveFrom,
                        endDate: this.effectiveTo
                    });

                    if (!result) {
                        return { key: userKey, summary: '' };
                    }

                    let parsed = result;
                    if (typeof result === 'string') {
                        const clean = result
                            .replace(/```json/g, '')
                            .replace(/```/g, '')
                            .trim();
                        parsed = JSON.parse(clean);
                    }

                    return {
                        key: userKey,
                        summary: this.buildNarrativeSummary(
                            parsed?.AI_Narrative_Summary__c)
                    };

                } catch (e) {
                    console.error(
                        'AI summary failed for',
                        userKey, e);
                    return { key: userKey, summary: '' };
                }
            })
        );

        // batch update once — one re-render only
        const newMap = { ...this.aiSummaryMap };
        results.forEach(r => {
            if (r) newMap[r.key] = r.summary;
        });
        this.aiSummaryMap = newMap;
    }

    // ── GENERATE SUMMARY ───────────────────────────────────────
    async handleGenerateSummary() {
        try {
            this.isLoading = true;
            this.isDirty = false;
            this.loadingMessage = 'Preparing AI insights...';

            // clear all data
            this.tileData = {};
            this.accountIdsPerUser = {};
            this.aiSummaryMap = {};
            this.overallSummarySVP = '';
            this.overallSummaryQuad4 = '';
            this.overallStatsSVP = null;
            this.overallStatsQuad4 = null;

            await this.loadAccountIds();

            this.loadingMessage = 'Generating AI insights...';

            // tile data and AI summary in parallel
            await Promise.all([
                this.loadTileData(),
                this.loadAISummary()
            ]);

        } catch (e) {
            console.error('Error generating summary:', e);
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }

    // ── TAB CHANGE ─────────────────────────────────────────────
    async handleTabChange(event) {
        const newTab =
            event.target.value || event.detail?.value;
        if (!newTab || newTab === this.activeTab) return;

        this.activeTab = newTab;
        this.showDropdown = false;
        this.isDirty = true;

        this.selectedUsers = this.activeTab === 'SVP'
            ? [...this.svpLabels]
            : [...this.quad4Labels];

        console.log('Tab changed to:', this.activeTab);

        const labelsForTab = this.activeTab === 'SVP'
            ? this.svpLabels : this.quad4Labels;

        const hasData = labelsForTab.some(label => {
            const key = this.activeTab === 'SVP'
                ? 'SVP_' + label : 'QUAD4_' + label;
            return !!this.tileData[key];
        });

        if (!hasData) {
            this.isLoading = true;
            try {
                await this.loadAccountIds();
                // parallel on tab change too
                await Promise.all([
                    this.loadTileData(),
                    this.loadAISummary()
                ]);
            } catch (e) {
                console.error('Error on tab change:', e);
            } finally {
                this.isLoading = false;
            }
        }
    }

    // ── OVERALL SVP ────────────────────────────────────────────
    async handleSvpViewToggle(event) {
        this.svpViewMode =
            event.currentTarget.dataset.view;

        if (this.svpViewMode === 'overall'
            && !this.overallStatsSVP) {
            this.isLoading = true;
            this.loadingMessage =
                'Generating SVP overall summary...';
            try {
                await this.loadOverallSummarySVP();
            } catch (e) {
                this.errorMessage =
                    'Failed to load SVP overall: '
                    + (e.body?.message || e.message);
                console.error(e);
            } finally {
                this.isLoading = false;
                this.loadingMessage = '';
            }
        }
    }

    async loadOverallSummarySVP() {
        const allSvpIds = Object.entries(
            this.accountIdsPerUser)
            .filter(([key]) => key.startsWith('SVP_'))
            .flatMap(([, ids]) => ids);

        if (!allSvpIds.length) return;

        // card data and summary text in parallel
        const [svpCardResult] = await Promise.all([
            getPromptDataForUser({
                accountIds: allSvpIds,
                startDate: this.effectiveFrom,
                endDate: this.effectiveTo
            })
        ]);

        if (svpCardResult) {
            const parsed = this.parseTileData(
                svpCardResult, 'SVP_OVERALL');
            if (parsed) this.overallStatsSVP = parsed;
        }

        const svpText = this.buildSummaryText('SVP_');
        if (svpText.trim()) {
            const svpResult = await getOverallPortfolioSummary({
                userSummariesJson: svpText
            });
            if (svpResult) {
                this.overallSummarySVP =
                    this.parseOverallSummary(svpResult);
            }
        }
    }

    // ── OVERALL QUAD4 ──────────────────────────────────────────
    async handleQuadViewToggle(event) {
        this.quadViewMode =
            event.currentTarget.dataset.view;

        if (this.quadViewMode === 'overall'
            && !this.overallStatsQuad4) {
            this.isLoading = true;
            this.loadingMessage =
                'Generating Quad4 overall summary...';
            try {
                await this.loadOverallSummaryQuad4();
            } catch (e) {
                this.errorMessage =
                    'Failed to load Quad4 overall: '
                    + (e.body?.message || e.message);
                console.error(e);
            } finally {
                this.isLoading = false;
                this.loadingMessage = '';
            }
        }
    }

    async loadOverallSummaryQuad4() {
        const allQuad4Ids = Object.entries(
            this.accountIdsPerUser)
            .filter(([key]) => key.startsWith('QUAD4_'))
            .flatMap(([, ids]) => ids);

        if (!allQuad4Ids.length) return;

        const quad4CardResult = await getPromptDataForUser({
            accountIds: allQuad4Ids,
            startDate: this.effectiveFrom,
            endDate: this.effectiveTo
        });

        if (quad4CardResult) {
            const parsed = this.parseTileData(
                quad4CardResult, 'QUAD4_OVERALL');
            if (parsed) this.overallStatsQuad4 = parsed;
        }

        const quad4Text = this.buildSummaryText('QUAD4_');
        if (quad4Text.trim()) {
            const quad4Result =
                await getOverallPortfolioSummary({
                    userSummariesJson: quad4Text
                });
            if (quad4Result) {
                this.overallSummaryQuad4 =
                    this.parseOverallSummary(quad4Result);
            }
        }
    }

    // ── BUILD SUMMARY TEXT (for overall narrative) ─────────────
    buildSummaryText(prefix) {
        let text = '';
        for (const userKey of Object.keys(this.tileData)) {
            if (!userKey.startsWith(prefix)) continue;
            const s = this.tileData[userKey];
            if (!s) continue;

            const isSVP = prefix === 'SVP_';
            const userName = userKey
                .replace('SVP_', '')
                .replace('QUAD4_', '');

            let userText =
                `\n${isSVP ? 'SVP' : 'Quad4'}: `
                + `${userName}\n`;
            userText +=
                `Total Engagements: `
                + `${s.totalEngagements || '0'}\n`;
            userText +=
                `WES: `
                + `${s.weightedEngagementScore || '0'}\n`;
            userText +=
                `Engagement Rate: `
                + `${s.engagementRate || '0%'}\n`;

            if (s.topChannels?.length) {
                userText += `Top Channels: ${s.topChannels.map(c =>
                    c.channel
                    + ' (volume: ' + c.volume
                    + ', response: '
                    + c.responseRate + ')'
                ).join(', ')}\n`;
            }
            if (s.lowChannels?.length) {
                userText += `Low Channels: ${s.lowChannels.map(c =>
                    c.channel
                    + ' (volume: ' + c.volume
                    + ', response: '
                    + c.responseRate + ')'
                ).join(', ')}\n`;
            }
            if (s.topEngagedAccounts?.length) {
                userText += `Top Accounts: ${s.topEngagedAccounts.map(a =>
                    a.name
                    + ' (' + a.industry
                    + ', ' + a.tier + ')'
                ).join(', ')}\n`;
            }
            if (s.lowEngagedAccounts?.length) {
                userText += `Low Accounts: ${s.lowEngagedAccounts.map(a =>
                    a.name + ' - ' + a.reason
                ).join(', ')}\n`;
            }
            if (s.channelMix?.length) {
                userText += `Channel Mix: ${s.channelMix.map(m =>
                    m.label + ': ' + m.pct + '%'
                ).join(', ')}\n`;
            }
            text += userText + '\n';
        }
        return text;
    }

    // ── PARSE TILE DATA ────────────────────────────────────────
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
                totalEngagements: parsed.totalEngagements || '',
                weightedEngagementScore: parsed.weightedEngagementScore || '',
                engagementRate: parsed.engagementRate || '',
                topChannels: parsed.Engagement_Channels_and_Performance__c
                    ?.['Top Performing Channels'] || [],
                lowChannels: parsed.Engagement_Channels_and_Performance__c
                    ?.['Low Performing Channels'] || [],
                topEngagedAccounts: parsed.topEngagedAccounts || [],
                lowEngagedAccounts: parsed.lowEngagedAccounts || [],
                contacts: Object.entries(
                    parsed.Contacts_Engaged__c || {})
                    .filter(([key]) => key !== 'totalUniqueContacts')
                    .map(([name, val]) => ({
                        name: name,
                        title: val.title,
                        score: val.score || ''
                    })),
                leastEngagedContacts: Object.entries(
                    parsed.Least_Engaged_Contacts__c || {})
                    .map(([name, val]) => ({
                        name: name,
                        title: val.title,
                        score: val.score || ''
                    })),
                totalUniqueContacts: parsed.Contacts_Engaged__c
                    ?.totalUniqueContacts || '',
                channelMix: (parsed.channelMix || [])
                    .map(m => ({
                        label: m.label,
                        pct: m.pct
                    })),
                keyTakeaways: parsed.Key_Takeaways_and_Recommendations__c || [],
                outreachCadence: parsed.outreachCadence || '',
                bestChannels: parsed.Collective_Engagement_Insights__c
                    ?.['Best Performing Channels'] || [],
                underperformingChannels: parsed.Collective_Engagement_Insights__c
                    ?.['Underperforming Channels'] || []
            };

        } catch (e) {
            console.error(
                'Error parsing tile data for', userKey, e);
            return null;
        }
    }

    // ── MODAL ──────────────────────────────────────────────────
    handleSummaryClick(event) {
        this.selectedSummary =
            event.currentTarget.dataset.summary;
        this.showSummaryModal = true;
    }

    closeSummaryModal() {
        this.showSummaryModal = false;
        this.selectedSummary = '';
    }

    // ── DATE FILTERS ───────────────────────────────────────────
    handleEffectiveFromChange(event) {
        this.effectiveFrom = event.detail.value;
        this.isDirty = true;
    }

    handleEffectiveToChange(event) {
        this.effectiveTo = event.detail.value;
        this.isDirty = true;
    }

    handleDateChange(e) {
        this.selectDateVal = e.detail.value;
        this.isDirty = true;
    }

    handleChange(e) {
        this.value = e.detail.value;
    }

    // ── TIER FILTER ────────────────────────────────────────────
    toggleTierDropdown() {
        this.showTierDropdown = !this.showTierDropdown;
    }

    handleTierMouseLeave() {
        this.showTierDropdown = false;
    }

    handleTierSelection(e) {
        const val = e.target.dataset.value;
        const checked = e.target.checked;

        this.tierOptions = this.tierOptions.map(t => ({
            ...t,
            selected: t.value === val ? checked : t.selected
        }));

        if (checked) {
            this.selectedTiers = [
                ...this.selectedTiers, val];
        } else {
            this.selectedTiers =
                this.selectedTiers.filter(t => t !== val);
        }

        this.isDirty = true;
    }

    // ── USER FILTER ────────────────────────────────────────────
    toggleDropdown() {
        this.showDropdown = !this.showDropdown;
    }

    handleMouseLeave() {
        this.showDropdown = false;
    }

    handleUserSelection(event) {
        const value = event.target.dataset.value;
        if (event.target.checked) {
            this.selectedUsers = [
                ...this.selectedUsers, value];
        } else {
            this.selectedUsers =
                this.selectedUsers.filter(
                    item => item !== value);
        }
        this.isDirty = true;
        console.log('Selected', this.selectedUsers);
    }

    // ── GETTERS ────────────────────────────────────────────────
    get currentLabels() {
        return this.activeTab === 'SVP'
            ? this.svpLabels : this.quad4Labels;
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
            ? this.svpLabels : this.quad4Labels;

        return labelsForTab
            .filter(label =>
                this.selectedUsers.includes(label))
            .map(label => {
                const key = this.activeTab === 'SVP'
                    ? 'SVP_' + label
                    : 'QUAD4_' + label;
                return {
                    label: label,
                    accountIds: this.accountIdsPerUser[key] || [],
                    summary: this.tileData[key] || null,
                    aiSummary: this.aiSummaryMap[key] || '',
                    isExpanded: false,
                    summaryClass: this.expandedTiles[label]
                        ? 'summary-card expanded'
                        : 'summary-card',
                    iconName: this.expandedTiles[label]
                        ? 'utility:minimize_window'
                        : 'utility:expand_alt'
                };
            });
    }

    get showSvpToggle() {
        return this.svpLabels?.length > 1;
    }

    get showQuadToggle() {
        return this.quad4Labels?.length > 1;
    }

    get isSvpUsersView() {
        return this.svpViewMode === 'users';
    }

    get isSvpOverallView() {
        return this.svpViewMode === 'overall';
    }

    get isQuadUsersView() {
        return this.quadViewMode === 'users';
    }

    get isQuadOverallView() {
        return this.quadViewMode === 'overall';
    }

    get svpUsersBtnClass() {
        return this.svpViewMode === 'users'
            ? 'toggle-btn toggle-btn--active'
            : 'toggle-btn';
    }

    get svpOverallBtnClass() {
        return this.svpViewMode === 'overall'
            ? 'toggle-btn toggle-btn--active'
            : 'toggle-btn';
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

    get showSVPTab() {
        return this.canViewSvpTab;
    }

    get showQuad4Tab() {
        return this.canViewQuad4Tab;
    }

    get hasError() {
        return !!this.errorMessage;
    }

    get isGenerateDisabled() {
        return this.isGenerating
            || this.isLoading
            || !this.isDirty;
    }

    get selectedTiersLabel() {
        if (!this.selectedTiers.length)
            return 'Choose tier';
        if (this.selectedTiers.length <= 2) {
            return this.tierOptions
                .filter(t =>
                    this.selectedTiers.includes(t.value))
                .map(t => t.label)
                .join(', ');
        }
        return `${this.selectedTiers[0]}, `
            + `${this.selectedTiers[1]} `
            + `+${this.selectedTiers.length - 2}`;
    }

    get selectedUsersLabel() {
        const users = this.selectedUsers.length
            ? this.selectedUsers
            : this.currentLabels;
        if (!users.length) return 'Select Users';
        if (users.length <= 2) return users.join(', ');
        return `${users[0]}, ${users[1]} `
            + `+${users.length - 2}`;
    }

    // ── NARRATIVE BUILDER ──────────────────────────────────────
    buildNarrativeSummary(narrative) {
        if (!narrative) return '';

        const sections = [];

        if (narrative.Cultivated_vs_New_Accounts__c) {
            const n = narrative.Cultivated_vs_New_Accounts__c;
            sections.push(this.section(
                'Cultivated vs. New Accounts', [
                n.recommendation,
                n.supportingDataPoint,
                n.explanation,
                n.actionStep
                    ? `Next step: ${n.actionStep}` : ''
            ]));
        }

        if (narrative.Outreach_Pattern_That_Works__c) {
            const n = narrative.Outreach_Pattern_That_Works__c;
            sections.push(this.section(
                'Outreach Pattern That Works', [
                n.stepOne,
                n.stepTwo,
                n.stepThree,
                n.trigger
                    ? `Trigger: ${n.trigger}` : '',
                n.explanation,
                n.actionStep
                    ? `Next step: ${n.actionStep}` : ''
            ]));
        }

        if (narrative.Confirmed_Active_vs_Quiet_Engagement__c) {
            const n =
                narrative.Confirmed_Active_vs_Quiet_Engagement__c;
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
            sections.push(this.section(
                'Confirmed Active vs Quiet Engagement',
                lines));
        }

        if (narrative.Engagement_Commonality_Across_Accounts__c) {
            const n =
                narrative.Engagement_Commonality_Across_Accounts__c;
            sections.push(this.section(
                'Common Engagement Patterns', [
                `Rising Pattern: ${n.risingEngagementCommonPattern}`,
                `Rising Accounts: ${(n.risingEngagementAccounts || []).join(', ')}`,
                `Falling Pattern: ${n.fallingEngagementCommonPattern}`,
                `Falling Accounts: ${(n.fallingEngagementAccounts || []).join(', ')}`,
                n.explanation
            ]));
        }

        if (narrative.Accounts_Falling_Behind_Peers__c
            ?.accounts?.length) {
            const list = [];
            narrative.Accounts_Falling_Behind_Peers__c
                .accounts.forEach(a => {
                    list.push(
                        `${a.name} (${a.industry}, ${a.tier})`);
                    list.push(a.metric);
                    list.push(a.likelyReason);
                    list.push(`Action: ${a.actionStep}`);
                });
            list.push(
                narrative.Accounts_Falling_Behind_Peers__c
                    .explanation);
            sections.push(this.section(
                'Accounts Falling Behind Peers', list));
        }

        if (narrative.Where_Effort_Is_Wasted__c) {
            const n = narrative.Where_Effort_Is_Wasted__c;
            sections.push(this.section(
                'Where Effort Is Wasted', [
                n.recommendation,
                n.supportingDataPoint,
                n.explanation,
                n.actionStep
            ]));
        }

        if (narrative.Over_Contacted_Accounts__c) {
            const list = [];
            narrative.Over_Contacted_Accounts__c
                .accounts?.forEach(a => {
                    list.push(`${a.name}: ${a.reason}`);
                    list.push(`Action: ${a.actionStep}`);
                });
            list.push(
                narrative.Over_Contacted_Accounts__c
                    .explanation);
            sections.push(this.section(
                'Over Contacted Accounts', list));
        }

        if (narrative.Negative_or_Zero_Engagement__c) {
            const list = [];
            narrative.Negative_or_Zero_Engagement__c
                .accounts?.forEach(a => {
                    list.push(`${a.name} - ${a.metric}`);
                    list.push(
                        `Re-engagement: ${a.reengagementAction}`);
                });
            narrative.Negative_or_Zero_Engagement__c
                .contacts?.forEach(c => {
                    list.push(`${c.name} (${c.title})`);
                    list.push(`Score: ${c.score}`);
                    list.push(
                        `Re-engagement: ${c.reengagementAction}`);
                });
            sections.push(this.section(
                'Negative / Zero Engagement', list));
        }

        if (narrative.Priority_Accounts_to_Act_On_Now__c
            ?.accounts?.length) {
            const list = [];
            narrative.Priority_Accounts_to_Act_On_Now__c
                .accounts.forEach(a => {
                    list.push(`${a.name}`);
                    list.push(a.metric);
                    list.push(a.whyNow);
                });
            sections.push(this.section(
                'Priority Accounts To Act On Now', list));
        }

        if (narrative.Other_Ways_to_Improve_Outreach__c) {
            const n =
                narrative.Other_Ways_to_Improve_Outreach__c;
            sections.push(this.section(
                'Other Ways To Improve Outreach', [
                n.recommendation,
                n.explanation,
                n.actionStep
            ]));
        }

        if (narrative.Best_Near_Term_Opportunities__c
            ?.accounts?.length) {
            const list = [];
            narrative.Best_Near_Term_Opportunities__c
                .accounts.forEach(a => {
                    list.push(`${a.name}`);
                    list.push(a.whyNow);
                });
            sections.push(this.section(
                'Best Near-Term Opportunities', list));
        }

        if (narrative.One_Behavioral_Change_That_Matters_Most__c) {
            const n =
                narrative.One_Behavioral_Change_That_Matters_Most__c;
            sections.push(this.section(
                'One Behavioral Change That Matters Most', [
                n.recommendation,
                n.supportingDataPoint,
                n.explanation,
                n.actionStep
            ]));
        }

        if (narrative.Direct_Marketing_Lead_Stage_Movement_Analysis) {
            const n =
                narrative.Direct_Marketing_Lead_Stage_Movement_Analysis;
            sections.push(this.section(
                'Direct Marketing Lead Stage Movement Analysis',
                [n.conclusion, n.detailedExplanation]
            ));
        }

        return sections.join('<br><br>');
    }

    section(title, lines) {
        const cleaned = lines
            .filter(Boolean)
            .map(line => this.stripMarkdown(line))
            .map(line =>
                this.removeLeadingTitleEcho(line, title))
            .map(line =>
                this.stripLeadingPunctuation(line))
            .filter(Boolean)
            .map(line => `&#8226; ${line}`);

        return `<strong>${title}</strong>`
            + `<br>${cleaned.join('<br>')}`;
    }

    stripMarkdown(text) {
        if (!text) return text;
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1');
    }

    stripLeadingPunctuation(text) {
        if (!text) return text;
        return text.replace(/^[\s\-•.]+/, '').trim();
    }

    removeLeadingTitleEcho(text, title) {
        if (!text) return text;
        const escaped = title.replace(
            /[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(
            `^${escaped}\\s*`, 'i');
        return text.replace(pattern, '').trim();
    }

    // ── OVERALL SUMMARY PARSER ─────────────────────────────────
    parseOverallSummary(rawResult) {
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
            return this.buildOverallSummaryHtml(parsed);
        } catch (e) {
            console.error(
                'Error parsing overall summary:', e);
            return '';
        }
    }

    buildOverallSummaryHtml(data) {
        if (!data) return '';

        const titles = {
            Portfolio_Wide_Engagement_Patterns__c:
                'Portfolio-Wide Engagement Patterns',
            Month_Over_Month_Shifts__c:
                'Month-Over-Month Shifts',
            Industries_Tiers_Engaging_Well__c:
                'Industries and Tiers Engaging Well by Channel',
            Industries_Not_Engaging_Well__c:
                'Industries Not Engaging Well by Channel',
            High_Effectiveness_Lower_Effort__c:
                'High Effectiveness with Lower Effort',
            Volume_vs_Diminishing_Returns__c:
                'Volume vs. Diminishing Returns',
            Optimal_Cadence_Stage_Movement__c:
                'Optimal Cadence for Stage Movement'
        };

        const sections = [];
        for (const key of Object.keys(titles)) {
            const s = data[key];
            if (!s) continue;

            const points = (s.insufficientData
                ? [s.insight || 'Insufficient data.']
                : (s.points || [])
            ).filter(Boolean)
                .map(p => this.stripMarkdown(p));

            sections.push(
                this.section(titles[key], points));
        }

        return sections.join('<br><br>');
    }
}