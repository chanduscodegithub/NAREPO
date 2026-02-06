public class CampaignMemberTriggerHandler {
    public static void processCampaignMember(List<CampaignMember> campaignMembers, Map<Id, CampaignMember> oldMap) {
        List<Activity_History__c> activityHistoryRecords = new List<Activity_History__c>();
        Set<Id> campaignMemberIds = new Set<Id>();
        Map<Id, String> recordTypeMap = new Map<Id, String>();
        Map<String, Activity_History__c> activityHistoryByUniqueKey = new Map<String, Activity_History__c>();
        Map<String, Channel_Activity__c> channelActivityByUniqueKey = new Map<String, Channel_Activity__c>();
        Map<String, Channel_Activity__c> channelActivityById = new Map<String, Channel_Activity__c>();

        // Identify relevant CampaignMember records
        for (CampaignMember cm : campaignMembers) {
            if (cm.ContactId != null && 
                ((Trigger.isInsert && !String.isBlank(cm.Response_Status__c)) || 
                 (Trigger.isUpdate && cm.Response_Status__c != oldMap.get(cm.Id).Response_Status__c && !String.isBlank(cm.Response_Status__c)))) {
                campaignMemberIds.add(cm.Id);
            }
        }

        if (!campaignMemberIds.isEmpty()) {
            // Fetch existing Activity_History__c records
            for (Activity_History__c ah : [
                SELECT Id, Unique_Key__c
                FROM Activity_History__c 
                WHERE Connected_Object_Lookup_Id__c IN :campaignMemberIds
            ]) {
                activityHistoryByUniqueKey.put(ah.Unique_Key__c, ah);
            }
        }

        // Fetch RecordType names for CampaignMember
        for (RecordType rt : [SELECT Id, Name FROM RecordType WHERE SObjectType = 'CampaignMember']) {
            recordTypeMap.put(rt.Id, rt.Name);
        }

        // Fetch Channel Activity Weightage Data
        for (Channel_Activity__c weightage : [
            SELECT Id, Unique_Key__c, Per_Activity_Score__c, Parent_Channel_Activity_Weightage__c, Activity_Type__c
            FROM Channel_Activity__c 
            WHERE Unique_Key__c LIKE 'Campaign%'
        ]) {
            channelActivityByUniqueKey.put(weightage.Unique_Key__c, weightage);
            channelActivityById.put(weightage.Id, weightage);
        }

        // Process CampaignMembers
        for (CampaignMember cm : campaignMembers) {
            if (!campaignMemberIds.contains(cm.Id)) {
                continue;
            }

            String channelCategory = 'Campaign';
            String channel = recordTypeMap.get(cm.RecordTypeId);
            String activity = cm.Response_Status__c;
            String key = channelCategory + '_' + channel + '_' + activity;
            String uniqueKey = cm.Id + '_' + activity;

            // Insert Activity History if not already exists
            if (!activityHistoryByUniqueKey.containsKey(uniqueKey) && channelActivityByUniqueKey.containsKey(key)) {
                Activity_History__c activityHistoryIns = createActivityHistory(cm, channelCategory, channel, activity, channelActivityByUniqueKey.get(key).Per_Activity_Score__c);
                activityHistoryRecords.add(activityHistoryIns);
            }

            // Process hierarchical statuses
            while (channelActivityByUniqueKey.containsKey(key) &&
                   channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c != null &&
                   channelActivityById.containsKey(channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c)) {

                String parentStatus = channelActivityById.get(channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c).Activity_Type__c;
                String parentUniqueKey = cm.Id + '_' + parentStatus;
                Decimal parentScore = channelActivityById.get(channelActivityByUniqueKey.get(key).Parent_Channel_Activity_Weightage__c).Per_Activity_Score__c;

                if (!activityHistoryByUniqueKey.containsKey(parentUniqueKey)) {
                    Activity_History__c parentActivityHistoryIns = createActivityHistory(cm, channelCategory, channel, parentStatus, parentScore);
                    activityHistoryRecords.add(parentActivityHistoryIns);
                }
                key = 'Campaign_' + channel + '_' + parentStatus;
            }
        }

        // Insert records in bulk
        if (!activityHistoryRecords.isEmpty()) {
            insert activityHistoryRecords;
        }
    }

    private static Activity_History__c createActivityHistory(CampaignMember cm, String channelCategory, String channel, String activity, Decimal score) {
        Activity_History__c activityHistory = new Activity_History__c();
        activityHistory.Channel_Category__c = channelCategory;
        activityHistory.Channel__c = channel;
        activityHistory.Activity__c = activity;
        activityHistory.Contact__c = cm.ContactId;
        activityHistory.Campaign__c = cm.CampaignId;
        activityHistory.Connected_Object_Lookup_Id__c = cm.Id;
        activityHistory.Activity_Date__c = DateTime.now();
        activityHistory.Activity_Score__c = score;
        return activityHistory;
    }
}