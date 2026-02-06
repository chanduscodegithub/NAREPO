import { LightningElement,api } from 'lwc';
import getProactiveRenewalData from '@salesforce/apex/ProactiveRenewalController.getProactiveRenewalData';
import ICM_VPCR_Retention_CurrentCompanyHeader from '@salesforce/label/c.ICM_VPCR_Retention_CurrentCompanyHeader';
import ICM_VPCR_Retention_PreviousCompanyHeader from '@salesforce/label/c.ICM_VPCR_Retention_PreviousCompanyHeader';
import ICM_VPCRRVP_ProactiveRenewal_ObjectPropertyFieldApiName_Mapping from '@salesforce/label/c.ICM_VPCRRVP_ProactiveRenewal_ObjectPropertyFieldApiName_Mapping';

export default class VpcrProactiveRenewalCmp extends LightningElement {
    salesCycle = '';
    sortByColumnName = 'Account.Name';
    sortByOrder = 'ASC';
    sortSectionName = '';
    loggedInUserTimeZone;
    loggedInUserId;
    isCurrentlyManagingPrctvRnwlListEmpty=true;
    isPreviouslyManagedPrctvRnwlListEmpty = true;
    currentlyManagingPrctvRnwlList = [];
    previouslyManagedPrctvRnwlList = [];
    onLoad=true;
    scePicklist = [];
    companyNamePicklist = [];
    scePicklist1 = [];
    companyNamePicklist1 = [];
    isSort=false;

    sortByEffectiveDateAsc = false;
    sortByCompanyNameAsc = true;
    sortByMembershipActivityNameAsc = false;
    sortByCurrentSCEAsc = false;
    sortByEffectiveDateAsc1 = false;
    sortByCompanyNameAsc1 = true;
    sortByMembershipActivityNameAsc1 = false;
    sortByCurrentSCEAsc1 = false;
    filterbycompany1;
    filterbysce1;

    isDataLoad=false;
    isSortedDataLoaded=false;
    activeSections=['A','B'];
    /*@api 
    get filterbycompany() {

        return this.filterbycompany1;
    }
    set filterbycompany(value) {
        this.filterbycompany1=value;
    }
    @api 
    get filterbysce() {

        return this.filterbysce1;
    }
    set filterbysce(value) {
        this.filterbysce1=value;
    }
    @api 
    get salesCycleValue() {

        return this.salesCycle;
    }
    set salesCycleValue(value) {
        this.salesCycle=value;
        if(!this.onLoad){
            this.salesCycleChangeHandler();
        }
    }*/

    label = {
        ICM_VPCR_Retention_CurrentCompanyHeader,
        ICM_VPCR_Retention_PreviousCompanyHeader,
        ICM_VPCRRVP_ProactiveRenewal_ObjectPropertyFieldApiName_Mapping
        
        
    };

    connectedCallback() {
        //this.onLoad = true;
        //this.getProactiveRenewalData();

    }

    @api
    getProactiveRenewalData(salesCycle,filterbycompany1,filterbysce1){
        let eventData;
        this.salesCycle=salesCycle;
        this.filterbysce1=filterbysce1;
        this.filterbycompany1=filterbycompany1;
        console.log('salesCycle'+this.salesCycle);
        console.log('sortByColumnName'+this.sortByColumnName);
        console.log('sortByOrder'+this.sortByOrder);
        console.log('filterBySCE'+this.filterbysce);
        console.log('filterByCompanyName'+this.filterbycompany);
        if(this.isSort){
            this.isSort=false;
            this.isDataLoad=false;
            this.isSortedDataLoaded=true;

        }else{
            this.isDataLoad=true;
            this.isSortedDataLoaded=false;
            this.isSort=false;
        }
        
        getProactiveRenewalData({
            salesCycle: this.salesCycle, sortByColumnName: this.sortByColumnName, sortByOrder: this.sortByOrder, sortSectionName: this.sortSectionName,
            filterBySCE: this.filterbysce1, filterByCompanyName: this.filterbycompany1})
            .then(result => {
                let proactiveRenewalData = result;
                
                let proactiveRenewalDataList = [];
                let dataListSeparatedMap = {};
                let scePicklist = [];
                let companyNamePicklist = [];
                let scePicklist1 = [];
                let companyNamePicklist1 = [];

                console.log(JSON.stringify(proactiveRenewalData));



                if (proactiveRenewalData !== null && proactiveRenewalData !== undefined) {

                    if (proactiveRenewalData.hasOwnProperty('opportunityList') && proactiveRenewalData.opportunityList !== undefined && proactiveRenewalData.opportunityList !== null &&
                        proactiveRenewalData.opportunityList.length !== 0) {
                        proactiveRenewalDataList = [...proactiveRenewalData.opportunityList];
                       

                    }
                    else {
                        if (this.sortSectionName === '') {
                            this.isCurrentlyManagingPrctvRnwlListEmpty = true;
                            this.isPreviouslyManagedPrctvRnwlListEmpty = true;
                            
                        } else if (this.sortSectionName === 'Current') {
                            this.isCurrentlyManagingPrctvRnwlListEmpty = true;
                        } else if (this.sortSectionName === 'Previous') {
                            this.isPreviouslyManagedPrctvRnwlListEmpty = true;
                        }


                    }

                  
                    this.loggedInUserTimeZone = proactiveRenewalData.loggedInUserTimeZone;
                    this.loggedInUserId = proactiveRenewalData.loggedInUserId;

                    if (this.sortSectionName === '') {
                        dataListSeparatedMap = this.processProactiveRenewalData(proactiveRenewalDataList);

                        if (!this.isMapEmpty(dataListSeparatedMap)) {
                            if (dataListSeparatedMap.hasOwnProperty('currentlyManagingPrctvRnwlList')
                                && !this.isListEmpty(dataListSeparatedMap.currentlyManagingPrctvRnwlList)) {
                                this.isCurrentlyManagingPrctvRnwlListEmpty = false;
                                this.currentlyManagingPrctvRnwlList = this.buildPrctvRnwlRecWrapper(dataListSeparatedMap.currentlyManagingPrctvRnwlList);
                            } else {
                                this.isCurrentlyManagingPrctvRnwlListEmpty = true;
                            }
                            if (dataListSeparatedMap.hasOwnProperty('previouslyManagedPrctvRnwlList')
                                && !this.isListEmpty(dataListSeparatedMap.previouslyManagedPrctvRnwlList)) {
                                this.isPreviouslyManagedPrctvRnwlListEmpty = false;
                                this.previouslyManagedPrctvRnwlList = this.buildPrctvRnwlRecWrapper(dataListSeparatedMap.previouslyManagedPrctvRnwlList);
                            } else {
                                this.isPreviouslyManagedPrctvRnwlListEmpty = true;
                            }
                            if (this.onLoad) {
                                if (dataListSeparatedMap.hasOwnProperty('sceList')
                                    && !this.isListEmpty(dataListSeparatedMap.sceList)) {
                                    //scePicklist.push('');
                                    dataListSeparatedMap.sceList.forEach(function (element) {

                                        scePicklist.push({ label: element, value: element });
                                        scePicklist1.push(element);


                                    });
                                }
                                if (dataListSeparatedMap.hasOwnProperty('companyNameList')
                                    && !this.isListEmpty(dataListSeparatedMap.companyNameList)) {
                                    //companyNamePicklist.push('');
                                    dataListSeparatedMap.companyNameList.forEach(function (element) {

                                        companyNamePicklist.push({ label: element, value: element });
                                        companyNamePicklist1.push(element);

                                    });
                                }

                                this.scePicklist = scePicklist;
                                this.companyNamePicklist = companyNamePicklist;
                                this.scePicklist1 = scePicklist1;
                                this.companyNamePicklist1 = companyNamePicklist1;

                            }


                        }
                    } else if (this.sortSectionName === 'Current') {
                        this.currentlyManagingPrctvRnwlList = this.buildPrctvRnwlRecWrapper(proactiveRenewalDataList);
                    } else if (this.sortSectionName === 'Previous') {
                        this.previouslyManagedPrctvRnwlList = this.buildPrctvRnwlRecWrapper(proactiveRenewalDataList);
                    }



                }
                this.onLoad = false;
                    eventData={'scePicklist':this.scePicklist1,'companyNamePicklist':this.companyNamePicklist1,
                            'isSort':this.isSort,'currentlyManagingPrctvRnwlList':this.currentlyManagingPrctvRnwlList,
                            'previouslyManagedPrctvRnwlList':this.previouslyManagedPrctvRnwlList,
                            'isDataLoad':this.isDataLoad,'isSortedDataLoaded':this.isSortedDataLoaded};
                const evnt = new CustomEvent('prctvrnwldataload', {
                    
                    detail: eventData
                });
                // Fire the event 
                this.dispatchEvent(evnt);
                
                

            })
            .catch(error => {
                console.log('Error in getProactiveRenewalData() ==>' + JSON.stringify(error));
                eventData={'scePicklist':this.scePicklist1,'companyNamePicklist':this.companyNamePicklist1,
                        'isSort':this.isSort,'currentlyManagingPrctvRnwlList':this.currentlyManagingPrctvRnwlList,
                        'previouslyManagedPrctvRnwlList':this.previouslyManagedPrctvRnwlList ,
                        'isDataLoad':this.isDataLoad,'isSortedDataLoaded':this.isSortedDataLoaded  };
            const evnt = new CustomEvent('prctvrnwldataload', {
                
                detail: eventData
            });
            // Fire the event 
            this.dispatchEvent(evnt);
                
            });
            

    } 

    @api
    salesCycleChangeHandler(salesCycle,filterbycompany1,filterbysce1) {
        this.activeSections=['A','B'];
        this.sortByColumnName = 'Account.Name';
        this.sortByOrder = 'ASC';
        this.sortSectionName = '';
        this.currentlyManagingPrctvRnwlList = [];
        this.previouslyManagedPrctvRnwlList = [];
        this.scePicklist1 = [];
        this.companyNamePicklist1 = [];
        this.sortByEffectiveDateAsc = false;
        this.sortByCompanyNameAsc = true;
        this.sortByMembershipActivityNameAsc = false;
        this.sortByCurrentSCEAsc = false;
        this.sortByEffectiveDateAsc1 = false;
        this.sortByCompanyNameAsc1 = true;
        this.sortByMembershipActivityNameAsc1 = false;
        this.sortByCurrentSCEAsc1 = false;
        this.onLoad = true;
        this.isSort=false;
        this.filterbycompany1=null;
        this.filterbysce1=null;
        this.getProactiveRenewalData(salesCycle,filterbycompany1,filterbysce1);

    }


    processProactiveRenewalData(dataList) {
        let currentlyManagingPrctvRnwlList = [];
        let previouslyManagedPrctvRnwlList = [];
        let sceList = [];
        let companyNameList = [];
        let returnMap = {};

        for (let i in dataList) {
           
                    if (dataList[i].hasOwnProperty('Account') && dataList[i].Account.hasOwnProperty('CMVPCRRVP__c')
                    && dataList[i].hasOwnProperty('CM_VPCR_RVP__c') && dataList[i].CM_VPCR_RVP__c === dataList[i].Account.CMVPCRRVP__c) {
                        currentlyManagingPrctvRnwlList.push(dataList[i]);
                } else {
                    previouslyManagedPrctvRnwlList.push(dataList[i]);
                }

                if (this.onLoad) {
                    if (dataList[i].hasOwnProperty('Account') &&
                        dataList[i].Account.hasOwnProperty('Owner') && dataList[i].Account.Owner.hasOwnProperty('Name')
                        && !this.isBlank(dataList[i].Account.Owner.Name) && sceList.indexOf(dataList[i].Account.Owner.Name) === -1) {
                        sceList.push(dataList[i].Account.Owner.Name);
                    }
                    if (dataList[i].hasOwnProperty('Account') &&
                        dataList[i].Account.hasOwnProperty('Name')
                        && !this.isBlank(dataList[i].Account.Name) && companyNameList.indexOf(dataList[i].Account.Name) === -1) {
                        companyNameList.push(dataList[i].Account.Name);
                    }
                }

            
        }


        returnMap.currentlyManagingPrctvRnwlList = currentlyManagingPrctvRnwlList;
        returnMap.previouslyManagedPrctvRnwlList = previouslyManagedPrctvRnwlList;
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

    buildPrctvRnwlRecWrapper(dataList) {
        let returnList = [];
        let apiNameObjPropMappingList = [];
        let apiNameObjPropMap = {};

        if (!this.isListEmpty(dataList)) {
            apiNameObjPropMappingList = this.getListFromValueSeparatedStr(ICM_VPCRRVP_ProactiveRenewal_ObjectPropertyFieldApiName_Mapping, ';');
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
        this.isSort=true;
        let eventData={'isSort':this.isSort};
                const evnt = new CustomEvent('prctvrnwldataload', {
                    
                    detail: eventData
                });
                // Fire the event 
                this.dispatchEvent(evnt);

        var selectedItem = event.currentTarget;
        var selectedItemToBeSorted = selectedItem.dataset.record;

        var fieldItagsWithPropMap = '{"EffectiveDate__c":"sortByEffectiveDateAsc","Account.Name":"sortByCompanyNameAsc","Name":"sortByMembershipActivityNameAsc","Account.Owner.Name":"sortByCurrentSCEAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithPropMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];
        this.sortSectionName = 'Current';
        
        if (sortFieldCompName === 'sortByEffectiveDateAsc') {
            if (this.sortByEffectiveDateAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc = false;
                //this.getProactiveRenewalData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc = true;
                //this.getProactiveRenewalData();

            }

        } else if (sortFieldCompName === 'sortByCompanyNameAsc') {
            if (this.sortByCompanyNameAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc = false;
                //this.getProactiveRenewalData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc = true;
                //this.getProactiveRenewalData();

            }

        } else if (sortFieldCompName === 'sortByMembershipActivityNameAsc') {
            if (this.sortByMembershipActivityNameAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByMembershipActivityNameAsc = false;
                //this.getProactiveRenewalData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByMembershipActivityNameAsc = true;
                //this.getProactiveRenewalData();

            }

        } 
        else if (sortFieldCompName === 'sortByCurrentSCEAsc') {
            if (this.sortByCurrentSCEAsc === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc = false;
                //this.getProactiveRenewalData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc = true;
                //this.getProactiveRenewalData();

            }

        } 
        this.getProactiveRenewalData(this.salesCycle,this.filterbycompany1,this.filterbysce1);

    }


    sortFields1(event) {

        this.isSort=true;
        let eventData={'isSort':this.isSort};
                const evnt = new CustomEvent('prctvrnwldataload', {
                    
                    detail: eventData
                });
                // Fire the event 
                this.dispatchEvent(evnt);

        var selectedItem = event.currentTarget;
        var selectedItemToBeSorted = selectedItem.dataset.record;

        var fieldItagsWithPropMap = '{"EffectiveDate__c":"sortByEffectiveDateAsc1","Account.Name":"sortByCompanyNameAsc1","Name":"sortByMembershipActivityNameAsc1","Account.Owner.Name":"sortByCurrentSCEAsc1"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithPropMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];
        this.sortSectionName = 'Previous';
        //this.isSort=true;
        if (sortFieldCompName === 'sortByEffectiveDateAsc1') {
            if (this.sortByEffectiveDateAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc1 = false;
                //this.getProactiveRenewalData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByEffectiveDateAsc1 = true;
                //this.getProactiveRenewalData();

            }

        } else if (sortFieldCompName === 'sortByCompanyNameAsc1') {
            if (this.sortByCompanyNameAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc1 = false;
                //this.getProactiveRenewalData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCompanyNameAsc1 = true;
                //this.getProactiveRenewalData();

            }

        } else if (sortFieldCompName === 'sortByMembershipActivityNameAsc1') {
            if (this.sortByMembershipActivityNameAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByMembershipActivityNameAsc1 = false;
                //this.getProactiveRenewalData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByMembershipActivityNameAsc1 = true;
                //this.getProactiveRenewalData();

            }

        }  else if (sortFieldCompName === 'sortByCurrentSCEAsc1') {
            if (this.sortByCurrentSCEAsc1 === true) {

                console.log('Inside If');
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc1 = false;
                //this.getProactiveRenewalData();

            }
            else {
                // alert('Inside else');
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortByCurrentSCEAsc1 = true;
                //this.getProactiveRenewalData();

            }

        }
        this.getProactiveRenewalData(this.salesCycle,this.filterbycompany1,this.filterbysce1);

    }

    @api
    fetchFilteredProactiveRenewalData(salesCycle,filterByCompanyName,filterBySCE) {
        this.sortSectionName = '';
        this.sortByColumnName = 'Account.Name';
        this.sortByOrder = 'ASC';
        this.sortByEffectiveDateAsc = false;
        this.sortByCompanyNameAsc = true;
        this.sortByMembershipActivityNameAsc = false;
        this.sortByCurrentSCEAsc = false;
        this.sortByEffectiveDateAsc1 = false;
        this.sortByCompanyNameAsc1 = true;
        this.sortByMembershipActivityNameAsc1 = false;
        this.sortByCurrentSCEAsc1 = false;
        this.isSort=false;
        this.filterbycompany1=filterByCompanyName;
        this.filterbysce1=filterBySCE;
        this.currentlyManagingPrctvRnwlList=[];
        this.previouslyManagedPrctvRnwlList=[];
        this.scePicklist1=[];
        this.companyNamePicklist1=[];
        this.getProactiveRenewalData(salesCycle,filterByCompanyName,filterBySCE);
    }

    @api
    clearFilters(filterByCompanyName,filterBySCE) {
        console.log('Inside clearFilter'+this.filterbycompany);
        console.log('Inside clearFilter'+this.filterbysce);
        this.sortSectionName = '';
        this.sortByColumnName = 'Account.Name';
        this.sortByOrder = 'ASC';
        this.sortByEffectiveDateAsc = false;
        this.sortByCompanyNameAsc = true;
        this.sortByMembershipActivityNameAsc = false;
        this.sortByCurrentSCEAsc = false;
        this.sortByEffectiveDateAsc1 = false;
        this.sortByCompanyNameAsc1 = true;
        this.sortByMembershipActivityNameAsc1 = false;
        this.sortByCurrentSCEAsc1 = false;
        this.isSort=false;
        this.filterbycompany1=filterByCompanyName;
        this.filterbysce1=filterBySCE;
        this.currentlyManagingPrctvRnwlList=[];
        this.previouslyManagedPrctvRnwlList=[];
        this.scePicklist1=[];
        this.companyNamePicklist1=[];
        this.getProactiveRenewalData();

    }

    renderedCallback() {
        if (this.template.querySelector('.section-header-style-vpcr-proactive-renewal') === null || this.hasRendered === true) return;
        this.hasRendered = true;
        let style = document.createElement('style');
        style.innerText = `     
            .section-header-sub-vpcr-proactive-renewal .slds-accordion__summary-heading{
                background-color: rgba(210, 223, 247, 0.7) !important;          
                font-size: 14px !important;           
            }
            .section-header-sub-vpcr-proactive-renewal .slds-accordion__summary{
                margin-bottom: .5rem;
            }        
            .section-header-sub-vpcr-proactive-renewal .slds-accordion__section{
                padding-bottom:0px;
            } 
        `;
        this.template.querySelector('.section-header-style-vpcr-proactive-renewal').appendChild(style);
      }


}