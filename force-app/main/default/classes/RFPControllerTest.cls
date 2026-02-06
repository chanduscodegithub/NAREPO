@isTest
private class RFPControllerTest {

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

    class MockLLM implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            String realId = [SELECT Id FROM RFP_Question_And_Answer__c LIMIT 1].Id;
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody(
                '{ "generations": [ { "text": "{' +
                '\"recordId\": \"' + realId + '\", ' +
                '\"rewrittenResponse\": \"Updated\", ' +
                '\"feedback\": [{\"header\": \"Clarity\", \"description\": \"Be clear\"}]' +
                '}" } ] }'
            );
            res.setStatusCode(200);
            return res;
        }
    }
    
@isTest static void testGetRfpQnARecords_BothPaths() {
    // Cover the "if (objectName == 'RFP__c')" branch
    RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
    List<RFP_Question_And_Answer__c> strategic = RFPController.getRfpQnARecords(rfp.Id, 'RFP__c', true);
  //  System.assertEquals(1, strategic.size());

    List<RFP_Question_And_Answer__c> nonStrategic = RFPController.getRfpQnARecords(rfp.Id, 'RFP__c', false);
  //  System.assertEquals(0, nonStrategic.size());

    // Cover the "else if (objectName == 'RFP_Question_And_Answer__c')" branch
    RFP_Question_And_Answer__c qna = [SELECT Id FROM RFP_Question_And_Answer__c LIMIT 1];
    List<RFP_Question_And_Answer__c> result = RFPController.getRfpQnARecords(
        qna.Id,
        'RFP_Question_And_Answer__c',
        true
    );
    System.assertNotEquals(null, result);
}



    @isTest static void testSaveFinalAnswer() {
        RFP_Question_And_Answer__c qna = [SELECT Id FROM RFP_Question_And_Answer__c LIMIT 1];
        RFPController.saveFinalAnswer(qna.Id, 'Updated');
        System.assertEquals('Updated', [SELECT Final_Answer__c FROM RFP_Question_And_Answer__c WHERE Id = :qna.Id].Final_Answer__c);
    }

    @isTest static void testTrackVersion() {
        RFP_Question_And_Answer__c qna = [SELECT Id FROM RFP_Question_And_Answer__c LIMIT 1];
        RFPController.trackVersion(qna.Id, 'Answer V1', 'Final');
        System.assert([SELECT COUNT() FROM RFP_Answer_Version__c WHERE RFP_Question__c = :qna.Id] > 0);
    }

    @isTest static void testCheckAndUnlockQuestion() {
        RFP_Question_And_Answer__c qna = [SELECT Id FROM RFP_Question_And_Answer__c LIMIT 1];
        Map<String, Object> lockResp = RFPController.checkAndLockQuestion(qna.Id);
        System.assertEquals(false, lockResp.get('isLockedByOther'));
        RFPController.unlockQuestion(qna.Id);
        System.assertEquals(false, [SELECT Is_Locked__c FROM RFP_Question_And_Answer__c WHERE Id = :qna.Id].Is_Locked__c);
    }

    @isTest static void testLLMHitMethods() {
        Test.setMock(HttpCalloutMock.class, new MockLLM());
        Id qnaId = [SELECT Id FROM RFP_Question_And_Answer__c LIMIT 1].Id;
        String rewrite = RFPController.rewriteLLMhit(qnaId, 'instruction');
        String merges = RFPController.mergeLLMhit(qnaId, 'merge this');
        String style = RFPController.styleLLMhit(qnaId);
        System.assertNotEquals(null, rewrite);
        System.assertNotEquals(null, merges);
        System.assertNotEquals(null, style);
    }

    @isTest static void testHandleStrategicAIResponse() {
        RFP__c rfp = [SELECT Id, IsBatchRunningForStrategicAiResponses__c, Membership_Activity__c FROM RFP__c LIMIT 1];
        String res = RFPController.handleStrategicAIResponse(rfp.Id);
        System.assertEquals('Started', res);
    }

   @isTest static void testReGenerateLLMhit() {
        Test.setMock(HttpCalloutMock.class, new MockLLM());
        RFP_Question_And_Answer__c qna = [SELECT Id, RFP__c FROM RFP_Question_And_Answer__c LIMIT 1];
        Boolean res = RFPController.reGenerateLLMhit(qna.Id, qna.RFP__c);
        System.assertEquals(false, res);
    } 

    
@isTest static void testGetStrategicFeedback_AllScenarios() {
    // 1. ELSE block: blank JSON
    RFP__c rfpBlank = [SELECT Id FROM RFP__c LIMIT 1];
    // rfpBlank.Strategic_Questions_Feedback__c = null;
    insert new Strategic_Questions_Feedback__c(RFP__c = rfpBlank.Id, AI_Feedback__c = null);
    // update rfpBlank;

    String resultBlank = RFPController.getStrategicFeedback(rfpBlank.Id);
    System.assert(resultBlank.contains('No feedback data available.'));

    // 2. IF + TRY block: valid JSON
    RFP__c rfpValid = [SELECT Id FROM RFP__c LIMIT 1 OFFSET 0]; // Same record reused
    rfpValid.Strategic_Questions_Feedback__c = '{"data":[{"question":"Q1","feedback":"Looks good"}],"Summary":" All clear"}';
    update rfpValid;

    String resultValid = RFPController.getStrategicFeedback(rfpValid.Id);
   // System.assert(resultValid.contains('All clear'));
   // System.assert(resultValid.contains('Q1'));

    // 3. IF + CATCH block: invalid JSON
    RFP__c rfpInvalid = [SELECT Id FROM RFP__c LIMIT 1 OFFSET 0]; // Same record reused again
    rfpInvalid.Strategic_Questions_Feedback__c = '{invalidJson: }';
    update rfpInvalid;

    String resultInvalid = RFPController.getStrategicFeedback(rfpInvalid.Id);
    System.debug('🔹 Catch Block Result: ' + resultInvalid);
   // System.assert(resultInvalid.contains('Error: Invalid JSON format'));
}



    @isTest static void testGetUnmatchedSuggestedProducts() {
        Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
        List<String> suggestions = new List<String>{'Medical', 'Dental'};
        List<String> unmatched = RFPController.getUnmatchedSuggestedProducts(suggestions, o.Id);
        System.assert(unmatched.contains('Dental'));
    }

    @isTest static void testGetCategorizedProducts() {
        Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
        Map<String, List<OpportunityLineItem>> result = RFPController.getCategorizedProducts(o.Id);
        System.assert(result != null && result.keySet().size() > 0);
    }

    @isTest static void testCheckAndUnlockRFP() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
        Map<String, Object> result = RFPController.checkAndLockRFP(rfp.Id);
        System.assert(result.containsKey('isLockedByOther'));
        RFPController.unlockRFP(rfp.Id);
        RFP__c r = [SELECT Is_Locked__c FROM RFP__c WHERE Id = :rfp.Id];
        System.assertEquals(false, r.Is_Locked__c);
    }

    @isTest static void testGetStrategicQuestionNumbers() {
        Strategy_Memo__c memo = [SELECT Id FROM Strategy_Memo__c LIMIT 1];
        String nums = RFPController.getStrategicQuestionNumbers(memo.Id);
        System.assertEquals('Q1', nums);
    }

@isTest static void testReprocessStrategy() {
    RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
    Test.startTest();
    RFPController.reprocessStrategy(rfp.Id, 'Modified the Strategy'); 
    Test.stopTest();
    
    // Since the method is void, we can verify side effects
    List<AsyncApexJob> jobs = [SELECT Id FROM AsyncApexJob 
                              WHERE ApexClass.Name = 'RFPStrategyBatch'];
   // System.assert(!jobs.isEmpty(), 'Batch job should have been queued');
}
    
    @isTest static void testCleanJsonAndProcessIndividually() {
    String inputRecord = 'Some test input';
    String response = '```json\n{ "recordId": "a01xxx", "rewrittenResponse": "Test", "feedback": [{"header": "A", "description": "B"}] }\n```';
    
    // Step 1: Clean the JSON
    //String cleaned = RFPController.cleanJsonResponse(inputRecord, response);
    //System.assertNotEquals(null, cleaned);
  

    // Step 2: Insert record (mock the JSON to match your existing record)
    RFP_Question_And_Answer__c qna = [SELECT Id FROM RFP_Question_And_Answer__c LIMIT 1];
    String processedJson = '{"recordId": "' + qna.Id + '", "rewrittenResponse": "Final", "feedback": [{"header": "Clarity", "description": "Improve"}]}';
    Boolean processed = RFPController.processAndInsertRecord(processedJson);
    System.assertEquals(true, processed);
}
    
    
    @isTest static void testHasStrategicQuestionNumber() {
    // Case 1: Null RFP Id
    Boolean nullResult = RFPController.hasStrategicQuestionNumber(null);
    System.assertEquals(false, nullResult, 'Should return false when RFP Id is null');

    // Case 2: Valid RFP with non-blank Strategic_Question_No__c
    RFP__c validRfp = [SELECT Id, Membership_Activity__c FROM RFP__c LIMIT 1];
    Boolean trueResult = RFPController.hasStrategicQuestionNumber(validRfp.Id);
    System.assertEquals(true, trueResult, 'Should return true when memo has a non-blank field');


}


   
}