trigger SoldCaseCheckListTrigger on Sold_Case_Checklist__c (before insert, before update, after insert, after update, before delete, after delete) {
	SoldCaseCheckListTriggerHandler.handleTrigger(Trigger.Old, Trigger.New, Trigger.OldMap, Trigger.NewMap, Trigger.operationType);
}