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
    @track overallPortfolioSummary = '';
    @track overallPortfolioLoading = false;

    selectVal = 'svp';
    selectDateVal = '30';
    expandedTiles = {};

    productOptions = [
        { label: 'SVP top targets', value: 'svp' }
    ];

    // ── LIFECYCLE ──────────────────────────────────────────────
    async connectedCallback() {
        const today = new Date();
        this.effectiveTo =
            today.toISOString().split('T')[0];
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(
            twoYearsAgo.getFullYear() - 2);
        this.effectiveFrom =
            twoYearsAgo.toISOString().split('T')[0];

        try {
            this.isLoading = true;
            this.loadingMessage = 'Preparing AI insights...';

            await Promise.all([
                this.loadTierOptions(),
                this.loadUserInfo()
            ]);

            await this.loadAccountIds();

            this.loadingMessage =
                'Generating AI insights...';

            await this.loadAllTileData();

            this.isDirty = false;

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
                defaultSelected.includes(val));
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
    // fires all users simultaneously
    // each user handled by loadSingleUserData
    async loadAllTileData() {
        const userKeys = Object.keys(
            this.accountIdsPerUser)
            .filter(key =>
                this.activeTab === 'SVP'
                    ? key.startsWith('SVP_')
                    : key.startsWith('QUAD4_')
            );

        if (!userKeys.length) {
            console.warn('No user keys for tab:',
                this.activeTab);
            return;
        }

        await Promise.all(
            userKeys.map(userKey =>
                this.loadSingleUserData(userKey))
        );
    }

    // ── SINGLE USER — card + AI simultaneously ─────────────────
    async loadSingleUserData(userKey) {
        if (this.tileData[userKey]) return;

        const accountIds =
            this.accountIdsPerUser[userKey];

        if (!accountIds?.length) {
            console.warn(
                `No accounts for ${userKey} — skip`);
            return;
        }

        console.log(`Loading ${userKey} — `
            + `${accountIds.length} accounts`);

        // ── fire both calls simultaneously ─────────────
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
                    // AI call — catch separately
                    // card always shows even if AI fails
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

        console.log(`${userKey} cardResult null:`,
            cardResult === null);
        console.log(`${userKey} aiResult null:`,
            aiResult === null);
        console.log(`${userKey} aiResult length:`,
            aiResult?.length || 0);
        console.log(`${userKey} aiResult first 200:`,
            String(aiResult || '').slice(0, 200));

        // ── parse card data ─────────────────────────────
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

        // ── parse AI narrative ──────────────────────────
        let aiSummary = '';
        if (aiResult) {
            const parsed = this.safeParseJSON(
                aiResult, `aiSummary:${userKey}`);

            console.log(`${userKey} parsed null:`,
                parsed === null);
            console.log(
                `${userKey} has AI_Narrative:`,
                !!parsed?.AI_Narrative_Summary__c);

            if (parsed?.AI_Narrative_Summary__c
                && typeof parsed.AI_Narrative_Summary__c
                === 'object'
                && Object.keys(
                    parsed.AI_Narrative_Summary__c)
                    .length > 0) {
                try {
                    aiSummary =
                        this.buildNarrativeSummary(
                            parsed.AI_Narrative_Summary__c
                        );
                    console.log(
                        `${userKey} aiSummary length:`,
                        aiSummary.length);
                } catch (buildErr) {
                    console.error(
                        `buildNarrativeSummary `
                        + `failed ${userKey}:`,
                        buildErr.message);
                }
            } else {
                if (!parsed) {
                    console.warn(
                        `${userKey} — JSON parse failed`);
                } else if (!parsed.AI_Narrative_Summary__c) {
                    console.warn(
                        `${userKey} — `
                        + `AI_Narrative_Summary__c missing`);
                    console.warn('Keys in parsed:',
                        Object.keys(parsed));
                } else {
                    console.warn(
                        `${userKey} — `
                        + `AI_Narrative_Summary__c empty`);
                }
            }
        } else {
            console.warn(
                `${userKey} — aiResult null or empty`);
        }

        // ── update UI immediately for this user ─────────
        if (summary) {
            this.tileData = {
                ...this.tileData,
                [userKey]: summary
            };
        }

        // always update — empty = retry button shows
        this.aiSummaryMap = {
            ...this.aiSummaryMap,
            [userKey]: aiSummary
        };

        console.log(`${userKey} — done`);
    }

    // ── GENERATE SUMMARY ───────────────────────────────────────
    async handleGenerateSummary() {
        try {
            this.isLoading = true;
            this.isDirty = false;
            this.loadingMessage =
                'Preparing AI insights...';

            this.tileData = {};
            this.accountIdsPerUser = {};
            this.aiSummaryMap = {};
            this.overallSummarySVP = '';
            this.overallSummaryQuad4 = '';
            this.overallStatsSVP = null;
            this.overallStatsQuad4 = null;

            await this.loadAccountIds();

            this.loadingMessage =
                'Generating AI insights...';

            await this.loadAllTileData();

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
        if (this.activeTab === 'OVERALL' && !this.overallPortfolioSummary) {
            await this.loadOverallPortfolioSummary();
        }
        const newTab = event.target.value || event.detail?.value;
        if (!newTab || newTab === this.activeTab) return;
        this.activeTab = newTab;
        this.showDropdown = false;
        this.isDirty = true;

        this.selectedUsers = this.activeTab === 'SVP'
            ? [...this.svpLabels]
            : [...this.quad4Labels];

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
                await this.loadAllTileData();
            } catch (e) {
                console.error(
                    'Tab change error:', e);
            } finally {
                this.isLoading = false;
            }
        }
    }

    // ── RETRY AI SUMMARY ───────────────────────────────────────
    async handleRetryAISummary(event) {
        const userKey =
            event.currentTarget.dataset.userkey;
        if (!userKey) return;

        console.log(`Retrying AI for ${userKey}`);

        // save card data before retry
        const savedTile = this.tileData[userKey];

        // temporarily remove so loadSingleUserData runs
        const newTileData = { ...this.tileData };
        delete newTileData[userKey];
        this.tileData = newTileData;

        // retry this one user
        await this.loadSingleUserData(userKey);

        // restore card data if retry lost it
        if (!this.tileData[userKey] && savedTile) {
            this.tileData = {
                ...this.tileData,
                [userKey]: savedTile
            };
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
                'Generating SVP overall...';
            try {
                await this.loadOverallSummarySVP();
            } catch (e) {
                this.errorMessage =
                    'Failed SVP overall: '
                    + (e.body?.message || e.message);
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

        const svpText =
            this.buildSummaryText('SVP_');

        const [svpCardResult, svpNarrativeResult] =
            await Promise.all([
                getPromptDataForUser({
                    accountIds: allSvpIds,
                    startDate: this.effectiveFrom,
                    endDate: this.effectiveTo
                }),
                svpText.trim()
                    ? getOverallPortfolioSummary({
                        userSummariesJson: svpText
                    }).catch(e => {
                        console.error(
                            'SVP narrative error:',
                            e.message);
                        return null;
                    })
                    : Promise.resolve(null)
            ]);

        if (svpCardResult) {
            const parsed = this.parseTileData(
                svpCardResult, 'SVP_OVERALL');
            if (parsed) this.overallStatsSVP = parsed;
        }

        if (svpNarrativeResult) {
            const parsed = this.safeParseJSON(
                svpNarrativeResult, 'overallSVP');
            if (parsed?.AI_Narrative_Summary__c) {
                this.overallSummarySVP =
                    this.buildNarrativeSummary(
                        parsed.AI_Narrative_Summary__c);
            } else {
                this.overallSummarySVP =
                    this.parseOverallSummary(
                        svpNarrativeResult);
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
                'Generating Quad4 overall...';
            try {
                await this.loadOverallSummaryQuad4();
            } catch (e) {
                this.errorMessage =
                    'Failed Quad4 overall: '
                    + (e.body?.message || e.message);
            } finally {
                this.isLoading = false;
                this.loadingMessage = '';
            }
        }
    }

    async loadOverallSummaryQuad4() {
        const allQuad4Ids = Object.entries(
            this.accountIdsPerUser)
            .filter(([key]) =>
                key.startsWith('QUAD4_'))
            .flatMap(([, ids]) => ids);

        if (!allQuad4Ids.length) return;

        const quad4Text =
            this.buildSummaryText('QUAD4_');

        const [quad4CardResult, quad4NarrativeResult] =
            await Promise.all([
                getPromptDataForUser({
                    accountIds: allQuad4Ids,
                    startDate: this.effectiveFrom,
                    endDate: this.effectiveTo
                }),
                quad4Text.trim()
                    ? getOverallPortfolioSummary({
                        userSummariesJson: quad4Text
                    }).catch(e => {
                        console.error(
                            'Quad4 narrative error:',
                            e.message);
                        return null;
                    })
                    : Promise.resolve(null)
            ]);

        if (quad4CardResult) {
            const parsed = this.parseTileData(
                quad4CardResult, 'QUAD4_OVERALL');
            if (parsed) this.overallStatsQuad4 = parsed;
        }

        if (quad4NarrativeResult) {
            const parsed = this.safeParseJSON(
                quad4NarrativeResult, 'overallQuad4');
            if (parsed?.AI_Narrative_Summary__c) {
                this.overallSummaryQuad4 =
                    this.buildNarrativeSummary(
                        parsed.AI_Narrative_Summary__c);
            } else {
                this.overallSummaryQuad4 =
                    this.parseOverallSummary(
                        quad4NarrativeResult);
            }
        }
    }

    async loadOverallPortfolioSummary() {

        this.overallPortfolioLoading = true;

        try {

            // Merge all account ids
            const allAccountIds = [
                ...new Set(
                    Object.values(this.accountIdsPerUser)
                        .flat()
                )
            ];

            if (!allAccountIds.length) {
                this.overallPortfolioSummary = '';
                return;
            }

            const result =
                await getOverallPortfolioSummary({

                    accountIds: allAccountIds,

                    startDate: this.effectiveFrom,

                    endDate: this.effectiveTo

                });

            if (!result) {
                this.overallPortfolioSummary = '';
                return;
            }

            const parsed = this.safeParseJSON(
                result,
                'overallPortfolio'
            );

            if (
                parsed &&
                parsed.AI_Narrative_Summary__c
            ) {

                this.overallPortfolioSummary =
                    this.buildNarrativeSummary(
                        parsed.AI_Narrative_Summary__c
                    );

            } else {

                this.overallPortfolioSummary = result;

            }

        }
        catch (e) {

            console.error(e);

            this.overallPortfolioSummary =
                'Unable to generate summary.';

        }
        finally {

            this.overallPortfolioLoading = false;

        }

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

            // remove carriage returns
            text = text.replace(/\r\n/g, '\n');
            text = text.replace(/\r/g, '\n');

            // remove invisible characters
            text = text.replace(/^\uFEFF/, '');
            text = text.replace(/\u200B/g, '');
            text = text.replace(/\uFEFF/g, '');
            text = text.replace(/\u00A0/g, ' ');

            // fix smart quotes
            text = text.replace(/[\u201C\u201D]/g, '"');
            text = text.replace(/[\u2018\u2019]/g, "'");

            // strip markdown
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

            // check for empty object
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
    }

    // ── GETTERS ────────────────────────────────────────────────
    get showOverallTab() {
        // show if total visible users > 1
        // counts both SVP and Quad4 selected users
        const svpCount = this.svpLabels?.length || 0;
        const quad4Count = this.quad4Labels?.length || 0;
        return (svpCount + quad4Count) > 1;
    }
    get hasOverallPortfolioSummary() {
    return !!this.overallPortfolioSummary;
}
    get currentLabels() {
        return this.activeTab === 'SVP'
            ? this.svpLabels : this.quad4Labels;
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
                this.selectedUsers.includes(label))
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
    buildNarrativeSummary(narrative) {
        if (!narrative
            || typeof narrative !== 'object') {
            return '';
        }

        const sections = [];

        const add = (key, title, linesFn) => {
            try {
                if (narrative[key]) {
                    const lines = linesFn(narrative[key])
                        .filter(Boolean);
                    if (lines.length) {
                        sections.push(
                            this.section(title, lines));
                    }
                }
            } catch (e) {
                console.error(
                    `Section ${key} failed:`, e.message);
            }
        };

        add('Cultivated_vs_New_Accounts__c',
            'Cultivated vs. New Accounts', n => [
                n?.recommendation,
                n?.supportingDataPoint,
                n?.explanation,
                n?.actionStep
                    ? `Next step: ${n.actionStep}` : ''
            ]);

        add('Outreach_Pattern_That_Works__c',
            'Outreach Pattern That Works', n => [
                n?.stepOne,
                n?.stepTwo,
                n?.stepThree,
                n?.trigger
                    ? `Trigger: ${n.trigger}` : '',
                n?.explanation,
                n?.actionStep
                    ? `Next step: ${n.actionStep}` : ''
            ]);

        try {
            const n =
                narrative
                    .Confirmed_Active_vs_Quiet_Engagement__c;
            if (n) {
                const lines = [];
                if (n?.confirmedActive?.length) {
                    lines.push('Confirmed Active:');
                    n.confirmedActive.forEach(a => {
                        if (a?.name && a?.evidence)
                            lines.push(
                                `${a.name} — ${a.evidence}`);
                    });
                }
                if (n?.quietPassiveOnly?.length) {
                    lines.push('Quiet / Passive Only:');
                    n.quietPassiveOnly.forEach(a => {
                        if (a?.name)
                            lines.push(
                                `${a.name} — `
                                + `${a.evidence || ''}`);
                    });
                }
                if (n?.looksEngagedButUnconfirmed?.length) {
                    lines.push(
                        'Looks Engaged but Unconfirmed:');
                    n.looksEngagedButUnconfirmed.forEach(
                        a => {
                            if (a?.name)
                                lines.push(
                                    `${a.name} — `
                                    + `${a.reason || ''}`);
                        });
                }
                if (n?.explanation)
                    lines.push(n.explanation);
                if (lines.length) sections.push(
                    this.section(
                        'Confirmed Active vs '
                        + 'Quiet Engagement', lines));
            }
        } catch (e) {
            console.error(
                'Confirmed_Active section failed:',
                e.message);
        }

        add('Engagement_Commonality_Across_Accounts__c',
            'Common Engagement Patterns', n => [
                n?.risingEngagementCommonPattern
                    ? `Rising: `
                    + n.risingEngagementCommonPattern
                    : '',
                n?.risingEngagementAccounts?.length
                    ? `Rising Accounts: `
                    + n.risingEngagementAccounts
                        .join(', ')
                    : '',
                n?.fallingEngagementCommonPattern
                    ? `Falling: `
                    + n.fallingEngagementCommonPattern
                    : '',
                n?.fallingEngagementAccounts?.length
                    ? `Falling Accounts: `
                    + n.fallingEngagementAccounts
                        .join(', ')
                    : '',
                n?.explanation
            ]);

        try {
            const n =
                narrative.Accounts_Falling_Behind_Peers__c;
            if (n?.accounts?.length) {
                const list = [];
                n.accounts.forEach(a => {
                    if (!a) return;
                    if (a.name) list.push(
                        `${a.name} `
                        + `(${a.industry || ''}, `
                        + `${a.tier || ''})`);
                    if (a.metric) list.push(a.metric);
                    if (a.likelyReason)
                        list.push(a.likelyReason);
                    if (a.actionStep)
                        list.push(
                            `Action: ${a.actionStep}`);
                });
                if (n.explanation)
                    list.push(n.explanation);
                if (list.length) sections.push(
                    this.section(
                        'Accounts Falling Behind Peers',
                        list));
            }
        } catch (e) {
            console.error(
                'Accounts_Falling_Behind failed:',
                e.message);
        }

        add('Where_Effort_Is_Wasted__c',
            'Where Effort Is Wasted', n => [
                n?.recommendation,
                n?.supportingDataPoint,
                n?.explanation,
                n?.actionStep
            ]);

        try {
            const n =
                narrative.Over_Contacted_Accounts__c;
            if (n) {
                const list = [];
                n.accounts?.forEach(a => {
                    if (!a) return;
                    if (a.name) list.push(
                        `${a.name}: ${a.reason || ''}`);
                    if (a.actionStep)
                        list.push(
                            `Action: ${a.actionStep}`);
                });
                if (n.explanation)
                    list.push(n.explanation);
                if (list.length) sections.push(
                    this.section(
                        'Over Contacted Accounts', list));
            }
        } catch (e) {
            console.error(
                'Over_Contacted failed:', e.message);
        }

        try {
            const n =
                narrative.Negative_or_Zero_Engagement__c;
            if (n) {
                const list = [];
                n.accounts?.forEach(a => {
                    if (!a) return;
                    if (a.name) list.push(
                        `${a.name} — ${a.metric || ''}`);
                    if (a.reengagementAction)
                        list.push(
                            `Re-engage: `
                            + a.reengagementAction);
                });
                n.contacts?.forEach(c => {
                    if (!c) return;
                    if (c.name) list.push(
                        `${c.name} (${c.title || ''})`);
                    if (c.score)
                        list.push(`Score: ${c.score}`);
                    if (c.reengagementAction)
                        list.push(
                            `Re-engage: `
                            + c.reengagementAction);
                });
                if (list.length) sections.push(
                    this.section(
                        'Negative / Zero Engagement',
                        list));
            }
        } catch (e) {
            console.error(
                'Negative_Zero failed:', e.message);
        }

        try {
            const n =
                narrative
                    .Priority_Accounts_to_Act_On_Now__c;
            if (n?.accounts?.length) {
                const list = [];
                n.accounts.forEach(a => {
                    if (!a) return;
                    if (a.name) list.push(a.name);
                    if (a.metric) list.push(a.metric);
                    if (a.whyNow) list.push(a.whyNow);
                });
                if (list.length) sections.push(
                    this.section(
                        'Priority Accounts To Act On Now',
                        list));
            }
        } catch (e) {
            console.error(
                'Priority_Accounts failed:', e.message);
        }

        add('Other_Ways_to_Improve_Outreach__c',
            'Other Ways To Improve Outreach', n => [
                n?.recommendation,
                n?.explanation,
                n?.actionStep
            ]);

        try {
            const n =
                narrative.Best_Near_Term_Opportunities__c;
            if (n?.accounts?.length) {
                const list = [];
                n.accounts.forEach(a => {
                    if (!a) return;
                    if (a.name) list.push(a.name);
                    if (a.whyNow) list.push(a.whyNow);
                });
                if (list.length) sections.push(
                    this.section(
                        'Best Near-Term Opportunities',
                        list));
            }
        } catch (e) {
            console.error(
                'Best_Near_Term failed:', e.message);
        }

        add('One_Behavioral_Change_That_Matters_Most__c',
            'One Behavioral Change That Matters Most',
            n => [
                n?.recommendation,
                n?.supportingDataPoint,
                n?.explanation,
                n?.actionStep
            ]);

        try {
            const n =
                narrative
                    .Direct_Marketing_Lead_Stage_Movement_Analysis;
            if (n) {
                const lines = [];
                if (n?.conclusion)
                    lines.push(n.conclusion);
                if (n?.detailedExplanation) {
                    n.detailedExplanation
                        .split(/\(\d+\)/)
                        .map(s => s.trim())
                        .filter(Boolean)
                        .forEach(s => lines.push(s));
                }
                if (lines.length) sections.push(
                    this.section(
                        'Direct Marketing Stage '
                        + 'Movement Analysis', lines));
            }
        } catch (e) {
            console.error(
                'Stage_Movement failed:', e.message);
        }

        return sections.join('<br><br>');
    }

    // ── SECTION HELPER ─────────────────────────────────────────
    section(title, lines) {
        const cleaned = lines
            .filter(Boolean)
            .map(l => this.stripMarkdown(l))
            .map(l =>
                this.removeLeadingTitleEcho(l, title))
            .map(l =>
                this.stripLeadingPunctuation(l))
            .filter(Boolean)
            .map(l => `&#8226; ${l}`);
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