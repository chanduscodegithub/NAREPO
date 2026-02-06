@isTest
private class AccountAggregator_MemberComapniesTest {
    
    @testSetup static void createTestData() {
        List<Account> acc = new List<Account>();
        acc.add(new Account(Name='testAccount',Subtype__c ='Collaborative Ventures Group (CVG)',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId()));
        acc.add(new Account(Name='testAccount1',Subtype__c ='Business Group on Health (BGH)',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId()));
        insert acc;
        
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;

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
        Id acct1 = [SELECT Id FROM Account WHERE Name='testAccount1' LIMIT 1].Id;
        AccountAggregator_MemberCompaniesCtrl.getAccountType(acct);
        AccountAggregator_MemberCompaniesCtrl.getAccountType(acct1);
        
        try{
            AccountAggregator_MemberCompaniesCtrl.getAccountType(null);
        }catch(Exception e){

        }
        
        AccountAggregator_MemberCompaniesCtrl.CVG_BGH_AccountResult contactList = AccountAggregator_MemberCompaniesCtrl.getAccountAggregator_MemberCompanies(acct, 1, 'Name', 'ASC');
        
        AccountAggregator_MemberCompaniesCtrl.CVG_BGH_AccountResult contactList1 = AccountAggregator_MemberCompaniesCtrl.getAccountAggregator_MemberCompanies(acct1, 1, 'Name', 'ASC');
        

        try{
            AccountAggregator_MemberCompaniesCtrl.CVG_BGH_AccountResult queryExc = AccountAggregator_MemberCompaniesCtrl.getAccountAggregator_MemberCompanies(acct, 1, 'Name', 'AS');
        }catch(Exception e){

        }
        
        try{
            AccountAggregator_MemberCompaniesCtrl.CVG_BGH_AccountResult queryExc = AccountAggregator_MemberCompaniesCtrl.getAccountAggregator_MemberCompanies(null, 1, 'Name', 'AS');
        }catch(Exception e){

        }
        
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        
        System.runAs(readOnlyUser) {
            try{
                AccountAggregator_MemberCompaniesCtrl.CVG_BGH_AccountResult contactNoAccess = AccountAggregator_MemberCompaniesCtrl.getAccountAggregator_MemberCompanies(acct, 1, 'Name', 'ASC');
            }catch(Exception e){

            }
        }
        
        System.runAs(readOnlyUser) {
            try{
                AccountAggregator_MemberCompaniesCtrl.getAccountType(acct);
            }catch(Exception e){
                
            }
        }
        
        test.stopTest();
    }
    
}