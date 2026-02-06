/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 11-07-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import SccObject from '@salesforce/schema/Sold_Case_Checklist__c';
import historicData from '@salesforce/schema/Sold_Case_Checklist__c.Historic_Data__c';
import historicDataMedicalOrRx from '@salesforce/schema/Sold_Case_Checklist__c.Historic_Data_Medical_or_Rx__c';

const EXT_VENDOR_HEADING = 'External Vendors to Integrate';
const ELIG_VENDOR_HEADING = 'Eligibility Vendor(s)';
const EXT_VENDOR_REF = 'External_Vendors_to_Integrate';
const ELIG_VENDOR_REF = 'Eligibility_Vendor';

const EXT_VENDOR_HELP_TEXT = 'List Vendor Name, Service Provided, File Frequency, Type of Data, Purpose for Sharing Data, Direction of Exchange (for example Sedgwick - disability vendor, monthly, eligibility data, identify members enrolled in disability benefits, outbound from UHC)';

export default class soldCaseVendorPartners extends LightningElement {


    @api soldCaseCheckListInstructions;
    @api opportunityFieldLabels;
    @api accountFieldLabels;
    @api companyAddress;
    @api userTimeZone;
    @api completeDataFromParent;
    @api historicDataMedicalOrRxValues;
    @api historicDataMedicalOrRx;
    @api showHistoricDataMedicalOrRx;
    @track finalDependentVal = [];
    @track historicDataValues;
    @track soldCaseDataCopy;
    @track recordDetail;
    @track dependentPicklist;
    @track activeSections = "Vendor Partners/Integrations";
    @track eligibilityVendorLst = [];
    @track externalVendorLst = [];
    enableEdit;
    disableButtons;

    @api
    get editmode() {
        return this.enableEdit
    }
    set editmode(value) {
        this.enableEdit = value;
        this.disableButtons = !value
    }

    @api
    get checkdetail() {
        return this.masterData;
    }
    set checkdetail(value) {
        this.masterData = Object.assign({}, value);
        this.recordDetail = Object.assign({}, value);
    }
    get isDataReceived() {
        if (this.recordDetail !== undefined && this.accountFieldLabels !== undefined && this.opportunityFieldLabels !== undefined) {
            return true;
        }
        return false;
    }

    @api
    get soldCaseObjectData() {
        return soldCaseObjectData;
    }
    set soldCaseObjectData(value) {
        console.log('inside soldCaseObjectData');
        this.eligibilityVendorLst = [];
        this.externalVendorLst = [];
        this.soldCaseDataCopy = Object.assign({}, value);
        this.eligibilityVendorLst[0] = {
            showAddButton: true,
            showRemoveButton: false,
            rowHeading: ELIG_VENDOR_HEADING,
            value: this.soldCaseDataCopy['Eligibility_Vendor__c']
        };
        this.externalVendorLst[0] = {
            showAddButton: true,
            showRemoveButton: false,
            rowHeading: EXT_VENDOR_HEADING,
            extVendHelpText: EXT_VENDOR_HELP_TEXT,
            value: this.soldCaseDataCopy['Niche_Vendors_to_Integrate__c']
        };
        console.log('constructring array')

        for (let i = 1; i < 5; i++) {
            this.createVendorRecords(i, ELIG_VENDOR_REF, true)
        }

        for (let i = 1; i < 10; i++) {
            this.createVendorRecords(i, EXT_VENDOR_REF, true)
        }

    }

    createVendorRecords(index, fieldReference, checkValue) {
        index = parseInt(index);
        let recordList;
        if (fieldReference == ELIG_VENDOR_REF) {
            recordList = this.eligibilityVendorLst;
        } else if (fieldReference == EXT_VENDOR_REF, EXT_VENDOR_HEADING) {
            recordList = this.externalVendorLst;
        }
        const fieldName = fieldReference + '_' + (index + 1) + '__c'

        if (index == 0
            || (fieldReference == ELIG_VENDOR_REF && index > 4)
            || (fieldReference == EXT_VENDOR_REF && index > 9)
            || (checkValue && !this.soldCaseDataCopy[fieldName])
        )
            return;
        let showButton = (fieldReference == ELIG_VENDOR_REF && index < 4) || (fieldReference == EXT_VENDOR_REF && index < 9)
        recordList[index] = {
            showAddButton: showButton,
            showRemoveButton: true,
            rowHeading: '',
            extVendHelpText: '',
            value: checkValue ? this.soldCaseDataCopy[fieldName] : ''
        };

        recordList[index - 1].showAddButton = false;
        recordList[0].showRemoveButton = true;
    }


    addVendorFunction(event) {
        let index = parseInt(event.currentTarget.dataset.buttonindex) + 1;
        let fieldreference = event.currentTarget.dataset.fieldreference;
        console.log(fieldreference, '==fieldreference');
        this.createVendorRecords(index, fieldreference)
    }

    deleteVendorFunction(event) {
        let index = parseInt(event.currentTarget.dataset.buttonindex);
        let fieldreference = event.currentTarget.dataset.fieldreference;

        if (fieldreference == ELIG_VENDOR_REF) {
            let listToUpdate = Array.from(this.template.querySelectorAll('.eligibleVendorCls'));
            listToUpdate.forEach((element, index) => {
                if (element.value) {
                    this.eligibilityVendorLst[index].value = element.value
                }
            })

            this.rearrangeArray(this.eligibilityVendorLst, ELIG_VENDOR_HEADING, index, ELIG_VENDOR_REF)
        }
        else if (fieldreference == EXT_VENDOR_REF) {
            let listToUpdate = Array.from(this.template.querySelectorAll('.externalVendorCls'));
            listToUpdate.forEach((element, index) => {
                if (element.value) {
                    this.externalVendorLst[index].value = element.value
                }
            })
            this.rearrangeArray(this.externalVendorLst, EXT_VENDOR_HEADING, index, EXT_VENDOR_REF)
        }

    }

    rearrangeArray(listToUpdate, heading, index, fieldReferene) {
        listToUpdate.splice(index, 1)
        console.log(listToUpdate)
        listToUpdate[listToUpdate.length - 1].showAddButton = true;
        listToUpdate[0].rowHeading = heading;
        listToUpdate[0].showRemoveButton = listToUpdate.length > 1;
    }


    async updateInParent(listToUpdate, fieldreference, updatedSoldCaseData) {
        let firstElement = fieldreference == ELIG_VENDOR_REF ? 'Eligibility_Vendor__c' : 'Niche_Vendors_to_Integrate__c';
        let maxElement = fieldreference == ELIG_VENDOR_REF ? 5 : 10;
        let previousIndex = 0;
        listToUpdate.forEach(element => {
            if (element.value) {
                let fieldedited = previousIndex == 0 ? firstElement : fieldreference + '_' + (previousIndex + 1) + '__c';
                updatedSoldCaseData[fieldedited] = element.value;
                previousIndex++;
            }
        })

        for (let i = previousIndex; i < maxElement; i++) {
            let fieldedited = fieldreference + '_' + (i + 1) + '__c'
            updatedSoldCaseData[fieldedited] = ''
        }
        return updatedSoldCaseData;
    }

    @api
    async generateParentData(updatedSoldCaseData) {
        console.dir(updatedSoldCaseData)
        let cloneLookupRecord = JSON.parse(JSON.stringify(updatedSoldCaseData));
        let eligibleVendorTemp = Array.from(this.template.querySelectorAll('.eligibleVendorCls'));
        let extVendorTemp = Array.from(this.template.querySelectorAll('.externalVendorCls'));
        cloneLookupRecord = await this.updateInParent(eligibleVendorTemp, ELIG_VENDOR_REF, cloneLookupRecord);
        cloneLookupRecord = await this.updateInParent(extVendorTemp, EXT_VENDOR_REF, cloneLookupRecord);
        return cloneLookupRecord;
    }

    connectedCallback() {
        if (this.soldCaseDataCopy.Historic_Data__c == 'Rx' || this.soldCaseDataCopy.Historic_Data__c == 'Medical' || this.soldCaseDataCopy.Historic_Data__c == 'Both') {
            this.showHistoricDataMedicalOrRx = true;

        }
        else {
            this.showHistoricDataMedicalOrRx = false;
        }
    }

    renderedCallback(event) {
        if (this.editmode) {
            var p1 = this.template.querySelector('.picklist1');
            var p2 = this.template.querySelector('.picklist2');
            if (p1 !== null) {
                if (p1.value == '' || p1.value == 'None') {
                    p1.style = 'width:100%; float:right;';
                }
                if (p1.value == 'Rx' || p1.value == 'Medical' || p1.value == 'Both') {
                    p1.style = 'width:49%; float:left;';
                    p2.style = 'width:49%; float:right;';
                    if (this.historicDataNeedsReset) {
                        this.historicDataNeedsReset = false;
                        p2.value = '';
                    }
                }
            }
        }
    }


    handleSectionToggle(event) {
        const openSections = event.detail.openSections;
    }

    @wire(getObjectInfo, {
        objectApiName: SccObject
    })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: historicData })
    histDataValue({ error, data }) {
        if (data) {
            let testPickListvalues = [];
            for (let i in data.values) {
                if (data.values[i] !== undefined) {
                    if (i === '0') {
                        testPickListvalues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                    }
                    testPickListvalues.push(data.values[i]);
                }
            }
            this.historicDataValues = testPickListvalues;
        }
        else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: historicDataMedicalOrRx })
    histMedOrRxDataValue({ error, data }) {
        if (data) {
            let testPickListvalues = [];
            this.dependentPicklist = data;
            this.historicDataMedicalOrRxValues = [];
            this.historicDataMedicalOrRxValues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
            let controllerValues = this.dependentPicklist.controllerValues;
            this.dependentPicklist.values.forEach(depVal => {
                depVal.validFor.forEach(depKey => {
                    if (depKey === controllerValues[this.soldCaseDataCopy.Historic_Data__c]) {
                        this.historicDataMedicalOrRxValues.push(depVal);
                    }
                });

            });
        }
        else if (error) {
            console.log(error);
        }
    }
    @track historicDataNeedsReset = false;
    FieldChangeHandler(event) {
        let editfielddetails;
        let choosenValue;
        if (event.target.name.indexOf('Sold_Case_Checklist__c.') !== -1) {
            choosenValue = event.target.value;
            editfielddetails = [{
                fieldedited: event.target.name,
                fieldvalue: choosenValue
            }];
        }
       // var p2 = this.template.querySelector('.picklist2');
        if (event.target.name == 'Sold_Case_Checklist__c.Historic_Data__c') {
            if (event.target.value == 'Rx' || event.target.value == 'Medical' || event.target.value == 'Both') {
                this.showHistoricDataMedicalOrRx = true;
                this.historicDataMedicalOrRxValues = [];
                this.historicDataNeedsReset = true;
                //p2.value = '';                    
                this.historicDataMedicalOrRxValues.push({ "attributes": null, "label": "", "validFor": [], "value": "" });
                let controllerValues = this.dependentPicklist.controllerValues;
                this.dependentPicklist.values.forEach(depVal => {
                    depVal.validFor.forEach(depKey => {
                        if (depKey === controllerValues[event.target.value]) {
                            this.historicDataMedicalOrRxValues.push(depVal);
                        }
                    });

                });
            }
            else {
                this.showHistoricDataMedicalOrRx = false;
            }
        }
        const ClientDetailRecord = new CustomEvent("progressvaluechange", {
            detail: editfielddetails
        });
        this.dispatchEvent(ClientDetailRecord);

        //console.log('sccData in fieldChangeHandler '+JSON.stringify(this.soldCaseDataCopy));
    }

    handleSccExtVendorChanges(event) {
        console.log('editfielddetails in Vendor Partner comp ' + JSON.stringify(event.detail));
        let editfielddetails;

        editfielddetails = [{
            fieldedited: event.detail.fieldedited,
            fieldvalue: event.detail.fieldvalue
        }];
        const ClientDetailRecord2 = new CustomEvent("progressvaluechange", {
            detail: event.detail
        });
        this.dispatchEvent(ClientDetailRecord2);
    }
}