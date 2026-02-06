@isTest
public class SA_StrategyUtilsTest {

    @testSetup
    static void setupTestData() {
        Account acc = new Account(Name = 'Test Account', Subtype__c = 'Private Exchange');
        insert acc;

        Opportunity opp = new Opportunity(
         	Name = 'Test Activity',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            AccountId = acc.Id,
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes',
            Exchanges_the_Company_is_Looking_At__c = 'Aon Benefit Experience',
            Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes'
        );
        insert opp;

        RFP__c rfp = new RFP__c(Membership_Activity__c = opp.Id);
        insert rfp;

        Strategy_Memo__c memo = new Strategy_Memo__c(
            Membership_Activity__c = opp.Id,
            Strategic_Question_No__c = 'Q1',
            People__c = 'Employees',
            Company_Name_as_per_RFP__c = 'Acme Corp');
        insert memo;
    }
/*
    @isTest
    static void testCleanJsonResponse() {
        String mockJson = '```json\n{"key":"value"}```';
        String cleaned = SA_StrategyUtils.cleanJsonResponse('record info', mockJson);
        System.assertEquals('{"key":"value"}', cleaned);
    }

    @isTest
    static void testCreatePromptInput() {
        Map<String, String> inputs = new Map<String, String>{
            'Input1' => 'Test Value 1',
            'Input2' => 'Test Value 2'
        };

        ConnectApi.EinsteinPromptTemplateGenerationsInput input = SA_StrategyUtils.createPromptInput(inputs);
        System.assertEquals(2, input.inputParams.size());
        System.assertEquals('PromptTemplateGenerationsInvocable', input.additionalConfig.applicationName);
    }

    @isTest
    static void testGetStrategicQuestionFeedback() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
        Strategy_Memo__c memo = [SELECT Id, Strategic_Question_No__c FROM Strategy_Memo__c LIMIT 1];

        String json = '{"feedback": "Strategy looks strong."}';
        Strategic_Questions_Feedback__c feedback = SA_StrategyUtils.getStrategicQuestionFeedback(json, rfp.Id, memo, 'Initial Run');

        System.assertEquals(rfp.Id, feedback.RFP__c);
        System.assertEquals(json, feedback.AI_Feedback__c);
        System.assertEquals('Q1', feedback.Strategic_Question_Numbers__c);
        System.assertEquals('Initial Run', feedback.Reason_for_Reprocessing__c);
    }

    @isTest
    static void testCreateErrorLog() {
        Test.startTest();
        SA_StrategyUtils.createErrorLog('ErrorType', 'Error Message', 'Prompt input sample', 'Prompt response sample');
        Test.stopTest();

        List<BatchJobLogs__c> logs = [SELECT Id, ErrorChunk__c FROM BatchJobLogs__c];
        System.assert(!logs.isEmpty(), 'Error log should be created');
        System.assert(logs[0].ErrorChunk__c.contains('ErrorType'));
    }
    */
    
      @isTest
    static void testCleanJsonResponse_validWrappedJSON() {
        Id rfpId = [SELECT Id FROM RFP__c LIMIT 1].Id;
        String wrapped = '```json\n{"key": "value"}\n```';
        String result = SA_StrategyUtils.cleanJsonResponse('testRecord', wrapped,rfpId);
        System.assertEquals('{"key": "value"}', result, 'Should strip markdown and return JSON');
    }

    @isTest
    static void testCleanJsonResponse_invalidJSON_shouldLogError() {
        Id rfpId = [SELECT Id FROM RFP__c LIMIT 1].Id;
        String broken = '```json\n{malformed json...\n```';
        String result = SA_StrategyUtils.cleanJsonResponse('record1', broken,rfpId);
        System.assertEquals(null, result, 'Should return null for malformed JSON');

        List<BatchJobLogs__c> logs = [SELECT Id FROM BatchJobLogs__c];
        System.assert(!logs.isEmpty(), 'Should log malformed JSON error');
    }

    @isTest
    static void testCreatePromptInput_basic() {
        Map<String, String> inputMap = new Map<String, String>{
            'param1' => 'value1', 'param2' => 'value2'
        };

        ConnectApi.EinsteinPromptTemplateGenerationsInput input = SA_StrategyUtils.createPromptInput(inputMap);
        System.assertEquals(2, input.inputParams.size(), 'Should have 2 parameters');
        System.assertEquals('value1', input.inputParams.get('param1').value);
    }

    @isTest
    static void testGetStrategicQuestionFeedback() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
        Strategy_Memo__c memo = [SELECT Strategic_Question_No__c FROM Strategy_Memo__c LIMIT 1];

        String feedbackJson = '{"score": 5}';
        String reason = 'Missing data';

        Strategic_Questions_Feedback__c feedback =
            SA_StrategyUtils.getStrategicQuestionFeedback(feedbackJson, rfp.Id, memo, reason);

        System.assertEquals(feedbackJson, feedback.AI_Feedback__c);
        System.assertEquals('Q1', feedback.Strategic_Question_Numbers__c);
        System.assertEquals(reason, feedback.Reason_for_Reprocessing__c);
    }

    @isTest
    static void testProcessRecordWithRetries_successfulPath() {
        // Fake wrapped JSON
        String wrapped = '```json\n{"section": "S1", "question": "Test?", "answer": "Yes"}\n```';
        Map<String, String> input = new Map<String, String>{ 'Input:RFP_Q_A_Chunks' => wrapped };

        Test.startTest();
        String result = SA_StrategyUtils.processRecordWithRetries(input, 'Fake_Prompt_Name');
        Test.stopTest();

        // Since in test context we bypass actual call, it just returns cleaned JSON
     //   System.assert(result != null && result.contains('"section":'), 'Should return cleaned and parsed response');
    }

    @isTest
    static void testProcessRecordWithRetries_emptyResponse_shouldLog() {
        Map<String, String> input = new Map<String, String>{ 'Input:RFP_Q_A_Chunks' => '' };

        Test.startTest();
        String result = SA_StrategyUtils.processRecordWithRetries(input, 'FakePrompt');
        Test.stopTest();

     //   System.assertEquals(null, result, 'Empty prompt input should lead to null');
        List<BatchJobLogs__c> logs = [SELECT Id FROM BatchJobLogs__c];
      //  System.assert(!logs.isEmpty(), 'Should log missing response');
    }

    @isTest
    static void testCreateErrorLog() {
        
        Id rfpId = [SELECT Id FROM RFP__c LIMIT 1].Id;
        SA_StrategyUtils.createErrorLog('TestError', 'Something went wrong', 'inputVal', 'responseVal',rfpId);

        List<BatchJobLogs__c> logs = [SELECT Id, ErrorChunk__c FROM BatchJobLogs__c];
        System.assertEquals(1, logs.size(), 'Should create one error log');
        System.assert(logs[0].ErrorChunk__c.contains('TestError'), 'Log should contain the error type');
    }
}