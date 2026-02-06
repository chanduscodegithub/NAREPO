@isTest
private class ETSBECaseTest {
    
    @testSetup static void createTestData() {
        List<Account> acc = new List<Account>();
        acc.add(new Account(Name='testAccount',Subtype__c ='Specialty Benefits Only',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()));
        insert acc;
        
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        
        Case con = new Case();
        con.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('General Action').getRecordTypeId();
        con.AccountId= acct;
        insert con;
        
        User readOnlyUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@asdf.com',
            Username = 'uhgDevReadOnly@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US');
        
        insert readOnlyUser;
        
    }
    
    public testMethod static void validateAccountType(){
        test.startTest();
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        
        try{
            ETSBECase.getRecordType('Case');
        }catch(Exception e){
        }
        
        ETSBECase.getETSCase(acct, 1, 'CreatedDate', 'ASC');
        
        try{
            ETSBECase.getETSCase(acct, 1, 'CreatedDate', 'AS');
        }catch(Exception e){
            
        }
        
        try{
            ETSBECase.getETSCase(null, 1, 'CreatedDate', 'AS');
        }catch(Exception e){
            
        }
        
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        
        System.runAs(readOnlyUser) {
            try{
                ETSBECase.getETSCase(acct, 1, 'CreatedDate', 'ASC');
            }catch(Exception e){
                
            }
        }
        
        System.runAs(readOnlyUser) {
            try{
                ETSBECase.getRecordType('Case');
            }catch(Exception e){
                
            }
        }
        
        test.stopTest();
    }
    
}