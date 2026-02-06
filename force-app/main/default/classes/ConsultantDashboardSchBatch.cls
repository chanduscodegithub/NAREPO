/*****************************************************
* Name : ConsultantDashboardSchBatch
* Developer: Gurjot Singh
* Email: gurjot.singh@crmit.com
* Purpose: Schedular class which will execute everyday to update consultant fields on Contact object.
* Date: 
* Last Modified Date:
*******************************************************/
global class ConsultantDashboardSchBatch implements Schedulable{
    global void execute(SchedulableContext sc){
        
        // Fetch batch size from metadata
        Integer batchSize = 50; // Default batch size
        try {
            // Query the custom metadata type for batch size
            Consultant_Dashboard_Batch_Size__mdt metadataRecord = [SELECT ConsultantBatchSize__c 
                                                                   FROM Consultant_Dashboard_Batch_Size__mdt 
                                                                   WHERE DeveloperName = 'Consultant_Dashboard' LIMIT 1];
            
            if (metadataRecord != null && metadataRecord.ConsultantBatchSize__c != null) {
                batchSize = Integer.valueOf(metadataRecord.ConsultantBatchSize__c);
            }
            
        } catch (Exception e) {
            // If an error occurs, log it, but continue with the default batch size
            System.debug('Error fetching batch size from metadata: ' + e.getMessage());
        }
        
        ConsultantDashboardBatch b = new ConsultantDashboardBatch();    
        database.executebatch(b,batchSize);   
    }
}