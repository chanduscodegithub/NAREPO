import { LightningElement, track, wire, api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import getProducts from '@salesforce/apex/PimController.getProducts';
//import getProductPicklists from '@salesforce/apex/PimController.getProductPicklists';
import bulkCreateProducts from '@salesforce/apex/PimController.bulkCreateProducts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDifferencesBulk from '@salesforce/apex/PimController.getDifferencesBulk';
import updateProductsBulk from '@salesforce/apex/PimController.updateProductsBulk';
import { NavigationMixin } from 'lightning/navigation';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import PIM_STAGE_OBJECT from '@salesforce/schema/PIM_Product_Stage__c';
import CHANGE_TYPE_FIELD from '@salesforce/schema/PIM_Product_Stage__c.Product_Change_Type__c';


export default class PimListViewComponent extends NavigationMixin(LightningElement) {
    //selectedFilter = 'Change in Product';
    //@track recordDiffs = {};
    @track showModal = false;

    @track products = [];
    @track selectedRowIds = [];
    @track selectedProducts = [];
    @track currentIndex = 0;
    @track summaryOfProducts = false;
    @track productWarnings = {};
    @track fieldWarnings = {};
    productPicklists;
    @track recordDiffs = {};
    @track isLoading = false;
     @track filterOptions = [];
    recordTypeId;
    selectedFilter = 'Change in Product';

    /*@wire(getProductPicklists)
    wiredPicklists({ data, error }) {
        if (data) {
            this.productPicklists = data;
        } else if (error) {
            console.error(error);
        }
    }*/


    columns = [
         { label: 'S.No', fieldName: 'rowNumber', type: 'number', fixedWidth: 70,hideDefaultActions: true,cellAttributes: {
        alignment: 'center'
    } },

        {
            label: 'Product Name',
            fieldName: 'productLink',
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Product_Name_Stage__c' },
                target: '_blank'
            },
            wrapText: true,
            hideDefaultActions: true
        },
        { label: 'Product Line', fieldName: 'Product_Line_Stage__c', hideDefaultActions: true },
        { label: 'Product Code', fieldName: 'Product_Code_Stage__c', hideDefaultActions: true },
        { label: 'Product Display Order(Current)', fieldName: 'Product_Display_Order_Prod__c', hideDefaultActions: true },
        { label: 'Product Display Order(To be Updated)', fieldName: 'Product_Display_Order_Stage__c', hideDefaultActions: true },
        // { label: 'Change Type', fieldName: 'Product_Change_Type__c', hideDefaultActions: true },
        { label: 'Change Tracker', fieldName: 'Change_Tracker__c', hideDefaultActions: true, wrapText: true}
    ];
    @wire(getObjectInfo, { objectApiName: PIM_STAGE_OBJECT })
    objectInfo({ data }) {
        if (data) {
            this.recordTypeId = data.defaultRecordTypeId;
        }
    }
    @wire(getPicklistValues, {
        recordTypeId: '$recordTypeId',
        fieldApiName: CHANGE_TYPE_FIELD
    })
    wiredPicklistValues({ data, error }) {
        if (data) {

            const allowedValues = [
                'Change in Product',
                'New Product', 'Deactivation'
            ];

            this.filterOptions = data.values
                .filter(v => allowedValues.includes(v.value))
                .map(v => ({
                    label: v.label,
                    value: v.value
                }));

        } else if (error) {
            console.error(error);
        }
    }
    handleFilterMenuSelect(event) {
        this.selectedFilter = event.detail.value;
        this.loadProducts();
    }

    get isFilterSelected() {
        return this.selectedFilter !== '';
    }
    connectedCallback() {
        this.loadProducts();
    }


    loadProducts() {
        this.isLoading = true;
        getProducts({ filterType: this.selectedFilter })
            .then(result => {
                //this.products = result;
                this.products = result.map((record,index) => {
                    return {
                        ...record,
                         rowNumber: index + 1,
                        productLink: `/lightning/r/PIM_Product_Stage__c/${record.Id}/view`
                    };
                });
                this.selectedRowIds = [];
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
    handleRowSelection(event) {
        this.selectedRowIds = event.detail.selectedRows.map(row => row.Id);
    }
    get isReviewDisabled() {
        return this.selectedRowIds.length === 0;
    }

    handleReview() {
        if (!this.selectedRowIds.length) return;

        this.selectedProducts = this.products.filter(p =>
            this.selectedRowIds.includes(p.Id)
        );

        this.currentIndex = 0;

        if (this.isChangeReview) {
            this.isLoading = true;
            this.loadDifferences();
        } else {
            this.showModal = true;


        }
    }
    /*get modalHeader() {
        const productName = this.pimStageRecord?.Product_Name_Stage__c || this.pimStageRecord?.Product_Name__c || '';
        if (!productName) {
            return this.isChangeReview
                ? 'Change Review'
                : 'New Product';
        }
        if (this.isChangeReview) {
            return `${productName} – Change Review`;
        }
        if (this.isNewProductReview) {
            return `${productName} – New Product`;
        }
        return '';
    }*/
     get modalHeader() {
    const productName =
        this.pimStageRecord?.Product_Name_Stage__c ||
        this.pimStageRecord?.Product_Name__c ||
        '';

    if (!productName) {
        if (this.selectedFilter === 'Deactivation') {
            return 'Deactivate';
        }
        if (this.selectedFilter === 'New Product') {
            return 'New Product';
        }
        return 'Change Review';
    }

    if (this.selectedFilter === 'Deactivation') {
        return `${productName} – Deactivate`;
    }

    if (this.selectedFilter === 'Change in Product') {
        return `${productName} – Change Review`;
    }

    if (this.selectedFilter === 'New Product') {
        return `${productName} – New Product`;
    }

    return '';
}

    get hasDisplayOrderChangeBulk() {
        if (!this.currentRecordDiff || !this.currentRecordDiff.diffs) {
            return false;
        }

        return this.currentRecordDiff.diffs.some(row =>
            row.stageField === 'Product_Display_Order_Stage__c'
        );
    }
    get hasDisplayOrderForCreateBulk() {
        return this.isNewProductReview &&
            this.pimStageRecord?.Product_Display_Order_Stage__c;
    }



    loadDifferences() {
        this.isLoading = true;
        getDifferencesBulk({ stageIds: this.selectedRowIds })
            .then(data => {
                this.recordDiffs = data;
                this.showModal = true;
            })
            .catch(err => this.showToast(
                'Error',
                err?.body?.message || 'Failed to load differences',
                'error'
            ))
            .finally(() => {
                this.isLoading = false;
            });
    }
    /*get recordDiffArray() {
        return Object.keys(this.recordDiffs).map(stageId => ({
            stageId,
            diffs: this.recordDiffs[stageId]
        }));
    }*/
    get recordDiffArray() {
        return this.selectedProducts.map(product => ({
            stageId: product.Id,
            diffs: this.recordDiffs[product.Id] || []
        }));
    }


    get recordDiffList() {
        return Object.keys(this.recordDiffs || {}).map(stageId => {
            return {
                stageId,
                diffs: this.recordDiffs[stageId]
            };
        });
    }

    get isChangeReview() {
        return this.selectedFilter === 'Change in Product'
            || this.selectedFilter === 'Deactivation';
    }

    get isNewProductReview() {
        return this.selectedFilter === 'New Product';
    }

    get isDeactivationReview() {
        return this.selectedFilter === 'Deactivation';
    }

    get primaryActionLabel() {
        return this.isNewProductReview
            ? 'Create Product'
            : 'Quick Publish';
    }

    get currentRecordDiff() {
        if (!this.recordDiffArray || !this.recordDiffArray.length) {
            return null;
        }
        return this.recordDiffArray[this.currentIndex];
    }

    handlePublish() {
        if (this.isNewProductReview) {
            this.createProducts();
        } else {
            this.updateProducts();
        }
    }

    createProducts() {
        const invalidRecords = this.selectedProducts.filter(
            record =>
                record.Product_Display_Order_Stage__c === null ||
                record.Product_Display_Order_Stage__c === undefined
        );

        if (invalidRecords.length > 0) {
            this.showToast(
                'Error',
                'Product Display Order (Stage) is required for all selected records.',
                'error'
            );
            return;
        }
        this.isLoading = true;
        bulkCreateProducts({ stageIds: this.selectedRowIds,isListView: true})
            .then(result => {
                const message =
                    `${result.successCount} / ${result.totalCount} ` +
                    `have been successfully published. ` +
                    `Please check your email for more details.`;

                this.showToast(
                    'Quick Publish Summary',
                    message,
                    result.errorCount > 0 ? 'warning' : 'success'
                );
            })
            .catch(err => {
                this.showToast(
                    'Error',
                    err?.body?.message || 'Publish failed',
                    'error'
                );
            })
            .finally(() => {
                this.isLoading = false;
                this.hideModal();
            });
    }
    updateProducts() {
        this.isLoading = true;
        updateProductsBulk({ stageIds: this.selectedRowIds,isListView: true})
            .then(result => {
                const message =
                    `${result.successCount} / ${result.totalCount} ` +
                    `have been successfully published. ` +
                    `Please check your email for more details.`;

                this.showToast(
                    'Quick Publish Summary',
                    message,
                    result.errorCount > 0 ? 'warning' : 'success'
                );
            })
            .catch(err => {
                this.showToast(
                    'Error',
                    err?.body?.message || 'Publish failed',
                    'error'
                );
            })
            .finally(() => {
                this.isLoading = false;
                this.hideModal();
            });
    }

    /*updateProducts() {
        this.isLoading = true;
        updateProductsBulk({ stageIds: this.selectedRowIds })
            .then(() => this.showToast(
                'Success',
                'Products updated successfully',
                'success'
            ))
            .catch(err => this.showToast(
                'Error',
                err?.body?.message || 'Update failed',
                'error'
            ))
            .finally(() => {
            this.hideModal();
            this.isLoading = false;
            });
    }*/
    hideModal() {
        this.showModal = false;
        this.currentIndex = 0;
        this.selectedProducts = [];
        this.selectedRowIds = [];
        this.recordDiffs = {};
        this.loadProducts();
    }

    get pimStageRecord() {
        return this.selectedProducts[this.currentIndex];
    }

    get isFirst() {
        return this.currentIndex === 0;
    }
    get isLast() {
        return this.currentIndex === this.selectedProducts.length - 1;
    }
    handleNext() {
        if (!this.isLast) {
            this.currentIndex++;
            const rec = this.selectedProducts[this.currentIndex];
            this.fieldWarnings = this.productWarnings[rec.Id] || {};
        }
    }

    handlePrevious() {
        if (!this.isFirst) {
            this.currentIndex--;
            const rec = this.selectedProducts[this.currentIndex];
            this.fieldWarnings = this.productWarnings[rec.Id] || {};
        }
    }
    get totalProducts() {
        return this.selectedProducts?.length || 0;
    }

    get currentProductNumber() {
        return this.currentIndex + 1;
    }

    get productCounterLabel() {
        return `${this.currentProductNumber}/${this.totalProducts}`;
    }



    handleRemove() {
        const removedProduct = this.selectedProducts[this.currentIndex];
        this.selectedProducts.splice(this.currentIndex, 1);

        this.selectedRowIds = this.selectedRowIds.filter(
            id => id !== removedProduct.Id
        );

        // if (this.productWarnings) {
        //     delete this.productWarnings[removedProduct.Id];
        // }
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Removed',
                message: `${removedProduct.Product_Name_Stage__c} has been removed.`,
                variant: 'info'
            })
        );

        if (this.currentIndex >= this.selectedProducts.length) {
            this.currentIndex = this.selectedProducts.length - 1;
        }

        if (this.selectedProducts.length === 0) {
            
            //this.summaryOfProducts = false;
            this.hideModal();
            return;
        }

        const nextProduct = this.selectedProducts[this.currentIndex];
        this.fieldWarnings =
            this.productWarnings?.[nextProduct.Id] || {};
    }


   /* handleSave() {
        console.log('Bulk Save Products:', this.selectedProducts);
        this.summaryOfProducts = false;
        this.selectedRowIds = [];
    }*/

    // hideModal() {
    //     this.summaryOfProducts = false;
    //     this.selectedRowIds = [];
    // }


   // closeQuickAction() {
    handleCancel(){
        this.selectedRowIds = [];
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'PIM_Product_Stage__c',
                actionName: 'list'
            },
            state: {
                filterName: 'Recent'
            }
        });
    }

    /* validateNewProduct(stageRec) {
         const warnings = {};
         const p = this.productPicklists;
 
         if (stageRec.Funding_Type_Stage__c &&
             !p.Funding_Type__c.includes(stageRec.Funding_Type_Stage__c)) {
             warnings.Funding_Type__c =
                 'Funding Type value does not exist in Product picklist';
         }
 
         if (!stageRec.Product_Line_Stage__c) {
             warnings.Product_Line__c = 'Product Line is required';
         } else if (!p.Product_Line__c.includes(stageRec.Product_Line_Stage__c)) {
             warnings.Product_Line__c =
                 'Product Line value does not exist in Product picklist';
         }
 
         if (stageRec.Level_2_Options_Stage__c) {
             const values = stageRec.Level_2_Options_Stage__c.split(';');
             const invalid = values.filter(v => !p.Level_2_Options__c.includes(v));
             if (invalid.length) {
                 warnings.Level_2_Options__c =
                     `Invalid values: ${invalid.join(', ')}`;
             }
         }
 
         return warnings;
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