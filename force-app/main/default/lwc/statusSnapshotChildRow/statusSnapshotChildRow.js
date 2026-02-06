import { LightningElement, track, api } from 'lwc';

export default class StatusSnapshotChildRow extends LightningElement {
    @api row;
    //@api eachdata;
    @api type;

    @track ifNotSent = false;
    @track ifSent = false;
    @track ifGrowth = false;
    @track isSpecialtyUser = false;
    @track redFlag = false;
    @track effectiveDate = '';

    @api issbsceuser;
    @api iscmsceuser;

    @track eachValueChange;
    @track isGreaterThanZero;
    @track isNotYetSentGreaterThanZero;

    @api
    get eachdata() {
        return this.eachValueChange;
    }
    set eachdata(value) {
        this.eachValueChange = value;

        if (this.eachValueChange.noOfProductsNotYetConfirmed > 0) {
            this.isGreaterThanZero = true;
        } else {
            this.isGreaterThanZero = false;
        }

        if (this.eachValueChange.noOfProductsNotYetSent > 0) {
            this.isNotYetSentGreaterThanZero = true;
        } else {
            this.isNotYetSentGreaterThanZero = false;
        }

    }
    connectedCallback() {
        let eachValueChange = {};
        eachValueChange = Object.assign({}, this.eachdata);
        this.eachValueChange = eachValueChange;

        if (this.type == 'RetentionNotSent') {
            this.ifNotSent = true;
        }
        if (this.type == 'RetentionSent') {
            this.ifSent = true;
        }
        if (this.type == 'GrowthNotSent') {
            this.ifGrowth = true;
            this.ifNotSent = true;
        }
        if (this.type == 'GrowthSent') {
            this.ifGrowth = true;
            this.ifSent = true;
        }
        if (this.type == 'SpecialtyGrowthNotSent') {
            this.isSpecialtyUser = true;
            this.ifGrowth = true;
            this.ifNotSent = true;
        }
        if (this.type == 'SpecialtyGrowthSent') {
            this.isSpecialtyUser = true;
            this.ifGrowth = true;
            this.ifSent = true;
        }
        if (this.eachdata.infoExtractedByICT == 'NO INFO EXTRACTED') {
            this.redFlag = true;
        }
        if (this.issbsceuser) {
            this.issbsceuser = true;
        }
        if (this.iscmsceuser) {
            this.iscmsceuser = true;
        }

    }
}