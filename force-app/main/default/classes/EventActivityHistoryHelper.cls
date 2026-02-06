public class EventActivityHistoryHelper {
    public static void processActivityHistoryRecords(
        Set<Id> eventIds,
        Map<Id, Event> newEventMap,
        Map<Id, Event> oldEventMap,
        Boolean isUpdate
    ) {
        List<Activity_History__c> activityHistories = new List<Activity_History__c>();
        Map<Id, List<Id>> eventContactMap = new Map<Id, List<Id>>();

        // Get contacts from EventRelation (WhoId/WhatId)
        for (EventRelation er : [
            SELECT EventId, RelationId FROM EventRelation WHERE EventId IN :eventIds AND Relation.Type = 'Contact'
        ]) {
            if (!eventContactMap.containsKey(er.EventId)) {
                eventContactMap.put(er.EventId, new List<Id>());
            }
            eventContactMap.get(er.EventId).add(er.RelationId);
        }

        // Prepare history keys
        Set<String> historyKeys = new Set<String>();
        for (Event evt : newEventMap.values()) {
            List<Id> contacts = eventContactMap.get(evt.Id) != null ? eventContactMap.get(evt.Id) : new List<Id>();
            String status = evt.Status__c != null ? evt.Status__c : 'Attended';
              

            for (Id cId : contacts) {
                historyKeys.add(evt.Id + '_' + status + '_' + cId);
            }
        }

        Map<String, Activity_History__c> existingHistories = new Map<String, Activity_History__c>();
        for (Activity_History__c ah : [
            SELECT Id, Unique_Key_with_ContactId__c FROM Activity_History__c
            WHERE Unique_Key_with_ContactId__c IN :historyKeys
        ]) {
            existingHistories.put(ah.Unique_Key_with_ContactId__c, ah);
        }

        Map<String, Channel_Activity__c> channelScores = new Map<String, Channel_Activity__c>();
        for (Channel_Activity__c ca : [
            SELECT Id, Unique_Key__c, Per_Activity_Score__c, Activity_Type__c
            FROM Channel_Activity__c 
            WHERE Channel__r.Channel_Category__c = 'Event'
        ]) {
            channelScores.put(ca.Unique_Key__c, ca);
        }

        for (Event evt : newEventMap.values()) {
            List<Id> contactIds = eventContactMap.containsKey(evt.Id) ? eventContactMap.get(evt.Id) : new List<Id>();
            String status = evt.Status__c != null ? evt.Status__c : 'Attended';
            String evtType = evt.Type != null ? evt.Type : 'Virtual Meeting - Account Specific';

            Boolean runCheck = true;
            if (isUpdate && oldEventMap.containsKey(evt.Id)) {
                Event oldEvt = oldEventMap.get(evt.Id);
                Boolean statusChanged = oldEvt.Status__c != evt.Status__c;
                Boolean contactAdded = oldEvt.WhoCount != evt.WhoCount;
                runCheck = statusChanged || contactAdded;
            }

            if (!runCheck) continue;

            for (Id cId : contactIds) {
                String uniqueKey = evt.Id + '_' + status + '_' + cId;
                if (!existingHistories.containsKey(uniqueKey)) {
                    String channelKey = 'Event_' + evtType + '_' + status;
                    if (!channelScores.containsKey(channelKey)) {
                        continue;
                    }

                    Decimal score = channelScores.get(channelKey).Per_Activity_Score__c;

                    Activity_History__c ah = new Activity_History__c(
                        Channel_Category__c = 'Event',
                        Channel__c = evtType,
                        Activity__c = status,
                        Contact__c = cId,
                        Connected_Object_Lookup_Id__c = evt.Id,
                        Activity_Date__c =   DateTime.newInstance(evt.ActivityDate.year(), evt.ActivityDate.month(), evt.ActivityDate.day()),
                        Activity_Score__c = score
                    );
                    activityHistories.add(ah);
                }
            }
        }

        if (!activityHistories.isEmpty()) {
            insert activityHistories;
        }
    }
}