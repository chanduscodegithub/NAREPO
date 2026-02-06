@isTest
public class SalesIncentiveValidationControllerTest {
    
    @testSetup static void createTestData() {
        
        Account acc = new Account();
        acc.Name = 'TestAccount';
        acc.Subtype__c ='CVG';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert acc;
        
        List<User> userListToInsert = new List<User>();
        
        User usr = new User(
            LastName = 'User',
            FirstName='Test',
            Alias = 'testuser',
            Email = 'testuser@crmit.com',
            Username = 'crmittestuser1@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User');
        
		userListToInsert.add(usr);
        
        CM_Account_Team_History__c naSalesTeamMember=new CM_Account_Team_History__c();
        naSalesTeamMember.Account_Firm__c=acc.Id;
		naSalesTeamMember.User__c=usr.Id;
        
        insert naSalesTeamMember;
        
        User serviceUser = new User(
            LastName = 'User2',
            FirstName='Test',
            Alias = 'srvcuser',
            Email = 'testuser2@crmit.com',
            Username = 'crmittestuser2@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'NA Services Community Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User');
        
		userListToInsert.add(serviceUser);
        
        User csiAdmin = new User(
            LastName = 'User3',
            FirstName='Test',
            Alias = 'csiadmin',
            Email = 'testuser3@crmit.com',
            Username = 'crmittestuser3@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'CSI Administrator' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User');
        
		userListToInsert.add(csiAdmin);
        
        User systemAdmin = new User(
            LastName = 'User6',
            FirstName='Test',
            Alias = 'sysadmin',
            Email = 'sysadmin@crmit.com',
            Username = 'sysadmin@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'System Administrator' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User');
        
        userListToInsert.add(systemAdmin);

        
        User compensationTeamUser = new User(
            LastName = 'User5',
            FirstName='Test',
            Alias = 'cmpusr',
            Email = 'testuser5@crmit.com',
            Username = 'crmittestuser5@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Compensation Team Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User');
        
		userListToInsert.add(compensationTeamUser);
        
        insert userListToInsert;
        
        
        List<String> prdctLineLst=new List<String>();
        prdctLineLst.add('Dental');
        prdctLineLst.add('Financial Accounts');
        prdctLineLst.add('Financial Protection');
        prdctLineLst.add('Group Retiree (URS)');
        prdctLineLst.add('Medical');
        prdctLineLst.add('Pharmacy');
        prdctLineLst.add('Stop Loss');
        prdctLineLst.add('Vision');

        
        
        List<Renewal_Status__c> rnwlStatusLst=new List<Renewal_Status__c>();
        
        for(String eachPrdctLine:prdctLineLst){
          Renewal_Status__c rnwlStatus=new Renewal_Status__c();
           rnwlStatus.Name=eachPrdctLine;
            rnwlStatus.Product_Line__c=eachPrdctLine;
            rnwlStatus.isRenewalStatusRecord__c=true;
            rnwlStatus.Sales_Cycle__c='IY19, 1/1/20';
            if(eachPrdctLine=='Medical' || eachPrdctLine=='Financial Protection'){
               rnwlStatus.Eligible_for_Sales_Incentives__c='No'; 
            }
            else{
                rnwlStatus.Eligible_for_Sales_Incentives__c='Yes'; 
            }
            rnwlStatus.Company__c=acc.Id;
            rnwlStatus.Efective_Date__c=system.today();
            rnwlStatusLst.add(rnwlStatus);
        }
        insert rnwlStatusLst;
        
        
        
        
        
    }
    
    
    @isTest static void testGetRenewalStatus(){
        Account acc=[Select Id from Account where Name='TestAccount'];
        
        Test.startTest();
        SalesIncentiveValidationController.getRenewalStatus(acc.Id, '',true);
		SalesIncentiveValidationController.getRenewalStatus(acc.Id, 'IY19, 1/1/20',true);
        SalesIncentiveValidationController.getRenewalStatus(acc.Id, 'IY20, 1/1/21',true);
        Test.stopTest();
        
    }
    
    @isTest static void testGetTemplateInXML(){
        Account acc=[Select Id from Account where Name='TestAccount'];
        
        Test.startTest();
        SalesIncentiveValidationController.getTemplateInXML(acc.Id,'IY19, 1/1/20');
        Test.stopTest();
        
    }
   
    @isTest static void testUpdateRenewalStatusRecords(){
        Account acc=[Select Id from Account where Name='TestAccount'];
        List<Renewal_Status__c> rnwlStatusLst=[Select Id,Renewal_Confirmed_Members_Sale__c from Renewal_Status__c where Name='Medical' and Sales_Cycle__c='IY19, 1/1/20' and Company__c=:acc.Id];
        for(Renewal_Status__c eachRnwlStatus:rnwlStatusLst){
        eachRnwlStatus.Renewal_Confirmed_Members_Sale__c='Confirmed; All Members Safe';
        }
        List<Renewal_Status__c> rnwlStatusLst1=new List<Renewal_Status__c>();
        rnwlStatusLst1.add(rnwlStatusLst[0]);
       for(Renewal_Status__c eachRnwlStatus:rnwlStatusLst1){
        eachRnwlStatus.Renewal_Confirmed_Members_Sale__c='Confirmed; All Members';
        }
        
        
        Test.startTest();
        SalesIncentiveValidationController.updateRenewalStatusRecords(rnwlStatusLst,acc.Id,'IY19, 1/1/20',true);
        SalesIncentiveValidationController.updateRenewalStatusRecords(rnwlStatusLst1,acc.Id,'IY19, 1/1/20',true);
        Test.stopTest();
    }
    
    
    @isTest static void testFetchLookUpValues(){
         Account acc=[Select Id from Account where Name='TestAccount'];
        
        Test.startTest();
        SalesIncentiveValidationController.fetchLookUpValues('',acc.Id);
        SalesIncentiveValidationController.fetchLookUpValues('a',acc.Id);
        Test.stopTest();
    }
    
    @isTest static void testGetLoggedInUserInfoAsAdmin(){
       Account acc=[Select Id from Account where Name='TestAccount']; 
        
        Test.startTest();
        User systemAdmin = [Select Id from User where Username = 'sysadmin@crmit.com' LIMIT 1]; 
        System.runAs(systemAdmin) {
            SalesIncentiveValidationController.getLoggedInUserInfo(acc.Id);
        }
        Test.stopTest();
    }
    
    @isTest static void testGetLoggedInUserInfoAsServiceUser(){
       Account acc=[Select Id from Account where Name='TestAccount']; 
        
        Test.startTest();
        SalesIncentiveValidationController.getLoggedInUserInfo(acc.Id);
        User serviceUser = [Select Id from User where Username = 'crmittestuser2@crmit.com' LIMIT 1]; 
        System.runAs(serviceUser) {
            SalesIncentiveValidationController.getLoggedInUserInfo(acc.Id);
        }
        User csiAdmin = [Select Id from User where Username = 'crmittestuser3@crmit.com' LIMIT 1]; 
        System.runAs(csiAdmin) {
            SalesIncentiveValidationController.getLoggedInUserInfo(acc.Id);
        }
        
        

        Test.stopTest();
    }
    
    @isTest static void testGetLoggedInUserInfoAsSalesUser(){
       Account acc=[Select Id from Account where Name='TestAccount']; 
        
        Test.startTest();
        SalesIncentiveValidationController.getLoggedInUserInfo(acc.Id);
        
        
        User salesUserWhoseRoleNotListed = [Select Id from User where Username = 'crmittestuser1@crmit.com' LIMIT 1]; 
        System.runAs(salesUserWhoseRoleNotListed) {
            SalesIncentiveValidationController.getLoggedInUserInfo(acc.Id);
        }
        
        User salesUserWhoseRoleListed = new User(
            LastName = 'User4',
            FirstName='Test',
            Alias = 'slsusr',
            Email = 'testuser4@crmit.com',
            Username = 'crmittestuser4@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
            UserRoleId = [select Id, Name from UserRole where name = 'CD SVP' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User');
        
        insert salesUserWhoseRoleListed;
        System.runAs(salesUserWhoseRoleListed) {
            SalesIncentiveValidationController.getLoggedInUserInfo(acc.Id);
        }
        
        User compTeamUser = [Select Id from User where Username = 'crmittestuser5@crmit.com' LIMIT 1]; 
        System.runAs(compTeamUser) {
            SalesIncentiveValidationController.getLoggedInUserInfo(acc.Id);
        }
        
        /*User salesUserWhoseRoleListed = [Select Id from User where Username = 'crmittestuser4@crmit.com' LIMIT 1]; 
        System.runAs(salesUserWhoseRoleListed) {
            SalesIncentiveValidationController.getLoggedInUserInfo(acc.Id);
        }*/
        

        Test.stopTest();
    }
	
    @isTest static void testGetLoggedInUerRoleInfo(){
        
        Test.startTest();
        
        SalesIncentiveValidationController.getLoggedInUerRoleInfo();
        
        User nonAdmin = [Select Id from User where Username = 'crmittestuser1@crmit.com' LIMIT 1]; 
        System.runAs(nonAdmin) {
            SalesIncentiveValidationController.getLoggedInUerRoleInfo();
        }
        Test.stopTest();
    }  
    
    @isTest static void testGetAccountFieldInfo(){
        Test.startTest();
        SalesIncentiveValidationController.getAccountFieldInfo();
        Test.stopTest();
    }
}