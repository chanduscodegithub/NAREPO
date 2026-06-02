@isTest
public class SoldCaseCheckListPrintCtrlTest {
    
    @testSetup static void createTestData() {
        //List<Opportunity> oppList = SoldCaseChecklistTestUtil.createSoldCaseData();
        Id PriceBook2Id = Test.getStandardPricebookId();
        
        List<Account> accList = new List<Account>();
        Account account = new Account();
        account.Name = 'Test CM Account1';
        account.Subtype__c ='Prospect';
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        account.BillingCountry = 'India';
        account.BillingPostalCode = '560076';
        account.BillingStreet = 'Dummy Street';
        account.BillingCity = 'Test City';
        
        Account account2 = new Account();
        account2.Name = 'Equity Healthcare';
        account2.Subtype__c ='Collaborative Ventures Group (CVG)';
        account2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        
        accList.add(account);
        accList.add(account2);
        insert accList;
        
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
        insert opp1;
        
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
         Product2 otherHeartFail = new Product2(Name = 'Heart Fail',
                                          Product_Line__c='Other', 
                                          IsActive = true,
                                          Family = 'Behavioral Health',
                                          ProductCode = 'CLN-DMCHF');
        Product2 otherAsthma = new Product2(Name = 'Asthma ',
                                          Product_Line__c='Other', 
                                          IsActive = true,
                                          Family = 'Behavioral Health',
                                          ProductCode = 'CLN-DMA');
        Product2 otherCancer  = new Product2(Name = 'Cancer',
                                          Product_Line__c='Other', 
                                          IsActive = true,
                                          Family = 'Behavioral Health',
                                          ProductCode = 'CLN-CCCSP');
        Product2 otherKidSol = new Product2(Name = 'KidSol ',
                                          Product_Line__c='Other', 
                                          IsActive = true,
                                          Family = 'Behavioral Health',
                                          ProductCode = 'CLN-CCKRS');
        Product2 otherKidRes  = new Product2(Name = 'KidRes',
                                          Product_Line__c='Other', 
                                          IsActive = true,
                                          Family = 'Behavioral Health',
                                          ProductCode = 'CLN-CCCKS');
        products.add(otherKidSol);
        products.add(otherKidRes);
        products.add(otherCOPD);
        products.add(otherHeartFail);
        products.add(otherAsthma);
        products.add(otherCancer);
        products.add(otherBehavioral);
        products.add(otherFinancial);
        products.add(pharmacyProduct);
        products.add(medicalProduct);
        products.add(dentalProduct);
        products.add(visionProduct);
        products.add(otherProduct);
        products.add(criticalProduct);
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
        PricebookEntry otherHeartFailEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                           Product2Id = otherHeartFail.Id,
                                                           UnitPrice = 10000, IsActive = true);
        
        PricebookEntry otherAsthmaEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                           Product2Id = otherAsthma.Id,
                                                           UnitPrice = 10000, IsActive = true);
        PricebookEntry otherCancerEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                           Product2Id = otherCancer.Id,
                                                           UnitPrice = 10000, IsActive = true);
        PricebookEntry otherKidSolEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                           Product2Id = otherKidSol.Id,
                                                           UnitPrice = 10000, IsActive = true);
        PricebookEntry otherKidResEntry = new PricebookEntry(Pricebook2Id = PriceBook2Id, 
                                                           Product2Id = otherKidRes.Id,
                                                           UnitPrice = 10000, IsActive = true);
        lstEntry.add(otherKidSolEntry);
        lstEntry.add(otherKidResEntry);
        lstEntry.add(otherHeartFailEntry);
        lstEntry.add(otherCOPDEntry);
        lstEntry.add(otherAsthmaEntry);   
        lstEntry.add(otherCancerEntry);
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
                                                                      Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
        OpportunityLineItem dentalLineItem = new OpportunityLineItem(Product2Id = dentalProduct.Id,
                                                                     OpportunityId = opp1.Id,
                                                                     Quantity =10,
                                                                     TotalPrice = 100,
                                                                     Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
        OpportunityLineItem criticalLineItem = new OpportunityLineItem(Product2Id = criticalProduct.Id,
                                                                       OpportunityId = opp1.Id,
                                                                       Quantity =10,
                                                                       TotalPrice = 100,
                                                                       Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
        OpportunityLineItem visionLineItem = new OpportunityLineItem(Product2Id = visionProduct.Id,
                                                                     OpportunityId = opp1.Id,
                                                                     Quantity =10,
                                                                     TotalPrice = 100,
                                                                     Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
        OpportunityLineItem otherFinancialLineItem = new OpportunityLineItem(Product2Id = otherFinancial.Id,
                                                                             OpportunityId = opp1.Id,
                                                                             Quantity =10,
                                                                             TotalPrice = 100,
                                                                             Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
        OpportunityLineItem otherBehavioralLineItem = new OpportunityLineItem(Product2Id = otherBehavioral.Id,
                                                                              OpportunityId = opp1.Id,
                                                                              Quantity =10,
                                                                              TotalPrice = 100,
                                                                              Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
        OpportunityLineItem otherCOPDLineItem = new OpportunityLineItem(Product2Id = otherCOPD.Id,
                                                                        OpportunityId = opp1.Id,
                                                                        Quantity =10,
                                                                        TotalPrice = 100,
                                                                        Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
        OpportunityLineItem otherHeartFailLineItem = new OpportunityLineItem(Product2Id = otherHeartFail.Id,
                                                                        OpportunityId = opp1.Id,
                                                                        Quantity =10,
                                                                        TotalPrice = 100,
                                                                        Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
        OpportunityLineItem otherAsthmaLineItem = new OpportunityLineItem(Product2Id = otherAsthma.Id,
                                                                        OpportunityId = opp1.Id,
                                                                        Quantity =10,
                                                                        TotalPrice = 100,
                                                                        Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
         OpportunityLineItem otherCancerLineItem = new OpportunityLineItem(Product2Id = otherCancer.Id,
                                                                        OpportunityId = opp1.Id,
                                                                        Quantity =10,
                                                                        TotalPrice = 100,
                                                                        Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
         OpportunityLineItem otherKidSolLineItem = new OpportunityLineItem(Product2Id = otherKidSol.Id,
                                                                        OpportunityId = opp1.Id,
                                                                        Quantity =10,
                                                                        TotalPrice = 100,
                                                                        Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
         OpportunityLineItem otherKidResItem = new OpportunityLineItem(Product2Id = otherKidRes.Id,
                                                                        OpportunityId = opp1.Id,
                                                                        Quantity =10,
                                                                        TotalPrice = 100,
                                                                        Disposition_Other_Buy_Up_Programs__c = 'Sold',
                                                                        Buyup_Product_Selection__c = 'Surest & UNET');
        lstOpplineItem.add(otherKidSolLineItem);
        lstOpplineItem.add(otherKidResItem);
        lstOpplineItem.add(otherCancerLineItem);
        lstOpplineItem.add(otherAsthmaLineItem);
        lstOpplineItem.add(otherHeartFailLineItem);
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
    
    static testMethod void testPrintDataLoad() {
        Test.startTest();
        //List<Opportunity> oppList = SoldCaseChecklistTestUtil.createSoldCaseData(); 
        //system.debug('oppList ---> '+oppList);
        Opportunity opp=[SELECT Id,Name,EffectiveDate__c,Product_Type_Involved_in_Opp__c FROM Opportunity WHERE Name='Test Opportunity insert Record'];
        //Opportunity opp = createTestData();
        Test.setCurrentPageReference(new PageReference('Page.SoldCaseCheckListPrint')); 
        System.currentPageReference().getParameters().put('Id', opp.Id);
        
        Sold_Case_Checklist__c scc = new Sold_Case_Checklist__c();
        scc.Name = 'Test Scc';
        scc.Membership_Activity__c = opp.Id;
        insert scc;
        
        scc.Payment_Integrity__c = 'Simplified Option 1';
        update scc;
        
        SoldCaseCheckListPrintCtrl obj = new SoldCaseCheckListPrintCtrl();
         
        scc.Payment_Integrity__c = 'Simplified Option 2';
        update scc;
        SoldCaseCheckListPrintCtrl obj2 = new SoldCaseCheckListPrintCtrl();
        
        
        scc.Payment_Integrity__c = 'Legacy Option 3';
        update scc;
        SoldCaseCheckListPrintCtrl obj3 = new SoldCaseCheckListPrintCtrl();
        String x = obj3.hqAddress;
        
        SoldCaseCheckListPrintCtrl sccp = new SoldCaseCheckListPrintCtrl();
        SoldCaseCheckListPrintCtrl ctrl = new SoldCaseCheckListPrintCtrl();
        String expectedToday = System.today().month() + '/' + System.today().day() + '/' + System.today().year();
        System.assertEquals(expectedToday, ctrl.getFormattedDate());
        
        // getFormattedEffectiveDate
        String effDate = opp.EffectiveDate__c.month() + '/' + opp.EffectiveDate__c.day() + '/' + opp.EffectiveDate__c.year();
        System.assertEquals(effDate, ctrl.getFormattedEffectiveDate());
        
        // getWordFileName
        String expectedName = 'SC Letter_' + opp.Name.replaceAll('[\\.,&\\+\\/\\-]', '_');
        System.assertEquals(expectedName, ctrl.getWordFileName());
        
        // getOtherBuyProductsMA
        String expectedOtherBuy = String.valueOf(
            opp.Product_Type_Involved_in_Opp__c.contains('Other Buy Up Programs')
        );
        System.assertEquals(expectedOtherBuy, ctrl.getOtherBuyProductsMA());
        Test.stopTest();  
        system.assertNotEquals(null, sccp.offset);
        system.assertNotEquals(null, sccp.hqAddress);
        
    }
}