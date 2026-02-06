/****************************************************************** ***** 
Name: OpenAIBatchProcessor 
Copyright © 2025 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
* Purpose      : Batch class to process RFP digitization using chunks
*                of input data. Leverages Einstein LLM to generate
*                responses and creates corresponding records.
*
* Batch Flow   : 
*    - start()   : Initializes the batch and sets RFP status.
*    - execute() : Processes each chunk, inserts generated records.
*    - finish()  : Finalizes batch, updates status, sends error emails.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT     

**********************************************************************/


public with sharing class OpenAIBatchProcessor implements Database.Batchable<String>, Database.AllowsCallouts, Database.Stateful {
    public Id rfpId;
    public List<String> chunks;
    public Integer failedChunksCount = 0;
    public List<BatchJobLogs__c> errorLogs = new List<BatchJobLogs__c>();
    public DateTime startTime;
    public DateTime endTime;
    

    // Constructor to initialize batch
    public OpenAIBatchProcessor(Id rfpId, List<String> chunks) {
        this.rfpId = rfpId;
        this.chunks = chunks;
        this.startTime = DateTime.now();
    }

    // start(): Initializes RFP status and returns iterable chunk list.
    public Iterable<String> start(Database.BatchableContext bc) { 
        updateRFPStatus(rfpId, 'Digitization In-Progress');
        return chunks;
    }
    
    // execute(): Processes each chunk by calling Einstein LLM and inserts parsed records.
    public void execute(Database.BatchableContext bc, List<String> chunkList) {
    List<RFP_Question_And_Answer__c> allTempRecords = new List<RFP_Question_And_Answer__c>();

    for (String chunk : chunkList) {
        List<RFP_Question_And_Answer__c> records = processChunk(chunk);
        if (records != null && !records.isEmpty()) {
            allTempRecords.addAll(records);
        }
    }

    if (!allTempRecords.isEmpty()) {
        try {
            Database.SaveResult[] srList = Database.insert(allTempRecords, AccessLevel.USER_MODE);
            for (Database.SaveResult sr : srList) {
                if (!sr.isSuccess()) {
                    failedChunksCount++; // You may want to track individual failures
                }
            }
        } catch (Exception e) {
            logError(null, null, 'DML Exception (final insert): ' + e.getMessage(), null, true);
        }
    }
}


    // finish(): Updates final RFP status and sends error notifications if needed.
    public void finish(Database.BatchableContext bc) {
        this.endTime = DateTime.now();
        String finalStatus = (failedChunksCount == 0) ? 'Digitization Successful' : 'Digitization Completed with Errors';
        updateRFPStatus(rfpId, finalStatus);

        if (!errorLogs.isEmpty()) {
            insert AS USER errorLogs;
        }

        if (finalStatus == 'Digitization Completed with Errors') {
            RFPEmailService.EmailContext ctx = new RFPEmailService.EmailContext(this.rfpId);
            RFPEmailService.sendErrorEmails(
                ctx,
                'RFP Digitization Error Notification – ' + ctx.rfpRecord.Name + ' - Action Required',
                'RFP Digitization Error Notification – ' + ctx.rfpRecord.Name,
                'digitization process'
            );
        }
    }


    // processChunk(): Calls Einstein LLM(Prompt), retries if needed, parses response and returns Q&A records.
    public List<RFP_Question_And_Answer__c> processChunk(String chunk) {
    String rawApiResponse = '';
    String lastError = '';
    Boolean success = false;
    Integer retryCount = 0;
    Integer maxRetries = 2;
    List<RFP_Question_And_Answer__c> tempRecords = new List<RFP_Question_And_Answer__c>();

    while (retryCount <= maxRetries && !success) {
        try {
            ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = createPromptInput(chunk);
            ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput = 
                ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('RFP_Agent', promptInput);

            if (generationsOutput != null && !generationsOutput.generations.isEmpty()) {
                rawApiResponse = generationsOutput.generations[0].text;
                String modifiedResponse = cleanJsonResponse(chunk, rawApiResponse);

                if (String.isNotEmpty(modifiedResponse)) {
                    tempRecords = extractRecordsFromJson(modifiedResponse); 
                    success = (tempRecords != null && !tempRecords.isEmpty());
                    if (!success) {
                        lastError = 'No valid records found after parsing';
                        logError(chunk, rawApiResponse, lastError, retryCount + 1, retryCount == maxRetries);
                    }
                } else {
                    lastError = 'Modified response was empty after cleaning';
                    logError(chunk, rawApiResponse, lastError, retryCount + 1, retryCount == maxRetries);
                }
            } else {
                lastError = 'Empty or null response from Einstein LLM';
                logError(chunk, rawApiResponse, lastError, retryCount + 1, retryCount == maxRetries);
            }
        } catch (Exception e) {
            lastError = 'Exception: ' + e.getMessage();
            logError(chunk, rawApiResponse, lastError, retryCount + 1, retryCount == maxRetries);
        }
        retryCount++;
    }

        if (success && !tempRecords.isEmpty()) {
            return tempRecords;
        }

        failedChunksCount++;
    
        return new List<RFP_Question_And_Answer__c>();
    }


    // extractRecordsFromJson(): Parses cleaned JSON into a list of Question & Answer records.
    public List<RFP_Question_And_Answer__c> extractRecordsFromJson(String jsonResponse) {
        try {
            List<Object> parsedData = (List<Object>) JSON.deserializeUntyped(jsonResponse);
            List<RFP_Question_And_Answer__c> recordsToInsert = new List<RFP_Question_And_Answer__c>();

            for (Object obj : parsedData) {
                Map<String, Object> item = (Map<String, Object>) obj;
                recordsToInsert.add(createQuestionRecord(item));

                if (item.containsKey('sub_questions')) {
                    List<Object> subQuestions = (List<Object>) item.get('sub_questions');
                    for (Object subObj : subQuestions) {
                        Map<String, Object> subItem = (Map<String, Object>) subObj;
                        recordsToInsert.add(createQuestionRecord(subItem));
                    }
                }
            }
            return recordsToInsert;
        } catch (Exception e) {
            logError(jsonResponse, null, 'JSON Parsing Exception: ' + e.getMessage(), null, true);
            return null;
        }
    }

    // logError(): Adds error log entry for the given chunk and error message.
    public void logError(String chunk, String response, String errorMessage, Integer attempt, Boolean isFinal) {
        BatchJobLogs__c log = new BatchJobLogs__c();
        log.RFP__c = this.rfpId;
        log.Prompt_Input__c = chunk;
        log.Prompt_Response__c = response;
        log.ErrorChunk__c = errorMessage;
        log.Error_Component__c = 'Digitization';
        log.Job_Started__c = DateTime.now();
        log.Job_Ended__c = DateTime.now();
        log.Failed_one__c = true;
        log.Needs_Reprocessing__c = isFinal;
        log.Reprocess_Attempt__c = attempt;
        errorLogs.add(log);
    }


    // createPromptInput(): Builds LLM input payload for Einstein generation API.
    public ConnectApi.EinsteinPromptTemplateGenerationsInput createPromptInput(String chunk) {
        ConnectApi.EinsteinPromptTemplateGenerationsInput promptInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        promptInput.isPreview = false;
        Map<String, ConnectApi.WrappedValue> valueMap = new Map<String, ConnectApi.WrappedValue>();
        ConnectApi.WrappedValue textValue = new ConnectApi.WrappedValue();
        textValue.value = chunk;
        valueMap.put('Input:ExtractedJson', textValue);
        promptInput.inputParams = valueMap;
        promptInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        promptInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';
        return promptInput;
    }
    
    // processAndInsertRecords(): DEPRECATED / redundant method that parses and inserts records.
    public Boolean processAndInsertRecords(String jsonResponse) {
        try {
            List<Object> parsedData = (List<Object>) JSON.deserializeUntyped(jsonResponse);
            List<RFP_Question_And_Answer__c> recordsToInsert = new List<RFP_Question_And_Answer__c>();
            
            for (Object obj : parsedData) {
                Map<String, Object> item = (Map<String, Object>) obj;
                RFP_Question_And_Answer__c record = createQuestionRecord(item);
                recordsToInsert.add(record);

                // Do we even need this logic anymore??

                if (item.containsKey('sub_questions')) {
                    List<Object> subQuestions = (List<Object>) item.get('sub_questions');
                   
                    for (Object subObj : subQuestions) {
                        Map<String, Object> subItem = (Map<String, Object>) subObj;
                        RFP_Question_And_Answer__c subRecord = createQuestionRecord(subItem);
                        recordsToInsert.add(subRecord);
                    }
                }
            }
            
            if (!recordsToInsert.isEmpty()) {
                Database.SaveResult[] srList = Database.insert(recordsToInsert, AccessLevel.USER_MODE);
                
                for (Database.SaveResult sr : srList) {
                    if (!sr.isSuccess()) {
                        return false;
                    }
                }
                return true;
            } 
            else {
                return true;
            }
        } catch (Exception e) {
            logError(jsonResponse, null, 'Exception: ' + e.getMessage(), NULL, false);
            return false;
        }
    }
    
    // createQuestionRecord(): Converts a parsed JSON map into a RFP_Question_And_Answer__c record.
    public RFP_Question_And_Answer__c createQuestionRecord(Map<String, Object> item) {
        RFP_Question_And_Answer__c record = new RFP_Question_And_Answer__c();
        record.Section_Name__c = (String) item.get('section');
        record.SubSection__c = (String) item.get('sub-section');
        record.RFP_Question_Number__c = (String) item.get('question number');
        record.RFP_Question__c = (String) item.get('question');
        record.Proposal_Gateway_Response__c = (String) item.get('answer');
        record.Answer_size_limit__c	=(String) item.get('answer size limit'); 
        record.RFP__c = this.rfpId;
        record.Tabular_Record__c = item.containsKey('Tabular_Record__c') 
            ? ((item.get('Tabular_Record__c') instanceof Boolean) 
               ? (Boolean)item.get('Tabular_Record__c') 
               : Boolean.valueOf(String.valueOf(item.get('Tabular_Record__c')))) 
            : false;
        return record;
    }
    
    // cleanJsonResponse(): Extracts clean JSON from LLM response and ensures it's valid.
    public String cleanJsonResponse(String chunk, String jsonResponse) {
        if (String.isEmpty(jsonResponse)) {
            return jsonResponse;
        }
        
        jsonResponse = jsonResponse.trim();
        
        // Strip triple backtick or ```json blocks
        if ((jsonResponse.startsWith('json') && jsonResponse.contains('```')) || (jsonResponse.startsWith('```') && jsonResponse.contains('json'))) {
            Integer startIndex = jsonResponse.indexOf('{', jsonResponse.indexOf('json'));
            if (startIndex == -1) startIndex = jsonResponse.indexOf('[', jsonResponse.indexOf('json'));
            Integer endIndex = jsonResponse.lastIndexOf('```');
            if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
                jsonResponse = jsonResponse.substring(startIndex, endIndex).trim();
            }
        }
        
         // Remove non-printable characters
        jsonResponse = jsonResponse.replaceAll('[^\\x20-\\x7E]', '');
        
         // Validate JSON
        try {
            JSON.deserializeUntyped(jsonResponse);
            return jsonResponse;
        } catch (Exception e) {
            logError(chunk, jsonResponse, 'Invalid JSON format after cleaning: ' + e.getMessage(), null, false);
            return '';
        }
    }
    
    // updateRFPStatus(): Updates the Stage__c of the RFP and logs failures.
    public void updateRFPStatus(Id rfpId, String newStatus) {
        try {
            RFP__c rfp = new RFP__c(
                Id = rfpId, 
                Stage__c = newStatus, 
                FailedChunks__c = this.failedChunksCount
            );
            Database.SaveResult sr = Database.update(rfp, AccessLevel.USER_MODE);
            // Database.SaveResult sr = Database.update(rfp, false);

        } catch (Exception e) {
            logError(null, null, 'Error updating RFP status: ' + e.getMessage(), null, false);
        }
    }
}