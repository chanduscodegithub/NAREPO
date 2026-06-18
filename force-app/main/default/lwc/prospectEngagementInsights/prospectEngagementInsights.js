import { LightningElement, track } from 'lwc';
//import sendPortfolioEngagementPrompt from '@salesforce/apex/ProspectEngagementInsightsController.sendPortfolioEngagementPrompt';
import getUserInfo from '@salesforce/apex/ProspectEngagementInsightsController.getUserInfo';
//import getPromptForTile from '@salesforce/apex/ProspectEngagementInsightsController.getPromptForTile';
//import getFilteredAccountsForTiles from '@salesforce/apex/ProspectEngagementInsightsController.getFilteredAccountsForTiles';
export default class ProspectEngagementInsights extends LightningElement {
    @track isLoading = false;
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
    @track selectedTiers = ['1 - Whales', '2 - Top Priority'];
    productOptions = [
        { label: 'SVP top targets', value: 'svp' }
    ];
    tierOptions = [
        { label: '1 - Whales', value: '1 - Whales', selected: true },
        { label: '2 - Top Priority', value: '2 - Top Priority', selected: true },
        { label: '3 - Nurtures', value: '3 - Nurtures', selected: false }
    ];
    dateOptions = [
        { label: 'Last 30 Days', value: '30' },
        { label: 'Last 60 Days', value: '60' },
        { label: 'Last 90 Days', value: '90' }
    ];
    async connectedCallback() {
        this.isLoading = true;
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













}