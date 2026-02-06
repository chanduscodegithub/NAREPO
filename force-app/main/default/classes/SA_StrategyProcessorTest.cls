@isTest
private class SA_StrategyProcessorTest {

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
            Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes'
        );
        insert membershipActivity;

        RFP__c rfp = new RFP__c(
            Membership_Activity__c = membershipActivity.Id,
            IsBatchRunningForStrategicAiResponses__c = false
        );
        insert rfp;

        // Q&As across multiple sheets
        List<RFP_Question_And_Answer__c> qnas = new List<RFP_Question_And_Answer__c>{
            new RFP_Question_And_Answer__c(
                RFP__c = rfp.Id, RFP_Question__c = 'General Q4', RFP_Question_Number__c = '4',
                Proposal_Gateway_Response__c = 'Resp1', Sheet_Name__c = 'Nemours - General'
            ),
            new RFP_Question_And_Answer__c(
                RFP__c = rfp.Id, RFP_Question__c = 'General Q5', RFP_Question_Number__c = '5',
                Proposal_Gateway_Response__c = 'Resp2', Sheet_Name__c = 'Nemours - General'
            ),
            new RFP_Question_And_Answer__c(
                RFP__c = rfp.Id, RFP_Question__c = 'MemberExp Q4', RFP_Question_Number__c = '4',
                Proposal_Gateway_Response__c = 'Resp3', Sheet_Name__c = 'Nemours - 4. Member Experience'
            ),
            new RFP_Question_And_Answer__c(
                RFP__c = rfp.Id, RFP_Question__c = 'MemberExp Q5', RFP_Question_Number__c = '5',
                Proposal_Gateway_Response__c = 'Resp4', Sheet_Name__c = 'Nemours - 4. Member Experience'
            ),
            new RFP_Question_And_Answer__c(
                RFP__c = rfp.Id, RFP_Question__c = 'BNED Q2', RFP_Question_Number__c = '2.1.2.1.2',
                Proposal_Gateway_Response__c = 'Resp5', Sheet_Name__c = 'BNED_final'
            )
                };
        insert qnas;

        Strategy_Memo__c memo = new Strategy_Memo__c(
            Membership_Activity__c = membershipActivity.Id,
            Strategic_Question_No__c = '4,5',
            People__c = 'Employees',
            Company_Name_as_per_RFP__c = 'Acme Inc.'
        );
        insert memo;
    }

    @isTest
    static void testProcessStrategicQuestions() {
        List<RFP__c> rfpList = [SELECT Id, Membership_Activity__c FROM RFP__c LIMIT 1];
        RFP__c rfp = rfpList[0];

        Opportunity opp = [SELECT Id FROM Opportunity WHERE Id = :rfp.Membership_Activity__c LIMIT 1];
        Strategy_Memo__c memo = [SELECT Id FROM Strategy_Memo__c WHERE Membership_Activity__c = :opp.Id LIMIT 1];

        //  Updated: flatten to Map<Id, Set<String>>
        Map<Id, Set<String>> rfpToStrategicMap = new Map<Id, Set<String>>();
        rfpToStrategicMap.put(rfp.Id, new Set<String>{
            'Nemours - General|4',
            'Nemours - General|5',
            'BNED_final|2.1.2.1.2'
        });

        Map<Id, Strategy_Memo__c> memoMap = new Map<Id, Strategy_Memo__c>();
        memoMap.put(opp.Id, memo);

        Test.startTest();
        SA_StrategyProcessor processor = new SA_StrategyProcessor();
        processor.processStrategicQuestions(rfpList, rfpToStrategicMap, memoMap, 'Modified Strategic Questions', 'Medical Coverage');
        Test.stopTest();

        // Verify only matching tokens are marked
        Map<String, Boolean> resultMap = new Map<String, Boolean>();
        for (RFP_Question_And_Answer__c q : [
            SELECT Sheet_Name__c, RFP_Question_Number__c, IsStrategicQuestion__c
            FROM RFP_Question_And_Answer__c
        ]) {
            resultMap.put(q.Sheet_Name__c + '.' + q.RFP_Question_Number__c, q.IsStrategicQuestion__c);
        }

        System.assertEquals(true, resultMap.get('Nemours - General.4'), 'General Q4 should be marked');
        System.assertEquals(true, resultMap.get('Nemours - General.5'), 'General Q5 should be marked');
        System.assertEquals(true, resultMap.get('BNED_final.2.1.2.1.2'), 'BNED Q2 should be marked');
        System.assertEquals(false, resultMap.get('Nemours - 4. Member Experience.4'), 'MemberExp Q4 should not be marked');
        System.assertEquals(false, resultMap.get('Nemours - 4. Member Experience.5'), 'MemberExp Q5 should not be marked');
    }

    @isTest
    static void testErrorPath_EmailFailureCovered() {
        List<RFP__c> rfpList = [SELECT Id, Membership_Activity__c FROM RFP__c LIMIT 1];
        RFP__c rfp = rfpList[0];

        Opportunity opp = [SELECT Id FROM Opportunity WHERE Id = :rfp.Membership_Activity__c LIMIT 1];
        Strategy_Memo__c memo = [SELECT Id FROM Strategy_Memo__c WHERE Membership_Activity__c = :opp.Id LIMIT 1];

        //  Updated for new type
        Map<Id, Set<String>> rfpToStrategicMap = new Map<Id, Set<String>>();
        rfpToStrategicMap.put(rfp.Id, new Set<String>{ 'Nemours - General|Q1' }); // invalid to trigger failure

        Map<Id, Strategy_Memo__c> memoMap = new Map<Id, Strategy_Memo__c>();
        memoMap.put(opp.Id, memo);

        SA_StrategyUtils.forceFailureInTest = true;

        Test.startTest();
        SA_StrategyProcessor processor = new SA_StrategyProcessor();
        processor.processStrategicQuestions(rfpList, rfpToStrategicMap, memoMap, 'Retry Due to Failure', 'Dental');
        Test.stopTest();

        SA_StrategyUtils.forceFailureInTest = false;

        List<Strategic_Questions_Feedback__c> feedbacks = [
            SELECT Id FROM Strategic_Questions_Feedback__c WHERE RFP__c = :rfp.Id
        ];
        System.assertEquals(0, feedbacks.size(), 'Feedback should not be inserted on failure');
    }
}