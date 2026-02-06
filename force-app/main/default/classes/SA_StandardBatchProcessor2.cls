/****************************************************************** ***** 
Name: SA_StandardBatchProcessor 2
Copyright © 2025 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
* Purpose      :  Batch class to process RFP Question and Answers using Einstein LLM.
                  Supports both Standard and Strategic questions based on run mode.
                  Performs retries, logs errors, updates RFP records and sends email notifications.
 
Implements:
            * - Database.Batchable<SObject>: For processing large sets of records in manageable chunks
            * - Database.AllowsCallouts: For making external API calls during execution
            * - Database.Stateful: To maintain state (like success/failure counters) across batch chunks
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT     

**********************************************************************/

public with sharing class SA_StandardBatchProcessor2 implements Database.Batchable<SObject>, Database.AllowsCallouts, Database.Stateful {

    public enum RunMode { Standard, Strategic }

    private List<RFP__c> rfpList;
    private Map<Id, Strategy_Memo__c> strategyMemoMap;
    private String productBlob;
    private Boolean encounteredError = false;
    private String failureDetails = '';
    private RunMode mode;

    private Map<Id, Integer> rfpSuccessCount = new Map<Id, Integer>();
    private Map<Id, Integer> rfpFailureCount = new Map<Id, Integer>();

    public SA_StandardBatchProcessor2(List<RFP__c> rfpList, Map<Id, Strategy_Memo__c> strategyMemoMap, String productBlob, RunMode mode) {
        this.rfpList = rfpList;
        this.strategyMemoMap = strategyMemoMap;
        this.productBlob = productBlob;
        this.mode        = mode;
    }


    // Start method - constructs a dynamic SOQL query based on run mode to fetch either strategic or standard Q&A records.
    public Database.QueryLocator start(Database.BatchableContext bc) {
      /*  List<Id> rfpQID = new List<Id>{
            'a1Hdx000000KJuhEAG',
                'a1Hdx000000KJujEAG',
                'a1Hdx000000KJuiEAG',
                'a1Hdx000000KJukEAG',
                'a1Hdx000000KJulEAG',
                'a1Hdx000000KJumEAG'
                };*/         //   'AND ID IN :rfpQID '+

        String base =
        'SELECT Id, RFP__c, RFP__r.Membership_Activity__c,' +
        '       RFP_Question__c, RFP_Question_Number__c,' +
        '       Proposal_Gateway_Response__c, Revised_Response__c, Answer_size_limit__c,' +
        '       Tabular_Record__c, IsStrategicQuestion__c ' +
        'FROM RFP_Question_And_Answer__c ' +
        'WHERE RFP__c IN :rfpList ' + 
        'AND Tabular_Record__c = FALSE ';

        if (mode == RunMode.Standard) {
            // keep only non‑tabular, non‑strategic
            base += 'AND IsStrategicQuestion__c = FALSE ';
        } else {                                                // RunMode.Strategic
            // keep only strategic
            base += 'AND IsStrategicQuestion__c = TRUE ';
        }
        try {
            return Database.getQueryLocator(base);
        } catch (Exception e) {
            SA_StrategyUtils.createErrorLog('Start Method Error', e.getMessage(), base, null, null);
            throw e;
        }
    }


    /**
     * Execute method - builds input prompts, sends them to Einstein API, processes the response,
     * and updates the question-answer records with AI-generated responses and feedback.
     */
    public void execute(Database.BatchableContext bc, List<RFP_Question_And_Answer__c> scope) {
        List<RFP_Question_And_Answer__c> updates = new List<RFP_Question_And_Answer__c>();

        for (RFP_Question_And_Answer__c q : scope) {
            try{
            String rfpId = q.RFP__c;
            Id oppId = q.RFP__r.Membership_Activity__c;

            String responseText = String.isNotBlank(q.Revised_Response__c) ? q.Revised_Response__c : q.Proposal_Gateway_Response__c;

            String input = 'RecordID: ' + q.Id + '\n\n' +
                           'RFP_Question: ' + q.RFP_Question__c + '\n\n' +
                           'Proposal_Gateway_Response: ' + responseText + '\n\n' +
                           'Answer Size Limit: ' + q.Answer_size_limit__c + '\n\n' +
                           'Customers preferred way of referring to their people: ' +
                           (strategyMemoMap.containsKey(oppId) ? strategyMemoMap.get(oppId).People__c : '') + '\n\n' +
                           'Company Name as per RFP: ' +
                           (strategyMemoMap.containsKey(oppId) ? strategyMemoMap.get(oppId).Company_Name_as_per_RFP__c : '') + '\n\n' ;

            Map<String, String> promptInput = new Map<String, String>{
                'Input:RFP_Q_A_Chunks' => input
            };

            String cleanedJson = SA_StrategyUtils.processRecordWithRetries(promptInput, 'RFP_Component_2');

            if (String.isNotBlank(cleanedJson)) {
                RFP_Question_And_Answer__c updated = processAndInsertRecord(cleanedJson);
                if (updated != null) {
                    updates.add(updated);
                     increment(rfpSuccessCount, rfpId);
                }
                else {
                        increment(rfpFailureCount, rfpId);
                        SA_StrategyUtils.createErrorLog('Processing Returned Null', 'processAndInsertRecord returned null', 'Record ID: ' + q.Id, cleanedJson, q.RFP__c);
                    }
            }
             else {
                    increment(rfpFailureCount, rfpId);
                    SA_StrategyUtils.createErrorLog('Empty cleanedJson','LLM returned blank/null response','RFP_QA ID: ' + q.Id,null,q.RFP__c);
                }
        } catch (Exception e) {
                increment(rfpFailureCount, q.RFP__c);
                SA_StrategyUtils.createErrorLog('Execute Exception', e.getMessage(), null, null, q.RFP__c);

            }
     
        }

        // if (!updates.isEmpty()) {
        //     update AS USER updates;
        //     //  update updates;
        // }

        if (!updates.isEmpty()) {
            try {
             update AS USER updates;
                // update updates;
            } catch (Exception e) {
                SA_StrategyUtils.createErrorLog('Update Error',e.getMessage(),'Failed to update QnA records',JSON.serialize(updates),null);
            }
        }
    }


    /**
     * Finish method - called after all chunks are processed.
     * Updates the RFP record stages and sends email notifications about batch outcome.
     */
    public void finish(Database.BatchableContext bc) {
         
         List<RFP__c> rfpToUpdate = new List<RFP__c>();
            for (RFP__c rfp : rfpList) {
                try {
                    RFPEmailService.EmailContext ctx = new RFPEmailService.EmailContext(rfp.Id);

                    Integer success = rfpSuccessCount.containsKey(rfp.Id) ? rfpSuccessCount.get(rfp.Id) : 0;
                    Integer failure = rfpFailureCount.containsKey(rfp.Id) ? rfpFailureCount.get(rfp.Id) : 0;

                    ctx.totalQuestions = success;

                    RFP__c rfpUpdate = new RFP__c(Id = rfp.Id);
                    if(mode == RunMode.Strategic){
                        rfpUpdate.IsBatchRunningForStrategicAiResponses__c = FALSE;
                        rfpUpdate.IsStrategicReviewCompleted__c = TRUE;
                    }
                    /*if (failure == 0) {
                         rfpUpdate.Stage__c = 'AI Review Complete';
                        String subject = 'AI-Generated RFP Responses Ready for Review - ' +rfp.Name;
                        String body = 'The uploaded RFP questions have been successfully processed, and AI-generated responses are now available for your review.<br/><br/>' +
                                        'You can access the corresponding RFP record below:';
                         ctx.totalQuestions = success;
                        RFPEmailService.sendSuccessEmail(ctx, subject, body, Label.RFP_Emails.split(','));
                    } else {
                         rfpUpdate.Stage__c = 'AI Review Completed with Errors';


                        String adminSubject = 'RFP AI Response Generation Error Notification - '+ rfp.Name +' - Action Required';
                        String userSubject = 'RFP AI Response Generation Error Notification - ' + rfp.Name;
                        RFPEmailService.sendErrorEmails(ctx, adminSubject, userSubject, 'AI-generated responses');
                    }*/
                    rfpToUpdate.add(rfpUpdate);
                } catch (Exception e) {
                    SA_StrategyUtils.createErrorLog('Finish Email Error', e.getMessage(), 'RFP: ' + rfp.Id, null, rfp.Id);
                }
            }


             if (!rfpToUpdate.isEmpty()) {
                try {
                    update AS USER rfpToUpdate;
                   /* SA_StandardBatchProcessor.RunMode mode1;
                    if (mode == SA_StandardBatchProcessor2.RunMode.Strategic) {
                        mode1 = SA_StandardBatchProcessor.RunMode.Strategic;
                    } else {
                        mode1 = SA_StandardBatchProcessor.RunMode.Standard;
                    }*/
                    SA_StandardBatchProcessor stdBatch = new SA_StandardBatchProcessor(rfpToUpdate,strategyMemoMap,productBlob,SA_StandardBatchProcessor.RunMode.Standard);
                    Database.executeBatch(stdBatch, 5);
                        
                    //   update rfpToUpdate;
                } catch (Exception e) {
                    SA_StrategyUtils.createErrorLog('RFP Update Error', e.getMessage(), 'RFP Updates', null, null);
                }
            }
    }


    // === Utility Methods ===

    /**
     * Parses the JSON response, constructs and returns an updated RFP Q&A record.
     */
    private RFP_Question_And_Answer__c processAndInsertRecord(String response) {
        try {
            Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(response);
            if (!parsed.containsKey('recordId')) return null;

            String recordId = (String) parsed.get('recordId');
            String rewritten = (String) parsed.get('rewrittenResponse');
            List<Object> feedbackList = (List<Object>) parsed.get('feedback');

            String feedbackText = '[]';
            if (feedbackList != null && !feedbackList.isEmpty()) {
                feedbackText = '';
                for (Object obj : feedbackList) {
                    Map<String, Object> f = (Map<String, Object>) obj;
                    feedbackText += 'header: ' + (String) f.get('header') + '\n' +
                                    'description: ' + (String) f.get('description') + '\n\n';
                }
            }

            return new RFP_Question_And_Answer__c(
                Id = recordId,
                Rephrased_Response__c = rewritten,
                AI_Feedback__c = feedbackText,
                IsAiProcessed__c = true
            );
        } catch (Exception e) {
            SA_StrategyUtils.createErrorLog('Parse Error', e.getMessage(), null, response, null);
            return null;
        }
    }

    /**
     * Helper method to increment success/failure counts for RFPs.
     */
    private void increment(Map<Id, Integer> maps, Id key) {
        if (!maps.containsKey(key)) {
            maps.put(key, 1);
        } else {
            maps.put(key, maps.get(key) + 1);
        }
    }

}