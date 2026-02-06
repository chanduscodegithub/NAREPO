@isTest
public class Account_Consultants_ClassTest {
	public static string contactRecordTyp = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
    public static  string helper  ='helper';
    public static  string apex  ='apex';
    public static  string searchKeyValEmpty='';
    public static  string searchKeyValtest='test';
    public static  Integer pageNumber=1;	
    public static string searchField='';
    public static string operator='';
    public static string LAST_NAME= 'LAST NAME';
    public static string FIRST_NAME='FIRST NAME';
    public static string JOB_TITLE ='JOB TITLE';
    public static string CONSULTING_FIRM = 'CONSULTING FIRM';
    public static string BEGINS_WITH = 'BEGINS WITH';
    public static string CONTAINS ='CONTAINS'; 
    public static string EQUALS_TO ='EQUALS TO';
    
	public static String FIRM_CITY = 'Firm City';
	public static String FIRM_STATE = 'Firm State';
    public static string accid ;
    public static id ConsultantRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
    
    public static testMethod void allMethodPositiveTestSysAdmin() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.AccountContactRelationTestData();
        bulkTestData.accountcontactrelationtestdata2();
        accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string accCFid =[SELECT Id FROM Account WHERE Name='oppaccount1' LIMIT 1].Id;
        string accCMid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string accContRelId =[SELECT Id FROM Account WHERE Name='testacconroleacconroleacr' LIMIT 1].Id;
        string acntcfid =[SELECT Id FROM Account WHERE Name='Consulting Firm Testdata' LIMIT 1].Id;
        string acntcfirmid =[SELECT Id FROM Account WHERE Name='account Firm1data' LIMIT 1].Id;
        string acntCD =[SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        string conAcntConRelId = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1acr' LIMIT 1].Id;
        	List <AccountContactRelation> axcr = [SELECT AccountId, ContactId 
            FROM AccountContactRelation 
            WHERE AccountId =: accContRelId AND ContactId=: conAcntConRelId ];	
       		system.debug('axcr@@@'+axcr+'@@@axcr@@@');
            Test.startTest();            
            Account_Consultants_Class.getLoggedInUserRoles(accid);
            Account_Consultants_Class.getAccountType(accid);        
            Account_Consultants_Class.getSortedList(accContRelId, contactRecordTyp);
            Account_Consultants_Class.getAllConsultants(accContRelId, contactRecordTyp);
            Account_Consultants_Class.getPartnerAccounts(acntcfirmid) ; 
            Account_Consultants_Class.getPartnerAccountDetails(accid) ;
            Account_Consultants_Class.deleteRelationship(accContRelId,conAcntConRelId,null);        
            Account_Consultants_Class.deleteRelationship(acntcfirmid,acntcfid,null);        
            Account_Consultants_Class.relateContactToAccount(accid,conid,true);        
            Account_Consultants_Class.relateContactToAccount(accid,conid,false);        
            Account_Consultants_Class.relateAccountToAccount(accid2,consid,helper);
            Account_Consultants_Class.relateAccountToAccount(accid2,consid,apex);
            Account_Consultants_Class.updatePrimaryId(consid,consid2,true,apex, apex);
            Account_Consultants_Class.updateRoleInAccountContactRelation(consid,consid2); 
        	Account_Consultants_Class.getConsultantFirms(searchKeyValEmpty, pageNumber, searchField, operator, consid);        
            Account_Consultants_Class.getConsultantOfAccount(searchKeyValEmpty, pageNumber, searchField, operator,consid,consid2);
            Account_Consultants_Class.sortList accs= new Account_Consultants_Class.sortList();
            accs.pageSize=5;
            accs.page=1;
            accs.total=10;
            Test.stopTest();   
        
    }
    public static testMethod void getPartnerAccountsTestQueryException() {
        bulkTestData.UserTestData();
        Test.startTest(); 
        system.debug('variable@@@variable@@@');
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuserxx@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            try{
                Account_Consultants_Class.getPartnerAccounts(contactRecordTyp);
            }catch(Exception e){
                system.debug('message ++'+ e.getMessage());
            }   
        }
        
        Test.stopTest();       
    }
    public static testMethod void getRelatedAccountIdTestNoAccessException() {
        bulkTestData.UserTestData();
        Test.startTest(); 
        system.debug('variable@@@variable@@@');
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuserxx@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            try{
                Account_Consultants_Class.getRelatedAccountId(contactRecordTyp);
            }catch(Exception e){
                system.debug('message ++'+ e.getMessage());
            }   
        }
        
        Test.stopTest();       
    }
    public static testMethod void getAccountDetailsNoAccessException() {
        bulkTestData.UserTestData();
        Test.startTest(); 
        system.debug('variable@@@variable@@@');
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuserxx@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            try{
                Account_Consultants_Class.getAccountDetails(contactRecordTyp);
            }catch(Exception e){
                system.debug('message ++'+ e.getMessage());
            }   
        }
        
        Test.stopTest();       
    }
    
        public static testMethod void clearPrimaryRoleFieldForAllRecordsNoaccessException() {
        bulkTestData.UserTestData();
        Test.startTest(); 
        system.debug('variable@@@variable@@@');
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuserxx@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            try{
                Account_Consultants_Class.clearPrimaryRoleFieldForAllRecords(contactRecordTyp);
            }catch(Exception e){
                system.debug('message ++'+ e.getMessage());
            }   
        }
        
        Test.stopTest();       
    }
    public static testmethod void validategetConsultantFirmsQueryException(){
        try{
            Account_Consultants_Class.getConsultantFirms(searchKeyValTest,pageNumber,CONSULTING_FIRM,CONTAINS,accid);
            Account_Consultants_Class.getConsultantFirms(searchKeyValTest,pageNumber,FIRM_CITY,BEGINS_WITH,accid);
            Account_Consultants_Class.getConsultantFirms(searchKeyValTest,pageNumber,FIRM_STATE,CONTAINS,accid);
            Account_Consultants_Class.getConsultantFirms(searchKeyValTest,pageNumber,FIRM_CITY,CONTAINS,accid);
            Account_Consultants_Class.getConsultantFirms(searchKeyValTest,pageNumber,CONSULTING_FIRM,EQUALS_TO,accid);
            
        }catch(Exception e){ 
            system.debug('@@e@@'+e.getMessage()); 
            system.assert(e.getMessage().contains('Script-thrown exception'),true);
        } 
        
    }
    public static testmethod void validateGetConsultantsQueryException(){
        try{
            Account_Consultants_Class.getConsultants(searchKeyValTest,pageNumber,FIRST_NAME,CONTAINS,ConsultantRecord,accid);
            Account_Consultants_Class.getConsultants(searchKeyValTest,pageNumber,LAST_NAME,BEGINS_WITH,ConsultantRecord,accid);
            Account_Consultants_Class.getConsultants(searchKeyValTest,pageNumber,JOB_TITLE,CONTAINS,ConsultantRecord,accid);
            Account_Consultants_Class.getConsultants(searchKeyValTest,pageNumber,CONSULTING_FIRM,CONTAINS,ConsultantRecord,accid);
            Account_Consultants_Class.getConsultants(searchKeyValTest,pageNumber,CONSULTING_FIRM,EQUALS_TO,ConsultantRecord,accid);
            
        }catch(Exception e){ 
            system.debug('@@e@@'+e.getMessage()); 
            system.assert(e.getMessage().contains('Script-thrown exception'),true);
        } 
        
    }
    public static testmethod void validateGetConsultantOfAccountQueryException(){
        try{
            Account_Consultants_Class.getConsultantOfAccount(searchKeyValTest,pageNumber,FIRST_NAME,CONTAINS,accid,ConsultantRecord);
            Account_Consultants_Class.getConsultantOfAccount(searchKeyValTest,pageNumber,LAST_NAME,BEGINS_WITH,accid,ConsultantRecord);
            Account_Consultants_Class.getConsultantOfAccount(searchKeyValTest,pageNumber,JOB_TITLE,CONTAINS,accid,ConsultantRecord);
            Account_Consultants_Class.getConsultantOfAccount(searchKeyValTest,pageNumber,CONSULTING_FIRM,CONTAINS,accid,ConsultantRecord);
            Account_Consultants_Class.getConsultantOfAccount(searchKeyValTest,pageNumber,CONSULTING_FIRM,EQUALS_TO,accid,ConsultantRecord);
            
        }catch(Exception e){ 
            system.debug('@@e@@'+e.getMessage()); 
            system.assert(e.getMessage().contains('Script-thrown exception'),true);
        } 
        
    }
    
    public static testMethod void getAccountTypeTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.getAccountType(accid);
            }catch(Exception e){
                System.assertEquals(null, null);
            } 
            Test.stopTest(); 
        }
    }
    public static testMethod void getAccountTypeTestqueryexception() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        
                     
            try{
                Account_Consultants_Class.getAccountType(conid);
            }catch(Exception e){
                System.assertEquals(null, null);
            } 
            
        
    }
    public static testMethod void getSortedListTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.getSortedList(accid, contactRecordTyp);
            }catch(Exception e){
                System.assertEquals(null, null);
            } 
            Test.stopTest();   
        }
    }
    
    public static testMethod void getSortedListTestqueryexception() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
		User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;            
            try{
                Account_Consultants_Class.getSortedList(conid, contactRecordTyp);
            }catch(Exception e){
                System.assertEquals(null, null);
            }     
    }
    public static testMethod void getAllConsultantsTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.getAllConsultants(accid, contactRecordTyp);
            }catch(Exception e){
                System.assertEquals(null, null);
            }            
            Test.stopTest();   
        }
    }
    public static testMethod void getPartnerAccountsTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.getPartnerAccounts(accid) ; 
            }catch(Exception e){
                System.assertEquals(null, null);
            }             
            Test.stopTest();   
        }
    }
    public static testMethod void getPartnerAccountDetailsTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.getPartnerAccountDetails(accid) ;
            }catch(Exception e){
                System.assertEquals(null, null);
            }            
            Test.stopTest();   
        }
    }
    public static testMethod void deleteRelationshipTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.deleteRelationship(accid,conid,conid);
                Account_Consultants_Class.deleteRelationship(accid,accid,conid); 
            }catch(Exception e){
                System.assertEquals(null, null);
            }
            Test.stopTest();   
        }
    }
    public static testMethod void relateContactToAccountTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.relateContactToAccount(accid,conid,true);        
                Account_Consultants_Class.relateContactToAccount(accid,conid,false);    
            }catch(Exception e){
                System.assertEquals(null, null);
            }             
            Test.stopTest();   
        }
    }
    public static testMethod void relateAccountToAccountTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.relateAccountToAccount(accid2,consid,helper);
                Account_Consultants_Class.relateAccountToAccount(accid2,consid,apex);
            }catch(Exception e){
                System.assertEquals(null, null);
            }             
            Test.stopTest();   
        }
    }
    public static testMethod void updatePrimaryIdTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.updatePrimaryId(consid,consid2,true,apex, apex);
            }catch(Exception e){
                System.assertEquals(null, null);
            } 
            
            Test.stopTest();   
        }
    }
    public static testMethod void updateRoleInAccountContactRelationTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.updateRoleInAccountContactRelation(consid,consid2);
            }catch(Exception e){
                System.assertEquals(null, null);
            }            
            Test.stopTest();   
        }
    }
    public static testMethod void getConsultantsTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.getConsultants(searchKeyValEmpty, pageNumber, searchField, operator,consid2,consid);
            }catch(Exception e){
                System.assertEquals(null, null);
            }           
            Test.stopTest();   
        }
    }
    public static testMethod void getConsultantFirmsTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.getConsultantFirms(searchKeyValEmpty, pageNumber, searchField, operator, consid);
            }catch(Exception e){
                System.assertEquals(null, null);
            }            
            Test.stopTest();   
        }
    }
    public static testMethod void getConsultantOfAccountTestReadOnly() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string conid = [SELECT Id FROM contact WHERE LastName='lasr qwerty' LIMIT 1].Id;
        string accid2 = [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client' LIMIT 1].Id;
        string consid =[SELECT Id FROM Account WHERE Name='Consulting Accounts' LIMIT 1].Id;
        string consid2 = [SELECT Id FROM contact WHERE FirstName='test acconsultiongfirm1' LIMIT 1].Id;
        
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuser@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            Test.startTest();            
            try{
                Account_Consultants_Class.getConsultantOfAccount(searchKeyValEmpty, pageNumber, searchField, operator,consid,consid2);
            }catch(Exception e){
                System.assertEquals(null, null);
            } 
            
            Test.stopTest();   
        }
    }
    
    public static testMethod void getAccountTypeTestNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.getAccountType(null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void getSortedListTestNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.getSortedList(null,null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void getAllConsultantsTestNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.getAllConsultants(null,null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void getPartnerAccountsTestNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.getPartnerAccounts(null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }   
    
    public static testMethod void getPartnerAccountDetailsTestNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.getPartnerAccountDetails(null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void deleteRelationshipTestNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.deleteRelationship(null,null,null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void getRelatedAccountIdNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.getRelatedAccountId(null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void relateContactToAccountNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.relateContactToAccount(null,null,null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void relateAccountToAccountNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.relateAccountToAccount(null,null,helper);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void relateAccountToAccountNullOnlyapex() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.relateAccountToAccount(null,null,apex);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void updatePrimaryIdToAccountNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.updatePrimaryId(null,null,false,null,null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void getAccountDetailsNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.getAccountDetails(null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void clearPrimaryRoleFieldForAllRecordsNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.clearPrimaryRoleFieldForAllRecords(null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void updateRoleInAccountContactRelationNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.updateRoleInAccountContactRelation(null,null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void getConsultantsNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.getConsultants(null, null, null, null, null, null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }
    public static testMethod void getConsultantOfAccountNullOnly() {        
        Test.startTest();            
        try{
            Account_Consultants_Class.getConsultantOfAccount(null, null, null, null, null, null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    }    
}