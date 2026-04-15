import { LightningElement, api, wire, track } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
//import createProduct2 from '@salesforce/apex/PimController.createProduct2';
import bulkCreateProducts from '@salesforce/apex/PimController.bulkCreateProducts';

//import getProductPicklists from '@salesforce/apex/PimController.getProductPicklists';
import getStageValues from '@salesforce/apex/PimController.getStageValues';
import { NavigationMixin } from 'lightning/navigation';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class PimNewProduct extends NavigationMixin(LightningElement) {
    @api recordId;
    pimStageList = [];
    // @track pimStageRecord;
    @api pimStageRecord;
    productPicklists = {};
    fieldErrors = {};
    stageLoaded = false;
    picklistsLoaded = false;
    @track isLoading = true;
    

    connectedCallback() {
        this.loadData();
    }

    loadData() {
        getStageValues({ stageRecordId: this.recordId })
            .then(result => {
                //this.data = result;
                 if (result) {
            this.pimStageList = result;
            this.pimStageRecord = this.pimStageList[0];
            this.stageLoaded = true;
            //this.runValidation();
            this.isLoading = false;
        }
            });
    }

    // @wire(getStageValues, { stageRecordId: '$recordId' })
    // wiredPimStage({ error, data }) {
    //     if (data) {
    //         this.pimStageList = data;
    //         this.pimStageRecord = this.pimStageList[0];
    //         this.stageLoaded = true;
    //         //this.runValidation();
    //         this.isLoading = false;
    //     }
    //     //if (data) {
    //     //  this.pimStageList = data;
    //     //this.pimStageRecord = this.data[0];
    //     //}
    //     else if (error) {
    //         console.error(error)
    //     }
    // }
    /* @wire(getProductPicklists)
     wiredPickLists({ data, error }) {
         if (data) {
             this.productPicklists = data;
             this.picklistsLoaded = true;
             this.runValidation();
 
         }
         else if (error) {
             console.error(error);
 
 
         }
 
     }*/
    get actionHeader() {
        if (!this.pimStageRecord) {
            return '';
        }

        const productName = this.pimStageRecord.Product_Name_Stage__c || '';
        return `${productName} - New Product Creation`;
    }



    /* runValidation() {
         if (!this.stageLoaded || !this.picklistsLoaded) {
             return;
         }
 
         this.fieldErrors = {};
         const s = this.pimStageRecord;
         const p = this.productPicklists;
 
         //Product Family
         this.validatePicklist(
             s.Product_Family_Stage__c,
             p.Family,
             'Family',
             'Product Family',
             false
         );
 
         // Funding Type
         this.validatePicklist(
             s.Funding_Type_Stage__c,
             p.Funding_Type__c,
             'Funding_Type__c',
             'Funding Type',
             false
         );
 
         // Product Line
         this.validatePicklist(
             s.Product_Line_Stage__c,
             p.Product_Line__c,
             'Product_Line__c',
             'Product Line',
             true
         );
 
         // Level 2 Options (Multi)
         this.validateMultiPicklist(
             s.Level_2_Options_Stage__c,
             p.Level_2_Options__c,
             'Level_2_Options__c',
             'Level 2 Options',
             false
         );
 
         // Surest Applicable Products
         this.validatePicklist(
             s.Surest_Applicable_Products_Stage__c,
             p.Surest_Applicable_Products__c,
             'Surest_Applicable_Products__c',
             'Surest Applicable Products',
             false
         );
     }
 
 
     validatePicklist(value, validValues, key, label, isRequired) {
         if (!value) {
             if (isRequired) {
                 this.fieldErrors[key] = `${label} is required.`;
             }
             return;
         }
         if (!validValues.includes(value)) {
             this.fieldErrors[key] =
                 `${label} value does not exist in Product picklist.`;
         }
     }
 
     validateMultiPicklist(value, validValues, key, label, isRequired) {
 
         if (!value) {
             if (isRequired) {
                 this.fieldErrors[key] = `${label} is required.`;
             }
             return;
         }
         const values = value.split(';').map(v => v.trim());
         const invalid = values.filter(v => !validValues.includes(v));
         if (invalid.length > 0) {
             this.fieldErrors[key] =
                 `${label} has invalid values: ${invalid.join(', ')}`;
         }
     }*/

    get hasErrors() {
        return Object.keys(this.fieldErrors).length > 0;
    }

    /*createProduct() {
        this.isLoading = true;
        createProduct2({ stageRecordId: this.recordId })
            .then(result => {
                this[NavigationMixin.GenerateUrl]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result.productId,
                        objectApiName: 'Product2',
                        actionName: 'view'
                    }
                }).then(url => {
                    const fullUrl = window.location.origin + url;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: '{0} has been created successfully.',
                            messageData: [
                                {
                                    url: fullUrl,
                                    label: result.productName
                                }
                            ],
                            variant: 'success',
                            mode: 'sticky'
                        })
                    );
                });

                this.dispatchEvent(new CustomEvent('close'));
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error?.body?.message || 'Create failed',
                        variant: 'error'
                    })
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }*/
    selectedFilter = 'New Product';
    createProduct() {
        if (!this.pimStageRecord?.Product_Display_Order_Stage__c) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Product Display Order (Stage) is required.',
                    variant: 'error',
                    mode: 'dismissable'
                })
            );
            return;
        }
        this.isLoading = true;
        

       // createProduct2({ stageRecordId: this.recordId })
        bulkCreateProducts({stageIds: [this.recordId],isListView: false,selectedFilter:this.selectedFilter})
            .then(result => {

                if (result.successCount !== 1 || !result.productId) {
                    throw new Error(result.message || 'Publish failed');
                }

                const productId = result.productId;
                const productName = result.productName;

                // Show success toast
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: productName + ' has been created successfully.',
                        variant: 'success',
                        mode: 'dismissable'
                    })
                );

                // Wait 1 second → then open in new tab
                setTimeout(() => {

                    this[NavigationMixin.GenerateUrl]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: productId,
                            objectApiName: 'Product2',
                            actionName: 'view'
                        }
                    }).then(url => {
                        window.open(url, '_blank');
                    });

                    // Close quick action after opening tab
                    this.dispatchEvent(new CustomEvent('close'));

                }, 300);

            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error?.body?.message || error?.message || 'Create failed',
                        variant: 'error',
                        mode: 'dismissable'
                    })
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }







    /*   createProduct() {
           createProduct2({ stageRecordId: this.recordId })
               .then(result => {
                   this.isLoading = true;
                   this.dispatchEvent(
                       new ShowToastEvent({
                           title: 'Success',
                           message: '{0} has been created successfully.',
                           messageData: [
                               {
                                   url: '/lightning/r/Product2/' + result.productId + '/view',
                                   label: result.productName
                               }
                           ],
                           variant: 'success',
                            mode: 'dismissable'
                       })
                   );
   
   
                   this.dispatchEvent(new CustomEvent('close'));
               })
               .catch(error => {
                   this.showToast(
                       'Error',
                       error?.body?.message || 'Create failed',
                       'error'
                   );
               })
               .finally(() => {
                   this.isLoading = false;
               });
       }*/



    /*createProduct() {
        createProduct2({ stageRecordId: this.recordId })
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Product created successfully',
                        variant: 'success'
                    })
                );
                this.dispatchEvent(new CustomEvent('close'));
            })

            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message:
                            error?.body?.message ||
                            error?.message ||
                            'Failed to create product',
                        variant: 'error'
                    })
                );
            })

    }*/


    /*createProduct() {
        this.runValidation();
        if (this.hasErrors) return;
    }*/
    handleCancel() {
        this.dispatchEvent(new CustomEvent('close'));
    }

}