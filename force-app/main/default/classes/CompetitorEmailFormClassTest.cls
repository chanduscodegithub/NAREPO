@isTest
private class CompetitorEmailFormClassTest {
    
    @testSetup static void createTestData() {
        
        Account acc = new Account();
        acc.Name = 'testAccountSurvey';
        acc.Subtype__c ='Enterprise Strategic Accounts';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert acc;                               
    }
   
    public testMethod static void validategetAccountTeamMebers(){
        Id acct = [SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1].Id;
      	Boolean mailSent = false;
        List<MultiPickListWrapper> pickList = new List<MultiPickListWrapper>();
        Test.startTest();
        CompetitorEmailFormClass.getProductsInvolved();
        //System.assert(pickList.size()>0);
        String compName = 'From Test Class';
        mailSent = CompetitorEmailFormClass.sendMailCompetitor(compName,'Test web address','Medical','Test address','Test additional comments',acct);
        System.assert(mailSent);       
        Test.stopTest();
    }
    
     public class MultiPickListWrapper{
        @AuraEnabled
        String label {get;set;}
        
        @AuraEnabled
        String value {get;set;}
    }
}