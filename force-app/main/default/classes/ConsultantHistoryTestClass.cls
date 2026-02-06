@isTest
public class ConsultantHistoryTestClass {
    
    @testSetup static void createTestData() {
        
        // Creating the test Account
        Account acc = new Account();
        acc.Name = 'testAccount';
        acc.Subtype__c = 'Consulting Firm';        
        acc.RecordTypeId =  Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert acc;
        
        // Creating the test Account
        Account accCD = new Account();
        accCD.Name = 'testCdAccount2';
        accCD.Subtype__c ='Prospect';
        accCD.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCD;    
        
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
        
        // Creating the test Contact
        Contact con = new Contact();
        con.FirstName = 'TestFirstName';
        con.LastName = 'TestLastName';
        con.AccountId = accCD.Id;              
        insert con;
        
        // Creating the test Contact
        Contact con2 = new Contact();
        con2.FirstName = 'TestFirstName123';
        con2.LastName = 'TestLastName123';
        con2.AccountId = accCD123.Id;              
        insert con2;
        
        Id ConsultantRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        Contact con1 = new Contact();
        con1.FirstName = 'TestFirstName1';
        con1.LastName = 'TestLastName1';
        con1.AccountId = accCD.Id;        
        con1.Status__c = 'Active';
        con1.Title = 'TestTitle';        
        insert con1;   
        
        
        //   String uniqueUserName1 = 'standarduser' + DateTime.now().getTime() + '@testingorg.com';
      /*  User readOnlyUser = new User(
            LastName = 'LIVE1',
            FirstName='JASON1',
            Alias = 'jliv',
            Email = 'jason.liveston@asdf.com',
            Username = 'uhgDevReadOnlyNew@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US');        
        insert readOnlyUser; */
        String uniqueUserName = 'standarduser' + DateTime.now().getTime() + '@testNeworg.com';
         Profile p = [SELECT Id FROM Profile WHERE Name='Standard User'];
        User u = new User(Alias = 'standt', Email='standarduser@testorg.com',
                          EmailEncodingKey='UTF-8', LastName='TestLast',FirstName='TestFirst', LanguageLocaleKey='en_US',
                          LocaleSidKey='en_US', ProfileId = p.Id,
                          TimeZoneSidKey='America/Los_Angeles',
                          UserName=uniqueUserName); 
         insert u;
        
        Contact b = new contact();
        b.AccountId=accCD1.Id;
        b.CEO__c=false;
        b.FirstName ='Inactive asdf';
        b.LastName='last asdf';
        b.OtherCountry='United States';
        b.RecordTypeId=ConsultantRecord;
        b.Status__c='Inactive';
        b.InactiveStatusReason__c='Duplicate';
     //   b.ActiveConsultant__c ='0030n00000NkjaNAAR';
        insert b; 
        
        /* String uniqueUserName1 = 'standarduser' + DateTime.now().getTime() + '@testorg.com';
Profile p = [SELECT Id FROM Profile WHERE Name='System Administrator'];
User u1 = new User(Alias = 'standt', Email='standarduser@testorg.com',
EmailEncodingKey='UTF-8', LastName='Testing1',FirstName='Test1', LanguageLocaleKey='en_US',
LocaleSidKey='en_US', ProfileId = p.Id,
TimeZoneSidKey='America/Los_Angeles',
UserName=uniqueUserName1);    
System.runAs(u1) {     
Contact b = new contact();
b.AccountId=accCD1.Id;
b.CEO__c=false;
b.FirstName ='test asdf';
b.LastName='last asdf';
b.OtherCountry='United States';
b.RecordTypeId=ConsultantRecord;
b.Status__c='Inactive';
b.InactiveStatusReason__c='Duplicate';
b.ActiveConsultant__c ='0030n00000NkjaNAAR';
insert b; 
} */
        // Creating the test Cont
        List<ConsultantHistory__c> conHistoryList = new List<ConsultantHistory__c>();
        Integer conHistoryCount = 1;
        while(conHistoryCount <= 10){
            ConsultantHistory__c conHistory = new ConsultantHistory__c();
            conHistory.Name = con.FirstName+conHistoryCount;
            conHistory.LastName__c = con.LastName+conHistoryCount;   
            conHistory.CompanyName__c = acc.Id;
            conHistoryList.add(conHistory);
            conHistoryCount++;
        }
        insert conHistoryList;       
        
    }
    /********************************************************************************************************/
    public testMethod static void ValidatecraeteAndMapConsultantHistoryWithContact(){		
        System.Test.startTest();        
        
        Id accId = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        Contact con =  [SELECT Id,LastName,Status__c,AccountId,Title FROM Contact WHERE LastName='TestLastName' AND Status__c = 'active' LIMIT 1];        
        Contact conNull =Null;
        String inactive = 'Inactive';
        Contact conInactive =  [SELECT Id FROM Contact WHERE Status__c = :inactive  LIMIT 1]; 
        system.debug('con  :'+con);
        //  ConsultantHistoryController.ConsultantHistoryResult result = ConsultantHistoryController.getConsultantHistoryData(accId,1,'Name','ASC',false);                
        try{ 
            ConsultantHistoryController.craeteAndMapConsultantHistoryWithContact(con,accId);              
            //  System.assertEquals(null,result);
        }catch(Exception ex){
            system.debug('Exception Message  :'+ex.getMessage()+'Exception Line Number  :'+ex.getLineNumber());
        }  
        try{   
            ConsultantHistoryController.craeteAndMapConsultantHistoryWithContact(conNull,accId);
        }catch(Exception ex){
            system.debug('Exception Message  :'+ex.getMessage()+'Exception Line Number  :'+ex.getLineNumber());
        } 
         try{   
            ConsultantHistoryController.craeteAndMapConsultantHistoryWithContact(conInactive,accId);
        }catch(Exception ex){
            system.debug('Exception Message  :'+ex.getMessage()+'Exception Line Number  :'+ex.getLineNumber());
        }         
        
        //  System.assertNotEquals(4,result.consultantList.size());  
        System.Test.stopTest();
    }
    
    
    
    
    /********************************************************************************************************/
    
    
    public testMethod static void ValidategetConsultantHistoryData(){		
        System.Test.startTest();        
        
        Id accId = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        ConsultantHistoryController.ConsultantHistoryResult result = ConsultantHistoryController.getConsultantHistoryData(accId,1,'Name','ASC',false);                
        System.assertEquals(10,result.consultantList.size());
        System.assertNotEquals(4,result.consultantList.size());
        
        result = ConsultantHistoryController.getConsultantHistoryData(accId,2,'Name','DESC',true);
        System.assertEquals(10,result.consultantList.size());
        System.assertNotEquals(4,result.consultantList.size());
        
        try {
            result = ConsultantHistoryController.getConsultantHistoryData(accId,2,'Namedsf','ASC',true);
            System.assertEquals(10,result.consultantList.size());
            System.assertNotEquals(4,result.consultantList.size());
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());            
        }
        
        
        try {
            result = ConsultantHistoryController.getConsultantHistoryData(null,1,'Name','ASC',false);
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());            
        }
        try {
            String uniqueUserName = 'standarduser' + DateTime.now().getTime() + '@testorg.com';
            Profile p = [SELECT Id FROM Profile WHERE Name='Standard User'];
            User U1 = new User(Alias = 'standt', Email='standarduser@testorg.com',
                              EmailEncodingKey='UTF-8', LastName='Testing',FirstName='Test', LanguageLocaleKey='en_US',
                              LocaleSidKey='en_US', ProfileId = p.Id,
                              TimeZoneSidKey='America/Los_Angeles',
                              UserName=uniqueUserName);    
            System.runAs(U1){
                ConsultantHistoryController.ConsultantHistoryResult result2 = ConsultantHistoryController.getConsultantHistoryData(accId,2,'Name','DESC',true);
                // System.assertEquals(1,result.consultantList.size());   
            }
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());            
        }
        
        System.Test.stopTest();
    }
    public testMethod static void ValidateIsEditAccesToThisUser(){
        System.Test.startTest();        
        Id accId = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        boolean hasEditAccess = ConsultantHistoryController.isEditAccesToThisUser(accId);
        System.assertEquals(true, hasEditAccess);
        System.assertNotEquals(false, hasEditAccess);        
        //  hasEditAccess = ConsultantHistoryController.isEditAccesToThisUser(null); 
        hasEditAccess = ConsultantHistoryController.isEditAccesToThisUser(null);  
        // String accIdNegetive = '0010n00000etgRmBBI';
        // boolean hasEditAccessNegetive = ConsultantHistoryController.isEditAccesToThisUser(accIdNegetive);
        // System.assertEquals(false, hasEditAccessNegetive);
        System.assertEquals(false, hasEditAccess);
        System.Test.stopTest();
    }
    /****************************************************************************************************************/
    public testMethod static void ValidategetAllContactOfTypeConsultantData(){
        System.Test.startTest();      
         User U1 = [Select id from user where LastName='TestLast'];
        ConsultantHistoryController.ConsultantHistoryResult result = ConsultantHistoryController.getAllContactOfTypeConsultantData('test',1,'NAME','BEGINS_WITH');
        //   ConsultantHistoryController.ConsultantHistoryResult result = ConsultantHistoryController.getConsultantHistoryData(,1,'Name','ASC',false);                
        System.assertNotEquals(6,result.consultantContactList.size());    
     
        try { 
            result = ConsultantHistoryController.getAllContactOfTypeConsultantData('test',2,'NAME','CONTAINS');
            // System.assertEquals(1,result.consultantList.size());
            System.assertNotEquals(null,result.consultantContactList.size());
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());            
        }
        
        try { 
            result = ConsultantHistoryController.getAllContactOfTypeConsultantData('123',1,'LAST_NAME','EQUALS_TO');
            // System.assertEquals(1,result.consultantList.size());
            System.assertNotEquals(null,result.consultantContactList.size());
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());            
        }
        
        try { 
            result = ConsultantHistoryController.getAllContactOfTypeConsultantData('test',1,'LAST_NAME','CONTAINS');
            // System.assertEquals(1,result.consultantList.size());
            System.assertNotEquals(null,result.consultantContactList.size());
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());            
        }
        try { 
            result = ConsultantHistoryController.getAllContactOfTypeConsultantData('test',2,'FIRST_NAME','CONTAINS');
            // System.assertEquals(1,result.consultantList.size());
            System.assertNotEquals(null,result.consultantContactList.size());
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());            
        }
        try { 
            result = ConsultantHistoryController.getAllContactOfTypeConsultantData('test',1,'JOB_TITLE','CONTAINS');
            // System.assertEquals(1,result.consultantList.size());
            System.assertNotEquals(null,result.consultantContactList.size());
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());            
        }
        
        try { 
            result = ConsultantHistoryController.getAllContactOfTypeConsultantData('test',2,'CONSULTING_FIRM','CONTAINS');
            // System.assertEquals(1,result.consultantList.size());
            System.assertEquals(null,result.consultantContactList.size());
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());            
        }
        try { 
         System.runAs(U1){
            ConsultantHistoryController.ConsultantHistoryResult result2 = ConsultantHistoryController.getAllContactOfTypeConsultantData('test',2,'NAME','CONTAINS');
            // System.assertEquals(1,result.consultantList.size());   
         } 
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());            
        }
        System.Test.stopTest();        
    }
    /****************************************************************************************************************/ 
    
    public testMethod static void ValidatecreateConsultantHistory(){
        System.Test.startTest();
        ConsultantHistory__c testHistory = new ConsultantHistory__c();
        ConsultantHistory__c testHistoryNull = null;
        try{
            ConsultantHistoryController.createConsultantHistory(testHistory);
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());     
        }
        try{
            ConsultantHistoryController.createConsultantHistory(testHistoryNull);
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());     
        }   
        String uniqueUserName = 'standarduser' + DateTime.now().getTime() + '@testorg.com';
        // This code runs as the system user
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User'];
        User u = new User(Alias = 'standt', Email='standarduser@testorg.com',
                          EmailEncodingKey='UTF-8', LastName='Testing',FirstName='Test', LanguageLocaleKey='en_US',
                          LocaleSidKey='en_US', ProfileId = p.Id,
                          TimeZoneSidKey='America/Los_Angeles',
                          UserName=uniqueUserName);    
        System.runAs(u) {
            try{
                ConsultantHistoryController.createConsultantHistory(testHistory);   
            }catch(Exception e){
                System.debug(e.getMessage());
                System.debug(e.getTypeName());
            }
            
        }
        System.Test.stopTest();
    }
    
    /****************************************************************************************************************/ 
    public testmethod static void ValidatesaveConsultantHistoryFromController(){
        System.Test.startTest();
        ConsultantHistory__c consultantHistoryObj = new ConsultantHistory__c();
        ConsultantHistory__c consultantHistoryObjNull = null;
         ConsultantHistory__c consultantHistoryHadDadaObj = [Select Id,Name,LastName__c from ConsultantHistory__c where LastName__c = 'TestLastName1'];
        // ConsultantHistory__c result = ConsultantHistoryController.saveConsultantHistoryFromController(consultantHistoryObj);
        try{
            ConsultantHistory__c result= ConsultantHistoryController.saveConsultantHistoryFromController(consultantHistoryObj);   
            
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());
        }
        try{
            ConsultantHistory__c result1= ConsultantHistoryController.saveConsultantHistoryFromController(consultantHistoryObjNull);
            
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());
        }
         try{
            ConsultantHistory__c result1= ConsultantHistoryController.saveConsultantHistoryFromController(consultantHistoryHadDadaObj);
            
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());
        }
        
        System.Test.stopTest();
    }
    /****************************************************************************************************************/
    public testmethod static void ValidatecreateConsultantHistoryFromAccount(){
        System.Test.startTest();
        Id accId = [SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        Id ConId = [SELECT Id FROM Contact WHERE LastName='TestLastName123' LIMIT 1].Id;
        Id AccIDNull = null;
        User U1 = [Select id from user where LastName='TestLast'];
        try{
            ConsultantHistoryController.ConsultantHistoryResult result = ConsultantHistoryController.createConsultantHistoryFromAccount(accId,ConId,true);                         
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());
        }
        try{            
            ConsultantHistoryController.ConsultantHistoryResult result1 = ConsultantHistoryController.createConsultantHistoryFromAccount(AccIDNull,ConId,true);                         
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());
        }
        try{         
            System.runAs(U1){
                ConsultantHistoryController.ConsultantHistoryResult result2 = ConsultantHistoryController.createConsultantHistoryFromAccount(accId,ConId,true);   
            }             
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());
        }
        System.Test.stopTest();        
    }
    /****************************************************************************************************************/
    public testmethod static void ValidatedeleteConsultantHistory(){
        System.Test.startTest();   
        Id accId = [SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        Id ConId = [SELECT Id FROM Contact WHERE LastName='TestLastName123' LIMIT 1].Id;    
        User U1 = [Select id from user where LastName='TestLast'];
        try{            
            ConsultantHistoryController.ConsultantHistoryResult result1 = ConsultantHistoryController.deleteConsultantHistory(accId,ConId,1,true,'NAME','Desc');               
        }catch(Exception e){
            System.debug(e.getMessage());           
        }
        try{
            ConsultantHistoryController.ConsultantHistoryResult result = ConsultantHistoryController.deleteConsultantHistory(null,null,1,true,'NAME','Desc');              
        }catch(Exception e){
            System.debug(e.getMessage());           
        }
        try{
            System.runAs(U1){
                ConsultantHistoryController.ConsultantHistoryResult result2 = ConsultantHistoryController.deleteConsultantHistory(accId,ConId,1,true,'NAME','Desc');               
            }
        }catch(Exception e){
            System.debug(e.getMessage());           
        }         
        
        System.Test.stopTest(); 
    }
    
    /****************************************************************************************************************/
    public testmethod static void ValidategetConsultantHistoryFromController(){
        
        System.Test.startTest();
        ConsultantHistory__c consultantHistoryObj = [Select Id,Name,LastName__c from ConsultantHistory__c where LastName__c = 'TestLastName1'];
        Id objID = consultantHistoryObj.Id;
        Id objIDNull = null;
         User U1 = [Select id from user where LastName='TestLast'];
        ConsultantHistory__c consultantHistoryObjNull = null;
        // ConsultantHistory__c result = ConsultantHistoryController.saveConsultantHistoryFromController(consultantHistoryObj);
        try{
            ConsultantHistory__c result= ConsultantHistoryController.getConsultantHistoryFromController(objID); 
            ConsultantHistory__c result1= ConsultantHistoryController.getConsultantHistoryFromController(objIDNull);
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());
        }
         try{
            System.runAs(U1){
             ConsultantHistory__c result2= ConsultantHistoryController.getConsultantHistoryFromController(objID); 
        }
        }catch(Exception e){
            System.debug(e.getMessage());
            System.debug(e.getTypeName());
        }
        
       
        System.Test.stopTest();
    }
}