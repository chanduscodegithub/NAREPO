@isTest
public class NADataMigrationBatchTest {
    static testMethod void testMethod1(){
        
        Id cmAdminId = [select Id, Name from UserRole where Name = 'CRM Administrator' limit 1].id;
        Id cmVpcrRvpId = [select Id, Name from UserRole where Name = 'CM VPCR/RVP' limit 1].id;
        Id cmSceId = [select Id, Name from UserRole where Name = 'CM SCE' limit 1].id;
        
        Id userProfileId= [select Id, Name from Profile where name = 'Standard User' limit 1].id;
        
        List<user> testUserRecords = new List<user>();
        testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@asdf.com', Username = 'uhgDevWithoutId1@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmVpcrRvpId,
                                     EmailEncodingKey = 'UTF-8', VPCR__c = true, LocaleSidKey = 'en_US'));
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs2', Email = 'test2.user2@asdf.com', Username = 'uhgDevWithoutId2@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmVpcrRvpId,
                                     EmailEncodingKey = 'UTF-8', VPCR__c = false, LocaleSidKey = 'en_US'));
        testUserRecords.add(new user(LastName = 'Test3',FirstName='User3', Alias = 'tUs3', Email = 'test3.user3@asdf.com', Username = 'uhgDevWithoutId3@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmSceId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US'));
        testUserRecords.add(new user(LastName = 'Test4',FirstName='User4', Alias = 'tUs4', Email = 'test4.user4@asdf.com', Username = 'uhgDevWithoutId4@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmSceId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US'));
        testUserRecords.add(new user(LastName = 'Test5',FirstName='User15', Alias = 'tUs5', Email = 'test5.user5@asdf.com', Username = 'uhgDevWithoutId5@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmAdminId,
                                     EmailEncodingKey = 'UTF-8', VPCR__c = true, LocaleSidKey = 'en_US'));
        
        insert testUserRecords;
        
        User testAdminUser = testUserRecords[4];
        
        System.runAs(testAdminUser) {
            
            Account acc = new Account();
            acc.Name = 'Test NA Batch Account 11';
            acc.Subtype__c = 'National Accounts - East';
            acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
            insert acc;
            
            Account acc1 = new Account();
            acc1.Name = 'Test NA Batch Account 12';
            acc1.Subtype__c = 'National Accounts - East';
            acc1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
            insert acc1;
            
            List<CM_Account_Team_History__c> cmAccountTeamHistoryListTobeUpserted = new List<CM_Account_Team_History__c>();
            
            CM_Account_Team_History__c naObjDataVPCR1 = new CM_Account_Team_History__c(Name='1',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 10, 10),
                                                                                       IsVPCR__c = true,Role__c='CM VPCR/RVP',User__c=testUserRecords[0].Id,Account_Firm__c=acc.Id);  
            cmAccountTeamHistoryListTobeUpserted.add(naObjDataVPCR1);
            CM_Account_Team_History__c naObjDataRVP2 = new CM_Account_Team_History__c(Name='2',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 10, 10),
                                                                                      IsVPCR__c = false,Role__c='CM VPCR/RVP',User__c=testUserRecords[1].Id,Account_Firm__c=acc.Id);  
            cmAccountTeamHistoryListTobeUpserted.add(naObjDataRVP2);
            
            CM_Account_Team_History__c cmAccountTeamHistoryObjData3 = new CM_Account_Team_History__c(Name='3',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 10, 10),
                                                                                                     Job_Title__c='Strategic Client Executive',User__c=testUserRecords[2].Id,Role__c='CM SCE',Account_Firm__c=acc.Id);  
            cmAccountTeamHistoryListTobeUpserted.add(cmAccountTeamHistoryObjData3);
            CM_Account_Team_History__c cmAccountTeamHistoryObjData4 = new CM_Account_Team_History__c(Name='4',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 10, 10),
                                                                                                     Job_Title__c='Strategic Client Executive',User__c=testUserRecords[3].Id,Role__c='CM SCE',Account_Firm__c=acc.Id);  
            cmAccountTeamHistoryListTobeUpserted.add(cmAccountTeamHistoryObjData4);
            CM_Account_Team_History__c cmAccountTeamHistoryObjData5 = new CM_Account_Team_History__c(Name='5',Last_Name__c='Test', Case_Management_Start_Date__c=Date.newInstance(2018, 10, 10),
                                                                                                     Job_Title__c='Strategic Client Executive',Role__c='CM CSAD',Account_Firm__c=acc1.Id); 
            cmAccountTeamHistoryListTobeUpserted.add(cmAccountTeamHistoryObjData5);
            
            insert cmAccountTeamHistoryListTobeUpserted;
            
            Test.startTest();
            NADataMigrationBatch naDataMigration = new NADataMigrationBatch();
            Database.executeBatch(naDataMigration);
            Test.stopTest();        
        }
    }
}