import {
    LightningElement,
    track,
    api,
    wire
} from 'lwc';
import {
    NavigationMixin
} from 'lightning/navigation';
import {
    getPicklistValues
} from 'lightning/uiObjectInfoApi';
import Survey_Type__c from '@salesforce/schema/Contact.Survey_Type__c';
import Contact_Source__c from '@salesforce/schema/Contact.Contact_Source__c';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import {
    getObjectInfo
} from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';

export default class ClientNpsSurveyChildAcc extends NavigationMixin(LightningElement) {
    @api cmc;
    @api vpcrrvp;
    @api sce;
    @api contactsourceValues;
    @api hasTabAccess;
    @api loggedInUserRoleName;
    @api eachcontact;
    @api index;
    @api isEdit = false;
    @track correspondanceTypePickListValues = [];
    @track surveyTypePickListValues = [];
    @track contactSourceListSelectedValues;
    @track contactSourceListValues = [];
    @track eachcontactRecord;
    @track showCorrespondenceErrorMessage = false;
    @track showSurveyTypeErrorMessage = false;
    @track showEmailErrorMessage = false;
    @track correspondenceTypeValue = '';
    @track showvalidationMessage = false;
    hasRendered = false;
    hasDeleteAccess = true;
    @track isReadonlyCmc = true; // Tracker 00003937   @track isReadonlyCmc = false;
    @track isReadonlyCmcEmail =false;
    /**** Added variable to enable survey type for editing ****SHRUTI**** */
    @track isReadonlyCmcSurveyType = false;
    @wire(getPicklistValues, {
        fieldApiName: Survey_Type__c
    })
    propertyOrFunction;
    @track showContactSourceErrorMessage = false;

    @track recordTypeId;
    @wire(getObjectInfo, {
        objectApiName: CONTACT_OBJECT
    })
    wiredObjectInfo({
        error,
        data
    }) {
        if (error) {
            // handle Error
        } else if (data) {
            const rtis = data.recordTypeInfos;
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'CM Contact');
        }
    };

    @wire(getPicklistValues, {
        recordTypeId: '$recordTypeId',
        fieldApiName: Contact_Source__c
    })
    wiredPickListValues({
        data,
        error
    }) {
        if (data) {
          
            this.contactSourceListValues = data.values;
        }

    }
    connectedCallback() {
          if(!this.cmc){
                this.isReadonlyCmc =false;
            } // Tracker 00003937
        let tempcontactRecord = {};
        this.eachcontactRecord = Object.assign({}, this.eachcontact);
        if (this.eachcontactRecord.Contact_Source__c != undefined) {
            if (this.eachcontactRecord.Contact_Source__c.includes(';')) {
                this.eachcontactRecord.Contact_Source__c=this.eachcontactRecord.Contact_Source__c.replaceAll(';', '; ');
            }
            this.contactSourceListSelectedValues = this.eachcontactRecord.Contact_Source__c;
        }
        tempcontactRecord = Object.assign({}, this.eachcontact);
        if (this.eachcontactRecord.hasOwnProperty('Correspondence_Type__c')) {
            // if(this.cmc){
            //     this.eachcontactRecord['Correspondence_Type__c'] = 'Customer Survey - Secondary';
            //     this.correspondenceTypeValue = 'Customer Survey - Secondary';
            //     }
            if (this.eachcontactRecord['Correspondence_Type__c'].indexOf('Customer Survey - Primary') !== -1) {
                //this.eachcontactRecord['Correspondence_Type__c'] = 'Customer Survey - Primary';
                this.correspondenceTypeValue = 'Customer Survey - Primary';
                /***** Added if & Else if Condition to make Survey Type editable when it is blank *****SHRUTI*****START***** */
                if ((this.cmc) && (this.eachcontactRecord['Survey_Type__c'] == null)){
                    console.log('Inside if Shruti');
                    this.isReadonlyCmcSurveyType = false;
                    this.isReadonlyCmc = true;
                }
                else if ((this.cmc) && (this.eachcontactRecord['Survey_Type__c'] != null)){
                    console.log('Inside else if Shruti');
                    this.isReadonlyCmcSurveyType = true;
                    this.isReadonlyCmc = true;
                }

                if ((this.cmc) && (this.eachcontactRecord['Email'] == null)){
                    console.log('Inside if Shruti');
                    this.isReadonlyCmcEmail = false;
                    this.isReadonlyCmc = true;
                }
                else if ((this.cmc) && (this.eachcontactRecord['Email'] != null)){
                    console.log('Inside else if Shruti');
                    this.isReadonlyCmcEmail = true;
                    this.isReadonlyCmc = true;
                }
                /*****SHRUTI*****END*******/  
                   // this.isReadonlyCmc = true;
            } else if (this.eachcontactRecord['Correspondence_Type__c'].indexOf('Customer Survey - Secondary') !== -1) {
                //this.eachcontactRecord['Correspondence_Type__c'] = 'Customer Survey - Secondary';
                this.correspondenceTypeValue = 'Customer Survey - Secondary';
                // if (this.cmc)
                //     this.isReadonlyCmc = false; // Tracker 00003937
            }
        } else {
            if (this.cmc) {
                this.eachcontactRecord['Correspondence_Type__c'] = 'Customer Survey - Secondary';
                this.correspondenceTypeValue = 'Customer Survey - Secondary';
            } else {
                this.eachcontactRecord['Correspondence_Type__c'] = '';
                this.correspondenceTypeValue = '';
            }
        }
       
        this.correspondanceTypePickListValues.push({
            label: 'Customer Survey - Primary',
            value: 'Customer Survey - Primary'
        });
        this.correspondanceTypePickListValues.push({
            label: 'Customer Survey - Secondary',
            value: 'Customer Survey - Secondary'
        });
        this.surveyTypePickListValues = [{ label: 'Online', value: 'Online'},{label: 'Interview',value: 'Interview'},{label: 'Paper (Pre-Approval Required)',value: 'Paper (Pre-Approval Required)'}]

       
        
        const userRole = this.loggedInUserRoleName.Position__c
        
        if( (userRole == 'Client Manager' ||
            userRole == 'Client Management Consultant' ||
            userRole == 'Client Director') &&
            this.contactSourceListSelectedValues) 
        {
            this.hasDeleteAccess = false;
        }
    }

   

    @api
    checkBlankRecords() {
        /* Method created to check the blank record and handle validation */
        if (this.eachcontactRecord !== undefined) {


            /* Check if Correspondence value is blank... If 'Yes', throw validation error - START  */
            if (this.eachcontactRecord.Correspondence_Type__c === '' || this.eachcontactRecord.Correspondence_Type__c === undefined) {
                if (this.template.querySelector('.CorrespondenceTypeDiv') !== null) {
                    this.template.querySelector('.CorrespondenceTypeDiv').className = 'CorrespondenceTypeDiv slds-has-error';
                }
                this.showCorrespondenceErrorMessage = true;
            } else if (this.eachcontactRecord['Correspondence_Type__c'].indexOf('Customer Survey - Primary') === -1 && this.eachcontactRecord['Correspondence_Type__c'].indexOf('Customer Survey - Secondary') === -1) {
                if (this.template.querySelector('.CorrespondenceTypeDiv') !== null) {
                    this.template.querySelector('.CorrespondenceTypeDiv').className = 'CorrespondenceTypeDiv slds-has-error';
                }
                this.showCorrespondenceErrorMessage = true;
            } else {
                if (this.template.querySelector('.CorrespondenceTypeDiv') !== null) {
                    this.template.querySelector('.CorrespondenceTypeDiv').className = 'CorrespondenceTypeDiv';
                }
                this.showCorrespondenceErrorMessage = false;
            }
            /* Check if Correspondence value is blank... If 'Yes', throw validation error - END  */
            /* Check if Survey Type value is blank... If 'Yes', throw validation error - START  */
            if (this.eachcontactRecord.Survey_Type__c === '' || this.eachcontactRecord.Survey_Type__c === undefined) {
                if (this.template.querySelector('.SurveyTypeDiv') !== null) {
                    this.template.querySelector('.SurveyTypeDiv').className = 'SurveyTypeDiv slds-has-error';
                }
                this.showSurveyTypeErrorMessage = true;
            } else {
                if (this.template.querySelector('.SurveyTypeDiv') !== null) {
                    this.template.querySelector('.SurveyTypeDiv').className = 'SurveyTypeDiv';
                }
                this.showSurveyTypeErrorMessage = false;
            }

            if (this.eachcontactRecord.Contact_Source__c === '' || this.eachcontactRecord.Contact_Source__c === undefined) {
                if (this.template.querySelector('.contactSourceDiv') !== null) {
                    this.template.querySelector('.contactSourceDiv').className = 'contactSourceDiv slds-has-error';
                }
                this.showContactSourceErrorMessage = true;
            } else {
                if (this.template.querySelector('.contactSourceDiv') !== null) {
                    this.template.querySelector('.contactSourceDiv').className = 'contactSourceDiv';
                }
                this.showContactSourceErrorMessage = false;
            }

            /* Check if Survey Type value is blank... If 'Yes', throw validation error - END  */
            /* Check if User has not entered email or cleared it... If 'Yes', throw validation error - START  */
            if (this.eachcontactRecord.Email === '' || this.eachcontactRecord.Email === undefined) {
                if (this.template.querySelector('.EmailDiv') !== null) {
                    this.template.querySelector('.EmailDiv').className = 'EmailDiv slds-has-error';
                }
                this.showEmailErrorMessage = true;
            } else {
                if (this.template.querySelector('.EmailDiv') !== null) {
                    this.template.querySelector('.EmailDiv').className = 'EmailDiv';
                }
                this.showEmailErrorMessage = false;
                var regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (this.eachcontactRecord.Email.match(regExpEmailformat)) {
                    this.showvalidationMessage = false;
                } else {
                    this.showvalidationMessage = true;
                }
            }
            /* Check if User has not entered email or cleared it... If 'Yes', throw validation error - END  */
        }

    }

    @api
    highlightRecord(highlightParamter) {
        //Highlighting company name when there is no primary contact for the particular company
        if (highlightParamter === 'addHighlight') {
            if (this.template.querySelector('.companyDiv') !== null) {
                this.template.querySelector('.companyDiv').className = 'companyDiv addBorderTopBottom addBorderLeft';
            }

            if (this.template.querySelector('.LastNameDiv') !== null) {
                this.template.querySelector('.LastNameDiv').className = 'LastNameDiv addBorderTopBottom';
            }

            if (this.template.querySelector('.FirstNameDiv') !== null) {
                this.template.querySelector('.FirstNameDiv').className = 'FirstNameDiv addBorderTopBottom';
            }

            if (this.template.querySelector('.CorrespondenceTypeDiv') !== null) {
                this.template.querySelector('.CorrespondenceTypeDiv').className = 'CorrespondenceTypeDiv addBorderTopBottom';
            }

            if (this.template.querySelector('.SurveyTypeDiv') !== null) {
                this.template.querySelector('.SurveyTypeDiv').className = 'SurveyTypeDiv addBorderTopBottom';
            }

            if (this.template.querySelector('.EmailDiv') !== null) {
                this.template.querySelector('.EmailDiv').className = 'EmailDiv addBorderTopBottom';
            }

            if (this.template.querySelector('.slds-text-align_center') !== null) {
                this.template.querySelector('.slds-text-align_center').className = 'slds-text-align_center addBorderTopBottom addBorderRight';
            }
        } else if (highlightParamter === 'removeHighlight') {
            if (this.template.querySelector('.companyDiv') !== null) {
                this.template.querySelector('.companyDiv').className = 'companyDiv';
            }

            if (this.template.querySelector('.LastNameDiv') !== null) {
                this.template.querySelector('.LastNameDiv').className = 'LastNameDiv';
            }

            if (this.template.querySelector('.FirstNameDiv') !== null) {
                this.template.querySelector('.FirstNameDiv').className = 'FirstNameDiv';
            }

            if (this.template.querySelector('.CorrespondenceTypeDiv') !== null) {
                if (this.template.querySelector('.CorrespondenceTypeDiv').className.indexOf('slds-has-error') !== -1) {
                    this.template.querySelector('.CorrespondenceTypeDiv').className = 'CorrespondenceTypeDiv slds-has-error';
                } else {
                    this.template.querySelector('.CorrespondenceTypeDiv').className = 'CorrespondenceTypeDiv';
                }

            }

            if (this.template.querySelector('.SurveyTypeDiv') !== null) {
                if (this.template.querySelector('.SurveyTypeDiv').className.indexOf('slds-has-error') !== -1) {
                    this.template.querySelector('.SurveyTypeDiv').className = 'SurveyTypeDiv slds-has-error';
                } else {
                    this.template.querySelector('.SurveyTypeDiv').className = 'SurveyTypeDiv';
                }
            }

            if (this.template.querySelector('.EmailDiv') !== null) {
                if (this.template.querySelector('.EmailDiv').className.indexOf('slds-has-error') !== -1) {
                    this.template.querySelector('.EmailDiv').className = 'EmailDiv slds-has-error';
                } else {
                    this.template.querySelector('.EmailDiv').className = 'EmailDiv';
                }
            }

            if (this.template.querySelector('.slds-text-align_center') !== null) {
                this.template.querySelector('.slds-text-align_center').className = 'slds-text-align_center';
            }
        }
    }

    

    updateChanges(event) {
        if (event.target.name === 'Correspondence_Type__c') {
            if (event.target.value !== '' && event.target.value !== undefined) {
                if (event.target.value == 'Customer Survey - Primary') {
                    if (this.cmc) {
                        const evt = new ShowToastEvent({
                            title: 'Error',
                            message: 'Only SCE’s and RVP/VPCR can designate a contact as Primary. CM/CMC are not allowed to designate a contact as Primary.',
                            variant: 'error',
                        });
                        this.dispatchEvent(evt);
                        event.target.value = this.correspondenceTypeValue;
                        return false;
                    } 
                    // this.correspondenceTypeValue =undefined;

                }
            }
        }

        if (event.target.name === 'Survey_Type__c') {
            if (event.target.value !== '' && event.target.value !== undefined) {
                if (event.target.value == 'Interview') {
                    if (this.cmc) {
                        const evt = new ShowToastEvent({
                            title: 'Error',
                            message: 'Only SCE’s and RVP/VPCR can nominate a contact for the interview. CM/CMC are not allowed to nominate a contact for an Interview.',
                            variant: 'error',
                        });
                        this.dispatchEvent(evt);
                        event.target.value = this.eachcontact.Survey_Type__c;
                        return false;
                    }

                }
            }
        }


        let editedRecord = {};
        let contactEventData;
        var changes = event.target.value;
        var fieldEdited = event.target.name;

        editedRecord = Object.assign({}, this.eachcontactRecord);

        /* Handle CSS for removing error message when Correspondence value/ Survey type is not Selected - START */
        if (event.target.name === 'Correspondence_Type__c') {
            if (event.target.value !== '' && event.target.value !== undefined) {
               
                if (this.template.querySelector('.CorrespondenceTypeDiv') !== null) {
                    if (this.template.querySelector('.CorrespondenceTypeDiv').className.indexOf('addBorderTopBottom') !== -1) {
                        this.template.querySelector('.CorrespondenceTypeDiv').className = 'CorrespondenceTypeDiv addBorderTopBottom';
                    } else {
                        this.template.querySelector('.CorrespondenceTypeDiv').className = 'CorrespondenceTypeDiv';
                    }
                    this.showCorrespondenceErrorMessage = false;
                }
            }
        } else if (event.target.name === 'Survey_Type__c') {
            if (event.target.value !== '' && event.target.value !== undefined) {
                if (this.template.querySelector('.SurveyTypeDiv') !== null) {
                    if (this.template.querySelector('.SurveyTypeDiv').className.indexOf('addBorderTopBottom') !== -1) {
                        this.template.querySelector('.SurveyTypeDiv').className = 'SurveyTypeDiv addBorderTopBottom';
                    } else {
                        this.template.querySelector('.SurveyTypeDiv').className = 'SurveyTypeDiv';
                    }
                    this.showSurveyTypeErrorMessage = false;
                }
            }
        } else if (event.target.name === 'Email') {
            if (event.target.value !== '' && event.target.value !== undefined) {
                if (this.template.querySelector('.EmailDiv') !== null) {
                    if (this.template.querySelector('.EmailDiv').className.indexOf('addBorderTopBottom') !== -1) {
                        this.template.querySelector('.EmailDiv').className = 'EmailDiv addBorderTopBottom';
                    } else {
                        this.template.querySelector('.EmailDiv').className = 'EmailDiv';
                    }
                    this.showEmailErrorMessage = false;
                }
            }
        } else if (event.target.name === 'CSI Survey Contact') {
            if (event.target.checked) {
                editedRecord.CSI_Survey_Contact__c = true;
            } else {
                editedRecord.CSI_Survey_Contact__c = false;
            }
        }

        /* Handle CSS for removing error message when Correspondence value/ Survey type is not Selected - END */

        if (fieldEdited !== 'Delete' && fieldEdited !== 'Correspondence_Type__c') {
            if (changes !== null && changes !== undefined) {
                editedRecord[fieldEdited] = changes;
                this.eachcontactRecord = editedRecord;
            }
        } else if (fieldEdited === 'Delete') {
            
            editedRecord['Correspondence_Type__c'] = this.eachcontact['Correspondence_Type__c'];
        } 
        else if (fieldEdited === 'Correspondence_Type__c') {
            if (this.eachcontact.hasOwnProperty('Correspondence_Type__c')) {
                let oldCorrespondenceValues = this.eachcontact['Correspondence_Type__c'].split(';');
                let correspondeceValue = '';
                for (let i = 0; i < oldCorrespondenceValues.length; i++) {
                    if (changes === 'Customer Survey - Primary' && oldCorrespondenceValues[i] !== 'Customer Survey - Secondary') {
                        correspondeceValue = correspondeceValue + oldCorrespondenceValues[i] + ';';
                    }
                    if (changes === 'Customer Survey - Secondary' && oldCorrespondenceValues[i] !== 'Customer Survey - Primary') {
                        correspondeceValue = correspondeceValue + oldCorrespondenceValues[i] + ';';
                    }

                    if (i === oldCorrespondenceValues.length - 1) {
                        /* Added if condition to check if Correspondence_Type__c is having same value then dont add Correspondence_Type__c ****SHRUTI****START**** */
                        let correspondeceValueAfterSplit = correspondeceValue.split(';');
                        if(correspondeceValueAfterSplit.includes(changes)) {
                           correspondeceValue = correspondeceValue + ';';
                        }
                        else {
                            correspondeceValue = correspondeceValue + changes + ';';
                        }
                        console.log('correspondeceValue ----->>>'+correspondeceValue);
                        /* ****SHRUTI****END**** */
                    }
                }
                if (editedRecord.Contact_Source__c == undefined) {
                    editedRecord.Contact_Source__c = [];
                }
                // if (this.cmc) {
                //     if (!editedRecord.Contact_Source__c.includes('CSI')) {
                //         editedRecord.Contact_Source__c.push('CSI');
                //     }
                // } else if (this.sce) {
                //     if (!editedRecord.Contact_Source__c.includes('SCE'))
                //         editedRecord.Contact_Source__c.push('SCE');
                // } else if (this.vpcrrvp) {
                //     if (!editedRecord.Contact_Source__c.includes('RVP/VPCR'))
                //         editedRecord.Contact_Source__c.push('RVP/VPCR');
                // }
                this.correspondenceTypeValue = event.target.value;
                editedRecord['Correspondence_Type__c'] = correspondeceValue;
                this.eachcontactRecord['Correspondence_Type__c'] = correspondeceValue;
            } else {
                editedRecord[fieldEdited] = changes;
                this.eachcontactRecord['Correspondence_Type__c'] = changes;
                this.correspondenceTypeValue = changes;
            }
        }
       

        
        contactEventData = {
            'editedRecord': editedRecord,
            'index': this.index,
            'fieldEdited': fieldEdited,
            'editMode': this.isEdit
            
        }
        const evnt = new CustomEvent('editcontact', { detail: contactEventData});
       
        this.dispatchEvent(evnt);
    }

    navigateToObjectHome() {
        // Navigate to the Account home page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.eachcontact.Id,
                objectApiName: 'Contact',
                actionName: 'view',
            },
        });
    }

    renderedCallback() {
        if (this.template.querySelector('.SurveyTypeDiv') === null || this.hasRendered === true) return;
        this.hasRendered = true;
        let style = document.createElement('style');
        style.innerText = ` 
    .slds-dropdown_fluid, .slds-dropdown--fluid {
          min-width: 100%;
          max-width: 100%;
          width: 100% !important;
      }
    `;
        this.template.querySelector('.SurveyTypeDiv').appendChild(style);
    }

}