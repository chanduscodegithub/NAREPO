import { LightningElement, api, wire, track } from 'lwc';
import saveServiceAMT from '@salesforce/apex/ClientSurveyCtrl.saveServiceAMT';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
/*Added Helptext in custom Label and added method to fetch Role from Custom Metadata Type for Case No :00003464 *****SHRUTI*****START*****/
import AcctTeamMemberHelpText from '@salesforce/label/c.Client_Survey_tab_Account_Team_Members_Section_Help_Text';
import MainRole_HelpText from '@salesforce/label/c.MainRole_HelpText';
import Exclude_AMT_Role_From_Survey_Section_Help_Text from '@salesforce/label/c.Exclude_AMT_Role_From_Survey_Section_Help_Text';
import Error_Message_for_Primary_Role_in_Client_Survey from '@salesforce/label/c.Error_Message_for_Primary_Role_in_Client_Survey';
import getAMTRoles from '@salesforce/apex/ClientSurveyCtrl.getAMTRoles';
import fetchServiceAMT from '@salesforce/apex/ClientSurveyCtrl.fetchServiceAMT';
/******SHRUTI******END******/
//Added Vignesh 
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import BusinessLine from '@salesforce/schema/Account.Subtype__c';

const fields = [BusinessLine];

export default class ClientSurveyServiceAMT extends LightningElement {
    @api isCMCMCADMIN;
    @api isSce;
    @api surveyAMTmembers;
    @api cmSCE;
    @api cmsceId;
    @api cmSCELastName;
    @api specialitySCEIn;
    specialitySCEInFN = '';
    specialitySCEInLN = '';
    /*@api
    get specialitySCEIn() {
        return this.specialitySCEIn
    }
    set specialitySCEIn(value) {
                    let a = value.split(' ');
                    this.specialitySCEInLN = a[1];
                    this.specialitySCEInFN = a[0];
                    this.showSCECheckBox = true;
    }*/


    @api userRole;
    @api hasEditAccess;
    @api excludeSpecialtyBenefitsSCESurvey
    @api recordId;
    @track previewArray = [];
    @api clientSurveyCustomPermission;
    @api businessLine;
    /*******SHRUTI******START*********/
    labelAcctTeamMemberHelpText = AcctTeamMemberHelpText;
    mainRoleHelpText = MainRole_HelpText;
    label_Exclude_AMT_Role_From_Survey_Section_Help_Text = Exclude_AMT_Role_From_Survey_Section_Help_Text;
    /*******SHRUTI******END*********/
    showTable = true;
    
    sfdcBaseURL;
    isEdit = false;
    showSpinner = false;
    isColumnVisible = true;
    showSCECheckBox = false;
    serviceAmtClone;
    @track isUnchanged = true;
    // Added Vignesh
    subtype=[];
    onShow;


    primaryValue;
    @track checkedRoles;
    @track previewDataArray;
    /*Removed static Role Value and fetched from Custom Metadata, also removed 'Rally Account Executive' from Role as per Case No: 00003464 *****SHRUTI***START****/
    /*roleSequence = ['Specialty Benefits Consultant','Client Manager','Client Management Consultant','Service Account Manager',
                    'UHC Medical Director','Clinical Account Executive','Health Analytics Consultant','Engagement Solutions Consultant',
                    'UMR Client Manager','UMR Care Management Consultant','UMR Customer Specialist','UMR Plan Analyst','OptumRx National Account Executive',
                    'Optum Client Executive/Manager','Rally Account Executive', 'Retiree Account Executive','Retiree Client Manager','Retiree Service Account Manager'];*/
    error;
    roleSequence = [];
    serviceAMTmembers = [];
    contactRole;
    /*******SHRUTI******END*********/

    primaryRoles = ['Client Manager', 'Client Management Consultant', 'Service Account Manager'];

    hideExcludeAMTCheckbox = ['Client Manager', 'Client Management Consultant'];


     //Added Vignesh - For Client Survey Changes 
     @wire(getRecord, { recordId: "$recordId", fields })
     account({ error, data })
    {
         if (data) {
            this.fieldValue = getFieldValue(data,BusinessLine);
            this.onShow= (this.fieldValue==='Specialty Benefits Only'?false:true);
 
         } else if (error) {
             console.error(error);
         }
     }
     //
     

    get isDisabled() {
        if ((this.isSce || this.isCMCMCADMIN || this.clientSurveyCustomPermission) && this.isEdit)
            return !this.isEdit;
        else
            return true;
    }

    get isDisabledAMT() {
        return !this.isEdit;
    }

    connectedCallback() {
        const roleVsMember = [];
        /*******SHRUTI******START*********/
        getAMTRoles({bLine:this.businessLine})
            .then(result => {
                this.roleSequence = result;
                //this.roleSequence = result.sort();
                //this.roleSequence = result.sort((a,b)=>a.label.localeCompare(b.label));
                this.error = undefined;
                console.log('this.Roles Inside--->' + JSON.stringify(this.roleSequence));
                for (let role of this.roleSequence) {
                    console.log('Inside For');
                    roleVsMember[role] = { 'roleName': role, surveyAMTmembers: [], hasMembers: false, isPrimaryRole: this.primaryRoles.includes(role) };
                    //console.log(' this.roleVsMember'+JSON.stringify(this.roleVsMember[role]));
                }
                console.log('roleVsMember-->' + roleVsMember);
                this.sfdcBaseURL = window.location.origin;

                if (this.specialitySCEIn != undefined) {
                    let a = this.specialitySCEIn.split(' ');
                    this.specialitySCEInLN = a[1];
                    this.specialitySCEInFN = a[0];
                    this.showSCECheckBox = true;
                }

                if (this.surveyAMTmembers && this.surveyAMTmembers.length > 0) {
                    this.surveyAMTmembers = JSON.parse(JSON.stringify(this.surveyAMTmembers));
                    this.serviceAmtClone = JSON.parse(JSON.stringify(this.surveyAMTmembers));
                    for (let i = 0; i < this.surveyAMTmembers.length; i++) {

                        if (this.roleSequence.includes(this.surveyAMTmembers[i].Contact_Role__c)) {
                            const firstname = (!this.surveyAMTmembers[i].First_Name__c) ? '' : this.surveyAMTmembers[i].First_Name__c;
                            const lastname = (!this.surveyAMTmembers[i].Last_Name__c) ? '' : this.surveyAMTmembers[i].Last_Name__c;
                            const amtObj = {
                                'id': this.sfdcBaseURL + '/' + this.surveyAMTmembers[i].Id,
                                'role': this.surveyAMTmembers[i].Contact_Role__c,
                                'FirstName': firstname,
                                'LastName': lastname,
                                'Primary': this.surveyAMTmembers[i].Primary__c ? 'Main' : '',
                                'Exclude_AMT_Role_from_Survey': this.surveyAMTmembers[i].Exclude_AMT_Role_from_Survey__c,
                                'index': i,
                                'ShowExcludeAMTCheckBox': !this.hideExcludeAMTCheckbox.includes(this.surveyAMTmembers[i].Contact_Role__c)
                            };
                            /**Removed if condition so that Main role should not be disable when that role is added in People Tab *****SHRUTI***** */
                            /* if(!this.primaryRoles.includes(this.surveyAMTmembers[i].Contact_Role__c)){
                                 amtObj.Primary = '';
                             }*/

                            if (this.surveyAMTmembers[i].Primary__c) {
                                roleVsMember[this.surveyAMTmembers[i].Contact_Role__c].surveyAMTmembers.unshift(amtObj);
                            } else {
                                roleVsMember[this.surveyAMTmembers[i].Contact_Role__c].surveyAMTmembers.push(amtObj);
                            }

                            roleVsMember[this.surveyAMTmembers[i].Contact_Role__c].hasMembers = true;
                        }
                    }
                }

                for (const key in roleVsMember) {
                    this.previewArray.push(roleVsMember[key])
                }

                console.log('Shruti list PreviewArray   ' + JSON.stringify(this.previewArray))
            })
            .catch(error => {
                this.error = error;
                this.roleSequence = undefined;
            })
        console.log('this.Roles--->' + JSON.stringify(this.roles));
        /*******SHRUTI******END*********/
    }

    handleEditClick() {
        this.isEdit = !this.isEdit;
        const value = true;
        const valueChangeEvent = new CustomEvent("valuechange", {
            detail: {
                value
            }
        });
        // Fire the custom event
        this.dispatchEvent(valueChangeEvent);
    }

    handleCancel() {
        this.showSpinner = true;
        this.showTable = false;
        const value = false;
        const valueChangeEvent = new CustomEvent("valuechange", {
            detail: {
                value
            }
        });
        // Fire the custom event
        this.dispatchEvent(valueChangeEvent);
        setTimeout(() => {
            this.isEdit = !this.isEdit;
            if (this.serviceAmtClone != '' && this.serviceAmtClone != undefined)
                this.surveyAMTmembers = JSON.parse(JSON.stringify(this.serviceAmtClone));
            this.showTable = true;
            this.showSpinner = false;
        }, 700)

    }

    checkboxChange(event) {
        const value = event.target.checked
        const index = event.currentTarget.dataset.index
        this.surveyAMTmembers[index].Exclude_AMT_Role_from_Survey__c = value
    }

    checkPrimaryValue(event) {
        debugger;
        const value = event.target.checked;
        const index = event.currentTarget.dataset.index;
        let targetId = event.target.dataset.id;
        this.surveyAMTmembers[index].Primary__c = value
        var isprimaryexists = 0;
        if (this.surveyAMTmembers.length > 0) {
            for (var i = 0; i < this.surveyAMTmembers.length; i++) {
                if (value) {
                    if (i != index && this.surveyAMTmembers[i].Primary__c)
                        if (this.surveyAMTmembers[i].Contact_Role__c == this.surveyAMTmembers[index].Contact_Role__c) {
                            isprimaryexists = isprimaryexists + 1;
                        }
                }
            }
            if (isprimaryexists >= 1) {
                setTimeout(() => {
                    this.surveyAMTmembers[index].Primary__c = false;
                    this.template.querySelector(`[data-id="${targetId}"]`).checked = false;
                }, 100)
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: Error_Message_for_Primary_Role_in_Client_Survey,
                    variant: 'error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
            }
            else if (value) {
                setTimeout(() => {
                    this.surveyAMTmembers[index].Primary__c = true;
                }, 700)
                console.log('Value of this.surveyAMTmembers[index].Primary__c--->' + this.surveyAMTmembers[index].Primary__c);
            }
        }

    }
    handleSave() {
        var mapOfValues = {};


        const companyRecord = {
            sobjectType: "Account",
            Id: this.recordId,
            Exclude_Specialty_Benefits_SCE_Survey__c: this.template.querySelector('.excludeSCECheckbox') ? this.template.querySelector('.excludeSCECheckbox').checked : false
        };

        fetchServiceAMT({ accId: this.recordId })
            .then(result => {
                this.serviceAMTmembers = result;
                this.error = undefined;
                console.log('serviceAMTmembers Inside--->' + JSON.stringify(this.serviceAMTmembers));
                if(this.serviceAMTmembers.length>0){
                const surveyAMTList = this.surveyAMTmembers.filter(item => this.serviceAMTmembers.some(a => a.Contact_Role__c === item.Contact_Role__c))
                console.log('surveyAMTList Inside--->' + JSON.stringify(surveyAMTList));
                this.showSpinner = true;
                for (var i = 0; i < surveyAMTList.length; i++) {
                    var role = surveyAMTList[i].Contact_Role__c;
                    var primaryValue = surveyAMTList[i].Primary__c;
                    if (mapOfValues[role]) {
                        mapOfValues[role].push(primaryValue);
                    } else {
                        mapOfValues[role] = [primaryValue];
                    }
                }
            }
                if (Object.keys(mapOfValues).some(key => mapOfValues[key].length > 1 && mapOfValues[key].every(value => value === false))) {
                    const sameRole = Object.keys(mapOfValues).filter(key => mapOfValues[key].length > 1 && mapOfValues[key].every(value => value === false));
                    const sameroleWithSpace = sameRole.join(', ');
                    console.log('role with space--->' + sameroleWithSpace);
                    console.log('role--->' + sameRole);
                    this.showSpinner = false;
                    const evt = new ShowToastEvent({
                        title: 'Error',
                        message: 'There are two or more members with same role (' + (sameroleWithSpace) + '), please flag one AMT member as a main for this role.',
                        variant: 'error',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(evt);
                    return false;
                }
                else {
                    this.isEdit = !this.isEdit;
                    this.showSpinner = true;
                    saveServiceAMT({ lstServiceAMT: this.surveyAMTmembers, objCompany: companyRecord }).
                        then(data => {
                            this.showSpinner = false
                            const evt = new ShowToastEvent({
                                title: 'Success',
                                message: 'Data updated successfully',
                                variant: 'success',
                                mode: 'dismissable'
                            });
                            this.dispatchEvent(evt);

                            // this.serviceAmtClone =JSON.parse(JSON.stringify(this.surveyAMTmembers));
                        }).catch(errors => {
                            let message = 'Unknown error';

                            if (errors && Array.isArray(errors) && errors.length > 0) {
                                for (i = 0; i < errors.length; i++) {
                                    message = message + 'Error' + i + ':' + errors[i].message;
                                }
                            }
                            console.log(errors)
                            const evt = new ShowToastEvent({
                                title: 'Error',
                                message: message,
                                variant: 'error',
                            });
                            this.dispatchEvent(evt);
                            this.showSpinner = false;
                        })
                    const value = false;
                    const valueChangeEvent = new CustomEvent("valuechange", {
                        detail: {
                            value
                        }
                    });

                    this.dispatchEvent(valueChangeEvent);
                }
            })
            .catch(error => {
                this.error = error;
                this.serviceAMTmembers = undefined;
            })
    }
    refresh(event) {
        const valueChangeEvent = new CustomEvent("refresh", {});
        this.dispatchEvent(valueChangeEvent);
    }
}