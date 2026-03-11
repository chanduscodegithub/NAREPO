trigger ProductAuditLog on Product2(after insert, after update) {

    if (Trigger.isAfter) {
        if (Trigger.isInsert) {
            ProductAuditService.handleInsert(Trigger.new);
        }

        if (Trigger.isUpdate) {

            ProductAuditService.handleUpdate(Trigger.oldMap,Trigger.newMap);
            Set<Id> changedProductIds = new Set<Id>();
            for (Id id : Trigger.newMap.keySet()) {
                Product2 newP = Trigger.newMap.get(id);
                Product2 oldP = Trigger.oldMap.get(id);
                if (newP.Level_2_Options__c != oldP.Level_2_Options__c) {
                    changedProductIds.add(id);
                }
            }

            if (!changedProductIds.isEmpty()) {
                PimStageUtil.updateStages(changedProductIds);
            }
       
        }}
}