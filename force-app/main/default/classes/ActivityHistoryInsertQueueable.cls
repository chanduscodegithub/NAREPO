public class ActivityHistoryInsertQueueable implements Queueable, Database.AllowsCallouts {
    private List<Activity_History__c> activityHistories;

    public ActivityHistoryInsertQueueable(List<Activity_History__c> activityHistories) {
        this.activityHistories = activityHistories;
    }

    public void execute(QueueableContext context) {
        if (activityHistories != null && !activityHistories.isEmpty()) {
            insert activityHistories;
        }
    }
}