@isTest
private class CurrentProductApex_Test {
    
    @testSetup static void createTestData() {
        
        Account totAcc = new Account();
        totAcc.Name = 'Test Acc';
        totAcc.Subtype__c ='Consulting Firm';
        totAcc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert totAcc;                                     
        
        List<ProductMix__c> productMixRecords = new List<ProductMix__c>();
               
        productMixRecords.add(new ProductMix__c(           
            Name = 'Test',
            Current_Product_Name__c = 'test',      
            AccountFirm__c = totAcc.Id));   
        
         productMixRecords.add(new ProductMix__c(           
            Name = 'Delete Test',
            Current_Product_Name__c = 'test',      
            AccountFirm__c = totAcc.Id));           
       
        insert productMixRecords;                
        
         User readOnlyUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDevReadOnly@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            Position__c='Test User',
            LocaleSidKey = 'en_US');
        
        insert readOnlyUser;
 
    }
   
    public testMethod static void validategetAccountTeamMebers(){        
      
        //List<CurrentProductApex.ProductMix> 
        Id acctTest = [SELECT Id FROM Account WHERE Name='Test Acc' LIMIT 1].Id;
        Id prodId = [SELECT Id FROM ProductMix__c WHERE Name='Delete Test' LIMIT 1].Id;
        Test.startTest();
        
        CurrentProductApex.ProductMix prodMix = CurrentProductApex.fetchdata(acctTest,5);               
        System.assert(prodMix != null);
        
        CurrentProductApex.DeleteRecord(prodId);
        
        Boolean userRole = CurrentProductApex.getUserRole(acctTest);
        System.assert(userRole);
                
        Test.stopTest();
    }
}