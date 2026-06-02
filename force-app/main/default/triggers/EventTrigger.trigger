trigger EventTrigger on Event (before insert, before update, after insert, after update, before delete, after delete) {
    //if (Trigger.isBefore) {
       // EventTriggerHandler.handleTrigger(Trigger.newMap.keySet(), Trigger.new, Trigger.oldMap, Trigger.isUpdate);
        	EventTriggerHandler.handleTrigger(Trigger.New, Trigger.Old, Trigger.NewMap, Trigger.OldMap, Trigger.operationType);

   // }
}