import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchData from '@salesforce/apex/renewalChecklistCls.fetchData';
import Renewal_Checklist_Detail_Instruction from '@salesforce/label/c.Renewal_Checklist_Detail_Instruction';
import Renewal_Checklist_Missing_Products from '@salesforce/label/c.Renewal_Checklist_Missing_Products';
import Renewal_Checklist_no_new_products from '@salesforce/label/c.Renewal_Checklist_no_new_products';
import Renewal_Checklist_no_terming_products from '@salesforce/label/c.Renewal_Checklist_no_terming_products';
import Renewal_Checklist_validation_note from '@salesforce/label/c.Renewal_Checklist_validation_note';
import Renewal_Checklist_Clients_to_validate_instruction from '@salesforce/label/c.Renewal_Checklist_Clients_to_validate_instruction';


export default class RenewalSummaryTabComp extends LightningElement {
    @api accData = [];
    @api eventAccdata;
    @api validatedData = [];
    @api refreshSummary;
    @api validatedOn;
    @api summarySceData
    summaryOppList = [];
    existingProducts;
    termingProducts;
    isLoading = true;
    activeSectionsSub;
    activeSectionsSub2;
    activeSectionMain = ["Clients to validate", "Validated Clients"];
    hasRendered = false;
    accUrl;
    accId;
    accNameAndDate;
    @track salesCycle;
    @track dateOptions = [];
    @track selectedCycle = "Show All";
    @track showAllOpportunity = true;

    label = {
        Renewal_Checklist_no_new_products,
        Renewal_Checklist_no_terming_products,
        Renewal_Checklist_Clients_to_validate_instruction
    };

    connectedCallback() {
        this.renewalData();
        document.body.scrollTop = 0; document.documentElement.scrollTop = 0;
        this.updateDateOptions();
    }
    //used for styling of accordian sections
    renderedCallback() {
        if (this.template.querySelector('.section-header-style') === null || this.hasRendered === true) return;
        this.hasRendered = true;
        this.setAccordianStyles();
        this.removeSectionTopPadding();
    }
    // getting data of Account,renewal checklist and opp ln itm from apex controller.
    @api
    renewalData() {
        fetchData({showAllData : this.showAllOpportunity})
            .then((results) => {
                let tempExistingProducts = [];
                let tempTermingProducts = [];
                let accExisProd = [];
                let accTermProd = [];
                let productLineArray = ["Medical", "Pharmacy", "Dental", "Vision", "Other"];
                let tempAccordianLabels = [];
                let tempExistingOppId = [];
                let tempTermingOppId = [];
                let month = new Date().getMonth();
                let currentCycle = new Date().getFullYear() + 1;
                let currentCycleJan = new Date().getFullYear();
                let currentSS = month > 0 ? `SS ${currentCycle}` : `SS ${currentCycleJan}`;

                //seggrigation of data into different arrays.
                let dentalVisionList = results[0].dentalVisionList != null ? results[0].dentalVisionList : '';
                this.accData = results[0].accList != null ? results[0].accList : this.accData = ''; // JSON.parse(JSON.stringify(results[0].accList))
                this.summaryOppList = results[0].summaryOppList != null ? results[0].summaryOppList : this.summaryOppList = ''; // JSON.parse(JSON.stringify(results[0].summaryOppList))

                //constructing JSON to display new and terming products.
                this.summaryOppList.forEach((opp) => {
                    if (opp.OpportunityLineItems != null && opp.OpportunityLineItems != undefined) {
                        opp.OpportunityLineItems.forEach((oppLnItm) => {
                            if (parseInt(oppLnItm.Net_Results__c) > 0 &&
                                opp.Sales_Season1__c == this.selectedCycle) {
                                tempExistingProducts.push({
                                    "AccountId": opp.AccountId,
                                    "Opportunity": opp.Name,
                                    "OpportunityId": oppLnItm.OpportunityId,
                                    "Product_Line__c": oppLnItm.Product_Line__c,
                                    "Product2_Name": oppLnItm.Product2.Name,
                                    "Net_Results__c": oppLnItm.Net_Results__c,
                                    "EffectiveDate__c": opp.EffectiveDate__c
                                });
                            }
                            else if (parseInt(oppLnItm.Net_Results__c) < 0 &&
                                opp.Sales_Season1__c == this.selectedCycle) {
                                tempTermingProducts.push({
                                    "AccountId": opp.AccountId,
                                    "Opportunity": opp.Name,
                                    "OpportunityId": oppLnItm.OpportunityId,
                                    "Product_Line__c": oppLnItm.Product_Line__c,
                                    "Product2_Name": oppLnItm.Product2.Name,
                                    "Net_Results__c": oppLnItm.Net_Results__c,
                                    "EffectiveDate__c": opp.EffectiveDate__c
                                });
                            }

                        });
                    }
                });
                //displaying product name for Medical,Pharmacy and other product lines.
                tempExistingProducts.forEach((ep) => {
                    if (ep.Product_Line__c == "Medical" || ep.Product_Line__c == "Pharmacy" || ep.Product_Line__c == "Other") {
                        ep.isDisplayName = true;
                    }
                    else {
                        ep.isDisplayName = false;
                    }
                });
                //displaying product name for Medical,Pharmacy and other product lines.
                tempTermingProducts.forEach((tp) => {
                    if (tp.Product_Line__c == "Medical" || tp.Product_Line__c == "Pharmacy" || tp.Product_Line__c == "Other") {
                        tp.isDisplayName = true;
                    }
                    else {
                        tp.isDisplayName = false;
                    }
                });
                //to biforcate validated and non validated accounts.
                this.accData.forEach((acc) => {
                    tempAccordianLabels.push(acc.Name);
                    Object.keys(acc).forEach((key) => {
                        if (key == "Renewal_Checklists__r") {
                            acc[key].forEach((accRenewal) => {
                                if ((accRenewal.Renewal_Checklist_Validated_By__c != null && accRenewal.Renewal_Checklist_Validated_By__c != undefined) &&
                                    (accRenewal.Renewal_Checklist_Validated_Date__c != null && accRenewal.Renewal_Checklist_Validated_Date__c != undefined) 
                                    && accRenewal.Sales_Season__c ==this.selectedCycle) {
                                    acc.isValidated = true;
                                    let [date, time] = accRenewal.Renewal_Checklist_Validated_Date__c.split(', ')
                                    acc.nameAndDate = `${acc.Name} - Completed On ${date}`;
                                }
                                else if(accRenewal.Sales_Season__c ==this.selectedCycle) {
                                    acc.isValidated = false;
                                }
                                
                            });
                        }
                    });
                    tempExistingProducts.forEach((exisProd) => {
                        if (acc.Id == exisProd.AccountId) {
                            accExisProd.push(exisProd);
                        }
                        else if (acc.Id == exisProd.Opportunity.AccountId) {
                            accExisProd.push(exisProd);
                        }
                    });
                    tempTermingProducts.forEach((termProd) => {
                        if (acc.Id == termProd.AccountId) {
                            accTermProd.push(termProd);
                        }
                        else if (acc.Id == termProd.Opportunity.AccountId) {
                            accTermProd.push(termProd);
                        }
                    });

                    accExisProd.sort((a, b) => (a.Product2_Name > b.Product2_Name) ? 1 : ((b.Product2_Name > a.Product2_Name) ? -1 : 0))
                    accTermProd.sort((a, b) => (a.Product2_Name > b.Product2_Name) ? 1 : ((b.Product2_Name > a.Product2_Name) ? -1 : 0))

                    // if (this.showAllOpportunity) {
                    //     acc.ExistingProducts = accExisProd;
                    //     acc.TermingProducts = accTermProd;
                    // }
                    // else{
                    //     acc.ExistingProducts = this.filterProductsForJanuary(accExisProd);
                    //     acc.TermingProducts = this.filterProductsForJanuary(accTermProd);
                    // }
                    acc.ExistingProducts = accExisProd;
                    acc.TermingProducts = accTermProd;
                    acc.showExistingProducts = accExisProd.length > 0 ? true : false;
                    acc.showTermingProducts = accTermProd.length > 0 ? true : false;

                    acc.ExistingProducts.sort(function (a, b) {
                        return productLineArray.indexOf(a.Product_Line__c) - productLineArray.indexOf(b.Product_Line__c);
                    });

                    acc.TermingProducts.sort(function (a, b) {
                        return productLineArray.indexOf(a.Product_Line__c) - productLineArray.indexOf(b.Product_Line__c);
                    });
                    accExisProd = [];
                    accTermProd = [];
                });

                this.accData = this.accData.slice().sort((a, b) => {
                    let sa = a.Name.toLowerCase();
                    let sb = b.Name.toLowerCase();

                    if (sa > sb) {
                        return 1;
                    }
                    else if (sb > sa) {
                        return -1;
                    }
                    else return 0;
                });
                this.activeSectionsSub = tempAccordianLabels;
                this.activeSectionsSub2 = tempAccordianLabels;
                this.isLoading = false;
            })
            .catch((error) => {
                //console.log('error ---> ' + JSON.stringify(error.message));
                const event = new ShowToastEvent({
                    variant: 'error',
                    title: 'ERROR',
                    message: 'Error loading data. Please contact your administrator',
                });
                this.dispatchEvent(event);
                this.isLoading = false;
            })
    }

    filterProductsForJanuary(products) {
        return products.filter(item => {
            const effectiveDate = new Date(item.EffectiveDate__c);
            return effectiveDate.getMonth() === 0;
        });
    }

    @api
    validatedDataFromParent() {
        this.renewalData();
    }

    displayAccountRecs(accRecs, rtObj) {
        let accountData = [];
        if (accRecs.length > 0) {
            accRecs.forEach(acc => {
                let duplicates = 0;
                if (acc.RecordTypeId === rtObj.existingClientRt) {
                    accountData.push(acc);
                }
                else if (acc.RecordTypeId === rtObj.clientSubsidiaryRt) {
                    if (acc.UHC_Medical_Members__c > 0 && !acc.hasOwnProperty('Opportunities')) {
                        accountData.push(acc);
                    }
                    else if (acc.hasOwnProperty('Opportunities')) {
                        acc.Opportunities.forEach(accOpp => {
                            if (accOpp.Status__c == 'Open' && acc.UHC_Medical_Members__c >= 0) {
                                if (!accountData.includes(acc)) {
                                    accountData.push(acc);
                                }
                            }
                            else if (acc.UHC_Medical_Members__c > 0 && accOpp.Status__c == 'Closed') {
                                if (!accountData.includes(acc)) {
                                    accountData.push(acc);
                                }
                            }

                        });
                    }
                }
            });
        }
        this.accData = accountData;
    }

    removeSectionTopPadding() {
        let style = document.createElement('style');
        style.innerText = `
        .section-header-style .slds-accordion__summary{
            padding-top: 0px;
        }
        `
        this.template.querySelector(`.section-header-style`).appendChild(style);
    }

    setAccordianStyles() {
        let style = document.createElement('style');
        style.innerText = `
        .section-header-sub .slds-accordion__summary-heading{
            background-color: #9cb3dd !important;          
            font-size: 12px !important;           
        }
        .section-header-sub .slds-accordion__summary{
            margin-bottom: .5rem;
        }        
        .section-header-sub .slds-accordion__section{
            padding-bottom:0px;
        }
        .section-header-style .slds-accordion__summary-heading{
            background-color: #9cb3dd !important;
            padding: 4px 10px;
            border-radius: 3px;
            font-weight: 600; 
            font-size: 13px;           
        }  
        .slds-accordion__list-item {
            border-top: none;
        }  
        .slds-dropdown_fluid, .slds-dropdown--fluid {
          min-width: 0px !important;
          max-width: 100%;
          width: 100%;
      } `;
        this.template.querySelector('.section-header-style').appendChild(style);
    }

    calculateSalesSeason() {
        let month = new Date().getMonth();
        let currentCycle = new Date().getFullYear();
        //let currentCycleJan = new Date().getFullYear();
        let currentSS = month > 0 ? `IY ${currentCycle}, 1/1/${currentCycle + 1}` : `IY ${currentCycle - 1}, 1/1/${currentCycle}`;
    }

    handleAccView(event) {
        this.accId = event.currentTarget.dataset.accid;
        this.accUrl = `/${this.accId}`;
    }

    handleExpandCollapse(event) {

        if (this.activeSectionsSub != null || this.activeSectionsSub != undefined) {
            this.activeSectionsSub = null;
        }
        else {
            this.activeSectionsSub = this.activeSectionsSub2;
        }
    }

    handleComplete(event) {
        const accId = event.target.dataset.id;
        const selectedAcc = this.accData.find(acc => acc.Id === accId);
        this.eventAccdata = {
            "accId": event.target.dataset.id,
            "accName": event.target.dataset.name,
            "activeTab": "Details",
            "accRec": selectedAcc,
            "showAllOpportunity": this.showAllOpportunity
        }
        const childAccId = new CustomEvent('accountid', { detail: this.eventAccdata });
        this.dispatchEvent(childAccId);

        document.body.scrollTop = 0; document.documentElement.scrollTop = 0;
    }

    // Logic to determine date Options
    updateDateOptions() {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const isJanuary = currentDate.getMonth() === 0;

        this.dateOptions = [
            { label: `IY ${currentYear - 1}, 1/1/${currentYear}`, value: `SS ${currentYear}` },
            { label: `IY ${currentYear}, 1/1/${currentYear+1}`, value: `SS ${currentYear+1}` },
            { label: `IY ${currentYear+1}, 1/1/${currentYear+2}`, value: `SS ${currentYear+2}` },

        ];
        this.selectedCycle =`SS ${currentYear+1}`;

        
        const ssChange = new CustomEvent('salesseasonchange', { detail: this.selectedCycle });
        this.dispatchEvent(ssChange);

        // if (isJanuary) {
        //     // Set dateOptions for January
        //     this.dateOptions = [
        //         { label: `IY ${currentYear - 1}, 1/1/${currentYear}`, value: `Show All` },
        //         { label: `IY ${currentYear}, 1/1/${currentYear+1}`, value: `Show All` },
        //     ];
        //  } //else {
        // //     const nextYear = currentYear + 1;
        // //     // Set dateOptions for other non-January cases
        // //     this.dateOptions = [
        // //         { label: `IY ${currentYear}, 1/1/${nextYear}`, value: `Show All` },
        // //         { label: `IY ${nextYear}, 1/1/${nextYear}`, value: `One Month` },
        // //     ];
        // // }
    }


    handleOptionChange(event) {
        this.selectedCycle = event.detail.value;
        if (this.selectedCycle == "One Month") this.showAllOpportunity = false;
        if (this.selectedCycle == "Show All") this.showAllOpportunity = true;

        
        const ssChange = new CustomEvent('salesseasonchange', { detail: this.selectedCycle });
        this.dispatchEvent(ssChange);


        this.renewalData();
    }


}