public with sharing class EBDDataController_shruthi {
    @AuraEnabled(cacheable=true)
    public static Account getAccount(String accountId) {
        return [
            SELECT Id, Name, Tenure__c, BGH__c, Current_Deal_Start_Date__c, Current_Deal_Next_Renewal_Date__c
            FROM Account
            WHERE Id = :accountId
            LIMIT 1
        ];
    }

    @AuraEnabled
    public static void saveEBDRecord(Id accountId, String briefDescription, String relationshipHistory) {
        try {
            EBD__c newRecord = new EBD__c();
            newRecord.Company__c= accountId; // assuming you have a lookup to Account, adjust if different
            newRecord.Brief_Company_Description__c = briefDescription;
            newRecord.Relationship_History__c = relationshipHistory;

            upsert newRecord;
        } catch (Exception e) {
            // Optionally, handle exceptions and throw a custom exception
            throw new AuraHandledException('Error saving EBD record: ' + e.getMessage());
        }
    }
}