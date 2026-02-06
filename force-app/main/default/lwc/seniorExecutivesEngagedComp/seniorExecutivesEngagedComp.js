import { LightningElement,api ,wire} from 'lwc';
import headerName from '@salesforce/label/c.ClientProfile_SeniorExecutives_HeaderName'; 
import instText from '@salesforce/label/c.ClientProfile_SeniorExecutives_InstText'; 


export default class SeniorExecutiveEngagedComp extends LightningElement {

    @api recordId;
    @api seniorExecutiveData;

    
    label = {headerName,instText};


}