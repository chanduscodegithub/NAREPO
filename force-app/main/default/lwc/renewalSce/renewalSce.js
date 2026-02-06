/* eslint-disable no-constant-condition */
/* eslint-disable no-alert */
/* eslint-disable vars-on-top */
/* eslint-disable no-console */

import { LightningElement, track, api } from 'lwc';
import proActiveRenewal from '@salesforce/apex/RenewalController.proactiveRenewal';

export default class RenewalSce extends LightningElement {
    @track proActiveRenewalData;
    @track isProactiveDataListEmpty;

    @track salesCycle = ''; //passed as parameter to apex method
    @track sortByColumnName = ''; //passed as parameter to apex method
    @track sortByOrder = ''; //passed as parameter to apex method

    @track sortEffectiveDateAsc = true;
    @track sortCompanyAsc = false;
    @track sortMembActAsc = true;

    isSort = false;
    isLoad = false;

    connectedCallback() { //executes first (similar to constructor)
        this.getProactiveRenewalData();
        console.log('Coming in constructor on picklist change');
    }


    @api
    salesCycleFromParent(strString) {
        this.sortEffectiveDateAsc = true;
        this.sortCompanyAsc = false;
        this.sortMembActAsc = true;
        this.sortByColumnName = '';
        this.sortByOrder = '';

        this.salesCycle = strString;
        //console.log('salescycle value in child ' + strString);
        this.getProactiveRenewalData();
    }


    getProactiveRenewalData() { //JS function name
        let eventData;
        //let sendDataToParent;
        //this.isSort=false;
        proActiveRenewal({ SalesCycle: this.salesCycle, sortByColumnName: this.sortByColumnName, sortByOrder: this.sortByOrder }) //import statement name
            .then(result => {
                let renewalData = result;
                //console.log('Renewal Comp data ' + JSON.stringify(result));
                if (renewalData !== null && renewalData !== undefined && renewalData.length !== 0 && renewalData[0].hasOwnProperty("MembershipActivityName")) {
                    //console.log('inside main method if');
                    this.isProactiveDataListEmpty = false;
                    this.proActiveRenewalData = result;
                    this.salesCycle = this.proActiveRenewalData[0].salesCycle;

                    //---------- CUSTOM EVENT FOR SENDING DATA TO PARENT FOR PRINTING PURPOSE ----------

                    // Creates the event with the data.
                    //console.log('Data going to parent ' + JSON.stringify(this.proActiveRenewalData));
                    eventData = {
                        'proActiveRenewalData': this.proActiveRenewalData,
                        'isSort': this.isSort
                    };
                    //console.log('Data going to parent ' + JSON.stringify(eventData));
                    const sendDataToParent = new CustomEvent("proactivedatatransfer", {
                        detail: eventData
                    });

                    // Dispatches the event.
                    this.dispatchEvent(sendDataToParent);

                    //---------- CUSTOM EVENT FOR SENDING DATA TO PARENT FOR PRINTING PURPOSE ----------

                }
                else if (renewalData !== null && renewalData !== undefined && renewalData.length !== 0) {
                    //console.log('Inside main method else if')
                    this.isProactiveDataListEmpty = true;
                    this.proActiveRenewalData = result;
                    //console.log('data in else if ' + this.proActiveRenewalData);
                    //console.log('data length in else if ' + this.proActiveRenewalData.length);
                }
                else {
                    //console.log('inside main method else');
                    this.isProactiveDataListEmpty = true;
                }
                this.isLoad = false;
                this.cssDisplay = 'hidemodel';

            })
            .catch(error => {
                //console.log('Error in Proactive Renewal Data' + JSON.stringify(error));

                //---------- CUSTOM EVENT FOR SENDING DATA TO PARENT FOR PRINTING PURPOSE ----------

                // Creates the event with the data.
                //console.log('Data going to parent ' + JSON.stringify(this.proActiveRenewalData));
                eventData = {
                    'proActiveRenewalData': this.proActiveRenewalData,
                    'isSort': this.isSort
                };
                //console.log('Data going to parent ' + JSON.stringify(eventData));
                const sendDataToParent = new CustomEvent("proactivedatatransfer", {
                    detail: eventData
                });

                // Dispatches the event.
                this.dispatchEvent(sendDataToParent);

                //---------- CUSTOM EVENT FOR SENDING DATA TO PARENT FOR PRINTING PURPOSE ----------

                this.isLoad = false;
                this.cssDisplay = 'hidemodel';
            });
    }


    sortFields(event) {
        console.log('inside sort function');
        this.isSort = true;
        this.isLoad = true;
        this.cssDisplay = '';
        //console.log('CHILD isSort sort function ' + this.isSort);

        var selectedItem = event.currentTarget; //identifies the current target for the event, as the event traverses the DOM (particular column in this case)
        var selectedItemToBeSorted = selectedItem.dataset.record;  //dataset.record  ?

        var fieldItagsWithAuraAttrMap = '{"Account.name":"sortCompanyAsc","EffectiveDate__c":"sortEffectiveDateAsc","Name":"sortMembActAsc"}';
        var sortFieldCompNameMap = JSON.parse(fieldItagsWithAuraAttrMap);
        var sortFieldCompName = sortFieldCompNameMap[selectedItemToBeSorted];
        if (sortFieldCompName === 'sortEffectiveDateAsc') {
            if (this.sortEffectiveDateAsc === true) {
                //console.log('Inside EffectiveDate If');
                //console.log('salescycle value inside sort function if ' + this.salesCycle);
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortEffectiveDateAsc = false;
                this.getProactiveRenewalData();

            }
            else {
                //console.log('Inside EffectiveDate else');
                // console.log('salescycle value inside sort function if ' + this.salesCycle);
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortEffectiveDateAsc = true;
                this.getProactiveRenewalData();

            }

        }
        else if (sortFieldCompName === 'sortCompanyAsc') {
            if (this.sortCompanyAsc === true) {
                //console.log('Inside Account If');
                // console.log('salescycle value inside sort function if ' + this.salesCycle);
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCompanyAsc = false;
                this.getProactiveRenewalData();

            }
            else {
                //console.log('Inside Account else');
                // console.log('salescycle value inside sort function if ' + this.salesCycle);
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortCompanyAsc = true;
                this.getProactiveRenewalData();

            }
        }
        else if (sortFieldCompName === 'sortMembActAsc') {
            if (this.sortMembActAsc === true) {
                // console.log('Inside MembAct If');
                //  console.log('salescycle value inside sort function if ' + this.salesCycle);
                this.sortByOrder = 'ASC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortMembActAsc = false;
                this.getProactiveRenewalData();
            }
            else {
                //console.log('Inside MemAct else');
                // console.log('salescycle value inside sort function if ' + this.salesCycle);
                this.sortByOrder = 'DESC';
                this.sortByColumnName = selectedItemToBeSorted;
                this.sortMembActAsc = true;
                this.getProactiveRenewalData();

            }
        }
    }
}