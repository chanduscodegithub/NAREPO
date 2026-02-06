import { LightningElement, api, track } from 'lwc';
import getGrowthDataOfCMVPCRRVP from '@salesforce/apex/GrowthIncentiveCompensationController.getGrowthDataOfCMVPCRRVP';
import getTemplateInXML from '@salesforce/apex/GrowthIncentiveCompensationController.getTemplateInXML';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ICM_SCEVPCRRVP_Growth_ObjectPropertyFieldApiName_Mapping from '@salesforce/label/c.ICM_SCEVPCRRVP_Growth_ObjectPropertyFieldApiName_Mapping';
import ICM_Growth_Report_Title from '@salesforce/label/c.ICM_Growth_Report_Title';
import ICM_SalesCycleLabel from '@salesforce/label/c.ICM_SalesCycleLabel';
import Print from '@salesforce/label/c.Print';
import ICM_VPCR_RVP_Growth_Previously_Managed_Table_Title from '@salesforce/label/c.ICM_VPCR_RVP_Growth_Previously_Managed_Table_Title';
import ICM_VPCR_RVP_Growth_Currently_Managing_Table_Title from '@salesforce/label/c.ICM_VPCR_RVP_Growth_Currently_Managing_Table_Title';
import Go from '@salesforce/label/c.Go';
import Clear from '@salesforce/label/c.Clear';
import ICM_VPCR_RVP_Growth_Instruction_Text from '@salesforce/label/c.ICM_VPCR_RVP_Growth_Instruction_Text';

export default class CmvpcrrvpGrowthCmp extends LightningElement {

    @track salesCycle = '';
    @track salesCyclePicklist;
    @track sortByColumnName = 'Opportunity.Account.Name';
    @track sortByOrder = 'ASC';
    @track growthDataList = [];
    @track growthRecWrapperList = [];
    @track loggedInUserName = '';
    @track reportTitle = '';
    @track sortByEffectiveDateAsc = false;
    @track sortByCompanyNameAsc = true;
    @track sortByMembershipActivityNameAsc = false;
    @track sortByProductFamilyAsc = false;
    @track sortByProductNameAsc = false;
    @track sortByCurrentSCEAsc = false;
    @track loggedInUserTimeZone;
    @api loggedInUserRole;
    @track isCurrentlyManagingGrowthDataListEmpty = true;
    @track isPreviouslyManagedGrowthDataListEmpty = true;
    @track currentlyManagingGrowthDataList = [];
    @track previouslyManagedGrowthDataList = [];
    @track sortSectionName = '';
    @track sortByEffectiveDateAsc1 = false;
    @track sortByCompanyNameAsc1 = true;
    @track sortByMembershipActivityNameAsc1 = false;
    @track sortByProductFamilyAsc1 = false;
    @track sortByProductNameAsc1 = false;
    @track sortByCurrentSCEAsc1 = false;
    @track loggedInUserId;
    @track scePicklist = [];
    @track companyNamePicklist = [];
    @track filterBySCE = null;
    @track filterByCompanyName = null;
    @track filterByEffectiveDate = null;
    @track onLoad = false;
    @track cssDisplay;
    @track disablePrintButton;
    @track disableGoAndClearButton;
    activeSections = ['A', 'B'];
    @api isloggedinuservpcr;

    label = {
        ICM_Growth_Report_Title,
        ICM_SalesCycleLabel,
        Print,
        ICM_VPCR_RVP_Growth_Currently_Managing_Table_Title,
        ICM_VPCR_RVP_Growth_Previously_Managed_Table_Title,
        Go, Clear, ICM_VPCR_RVP_Growth_Instruction_Text
    };

    connectedCallback() {
        this.onLoad = true;
        this.getGrowthDataOfCMVPCRRVP();

    }

    renderedCallback() {
        if(!this.isloggedinuservpcr){
        if (this.template.querySelector(".section-header-style-vpcr-rvp-growth") === null || this.hasRendered === true)
        return;
        this.hasRendered = true;
        let style = document.createElement("style");
        style.innerText = `    
                     .section-header-vpcr-rvp-growth .slds-accordion__summary-heading{
                         background-color: hsla(219, 49%, 67%, 0.79);
                         padding: 4px 10px;
                         border-radius: 3px;
                         font-weight: 600;
                         font-size: 15px;
                     }    
                 `;
        this.template.querySelector(".section-header-style-vpcr-rvp-growth").appendChild(style);
        }else if(this.isloggedinuservpcr){
            if (this.template.querySelector(".section-header-style-vpcr-rvp-growth") === null || this.hasRendered === true)
            return;
            this.hasRendered = true;
            let style = document.createElement("style");
            style.innerText = `    
                         .section-header-vpcr-rvp-growth .slds-accordion__summary-heading{
                             background-color: rgba(210, 223, 247, 0.7) !important; 
                             padding: 4px 10px;
                             border-radius: 3px;
                             font-weight: 600;
                             font-size: 15px;
                         }    
                     `;
            this.template.querySelector(".section-header-style-vpcr-rvp-growth").appendChild(style);
            }
    }

    getGrowthDataOfCMVPCRRVP() {
        this.cssDisplay = '';
        getGrowthDataOfCMVPCRRVP({
            salesCycle: this.salesCycle, sortByColumnName: this.sortByColumnName, sortByOrder: this.sortByOrder, sortSectionName: this.sortSectionName,
            filterBySCE: this.filterBySCE, filterByCompanyName: this.filterByCompanyName, filterByEffectiveDate: this.filterByEffectiveDate
        })
            .then(result => {
                let growthData = result;
                var salesCyclePicklist = [];
                let growthDataList = [];
                let dataListSeparatedMap = {};
                let scePicklist = [];
                let companyNamePicklist = [];

                console.log(JSON.stringify(growthData));



                if (growthData !== null && growthData !== undefined) {

                    if (growthData.OpportunityLineItemList !== undefined && growthData.OpportunityLineItemList !== null &&
                        growthData.OpportunityLineItemList.length !== 0) {
                        growthDataList = [...growthData.OpportunityLineItemList];
                        this.disablePrintButton = false;

                    }
                    else {
                        if (this.sortSectionName === '') {
                            this.isCurrentlyManagingGrowthDataListEmpty = true;
                            this.isPreviouslyManagedGrowthDataListEmpty = true;
                            this.disablePrintButton = true;
                        } else if (this.sortSectionName === 'Current') {
                            this.isCurrentlyManagingGrowthDataListEmpty = true;
                        } else if (this.sortSectionName === 'Previous') {
                            this.isPreviouslyManagedGrowthDataListEmpty = true;
                        }


                    }

                    if (growthData.picklistFieldMap !== undefined && growthData.picklistFieldMap !== null) {
                        if (growthData.picklistFieldMap.hasOwnProperty('SalesCycle')) {
                            growthData.picklistFieldMap.SalesCycle.forEach(function (element) {

                                salesCyclePicklist.push({ label: element, value: element });


                            });
                        }
                    }
                    this.salesCyclePicklist = salesCyclePicklist;

                    this.salesCycle = growthData.salesCycle;
                    this.loggedInUserName = growthData.loggedInUserName;
                    //this.reportTitle = growthData.loggedInUserName + ' -- Incentive Compensation Growth Data Sheet';
                    this.reportTitle = 'Incentive Compensation Growth Data Sheet';
                    //this.growthRecWrapperList = this.buildGrowthRecWrapper(growthDataList);
                    this.loggedInUserTimeZone = growthData.loggedInUserTimeZone;
                    this.loggedInUserId = growthData.loggedInUserId;

                    if (this.sortSectionName === '') {
                        dataListSeparatedMap = this.processGrowthData(growthDataList);

                        if (!this.isMapEmpty(dataListSeparatedMap)) {
                            if (dataListSeparatedMap.hasOwnProperty('currentlyManagingGrowthDataList')
                                && !this.isListEmpty(dataListSeparatedMap.currentlyManagingGrowthDataList)) {
                                this.isCurrentlyManagingGrowthDataListEmpty = false;
                                this.currentlyManagingGrowthDataList = this.buildGrowthRecWrapper(dataListSeparatedMap.currentlyManagingGrowthDataList);
                            } else {
                                this.isCurrentlyManagingGrowthDataListEmpty = true;
                            }
                            if (dataListSeparatedMap.hasOwnProperty('previouslyManagedGrowthDataList')
                                && !this.isListEmpty(dataListSeparatedMap.previouslyManagedGrowthDataList)) {
                                this.isPreviouslyManagedGrowthDataListEmpty = false;
                                this.previouslyManagedGrowthDataList = this.buildGrowthRecWrapper(dataListSeparatedMap.previouslyManagedGrowthDataList);
                            } else {
                                this.isPreviouslyManagedGrowthDataListEmpty = true;
                            }
                            if (this.onLoad) {
                                if (dataListSeparatedMap.hasOwnProperty('sceList')
                                    && !this.isListEmpty(dataListSeparatedMap.sceList)) {
                                    scePicklist.push({ label: '', value: '' });
                                    dataListSeparatedMap.sceList.forEach(function (element) {

                                        scePicklist.push({ label: element, value: element });


                                    });
                                }
                                if (dataListSeparatedMap.hasOwnProperty('companyNameList')
                                    && !this.isListEmpty(dataListSeparatedMap.companyNameList)) {
                                    companyNamePicklist.push({ label: '', value: '' });
                                    dataListSeparatedMap.companyNameList.forEach(function (element) {

                                        companyNamePicklist.push({ label: element, value: element });


                                    });
                                }

                                this.scePicklist = scePicklist;
                                this.companyNamePicklist = companyNamePicklist;

                            }


                        }
                    } else if (this.sortSectionName === 'Current') {
                        this.currentlyManagingGrowthDataList = this.buildGrowthRecWrapper(growthDataList);
                    } else if (this.sortSectionName === 'Previous') {
                        this.previouslyManagedGrowthDataList = this.buildGrowthRecWrapper(growthDataList);
                    }



                }
                if (this.isBlank(this.filterByCompanyName) && this.isBlank(this.filterBySCE)) {
                    this.disableGoAndClearButton = true;
                } else {
                    this.disableGoAndClearButton = false;
                }

                console.log('this.currentlyManagingGrowthDataList==>' + JSON.stringify(this.currentlyManagingGrowthDataList));
                console.log('this.previouslyManagedGrowthDataList==>' + JSON.stringify(this.previouslyManagedGrowthDataList));
                this.onLoad = false;
                this.cssDisplay = 'hidemodel';

            })
            .catch(error => {
                console.log('Error in CmvpcrrvpGrowthCmp Cmp ==>' + JSON.stringify(error));
                this.cssDisplay = 'hidemodel';
            });

    }

    salesCycleChangeHandler(event) {
        this.activeSections = ['A', 'B'];
        this.salesCycle = event.target.value;
        this.sortByColumnName = 'Opportunity.Account.Name';
        this.sortByOrder = 'ASC';
        this.sortSectionName = '';
        this.growthDataList = [];
        this.currentlyManagingGrowthDataList = [];
        this.previouslyManagedGrowthDataList = [];
        this.scePicklist = [];
        this.companyNamePicklist = [];
        this.filterBySCE = null;
        this.filterByCompanyName = null;
        this.filterByEffectiveDate = null;
        this.sortByEffectiveDateAsc = false;
        this.sortByCompanyNameAsc = true;
        this.sortByMembershipActivityNameAsc = false;
        this.sortByProductFamilyAsc = false;
        this.sortByCurrentSCEAsc = false;
        this.sortByProductNameAsc = false;
        this.sortByEffectiveDateAsc1 = false;
        this.sortByCompanyNameAsc1 = true;
        this.sortByMembershipActivityNameAsc1 = false;
        this.sortByProductFamilyAsc1 = false;
        this.sortByCurrentSCEAsc1 = false;
        this.sortByProductNameAsc1 = false;
        this.onLoad = true;

        this.getGrowthDataOfCMVPCRRVP();

    }

    processGrowthData(dataList) {
        let currentlyManagingGrowthDataList = [];
        let previouslyManagedGrowthDataList = [];
        let sceList = [];
        let companyNameList = [];
        let returnMap = {};

        for (let i in dataList) {
            if (i !== undefined) {
                if (dataList[i].hasOwnProperty('VPCR_RVP__c')) {
                    if (dataList[i].hasOwnProperty('Opportunity')
                        && dataList[i].Opportunity.hasOwnProperty('Account') && dataList[i].Opportunity.Account.hasOwnProperty('CMVPCRRVP__c')
                        && dataList[i].VPCR_RVP__c === dataList[i].Opportunity.Account.CMVPCRRVP__c) {
                        currentlyManagingGrowthDataList.push(dataList[i]);
                    } else {
                        previouslyManagedGrowthDataList.push(dataList[i]);
                    }
                } else {
                    if (dataList[i].hasOwnProperty('Opportunity')
                        && dataList[i].Opportunity.hasOwnProperty('Account') && dataList[i].Opportunity.Account.hasOwnProperty('CMVPCRRVP__c')
                        && dataList[i].Opportunity.hasOwnProperty('CM_VPCR_RVP__c') && dataList[i].Opportunity.CM_VPCR_RVP__c === dataList[i].Opportunity.Account.CMVPCRRVP__c) {
                        currentlyManagingGrowthDataList.push(dataList[i]);
                    } else {
                        previouslyManagedGrowthDataList.push(dataList[i]);
                    }
                }

                if (this.onLoad) {
                    if (dataList[i].hasOwnProperty('Opportunity') && dataList[i].Opportunity.hasOwnProperty('Account') &&
                        dataList[i].Opportunity.Account.hasOwnProperty('Owner') && dataList[i].Opportunity.Account.Owner.hasOwnProperty('Name')
                        && !this.isBlank(dataList[i].Opportunity.Account.Owner.Name) && sceList.indexOf(dataList[i].Opportunity.Account.Owner.Name) === -1) {
                        sceList.push(dataList[i].Opportunity.Account.Owner.Name);
                    }
                    if (dataList[i].hasOwnProperty('Opportunity') && dataList[i].Opportunity.hasOwnProperty('Account') &&
                        dataList[i].Opportunity.Account.hasOwnProperty('Name')
                        && !this.isBlank(dataList[i].Opportunity.Account.Name) && companyNameList.indexOf(dataList[i].Opportunity.Account.Name) === -1) {
                        companyNameList.push(dataList[i].Opportunity.Account.Name);
                    }
                }

            }
        }


        returnMap.currentlyManagingGrowthDataList = currentlyManagingGrowthDataList;
        returnMap.previouslyManagedGrowthDataList = previouslyManagedGrowthDataList;
        returnMap.sceList = sceList;
        returnMap.companyNameList = companyNameList;

        return returnMap;

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


    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }

    isListEmpty(lst) {
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

    buildGrowthRecWrapper(dataList) {
        let returnList = [];
        let apiNameObjPropMappingList = [];
        let apiNameObjPropMap = {};

        if (!this.isListEmpty(dataList)) {
            apiNameObjPropMappingList = this.getListFromValueSeparatedStr(ICM_SCEVPCRRVP_Growth_ObjectPropertyFieldApiName_Mapping, ';');
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
                                                        console.log('k==>' + k);
                                                        jsonData[apiNameObjPropMap[k]] = dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]][fieldApiNameSeparatedByDot2[0]][fieldApiNameSeparatedByDot2[1]];
                                                    } else {
                                                        jsonData[apiNameObjPropMap[k]] = '';
                                                    }
                                                } else {
                                                    jsonData[apiNameObjPropMap[k]] = '';
                                                }
                                            } else {
                                                if (dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]].hasOwnProperty(fieldApiNameSeparatedByDot1[1])) {
                                                    console.log('k==>' + k);
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


    sortFields(event) {

        var selectedItem = event.currentTarget;
        var selectedItemToBeSorted = selectedItem.dataset.record;

        var fieldItagsWithPropMap = '{"Opportunity.EffectiveDate__c":"sortByEffectiveDateAsc","Opportunity.Account.Name":"sortByCompanyNameAsc","Opportunity.Name":"sortByMembershipActivityNameAsc","Product2.Family":"sortByProductFamilyAsc","Opportunity.Account.Owner.Name":"sortByCurrentSCEAsc","Product2.Name":"sortByProductNameAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithPropMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];
        this.sortSectionName = 'Current';
        if (sortFieldCompName === 'sortByEffectiveDateAsc') {
            if (this.sortByEffectiveDateAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        } else if (sortFieldCompName === 'sortByCompanyNameAsc') {
            if (this.sortByCompanyNameAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        } else if (sortFieldCompName === 'sortByMembershipActivityNameAsc') {
            if (this.sortByMembershipActivityNameAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByMembershipActivityNameAsc = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByMembershipActivityNameAsc = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        } else if (sortFieldCompName === 'sortByProductFamilyAsc') {
            if (this.sortByProductFamilyAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductFamilyAsc = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductFamilyAsc = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        }
        else if (sortFieldCompName === 'sortByCurrentSCEAsc') {
            if (this.sortByCurrentSCEAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        } else if (sortFieldCompName === 'sortByProductNameAsc') {
            if (this.sortByProductNameAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductNameAsc = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductNameAsc = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        }


    }


    sortFields1(event) {

        var selectedItem = event.currentTarget;
        var selectedItemToBeSorted = selectedItem.dataset.record;

        var fieldItagsWithPropMap = '{"Opportunity.EffectiveDate__c":"sortByEffectiveDateAsc1","Opportunity.Account.Name":"sortByCompanyNameAsc1","Opportunity.Name":"sortByMembershipActivityNameAsc1","Product2.Family":"sortByProductFamilyAsc1","Opportunity.Account.Owner.Name":"sortByCurrentSCEAsc1","Product2.Name":"sortByProductNameAsc1"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithPropMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];
        this.sortSectionName = 'Previous';
        if (sortFieldCompName === 'sortByEffectiveDateAsc1') {
            if (this.sortByEffectiveDateAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc1 = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc1 = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        } else if (sortFieldCompName === 'sortByCompanyNameAsc1') {
            if (this.sortByCompanyNameAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc1 = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc1 = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        } else if (sortFieldCompName === 'sortByMembershipActivityNameAsc1') {
            if (this.sortByMembershipActivityNameAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByMembershipActivityNameAsc1 = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByMembershipActivityNameAsc1 = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        } else if (sortFieldCompName === 'sortByProductFamilyAsc1') {
            if (this.sortByProductFamilyAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductFamilyAsc1 = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductFamilyAsc1 = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        } else if (sortFieldCompName === 'sortByCurrentSCEAsc1') {
            if (this.sortByCurrentSCEAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc1 = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc1 = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        }
        else if (sortFieldCompName === 'sortByProductNameAsc1') {
            if (this.sortByProductNameAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductNameAsc1 = false;
                this.getGrowthDataOfCMVPCRRVP();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByProductNameAsc1 = true;
                this.getGrowthDataOfCMVPCRRVP();

            }

        }


    }

    sceFilterChangeHandler(event) {
        console.log(event.target.value);
        this.filterBySCE = event.target.value;
        if (!this.isBlank(this.filterBySCE)) {
            this.disableGoAndClearButton = false;
        }

    }

    companyFilterChangeHandler(event) {
        this.filterByCompanyName = event.target.value;
        if (!this.isBlank(this.filterByCompanyName)) {
            this.disableGoAndClearButton = false;
        }
    }

    effectiveDateFilterChangeHandler(event) {
        this.filterByEffectiveDate = event.target.value;
    }

    fetchFilteredGrowthData() {
        this.sortSectionName = '';
        this.sortByColumnName = 'Opportunity.Account.Name';
        this.sortByOrder = 'ASC';
        this.sortByEffectiveDateAsc = false;
        this.sortByCompanyNameAsc = true;
        this.sortByMembershipActivityNameAsc = false;
        this.sortByProductFamilyAsc = false;
        this.sortByCurrentSCEAsc = false;
        this.sortByProductNameAsc = false;
        this.sortByEffectiveDateAsc1 = false;
        this.sortByCompanyNameAsc1 = true;
        this.sortByMembershipActivityNameAsc1 = false;
        this.sortByProductFamilyAsc1 = false;
        this.sortByCurrentSCEAsc1 = false;
        this.sortByProductNameAsc1 = false;
        this.currentlyManagingGrowthDataList = [];
        this.previouslyManagedGrowthDataList = [];
        this.getGrowthDataOfCMVPCRRVP();
    }

    clearFilters() {
        this.filterByEffectiveDate = null;
        this.filterBySCE = null;
        this.filterByCompanyName = null;
        this.sortSectionName = '';
        this.sortByColumnName = 'Opportunity.Account.Name';
        this.sortByOrder = 'ASC';
        this.sortByEffectiveDateAsc = false;
        this.sortByCompanyNameAsc = true;
        this.sortByMembershipActivityNameAsc = false;
        this.sortByProductFamilyAsc = false;
        this.sortByCurrentSCEAsc = false;
        this.sortByProductNameAsc = false;
        this.sortByEffectiveDateAsc1 = false;
        this.sortByCompanyNameAsc1 = true;
        this.sortByMembershipActivityNameAsc1 = false;
        this.sortByProductFamilyAsc1 = false;
        this.sortByCurrentSCEAsc1 = false;
        this.sortByProductNameAsc1 = false;
        this.currentlyManagingGrowthDataList = [];
        this.previouslyManagedGrowthDataList = [];
        this.getGrowthDataOfCMVPCRRVP();

    }


    print() {
        //this.cssDisplay = '';
        /*if (this.isCurrentlyManagingGrowthDataListEmpty && this.isPreviouslyManagedGrowthDataListEmpty) {
            const event = new ShowToastEvent({
                title: '',
                message: 'No records to print.',
            });
            this.dispatchEvent(event);
            this.cssDisplay = 'hidemodel';
        } else {*/

        this.cssDisplay = '';
        getTemplateInXML({ loggedInUserRole: this.loggedInUserRole })
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
                            let growthRecList = [];
                            if (objectName === 'CurrentlyManagingGrowthRec') {

                                stHeaderIdx = xmlWsectTag.indexOf('<Row ss:AutoFitHeight="0" ss:Height="29.25">');
                                if (!this.isCurrentlyManagingGrowthDataListEmpty) {
                                    growthRecList = [...this.currentlyManagingGrowthDataList];
                                    rowCount = rowCount + growthRecList.length;

                                } else {
                                    // growthRecList = this.buildGrowthRecWrapper([{ "Id": "", "OpportunityId": "" }]);

                                }


                            }
                            if (objectName === 'PreviouslyManagedGrowthRec') {
                                stHeaderIdx = xmlWsectTag.lastIndexOf('<Row ss:AutoFitHeight="0" ss:Height="29.25">', startIndex);
                                if (!this.isPreviouslyManagedGrowthDataListEmpty) {
                                    growthRecList = [...this.previouslyManagedGrowthDataList];
                                    rowCount = rowCount + growthRecList.length;
                                } else {
                                    //growthRecList = this.buildGrowthRecWrapper([{ "Id": "", "OpportunityId": "" }]);
                                }

                            }

                            let endHeaderIdx = xmlWsectTag.indexOf('</Row>', endIndex);
                            endHeaderIdx += '</Row>'.length;
                            let rowToReccurse = xmlWsectTag.substring(stHeaderIdx, endHeaderIdx);


                            if (objectName === 'CurrentlyManagingGrowthRec' && this.isCurrentlyManagingGrowthDataListEmpty) {
                                xmlWsectTag = xmlWsectTag.split(rowToReccurse).join('');
                            } else if (objectName === 'PreviouslyManagedGrowthRec' && this.isPreviouslyManagedGrowthDataListEmpty) {
                                xmlWsectTag = xmlWsectTag.split(rowToReccurse).join('');
                                xmlTempleteString = xmlWsectTag;
                            } else {
                                xmlTempleteString = this.returnChildRows(rowToReccurse, xmlWsectTag, growthRecList, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx, rowCount);
                                xmlWsectTag = xmlTempleteString;
                            }

                        }

                    }
                }


                xmlTempleteString = xmlTempleteString.split('##RowVal@@').join(rowCount);
                let today = this.formatDate('');
                let hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:text/xls;charset=utf-8,' + encodeURIComponent(xmlTempleteString);
                //hiddenElement.href = 'data:text/xls;charset=utf-8;base64,' + this.base64Encode( xmlTempleteString );
                hiddenElement.target = '_self'; // 
                hiddenElement.download = 'Growth Data Sheet ' + salesCycleValue + ' ' + today + '.xls';
                document.body.appendChild(hiddenElement); // Required for FireFox browser



                hiddenElement.click();
                const event = new ShowToastEvent({
                    title: '',
                    message: 'Growth Data Sheet Exported Successfully',
                });
                this.dispatchEvent(event);

                this.cssDisplay = 'hidemodel';
            })
            .catch(error => {
                console.log('Error ==>' + JSON.stringify(error));
                this.cssDisplay = 'hidemodel';
            });
        //}

    }

    returnChildRows(rowToReccurse, xmlWsectTag, growthData, objectName, objectItagesMap, stHeaderIdx, endHeaderIdx) {

        let totalRows = '';
        let count = 0;
        let dateSentHighlightStyleId = "s76";
        let dateSentNonHighlightStyleId = "s97";
        /*let salesPersonHighlightStyleId = "s106";
        let salesPersonNonHighlightStyleId = "s75";
        let salesPersonPrcntgHighlightStyleId = "s108";
        let salesPersonPrcntgNonHighlightStyleId = "s78";*/
        let scesReceivingCompensationHighlightStyleId = "s74";
        let scesReceivingCompensationNonHighlightStyleId = "s97";
        let scesReceivingCompensationEmptyStyleId = "s100";
        for (let i in growthData) {
            let eachRow = rowToReccurse;
            count = count + 1;
            //rowCount = rowCount + 1;
            /*var replaceItagName = '%%'+objectName+'.'+'Serial_No'+'@@';
                eachRow = eachRow.split(replaceItagName).join(count);*/
            for (let k in objectItagesMap[objectName]) {
                let key = objectItagesMap[objectName][k];
                let replaceItagName = '%%' + objectName + '.' + key + '@@';
                let value = '';

                if (key === 'effectiveDate') {
                    if (growthData[i].hasOwnProperty(key) &&
                        !this.isBlank(growthData[i][key])) {
                        value = this.convertDateFormat(growthData[i][key]);
                    }
                } else if (key === 'newMembership' && !this.isBlank(growthData[i][key]) && growthData[i][key].toString().length > 3) {
                    value = parseFloat(growthData[i][key]).toLocaleString('en');
                    console.log('newMembership==>' + value);
                } else if (key === 'dateSentToIncentiveCompTeam') {
                    let icSentStatusStyleId;
                    if (growthData[i].hasOwnProperty(key)
                        && !this.isBlank(growthData[i][key])) {
                        icSentStatusStyleId = dateSentNonHighlightStyleId;
                        value = this.formatDateTime(growthData[i][key]);


                    } else {
                        icSentStatusStyleId = dateSentHighlightStyleId;
                        value = 'Not Sent - Action Needed';

                    }
                    eachRow = eachRow.split('##icSentStatusStyleId@@').join(icSentStatusStyleId);
                } else if (key === 'dateIncentiveCompTeamExtractedData') {

                    if (growthData[i].hasOwnProperty(key)
                        && !this.isBlank(growthData[i][key])) {

                        value = this.formatDateTime(growthData[i][key]);

                    } else {
                        value = 'Not Yet Extracted';

                    }


                } else if (key === 'productName') {
                    if (growthData[i].hasOwnProperty(key)
                        && !this.isBlank(growthData[i][key])) {
                        if (growthData[i].productName === 'Total' && growthData[i].hasOwnProperty('productLine')
                            && !this.isBlank(growthData[i].productLine)) {

                            value = growthData[i].productLine;
                        } else {
                            value = growthData[i][key];
                        }

                    }

                } else if (key === 'productFamily') {
                    if (!growthData[i].hasOwnProperty(key)
                        || this.isBlank(growthData[i][key])) {
                        if (growthData[i].hasOwnProperty('productName') && growthData[i].productName === 'Total' && growthData[i].hasOwnProperty('productLine')
                            && !this.isBlank(growthData[i].productLine)) {

                            value = growthData[i].productLine;
                        }

                    } else {
                        value = growthData[i][key];
                    }

                } else if (key === 'scesReceivingCompensation') {
                    let scesReceivingCompensation = '';
                    if (!growthData[i].hasOwnProperty('salesPerson1Name') || this.isBlank(growthData[i].salesPerson1Name)) {
                        scesReceivingCompensation = 'Not Yet Sent to Incentive Comp Team';

                    } else {
                        if (growthData[i].hasOwnProperty('salesPerson1Name') && !this.isBlank(growthData[i].salesPerson1Name)) {
                            scesReceivingCompensation += growthData[i].salesPerson1Name;
                        }
                        if (growthData[i].hasOwnProperty('salesPerson1SplitPercentage') && !this.isBlank(growthData[i].salesPerson1SplitPercentage)) {
                            scesReceivingCompensation += ' ' + growthData[i].salesPerson1SplitPercentage + '%';
                        }
                        if (growthData[i].hasOwnProperty('salesPerson2Name') && !this.isBlank(growthData[i].salesPerson2Name)) {
                            scesReceivingCompensation += ', ' + growthData[i].salesPerson2Name;
                        }
                        if (growthData[i].hasOwnProperty('salesPerson2SplitPercentage') && !this.isBlank(growthData[i].salesPerson2SplitPercentage)) {
                            scesReceivingCompensation += ' ' + growthData[i].salesPerson2SplitPercentage + '%';
                        }
                    }
                    value = scesReceivingCompensation;
                }
                else {
                    value = growthData[i][key];
                }


                value = value != null ? value : '';
                value = value.toString();
                value = this.replaceXmlSpecialCharacters(value);


                /*if (growthData[i].hasOwnProperty('salesPerson2Name')
                    && !this.isBlank(growthData[i].salesPerson2Name)) {
                    eachRow = eachRow.split('##salesPerson1StyleId@@').join(salesPersonHighlightStyleId);
                    eachRow = eachRow.split('##salesPerson1SplitPrcntgStyleId@@').join(salesPersonPrcntgHighlightStyleId);
                    eachRow = eachRow.split('##salesPerson2StyleId@@').join(salesPersonHighlightStyleId);
                    eachRow = eachRow.split('##salesPerson2SplitPrcntgStyleId@@').join(salesPersonPrcntgHighlightStyleId);
                } else if (growthData[i].hasOwnProperty('salesPerson1Id')
                    && !this.isBlank(growthData[i].salesPerson1Id) && growthData[i].hasOwnProperty('accountOwnerId')
                    && !this.isBlank(growthData[i].accountOwnerId) && growthData[i].salesPerson1Id !== growthData[i].accountOwnerId) {
                    eachRow = eachRow.split('##salesPerson1StyleId@@').join(salesPersonHighlightStyleId);
                    eachRow = eachRow.split('##salesPerson1SplitPrcntgStyleId@@').join(salesPersonPrcntgHighlightStyleId);
                    eachRow = eachRow.split('##salesPerson2StyleId@@').join(salesPersonNonHighlightStyleId);
                    eachRow = eachRow.split('##salesPerson2SplitPrcntgStyleId@@').join(salesPersonPrcntgNonHighlightStyleId);
                } else {

                    eachRow = eachRow.split('##salesPerson1StyleId@@').join(salesPersonNonHighlightStyleId);
                    eachRow = eachRow.split('##salesPerson1SplitPrcntgStyleId@@').join(salesPersonPrcntgNonHighlightStyleId);
                    eachRow = eachRow.split('##salesPerson2StyleId@@').join(salesPersonNonHighlightStyleId);
                    eachRow = eachRow.split('##salesPerson2SplitPrcntgStyleId@@').join(salesPersonPrcntgNonHighlightStyleId);
                }*/

                if (growthData[i].hasOwnProperty('salesPerson2Name')
                    && !this.isBlank(growthData[i].salesPerson2Name)) {
                    eachRow = eachRow.split('##scesReceivingCompensationStatusStyleId@@').join(scesReceivingCompensationHighlightStyleId);

                } else if (growthData[i].hasOwnProperty('salesPerson1Id') && !this.isBlank(growthData[i].salesPerson1Id)) {
                    if (growthData[i].hasOwnProperty('accountOwnerId')
                        && !this.isBlank(growthData[i].accountOwnerId) && growthData[i].salesPerson1Id !== growthData[i].accountOwnerId) {
                        eachRow = eachRow.split('##scesReceivingCompensationStatusStyleId@@').join(scesReceivingCompensationHighlightStyleId);
                    }
                    else {
                        eachRow = eachRow.split('##scesReceivingCompensationStatusStyleId@@').join(scesReceivingCompensationNonHighlightStyleId);
                    }
                }
                else {

                    eachRow = eachRow.split('##scesReceivingCompensationStatusStyleId@@').join(scesReceivingCompensationEmptyStyleId);

                }


                eachRow = eachRow.split(replaceItagName).join(value);
            }

            totalRows += eachRow;
        }
        xmlWsectTag = xmlWsectTag.substring(0, stHeaderIdx) + totalRows + xmlWsectTag.substring(endHeaderIdx);
        //xmlWsectTag = xmlWsectTag.split('##RowVal@@').join(rowCount);
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

    formatDate(inputDate) {
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
        dateToFormat = yyyy + '' + mm + '' + dd;
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
        else {
            dateTime = new Date(inputDateTime).toLocaleString("en-US", { timeZone: this.loggedInUserTimeZone });
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

    highlightICDataExtractedStatus(effectiveDate) {
        let highlightICDataExtractedStatus = false;
        if (!this.isBlank(effectiveDate)) {
            let currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            let effctvDt = this.parseDate(effectiveDate);
            if (effctvDt < currentDate) {
                highlightICDataExtractedStatus = true;
            }
        } else {
            highlightICDataExtractedStatus = true;
        }
        return highlightICDataExtractedStatus;
    }

    parseDate(inputDate) {
        var parts = inputDate.match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1] - 1, parts[2]); // months are 0-based
    }


}