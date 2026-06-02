public with sharing class AccountSummaryProcessingBatch implements Database.Batchable<sObject>, Database.Stateful {
    private Set<Id> accountIds;

    public AccountSummaryProcessingBatch(Set<Id> accountsId) {
        this.accountIds = accountsId;
    }

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id FROM Account WHERE Id IN :accountIds]);
    }

    public void execute(Database.BatchableContext bc, List<Account> scope) {
       // Since batch size is set to 1, scope will always contain only 1 record.
       if (!scope.isEmpty()) {
            System.enqueueJob(new EngagementSummaryQueueable(scope[0].Id)); // 🔥 Queueable Job
            System.debug('summarybatchclass-->' + scope[0].Id);
        }
    }

    public void finish(Database.BatchableContext bc) {
        System.debug('Batch execution completed for Account Processing.');
    }
}