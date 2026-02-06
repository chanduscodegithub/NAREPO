import { LightningElement, track,api } from 'lwc';

export default class GrowthCmp extends LightningElement {
    @api loggedInUserRole;
    @api isloggedinuservpcr;
    @track isLoggedInUserRoleCMVPCRRVP=false;
    

    connectedCallback() {
        
        if(this.loggedInUserRole === 'CM VPCR/RVP')
        {
            this.isLoggedInUserRoleCMVPCRRVP=true;
        }
    
    }


    

}