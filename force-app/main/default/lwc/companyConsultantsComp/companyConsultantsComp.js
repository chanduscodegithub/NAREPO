import { LightningElement ,api,wire} from 'lwc';
import headerName from '@salesforce/label/c.ClientProfile_CmpyCnsltnts_HeaderName'
import instText from '@salesforce/label/c.ClientProfile_CompanyConsultanta_InstText'

export default class CompanyConsultantsComp extends LightningElement {
@api recordId;

label = {headerName,instText};

companyConsultantData = [];
isCompanyConsultantDataEmpty = true;
radioDisabled = true;



@api
get companyConsultantsData() {

    return this.companyConsultantData;
}
set companyConsultantsData(value) {
    
 this.companyConsultantData = value;
 this.isCompanyConsultantDataEmpty = false;
}



}