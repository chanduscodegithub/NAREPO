import { LightningElement,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class AuditTrailTableCmp extends NavigationMixin(LightningElement) {

    auditTrailRec;
    @api loggedInUserTimeZone;
    userRecLink;

    @api
    get auditTrailData() {

        return this.auditTrailRec;
    }
    set auditTrailData(value) {
        this.auditTrailRec=value;
        this.userRecLink='/'+this.auditTrailRec.userId;
    }

    navigateToUserRecord(event){
        console.log('userId==>'+event.target.value);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId:this.auditTrailRec.userId,
                objectApiName:'User',
                actionName:'view'
            
            }
        });
    }

}