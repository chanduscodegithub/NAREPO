@isTest
public class UpdateADSRecordsTest2 {
	@testSetup
    static void setup(){
        List<ADS__c> ads = new List<ADS__c>();
        for(Integer i=0;i<10;i++){
            ads.add(new ADS__c(Name = 'ADS ' + i, FirstName__c = 'FN ' + i, Email__c = 'FN'+i+'@abc.com', Duplicate__c = true, Employee_ID__c = 'E'+i));
        }
        insert ads;
    }
    
    static testmethod void test(){
        Test.startTest();
        UpdateADSRecords2 uar = new UpdateADSRecords2();
        Id batchId = Database.executeBatch(uar);
        Test.stopTest();
        System.assertEquals(10, [select count() from ADS__c where Duplicate__c = false]);
    }
}