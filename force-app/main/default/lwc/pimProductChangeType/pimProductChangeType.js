import { LightningElement, api, wire, track } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import getDifferences from '@salesforce/apex/PimController.getDifferences';
//import updateProductOnPublish from '@salesforce/apex/PimController.updateProductOnPublish';
import updateProductsBulk from '@salesforce/apex/PimController.updateProductsBulk';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import PRODUCT_DISPLAY_ORDER from '@salesforce/schema/PIM_Product_Stage__c.Product_Display_Order_Prod__c';
import { NavigationMixin } from 'lightning/navigation';

import PRODUCT_NAME from '@salesforce/schema/PIM_Product_Stage__c.Product_Name_Stage__c';
import Product_Change_Type__c from '@salesforce/schema/PIM_Product_Stage__c.Product_Change_Type__c';
const FIELDS = [PRODUCT_NAME,PRODUCT_DISPLAY_ORDER,Product_Change_Type__c];


export default class PimProductChangeType extends NavigationMixin(LightningElement) {
    selectedFilter = 'Change in Product';
    @api recordId;
    differences = [];
    hasDifferences = false;
    @track isLoading = true;
    @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
    pimStageRecord;
    get productNameValue() {
        if (!this.pimStageRecord?.data) {
            return '';
        }
        return getFieldValue(this.pimStageRecord.data, PRODUCT_NAME);
    }
    /*get modalHeader() {
        if (this.productNameValue) {
            return `${this.productNameValue} – Change Review`
        }
        else
            return ''
    }*/
    get modalHeader() {
        return this.productNameValue ? `${this.productNameValue} – Change Review` : 'Change Review';
    }
    get hasDisplayOrderChange() {
        if (!this.differences || this.differences.length === 0) {
            return false;
        }

        return this.differences.some(row =>
            row.snapshotField === 'Product_Display_Order_Prod__c'
        );
    }
    get displayOrderValue() {
        return this.pimStageRecord?.data
            ? getFieldValue(this.pimStageRecord.data, PRODUCT_DISPLAY_ORDER)
            : '';
    }


    //isLoading = false; 
    @wire(getDifferences, { stageRecordId: '$recordId' })
    wiredDifferences({ data, error }) {
        if (data) {
            this.isLoading = true;
            this.differences = data;
            this.hasDifferences = data.length > 0;
            this.isLoading = false;
        } else if (error) {
            console.error(error);
            this.showToast(
                'Error',
                'Failed to load differences',
                'error'
            );
        }
    }



    handleUpdate() {
        this.isLoading = true;

       // updateProductOnPublish({stageRecordId: this.recordId,isListView: false})
        updateProductsBulk({ stageIds: [this.recordId], isListView: false,selectedFilter:this.pimStageRecord.data.fields.Product_Change_Type__c.value })
            .then(result => {
                if (!result || result.successCount !== 1) {
                    throw new Error(result?.message || 'Update failed.');
                }

                //const productId = result.productId;
                const productName = result.productName;

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: productName + ' has been updated successfully.',
                        variant: 'success',
                        mode: 'dismissable'
                    })
                );
              this.dispatchEvent(new CustomEvent('publishsuccess'));

                setTimeout(() => {

                    this[NavigationMixin.GenerateUrl]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: result.productId,
                            objectApiName: 'Product2',
                            actionName: 'view'
                        }
                    }).then(url => {
                        window.open(url, '_blank');
                    });

                }, 300);

            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error?.body?.message || error?.message || 'Publish failed',
                        variant: 'error',
                        mode: 'dismissible'
                    })
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
















    /*handleUpdate() {
        this.isLoading = true;

        updateProductOnPublish({
            stageRecordId: this.recordId
        })
            .then(result => {

                const productId = result.productId;
                const productName = result.productName;

                // Lightning navigation link format
                const productUrl = '/lightning/r/Product2/' + productId + '/view';

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: '{0} has been updated successfully.',
                        messageData: [
                            {
                                url: productUrl,
                                label: productName
                            }
                        ],
                        variant: 'success',
                        mode: 'dismissable'
                    })
                );
                 window.open(productUrl, '_blank');

                this.hasDifferences = false;
                this.dispatchEvent(new CustomEvent('publishsuccess'));

            })
            .catch(error => {
                console.error(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error?.body?.message || 'Publish failed',
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }*/


    /* handleUpdate() {
         this.isLoading = true;
         updateProductOnPublish({ stageRecordId: this.recordId,
             diffs: this.differences })
             .then(() => {
                 this.showToast(
                     'Success',
                     'Product updated successfully',
                     'success'
                 );
                 this.hasDifferences = false;
                 this.dispatchEvent(new CustomEvent('publishsuccess'));
 
                // this.dispatchEvent(new CloseActionScreenEvent()); 
             })
             .catch(error => {
                 console.error(error);
                 this.showToast(
                     'Error',
                     error?.body?.message || 'Publish failed',
                     'error'
                 );
             })
             .finally(() => {
                 this.isLoading = false;
             });
     }*/
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}