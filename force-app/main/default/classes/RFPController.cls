/****************************************************************** ***** 
Name: RFPController 
Copyright © 2025 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
* Purpose      : 
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT     

**********************************************************************/



public with sharing class RFPController {



    @AuraEnabled(cacheable=true)
    public static Boolean hasStrategicQuestionNumber(Id rfpId) {
        if (rfpId == null) {
            return false;
        }

        // Step 1: Get the Membership Activity Id from RFP
        RFP__c rfp = [
            SELECT Membership_Activity__c 
            FROM RFP__c 
            WHERE Id = :rfpId 
            LIMIT 1
        ];

        // Step 2: Query the Strategy Memo for that Membership Activity
        try {
            Strategy_Memo__c memo = [
                SELECT Id, Strategic_Question_No__c
                FROM Strategy_Memo__c
                WHERE Membership_Activity__c = :rfp.Membership_Activity__c
                LIMIT 1
            ];

            // Step 3: Return true only if the field is not blank
            return String.isNotBlank(memo.Strategic_Question_No__c);
        } catch (QueryException e) {
            // No memo found or something went wrong
            return false;
        }
    }


    @AuraEnabled(cacheable=true)
    public static List<RFP_Question_And_Answer__c> getRfpQnARecords(String recordId, String objectName, Boolean fetchStrategicOnly) {
        List<String> strategicQuestionNumbers = new List<String>();
        Id rfpId;
        Id membershipActivityId;

        if (objectName == 'RFP__c') {
            rfpId = recordId;
            RFP__c rfp = [SELECT Id, Membership_Activity__c FROM RFP__c WHERE Id = :rfpId LIMIT 1];
            membershipActivityId = rfp.Membership_Activity__c;

        } else if (objectName == 'RFP_Question_And_Answer__c') {
            RFP_Question_And_Answer__c qna = [
                SELECT Id, RFP__c, RFP__r.Membership_Activity__c
                FROM RFP_Question_And_Answer__c
                WHERE Id = :recordId
                LIMIT 1
            ];
            rfpId = qna.RFP__c;
            membershipActivityId = qna.RFP__r.Membership_Activity__c;
        } else {
            return new List<RFP_Question_And_Answer__c>();
        }

        // Fetch strategic numbers
        List<Strategy_Memo__c> memoList = [
            SELECT Strategic_Question_No__c
            FROM Strategy_Memo__c
            WHERE Membership_Activity__c = :membershipActivityId
            LIMIT 1
        ];

        if (!memoList.isEmpty() && !String.isBlank(memoList[0].Strategic_Question_No__c)) {
            for (String qn : memoList[0].Strategic_Question_No__c.split(',')) {
                if (!String.isBlank(qn)) strategicQuestionNumbers.add(qn.trim());
            }
        }

        // Base query
        String query = 'SELECT Id, RFP_Question__c, Proposal_Gateway_Response__c, Rephrased_Response__c, Revised_Response__c, Final_Answer__c, RFP_Question_Number__c, AI_Feedback__c, IsStyled__c, IsFinalised__c,Auto_Finalised_By_AI__c, IsRevised__c, IsStrategicQuestion__c,Answer_size_limit__c, IsMerged__c, IsAiProcessed__c, Sheet_Name__c,Locked_By__r.Name, Locked_At__c, RFP__r.Membership_Activity__r.Name, RFP__r.Membership_Activity__c, LastModifiedBy.Name ' +
                    'FROM RFP_Question_And_Answer__c ' +
                    'WHERE RFP__c = :rfpId AND Tabular_Record__c = FALSE ';

        if (fetchStrategicOnly) {
            query += 'AND IsStrategicQuestion__c = TRUE ';
        } else {
            query += 'AND IsStrategicQuestion__c = FALSE ';
        }

        query += 'ORDER BY Name ASC';

        // return Database.query(query);

        List<RFP_Question_And_Answer__c> allRecords = Database.query(query);

        // Filter records with non-empty Proposal_Gateway_Response__c
        List<RFP_Question_And_Answer__c> filteredRecords = new List<RFP_Question_And_Answer__c>();
        for (RFP_Question_And_Answer__c rec : allRecords) {
            if (!String.isBlank(rec.Proposal_Gateway_Response__c)) {
                filteredRecords.add(rec);
            }
        }

        return filteredRecords;
    }


    @AuraEnabled
    public static void saveFinalAnswer(Id rfpId, String finalAnswer) {
        if (rfpId == null) {
            throw new AuraHandledException('Record ID is required');
        }

        RFP_Question_And_Answer__c rfpQnA = [SELECT Final_Answer__c FROM RFP_Question_And_Answer__c WHERE Id = :rfpId FOR UPDATE];
        rfpQnA.Final_Answer__c = finalAnswer;
        update AS USER rfpQnA;
    }

     @AuraEnabled
    public static void trackVersion(Id questionId, String answer, String actionType) {
        // Get next version number
        Integer versionNum = [SELECT COUNT() FROM RFP_Answer_Version__c 
                            WHERE RFP_Question__c = :questionId] + 1;
        
        // Create new version
        RFP_Answer_Version__c newVersion = new RFP_Answer_Version__c(
            RFP_Question__c = questionId,
            Answer__c = answer,
            Submission_Type__c = actionType,
            Version_Number__c = versionNum,
            Is_Latest__c = true
        );
        insert AS USER newVersion;
        
        // Get ID of the newest version (just created)
        Id newestVersionId = newVersion.Id;
        
        // Mark previous versions as not latest
        List<RFP_Answer_Version__c> oldVersions = [
            SELECT Id 
            FROM RFP_Answer_Version__c 
            WHERE RFP_Question__c = :questionId 
            AND Is_Latest__c = true
            AND Id != :newestVersionId
        ];
        
        for(RFP_Answer_Version__c v : oldVersions) {
            v.Is_Latest__c = false;
        }
        update AS USER oldVersions;
    }

    @AuraEnabled
    public static String rewriteLLMhit (Id rfpIdString, String User_Instructions) {
    try {
        // AI Request
        ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        promptInput.isPreview = false;

        // Map for input parameters
        Map<String, ConnectApi.WrappedValue> valueMap = new Map<String, ConnectApi.WrappedValue>();

        // Adding User Instructions
        ConnectApi.WrappedValue userInstructionsValue = new ConnectApi.WrappedValue();
        userInstructionsValue.value = User_Instructions;
        valueMap.put('Input:User_Instructions', userInstructionsValue);


        Map<String, String> rfpRecordIdMap = new Map<String, String>();
        rfpRecordIdMap.put('id', rfpIdString); // 

        // Adding AI Recommended Response (RFP ID)
        ConnectApi.WrappedValue rfpIdValue = new ConnectApi.WrappedValue();
        rfpIdValue.value = rfpRecordIdMap; // 
        valueMap.put('Input:AI_Recommended_Response', rfpIdValue);

        // Assign input parameters
        promptInput.inputParams = valueMap;
        promptInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        promptInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

        // Sending request to AI
      
        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput =
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('rewrite_Prompt_T1', promptInput);

        // Extract AI raw response
        String responseText = '';
        if (!generationsOutput.generations.isEmpty()) {
            responseText = generationsOutput.generations[0].text;
        }
       

        return responseText;

    } catch (Exception e) {
        SA_StrategyUtils.createErrorLog('Start Method Error', e.getMessage(), User_Instructions, null, rfpIdString);
        return 'Error processing request: ' + e.getMessage();
    }
    }



    @AuraEnabled
    public static String mergeLLMhit (Id rfpIdString, String User_Instructions) {
    try {
        // AI Request
        ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        promptInput.isPreview = false;

        // Map for input parameters
        Map<String, ConnectApi.WrappedValue> valueMap = new Map<String, ConnectApi.WrappedValue>();

        // Adding User Instructions
        ConnectApi.WrappedValue userInstructionsValue = new ConnectApi.WrappedValue();
        userInstructionsValue.value = User_Instructions;
        valueMap.put('Input:User_Instructions', userInstructionsValue);


        Map<String, String> rfpRecordIdMap = new Map<String, String>();
        rfpRecordIdMap.put('id', rfpIdString); // 

        // Adding AI Recommended Response (RFP ID)
        ConnectApi.WrappedValue rfpIdValue = new ConnectApi.WrappedValue();
        rfpIdValue.value = rfpRecordIdMap; // 
        valueMap.put('Input:RFP_Record', rfpIdValue);

        // Assign input parameters
        promptInput.inputParams = valueMap;
        promptInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        promptInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

        // Sending request to AI
        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput =
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('Merge_Prompt_T1', promptInput);

        // Extract AI raw response
        String responseText = '';
        if (!generationsOutput.generations.isEmpty()) {
            responseText = generationsOutput.generations[0].text;
        }

        return responseText;

    } catch (Exception e) {
        SA_StrategyUtils.createErrorLog('Start Method Error', e.getMessage(), User_Instructions, null, rfpIdString);
        return 'Error processing request: ' + e.getMessage();
    }
    }

    @AuraEnabled
    public static String styleLLMhit (Id rfpIdString) {

    try {
        // AI Request
        ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        promptInput.isPreview = false;

        // Map for input parameters
        Map<String, ConnectApi.WrappedValue> valueMap = new Map<String, ConnectApi.WrappedValue>();


        Map<String, String> rfpRecordIdMap = new Map<String, String>();
        rfpRecordIdMap.put('id', rfpIdString); // 

        // Adding AI Recommended Response (RFP ID)
        ConnectApi.WrappedValue rfpIdValue = new ConnectApi.WrappedValue();
        rfpIdValue.value = rfpRecordIdMap; // 
        valueMap.put('Input:RFP_Record', rfpIdValue);

        // Assign input parameters
        promptInput.inputParams = valueMap;
        promptInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        promptInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

        // Sending request to AI
        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput =
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('Testing_data_style', promptInput);

        // Extract AI raw response
        String responseText = '';
        if (!generationsOutput.generations.isEmpty()) {
            responseText = generationsOutput.generations[0].text;
        }

        return responseText;

    } catch (Exception e) {
       SA_StrategyUtils.createErrorLog('Start Method Error', e.getMessage(), null, null, rfpIdString);
        return 'Error processing request: ' + e.getMessage();
    }
    }

    @AuraEnabled
    public static Boolean reGenerateLLMhit (Id rfpQandAId, Id rfpId) {
         Boolean success = false;

    try {

        // 1. Get all active products
        List<Product2> allActiveProducts = [SELECT Name FROM Product2 WHERE IsActive = true];
        List<String> productNames = new List<String>();
        for (Product2 prod : allActiveProducts) {
            if (String.isNotBlank(prod.Name)) {
                productNames.add(prod.Name.trim());
            }
        }
        String blobOfAllActiveProducts = String.join(productNames,'\n');

        // 2. Query Strategy Memo record (safe handling)
        Strategy_Memo__c strategyMemo = [
            SELECT Id, Strategic_Question_No__c, People__c, Company_Name_as_per_RFP__c 
            FROM Strategy_Memo__c 
            WHERE Membership_Activity__c = :rfpId
            // AND Strategic_Question_No__c != null
            LIMIT 1
        ];

        // 3. Query all RFP Question and Answer record
        RFP_Question_And_Answer__c record = [
            SELECT Id, RFP_Question__c, Proposal_Gateway_Response__c, 
                   RFP_Question_Number__c, Tabular_Record__c, Answer_size_limit__c,RFP__r.Membership_Activity__c
            FROM RFP_Question_And_Answer__c 
            WHERE Id = :rfpQandAId
        ];


         String singleRecord = 'RecordID: ' + record.Id + '\n\n'    
                                                + 'RFP_Question: ' + record.RFP_Question__c + '\n\n'
                                                + 'Proposal_Gateway_Response: ' + record.Proposal_Gateway_Response__c + '\n\n'
                                                + 'Answer Size Limit: ' + record.Answer_size_limit__c + '\n\n'
                                                + 'Customers preferred way of referring to their people: ' + (strategyMemo != null ? strategyMemo.People__c : '') + '\n\n'
                                                + 'Company Name as per RFP: ' + (strategyMemo != null ? strategyMemo.Company_Name_as_per_RFP__c : '') + '\n\n'
                                                + 'All Available Products List ' + blobOfAllActiveProducts + '\n\n';


        // AI Request
        ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        promptInput.isPreview = false;

        // Map for input parameters
        Map<String, ConnectApi.WrappedValue> valueMap = new Map<String, ConnectApi.WrappedValue>();
            ConnectApi.WrappedValue textValue = new ConnectApi.WrappedValue();
            textValue.value = singleRecord;
            valueMap.put('Input:RFP_Q_A_Chunks', textValue);


        // Assign input parameters
        promptInput.inputParams = valueMap;
        promptInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        promptInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

        // Sending request to AI
        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput =
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('RFP_Component_2', promptInput);

        // Extract AI raw response
        String rawApiResponse;
        String modifiedResponse;
        
        if (generationsOutput != null && !generationsOutput.generations.isEmpty()) {
                    rawApiResponse = generationsOutput.generations[0].text;
                    modifiedResponse = SA_StrategyUtils.cleanJsonResponse(singleRecord, rawApiResponse, rfpId);

                    if (String.isNotEmpty(modifiedResponse)) {
                        success = processAndInsertRecord(modifiedResponse);
                    } else {
                        // createErrorLog('Empty Modified Response', 
                        //             'Modified response after cleanup was empty', 
                        //             singleRecord,  // This is the input that matters
                        //             rawApiResponse);
                    }
                } else {
                    // createErrorLog('Empty LLM Response', 
                    //             'LLM returned null or empty generations', 
                    //             singleRecord,  // This is the input that matters
                    //             null);
                }

        // return success;

    } catch (Exception e) {
       
        // return 'Error processing request: ' + e.getMessage();
    }
     return success;
    }
    
 @TestVisible   private static Boolean processAndInsertRecord(String response) {
        try {
            Map<String, Object> parsedResponse = (Map<String, Object>) JSON.deserializeUntyped(response);
            if (!parsedResponse.containsKey('recordId')) {
                // createErrorLog('Missing Record ID', 
                //                'Response JSON did not contain a recordId field', 
                //                null, 
                //                response);
                return false;
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
            
            RFP_Question_And_Answer__c record = [
                SELECT Id, Rephrased_Response__c, AI_Feedback__c,IsAiProcessed__c
                FROM RFP_Question_And_Answer__c 
                WHERE Id = :recordId
                LIMIT 1
            ];
            
            record.Rephrased_Response__c = rewrittenResponse;
            record.AI_Feedback__c = formattedFeedback; 
            record.IsAiProcessed__c = true;
            
            update AS USER record;
            return true;
            
        } catch (Exception ex) {
            return false;
        }
    } 



    @AuraEnabled(cacheable=false)
    public static Map<String, Object> checkAndLockQuestion(Id questionId) {
        User currentUser = [SELECT Id, Name FROM User WHERE Id = :UserInfo.getUserId()];
        RFP_Question_And_Answer__c q = [
            SELECT Id, Is_Locked__c, Locked_By__c, Locked_At__c, Locked_By__r.Name 
            FROM RFP_Question_And_Answer__c 
            WHERE Id = :questionId 
            FOR UPDATE
        ];

        Map<String, Object> response = new Map<String, Object>();
        
        Boolean lockExpired = q.Locked_At__c != null && q.Locked_At__c.addMinutes(2) < System.now();

        if (q.Is_Locked__c && q.Locked_By__c != currentUser.Id && !lockExpired) {
            response.put('isLockedByOther', true);
            response.put('lockedByName', q.Locked_By__r.Name);
        } else {
            q.Is_Locked__c = true;
            q.Locked_By__c = currentUser.Id;
            q.Locked_At__c = System.now();
            update AS USER q;
            response.put('isLockedByOther', false);
        }
        return response;
    }

    @AuraEnabled
    public static void unlockQuestion(Id questionId) {
        RFP_Question_And_Answer__c q = [
            SELECT Id, Is_Locked__c, Locked_By__c 
            FROM RFP_Question_And_Answer__c 
            WHERE Id = :questionId
        ];
        if (q.Locked_By__c == UserInfo.getUserId()) {
            q.Is_Locked__c = false;
            q.Locked_By__c = null;
            q.Locked_At__c = null;
            update AS USER q;
        }
    }


    @AuraEnabled
public static Map<String, Object> checkAndLockRFP(Id rfpId) {
    RFP__c rfp = [SELECT Is_Locked__c, Locked_By__c, Locked_At__c FROM RFP__c WHERE Id = :rfpId FOR UPDATE];

    User currentUser = [SELECT Id, Name FROM User WHERE Id = :UserInfo.getUserId()];
    Map<String, Object> result = new Map<String, Object>();


      Boolean lockExpired = rfp.Locked_At__c != null && rfp.Locked_At__c.addMinutes(2) < System.now();


    if (rfp.Is_Locked__c && rfp.Locked_By__c != UserInfo.getUserId() && !lockExpired) {
        result.put('isLockedByOther', true);
        result.put('lockedByName', [SELECT Name FROM User WHERE Id = :rfp.Locked_By__c].Name);
    } else {
        rfp.Is_Locked__c = true;
        rfp.Locked_By__c = currentUser.Id;
        rfp.Locked_At__c = System.now();
        update AS USER rfp;
        result.put('isLockedByOther', false);
    }

    return result;
}



@AuraEnabled
public static void unlockRFP(Id rfpId) {
    RFP__c rfp = [SELECT Is_Locked__c, Locked_By__c FROM RFP__c WHERE Id = :rfpId FOR UPDATE];
    if (rfp.Locked_By__c == UserInfo.getUserId()) {
        rfp.Is_Locked__c = false;
        rfp.Locked_By__c = null;
        rfp.Locked_At__c = null;
        update AS USER rfp;
    }
}

                                                                        // Review Strategic Questions

    @AuraEnabled
    public static String handleStrategicAIResponse(Id rfpId) {
        RFP__c rfp = [SELECT Id, Name, File_Type__c,IsBatchRunningForStrategicAiResponses__c, IsStrategicReviewCompleted__c, Membership_Activity__c FROM RFP__c WHERE Id = :rfpId LIMIT 1];
        
        if (rfp.IsBatchRunningForStrategicAiResponses__c) {
            return 'AlreadyRunning';
        }

        rfp.IsBatchRunningForStrategicAiResponses__c = true;

        RFP__c rfptoupdate = new RFP__c (Id=rfp.Id, IsBatchRunningForStrategicAiResponses__c= rfp.IsBatchRunningForStrategicAiResponses__c);
        update AS USER rfptoupdate;
		// update rfp;

        RFPTriggerHelper.processRfpChunk(new List<RFP__c>{rfp},RFPTriggerHelper.RFPFlowMode.StandardOnly, null);       
        return 'Started';
    } 


    @AuraEnabled
    public static void reprocessStrategy(Id rfpId, String reason) {
        RFP__c rfp = [SELECT Id, Name,File_Type__c,IsStrategicReviewCompleted__c,IsBatchRunningForStrategicAiResponses__c,Membership_Activity__c FROM RFP__c WHERE Id = :rfpId LIMIT 1];
       
        RFPTriggerHelper.processRfpChunk(new List<RFP__c>{rfp},RFPTriggerHelper.RFPFlowMode.StrategicOnly, reason); 
    }


    @AuraEnabled(cacheable=true)
    public static String getStrategicFeedback(Id rfpId) {
     Strategic_Questions_Feedback__c sqf = [SELECT Id, AI_Feedback__c FROM Strategic_Questions_Feedback__c WHERE RFP__c = :rfpId ORDER BY CreatedDate DESC LIMIT 1];
     String rawJson = sqf.AI_Feedback__c;
        if (String.isNotBlank(sqf.AI_Feedback__c)) {
            try {
                // Parse and re-serialize to ensure it’s clean JSON
                String cleanedJson = rawJson.replace('\u00A0', ' ').trim();
                Object parsed = JSON.deserializeUntyped(cleanedJson);
                return JSON.serialize(parsed);
            } catch (Exception e) {
                // Return fallback error structure
                return JSON.serialize(new Map<String, Object>{
                    'data' => new List<Object>(),
                    'Summary' => '⚠️ Error: Invalid JSON format in Strategic_Questions_Feedback__c'
                });
            }
        } else {
            // Return empty structure instead of null/undefined
            return JSON.serialize(new Map<String, Object>{
                'data' => new List<Object>(),
                'Summary' => 'No feedback data available.'
            });
        }
    }

   public static Set<String> STOP_WORDS = new Set<String>{
        'the', 'of', 'and', 'a', 'an', 'in', 'to', 'for', 'on', 'with', 'by', 'at', 'from', 'as', 'is', 'are', 'be'
    };

    @AuraEnabled(cacheable=false)
    public static List<String> getUnmatchedSuggestedProducts(List<String> suggestedProducts, Id opportunityId) {
        List<String> linkedProducts = new List<String>();
        for(OpportunityLineItem oli : [
            SELECT Product2.Name FROM OpportunityLineItem WHERE OpportunityId = :opportunityId
        ]) {
            linkedProducts.add(oli.Product2.Name);
        }

        List<Set<String>> processedLinked = new List<Set<String>>();
        for (String lp : linkedProducts) {
            processedLinked.add(cleanAndSplit(lp));
        }

        List<String> unmatchedProducts = new List<String>();
        for (String suggested : suggestedProducts) {
            Set<String> suggestedWords = cleanAndSplit(suggested);
            Boolean isMatched = false;

            for (Set<String> linkedWords : processedLinked) {
                Integer matchCount = 0;
                for (String word : suggestedWords) {
                    for (String linkedWord : linkedWords) {
                        if (word.contains(linkedWord) || linkedWord.contains(word)) {
                            matchCount++;
                            break;
                        }
                    }
                }
                if (matchCount >= Math.max(1, Math.floor((Decimal)suggestedWords.size() * 0.5))) {
                    isMatched = true;
                    break;
                }
            }

            if (!isMatched) {
                unmatchedProducts.add(suggested);
            }
        }

        return unmatchedProducts;
    }

    private static Set<String> cleanAndSplit(String input) {
        Set<String> words = new Set<String>();
        if (String.isBlank(input)) return words;

        String cleaned = input.replaceAll('[^a-zA-Z0-9\\s]', '').toLowerCase();
        for (String word : cleaned.split('\\s+')) {
            if (!STOP_WORDS.contains(word) && word.length() > 1) {
                words.add(word);
            }
        }
        return words;
    }


    @AuraEnabled(cacheable=true)
    public static Map<String, List<OpportunityLineItem>> getCategorizedProducts(Id opportunityId) {
        List<OpportunityLineItem> allItems = [
            SELECT Id, Product2.Product_Line__c, Product2.Name, Estimated_Additional_New_Members__c,
                Members_Quoted_in_the_Proposal__c, Sold_Retained_Members__c
            FROM OpportunityLineItem
            WHERE OpportunityId = :opportunityId
        
        ];

        Map<String, List<OpportunityLineItem>> groupedMap = new Map<String, List<OpportunityLineItem>>();
        for (OpportunityLineItem oli : allItems) {
            String line = oli.Product2.Product_Line__c;
            if (!groupedMap.containsKey(line)) {
                groupedMap.put(line, new List<OpportunityLineItem>());
            }
            groupedMap.get(line).add(oli);
        }

        return groupedMap;
    }

    @AuraEnabled(cacheable=true)
    public static String getStrategicQuestionNumbers(Id strategyMemoId) {
        Strategy_Memo__c memo = [
            SELECT Strategic_Question_No__c	 
            FROM Strategy_Memo__c 
            WHERE Id = :strategyMemoId
            LIMIT 1
        ];
        return memo.Strategic_Question_No__c;
    }

}