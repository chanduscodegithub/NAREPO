/**
* @File Name : EngagementScoreTriggerHandler.cls
* @Description :
* @Author :
* @Last Modified By :
* @Last Modified On : February 28, 2025
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | February 28, 2025 |   | Initial Version
**/

public with sharing class EngagementScoreTriggerHandler {
    @AuraEnabled
    public static Map<String, Object> getLastRunDetailsWithActivityCount(Id accountId) {
        if (accountId == null) {
            return null;
        }
        Map<String, Object> result = new Map<String, Object>();
        String engagementLastRun = '';
        string utcDatetimeString ='';
        Integer activityCount = 0;
        
        // Fetch the most recent Engagement_Summary__c record
        Engagement_Summary__c summary = [SELECT CreatedDate 
                                         FROM Engagement_Summary__c
                                         WHERE Company__c = :accountId
                                         ORDER BY CreatedDate DESC 
                                         LIMIT 1];
        
        if (summary != null) {
            engagementLastRun = summary.CreatedDate.format('MMM dd, yyyy, hh:mm a');
            
            DateTime utcDatetime = summary.CreatedDate;
            utcDatetime = utcDatetime.addSeconds(UserInfo.getTimeZone().getOffset(utcDatetime) / 1000);
            utcDatetimeString = utcDatetime.format('MMM dd, yyyy, hh:mm a');

            // Query ActivityHistory records where ActivityDate is after the summary CreatedDate Activity_Date__c
            activityCount = [SELECT COUNT() 
                             FROM Activity_History__c 
                             WHERE Contact__r.AccountId = :accountId 
                             AND CreatedDate > :summary.CreatedDate];
        }
        
        result.put('lastRunFormatted', engagementLastRun);
        result.put('activityCount', activityCount);
        
        System.debug('Last Run: ' + engagementLastRun + ' | Activity Count: ' + activityCount + ' | region time: ' + utcDatetimeString);
        return result;
    }

    @AuraEnabled
    public static void recalculateEngagementScore(Id accountId) {
        if (accountId == null) {
            throw new AuraHandledException('Invalid Account ID.');
        }
        Datetime currentDatetime = Datetime.now();
        Date startDate = Date.today().toStartofWeek().addDays(1); // Monday
        Date endDate = Date.today(); // Today

        // Fetch Contacts for the given Account
        Set<Id> contactIdSet = new Set<Id>();
        for (Contact c : [SELECT Id FROM Contact WHERE AccountId = :accountId]) {
            contactIdSet.add(c.Id);
        }

        if (contactIdSet.isEmpty()) {
            throw new AuraHandledException('No contacts found for the given account.');
        }

        // Call the engagement score processing logic
        EngagementScoreProcessor.processEngagementScores( 
            'Activity_Date__c',
            startDate,
            endDate,
            contactIdSet,
            'Manual'
        );

        // Update Account with new last run time
        Account updatedAccount = new Account(Id = accountId, Last_Calculate_Engagement_Score_Run__c = currentDatetime,Processing_Method__c='Manual');
        update updatedAccount;
    }
}