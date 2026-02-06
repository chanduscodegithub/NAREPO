/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-10-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import oppLineItem from '@salesforce/schema/OpportunityLineItem';
import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';
import Flex_Options__c from '@salesforce/schema/OpportunityLineItem.Flex_Options__c';
//import oppobjct from '@salesforce/schema/OpportunityLineItem';



//---------------------------------SAMARTH SCC 2021---------------------------------
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import SccObject from '@salesforce/schema/Sold_Case_Checklist__c';
//---------------------------------SAMARTH SCC 2021---------------------------------

export default class SoldCaseOtherProduct extends LightningElement {

    @api flexOptions;
    @track isCustomized =false;
    

    @api othertemvalue;
    @api editmode;
    @api otherProductsStatus;
    @track surestDispValue;
    @track otherProducts;
    @track otherProductDispositionValue;
    @track oppLineItemFieldLabels;
    @track sccObjFields;
    @api showTextBox;
    @api valueinchildCopy;

    @api mnrpPerc = false;
    @api mnrpDmePerc = false;
    @api mnrpLabPerc = false;
    @api mnrpDefaultChargesPerc = false;
    @api physicianOon = false;
    @api facilityRc = false;
    @api enrpPerc = false;
    @api enrpDefaultPerc = false;

    @api mnrpDmeWriteIn = false;
    @api mnrpLabWriteIn = false;
    @api mnrpDefaultWriteIn = false;

    @api showPhsBuyUpSection = false;

    @track showTransplantLevel2 = false;

    //Opportunity field labels
    @wire(getObjectInfo, { objectApiName: oppLineItem })
    oppInfo({ data, error }) {
        if (data) {
            this.oppLineItemFieldLabels = data.fields;
        }
    }

    @api displayAsthma;
    @api displayDiabetes;
    @api displayCongestiveHeartFailure;
    @api displayCad;
    @api displayCopd;
    @api displayCancerSupportProgram;
    @api displayKidSol;
    @track displayKidRes;

    @api phsOtherBuyUpPrograms = [];

    @api buyUps;

    @api level2Values = [];

    @api hideKidneyESRD = false;
    @api familyOutOfNetwork = false;

    @track showOtherProdDetails = false;
    @track isClaimFiduciary = false;

    @api isTradSoldOther;
    @api isSurestSoldOther;

    @track BHSP1 = false;
    @track BHSP2 = false;

    @api soldCaseDataCopy;
    @track includedOptOut = [
        { label: '', value: '' },
        { label: 'Included', value: 'Included' },
        { label: 'Opt out', value: 'Opt out' }
    ];

    //--------------------------------SAMARTH SCC 2021--------------------------------
    @wire(getObjectInfo, {
        objectApiName: SccObject
    })
    sccObjInfo;


    //  @wire(getObjectInfo, {
    //     objectApiName: oppLineItem
    // })
    // oppbjInfo;


    // @wire(getPicklistValues, { recordTypeId: '$oppbjInfo.data.defaultRecordTypeId', fieldApiName: Flex_Options__c })
    // flexiOptions({ error, data }) {
    //     if (data) {
    //         let pickListvalues = [];
    //         for (let i in data.values) {
    //             if (data.values[i] !== undefined) {
    //                 if (i === '0') {
    //                     pickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
    //                 }
    //                 pickListvalues.push(data.values[i]);
    //             }
    //         }
    //         this.flexOptions = pickListvalues;
    //         console.log('flex');
    //          console.log(pickListvalues);
    //     }
    //     else if (error) {
    //         console.log(error);
    //     }
    // }

    get isFacilityRandC() {
        return this.othertemvalue.Product2.Name === 'Facility R&C' ? true : false;
    }

    get outOfNetworkProductSold() {
        if (this.othertemvalue.Product2.Family.includes('Out-of-Network Reimbursement Program') && (
            this.othertemvalue.ProductCode != 'OON-NAVN' || this.othertemvalue.ProductCode != 'OON-NAVNWFCR' ||
            this.othertemvalue.ProductCode != 'OON-NAVP') && (this.othertemvalue.Disposition_Other_Buy_Up_Programs__c == 'Sold' ||
            this.othertemvalue.Disposition_Other_Buy_Up_Programs__c == 'Spin-Off' || this.othertemvalue.Disposition_Other_Buy_Up_Programs__c == 'Transfer In'
            )) {
            return true;
        }
        else {
            return false;
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


    get optInOptOut() {
        return [
            { label: '', value: '' },
            { label: 'Included', value: 'Included' },
            { label: 'Opt Out', value: 'Opt Out' },
            { label: 'TBD', value: 'TBD' },
        ];
    }

    get yesNotApplicable() {
        return [
            { label: '', value: '' },
            { label: 'Yes', value: 'Yes' },
            { label: 'N/A', value: 'N/A' }
        ];
    }

    get mnrpDmePercValues() {
        return [
            { label: '', value: '' },
            { label: '45%', value: '45%' },
            { label: 'Nonstandard', value: 'Nonstandard' }
        ];
    }

    get mnrpLabPercValues() {
        return [
            { label: '', value: '' },
            { label: '50%', value: '50%' },
            { label: 'Nonstandard', value: 'Nonstandard' }
        ];
    }

    get mnrpDefaultChargesPercValues() {
        return [
            { label: '', value: '' },
            { label: '50%', value: '50%' },
            { label: '30%', value: '30%' },
            { label: '20%', value: '20%' },
            { label: 'Other', value: 'Other' }
        ];
    }

    get transplantYesNo() {
        return [
            { label: '', value: '' },
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
        ];
    }

    @api
    get valueinchild() {
        return this.valueinchildCopy;
    }
    set valueinchild(value) {
        this.valueinchildCopy = value;
        this.showOtherProdDetails = false;
        if (this.valueinchildCopy['Disposition_Other_Buy_Up_Programs__c'] !== undefined && this.valueinchildCopy['Disposition_Other_Buy_Up_Programs__c'] == 'Sold') {
            if(this.valueinchildCopy['Buyup_Product_Selection__c']=='Surest & UNET'){
                this.surestDispValueChild ='Sold';
                this.otherProductDispositionValueChild = 'Sold';
            }else if(this.valueinchildCopy['Buyup_Product_Selection__c']=='Surest Only'){
                this.surestDispValueChild ='Sold';
                this.otherProductDispositionValueChild = '';
            }
            else if(this.valueinchildCopy['Buyup_Product_Selection__c']=='UNET or UMR Only'){
                this.surestDispValueChild ='';
                this.otherProductDispositionValueChild = 'Sold';
            }
            else{
                this.otherProductDispositionValueChild = 'Sold';
            }
        }
       else if (this.valueinchildCopy['Disposition_Other_Buy_Up_Programs__c'] !== undefined && this.valueinchildCopy['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In' ) {
            if(this.valueinchildCopy['Buyup_Product_Selection__c']=='Surest & UNET'){
                this.surestDispValueChild ='Transfer In';
                this.otherProductDispositionValueChild = 'Transfer In';
            }else if(this.valueinchildCopy['Buyup_Product_Selection__c']=='Surest Only'){
                this.surestDispValueChild ='Transfer In';
                this.otherProductDispositionValueChild = '';
            }
            else if(this.valueinchildCopy['Buyup_Product_Selection__c']=='UNET or UMR Only'){
                this.surestDispValueChild ='';
                this.otherProductDispositionValueChild = 'Transfer In';
            }
            else{
                this.otherProductDispositionValueChild = 'Transfer In';
            }
        } else if (this.valueinchildCopy['Disposition_Other_Buy_Up_Programs__c'] !== undefined && this.valueinchildCopy['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off') {
            if(this.valueinchildCopy['Buyup_Product_Selection__c']=='Spin-Off'){
                this.surestDispValueChild ='Spin-Off';
                this.otherProductDispositionValueChild = 'Spin-Off';
            }else if(this.valueinchildCopy['Buyup_Product_Selection__c']=='Surest Only'){
                this.surestDispValueChild ='Spin-Off';
                this.otherProductDispositionValueChild = '';
            }
            else if(this.valueinchildCopy['Buyup_Product_Selection__c']=='UNET or UMR Only'){
                this.surestDispValueChild ='';
                this.otherProductDispositionValueChild = 'Spin-Off';
            }
            else{
                this.otherProductDispositionValueChild = 'Spin-Off';
            }
        } else {
            this.otherProductDispositionValueChild = 'TBD';
             this.surestDispValueChild ='TBD';
        }

        if (this.valueinchildCopy.phsBuyUp == undefined) {
            this.showOtherProdDetails = true;
        }
        else if (this.valueinchildCopy.phsBuyUp == true) {
            this.showOtherProdDetails = false;
        }

        if (this.valueinchildCopy.phsIncluded == false && this.showOtherProdDetails) {
            this.showOtherProdDetails = true;
        }
        else if (this.valueinchildCopy.phsIncluded == true) {
            this.showOtherProdDetails = false;
        }

        if (this.valueinchildCopy.medNecPayInt == false && this.showOtherProdDetails) {
            this.showOtherProdDetails = true;
        }
        else {
            this.showOtherProdDetails = false;
        }

        /* if (this.valueinchildCopy.medNecPayInt == undefined) {
            this.showOtherProdDetails = true;
        }
        else {
            this.showOtherProdDetails = false;
        } */

        if (this.valueinchildCopy.Transplant_TRS_COE__c == 'Included') {
            this.showTransplantLevel2 = true;
        }

        if (this.valueinchildCopy.MNRP__c == 'Yes') {
            this.mnrpPerc = true;
        }
        if (this.valueinchildCopy.MNRP_DME__c == 'Yes') {
            this.mnrpDmePerc = true;
        }
        if (this.valueinchildCopy.MNRP_Lab__c == 'Yes') {
            this.mnrpLabPerc = true;
        }
        if (this.valueinchildCopy.MNRP_Default_of_Billed_Charges__c == 'Yes') {
            this.mnrpDefaultChargesPerc = true;
        }
        if (this.valueinchildCopy.Physician_R_C_OON__c == 'Yes') {
            this.physicianOon = true;
        }
        if (this.valueinchildCopy.Facility_R_C__c == 'Yes') {
            this.facilityRc = true;
        }
        if (this.valueinchildCopy.ENRP__c == 'Yes') {
            this.enrpPerc = true;
        }
        if (this.valueinchildCopy.ENRP_Default_of_Billed_Charge__c == 'Yes') {
            this.enrpDefaultPerc = true;
        }

        if (this.valueinchildCopy.MNRP_DME_Percentage__c == 'Nonstandard') {
            this.mnrpDmeWriteIn = true;
        }
        if (this.valueinchildCopy.MNRP_Lab_Percentage__c == 'Nonstandard') {
            this.mnrpLabWriteIn = true;
        }
        if (this.valueinchildCopy.MNRP_Dfault_of_Billd_Chrges_Percentage__c == 'Other') {
            this.mnrpDefaultWriteIn = true;
        }

        // For Showing text box if level 2 options are Custom, Other or Carve Out -- STARTS
        if (this.valueinchildCopy.Level_2_Option__c == 'Custom' || this.valueinchildCopy.Level_2_Option__c == 'Other' || this.valueinchildCopy.Level_2_Option__c == 'Carve Out') {
            this.showTextBox = true;
        }
        else if (this.valueinchildCopy.Level_2_Option__c == 'Standard' || this.valueinchildCopy.Level_2_Option__c == 'Optum Bank' || this.valueinchildCopy.Level_2_Option__c == 'Carve In' || this.valueinchildCopy.Level_2_Option__c == '' ||
            this.valueinchildCopy.Level_2_Option__c == 'UHC' || this.valueinchildCopy.Level_2_Option__c == 'Client' || this.valueinchildCopy.Level_2_Option__c == 'TBD') {
            this.showTextBox = false;
        }
        // For Showing text box if level 2 options are Custom, Other or Carve Out -- ENDS

        if (this.valueinchildCopy.isAsthmaPresent == true || this.valueinchildCopy.isDiabetesPresent == true ||
            this.valueinchildCopy.isHeartFailurePresent == true || this.valueinchildCopy.isCADPresent == true ||
            this.valueinchildCopy.isCOPDPresent == true || this.valueinchildCopy.isCancerPresent == true ||
            this.valueinchildCopy.isKidSolPresent == true || this.valueinchildCopy.isKidResPresent == true) {
            //console.log('buyUps if '); //JSON.stringify(this.valueinchildCopy)
            this.buyUps = true;
        }
        else {
            //console.log('buyUps else');
            this.buyUps = false;
        }

        if (this.valueinchildCopy.isKidResPresent == true || this.valueinchildCopy.isKidSolPresent == true) {
            this.hideKidneyESRD = true;
        }

        if (this.valueinchildCopy.Product2.Family.includes('Out-of-Network') && (this.valueinchildCopy.ProductCode == 'OON-NAVN' || this.valueinchildCopy.ProductCode == 'OON-NAVNWFCR' ||
            this.valueinchildCopy.ProductCode == 'OON-NAVP')) {
            this.familyOutOfNetwork = true;
        }

        if (this.valueinchildCopy.isKidSolPresent == true || this.valueinchildCopy.isKidResPresent == true) {
            this.hideKidneyESRD = true;
        }

        //isClaimFiduciary
        if (this.valueinchildCopy.ProductCode == 'CF-CF') {
            this.isClaimFiduciary = true;
        }
        if (this.valueinchildCopy.ProductCode == 'BH-BHSP1') {
            this.BHSP1 = true;
        }
        if (this.valueinchildCopy.ProductCode == 'BH-BHSP2') {
            this.BHSP1 = true; 
            this.BHSP2 = true;
        }
    }

    connectedCallback() {
        this.otherProducts = Object.assign({}, this.othertemvalue);

        for (let i in this.otherProducts) {
            if(this.otherProducts.Product2.Name =='Naviguard Package X (Flex)'){
                if(this.otherProducts.Flex_Options__c =='B - Customized'){
                    this.isCustomized =true;
                }else
                this.isCustomized =false;
            }
            if(this.otherProducts.Product2.ProductCode == 'BH-BHSP1'){
                this.BHSP1 = true;
            }
            if(this.otherProducts.Product2.ProductCode == 'BH-BHSP2'){
                this.BHSP1 = true;
                this.BHSP2 = true;
            }
            if (this.otherProducts['Disposition_Other_Buy_Up_Programs__c'] !== undefined && this.otherProducts['Disposition_Other_Buy_Up_Programs__c'] == 'Sold') {
                if(this.otherProducts['Buyup_Product_Selection__c']=='Surest & UNET'){
                    this.surestDispValue ='Sold';
                    this.otherProductDispositionValue = 'Sold';
                }else if(this.otherProducts['Buyup_Product_Selection__c']=='Surest Only'){
                    this.surestDispValue ='Sold';
                    this.otherProductDispositionValue = '';
                }
                else if(this.otherProducts['Buyup_Product_Selection__c']=='UNET or UMR Only'){
                    this.surestDispValue ='';
                    this.otherProductDispositionValue = 'Sold';
                }
                else{
                    if(this.isSurestSoldOther){
                    this.surestDispValue = 'N/A';
                    }
                    this.otherProductDispositionValue = 'Sold';
                }
            } else if (this.valueinchildCopy['Disposition_Other_Buy_Up_Programs__c'] !== undefined && this.valueinchildCopy['Disposition_Other_Buy_Up_Programs__c'] == 'Transfer In' ) {
            if(this.valueinchildCopy['Buyup_Product_Selection__c']=='Surest & UNET'){
                this.surestDispValue ='Transfer In';
                this.otherProductDispositionValue = 'Transfer In';
            }else if(this.valueinchildCopy['Buyup_Product_Selection__c']=='Surest Only'){
                this.surestDispValue ='Transfer In';
                this.otherProductDispositionValue = '';
            }
            else if(this.valueinchildCopy['Buyup_Product_Selection__c']=='UNET or UMR Only'){
                this.surestDispValue ='';
                this.otherProductDispositionValue = 'Transfer In';
            }
            else{
                if(this.isSurestSoldOther){
                    this.surestDispValue = 'N/A';
                }
                this.otherProductDispositionValue = 'Transfer In';
            }
        } else if (this.valueinchildCopy['Disposition_Other_Buy_Up_Programs__c'] !== undefined && this.valueinchildCopy['Disposition_Other_Buy_Up_Programs__c'] == 'Spin-Off') {
            if(this.valueinchildCopy['Buyup_Product_Selection__c']=='Surest & UNET'){
                this.surestDispValue ='Spin-Off';
                this.otherProductDispositionValue = 'Spin-Off';
            }else if(this.valueinchildCopy['Buyup_Product_Selection__c']=='Surest Only'){
                this.surestDispValue ='Spin-Off';
                this.otherProductDispositionValue = '';
            }
            else if(this.valueinchildCopy['Buyup_Product_Selection__c']=='UNET or UMR Only'){
                this.surestDispValue ='';
                this.otherProductDispositionValue = 'Spin-Off';
            }
            else{
                if(this.isSurestSoldOther){
                    this.surestDispValue = 'N/A';
                }
                this.otherProductDispositionValue = 'Spin-Off';
            }
        }else {
                // this.otherProductDispositionValue = 'TBD';
                //  this.surestDispValue ='TBD';
                if(this.otherProducts['Buyup_Product_Selection__c']=='Surest & UNET'){
                    this.surestDispValue ='TBD';
                    this.otherProductDispositionValue = 'TBD';
                }else if(this.otherProducts['Buyup_Product_Selection__c']=='Surest Only'){
                    this.surestDispValue ='TBD';
                    this.otherProductDispositionValue = '';
                }
                else if(this.otherProducts['Buyup_Product_Selection__c']=='UNET or UMR Only'){
                    this.surestDispValue ='';
                    this.otherProductDispositionValue = 'TBD';
                }
                else{
                    if(this.isSurestSoldOther){
                        this.surestDispValue = 'N/A';
                    }
                    this.otherProductDispositionValue = 'TBD';
                }
            }

            if (this.otherProducts['isAsthmaPresent'] == true || this.otherProducts['isDiabetesPresent'] == true ||
                this.otherProducts['isHeartFailurePresent'] == true || this.otherProducts['isCADPresent'] == true ||
                this.otherProducts['isCOPDPresent'] == true || this.otherProducts['isCancerPresent'] == true ||
                this.otherProducts['isKidSolPresent'] == true || this.otherProducts['isKidResPresent'] == true) {
                this.showPhsBuyUpSection = true;
            }
        }

        for(let i in this.otherProducts) {
            if(this.isSurestSoldOther && this.isTradSoldOther){
                if(this.surestDispValue == ''){
                    this.surestDispValue = 'N/A';
                }
                if(this.otherProductDispositionValue == ''){
                    this.otherProductDispositionValue = 'N/A';
                }
            }
        }
       
    }

    get isFlex(){
        if (this.othertemvalue.Product2.Name =='Naviguard Package X (Flex)'){
            console.log(this.flexOptions);
        return true;
        }
        return false;
        
    }

    get getPicklistValues() {
        let options = [];
        options.push({ value: '', label: '' })
        if (this.othertemvalue.Product2.Level_2_Options__c !== undefined) {
            if (this.othertemvalue.Product2.Name === 'Health Savings Account - HSA') {
                let optionsArr = this.othertemvalue.Product2.Level_2_Options__c.split(';');
                optionsArr.sort();
                optionsArr.forEach(opt => {
                    options.push({ value: opt, label: opt });
                });
            }
            else {
                let optionsArr = this.othertemvalue.Product2.Level_2_Options__c.split(';');
                if (this.othertemvalue.Level_2_Option__c == 'Buy Up') {
                    optionsArr.forEach(opt => {
                        options.push({ value: opt, label: opt });
                    });
                    if(!optionsArr.includes('Buy Up'))
                    options.push({ value: 'Buy Up', label: 'Buy Up' });
                }
                else {
                    optionsArr.forEach(opt => {
                        options.push({ value: opt, label: opt });
                    });
                }
            }
        }
        return options;
    }

    FieldChangeHandler(event) {
        //---------------------------------------SAMARTH SCC 2021---------------------------------------

        if (event.target.value != '' && event.target.value != null && event.target.value != undefined) {
            if (event.target.value == 'Custom' || event.target.value == 'Other' || event.target.value == 'Carve Out') {
                this.showTextBox = true;
            }

            if (event.target.value == 'Standard' || event.target.value == 'Optum Bank' || event.target.value == 'Carve In' || event.target.value == '' ||
                event.target.value == 'UHC' || event.target.value == 'Client' || event.target.value == 'TBD') {
                this.showTextBox = false;
                if (event.target.name == 'Level_2_Option__c') {
                    this.otherProducts['Level2_Info__c'] = '';
                }
            }
        }
        if (event.target.name == 'Flex_Options__c') {
            this.otherProducts['Flex_Options__c'] =event.target.value;
            if (event.target.value == 'B - Customized') {
                this.isCustomized = true;
            }
            else {
                this.otherProducts['Flex_WriteIn__c'] ='';
                this.isCustomized =false;
            }
        }
        if (event.target.name == 'Flex_WriteIn__c') {
            this.otherProducts['Flex_WriteIn__c'] =event.target.value;
            
        }
    
        if (event.target.name == 'Transplant_TRS_COE__c') {
            if (event.target.value == 'Included') {
                this.showTransplantLevel2 = true;
            }
            else {
                this.showTransplantLevel2 = false;
                this.otherProducts['Non_Extra_Contractual_Transplant__c'] = '';
            }
        }

        if (event.target.name == 'MNRP__c') {
            if (event.target.value == 'Yes') {
                this.mnrpPerc = true;
            }
            else {
                this.mnrpPerc = false;
                this.otherProducts['MNRP_Percentage__c'] = '';
            }
        }
        if (event.target.name == 'MNRP_DME__c') {
            if (event.target.value == 'Yes') {
                this.mnrpDmePerc = true;
            }
            else {
                this.mnrpDmePerc = false;
                this.mnrpDmeWriteIn = false;

                this.otherProducts['MNRP_DME_Percentage__c'] = '';
                this.otherProducts['MNRP_DME_Nonstd_Percentage__c'] = '';
            }
        }
        if (event.target.name == 'MNRP_Lab__c') {
            if (event.target.value == 'Yes') {
                this.mnrpLabPerc = true;
            }
            else {
                this.mnrpLabPerc = false;
                this.mnrpLabWriteIn = false;

                this.otherProducts['MNRP_Lab_Percentage__c'] = '';
                this.otherProducts['MNRP_Lab_Nonstd_Percentage__c'] = '';
            }
        }
        if (event.target.name == 'MNRP_Default_of_Billed_Charges__c') {
            if (event.target.value == 'Yes') {
                this.mnrpDefaultChargesPerc = true;
            }
            else {
                this.mnrpDefaultChargesPerc = false;
                this.mnrpDefaultWriteIn = false;

                this.otherProducts['MNRP_Dfault_of_Billd_Chrges_Percentage__c'] = '';
                this.otherProducts['MNRP_Default_Nonstd_Percentage__c'] = '';
            }
        }
        if (event.target.name == 'Physician_R_C_OON__c') {
            if (event.target.value == 'Yes') {
                this.physicianOon = true;
            }
            else {
                this.physicianOon = false;
                this.otherProducts['Physician_R_C_OON_Percentage__c'] = '';
            }
        }
        if (event.target.name == 'Facility_R_C__c') {
            if (event.target.value == 'Yes') {
                this.facilityRc = true;
            }
            else {
                this.facilityRc = false;
                this.otherProducts['Facility_R_C_Percentage__c'] = '';
            }
        }
        if (event.target.name == 'ENRP__c') {
            if (event.target.value == 'Yes') {
                this.enrpPerc = true;
            }
            else {
                this.enrpPerc = false;
                this.otherProducts['ENRP_Percentage__c'] = '';
            }
        }
        if (event.target.name == 'ENRP_Default_of_Billed_Charge__c') {
            if (event.target.value == 'Yes') {
                this.enrpDefaultPerc = true;
            }
            else {
                this.enrpDefaultPerc = false;
                this.otherProducts['ENRP_Dfault_of_Billd_Chrges_Percentage__c'] = '';
            }
        }



        if (event.target.name == 'MNRP_DME_Percentage__c') {
            if (event.target.value == 'Nonstandard') {
                this.mnrpDmeWriteIn = true;
            }
            else {
                this.mnrpDmeWriteIn = false;
                this.otherProducts['MNRP_DME_Nonstd_Percentage__c'] = '';
            }
        }
        if (event.target.name == 'MNRP_Lab_Percentage__c') {
            if (event.target.value == 'Nonstandard') {
                this.mnrpLabWriteIn = true;
            }
            else {
                this.mnrpLabWriteIn = false;
                this.otherProducts['MNRP_Lab_Nonstd_Percentage__c'] = '';
            }
        }
        if (event.target.name == 'MNRP_Dfault_of_Billd_Chrges_Percentage__c') {
            if (event.target.value == 'Other') {
                this.mnrpDefaultWriteIn = true;
            }
            else {
                this.mnrpDefaultWriteIn = false;
                this.otherProducts['MNRP_Default_Nonstd_Percentage__c'] = '';
            }
        }
        //---------------------------------------SAMARTH SCC 2021---------------------------------------

        let Opplineitem = this.othertemvalue.Id;
        this.otherProducts[event.target.name] = event.target.value;

        let editfielddetails = [{ record: this.otherProducts }];
        //console.log('Data from Other Prod Comp ' + JSON.stringify(editfielddetails));
        const opplineitemRecord = new CustomEvent("opplinevaluechange", {
            detail: editfielddetails
        });


        this.dispatchEvent(opplineitemRecord);

    }

    @track  editfielddetailsbhs = [];
    ValueChangeHandler(event){
        this.editfielddetailsbhs.push(
                {
                    fieldedited: 'Sold_Case_Checklist__c.Calm_Health_app__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Case_Management__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.National_Network_Outpatient_Inpatient_UM__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Behavioral_Health_Virtual_Visits__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Substance_Use_Disorder_Helpline__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Care_Explorer__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Family_Support__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.X24_7_in_the_moment_and_crisis_support__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Enhanced_Case_Management__c',
                    fieldvalue: 'Included'
                },
                {
                    fieldedited: 'Sold_Case_Checklist__c.Behavioral_Care_Connect_5_Day_Access__c',
                    fieldvalue: 'Included'
                });
        
        this.currentPayIntVal = event.target.value;  

        let selectedrecords = {};
        let selectedname = event.target.name;
        selectedrecords[selectedname] = event.target.value;
        this.Clientdatarecord = selectedrecords;

        this.editfielddetailsbhs.push({
            fieldedited: event.target.name,
            fieldvalue: event.target.value
        });

        const ClientDetailRecord = new CustomEvent("progressvaluechange", {
            detail: this.editfielddetailsbhs
        });
        this.dispatchEvent(ClientDetailRecord);
    }

    @api
    validateForm() {
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);
        //console.log('Received in inner child ' + allValid);
        return allValid;
    }
}