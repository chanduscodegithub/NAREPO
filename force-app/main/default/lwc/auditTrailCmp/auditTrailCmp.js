import { LightningElement, api,wire} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAuditTrailData from '@salesforce/apex/SoldCaseAuditTrailController.getAuditTrailData';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';


export default class AuditTrailCmp extends NavigationMixin(LightningElement) {
    @api recordId;
    cssDisplay;
    soldCaseAuditTrailRecList = [];
    soldCaseAuditTrailRecWrapperList = [];
    isSoldCaseAuditTrailRecListEmpty = true;
    loggedInUserTimeZone;
    recordCount = '0';
    auditTrailRelatedListLink;
    soldCaseAuditTrailResponse;

    @wire(CurrentPageReference) pageRef;
    

    connectedCallback() {
        //console.log('recordId==>' + this.recordId);
        //this.getAuditTrailData();
        registerListener("soldCaseFormUpdated", this.refreshAuditTrailData, this);
        registerListener('successEvent', this.refreshAuditTrailData, this);
    }

    @api
    refreshAuditTrailData(){
        console.log('Inside refreshAuditTrailData()');
        if(this.soldCaseAuditTrailResponse!=undefined && this.soldCaseAuditTrailResponse!=null){
            refreshApex(this.soldCaseAuditTrailResponse);
        }
        
    
    }
   
    @wire(getAuditTrailData, { oppId: '$recordId' })
    wiredAuditTrailResponse(response){
        this.soldCaseAuditTrailResponse=response;
        if(response.data!=undefined && response.data!=null){
            console.log('Inside response');
            let soldCaseAuditTrailData = response.data;
                let soldCaseAuditTrailRecList = [];
               // console.log('soldCaseAuditTrailData==>' + JSON.stringify(soldCaseAuditTrailData));
                if (soldCaseAuditTrailData !== null && soldCaseAuditTrailData !== undefined) {

                    if (soldCaseAuditTrailData.hasOwnProperty('soldCaseAuditTrailList') && !this.isListEmpty(soldCaseAuditTrailData.soldCaseAuditTrailList)) {
                        soldCaseAuditTrailRecList = [...soldCaseAuditTrailData.soldCaseAuditTrailList];
                        this.isSoldCaseAuditTrailRecListEmpty = false;
                        this.soldCaseAuditTrailRecList = soldCaseAuditTrailRecList;
                        let auditTrailObjPrprtyFldApiNameMappingStr='';
                        if(soldCaseAuditTrailData.hasOwnProperty('auditTrailSettingList')){
                            let auditTrailSettingList=[...soldCaseAuditTrailData.auditTrailSettingList];
                            if(!this.isListEmpty(auditTrailSettingList)){
                                for(let i in auditTrailSettingList){
                                    if(auditTrailSettingList[i].hasOwnProperty('DeveloperName')){
                                        if(auditTrailSettingList[i].DeveloperName==='AuditTrail_ObjPrprtyFldApiName_Mapping'){
                                            auditTrailObjPrprtyFldApiNameMappingStr=auditTrailSettingList[i].Value__c;
                                           
                                        }
                                    }
                                }
                            }
                        }
                        

                        this.soldCaseAuditTrailRecWrapperList = this.buildAuditTrailRecWrapper(soldCaseAuditTrailRecList,auditTrailObjPrprtyFldApiNameMappingStr);
                        //console.log(`this.soldCaseAuditTrailRecWrapperList ${JSON.stringify(this.soldCaseAuditTrailRecWrapperList)}`)

                        //  if(soldCaseAuditTrailRecList.length>6){
                        if (soldCaseAuditTrailData.hasOwnProperty('recordCount')) {
                            if(soldCaseAuditTrailData.recordCount > 20) {
                                this.recordCount = '20+';
                            } else {
                                this.recordCount = soldCaseAuditTrailData.recordCount;
                            }
                        }
                            
                            

                    } else {
                        this.isSoldCaseAuditTrailRecListEmpty = true;
                        this.recordCount = '0';
                        this.soldCaseAuditTrailRecList = [];
                        this.soldCaseAuditTrailRecWrapperList = [];
                    }


                    this.loggedInUserTimeZone = soldCaseAuditTrailData.loggedInUserTimeZone;
                    this.auditTrailRelatedListLink='/lightning/r/Opportunity/'+this.recordId+'/related/Audit_Trail_Custom__r/view';
                }
                this.cssDisplay = 'hidemodel';
        }else if(response.error){
            console.log('Error in getAuditTrailData() ==>' + JSON.stringify(response.error));
            this.cssDisplay = 'hidemodel';
        }
    }
    

    @api
    getAuditTrailData() {
        console.log('Inside getAuditTrailData()');
        this.cssDisplay = '';
        getAuditTrailData({ oppId: this.recordId })
            .then(result => {
                let soldCaseAuditTrailData = result;
                let soldCaseAuditTrailRecList = [];
               // console.log('soldCaseAuditTrailData==>' + JSON.stringify(soldCaseAuditTrailData));
                if (soldCaseAuditTrailData !== null && soldCaseAuditTrailData !== undefined) {

                    if (soldCaseAuditTrailData.hasOwnProperty('soldCaseAuditTrailList') && !this.isListEmpty(soldCaseAuditTrailData.soldCaseAuditTrailList)) {
                        soldCaseAuditTrailRecList = [...soldCaseAuditTrailData.soldCaseAuditTrailList];
                        this.isSoldCaseAuditTrailRecListEmpty = false;
                        this.soldCaseAuditTrailRecList = soldCaseAuditTrailRecList;
                        let auditTrailObjPrprtyFldApiNameMappingStr='';
                        if(soldCaseAuditTrailData.hasOwnProperty('auditTrailSettingList')){
                            let auditTrailSettingList=[...soldCaseAuditTrailData.auditTrailSettingList];
                            if(!this.isListEmpty(auditTrailSettingList)){
                                for(let i in auditTrailSettingList){
                                    if(auditTrailSettingList[i].hasOwnProperty('DeveloperName')){
                                        if(auditTrailSettingList[i].DeveloperName==='AuditTrail_ObjPrprtyFldApiName_Mapping'){
                                            auditTrailObjPrprtyFldApiNameMappingStr=auditTrailSettingList[i].Value__c;
                                           
                                        }
                                    }
                                }
                            }
                        }
                        

                        this.soldCaseAuditTrailRecWrapperList = this.buildAuditTrailRecWrapper(soldCaseAuditTrailRecList,auditTrailObjPrprtyFldApiNameMappingStr);

                        //  if(soldCaseAuditTrailRecList.length>6){
                        if (soldCaseAuditTrailData.hasOwnProperty('recordCount')) {
                            if(soldCaseAuditTrailData.recordCount > 20) {
                                this.recordCount = '20+';
                            } else {
                                this.recordCount = soldCaseAuditTrailData.recordCount;
                            }
                        }
                            
                            

                    } else {
                        this.isSoldCaseAuditTrailRecListEmpty = true;
                        this.recordCount = '0';
                        this.soldCaseAuditTrailRecList = [];
                        this.soldCaseAuditTrailRecWrapperList = [];
                    }


                    this.loggedInUserTimeZone = soldCaseAuditTrailData.loggedInUserTimeZone;
                    this.auditTrailRelatedListLink='/lightning/r/Opportunity/'+this.recordId+'/related/Audit_Trail_Custom__r/view';
                }
                this.cssDisplay = 'hidemodel';
            })
            .catch(error => {
                console.log('Error in getAuditTrailData() ==>' + JSON.stringify(error));
                this.cssDisplay = 'hidemodel';
            });
    }

    isListEmpty(lst) {
        let isListEmpty = true;
        if (lst !== null && lst !== undefined && lst.length !== 0) {
            isListEmpty = false;
        }

        return isListEmpty;

    }

    isBlank(strVal) {
        var isStrBlank = true;
        if (strVal !== undefined && strVal != null && strVal !== '') {
            isStrBlank = false;
        }
        return isStrBlank;
    }

    getListFromValueSeparatedStr(valueSeparatedStr, valueSeparator) {
        var returnList = [];
        if (!this.isBlank(valueSeparatedStr)) {
            if (valueSeparatedStr.indexOf(valueSeparator) !== -1) {
                returnList = valueSeparatedStr.split(valueSeparator);
            }
            else {
                returnList = valueSeparatedStr;
            }
        }
        return returnList;
    }

    isMapEmpty(map1) {
        for (let key in map1) {
            if (map1.hasOwnProperty(key)) return false;
        }
        return true;
    }

    buildAuditTrailRecWrapper(dataList,objPrprtyFldApiNameMappingStr) {
        //console.log(`dataList ${JSON.stringify(dataList)}`);
        let returnList = [];
        let apiNameObjPropMappingList = [];
        let apiNameObjPropMap = {};

        if (!this.isListEmpty(dataList)) {
            apiNameObjPropMappingList = this.getListFromValueSeparatedStr(objPrprtyFldApiNameMappingStr, ';');
            for (let i in apiNameObjPropMappingList) {
                if (i !== undefined) {
                    if (apiNameObjPropMappingList[i].indexOf(':') !== -1) {
                        let eachapiNameObjPropMapping = apiNameObjPropMappingList[i].split(':');
                        apiNameObjPropMap[eachapiNameObjPropMapping[1]] = eachapiNameObjPropMapping[0];
                    }

                }

            }
            if (!this.isMapEmpty(apiNameObjPropMap)) {
                for (let j in dataList) {
                    if (j !== undefined) {
                        console.log(`Element Name --- ${JSON.stringify(dataList[j])}`)
                        let jsonData = {};
                        for (let k in apiNameObjPropMap) {
                            if (k.indexOf('.') !== -1) {
                                let fieldApiNameSeparatedByDotArr = [];
                                fieldApiNameSeparatedByDotArr.push(k.substring(0, k.indexOf('.')));
                                fieldApiNameSeparatedByDotArr.push(k.substring(k.indexOf('.') + 1));
                                let fieldApiNameSeparatedByDot = [...fieldApiNameSeparatedByDotArr];
                                if (dataList[j].hasOwnProperty(fieldApiNameSeparatedByDot[0])) {
                                    if (fieldApiNameSeparatedByDot[1].indexOf('.') !== -1) {
                                        let fieldApiNameSeparatedByDotArr1 = [];
                                        fieldApiNameSeparatedByDotArr1.push(fieldApiNameSeparatedByDot[1].substring(0, fieldApiNameSeparatedByDot[1].indexOf('.')));
                                        fieldApiNameSeparatedByDotArr1.push(fieldApiNameSeparatedByDot[1].substring(fieldApiNameSeparatedByDot[1].indexOf('.') + 1));
                                        let fieldApiNameSeparatedByDot1 = [...fieldApiNameSeparatedByDotArr1];
                                        if (dataList[j][fieldApiNameSeparatedByDot[0]].hasOwnProperty(fieldApiNameSeparatedByDot1[0])) {
                                            if (fieldApiNameSeparatedByDot1[1].indexOf('.') !== -1) {
                                                let fieldApiNameSeparatedByDot2 = fieldApiNameSeparatedByDot1[1].split('.');
                                                if (dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]].hasOwnProperty(fieldApiNameSeparatedByDot2[0])) {
                                                    if (dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]][fieldApiNameSeparatedByDot2[0]].hasOwnProperty(fieldApiNameSeparatedByDot2[1])) {
                                                       // console.log('k==>' + k);
                                                        jsonData[apiNameObjPropMap[k]] = dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]][fieldApiNameSeparatedByDot2[0]][fieldApiNameSeparatedByDot2[1]];
                                                    } else {
                                                        jsonData[apiNameObjPropMap[k]] = '';
                                                    }
                                                } else {
                                                    jsonData[apiNameObjPropMap[k]] = '';
                                                }
                                            } else {
                                                if (dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]].hasOwnProperty(fieldApiNameSeparatedByDot1[1])) {
                                                  //  console.log('k==>' + k);
                                                    jsonData[apiNameObjPropMap[k]] = dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot1[0]][fieldApiNameSeparatedByDot1[1]];
                                                } else {
                                                    jsonData[apiNameObjPropMap[k]] = '';
                                                }
                                            }

                                        } else {
                                            jsonData[apiNameObjPropMap[k]] = '';
                                        }

                                    } else {
                                        if (dataList[j][fieldApiNameSeparatedByDot[0]].hasOwnProperty(fieldApiNameSeparatedByDot[1])) {
                                            jsonData[apiNameObjPropMap[k]] = dataList[j][fieldApiNameSeparatedByDot[0]][fieldApiNameSeparatedByDot[1]];
                                        } else {
                                            jsonData[apiNameObjPropMap[k]] = '';
                                        }
                                    }

                                } else {
                                    jsonData[apiNameObjPropMap[k]] = '';
                                }

                            } else {
                                if (dataList[j].hasOwnProperty(k)) {
                                    jsonData[apiNameObjPropMap[k]] = dataList[j][k];
                                } else {
                                    jsonData[apiNameObjPropMap[k]] = '';
                                }
                            }

                        }

                        if (!this.isMapEmpty(jsonData)) {
                            returnList.push(jsonData);
                        }

                    }



                }
            }

        }

        return returnList;
    }



    navigateToRelatedList() {
        console.log(`recordId in audit trail ${this.recordId}`);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Opportunity',
                relationshipApiName: 'Audit_Trail__r',
                actionName: 'view'
            }
        });
    }
}