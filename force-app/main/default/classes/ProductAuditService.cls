public with sharing class ProductAuditService {
    private static Boolean isRunning = false;
    public static void handleInsert(List<Product2> newRecords) {
        if (isRunning) 
            return;
        isRunning = true;
        List<PIM_Audit_Trail__c> audits = new List<PIM_Audit_Trail__c>();
        for (Product2 p : newRecords) {
            audits.add(new PIM_Audit_Trail__c(
                Product__c = p.Id,
                Action_Type__c = 'Create',
                Description__c = 'Product Created'
            ));
        }

        if (!audits.isEmpty()) {
            insert as user audits;
        }

        isRunning = false;
    }

    // ========== UPDATE ==========
    public static void handleUpdate( Map<Id, Product2> oldMap, Map<Id, Product2> newMap) {
        if (isRunning) return;
        isRunning = true;
        List<PIM_Audit_Trail__c> audits = new List<PIM_Audit_Trail__c>();
        Map<String, Schema.SObjectField> fieldMap = Schema.SObjectType.Product2.fields.getMap();
        for (Id id : newMap.keySet()) {
            Product2 oldRec = oldMap.get(id);
            Product2 newRec = newMap.get(id);
            List<String> changes = new List<String>();
            for (String fieldName : fieldMap.keySet()) {
                Schema.DescribeFieldResult d = fieldMap.get(fieldName).getDescribe();
                if (!d.isUpdateable() || d.isCalculated())
                    continue;
                Object oldVal = oldRec.get(fieldName);
                Object newVal = newRec.get(fieldName);
                if (String.valueOf(oldVal) != String.valueOf(newVal)) {
                    changes.add(d.getLabel() + ': ' +String.valueOf(oldVal) + ' → ' +String.valueOf(newVal) );
                }
            }

            if (!changes.isEmpty()) {

                audits.add(new PIM_Audit_Trail__c(
                    Product__c = id,
                    Action_Type__c = 'Update',
                    Description__c = String.join(changes, '\n')
                ));
            }
        }

        if (!audits.isEmpty()) {
            insert as user audits;
        }

        isRunning = false;
    }

   
}