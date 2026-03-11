/*
* Class       : staffAssignmentTriggerHelper
* Test class  : staffAssignmentTriggerHelperTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
trigger UserTrigger on User (before insert,before update) {
    UserTriggerHandler.handleTrigger(Trigger.Old, Trigger.New, Trigger.OldMap, Trigger.NewMap, Trigger.operationType);
}