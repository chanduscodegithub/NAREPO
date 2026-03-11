trigger ADSRecordDeletion on ADS__c (before delete) {
/****************************************************************** ***** 
Name: ADSRecordDeletion 
Copyright © 2018 United Health Care.  
====================================================== 
======================================================  
Purpose: This trigger prevents the deletion of ADS records if it has related Cases
         i.e; used in UHG Internal Contact lookup
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              
1.0 -      Satish S             09/25/2018      INITIAL DEVELOPMENT      
**********************************************************************/
    for (ADS__c curr : [SELECT Id,MSid__c FROM ADS__c
                     WHERE Id IN (SELECT AMT_Member__c FROM Case) AND
                     Id IN :Trigger.old]) {
        Trigger.oldMap.get(curr.Id).addError('Cannot delete AMT (MSId='+ curr.MSid__c + ') with related Cases(UHG Internal Contact).');
                     }
}