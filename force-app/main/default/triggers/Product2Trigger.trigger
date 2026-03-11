trigger Product2Trigger on Product2 (after insert, after update) {
    Set<Id> matchingProductIds = new Set<Id>();

    for (Product2 p : Trigger.new) {
        if (p.Surest_Applicable_Products__c == 'Available for Surest only with UNET') {
            matchingProductIds.add(p.Id);
        }
    }

    if (!matchingProductIds.isEmpty()) {
        List<OpportunityLineItem> oliToUpdate = [SELECT Id, Product2Id, Dual_Clients_only__c FROM OpportunityLineItem WHERE Product2Id IN :matchingProductIds];

        for (OpportunityLineItem oli : oliToUpdate) {
            oli.Dual_Clients_only__c = true;
        }

        if (!oliToUpdate.isEmpty()) {
            update oliToUpdate;
        }
    }
}