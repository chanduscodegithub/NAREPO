@isTest
private class HomePageReportControllerTest {
    
    @testSetup static void createTestData() {               
        
        Account accCM = new Account();
        accCM.Name = 'Competitive Medical CM';
        accCM.Subtype__c ='Specialty Benefits Only';
        accCM.UHC_Medical_Members__c = 10;
        accCM.UHC_Dental_Members__c = 20;
        accCM.UHC_Vision_Members__c = 30;
        accCM.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM;   
        
        Account accCM1 = new Account();
        accCM1.Name = 'Competitive Medical CM1';
        accCM1.Subtype__c ='Specialty Benefits Only';
        accCM1.UHC_Medical_Members__c = 10;
        accCM1.UHC_Dental_Members__c = 20;
        accCM1.UHC_Vision_Members__c = 30;
        accCM1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM1;        
 
    }
   
    public testMethod static void validategetAccountTeamMebers(){                    
        Test.startTest();
        HomePageReportController.getAccountReportData(true,false,'','');                             
        Test.stopTest();
    }   
}