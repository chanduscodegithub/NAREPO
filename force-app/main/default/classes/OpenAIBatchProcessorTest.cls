@isTest
private class OpenAIBatchProcessorTest {
    
        @testSetup
    static void setupTestData() {
        Account acc = new Account(Name = 'Test Account', Subtype__c = 'Private Exchange');
        insert acc;

        Opportunity membershipActivity = new Opportunity(
            Name = 'Test Activity',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            AccountId = acc.Id,
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes',
            Exchanges_the_Company_is_Looking_At__c = 'Aon Benefit Experience',
            Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes');
        insert membershipActivity;

        RFP__c rfp = new RFP__c(Membership_Activity__c = membershipActivity.Id, IsBatchRunningForStrategicAiResponses__c = false);
        insert rfp;

        RFP_Question_And_Answer__c qna = new RFP_Question_And_Answer__c(
            RFP__c = rfp.Id,
            RFP_Question__c = 'What is your approach?',
            Proposal_Gateway_Response__c = 'Initial Response',
            RFP_Question_Number__c = 'Q1',
            Answer_size_limit__c = '100',
            Tabular_Record__c = false);
        insert qna;

        Strategy_Memo__c memo = new Strategy_Memo__c(
            Membership_Activity__c = membershipActivity.Id,
            Strategic_Question_No__c = 'Q1',
            People__c = 'Employees',
            Company_Name_as_per_RFP__c = 'Acme Inc.');
        insert memo;

        Id stdPbId = Test.getStandardPricebookId();
        Product2 p = new Product2(Name = 'Medical Coverage', IsActive = true);
        insert p;

        PricebookEntry stdPbe = new PricebookEntry(
            Product2Id = p.Id,
            Pricebook2Id = stdPbId,
            UnitPrice = 100,
            IsActive = true);
        insert stdPbe;

        Pricebook2 customPb = new Pricebook2(Name = 'Custom Book', IsActive = true);
        insert customPb;

        membershipActivity.Pricebook2Id = customPb.Id;
        update membershipActivity;

        PricebookEntry customPbe = new PricebookEntry(
            Product2Id = p.Id,
            Pricebook2Id = customPb.Id,
            UnitPrice = 100,
            IsActive = true);
        insert customPbe;

        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = membershipActivity.Id,
            Quantity = 1,
            TotalPrice = 100,
            PricebookEntryId = customPbe.Id);
        insert oli;
    }
/*
    @isTest
    static void testBatchExecution_Success() {
        // Fetch test RFP
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];

        // Prepare fake chunks
        List<String> chunks = new List<String>{
            '{"section":"Section 1","question":"Q1","answer":"A1"}',
            '{"section":"Section 2","question":"Q2","answer":"A2"}'
        };

        Test.startTest();
        OpenAIBatchProcessor processor = new OpenAIBatchProcessor(rfp.Id, chunks);
        Database.executeBatch(processor, 1);
        Test.stopTest();

        // Assertions
        List<BatchJobLogs__c> logs = [SELECT Id FROM BatchJobLogs__c];
        System.assertEquals(0, logs.size(), 'Should not log errors on successful run');
    }

    @isTest
    static void testBatchExecution_WithErrors() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];

        // Prepare a chunk that causes parsing to fail
        List<String> chunks = new List<String>{
            'invalid-json'
        };

        Test.startTest();
        OpenAIBatchProcessor processor = new OpenAIBatchProcessor(rfp.Id, chunks);
        Database.executeBatch(processor, 1);
        Test.stopTest();

        // Assert that errors were logged
        List<BatchJobLogs__c> logs = [SELECT Id, ErrorChunk__c FROM BatchJobLogs__c];
        System.assert(logs.size() > 0, 'Should have logged errors due to bad JSON');
        System.assert(logs[0].ErrorChunk__c != null, 'Error message should be recorded');
    }

    @isTest
    static void testFinishWithErrors() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];

        List<String> chunks = new List<String>{
            'invalid-json'
        };

        Test.startTest();
        OpenAIBatchProcessor processor = new OpenAIBatchProcessor(rfp.Id, chunks);
        processor.failedChunksCount = 1;
        processor.errorLogs.add(new BatchJobLogs__c(
            RFP__c = rfp.Id,
            Prompt_Input__c = 'test',
            Prompt_Response__c = 'test',
            ErrorChunk__c = 'Simulated Error'
        ));
        processor.finish(null);
        Test.stopTest();

        System.assertEquals(1, [SELECT count() FROM BatchJobLogs__c], 'Error log should be inserted on finish');
    }
*/
    
        @isTest
    static void testProcessChunk_andHelpers() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
        OpenAIBatchProcessor processor = new OpenAIBatchProcessor(rfp.Id, new List<String>());
        
 		String rawJson = '[{"section":"Sec1","sub-section":"Sub1","question number":"Q999","question":"What is your name?","answer":"My name is AI","answer size limit":"100","Tabular_Record__c":false,"sub_questions":[{"section":"Sec1","sub-section":"Sub1.1","question number":"Q999a","question":"Who created you?","answer":"OpenAI","answer size limit":"50"}]}]';

        // Test cleanJsonResponse
        String cleaned = processor.cleanJsonResponse('chunk1', rawJson);
        System.debug(' Cleaned JSON: ' + cleaned);
        System.assertNotEquals(null, cleaned);
        System.assert(cleaned.startsWith('['), 'Should return valid JSON array');

        // Test extractRecordsFromJson
        List<RFP_Question_And_Answer__c> extracted = processor.extractRecordsFromJson(cleaned);
        System.assertEquals(2, extracted.size(), 'Should extract main + sub-question');
        System.assertEquals('Q999', extracted[0].RFP_Question_Number__c);
        System.assertEquals('Q999a', extracted[1].RFP_Question_Number__c);

        // Test processAndInsertRecords
        Test.startTest();
        Boolean inserted = processor.processAndInsertRecords(cleaned);
        Test.stopTest();
        System.assertEquals(true, inserted, 'Records should be inserted successfully');

        RFP__c rfp2 = [SELECT Id FROM RFP__c LIMIT 1];

        List<RFP_Question_And_Answer__c> insertedRecords = [
            SELECT Id FROM RFP_Question_And_Answer__c 
            WHERE RFP__c = :rfp.Id AND RFP_Question_Number__c IN ('Q999', 'Q999a')
        ];
        System.assertEquals(2, insertedRecords.size(), '2 records should be inserted for the current test chunk');
        
    }
    
@isTest
static void testProcessChunk_withInsertFailure() {
    RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
    OpenAIBatchProcessor processor = new OpenAIBatchProcessor(rfp.Id, new List<String>());

    // Force a DML error: invalid boolean type for Tabular_Record__c
    String badJson = '{' +
        '"section": "FailSection",' +
        '"sub-section": "FailSub",' +
        '"question number": "QFAIL",' +
        '"question": "Why fail?",' +
        '"answer": "Because we want to test DML fail",' +
        '"answer size limit": "100",' +
        '"Tabular_Record__c": "notaboolean"' +  // invalid value
    '}]';

    String cleaned = processor.cleanJsonResponse('chunkFail', badJson);

    Test.startTest();
    Boolean result = processor.processAndInsertRecords(cleaned);
    Test.stopTest();

    System.assertEquals(false, result, 'Insert should fail due to invalid json');
}


    
@isTest
static void testProcessChunk_withJsonParseException() {
    RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
    OpenAIBatchProcessor processor = new OpenAIBatchProcessor(rfp.Id, new List<String>());

    // This is not valid JSON structure expected by extractRecordsFromJson
    String badJson = '["just a string, not a map"]';

    Test.startTest();
    Boolean result = processor.processAndInsertRecords(badJson);
    Test.stopTest();

    System.assertEquals(false, result, 'Should fail due to JSON parse structure error');
}



    @isTest
    static void testCreateQuestionRecordIndividually() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
        OpenAIBatchProcessor processor = new OpenAIBatchProcessor(rfp.Id, new List<String>());

        Map<String, Object> questionMap = new Map<String, Object>{
            'section' => 'SecX',
            'sub-section' => 'SubX',
            'question number' => 'Q99',
            'question' => 'Why test this?',
            'answer' => 'To verify record creation',
            'answer size limit' => '123',
            'Tabular_Record__c' => true
        };

        RFP_Question_And_Answer__c rec = processor.createQuestionRecord(questionMap);
        System.assertEquals('SecX', rec.Section_Name__c);
        System.assertEquals('SubX', rec.SubSection__c);
        System.assertEquals('Q99', rec.RFP_Question_Number__c);
        System.assertEquals('Why test this?', rec.RFP_Question__c);
        System.assertEquals('To verify record creation', rec.Proposal_Gateway_Response__c);
        System.assertEquals(true, rec.Tabular_Record__c);
    }

    @isTest
    static void testBatchRun() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];

        // Inject a clean JSON chunk (mock)
        List<String> chunks = new List<String>{
            '[{"section": "Test", "question number": "Q1", "question": "Question?", "answer": "Answer", "answer size limit": "10"}]'
        };

        Test.startTest();
        OpenAIBatchProcessor batch = new OpenAIBatchProcessor(rfp.Id, chunks);
        Database.executeBatch(batch, 1);
        Test.stopTest();

        // Verify status update
        RFP__c updatedRfp = [SELECT Stage__c FROM RFP__c WHERE Id = :rfp.Id];
        System.assertNotEquals(null, updatedRfp.Stage__c);
    }
    
    @isTest
static void testCleanJsonResponse_withMarkdownWrapper() {
    RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
    OpenAIBatchProcessor processor = new OpenAIBatchProcessor(rfp.Id, new List<String>());

   String wrappedJson = '```json[{"section":"Sec1","question number":"Q999","question":"Wrapped?","answer":"Yes","answer size limit":"50"}]```';

    Test.startTest();
    String cleaned = processor.cleanJsonResponse('chunkWrapped', wrappedJson);
    Test.stopTest();

    System.debug('CLEANED JSON: ' + cleaned);
  //  System.assert(cleaned.startsWith('['), 'Should return cleaned JSON array');
}

}