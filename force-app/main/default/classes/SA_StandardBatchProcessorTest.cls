@isTest
private class SA_StandardBatchProcessorTest {

    @testSetup
    static void setupTestData() {
        Account acc = new Account(Name = 'Test Account', Subtype__c = 'Private Exchange');
        insert acc;

        Opportunity opp = new Opportunity(
            Name = 'Test Opp',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(10),
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
            People__c = 'Employees',
            Company_Name_as_per_RFP__c = 'Acme Corp',
            Strategic_Question_No__c = 'Q1'
        );
        insert memo;

        RFP_Question_And_Answer__c qna = new RFP_Question_And_Answer__c(
            RFP__c = rfp.Id,
            RFP_Question__c = 'What is your coverage?',
            RFP_Question_Number__c = 'Q1',
            Proposal_Gateway_Response__c = 'Sample response',
            Answer_size_limit__c = '100',
            IsStrategicQuestion__c = false,
            Tabular_Record__c = false
        );
        insert qna;
    }

    @isTest
    static void testBatchStandardMode() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        Strategy_Memo__c memo = [SELECT Id, Membership_Activity__c, People__c, Company_Name_as_per_RFP__c FROM Strategy_Memo__c LIMIT 1];

        Map<Id, Strategy_Memo__c> memoMap = new Map<Id, Strategy_Memo__c>{
            opp.Id => memo
        };

        String mockBlob = 'Mock Product Blob';
        List<RFP__c> rfpList = new List<RFP__c>{ rfp };

        Test.startTest();

        SA_StandardBatchProcessor.RunMode mode = SA_StandardBatchProcessor.RunMode.Standard;
        SA_StandardBatchProcessor batch = new SA_StandardBatchProcessor(rfpList, memoMap, mockBlob, mode);

        Database.executeBatch(batch, 1);
        Test.stopTest();

        RFP__c updatedRfp = [SELECT Id, Stage__c FROM RFP__c WHERE Id = :rfp.Id];
     //   System.assertNotEquals(null, updatedRfp.Stage__c, 'Stage should be updated');
    }

    // Optional: Add test for Strategic mode
    @isTest
    static void testBatchStrategicMode() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        Strategy_Memo__c memo = [SELECT Id, Membership_Activity__c, People__c, Company_Name_as_per_RFP__c FROM Strategy_Memo__c LIMIT 1];

        Map<Id, Strategy_Memo__c> memoMap = new Map<Id, Strategy_Memo__c>{
            opp.Id => memo
        };

        String mockBlob = 'Strategic Product Blob';
        List<RFP__c> rfpList = new List<RFP__c>{ rfp };

        Test.startTest();

        SA_StandardBatchProcessor.RunMode mode = SA_StandardBatchProcessor.RunMode.Strategic;
        SA_StandardBatchProcessor batch = new SA_StandardBatchProcessor(rfpList, memoMap, mockBlob, mode);
    //    Test.setMock(ConnectApiMock.class, new MockLLMResponse());

        Database.executeBatch(batch, 1);
        Test.stopTest();

        RFP__c updatedRfp = [SELECT Id, Stage__c, IsStrategicReviewCompleted__c FROM RFP__c WHERE Id = :rfp.Id];
    //    System.assertEquals(true, updatedRfp.IsStrategicReviewCompleted__c);
    }

    // Optional: Simulate error scenario (e.g. parsing failure)
    @isTest
    static void testBatchHandlesParseError() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        Strategy_Memo__c memo = [SELECT Id FROM Strategy_Memo__c LIMIT 1];

        Map<Id, Strategy_Memo__c> memoMap = new Map<Id, Strategy_Memo__c>{
            opp.Id => memo
        };

        List<RFP__c> rfpList = new List<RFP__c>{ rfp };

        // Use faulty mock
  //      Test.setMock(ConnectApiMock.class, new MockBrokenLLM());

        Test.startTest();
        SA_StandardBatchProcessor batch = new SA_StandardBatchProcessor(rfpList, memoMap, '', SA_StandardBatchProcessor.RunMode.Standard);
        Database.executeBatch(batch, 1);
        Test.stopTest();

        // Expect that BatchJobLogs__c was written
        List<BatchJobLogs__c> logs = [SELECT Id FROM BatchJobLogs__c];
        System.assert(logs.size() > 0, 'Error logs should be created for parse error');
    }
    
    
    
    // new ones 
     
@isTest
static void testStartMethodException() {
    List<RFP__c> emptyRfpList = null; // OR use empty list to simulate corner case
    Map<Id, Strategy_Memo__c> memoMap = new Map<Id, Strategy_Memo__c>();

    SA_StandardBatchProcessor batch = new SA_StandardBatchProcessor(emptyRfpList, memoMap, '', SA_StandardBatchProcessor.RunMode.Standard);

    Test.startTest();
    try {
        batch.start(null); // should throw exception due to null rfpList
        System.assert(false, 'Expected exception was not thrown');
    } catch (Exception e) {
       // System.assert(e.getMessage().contains('unexpected token'), 'Caught expected exception');
    }
    Test.stopTest();
}

    
  
}