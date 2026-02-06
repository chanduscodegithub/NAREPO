import { LightningElement, api, track, wire } from 'lwc';


export default class EbdCorporationOverview extends LightningElement {
   @api isEditMode;
   //@api ebdDataJs;
   @api recordId;
   @api nextMedicalStr;
   //@api AccountInfo;
   @api currentMedicalStr;
   @api ebdListData;
   @api bghDataStr;
   @api accountInfo;
   @api seniorExecutiveListData;
   @api companyContactsData;
   //@api ebdInfo;
   renderedCallback() {
    console.log('>> EBD Child Component Rendered');
    console.log('>> ebdListData:', JSON.parse(JSON.stringify(this.ebdListData)));
   console.log('Relationship_History__c:', this.ebdListData.Relationship_History__c);
   console.log('Involvement_In_CAC__c:', this.ebdListData.Involvement_In_CAC__c);

   }
   get medicalMembershipPenetration() {
    return this.accountInfo?.Medical_Membership_Penetration__c 
        ? `${this.accountInfo.Medical_Membership_Penetration__c}%` 
        : '0%';
}
   
   handleInputChange(event){
        const name = event.target.name;
        let value;

        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        }

        else {
            value = event.target.value;
        }
        this.dispatchEvent(new CustomEvent('ebdchange',{
         detail : {fieldName: name, fieldValue: value}
        }));
        
   
}
}