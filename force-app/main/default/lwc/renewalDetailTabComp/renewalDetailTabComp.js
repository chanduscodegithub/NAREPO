import { LightningElement, api, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchOppLnItemsData from '@salesforce/apex/renewalChecklistCls.fetchOppLnItemsData';
import sceValidation from '@salesforce/apex/renewalChecklistCls.sceValidation';
import saveRenewalData from '@salesforce/apex/renewalChecklistCls.saveRenewalData';
import Operational_Performance from '@salesforce/schema/Renewal_Checklist__c.Operational_Performance__c';
import High_performing_network_Additional from '@salesforce/schema/Renewal_Checklist__c.High_performing_network_Additional__c';
import Renewal_Checklist from '@salesforce/schema/Renewal_Checklist__c';
import Renewal_Checklist_Detail_Instruction from '@salesforce/label/c.Renewal_Checklist_Detail_Instruction';
import Renewal_Checklist_Missing_Products from '@salesforce/label/c.Renewal_Checklist_Missing_Products';
import Renewal_Checklist_no_new_products from '@salesforce/label/c.Renewal_Checklist_no_new_products';
import Renewal_Checklist_no_terming_products from '@salesforce/label/c.Renewal_Checklist_no_terming_products';
import Renewal_Checklist_validation_note from '@salesforce/label/c.Renewal_Checklist_validation_note';
import Renewal_Checklist_Exit_additional_info from '@salesforce/label/c.Renewal_Checklist_Exit_additional_info';
import Renewal_Checklist_Additional_Information_instruction from '@salesforce/label/c.Renewal_Checklist_Additional_Information_instruction';
import getAccountMembershipPolicyDetailsOnAppletLoad from '@salesforce/apex/Medical_Membership_History_PolicyDetail.getAccountMembershipPolicyDetailsOnAppletLoad';
import getAccountMembershipPolicyDetailsOnAppletLoadSurest from '@salesforce/apex/Medical_Membership_History_Policy_Surest.getAccountMembershipPolicyDetailsOnAppletLoad';
//---------------------Payment Integrety-----------------------------------//
import Supplemental_Compensation_Payee from '@salesforce/schema/Renewal_Checklist__c.Supplemental_Compensation_Payee__c';
//---------------------Payment Integrety-----------------------------------//
import Cap_Type from '@salesforce/schema/Renewal_Checklist__c.Cap_Type__c';
import Cap_Category from '@salesforce/schema/Renewal_Checklist__c.Cap_Category__c';
import Amount_Type from '@salesforce/schema/Renewal_Checklist__c.Amount_Type__c';

export default class RenewalDetailTabComp extends NavigationMixin(LightningElement) {
    @api selectedSalesSeason;
    @api accRecordData;
    comboboxOptions = [];
    returnToSummary = {};
    oppRecId;
    isEdit = false;
    isPaymentIntegrity = false;
    @track renewalChecklistData;
    @track valuesToBackendObj = {};
    @track autoPopulateValue = {};
    isDisplayAdditional;
    additionalOptions = [];
    userName;
    apidate;
    apiname;
    apiValidated;
    oppData;
    accRecordId;
    showButtons = true;
    // showValidateButton = true;
    showNewProducts;
    showTermingProducts;
    showOpenMembership;
    oppPageUrl;
    existingProducts;
    termingProducts;
    openMembershipProducts;
    isLoading = true;
    showModal;
    clientManager;
    clientManagementConsultant;
    validatedBy;
    validatedDateTime;
    isExitEdit;
    oppId;
    createOppUrl;
    isCreateNewOpp;
    tmzShort;
    onLoad;
    showAllOpportunity;
    isEditChild = false;
    //---------------------Payment Integrety-----------------------------------//
    supplimentalCompensationPickListOptions = [];
    @track paymentPolicyOptions = [];
    paymentIntegBundlesOptions = [];
    claimsTrackingOptions = [];
    advancedAnalyticsOptions = [];
    @track tplRecoveryIccOptions = [];
    @track tplRecoveryOptions = [];
    @track focusedClaimOptions = [];
    @track itemizedBillOptions = [];
    @track enhancedFraudOptions = [];
    @track benifitOptions = [];
    SubrogationOptions = [];
    postPayOptions = [];
    prePayOptions = [];
    @track hospitalBillVendorOptions = [];
    @track hospitalBillOptumOptions = [];
    @track creditBalanceOptions = [];
    legecyOption123;
    nonStandardOptions;
    paymentIntegretyToBackend;
    isEquityHealthCare;
    @track filteredOptions = {};
    cobVendorOptions = [];
    hospitalAuditProgramOptions = [];
    claimsTrackingStatusOptions = [];
    validationAuditOptions = [];
    tpSubrogationOptions = [];
    injuryCoverageOptions = [];
    @track isEditPI =true;
    @track isEditPISurest =true;
    @track isEditPaymentSec=true;
    @track isEditBHS=true;
    @track isEditProd=false;
    @track isEditCPWSurest =true;
    @track BHSP1 = false;
    @track BHSP2 = false;
    @track BHSPName;
    @track includedOptOut = [
        { label: '', value: '' },
        { label: 'Included', value: 'Included' },
        { label: 'Opt out', value: 'Opt out' }
    ];
    @track isEditSurestAI = false;
    @track isEditAISec = true;
    @track accRec;
    @track CMSCE;
    @track VPCRRVP;
    @track showAISurestSec = false;
    @track serviceAmtRec;
    @track policyInfoRec;
    @track policyInfoNameSurest = '';
    @track policyInfoNumberSurest = '';
    @track CM;
    @track AA;
    @track AP;
    @track businessLine = '';
    @track placeHolderSC;
    @track placeHolderRx;
    @track placeHolderSBP;
    @track placeHolderBAV;
    @track placeHolderCSP;
    @track placeHolderSPC;
    @track showCPWSection = false;
    @track isEditNaviguard = true;
    @track isEditNaviguardProd = false;
    @track showSurestNaviguardSection = false;
    capTypeOptions = [];
    capCategoryOptions = [];
    amountTypeOptions = [];
   
    //---------------------Payment Integrety-----------------------------------//

    label = {
        Renewal_Checklist_Detail_Instruction,
        Renewal_Checklist_Missing_Products,
        Renewal_Checklist_no_new_products,
        Renewal_Checklist_no_terming_products,
        Renewal_Checklist_validation_note,
        Renewal_Checklist_Exit_additional_info,
        Renewal_Checklist_Additional_Information_instruction
    };


    connectedCallback() {
        console.log('this.accRecordData = ', JSON.stringify(this.accRecordData));
        this.accRecordId = this.accRecordData.accId;
        this.showAllOpportunity = this.accRecordData.showAllOpportunity;
        this.accRec = this.accRecordData.accRec;
        if(this.accRec){
            if(this.accRec.Subtype__c){
            if(this.accRec.Subtype__c == 'Surest Only'){
                this.businessLine = 'Surest Only';
            }else{
                if(this.accRec.Surest_Members__c>0){
                    this.businessLine = 'Dual';
                }
            }
            }
            if(this.accRec.Surest_Members__c>0){
                this.showAISurestSec = true;
                this.showCPWSection = true;
            }
            this.CMSCE = this.accRec?.CM_SCE__r?.Name ?? '';
            this.VPCRRVP = this.accRec?.CMVPCRRVP__r?.Name ?? '';
        }
        document.body.scrollTop = 0; document.documentElement.scrollTop = 0;
        window.addEventListener("beforeunload", this.beforeUnloadHandler);

        this.autoPopulateValue = {
            Calm_Health_app__c: 'Included',
            Case_Management__c: 'Included',
            National_Network_Outpatient_Inpatient_UM__c: 'Included',
            Behavioral_Health_Virtual_Visits__c: 'Included',
            Substance_Use_Disorder_Helpline__c: 'Included',
            Care_Explorer__c: 'Included',
            Family_Support__c: 'Included',
            X24_7_in_the_moment_and_crisis_support__c: 'Included',
            Enhanced_Case_Management__c: 'Included',
            Behavioral_Care_Connect_5_Day_Access__c: 'Included'
        }
        this.valuesToBackendObj = {...this.valuesToBackendObj,...this.autoPopulateValue};
        setTimeout(() => {
            this.handleDefaultValuesSave();
        }, 0);
        this.getOppLnItemsData();
        this.getaccPolicyDetails();
        this.getaccPolicyDetailsSurest();
    }
    beforeUnloadHandler(ev) {
        return "";
    }

    handleDefaultValuesSave() {
        this.valuesToBackendObj['Sales_Season__c'] = this.selectedSalesSeason;
        saveRenewalData({ valuesToBackend: this.valuesToBackendObj, accId: this.accRecordId, currentSS: this.selectedSalesSeason })
            .then((results) => {
                this.isLoading = false;
            })
            .catch((error) => {
                console.log('Error While Saving ---> ' + JSON.stringify(error));
                this.isLoading = false;
            })
    }

    @api
    get showValidateButton(){
        return !this.isEdit && !this.isEditChild;
    }

    renderedCallback() {
        refreshApex(this.oppData);
    }
    @wire(getObjectInfo, { objectApiName: Renewal_Checklist })
    renewalObjData;

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Operational_Performance })
    fetchPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.comboboxOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('Operational_Performance Error ---> ' + JSON.stringify(result.error));
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: High_performing_network_Additional })
    additionalPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.additionalOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
            //console.log('High_performing_network_Additional Error ---> ' + JSON.stringify(result.error));
        }
    }

    //---------------------Payment Integrety-----------------------------------//
    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Supplemental_Compensation_Payee })
    supplimentalCompensationPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.supplimentalCompensationPickListOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }

    //---------------------Payment Integrety-----------------------------------//

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Cap_Type })
    capTypePickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.capTypeOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Cap_Category })
    capCategoryPickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.capCategoryOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$renewalObjData.data.defaultRecordTypeId', fieldApiName: Amount_Type })
    amountTypePickList(result) {
        if (result.data) {
            for (let i in result.data.values) {
                this.amountTypeOptions.push({ "label": result.data.values[i].value, "value": result.data.values[i].value });
            }
        }
        else if (result.error) {
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading Picklist Values. Please contact your administrator',
            });
        }
    }
    // getting opp,opp ln item,renewal checklist data from controller.

    //---------------------Varun-----------------------------------//
    getOppLnItemsData() {
        fetchOppLnItemsData({ accId: this.accRecordId, showAllData: this.showAllOpportunity, currentSS: this.selectedSalesSeason })
            .then(data => {
                let tempdentalVisionProducts = [];
                let tempExistingProducts = [];
                let tempTermingProducts = [];
                let openMembership = [];
                let productLineArray = ["Medical", "Pharmacy", "Dental", "Vision", "Other"];
                let serviceAMT = [];
                let policyInfo = [];
                policyInfo = data.policyInfoList.length > 0 ? data.policyInfoList : '';
                serviceAMT = data.serviceAmt.length > 0 ? data.serviceAmt : '';
                openMembership = data.openMembership.length > 0 ? data.openMembership : '';
                this.renewalChecklistData = data.renewalCheckListData.length > 0 ? Object.assign({}, data.renewalCheckListData[0]) : {};

                if (data.detailExistingProductsList.length > 0) {
                    data.detailExistingProductsList.forEach(existing => {
                        tempExistingProducts.push(existing);
                    });
                }

                if (data.detailTermingProductsList.length > 0) {
                    data.detailTermingProductsList.forEach(terming => {
                        tempTermingProducts.push(terming);
                    });
                }

                this.timeZone(data.timeZone);

                if (this.renewalChecklistData.Renewal_Checklist_Validated_By__r) {
                    this.validatedBy = this.renewalChecklistData.Renewal_Checklist_Validated_By__r.Name;
                }
                else {
                    this.validatedBy = '';
                }

                if (this.renewalChecklistData.Renewal_Checklist_Validated_Date__c) {
                    let [date, time, ampm] = this.renewalChecklistData.Renewal_Checklist_Validated_Date__c.split(' ');
                    this.validatedDateTime = `${date} ${time} ${ampm} ${this.tmzShort}`;
                }
                else {
                    this.validatedDateTime = '';
                }
                //conditional display of  field in additional info section.
                if (this.renewalChecklistData != null && this.renewalChecklistData != undefined) {
                    if (this.renewalChecklistData.High_performing_network__c != null && this.renewalChecklistData.High_performing_network__c != undefined &&
                        this.renewalChecklistData.High_performing_network__c == "Yes") {
                        this.isDisplayAdditional = true;
                    }
                    else {
                        this.renewalChecklistData.High_performing_network_Additional__c == '';
                        this.isDisplayAdditional = false;
                    }
                }
                else {
                    this.isDisplayAdditional = false;
                }

                //sorting products
                tempExistingProducts.sort(function (a, b) {
                    return productLineArray.indexOf(a.Product_Line__c) - productLineArray.indexOf(b.Product_Line__c);
                });

                //sorting products
                tempTermingProducts.sort(function (a, b) {
                    return productLineArray.indexOf(a.Product_Line__c) - productLineArray.indexOf(b.Product_Line__c);
                });

                this.existingProducts = tempExistingProducts;
                this.termingProducts = tempTermingProducts;
                this.openMembershipProducts = openMembership;
                this.serviceAmtRec = serviceAMT;
                this.policyInfoRec = policyInfo;
                this.showNewProducts = this.existingProducts.length > 0 ? true : false;
                this.showTermingProducts = this.termingProducts.length > 0 ? true : false;
                this.showOpenMembership = this.openMembershipProducts.length > 0 ? true : false;
                this.onLoad = true;
                this.isLoading = false;
                for (let i in this.existingProducts) {
                    if(this.existingProducts[i].ProductCode == 'BH-BHSP1'){
                        this.BHSP1 = true;
                        this.BHSPName = this.existingProducts[i].Product2.Name;
                    }
                    if(this.existingProducts[i].ProductCode == 'BH-BHSP2'){
                        this.BHSP1 = true;
                        this.BHSP2 = true;
                        this.BHSPName = this.existingProducts[i].Product2.Name;
                    }
                    if((this.existingProducts[i].ProductCode == 'OON-NAVN' || this.existingProducts[i].ProductCode == 'OON-NAVP' || this.existingProducts[i].ProductCode == 'OON-PKGX') &&
                      (this.existingProducts[i].Buyup_Product_Selection__c == 'Surest & UNET' || this.existingProducts[i].Buyup_Product_Selection__c == 'Surest Only') && this.existingProducts[i].Sold_Retained_Members__c > 0){
                        this.showSurestNaviguardSection = true;
                    }
                }
                for (let rec of this.serviceAmtRec) {
                    switch (rec.Contact_Role__c) {
                        case 'Client Manager':
                            this.CM = rec.Name;
                            break;
                        case 'Surest Client Manager':
                            this.AA = rec.Name;
                            break;
                        case 'Surest Account Partner':
                            this.AP = rec.Name;
                            break;
                    }
                } 
                if(this.policyInfoRec){
                    let policyNumbers = [];
                    let policyNames = [];
                    for(let rec of this.policyInfoRec){
                        if (rec.Name) {
                            policyNumbers.push(rec.Name);
                        }
                        if (rec.Policy__c) {
                            policyNames.push(rec.Policy__c);
                        }
                    }
                    this.policyInfoNumberSurest = policyNumbers.join('; ');
                    this.policyInfoNameSurest = policyNames.join('; ');
                }               
                this.isEditPISurest =true;
                this.isEditCPWSurest = true;
                this.isEditPI =true;
                this.isEditPaymentSec =true;
                this.isEditBHS = true;
                this.isEditAISec = true;
                this.isEditNaviguard = true;
                //console.log('this.renewalChecklistData  ---> ' + JSON.stringify(this.renewalChecklistData));
            })
            .catch(error => {
                this.isEditPISurest =true;
                this.isEditCPWSurest =true;
                this.isEditPI =true;
                this.isEditPaymentSec =true;
                this.isEditAISec =true;
                console.log('error in Opp  ---> ' + JSON.stringify(error));
                const event = new ShowToastEvent({
                    variant: 'error',
                    title: 'ERROR',
                    message: 'Error loading data. Please contact your administrator',
                });
                this.dispatchEvent(event);
                this.isLoading = false;
            })
    }
    @track policyListRec;
    @track policyNumbers = '';
    getaccPolicyDetails(){
        getAccountMembershipPolicyDetailsOnAppletLoad({ accountId: this.accRecordId})
        .then(data => {
            let policyList = [];
            policyList = data.policyList.length > 0 ? data.policyList : '';     
            this.policyListRec = policyList;
            this.isLoading = false;
            if(this.policyListRec){
                let policyNumberArray = [];
                for(let i in this.policyListRec){
                    if (this.policyListRec[i].policyNumber) {
                        policyNumberArray.push(this.policyListRec[i].policyNumber);
                    }
                }
                this.policyNumbers = policyNumberArray.join('; ');
            }
        })
        .catch(error => {
            console.log('error in getaccPolicyDetails  ---> ' + JSON.stringify(error));
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading data. Please contact your administrator',
            });
            this.dispatchEvent(event);
            this.isLoading = false;
        })
    }

    @track policyListSurestRec;
    @track policyNumbersSurest = '';
    @track policyNamesSurest = '';
    getaccPolicyDetailsSurest(){
        getAccountMembershipPolicyDetailsOnAppletLoadSurest({ accountId: this.accRecordId})
        .then(data => {
            let policyList = [];
            policyList = data.policyList.length > 0 ? data.policyList : '';     
            this.policyListSurestRec = policyList;
            this.isLoading = false;
            if(this.policyListSurestRec){
                let policyNumberArray = [];
                let policyNameArray = [];
                for(let i in this.policyListSurestRec){
                    if (this.policyListSurestRec[i].policyNumber) {
                        policyNumberArray.push(this.policyListSurestRec[i].policyNumber);
                    }
                    if (this.policyListSurestRec[i].policyName) {
                        policyNameArray.push(this.policyListSurestRec[i].policyName);
                    }
                }
                this.policyNumbersSurest = policyNumberArray.join('; ');
                this.policyNamesSurest = policyNameArray.join('; ');
            }
        })
        .catch(error => {
            console.log('error in getaccPolicyDetailsSurest  ---> ' + JSON.stringify(error));
            const event = new ShowToastEvent({
                variant: 'error',
                title: 'ERROR',
                message: 'Error loading data. Please contact your administrator',
            });
            this.dispatchEvent(event);
            this.isLoading = false;
        })
    }
    //---------------------Varun-----------------------------------//

    // filterDataForJanuary(data) {
    //     return data.filter(item => {
    //         const effectiveDate = new Date(item.EffectiveDate__c);
    //         return effectiveDate.getMonth() === 0; 
    //     });
    // }

    // filterProductsForJanuary(products) {
    //     return products.filter(item => {
    //         const effectiveDate = new Date(item.Opportunity.EffectiveDate__c);
    //         return effectiveDate.getMonth() === 0; 
    //     });
    // }

    //common function for sce validation button and modal validation button.
    commonValidation() {
        this.isLoading = true;
        sceValidation({ accId: this.accRecordData.accId, showAllData: this.showAllOpportunity, currentSS: this.selectedSalesSeason })
            .then((results) => {
                const event = new ShowToastEvent({
                    title: 'Success',
                    message: this.accRecordData.accName + ' Validated',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);

                let sceData = {};
                results != null ? sceData.validatedData = results : sceData = '';
                this.existingProducts != null ? sceData.existingProducts = this.existingProducts : sceData = '';
                this.termingProducts != null ? sceData.termingProducts = this.termingProducts : sceData = '';

                const sendSceData = new CustomEvent('scedata', { detail: sceData });
                this.dispatchEvent(sendSceData);

                this.returnToSummary = { "activeTab": "Renewal Checklist" };
                const sendActiveTab = new CustomEvent('activetab', { detail: this.returnToSummary });
                this.dispatchEvent(sendActiveTab);
                this.isLoading = false;
            })
            .catch((error) => {
                //console.log('sceValidation  error----> ' + JSON.stringify(error));
                const event = new ShowToastEvent({
                    variant: 'error',
                    title: 'ERROR',
                    message: 'Error During Validation. Please contact your administrator',
                });
                this.dispatchEvent(event);
                this.isLoading = false;
            })
    }

    handleOppView(event) {
        this.oppId = event.target.dataset.oppid;
        if (this.isEdit == false) {
            this.oppPageUrl = '/' + this.oppId;
        }
        else {
            this.isExitEdit = true;
        }

    }

    handleNewOpp(event) {
        if (this.isEdit == false) {
            this[NavigationMixin.GenerateUrl]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Opportunity',
                    actionName: 'new',
                    accountId: this.accRecordData.accId
                },
                state: {
                    defaultFieldValues: 'accountId=' + this.accRecordData.accId
                }
            }).then(url => {
                this.createOppUrl = url;
            });
        }
        else {
            this.isCreateNewOpp = true;
            this.isExitEdit = true;
        }
    }

    handleReturn(event) {
        this.returnToSummary = {
            "activeTab": "Renewal Checklist"
        };
        const sendActiveTab = new CustomEvent('activetab', { detail: this.returnToSummary });
        this.dispatchEvent(sendActiveTab);
    }

    handleRefresh(event) {
        this.isLoading = true;
        refreshApex(this.oppData)
            .then(() => {
                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Refresh Successfull',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);

                this.isLoading = false;

            })
            .catch((error) => {
                //alert("Refresh Unsuccessfull "+JSON.stringify(error.message));
                const event = new ShowToastEvent({
                    title: 'ERROR',
                    message: "Refresh unsuccessfull. Please contact your administrator",
                    variant: 'error'
                });
                this.dispatchEvent(event);

            })
    }

    handleEdit(event) {
        //this.characterCounter(null, null);
        this.isLoading = true;
        this.isEdit = true;
        this.showButtons = false;
        this.isLoading = false;
        // this.showValidateButton = false;
        this.onLoadCharCount(this.renewalChecklistData);
        this.isEditPI =false;
        this.isEditPISurest=false;
        this.isEditCPWSurest=false;
        this.isEditBHS = false;
        this.isEditSurestAI = false;
        this.isEditNaviguard = false;
    }

    handleCancel(event) {
        this.isEdit = false;
        this.isPaymentIntegrity = false;
        // this.showValidateButton = true;
        this.showButtons = true;
        this.isLoading = true;
        this.isEditPI =true;
        this.isEditPISurest=true;
        this.isEditCPWSurest=true;
        this.isEditBHS=true;
        this.isEditPaymentSec=true;
        this.isEditSurestAI=true;
        this.isEditAISec=true;
        this.isEditNaviguard=true;
        this.getOppLnItemsData();
    }

    handleSave(event) {
        this.valuesToBackendObj['Sales_Season__c'] = this.selectedSalesSeason;
        saveRenewalData({ valuesToBackend: this.valuesToBackendObj, accId: this.accRecordData.accId, currentSS: this.selectedSalesSeason })
            .then((results) => {
                this.isLoading = true;

                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Record has been saved',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);
                setTimeout(() => {
                    this.getOppLnItemsData();
                }, 2000);
            })
            .catch((error) => {
                console.log('Error While Saving ---> ' + JSON.stringify(error));
                this.isLoading = false;
                const event = new ShowToastEvent({
                    title: 'ERROR',
                    message: "Error while saving. Please contact your administrator.",
                    variant: 'error'
                });
                this.dispatchEvent(event);
            })
        this.isEdit = false;
        this.isPaymentIntegrity = false;
        this.isEditSurestAI = false;
        this.showButtons = true;
        // this.showValidateButton = true;
    }

    handleChange(event) {
        let value = event.target.value;
        let field = event.target.dataset.api;
        this.characterCounter(value.length, event.target.dataset.api);
        this.valuesToBackendObj[event.target.dataset.api] = event.target.value;
        if (event.target.dataset.api == "High_performing_network__c") {
            if (event.target.value == "Yes") {
                this.isDisplayAdditional = true;
            }
            else {
                this.valuesToBackendObj["High_performing_network_Additional__c"] = '';
                if (this.renewalChecklistData != null && this.renewalChecklistData != undefined && this.renewalChecklistData != '') {
                    this.renewalChecklistData.High_performing_network_Additional__c = '';
                }
                this.isDisplayAdditional = false;
            }
        }

        const placeholderMap = {
            'Structure_Changes__c': 'placeHolderSC',
            'Changes_in_Rx__c': 'placeHolderRx',
            'Sures_Benefit_Plan__c': 'placeHolderSBP',
            'Benefit_Admin_Vendor_changes__c': 'placeHolderBAV',
            'Client_Specific_Programs__c': 'placeHolderCSP',
            'Surest_Product_Change__c': 'placeHolderSPC'
        };
    
        const placeholderText = {
            'Structure_Changes__c': 'Indicate Structure Changes',
            'Changes_in_Rx__c': 'Indicate Rx Changes',
            'Sures_Benefit_Plan__c': 'Indicate Surest Benefit Plan',
            'Benefit_Admin_Vendor_changes__c': 'Indicate which Benefit Admin Vendor is changing?',
            'Client_Specific_Programs__c': 'List New / Terminating Programs This Year',
            'Surest_Product_Change__c': 'Indicate Surest Product Change'
        };
    
        if (field in placeholderMap) {
            const stateField = placeholderMap[field];
            this[stateField] = value === 'Yes' ? placeholderText[field] : '';
        }
        //console.log('this.valuesToBackendObj = ', JSON.stringify(this.valuesToBackendObj));
    }

    handlePaymentIntegrityData(event) {
        const { renewalData, dataToBackend } = event.detail;
        this.renewalChecklistData = { ...this.renewalChecklistData, ...renewalData };
        this.valuesToBackendObj = { ...this.valuesToBackendObj, ...dataToBackend };
        // this.showValidateButton = event.detail.showValidation;
        this.isEditChild = event.detail.showValidation;
        this.handlePaymentIntegritySave(dataToBackend);
    }

    handlePaymentIntegritySave(dataToSave) {
        dataToSave['CPW__c'] =this.showCPWSection;
        dataToSave['Sales_Season__c'] = this.selectedSalesSeason;
        saveRenewalData({ valuesToBackend: dataToSave, accId: this.accRecordData.accId, currentSS: this.selectedSalesSeason })
            .then((results) => {
                this.isLoading = true;

                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Record has been saved',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);
                setTimeout(() => {
                    this.getOppLnItemsData();
                }, 2000);
            })
            .catch((error) => {
                console.log('Error While Saving ---> ' + JSON.stringify(error));
                this.isLoading = false;
                const event = new ShowToastEvent({
                    title: 'ERROR',
                    message: "Error while saving. Please contact your administrator.",
                    variant: 'error'
                });
                this.dispatchEvent(event);
            })
    }

    handlePiCancel(event) {
        // this.showValidateButton = event.detail.showValidation;
        this.isEditChild = event.detail.showValidation;;
        this.isLoading = true;
        this.getOppLnItemsData();
        this.isEditPI =true;
        this.isEditPISurest =true;
        this.isEditCPWSurest =true;
        this.isEditPaymentSec =true;
        this.isEditBHS = true;
        this.isEditAISec = true;
        this.isEditNaviguard = true;
    }

    handleCPWCancel(event) {
        // this.showValidateButton = event.detail.showValidation;
        this.isEditChild = event.detail.showValidation;;
        this.isLoading = true;
        this.getOppLnItemsData();
        this.isEditPI =true;
        this.isEditPISurest =true;
        this.isEditCPWSurest =true;
        this.isEditPaymentSec =true;
        this.isEditBHS = true;
        this.isEditAISec = true;
        this.isEditNaviguard = true;
    }

    handleBHSEdit(event) {
        this.isLoading = true;
        this.isEditProd = true;
        this.showButtons = false;
        this.isLoading = false;
        this.onLoadCharCount(this.renewalChecklistData);
        this.isEditBHS = false;
        this.isEditPI =false;
        this.isEditPISurest=false;
        this.isEditCPWSurest = false;
        this.isEditPaymentSec=false;
        this.isEditAISec=false;
        this.isEditNaviguard=false;
    }

    handleBHSCancel(event) {
        this.isEditProd = false;
        this.isPaymentIntegrity = false;
        this.showButtons = true;
        this.isLoading = true;
        this.isEditPI =true;
        this.isEditPISurest=true;
        this.isEditCPWSurest=true;
        this.isEditPaymentSec=true;
        this.isEditBHS = true;
        this.isEditAISec = true;
        this.isEditNaviguard = true;
        this.getOppLnItemsData();
    }

    handleBHSChange(event) {
        let value = event.target.value;
        let field = event.target.dataset.api;
        this.autoPopulateValue = {
            Calm_Health_app__c: 'Included',
            Case_Management__c: 'Included',
            National_Network_Outpatient_Inpatient_UM__c: 'Included',
            Behavioral_Health_Virtual_Visits__c: 'Included',
            Substance_Use_Disorder_Helpline__c: 'Included',
            Care_Explorer__c: 'Included',
            Family_Support__c: 'Included',
            X24_7_in_the_moment_and_crisis_support__c: 'Included',
            Enhanced_Case_Management__c: 'Included',
            Behavioral_Care_Connect_5_Day_Access__c: 'Included'
        }
        this.valuesToBackendObj = {...this.valuesToBackendObj,...this.autoPopulateValue};
        this.valuesToBackendObj = {...this.valuesToBackendObj,[field]: value};
        this.renewalChecklistData[event.target.dataset.api] = value;
        //console.log('this.valuesToBackendObj = ', JSON.stringify(this.valuesToBackendObj));
    }

    handleBHSSave(event) {
        this.valuesToBackendObj['Sales_Season__c'] = this.selectedSalesSeason;
        saveRenewalData({ valuesToBackend: this.valuesToBackendObj, accId: this.accRecordData.accId, currentSS: this.selectedSalesSeason })
            .then((results) => {
                this.isLoading = true;

                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Record has been saved',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);
                setTimeout(() => {
                    this.getOppLnItemsData();
                }, 2000);
            })
            .catch((error) => {
                console.log('Error While Saving ---> ' + JSON.stringify(error));
                this.isLoading = false;
                const event = new ShowToastEvent({
                    title: 'ERROR',
                    message: "Error while saving. Please contact your administrator.",
                    variant: 'error'
                });
                this.dispatchEvent(event);
            })
        this.isEditProd = false;
        this.isPaymentIntegrity = false;
        this.showButtons = true;
        this.isEditBHS = true;
    }
     handleNaviguardEdit(event) {
        this.isLoading = true;
        this.isEditNaviguardProd = true;
        this.showButtons = false;
        this.isLoading = false;
        this.onLoadCharCount(this.renewalChecklistData);
        this.isEditBHS = false;
        this.isEditPI =false;
        this.isEditPISurest=false;
        this.isEditCPWSurest = false;
        this.isEditPaymentSec=false;
        this.isEditAISec=false;
        this.isEditNaviguard=false;
    }

    handleNaviguardCancel(event) {
        this.isEditNaviguardProd = false;
        //this.isPaymentIntegrity = false;
        this.showButtons = true;
        this.isLoading = true;
        this.isEditPI =true;
        this.isEditPISurest=true;
        this.isEditCPWSurest=true;
        this.isEditPaymentSec=true;
        this.isEditBHS = true;
        this.isEditAISec = true;
        this.isEditNaviguard = true;
        this.getOppLnItemsData();
    }

    handleNaviguardChange(event) {
        let value = event.target.value;
        let field = event.target.dataset.api;
        this.valuesToBackendObj = {...this.valuesToBackendObj,[field]: value};
        this.renewalChecklistData[event.target.dataset.api] = value;
    }

    handleNaviguardSave(event) {
        this.valuesToBackendObj['Sales_Season__c'] = this.selectedSalesSeason;
        saveRenewalData({ valuesToBackend: this.valuesToBackendObj, accId: this.accRecordData.accId, currentSS: this.selectedSalesSeason })
            .then((results) => {
                this.isLoading = true;

                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Record has been saved',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);
                setTimeout(() => {
                    this.getOppLnItemsData();
                }, 2000);
            })
            .catch((error) => {
                console.log('Error While Saving ---> ' + JSON.stringify(error));
                this.isLoading = false;
                const event = new ShowToastEvent({
                    title: 'ERROR',
                    message: "Error while saving. Please contact your administrator.",
                    variant: 'error'
                });
                this.dispatchEvent(event);
            })
        this.isEditNaviguardProd = false;
        //this.isPaymentIntegrity = false;
        this.showButtons = true;
        this.isEditNaviguard = true;
    }

    handleAISecEdit(event) {
        this.isLoading = true;
        this.isEditSurestAI = true;
        this.showButtons = false;
        this.isLoading = false;
        this.onLoadCharCount(this.renewalChecklistData);
        this.isEditPI =false;
        this.isEditPISurest=false;
        this.isEditCPWSurest=false;
        this.isEditBHS = false;
        this.isEdit = false;
        this.isEditPaymentSec=false;
        this.isEditNaviguard=false;
    }

    handleAISecCancel(event) {
        this.isEditSurestAI = false;
        this.isPaymentIntegrity = false;
        this.showButtons = true;
        this.isLoading = true;
        this.isEditPI =true;
        this.isEditPISurest=true;
        this.isEditCPWSurest=true;
        this.isEditBHS=true;
        this.isEditPaymentSec=true;
        this.isEditAISec=true;
        this.isEditNaviguard=true;
        this.getOppLnItemsData();
    }

    characterCounter(charLength, dataApi) {
        if ((dataApi !== null && charLength !== null) || (dataApi !== undefined && charLength !== undefined) ||
            (dataApi !== '' && charLength !== '')) {
            switch (dataApi) {
                case 'PGs_confirmed_Write_In__c':
                    this.renewalChecklistData.pgChar = `${charLength}`;
                    break;
                case 'high_performing_network_Write_In__c':
                    this.renewalChecklistData.highPerformingChar = `${charLength}`;
                    break;
                case 'Payment_Integrity_Bundle_Write_In__c':
                    this.renewalChecklistData.paymentIntegrityChar = `${charLength}`;
                    break;
                case 'X3rd_Party_Stop_Loss_Write_In__c':
                    this.renewalChecklistData.thirdPartyChar = `${charLength}`;
                    break;
                case 'PPO_Network_Access_Write_In__c':
                    this.renewalChecklistData.ppoChar = `${charLength}`;
                    break;
                case 'Offshore_Provisions_Write_In__c':
                    this.renewalChecklistData.offShoreChar = `${charLength}`;
                    break;
                case 'Additional_Comments__c':
                    this.renewalChecklistData.additionalCommentsChar = `${charLength}`;
                    break;
                case 'Change_to_OON_Program_Write_In__c':
                    this.renewalChecklistData.oonChangeChar = `${charLength}`;
                    break;
                case 'Structure_Changes_Write_In__c':
                    this.renewalChecklistData.strucChar = `${charLength}`;
                    break;
                case 'Rx_Changes_Write_In__c':
                    this.renewalChecklistData.rxChangeChar = `${charLength}`;
                    break;
                case 'Surest_Benefit_Plan_Write_In__c':
                    this.renewalChecklistData.surestPlanChar = `${charLength}`;
                    break;
                case 'Benefit_Admin_Vendor_Write_In__c':
                    this.renewalChecklistData.benefitAdminChar = `${charLength}`;
                    break;
                case 'Client_Specific_Programs_Write_In__c':
                    this.renewalChecklistData.clientPgrmChar = `${charLength}`;
                    break;
                case 'Surest_Product_Change_Write_In__c':
                    this.renewalChecklistData.surestProdChar = `${charLength}`;
                    break;
            }
        }
    }

    onLoadCharCount(renewalData) {
        if (Object.keys(renewalData).length > 0) {
            renewalData.pgChar = renewalData.PGs_confirmed_Write_In__c !== null && renewalData.PGs_confirmed_Write_In__c !== undefined ? renewalData.PGs_confirmed_Write_In__c.length : 0;
            renewalData.highPerformingChar = renewalData.high_performing_network_Write_In__c !== null && renewalData.high_performing_network_Write_In__c !== undefined ? renewalData.high_performing_network_Write_In__c.length : 0;
            renewalData.paymentIntegrityChar = renewalData.Payment_Integrity_Bundle_Write_In__c !== null && renewalData.Payment_Integrity_Bundle_Write_In__c !== undefined ? renewalData.Payment_Integrity_Bundle_Write_In__c.length : 0;
            renewalData.thirdPartyChar = renewalData.X3rd_Party_Stop_Loss_Write_In__c !== null && renewalData.X3rd_Party_Stop_Loss_Write_In__c !== undefined ? renewalData.X3rd_Party_Stop_Loss_Write_In__c.length : 0;
            renewalData.ppoChar = renewalData.PPO_Network_Access_Write_In__c !== null && renewalData.PPO_Network_Access_Write_In__c !== undefined ? renewalData.PPO_Network_Access_Write_In__c.length : 0;
            renewalData.offShoreChar = renewalData.Offshore_Provisions_Write_In__c !== null && renewalData.Offshore_Provisions_Write_In__c !== undefined ? renewalData.Offshore_Provisions_Write_In__c.length : 0;
            renewalData.additionalCommentsChar = renewalData.Additional_Comments__c !== null && renewalData.Additional_Comments__c !== undefined ? renewalData.Additional_Comments__c.length : 0;
            renewalData.oonChangeChar = renewalData.Change_to_OON_Program_Write_In__c !== null && renewalData.Change_to_OON_Program_Write_In__c !== undefined ? renewalData.Change_to_OON_Program_Write_In__c.length : 0;
            renewalData.strucChar = renewalData.PGs_confirmed_Write_In__c !== null && renewalData.PGs_confirmed_Write_In__c !== undefined ? renewalData.PGs_confirmed_Write_In__c.length : 0;
            renewalData.rxChangeChar = renewalData.high_performing_network_Write_In__c !== null && renewalData.high_performing_network_Write_In__c !== undefined ? renewalData.high_performing_network_Write_In__c.length : 0;
            renewalData.surestPlanChar = renewalData.Payment_Integrity_Bundle_Write_In__c !== null && renewalData.Payment_Integrity_Bundle_Write_In__c !== undefined ? renewalData.Payment_Integrity_Bundle_Write_In__c.length : 0;
            renewalData.benefitAdminChar = renewalData.X3rd_Party_Stop_Loss_Write_In__c !== null && renewalData.X3rd_Party_Stop_Loss_Write_In__c !== undefined ? renewalData.X3rd_Party_Stop_Loss_Write_In__c.length : 0;
            renewalData.clientPgrmChar = renewalData.PPO_Network_Access_Write_In__c !== null && renewalData.PPO_Network_Access_Write_In__c !== undefined ? renewalData.PPO_Network_Access_Write_In__c.length : 0;
            renewalData.surestProdChar = renewalData.Offshore_Provisions_Write_In__c !== null && renewalData.Offshore_Provisions_Write_In__c !== undefined ? renewalData.Offshore_Provisions_Write_In__c.length : 0;
        }
        else {
            renewalData.pgChar = 0;
            renewalData.highPerformingChar = 0;
            renewalData.paymentIntegrityChar = 0;
            renewalData.thirdPartyChar = 0;
            renewalData.ppoChar = 0;
            renewalData.offShoreChar = 0;
            renewalData.additionalCommentsChar = 0;
            renewalData.oonChangeChar = 0;
            renewalData.strucChar = 0;
            renewalData.rxChangeChar = 0;
            renewalData.surestPlanChar = 0;
            renewalData.benefitAdminChar = 0;
            renewalData.clientPgrmChar = 0;
            renewalData.surestProdChar = 0;
        }
    }

    timeZone(timezoneName) {
        if (timezoneName) {
            if (timezoneName.includes('Eastern Daylight Time')) {
                this.tmzShort = 'EDT';
            }
            else if (timezoneName.includes('Eastern Standard Time')) {
                this.tmzShort = 'EST';
            }
            else if (timezoneName.includes('Central Standard Time')) {
                this.tmzShort = 'CST';
            }
            else if (timezoneName.includes('Central Daylight Time')) {
                this.tmzShort = 'CDT';
            }
            else if (timezoneName.includes('Pacific Standard Time')) {
                this.tmzShort = 'PST';
            }
            else if (timezoneName.includes('Pacific Daylight Time')) {
                this.tmzShort = 'PDT';
            }
            else if (timezoneName.includes('India Standard Time')) {
                this.tmzShort = 'IST';
            }
        }
    }

    handleValidation(event) {
        if (this.termingProducts.length == 0 && this.existingProducts.length == 0) {
            this.showModal = true;
        }
        else {
            this.commonValidation();
        }
    }
    handleModalValidation() {
        this.commonValidation();
        this.showModal = false;
    }
    handleDialogClose() {
        if (this.showModal) {
            this.showModal = false;
        }
        if (this.isExitEdit) {
            this.isExitEdit = false;
        }
    }
    handleValidationCancel() {
        this.showModal = false;
    }

    handleIgnoreChanges() {
        this.isExitEdit = false;
    }
    handleContinueEditing() {
        this.isExitEdit = false;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.oppId,
                //objectApiName: 'namespace__ObjectName', // objectApiName is optional
                actionName: 'view'
            }
        });
    }
    createNewOpp() {
        this.isExitEdit = false;
        //this.isEdit = false;

        this[NavigationMixin.GenerateUrl]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Opportunity',
                actionName: 'new',
                accountId: this.accRecordData.accId
            },
            state: {
                defaultFieldValues: 'accountId=' + this.accRecordData.accId
            }
        }).then(url => {
            window.open(url, "_self");
        });
    }

    handleHideValidation(event) {
        // this.showValidateButton = event.detail;
        this.isEditChild = event.detail;
        this.isEditPI =!this.isEditChild;
        this.isEditCPWSurest =false;
        this.isEditPaymentSec =false;
        this.isEditBHS=false;
        this.isEditAISec=false;
        this.isEditNaviguard=false;
    }
    handleHideValidationSurest(event) {
        // this.showValidateButton = event.detail;
        this.isEditChild = event.detail;
        this.isEditPISurest =!this.isEditChild;
        this.isEditPaymentSec =false;
        this.isEditBHS=false;
        this.isEditAISec=false;
        this.isEditNaviguard=false;
    }
    handleHideValidationCPW(event) {
        // this.showValidateButton = event.detail;
        this.isEditChild = event.detail;
        this.isEditPI =false;
        this.isEditPISurest = false;
        this.isEditCPWSurest =!this.isEditChild;
        this.isEditPaymentSec =false;
        this.isEditBHS=false;
        this.isEditAISec=false;
        this.isEditNaviguard=false;
    }
}