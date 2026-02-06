@isTest
private class RFPTriggerHandlerTest {

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
        
        RFP__c rfp = new RFP__c(Membership_Activity__c = membershipActivity.Id, IsBatchRunningForStrategicAiResponses__c = false, File_Type__c= 'word');
        insert rfp;
        
         RFP__c rfpexcel = new RFP__c(Membership_Activity__c = membershipActivity.Id, IsBatchRunningForStrategicAiResponses__c = false, File_Type__c='excel');
        insert rfpexcel;
        List<RFP_Question_And_Answer__c> qnaList = new List<RFP_Question_And_Answer__c>();
        RFP_Question_And_Answer__c qna = new RFP_Question_And_Answer__c(
            RFP__c = rfp.Id,
            RFP_Question__c = 'What is your approach?',
            Proposal_Gateway_Response__c = 'Initial Response',
            RFP_Question_Number__c = 'Q1',
            Answer_size_limit__c = '100',
            Tabular_Record__c = false);
        qnaList.add(qna);
        RFP_Question_And_Answer__c qna1 = new RFP_Question_And_Answer__c(
            RFP__c = rfp.Id,
            RFP_Question__c = 'What is your approach Test?',
            Proposal_Gateway_Response__c = 'Initial Response',
            RFP_Question_Number__c = 'Q2',
            Answer_size_limit__c = '100',
            Tabular_Record__c = false);
        qnaList.add(qna1);
        insert qnaList;
        
        Strategy_Memo__c memo = new Strategy_Memo__c(
            Membership_Activity__c = membershipActivity.Id,
            Strategic_Question_No__c = 'Q1',
            People__c = 'Employees',
            Company_Name_as_per_RFP__c = 'Acme Inc.');
        insert memo;
        
        //   Product2 p = new Product2(Name='Medical Coverage', IsActive=true);
        //    insert p;
        
        /*    OpportunityLineItem oli = new OpportunityLineItem(
OpportunityId = membershipActivity.Id,
Product2Id = p.Id,
Quantity = 1,
TotalPrice = 100);
insert oli; */
        
        // Step 1: Get Standard Pricebook ID
        Id stdPbId = Test.getStandardPricebookId();
        
        // Step 2: Create Product
        Product2 p = new Product2(Name = 'Medical Coverage', IsActive = true);
        insert p;
        
        // Step 3: Create Standard PricebookEntry
        PricebookEntry stdPbe = new PricebookEntry(
            Product2Id = p.Id,
            Pricebook2Id = stdPbId,
            UnitPrice = 100,
            IsActive = true
        );
        insert stdPbe;
        
        // Step 4: Create Custom Pricebook
        Pricebook2 customPb = new Pricebook2(Name = 'Custom Book', IsActive = true);
        insert customPb;
        
        // Step 5: Assign Pricebook to Opportunity
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        opp.Pricebook2Id = customPb.Id;
        update opp;
        
        // Step 6: Create Custom PricebookEntry
        PricebookEntry customPbe = new PricebookEntry(
            Product2Id = p.Id,
            Pricebook2Id = customPb.Id,
            UnitPrice = 100,
            IsActive = true
        );
        insert customPbe;
        
        // Step 7: Create OpportunityLineItem
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Quantity = 1,
            TotalPrice = 100,
            PricebookEntryId = customPbe.Id
        );
        insert oli;
        
        
    }
    
    @isTest
    static void testAfterUpdate() {
        //Test.setMock(HttpCalloutMock.class, new EinsteinLLMMock());
        RFP__c rfp = [SELECT ID, Stage__c FROM RFP__c LIMIT 1];
        Opportunity opp=[SELECT Id FROM Opportunity LIMIT 1];
        rfp.Stage__c = 'Digitization Successful';
        update rfp;
        String cleanedJson = '[{"question number":"","question":"","answer":"","Tabular_Record__c":"True","sub_questions":[]}]';
        String rawJSON = '```[{"question number":"","question":"","answer":"","Tabular_Record__c":"True","sub_questions":[]}]```';
        //SA_StrategyBatchProcessor sa = new SA_StrategyBatchProcessor(new Map<String,Set<String>>(),new List<RFP__c>{rfp},'Reason',null,'Product',false);
       /* sa.sendCompletionEmail();
        sa.storeJsonToRFP(cleanedJson,rfp.Id);
        sa.getstrategicQuestionFeedback(cleanedJson,rfp.Id,opp.Id,'reason');
        sa.cleanJsonResponse('record',rawJSON);
        sa.processAndInsertRecord('{ "recordId": "a1Adx000000jojrEAA", "rewrittenResponse": "1: Yes, provide internally", "feedback": [{"header":"People Mismatch","description":"TEST"}] }');*/
    }
    
        @isTest
    static void testparseExcelStyleStrategicString() {
        RFPTriggerHelper.parseExcelStyleStrategicString('Nemours - 4. Member Experience(14,10),Nemours - 6. Clinical Capabilit(14), Nemours - General(10), OS_1-Response Section 11 - Med(11.2.2,11.2.18), OS_1-Response Section 4 - HIPAA(4.1.4, 4.2.1)');
    }
}