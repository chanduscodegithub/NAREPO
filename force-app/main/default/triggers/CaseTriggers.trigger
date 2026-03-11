trigger CaseTriggers on Case (after update , after insert) {
    /* ########################################################################################################################################
* @description ---- If Resolution Comments & Issue Description Fields to be updated, assign a Utilization Metric Score for these activities             
* #########################################################################################################################################
*/
    
    //Adding this line so this trigger function can be reused for other scenarios 
    for(Case c : Trigger.new){
        if (Trigger.isUpdate && Trigger.isAfter){ 
            if(String.isNotBlank(c.Case_Screenshots__c) && c.Case_Screenshots__c != Trigger.oldMap.get(c.ID).Case_Screenshots__c){
                
                CaseTriggerHandler.updateUtilization(UserInfo.getUserId(),'Updated Resolution Comments');
                
            }
            if(String.isNotBlank(c.Extended_Description__c) && c.Extended_Description__c != Trigger.oldMap.get(c.ID).Extended_Description__c){
                
                CaseTriggerHandler.updateUtilization(UserInfo.getUserId(),'Updated Issue Description');
            }
            
            if(String.isNotBlank(c.Description) && c.Description != Trigger.oldMap.get(c.ID).Description){
                
                CaseTriggerHandler.updateUtilization(UserInfo.getUserId(),'Updated Description ( PHI Compliant )');
            }
            if(String.isNotBlank(c.Resolution__c) && c.Resolution__c != Trigger.oldMap.get(c.ID).Resolution__c){
                
                CaseTriggerHandler.updateUtilization(UserInfo.getUserId(),'Updated Resolution ( PHI Compliant )');
            }
        }    
        if ( Trigger.isInsert && Trigger.isAfter){
            if(String.isNotBlank(c.Case_Screenshots__c) ){
                CaseTriggerHandler.updateUtilization(UserInfo.getUserId(),'Updated Resolution Comments');
            }
            if(String.isNotBlank(c.Extended_Description__c) ){
                CaseTriggerHandler.updateUtilization(UserInfo.getUserId(),'Updated Issue Description');
            }
            
            if(String.isNotBlank(c.Description) ){
                CaseTriggerHandler.updateUtilization(UserInfo.getUserId(),'Updated Description ( PHI Compliant )');
            }
            if(String.isNotBlank(c.Resolution__c)){
                CaseTriggerHandler.updateUtilization(UserInfo.getUserId(),'Updated Resolution ( PHI Compliant )');
            }
            if(c.Status =='Closed' || c.Date_Completed__c!=null){
                CaseTriggerHandler.updateUtilization(UserInfo.getUserId(),'Issue closed');
            }
        }
    }    
    
}