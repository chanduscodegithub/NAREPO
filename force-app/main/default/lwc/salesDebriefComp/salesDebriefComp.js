import { LightningElement, api, track, wire } from 'lwc';
import sdRecordsApex from '@salesforce/apex/SalesDebriefController.getQuestionsAndAnswers';
import saveSalesDebriefData from '@salesforce/apex/SalesDebriefController.saveSalesDebriefData';
import getSalesDebriefPdf from '@salesforce/apex/SalesDebriefController.getSalesDebriefPdf';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import printDocument from '@salesforce/apex/SalesDebriefController.printDocument';

import sdInvalidRole from '@salesforce/label/c.Sales_Debrief_Invalid_Role';
import sdPicklistNone from '@salesforce/label/c.Sales_Debrief_Picklist_None';
import sdPastYear from '@salesforce/label/c.Sales_Debrief_Past_Year';
import sdFutureYear from '@salesforce/label/c.Sales_Debrief_Future_Year';
import sdNotConfigured from '@salesforce/label/c.Sales_Debrief_Not_Configured';

import { checkForAdvocacySolutionsAgainstUMR } from './helper';

/****************Shruti*******************Start*/
import sdOverridePicklistNoneCD from '@salesforce/label/c.Sales_Debrief_Override_None_For_CD';
import sdOverridePicklistNoneCM from '@salesforce/label/c.Sales_Debrief_Override_None_For_CM';
import sdPicklistNoneCM from '@salesforce/label/c.Sales_Debrief_Picklist_None_For_CM';
/****************Shruti*******************End*/

// import cmSurestOnlySection from '@salesforce/label/c.Sales_debrief_CM_surest_only_sections'; //Varun

const SUPPHEALTHPRODCODES = ['SP-APPEP', 'SP-APPV', 'SP-CIPPEP', 'SP-CIPPV', 'SP-HIEP', 'SP-HIVOL', 'SP-SHCP', 'SP-IWFSH', 'SP-IWFCI', 'SP-IWFAP', 'SP-IWFHI'];
const LIFEANDDISABPRODCODES = ['SP-DIST', 'SP-DILT', 'SP-DIAM', 'SP-LB', 'SP-LD', 'SP-LS', 'SP-IWFSTD', 'SP-IWFL'];

const SUPPHEALTHPRODREPORTTYPES = ['APP', 'CI', 'HI'];
const LIFEANDDISABPRODREPORTTYPES = ['Life', 'LTD', 'STD']; // changes made by varun to update reporting product type field. removed - 'Disability'

export default class salesDebriefComp extends LightningElement {
    @api recordId;
    salesDebriefRecordId;
    opportunityData;
    accountName;
    membershipActivityName;
    oppRecType;
    effectiveDateYear;
    surestStrategy;
    surestOutcome;
    surestStage;
    surestClosedReason;
    surestOfferStrategy;

    dataFromApex;
    @track questionAndAnswerData;
    @track questionAndAnswerRecords;
    labelVsApiMap;

    isEditMode = false;
    isReadMode = false;
    isLoad = true;

    oliList;
    displayAdditionalInfo;

    dispositionMedical;
    dispositionPharmacy;
    dispositionVision;
    dispositionDental;

    existingMembRiskOutcomeMed = '';
    existingMembRiskOutcomePharm = '';
    existingMembRiskOutcomeVis = '';
    existingMembRiskOutcomeDen = '';

    closedReason1Medical;
    closedReason1Pharmacy = '';
    closedReason1Vision = '';
    closedReason1Dental = '';


    winnerPrimaryMedical = '';
    winnerPrimaryPharmacy = '';
    winnerPrimaryVision = '';
    winnerPrimaryDental = '';

    winnerPrimaryCompetitor = '';

    networkDiscountPosition = '';
    networkDiscountPositionNA = '';

    primaryConsultant = '';
    primaryConsultingFirm = '';

    supplementalHealthProd = [];
    lifeAndDisabilityProd = [];

    printDataList;

    showSalesDebrief;
    areQuestionsConfigured;
    salesDebriefPicklistValue;
    validUserRole;
    alternateMessage;
    oppRecordTypeName;

    showSuppHealthProds = false;
    showLifeDisabilityProds = false;

    suppHealthSold = false;
    suppHealthLostFin = false;

    lifeDisabilitySold = false;
    lifeDisabilityLostFin = false;

    medTopCompWriteIn;
    productTypeInvolved;

    isRecordLocked;
    currentYear;

    medTopCompValue = '';
    medTopCompwriteInValue = '';

    isSpecialtyProductsPresent = false;
    // isSpecialtyProductsPresentWithDisposition = false;
    salesDebriefType;

    isPharmacyOpportunityPresent;
    pharmacySalesDebriefValue;
    surestOnlyQuestionnaire;
    platformsQuoted;
    YEAR = 2024;
    /****************Shruti*******************Start*/
    membershipActRecordType;
    membershipActStatus;
    salesDebriefOverride;
    mASalesSeason;
    hasSurest = false;// Case 3498
    hasUMR = false;
    hasQuad4 = false;
    customLabel = {
        sdInvalidRole,
        sdPicklistNone,
        sdPastYear,
        sdFutureYear,
        sdNotConfigured,
        sdOverridePicklistNoneCD,
        sdOverridePicklistNoneCM,
        sdPicklistNoneCM
    };
    /****************Shruti*******************End*/

    connectedCallback() {
        this.getSalesDebriefRecords();
    }

    /*Data is returned from apex. 
    It is manipulated into properly structured JSON 
    and is being displayed in HTML*/
    getSalesDebriefRecords() {
        sdRecordsApex({ oppRecordId: this.recordId })
            .then(result => {
                //this.isLoad = true;
                this.alteredDataToMeetSomeCriteria = {};
                this.printDataList = [];
                this.dataFromApex = result[0];
                this.opportunityData = this.dataFromApex.opportunityRecord;
                this.questionAndAnswerData = this.dataFromApex.sdConfigList; //Config questions and answers
                this.questionAndAnswerRecords = (!this.dataFromApex.sdDataList[0]) ? {} : this.dataFromApex.sdDataList[0]; //Actual Records
                this.effectiveDateYear = this.dataFromApex.effectiveDateYear;
                this.currentYear = this.dataFromApex.currentYear;
                this.labelVsApiMap = this.dataFromApex.labelVsApiMap;
                this.isPharmacyOpportunityPresent = this.dataFromApex.isPharmacyOpportunityPresent;
                this.pharmacySalesDebriefValue = this.dataFromApex.pharmacySalesDebriefValue;
                this.salesDebriefType = this.dataFromApex.salesDebriefType;
                this.isSpecialtyProductsPresent = this.dataFromApex.isSpecialtyProdPresent;


                //console.log('isSpecialtyProductsPresent ' + this.isSpecialtyProductsPresent)

                this.existingMembRiskOutcomeMed = this.opportunityData.Existing_Members_Risk_Outcome_Medical__c;
                this.existingMembRiskOutcomePharm = this.opportunityData.Existing_Members_Risk_Outcome_Pharmacy__c;
                this.existingMembRiskOutcomeVis = this.opportunityData.Existing_Members_Risk_Outcome_Vision__c;
                this.existingMembRiskOutcomeDen = this.opportunityData.Existing_Members_Risk_Outcome_Dental__c;

                this.productTypeInvolved = this.opportunityData.Product_Type_Involved_in_Opp__c;
                /****************Shruti*******************Start*/
                this.membershipActRecordType = this.opportunityData.RecordType.DeveloperName;
                this.membershipActStatus = this.opportunityData.Status__c;
                this.salesDebriefOverride = this.opportunityData.Sales_Debrief_Override__c;
                this.mASalesSeason = this.opportunityData.Sales_Season1__c;
                /****************Shruti*******************End*/
                this.surestOnlyQuestionnaire = false;
                this.isRecordLocked = this.dataFromApex.isRecordLocked;



                if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                    this.salesDebriefRecordId = this.questionAndAnswerRecords.Id;
                }
                // ----------------------------Varun-------------------------------//
                // if (this.opportunityData.hasOwnProperty('Platforms_Sold__c') && this.opportunityData.Platforms_Sold__c.split(';').includes('SUREST')) {
                //     this.surestOutcome = 'Surest: Sold';
                // }
                // else if (this.opportunityData.hasOwnProperty('Platforms_Sold__c') && !this.opportunityData.Platforms_Sold__c.split(';').includes('SUREST')) {
                //     this.surestOutcome = 'Surest: Lost';
                // }
                // else {
                //     this.surestOutcome = '';
                // }
                this.surestClosedReason = this.opportunityData.hasOwnProperty('Closed_Reason_1_Surest__c') && !this.isNull(this.opportunityData.Closed_Reason_1_Surest__c) ? this.opportunityData.Closed_Reason_1_Surest__c : '';
                this.surestStage = this.opportunityData.hasOwnProperty('Surest_Stage__c') && !this.isNull(this.opportunityData.Surest_Stage__c) ? this.opportunityData.Surest_Stage__c : '';
                this.surestOfferStrategy = this.opportunityData.hasOwnProperty('Offer_Nationally__c') && !this.isNull(this.opportunityData.Offer_Nationally__c) ? this.opportunityData.Offer_Nationally__c : '';
                this.surestOutcome = this.opportunityData.hasOwnProperty('Platforms_Sold__c') && this.opportunityData.Platforms_Sold__c.split(';').includes('SUREST') ? 'Surest: Sold' : 'Surest: Lost';
                if (this.opportunityData.hasOwnProperty('Surest_Strategy__c') && !this.isNull(this.opportunityData.Surest_Strategy__c)) {
                    this.surestStrategy = this.opportunityData.Surest_Strategy__c;
                    if (this.questionAndAnswerRecords['Financial_Offer_for_Surest__c']) {
                        this.questionAndAnswerRecords['Financial_Offer_for_Surest__c'] = '';
                    }
                }
                else {
                    this.surestStrategy = '';
                }
                // ----------------------------Varun-------------------------------//

                //--------Conditionally Render contents in Sales Debrief tab--------


                if (this.questionAndAnswerData.length > 0) {
                    this.areQuestionsConfigured = true;
                }
                else {
                    this.areQuestionsConfigured = false;
                }

                this.validUserRole = (this.dataFromApex.validUserRole!=undefined || this.dataFromApex.validUserRole != null)? this.dataFromApex.validUserRole:false;
                this.salesDebriefPicklistValue = this.opportunityData.Sales_Debrief__c; //checkbox value calculated in flow

                if (this.salesDebriefPicklistValue == 'N/A' || !this.areQuestionsConfigured || !this.validUserRole || this.salesDebriefPicklistValue == null || this.salesDebriefPicklistValue == undefined || this.salesDebriefPicklistValue == '') {
                    this.showSalesDebrief = false;
                }
                else {
                    this.showSalesDebrief = true;
                }

                if (!this.validUserRole) {
                    setTimeout(() => {
                        this.template.querySelector('.alternateMessageClass span').innerHTML = '';
                        this.alternateMessage = this.customLabel.sdInvalidRole;
                    }, 150);
                }
                else if (this.salesDebriefPicklistValue == 'N/A') {
                    if (this.membershipActRecordType == 'CD') {
                        setTimeout(() => {
                            this.template.querySelector('.alternateMessageClass span').innerHTML = '';
                            this.alternateMessage = this.customLabel.sdPicklistNone;
                        },
                            150);
                    } else if (this.membershipActRecordType == 'CM') {
                        setTimeout(() => {
                            this.template.querySelector('.alternateMessageClass span').innerHTML = '';
                            this.alternateMessage = this.customLabel.sdPicklistNoneCM;
                        }, 150);
                    }
                }
                else if (!this.areQuestionsConfigured) {
                    /****************Shruti********************Start*/
                    // (this.mASalesSeason == 'SS 2024') && 
                    if (((this.salesDebriefPicklistValue == null || this.salesDebriefPicklistValue == undefined || this.salesDebriefPicklistValue == '') || (this.salesDebriefOverride == null || this.salesDebriefOverride == undefined || this.salesDebriefOverride == '')) && (this.membershipActStatus == 'Open')) {
                        if (this.membershipActRecordType == 'CD') {
                            setTimeout(() => {
                                this.template.querySelector('.alternateMessageClass span').innerHTML = '';
                                this.alternateMessage = this.customLabel.sdOverridePicklistNoneCD;
                            }, 150);
                        }
                        else if (this.membershipActRecordType == 'CM') {
                            setTimeout(() => {
                                this.template.querySelector('.alternateMessageClass span').innerHTML = '';
                                this.alternateMessage = this.customLabel.sdOverridePicklistNoneCM;
                            }, 150);
                        }
                    }
                    else if ((this.salesDebriefPicklistValue == null || this.salesDebriefPicklistValue == undefined || this.salesDebriefPicklistValue == '') && (this.salesDebriefOverride == null || this.salesDebriefOverride == undefined || this.salesDebriefOverride == '')) {
                        if (this.membershipActRecordType == 'CD') {
                            setTimeout(() => {
                                this.template.querySelector('.alternateMessageClass span').innerHTML = '';
                                this.alternateMessage = this.customLabel.sdPicklistNone;
                            }, 150);
                        }
                        else if (this.membershipActRecordType == 'CM') {
                            setTimeout(() => {
                                this.template.querySelector('.alternateMessageClass span').innerHTML = '';
                                this.alternateMessage = this.customLabel.sdPicklistNoneCM;
                            }, 150);
                        }
                    }

                    else if (parseInt(this.effectiveDateYear) >= parseInt(this.currentYear)) {
                        //future year
                        setTimeout(() => {
                            this.template.querySelector('.alternateMessageClass span').innerHTML = '';
                            this.alternateMessage = this.customLabel.sdFutureYear;
                        }, 150);
                    }
                    else if (parseInt(this.effectiveDateYear) < parseInt(this.currentYear)) {
                        //past year
                        setTimeout(() => {
                            this.template.querySelector('.alternateMessageClass span').innerHTML = this.customLabel.sdPastYear;
                            this.alternateMessage = '';
                        }, 150);
                    }


                    // else {
                    //     //past year
                    //     this.alternateMessage = this.customLabel.sdNotConfigured;
                    // }
                }
                /****************Shruti********************End*/
                console.log('alternateMessage ' + this.alternateMessage);
                //--------Conditionally Render contents in Sales Debrief tab--------

                this.oliList = this.dataFromApex.oliList;
                this.oppRecordTypeName = this.opportunityData.RecordType.DeveloperName;

                this.accountName = this.opportunityData.Account.Name;
                this.membershipActivityName = this.opportunityData.Name;
                this.oppRecType = this.opportunityData.RecordType.DeveloperName;
                this.hasQuad4 = (this.opportunityData.Quad4__c != null || this.opportunityData.Quad4__c != undefined) ? true : false;

                if (this.opportunityData.Platforms_Quoted__c != null && this.opportunityData.Platforms_Quoted__c != undefined) {
                    this.platformsQuoted = this.opportunityData.Platforms_Quoted__c;
                }
                else {
                    this.platformsQuoted = '';
                }

                if (this.opportunityData.Disposition_Medical__c != null && this.opportunityData.Disposition_Medical__c != undefined) {
                    this.dispositionMedical = this.opportunityData.Disposition_Medical__c;
                }
                else {
                    this.dispositionMedical = '';
                }

                if (this.opportunityData.Disposition_Pharmacy__c != null && this.opportunityData.Disposition_Pharmacy__c != undefined) {
                    this.dispositionPharmacy = this.opportunityData.Disposition_Pharmacy__c;
                }
                else {
                    this.dispositionPharmacy = '';
                }

                if (this.opportunityData.Disposition_Vision__c != null && this.opportunityData.Disposition_Vision__c != undefined) {
                    this.dispositionVision = this.opportunityData.Disposition_Vision__c;
                }
                else {
                    this.dispositionVision = '';
                }

                if (this.opportunityData.Disposition_Dental__c != null && this.opportunityData.Disposition_Dental__c != undefined) {
                    this.dispositionDental = this.opportunityData.Disposition_Dental__c;
                }
                else {
                    this.dispositionDental = '';
                }
                /* this.dispositionPharmacy = this.opportunityData.Disposition_Pharmacy__c;
                this.dispositionVision = this.opportunityData.Disposition_Vision__c;
                this.dispositionDental = this.opportunityData.Disposition_Dental__c; */

                //-------------------------------CLOSED REASON MEDICAL, PHARMACY, VISION, DENTAL-------------------------------
                if (this.opportunityData.Closed_Reason_1_Medical__c != null && this.opportunityData.Closed_Reason_1_Medical__c != undefined) {
                    this.closedReason1Medical = this.opportunityData.Closed_Reason_1_Medical__c;
                }
                else {
                    this.closedReason1Medical = '';
                }

                if (this.opportunityData.Closed_Reason_1_Pharmacy__c != null && this.opportunityData.Closed_Reason_1_Pharmacy__c != undefined) {
                    this.closedReason1Pharmacy = this.opportunityData.Closed_Reason_1_Pharmacy__c;
                }
                else {
                    this.closedReason1Pharmacy = '';
                }

                if (this.opportunityData.Closed_Reason_1_Vision__c != null && this.opportunityData.Closed_Reason_1_Vision__c != undefined) {
                    this.closedReason1Vision = this.opportunityData.Closed_Reason_1_Vision__c;
                }
                else {
                    this.closedReason1Vision = '';
                }

                if (this.opportunityData.Closed_Reason_1_Dental__c != null && this.opportunityData.Closed_Reason_1_Dental__c != undefined) {
                    this.closedReason1Dental = this.opportunityData.Closed_Reason_1_Dental__c;
                }
                else {
                    this.closedReason1Dental = '';
                }
                //-------------------------------CLOSED REASON MEDICAL, PHARMACY, VISION, DENTAL-------------------------------

                //-------------------------------PRIMARY CONSULTANT AND PRIMARY CONSULTING FIRM-------------------------------
                if (this.opportunityData.PrimaryConsultant__c != null && this.opportunityData.PrimaryConsultant__c != undefined) {
                    this.primaryConsultant = this.opportunityData.PrimaryConsultant__r?.Name;
                }
                else {
                    this.primaryConsultant = '';
                }

                if (this.opportunityData.Primary_Consulting_Firm__c != null && this.opportunityData.Primary_Consulting_Firm__c != undefined) {
                    this.primaryConsultingFirm = this.opportunityData.Primary_Consulting_Firm__r?.Name;
                }
                else {
                    this.primaryConsultingFirm = '';
                }
                //-------------------------------PRIMARY CONSULTANT AND PRIMARY CONSULTING FIRM-------------------------------

                //-------------------------------WINNER PRIMARY MEDICAL, PHARMACY, VISION, DENTAL-------------------------------
                if (this.opportunityData.Winner_Primary_Medical__c != null && this.opportunityData.Winner_Primary_Medical__c != undefined) {
                    this.winnerPrimaryMedical = this.opportunityData.Winner_Primary_Medical__r?.Name;
                    this.winnerPrimaryCompetitor = this.opportunityData.Winner_Primary_Medical__r?.CompetitorGroup__c?this.opportunityData.Winner_Primary_Medical__r.CompetitorGroup__c:'';
                    if(this.winnerPrimaryCompetitor != null && this.winnerPrimaryCompetitor != ''){
                    if(this.winnerPrimaryCompetitor == 'Aetna'){
                        this.networkDiscountPosition = this.opportunityData.vs_Aetna__c?'vs '+this.winnerPrimaryCompetitor+' '+this.opportunityData.vs_Aetna__c+'%':'';
                    } else if(this.winnerPrimaryCompetitor == 'Anthem'){
                        this.networkDiscountPosition = this.opportunityData.vs_Anthem__c?'vs '+this.winnerPrimaryCompetitor+' '+this.opportunityData.vs_Anthem__c+'%':'';
                    } else if(this.winnerPrimaryCompetitor == 'Blues'){
                        this.networkDiscountPosition = this.opportunityData.vs_Blues__c?'vs '+this.winnerPrimaryCompetitor+' '+this.opportunityData.vs_Blues__c+'%':'';
                    } else if(this.winnerPrimaryCompetitor == 'Cigna'){
                        this.networkDiscountPosition = this.opportunityData.vs_Cigna__c?'vs '+this.winnerPrimaryCompetitor+' '+this.opportunityData.vs_Cigna__c+'%':'';
                    } else {
                        this.networkDiscountPosition = '';
                    }
                    }
                }
                else {
                    this.winnerPrimaryMedical = '';
                }

                if (this.opportunityData.Winner_Primary_Pharmacy__c != null && this.opportunityData.Winner_Primary_Pharmacy__c != undefined) {
                    this.winnerPrimaryPharmacy = this.opportunityData.Winner_Primary_Pharmacy__r?.Name;
                }
                else {
                    this.winnerPrimaryPharmacy = '';
                }

                if (this.opportunityData.Winner_Primary_Vision__c != null && this.opportunityData.Winner_Primary_Vision__c != undefined) {
                    this.winnerPrimaryVision = this.opportunityData.Winner_Primary_Vision__r?.Name;
                }
                else {
                    this.winnerPrimaryVision = '';
                }

                if (this.opportunityData.Winner_Primary_Dental__c != null && this.opportunityData.Winner_Primary_Dental__c != undefined) {
                    this.winnerPrimaryDental = this.opportunityData.Winner_Primary_Dental__r.Name;
                }
                else {
                    this.winnerPrimaryDental = '';
                }
                //-------------------------------WINNER PRIMARY MEDICAL, PHARMACY, VISION, DENTAL-------------------------------                

                //To Display Products in "Supplemental Health Feedback" section and "Life & Disability Feedback" section
                if (this.oliList != null && this.oliList != undefined) {
                    this.supplementalHealthProd = [];
                    this.lifeAndDisabilityProd = [];

                    this.suppHealthSold = false;
                    this.suppHealthLostFin = false;
                    this.lifeDisabilitySold = false;
                    this.lifeDisabilityLostFin = false;

                    this.oliList.forEach((oli) => {
                        // if( oli.Product2.Family == 'Specialty Products' && 
                        //     ['Sold', 'Lost: Finalist', 'Lost: Non-Finalist'].includes( oli.Disposition_Other_Buy_Up_Programs__c ) 
                        // ){
                        //     this.isSpecialtyProductsPresentWithDisposition = true;
                        // }

                        if (oli.Product2Id != null && oli.Product2Id != undefined) {
                            let tempObj = { prodName: oli.Product2.Name, prodDisp: oli.Disposition_Other_Buy_Up_Programs__c, prodDisplayOrder: oli.Product2.Product_Display_Order__c };

                            if (SUPPHEALTHPRODREPORTTYPES.includes(oli.Product2.Reporting_Product_Type__c)) {
                                this.supplementalHealthProd.push(tempObj);
                                this.showSuppHealthProds = true;
                                if (oli.Disposition_Other_Buy_Up_Programs__c == 'Sold') {
                                    this.suppHealthSold = true;
                                }
                                else if (oli.Disposition_Other_Buy_Up_Programs__c == 'Lost: Finalist' || oli.Disposition_Other_Buy_Up_Programs__c == 'Lost: Non-Finalist') {
                                    this.suppHealthLostFin = true;
                                }
                            }
                            else if (LIFEANDDISABPRODREPORTTYPES.includes(oli.Product2.Reporting_Product_Type__c)) {
                                this.lifeAndDisabilityProd.push(tempObj);
                                this.showLifeDisabilityProds = true;
                                if (oli.Disposition_Other_Buy_Up_Programs__c == 'Sold') {
                                    this.lifeDisabilitySold = true;
                                }
                                else if (oli.Disposition_Other_Buy_Up_Programs__c == 'Lost: Finalist' || oli.Disposition_Other_Buy_Up_Programs__c == 'Lost: Non-Finalist') {
                                    this.lifeDisabilityLostFin = true;
                                }
                            }
                        }
                    });
                    /* console.log('Supp Health ' + JSON.stringify(this.supplementalHealthProd));
                    console.log('Life Disability ' + JSON.stringify(this.lifeAndDisabilityProd)); */
                }

                //Sorting questions based on index (Based on Medical or Specialty)
                if (this.salesDebriefPicklistValue != null && this.salesDebriefPicklistValue != undefined) {
                    if (this.salesDebriefPicklistValue == 'Comprehensive Medical') {
                        this.questionAndAnswerData.sort((a, b) => {
                            return a.Medical_Index__c - b.Medical_Index__c;
                        });
                    }
                    else if (this.salesDebriefPicklistValue == 'Specialty Only') {
                        this.questionAndAnswerData.sort((a, b) => {
                            return a.Specialty_Index__c - b.Specialty_Index__c;
                        });
                    }

                }

                console.log('this.questionAndAnswerData after sort = ', JSON.stringify(this.questionAndAnswerData));
                // For special rendering
                for (let quest of this.questionAndAnswerData) {
                    if (quest.Api__c == 'Final_Platform__c') {
                        this.hasSurest = false;
                        this.hasUMR = false; // Case 3498
                        if (!this.opportunityData.Platforms_Quoted__c ||
                            (
                                this.opportunityData.Platforms_Quoted__c && this.opportunityData.Platforms_Quoted__c.split(';').length === 1
                                // && ['UMR', 'SUREST'].includes( this.opportunityData.Platforms_Quoted__c ) 
                            )
                        ) {
                            quest.renderThisQuestion = false;
                            quest.displayAlternateSection = true;
                            this.alteredDataToMeetSomeCriteria['Final_Platform__c'] = this.questionAndAnswerRecords['Final_Platform__c'];
                            this.questionAndAnswerRecords['Final_Platform__c'] = this.opportunityData.Platforms_Quoted__c;
                            this.setHasSurest();
                        }
                        // Case 3498
                        else if (this.opportunityData.Platforms_Quoted__c) {
                            // if (this.opportunityData.Platforms_Quoted__c.split(';').includes('SUREST')) {
                            //     this.hasSurest = true;
                            // }
                            this.setHasSurest();
                            if (this.opportunityData.Platforms_Quoted__c === 'UMR') {
                                this.hasUMR = true;
                            }
                        }
                    }
                }

                this.questionAndAnswerData.forEach((quest, index) => {
                    quest.renderThisQuestion = (quest.renderThisQuestion == null || quest.renderThisQuestion == undefined) ? true : quest.renderThisQuestion; //render all questions true
                    quest.multiPicklistSelectedLabel = 'Response Selection';

                    //Conditional rendering for picklist, multipicklist and textbox
                    if (quest.Type__c == 'Picklist') {
                        quest.isPicklistField = true;
                    }
                    else if (quest.Type__c == 'MultiPicklist') {
                        quest.isMultiPicklistField = true;
                    }
                    else if (quest.Type__c == 'Textbox') {
                        quest.isTextField = true;
                    }

                    //For populating field value in UI - Iterating actual data list
                    if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                        Object.keys(this.questionAndAnswerRecords).forEach((fieldApi) => {
                            if (fieldApi == 'Medical_Top_Competitor_Write_In__c') {
                                this.medTopCompWriteIn = this.questionAndAnswerRecords[fieldApi];
                            }

                            if (quest.Api__c == fieldApi) {
                                if (quest.isPicklistField || quest.isTextField) {
                                    quest.recordValue = this.questionAndAnswerRecords[fieldApi];
                                    //Show Write In box if 'Other' is selected
                                    if (quest.recordValue == 'Other') {
                                        quest.showWriteIn = true;
                                    }
                                }
                                if (quest.isMultiPicklistField) {
                                    if (this.questionAndAnswerRecords[fieldApi] != null && this.questionAndAnswerRecords[fieldApi] != undefined) {
                                        quest.recordValue = this.questionAndAnswerRecords[fieldApi].split(';');
                                    }
                                    //Show Write In box if 'Other' is selected
                                    if (quest.recordValue.includes('Other')) {
                                        quest.showWriteIn = true;
                                    }
                                }
                            }

                            //Populate Write In value
                            if (quest.Write_In__c != null && quest.Write_In__c != undefined && quest.Write_In__c == fieldApi) {
                                quest.writeInValue = this.questionAndAnswerRecords[fieldApi];
                            }
                        });
                    }

                    //Child Component Data - Start
                    if (quest.Child_Component__c) {
                        if (quest.Child_Component_Datatype__c == 'Text') {
                            let tempArrayToJson = [];
                            let tempFieldSetArray = quest.Child_Component_Field_Set__c.split(';');
                            let alteredLabel;
                            let prodType;

                            Object.keys(this.labelVsApiMap).forEach((lab) => {
                                if (tempFieldSetArray.includes(lab)) {
                                    //Current Value of the field
                                    let currentFieldVal;

                                    if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                                        Object.keys(this.questionAndAnswerRecords).forEach((rec) => {
                                            if (this.labelVsApiMap[lab] == rec) {
                                                currentFieldVal = this.questionAndAnswerRecords[rec];
                                            }
                                        })
                                    }

                                    //Altering labels of table component questions
                                    if (quest.Question__c == 'Please enter the vision credit amounts included in the deal. Indicate if not included or if not known. (e.g., $30,000, indicate value of vision credits only)') {
                                        alteredLabel = lab.replace('Vision ', '');
                                        prodType = 'vision';
                                    }
                                    else if (quest.Question__c == 'Please enter the dental credit amounts included in the deal. Indicate if not included or if not known. (e.g., $30,000, indicate value of dental credits only)') {
                                        alteredLabel = lab.replace('Dental ', '');
                                        prodType = 'dental';
                                    }
                                    else if (quest.Question__c == 'Please enter the supplemental health credit amounts included in the deal. Indicate if not included or if not known. (e.g., $30,000, indicate value of supplemental health credits only)') {
                                        alteredLabel = lab.replace('Supp Health ', '');
                                        prodType = 'supplemental health';
                                    }
                                    else if (quest.Question__c == 'Please enter the life & disability credit amounts included in the deal. Indicate if not included or if not known. (e.g., $30,000, indicate value of life & disability credits only)') {
                                        alteredLabel = lab.replace('Life/DI ', '');
                                        prodType = 'life & disability';
                                    }

                                    //Creating an object with field label, api, options and current value
                                    let tempObj2 = {
                                        originalLabel: lab,
                                        labelVal: alteredLabel,
                                        apiVal: this.labelVsApiMap[lab],
                                        currentVal: currentFieldVal,
                                        productType: prodType
                                    };

                                    tempArrayToJson.push(tempObj2);

                                    tempArrayToJson.sort(function (a, b) {
                                        return tempFieldSetArray.indexOf(a.originalLabel) - tempFieldSetArray.indexOf(b.originalLabel);
                                    });

                                    //childComponentMetadata is sent to child component 
                                    //console.log('tempArrayToJson child component ' + JSON.stringify(tempArrayToJson))
                                    quest.childComponentMetadata = tempArrayToJson;
                                }
                            })
                        }

                        if (quest.Child_Component_Datatype__c == 'Radio') {
                            let tempArrayToJson = [];
                            let tempFieldSetArray = quest.Child_Component_Field_Set__c.split(';');
                            let tempOptionsArray = quest.Child_Component_Options__c.split(';');
                            let alteredLabel;

                            Object.keys(this.labelVsApiMap).forEach((lab) => {
                                if (tempFieldSetArray.includes(lab)) {
                                    //Constructing child component options' Key:Value pair
                                    let tempArray = [];
                                    tempOptionsArray.forEach((key) => {
                                        let tempObj1 = [{ label: '', value: key }];
                                        tempArray.push(tempObj1);
                                    });

                                    //Current Value of the field
                                    let currentFieldVal;
                                    if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                                        Object.keys(this.questionAndAnswerRecords).forEach((rec) => {
                                            if (this.labelVsApiMap[lab] == rec) {
                                                currentFieldVal = this.questionAndAnswerRecords[rec];
                                            }
                                        })
                                    }

                                    //Altering labels of table component questions
                                    if (quest.Question__c == 'In the end, how competitive were we in each of the following areas based on the carrier listed above? Answer this question based on consultant or direct client perception.') {
                                        if(lab == 'Competitive Financial guarantees'){
                                            alteredLabel = 'Financial guarantees (e.g., trend or discount)'; 
                                        }else{
                                        alteredLabel = lab.replace('Competitive ', '');
                                    }
                                    }
                                    else if (quest.Question__c == "What best describes the consultant's presentation of our content to the employer in the following areas?") {
                                        alteredLabel = lab.replace('Consultant ', '');
                                    }
                                    else if (quest.Question__c == 'Were the following included in the vision deal?') {
                                        alteredLabel = lab.replace('Vision ', '');
                                    }
                                    else if (quest.Question__c == 'Were the following included in the dental deal?') {
                                        alteredLabel = lab.replace('Dental ', '');
                                    }
                                    else if (quest.Question__c == 'Were the following included in the supplemental health solutions deal?') {
                                        alteredLabel = lab.replace('Supp Health ', '');
                                    }
                                    else if (quest.Question__c == 'Were the following included in the life & disability deal?') {
                                        alteredLabel = lab.replace('Life/DI ', '');
                                    }
                                    else {
                                        alteredLabel = lab;
                                    }

                                    //Creating an object with field label, api, options and current value
                                    let tempObj2 = {
                                        originalLabel: lab,
                                        labelVal: alteredLabel,
                                        apiVal: this.labelVsApiMap[lab],
                                        optionsVal: tempArray,
                                        currentVal: currentFieldVal
                                    };

                                    tempArrayToJson.push(tempObj2);

                                    tempArrayToJson.sort(function (a, b) {
                                        return tempFieldSetArray.indexOf(a.originalLabel) - tempFieldSetArray.indexOf(b.originalLabel);
                                    });

                                    //childComponentMetadata is sent to child component 
                                    quest.childComponentMetadata = tempArrayToJson;
                                }
                            });
                        }

                        if (quest.Child_Component_Datatype__c == 'Table') {
                            //let tempOptionsArray = quest.Child_Component_Options__c.split(';');
                            let apiValueString;
                            let currentFieldVal;

                            //Table has only one field. Obtaining the api of that field
                            for (let i in this.labelVsApiMap) {
                                if (i == quest.Child_Component_Field_Set__c) {
                                    apiValueString = this.labelVsApiMap[i];
                                }
                            }

                            //Obtaining current value of the field
                            if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                                for (let i in this.questionAndAnswerRecords) {
                                    if (i == apiValueString) {
                                        currentFieldVal = this.questionAndAnswerRecords[i];
                                    }
                                }
                            }

                            //Creating an object with field api and current value
                            let tempObj = {
                                apiVal: apiValueString,
                                currentVal: currentFieldVal
                            };

                            //childComponentMetadata is sent to child component
                            quest.childComponentMetadata = tempObj;
                        }
                    }
                    //Child Component Data - End

                    //Dependency Logic - Start
                    if (quest.Is_Dependent_Question__c == true) {
                        quest.renderThisQuestion = false;

                        let count = 0;
                        let isDependency1 = false;
                        let isDependency2 = false;
                        //let isDependency3 = false;

                        //Checking how many dependent questions are present
                        if (quest.Controlling_Question_1__c != null && quest.Controlling_Question_1__c != undefined) {
                            count++;
                        }
                        if (quest.Controlling_Question_2__c != null && quest.Controlling_Question_2__c != undefined) {
                            count++;
                        }
                        /* if (quest.Controlling_Question_3__c != null && quest.Controlling_Question_3__c != undefined) {
                            count++;
                        } */

                        //Iterating actual records
                        if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                            Object.keys(this.questionAndAnswerRecords).forEach((recs) => {
                                /*Checking for three conditions - 
                                1. Controlling question is present or not 
                                2. Actual data's question (question inside loop) is equal to controlling question
                                3. Actual data's question's answer is equal to controlling value*/
                                if ((quest.Controlling_Question_1__c != null && quest.Controlling_Question_1__c != undefined) &&
                                    recs == quest.Controlling_Question_1__r.Api__c && this.questionAndAnswerRecords[recs] &&
                                    (this.questionAndAnswerRecords[recs] == quest.Controlling_Value_1__r.Value__c ||
                                        this.questionAndAnswerRecords[recs].includes(quest.Controlling_Value_1__r.Value__c))) {
                                    isDependency1 = true;
                                }
                                if ((quest.Controlling_Question_2__c != null && quest.Controlling_Question_2__c != undefined) &&
                                    recs == quest.Controlling_Question_2__r.Api__c && this.questionAndAnswerRecords[recs] &&
                                    (this.questionAndAnswerRecords[recs] == quest.Controlling_Value_2__r.Value__c ||
                                        this.questionAndAnswerRecords[recs].includes(quest.Controlling_Value_2__r.Value__c))) {
                                        if(quest.Controlling_Question_2__r.Api__c == 'Less_Innovative_Capabilities__c') {
                                            isDependency2 = false;
                                        }else{  
                                            isDependency2 = true;
                                        }
                                }
                               
                                /* if ((quest.Controlling_Question_3__c != null && quest.Controlling_Question_3__c != undefined) &&
                                    recs == quest.Controlling_Question_3__r.Api__c &&
                                    (this.questionAndAnswerRecords[recs] == quest.Controlling_Value_3__r.Value__c ||
                                        this.questionAndAnswerRecords[recs].includes(quest.Controlling_Value_3__r.Value__c))) {
                                    isDependency3 = true;
                                } */
                            });


                            if (count == 1 && isDependency1) {
                                quest.renderThisQuestion = true;
                            }
                            else if (count == 2) {
                                //if count > 1, check for dependency logic to render question
                            if (quest.Dependency_Logic__c != null || quest.Dependency_Logic__c != undefined) {
                                if (quest.Dependency_Logic__c.toUpperCase() == 'OR' && (isDependency1 || isDependency2)) {
                                    quest.renderThisQuestion = true;
                                }
                                else if (quest.Dependency_Logic__c.toUpperCase() == 'AND' && (isDependency1 && isDependency2)) {
                                    quest.renderThisQuestion = true;
                                }
                            }
                            }
                            /* else if (count == 3) {
                                if (quest.Dependency_Logic__c.toUpperCase() == 'OR' && (isDependency1 || isDependency2 || isDependency3)) {
                                    quest.renderThisQuestion = true;
                                }
                                else if (quest.Dependency_Logic__c.toUpperCase() == 'AND' && (isDependency1 && isDependency2 && isDependency3)) {
                                    quest.renderThisQuestion = true;
                                }
                            } */

                            if (quest.Section_Name__c === 'Advocacy Solutions' && isDependency1) {
                                //quest.renderThisQuestion = checkForAdvocacySolutionsAgainstUMR(quest, this.opportunityData, this.questionAndAnswerRecords);
                                quest.renderThisQuestion = true;
                            }
                        }
                    }
                    //Dependency logic - End

                    Object.keys(quest).forEach((objKey) => {
                        if (objKey == 'Sales_Debrief_Config_Answers__r') {
                            //Sorting options based on index
                            quest[objKey].sort((a, b) => {
                                return a.Index__c - b.Index__c;
                            });

                            let optArray = [];

                            //Adding "None" option only for Picklist fields
                            if (quest.isPicklistField) {
                                optArray.push({
                                    label: "--None--",
                                    value: "",
                                    selected: true
                                });
                            }

                            //Iterating options and inserting them by creating new property
                            quest[objKey].forEach((ans) => {
                                Object.keys(ans).forEach((key) => {
                                    if (key == 'Value__c') {
                                        let tempObj = { label: ans[key], value: ans[key] };
                                        optArray.push(tempObj);
                                        quest.Options = optArray;
                                    }
                                });
                            });
                        }
                    });
                    // Case 3498
                    //Surest Section
                    if (quest.Section_Name__c == 'Surest Questions' && this.hasSurest) {

                        //-----------Changes by Varun----------------------//
                        if (quest.Year__c > this.YEAR) {
                            //this.surestInfo(quest, index);
                            this.displaySurestQuestions(quest, this.surestStrategy, this.surestStage, this.questionAndAnswerRecords);
                        }
                        else {
                            if (quest.Api__c == 'Surest_Interest__c') {
                                quest.renderThisQuestion = true;
                            }
                            if (quest.Api__c == 'Surest_Value_Proposition__c') {
                                quest.renderThisQuestion = true;
                            }
                            if (this.questionAndAnswerRecords['Surest_Value_Proposition__c'] == 'No')
                                if (quest.Api__c == 'Surest_Value_Unclear__c') {
                                    quest.renderThisQuestion = true;
                                }
                            if (quest.Api__c == 'Surest_Valued_by_Employer__c') {
                                quest.renderThisQuestion = true;
                            }
                            if (quest.Api__c == 'Surest_Least_Valued__c') {
                                quest.renderThisQuestion = true;
                            }
                        }
                    }
                    //-----------Changes by Varun----------------------//

                    if (quest.Section_Name__c == 'UMR Questions' && this.hasUMR) {
                        if (quest.Api__c == 'What_prompted_UMR_platform_proposal__c') {
                            quest.renderThisQuestion = true;
                        }
                        if (quest.Api__c == 'Employer_likely_to_change_administrators__c') {
                            quest.renderThisQuestion = true;
                        }
                        if (quest.Api__c == 'Competitors_propose_UMR_could_not_offer__c') {
                            quest.renderThisQuestion = true;
                        }

                    }

                    if (quest.Section_Name__c == 'Quad4') {
                        this.displayQuad4Section(quest);
                    }
                    // aggregated all strategy questions in displayStrategySection function
                    if (quest.Section_Name__c == 'Strategy') {
                        this.displayStrategySection(quest);
                    }
                    //Supplemental Health products conditional rendering
                    // moved to new function
                    if (quest.Section_Name__c == 'Supplemental Health Feedback') {
                        this.displaySupplimentalHealthFeedbackSection(quest);
                    }

                    //Life & Disability products conditional rendering
                    // moved to new function
                    if (quest.Section_Name__c == 'Life & Disability Feedback') {
                        this.displayLifeAndDisabilitySection(quest);
                    }

                    //Only if “Cost: Overall” was the Closed Reason #1 Q8
                    if (quest.Api__c == 'Cost_Overall_Explain__c' && this.closedReason1Medical != 'Cost: Overall') {
                        quest.renderThisQuestion = false;
                    }

                    //Only if “Other: Explain” was the Closed Reason #1 Q9
                    if (quest.Api__c == 'Other_Explain_Comment__c' && this.closedReason1Medical != 'Other: Explain') {
                        quest.renderThisQuestion = false;
                    }

                    //Alter the multipicklist "selected" box label - START
                    if (quest.Api__c == 'Competitors_rank_best_and_final_offer__c') {
                        quest.multiPicklistSelectedLabel = 'Response Selection (Use up/down arrows to sort; carrier with strongest offer at the top)';
                    }

                    if (quest.Api__c == 'Reasons_selected_medical_carrier__c') {
                        quest.multiPicklistSelectedLabel = 'Response Selection (Use up/down arrows to sort with most important reason at the top)'
                    }

                    if (quest.Api__c == 'Supp_Health_Top_Drivers__c' || quest.Api__c == 'Life_Disability_Outcome_Drivers__c') {
                        quest.multiPicklistSelectedLabel = 'Response Selection (Use up/down arrows to sort; most important reason at top)'
                    }
                    //Alter the multipicklist "selected" box label - END

                    //Display "Other Specialty" section to all deals that include specialty products with disposition 
                    //(product family is Specialty Products)
                    //-----------Changes by Varun----------------------// 
                    this.displayOtherSpecialitySection(quest);
                    //-----------Changes by Varun----------------------//

                    //Display Consultant Influence section only if Primary Consultant is UHC - Direct, No Consultant and Direct, Target Marketing
                    if (quest.Section_Name__c == 'Consultant Influence' && ['UHC - Direct, No Consultant', 'Direct, Target Marketing'].includes(this.primaryConsultingFirm)) {
                        quest.renderThisQuestion = false;
                    }


                    //-----------------------Changes by Varun----------------------//
                    //render these questions only for CD rec type (only for medical sales debrief) strategy questions
                    // if ((quest.Api__c == 'Relationship_with_employer_before_RFP__c' || quest.Api__c == 'Consultant_meeting_RFP__c' || quest.Api__c == 'Medical_SVPs_engagement_before_RFP__c')
                    //     && this.oppRecType != 'CD') {
                    //     quest.renderThisQuestion = false;
                    //     quest.recordValue = '';

                    //     if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                    //         this.questionAndAnswerRecords[quest.Api__c] = '';
                    //     }
                    // }
                    // #3546 changes added by  Varun  moved to strategy section function
                    // if (quest.Api__c === 'Medical_SCEs_engagement_before_RFP__c' && this.oppRecType != 'CM') {
                    //     quest.renderThisQuestion = false;
                    //     quest.recordValue = '';
                    // }
                    // #3546 changes end
                    //-----------------------Changes by Varun----------------------//

                    //"UHC needed to win deal" conditional rendering
                    if (quest.Api__c == 'UHC_needed_to_win_deal__c') {
                        if (this.dispositionMedical == 'Lost: Finalist' || this.dispositionMedical == 'Lost: Non-Finalist' ||
                            (this.dispositionMedical == 'Sold' && (
                                (this.existingMembRiskOutcomeMed == 'Partial Cancellation' && this.winnerPrimaryMedical != 'National Accounts')
                                // || this.existingMembRiskOutcomeMed == 'Retained' || !this.existingMembRiskOutcomeMed // -- TODO: Need to be confirmed
                            )
                            )) {
                            quest.renderThisQuestion = true;
                        }
                        else {
                            quest.renderThisQuestion = false;
                        }
                    }

                    //"Medical Top Competitor" conditional rendering
                    if (quest.Api__c == 'Medical_Top_Competitor__c') {
                        if (this.dispositionMedical === 'Sold' && (
                            this.existingMembRiskOutcomeMed == 'Retained' || !this.existingMembRiskOutcomeMed ||
                            (this.existingMembRiskOutcomeMed == 'Partial Cancellation' && this.winnerPrimaryMedical == 'National Accounts')
                        )
                        ) {
                            quest.renderThisQuestion = true;
                        }
                        else {
                            quest.renderThisQuestion = false;
                        }
                    }

                    //Show Pharmacy Feedback section only if disposition pharmacy is sold,Lost: Finalist or Lost: Non-Finalist
                    /*If a pharmacy opportunity is present for the same sales season, 
                    then display questions based on the value of "Pharmacy Sales Debrief" field*/
                    if (quest.Section_Name__c == 'Pharmacy Feedback') {
                        //quest.renderThisQuestion = false;
                        if (this.pharmacySalesDebriefValue) {
                            if (this.pharmacySalesDebriefValue == 'Rx - Sold' &&
                                ['Top_Rx_Competitor__c', 'Rx_factors_outcome__c', 'Rx_Feedback__c', 'Rx_Specific_Requirements__c'].includes(quest.Api__c) // 70, 71, 74
                            ) {
                                quest.renderThisQuestion = true;
                            } else if (this.pharmacySalesDebriefValue == 'Rx - Lost' &&
                                ['Rx_factors_outcome__c', 'Rx_offer_from_winner__c', 'Rx_Specific_Requirements__c', 'Rx_Feedback__c'].includes(quest.Api__c) // 71, 72, 73, 74
                            ) {
                                quest.renderThisQuestion = true;
                            } else {
                                quest.renderThisQuestion = false;
                            }
                        }

                        if (!this.pharmacySalesDebriefValue)
                            if (this.productTypeInvolved.includes('Pharmacy') &&
                                (this.dispositionPharmacy == 'Sold' || this.dispositionPharmacy == 'Lost: Finalist' || this.dispositionPharmacy == 'Lost: Non-Finalist')) {
                                //"Top Rx Competitor" conditional rendering
                                if (quest.Api__c == 'Top_Rx_Competitor__c') {

                                    if (this.dispositionPharmacy == 'Sold' &&
                                        (
                                            this.existingMembRiskOutcomePharm == 'Retained' || !this.existingMembRiskOutcomePharm ||
                                            (this.existingMembRiskOutcomePharm == 'Partial Cancellation' && this.winnerPrimaryPharmacy == 'National Accounts')
                                        )
                                    ) {
                                        quest.renderThisQuestion = true;
                                    }
                                    else {
                                        quest.renderThisQuestion = false;
                                    }


                                }
                                //"Rx offer from winner" conditional rendering
                                else if (quest.Api__c == 'Rx_offer_from_winner__c') {
                                    if (
                                        this.dispositionPharmacy == 'Lost: Finalist' || this.dispositionPharmacy == 'Lost: Non-Finalist' ||
                                        (this.dispositionPharmacy == 'Sold' && ((this.existingMembRiskOutcomePharm == 'Partial Cancellation' && this.winnerPrimaryPharmacy != 'National Accounts')))
                                    ) {
                                        quest.renderThisQuestion = true;
                                    }
                                    else {
                                        quest.renderThisQuestion = false;
                                    }
                                }// #3546 changes added by  Varun (adding Sold to existing condition)
                                else if (quest.Api__c == 'Rx_Specific_Requirements__c') {
                                    if (
                                        this.dispositionPharmacy == 'Lost: Finalist' || this.dispositionPharmacy == 'Lost: Non-Finalist' || this.dispositionPharmacy == 'Sold'
                                    ) {
                                        quest.renderThisQuestion = true;
                                    }
                                    else {
                                        quest.renderThisQuestion = false;
                                    }
                                }
                            } else {
                                quest.renderThisQuestion = false;
                            }
                    }

                    //Show Vision Feedback section only if disposition vision is sold,Lost: Finalist or Lost: Non-Finalist
                    //moved to new function
                    else if (quest.Section_Name__c == 'Vision Feedback') {
                        this.displayVisionFeedbackSection(quest);
                    }

                    //Show Dental Feedback section only if disposition dental is sold,Lost: Finalist or Lost: Non-Finalist
                    // moved to new function
                    else if (quest.Section_Name__c == 'Dental Feedback') {
                        this.displayDentalFeedbackSection(quest);
                    }


                    // moved to strategy section function by Varun
                    // if (quest.Api__c == 'Consultant_meeting_RFP__c' && this.oppRecType == 'CD') {
                    //     if (['Direct, Target Marketing', 'UHC - Direct, No Consultant'].includes(this.opportunityData?.Primary_Consulting_Firm__r?.Name)) {
                    //         quest.renderThisQuestion = false;
                    //     }
                    // }
                    //-------------------------------CM Surest only questions changes by Varun start-----------------------// 
                    if (this.salesDebriefPicklistValue === 'Comprehensive Medical' && (this.membershipActRecordType === 'CM' || this.membershipActRecordType === 'CD') && this.platformsQuoted === 'SUREST' && quest.Year__c > this.YEAR) {
                        this.surestOnlyQuestionnaire = true;
                        quest.displayAlternateSection = false;
                        console.log('has surest surestOnlyQuestionnaire = ', this.hasSurest);
                        this.selectSectionsToDisplay(quest);
                    }
                    //-------------------------------CM Surest only questions changes by Varun end-----------------------// 
                });

                // #3546 changes added by  Varun
                let surestValueUnclearIndex = this.questionAndAnswerData.findIndex(item => item.hasOwnProperty('Api__c') && item.Api__c == 'Surest_Value_Unclear__c');
                if (
                    surestValueUnclearIndex != -1 &&
                    this.questionAndAnswerRecords?.hasOwnProperty('Surest_Value_Proposition__c') &&
                    this.questionAndAnswerRecords.Surest_Value_Proposition__c === 'Not provided by consultant'
                ) {
                    this.questionAndAnswerData[surestValueUnclearIndex].renderThisQuestion = false;
                }
                // #3546 changes added by  Varun END

                let tempSectionNameArray = [];
                //looping questionAndAnswerData again to display section name and gather data for print 
                this.questionAndAnswerData.forEach((quest, index) => {
                    let tempString = '';

                    if (quest.Api__c == 'Medical_Top_Competitor__c' && quest.renderThisQuestion == true) {
                        if (quest.recordValue != null && quest.recordValue != undefined) {
                            this.medTopCompValue = quest.recordValue;
                            this.medTopCompwriteInValue = (quest.writeInValue) ? ` - ${quest.writeInValue}` : '';
                        }
                    }

                    //Displaying section name
                    if (quest.Section_Name__c != null && quest.Section_Name__c != undefined) {
                        if ((quest.renderThisQuestion && !tempSectionNameArray.includes(quest.Section_Name__c))) {
                            quest.displaySection = true;
                            tempSectionNameArray.push(quest.Section_Name__c);
                        }
                        else {
                            quest.displaySection = false;
                        }
                    }

                    //For getting values of child components to Print
                    if (quest.Child_Component__c && quest.Type__c == null) {
                        let fieldSet = [];
                        let tempArrayofObjects = [];
                        let tempArrayofObjects2 = [];
                        let apiFieldSet = [];

                        fieldSet = quest.Child_Component_Field_Set__c.split(';');

                        Object.keys(this.labelVsApiMap).forEach((lab) => {
                            if (fieldSet.includes(lab)) {
                                tempArrayofObjects.push({
                                    'label': lab,
                                    'value': this.labelVsApiMap[lab]
                                });
                            }
                        })

                        tempArrayofObjects.sort(function (a, b) {
                            return fieldSet.indexOf(a.label) - fieldSet.indexOf(b.label);
                        });

                        for (let tObj in tempArrayofObjects) {
                            apiFieldSet.push(tempArrayofObjects[tObj].value);
                        }

                        if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                            Object.keys(this.questionAndAnswerRecords).forEach((rec) => {
                                if (apiFieldSet.includes(rec)) {
                                    let labelVal = Object.keys(this.labelVsApiMap).find(key => this.labelVsApiMap[key] === rec);
                                    if (labelVal === 'Competitive Financial guarantees') {
                                        labelVal = 'Competitive Financial guarantees (e.g., trend or discount)';
                                    }
                                    let tempString2 = `<b>${labelVal} -</b> ${this.questionAndAnswerRecords[rec]}<br/>`;
                                    tempArrayofObjects2.push({
                                        'api': rec,
                                        'value': tempString2
                                    });
                                }
                            });

                            tempArrayofObjects2.sort(function (a, b) {
                                return apiFieldSet.indexOf(a.api) - apiFieldSet.indexOf(b.api);
                            });

                            for (let tobj2 in tempArrayofObjects2) {
                                tempString += tempArrayofObjects2[tobj2].value;
                            }
                        }

                    }


                    //Print Start
                    let sectionNameFinal = quest.displaySection ? quest.Section_Name__c : '';
                    let answerFinal;
                    let writeInPrint;
                    if (quest.recordValue != null && quest.recordValue != undefined) {
                        if (quest.isMultiPicklistField) {
                            answerFinal = quest.recordValue.toString();
                        }
                        else {
                            answerFinal = quest.recordValue;
                        }
                    }
                    else if (quest.Child_Component__c && quest.Type__c == null) {
                        answerFinal = tempString;
                    }
                    else {
                        answerFinal = '';
                    }

                    if (answerFinal != null && answerFinal != undefined) {
                        if (answerFinal == 'UHC was Advantaged (>= 0.0%)') {
                            answerFinal = 'UHC was Advantaged (&gt;= 0.0%)';
                        }
                        else if (answerFinal == 'UHC was Challenged (<= -2.0%)') {
                            answerFinal = 'UHC was Challenged (&lt;= -2.0%)';
                        }

                    }

                    //<b>Please Specify: </b>
                    if (quest.showWriteIn && quest.writeInValue != null && quest.writeInValue != undefined) {
                        writeInPrint = `${quest.writeInValue}`;
                    }
                    else {
                        writeInPrint = '';
                    }

                    let printObj = {
                        sectionName: sectionNameFinal,
                        question: quest.Question__c,
                        answer: answerFinal,
                        writeInValue: writeInPrint,
                        shortForm: quest.Short_Form__c,
                        apiName: quest.Api__c,
                        rendered: quest.renderThisQuestion
                    };

                    if (quest.displayAlternateSection) {
                        printObj = {
                            sectionName: quest.Section_Name__c,
                            question: '',
                            answer: '',
                            writeInValue: '',
                            shortForm: quest.Short_Form__c,
                            apiName: quest.Api__c,
                            rendered: true
                        }
                    }

                    if (!(quest.Api__c == 'Relationship_with_employer_before_RFP__c' && this.recordTypeName == 'CM')) {
                        this.printDataList.push(printObj);
                    }
                    //Print End


                    if (quest.Write_In__c != null && quest.Write_In__c != undefined) {
                        if (quest.writeInValue != null && quest.writeInValue != undefined) {
                            quest.charLength = quest.writeInValue.length;
                        }
                        else {
                            quest.charLength = 0;
                        }
                    }
                    else {
                        if (quest.recordValue != null && quest.recordValue != undefined) {
                            quest.charLength = quest.recordValue.length;
                        }
                        else {
                            quest.charLength = 0;
                        }
                    }


                });

                console.log(`this.questionAndAnswerData ${JSON.stringify(this.questionAndAnswerData)}`);
                this.isLoad = false;
            })
            .catch(error => {
                console.log('Error -> ' + error);
                console.log(error.stack);
                this.isLoad = false;
            });
    }


    //--------------------Added by Varun---------------------------------// 
    isNull(field) {
        if (field !== null && field !== '' && field !== undefined) {
            return false;
        }
        return true;
    }

    displayStrategySection(question) {
        question.renderThisQuestion = true;

        if (question.Api__c === 'Medical_SCEs_engagement_before_RFP__c' && this.oppRecType != 'CM') {
            question.renderThisQuestion = false;
            question.recordValue = '';
        }

         if (question.Api__c == 'Medical_SVPs_engagement_before_RFP__c' && this.oppRecType != 'CD') {
            question.renderThisQuestion = false;
            question.recordValue = '';

        }

        if (question.Api__c == 'Consultant_meeting_RFP__c' || question.Api__c == 'Relationship_with_employer_before_RFP__c') {
            if( this.oppRecType == 'CD'|| this.salesDebriefPicklistValue == 'Specialty Only') {
                question.renderThisQuestion = true;
            }
            else{
                question.renderThisQuestion = false;
                question.recordValue = '';

                if (this.questionAndAnswerRecords != null && this.questionAndAnswerRecords != undefined) {
                    this.questionAndAnswerRecords[question.Api__c] = '';
                }
            }
        }

        if (question.Api__c == 'Consultant_meeting_RFP__c') {
            if (['Direct, Target Marketing', 'UHC - Direct, No Consultant'].includes(this.opportunityData?.Primary_Consulting_Firm__r?.Name)) {
                question.renderThisQuestion = false;
            }
        }
    }

    displaySurestQuestions(question, strategy, outcome, salesDebriefRecord) {
        console.log('Api = ', question.Api__c, ' renderThisQuestion = ', question.renderThisQuestion);
        if (question.Section_Name__c === 'Surest Questions') {
            question.renderThisQuestion = false;
        }
        if (question.Api__c == 'Surest_Feedback__c') {
            question.renderThisQuestion = true;
        }
        if (question.Api__c == 'Other_factors_impacting_Surest_Deal__c') {
            question.renderThisQuestion = true;
        }
         if (question.Api__c == 'Surest_as_Other_Platform_Entry__c') {
            question.renderThisQuestion = true;
        }
        if (question.Api__c == 'Financial_Offer_for_Surest__c') {
            question.renderThisQuestion = this.isNull(strategy) ? true : false;
        }
        if (!this.isNull(strategy) || !this.isNull(salesDebriefRecord['Financial_Offer_for_Surest__c'])) {
            if (question.Api__c === 'Reason_for_no_formal_Surest_quote__c') {
                if (strategy === '1 - Level 1, Plan Design + Savings Estimate' || salesDebriefRecord['Financial_Offer_for_Surest__c'] == 'No') {
                    question.renderThisQuestion = true;
                }
                else {
                    question.renderThisQuestion = false;
                    question.recordValue = '';
                    this.questionAndAnswerRecords[question.Api__c] = '';
                    if (question.writeInValue) {
                        question.writeInValue = '';
                        this.questionAndAnswerRecords[question.Write_In__c] = '';
                    }
                }
            }
            if (question.Api__c === 'Surest_Interest__c' || question.Api__c === 'Surest_Value_Proposition_Presented__c' || question.Api__c === 'Surest_outcome_tied_to_the_UHC_Medical__c' || question.Api__c === 'Non_traditional_health_plans_evaluated__c' || question.Api__c === 'Surest_Network_Discount_Position_Impact__c') {
                if ((strategy === '2 - Level 2, Complete Financial Proposal' || strategy === '3a - Level 3a, Financial Proposal and Full Questionnaire' || strategy === '3b - Level 3b, Financial Proposal and Full Questionnaire with UHC and/or UMR') || 
                     strategy === '4 - Level 4 - Traditional (UHC/UMR) RFP with Surest - add Surest competitive differentiators only' || strategy === '5 - Level 5 - Traditional (UHC/UMR) RFP with Surest - answer where Surest platform varies from traditiona' || salesDebriefRecord['Financial_Offer_for_Surest__c'] == 'Yes') {
                    question.renderThisQuestion = true;
                }
                else {
                    question.renderThisQuestion = false;
                    question.recordValue = '';
                    this.questionAndAnswerRecords[question.Api__c] = '';
                    if (question.writeInValue) {
                        question.writeInValue = '';
                        this.questionAndAnswerRecords[question.Write_In__c] = '';
                    }
                }
            }
        }
        if (!this.isNull(outcome) && !this.isNull(salesDebriefRecord['Non_traditional_health_plans_evaluated__c'])) {
            if (question.Api__c === 'Non_traditional_health_plan_opted__c') {
                const nonTraditionalPlans = ['Centivo', 'Collective Health', 'Transcarent', 'Simple Pay'];
                const selectedPlans = salesDebriefRecord['Non_traditional_health_plans_evaluated__c'].split(';');
                if (selectedPlans.some(plan => nonTraditionalPlans.includes(plan)) && (outcome === 'Lost: Finalist' || outcome === 'Lost: Non-Finalist')) {
                    question.renderThisQuestion = true;
                }
               else {
                    question.renderThisQuestion = false;
                    question.recordValue = '';
                    this.questionAndAnswerRecords[question.Api__c] = '';
                    if (question.writeInValue) {
                        question.writeInValue = '';
                        this.questionAndAnswerRecords[question.Write_In__c] = '';
                    }
                }
            }
        }
        if (question.Api__c === 'Reasons_Surest_not_offered__c') {
            if (outcome === 'Lost: Finalist' || outcome === 'Lost: Non-Finalist') {
                question.renderThisQuestion = true;
            }
            else {
                question.renderThisQuestion = false;
                question.recordValue = '';
                this.questionAndAnswerRecords[question.Api__c] = '';
                if (question.writeInValue) {
                    question.writeInValue = '';
                    this.questionAndAnswerRecords[question.Write_In__c] = '';
                }
            }
        }
        if (question.Api__c === 'Improving_Cross_Sell_Approach__c') {
            if ((this.platformsQuoted === 'SUREST' || this.surestOutcome === 'Surest: Sold') && this.oppRecType == 'CD') {
                question.renderThisQuestion = true;
            }
            else {
                question.renderThisQuestion = false;
                question.recordValue = '';
                this.questionAndAnswerRecords[question.Api__c] = '';
                if (question.writeInValue) {
                    question.writeInValue = '';
                    this.questionAndAnswerRecords[question.Write_In__c] = '';
                }
            }
        }
        if (question.Api__c === 'Surest_s_ASO_Fees_Factor__c' || question.Api__c === 'Add_Info_for_Surest_Membership_Est__c') {
            if (outcome === 'Sold') {
                question.renderThisQuestion = true;
            }
            else {
                question.renderThisQuestion = false;
                question.recordValue = '';
                this.questionAndAnswerRecords[question.Api__c] = '';
                if (question.writeInValue) {
                    question.writeInValue = '';
                    this.questionAndAnswerRecords[question.Write_In__c] = '';
                }
            }
        }
    }

    surestDependency(question, index) {
        switch (question.Api__c) {
            case 'Reason_for_no_formal_Surest_quote__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Surest_Interest__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Surest_Value_Proposition_Presented__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Surest_outcome_tied_to_the_UHC_Medical__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Reasons_Surest_not_offered__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Surest_s_ASO_Fees_Factor__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Non_traditional_health_plans_evaluated__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Surest_Network_Discount_Position_Impact__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Surest_Feedback__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Financial_Offer_for_Surest__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Other_factors_impacting_Surest_Deal__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Add_Info_for_Surest_Membership_Est__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Non_traditional_health_plan_opted__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Surest_as_Other_Platform_Entry__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
            case 'Improving_Cross_Sell_Approach__c':
                this.questionAndAnswerData[index].isDependency1 = true;
                break;
                
        }
    }
isSurestDouble =false;
    surestInfo(question, index) {
        
        if (question.Year__c > this.YEAR) {
            let firstClass = this.template.querySelector(`[data-apiclass="${question.Question__c}"]`);
            if (firstClass != null && firstClass != undefined) {
                if (question.Section_Name__c == 'Surest Questions' && this.hasSurest && question.displaySection) {
                    this.isSurestDouble =true;
                    let tempString = '';
                   // tempString += `<b>Surest Strategy</b> - ${this.surestStrategy} <br/> <b>Surest Stage</b> - ${this.surestStage} <br/> <b>Surest - Offer Strategy</b> - ${this.surestOfferStrategy}`;
                   tempString += `<b>Surest Strategy</b> - ${this.surestStrategy} <br/>`;
                   if (!this.surestStrategy && this.surestStage) {
                        tempString += `<span style="color: red;">Action required</span>: Complete the Surest strategy in the Membership Activity Details tab. <br/>`;
                    }
                    tempString += `<b>Surest Stage</b> - ${this.surestStage} <br/>`;
                    if (!this.surestStrategy && !this.surestStage) {
                        tempString += `<span style="color: red;">Action required</span>: Complete the Surest stage & Surest strategy in the Membership Activity Details tab. <br/>`;
                    } else if (!this.surestStage) {
                        tempString += `<span style="color: red;">Action required</span>: Complete the Surest stage in the Membership Activity Details tab. <br/>`;
                    }
                
                    tempString += `<b>Surest - Offer Strategy</b> - ${this.surestOfferStrategy}`;
                
                    firstClass.innerHTML = tempString;
                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }
                if (question.Api__c == 'Other_factors_impacting_Surest_Deal__c') {
                    let tempString = '';
                    if(this.surestStrategy == '0 - N/A, No Surest response provided' || this.surestStrategy == '4 - Level 4 - Traditional (UHC/UMR) RFP with Surest - add Surest competitive differentiators only' || this.surestStrategy == '5 - Level 5 - Traditional (UHC/UMR) RFP with Surest - answer where Surest platform varies from traditional' || this.surestStrategy == '6 - Level 6, Surest already in place'){
                        if(!this.isSurestDouble){
                        tempString += `<b>Surest Strategy</b> - ${this.surestStrategy} <br/>`;
                        if (!this.surestStrategy && this.surestStage) {
                            tempString += `<span style="color: red;">Action required</span>: Complete the Surest strategy in the Membership Activity Details tab. <br/>`;
                        }
                        tempString += `<b>Surest Stage</b> - ${this.surestStage} <br/>`;
                        if (!this.surestStrategy && !this.surestStage) {
                            tempString += `<span style="color: red;">Action required</span>: Complete the Surest stage & Surest strategy in the Membership Activity Details tab. <br/>`;
                        } else if (!this.surestStage) {
                            tempString += `<span style="color: red;">Action required</span>: Complete the Surest stage in the Membership Activity Details tab. <br/>`;
                        }    
                        tempString += `<b>Surest - Offer Strategy</b> - ${this.surestOfferStrategy} <br/> <b>Closed Reason #1 (Surest) </b> - ${this.surestClosedReason}`;
                        }
                        else{
                            tempString = ` <b>Closed Reason #1 (Surest) </b> - ${this.surestClosedReason}`;
                        }
                    }
                    else{
                        tempString = `<b>Closed Reason #1 (Surest) </b> - ${this.surestClosedReason}`;
                    }
                    firstClass.innerHTML = tempString;
                    if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                        && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                        this.printDataList[index].otherContent = tempString;
                    }
                }
            }
        }
    }

    setHasSurest() {
        if ((this.opportunityData.Platforms_Quoted__c && this.opportunityData.Platforms_Quoted__c.split(';').includes('SUREST')) || (this.questionAndAnswerRecords.hasOwnProperty('Final_Platform__c') && this.questionAndAnswerRecords['Final_Platform__c'].split(';').includes('SUREST'))) {
            this.hasSurest = true;
        }
        else if (this.opportunityData.Platforms_Quoted__c && this.opportunityData.Platforms_Quoted__c === 'SUREST') {
            this.hasSurest = true;
        }
        else if (this.opportunityData.Surest_Stage__c && (this.opportunityData.Surest_Stage__c === 'Sold' || this.opportunityData.Surest_Stage__c === 'Lost: Non-Finalist' || this.opportunityData.Surest_Stage__c === 'Lost: Finalist' )){
            this.hasSurest = true;
        }
        else {
            this.hasSurest = false;
        }
    }

    displayVisionFeedbackSection(question) {
        if (this.productTypeInvolved.includes('Vision') &&
            (this.dispositionVision == 'Sold' || this.dispositionVision == 'Lost: Finalist' || this.dispositionVision == 'Lost: Non-Finalist')) {
            //"Top Vision Competitor" conditional rendering
            if (question.Api__c == 'Top_Vision_Competitor__c') {
                if (this.dispositionVision == 'Sold' &&
                    (
                        !this.existingMembRiskOutcomeVis || this.existingMembRiskOutcomeVis == 'Retained' ||
                        (this.existingMembRiskOutcomeVis == 'Partial Cancellation' && this.winnerPrimaryVision == 'National Accounts')
                    )
                ) {
                    question.renderThisQuestion = true;
                }
                else {
                    question.renderThisQuestion = false;
                }
            }

            if (question.Api__c == 'Cost_Overall_Explain_Vision__c' && this.closedReason1Vision != 'Cost: Overall') {
                question.renderThisQuestion = false;
            }

            if (question.Api__c == 'Other_Explain_Comment_Vision__c' && this.closedReason1Vision != 'Other: Explain') {
                question.renderThisQuestion = false;
            }
        }
        else {
            question.renderThisQuestion = false;
        }
    }

    displayDentalFeedbackSection(question) {
        if (this.productTypeInvolved.includes('Dental') &&
            (this.dispositionDental == 'Sold' || this.dispositionDental == 'Lost: Finalist' || this.dispositionDental == 'Lost: Non-Finalist')) {
            //"Dental Top Competitor" conditional rendering
            if (question.Api__c == 'Dental_Top_Competitor__c') {

                if (this.dispositionDental == 'Sold' &&
                    (this.existingMembRiskOutcomeDen == 'Retained' || !this.existingMembRiskOutcomeDen ||
                        (this.existingMembRiskOutcomeDen == 'Partial Cancellation' && this.winnerPrimaryDental == 'National Accounts')
                    )
                ) {
                    question.renderThisQuestion = true;
                }
                else {
                    question.renderThisQuestion = false;
                }

            }

            if (question.Api__c == 'Cost_Overall_Explain_Dental__c' && this.closedReason1Dental != 'Cost: Overall') {
                question.renderThisQuestion = false;
            }

            if (question.Api__c == 'Other_Explain_Comment_Dental__c' && this.closedReason1Dental != 'Other: Explain') {
                question.renderThisQuestion = false;
            }
        }
        else {
            question.renderThisQuestion = false;
        }
    }

    displaySupplimentalHealthFeedbackSection(question) {
        if (this.showSuppHealthProds && this.productTypeInvolved.includes('Other Buy Up Programs')) {
            if (question.Api__c == 'Supp_Health_Top_Competitor__c') {
                if (this.suppHealthSold) {
                    question.renderThisQuestion = true;
                }
                else {
                    question.renderThisQuestion = false;
                }
            }
            if (question.Api__c == 'Supp_Health_winner__c') {
                if (this.suppHealthLostFin) {
                    question.renderThisQuestion = true;
                }
                else {
                    question.renderThisQuestion = false;
                }
            }
        }
        else {
            question.renderThisQuestion = false;
        }
    }

    displayLifeAndDisabilitySection(question) {
        if (this.showLifeDisabilityProds && this.productTypeInvolved.includes('Other Buy Up Programs')) {
            if (question.Api__c == 'Life_Disability_Competitor__c') {
                if (this.lifeDisabilitySold) {
                    question.renderThisQuestion = true;
                }
                else {
                    question.renderThisQuestion = false;
                }
            }

            if (question.Api__c == 'Life_Disability_Cost_Winner__c') {
                if (this.lifeDisabilityLostFin) {
                    question.renderThisQuestion = true;
                }
                else {
                    question.renderThisQuestion = false;
                }
            }
        }
        else {
            question.renderThisQuestion = false;
        }
    }

    displayOtherSpecialitySection(question) {
        if (question.Section_Name__c == 'Other Specialty' && !this.isSpecialtyProductsPresent) {
            question.renderThisQuestion = false;
        }
    }

    displayConsultantInfluenceSection(question){
        if (question.Section_Name__c == 'Consultant Influence' && ['UHC - Direct, No Consultant', 'Direct, Target Marketing'].includes(this.primaryConsultingFirm)) {
            question.renderThisQuestion = false;
        }
    }

    displayQuad4Section(question){
        if (question.Section_Name__c == 'Quad4' && this.hasQuad4) {
            question.renderThisQuestion = true;
        }
        else {
            question.renderThisQuestion = false;
        }
    }

    selectSectionsToDisplay(question) {
        switch (question.Section_Name__c) {
            case 'Strategy':
                this.displayStrategySection(question);
                break;
            case 'Surest Questions':
                this.displaySurestQuestions(question, this.surestStrategy, this.surestStage, this.questionAndAnswerRecords);
                break;
            case 'Vision Feedback':
                this.displayVisionFeedbackSection(question);
                break;
            case 'Dental Feedback':
                this.displayDentalFeedbackSection(question);
                break;
            case 'Supplemental Health Feedback':
                this.displaySupplimentalHealthFeedbackSection(question);
                break;
            case 'Life & Disability Feedback':
                this.displayLifeAndDisabilitySection(question);
                break;
            case 'Other Specialty':
                this.displayOtherSpecialitySection(question);
                break;
            case 'Final Thoughts':
                question.renderThisQuestion = true;
                break;
            case 'Value Story':
                question.renderThisQuestion = true;
                break;
            case 'Consultant Influence':
                this.displayConsultantInfluenceSection(question);
                break;
            case 'Quad4':
                this.displayQuad4Section(question);
                break;
            case 'Trend':
                question.renderThisQuestion = true;
                break;
            default:
                question.renderThisQuestion = false;
                break;
        }
    }

    //--------------------Added by Varun---------------------------------//
    handleEdit() {
        this.isEditMode = true;
    }

    /*Called on change of any field in UI.
    Dependencies, Write In box, purging of data has been handled*/
    handleChange(event) {
        this.dispatchEvent(new CustomEvent('notifychange'));
        let tempObj = {};
        let currentValue = event.target.value;
        let apiName = event.target.dataset.api;

        if (this.questionAndAnswerRecords == null || this.questionAndAnswerRecords == undefined) {
            this.questionAndAnswerRecords = {};
        }

        if (event.target.dataset.valuetype == 'MultiPicklist') {
            let tempString = '';
            let multiValue = event.target.value;


            for (let i = 0; i <= multiValue.length - 1; i++) {
                tempString += multiValue[i] + ';';
            }
            tempString = tempString.slice(0, -1);
            this.questionAndAnswerRecords[event.target.dataset.api] = tempString;

        }
        else {
            this.questionAndAnswerRecords[event.target.dataset.api] = event.target.value;
        }
        // if (!this.hasSurest) {
        //     this.setHasSurest();
        // }
        this.setHasSurest();

        if (event.target.dataset.labelval == 'Write In') {
            this.questionAndAnswerRecords[event.target.dataset.writein] = event.target.value;

            if (event.target.dataset.writein == 'Medical_Top_Competitor_Write_In__c') {
                if (event.target.value != null && event.target.value != undefined && event.target.value != '') {
                    this.medTopCompwriteInValue = (event.target.value) ? ` - ${event.target.value}` : '';
                }
                else {
                    this.medTopCompwriteInValue = '';
                }
                //this.medTopCompwriteInValue = event.target.value;
            }
        }

        if (event.target.dataset.api == 'Medical_Top_Competitor__c' && event.target.value != null && event.target.value != undefined) {
            console.log('Inside Medical_Top_Competitor__c ' + event.target.value);
            this.medTopCompValue = event.target.value;
                if(this.medTopCompValue == 'Aetna'){
                    this.networkDiscountPositionNA = this.opportunityData.vs_Aetna__c?'vs '+this.medTopCompValue+' '+this.opportunityData.vs_Aetna__c+'%':'';
                } else if(this.medTopCompValue == 'Elevance / Anthem'){
                    this.networkDiscountPositionNA = this.opportunityData.vs_Anthem__c?'vs '+this.medTopCompValue+' '+this.opportunityData.vs_Anthem__c+'%':'';
                } else if(this.medTopCompValue == 'BCBS'){
                    this.networkDiscountPositionNA = this.opportunityData.vs_Blues__c?'vs '+this.medTopCompValue+' '+this.opportunityData.vs_Blues__c+'%':'';
                } else if(this.medTopCompValue == 'Cigna'){
                    this.networkDiscountPositionNA = this.opportunityData.vs_Cigna__c?'vs '+this.medTopCompValue+' '+this.opportunityData.vs_Cigna__c+'%':'';
                } else {
                    this.networkDiscountPositionNA = '';
                }
            if (event.target.value != 'Other') {
                this.medTopCompwriteInValue = '';
            }
        }

        console.log('medTopCompValue ' + this.medTopCompValue);
        console.log('medTopCompwriteInValue ' + this.medTopCompwriteInValue);

        let tempSectionNameArray = []; //used for displaying section names
        this.questionAndAnswerData.forEach((quest, index) => {

            let firstClass = this.template.querySelector(`[data-apiclass="${quest.Question__c}"]`);
            //2023 Question 12
            if (quest.Api__c == 'Competitive_Network_discounts_vs_winner__c' && firstClass != null && firstClass != undefined) {
                //console.log('Inside firstClass');
                let tempString = '';

                if (this.dispositionMedical == 'Sold' &&
                    (this.existingMembRiskOutcomeMed == 'Retained' || !this.existingMembRiskOutcomeMed ||
                        (this.existingMembRiskOutcomeMed == 'Partial Cancellation' && this.winnerPrimaryMedical == 'National Accounts')
                    )
                ) {
                    tempString = '';
                    tempString = `<b>Medical Top Competitor</b> - ${this.medTopCompValue}${this.medTopCompwriteInValue}<br/>`;
                }

                if (this.dispositionMedical == 'Lost: Finalist' || this.dispositionMedical == 'Lost: Non-Finalist' ||
                    (this.dispositionMedical == 'Sold' && this.existingMembRiskOutcomeMed == 'Partial Cancellation' && this.winnerPrimaryMedical != 'National Accounts')
                ) {
                    tempString = `<b>Winner Primary Medical</b> - ${this.winnerPrimaryMedical}<br/>`;
                }

                tempString += `<b>Primary Consultant </b> - ${this.primaryConsultant}<br/><b>Primary Consulting Firm </b> - ${this.primaryConsultingFirm}<br/>`;
                
                if (this.dispositionMedical == 'Sold' &&
                    (this.existingMembRiskOutcomeMed == 'Retained' || !this.existingMembRiskOutcomeMed ||
                        (this.existingMembRiskOutcomeMed == 'Partial Cancellation' && this.winnerPrimaryMedical == 'National Accounts')
                    )
                ) {
                    tempString += `<b>Network Discount Position</b>: ${this.networkDiscountPositionNA}`;
                }

                if (this.dispositionMedical == 'Lost: Finalist' || this.dispositionMedical == 'Lost: Non-Finalist' ||
                    (this.dispositionMedical == 'Sold' && this.existingMembRiskOutcomeMed == 'Partial Cancellation' && this.winnerPrimaryMedical != 'National Accounts')
                ) {
                    tempString += `<b>Network Discount Position</b>: ${this.networkDiscountPosition}`;
                }
                
                //console.log('tempString ' + tempString);
                setTimeout(() => {
                    firstClass.innerHTML = tempString;
                }, 150);
                //firstClass.innerHTML = tempString;
            }




            //2023 Question 22
            if (quest.Question__c == 'In the end, how competitive were we in each of the following areas based on the carrier listed above? Answer this question based on consultant or direct client perception.' && firstClass != null && firstClass != undefined) {
                let tempString = '';

                if (this.dispositionMedical == 'Sold' &&
                    (this.existingMembRiskOutcomeMed == 'Retained' || !this.existingMembRiskOutcomeMed ||
                        (this.existingMembRiskOutcomeMed == 'Partial Cancellation' && this.winnerPrimaryMedical == 'National Accounts')
                    )
                ) {
                    tempString = `<b>Medical Top Competitor</b> - ${this.medTopCompValue}${this.medTopCompwriteInValue}<br/>`;
                }


                if (this.dispositionMedical == 'Lost: Finalist' || this.dispositionMedical == 'Lost: Non-Finalist' ||
                    (this.dispositionMedical == 'Sold' && this.existingMembRiskOutcomeMed == 'Partial Cancellation' && this.winnerPrimaryMedical != 'National Accounts')
                ) {
                    tempString = `<b>Winner Primary Medical</b> - ${this.winnerPrimaryMedical}<br/>`;
                }


                setTimeout(() => {
                    firstClass.innerHTML = tempString;
                }, 150);
            }

            if ((quest.Write_In__c && event.target.dataset.writein) && quest.Write_In__c == event.target.dataset.writein) {
                quest.writeInValue = event.target.value;
            }

            //Conditional rendering - Write In box START
            if (quest.Api__c == event.target.dataset.api && quest.Type__c != 'Textbox') {
                if (currentValue == 'Other' || currentValue.includes('Other')) {
                    quest.showWriteIn = true;
                }
                else {
                    quest.showWriteIn = false; //Hide Textbox
                    quest.writeInValue = ''; //Purge Write In value in UI
                    this.questionAndAnswerRecords[quest.Write_In__c] = ''; //Clear Write In value in backend 
                }
            }
            //Conditional rendering - Write In box END

            let flag123 = false;
            if (quest.Write_In__c != null && quest.Write_In__c != undefined) {
                if (quest.writeInValue == undefined || quest.writeInValue == '') {
                    quest.charLength = 0;
                }
                else {
                    if (quest.Write_In__c == event.target.dataset.writein) {
                        quest.charLength = event.target.value.length;
                    }
                }
                flag123 = true;
            }
            else if (quest.Api__c == event.target.dataset.api && !flag123) {
                quest.charLength = event.target.value.length;
            }

            //Dependency Logic START
            let flag = false;
            if (quest.Is_Dependent_Question__c == true && quest.Api__c != event.target.dataset.api) {
                if (quest.Controlling_Question_1__c != null && quest.Controlling_Question_1__c != undefined) {
                    flag = true;

                    let cq1 = this.template.querySelector(`[data-api="${quest.Controlling_Question_1__r.Api__c}"]`);
                    let cq1Value;

                    if (cq1 != null) {
                        cq1Value = cq1.value;
                    }
                    else {
                        cq1Value = '';
                    }

                    if (cq1Value == quest.Controlling_Value_1__r.Value__c || (cq1Value?.includes && cq1Value.includes(quest.Controlling_Value_1__r.Value__c))) {
                        this.questionAndAnswerData[index].isDependency1 = true;
                    }
                    else {
                        this.questionAndAnswerData[index].isDependency1 = false;
                    }
                    //Case 3498
                    if (this.hasSurest && quest.Section_Name__c == 'Surest Questions') {
                        //---------------------Varun----------------------//
                        this.surestDependency(quest, index);
                        //-----------Changes by Varun----------------------//
                        // if (quest.Api__c == 'Surest_Interest__c') {
                        //     this.questionAndAnswerData[index].isDependency1 = true;
                        // }
                        if (quest.Api__c == 'Surest_Value_Proposition__c') {
                            this.questionAndAnswerData[index].isDependency1 = true;
                        }
                        if (quest.Api__c == 'Surest_Value_Unclear__c') {
                            this.questionAndAnswerData[index].isDependency1 = true;
                        }
                        if (quest.Api__c == 'Surest_Valued_by_Employer__c') {
                            this.questionAndAnswerData[index].isDependency1 = true;
                        }
                        if (quest.Api__c == 'Surest_Least_Valued__c') {
                            this.questionAndAnswerData[index].isDependency1 = true;
                        }
                    }
                    if (this.hasUMR) {
                        if (quest.Api__c == 'What_prompted_UMR_platform_proposal__c') {
                            this.questionAndAnswerData[index].isDependency1 = true;
                        }
                        if (quest.Api__c == 'Employer_likely_to_change_administrators__c') {
                            this.questionAndAnswerData[index].isDependency1 = true;
                        }
                        if (quest.Api__c == 'Competitors_propose_UMR_could_not_offer__c') {
                            this.questionAndAnswerData[index].isDependency1 = true;
                        }

                    }
                }


                if (quest.Controlling_Question_2__c != null && quest.Controlling_Question_2__c != undefined) {
                    flag = true;

                    let cq2 = this.template.querySelector(`[data-api="${quest.Controlling_Question_2__r.Api__c}"]`);
                    let cq2Value;

                    if (cq2 != null) {
                        cq2Value = cq2.value;
                    }
                    else {
                        cq2Value = '';
                    }
                    // not provided by consultant issue
                    if (cq2Value == quest.Controlling_Value_2__r.Value__c || (cq2Value?.includes && cq2Value.includes(quest.Controlling_Value_2__r.Value__c))) { //cq2Value.includes(quest.Controlling_Value_2__r.Value__c)){//
                        if(quest.Controlling_Question_2__r.Api__c == 'Less_Innovative_Capabilities__c'){
                            this.questionAndAnswerData[index].isDependency2 = false;
                        }else{
                        this.questionAndAnswerData[index].isDependency2 = true;
                        }
                    }
                    else {
                        this.questionAndAnswerData[index].isDependency2 = false;
                    }
                }

                if (flag) {
                    if (quest.Dependency_Logic__c != null || quest.Dependency_Logic__c != undefined) {
                        if (quest.Dependency_Logic__c.toUpperCase() == 'OR' && (this.questionAndAnswerData[index].isDependency1 || this.questionAndAnswerData[index].isDependency2)) {
                            this.questionAndAnswerData[index].renderThisQuestion = true;
                        }
                        else if (quest.Dependency_Logic__c.toUpperCase() == 'AND' && (this.questionAndAnswerData[index].isDependency1 && this.questionAndAnswerData[index].isDependency2)) {
                            this.questionAndAnswerData[index].renderThisQuestion = true;
                        }
                        else {
                            this.questionAndAnswerData[index].renderThisQuestion = false;
                            this.questionAndAnswerData[index].recordValue = ''; //Clearing values in UI
                            this.questionAndAnswerRecords[quest.Api__c] = ''; //Clearing values in backend list
                        }
                    }
                    else {
                        if (this.questionAndAnswerData[index].isDependency1) {
                            this.questionAndAnswerData[index].renderThisQuestion = true;
                            //-----------Changes by Varun----------------------//
                            if (this.hasSurest && quest.Section_Name__c == 'Surest Questions' && quest.Year__c > this.YEAR) {
                                this.displaySurestQuestions(quest, this.surestStrategy, this.surestStage, this.questionAndAnswerRecords);
                            }
                            //-----------Changes by Varun----------------------//
                        }
                        else {
                            this.questionAndAnswerData[index].renderThisQuestion = false;
                            this.questionAndAnswerData[index].recordValue = ''; //Clearing values in UI
                            this.questionAndAnswerRecords[quest.Api__c] = ''; //Clearing values in backend list
                            //------------------------------------Changes by Varun-----------------------------//
                            if (this.questionAndAnswerData[index].hasOwnProperty('writeInValue')) {
                                this.questionAndAnswerData[index].writeInValue = '';
                                this.questionAndAnswerRecords[quest.Write_In__c] = '';
                                this.questionAndAnswerData[index].showWriteIn = false;
                            }
                            //------------------------------------Changes by Varun-----------------------------//
                            //Clearing values of child component
                            if (quest.Api__c == 'Employer_likely_to_change_administrators__c') {
                                quest.childComponentMetadata.currentVal = '';
                            }
                        }
                    }
                }

                let flag2 = false;
                this.questionAndAnswerData.forEach((inner) => {
                    if (inner.displaySection && inner.Section_Name__c == this.questionAndAnswerData[index].Section_Name__c) {
                        flag2 = true;
                    }
                });

                //Displaying section name
                if (!flag2) {
                    if (this.questionAndAnswerData[index].Section_Name__c != null && this.questionAndAnswerData[index].Section_Name__c != undefined) {
                        if (this.questionAndAnswerData[index].renderThisQuestion && !tempSectionNameArray.includes(this.questionAndAnswerData[index].Section_Name__c)) {
                            this.questionAndAnswerData[index].displaySection = true;
                            tempSectionNameArray.push(this.questionAndAnswerData[index].Section_Name__c);
                        }
                        else {
                            quest.displaySection = false;
                        }
                    }
                }


                if (quest.Section_Name__c === 'Advocacy Solutions' && this.questionAndAnswerData[index].isDependency1) {
                   // quest.renderThisQuestion = checkForAdvocacySolutionsAgainstUMR(quest, this.opportunityData, this.questionAndAnswerRecords);
                   quest.renderThisQuestion = true;
                }

            }

            // #3546 changes added by Varun
            //this.surestInfo(quest, index);
            let surestValuePropIndex = this.questionAndAnswerData.findIndex(item => item.hasOwnProperty('Api__c') && item.Api__c === 'Surest_Value_Proposition__c');
            if (
                ((
                    apiName === 'Surest_Value_Proposition__c' &&
                    currentValue === 'Not provided by consultant'
                ) ||
                    (
                        this.questionAndAnswerRecords?.hasOwnProperty('Surest_Value_Proposition__c') &&
                        this.questionAndAnswerRecords.Surest_Value_Proposition__c === 'Not provided by consultant'
                    ))
                && quest.Api__c == 'Surest_Value_Unclear__c'
            ) {
                this.questionAndAnswerData[index].renderThisQuestion = false;
                this.questionAndAnswerData[index].recordValue = '';
                this.questionAndAnswerRecords[quest.Api__c] = '';
            }
            // #3546 changes added by  Varun END

            /*
            1. Get ID of the question which is being edited
            2. Loop all the questions and check if edited question is controlling question for any of the looped question
            3. If yes, take that question and check whether its controlling questions and its coressponding values are matching
            */
            //Dependency Logic END
        });
    }

    /*Data returned from the child component 
    (Feedback table and Radio table)*/
    dataFromChildComponent(event) {
        this.questionAndAnswerRecords[event.detail.fieldApiName] = event.detail.fieldValue;
    }

    /*Called on click of Save button. Sends the data back to apex 
    for insertion or updation of records*/
    @api
    handleSave() {
        this.isLoad = true;
        this.isEditMode = false;

        Object.keys(this.alteredDataToMeetSomeCriteria).forEach(alteredData => {
            this.questionAndAnswerRecords[alteredData] = this.alteredDataToMeetSomeCriteria[alteredData];
        });

        Object.keys(this.questionAndAnswerRecords).forEach(fieldApi => {
            if (this.dataFromApex.nonUpdateableFields && this.dataFromApex.nonUpdateableFields.includes(fieldApi) && !['Id'].includes(fieldApi)) {
                delete this.questionAndAnswerRecords[fieldApi];
            }
        });

        saveSalesDebriefData({ dataToSave: this.questionAndAnswerRecords, oppRecordId: this.recordId, salesSeason: this.effectiveDateYear, salesDebriefType: this.salesDebriefType })
            .then((result) => {
                this.questionAndAnswerRecords = null;
                this.getSalesDebriefRecords();

                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Your changes have been saved successfully',
                    variant: 'success'
                });
                this.dispatchEvent(event);
                this.dispatchEvent(new CustomEvent('notifysave'));
            })
            .catch((error) => {
                console.log('error ' + JSON.stringify(error));

                const event = new ShowToastEvent({
                    title: 'Error',
                    message: 'Error while saving changes',
                    variant: 'error'
                });
                this.dispatchEvent(event);

                this.getSalesDebriefRecords();

                this.isLoad = false;
            });
    }

    handleCancel() {
        this.getSalesDebriefRecords();
        this.isEditMode = false;
    }

    /*Called on click of Print button. 
    Print data is saved in Print_Data__c field in Sales_Debrief__c object. 
    Further the data will be passed to VF where it will be deserialized*/
    exportRecords() {
        this.isLoad = true;
        if (this.salesDebriefRecordId === null || this.salesDebriefRecordId === undefined || this.salesDebriefRecordId === '') {
            const event = new ShowToastEvent({
                title: 'Error',
                message: 'No Data to Print',
                variant: 'error'
            });
            this.dispatchEvent(event);
            this.isLoad = false;
        }
        else {
            let tempList = [];

            this.printDataList.forEach((data) => {
                if (data.rendered) {
                    tempList.push(data);
                }
            });

            getSalesDebriefPdf({ oppRecordId: this.recordId, printData: JSON.stringify(tempList), sdRecordId: this.salesDebriefRecordId })
                .then(response => {
                    printDocument({ oppRecordId: this.recordId })
                        .then((result) => {
                            var strFile = "data:application/pdf;base64," + result;
                            var a = document.createElement("a");
                            a.href = strFile;
                            a.download = "Sales Debrief.pdf";
                            a.click();

                            const event = new ShowToastEvent({
                                title: 'Success',
                                message: 'PDF has been downloaded successfully',
                                variant: 'success'
                            });
                            this.dispatchEvent(event);

                            this.isLoad = false;
                        })
                        .catch((error) => {
                            console.log('Print error ' + JSON.stringify(error));

                            const event = new ShowToastEvent({
                                title: 'Error',
                                message: 'Error while downloading PDF',
                                variant: 'error'
                            });
                            this.dispatchEvent(event);

                            this.getSalesDebriefRecords();

                            this.isLoad = false;
                        });
                })
                .catch((error) => {
                    console.log('Print error ' + JSON.stringify(error));

                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: 'Error while downloading PDF',
                        variant: 'error'
                    });
                    this.dispatchEvent(event);

                    this.getSalesDebriefRecords();

                    this.isLoad = false;
                });
        }

    }

    handleRefreshButton() {
        this.getSalesDebriefRecords();

        this.isLoad = true;
        setTimeout(() => {
            this.isLoad = false;
            /* const event = new ShowToastEvent({
                title: 'Success',
                message: 'Page has been refreshed',
                variant: 'success'
            });
            this.dispatchEvent(event); */
        }, 3000);
    }

    renderedCallback() {
        if (!this.isLoad) {
            console.log('Inside rendered callback');
            let medTopComp = '';
            this.medTopCompwriteInValue = (this.medTopCompwriteInValue) ? `${this.medTopCompwriteInValue}` : '';
            //console.log('Parent RCB');
            if (this.questionAndAnswerData != null && this.questionAndAnswerData != undefined) {
                this.questionAndAnswerData.forEach((quest, index) => {

                    let firstClass = this.template.querySelector(`[data-apiclass="${quest.Question__c}"]`);
                    let secondClass = this.template.querySelector(`[data-alternateapiclass="${quest.Question__c}"]`);

                    if (quest.Api__c == 'Medical_Top_Competitor__c' && quest.renderThisQuestion == true) {
                        if (quest.recordValue != null && quest.recordValue != undefined) {
                            if (quest.recordValue == 'Other') {
                                medTopComp = `${quest.recordValue}${this.medTopCompwriteInValue}`;
                            }
                            else {
                                medTopComp = quest.recordValue;
                                if (quest.recordValue != 'Varied, Best in Market selection based on consultant analysis'){
                                    if(quest.recordValue == 'Aetna'){
                                        this.networkDiscountPositionNA = this.opportunityData.vs_Aetna__c?'vs '+medTopComp+' '+this.opportunityData.vs_Aetna__c+'%':'';
                                    } else if(quest.recordValue == 'Elevance / Anthem'){
                                        this.networkDiscountPositionNA = this.opportunityData.vs_Anthem__c?'vs '+medTopComp+' '+this.opportunityData.vs_Anthem__c+'%':'';
                                    } else if(quest.recordValue == 'BCBS'){
                                        this.networkDiscountPositionNA = this.opportunityData.vs_Blues__c?'vs '+medTopComp+' '+this.opportunityData.vs_Blues__c+'%':'';
                                    } else if(quest.recordValue == 'Cigna'){
                                        this.networkDiscountPositionNA = this.opportunityData.vs_Cigna__c?'vs '+medTopComp+' '+this.opportunityData.vs_Cigna__c+'%':'';
                                    } else {
                                        this.networkDiscountPositionNA = '';
                                    }
                                }
                            }
                        }
                        else {
                            medTopComp = '';
                        }
                    }

                    // surestOnlyQuestionnaire condition added by varun to hide platform quoted for surest only questionniare.
                    if (!this.surestOnlyQuestionnaire) {
                        if ((firstClass || secondClass) && quest.Api__c == 'Final_Platform__c') {
                            let tempString = '';
                            tempString += `<b>Platforms Quoted </b> - ${this.platformsQuoted}<br/>Note: If other platforms were quoted in this deal, beyond what’s listed above, please update the “Platforms Quoted” field on the General Info tab of this Membership Activity.`;
                            (firstClass) ? firstClass.innerHTML = tempString : '';
                            (secondClass) ? secondClass.innerHTML = tempString : '';

                            if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                this.printDataList[index].otherContent = tempString;
                            }

                            return;
                        }
                    }

                    if (firstClass != null && firstClass != undefined) {
                        firstClass.innerHTML = '';

                        if (quest.Section_Name__c == 'Medical Outcome' && quest.displaySection) {
                            let tempString = '';
                            tempString += `<b>Disposition (Medical)</b> - ${this.dispositionMedical}<br/><b>Closed Reason #1 (Medical)</b> - ${this.closedReason1Medical}`;
                            /* setTimeout(() => {
                                 firstClass.innerHTML = tempString;
                             }, 1);*/
                            firstClass.innerHTML = tempString;
                            if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                this.printDataList[index].otherContent = tempString;
                            }
                        }

                        //----------Changes by Varun-------------------//
                        if (quest.Section_Name__c == 'Surest Questions' && this.hasSurest) {
                            this.surestInfo(quest, index);
                        }
                        //----------Changes by Varun-------------------//

                        //Displaying Supplemental Health Feedback products(if any present)
                        if (quest.Section_Name__c == 'Supplemental Health Feedback' && quest.displaySection == true && quest.renderThisQuestion == true) {
                            if (this.supplementalHealthProd != null && this.supplementalHealthProd != undefined) {
                                let tempString = '';
                                this.supplementalHealthProd.sort(function (a, b) {
                                    return a.prodDisplayOrder - b.prodDisplayOrder;
                                });

                                this.supplementalHealthProd.forEach((shp) => {
                                    tempString += `${shp.prodName}. <b>Disposition</b> - ${shp.prodDisp}<br/>`;
                                });

                                //tempString = tempString.slice(0, tempString.lastIndexOf('<br/>'));
                                tempString += `<br/>Questions displayed below are based on the disposition outcomes listed above. If you have multiple products in this section with mixed outcomes (some were sold while other were lost), you will see questions specific to both sold and lost products below. Please keep product disposition in mind as you answer these questions.`
                                firstClass.innerHTML = tempString;
                                if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                    && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                    this.printDataList[index].otherContent = tempString;
                                }
                            }
                        }

                        //Displaying Life & Disability Feedback products(if any present)
                        if (quest.Section_Name__c == 'Life & Disability Feedback' && quest.displaySection == true && quest.renderThisQuestion == true) {
                            if (this.lifeAndDisabilityProd != null && this.lifeAndDisabilityProd != undefined) {
                                let tempString = '';
                                this.lifeAndDisabilityProd.sort(function (a, b) {
                                    return a.prodDisplayOrder - b.prodDisplayOrder;
                                });

                                this.lifeAndDisabilityProd.forEach((shp) => {
                                    tempString += `${shp.prodName}. <b>Disposition</b> - ${shp.prodDisp}<br/>`;
                                });

                                //tempString = tempString.slice(0, tempString.lastIndexOf('<br/>'));
                                tempString += `<br/>Questions displayed below are based on the disposition outcomes listed above. If you have multiple products in this section with mixed outcomes (some were sold while other were lost), you will see questions specific to both sold and lost products below. Please keep product disposition in mind as you answer these questions.`
                                firstClass.innerHTML = tempString;
                                if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                    && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                    this.printDataList[index].otherContent = tempString;
                                }
                            }
                        }

                        /* console.log('Supp Health after sorting ' + JSON.stringify(this.supplementalHealthProd));
                        console.log('Life Disability after sorting ' + JSON.stringify(this.lifeAndDisabilityProd)); */

                        //2023 Question 12
                        if (quest.Api__c == 'Competitive_Network_discounts_vs_winner__c') {
                            let tempString = '';
                            if (this.winnerPrimaryMedical == 'National Accounts') {
                                if ((this.oppRecType == 'CD' && this.dispositionMedical == 'Sold') ||
                                    (this.oppRecType == 'CM' && this.dispositionMedical == 'Sold' &&
                                        (
                                            !this.existingMembRiskOutcomeMed || this.existingMembRiskOutcomeMed == 'Retained' || this.existingMembRiskOutcomeMed == 'Partial Cancellation'
                                        )
                                    )) {
                                    tempString = `<b>Medical Top Competitor</b> - ${medTopComp}<br/>`;
                                }
                            }
                            else if (this.winnerPrimaryMedical != 'National Accounts') {
                                if ((this.oppRecType == 'CD' && (this.dispositionMedical == 'Lost: Finalist' || this.dispositionMedical == 'Lost: Non-Finalist' || this.dispositionMedical == 'Sold')) ||
                                    (this.oppRecType == 'CM' && (this.dispositionMedical == 'Lost: Finalist' || this.dispositionMedical == 'Lost: Non-Finalist' || (this.dispositionMedical == 'Sold' && this.existingMembRiskOutcomeMed == 'Partial Cancellation')))) {
                                    tempString = `<b>Winner Primary Medical</b> - ${this.winnerPrimaryMedical}<br/>`;
                                }
                            }

                            tempString += `<b>Primary Consultant </b> - ${this.primaryConsultant}<br/><b>Primary Consulting Firm </b> - ${this.primaryConsultingFirm}<br/>`;
                            
                            if (this.winnerPrimaryMedical == 'National Accounts') {
                                if ((this.oppRecType == 'CD' && this.dispositionMedical == 'Sold') ||
                                    (this.oppRecType == 'CM' && this.dispositionMedical == 'Sold' &&
                                        (
                                            !this.existingMembRiskOutcomeMed || this.existingMembRiskOutcomeMed == 'Retained' || this.existingMembRiskOutcomeMed == 'Partial Cancellation'
                                        )
                                    )) {
                                    tempString += `<b>Network Discount Position</b>: ${this.networkDiscountPositionNA}`;
                                }
                            }
                            else if (this.winnerPrimaryMedical != 'National Accounts') {
                                if ((this.oppRecType == 'CD' && (this.dispositionMedical == 'Lost: Finalist' || this.dispositionMedical == 'Lost: Non-Finalist' || this.dispositionMedical == 'Sold')) ||
                                    (this.oppRecType == 'CM' && (this.dispositionMedical == 'Lost: Finalist' || this.dispositionMedical == 'Lost: Non-Finalist' || (this.dispositionMedical == 'Sold' && this.existingMembRiskOutcomeMed == 'Partial Cancellation')))) {
                                    tempString += `<b>Network Discount Position</b>: ${this.networkDiscountPosition}`;
                                }
                            }

                            firstClass.innerHTML = tempString;

                            if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                this.printDataList[index].otherContent = tempString;
                            }
                        }

                        //2023 Question 22
                        if (quest.Question__c == 'In the end, how competitive were we in each of the following areas based on the carrier listed above? Answer this question based on consultant or direct client perception.' && quest.renderThisQuestion == true) {
                            let tempString = '';

                            if (this.dispositionMedical == 'Sold' &&
                                (this.existingMembRiskOutcomeMed == 'Retained' || !this.existingMembRiskOutcomeMed ||
                                    (this.existingMembRiskOutcomeMed == 'Partial Cancellation' && this.winnerPrimaryMedical == 'National Accounts')
                                )
                            ) {
                                tempString = `<b>Medical Top Competitor</b> - ${this.medTopCompValue}${this.medTopCompwriteInValue}<br/>`;
                            }


                            if (this.dispositionMedical == 'Lost: Finalist' || this.dispositionMedical == 'Lost: Non-Finalist' ||
                                (this.dispositionMedical == 'Sold' && this.existingMembRiskOutcomeMed == 'Partial Cancellation' && this.winnerPrimaryMedical != 'National Accounts')
                            ) {
                                tempString = `<b>Winner Primary Medical</b> - ${this.winnerPrimaryMedical}<br/>`;
                            }

                            firstClass.innerHTML = tempString;

                            if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                this.printDataList[index].otherContent = tempString;
                            }
                        }

                        //2023 Question 29
                        if (quest.Api__c == 'Consultant_Influence__c') {
                            let tempString = '';

                            tempString = `<b>Primary Consultant </b> - ${this.primaryConsultant}<br/><b>Primary Consulting Firm </b> - ${this.primaryConsultingFirm}`;

                            firstClass.innerHTML = tempString;
                            if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                this.printDataList[index].otherContent = tempString;
                            }
                        }

                        //Pharmacy Feedback Section
                        //if (!this.isPharmacyOpportunityPresent) 
                        if (quest.Section_Name__c == 'Pharmacy Feedback' && quest.displaySection) {
                            // console.log('Inside pharmacy feedback');
                            // console.log( this.productTypeInvolved );
                            if (this.productTypeInvolved.includes('Pharmacy') &&
                                (this.dispositionPharmacy == 'Sold' || this.dispositionPharmacy == 'Lost: Finalist' || this.dispositionPharmacy == 'Lost: Non-Finalist')) {
                                let tempString = '';
                                console.log('Inside disposition if')

                                if (this.dispositionPharmacy == 'Sold' && (
                                    this.existingMembRiskOutcomePharm == 'Retained' || !this.existingMembRiskOutcomePharm ||
                                    (this.existingMembRiskOutcomePharm == 'Partial Cancellation' && this.winnerPrimaryPharmacy == 'National Accounts')
                                )
                                ) {
                                    tempString += `<b>Disposition (Pharmacy)</b> - ${this.dispositionPharmacy}<br/>`;
                                    tempString += `<b>Closed Reason #1 (Pharmacy)</b> - ${this.closedReason1Pharmacy}`;
                                }

                                if (this.dispositionPharmacy == 'Lost: Finalist' || this.dispositionPharmacy == 'Lost: Non-Finalist' || (
                                    this.dispositionPharmacy == 'Sold' && this.existingMembRiskOutcomePharm == 'Partial Cancellation' && this.winnerPrimaryPharmacy != 'National Accounts'
                                )
                                ) {

                                    tempString += `<b>Disposition (Pharmacy)</b> - ${this.dispositionPharmacy}<br/>`;
                                    tempString += `<b>Winner Primary (Pharmacy)</b> - ${this.winnerPrimaryPharmacy}<br/><b>Closed Reason #1 (Pharmacy)</b> - ${this.closedReason1Pharmacy}`;
                                }


                                firstClass.innerHTML = tempString;


                                if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                    && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                    this.printDataList[index].otherContent = tempString;
                                }
                            }
                        }

                        //Vision Feedback Section
                        if (quest.Section_Name__c == 'Vision Feedback' && quest.displaySection) {
                            let tempString = `<b>Disposition (Vision)</b> - ${this.dispositionVision}<br/>`;

                            if (this.dispositionVision == 'Sold' &&
                                (
                                    !this.existingMembRiskOutcomeVis || this.existingMembRiskOutcomeVis == 'Retained' ||
                                    (this.existingMembRiskOutcomeVis == 'Partial Cancellation' && this.winnerPrimaryVision == 'National Accounts')
                                )
                            ) {
                                tempString += `<b>Closed Reason #1 (Vision)</b> - ${this.closedReason1Vision}`;
                            }

                            if (this.dispositionVision == 'Lost: Finalist' || this.dispositionVision == 'Lost: Non-Finalist' || (this.dispositionVision == 'Sold' && this.existingMembRiskOutcomeVis == 'Partial Cancellation' && this.winnerPrimaryVision != 'National Accounts')) {
                                tempString += `<b>Winner Primary (Vision)</b> - ${this.winnerPrimaryVision}<br/> \
                                                <b>Closed Reason #1 (Vision)</b> - ${this.closedReason1Vision}`;
                            }


                            firstClass.innerHTML = tempString;
                            if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                this.printDataList[index].otherContent = tempString;
                            }
                        }

                        //Dental Feedback Section
                        if (quest.Section_Name__c == 'Dental Feedback' && quest.displaySection) {
                            let tempString = `<b>Disposition (Dental)</b> - ${this.dispositionDental}<br/>`;


                            if (this.dispositionDental == 'Sold' &&
                                (
                                    this.existingMembRiskOutcomeDen == 'Retained' || !this.existingMembRiskOutcomeDen ||
                                    (this.existingMembRiskOutcomeDen == 'Partial Cancellation' && this.winnerPrimaryDental == 'National Accounts')
                                )
                            ) {
                                tempString += `<b>Closed Reason #1 (Dental)</b> - ${this.closedReason1Dental}`;
                            }

                            if (this.dispositionDental == 'Lost: Finalist' || this.dispositionDental == 'Lost: Non-Finalist' || (this.dispositionDental == 'Sold' && this.existingMembRiskOutcomeDen == 'Partial Cancellation' && this.winnerPrimaryDental != 'National Accounts')
                            ) {
                                tempString += `<b>Winner Primary (Dental)</b> - ${this.winnerPrimaryDental}<br/>\
                                                <b>Closed Reason #1 (Dental)</b> - ${this.closedReason1Dental}`;
                            }


                            firstClass.innerHTML = tempString;
                            if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                this.printDataList[index].otherContent = tempString;
                            }
                        }

                        // Displaying a note top of the last question
                        if (quest.Api__c === 'Debrief_Complete_Incomplete__c' && quest.renderThisQuestion) {
                            let tempString = `Please note that the Sales Debrief will not be considered complete until answer “Complete” in the final question below.`;
                            firstClass.innerHTML = tempString;

                            if (this.printDataList.length > 0 && this.printDataList.length != null && this.printDataList.length != undefined
                                && this.printDataList[index] != null && this.printDataList[index] != undefined) {
                                this.printDataList[index].otherContent = tempString;
                            }
                        }

                    }
                });
            }

        }
    }
}