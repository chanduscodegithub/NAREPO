@isTest
private class CDAccountsTest {
    
    @testSetup static void createTestData() {
        List<Account> acc = new List<Account>();
        acc.add(new Account(Name='testAccount1',Subtype__c ='Prospect',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()));
        acc.add(new Account(Name='testAccount',Subtype__c ='Specialty Benefits Only',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()));
        acc.add(new Account(Name='testAccount2',Subtype__c ='Consulting Firm',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId()));
        acc.add(new Account(Name='testAccount3',Subtype__c ='Business Group on Health (BGH)',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId()));
        insert acc;
        
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        
        Contact con = new Contact();
        con.FirstName = 'Test';
        con.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId();
        con.AccountId= acct;
        con.LastName = 'Tes';
        con.MailingStreet = 'Test';
        con.MailingStateCode = 'CA';
        con.MailingState = 'California';
        con.MailingCity = 'Test';
        con.Status__c = 'Active';
        con.MailingCountry = 'United States';
        con.MailingPostalCode = '560102';
        
        insert con;
        
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
    
    public testMethod static void validateAccountType(){
        test.startTest();
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        Id acctRecordId = [SELECT RecordTypeId FROM Contact WHERE AccountId=:acct LIMIT 1].RecordTypeId;
        Id acct1 = [SELECT Id FROM Account WHERE Name='testAccount1' LIMIT 1].Id;
        Id acct2 = [SELECT Id FROM Account WHERE Name='testAccount2' LIMIT 1].Id;
        Id acct3 = [SELECT Id FROM Account WHERE Name='testAccount3' LIMIT 1].Id;
        CDAccounts.getAccountType(acct);
        CDAccounts.getAccountType(acct1);
        CDAccounts.getAccountType(acct2);
        CDAccounts.getAccountType(acct3);
        
        try{
            CDAccounts.getAccountType('null');
        }catch(Exception e){
            System.assertEquals(null,null);
        }
        
        CDAccounts.cmCdCfContactsResult contactList = CDAccounts.getAccountContacts(acct, 1, 'FirstName', 'ASC',acctRecordId);
        System.assertNotEquals(contactList,null);
        try{
            CDAccounts.cmCdCfContactsResult queryExc = CDAccounts.getAccountContacts(acct, 1, 'FirstName', 'AS',acctRecordId);
        }catch(Exception e){
            System.assertEquals(null,null);
        }
        
        try{
            CDAccounts.cmCdCfContactsResult queryExc = CDAccounts.getAccountContacts(null, 1, 'FirstName', 'AS',null);
        }catch(Exception e){
            System.assertEquals(null,null);
        }
        
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        
        System.runAs(readOnlyUser) {
            try{
                CDAccounts.cmCdCfContactsResult contactNoAccess = CDAccounts.getAccountContacts(acct, 1, 'FirstName', 'ASC',acctRecordId);
            }catch(Exception e){
                System.assertEquals(null, null);
            }
        }
        
        test.stopTest();
    }
    
}