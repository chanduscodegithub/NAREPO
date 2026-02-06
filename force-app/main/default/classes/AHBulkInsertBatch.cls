/*
*********************************************************
Apex Class Name    : EngagementScoreBatch
Created Date       : Feb 12, 2025
@description       : .....
@author            : Satheesh Chandrasekar
Modification Log:
Ver   Date         Author                               Modification
1.0   13-02-2025   Satheesh Chandrasekar                Initial Version
2.0   16-02-2025   Satheesh Chandrasekar                All methods have been updated to reflect changes in the Activity_History__c object.

*********************************************************
*/
public with sharing class AHBulkInsertBatch implements Database.Batchable<Activity_History__c>, Database.Stateful, Database.AllowsCallouts {
    public final Date startDate;
    public final Date endDate;
    public Boolean hasFailed = false; // Track batch failure
    public List<String> errorMessages = new List<String>(); // Store all error messages
    public Set<Id> contactQuerySet= new Set<Id>();
    
    
    public AHBulkInsertBatch(Date sDate, Date eDate) {
        this.startDate = sDate;
        this.endDate = eDate;
    }
    
    /**
* Generates weekly date ranges between startDate and endDate.
*/
    public Iterable<Activity_History__c> start(Database.BatchableContext info) {
        
        // Maps for storing reference data
        Map<String, Channel_Activity__c> channelActivityByUniqueKey = new Map<String, Channel_Activity__c>();
        Map<String, Channel_Activity__c> channelActivityById = new Map<String, Channel_Activity__c>();
        
        // Fetch Channel Activity records
        for (Channel_Activity__c ca : [
            SELECT Id, Unique_Key__c, Per_Activity_Score__c, Parent_Channel_Activity_Weightage__c, Activity_Type__c
            FROM Channel_Activity__c LIMIT 2000
        ]) {
            channelActivityByUniqueKey.put(ca.Unique_Key__c, ca);
            channelActivityById.put(ca.Id, ca);
        }
        
        System.debug('Channel Activity Data Loaded: ' + channelActivityByUniqueKey.size());
        
        // Fetch Tasks, Events, and Campaign Members within date range
        List<Task> tasks = [
            SELECT Id, WhoId, Type, Status, ActivityDate
            FROM Task
            WHERE ActivityDate >= :startDate AND ActivityDate <= :endDate AND WhoId != null
        ];
        
        List<Event> events = [
            SELECT Id, Subject, ActivityDate, WhoId, Status__c,Type
            FROM Event
            WHERE ActivityDate >= :startDate AND ActivityDate <= :endDate AND WhoId != null
        ];
        system.debug('eventslist'+events);
        List<CampaignMember> campaignMembers = [
            SELECT Id, ContactId, CampaignId, RecordType.Name, Response_Status__c, CreatedDate
            FROM CampaignMember
            WHERE CreatedDate >= :startDate AND CreatedDate <= :endDate
        ];
        
        System.debug('Fetched Tasks: ' + tasks.size() + ', Events: ' + events.size() + ', Campaign Members: ' + campaignMembers.size());
        
        // Set for tracking unique activity keys
        Set<String> uniqueActivityKeys = new Set<String>();
        
        // Populate Unique Keys for Tasks and Events
        Map<Id, List<Id>> taskContactMap = new Map<Id, List<Id>>();
        Map<Id, Task> TaskMap = new Map<Id, Task>(tasks);
        for (TaskRelation t : [
            SELECT TaskId, RelationId FROM TaskRelation WHERE TaskId IN :TaskMap.keySet() AND Relation.Type = 'Contact'
        ]) {
            if (!taskContactMap.containsKey(t.TaskId)) {
                taskContactMap.put(t.TaskId, new List<Id>());
            }
            taskContactMap.get(t.TaskId).add(t.RelationId);
        }
        
        for (Task t : tasks) {
            
            List<Id> contacts = taskContactMap.get(t.Id) != null ? taskContactMap.get(t.Id) : new List<Id>();
            String Status = (t.status != null && t.type != null) ? t.status : 'Open';
            
            for (Id cId : contacts) {
                uniqueActivityKeys.add(t.Id + '_' + Status + '_' + cId);
            }
            
        }
        
        //event
        Map<Id, List<Id>> eventContactMap = new Map<Id, List<Id>>();
        Map<Id, Event> EventMap = new Map<Id, Event>(events);
        for (EventRelation er : [
            SELECT EventId, RelationId FROM EventRelation WHERE EventId IN :EventMap.keySet() AND Relation.Type = 'Contact'
        ]) {
            if (!eventContactMap.containsKey(er.EventId)) {
                eventContactMap.put(er.EventId, new List<Id>());
            }
            eventContactMap.get(er.EventId).add(er.RelationId);
        }
        for (Event evt : events) {
            
            List<Id> contacts = eventContactMap.get(evt.Id) != null ? eventContactMap.get(evt.Id) : new List<Id>();
            String Status = evt.Status__c != null ? evt.Status__c : 'Attended';
            
            for (Id cId : contacts) {
                uniqueActivityKeys.add(evt.Id + '_' + Status + '_' + cId);
            }
            
        }
        
        // Process Campaign Members & track unique activity keys
        for (CampaignMember cm : campaignMembers) {
            String key = 'Campaign_' + cm.RecordType.Name + '_' + cm.Response_Status__c;
            uniqueActivityKeys.add(cm.Id + '_' + cm.Response_Status__c + '_' + cm.ContactId);
            
            // Traverse hierarchy if Parent Activity exists
            while (channelActivityByUniqueKey.containsKey(key) &&
                   channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c != null &&
                   channelActivityById.containsKey(channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c)) {
                       
                       String parentStatus = channelActivityById.get(channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c).Activity_Type__c;
                       uniqueActivityKeys.add(cm.Id + '_' + parentStatus+ '_' + cm.ContactId);
                       key = 'Campaign_' + cm.RecordType.Name + '_' + parentStatus;
                   }
        }
        
        // Fetch existing Activity History records
        Map<String, Activity_History__c> activityHistoryByUniqueKey = new Map<String, Activity_History__c>();
        for (Activity_History__c ah : [
            SELECT Id, Unique_Key_with_ContactId__c
            FROM Activity_History__c
            WHERE Unique_Key_with_ContactId__c IN :uniqueActivityKeys
        ]) {
            activityHistoryByUniqueKey.put(ah.Unique_Key_with_ContactId__c, ah);
        }
        
        System.debug('Existing Activity History Records: ' + activityHistoryByUniqueKey.size());
        
        // Prepare new Activity History records
        List<Activity_History__c> newActivityHistories = new List<Activity_History__c>();
        
        for (Task t : tasks) {
            
            
            List<Id> contacts = taskContactMap.get(t.Id) != null ? taskContactMap.get(t.Id) : new List<Id>();
            String Status = (t.status != null && t.type != null) ? t.status : 'Open';
            String taskType = t.Type != null ? t.Type : 'Email - Account Specific';
            
            
            for (Id cId : contacts) {                
                
                
                String uniqueKey = t.Id + '_' + Status + '_' + cId;
                if (channelActivityByUniqueKey.containsKey('Task_' + taskType + '_' + Status) && !activityHistoryByUniqueKey.containsKey(uniqueKey)) {
                    //newActivityHistories.add(createActivityHistory('Task', taskType, Status, t.WhoId, t.Id, channelActivityByUniqueKey));
                    
                    Activity_History__c ActivityHistoryIns = new Activity_History__c();
                    ActivityHistoryIns.Channel_Category__c = 'Task';
                    ActivityHistoryIns.Channel__c =  taskType;
                    ActivityHistoryIns.Activity__c = Status;
                    ActivityHistoryIns.Contact__c = cId;
                    ActivityHistoryIns.Connected_Object_Lookup_Id__c = t.Id;
                    ActivityHistoryIns.Activity_Date__c = DateTime.newInstance(t.ActivityDate.year(), t.ActivityDate.month(), t.ActivityDate.day());
                    ActivityHistoryIns.Activity_Score__c = channelActivityByUniqueKey.containsKey('Task_' + taskType + '_' + Status) ? 
                        channelActivityByUniqueKey.get('Task_' + taskType + '_' + Status).Per_Activity_Score__c : 0;
                    
                    
                    newActivityHistories.add(ActivityHistoryIns);
                    
                }
            }
        }
        
        for (Event evt : events) {
            
            
            List<Id> contacts = eventContactMap.get(evt.Id) != null ? eventContactMap.get(evt.Id) : new List<Id>();
            String Status = evt.Status__c != null ? evt.Status__c : 'Attended';
            String evtType = evt.Type != null ? evt.Type : 'Virtual Meeting - Account Specific';
            
            
            for (Id cId : contacts) {
                
                
                String uniqueKey = evt.Id + '_' + Status + '_' + cId;
                
                if (channelActivityByUniqueKey.containsKey('Event_' + evtType + '_' + Status) && !activityHistoryByUniqueKey.containsKey(uniqueKey)) {
                    Activity_History__c ActivityHistoryIns = new Activity_History__c();
                    ActivityHistoryIns.Channel_Category__c = 'Event';
                    ActivityHistoryIns.Channel__c =  evtType;
                    ActivityHistoryIns.Activity__c = Status;
                    ActivityHistoryIns.Contact__c = cId;
                    ActivityHistoryIns.Connected_Object_Lookup_Id__c = evt.Id; 
                    ActivityHistoryIns.Activity_Date__c = DateTime.newInstance(evt.ActivityDate.year(), evt.ActivityDate.month(), evt.ActivityDate.day());
                    ActivityHistoryIns.Activity_Score__c = channelActivityByUniqueKey.containsKey('Event_' + evtType + '_' + Status) ? 
                        channelActivityByUniqueKey.get('Event_' + evtType + '_' + Status).Per_Activity_Score__c : 0;
                    
                    
                    newActivityHistories.add(ActivityHistoryIns);
                }
            }
        }
        
        for (CampaignMember cm : campaignMembers) {
            String key = 'Campaign_' + cm.RecordType.Name + '_' + cm.Response_Status__c;
            String uniqueKey = cm.Id + '_' + cm.Response_Status__c + '_' + cm.ContactId;
            
            if (!activityHistoryByUniqueKey.containsKey(uniqueKey) && channelActivityByUniqueKey.containsKey(key)) {
                // newActivityHistories.add(createActivityHistory('Campaign', cm.RecordType.Name, cm.Response_Status__c, cm.ContactId, cm.Id, channelActivityByUniqueKey));
                Activity_History__c ActivityHistoryIns = new Activity_History__c();
                ActivityHistoryIns.Channel_Category__c = 'Campaign';
                ActivityHistoryIns.Channel__c =  cm.RecordType.name;
                ActivityHistoryIns.Activity__c = cm.Response_Status__c;
                ActivityHistoryIns.Contact__c = cm.ContactId;
                ActivityHistoryIns.Campaign__c = cm.CampaignId;
                ActivityHistoryIns.Connected_Object_Lookup_Id__c = cm.Id;
                ActivityHistoryIns.Activity_Date__c = cm.CreatedDate;
                ActivityHistoryIns.Activity_Score__c = channelActivityByUniqueKey.containsKey('Campaign_' + cm.RecordType.name + '_' + cm.Response_Status__c) ? 
                    channelActivityByUniqueKey.get('Campaign_' + cm.RecordType.name + '_' + cm.Response_Status__c).Per_Activity_Score__c : 0;
                
                
                newActivityHistories.add(ActivityHistoryIns);
            }
            
            // Process hierarchical statuses
            while (channelActivityByUniqueKey.containsKey(key) &&
                   channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c != null &&
                   channelActivityById.containsKey(channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c)) {
                       
                       String parentStatus = channelActivityById.get(channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c).Activity_Type__c;
                       String parentUniqueKey = cm.Id + '_' + parentStatus + '_' +cm.ContactId;
                       Decimal parentScore = channelActivityById.get(channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c).Per_Activity_Score__c;
                       
                       if (!activityHistoryByUniqueKey.containsKey(parentUniqueKey)) {
                           //newActivityHistories.add(createActivityHistory('Campaign', cm.RecordType.Name, parentStatus, cm.ContactId, cm.Id, parentScore));
                           
                           Activity_History__c ActivityHistoryIns = new Activity_History__c();
                           ActivityHistoryIns.Channel_Category__c = 'Campaign';
                           ActivityHistoryIns.Channel__c =  cm.RecordType.name;
                           ActivityHistoryIns.Activity__c = parentStatus;
                           ActivityHistoryIns.Contact__c = cm.ContactId;
                           ActivityHistoryIns.Campaign__c = cm.CampaignId;
                           ActivityHistoryIns.Connected_Object_Lookup_Id__c = cm.Id;
                           ActivityHistoryIns.Activity_Date__c = cm.CreatedDate;
                           ActivityHistoryIns.Activity_Score__c = parentScore;
                           
                           newActivityHistories.add(ActivityHistoryIns);
                       }
                       
                       key = 'Campaign_' + cm.RecordType.Name + '_' + parentStatus;
                   }
        }
        system.debug('total size'+newActivityHistories.size());
        
        
        
        
        
        return newActivityHistories;
    }
    
    /**
* Processes engagement data for each weekly date range.
*/
    public void execute(Database.BatchableContext BC, List<Activity_History__c> scope) {
        try {
            System.debug('inside 2nd batch execute.');
            Set<Id> contactIdSet = new Set<Id>();
            for (Activity_History__c record : scope) {
                contactIdSet.add(record.Contact__c);
            }
            contactQuerySet.addAll(contactIdSet);
            
            insert scope;
        }  catch (Exception e) {
            hasFailed = true; 
            errorMessages.add(e.getMessage() + '\nStackTrace: ' + e.getStackTraceString()); 
            System.debug('Batch failed: ' + e.getMessage());
        }
    }
    
    
    
    public void finish(Database.BatchableContext BC) {
        System.debug('Inside finish method.');
        if (hasFailed) {
            sendFailureEmail(BC.getJobId()); // Send email with job details
        }
        else if (!contactQuerySet.isEmpty()) {
            Integer EngagmentScoreProcessorBatchSize = Integer.valueOf(System.Label.EngagmentScoreProcessorBatchSize);
            EngagementScoreBulkInsertBatch batchJob = new EngagementScoreBulkInsertBatch('Activity_Date__c',startDate,endDate,contactQuerySet,'Batch',false);
            Database.executeBatch(batchJob, EngagmentScoreProcessorBatchSize); // Adjust the batch size
        } 
    }
    
    private void sendFailureEmail(String jobId) {
        String subject = '⚠️ Engagement Score Batch Failed - Job ID: ' + jobId;
        String body = 'The Engagement Score batch job has failed.\n\n';
        body += 'Job ID: ' + jobId + '\n';
        body += 'Error Count: ' + errorMessages.size() + '\n\n';
        
        for (String errorMessage : errorMessages) {
            body += 'Error Details: ' + errorMessage + '\n\n';
        }
        // Fetch email from Custom Label
        String emailRecipients = System.Label.Batch_Error_Notification_Email; // Custom Label Name
        
        if (String.isBlank(emailRecipients)) {
            System.debug('⚠️ No email recipient found in custom label.');
            return; // Exit if no email is set
        }
        
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        //mail.setToAddresses(new String[]{'admin@example.com', 'support@example.com'}); // Add multiple recipients
        //mail.setToAddresses(new String[]{'satheesh.chandrasekar@crmit.com'}); // Add multiple recipients
        mail.setToAddresses(emailRecipients.split(',')); // Support multiple emails separated by comma
        //mail.setCcAddresses(new String[]{'manager@example.com'}); // Add CC recipients if needed
        mail.setSubject(subject);
        mail.setPlainTextBody(body);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[]{mail});
    }
    
    
}