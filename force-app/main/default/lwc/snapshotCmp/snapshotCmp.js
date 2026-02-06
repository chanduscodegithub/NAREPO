/* eslint-disable no-console */
/* eslint-disable vars-on-top */
import {
    LightningElement,
    track,
    api,
    wire
} from 'lwc';
import getStatusData from '@salesforce/apex/StatusSnapshotController.getStatusSnapshotData';
import fetchPicklist from '@salesforce/apex/RetentionStatusController.fetchPicklist';
import reportLabel from '@salesforce/label/c.ICM_SCE_Status_Report_Title';
import salesCycleLabel from '@salesforce/label/c.ICM_SalesCycleLabel';
import gnsLabel from '@salesforce/label/c.ICM_SCE_Status_Growth_Not_Sent_Title';
import gnsInstructionText from '@salesforce/label/c.ICM_SCE_Status_Growth_Not_Sent_Instruction_Text';
import gsLabel from '@salesforce/label/c.ICM_SCE_Status_Growth_Sent_Title';
import rnsLabel from '@salesforce/label/c.ICM_SCE_Status_Retention_Not_Sent_Title';
import rnsCMSCELabel from '@salesforce/label/c.ICM_CMSCE_Status_Retention_Not_Sent_Title'; //SAMARTH
import rnsInstructionText from '@salesforce/label/c.ICM_SCE_Status_Retention_Not_Sent_Instruction_Text'; //SAMARTH
import rnsCMSCEInstructionText from '@salesforce/label/c.ICM_CMSCE_Status_Retention_Not_Sent_Instruction_Text'; //SAMARTH
import rnsSBSCEInstructionText from '@salesforce/label/c.ICM_SBSCE_Status_Retention_Not_Sent_Instruction_Text'; //SAMARTH
import rsLabel from '@salesforce/label/c.ICM_SCE_Status_Retention_Sent_Title';
import rsCMSCELabel from '@salesforce/label/c.ICM_CMSCE_Status_Retention_Sent_Title'; //SAMARTH
import svpReportLabel from '@salesforce/label/c.ICM_SVP_Status_Report_Title';
import gnsSVPLabel from '@salesforce/label/c.ICM_SVP_Status_Growth_Not_Sent_Title';
import gsSVPLabel from '@salesforce/label/c.ICM_SVP_Status_Growth_Sent_Title';
import spcltyeportLabel from '@salesforce/label/c.ICM_SPCLTY_Status_Report_Title';
import gnsSpcltyLabel from '@salesforce/label/c.ICM_SPCLTY_Status_Growth_Not_Sent_Title';
import gsSpcltyLabel from '@salesforce/label/c.ICM_SPCLTY_Status_Growth_Sent_Title';
import gnsSpcltyInstructionText from '@salesforce/label/c.ICM_SPCLTY_Status_Growth_Not_Sent_Instruction_Text';
import actionNeededLabel from '@salesforce/label/c.ICM_Report_Action_Needed_Label';
import Proactive_Renewals_Medical_Products from '@salesforce/label/c.Proactive_Renewals_Medical_Products';
import Pending_Qualification from '@salesforce/label/c.Pending_Qualification';
import Fully_Validated from '@salesforce/label/c.Fully_Validated';
import medicalProactiveInformationText from '@salesforce/label/c.medicalProactiveInformationText';
//import Snapshot_Proactive_Renewals_Pending_Qualification from '@salesforce/label/c.Snapshot_Proactive_Renewals_Pending_Qualification';
//import Snapshot_Proactive_Renewals_Fully_validated from '@salesforce/label/c.Snapshot_Proactive_Renewals_Fully_validated';
import getTemplateForExport from '@salesforce/apex/StatusSnapshotController.getTemplateForExport';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';

import proactiveRenewal from '@salesforce/apex/RenewalStatusController.proactiveRenewal'; //SAMARTH


export default class SnapshotCmp extends LightningElement {
    @api role = '';
    @track isRetentionVisible = true;
    @track reportTitle = '';
    @track salesSeasonLabel = '';
    @track loggedInUserID = '';
    @track loggedInUserName = '';
    @track isSpecialtyUser = false;
    @track salesSeason = '';
    @track salesSeasonPicklist;
    @track retentionNotSentData = [];
    @track isRetentionNotSentDataEmpty = true;
    @track retentionSentData = [];
    @track isRetentionSentDataEmpty = true;
    @track growthNotSentData = [];
    @track isGrowthNotSentDataEmpty = true;
    @track growthSentData = [];
    @track isGrowthSentDataEmpty = true;
    //SORTING FIELDS / DIRECTION
    @track growthNotSentSortBy;
    @track growthNotSentEffectiveDateSortDirection = true; //asc = true & des = false
    @track growthNotSentCompanySortDirection = false; //asc = true & des = false
    @track growthNotSentMembershipActivitySortDirection = true; //asc = true & des = false
    @track growthSentSortBy;
    @track growthSentEffectiveDateSortDirection = true; //asc = true & des = false
    @track growthSentCompanySortDirection = false; //asc = true & des = false
    @track growthSentMembershipActivitySortDirection = true; //asc = true & des = false
    @track retentionNotSentSortBy;
    @track retentionNotSentEffectiveDateSortDirection = true; //asc = true & des = false
    @track retentionNotSentCompanySortDirection = false; //asc = true & des = false
    @track retentionSentSortBy;
    @track retentionSentEffectiveDateSortDirection = true; //asc = true & des = false
    @track retentionSentCompanySortDirection = false; //asc = true & des = false
    //LABEL FIELDS 
    @track gnsLabel = '';
    @track gnsInstructionText = '';
    @track gsLabel = '';
    @track rnsLabel = '';
    @track rnsCMSCELabel = '';
    @track rnsInstructionText = '';
    @track rnsSBSCEInstructionText = ''; //SAMARTH
    @track rnsCMSCEInstructionText = ''; //SAMARTH
    @track rsLabel = '';
    @track rsCMSCELabel = ''; //SAMARTH
    @track actionNeededLabel = '';
    @track pendingQualificationInformationText = '';
    @track fullyValidatedInformationText = '';

    @track ROLE_SCE = 'CM SCE';
    @track ROLE_SVP = 'CD SVP';
    @track ROLE_SSVP = 'Surest CD SVP';
    @track ROLE_CMSVP = 'Surest CM SVP';
    @track ROLE_SSCE = 'Surest CM SCE';
    @track ROLE_SPCLTY = 'Specialty Benefits SVP';
    @track ROLE_SBSCE = 'Specialty Benefits SCE'; //SAMARTH

    @track cssDisplay = '';
    @track isButtonDisabled = false;

    @track growthSentDisable;
    @track growthNotSentDisable;
    @track renewalSentDisable;
    @track renewalNotSentDisable;

    @track growthSentEnable;
    @track growthNotSentEnable;
    @track renewalSentEnable;
    @track renewalNotSentEnable;

    @track salesCycle = ''; //passed as parameter to apex method

    @track fullyValidatedList = []; //Variable created to store fully validated ProActive renewal data which will be used for print functionality....
    @track pendingQualifiedList = []; //Variable created to store Pending qualified ProActive renewal data which will be used for print functionality....
    isSort = false;

    hasRendered = false;

    @track isSbSceUser = false; //FOR SBSCE USER - SAMARTH
    @track isCmSceUser = false; //FOR CMSCE USER - SAMARTH


    @wire(fetchPicklist, {
        objectPassed: 'Renewal_Status__c',
        fieldPassed: 'Sales_Cycle__c'
    })
    salesSeasonPicklistValues(result) {
        if (result.data) {
            this.salesSeasonPicklist = [];
            if (result.data !== undefined) {
                result.data.forEach(opt => {
                    this.salesSeasonPicklist.push(opt);
                });
            }
        } else if (result.error) {
            this.error = result.error;
        }
    }




    //Accordion section - begins
    @track activeSections = ['A', 'B'];

    connectedCallback() {
        this.cssDisplay = ''; //SAMARTH
        // Logic for not defaulting to IY21 immediately in January. Should change only after March
        /*var currentYear= new Date().getFullYear();
        var currentMonth = new Date().getMonth();
        if (currentMonth <3) {
            currentYear = currentYear - 2001;
        } else {
            currentYear = currentYear - 2000;
        }
        this.salesSeason='IY'+currentYear+', 1/1/'+(Number(currentYear)+1);*/
        //console.log('****liuser role**** ' + this.role);
        this.reportTitle = reportLabel;
        this.actionNeededLabel = actionNeededLabel;

        //---------FOR SBSCE USER - SAMARTH---------
        if (this.role === this.ROLE_SBSCE) {
            this.isSbSceUser = true;
        }

        if (this.role === this.ROLE_SCE || this.role === this.ROLE_SSCE || this.role === this.ROLE_CMSVP) {
            this.isCmSceUser = true;
        }
        //---------FOR SBSCE USER - SAMARTH---------
        //alert(this.isSbSceUser);
        if (this.role === this.ROLE_SCE || this.role === this.ROLE_SSCE || this.role === this.ROLE_CMSVP || this.role === this.ROLE_SBSCE) {
            this.reportTitle = reportLabel;
            this.isRetentionVisible = true;
            this.gnsLabel = gnsLabel;
            this.gnsInstructionText = gnsInstructionText;
            this.gsLabel = gsLabel;
            this.rnsLabel = rnsLabel;
            this.rnsCMSCELabel = rnsCMSCELabel; //SAMARTH
            this.rnsInstructionText = rnsInstructionText;
            this.rnsSBSCEInstructionText = rnsSBSCEInstructionText; //SAMARTH
            this.rnsCMSCEInstructionText = rnsCMSCEInstructionText; //SAMARTH
            this.rsLabel = rsLabel;
            this.rsCMSCELabel = rsCMSCELabel; //SAMARTH
            this.proActiveRenewalsMedicalProductsLabel = Proactive_Renewals_Medical_Products;
            this.PendingQualificationLabel = Pending_Qualification;
            this.FullyValidatedLabel = Fully_Validated;
            this.medicalProactiveInformationTextLabel = medicalProactiveInformationText;
        }
        if (this.role === this.ROLE_SVP || this.role === this.ROLE_SSVP) {
            this.reportTitle = svpReportLabel;
            this.isRetentionVisible = false;
            this.gnsLabel = gnsSVPLabel;
            this.gnsInstructionText = gnsInstructionText;
            this.gsLabel = gsSVPLabel;
            this.rnsLabel = rnsLabel;
            this.rnsCMSCELabel = rnsCMSCELabel; //SAMARTH
            this.rnsInstructionText = rnsInstructionText;
            this.rsLabel = rsLabel;
            this.proActiveRenewalsMedicalProductsLabel = Proactive_Renewals_Medical_Products;
            this.PendingQualificationLabel = Pending_Qualification;
            this.FullyValidatedLabel = Fully_Validated;
            this.medicalProactiveInformationTextLabel = medicalProactiveInformationText;
        }
        if (this.role === this.ROLE_SPCLTY) {
            this.reportTitle = spcltyeportLabel;
            this.isRetentionVisible = false;
            this.gnsLabel = gnsSpcltyLabel;
            this.gnsInstructionText = gnsSpcltyInstructionText;
            this.gsLabel = gsSpcltyLabel;
            this.isSpecialtyUser = true;
            this.proActiveRenewalsMedicalProductsLabel = Proactive_Renewals_Medical_Products;
            this.PendingQualificationLabel = Pending_Qualification;
            this.FullyValidatedLabel = Fully_Validated;
            this.medicalProactiveInformationTextLabel = medicalProactiveInformationText;
        }
        this.getStatusSnapshotData();

        // if (this.isGrowthNotSentDataEmpty && this.isGrowthSentDataEmpty && this.isRetentionNotSentDataEmpty && this.isRetentionSentDataEmpty && (this.fullyValidatedList !== undefined && this.fullyValidatedList.length === 0) && (this.pendingQualifiedList !== undefined && this.pendingQualifiedList.length === 0)) {
        //     this.isButtonDisabled = true;
        // } else {
        //     this.isButtonDisabled = false;
        // }
    }
    //Accordion section - ends

    renderedCallback() {
        if (this.template.querySelector(".section-header-style") === null || this.hasRendered === true)
            return;
        this.hasRendered = true;
        let style = document.createElement("style");
        style.innerText = `     
                     .section-header .slds-accordion__summary-heading{
                         background-color: hsla(219, 49%, 67%, 0.79);
                         padding: 4px 10px;
                         border-radius: 3px;
                         font-weight: 600;
                         font-size: 15px;
                     }    
                 `;
        this.template.querySelector(".section-header-style").appendChild(style);
    }

    //--------------------------------- SAMARTH ---------------------------------
    handleDataFromProactiveRenewal(event) {
        console.log('Data in parent component is ' + JSON.stringify(event.detail));
        var eventDataForPrint = event.detail;
        // console.log('eventDataForPrint in event handler '+ this.eventDataForPrint);

        console.log('inside event handler function');
        let evntData = event.detail;
        // console.log('evntData in event handler '+this.evntData);
        this.fullyValidatedList = evntData.fullyValList;
        console.log('fullyValidatedList in event handler ' + this.fullyValidatedList);
        this.pendingQualifiedList = evntData.pendingQualList;
        console.log('pendingQualifiedList in event handler ' + this.pendingQualifiedList);
        console.log('PARENT isSort event handler ' + evntData.isSort);
        if (evntData.isSort === true) {
            console.log('Inside isSort if');
            this.cssDisplay = '';
            //console.log('cssDisplay Value ' + this.cssDisplay);
        } else if (evntData.isSort === false) {
            console.log('Inside isSort else if');
            this.cssDisplay = 'hidemodel';
        }
        this.cssDisplay = 'hidemodel';
        console.log('outside event handler function');
        //console.log('cssDisplay Value ' + this.cssDisplay);
    }
    //--------------------------------- SAMARTH ---------------------------------

    //FETCHING DATA - Begins
    getStatusSnapshotData() {
        getStatusData({
            salesSeason: this.salesSeason
        })
            .then(result => {
                console.log('result ' + JSON.stringify(result));
                this.loggedInUserID = result.loggedInUserID;
                this.loggedInUserName = result.loggedInUserName;
                this.salesSeason = result.salesSeason;
                this.salesSeasonLabel = salesCycleLabel;

                if (result.growthNotSentData !== null && result.growthNotSentData !== undefined && result.growthNotSentData.length != 0) {
                    this.growthNotSentData = result.growthNotSentData;
                    this.isGrowthNotSentDataEmpty = false;
                    this.growthNotSentEnable = true;

                } else {
                    this.growthNotSentData = '';
                    this.isGrowthNotSentDataEmpty = true;
                    this.growthNotSentDisable = true;
                }
                if (result.growthSentData !== null && result.growthSentData !== undefined && result.growthSentData.length != 0) {
                    this.growthSentData = result.growthSentData;
                    this.isGrowthSentDataEmpty = false;
                    this.growthSentEnable = true;

                } else {
                    this.growthSentData = '';
                    this.isGrowthSentDataEmpty = true;
                    this.growthSentDisable = true;
                }
                if (result.retentionNotSentData !== null && result.retentionNotSentData !== undefined && result.retentionNotSentData.length != 0) {
                    this.retentionNotSentData = result.retentionNotSentData;
                    this.sortData('company', 'asc', 'rns'); //default sort by Company - Ascending 
                    this.isRetentionNotSentDataEmpty = false;
                    this.renewalNotSentEnable = true;

                } else {
                    this.retentionNotSentData = '';
                    this.isRetentionNotSentDataEmpty = true;
                    this.renewalNotSentDisable = true;
                }
                if (result.retentionSentData !== null && result.retentionSentData !== undefined && result.retentionSentData.length != 0) {
                    //alert('Entering if');
                    this.retentionSentData = result.retentionSentData;
                    this.sortData('company', 'asc', 'rs'); //default sort by Company - Ascending 
                    this.isRetentionSentDataEmpty = false;
                    this.renewalSentEnable = true;
                } else {
                    //alert('Entering else');
                    this.retentionSentData = '';
                    this.isRetentionSentDataEmpty = true;
                    this.renewalSentDisable = true;
                }

                //ICM 2021 - SAMARTH
                if (this.isSbSceUser === false) {
                    this.getProActiveRenewalData(); //SAMARTH
                }
                else {
                    this.cssDisplay = 'hidemodel';
                    if (this.renewalSentEnable === true || this.renewalNotSentEnable === true || this.growthSentEnable === true || this.growthNotSentEnable === true) {
                        this.isButtonDisabled = false;
                    } else if (this.renewalSentDisable === true && this.renewalNotSentDisable === true && this.growthSentDisable === true && this.growthNotSentDisable === true) {
                        this.isButtonDisabled = true;
                    }
                    this.renewalSentEnable = undefined;
                    this.renewalNotSentEnable = undefined;
                    this.growthSentEnable = undefined;
                    this.growthNotSentEnable = undefined;

                    this.renewalSentDisable = undefined;
                    this.renewalNotSentDisable = undefined;
                    this.growthSentDisable = undefined;
                    this.growthNotSentDisable = undefined;
                }
                //ICM 2021 - SAMARTH
            })
            .catch(error => {
                console.log('Error==>' + JSON.stringify(error, null, 2));
                this.isButtonDisabled = true;

                //ICM 2021 - SAMARTH
                if (this.isSbSceUser === false) {
                    this.getProActiveRenewalData(); //SAMARTH
                }
                this.cssDisplay = 'hidemodel';
            });
    }


    getProActiveRenewalData() {
        proactiveRenewal({
            SalesCycle: this.salesCycle,
            sortByColumnName: this.sortByColumnName,
            sortByOrder: this.sortByOrder
        })
            .then(result => {
                if ((this.pendingQualifiedList !== null && this.pendingQualifiedList !== undefined && this.pendingQualifiedList.length !== 0) || (this.fullyValidatedList !== null && this.fullyValidatedList !== undefined && this.fullyValidatedList.length !== 0)) {
                    this.isButtonDisabled = false;
                    this.cssDisplay = 'hidemodel';
                } else {
                    if (this.renewalSentEnable === true || this.renewalNotSentEnable === true || this.growthSentEnable === true || this.growthNotSentEnable === true) {
                        this.isButtonDisabled = false;
                    } else if (this.renewalSentDisable === true && this.renewalNotSentDisable === true && this.growthSentDisable === true && this.growthNotSentDisable === true) {
                        this.isButtonDisabled = true;
                    }
                    this.cssDisplay = 'hidemodel';
                }

                this.renewalSentEnable = undefined;
                this.renewalNotSentEnable = undefined;
                this.growthSentEnable = undefined;
                this.growthNotSentEnable = undefined;

                this.renewalSentDisable = undefined;
                this.renewalNotSentDisable = undefined;
                this.growthSentDisable = undefined;
                this.growthNotSentDisable = undefined;

                //this.cssDisplay = 'hidemodel';
            })
            .catch(error => {
                console.log('Error in Proactive renewal Data ==>' + error);
                this.isButtonDisabled = true;
                this.cssDisplay = 'hidemodel';
            });
    }

    salesSeasonChangeHandler(event) {
        this.cssDisplay = '';

        this.salesSeason = event.target.value;
        this.getStatusSnapshotData();
        if (this.isSpecialtyUser === false && this.isRetentionVisible === true && this.isSbSceUser === false) {
            this.template.querySelector('c-med-renewal-status').salesCycleFromParent(event.target.value); //for passing picklist value from parent to child
        }

        this.growthNotSentEffectiveDateSortDirection = true; //asc = true & des = false
        this.growthNotSentCompanySortDirection = false; //asc = true & des = false
        this.growthNotSentMembershipActivitySortDirection = true; //asc = true & des = false
        this.growthSentEffectiveDateSortDirection = true; //asc = true & des = false
        this.growthSentCompanySortDirection = false; //asc = true & des = false
        this.growthSentMembershipActivitySortDirection = true; //asc = true & des = false
        this.retentionNotSentEffectiveDateSortDirection = true; //asc = true & des = false
        this.retentionNotSentCompanySortDirection = false; //asc = true & des = false
        this.retentionSentEffectiveDateSortDirection = true; //asc = true & des = false
        this.retentionSentCompanySortDirection = false; //asc = true & des = false

        //--MAKING LISTS EMPTY ON EACH SALES CYCLE CHANGE TO AVOID OCCURENCE OF OLD DATA-- 
        this.pendingQualifiedList = [];
        this.fullyValidatedList = [];
        //--MAKING LISTS EMPTY ON EACH SALES CYCLE CHANGE TO AVOID OCCURENCE OF OLD DATA--

    }

    handleRetentionNotSentSortdata(event) {
        this.cssDisplay = '';
        // field name
        var selectedItem = event.currentTarget;
        this.retentionNotSentSortBy = selectedItem.dataset.record;
        // calling sortdata function to sort the data based on direction and selected field
        if (this.retentionNotSentSortBy == 'effectiveDate') {
            if (this.retentionNotSentEffectiveDateSortDirection == true) {
                this.sortData(this.retentionNotSentSortBy, 'asc', 'rns');
            } else {
                this.sortData(this.retentionNotSentSortBy, 'des', 'rns');
            }
            if (this.retentionNotSentEffectiveDateSortDirection == true) {
                this.retentionNotSentEffectiveDateSortDirection = false;
            } else {
                this.retentionNotSentEffectiveDateSortDirection = true;
            }
        }
        if (this.retentionNotSentSortBy == 'company') {
            if (this.retentionNotSentCompanySortDirection == true) {
                this.sortData(this.retentionNotSentSortBy, 'asc', 'rns');
            } else {
                this.sortData(this.retentionNotSentSortBy, 'des', 'rns');
            }
            if (this.retentionNotSentCompanySortDirection == true) {
                this.retentionNotSentCompanySortDirection = false;
            } else {
                this.retentionNotSentCompanySortDirection = true;
            }
        }
        this.cssDisplay = 'hidemodel';
    }
    handleRetentionSentSortdata(event) {
        this.cssDisplay = '';

        // field name
        var selectedItem = event.currentTarget;
        this.retentionSentSortBy = selectedItem.dataset.record;
        // calling sortdata function to sort the data based on direction and selected field
        if (this.retentionSentSortBy == 'effectiveDate') {
            if (this.retentionSentEffectiveDateSortDirection == true) {
                this.sortData(this.retentionSentSortBy, 'asc', 'rs');
            } else {
                this.sortData(this.retentionSentSortBy, 'des', 'rs');
            }
            if (this.retentionSentEffectiveDateSortDirection == true) {
                this.retentionSentEffectiveDateSortDirection = false;
            } else {
                this.retentionSentEffectiveDateSortDirection = true;
            }
        }
        if (this.retentionSentSortBy == 'company') {
            if (this.retentionSentCompanySortDirection == true) {
                this.sortData(this.retentionSentSortBy, 'asc', 'rs');
            } else {
                this.sortData(this.retentionSentSortBy, 'des', 'rs');
            }
            if (this.retentionSentCompanySortDirection == true) {
                this.retentionSentCompanySortDirection = false;
            } else {
                this.retentionSentCompanySortDirection = true;
            }
        }
        this.cssDisplay = 'hidemodel';

    }
    handleGrowthNotSentSortdata(event) {
        this.cssDisplay = '';

        // field name
        var selectedItem = event.currentTarget;
        this.growthNotSentSortBy = selectedItem.dataset.record;

        // calling sortdata function to sort the data based on direction and selected field
        if (this.growthNotSentSortBy == 'effectiveDate') {
            if (this.growthNotSentEffectiveDateSortDirection == true) {
                this.sortData(this.growthNotSentSortBy, 'asc', 'gns');
            } else {
                this.sortData(this.growthNotSentSortBy, 'des', 'gns');
            }
            if (this.growthNotSentEffectiveDateSortDirection == true) {
                this.growthNotSentEffectiveDateSortDirection = false;
            } else {
                this.growthNotSentEffectiveDateSortDirection = true;
            }
        }
        if (this.growthNotSentSortBy == 'company') {
            if (this.growthNotSentCompanySortDirection == true) {
                this.sortData(this.growthNotSentSortBy, 'asc', 'gns');
            } else {
                this.sortData(this.growthNotSentSortBy, 'des', 'gns');
            }
            if (this.growthNotSentCompanySortDirection == true) {
                this.growthNotSentCompanySortDirection = false;
            } else {
                this.growthNotSentCompanySortDirection = true;
            }
        }
        if (this.growthNotSentSortBy == 'membershipActivityName') {
            if (this.growthNotSentMembershipActivitySortDirection == true) {
                this.sortData(this.growthNotSentSortBy, 'asc', 'gns');
            } else {
                this.sortData(this.growthNotSentSortBy, 'des', 'gns');
            }
            if (this.growthNotSentMembershipActivitySortDirection == true) {
                this.growthNotSentMembershipActivitySortDirection = false;
            } else {
                this.growthNotSentMembershipActivitySortDirection = true;
            }
        }
        this.cssDisplay = 'hidemodel';

    }
    handleGrowthSentSortdata(event) {
        this.cssDisplay = '';

        // field name
        var selectedItem = event.currentTarget;
        this.growthSentSortBy = selectedItem.dataset.record;

        // calling sortdata function to sort the data based on direction and selected field
        if (this.growthSentSortBy == 'effectiveDate') {
            if (this.growthSentEffectiveDateSortDirection == true) {
                this.sortData(this.growthSentSortBy, 'asc', 'gs');
            } else {
                this.sortData(this.growthSentSortBy, 'des', 'gs');
            }
            if (this.growthSentEffectiveDateSortDirection == true) {
                this.growthSentEffectiveDateSortDirection = false;
            } else {
                this.growthSentEffectiveDateSortDirection = true;
            }
        }
        if (this.growthSentSortBy == 'company') {
            if (this.growthSentCompanySortDirection == true) {
                this.sortData(this.growthSentSortBy, 'asc', 'gs');
            } else {
                this.sortData(this.growthSentSortBy, 'des', 'gs');
            }
            if (this.growthSentCompanySortDirection == true) {
                this.growthSentCompanySortDirection = false;
            } else {
                this.growthSentCompanySortDirection = true;
            }
        }
        if (this.growthSentSortBy == 'membershipActivityName') {
            if (this.growthSentMembershipActivitySortDirection == true) {
                this.sortData(this.growthSentSortBy, 'asc', 'gs');
            } else {
                this.sortData(this.growthSentSortBy, 'des', 'gs');
            }
            if (this.growthSentMembershipActivitySortDirection == true) {
                this.growthSentMembershipActivitySortDirection = false;
            } else {
                this.growthSentMembershipActivitySortDirection = true;
            }
        }
        this.cssDisplay = 'hidemodel';
    }

    sortData(fieldname, direction, section) {
        // serialize the data before calling sort function
        let parseData = '';
        if (section == 'rns') {
            parseData = JSON.parse(JSON.stringify(this.retentionNotSentData));
        }
        if (section == 'rs') {
            parseData = JSON.parse(JSON.stringify(this.retentionSentData));
        }
        if (section == 'gns') {
            parseData = JSON.parse(JSON.stringify(this.growthNotSentData));
        }
        if (section == 'gs') {
            parseData = JSON.parse(JSON.stringify(this.growthSentData));
        }

        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };

        // cheking reverse direction 
        let isReverse = direction === 'asc' ? 1 : -1;

        // sorting data 
        if (parseData != null && parseData != undefined && parseData.length != 0) {
            parseData.sort((x, y) => {
                x = keyValue(x) ? keyValue(x) : ''; // handling null values
                y = keyValue(y) ? keyValue(y) : '';

                // sorting values based on direction
                return isReverse * ((x > y) - (y > x));
            });
        }


        // set the sorted data to data table data
        if (section === 'rns') {
            this.retentionNotSentData = parseData;
        }
        if (section === 'rs') {
            this.retentionSentData = parseData;
        }
        if (section === 'gns') {
            this.growthNotSentData = parseData;
        }
        if (section === 'gs') {
            this.growthSentData = parseData;
        }
    }
    handleSortByCompAndMemActGS(event) {
        // field name
        var selectedItem = event.currentTarget;
        this.growthSentSortBy = selectedItem.dataset.record;

        // calling sortdata function to sort the data based on direction and selected field
        if (this.growthSentSortBy === 'company') {
            let field1 = 'company';
            let field2 = 'membershipActivityName';
            let f1Direction = this.growthSentCompanySortDirection ? 'asc' : 'des';
            let f2Direction = this.growthSentMembershipActivitySortDirection ? 'asc' : 'des';
            this.sortDataByCompAndMemAct(field1, field2, f1Direction, f2Direction, 'gs');
            if (this.growthSentCompanySortDirection === true) {
                this.growthSentCompanySortDirection = false;
            } else {
                this.growthSentCompanySortDirection = true;
            }
        }
        if (this.growthSentSortBy === 'membershipActivityName') {
            let field1 = 'membershipActivityName';
            let field2 = 'company';
            let f1Direction = this.growthSentMembershipActivitySortDirection ? 'asc' : 'des';
            let f2Direction = this.growthSentCompanySortDirection ? 'asc' : 'des';
            this.sortDataByCompAndMemAct(field1, field2, f1Direction, f2Direction, 'gs');
            if (this.growthSentMembershipActivitySortDirection === true) {
                this.growthSentMembershipActivitySortDirection = false;
            } else {
                this.growthSentMembershipActivitySortDirection = true;
            }
        }

    }

    handleSortByCompAndMemActGNS(event) {
        // field name
        var selectedItem = event.currentTarget;
        this.growthNotSentSortBy = selectedItem.dataset.record;

        // calling sortdata function to sort the data based on direction and selected field
        if (this.growthNotSentSortBy === 'company') {
            let field1 = 'company';
            let field2 = 'membershipActivityName';
            let f1Direction = this.growthNotSentCompanySortDirection ? 'asc' : 'des';
            let f2Direction = this.growthNotSentMembershipActivitySortDirection ? 'asc' : 'des';
            this.sortDataByCompAndMemAct(field1, field2, f1Direction, f2Direction, 'gns');
            if (this.growthNotSentCompanySortDirection === true) {
                this.growthNotSentCompanySortDirection = false;
            } else {
                this.growthNotSentCompanySortDirection = true;
            }
        }
        if (this.growthNotSentSortBy === 'membershipActivityName') {
            let field1 = 'membershipActivityName';
            let field2 = 'company';
            let f1Direction = this.growthNotSentMembershipActivitySortDirection ? 'asc' : 'des';
            let f2Direction = this.growthNotSentCompanySortDirection ? 'asc' : 'des';
            this.sortDataByCompAndMemAct(field1, field2, f1Direction, f2Direction, 'gns');
            if (this.growthNotSentMembershipActivitySortDirection == true) {
                this.growthNotSentMembershipActivitySortDirection = false;
            } else {
                this.growthNotSentMembershipActivitySortDirection = true;
            }
        }

    }
    sortDataByCompAndMemAct(fieldname1, fieldname2, f1Direction, f2Direction, section) {
        // serialize the data before calling sort function
        let parseData = '';
        if (section === 'gns') {
            parseData = JSON.parse(JSON.stringify(this.growthNotSentData));
        }
        if (section === 'gs') {
            parseData = JSON.parse(JSON.stringify(this.growthSentData));
        }

        // Return the value stored in the field
        let sortBy = [{
            prop: fieldname1,
            direction: f1Direction === 'asc' ? 1 : -1
        }, {
            prop: fieldname2,
            direction: f2Direction === 'asc' ? 1 : -1
        }];

        // sorting data 
        parseData.sort((a, b) => {
            let i = 0,
                result = 0;
            while (i < sortBy.length && result === 0) {
                result = sortBy[i].direction * (a[sortBy[i].prop].toString() < b[sortBy[i].prop].toString() ? -1 : (a[sortBy[i].prop].toString() > b[sortBy[i].prop].toString() ? 1 : 0));
                i++;
            }
            return result;

            // sorting values based on direction
            //return isReverse * ((x > y) - (y > x));
        });


        // set the sorted data to data table data
        if (section == 'gns') {
            this.growthNotSentData = parseData;
        }
        if (section == 'gs') {
            this.growthSentData = parseData;
        }
    }



    exportHandler() {
        this.cssDisplay = '';
        if (((this.role === this.ROLE_SCE || this.role === this.ROLE_SSCE || this.role === this.ROLE_CMSVP) && this.isGrowthNotSentDataEmpty === true && this.isGrowthSentDataEmpty === true && this.isRetentionNotSentDataEmpty === true && this.isRetentionSentDataEmpty === true && this.pendingQualifiedList.length === 0 && this.fullyValidatedList.length === 0) ||
            ((this.role === this.ROLE_SVP || this.role === this.ROLE_SSVP || this.role === this.ROLE_SPCLTY) && this.isGrowthNotSentDataEmpty === true && this.isGrowthSentDataEmpty === true && this.pendingQualifiedList.length === 0 && this.fullyValidatedList.length === 0) ||
            (this.role === this.ROLE_SBSCE && this.isGrowthNotSentDataEmpty === true && this.isGrowthSentDataEmpty === true && this.isRetentionNotSentDataEmpty === true && this.isRetentionSentDataEmpty === true)) { //last line of if condn - SAMARTH
            const event = new ShowToastEvent({
                title: '',
                message: 'No records to print.',
            });
            this.dispatchEvent(event);
            this.cssDisplay = 'hidemodel';
        } else {
            getTemplateForExport({
                role: this.role
            })
                .then(result => {

                    if (!result.length !== 0) {
                        var xmlString = result.xmlString;
                        xmlString = xmlString.replace('%%ReportTitle@@', this.reportTitle);
                        xmlString = xmlString.replace('%%SalesSeason@@', this.salesSeason);
                        xmlString = xmlString.replace('%%GrowthNotSentHeading@@', this.gnsLabel + this.actionNeededLabel);
                        xmlString = xmlString.replace('%%GrowthInformationText@@', this.gnsInstructionText);
                        xmlString = xmlString.replace('%%GrowthSentHeading@@', this.gsLabel);
                        //-----------------------------SAMARTH-----------------------------
                        if (this.role === this.ROLE_SCE || this.role === this.ROLE_SSCE || this.role === this.ROLE_CMSVP) {
                            xmlString = xmlString.replace('%%RetentionNotSentHeading@@', this.rnsCMSCELabel + this.actionNeededLabel);
                            //Different Instruction Text for SBSCE
                        }
                        else {
                            xmlString = xmlString.replace('%%RetentionNotSentHeading@@', this.rnsLabel + this.actionNeededLabel);
                        }


                        if (this.role === this.ROLE_SBSCE) {
                            xmlString = xmlString.replace('%%RetentionInformationText@@', this.rnsSBSCEInstructionText);
                            //Different Instruction Text for SBSCE
                        }
                        else if (this.role === this.ROLE_SCE || this.role === this.ROLE_SSCE || this.role === this.ROLE_CMSVP) {
                            xmlString = xmlString.replace('%%RetentionInformationText@@', this.rnsCMSCEInstructionText);
                            //Different Instruction Text for SBSCE
                        }
                        else {
                            xmlString = xmlString.replace('%%RetentionInformationText@@', this.rnsInstructionText);
                        }


                        if (this.role === this.ROLE_SCE || this.role === this.ROLE_SSCE || this.role === this.ROLE_CMSVP) {
                            xmlString = xmlString.replace('%%RetentionSentHeading@@', this.rsCMSCELabel);
                            //Different Report Label for SBSCE
                        }
                        else {
                            xmlString = xmlString.replace('%%RetentionSentHeading@@', this.rsLabel);
                        }
                        //-----------------------------SAMARTH-----------------------------
                        //xmlString = xmlString.replace('%%RetentionSentHeading@@', this.rsLabel);//rsCMSCELabel

                        //Code to change headers of two new tables 
                        if (this.role !== this.ROLE_SBSCE) { //SAMARTH
                            xmlString = xmlString.replace('%%RetentionNotSentHeadingNewTable1@@', this.proActiveRenewalsMedicalProductsLabel + this.PendingQualificationLabel);
                            xmlString = xmlString.replace('%%medicalProactiveInformationText@@', this.medicalProactiveInformationTextLabel);
                            xmlString = xmlString.replace('%%RetentionSentHeadingTable2@@', this.proActiveRenewalsMedicalProductsLabel + this.FullyValidatedLabel);
                        }

                        xmlString = xmlString.replace('%%DataDate@@', this.formatDateTime(''));

                        let salesCycle = this.salesSeason;
                        let salesCycleSplitByCommaStr = salesCycle.split(',')[1].trim();
                        let salesCycleDateFormatted = this.formatDateWithHyphenSeparate(salesCycleSplitByCommaStr);
                        let salesCycleValue = salesCycle.split(',')[0] + ', ' + salesCycleDateFormatted;
                        let xmlTemplateString = '';
                        var objectItagesMap = result.objectItags;
                        let rowCount = 0;
                        if (this.role === this.ROLE_SCE || this.role === this.ROLE_SBSCE || this.role === this.ROLE_SSCE || this.role === this.ROLE_CMSVP) {
                            rowCount = 18;
                        }
                        if (this.role === this.ROLE_SVP || this.role === this.ROLE_SSVP ) {
                            rowCount = 10; //in xml 12
                        }
                        if (this.role === this.ROLE_SPCLTY) {
                            rowCount = 10; //in xml 12
                        }

                        for (let objectName in objectItagesMap) {
                            if (objectItagesMap.hasOwnProperty(objectName)) {
                                let itagSets = objectItagesMap[objectName];
                                let startItag = '';
                                let endItag = '';
                                let setCount = 0;
                                for (let itagStrIndex in itagSets) {
                                    if (itagStrIndex !== undefined) {
                                        setCount = setCount + 1;
                                        if (setCount === 1) {
                                            startItag = itagSets[itagStrIndex];
                                        }
                                        if (setCount === itagSets.length) {
                                            endItag = itagSets[itagStrIndex];
                                        }
                                    }

                                }
                                startItag = '%%' + objectName + '.' + startItag + '@@';
                                endItag = '%%' + objectName + '.' + endItag + '@@';
                                //console.log('startItag' + startItag + ' : endItag : ' + endItag);

                                let startIndex = xmlString.lastIndexOf(startItag);
                                let endIndex = xmlString.indexOf(endItag);
                                let stHeaderIdx = 0;
                                let endHeaderIdx = 0;
                                let rowToReccurse = '';
                                if (objectName === 'GNS') {
                                    stHeaderIdx = xmlString.lastIndexOf('<GNS', startIndex);
                                    endHeaderIdx = xmlString.indexOf('</GNS>', endIndex);
                                    endHeaderIdx += '</GNS>'.length;
                                    rowToReccurse = xmlString.substring(stHeaderIdx, endHeaderIdx);
                                    if (this.isGrowthNotSentDataEmpty) {
                                        xmlString = xmlString.split(rowToReccurse).join('');
                                        xmlTemplateString = xmlString;
                                    } else {
                                        xmlTemplateString = this.returnChildRows(rowToReccurse, xmlString, this.growthNotSentData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                                        rowCount += this.growthNotSentData.length;
                                        xmlString = xmlTemplateString;
                                    }
                                }
                                if (objectName === 'GS') {
                                    stHeaderIdx = xmlString.lastIndexOf('<GS', startIndex);
                                    endHeaderIdx = xmlString.indexOf('</GS>', endIndex);
                                    endHeaderIdx += '</GS>'.length;
                                    rowToReccurse = xmlString.substring(stHeaderIdx, endHeaderIdx);
                                    if (this.isGrowthSentDataEmpty) {
                                        xmlString = xmlString.split(rowToReccurse).join('');
                                        xmlTemplateString = xmlString;
                                    } else {
                                        xmlTemplateString = this.returnChildRows(rowToReccurse, xmlString, this.growthSentData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                                        rowCount += this.growthSentData.length;
                                        xmlString = xmlTemplateString;
                                    }
                                }
                                if (this.role === this.ROLE_SCE || this.role === this.ROLE_SBSCE || this.role === this.ROLE_SSCE || this.role === this.ROLE_CMSVP) {
                                    if (objectName === 'RNS') {
                                        stHeaderIdx = xmlString.lastIndexOf('<RNS', startIndex);
                                        endHeaderIdx = xmlString.indexOf('</RNS>', endIndex);
                                        endHeaderIdx += '</RNS>'.length;
                                        rowToReccurse = xmlString.substring(stHeaderIdx, endHeaderIdx);
                                        if (this.isRetentionNotSentDataEmpty) {
                                            xmlString = xmlString.split(rowToReccurse).join('');
                                            xmlTemplateString = xmlString;
                                        } else {
                                            xmlTemplateString = this.returnChildRows(rowToReccurse, xmlString, this.retentionNotSentData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                                            rowCount += this.retentionNotSentData.length;
                                            xmlString = xmlTemplateString;
                                        }
                                    }
                                    if (objectName === 'RS') {
                                        stHeaderIdx = xmlString.lastIndexOf('<RS', startIndex);
                                        endHeaderIdx = xmlString.indexOf('</RS>', endIndex);
                                        endHeaderIdx += '</RS>'.length;
                                        rowToReccurse = xmlString.substring(stHeaderIdx, endHeaderIdx);
                                        if (this.isRetentionSentDataEmpty) {
                                            xmlString = xmlString.split(rowToReccurse).join('');
                                            xmlTemplateString = xmlString;
                                        } else {
                                            xmlTemplateString = this.returnChildRows(rowToReccurse, xmlString, this.retentionSentData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                                            rowCount += this.retentionSentData.length;
                                            xmlString = xmlTemplateString;
                                        }
                                    }

                                    //Logic to print additional two tables in excel format starts
                                    if (this.role !== this.ROLE_SBSCE) { //SAMARTH
                                        if (objectName === 'Tbl1') {
                                            stHeaderIdx = xmlString.lastIndexOf('<Tbl1', startIndex);
                                            endHeaderIdx = xmlString.indexOf('</Tbl1>', endIndex);
                                            endHeaderIdx += '</Tbl1>'.length;
                                            rowToReccurse = xmlString.substring(stHeaderIdx, endHeaderIdx);
                                            if (this.pendingQualifiedList.length === 0 || this.pendingQualifiedList === undefined) {
                                                xmlString = xmlString.split(rowToReccurse).join('');
                                                xmlTemplateString = xmlString;
                                            } else {
                                                xmlTemplateString = this.returnChildRows(rowToReccurse, xmlString, this.pendingQualifiedList, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                                                rowCount += this.pendingQualifiedList.length;
                                                xmlString = xmlTemplateString;
                                            }
                                        }

                                        if (objectName === 'Tbl2') {
                                            stHeaderIdx = xmlString.lastIndexOf('<Tbl2', startIndex);
                                            endHeaderIdx = xmlString.indexOf('</Tbl2>', endIndex);
                                            endHeaderIdx += '</Tbl2>'.length;
                                            rowToReccurse = xmlString.substring(stHeaderIdx, endHeaderIdx);
                                            if (this.fullyValidatedList.length === 0 || this.fullyValidatedList === undefined) {
                                                xmlString = xmlString.split(rowToReccurse).join('');
                                                xmlTemplateString = xmlString;
                                            } else {
                                                xmlTemplateString = this.returnChildRows(rowToReccurse, xmlString, this.fullyValidatedList, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                                                rowCount += this.fullyValidatedList.length;
                                                xmlString = xmlTemplateString;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        xmlTemplateString = xmlTemplateString.split('<GNS').join('<Row');
                        xmlTemplateString = xmlTemplateString.split('</GNS>').join('</Row>');
                        xmlTemplateString = xmlTemplateString.split('<GS').join('<Row');
                        xmlTemplateString = xmlTemplateString.split('</GS>').join('</Row>');
                        xmlTemplateString = xmlTemplateString.split('<RNS').join('<Row');
                        xmlTemplateString = xmlTemplateString.split('</RNS>').join('</Row>');
                        xmlTemplateString = xmlTemplateString.split('<RS').join('<Row');
                        xmlTemplateString = xmlTemplateString.split('</RS>').join('</Row>');

                        if (this.role !== this.ROLE_SBSCE) { //SAMARTH
                            xmlTemplateString = xmlTemplateString.split('<Tbl1').join('<Row');
                            xmlTemplateString = xmlTemplateString.split('</Tbl1>').join('</Row>');

                            xmlTemplateString = xmlTemplateString.split('<Tbl2').join('<Row');
                            xmlTemplateString = xmlTemplateString.split('</Tbl2>').join('</Row>');
                        }

                        xmlTemplateString = xmlTemplateString.split('##RowVal@@').join(rowCount);

                        var today = this.formatDate('');
                        var hiddenElement = document.createElement('a');
                        hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTemplateString);
                        hiddenElement.target = '_self'; // 
                        hiddenElement.download = 'Growth and Renewal Status Snapshot ' + salesCycleValue + ' ' + today + '.xls'; // CSV file Name* you can change it.[only name not .csv] 
                        document.body.appendChild(hiddenElement); // Required for FireFox browser

                        hiddenElement.click();
                        const event = new ShowToastEvent({
                            title: '',
                            message: 'Growth and Renewal Status Snapshot Exported Successfully',
                        });
                        this.dispatchEvent(event);
                        this.cssDisplay = 'hidemodel';
                    }

                }).catch(error => {
                    console.log('Error==>' + JSON.stringify(error, null, 2));
                    this.cssDisplay = 'hidemodel';
                });
        }
    }
    returnChildRows(rowToReccurse, xmlWsectTag, snapshotData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount) {

        let totalRows = '';
        let count = 0;
        let highlightStyleId = "s87";
        let nonHighlightStyleId = "s79";
        let addBlackColorFontLeftAlign = 's77';
        let addRedColorFontCss = 's83';
        let addBlackColorToNumber = 's79';
        let addRedColorToNumber = 's90';
        for (let i in snapshotData) {
            if (i !== undefined) {
                let eachRow = rowToReccurse;
                count = count + 1;
                for (let k in objectItagesMap[objectName]) {
                    if (k !== undefined) {
                        let key = objectItagesMap[objectName][k];
                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                        let value = '';

                        if (key == 'effectiveDate') {
                            if (snapshotData[i].hasOwnProperty(key) && null != snapshotData[i][key] && snapshotData[i][key] !== '') {
                                value = this.convertDateFormat(snapshotData[i][key]);
                            }
                        }
                        else if (key === 'AreDocumentsAttached') {
                            let icAreDocumentsAttachedStyleId;
                            if (snapshotData[i][key] === 'No') {
                                icAreDocumentsAttachedStyleId = addRedColorFontCss;
                                value = snapshotData[i][key];
                            } else {
                                icAreDocumentsAttachedStyleId = addBlackColorFontLeftAlign;
                                value = snapshotData[i][key];
                            }
                            eachRow = eachRow.split('##icAreDocumentsAttachedStyleId@@').join(icAreDocumentsAttachedStyleId);
                        }
                        //-------------------------------------ADDED BY SAMARTH-------------------------------------
                        else if (key === 'noOfProductsNotYetConfirmed') {
                            //alert('noOfProductsNotYetConfirmed '+snapshotData[i][key]);
                            let notYetConfirmedStyleId;
                            if (snapshotData[i][key] == 0) {
                                notYetConfirmedStyleId = addBlackColorToNumber;
                                value = snapshotData[i][key];
                            } else {
                                notYetConfirmedStyleId = addRedColorToNumber;
                                value = snapshotData[i][key];
                            }
                            eachRow = eachRow.split('##notYetConfirmedStyleId@@').join(notYetConfirmedStyleId);
                        }
                        else if (key === 'noOfProductsNotYetSent') {
                            //alert('noOfProductsNotYetSent '+snapshotData[i][key]);
                            let notYetSentStyleId;
                            if (snapshotData[i][key] == 0) {
                                notYetSentStyleId = addBlackColorToNumber;
                                value = snapshotData[i][key];
                            } else {
                                notYetSentStyleId = addRedColorToNumber;
                                value = snapshotData[i][key];
                            }
                            eachRow = eachRow.split('##notYetSentStyleId@@').join(notYetSentStyleId);
                        }
                        //-------------------------------------ADDED BY SAMARTH-------------------------------------
                        else {
                            value = snapshotData[i][key];
                        }

                        value = value != null ? value : '';
                        value = value.toString();
                        value = this.replaceXmlSpecialCharacters(value);

                        eachRow = eachRow.split(replaceItagName).join(value);
                    }
                }
                totalRows += eachRow;
            }
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + totalRows + xmlWsectTag.substring(endHeaderIdx);
        return xmlWsectTag;
    }
    replaceXmlSpecialCharacters(value) {
        let returnValue;
        if (value !== null && value !== undefined && value.length > 0) {
            value = value.replace(/&/g, '&amp;');
            value = value.replace(/>/g, '&gt;');
            value = value.replace(/</g, '&lt;');
            returnValue = value;
        } else {
            returnValue = '';
        }
        return returnValue;
    }

    formatDateWithHyphenSeparate(inputDate) {
        let dateToFormat;
        if (inputDate === '' || inputDate === undefined) {
            dateToFormat = new Date();
        } else {
            dateToFormat = new Date(inputDate);
        }
        let dd = dateToFormat.getDate();
        let mm = dateToFormat.getMonth() + 1; //January is 0!
        let yyyy = dateToFormat.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        //dateToFormat = mm + '/' + dd + '/' + yyyy;
        dateToFormat = mm + '-' + dd + '-' + yyyy;
        return dateToFormat;
    }
    formatDate(inputDate) {
        let dateToFormat;
        if (inputDate === '' || inputDate === undefined) {
            dateToFormat = new Date();
        }
        let dd = dateToFormat.getDate();
        let mm = dateToFormat.getMonth() + 1; //January is 0!
        let yyyy = dateToFormat.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        //dateToFormat = mm + '/' + dd + '/' + yyyy;
        dateToFormat = yyyy + '' + mm + '' + dd;
        return dateToFormat;
    }
    formatDateTime(inputDateTime) {
        let returnFormattedDateTime = inputDateTime;
        let dateTime;
        if (inputDateTime === '' || inputDateTime === undefined) {
            dateTime = new Date().toLocaleString("en-US");
            dateTime = new Date(dateTime);
            dateTime = dateTime.toLocaleString();

        }
        if (dateTime !== undefined && dateTime != null && dateTime !== '') {
            let dateTimeValueFormatted;
            let dateTimeSeparatedArray;
            let timeSeparatedArray;
            if (dateTime.indexOf(',') !== -1) {
                dateTimeSeparatedArray = dateTime.split(',');
                //dateTimeValueFormatted=dateTimeSeparatedArray[0]+' '+dateTimeSeparatedArray[1];
                //returnFormattedDateTime=dateTimeValueFormatted;
                dateTimeValueFormatted = dateTimeSeparatedArray[0] + ' ';
                if (dateTimeSeparatedArray[1].indexOf(':') !== -1) {
                    timeSeparatedArray = dateTimeSeparatedArray[1].split(':');

                    let hr = timeSeparatedArray[0];
                    let mnt = timeSeparatedArray[1];
                    let period = timeSeparatedArray[2].split(' ')[1];

                    dateTimeValueFormatted = dateTimeValueFormatted +
                        hr + ':' + mnt + ' ' + period;

                    returnFormattedDateTime = dateTimeValueFormatted;
                }
            }
        }
        return returnFormattedDateTime;
    }
    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }
    convertDateFormat(date) {
        let returnValue;
        if (date !== null && date !== undefined && date !== '') {
            let formattedDateArray = date.split('-');
            let dt = formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
            let month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
            let year = formattedDateArray[0];
            returnValue = month + '/' + dt + '/' + year;

        } else {
            returnValue = '';
        }
        return returnValue;
    }


    //FETCHING DATA - Ends
}