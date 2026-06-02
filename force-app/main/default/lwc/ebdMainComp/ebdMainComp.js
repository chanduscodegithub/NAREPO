import { LightningElement, track, api, wire } from 'lwc';
import getEbdData from '@salesforce/apex/EBDController.getEbdData';
import saveEbdData from '@salesforce/apex/EBDController.saveEbdData';
import hasEditAccess from '@salesforce/apex/EBDController.hasEditAccess';
import clearAllDataOnEbdData from '@salesforce/apex/EBDController.clearAllDataOnEbdData';
//import getSCEValidationInfo from '@salesforce/apex/EBDController.getSCEValidationInfo';
import updateSCEValidationInfo from '@salesforce/apex/EBDController.updateSCEValidationInfo';
import generateAndUploadEBDDocument from '@salesforce/apex/EBDController.generateAndUploadEBDDocument';

import getEBDDocumentsForAccount from '@salesforce/apex/EBDController.getEBDDocumentsForAccount';

import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class EbdMainComp extends LightningElement {
    //@track anticipatedDetailsDataCopy;
    @track showConfirmModalForClear = false;
    @track showConfirmModalForValidation = false;
    @track sceValidationName = '';
    fileList = [];
    files = [];
    error;
    @track financialData = [];
    @track showConfirmModalForClear = false;
    @api deleteIds = [];
    @track ebdId;
    @track isEditMode = false;
    @track canEdit = false;
    @track isLoading = true;
    @api recordId;
    wiredEbdDataResult;
    @track ebdFormData = {};
    @track ebdListDataforCancel = {};
    @track entertainmentsDataforCancel = [];
    @track clientPriorityDetailsforCancel = [];
    @track businessDataforCancel = [];
    @track advocacyDataforCancel = [];
    @track anticipatedDataforcancel = [];
    @track uhccompetitorforcancel = [];
    @track npsDataforcancel = [];
    @track currentMedicalStr = '';
    @track nextMedicalStr = '';
    @track bghDataStr = '';
    @track surestCurrentStr = '';
    @track surestNextStr = '';
    @track ebdListData = {};
    @track accountInfo = {};
    @track seniorExecutiveListData = {};
    @track consultantsData = [];
    @track competitorData = [];
    @track finanicalData = {};
    @track detailedFinancial = {};
    @track companyContactsData = [];
    @track entertainmentsData = [];
    @track businessData = [];
    @track advocacyData = [];
    @track anticipatedDetailsData = [];
    @track clientPriorityDetails = [];
    @track npsData = [];
    @track validatedBy;
    @track validatedTime;
    @track defaultActiveTab = '';
    @track incumbentMedical ='';
    @track incumbentPharmacy ='';
    @track incumbentDental ='';
    @track incumbentVision ='';
    connectedCallback() {
        this.isLoading = true;
        hasEditAccess({ companyId: this.recordId })
            .then(result => {
                this.canEdit = result;
                this.defaultActiveTab = 'EBD';
            })
            .catch(error => {
                console.error('Error checking edit access:', error);
                this.canEdit = false;
            });

    }
    
    // handleValidationClick() {
    //     this.isLoading = true;
    //     updateSCEValidationInfo({ companyId: this.recordId })
    //         .then(result => {
    //             refreshApex(this.wiredEbdDataResult);
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: 'Validated!',
    //                     message: 'Validation saved successfully.',
    //                     variant: 'success'
    //                 })
    //             );
    //         })
    //         .catch(error => {
    //             console.error('Error updating validation:', error);
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: 'Error',
    //                     message: 'Error during validation.',
    //                     variant: 'error'
    //                 })
    //             );
    //         })
    //         .finally(() => {
    //             this.isLoading = false;
    //         });
    // }
    handleValidationClick() {
    this.isLoading = true;

    updateSCEValidationInfo({ companyId: this.recordId })
        .then(() => generateAndUploadEBDDocument({ companyId: this.recordId, ebdId: this.ebdId }))
        .then(() => {
            return refreshApex(this.wiredEbdDataResult);
        })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Validation saved and document generated successfully.',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            console.error('Error during validation/document generation:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error during validation or document generation.',
                    variant: 'error'
                })
            );
        })
        .finally(() => {
            this.isLoading = false;
        });
}

    handleClear() {
        console.log('Clear button clicked');
        this.showConfirmModalForClear = true;
        console.log('Modal  after:', this.showConfirmModalForClear);
    }
    handleCancelClearDelete() {
        this.showConfirmModalForClear = false;
    }
    handleConfirmDelete() {
        const ebdIdToPass = JSON.stringify(this.ebdId);
        console.log('ebdIdToPass in delete:', ebdIdToPass);
        clearAllDataOnEbdData({ ebdId: ebdIdToPass })
            .then(() => {
                 this.entertainmentsData = [
                    {
                        Client_Representative_s__c: '',
                        Event__c: '',
                        Timing__c: '',
                        UHG_Representative_s__c: ''
                    }
                ];
                 this.clientPriorityDetails = [
                    {
                        Client_Priority__c: '',
                        UHG_Strategy__c: ''
                    }
                ]; this.npsData = [
                    {
                        Strategy__c: '',
                        Action_Steps_Planned_Taken__c: '',
                        Estimated_Completion_Date__c: '',
                        isOther: false
                    }
                ];
                this.businessData = [
                    {
                        Service_Solution__c: '',
                        UHG_Business_Segment__c: '',
                        UHG_Buyer_or_Decision_Make__c: '',
                        Revenue__c:''
                    }
                ];
                 this.advocacyData = [
                    {
                        Service__c: '',
                        Vendor_Model__c: '',
                        Site_if_in_house__c: ''
                    }
                ];
                this.anticipatedDetailsData = [
                    { Product__c: 'Medical', Incumbent__c:this.incumbentMedical, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Pharmacy', Incumbent__c:this.incumbentPharmacy, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Dental', Incumbent__c:this.incumbentDental, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Vision', Incumbent__c:this.incumbentVision, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Financial Products', Incumbent__c: '', Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true }
                ];

                //this.entertainmentsData = [];
                //this.npsData = [];
                //this.businessData = [];
                //this.advocacyData = [];
                //this.anticipatedDetailsData = [];
                //this.clientPriorityDetails = [];

                this.ebdListData = {
                    Id: this.ebdId,
                    X5_Savings_Plan__c: '',
                    X10_Savings_Plan__c: '',
                    X20_Savings_Plan__c: '',

                }
                this.showToast('Success', 'All EBD data deleted/Refreshed successfully.', 'success');
                return refreshApex(this.wiredEbdDataResult);
            })
            .catch(error => {
                console.error('Error deleting data', error);
                this.showToast('Error', 'Failed to delete/Refresh data .', 'error');
            })
            .finally(() => {
                this.showConfirmModalForClear = false;
            })

    }
    get fileCount() {
        return this.fileList ? this.fileList.length : 0;
    }
    @wire(getEbdData, { companyId: '$recordId' })
    // wiredEbdData({ data, error }) {
    wiredEbdData(result) {
        console.log('recordId:', this.recordId);
        console.log('wired EbdData called');
        this.wiredEbdDataResult = result;
        const { data, error } = result;
        if (data) {
            console.log('data>>' + data);
            this.ebdFormData = data;
            //this.ebdListDataforCancel = JSON.parse(JSON.stringify(data));
            let ebdFormData = this.ebdFormData;
            this.error = undefined;
            this.currentMedicalStr = '';
            this.surestCurrentStr = '';
            this.surestNextStr = '';
            this.nextMedicalStr = '';
            this.bghDataStr = '';
            this.ebdListData = {};
            this.accountInfo = {};
            this.ebdInfo = {};
            this.npsData = [];
            this.seniorExecutiveListData = {};
            this.consultantsData = [];
            this.competitorData = [];
            this.finanicalData = {};
            this.detailedFinancial = {};
            this.companyContactsData = [];
            this.entertainmentsData = [];
            this.businessData = [];
            this.advocacyData = [];
            this.anticipatedDetailsData = [];
            this.clientPriorityDetails = [];
            this.incumbentMedical='',
            this.incumbentPharmacy='',
            this.incumbentDental='',
            this.incumbentVision='',
            this.ebdId = '';
            if (ebdFormData.hasOwnProperty('CurrentMedicalDealStartDate')) {
                let currentMedicalStr = ebdFormData.CurrentMedicalDealStartDate;
                if (!this.isListEmpty(currentMedicalStr)) {
                    this.currentMedicalStr = ebdFormData.CurrentMedicalDealStartDate;
                }
            }
            if (ebdFormData.hasOwnProperty('NextMedicalRenewalDate')) {
                let nextMedicalStr = ebdFormData.NextMedicalRenewalDate;
                if (!this.isListEmpty(nextMedicalStr)) {
                    this.nextMedicalStr = ebdFormData.NextMedicalRenewalDate;
                }
            }
            if (ebdFormData.hasOwnProperty('surestCurrentMedicalRenewalDate')) {
                let surestCurrentStr = ebdFormData.surestCurrentMedicalRenewalDate;
                if (!this.isListEmpty(surestCurrentStr)) {
                    this.surestCurrentStr = ebdFormData.surestCurrentMedicalRenewalDate;
                }
            }
            if (ebdFormData.hasOwnProperty('surestNextMedicalRenewalDate')) {
                let surestNextStr = ebdFormData.surestNextMedicalRenewalDate;
                if (!this.isListEmpty(surestNextStr)) {
                    this.surestNextStr = ebdFormData.surestNextMedicalRenewalDate;
                }
            }

            if (ebdFormData.hasOwnProperty('bghData')) {
                let bghDataStr = ebdFormData.bghData;
                if (!this.isListEmpty(bghDataStr)) {
                    this.bghDataStr = ebdFormData.bghData;
                }
            }
            if (ebdFormData.hasOwnProperty('getEbdListData')) {
                let ebdListData = ebdFormData.getEbdListData;
                if (!this.isListEmpty(ebdListData)) {
                    this.ebdListData = ebdFormData.getEbdListData;
                    this.ebdListDataforCancel = JSON.parse(JSON.stringify(this.ebdListData));
                    this.ebdId = ebdListData.Id;
                    console.log('Extracted EBD Id:', this.ebdId);

                }
            }
            console.log('ebdListData:', this.ebdListData);
            if (ebdFormData.hasOwnProperty('getAccountInfo')) {
                let accountInfo = ebdFormData.getAccountInfo;
                if (!this.isListEmpty(accountInfo)) {
                    this.accountInfo = ebdFormData.getAccountInfo;
                    this.incumbentMedical  = accountInfo.IncumbentPrimaryMedical__r?.Name   || '';
                    this.incumbentPharmacy = accountInfo.Incumbent_Primary_Pharmacy__r?.Name || '';
                    this.incumbentDental   = accountInfo.IncumbentPrimaryDental__r?.Name    || '';
                    this.incumbentVision   = accountInfo.IncumbentPrimaryVision__r?.Name    || '';
                    //this.sceValidationName = accountInfo.SCEValidation__r?.Name || 'Not Validated';
                    //this.sceValidationName = accountInfo?.SCEValidation__r?.Name || 'Not Validated';

                }
            }

            if (ebdFormData.hasOwnProperty('getEbdInfo')) {
                let ebdInfo = ebdFormData.getEbdInfo;
                if (!this.isListEmpty(ebdInfo)) {
                    this.ebdInfo = ebdFormData.getEbdInfo;
                }
            }
            if (ebdFormData.hasOwnProperty('getSeniorExecutiveListData')) {
                let seniorExecutiveListData = ebdFormData.getSeniorExecutiveListData;
                if (!this.isListEmpty(seniorExecutiveListData)) {
                    this.seniorExecutiveListData = ebdFormData.getSeniorExecutiveListData;
                }
            }
            if (ebdFormData.hasOwnProperty('getConsultantsData')) {
                let consultantsData = ebdFormData.getConsultantsData;
                if (!this.isListEmpty(consultantsData)) {
                    this.consultantsData = ebdFormData.getConsultantsData;
                }
            }
            if (ebdFormData.hasOwnProperty('getDetailedFinancialData')) {
                let detailedFinancial = ebdFormData.getDetailedFinancialData;
                if (!this.isListEmpty(detailedFinancial)) {
                    this.detailedFinancial = JSON.parse(JSON.stringify(ebdFormData.getDetailedFinancialData));
                    //this.compDetailedFinancial = JSON.parse(JSON.stringify(this.detailedFinancial));
                }
            }
            console.log('detailedFinancial', this.detailedFinancial);
            console.log('detailedFinancial', JSON.stringify(this.detailedFinancial));
            if (ebdFormData.hasOwnProperty('getCompetitorData')) {
                let competitorData = ebdFormData.getCompetitorData;
                if (!this.isListEmpty(competitorData)) {
                    this.competitorData = ebdFormData.getCompetitorData;
                    this.uhccompetitorforcancel = JSON.parse(JSON.stringify(this.competitorData));
                }
            }
            if (ebdFormData.hasOwnProperty('getFinanicalData')) {
                let finanicalData = ebdFormData.getFinanicalData;
                if (!this.isListEmpty(finanicalData)) {
                    this.finanicalData = ebdFormData.getFinanicalData;
                }
            }
            console.log('Processed financial Data from parent withput json:', this.finanicalData);
            console.log('Processed Financial Data from parent:', JSON.stringify(this.finanicalData));

            if (this.ebdFormData.hasOwnProperty('getCompanyContactsData')) {
                let companyContactsData = ebdFormData.getCompanyContactsData;
                if (!this.isListEmpty(companyContactsData)) {
                    this.companyContactsData = ebdFormData.getCompanyContactsData;
                }
            }

            if (this.ebdFormData.hasOwnProperty('getEntertainmentDetails')) {
                let entertainmentsData = ebdFormData.getEntertainmentDetails;
                if (!this.isListEmpty(entertainmentsData)) {
                    //this.entertainmentsData = ebdFormData.getEntertainmentDetails;
                    this.entertainmentsData = ebdFormData.getEntertainmentDetails;
                    this.entertainmentsDataforCancel = JSON.parse(JSON.stringify(this.entertainmentsData));
                }
            }
            else {
                this.entertainmentsData = [
                    {
                        Client_Representative_s__c: '',
                        Event__c: '',
                        Timing__c: '',
                        UHG_Representative_s__c: ''
                    }
                ];
                this.entertainmentsDataforCancel = JSON.parse(JSON.stringify(this.entertainmentsData));

            }
            console.log('Processed Entertainment Datafrom parent:', JSON.stringify(this.entertainmentsData));
            if (this.ebdFormData.hasOwnProperty('getBusinessDetails')) {
                let businessData = ebdFormData.getBusinessDetails;
                if (!this.isListEmpty(businessData)) {
                    this.businessData = ebdFormData.getBusinessDetails;
                    this.businessDataforCancel = JSON.parse(JSON.stringify(this.businessData));
                }
            }
            else {
                this.businessData = [
                    {
                        Service_Solution__c: '',
                        UHG_Business_Segment__c: '',
                        UHG_Buyer_or_Decision_Make__c: '',
                        Revenue__c:''
                    }
                ];
                this.businessDataforCancel = JSON.parse(JSON.stringify(this.businessData));

            }
            if (this.ebdFormData.hasOwnProperty('getAdvocacyDetails')) {
                let advocacyData = ebdFormData.getAdvocacyDetails;
                if (!this.isListEmpty(advocacyData)) {
                    this.advocacyData = ebdFormData.getAdvocacyDetails;
                    this.advocacyDataforCancel = JSON.parse(JSON.stringify(this.advocacyData));
                }
            }
            else {
                this.advocacyData = [
                    {
                        Service__c: '',
                        Vendor_Model__c: '',
                        Site_if_in_house__c: ''
                    }
                ];
                this.advocacyDataforCancel = JSON.parse(JSON.stringify(this.advocacyData));

            }

            if (this.ebdFormData.hasOwnProperty('getAnticipatedDetails')) {
                let anticipatedDetailsData = ebdFormData.getAnticipatedDetails;
                if (!this.isListEmpty(anticipatedDetailsData)) {
                    this.anticipatedDetailsData = ebdFormData.getAnticipatedDetails;
                   this.anticipatedDataforcancel = JSON.parse(JSON.stringify(this.anticipatedDetailsData));
                }
            }
            else {
                this.anticipatedDetailsData = [
                    { Product__c: 'Medical', Incumbent__c:this.incumbentMedical, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Pharmacy', Incumbent__c:this.incumbentPharmacy, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Dental', Incumbent__c:this.incumbentDental, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Vision', Incumbent__c:this.incumbentVision, Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true },
                    { Product__c: 'Financial Products', Incumbent__c: '', Deal_Cycle__c: '', Red_Yellow_Green__c: '', isFixed: true }
                ];
               this.anticipatedDataforcancel = JSON.parse(JSON.stringify(this.anticipatedDetailsData));

            }
            if (this.ebdFormData.hasOwnProperty('getNpsDetails')) {
                let npsData = ebdFormData.getNpsDetails;
                if (!this.isListEmpty(npsData)) {
                    this.npsData = npsData.map(rec => {
                        return {
                            ...rec,
                            isOther: rec.Strategy__c === 'Other' // ensure UI flag is set
                        };
                    });
                    this.npsDataforcancel = JSON.parse(JSON.stringify(this.npsData));
                    //this.npsData = ebdFormData.getNpsDetails;
                    //this.npsDataforcancel = JSON.parse(JSON.stringify(this.npsData));
                }
            }
            else {
                this.npsData = [
                    {
                        Strategy__c: '',
                        Action_Steps_Planned_Taken__c: '',
                        Estimated_Completion_Date__c: '',
                        isOther: false
                    }
                ];
                this.npsDataforcancel = JSON.parse(JSON.stringify(this.npsData));

            }

            if (this.ebdFormData.hasOwnProperty('getClientPriorityDetails')) {
                let clientPriorityDetails = ebdFormData.getClientPriorityDetails;
                if (!this.isListEmpty(clientPriorityDetails)) {
                    this.clientPriorityDetails = ebdFormData.getClientPriorityDetails;
                    this.clientPriorityDetailsforCancel = JSON.parse(JSON.stringify(this.clientPriorityDetails));
                }
            }
            else {
                this.clientPriorityDetails = [
                    {
                        Client_Priority__c: '',
                        UHG_Strategy__c: ''
                    }
                ];
                this.clientPriorityDetailsforCancel = JSON.parse(JSON.stringify(this.clientPriorityDetails));

            }
            console.log('clientPriorityDetails:', this.clientPriorityDetails);
            console.log('Processed Client Priority Data from parent:', JSON.stringify(this.clientPriorityDetails));
        } else if (error) {
            this.error = error;
            this.ebdDataJs = undefined;
        }
        this.isLoading = false;
    }
    handleEbdChange(event) {
        const detail = event.detail;
        const fieldName = event.detail.fieldName;
        const fieldValue = event.detail.fieldValue;
        this.ebdListData = {
            ...this.ebdListData,
            [fieldName]: fieldValue
        };
        console.log('Changed field:', fieldName, 'Value:', fieldValue);
        if (detail.objectType === 'Entertainment') {
            console.log('Entertainment data received in ebdchange method:', detail.data);
            this.entertainmentsData = [...detail.data];
            this.entertainmentDeleteIds = detail.deleteIds || [];
            if (detail.refresh) {
               // refreshApex(this.wiredEbdDataResult);
            }
            
            //this.entertainmentsData = [...detail.data];
        };
        if (detail.objectType === 'Business') {
            this.businessData = [...detail.data];
            this.businessDeleteIds = detail.deleteIds || [];
            if (detail.refresh) {
                //refreshApex(this.wiredEbdDataResult);
            }
            
        };
        if (detail.objectType === 'Advocacy') {
            this.advocacyData = [...detail.data];
            this.advocacyDeleteIds = detail.deleteIds || [];
            if (detail.refresh) {
                //refreshApex(this.wiredEbdDataResult);
            }
        };
        if (detail.objectType === 'Nps') {
            this.npsData = [...detail.data];
            this.npsDeleteIds = detail.deleteIds || [];
            if (detail.refresh) {
                //refreshApex(this.wiredEbdDataResult);
            }

        };
        //console.log('Parent received updated Entertainment data:', this.entertainmentsData);
        if (detail.objectType === 'Anticipated') {
            this.anticipatedDetailsData = [...detail.data];
            this.anticipatedDeleteIds = detail.deleteIds || [];
            if (detail.refresh) {
                //refreshApex(this.wiredEbdDataResult);
            }

        };
        if (detail.objectType === 'ClientPriority') {
            this.clientPriorityDetails = [...detail.data];
            this.deletedClientPriorityIds = detail.deleteIds || [];
            if (detail.refresh) {
                //refreshApex(this.wiredEbdDataResult);
            }
        };
        if (detail.objectType === 'Competitor') {
            this.competitorData = [...detail.data];
            console.log('Updated Competitor Records:', this.competitorData);
            console.log('Updated Competitor Records:', JSON.stringify(this.competitorData));
        };

        if (detail.objectType === 'Financial') {
            this.financialData = [...detail.data];
            console.log('Updated Financial Records:', this.financialData);
            console.log('Updated Competitor Records:', JSON.stringify(this.financialData));

        }




    }
    handleCancelDelete() {
        this.showConfirmModalForValidation = false;
    }
    editValidationPrevent() {
        this.showConfirmModalForValidation = true;
    }
    handleSave() {
        this.isEditMode = false;
        this.isLoading = true;
        //refreshApex(this.wiredEbdDataResult);
        console.log(' handleSave called');
        console.log(' this.ebdListData:', JSON.stringify(this.ebdListData));
        const ebdPlain = JSON.parse(JSON.stringify(this.ebdListData));
        //const ebdId = ebdPlain.Id;
        const entertains = JSON.parse(JSON.stringify(this.entertainmentsData));
        const priorities = JSON.parse(JSON.stringify(this.clientPriorityDetails));
        const businesses = JSON.parse(JSON.stringify(this.businessData));
        const advocacies = JSON.parse(JSON.stringify(this.advocacyData));
        const nps = JSON.parse(JSON.stringify(this.npsData));
        const competitors = JSON.parse(JSON.stringify(this.competitorData));
        const anticipatedto = JSON.parse(JSON.stringify(this.anticipatedDetailsData));
        //for financials section
        const financialsToUpdate = JSON.parse(JSON.stringify(this.financialData || []));
        const clientIdsToDelete = JSON.parse(JSON.stringify(this.deletedClientPriorityIds || []));
        //const entertainmentIdsToDelete = JSON.parse(JSON.stringify(this.entertainmentDeleteIds || []));
        const entertainmentIdsToDelete = JSON.parse(JSON.stringify(this.entertainmentDeleteIds || []));
        const businessIdsToDelete = JSON.parse(JSON.stringify(this.businessDeleteIds || []));
        const advocacyIdsToDelete = JSON.parse(JSON.stringify(this.advocacyDeleteIds || []));
        const npsIdsToDelete = JSON.parse(JSON.stringify(this.npsDeleteIds || []));
        const anticipatedDeleteIdsTo = JSON.parse(JSON.stringify(this.anticipatedDeleteIds || []));
        console.log('priorities:', priorities);
        console.log('clientPriorityDetails in save:', this.clientPriorityDetails);
        console.log(' entertainmentsData:', entertains);
        console.log('clientIdsToDelete', clientIdsToDelete);
        console.log('deletedClientPriorityIds:', this.deletedClientPriorityIds);
        console.log('businesses', businesses);
        console.log('businessIdsToDelete:', this.businessIdsToDelete);
        console.log('nps:', nps);
        console.log('npsIdsToDelete:', npsIdsToDelete);
        // console.log('financialsToUpdate', financialsToUpdate);
        saveEbdData({
            ebd: ebdPlain,
            entertainments: entertains,
            entertainmentToDelete: entertainmentIdsToDelete,
            //deleteEntertainmentIds :this.deleteEntertainmentIds
            clientPriorities: priorities,
            clientPriorityToDelete: clientIdsToDelete,
            business: businesses,
            businessToDelete: businessIdsToDelete,
            advocacy: advocacies,
            advocacytoDelete: advocacyIdsToDelete,
            npsTo: nps,
            npsToDelete: npsIdsToDelete,
            anticipated: anticipatedto,
            anticipatedToDelete: anticipatedDeleteIdsTo,
            competitors: competitors,
            updatedFinancials: financialsToUpdate,
            companyId: this.recordId
        })
            .then(result => {
                console.log('clientPriorityDetails:', priorities);
                console.log('deletedClientPriorityIds:', this.deletedClientPriorityIds);
                console.log('EBD data saved successfully:', result);
                this.showToast('Success', 'Saved Data Successfully', 'success');
                //  this.loadEbdData();
                //isLoading = trueI
                /*setTimeout(() => {
                     refreshApex(this.ebdFormData);
                 }, 200);*/
                console.log(' Calling refreshApex now...');
                refreshApex(this.wiredEbdDataResult);
                this.isLoading = false;
            })
            .catch(error => {
                console.error('Error saving EBD Data:', error);

            })
    }
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
    isListEmpty(lst) {
        let isListEmpty = true;
        if (lst !== null && lst !== undefined && lst.length !== 0) {
            isListEmpty = false;
        }

        return isListEmpty;

    }
    handleClickEdit() {
        this.isEditMode = true;
    }
    handleCancel() {
        this.isEditMode = false;
        refreshApex(this.wiredEbdDataResult);
        this.ebdListData = JSON.parse(JSON.stringify(this.ebdListDataforCancel));
        this.entertainmentsData = JSON.parse(JSON.stringify(this.entertainmentsDataforCancel));
        this.clientPriorityDetails = JSON.parse(JSON.stringify(this.clientPriorityDetailsforCancel));
        this.businessData = JSON.parse(JSON.stringify(this.businessDataforCancel));
        this.advocacyData = JSON.parse(JSON.stringify(this.advocacyDataforCancel));
        this.anticipatedDetailsData = JSON.parse(JSON.stringify(this.anticipatedDataforcancel));
        this.competitorData = JSON.parse(JSON.stringify(this.uhccompetitorforcancel));
        this.npsData = JSON.parse(JSON.stringify(this.npsDataforcancel));
    }
    closeAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
    /*@wire(getEBDDocumentsForAccount, { accountId: '$recordId' })
    wiredFiles({ data, error }) {
        if (data) {
            // Add download URL to each record
            this.files = data.map(file => ({
                ...file,
                downloadUrl: '/sfc/servlet.shepherd/version/download/' + file.Id
            }));
            this.error = undefined;
        } else if (error) {
            this.error = error.body.message;
            this.files = [];
        }
    }*/
    handleActive(event) {
        const tabValue = event.target.value;
        if (tabValue === 'EBD Files') {
            this.loadEbdFiles();
        }
    }
    loadEbdFiles() {
        getEBDDocumentsForAccount({ accountId: this.recordId })
            .then(data => {
                this.fileList = data;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.fileList = [];
                console.error('Error loading file list: ', error);
            });
    }
    /* @wire(getEBDDocumentsForAccount, { accountId: '$recordId' })
    wiredFiles({ data, error }) {
        if (data) {
            this.fileList = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.fileList = [];
            console.error('Error loading file list: ', error);
        }
    }*/
    handleDownloadClick() {
        this.closeAction();
    }
    handleRowAction(event) {
        const action = event.detail.action.name;
        const row = event.detail.row;
        if (action === 'download') {
            window.open(row.downloadUrl, '_blank');
        }
    }
    handleClickPrint() {
        console.log('inside word ');
        let vfPageUrl = '/apex/EBDWordDocVfPage?wordReport=word&Id=' + this.recordId;
        let a = document.createElement('a');
        a.href = vfPageUrl;
        document.body.appendChild(a);
        a.click();
        const evnt = new CustomEvent('loaded', {
            detail: this.loaded
        });
        this.dispatchEvent(evnt);
        this.closeAction();
    }

}