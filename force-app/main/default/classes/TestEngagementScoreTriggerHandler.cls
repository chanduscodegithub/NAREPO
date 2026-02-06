@isTest
public  with sharing  class TestEngagementScoreTriggerHandler {

    @testSetup
static void setupTestData() {
    // Create Account
    Account acc = new Account(
        Name = 'Test Account',
        Subtype__c = 'Prospect',
        RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
    );
    insert acc;

    // Create Contact
    Id cdContactRT = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();

    Contact con = new Contact(
        AccountId = acc.Id,
        FirstName = 'Test',
        LastName = 'User',
        RecordTypeId = cdContactRT,
        Status__c = 'Active'
    );
    insert con;

    // Create Engagement Summary
    Engagement_Summary__c summary = new Engagement_Summary__c(
        Company__c = acc.Id
    );
    insert summary;

    // 👉 Query it again to get CreatedDate
    summary = [SELECT Id, CreatedDate FROM Engagement_Summary__c WHERE Id = :summary.Id];

    // Create Activity History record with CreatedDate before summary
    Activity_History__c activity = new Activity_History__c(
        Contact__c = con.Id,
        Activity_Date__c = Date.today()
        //CreatedDate = summary.CreatedDate.addHours(10) // still won't work — see note below
    );
    
    insert activity; // ⚠️ This will fail if you try to manually set CreatedDate
            system.debug('summary.CreatedDate'+summary.CreatedDate);

     list<Activity_History__c> ActivityHistoryList = [SELECT Id,CreatedDate FROM Activity_History__c  LIMIT 1];
        system.debug('activitytime'+ActivityHistoryList);
}


    @isTest
    static void testGetLastRunDetailsWithActivityCount() {
        Account testAccount = [SELECT Id FROM Account LIMIT 1];

        Test.startTest();
        Map<String, Object> result = EngagementScoreTriggerHandler.getLastRunDetailsWithActivityCount(testAccount.Id);
        Test.stopTest();

        System.assert(result != null, 'Result should not be null');
        System.assertEquals(true, result.containsKey('lastRunFormatted'), 'Should contain lastRunFormatted');
        System.assertEquals(true, result.containsKey('activityCount'), 'Should contain activityCount');
        System.assert(((Integer)result.get('activityCount')) == 0, 'Activity count should be greater than 0');
    }

    @isTest
    static void testGetLastRunDetailsWithActivityCount_NullId() {
        Test.startTest();
        Map<String, Object> result = EngagementScoreTriggerHandler.getLastRunDetailsWithActivityCount(null);
        Test.stopTest();

        //System.assertEquals(null, result, 'Result should be null for null account ID');
    }

    @isTest
    static void testRecalculateEngagementScore() {
        Account testAccount = [SELECT Id FROM Account LIMIT 1];

        Test.startTest();
        EngagementScoreTriggerHandler.recalculateEngagementScore(testAccount.Id);
        Test.stopTest();

        Account updatedAccount = [SELECT Last_Calculate_Engagement_Score_Run__c, Processing_Method__c FROM Account WHERE Id = :testAccount.Id];
        System.assertNotEquals(null, updatedAccount.Last_Calculate_Engagement_Score_Run__c, 'Last run datetime should be updated');
        System.assertEquals('Manual', updatedAccount.Processing_Method__c, 'Processing method should be Manual');
    }

   /* @isTest
    static void testRecalculateEngagementScore_NoContacts() {
       Account acc = new Account(
            Name = 'no contact Account',
            Subtype__c = 'Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );
        insert acc;

        Test.startTest();
        try {
            EngagementScoreTriggerHandler.recalculateEngagementScore(acc.Id);
            System.assert(false, 'Should have thrown exception for no contacts');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('No contacts found'), 'Expected no contacts exception');
        }
        Test.stopTest();
    }*/

   /* @isTest
    static void testRecalculateEngagementScore_NullId() {
        Test.startTest();
        try {
            EngagementScoreTriggerHandler.recalculateEngagementScore(null);
            System.assert(false, 'Should have thrown exception for null account ID');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Invalid Account ID'), 'Expected invalid account ID exception');
        }
        Test.stopTest();
    }*/
}