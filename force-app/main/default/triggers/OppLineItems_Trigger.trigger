/****************************************************************************************************
  Name    :  OppLineItems_Trigger    
  Purpose :  Handles insert, update & delete operations on OpportunityLineItem.
             Refer helper classes for detailed business logic.
  Author  :  Jnanesh Avaradi                                 Date : 05/15/2020                                  

  Version      Author              Date         Purpose   
  ----------------------------------------------------------------------------------------------------
  1.0          Jnanesh Avaradi     05/15/2020   Initial Development 
  1.1          Cleaned Version     11/13/2025   Converted to best-practice trigger structure         
*****************************************************************************************************/

trigger OppLineItems_Trigger on OpportunityLineItem ( before insert, before update, before delete, after insert, after update) {
	
    Set<Id> oppIds = new Set<Id>();
system.debug('Veera1');
 if (Trigger.isInsert || Trigger.isUpdate) {
        for (OpportunityLineItem oli : Trigger.new) {
            if (oli.OpportunityId != null) {
                oppIds.add(oli.OpportunityId);
            }
        }
    }

    if (Trigger.isDelete) {
        for (OpportunityLineItem oli : Trigger.old) {
            if (oli.OpportunityId != null) {
                oppIds.add(oli.OpportunityId);
            }
        }
    }

   
    if (Trigger.isAfter && Trigger.isInsert) {
        OppLineItemsAuditTrailHelper.addAuditOnAddLineItem(Trigger.new);
    }

    
    if (Trigger.isAfter && Trigger.isUpdate) {
        OppLineItemsAuditTrailHelper.addAuditOnDispChange(Trigger.new, Trigger.oldMap);
        OppLineItemsAuditTrailHelper.updateSpecialtySalesDebrief(Trigger.new); 
    }

   
    if (Trigger.isDelete) {
        OppLineItemsAuditTrailHelper.addAuditOnRemoveLineItem(Trigger.old);
    }

   
 if (!oppIds.isEmpty() && Trigger.isAfter) {
        
        if (Trigger.isInsert) {
            OLI_CPWHandler.syncCPWFields(oppIds, null);
        }
        else if (Trigger.isUpdate) {
            OLI_CPWHandler.syncCPWFields(oppIds, Trigger.oldMap);
        }
    }


}