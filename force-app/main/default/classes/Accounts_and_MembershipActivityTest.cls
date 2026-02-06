@isTest
private class Accounts_and_MembershipActivityTest {

    @testSetup static void createTestData() {
        Account accCF = new Account();
        accCF.Name = 'Consulting Firm Test';
        accCF.Subtype__c ='Consulting Firm';
        accCF.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert accCF;
        
        Account accFirm1 = new Account();
        accFirm1.Name = 'account Firm1';
        accFirm1.Subtype__c ='National Accounts - East';
        accFirm1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accFirm1;               
        
        Account accFirm2 = new Account();
        accFirm2.Name = 'account Firm2';
        accFirm2.Subtype__c ='National Accounts - East';
        accFirm2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accFirm2;
        
        Contact contact1 = new Contact();
        contact1.FirstName = 'Jnanesh';
        contact1.LastName = 'Avaradi';
        contact1.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        contact1.AccountId = accCF.Id;
        insert contact1;
        
        AccountCFJunction__c acc_Con_Firm = new AccountCFJunction__c();
        acc_Con_Firm.ConsultingFirm__c = accCF.Id;
        acc_Con_Firm.AccountFirm__c = accFirm1.Id;
        insert acc_Con_Firm;
        
        AccountContactRelation acc_Con_Rel = new AccountContactRelation();
        acc_Con_Rel.ContactId = contact1.Id;       
        acc_Con_Rel.AccountId = accFirm2.Id;
        insert acc_Con_Rel;
        
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
    
    public testMethod static void validateCompaniesAndMembers(){
    	Id acctId = [SELECT Id FROM Account WHERE Name='Consulting Firm Test' LIMIT 1].Id;
        Test.startTest();        
        Accounts_and_MembershipActivity.AccountandMembershipActivityResult accountandMembershipActivityObj = new Accounts_and_MembershipActivity.AccountandMembershipActivityResult();    
        List<AccountContactRelation> accountContactRel = new List<AccountContactRelation>();
       // List<OpportunityContactRole> MembershipActivityList = new List<OpportunityContactRole>();
        
        accountandMembershipActivityObj = Accounts_and_MembershipActivity.getAccountsAndMembershipActivityOnAppletLoad(acctId,'AccountFirm__r.Name','Opportunity.Name','ASC');
        try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getAccountsAndMembershipActivityOnAppletLoad(acctId,'AccountFir','Opportun','ASC');  
        }catch(Exception e){
            
        }
        try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getAccountsAndMembershipActivityOnAppletLoad(null,'AccountFir','Opportun','ASC');  
        }catch(Exception e){
            
        }
        
        accountandMembershipActivityObj = Accounts_and_MembershipActivity.getMembersipActivities(acctId,'Opportunity.Name','ASC');
         try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getMembersipActivities(null,'Opportunity.Name','ASC'); 
        }catch(Exception e){
            
        }
         try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getMembersipActivities(acctId,'Opportunit','ASC'); 
        }catch(Exception e){
            
        }
        accountandMembershipActivityObj = Accounts_and_MembershipActivity.getMembershipActivityOnSortLoad(acctId,'Opportunity.Name','ASC');
        try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getMembershipActivityOnSortLoad(null,'Opportunity.Name','ASC');
        }catch(Exception e){
            
        }
        try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getMembershipActivityOnSortLoad(acctId,'Opportunit','ASC');
        }catch(Exception e){
            
        }
        accountandMembershipActivityObj = Accounts_and_MembershipActivity.getAccountsSortOnAppletLoad(acctId,'AccountFirm__r.Name','ASC');
        try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getAccountsSortOnAppletLoad(null,'AccountFirm__r.Name','ASC');
        }catch(Exception e){
            
        }
         try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getAccountsSortOnAppletLoad(acctId,'AccountFir','ASC');
        }catch(Exception e){
            
        }
        accountandMembershipActivityObj = Accounts_and_MembershipActivity.getAccountsAndMembershipActivityOnShowFullListLoad(acctId,'AccountFirm__r.Name','ASC',1);
        try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getAccountsAndMembershipActivityOnShowFullListLoad(null,'AccountFirm__r.Name','ASC',1);
        }catch(Exception e){
            
        }
         try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getAccountsAndMembershipActivityOnShowFullListLoad(acctId,'AccountFi','ASC',1);
        }catch(Exception e){
            
        }
        accountandMembershipActivityObj = Accounts_and_MembershipActivity.getMembershipActivityOnShowFullListLoad(acctId,'Opportunity.Name','ASC',1);
        try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getMembershipActivityOnShowFullListLoad(null,'Opportunity.Name','ASC',1);
        }catch(Exception e){
            
        }
        try{
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getMembershipActivityOnShowFullListLoad(acctId,'Opportunit','ASC',1);
        }catch(Exception e){
            
        }
        
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        System.runAs(readOnlyUser) {
            accountandMembershipActivityObj = Accounts_and_MembershipActivity.getAccountsSortOnAppletLoad(acctId,'AccountFirm__r.Name','ASC');
            //System.assert(clmListCM.size()>0);
                           
        }
        Test.stopTest();
    }
}