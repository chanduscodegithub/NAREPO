global class ClearNASaleCSSCEValidationBatch implements Database.Batchable<SObject> {

    global Database.QueryLocator start(Database.BatchableContext BC) {
        return Database.getQueryLocator([SELECT Id, SCE_Validated__c, Survey_Validated_Date_time__c FROM CM_Account_Team_History__c WHERE SCE_Validated__c = true and Survey_Validated_Date_time__c != null WITH USER_MODE]);
    }

    global void execute(Database.BatchableContext BC, List<CM_Account_Team_History__c> allNASaleRec) {
        List<CM_Account_Team_History__c> recordsToUpdate = new List<CM_Account_Team_History__c>();

        for (CM_Account_Team_History__c allRec : allNASaleRec) {
            CM_Account_Team_History__c record = (CM_Account_Team_History__c) allRec;
            record.SCE_Validated__c = false;
            record.Survey_Validated_Date_time__c = null;
            recordsToUpdate.add(record);
        }

        if (!recordsToUpdate.isEmpty()) {
            update as User recordsToUpdate;
        }
    }

    global void finish(Database.BatchableContext BC) {
        System.debug('SCE Validation and DateTime fields cleared.');
    }
}