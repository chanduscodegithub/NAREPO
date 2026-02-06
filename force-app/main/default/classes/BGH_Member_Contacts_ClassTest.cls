@isTest
public class BGH_Member_Contacts_ClassTest {
    
    public static  string columnName  ='BGHContact__r.LastName';
    public static  string sortType  ='Asc';
    public static  string searchKeyValEmpty='';
    public static  string searchKeyValsam='sam';
    
    public static  Integer pageNumber=1;	
    public static string searchField='FirstName';
    public static string searchFieldsam='test';
    public static string operator='Contains';
    public static string operatorminus='';
    
    public static testMethod void getBGHMembersForPopupValidateMethod(){
         String FIRST_NAME = 'First Name';
        String LAST_NAME = 'Last Name';
        String searchKeyValTest= 'test';
        String BEGINS_WITH = 'Begins With';        
        String CONTAINS = 'Contains';        
        String EQUALS_TO = 'Equals to';
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.BGHContactTestData();
        string accbgh =[SELECT Id FROM Account WHERE Name='account BGH' LIMIT 1].Id;
        string conid =[SELECT Id FROM Contact WHERE FirstName='test aggfname' LIMIT 1].Id;
        string bghcon = [SELECT Id FROM BGHContact__c LIMIT 1].Id;
        BGH_Member_Contacts_Class.getBGHMembersForPopup(searchKeyValTest, pageNumber, FIRST_NAME, CONTAINS, accbgh);
        BGH_Member_Contacts_Class.getBGHMembersForPopup(searchKeyValTest, pageNumber, LAST_NAME, BEGINS_WITH, accbgh);
        BGH_Member_Contacts_Class.getBGHMembersForPopup(searchKeyValTest, pageNumber, LAST_NAME, EQUALS_TO, accbgh);
        BGH_Member_Contacts_Class.getBGHMembersForPopup(searchKeyValTest, pageNumber, LAST_NAME, EQUALS_TO, conid);
        
    }
     static testMethod void readAndWriteUserAccess(){
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.BGHContactTestData();
        string accbgh =[SELECT Id FROM Account WHERE Name='account BGH' LIMIT 1].Id;
        string conid =[SELECT Id FROM Contact WHERE FirstName='test aggfname' LIMIT 1].Id;
        string bghcon = [SELECT Id FROM BGHContact__c LIMIT 1].Id;
        User readandwriteUser = [Select Id from User where Username = 'readandwriteUser@crmit.com' LIMIT 1];
        
        system.debug('readandwriteUser@@@'+readandwriteUser);
        System.runAs(readandwriteUser) {
            Test.startTest();
            BGH_Member_Contacts_Class.getBusinessGroupsonHealthOnAppletLoad(accbgh, columnName, sortType, false);
            BGH_Member_Contacts_Class.getBusinessGroupsonHealthOnAppletLoad(accbgh, columnName, sortType, true);
            BGH_Member_Contacts_Class.getBusinessGroupsonHealthOnAppletLoad(accbgh, columnName, sortType, null); 
            BGH_Member_Contacts_Class.getBGHMembersForPopup(searchKeyValEmpty, pageNumber, searchField, operator, accbgh);
            //BGH_Member_Contacts_Class.getBGHMembersForPopup(searchKeyValsam, pageNumber, searchField, operatorminus,accbgh);
            BGH_Member_Contacts_Class.addContactToBGHAccount(conid, accbgh, true);
            BGH_Member_Contacts_Class.addContactToBGHAccount(conid, accbgh, true);
            BGH_Member_Contacts_Class.AccountBusinessGroupHealthResult wrapabgr =new BGH_Member_Contacts_Class.AccountBusinessGroupHealthResult();
            wrapabgr.isEditAccess=true;
            BGH_Member_Contacts_Class.deleteBGHRecordFromApplet(bghcon,accbgh, true);  
            BGH_Member_Contacts_Class.hasBGHMemberContactseditAccesToThisUser(accbgh);
            Test.stopTest(); 
        }
        
    }
    
        public static testMethod void readAndWritehasBGHMemberContactseditAccesToThisUserUserAccess() {
        
        Id userProfileId= [select Id, Name from Profile where name = 'System Administrator' limit 1].id;
        Id genExecUserRoleId = [select Id, Name from UserRole where name = 'General Executive' limit 1].id;
        
        List<User> usersList = new List<User>();
        
        User temuser = new User(
            LastName = 'LIVEE',
            FirstName='JASONN',
            Alias = 'jlivv',
            Email = 'jasonn.livestonn@asdf.com',
            Username = 'readandwriteasdsadaUser@crmit.com',
            ProfileId =userProfileId,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            UserRoleId=genExecUserRoleId,
            LocaleSidKey = 'en_US'); 
        usersList.add(temuser);
        
        User temuser1 = new User(
            LastName = 'LIVEE1',
            FirstName='JASONN1',
            Alias = 'jlivv1',
            Email = 'jasonn.livestonn1@asdf.com',
            Username = 'readandwriteasdsadaUser1@crmit.com',
            ProfileId = genExecUserRoleId,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            UserRoleId=genExecUserRoleId,
            LocaleSidKey = 'en_US'); 
        usersList.add(temuser1);
        
        Test.startTest();
        
        try {
            insert temuser;
            system.debug('temuser@@'+temuser);
        } catch (Exception e) {
            System.debug('An error occurred'+e.getMessage());
        }
        
        //Test.stopTest();
        
        system.debug('user@@'+temuser.Id);
        
        System.runAs(usersList[0]) {
            
            bulkTestData.UserTestData();
            bulkTestData.accountTestData();
            bulkTestData.ContactUHGTestData();
            bulkTestData.BGHContactTestData();
        }
        
        User temusers = [Select Id from User where Username = 'readandwriteasdsadaUser@crmit.com' LIMIT 1];
        
        system.debug('temusers@@@'+temusers);
        System.runAs(temusers) {
            //Test.startTest();
            string accbgh =[SELECT Id FROM Account WHERE Name='account BGH' LIMIT 1].Id;
			string conid =[SELECT Id FROM Contact WHERE FirstName='test aggfname' LIMIT 1].Id;
			string bghcon = [SELECT Id FROM BGHContact__c LIMIT 1].Id; 
            BGH_Member_Contacts_Class.hasBGHMemberContactseditAccesToThisUser(accbgh);
            Test.stopTest(); 
        }
        
    }
     public static testMethod void readAndWritegetBGHMembersForPopupUserAccess(){
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.BGHContactTestData();
        string accbgh =[SELECT Id FROM Account WHERE Name='account BGH' LIMIT 1].Id;
        string conid =[SELECT Id FROM Contact WHERE FirstName='test aggfname' LIMIT 1].Id;
        string bghcon = [SELECT Id FROM BGHContact__c LIMIT 1].Id;
        User readandwriteUser = [Select Id from User where Username = 'readandwriteUser@crmit.com' LIMIT 1];
        
        system.debug('readandwriteUser@@@'+readandwriteUser);
        System.runAs(readandwriteUser) {
            Test.startTest(); 
            BGH_Member_Contacts_Class.getBGHMembersForPopup(searchFieldsam, pageNumber, searchField, operator,accbgh);

            Test.stopTest(); 
        }
        
    }
    public static testMethod void readUserAccessgetBusinessGroupsonHealthOnAppletLoad(){
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.BGHContactTestData();
        string accbgh =[SELECT Id FROM Account WHERE Name='account BGH' LIMIT 1].Id;
        string conid =[SELECT Id FROM Contact WHERE FirstName='test aggfname' LIMIT 1].Id;
        string bghcon = [SELECT Id FROM BGHContact__c LIMIT 1].Id;
        User readUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readUser@@@'+readUser);
        System.runAs(readUser) {
            Test.startTest();
            try{
                system.debug('accbgh@@'+accbgh);
                BGH_Member_Contacts_Class.getBusinessGroupsonHealthOnAppletLoad(accbgh, columnName, sortType, false);
                
            }
            catch(Exception e){
                system.assert(e.getMessage().contains('Script-thrown exception'),true);
            }
            
            Test.stopTest(); 
        }
        
        
    }
    public static testMethod void readUserAccessgetBGHMembersForPopup(){
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.BGHContactTestData();
        string accbgh =[SELECT Id FROM Account WHERE Name='account BGH' LIMIT 1].Id;
        string conid =[SELECT Id FROM Contact WHERE FirstName='test aggfname' LIMIT 1].Id;
        string bghcon = [SELECT Id FROM BGHContact__c LIMIT 1].Id;
        User readUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readUser@@@'+readUser);
        System.runAs(readUser) {
            Test.startTest();
            try{
                system.debug('accbgh@@'+accbgh);
                BGH_Member_Contacts_Class.getBGHMembersForPopup(searchKeyValEmpty, pageNumber, searchField, operator, accbgh);              
            }
            catch(Exception e){
                system.assert(e.getMessage().contains('Script-thrown exception'),true);
            }
            
            Test.stopTest(); 
        }
        
        
    }
    public static testMethod void readUserAccessaddContactToBGHAccount(){
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.BGHContactTestData();
        string accbgh =[SELECT Id FROM Account WHERE Name='account BGH' LIMIT 1].Id;
        string conid =[SELECT Id FROM Contact WHERE FirstName='test aggfname' LIMIT 1].Id;
        string bghcon = [SELECT Id FROM BGHContact__c LIMIT 1].Id;
        User readUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readUser@@@'+readUser);
        System.runAs(readUser) {
            Test.startTest();
            try{
                system.debug('accbgh@@'+accbgh);
                BGH_Member_Contacts_Class.addContactToBGHAccount(conid, accbgh, true);
            }
            catch(Exception e){
                system.assert(e.getMessage().contains('Script-thrown exception'),true);
            }
            
            Test.stopTest(); 
        }
        
        
    }
    public static testMethod void readUserAccessdeleteBGHRecordFromApplet(){
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.BGHContactTestData();
        string accbgh =[SELECT Id FROM Account WHERE Name='account BGH' LIMIT 1].Id;
        string conid =[SELECT Id FROM Contact WHERE FirstName='test aggfname' LIMIT 1].Id;
        string bghcon = [SELECT Id FROM BGHContact__c LIMIT 1].Id;
        User readUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readUser@@@'+readUser);
        System.runAs(readUser) {
            Test.startTest();
            try{
                system.debug('accbgh@@'+accbgh);
                BGH_Member_Contacts_Class.deleteBGHRecordFromApplet(bghcon,accbgh, true);
            }
            catch(Exception e){
                system.assert(e.getMessage().contains('Script-thrown exception'),true);
            }
            
            Test.stopTest(); 
        }
        
        
    }
    public static testMethod void readUserAccesshasBGHMemberContactseditAccesToThisUser(){
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.BGHContactTestData();
        string accbgh =[SELECT Id FROM Account WHERE Name='account BGH' LIMIT 1].Id;
        string conid =[SELECT Id FROM Contact WHERE FirstName='test aggfname' LIMIT 1].Id;
        string bghcon = [SELECT Id FROM BGHContact__c LIMIT 1].Id;
        User readUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readUser@@@'+readUser);
        System.runAs(readUser) {
            Test.startTest();
            try{
                system.debug('accbgh@@'+accbgh);  
                BGH_Member_Contacts_Class.hasBGHMemberContactseditAccesToThisUser(accbgh);
            }
            catch(Exception e){
                system.assert(e.getMessage().contains('Script-thrown exception'),true);
            }
            
            Test.stopTest(); 
        }
        
        
    }
    //null pointer exception
    public static testMethod void nullreadUserAccessgetBusinessGroupsonHealthOnAppletLoad(){
        Test.startTest();
        try{
            BGH_Member_Contacts_Class.getBusinessGroupsonHealthOnAppletLoad(null, columnName, sortType, false);
            
        }
        catch(Exception e){
            system.debug('e@@1'+e);
            system.assert(e.getMessage().contains('Script-thrown exception'),true);
        }
        
        Test.stopTest(); 
        
        
        
    }
    public static testMethod void nullreadUserAccessgetBGHMembersForPopup(){
        Test.startTest();
        try{
            BGH_Member_Contacts_Class.getBGHMembersForPopup(searchKeyValEmpty, pageNumber, searchField, operator, null);              
        }
        catch(Exception e){
            system.debug('e@@2'+e);
            system.assert(e.getMessage().contains('Script-thrown exception'),true);
        }
        
        Test.stopTest(); 
        
        
        
    }
    public static testMethod void nullreadUserAccessaddContactToBGHAccount(){
        Test.startTest();
        try{
            BGH_Member_Contacts_Class.addContactToBGHAccount(null, null, true);
        }
        catch(Exception e){
            system.debug('e@@3'+e);
            system.assert(e.getMessage().contains('Script-thrown exception'),true);
        }
        
        Test.stopTest(); 
        
        
        
    }
    public static testMethod void nullreadUserAccessdeleteBGHRecordFromApplet(){
        
        Test.startTest();
        try{
            
            BGH_Member_Contacts_Class.deleteBGHRecordFromApplet(null,null, null);
        }
        catch(Exception e){
            system.debug('e@@4'+e);
            system.assert(null,null);
        }
        
        Test.stopTest(); 
    }
    
    
    
    public static testMethod void nullreadUserAccesshasBGHMemberContactseditAccesToThisUser(){
        
        Test.startTest();
        try{
            
            BGH_Member_Contacts_Class.hasBGHMemberContactseditAccesToThisUser(null);
        }
        catch(Exception e){
            system.assert(null,null);
        }
        
        Test.stopTest(); 
    }
}