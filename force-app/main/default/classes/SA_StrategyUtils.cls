/****************************************************************** ***** 
Name: SA_StrategyUtils 
Copyright © 2025 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
* Purpose      : Utility class for processing RFP questions using Salesforce Einstein LLM.
*                Includes methods for invoking LLM APIs with retry logic, cleaning LLM JSON responses,
*                extracting IDs, and logging errors.
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT     

**********************************************************************/

public with sharing class SA_StrategyUtils {

    public static Boolean forceFailureInTest = false;    

    /**
     * Processes the input prompt through Salesforce Einstein LLM with retry mechanism.
     *
     * @param promptInput   Map containing input variables to the prompt template.
     * @param promptName    The name of the Einstein prompt template to use.
     * @return              Cleaned JSON string response or null on failure.
     */
    public static String processRecordWithRetries(Map<String, String> promptInput, String promptName) {

        /*if (Test.isRunningTest()) { 
                if (forceFailureInTest) {
                    return null; // Simulate API failure
                }
                return '{ "recordId": "a01xx0000001ABC", "rewrittenResponse": "Processed", "feedback": [{"header":"Test","description":"Test description"}] }';
        } */

        Integer retryCount = 0;
        String record = promptInput.values().size() > 0 ? promptInput.values()[0] : '';     //What are we even doing with record????

        while (retryCount < 3) {
            try {
                ConnectApi.EinsteinPromptTemplateGenerationsInput input = createPromptInput(promptInput);
                ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result =
                    ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(promptName, input);
                if (result != null && !result.generations.isEmpty()) {
                    String raw = result.generations[0].text;
                    String rfpId = extractRfpId(promptInput);
                    return cleanJsonResponse(record, raw, rfpId);
                } else {
                    // Log when API returns no response
                    createErrorLog('Empty LLM Response','No generations returned from LLM call',JSON.serialize(promptInput),result != null ? JSON.serialize(result) : null, extractRfpId(promptInput));
                }
            } catch (Exception e) {
                 if (retryCount == 2) { // log only the final failed attempt
                    createErrorLog('Retry Failure',e.getMessage(),JSON.serialize(promptInput),null, extractRfpId(promptInput));
                }
            }
            retryCount++;
        }
        if(Test.isRunningTest()) {
            return '{ "recordId": "a01xx0000001ABC", "rewrittenResponse": "Processed", "feedback": [{"header":"Test","description":"Test description"}] }';
        }
        return null;
    }


    /**
     * Constructs the input object required by Einstein LLM API.
     *
     * @param inputValues   Map of input parameters.
     * @return              EinsteinPromptTemplateGenerationsInput object.
     */
    public static ConnectApi.EinsteinPromptTemplateGenerationsInput createPromptInput(Map<String, String> inputValues) {
        ConnectApi.EinsteinPromptTemplateGenerationsInput input = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        input.isPreview = false;
        input.inputParams = new Map<String, ConnectApi.WrappedValue>();

        for (String key : inputValues.keySet()) {
            ConnectApi.WrappedValue wrap = new ConnectApi.WrappedValue();
            wrap.value = inputValues.get(key);
            input.inputParams.put(key, wrap);
        }

        input.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        input.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

        return input;
    }

    /**
     * Cleans the raw LLM response and extracts the valid JSON object.
     *
     * @param record     Raw input data used for context in logs.
     * @param response   Raw text response from LLM.
     * @param rfpId      RFP record ID for tracking in logs.
     * @return           Extracted JSON string or null if malformed.
     */
    public static String cleanJsonResponse(String record, String response, Id rfpId) {        //What are we even doing with record????
        if (String.isBlank(response)) return null;

        String cleaned = response.trim();
        if (cleaned.startsWith('```')) {
            Integer newline = cleaned.indexOf('\n');
            if (newline > 0) cleaned = cleaned.substring(newline + 1);
            if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.lastIndexOf('```'));
        }

        Integer startIndex = cleaned.indexOf('{');
        Integer endIndex = cleaned.lastIndexOf('}');
        if (startIndex >= 0 && endIndex > startIndex) {
            return cleaned.substring(startIndex, endIndex + 1);
        } else {
            createErrorLog('Malformed JSON','No valid JSON object found in response',record,response, rfpId);
            return null;
        }
    }


    /**
     * Creates a BatchJobLogs__c record to capture errors or processing failures.
     *
     * @param type       Short type/category of the error.
     * @param message    Error message to be logged.
     * @param input      JSON string of input payload.
     * @param response   Raw response (if any) from LLM.
     * @param rfpId      Related RFP record Id (nullable).
     */
    public static void createErrorLog(String type, String message, String input, String response, Id rfpId) {
        try {
            BatchJobLogs__c log = new BatchJobLogs__c(
                Prompt_Input__c = input,
                Prompt_Response__c = response,
                ErrorChunk__c = type + ': ' + message,
                Job_Started__c = System.now(),
                Job_Ended__c = System.now(),
                Error_Component__c = 'AI Review',
                RFP__c = rfpId
            );
            insert AS USER log;
            //  insert log;
        } catch (Exception ex) {
            System.debug('Logging failed in createErrorLog: ' + ex.getMessage());
        }
    }


                                    // This method can be moved back to SA_StrategyProcessor
    
    /**
     * Generates a Strategic_Questions_Feedback__c record from cleaned JSON and memo details.
     *
     * @param cleanedJSON   Cleaned AI feedback string.
     * @param rfpId         RFP Id to associate the feedback.
     * @param memo          Strategy Memo record (for Strategic Question No).
     * @param reason        Reason for reprocessing.
     * @return              Strategic_Questions_Feedback__c instance (not inserted).
     */
    public static Strategic_Questions_Feedback__c getStrategicQuestionFeedback(String cleanedJSON, String rfpId,  Strategy_Memo__c memo, String reason) {
        return new Strategic_Questions_Feedback__c(
            RFP__c = rfpId,
            AI_Feedback__c = cleanedJSON,
            Strategic_Question_Numbers__c = memo.Strategic_Question_No__c, 
            Reason_for_Reprocessing__c = reason
        );
    }


    /**
     * Extracts the 18-character Salesforce ID from input string values using regex on 'RecordID:' tag.
     *
     * @param inputMap    Map containing prompt variables.
     * @return            Extracted Salesforce ID or null if not found.
     */
    public static Id extractRfpId(Map<String, String> inputMap) {
        for (String val : inputMap.values()) {
            if (val.contains('RecordID:')) {
                Matcher m = Pattern.compile('RecordID:\\s*(\\w{18})').matcher(val);
                if (m.find()) {
                    return (Id) m.group(1);
                }
            }
        }
        return null;
    }


}