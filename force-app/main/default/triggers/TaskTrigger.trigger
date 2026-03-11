trigger TaskTrigger on Task (before insert, before update, after insert, after update, before delete, after delete) {
	TaskTriggerHandler.handleTrigger(Trigger.Old, Trigger.New, Trigger.OldMap, Trigger.NewMap, Trigger.operationType);
}