import { LightningElement, track } from 'lwc';
import getUserInfo from '@salesforce/apex/ProspectEngagementInsightsController.getUserInfo';
import getAccountIdsPerUser from '@salesforce/apex/ProspectEngagementInsightsController.getAccountIdsPerUser';
import getTierPicklistValues from '@salesforce/apex/ProspectEngagementInsightsController.getTierPicklistValues';
import getPromptDataForUser from '@salesforce/apex/ProspectEngagementInsightsController.getPromptDataForUser';
import getOverallPortfolioSummary from '@salesforce/apex/ProspectEngagementInsightsController.getOverallPortfolioSummary';
import getAISummaryForUser from '@salesforce/apex/ProspectEngagementInsightsController.getAISummaryForUser';

export default class ProspectEngagementInsights
    extends LightningElement {
    // ── STATE ──────────────────────────────────────────────────
    @track isLoading = false;
    @track loadingMessage = '';
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
    @track effectiveFrom = '';
    @track effectiveTo = '';
    @track showSummaryModal = false;
    @track selectedSummary = '';
    @track aiSummaryMap = {};
    //@track isDirty = false;
    @track overallPortfolioSummary = '';
    @track overallPortfolioLoading = false;
    @track overallPortfolioStats = null;
    @track appliedUsers = [];


    selectVal = 'svp';
    selectDateVal = '30';
    expandedTiles = {};

    productOptions = [
        { label: 'SVP top targets', value: 'svp' }
    ];

    // ── LIFECYCLE ──────────────────────────────────────────────
    async connectedCallback() {
        const today = new Date();
        this.effectiveTo = today.toISOString().split('T')[0];
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        this.effectiveFrom = twoYearsAgo.toISOString().split('T')[0];
        try {
            this.isLoading = true;
            this.loadingMessage = 'Preparing AI insights...';
            await Promise.all([
                this.loadTierOptions(),
                this.loadUserInfo()
            ]);
            await this.loadAccountIds();
            this.loadingMessage = 'Generating AI insights...';
            //await this.loadAllTileData();
             //this.isDirty = false;
        } catch (e) {
            this.errorMessage = 'Failed to load: '
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
        this.appliedUsers = [...this.currentLabels];
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
                defaultSelected.includes(val));
        } catch (e) {
            console.error('Error loading tiers:', e);
        }
    }

    // ── ACCOUNT IDs ────────────────────────────────────────────
    // Handles all three tabs explicitly. OVERALL fetches BOTH
    // svpLabels and quad4Labels (not the merged selectedUsers list),
    // so both real prefixes get populated correctly.
    async loadAccountIds() {
        try {
            let svpUsers = [];
            let quad4Users = [];

            if (this.activeTab === 'SVP') {
                svpUsers = this.selectedUsers.length
                    ? this.selectedUsers
                    : this.svpLabels;
            } else if (this.activeTab === 'Quad4') {
                quad4Users = this.selectedUsers.length
                    ? this.selectedUsers
                    : this.quad4Labels;
            } else if (this.activeTab === 'OVERALL') {
                svpUsers = this.svpLabels;
                quad4Users = this.quad4Labels;
            }

            const result = await getAccountIdsPerUser({
                svpUserNames: svpUsers,
                quad4UserNames: quad4Users,
                tiers: this.selectedTiers
            });

            this.accountIdsPerUser = {
                ...this.accountIdsPerUser,
                ...result
            };
        } catch (e) {
            console.error('Error in loadAccountIds:', e);
            throw e;
        }
    }

    // ── LOAD ALL TILE DATA ─────────────────────────────────────
    async loadAllTileData() {
        const userKeys = Object.keys(this.accountIdsPerUser).filter(key => {
            if (this.activeTab === 'OVERALL') return true;
            return this.activeTab === 'SVP'
                ? key.startsWith('SVP_')
                : key.startsWith('QUAD4_');
        });

        if (!userKeys.length) {
            console.warn('No user keys for tab:',
                this.activeTab);
            return;
        }

        await Promise.all(
            userKeys.map(userKey => this.loadSingleUserData(userKey))
        );
    }

    // ── SINGLE USER — card + AI simultaneously ─────────────────
    async loadSingleUserData(userKey) {
        if (this.tileData[userKey]) return;
        const accountIds = this.accountIdsPerUser[userKey];
        if (!accountIds?.length) {
            //console.warn(`No accounts for ${userKey} — skip`);
            return;
        }
       // console.log(`Loading ${userKey} — ` + `${accountIds.length} accounts`);

        let cardResult = null;
        let aiResult = null;

        try {
            [cardResult, aiResult] =
                await Promise.all([
                    getPromptDataForUser({
                        accountIds,
                        startDate: this.effectiveFrom,
                        endDate: this.effectiveTo
                    }),
                    getAISummaryForUser({
                        accountIds,
                        startDate: this.effectiveFrom,
                        endDate: this.effectiveTo
                    }).catch(e => {
                        console.error(
                            `AI call error ${userKey}:`,
                            e.body?.message || e.message);
                        return null;
                    })
                ]);
        } catch (e) {
            console.error(
                `Promise.all failed ${userKey}:`,
                e.message);
            return;
        }

        let summary = null;
        if (cardResult) {
            try {
                summary = this.parseTileData(
                    cardResult, userKey);
            } catch (e) {
                console.error(
                    `parseTileData failed ${userKey}:`,
                    e.message);
            }
        }

        let aiSummary = '';
        if (aiResult) {
            const parsed = this.safeParseJSON(
                aiResult, `aiSummary:${userKey}`);

            if (parsed
                && typeof parsed === 'object'
                && Object.keys(parsed).length > 0) {
                try {
                    aiSummary =
                        this.buildNarrativeSummary(parsed);
                } catch (buildErr) {
                    console.error(
                        `buildNarrativeSummary `
                        + `failed ${userKey}:`,
                        buildErr.message);
                }
            } else {
                console.warn(
                    !parsed
                        ? `${userKey} — JSON parse failed`
                        : `${userKey} — parsed JSON was empty`);
            }
        } else {
            console.warn(
                `${userKey} — aiResult null or empty`);
        }

        if (summary) {
            this.tileData = {
                ...this.tileData,
                [userKey]: summary
            };
        }

        this.aiSummaryMap = {
            ...this.aiSummaryMap,
            [userKey]: aiSummary
        };
    }

    // ── GENERATE SUMMARY ───────────────────────────────────────
    // FIX: loadAccountIds() now runs BEFORE loadOverallPortfolioSummary().
    async handleGenerateSummary() {
        try {
            this.isLoading = true;
            //this.isDirty = false;
            this.loadingMessage ='Preparing AI insights...';
            this.tileData = {};
            this.accountIdsPerUser = {};
            this.aiSummaryMap = {};
            this.overallPortfolioSummary = '';
            this.overallPortfolioStats = null;
            this.appliedUsers = [...this.selectedUsers];
            await this.loadAccountIds();
          /*  if (this.activeTab === 'OVERALL') {
                await this.loadOverallPortfolioSummary();
            }*/

            this.loadingMessage ='Generating AI insights...';

           // await this.loadAllTileData();

        } catch (e) {
            console.error(
                'Error generating summary:', e);
        } finally {
            this.isLoading = false;
            this.loadingMessage = '';
        }
    }

    // ── TAB CHANGE ─────────────────────────────────────────────
    async handleTabChange(event) {
        const newTab = event.target.value || event.detail?.value;
        if (!newTab || newTab === this.activeTab) return;
        this.activeTab = newTab;

        if (newTab === 'OVERALL') {
            this.selectedUsers = [
                ...new Set([
                    ...this.svpLabels,
                    ...this.quad4Labels
                ])
            ];

            // FIX: appliedUsers synced here too
            this.appliedUsers = [...this.selectedUsers];

           /* if (!this.overallPortfolioSummary) {
                await this.loadOverallPortfolioSummary();
            }*/

            return;
        }

        this.showDropdown = false;
        //this.isDirty = true;

        if (this.activeTab === 'SVP') {

            this.selectedUsers = [...this.svpLabels];

        } else if (this.activeTab === 'Quad4') {

            this.selectedUsers = [...this.quad4Labels];

        }

        this.appliedUsers = [...this.selectedUsers];

        const labelsForTab = this.activeTab === 'SVP' ? this.svpLabels : this.quad4Labels;

        const hasData = labelsForTab.some(label => {
            const key = this.activeTab === 'SVP'
                ? 'SVP_' + label : 'QUAD4_' + label;
            return !!this.tileData[key];
        });

        if (!hasData) {
            this.isLoading = true;
            this.loadingMessage = 'Generating AI insights...';
            try {
                await this.loadAccountIds();
                //await this.loadAllTileData();
            } catch (e) {
                console.error(
                    'Tab change error:', e);
            } finally {
                this.isLoading = false;
                this.loadingMessage = '';
            }
        }
    }

    // ── RETRY AI SUMMARY ───────────────────────────────────────
    async handleRetryAISummary(event) {
        const userKey = event.currentTarget.dataset.userkey;
        if (!userKey) return;
        const savedTile = this.tileData[userKey];
        const newTileData = { ...this.tileData };
        delete newTileData[userKey];
        this.tileData = newTileData;
        await this.loadSingleUserData(userKey);
        if (!this.tileData[userKey] && savedTile) {
            this.tileData = {
                ...this.tileData,
                [userKey]: savedTile
            };
        }
    }

    // ── OVERALL PORTFOLIO SUMMARY ───────────────────────────────
    async loadOverallPortfolioSummary() {

        if (this.overallPortfolioLoading) {
            return;
        }

        this.overallPortfolioLoading = true;

        try {

            const allAccountIds = [];

            this.appliedUsers.forEach(user => {

                const svpKey = 'SVP_' + user;
                const quadKey = 'QUAD4_' + user;

                if (this.accountIdsPerUser[svpKey]) {
                    allAccountIds.push(...this.accountIdsPerUser[svpKey]);
                }

                if (this.accountIdsPerUser[quadKey]) {
                    allAccountIds.push(...this.accountIdsPerUser[quadKey]);
                }

            });

            const uniqueAccountIds = [...new Set(allAccountIds)];

            if (!uniqueAccountIds.length) {
                this.overallPortfolioSummary = '';
                this.overallPortfolioStats = null;
                return;
            }

            const [statsResult, summaryResult] = await Promise.all([

                getPromptDataForUser({
                    accountIds: uniqueAccountIds,
                    startDate: this.effectiveFrom,
                    endDate: this.effectiveTo
                }),

                getOverallPortfolioSummary({
                    accountIds: uniqueAccountIds,
                    startDate: this.effectiveFrom,
                    endDate: this.effectiveTo
                })

            ]);

            if (statsResult) {
                this.overallPortfolioStats =
                    this.parseTileData(statsResult, 'OVERALL');
            } else {
                this.overallPortfolioStats = null;
            }

            if (!summaryResult) {
                this.overallPortfolioSummary = '';
                return;
            }

            const parsed = this.safeParseJSON(
                summaryResult,
                'overallPortfolio'
            );

            if (parsed) {
                this.overallPortfolioSummary =
                    this.formatOverallPortfolioSummary(parsed);
            } else {
                this.overallPortfolioSummary = summaryResult;
            }

        } catch (e) {

            console.error(e);

            this.overallPortfolioSummary = 'Unable to generate summary.';
            this.overallPortfolioStats = null;

        } finally {

            this.overallPortfolioLoading = false;

        }
    }

    formatOverallPortfolioSummary(summary) {

        if (!summary) return '';

        let html = '';

        Object.entries(summary).forEach(([key, value]) => {

            const heading = key
                .replace(/__c$/, '')
                .replace(/_/g, ' ');

            html += `<h2><b>${heading}</b></h2>`;

            if (value.insight) {

                const parts = value.insight
                    .trim()
                    .split('|')
                    .map(p => p.replace(/\|/g, '').trim())
                    .filter(Boolean);

                if (parts.length > 1) {

                    html += '<ul>';

                    parts.forEach(part => {

                        const cleanedPart = part
                            .replace(/\|+\s*$/g, '')
                            .replace(/\s+\|/g, '')
                            .trim();

                        html += `<li>${cleanedPart}</li>`;
                    });

                    html += '</ul>';

                } else {

                    html += `<p>${value.insight}</p>`;

                }
            }

            if (value.points?.length) {

                html += '<ul>';

                value.points.forEach(point => {
                    html += `<li>${point}</li>`;
                });

                html += '</ul>';
            }

            html += '<br/>';

        });

        return html;

    }

    // ── BUILD SUMMARY TEXT ─────────────────────────────────────
    buildSummaryText(prefix) {
        let text = '';
        for (const userKey of Object.keys(
            this.tileData)) {
            if (!userKey.startsWith(prefix)) continue;
            const s = this.tileData[userKey];
            if (!s) continue;

            const isSVP = prefix === 'SVP_';
            const userName = userKey
                .replace('SVP_', '')
                .replace('QUAD4_', '');

            let t = `\n${isSVP
                ? 'SVP' : 'Quad4'}: ${userName}\n`;
            t += `Total Engagements: `
                + `${s.totalEngagements || '0'}\n`;
            t += `WES: `
                + `${s.weightedEngagementScore || '0'}\n`;
            t += `Engagement Rate: `
                + `${s.engagementRate || '0%'}\n`;

            if (s.topChannels?.length) {
                t += `Top Channels: ${s.topChannels
                    .map(c => `${c.channel} `
                        + `(volume: ${c.volume}, `
                        + `response: ${c.responseRate})`)
                    .join(', ')}\n`;
            }
            if (s.lowChannels?.length) {
                t += `Low Channels: ${s.lowChannels
                    .map(c => `${c.channel} `
                        + `(volume: ${c.volume}, `
                        + `response: ${c.responseRate})`)
                    .join(', ')}\n`;
            }
            if (s.topEngagedAccounts?.length) {
                t += `Top Accounts: ${s.topEngagedAccounts
                    .map(a => `${a.name} `
                        + `(${a.industry}, ${a.tier})`)
                    .join(', ')}\n`;
            }
            if (s.lowEngagedAccounts?.length) {
                t += `Low Accounts: ${s.lowEngagedAccounts
                    .map(a => `${a.name} - ${a.reason}`)
                    .join(', ')}\n`;
            }
            if (s.channelMix?.length) {
                t += `Channel Mix: ${s.channelMix
                    .map(m => `${m.label}: ${m.pct}%`)
                    .join(', ')}\n`;
            }
            text += t + '\n';
        }
        return text;
    }

    // ── PARSE TILE DATA ────────────────────────────────────────
    parseTileData(rawResult, userKey) {
        try {
            const parsed = this.safeParseJSON(
                rawResult, `parseTileData:${userKey}`);
            if (!parsed) return null;

            return {
                totalEngagements:
                    parsed.totalEngagements || '',
                weightedEngagementScore:
                    parsed.weightedEngagementScore || '',
                engagementRate:
                    parsed.engagementRate || '',
                topChannels:
                    parsed.Engagement_Channels_and_Performance__c
                    ?.['Top Performing Channels'] || [],
                lowChannels:
                    parsed.Engagement_Channels_and_Performance__c
                    ?.['Low Performing Channels'] || [],
                topEngagedAccounts:
                    parsed.topEngagedAccounts || [],
                lowEngagedAccounts:
                    parsed.lowEngagedAccounts || [],
                contacts:
                    Object.entries(
                        parsed.Contacts_Engaged__c || {})
                        .filter(([key]) =>
                            key !== 'totalUniqueContacts')
                        .map(([name, val]) => ({
                            name,
                            title: val?.title || '',
                            score: val?.score || ''
                        })),
                leastEngagedContacts:
                    Object.entries(
                        parsed.Least_Engaged_Contacts__c
                        || {})
                        .map(([name, val]) => ({
                            name,
                            title: val?.title || '',
                            score: val?.score || ''
                        })),
                totalUniqueContacts:
                    parsed.Contacts_Engaged__c
                        ?.totalUniqueContacts || '',
                channelMix:
                    (parsed.channelMix || [])
                        .map(m => ({
                            label: m.label,
                            pct: m.pct
                        })),
                keyTakeaways:
                    parsed.Key_Takeaways_and_Recommendations__c
                    || [],
                outreachCadence:
                    parsed.outreachCadence || '',
                bestChannels:
                    parsed.Collective_Engagement_Insights__c
                    ?.['Best Performing Channels']
                    || [],
                underperformingChannels:
                    parsed.Collective_Engagement_Insights__c
                    ?.['Underperforming Channels']
                    || []
            };
        } catch (e) {
            console.error(
                'parseTileData failed for',
                userKey, e);
            return null;
        }
    }

    // ── SAFE JSON PARSE ────────────────────────────────────────
    safeParseJSON(raw, context = '') {
        if (!raw) {
            console.warn(
                `safeParseJSON: empty (${context})`);
            return null;
        }
        try {
            if (typeof raw === 'object') return raw;

            let text = String(raw).trim();

            text = text.replace(/\r\n/g, '\n');
            text = text.replace(/\r/g, '\n');

            text = text.replace(/^\uFEFF/, '');
            text = text.replace(/\u200B/g, '');
            text = text.replace(/\uFEFF/g, '');
            text = text.replace(/\u00A0/g, ' ');

            text = text.replace(/[\u201C\u201D]/g, '"');
            text = text.replace(/[\u2018\u2019]/g, "'");

            text = text
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/g, '')
                .trim();

            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');

            if (firstBrace === -1) {
                console.warn(
                    `safeParseJSON: no { found `
                    + `(${context})`);
                return null;
            }

            text = lastBrace > firstBrace
                ? text.slice(firstBrace, lastBrace + 1)
                : text.slice(firstBrace);

            const stripped = text.replace(/\s/g, '');
            if (stripped === '{}'
                || stripped === '{null}') {
                console.warn(
                    `safeParseJSON: empty object `
                    + `(${context})`);
                return null;
            }

            return JSON.parse(text);

        } catch (e) {
            console.error(
                `safeParseJSON failed (${context}):`,
                e.message);
            console.error('Raw:',
                String(raw).slice(0, 300));
            return this.tryRepairJSON(raw, context);
        }
    }

    // ── REPAIR TRUNCATED JSON ──────────────────────────────────
    tryRepairJSON(raw, context) {
        try {
            if (!raw || typeof raw !== 'string')
                return null;

            let text = String(raw)
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .replace(/^\uFEFF/, '')
                .replace(/\u200B/g, '')
                .replace(/\u00A0/g, ' ')
                .replace(/[\u201C\u201D]/g, '"')
                .replace(/[\u2018\u2019]/g, "'")
                .replace(/```json\s*/gi, '')
                .replace(/```\s*/g, '')
                .trim();

            const firstBrace = text.indexOf('{');
            if (firstBrace === -1) return null;

            text = text.slice(firstBrace);

            let open = 0;
            let inStr = false;
            let esc = false;

            for (const ch of text) {
                if (esc) { esc = false; continue; }
                if (ch === '\\' && inStr) {
                    esc = true; continue;
                }
                if (ch === '"') {
                    inStr = !inStr; continue;
                }
                if (inStr) continue;
                if (ch === '{') open++;
                if (ch === '}') open--;
            }

            if (open > 0) {
                if (inStr) text += '"';
                text += '}'.repeat(open);
                console.warn(
                    `tryRepairJSON: closed ${open} `
                    + `braces (${context})`);
            }

            const result = JSON.parse(text);
            if (!result
                || Object.keys(result).length === 0) {
                return null;
            }
            return result;

        } catch (e2) {
            console.error(
                `tryRepairJSON failed (${context}):`,
                e2.message);
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
        //this.isDirty = true;
    }

    handleEffectiveToChange(event) {
        this.effectiveTo = event.detail.value;
        //this.isDirty = true;
    }

    handleDateChange(e) {
        this.selectDateVal = e.detail.value;
       // this.isDirty = true;
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
            selected: t.value === val
                ? checked : t.selected
        }));
        if (checked) {
            this.selectedTiers = [
                ...this.selectedTiers, val];
        } else {
            this.selectedTiers =
                this.selectedTiers.filter(
                    t => t !== val);
        }
       // this.isDirty = true;
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
       // this.isDirty = true;
    }

    // ── GETTERS ────────────────────────────────────────────────
    get showOverallTab() {
        const svpCount = this.svpLabels?.length || 0;
        const quad4Count = this.quad4Labels?.length || 0;
        return (svpCount + quad4Count) > 1;
    }
    get hasOverallPortfolioSummary() {
        return !!this.overallPortfolioSummary;
    }
    get currentLabels() {
        if (this.activeTab === 'SVP') {
            return this.svpLabels;
        }
        if (this.activeTab === 'Quad4') {
            return this.quad4Labels;
        }
        return [
            ...new Set([
                ...this.svpLabels,
                ...this.quad4Labels
            ])
        ];
    }

    get userOptions() {
        return this.currentLabels.map(label => ({
            label,
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
                this.appliedUsers.includes(label))
            .map(label => {
                const key = this.activeTab === 'SVP'
                    ? 'SVP_' + label
                    : 'QUAD4_' + label;

                const aiSummary =
                    this.aiSummaryMap[key] || '';

                return {
                    label,
                    userKey: key,
                    accountIds:
                        this.accountIdsPerUser[key] || [],
                    summary:
                        this.tileData[key] || null,
                    aiSummary,
                    hasAiSummary: aiSummary.length > 0,
                    summaryClass:
                        this.expandedTiles[label]
                            ? 'summary-card expanded'
                            : 'summary-card',
                    iconName:
                        this.expandedTiles[label]
                            ? 'utility:minimize_window'
                            : 'utility:expand_alt'
                };
            });
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
    // get isGenerateDisabled() {
    //     console.log( 'isDirty:', this.isDirty, 'isLoading:', this.isLoading, 'isGenerating:', this.isGenerating );
    //     return this.isGenerating || this.isLoading  || !this.isDirty;
    // }
    get selectedTiersLabel() {
        if (!this.selectedTiers.length)
            return 'Choose tier';
        if (this.selectedTiers.length <= 2) {
            return this.tierOptions
                .filter(t =>
                    this.selectedTiers.includes(t.value))
                .map(t => t.label).join(', ');
        }
        return `${this.selectedTiers[0]}, `
            + `${this.selectedTiers[1]} `
            + `+${this.selectedTiers.length - 2}`;
    }
    get selectedUsersLabel() {
        const users = this.selectedUsers.length
            ? this.selectedUsers : this.currentLabels;
        if (!users.length) return 'Select Users';
        if (users.length <= 2) return users.join(', ');
        return `${users[0]}, ${users[1]} `
            + `+${users.length - 2}`;
    }

    // ── NARRATIVE BUILDER ──────────────────────────────────────
    // Matches the CURRENT prompt schema — 14 keys, no "__c" suffix,
    // each value is an ARRAY of bullet strings. Falls back to older
    // shapes ({evidence,insight} object, or plain string).
    buildNarrativeSummary(narrative) {
        if (!narrative || typeof narrative !== 'object') {
            return '';
        }

        const titles = {
            Cultivated_vs_New_Accounts:
                'Cultivated vs. New Accounts',
            Outreach_Pattern_That_Works:
                'Outreach Pattern That Works',
            Confirmed_Active_vs_Quiet_Engagement:
                'Confirmed Active vs Quiet Engagement',
            Engagement_Commonality_Across_Accounts:
                'Common Engagement Patterns',
            Accounts_Falling_Behind_Peers:
                'Accounts Falling Behind Peers',
            Where_Effort_Is_Wasted:
                'Where Effort Is Wasted',
            Over_Contacted_Accounts:
                'Over Contacted Accounts',
            Negative_Zero_Engagement_Accounts:
                'Negative / Zero Engagement',
            Priority_Accounts_To_Act_On_Now:
                'Priority Accounts To Act On Now',
            One_Behavioral_Change_That_Matters_Most:
                'One Behavioral Change That Matters Most',
            Direct_Marketing_Stage_Movement_Analysis:
                'Direct Marketing Stage Movement Analysis',
            Channel_Level_Performance:
                'Channel-Level Performance',
            Underused_High_Performing_Channels:
                'Underused High-Performing Channels',
            Regional_Engagement_Guidance:
                'Regional Engagement Guidance'
        };

        const actualKeyByTrimmed = {};
        for (const k of Object.keys(narrative)) {
            actualKeyByTrimmed[k.trim()] = k;
        }

        const sections = [];

        for (const key of Object.keys(titles)) {
            try {
                const actualKey = actualKeyByTrimmed[key];
                if (!actualKey) continue;

                const rawValue = narrative[actualKey];
                if (!rawValue) continue;

                let lines;
                let evidence = '';

                if (Array.isArray(rawValue)) {
                    lines = rawValue
                        .map(v => String(v).trim())
                        .filter(Boolean);
                } else if (typeof rawValue === 'object') {
                    const rawText = rawValue.insight
                        ? String(rawValue.insight).trim()
                        : '';
                    lines = rawText
                        ? rawText.split('|').map(p => p.replace(/\|/g, '').trim()).filter(Boolean)
                        : [];
                    evidence = rawValue.evidence
                        ? String(rawValue.evidence).trim()
                        : '';
                } else {
                    const rawText = String(rawValue).trim();
                    const parts = rawText
                        ? rawText.split('|').map(p => p.replace(/\|/g, '').trim()).filter(Boolean)
                        : [];
                    lines = parts.length > 1 ? parts : (rawText ? [rawText] : []);
                }

                if (!lines.length) continue;

                sections.push(this.section(titles[key], lines, evidence));
            } catch (e) {
                console.error(`Section ${key} failed:`, e.message);
            }
        }

        return sections.join('<br><br>');
    }

    // ── SECTION HELPER ─────────────────────────────────────────
    section(title, lines, evidence = '') {
        const cleaned = lines
            .filter(Boolean)
            .map(l => this.stripMarkdown(l))
            .map(l =>
                this.removeLeadingTitleEcho(l, title))
            .map(l =>
                this.stripLeadingPunctuation(l))
            .filter(Boolean)
            .map(l => `&#8226; ${l}`);

        let html = `<strong>${title}</strong>`
            + `<br>${cleaned.join('<br>')}`;

        if (evidence) {
            const cleanEvidence = this.stripMarkdown(evidence);
            html += `<br><em>Evidence: ${cleanEvidence}</em>`;
        }

        return html;
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
        return text.replace(
            new RegExp(`^${escaped}\\s*`, 'i'), '')
            .trim();
    }

    // ── OVERALL SUMMARY PARSER ─────────────────────────────────
    parseOverallSummary(rawResult) {
        const parsed = this.safeParseJSON(
            rawResult, 'parseOverallSummary');
        if (!parsed) {
            return typeof rawResult === 'string'
                ? rawResult : '';
        }
        return this.buildOverallSummaryHtml(parsed);
    }

    buildOverallSummaryHtml(data) {
        if (!data) return '';
        const titles = {
            Portfolio_Wide_Engagement_Patterns__c:
                'Portfolio-Wide Engagement Patterns',
            Month_Over_Month_Shifts__c:
                'Month-Over-Month Shifts',
            Industries_Tiers_Engaging_Well__c:
                'Industries and Tiers Engaging Well',
            Industries_Not_Engaging_Well__c:
                'Industries Not Engaging Well',
            High_Effectiveness_Lower_Effort__c:
                'High Effectiveness with Lower Effort',
            Volume_vs_Diminishing_Returns__c:
                'Volume vs. Diminishing Returns',
            Optimal_Cadence_Stage_Movement__c:
                'Optimal Cadence for Stage Movement',
            Direct_Marketing_Stage_Movement_Analysis:
                'Direct Marketing Stage Movement Analysis',
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
            if (points.length) sections.push(
                this.section(titles[key], points));
        }
        return sections.join('<br><br>');
    }
}