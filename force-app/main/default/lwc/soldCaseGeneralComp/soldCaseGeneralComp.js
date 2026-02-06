/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 09-17-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, track, api, wire } from "lwc";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import Oppobjct from "@salesforce/schema/Opportunity";
import disablechildcovg from "@salesforce/schema/Opportunity.Disabled_Child_Coverage__c";
import hospbillaudit from "@salesforce/schema/Opportunity.Hospital_Bill_Audit_Program__c";
import preimpaudit from "@salesforce/schema/Opportunity.Pre_Implementation_Audit__c";
import expcustreptr from "@salesforce/schema/Opportunity.Expanded_Online_Customer_Reporting__c";
import perfgrnty from "@salesforce/schema/Opportunity.Performance_Guarantees__c";
import stoploss from "@salesforce/schema/Opportunity.Stop_Loss__c";
import RXcoalition from "@salesforce/schema/Opportunity.Rx_Coalition__c";
import offshoreProvisions from "@salesforce/schema/Opportunity.Offshore_Provisions__c";

//--------------------------------------------------SAMARTH SCC 2021--------------------------------------------------
import SccObject from '@salesforce/schema/Sold_Case_Checklist__c';
import disabledDependentVerification from '@salesforce/schema/Sold_Case_Checklist__c.Disabled_Dependent_Verification__c';
//import stoplossScc from "@salesforce/schema/Sold_Case_Checklist__c.Stop_Loss__c";
import preImplementationAudit from '@salesforce/schema/Sold_Case_Checklist__c.Pre_Implementation_Audit__c';
import expOnlineCustReport from '@salesforce/schema/Sold_Case_Checklist__c.Expanded_Online_Customer_Reporting_Sys__c';
import offShoreProvisionsSCC from '@salesforce/schema/Sold_Case_Checklist__c.Offshore_Provisions__c';
import claimFiduciary from '@salesforce/schema/Sold_Case_Checklist__c.Claim_Fiduciary__c';
import stopLossScc from '@salesforce/schema/Sold_Case_Checklist__c.Stop_Loss__c';
import rxCoalitionScc from '@salesforce/schema/Sold_Case_Checklist__c.Rx_Coalition__c';
import caaIdrServiceFees from '@salesforce/schema/Sold_Case_Checklist__c.CAA_IDR_Service_Fees__c';

import preImplementationAuditLevel2 from '@salesforce/schema/Sold_Case_Checklist__c.Pre_Implementation_Audit_Level_2__c';
import offShoreLevel0 from '@salesforce/schema/Sold_Case_Checklist__c.Offshore_Provisions_Level_0__c';
import offShoreLevel7 from '@salesforce/schema/Sold_Case_Checklist__c.Offshore_Provisions_Level_7__c';

import doNonprefNewBusinessRatesapply from '@salesforce/schema/Sold_Case_Checklist__c.Do_non_pref_New_Business_Rates_apply__c';

import willConsPartInImplnSCC from '@salesforce/schema/Sold_Case_Checklist__c.Will_Consultant_Participate_in_Impln__c';
import areSsoTechRequiredSCC from '@salesforce/schema/Sold_Case_Checklist__c.Are_SSO_Technology_required__c';
import supplementalCompensation from '@salesforce/schema/Sold_Case_Checklist__c.Supplemental_Compensation_Payee__c';


//-------------------------Thanushree Surest 2024-------------------------
import surestDisabledDependentVerification from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Disabled_Dependent_Verification__c';
import surestPreImplementationAudit from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Pre_Implementation_Audit__c';
import surestOffShoreProvisionsSCC from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Offshore_Provisions__c';
import surestStopLossScc from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Third_Party_Stop_Loss_Reporting__c';
import surestCaaIdrServiceFees from '@salesforce/schema/Sold_Case_Checklist__c.Surest_CAA_IDR_Service_Fees__c';

import surestPreImplementationAuditLevel2 from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Pre_Implementation_Audit_Level_2__c';
import surestOffShoreLevel0 from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Offshore_Provisions_Level_0__c';
import surestOffShoreLevel7 from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Offshore_Provisions_Level_7__c';

import surestDoNonprefNewBusinessRatesapply from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Do_non_pref_New_Business_Rates__c';

import surestWillConsPartInImplnSCC from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Will_Consultant_Participate__c';
import surestAreSsoTechRequiredSCC from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Are_SSO_Technology_required__c';
import surestSupplementalCompensation from '@salesforce/schema/Sold_Case_Checklist__c.Surest_Supplemental_Compensation_Payee__c';


import { loadStyle } from 'lightning/platformResourceLoader';
import SccStaticResourceCss from '@salesforce/resourceUrl/SCC_Static_Resource';
//--------------------------------------------------SAMARTH SCC 2021--------------------------------------------------

export default class SoldCaseGeneralComp extends LightningElement {
  @track activeSections = ["General - Traditional","General - Surest", "Sign Off", "Additional Details"];
  @api editmode;
  @api opportunityFieldLabels;
  @api userTimeZone;
  @track disablechildcovgvalue;
  @track hospbillauditvalue;
  @track preimpauditvalue;
  @track expcustreptrvalue;
  @track perfgrntyvalue;
  @track stoplossvalue;
  @track RXcoalitionvalue;
  //@api checkdetail;
  offshoreProvisionvalue;

  hasRendered = false;

  @track generalProductDetails;
  @track accountFields;
  @track oldSalesDateTime;
  @track oldIpmDateTime;

  @track masterData;

  //-------------------------SAMARTH SCC 2021-------------------------
  @track soldCaseDataCopy;
  @api completeDataFromParent;
  @track ddvValues;
  @track preImpValues;
  @track eocrValues;
  @track offShoreProvisionsValue;
  @track claimFiduciaryValues;
  @track stopLossValues;
  @track rxCoalitionValues;
  @track caaIdrServiceFeesValues;
  @track offShoreLevel0Values;
  @track offShoreLevel7Values;
  @track doNonprefNewBusinessRatesapplyValues;

  @track willConsPartInImplnValues;
  @track areSsoTechRequiredValues;

  @track showPreImplementationLevel2;
  @track showThirdPartyWriteIn;
  @track preImpLevel2Values;
  @track showClaimFiduciaryOther;
  @track showRxCoalitionOther;
  @track showOffshoreLevel0;
  @track showOffshoreLevel7;
  @track showCaaCarveOut;
  @track showCaaEmtApproval;
  @track showCaaTextBox;
  @track caaTextBoxPlaceholder;
  @track supplementalCompensationVal;


  //-------------------------Thanushree Surest 2024-------------------------
  @track surestDDVvalues;
  @track surestPreImplValues;
  @track surestPreImpLevel2Values;
  @track surestOffShoreProvisionsValue;
  @track surestOffShoreLevel0Values;
  @track surestOffShoreLevel7Values;
  @track surestStopLossValues;
  @track surestcaaIdrServiceFeesValues;
  @track surestDoNonprefNewBusinessRatesValues;
  @track surestWillConsPartInImplnValues;
  @track surestAreSsoTechRequiredValues;
  @track surestCaaTextBoxPlaceholder;
  @track SurestSupplementalCompensationVal;

  @track showSurestPreImplementationLevel2;
  @track showSurestOffshoreLevel0;
  @track showSurestOffshoreLevel7;
  @track showSurestThirdPartyWriteIn;
  @track showSurestCaaTextBox;
  @track Surest_Offshore_Provisions_Level_0__c;
  @track Surest_Pre_Implementation_Audit_Level_2__c;

  @api level0Pickval;

  @api additionalInfoHelpText;
  @track Offshore_Provisions_Level_0__c;
  @track Pre_Implementation_Audit_Level_2__c;
  //  @track preImpLevel2;
  //-------------------------SAMARTH SCC 2021-------------------------

  //---------SAMARTH SCC NB UPGRADE 2023---------
  @api soldCaseCheckListInstructions;
  @api nonPrefNewBusinessRatesHelpText;
  //---------SAMARTH SCC NB UPGRADE 2023---------
  @api meddispValue;
  @api medSold;
  @api isSurestProduct;
  @api isTraditionalProduct;

  multipicklistgenericevent(event) {
    //let cloneAccountData = Object.assign({}, this.recordDetail.Account);


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
    this.generalProductDetails[fieldApiName] = pickListValues;

    let editfielddetails = [{
      fieldedited: event.detail.fieldName,
      fieldvalue: event.detail.value
    }];

    const ClientDetailRecord = new CustomEvent("progressvaluechange", {
      detail: editfielddetails
    });

    this.dispatchEvent(ClientDetailRecord);
  }

  connectedCallback() {
    this.additionalInfoHelpText = 'List any additional details not captured above including non-standard details pertinent to implementation.';

    //------------------------------------SAMARTH SCC NB UPGRADE 2023------------------------------------
    for (let i in this.soldCaseCheckListInstructions) {
      if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.Do_non_pref_New_Business_Rates_apply__c') {
          this.nonPrefNewBusinessRatesHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
      }
    }
    //------------------------------------SAMARTH SCC NB UPGRADE 2023------------------------------------

    if (this.soldCaseDataCopy.Offshore_Provisions_Level_0__c !== null && this.soldCaseDataCopy.Offshore_Provisions_Level_0__c !== undefined) {
      this.level0Pickval = this.soldCaseDataCopy.Offshore_Provisions_Level_0__c.split(';');
      this.Offshore_Provisions_Level_0__c = this.soldCaseDataCopy.Offshore_Provisions_Level_0__c.replace(/;/g, "; ");

    }
    else {
      this.level0Pickval = '';
    }

    if (this.soldCaseDataCopy.Pre_Implementation_Audit_Level_2__c !== null && this.soldCaseDataCopy.Pre_Implementation_Audit_Level_2__c !== undefined) {
      this.Pre_Implementation_Audit_Level_2__c = this.soldCaseDataCopy.Pre_Implementation_Audit_Level_2__c.replace(/;/g, "; ");

    }
    else {
      this.Pre_Implementation_Audit_Level_2__c = '';
    }

    if (this.soldCaseDataCopy.Pre_Implementation_Audit__c == 'Yes') {
      this.showPreImplementationLevel2 = true;
    }
    else {
      this.showPreImplementationLevel2 = false;
    }

    if (this.soldCaseDataCopy.Stop_Loss__c == 'Yes') {
      this.showThirdPartyWriteIn = true;
    }
    else {
      this.showThirdPartyWriteIn = false;
    }

    if (this.soldCaseDataCopy.Claim_Fiduciary__c == 'Other') {
      this.showClaimFiduciaryOther = true;
    }
    else {
      this.showClaimFiduciaryOther = false;
    }

    if (this.soldCaseDataCopy.Rx_Coalition__c == 'Other') {
      this.showRxCoalitionOther = true;
    }
    else {
      this.showRxCoalitionOther = false;
    }

    if (this.soldCaseDataCopy.Offshore_Provisions__c == 'Level 0 Individual Functions') {
      this.showOffshoreLevel0 = true;
    }
    else {
      this.showOffshoreLevel0 = false;
    }

    if (this.soldCaseDataCopy.Offshore_Provisions__c == 'Level 7 All Business Operations and It Work') {
      this.showOffshoreLevel7 = true;

    }
    else {
      this.showOffshoreLevel7 = false;
    }

    /* if (this.soldCaseDataCopy.CAA_IDR_Service_Fees__c == 'Carve-out') {
      this.showCaaCarveOut = true;
    }
    else {
      this.showCaaCarveOut = false;
    }

    if (this.soldCaseDataCopy.CAA_IDR_Service_Fees__c == 'EMT Approval') {
      this.showCaaEmtApproval = true;
    }
    else {
      this.showCaaEmtApproval = false;
    } */

    if (this.soldCaseDataCopy.CAA_IDR_Service_Fees__c == 'Carve-out' || this.soldCaseDataCopy.CAA_IDR_Service_Fees__c == 'EMT Approval') {
      this.showCaaTextBox = true;

      if (this.soldCaseDataCopy.CAA_IDR_Service_Fees__c == 'Carve-out') {
        this.caaTextBoxPlaceholder = 'Vendor name & contact';
      }

      if (this.soldCaseDataCopy.CAA_IDR_Service_Fees__c == 'EMT Approval') {
        this.caaTextBoxPlaceholder = 'EMT Approval #';
      }
    }
    else {
      this.showCaaTextBox = false;
    }

    if (this.soldCaseDataCopy.Surest_Pre_Implementation_Audit__c == 'Yes') {
      this.showSurestPreImplementationLevel2 = true;
    }
    else {
      this.showSurestPreImplementationLevel2 = false;
    }

    if (this.soldCaseDataCopy.Surest_Offshore_Provisions__c == 'Level 0 Individual Functions') {
      this.showSurestOffshoreLevel0 = true;
    }
    else {
      this.showSurestOffshoreLevel0 = false;
    }

    if (this.soldCaseDataCopy.Surest_Offshore_Provisions__c == 'Level 7 All Business Operations and It Work') {
      this.showSurestOffshoreLevel7 = true;
    }
    else {
      this.showSurestOffshoreLevel7 = false;
    }

    if (this.soldCaseDataCopy.Surest_Third_Party_Stop_Loss_Reporting__c == 'Yes') {
      this.showSurestThirdPartyWriteIn = true;
    }
    else {
      this.showSurestThirdPartyWriteIn = false;
    }

    if (this.soldCaseDataCopy.Surest_Offshore_Provisions_Level_0__c !== null && this.soldCaseDataCopy.Surest_Offshore_Provisions_Level_0__c !== undefined) {
      this.surestLevel0Pickval = this.soldCaseDataCopy.Surest_Offshore_Provisions_Level_0__c.split(';');
      this.Surest_Offshore_Provisions_Level_0__c = this.soldCaseDataCopy.Surest_Offshore_Provisions_Level_0__c.replace(/;/g, "; ");

    }
    else {
      this.surestLevel0Pickval = '';
    }

    if (this.soldCaseDataCopy.Surest_CAA_IDR_Service_Fees__c == 'Carve-out' || this.soldCaseDataCopy.Surest_CAA_IDR_Service_Fees__c == 'EMT Approval') {
      this.showSurestCaaTextBox = true;

      if (this.soldCaseDataCopy.Surest_CAA_IDR_Service_Fees__c == 'Carve-out') {
        this.surestCaaTextBoxPlaceholder = 'Vendor name & contact';
      }

      if (this.soldCaseDataCopy.Surest_CAA_IDR_Service_Fees__c == 'EMT Approval') {
        this.surestCaaTextBoxPlaceholder = 'EMT Approval #';
      }
    }
    else {
      this.showSurestCaaTextBox = false;
    }
    
    if (this.soldCaseDataCopy.Surest_Pre_Implementation_Audit_Level_2__c !== null && this.soldCaseDataCopy.Surest_Pre_Implementation_Audit_Level_2__c !== undefined) {
      this.Surest_Pre_Implementation_Audit_Level_2__c = this.soldCaseDataCopy.Surest_Pre_Implementation_Audit_Level_2__c.replace(/;/g, "; ");
    }
    else {
      this.Surest_Pre_Implementation_Audit_Level_2__c = '';
    }
    
    if (this.meddispValue == 'Sold') {
      this.medSold = true;
    }
    else {
        this.medSold = false;
    }

  }

  get isDataReceived() {
    if (this.generalProductDetails !== undefined && this.opportunityFieldLabels !== undefined) {
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
    this.generalProductDetails = Object.assign({}, value);
  }

  handleSectionToggle(event) {
    const openSections = event.detail.openSections;
  }


  //-------------------------------SAMARTH-------------------------------
  @api
  get soldCaseObjectData() {
    return soldCaseObjectData;
  }
  set soldCaseObjectData(value) {
    this.soldCaseDataCopy = Object.assign({}, value);
    if (this.soldCaseDataCopy.Offshore_Provisions_Level_0__c !== null && this.soldCaseDataCopy.Offshore_Provisions_Level_0__c !== undefined) {
      this.Offshore_Provisions_Level_0__c = this.soldCaseDataCopy.Offshore_Provisions_Level_0__c.replace(/;/g, "; ");

    } else {
      this.Offshore_Provisions_Level_0__c = '';
    }
    if (this.soldCaseDataCopy.Surest_Offshore_Provisions_Level_0__c !== null && this.soldCaseDataCopy.Surest_Offshore_Provisions_Level_0__c !== undefined) {
      this.Surest_Offshore_Provisions_Level_0__c = this.soldCaseDataCopy.Surest_Offshore_Provisions_Level_0__c.replace(/;/g, "; ");

    } else {
      this.Surest_Offshore_Provisions_Level_0__c = '';
    }

    if (this.soldCaseDataCopy.Pre_Implementation_Audit_Level_2__c !== null && this.soldCaseDataCopy.Pre_Implementation_Audit_Level_2__c !== undefined) {
      //this.preImpLevel2 = this.soldCaseDataCopy.Pre_Implementation_Audit_Level_2__c.split(';');
      this.Pre_Implementation_Audit_Level_2__c = this.soldCaseDataCopy.Pre_Implementation_Audit_Level_2__c.replace(/;/g, "; ");

    } else {
      this.Pre_Implementation_Audit_Level_2__c = '';
    }
    if (this.soldCaseDataCopy.Surest_Pre_Implementation_Audit_Level_2__c !== null && this.soldCaseDataCopy.Surest_Pre_Implementation_Audit_Level_2__c !== undefined) {
      this.Surest_Pre_Implementation_Audit_Level_2__c = this.soldCaseDataCopy.Surest_Pre_Implementation_Audit_Level_2__c.replace(/;/g, "; ");

    } else {
      this.Surest_Pre_Implementation_Audit_Level_2__c = '';
    }

    //console.log('soldCaseDataCopy ' + JSON.stringify(this.soldCaseDataCopy));
  }

  @wire(getObjectInfo, {
    objectApiName: SccObject
  })
  sccObjectInfo;

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: willConsPartInImplnSCC })
  willConsPartInImplnSCCValue({ error, data }) {
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
      this.willConsPartInImplnValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: areSsoTechRequiredSCC })
  areSsoTechRequiredSCCValue({ error, data }) {
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
      this.areSsoTechRequiredValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: disabledDependentVerification })
  ddvDataValue({ error, data }) {
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
      this.ddvValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: preImplementationAudit })
  preImpDataValue({ error, data }) {
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
      this.preImpValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: expOnlineCustReport })
  eocrDataValue({ error, data }) {
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
      this.eocrValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: offShoreProvisionsSCC })
  offShoreProvisionsDataValue({ error, data }) {
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
      this.offShoreProvisionsValue = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: claimFiduciary })
  claimFiduciaryDataValue({ error, data }) {
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
      this.claimFiduciaryValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: stopLossScc })
  stopLossDataValue({ error, data }) {
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
      this.stopLossValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: rxCoalitionScc })
  rxCoalitionDataValue({ error, data }) {
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
      this.rxCoalitionValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: caaIdrServiceFees })
  caaIdrServiceFeesDataValue({ error, data }) {
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
      this.caaIdrServiceFeesValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: preImplementationAuditLevel2 })
  preImpLevel2DataValue({ error, data }) {
    if (data) {
      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          //  if (i === '0') {
          //   testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          // } 
          testPickListvalues.push(data.values[i]);
        }
      }
      this.preImpLevel2Values = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: offShoreLevel0 })
  offShoreLevel0DataValue({ error, data }) {
    if (data) {
      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          /* if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          } */
          testPickListvalues.push(data.values[i]);
        }
      }
      this.offShoreLevel0Values = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: offShoreLevel7 })
  offShoreLevel7DataValue({ error, data }) {
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
      this.offShoreLevel7Values = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: doNonprefNewBusinessRatesapply })
  doNonprefNewBusinessRatesapplyDataValue({ error, data }) {
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
      this.doNonprefNewBusinessRatesapplyValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }
  //-------------------------------SAMARTH-------------------------------

  @wire(getObjectInfo, {
    objectApiName: Oppobjct
  })
  objectInfo;

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: RXcoalition
  })
  rxcaolation({ data, error }) {
    if (data) {
      //this.RXcoalitionvalue = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.RXcoalitionvalue = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: stoploss
  })
  stploss({ data, error }) {
    if (data) {
      //this.stoplossvalue = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.stoplossvalue = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: perfgrnty
  })
  prfgrnty({ data, error }) {
    if (data) {
      //this.perfgrntyvalue = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.perfgrntyvalue = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: expcustreptr
  })
  expadt({ data, error }) {
    if (data) {
      //this.expcustreptrvalue = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.expcustreptrvalue = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: preimpaudit
  })
  preimadt({ data, error }) {
    if (data) {
      //this.preimpauditvalue = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.preimpauditvalue = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: disablechildcovg
  })
  dscvg({ data, error }) {
    if (data) {
      //this.disablechildcovgvalue = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.disablechildcovgvalue = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: hospbillaudit
  })
  hospbilladt({ data, error }) {
    if (data) {
      //this.hospbillauditvalue = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.hospbillauditvalue = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: offshoreProvisions
  })
  offshorPrvsn({ data, error }) {
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

      this.offshoreProvisionvalue = pickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  //-------------------------Thanushree Surest 2024--------------------------
  
  @wire(getPicklistValues, {
    recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId",
    fieldApiName: surestDisabledDependentVerification
  })
  surestDDVdataValue({ data, error }) {
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

      this.surestDDVvalues = pickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId",
    fieldApiName: surestPreImplementationAudit
  })
  surestPreImplDataValue({ data, error }) {
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

      this.surestPreImplValues = pickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId",
    fieldApiName: surestPreImplementationAuditLevel2
  })
  surestPreImplementationAuditLevel2Data({ data, error }) {
    if (data) {
      let pickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          pickListvalues.push(data.values[i]);
        }
      }

      this.surestPreImpLevel2Values = pickListvalues;

    } else if (error) {
      console.log(error);
    }
  }
  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: surestOffShoreProvisionsSCC })
  surestOffShoreProvisionsValueData({ error, data }) {
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
      this.surestOffShoreProvisionsValue = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: surestOffShoreLevel0 })
  surestOffShoreLevel0ValueData({ error, data }) {
    if (data) {
      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          testPickListvalues.push(data.values[i]);
        }
      }
      this.surestOffShoreLevel0Values = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: surestOffShoreLevel7 })
  surestOffShoreLevel7ValueData({ error, data }) {
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
      this.surestOffShoreLevel7Values = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  
  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: surestStopLossScc })
  surestStopLossSccValueData({ error, data }) {
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
      this.surestStopLossValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: surestCaaIdrServiceFees })
  surestCaaIdrServiceFeesValueData({ error, data }) {
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
      this.surestcaaIdrServiceFeesValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }
 
  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: surestDoNonprefNewBusinessRatesapply })
  surestDoNonprefNewBusinessRatesDataValues({ error, data }) {
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
      this.surestDoNonprefNewBusinessRatesValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: surestWillConsPartInImplnSCC })
  surestWillConsPartInImplnSCCDataValue({ error, data }) {
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
      this.surestWillConsPartInImplnValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }
  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: surestAreSsoTechRequiredSCC })
  surestAreSsoTechRequiredSCCDataValue({ error, data }) {
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
      this.surestAreSsoTechRequiredValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    } 
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: supplementalCompensation })
  supplementalCompensationDataValue({ error, data }) {
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
      this.supplementalCompensationVal = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    } 
  }

  @wire(getPicklistValues, { recordTypeId: '$sccObjectInfo.data.defaultRecordTypeId', fieldApiName: surestSupplementalCompensation })
  surestSupplementalCompensationDataValue({ error, data }) {
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
      this.surestSupplementalCompensationVal = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    } 
  }

  FieldChangeHandler(event) {
    let editfielddetails;
    let choosenValue = '';
    let selectedrecords = {};
    let selectedname = event.target.name;
    selectedrecords[selectedname] = event.target.value;
    this.Clientdatarecord = selectedrecords;

    choosenValue = event.target.value;
    this.generalProductDetails[selectedname] = choosenValue;

    if (event.target.name == 'Sold_Case_Checklist__c.Pre_Implementation_Audit__c') {
      if (event.target.value == 'Yes') {
        this.showPreImplementationLevel2 = true;
      }
      else {
        this.showPreImplementationLevel2 = false;
        this.soldCaseDataCopy['Pre_Implementation_Audit_Write_In__c'] = '';
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.Surest_Pre_Implementation_Audit__c') {
      if (event.target.value == 'Yes') {
        this.showSurestPreImplementationLevel2 = true;
      }
      else {
        this.showSurestPreImplementationLevel2 = false;
        this.soldCaseDataCopy['Surest_Pre_Implementation_Audit_Write_In__c'] = '';
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.Stop_Loss__c') {
      if (event.target.value == 'Yes') {
        this.showThirdPartyWriteIn = true;
      }
      else {
        this.showThirdPartyWriteIn = false;
        this.soldCaseDataCopy['Third_Party_Stop_Loss_Reporting_Write_In__c'] = '';
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.Surest_Third_Party_Stop_Loss_Reporting__c') {
      if (event.target.value == 'Yes') {
        this.showSurestThirdPartyWriteIn = true;
      }
      else {
        this.showSurestThirdPartyWriteIn = false;
        this.soldCaseDataCopy['Surest_Third_Party_Stop_Loss_Write_In__c'] = '';
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.Claim_Fiduciary__c') {
      if (event.target.value == 'Other') {
        this.showClaimFiduciaryOther = true;
      }
      else {
        this.showClaimFiduciaryOther = false;
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.Rx_Coalition__c') {
      if (event.target.value == 'Other') {
        this.showRxCoalitionOther = true;
      }
      else {
        this.showRxCoalitionOther = false;
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.Offshore_Provisions__c') {
      if (event.target.value == 'Level 0 Individual Functions') {
        this.showOffshoreLevel0 = true;
      }
      else {
        this.showOffshoreLevel0 = false;
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.Offshore_Provisions__c') {
      if (event.target.value == 'Level 7 All Business Operations and It Work') {
        this.showOffshoreLevel7 = true;
      }
      else {
        this.showOffshoreLevel7 = false;
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.CAA_IDR_Service_Fees__c') {
      if (event.target.value == 'Carve-out' || event.target.value == 'EMT Approval') {
        this.showCaaTextBox = true;

        setTimeout(() => {
          var caaTb = this.template.querySelector('.caaTextBoxClass');
          caaTb.value = '';
        }, 300);

        if (event.target.value == 'Carve-out') {
          this.caaTextBoxPlaceholder = 'Vendor name & contact';
        }

        if (event.target.value == 'EMT Approval') {
          this.caaTextBoxPlaceholder = 'EMT Approval #';
        }
      }
      else {
        this.showCaaTextBox = false;
      }
    }




    if (event.target.name === 'Last_email_sent_by_IPM__c' || event.target.name === 'Last_email_sent_by_sales__c') {

      if (this.checkdetail !== null && this.checkdetail !== undefined) {
        this.oldIpmDateTime = this.checkdetail.Last_email_sent_by_IPM__c;
        this.oldSalesDateTime = this.checkdetail.Last_email_sent_by_sales__c;
      }

      if (event.target.checked) {
        var todayDateAndTime = new Date();
        this.generalProductDetails[selectedname] = todayDateAndTime;
        if (event.target.name === 'Last_email_sent_by_IPM__c') {
          this.generalProductDetails['Completed_by_IPM__c'] = true;
          editfielddetails = [{ fieldedited: 'Completed_by_IPM__c', fieldvalue: true },
          { fieldedited: event.target.name, fieldvalue: todayDateAndTime }];
        }
        else {
          this.generalProductDetails['Completed_by_Sales__c'] = true;
          editfielddetails = [{ fieldedited: 'Completed_by_Sales__c', fieldvalue: true },
          { fieldedited: event.target.name, fieldvalue: todayDateAndTime }];
        }
      }
      else {
        if (event.target.name === 'Last_email_sent_by_IPM__c') {
          this.generalProductDetails[selectedname] = this.oldIpmDateTime;
          this.generalProductDetails['Completed_by_IPM__c'] = false;
          editfielddetails = [{ fieldedited: 'Completed_by_IPM__c', fieldvalue: false },
          { fieldedited: event.target.name, fieldvalue: this.oldIpmDateTime }];
        }
        else {
          this.generalProductDetails[selectedname] = this.oldSalesDateTime;
          this.generalProductDetails['Completed_by_Sales__c'] = false;
          editfielddetails = [{ fieldedited: 'Completed_by_Sales__c', fieldvalue: false },
          { fieldedited: event.target.name, fieldvalue: this.oldSalesDateTime }];
        }
      }
    }
    else if (event.target.name == 'Sold_Case_Checklist__c.CAA_IDR_Service_Fees__c') {
      if (event.target.value == 'Carve-out' || event.target.value == 'EMT Approval') {
        //console.log('MAKE BACKEND NULL');
        editfielddetails = [{
          fieldedited: event.target.name,
          fieldvalue: event.target.value
        }];
        editfielddetails.push({
          fieldedited: 'Sold_Case_Checklist__c.CAA_Service_Fees_Write_In__c',
          fieldvalue: ''
        });
      }
      else {
        editfielddetails = [{
          fieldedited: event.target.name,
          fieldvalue: event.target.value
        }];
      }
    }
    else if (event.target.name == 'Sold_Case_Checklist__c.Surest_CAA_IDR_Service_Fees__c') {
      if (event.target.value == 'Carve-out' || event.target.value == 'EMT Approval') {
        //console.log('MAKE BACKEND NULL');
        editfielddetails = [{
          fieldedited: event.target.name,
          fieldvalue: event.target.value
        }];
        editfielddetails.push({
          fieldedited: 'Sold_Case_Checklist__c.Surest_CAA_IDR_Service_Fees_Write_In__c',
          fieldvalue: ''
        });
      }
      else {
        editfielddetails = [{
          fieldedited: event.target.name,
          fieldvalue: event.target.value
        }];
      }
    }
    else {
      editfielddetails = [{
        fieldedited: event.target.name,
        fieldvalue: choosenValue
      }];

      if (event.target.name == 'Sold_Case_Checklist__c.Pre_Implementation_Audit__c') {
        if (event.target.value == 'No') {
          editfielddetails.push({
            fieldedited: 'Sold_Case_Checklist__c.Pre_Implementation_Audit_Write_In__c',
            fieldvalue: ''
          });
        }
      }

      if (event.target.name == 'Sold_Case_Checklist__c.Surest_Pre_Implementation_Audit__c') {
        if (event.target.value == 'No') {
          editfielddetails.push({
            fieldedited: 'Sold_Case_Checklist__c.Surest_Pre_Implementation_Audit_Write_In__c',
            fieldvalue: ''
          });
        }
      }

      if (event.target.name == 'Sold_Case_Checklist__c.Stop_Loss__c') {
        if (event.target.value == 'No' || event.target.value == 'TBD') {
          editfielddetails.push({
            fieldedited: 'Sold_Case_Checklist__c.Third_Party_Stop_Loss_Reporting_Write_In__c',
            fieldvalue: ''
          });
        }
      }
      if (event.target.name == 'Sold_Case_Checklist__c.Surest_Third_Party_Stop_Loss_Reporting__c') {
        if (event.target.value == 'No' || event.target.value == 'TBD') {
          editfielddetails.push({
            fieldedited: 'Sold_Case_Checklist__c.Surest_Third_Party_Stop_Loss_Write_In__c',
            fieldvalue: ''
          });
        }
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.Surest_Offshore_Provisions__c') {
      if (event.target.value == 'Level 0 Individual Functions') {
        this.showSurestOffshoreLevel0 = true;
      }
      else {
        this.showSurestOffshoreLevel0 = false;
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.Surest_Offshore_Provisions__c') {
      if (event.target.value == 'Level 7 All Business Operations and It Work') {
        this.showSurestOffshoreLevel7 = true;
      }
      else {
        this.showSurestOffshoreLevel7 = false;
      }
    }

    if (event.target.name == 'Sold_Case_Checklist__c.Surest_CAA_IDR_Service_Fees__c') {
      if (event.target.value == 'Carve-out' || event.target.value == 'EMT Approval') {
        this.showSurestCaaTextBox = true;

        setTimeout(() => {
          var caaT1 = this.template.querySelector('.caaTextBoxClass1');
          caaT1.value = '';
        }, 300);

        if (event.target.value == 'Carve-out') {
          this.surestCaaTextBoxPlaceholder = 'Vendor name & contact';
        }

        if (event.target.value == 'EMT Approval') {
          this.surestCaaTextBoxPlaceholder = 'EMT Approval #';
        }
      }
      else {
        this.showSurestCaaTextBox = false;
      }
    }

    const ClientDetailRecord = new CustomEvent("progressvaluechange", {
      detail: editfielddetails
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
    return allValid;
  }


  renderedCallback() {
    if (this.editmode) {
      var p1 = this.template.querySelector('.preAud1');
      var p2 = this.template.querySelector('.preAud2');
      var p3 = this.template.querySelector('.preAud3');

      var levelBox = this.template.querySelector('.offShoreMain');
      var level0 = this.template.querySelector('.offShore0');
      var level7 = this.template.querySelector('.offShore7');

      var caa1 = this.template.querySelector('.caaMain');
      var caaTb = this.template.querySelector('.caaTextBoxClass');

      var sc1 = this.template.querySelector('.spanClass1');
      var sc2 = this.template.querySelector('.spanClass2');

      var p4 = this.template.querySelector('.spreAud1');
      var p5 = this.template.querySelector('.spreAud2');
      var p6 = this.template.querySelector('.spreAud3');

      var caa2 = this.template.querySelector('.caaMain1');
      var caaT2 = this.template.querySelector('.caaTextBoxClass1');

      var sc3 = this.template.querySelector('.spanClass3');
      var sc4 = this.template.querySelector('.spanClass4');

      var levelBox1 = this.template.querySelector('.offShoreMain1');
      var offShorelevel0 = this.template.querySelector('.offShorelevel0');

      if (p1 !== null) {
        if (p1.value == 'Yes') {
          p1.style = 'width:33%; float:left; ';
          p2.style = 'width:33%; float:left;';
          p3.style = 'width:33.5%; float:right;';
        }
        else {
          p1.style = 'width:66.5%; float:right;';
        }
      }
   
      if (p4 !== null) {
        if (p4.value == 'Yes') {
          p4.style = 'width:33%; float:left; ';
          p5.style = 'width:33%; float:left;';
          p6.style = 'width:33.5%; float:right;';
        }
        else {
          p4.style = 'width:66.5%; float:right;';
        }
      }

      if (levelBox !== null) {
        if (levelBox.value == 'Level 0 Individual Functions') {
          levelBox.style = 'width:100%; margin-bottom:6px;';
          level0.style = 'width:100%;'
          sc1.style = 'width:100%';
        }
        else if (levelBox.value == 'Level 7 All Business Operations and It Work') {
          sc1.style = 'width:100%';
          levelBox.style = 'width:100%; margin-bottom:5px;';
          sc2.style = 'width:100%;'
        }
        else {
          levelBox.style = 'width:100%;';
          sc1.style = 'width:100%';
        }
      }

      if (levelBox1 !== null) {
        if (levelBox1.value == 'Level 0 Individual Functions') {
          levelBox1.style = 'width:100%; margin-bottom:6px;';
          offShorelevel0.style = 'width:100%;'
          sc3.style = 'width:100%';
        }
        else if (levelBox1.value == 'Level 7 All Business Operations and It Work') {
          sc3.style = 'width:100%';
          levelBox1.style = 'width:100%; margin-bottom:5px;';
          sc4.style = 'width:100%;'
        }
        else {
          levelBox1.style = 'width:100%;';
          sc3.style = 'width:100%';
        }
      }

      if (caa1 !== null) {
        if (caa1.value == 'Carve-out' || caa1.value == 'EMT Approval') {
          caa1.style = 'width:49%; float:left;';
          caaTb.style = 'width:49%; float:right;';
        }
        else {
          caa1.style = 'width:100%; float:right;';
        }
      }

      if (caa2 !== null) {
        if (caa2.value == 'Carve-out' || caa2.value == 'EMT Approval') {
          caa2.style = 'width:49%; float:left;';
          caaT2.style = 'width:49%; float:right;';
        }
        else {
          caa2.style = 'width:100%; float:right;';
        }
      }
    }

    if (
      this.template.querySelector(".section-header-style") === null ||
      this.hasRendered === true
    )
      return;
    this.hasRendered = true;
    let style = document.createElement("style");
    style.innerText = `     
                .section-header .slds-accordion__summary-heading{
                    background-color: hsla(219, 49%, 67%, 0.79);
                    padding: 4px 10px;
                    border-radius: 3px;
                    font-weight: 600;
                }    
            `;
    this.template.querySelector(".section-header-style").appendChild(style);
  }
}