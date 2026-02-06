import { LightningElement, track, api, wire } from "lwc";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import Oppobjct from "@salesforce/schema/Opportunity";
import PONetworkaccess from "@salesforce/schema/Opportunity.PPO_Network_Access_and_Discounts__c";
import extendnetworkaccess from "@salesforce/schema/Opportunity.Extended_Network_Access__c";
import CSPNetwork from "@salesforce/schema/Opportunity.Extended_Network_Access__c";
import groupnetwork from "@salesforce/schema/Opportunity.Group_Specific_Provider_GSP_Network__c";
import PPONetworkAccessDiscounts from "@salesforce/schema/Opportunity.PPO_Network_Access_and_Discounts__c";
import passportnetwork from "@salesforce/schema/Opportunity.Passport_Connect_with_Harvard_Pilgrim__c";
import physicalhealsol from "@salesforce/schema/Opportunity.Physical_Health_Solutions__c";

import SccObject from '@salesforce/schema/Sold_Case_Checklist__c'; //SAMARTH
import PPONetworkAccessDiscountsScc from "@salesforce/schema/Sold_Case_Checklist__c.PPO_Network_Access_and_Discounts__c"; //SAMARTH
import cspNetworkScc from "@salesforce/schema/Sold_Case_Checklist__c.Customer_Sponsored_CSP_Network__c"; //SAMARTH
import gspNetworkScc from "@salesforce/schema/Sold_Case_Checklist__c.Group_Specific_Provider_GSP_Network__c"; //SAMARTH
import passportConnectScc from "@salesforce/schema/Sold_Case_Checklist__c.Passport_Connect_with_Harvard_Pilgrim__c"; //SAMARTH
import extendnetworkaccessScc from "@salesforce/schema/Sold_Case_Checklist__c.Extended_Network_Access__c"; //SAMARTH
import physicalhealthsolScc from "@salesforce/schema/Sold_Case_Checklist__c.Physical_Health_Solutions_Network_Only__c"; //SAMARTH
import leasedNetwork from "@salesforce/schema/Sold_Case_Checklist__c.Leased_Network__c"; //SAMARTH

import hpAllianceScc from "@salesforce/schema/Sold_Case_Checklist__c.HP_Alliance__c"; //SAMARTH
import preferredHpScc from "@salesforce/schema/Sold_Case_Checklist__c.Preferred_HP__c"; //SAMARTH

export default class SoldCaseNetworkComp extends LightningElement {
  @api editmode;
  @track activeSections = "Network";
  //@api checkdetail;
  @api opportunityFieldLabels;
  @api accountFieldLabels;
  @track POnetworkaccessvalue;
  @track extendnetworkaccessvalue;
  @track CSPNEtworkvalues;
  @track groupnetworkvalues;
  @track passportnetworkvalues;
  @track physicalhealthsolvalues;
  @track ppoNetworkAccessDiscountsValues;
  @track enableExtendedLevel2 = false;
  @track networkDetail;
  @track enableConditionalMandatoryFields = false;
  @track opportunityFields;
  @track accountFields;

  hasRendered = false;

  //--------------------SAMARTH SCC 2021--------------------
  @track soldCaseDataCopy;
  @api ppoNetworkAccessDiscountsSccValues;
  @api cspNetworkSccValues;
  @api gspNetworkSccValues;
  @api passportConnectSccValues;
  @api hpSoldRetainedSccValues;
  @api extendnetworkaccessSccValues;
  @api physicalhealthsolSccvalues;
  @api leasedNetworkValues;
  @api hpAllianceSccValues;
  @api preferredHpSccValues;
  //--------------------SAMARTH SCC 2021--------------------


  //---------SAMARTH SCC NB UPGRADE 2023---------
  @api soldCaseCheckListInstructions;
  @api ppoNetworkAccesssHelpText;
  @api hiPrLeasedNetworkHelpText;
  //---------SAMARTH SCC NB UPGRADE 2023---------

  connectedCallback() {
    if (this.editmode === false) {
      if (this.soldCaseDataCopy.Passport_Connect_with_Harvard_Pilgrim__c === 'Yes') {
        this.enableConditionalMandatoryFields = true;
      } else {
        this.enableConditionalMandatoryFields = false;
      }

      if (this.soldCaseDataCopy.Extended_Network_Access__c === 'Yes') {
        this.enableExtendedLevel2 = true;
      } else {
        this.enableExtendedLevel2 = false;
      }
    }

    //------------------------------------SAMARTH SCC NB UPGRADE 2023------------------------------------
    for (let i in this.soldCaseCheckListInstructions) {
      if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.PPO_Network_Access_and_Discounts__c') {
          this.ppoNetworkAccesssHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
      } else if (this.soldCaseCheckListInstructions[i]['Field_Api_Name__c'] === 'SCC.Leased_Network__c') {
          this.hiPrLeasedNetworkHelpText = this.soldCaseCheckListInstructions[i]['Help_Text_Value__c'];
      }
    }
    //------------------------------------SAMARTH SCC NB UPGRADE 2023------------------------------------
  }

  get isDataReceived() {
    if (this.networkDetail !== undefined && this.accountFieldLabels !== undefined && this.opportunityFieldLabels !== undefined) {
      return true;
    }
    return false;
  }

  //----------------------------------------SAMARTH SCC 2021----------------------------------------
  @api
  get soldCaseObjectData() {
    return soldCaseObjectData;
  }
  set soldCaseObjectData(value) {
    this.soldCaseDataCopy = Object.assign({}, value);
  }
  //----------------------------------------SAMARTH SCC 2021----------------------------------------

  @api
  get checkdetail() {
    return this.masterData;
  }
  set checkdetail(value) {
    this.masterData = Object.assign({}, value);
    this.networkDetail = Object.assign({}, value);
  }

  @wire(getObjectInfo, {
    objectApiName: SccObject
  })
  sccObjectInfo;

  @wire(getObjectInfo, {
    objectApiName: Oppobjct
  })
  objectInfo;

  @wire(getObjectInfo, { objectApiName: Oppobjct })
  oppInfo({ data, error }) {
    if (data) {
      this.opportunityFields = data.fields;
    }
  }

  @wire(getPicklistValues, { recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId", fieldApiName: leasedNetwork })
  leasedNetworkValue({ error, data }) {
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
      this.leasedNetworkValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId", fieldApiName: PPONetworkAccessDiscountsScc })
  ppoNetSccValue({ error, data }) {
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
      this.ppoNetworkAccessDiscountsSccValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId", fieldApiName: cspNetworkScc })
  cspNetSccValue({ error, data }) {
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
      this.cspNetworkSccValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId", fieldApiName: gspNetworkScc })
  gspNetSccValue({ error, data }) {
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
      this.gspNetworkSccValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId", fieldApiName: passportConnectScc })
  passConnSccValue({ error, data }) {
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
      this.passportConnectSccValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId", fieldApiName: extendnetworkaccessScc })
  extendnetworkaccessSccValue({ error, data }) {
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
      this.extendnetworkaccessSccValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId", fieldApiName: physicalhealthsolScc })
  physicalhealthsolSccValue({ error, data }) {
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
      this.physicalhealthsolSccvalues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId", fieldApiName: hpAllianceScc })
  hpAllianceSccValue({ error, data }) {
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
      this.hpAllianceSccValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: "$sccObjectInfo.data.defaultRecordTypeId", fieldApiName: preferredHpScc })
  preferredHpSccValue({ error, data }) {
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
      this.preferredHpSccValues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: "$objectInfo.data.defaultRecordTypeId", fieldApiName: physicalhealsol })
  OppPhysicalValue({ error, data }) {
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
      this.physicalhealthsolvalues = testPickListvalues;
    }
    else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: passportnetwork
  })
  OppPassportnetValue({ error, data }) {
    if (data) {
      //this.passportnetworkvalues = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.passportnetworkvalues = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: groupnetwork
  })
  OppGrpNetValue({ error, data }) {
    if (data) {
      //this.groupnetworkvalues = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.groupnetworkvalues = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }
  /* Picklist api to get PPO_Network_Access_and_Discounts__c - START */
  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: PPONetworkAccessDiscounts
  })
  ppoNetworkAccessDiscountsMethod({ error, data }) {
    if (data) {
      //this.ppoNetworkAccessDiscountsValues = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.ppoNetworkAccessDiscountsValues = testPickListvalues;
    } else if (error) {
      console.log(error);
    }
  }
  /* Picklist api to get PPO_Network_Access_and_Discounts__c - END */

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: CSPNetwork
  })
  OppCSPNetValue({ error, data }) {
    if (data) {
      //this.CSPNEtworkvalues = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.CSPNEtworkvalues = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: PONetworkaccess
  })
  OppPONetValue({ error, data }) {
    if (data) {
      //this.POnetworkaccessvalue = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.POnetworkaccessvalue = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "$objectInfo.data.defaultRecordTypeId",
    fieldApiName: extendnetworkaccess
  })
  OppextendValue({ error, data }) {
    if (data) {
      //this.extendnetworkaccessvalue = data;

      let testPickListvalues = [];
      for (let i in data.values) {
        if (data.values[i] !== undefined) {
          if (i === '0') {
            testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
          }
          testPickListvalues.push(data.values[i]);
        }
      }

      this.extendnetworkaccessvalue = testPickListvalues;

    } else if (error) {
      console.log(error);
    }
  }

  handleSectionToggle(event) {
    const openSections = event.detail.openSections;
  }

  FieldChangeHandler(event) {
    let choosenValue;
    let selectedrecords = {};
    let selectedname = event.target.name;
    let editfielddetails; //SAMARTH SCC 2021

    selectedrecords[selectedname] = event.target.value;
    this.Clientdatarecord = selectedrecords;
    choosenValue = event.target.value;

    /* Logic to check Passport_Connect_with_Harvard_Pilgrim__c and enable conditional mandatory fields - START */
    /* if (event.target.name === 'Passport_Connect_with_Harvard_Pilgrim__c') {
      if (event.target.value === 'Yes') {
        this.enableConditionalMandatoryFields = true;
      } else {
        this.enableConditionalMandatoryFields = false;
        this.networkDetail.HP_Sold_Retained_Employees_Only__c = '';
        this.networkDetail.HP_Sold_Retained_Members__c = '';
      }
    } */
    if (event.target.name === 'Sold_Case_Checklist__c.Passport_Connect_with_Harvard_Pilgrim__c') {
      if (event.target.value === 'Yes') {
        this.enableConditionalMandatoryFields = true;
      } else {
        this.enableConditionalMandatoryFields = false;
        this.soldCaseDataCopy.HP_Sold_Retained_Members__c = '';

        this.soldCaseDataCopy.HP_Alliance__c = '';
        this.soldCaseDataCopy.Preferred_HP__c = '';
      }
    }

    if (event.target.name === 'Sold_Case_Checklist__c.Extended_Network_Access__c') {
      if (event.target.value === 'Yes') {
        this.enableExtendedLevel2 = true;
      } else {
        this.enableExtendedLevel2 = false;
        this.soldCaseDataCopy.Extended_Network_Access_Level2__c = '';
      }
    }

    /* Logic to check Passport_Connect_with_Harvard_Pilgrim__c and enable conditional mandatory fields - END */

    //--------------------------------SAMARTH SCC 2021--------------------------------
    if (event.target.name.indexOf('Sold_Case_Checklist__c.') !== -1) {
      //console.log('Entering if');
      choosenValue = event.target.value;
      editfielddetails = [{
        fieldedited: event.target.name,
        fieldvalue: choosenValue
      }];
      //console.log('editfielddetails ' + JSON.stringify(editfielddetails));
    }
    //--------------------------------SAMARTH SCC 2021--------------------------------

    //Updating current updates when user performs any edit 
    this.networkDetail[selectedname] = event.target.value;

    editfielddetails = [{
      fieldedited: event.target.name,
      fieldvalue: choosenValue
    }];
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
      var sc1 = this.template.querySelector('.exNetAccess');
      var sc2 = this.template.querySelector('.exNetAccessLevel2');
      //console.log(sc1.value);

      if (sc1 !== null) {
        if (sc1.value == 'Yes') {
          sc1.style = 'width:50%; float:left; ';
          sc2.style = 'width:48%; float:right;margin-left: 4px;';
        }
        else {
          sc1.style = 'width:100%; float:right;';
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