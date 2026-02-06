public class TaskActivityHistoryHelper {
    public static void processActivityHistoryRecords(
        Set<Id> taskIds,
        Map<Id, Task> newTaskMap,
        Map<Id, Task> oldTaskMap,
        Boolean isUpdate
    ) {
        List<Activity_History__c> activityHistories = new List<Activity_History__c>();
        Map<Id, List<Id>> taskContactMap = new Map<Id, List<Id>>();
        
        // Get additional contacts from TaskRelation
        for (TaskRelation tr : [
            SELECT TaskId, RelationId FROM TaskRelation WHERE TaskId IN :taskIds AND Relation.Type = 'Contact'
        ]) {
            if (!taskContactMap.containsKey(tr.TaskId)) {
                taskContactMap.put(tr.TaskId, new List<Id>());
            }
            taskContactMap.get(tr.TaskId).add(tr.RelationId);
        }
        
        // Generate unique keys to fetch existing Activity History records
        Set<String> historyKeys = new Set<String>();
        for (Task t : newTaskMap.values()) {
            List<Id> contacts = new List<Id>();
            
            if (t.WhoId != null) contacts.add(t.WhoId);
            if (taskContactMap.containsKey(t.Id)) {
                for (Id cId : taskContactMap.get(t.Id)) {
                    if (!contacts.contains(cId)) contacts.add(cId);
                }
            }
            
            for (Id cId : contacts) {
                String Status = (t.status != null && t.type != null && t.status == 'Completed') ? t.status : 'Open';
                historyKeys.add(t.Id + '_' + Status + '_' + cId);
            }
        }
        system.debug('historyKeys'+historyKeys);
        
        // Fetch existing Activity History records
        Map<String, Activity_History__c> existingHistories = new Map<String, Activity_History__c>();
        for (Activity_History__c ah : [
            SELECT Id, Unique_Key_with_ContactId__c,Channel__c FROM Activity_History__c 
            WHERE Unique_Key_with_ContactId__c IN :historyKeys
        ]) {
            system.debug('existingHistory'+ah.Unique_Key_with_ContactId__c);
            system.debug('existingHistory'+ah.Id);
            existingHistories.put(ah.Unique_Key_with_ContactId__c, ah);
        }
        
        // Fetch Channel Activity scores
        Map<String, Channel_Activity__c> channelScores = new Map<String, Channel_Activity__c>();
        for (Channel_Activity__c ca : [
            SELECT Id, Unique_Key__c, Per_Activity_Score__c, Activity_Type__c
            FROM Channel_Activity__c 
            WHERE Channel__r.Channel_Category__c = 'Task'
        ]) {
            channelScores.put(ca.Unique_Key__c, ca);
        }
        
        // Generate new Activity History records if needed
        for (Task t : newTaskMap.values()) {
            List<Id> contactIds = new List<Id>();
            if (t.WhoId != null) contactIds.add(t.WhoId);
            if (taskContactMap.containsKey(t.Id)) {
                for (Id cId : taskContactMap.get(t.Id)) {
                    if (!contactIds.contains(cId)) contactIds.add(cId);
                }
            }
            
            // Update check - only proceed if status changed or new contact added
            Boolean statusChanged;
            Boolean runCheck = true;
            if (isUpdate && oldTaskMap.containsKey(t.Id)) {
                Task oldT = oldTaskMap.get(t.Id);
                //Boolean statusChangedToCompleted = oldT.Status != 'Completed' && t.Status == 'Completed';//newly added
                
                statusChanged = oldT.Status != t.Status;
                Boolean contactAdded = oldT.WhoCount != t.WhoCount;
                runCheck = statusChanged || contactAdded;
                
                /*    Integer oldCount = 0;
if (oldT.WhoId != null) oldCount++;
if (taskContactMap.containsKey(t.Id)) oldCount += taskContactMap.get(t.Id).size();

contactAdded = contactIds.size() > oldCount;*/
                //runCheck = statusChanged || contactAdded;
                // newly added -- Only for Email - Account Specific and Subject contains "YourText"
                //Boolean isEmailAccountSpecific = (t.Type != null && t.Type == 'Email - Account Specific');
                //Boolean subjectMatches = (t.Subject != null && t.Subject.contains('Email - Account Specific')); // newly added
                //  runCheck = statusChangedToCompleted || contactAdded;
                // runCheck = (contactAdded || statusChangedToCompleted) && isEmailAccountSpecific && subjectMatches; //newly added
                /* if (t.Type == 'Email - Account Specific') {
// Additional condition for Email Account Specific: Subject must match
Boolean subjectMatches = (t.Subject != null && t.Subject.contains('Email - Account Specific')); // replace 'YourText' with your rule
//runCheck = (contactAdded || statusChangedToCompleted) && subjectMatches;
runCheck = statusChangedToCompleted || contactAdded;
} else {
// For all other types, keep previous logic
runCheck = statusChanged || contactAdded;
}
*/
                
            }
            
            if (!runCheck) continue;
            
            for (Id cId : contactIds) {
                String Status = (t.status != null && t.type != null && t.status == 'Completed') ? t.status : 'Open';
                //(t.status != null && t.type != null) ? t.status : 'Open';
                String taskType = t.Type != null ? t.Type : 'Email - Account Specific';
                system.debug('Status'+Status);
                String uniqueKey = t.Id + '_' + Status + '_' + cId;
                system.debug('uniqueKey'+uniqueKey);
                if (!existingHistories.containsKey(uniqueKey)) {
                    String channelKey = 'Task_' + taskType + '_' + Status;
                    system.debug('channelKey'+channelKey);
                    if (!channelScores.containsKey(channelKey)) {
                        system.debug('inside Skip');
                        continue; // skip if no matching channel activity
                    }
                    
                    
                    Decimal score = channelScores.get(channelKey).Per_Activity_Score__c;
                    
                    Activity_History__c ah = new Activity_History__c(
                        Channel_Category__c = 'Task',
                        Channel__c = taskType,
                        Activity__c = Status,
                        Contact__c = cId,
                        Connected_Object_Lookup_Id__c = t.Id,
                        Activity_Date__c = DateTime.newInstance(t.ActivityDate.year(), t.ActivityDate.month(), t.ActivityDate.day()), 
                        Activity_Score__c = score
                    );
                    activityHistories.add(ah);
                }/*else{
                    if(statusChanged){
                        Activity_History__c ah =existingHistories.get(uniqueKey);
                        if(ah.Channel__c=='Email - Account Specific'){
                            ah.Activity__c =Status;
                            activityHistories.add(ah);
                        }
                    }
                }*/
            }
        }
        
        if (!activityHistories.isEmpty()) {
            upsert activityHistories;
        }
    }
}