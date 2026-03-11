/****************************************************************************************************
  Name    :  OppLineItems_Trigger    
  Purpose :  This trigger is designed to hadle insert, update & delete operations on the OpportunityLineItems object. Please refer helper classes to understand any perticular functionalities hadled.   
  Author  :  Jnanesh Avaradi                                 Date : 05/15/2020                                  
  
  Version      Author                   Date                 Release #           Purpose   
------------------------------------------------------------------------------------------------------
  1.0 -        Jnanesh Avaradi          05/15/2020           052019              Initial Development             
  1.1 -                       
*****************************************************************************************************/
trigger OppLineItems_Trigger on OpportunityLineItem (After insert,After update,before Delete) {
    
    Set<Id> oppIds = new Set<Id>();
    for (OpportunityLineItem oli : Trigger.isDelete ? Trigger.old : Trigger.new) {
        oppIds.add(oli.OpportunityId);
    }
    if (!oppIds.isEmpty()) {
        OLI_CPWHandler.syncCPWFields(oppIds);
    }
    
    if(trigger.isUpdate){
        //Creates audit trail records when dispostion changes on Line items of type other buy up programmes in CD Membership Activities 
        OppLineItemsAuditTrailHelper.addAuditOnDispChange(trigger.new, trigger.oldMap);
        OppLineItemsAuditTrailHelper.updateSpecialtySalesDebrief(trigger.new); //Samarth Sales Debrief 2023
    }else if(trigger.isInsert){
        //Creates audit trail records when new Line item is added in CD Membership Activities
        OppLineItemsAuditTrailHelper.addAuditOnAddLineItem(trigger.new);
    }else if(trigger.isDelete){
        //Creates audit trail records when Line item is removed in CD Membership Activities
        OppLineItemsAuditTrailHelper.addAuditOnRemoveLineItem(trigger.old);    
    }           
}