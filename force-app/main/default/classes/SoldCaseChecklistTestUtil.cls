public class SoldCaseChecklistTestUtil {
    public static void createSoldCaseData(){
        Id cmCSADUserRoleId = [select Id, Name from UserRole where name = 'CM CSAD' limit 1].id;
        Id genExecUserRoleId = [select Id, Name from UserRole where name = 'General Executive' limit 1].id;
        Id userIpmProfileId= [select Id, Name from Profile where name = 'IPM Standard Profile' limit 1].id;
        Id userCdProfileId= [select Id, Name from Profile where name = 'CD Sales Team Advanced Profile' limit 1].id;
        List<user> testUserRecords = new List<user>();
        Id PriceBook2Id = Test.getStandardPricebookId();
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
        System.runAs ( testUserRecords[0] ) {
            insert account;
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
            Sales_Stage_Medical__c = 'Lead', Anticipated_Actual_Close_Date_Medical__c= Date.newInstance(2020, 5, 7), Closed_Reason_1_Medical__c= 'Network: Access',
            Sales_Stage_Dental__c = 'Lead', Anticipated_Actual_Close_Date_Dental__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Dental__c = 'Network: Access',
            Sales_Stage_Vision__c = 'Lead', Anticipated_Actual_Close_Date_Vision__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Vision__c= 'Network: Access',
            Sales_Stage_Pharmacy__c = 'Lead', Anticipated_Actual_Close_Date_Pharmacy__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Pharmacy__c= 'Network: Access',
            Sales_Stage_Other__c = 'Lead', Anticipated_Actual_Close_Date_Other__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Other_Buy_Up_Programs__c= 'Network: Access',
            Pricebook2Id =  PriceBook2Id
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
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            Sales_Stage_Medical__c = 'Notified', Disposition_Medical__c = 'Sold', Anticipated_Actual_Close_Date_Medical__c= Date.newInstance(2020, 5, 7), Closed_Reason_1_Medical__c= 'Network: Access',
            Sales_Stage_Dental__c = 'Notified', Disposition_Dental__c = 'Sold', Anticipated_Actual_Close_Date_Dental__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Dental__c = 'Network: Access',
            Sales_Stage_Vision__c = 'Notified', Disposition_Vision__c = 'Sold', Anticipated_Actual_Close_Date_Vision__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Vision__c= 'Network: Access',
            Sales_Stage_Pharmacy__c = 'Notified', Disposition_Pharmacy__c = 'Sold', Anticipated_Actual_Close_Date_Pharmacy__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Pharmacy__c= 'Network: Access',
            Sales_Stage_Other__c = 'Notified', Anticipated_Actual_Close_Date_Other__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Other_Buy_Up_Programs__c= 'Network: Access',
            Pricebook2Id =  PriceBook2Id
        );
        oppRecords.add(opp2);
        System.runAs ( testUserRecords[0] ) {
            insert oppRecords;
        }
        
        //Insertion of Products
        List<Product2> products = new List<Product2>();
        
        Product2 pharmacyProduct = new Product2(Name = 'Test Pharmacy',
                                                Product_Line__c='Pharmacy',
                                                IsActive = true,
                                                Family = 'Stop Loss',
                                               ProductCode = 'CLN-DMCOPD');
        
        Product2 medicalProduct = new Product2(Name = 'Test Medical',
                                               Product_Line__c='Medical',
                                               IsActive = true,
                                               Family = 'Financial Accounts',
                                               ProductCode = 'CLN-CCCSP');
        Product2 dentalProduct = new Product2(Name = 'Test Dental',
                                              Product_Line__c = 'Dental',
                                              IsActive = true,
                                              Family = 'Behavioral Health',
                                              ProductCode = 'CLN-CCCKS');
        Product2 visionProduct = new Product2(Name = 'Test Vision',
                                              Product_Line__c='Vision',
                                              IsActive = true,
                                              Family = 'Stop Loss');
        
        
        Product2 criticalProduct = new Product2(Name = 'Critical Illness',
                                                Product_Line__c='Other', 
                                                IsActive = true,
                                                ProductCode = 'CLN-CMPHS30T2');
        Product2 otherProduct = new Product2(Name = 'Test Other',
                                             Product_Line__c='Other', 
                                             IsActive = true,
                                             Family = 'Stop Loss',
                                             ProductCode = 'CLN-DMA');
        Product2 otherFinancial = new Product2(Name = 'Test otherFinancial',
                                               Product_Line__c='Other', 
                                               IsActive = true,
                                               Family = 'Financial Accounts',
                                               ProductCode = 'CLN-DMD');
       
        Product2 otherBehavioral = new Product2(Name = 'Critical Illness',
                                               Product_Line__c='Other', 
                                               IsActive = true,
                                               Family = 'Behavioral Health',
                                               ProductCode = 'CLN-DMCAD');
         Product2 otherCOPD = new Product2(Name = 'Critical Illness',
                                               Product_Line__c='Other', 
                                               IsActive = true,
                                               Family = 'Behavioral Health',
                                               ProductCode = 'CLN-DMCOPD');
        products.add(otherCOPD);
        products.add(otherBehavioral);
        products.add(otherFinancial);
        products.add(pharmacyProduct);
        products.add(medicalProduct);
        products.add(dentalProduct);
        products.add(visionProduct);
        products.add(otherProduct);
        products.add(criticalProduct);
        
        
        
        System.runAs ( testUserRecords[0] ) {
            insert products;
            List<PricebookEntry> lstEntry = new List<PricebookEntry>();
            PricebookEntry otherProductEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                                  Product2Id = otherProduct.Id,
                                                                  UnitPrice = 10000, IsActive = true);
            
            PricebookEntry medicalEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                             Product2Id = medicalProduct.Id,
                                                             UnitPrice = 10000, IsActive = true);
            
            PricebookEntry dentalEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                            Product2Id = dentalProduct.Id,
                                                            UnitPrice = 10000, IsActive = true);
            
            PricebookEntry criticalEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                              Product2Id = criticalProduct.Id,
                                                              UnitPrice = 10000, IsActive = true);
            
            PricebookEntry visionEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                            Product2Id = visionProduct.Id,
                                                            UnitPrice = 10000, IsActive = true);
            PricebookEntry financialEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                               Product2Id = otherFinancial.Id,
                                                               UnitPrice = 10000, IsActive = true);
             PricebookEntry otherBehavioralEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                               Product2Id = otherBehavioral.Id,
                                                               UnitPrice = 10000, IsActive = true);
            PricebookEntry otherCOPDEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                               Product2Id = otherCOPD.Id,
                                                               UnitPrice = 10000, IsActive = true);
            
            lstEntry.add(otherCOPDEntry);
            
            lstEntry.add(otherBehavioralEntry);
            
            lstEntry.add(financialEntry);
            
            lstEntry.add(visionEntry);
            lstEntry.add(dentalEntry);
            lstEntry.add(criticalEntry);
            lstEntry.add(medicalEntry);
            lstEntry.add(otherProductEntry);
            insert lstEntry;
            
            
            
            List<OpportunityLineItem> lstOpplineItem = new List<OpportunityLineItem>();
            OpportunityLineItem otherLineItem = new OpportunityLineItem(Product2Id = otherProduct.Id,
                                                                        OpportunityId = opp1.Id,
                                                                        Quantity =10,
                                                                        TotalPrice = 100);
            OpportunityLineItem medicalLineItem = new OpportunityLineItem(Product2Id = medicalProduct.Id,
                                                                          OpportunityId = opp1.Id,
                                                                          Quantity =10,
                                                                          TotalPrice = 100,
                                                                          Disposition_Other_Buy_Up_Programs__c = 'Sold');
            OpportunityLineItem dentalLineItem = new OpportunityLineItem(Product2Id = dentalProduct.Id,
                                                                         OpportunityId = opp1.Id,
                                                                         Quantity =10,
                                                                         TotalPrice = 100,
                                                                         Disposition_Other_Buy_Up_Programs__c = 'Sold');
            OpportunityLineItem criticalLineItem = new OpportunityLineItem(Product2Id = criticalProduct.Id,
                                                                           OpportunityId = opp1.Id,
                                                                           Quantity =10,
                                                                           TotalPrice = 100,
                                                                           Disposition_Other_Buy_Up_Programs__c = 'Sold');
            OpportunityLineItem visionLineItem = new OpportunityLineItem(Product2Id = visionProduct.Id,
                                                                         OpportunityId = opp1.Id,
                                                                         Quantity =10,
                                                                         TotalPrice = 100,
                                                                         Disposition_Other_Buy_Up_Programs__c = 'Sold');
            OpportunityLineItem otherFinancialLineItem = new OpportunityLineItem(Product2Id = otherFinancial.Id,
                                                                                 OpportunityId = opp1.Id,
                                                                                 Quantity =10,
                                                                                 TotalPrice = 100,
                                                                                 Disposition_Other_Buy_Up_Programs__c = 'Sold');
            OpportunityLineItem otherBehavioralLineItem = new OpportunityLineItem(Product2Id = otherBehavioral.Id,
                                                                                 OpportunityId = opp1.Id,
                                                                                 Quantity =10,
                                                                                 TotalPrice = 100,
                                                                                 Disposition_Other_Buy_Up_Programs__c = 'Sold');
             OpportunityLineItem otherCOPDLineItem = new OpportunityLineItem(Product2Id = otherCOPD.Id,
                                                                                 OpportunityId = opp1.Id,
                                                                                 Quantity =10,
                                                                                 TotalPrice = 100,
                                                                                 Disposition_Other_Buy_Up_Programs__c = 'Sold');
            lstOpplineItem.add(otherCOPDLineItem);
            lstOpplineItem.add(otherFinancialLineItem);
            lstOpplineItem.add(otherBehavioralLineItem);
            lstOpplineItem.add(visionLineItem);
            lstOpplineItem.add(criticalLineItem);
            lstOpplineItem.add(dentalLineItem);
            lstOpplineItem.add(otherLineItem);
            lstOpplineItem.add(medicalLineItem);
            insert lstOpplineItem;
        }
        
    }
}