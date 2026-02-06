/****************************************************************** ***** 
Name: OpenAIBatchReprocessor 
Copyright © 2025 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
* Purpose      :  Utility class to reprocess failed LLM chunks from digitization 
*                 using the OpenAIBatchProcessor batch job.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT     

**********************************************************************/


public with sharing class OpenAIBatchReprocessor {
    /**
     * @method reprocessFailedChunks
     * @access @AuraEnabled (called from LWC)
     * @description
     *    Finds all failed chunks (Prompt Inputs) from the BatchJobLogs__c
     *    object related to a specific RFP where:
     *      - The digitization failed (Failed_one__c = true),
     *      - Reprocessing is allowed (Needs_Reprocessing__c = true),
     *      - It has failed at least 3 times (Reprocess_Attempt__c >= 3),
     *      - Component = 'Digitization'
     *    Then reprocesses them using the OpenAIBatchProcessor.
     *
     * @param rfpId The Id of the RFP__c record for which reprocessing is to be triggered.
     * @throws AuraHandledException if no chunks are eligible for reprocessing.
     */

    @AuraEnabled
    public static void reprocessFailedChunks(Id rfpId) {
        List<BatchJobLogs__c> failedLogs = [
            SELECT Prompt_Input__c
            FROM BatchJobLogs__c
            WHERE Failed_one__c = true
              AND Needs_Reprocessing__c = TRUE
              AND Reprocess_Attempt__c >= 3
              AND Error_Component__c = 'Digitization'
              AND RFP__c = :rfpId
        ];

        // // If no failed chunks found, abort with handled exception
        if (failedLogs.isEmpty()) {
            throw new AuraHandledException('No failed chunks found to reprocess.');
        }

        List<String> chunks = new List<String>();
        for (BatchJobLogs__c log : failedLogs) {
            chunks.add(log.Prompt_Input__c);
        }

        // Trigger reprocessing via batch job
        OpenAIBatchProcessor batchJob = new OpenAIBatchProcessor(rfpId, chunks); // mark as reprocessing
        Database.executeBatch(batchJob, 1);
    }
}