@isTest
public class updateOpportunityOwnerNameTest {
    
    @testSetUp static void createTestData() {
        
        List<Account> accList = new List<Account>();
        List<Opportunity> oppList = new List<Opportunity>();
		List<User> testUserRecords = new List<User>();        
        
        Id cmSceId = [select Id, Name from UserRole where name = 'CM SCE' limit 1].id;
        Id cmVpcrId = [select Id, Name from UserRole where name = 'CM VPCR/RVP' limit 1].id;
		Id userProfileId= [select Id, Name from Profile where name = 'Standard User' limit 1].id;
        
        testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@crmit.com', Username = 'uhgDevWithoutId1@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId = cmSceId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c ='Test User'));
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs2', Email = 'test2.user2@crmit.com', Username = 'uhgDevWithoutId2@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmVpcrId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c ='Test User'));
        
        insert testUserRecords;
        
        User systemAdmin = [Select Id from User where Username = 'uhgDevWithoutId1@crmit.com' LIMIT 1]; 
        
        Account cdAcc = new Account();
        cdAcc.Name = 'Test CD Account';
        cdAcc.Subtype__c ='Prospect';
        cdAcc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        accList.add(cdAcc);
        
        Account accCM = new Account();
        accCM.Name = 'Test CM Account';
        accCM.Subtype__c ='Specialty Benefits Only';
        accCM.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        accList.add(accCM);
        
		System.runAs(systemAdmin) {
            insert accList;
        }
        
        Opportunity opp =  new Opportunity();
        opp.AccountId=accCM.Id;
        opp.Name='Test CM Opportunity';
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Pharmacy;Dental;Vision;Other Buy Up Programs';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp.Expected_Date_of_RFP__c = system.today();
        opp.StageName = 'Qualification';
        opp.CloseDate=System.today();
        opp.Disposition_Medical__c = 'Dead Lead';
        opp.Sales_Stage_Pharmacy__c = 'Lead';
        opp.Sales_Stage_Dental__c = 'Lead';
        opp.Sales_Stage_Medical__c = 'Lead';
		opp.Anticipated_Actual_Close_Date_Medical__c = System.today();
        opp.Anticipated_Actual_Close_Date_Dental__c = System.today();
        opp.Anticipated_Actual_Close_Date_Pharmacy__c = System.today();
        opp.Progression_Sales_Stage_Dental__c = 'NBEA_Proposal_Notified';
        opp.Progression_Sales_Stage_Pharmacy__c = 'NBEA_Proposal_Notified';
        oppList.add(opp);
        
        Opportunity opp1 =  new Opportunity();
        opp1.AccountId = cdAcc.Id;
        opp1.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp1.Name='Test CD Opportunity';
        opp1.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp1.EffectiveDate__c = system.today();
        opp1.Product_Type_Involved_in_Opp__c = 'Medical;Pharmacy;Dental;Vision;Other Buy Up Programs';
        opp1.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp1.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp1.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp1.Expected_Date_of_RFP__c = system.today();
        opp1.StageName = 'Qualification';
        opp1.CloseDate=System.today();
        opp1.Disposition_Medical__c = 'Dead Lead';
        opp1.Sales_Stage_Pharmacy__c = 'Lead';
        opp1.Anticipated_Actual_Close_Date_Pharmacy__c = System.today();
        
        oppList.add(opp1);
        
        System.runAs(systemAdmin) {
            insert oppList;
        }
        
    }
    
    @isTest
    static void updateMAOwnerNamesMethod() {
        
        test.startTest();
        User systemAdmin = [Select Id from User where Username = 'uhgDevWithoutId1@crmit.com' LIMIT 1]; 
        updateOpportunityOwnerName.processBuildersVariables variableValues = new updateOpportunityOwnerName.processBuildersVariables();
               
        List<Id> accIds = new List<Id>();
        List<Id> usrIds = new List<Id>();
        
        Account[] accList = [Select Id from Account];
        User[] usrList = [Select Id from User];        
        
        for(Account acc : accList) {
            accIds.add(acc.Id);
        }
        for(User usr : usrList) {
            usrIds.add(usr.Id);
        }
        
        variableValues.accountId = accIds;
        variableValues.ownerId = usrIds;
        
        System.runAs(systemAdmin) {
            updateOpportunityOwnerName.updateOwnerName(new List<updateOpportunityOwnerName.processBuildersVariables>{variableValues});
        }        
        
        test.stopTest();
        
    }

}