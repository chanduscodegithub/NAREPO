@isTest
public class ClearCSSCEValidationBatchTest {
    @testSetup
    static void setupTestData() {
        Account acc = new Account();
            acc.Name = 'Test Account Record';
            acc.Subtype__c ='National Accounts - East';
            acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
            insert acc;
        
        List<Service_AMT__c> amtRecords = new List<Service_AMT__c>();

        for (Integer i = 0; i < 10; i++) {
            amtRecords.add(new Service_AMT__c(
                Name = 'Test AMT Record ' + i,
                Company__c = acc.Id, User_Contact_Id__c = '1',
                SCE_Validated__c = true,
                Survey_Validated_Date_time__c = DateTime.now().addDays(-i)
            ));
        }

        insert amtRecords;
        
        List<CM_Account_Team_History__c> NASalesRecords = new List<CM_Account_Team_History__c>();

        for (Integer i = 0; i < 10; i++) {
            NASalesRecords.add(new CM_Account_Team_History__c(
                Name = 'Test AMT Record ' + i,
                Account_Firm__c = acc.Id,
                SCE_Validated__c = true,
                Survey_Validated_Date_time__c = DateTime.now().addDays(-i)
            ));
        }

        insert NASalesRecords;
    }

    @isTest
    static void testBatchExecution() {
        Test.startTest();
        ClearCSSCEValidationBatch batch = new ClearCSSCEValidationBatch();
        Database.executeBatch(batch, 200);
        Test.stopTest();

    }
    
    @isTest
    static void testBatchNAExecution() {
        Test.startTest();
        ClearNASaleCSSCEValidationBatch batch = new ClearNASaleCSSCEValidationBatch();
        Database.executeBatch(batch, 200);
        Test.stopTest();

    }
}