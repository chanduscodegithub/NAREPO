import { LightningElement, wire, api, track } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import ACCOUNT_TYPE from '@salesforce/schema/Account.Category__c';
import getOtherProdData from '@salesforce/apex/Competitive_Other_Prod_Controller.getOtherProdData';
import getAccountType from '@salesforce/apex/CompetitiveLandscape_OthersClass.getAccountType';
import checkEditAccess from '@salesforce/apex/Competitive_Other_Prod_Controller.checkEditAccess';
import updateCompetitorRecs from '@salesforce/apex/Competitive_Other_Prod_Controller.updateCompetitorRecs';
import insertCompetitorRecs from '@salesforce/apex/Competitive_Other_Prod_Controller.insertCompetitorRecs';
import COMPETITOR_OBJECT from '@salesforce/schema/Competitor__c';
import Types_of_Other_Products_Services_Provided from '@salesforce/schema/Competitor__c.Type_of_Products_Services_Provided__c';
import Hub_Vendor from '@salesforce/schema/Competitor__c.Hub_vendor__c';
import Type_Of_File from '@salesforce/schema/Competitor__c.Type_of_File__c';
import My_Uhc_Customization from '@salesforce/schema/Competitor__c.Special_MyUhc_com_Customization_column__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CompetitiveLandscapeOtherSecMainComp extends LightningElement {
  @api recordId;
  @track otherProdData;
  productsServicesProvided;
  pointSolution;
  hubVendor;
  typeOfFile;
  myUhcCustomization;
  OtherProdDataresult;
  recIdArr = [];
  isAddVendor = false;
  isExpand = false;
  isLoading = true;
  isEdit = false;
  isPrint = false;
  disablePrint = true;
  hasAccess;
  isDeleteRec;
  recordToRemoveIndex;
  disableDeleteRec;
  addCompetitor;
  enableOtherProdPrint;
  competitorRecsToInsert = [];
  isTermination = false;
  terminationDate;
  isDateNotPicked = true;
  removedRecords = [];

  connectedCallback() {
    this.enableOtherProdPrint = true;
    this.fetchAccountType();
    setTimeout(() => {
      this.fetchData();
    }, 2000);
  }

  fetchAccountType() {
    getAccountType({ accountId: this.recordId })
      .then((result) => {
        this.accountType = result.accountType;
      })
      .catch((error) => {
        const event = new ShowToastEvent({
          title: 'Error',
          variant: 'error',
          message: `Error in Competitive Landscape - Other Products. Please Contact admin`,
        });
        this.dispatchEvent(event);
        console.log('Error = ',error);
      })
  }

  fetchData() {
    getOtherProdData({ accId: this.recordId })
      .then((result) => {
        let sortArray = ['Yes', 'No'];
        this.otherProdData = result.competitorList.map((item) => Object.assign({}, item));
        this.otherProdData.forEach((item) => {
          item.isNew = false;
          if (item.Type_of_File__c) {
            item.typeOfFile = item.Type_of_File__c.split(';');
            item.Type_of_File__c = String(this.shiftElementToEnd(item.Type_of_File__c.split(';'), 'Other (specify in notes)')).replaceAll(',', '; ');
          }
          this.modifyMultipicklist(item);
        })
        this.addCompetitor = !result.access;
        this.hasAccess = !(result.access && result.competitorList.length > 0);
        this.disableDeleteRec = result.access ? '' : 'disable-icon';
        this.otherProdData = this.otherProdData.filter(item => item.CompetitorAccount__r && item.CompetitorAccount__r.Name);
        this.otherProdData.sort((a, b) => {
          return a.CompetitorAccount__r.Name.localeCompare(b.CompetitorAccount__r.Name);
        })
        this.isLoading = false;
        if (this.otherProdData.length > 0) this.disablePrint = false;
      })
      .catch((error) => {
        const event = new ShowToastEvent({
          title: 'Error',
          variant: 'error',
          message: `Error in Competitive Landscape - Other Products. Please Contact admin`,
        });
        this.dispatchEvent(event);
        this.isLoading = false;
        console.log('Error = ',error);
      })
  }

  shiftElementToEnd(array, element) {
    if (array.length > 0) {
      array.sort();
      let index = array.indexOf(element);
      let elementToShift = array.splice(index, 1)[0];
      array.push(elementToShift);
    }
    return array;
  }

  @wire(getObjectInfo, { objectApiName: COMPETITOR_OBJECT })
  competitorObjInfo;

  @wire(getPicklistValues, { recordTypeId: '$competitorObjInfo.data.defaultRecordTypeId', fieldApiName: Types_of_Other_Products_Services_Provided })
  typeOfProdAndServices({ data, error }) {
    if (data && data.values) {
      let excludeArr = ['Medical', 'Pharmacy', 'Dental', 'Vision'];
      this.productsServicesProvided = data.values.map((picklist) => {
        return { label: picklist.label, value: picklist.value };
      });
      this.productsServicesProvided = this.productsServicesProvided.filter((item) => {return !excludeArr.includes(item.value)});
    }
    else if (error) {
      const event = new ShowToastEvent({
        title: 'Error',
        variant: 'error',
        message: `Error in Competitive Landscape - Other Products. Please Contact admin`,
      });
      this.dispatchEvent(event);
      console.log('Error = ',error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$competitorObjInfo.data.defaultRecordTypeId', fieldApiName: Hub_Vendor })
  hubVendorOptions({ data, error }) {
    if (data && data.values) {
      this.hubVendor = data.values.map((picklist) => {
        return { label: picklist.label, value: picklist.value };
      });
      console.log('this.hubVendor = ', JSON.stringify(this.hubVendor));
    }
    else if (error) {
      const event = new ShowToastEvent({
        title: 'Error',
        variant: 'error',
        message: `Error in Competitive Landscape - Other Products. Please Contact admin`,
      });
      this.dispatchEvent(event);
      console.log('Error = ',error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$competitorObjInfo.data.defaultRecordTypeId', fieldApiName: Type_Of_File })
  typeOfFileOptions({ data, error }) {
    if (data && data.values) {
      this.typeOfFile = data.values.map((picklist) => {
        return picklist.value;
      });
      this.typeOfFile = this.shiftElementToEnd(this.typeOfFile, 'Other (specify in notes)');
      console.log('this.typeOfFile = ', JSON.stringify(this.typeOfFile));
    }
    else if (error) {
      const event = new ShowToastEvent({
        title: 'Error',
        variant: 'error',
        message: `Error in Competitive Landscape - Other Products. Please Contact admin`,
      });
      this.dispatchEvent(event);
      console.log('Error = ',error);
    }
  }

  @wire(getPicklistValues, { recordTypeId: '$competitorObjInfo.data.defaultRecordTypeId', fieldApiName: My_Uhc_Customization })
  myUhcCustomizationOptions({ data, error }) {
    if (data && data.values) {
      this.myUhcCustomization = data.values.map((picklist) => {
        return { label: picklist.label, value: picklist.value };
      });
      console.log('this.myUhcCustomization = ', JSON.stringify(this.myUhcCustomization));
    }
    else if (error) {
      const event = new ShowToastEvent({
        title: 'Error',
        variant: 'error',
        message: `Error in Competitive Landscape - Other Products. Please Contact admin`,
      });
      this.dispatchEvent(event);
      console.log('Error = ',error);
    }
  }

  modifyMultipicklist(record) {
    let picklistValuesArr = [];
    this.typeOfFile.forEach((picklistyValue) => {
      if (record.hasOwnProperty('Type_of_File__c')) {
        if (record.Type_of_File__c.includes(picklistyValue)) {
          picklistValuesArr.push({ 'text': picklistyValue, 'value': picklistyValue, 'selected': "true" });
        }
        else {
          picklistValuesArr.push({ 'text': picklistyValue, 'value': picklistyValue });
        }
      }
      else {
        picklistValuesArr.push({ 'text': picklistyValue, 'value': picklistyValue });
      }
    })
    record.typeOfFile = picklistValuesArr;
  }

  handleAddVendor(event) {
    this.isAddVendor = true;
  }

  handleCloseModal(event) {
    this.isAddVendor = event.detail;
  }

  handleModalSave(event) {
    this.isAddVendor = event.detail.isAddVendor;
    this.isLoading = event.detail.isAddVendor.isLoading;
    this.competitorRecsToInsert = event.detail.competitorRecs;
    this.competitorRecsToInsert.forEach((record) => {
      record.isNew = true;
      record.Type_of_File__c = '';
      this.modifyMultipicklist(record);

    })
    this.otherProdData = [...this.otherProdData, ...this.competitorRecsToInsert];
    let section = this.template.querySelector('.slds-accordion__section');
    if (section && !section.classList.contains('slds-is-open')) {
      section.classList.add('slds-is-open');
    }
    this.isEdit = true;
  }

  handleExpandCollapse(event) {
    let section = this.template.querySelector('.slds-accordion__section');
    this.isExpand = !this.isExpand;
    if (section && section.classList.contains('slds-is-open')) {
      section.classList.remove('slds-is-open');
    }
    else {
      section.classList.add('slds-is-open');
    }
  }

  handleEdit(event) {
    this.isEdit = true;
    this.removedRecords = [];
  }

  handleCancel(event) {
    this.isLoading = true;
    this.removedRecords = [];
    this.fetchData();
    this.isEdit = false;
  }

  handleEditChange(event) {
    let index = event.target.dataset.index;
    let record = this.otherProdData[index];
    let fieldApi = event.target.name;
    let fieldValue = event.target.value;
    record[fieldApi] = fieldValue;
  }

  handleSave(event) {
    this.isLoading = true;
    this.otherProdData = this.removedRecords.length > 0 ? [...this.otherProdData, ...this.removedRecords] : this.otherProdData;
    this.updateCompetitors(this.otherProdData);
    this.isEdit = false;
  }

  updateCompetitors(records) {
    let recsToUpdate = records.filter((item) => item.hasOwnProperty('isNew') && item.isNew == false);
    let recsToInsert = records.filter((item) => item.hasOwnProperty('isNew') && item.isNew == true);

    if (recsToInsert.length > 0) {
      recsToInsert.forEach((item) => {
        item.Competitorclassification__c = 'Other';
        item.Type__c = 'Account Competitor';
      });
    }
    
    insertCompetitorRecs({ competitorListToInsert: recsToInsert, competitorListToUpdate: recsToUpdate })
      .then((results) => {
        this.fetchData();
        this.removedRecords = [];
        this.isLoading = false;
      })
      .catch((error) => {
        const event = new ShowToastEvent({
          title: 'Error',
          variant: 'error',
          message:
            'Error while updating records. Please contact your admin',
        });
        this.dispatchEvent(event);
        this.removedRecords = [];
        this.isLoading = false;
        console.log('Error = ',error);
      })
  }

  handleRecDelete(event) {
    this.recordToRemoveIndex = event.target.dataset.index;
    this.isDeleteRec = true;
  }

  handleDeleteCancel() {
    this.isDeleteRec = false;
    this.isTermination = false;
    this.terminationDate = '';
  }

  handleRemoveRecord(event) {
    let dataToApex = []
    let index = this.recordToRemoveIndex;
    let record = this.otherProdData[index];
    let fieldApi = event.target.name;
    let inactiveDate = event.target.dataset.date;
    let today = (new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear();
    record[fieldApi] = true;
    record[inactiveDate] = today;

    if (this.isTermination) {
      let terminationApi = event.target.dataset.termination;
      record[terminationApi] = this.terminationDate;
    }

    dataToApex.push(this.otherProdData[index]);
    this.removedRecords = [...this.removedRecords, ...this.otherProdData.splice(index, 1)];
    //this.otherProdData.splice(index, 1);
    this.isDeleteRec = false;
    this.isTermination = false;
    this.terminationDate = '';

    if (!this.isEdit) {
      this.isLoading = true;
      updateCompetitorRecs({ competitorListToUpdate: dataToApex })
        .then((result) => {
          this.fetchData();
          this.isLoading = false;
        })
        .catch((error) => {
          const event = new ShowToastEvent({
            title: 'Error',
            variant: 'error',
            message:
              'Error while record removal. Please contact your admin',
          });
          this.dispatchEvent(event);
          this.isLoading = false;
          console.log('Error = ',error);
        })
    }
  }

  handleMultiPickList(event) {
    console.log('Event Detail = ', JSON.stringify(event.detail));
  }

  handleChildDropdown(event) {
    console.log('event.detail = ', JSON.stringify(event.detail));
    let record = this.otherProdData[event.detail.record];
    if (event.detail.value.length > 0) {
      let selectedValuesSet = new Set();
      event.detail.value.forEach((item) => {
        selectedValuesSet.add(item.otherProductRecord);
      });
      let selectedValues = Array.from(selectedValuesSet);
      record.Type_of_File__c = String(selectedValues).replaceAll(',', ';');
    }
    else {
      record.Type_of_File__c = '';
    }
  }

  handlePrint(event) {
    this.isPrint = true;
  }

  handleVendorTermination(event) {
    this.isTermination = true;
  }

  handleDate(event) {
    this.terminationDate = event.target.value;
    this.isDateNotPicked = this.terminationDate ? false : true;
  }
}