@isTest
public class NationalAccountSalesTeamTestClass {
    
    
    @testSetup static void createTestData() {
        
        Id cmCSADUserRoleId = [select Id, Name from UserRole where name = 'CM CSAD' limit 1].id;
        Id genExecUserRoleId = [select Id, Name from UserRole where name = 'General Executive' limit 1].id;
        
        Id userProfileId= [select Id, Name from Profile where name = 'Standard User' limit 1].id;
        
        Id solutionManagerId = [Select id,name from profile where name = 'Solution Manager' limit 1].id; //SAMARTH
        
        List<user> testUserRecords = new List<user>();
        testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@crmit.com', Username = 'uhgDevWithoutId1@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmCSADUserRoleId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c = 'System User'));
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs2', Email = 'test2.user2@crmit.com', Username = 'uhgDevWithoutId2@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = genExecUserRoleId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c = 'System User'));
        testUserRecords.add(new user(LastName = 'Test3',FirstName='User3', Alias = 'tUs3', Email = 'test3.user3@crmit.com', Username = 'uhgDevWithoutId3@crmit.com',
                                     ProfileId = solutionManagerId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = genExecUserRoleId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c = 'System User'));//SAMARTH
        insert testUserRecords;
        
        List<Account> accList = new List<Account>();
        
        Account account = new Account();
        account.Name = 'Test CM Account1';
        account.Subtype__c ='Prospect';
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        accList.add(account);
        
        Account account1 = new Account();
        account1.Name = 'Test CM Account2';
        account1.Subtype__c ='Complex Accounts';
        account1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        accList.add(account1);
        
        Account account2 = new Account();
        account2.Name = 'Test CM Account3';
        account2.Subtype__c ='Complex Accounts';
        account2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        accList.add(account2);
        
        Account account3 = new Account();
        account3.Name = 'Test CM Account4';
        account3.Subtype__c ='Complex Accounts';
        account3.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        accList.add(account3);
        
        Account account4 = new Account();
        account4.Name = 'Test CM Account5';
        account4.Subtype__c = 'Suspect';
        account4.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Suspect').getRecordTypeId();
        accList.add(account4);
        
        System.runAs ( testUserRecords[0] ) {
            insert accList;
        }
    }
    
    /*
* The below method validates for the Logged In User data in SF
*/
    static testMethod void validateLoggedInUserRecords() {
        
        Test.startTest();
        List<User> userList = [Select Id, Name, LastName from User where LastName like '%Test%'];
        User user1;
        User user2;
        if(userList != null && userList.size() > 0) {
            for(User usrObj : userList) {
                if(usrObj.LastName == 'Test1') {
                    user1 = usrObj;
                } else if(usrObj.LastName == 'Test2') {
                    user2 = usrObj;
                }
            }
        }
        System.runAs(user1) {
            Boolean isLoggedInUserRoleToBeEnabledVal = NationalAccountSalesTeamClass.getLoggedInUerRoleInfo();
            System.debug('isLoggedInUserRoleToBeEnabledVal-'+isLoggedInUserRoleToBeEnabledVal);
        }
        System.runAs (user2) {
            Boolean isLoggedInUserRoleToBeEnabledVal = NationalAccountSalesTeamClass.getLoggedInUerRoleInfo();
            System.debug('isLoggedInUserRoleToBeEnabledVal-'+isLoggedInUserRoleToBeEnabledVal);
        }
        Test.stopTest();
    }
    
    static testMethod void validateAccountWithMultipleAssociatedRecords() {
        
        Test.startTest();
        
        Id accountId;
        Id accountId1;
        Id accountId2;
        Id accountId3;
        Id accountId4;
        
        List<Account> accountList = [SELECT Id,Name FROM Account WHERE Name LIKE 'Test CM Account%'];
        for(Account accObj : accountList) {
            if(accObj.Name == 'Test CM Account1') {
                accountId = accObj.Id;
            } else if(accObj.Name == 'Test CM Account2') {
                accountId1 = accObj.Id;
            } else if(accObj.Name == 'Test CM Account3') {
                accountId2 = accObj.Id;
            } else if(accObj.Name == 'Test CM Account4') {
                accountId3 = accObj.Id;
            }
            else if(accObj.Name == 'Test CM Account5') {
                accountId4 = accObj.Id;
            }
        }        
        
        /*
* Add the CM Account Team History Records to the Account.
*/
        
        List<CM_Account_Team_History__c> cmAccountTeamHistoryListTobeUpserted = new List<CM_Account_Team_History__c>();
        
        CM_Account_Team_History__c naObjDataVPCR1 = new CM_Account_Team_History__c(Name='1',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 5, 10),
                                                                                   IsVPCR__c = true,Role__c='CM VPCR/RVP',Account_Firm__c=accountId);  
        cmAccountTeamHistoryListTobeUpserted.add(naObjDataVPCR1);
        
        CM_Account_Team_History__c naObjDataVPCR2 = new CM_Account_Team_History__c(Name='11',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 5, 15),
                                                                                   IsVPCR__c = true,Role__c='CM VPCR/RVP',Account_Firm__c=accountId);  
        cmAccountTeamHistoryListTobeUpserted.add(naObjDataVPCR2);
        
        CM_Account_Team_History__c naObjDataVPCR3 = new CM_Account_Team_History__c(Name='12',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 6, 14),
                                                                                   Case_Management_End_Date__c=Date.newInstance(2022, 6, 20), IsVPCR__c = false,Role__c='CM VPCR/RVP',Account_Firm__c=accountId);  
        cmAccountTeamHistoryListTobeUpserted.add(naObjDataVPCR3);
        
        CM_Account_Team_History__c naObjDataRVP1 = new CM_Account_Team_History__c(Name='2',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 5, 10),
                                                                                  Job_Title__c='Regional Vice President',IsVPCR__c = false,Role__c='CM VPCR/RVP',Account_Firm__c=accountId);  
        cmAccountTeamHistoryListTobeUpserted.add(naObjDataRVP1);
        
        CM_Account_Team_History__c naObjDataRVP2 = new CM_Account_Team_History__c(Name='22',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 5, 12),
                                                                                  IsVPCR__c = false,Role__c='CM VPCR/RVP',Account_Firm__c=accountId);  
        cmAccountTeamHistoryListTobeUpserted.add(naObjDataRVP2);
        
        CM_Account_Team_History__c naObjDataRVP3 = new CM_Account_Team_History__c(Name='23',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 5, 12),
                                                                                  Job_Title__c='Regional Vice President',Case_Management_End_Date__c=Date.newInstance(2022, 6, 20),IsVPCR__c = true,Role__c='CM VPCR/RVP',Account_Firm__c=accountId);  
        cmAccountTeamHistoryListTobeUpserted.add(naObjDataRVP3);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData2 = new CM_Account_Team_History__c(Name='3',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 5, 10),
                                                                                                 Job_Title__c='Strategic Client Executive',Role__c='CM SCE',Account_Firm__c=accountId);  
        cmAccountTeamHistoryListTobeUpserted.add(cmAccountTeamHistoryObjData2);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData3 = new CM_Account_Team_History__c(Name='4',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 5, 10),
                                                                                                 Job_Title__c='Strategic Client Executive',Role__c='CM SCE',Account_Firm__c=accountId);  
        cmAccountTeamHistoryListTobeUpserted.add(cmAccountTeamHistoryObjData3);
        
        CM_Account_Team_History__c naObjData1 = new CM_Account_Team_History__c(Name='56',Last_Name__c='Test', Account_Firm__c=accountId); 
        
        cmAccountTeamHistoryListTobeUpserted.add(naObjData1);
        
        List<CM_Account_Team_History__c> cmAccountTeamHistoryListTobeUpserted1 = new List<CM_Account_Team_History__c>();
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData21 = new CM_Account_Team_History__c(Name='31',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 16),
                                                                                                  Case_Management_End_Date__c=Date.newInstance(2019, 12, 19),Job_Title__c='Strategic Client Executive',Role__c='CM SCE',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted1.add(cmAccountTeamHistoryObjData21);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData31 = new CM_Account_Team_History__c(Name='41',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 20),
                                                                                                  Job_Title__c='Strategic Client Executive',Role__c='CM SCE',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted1.add(cmAccountTeamHistoryObjData31);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData41 = new CM_Account_Team_History__c(Name='51',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 16),
                                                                                                  Case_Management_End_Date__c=Date.newInstance(2019, 12, 19),Job_Title__c='Regional Vice President',IsVPCR__c = false,Role__c='CM VPCR/RVP',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted1.add(cmAccountTeamHistoryObjData41);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData51 = new CM_Account_Team_History__c(Name='61',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 20),
                                                                                                  Job_Title__c='Regional Vice President',IsVPCR__c = false,Role__c='CM VPCR/RVP',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted1.add(cmAccountTeamHistoryObjData51);
        
        List<CM_Account_Team_History__c> cmAccountTeamHistoryListTobeUpserted2 = new List<CM_Account_Team_History__c>();
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData211 = new CM_Account_Team_History__c(Name='31',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 16),
                                                                                                   Job_Title__c='Strategic Client Executive',Role__c='CM SCE',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted2.add(cmAccountTeamHistoryObjData211);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData311 = new CM_Account_Team_History__c(Name='41',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 20),
                                                                                                   Job_Title__c='Strategic Client Executive',Role__c='CM SCE',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted2.add(cmAccountTeamHistoryObjData311);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData411 = new CM_Account_Team_History__c(Name='51',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 16),
                                                                                                   Job_Title__c='Regional Vice President',IsVPCR__c = true,Role__c='CM VPCR/RVP',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted2.add(cmAccountTeamHistoryObjData411);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData511 = new CM_Account_Team_History__c(Name='61',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 20),
                                                                                                   Job_Title__c='Regional Vice President',IsVPCR__c = false,Role__c='CM VPCR/RVP',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted2.add(cmAccountTeamHistoryObjData511);
        
        List<CM_Account_Team_History__c> cmAccountTeamHistoryListTobeUpserted3 = new List<CM_Account_Team_History__c>();
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData212 = new CM_Account_Team_History__c(Name='32',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 16),
                                                                                                   Case_Management_End_Date__c=Date.newInstance(2019, 12, 19),Job_Title__c='Strategic Client Executive',Role__c='CM SCE',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted3.add(cmAccountTeamHistoryObjData212);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData312 = new CM_Account_Team_History__c(Name='42',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 20),
                                                                                                   Case_Management_End_Date__c=Date.newInstance(2019, 12, 19),Job_Title__c='Strategic Client Executive',Role__c='CM SCE',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted3.add(cmAccountTeamHistoryObjData312);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData412 = new CM_Account_Team_History__c(Name='52',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 16),
                                                                                                   Case_Management_End_Date__c=Date.newInstance(2019, 12, 19),Job_Title__c='Regional Vice President',IsVPCR__c = true,Role__c='CM VPCR/RVP',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted3.add(cmAccountTeamHistoryObjData412);
        
        CM_Account_Team_History__c cmAccountTeamHistoryObjData512 = new CM_Account_Team_History__c(Name='62',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2019, 12, 20),
                                                                                                   Case_Management_End_Date__c=Date.newInstance(2019, 12, 19),Job_Title__c='Regional Vice President',IsVPCR__c = false,Role__c='CM VPCR/RVP',Account_Firm__c=accountId1);  
        cmAccountTeamHistoryListTobeUpserted3.add(cmAccountTeamHistoryObjData512);
        
        NationalAccountSalesTeamClass.CMAccountTeamHistoryResult cmAccountTeamHistoryResultObj = 
            NationalAccountSalesTeamClass.upsertCMAccountTeamHistoryRecords(accountId, cmAccountTeamHistoryListTobeUpserted);
        //NationalAccountSalesTeamClass.upsertCMAccountTeamHistoryRecords(accountId3, cmAccountTeamHistoryListTobeUpserted);
        
        System.assertEquals(cmAccountTeamHistoryResultObj.vpcr, true);
        //System.assertEquals(cmAccountTeamHistoryResultObj.rvp, true);
        System.assertEquals(cmAccountTeamHistoryResultObj.sce, true);
        
        /*
* Validate the getValues method to return the data.
*/
        List<CM_Account_Team_History__c> listToBeUpserted = new List<CM_Account_Team_History__c>();
        CM_Account_Team_History__c cmAccountTeamHistoryObjData4 = new CM_Account_Team_History__c(Name='4',Last_Name__c='Test',
                                                                                                 Case_Management_End_Date__c=Date.newInstance(2017, 7, 11),IsVPCR__c=false,Role__c='CM RVP',Account_Firm__c=accountId);  
        listToBeUpserted.add(cmAccountTeamHistoryObjData4);
        
        NationalAccountSalesTeamClass.CMAccountTeamHistoryResult cmAccountTeamHistoryResultObj1 = 
            NationalAccountSalesTeamClass.upsertCMAccountTeamHistoryRecords(accountId, listToBeUpserted);
        
        NationalAccountSalesTeamClass.CMAccountTeamHistoryResult cmAccountTeamHistoryResultObj2 = 
            NationalAccountSalesTeamClass.upsertCMAccountTeamHistoryRecords(accountId1, cmAccountTeamHistoryListTobeUpserted1);
        
        NationalAccountSalesTeamClass.upsertCMAccountTeamHistoryRecords(accountId2, cmAccountTeamHistoryListTobeUpserted2); 
        
        NationalAccountSalesTeamClass.upsertCMAccountTeamHistoryRecords(accountId3, cmAccountTeamHistoryListTobeUpserted3);
        
        //NationalAccountSalesTeamClass.upsertCMAccountTeamHistoryRecords(null, null);
        
        /*
* Validate the updateAccountContactMembershipActivityRecords method for the updation of fields at the Account.
*/
        //NationalAccountSalesTeamClass.updateAccountContactMembershipActivityRecords(accountId, cmAccountTeamHistoryResultObj1);
        try{
            NationalAccountSalesTeamClass.updateAccountRecords(accountId, cmAccountTeamHistoryResultObj1);
            NationalAccountSalesTeamClass.updateAccountRecords(accountId1, cmAccountTeamHistoryResultObj2);
            NationalAccountSalesTeamClass.updateAccountRecords(null, null);
            NationalAccountSalesTeamClass.upsertCMAccountTeamHistoryRecords(accountId, null);
        }
        catch(Exception e){
            system.debug('Exception has occured');
        }
        /*
* Validate the getCMAccountTeamHistoryRecords method for the CM VPCR/RVP field values related to VPCR Role.
*/ 
        NationalAccountSalesTeamClass.CMAccountTeamHistoryResult cmAccountTeamHistoryResultListObj = 
            NationalAccountSalesTeamClass.getCMAccountTeamHistoryRecords(accountId, 'Case_Management_End_Date__c', 'Desc', 'onLoad');
        //NationalAccountSalesTeamClass.getCMAccountTeamHistoryRecords(accountId1, 'Case_Management_End_Date__c', 'Desc', 'onLoad');
        //NationalAccountSalesTeamClass.getCMAccountTeamHistoryRecords(accountId4, 'Case_Management_End_Date__c', 'Desc', 'onLoad');
        /*
* Validate the getCMAccountTeamHistoryRecords method for the Sorting.
*/
        NationalAccountSalesTeamClass.CMAccountTeamHistoryResult cmAccountTeamHistoryResultList = 
            NationalAccountSalesTeamClass.getCMAccountTeamHistoryRecords(accountId, 'Name', 'Asc', 'onLoad');
        
        /*
* Validate the Sorting of Editable Records.
*/ 
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Case_Management_End_Date__c', 'Asc', 
                                                                      cmAccountTeamHistoryResultList.cmAccountTeamHistoryList);
        
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Case_Management_End_Date__c', 'Desc', 
                                                                      cmAccountTeamHistoryResultList.cmAccountTeamHistoryList);
        
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Case_Management_Start_Date__c', 'Asc', 
                                                                      cmAccountTeamHistoryResultList.cmAccountTeamHistoryList);
        
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Case_Management_Start_Date__c', 'Asc', 
                                                                      cmAccountTeamHistoryResultList.cmAccountTeamHistoryList);
        
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Job_Title__c', 'Desc', cmAccountTeamHistoryResultList.cmAccountTeamHistoryList);
        
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords(null, 'Asc', cmAccountTeamHistoryResultList.cmAccountTeamHistoryList);
        
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Job_Title__c', 'Asc', null);
        
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Name', 'Asc', 
                                                                      cmAccountTeamHistoryResultList.cmAccountTeamHistoryList);
        
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Name', 'Desc', 
                                                                      cmAccountTeamHistoryResultList.cmAccountTeamHistoryList);
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Last_Name__c', 'Asc', 
                                                                      cmAccountTeamHistoryResultList.cmAccountTeamHistoryList);
        
        NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Last_Name__c', 'Desc', 
                                                                      cmAccountTeamHistoryResultList.cmAccountTeamHistoryList);
        
        NationalAccountSalesTeamClass.getActiveCMAccountTeamHistoryRecords(cmAccountTeamHistoryListTobeUpserted,'upsertOperation'); //SAMARTH
        
        /*
* Validate the deleteCMAccountTeamHistoryRecord method.
*/
        Id cmAccountTeamHistoryRecordId = cmAccountTeamHistoryResultObj.cmAccountTeamHistoryList[0].id;
        List<CM_Account_Team_History__c> delDataList = new List<CM_Account_Team_History__c>();
        delDataList.add(cmAccountTeamHistoryResultObj.cmAccountTeamHistoryList[0]);
        NationalAccountSalesTeamClass.deleteCMAccountTeamHistoryRecord(cmAccountTeamHistoryRecordId);
        delDataList = new List<CM_Account_Team_History__c>();
        
        NationalAccountSalesTeamClass.CMAccountTeamHistoryResult cmAccountTeamHistoryResultListObj2 = 
            NationalAccountSalesTeamClass.getCMAccountTeamHistoryRecords(accountId, 'Case_Management_End_Date__c', 'Desc', 'onLoad');
        //NationalAccountSalesTeamClass.getCMAccountTeamHistoryRecords(accountId4, 'Case_Management_End_Date__c', 'Desc', 'onLoad');
        delDataList.add(cmAccountTeamHistoryResultListObj2.cmAccountTeamHistoryList[1]);
        System.debug('del Data-'+cmAccountTeamHistoryResultListObj2.cmAccountTeamHistoryList[1]);
        NationalAccountSalesTeamClass.deleteCMAccountTeamHistoryRecord(cmAccountTeamHistoryRecordId);
        delDataList = new List<CM_Account_Team_History__c>();
        
        /*
* Validate the getCMAccountTeamHistoryRecords method for the CM VPCR/RVP field values related to RVP Role.
*/ 
        NationalAccountSalesTeamClass.CMAccountTeamHistoryResult cmAccountTeamHistoryResultListObj1 = 
            NationalAccountSalesTeamClass.getCMAccountTeamHistoryRecords(accountId, 'Case_Management_End_Date__c', 'Desc', 'onLoad');
        
        
        
        
        
        /*NationalAccountSalesTeamClass.getLoggedInUerRoleInfo();
        try{
            NationalAccountSalesTeamClass.getCMAccountTeamHistoryRecords(null,null,null,null);
            NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords(null,null,null);
            NationalAccountSalesTeamClass.upsertCMAccountTeamHistoryRecords(null,null);
            NationalAccountSalesTeamClass.deleteCMAccountTeamHistoryRecord(null);
            NationalAccountSalesTeamClass.updateAccountRecords(null,null);
            NationalAccountSalesTeamClass.getUserRecords(null,null,null,null);
            NationalAccountSalesTeamClass.getActiveCMAccountTeamHistoryRecords(null,null);
            NationalAccountSalesTeamClass.sceVpcrsMapData(null,null,null);
            NationalAccountSalesTeamClass.updateVPCRRVPsData(null,null,null);
            NationalAccountSalesTeamClass.updateVpcrRvpScesData(null,null,null,null);
            NationalAccountSalesTeamClass.sortListForStartDateInAscOrDesc(null,null,null);
            
        }
        catch(Exception e){
            system.debug('Exception occured');
        }*/
        
        Test.stopTest();
        
    }
    
    /*
* The below method validates for the User data from SF.
*/
    static testMethod void validateUserRecords() {
        
        Test.startTest();
        NationalAccountSalesTeamClass.UserResult userListObj = 
            NationalAccountSalesTeamClass.getUserRecords('Test', 1, 'Last Name', 'Equals To');
        NationalAccountSalesTeamClass.UserResult userListObj1 = 
            NationalAccountSalesTeamClass.getUserRecords('Tes', 1, 'First Name', 'Begins With');
        NationalAccountSalesTeamClass.UserResult userListObj2 = 
            NationalAccountSalesTeamClass.getUserRecords('Te', 1, 'Last Name', 'Contains');
        NationalAccountSalesTeamClass.UserResult userListObj3 = 
            NationalAccountSalesTeamClass.getUserRecords('', 1, '', '');
        NationalAccountSalesTeamClass.UserResult userListObj4 = 
            NationalAccountSalesTeamClass.getUserRecords('srt', 1, 'Job title', 'Contains');
        Test.stopTest();
    }
    
    /*
* The below method validates for the No Access Exception.
*/
    public testMethod static void validateCMAccountTeamHistoryRecordsAccess() {
        
        User readOnlyUser = new User(
            LastName = 'LIVE1',
            FirstName='JASON2',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDev1@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
            Position__c = 'System User');
        
        insert readOnlyUser;
        
        Account account = [SELECT Id FROM Account WHERE Name='Test CM Account1' LIMIT 1];
        
        Test.startTest();
        System.runAs(readOnlyUser) {
            
            try {
                
                NationalAccountSalesTeamClass.CMAccountTeamHistoryResult cmAccountTeamHistoryResultListObj = 
                    NationalAccountSalesTeamClass.getCMAccountTeamHistoryRecords(account.Id, 'Case_Management_End_Date__c', 'Desc', 'onLoad');
                
                List<CM_Account_Team_History__c> listToBeInserted = new List<CM_Account_Team_History__c>();
                CM_Account_Team_History__c cmAccountTeamHistoryObjData4 = new CM_Account_Team_History__c(Name='5',Last_Name__c='Test',
                                                                                                         IsVPCR__c=true,Role__c='CM RVP',Account_Firm__c=account.Id); 
                listToBeInserted.add(cmAccountTeamHistoryObjData4);
                NationalAccountSalesTeamClass.CMAccountTeamHistoryResult cmAccountTeamHistoryResultListObj1 = 
                    NationalAccountSalesTeamClass.upsertCMAccountTeamHistoryRecords(account.Id, listToBeInserted);
                
                NationalAccountSalesTeamClass.sortCMAccountTeamHistoryRecords('Case_Management_End_Date__c', 'Asc', 
                                                                              listToBeInserted);
                
                NationalAccountSalesTeamClass.UserResult userListObj = NationalAccountSalesTeamClass.getUserRecords('', 1, '', '');   
                
                
            } catch(Exception e) {
                System.debug('Exception occured in validateCMAccountTeamHistoryRecordsAccess -> '+ e);
            }
            Test.stopTest();
            
        }
        
    }
    
}