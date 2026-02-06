import { LightningElement, api, track } from 'lwc';

export default class SoldcaseMainComp extends LightningElement {
    @api recordId;
    @track defaultActiveTab='';
    auditTrailTabLoaded=false;

    connectedCallback(){
        console.log('recordId==>'+this.recordId);
        this.defaultActiveTab = 'Sold Case Checklist';
    }

    handleActive(event){
        let activeTab= event.target.value;
        console.log('activeTab==>'+activeTab);
        if(this.auditTrailTabLoaded && activeTab==='Audit Trail'){
            let auditTrailCmp = this.template.querySelector('c-audit-trail-cmp');
            auditTrailCmp.refreshAuditTrailData();
        }
        this.auditTrailTabLoaded=true;

    }

    get refreshTab() {
        this.defaultActiveTab = '';
        if(this.defaultActiveTab === '') {
            this.defaultActiveTab = 'Sold Case Checklist';
            return true;
        }
        return false;
    }

}