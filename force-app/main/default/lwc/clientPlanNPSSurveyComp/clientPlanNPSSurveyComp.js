import { LightningElement, api, wire } from 'lwc';
import instText from '@salesforce/label/c.ClientProfile_ClientNPSSurvey_InstText'
import headerName from '@salesforce/label/c.ClientProfile_ClientNPSSurvey_HeaderName'

export default class ClientPlanNPSSurveyComp extends LightningElement {

    label = {instText,headerName};  

@api recordId;
isClientPlanSurveyData = true;
latestFourYear0='';
latestFourYear1='';
latestFourYear2='';
latestFourYear3='';

liklihoodJson = {};
overAllSatisfactionjson = {};
netPromoterjson = {};

clientPlanSurveyData = {};

@api
get clientSurveyResultData() {

    return this.clientPlanSurveyData;
}
set clientSurveyResultData(value) {
    
 this.clientPlanSurveyData = value;
 let clientPlanSurveyData = this.clientPlanSurveyData ;

 this.isClientPlanSurveyData = false;
 console.log('clientPlanSurveyData==='+JSON.stringify(clientPlanSurveyData));
 

 if(clientPlanSurveyData.hasOwnProperty('LastFourYears')){

     this.latestFourYear0 = clientPlanSurveyData.LastFourYears[3];
     this.latestFourYear1 = clientPlanSurveyData.LastFourYears[2];
     this.latestFourYear2 = clientPlanSurveyData.LastFourYears[1];
     this.latestFourYear3 = clientPlanSurveyData.LastFourYears[0];

 }
 if(clientPlanSurveyData.hasOwnProperty('CSRFinalList')){
    
     let clientPlanSurveyList = clientPlanSurveyData.CSRFinalList;
     if(!this.isListEmpty(clientPlanSurveyList)){

       
               let liklihoodJson = {};
               let overAllSatisfactionjson = {};
               let netPromoterjson = {};
                          
                let liklihoodData = clientPlanSurveyList[0];
                let overAllSatisfactionData = clientPlanSurveyList[1];
                let netPromoterData = clientPlanSurveyList[2];
               console.log('liklihoodData----'+liklihoodData);
                for(let k in liklihoodData ){
                   
                    if(k>0){
                        liklihoodJson['coloumn'+k+'Data'] = liklihoodData[k];
                    }
                   
                }
                this.liklihoodJson = liklihoodJson;
                 for(let k in overAllSatisfactionData ){
                   
                    if(k>0){
                        overAllSatisfactionjson['coloumn'+k+'Data'] = overAllSatisfactionData[k];
                    }
                    
                }
                this.overAllSatisfactionjson = overAllSatisfactionjson;
                for(let k in netPromoterData ){
                   
                    if(k>0){
                        netPromoterjson['coloumn'+k+'Data'] = netPromoterData[k];
                    }
                  
                }
                this.netPromoterjson = netPromoterjson;
           
     }
     
     
 }
}

isListEmpty(lst) {
    let isListEmpty = true;
    if (lst !== null && lst !== undefined && lst.length !== 0) {
        isListEmpty = false;
    }

    return isListEmpty;

}

}