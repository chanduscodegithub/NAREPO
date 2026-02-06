public class ActivityHistoryInsertHelper {
    public static void enqueueInChunks(List<Activity_History__c> records, Integer chunkSize) {
        Integer total = records.size();
        for (Integer i = 0; i < total; i += chunkSize) {
            List<Activity_History__c> chunk = new List<Activity_History__c>();
            for (Integer j = i; j < Math.min(i + chunkSize, total); j++) {
                chunk.add(records[j]);
            }
            System.enqueueJob(new ActivityHistoryInsertQueueable(chunk));
        }
    }
}