@isTest
public class EBDControllerTest {
    @isTest public static void setupTestData(){
        User us = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.livestontestuu11@crmit.com',
            Username = 'uhgDevReadOnlytestebdtest@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            Position__c = 'Test User',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US');
        
        insert us;
        Account account = new Account();
        account.Name = 'Opp Trigger Test Account';
        account.Subtype__c ='Prospect';
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert account;
        Account account2 = new Account();
        account2.Name = 'Equity Healthcare';
        account2.Subtype__c ='National Accounts - East';
        account2.Current_Deal_Start_Date__c = Date.newInstance(2023, 2, 15);
        account2.Current_Deal_Next_Renewal_Date__c = Date.newInstance(2023, 2, 15);
        account2.Surest_Next_Renewal_Date__c = Date.newInstance(2023, 2, 15);
        account2.Surest_Current_Deal_Start_Date__c = Date.newInstance(2023, 2, 15);
        account2.UHC_Medical_Members__c = 0 ;
        account2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        account2.CM_SCE__c = us.Id;
        insert account2;
        Account account3 = new Account();
        account3.Name = 'Equity Healthcare';
        account3.Subtype__c ='Consulting Firm';
        account3.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        account3.CM_SCE__c = us.Id;
        insert account3;
        Account accFirm2 = new Account();
        Account.ConsultantFirm__c =account3.id;
        accFirm2.Name = 'account Firm2';
        accFirm2.Subtype__c ='National Accounts - East';
        accFirm2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accFirm2;
        
        Contact contact = new Contact( FirstName = 'Jane',LastName = 'Doe',Email = 'jane.doe@example.com',AccountId =account.id);
        insert contact;
        Contact contact1 = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Title = 'Executive',
            UHGPrimaryContactwithExecutive__c = 'Yes',
            AccountId = account.id
        );
        insert contact1;
        
        Contact contact2 = new Contact();
        contact2.FirstName = 'Test';
        contact2.LastName = 'user';
        contact2.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        contact2.AccountId = account3.Id;
        insert contact2;
        EBD__c ebd = new EBD__c(Company__c = account2.Id, 
                                Brief_Company_Description__c = 'Brief description 1',
                                Relationship_History__c = 'History 1',
                                Involvement_In_CAC__c = true,
                                X5_Savings_Plan__c = '5% Plan Details',
                                X10_Savings_Plan__c = '10% Plan Details',
                                X20_Savings_Plan__c = '20% Plan Details',
                                Additional_Comments__c = 'Some comments here',
                                UHC_Services__c = 'UHC Service details',
                                Client_s_Interest__c = 'Client interests mentioned');
        insert ebd;
        
        ClientSurveyResults__c survey = new ClientSurveyResults__c(Name = '2025 Survey',Account__c = account2.Id,Year__c = '2025');
        insert survey;
        
        AccountContactRelation acc_Con_Rel = new AccountContactRelation();
        acc_Con_Rel.ContactId = contact2.Id;       
        acc_Con_Rel.AccountId = accFirm2.Id;
        insert acc_Con_Rel;
        SeniorUHGExecutivesEngaged__c seniorUhg = new SeniorUHGExecutivesEngaged__c(Name ='Test senior uhg',Surest_Executive_Sponsor_Name_Other__c='Test Surest Sponsor',
                                                                                    OptumExecutiveSponsorName__c='Test Optum',EnterpriseExecutiveSponsorName__c='Test enterprise',
                                                                                    UHCExecutiveSponsorName__c='Test Uhc',Account__c =account2.Id);
        insert seniorUhg;
        //Id businessGroupRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get(Business Group on Health (BGH)').getRecordTypeId();
        Id businessGroupRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        Account bghAccount = new Account(
            Name = 'BGH Org A',
            RecordTypeId = businessGroupRecordTypeId,
            Subtype__c = 'Business Group on Health (BGH)'
        );
        insert bghAccount;
        
        BGH__c bgh = new BGH__c(BGH_Account__c = bghAccount.Id,New_Account__c=bghAccount.Id);
        insert bgh;
        Account competitorAccount = new Account(Name='Aetna',Subtype__c ='Competitor',
                                                RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId());
        insert competitorAccount;
        Competitor__c competitor = new Competitor__c(
            Name = 'Competitor 1',
            Account__c = account2.Id,
            CompetitorAccount__c = competitorAccount.Id,
            Tenure__c = '2 years',
            //Strength__c = 'Strong',
            Inactive_Competitor_Status__c = false,
            Competitorclassification__c = 'Other',
            //Type_of_Products_Services_Provided__c = 'Healthcare',
            Inactive_Competitor_Date__c = null 
        );
        insert competitor;
        
        Competitor__c nonOtherClassification = new Competitor__c(
            Name = 'Competitor 2',
            Account__c = account2.Id,
            CompetitorAccount__c = competitorAccount.Id,
            //Competitorclassification__c = 'Primary',
            Inactive_Competitor_Status__c = false
        );
        insert nonOtherClassification;
        Competitor__c inactiveCompetitor = new Competitor__c(
            Name = 'Competitor 3',
            Account__c = account2.Id,
            CompetitorAccount__c = competitorAccount.Id,
            Competitorclassification__c = 'Other',
            Inactive_Competitor_Status__c = true
        );
        insert inactiveCompetitor;
        Account uhcOptum = new Account(Name = 'UHC-Optum',Subtype__c ='Competitor',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId());
        insert uhcOptum;
        Competitor__c uhcCompetitor = new Competitor__c(
            Name = 'Competitor 4',
            Account__c = account2.Id,
            CompetitorAccount__c = uhcOptum.Id,
            Competitorclassification__c = 'Other',
            Inactive_Competitor_Status__c = false
        );
        insert uhcCompetitor;
        ClientSurveyResults__c survey1 = new ClientSurveyResults__c(
            Name = 'Survey 2023',
            Year__c = '2023',
            LikelihoodtoRecommendScore__c = '9',
            NetPromoterType__c = 'Promoter',
            OverallSatisfactionScore__c = '8',
            Account__c = account2.id
        );
        insert survey1;
        Entertainment__c entertainment = new Entertainment__c(
            Name = 'Dinner Event',
            Client_Representative_s__c = 'Jane Smith',
            UHG_Representative_s__c = 'Bob Brown',
            Event__c = 'Annual Outing',
            Timing__c = 'test 2025',
            EBD__c = ebd.id
        );
        insert entertainment;
        
        EBD_NPS__c nps = new EBD_NPS__c(
            Strategy__c = 'Affordability',
            Action_Steps_Planned_Taken__c = 'Implement automation',
            Estimated_Completion_Date__c = Date.today().addDays(30),
            EBD__c = ebd.id
        );
        insert nps;
        Client_Priority__c priority = new Client_Priority__c(
            UHG_Strategy__c = 'Cost Reduction',
            Client_Priority__c = 'Data Transparency',
            EBD__c = ebd.id
        );
        insert priority;
        B2B__c b2b = new B2B__c(
            Name = 'B2B Entry',
            UHG_Business_Segment__c = 'Healthcare',
            UHG_Buyer_or_Decision_Make__c = 'Procurement Head',
            EBD__c = ebd.id
        );
        insert b2b;
        Advocacy__c advocacy = new Advocacy__c(
            Name = 'In-House Program',
            Vendor_Model__c = 'Direct',
            Site_if_in_house__c = 'Minneapolis HQ',
            EBD__c = ebd.id
        );
        insert advocacy;
        Anticipated_Bid_Cycle_For_Major_Products__c bidCycle = new Anticipated_Bid_Cycle_For_Major_Products__c(
            Name = '2026 Pharmacy',
            Product__c = 'Pharmacy',
            Incumbent__c = 'CVS',
            Deal_Cycle__c = '2026',
            Status__c = 'Green',
            EBD__c = ebd.id
        );
        insert bidCycle;
        List<Financial__c> financialRecords = new List<Financial__c>{
            new Financial__c(
                Name = 'test2',
                Year__c = Date.newInstance(2024, 7, 16),
                Last_Updated__c = Date.newInstance(2025, 7, 29),
                Membership__c = 3467,
                Revenue__c = 5678,
                Revenue_URS__c = 2042,
                Revenue_Total_UHG__c = 2041,
                Financial_Type__c = 'Total',
                Membership_Type__c = 'Medical',
                Company__c = account2.id
                
            ),
                new Financial__c(
                    Name = 'Test',
                    Year__c = Date.newInstance(2023, 7, 4),
                    Last_Updated__c = Date.newInstance(2025, 7, 28),
                    Membership__c = 20000,
                    Revenue__c = 2000,
                    Financial_Type__c = 'Surest',
                    Membership_Type__c = 'Medical',
                    Company__c = account2.id
                    
                ),
                
                new Financial__c(
                    Name = 'test4 surest',
                    Year__c = Date.newInstance(2025, 7, 23),
                    Last_Updated__c = Date.newInstance(2025, 7, 29),
                    Membership__c = 333,
                    Revenue__c = 389,
                    Financial_Type__c = 'Surest',
                    Membership_Type__c = 'Medical',
                    Company__c = account2.id
                    
                ),
                new Financial__c(
                    Name = '2024 total',
                    Year__c = Date.newInstance(2024, 7, 23),
                    Last_Updated__c = Date.newInstance(2025, 7, 28),
                    Membership__c = 333,
                    Revenue__c = 2000,
                    Financial_Type__c = 'Surest',
                    Membership_Type__c = 'Medical',
                    Company__c = account2.id ),
                new Financial__c(
                    Name = '2023',
                    Year__c = Date.newInstance(2023, 8, 10),
                    Last_Updated__c = Date.newInstance(2025, 8, 18),
                    Membership__c = 333,
                    Revenue__c = 2000,
                    Revenue_URS__c = 232,
                    Revenue_Total_UHG__c = 231,
                    Financial_Type__c = 'Total',
                    Membership_Type__c = 'Medical',
                    Company__c = account2.id
                )
                };
                    insert financialRecords;
        
        
        
        Test.startTest();
        EBDController.EBDDataWrapper wrapper = EBDController.getEbdData(account2.Id);
        //ApexPages.currentPage().getParameters().put('accountId', account.Id);
        ApexPages.currentPage().getParameters().get('account2.Id');
        //ApexPages.currentPage().getParameters().put('wordReport', '1');
        Test.setCurrentPage(Page.EBDWordDocVfPage);
        ApexPages.currentPage().getParameters().put('id', account2.Id);
        //ApexPages.currentPage().getParameters().get('account2.Id');
        //EBDController.updateSCEValidationInfo(account2.Id); 
        EBDController controller = new EBDController();
        controller.ebdwrapper = EBDController.getEbdData(account2.Id);
        List<String> options = EBDController.getStrategyOptions();
        List<String> options1 = EBDController.getStatusOptions();
        EBDController.saveEbdData(
            ebd,
            new List<Entertainment__c>{ entertainment },
            new List<Id>{ entertainment.Id },
            new List<Client_Priority__c>{ priority },
            new List<Id>{ priority.Id },
            new List<B2B__c>{ b2b },
            new List<Id>{ b2b.Id },
            new List<Advocacy__c>{ advocacy },
            new List<Id>{ advocacy.Id },
            new List<EBD_NPS__c>{ nps },
            new List<Id>{ nps.Id },
            new List<Anticipated_Bid_Cycle_For_Major_Products__c>{ bidCycle },
            new List<Id>{ bidCycle.Id },
            new List<Competitor__c>{ competitor },
            financialRecords,
            account2.Id
        );
        
        Test.stopTest();
        
    }
    @isTest public static void accessTestData(){
        Profile p = [SELECT Id FROM Profile WHERE Name='System Administrator']; 
        User us = new User(Alias = 'testu', Email='testuser@crmit.com', Position__c='Test user',
                           EmailEncodingKey='UTF-8', FirstName ='test',LastName='Test', 
                           LanguageLocaleKey='en_US', LocaleSidKey='en_US', 
                           ProfileId = p.Id, TimeZoneSidKey='America/Los_Angeles', 
                           UserName='testuserryrebdtest@example.com');        
        insert us;
        Account account = new Account();
        account.Name = 'Opp Trigger Test Account';
        account.Subtype__c ='Prospect';
        account.CM_SCE__c = us.id;
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert account;
        Test.startTest();
        System.runAs(us) {
            // Boolean hasAccess = EBDController.hasEditAccess(account.Id);
            Boolean result = EBDController.hasEditAccess(account.Id);
            
        }
        Test.stopTest();
    }
    @isTest public static void accessTestDataVpcr(){
        Profile p = [SELECT Id FROM Profile WHERE Name='System Administrator']; 
        User us = new User(Alias = 'testu', Email='testuserebd@crmit.com', 
                           EmailEncodingKey='UTF-8',FirstName ='test', LastName='Test', 
                           LanguageLocaleKey='en_US', LocaleSidKey='en_US', 
                           ProfileId = p.Id, TimeZoneSidKey='America/Los_Angeles', Position__c='Test user',
                           UserName='testuserrr123ebdtestclass@example.com');
        insert us;
        Account account = new Account();
        account.Name = 'Opp Trigger Test Account';
        account.Subtype__c ='Prospect';
        account.CMVPCRRVP__c = us.id;
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert account;
        
        Test.startTest();
        System.runAs(us) {
            Boolean result = EBDController.hasEditAccess(account.Id);
        }
        Test.stopTest();
    }
    @isTest
    static void testDeleteClientPriorityRecord() {
        EBD__c ebd = new EBD__c();
        insert ebd;
        List<Client_Priority__c> priorityList = new List<Client_Priority__c>();
        for (Integer i = 0; i < 2; i++) {
            priorityList.add(new Client_Priority__c(
                EBD__c = ebd.Id
            ));
        }
        insert priorityList;
        Test.startTest();
        EBDController.deleteClientPriorityRecord('"' + ebd.Id + '"');
        Test.stopTest();
    }
    @isTest
    static void testdeleteAdvocacyRecord() {
        EBD__c ebd = new EBD__c();
        insert ebd;
        List<Advocacy__c> advocacyList = new List<Advocacy__c>();
        for (Integer i = 0; i < 2; i++) {
            advocacyList.add(new Advocacy__c(
                EBD__c = ebd.Id
            ));
        }
        insert advocacyList;
        Test.startTest();
        EBDController.deleteAdvocacyRecord('"' + ebd.Id + '"');
        Test.stopTest();
    }
    @isTest
    static void testDeleteBusinessRecord() {
        EBD__c ebd = new EBD__c();
        insert ebd;
        List<B2B__c> businessList = new List<B2B__c>();
        for (Integer i = 0; i < 2; i++) {
            businessList.add(new B2B__c(
                EBD__c = ebd.Id
            ));
        }
        insert businessList;
        Test.startTest();
        EBDController.deleteBusinessRecord('"' + ebd.Id + '"');
        Test.stopTest();
    }
    @isTest
    static void testDeleteNpsRecord() {
        EBD__c ebd = new EBD__c();
        insert ebd;
        List<EBD_NPS__c> npsList = new List<EBD_NPS__c>();
        for (Integer i = 0; i < 2; i++) {
            npsList.add(new EBD_NPS__c(
                EBD__c = ebd.Id
            ));
        }
        insert npsList;
        Test.startTest();
        EBDController.deleteNpsRecord('"' + ebd.Id + '"');
        Test.stopTest();
    }
    @isTest
    static void testDeleteAnticipatedRecord() {
        EBD__c ebd = new EBD__c();
        insert ebd;
        List<Anticipated_Bid_Cycle_For_Major_Products__c> anticipatedList = new List<Anticipated_Bid_Cycle_For_Major_Products__c>();
        for (Integer i = 0; i < 2; i++) {
            anticipatedList.add(new Anticipated_Bid_Cycle_For_Major_Products__c(
                EBD__c = ebd.Id
            ));
        }
        insert anticipatedList;
        Test.startTest();
        EBDController.deleteAnticipatedRecord('"' + ebd.Id + '"');
        Test.stopTest();
    }
    @isTest
    static void testDeleteEntertainmentRecord() {
        EBD__c ebd = new EBD__c();
        insert ebd;
        List<Entertainment__c> enterList = new List<Entertainment__c>();
        for (Integer i = 0; i < 2; i++) {
            enterList.add(new Entertainment__c(
                EBD__c = ebd.Id
            ));
        }
        insert enterList;
        Test.startTest();
        EBDController.deleteEntertainmentRecord('"' + ebd.Id + '"');
        Test.stopTest();
    }
    @isTest
    static void testDeletePlanRecord() {
        EBD__c ebd = new EBD__c(
            X5_Savings_Plan__c = 'Plan 5',
            X10_Savings_Plan__c = 'Plan 10',
            X20_Savings_Plan__c = 'Plan 20',
            Additional_Comments__c = 'Test' 
            
        );
        insert ebd;
        
        Test.startTest();
        EBDController.deletePlanRecord('"' + ebd.Id + '"');
        Test.stopTest();
    }
    @isTest
    static void testDeleteAdditional() {
        EBD__c ebd = new EBD__c(
            Additional_Comments__c = 'Test');
        insert ebd;
        
        Test.startTest();
        EBDController.deleteAdditionalComments('"' + ebd.Id + '"');
        Test.stopTest();
    }
    @isTest
    static void testClearAll() {
        Account competitorAccount = new Account(Name='Aetna',Subtype__c ='Competitor',
                                                RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId());
        insert competitorAccount;
        EBD__c ebd = new EBD__c(X5_Savings_Plan__c = 'Plan 5',
                                X10_Savings_Plan__c = 'Plan 10',
                                X20_Savings_Plan__c = 'Plan 20',
                                Additional_Comments__c = 'Test',
                                Company__c = competitorAccount.Id);
        insert ebd;
        Competitor__c comp = new Competitor__c(
            Name = 'Test Competitor',
            Account__c = competitorAccount.Id,
            Competitorclassification__c = 'Other',
            Inactive_Competitor_Status__c = false
        );
        insert comp;
        
        // Insert Financial (must match query conditions)
        Integer currentYear = Date.today().year();
        Financial__c fin = new Financial__c(
            Company__c = competitorAccount.Id,
            Membership_Type__c = 'Medical',
            Year__c = Date.newInstance(currentYear, 1, 1),
            Revenue__c = 100,
            Revenue_URS__c = 200,
            Revenue_Total_UHG__c = 300,
            Financial_Type__c = 'Total',
            Last_Updated__c = Date.newInstance(currentYear, 1, 1)
        );
        insert fin;
        Entertainment__c entertainment = new Entertainment__c(Name='Test Ent', EBD__c=ebd.Id);
        Client_Priority__c priority = new Client_Priority__c(Name='Test Pri', EBD__c=ebd.Id);
        B2B__c b2b = new B2B__c(Name='Test B2B', EBD__c=ebd.Id);
        Advocacy__c advocacy = new Advocacy__c(Name='Test Adv', EBD__c=ebd.Id);
        EBD_NPS__c nps = new EBD_NPS__c(Name='Test NPS', EBD__c=ebd.Id);
        Anticipated_Bid_Cycle_For_Major_Products__c bidCycle = new Anticipated_Bid_Cycle_For_Major_Products__c(Name='Test Bid', EBD__c=ebd.Id);
        insert new List<SObject>{ entertainment, priority, b2b, advocacy, nps, bidCycle };
            Test.startTest();
        EBDController.clearAllDataOnEbdData('"' + ebd.Id + '"');
        Test.stopTest();
    }
    @isTest
    static void testGetFinancialsData() {
        Account testAccount = new Account();
        testAccount.Name = 'Equity Healthcare';
        testAccount.Subtype__c ='National Accounts - East';
        testAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert testAccount;
        
        List<Financial__c> financialRecords = new List<Financial__c>();
        Integer currentYear = Date.today().year();
        List<Integer> yearList = new List<Integer>{currentYear - 2, currentYear - 1, currentYear};
            
            for (Integer year : yearList) {
                financialRecords.add(new Financial__c(
                    Company__c = testAccount.Id,
                    Year__c = Date.newInstance(year, 1, 1),
                    Membership__c = 1000,
                    Revenue__c = 50000,
                    Revenue_Total_UHG__c = 30000,
                    Revenue_URS__c = 20000,
                    Financial_Type__c = 'Total',
                    Membership_Type__c = 'Medical',
                    Last_Updated__c = Date.newInstance(year, 1, 1)
                ));
            }
        insert financialRecords;
        
        Test.startTest();
        Map<String, Map<String, Object>> result = EBDController.getfinancialsData(testAccount.Id);
        Test.stopTest();
        
        for (Integer year : yearList) {
            String yearStr = String.valueOf(year);
            Map<String, Object> yearData = result.get(yearStr);
            
        }
    }
    @isTest
    static void testEBDControllerProps() {
        Account acc = new Account(Name = 'Test Account',Subtype__c='National Accounts - East');
        insert acc;
        
        EBD__c ebd = new EBD__c( Company__c = acc.Id);
        insert ebd;
        Test.startTest();
        Test.setCurrentPage(Page.EBDWordDocVfPage);
        ApexPages.currentPage().getParameters().put('id', acc.Id);
        EBDController controller = new EBDController();
        controller.year1 = '2025';
        controller.year2 = '2024';
        controller.year3 = '2023';
        controller.year4 = '2022';
        
        controller.lastFourYears = new List<String>{'2025', '2024', '2023', '2022'};
            
            controller.finyear1 = '2023';
        controller.finyear2 = '2024';
        controller.finyear3 = '2025';
        controller.totalRevenue1 = 100000;
        controller.totalRevenue1 = 100000;
        controller.totalRevenue1 = 100000;
        controller.totalRevenue2 = 90000;
        controller.totalRevenue3 = 85000;
        controller.totalMembership1  =2300;
        controller.totalMembership2 =2345;
        controller.totalMembership3 = 3455;
        controller.totalURS1 = 123;
        controller.totalURS2 = 123;
        controller.totalURS3 = 123;
        controller.totalUHG1 = 123;
        controller.totalUHG2 = 123;
        controller.totalUHG3 = 123;
        controller.surestRevenue1 = 123;
        controller.surestRevenue2 = 123;
        controller.surestRevenue3 = 123;
        controller.surestTotal1 = 123;
        controller.surestTotal2 = 123;
        controller.surestTotal3 = 123;
        
        controller.financialMapData = new Map<String, Map<String, String>>();
        controller.financialMapData.put('2025', new Map<String, String>{'Revenue' => '100000'});
        
        controller.csrList = new List<List<String>>{
            new List<String>{'CSR1', 'Value1'},
                new List<String>{'CSR2', 'Value2'}
        };
            Test.stopTest();
        
        
    }
    @isTest
    static void testUpdateSCEValidationInfo() {
        // --- Create Account for test ---
        Account acc = new Account(Name='Aetna',Subtype__c ='Competitor',
                                  RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId());
        
        insert acc;
        // --- Call method under test ---
        Test.startTest();
        EBDController.updateSCEValidationInfo(acc.Id);
        Test.stopTest();
        
        // --- Verify updates ---
        acc = [SELECT EBD_Sce_Validation__c, EBD_Sce_Validated_Time__c FROM Account WHERE Id = :acc.Id];
        System.assertNotEquals(null, acc.EBD_Sce_Validation__c, 'EBD_Sce_Validation__c should be set to current user');
        System.assertNotEquals(null, acc.EBD_Sce_Validated_Time__c, 'EBD_Sce_Validated_Time__c should be set');
    }
    
    @isTest
    static void test_updateSCEValidationInfo() {
        Test.startTest();
        User u = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        
        Account acc = new Account(Name = 'Test Account',Subtype__c='National Accounts - East');
        insert acc;
        
        Test.setCurrentPage(Page.EBDWordDocVfPage);
        ApexPages.currentPage().getParameters().put('id', acc.Id);
        
        Blob body = Blob.valueOf('Some Text');
        ContentVersion cv = new ContentVersion();
        cv.Title = 'EBD-Test Account-' + String.valueOf(Date.today().year());
        cv.PathOnClient = '/test.doc';
        cv.VersionData = body;
        cv.Origin = 'H';
        cv.ContentLocation = 'S';
        insert cv;
        ContentVersion insertedCV = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id];
        ContentDocumentLink cdl = new ContentDocumentLink(
            ContentDocumentId = insertedCV.ContentDocumentId,
            LinkedEntityId = acc.Id,
            ShareType = 'V',
            Visibility = 'AllUsers'
        );
        insert cdl;
        // EBDController.updateSCEValidationInfo(acc.Id);
        Test.stopTest();
    }
    
    
    
}