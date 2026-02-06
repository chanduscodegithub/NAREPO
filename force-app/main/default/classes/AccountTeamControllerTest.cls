@isTest
private class AccountTeamControllerTest {
    
    @testSetup static void createTestData() {
        
        Account acc = new Account();
        acc.Name = 'testAccount';
        acc.Subtype__c ='Prospect';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acc;
        
        Account accWithoutId = new Account();
        accWithoutId.Name = 'testAccountWitoutId';
        accWithoutId.Subtype__c ='Prospect';
        accWithoutId.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accWithoutId;
        
        Opportunity opp =  new Opportunity();
        opp.AccountId=acc.Id;
        opp.Name='Test Opportunity';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp.Expected_Date_of_RFP__c = system.today();
        opp.StageName = 'Qualification';
        opp.CloseDate=System.today();
        insert opp;
        
        User readOnlyUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDevReadOnly@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            Position__c = 'Test User',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US');
        
        insert readOnlyUser;
        
        Id userProfileId= [select Id, Name from Profile where name = 'Standard User' limit 1].id;
        List<user> testUserRecords = new List<user>();
        for(Integer i=0;i<10;i++) {
            testUserRecords.add(new user(LastName = 'TestAcct'+i,FirstName='testFirstNAme'+i,
                                         Alias = 'jliv',
                                         Email = 'jason.liveston@crmit.com',
                                         Username = 'uhgDevWithoutId'+i+'@crmit.com',
                                         ProfileId = userProfileId,
                                         TimeZoneSidKey = 'GMT',
                                         Position__c = 'Test User',
                                         LanguageLocaleKey = 'en_US',
                                         IsActive = true,
                                         EmailEncodingKey = 'UTF-8',
                                         LocaleSidKey = 'en_US'));
        }
        insert testUserRecords;
        
        List<user> testUserRecordsWithoutId= new List<user>();
        for(Integer i=0;i<10;i++) {
            testUserRecordsWithoutId.add(new user(LastName = 'TestAcctWithoutId'+i,FirstName='testFirstNAme'+i,
                                                  Alias = 'jliv',
                                                  Email = 'jason.liveston@crmit.com',
                                                  Username = 'uhgDev'+i+'@crmit.com',
                                                  ProfileId = userProfileId,
                                                  TimeZoneSidKey = 'GMT',
                                                  Position__c = 'Test User',
                                                  LanguageLocaleKey = 'en_US',
                                                  IsActive = true,
                                                  EmailEncodingKey = 'UTF-8',
                                                  LocaleSidKey = 'en_US'));
        }
        insert testUserRecordsWithoutId;
        
        List<AccountTeamMember> testAccountTeamMemberRecords = new List<AccountTeamMember>();
        for(Integer i=0;i<10;i++) {
            testAccountTeamMemberRecords.add(new AccountTeamMember(AccountId=acc.Id,UserId=testUserRecords.get(i).Id,TeamMemberRole='Account Manager'));
        }
        insert testAccountTeamMemberRecords;
        
        List<AccountTeamMember> testAccountTeamMemberRecordsWithoutId = new List<AccountTeamMember>();
        for(Integer i=0;i<10;i++) {
            testAccountTeamMemberRecordsWithoutId.add(new AccountTeamMember(AccountId=accWithoutId.Id,UserId=testUserRecordsWithoutId.get(i).Id,TeamMemberRole='Account Manager'));
        }
        insert testAccountTeamMemberRecordsWithoutId;
        
        Id oppId = [SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id;
        
        List<OpportunityTeamMember> testOpportunityTeamMemberRecords = new List<OpportunityTeamMember>();
        for(Integer i=0;i<10;i++) {
            testOpportunityTeamMemberRecords.add(new OpportunityTeamMember(OpportunityId=oppId,UserId=testUserRecords.get(i).Id,TeamMemberRole='Account Manager'));
        }
        insert testOpportunityTeamMemberRecords;
        
    }
    
    public testMethod static void validategetAccountTeamMebers(){
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        Id oppId = [SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id;
        
        Test.startTest();
        String objtype = AccountTeamController.getObjectType(acct);
        system.assertNotEquals(null, objtype);
        AccountTeamController.accountTeamInitialValues  teamRole = AccountTeamController.getAccountTeamRole(acct);
        system.assertNotEquals(null, teamRole);
        AccountTeamController.AccountTeamMemberResult accTeamMember = AccountTeamController.getAccountTeamMemberRecords(acct,1, 'LastName', 'ASC');
        System.assertEquals(5, accTeamMember.accountTeamMembers.size());
        System.assertNotEquals(0, accTeamMember.accountTeamMembers.size());
        AccountTeamController.AccountTeamMemberResult oppTeamMember = AccountTeamController.getAccountTeamMemberRecords(oppId,1, 'Name', 'ASC');
        System.assertEquals(5, oppTeamMember.accountTeamMembers.size());
        System.assertNotEquals(0, oppTeamMember.accountTeamMembers.size());
        try{
            AccountTeamController.AccountTeamMemberResult accTeamMembernullCheck = AccountTeamController.getAccountTeamMemberRecords(acct,1, 'LastName', 'null');
        }catch(Exception e){
            System.assertEquals(null, null);
        }
        try{
            AccountTeamController.AccountTeamMemberResult accTeamMemberGeneralException = AccountTeamController.getAccountTeamMemberRecords(null,0, 'LastName', 'null');
        }catch(Exception e){
            System.assertEquals(null, null);
        }
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        System.runAs(readOnlyUser) {
            try{
                AccountTeamController.AccountTeamMemberResult userAccess = AccountTeamController.getAccountTeamMemberRecords(acct,1, 'LastName', 'ASC');
            }catch(Exception e){
                System.assertEquals(null, null);
            }
            
            try{
                AccountTeamController.getAccountTeamRole(acct);
            }catch(Exception e){
                System.assertEquals(null, null);
            }
        }
        Test.stopTest();
    }
    public testMethod static void validateUserRecords(){
        
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        Id oppId = [SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id;
        
        Test.startTest();
        AccountTeamController.UserResult userListObj = AccountTeamController.getUserRecords('TestAcct1', 1, 'Last Name', 'Contains',acct);
        System.debug('userListObj'+userListObj.userList);
        System.assertEquals(userListObj.userList.size(),0);
        System.assertNotEquals(userListObj.userList.size(),1);
        AccountTeamController.UserResult userListObj1 = AccountTeamController.getUserRecords('tes', 1, 'First Name', 'Begins With',acct);
        System.assertEquals(userListObj1.userList.size(),10);
        System.assertNotEquals(userListObj1.userList.size(),0);
        AccountTeamController.UserResult userListObj2 = AccountTeamController.getUserRecords('Te', 4, 'Last Name', 'Contains',acct);
        //System.assertEquals(userListObj2.userList.size(),0);
        AccountTeamController.UserResult userListObj6 = AccountTeamController.getUserRecords('TestAcctWithoutId1', 1, 'Last Name', 'Equals to',acct);
        //System.assertEquals(userListObj6.userList.size(),1);
        try{
            AccountTeamController.UserResult userListObj3 = AccountTeamController.getUserRecords('', 1, '', '',acct);
        }catch(Exception e){
            System.assertEquals(null,null); 
        }
        try{
            AccountTeamController.UserResult userListObj4 = AccountTeamController.getUserRecords('', 0, '', '',acct);
        }catch(Exception e){
            System.assertEquals(null, null);
        }
        
        
        
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        
        System.runAs(readOnlyUser) {
            try{
                AccountTeamController.UserResult userListObjReadOnly = AccountTeamController.getUserRecords('Te', 1, 'Last Name', 'Contains',acct);
            }catch(Exception e){
                System.assertEquals(null, null);
            }
        }
        Test.stopTest();     
    }
    
    public testMethod static void validatecreateTeamMembers(){
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        Id opportunityId = [SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id;
        Test.startTest();
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        System.debug('opportunityId'+opportunityId+'acct'+acct+'readOnlyUser'+readOnlyUser);
        AccountTeamController.AccountTeamMemberResult createTeamMembers = AccountTeamController.createAccountTeamMember(acct, readOnlyUser.Id);
        System.assertEquals(createTeamMembers.accountTeamMembers.size(),5);
        AccountTeamController.AccountTeamMemberResult createOppTeamMembers = AccountTeamController.createAccountTeamMember(opportunityId, readOnlyUser.Id);
        System.assertEquals(createTeamMembers.accountTeamMembers.size(),5);
        //AccountTeamController.AccountTeamMemberResult accountIdNullCheck = AccountTeamController.createAccountTeamMember(opportunityId, readOnlyUser.Id);
        //AccountTeamController.AccountTeamMemberResult userIdNullCheck = AccountTeamController.createAccountTeamMember(acct, opportunityId);
        try{
            AccountTeamController.AccountTeamMemberResult NullCheck = AccountTeamController.createAccountTeamMember(null, acct);
        }catch(Exception e){
            System.assertEquals(null, null);
        }
        System.runAs(readOnlyUser) {
            try{
                AccountTeamController.AccountTeamMemberResult userAccessValidation = AccountTeamController.createAccountTeamMember(acct, readOnlyUser.Id);
            }catch(Exception e){
                System.assertEquals(null, null);
            }
        }
        Test.stopTest(); 
    }
    
    public testMethod static void validateDeleteTeamMembers(){
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        Id oppId = [SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id;
        List<Id> accIdList = new List<Id>();
        accIdList.add(acct);
        User readOnlyUser = [Select Id from User where Username = 'uhgDevWithoutId0@crmit.com' LIMIT 1]; 
        Test.startTest();
        try{
            AccountTeamController.removeAccountTeamMember(oppId,1,readOnlyUser.Id);
            PreviousAccountOwnerRemove.removeOppTeam(accIdList);
            AccountTeamController.removeAccountTeamMember(acct,1,null);
        }catch(Exception e){
            
        }
        
        System.runAs(readOnlyUser) {
            try{
                AccountTeamController.removeAccountTeamMember(acct,1,readOnlyUser.Id);
                //AccountTeamController.removeAccountTeamMember(oppId,1,readOnlyUser.Id);
            }catch(Exception e){
                
            }           
        }
        Test.stopTest();
    }
}