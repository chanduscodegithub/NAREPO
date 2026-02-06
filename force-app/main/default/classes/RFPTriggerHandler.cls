/****************************************************************** ***** 
Name: RFPTriggerHandler 
Copyright © 2025 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Class to handle the trigger events of RFP Trigger.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT      Handle Trigger events

*********************************************************************
*/

public with sharing class RFPTriggerHandler {
    
    public static void handleTrigger(List<RFP__c> oldList, List<RFP__c> newList, Map<Id, RFP__c> oldMap, Map<Id, RFP__c> newMap, System.TriggerOperation triggerEvent ){
        switch on triggerEvent {
            
            when AFTER_UPDATE {
               RFPTriggerHandler.afterUpdate(oldMap,newList);
            }
            
        }
    }

	public static void afterUpdate(Map<Id, RFP__c> oldMap, List<RFP__c> newList){
        List<RFP__c> rfpList = new List<RFP__c>();
        for(RFP__c rfp: newList){
            if(rfp.Stage__c != oldMap.get(rfp.Id).Stage__c && (rfp.Stage__c == 'Digitization Successful')){
                rfpList.add(rfp);
            }
        }
        
        if(rfpList.size()>0){
           RFPTriggerHelper.processRfpChunk(rfpList, RFPTriggerHelper.RFPFlowMode.Both, null); 
        }
        
        
    }    

}