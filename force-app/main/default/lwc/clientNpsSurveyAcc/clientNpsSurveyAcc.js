/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-02-2024
 * @last modified by  : Spoorthy
**/
import {LightningElement,track,api,wire} from 'lwc';
import {NavigationMixin} from 'lightning/navigation';
import {refreshApex} from '@salesforce/apex';
import saveNpsContactData from '@salesforce/apex/ClientSurveyCtrl.saveNpsContactData';
import getContactRecords from '@salesforce/apex/ClientSurveyCtrl.getContactRecords';
import searchContacts from '@salesforce/apex/ClientSurveyCtrl.searchedContacts';
import fetchDefaultContacts from '@salesforce/apex/ClientSurveyCtrl.fetchDefaultContacts';
import NAME_FIELD from '@salesforce/schema/Contact.Name';
import ACCOUNT_FIELD from '@salesforce/schema/Contact.AccountId';
import CORRESPONDENCE_TYPE_FIELD from '@salesforce/schema/Contact.Correspondence_Type__c';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { getPicklistValues, getObjectInfo} from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import DELETE_REASON_FIELD from '@salesforce/schema/Contact.Contact_Delete_Reason__c';



export default class ClientNpsSurveyChild extends NavigationMixin(LightningElement) {
    @api hasTabAccess;
    @api hasDeleteAccess;
    @api cmc;
    @api vpcrrvp;
    @api sce;
    @api surveyContactsList;
    @api loggedInUserRoleName;
    @api softDate;
    @track surveyContacts;
    @track disableEdit = false;
    @track showSaveCancel = false;
    @track noRelatedContacts = true;
    @track enablePopUp = false;
    @track searchPickList = [];
    @track searchFilterPickList = [];
    @track enableCreateContactPopUp = false;
    @track showDeleteModel = false;
    @track deleteMsgContent;
    @track searchText = '';
    @track filterSelected = 'Last Name';
    @track filterConditionSelected = 'Begins With';
    @track disableClear = true; //Variable created to Enable/Disable Clear button in Add Another Contact Pop up...
    @track disableGo = true; //Variable created to Enable/Disable Search button in Add Another Contact Pop up...
    @track searchContactsFound = false;
    @track searchedContacts;
    @track masterData;
    @track surveyContactsBackup;
    @track newSurveyContactsList;
    @track arrowUpIcon = 'utility:arrowup';
    @track arrowDownIcon = 'utility:arrowdown';
    @track handleCompanyIconDirection = 'utility:arrowup';
    @track handleLastNameIconDirection = 'utility:arrowdown';
    @track handleFirstNameIconDirection = 'utility:arrowdown';
    @track handleCorrespondenceTypeIconDirection = 'utility:arrowdown';
    @track handleSurveyTypeIconDirection = 'utility:arrowdown';
    @track showWarningModel = false; //Boolean variable used to show/hide the warning pop up when user clicks on save without choosing primary contact..
    @track warningMessageContent = '';
    @track softDueDate = '';
    @api recordId;
    @track isReadonlyCMC = false;
    @track sceDeleteMsg = '';
    @track sceDeleteMsg1 ='';
    showAddContactButton = false;
    blankSearchValue = false;
    isAddNewSurveyContacts = false;
    dynamicRecordTypeId; // Variable created to fetch CM Record type ID dynamically...
    count = 0;
    enableRenderedCallback = false;
    newSurveyContacts = []; // Variable created to store Survey contacts added from Pop up...
    editedSurveyContacts = []; //Variable Created to Update Records
    recordTobeDeleted = {}; //Variable Created to store the record data and index..
    showCreateContactModel = false;
    from = '';
    norecordsFound = '';
    noSearchRecordsFound = '';
    noTabAccessMessage = '';
    isEdit = false;
    showSpinner = true;
    errorMessage = '';
    showErrorSpan = false;
    showStatusErrorMessage = false;
    statusFieldError = '';
    showRequiredFieldsError = false;
    showRemainderAlertOnce = false; //Boolean variable created to show the Warning pop up only once and save the records once they modify any records on click off OK button.
    showDeleteReason = false;
    showExplaination = false;
    deleteType = ''
    hasCssLoaded= false;


    contactObject = CONTACT_OBJECT;
    myFields = [NAME_FIELD, ACCOUNT_FIELD, CORRESPONDENCE_TYPE_FIELD /*, SURVEY_TYPE_FIELD, EMAIL_FIELD, PHONE_FIELD, MOBILE_PHONE_FIELD*/ ];
    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })contactObjectInfo;

    @wire(getPicklistValues, {
        recordTypeId: "$contactObjectInfo.data.defaultRecordTypeId",
        fieldApiName: DELETE_REASON_FIELD
    })deleteReasonPicklist;

    get deleteOptions(){

        if(this.deleteReasonPicklist.data){
            return this.deleteReasonPicklist.data.values
        }else{
            const evt = new ShowToastEvent({
                title: 'Error',
                message: 'Error while fetching picklist values',
                variant: 'error',
            });
        }
      
    }
    

    @wire(getContactRecords, {
        'accId': '$recordId'
    })
    wiredContacts(result) {
       
        this.noRelatedContacts = true;
        this.masterData = result;
        if (result.data) {
            if (this.from === 'New Contact') {
                this.from = '';
                this.showSaveCancel = true;
                this.disableEdit = true;
                this.isEdit = true;
                this.surveyContacts = result.data;
                this.surveyContactsBackup = result.data;
                //this.noRelatedContacts = false;
                setTimeout(() => {
                    this.noRelatedContacts = false;
                }, 200);
            } else {
                if (result.data.length > 0) {
                    this.surveyContacts = result.data;
                    this.surveyContactsBackup = result.data;
                    this.norecordsFound = '';
                    // this.noRelatedContacts = false;
                    setTimeout(() => {
                        this.noRelatedContacts = false;
                    }, 200);
                } else if (result.data.length === 0) {
                    this.surveyContacts = result.data;
                    this.surveyContactsBackup = result.data;
                    this.norecordsFound = 'No Contact Records found';
                }
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.surveyContacts = undefined;
        }
    }

    connectedCallback() {
      
        if (this.cmc) {
            this.isReadonlyCMC = true;
        } else {
            this.isReadonlyCMC = false;
        }
       
        this.showSpinner = true;
        this.softDueDate = this.softDate;
        if (this.surveyContactsList !== undefined && this.surveyContactsList.length > 0) {
           
            setTimeout(() => {
                this.surveyContacts = this.surveyContactsList;
                this.surveyContactsBackup = this.surveyContactsList;
                this.noRelatedContacts = false;
            }, 10);

        } else {
            setTimeout(() => {
                this.noRelatedContacts = true;
                this.norecordsFound = 'No Contact Records found';
            }, 10);

        }
        

        //Code for adding pickList value ({ label: element, value: element })
        this.searchPickList.push({
            label: 'Last Name',
            value: 'Last Name'
        });
        this.searchPickList.push({
            label: 'First Name',
            value: 'First Name'
        });
        
        //Code for adding pickList value ({ label: element, value: element })
        this.searchFilterPickList.push({
            label: 'Begins With',
            value: 'Begins With'
        });
        this.searchFilterPickList.push({
            label: 'Equals To',
            value: 'Equals To'
        });
        this.searchFilterPickList.push({
            label: 'Contains',
            value: 'Contains'
        });

        this.showSpinner = false;
        console.log('from parent loggedInUserRoleName'+this.loggedInUserRoleName.UserRole.Name)
    }

    handleEditSave(event) {
        let editSaveMode = event.target.label;
        let clientNpsSurveyChild = [];
        let noBlankRecords = false;
        if (editSaveMode === 'Edit') {
            this.disableEdit = true;
            this.showSaveCancel = true;
            var editOrCancel = editSaveMode;
            this.isEdit = true;
            
            const value = true;
            const valueChangeEvent = new CustomEvent("valuechange", {
                detail: {
                    value
                }
            });
            // Fire the custom event
            this.dispatchEvent(valueChangeEvent);

        } else if (editSaveMode === 'Save') {
            this.showSpinner = true;
            /* Logic to check Validation - START*/
            clientNpsSurveyChild = this.template.querySelectorAll('c-client-nps-survey-child-acc');

            for (let i = 0; i < clientNpsSurveyChild.length; i++) {
                clientNpsSurveyChild[i].checkBlankRecords();
            }

            let markedRecords = [];
            for (let i = 0; i < this.surveyContacts.length; i++) {
                if (this.surveyContacts[i].hasOwnProperty('Id')) {
                    if (this.surveyContacts[i].hasOwnProperty('Correspondence_Type__c') && this.surveyContacts[i].Correspondence_Type__c !== undefined) {
                        if (this.surveyContacts[i].Correspondence_Type__c === '') {
                            noBlankRecords = true;
                        } else if (this.surveyContacts[i]['Correspondence_Type__c'].indexOf('Customer Survey - Primary') === -1 && this.surveyContacts[i]['Correspondence_Type__c'].indexOf('Customer Survey - Secondary') === -1) {
                            noBlankRecords = true;
                        }


                        /* Logic to highlight Company name if any of company does not have Primary Contact - START */
                        let primaryContactExist = false;
                        let recordAlreadyMarked = false;
                        if (this.surveyContacts[i]['Correspondence_Type__c'] !== undefined) {
                            if (this.surveyContacts[i]['Correspondence_Type__c'].indexOf('Customer Survey - Primary') === -1 && this.surveyContacts[i]['Correspondence_Type__c'].indexOf('Customer Survey - Secondary') !== -1) {
                                //clientNpsSurveyChild[i].highlightRecord('removeHighlight');
                                //Above if condition indicates that the current record does not have primary correspondence, So compare with rest of the records and decide whether to add the highlight or not
                                for (let j = 0; j < this.surveyContacts.length; j++) {
                                    //Logic to compare with rest of the records and decide to add record highlight or not..
                                    if (this.surveyContacts[i]['Account']['Id'] === this.surveyContacts[j]['Account']['Id']) {
                                        if (this.surveyContacts[j]['Correspondence_Type__c'] !== undefined) {
                                            if (this.surveyContacts[j]['Correspondence_Type__c'].indexOf('Customer Survey - Primary') !== -1) {
                                                primaryContactExist = true;
                                            } else if (markedRecords !== undefined && markedRecords.includes(this.surveyContacts[j]['Account']['Id'])) {
                                                //Check if the record is already marked and skip it from marking it again...
                                                recordAlreadyMarked = true;
                                            }
                                        }
                                    }
                                }
                                /* Invoke child component to highlight the record - START */
                                if (!this.cmc)
                                    if (!primaryContactExist && !recordAlreadyMarked && !this.showRemainderAlertOnce) {
                                        // clientNpsSurveyChild[i].highlightRecord('addHighlight');
                                        //Invoke Alert pop up
                                        this.showWarningModel = true;
                                        noBlankRecords = true;
                                        primaryContactExist = false;
                                        this.warningMessageContent = 'Client is missing a designated primary contact. Please make sure to assign a primary contact to client.';
                                        this.showSpinner = false;
                                        // if (markedRecords !== undefined) {
                                        //     markedRecords.push(this.surveyContacts[i]['Account']['Id']);
                                        // }
                                    }

                                    /* Invoke child component to highlight the record - END */
                            } else {
                               // clientNpsSurveyChild[i].highlightRecord('removeHighlight');
                            }
                        }


                    } else if (!this.surveyContacts[i].hasOwnProperty('Correspondence_Type__c')) {
                        noBlankRecords = true;
                    }

                    if (this.surveyContacts[i].hasOwnProperty('Survey_Type__c') && this.surveyContacts[i].Survey_Type__c !== undefined) {
                        if (this.surveyContacts[i].Survey_Type__c === '') {
                            noBlankRecords = true;
                        }
                    } else if (!this.surveyContacts[i].hasOwnProperty('Survey_Type__c')) {
                        noBlankRecords = true;
                    }

                    // if (this.surveyContacts[i].hasOwnProperty('Contact_Source__c') && this.surveyContacts[i].Contact_Source__c !== undefined) {
                    //     if (this.surveyContacts[i].Contact_Source__c === '') {
                    //         noBlankRecords = true;
                    //     }
                    // } else if (!this.surveyContacts[i].hasOwnProperty('Contact_Source__c')) {
                    //     noBlankRecords = true;
                    // }


                    if (this.surveyContacts[i].hasOwnProperty('Email') && this.surveyContacts[i].Email !== undefined) {
                        if (this.surveyContacts[i].Email === '') {
                            noBlankRecords = true;
                        }

                        var regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        if (!this.surveyContacts[i].Email.match(regExpEmailformat)) {
                            console.log('Inside  email validation match ');
                            noBlankRecords = true;
                        }
                    } else if (!this.surveyContacts[i].hasOwnProperty('Email')) {
                        noBlankRecords = true;
                    }

                }
            }
            /* Logic to check Validation - END*/

            /* Logic to save or Cancel records - START */
            let editedSurveyContacts = Object.assign({}, this.editedSurveyContacts);
            let newSurveyContactsList = Object.assign({}, this.newSurveyContactsList);
            let NotupdatedContactList = [];
            let recordAlreadyExists = false;
            if (this.newSurveyContactsList == undefined) {
                this.newSurveyContactsList = [];
            }
            if (this.editedSurveyContacts == undefined) {
                this.editedSurveyContacts = [];
            }
            for (let i = 0; i < this.newSurveyContactsList.length; i++) {
                let recordAlreadyExists = false;
                for (let j = 0; j < this.editedSurveyContacts.length; j++) {
                    if (this.newSurveyContactsList[i].Id === this.editedSurveyContacts[j].Id) {
                        recordAlreadyExists = true;
                    }
                }
                if (!recordAlreadyExists) {
                    NotupdatedContactList.push(this.newSurveyContactsList[i]);
                }
            }
            let updatedContactList = [];

            updatedContactList = [...NotupdatedContactList, ...this.editedSurveyContacts];
            if (!noBlankRecords) {
                
                saveNpsContactData({contactData: updatedContactList})
                .then(result => {
                    this.showRemainderAlertOnce = false;
                    refreshApex(this.masterData);
                    this.closeModal();
                    
                    this.showSpinner = false;
                    const refreshEvent = new CustomEvent("refresh", {detail: {}});
                    this.dispatchEvent(refreshEvent);
                        
                }).catch(error => {
                    console.log('Error Occured while Saving ' , error);
                });
                this.disableEdit = false;
                this.showSaveCancel = false;
                this.isEdit = false;
                const value = false;
                const valueChangeEvent = new CustomEvent("valuechange", {
                    detail: {
                        value
                    }
                });
        
                this.dispatchEvent(valueChangeEvent);
          
            } else if (!this.showWarningModel) {
                this.showSpinner = false;
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: 'Please fill the mandatory fields.',
                    variant: 'error',
                });
                this.dispatchEvent(evt);
                this.showSpinner = false;
            }

        } else if (editSaveMode === 'Cancel') {
            this.showRemainderAlertOnce = false; //Warning pop up has to appear when user clicks on save again...
            this.showSpinner = true;
            this.noRelatedContacts = true;
            //let _this = this;
            //let surveyContacts = [...this.surveyContactsBackup];
            this.surveyContacts = [...this.surveyContactsBackup];
            setTimeout(() => {
                this.isEdit = false;
                if (this.surveyContacts.length > 0) {
                    this.noRelatedContacts = false;
                }
                this.showSpinner = false;
            }, 200);
            //refreshApex(this.masterData);
            this.disableEdit = false;
            this.showSaveCancel = false;
            var editOrCancel = editSaveMode;

            this.newSurveyContacts = []; //Making Pop up new survey contacts list empty...
            this.searchedContacts = []; //Making search Pop up list empty...
            this.searchContactsFound = false; // To show "No records found" message once user opens pop up again...
            this.noSearchRecordsFound = '';
            this.searchText = ''; //Clearing out search value...
            const value = false;
            const valueChangeEvent = new CustomEvent("valuechange", {
                detail: {
                    value
                }
            });
            // Fire the custom event
            this.dispatchEvent(valueChangeEvent);
        }
    }

    addNewContact() {
        //add new contact code goes here...!!! 
        this.enablePopUp = true;
        //Fetch default contacts...!!!
        fetchDefaultContacts({
                'accId': this.recordId
            })
            .then(result => {
                this.dynamicRecordTypeId = result.recordTypeId;
                if (result.returnDefaultContacts.length > 0 && result.returnDefaultContacts !== undefined) {
                    this.searchedContacts = result.returnDefaultContacts;
                    this.searchContactsFound = true;
                } else {
                    this.searchedContacts = [];
                    this.searchContactsFound = false;
                    this.noSearchRecordsFound = 'No records found';
                }
            })
            .catch(error => {
                console.log('Error while fetching the contacts ' + error);
            })
    }

    closeModal() {
        this.enablePopUp = false;
        this.newSurveyContacts = []; //Making Pop up new survey contacts list empty...
        this.searchedContacts = []; //Making search Pop up list empty...
        this.searchContactsFound = false; // To show "No records found" message once user opens pop up again...
        this.noSearchRecordsFound = ''; //Making no records text as empty..
        this.searchText = ''; //Clearing out search value...
        this.filterSelected = 'Last Name'; // Setting filters to default..
        this.filterConditionSelected = 'Begins With';
        this.disableClear = true; //Variable used to Enable/Disable Clear button in Add Another Contact Pop up...
        this.disableGo = true; //Variable used to Enable/Disable Search button in Add Another Contact Pop up...
        this.blankSearchValue = false; //Error message 
        if (this.template.querySelector('.slds-form-element__control') !== null) {
            this.template.querySelector('.slds-form-element__control').className = 'slds-form-element__control';
        }
        this.showSpinner = false;
        this.showAddContactButton = false;
    }

    /* Code for Creating new Record -- START */

    navigateToNewContactRecordPage() {
        //this.enableCreateContactPopUp = true;
        this.enablePopUp = false;
        //Clearing out default filter criteria
        this.searchText = '';
        this.filterConditionSelected = 'Begins With';
        this.filterSelected = 'Last Name';
        this.disableGo = true;
        this.disableClear = true;
        this.showCreateContactModel = true;
        // alert($recordId);
    }

    closeContactModel() {
        this.showCreateContactModel = false;
        this.showErrorSpan = false; //Hiding the error message...!!!
        this.errorMessage = ''; // Blanking out the error message...!!!
        this.showStatusErrorMessage = false;
        this.statusFieldError = '';
        this.showRequiredFieldsError = false;
    }

    handleContactCreated() {
        // Run code when contact is created.
        this.enableCreateContactPopUp = false;
        getContactRecords({

            })
            .then(result => {
                this.surveyContacts = result;
            })
            .catch(error => {
                console.log('Error Occured while Fetching Records ' + error);
            });

    }
    
    updateContactEdited(event) {
        
        let eventData = event.detail;
        let editedRecordFound = false;
        let surveyContacts = [...this.surveyContacts]; // This variable and associated operation is created for updating the records...
        if (eventData.editedRecord !== null && eventData.editedRecord !== undefined) {
            //Update the list code goes here
            if (eventData.fieldEdited === 'Delete') {
                
                this.showDeleteModel = true;
                //this.deleteMsgContent = 'To remove the contact from the Client Survey but to keep the contact record as active, click on the “Remove from the Survey” button. If the contact is no longer active and needs to be removed both from the survey and inactivated on the company record, click on the “Remove from the Survey and Inactivate” button.';
                this.recordTobeDeleted = eventData;
                //Added Vignesh - CR 3847 Error Msg
                this.sceDeleteMsg = `SCEs: Do not remove survey contacts provided by other business partners,- `;
                this.sceDeleteMsg1 =' unless mutually agreed upon by the specific partner that nominated the contact for the Client Survey. '
                this.deleteMsgContent = 'To remove the contact from the Client Survey but to keep the contact record as active, click on the “Remove from the Survey” button. If the contact is no longer active and needs to be removed both from the survey and inactivated on the company record, click on the “Remove from the Survey and Inactivate” button.'
              
            } else {
                if (this.editedSurveyContacts.length > 0) {
                    for (let i = 0; i < this.editedSurveyContacts.length; i++) {
                        if (this.editedSurveyContacts[i].hasOwnProperty('Id')) {
                            if (eventData.editedRecord.Id === this.editedSurveyContacts[i].Id) {
                                
                                this.editedSurveyContacts[i][eventData.fieldEdited] = eventData.editedRecord[eventData.fieldEdited];
                                this.editedSurveyContacts[i]['Contact_Source__c'] = eventData.editedRecord['Contact_Source__c'];
                                this.editedSurveyContacts[i]['CSI_Survey_Contact__c'] = eventData.editedRecord['CSI_Survey_Contact__c'];
                                this.editedSurveyContacts[i]['Correspondence_Type__c'] = eventData.editedRecord['Correspondence_Type__c'];
                                this.editedSurveyContacts[i]['Survey_Type__c'] = eventData.editedRecord['Survey_Type__c'];
                               
                                surveyContacts[eventData.index] = eventData.editedRecord;
                                editedRecordFound = true;
                               
                            }
                        }
                    }

                    if (!editedRecordFound) {
                        this.editedSurveyContacts.push(eventData.editedRecord);
                        surveyContacts[eventData.index] = eventData.editedRecord;
                        //this.surveyContacts[eventData.index] = eventData.editedRecord;
                    }

                } else {
                    this.editedSurveyContacts.push(eventData.editedRecord);
                    surveyContacts[eventData.index] = eventData.editedRecord;
                    //this.surveyContacts[eventData.index] = eventData.editedRecord;
                }
            }
            this.surveyContacts = surveyContacts;
            if(eventData.editMode){
                const value = true;
                const valueChangeEvent = new CustomEvent("valuechange", {
                    detail: {
                        value
                    }
                });
                // Fire the custom event
                this.dispatchEvent(valueChangeEvent);
            }
            
        }
    }

    confirmDelete(event) {
        this.deleteType = event.target.label;
        const userRole = this.loggedInUserRoleName.UserRole.Name
        this.showDeleteModel = false;
        
        if((userRole == 'CM VP' || userRole == 'CM SCE' || userRole == 'Surest CM SCE' || userRole == 'Surest CM SVP' || 
            userRole == 'CM VPCR/RVP' || userRole == 'Specialty Benefits SCE' ||
            userRole == 'CRM Administrator' )
         && this.recordTobeDeleted.editedRecord.Contact_Source__c)
        {  
            this.showDeleteReason = true
        }else{
            this.processDelete();
        }
       
    }
    
    closeDeleteOptionPopup(){
        this.showDeleteReason = false;
        this.showExplaination = false;
        
    }

    handleDeleteOptionChange(event){
        
        this.showExplaination = event.detail.value == 'Other Reason'
        this.validateDeleteReason(true);
    }

    saveDeleteReason(){
        const deleteOption = this.template.querySelector('.deleteOptions');
        const deleteReason = this.template.querySelector('.deleteExplain');
        if(this.validateDeleteReason()){
            this.recordTobeDeleted.editedRecord.Contact_Delete_Reason__c = deleteOption.value
            this.recordTobeDeleted.editedRecord.Contact_Delete_Reason_Other_WriteIn__c = (deleteReason && deleteReason.value)? deleteReason.value : ''
            
            this.processDelete()
        }
    }

    validateDeleteReason(fromChangeEvent){
        const deleteOption = this.template.querySelector('.deleteOptions');
        const deleteReason = this.template.querySelector('.deleteExplain');
        let error = 0;
        if(!deleteOption.value){
            deleteOption.setCustomValidity("Please Select Reason");
            deleteOption.reportValidity();
            error++
        }else{
            deleteOption.setCustomValidity("");
            deleteOption.reportValidity();
        }

        if(!fromChangeEvent && deleteOption.value == 'Other Reason' && !deleteReason.value){
            deleteReason.setCustomValidity("Please enter explaination");
            deleteReason.reportValidity();
            error++
        }else if(deleteReason &&  deleteReason.value && deleteReason.value.length > 255){
            deleteReason.setCustomValidity("Please enter less than 255 characters");
            deleteReason.reportValidity();
            error++
        }else if(deleteReason){
            deleteReason.setCustomValidity("");
            deleteReason.reportValidity();
        }
        return error == 0;
    }

    processDelete() {
        this.noRelatedContacts = true;
        this.showSpinner = true;
        this.showExplaination = false;
        this.showDeleteReason = false;
        let surveyContacts = [];
        let splitCorrespondance = [];
        var CorrespondenceType = '';
        let recordToBeDeleted1;
        let editedRecordFound = false;
        

        recordToBeDeleted1 = Object.assign({}, this.recordTobeDeleted.editedRecord);
        console.dir(recordToBeDeleted1)
      
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //Adding 1 to month because Javascript starts month from 0
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;

        /* JavaScript function to get today date and assign it for Inactive date field on delete - END */


        if (this.deleteType === 'Remove from the Survey') {
            if (this.recordTobeDeleted.editedRecord.hasOwnProperty('Id') && this.recordTobeDeleted !== undefined) {
                /* Code to delete Customer Survey Primary and Secondary - START */
                if (this.recordTobeDeleted.editedRecord.hasOwnProperty('Correspondence_Type__c') && this.recordTobeDeleted.editedRecord['Correspondence_Type__c'] !== undefined) {
                    if (this.recordTobeDeleted.editedRecord['Correspondence_Type__c'].indexOf('Customer Survey - Primary') > 0 ||
                        this.recordTobeDeleted.editedRecord['Correspondence_Type__c'].indexOf('Customer Survey - Secondary') > 0) {
                        splitCorrespondance = this.recordTobeDeleted.editedRecord['Correspondence_Type__c'].split(';');
                        recordToBeDeleted1['Survey_Type__c'] = '';
                    }

                    for (let i = 0; i < splitCorrespondance.length; i++) {
                        if (i === 0 && splitCorrespondance[i] !== 'Customer Survey - Primary' && splitCorrespondance[i] !== 'Customer Survey - Secondary') {
                            CorrespondenceType = splitCorrespondance[i] + ';';
                        } else if (splitCorrespondance[i] !== 'Customer Survey - Primary' && splitCorrespondance[i] !== 'Customer Survey - Secondary') {
                            CorrespondenceType += splitCorrespondance[i] + ';';
                        }
                    }

                    //Assign Back the Correspondence_Type__c field value to the delete record......
                    recordToBeDeleted1['Correspondence_Type__c'] = CorrespondenceType;
                }
                /* Code to delete Customer Survey Primary and Secondary - END */
                if (this.editedSurveyContacts.length > 0) {
                    for (let i = 0; i < this.editedSurveyContacts.length; i++) {
                        if (this.editedSurveyContacts[i].hasOwnProperty('Id')) {
                            if (recordToBeDeleted1.Id === this.editedSurveyContacts[i].Id) {
                                this.editedSurveyContacts[i]['Correspondence_Type__c'] = recordToBeDeleted1['Correspondence_Type__c'];
                                this.editedSurveyContacts[i]['Survey_Type__c'] = '';
                                editedRecordFound = true;
                            }
                        }
                    }

                    if (!editedRecordFound) {
                        recordToBeDeleted1['Survey_Type__c'] = '';
                        this.editedSurveyContacts.push(recordToBeDeleted1);
                    }

                } else {
                    recordToBeDeleted1['Survey_Type__c'] = '';
                    this.editedSurveyContacts.push(recordToBeDeleted1);
                }

                surveyContacts = [...this.surveyContacts];
                surveyContacts.splice(this.recordTobeDeleted.index, 1);
                this.surveyContacts = surveyContacts;

                /* Check if the Delete is called on Edit Mode/ Read Mode - START */
                if (!this.recordTobeDeleted.editMode) {
                    //Record is in View Mode.. Upsert the data directly
                    saveNpsContactData({
                            //Assigning paramters that has to be passed to apex...!!!
                            contactData: this.editedSurveyContacts
                        })
                        .then(result => {
                            if (result !== null) {
                                if (result.length > 0) {
                                    this.surveyContacts = result;
                                    this.surveyContactsBackup = result;
                                    refreshApex(this.masterData);
                                    this.noRelatedContacts = false;
                                    this.showSpinner = false;
                                } else {
                                    this.surveyContacts = result;
                                    this.noRelatedContacts = true;
                                }
                            } else {
                                refreshApex(this.masterData);
                            }
                        }).catch(error => {
                            console.log('Error Occured while Saving ' + error);
                        });
                } else {
                    this.showSpinner = false;
                    this.noRelatedContacts = false;
                }

                //Hide pop up once user clicks Delete button
                this.showSpinner = false;
                this.recordTobeDeleted = undefined;
                this.showDeleteModel = false;
            }
        } else if (this.deleteType === 'Remove from the Survey and Inactivate') {
            if (this.recordTobeDeleted.editedRecord.hasOwnProperty('Id') && this.recordTobeDeleted !== undefined) {
                /* Code to delete Customer Survey Primary and Secondary - START */
                /*if (this.recordTobeDeleted.editedRecord.hasOwnProperty('Correspondence_Type__c') && this.recordTobeDeleted.editedRecord['Correspondence_Type__c'] !== undefined) {
                    if (this.recordTobeDeleted.editedRecord['Correspondence_Type__c'].indexOf('Customer Survey - Primary') > 0 ||
                        this.recordTobeDeleted.editedRecord['Correspondence_Type__c'].indexOf('Customer Survey - Secondary') > 0) {
                        splitCorrespondance = this.recordTobeDeleted.editedRecord['Correspondence_Type__c'].split(';');
                        recordToBeDeleted1['Survey_Type__c'] = '';
                    }
    
                    for (let i = 0; i < splitCorrespondance.length; i++) {
                        if (i === 0 && splitCorrespondance[i] !== 'Customer Survey - Primary' && splitCorrespondance[i] !== 'Customer Survey - Secondary') {
                            CorrespondenceType = splitCorrespondance[i] + ';';
                        } else if (splitCorrespondance[i] !== 'Customer Survey - Primary' && splitCorrespondance[i] !== 'Customer Survey - Secondary') {
                            CorrespondenceType += splitCorrespondance[i] + ';';
                        }
                    }
    
                    //Assign Back the Correspondence_Type__c field value to the delete record......
                    recordToBeDeleted1['Correspondence_Type__c'] = CorrespondenceType;
                }*/
                /* Code to delete Customer Survey Primary and Secondary - END */
                if (this.editedSurveyContacts.length > 0) {
                    for (let i = 0; i < this.editedSurveyContacts.length; i++) {
                        if (this.editedSurveyContacts[i].hasOwnProperty('Id')) {
                            if (recordToBeDeleted1.Id === this.editedSurveyContacts[i].Id) {
                                this.editedSurveyContacts[i]['Correspondence_Type__c'] = '';
                                this.editedSurveyContacts[i]['Survey_Type__c'] = '';
                                this.editedSurveyContacts[i].Status__c = 'Inactive';
                                this.editedSurveyContacts[i].DoNotSendCorrespondence__c = true;
                                //this.editedSurveyContacts[i].InactiveDate__c = today;
                                //this.editedSurveyContacts[i].EmploymentEndDateApprox__c = today;
                                this.editedSurveyContacts[i].InactiveStatusReason__c = 'Unknown';
                                editedRecordFound = true;
                            }
                        }
                    }

                    if (!editedRecordFound) {
                        recordToBeDeleted1['Survey_Type__c'] = '';
                        recordToBeDeleted1.Status__c = 'Inactive';
                        recordToBeDeleted1.DoNotSendCorrespondence__c = true;
                        //recordToBeDeleted1.InactiveDate__c = today;
                        //recordToBeDeleted1.EmploymentEndDateApprox__c = today;
                        recordToBeDeleted1.InactiveStatusReason__c = 'Unknown';
                        this.editedSurveyContacts.push(recordToBeDeleted1);
                    }

                } else {
                    recordToBeDeleted1['Survey_Type__c'] = '';
                    recordToBeDeleted1.Status__c = 'Inactive';
                    recordToBeDeleted1.DoNotSendCorrespondence__c = true;
                    //recordToBeDeleted1.InactiveDate__c = today;
                    //recordToBeDeleted1.EmploymentEndDateApprox__c = today;
                    recordToBeDeleted1.InactiveStatusReason__c = 'Unknown';
                    this.editedSurveyContacts.push(recordToBeDeleted1);
                }

                surveyContacts = [...this.surveyContacts];
                surveyContacts.splice(this.recordTobeDeleted.index, 1);
                this.surveyContacts = surveyContacts;

                /* Check if the Delete is called on Edit Mode/ Read Mode - START */
                if (!this.recordTobeDeleted.editMode) {
                    //Record is in View Mode.. Upsert the data directly
                    saveNpsContactData({
                            //Assigning paramters that has to be passed to apex...!!!
                            contactData: this.editedSurveyContacts
                        })
                        .then(result => {
                            if (result !== null) {
                                if (result.length > 0) {
                                    this.surveyContacts = result;
                                    this.surveyContactsBackup = result;
                                    refreshApex(this.masterData);
                                    this.noRelatedContacts = false;
                                    this.showSpinner = false;
                                } else {
                                    this.surveyContacts = result;
                                    this.noRelatedContacts = true;
                                }
                            } else {
                                refreshApex(this.masterData);
                            }
                        })
                        .catch(error => {
                            console.log('Error Occured while Saving ' + error);
                        });
                } else {
                    this.showSpinner = false;
                }

                //Hide pop up once user clicks Delete button
                this.showSpinner = false;
                this.recordTobeDeleted = undefined;
                this.showDeleteModel = false;
            }
        }

        

    }

    confirmCancel() {
        this.recordTobeDeleted = undefined;
        this.showDeleteModel = false;
    }

    handleSubmit(event) {
        this.noRelatedContacts = true;
       this.showSpinner = true;
        this.errorMessage = '';
        event.preventDefault(); // stop the form from submitting     
        const fields = event.detail.fields;
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        console.log('On submit');

        //Validate fields and throw errors
        if (inputFields) {
            inputFields.forEach(field => {
                if (field.fieldName === 'Name') {
                    if (field.value !== undefined) {
                        if (field.value.FirstName === null || field.value.FirstName === '') {
                            //this.template.querySelector('.lightningMessageClass').setError('First Name cannot be empty');
                            if (this.errorMessage === '') {
                                this.errorMessage = this.errorMessage + ' First Name \n';
                            } else {
                                this.errorMessage = this.errorMessage + ', First Name \n';
                            }
                        }

                        if (field.value.LastName === null || field.value.LastName === '') {
                            //this.template.querySelector('.lightningMessageClass').setError('First Name cannot be empty');
                            if (this.errorMessage === '') {
                                this.errorMessage = this.errorMessage + ' Last Name \n';
                            } else {
                                this.errorMessage = this.errorMessage + ', Last Name \n';
                            }
                        }
                    }
                }

                if (field.fieldName === 'Status__c') {
                    if (field.value === '' || field.value === 'Inactive') {
                        if (this.errorMessage === '') {
                            this.statusFieldError = 'Contact cannot be created with Status Inactive under Client Survey';
                            this.showStatusErrorMessage = true;
                        } else {
                            this.statusFieldError = 'Contact cannot be created with Status Inactive under Client Survey';
                            this.showStatusErrorMessage = true;
                        }
                        //this.template.querySelector('.lightningMessageClass').setError('Status has to be empty');

                    } else {
                        this.showStatusErrorMessage = false;
                        this.statusFieldError = '';
                    }
                }

                if (field.fieldName === 'AccountId') {
                    if (field.value === null || field.value === '') {
                        //this.template.querySelector('.lightningMessageClass').setError('Company cannot be empty');
                        if (this.errorMessage === '') {
                            this.errorMessage = this.errorMessage + ' Company \n';
                        } else {
                            this.errorMessage = this.errorMessage + ', Company \n';
                        }
                    }
                }
                // if (this.cmc)
                //     if (field.fieldName === 'Correspondence_Type__c') {

                //         if (field.value == 'Customer Survey - Primary') {
                //             const evt = new ShowToastEvent({
                //                 title: 'Error',
                //                 message: 'You cant create a contact with primary',
                //                 variant: 'error',
                //             });
                //             this.dispatchEvent(evt);
                //             field.value = '';
                //             //this.errorMessage = this.errorMessage + ', Correspondence Type \n';
                //         }

                //     }

            });
        }
        if (this.errorMessage === '' && !this.showStatusErrorMessage) {
            this.showErrorSpan = false; //Hiding the error message...!!!
            this.showRequiredFieldsError = false; //Hide the show required field message...
            this.errorMessage = ''; // Blanking out the error message...!!!
            this.template.querySelector('lightning-record-edit-form').submit(fields);
        } else if (this.showStatusErrorMessage && this.errorMessage === '') {
            this.showErrorSpan = true;
            this.showRequiredFieldsError = false;
        } else if (this.showStatusErrorMessage && this.errorMessage !== '') {
            this.showErrorSpan = true;
            this.showRequiredFieldsError = true;
        } else if (!this.showStatusErrorMessage && this.errorMessage !== '') {
            this.showErrorSpan = true;
            this.showRequiredFieldsError = true;
        }

        if(this.showErrorSpan){
            this.noRelatedContacts = false;
       this.showSpinner = false;
        }


    }

    handleSuccess(event) {
        let surveyContacts;
        this.showErrorSpan = false; //Hiding the error message...!!!
        this.showRequiredFieldsError = false; //Hide the show required field message...
        this.errorMessage = ''; // Blanking out the error message...!!!
        const recordId = event.detail.id;
        let toast = {
            title: '',
            message: 'Request has been submitted',
            variant: 'success'
        };
        this.showCreateContactModel = false;
        /* this.from = 'New Contact';
         refreshApex(this.masterData); */

        /* Check if fields required to build NPS contact has been entered by the user in pop up - START */
        let firstName;
        let lastName;
        let companyId;
        let companyName;
        let correspondenceValue;
        let surveyValue;
        let Email;
        let Contact_Source__c;
        if (event.detail.fields.hasOwnProperty('Correspondence_Type__c') && event.detail.fields.Correspondence_Type__c.value !== null) {
            correspondenceValue = event.detail.fields.Correspondence_Type__c.value;
            if (this.cmc)
                if (correspondenceValue == 'Customer Survey - Primary') {
                    const evt = new ShowToastEvent({
                        title: 'Error',
                        message: 'Only SCE’s and RVP/VPCR can designate a contact as Primary. CM/CMC are not allowed to designate a contact as Primary.',
                        variant: 'error',
                    });
                    this.dispatchEvent(evt);
                    return false;
                }
        }

        if (event.detail.fields.hasOwnProperty('FirstName')) {
            firstName = event.detail.fields.FirstName.value;
        }

        if (event.detail.fields.hasOwnProperty('LastName')) {
            lastName = event.detail.fields.LastName.value;
        }

        if (event.detail.fields.hasOwnProperty('AccountId') && event.detail.fields.AccountId.value !== null) {
            companyId = event.detail.fields.AccountId.value;
            companyName = event.detail.fields.Account.displayValue;
        }


        if (event.detail.fields.hasOwnProperty('Correspondence_Type__c') && event.detail.fields.Correspondence_Type__c.value !== null) {
            correspondenceValue = event.detail.fields.Correspondence_Type__c.value;
            // if(correspondenceValue=='Customer Survey - Primary'){
            //     const evt = new ShowToastEvent({
            //         title: 'Error',
            //         message: 'You cant create a contact with primary',
            //         variant: 'error',
            //     });
            //     this.dispatchEvent(evt);
            //     return false;
            // }
        } else {
            correspondenceValue = '';
        }

        if (this.cmc) {
            correspondenceValue = 'Customer Survey - Secondary';
        }

        if (event.detail.fields.hasOwnProperty('Survey_Type__c') && event.detail.fields.Survey_Type__c.value !== null) {
            surveyValue = event.detail.fields.Survey_Type__c.value;
        } else {
            surveyValue = '';
        }

        if (event.detail.fields.hasOwnProperty('Email') && event.detail.fields.Email.value !== null) {
            Email = event.detail.fields.Email.value;
        } else {
            Email = '';
        }

        if (event.detail.fields.hasOwnProperty('Contact_Source__c') && event.detail.fields.Contact_Source__c.value !== null) {
            Contact_Source__c = event.detail.fields.Contact_Source__c.value;
            // if (this.sce)
            //     if (!Contact_Source__c.includes('SCE')) {
            //         Contact_Source__c = Contact_Source__c + ';' + 'SCE';
            //     }
            // if (this.cmc)
            //     if (!Contact_Source__c.includes('CSI')) {
            //         Contact_Source__c = Contact_Source__c + ';' + 'CSI';
            //     }
            // if (this.vpcrrvp)
            //     if (!Contact_Source__c.includes('RVP/VPCR')) {
            //         Contact_Source__c = Contact_Source__c + ';' + 'RVP/VPCR';
            //     }
        } //else {
        //     if (this.sce)
        //         Contact_Source__c = 'SCE';

        //     if (this.cmc)
        //         Contact_Source__c = 'CSI';

        //     if (this.vpcrrvp)
        //         Contact_Source__c = 'RVP/VPCR';

        // }

        if (event.detail.fields.Status__c.value === 'Active' && event.detail.fields.Status__c.value !== undefined) {
            surveyContacts = [{
                "Id": recordId,
                "AccountId": companyId,
                "Correspondence_Type__c": correspondenceValue,
                "Survey_Type__c": surveyValue,
                "FirstName": firstName,
                "LastName": lastName,
                "Email": Email,
                "Contact_Source__c": Contact_Source__c,
                "Account": {
                    "Name": companyName,
                    "Id": companyId
                }
            }, ...this.surveyContacts];
        } else {
            surveyContacts = [...this.surveyContacts];
        }

        this.surveyContacts = surveyContacts;
        this.noRelatedContacts = false;
        this.isEdit = true;
        this.disableEdit = true;
        this.showSaveCancel = true;

        this.showSpinner = false;
        const value = true;
            const valueChangeEvent = new CustomEvent("valuechange", {
                detail: {
                    value
                }
            });
            // Fire the custom event
            this.dispatchEvent(valueChangeEvent);
    }

    handleError(event) {
        console.log('Event ' + event);
        this.showErrorSpan = true;
        this.showSpinner = false;

        /*this.template.querySelector('.lightningMessageClass').setError('Error Occured while saving');*/
    }

    updateSearchValue(event) {
        this.searchText = event.target.value;
        if (event.target.value !== '') {
            this.disableClear = false; //Enable clear button for Clearing out text entered by the user...
            this.disableGo = false; //Enable go button to search results based on the input given by the user...
        } else if (event.target.value === '') {
            this.disableClear = true; // Disable the button once user vanishes/clears the searched value..
            this.disableGo = true; //Disable Go when the search contact value is empty...
        }
        console.log('Text received from Search box ' + this.searchText);
    }

    checkEnterButton(event) {
        if (event.keyCode === 13 && this.searchText !== '') {
            this.searchContacts();
        }

    }

    searchContacts() {
        //Searching goes here by calling Apex method....
        this.showSpinner = true;
        if (this.searchText !== '') {

            if (this.template.querySelector('.slds-form-element__control') !== null) {
                this.template.querySelector('.slds-form-element__control').className = 'slds-form-element__control';
            }
            this.blankSearchValue = false;
            var searchValue = this.searchText;
            searchContacts({
                    searchValue: searchValue,
                    filterSelected: this.filterSelected,
                    operator: this.filterConditionSelected,
                    accId: this.recordId
                })
                .then(result => {
                    this.searchContactsFound = false;
                    this.searchedContacts = result;
                    if (this.searchedContacts.length > 0) {
                        //Disable No records message...
                        this.searchContactsFound = true;
                        this.showSpinner = false;
                    } else {
                        //Disable No records message...
                        this.searchContactsFound = false;
                        this.noSearchRecordsFound = 'No records found';
                        this.showSpinner = false;
                    }
                })
        } else {
            if (this.template.querySelector('.slds-form-element__control') !== null) {
                this.template.querySelector('.slds-form-element__control').className = 'slds-form-element__control slds-has-error';
            }
            this.blankSearchValue = true;
        }
    }

    handleFilter(event) {
        if (event.target.name === 'filterChoice') {
            this.filterConditionSelected = event.target.value;
        } else if (event.target.name === 'choice') {
            this.filterSelected = event.target.value;
        }
    }

    ClearSearch() {
        //Clearing goes here...
        this.searchText = '';
        this.filterConditionSelected = 'Begins With';
        this.filterSelected = 'Last Name';
        this.disableGo = true;
        this.disableClear = true;
        fetchDefaultContacts({
                'accId': this.recordId
            })
            .then(result => {
                this.dynamicRecordTypeId = result.recordTypeId;
                if (result.returnDefaultContacts.length > 0 && result.returnDefaultContacts !== undefined) {
                    this.searchedContacts = result.returnDefaultContacts;
                    this.searchContactsFound = true;
                    this.noSearchRecordsFound = '';
                } else {
                    this.searchedContacts = [];
                    this.searchContactsFound = false;
                    this.noSearchRecordsFound = '';
                }
            })
            .catch(error => {
                console.log('Error while fetching the contacts ' + error);
            })

    }

    addOrRemoveContacts(event) {
        /* Add New Contacts from Pop Up to new List 'newSurveyContacts' -- START */
        let newSurveyContacts = [...this.newSurveyContacts];
        if (event.detail.checkBoxChecked) {
            let recordAlreadyinList = false;
            for (let i = 0; i < newSurveyContacts.length; i++) {
                if (newSurveyContacts[i].Id === event.detail.newRecord.Id) {
                    recordAlreadyinList = true;
                }
            }
            if (!recordAlreadyinList) {
                newSurveyContacts.push(event.detail.newRecord);
            }
        } else if (!event.detail.checkBoxChecked) {
            for (let i = 0; i < newSurveyContacts.length; i++) {
                if (newSurveyContacts[i].Id === event.detail.newRecord.Id) {
                    newSurveyContacts.splice(i, 1);
                }
            }
        }
        this.newSurveyContacts = newSurveyContacts;

        if (this.newSurveyContacts.length > 0 && this.newSurveyContacts !== undefined) {
            this.showAddContactButton = true;
        } else if (this.newSurveyContacts.length === 0 && this.newSurveyContacts !== undefined) {
            this.showAddContactButton = false;
        }
        /* Add New Contacts from Pop Up to new List 'newSurveyContacts' -- END */


    }

    addContactsToList() {
        console.log('addContactsToList called ');
        this.showSpinner = true;
        let surveyContacts;
        let recordAlreadyExists = false;
        this.count += 1;
        let newContacts;

        /* Logic to append newly added contacts and existing contacts - START */

        this.newSurveyContactsList = [];
        if (this.noRelatedContacts) {
            surveyContacts = [];
            //let newContactsList = Object.assign({}, this.newSurveyContacts);
            for (let i = 0; i < this.newSurveyContacts.length; i++) {
                let newContactsList = Object.assign({}, this.newSurveyContacts[i]);
                if (this.cmc) {
                    if (newContactsList.Correspondence_Type__c != undefined)
                        newContactsList.Correspondence_Type__c = "Customer Survey - Secondary" + ';' + newContactsList.Correspondence_Type__c;
                    else
                        newContactsList.Correspondence_Type__c = "Customer Survey - Secondary";
                }
                surveyContacts.push(newContactsList);
            }
            //surveyContacts = [...this.newContactsList];
        } else {
            // Looping to check if a record already from pop up and trying to add again the same record. 
            //If exists skip it from adding twice
            for (let i = 0; i < this.newSurveyContacts.length; i++) {
                recordAlreadyExists = false;
                for (let j = 0; j < this.surveyContacts.length; j++) {
                    if (this.newSurveyContacts[i].Id === this.surveyContacts[j].Id) {
                        recordAlreadyExists = true;
                    }
                }
                if (!recordAlreadyExists) {
                    newContacts = Object.assign({}, this.newSurveyContacts[i]);

                    // if (this.cmc) {
                    //     if (newContacts.Contact_Source__c != '' && newContacts.Contact_Source__c != undefined) {
                    //         if (!newContacts.Contact_Source__c.includes('CSI'))
                    //             newContacts.Contact_Source__c = newContacts.Contact_Source__c + ';' + 'CSI';
                    //     } else
                    //         newContacts.Contact_Source__c = 'CSI';
                    // } else if (this.sce) {
                    //     if (newContacts.Contact_Source__c != '' && newContacts.Contact_Source__c != undefined) {
                    //         if (!newContacts.Contact_Source__c.includes('SCE'))
                    //             newContacts.Contact_Source__c = newContacts.Contact_Source__c + ';' + 'SCE';
                    //     } else
                    //         newContacts.Contact_Source__c = 'SCE';
                    // } else if (this.vpcrrvp) {
                    //     if (newContacts.Contact_Source__c != '' && newContacts.Contact_Source__c != undefined) {
                    //         if (!newContacts.Contact_Source__c.includes('RVP/VPCR'))
                    //             newContacts.Contact_Source__c = newContacts.Contact_Source__c + ';' + 'RVP/VPCR';
                    //     } else
                    //         newContacts.Contact_Source__c = 'RVP/VPCR';
                    // }

                    if (this.cmc) {
                        if (newContacts.Correspondence_Type__c != undefined)
                            newContacts.Correspondence_Type__c = "Customer Survey - Secondary" + ';' + newContacts.Correspondence_Type__c;
                        else
                            newContacts.Correspondence_Type__c = "Customer Survey - Secondary";
                    }

                    this.newSurveyContactsList.push(newContacts);
                }
            }


            surveyContacts = [...this.newSurveyContactsList, ...this.surveyContacts];
        }

        /* Logic to append newly added contacts and existing contacts - END */

        this.surveyContacts = surveyContacts;
        this.newSurveyContacts = []; // Clearing out the list once record has been added to the table...
        /* Merging existing Survey Contacts and newly Added Survey Contacts -- END */

        this.disableEdit = true;
        this.showSaveCancel = true;
        this.enablePopUp = false;
        this.showAddContactButton = false;
        this.isAddNewSurveyContacts = true;
        if (this.count === 2) {
            this.renderedCallback();
        } else if (this.noRelatedContacts && this.count === 1) {
            this.renderedCallback();
        }
        this.showSpinner = false;
        const value = true;
            const valueChangeEvent = new CustomEvent("valuechange", {
                detail: {
                    value
                }
            });
            // Fire the custom event
            this.dispatchEvent(valueChangeEvent);
    }

    renderedCallback() {
        var editOrCancel = 'Edit';

        if (this.enableRenderedCallback) {
            this.enableRenderedCallback = false;
            //this.noRelatedContacts = true;
            this.isEdit = true;
            /*setTimeout(() => {
                this.noRelatedContacts = false;
            }, 200);*/
            //this.noRelatedContacts = false;
            /*var clientNpsSurveyChild = this.template.querySelectorAll('c-client-nps-survey-child');

            for (var i = 0; i < clientNpsSurveyChild.length; i++) {
                console.log('Record ' + i);
                clientNpsSurveyChild[i].editRecords(editOrCancel);
            } */
        }

        if (this.isAddNewSurveyContacts) {
            this.isAddNewSurveyContacts = false;
            if (this.count === 1 && this.noRelatedContact) {
                this.enableRenderedCallback = true;
            }
            this.count = 0;
            this.noRelatedContacts = false;
            //this.noRelatedContacts = true;
            this.isEdit = true;
            /*setTimeout(() => {
                this.noRelatedContacts = false;
            }, 200);*/
            /* var clientNpsSurveyChild = this.template.querySelectorAll('c-client-nps-survey-child');
 
             for (var i = 0; i < clientNpsSurveyChild.length; i++) {
                 console.log('Record ' + i);
                 clientNpsSurveyChild[i].editRecords(editOrCancel);
             } */

            
        }

        // if(!this.hasCssLoaded){
        //     const style = document.createElement('style');
        //     style.innerText = `.slds-icon-utility-close svg{fill: #fff !important}`;            
        //     this.template.querySelector('.cssContainer').appendChild(style);
        //     this.hasCssLoaded = true;
        //  }

    }

    handleSort(event) {
        //Logic to sort records goes here...
        var selectedItem = event.currentTarget;
        var columnToSort = selectedItem.dataset.record;
        //let columnToSort = event.target.name;
        var handleIconDirection = 'handle' + columnToSort + 'IconDirection';
        var currentFieldIconDirection = '';

        if (columnToSort === 'LastName') {
            currentFieldIconDirection = this.handleLastNameIconDirection;
            if (this.handleLastNameIconDirection === this.arrowDownIcon) {
                this.handleLastNameIconDirection = this.arrowUpIcon;
            } else {
                this.handleLastNameIconDirection = this.arrowDownIcon;
            }
        } else if (columnToSort === 'FirstName') {
            currentFieldIconDirection = this.handleFirstNameIconDirection;
            if (this.handleFirstNameIconDirection === this.arrowDownIcon) {
                this.handleFirstNameIconDirection = this.arrowUpIcon;
            } else {
                this.handleFirstNameIconDirection = this.arrowDownIcon;
            }
        } else if (columnToSort === 'LastName') {
            currentFieldIconDirection = this.handleLastNameIconDirection;
            if (this.handleLastNameIconDirection === this.arrowDownIcon) {
                this.handleLastNameIconDirection = this.arrowUpIcon;
            } else {
                this.handleLastNameIconDirection = this.arrowDownIcon;
            }
        } else if (columnToSort === 'Correspondence_Type__c') {
            currentFieldIconDirection = this.handleCorrespondenceTypeIconDirection;
            if (this.handleCorrespondenceTypeIconDirection === this.arrowDownIcon) {
                this.handleCorrespondenceTypeIconDirection = this.arrowUpIcon;
            } else {
                this.handleCorrespondenceTypeIconDirection = this.arrowDownIcon;
            }
        } else if (columnToSort === 'Survey_Type__c') {
            currentFieldIconDirection = this.handleSurveyTypeIconDirection;
            if (this.handleSurveyTypeIconDirection === this.arrowDownIcon) {
                this.handleSurveyTypeIconDirection = this.arrowUpIcon;
            } else {
                this.handleSurveyTypeIconDirection = this.arrowDownIcon;
            }
        } else if (columnToSort === 'Account.Name') {
            currentFieldIconDirection = this.handleCompanyIconDirection;
            if (this.handleCompanyIconDirection === this.arrowDownIcon) {
                this.handleCompanyIconDirection = this.arrowUpIcon;
            } else {
                this.handleCompanyIconDirection = this.arrowDownIcon;
            }
        }

        let sortResult = Object.assign([], this.surveyContacts);
        this.surveyContacts = sortResult.sort(function (a, b) {
            if (columnToSort !== 'Account.Name' && columnToSort !== 'Correspondence_Type__c') {
                if (a[columnToSort] !== undefined && b[columnToSort] !== undefined) {
                    if (a[columnToSort].toUpperCase() < b[columnToSort].toUpperCase()) {
                        if (currentFieldIconDirection === 'utility:arrowdown') {
                            return -1;
                        } else {
                            return 1;
                        }
                    } else if (a[columnToSort].toUpperCase() > b[columnToSort].toUpperCase()) {
                        if (currentFieldIconDirection === 'utility:arrowup') {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                } else {
                    if (a[columnToSort] === undefined && b[columnToSort] !== undefined) {
                        if (currentFieldIconDirection === 'utility:arrowdown') {
                            return -1;
                        } else {
                            return 1;
                        }
                    } else if (b[columnToSort] === undefined && a[columnToSort] !== undefined) {
                        if (currentFieldIconDirection === 'utility:arrowup') {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                    return 1;
                }
            } else if (columnToSort === 'Account.Name') {
                if (a.Account.Name !== undefined && b.Account.Name !== undefined) {
                    if (a.Account.Name.toUpperCase() < b.Account.Name.toUpperCase()) {
                        if (currentFieldIconDirection === 'utility:arrowdown') {
                            return -1;
                        } else {
                            return 1;
                        }
                    } else if (a.Account.Name.toUpperCase() > b.Account.Name.toUpperCase()) {
                        if (currentFieldIconDirection === 'utility:arrowup') {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                } else {
                    if (a.Account.Name === undefined) {
                        return -1;
                    }
                    return 1;
                }
            } else if (columnToSort === 'Correspondence_Type__c') {
                //Logic to sort based on only primary and secondary
                if (a[columnToSort] !== undefined && b[columnToSort] !== undefined) {
                    if (a[columnToSort].indexOf('Customer Survey - Primary') !== -1 && b[columnToSort].indexOf('Customer Survey - Primary') === -1) {
                        if (currentFieldIconDirection === 'utility:arrowdown') {
                            return -1;
                        } else {
                            return 1;
                        }
                    } else if (a[columnToSort].indexOf('Customer Survey - Secondary') !== -1 && b[columnToSort].indexOf('Customer Survey - Secondary') === -1) {
                        if (currentFieldIconDirection === 'utility:arrowup') {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                } else {
                    if (a[columnToSort] === undefined && b[columnToSort] !== undefined) {
                        if (currentFieldIconDirection === 'utility:arrowdown') {
                            return -1;
                        } else {
                            return 1;
                        }
                    } else if (b[columnToSort] === undefined && a[columnToSort] !== undefined) {
                        if (currentFieldIconDirection === 'utility:arrowup') {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                    return 1;
                }
            }

            return 0;
        });
    }

    closeAndSaveRecords() {
        this.showWarningModel = false;
        let clientNpsSurveyChild = [];
        let noBlankRecords = false;
        /* Logic to check Validation - START*/
        clientNpsSurveyChild = this.template.querySelectorAll('c-client-nps-survey-child-acc');

        for (let i = 0; i < clientNpsSurveyChild.length; i++) {
            clientNpsSurveyChild[i].checkBlankRecords();
        }

        for (let i = 0; i < this.surveyContacts.length; i++) {
            if (this.surveyContacts[i].hasOwnProperty('Id')) {
                if (this.surveyContacts[i].hasOwnProperty('Correspondence_Type__c') && this.surveyContacts[i].Correspondence_Type__c !== undefined) {
                    if (this.surveyContacts[i].Correspondence_Type__c === '') {
                        noBlankRecords = true;
                    } else if (this.surveyContacts[i]['Correspondence_Type__c'].indexOf('Customer Survey - Primary') === -1 && this.surveyContacts[i]['Correspondence_Type__c'].indexOf('Customer Survey - Secondary') === -1) {
                        noBlankRecords = true;
                    }
                } else if (!this.surveyContacts[i].hasOwnProperty('Correspondence_Type__c')) {
                    noBlankRecords = true;
                }

                if (this.surveyContacts[i].hasOwnProperty('Survey_Type__c') && this.surveyContacts[i].Survey_Type__c !== undefined) {
                    if (this.surveyContacts[i].Survey_Type__c === '') {
                        noBlankRecords = true;
                    }
                } else if (!this.surveyContacts[i].hasOwnProperty('Survey_Type__c')) {
                    noBlankRecords = true;
                }

                if (this.surveyContacts[i].hasOwnProperty('Email') && this.surveyContacts[i].Email !== undefined) {
                    if (this.surveyContacts[i].Email === '') {
                        noBlankRecords = true;
                    }

                    var regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (!this.surveyContacts[i].Email.match(regExpEmailformat)) {
                        console.log('Inside  email validation match ');
                        noBlankRecords = true;
                    }
                } else if (!this.surveyContacts[i].hasOwnProperty('Email')) {
                    noBlankRecords = true;
                }

            }
        }
        /* Logic to check Validation - END*/
        if (!noBlankRecords) {
            saveNpsContactData({
                    //Assigning paramters that has to be passed to apex...!!!
                    contactData: this.editedSurveyContacts
                })
                .then(result => {
                    refreshApex(this.masterData);
                    this.closeModal();
                    /*this.surveyContacts = result;
                    this.surveyContactsBackup = result; */
                    this.showSpinner = false;
                })
                .catch(error => {
                    console.log('Error Occured while Saving ' + error);
                });
            this.disableEdit = false;
            this.showSaveCancel = false;
            this.isEdit = false;
        }
    }

    closeWarningPopUp() {
        this.showWarningModel = false;
        this.showRemainderAlertOnce = true;
    }
}