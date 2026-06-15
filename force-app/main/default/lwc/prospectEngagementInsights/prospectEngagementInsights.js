import { LightningElement, track } from 'lwc';
//import sendPortfolioEngagementPrompt from '@salesforce/apex/ProspectEngagementInsightsController.sendPortfolioEngagementPrompt';
import getUserInfo from '@salesforce/apex/ProspectEngagementInsightsController.getUserInfo';
//import getPromptForTile from '@salesforce/apex/ProspectEngagementInsightsController.getPromptForTile';
//import getFilteredAccountsForTiles from '@salesforce/apex/ProspectEngagementInsightsController.getFilteredAccountsForTiles';
export default class ProspectEngagementInsights extends LightningElement {
      test = {
    SVP: {
        'Andrew Clare': {
            totalEngagements: '1,240',
            effectivenessScore: '62',
            topEngagedAccounts: [
                'Acme Corp',
                'GlobalTech Inc',
                'Horizon Group'
            ],
            topChannels: [
                'Newsletters — 3% open rate, 3% click-through',
                'Mass Email — 100% completion rate'
            ],
            contacts: [
                'Jane Doe — VP Finance',
                'Mark Smith — CFO',
                'Lisa Ray — HR Director'
            ],
            lowEngagedAccounts: [
                'X Corp',
                'Y Corp',
                'Z Corp'
            ],
            lowChannels: [
                'LinkedIn — 0.4% engagement',
                'Webinars — 6.25% attendance'
            ],
            channelMix: [
                { label: 'Email',    pct: 50, color: '#0176d3' },
                { label: 'Calls',    pct: 30, color: '#2e7d32' },
                { label: 'Meetings', pct: 20, color: '#888'    }
            ],
            summaryText: 'Strong email engagement. Focus on converting webinar invites to improve overall reach across key accounts.'
        },
        'Christine Jasek': {
            totalEngagements: '840',
            effectivenessScore: '38',
            topEngagedAccounts: [
                'TechCorp',
                'MediGroup',
                'BridgeCo'
            ],
            topChannels: [
                'Calls — 45% connection rate',
                'Meetings — 3 C-suite sessions this quarter'
            ],
            contacts: [
                'Tom Lee — CFO',
                'Sara Ray — VP Operations'
            ],
            lowEngagedAccounts: [
                'Alpha Corp',
                'Beta Ltd'
            ],
            lowChannels: [
                'Email — 1.2% open rate',
                'Webinars — no attendance recorded'
            ],
            channelMix: [
                { label: 'Calls',    pct: 45, color: '#0176d3' },
                { label: 'Meetings', pct: 35, color: '#2e7d32' },
                { label: 'Email',    pct: 20, color: '#888'    }
            ],
            summaryText: 'Call and meeting engagement strong. Email personalisation needed to lift open rates in Q3.'
        },
        'Danielle Peacock': {
            totalEngagements: '2,100',
            effectivenessScore: '81',
            topEngagedAccounts: [
                'Acme Corp',
                'GlobalTech',
                'Horizon Inc'
            ],
            topChannels: [
                'Email — 8% open rate, top performer',
                'Webinars — 72% attendance rate'
            ],
            contacts: [
                'Amy Wong — VP HR',
                'Chris Park — Director',
                'Rita James — Manager'
            ],
            lowEngagedAccounts: [
                'Gamma Corp',
                'Delta Ltd'
            ],
            lowChannels: [
                'LinkedIn — 0.4% engagement'
            ],
            channelMix: [
                { label: 'Email',    pct: 55, color: '#0176d3' },
                { label: 'Webinars', pct: 30, color: '#2e7d32' },
                { label: 'LinkedIn', pct: 15, color: '#888'    }
            ],
            summaryText: 'Highest portfolio engagement. Email and webinar combination highly effective. Review LinkedIn strategy.'
        },
        'Michael Torres': {
            totalEngagements: '560',
            effectivenessScore: '44',
            topEngagedAccounts: [
                'SkyTech',
                'CoreGroup'
            ],
            topChannels: [
                'Meetings — 90% show rate across 5 sessions',
                'Calls — 38% connect rate'
            ],
            contacts: [
                'Paul Green — CEO',
                'Nina Patel — VP Sales'
            ],
            lowEngagedAccounts: [
                'Omega Ltd',
                'Sigma Corp',
                'Lambda Inc'
            ],
            lowChannels: [
                'Email newsletters — 0.8% open rate',
                'Webinars — no attendance this quarter'
            ],
            channelMix: [
                { label: 'Meetings', pct: 60, color: '#0176d3' },
                { label: 'Calls',    pct: 30, color: '#2e7d32' },
                { label: 'Email',    pct: 10, color: '#888'    }
            ],
            summaryText: 'In-person engagement is the clear strength. Digital channels underutilised — targeted email push recommended.'
        },
        'Sarah Johnson': {
            totalEngagements: '990',
            effectivenessScore: '71',
            topEngagedAccounts: [
                'NovaCorp',
                'Apex Group',
                'BlueRidge Ltd'
            ],
            topChannels: [
                'Email campaigns — 6.5% open rate',
                'Webinars — 55% attendance across 4 sessions'
            ],
            contacts: [
                'Emma Clark — CHRO',
                'David Kim — VP Finance'
            ],
            lowEngagedAccounts: [
                'Zeta Corp'
            ],
            lowChannels: [
                'Direct mail — no response recorded'
            ],
            channelMix: [
                { label: 'Email',    pct: 50, color: '#0176d3' },
                { label: 'Webinars', pct: 40, color: '#2e7d32' },
                { label: 'Mail',     pct: 10, color: '#888'    }
            ],
            summaryText: 'Consistent performer with strong digital engagement. Direct mail can be deprioritised. Increase webinar frequency.'
        }
    },
    Quad4: {
        'James Park': {
            totalEngagements: '320',
            effectivenessScore: '29',
            topEngagedAccounts: [
                'RedStar Corp'
            ],
            topChannels: [
                'Calls — 28% connect rate'
            ],
            contacts: [
                'Kevin Brown — VP Operations'
            ],
            lowEngagedAccounts: [
                'PineCo',
                'MapleGroup',
                'OakLtd'
            ],
            lowChannels: [
                'Email — 0.5% open rate',
                'Webinars — 8% attendance'
            ],
            channelMix: [
                { label: 'Calls', pct: 70, color: '#0176d3' },
                { label: 'Email', pct: 20, color: '#2e7d32' },
                { label: 'Other', pct: 10, color: '#888'    }
            ],
            summaryText: 'Heavily reliant on phone calls. Broadening the channel mix is critical for Q3 improvement.'
        },
        'Linda Wu': {
            totalEngagements: '740',
            effectivenessScore: '55',
            topEngagedAccounts: [
                'BlueSky Inc',
                'ClearPath Corp'
            ],
            topChannels: [
                'Email — 4.2% open rate',
                'Meetings — 4 executive meetings held'
            ],
            contacts: [
                'Helen Ford — CTO',
                'Ray Chen — VP Engineering'
            ],
            lowEngagedAccounts: [
                'StormCo',
                'WindGroup'
            ],
            lowChannels: [
                'Webinars — 12% attendance'
            ],
            channelMix: [
                { label: 'Email',    pct: 45, color: '#0176d3' },
                { label: 'Meetings', pct: 40, color: '#2e7d32' },
                { label: 'Webinars', pct: 15, color: '#888'    }
            ],
            summaryText: 'Solid email and meeting performance. Webinar engagement needs attention — consider smaller targeted sessions.'
        },
        'Carlos Mendez': {
            totalEngagements: '1,050',
            effectivenessScore: '68',
            topEngagedAccounts: [
                'SunriseCo',
                'DawnGroup',
                'MorningLtd'
            ],
            topChannels: [
                'Webinars — 65% attendance across 3 sessions',
                'Email — 5.8% open rate'
            ],
            contacts: [
                'Anna White — CFO',
                'Bob King — VP HR',
                'Carol Stone — Director'
            ],
            lowEngagedAccounts: [
                'NightCo'
            ],
            lowChannels: [
                'LinkedIn — 0.2% response rate'
            ],
            channelMix: [
                { label: 'Webinars', pct: 50, color: '#0176d3' },
                { label: 'Email',    pct: 35, color: '#2e7d32' },
                { label: 'LinkedIn', pct: 15, color: '#888'    }
            ],
            summaryText: 'Strong webinar performance. LinkedIn strategy should be revisited. Maintain current email and webinar cadence.'
        },
        'Emily Nguyen': {
            totalEngagements: '480',
            effectivenessScore: '42',
            topEngagedAccounts: [
                'SpringCo',
                'SummerGroup'
            ],
            topChannels: [
                'Calls — 35% connection rate',
                'Email — 3.1% open rate'
            ],
            contacts: [
                'Mike Ross — VP Sales',
                'Kate Liu — Director'
            ],
            lowEngagedAccounts: [
                'WinterCo',
                'AutumnLtd'
            ],
            lowChannels: [
                'Events — 0 registrations from 2 invitations'
            ],
            channelMix: [
                { label: 'Calls',  pct: 55, color: '#0176d3' },
                { label: 'Email',  pct: 35, color: '#2e7d32' },
                { label: 'Events', pct: 10, color: '#888'    }
            ],
            summaryText: 'Call engagement is the primary strength. Events are an untapped opportunity — consider smaller curated sessions.'
        }
    }
}
    @track isLoading = false;
    @track sections = [];
    @track canViewSvpTab = false;
    @track canViewQuad4Tab = false;
    @track activeTab = 'SVP';
    @track quad4Labels = [];
    @track svpLabels = [];
    @track showDropdown = false;
    selectedUsers = [];
    @track isLoading = false;
    @track errorMessage = '';
    selectVal = 'svp';
    selectDateVal = '30';
    value = ['Tier1', 'Tier2'];
    tierOptions = [
        { label: 'Tier 1', value: 'Tier1', checked: true },
        { label: 'Tier 2', value: 'Tier2', checked: true },
        { label: 'Tier 3', value: 'Tier3', checked: false },
        { label: 'Tier 4', value: 'Tier4', checked: false },
    ];
    productOptions = [
        { label: 'SVP top targets', value: 'svp' }
    ];
    get options() {
        return [
            { label: 'Tier 1', value: 'Tier1', checked: true },
            { label: 'Tier 2', value: 'Tier2', checked: true },
            { label: 'Tier 3', value: 'Tier3', checked: false },
            { label: 'Tier 4', value: 'Tier4', checked: false },
            { label: 'Tier 5', value: 'Tier5', checked: false },
            { label: 'Tier 5', value: 'Tier5', checked: false },
            { label: 'Tier 5', value: 'Tier5', checked: false },
            { label: 'Tier 5', value: 'Tier5', checked: false },
        ];
    }
    dateOptions = [
        { label: 'Last 30 Days', value: '30' },
        { label: 'Last 60 Days', value: '60' },
        { label: 'Last 90 Days', value: '90' }
    ];
    async connectedCallback() {
        this.Loading = true;
        try {
            const result = await getUserInfo();
            this.canViewQuad4Tab = result.canViewQuad4Tab;
            this.canViewSvpTab = result.canViewSvpTab;
            this.activeTab = result.defaultTeam;
            this.svpLabels = result.svpLabels1;
            this.quad4Labels = result.quad4Labels1;
            this.selectedUsers = [...this.currentLabels];
        }
        catch (e) {
            this.errorMessage = 'Failed to load access info: ' + e.body?.message || e.message;
            console.error(e);
        } finally {
            this.isLoading = false;
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
            //return this.currentLabels;
                    return [];

        }
        return this.currentLabels.filter(label =>
            this.selectedUsers.includes(label)
        );
    }




    //For Tier Filters
    handleChange(e) {
        this.value = e.detail.value;
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

        this.value = e.detail.value;
    }
    

    get selectedUsersLabel() {
    const users = this.selectedUsers.length ? this.selectedUsers: this.currentLabels;
    if (users.length === 0) {
        return 'Select Users';
    }
    if (users.length <= 2) {
        return users.join(', ');
    }
    return `${users[0]}, ${users[1]} +${users.length - 2}`;
}


    get selectedUsersLabel() {

    if(this.selectedUsers.length <= 2){
        return this.selectedUsers.join(', ');
    }

    return `${this.selectedUsers[0]}, ${this.selectedUsers[1]} +${this.selectedUsers.length - 2}`;
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

    async handleTabChange(event) {
        this.activeTab = event.target.value;
        this.showDropdown = false;

        this.selectedUsers =[...this.currentLabels];

    }


   










}