import { LightningElement, track, api } from 'lwc';

export default class SearchResults extends LightningElement {
    @api eachcontact;
    @track eachcontactRecord;
    @track isDisabled = false;
    @track isChecked = false;

    connectedCallback() {
        this.eachcontactRecord = this.eachcontact;
        console.log('Search Component called '+this.eachcontactRecord);
        if(this.eachcontactRecord.hasOwnProperty('Correspondence_Type__c')) {
            if (this.eachcontactRecord['Correspondence_Type__c'].indexOf('Customer Survey - Primary') !== -1) {
                this.isDisabled = true;
                this.isChecked = true;
            } else if (this.eachcontactRecord['Correspondence_Type__c'].indexOf('Customer Survey - Secondary') !== -1) {
                this.isDisabled = true;
                this.isChecked = true;
            }
        }
    }

    handleContactRecord(event) {
        var contactEventData;
        var checkBoxChecked = event.target.checked;
        if (this.eachcontactRecord !== undefined) {
            if (checkBoxChecked) {
                contactEventData = {
                    'newRecord': this.eachcontactRecord, 'index': this.index,
                    'checkBoxChecked': checkBoxChecked
                }
                const evnt = new CustomEvent('addorremovecontact', {
                    // detail contains only primitives
                    detail: contactEventData
                });
                // Fire the event 
                this.dispatchEvent(evnt);
            } else {
                contactEventData = {
                    'newRecord': this.eachcontactRecord, 'index': this.index,
                    'checkBoxChecked': checkBoxChecked
                }
                const evnt = new CustomEvent('addorremovecontact', {
                    // detail contains only primitives
                    detail: contactEventData
                });
                // Fire the event 
                this.dispatchEvent(evnt);
            }
        }
    }
}