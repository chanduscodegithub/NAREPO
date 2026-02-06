@isTest
public class IncentiveCompensationStatement_Test {
    
    @testSetup static void createTestData() {
       
        List<User> userListToInsert = new List<User>();
        
        userListToInsert.add(new User(
           LastName = 'User4',
            FirstName='Test',
            Alias = 'slsusr',
            Email = 'testuser4@crmit.com',
            Username = 'crmittestuser1@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
            UserRoleId = [select Id, Name from UserRole where name = 'CD SVP' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User'));
        
		
                
        userListToInsert.add(new User(
             LastName = 'User4',
            FirstName='Test',
            Alias = 'slsusr',
            Email = 'testuser4@crmit.com',
            Username = 'crmittestuser2@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
            UserRoleId = [select Id, Name from UserRole where name = 'CM SCE' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User'));
        
        
        userListToInsert.add(new User(
            LastName = 'User4',
            FirstName='Test',
            Alias = 'slsusr',
            Email = 'testuser4@crmit.com',
            Username = 'crmittestuser3@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
            UserRoleId = [select Id, Name from UserRole where name = 'CM VPCR/RVP' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User',VPCR__c=true));
        
        userListToInsert.add(new User(
            LastName = 'User',
            FirstName='Test',
            Alias = 'vpcrusr',
            Email = 'vpcrtestuser@crmit.com',
            Username = 'vpcrtestuser@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
            UserRoleId = [select Id, Name from UserRole where name = 'CM VPCR/RVP' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User',VPCR__c=false));

        
        
        userListToInsert.add(new User(
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
        	Position__c='Test User'));
       

        
        userListToInsert.add(new User(
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
        	Position__c='Test User'));
        
        
        insert userListToInsert;
    }
   
    @isTest static void testGetLoggedInUerRoleInfo(){
        
        Test.startTest();
         List<String> lstOfStriong=new List<String>();
         lstOfStriong.add('test1');
         lstOfStriong.add('test2');
        /* IncentiveCompensationStatementController.getListFromValueSeparatedStr('smnhf,jbh', ',');
         IncentiveCompensationStatementController.getListFromValueSeparatedStr('', ',');
         IncentiveCompensationStatementController.listContainsStrValue(lstOfStriong, 'test1');*/
        IncentiveCompensationStatementController.getLoggedInUserInfo();
        
        User nonAdmin = [Select Id from User where Username = 'crmittestuser1@crmit.com' LIMIT 1]; 
        System.runAs(nonAdmin) {
            IncentiveCompensationStatementController.getLoggedInUserInfo();
        }
        User nonAdmin1 = [Select Id from User where Username = 'crmittestuser4@crmit.com' LIMIT 1]; 
        System.runAs(nonAdmin) {
            IncentiveCompensationStatementController.getLoggedInUserInfo();
        }
        User nonAdmin2 = [Select Id from User where Username = 'crmittestuser2@crmit.com' LIMIT 1]; 
        System.runAs(nonAdmin) {
            IncentiveCompensationStatementController.getLoggedInUserInfo();
        }
        User nonAdmin3 = [Select Id from User where Username = 'crmittestuser3@crmit.com' LIMIT 1]; 
        System.runAs(nonAdmin) {
            IncentiveCompensationStatementController.getLoggedInUserInfo();
        }
        Test.stopTest();
    }  
    
    @isTest static void testGetAccountFieldInfo(){
        Test.startTest();
        SalesIncentiveValidationController.getAccountFieldInfo();
        Test.stopTest();
    }
}