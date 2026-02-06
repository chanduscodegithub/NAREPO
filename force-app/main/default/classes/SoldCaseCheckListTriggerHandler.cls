public without sharing class SoldCaseCheckListTriggerHandler {
    public static void handleTrigger(List<Sold_Case_Checklist__c> oldList,List<Sold_Case_Checklist__c> newList,
                                     Map<Id, Sold_Case_Checklist__c> oldMap,Map<Id, Sold_Case_Checklist__c> newMap, 
                                     System.TriggerOperation triggerEvent )
    {
        switch on triggerEvent {
            
            when AFTER_UPDATE {
                SoldCaseCheckListTriggerHandler.handleAfterUpdate(oldMap, newMap);
            }
            
        }
    }
    
    public static void handleAfterUpdate(Map<Id, Sold_Case_Checklist__c> oldMap,Map<Id, Sold_Case_Checklist__c> newMap){
        SoldCaseCheckListTriggerHelper.createAuditRecord(oldMap, newMap);
    }
}