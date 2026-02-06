public class AccountSummaryBatchStarter implements Queueable {
    private Set<Id> accountIds;

    public AccountSummaryBatchStarter(Set<Id> accountIds) {
        this.accountIds = accountIds;
    }

    public void execute(QueueableContext context) {
        Database.executeBatch(new AccountSummaryProcessingBatch(accountIds), 1);
    }
}