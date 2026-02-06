@isTest
private with sharing class AccountEngagementPerformanceFetcherTest {
    @isTest
    static void testGetPromptWithActivities() {
        // Create test Account
        Account testAccount = new Account(
            Name = 'Test Account',
            Subtype__c = 'Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );
        insert testAccount;
        
        // Create Engagement_Activity_Metrics__c records
        // CHANGE 1: Added required fields Activity_Count__c and End_Date__c
        List<Engagement_Activity_Metrics__c> activities = new List<Engagement_Activity_Metrics__c>{
            new Engagement_Activity_Metrics__c(
                AccountId__c = testAccount.Id, 
                Channel__c = 'Email - Account Specific', 
                Activity__c = 'Open',
                Activity_Count__c = 5,               // Added required field
                End_Date__c = Date.today()           // Added required field
            ),
            new Engagement_Activity_Metrics__c(
                AccountId__c = testAccount.Id, 
                Channel__c = 'Onsite meeting at UHG', 
                Activity__c = 'Attended',
                Activity_Count__c = 2,               // Added required field
                End_Date__c = Date.today()           // Added required field
            ),
            new Engagement_Activity_Metrics__c(
                AccountId__c = testAccount.Id, 
                Channel__c = 'Phone Conversations - Account Specific', 
                Activity__c = 'Completed',
                Activity_Count__c = 3,               // Added required field
                End_Date__c = Date.today()           // Added required field
            )
        };
        insert activities;
        
        // Prepare Invocable Request
        AccountEngagementPerformanceFetcher.Request request = new AccountEngagementPerformanceFetcher.Request();
        request.account = testAccount;
        List<AccountEngagementPerformanceFetcher.Request> requestList = new List<AccountEngagementPerformanceFetcher.Request>{ request };
        
        // Call the method
        Test.startTest();
        List<AccountEngagementPerformanceFetcher.Response> result = AccountEngagementPerformanceFetcher.getPrompt(requestList);
        Test.stopTest();
        
        // Assertions
        System.assertEquals(1, result.size());
        String prompt = result[0].Prompt;
        System.debug('Prompt:\n' + prompt);
        System.assert(prompt.contains('Channel Performance Report for Account'), 'Prompt should contain report title');
        System.assert(prompt.contains('Email - Account Specific'), 'Prompt should contain Email channel');
        System.assert(prompt.contains('Open: 5'), 'Prompt should contain Open activity with count 5');
        System.assert(prompt.contains('Onsite meeting at UHG'), 'Prompt should contain Onsite meeting channel');
        System.assert(prompt.contains('Phone Conversations - Account Specific'), 'Prompt should contain Phone channel');
    }
    
    @isTest
    static void testGetPromptWithNoActivities() {
        // Create test Account
        Account testAccount = new Account(
            Name = 'Test Account',
            Subtype__c = 'Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );
        insert testAccount;
        // No Engagement_Activity_Metrics__c created
        
        // Prepare Invocable Request
        AccountEngagementPerformanceFetcher.Request request = new AccountEngagementPerformanceFetcher.Request();
        request.account = testAccount;
        List<AccountEngagementPerformanceFetcher.Request> requestList = new List<AccountEngagementPerformanceFetcher.Request>{ request };
        
        // Call the method
        Test.startTest();
        List<AccountEngagementPerformanceFetcher.Response> result = AccountEngagementPerformanceFetcher.getPrompt(requestList);
        Test.stopTest();
        
        // Assertions
        System.assertEquals(1, result.size());
        String prompt = result[0].Prompt;
        System.debug('Prompt:\n' + prompt);
        System.assert(prompt.contains('No engagement activities found for this account.'));
    }
}