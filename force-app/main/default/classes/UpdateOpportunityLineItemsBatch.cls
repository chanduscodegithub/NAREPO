global class UpdateOpportunityLineItemsBatch implements Database.Batchable<SObject> {

    global Database.QueryLocator start(Database.BatchableContext bc) {
        // Only fetch OpportunityLineItems where the related Product2 matches the condition
        return Database.getQueryLocator([
            SELECT Id, Product2Id, Dual_Clients_only__c
            FROM OpportunityLineItem
            WHERE Product2.Surest_Applicable_Products__c = 'Available for Surest only with UNET'
        ]);
    }

    global void execute(Database.BatchableContext bc, List<OpportunityLineItem> scope) {
        for (OpportunityLineItem oli : scope) {
            oli.Dual_Clients_only__c = true;
        }
        update scope;
    }

    global void finish(Database.BatchableContext bc) {
        // Optional: send an email or log completion
    }
}