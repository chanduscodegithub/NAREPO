public class EngagementSummaryQueueable implements Queueable, Database.AllowsCallouts {
    private Id accountId;

    public EngagementSummaryQueueable(Id accountId) {
        this.accountId = accountId;
    }

    public void execute(QueueableContext context) {
        try {
            // 🔥 Call OpenAI / EngagementSummary API
            EngagementSummaryController.sendEngagementPrompt(accountId);
            System.debug('Queueable Callout Executed for Account: ' + accountId);
        } catch (Exception e) {
            System.debug('Error in Queueable Callout: ' + e.getMessage());
        }
    }
}