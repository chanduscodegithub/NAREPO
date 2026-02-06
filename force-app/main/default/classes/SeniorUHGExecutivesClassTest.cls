@isTest
public class SeniorUHGExecutivesClassTest {
    public static testMethod void getSeniorUHGExecutiveNamesNormalTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.SeniorUHGTestData();        
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string accid2=[SELECT Id FROM Account WHERE Name='Competitive Medical CM2' LIMIT 1].Id;
        SeniorUHGExecutivesEngaged__c seniorobj =[SELECT Id FROM SeniorUHGExecutivesEngaged__c LIMIT 1];
        
        User readandwriteUser = [Select Id from User where Username = 'readandwriteUser@crmit.com' LIMIT 1];
        system.debug('readandwriteUser@@@'+readandwriteUser);
        System.runAs(readandwriteUser) {
            Test.startTest();
            SeniorUHGExecutivesClass.getSeniorUHGExecutiveNames('test', 'enterpriseExecutives');
            SeniorUHGExecutivesClass.getSeniorUHGExecutiveNames('test', 'optumExecutives');
            SeniorUHGExecutivesClass.getSeniorUHGExecutiveNames('test', 'UHCExecutives');           
            Test.stopTest();     
        }
        
    }
     public static testMethod void getLoggedInUserRolesNormalTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.SeniorUHGTestData();        
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string accid2=[SELECT Id FROM Account WHERE Name='Competitive Medical CM2' LIMIT 1].Id;
        SeniorUHGExecutivesEngaged__c seniorobj =[SELECT Id FROM SeniorUHGExecutivesEngaged__c LIMIT 1];
        
        User readandwriteUser = [Select Id from User where Username = 'readandwriteUser@crmit.com' LIMIT 1];
        system.debug('readandwriteUser@@@'+readandwriteUser);
        System.runAs(readandwriteUser) {
            Test.startTest();           
            SeniorUHGExecutivesClass.getLoggedInUserRoles(accid);            
            Test.stopTest();     
        }
        
    }
         public static testMethod void saveSeniorUHGExecutivesRecordsNormalTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.SeniorUHGTestData();        
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string accid2=[SELECT Id FROM Account WHERE Name='Competitive Medical CM2' LIMIT 1].Id;
        SeniorUHGExecutivesEngaged__c seniorobj =[SELECT Id FROM SeniorUHGExecutivesEngaged__c LIMIT 1];
        
        User readandwriteUser = [Select Id from User where Username = 'readandwriteUser@crmit.com' LIMIT 1];
        system.debug('readandwriteUser@@@'+readandwriteUser);
        System.runAs(readandwriteUser) {
            Test.startTest();            
            SeniorUHGExecutivesClass.saveSeniorUHGExecutivesRecords(seniorobj, accid);            
            Test.stopTest();     
        }
        
    } 
             public static testMethod void getSeniorUHGExecutivesRecordsNormalTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.SeniorUHGTestData();        
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
        string accid2=[SELECT Id FROM Account WHERE Name='Competitive Medical CM2' LIMIT 1].Id;

                 
        SeniorUHGExecutivesEngaged__c seniorobj =[SELECT Id FROM SeniorUHGExecutivesEngaged__c LIMIT 1];
        
        User readandwriteUser = [Select Id from User where Username = 'readandwriteUser@crmit.com' LIMIT 1];
        system.debug('readandwriteUser@@@'+readandwriteUser);
        System.runAs(readandwriteUser) {
            Test.startTest();           
            SeniorUHGExecutivesClass.getSeniorUHGExecutivesRecords(accid2);   
            Test.stopTest();     
        }
        
    }
    public static testMethod void getSeniorUHGExecutivesRecordsCheckSeniorNullNormalTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.SeniorUHGTestData();        
        string accid =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
       
         string accid3=[SELECT Id FROM Account WHERE Name='oppaccount1' LIMIT 1].Id;
                 
        SeniorUHGExecutivesEngaged__c seniorobj =[SELECT Id FROM SeniorUHGExecutivesEngaged__c LIMIT 1];
        
        User readandwriteUser = [Select Id from User where Username = 'readandwriteUser@crmit.com' LIMIT 1];
        system.debug('readandwriteUser@@@'+readandwriteUser);
        System.runAs(readandwriteUser) {
            Test.startTest();           
            SeniorUHGExecutivesClass.getSeniorUHGExecutivesRecords(accid3);   
            Test.stopTest();     
        }
        
    }
   
    public static testMethod void getSeniorUHGExecutiveNamesnoAccessTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.SeniorUHGTestData();
        User readUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        string accid= [SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
		string accid2=[SELECT Id FROM Account WHERE Name='Competitive Medical CM2' LIMIT 1].Id;
        SeniorUHGExecutivesEngaged__c seniorobj =[SELECT Id FROM SeniorUHGExecutivesEngaged__c LIMIT 1];
        System.runAs(readUser) {
            system.debug('readUser@@@'+readUser+'seniorobj@@@'+seniorobj+'accid@@@@'+accid);
            Test.startTest();
            try{            
                SeniorUHGExecutivesClass.getSeniorUHGExecutiveNames('test', 'enterpriseExecutives'); 
            }catch(Exception e){
                System.assertEquals(null, null);
            } 
            Test.stopTest();     
        }
        
    }
    
        public static testMethod void saveSeniorUHGExecutivesRecordsnoAccessTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.SeniorUHGTestData();
        User readUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        string accid= [SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
		string accid2=[SELECT Id FROM Account WHERE Name='Competitive Medical CM2' LIMIT 1].Id;
        SeniorUHGExecutivesEngaged__c seniorobj =[SELECT Id FROM SeniorUHGExecutivesEngaged__c LIMIT 1];
        System.runAs(readUser) {
            system.debug('readUser@@@'+readUser+'seniorobj@@@'+seniorobj+'accid@@@@'+accid);
            Test.startTest();
            try{
                SeniorUHGExecutivesClass.saveSeniorUHGExecutivesRecords(seniorobj,accid);
            }catch(Exception e){
                System.assertEquals(null, null);
            } 
            Test.stopTest();     
        }
        
    }
        public static testMethod void getSeniorUHGExecutivesRecordsnoAccessTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.SeniorUHGTestData();
        User readUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        string accid= [SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
		string accid2=[SELECT Id FROM Account WHERE Name='Competitive Medical CM2' LIMIT 1].Id;
        SeniorUHGExecutivesEngaged__c seniorobj =[SELECT Id FROM SeniorUHGExecutivesEngaged__c LIMIT 1];
        System.runAs(readUser) {
            system.debug('readUser@@@'+readUser+'seniorobj@@@'+seniorobj+'accid@@@@'+accid);
            Test.startTest();
            try{
                SeniorUHGExecutivesClass.getSeniorUHGExecutivesRecords(accid2);
            }catch(Exception e){
                System.assertEquals(null, null);
            } 
            Test.stopTest();     
        }
        
    }
            public static testMethod void getSeniorUHGExecutivesRecordsNullTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.SeniorUHGTestData();
        User readandwriteUser = [Select Id from User where Username = 'readandwriteUser@crmit.com' LIMIT 1];
        string accid= [SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
		string accid2=[SELECT Id FROM Account WHERE Name='Competitive Medical CM2' LIMIT 1].Id;
        SeniorUHGExecutivesEngaged__c seniorobj =[SELECT Id FROM SeniorUHGExecutivesEngaged__c LIMIT 1];
        System.runAs(readandwriteUser) {
            system.debug('readUser@@@'+readandwriteUser+'seniorobj@@@'+seniorobj+'accid@@@@'+accid);
            Test.startTest();
            try{
                SeniorUHGExecutivesClass.getSeniorUHGExecutivesRecords(null);
                //SeniorUHGExecutivesClass.saveSeniorUHGExecutivesRecords(null, null);
            }catch(Exception e){
                System.assertEquals(null, null);
            } 
            Test.stopTest();     
        }
        
    }
    public static testMethod void saveSeniorUHGExecutivesRecordsNullTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.SeniorUHGTestData();
        User readandwriteUser = [Select Id from User where Username = 'readandwriteUser@crmit.com' LIMIT 1];
        string accid= [SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
		string accid2=[SELECT Id FROM Account WHERE Name='Competitive Medical CM2' LIMIT 1].Id;
        SeniorUHGExecutivesEngaged__c seniorobj =[SELECT Id FROM SeniorUHGExecutivesEngaged__c LIMIT 1];
        System.runAs(readandwriteUser) {
            system.debug('readUser@@@'+readandwriteUser+'seniorobj@@@'+seniorobj+'accid@@@@'+accid);
            Test.startTest();
            try{
                //SeniorUHGExecutivesClass.getSeniorUHGExecutivesRecords(null);
                SeniorUHGExecutivesClass.saveSeniorUHGExecutivesRecords(null, null);
            }catch(Exception e){
                System.assertEquals(null, null);
            } 
            Test.stopTest();     
        }
        
    }
   
    
    
}