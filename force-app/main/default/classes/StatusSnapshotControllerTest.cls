@isTest
private class StatusSnapshotControllerTest {
    
    @TestSetup
    static void createTestData(){
        
        List<user> testUserRecords = new List<user>();
        Map<String, Id> roleMap = new Map<String, Id>();
        
        for (UserRole ur : [select Id, Name from UserRole where name in ('CM SCE', 'CD SVP', 'Specialty Benefits SVP', 'CM VPCR/RVP', 'Specialty Benefits SCE')]) {
            roleMap.put(ur.Name, ur.Id);
        }
        
        for (Profile testProfile : [select Id, Name from Profile where name in ('CM Sales Team Standard Profile', 'CD Sales Team Standard Profile')] ) {
            if (testProfile.name == 'CM Sales Team Standard Profile') {
                testUserRecords.add(new user(LastName = 'Test3r',FirstName='CM SCE', Alias = 'tUs3', Email = 'tester.uhgCMSCE@crmit.com', Username = 'uhgCMSCETest3r@crmit.com',
                                             ProfileId = testProfile.id, UserRoleId =  roleMap.get('CM SCE'), TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                             EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
                
                testUserRecords.add(new user(LastName = 'Test3r',FirstName='Specialty Benefits SVP', Alias = 'tUs3', Email = 'tester.uhgSpecialty@crmit.com', Username = 'uhgSpecialtyTest3r@crmit.com',
                                             ProfileId = testProfile.id, UserRoleId =  roleMap.get('Specialty Benefits SVP'), TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                             EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
                
                testUserRecords.add(new user(LastName = 'Test3r',FirstName='CM VPCR/RVP', Alias = 'tUs3', Email = 'tester.uhgVPCR@crmit.com', Username = 'uhgVPCTest3rR@crmit.com',
                                             ProfileId = testProfile.id, UserRoleId =  roleMap.get('CM VPCR/RVP'), TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                             EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User',VPCR__c=false));
                
                testUserRecords.add(new user(LastName = 'Test3r',FirstName='CM VPCR/RVP', Alias = 'tUs3', Email = 'vpcrtstusr@crmit.com', Username = 'vpcrtstusr@crmit.com',
                                             ProfileId = testProfile.id, UserRoleId =  roleMap.get('CM VPCR/RVP'), TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                             EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User',VPCR__c=true));
                
                testUserRecords.add(new user(LastName = 'Test3r',FirstName='Specialty Benefits SCE', Alias = 'tUs3', Email = 'tester.uhgSBSCE@crmit.com', Username = 'uhgSBSCETest3r@crmit.com',
                                             ProfileId = testProfile.id, UserRoleId =  roleMap.get('Specialty Benefits SCE'), TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                             EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
            } 
            if (testProfile.name == 'CD Sales Team Standard Profile') {
                testUserRecords.add(new user(LastName = 'Test3r',FirstName='CD SVP', Alias = 'tUs3', Email = 'tester.uhgCDSVP@crmit.com', Username = 'uhgCDSVPTest3r@crmit.com',
                                             ProfileId = testProfile.id, UserRoleId =  roleMap.get('CD SVP'), TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                             EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
                
            }
        }
        
        User thisUser = [ select Id from User where Id = :UserInfo.getUserId() ];
        System.runAs ( thisUser ) {
            insert testUserRecords;
        }
        system.debug('Insert of test users Success');
        
        User specialtyUser = [Select Id from User where Username = 'uhgspecialtytest3r@crmit.com' LIMIT 1]; 
        System.debug('specialty : ' + specialtyUser);
        
        //QueryOppLineItemsTest.createData();
        Map<String, Id> userMap = new Map<string, Id> ();
        for (User ur : [Select Id, Username from User where LastName='Test3r']) {
            userMap.put(ur.Username, ur.Id);
        }        
        System.debug('UserMap ***** ' + userMap);
        /* Creating Account */
        List<Account> acc = new List<Account>();
        Account a = new Account(
            Name = 'Test Account NBEA',
            Subtype__c ='CVG',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(),
            OwnerID = userMap.get('uhgCMSCETest3r@crmit.com'.toLowerCase()),
            CMVPCRRVP__c = userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase())
        );
        acc.add(a);
        
        a = new Account(
            Name = 'Test Account NB',
            Subtype__c ='Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId(),
            CMVPCRRVP__c = userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase())
        );
        acc.add(a);
        
        acc.add(new Account(Name = 'Proactive Renewal Test Account',Subtype__c ='CVG',
                                        RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(),
                                        CMVPCRRVP__c=userMap.get('vpcrtstusr@crmit.com')
                                       ));
        acc.add(new Account(Name = 'Test Account NB', Subtype__c ='Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId(),
            CMVPCRRVP__c = userMap.get('uhgCMSCETest3r@crmit.com'.toLowerCase()) ));
        acc.add(new Account(Name = 'Proactive Renewal Test Account',Subtype__c ='CVG',
                                        RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(),
                                        CMVPCRRVP__c=userMap.get('uhgCMSCETest3r@crmit.com')
                                       ));
        
        acc.add(new Account(Name = 'SBSCE Test Account',Subtype__c ='CVG',
                                        RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(),
                                        Specialty_SCE_Involved__c=userMap.get('uhgSBSCETest3r@crmit.com'),
                            			CMVPCRRVP__c=userMap.get('vpcrtstusr@crmit.com')
                                       ));
        
        system.debug('acc data '+acc);
        insert acc;
        system.debug('Creation of Account  Success');
        
        
        /*
* The below method Inserts data into Pricebook2, Product2, Opportunity and OpportunityLineItem Records in SF
*/
        
        PriceBook2 book2 = new PriceBook2();
        book2.Name = 'Test book2';
        insert book2;
        
        List<Product2> prod = new List<Product2>();
        
        Product2 prod1 = new Product2(
            Name = 'Test Prod4',
            Product_Line__c='Other',
            IsActive = true,
            Family ='Specialty Products'
        );
        prod.add(prod1);
        insert prod;
        
        PricebookEntry pbe1 = new PricebookEntry(Pricebook2Id = book2.Id, Product2Id = prod[0].Id, UnitPrice = 1000, IsActive = true);
        pbe1.Pricebook2Id = Test.getStandardPricebookId();
        insert pbe1;
        
        system.debug('Creation of Product2  Success');
        List<Opportunity> OpportunityData = new List<Opportunity>();
        
        Opportunity opp1 =  new Opportunity(
            AccountId = acc[0].Id,
            Name = 'Test VPCR',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            OwnerId = userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase()),
            CM_VPCR_RVP__c = userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase())
        );
        OpportunityData.add(opp1);
        
        //------------------------------------------------//
        opp1 =  new Opportunity(
            AccountId = acc[5].Id,
            Name = 'Test VPCR',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            OwnerId = userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase()),
            CM_VPCR_RVP__c = userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase())
        );
        OpportunityData.add(opp1);
        
          /*opp1 =  new Opportunity(
            AccountId = acc[6].Id,
            Name = 'Test VPCR',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            OwnerId = userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase())
        );
        OpportunityData.add(opp1);*/
        //------------------------------------------------//
        
        opp1 =  new Opportunity(
            AccountId = acc[0].Id,
            Name = 'Test SCE',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            OwnerId = userMap.get('uhgCMSCETest3r@crmit.com'.toLowerCase())
        );
        OpportunityData.add(opp1);
        
        opp1 =  new Opportunity(
            AccountId = acc[1].Id,
            Name = 'Test SVP',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            OwnerId = userMap.get('uhgCDSVPTest3r@crmit.com'.toLowerCase())
        );
        OpportunityData.add(opp1);
        
        opp1 =  new Opportunity(
            AccountId = acc[0].Id,
            Name = 'Test Specialty',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            OwnerId = userMap.get('uhgSpecialtyTest3r@crmit.com'.toLowerCase())
        );
        OpportunityData.add(opp1);
        
        
        OpportunityData.add(new Opportunity( AccountId = acc[2].Id,
                                            Name = 'Proactive Renewal Test Opportunity',
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
                                            Disposition_Pharmacy__c='Sold',Disposition_Medical__c='Sold',Disposition_Dental__c='Sold',CM_VPCR_RVP__c=userMap.get('vpcrtstusr@crmit.com')                              
                                           ));//Proactive_Renewal_Incentive_Status__c='SS 2021 (First Year) - Qualifies - Fully Validated'
        
        OpportunityData.add(new Opportunity( AccountId = acc[2].Id,
                                            Name = 'Proactive Renewal Test Opportunity-1',
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
                                            Disposition_Pharmacy__c='Sold',Disposition_Medical__c='Sold',Disposition_Dental__c='Sold',CM_VPCR_RVP__c=userMap.get('vpcrtstusr@crmit.com')                             
                                           )); //Proactive_Renewal_Incentive_Status__c='SS 2022 - Pending Qualification' 
        
        insert OpportunityData;
        
        List<OpportunityLineItem> OpportunityLineItemList = new List<OpportunityLineItem>();
        OpportunityLineItem oppItem1 = null;
        for (Integer i=0; i<3; i++) {
            oppItem1 = new OpportunityLineItem(
                OpportunityId = OpportunityData[i].Id, 
                PricebookEntryId = pbe1.Id,
                Net_Results__c = 20,
                Quantity = 100,
                UnitPrice = 12,
                Eligible_for_Sales_Incentives__c = 'Yes',
                Disposition_Other_Buy_Up_Programs__c = 'Sold',
                Submit_for_sales_incentives__c = false
            );
            OpportunityLineItemList.add(oppItem1);
        }
        
        oppItem1 = new OpportunityLineItem(
            OpportunityId = OpportunityData[3].Id, 
            PricebookEntryId = pbe1.Id,
            Net_Results__c = 20,
            Quantity = 100,
            UnitPrice = 12,
            Eligible_for_Sales_Incentives__c = 'Yes',
            Disposition_Other_Buy_Up_Programs__c = 'Sold',
            Submit_for_sales_incentives__c=true,
            Will_Sales_Incentive_be_split__c='No',
            Sales_Person_1__c=userMap.get('uhgSpecialtyTest3r@crmit.com'.toLowerCase()),
            Sales_Person_1_split_percentage__c=100
        ); 
        OpportunityLineItemList.add(oppItem1);
        
        oppItem1 = new OpportunityLineItem(
            OpportunityId = OpportunityData[1].Id, 
            PricebookEntryId = pbe1.Id,
            Net_Results__c = 20,
            Quantity = 100,
            UnitPrice = 12,
            Eligible_for_Sales_Incentives__c = 'Yes',
            Disposition_Other_Buy_Up_Programs__c = 'Sold',
            Submit_for_sales_incentives__c=true,
            Will_Sales_Incentive_be_split__c='No',
            Sales_Person_1__c=userMap.get('uhgCMSCETest3r@crmit.com'.toLowerCase()),
            Sales_Person_1_split_percentage__c=100
        ); 
        OpportunityLineItemList.add(oppItem1);  
        
        insert OpportunityLineItemList;        
        system.debug('Insert of Opp Line Items test users success');
        
        //Retention DATA Setup
        Renewal_Status__c createNewRenewalStatus=new Renewal_Status__c();
        createNewRenewalStatus.Company__c=acc[0].Id;
        createNewRenewalStatus.Name='TestRenewal';
        createNewRenewalStatus.Efective_Date__c=System.today().addDays(-1);
        createNewRenewalStatus.isRenewalStatusRecord__c=true;
        createNewRenewalStatus.Date_sent_to_ISI_Site__c=System.now();
        createNewRenewalStatus.Sales_Cycle__c='IY19, 1/1/20';
        createNewRenewalStatus.Date_Submitted_For_Incentives__c=System.now();
        createNewRenewalStatus.Sales_person_1__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
        createNewRenewalStatus.Sales_Person_1_split_percentage__c=50;
        createNewRenewalStatus.Sales_Person_2__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
        createNewRenewalStatus.Sales_Person_2_Split_percentage__c=50;
        createNewRenewalStatus.Will_sales_incentives_be_split__c='Yes';
        createNewRenewalStatus.Eligible_for_Sales_Incentives__c='Yes';
        createNewRenewalStatus.VPCR_RVP__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
        createNewRenewalStatus.Product_Line__c='Dental';
        createNewRenewalStatus.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';
        createNewRenewalStatus.Product_Confirmed__c='APP';
        insert createNewRenewalStatus;
        System.debug('Successfully inserted--renewals');
        
        Renewal_Status__c createNewRenewalStatus1=new Renewal_Status__c();
        createNewRenewalStatus1.Company__c=acc[1].Id;
        createNewRenewalStatus1.Name='TestRenewal';
        createNewRenewalStatus1.Efective_Date__c=System.today();
        createNewRenewalStatus1.isRenewalStatusRecord__c=true;
        // createNewRenewalStatus1.Date_sent_to_ISI_Site__c=System.now();
        createNewRenewalStatus1.Sales_Cycle__c='IY19, 1/1/20';
        // createNewRenewalStatus1.Date_Submitted_For_Incentives__c=System.now();
        createNewRenewalStatus1.Sales_person_1__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
        createNewRenewalStatus1.Sales_Person_1_split_percentage__c=50;
        createNewRenewalStatus1.Sales_Person_2__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
        createNewRenewalStatus1.VPCR_RVP__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
        createNewRenewalStatus1.Sales_Person_2_Split_percentage__c=50;            
        createNewRenewalStatus1.Will_sales_incentives_be_split__c='Yes';
        createNewRenewalStatus1.Eligible_for_Sales_Incentives__c='Yes';
        createNewRenewalStatus1.Product_Line__c='Dental';
        // createNewRenewalStatus1.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';
        createNewRenewalStatus1.Product_Confirmed__c='APP';
        insert createNewRenewalStatus1;
        
        Renewal_Status__c createNewRenewalStatus2=new Renewal_Status__c();
        createNewRenewalStatus2.Company__c=acc[1].Id;
        createNewRenewalStatus2.Name='TestRenewal';
        createNewRenewalStatus2.Efective_Date__c=System.today();
        createNewRenewalStatus2.isRenewalStatusRecord__c=true;
        // createNewRenewalStatus2.Date_sent_to_ISI_Site__c=System.now();
        createNewRenewalStatus2.Sales_Cycle__c='IY19, 1/1/20';
        // createNewRenewalStatus2.Date_Submitted_For_Incentives__c=System.now();
        createNewRenewalStatus2.Sales_person_1__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
        createNewRenewalStatus2.Sales_Person_1_split_percentage__c=50;
        createNewRenewalStatus2.Sales_Person_2__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
        createNewRenewalStatus2.VPCR_RVP__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
        createNewRenewalStatus2.Sales_Person_2_Split_percentage__c=50;            
        createNewRenewalStatus2.Will_sales_incentives_be_split__c='Yes';
        createNewRenewalStatus2.Eligible_for_Sales_Incentives__c='Yes';
        createNewRenewalStatus2.Product_Line__c='Dental';
        // createNewRenewalStatus1.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';
        createNewRenewalStatus1.Product_Confirmed__c='APP';
        insert createNewRenewalStatus2;
        
        Renewal_Status__c createNewRenewalStatus3=new Renewal_Status__c();
        createNewRenewalStatus3.Company__c=acc[5].Id;
        createNewRenewalStatus3.Name='TestRenewal';
        createNewRenewalStatus3.Efective_Date__c=System.today().addDays(-1);
        createNewRenewalStatus3.isRenewalStatusRecord__c=true;
        createNewRenewalStatus3.Date_sent_to_ISI_Site__c=System.now();
        createNewRenewalStatus3.Sales_Cycle__c='IY19, 1/1/20';
        createNewRenewalStatus3.Date_Submitted_For_Incentives__c=System.now();
        createNewRenewalStatus3.Sales_person_1__c=userMap.get('uhgSBSCETest3r@crmit.com'.toLowerCase());
        createNewRenewalStatus3.Sales_Person_1_split_percentage__c=50;
        createNewRenewalStatus3.Sales_Person_2__c=userMap.get('uhgSBSCETest3r@crmit.com'.toLowerCase());
        createNewRenewalStatus3.Sales_Person_2_Split_percentage__c=50;
        createNewRenewalStatus3.Will_sales_incentives_be_split__c='Yes';
        createNewRenewalStatus3.Eligible_for_Sales_Incentives__c='Yes';
        createNewRenewalStatus3.VPCR_RVP__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
        createNewRenewalStatus3.Product_Line__c='Dental';
        createNewRenewalStatus3.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';
        createNewRenewalStatus3.Product_Confirmed__c='APP';
        insert createNewRenewalStatus3;
        System.debug('Successfully inserted--renewals');
        
        
        List<String> prdctLineLst=new List<String>();
        prdctLineLst.add('Dental');
        prdctLineLst.add('Financial Accounts');
        prdctLineLst.add('Financial Protection');
        prdctLineLst.add('Group Retiree (URS)');
        prdctLineLst.add('Medical');
        prdctLineLst.add('Pharmacy');
        prdctLineLst.add('Stop Loss');
        prdctLineLst.add('Vision');
        
        
        
        List<Renewal_Status__c> rnwlStatusLst =new List<Renewal_Status__c>();
        
        for(String eachPrdctLine:prdctLineLst){
            Renewal_Status__c rnwlStatus=new Renewal_Status__c();
            rnwlStatus.Name=eachPrdctLine;
            rnwlStatus.Product_Line__c=eachPrdctLine;
            rnwlStatus.isRenewalStatusRecord__c=true;
            rnwlStatus.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';            
            rnwlStatus.Sales_Cycle__c='IY19, 1/1/20';
            if(eachPrdctLine=='Medical' || eachPrdctLine=='Financial Protection'){
                rnwlStatus.Eligible_for_Sales_Incentives__c='No'; 
            }
            else{
                rnwlStatus.Eligible_for_Sales_Incentives__c='Yes'; 
            }
            rnwlStatus.Company__c=acc[0].Id;
            rnwlStatus.Efective_Date__c=system.today();
            rnwlStatus.Submit_For_Sales_Incentives__c=false;
            rnwlStatusLst.add(rnwlStatus);
        }
        //for VPCR 
        for(String eachPrdctLine:prdctLineLst){
            Renewal_Status__c rnwlStatus=new Renewal_Status__c();
            rnwlStatus.Name=eachPrdctLine;
            rnwlStatus.Product_Line__c=eachPrdctLine;
            rnwlStatus.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';            
            rnwlStatus.isRenewalStatusRecord__c=true;
            rnwlStatus.Sales_Cycle__c='IY19, 1/1/20';
            if(eachPrdctLine=='Medical' || eachPrdctLine=='Financial Protection'){
                rnwlStatus.Eligible_for_Sales_Incentives__c='No'; 
            }
            else{
                rnwlStatus.Eligible_for_Sales_Incentives__c='Yes'; 
            }
            rnwlStatus.Company__c=acc[1].Id;
            rnwlStatus.Efective_Date__c=system.today();
            rnwlStatus.Submit_For_Sales_Incentives__c=true;
            rnwlStatus.Sales_person_1__c=userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
            rnwlStatus.Sales_Person_1_split_percentage__c=100;
            rnwlStatus.Date_Submitted_For_Incentives__c=System.now();
            rnwlStatus.VPCR_RVP__c = userMap.get('uhgVPCTest3rR@crmit.com'.toLowerCase());
            rnwlStatusLst.add(rnwlStatus);
        }
        insert rnwlStatusLst;
        
        
        
    }
    
    @IsTest
    static void getTemplate() {
        string role = '';
        StatusSnapshotController.ExportWrapper ew = null;
        
        Test.startTest();
        role = 'CM SCE';
        ew = StatusSnapshotController.getTemplateForExport(role);
        System.assert(ew.objectItags.size() != 0 );
        
        role = 'CD SVP';
        ew = StatusSnapshotController.getTemplateForExport(role);
        System.assert(ew.objectItags.size() != 0 );
        
        role = 'Specialty Benefits SVP';
        ew = StatusSnapshotController.getTemplateForExport(role);
        System.assert(ew.objectItags.size() != 0 );
        
        role = 'CM VPCR/RVP';
        ew = StatusSnapshotController.getTemplateForExport(role);
        System.assert(ew.objectItags.size() != 0 );

        role = 'Specialty Benefits SCE';
        ew = StatusSnapshotController.getTemplateForExport(role);
        System.assert(ew.objectItags.size() != 0 );
        
        /*role = 'CRM Administrator';
ew = StatusSnapshotController.getTemplateForExport(role);
System.assert(ew.objectItags.size() == 0 );*/
        Test.stopTest();
    }
    
    @isTest 
    static void getSnapshotDataForSCETest() {
        Test.startTest();
        User sceUser = [Select Id from User where Username = 'uhgCMSCETest3r@crmit.com' LIMIT 1]; 
        System.runAs(sceUser) {
            StatusSnapshotController.getStatusSnapshotData('');
            StatusSnapshotController.getStatusSnapshotData('IY19, 1/1/20');
            StatusSnapshotController.getStatusSnapshotData('IY20, 1/1/21');
            StatusSnapshotController.getStatusSnapshotData('IY21, 1/1/22');
            //System.assert(ssd.size() == 0 );
        }
        Test.stopTest();
    }
    
    @isTest 
    static void getSnapshotDataForSBSCETest() {
        Test.startTest();
        User sbsceUser = [Select Id from User where Username = 'uhgSBSCETest3r@crmit.com' LIMIT 1]; 
        System.runAs(sbsceUser) {
            StatusSnapshotController.getStatusSnapshotData('');
            StatusSnapshotController.getStatusSnapshotData('IY19, 1/1/20');
            StatusSnapshotController.getStatusSnapshotData('IY20, 1/1/21');
            StatusSnapshotController.getStatusSnapshotData('IY21, 1/1/22');
        }
        Test.stopTest();
    } 
    
    @isTest 
    static void getSnapshotDataForSBSCETest2() {
        Test.startTest();
        User sbsceUser = [Select Id from User where Username = 'uhgSBSCETest3r@crmit.com' LIMIT 1]; 
        
        System.runAs(sbsceUser) {
            
            Account acc = new Account(Name = 'SBSCE Test Account2',Subtype__c ='CVG',
                                        RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()
                                       );
            insert acc;
			Account accList = [Select Id from Account where Name = 'SBSCE Test Account2' LIMIT 1]; 
            
        Renewal_Status__c createNewRenewalStatus4=new Renewal_Status__c();
        createNewRenewalStatus4.Company__c=accList.Id;
        createNewRenewalStatus4.Name='TestRenewal';
        createNewRenewalStatus4.Efective_Date__c=System.today().addDays(-1);
        createNewRenewalStatus4.isRenewalStatusRecord__c=true;
        createNewRenewalStatus4.Date_sent_to_ISI_Site__c=System.now();
        createNewRenewalStatus4.Sales_Cycle__c='IY19, 1/1/20';
        createNewRenewalStatus4.Date_Submitted_For_Incentives__c=System.now();
        createNewRenewalStatus4.Sales_person_1__c=sbsceUser.Id;
        createNewRenewalStatus4.Sales_Person_1_split_percentage__c=50;
        createNewRenewalStatus4.Sales_Person_2__c=sbsceUser.Id;
        createNewRenewalStatus4.Sales_Person_2_Split_percentage__c=50;
        createNewRenewalStatus4.Will_sales_incentives_be_split__c='Yes';
        createNewRenewalStatus4.Eligible_for_Sales_Incentives__c='Yes';
        createNewRenewalStatus4.VPCR_RVP__c=sbsceUser.Id;
        createNewRenewalStatus4.Product_Line__c='Dental';
        createNewRenewalStatus4.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';
        createNewRenewalStatus4.Product_Confirmed__c='APP';
        createNewRenewalStatus4.Submit_For_Sales_Incentives__c = false;
        insert createNewRenewalStatus4;
            
            
            StatusSnapshotController.getStatusSnapshotData('');
            StatusSnapshotController.getStatusSnapshotData('IY19, 1/1/20');
            StatusSnapshotController.getStatusSnapshotData('IY20, 1/1/21');
            StatusSnapshotController.getStatusSnapshotData('IY21, 1/1/22');
        }
        Test.stopTest();
    } 
    
    @isTest 
    static void getSnapshotDataForSVPTest() {
        Test.startTest();
        User svpUser = [Select Id from User where Username = 'uhgCDSVPTest3r@crmit.com' LIMIT 1]; 
        System.runAs(svpUser) {
            StatusSnapshotController.getStatusSnapshotData('IY19, 1/1/20');
            //System.assert(ssd.size() == 0 );
        }
        Test.stopTest();
    }  
    
    @isTest 
    static void getSnapshotDataForSpecialtyTest() {
        Test.startTest();
        User specialtyUser = [Select Id from User where Username = 'uhgspecialtytest3r@crmit.com' LIMIT 1]; 
        System.runAs(specialtyUser) {
            StatusSnapshotController.getStatusSnapshotData('IY19, 1/1/20');
            //System.assert(ssd.size() == 0 );
        }
        Test.stopTest();
    }  
    
    @isTest 
    static void getSnapshotDataForVPCRTest() {
        Test.startTest();
        User vpcrUser = [Select Id from User where Username = 'uhgVPCTest3rR@crmit.com' LIMIT 1]; 
        System.runAs(vpcrUser) {
            StatusSnapshotController.getStatusSnapshotData('IY19, 1/1/20');
            //System.assert(ssd.size() == 0 );
        }
        Test.stopTest();
    }     
     /*@isTest 
    static void getSnapshotDataForVPCRTest2() {
        Test.startTest();
        User vpcrUser = [Select Id from User where Username = 'uhgCMSCETest3r@crmit.com' LIMIT 1]; 
        System.runAs(vpcrUser) {
            StatusSnapshotController.getStatusSnapshotData('IY19, 1/1/20');
            //System.assert(ssd.size() == 0 );
        }
        Test.stopTest();
    }*/   
    @isTest
    static void innerClassTest() {
        Test.startTest();
        StatusSnapshotController.GrowthSent gs = new StatusSnapshotController.GrowthSent();
        StatusSnapshotController.GrowthNotSent gns = new StatusSnapshotController.GrowthNotSent();
        StatusSnapshotController.RetentionNotSent rns = new StatusSnapshotController.RetentionNotSent();
        StatusSnapshotController.RetentionSent rs = new StatusSnapshotController.RetentionSent();
        StatusSnapshotController.vpcrSnapshot vpcr = new StatusSnapshotController.vpcrSnapshot();
        StatusSnapshotController.ExportWrapper ew = new StatusSnapshotController.ExportWrapper();
        ew.loggedInUserName = 'Test User';
        ew.salesSeason = 'Test Season';
        Test.stopTest();
    }  
    
    @isTest 
    static void testGetSnapshotDataForProactiveRenewal() {
        Test.startTest();
        User vpcrUser = [Select Id from User where Username = 'vpcrtstusr@crmit.com' LIMIT 1]; 
        System.runAs(vpcrUser) {
            
            //System.assertEquals(1,StatusSnapshotController.getStatusSnapshotData('IY21, 1/1/22').vpcrProactiveRenewalData.size());
            
        }
        Test.stopTest();
    } 
    
    @IsTest
    static void testProactiveRenewalGetTemplateForExport() {
        string role = 'CM VPCR/RVP';
        StatusSnapshotController.ExportWrapper ew = null;
        Test.startTest();
        
        User vpcrUser = [Select Id from User where Username = 'vpcrtstusr@crmit.com' LIMIT 1]; 
        System.runAs(vpcrUser) {
            
            ew = StatusSnapshotController.getTemplateForExport(role);
        	System.assert(ew.objectItags.size() != 0 );            
        }
        Test.stopTest();
        
    }
    
}