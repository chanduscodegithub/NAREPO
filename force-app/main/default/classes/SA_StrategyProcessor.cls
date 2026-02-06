// /****************************************************************** *****
// Name: SA_StrategyProcessor
// Copyright © 2025 CRMIT Solutions Company Inc.  
// ======================================================
// ======================================================  
// * Purpose      : Responsible for identifying and processing strategic questions from RFP.
// *                Integrates with LLM services to fetch AI-generated feedback for strategic content,
// *                and logs results or errors accordingly. It also sends user/admin email notifications
// *                based on success/failure outcomes.
// ======================================================  
// History
// -------
// VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
// 1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT    

// **********************************************************************/

public with sharing class SA_StrategyProcessor {

    private Map<Id, Integer> rfpSuccessCount = new Map<Id, Integer>();
    private Map<Id, Integer> rfpFailureCount = new Map<Id, Integer>();

    /**
     * Now accepts:
     *  - rfpList: list of RFP__c to process
     *  - rfpToStrategicMap: Map<RFPId, Set<String>> where strings are tokens:
     *       Word/docs -> "QUESTION_NO"
     *       Excel -> "SHEET_NAME|QUESTION_NO"
     */
    public void processStrategicQuestions( List<RFP__c> rfpList, Map<Id, Set<String>> rfpToStrategicMap, Map<Id, Strategy_Memo__c> strategyMemoMap, String reason, String productBlob) {

        if (rfpList == null || rfpList.isEmpty()) return;

        // Build a set of RFP ids to query Q&A
        Set<Id> rfpIds = new Set<Id>();
        for (RFP__c r : rfpList) rfpIds.add(r.Id);

        // Query ALL questions for these RFPs (we will filter in Apex using tokens)
        List<RFP_Question_And_Answer__c> allQuestions;
        try {
            allQuestions = [
                SELECT Id, RFP__c, RFP_Question_Number__c, RFP_Question__c, Proposal_Gateway_Response__c, IsStrategicQuestion__c, RFP__r.Membership_Activity__c, Sheet_Name__c
                FROM RFP_Question_And_Answer__c
                WHERE RFP__c IN :rfpIds
            ];
        } catch (Exception e) {
            SA_StrategyUtils.createErrorLog('SOQL Failure', e.getMessage(), 'Fetching RFP Q&A', null, null);
            return;
        }


                            // New implementation 

            // Group by RFP__c
        Map<Id, List<RFP_Question_And_Answer__c>> rfpToQnAList = new Map<Id, List<RFP_Question_And_Answer__c>>();
        for (RFP_Question_And_Answer__c q : allQuestions) {
            if (!rfpToQnAList.containsKey(q.RFP__c)) {
                rfpToQnAList.put(q.RFP__c, new List<RFP_Question_And_Answer__c>());
            }
            rfpToQnAList.get(q.RFP__c).add(q);
        }

                                // END

                                
        // Map RFP Id -> list of formatted strings for LLM input
        Map<Id, List<String>> rfpToQuestionsMap = new Map<Id, List<String>>();
        // Map RFP Id -> Opportunity Id
        Map<Id, Id> rfpToOpportunityMap = new Map<Id, Id>();
        List<RFP_Question_And_Answer__c> qnaToUpdate = new List<RFP_Question_And_Answer__c>();


                                        // Third IMPlementation 
                                        
        for (RFP__c r : rfpList) {
            List<RFP_Question_And_Answer__c> qnaList = rfpToQnAList.get(r.Id);
            if (qnaList == null || qnaList.isEmpty()) continue;

            Set<String> expectedTokens = rfpToStrategicMap.get(r.Id);
            if (expectedTokens == null) expectedTokens = new Set<String>();

            for (RFP_Question_And_Answer__c q : qnaList) {
                // Build token
                String token = String.isNotBlank(q.Sheet_Name__c)
                    ? q.Sheet_Name__c.trim() + '|' + q.RFP_Question_Number__c
                    : q.RFP_Question_Number__c;

                Boolean shouldBeStrategic = expectedTokens.contains(token);
                Boolean currentlyStrategic = q.IsStrategicQuestion__c;

                // Update only if changed
                if (shouldBeStrategic != currentlyStrategic) {
                    qnaToUpdate.add(new RFP_Question_And_Answer__c(
                        Id = q.Id,
                        IsStrategicQuestion__c = shouldBeStrategic
                    ));
                }

                // Prepare LLM input only for strategic questions
                if (shouldBeStrategic) {
                    if (!rfpToQuestionsMap.containsKey(r.Id)) {
                        rfpToQuestionsMap.put(r.Id, new List<String>());
                    }
                    rfpToQuestionsMap.get(r.Id).add(
                        'Question Number: ' + q.RFP_Question_Number__c + '\n' +
                        'RFP_Question: ' + q.RFP_Question__c + '\n' +
                        'Proposal_Gateway_Response: ' + q.Proposal_Gateway_Response__c + '\n'
                    );

                    if (q.RFP__r != null && q.RFP__r.Membership_Activity__c != null) {
                        rfpToOpportunityMap.put(r.Id, q.RFP__r.Membership_Activity__c);
                    }
                }
            }
        }

        //  Perform one DML for all changed records
        if (!qnaToUpdate.isEmpty()) {
            try {
                update AS USER qnaToUpdate;
            } catch (Exception e) {
                SA_StrategyUtils.createErrorLog('Update Failure', e.getMessage(),
                    'Updating IsStrategicQuestion__c', null, null);
            }
        }

        // Prepare feedback input and call LLM for each RFP that had strategic questions
        List<Strategic_Questions_Feedback__c> feedbacks = new List<Strategic_Questions_Feedback__c>();

        for (Id rfpId : rfpToQuestionsMap.keySet()) {
            try {
                Id oppId = rfpToOpportunityMap.containsKey(rfpId) ? rfpToOpportunityMap.get(rfpId) : null;
                Strategy_Memo__c memo = (oppId != null && strategyMemoMap != null) ? strategyMemoMap.get(oppId) : null;

                // Build input map for LLM
                Map<String, String> input = new Map<String, String>();
                input.put('Input:RFP_Question_and_Answer', String.join(rfpToQuestionsMap.get(rfpId), '\n\n'));
                input.put('Input:Strategy_Memo_Input', (memo != null ? String.valueOf(memo.Id) : ''));

                String jsonResponse = SA_StrategyUtils.processRecordWithRetries(input, 'RFP_Component_2_Strategic_Questions_Review');

                if (String.isNotBlank(jsonResponse)) {
                    feedbacks.add(SA_StrategyUtils.getStrategicQuestionFeedback(jsonResponse, String.valueOf(rfpId), memo, reason));
                    increment(rfpSuccessCount, rfpId);
                } else {
                    SA_StrategyUtils.createErrorLog('Empty LLM Response', 'LLM returned null/empty response for RFP ID: ' + rfpId, JSON.serialize(input), null, rfpId);
                    increment(rfpFailureCount, rfpId);
                }

            } catch (Exception e) {
                SA_StrategyUtils.createErrorLog('LLM Processing Error', e.getMessage(), 'RFP: ' + rfpId, null, rfpId);
                increment(rfpFailureCount, rfpId);
            }
        }

        // Save feedback
        try {
            if (!feedbacks.isEmpty()) {
                insert AS USER feedbacks;
            }
        } catch (Exception e) {
            SA_StrategyUtils.createErrorLog('Insert Feedback Error', e.getMessage(), 'Feedback List Size: ' + feedbacks.size(), null, null);
        }

        // Send email summaries to users/admins
        for (RFP__c rfp : rfpList) {
            try {
                if (!rfpSuccessCount.containsKey(rfp.Id) && !rfpFailureCount.containsKey(rfp.Id)) {
                    continue;
                }
                RFPEmailService.EmailContext ctx = new RFPEmailService.EmailContext(rfp.Id);

                Integer success = rfpSuccessCount.containsKey(rfp.Id) ? rfpSuccessCount.get(rfp.Id) : 0;
                Integer failure = rfpFailureCount.containsKey(rfp.Id) ? rfpFailureCount.get(rfp.Id) : 0;

                if (failure == 0) {
                    String subject = 'Strategy Points Processed – Review and Proceed with AI Response Generation -' + rfp.Name;
                    String body = 'The uploaded RFP questions have been successfully processed. Strategy-related questions have been identified, and AI-generated feedback on strategy points is now available for your review.<br/><br/>' +
                                  'Please review the feedback, make any necessary modifications, and proceed with generating the AI responses for the strategy questions. <br/><br/>' +
                                  'You can access the corresponding RFP record below:';
                    ctx.totalQuestions = rfpToQuestionsMap.containsKey(rfp.Id)
                                         ? rfpToQuestionsMap.get(rfp.Id).size()
                                         : 0;
                    RFPEmailService.sendSuccessEmail(ctx, subject, body, Label.RFP_Emails.split(','));
                } else {
                    String adminSubject = 'Strategy Points Feedback Processing Error -' + rfp.Name + ' - Action Required';
                    String userSubject = 'Strategy Points Feedback Processing Error - ' + rfp.Name;
                    RFPEmailService.sendErrorEmails(ctx, adminSubject, userSubject, 'AI-generated feedback on strategy points');
                }
            } catch (Exception e) {
                SA_StrategyUtils.createErrorLog('Email Send Error', e.getMessage(), 'RFP: ' + rfp.Id, null, rfp.Id);
            }
        }
    }

    /**
     * Helper to increment map counters for RFP success/failure counts.
     * @param maps The map to update.
     * @param key  The RFP ID.
     */
    private void increment(Map<Id, Integer> maps, Id key) {
        if (!maps.containsKey(key)) maps.put(key, 1);
        else maps.put(key, maps.get(key) + 1);
    }
}