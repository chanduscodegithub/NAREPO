global class UpdateADSRecords implements Database.Batchable<sObject>, Database.Stateful {
/****************************************************************** ***** 
Name: UpdateADSRecords 
Copyright © 2020 United Health Care.  
====================================================== 
Purpose: Update Fields on existing ADS records

UpdateADSRecords myBatchObject = new UpdateADSRecords(); 
Id batchId = Database.executeBatch(myBatchObject);
System.Debug('JobId : ' + batchId);
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              
1.0 -      Satish S             04/06/2020      INITIAL DEVELOPMENT      
*****************************************************************************/
    
    // instance member to retain state across transactions
    global Integer recordsProcessed = 0;
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'Select MSid__c,Employee_ID__c,Duplicate__c from ADS__c where Duplicate__c = false'
        );
    }
    global void execute(Database.BatchableContext bc, List<ADS__c> scope){
        // process each batch of records
        for (ADS__c ads : scope) {
                ads.Duplicate__c = true;
                ads.Status__c = 'Inactive';
                recordsProcessed = recordsProcessed + 1;
            }
        update scope;
    }   
    
    global void finish(Database.BatchableContext bc){
        System.debug(recordsProcessed + ' records processed!');
        AsyncApexJob job = [SELECT Id, Status, NumberOfErrors, 
            JobItemsProcessed,
            TotalJobItems, CreatedBy.Email
            FROM AsyncApexJob
            WHERE Id = :bc.getJobId()];
        // call some utility to send email
        List<String> emailAddresses = new List<String> {UserInfo.getUserEmail()};
        EmailManager.sendMail(emailAddresses,'Batch job completed',JSON.serialize(job));
    }    
}