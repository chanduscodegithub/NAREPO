import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import Survey_Type__c from '@salesforce/schema/Contact.Survey_Type__c';

export default class ClientNpsSurveyChild extends NavigationMixin(LightningElement) {
    @api eachcontact;
    @api index;
    @api isEdit = false;
    @track correspondanceTypePickListValues = [];
    @track surveyTypePickListValues = [];
    @track eachcontactRecord;
    @track showCorrespondenceErrorMessage = false;
    @track showSurveyTypeErrorMessage = false;
    @track showEmailErrorMessage = false;
    @track correspondenceTypeValue = '';
    @track showvalidationMessage = false;
    hasRendered = false;

    @wire(getPicklistValues, { fieldApiName: Survey_Type__c })
    propertyOrFunction;


    connectedCallback() {
        let tempcontactRecord = {};
        this.eachcontactRecord = Object.assign({}, this.eachcontact);
        tempcontactRecord = Object.assign({}, this.eachcontact);
        if (this.eachcontactRecord.hasOwnProperty('Correspondence_Type__c')) {
            if (this.eachcontactRecord['Correspondence_Type__c'].indexOf('Customer Survey - Primary') !== -1) {
                //this.eachcontactRecord['Correspondence_Type__c'] = 'Customer Survey - Primary';
                this.correspondenceTypeValue = 'Customer Survey - Primary';
            } else if (this.eachcontactRecord['Correspondence_Type__c'].indexOf('Customer Survey - Secondary') !== -1) {
                //this.eachcontactRecord['Correspondence_Type__c'] = 'Customer Survey - Secondary';
                this.correspondenceTypeValue = 'Customer Survey - Secondary';
            }
        } else {
            this.eachcontactRecord['Correspondence_Type__c'] = '';
            this.correspondenceTypeValue = '';
        }
        //this.eachcontactRecord = tempcontactRecord;
        console.log('tempcontactRecord ' + JSON.stringify(this.eachcontactRecord));
        this.correspondanceTypePickListValues.push({ label: 'Customer Survey - Primary', value: 'Customer Survey - Primary' });
        this.correspondanceTypePickListValues.push({ label: 'Customer Survey - Secondary', value: 'Customer Survey - Secondary' });

        this.surveyTypePickListValues.push({ label: 'Online', value: 'Online' });
        this.surveyTypePickListValues.push({ label: 'Interview', value: 'Interview' });
        this.surveyTypePickListValues.push({ label: 'Paper', value: 'Paper' });
    }

    /*@api
    editRecords(editOrCancel) {
        console.log('Child Edit/Cancel Called ');

        if(editOrCancel === 'Edit') {
            this.isEdit = true;
        } else if(editOrCancel === 'Cancel') {
            this.isEdit = false;
            this.eachcontactRecord = this.eachcontact;
        }
    }*/

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
        if(highlightParamter === 'addHighlight') {
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
        } else if(highlightParamter === 'removeHighlight') {
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
                if(this.template.querySelector('.CorrespondenceTypeDiv').className.indexOf('slds-has-error') !== -1) {
                    this.template.querySelector('.CorrespondenceTypeDiv').className = 'CorrespondenceTypeDiv slds-has-error';
                } else {
                    this.template.querySelector('.CorrespondenceTypeDiv').className = 'CorrespondenceTypeDiv';
                }
                
            }

            if (this.template.querySelector('.SurveyTypeDiv') !== null) {
                if(this.template.querySelector('.SurveyTypeDiv').className.indexOf('slds-has-error') !== -1) {
                    this.template.querySelector('.SurveyTypeDiv').className = 'SurveyTypeDiv slds-has-error';
                } else {
                    this.template.querySelector('.SurveyTypeDiv').className = 'SurveyTypeDiv';
                }
            }

            if (this.template.querySelector('.EmailDiv') !== null) {
                if(this.template.querySelector('.EmailDiv').className.indexOf('slds-has-error') !== -1) {
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
        let editedRecord = {};
        let contactEventData;
        var changes = event.target.value;
        var fieldEdited = event.target.name;

        editedRecord = Object.assign({}, this.eachcontactRecord);

        /* Handle CSS for removing error message when Correspondence value/ Survey type is not Selected - START */
        if (event.target.name === 'Correspondence_Type__c') {
            if (event.target.value !== '' && event.target.value !== undefined) {
                if (this.template.querySelector('.CorrespondenceTypeDiv') !== null) {
                    if(this.template.querySelector('.CorrespondenceTypeDiv').className.indexOf('addBorderTopBottom') !== -1) {
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
                    if(this.template.querySelector('.SurveyTypeDiv').className.indexOf('addBorderTopBottom') !== -1) {
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
                    if(this.template.querySelector('.EmailDiv').className.indexOf('addBorderTopBottom') !== -1) {
                        this.template.querySelector('.EmailDiv').className = 'EmailDiv addBorderTopBottom';
                    } else {
                        this.template.querySelector('.EmailDiv').className = 'EmailDiv';
                    }
                    this.showEmailErrorMessage = false;
                }
            }
        }

        /* Handle CSS for removing error message when Correspondence value/ Survey type is not Selected - END */

        if (fieldEdited !== 'Delete' && fieldEdited !== 'Correspondence_Type__c') {
            if (changes !== null && changes !== undefined) {
                editedRecord[fieldEdited] = changes;
                this.eachcontactRecord = editedRecord;
                //editedRecord['Correspondence_Type__c'] = this.eachcontact['Correspondence_Type__c'];
            }
        } else if (fieldEdited === 'Delete') {
            editedRecord['Correspondence_Type__c'] = this.eachcontact['Correspondence_Type__c'];
        } else if (fieldEdited === 'Correspondence_Type__c') {
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
                        correspondeceValue = correspondeceValue + changes + ';';
                    }
                }
                this.correspondenceTypeValue = event.target.value;
                editedRecord['Correspondence_Type__c'] = correspondeceValue;
                this.eachcontactRecord['Correspondence_Type__c'] = correspondeceValue;
            }
            else {
                editedRecord[fieldEdited] = changes;
                this.eachcontactRecord['Correspondence_Type__c'] = changes;
                this.correspondenceTypeValue = changes;
            }
        } /*else if(fieldEdited === 'Email') {
            var regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(changes.match(regExpEmailformat)){

            }
        } */

        if (this.isEdit) {
            contactEventData = {
                'editedRecord': editedRecord, 'index': this.index, 'fieldEdited': fieldEdited,
                'editMode': true
            }
            const evnt = new CustomEvent('editcontact', {
                // detail contains only primitives
                detail: contactEventData
            });
            // Fire the event 
            this.dispatchEvent(evnt);
        } else {
            contactEventData = {
                'editedRecord': editedRecord, 'index': this.index, 'fieldEdited': fieldEdited,
                'editMode': false
            }
            const evnt = new CustomEvent('editcontact', {
                // detail contains only primitives
                detail: contactEventData
            });
            // Fire the event 
            this.dispatchEvent(evnt);
        }

    }

    navigateToObjectHome() {
        // Navigate to the Account home page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId : this.eachcontact.Id,
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