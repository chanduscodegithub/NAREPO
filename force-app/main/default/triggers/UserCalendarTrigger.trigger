/*------------------------------------------------------------------------------------
Author:        Paras Prajapati
Description:   Trigger to handle Upsert Scenerio
History
Date            Author             Comments
--------------------------------------------------------------------------------------
09-09-2019      Paras Prajapati    
------------------------------------------------------------------------------------*/
trigger UserCalendarTrigger on User_Calendar__c (before insert, after insert, before update,after update,before delete) {
    switch on Trigger.operationType {
        when AFTER_INSERT {
            UserCalendarTriggerHandler.handleUserCalenderInsert(Trigger.new); 
        }
        when AFTER_UPDATE {
            UserCalendarTriggerHandler.handleUserCalenderAfterUpdate(Trigger.new,Trigger.newMap,Trigger.oldMap);
        }
        when BEFORE_DELETE{
            UserCalendarTriggerHandler.handleBeforeDelete(Trigger.old);
        }

    }
}