@isTest
public class UpdateADSRecordsTest {
	@testSetup
    static void setup(){
        List<ADS__c> ads = new List<ADS__c>();
        for(Integer i=0;i<10;i++){
            ads.add(new ADS__c(Name = 'ADS ' + i, FirstName__c = 'FN ' + i, Email__c = 'FN'+i+'@abc.com'));
        }
        insert ads;
    }
    
    static testmethod void test(){
        Test.startTest();
        UpdateADSRecords uar = new UpdateADSRecords();
        Id batchId = Database.executeBatch(uar);
        Test.stopTest();
        System.assertEquals(10, [select count() from ADS__c where Duplicate__c = true]);
    }
}