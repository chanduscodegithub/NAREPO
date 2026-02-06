global class DeleteCST implements Database.Batchable<SObject> {

    global Database.QueryLocator start(Database.BatchableContext BC) {
        return Database.getQueryLocator('SELECT Id FROM Contact_Engagement_Score__c');
    }

    global void execute(Database.BatchableContext BC, List<SObject> scope) {
        delete scope;
    }

    global void finish(Database.BatchableContext BC) {
        // Optional: do something after batch completes
        System.debug('All Activity_history__c records deleted.');
    }
}