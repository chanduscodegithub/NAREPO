/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 01-03-2025
 * @last modified by  : Spoorthy
**/
import { LightningElement, track, api, wire } from 'lwc';
import { registerListener, unregisterListener } from 'c/pubsub';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import getClientdata from '@salesforce/apex/SoldChecklistHandler.getClientData';
import UpdateClientData from '@salesforce/apex/SoldChecklistHandler.UpdateSoldCheckList';
import getSoldcasePdf from '@salesforce/apex/SoldChecklistHandler.getSoldcasePdf';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';
import { CloseActionScreenEvent } from 'lightning/actions';  //Added by Vignesh
import TIMEZONE from '@salesforce/i18n/timeZone';
import getValidationEmails from '@salesforce/apex/renewalChecklistCls.getValidationEmails';
import sendEmailWithPDF from '@salesforce/apex/EmailSCCbySalesSurestTeam.sendEmailWithPDF';
import sccStaticResource from '@salesforce/resourceUrl/SCC_Static_Resource';

export default class SoldCheckMainComp extends LightningElement {

    @api recordId;
    @track ClientDataRecord;
    @track showSaveCancel = false;
    @track onCancelPharmacyProd = true;
    @track disableEdit = false;
    @track IsProductAvaiable = false;
    @track UpdatedClientDetialData = {};
    @track Opplineitemrecords;
    @track AccountdetailData = [];
    @track OpplineitemUpdate = [];
    @track medicalrecords = [];
    @track Otherrecords = [];
    @track Dentalrecords = [];
    @track visionrecords = [];
    @track pharmacyrecords = [];
    @track Mediarray = [];
    @track otherrecnewarray = [];
    @track otherprodrecarray = [];
    @track meddispValue;
    @track dentdispValue;
    @track pharmdispValue;
    @track visiondispValue;
    @track otherProductsStatus;
    @track isSurestProductMed = false;
    @track isTraditionalProductMed = false;
    @track isSurestProductPharmacy = false;
    @track isTraditionalProductPharmacy = false;
    @track isSurestProdAll = false;
    @track isTraditionalProdAll = false;
    @track isTradSoldOther = false;
    @track isSurestSoldOther = false;
    @track islineitems = false;
    @track resultSoldchecklist;
    @track isLoad = false;
    @track networkflag;
    @track hasEditAccess = false;
    @track ClientDataRecordBackup;
    @track oppLineItemsRecordsBackup;
    @track onCancel = true;
    @track tieredBenefitValue = '';
    @track opportunityFieldLabels;
    @track accountFieldLabels;
    @track companyAddress = ''; //Variable used to build company address
    @track userTimeZone;
    bridge2HealthOptOutValue = '';
    bridge2healthOptOutVisionValue = ''; //SAMARTH
    @api soldCaseObjectData; //Samarth
    @track updatedSoldCaseData = {}; //Samarth
    @api sccHoverHelpData; //SAMARTH
    @api Net_Results_Not_Zero;

    @api engageSol;
    @api wellRall;
    @api advocacy;
    @api eServices;
    @track isCM = false;
    @track showCPWSection = false;
    @track updatedBySales = false;
    @track updatedByIPM =false;
    @track SalesOrIPM ='Sales';

    //added below variables for audit trail - start
    loggedInUserId;
    oppDataBeforeEdit = {};
    oppDataAfterEdit = {};
    mapOfOppObjPrprtyFldApiNameMapping = {};
    oppFieldEditedMap = {};
    accDataBeforeEdit = {};
    accFieldEditedMap = {};
    mapOfAccObjPrprtyFldApiNameMapping = {};
    oppLineItemRecMapBeforeEdit = {};
    mapOfOppLineItemObjPrprtyFldApiNameMapping = {};
    @wire(CurrentPageReference) pageRef;
    //added below variables for audit trail - end

    //Wire method to get Account and Opportunity Object labels
    //Opportunity field labels
    @wire(getObjectInfo, { objectApiName: OPPORTUNITY_OBJECT })
    oppInfo({ data, error }) {
        if (data) {
            this.opportunityFieldLabels = data.fields;
        }
    }

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accInfo({ data, error }) {
        if (data) {
            this.accountFieldLabels = data.fields;
        }
    }

    connectedCallback() {
        registerListener('successEvent', this.refreshData, this);
        console.log(`in connected callback`);
    }
    renderedCallback() {
        //console.log('renderedCallback calling');
    }
    refreshData() {
        this.onCancel = false;
        this.onCancelPharmacyProd = false;
        refreshApex(this.resultSoldchecklist);
        setTimeout(() => {
            this.onCancel = true;
            this.onCancelPharmacyProd = true;
        }, 1200);
    }

    @wire(getClientdata, { recId: '$recordId' })
    clientdataRec(result) {
        //console.log(`Result = ${JSON.stringify(result)}`);
        this.resultSoldchecklist = result;
        if (result.data) {
            this.updatedByIPM =false;
            this.updatedBySales =false;
            let data = result.data;
            let opplineitemarray = [];
            let medirecarray = [];
            let dentrecarray = [];
            let otherrecarray = [];
            let pharmRecArray = [];
            let visionRecArray = [];
            this.meddispValue = data.MedidiscValue;
            this.dentdispValue = data.dentdiscvalue;
            this.pharmdispValue = data.pharmdiscvalue;
            this.visiondispValue = data.visiondiscvalue;
            this.otherProductsStatus = data.otherProductsStatus;
            this.networkflag = data.networkflag;
            this.ClientDataRecord = Object.assign({}, data.oppdata);
            this.ClientDataRecordBackup = Object.assign({}, data.oppdata);
            this.showCPWSection = data.showCPWSection;
            this.isSurestProductMed = data.isSurestProductMed;
            this.isTraditionalProductMed = data.isTraditionalProductMed;
            this.isSurestProductPharmacy = data.isSurestProductPharmacy;
            this.isTraditionalProductPharmacy = data.isTraditionalProductPharmacy;
            this.isSurestProdAll = data.isSurestProdAll;
            this.isTraditionalProdAll = data.isTraditionalProdAll;
            this.isTradSoldOther = data.isTradSoldOther;
            this.isSurestSoldOther = data.isSurestSoldOther;
            //------------SAMARTH------------
            this.soldCaseObjectData = { ...data.sccData };
            
            this.sccHoverHelpData = data.sccHoverHelp;
            //console.log('sccHoverHelpData ' + JSON.stringify(this.sccHoverHelpData[0]['Indicate_Vendor__c'].split(';')));
            //------------SAMARTH------------

            this.Mediarray = [];
            this.Dentalrecords = [];
            this.pharmacyrecords = [];
            this.visionrecords = [];
            this.otherrecarray = [];
            if (this.ClientDataRecord.BusinessType__c == 'Client Management') {
                this.isCM = true;
            } else {
                this.isCM = false;
            }
            console.log('isCM' + this.isCM);

            // Assign tieredBenefitValue from Opportunity Record and pass it to Products or services component.
            if (this.ClientDataRecord.hasOwnProperty('Tiered_Benefits__c')) {
                this.tieredBenefitValue = this.ClientDataRecord.Tiered_Benefits__c;
            } else {
                this.tieredBenefitValue = '';
            }

            // Assign bridge2HealthOptOutValue from Opportunity Record and pass it to Products or services component.
            if (this.ClientDataRecord.hasOwnProperty('Bridge2Health_opt_out__c')) {
                this.bridge2HealthOptOutValue = this.ClientDataRecord.Bridge2Health_opt_out__c;
            } else {
                this.bridge2HealthOptOutValue = '';
            }


            if (this.ClientDataRecord.hasOwnProperty('Bridge2Health_Vision__c')) {
                this.bridge2healthOptOutVisionValue = this.ClientDataRecord.Bridge2Health_Vision__c;
            } else {
                this.bridge2healthOptOutVisionValue = '';
            }

            // if(this.isSurestProductMed || (this.meddispValue == 'Transfer In' || this.meddispValue == 'Spin-Off')){
            //     this.showCPWSection = true;
            // }

            //Assign User time zone and pass dynamically to all the components which has date fields.
            this.userTimeZone = data.userTimeZone;

            //Check the Membership Activity Record Status and Provide accessibilty if the Status is closed
            //console.log(`Net_Results_Not_Zero = ${JSON.stringify(data)}`);
            if (data.hasEditAccess === true) {
                this.hasEditAccess = true;
            } else {
                this.hasEditAccess = false;
            }

            data.OppolineItemsList.forEach(oppLn => {
                if (oppLn.Opportunity.RecordTypeId === data.cmRecTypeId) {
                    if (data.Net_Results_Not_Zero === true) {
                        this.Net_Results_Not_Zero = true;
                    }
                    else {
                        this.Net_Results_Not_Zero = false;
                    }
                }
                else {
                    this.Net_Results_Not_Zero = true;
                }
            })

            this.soldCaseCheckListInstructions = data.soldCaseInstructions;
            this.UpdatedClientDetialData = Object.assign({}, data.oppdata);
            this.AccountdetailData = Object.assign({}, data.accrec);
            this.updatedSoldCaseData = Object.assign({}, data.sccData);

            //console.log('medilineitem '+JSON.stringify(data.medilineitem));
            //SetuP Medical Opportunity ProduData
            if (data.medilineitem != null && data.medilineitem != undefined && data.medilineitem != '') {
                data.medilineitem.forEach(elem => {
                    medirecarray.push(Object.assign({}, elem));
                });
                this.medicalrecords = medirecarray;
                //console.log('medicalrecords ' + JSON.stringify(this.medicalrecords));
                let testJson = {};
                let testarray1 = [];
                let testkey = [];

                let showPicklistScc;
                let showCommentBoxScc;
                let commentBoxLength;
                let commentBoxPlaceHolder;

                this.medicalrecords.forEach(ele => {

                    if (testJson.hasOwnProperty(ele.Product2.Family)) {
                        testJson[ele.Product2.Family].push(ele);
                    }
                    else {
                        let testarray = [];
                        testarray.push(ele)
                        testJson[ele.Product2.Family] = testarray;
                    }
                })

                for (var key in testJson) {
                    testkey.push({ value: testJson[key], key: key });
                }

                //console.log('testkey ' + JSON.stringify(testkey[0]['value'][0]['Product2']));

                for (let i in testkey) {
                    for (let j in testkey[i]['value']) {
                        if (testkey[i]['value'][j]['Product2']['Level_2_Options__c'] != null || testkey[i]['value'][j]['Product2']['Level_2_Options__c'] != undefined) {
                            let tempArray = testkey[i]['value'][j]['Product2']['Level_2_Options__c'].split(';');
                            testkey[i]['value'][j].level2Opt = [{ label: '', value: '' }];

                            for (let k in tempArray) {
                                testkey[i]['value'][j].level2Opt.push({ label: tempArray[k], value: tempArray[k] });
                            }
                        }
                        testkey[i]['value'][j].displayTextarea = false;
                        testkey[i]['value'][j].displayPicklist = false;
                        testkey[i]['value'][j].placeHolder = '';
                        testkey[i]['value'][j].commentsLength = 0;
                        testkey[i]['value'][j].pickListCode = '';
                        if (testkey[i]['value'][j]['ProductCode'] == 'EBDRP') {
                            testkey[i]['value'][j].showLevel2Opt = true;
                        }

                        //Level 2 Options for BIND
                        if (testkey[i]['value'][j]['ProductCode'] == 'BIND') {
                            testkey[i]['value'][j].displayTextarea = true;
                            testkey[i]['value'][j].placeHolder = 'Indicate Rx Vendor';
                            testkey[i]['value'][j].commentsLength = 25;
                        }

                        if (this.sccHoverHelpData[0]['Indicate_Vendor__c'].split(';').includes(testkey[i]['value'][j]['ProductCode'])) {
                            testkey[i]['value'][j].displayTextarea = true;
                            testkey[i]['value'][j].displayPicklist = true;
                            testkey[i]['value'][j].placeHolder = 'Indicate Vendor';
                            testkey[i]['value'][j].commentsLength = 25;
                            testkey[i]['value'][j].pickListCode = 'CarveinOut';
                        }
                        if (this.sccHoverHelpData[0]['List_any_applicable_customization__c'].split(';').includes(testkey[i]['value'][j]['ProductCode'])) {
                            testkey[i]['value'][j].displayTextarea = true;
                            testkey[i]['value'][j].displayPicklist = true;
                            testkey[i]['value'][j].placeHolder = 'List any applicable customization';
                            testkey[i]['value'][j].commentsLength = 255;
                            testkey[i]['value'][j].pickListCode = 'stdCust';
                        }
                        if (this.sccHoverHelpData[0]['Provide_plan_code_in_text_box__c'].split(';').includes(testkey[i]['value'][j]['ProductCode'])) {
                            testkey[i]['value'][j].displayTextarea = true;
                            testkey[i]['value'][j].placeHolder = 'Provide plan code in text box';
                            testkey[i]['value'][j].commentsLength = 25;
                        }
                        /* if (this.sccHoverHelpData[0]['Specify_Bank_Administrator__c'].split(';').includes(testkey[i]['value'][j]['ProductCode'])) {
                            testkey[i]['value'][j].displayTextarea = true;
                            testkey[i]['value'][j].commentsLength = 25;
                            testkey[i]['value'][j].placeHolder = 'Specify Bank Administrator';
                            if (testkey[i]['value'][j]['ProductCode'] == 'ACCT-HSA') {
                                testkey[i]['value'][j].displayPicklist = true;
                                testkey[i]['value'][j].pickListCode = 'optOther';
                            }
                        } */
                    }
                }
                //console.log('Med Prd ' + JSON.stringify(testkey));
                this.Mediarray = testkey;
                //console.log('Mediarray ' + JSON.stringify(this.Mediarray));
            }
            //Ends Here

            // Setup Dental Products
            if (data.dentallineitem != null && data.dentallineitem != undefined && data.dentallineitem != '') {
                data.dentallineitem.forEach(elem => {
                    dentrecarray.push(Object.assign({}, elem));
                })

                for (let i in dentrecarray) {
                    dentrecarray[i].displayTextarea = false;
                    dentrecarray[i].displayPicklist = false;
                    dentrecarray[i].placeHolder = '';
                    dentrecarray[i].commentsLength = 0;
                    dentrecarray[i].pickListCode = '';

                    if (this.sccHoverHelpData[0]['Indicate_Vendor__c'].split(';').includes(dentrecarray[i]['ProductCode'])) {
                        dentrecarray[i].displayTextarea = true;
                        dentrecarray[i].displayPicklist = true;
                        dentrecarray[i].placeHolder = 'Indicate Vendor';
                        dentrecarray[i].commentsLength = 25;
                        dentrecarray[i].pickListCode = 'CarveinOut';
                    }
                    if (this.sccHoverHelpData[0]['List_any_applicable_customization__c'].split(';').includes(dentrecarray[i]['ProductCode'])) {
                        dentrecarray[i].displayTextarea = true;
                        dentrecarray[i].displayPicklist = true;
                        dentrecarray[i].placeHolder = 'List any applicable customization';
                        dentrecarray[i].commentsLength = 255;
                        dentrecarray[i].pickListCode = 'stdCust';
                    }
                    if (this.sccHoverHelpData[0]['Provide_plan_code_in_text_box__c'].split(';').includes(dentrecarray[i]['ProductCode'])) {
                        dentrecarray[i].displayTextarea = true;
                        dentrecarray[i].placeHolder = 'Provide plan code in text box';
                        dentrecarray[i].commentsLength = 25;
                    }
                    /* if (this.sccHoverHelpData[0]['Specify_Bank_Administrator__c'].split(';').includes(dentrecarray[i]['ProductCode'])) {
                        dentrecarray[i].displayTextarea = true;
                        dentrecarray[i].commentsLength = 25;
                        dentrecarray[i].placeHolder = 'Specify Bank Administrator';
                        if (dentrecarray[i]['ProductCode'] == 'ACCT-HSA') {
                            dentrecarray[i].displayPicklist = true;
                            dentrecarray[i].pickListCode = 'optOther';
                        }
                    } */
                }

                this.Dentalrecords = dentrecarray;
                //console.log('Dent Prod ' + JSON.stringify(dentrecarray));
            }
            //Ends Here

            //Setup Pharmacy Products
            if (data.pharmacylineitem != null && data.pharmacylineitem != undefined && data.pharmacylineitem != '') {
                data.pharmacylineitem.forEach(elem => {
                    pharmRecArray.push(Object.assign({}, elem));
                })

                for (let i in pharmRecArray) {
                    pharmRecArray[i].displayTextarea = false;
                    pharmRecArray[i].displayPicklist = false;
                    pharmRecArray[i].placeHolder = '';
                    pharmRecArray[i].commentsLength = 0;
                    pharmRecArray[i].pickListCode = '';
                    pharmRecArray[i].displayCarveInQuestions = false; //SAMARTH SCC NB UPGRADE 2023

                    if (pharmRecArray[i]['Product2']['Level_2_Options__c'] != null || pharmRecArray[i]['Product2']['Level_2_Options__c'] != undefined) {
                        let tempArray = pharmRecArray[i]['Product2']['Level_2_Options__c'].split(';');

                        pharmRecArray[i].level2Opt = [{ label: '', value: '' }];

                        for (let j in tempArray) {
                            pharmRecArray[i].level2Opt.push({ label: tempArray[j], value: tempArray[j] });
                        }
                    }

                    //------------SAMARTH SCC NB UPGRADE 2023------------
                    if (pharmRecArray[i]['Level_2_Option__c'] == 'Carve in - OptumRx') {
                        pharmRecArray[i].displayCarveInQuestions = true;
                    }

                    if (pharmRecArray[i]['Level_2_Option__c'] != 'Carve in - OptumRx') {
                        pharmRecArray[i].ESP_Enhanced_Savings_Program_Opt_in__c = '';
                        pharmRecArray[i].Price_Edge_Opt_in__c = '';
                        pharmRecArray[i].Vital_Medication_program_Opt_in_Opt_out__c = '';
                        pharmRecArray[i].My_ScriptRewards__c = '';
                        pharmRecArray[i].If_Fully_Insured_include_quoted_Rx_plan__c = '';
                    }
                    //------------SAMARTH SCC NB UPGRADE 2023------------

                    if (pharmRecArray[i]['Level_2_Option__c'] == 'Carve Out') {
                        pharmRecArray[i].displayTextarea = true;
                    }

                    if (pharmRecArray[i]['Level_2_Option__c'] == 'Carve out Flex - OptumRx'
                        || pharmRecArray[i]['Level_2_Option__c'] == 'Carve out - OptumRx') {
                        pharmRecArray[i].displayDropDown = true;
                    }

                    if (this.sccHoverHelpData[0]['Indicate_Vendor__c'].split(';').includes(pharmRecArray[i]['ProductCode'])) {
                        pharmRecArray[i].displayTextarea = true;
                        pharmRecArray[i].displayPicklist = true;
                        pharmRecArray[i].placeHolder = 'Indicate Vendor';
                        pharmRecArray[i].commentsLength = 25;
                        pharmRecArray[i].pickListCode = 'CarveinOut';
                    }
                    if (this.sccHoverHelpData[0]['List_any_applicable_customization__c'].split(';').includes(pharmRecArray[i]['ProductCode'])) {
                        pharmRecArray[i].displayTextarea = true;
                        pharmRecArray[i].displayPicklist = true;
                        pharmRecArray[i].placeHolder = 'List any applicable customization';
                        pharmRecArray[i].commentsLength = 255;
                        pharmRecArray[i].pickListCode = 'stdCust';
                    }
                    if (this.sccHoverHelpData[0]['Provide_plan_code_in_text_box__c'].split(';').includes(pharmRecArray[i]['ProductCode'])) {
                        pharmRecArray[i].displayTextarea = true;
                        pharmRecArray[i].placeHolder = 'Provide plan code in text box';
                        pharmRecArray[i].commentsLength = 25;
                    }
                    /* if (this.sccHoverHelpData[0]['Specify_Bank_Administrator__c'].split(';').includes(pharmRecArray[i]['ProductCode'])) {
                        pharmRecArray[i].displayTextarea = true;
                        pharmRecArray[i].commentsLength = 25;
                        pharmRecArray[i].placeHolder = 'Specify Bank Administrator';
                        if (pharmRecArray[i]['ProductCode'] == 'ACCT-HSA') {
                            pharmRecArray[i].displayPicklist = true;
                            pharmRecArray[i].pickListCode = 'optOther';
                        }
                    } */
                }

                this.pharmacyrecords = pharmRecArray;
                //console.log('pharmRecArray '+JSON.stringify(pharmRecArray)); 
            }
            //Ends Here

            // Setup Vision Products
            if (data.visionlineitem != null && data.visionlineitem != undefined && data.visionlineitem != '') {
                data.visionlineitem.forEach(elem => {
                    visionRecArray.push(Object.assign({}, elem));
                })

                for (let i in visionRecArray) {
                    /* if (!visionRecArray[i].hasOwnProperty('Level2_Info__c')) {
                        visionRecArray[i].Level2_Info__c = '';
                    } */
                    visionRecArray[i].displayTextarea = false;
                    visionRecArray[i].displayPicklist = false;
                    visionRecArray[i].placeHolder = '';
                    visionRecArray[i].commentsLength = 0;
                    visionRecArray[i].pickListCode = '';

                    if (this.sccHoverHelpData[0]['Indicate_Vendor__c'].split(';').includes(visionRecArray[i]['ProductCode'])) {
                        visionRecArray[i].displayTextarea = true;
                        visionRecArray[i].displayPicklist = true;
                        visionRecArray[i].placeHolder = 'Indicate Vendor';
                        visionRecArray[i].commentsLength = 25;
                        visionRecArray[i].pickListCode = 'CarveinOut';
                    }
                    if (this.sccHoverHelpData[0]['List_any_applicable_customization__c'].split(';').includes(visionRecArray[i]['ProductCode'])) {
                        visionRecArray[i].displayTextarea = true;
                        visionRecArray[i].displayPicklist = true;
                        visionRecArray[i].placeHolder = 'List any applicable customization';
                        visionRecArray[i].commentsLength = 255;
                        visionRecArray[i].pickListCode = 'stdCust';
                    }
                    if (this.sccHoverHelpData[0]['Provide_plan_code_in_text_box__c'].split(';').includes(visionRecArray[i]['ProductCode'])) {
                        visionRecArray[i].displayTextarea = true;
                        visionRecArray[i].placeHolder = 'Provide plan code in text box';
                        visionRecArray[i].commentsLength = 25;
                    }
                    /* if (this.sccHoverHelpData[0]['Specify_Bank_Administrator__c'].split(';').includes(visionRecArray[i]['ProductCode'])) {
                        visionRecArray[i].displayTextarea = true;
                        visionRecArray[i].commentsLength = 25;
                        visionRecArray[i].placeHolder = 'Specify Bank Administrator';
                        if (visionRecArray[i]['ProductCode'] == 'ACCT-HSA') {
                            visionRecArray[i].displayPicklist = true;
                            visionRecArray[i].pickListCode = 'optOther';
                        }
                    } */
                }

                this.visionrecords = visionRecArray;
                //console.log('visionRecArray '+JSON.stringify(visionRecArray));
            }
            // Ends Here

            // Setup Other Products
            if (data.otheropplineitems !== null && data.otheropplineitems !== undefined && data.otheropplineitems !== '') {
                data.otheropplineitems.forEach(elem => {
                    otherrecarray.push(Object.assign({}, elem));
                });
                this.otherrecnewarray = otherrecarray;
                let otherrecJson = {};
                let testarray2 = [];
                let othertestkey = [];
                this.otherrecnewarray.forEach(ele => {

                    if (otherrecJson.hasOwnProperty(ele.Product2.Family)) {
                        otherrecJson[ele.Product2.Family].push(ele);
                    }
                    else {
                        let othertestarray = [];
                        othertestarray.push(ele)
                        otherrecJson[ele.Product2.Family] = othertestarray;
                    }
                })
                for (var key in otherrecJson) {
                    othertestkey.push({ value: otherrecJson[key], key: key });
                }

                for (let i in othertestkey) {
                    for (let j in othertestkey[i]['value']) {
                        if (othertestkey[i]['value'][j]['Product2']['Family'].includes('Out-of-Network')) {
                            othertestkey[i].showOonInstruction = true;
                        }

                        if ((othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In') && othertestkey[i]['value'][j]['Product2']['Family'].includes('Out-of-Network') &&
                            (othertestkey[i]['value'][j]['ProductCode'] != 'OON-NAVN' && othertestkey[i]['value'][j]['ProductCode'] != 'OON-NAVNWFCR' &&
                                othertestkey[i]['value'][j]['ProductCode'] != 'OON-NAVP')) {
                            othertestkey[i]['value'][j].showOonSection = true;
                        }

                        if (othertestkey[i]['value'][j]['Product2']['Family'] == 'Medical Necessity') {
                            othertestkey[i]['value'][j].medNecBuyUp = true;
                            if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                othertestkey[i]['value'][j].disposition =othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']// 'Sold';
                                othertestkey[i]['value'][j].Surestdisposition = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                            } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                //this.otherrecords[i]['value'][j]['Buyup_Product_Selection__c'] = 'Sold';
                                othertestkey[i]['value'][j].Surestdisposition = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                            }
                            else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                //this.otherrecords[i]['value'][j]['Buyup_Product_Selection__c'] = '';
                                othertestkey[i]['value'][j].disposition = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                            } else {
                                othertestkey[i]['value'][j].disposition = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                            }
                        }

                        if (othertestkey[i]['value'][j]['Product2']['Family'] == 'Payment Integrity') {
                            othertestkey[i]['value'][j].payIntBuyUp = true;
                            //  if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                            //     othertestkey[i]['value'][j].disposition =othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']// 'Sold';
                            //     othertestkey[i]['value'][j].Surestdisposition = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                            // } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                            //     othertestkey[i]['value'][j].disposition = 'N/A';
                            //     othertestkey[i]['value'][j].Surestdisposition = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                            // }
                            // else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                            //     othertestkey[i]['value'][j].disposition = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                            //      othertestkey[i]['value'][j].Surestdisposition = 'N/A';
                            // } else {
                            //     othertestkey[i]['value'][j].disposition = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                            // }
                                let rec = othertestkey[i]['value'][j];
                                let disp = rec['Disposition_Other_Buy_Up_Programs__c'];
                                let buyup = rec['Buyup_Product_Selection__c'];

                                // ---- SOLD ----
                                if (disp !== undefined && disp == 'Sold') {
                                    if (buyup == 'Surest & UNET') {
                                        rec.disposition = 'Sold';
                                        rec.Surestdisposition = 'Sold';
                                    } else if (buyup == 'Surest Only') {
                                        rec.disposition = '';
                                        rec.Surestdisposition = 'Sold';
                                    } else if (buyup == 'UNET or UMR Only') {
                                        rec.disposition = 'Sold';
                                        rec.Surestdisposition = '';
                                    } else {
                                         if(this.isSurestSoldOther){
                                            rec.Surestdisposition = 'N/A';
                                        }
                                        rec.disposition = 'Sold';
                                    }
                                }

                                // ---- TRANSFER IN ----
                                else if (disp !== undefined && disp == 'Transfer In') {
                                    if (buyup == 'Surest & UNET') {
                                        rec.disposition = 'Transfer In';
                                        rec.Surestdisposition = 'Transfer In';
                                    } else if (buyup == 'Surest Only') {
                                        rec.disposition = '';
                                        rec.Surestdisposition = 'Transfer In';
                                    } else if (buyup == 'UNET or UMR Only') {
                                        rec.disposition = 'Transfer In';
                                        rec.Surestdisposition = '';
                                    } else {
                                         if(this.isSurestSoldOther){
                                            rec.Surestdisposition = 'N/A';
                                        }
                                        rec.disposition = 'Transfer In';
                                    }
                                }

                                // ---- SPIN-OFF ----
                                else if (disp !== undefined && disp == 'Spin-Off') {
                                    if (buyup == 'Surest & UNET') {
                                        rec.disposition = 'Spin-Off';
                                        rec.Surestdisposition = 'Spin-Off';
                                    } else if (buyup == 'Surest Only') {
                                        rec.disposition = '';
                                        rec.Surestdisposition = 'Spin-Off';
                                    } else if (buyup == 'UNET or UMR Only') {
                                        rec.disposition = 'Spin-Off';
                                        rec.Surestdisposition = '';
                                    } else {
                                         if(this.isSurestSoldOther){
                                            rec.Surestdisposition = 'N/A';
                                        }
                                        rec.disposition = 'Spin-Off';
                                    }
                                }

                                // ---- DEFAULT (TBD) ----
                                else {
                                    if (buyup == 'Surest & UNET') {
                                        rec.disposition = 'TBD';
                                        rec.Surestdisposition = 'TBD';
                                    } else if (buyup == 'Surest Only') {
                                        rec.disposition = '';
                                        rec.Surestdisposition = 'TBD';
                                    } else if (buyup == 'UNET or UMR Only') {
                                        rec.disposition = 'TBD';
                                        rec.Surestdisposition = '';
                                    } else {
                                         if(this.isSurestSoldOther){
                                            rec.Surestdisposition = 'N/A';
                                        }
                                        rec.disposition = 'TBD';
                                    }
                                }

                                for (let k in othertestkey) {
                                for (let l in othertestkey[k]['value']) {
                                    if(this.isSurestSoldOther && this.isTradSoldOther){
                                        if(othertestkey[k]['value'][l].Surestdisposition == ''){
                                            othertestkey[k]['value'][l].Surestdisposition = 'N/A';
                                        }
                                        if(othertestkey[k]['value'][l].disposition == ''){
                                            othertestkey[k]['value'][l].disposition = 'N/A';
                                        }
                                    }
                                }
                                }

                        }

                        //--------------------------------------BASE PROGRAMS--------------------------------------
                        if ((othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                            if (othertestkey[i]['value'][j]['ProductCode'] == 'COMM-CCES') {
                                this.engageSol = true;
                            }
                            if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-WRE' ||
                                othertestkey[i]['value'][j]['ProductCode'] == 'CLN-WRP') {
                                this.wellRall = true;
                            }
                            if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMA4MEED' ||
                                othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMA4MEEHD' ||
                                othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMA4MEPD' ||
                                othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMA4MEPHD' ||
                                othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMA4MEEA' ||
                                othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMOHCA') {
                                this.advocacy = true;
                            }
                            if (othertestkey[i]['value'][j]['ProductCode'] == 'RPT-ESVCSE') {
                                this.eServices = true;
                            }
                        }
                        //--------------------------------------BASE PROGRAMS--------------------------------------

                        //--------------------------------------PHS 3.0 PROGRAMS--------------------------------------
                        if ((othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMPHS30T2' ||
                            othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMPHS30T3' ||
                            othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMPHS30T4')
                            && (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' || 
                            othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' || 
                            othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In' )) {
                            othertestkey[i]['value'][j].phsIncluded = true;
                        }
                        else {
                            othertestkey[i]['value'][j].phsIncluded = false;
                        }

                        if (othertestkey[i]['value'][j]['Product_Line__c'] == 'Other' && (othertestkey[i]['value'][j]['Product2']['Family'] == 'Medical Necessity'
                            || othertestkey[i]['value'][j]['Product2']['Family'] == 'Payment Integrity')) {
                            othertestkey[i]['value'][j].medNecPayInt = true;
                        }
                        else {
                            othertestkey[i]['value'][j].medNecPayInt = false;
                        }
                        // if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-DMA' && othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold') 
                        // if (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] !== undefined && othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold') {
                        //     if(othertestkey[i]['value'][j]['Buyup_Product_Selection__c']=='Surest & UNET'){
                        //         othertestkey[i]['value'][j].surestDispValue ='Sold';
                        //         othertestkey[i]['value'][j].otherProductDispositionValue = 'Sold';
                        //     }else if(othertestkey[i]['value'][j]['Buyup_Product_Selection__c']=='Surest Only'){
                        //         othertestkey[i]['value'][j].surestDispValue ='Sold';
                        //         othertestkey[i]['value'][j].otherProductDispositionValue = '';
                        //     }
                        //     else if(othertestkey[i]['value'][j]['Buyup_Product_Selection__c']=='UNET or UMR Only'){
                        //         othertestkey[i]['value'][j].surestDispValue ='';
                        //         othertestkey[i]['value'][j].otherProductDispositionValue = 'Sold';
                        //     }
                        //     else{
                        //         othertestkey[i]['value'][j].otherProductDispositionValue = 'Sold';
                        //     }
                        // } else {
                        //     othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                        //     othertestkey[i]['value'][j].surestDispValue ='TBD';
                        // }

                        if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-DMA' &&
                            (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                            if (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] !== undefined && (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                            } else {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                            }
                            for (let k in othertestkey) {
                                for (let l in othertestkey[k]['value']) {
                                    if(this.isSurestSoldOther && this.isTradSoldOther){
                                        if(othertestkey[k]['value'][l].surestDispValue == ''){
                                            othertestkey[k]['value'][l].surestDispValue = 'N/A';
                                        }
                                        if(othertestkey[k]['value'][l].otherProductDispositionValue == ''){
                                            othertestkey[k]['value'][l].otherProductDispositionValue = 'N/A';
                                        }
                                    }
                                }
                                for (let l in othertestkey[k]['value']) {
                                    if (othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T2' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T3' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T4') {
                                        othertestkey[k]['value'][l].isAsthmaPresent = true;
                                        othertestkey[k]['value'][l].displayAsthma = othertestkey[i]['value'][j]['Product2']['Name'];
                                        othertestkey[k]['value'][l].surestDispValueAsthma = othertestkey[i]['value'][j]['surestDispValue'];
                                        othertestkey[k]['value'][l].otherProductDispositionValueAsthma = othertestkey[i]['value'][j]['otherProductDispositionValue'];
                                        othertestkey[i]['value'][j].phsBuyUp = true;
                                    }
                                }
                            }
                        }

                        if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-DMD' &&
                           (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                            if (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] !== undefined && (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                            } else {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                            }
                            for (let k in othertestkey) {
                                for (let l in othertestkey[k]['value']) {
                                    if(this.isSurestSoldOther && this.isTradSoldOther){
                                        if(othertestkey[k]['value'][l].surestDispValue == ''){
                                            othertestkey[k]['value'][l].surestDispValue = 'N/A';
                                        }
                                        if(othertestkey[k]['value'][l].otherProductDispositionValue == ''){
                                            othertestkey[k]['value'][l].otherProductDispositionValue = 'N/A';
                                        }
                                    }
                                }
                                for (let l in othertestkey[k]['value']) {
                                    if (othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T2' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T3' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T4') {
                                        othertestkey[k]['value'][l].isDiabetesPresent = true;
                                        othertestkey[k]['value'][l].displayDiabetes = othertestkey[i]['value'][j]['Product2']['Name'];
                                        othertestkey[k]['value'][l].surestDispValueDiabetes = othertestkey[i]['value'][j]['surestDispValue'];
                                        othertestkey[k]['value'][l].otherProductDispositionValueDiabetes = othertestkey[i]['value'][j]['otherProductDispositionValue'];
                                        othertestkey[i]['value'][j].phsBuyUp = true;
                                    }
                                }
                            }
                        }

                        if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-DMCHF' &&
                            (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                            if (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] !== undefined && (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue =othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']// 'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                            } else {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                            }
                            for (let k in othertestkey) {
                                for (let l in othertestkey[k]['value']) {
                                    if(this.isSurestSoldOther && this.isTradSoldOther){
                                        if(othertestkey[k]['value'][l].surestDispValue == ''){
                                            othertestkey[k]['value'][l].surestDispValue = 'N/A';
                                        }
                                        if(othertestkey[k]['value'][l].otherProductDispositionValue == ''){
                                            othertestkey[k]['value'][l].otherProductDispositionValue = 'N/A';
                                        }
                                    }
                                }
                                for (let l in othertestkey[k]['value']) {
                                    if (othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T2' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T3' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T4') {
                                        othertestkey[k]['value'][l].isHeartFailurePresent = true;
                                        othertestkey[k]['value'][l].displayHeartFailure = othertestkey[i]['value'][j]['Product2']['Name'];
                                        othertestkey[k]['value'][l].surestDispValueHeartFailure = othertestkey[i]['value'][j]['surestDispValue'];
                                        othertestkey[k]['value'][l].otherProductDispositionValueHeartFailure = othertestkey[i]['value'][j]['otherProductDispositionValue'];
                                        othertestkey[i]['value'][j].phsBuyUp = true;
                                    }
                                }
                            }
                        }

                        if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-DMCAD' &&
                            (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                            if (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] !== undefined && (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue =othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']// 'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                            } else {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                            }
                            for (let k in othertestkey) {
                                for (let l in othertestkey[k]['value']) {
                                    if(this.isSurestSoldOther && this.isTradSoldOther){
                                        if(othertestkey[k]['value'][l].surestDispValue == ''){
                                            othertestkey[k]['value'][l].surestDispValue = 'N/A';
                                        }
                                        if(othertestkey[k]['value'][l].otherProductDispositionValue == ''){
                                            othertestkey[k]['value'][l].otherProductDispositionValue = 'N/A';
                                        }
                                    }
                                }
                                for (let l in othertestkey[k]['value']) {
                                    if (othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T2' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T3' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T4') {
                                        othertestkey[k]['value'][l].isCADPresent = true;
                                        othertestkey[k]['value'][l].displayCAD = othertestkey[i]['value'][j]['Product2']['Name'];
                                        othertestkey[k]['value'][l].surestDispValueCAD = othertestkey[i]['value'][j]['surestDispValue'];
                                        othertestkey[k]['value'][l].otherProductDispositionValueCAD = othertestkey[i]['value'][j]['otherProductDispositionValue'];
                                        othertestkey[i]['value'][j].phsBuyUp = true;
                                    }
                                }
                            }
                        }

                        if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-DMCOPD' &&
                            (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                            if (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] !== undefined && (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                            } else {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                            }
                            for (let k in othertestkey) {
                                for (let l in othertestkey[k]['value']) {
                                    if(this.isSurestSoldOther && this.isTradSoldOther){
                                        if(othertestkey[k]['value'][l].surestDispValue == ''){
                                            othertestkey[k]['value'][l].surestDispValue = 'N/A';
                                        }
                                        if(othertestkey[k]['value'][l].otherProductDispositionValue == ''){
                                            othertestkey[k]['value'][l].otherProductDispositionValue = 'N/A';
                                        }
                                    }
                                }
                                for (let l in othertestkey[k]['value']) {
                                    if (othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T2' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T3' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T4') {
                                        othertestkey[k]['value'][l].isCOPDPresent = true;
                                        othertestkey[k]['value'][l].displayCOPD = othertestkey[i]['value'][j]['Product2']['Name'];
                                        othertestkey[k]['value'][l].surestDispValueCOPD = othertestkey[i]['value'][j]['surestDispValue'];
                                        othertestkey[k]['value'][l].otherProductDispositionValueCOPD = othertestkey[i]['value'][j]['otherProductDispositionValue'];
                                        othertestkey[i]['value'][j].phsBuyUp = true;
                                    }
                                }
                            }
                        }

                        if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CCCSP' &&
                            (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                            if (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] !== undefined && (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue =othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']// 'Sold';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                            } else { }
                            for (let k in othertestkey) {
                                for (let l in othertestkey[k]['value']) {
                                    if(this.isSurestSoldOther && this.isTradSoldOther){
                                        if(othertestkey[k]['value'][l].surestDispValue == ''){
                                            othertestkey[k]['value'][l].surestDispValue = 'N/A';
                                        }
                                        if(othertestkey[k]['value'][l].otherProductDispositionValue == ''){
                                            othertestkey[k]['value'][l].otherProductDispositionValue = 'N/A';
                                        }
                                    }
                                }
                                for (let l in othertestkey[k]['value']) {
                                    if (othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T2' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T3' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T4') {
                                        othertestkey[k]['value'][l].isCancerPresent = true;
                                        othertestkey[k]['value'][l].displayCancer = othertestkey[i]['value'][j]['Product2']['Name'];
                                        othertestkey[k]['value'][l].surestDispValueCancer = othertestkey[i]['value'][j]['surestDispValue'];
                                        othertestkey[k]['value'][l].otherProductDispositionValueCancer = othertestkey[i]['value'][j]['otherProductDispositionValue'];
                                        othertestkey[i]['value'][j].phsBuyUp = true;
                                    }
                                }
                            }
                        }

                        if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CCKRS' &&
                            (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                            if (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] !== undefined && (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue =othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']// 'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                            } else {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                            }
                            for (let k in othertestkey) {
                                for (let l in othertestkey[k]['value']) {
                                    if(this.isSurestSoldOther && this.isTradSoldOther){
                                        if(othertestkey[k]['value'][l].surestDispValue == ''){
                                            othertestkey[k]['value'][l].surestDispValue = 'N/A';
                                        }
                                        if(othertestkey[k]['value'][l].otherProductDispositionValue == ''){
                                            othertestkey[k]['value'][l].otherProductDispositionValue = 'N/A';
                                        }
                                    }
                                }
                                for (let l in othertestkey[k]['value']) {
                                   if (othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T2' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T3' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T4') {
                                        othertestkey[k]['value'][l].isKidSolPresent = true;
                                        othertestkey[k]['value'][l].displayKidSol = othertestkey[i]['value'][j]['Product2']['Name'];
                                        othertestkey[k]['value'][l].surestDispValueKidSol = othertestkey[i]['value'][j]['surestDispValue'];
                                        othertestkey[k]['value'][l].otherProductDispositionValueKidSol = othertestkey[i]['value'][j]['otherProductDispositionValue'];
                                        othertestkey[i]['value'][j].phsBuyUp = true;
                                        //console.log('----- '+JSON.stringify(othertestkey[i]['value'][j]));
                                    }
                                }
                            }
                        }

                        if (othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CCCKS' &&
                            (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                            if (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] !== undefined && (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' ||othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue =othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']// 'Sold';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']//'Sold';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue =othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c']// 'Sold';
                                }
                            } else {
                                if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest & UNET') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                } else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'Surest Only') {
                                    othertestkey[i]['value'][j].surestDispValue = 'TBD';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = '';
                                }
                                else if (othertestkey[i]['value'][j]['Buyup_Product_Selection__c'] == 'UNET or UMR Only') {
                                    othertestkey[i]['value'][j].surestDispValue = '';
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                                else {
                                    othertestkey[i]['value'][j].otherProductDispositionValue = 'TBD';
                                }
                            }
                            for (let k in othertestkey) {
                                for (let l in othertestkey[k]['value']) {
                                    if(this.isSurestSoldOther && this.isTradSoldOther){
                                        if(othertestkey[k]['value'][l].surestDispValue == ''){
                                            othertestkey[k]['value'][l].surestDispValue = 'N/A';
                                        }
                                        if(othertestkey[k]['value'][l].otherProductDispositionValue == ''){
                                            othertestkey[k]['value'][l].otherProductDispositionValue = 'N/A';
                                        }
                                    }
                                }
                                for (let l in othertestkey[k]['value']) {
                                    if (othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T2' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T3' ||
                                        othertestkey[k]['value'][l]['ProductCode'] == 'CLN-CMPHS30T4') {
                                        othertestkey[k]['value'][l].isKidResPresent = true;
                                        othertestkey[k]['value'][l].displayKidRes = othertestkey[i]['value'][j]['Product2']['Name'];
                                        othertestkey[k]['value'][l].surestDispValueKidRes = othertestkey[i]['value'][j]['surestDispValue'];
                                        othertestkey[k]['value'][l].otherProductDispositionValueKidRes = othertestkey[i]['value'][j]['otherProductDispositionValue'];
                                        othertestkey[i]['value'][j].phsBuyUp = true;
                                    }
                                }
                            }
                        }
                        //--------------------------------------PHS 3.0 PROGRAMS--------------------------------------

                        //--------------------------------------LEVEL 2 HOVER HELP--------------------------------------
                        othertestkey[i]['value'][j].displayTextarea = false;
                        othertestkey[i]['value'][j].displayPicklist = false;
                        othertestkey[i]['value'][j].placeHolder = '';
                        othertestkey[i]['value'][j].commentsLength = 0;
                        othertestkey[i]['value'][j].pickListCode = '';
                        othertestkey[i]['value'][j].CarveinOut = false;
                        othertestkey[i]['value'][j].stdCust = false;
                        othertestkey[i]['value'][j].optOther = false;

                        //Level 2 Options for Claim Fiduciary
                        /* if (othertestkey[i]['value'][j]['ProductCode'] == 'CF-CF' &&
                            othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold') {
                            othertestkey[i]['value'][j].placeHolder = 'Please Specify';
                            othertestkey[i]['value'][j].commentsLength = 25;
                        } */

                        //Level 2 Options for EAP
                        if (othertestkey[i]['value'][j]['ProductCode'] == 'BH-EAP') {
                            othertestkey[i]['value'][j].displayTextarea = true;
                            othertestkey[i]['value'][j].placeHolder = 'Indicate # of Visits';
                            othertestkey[i]['value'][j].commentsLength = 25;
                        }

                        //Able To field for Behavioral Health Solutions
                        if (othertestkey[i]['value'][j]['ProductCode'] == 'BH-BHS' &&
                            (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||  
                            othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' || 
                            othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                            othertestkey[i]['value'][j].showAbleTo = true;
                        }

                        if (this.sccHoverHelpData[0]['Indicate_Vendor__c'].split(';').includes(othertestkey[i]['value'][j]['ProductCode'])) {
                            othertestkey[i]['value'][j].displayTextarea = false;
                            othertestkey[i]['value'][j].displayPicklist = true;
                            othertestkey[i]['value'][j].placeHolder = 'Indicate Vendor';
                            othertestkey[i]['value'][j].commentsLength = 25;
                            othertestkey[i]['value'][j].CarveinOut = true;
                        }
                        if (this.sccHoverHelpData[0]['List_any_applicable_customization__c'].split(';').includes(othertestkey[i]['value'][j]['ProductCode'])) {
                            othertestkey[i]['value'][j].displayTextarea = false;
                            othertestkey[i]['value'][j].displayPicklist = true;
                            othertestkey[i]['value'][j].placeHolder = 'List any applicable customization';
                            othertestkey[i]['value'][j].commentsLength = 255;
                            othertestkey[i]['value'][j].stdCust = true;
                        }
                        if (this.sccHoverHelpData[0]['Provide_plan_code_in_text_box__c'].split(';').includes(othertestkey[i]['value'][j]['ProductCode'])) {
                            othertestkey[i]['value'][j].displayTextarea = true;
                            othertestkey[i]['value'][j].placeHolder = 'Provide plan code in text box';
                            othertestkey[i]['value'][j].commentsLength = 25;
                        }
                        //--------------------------------------LEVEL 2 HOVER HELP--------------------------------------
                    }
                }
                //---------------------------------PLACING OON AND PHS AT LAST---------------------------------
                let flag1 = true;
                for (let i in othertestkey) {
                    if (othertestkey[i]['key'] == 'Clinical') {
                        othertestkey.push(othertestkey[i]);
                        othertestkey.splice(i, 1);
                        flag1 = false;
                        break;
                    }
                }

                if (!flag1) {
                    // for (let i in othertestkey) {
                    //     for (var j=0,k=0;j<othertestkey[i]['value'].length;j++) {
                    //         if ((othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMPHS30T2' ||
                    //             othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMPHS30T3' ||
                    //             othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMPHS30T4')
                    //             && othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold') {
                    //             othertestkey[i]['value'].push(othertestkey[i]['value'][j]);
                    //             othertestkey[i]['value'].splice(j, 1);

                    //             if(j==othertestkey[i]['value'].length-(k+1) || othertestkey[i]['value'].length==1)
                    //             break;
                    //             j=j-1; k++;


                    //         }
                    //     }

                    // }

                    for (let i in othertestkey) {
                        for (let j in othertestkey[i]['value']) {
                            if ((othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMPHS30T2' ||
                                othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMPHS30T3' ||
                                othertestkey[i]['value'][j]['ProductCode'] == 'CLN-CMPHS30T4')
                                && (othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Sold' ||  
                                othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off' || 
                            othertestkey[i]['value'][j]['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In')) {
                                othertestkey[i]['value'].push(othertestkey[i]['value'][j]);
                                othertestkey[i]['value'].splice(j, 1);
                                break;
                            }
                        }
                    }
                }


                for (let i in othertestkey) {
                    if (othertestkey[i]['key'] == 'Out-of-Network Reimbursement Program - PREFERRED PACKAGE') {
                        othertestkey.push(othertestkey[i]);
                        othertestkey.splice(i, 1);
                    }
                }

                for (let i in othertestkey) {
                    if (othertestkey[i]['key'] == 'Out-of-Network Reimbursement Program - LEGACY/NON-PREFERRED PACKAGE') {
                        othertestkey.push(othertestkey[i]);
                        othertestkey.splice(i, 1);
                    }
                }


                for (let i in othertestkey) {
                    if (othertestkey[i]['key'] == 'Medical Necessity') {
                        othertestkey[i]['key'] = '';
                    }
                }

                for (let i in othertestkey) {
                    if (othertestkey[i]['key'] == 'Payment Integrity') {
                        othertestkey[i]['key'] = '';
                    }
                }
                //---------------------------------PLACING OON AND PHS AT LAST---------------------------------

                this.otherrecarray = othertestkey;

            }
            //console.log('otherrecarray --- '+JSON.stringify(this.otherrecarray));
            //Ends Here

            if (data.OppolineItemsList !== null && data.OppolineItemsList !== undefined && data.OppolineItemsList !== '') {
                if (data.OppolineItemsList.length > 0) {
                    setTimeout(() => { this.IsProductAvaiable = true; }, 2000);
                    //this.IsProductAvaiable = true;
                }
                data.OppolineItemsList.forEach(elem => {
                    opplineitemarray.push(Object.assign({}, elem));
                })
                this.Opplineitemrecords = opplineitemarray;
                this.oppLineItemsRecordsBackup = opplineitemarray;
                this.OpplineitemUpdate = opplineitemarray;
            }
            this.islineitems = true;
            this.isLoad = true;

            //--------- code added for SoldCase Audit Trail - start -----------

            this.loggedInUserId = data.loggedInUserId;
            this.oppDataBeforeEdit = Object.assign({}, data.oppdata);
            this.oppDataAfterEdit = Object.assign({}, data.oppdata);
            this.accDataBeforeEdit = Object.assign({}, data.accrec);
            let auditTrailSettingList = [...data.auditTrailSettingList];

            if (!this.isListEmpty(auditTrailSettingList)) {
                for (let i in auditTrailSettingList) {
                    if (auditTrailSettingList[i].hasOwnProperty('DeveloperName')) {
                        if (auditTrailSettingList[i].DeveloperName === 'Opportunity_ObjPrprtyFldApiName_Mapping') {
                            this.mapOfOppObjPrprtyFldApiNameMapping = this.getMapOfObjPrprtyFldApiNameMapping(auditTrailSettingList[i].Value__c);

                        } else if (auditTrailSettingList[i].DeveloperName === 'Account_ObjPrprtyFldApiName_Mapping') {
                            this.mapOfAccObjPrprtyFldApiNameMapping = this.getMapOfObjPrprtyFldApiNameMapping(auditTrailSettingList[i].Value__c);
                        } else if (auditTrailSettingList[i].DeveloperName === 'OppLineItem_ObjPrprtyFldApiName_Mapping') {
                            this.mapOfOppLineItemObjPrprtyFldApiNameMapping = this.getMapOfObjPrprtyFldApiNameMapping(auditTrailSettingList[i].Value__c);
                        }
                    }
                }
            }
            let oppLineItemRecMapBeforeEdit = {};

            for (let i in this.Opplineitemrecords) {
                let eachOppLineItemRec = Object.assign({}, this.Opplineitemrecords[i]);
                oppLineItemRecMapBeforeEdit[eachOppLineItemRec.Id] = eachOppLineItemRec;
            }

            this.oppLineItemRecMapBeforeEdit = Object.assign({}, oppLineItemRecMapBeforeEdit);


            //--------- code added for SoldCase Audit Trail - end -----------
            this.onCancel = true;
            this.onCancelPharmacyProd = true;
        }
    }

    get getFormattedCompanyAddress() {
        //Build Company address by adding Comma in between based on value received 
        let companyAddress = '';
        if (this.ClientDataRecord['Account']['BillingAddress'] !== undefined) {
            if (this.ClientDataRecord['Account']['BillingAddress']['street'] !== undefined) {
                companyAddress = this.ClientDataRecord['Account']['BillingAddress']['street'];
            }
            if (this.ClientDataRecord['Account']['BillingAddress']['city'] !== undefined && companyAddress !== '') {
                companyAddress += ', ' + this.ClientDataRecord['Account']['BillingAddress']['city'];
            } else if (this.ClientDataRecord['Account']['BillingAddress']['city'] !== undefined) {
                companyAddress = this.ClientDataRecord['Account']['BillingAddress']['city'];
            }
            /* if (this.ClientDataRecord['Account']['BillingAddress']['state'] !== undefined && companyAddress !== '') {
                 companyAddress += ', ' + this.ClientDataRecord['Account']['BillingAddress']['state'];
             } else if (this.ClientDataRecord['Account']['BillingAddress']['state'] !== undefined) {
                 companyAddress = this.ClientDataRecord['Account']['BillingAddress']['state'];
             } */
            if (this.ClientDataRecord['Account']['BillingAddress']['stateCode'] !== undefined && companyAddress !== '') {
                companyAddress += ', ' + this.ClientDataRecord['Account']['BillingAddress']['stateCode'];
            } else if (this.ClientDataRecord['Account']['BillingAddress']['stateCode'] !== undefined) {
                companyAddress = this.ClientDataRecord['Account']['BillingAddress']['stateCode'];
            }
            if (this.ClientDataRecord['Account']['BillingAddress']['postalCode'] !== undefined && companyAddress !== '') {
                companyAddress += ', ' + this.ClientDataRecord['Account']['BillingAddress']['postalCode'];
            } else if (this.ClientDataRecord['Account']['BillingAddress']['postalCode'] !== undefined) {
                companyAddress = this.ClientDataRecord['Account']['BillingAddress']['postalCode'];
            }
            if (this.ClientDataRecord['Account']['BillingAddress']['country'] !== undefined && companyAddress !== '') {
                companyAddress += ', ' + this.ClientDataRecord['Account']['BillingAddress']['country'];
            } else if (this.ClientDataRecord['Account']['BillingAddress']['country'] !== undefined) {
                companyAddress = this.ClientDataRecord['Account']['BillingAddress']['country'];
            }
            this.companyAddress = companyAddress;
        }
        return companyAddress;
    }

    enableSaveCancel() {
        // this.isLoad = true;
        //this.onCancel = false;
        this.onCancelPharmacyProd = false;
        setTimeout(() => {
            //this.onCancel = true;
            this.onCancelPharmacyProd = true;
            this.showSaveCancel = true;
            //this.isLoad = false;
        }, 100);
    }

    Cancel() {
        this.showSaveCancel = false;
        this.onCancelPharmacyProd = false;
        this.isLoad = false;
        this.onCancel = false;
        refreshApex(this.resultSoldchecklist)
            .then(() => {
                this.isLoad = true;
                setTimeout(() => {
                    this.onCancel = true;
                    this.onCancelPharmacyProd = true;
                }, 3000);
            })

        //this.handleRefreshButton();
        //     this.showSaveCancel = false;
        //     this.onCancelPharmacyProd = false;
        //     this.onCancel = false;
        //    // this.ClientDataRecord = Object.assign({}, this.ClientDataRecordBackup);
        //     //this.Opplineitemrecords = Object.assign({}, this.oppLineItemsRecordsBackup);
        //     setTimeout(() => {
        //         this.onCancel = true;
        //         this.onCancelPharmacyProd = true;
        //     }, 300);
        //      refreshApex(this.resultSoldchecklist)
        //      .then(() => {
        //         // this.soldCaseObjectData = { ...this.soldCaseObjectData };
        //         // const child = this.template.querySelector('c-sold-case-clinical-program');
        //         // if (child) {
        //         //     child.refreshChildData();
        //         // }
        //      })
        //     .catch(error => {
        //         this.isLoad = true;
        //         this.dispatchEvent(
        //             new ShowToastEvent({
        //                 title: 'Error refreshing data',
        //                 message: error.body.message,
        //                 variant: 'error'
        //             })
        //         );
        //     });
    }

  @track showEmailModal = false;
  @track emails = [];
  selectedEmails = [];
   handleEmailPopUp(){
        this.showEmailModal = true;

            getValidationEmails({ accId: this.ClientDataRecord.AccountId })
                .then(result => {
                    this.emails = result;
                    this.selectedEmails = result.map(emailOption => emailOption.value);
                })
                .catch(error => {
                    console.error(error);
                });
    }
    closeModal() {
        this.showEmailModal = false;
    }

    handleSelection(event) {
        this.selectedEmails = event.detail.value;
    }
    sendReport() {
        console.log('Selected emails:', this.selectedEmails);
        if (!this.selectedEmails || this.selectedEmails.length === 0) {
            this.showToast('Error', 'Please select at least one email', 'error');
            return;
        }
        this.commonValidation(); 
        this.closeModal(); 
    }

    async commonValidation() {
        this.isLoad = false;
        await this.disableEditButton();
        await sendEmailWithPDF({ salesorIPM:this.SalesOrIPM,recordId: this.ClientDataRecord.Id, accountName: this.ClientDataRecord.Account.Name, oppName: this.ClientDataRecord.Name, effectiveDate: this.ClientDataRecord.EffectiveDate__c, selectedEmails: this.selectedEmails })
            .then((results) => {
                
                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Email has been sent Successfully',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);
                // var now = new Date();
                // let editfielddetails;
                // this.generalProductDetails['Completed_by_Sales__c'] = true;
                //  editfielddetails = [{ fieldedited: 'Completed_by_Sales__c', fieldvalue: true },
                //  { fieldedited: 'Last_email_sent_by_sales__c', fieldvalue: now }];
                // const ClientDetailRecord = new CustomEvent("progressvaluechange", {
                //   detail: editfielddetails
                // });

                // this.dispatchEvent(ClientDetailRecord);
                this.isLoad = true;
            })
            .catch((error) => {
                console.log('sceValidation  error----> ' + JSON.stringify(error));
                const event = new ShowToastEvent({
                    variant: 'error',
                    title: 'ERROR',
                    message: 'Error while sending Email. Please contact your administrator',
                });
                this.dispatchEvent(event);
                this.isLoad = true;
            })
    }

    clientdataupdate(event) {
        //console.log('editfielddetails in MAIN comp ' + JSON.stringify(event.detail));
        let eventdata = event.detail;
        let fielddata = Object.assign({}, this.UpdatedClientDetialData);

        //console.log('Edited Data in main comp '+JSON.stringify(eventdata));

        //--------- code added for SoldCase Audit Trail - start -----------
        let oppFieldEditedMap = Object.assign({}, this.oppFieldEditedMap);
        let mapOfOppObjPrprtyFldApiNameMapping = Object.assign({}, this.mapOfOppObjPrprtyFldApiNameMapping);
        let oppDataAfterEdit = Object.assign({}, this.oppDataAfterEdit);
        //--------- code added for SoldCase Audit Trail - end -----------


        eventdata.forEach(item => {
           if (item.fieldedited === 'Completed_by_Sales__c') {
                this.updatedBySales = item.fieldvalue === true;
                this.SalesOrIPM ='Sales';
            }
            else if (
                item.fieldedited === 'Last_email_sent_by_sales__c' &&
                this.updatedBySales !== false 
            ) {
                this.updatedBySales = true;
                this.SalesOrIPM ='Sales';
            }

             if (item.fieldedited === 'Completed_by_IPM__c') {
                this.updatedByIPM = item.fieldvalue === true;
                this.SalesOrIPM ='IPM';
            }
            else if (
                item.fieldedited === 'Completed_by_IPM__c' &&
                this.updatedByIPM !== false 
            ) {
                this.updatedByIPM = true;
                this.SalesOrIPM ='IPM';
            }

            if (item.fieldedited === 'Passport_Connect_with_Harvard_Pilgrim__c') {
                if (item.fieldvalue === 'No') {
                    //Clearing out Harvard Pilgrim – Total Membership & Harvard Pilgrim – Employee Only When Passport_Connect_with_Harvard_Pilgrim__c is choosen as No.
                    if (fielddata.hasOwnProperty('HP_Sold_Retained_Members__c')) {
                        fielddata['HP_Sold_Retained_Members__c'] = '';
                    }

                    if (fielddata.hasOwnProperty('HP_Sold_Retained_Employees_Only__c')) {
                        fielddata['HP_Sold_Retained_Employees_Only__c'] = '';
                    }
                }
                fielddata[item.fieldedited] = item.fieldvalue;
            }
            else if (item.fieldedited.indexOf('Account.') !== -1) {
                let cloneLookupRecord = Object.assign({}, fielddata['Account']);
                cloneLookupRecord[item.fieldedited.split('.')[1]] = item.fieldvalue;
                fielddata['Account'] = cloneLookupRecord;
                this.AccountdetailData[item.fieldedited.split('.')[1]] = item.fieldvalue;
            }
            //--------------------------------SAMARTH SCC 2021--------------------------------
            else if (item.fieldedited.indexOf('Sold_Case_Checklist__c.') !== -1) {
                //console.log('Entering else if');
                let cloneLookupRecord = Object.assign({}, this.updatedSoldCaseData);
                cloneLookupRecord[item.fieldedited.split('.')[1]] = item.fieldvalue;
                this.updatedSoldCaseData = cloneLookupRecord;
            }
            //--------------------------------SAMARTH SCC 2021--------------------------------
            else {
                //console.log('coming inside this ELSE');
                fielddata[item.fieldedited] = item.fieldvalue;
                //console.log('fielddata inside '+JSON.stringify(fielddata[item.fieldedited]));
            }
            //console.log('fielddata '+JSON.stringify(fielddata));
            this.UpdatedClientDetialData = fielddata;

            //--------- code added for SoldCase Audit Trail - start -----------
            if (item.fieldedited.indexOf('Account.') !== -1) {
                let fieldEdited = item.fieldedited.split('.')[1];
                let accFieldEditedMap = {};
                accFieldEditedMap = Object.assign({}, this.accFieldEditedMap);
                let mapOfAccObjPrprtyFldApiNameMapping = Object.assign({}, this.mapOfAccObjPrprtyFldApiNameMapping);

                if (this.isMapEmpty(accFieldEditedMap)) {
                    if (!this.isMapEmpty(mapOfAccObjPrprtyFldApiNameMapping)) {
                        if (mapOfAccObjPrprtyFldApiNameMapping.hasOwnProperty(fieldEdited)) {
                            accFieldEditedMap[fieldEdited] = mapOfAccObjPrprtyFldApiNameMapping[fieldEdited];
                        }

                    }
                } else if (!accFieldEditedMap.hasOwnProperty(fieldEdited)) {
                    if (!this.isMapEmpty(mapOfAccObjPrprtyFldApiNameMapping)) {
                        if (mapOfAccObjPrprtyFldApiNameMapping.hasOwnProperty(fieldEdited)) {
                            accFieldEditedMap[fieldEdited] = mapOfAccObjPrprtyFldApiNameMapping[fieldEdited];
                        }

                    }

                }
                this.accFieldEditedMap = {};
                this.accFieldEditedMap = accFieldEditedMap;
            }
            else {
                let fielddata1 = {};
                fielddata1 = Object.assign({}, fielddata);
                if (oppDataAfterEdit.hasOwnProperty('IPM__r')) {

                    fielddata1['IPM__r'] = oppDataAfterEdit['IPM__r'];
                }
                if (item.fieldedited === 'IPM__c') {
                    let val = { 'Name': item.fieldvalue1 };
                    fielddata1['IPM__r'] = val;
                }
                this.oppDataAfterEdit = {};
                this.oppDataAfterEdit = fielddata1;

                if (this.isMapEmpty(oppFieldEditedMap) && (item.fieldedited !== 'IPM__c')) {
                    if (!this.isMapEmpty(mapOfOppObjPrprtyFldApiNameMapping)) {
                        if (mapOfOppObjPrprtyFldApiNameMapping.hasOwnProperty(item.fieldedited)) {
                            oppFieldEditedMap[item.fieldedited] = mapOfOppObjPrprtyFldApiNameMapping[item.fieldedited];
                        }
                        if (item.fieldedited === 'Passport_Connect_with_Harvard_Pilgrim__c'
                            && item.fieldvalue === 'No') {
                            if (mapOfOppObjPrprtyFldApiNameMapping.hasOwnProperty('HP_Sold_Retained_Members__c')) {
                                oppFieldEditedMap['HP_Sold_Retained_Members__c'] = mapOfOppObjPrprtyFldApiNameMapping['HP_Sold_Retained_Members__c'];
                            }
                            if (mapOfOppObjPrprtyFldApiNameMapping.hasOwnProperty('HP_Sold_Retained_Employees_Only__c')) {
                                oppFieldEditedMap['HP_Sold_Retained_Employees_Only__c'] = mapOfOppObjPrprtyFldApiNameMapping['HP_Sold_Retained_Employees_Only__c'];
                            }


                        }
                    }
                }
                else if (!oppFieldEditedMap.hasOwnProperty(item.fieldedited) && (item.fieldedited !== 'IPM__c')) {
                    if (!this.isMapEmpty(mapOfOppObjPrprtyFldApiNameMapping)) {
                        if (mapOfOppObjPrprtyFldApiNameMapping.hasOwnProperty(item.fieldedited)) {
                            oppFieldEditedMap[item.fieldedited] = mapOfOppObjPrprtyFldApiNameMapping[item.fieldedited];
                        }
                        if (item.fieldedited === 'Passport_Connect_with_Harvard_Pilgrim__c'
                            && item.fieldvalue === 'No') {
                            if (!oppFieldEditedMap.hasOwnProperty('HP_Sold_Retained_Members__c') &&
                                mapOfOppObjPrprtyFldApiNameMapping.hasOwnProperty('HP_Sold_Retained_Members__c')) {
                                oppFieldEditedMap['HP_Sold_Retained_Members__c'] = mapOfOppObjPrprtyFldApiNameMapping['HP_Sold_Retained_Members__c'];
                            }
                            if (!oppFieldEditedMap.hasOwnProperty('HP_Sold_Retained_Employees_Only__c') &&
                                mapOfOppObjPrprtyFldApiNameMapping.hasOwnProperty('HP_Sold_Retained_Employees_Only__c')) {
                                oppFieldEditedMap['HP_Sold_Retained_Employees_Only__c'] = mapOfOppObjPrprtyFldApiNameMapping['HP_Sold_Retained_Employees_Only__c'];
                            }
                        }
                    }

                }

                if (item.fieldedited === 'IPM__c') {
                    if ((this.isMapEmpty(oppFieldEditedMap) || !oppFieldEditedMap.hasOwnProperty('IPM__r.Name')) &&
                        mapOfOppObjPrprtyFldApiNameMapping.hasOwnProperty('IPM__r.Name')) {
                        oppFieldEditedMap['IPM__r.Name'] = mapOfOppObjPrprtyFldApiNameMapping['IPM__r.Name'];
                    }

                }
                this.oppFieldEditedMap = {};
                this.oppFieldEditedMap = oppFieldEditedMap;
                //---------------
            }
            //--------- code added for SoldCase Audit Trail - end -----------       
        });
    }

    accountdataupdate(event) {
        let acceventdata = event.detail;

        let accfielddata = Object.assign({}, this.AccountdetailData);

        //--------- code added for SoldCase Audit Trail - start ----------- 
        let accFieldEditedMap = {};
        accFieldEditedMap = Object.assign({}, this.accFieldEditedMap);
        let mapOfAccObjPrprtyFldApiNameMapping = Object.assign({}, this.mapOfAccObjPrprtyFldApiNameMapping);

        //--------- code added for SoldCase Audit Trail - end ----------- 

        acceventdata.forEach(item => {
            accfielddata[item.fieldedited] = item.fieldvalue;
            this.AccountdetailData = accfielddata;

            //--------- code added for SoldCase Audit Trail - start ----------- 


            if (this.isMapEmpty(accFieldEditedMap)) {
                if (!this.isMapEmpty(mapOfAccObjPrprtyFldApiNameMapping)) {
                    if (mapOfAccObjPrprtyFldApiNameMapping.hasOwnProperty(item.fieldedited)) {
                        accFieldEditedMap[item.fieldedited] = mapOfAccObjPrprtyFldApiNameMapping[item.fieldedited];
                    }

                }
            } else if (!accFieldEditedMap.hasOwnProperty(item.fieldedited)) {
                if (!this.isMapEmpty(mapOfAccObjPrprtyFldApiNameMapping)) {
                    if (mapOfAccObjPrprtyFldApiNameMapping.hasOwnProperty(item.fieldedited)) {
                        accFieldEditedMap[item.fieldedited] = mapOfAccObjPrprtyFldApiNameMapping[item.fieldedited];
                    }

                }

            }


            this.accFieldEditedMap = {};
            this.accFieldEditedMap = accFieldEditedMap;
            //--------- code added for SoldCase Audit Trail - end ----------- 
        });

        //accfielddata[acceventdata.fieldedited] = acceventdata.fieldvalue;
        //this.AccountdetailData = accfielddata;

    }

    /* opplineupdate(event){
         let opplineitemdata = event.data;
         let oppfielddata = [...this.OpplineitemUpdate];
         oppfielddata[opplineitemdata.fieldedited] = opplineitemdata.fieldvalue;
         this.OpplineitemUpdate = oppfielddata;
         alert(JSON.stringify(this.OpplineitemUpdate));
 
     }
 */

    handleRefreshButton() {
        // this.onCancelPharmacyProd = false;
        // this.onCancel = false;
        // this.ClientDataRecord = Object.assign({}, this.ClientDataRecordBackup);
        // this.Opplineitemrecords = Object.assign({}, this.oppLineItemsRecordsBackup);
        // setTimeout(() => {
        //     this.onCancel = true;
        //     this.onCancelPharmacyProd = true;
        // }, 300);
        this.isLoad = false;
         this.onCancel = false;
        refreshApex(this.resultSoldchecklist)
         .then(() => {
            // this.soldCaseObjectData = { ...this.soldCaseObjectData };
            // const child = this.template.querySelector('c-sold-case-clinical-program');
            // if (child) {
            //     child.refreshChildData();
            // }
            this.isLoad = true;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Sold Case Checklist has been refreshed with the latest product and company information.',
                    variant: 'success'
                })
            );
             setTimeout(() => {
            this.onCancel = true;
            this.onCancelPharmacyProd = true;
        }, 3000);
            })
            .catch(error => {
                this.isLoad = true;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error refreshing data',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        // this.isLoad = false;
        // setTimeout(() => {
        //     this.isLoad = true;
        // }, 3000);

    }

    handleSave(){
        if(this.showCPWSection == true && this.updatedBySales == true){
            this.SalesOrIPM ='Sales';
            this.handleEmailPopUp(); 
        }
        else{
            if(this.updatedByIPM || this.updatedBySales){
               // this.SalesOrIPM = this.updatedByIPM ?'IPM':'Sales';
               let listEmails = [];
               listEmails.push(this.ClientDataRecord.Owner.Email);
               listEmails.push(this.ClientDataRecord.CreatedBy.Email); 
               if(this.soldCaseObjectData.IPM__r!=undefined)
               listEmails.push(this.soldCaseObjectData.IPM__r.Email);

                this.selectedEmails =listEmails;//['veera.nandimandalam@crmit.com'];
                this.sendReport();
            }
            else
            this.disableEditButton()
        }
       
    }

    async disableEditButton() {

        const getupdateopplinedata = this.template.querySelector("c-sold-case-products-comp");
        var getupdateddata = getupdateopplinedata.updateOppline();
        console.log(`getupdateddata = ${JSON.stringify(getupdateddata)}`);

        const validateLineItemProductsComp = this.template.querySelector('c-sold-case-products-comp');
        let isAllLineitemProductsInputsValid = validateLineItemProductsComp.validateForm();

        const validateClientDetailsComp = this.template.querySelector('c-sold-check-client-detail-comp');
        let isAllDetailInputsValid = validateClientDetailsComp.validateForm();

        const validateNetworkComp = this.template.querySelector('c-sold-case-network-comp');
        let isAllNetworkInputsValid = validateNetworkComp.validateForm();

        const validateGeneralComp = this.template.querySelector('c-sold-case-general-comp');
        let isAllGeneralInputsValid = validateGeneralComp.validateForm();

        //console.log('getupdateddata in main JS?????' + getupdateddata);
        if (isAllDetailInputsValid && isAllNetworkInputsValid && isAllGeneralInputsValid && isAllLineitemProductsInputsValid) {
            const credAndAllowanceComp = this.template.querySelector('c-sold-case-performance-guarantees');
            if (credAndAllowanceComp) {
                let credAndAllowancesReturnData = await credAndAllowanceComp.handleChange(this.updatedSoldCaseData);
                this.updatedSoldCaseData = credAndAllowancesReturnData;

                let surestGuaranteesReturnData = await credAndAllowanceComp.handleDataChange(this.updatedSoldCaseData);
                this.updatedSoldCaseData = surestGuaranteesReturnData;

                let guaranteesReturnData = await credAndAllowanceComp.generateParentData(this.updatedSoldCaseData);
                this.updatedSoldCaseData = guaranteesReturnData;
            }

            const vendorComp = this.template.querySelector('c-sold-case-vendor-partners');
            if (vendorComp) {
                let vendorReturnData = await vendorComp.generateParentData(this.updatedSoldCaseData);
                this.updatedSoldCaseData = vendorReturnData;
            }

            // const clinicalPrgmComp = this.template.querySelector('c-sold-case-clinical-program');
            // if (clinicalPrgmComp) {
            //     let clinicalPrgmReturnData = await clinicalPrgmComp.generateParentData(this.updatedSoldCaseData);
            //     this.updatedSoldCaseData = clinicalPrgmReturnData;
            // }


            this.isLoad = false;
            this.showSaveCancel = false;
            //--------- code added for SoldCase Audit Trail - start -----------
            let auditTrailListToInsert = [];
            if (!this.isMapEmpty(this.oppFieldEditedMap)) {
                let apiNameObjPropMappingLst = [];
                let oppRecWrpprBeforeEdit = {};
                let oppRecWrpprAfterEdit = {};
                let oppFieldEditedMap = Object.assign({}, this.oppFieldEditedMap);

                for (let i in oppFieldEditedMap) {
                    apiNameObjPropMappingLst.push(oppFieldEditedMap[i]);
                }
                let oppDataBeforeEdit = Object.assign({}, this.oppDataBeforeEdit);
                let beforeEditOppRecWrpprLst = this.buildRecWrapper([oppDataBeforeEdit], apiNameObjPropMappingLst);
                if (!this.isListEmpty(beforeEditOppRecWrpprLst)) {
                    oppRecWrpprBeforeEdit = beforeEditOppRecWrpprLst[0];
                }
                let oppDataAfterEdit = Object.assign({}, this.oppDataAfterEdit);
                let afterEditOppRecWrpprLst = this.buildRecWrapper([oppDataAfterEdit], apiNameObjPropMappingLst);
                if (!this.isListEmpty(afterEditOppRecWrpprLst)) {
                    oppRecWrpprAfterEdit = afterEditOppRecWrpprLst[0];
                }
                if (!this.isMapEmpty(oppRecWrpprBeforeEdit) && !this.isMapEmpty(oppRecWrpprAfterEdit)) {
                    let oppAuditTrailRecListToInsert = this.buildAuditTrailListToInsert(oppRecWrpprBeforeEdit, oppRecWrpprAfterEdit, '', '', 'Opportunity');

                    for (let i in oppAuditTrailRecListToInsert) {
                        auditTrailListToInsert.push(oppAuditTrailRecListToInsert[i]);
                    }
                }


            }
            if (!this.isMapEmpty(this.accFieldEditedMap)) {
                let apiNameObjPropMappingLst = [];
                let accRecWrpprBeforeEdit = {};
                let accRecWrpprAfterEdit = {};
                let accFieldEditedMap = Object.assign({}, this.accFieldEditedMap);

                for (let i in accFieldEditedMap) {
                    apiNameObjPropMappingLst.push(accFieldEditedMap[i]);
                }
                let accDataBeforeEdit = Object.assign({}, this.accDataBeforeEdit);
                let beforeEditAccRecWrpprLst = this.buildRecWrapper([accDataBeforeEdit], apiNameObjPropMappingLst);
                if (!this.isListEmpty(beforeEditAccRecWrpprLst)) {
                    accRecWrpprBeforeEdit = beforeEditAccRecWrpprLst[0];
                }
                let accDataAfterEdit = Object.assign({}, this.AccountdetailData);
                let afterEditAccRecWrpprLst = this.buildRecWrapper([accDataAfterEdit], apiNameObjPropMappingLst);
                if (!this.isListEmpty(afterEditAccRecWrpprLst)) {
                    accRecWrpprAfterEdit = afterEditAccRecWrpprLst[0];
                }
                if (!this.isMapEmpty(accRecWrpprBeforeEdit) && !this.isMapEmpty(accRecWrpprAfterEdit)) {
                    let accntAuditTrailRecListToInsert = this.buildAuditTrailListToInsert(accRecWrpprBeforeEdit, accRecWrpprAfterEdit, '', '', 'Account');
                    for (let i in accntAuditTrailRecListToInsert) {
                        auditTrailListToInsert.push(accntAuditTrailRecListToInsert[i]);
                    }
                }

            }
            if (!this.isListEmpty(getupdateddata)) {
                let apiNameObjPropMappingLst = [];
                let oppLineItemLstBeforeEdit = [];
                let oppLineItemLstAfterEdit = [];
                let oppLineItemEditedMap = {};


                let oppLineItemRecMapBeforeEdit = Object.assign({}, this.oppLineItemRecMapBeforeEdit);
                let mapOfOppLineItemObjPrprtyFldApiNameMapping = Object.assign({}, this.mapOfOppLineItemObjPrprtyFldApiNameMapping);

                for (let i in getupdateddata) {
                    let updatedOppLineItem = Object.assign({}, getupdateddata[i]);
                    oppLineItemEditedMap[updatedOppLineItem.Id] = updatedOppLineItem;

                }



                for (let i in oppLineItemEditedMap) {
                    oppLineItemLstAfterEdit.push(oppLineItemEditedMap[i]);
                    oppLineItemLstBeforeEdit.push(oppLineItemRecMapBeforeEdit[i]);

                }


                for (let i in mapOfOppLineItemObjPrprtyFldApiNameMapping) {
                    apiNameObjPropMappingLst.push(mapOfOppLineItemObjPrprtyFldApiNameMapping[i]);
                }
                let oppLineItemWrpprLstBeforeEdit = this.buildRecWrapper(oppLineItemLstBeforeEdit, apiNameObjPropMappingLst);


                let oppLineItemWrpprLstAfterEdit = this.buildRecWrapper(oppLineItemLstAfterEdit, apiNameObjPropMappingLst);

                if (!this.isListEmpty(oppLineItemWrpprLstBeforeEdit) &&
                    !this.isListEmpty(oppLineItemWrpprLstAfterEdit)) {
                    for (let i in oppLineItemWrpprLstBeforeEdit) {
                        let productLine = '';
                        let productName = '';
                        if (oppLineItemLstBeforeEdit[i].hasOwnProperty('Product_Line__c')
                            && !this.isBlank(oppLineItemLstBeforeEdit[i].Product_Line__c)) {
                            productLine = oppLineItemLstBeforeEdit[i].Product_Line__c;
                        }
                        if (oppLineItemLstBeforeEdit[i].hasOwnProperty('Product2')
                            && oppLineItemLstBeforeEdit[i].Product2.hasOwnProperty('Name')
                            && !this.isBlank(oppLineItemLstBeforeEdit[i].Product2.Name)) {
                            productName = oppLineItemLstBeforeEdit[i].Product2.Name;
                        }
                        if (!this.isMapEmpty(oppLineItemWrpprLstBeforeEdit[i])
                            && !this.isMapEmpty(oppLineItemWrpprLstAfterEdit[i])) {
                            let oppLineItemAuditTrailRecListToInsert = this.buildAuditTrailListToInsert(oppLineItemWrpprLstBeforeEdit[i],
                                oppLineItemWrpprLstAfterEdit[i], productLine, productName, 'OpportunityLineItem');
                            for (let j in oppLineItemAuditTrailRecListToInsert) {
                                auditTrailListToInsert.push(oppLineItemAuditTrailRecListToInsert[j]);
                            }
                        }


                    }
                }

            }

            //console.log(`auditTrailListToInsert ${JSON.stringify(auditTrailListToInsert)}`)

            //--------- code added for SoldCase Audit Trail - end -----------

        console.log(JSON.stringify(this.UpdatedClientDetialData));
            UpdateClientData({
                Updateddata: this.UpdatedClientDetialData,
                accupdate: this.AccountdetailData,
                opplineitem: getupdateddata,
                auditTrailListToInsert: auditTrailListToInsert,
                updatedSoldCaseData: this.updatedSoldCaseData
            })
                .then(result => {
                    if (result) {
                        this.updatedByIPM =false;
                        this.updatedBySales =false;
                        //console.log('after update Result' + JSON.stringify(result));
                        refreshApex(this.resultSoldchecklist);
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Success',
                                message: 'SoldCase Checklist updated successfully',
                                variant: 'success'
                            })
                        );
                        let temp = JSON.parse(JSON.stringify(this.soldCaseObjectData));
                        this.soldCaseObjectData = temp;

                        this.isLoad = true;
                        fireEvent(this.pageRef, "soldCaseFormUpdated", true);
                    }
                })
                .catch(error => {
                    if (error) {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error creating record',
                                message: error,
                                variant: 'error'
                            })
                        );
                    }
                    this.isLoad = true;
                });
        }

    }

    /*  @api invokePrintMethod() {
          this.exportRecords();
      } */

    //Method for exporting records starts 
    exportRecords() {
        getSoldcasePdf({ recordId: this.recordId })

            .then(response => {
                var strFile = "data:application/pdf;base64," + response;
                var a = document.createElement("a"); //Create <a>
                a.href = strFile
                a.download = "SoldCaseCheckList.pdf"; //File name Here
                a.click(); //Downloaded file
            });
    }



    //--------- method added for SoldCase Audit Trail - start -----------

    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }

    isListEmpty(lst) {
        //console.log('INSIDE isListEmpty')
        let isListEmpty = true;
        if (lst !== null && lst !== undefined && lst.length !== 0) {
            isListEmpty = false;
        }

        return isListEmpty;

    }

    isMapEmpty(map1) {
        for (let key in map1) {
            if (map1.hasOwnProperty(key)) return false;
        }
        return true;
    }


    getListFromValueSeparatedStr(valueSeparatedStr, valueSeparator) {
        var returnList = [];
        if (!this.isBlank(valueSeparatedStr)) {
            if (valueSeparatedStr.indexOf(valueSeparator) !== -1) {
                returnList = valueSeparatedStr.split(valueSeparator);
            }
            else {
                returnList = valueSeparatedStr;
            }
        }
        return returnList;
    }

    getMapOfObjPrprtyFldApiNameMapping(objPrprtyFldApiNameMappingStr) {
        let returnMap = {};
        if (!this.isBlank(objPrprtyFldApiNameMappingStr)) {
            let apiNameObjPropMappingList = this.getListFromValueSeparatedStr(objPrprtyFldApiNameMappingStr, ';');
            for (let i in apiNameObjPropMappingList) {
                if (apiNameObjPropMappingList[i].indexOf(':') !== -1) {
                    let eachapiNameObjPropMapping = apiNameObjPropMappingList[i].split(':');
                    //apiNameObjPropMap[eachapiNameObjPropMapping[1]] = eachapiNameObjPropMapping[0];
                    returnMap[eachapiNameObjPropMapping[1]] = apiNameObjPropMappingList[i];
                }

            }
        }
        return returnMap;

    }


    buildRecWrapper(dataList, apiNameObjPropMappingLst) {
        console.log('dataList ' + JSON.stringify(dataList));
        console.log('apiNameObjPropMappingLst ' + JSON.stringify(apiNameObjPropMappingLst));
        let returnList = [];
        let apiNameObjPropMappingList = apiNameObjPropMappingLst;
        let apiNameObjPropMap = {};

        if (!this.isListEmpty(dataList)) {

            for (let i in apiNameObjPropMappingList) {
                if (i !== undefined) {
                    if (apiNameObjPropMappingList[i].indexOf(':') !== -1) {
                        let eachapiNameObjPropMapping = apiNameObjPropMappingList[i].split(':');
                        apiNameObjPropMap[eachapiNameObjPropMapping[1]] = eachapiNameObjPropMapping[0];
                    }

                }

            }
            if (!this.isMapEmpty(apiNameObjPropMap)) {
                for (let j in dataList) {
                    if (j !== undefined) {
                        let jsonData = {};
                        for (let k in apiNameObjPropMap) {
                            if (k.indexOf('.') !== -1) {
                                let fieldApiNameSeparatedByDotArr = [];
                                fieldApiNameSeparatedByDotArr.push(k.substring(0, k.indexOf('.')));
                                fieldApiNameSeparatedByDotArr.push(k.substring(k.indexOf('.') + 1));
                                let fieldApiNameSeparatedByDot = [...fieldApiNameSeparatedByDotArr];
                                if (dataList[j].hasOwnProperty(fieldApiNameSeparatedByDot[0])) {
                                    if (fieldApiNameSeparatedByDot[1].indexOf('.') !== -1) {
                                        let fieldApiNameSeparatedByDotArr1 = [];
                                        fieldApiNameSeparatedByDotArr1.push(fieldApiNameSeparatedByDot[1].substring(0, fieldApiNameSeparatedByDot[1].indexOf('.')));
                                        fieldApiNameSeparatedByDotArr1.push(fieldApiNameSeparatedByDot[1].substring(fieldApiNameSeparatedByDot[1].indexOf('.') + 1));
                                        let fieldApiNameSeparatedByDot1 = [...fieldApiNameSeparatedByDotArr1];
                                        if (dataList[j][fieldApiNameSeparatedByDot[0]].hasOwnProperty(fieldApiNameSeparatedByDot1[0])) {
                                            if (fieldApiNameSeparatedByDot1[1].indexOf('.') !== -1) {
                                                let fieldApiNameSeparatedByDot2 = fieldApiNameSeparatedByDot1[1].split('.');
                                                if (dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]].hasOwnProperty(fieldApiNameSeparatedByDot2[0])) {
                                                    if (dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]][fieldApiNameSeparatedByDot2[0]].hasOwnProperty(fieldApiNameSeparatedByDot2[1])) {
                                                        //console.log('k==>' + k);
                                                        jsonData[apiNameObjPropMap[k]] = dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]][fieldApiNameSeparatedByDot2[0]][fieldApiNameSeparatedByDot2[1]];
                                                    } else {
                                                        jsonData[apiNameObjPropMap[k]] = '';
                                                    }
                                                } else {
                                                    jsonData[apiNameObjPropMap[k]] = '';
                                                }
                                            } else {
                                                if (dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]].hasOwnProperty(fieldApiNameSeparatedByDot1[1])) {
                                                    //console.log('k==>' + k);
                                                    jsonData[apiNameObjPropMap[k]] = dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]][fieldApiNameSeparatedByDot1[1]];
                                                } else {
                                                    jsonData[apiNameObjPropMap[k]] = '';
                                                }
                                            }

                                        } else {
                                            jsonData[apiNameObjPropMap[k]] = '';
                                        }

                                    } else {
                                        if (dataList[j][fieldApiNameSeparatedByDot[0]].hasOwnProperty(fieldApiNameSeparatedByDot[1])) {
                                            jsonData[apiNameObjPropMap[k]] = dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot[1]];
                                        } else {
                                            jsonData[apiNameObjPropMap[k]] = '';
                                        }
                                    }

                                } else {
                                    jsonData[apiNameObjPropMap[k]] = '';
                                }

                            } else {
                                if (dataList[j].hasOwnProperty(k)) {
                                    jsonData[apiNameObjPropMap[k]] = dataList[j][k];
                                } else {
                                    jsonData[apiNameObjPropMap[k]] = '';
                                }
                            }

                        }

                        if (!this.isMapEmpty(jsonData)) {
                            returnList.push(jsonData);
                        }

                    }



                }
            }

        }

        return returnList;
    }

    buildAuditTrailListToInsert(recBeforeEdit, recAfterEdit, productLine, productName, recEdited) {
        //console.log('INSIDE buildAuditTrailListToInsert');
        let returnList = [];

        if (!this.isMapEmpty(recBeforeEdit) && !this.isMapEmpty(recAfterEdit)) {
            let event = 'Field Change';
            for (let i in recBeforeEdit) {
                let field = '';
                let originalValue = '';
                let newValue = '';
                if (recEdited === 'OpportunityLineItem') {
                    if (!this.isBlank(productLine)) {
                        field += productLine + ' -> ';
                    } if (!this.isBlank(productName)) {
                        field += productName + ' -> ';
                    }
                    field += i;
                } else {
                    field = i;
                }

                if (recAfterEdit.hasOwnProperty(i) && (i === 'Sold/Retained - Employees Only'
                    || i === 'R&C Percentage' || i === 'Physician R&C' || i === 'Tolerance Level'
                    || i === 'HP-Sold/Retained Members' || i === 'HP-Sold/Retained Employees Only'
                    || i === 'Credits and Allowances')) {

                    if (!this.isBlank(recBeforeEdit[i])) {
                        originalValue = recBeforeEdit[i].toString();
                    }
                    if (!this.isBlank(recAfterEdit[i])) {
                        newValue = recAfterEdit[i].toString();
                    }

                    /*if(i==='R&C Percentage' || i==='Physician R&C' || i==='Tolerance Level'){
                        if(!this.isBlank(originalValue) || !this.isBlank(newValue)){
                            if(!this.isBlank(originalValue) && this.isBlank(newValue)){
                                originalValue=this.formatNumber(originalValue);
                                returnList.push(this.buildAuditTrailRec(field,event,originalValue,newValue));
                            }else if(this.isBlank(originalValue) && !this.isBlank(newValue)){
                                newValue=this.formatNumber(newValue);
                                returnList.push(this.buildAuditTrailRec(field,event,originalValue,newValue));
                            }else{
                                if(!isNaN(originalValue) && !isNaN(newValue)
                                    && parseFloat(originalValue)!==parseFloat(newValue)){
                                    originalValue=this.formatNumber(originalValue);
                                    newValue=this.formatNumber(newValue);   
                                    returnList.push(this.buildAuditTrailRec(field,event,originalValue,newValue));
                                }
                            }
                        }
                    }else{*/
                    if (!this.isBlank(originalValue) || !this.isBlank(newValue)) {
                        if (!this.isBlank(originalValue) && this.isBlank(newValue)) {
                            originalValue = this.formatNumber(originalValue);
                            returnList.push(this.buildAuditTrailRec(field, event, originalValue, newValue));
                        } else if (this.isBlank(originalValue) && !this.isBlank(newValue)) {
                            newValue = this.formatNumber(newValue);
                            returnList.push(this.buildAuditTrailRec(field, event, originalValue, newValue));
                        } else {
                            if (!isNaN(originalValue) && !isNaN(newValue)
                                && parseInt(originalValue) !== parseInt(newValue)) {
                                originalValue = this.formatNumber(originalValue);
                                newValue = this.formatNumber(newValue);
                                returnList.push(this.buildAuditTrailRec(field, event, originalValue, newValue));
                            }
                        }
                    }
                    //}

                }
                else if (recAfterEdit.hasOwnProperty(i) && i === 'First Renewal Date') {
                    //console.log('Before Edit==>' + recBeforeEdit[i]);
                    //console.log('After Edit==>' + recAfterEdit[i]);


                    let dateBeforeEdit = recBeforeEdit[i];
                    let dateAfterEdit = recAfterEdit[i];


                    if (!this.isBlank(dateBeforeEdit) || !this.isBlank(dateAfterEdit)) {
                        if (!this.isBlank(dateBeforeEdit) && this.isBlank(dateAfterEdit)) {
                            originalValue = this.formatDate(dateBeforeEdit);
                            newValue = '';
                            returnList.push(this.buildAuditTrailRec(field, event, originalValue, newValue));

                        } else if (this.isBlank(dateBeforeEdit) && !this.isBlank(dateAfterEdit)) {
                            originalValue = '';
                            newValue = this.formatDate(dateAfterEdit);
                            returnList.push(this.buildAuditTrailRec(field, event, originalValue, newValue));
                        } else {
                            let dateBeforeEdit1 = this.parseDate(dateBeforeEdit);
                            let dateAfterEdit1 = this.parseDate(dateAfterEdit);
                            if (dateBeforeEdit1.getTime() !== dateAfterEdit1.getTime()) {
                                originalValue = this.formatDate(dateBeforeEdit);
                                newValue = this.formatDate(dateAfterEdit);
                                returnList.push(this.buildAuditTrailRec(field, event, originalValue, newValue));
                            }

                        }



                    }


                }
                else {
                    if (recAfterEdit.hasOwnProperty(i) && recAfterEdit[i] !== recBeforeEdit[i]) {



                        if (!this.isBlank(recBeforeEdit[i])) {
                            originalValue = recBeforeEdit[i].toString();
                        }
                        if (!this.isBlank(recAfterEdit[i])) {
                            newValue = recAfterEdit[i].toString();
                        }

                        if (i === 'Call Site' || i === 'Claim Site' || i === 'Clinical Site'
                            || i === 'Client Platform' || i === 'Funding Type (Dental)' || i == 'Funding Type (Vision)') {
                            let lst = [];
                            for (let j in recAfterEdit[i]) {
                                lst.push(recAfterEdit[i][j]);
                            }
                            //let lst=[...recAfterEdit[i]];
                            let value = '';
                            if (!this.isListEmpty(lst)) {
                                if (lst.length > 1) {
                                    lst.sort();
                                    value = lst.join(';');
                                } else {
                                    value = lst[0];
                                }

                            }
                            newValue = value;
                        } else if (i === 'Completed by Sales' || i === 'Completed by IPM') {

                            originalValue = originalValue === 'true' ? "Yes" : "No";
                            newValue = newValue === 'true' ? "Yes" : "No";

                        }

                        returnList.push(this.buildAuditTrailRec(field, event, originalValue, newValue));

                    }
                }
            }

        }

        return returnList;
    }

    buildAuditTrailRec(fieldName, event, originalValue, newValue) {
        let auditTrailRec = {};

        auditTrailRec.Field__c = fieldName;
        auditTrailRec.User__c = this.loggedInUserId;
        auditTrailRec.Original_Value__c = originalValue;
        auditTrailRec.New_Value__c = newValue;
        auditTrailRec.Membership_Activity__c = this.recordId;
        auditTrailRec.Event__c = event;

        return auditTrailRec;
    }

    parseDate(inputDate) {
        let parts = inputDate.match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1] - 1, parts[2]); // months are 0-based
    }

    formatDate(inputDate) {
        let returnValue = '';
        if (inputDate.indexOf('-') !== -1) {
            let formattedDateArray = inputDate.split('-');
            let date = formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2];
            let month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1];
            let year = formattedDateArray[0];
            //let day = days[ this.parseDate(inputDate).getDay()];
            returnValue = month + '/' + date + '/' + year;
        }
        return returnValue;
    }

    formatNumber(num) {
        //console.log('INSIDE formatNumber');
        let returnValue = '';
        if (!this.isBlank(num) && num.toString().length > 3) {
            returnValue = parseFloat(num).toLocaleString('en');
            if (num.indexOf('.') !== -1) {
                let decimal = num.split('.')[1];
                returnValue = returnValue.split('.')[0] + '.' + decimal;
            }
        } else {
            returnValue = num;
        }
        return returnValue;

    }
    //--------- method added for SoldCase Audit Trail - end -----------

    //Added by Vignesh -- Sold Case Letter Doc
    closeAction(){
              this.dispatchEvent(new CloseActionScreenEvent());
    }

    importSCLetterInfo(){
        console.log('inside word ');
        
        let vfPageUrl = '/apex/soldCaseLetterDoc?wordReport=word&Id=' + this.recordId;
        
        let a = document.createElement('a');
        a.href = vfPageUrl;
        document.body.appendChild(a);
        a.click();
        const evnt = new CustomEvent('loaded', {
            detail: this.loaded
        });
        this.dispatchEvent(evnt);
            this.closeAction();
    }

}