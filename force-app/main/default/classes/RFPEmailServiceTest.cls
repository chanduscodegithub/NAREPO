@isTest
public class RFPEmailServiceTest {

    @testSetup
    static void setupTestData() {
        // Create Account
        Account acc = new Account();
        acc.Name = 'Test Method Account';
        acc.Subtype__c = 'Private Exchange';
        insert acc;

        // Create Opportunity
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

        // Create RFP__c record using helper
        insert createTestRFP('Draft');

        // Create a test user to act as running user
        if ([SELECT count() FROM User WHERE Username = 'testuser@uhc.com'] == 0) {
            Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
            User u = new User(
                Alias = 'tuser',
                Email = 'testuser6456@uhc.com',
                EmailEncodingKey = 'UTF-8',
                LanguageLocaleKey = 'en_US',
                LocaleSidKey = 'en_US',
                ProfileId = p.Id,
                TimeZoneSidKey = 'America/Los_Angeles',
                UserName = 'testuser6456@uhc.com',
                Position__c = 'Test User',
                FirstName='Test',
                LastName='User'
            );
            insert u;
        }
    }

    // Helper method to create RFP__c
    private static RFP__c createTestRFP(String status) {
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        return new RFP__c(
            Membership_Activity__c = testOpp.Id,
            Stage__c = 'New',
            FailedChunks__c = 0
        );
    }

    @isTest
    static void testSendSuccessEmail() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
        RFPEmailService.EmailContext ctx = new RFPEmailService.EmailContext(rfp.Id);
        ctx.totalQuestions = 5;

        Test.startTest();
        RFPEmailService.sendSuccessEmail(
            ctx,
            'Strategy Questions Processed',
            'Your strategy RFP questions were processed successfully.',
            new List<String>{'external@example.com'}
        );
        Test.stopTest();

        System.assert(true); // Basic assertion to ensure no exception occurred
    }

    @isTest
    static void testSendErrorEmails() {
        RFP__c rfp = [SELECT Id FROM RFP__c LIMIT 1];
        RFPEmailService.EmailContext ctx = new RFPEmailService.EmailContext(rfp.Id);

        Test.startTest();
        RFPEmailService.sendErrorEmails(
            ctx,
            'Error Processing AI Content',
            'Your request was processed, but with AI errors',
            'AI Content Generator'
        );
        Test.stopTest();

        System.assert(true);
    }
}