/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 11-08-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, api, track, wire } from 'lwc';
import {
    getObjectInfo
} from 'lightning/uiObjectInfoApi';
import {
    getPicklistValues
} from 'lightning/uiObjectInfoApi';
//import registerListener from 'c/pubsub';
import Oppobjct from '@salesforce/schema/Opportunity';
import Accobjct from '@salesforce/schema/Account';
import PSS from '@salesforce/schema/Account.Primary_Situs_State__c';
import trustinvolved from '@salesforce/schema/Opportunity.Trust_Involved__c';
import claimstate from '@salesforce/schema/Account.Claim_Site__c';
import callsite from '@salesforce/schema/Account.Call_Site__c';
import clinicalsite from '@salesforce/schema/Account.Clinical_Site__c';
import apexSearch from '@salesforce/apex/SoldChecklistHandler.metadatasearch';
import userSearch from '@salesforce/apex/SoldChecklistHandler.accsearch';
import incumbentSearch from '@salesforce/apex/SoldChecklistHandler.incumbentSearch';
import callSiteType from '@salesforce/schema/Account.Call_Site_Type__c';
import claimSiteType from '@salesforce/schema/Account.Claim_Site_Type__c';
import clinicalSiteType from '@salesforce/schema/Account.Clinical_Site_Type__c';

//-----------------------------SAMARTH-----------------------------
import SccObject from '@salesforce/schema/Sold_Case_Checklist__c'; //SAMARTH
import fundingTypeDental from '@salesforce/schema/Opportunity.Funding_Type_Dental__c';
import fundingTypeVision from '@salesforce/schema/Opportunity.Funding_Type_Vision__c';
import clientPlatform from '@salesforce/schema/Account.UMR_Client_Platform__c';
import typeOfFundingMedicalScc from '@salesforce/schema/Sold_Case_Checklist__c.Type_of_Funding_Medical__c';
import trustinvolvedScc from '@salesforce/schema/Sold_Case_Checklist__c.Trust_Involved__c';
//-----------------------------SAMARTH-----------------------------

import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';



export default class SoldCheckClientDetailComp extends LightningElement {
    //@api checkdetail;
    @api editmode;
    @api soldCaseCheckListInstructions;
    @api opportunityFieldLabels;
    @api accountFieldLabels;
    @api companyAddress;
    @api userTimeZone;
    @track Clientdatarecord = {};
    @track psspicklistvalue;
    @track trustinvolved;
    @track accountdata;
    @track claimstatevalue;
    @track callsitevalue;
    @track clinicalsitevalue;
    @api cmType;
    @track claimStateValuesArray;

    @track medicalUnderWriterData;
    @track sceName;
    @track ipmName;

    @track ownerHelpText;
    @track incumbentPrimaryMedicalHelpText;
    @track companyNameHelpText;
    @track hqAddressHelpText;
    @track effectiveDateHelpText;
    @track soldRetainMembersHelpText;
    @track firstRenewalHelpText;
    @track nextRenewalHelpText;

    @track recordDetail;

    @track oldIpmDateTime;
    @track oldSalesDateTime;
    @track fieldsLabels;
    @track accountFields;
    @track claimSiteValues;
    @track clinicalSiteValues;
    @track callSiteValues = null;
    @track claimSiteTypeValues;
    @track clinicalSiteTypeValues;
    @track callSiteTypeValues;

    @track activeSections = [
        "Call/Clinical/Claim Site - Traditional",
        "Call/Clinical/Claim Site",
        "Top Market Information"
    ];
    @track sectionLabel = 'Call/Clinical/Claim Site';

    //---------------------SAMARTH---------------------
    //@api soldCaseObjectData;
    @api completeDataFromParent;
    @track soldCaseDataCopy;

    @track fundingTypeDentalValues;
    @track fundingTypeVisionValues;
    @track clientPlatformValues;

    @api meddispValue;
    @api dentdispValue;
    @api otherProductsStatus;
    @api pharmdispValue;
    @api visiondispValue;

    @api medSoldOrTbd;
    @api dentSoldOrTbd;
    @api visSoldOrTbd;
    @api pharmSoldOrTbd;
    @api otherSoldOrTbd;

    @api medSold;
    @api dentSold;
    @api visSold;
    @api pharmSold;
    @api otherSold;
    @api isTraditionalProduct;
    @api isSurestProduct;

    @track incumbentMed;
    @track incumbentPharm;
    @track incumbentDent;
    @track incumbentVis;

    @api showSpecialtyProd = false;
    @api showFinAccProd = false;
    @api showBehavioralProd = false;
    @api showCriticalIllnessOrAccidentProd = false;

    @api typeOfFundingMedicalSccValues;
    @api trustInvolvedSccValues;
    @track UMR_Client_Platform__c;
    @track Funding_Type_Dental__c;
    @track Funding_Type_Vision__c;

    //--------------------------------SAMARTH SCC NB UPGRADE 2023--------------------------------
    @api firstRenewalDate;

    @api primaryHrHelpText;
    @api actualCloseDateMedicalHelpText;
    @api soldMembersHelpText;
    @api soldEmployeesHelpText;
    @api cvgAssociationHelpText;
    @api sbSvpHelpText;
    @api optumFinancialSvpHelpText;
    @api optSolSalesExecHelpText;
    @api incPrimaryPharmaHelpText;
    @api incPrimaryDentalHelpText;
    @api incPrimaryVisionHelpText;

    @api topMarketHelpText; 
    //---------------------SAMARTH---------------------

    connectedCallback() {

        // var p1 = this.template.querySelector('.border-bottom');
        // if(p1)
        // if(this.editmode){
        //     p1.style ='min-height: 49px;max-height: 49px;'
        // }else{
        //     p1.style ='min-height:auto';
        // }
        for (let i in this.soldCaseCheckListInstructions) {
            if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'Owner') {
                this.ownerHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            } else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'Incumbent_Primary_Medical__c') {
                this.incumbentPrimaryMedicalHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            } else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'Account.Name') {
                this.companyNameHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            } else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'Account.BillingCountry') {
                this.hqAddressHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            } else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'EffectiveDate__c') {
                this.effectiveDateHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            } else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'Sold_Retained_Members__c') {
                this.soldRetainMembersHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            } else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'Account.Current_Deal_Next_Renewal_Date__c') {
                this.firstRenewalHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'Account.Current_Deal_Next_Renewal_Date__c2') {
                this.nextRenewalHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }

            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.Primary_HR_Implementation_Contact__c') {
                this.primaryHrHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.Anticipated_Actual_Close_Date_Medical__c') {
                this.actualCloseDateMedicalHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.Sold_Retained_Members__c') {
                this.soldMembersHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.Sold_Retained_Employees_Only__c') {
                this.soldEmployeesHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'ACC.CVGAccount__c') {
                this.cvgAssociationHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'OPP.Specialty_Benefits_SVP__c') {
                this.sbSvpHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.Optum_Financial_SVP__c') {
                this.optumFinancialSvpHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.Optum_Solution_Sales_Exec__c') {
                this.optSolSalesExecHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'OPP.Incumbent_Primary_Pharmacy__c') {
                this.incPrimaryPharmaHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'OPP.Incumbent_Primary_Dental__c') {
                this.incPrimaryDentalHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'OPP.Incumbent_Primary_Vision__c') {
                this.incPrimaryVisionHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }

            else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'Top_Market_Help_Text') {
                this.topMarketHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
        }
        console.log(typeof(this.cmType));
        //---------------------SAMARTH SCC 2021---------------------
        //--------------------SOLD OR TBD--------------------
        if (this.meddispValue == 'Sold' || this.meddispValue == 'TBD') {
            this.medSoldOrTbd = true;
        }
        else {
            this.medSoldOrTbd = false;
        }

        if (this.dentdispValue == 'Sold' || this.dentdispValue == 'TBD') {
            this.dentSoldOrTbd = true;
        }
        else {
            this.dentSoldOrTbd = false;
        }

        if (this.visiondispValue == 'Sold' || this.visiondispValue == 'TBD') {
            this.visSoldOrTbd = true;
        }
        else {
            this.visSoldOrTbd = false;
        }

        if (this.pharmdispValue == 'Sold' || this.pharmdispValue == 'TBD') {
            this.pharmSoldOrTbd = true;
        }
        else {
            this.pharmSoldOrTbd = false;
        }

        if (this.otherProductsStatus == 'Sold' || this.otherProductsStatus == 'TBD') {
            this.otherSoldOrTbd = true;
        }
        else {
            this.otherSoldOrTbd = false;
        }
        //--------------------SOLD OR TBD--------------------


        //--------------------SOLD--------------------
        if (this.meddispValue == 'Sold') {
            this.medSold = true;
        }
        else {
            this.medSold = false;
        }

        if (this.dentdispValue == 'Sold') {
            this.dentSold = true;
        }
        else {
            this.dentSold = false;
        }

        if (this.visiondispValue == 'Sold') {
            this.visSold = true;
        }
        else {
            this.visSold = false;
        }

        if (this.pharmdispValue == 'Sold') {
            this.pharmSold = true;
        }
        else {
            this.pharmSold = false;
        }

        if (this.otherProductsStatus == 'Sold') {
            this.otherSold = true;
        }
        else {
            this.otherSold = false;
        }

        if (this.isSurestProduct){
            this.sectionLabel = 'Call/Clinical/Claim Site - Traditional';
        }
        //--------------------SOLD--------------------
        //---------------------SAMARTH SCC 2021---------------------

        //console.log('completeDataFromParent.otheropplineitems '+JSON.stringify(this.completeDataFromParent.data.otheropplineitems));
        let otherProductsDetails = this.completeDataFromParent.data.otheropplineitems;

        if (otherProductsDetails != null || otherProductsDetails != undefined) {
            //console.log('Inside main if');
            for (let i in otherProductsDetails) {
                //console.log('Inside for');
                if (otherProductsDetails[i].Disposition_Other_Buy_Up_Programs__c == 'Sold') {
                    if (otherProductsDetails[i].Product2.Family == 'Financial Accounts') {
                        this.showFinAccProd = true;
                    }

                    if (otherProductsDetails[i].Product2.Family == 'Behavioral Health') {
                        this.showBehavioralProd = true;
                    }

                    if (otherProductsDetails[i].Product2.Family == 'Specialty Products') {
                        this.showSpecialtyProd = true;
                    }

                    if (otherProductsDetails[i].Product2.Name.includes('Critical Illness') ||
                        otherProductsDetails[i].Product2.Name.includes('Accident')) {
                        this.showCriticalIllnessOrAccidentProd = true;
                    }
                }
            }
        }
    }

    //---------------------SAMARTH---------------------
    @api
    get soldCaseObjectData() {
        return soldCaseObjectData;
    }
    set soldCaseObjectData(value) {
        this.soldCaseDataCopy = Object.assign({}, value);
        //console.log('soldCaseDataCopy ' + JSON.stringify(this.soldCaseDataCopy));
    }
    //---------------------SAMARTH---------------------


    get isDataReceived() {
        if (this.recordDetail !== undefined && this.accountFieldLabels !== undefined && this.opportunityFieldLabels !== undefined) {
            return true;
        }
        return false;
    }

    @api
    get checkdetail() {
        return this.masterData;
    }
    set checkdetail(value) {
        this.masterData = Object.assign({}, value);
        this.recordDetail = Object.assign({}, value);
        //console.log('recordDetail ' + JSON.stringify(this.recordDetail.Sold_Case_Checklist__r));
        if (this.recordDetail.Account !== null && this.recordDetail.Account !== undefined) {
            if (this.recordDetail.Account.Claim_Site__c !== null && this.recordDetail.Account.Claim_Site__c !== undefined) {
                this.claimSiteValues = this.recordDetail.Account.Claim_Site__c.replace(/;/g, "; ");
            }
            if (this.recordDetail.Account.Call_Site__c !== null && this.recordDetail.Account.Call_Site__c !== undefined) {
                this.callSiteValues = this.recordDetail.Account.Call_Site__c.replace(/;/g, "; ");
            }
            if (this.recordDetail.Account.Clinical_Site__c !== null && this.recordDetail.Account.Clinical_Site__c !== undefined) {
                this.clinicalSiteValues = this.recordDetail.Account.Clinical_Site__c.replace(/;/g, "; ");
            }
            //Added by veera
            if (this.recordDetail.Account.UMR_Client_Platform__c !== null && this.recordDetail.Account.UMR_Client_Platform__c !== undefined) {
                this.UMR_Client_Platform__c = this.recordDetail.Account.UMR_Client_Platform__c.replace(/;/g, "; ");
            }

            if (this.recordDetail.Funding_Type_Vision__c !== null && this.recordDetail.Funding_Type_Vision__c !== undefined) {
                this.Funding_Type_Vision__c = this.recordDetail.Funding_Type_Vision__c.replace(/;/g, "; ");
            }

            if (this.recordDetail.Funding_Type_Dental__c !== null && this.recordDetail.Funding_Type_Dental__c !== undefined) {
                this.Funding_Type_Dental__c = this.recordDetail.Funding_Type_Dental__c.replace(/;/g, "; ");
            }

        }
    }

    /* get getIpmData() {
        if (this.recordDetail.IPM__r !== undefined && this.recordDetail.IPM__r !== null) {
            this.ipmName = [{ 'id': this.recordDetail.IPM__c, "title": this.recordDetail.IPM__r.Name, "icon": "standard:user" }];
            return true;
        } else {
            this.ipmName = [{ 'id': '', "title": '', "icon": "standard:user" }];
        }
        return false;
    } */

    get getIpmData() {
        if (this.soldCaseDataCopy.IPM__r !== undefined && this.soldCaseDataCopy.IPM__r !== null) {
            this.ipmName = [{ 'id': this.soldCaseDataCopy.IPM__c, "title": this.soldCaseDataCopy.IPM__r.Name, "icon": "standard:user" }];
            return true;
        } else {
            this.ipmName = [{ 'id': '', "title": '', "icon": "standard:user" }];
        }
        return false;
    }

    get isFirstRenewalDatePresent() {
        let firstRenewalDateFlag = false;
        if (this.soldCaseDataCopy.First_Renewal_Date__c != null && this.soldCaseDataCopy.First_Renewal_Date__c != undefined) {
            this.firstRenewalDate = this.soldCaseDataCopy.First_Renewal_Date__c;
            firstRenewalDateFlag = true;
            return true;
        }
        else if (!firstRenewalDateFlag && this.recordDetail.Account !== null && this.recordDetail.Account !== undefined &&
            this.recordDetail.Account.Current_Deal_Next_Renewal_Date__c != null && this.recordDetail.Account.Current_Deal_Next_Renewal_Date__c != undefined) {
            this.firstRenewalDate = this.recordDetail.Account.Current_Deal_Next_Renewal_Date__c;
            return true;
        }
        else{
            return false;
        }
    }

    get getMedicalUnderwriterData() {
        if (this.recordDetail.Proactive_Renewal_Underwriter__c !== undefined && this.recordDetail.Proactive_Renewal_Underwriter__c !== '') {
            this.medicalUnderWriterData = [{ 'id': this.recordDetail.Proactive_Renewal_Underwriter__c, "title": this.recordDetail.Proactive_Renewal_Underwriter__c, "icon": "standard:user" }];
            return true;

        } else {
            this.medicalUnderWriterData = [{ 'id': '', "title": '', "icon": "standard:user" }];
        }
        return false;
    }

    //---------------------------------------SAMARTH SCC 2021---------------------------------------
    get getIMData() {
        if (this.recordDetail.Incumbent_Primary_Medical__r !== undefined && this.recordDetail.Incumbent_Primary_Medical__r !== null) {
            this.incumbentMed = [{ 'id': this.recordDetail.Incumbent_Primary_Medical__c, "title": this.recordDetail.Incumbent_Primary_Medical__r.Name, "icon": "standard:account" }];
            return true;
        } else {
            this.incumbentMed = [{ 'id': '', "title": '', "icon": "standard:account" }];
        }
        return false;
    }

    get getIPData() {
        if (this.recordDetail.Incumbent_Primary_Pharmacy__r !== undefined && this.recordDetail.Incumbent_Primary_Pharmacy__r !== null) {
            this.incumbentPharm = [{ 'id': this.recordDetail.Incumbent_Primary_Pharmacy__c, "title": this.recordDetail.Incumbent_Primary_Pharmacy__r.Name, "icon": "standard:account" }];
            return true;
        } else {
            this.incumbentPharm = [{ 'id': '', "title": '', "icon": "standard:account" }];
        }
        return false;
    }

    get getIDData() {
        if (this.recordDetail.Incumbent_Primary_Dental__r !== undefined && this.recordDetail.Incumbent_Primary_Dental__r !== null) {
            this.incumbentDent = [{ 'id': this.recordDetail.Incumbent_Primary_Dental__c, "title": this.recordDetail.Incumbent_Primary_Dental__r.Name, "icon": "standard:account" }];
            return true;
        } else {
            this.incumbentDent = [{ 'id': '', "title": '', "icon": "standard:account" }];
        }
        return false;
    }

    get getIVData() {
        if (this.recordDetail.Incumbent_Primary_Vision__r !== undefined && this.recordDetail.Incumbent_Primary_Vision__r !== null) {
            this.incumbentVis = [{ 'id': this.recordDetail.Incumbent_Primary_Vision__c, "title": this.recordDetail.Incumbent_Primary_Vision__r.Name, "icon": "standard:account" }];
            return true;
        } else {
            this.incumbentVis = [{ 'id': '', "title": '', "icon": "standard:account" }];
        }
        return false;
    }
    //---------------------------------------SAMARTH SCC 2021---------------------------------------

    //Opportunity field labels
    @wire(getObjectInfo, { objectApiName: OPPORTUNITY_OBJECT })
    oppInfo({ data, error }) {
        if (data) {
            this.fieldsLabels = data.fields;
        }
    }

    @wire(getObjectInfo, {
        objectApiName: Oppobjct
    })
    objectInfo;

    @wire(getObjectInfo, {
        objectApiName: Accobjct
    })
    AccObjInfo;

    get selectedValues() {
        let options = [];
        if (this.checkdetail.Account.Claim_Site__c !== undefined) {
            options = this.checkdetail.Account.Claim_Site__c.split(';');
            //console.log('options selected=' + options);
        }
        return options;
    }

    get callselectedValues() {
        let calloptions = [];
        if (this.checkdetail.Account.Call_Site__c !== undefined) {
            calloptions = this.checkdetail.Account.Call_Site__c.split(';');
        }
        return calloptions;
    }

    get clinicalselectedvalue() {
        let clinicaloptions = [];
        if (this.checkdetail.Account.Clinical_Site__c !== undefined) {
            clinicaloptions = this.checkdetail.Account.Clinical_Site__c.split(';');
            //console.log('options selected=' + clinicaloptions);
        }
        return clinicaloptions;
    }


    //---------------------SAMARTH---------------------
    @wire(getObjectInfo, {
        objectApiName: SccObject
    })
    sccObjectInfo;

    @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: trustinvolvedScc })
    trustInvolvedValue({ error, data }) {
        if (data) {
            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    testPickListvalues.push(data.values[i]);
                }
            }

            this.trustInvolvedSccValues = testPickListvalues;

        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: typeOfFundingMedicalScc })
    typeOfFundingMedicalValue({ error, data }) {
        if (data) {
            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    // if (i === '0') {
                    //     testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    // }
                    testPickListvalues.push(data.values[i]);
                }
            }

            this.typeOfFundingMedicalSccValues = testPickListvalues;

        } else if (error) {
            console.log(error);
        }
    }


    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: fundingTypeDental })
    oppDentValue({ error, data }) {
        if (data) {
            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    // if (i === '0') {
                    //     testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    // }
                    testPickListvalues.push(data.values[i]);
                }
            }

            this.fundingTypeDentalValues = testPickListvalues;

        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: fundingTypeVision })
    oppVisValue({ error, data }) {
        if (data) {
            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    // if (i === '0') {
                    //     testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    // }
                    testPickListvalues.push(data.values[i]);
                }
            }

            this.fundingTypeVisionValues = testPickListvalues;

        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$AccObjInfo.data.defaultRecordTypeId', fieldApiName: clientPlatform })
    oppCPValue({ error, data }) {
        if (data) {
            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    // if (i === '0') {
                    //     testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    // }
                    testPickListvalues.push(data.values[i]);
                }
            }

            this.clientPlatformValues = testPickListvalues;

        } else if (error) {
            console.log(error);
        }
    }
    //---------------------SAMARTH---------------------


    @wire(getPicklistValues, { recordTypeId: '$AccObjInfo.data.defaultRecordTypeId', fieldApiName: clinicalsite })
    clinicalsite({ error, data }) {

        if (data) {
            let clinicalsitevalue = {};
            let clinicalsitevalues = [];
            for (let i in data.values) {
                if (this.clinicalselectedvalue !== undefined && this.clinicalselectedvalue.includes(data.values[i].value)) {
                    clinicalsitevalue = Object.assign({}, { label: data.values[i].value, value: data.values[i].value });
                } else {
                    clinicalsitevalue = Object.assign({}, { label: data.values[i].value, value: data.values[i].value });
                }
                clinicalsitevalues.push(clinicalsitevalue);
            }
            this.clinicalsitevalue = clinicalsitevalues;

            //console.log('options=' + this.claimstatevalue);
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$AccObjInfo.data.defaultRecordTypeId', fieldApiName: claimstate })
    claimst({ error, data }) {

        if (data) {
            //alert(JSON.stringify(data));
            //this.claimstatevalue = data;

            this.claimStateValuesArray = data.values;
            let claimstatevalue = {};
            let claimstatevalues = [];
            for (let i in data.values) {
                if (this.selectedValues !== undefined && this.selectedValues.includes(data.values[i].value)) {
                    claimstatevalue = Object.assign({}, { label: data.values[i].value, value: data.values[i].value });
                } else {
                    claimstatevalue = Object.assign({}, { label: data.values[i].value, value: data.values[i].value });
                }
                claimstatevalues.push(claimstatevalue);
            }
            this.claimstatevalue = claimstatevalues;

            //console.log('options=' + this.claimstatevalue);
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$AccObjInfo.data.defaultRecordTypeId', fieldApiName: callsite })
    callsite({ error, data }) {

        if (data) {
            //alert(JSON.stringify(data));
            //this.callsitevalue = data;
            let callsitevalue = {};
            let callSiteValues = [];
            for (let i in data.values) {
                if (this.callselectedValues !== undefined && this.callselectedValues.includes(data.values[i].value)) {
                    callsitevalue = Object.assign({}, { label: data.values[i].value, value: data.values[i].value });
                } else {
                    callsitevalue = Object.assign({}, { label: data.values[i].value, value: data.values[i].value });
                }
                callSiteValues.push(callsitevalue);
            }
            this.callsitevalue = callSiteValues;
            //console.log('EXECUTED get picklisted values =' + this.claimstatevalue);
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$AccObjInfo.data.defaultRecordTypeId', fieldApiName: PSS })
    OppPSSValue({ error, data }) {

        if (data) {

            //this.psspicklistvalue = data;

            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    testPickListvalues.push(data.values[i]);
                }
            }

            this.psspicklistvalue = testPickListvalues;

        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: trustinvolved })
    trustpssvalue({ error, data }) {


        if (data) {

            //this.trustinvolved = data;

            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    testPickListvalues.push(data.values[i]);
                }
            }

            this.trustinvolved = testPickListvalues;


        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$AccObjInfo.data.defaultRecordTypeId', fieldApiName: callSiteType })
    callsitetypevalue({ error, data }) {


        if (data) {

            //this.trustinvolved = data;

            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    testPickListvalues.push(data.values[i]);
                }
            }

            this.callSiteTypeValues = testPickListvalues;


        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$AccObjInfo.data.defaultRecordTypeId', fieldApiName: claimSiteType })
    claimsitetypevalue({ error, data }) {


        if (data) {

            //this.trustinvolved = data;

            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    testPickListvalues.push(data.values[i]);
                }
            }

            this.claimSiteTypeValues = testPickListvalues;


        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$AccObjInfo.data.defaultRecordTypeId', fieldApiName: clinicalSiteType })
    clinicalsitetypevalue({ error, data }) {


        if (data) {

            //this.trustinvolved = data;

            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    testPickListvalues.push(data.values[i]);
                }
            }

            this.clinicalSiteTypeValues = testPickListvalues;


        } else if (error) {
            console.log(error);
        }
    }

    get psoption() {
        return [
            { label: '', value: '' },
            { label: 'AK', value: 'AK' },
            { label: 'AL', value: 'AL' },
            { label: 'AR', value: 'AR' },
        ];
    }

    get classification() {
        return [
            { label: '', value: '' },
            { label: 'NB', value: 'NB' },
            { label: 'NBEA', value: 'NBEA' },
            { label: 'Xfer from KA', value: 'Xfer from KA' },
        ];
    }

    get fundmedical() {
        return [
            { label: '', value: '' },
            { label: 'ASO', value: 'ASO' },
            { label: 'FI', value: 'FI' },
            { label: 'Both', value: 'Both' },
        ];
    }


    FieldChangeHandler(event) {
        //console.log('Inside FieldChangeHandler');
        let choosenValue;
        let selectedrecords = {};
        let selectedname = event.target.name;
        selectedrecords[selectedname] = event.target.value;
        this.Clientdatarecord = selectedrecords;

        //let fieldValueReceived;
        let editfielddetails;

        if (event.target.name.indexOf('Account.') !== -1) {
            let cloneLookupRecord = Object.assign({}, this.recordDetail['Account']);
            cloneLookupRecord[event.target.name.split('.')[1]] = event.target.value;
            this.recordDetail['Account'] = cloneLookupRecord;
            choosenValue = event.target.value;
            editfielddetails = [{
                fieldedited: event.target.name,
                fieldvalue: choosenValue
            }];
        }
        //--------------------------------SAMARTH SCC 2021--------------------------------
        else if (event.target.name.indexOf('Sold_Case_Checklist__c.') !== -1) {
            choosenValue = event.target.value;
            editfielddetails = [{
                fieldedited: event.target.name,
                fieldvalue: choosenValue
            }];
        }
        //--------------------------------SAMARTH SCC 2021--------------------------------
        else {
            choosenValue = event.target.value;
            //Updating current updates when user performs any edit 
            editfielddetails = [{
                fieldedited: event.target.name,
                fieldvalue: choosenValue
            }];

            this.recordDetail[selectedname] = choosenValue;
            //fieldValueReceived = event.target.value;
        }


        const ClientDetailRecord = new CustomEvent("progressvaluechange", {
            detail: editfielddetails

        });

        this.dispatchEvent(ClientDetailRecord);
    }


    UpdateAccount(event) {
        let editaccfielddetails = [{
            fieldedited: event.target.name,
            fieldvalue: event.target.value
        }];

        const AccountRecord = new CustomEvent("accountupdate", {
            detail: editaccfielddetails

        });

        this.dispatchEvent(AccountRecord);
    }

    handleSearch(event) {
        let searchParam = event.detail.results.searchTerm;
        let customlookupDataArr = [];
        apexSearch({ searchParam: searchParam })
            .then(results => {

                results.Metadatalist.forEach(function (element) {
                    let customlookupObj = {};
                    customlookupObj.id = element.Id;
                    customlookupObj.title = element.Underwriter_Name__c;
                    customlookupObj.DetailData = element;
                    customlookupDataArr.push(customlookupObj);
                });
                let result = [...this.template.querySelectorAll('c-cutomlookup')];
                for (let i in result) {
                    if (result[i].placeholder === event.detail.placeholder) {
                        result[i].setSearchResults(customlookupDataArr, results.LocationIcon);
                    }
                }

            })
            .catch(error => {
                // TODO: handle error
            });

    }

    userhandleSearch(event) {
        let searchParam = event.detail.results.searchTerm;
        let customlookupDataArr = [];
        userSearch({
            searchParam: searchParam,
            searchField: event.detail.placeholder
        })
            .then(results => {
                results.UserData.forEach(function (element) {
                    let customlookupObj = {};
                    customlookupObj.id = element.Id;
                    customlookupObj.title = element.Name;
                    customlookupObj.subtitle = element.Name;
                    customlookupObj.DetailData = element;
                    customlookupDataArr.push(customlookupObj);
                });
                let result = [...this.template.querySelectorAll('c-cutomlookup')];
                for (let i in result) {
                    if (result[i].placeholder === event.detail.placeholder) {
                        result[i].setSearchResults(customlookupDataArr, results.LocationIcon);
                    }
                }

            })
            .catch(error => {
                // TODO: handle error
            });

    }

    handleIncumbentSearch(event) {
        let searchParam = event.detail.results.searchTerm;
        let customlookupDataArr = [];
        incumbentSearch({
            searchParam: searchParam,
            searchField: event.detail.placeholder
        })
            .then(results => {

                results.AccData.forEach(function (element) {
                    let customlookupObj = {};
                    customlookupObj.id = element.Id;
                    customlookupObj.title = element.Name;
                    customlookupObj.subtitle = element.Name;
                    customlookupObj.DetailData = element;
                    customlookupDataArr.push(customlookupObj);
                });
                let result = [...this.template.querySelectorAll(".incumbent-class")];
                for (let i in result) {
                    if (result[i].placeholder === event.detail.placeholder) {
                        result[i].setSearchResults(customlookupDataArr, results.LocationIcon);
                    }
                }

            })
            .catch(error => {
                // TODO: handle error
            });

    }

    handelselection(event) {
        let selecteddata = {};
        let placeholder = event.detail.placeholder;
        let selectedname = '';
        if (placeholder === 'Medical Underwriter') {
            selectedname = 'Proactive_Renewal_Underwriter__c';
        }

        if (event.detail.isRemove) {
            selecteddata[selectedname] = '';
            let editfielddetails = [{
                fieldedited: selectedname,
                fieldvalue: ''
            }];

            let jsonName = '';
            if (placeholder === 'Medical Underwriter') {
                jsonName = 'Proactive_Renewal_Underwriter__c';
                this.recordDetail['Proactive_Renewal_Underwriter__c'] = undefined;
            }

            const ClientDetailRecord = new CustomEvent("progressvaluechange", {
                detail: editfielddetails

            });

            this.dispatchEvent(ClientDetailRecord);

        } else {
            if (placeholder === 'Medical Underwriter') {
                this.recordDetail['Proactive_Renewal_Underwriter__c'] = event.detail.selectionData[0].title;
            }

            selecteddata[selectedname] = event.detail.selectionData[0].title;
            let editfielddetails = [{
                fieldedited: selectedname,
                fieldvalue: event.detail.selectionData[0].title
            }];
            const ClientDetailRecord = new CustomEvent("progressvaluechange", {
                detail: editfielddetails

            });

            this.dispatchEvent(ClientDetailRecord);
        }
    }

    userhandelselection(event) {
        let selecteddata = {};
        let placeholder = event.detail.placeholder;
        let selectedname = '';
        if (placeholder === 'IPM') {
            selectedname = 'IPM__c';
        }

        //--------- code added for SoldCase Audit Trail - start -----------

        let fieldedited1 = '';
        let fieldvalue1 = '';
        if (selectedname === 'IPM__c') {
            fieldedited1 = 'IPM__r.Name';
        }
        //--------- code added for SoldCase Audit Trail - end -----------

        if (event.detail.isRemove) {
            selecteddata[selectedname] = '';


            //Update record detail when the record has been removed..
            let jsonName = '';
            if (placeholder === 'IPM') {
                jsonName = 'IPM__r';
                /* this.recordDetail['IPM__r'] = null;
                this.recordDetail['IPM__c'] = null; */
                this.soldCaseDataCopy['IPM__r'] = null;
                this.soldCaseDataCopy['IPM__c'] = null;
            }

            /* let editfielddetails = [{
                fieldedited: selectedname,
                fieldvalue: null,
                fieldedited1: fieldedited1,// added parameter for SoldCase Audit Trail
                fieldvalue1: fieldvalue1 // added parameter for SoldCase Audit Trail
            }]; */

            let editfielddetails = [{
                fieldedited: 'Sold_Case_Checklist__c.IPM__c',
                fieldvalue: null,
                fieldedited1: fieldedited1,// added parameter for SoldCase Audit Trail
                fieldvalue1: fieldvalue1 // added parameter for SoldCase Audit Trail
            }];
            const ClientDetailRecord = new CustomEvent("progressvaluechange", {
                detail: editfielddetails

            });

            this.dispatchEvent(ClientDetailRecord);

        } else {
            let lookupField = '';
            if (selectedname === 'IPM__c') {
                lookupField = 'IPM__r';
            }

            //let cloneLookupRecord = Object.assign({}, this.recordDetail[lookupField]);
            let cloneLookupRecord = Object.assign({}, this.soldCaseDataCopy[lookupField]);

            cloneLookupRecord.Id = event.detail.selectionData[0].id;
            cloneLookupRecord.Name = event.detail.selectionData[0].title;

            /* this.recordDetail[selectedname] = event.detail.selectionData[0].id;
            this.recordDetail[lookupField] = cloneLookupRecord; */

            this.soldCaseDataCopy[selectedname] = event.detail.selectionData[0].id;
            this.soldCaseDataCopy[lookupField] = cloneLookupRecord;

            selecteddata[selectedname] = event.detail.selectionData[0].id;

            //--------- code added for SoldCase Audit Trail - start -----------
            fieldvalue1 = event.detail.selectionData[0].title;
            //--------- code added for SoldCase Audit Trail - end -----------

            /* let editfielddetails = [{
                fieldedited: selectedname,
                fieldvalue: event.detail.selectionData[0].id,
                fieldedited1: fieldedited1, // added parameter for SoldCase Audit Trail
                fieldvalue1: fieldvalue1 // added parameter for SoldCase Audit Trail
            }]; */
            let editfielddetails = [{
                fieldedited: 'Sold_Case_Checklist__c.IPM__c',
                fieldvalue: event.detail.selectionData[0].id,
                fieldedited1: fieldedited1, // added parameter for SoldCase Audit Trail
                fieldvalue1: fieldvalue1 // added parameter for SoldCase Audit Trail
            }];
            const ClientDetailRecord = new CustomEvent("progressvaluechange", {
                detail: editfielddetails

            });

            this.dispatchEvent(ClientDetailRecord);
        }
    }

    handleIncumbentSelection(event) {
        let selecteddata = {};
        let placeholder = event.detail.placeholder;
        let selectedname = '';

        if (placeholder === 'Incumbent Primary (Medical)') {
            selectedname = 'Incumbent_Primary_Medical__c';
        }
        if (placeholder === 'Incumbent Primary (Pharmacy)') {
            selectedname = 'Incumbent_Primary_Pharmacy__c';
        }
        if (placeholder === 'Incumbent Primary (Dental)') {
            selectedname = 'Incumbent_Primary_Dental__c';
        }
        if (placeholder === 'Incumbent Primary (Vision)') {
            selectedname = 'Incumbent_Primary_Vision__c';
        }

        //--------- code added for SoldCase Audit Trail - start -----------

        let fieldedited1 = '';
        let fieldvalue1 = '';
        if (selectedname === 'Incumbent_Primary_Medical__c') {
            fieldedited1 = 'Incumbent_Primary_Medical__r.Name';
        }
        if (selectedname === 'Incumbent_Primary_Pharmacy__c') {
            fieldedited1 = 'Incumbent_Primary_Pharmacy__r.Name';
        }
        if (selectedname === 'Incumbent_Primary_Dental__c') {
            fieldedited1 = 'Incumbent_Primary_Dental__r.Name';
        }
        if (selectedname === 'Incumbent_Primary_Vision__c') {
            fieldedited1 = 'Incumbent_Primary_Vision__r.Name';
        }
        //--------- code added for SoldCase Audit Trail - end -----------

        if (event.detail.isRemove) {
            selecteddata[selectedname] = '';


            //Update record detail when the record has been removed..
            let jsonName = '';
            if (placeholder === 'Incumbent Primary (Medical)') {
                jsonName = 'Incumbent_Primary_Medical__r';
                this.recordDetail['Incumbent_Primary_Medical__r'] = null;
                this.recordDetail['Incumbent_Primary_Medical__c'] = null;
            }
            if (placeholder === 'Incumbent Primary (Pharmacy)') {
                jsonName = 'Incumbent_Primary_Pharmacy__r';
                this.recordDetail['Incumbent_Primary_Pharmacy__r'] = null;
                this.recordDetail['Incumbent_Primary_Pharmacy__c'] = null;
            }
            if (placeholder === 'Incumbent Primary (Dental)') {
                jsonName = 'Incumbent_Primary_Dental__r';
                this.recordDetail['Incumbent_Primary_Dental__r'] = null;
                this.recordDetail['Incumbent_Primary_Dental__c'] = null;
            }
            if (placeholder === 'Incumbent Primary (Vision)') {
                jsonName = 'Incumbent_Primary_Vision__r';
                this.recordDetail['Incumbent_Primary_Vision__r'] = null;
                this.recordDetail['Incumbent_Primary_Vision__c'] = null;
            }

            let editfielddetails = [{
                fieldedited: selectedname,
                fieldvalue: null,
                fieldedited1: fieldedited1,// added parameter for SoldCase Audit Trail
                fieldvalue1: fieldvalue1 // added parameter for SoldCase Audit Trail
            }];
            const ClientDetailRecord = new CustomEvent("progressvaluechange", {
                detail: editfielddetails

            });

            this.dispatchEvent(ClientDetailRecord);

        } else {
            let lookupField = '';
            if (selectedname === 'Incumbent_Primary_Medical__c') {
                lookupField = 'Incumbent_Primary_Medical__r';
            }
            if (selectedname === 'Incumbent_Primary_Pharmacy__c') {
                lookupField = 'Incumbent_Primary_Pharmacy__r';
            }
            if (selectedname === 'Incumbent_Primary_Dental__c') {
                lookupField = 'Incumbent_Primary_Dental__r';
            }
            if (selectedname === 'Incumbent_Primary_Vision__c') {
                lookupField = 'Incumbent_Primary_Vision__r';
            }

            let cloneLookupRecord = Object.assign({}, this.recordDetail[lookupField]);
            cloneLookupRecord.Id = event.detail.selectionData[0].id;
            cloneLookupRecord.Name = event.detail.selectionData[0].Name;
            this.recordDetail[selectedname] = event.detail.selectionData[0].id;

            this.recordDetail[lookupField] = cloneLookupRecord;

            selecteddata[selectedname] = event.detail.selectionData[0].id;

            //--------- code added for SoldCase Audit Trail - start -----------
            fieldvalue1 = event.detail.selectionData[0].title;
            //--------- code added for SoldCase Audit Trail - end -----------

            let editfielddetails = [{
                fieldedited: selectedname,
                fieldvalue: event.detail.selectionData[0].id,
                fieldedited1: fieldedited1, // added parameter for SoldCase Audit Trail
                fieldvalue1: fieldvalue1 // added parameter for SoldCase Audit Trail
            }];
            const ClientDetailRecord = new CustomEvent("progressvaluechange", {
                detail: editfielddetails

            });

            this.dispatchEvent(ClientDetailRecord);
        }
    }
    multipicklistgenericeventMA(event) {
        //let cloneAccountData = Object.assign({}, this.recordDetail.Account);
        let editfielddetails = [{
            fieldedited: event.detail.fieldName,
            fieldvalue: event.detail.value
        }];

        var loop = true;
        var i = 0;
        var pickListValues = '';
        var value = event.detail.value;
        let fieldApiName = event.detail.fieldName;
        //console.log('value recived is ' + value);
        while (loop) {
            if (value !== undefined && value[i] !== undefined) {
                pickListValues = pickListValues.concat(value[i], ';');
                i++;
            } else {
                loop = false;
            }
        }

        const ClientDetailRecord = new CustomEvent("progressvaluechange", {
            detail: editfielddetails

        });

        this.dispatchEvent(ClientDetailRecord);
    }
    multipicklistgenericevent(event) {
        let cloneAccountData = Object.assign({}, this.recordDetail.Account);
        let editaccfielddetails = [{
            fieldedited: event.detail.fieldName,
            fieldvalue: event.detail.value
        }];

        var loop = true;
        var i = 0;
        var pickListValues = '';
        var value = event.detail.value;
        let fieldApiName = event.detail.fieldName;
        //console.log('value recived is ' + value);
        while (loop) {
            if (value !== undefined && value[i] !== undefined) {
                pickListValues = pickListValues.concat(value[i], ';');
                i++;
            } else {
                loop = false;
            }
        }

        //console.log('pickListValues ' + pickListValues);
        cloneAccountData[event.detail.fieldName] = pickListValues;
        this.recordDetail.Account = cloneAccountData;

        const AccountRecord = new CustomEvent("accountupdate", {
            detail: editaccfielddetails

        });

        this.dispatchEvent(AccountRecord);
    }

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;
    }

    @api
    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);
            console.log('allValid>>>', allValid);
        return allValid;
    }

    renderedCallback() {
        var p1 = this.template.querySelectorAll('.border-bottom');
        if (p1)
            if (this.editmode) {
                [].forEach.call(p1, (e) => {
                    e.style = 'min-height: 49px;max-height: 49px;'
                });

            } else {
                [].forEach.call(p1, (e) => {
                    e.style = 'min-height:auto'
                });
                // p1.style ='min-height:auto';
            }

        var p2 = this.template.querySelectorAll('.border-bottom2');
        if (p2)
            if (this.editmode) {
                [].forEach.call(p2, (e) => {
                    e.style = 'min-height: 152px;max-height: 152px;'
                });

            } else {
                [].forEach.call(p2, (e) => {
                    e.style = 'min-height:auto;max-height: auto;'
                });
                // p1.style ='min-height:auto';
            }

        var p3 = this.template.querySelector('.border-bottom3');
        var p4 = this.template.querySelector('.border-bottom4');
        if (p3)
            if (!this.editmode) {
                // if(p3.offsetHeight>35){
                //     //p3.style='min-height: 64px;max-height: 64px;';
                //    // p4.style ='min-height:'+p3.offsetHeight+'px;max-height:'+p3.offsetHeight+'px;';
                // }
                if (p3.offsetHeight > 0) {
                    p4.style = 'min-height:' + p3.offsetHeight + 'px;max-height:' + p3.offsetHeight + 'px;';
                    p3.style = 'min-height:' + p3.offsetHeight + 'px;max-height:' + p3.offsetHeight + 'px;';
                }
                else {
                    p3.style = 'min-height: 64px;max-height: 64px;';
                    p4.style = 'min-height: 64px;max-height: 64px;';
                }
                /* p4.style ='min-height:'+p3.offsetHeight+'px;max-height:'+p3.offsetHeight+'px;';
                p3.style ='min-height:'+p3.offsetHeight+'px;max-height:'+p3.offsetHeight+'px;'; */
            }

        if (this.template.querySelector('.section-header-style') === null || this.hasRendered === true) return;
        this.hasRendered = true;
        let style = document.createElement('style');
        style.innerText = `     
            .section-header-sub .slds-accordion__summary-heading{
                background-color: rgba(210, 223, 247, 0.7) !important;          
                font-size: 12px !important;               
                padding: 4px 10px;
                border-radius: 3px;
                font-weight: 600;           
            }
            .section-header-sub .slds-accordion__summary{
                margin-bottom: .5rem;
            }        
            .section-header-sub .slds-accordion__section{
                padding:10px 7px 5px 7px;               
            }
            .pharmacyPadding .slds-accordion__section{
                padding:10px 0px 0px 0px !important;               
            }
            .pharmacyPadding .slds-accordion__summary{
                padding:10px 0px 0px 10px !important;               
            }
            
        `;
        this.template.querySelector('.section-header-style').appendChild(style);
    }

}