trigger ContactEngagementScoreTrigger on Contact_Engagement_Score__c (after insert, after update) {
    if (Trigger.isAfter && (Trigger.isInsert || Trigger.isUpdate)) {
        ContactEngagementScoreHandler.processEngagementScores(Trigger.new);
    }
}