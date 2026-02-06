public with sharing class SA_StrategyBatchProcessor implements Database.Batchable<SOBject>, Database.AllowsCallouts, Database.Stateful {
    private static final Integer MAX_RETRIES = 3;
    private Id rfpId;
    private List<String> singleRecord;
    private Id strategyMemoId;
    private Boolean processingSuccess = false;
    private Boolean encounteredError = false;
    private String failureDetails = '';
    List<RFP__c> rfpList = new List<RFP__c>();
    Map<String,List<String>> rfpQnAMap = new Map<String,List<String>>();
    Map<Id,Strategy_Memo__c> oppStrategyMemoMap = new Map<Id,Strategy_Memo__c>();
    private String reason;
    Map<String,Set<String>> opportunityStrategyMap;
    String blobOfAllActiveProducts;
    Boolean isStrategyAiReview;
    List<RFP__c> rfpToUpdateList = new List<RFP__c>();
    public SA_StrategyBatchProcessor(Map<String,Set<String>> opportunityStrategyMap,List<RFP__c> rfpList,String reason,Map<Id,Strategy_Memo__c> oppStrategyMemoMap, String blobOfAllActiveProducts,Boolean isStrategyAiReview) {
        this.opportunityStrategyMap = opportunityStrategyMap;
        this.rfpList = rfpList;
        this.reason = reason;
        this.oppStrategyMemoMap = oppStrategyMemoMap;
        this.blobOfAllActiveProducts = blobOfAllActiveProducts;
        this.isStrategyAiReview = isStrategyAiReview;
    }
    
    
    
    public Database.QueryLocator start(Database.BatchableContext bc){
        String query = 'SELECT Id, RFP_Question__c, Proposal_Gateway_Response__c,Revised_Response__c,RFP_Question_Number__c,Answer_size_limit__c, Tabular_Record__c,RFP__r.Membership_Activity__c,RFP__c FROM RFP_Question_And_Answer__c WHERE RFP__c IN :rfpList AND Tabular_Record__c= FALSE ORDER BY CreatedDate ASC';
        return Database.getQueryLocator(query);
    }
    
    public void execute(Database.BatchableContext bc, List<RFP_Question_And_Answer__c> scope) {
        
        List<RFP_Question_And_Answer__c> recordsToUpdate = new List<RFP_Question_And_Answer__c>();
        List<String> strategyRecords = new List<String>();
        Map<String,List<String>> rfpQnAMap = new Map<String,List<String>>();
        Map<String,List<String>> rfpQnAMapForAIReview = new Map<String,List<String>>();
        Map<String,String> rfpOpportunityMap = new Map<String,String>();
        List<RFP_Question_And_Answer__c> qnaListToUpdate = new List<RFP_Question_And_Answer__c>();
        
        for (RFP_Question_And_Answer__c record : scope) {       
            
            rfpOpportunityMap.put(record.RFP__c,record.RFP__r.Membership_Activity__c);
            // Boolean isStrategyQuestion = opportunityStrategyMap.get(record.RFP__r.Membership_Activity__c).contains(record.RFP_Question_Number__c);
            
            Boolean isStrategyQuestion = false;
            Id oppId = record.RFP__r != null ? record.RFP__r.Membership_Activity__c : null;
            
            Set<String> strategyQuestions = opportunityStrategyMap.get(oppId);
            isStrategyQuestion = strategyQuestions != null && strategyQuestions.contains(record.RFP_Question_Number__c);
            
            
            if (isStrategyQuestion && !isStrategyAiReview) {
                record.IsStrategicQuestion__c = true;
                recordsToUpdate.add(record);
                String strategyFormatted = 'Strategy_Record_Id: ' + record.Id + '\n'    
                    + 'RFP_Question: ' + record.RFP_Question__c + '\n'
                    + 'Question Number: ' +record.RFP_Question_Number__c + '\n'
                    + 'Proposal_Gateway_Response: ' + record.Proposal_Gateway_Response__c + '\n';
                
                if(rfpQnAMap.containsKey(record.RFP__c)){
                    rfpQnAMap.get(record.RFP__c).add(strategyFormatted);
                }else{
                    rfpQnAMap.put(record.RFP__c,new List<String>{strategyFormatted});
                }
                
                
            }else if(record.Tabular_Record__c == false && String.isNotBlank(record.RFP_Question__c) && String.isNotBlank(record.Proposal_Gateway_Response__c)){
                String responseToUse;
                if(isStrategyAiReview){
                    responseToUse = String.isNotBlank(record.Revised_Response__c) ? record.Revised_Response__c : record.Proposal_Gateway_Response__c;
                }else{
                    responseToUse = record.Proposal_Gateway_Response__c;
                }
                
                String nonStrategyFormatted = 'RecordID: ' + record.Id + '\n\n'    
                    + 'RFP_Question: ' + record.RFP_Question__c + '\n\n'
                    + 'Proposal_Gateway_Response: ' + responseToUse + '\n\n'
                    + 'Answer Size Limit: ' + record.Answer_size_limit__c + '\n\n'
                    + 'Customers preferred way of referring to their people: ' + (oppStrategyMemoMap.get(record.RFP__r.Membership_Activity__c) != null ? oppStrategyMemoMap.get(record.RFP__r.Membership_Activity__c).People__c : '') + '\n\n'
                    + 'Company Name as per RFP: ' + (oppStrategyMemoMap.get(record.RFP__r.Membership_Activity__c) != null ? oppStrategyMemoMap.get(record.RFP__r.Membership_Activity__c).Company_Name_as_per_RFP__c : '') + '\n\n'
                    + 'All Available Products List ' + blobOfAllActiveProducts + '\n\n';
                
                if(rfpQnAMapForAIReview.containsKey(record.RFP__c)){
                    rfpQnAMapForAIReview.get(record.RFP__c).add(nonStrategyFormatted);
                }else{
                    rfpQnAMapForAIReview.put(record.RFP__c,new List<String>{nonStrategyFormatted});
                }
                
                // eligibleNonStrategyRecords.add(nonStrategyFormatted);
            }
        }
        System.debug('strategyMemo===>'+JSON.serializePretty(rfpQnAMap));
        String processingRec;
        Map<String,String> rfpFeedbackMap = new Map<String,String>();
        
        List<Strategic_Questions_Feedback__c> strategyFeedbackList = new List<Strategic_Questions_Feedback__c>();
        
        for(String str:rfpQnAMap.keySet()){
            Map<String, String> feebackInput = new Map<String, String>();
            feebackInput.put('Input:RFP_Question_and_Answer',String.join(rfpQnAMap.get(str),'\n\n')); 
            feebackInput.put('Input:Strategy_Memo_Input',oppStrategyMemoMap.get(rfpOpportunityMap.get(str)).Id); 
            String cleanedJson = processRecordWithRetries(feebackInput,'RFP_Component_2_Strategic_Questions_Review');
            if (String.isNotBlank(cleanedJson)) {
                
                rfpToUpdateList.add(storeJsonToRFP(cleanedJson,str));
                strategyFeedbackList.add(getstrategicQuestionFeedback(cleanedJson,str,rfpOpportunityMap.get(str),reason));
            }
        }
        
        for(String str:rfpQnAMapForAIReview.keySet()){
            Map<String, String> aiReviewInput = new Map<String, String>();
            
            for(String qna:rfpQnAMapForAIReview.get(str)){
                aiReviewInput.put('Input:RFP_Q_A_Chunks',qna);
                String cleanedJson = processRecordWithRetries(aiReviewInput,'RFP_Component_2');
                
                // processAndInsertRecord
                // 
                if (String.isNotBlank(cleanedJson)) {
                    recordsToUpdate.add(processAndInsertRecord(cleanedJson));
                    //rfpToUpdateList.add(storeJsonToRFPForAI(str));
                    // strategyFeedbackList.add(getstrategicQuestionFeedback(cleanedJson,str,rfpOpportunityMap.get(str),reason));
                }
            }
            
            
        }
        
        
        if (!recordsToUpdate.isEmpty()) {
            update recordsToUpdate;
            // update AS USER recordsToUpdate;
        }
        if (!strategyFeedbackList.isEmpty()) {
            // insert AS USER strategyFeedbackList;
            insert strategyFeedbackList;
        }
        
        System.debug('--- [Execute] Processing record');
        
        
        
        
    }
    
    public void finish(Database.BatchableContext bc) {
        
        Set<RFP__c> rfpSet = new Set<RFP__c>();
        List<RFP__c> rfpListUpdate = new List<RFP__c>();
        List<RFP__c> lsitToProcess = isStrategyAiReview ? rfpList : rfpToUpdateList.size()>0 ? rfpToUpdateList : [SELECT Id,Stage__c FROM RFP__c WHERE Id IN: rfpList ];
            List<RFP__c> rfpList = [SELECT Name, Membership_Activity__r.Name
                                    FROM RFP__c WHERE Id IN :rfpList];
        try {
            for (RFP__c rfp: lsitToProcess){
                if(isStrategyAiReview){
                    rfp.IsBatchRunningForStrategicAiResponses__c = false;
                    rfp.IsStrategicReviewCompleted__c = true;
                }
                rfp.Stage__c = 'AI Review Complete';
                
                rfpSet.add(rfp);
            }
            System.debug('rfpSet--->'+rfpSet);
            rfpListUpdate.addAll(rfpSet);
            System.debug('rfpListUpdate--->'+rfpListUpdate);
            if(rfpListUpdate.size()>0){
                update rfpListUpdate;
            }
            
            if (encounteredError) {
                sendFailureEmail();
            } else {
                sendCompletionEmail();
            }
            
        } catch (Exception e) {
            System.debug('--- [Finish] Error updating RFP: ' + e.getMessage());
            createErrorLog('Finish Update Error', e.getMessage(), null, null);
        }
    }
    
    
    public void sendCompletionEmail() {
        try {
            // Get RFP and Membership Activity (Opportunity) details
            List<RFP__c> rfpList = [SELECT Name, Membership_Activity__r.Name
                                    FROM RFP__c WHERE Id IN :rfpList];
            
            User currentUser = [SELECT Name, Email FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            
            OrgWideEmailAddress owea = [
                SELECT Id
                FROM OrgWideEmailAddress
                WHERE Address = 'merit@uhc.com'
                LIMIT 1
            ];
            
            List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
            
            for (RFP__c rfp : rfpList) {
                // Prepare recipients
                List<String> recipientEmails = new List<String>();
                recipientEmails.add(currentUser.Email); // current user
                recipientEmails.addAll(Label.RFP_Emails.split(',')); // custom label
                
                // Prepare the email
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setToAddresses(recipientEmails);
                email.setSubject('AI Review Complete — ' + rfp.Membership_Activity__r.Name);
                
                // ✅ Set the "From" address
                email.setOrgWideEmailAddressId(owea.Id);
                
                String recordUrl = URL.getOrgDomainUrl().toExternalForm() +
                    '/lightning/r/RFP__c/' + rfp.Id + '/view';
                
                String htmlBody = 'Dear ' + currentUser.Name + ',<br/><br/>' +
                    'This is to inform you that the AI review for the RFP <b>' + rfp.Membership_Activity__r.Name + '</b> has been successfully completed.<br/>' +
                    'You can now review the results and insights generated during the AI analysis in Salesforce.<br/><br/>' +
                    'Access the RFP record by <a href="' + recordUrl + '">clicking here</a>.<br/><br/>' +
                    'Thank you.';
                
                email.setHtmlBody(htmlBody);
                emailList.add(email);
            }
            
            // Send all emails
            if (!emailList.isEmpty()) {
                Messaging.sendEmail(emailList);
            }
            
            if(emailList.size()>0){
                Messaging.sendEmail(emailList);
            }
        } catch(Exception e) {
            // Log the error if email sending fails
            createErrorLog('Email Failed', 'Failed to send completion email: ' + e.getMessage(), null, null);
        }
    }
    
    
    private void sendFailureEmail() {
        try {
            List<RFP__c> rfpList = [SELECT Name, Membership_Activity__r.Name FROM RFP__c WHERE Id IN :rfpList];
            List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
            
            // List<String> recipientEmails = new List<String>{
            //     'ryan.ahmed@crmit.com',
            //         'sirisha.srinivas@crmit.com',
            //         'nitish.singh@crmit.com'
            //         };
            for(RFP__c rfp: rfpList){           
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setToAddresses(Label.RFP_Emails.split(','));
                email.setSubject('RFP Strategy Batch Failed — ' + rfp.Membership_Activity__r.Name);
                
                String recordUrl = URL.getOrgDomainUrl().toExternalForm() +
                    '/lightning/r/RFP__c/' + rfp.Id + '/view';
                
                String htmlBody = 'Dear Team,<br/><br/>' +
                    'The Strategic Feedback processing for the RFP <b>' + rfp.Name + '</b> has failed.<br/>' +
                    'Failure Reason: <br/><pre>' + failureDetails + '</pre><br/>' +
                    'You can review the details by <a href="' + recordUrl + '">clicking here</a>.<br/><br/>' +
                    'Please take corrective action if necessary.<br/><br/>' +
                    'Thank you.';
                
                email.setHtmlBody(htmlBody);
                emailList.add(email);
                //Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{email});
                
            }
            if(emailList.size()>0){
                Messaging.sendEmail(emailList);
            }
        } catch (Exception e) {
            System.debug('--- [Email Error] Failed to send failure notification: ' + e.getMessage());
        }
    }
    
    
    
    private String processRecordWithRetries(Map<String, String> promptInput,String promptName) {
        Integer retryCount = 0;
        String rawApiResponse;
        String cleanedJson;
        String record;
        //System.debug('record===>'+record);
        while (retryCount < MAX_RETRIES) {
            try {
                
                ConnectApi.EinsteinPromptTemplateGenerationsInput input = createPromptInput(promptInput);
                
                if(promptName == 'RFP_Component_2_Strategic_Questions_Review'){
                    record = promptInput.get('Input:RFP_Question_and_Answer');
                }else if(promptName == 'RFP_Component_2') {
                    record = promptInput.get('Input:RFP_Q_A_Chunks');
                }
                
                ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result = ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(promptName, input);
                if (result != null && !result.generations.isEmpty()) {
                    rawApiResponse = result.generations[0].text;
                    
                    
                    cleanedJson = cleanJsonResponse(record, rawApiResponse);
                    
                    if (String.isNotBlank(cleanedJson)) {
                        return cleanedJson;
                    } else {
                        createErrorLog('Empty Cleaned Response', 'JSON after cleanup is empty', record, rawApiResponse);
                    }
                } else {
                    createErrorLog('Empty LLM Response', 'No content returned', record, null);
                }
            } catch (Exception e) {
                createErrorLog('LLM Exception', 'Retry ' + retryCount + ': ' + e.getMessage(), record, null);
            }
            retryCount++;
        }
        return null;
    }
    
    
    public RFP__c storeJsonToRFP(String cleanedJSON,String rfpId){
        
        RFP__c rfpRec = new RFP__c();
        rfpRec.IsStrategicReviewCompleted__c = false;
        rfpRec.Strategic_Questions_Feedback__c = cleanedJSON;
        
        rfpRec.Id = rfpId;
        
        return rfpRec;
    }
    
    public RFP__c storeJsonToRFPForAI(String rfpId){
        
        RFP__c rfpRec = new RFP__c();
        rfpRec.Id = rfpId;
        
        return rfpRec;
    }
    
    public Strategic_Questions_Feedback__c getstrategicQuestionFeedback(String cleanedJSON, String rfpId, String membershipActivityId, String reason){
        
        Strategy_Memo__c memo = [SELECT Id, Strategic_Question_No__c
                                 FROM Strategy_Memo__c
                                 WHERE Membership_Activity__c = :membershipActivityId
                                ];        
        Strategic_Questions_Feedback__c feedbackRecord = new Strategic_Questions_Feedback__c(
            RFP__c = rfpId,
            AI_Feedback__c = cleanedJson,
            Strategic_Question_Numbers__c = memo.Strategic_Question_No__c,
            Reason_for_Reprocessing__c= reason
        );
        return feedbackRecord;
    }
    
    
    
    private void createErrorLog(String type, String details, String input, String response) {
        try {
            BatchJobLogs__c log = new BatchJobLogs__c();
            log.Prompt_Input__c = input != null ? input : 'No input';
            log.Prompt_Response__c = response;
            log.ErrorChunk__c = type + ' - ' + details;
            log.Job_Started__c = DateTime.now();
            log.Job_Ended__c = DateTime.now();
            log.RFP__c = rfpId;
            // insert AS USER log;
            insert log;
            encounteredError = true;
            
        } catch (Exception ex) {
            System.debug('--- [Log Error] Could not insert error log: ' + ex.getMessage());
        }
    }
    
    private ConnectApi.EinsteinPromptTemplateGenerationsInput createPromptInput(Map<String, String> inputValues) {
        try {
            ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
            promptInput.isPreview = false;
            
            Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();
            
            for (String inputKey : inputValues.keySet()) {
                ConnectApi.WrappedValue wrappedValue = new ConnectApi.WrappedValue();
                wrappedValue.value = inputValues.get(inputKey);
                inputParams.put(inputKey, wrappedValue);
            }
            
            promptInput.inputParams = inputParams;
            promptInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
            promptInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';
            
            System.debug('Prompt input ready: ' + promptInput);
            return promptInput;
            
        } catch (Exception ex) {
            createErrorLog('Prompt Input Creation Failed', 
                           ex.getMessage(), 
                           JSON.serialize(inputValues), 
                           null);
            throw ex;
        }
    }
    
    
    public String cleanJsonResponse(String record, String response) {
        if (String.isBlank(response)) {
            
            return null;
        }
        
        String cleaned = response.trim();
        
        if (cleaned.startsWith('```')) {
            Integer newline = cleaned.indexOf('\n'); 
            if (newline > 0) {
                cleaned = cleaned.substring(newline + 1);
            }
            if (cleaned.endsWith('```')) {
                cleaned = cleaned.substring(0, cleaned.lastIndexOf('```'));
            }
            //  cleaned = cleaned.trim();
        }
        
        Integer startIndex = cleaned.indexOf('{');
        Integer endIndex = cleaned.lastIndexOf('}');
        
        if (startIndex >= 0 && endIndex > startIndex) {
            cleaned = cleaned.substring(startIndex, endIndex + 1);
            return cleaned;
        } else {
            createErrorLog('Malformed JSON', 'No valid JSON block found', record, response);
            return null;
        }
    }
    
    public RFP_Question_And_Answer__c processAndInsertRecord(String response) {
        try {
            
            Map<String, Object> parsedResponse = (Map<String, Object>) JSON.deserializeUntyped(response);
            
            
            if (!parsedResponse.containsKey('recordId')) {
                System.debug(LoggingLevel.WARN, 'No record ID found in the response.');
                createErrorLog('Missing Record ID', 
                               'Response JSON did not contain a recordId field', 
                               null, 
                               response);
                return null;
            }
            
            String recordId = (String) parsedResponse.get('recordId');
            String rewrittenResponse = (String) parsedResponse.get('rewrittenResponse');
            List<Object> feedbackList = (List<Object>) parsedResponse.get('feedback');
            
            // Format feedback as plain text
            String formattedFeedback = '[]'; // Default value for empty feedback
            if (feedbackList != null && !feedbackList.isEmpty()) {
                formattedFeedback = ''; // Reset if we have actual feedback
                for (Object feedbackObj : feedbackList) {
                    Map<String, Object> f = (Map<String, Object>) feedbackObj;
                    String header = String.valueOf(f.get('header'));
                    String description = String.valueOf(f.get('description'));
                    formattedFeedback += 'header: ' + (String.isNotBlank(header) ? header : '') + '\n' +
                        'description: ' + (String.isNotBlank(description) ? description : '') + '\n\n';
                }
            }
            
            RFP_Question_And_Answer__c record = new RFP_Question_And_Answer__c();
            
            record.Rephrased_Response__c = rewrittenResponse;
            record.AI_Feedback__c = formattedFeedback; 
            record.IsAiProcessed__c = true;
            record.Id = recordId;
            
            
            return record;
            
        } catch (Exception ex) {
            System.debug(LoggingLevel.ERROR, 'Exception during processing response: ' + ex.getMessage());
            createErrorLog('Record Processing Failed', 
                           ex.getMessage(), 
                           null, 
                           response);
            return null;
        }
    }
    
}