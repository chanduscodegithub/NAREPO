import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';


import NAME_FIELD from '@salesforce/schema/Account.Name';
import DIRECT_FIELD from '@salesforce/schema/Account.Direct_Marketing_Stage__c';
import TIER_FIELD from '@salesforce/schema/Account.Company_Tier_Medical__c';
import BUSINESS_FIELD from '@salesforce/schema/Account.Subtype__c';
import LAST_FIELD from '@salesforce/schema/Account.Last_Action_Taken__c';
import NEXT_FIELD from '@salesforce/schema/Account.Next_Action_to_be_Taken__c';

import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import RECORDTYPE_FIELD from '@salesforce/schema/Account.RecordTypeId';


const FIELDS = [
    NAME_FIELD,
    DIRECT_FIELD,
    TIER_FIELD,
    BUSINESS_FIELD,
    LAST_FIELD,
    NEXT_FIELD,RECORDTYPE_FIELD
];

const TARGET_RECORDTYPE_DEV_NAME = 'Prospect';

export default class CDQuickUpdates extends LightningElement {

    @api recordId;
    isLoading = true;
    recordTypeId;

    stageOptions = [];
    tierOptions = [];

    allTierValues = [];
    tierControllerValues = {};

    accountName;
    directMarketingStage;
    companyTier;
    businessLine;
    lastAction;
    nextAction;

    // 🔹 Get Record Type
    // @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    // objectInfo({ data }) {
    //     if (data) {
    //         const rtInfos = data.recordTypeInfos;

    //         this.recordTypeId = Object.keys(rtInfos).find(rtId =>
    //             rtInfos[rtId].name === TARGET_RECORDTYPE_DEV_NAME
    //         );

    //         if (!this.recordTypeId) {
    //             this.recordTypeId = data.defaultRecordTypeId;
    //         }
    //     }
    // }

    // 🔹 Get ALL picklists together (BEST PRACTICE)
    @wire(getPicklistValuesByRecordType, {
        objectApiName: ACCOUNT_OBJECT,
        recordTypeId: '$recordTypeId'
    })
    wiredPicklists({ data }) {
        if (data) {
            const picklists = data.picklistFieldValues;

            // Stage
            this.stageOptions = picklists[DIRECT_FIELD.fieldApiName].values.map(v => ({
                label: v.label,
                value: v.value
            }));

            // Dependent Tier
            this.allTierValues = picklists[TIER_FIELD.fieldApiName].values;
            this.tierControllerValues = picklists[TIER_FIELD.fieldApiName].controllerValues;

            this.filterTierOptions();
            this.isLoading = false;
        }
    }

    // 🔹 Get Account Data
@wire(getRecord, { recordId: '$recordId', fields: FIELDS })
wiredAccount({ data }) {
    if (data) {
        this.accountName = data.fields.Name.value;
        this.recordTypeId = data.fields.RecordTypeId.value; // 👈 KEY CHANGE

        this.directMarketingStage = data.fields.Direct_Marketing_Stage__c?.value;
        this.companyTier = data.fields.Company_Tier_Medical__c?.value;
        this.businessLine = data.fields.Subtype__c?.value;
        this.lastAction = data.fields.Last_Action_Taken__c?.value;
        this.nextAction = data.fields.Next_Action_to_be_Taken__c?.value;

        this.filterTierOptions();
        this.isLoading = false;
    }
}

    // 🔹 Dependent filtering
    filterTierOptions() {
        if (!this.businessLine || !this.allTierValues.length) {
            this.tierOptions = [];
            return;
        }

        const controllerKey = this.tierControllerValues[this.businessLine];

        this.tierOptions = this.allTierValues
            .filter(opt => opt.validFor.includes(controllerKey))
            .map(opt => ({
                label: opt.label,
                value: opt.value
            }));

        // reset invalid
        if (!this.tierOptions.some(opt => opt.value === this.companyTier)) {
            this.companyTier = null;
        }
    }

    // 🔹 Handle Change
    handleChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;

        switch (field) {
            case 'Direct_Marketing_Stage__c':
                this.directMarketingStage = value;
                break;
            case 'Company_Tier_Medical__c':
                this.companyTier = value;
                break;
            case 'Last_Action_Taken__c':
                this.lastAction = value;
                break;
            case 'Next_Action_to_be_Taken__c':
                this.nextAction = value;
                break;
        }
    }

    // 🔹 Save
    handleSave() {
        this.isLoading = true;
        const fields = {
            Id: this.recordId,
            [DIRECT_FIELD.fieldApiName]: this.directMarketingStage,
            [TIER_FIELD.fieldApiName]: this.companyTier,
            [LAST_FIELD.fieldApiName]: this.lastAction,
            [NEXT_FIELD.fieldApiName]: this.nextAction
        };

        updateRecord({ fields })
            .then(() => {
                this.showToast('Success', 'Account updated successfully', 'success');
                this.dispatchEvent(new CloseActionScreenEvent());

                const event = new CustomEvent('myevent', {
                    detail: {
                        message: 'Account updated successfully'
                    }
                });
                this.dispatchEvent(event);
            })
            .catch(error => {

                const event = new CustomEvent('myevent1', {
                    detail: {
                        message: 'Error'
                    }
                });
                this.dispatchEvent(event);
                this.isLoading = false;
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}