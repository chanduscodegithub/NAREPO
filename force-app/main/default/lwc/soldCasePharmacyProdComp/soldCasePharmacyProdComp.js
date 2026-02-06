/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 06-05-2024
 * @last modified by  : Spoorthy
**/
import { LightningElement, api, track, wire } from 'lwc';

export default class SoldCasePharmacyProdComp extends LightningElement {
  @api editmode;
  @api pharmacyrecords;
  @api pharmdispValue;

  @track childCompPharmacyRecords = [];

  @track activeSections = ['Pharmacy Products'];
   //activeSectionsInside = ['Pharmacy Carve In Programs'];

  @track activeSectionsPCIP = ['Pharmacy Carve In Programs'];

  oneRxProdcuts = ["RX-SRORBFI", "RX-SRORBNI", "RX-ONERX"];


  get pharmacyCarveOutDropDown() {
    return [
      { label: '', value: '' },
      { label: 'Book 1', value: 'Book 1' },
      { label: 'Book A', value: 'Book A' }
    ]
  }

  get yesNoValues() {
    return [
      { label: '', value: '' },
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' }
    ];
  }

  get includedNotIncluded() {
    return [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' }
    ];
  }

  connectedCallback() {
    this.pharmacyrecords.forEach(pharmaRecs => {
      this.childCompPharmacyRecords.push(Object.assign({},pharmaRecs));
    });
     for (let i in this.childCompPharmacyRecords) {
       if(this.oneRxProdcuts.includes(this.childCompPharmacyRecords[i]['ProductCode'])){
          this.childCompPharmacyRecords[i]['isRxOneRx'] = true;
          
        }else{
          this.childCompPharmacyRecords[i]['isRxOneRx'] = false;
        }
        
      }
  }

  level2ChangeHandler(event) {
    let editedRecordId = event.target.dataset.id;
    let editedRecord;

    if (event.target.dataset.prod == 'pharmacy') {
      if (event.target.name == 'Level_2_Option__c') {
        let targetIndex = event.target.dataset.index;        
        this.childCompPharmacyRecords[targetIndex]['Pharmacy_Carve_Out_DropDown__c'] = '';
        this.childCompPharmacyRecords[targetIndex]['ESP_Enhanced_Savings_Program_Opt_in__c'] = '';
        this.childCompPharmacyRecords[targetIndex]['Price_Edge_Opt_in__c'] = '';
        this.childCompPharmacyRecords[targetIndex]['Vital_Medication_program_Opt_in_Opt_out__c'] = '';
        this.childCompPharmacyRecords[targetIndex]['My_ScriptRewards__c'] = '';
        this.childCompPharmacyRecords[targetIndex]['If_Fully_Insured_include_quoted_Rx_plan__c'] = '';
        
        this.childCompPharmacyRecords[targetIndex]['displayTextarea'] = false;
        this.childCompPharmacyRecords[targetIndex]['displayDropDown'] = false;
        this.childCompPharmacyRecords[targetIndex]['displayCarveInQuestions'] = false;

        if(this.oneRxProdcuts.includes(this.childCompPharmacyRecords[targetIndex]['ProductCode'])){//this.childCompPharmacyRecords[targetIndex]['ProductCode'] == 'RX-ONERX'){
          this.childCompPharmacyRecords[targetIndex]['isRxOneRx'] = true;
          if(event.target.value == 'Carve in - OptumRx'){
            this.childCompPharmacyRecords[targetIndex]['displayCarveInQuestions'] = true;
          }else{
            this.childCompPharmacyRecords[targetIndex]['displayCarveInQuestions'] = false;
          }
        }else{
          this.childCompPharmacyRecords[targetIndex]['isRxOneRx'] = false;
        }
        
        if (event.target.value == 'Carve Out') {
          this.childCompPharmacyRecords[targetIndex]['displayTextarea'] = true;
        }
        else if (event.target.value == 'Carve out Flex - OptumRx' || event.target.value == 'Carve out - OptumRx') {
          this.childCompPharmacyRecords[targetIndex]['displayDropDown'] = true;
          this.childCompPharmacyRecords[targetIndex]['Level2_Info__c'] = '';
        }
        else if (event.target.value == 'Carve in - OptumRx') {
          //this.activeSectionsInside = ["Pharmacy Carve In Programs"];
          setTimeout(() => {
            this.childCompPharmacyRecords[targetIndex]['displayCarveInQuestions'] = true;
            this.childCompPharmacyRecords[targetIndex]['Level2_Info__c'] = '';
            //this.activeSectionsInside = ["Pharmacy Carve In Programs"];
            this.activeSectionsPCIP = ['Pharmacy Carve In Programs'];
          }, 1200);
          
        }
      }
      
      for (let i in this.childCompPharmacyRecords) {
        if (editedRecordId == this.childCompPharmacyRecords[i]['Id']) {
          this.childCompPharmacyRecords[i][event.target.name] = event.target.value;
          editedRecord = Object.assign({}, this.childCompPharmacyRecords[i]);
          editedRecord[event.target.name] = event.target.value;
        }
        
      }
      
      let editfielddetails = [{ record: editedRecord }];
      console.log(`editedRecord = ${JSON.stringify(editedRecord)}`);
      const opplineitemRecord = new CustomEvent("opplinevaluechange", {
        detail: editfielddetails
      });

      this.dispatchEvent(opplineitemRecord);
    }
  }
}