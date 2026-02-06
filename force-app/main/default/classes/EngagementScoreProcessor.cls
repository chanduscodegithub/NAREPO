/*
*********************************************************
Apex Class Name    : EngagementScoreProcessor
Created Date       : Feb 12, 2025
@description       : .....
@author            : Satheesh Chandrasekar
Modification Log:
Ver   Date         Author                               Modification
1.0   13-02-2025   Satheesh Chandrasekar                Initial Version
2.0   16-02-2025   Satheesh Chandrasekar                All methods have been updated to reflect changes in the Activity_History__c object.

*********************************************************
*/
public with sharing class EngagementScoreProcessor {
    public static void processEngagementScores(String activityHistoryDynamicDateField, Date startDate, Date endDate, Set<Id> ContactTempSet, String processingMethod) {
        try {
            // Fetch activities and group by Contact
            //Map<Id, List<activityWrapper>> contactActivityMap = fetchGroupedActivityScores(activityHistoryDynamicDateField, eventDynamicDateField, campaignMemberDynamicDateField, startDate, endDate);
            Set<Id> ContactSet = new Set<Id>();
            system.debug('contacttempList'+ContactTempSet);
            List<activityWrapper> currentEngagementScores = fetchCurrentContactWiseScores(activityHistoryDynamicDateField, startDate, endDate,ContactTempSet);
            
            system.debug('currentEngagementScores-->'+currentEngagementScores);

            for (activityWrapper engagementScore : currentEngagementScores) {
                ContactSet.add(engagementScore.contactId);
            }
            system.debug('ContactSet-->'+ContactSet);


            // Delete temporary existing records
			deleteTempRecordsByContactId(ContactSet);
            // Get recent existing records
            // contactEngagementScoresWrapperWrapperIns
            contactEngagementScoresWrapper recentContactEngagementScoresWrapper = getRecentEngagementScores(ContactSet);
            Map<Id, Contact_Engagement_Score__c> recentEngagementScores = recentContactEngagementScoresWrapper.contactEngagementScoresMap;
            Set<Id> recentContactEngagementscoreIds = recentContactEngagementScoresWrapper.contactEngagementscoreIds;

           // Map<Id, Contact_Engagement_Score__c> recentEngagementScores = getRecentEngagementScores(ContactSet);
            ChannelScoresWrapper recentChannelScoresWrapper = getRecentChannelScores(recentContactEngagementscoreIds);
            Map<String, Contact_Channel_Score__c> recentChannelScores = recentChannelScoresWrapper.contactChannelScoresMap;
            Map<Id, Set<String>> contactChannelKeysMap = recentChannelScoresWrapper.contactChannelKeysMap;
            
            
            List<Contact_Engagement_Score__c> engagementScoreToUpsert = new List<Contact_Engagement_Score__c>();
            Map<Id, Contact_Engagement_Score__c> contactToEngagementScoreMap = new Map<Id, Contact_Engagement_Score__c>();
            
            List<Contact_Channel_Score__c> channelScoreToUpsert = new List<Contact_Channel_Score__c>();
            List<Channel_Score_Timeline__c> timelineList = new List<Channel_Score_Timeline__c>();
            
            
            
            for (activityWrapper engagementScore : CurrentEngagementScores) {
                
                Decimal overallScore = 0;
                
                Contact_Engagement_Score__c recentEngagementScore = recentEngagementScores.get(engagementScore.contactId);
                overallScore = engagementScore.Score;
                if (recentEngagementScore != null) {
                    // Update recent record
                    overallScore += recentEngagementScore.Overall_Score__c;
                }
                // Create new record
                Contact_Engagement_Score__c currentEngagementScore = new Contact_Engagement_Score__c(
                    Contact_Consultant__c = engagementScore.contactId,
                    Start_Date__c = startDate,
                    End_Date__c = endDate,
                    Overall_Score__c = overallScore,
                    Archived__c = false,
					Is_Temporary__c = ContactTempSet != null? True : False,
					Processing_Method__c = processingMethod
                );
                
                
                engagementScoreToUpsert.add(currentEngagementScore);
                contactToEngagementScoreMap.put(engagementScore.contactId, currentEngagementScore);
            }
            
            // Upsert Contact_Engagement_Score__c
            if (!engagementScoreToUpsert.isEmpty()) {
                upsert  AS USER  engagementScoreToUpsert;
            }
            
            
            List<activityWrapper>  CurrentChannelEngagementScores = fetchCurrentChannelWiseScores(activityHistoryDynamicDateField, startDate, endDate, ContactSet);
            
            // Handle Contact_Channel_Score__c and Channel_Score_Timeline__c
            for (activityWrapper channelEngagementScore : CurrentChannelEngagementScores) {
                
                decimal score = 0;
                score = channelEngagementScore.Score;
                String key = channelEngagementScore.contactId + '-' + channelEngagementScore.channelName + (channelEngagementScore.CampaignId != null?('-'+channelEngagementScore.CampaignId):''); // Unique key for contact-channel
                
                Contact_Channel_Score__c recentChannelScore = recentChannelScores.get(key);
                // decimal updatedScore=score;
                if (recentChannelScore != null) {
                    // Update recent record
                    score += recentChannelScore.Score__c;
                    contactChannelKeysMap.get(channelEngagementScore.contactId).remove(key);
                    
                }
                
                // Create new channel score
                Contact_Channel_Score__c currentChannelScore = new Contact_Channel_Score__c();
                currentChannelScore.Engagement_Score__c = contactToEngagementScoreMap.get(channelEngagementScore.contactId).Id;
                currentChannelScore.Contact_Consultant__c = channelEngagementScore.contactId;
                currentChannelScore.Channel_Name__c = channelEngagementScore.channelName;
                currentChannelScore.Start_Date__c = startDate;
                currentChannelScore.End_Date__c = endDate;
                currentChannelScore.Score__c = score;
                currentChannelScore.Is_Temporary__c = ContactTempSet != null? True : False;
                
                Channel_Score_Timeline__c timeline = new Channel_Score_Timeline__c();
                timeline.Channel_Score__c = null; // Will be updated after insert
                timeline.Channel_Name__c = channelEngagementScore.channelName;
                timeline.Contact_Consultant__c = channelEngagementScore.contactId;
                timeline.Start_Date__c = startDate;
                timeline.End_Date__c = endDate;
                timeline.Score__c = channelEngagementScore.Score;
                timeline.Is_Temporary__c = ContactTempSet != null? True : False;
                
                
                if (channelEngagementScore.CampaignId != null) {
                    // updatedScore=score;
                    currentChannelScore.CampaignId__c=channelEngagementScore.CampaignId;
                    //  currentChannelScore.Score__c = score;
                    //  timeline.Score__c = score - recentChannelScore.Score__c;
                    timeline.CampaignId__c = channelEngagementScore.CampaignId;
                    
                }
                
                
                
                
                
                
                
                channelScoreToUpsert.add(currentChannelScore);
                // Create timeline entry for the new score
                
                timelineList.add(timeline);
                
                
                
                
            }
            
            
            for (Id contactId : contactChannelKeysMap.keySet()) {
                Set<String> channelKeys = contactChannelKeysMap.get(contactId);
                for (String key : channelKeys) {
                    Contact_Channel_Score__c recentChannelScore = recentChannelScores.get(key);
                    // decimal updatedScore=score;
                    if (recentChannelScore != null) {
                        Contact_Channel_Score__c currentChannelScore = new Contact_Channel_Score__c();
                        currentChannelScore.Engagement_Score__c = contactToEngagementScoreMap.get(recentChannelScore.Contact_Consultant__c).Id;
                        currentChannelScore.Contact_Consultant__c = recentChannelScore.Contact_Consultant__c;
                        currentChannelScore.Channel_Name__c = recentChannelScore.Channel_Name__c;
                        currentChannelScore.Start_Date__c = startDate;
                        currentChannelScore.End_Date__c = endDate;
                        currentChannelScore.Score__c = recentChannelScore.Score__c;
                        currentChannelScore.Is_Temporary__c = ContactTempSet != null? True : False;
                        
                        
                        Channel_Score_Timeline__c timeline = new Channel_Score_Timeline__c();
                        timeline.Channel_Score__c = null; // Will be updated after insert
                        timeline.Channel_Name__c = recentChannelScore.Channel_Name__c;
                        timeline.Contact_Consultant__c = recentChannelScore.Contact_Consultant__c;
                        timeline.Start_Date__c = startDate;
                        timeline.End_Date__c = endDate;
                        timeline.Score__c = 0;
                        timeline.Is_Temporary__c = ContactTempSet != null? True : False;
                     
                        
                        if (recentChannelScore.CampaignId__c != null) {
                            
                            currentChannelScore.CampaignId__c=recentChannelScore.CampaignId__c;
                            //  currentChannelScore.Score__c = score;
                            //  timeline.Score__c = score - recentChannelScore.Score__c;
                            timeline.CampaignId__c = recentChannelScore.CampaignId__c;
                            
                        }
                         channelScoreToUpsert.add(currentChannelScore);
                         timelineList.add(timeline);
                        
                    }
                }
            }
            
            
            
            
            // Upsert Contact_Channel_Score__c
            if (!channelScoreToUpsert.isEmpty()) {
                upsert  AS USER channelScoreToUpsert;
                
                // Update timeline with inserted channel scores
                // Map newly upserted channel scores by contact-channel combination
                Map<String, Id> insertedChannelScoreIds = new Map<String, Id>();
                for (Contact_Channel_Score__c score : channelScoreToUpsert) {
                    String key = score.Contact_Consultant__c + '-' + score.Channel_Name__c + (score.CampaignId__c != null?('-'+score.CampaignId__c):'');
                    insertedChannelScoreIds.put(key, score.Id);
                }
                
                // Assign correct parent Channel_Score__c ID in the timeline records
                for (Channel_Score_Timeline__c timeline : timelineList) {
                    String key = timeline.Contact_Consultant__c + '-' + timeline.Channel_Name__c + (timeline.CampaignId__c != null?('-'+timeline.CampaignId__c):'');
                    if (insertedChannelScoreIds.containsKey(key)) {
                        timeline.Channel_Score__c = insertedChannelScoreIds.get(key);
                    }
                }
                
            }
            
            
            // Insert Channel_Score_Timeline__c
            if (!timelineList.isEmpty()) {
                insert  AS USER  timelineList;
            }	
            List<Engagement_Activity_Metrics__c> activityHistoryList = new List<Engagement_Activity_Metrics__c>();
            
            
            activityHistoryList = fetchCurrentActivityWiseCount(activityHistoryDynamicDateField, startDate, endDate, ContactSet,ContactTempSet);
            if (!activityHistoryList.isEmpty()) {
                insert  AS USER activityHistoryList;
            }
        } catch (Exception e) {
            System.debug('Error processing engagement scores: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    // Fetch most recent Contact_Engagement_Score__c
    private static contactEngagementScoresWrapper getRecentEngagementScores(Set<Id> contactIds) {
        Map<Id, Contact_Engagement_Score__c> contactEngagementScoreMap = new Map<Id, Contact_Engagement_Score__c>();
        Set<Id> contactEngagementScoreIds = new Set<Id>();
        
        
        List<Contact> contactsWithLatestScores = [ 
            SELECT Id,
                   (SELECT Id, Contact_Consultant__c, Overall_Score__c, End_Date__c, Is_temporary__c  
                    FROM Contact_Engagement_Scores__r
                    ORDER BY End_Date__c DESC 
                    LIMIT 1) 
            FROM Contact 
            WHERE Id IN :contactIds
        ];
        
        for (Contact contact : contactsWithLatestScores) {
            if (!contact.Contact_Engagement_Scores__r.isEmpty()) {
                 Contact_Engagement_Score__c score = contact.Contact_Engagement_Scores__r[0];

                if (!contactEngagementScoreMap.containsKey(score.Contact_Consultant__c)) {
                    contactEngagementScoreMap.put(score.Contact_Consultant__c, score);
                }
                contactEngagementScoreIds.add(score.Id);
            }
        }
        
        
       /* for (Contact_Engagement_Score__c score : [
            SELECT Id, Contact_Consultant__c, Overall_Score__c
            FROM Contact_Engagement_Score__c
            WHERE Contact_Consultant__c IN :contactIds AND Is_Temporary__c = false
            ORDER BY End_Date__c DESC
        ]) {
            if (!contactEngagementScoreMap.containsKey(score.Contact_Consultant__c)) {
                contactEngagementScoreMap.put(score.Contact_Consultant__c, score);
            }
            contactEngagementScoreIds.add(score.Id);
        }*/
               contactEngagementScoresWrapper contactEngagementScoresWrapperWrapperIns = new contactEngagementScoresWrapper(contactEngagementScoreMap,contactEngagementScoreIds);

        return contactEngagementScoresWrapperWrapperIns;
    }
    
    // Fetch most recent Contact_Channel_Score__c for each contact-channel combination
    private static ChannelScoresWrapper getRecentChannelScores(Set<Id> contactEngagementScoreIds) {
        Map<String, Contact_Channel_Score__c> contactChannelScoresMap = new Map<String, Contact_Channel_Score__c>();
        Map<Id, Set<String>> contactChannelKeysMap = new  Map<Id, Set<String>>();
        
        
        for (Contact_Channel_Score__c score : [
            SELECT Id, Engagement_Score__c, Contact_Consultant__c, Channel_Name__c, Score__c,CampaignId__c
            FROM Contact_Channel_Score__c
            WHERE Engagement_Score__c IN :contactEngagementScoreIds AND Is_Temporary__c = false
            ORDER BY End_Date__c DESC
        ]) {
            String key = score.Contact_Consultant__c + '-' + score.Channel_Name__c + (score.CampaignId__c != null?('-'+score.CampaignId__c):'');
            if (!contactChannelScoresMap.containsKey(key)) {
                contactChannelScoresMap.put(key, score);
            }
            // Maintain a list of channels per contact
            if (!contactChannelKeysMap.containsKey(score.Contact_Consultant__c)) {
                contactChannelKeysMap.put(score.Contact_Consultant__c, new Set<String>());
            }
            contactChannelKeysMap.get(score.Contact_Consultant__c).add(key);
        }
        ChannelScoresWrapper channelScoresWrapperIns = new channelScoresWrapper(contactChannelScoresMap,contactChannelKeysMap);
        
        
        
        // channelScoresWrapper 
        return channelScoresWrapperIns;
    }
    
    
    // Fetch grouped activity scores
    @TestVisible
    private static List<activityWrapper> fetchCurrentContactWiseScores(String activityHistoryDynamicDateField, Date startDate, Date endDate,Set<Id> ContactTempSet) {
        
        Datetime startDateTime = getStartOfDay(startDate);
        Datetime endDateTime = getEndOfDay(endDate);
        
        String activityHistoryQuery = 'SELECT Contact__c ContactId, ' +
            'SUM(Activity_Score__c) Score ' +
            'FROM Activity_History__c ' +
            'WHERE Activity_Score__c != null AND ' + activityHistoryDynamicDateField + ' >= :startDateTime AND ' + activityHistoryDynamicDateField +' <= :endDateTime '+(ContactTempSet != null ?' AND Contact__c IN :ContactTempSet ' :'') + 
            'GROUP BY Contact__c';
        
        
        system.debug('activityHistoryQuery-->'+activityHistoryQuery);
        List<AggregateResult> results = Database.query(activityHistoryQuery);
        List<activityWrapper> currentContactWiseScores = new List<activityWrapper>();
        
        
        for (AggregateResult result : results) {
            Id contactId = (Id) result.get('ContactId');
            // String channelName = (String) result.get('ChannelName');
            Decimal score = (Decimal) result.get('Score');  
            // Id CampaignId = (Id) result.get('CampaignId');
            
            currentContactWiseScores.add(new activityWrapper(contactId, null, score,null));
        }
        
        
        return currentContactWiseScores;
    }
    
    // Fetch grouped activity scores
    @TestVisible
    private static List<activityWrapper> fetchCurrentChannelWiseScores(String activityHistoryDynamicDateField, Date startDate, Date endDate,Set<Id> contactIds) {
        
        Datetime startDateTime = getStartOfDay(startDate);
        Datetime endDateTime = getEndOfDay(endDate);
        String activityHistoryQuery = 'SELECT Contact__c ContactId, ' +
            'Channel__c ChannelName, ' +
            'Campaign__c CampaignId, ' +
            'SUM(Activity_Score__c) Score ' +
            'FROM Activity_History__c ' +
            'WHERE Activity_Score__c != null AND ' + activityHistoryDynamicDateField + ' >= :startDateTime AND ' + activityHistoryDynamicDateField +' <= :endDateTime AND Contact__c IN :contactIds '+
            'GROUP BY Contact__c, Channel__c, Campaign__c';
        
        
        system.debug('activityHistoryQuery-->'+activityHistoryQuery);
        List<AggregateResult> results = Database.query(activityHistoryQuery);
        List<activityWrapper> currentChannelWiseScores = new List<activityWrapper>();
        
        
        for (AggregateResult result : results) {
            Id contactId = (Id) result.get('ContactId');
            String channelName = (String) result.get('ChannelName');
            Decimal score = (Decimal) result.get('Score');  
            Id CampaignId = (Id) result.get('CampaignId');
            
            currentChannelWiseScores.add(new activityWrapper(contactId, channelName, score,CampaignId));
        }
        
        
        return currentChannelWiseScores;
    }
    
    
    // Fetch grouped activity scores
    @TestVisible
    private static List<Engagement_Activity_Metrics__c> fetchCurrentActivityWiseCount(String activityHistoryDynamicDateField, Date startDate, Date endDate,Set<Id> contactIds, Set<Id> ContactTempSet) {
        
        Datetime startDateTime = getStartOfDay(startDate);
        Datetime endDateTime = getEndOfDay(endDate);
        String activityHistoryQuery = 'SELECT Contact__c ContactId, ' +
            'Contact__r.AccountId AccountId,'+
            'Channel_Category__c ChannelCategory, ' +
            'Channel__c ChannelName, ' +
            'Activity__c Activity, ' +
            'COUNT(Id) ActivityCount ' +
            'FROM Activity_History__c ' +
            'WHERE ' + activityHistoryDynamicDateField + ' >= :startDateTime AND ' + activityHistoryDynamicDateField +' <= :endDateTime AND Contact__c IN :contactIds '+
            'GROUP BY Contact__r.AccountId, Contact__c, Channel_Category__c, Channel__c, Activity__c';
        
        
        system.debug('activityHistoryQuery-->'+activityHistoryQuery);
        List<AggregateResult> results = Database.query(activityHistoryQuery);
        List<Engagement_Activity_Metrics__c> EngagementActivityMetricsList = new List<Engagement_Activity_Metrics__c>();
        
        
        for (AggregateResult result : results) {
            Engagement_Activity_Metrics__c EngagementActivityMetricsIns = new Engagement_Activity_Metrics__c();
            EngagementActivityMetricsIns.AccountId__c = (Id) result.get('AccountId');
            EngagementActivityMetricsIns.ContactId__c = (Id) result.get('ContactId');
            EngagementActivityMetricsIns.Channel__c = (String) result.get('ChannelName');
            EngagementActivityMetricsIns.Channel_Category__c = (String) result.get('ChannelCategory');
            EngagementActivityMetricsIns.Activity__c = (String) result.get('Activity');
            EngagementActivityMetricsIns.Activity_Count__c = (Integer) result.get('ActivityCount');
            EngagementActivityMetricsIns.Start_Date__c = startDate;
            EngagementActivityMetricsIns.End_Date__c = endDate;
            EngagementActivityMetricsIns.Is_Temporary__c = ContactTempSet != null? True : False;
            
            /*Id contactId = (Id) result.get('ContactId');
String channelName = (String) result.get('ChannelName');
Decimal score = (Decimal) result.get('Score');  
Id CampaignId = (Id) result.get('CampaignId');*/
            
            EngagementActivityMetricsList.add(EngagementActivityMetricsIns);
        }
        
        
        return EngagementActivityMetricsList;
    }
    
    public static void deleteTempRecordsByContactId(Set<Id> contactIds) {
        /*  if (contactIds.isEmpty()) {
throw new AuraHandledException('Invalid Contact List.');
}*/
        
        
        if(contactIds != null) {   
            List<SObject> recordsToDelete = new List<SObject>();
            
            // Query all related records in a single transaction
            List<Contact_Engagement_Score__c> contactEngagementScoreRecords = [SELECT Id FROM Contact_Engagement_Score__c WHERE Contact_Consultant__c IN :contactIds AND Is_Temporary__c = true ];
            List<Contact_Channel_Score__c> contactChannelScoreRecords = [SELECT Id FROM Contact_Channel_Score__c WHERE Contact_Consultant__c IN :contactIds AND Is_Temporary__c = true ];
            List<Channel_Score_Timeline__c> channelScoreTimelineRecords = [SELECT Id FROM Channel_Score_Timeline__c WHERE Contact_Consultant__c IN :contactIds AND Is_Temporary__c = true ];
            
            List<Engagement_Activity_Metrics__c> ActivityMetricsRecords = [SELECT Id FROM Engagement_Activity_Metrics__c WHERE ContactId__c IN :contactIds AND Is_Temporary__c = true ];
            
            // Add all records to a single list
            recordsToDelete.addAll(contactEngagementScoreRecords);
            recordsToDelete.addAll(contactChannelScoreRecords);
            recordsToDelete.addAll(channelScoreTimelineRecords);
            recordsToDelete.addAll(ActivityMetricsRecords);
            
            // Delete records in bulk (DML optimization)
            if (!recordsToDelete.isEmpty()) {
                delete  AS USER recordsToDelete;
            }
        }
    }
    // Convert Date to Datetime at 00:00:00 (Start of Day)
    public static Datetime getStartOfDay(Date inputDate) {
        Datetime utcDatetime = Datetime.newInstance(inputDate.year(), inputDate.month(), inputDate.day(), 0, 0, 0);
        utcDatetime = utcDatetime.addSeconds(UserInfo.getTimeZone().getOffset(utcDatetime) / 1000);
        
        return utcDatetime;
    }

    // Convert Date to Datetime at 23:59:59 (End of Day)
    public static Datetime getEndOfDay(Date inputDate) {
        Datetime utcDatetime = Datetime.newInstance(inputDate.year(), inputDate.month(), inputDate.day(), 23, 59, 59);
        utcDatetime = utcDatetime.addSeconds(UserInfo.getTimeZone().getOffset(utcDatetime) / 1000);
        
        return utcDatetime;
    }
    
    
    public class channelScoresWrapper {
        public Map<String, Contact_Channel_Score__c> contactChannelScoresMap { get; set; }
        public Map<Id, Set<String>> contactChannelKeysMap { get; set; }
        
        public ChannelScoresWrapper(Map<String, Contact_Channel_Score__c> contactChannelScoresMap, Map<Id, Set<String>> contactChannelKeysMap) {
            this.contactChannelScoresMap = contactChannelScoresMap;
            this.contactChannelKeysMap = contactChannelKeysMap;
        }
    }
    
    public class contactEngagementScoresWrapper {
        public Map<Id, Contact_Engagement_Score__c> contactEngagementScoresMap { get; set; }
        public Set<Id> contactEngagementscoreIds{ get; set; }
        
        public contactEngagementScoresWrapper(Map<Id, Contact_Engagement_Score__c> contactEngagementScoresMap, Set<Id> contactEngagementscoreIds) {
            this.contactEngagementScoresMap = contactEngagementScoresMap;
            this.contactEngagementscoreIds = contactEngagementscoreIds;
        }
    }
    
    
    public class activityWrapper {
        public Id contactId { get; set; }
        public String channelName { get; set; }
        public Decimal score { get; set; }
        public Id campaignId { get; set; }
        
        public activityWrapper(Id contactId, String channelName, Decimal score, Id campaignId) {
            this.contactId = contactId;
            this.channelName = channelName;
            this.score = score;
            this.campaignId = campaignId; 
        }
    }
    
}