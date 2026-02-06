@isTest
public class NASalesTeamBatchTestClass {
    @testSetup static void createTestData() {
        
        //Creating one User and Inserting it for checking Future_CM_SCE__c is not null
        
        List<user> testUserRecords = new List<user>();
        Id userProfileId= [select Id, Name from Profile where name = 'Standard User' limit 1].id;
        Id genExecUserRoleId = [select Id, Name from UserRole where name = 'General Executive' limit 1].id;
        Id cmCSADUserRoleId = [select Id, Name from UserRole where name = 'CM CSAD' limit 1].id;
        testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@crmit.com', Username = 'uhgDevWithoutId1@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmCSADUserRoleId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c = 'System User'));
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs2', Email = 'test2.user2@crmit.com', Username = 'uhgDevWithoutId2@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = genExecUserRoleId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c = 'System User'));
        insert testUserRecords;
        
        User systemAdmin = [Select Id from User where Username = 'uhgDevWithoutId1@crmit.com' LIMIT 1]; 
        
        //List to store Multiple Accounts and insert them, trigger them emails based on Case Management End Date.
        List<Account> accData = new List<Account>();
        
        //List to store and insert NA sales Team Records and insert them.
        List<CM_Account_Team_History__c> naSalesTeamRecords = new List<CM_Account_Team_History__c>();
        
        for(Integer i =0;i < 6; i++){
            Account acc = new Account();
            acc.Name = 'Test Account '+i;
            acc.Subtype__c ='Prospect';
            acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
            acc.Future_CM_SCE_Start_Date__c = System.today() + i;
            acc.Future_CM_VPCR_RVP_Start_Date__c = System.today() + i;
            acc.Future_CM_SCE__c = testUserRecords[0].Id;
            acc.Future_CM_VPCR_RVP__c = testUserRecords[1].Id;
            accData.add(acc);
        }
        
        System.runAs(systemAdmin) {
            insert accData;
        }
        
        for(Integer i = 0; i<6 ; i++) {
            CM_Account_Team_History__c naRecords = new CM_Account_Team_History__c();
            if(i < 3) {
                naRecords.Account_Firm__c = accData[i].Id;
                naRecords.Name = 'Test NA User ';
                naRecords.Last_Name__c = 'SCE '+i;
                naRecords.Case_Management_End_Date__c = Date.today() + 1;
                naRecords.Case_Management_Start_Date__c = System.today() -4;
                naRecords.Role__c = 'CM SCE';
                naRecords.Job_Title__c = 'Strategic Client Executive';
            } else if(i >= 3) {
                naRecords.Account_Firm__c = accData[i].Id;
                naRecords.Name = 'Test NA User ';
                naRecords.Last_Name__c = 'RVP '+i;
                naRecords.Case_Management_End_Date__c = Date.today() + 1;
                naRecords.Case_Management_Start_Date__c = System.today() - 3;
                naRecords.Role__c = 'CM VPCR/RVP';
                naRecords.Job_Title__c = 'Regional Vice President';
            }
            naSalesTeamRecords.add(naRecords);
        }
        CM_Account_Team_History__c naRecordWithPassedRVPEndDate = new CM_Account_Team_History__c();
        naRecordWithPassedRVPEndDate.Account_Firm__c = accData[0].Id;
        naRecordWithPassedRVPEndDate.Name = 'Test NA User ';
        naRecordWithPassedRVPEndDate.Last_Name__c = 'RVP Passed End Date';
        naRecordWithPassedRVPEndDate.Case_Management_End_Date__c = System.today() - 1;
        naRecordWithPassedRVPEndDate.Case_Management_Start_Date__c = System.today() - 5;
        naRecordWithPassedRVPEndDate.Role__c = 'CM VPCR/RVP';
        naRecordWithPassedRVPEndDate.Job_Title__c = 'Regional Vice President';
        
        naSalesTeamRecords.add(naRecordWithPassedRVPEndDate);
        
        CM_Account_Team_History__c naRecordWithPassedCMSCEEndDate = new CM_Account_Team_History__c();
        naRecordWithPassedCMSCEEndDate.Account_Firm__c = accData[0].Id;
        naRecordWithPassedCMSCEEndDate.Name = 'Test NA User ';
        naRecordWithPassedCMSCEEndDate.Last_Name__c = 'SCE Passed End Date';
        naRecordWithPassedCMSCEEndDate.Case_Management_End_Date__c = System.today() - 1;
        naRecordWithPassedCMSCEEndDate.Case_Management_Start_Date__c = System.today() - 5;
        naRecordWithPassedCMSCEEndDate.Role__c = 'CM SCE';
        naRecordWithPassedCMSCEEndDate.Job_Title__c = 'Strategic Client Executive';
        
        naSalesTeamRecords.add(naRecordWithPassedCMSCEEndDate);

        /*CM_Account_Team_History__c naRecordWithPassedSBSCEEndDate = new CM_Account_Team_History__c();
        naRecordWithPassedSBSCEEndDate.Account_Firm__c = accData[0].Id;
        naRecordWithPassedSBSCEEndDate.Name = 'Test NA User ';
        naRecordWithPassedSBSCEEndDate.Last_Name__c = 'SCE Passed End Date';
        naRecordWithPassedSBSCEEndDate.Case_Management_End_Date__c = System.today() - 1;
        naRecordWithPassedSBSCEEndDate.Case_Management_Start_Date__c = System.today() - 5;
        naRecordWithPassedSBSCEEndDate.Role__c = 'Specialty Benefits SCE';
        naRecordWithPassedSBSCEEndDate.Job_Title__c = 'Strategic Client Executive';
        
        naSalesTeamRecords.add(naRecordWithPassedSBSCEEndDate);*/
        
        System.runAs(systemAdmin) {
            insert naSalesTeamRecords;
        }
    }
    
    public testMethod static void validateNASalesTeamEmailNotificationBatch(){        
        Test.startTest();
        User systemAdmin = [Select Id from User where Username = 'uhgDevWithoutId1@crmit.com' LIMIT 1]; 
        System.runAs(systemAdmin) {
            //Database.executeBatch(new NASalesTeamEmailNotoficationBatch()); 
            Datetime dt = Datetime.now().addMinutes(1);
        	String CRON_EXP = '0 '+ dt.minute() + ' * ' + dt.day() + ' ' + dt.month() + ' ? ' + dt.year();
        	System.schedule('Test NA Sales Team Batch', CRON_EXP, new ScheduleNASalesTeamBatch());  
        }
        Test.stopTest();
    }
}