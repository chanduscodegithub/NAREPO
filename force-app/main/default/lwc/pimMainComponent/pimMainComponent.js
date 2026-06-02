import { LightningElement, track, api, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import getDifferences from '@salesforce/apex/PimController.getDifferences';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import PRODUCT_CHANGE_TYPE from '@salesforce/schema/PIM_Product_Stage__c.Product_Change_Type__c';
import PRODUCT_NAME from '@salesforce/schema/PIM_Product_Stage__c.Product_Name_Prod__r.Name';
const FIELDS = [PRODUCT_CHANGE_TYPE, PRODUCT_NAME];

export default class PimMainComponent extends LightningElement {
    hasDifferences = false;
    @api recordId;
    @api productId;
    @api differences;
    @api productName;
    

   // wiredDifferences;
    @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
    pimStageRecord;
    get productChangeType() {
        if (!this.pimStageRecord?.data) {
            return '';
        }
        return getFieldValue(this.pimStageRecord.data, PRODUCT_CHANGE_TYPE);
    }
    get productNameValue() {
        if (!this.pimStageRecord?.data) {
            return '';
        }
        return getFieldValue(this.pimStageRecord.data, PRODUCT_NAME);
    }
    get noChange() {
        return this.productChangeType === 'No Change';
    }

    get changeInProduct() {
        return this.productChangeType === 'Change in Product';
    }
    get deactivation() {
        return this.productChangeType === 'Deactivation';
    }

    get newProduct() {
        return this.productChangeType === 'New Product';
    }
    get isChangeFlow() {
        return this.changeInProduct;
    }
    
    get isUnknown() {
        return this.productChangeType === 'UNKNOWN';
    }
    handlePublishSuccess() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
   
}