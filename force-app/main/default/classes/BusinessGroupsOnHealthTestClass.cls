@isTest
public class BusinessGroupsOnHealthTestClass {
    @testSetup static void createTestData(){
        
      /*  Account bghacc = new Account();
        bghacc.Name = 'testBghAccount';
       // bghacc.Type = 'Aggregator';
        bghacc.Subtype__c ='Prospect';
        bghacc.Aggregator_Type__c = 'Business Group on Health (BGH)';
        insert bghacc; */
        
        
       
        Account accC = new Account();
        accC.Name = 'Competitive Medical CD';
        accC.Subtype__c ='Prospect';
        accC.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accC; 
        
     /*   Account acc = new Account();
        acc.Name = 'testAccount';
        insert acc; */
        
        Account accCD123 = new Account();
        accCD123.Name = 'Competitive Medical CD';
        accCD123.Subtype__c ='Prospect';
        accCD123.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCD123;  
        
        Account accCD1 = new Account();
        accCD1.Name = 'testCFAccount';
        accCD1.Type = 'Consulting Firm';
        accCD1.Subtype__c = 'Consulting Firm';        
        accCD1.RecordTypeId =  Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert accCD1; 
        
       // Id CDContactRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        Id ConsultantRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
      
        Contact  c = new contact();
        c.AccountId=accCD1.Id;
        c.CEO__c=false;
        c.FirstName ='test acconsultiongfirm12';
        c.LastName='last acconsultiongfirm12';
        c.OtherCountry='United States';
        c.RecordTypeId=ConsultantRecord;      
        c.DecisionMakingRole__c='Consultant Practice Leader';
        c.Status__c='Active';        
        insert c;
        
        Id BghAct = [Select id from Account where Name='testCFAccount' limit 1].Id;
               
        BGHContact__c newCont = new BGHContact__c();
        BGHContact__c newCont1 = new BGHContact__c();
        newCont.Role__c = 'Director';
        newCont.BGH_Unique_Value__c ='UniqueCont';        
        newCont.CompanyBGH__c = BghAct;
        newCont.BGHContact__c = c.id;
        insert newCont;
        
        
        //Insert user in below method to avoid MixedDML Operation error in test methods.
        User u;
        User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];            
        System.runAs (thisUser) {
 		UserRole r = [SELECT Id FROM UserRole WHERE Name='CD VP'];
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
            LocaleSidKey = 'en_US',
        	UserRoleId = r.Id,
        	Position__c='Test User');
        insert readOnlyUser;
        }
        List<BGH__c> testBGHRecords = new List<BGH__c>();
        
        for(Integer i=0;i<5;i++) {
            BGH__c bgh = new BGH__c();
            bgh.BGH_Account__c = accC.Id;
            bgh.New_Account__c  = accCD1.Id;
            testBGHRecords.add(bgh);
        }
        insert testBGHRecords;       
    }    
    public testMethod static void validategetBusinessGroupsonHealthOnAppletLoad(){
        
        Id acct = [SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        Test.startTest();
        try{
        BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject1 = BusinessGroupsOnHealthClass.getBusinessGroupsonHealthOnAppletLoad(acct, 'Name', 'Desc',false);
        BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject2 = BusinessGroupsOnHealthClass.getBusinessGroupsonHealthOnAppletLoad(acct, 'Name', 'null',false);
        BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject3 = BusinessGroupsOnHealthClass.getBusinessGroupsonHealthOnAppletLoad(null, 'Name', 'null',false);
        BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject4 = BusinessGroupsOnHealthClass.getBusinessGroupsonHealthOnAppletLoad(readOnlyUser.Id, 'Name', 'null',false);
       }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
        try{
               BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject5 = BusinessGroupsOnHealthClass.getBusinessGroupsonHealthOnAppletLoad(null, '', '',false);
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
        try{
            System.runAs(readOnlyUser) {
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject5 = BusinessGroupsOnHealthClass.getBusinessGroupsonHealthOnAppletLoad(acct, 'Name', 'Desc',false);
        }
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
        
        Test.stopTest();
    }
    
    public testMethod static void validategetAccountBusinessGroupsForPopup(){
        Id acct = [SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        Test.startTest();
        try{
            List<Account> bussinessobject6 = BusinessGroupsOnHealthClass.getAccountBusinessGroupsForPopup(acct,true);            
       
        List<Account> bussinessobject8 = BusinessGroupsOnHealthClass.getAccountBusinessGroupsForPopup(readOnlyUser.Id,false);
        
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
        try{
             List<Account> bussinessobject3 = BusinessGroupsOnHealthClass.getAccountBusinessGroupsForPopup(acct,false);
        } catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
          try{
              List<Account> bussinessobject7 = BusinessGroupsOnHealthClass.getAccountBusinessGroupsForPopup(null,false);
        } catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
        
        try{
             System.runAs(readOnlyUser) {
            List<Account> bussinessobject9 = BusinessGroupsOnHealthClass.getAccountBusinessGroupsForPopup(acct,true);
        }
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }        
        Test.stopTest();
    }
 
     public testMethod static void validateNegetiveaddBusinessGroupsToAccount(){
//Id AcctNull = '';
		
        Id acct = [SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        List<BGH__c> bghAcct = [SELECT Id FROM BGH__c];
        List<Id> bghAcctId = new List<Id>();
        for(BGH__c eachBGH :bghAcct){
            bghAcctId.add(eachBGH.Id);
        }
         List<Id> bghAcctIdNull = null;
           try{
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject12 = BusinessGroupsOnHealthClass.addBusinessGroupsToAccount(bghAcctId, acct,false);
        } catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }  
          try{
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject12 = BusinessGroupsOnHealthClass.addBusinessGroupsToAccount(bghAcctId, acct,false);
        } catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }  
         try{
             BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject12 = BusinessGroupsOnHealthClass.addBusinessGroupsToAccount(null, null,false);
         }
         catch(Exception e){
             system.debug('Exception occured'+e.getMessage());
         }
     }
    
    public testMethod static void validateaddBusinessGroupsToAccount(){
//Id AcctNull = '';
        Id acct = [SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        Id acctWrong = [SELECT Id FROM Contact LIMIT 1].Id;
        List<BGH__c> bghAcct = [SELECT Id FROM BGH__c limit 10];
        List<Id> bghAcctId = new List<Id>();
        for(BGH__c eachBGH :bghAcct){
            bghAcctId.add(eachBGH.Id);
        }
        List<Contact> bghCont = [SELECT Id FROM contact limit 10];
        List<Id> bghContId = new List<Id>();
        for(Contact eachBGH :bghCont){
            bghAcctId.add(eachBGH.Id);
        }
        
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        Test.startTest(); 
        try{
        BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject11 = BusinessGroupsOnHealthClass.addBusinessGroupsToAccount(bghAcctId, acct,true);
       // BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject22 = BusinessGroupsOnHealthClass.addBusinessGroupsToAccount(null, readOnlyUser.Id,false);
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }  
        
         try{
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject12 = BusinessGroupsOnHealthClass.addBusinessGroupsToAccount(bghAcctId, null,false);
        } catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }         
        try{
             System.runAs(readOnlyUser) {
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject13 = BusinessGroupsOnHealthClass.addBusinessGroupsToAccount(bghAcctId, acct,true);
        }
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
        try{
            
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject15 = BusinessGroupsOnHealthClass.addBusinessGroupsToAccount(bghAcctId, acct,false);
        
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
         try{            
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject16 = BusinessGroupsOnHealthClass.addBusinessGroupsToAccount(bghContId, acctWrong,true);
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
        Test.stopTest();
    }
    
    public testMethod static void validatedeleteBGHRecordFromApplet(){
        
        Id acct = [SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        Id AcctWrong = [Select id from contact limit 1].Id;
        Id bghAcct = [SELECT Id FROM BGH__c LIMIT 1].Id;
       
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        Test.startTest();
        try{
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject15 = BusinessGroupsOnHealthClass.deleteBGHRecordFromApplet(bghAcct, acct,true);
        BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject16 = BusinessGroupsOnHealthClass.deleteBGHRecordFromApplet(readOnlyUser.Id, readOnlyUser.Id,false);
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
        
        try{
             System.runAs(readOnlyUser) {
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject17 = BusinessGroupsOnHealthClass.deleteBGHRecordFromApplet(bghAcct, acct,true);
        }
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }       
       
         try{             
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject19 = BusinessGroupsOnHealthClass.deleteBGHRecordFromApplet(bghAcct, acct,false);
       }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        } 
        try{             
            BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult bussinessobject21 = BusinessGroupsOnHealthClass.deleteBGHRecordFromApplet(bghAcct, AcctWrong,false);
       }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }          
        Test.stopTest();
    }
 /***********************************************************************************************************/
    
    public testMethod static void ValidatehasBGHeditAccesToThisUser(){
        boolean result;
        boolean result1;
        Boolean isContact = true;
       Id acct = [SELECT Id FROM Account WHERE Name='testCFAccount' LIMIT 1].Id; 
       User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        Test.startTest();
        try{
           result = BusinessGroupsOnHealthClass.hasBGHeditAccesToThisUser(acct,true);
                }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }	
        
        try{
           result = BusinessGroupsOnHealthClass.hasBGHeditAccesToThisUser(acct,false);
                }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }
         Test.stopTest();
    }
    
    
      public testMethod static void ValidateRolehasBGHeditAccesToThisUser(){
        boolean result;
        boolean result1;
        Boolean isContact = true;
       Id acct = [SELECT Id FROM Account WHERE Name='testCFAccount' LIMIT 1].Id; 
      // User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
          User thisUser = [SELECT Id FROM User WHERE UserRoleId!=null limit 1];
        Test.startTest();
          try{
              System.runAs(thisUser) {
                  result1 = BusinessGroupsOnHealthClass.hasBGHeditAccesToThisUser(acct,true);
              }
          }catch(Exception Ex){
              system.debug('Exception Line Number'+Ex.getLineNumber());
              system.debug('Exception Message'+Ex.getMessage());
          } 
          
          try{
              System.runAs(thisUser) {
                  result1 = BusinessGroupsOnHealthClass.hasBGHeditAccesToThisUser(acct,false);
              }
          }catch(Exception Ex){
              system.debug('Exception Line Number'+Ex.getLineNumber());
              system.debug('Exception Message'+Ex.getMessage());
          } 
         Test.stopTest();
    }
    
 /***********************************************************************************************************/
    public testMethod static void ValidateRecordDetailsDoInit(){  
     Test.startTest();
        try{
            List<String> TestList = new list<String> {'a','b','c'};
            BusinessGroupsOnHealthClass.RecordDetailsDoInit result1 = new BusinessGroupsOnHealthClass.RecordDetailsDoInit();
            result1.roleValues = TestList;
            result1.objectType = 'Account';
           
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }   
     Test.stopTest();
    }
     /***********************************************************************************************************/
    public testMethod static void ValidategetObjectType(){  
       Id newCont1 = [select id from  BGHContact__c where BGH_Unique_Value__c ='UniqueCont'].Id;
     Test.startTest();
        try{
    BusinessGroupsOnHealthClass.RecordDetailsDoInit result = BusinessGroupsOnHealthClass.getObjectType(newCont1);
            }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        }   
     Test.stopTest();    
}
     /***********************************************************************************************************/
    public testMethod static void ValidateupdateBGHRole(){  
       Id newCont1 = [select id from  BGHContact__c where BGH_Unique_Value__c ='UniqueCont'].Id;
       Id newCont2 = [select id from  contact where LastName='last acconsultiongfirm12'].Id;
    //  Id newContTest ='0030n00000O0nNvFHG';
       Id acct = [SELECT Id FROM Account LIMIT 1].Id;
       User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
     Test.startTest();
        try{
    BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult result = BusinessGroupsOnHealthClass.updateBGHRole(newCont1,'Director', newCont2, true);
    BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult result1 = BusinessGroupsOnHealthClass.updateBGHRole(newCont1,'TestRole', newCont2, true);      
    BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult result2 = BusinessGroupsOnHealthClass.updateBGHRole(newCont1,'', newCont2, true);      
            system.runAs(readOnlyUser){
                 BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult result3 = BusinessGroupsOnHealthClass.updateBGHRole(newCont1,'TestRole', newCont2, true);      
            }
        }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        } 
         try{
    BusinessGroupsOnHealthClass.AccountBusinessGroupHealthResult result4 = BusinessGroupsOnHealthClass.updateBGHRole(acct,'Director', newCont2, true);
         }catch(Exception Ex){
            system.debug('Exception Line Number'+Ex.getLineNumber());
            system.debug('Exception Message'+Ex.getMessage());
        } 
        Test.stopTest();
    }
/***********************************************************************************************************/    
}