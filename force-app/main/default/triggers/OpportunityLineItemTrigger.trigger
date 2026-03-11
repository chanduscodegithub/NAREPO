trigger OpportunityLineItemTrigger on OpportunityLineItem (before insert, before update) {
    Set<Id> productIds = new Set<Id>();

    for (OpportunityLineItem oli : Trigger.new) {
        if (oli.Product2Id != null) {
            productIds.add(oli.Product2Id);
        }
    }

    Map<Id, Product2> productMap = new Map<Id, Product2>(
        [SELECT Id, Surest_Applicable_Products__c FROM Product2 WHERE Id IN :productIds]
    );

    for (OpportunityLineItem oli : Trigger.new) {
        if (oli.Product2Id != null) {
            Product2 prod = productMap.get(oli.Product2Id);

            if (prod != null && prod.Surest_Applicable_Products__c == 'Available for Surest only with UNET') {
                oli.Dual_Clients_only__c = true;
            } else {
                oli.Dual_Clients_only__c = false;
            }
        }
    }
}