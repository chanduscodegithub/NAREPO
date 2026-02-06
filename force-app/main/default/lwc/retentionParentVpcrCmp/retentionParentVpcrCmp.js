/* eslint-disable vars-on-top */
/* eslint-disable no-alert */
/* eslint-disable no-console */

import { LightningElement, wire, track, api } from 'lwc';
import fetchPicklist from '@salesforce/apex/RetentionStatusController.fetchPicklist';
import ICM_VPCR_Retention_CurrentCompanyHeader from '@salesforce/label/c.ICM_VPCR_Retention_CurrentCompanyHeader';
import ICM_VPCR_Retention_PreviousCompanyHeader from '@salesforce/label/c.ICM_VPCR_Retention_PreviousCompanyHeader';
import GetAllRenewalDataforVPCR from '@salesforce/apex/RetentionStatusController.GetAllRenewalDataforVPCR';
import getTemplateInXML from '@salesforce/apex/RetentionStatusController.getTemplateInXML';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ICM_VPCR_RVP_Renewal_Instruction_Text from '@salesforce/label/c.ICM_VPCR_RVP_Renewal_Instruction_Text';
import Go from '@salesforce/label/c.Go';
import Clear from '@salesforce/label/c.Clear';
import Print from '@salesforce/label/c.Print';

import ICM_VPCR_Renewal_Section_Header from '@salesforce/label/c.ICM_VPCR_Renewal_Section_Header';
import ICM_VPCR_ProactiveRenewal_Section_Header from '@salesforce/label/c.ICM_VPCR_ProactiveRenewal_Section_Header';
import ICM_VPCR_Renewal_Report_Title from '@salesforce/label/c.ICM_VPCR_Renewal_Report_Title';
export default class RetentionParentVpcrCmp extends LightningElement {
    @track RenewalStatusData;
    @track error;
    @track regionPicklist;
    @track scePicklist = [];
    @track companyNamePicklist = [];
    @track currentCompanyData;
    @track previousCompanyData;
    @track salesCycle = '';
    @track sortByColumnName = '';
    @track sortByOrder = '';
    @track retentionDataList;
    @track retentionWrapperList = [];
    @track data = [];
    @track isretentionDataCurrentCompanyListEmpty = false;
    @track isretentionDataPreviousCompanyListEmpty = false;
    @track sortByCompanyNameAsc = true;
    @track sortByProductFamilyAsc = false;
    @track sortByProductNameAsc = false;
    @track sortByCurrentSCEAsc = false;
    @track sortByCompanyNameAsc1 = true;
    @track sortByProductFamilyAsc1 = false;
    @track sortByProductNameAsc1 = false;
    @track sortByCurrentSCEAsc1 = false;
    @track reportTitle;
    @track salesCycleLabelName;
    @track currentCompanyHeader;
    @track PreviousCompanyHeader;
    @track sortSectionName = '';
    @track currentVPCRList = new Array();
    @track previousVPCRList = new Array();
    @track cssDisplay = '';
    @track filtersce = null;
    @track filterCompanyName = null;
    @track filterDate = null;
    @track isOnloadCalling = false;
    @track disablePrintButton;
    @track disableGoAndClearAction;
    @track IntructionalHeader;
    @track go;
    @track clear;
    @track printLabel;
    //-----added for proactive renewal change - start----
    activeSections = ['A', 'B', 'C', 'D'];
    activeSections1 = ['A', 'B'];
    @api isloggedinuservpcr;
    sectionHeader1 = '';
    sectionHeader2 = '';
    isSort = false;
    currentlyManagingPrctvRnwlList = [];
    previouslyManagedPrctvRnwlList = [];
    isSalesCyclePicklistChange = false;
    isFilterApply = false;
    isFilterClear = false;

    label = {
        ICM_VPCR_Renewal_Section_Header,
        ICM_VPCR_ProactiveRenewal_Section_Header,
        ICM_VPCR_Renewal_Report_Title

    };
    //-----added for proactive renewal change - end----

    connectedCallback() {
        this.isOnloadCalling = true;
        // this.getUniqueData();
        this.getRetentionData();

    }

    renderedCallback() {
        if (!this.isloggedinuservpcr) {
            if (this.template.querySelector(".section-header-style-rvp-renewal") === null || this.hasRendered === true)
                return;
            this.hasRendered = true;
            let style = document.createElement("style");
            style.innerText = `    
                 .section-header-rvp-renewal .slds-accordion__summary-heading{
                     background-color: hsla(219, 49%, 67%, 0.79);
                     padding: 4px 10px;
                     border-radius: 3px;
                     font-weight: 600;
                     font-size: 15px;
                 }    
             `;
            this.template.querySelector(".section-header-style-rvp-renewal").appendChild(style);
        } else if (this.isloggedinuservpcr) {
            if (this.template.querySelector('.section-header-style-vpcr-renewal') === null || this.hasRendered === true) return;
            this.hasRendered = true;
            let style = document.createElement('style');
            style.innerText = `     
        .section-sub-header-vpcr-renewal .slds-accordion__summary-heading{
            background-color: rgba(210, 223, 247, 0.7) !important;          
            font-size: 14px !important;           
        }
        .section-sub-header-vpcr-renewal .slds-accordion__summary{
            margin-bottom: .5rem;
        }        
        .section-sub-header-vpcr-renewal .slds-accordion__section{
            padding-bottom:0px;
        }
        .section-header-vpcr-renewal .slds-accordion__summary-heading{
            background-color: hsla(219, 49%, 67%, 0.79);
            padding: 4px 10px;
            border-radius: 3px;
            font-weight: 600; 
            font-size: 15px;           
        }  
        .slds-accordion__list-item {
            border-top: none;
        }   
    `;
            this.template.querySelector('.section-header-style-vpcr-renewal').appendChild(style);
        }

    }

    getRetentionData() {
        this.cssDisplay = '';
        this.currentCompanyHeader = ICM_VPCR_Retention_CurrentCompanyHeader;
        this.PreviousCompanyHeader = ICM_VPCR_Retention_PreviousCompanyHeader;
        this.IntructionalHeader = ICM_VPCR_RVP_Renewal_Instruction_Text;
        this.go = Go;
        this.clear = Clear;
        this.printLabel = Print;
        //-----code added for proactive renewal change - start----
        console.log('isloggedinuservpcr==>' + this.isloggedinuservpcr);
        if (this.isloggedinuservpcr) {

            this.sectionHeader1 = ICM_VPCR_Renewal_Section_Header;
            this.sectionHeader2 = ICM_VPCR_ProactiveRenewal_Section_Header;
        } else {
            this.sectionHeader1 = ICM_VPCR_Retention_CurrentCompanyHeader;
            this.sectionHeader2 = ICM_VPCR_Retention_PreviousCompanyHeader;
        }
        this.isSort = false;
        //-----code added for proactive renewal change - end----
        GetAllRenewalDataforVPCR({ SalesCycle: this.salesCycle, sortByColumnName: this.sortByColumnName, sortByOrder: this.sortByOrder, sortSectionName: this.sortSectionName, filtersce: this.filtersce, Companyname: this.filterCompanyName, filtereffectiveDate: this.filterDate })
            .then(result => {
                let retentionData = result;
                console.log('result from getRD');
                console.log(result);
                if (retentionData !== null && retentionData !== undefined && retentionData[0].hasOwnProperty("CompanyName")) {
                    this.retentionDataList = retentionData;
                    this.salesCycle = this.retentionDataList[0].salesCycle;
                    this.disablePrintButton = false;
                    if (this.sortSectionName === '') {
                        this.splitData(this.retentionDataList);
                    }
                    else if (this.sortSectionName === 'Current') {
                        console.log('in current');
                        this.isretentionDataCurrentCompanyListEmpty = false;
                        this.currentVPCRList = this.retentionDataList;
                        console.log(this.currentVPCRList);

                    } else if (this.sortSectionName === 'Previous') {
                        this.isretentionDataPreviousCompanyListEmpty = false;
                        this.previousVPCRList = this.retentionDataList;

                    }
                    this.salesCycleLabelName = this.retentionDataList[0].ICMCycleLabel;
                    this.reportTitle = this.retentionDataList[0].ICMHeaderLabel;
                    // alert('Inside iffff');
                } else if (retentionData !== null && retentionData !== undefined) {
                    this.retentionDataList = retentionData;
                    this.salesCycle = this.retentionDataList[0].salesCycle;
                    this.salesCycleLabelName = this.retentionDataList[0].ICMCycleLabel;
                    this.reportTitle = this.retentionDataList[0].ICMHeaderLabel;
                    this.isretentionDataPreviousCompanyListEmpty = true;
                    this.isretentionDataCurrentCompanyListEmpty = true;
                    this.disablePrintButton = true;
                    //this.scePicklist=new Array();
                    //this.companyNamePicklist=new Array();

                    //alert('inside else'+JSON.stringify(this.scePicklist));
                }
                else {
                    this.isretentionDataPreviousCompanyListEmpty = true;
                    this.isretentionDataCurrentCompanyListEmpty = true;
                    this.disablePrintButton = true;
                    //this.scePicklist=new Array();
                    //this.companyNamePicklist=new Array();
                }
                //alert(this.filterCompanyName);
                //alert(this.filterCompanyName===null);
                if (this.filterCompanyName === null && this.filtersce === null) {
                    //alert('Inside if');
                    this.disableGoAndClearAction = true;
                } else {
                    this.disableGoAndClearAction = false;
                }
                //-----condition added for proactive renewal change - start----
                if (!this.isloggedinuservpcr || (this.isSort && this.isloggedinuservpcr)) {
                    this.cssDisplay = 'hidemodel';
                }

                //-----condition added for proactive renewal change - end----
                if (this.isloggedinuservpcr) {

                    this.reportTitle = ICM_VPCR_Renewal_Report_Title;

                }
                if (!this.isSort && this.isloggedinuservpcr) {
                    if (this.isSalesCyclePicklistChange) {
                        this.isSalesCyclePicklistChange = false;
                        this.isFilterApply = false;
                        let proactiveRenewalCmp = this.template.querySelector('c-vpcr-proactive-renewal-cmp');
                        proactiveRenewalCmp.salesCycleChangeHandler(this.salesCycle, this.filterCompanyName, this.filtersce);

                    } else if (this.isFilterApply) {
                        this.isSalesCyclePicklistChange = false;
                        this.isFilterApply = false;
                        let proactiveRenewalCmp = this.template.querySelector('c-vpcr-proactive-renewal-cmp');
                        proactiveRenewalCmp.fetchFilteredProactiveRenewalData(this.salesCycle, this.filterCompanyName, this.filtersce);

                    } else {
                        let proactiveRenewalCmp = this.template.querySelector('c-vpcr-proactive-renewal-cmp');
                        proactiveRenewalCmp.getProactiveRenewalData(this.salesCycle, this.filterCompanyName, this.filtersce);
                    }

                }




            })
            .catch(error => {

                console.log('Error in retention Cmp ==>' + JSON.stringify(error));
                //------condition added for proactive renewal change - start----
                if (!this.isloggedinuservpcr || (this.isSort && this.isloggedinuservpcr)) {
                    this.cssDisplay = 'hidemodel';
                }
                if (!this.isSort && this.isloggedinuservpcr) {
                    if (this.isSalesCyclePicklistChange) {
                        this.isSalesCyclePicklistChange = false;
                        this.isFilterApply = false;
                        let proactiveRenewalCmp = this.template.querySelector('c-vpcr-proactive-renewal-cmp');
                        proactiveRenewalCmp.salesCycleChangeHandler(this.salesCycle, this.filterCompanyName, this.filtersce);

                    } else if (this.isFilterApply) {
                        this.isSalesCyclePicklistChange = false;
                        this.isFilterApply = false;
                        let proactiveRenewalCmp = this.template.querySelector('c-vpcr-proactive-renewal-cmp');
                        proactiveRenewalCmp.fetchFilteredProactiveRenewalData(this.salesCycle, this.filterCompanyName, this.filtersce);

                    } else {
                        let proactiveRenewalCmp = this.template.querySelector('c-vpcr-proactive-renewal-cmp');
                        proactiveRenewalCmp.getProactiveRenewalData(this.salesCycle, this.filterCompanyName, this.filtersce);
                    }

                }
                //------condition added for proactive renewal change - end----
            });


    }

    @wire(fetchPicklist, { objectPassed: 'Renewal_Status__c', fieldPassed: 'Sales_Cycle__c' })
    regionPicklistValues(result) {
        if (result.data) {
            this.regionPicklist = [];
            if (result.data !== undefined) {

                result.data.forEach(opt => {
                    this.regionPicklist.push(opt);

                });
            }
        } else if (result.error) {
            this.error = result.error;
        }
    }



    splitData(dataList) {
        console.log('in split data');
        console.log(dataList);
        // alert('Inside Split');
        let currentVPCRList = [];
        let previousVPCRList = [];
        let sceUniquevalues = [];
        let companynamevalue = [];
        let sceUniquevalueslocal = [];
        let companynamevaluelocal = [];
        for (let i in dataList) {
            if (i !== undefined) {
                /*if(dataList[i].renewalVpcrId===dataList[i].accountVpcrId && dataList[i].renewalVpcrId!==undefined && dataList[i].accountVpcrId!==undefined){
                  //alert('Inside if');
                  currentVPCRList.push(dataList[i]);
                }
                else if(dataList[i].SubmitForSalesIncentive===false && dataList[i].Eligibleforsales==='Yes'){
                  currentVPCRList.push(dataList[i]);
                }
                else {
                 // alert('Inside else');
                  previousVPCRList.push(dataList[i]);
                }*/
                /*----------------------------------------SAMARTH----------------------------------------*/
                if (dataList[i].renewalVpcrId === dataList[i].accountVpcrId && dataList[i].renewalVpcrId !== undefined && dataList[i].accountVpcrId !== undefined) {
                    currentVPCRList.push(dataList[i]);
                }
                else {
                    previousVPCRList.push(dataList[i]);
                }
                /*----------------------------------------SAMARTH----------------------------------------*/
                if (dataList[i].currentSCE !== null && sceUniquevalues.indexOf(dataList[i].currentSCE) === -1) {
                    sceUniquevalues.push(dataList[i].currentSCE);
                    //sceUniquevalues.push({ label: dataList[i].currentSCE, value: dataList[i].currentSCE });
                }
                if (dataList[i].CompanyName !== null && companynamevalue.indexOf(dataList[i].CompanyName) === -1) {
                    companynamevalue.push(dataList[i].CompanyName);
                    // companynamevalue.push({ label: dataList[i].CompanyName, value: dataList[i].CompanyName });
                }

            }

        }

        // alert(JSON.stringify(currentVPCRList));
        // alert(JSON.stringify(previousVPCRList));
        // alert('sceeeee'+this.scePicklist);
        if (currentVPCRList.length > 0) {
            this.currentVPCRList = currentVPCRList;
            this.isretentionDataCurrentCompanyListEmpty = false;
            //this.disablePrintButton=false;
            console.log('list of Current data' + JSON.stringify(this.currentVPCRList));
            // alert('list of Current data'+JSON.stringify(this.currentVPCRList));
        }
        else {
            // this.disablePrintButton=true;
            let currentVPCRLocalList = [];
            this.currentVPCRList = currentVPCRLocalList
            this.isretentionDataCurrentCompanyListEmpty = true;
        }
        if (previousVPCRList.length > 0 && previousVPCRList[0].hasOwnProperty("CompanyName")) {
            // this.disablePrintButton=false;
            this.previousVPCRList = previousVPCRList;
            this.isretentionDataPreviousCompanyListEmpty = false;
            console.log('list of previous data' + JSON.stringify(this.previousVPCRList));
            //alert('list of previous data'+JSON.stringify(this.previousVPCRList));
            // alert('previous data exist');
        }
        else {
            // this.disablePrintButton=true;
            let previousVPCRLocalList = [];
            this.previousVPCRList = previousVPCRLocalList;
            //alert('previous data does not exist');
            this.isretentionDataPreviousCompanyListEmpty = true;
        }
        if (this.isOnloadCalling === true) {
            //alert(this.scePicklist);
            //if(!this.isEmpty(this.sceUniquevalues)){
            sceUniquevalueslocal.push({ label: '', value: '' });
            companynamevaluelocal.push({ label: '', value: '' });
            sceUniquevalues.forEach(function (element) {

                sceUniquevalueslocal.push({ label: element, value: element });
            });
            companynamevalue.forEach(function (element) {

                companynamevaluelocal.push({ label: element, value: element });
            });
            this.scePicklist = sceUniquevalueslocal;
            this.companyNamePicklist = companynamevaluelocal;
            this.isOnloadCalling = false;
            //alert(this.scePicklist);
            // }
            /*else{
                this.scePicklist=new Array();
                this.companyNamePicklist=[];
            }*/
        }

    }
    filterBasedOnPicklistValue(event) {
        this.activeSections = ['A', 'B', 'C', 'D'];
        this.activeSections1 = ['A', 'B'];
        //-----code added for proactive renewal change - start----
        this.isSort = false;
        this.isSalesCyclePicklistChange = true;
        //-----code added for proactive renewal change - end----
        this.salesCycle = event.target.value;
        // this.isOnloadCalling=true;
        this.sortSectionName = '';
        this.sortByColumnName = '';
        this.sortByOrder = '';
        this.retentionDataList = [];
        this.currentVPCRList = [];
        this.previousVPCRList = [];
        console.log('bfr : ' + this.scePicklist);
        this.scePicklist = [];
        console.log('aftr : ' + this.scePicklist);
        this.companyNamePicklist = [];
        console.log('aftr : ' + this.companyNamePicklist);
        this.filtersce = null;
        this.filterCompanyName = null;
        this.isOnloadCalling = true;
        this.sortByCompanyNameAsc = true;
        this.sortByProductFamilyAsc = false;
        this.sortByProductNameAsc = false;
        this.sortByCurrentSCEAsc = false;
        this.sortByCompanyNameAsc1 = true;
        this.sortByProductFamilyAsc1 = false;
        this.sortByProductNameAsc1 = false;
        this.sortByCurrentSCEAsc1 = false;
        // alert(this.scePicklist);
        this.getRetentionData();
        // alert(JSON.stringify(this.scePicklist));
    }
    sortFields(event) {
        //-----code added for proactive renewal change - start----
        this.isSort = true;
        //-----code added for proactive renewal change - end----
        var selectedItem = event.currentTarget;
        var selectedItemToBeSorted = selectedItem.dataset.record;
        console.log('target => ');
        console.log(selectedItemToBeSorted);
        var fieldItagsWithPropMap = '{"Efective_Date__c":"sortByEffectiveDateAsc","Company__r.name":"sortByCompanyNameAsc","Product_Line__c":"sortByProductFamilyAsc","Company__r.Owner.name":"sortByCurrentSCEAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithPropMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];
        // alert('sortFieldCompName'+sortFieldCompName);
        this.sortSectionName = 'Current';
        if (sortFieldCompName === 'sortByEffectiveDateAsc') {
            if (this.sortByEffectiveDateAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc = false;
                this.getRetentionData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc = true;
                this.getRetentionData();

            }

        } else if (sortFieldCompName === 'sortByCompanyNameAsc') {
            if (this.sortByCompanyNameAsc === true) {

                console.log('Inside If company name asc');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc = false;
                this.getRetentionData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc = true;
                this.getRetentionData();

            }

        } else if (sortFieldCompName === 'sortByProductFamilyAsc') {
            if (this.sortByProductFamilyAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductFamilyAsc = false;
                this.getRetentionData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductFamilyAsc = true;
                this.getRetentionData();

            }

        } else if (sortFieldCompName === 'sortByCurrentSCEAsc') {
            if (this.sortByCurrentSCEAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc = false;
                this.getRetentionData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc = true;
                this.getRetentionData();

            }

        }

    }


    sortFields1(event) {
        //-----code added for proactive renewal change - start----
        this.isSort = true;
        //-----code added for proactive renewal change - end----

        var selectedItem = event.currentTarget;
        var selectedItemToBeSorted = selectedItem.dataset.record;

        var fieldItagsWithPropMap = '{"Efective_Date__c":"sortByEffectiveDateAsc1","Company__r.name":"sortByCompanyNameAsc1","Product_Line__c":"sortByProductFamilyAsc1","Company__r.Owner.name":"sortByCurrentSCEAsc1"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithPropMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];
        this.sortSectionName = 'Previous';
        if (sortFieldCompName === 'sortByEffectiveDateAsc1') {
            if (this.sortByEffectiveDateAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc1 = false;
                this.getRetentionData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc1 = true;
                this.getRetentionData();

            }

        } else if (sortFieldCompName === 'sortByCompanyNameAsc1') {
            if (this.sortByCompanyNameAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc1 = false;
                this.getRetentionData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc1 = true;
                this.getRetentionData();

            }

        } else if (sortFieldCompName === 'sortByProductFamilyAsc1') {
            if (this.sortByProductFamilyAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductFamilyAsc1 = false;
                this.getRetentionData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductFamilyAsc1 = true;
                this.getRetentionData();

            }

        } else if (sortFieldCompName === 'sortByCurrentSCEAsc1') {
            if (this.sortByCurrentSCEAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc1 = false;
                this.getRetentionData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc1 = true;
                this.getRetentionData();

            }

        }

    }
    filterscePicklistValue(event) {
        this.filtersce = event.target.value;
        if (this.filtersce) {
            //alert('inside if');
            this.disableGoAndClearAction = false;
        }
    }
    filtercompanyPicklistValue(event) {
        this.filterCompanyName = event.target.value;
        if (this.filterCompanyName) {
            this.disableGoAndClearAction = false;
        }
    }
    filterDatePicklistValue(event) {
        this.filterDate = event.target.value;
        //alert();
    }
    filterAllRetentionData() {
        //-----code added for proactive renewal change - start----
        this.isSort = false;
        this.isFilterApply = true;
        //-----code added for proactive renewal change - end----
        this.sortSectionName = '';
        this.sortByColumnName = '';
        this.sortByOrder = '';
        this.sortByEffectiveDateAsc = false;
        this.sortByCompanyNameAsc = true;
        this.sortByProductFamilyAsc = false;
        this.sortByEffectiveDateAsc1 = false;
        this.sortByCompanyNameAsc1 = true;
        this.sortByProductFamilyAsc1 = false;
        this.currentVPCRList = [];
        this.previousVPCRList = [];
        this.getRetentionData();
        // alert(JSON.stringify(this.currentVPCRList));
        // alert(JSON.stringify(this.previousVPCRList));
        /*let proactiveRenewalCmp = this.template.querySelector('c-vpcr-proactive-renewal-cmp');
        proactiveRenewalCmp.fetchFilteredProactiveRenewalData(this.filterCompanyName,this.filtersce);*/
    }
    clearAllfilterData() {
        this.filtersce = null;
        this.filterCompanyName = null;
        this.filterDate = null;
        this.filterAllRetentionData();
        /*let proactiveRenewalCmp = this.template.querySelector('c-vpcr-proactive-renewal-cmp');
        proactiveRenewalCmp.clearFilters(this.filterCompanyName,this.filtersce);*/
    }

    print1() {
        // alert(JSON.stringify(this.currentVPCRList));
        // alert(JSON.stringify(this.previousVPCRList));
        console.log('in print => ');
        console.log('JSON.stringify(this.previousVPCRList) : ' + JSON.stringify(this.previousVPCRList));
        console.log('JSON.stringify(this.currentVPCRList) : ' + JSON.stringify(this.currentVPCRList));
        this.cssDisplay = '';
        if (!this.isretentionDataCurrentCompanyListEmpty || !this.isretentionDataPreviousCompanyListEmpty) {
            /* const event = new ShowToastEvent({
                 title: '',
                 message: 'No records to print.',
             });
             this.dispatchEvent(event);
             this.cssDisplay = 'hidemodel';
         } else {*/
            getTemplateInXML({ loggedInUserRole: 'CM VPCR/RVP' })
                .then(result => {
                    let responseData = result;
                    let objectItagesMap = responseData.objectItags;
                    let xmlWsectTag = responseData.xmlString;
                    let xmlTempleteString = '';
                    let rowCount = 11;
                    let salesCycle = this.salesCycle;
                    let salesCycleSplitByCommaStr = salesCycle.split(',')[1].trim();
                    let salesCycleDateFormatted = this.formatDateWithHyphenSeparate(salesCycleSplitByCommaStr);
                    let salesCycleValue = salesCycle.split(',')[0] + ', ' + salesCycleDateFormatted;
                    console.log(result);

                    for (let objectName in objectItagesMap) {
                        if (objectItagesMap.hasOwnProperty(objectName)) {
                            if (objectName === 'Header') {
                                for (let k in objectItagesMap[objectName]) {

                                    if (k !== undefined) {
                                        let key = objectItagesMap[objectName][k];
                                        let replaceItagName = '%%' + objectName + '.' + key + '@@';
                                        let value = '';

                                        if (key === 'salesCycle') {
                                            value = salesCycle;
                                        } else if (key === 'currentDateTime') {


                                            value = this.formatDateTime('');

                                        }
                                        value = value != null ? value : '';
                                        value = value.toString();
                                        value = this.replaceXmlSpecialCharacters(value);



                                        xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);
                                    }
                                }


                            } else {
                                let itagSets = objectItagesMap[objectName];
                                let startItag = '';
                                let endItag = '';
                                let setCount = 0;
                                for (let itagStrIndex in itagSets) {
                                    if (itagStrIndex !== undefined) {
                                        setCount = setCount + 1;
                                        if (setCount === 1) {
                                            startItag = itagSets[itagStrIndex];
                                        }
                                        if (setCount === itagSets.length) {
                                            endItag = itagSets[itagStrIndex];
                                        }
                                    }

                                }
                                startItag = '%%' + objectName + '.' + startItag + '@@';
                                endItag = '%%' + objectName + '.' + endItag + '@@';
                                console.log('startItag' + startItag + ' : endItag : ' + endItag);

                                let startIndex = xmlWsectTag.lastIndexOf(startItag);
                                let endIndex = xmlWsectTag.indexOf(endItag);

                                let stHeaderIdx;
                                let retentionRecList = [];
                                if (objectName === 'CurrentlyManagingRetentionRec') {

                                    stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="29.25">');
                                    if (!this.isCurrentlyManagingGrowthDataListEmpty) {
                                        retentionRecList = [...this.currentVPCRList];

                                    }/* else{
                                        let retentionRecLocalList = [];
                                        retentionRecList=retentionRecLocalList;
                                    } */
                                    rowCount = rowCount + retentionRecList.length;

                                }
                                if (objectName === 'PreviouslyManagedRetentionRec') {
                                    stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="29.25">', startIndex);
                                    if (!this.isPreviouslyManagedGrowthDataListEmpty) {
                                        retentionRecList = [...this.previousVPCRList];
                                    }
                                    /* else{
                                         let retentionRecLocalList = [];
                                         retentionRecList=retentionRecLocalList;
                                     } */
                                    rowCount = rowCount + retentionRecList.length;
                                }

                                let endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                                endHeaderIdx += '</Row>'.length;
                                let rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);



                                xmlTempleteString = this.returnChildRows(rowToReccurse, xmlWsectTag, retentionRecList, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx);
                                xmlWsectTag = xmlTempleteString;
                            }

                        }
                    }


                    xmlTempleteString = xmlTempleteString.split('##RowVal@@').join(rowCount);
                    let today = this.formatDate('');
                    // alert(today);
                    let hiddenElement = document.createElement('a');
                    hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                    //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
                    hiddenElement.target = '_self'; // 
                    hiddenElement.download = 'Renewal Data Sheet ' + salesCycleValue + ' ' + today + '.xls';
                    document.body.appendChild(hiddenElement); // Required for FireFox browser



                    hiddenElement.click();
                    const event = new ShowToastEvent({
                        title: '',
                        message: 'Renewal Data Sheet Exported Successfully',
                    });
                    this.dispatchEvent(event);

                    this.cssDisplay = 'hidemodel';
                })
                .catch(error => {
                    console.log('Error ==>' + JSON.stringify(error));
                    this.cssDisplay = 'hidemodel';
                });
        }

    }

    returnChildRows(rowToReccurse, xmlWsectTag, RetentionData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx) {

        let totalRows = '';
        let count = 0;
        let salesPersonHighlightStyleId = "s106";
        let salesPersonNonHighlightStyleId = "s75";
        let notSentHighlight = "s77";

        for (let i in RetentionData) {

            let eachRow = rowToReccurse;
            count = count + 1;

            for (let k in objectItagesMap[objectName]) {

                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                let value = RetentionData[i][key];


                if (key === 'Salespersons') {
                    if (RetentionData[i].SalesSplitExist === 'Yes') {
                        value = RetentionData[i].Salesperson1 + ' ' + RetentionData[i].Salesperson1Percent + '%, ' + RetentionData[i].Salesperson2 + ' ' + RetentionData[i].Salesperson2Percent + '%';
                    } else {
                        //if (RetentionData[i].SalesSplitExist==='No'  
                        //&& RetentionData[i].currentSCEId!==RetentionData[i].salesUserId1 && RetentionData[i].currentSCEId!==null && RetentionData[i].salesUserId1!==null
                        //) {
                        if (!this.isBlank(RetentionData[i].Salesperson1) && !this.isBlank(RetentionData[i].Salesperson1Percent)) {
                            value = RetentionData[i].Salesperson1 + ' ' + RetentionData[i].Salesperson1Percent + '%';
                        } else {
                            value = 'Not Yet Sent to Incentive Comp Team';
                            eachRow = eachRow.split('##salesPersonsStyleId@@').join(notSentHighlight);
                        }
                        //}

                    }
                }

                if (objectName === 'CurrentlyManagingProactiveRnwlRec' || objectName === 'PreviouslyManagedProactiveRnwlRec') {
                    if (key === 'effectiveDate') {
                        if (RetentionData[i].hasOwnProperty(key) &&
                            !this.isBlank(RetentionData[i][key])) {
                            value = this.convertDateFormat(RetentionData[i][key]);
                        }
                    } else if ((key === 'soldRetainedMembers' || key === 'glMembershipAsOfEffctvDate' || key === 'glMembershipOneYearPrior')
                        && !this.isBlank(RetentionData[i][key]) && RetentionData[i][key].toString().length > 3) {
                        value = parseFloat(RetentionData[i][key]).toLocaleString('en');

                    } else if (key === 'retentionPercentage') {
                        if (!this.isBlank(value)) {
                            value = value + '%';
                        }
                    }
                    if (key === 'opportunityOwnerName') {
                        if (RetentionData[i].hasOwnProperty('proactiveRenewalStatus')
                            && !this.isBlank(RetentionData[i].proactiveRenewalStatus)) {

                            if (RetentionData[i].proactiveRenewalStatus.indexOf('Pending Qualification') !== -1) {
                                eachRow = eachRow.split('##sceRcvngCmpnstnStatusStyleId@@').join('s105');
                                value = 'Pending Qualification';
                            } else if (RetentionData[i].proactiveRenewalStatus.indexOf('Fully Validated') !== -1) {
                                if (RetentionData[i].hasOwnProperty('opportunityOwnerId') && !this.isBlank(RetentionData[i].opportunityOwnerId)
                                    && RetentionData[i].hasOwnProperty('accountOwnerId') && !this.isBlank(RetentionData[i].accountOwnerId)
                                    && RetentionData[i].opportunityOwnerId !== RetentionData[i].accountOwnerId) {
                                    eachRow = eachRow.split('##sceRcvngCmpnstnStatusStyleId@@').join(salesPersonHighlightStyleId);
                                } else {
                                    eachRow = eachRow.split('##sceRcvngCmpnstnStatusStyleId@@').join(salesPersonNonHighlightStyleId);
                                }

                            }
                        }
                        else {

                            eachRow = eachRow.split('##sceRcvngCmpnstnStatusStyleId@@').join(salesPersonNonHighlightStyleId);

                        }
                    }
                }


                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);


                // eslint-disable-next-line dot-notation
                if (key === 'Salespersons') {
                    if (RetentionData[i]['SalesSplitExist'] === 'Yes') {
                        eachRow = eachRow.split('##salesPersonsStyleId@@').join(salesPersonHighlightStyleId);
                    } else if (RetentionData[i].currentSCEId !== RetentionData[i].salesUserId1) {
                        eachRow = eachRow.split('##salesPersonsStyleId@@').join(salesPersonHighlightStyleId);
                    } else {
                        eachRow = eachRow.split('##salesPersonsStyleId@@').join(salesPersonNonHighlightStyleId);
                    }
                }

                eachRow = eachRow.split(replaceItagName).join(value);

            }
            totalRows += eachRow;

        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + totalRows + xmlWsectTag.substring(endHeaderIdx);

        return xmlWsectTag;
    }
    replaceXmlSpecialCharacters(value) {
        let returnValue;
        if (value !== null && value !== undefined && value.length > 0) {
            value = value.replace(/&/g, '&amp;');
            value = value.replace(/>/g, '&gt;');
            value = value.replace(/</g, '&lt;');
            returnValue = value;
        } else {
            returnValue = '';
        }
        return returnValue;
    }
    formatDateWithHyphenSeparate(inputDate) {
        let dateToFormat;
        if (inputDate === '' || inputDate === undefined) {
            dateToFormat = new Date();
        }
        else {
            dateToFormat = new Date(inputDate);
        }
        let dd = dateToFormat.getDate();
        let mm = dateToFormat.getMonth() + 1; //January is 0!
        let yyyy = dateToFormat.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        //dateToFormat = mm + '/' + dd + '/' + yyyy;
        dateToFormat = mm + '-' + dd + '-' + yyyy;
        return dateToFormat;
    }
    formatDateTime(inputDateTime) {
        let returnFormattedDateTime = inputDateTime;
        let dateTime;
        if (inputDateTime === '' || inputDateTime === undefined) {
            dateTime = new Date().toLocaleString("en-US");
            dateTime = new Date(dateTime);
            dateTime = dateTime.toLocaleString();

        }
        if (dateTime !== undefined && dateTime != null && dateTime !== '') {
            let dateTimeValueFormatted;
            let dateTimeSeparatedArray;
            let timeSeparatedArray;
            if (dateTime.indexOf(',') !== -1) {
                dateTimeSeparatedArray = dateTime.split(',');
                //dateTimeValueFormatted=dateTimeSeparatedArray[0]+' '+dateTimeSeparatedArray[1];
                //returnFormattedDateTime=dateTimeValueFormatted;
                dateTimeValueFormatted = dateTimeSeparatedArray[0] + ' ';
                if (dateTimeSeparatedArray[1].indexOf(':') !== -1) {
                    timeSeparatedArray = dateTimeSeparatedArray[1].split(':');

                    let hr = timeSeparatedArray[0];
                    let mnt = timeSeparatedArray[1];
                    let period = timeSeparatedArray[2].split(' ')[1];

                    dateTimeValueFormatted = dateTimeValueFormatted +
                        hr + ':' + mnt + ' ' + period;

                    returnFormattedDateTime = dateTimeValueFormatted;
                }
            }
        }
        return returnFormattedDateTime;
    }
    formatDate(inputDate) {
        let dateToFormat;
        if (inputDate === '' || inputDate === undefined) {
            dateToFormat = new Date();
            //alert('today'+dateToFormat);
        }

        let dd = dateToFormat.getDate();
        let mm = dateToFormat.getMonth() + 1; //January is 0!
        let yyyy = dateToFormat.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        //dateToFormat = mm + '/' + dd + '/' + yyyy;
        dateToFormat = yyyy + '' + mm + '' + dd;
        return dateToFormat;
    }
    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }

    prctvRnwlDataloadHandler(event) {
        let evntData = event.detail;

        if (evntData.isSort === true) {
            this.cssDisplay = '';
        } else if (evntData.isDataLoad === true) {
            console.log('scePicklist' + evntData.scePicklist);
            console.log('companyNamePicklist' + evntData.companyNamePicklist);
            let scePicklist = [...this.scePicklist];
            let companyNamePicklist = [...this.companyNamePicklist];
            let scePicklistValue = [];
            let companyNamePicklistValue = [];
            let scePicklistValueOfBothTheSctn = [];
            let companyPicklistValueOfBothTheSctn = [];
            let finalSCEPicklistValue = [];
            let finalCompanyNamePicklistValue = [];



            let prctvRnwlSCEPicklist = [...evntData.scePicklist];
            let prctvRnwlCompanyNamePicklist = [...evntData.companyNamePicklist];

            let currentlyManagingPrctvRnwlList = [...evntData.currentlyManagingPrctvRnwlList];
            let previouslyManagedPrctvRnwlList = [...evntData.previouslyManagedPrctvRnwlList];



            scePicklistValue = this.getValueList(scePicklist);
            scePicklistValueOfBothTheSctn = [...scePicklistValue];

            companyNamePicklistValue = this.getValueList(companyNamePicklist);
            companyPicklistValueOfBothTheSctn = [...companyNamePicklistValue];

            for (let i in prctvRnwlSCEPicklist) {


                if (scePicklistValue.indexOf(prctvRnwlSCEPicklist[i]) === -1) {
                    //scePicklist.push({ label: prctvRnwlSCEPicklist[i], value: prctvRnwlSCEPicklist[i] });
                    scePicklistValueOfBothTheSctn.push(prctvRnwlSCEPicklist[i]);

                }

            }

            for (let i in prctvRnwlCompanyNamePicklist) {

                if (companyNamePicklistValue.indexOf(prctvRnwlCompanyNamePicklist[i]) === -1) {
                    //companyNamePicklist.push({ label: prctvRnwlCompanyNamePicklist[i], value: prctvRnwlCompanyNamePicklist[i] });
                    companyPicklistValueOfBothTheSctn.push(prctvRnwlCompanyNamePicklist[i]);

                }

            }

            if (!this.isListEmpty(scePicklistValueOfBothTheSctn)) {
                this.scePicklist = [];
                scePicklistValueOfBothTheSctn.sort();
                finalSCEPicklistValue.push({ label: '', value: '' });

                for (let j in scePicklistValueOfBothTheSctn) {
                    finalSCEPicklistValue.push({
                        label: scePicklistValueOfBothTheSctn[j],
                        value: scePicklistValueOfBothTheSctn[j]
                    });


                }

                this.scePicklist = finalSCEPicklistValue;
            }
            if (!this.isListEmpty(companyPicklistValueOfBothTheSctn)) {
                this.companyNamePicklist = [];
                companyPicklistValueOfBothTheSctn.sort();
                finalCompanyNamePicklistValue.push({ label: '', value: '' });

                for (let j in companyPicklistValueOfBothTheSctn) {

                    finalCompanyNamePicklistValue.push({
                        label: companyPicklistValueOfBothTheSctn[j],
                        value: companyPicklistValueOfBothTheSctn[j]
                    });



                }

                this.companyNamePicklist = finalCompanyNamePicklistValue;
            }
            if (this.disablePrintButton && (!this.isListEmpty(currentlyManagingPrctvRnwlList)
                || !this.isListEmpty(previouslyManagedPrctvRnwlList))) {
                this.disablePrintButton = false;
            }
            this.currentlyManagingPrctvRnwlList = [];
            this.previouslyManagedPrctvRnwlList = [];
            this.currentlyManagingPrctvRnwlList = currentlyManagingPrctvRnwlList;
            this.previouslyManagedPrctvRnwlList = previouslyManagedPrctvRnwlList;
            this.cssDisplay = 'hidemodel';

        } else if (evntData.isSortedDataLoaded === true) {
            let currentlyManagingPrctvRnwlList = [...evntData.currentlyManagingPrctvRnwlList];
            let previouslyManagedPrctvRnwlList = [...evntData.previouslyManagedPrctvRnwlList];
            this.currentlyManagingPrctvRnwlList = [];
            this.previouslyManagedPrctvRnwlList = [];
            this.currentlyManagingPrctvRnwlList = currentlyManagingPrctvRnwlList;
            this.previouslyManagedPrctvRnwlList = previouslyManagedPrctvRnwlList;
            this.cssDisplay = 'hidemodel';
        }


    }

    getValueList(lst) {
        let returnList = [];
        if (!this.isListEmpty(lst)) {
            lst.forEach(function (element) {
                if (element.hasOwnProperty('value') && element.value !== '') {
                    returnList.push(element.value);

                }

            });
        }

        return returnList;
    }
    isListEmpty(lst) {
        let isListEmpty = true;
        if (lst !== null && lst !== undefined && lst.length !== 0) {
            isListEmpty = false;
        }

        return isListEmpty;

    }

    print() {

        this.cssDisplay = '';
        console.log('currentlyManagingPrctvRnwlList==>' + JSON.stringify(this.currentlyManagingPrctvRnwlList));
        console.log('previouslyManagedPrctvRnwlList==>' + JSON.stringify(this.previouslyManagedPrctvRnwlList));
        getTemplateInXML({ loggedInUserRole: 'CM VPCR/RVP' })
            .then(result => {
                let responseData = result;
                let objectItagesMap = responseData.objectItags;
                let xmlWsectTag = responseData.xmlString;
                let xmlTempleteString = '';

                let salesCycle = this.salesCycle;
                let salesCycleSplitByCommaStr = salesCycle.split(',')[1].trim();
                let salesCycleDateFormatted = this.formatDateWithHyphenSeparate(salesCycleSplitByCommaStr);
                let salesCycleValue = salesCycle.split(',')[0] + ', ' + salesCycleDateFormatted;
                console.log(result);

                for (let objectName in objectItagesMap) {
                    if (objectItagesMap.hasOwnProperty(objectName)) {
                        if (objectName === 'Header') {
                            for (let k in objectItagesMap[objectName]) {

                                if (k !== undefined) {
                                    let key = objectItagesMap[objectName][k];
                                    let replaceItagName = '%%' + objectName + '.' + key + '@@';
                                    let value = '';

                                    if (key === 'salesCycle') {
                                        value = salesCycle;
                                    } else if (key === 'currentDateTime') {


                                        value = this.formatDateTime('');

                                    }
                                    value = value != null ? value : '';
                                    value = value.toString();
                                    value = this.replaceXmlSpecialCharacters(value);



                                    xmlWsectTag = xmlWsectTag.split(replaceItagName).join(value);
                                }
                            }


                        } else {
                            let itagSets = objectItagesMap[objectName];
                            let startItag = '';
                            let endItag = '';
                            let setCount = 0;
                            for (let itagStrIndex in itagSets) {
                                if (itagStrIndex !== undefined) {
                                    setCount = setCount + 1;
                                    if (setCount === 1) {
                                        startItag = itagSets[itagStrIndex];
                                    }
                                    if (setCount === itagSets.length) {
                                        endItag = itagSets[itagStrIndex];
                                    }
                                }

                            }
                            startItag = '%%' + objectName + '.' + startItag + '@@';
                            endItag = '%%' + objectName + '.' + endItag + '@@';
                            console.log('startItag' + startItag + ' : endItag : ' + endItag);

                            let startIndex = xmlWsectTag.lastIndexOf(startItag);
                            let endIndex = xmlWsectTag.indexOf(endItag);

                            let stHeaderIdx;
                            let retentionRecList = [];
                            if (objectName === 'CurrentlyManagingRetentionRec') {

                                stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="29.25">');
                                retentionRecList = [...this.currentVPCRList];

                            }
                            else if (objectName === 'PreviouslyManagedRetentionRec') {
                                stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="29.25">', startIndex);
                                retentionRecList = [...this.previousVPCRList];

                            } else if (objectName === 'CurrentlyManagingProactiveRnwlRec') {
                                stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="29.5">');
                                retentionRecList = [...this.currentlyManagingPrctvRnwlList];

                            } else if (objectName === 'PreviouslyManagedProactiveRnwlRec') {
                                stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="29.5">', startIndex);
                                retentionRecList = [...this.previouslyManagedPrctvRnwlList];

                            }

                            let endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                            endHeaderIdx += '</Row>'.length;
                            let rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);

                            if (this.isListEmpty(retentionRecList)) {
                                xmlWsectTag = xmlWsectTag.split(rowToReccurse).join('');
                            } else {
                                xmlWsectTag = this.returnChildRows(rowToReccurse, xmlWsectTag, retentionRecList, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx);
                            }



                        }

                    }
                }


                xmlTempleteString = xmlWsectTag;
                let today = this.formatDate('');
                // alert(today);
                let hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
                hiddenElement.target = '_self'; // 
                hiddenElement.download = 'Renewal Data Sheet ' + salesCycleValue + ' ' + today + '.xls';
                document.body.appendChild(hiddenElement); // Required for FireFox browser



                hiddenElement.click();
                const event = new ShowToastEvent({
                    title: '',
                    message: 'Renewal Data Sheet Exported Successfully',
                });
                this.dispatchEvent(event);

                this.cssDisplay = 'hidemodel';
            })
            .catch(error => {
                console.log('Error ==>' + JSON.stringify(error));
                this.cssDisplay = 'hidemodel';
            });


    }


    convertDateFormat(date) {
        let returnValue;
        if (date !== null && date !== undefined && date !== '') {
            let formattedDateArray = date.split('-');
            let dt = formattedDateArray[2].startsWith(0) ? formattedDateArray[2].substring(1) : formattedDateArray[2]
            let month = formattedDateArray[1].startsWith(0) ? formattedDateArray[1].substring(1) : formattedDateArray[1]
            let year = formattedDateArray[0];
            returnValue = month + '/' + dt + '/' + year;

        } else {
            returnValue = '';
        }
        return returnValue;
    }

}