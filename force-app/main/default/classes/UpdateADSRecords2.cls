global class UpdateADSRecords2 implements Database.Batchable<sObject>, Database.Stateful {
    /****************************************************************** ***** 
Name: UpdateADSRecords 
Copyright © 2020 United Health Care.  
====================================================== 
Purpose: Update Fields on existing ADS records

UpdateADSRecords2 myBatchObject = new UpdateADSRecords2(); 
Id batchId = Database.executeBatch(myBatchObject,50);
System.Debug('JobId : ' + batchId);
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              
1.0 -      Satish S             04/06/2020      INITIAL DEVELOPMENT      
*****************************************************************************/
    
    // instance member to retain state across transactions
    global Integer recordsProcessed = 0;
    global Map<Id,Id> oldNewIdMap = new Map<Id,Id>();
    
    global Database.QueryLocator start(Database.BatchableContext bc) {
        //return Database.getQueryLocator('Select Id,Employee_ID__c from ADS__c where Duplicate__c = true and Employee_ID__c = \'000004681\'');
        return Database.getQueryLocator('Select Id,Employee_ID__c from ADS__c where Duplicate__c = true');
    }
    global void execute(Database.BatchableContext bc, List<ADS__c> scope){
        // process each batch of records
        List<ADS__c> newADS = new List<ADS__c>();
        List<ADS__c> updateADS = new List<ADS__c>();
        
        for(ADS__c curr : scope){
            newADS = [Select Id from ADS__c where Employee_ID__c = :curr.Employee_ID__c and Duplicate__c = false];
            if(newADS.size() == 1)
                oldNewIdMap.put(curr.Id , newADS[0].Id);
            else if(newADS.size() == 0){
                curr.Duplicate__c = false;
                curr.Status__c = 'Inactive';
                updateADS.add(curr);
            }
            else
                System.debug('Neither 0 nor 1:' + curr.Id);
            //break;
        }
        System.debug(oldNewIdMap);
        if(updateADS.size() > 0)
            update updateADS;          
    }   
    
    global void finish(Database.BatchableContext bc){
        List<String> resultList = new List<String>();
        String result = '';
        List<Case> cases = [Select AMT_Member__c from Case where AMT_Member__c = :oldNewIdMap.keySet()];
        for(Case c : cases){
            c.AMT_Member__c = oldNewIdMap.get(c.AMT_Member__c);
            result = c.Id + '|' + c.AMT_Member__c;
            resultList.add(result);
        }
        List<Database.SaveResult> srList = Database.update(cases,false);
        List<String> slist = new List<String>();
        String message = '';  
        // Iterate through each returned result
        for (Database.SaveResult sr : srList) {
            if (sr.isSuccess()) {
                // Operation was successful, so get the ID of the record that was processed
                System.debug('Successfully inserted contact. Contact ID: ' + sr.getId());
            } else {
                // Operation failed, so get all errors
                for(Database.Error err : sr.getErrors()) {                                      
                    message = message + '\n' +  'The following error has occurred.';
                    message = message + err.getStatusCode() + ': ' + err.getMessage();
                    message = message + 'Contact fields that affected this error: '+ err.getFields();
                    system.debug(message);
                }
            }
        }//for
        
        
        System.debug(recordsProcessed + ' records processed!');
        AsyncApexJob job = [SELECT Id, Status, NumberOfErrors, 
                            JobItemsProcessed,
                            TotalJobItems, CreatedBy.Email
                            FROM AsyncApexJob
                            WHERE Id = :bc.getJobId()];
        // call some utility to send email
        List<String> emailAddresses = new List<String> {UserInfo.getUserEmail()};
            EmailManager.sendMail(emailAddresses,'Batch job completed',string.join(resultList,','));
    }    
}