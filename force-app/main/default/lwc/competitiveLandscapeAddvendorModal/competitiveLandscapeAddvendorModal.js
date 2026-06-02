import { LightningElement, wire, track, api } from 'lwc';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import getVendorCarrierData from '@salesforce/apex/Competitive_Other_Prod_Controller.getVendorCarrierData';
import sendMailCompetitor from '@salesforce/apex/CompetitorEmailFormClass.sendMailCompetitor';
import COMPETITOR_OBJECT from '@salesforce/schema/Competitor__c';
import Types_of_Other_Products_Services_Provided from '@salesforce/schema/Competitor__c.Type_of_Products_Services_Provided__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CompetitiveLandscapeAddvendorModal extends LightningElement {

  initialVendorData;
  @track displayVendorName = [];
  isCarrier = true;
  @track selectedCarriers = [];
  options = [];
  @track isChecked = false;
  @track selectedCarrierObj = {};
  @track selectedCarrierArr = [];
  @track selectedCarrierArrCopy = [];
  @api accId;
  @track searchInput;
  searchInputDom;
  searchResult;
  isSearchResult;
  isLoading = true;
  isSendEmail = false;
  emailDataObj = { companyName: '', webAddress: '', prodTypesOffered: '', address: '', additionalComments: '', compRowId: '' };
  emailProduct = [{ label: 'Other Buy Up Programs', value: 'Other Buy Up Programs' }];
  @track allOtherCompetitors = [];
  @track topCompetitors = [];
  @track theBluesandtheirAffiliates = [];
  @track exchangeCompetitors = [];
  activeTab = 'All Other Competitors';
  pageSize = 10;
  currentPage = 1;
  totalPages = { 'AllOtherCompetitors': '', 'TheBluesandtheirAffiliates': '', 'ExchangeCompetitors': '', 'TopMedicalCompetitors': '' };
  isPrevious;
  isNext;
  @track disableAddProducts = true;
  cancelInsert;

  @api
  get numOfVendors() {
    return this.displayVendorName.length ? this.displayVendorName.length : 0;
  }

  isObjectEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  @wire(getObjectInfo, { objectApiName: COMPETITOR_OBJECT })
  competitorObjInfo;

  @wire(getPicklistValues, { recordTypeId: '$competitorObjInfo.data.defaultRecordTypeId', fieldApiName: Types_of_Other_Products_Services_Provided })
  typeOfProdAndServices({ data, error }) {
    if (data && data.values) {
      console.log('Picklist values = ', JSON.stringify(data));
      let excludeArr = ['Medical', 'Pharmacy', 'Dental', 'Vision'];
      this.options = data.values.map((picklist) => {
        //return picklist.value;
        return { 'text': picklist.value, 'value': picklist.value }
      });
      this.options = this.options.filter((item) => {return !excludeArr.includes(item.value)});
    }
    else if (error) {
      console.log('error in picklist = ', JSON.stringify(error));
      const event = new ShowToastEvent({
        title: 'Error',
        variant: 'error',
        message:
          'Error While fetching Type_of_Products_Services_Provided__c. Please contact your admin',
      });
      this.dispatchEvent(event);
      console.log('Error = ',error);
    }
  }

  @wire(getVendorCarrierData)
  getCarrierData({ data, error }) {
    if (data) {
      this.initialVendorData = data.map((item) => {
        return Object.assign({}, item);
      });
      this.isLoading = false;
      this.getRecordsForPage(this.currentPage);
      console.log('this.initialVendorData = ', JSON.stringify(this.initialVendorData));
    }
    else if (error) {
      console.log('error in Modal = ', JSON.stringify(error));
      const event = new ShowToastEvent({
        title: 'Error',
        variant: 'error',
        message:
          'Error While fetching Data. Please contact your admin',
      });
      this.dispatchEvent(event);
      this.isLoading = false;
      console.log('Error = ',error);
    }
  }

  seggregateCompetitorData(Competitordata) {
    this.topCompetitors = Competitordata.filter((item) => item.Top_Competitor__c === true);
    this.theBluesandtheirAffiliates = Competitordata.filter((item) => item.The_Blues_and_their_Affiliates__c === true);
    this.exchangeCompetitors = Competitordata.filter((item) => item.Exchange_Competitors__c === true);
    this.allOtherCompetitors = Competitordata.filter((item) => !item.Top_Competitor__c && !item.The_Blues_and_their_Affiliates__c && !item.Exchange_Competitors__c);

    this.totalPages.AllOtherCompetitors = Math.ceil(this.allOtherCompetitors.length / this.pageSize);
    this.totalPages.TheBluesandtheirAffiliates = Math.ceil(this.theBluesandtheirAffiliates.length / this.pageSize);
    this.totalPages.ExchangeCompetitors = Math.ceil(this.exchangeCompetitors.length / this.pageSize);
    this.totalPages.TopMedicalCompetitors = Math.ceil(this.topCompetitors.length / this.pageSize);
  }

  seggregateCompetitorDataForSearch(Competitordata, keyword) {
    let keywordValue = keyword.toLowerCase();
    this.topCompetitors = Competitordata.filter((item) => item.Top_Competitor__c === true && item.Name.toLowerCase().includes(keywordValue));
    this.theBluesandtheirAffiliates = Competitordata.filter((item) => item.The_Blues_and_their_Affiliates__c === true && item.Name.toLowerCase().includes(keywordValue));
    this.exchangeCompetitors = Competitordata.filter((item) => item.Exchange_Competitors__c === true && item.Name.toLowerCase().includes(keywordValue));
    this.allOtherCompetitors = Competitordata.filter((item) => !item.Top_Competitor__c && !item.The_Blues_and_their_Affiliates__c && !item.Exchange_Competitors__c && item.Name.toLowerCase().includes(keywordValue));

    this.totalPages.AllOtherCompetitors = Math.ceil(this.allOtherCompetitors.length / this.pageSize);
    this.totalPages.TheBluesandtheirAffiliates = Math.ceil(this.theBluesandtheirAffiliates.length / this.pageSize);
    this.totalPages.ExchangeCompetitors = Math.ceil(this.exchangeCompetitors.length / this.pageSize);
    this.totalPages.TopMedicalCompetitors = Math.ceil(this.topCompetitors.length / this.pageSize);
  }


  getRecordsForPage(pageNum) {
    this.isSearchResult ? this.seggregateCompetitorDataForSearch(this.initialVendorData, this.searchInput) : this.seggregateCompetitorData(this.initialVendorData);
    let ctg = this.activeTab;
    let startIndex = (pageNum - 1) * this.pageSize;
    let endIndex = startIndex + this.pageSize;
    switch (ctg) {
      case 'All Other Competitors':
        this.allOtherCompetitors = this.allOtherCompetitors.slice(startIndex, endIndex);
        break;
      case 'The Blues and their Affiliates':
        this.theBluesandtheirAffiliates = this.theBluesandtheirAffiliates.slice(startIndex, endIndex);
        break;
      case 'Exchange Competitors':
        this.exchangeCompetitors = this.exchangeCompetitors.slice(startIndex, endIndex);
        break;
      case 'Top Medical Competitors':
        this.topCompetitors = this.topCompetitors.slice(startIndex, endIndex);
        break;
    }
    this.displayPreviousNext();
  }

  displayPreviousNext() {
    let category = this.activeTab.replace(/\s/g, '');
    let totalPage = this.totalPages[category];
    this.currentPage > 1 ? this.isPrevious = true : this.isPrevious = false;
    this.currentPage === totalPage || totalPage <= 1 ? this.isNext = false : this.isNext = true;
  }

  handleNextPage() {
    let category = this.activeTab.replace(/\s/g, '');
    let totalPage = this.totalPages[category];
    if (this.currentPage < totalPage) {
      this.currentPage++;
      this.getRecordsForPage(this.currentPage);
    }
    this.displayPreviousNext();
  }

  handlePreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getRecordsForPage(this.currentPage);
    }
    this.displayPreviousNext();
  }

  handleModalCancel(event) {
    const modalClose = new CustomEvent('closemodal', { detail: false });
    this.dispatchEvent(modalClose);
  }

  handleEmailModalClose(event) {
    this.isSendEmail = false;
  }

  handleActiveTab(event) {
    this.activeTab = event.target.label;
    this.currentPage = 1;
    this.getRecordsForPage(this.currentPage);
  }

  handleAddProducts(event) {
    this.isCarrier = false;
    this.createSelectedObjToArray(this.selectedCarrierObj);
  }

  handleBack(event) {
    this.isCarrier = true;
    this.selectedCarrierArrCopy = this.selectedCarrierArr;
    this.selectedCarrierArr = [];
    this.isSearchResult = false;
    this.getRecordsForPage(this.currentPage);
  }

  verifyProductArr() {
    if (Array.isArray(this.selectedCarrierArrCopy) && this.selectedCarrierArrCopy.length > 0) {
      const idSet = new Set(this.selectedCarrierArrCopy.map(item => item.Id));

      this.selectedCarrierArr.forEach((item, index) => {
        if (idSet.has(item.Id)) {
          const correspondingCopyItem = this.selectedCarrierArrCopy.find(copyItem => copyItem.Id === item.Id);
          if (correspondingCopyItem) {
            item.Type_of_Products_Services_Provided__c = correspondingCopyItem.Type_of_Products_Services_Provided__c;
            item.isInsertable = correspondingCopyItem.isInsertable;
          }
        }
      });
    }
  }

  handleChecked(event) {
    let checked = event.target.checked;
    let carrierName = event.target.name;
    let carrierId = event.target.dataset.id;
    //let poinSolution = event.target.dataset.pointsolution;
    //let hubVendor = event.target.dataset.hubvendor;
    let accountName = event.target.dataset.accountname;

    if (checked) {
      this.selectedCarrierObj[carrierId] = {
        name: carrierName,
        Id: carrierId, isChecked: checked,
        //Point_Solution__c: poinSolution,
        //Hub_vendor__c: hubVendor,
        AccountName: accountName,
        Type_of_Products_Services_Provided__c: this.options.map((item) => Object.assign({}, item)),
        isInsertable: false
      };
      this.displayVendorName.push({ name: carrierName, Id: carrierId });
      this.validateCheck(checked, carrierId);
      this.disableAddProducts = this.isObjectEmpty(this.selectedCarrierObj);
    }
    else {
      delete this.selectedCarrierObj[carrierId];
      let vendorIndex = this.displayVendorName.findIndex((item) => item.id === carrierId);
      this.displayVendorName.splice(vendorIndex, 1);
      this.validateCheck(checked, carrierId);
      this.disableAddProducts = this.isObjectEmpty(this.selectedCarrierObj);
    }
  }

  validateCheck(checkBoxValue, vendorId) {
    if (checkBoxValue === true) {
      this.initialVendorData.forEach((item) => {
        if (item.Id === vendorId) {
          item.isChecked = true;
        }
      });
    }
    else {
      this.initialVendorData.forEach((item) => {
        if (item.Id === vendorId) {
          item.isChecked = false;
        }
      });
    }
  }

  removeVendorName(event) {
    let VendorId = event.target.dataset.id;
    let vendorIndex = this.displayVendorName.findIndex((item) => item.Id === VendorId);
    this.displayVendorName.splice(vendorIndex, 1);
    this.initialVendorData.forEach((item) => {
      if (item.Id === VendorId) {
        item.isChecked = false;
      }
    });
    delete this.selectedCarrierObj[VendorId];
  }

  createSelectedObjToArray(carrierObj) {
    if (!carrierObj) {
      this.selectedCarrierArr = [];
    }
    else {
      Object.values(carrierObj).forEach((item) => {
        this.selectedCarrierArr.push({
          Name: item.name,
          Id: item.Id,
          //Point_Solution__c: item.Point_Solution__c,
          //Hub_vendor__c: item.Hub_vendor__c,
          AccountName: item.AccountName,
          Type_of_Products_Services_Provided__c: item.Type_of_Products_Services_Provided__c,
          isInsertable: item.isInsertable
        });
      });
    }
    this.verifyProductArr();
    console.log('this.selectedCarrierArr ', JSON.stringify(this.selectedCarrierArr));
  }

  handleTypeOfProd(event) {
    console.log('Add Vendor Detail = ', JSON.stringify(event.detail));
    let index = this.selectedCarrierArr.findIndex(((item) => item.Id === event.detail.record.Id));
    let record = this.selectedCarrierArr[index];
    let selectedValues = event.detail.value.map((picklistValue) => picklistValue.otherProductRecord);
    record.isInsertable = selectedValues.length > 0 ? true : false;
    if (record.hasOwnProperty('Type_of_Products_Services_Provided__c') && record.Type_of_Products_Services_Provided__c.length > 0) {
      record.Type_of_Products_Services_Provided__c.forEach((item) => {
        if (item.selected) delete item.selected;
        if (selectedValues.length > 0 && selectedValues.includes(item.value)) {
          item.selected = 'true';
        }
      });
      console.log('Add Vendor Detail record = ', JSON.stringify(record));
    }
  }

  handleVendorInsert(event) {
    let dataToInsert = this.prepareDataForInsert(this.selectedCarrierArr);
    if (!this.cancelInsert) {
      this.isLoading = true;
      const afterSave = new CustomEvent('modalsave', { detail: { competitorRecs: dataToInsert, isAddVendor: false, isLoading: true } });
      this.dispatchEvent(afterSave);
      this.isLoading = false;
    }
    else {
      const event = new ShowToastEvent({
        title: 'Error',
        variant: 'error',
        message:
          'Please Select "Type of Other Products or Services Provided" For All Competitors',
      });
      this.dispatchEvent(event);
      this.cancelInsert = false;
    }
  }

  prepareDataForInsert(data) {
    console.log('dataToApex = ', JSON.stringify(data));
    let dataToApex = [];
    data.forEach((item) => {
      if (item.isInsertable == false) {
        this.cancelInsert = true;
        return
      }
      if (Array.isArray(item.Type_of_Products_Services_Provided__c) && item.Type_of_Products_Services_Provided__c.length > 0) {
        item.Type_of_Products_Services_Provided__c.forEach((product) => {
          console.log('item ', JSON.stringify(item));
          if (product.hasOwnProperty('selected') && product.selected == 'true') {
            dataToApex.push({
              'CompetitorAccount__c': item.Id,
              'Type_of_Products_Services_Provided__c': product.value,
              'Account__c': this.accId,
              // 'Hub_vendor__c': item.Hub_vendor__c,
              // 'Point_Solution__c': item.Point_Solution__c,
              //'Name': item.AccountName + ' - ' + product.value,
              'Name': item.AccountName,
              'CompetitorAccount__r': {
                'Name': item.AccountName,
                'Id': item.Id
              }
            });
          }
        });
      }
    });
    console.log('dataToApex = ', JSON.stringify(dataToApex));
    return dataToApex;
  }

  handleSearchInput(event) {
    this.searchInput = '';
    let searchButton = this.template.querySelector('.search-button');
    let clearButton = this.template.querySelector('.clear-button');
    this.searchInput = event.target.value;
    if (!this.searchInput.length) {
      if (searchButton) {
        searchButton.disabled = true;
        clearButton.disabled = true;
        this.isSearchResult = false;
        this.getRecordsForPage(this.currentPage);
      }
    }
    else {
      searchButton.disabled = false;
      clearButton.disabled = false;
    }
  }

  handleClear(event) {
    let searchBar = this.template.querySelector('.search-input');
    let searchButton = this.template.querySelector('.search-button');
    let clearButton = this.template.querySelector('.clear-button');
    searchBar.value = '';
    this.isSearchResult = false;
    this.searchInput = '';
    searchButton.disabled = true;
    clearButton.disabled = true;
    this.getRecordsForPage(this.currentPage);
  }

  handleSearch(event) {
    this.isSearchResult = true;
    this.getRecordsForPage(this.currentPage);
  }

  handleEnterKeyPress(event) {
    if (event.key === 'Enter') {
      this.isSearchResult = true;
      this.getRecordsForPage(this.currentPage);
    }
  }

  handleEmail(event) {
    this.isSendEmail = true;
  }

  handleEmailInput(event) {
    this.emailDataObj[event.target.name] = event.target.value;
    if (Array.isArray(this.emailDataObj.prodTypesOffered) && this.emailDataObj.prodTypesOffered.length > 0) {
      let products = '';
      this.emailDataObj.prodTypesOffered.forEach((item) => {
        if (!products) {
          products += item;
        }
        else {
          products += ';' + item;
        }
      });
      this.emailDataObj.prodTypesOffered = products;
    }
  }

  handleEmailSend(event) {
    this.sendEmail(this.emailDataObj, this.accId);
    this.emailDataObj = {};
  }

  handleEmailCancel(event) {
    this.isSendEmail = false;
  }

  sendEmail(data, accountId) {
    this.isLoading = true;
    this.isSendEmail = false;
    sendMailCompetitor(
      {
        companyName: this.emailDataObj.companyName,
        webAddress: this.emailDataObj.webAddress,
        prodTypesOffered: this.emailDataObj.prodTypesOffered,
        address: this.emailDataObj.address,
        additionalComments: this.emailDataObj.additionalComments,
        compRowId: this.accId
      })
      .then((results) => {
        this.isLoading = false;
        const event = new ShowToastEvent({
          title: 'Email Sent',
          variant: 'success',
          message:
            'Success',
        });
        this.dispatchEvent(event);
      })
      .catch((error) => {
        const event = new ShowToastEvent({
          title: 'Error',
          variant: 'error',
          message:
            'Email not sent. Please contact admin',
        });
        this.dispatchEvent(event);
        this.isLoading = false;
        console.log('Error = ',error);
      })
  }

  handleCompetitorData(event) {
    this.selectedCarrierObj = event.detail.selectedCarrierObjChild;
    this.displayVendorNameParent = [this.displayVendorNameParent, ...event.detail.displayVendorName];
  }

  handleChildDropdown(event) {
    console.log('Add Vendor Detail = ', JSON.stringify(event.detail));
  }

}