import {
    LightningElement,
    api
} from 'lwc';
import headerName  from '@salesforce/label/c.ClientProfile_MedicalTrnd_HeaderName'; 
import  instText from '@salesforce/label/c.ClientProfile_MedicalTrnd_InstText'; 

 
export default class MedicalTrendsCom extends LightningElement {

    label = {headerName,instText};
    year1 = '';
    year2 = '';
    year3 = '';
    year4 = '';
    year1Value = '';
    year2Value = '';
    year3Value = '';
    year4Value = '';
    medList;
    yearlist=[];
    yearValueList=[];
    @api headerLabel;
    @api
    get medListData() {

        return this.medList;
    }
    set medListData(value) {
        let lastYear;
        this.medList = value;
        this.year1 = '';
        this.year2 = '';
        this.year3 = '';
        this.year4 = '';
        this.year1Value = '';
        this.year2Value = '';
        this.year3Value = '';
        this.year4Value = '';
        this.yearlist =['','','',''];
        this.yearValueList=['','','',''];
        if (this.medList != undefined)
            if (this.medList.length > 0) {
                lastYear = new Date(Math.max.apply(null, value.map(function (e) {
                    return new Date(e.Year__c);
                })));
                var d = new Date(lastYear);
                var n = d.getFullYear();
                this.year1 = n;
                // this.year2 = n - 1;
                // this.year3 = n - 2;
                // this.year4 = n - 3;
            }


        if (this.medList != undefined)
            for (var i = 0; i < this.medList.length; i++) {
                if (i == 4) break;
                let yearVal = parseInt(this.medList[i].Year__c);//(new Date(this.medList[i].Year__c)).getFullYear();
                this.yearlist[3-i]=yearVal;
                if (this.medList[i].Policy_level_medical_trends__c != undefined) {
                    
                    this.yearValueList[3-i]=this.medList[i].Policy_level_medical_trends__c + '%';
                    // if (i == 0) {
                    //     this.year1 = yearVal;
                    //     this.year1Value = this.medList[i].Policy_level_medical_trends__c + '%';
                    // } else if (i == 1) {
                    //     this.year2 = yearVal;
                    //     this.year2Value = this.medList[i].Policy_level_medical_trends__c + '%';
                    // } else if (1 == 2) {
                    //     this.year3 = yearVal;
                    //     this.year3Value = this.medList[i].Policy_level_medical_trends__c + '%';
                    // } else if (i == 3) {
                    //     this.year4 = yearVal;
                    //     this.year4Value = this.medList[i].Policy_level_medical_trends__c + '%';
                    // }
                }
            }
    }
}