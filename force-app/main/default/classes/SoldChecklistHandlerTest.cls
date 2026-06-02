@isTest
public class SoldChecklistHandlerTest {
	
    @testSetup static void createTestData() {
        Id cmCSADUserRoleId = [select Id, Name from UserRole where name = 'CM CSAD' limit 1].id;
        Id genExecUserRoleId = [select Id, Name from UserRole where name = 'General Executive' limit 1].id;
        Id userIpmProfileId= [select Id, Name from Profile where name = 'IPM Standard Profile' limit 1].id;
        Id userCdProfileId= [select Id, Name from Profile where name = 'CD Sales Team Advanced Profile' limit 1].id;
        List<user> testUserRecords = new List<user>();
        testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@crmit.com', Username = 'uhgDevWithoutId1@crmit.com',
                                     ProfileId = userIpmProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmCSADUserRoleId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c = 'Test User'));
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs2', Email = 'test2.user2@crmit.com', Username = 'uhgDevWithoutId2@crmit.com',
                                     ProfileId = userCdProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = genExecUserRoleId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c = 'Test User'));
        insert testUserRecords;
        Account account = new Account();
        account.Name = 'Test CM Account1';
        account.Subtype__c ='Prospect';
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        
        Account account2 = new Account();
        account2.Name = 'Equity Healthcare';
        account2.Subtype__c ='Collaborative Ventures Group (CVG)';
        account2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        
        System.runAs ( testUserRecords[0] ) {
            insert account;
            insert account2;
        }
        //Insert Opportunity Record...
        List<Opportunity> oppRecords = new List<Opportunity>();
        Opportunity opp1 =  new Opportunity(
            AccountId = account.Id,
            Name = 'Test Opportunity insert Record',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Medical,Vision,Pharmacy,Dental,Vision,Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            Platforms_Sold__c = 'SUREST',
            Sales_Stage_Medical__c = 'Lead', Anticipated_Actual_Close_Date_Medical__c= Date.newInstance(2020, 5, 7), Closed_Reason_1_Medical__c= 'Network: Access',
            Sales_Stage_Dental__c = 'Lead', Anticipated_Actual_Close_Date_Dental__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Dental__c = 'Network: Access',
            Sales_Stage_Vision__c = 'Lead', Anticipated_Actual_Close_Date_Vision__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Vision__c= 'Network: Access',
            Sales_Stage_Pharmacy__c = 'Lead', Anticipated_Actual_Close_Date_Pharmacy__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Pharmacy__c= 'Network: Access',
            Sales_Stage_Other__c = 'Lead', Anticipated_Actual_Close_Date_Other__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Other_Buy_Up_Programs__c= 'Network: Access',
            Final_Plan_Proposed__c = 'A 4000'
        );
        oppRecords.add(opp1);
        
        Opportunity opp2 =  new Opportunity(
            AccountId = account.Id,
            Name = 'Test Opportunity insert Record 1',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Medical,Vision,Pharmacy,Dental,Vision,Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            Platforms_Sold__c = 'SUREST',
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            Sales_Stage_Medical__c = 'Notified', Disposition_Medical__c = 'Sold', Anticipated_Actual_Close_Date_Medical__c= Date.newInstance(2020, 5, 7), Closed_Reason_1_Medical__c= 'Network: Access',
            Sales_Stage_Dental__c = 'Notified', Disposition_Dental__c = 'Sold', Anticipated_Actual_Close_Date_Dental__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Dental__c = 'Network: Access',
            Sales_Stage_Vision__c = 'Notified', Disposition_Vision__c = 'Sold', Anticipated_Actual_Close_Date_Vision__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Vision__c= 'Network: Access',
            Sales_Stage_Pharmacy__c = 'Notified', Disposition_Pharmacy__c = 'Sold', Anticipated_Actual_Close_Date_Pharmacy__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Pharmacy__c= 'Network: Access',
            Sales_Stage_Other__c = 'Notified', Anticipated_Actual_Close_Date_Other__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Other_Buy_Up_Programs__c= 'Network: Access',
            Final_Plan_Proposed__c = 'A 4000'
        );
        oppRecords.add(opp2);
        
        Opportunity opp3 =  new Opportunity(
            AccountId = account.Id,
            Name = 'Test Opportunity insert Record 3',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Medical,Vision,Pharmacy,Dental,Vision,Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            Platforms_Sold__c = 'SUREST',
            Sales_Stage_Medical__c = 'Notified', Disposition_Medical__c = 'Sold', Anticipated_Actual_Close_Date_Medical__c= Date.newInstance(2020, 5, 7), Closed_Reason_1_Medical__c= 'Network: Access',
            Sales_Stage_Dental__c = 'Notified', Disposition_Dental__c = 'Sold', Anticipated_Actual_Close_Date_Dental__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Dental__c = 'Network: Access',
            Sales_Stage_Vision__c = 'Notified', Disposition_Vision__c = 'Sold', Anticipated_Actual_Close_Date_Vision__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Vision__c= 'Network: Access',
            Sales_Stage_Pharmacy__c = 'Notified', Disposition_Pharmacy__c = 'Sold', Anticipated_Actual_Close_Date_Pharmacy__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Pharmacy__c= 'Network: Access',
            Sales_Stage_Other__c = 'Notified', Anticipated_Actual_Close_Date_Other__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Other_Buy_Up_Programs__c= 'Network: Access',
            Final_Plan_Proposed__c = 'A 4000'
		);
        oppRecords.add(opp3);
        
        System.runAs ( testUserRecords[0] ) {
            insert oppRecords;
        }
        
        //Insertion of Products
        List<Product2> products = new List<Product2>();
        
        Product2 pharmacyProduct = new Product2(Name = 'Test Pharmacy', Product_Line__c='Pharmacy', IsActive = true);
        Product2 medicalProduct = new Product2(Name = 'Test Medical', Product_Line__c='Medical', IsActive = true);
        Product2 dentalProduct = new Product2(Name = 'Test Dental', Product_Line__c='Dental', IsActive = true);
        Product2 visionProduct = new Product2(Name = 'Test Vision', Product_Line__c='Vision', IsActive = true);
        Product2 otherProduct = new Product2(Name = 'Test Other', Product_Line__c='Other', IsActive = true,Surest_Implementation_Lead_Time__c='test');
        Product2 specialtProduct = new Product2(Name = 'Test Specialty', Product_Line__c='Other', IsActive = true, Family = 'Specialty Products',Surest_Implementation_Lead_Time__c='test');
        products.add(pharmacyProduct);
        products.add(medicalProduct);
        products.add(dentalProduct);
        products.add(visionProduct);
        products.add(otherProduct);
        products.add(specialtProduct);
        System.runAs ( testUserRecords[0] ) {
            insert products;
        }
    }
    
    static testMethod void validateFetchOppLineItemDetails() {
        Opportunity opp=[Select Id from Opportunity where Name='Test Opportunity insert Record'];
        Opportunity opp1=[Select Id from Opportunity where Name='Test Opportunity insert Record 1'];
        Opportunity opp3=[Select Id from Opportunity where Name='Test Opportunity insert Record 3'];
        Account acc = [SELECT Id, Name FROM Account WHERE Name='Test CM Account1'];  
        Product2 pharmacyProduct = [Select id from Product2 where name='Test Pharmacy'];
        Product2 medicalProduct = [Select id from Product2 where name='Test Medical'];
        Product2 dentalProduct = [Select id from Product2 where name='Test Dental'];
        Product2 visionProduct = [Select id from Product2 where name='Test Vision'];
        Product2 otherProduct = [Select id from Product2 where name='Test Other'];
        Product2 specialtyProduct = [Select id from Product2 where name='Test Specialty'];
 
        Sold_Case_Checklist__c scc1 = new Sold_Case_Checklist__c();
        scc1.Membership_Activity__c = opp.Id;
        scc1.Name = 'Test SCC';
        insert scc1;
        
        Sold_Case_Checklist__c scc2 = new Sold_Case_Checklist__c();
        scc2.Membership_Activity__c = opp1.Id;
        scc2.Name = 'Test SCC';
        insert scc2;
        
        Id pricebookId = Test.getStandardPricebookId();
        
        PricebookEntry pbEntry = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = pharmacyProduct.Id,
            UnitPrice = 100.00,
            IsActive = true
        );
        insert pbEntry;
        
        PricebookEntry pbEntryMed = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = medicalProduct.Id,
            UnitPrice = 100.00,
            IsActive = true
        );
        insert pbEntryMed;
        
        PricebookEntry pbEntryDen = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = dentalProduct.Id,
            UnitPrice = 100.00,
            IsActive = true
        );
        insert pbEntryDen;
        
         PricebookEntry pbEntryVis = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = visionProduct.Id,
            UnitPrice = 100.00,
            IsActive = true
        );
        insert pbEntryVis;
        
         PricebookEntry pbEntryOth = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = otherProduct.Id,
            UnitPrice = 100.00,
            IsActive = true
        );
        insert pbEntryOth;
        
         PricebookEntry pbEntrySpec = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = specialtyProduct.Id,
            UnitPrice = 100.00,
            IsActive = true
        );
        insert pbEntrySpec;
        
        List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp3.Id,
            Quantity = 5,
            PricebookEntryId = pbEntry.Id,
            TotalPrice = 500,
            MNRP__c = 'N/A',
            MNRP_DME__c = 'N/A',
            MNRP_Lab__c = 'N/A',
            MNRP_Default_of_Billed_Charges__c = 'N/A',
            Physician_R_C_OON__c = 'N/A',
            Facility_R_C__c = 'N/A',
            ENRP__c = 'N/A',
            ENRP_Default_of_Billed_Charge__c = 'N/A',
            Sales_Stage__c = 'Spin-Off',
            Buyup_Product_Selection__c='Surest & UNET'
        );
        oliList.add(oli);
        
        OpportunityLineItem oli2 = new OpportunityLineItem(
            OpportunityId = opp3.Id,
            Quantity = 6,
            PricebookEntryId = pbEntryMed.Id,
            TotalPrice = 600,
            MNRP__c = 'N/A',
            MNRP_DME__c = 'N/A',
            MNRP_Lab__c = 'N/A',
            MNRP_Default_of_Billed_Charges__c = 'N/A',
            Physician_R_C_OON__c = 'N/A',
            Facility_R_C__c = 'N/A',
            ENRP__c = 'N/A',
            ENRP_Default_of_Billed_Charge__c = 'N/A',
            Sales_Stage__c = 'Sold',
            Buyup_Product_Selection__c = 'UNET or UMR Only'
        );
        oliList.add(oli2);
        
        OpportunityLineItem oli3 = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Quantity = 6,
            PricebookEntryId = pbEntryMed.Id,
            TotalPrice = 600,
            MNRP__c = 'N/A',
            MNRP_DME__c = 'N/A',
            MNRP_Lab__c = 'N/A',
            MNRP_Default_of_Billed_Charges__c = 'N/A',
            Physician_R_C_OON__c = 'N/A',
            Facility_R_C__c = 'N/A',
            ENRP__c = 'N/A',
            ENRP_Default_of_Billed_Charge__c = 'N/A',
            Sales_Stage__c = 'Sold',
            Buyup_Product_Selection__c = 'UNET or UMR Only'
        );
        oliList.add(oli3);
        
        OpportunityLineItem oli4 = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Quantity = 5,
            PricebookEntryId = pbEntryDen.Id,
            TotalPrice = 500,
            MNRP__c = 'N/A',
            MNRP_DME__c = 'N/A',
            MNRP_Lab__c = 'N/A',
            MNRP_Default_of_Billed_Charges__c = 'N/A',
            Physician_R_C_OON__c = 'N/A',
            Facility_R_C__c = 'N/A',
            ENRP__c = 'N/A',
            ENRP_Default_of_Billed_Charge__c = 'N/A',
            Sales_Stage__c = 'Spin-Off',
            Buyup_Product_Selection__c='Surest Only'
        );
        oliList.add(oli4);
        
        OpportunityLineItem oli5 = new OpportunityLineItem(
            OpportunityId = opp1.Id,
            Quantity = 5,
            PricebookEntryId = pbEntryVis.Id,
            TotalPrice = 500,
            MNRP__c = 'N/A',
            MNRP_DME__c = 'N/A',
            MNRP_Lab__c = 'N/A',
            MNRP_Default_of_Billed_Charges__c = 'N/A',
            Physician_R_C_OON__c = 'N/A',
            Facility_R_C__c = 'N/A',
            ENRP__c = 'N/A',
            ENRP_Default_of_Billed_Charge__c = 'N/A',
            Sales_Stage__c = 'Spin-Off',
            Buyup_Product_Selection__c='Surest & UNET'
        );
        oliList.add(oli5);
        
        OpportunityLineItem oli6 = new OpportunityLineItem(
            OpportunityId = opp1.Id,
            Quantity = 5,
            PricebookEntryId = pbEntryOth.Id,
            TotalPrice = 500,
            MNRP__c = 'N/A',
            MNRP_DME__c = 'N/A',
            MNRP_Lab__c = 'N/A',
            MNRP_Default_of_Billed_Charges__c = 'N/A',
            Physician_R_C_OON__c = 'N/A',
            Facility_R_C__c = 'N/A',
            ENRP__c = 'N/A',
            ENRP_Default_of_Billed_Charge__c = 'N/A',
            Sales_Stage__c = 'Spin-Off',
            Buyup_Product_Selection__c='Surest & UNET'
        );
        oliList.add(oli6);
        
        OpportunityLineItem oli7 = new OpportunityLineItem(
            OpportunityId = opp1.Id,
            Quantity = 5,
            PricebookEntryId = pbEntryDen.Id,
            TotalPrice = 500,
            MNRP__c = 'N/A',
            MNRP_DME__c = 'N/A',
            MNRP_Lab__c = 'N/A',
            MNRP_Default_of_Billed_Charges__c = 'N/A',
            Physician_R_C_OON__c = 'N/A',
            Facility_R_C__c = 'N/A',
            ENRP__c = 'N/A',
            ENRP_Default_of_Billed_Charge__c = 'N/A',
            Sales_Stage__c = 'Spin-Off',
            Buyup_Product_Selection__c='Surest Only'
        );
        oliList.add(oli7);
        
        OpportunityLineItem oli8 = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Quantity = 5,
            PricebookEntryId = pbEntryVis.Id,
            TotalPrice = 500,
            MNRP__c = 'N/A',
            MNRP_DME__c = 'N/A',
            MNRP_Lab__c = 'N/A',
            MNRP_Default_of_Billed_Charges__c = 'N/A',
            Physician_R_C_OON__c = 'N/A',
            Facility_R_C__c = 'N/A',
            ENRP__c = 'N/A',
            ENRP_Default_of_Billed_Charge__c = 'N/A',
            Sales_Stage__c = 'Spin-Off',
            Buyup_Product_Selection__c='Surest & UNET'
        );
        oliList.add(oli8);
        
        OpportunityLineItem oli9 = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Quantity = 5,
            PricebookEntryId = pbEntryVis.Id,
            TotalPrice = 500,
            MNRP__c = 'N/A',
            MNRP_DME__c = 'N/A',
            MNRP_Lab__c = 'N/A',
            MNRP_Default_of_Billed_Charges__c = 'N/A',
            Physician_R_C_OON__c = 'N/A',
            Facility_R_C__c = 'N/A',
            ENRP__c = 'N/A',
            ENRP_Default_of_Billed_Charge__c = 'N/A',
            Buyup_Product_Selection__c='Surest & UNET',
            Disposition_Other_Buy_Up_Programs__c='Sold'
        );
        oliList.add(oli9);
        
        insert oliList;
        
        Policy_Information__c poli = new Policy_Information__c(
        	Company__c = acc.Id,
            Surest__c = true,
            Policy_Status__c = 'Active',
            Policy_Type__c = 'Medical',
            Policy__c = 'test surest policy',
            Name = '5632190'
        );
        
        insert poli;
        
        List<Audit_Trail__c> auditTrailRecords = new List<Audit_Trail__c>();
        Audit_Trail__c aud = new Audit_Trail__c();
        auditTrailRecords.add(aud);
        insert auditTrailRecords;
        
        Test.startTest();
        User ipmUser = [Select Id from User where Username = 'uhgDevWithoutId1@crmit.com' LIMIT 1]; 
        System.runAs(ipmUser) {
            SoldChecklistHandler.getClientData(opp.Id);
            SoldChecklistHandler.getClientData(opp1.Id);
            SoldChecklistHandler.getClientData(opp3.Id);
            SoldChecklistHandler.accsearch('Test1', 'IPM');
            SoldChecklistHandler.accsearch('Test1', 'SCE');
            SoldChecklistHandler.metadatasearch('Test');
            SoldChecklistHandler.incumbentSearch('test param', 'Incumbent Primary (Medical)');
            //SoldChecklistHandler.insertAuditTrailRecords(auditTrailRecords);
            SoldCheckListHandler.UpdateSoldCheckList(opp, acc, oliList, auditTrailRecords, scc1);
            //SoldCheckListHandler.getAccountPolicyInfoSurest(acc.Id);
            SoldCheckListHandler.getOtherBuyUpProducts();
            //SoldCheckListHandler.getSoldcasePdf(scc1.Id);
            SoldChecklistHandler.getTemplateInXML();
        }
        Test.stopTest();
    }
}