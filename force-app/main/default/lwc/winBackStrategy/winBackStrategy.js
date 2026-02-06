import { LightningElement, api, track, wire } from 'lwc';
import winBackStrategylist from '@salesforce/apex/WinBackStrategyapexcls.getCurrentRecord';
import updateRecord from '@salesforce/apex/WinBackStrategyapexcls.updateRecord';
import getRelatedContacts from '@salesforce/apex/WinBackStrategyapexcls.getRelatedContacts';
import { getRecord } from 'lightning/uiRecordApi';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import Account from '@salesforce/schema/Account';
import getUserInfo from '@salesforce/apex/WinBackStrategyapexcls.getUserInfo';

export default class WinBackStrategy extends LightningElement {

   
    @track accountId;
    @track accData = {};
    @track isShowSpinner = false;
    @track accUrl;
    @track selectedValueName=[];
    @api recordId;
    @api fieldApiName;
    @track availableContacts = [];
    @track selectedContacts = [];
    @track errorMessage = '';
    @track ExpandDetails = true;
    @track isExpand =false;
    @track isEditDisabled = false;
    
    @track isEdit = true;
    data;
    value = [];
    ownerUrl;
    openSection1 = true;
    onLoadSpinner = true;
     @track hasEditAccess;

    @wire(getUserInfo, { recId: '$recordId' })
    wiredAccess({ error, data }) {
        if (data) {
            this.hasEditAccess = data; 
            
        } else if (error) {
           
        }
    }
    
    //Getting the RelatedContacts for the record
    
    @wire(getRelatedContacts, { accountId: '$recordId' })
    wiredContacts({ error, data }) {
        if (data) {
            this.availableContacts = data.map(contact => ({ label: contact.Name, value: contact.Id }));
        } else if (error) {
        }
    }

    //redirecting the user to the owner's detail page

    @wire(getRecord, { recordId: '$recordId', fields: ['Account.OwnerId'] })
    wiredRecord({ error, data }) {
        if (data) {
            this.ownerUrl = `/${data.fields.OwnerId.value}`;
        } else if (error) {

        }
    }

    handleOwnerClick() {
        window.location.href = this.ownerUrl;
    }


    handleKeyChange(event) {

      this.accData.Nameof_Client_Contact_Backend_id__c = event.target.value.toString();
      this.selectedValueName=[];
      this.selectedContacts=event.target.value;

       for(var i=0;i<this.availableContacts.length;i++)
        {
            for(var j=0;j<=this.selectedContacts.length;j++){
            if(this.selectedContacts[j] == this.availableContacts[i].value){
            this.selectedValueName.push(this.availableContacts[i].label);
            }
        }
        }
    }

   //fetching the picklist choice for the fields  

    @wire(getObjectInfo, { objectApiName: Account })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: 'Account.Win_Back_Project_Tagged_Former_Client__c'
    })
    winBackProjectTaggedFormerClientPicklistValues;

    get winBackProjectTaggedFormerClientOption() {
        return this.winBackProjectTaggedFormerClientPicklistValues.data ? this.winBackProjectTaggedFormerClientPicklistValues.data.values : [];
    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: 'Account.Win_Back_Primary_Owner__c'
    })
    winBackPrimaryOwnerPicklistValues;

    get winBackPrimaryOwnerOption() {
        return this.winBackPrimaryOwnerPicklistValues.data ? this.winBackPrimaryOwnerPicklistValues.data.values : [];
    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: 'Account.Status__c'
    })
    statusPicklistValues;

    get statusOption() {
        return this.statusPicklistValues.data ? this.statusPicklistValues.data.values : [];
    }

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: 'Account.Outcome__c'
    })
    outcomePicklistValues;

    get outcomeOption() {
        return this.outcomePicklistValues.data ? this.outcomePicklistValues.data.values : [];
    }

    connectedCallback() {
        setTimeout(() => this.spinnerLoadingAwait(), 2000); 
        this.openSection1 = true;
        this.winBackStrategylistData();
        this.accUrl = `/${this.recordId}`;
    }

    spinnerLoadingAwait(){
        this.onLoadSpinner = false;
    }

    handleChangeEventCtrl(event) {
        if (this.isEditDisabled) {
            let updatedData = Object.assign({}, this.accData);
            updatedData[event.target.name] = event.target.value;
            this.accData = updatedData;
        }
    }


    expandCollapse(){
        this.ExpandDetails = !this.ExpandDetails;
       // this.isEditDisabled =false;
        this.isExpand =!this.isExpand;
        if(this.isExpand){
        this.isShowSpinner=true;
        this.winBackStrategylistData();
        }
    }

    //apex data fetching method
    
    winBackStrategylistData() {
        winBackStrategylist({ recId: this.recordId })
            .then((result) => {
                console.log('accData++', JSON.stringify(result));
                if (result !== null && result !== undefined && result !== '') {
                    this.accData = result;
                    this.selectedContacts = this.accData.Nameof_Client_Contact_Backend_id__c.split(',');
                    this.selectedValueName = this.accData.Name_s_of_Client_Contact_s_Backend__c.split(',');
                    console.log('selectedContacts++', JSON.stringify(this.selectedContacts));
                }
              
                this.isShowSpinner = false;
            })
            .catch((error) => {
                this.isShowSpinner = false;
            })
            .finally(() => {

            });
    }
    

    handleEdit() {
        this.isEditDisabled = true;
    }

    handleCancel() {
        this.isEditDisabled = false;
      if(this.isExpand){
        this.isShowSpinner=true;
        this.winBackStrategylistData();
        }
    }

    handleSave() {
        this.isShowSpinner = true;
        console.log('this.accData.Name_s_of_Client_Contact_s__c@@' + this.accData.Name_s_of_Client_Contact_s__c);
        const updatedAccount = {
            Id: this.recordId,
            Win_Back_Project_Tagged_Former_Client__c: this.accData.Win_Back_Project_Tagged_Former_Client__c,
            Cancellation_Date__c: this.accData.Cancellation_Date__c,
            SCE_at_Term__c: this.accData.SCE_at_Term__c,
            Win_Back_Primary_Owner__c: this.accData.Win_Back_Primary_Owner__c,
            Name_s_of_Client_Contact_s_Backend__c: this.selectedValueName.toString(),
            Nameof_Client_Contact_Backend_id__c: this.accData.Nameof_Client_Contact_Backend_id__c,
            Status__c: this.accData.Status__c,
            Outcome__c: this.accData.Outcome__c,
            Reason_for_Term_Comments__c:this.accData.Reason_for_Term_Comments__c,
            OwnerId: this.accData.OwnerId

        };


        updateRecord({ winBack: updatedAccount })
            .then(() => {
               console.log('updatedAccount', updatedAccount);
                this.isEditDisabled = false;
                this.isSaveCancelDisabled = true;
                this.isEdit = false;
                this.winBackStrategylistData();
            })
            .catch(error => {
                this.isShowSpinner = false;
            });
    }

    //Date formatting for Cancellation_Date__c field

    get formattedCancellationDate() {

        if(this.accData.Cancellation_Date__c!=null  && this.accData.Cancellation_Date__c!=undefined){
            let dateList = this.accData.Cancellation_Date__c.split('-');
            let day =dateList[1];
            let month=dateList[2];
            
            if(dateList[1].indexOf('0')==0){
                day =dateList[1].replace(/^0/, '');
            }
             if(dateList[2].indexOf('0')==0){
                month =dateList[2].replace(/^0/, '');
            }
            return day +'/'+ month +'/'+ dateList[0];
        }
    }

}