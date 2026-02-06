@isTest
public with sharing class AHBulkInsertBatchTest {

    @testSetup
    static void setupTestData() {
        // Create Account
        Account acc = new Account(
            Name = 'Test Account',
            Subtype__c = 'Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );
        insert acc;

        Id cdContactRT = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();

        // Active Contact
        Contact activeContact = new Contact(
            AccountId = acc.Id,
            FirstName = 'Test',
            LastName = 'User',
            RecordTypeId = cdContactRT,
            Status__c = 'Active'
        );
        insert activeContact;

      /*  // Inactive Contact (should be skipped)
        Contact inactiveContact = new Contact(
            AccountId = acc.Id,
            FirstName = 'Inactive',
            LastName = 'User',
            RecordTypeId = cdContactRT,
            Status__c = 'Inactive',
            InactiveStatusReason__c = 'Left Company'
        );
        insert inactiveContact;*/

        // Channels
        Channel__c taskChannel = new Channel__c(Name = 'Phone Conversations - Account Specific', Channel_Category__c = 'Task', Channel_Name__c = 'Phone Conversations - Account Specific', Weightage__c = 10);
        Channel__c eventChannel = new Channel__c(Name = 'Executive Meeting', Channel_Category__c = 'Event', Channel_Name__c = 'Executive Meeting', Weightage__c = 5);
        Channel__c campaignChannel = new Channel__c(Name = 'Newsletters', Channel_Category__c = 'Campaign', Channel_Name__c = 'Newsletters', Weightage__c = 3);
        insert new List<Channel__c>{taskChannel, eventChannel, campaignChannel};

        // Channel Activities
              Channel_Activity__c campaignActivityChannel = new Channel_Activity__c(Name = 'Sent-Newsletters', Channel__c = campaignChannel.Id, Activity_Type__c = 'Sent', Weightage__c = 20);

        insert new List<Channel_Activity__c>{
            new Channel_Activity__c(Name = 'Completed(Positive Outcome) - Phone Conversations - Account Specific', Channel__c = taskChannel.Id, Activity_Type__c = 'Completed', Weightage__c = 100),
            new Channel_Activity__c(Name = 'Attended-Executive Meeting', Channel__c = eventChannel.Id, Activity_Type__c = 'Attended', Weightage__c = 80),
			campaignActivityChannel
        };
  insert new List<Channel_Activity__c>{
      new Channel_Activity__c(Name = 'Sent-Newsletters', Channel__c = campaignChannel.Id, Activity_Type__c = 'Forwarded', Weightage__c = 60,Parent_Channel_Activity_Weightage__c=campaignActivityChannel.Id)
        };


      /*  // Create Engagement Score records
        List<Contact_Engagement_Score__c> engagementScores = new List<Contact_Engagement_Score__c>();
        engagementScores.add(new Contact_Engagement_Score__c(
            Contact_Consultant__c = activeContact.Id,
            Start_Date__c = Date.today().addDays(-14),
            End_Date__c = Date.today().addDays(-7),
            Overall_Score__c = 10,
            Is_Temporary__c = false
        ));
        
           
        
      
        insert engagementScores;

        // Create Channel records
        List<Contact_Channel_Score__c> channelScores = new List<Contact_Channel_Score__c>();
        channelScores.add(new Contact_Channel_Score__c(
            Contact_Consultant__c = activeContact.Id,
            Engagement_Score__c =engagementScores[0].Id,
            Start_Date__c = Date.today().addDays(-14),
            End_Date__c = Date.today().addDays(-7),
            Channel_Name__c = 'Email',
            Score__c = 20,
            Is_Temporary__c = false
        ));
        
        
      
        insert channelScores;

        // Create Timeline records
        List<Channel_Score_Timeline__c> timelines = new List<Channel_Score_Timeline__c>();
        timelines.add(new Channel_Score_Timeline__c(
            Contact_Consultant__c = activeContact.Id,
           Start_Date__c = Date.today().addDays(-14),
            End_Date__c = Date.today().addDays(-7),
            Channel_Name__c = 'Email',
            Score__c = 20,
            Is_Temporary__c =false
           
        ));*/
        
       
      //  insert timelines;
        // Task (match Channel Activity)
        insert new Task(
            WhoId = activeContact.Id,
            Status = 'Completed',
            Type = 'Phone Conversations - Account Specific',
            ActivityDate = Date.today().addDays(-1)
        );

        // Task (no matching Channel Activity – should be skipped)
        insert new Task(
            WhoId = activeContact.Id,
            Status = 'Attended',
            Type = 'Executive Meeting',
            ActivityDate = Date.today().addDays(-1)
        );

        // Event with null Status__c (should default to Attended)
        insert new Event(
            WhoId = activeContact.Id,
            Type = 'Executive Meeting',
            Status__c = null,
            StartDateTime = Datetime.now().addDays(-1),
            EndDateTime = Datetime.now().addDays(-1).addHours(1),
            ActivityDate = Date.today().addDays(-1)
        );

        // Campaign Member with matching Response_Status__c
        Campaign camp = new Campaign(
            Name = 'Newsletters',
            RecordTypeId = Schema.SObjectType.Campaign.getRecordTypeInfosByName().get('Newsletters').getRecordTypeId()
           
        );
        insert camp;

        insert new CampaignMember(
            CampaignId = camp.Id,
            ContactId = activeContact.Id,
            Response_Status__c = 'Forwarded'
        );

          List<Activity_History__c> activitiesDelList = [SELECT Id, Unique_Key__c FROM Activity_History__c];
        Delete activitiesDelList;
        //System.debug('Activity History created: ' + activities);
        
        // Activity_History__c to simulate duplicate
       /* insert new Activity_History__c(
            Contact__c = activeContact.Id,
            Activity_Date__c = Date.today().addDays(-1),
            Activity__c = 'Call',
            Channel__c = taskChannel.Id,
            Channel_Category__c = 'Task'
            //Unique_Key__c = 'Task_Call_Completed_' + activeContact.Id + '_' + Date.today().addDays(-1)
        );*/
    }

    @isTest
    static void testEngagementScoreBatchExecution() {
        //EngagementScoreBatch batch = new EngagementScoreBatch(Date.today().addDays(-5),Date.today().addDays(1));
        
        Date startDate = Date.today().addDays(-5);
        Date endDate = Date.today().addDays(2);
        Test.startTest();
        Database.executeBatch(new AHBulkInsertBatch(startDate, endDate));
        //Database.executeBatch(new EngagementScoreBatch(),1,null);
        Test.stopTest();

        List<Activity_History__c> activities = [SELECT Id, Unique_Key__c FROM Activity_History__c];
        System.debug('Activity History created: ' + activities);

        // We inserted:
        // - 1 Task with existing duplicate (should skip)
        // - 1 Task with no Channel_Activity__c (skipped)
        // - 1 Event (null status, defaults to "Attended") – match
        // - 1 CampaignMember – match
        System.assertEquals(4, activities.size(), '2 new activity history records should be created');

       /* List<Contact_Engagement_Score__c> scores = [SELECT Id, Overall_Score__c FROM Contact_Engagement_Score__c];
        System.assert(!scores.isEmpty(), 'Engagement scores should be created or updated.');

        List<Contact_Channel_Score__c> channelScores = [SELECT Id, Score__c FROM Contact_Channel_Score__c];
        System.assert(!channelScores.isEmpty(), 'Channel scores should be created or updated.');*/
    }
}