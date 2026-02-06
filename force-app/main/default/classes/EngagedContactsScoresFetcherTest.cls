@isTest
public with sharing class EngagedContactsScoresFetcherTest {
    
    @isTest
    static void testWithEngagedContacts() {
        // Setup test account
        Account acc = new Account(
            Name = 'Test Account',
            Subtype__c = 'Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );
        insert acc;
        
                  Id cdContactRT = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();

        // Create test contacts
        List<Contact> contacts = new List<Contact>();
        for (Integer i = 0; i < 3; i++) {
            contacts.add(new Contact(FirstName = 'Test', LastName = 'Contact' + i, AccountId = acc.Id, RecordTypeId = cdContactRT,
                                     Status__c = 'Active'));       
        }
        insert contacts;

        // Create engagement scores
        List<Contact_Engagement_Score__c> scores = new List<Contact_Engagement_Score__c>();
        for (Integer i = 0; i < 3; i++) {
            scores.add(new Contact_Engagement_Score__c(
                Contact_Consultant__c = contacts[i].Id,
                Overall_Score__c = 25 + i,
                End_Date__c = Date.today().addDays(-i)
            ));
        }
        insert scores;

        // Create request
        EngagedContactsScoresFetcher.Request req = new EngagedContactsScoresFetcher.Request();
        req.account = acc;

        // Call method
        List<EngagedContactsScoresFetcher.Response> responses = 
            EngagedContactsScoresFetcher.getPrompt(new List<EngagedContactsScoresFetcher.Request>{ req });

        // Assert output
        System.assertEquals(1, responses.size(), 'Should return one response');
        String prompt = responses[0].Prompt;
        System.assert(prompt.contains('Engaged Contacts:'), 'Should contain header');
        System.assert(prompt.contains('25'), 'Should contain score');
    }

    @isTest
    static void testWithNoContacts() {
        // Setup test account with no contacts
        Account acc = new Account(
            Name = 'Test Account',
            Subtype__c = 'Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );
        insert acc;

        // Create request
        EngagedContactsScoresFetcher.Request req = new EngagedContactsScoresFetcher.Request();
        req.account = acc;

        // Call method
        List<EngagedContactsScoresFetcher.Response> responses = 
            EngagedContactsScoresFetcher.getPrompt(new List<EngagedContactsScoresFetcher.Request>{ req });

        // Assert
        System.assertEquals(1, responses.size(), 'Should return one response');
        System.assert(responses[0].Prompt.contains('No engagement scores'), 'Should mention no scores');
    }

    @isTest
    static void testWithContactsButNoScores() {
        // Setup test account
        Account acc = new Account(
            Name = 'Test Account',
            Subtype__c = 'Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );
        insert acc;

        Id cdContactRT = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();

        // Create contacts without engagement scores
        List<Contact> contacts = new List<Contact>();
        for (Integer i = 0; i < 2; i++) {
            contacts.add(new Contact(FirstName = 'Test', LastName = 'Contact' + i, AccountId = acc.Id, RecordTypeId = cdContactRT,        
                                    Status__c = 'Active'));   
        }
        insert contacts;

        // Create request
        EngagedContactsScoresFetcher.Request req = new EngagedContactsScoresFetcher.Request();
        req.account = acc;

        // Call method
        List<EngagedContactsScoresFetcher.Response> responses = 
            EngagedContactsScoresFetcher.getPrompt(new List<EngagedContactsScoresFetcher.Request>{ req });

        // Assert
        System.assertEquals(1, responses.size(), 'Should return one response');
        System.assert(responses[0].Prompt.contains('No engagement scores'), 'Should mention no scores');
    }
}