global class PolicyBatchProcessor
implements Database.Batchable<SObject>, Database.AllowsCallouts {

    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([
            SELECT Id, Policy__c, Company__c
            FROM Policy_Information__c
        ]);
    }

    global void execute(Database.BatchableContext bc, List<Policy_Information__c> scope) {

        if (!scope.isEmpty()) {
            AccountAPI.sendBulkPolicies(scope);
        }
    }

    global void finish(Database.BatchableContext bc) {
        System.debug('Batch Completed');
    }
}