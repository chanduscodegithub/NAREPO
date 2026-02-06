@IsTest
public with sharing class OpenAIControllerTest {
    @TestSetup
    static void setupTestData() {
        List<Opportunity> opplist = new List<Opportunity>();
            
        Account acc = new Account();
        acc.Name = 'Test Method Account';
        acc.Subtype__c = 'Private Exchange';
        insert acc;
        
        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            AccountId = acc.Id,
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes',
            Exchanges_the_Company_is_Looking_At__c = 'Aon Benefit Experience',
            Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes'      
        );
        insert testOpp;
    }

    // Test data factory method
    private static RFP__c createTestRFP(String status) {
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        return new RFP__c(
            Membership_Activity__c = testOpp.Id,
            Stage__c = status,
            FailedChunks__c = 0
        );
    }

    // Test content version factory method
    private static void createTestFile(Id recordId) {
        ContentVersion cv = new ContentVersion(
            Title = 'TestFile.txt',
            PathOnClient = 'TestFile.txt',
            VersionData = Blob.valueOf('Test file content'),
            IsMajorVersion = true
        );
        insert cv;
        
        cv = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id];
        ContentDocumentLink cdl = new ContentDocumentLink(
            LinkedEntityId = recordId,
            ContentDocumentId = cv.ContentDocumentId,
            ShareType = 'V'
        );
        insert cdl;
    }

    @IsTest
    static void testUploadFileWithNewRFP() {
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        
        Test.startTest();
        OpenAIController.uploadFile(
            EncodingUtil.base64Encode(Blob.valueOf('Test file content')), 
            'testFile.txt', 
            testOpp.Id, 
            'Test Company', 
            null, 
            null, 
            'New'
        );
        Test.stopTest();
    }

    @IsTest
    static void testUploadFileWithExistingRFP() {
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        RFP__c existingRFP = createTestRFP('New');
        insert existingRFP;
        
        Test.startTest();
        OpenAIController.uploadFile(
            EncodingUtil.base64Encode(Blob.valueOf('Test file content')), 
            'testFile.txt', 
            testOpp.Id, 
            'Test Company', 
            null, 
            null, 
            'New'
        );
        Test.stopTest();
    }

    @IsTest
    static void testGetFileContentSuccess() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        createTestFile(testRFP.Id);
        
        Test.startTest();
        OpenAIController.getFileContent(testRFP.Id);
        Test.stopTest();
    }

    @IsTest
    static void testGetFileContentNoFile() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        Test.startTest();
        try {
            OpenAIController.getFileContent(testRFP.Id);
        } catch(AuraHandledException e) {
            // Expected exception
        }
        Test.stopTest();
    }

    @IsTest
    static void testStartBatchProcessingSuccess() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        Test.startTest();
        OpenAIController.startBatchProcessing(testRFP.Id, new List<String>{'chunk1'});
        Test.stopTest();
    }

    @IsTest
    static void testStartBatchProcessingInvalidParams() {
        // Test null RFP ID
        Test.startTest();
        OpenAIController.startBatchProcessing(null, new List<String>{'chunk1'});
        
        // Test empty chunks
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        OpenAIController.startBatchProcessing(testRFP.Id, new List<String>());
        Test.stopTest();
    }

    @IsTest
    static void testUpdateRFPStatusSuccess() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        Test.startTest();
        OpenAIController.updateRFPStatus(testRFP.Id, 'Processing');
        Test.stopTest();
    }

    @IsTest
    static void testUpdateRFPStatusFailure() {
        // Test with invalid ID
        Test.startTest();
        OpenAIController.updateRFPStatus(null, 'Processing');
        Test.stopTest();
    }

    @IsTest
    static void testUpdateRFPDigitizeSuccess() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        Test.startTest();
        OpenAIController.updateRFPDigitize(testRFP.Id, 'Digitized');
        Test.stopTest();
    }
    
        @IsTest
        static void testUpdateRFPDigitize_InvalidId() {
            // Pass an invalid Id to force error logging
            Test.startTest();
            OpenAIController.updateRFPDigitize('a00000000000000ZZZ', 'Digitized');
            Test.stopTest();
        }

            @IsTest
        static void testUpdateRFPDigitize_BlankStatus() {
            RFP__c testRFP = createTestRFP('New');
            insert testRFP;
            // Should update Stage__c to blank
            Test.startTest();
            OpenAIController.updateRFPDigitize(testRFP.Id, null);
            Test.stopTest();
            RFP__c updated = [SELECT Stage__c FROM RFP__c WHERE Id = :testRFP.Id];
            System.assertEquals(null, updated.Stage__c);
        }

            @IsTest
        static void testUpdateRFPDigitize_NullId() {
            // Should not throw, should log error
            Test.startTest();
            OpenAIController.updateRFPDigitize(null, 'Digitized');
            Test.stopTest();
        }
    @IsTest
    static void testGetRFPStatusSuccess() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        Test.startTest();
        OpenAIController.getRFPStatus(testRFP.Id);
        Test.stopTest();
    }

 

    @IsTest
    static void testLogErrorSuccess() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        Test.startTest();
        OpenAIController.logError(testRFP.Id, 'test chunk', 'test response', 'test error');
        Test.stopTest();
    }

    @IsTest
    static void testBatchProcessorSuccessFlow() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        Test.startTest();
        OpenAIBatchProcessor batch = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'valid chunk'});
        Database.executeBatch(batch, 1);
        Test.stopTest();
    }

    @IsTest
    static void testBatchProcessorErrorFlow() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        Test.startTest();
        OpenAIBatchProcessor batch = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'error chunk'});
        Database.executeBatch(batch, 1);
        Test.stopTest();
    }

 

    @IsTest
    static void testBatchProcessorFinishSuccess() {
        RFP__c testRFP = createTestRFP('Digitization In-Progress');
        insert testRFP;
        
        OpenAIBatchProcessor batch = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
        
        Test.startTest();
        batch.finish(null);
        Test.stopTest();
    }

    @IsTest
    static void testBatchProcessorFinishWithErrors() {
        RFP__c testRFP = createTestRFP('Digitization In-Progress');
        insert testRFP;
        
        OpenAIBatchProcessor batch = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
        batch.failedChunksCount = 1;
       
        
        Test.startTest();
        batch.finish(null);
        Test.stopTest();
    }

    @IsTest
    static void testProcessChunkSuccess() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        OpenAIBatchProcessor batch = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new OpenAIMockSuccessResponse());
        batch.processChunk('valid chunk');
        Test.stopTest();
    }

    @IsTest
    static void testProcessChunkFailure() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        OpenAIBatchProcessor batch = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new OpenAIMockErrorResponse());
        batch.processChunk('error chunk');
        Test.stopTest();
    }

    @IsTest
    static void testCleanJsonResponseSuccess() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        OpenAIBatchProcessor batch = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
        
        Test.startTest();
        String result = batch.cleanJsonResponse('test', '{"valid":"json"}');
        Test.stopTest();
    }

    @IsTest
    static void testCleanJsonResponseFailure() {
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;
        
        OpenAIBatchProcessor batch = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
        
        Test.startTest();
        String result = batch.cleanJsonResponse('test', 'invalid json');
        Test.stopTest();
    }

    // Mock classes for API callouts
    private class OpenAIMockSuccessResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"generations":[{"text":"{\"valid\":\"json\"}"}]}');
            res.setStatusCode(200);
            return res;
        }
    }

    private class OpenAIMockErrorResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(500);
            return res;
        }
    }
    
    @IsTest
static void testProcessAndInsertRecordsSuccess() {
    RFP__c testRFP = createTestRFP('New');
    insert testRFP;
    
    OpenAIBatchProcessor processor = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
    
    Test.startTest();
    String validJson = '[{"section":"Test Section","sub-section":"Test Sub","question number":"1","question":"Test Q","answer":"Test A"}]';
    Boolean result = processor.processAndInsertRecords(validJson);
    Test.stopTest();
    
}
    @IsTest
static void testProcessAndInsertRecordsEmptyJson() {
    RFP__c testRFP = createTestRFP('New');
    insert testRFP;
    
    OpenAIBatchProcessor processor = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
    
    Test.startTest();
    Boolean result = processor.processAndInsertRecords('');
    Test.stopTest();
    
}
    
@IsTest
static void testProcessAndInsertRecordsInvalidJson() {
    RFP__c testRFP = createTestRFP('New');
    insert testRFP;
    
    OpenAIBatchProcessor processor = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
    
    Test.startTest();
    Boolean result = processor.processAndInsertRecords('invalid json');
    Test.stopTest();
    
}
    @IsTest
static void testProcessAndInsertRecordsWithSubQuestions() {
    RFP__c testRFP = createTestRFP('New');
    insert testRFP;
    
    OpenAIBatchProcessor processor = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
    
    Test.startTest();
    String jsonWithSubQuestions = '[{"section":"Main","question number":"1","question":"Main Q","answer":"Main A",' + 
        '"sub_questions":[{"section":"Sub","question number":"1.1","question":"Sub Q","answer":"Sub A"}]}]';
    Boolean result = processor.processAndInsertRecords(jsonWithSubQuestions);
    Test.stopTest();
 
}

@IsTest
static void testCreateQuestionRecordSuccess() {
    RFP__c testRFP = createTestRFP('New');
    insert testRFP;
    
    OpenAIBatchProcessor processor = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
    
    Test.startTest();
    Map<String, Object> questionData = new Map<String, Object>{
        'section' => 'Test Section',
        'sub-section' => 'Test Sub',
        'question number' => '1',
        'question' => 'Test Question',
        'answer' => 'Test Answer',
        'answer size limit' => '100',
        'Tabular_Record__c' => true
    };
    RFP_Question_And_Answer__c record = processor.createQuestionRecord(questionData);
    Test.stopTest();
  
}
    
     @IsTest
    static void testUpdateRFPStatusDatabaseError() {
        // Create an RFP record to get a valid ID, but we won't update it to trigger the error
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;

        Test.startTest();
        
        try {
            OpenAIController.updateRFPStatus('a00000000000000AAA', 'Processing'); // Invalid ID
        } catch (Exception e) {
            // We expect an exception here, but the method itself handles the Database.SaveResult,
            // so the outer catch block in the actual method might not be hit in this specific way.
            // The key is to ensure the internal `if (!result.isSuccess())` block is executed.
        }
        Test.stopTest();

        // No direct assertion on the log here, as logError doesn't return anything.
        // The coverage will confirm the line was hit.
        // If logError created a custom object for logs, you could query it here.
    }

    @IsTest
    static void testUpdateRFPDigitizeDatabaseError() {
        // Create an RFP record to get a valid ID, but we won't update it to trigger the error
        RFP__c testRFP = createTestRFP('New');
        insert testRFP;

        Test.startTest();
        // Simulate a Database.update failure using an invalid ID
        try {
            OpenAIController.updateRFPDigitize('a00000000000000BBB', 'Digitized'); // Invalid ID
        } catch (Exception e) {
            // Expected exception handling
        }
        Test.stopTest();

        // No direct assertion on the log here.
    }
    
   @IsTest
static void testCreateQuestionRecordMissingFields() {
    RFP__c testRFP = createTestRFP('New');
    insert testRFP;
    
    OpenAIBatchProcessor processor = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'chunk1'});
    
    Test.startTest();
    Map<String, Object> questionData = new Map<String, Object>{
        'section' => 'Test Section'
       
    };
    RFP_Question_And_Answer__c record = processor.createQuestionRecord(questionData);
    Test.stopTest();
    
}

    
  
  
private class OpenAIMockEmptyResponse implements HttpCalloutMock {
    public HTTPResponse respond(HTTPRequest req) {
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"generations":[]}'); // Empty generations array
        res.setStatusCode(200);
        return res;
    }
}
    @IsTest
static void testEmptyGenerationsResponse() {
    RFP__c testRFP = createTestRFP('New');
    insert testRFP;
    
    Test.startTest();
    Test.setMock(HttpCalloutMock.class, new OpenAIMockEmptyResponse());
    OpenAIBatchProcessor processor = new OpenAIBatchProcessor(testRFP.Id, new List<String>{'empty response chunk'});
    processor.processChunk('empty response chunk'); // No assignment needed
    Test.stopTest();
    
}

@IsTest
static void testInsertQuestions_Success() {
    RFP__c testRFP = createTestRFP('New');
    insert testRFP;

    List<RFP_Question_And_Answer__c> validQuestions = new List<RFP_Question_And_Answer__c>{
        new RFP_Question_And_Answer__c(
            RFP__c = testRFP.Id,
            RFP_Question_Number__c = '1',
            RFP_Question__c = 'What is your company name?',
            Proposal_Gateway_Response__c = 'Our company name is TestCo.'
        ),
        new RFP_Question_And_Answer__c(
            RFP__c = testRFP.Id,
            RFP_Question_Number__c = '2',
            RFP_Question__c = 'Where are you located?',
            Proposal_Gateway_Response__c = 'We are based in New York.'
        )
    };

    Test.startTest();
    List<String> result = OpenAIController.insertQuestions(validQuestions, testRFP.Id);
    Test.stopTest();

    System.assert(!result.isEmpty(), 'Results should not be empty');
    System.assert(result[0].contains('inserted successfully'), 'Should include success message');
}

@IsTest
static void testInsertQuestions_EmptyList() {
    RFP__c testRFP = createTestRFP('New');
    insert testRFP;

    Test.startTest();
    List<String> result = OpenAIController.insertQuestions(new List<RFP_Question_And_Answer__c>(), testRFP.Id);
    Test.stopTest();

    System.assertEquals(1, result.size(), 'Should return one message for empty list');
    System.assertEquals('No records provided.', result[0], 'Should return correct message');
}

@IsTest
static void testInsertQuestions_InvalidRecords() {
    RFP__c testRFP = createTestRFP('New');
    insert testRFP;

    List<RFP_Question_And_Answer__c> invalidQuestions = new List<RFP_Question_And_Answer__c>{
        new RFP_Question_And_Answer__c( RFP_Question_Number__c = '3',
            RFP_Question__c = 'What is your company names?',
            Proposal_Gateway_Response__c = 'Our company name is testingcomp.') // missing fields
    };

    Test.startTest();
    List<String> result = OpenAIController.insertQuestions(invalidQuestions, testRFP.Id);
    Test.stopTest();

    System.assert(!result.isEmpty(), 'Should return at least one error message');
    System.assert(result[0].contains('failed') || result[0].contains('error'), 'Should include error message');
}


}