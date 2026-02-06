@isTest
public with sharing class EngagementScoreProcessorTest {
    
    @testSetup
    static void setupTestData() {
        // Create Account
        Account accCD = new Account();
        accCD.Name = 'Competitive Medical CD';
        accCD.Subtype__c = 'Prospect';
        accCD.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCD;

        // Get Record Type Id for Contact
        Id CDContactRecord = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();

        // Create Active Contact
        Contact a = new Contact();
        a.AccountId = accCD.Id;
        a.CEO__c = false;
        a.FirstName = 'test qwerty';
        a.LastName = 'lasr qwerty';
        a.OtherCountry = 'United States';
        a.RecordTypeId = CDContactRecord;
        a.Status__c = 'Active';
        insert a;
        System.debug('Active Contact ID: ' + a.Id);

        // Create Inactive Contact
        Contact b = new Contact();
        b.AccountId = accCD.Id;
        b.CEO__c = false;
        b.FirstName = 'test qwerty2';
        b.LastName = 'lasr qwerty2';
        b.OtherCountry = 'United States';
        b.RecordTypeId = CDContactRecord;
        b.Status__c = 'Inactive';
        b.InactiveStatusReason__c = 'Duplicate';
        insert b;
        System.debug('Inactive Contact ID: ' + b.Id);

        // Create test Activity_History__c records
        List<Activity_History__c> activities = new List<Activity_History__c>();
        activities.add(new Activity_History__c(
            Contact__c = a.Id,
            Activity_Score__c = 10,
            Channel__c = 'Email',
            Activity__c = 'Open',
            Activity_Date__c = Date.today()
        ));
        /*activities.add(new Activity_History__c(
            Contact__c = b.Id,
            Activity_Score__c = 5,
            Channel__c = 'Phone',
            Activity__c = 'Call',
            Activity_Date__c = Date.today()
        ));*/
        insert activities;

        // Create Engagement Score records
        List<Contact_Engagement_Score__c> engagementScores = new List<Contact_Engagement_Score__c>();
        engagementScores.add(new Contact_Engagement_Score__c(
            Contact_Consultant__c = a.Id,
            Start_Date__c = Date.today().addDays(-14),
            End_Date__c = Date.today().addDays(-7),
            Overall_Score__c = 10,
            Is_Temporary__c = false
        ));
        
           
        
       /* engagementScores.add(new Contact_Engagement_Score__c(
            Contact_Consultant__c = b.Id,
            Start_Date__c = Date.today().addDays(-7),
            End_Date__c = Date.today(),
            Overall_Score__c = 30,
            Is_Temporary__c = true
        ));*/
        insert engagementScores;

        // Create Channel records
        List<Contact_Channel_Score__c> channelScores = new List<Contact_Channel_Score__c>();
        channelScores.add(new Contact_Channel_Score__c(
            Contact_Consultant__c = a.Id,
            Engagement_Score__c =engagementScores[0].Id,
            Start_Date__c = Date.today().addDays(-14),
            End_Date__c = Date.today().addDays(-7),
            Channel_Name__c = 'Email',
            Score__c = 20,
            Is_Temporary__c = false
        ));
        
        
       /* channelScores.add(new Contact_Channel_Score__c(
            Contact_Consultant__c = b.Id,
            Start_Date__c = Date.today().addDays(-14),
            End_Date__c = Date.today().addDays(-7),
            Channel_Name__c = 'Phone',
            Score__c = 15,
            Is_Temporary__c = false

        ));*/
        insert channelScores;

        // Create Timeline records
        List<Channel_Score_Timeline__c> timelines = new List<Channel_Score_Timeline__c>();
        timelines.add(new Channel_Score_Timeline__c(
            Contact_Consultant__c = a.Id,
           Start_Date__c = Date.today().addDays(-14),
            End_Date__c = Date.today().addDays(-7),
            Channel_Name__c = 'Email',
            Score__c = 20,
            Is_Temporary__c =false
           
        ));
        
        /*timelines.add(new Engagement_Timeline__c(
            Contact__c = b.Id,
            Activity_Date__c = Date.today(),
            Activity_Type__c = 'Phone Call',
            Score__c = 5
        ));*/
        insert timelines;

        System.debug('Setup test data completed.');
    }
    
    @isTest
    static void testProcessEngagementScores() {
        // Arrange
        List<Contact> contacts = [SELECT Id FROM Contact LIMIT 5];
        Set<Id> contactIds = new Set<Id>();
        for (Contact contact : contacts) {
            contactIds.add(contact.Id);
        }
        
        Date startDate = Date.today().addDays(-7);
        Date endDate = Date.today();
        String activityHistoryDynamicDateField = 'Activity_Date__c';
        String processingMethod = 'Batch';

        // Act
        Test.startTest();
        EngagementScoreProcessor.processEngagementScores(
            activityHistoryDynamicDateField, 
            startDate, 
            endDate, 
            contactIds, 
            processingMethod
        );
        Test.stopTest();

        // Assert
        List<Contact_Engagement_Score__c> engagementScores = [SELECT Id, Contact_Consultant__c, Overall_Score__c FROM Contact_Engagement_Score__c];
system.debug('engagementscore count--'+engagementScores);
        System.assert(!engagementScores.isEmpty(), 'Engagement scores should be created.');
        System.assertEquals(2, engagementScores.size(), 'There should be 5 engagement scores.');
    }
    
    @isTest
    static void testGetStartOfDay() {
        // Arrange
        Date inputDate = Date.newInstance(2025, 4, 25);
        
        // Recreate same logic as method under test
        Datetime expected = Datetime.newInstance(inputDate.year(), inputDate.month(), inputDate.day(), 0, 0, 0);
        expected = expected.addSeconds(UserInfo.getTimeZone().getOffset(expected) / 1000);
        
        // Act
        Datetime startOfDay = EngagementScoreProcessor.getStartOfDay(inputDate);
        
        // Assert
        System.assertEquals(String.valueOf(expected), String.valueOf(startOfDay), 'Start of day should match expected value.');
    }



    
    @isTest
    static void testGetEndOfDay() {
        // Arrange
        Date inputDate = Date.newInstance(2025, 4, 25);
        
        // Recreate same logic as getEndOfDay method
        Datetime expected = Datetime.newInstance(inputDate.year(), inputDate.month(), inputDate.day(), 23, 59, 59);
        expected = expected.addSeconds(UserInfo.getTimeZone().getOffset(expected) / 1000);
        
        // Act
        Datetime endOfDay = EngagementScoreProcessor.getEndOfDay(inputDate);
        
        // Assert
        System.assertEquals(String.valueOf(expected), String.valueOf(endOfDay), 'End of day should match expected value.');
    }

    
    @isTest
    static void testDeleteTempRecordsByContactId() {
        // Arrange
        List<Contact> contacts = [SELECT Id FROM Contact LIMIT 2];
        Set<Id> contactIds = new Set<Id>();
        for (Contact contact : contacts) {
            contactIds.add(contact.Id);
        }

        // Create temporary records
        List<Contact_Engagement_Score__c> tempEngagementScores = new List<Contact_Engagement_Score__c>();
        for (Id contactId : contactIds) {
            tempEngagementScores.add(new Contact_Engagement_Score__c(
                Contact_Consultant__c = contactId,
                Start_Date__c = Date.today().addDays(-7),
                End_Date__c = Date.today(),
                Overall_Score__c = 50,
                Is_Temporary__c = true
            ));
        }
        insert tempEngagementScores;

        // Act
        Test.startTest();
        EngagementScoreProcessor.deleteTempRecordsByContactId(contactIds);
        Test.stopTest();

        // Assert
        List<Contact_Engagement_Score__c> remainingScores = [SELECT Id FROM Contact_Engagement_Score__c WHERE Is_Temporary__c = true];
        System.assert(remainingScores.isEmpty(), 'Temporary records should be deleted.');
    }
    
    @isTest
    static void testFetchCurrentContactWiseScores() {
        // Arrange
        Date startDate = Date.today().addDays(-7);
        Date endDate = Date.today();
        String activityHistoryDynamicDateField = 'Activity_Date__c';
        
        // Correctly initialize the Set<Id> from the query result
        List<Contact> contactList = [SELECT Id FROM Contact LIMIT 5];
        Set<Id> contactIds = new Set<Id>();
        for (Contact contact : contactList) {
            contactIds.add(contact.Id);
        }

        // Act
        List<EngagementScoreProcessor.activityWrapper> scores = EngagementScoreProcessor.fetchCurrentContactWiseScores(
            activityHistoryDynamicDateField, startDate, endDate, contactIds
        );

        // Assert
        System.assert(!scores.isEmpty(), 'Scores should be fetched.');
        System.assertEquals(1, scores.size(), 'There should be 5 scores.');
    }
    
    @isTest
    static void testFetchCurrentChannelWiseScores() {
        // Arrange
        Date startDate = Date.today().addDays(-7);
        Date endDate = Date.today();
        String activityHistoryDynamicDateField = 'Activity_Date__c';

        // Correctly initialize the Set<Id> from the query result
        List<Contact> contactList = [SELECT Id FROM Contact LIMIT 5];
        Set<Id> contactIds = new Set<Id>();
        for (Contact contact : contactList) {
            contactIds.add(contact.Id);
        }

        // Act
        List<EngagementScoreProcessor.activityWrapper> scores = EngagementScoreProcessor.fetchCurrentChannelWiseScores(
            activityHistoryDynamicDateField, startDate, endDate, contactIds
        );

        // Assert
        System.assert(!scores.isEmpty(), 'Channel-wise scores should be fetched.');
    }
    
    @isTest
    static void testFetchCurrentActivityWiseCount() {
        // Arrange
        Date startDate = Date.today().addDays(-7);
        Date endDate = Date.today();
        String activityHistoryDynamicDateField = 'Activity_Date__c';

        // Correctly initialize the Set<Id> from the query result
        List<Contact> contactList = [SELECT Id FROM Contact LIMIT 5];
        Set<Id> contactIds = new Set<Id>();
        for (Contact contact : contactList) {
            contactIds.add(contact.Id);
        }

        // Act
        List<Engagement_Activity_Metrics__c> metrics = EngagementScoreProcessor.fetchCurrentActivityWiseCount(
            activityHistoryDynamicDateField, startDate, endDate, contactIds, null
        );

        // Assert
        System.assert(!metrics.isEmpty(), 'Activity-wise metrics should be fetched.');
    }
}