import { LightningElement, api, wire, track } from 'lwc';
//import getfinancialsData from '@salesforce/apex/EBDController.getfinancialsData';
import { refreshApex } from '@salesforce/apex';
export default class EbdFinancials extends LightningElement {
    @api isEditMode;
    @api currentMedicalStr;
    @api surestCurrentStr;
    @api surestNextStr;
    @api ebdId;
    @api recordId;
    wiredresult;
    @api ebdListData;
    _detailedFinancial ={};
    @track financialDisplayData = {};
    @track financialData = [];

    //@api detailedFinancial  = {};
   /* connectedCallback() {
       console.log('detailedFinancialdata',this.detailedFinancial );
       console.log('detailedFinancialdata',JSON.stringify(this.detailedFinancial ));
    }
     @track financialDisplayData = {};
    @track financialData = [];

    connectedCallback() {
        if (this.detailedFinancial && Object.keys(this.detailedFinancial).length) {
            this.processFinancialData();
        }
    }*/
   @api
    get detailedFinancial() {
        return this._detailedFinancial;
    }

    set detailedFinancial(value) {
        this._detailedFinancial = value;
        if (value && Object.keys(value).length > 0) {
            this.processFinancialData();
        }
    }

    processFinancialData() {
        const data = this._detailedFinancial;
        const years = Object.keys(data).sort().reverse().slice(0, 4).reverse();

        const year0 = years[0] || '';
        const year1 = years[1] || '';
        const year2 = years[2] || '';

        const d0 = data[year0] || {};
        const d1 = data[year1] || {};
        const d2 = data[year2] || {};

        this.financialDisplayData = {
            year0,
            year1,
            year2,
            totalMembership0: d0.Total_Membership ?? '',
            totalMembership1: d1.Total_Membership ?? '',
            totalMembership2: d2.Total_Membership ?? '',
            totalRevenue0: d0.Total_Revenue ?? '',
            totalRevenue1: d1.Total_Revenue ?? '',
            totalRevenue2: d2.Total_Revenue ?? '',
            totalUrsRevenue0: d0.Total_Urs ?? '',
            totalUrsRevenue1: d1.Total_Urs ?? '',
            totalUrsRevenue2: d2.Total_Urs ?? '',
            totalUhgRevenue0: d0.Total_UHG ?? '',
            totalUhgRevenue1: d1.Total_UHG ?? '',
            totalUhgRevenue2: d2.Total_UHG ?? '',
            surestMembership0: d0.Surest_Membership ?? '',
            surestMembership1: d1.Surest_Membership ?? '',
            surestMembership2: d2.Surest_Membership ?? '',
            surestRevenue0: d0.Surest_Revenue ?? '',
            surestRevenue1: d1.Surest_Revenue ?? '',
            surestRevenue2: d2.Surest_Revenue ?? '',
            totalId0: d0.Total_Id ?? null,
            totalId1: d1.Total_Id ?? null,
            totalId2: d2.Total_Id ?? null
        };
    }

    get isDisabled0() {
        return !this.financialDisplayData.totalId0;
    }

    get isDisabled1() {
        return !this.financialDisplayData.totalId1;
    }

    get isDisabled2() {
        return !this.financialDisplayData.totalId2;
    }

    handleChange(event) {
        const fieldName = event.target.name;
        const newValue = event.target.value;
        const recordId = event.target.dataset.recordid;

        const updatedRec = {
            Id: recordId,
            [fieldName]: newValue
        };

        const idx = this.financialData.findIndex(r => r.Id === recordId);
        if (idx !== -1) {
            this.financialData[idx] = {
                ...this.financialData[idx],
                [fieldName]: newValue
            };
        } else {
            this.financialData.push(updatedRec);
        }

        this.dispatchEvent(new CustomEvent('ebdchange', {
            detail: { objectType: 'Financial', data: this.financialData }
        }));
    }

    handleInputChange(event) {
        const name = event.target.name;
        let value;

        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        }

        else {
            value = event.target.value;
        }
        this.dispatchEvent(new CustomEvent('ebdchange', {
            detail: { fieldName: name, fieldValue: value }
        }));

    }

    

}