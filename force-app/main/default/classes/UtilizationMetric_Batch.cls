/*------------------------------------------------------------------------------------
Author:        Paras Prajapati
Description:   This class will be scedule for Creating Utilization Matric Records for each user
History
Date            Author             Comments
--------------------------------------------------------------------------------------
09-09-2019      Paras Prajapati    
------------------------------------------------------------------------------------*/
global class UtilizationMetric_Batch implements Schedulable,Database.Batchable<Sobject>, Database.Stateful { 
    // String query
    global String query; 
    // Build the query String
    public UtilizationMetric_Batch() {
        // Note : Do not remove Test.isRunningTest() check - It is written to control the number of records, when running
        // Test Class 
        this.query='Select id,profile.name,ManagerId,Manager.Name,Email from User where ' + System.Label.UtilizationMetric_Batch_SOQL_Criteria_Label +
            (Test.isRunningTest()?' AND username=\'utilization@test.com\' LIMIT 200':'');
    }
    
    global void execute(SchedulableContext context) { 
        Database.executeBatch(new UtilizationMetric_Batch());
    }
        
    /**
     *  @description Start the batch - Gather the Account records. This will also Lock the account records.
     */
    global Database.QueryLocator start(Database.BatchableContext info) {
        return Database.getQueryLocator(this.query);
    }
    
    /*
     *  @description Executes the following code during the batch
     */
    global void execute(Database.BatchableContext info, List<User> scope) {
       UtilizationMatric_Batch_Handler.processUserForUtilizationMatric(scope);
    }
    
    /**
     *  @description Executes when the batch finishes
     */
    global void finish(Database.BatchableContext info) {
        // Do nothing
     }
}