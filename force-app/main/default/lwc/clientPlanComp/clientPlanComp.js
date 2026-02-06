import { LightningElement,api,wire } from 'lwc';
import getClientPlanData from '@salesforce/apex/ClientProfileController.getClientPlanData'; 
import { refreshApex } from '@salesforce/apex';
import headerName from '@salesforce/label/c.ClientProfile_ManClientPlanGoal_HeaderName';
import subHeader1Name from '@salesforce/label/c.ClientProfile_ManClntPlanGoal_SubHeader1Name';
import subHeader2Name from '@salesforce/label/c.ClientProfile_MandatryClntPlanGoal_SubHeader2Name';
import instTxt from '@salesforce/label/c.ClientProfile_MandtryClientPlanGoal_InstText';



export default class ClientPlanComp extends LightningElement {

    label={headerName,subHeader1Name,subHeader2Name,instTxt};

@api recordId;
isClientPlanData = true;
attainNPSGoalStrategy = [];
defaultSeasonSale = '';
protectCurrentGoalStartegy = [];
refreshObj;
refreshV;
isStrategyOfTypeOther = false;

@wire(getClientPlanData, { accountId: '$recordId' })
wiredClientPlanResponse(response){
    console.log('inside the wired response ClientPlan');
this.refreshObj =response;
    if(response.data!=undefined && response.data!=null){
    this.isClientPlanData = false;
    let clientPlanDataWpr =  response.data;
   this.defaultSeasonSale =  clientPlanDataWpr.defaultSalesSeason;
    let clientPlanData =  clientPlanDataWpr.clientPlanReturnMap;
    console.log('clientPlanData---'+JSON.stringify(clientPlanData));
    console.log('...........'+clientPlanData.Protect_Renew_Current_Goal);

    if(clientPlanData.hasOwnProperty('Protect_Renew_Current_Goal')){
      
        let protectCurrentGoal = clientPlanData.Protect_Renew_Current_Goal;  
       // this.protectCurrentGoalStartegy = protectCurrentGoal.Strategies__r;
        let protectCurrentGoalStartegies = protectCurrentGoal.Strategies__r;
        let jsonList = [];
        for(let i in protectCurrentGoalStartegies){
            console.log('--'+protectCurrentGoalStartegies[i].Strategy_Write_In__c );
            console.log('before---'+protectCurrentGoalStartegies[i].Strategy__c);
            let temp = {};
                if(protectCurrentGoalStartegies[i].Strategy__c == 'Other (please specify below)'){                     
                    temp['Strategy__c'] = protectCurrentGoalStartegies[i].Strategy_Write_In__c;
                    temp['Action_Steps_PlannedTaken__c'] = protectCurrentGoalStartegies[i].Action_Steps_PlannedTaken__c;
                }else{            
                    temp['Strategy__c'] = protectCurrentGoalStartegies[i].Strategy__c;
                    temp['Action_Steps_PlannedTaken__c'] = protectCurrentGoalStartegies[i].Action_Steps_PlannedTaken__c;
                 } 
                 
                 jsonList.push(temp); 
           console.log('after---'+temp);
        }
        this.protectCurrentGoalStartegy = jsonList;
      
        console.log('clientPlanData---'+JSON.stringify(this.protectCurrentGoalStartegy ));
        
    }
    if(clientPlanData.hasOwnProperty('Atain_Maintain_Nps_Goal')){

        let attainNPSGoal = clientPlanData.Atain_Maintain_Nps_Goal;
        //this.attainNPSGoalStrategy = attainNPSGoal.Strategies__r;
        let attainNPSGoalStrategies = attainNPSGoal.Strategies__r;
        //console.log('=0='+attainNPSGoalStrategy);
        let jsonList = [];
        for(let i in attainNPSGoalStrategies){
            console.log('--'+attainNPSGoalStrategies[i].Strategy_Write_In__c );
            console.log('before---'+attainNPSGoalStrategies[i].Strategy__c);
            let temp = {};
                if(attainNPSGoalStrategies[i].Strategy__c == 'Other (please specify below)'){                     
                    temp['Strategy__c'] = attainNPSGoalStrategies[i].Strategy_Write_In__c;
                    temp['Action_Steps_PlannedTaken__c'] = attainNPSGoalStrategies[i].Action_Steps_PlannedTaken__c;
                }else{            
                    temp['Strategy__c'] = attainNPSGoalStrategies[i].Strategy__c;
                    temp['Action_Steps_PlannedTaken__c'] = attainNPSGoalStrategies[i].Action_Steps_PlannedTaken__c;
                 } 
                 
                 jsonList.push(temp); 
           console.log('after---'+temp);
        }
        this.attainNPSGoalStrategy = jsonList;
        console.log('clientPlanData---'+JSON.stringify(this.attainNPSGoalStrategy ));
    }
    
    }else if(response.error){
        console.log('Error in getCorporationOverviewData() ==>' + JSON.stringify(response.error));
        
    }

}
    @api
    get refresh() {

        return this.refreshV;
    }
    set refresh(value) {
        if(this.refreshV !=value){
            refreshApex(this.refreshObj);
        }
        
        this.refreshV=value;
        
    }

}