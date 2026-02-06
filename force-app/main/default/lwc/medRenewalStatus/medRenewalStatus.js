/* eslint-disable no-constant-condition */
/* eslint-disable no-alert */
/* eslint-disable vars-on-top */
/* eslint-disable no-console */

import { LightningElement, wire, track, api } from 'lwc';
import proActiveRenewal from '@salesforce/apex/RenewalStatusController.proactiveRenewal';
import fullyValLabel from '@salesforce/label/c.ICM_SCE_ProactiveRenewal_FullyVal';
import pendQualLabel from '@salesforce/label/c.ICM_SCE_ProactiveRenewal_PendingQual';
import actionNeededLabel from '@salesforce/label/c.ICM_SCE_ProactiveRenewal_ActionNeeded';

import pendingQualInstructionText from '@salesforce/label/c.Pending_Qual_Instruction_Text';


export default class RenewalSce extends LightningElement {
    @track proActiveRenewalData;
    @track isProactiveDataListEmpty;

    @track salesCycle = ''; //passed as parameter to apex method
    @track sortByColumnName = ''; //passed as parameter to apex method
    @track sortByOrder = ''; //passed as parameter to apex method

    @track sortEffectiveDateAsc = true;
    @track sortCompanyAsc = false;
    @track sortMembActAsc = true;

    //--------------FULLY VAL--------------
    @track sortEffectiveDateAscFV = true;
    @track sortCompanyAscFV = false;
    @track sortMembActAscFV = true;
    //--------------FULLY VAL--------------

    isSort = false;
    isLoad = false;

    @track pendingQualData;
    @track fullyValData;

    @track isPendingQualListEmpty;
    @track isFullyValListEmpty;



    connectedCallback() { //executes first (similar to constructor)
        console.log('Inside Constructor');
        this.getProactiveRenewalData();
        //console.log('CHILD isSort constructor ' + this.isSort);
        this.actionNeededLabel = actionNeededLabel;
        this.pendQualLabel = pendQualLabel;
        this.fullyValLabel = fullyValLabel;

        this.pendingQualInstructionText = pendingQualInstructionText;
    }


    @api
    salesCycleFromParent(strString) {
        this.sortEffectiveDateAsc = true;
        this.sortCompanyAsc = false;
        this.sortMembActAsc = true;

        this.sortEffectiveDateAscFV = true;
        this.sortCompanyAscFV = false;
        this.sortMembActAscFV = true;

        this.sortByColumnName = '';
        this.sortByOrder = '';

        console.log('coming inside salesCycleFromParent');
        this.salesCycle = strString;
        console.log('salescycle value in child ' + this.salesCycle);
        this.getProactiveRenewalData();
    }


    getProactiveRenewalData(dataFrom) { //JS function name
        let eventData;
        let pqList = [];
        let fvList = [];
        console.log('inside main method');
        proActiveRenewal({ SalesCycle: this.salesCycle, sortByColumnName: this.sortByColumnName, sortByOrder: this.sortByOrder }) //import statement name
            .then(result => {
                let renewalData = result;
                console.log('result ' + result);
                if (renewalData !== null && renewalData !== undefined && renewalData.length !== 0 && renewalData[0].hasOwnProperty("MembershipActivityName")) {
                    console.log('inside main method if');
                    this.isProactiveDataListEmpty = false;
                    this.proActiveRenewalData = result;
                    this.salesCycle = this.proActiveRenewalData[0].salesCycle;

                    //console.log('type of proactive renewal ' + typeof (this.proActiveRenewalData));

                    renewalData.forEach(function (arrayItems) {
                        if (arrayItems.IncentiveStatus.includes('Pending Qualification')) {
                            pqList.push(arrayItems);
                        }
                        else {
                            fvList.push(arrayItems);
                        }
                    });
                    console.log('pqList ' + JSON.stringify(pqList));
                    console.log('fvList ' + JSON.stringify(fvList));

                    // this.isPendingQualListEmpty;
                    // this.isFullyValListEmpty;

                    if (dataFrom === 'pendingQualification') {
                        console.log('only pq data is coming');
                        this.pendingQualData = pqList;
                    }
                    else if (dataFrom === 'fullyValidated') {
                        console.log('only fv data is coming');
                        this.fullyValData = fvList;
                    }
                    else {
                        console.log('both data are coming');
                        this.pendingQualData = pqList;
                        this.fullyValData = fvList;

                        if (fvList.length == 0 && pqList.length > 0) {
                            console.log('fvList Null and pqList not null');
                            this.isPendingQualListEmpty = false;
                            this.isFullyValListEmpty = true;
                        }
                        else if (pqList.length == 0 && fvList.length > 0) {
                            console.log('pqList Null and fvList not null');
                            this.isPendingQualListEmpty = true;
                            this.isFullyValListEmpty = false;
                        }
                        else if (fvList.length == 0 && pqList.length == 0) {
                            console.log('both lists are null');
                            this.isPendingQualListEmpty = true;
                            this.isFullyValListEmpty = true;
                        }
                        else if (fvList.length > 0 && pqList.length > 0) {
                            console.log('both lists are not null');
                            this.isPendingQualListEmpty = false;
                            this.isFullyValListEmpty = false;
                        }
                    }

                    //---------- CUSTOM EVENT FOR SENDING DATA TO PARENT FOR PRINTING PURPOSE ----------

                    // Creates the event with the data.
                    eventData = {
                        //'proActiveRenewalData': this.proActiveRenewalData,
                        'isSort': this.isSort,
                        'pendingQualList': this.pendingQualData,
                        'fullyValList': this.fullyValData
                    };
                    console.log('Data going to parent ' + JSON.stringify(eventData));
                    const sendDataToParent = new CustomEvent("proactivedatatransfer", {
                        detail: eventData
                    });

                    // Dispatches the event.
                    this.dispatchEvent(sendDataToParent);

                    //---------- CUSTOM EVENT FOR SENDING DATA TO PARENT FOR PRINTING PURPOSE ----------

                }
                else if (renewalData !== null && renewalData !== undefined && renewalData.length !== 0) {
                    console.log('Inside main method else if')
                    this.isProactiveDataListEmpty = true;
                    this.proActiveRenewalData = result;

                    this.pendingQualData = '';
                    this.fullyValData = '';

                    this.isPendingQualListEmpty = true;
                    this.isFullyValListEmpty = true;
                }
                else {
                    console.log('Inside main method else');
                    this.isProactiveDataListEmpty = true;

                    this.pendingQualData = '';
                    this.fullyValData = '';

                    this.isPendingQualListEmpty = true;
                    this.isFullyValListEmpty = true;
                }

                //this.isLoad = false;
                this.cssDisplay = 'hidemodel';
                //console.log('cssDisplay value ' + this.cssDisplay);

            })
            .catch(error => {
                //console.log('Error in Proactive Renewal Data' + JSON.stringify(error));

                // //---------- CUSTOM EVENT FOR SENDING DATA TO PARENT FOR PRINTING PURPOSE ----------

                // // Creates the event with the data.

                // eventData = {
                //     //'proActiveRenewalData': this.proActiveRenewalData,
                //     'isSort': this.isSort,
                //     'pendingQualList': this.pendingQualData,
                //     'fullyValList': this.fullyValData
                // };
                // const sendDataToParent = new CustomEvent("proactivedatatransfer", {
                //     detail: eventData
                // });

                // console.log('Data going to parent ' + this.eventData);

                // // Dispatches the event.
                // this.dispatchEvent(sendDataToParent);

                // //---------- CUSTOM EVENT FOR SENDING DATA TO PARENT FOR PRINTING PURPOSE ----------


                //this.isLoad = false;
                this.cssDisplay = 'hidemodel';
                //console.log('cssDisplay value ' + this.cssDisplay);
            });
    }


    sortFields(event) {
        console.log('pendingQualData inside sort ' + JSON.stringify(this.pendingQualData));
        console.log('fullyValData inside sort ' + JSON.stringify(this.fullyValData));
        console.log('inside sort function');
        console.log('inside pendQual sort');
        this.isSort = true;
        this.isLoad = true;
        this.cssDisplay = '';
        console.log('CHILD isSort sort function ' + this.isSort);

        var selectedItem = event.currentTarget; //identifies the current target for the event, as the event traverses the DOM (particular column in this case)
        var selectedItemToBeSorted = selectedItem.dataset.record;  //dataset.record  ?
        var selectedItemFrom = selectedItem.dataset.from;

        var fieldItagsWithAuraAttrMap = '{"Account.name":"sortCompanyAsc","EffectiveDate__c":"sortEffectiveDateAsc","Name":"sortMembActAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];

        if (sortFieldCompName === 'sortEffectiveDateAsc' && selectedItemFrom === 'pendingQualification') {
            console.log('block 1');
            if (this.sortEffectiveDateAsc === true) {
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortEffectiveDateAsc = false;
                this.getProactiveRenewalData(selectedItemFrom);

            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortEffectiveDateAsc = true;
                this.getProactiveRenewalData(selectedItemFrom);

            }

        }
        else if (sortFieldCompName === 'sortCompanyAsc' && selectedItemFrom === 'pendingQualification') {
            console.log('block 2');
            if (this.sortCompanyAsc === true) {
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCompanyAsc = false;
                this.getProactiveRenewalData(selectedItemFrom);

            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCompanyAsc = true;
                this.getProactiveRenewalData(selectedItemFrom);

            }
        }
        else if (sortFieldCompName === 'sortMembActAsc' && selectedItemFrom === 'pendingQualification') {
            console.log('block 3');
            if (this.sortMembActAsc === true) {
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortMembActAsc = false;
                this.getProactiveRenewalData(selectedItemFrom);
            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortMembActAsc = true;
                this.getProactiveRenewalData(selectedItemFrom);
            }
        }

        var fieldItagsWithAuraAttrMapFV = '{"Account.name":"sortCompanyAscFV","EffectiveDate__c":"sortEffectiveDateAscFV","Name":"sortMembActAscFV"}';
        var sortFieldCompNameMapFV = JSON.parse(fieldItagsWithAuraAttrMapFV);
        var sortFieldCompNameFV = sortFieldCompNameMapFV[selectedItemToBeSorted];

        if (sortFieldCompNameFV === 'sortEffectiveDateAscFV' && selectedItemFrom === 'fullyValidated') {
            console.log('block 4');
            if (this.sortEffectiveDateAscFV === true) {
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortEffectiveDateAscFV = false;
                this.getProactiveRenewalData(selectedItemFrom);

            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortEffectiveDateAscFV = true;
                this.getProactiveRenewalData(selectedItemFrom);

            }

        }
        else if (sortFieldCompNameFV === 'sortCompanyAscFV' && selectedItemFrom === 'fullyValidated') {
            console.log('block 5');
            if (this.sortCompanyAscFV === true) {
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCompanyAscFV = false;
                this.getProactiveRenewalData(selectedItemFrom);

            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCompanyAscFV = true;
                this.getProactiveRenewalData(selectedItemFrom);

            }
        }
        else if (sortFieldCompNameFV === 'sortMembActAscFV' && selectedItemFrom === 'fullyValidated') {
            console.log('block 6');
            if (this.sortMembActAscFV === true) {
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortMembActAscFV = false;
                this.getProactiveRenewalData(selectedItemFrom);
            }
            else {
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortMembActAscFV = true;
                this.getProactiveRenewalData(selectedItemFrom);
            }
        }
    }














    /*handleGrowthSentSortdata(event) {
        console.log('Entering new sort function');
        this.cssDisplay = '';

        // field name
        var selectedItem = event.currentTarget;
        console.log('selectedItem ' + selectedItem);

        this.growthSentSortBy = selectedItem.dataset.record;
        console.log('this.growthSentSortBy ' + this.growthSentSortBy);


        // calling sortdata function to sort the data based on direction and selected field
        if (this.growthSentSortBy == 'EffectiveDate__c') {
            console.log('inside effective date if');
            console.log('this.growthSentSortBy ' + this.growthSentSortBy);

            if (this.growthSentEffectiveDateSortDirection == true) {
                console.log('inside effective date 1st if');
                this.sortData(this.growthSentSortBy, 'asc', 'pq');
            }
            else {
                console.log('inside effective date 1st else');
                this.sortData(this.growthSentSortBy, 'des', 'pq');
            }
            if (this.growthSentEffectiveDateSortDirection == true) {
                console.log('inside effective date 2nd if');
                this.growthSentEffectiveDateSortDirection = false;
            }
            else {
                console.log('inside effective date 2nd else');
                this.growthSentEffectiveDateSortDirection = true;
            }
        }
        if (this.growthSentSortBy == 'Account.name') {
            console.log('Inside account name if');
            if (this.growthSentCompanySortDirection == true) {
                console.log('Inside account name 1st if');
                this.sortData(this.growthSentSortBy, 'asc', 'pq');
            } 
            else {
                console.log('Inside account name 1st else');
                this.sortData(this.growthSentSortBy, 'des', 'pq');
            }
            if (this.growthSentCompanySortDirection == true) {
                console.log('Inside account name 2nd if');
                this.growthSentCompanySortDirection = false;
            } 
            else {
                console.log('Inside account name 2nd else');
                this.growthSentCompanySortDirection = true;
            }
        }
        if (this.growthSentSortBy == 'Name') {
            console.log('Inside opp if');
            if (this.growthSentMembershipActivitySortDirection == true) {
                console.log('Inside opp 1st if');
                this.sortData(this.growthSentSortBy, 'asc', 'pq');
            } 
            else {
                console.log('Inside opp 1st else');
                this.sortData(this.growthSentSortBy, 'des', 'pq');
            }
            if (this.growthSentMembershipActivitySortDirection == true) {
                console.log('Inside opp 2nd if');
                this.growthSentMembershipActivitySortDirection = false;
            } 
            else {
                console.log('Inside opp 2nd else');
                this.growthSentMembershipActivitySortDirection = true;
            }
        }
        this.cssDisplay = 'hidemodel';
    }


    sortData(fieldname, direction, section) {
        console.log('inside sort data');
        // serialize the data before calling sort function
        let parseData = '';
        if (section == 'pq') {
            console.log('inside pq section');
            parseData = JSON.parse(JSON.stringify(this.pendingQualData));
            //console.log('Parse Data '+JSON.stringify(parseData));
        }
        if (section == 'fv') {
            parseData = JSON.parse(JSON.stringify(this.fullyValData));
        }


        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };

        // cheking reverse direction 
        let isReverse = direction === 'asc' ? 1 : -1;

        // sorting data 
        if (parseData != null && parseData != undefined && parseData.length != 0) {
            parseData.sort((x, y) => {
                x = keyValue(x) ? keyValue(x) : ''; // handling null values
                y = keyValue(y) ? keyValue(y) : '';

                // sorting values based on direction
                return isReverse * ((x > y) - (y > x));
            });
        }


        // set the sorted data to data table data
        if (section === 'pq') {
            this.pendingQualData = parseData;
            //console.log('pending Qual data finally '+JSON.stringify(this.pendingQualData));
        }
        if (section === 'fv') {
            this.fullyValData = parseData;
        }
    }*/
}