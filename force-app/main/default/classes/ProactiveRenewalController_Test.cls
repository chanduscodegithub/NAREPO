@isTest
public class ProactiveRenewalController_Test {
    @testSetup static void createTestData() {
        
        List<user> userListToInsert = new List<user>();
        
        userListToInsert.add(new User(
            LastName = 'User 123',
            FirstName='Test',
            Alias = 'tstusr12',
            Email = 'vpcrtestuser@crmit.com',
            Username = 'vpcrtestuser@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
            UserRoleId = [select Id, Name from UserRole where name = 'CM VPCR/RVP' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
            Position__c='Test User',VPCR__c=true));
        
        User thisUser = [ select Id from User where Id = :UserInfo.getUserId() ];
        System.runAs ( thisUser ) {
            insert userListToInsert;
        }
        
        List<Account> accListToInsert = new List<Account>();
        accListToInsert.add(new Account(Name = 'Proactive Renewal Test Account',Subtype__c ='CVG',
                                        RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(),
                                        CMVPCRRVP__c=userListToInsert[0].Id
                                       ));
        accListToInsert.add(new Account(Name = 'Proactive Renewal Test Account-1',Subtype__c ='CVG',
                                        RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(),
                                        CMVPCRRVP__c=userListToInsert[0].Id
                                       ));
        
        insert accListToInsert;
        
        List<Opportunity> oppLstToInsert = new List<Opportunity>();
        
        oppLstToInsert.add(new Opportunity(AccountId = accListToInsert[0].Id,
                                           Name = 'Proactive Renewal Test Opportunity',
                                           Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal',
                                           Product_Type_Involved_in_Opp__c = 'Pharmacy;Medical;Other Buy Up Programs',
                                           Has_a_Formal_RFP_Been_Issued__c = 'No',
                                           Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
                                           Is_There_Existing_Membership_at_Risk__c  = 'No',
                                           Is_Created_by_QA__c = true,
                                           StageName='Qualification',
                                           CloseDate=System.today(),
                                           EffectiveDate__c = Date.newInstance(2021, 1, 1),
                                           RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
                                           Expected_Date_of_RFP__c = System.today(),
                                           Disposition_Pharmacy__c='Sold',Disposition_Medical__c='Sold',CM_VPCR_RVP__c=userListToInsert[0].Id,
                                           Proactive_Renewal_Incentive_Status__c='SS 2021 (First Year) - Pending Qualification'
                                          ));
        
        oppLstToInsert.add(new Opportunity( AccountId = accListToInsert[1].Id,
                                           Name = 'Proactive Renewal Test Opportunity-1',
                                           Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal',
                                           Product_Type_Involved_in_Opp__c = 'Pharmacy;Medical;Other Buy Up Programs;Dental',
                                           Has_a_Formal_RFP_Been_Issued__c = 'No',
                                           Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
                                           Is_There_Existing_Membership_at_Risk__c  = 'No',
                                           Is_Created_by_QA__c = true,
                                           StageName='Qualification',
                                           CloseDate=System.today(),
                                           EffectiveDate__c = Date.newInstance(2021, 1, 1),
                                           RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
                                           Expected_Date_of_RFP__c = System.today(),
                                           Disposition_Pharmacy__c='Sold',Disposition_Medical__c='Sold',Disposition_Dental__c='Sold',CM_VPCR_RVP__c=userListToInsert[0].Id,
                                           Proactive_Renewal_Incentive_Status__c='SS 2021 (First Year) - Qualifies - Fully Validated'                              
                                          ));
        oppLstToInsert.add(new Opportunity( AccountId = accListToInsert[1].Id,
                                           Name = 'Proactive Renewal Test Opportunity-2',
                                           Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal',
                                           Product_Type_Involved_in_Opp__c = 'Pharmacy;Medical;Other Buy Up Programs;Dental',
                                           Has_a_Formal_RFP_Been_Issued__c = 'No',
                                           Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
                                           Is_There_Existing_Membership_at_Risk__c  = 'No',
                                           Is_Created_by_QA__c = true,
                                           StageName='Qualification',
                                           CloseDate=System.today(),
                                           EffectiveDate__c = Date.newInstance(2022, 1, 1),
                                           RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
                                           Expected_Date_of_RFP__c = System.today(),
                                           Disposition_Pharmacy__c='Sold',Disposition_Medical__c='Sold',Disposition_Dental__c='Sold',CM_VPCR_RVP__c=userListToInsert[0].Id,
                                           Proactive_Renewal_Incentive_Status__c='SS 2022 (Second Year) - Pending Qualification	'                              
                                          ));
        
        insert oppLstToInsert;
    }
    
    @isTest static void testGetProactiveRenewalData(){ 
        Account acc=[Select Name,Owner.Name from Account where Name='Proactive Renewal Test Account' LIMIT 1];
        Test.startTest();
        User cmvpcrrvpRoleUser = [Select Id from User where Username = 'vpcrtestuser@crmit.com' LIMIT 1]; 
        System.runAs(cmvpcrrvpRoleUser) {
            ProactiveRenewalController.getProactiveRenewalData('','Account.Name','ASC','',null,null);
            System.assertEquals(1,ProactiveRenewalController.getProactiveRenewalData('IY21, 1/1/22','EffectiveDate__c','ASC','Current',acc.Owner.Name,null).opportunityList.size());
            System.assertEquals(0,ProactiveRenewalController.getProactiveRenewalData('IY19, 1/1/20','Account.Name','ASC','',null,acc.Name).opportunityList.size());
            System.assertEquals(0,ProactiveRenewalController.getProactiveRenewalData('IY20, 1/1/21','Name','DESC','Previous',null,null).opportunityList.size());
        }
        Test.stopTest();
    }
    
    
}