global class ClearCSSCEValidationBatch implements Database.Batchable<SObject> {

    global Database.QueryLocator start(Database.BatchableContext BC) {
        return Database.getQueryLocator([SELECT Id, SCE_Validated__c, Survey_Validated_Date_time__c FROM Service_AMT__c WHERE SCE_Validated__c = true and Survey_Validated_Date_time__c != null WITH USER_MODE]);
    }

    global void execute(Database.BatchableContext BC, List<Service_AMT__c> allServiceAMT) {
        List<Service_AMT__c> recordsToUpdate = new List<Service_AMT__c>();

        for (Service_AMT__c allRec : allServiceAMT) {
            Service_AMT__c record = (Service_AMT__c) allRec;
            record.SCE_Validated__c = false;
            record.Survey_Validated_Date_time__c = null;
            recordsToUpdate.add(record);
        }

        if (!recordsToUpdate.isEmpty()) {
            update recordsToUpdate;
        }
    }

    global void finish(Database.BatchableContext BC) {
        System.debug('SCE Validation and DateTime fields cleared.');
        ClearNASaleCSSCEValidationBatch nextBatch = new ClearNASaleCSSCEValidationBatch();
        Database.executeBatch(nextBatch, 200);
    }
}