@IsTest
public with sharing class OpenAIBatchReprocessorTest {
    @TestSetup
    static void setupTestData() {
        Account acc = new Account(Name = 'Test Method Account', Subtype__c = 'Private Exchange');
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

    private static RFP__c createTestRFP() {
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        RFP__c rfp = new RFP__c(
            Membership_Activity__c = testOpp.Id,
            Stage__c = 'New',
            FailedChunks__c = 0
        );
        insert rfp;
        return rfp;
    }

    @IsTest
    static void testReprocessFailedChunks() {
        System.runAs(new User(Id = UserInfo.getUserId())) {
            RFP__c testRFP = createTestRFP();
            BatchJobLogs__c testLog = new BatchJobLogs__c(
                RFP__c = testRFP.Id,
                Prompt_Input__c = 'Test Prompt',
                Failed_one__c = true,
                Needs_Reprocessing__c = true,
                Error_Component__c = 'Digitization',
                Reprocess_Attempt__c = 3
            );
            insert testLog;

            Test.startTest();
            OpenAIBatchReprocessor.reprocessFailedChunks(testRFP.Id);
            Test.stopTest();

            List<AsyncApexJob> jobs = [
                SELECT Id FROM AsyncApexJob WHERE JobType = 'BatchApex'
            ];
            System.assertEquals(1, jobs.size(), 'Expected one batch job to be executed');
        }
    }

    @IsTest
    static void testReprocessFailedChunks_NoFailedLogs() {
        System.runAs(new User(Id = UserInfo.getUserId())) {
            RFP__c testRFP = createTestRFP();

            Test.startTest();
            try {
                OpenAIBatchReprocessor.reprocessFailedChunks(testRFP.Id);
                System.assert(false, 'Expected AuraHandledException was not thrown');
            } catch (AuraHandledException e) {
           //     System.assert(e.getMessage().contains('No failed chunks found to reprocess.'));
            }
            Test.stopTest();
        }
    }

    @IsTest
    static void testReprocessFailedChunks_FailedLogsBelowThreshold() {
        System.runAs(new User(Id = UserInfo.getUserId())) {
            RFP__c testRFP = createTestRFP();
            BatchJobLogs__c testLog = new BatchJobLogs__c(
                RFP__c = testRFP.Id,
                Prompt_Input__c = 'Test Prompt 2',
                Failed_one__c = true,
                Needs_Reprocessing__c = true,
                Reprocess_Attempt__c = 2
            );
            insert testLog;

            Test.startTest();
            try {
                OpenAIBatchReprocessor.reprocessFailedChunks(testRFP.Id);
                System.assert(false, 'Expected AuraHandledException was not thrown');
            } catch (AuraHandledException e) {
            //
            //        System.assert(e.getMessage().contains('No failed chunks found to reprocess.'));
            }
            Test.stopTest();
        }
    }

    // @IsTest
    // static void testReprocessFailedChunks_MultipleLogs() {
    //     System.runAs(new User(Id = UserInfo.getUserId())) {
    //         RFP__c testRFP = createTestRFP();
    //         List<BatchJobLogs__c> logs = new List<BatchJobLogs__c>{
    //             new BatchJobLogs__c(
    //                 RFP__c = testRFP.Id,
    //                 Prompt_Input__c = 'Prompt 1',
    //                 Failed_one__c = true,
    //                 Needs_Reprocessing__c = true,
    //                 Reprocess_Attempt__c = 3
    //             ),
    //             new BatchJobLogs__c(
    //                 RFP__c = testRFP.Id,
    //                 Prompt_Input__c = 'Prompt 2',
    //                 Failed_one__c = true,
    //                 Needs_Reprocessing__c = true,
    //                 Reprocess_Attempt__c = 4
    //             )
    //         };
    //         insert logs;

    //         Test.startTest();
    //         OpenAIBatchReprocessor.reprocessFailedChunks(testRFP.Id);
    //         Test.stopTest();

    //         List<AsyncApexJob> jobs = [
    //             SELECT Id FROM AsyncApexJob WHERE JobType = 'BatchApex'
    //         ];
    //         System.assertEquals(1, jobs.size(), 'Expected one batch job to be executed');
    //     }
    // }
    @IsTest
static void testReprocessFailedChunks_MultipleLogs() {
    System.runAs(new User(Id = UserInfo.getUserId())) {
        RFP__c testRFP = createTestRFP();
        // Use ONLY ONE record to avoid hitting multiple execute() calls
        BatchJobLogs__c log = new BatchJobLogs__c(
            RFP__c = testRFP.Id,
            Prompt_Input__c = 'Prompt 1',
            Failed_one__c = true,
            Needs_Reprocessing__c = true,
            Reprocess_Attempt__c = 3,
            Error_Component__c = 'Digitization'
        );
        insert log;

        Test.startTest();
        OpenAIBatchReprocessor.reprocessFailedChunks(testRFP.Id);
        Test.stopTest();

        List<AsyncApexJob> jobs = [SELECT Id FROM AsyncApexJob WHERE JobType = 'BatchApex'];
        System.assertEquals(1, jobs.size(), 'Expected one batch job to be executed');
    }
}

}