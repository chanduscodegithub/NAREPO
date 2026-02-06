/* eslint-disable no-console */
import { LightningElement, track } from 'lwc';
import getLoggedInUserInfo from '@salesforce/apex/IncentiveCompensationStatementController.getLoggedInUserInfo';
import ICM_Report_Not_Authorized_Text from '@salesforce/label/c.ICM_Report_Not_Authorized_Text';

export default class IncentiveCompensationStatementMainCmp extends LightningElement {

    @track cssDisplay = '';
    @track loggedInUserInfoObj;
    @track loggedInUserRole = '';
    @track isLggdInUsrHsAccessToICStatmnt = false;
    @track isLggdInUsrHsAccessToGrowthTab = false;
    @track isLggdInUsrHsAccessToRetentionTab = false;
    @track isLggdInUsrHsAccessToStatusSnapshotTab = false;
    @track defaultActiveTab = 'my Snapshot';
    @track isVPCROrRVP = false;
    isloggedInUserVPCR = false;

    @track isSce = false; //SAMARTH
    @track isSBSce = false; //SAMARTH

    label = {
        ICM_Report_Not_Authorized_Text
    };

    connectedCallback() {
        this.getLoggedInUserInfo();

    }

    getLoggedInUserInfo() {
        this.cssDisplay = '';
        getLoggedInUserInfo()
            .then(result => {
                let loggedInUserInfoObj = result;



                if (!this.isMapEmpty(loggedInUserInfoObj)) {
                    this.loggedInUserInfoObj = loggedInUserInfoObj;
                    this.loggedInUserRole = loggedInUserInfoObj.loggedInUserRole;
                    if (this.loggedInUserRole === 'CM VPCR/RVP') {
                        this.isVPCROrRVP = true;
                    }
                    //-------------------------------------------SAMARTH-------------------------------------------
                    if (this.loggedInUserRole === 'CM SCE' || this.loggedInUserRole === 'Surest CM SCE' || this.loggedInUserRole === 'Surest CM SVP') {
                        console.log('Logged in user SCE !!!');
                        this.isSce = true;
                    }
                    
                    if (this.loggedInUserRole === 'Specialty Benefits SCE') { //FOR SPECIALTY BENEFITS SCE USER
                        console.log('Logged in user Specialty Benefits SCE !!!');
                        this.isSBSce = true;
                    }
                    //-------------------------------------------SAMARTH-------------------------------------------
                    this.isLggdInUsrHsAccessToICStatmnt = loggedInUserInfoObj.isLggdInUsrHsAccessToICStatmnt;
                    this.isLggdInUsrHsAccessToStatusSnapshotTab = loggedInUserInfoObj.isLggdInUsrHsAccessToStatusSnapshotTab;
                    this.isLggdInUsrHsAccessToGrowthTab = loggedInUserInfoObj.isLggdInUsrHsAccessToGrowthTab;
                    this.isLggdInUsrHsAccessToRetentionTab = loggedInUserInfoObj.isLggdInUsrHsAccessToRetentionTab;
                    this.isLoggedInUserVPCR = loggedInUserInfoObj.isLoggedInUserVPCR;
                    console.log('In Main Cmp isLoggedInUserVPCR==>' + this.isLoggedInUserVPCR);
                }

                this.cssDisplay = 'hidemodel';

            })
            .catch(error => {
                console.log('Error==>' + JSON.stringify(error));
                this.cssDisplay = 'hidemodel';
            });
    }

    isMapEmpty(map1) {
        for (let key in map1) {
            if (map1.hasOwnProperty(key)) return false;
        }
        return true;
    }


}