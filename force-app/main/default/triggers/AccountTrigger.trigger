/****************************************************************** ***** 
Name: EmailToAdminsOnAccountRecordDelete 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: This trigger fires an email alert to all admins when an account record is deleted.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      S Vishnu Shankar       05/09/2017      INITIAL DEVELOPMENT      Email sent only to System Admin
2.0 -      S Vishnu Shankar       08/09/2017      INITIAL DEVELOPMENT      Email sent to Record Owner & System Admin
3.0 -
*********************************************************************
*/

trigger AccountTrigger on Account (before delete, after update) {
	
    if(Trigger.IsDelete && Trigger.IsBefore){
        AccountTriggerHandler.deforedelete(Trigger.old);
    }
    //Added Client Strategy Unlock status to Draft
    if (Trigger.isAfter && Trigger.isUpdate) {
        //if Engagement summary still in progress then comment from start to end.
        //---- Start---//
        AccountTriggerHandler.afterUpdate(Trigger.new, Trigger.oldMap);
        AccountStrategyMemoHandler.updateStrategyMemos(Trigger.new, Trigger.oldMap);
        //--- End----//
    }
    
    
}