/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 01-03-2025
 * @last modified by  : Spoorthy
**/
import { LightningElement, track, api, wire } from "lwc";
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import oppobjct from '@salesforce/schema/Opportunity';
//import opplineobjct from '@salesforce/schema/OpportunityLineItem';
//import tieredBenefits from '@salesforce/schema/Opportunity.Tiered_Benefits__c';
import SoldCaseChecklist_ProductService_Note from '@salesforce/label/c.SoldCaseChecklist_ProductService_Note';
import bridge2healthOptOut from '@salesforce/schema/Opportunity.Bridge2Health_opt_out__c';
import getClientdata from '@salesforce/apex/SoldChecklistHandler.getClientData';

//---------------------------------SAMARTH SCC 2021---------------------------------
import SccObject from '@salesforce/schema/Sold_Case_Checklist__c';

import stdComm from '@salesforce/schema/Sold_Case_Checklist__c.Standard_Communications__c';
import rallyBase from '@salesforce/schema/Sold_Case_Checklist__c.Rally_Base__c';
import a4MeCore from '@salesforce/schema/Sold_Case_Checklist__c.A4Me_Core__c';
import eServices from '@salesforce/schema/Sold_Case_Checklist__c.eServices_Select__c';
import virVis from '@salesforce/schema/Sold_Case_Checklist__c.Virtual_Visits__c';
import ableTo from '@salesforce/schema/Sold_Case_Checklist__c.Able_To__c';

import payInteg from '@salesforce/schema/Sold_Case_Checklist__c.Payment_Integrity__c';
import tieredBenefits from '@salesforce/schema/Sold_Case_Checklist__c.Tiered_Benefits_Excluding_Nexus__c';
import bridge2healthVision from '@salesforce/schema/Opportunity.Bridge2Health_Vision__c';
import medNecMain from '@salesforce/schema/Sold_Case_Checklist__c.Medical_Necessity__c';
//---------------------------------SAMARTH SCC 2021---------------------------------
//---------------------------------Spoorthy Surest 2024-----------------------------
import x2ndMD from '@salesforce/schema/Sold_Case_Checklist__c.X2nd_MD__c';
import optumTransplant from '@salesforce/schema/Sold_Case_Checklist__c.Optum_Transplant_Resource_Services__c';

//import flexOptionValues from '@salesforce/schema/OpportunityLineItem.Flex_Options__c';
import capType from '@salesforce/schema/Sold_Case_Checklist__c.Cap_Type__c';
import capCategory from '@salesforce/schema/Sold_Case_Checklist__c.Cap_Category__c';
import amountType from '@salesforce/schema/Sold_Case_Checklist__c.Amount_Type__c';



export default class SoldCaseProductsComp extends LightningElement {
    @api editmode;
    @api opplineitems;
    @api medicalrecords;
    @api otherrecords;
    @track dentalrecordsList;
    @track pharmacyrecords;
    @track visionrecordList;
    @api picklistvalue;
    @track opplineitemcopy = [];
    @api meddispValue;
    @api dentdispValue;
    @api pharmdispValue;
    @api visiondispValue;
    @api otherProductsStatus;
    @api tieredBenefitValue;
    @api bridge2healthOptOutValue;
    @api bridge2healthOptOutVisionValue;
    @api isSurestProductMed;
    @api isTraditionalProductMed;
    @api isTradSoldOther;
    @api isSurestSoldOther;
    @track medNecMainValues;
    @track trackCheck = false;
    bridge2healthOptOutValues;
    bridge2healthOptOutVisionValues;

    hasRendered = false;

    @track tieredBenefitsValues;
    @track updatedOtherProducts = [];
    @track activeSections = [
        "Pharmacy Carve In Programs",
        "Products and Services",
        "Medical Products",
        "Pharmacy Products",
        "Dental Products",
        "Vision Products",
        "Other Products",
        "Base Programs Included in ASO Administrative Fee",
        "Payment Integrity Bundles - Traditional",
        "Payment Integrity Bundles - Surest",
        "Payment Integrity Buy Ups",
        "OON (Out of Network Program)",
        "Care Management - Personal Health Support 3.0 (Tier 2)",
        "Care Management - Personal Health Support 3.0 (Tier 3)",
        "Care Management - Personal Health Support 3.0 (Tier 4)",
        "OON Product",
        "CoreMedicalNecessity",
        "Base Programs Included in ASO Administrative Fee Surest"

    ];
    label = {
        SoldCaseChecklist_ProductService_Note
    };

    //--------------------------------SAMARTH SCC 2021--------------------------------
    @api recordid;
    @api specifyBankAdmList = [];
    @api listApplCustomList = [];
    @api indicateVendorList = [];
    @api providePlanCdeList = [];

    @api isSpecifyBankAdmTrue = false;
    @api isListApplCustomTrue = false;
    @api isindicateVendorTrue = false;
    @api isprovidePlanCdeTrue = false;

    @api productNameList = [];

    @api isDispStdCustTrue = false;
    @api isDispOptumOtherTrue = false;
    @api isDispCarveInOutTrue = false;

    @api oliEditedRecords;
    @api medicalrecordsCopy;

    @api medSold;

    @api stdCommValues;
    @api rallyBaseValues;
    @api a4MeCoreValues;
    @api eServicesValues;
    @api virVisValues;
    @api ableToValues;

    @track soldCaseDataCopy;
    @api completeOliArray;

    @api engageSolCopy;
    @api wellRallCopy;
    @api advocacyCopy;
    @api eServicesCopy;

    @api payIntegValues ;
    @api currentPayIntVal;

    @api completeDataFromParent;
    @api outOfNetworkProductSold;
    @api surestNaviguardSold;

    @api capTypeValues;
    @api capCategoryValues;
    @api amountTypeValues;

    @api capTypeCopy;
    @api capCategoryCopy;
    @api amountTypeCopy;

    @track includedOptOut = [
        { label: '', value: '' },
        { label: 'Included', value: 'Included' },
        { label: 'Opt Out', value: 'Opt Out' },
        { label: 'TBD', value: 'TBD' }
    ];

    @track includedCarveOut = [
        { label: '', value: '' },
        { label: 'Included', value: 'Included' },
        { label: 'Carveout', value: 'Carveout' }
    ];

    @track enhancedCOB = [
        { label: '', value: '' },
        { label: 'COB Lite', value: 'COB Lite'},
        { label: 'Enhanced COB', value: 'Enhanced COB'}
    ]

    @api showPayIntFields = false;
    @api showPharmaCarveOutDropDown = false;

	@api prevOption123 = false;
    @api option123 = false;
    @api option456 = false;
    @api option7 = false;


    @api showTextBox;

    @api activeReviewId;
    @api level2Val;

    @api showMedNecBuyUpSection;
    @api showPayIntBuyUpSection;
    @track showInPayIntBuyUpSection = false;
    @track showUhcVirtualVisitsWriteIn = false;
    @track showMedNecSection = false;

    @track oonProductsPresent = false;
    //--------------------------------SAMARTH SCC 2021--------------------------------

    @api x2ndMDValues;
    @api optumTransplantValues;

    @api x2ndMDCopy;
    @api optumTransplantCopy;

    //---------SAMARTH SCC NB UPGRADE 2023---------
    @api soldCaseCheckListInstructions;
    @api dentalClinicalIntegrationHelpText;
    @api visionClinicalIntegrationHelpText;
    @api cmType;
    //---------SAMARTH SCC NB UPGRADE 2023---------

    @track legacy12 = false;
    @track simplified12 = false;
    @track legacy12claim = false;
    @track onlyOption456 =false;
    @track simplified1Only =false;
    @track isdisbaledsimplified1Only =true;
    @track medicalNecessity = 'Medical Necessity';
     flexOptionValuesOptions;

    @api
    get pharmarecords() {
        return pharmarecords;
    }
    set pharmarecords(value) {
        this.pharmacyrecords = JSON.parse(JSON.stringify(value));
        //console.log('this.pharmacyrecords in --- ' + JSON.stringify(this.pharmacyrecords));
    }

    @track isSurestSoldDental = false;
    @track isTradSoldDental = false;
    @api
    get dentalrecords() {
        return dentalrecords;
    }
    set dentalrecords(value) {
        this.dentalrecordsList = JSON.parse(JSON.stringify(value));
        for (let i in this.dentalrecordsList) {
            if (this.dentdispValue == 'Sold') {
                if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                    this.dentalrecordsList[i]['surestDisp'] = 'Sold';
                    this.dentalrecordsList[i]['traditionalDisp'] ='Sold';
                    this.isSurestSoldDental = true;
                    this.isTradSoldDental = true;
                } else if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'Surest Only') {
                    //this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = 'Sold';
                    this.dentalrecordsList[i]['surestDisp'] = 'Sold';
                    this.dentalrecordsList[i]['traditionalDisp'] ='';
                    
                    this.isSurestSoldDental = true;
                   
                }
                else if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                   // this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = '';
                    this.dentalrecordsList[i]['surestDisp'] = '';
                    this.dentalrecordsList[i]['traditionalDisp'] ='Sold';
                  
                    this.isTradSoldDental = true;
                }
                else{
                    if(this.isSurestSoldDental){
                    this.dentalrecordsList[i]['surestDisp'] = 'N/A';
                    }
                    this.dentalrecordsList[i]['traditionalDisp'] ='Sold';
                }
                    //this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = '';
            }else if (this.dentdispValue == 'Spin-Off') {
                if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                    this.dentalrecordsList[i]['surestDisp'] = 'Spin-Off';
                    this.dentalrecordsList[i]['traditionalDisp'] ='Spin-Off';
                    this.isSurestSoldDental = true;
                    this.isTradSoldDental = true;
                } else if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'Surest Only') {
                    //this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = 'Sold';
                    this.dentalrecordsList[i]['surestDisp'] = 'Spin-Off';
                    this.dentalrecordsList[i]['traditionalDisp'] ='';
                    this.isSurestSoldDental = true;
                   
                }
                else if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                   // this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = '';
                    this.dentalrecordsList[i]['surestDisp'] = '';
                    this.dentalrecordsList[i]['traditionalDisp'] ='Spin-Off';
                    this.isTradSoldDental = true;
                }
                else{
                    if(this.isSurestSoldDental){
                    this.dentalrecordsList[i]['surestDisp'] = 'N/A';
                    }
                    this.dentalrecordsList[i]['traditionalDisp'] ='Spin-Off';
                }
                    //this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = '';
            }
            else if (this.dentdispValue == 'Transfer In') {
                if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                    this.dentalrecordsList[i]['surestDisp'] = 'Transfer In';
                    this.dentalrecordsList[i]['traditionalDisp'] ='Transfer In';
                    this.isSurestSoldDental = true;
                    this.isTradSoldDental = true;
                } else if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'Surest Only') {
                    //this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = 'Sold';
                    this.dentalrecordsList[i]['surestDisp'] = 'Transfer In';
                    this.dentalrecordsList[i]['traditionalDisp'] ='';
                    this.isSurestSoldDental = true;
                   
                }
                else if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                   // this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = '';
                    this.dentalrecordsList[i]['surestDisp'] = '';
                    this.dentalrecordsList[i]['traditionalDisp'] ='Transfer In';
                    this.isTradSoldDental = true;
                }
                else{
                    if(this.isSurestSoldDental){
                    this.dentalrecordsList[i]['surestDisp'] = 'N/A';
                    }
                    this.dentalrecordsList[i]['traditionalDisp'] ='Transfer In';
                }
                    //this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = '';
            }
            else {
                if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                    //this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = 'TBD';
                    this.dentalrecordsList[i]['surestDisp'] = 'TBD';
                    this.dentalrecordsList[i]['traditionalDisp'] ='TBD';
                    this.isSurestSoldDental = true;
                    this.isTradSoldDental = true;
                } else if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'Surest Only') {
                    //this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = 'TBD';
                    this.dentalrecordsList[i]['surestDisp'] = 'TBD';
                    this.dentalrecordsList[i]['traditionalDisp'] ='';
                    this.isSurestSoldDental = true;
                    
                }
                else if (this.dentalrecordsList[i]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                   // this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = '';
                    this.dentalrecordsList[i]['surestDisp'] = '';
                    this.dentalrecordsList[i]['traditionalDisp'] ='TBD';
                   
                    this.isTradSoldDental = true;
                }
                else {
                    if(this.isSurestSoldDental){
                    this.dentalrecordsList[i]['surestDisp'] = 'N/A';
                    }
                    this.dentalrecordsList[i]['traditionalDisp'] ='TBD';
                    //this.dentalrecordsList[i]['Buyup_Product_Selection__c'] = '';
                }
            }

        }
        for(let i in this.dentalrecordsList) {
            if(this.isSurestSoldDental && this.isTradSoldDental){
                if(this.dentalrecordsList[i]['surestDisp'] == ''){
                    this.dentalrecordsList[i]['surestDisp'] = 'N/A';
                }
                if(this.dentalrecordsList[i]['traditionalDisp'] == ''){
                    this.dentalrecordsList[i]['traditionalDisp'] = 'N/A';
                }
            }
        }
        console.log(this.dentalrecordsList);
    }

    @track isSurestSoldVision = false;
    @track isTradSoldVision = false;
    @api
    get visionrecords() {
        return visionrecords;
    }
    set visionrecords(value) {
        this.visionrecordList = JSON.parse(JSON.stringify(value));
        for (let i in this.visionrecordList) {
            if (this.visiondispValue == 'Sold') {
                if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                    this.visionrecordList[i]['surestDisp'] = 'Sold';
                    this.visionrecordList[i]['traditionalDisp'] ='Sold';
                    // this.visionrecordList[i]['Buyup_Product_Selection__c'] = 'Sold';
                    this.isSurestSoldVision = true;
                    this.isTradSoldVision = true;
                } else if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'Surest Only') {
                    //this.visionrecordList[i]['Buyup_Product_Selection__c'] = 'Sold';
                    this.visionrecordList[i]['surestDisp'] = 'Sold';
                    this.visionrecordList[i]['traditionalDisp'] ='';
                    this.isSurestSoldVision = true;
                  
                }
                else if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                    this.visionrecordList[i]['surestDisp'] = '';
                    this.visionrecordList[i]['traditionalDisp'] ='Sold';
                    //this.visionrecordList[i]['Buyup_Product_Selection__c'] = '';
                    
                    this.isTradSoldVision = true;
                }
                else
                   {
                    if(this.isSurestSoldVision){
                    this.visionrecordList[i]['surestDisp'] = 'N/A';
                    }
                    this.visionrecordList[i]['traditionalDisp'] ='Sold';
                    //this.visionrecordList[i]['Buyup_Product_Selection__c'] = '';
                   } 
                
            }
            else if (this.visiondispValue == 'Spin-Off') {
               if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                   this.visionrecordList[i]['surestDisp'] = 'Spin-Off';
                   this.visionrecordList[i]['traditionalDisp'] ='Spin-Off';
                   // this.visionrecordList[i]['Buyup_Product_Selection__c'] = 'Sold';
                   this.isSurestSoldVision = true;
                   this.isTradSoldVision = true;
               } else if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'Surest Only') {
                   //this.visionrecordList[i]['Buyup_Product_Selection__c'] = 'Sold';
                   this.visionrecordList[i]['surestDisp'] = 'Spin-Off';
                   this.visionrecordList[i]['traditionalDisp'] ='';
                   this.isSurestSoldVision = true;
                 
               }
               else if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                   this.visionrecordList[i]['surestDisp'] = '';
                   this.visionrecordList[i]['traditionalDisp'] ='Spin-Off';
                   //this.visionrecordList[i]['Buyup_Product_Selection__c'] = '';
                   
                   this.isTradSoldVision = true;
               }
               else
                  {
                   if(this.isSurestSoldVision){
                   this.visionrecordList[i]['surestDisp'] = 'N/A';
                   }
                   this.visionrecordList[i]['traditionalDisp'] ='Spin-Off';
                   //this.visionrecordList[i]['Buyup_Product_Selection__c'] = '';
                  } 
               
           }  else if (this.visiondispValue == 'Transfer In') {
               if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                   this.visionrecordList[i]['surestDisp'] = 'Transfer In';
                   this.visionrecordList[i]['traditionalDisp'] ='Transfer In';
                   // this.visionrecordList[i]['Buyup_Product_Selection__c'] = 'Sold';
                   this.isSurestSoldVision = true;
                   this.isTradSoldVision = true;
               } else if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'Surest Only') {
                   //this.visionrecordList[i]['Buyup_Product_Selection__c'] = 'Sold';
                   this.visionrecordList[i]['surestDisp'] = 'Transfer In';
                   this.visionrecordList[i]['traditionalDisp'] ='';
                   this.isSurestSoldVision = true;
                 
               }
               else if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                   this.visionrecordList[i]['surestDisp'] = '';
                   this.visionrecordList[i]['traditionalDisp'] ='Transfer In';
                   //this.visionrecordList[i]['Buyup_Product_Selection__c'] = '';
                   
                   this.isTradSoldVision = true;
               }
               else
                  {
                   if(this.isSurestSoldVision){
                   this.visionrecordList[i]['surestDisp'] = 'N/A';
                   }
                   this.visionrecordList[i]['traditionalDisp'] ='Transfer In';
                   //this.visionrecordList[i]['Buyup_Product_Selection__c'] = '';
                  } 
               
           }
           
            else {
                if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                    
                    this.visionrecordList[i]['surestDisp'] = 'TBD';
                    this.visionrecordList[i]['traditionalDisp'] ='TBD';
                    //this.visionrecordList[i]['Buyup_Product_Selection__c'] = 'TBD';
                    this.isSurestSoldVision = true;
                    this.isTradSoldVision = true;
                } else if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'Surest Only') {
                   
                    this.visionrecordList[i]['surestDisp'] = 'TBD';
                    this.visionrecordList[i]['traditionalDisp'] ='';
                    // this.visionrecordList[i]['Buyup_Product_Selection__c'] = 'TBD';
                    this.isSurestSoldVision = true;
                    
                }
                else if (this.visionrecordList[i]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                    this.visionrecordList[i]['surestDisp'] = '';
                    this.visionrecordList[i]['traditionalDisp'] ='TBD';
                    //this.visionrecordList[i]['Buyup_Product_Selection__c'] = '';
                   
                    this.isTradSoldVision = true;
                }
                else {
                    if(this.isSurestSoldVision){
                    this.visionrecordList[i]['surestDisp'] = 'N/A';
                    }
                    this.visionrecordList[i]['traditionalDisp'] ='TBD';
                    //this.visionrecordList[i]['Buyup_Product_Selection__c'] = '';
               }
            }

        }
        for(let i in this.visionrecordList) {
            if(this.isSurestSoldVision && this.isTradSoldVision){
                if(this.visionrecordList[i]['surestDisp'] == ''){
                    this.visionrecordList[i]['surestDisp'] = 'N/A';
                }
                if(this.visionrecordList[i]['traditionalDisp'] == ''){
                    this.visionrecordList[i]['traditionalDisp'] = 'N/A';
                }
            }
        }
        console.log(this.visionrecordList);
        //console.log('this.pharmacyrecords in --- ' + JSON.stringify(this.pharmacyrecords));
    }

    @api
    get engageSol() {
        return engageSol;
    }
    set engageSol(value) {
        this.engageSolCopy = value;
    }

    @api
    get wellRall() {
        return wellRall;
    }
    set wellRall(value) {
        this.wellRallCopy = value;
    }

    @api
    get advocacy() {
        return advocacy;
    }
    set advocacy(value) {
        this.advocacyCopy = value;
    }

    @api
    get eServices() {
        return eServices;
    }
    set eServices(value) {
        this.eServicesCopy = value;
    }

    @api
    get x2ndMD() {
        return x2ndMD;
    }
    set x2ndMD(value) {
        this.x2ndMDCopy = value;
    }

    @api
    get optumTransplant() {
        return optumTransplant;
    }
    set optumTransplant(value) {
        this.optumTransplantCopy = value;
    }

    @api
    get capType() {
        return capType;
    }
    set capType(value) {
        this.capTypeCopy = value;
    }

    @api
    get capCategory() {
        return capCategory;
    }
    set capCategory(value) {
        this.capCategoryCopy = value;
    }

    @api
    get amountType() {
        return amountType;
    }
    set amountType(value) {
        this.amountTypeCopy = value;
    }

    get isPharmacyEmpty() {
        return (this.pharmacyrecords !== undefined && this.pharmacyrecords.length > 0) ? false : true;
    }

    get isMedicalEmpty() {
        //console.log('medicalrecords in child comp '+JSON.stringify(this.medicalrecords));
        return (this.medicalrecords !== undefined && this.medicalrecords.length > 0) ? false : true;
    }

    get isDentalEmpty() {
        //console.log('dentalrecords '+JSON.stringify(this.dentalrecords));
        return (this.dentalrecordsList !== undefined && this.dentalrecordsList.length > 0) ? false : true;
    }

    get isVisionEmpty() {
        return (this.visionrecordList !== undefined && this.visionrecordList.length > 0) ? false : true;
    }

    get isOtherEmpty() {
        return ((this.otherrecords !== undefined && this.otherrecords.length > 0) || this.medSold) ? false : true;
    }

    //----------------------SAMARTH SCC NB UPGRADE 2023----------------------
    get yesNoValues() {
        return [
            { label: '', value: '' },
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
        ];
    }
    //----------------------SAMARTH SCC NB UPGRADE 2023----------------------

    connectedCallback() {


       
        console.log('Inside Prod Comp CCB');
        this.opplineitemcopy = this.opplineitems;

        this.getOliAndMetadata();
        if (this.meddispValue == 'Sold' || this.meddispValue == 'Spin-Off' || this.meddispValue == 'Transfer In') {
            this.medSold = true;
        }
        else {
            this.medSold = false;
        }

        for (let i in this.otherrecords) {
            if (this.otherrecords[i].showOonInstruction == true) {
                this.oonProductsPresent = true;
            }

            for (let j in this.otherrecords[i]['value']) {

                // if (this.otherrecords[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                //     //  this.otherrecords[i]['value'][j].disposition = 'Sold';
                //     //  this.otherrecords[i]['value'][j].Surestdisposition = 'Sold';
                //     this.isSurestSoldOther = true;
                //     this.isTradSoldOther = true;
                //  } else if (this.otherrecords[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                //      //this.otherrecords[i]['value'][j]['Buyup_Product_Selection__c'] = 'Sold';
                //      // this.otherrecords[i]['value'][j].Surestdisposition = 'Sold';
                //      this.isSurestSoldOther = true;
                //      this.isTradSoldOther = false;
                // }
                // else if (this.otherrecords[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                //     //this.otherrecords[i]['value'][j]['Buyup_Product_Selection__c'] = '';
                //     // this.otherrecords[i]['value'][j].disposition = 'Sold';
                //     this.isSurestSoldOther = false;
                //     this.isTradSoldOther = true;
                // }

                if (this.otherrecords[i]['value'][j]['medNecBuyUp'] == true) {
                    this.showMedNecBuyUpSection = true;
                        
                }

                if (this.otherrecords[i]['value'][j]['payIntBuyUp'] == true ) {
                   if(!this.isTraditionalProductMed && !this.isSurestProductMed){
                        this.showPayIntBuyUpSection = true;
                   }
                   if(this.isTraditionalProductMed || this.isSurestProductMed){
                        this.showInPayIntBuyUpSection = true;
                   }
                }

                if (this.otherrecords[i]['value'][j]['Product2']['Family'].includes('Out-of-Network Reimbursement Program') &&
                    this.otherrecords[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold') {
                    this.outOfNetworkProductSold = true;
                    this.activeSections.push(this.otherrecords[i]['value'][j]['Product2']['Name']);
                }

                if((this.otherrecords[i]['value'][j]['ProductCode'] == 'OON-PKGX' ||this.otherrecords[i]['value'][j]['ProductCode'] == 'OON-NAVP' || this.otherrecords[i]['value'][j]['ProductCode'] == 'OON-NAVN') &&
                    (this.otherrecords[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only' || this.otherrecords[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') &&
                    (this.otherrecords[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' || this.otherrecords[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' || this.otherrecords[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')){
                        this.surestNaviguardSold = true;
                        this.activeSections.push("Naviguard - Surest - Customer Credits & Fees");
                }
            }
        }

        //console.log('Payment_Integrity__c in Prod Comp CCB --  ' + this.soldCaseDataCopy.Payment_Integrity__c);
        if (this.soldCaseDataCopy.Payment_Integrity__c === null || this.soldCaseDataCopy.Payment_Integrity__c === undefined ||
            this.soldCaseDataCopy.Payment_Integrity__c === '') {
            //console.log('Inside PI if');
            this.showPayIntFields = false;
        }
        else {
            //console.log('Inside PI else');
            this.showPayIntFields = true;
        }

        //----------------PAYMENT INTEGRITY FINAL FEEDBACK----------------
        if (this.soldCaseDataCopy.Payment_Integrity__c == 'Legacy Option 1' ||
            this.soldCaseDataCopy.Payment_Integrity__c == 'Legacy Option 2' ||
            this.soldCaseDataCopy.Payment_Integrity__c == 'Legacy Option 3' ||
            this.soldCaseDataCopy.Payment_Integrity__c == 'Legacy Non-Standard') {
            this.prevOption123 = false;
			this.option123 = false;
            this.option456 = true;
            this.option7 = false;
            if(this.soldCaseDataCopy.Payment_Integrity__c == 'Legacy Non-Standard'){
                this.legacy12 = false;
                this.legacy12claim = false;

            }else{
                this.legacy12 = true;
                this.legacy12claim = true;
            }
            if(this.cmType){
                this.onlyOption456 =true;
                //this.legacy12claim = false;
            }
            else if(this.soldCaseDataCopy.Payment_Integrity__c  == 'Legacy Non-Standard'){
                this.onlyOption456 =true;
            }else{
                this.onlyOption456 =false;
            }
            if(this.cmType && this.soldCaseDataCopy.Payment_Integrity__c == 'Legacy Option 1'){
                this.legacy12claim = false;
            }
            // if(this.cmType && (this.soldCaseDataCopy.Payment_Integrity__c == 'Legacy Option 2'||this.soldCaseDataCopy.Payment_Integrity__c == 'Legacy Option 3')){
            //     this.legacy12claim = true;
            // }
            // else{
            //     this.legacy12claim = false;
            // }
           
        }

        if (this.soldCaseDataCopy.Payment_Integrity__c == 'Simplified Option 1' ||
            this.soldCaseDataCopy.Payment_Integrity__c == 'Simplified Option 2' ||
            this.soldCaseDataCopy.Payment_Integrity__c == 'Simplified Option 3' ||
            this.soldCaseDataCopy.Payment_Integrity__c == 'Simplified Non-Standard' ||
            this.soldCaseDataCopy.Payment_Integrity__c == 'Blackstone Equity Health 2025' ) {
            this.prevOption123 = false;
			this.option123 = true;
            this.option456 = false;
            this.option7 = false;
            if( this.soldCaseDataCopy.Payment_Integrity__c == 'Simplified Non-Standard'){
                this.simplified12 = false;
            }else{
                this.simplified12 = true;
            }
            if( this.soldCaseDataCopy.Payment_Integrity__c == 'Simplified Option 1'){
                this.simplified1Only = true;
                this.isdisbaledsimplified1Only =false;
            }else{
                this.simplified1Only = false;
                this.isdisbaledsimplified1Only =true;
            }
        }
		
		if (this.soldCaseDataCopy.Payment_Integrity__c == 'Option 1 (Current Standard)' ||
            this.soldCaseDataCopy.Payment_Integrity__c == 'Option 2 (Additional Revenue)' ||
            this.soldCaseDataCopy.Payment_Integrity__c == 'Option 3 (Option 2 + COB)') {
            this.prevOption123 = true;
			this.option123 = false;
            this.option456 = false;
            this.option7 = false;
			//this.payIntegValues.push(this.soldCaseDataCopy.Payment_Integrity__c);
		}

        if (this.soldCaseDataCopy.Payment_Integrity__c == 'Equity Healthcare') {
            this.prevOption123 = false;
			this.option123 = false;
            this.option456 = false;
            this.option7 = true;
        }

    
        //----------------PAYMENT INTEGRITY FINAL FEEDBACK----------------

        //------------------------------------SAMARTH SCC NB UPGRADE 2023------------------------------------
        for (let i in this.soldCaseCheckListInstructions) {
            if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'Dental_Clinical_Integration') {
                this.dentalClinicalIntegrationHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            } else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'Vision_Clinical_Integration') {
                this.visionClinicalIntegrationHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
            }
        }
        //------------------------------------SAMARTH SCC NB UPGRADE 2023------------------------------------

        if(this.isSurestProductMed){
            this.medicalNecessity = 'Medical Necessity - Traditional';
        }


    }

    @wire(getObjectInfo, {
        objectApiName: SccObject
    })
    sccObjInfo;

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: medNecMain })
    medNecMainData({ error, data }) {
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
            this.medNecMainValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: stdComm })
    stdCommData({ error, data }) {
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
            this.stdCommValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: rallyBase })
    rallyBaseData({ error, data }) {
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
            this.rallyBaseValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: a4MeCore })
    a4MeCoreData({ error, data }) {
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
            this.a4MeCoreValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: eServices })
    eServicesData({ error, data }) {
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
            this.eServicesValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: virVis })
    virVisData({ error, data }) {
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
            this.virVisValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: ableTo })
    ableToData({ error, data }) {
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
            this.ableToValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: payInteg })
    payIntegData({ error, data }) {
        if (data) {
            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    if (this.cmType) {
                        if(data.values[i].label != 'Blackstone Equity Health 2025')
                            testPickListvalues.push(data.values[i]);
                    } else{
                        if (data.values[i].label != 'Simplified Option 1' && data.values[i].label != 'Legacy Option 1') {
                         testPickListvalues.push(data.values[i]);
                        }
                    }
                }

            }
            if (this.soldCaseDataCopy.Payment_Integrity__c == 'Option 1 (Current Standard)' ||
                this.soldCaseDataCopy.Payment_Integrity__c == 'Option 2 (Additional Revenue)' ||
                this.soldCaseDataCopy.Payment_Integrity__c == 'Option 3 (Option 2 + COB)' ||
                this.soldCaseDataCopy.Payment_Integrity__c == 'Equity Healthcare'){
                testPickListvalues.push({ label: this.soldCaseDataCopy.Payment_Integrity__c, value: this.soldCaseDataCopy.Payment_Integrity__c });
            }
            this.payIntegValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    //Fetch Tiered Benefits picklist values
    @wire(getObjectInfo, {
        objectApiName: oppobjct
    })
    oppbjInfo;

     

   

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: tieredBenefits })
    tieredBenefits({ error, data }) {
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

            this.tieredBenefitsValues = testPickListvalues;


        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$oppbjInfo.data.defaultRecordTypeId', fieldApiName: bridge2healthOptOut })
    brdg2HlthOptOut({ error, data }) {
        if (data) {
            let pickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        pickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    pickListvalues.push(data.values[i]);
                }
            }
            this.bridge2healthOptOutValues = pickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$oppbjInfo.data.defaultRecordTypeId', fieldApiName: bridge2healthVision })
    brdg2HlthVision({ error, data }) {
        if (data) {
            let pickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        pickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    pickListvalues.push(data.values[i]);
                }
            }
            this.bridge2healthOptOutVisionValues = pickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: x2ndMD })
    x2ndMDData({ error, data }) {
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
            this.x2ndMDValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: optumTransplant })
    optumTransplantData({ error, data }) {
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
            this.optumTransplantValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: capType })
    capTypeData({ error, data }) {
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
            this.capTypeValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: capCategory })
    capCategoryData({ error, data }) {
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
            this.capCategoryValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$sccObjInfo.data.defaultRecordTypeId', fieldApiName: amountType })
    amountTypeData({ error, data }) {
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
            this.amountTypeValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @api
    get soldCaseObjectData() {
        return soldCaseObjectData;
    }
    set soldCaseObjectData(value) {
        this.soldCaseDataCopy = Object.assign({}, value);
        this.currentPayIntVal = this.soldCaseDataCopy['Payment_Integrity__c'];

        if (this.soldCaseDataCopy['Virtual_Visits__c'] == 'Opt Out') {
            this.showUhcVirtualVisitsWriteIn = true;
        }
        else {
            this.showUhcVirtualVisitsWriteIn = false;
        }

        if (this.soldCaseDataCopy['Medical_Necessity__c'] == 'Yes') {
            this.showMedNecSection = true;
        }
        else {
            this.showMedNecSection = false;
        }

    }

    get stdCust() {
        return [
            { label: '', value: '' },
            { label: 'Standard', value: 'Standard' },
            { label: 'Custom', value: 'Custom' }
        ];
    }

    get optumOther() {
        return [
            { label: '', value: '' },
            { label: 'Optum Bank', value: 'Optum Bank' },
            { label: 'Other', value: 'Other' }
        ];
    }

    get carveInOut() {
        return [
            { label: '', value: '' },
            { label: 'Carve In', value: 'Carve In' },
            { label: 'Carve Out', value: 'Carve Out' }
        ];
    }

    get optInOut() {
        return [
            { label: '', value: '' },
            { label: 'Included', value: 'Included' },
            { label: 'Opt Out', value: 'Opt Out' },
            { label: 'TBD', value: 'TBD' }
        ];
    }

    get pharmacyCarveOutDropDown() {
        return [
            { label: '', value: '' },
            { label: 'Book 1', value: 'Book 1' },
            { label: 'Book A', value: 'Book A' }
        ]
    }

    get includedNotIncluded() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
        ];
    }

    getOliAndMetadata() {
        getClientdata({ recId: this.recordid })
            .then(result => {
                this.flexOptionValuesOptions =[];
                for (let i in result.pickListValuesList) {
                if (result.pickListValuesList[i] !== undefined) {
                    if (i === '0') {
                        this.flexOptionValuesOptions.push({ 'label': "", 'value': "" });
                    }
                    this.flexOptionValuesOptions.push({ 'label': result.pickListValuesList[i] , 'value': result.pickListValuesList[i]});
                }
            }
                
                this.listApplCustomList = result.sccHoverHelp[0]['List_any_applicable_customization__c'].split(';');
                this.indicateVendorList = result.sccHoverHelp[0]['Indicate_Vendor__c'].split(';');
                this.providePlanCdeList = result.sccHoverHelp[0]['Provide_plan_code_in_text_box__c'].split(';');

                for (let i in result.OppolineItemsList) {
                    this.productNameList.push(result.OppolineItemsList[i]['Product2']['Name']);
                }

                for (let i in this.productNameList) {
                    if (this.listApplCustomList.includes(this.productNameList[i])) {
                        this.isListApplCustomTrue = true;
                        this.isDispStdCustTrue = true;
                    }
                    else if (this.indicateVendorList.includes(this.productNameList[i])) {
                        this.isindicateVendorTrue = true;
                        this.isDispCarveInOutTrue = true;
                    }
                    else if (this.providePlanCdeList.includes(this.productNameList[i])) {
                        this.isprovidePlanCdeTrue = true;
                    }
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
    //--------------------------------SAMARTH SCC 2021--------------------------------

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;
    }

    level2ChangeHandler(event) {
        let editedRecordId = event.target.dataset.id;
        let editedRecord;

        if (event.target.dataset.prod == 'medical') {
            for (let i in this.medicalrecords) {
                for (let j in this.medicalrecords[i]['value']) {
                    if (editedRecordId == this.medicalrecords[i]['value'][j]['Id']) {
                        editedRecord = Object.assign({}, this.medicalrecords[i]['value'][j]);
                        editedRecord[event.target.name] = event.target.value;
                    }
                }
            }
        }

        if (event.target.dataset.prod == 'dental') {
            for (let i in this.dentalrecordsList) {
                if (editedRecordId == this.dentalrecordsList[i]['Id']) {
                    editedRecord = Object.assign({}, this.dentalrecordsList[i]);
                    editedRecord[event.target.name] = event.target.value;
                }
            }
        }


        if (event.target.dataset.prod == 'vision') {
            for (let i in this.visionrecordList) {
                if (editedRecordId == this.visionrecordList[i]['Id']) {
                    editedRecord = Object.assign({}, this.visionrecordList[i]);
                    editedRecord[event.target.name] = event.target.value;
                }
            }
        }

        if (this.updatedOtherProducts.length === 0) {
            this.updatedOtherProducts.push(editedRecord);
        }
        else {
            let flag = false;
            for (let i in this.updatedOtherProducts) {
                let opplineitemJson = Object.assign({}, this.updatedOtherProducts[i]);
                if (opplineitemJson.Id === editedRecord['Id']) {
                    this.updatedOtherProducts[i][event.target.name] = event.target.value;
                    flag = true;
                }
            }
            if (flag == false) {
                this.updatedOtherProducts.push(editedRecord);
            }
        }
    }

    moveToActiveSection() {

    }

    @track  editfielddetails = [];
    FieldChangeHandler(event) {
        //console.log('Inside FieldChangeHandler');

        if (event.target.name == 'Sold_Case_Checklist__c.Virtual_Visits__c') {
            if (event.target.value == 'Opt Out') {
                this.showUhcVirtualVisitsWriteIn = true;
            }
            else {
                this.showUhcVirtualVisitsWriteIn = false;
                this.soldCaseDataCopy['UHC_Virtual_Visits_Write_In__c'] = '';

                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.UHC_Virtual_Visits_Write_In__c',
                    fieldvalue: ''
                });
            }
        }

        if (event.target.name == 'Sold_Case_Checklist__c.Medical_Necessity__c') {
            if (event.target.value == 'Yes') {

                this.showMedNecSection = true;
                setTimeout(function () {
                    const newInstance = JSON.parse(JSON.stringify(this.activeSections))
                    const accordion = this.template.querySelector('.productAccordian');
                    accordion.activeSectionName = newInstance;
                }.bind(this), 200);


            }
            else {
                this.showMedNecSection = false;

                this.soldCaseDataCopy['Genetic_Testing_Prior_Authorization__c'] = '';
                this.soldCaseDataCopy['Inflammatory_Medication_Site_of_Care__c'] = '';
                this.soldCaseDataCopy['Functional_Endoscopic_Sinus_Surgery_FESS__c'] = '';
                this.soldCaseDataCopy['Hysterectomy__c'] = '';
                this.soldCaseDataCopy['Sinuplasty__c'] = '';

                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Genetic_Testing_Prior_Authorization__c',
                    fieldvalue: ''
                },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Inflammatory_Medication_Site_of_Care__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Functional_Endoscopic_Sinus_Surgery_FESS__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hysterectomy__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Sinuplasty__c',
                        fieldvalue: ''
                    }
                );

            }
        }

        if (event.target.name == 'Sold_Case_Checklist__c.Payment_Integrity__c') {
            if (event.target.value.length === 0) {
                this.showPayIntFields = false;
            }
            else {
                this.showPayIntFields = true;
            }

            //----------------PAYMENT INTEGRITY FINAL FEEDBACK----------------
            if (event.target.value == 'Option 1 (Current Standard)' ||
                event.target.value == 'Option 2 (Additional Revenue)' || 
                event.target.value == 'Option 3 (Option 2 + COB)') {
                this.prevOption123 = true;
                this.option123 = false;
                this.option7 = false;
                this.option456 = false;
            }
            if (event.target.value == 'Simplified Option 1' ||
                event.target.value == 'Simplified Option 2' || 
                event.target.value == 'Simplified Option 3' ||
                event.target.value == 'Simplified Non-Standard' ||
                event.target.value == 'Blackstone Equity Health 2025') {
                this.prevOption123 = false;
                this.option123 = true;
                this.option7 = false;
                this.option456 = false;
               
            }
            if (event.target.value == 'Equity Healthcare') {
                this.prevOption123 = false;
                this.option7 = true;
                this.option123 = false;
                this.option456 = false;
            }
            if (event.target.value == 'Legacy Option 1' ||
                event.target.value == 'Legacy Option 2' ||
                event.target.value == 'Legacy Option 3' ||
                event.target.value == 'Legacy Non-Standard') {
                this.prevOption123 = false;
                this.option123 = false;
                this.option7 = false;
                this.option456 = true;
                if(this.cmType){
                    this.onlyOption456 =true;
                }
                else if(event.target.value == 'Legacy Non-Standard'){
                    this.onlyOption456 =true;
                }else{
                    this.onlyOption456 =false;
                }
            }
            //----------------PAYMENT INTEGRITY FINAL FEEDBACK----------------

            //-----RESET SUB PICKLIST ON CHANGE OF PAYMENT INTEGRITY PICKLIST AND ADD TO EDIT FIELD LIST-----
            if (event.target.value == 'Simplified Option 1' || event.target.value == 'Simplified Option 2' || event.target.value == 'Simplified Option 3'
                || event.target.value == 'Simplified Non-Standard' || event.target.value == 'Blackstone Equity Health 2025') {
                setTimeout(() => {
                    this.template.querySelectorAll('.refreshValueOnChangeSO').forEach(element => {
                        element.value = 'Included';
                    });
                }, 300);

                this.editfielddetails.push(
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Pre_Pay__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Post_Pay__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Subrogation__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Prospective_Payment_Revi__c',
                        fieldvalue: ''
                    },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.EDC_Analyzer__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit__c',
                            fieldvalue: ''
                        },
                        // {
                        //     fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Vendor__c',
                        //     fieldvalue: ''
                        // },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Credit_Balance_Recovery_Services__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Recovery_Subro__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Recovery_ICC__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recovery__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_and_Validation_Audit__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.COB_Vendor_Recoveries__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Hospital_Audit_Program__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Subrogation__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Injury_Coverage_Coordination__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.EDC_Analyzer_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Percentage__c',
                            fieldvalue: ''
                        },
                        // {
                        //     fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Vendor_Percentage__c',
                        //     fieldvalue: ''
                        // },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Credit_Blnce_Recvry_Services_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Subro_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Third_Party_ICC_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recvry_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Validation_Audit_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.COB_Vendor_Recoveries_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Hospital_Audit_Program_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Thrd_Prty_Liability_Subrgatin_Percentage__c',
                            fieldvalue: ''
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Injury_Coverage_Coordination_Percentage__c',
                            fieldvalue: ''
                        });
            }
            if (event.target.value == 'Legacy Option 1' || event.target.value == 'Legacy Option 2' || event.target.value == 'Legacy Option 3'
                || event.target.value == 'Legacy Non-Standard') {
                setTimeout(() => {
                    this.template.querySelectorAll('.refreshValueOnChange').forEach(element => {
                        element.value = 'Included';
                    });
                }, 300);

                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Prospective_Payment_Revi__c',
                    fieldvalue: 'Included'
                },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.EDC_Analyzer__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit__c',
                        fieldvalue: 'Included'
                    },
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Vendor__c',
                    //     fieldvalue: 'Included'
                    // },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Credit_Balance_Recovery_Services__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Recovery_Subro__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Recovery_ICC__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recovery__c',
                        fieldvalue: 'Included'
                    },
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_and_Validation_Audit__c',
                    //     fieldvalue: 'Included'
                    // },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.COB_Vendor_Recoveries__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Audit_Program__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Subrogation__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Injury_Coverage_Coordination__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recvry_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.COB_Vendor_Recoveries_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Audit_Program_Percentage__c',
                        fieldvalue: ''
                    },
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                    //     fieldvalue: ''
                    // },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Thrd_Prty_Liability_Subrgatin_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Injury_Coverage_Coordination_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Pre_Pay_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Post_Pay_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Subrogation_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Pre_Pay__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Post_Pay__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Subrogation__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Validation_Audit_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Credit_Blnce_Recvry_Services_Percentage__c',
                        fieldvalue: ''
                    });
            }

            if (event.target.value == 'Simplified Option 1' || event.target.value == 'Simplified Option 2' || event.target.value == 'Simplified Option 3' ||  event.target.value == 'Blackstone Equity Health 2025') {
            this.legacy12 = false;
            this.simplified12 = true;
            setTimeout(() => {
                this.template.querySelector('.prePay').value = '30.00';
                this.template.querySelector('.postPay').value = '30.00';
                this.template.querySelector('.subro').value = '33.30';
                this.template.querySelector('.coOrdBenSO').value = '0.00';
            }, 300);

            this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Pre_Pay_Percentage__c',
                    fieldvalue: '30.00'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Post_Pay_Percentage__c',
                    fieldvalue: '30.00'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Subrogation_Percentage__c',
                    fieldvalue: '33.30'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits_Percentage__c',
                    fieldvalue: '0.00'
                });
            }
            if (event.target.value == 'Simplified Option 1') {
                this.simplified1Only = true;
                setTimeout(() => {
                    this.template.querySelector('.prePay').value = '22.00';
                    this.template.querySelector('.postPay').value = '22.00';
                    this.template.querySelector('.claimTrk').value = '';
                    this.template.querySelector('.clmTrk').value = '';
                    this.template.querySelector('.claimTrk').disabled = false;
                    this.template.querySelector('.clmTrk').disabled = false;
                }, 300);
    
                this.editfielddetails.push({
                        fieldedited: 'Sold_Case_Checklist__c.Pre_Pay_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Post_Pay_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_and_Validation_Audit__c',
                        fieldvalue: ''
                    });
            }else{
                this.simplified1Only = false;
            }
            if (event.target.value == 'Simplified Option 3') {
                setTimeout(() => {
                    this.template.querySelector('.coOrdBenSO').value = '30.00';
                    this.template.querySelector('.refreshValueOnChangeCB').value = 'Enhanced COB';
                }, 300);
                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits_Percentage__c',
                    fieldvalue: '30.00'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits__c',
                    fieldvalue: 'Enhanced COB'
                });
            }
            if (event.target.value == 'Simplified Non-Standard') {
                this.simplified12 = false;
                setTimeout(() => {
                    this.template.querySelector('.prePay').value = '';
                    this.template.querySelector('.postPay').value = '';
                    this.template.querySelector('.subro').value = '';
                    this.template.querySelector('.coOrdBenSO').value = '';
                    this.template.querySelector('.claimTrk').value = '';
                    this.template.querySelector('.refreshValueOnChangeCB').value = '';
                    this.template.querySelectorAll('.refreshValueOnChangeSO').forEach(element => {
                        element.value = '';
                    });
                }, 300);
                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Pre_Pay_Percentage__c',
                    fieldvalue: ''
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Post_Pay_Percentage__c',
                    fieldvalue: ''
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Subrogation_Percentage__c',
                    fieldvalue: ''
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits_Percentage__c',
                    fieldvalue: ''
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                    fieldvalue: ''
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_and_Validation_Audit__c',
                    fieldvalue: ''
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Pre_Pay__c',
                    fieldvalue: ''
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Post_Pay__c',
                    fieldvalue: ''
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Subrogation__c',
                    fieldvalue: ''
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits__c',
                    fieldvalue: ''
                });
            }

            if (event.target.value == 'Legacy Option 1' || event.target.value == 'Legacy Option 2' || event.target.value == 'Legacy Option 3') {
                this.legacy12 = true;
                this.legacy12claim = true;
                setTimeout(() => {
                    this.template.querySelector('.payPol').value = '0.00';
                    this.template.querySelector('.coOrdBen').value = '0.00';
                    this.template.querySelector('.prosFraud').value = '30.00';
                    this.template.querySelector('.retroFraud').value = '30.00';
                    this.template.querySelector('.enhanFraud').value = '30.00';
                    this.template.querySelector('.edcAnlzr').value = '30.00';
                    this.template.querySelector('.itemBill').value = '30.00';
                    this.template.querySelector('.focClaim').value = '30.00';
                    this.template.querySelector('.hospOptum').value = '30.00';
                    // this.template.querySelector('.hospVendor').value = '30.00';
                    this.template.querySelector('.credBal').value = '30.00';
                    this.template.querySelector('.tpSubro').value = '33.30';
                    this.template.querySelector('.tpIcc').value = '33.30';
                    this.template.querySelector('.advRec').value = '30.00';
                    if(this.cmType)
                    this.template.querySelector('.claimTrk').value = '0.00';
                }, 300);

                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Percentage__c',
                    fieldvalue: '0.00'
                },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits_Percentage__c',
                        fieldvalue: '0.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse_Percentage__c',
                        fieldvalue: '30.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse_Percentage__c',
                        fieldvalue: '30.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD_Percentage__c',
                        fieldvalue: '30.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.EDC_Analyzer_Percentage__c',
                        fieldvalue: '30.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review_Percentage__c',
                        fieldvalue: '30.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review_Percentage__c',
                        fieldvalue: '30.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Percentage__c',
                        fieldvalue: '30.00'
                    },
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Vendor_Percentage__c',
                    //     fieldvalue: '30.00'
                    // },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Credit_Blnce_Recvry_Services_Percentage__c',
                        fieldvalue: '30.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Subro_Percentage__c',
                        fieldvalue: '33.30'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_ICC_Percentage__c',
                        fieldvalue: '33.30'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recvry_Percentage__c',
                        fieldvalue: '30.00'
                    });
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                    //     fieldvalue: '0.00'
                    // }
                    
            }

            if (event.target.value == 'Legacy Option 1') {
                this.legacy12 = true;
                this.legacy12claim = true;
                setTimeout(() => {
                    this.template.querySelector('.prosFraud').value = '0.00';
                    this.template.querySelector('.retroFraud').value = '22.00';
                    this.template.querySelector('.enhanFraud').value = '22.00';
                    this.template.querySelector('.edcAnlzr').value = '22.00';
                    this.template.querySelector('.itemBill').value = '22.00';
                    this.template.querySelector('.focClaim').value = '22.00';
                    this.template.querySelector('.hospOptum').value = '22.00';
                    // this.template.querySelector('.hospVendor').value = '22.00';
                    this.template.querySelector('.credBal').value = '10.00';
                    this.template.querySelector('.tpSubro').value = '33.30';
                    this.template.querySelector('.tpIcc').value = '33.30';
                    this.template.querySelector('.advRec').value = '24.00';
                    // if(this.cmType)
                    //     this.template.querySelector('.claimTrk').value = '0.00';
                }, 300);

                this.editfielddetails.push(
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse_Percentage__c',
                        fieldvalue: '0.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.EDC_Analyzer_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Vendor_Percentage__c',
                    //     fieldvalue: '22.00'
                    // },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Credit_Blnce_Recvry_Services_Percentage__c',
                        fieldvalue: '10.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recvry_Percentage__c',
                        fieldvalue: '24.00'
                    });
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                    //     fieldvalue: '0.00'
                    // }
                    // );
            }

            
            if (event.target.value == 'Legacy Option 1' || event.target.value == 'Legacy Option 2' || event.target.value == 'Simplified Option 1' || event.target.value == 'Simplified Option 2' ||  event.target.value == 'Blackstone Equity Health 2025') {
                setTimeout(() => {
                    this.template.querySelector('.refreshValueOnChangeCB').value = 'COB Lite';
                }, 300);
                this.editfielddetails.push(
                {
                    fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits__c',
                    fieldvalue: 'COB Lite'
                }
                );
            }

            if (this.cmType && (event.target.value == 'Legacy Option 1' || event.target.value == 'Legacy Option 2' || event.target.value == 'Legacy Option 3')) {
                if(event.target.value == 'Legacy Option 1' ){
                    setTimeout(() => {
                    this.template.querySelector('.claimTrk').value = '';
                    this.template.querySelector('.clmTrk').value = '';
                    this.template.querySelector('.claimTrk').disabled = false;
                    this.template.querySelector('.clmTrk').disabled = false;
                    
                }, 300);
                this.editfielddetails.push(
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_and_Validation_Audit__c',
                        fieldvalue: ''
                    }
                );
                }else{
                    setTimeout(() => {
                       // this.template.querySelector('.claimTrk').value = '';
                        //this.template.querySelector('.clmTrk').value = '';
                        this.template.querySelector('.claimTrk').disabled = true;
                        this.template.querySelector('.clmTrk').disabled = true;
                        
                    }, 300);
                    this.editfielddetails.push(
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                            fieldvalue: '0'
                        },
                        {
                            fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_and_Validation_Audit__c',
                            fieldvalue: 'Included'
                        }
                    );
                }
            }

            if (event.target.value == 'Legacy Option 3') {
                setTimeout(() => {
                    this.template.querySelector('.coOrdBen').value = '30.00';
                    this.template.querySelector('.refreshValueOnChangeCB').value = 'Enhanced COB';
                }, 300);
                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits_Percentage__c',
                    fieldvalue: '30.00'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits__c',
                    fieldvalue: 'Enhanced COB'
                });
            }
            
            if (event.target.value == 'Legacy Non-Standard') {
                this.legacy12 = false;
                this.legacy12claim = false;
                setTimeout(() => {
                    this.template.querySelector('.refreshValueOnChangeCB').value = '';
                    this.template.querySelectorAll('.refreshValueOnChange').forEach(element => {
                        element.value = '';
                    });
                    this.template.querySelector('.payPol').value = '0.00';
                    this.template.querySelector('.payPol').disabled = true;
                    this.template.querySelector('.payPolSts').disabled = true;
                    this.template.querySelector('.coOrdBen').value = '';
                    this.template.querySelector('.prosFraud').value = '';
                    this.template.querySelector('.retroFraud').value = '';
                    this.template.querySelector('.prosFraudSts').disabled = true;
                    this.template.querySelector('.retroFraudSts').disabled = true;
                    this.template.querySelector('.enhanFraud').value = '';
                    this.template.querySelector('.edcAnlzr').value = '';
                    this.template.querySelector('.edcAnlzrSts').disabled = true;
                    this.template.querySelector('.itemBill').value = '';
                    this.template.querySelector('.focClaim').value = '';
                    this.template.querySelector('.hospOptum').value = '';
                    // this.template.querySelector('.hospVendor').value = '';
                    this.template.querySelector('.credBal').value = '';
                    this.template.querySelector('.hospOptumSts').disabled = true;
                    this.template.querySelector('.credBalSts').disabled = true;
                    this.template.querySelector('.tpSubro').value = '';
                    this.template.querySelector('.tpIcc').value = '';
                    this.template.querySelector('.advRec').value = '';
                    this.template.querySelector('.claimTrk').value = '';
                    this.template.querySelector('.payPolSts').value = 'Included';
                    this.template.querySelector('.prosFraudSts').value = 'Included';
                    this.template.querySelector('.retroFraudSts').value = 'Included';
                    this.template.querySelector('.hospOptumSts').value = 'Included';
                    this.template.querySelector('.credBalSts').value = 'Included';
                    this.template.querySelector('.edcAnlzrSts').value = 'Included'; 
                }, 300);
    
                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Percentage__c',
                    fieldvalue: '0.00'
                },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.EDC_Analyzer_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Credit_Blnce_Recvry_Services_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Subro_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_ICC_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recvry_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Prospective_Payment_Revi__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.EDC_Analyzer__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Credit_Balance_Recovery_Services__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Recovery_Subro__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Recovery_ICC__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recovery__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_and_Validation_Audit__c',
                        fieldvalue: ''
                    }
                );
            }

            if (event.target.value == 'Equity Healthcare') {
                setTimeout(() => {
                    this.template.querySelectorAll('.refreshValueOnChange').forEach(element => {
                        element.value = 'Included';
                    });
                }, 300);
                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Prospective_Payment_Revi__c',
                    fieldvalue: 'Included'
                },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Credit_Balance_Recovery_Services__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recovery__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.COB_Vendor_Recoveries__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Audit_Program__c',
                        fieldvalue: 'Included'
                    },
                    /* {
                      fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_and_Validation_Audit__c',
                      fieldvalue: 'Included'
                    }, */
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Validation_Audit__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Subrogation__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Injury_Coverage_Coordination__c',
                        fieldvalue: 'Included'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit__c',
                        fieldvalue: ''
                    },
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Vendor__c',
                    //     fieldvalue: ''
                    // },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Recovery_Subro__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Recovery_ICC__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Pre_Pay__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Post_Pay__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Subrogation__c',
                        fieldvalue: ''
                    });
            }

            if (event.target.value == 'Equity Healthcare') {
                setTimeout(() => {
                    this.template.querySelector('.payPol4').value = '0.00';
                    this.template.querySelector('.cob4').value = '0.00';
                    this.template.querySelector('.credBalRec4').value = '10.00';
                    this.template.querySelector('.advRec4').value = '20.00';
                    this.template.querySelector('.cobVend4').value = '20.00';
                    this.template.querySelector('.enhanFraud4').value = '22.00';
                    this.template.querySelector('.focClaim4').value = '22.00';
                    this.template.querySelector('.hospAud4').value = '22.00';
                    this.template.querySelector('.claimTrack4').value = '22.00';
                    this.template.querySelector('.valAud4').value = '22.00';
                    this.template.querySelector('.thirdParty4').value = '25.00';
                    this.template.querySelector('.injCov4').value = '33.30';
                }, 300);

                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Percentage__c',
                    fieldvalue: '0.00'
                },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits_Percentage__c',
                        fieldvalue: '0.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Credit_Blnce_Recvry_Services_Percentage__c',
                        fieldvalue: '10.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recvry_Percentage__c',
                        fieldvalue: '20.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.COB_Vendor_Recoveries_Percentage__c',
                        fieldvalue: '20.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Audit_Program_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    /* {
                      fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                      fieldvalue: '22.00'
                    }, */
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Validation_Audit_Percentage__c',
                        fieldvalue: '22.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Thrd_Prty_Liability_Subrgatin_Percentage__c',
                        fieldvalue: '25.00'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Injury_Coverage_Coordination_Percentage__c',
                        fieldvalue: '33.30'
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Percentage__c',
                        fieldvalue: ''
                    },
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Vendor_Percentage__c',
                    //     fieldvalue: ''
                    // },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Subro_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_ICC_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Pre_Pay_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Post_Pay_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Subrogation_Percentage__c',
                        fieldvalue: ''
                    });
            }

            if (event.target.value.length == 0) {
                this.soldCaseDataCopy['Payment_Policy_Prospective_Payment_Revi__c'] = '';
                this.soldCaseDataCopy['Coordination_of_Benefits__c'] = '';
                this.soldCaseDataCopy['Prospective_Fraud_Abuse__c'] = '';
                this.soldCaseDataCopy['Retrospective_Fraud_Abuse__c'] = '';
                this.soldCaseDataCopy['Enhanced_Fraud_Abuse_CCD__c'] = '';
                this.soldCaseDataCopy['Itemized_Bill_Review__c'] = '';
                this.soldCaseDataCopy['Focused_Claim_Review__c'] = '';
                this.soldCaseDataCopy['Hospital_Bill_Audit__c'] = '';
                // this.soldCaseDataCopy['Hospital_Bill_Audit_Vendor__c'] = '';
                this.soldCaseDataCopy['Credit_Balance_Recovery_Services__c'] = '';
                this.soldCaseDataCopy['Third_Party_Liability_Recovery_Subro__c'] = '';
                this.soldCaseDataCopy['Third_Party_Liability_Recovery_ICC__c'] = '';
                this.soldCaseDataCopy['Pre_Pay__c'] = '';
                this.soldCaseDataCopy['Post_Pay__c'] = '';
                this.soldCaseDataCopy['Subrogation__c'] = '';
                this.soldCaseDataCopy['Advanced_Analytics_and_Recovery__c'] = '';
                this.soldCaseDataCopy['COB_Vendor_Recoveries__c'] = '';
                this.soldCaseDataCopy['Hospital_Audit_Program__c'] = '';
                this.soldCaseDataCopy['Claims_Tracking_and_Validation_Audit__c'] = '';
                this.soldCaseDataCopy['Claims_Tracking__c'] = '';
                this.soldCaseDataCopy['Validation_Audit__c'] = '';
                this.soldCaseDataCopy['Third_Party_Liability_Subrogation__c'] = '';
                this.soldCaseDataCopy['Injury_Coverage_Coordination__c'] = '';
                this.soldCaseDataCopy['EDC_Analyzer__c'] = '';

                this.soldCaseDataCopy['Pre_Pay_Percentage__c'] = '';
                this.soldCaseDataCopy['Post_Pay_Percentage__c'] = '';
                this.soldCaseDataCopy['Subrogation_Percentage__c'] = '';
                this.soldCaseDataCopy['Payment_Policy_Percentage__c'] = '';
                this.soldCaseDataCopy['Coordination_of_Benefits_Percentage__c'] = '';
                this.soldCaseDataCopy['Prospective_Fraud_Abuse_Percentage__c'] = '';
                this.soldCaseDataCopy['Retrospective_Fraud_Abuse_Percentage__c'] = '';
                this.soldCaseDataCopy['Enhanced_Fraud_Abuse_CCD_Percentage__c'] = '';
                this.soldCaseDataCopy['Itemized_Bill_Review_Percentage__c'] = '';
                this.soldCaseDataCopy['Focused_Claim_Review_Percentage__c'] = '';
                this.soldCaseDataCopy['Hospital_Audit_Program_Percentage__c'] = '';
                this.soldCaseDataCopy['Hospital_Bill_Audit_Percentage__c'] = '';
                this.soldCaseDataCopy['Credit_Blnce_Recvry_Services_Percentage__c'] = '';
                this.soldCaseDataCopy['Third_Party_Liability_Subro_Percentage__c'] = '';
                this.soldCaseDataCopy['Third_Party_ICC_Percentage__c'] = '';

                this.soldCaseDataCopy['Advanced_Analytics_and_Recvry_Percentage__c'] = '';
                this.soldCaseDataCopy['COB_Vendor_Recoveries_Percentage__c	'] = '';
                // this.soldCaseDataCopy['Hospital_Bill_Audit_Vendor_Percentage__c'] = '';
                this.soldCaseDataCopy['Claim_Trcking_Validation_Audt_Percentage__c'] = '';
                this.soldCaseDataCopy['Claims_Tracking_Percentage__c'] = '';
                this.soldCaseDataCopy['Validation_Audit_Percentage__c'] = '';
                this.soldCaseDataCopy['Thrd_Prty_Liability_Subrgatin_Percentage__c'] = '';
                this.soldCaseDataCopy['Injury_Coverage_Coordination_Percentage__c'] = '';
                this.soldCaseDataCopy['EDC_Analyzer_Percentage__c'] = '';

               this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Prospective_Payment_Revi__c',
                    fieldvalue: ''
                },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Pre_Pay__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Post_Pay__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Subrogation__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.EDC_Analyzer__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit__c',
                        fieldvalue: ''
                    },
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Vendor__c',
                    //     fieldvalue: ''
                    // },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Credit_Balance_Recovery_Services__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Recovery_Subro__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Recovery_ICC__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recovery__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.COB_Vendor_Recoveries__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Audit_Program__c',
                        fieldvalue: ''
                    },
                    {
                      fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_and_Validation_Audit__c',
                      fieldvalue: ''
                    }, 
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Validation_Audit__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Subrogation__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Injury_Coverage_Coordination__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Advanced_Analytics_and_Recvry_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                      fieldedited: 'Sold_Case_Checklist__c.Claim_Trcking_Validation_Audt_Percentage__c',
                      fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Claims_Tracking_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Validation_Audit_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.COB_Vendor_Recoveries_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Coordination_of_Benefits_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Credit_Blnce_Recvry_Services_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Enhanced_Fraud_Abuse_CCD_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.EDC_Analyzer_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Focused_Claim_Review_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Audit_Program_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Percentage__c',
                        fieldvalue: ''
                    },
                    // {
                    //     fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit_Vendor_Percentage__c',
                    //     fieldvalue: ''
                    // },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Injury_Coverage_Coordination_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Itemized_Bill_Review_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_ICC_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Third_Party_Liability_Subro_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Thrd_Prty_Liability_Subrgatin_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Pre_Pay_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Post_Pay_Percentage__c',
                        fieldvalue: ''
                    },
                    {
                        fieldedited: 'Sold_Case_Checklist__c.Subrogation_Percentage__c',
                        fieldvalue: ''
                    }
                );
            }

            //-----RESET SUB PICKLIST ON CHANGE OF PAYMENT INTEGRITY PICKLIST AND ADD TO EDIT FIELD LIST-----

            this.currentPayIntVal = event.target.value;

        }

        let selectedrecords = {};
        let selectedname = event.target.name;
        selectedrecords[selectedname] = event.target.value;
        this.Clientdatarecord = selectedrecords;


        //console.log('Inside FieldChangeHandler ' + JSON.stringify(this.editfielddetails));
        this.editfielddetails.push({
            fieldedited: event.target.name,
            fieldvalue: event.target.value
        });

        const ClientDetailRecord = new CustomEvent("progressvaluechange", {
            detail: this.editfielddetails
        });
        this.dispatchEvent(ClientDetailRecord);
    }

    handleChildProgressValueChange(event) {
        this.editfielddetails = [...this.editfielddetails, ...event.detail];

        const clientDetailRecord = new CustomEvent('progressvaluechange', {
            detail: this.editfielddetails
        });
        this.dispatchEvent(clientDetailRecord);
    }

    // displayheaderevent(event){
    //     this.isSurestSoldOther = event.detail.isSurestSoldOther;
    //     this.isTradSoldOther = event.detail.isTradSoldOther;
    // }

    opplineupdatedata(event) {
        let updatedArr = [];
        //let opplinerecords = [...this.opplineitems];
        let opplinerecordsArr = [];

        //console.log('Data receieved '+ JSON.stringify(event.detail));
        //console.log('this.updatedOtherProducts.length '+ this.updatedOtherProducts.length);

        if (this.updatedOtherProducts.length === 0) {
            console.log(`Inside if`);
            this.updatedOtherProducts.push(event.detail[0].record);
        }
        else {
            console.log(`Inside else`);
            let recordExists = false;
            for (let i in this.updatedOtherProducts) {
                console.log(`Inside for`);
                let opplineitemJson = Object.assign({}, this.updatedOtherProducts[i]);
                if (opplineitemJson.Id === event.detail[0].record.Id) {
                    console.log(`Inside for if`);
                    recordExists = true;
                    opplineitemJson = event.detail[0].record;
                    //-----------------scc change varun -----------//
                    this.updatedOtherProducts[i] = event.detail[0].record;
                    //-----------------scc change varun -----------//
                }
            }

            if (!recordExists) {
                this.updatedOtherProducts.push(event.detail[0].record);
            }
        }
        //console.log('this.updatedOtherProducts.length '+ JSON.stringify(this.updatedOtherProducts));
        this.opplineitemcopy = opplinerecordsArr;
    }

    //this method is called in soldCheckMainComp on save
    @api updateOppline() {
        let opplinedateupdate = [];
        console.log('this.updatedOtherProducts ' + JSON.stringify(this.updatedOtherProducts));

        this.updatedOtherProducts.forEach((prods) => {
            if (prods.Product_Line__c == 'Pharmacy' && prods.Level_2_Option__c != null && prods.Level_2_Option__c != undefined) {
                if (prods.Level_2_Option__c != 'Carve in - OptumRx') {
                    prods.ESP_Enhanced_Savings_Program_Opt_in__c = '';
                    prods.Price_Edge_Opt_in__c = '';
                    prods.Vital_Medication_program_Opt_in_Opt_out__c = '';
                    prods.My_ScriptRewards__c = '';
                    prods.If_Fully_Insured_include_quoted_Rx_plan__c = '';
                }

                if (prods.Level_2_Option__c != 'Carve out Flex - OptumRx' && prods.Level_2_Option__c != 'Carve out - OptumRx') {
                    prods.Pharmacy_Carve_Out_DropDown__c = ''
                }
            }
        })

        opplinedateupdate = this.updatedOtherProducts;

        return opplinedateupdate;
    }

    @api
    validateForm() {
        const validateOtherBuyupsComp = this.template.querySelector('c-sold-case-other-product');
        if (validateOtherBuyupsComp !== null && validateOtherBuyupsComp !== undefined) {
            return validateOtherBuyupsComp.validateForm();
        }
        return true;
    }



    renderedCallback() {
        if (this.editmode) {
            var v1 = this.template.querySelector('.virVis1');
            var v2 = this.template.querySelector('.virVis2');

            if (v1 !== null) {
                if (v1.value == 'Opt Out') {
                    v1.style = 'width:50%; float:left; ';
                    v2.style = 'width:50%; float:right;';
                }
                else {
                    v1.style = 'width:50%; float:right;';
                }
            }
            //this.onLoadPaymentIntegrity();
            if(this.soldCaseDataCopy.Payment_Integrity__c === 'Legacy Non-Standard'){
                if(this.currentPayIntVal == 'Legacy Non-Standard'){
                this.legacy12claim = false;
                setTimeout(() => {
                    this.template.querySelector('.payPol').value = '0.00';
                    this.template.querySelector('.payPol').disabled = true;
                    this.template.querySelector('.payPolSts').disabled = true;
                    this.template.querySelector('.prosFraudSts').disabled = true;
                    this.template.querySelector('.retroFraudSts').disabled = true;
                    this.template.querySelector('.edcAnlzrSts').disabled = true;
                    this.template.querySelector('.hospOptumSts').disabled = true;
                    this.template.querySelector('.credBalSts').disabled = true;
                    this.template.querySelector('.payPolSts').value = 'Included';
                    this.template.querySelector('.prosFraudSts').value = 'Included';
                    this.template.querySelector('.retroFraudSts').value = 'Included';
                    this.template.querySelector('.hospOptumSts').value = 'Included';
                    this.template.querySelector('.credBalSts').value = 'Included';
                    this.template.querySelector('.edcAnlzrSts').value = 'Included'; 
                }, 300);

                this.editfielddetails.push({
                    fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Percentage__c',
                    fieldvalue: '0.00'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Payment_Policy_Prospective_Payment_Revi__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Prospective_Fraud_Abuse__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Retrospective_Fraud_Abuse__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.EDC_Analyzer__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Hospital_Bill_Audit__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Credit_Balance_Recovery_Services__c',
                    fieldvalue: 'Included'
                })
            }
        }
        }

        if (this.template.querySelector('.section-header-style') === null || this.hasRendered === true) return;
        this.hasRendered = true;
        let style = document.createElement('style');
        style.innerText = `     
        .section-header-sub .slds-accordion__summary-heading{
            background-color: rgba(210, 223, 247, 0.7) !important;          
            font-size: 12px !important;           
        }
        .section-header-sub .slds-accordion__summary{
            margin-bottom: .5rem;
        }        
        .section-header-sub .slds-accordion__section{
            padding-bottom:0px;
        }
      
        .section-header .slds-accordion__summary-heading{
            background-color: hsla(219, 49%, 67%, 0.79);
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
      } 
    `;
        this.template.querySelector('.section-header-style').appendChild(style);
    }
}