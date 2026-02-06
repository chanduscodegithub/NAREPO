/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-02-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import userRole from '@salesforce/apex/renewalChecklistCls.userRole';

export default class RenewalChecklistMainComp extends LightningElement {
    @api parentAccData;
    @api isId = false;
    @api activeTab = "Renewal Checklist";
    @track selectedSS='';
    @api role;
    @api isRole;
    @api userName;
    @api parentSceData = {};
    @api validatedProducts;
    showDetail;
    errorMessage;
    isLoading = true;
    showRenewalChecklist = true;

    connectedCallback() {
        this.fetchUserRole();
        document.body.scrollTop = 0; document.documentElement.scrollTop = 0;
        window.addEventListener("beforeunload", this.beforeUnloadHandler);
    }

    beforeUnloadHandler(ev) {
        return false;
    }
    /* connectedCallback() {
        window.addEventListener("beforeunload", this.beforeUnloadHandler);
        console.log("connectedCallback executed");
    }*/

    // checking date range and logged in user role for displaying component.
    fetchUserRole() {
        userRole()
            .then((results) => {
                //console.log(`USER ROLE = ${JSON.stringify(results)}`);
                this.role = results.userRoleName;
                this.userName = results.userName;
                /* let startdate = new Date(results.startDate);
                let endDate = new Date(results.endDate);
                let dateToday = new Date(results.dateToday);

                if (((dateToday >= startdate) && (dateToday <= endDate)) &&
                    (this.role == 'CM SCE' || this.role == 'CM VPCR/RVP')) {
                    this.showRenewalChecklist = true;
                }
                else {
                    this.showRenewalChecklist = false;
                }
                if (!((dateToday >= startdate) && (dateToday <= endDate))) {
                    this.errorMessage = 'Product change checklist window is closed for the year. Please contact admin for more information.'
                } */
                if (!(this.role == 'CM SCE' || this.role == 'Surest CM SCE' || this.role == 'Surest CM SVP' || this.role == 'CM VPCR/RVP')) {
                    this.errorMessage = 'This tab was specifically designed to provide SCEs, RVPs, VPCRs with the ability to update membership activity comments and the complete Renewal Checklist. This tab will be blank for those who are not part of this group.'
                }
                this.isLoading = false;
            })
            .catch((error) => {
                //console.log('User Role Error---> ' + JSON.stringify(error));
                const event = new ShowToastEvent({
                    variant: 'error',
                    title: 'ERROR',
                    message: 'Error loading data. Please contact your administrator',
                });
                this.dispatchEvent(event);
                this.isLoading = false;
            })
    }

    callChildMethod() {
        const refreshData = this.template.querySelector('c-renewal-summary-tab-comp');
        refreshData.renewalData();
    }

    handleActive(event) {
        let activeTabName = event.target.value;
        this.isId = false;
        this.showDetail = false;
        setTimeout(() => {
            this.activeTab = activeTabName;
            this.callChildMethod();
        }, 100);
    }

    //sending account data from suummary to detail tab.
    handleCustomEvent(event) {
        console.log('this.parentAccData = ',JSON.stringify(event.detail));
        this.parentAccData = event.detail;
        this.isId = true;
        this.showDetail = true;
        setTimeout(() => {
            this.activeTab = event.detail.activeTab;
        }, 100);
    }

    //event from child.
    handleActiveTab(event) {
        this.isId = false;
        this.showDetail = false;
        setTimeout(() => {
            this.activeTab = event.detail.activeTab;
            this.callChildMethod();
        }, 100);
    }

    // calling child component for re rendering.
    handleSceData(event) {
        this.parentSceData = event.detail;
        this.callChildMethod();
    }

    handleSSChange(event){
        this.selectedSS =event.detail;
    }
}