@isTest
public class ProductsAndCompetitorsAppletTest {
    
    @testSetUp static void createTestData() {
        
        List<Account> accList = new List<Account>();
        List<Opportunity> oppList = new List<Opportunity>();
        List<Product2> productsList = new List<Product2>();
        List<PricebookEntry> pricebookEntryList = new List<PricebookEntry>();
        List<OpportunityLineItem> oppLineItemList = new List<OpportunityLineItem>();
        
        Account accNA = new Account();
        accNA.Name = 'National Accounts';
        accNA.Subtype__c ='Competitor';
        accNA.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        accList.add(accNA);
        
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
        
        Account totalAcc = new Account();
        totalAcc.Name = 'Total';
        totalAcc.Subtype__c ='Competitor';
        totalAcc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        accList.add(totalAcc);
                
        accList.add(new Account(Name='Aetna',Subtype__c ='Competitor',
                           RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        accList.add(new Account(Name='Blue',Subtype__c ='Competitor',
                           RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        
        insert accList;
        
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
        
        insert oppList;
        
        PriceBook2 priceBook = new PriceBook2();
        priceBook.Name = 'Test PriceBook';
        insert priceBook;
        
        Product2 prod1 = new Product2();
        prod1.Name = 'Test Prod1';
        prod1.Product_Line__c = 'Pharmacy';
        prod1.IsActive = true;
        productsList.add(prod1);
        
        Product2 prod4 = new Product2();
        prod4.Name = 'Test Prod4';
        prod4.Product_Line__c = 'Pharmacy';
        prod4.IsActive = true;
        productsList.add(prod4);
        
        Product2 prod2 = new Product2();
        prod2.Name = 'Test Prod2';
        prod2.Product_Line__c = 'Dental';
        prod2.IsActive = true;
        productsList.add(prod2);
        
        Product2 prod5 = new Product2();
        prod5.Name = 'Test Prod5';
        prod5.Product_Line__c = 'Dental';
        prod5.IsActive = true;
        productsList.add(prod5);
        
        Product2 prod3 = new Product2();
        prod3.Name = 'Test Prod3';
        prod3.Product_Line__c = 'Medical';
        prod3.IsActive = true;
        productsList.add(prod3);        
        
        Product2 phamTotalProd = new Product2();
        phamTotalProd.Name = 'Total';
        phamTotalProd.Product_Line__c = 'Pharmacy';
        phamTotalProd.IsActive = true;
        productsList.add(phamTotalProd);
        
        Product2 denTotalProd = new Product2();
        denTotalProd.Name = 'Total';
        denTotalProd.Product_Line__c = 'Dental';
        denTotalProd.IsActive = true;
        productsList.add(denTotalProd);
        
        Product2 medTotalProd = new Product2();
        medTotalProd.Name = 'Total';
        medTotalProd.Product_Line__c = 'Medical';
        medTotalProd.IsActive = true;
        productsList.add(medTotalProd);
        
        insert productsList;
        
        PricebookEntry priceBookEntry1 = new PricebookEntry(Pricebook2Id = priceBook.Id, Product2Id = prod1.Id, UnitPrice = 1000, IsActive = true);
        priceBookEntry1.Pricebook2Id = Test.getStandardPricebookId();
        pricebookEntryList.add(priceBookEntry1);
        
        PricebookEntry priceBookEntry4 = new PricebookEntry(Pricebook2Id = priceBook.Id, Product2Id = prod4.Id, UnitPrice = 1000, IsActive = true);
        priceBookEntry4.Pricebook2Id = Test.getStandardPricebookId();
        pricebookEntryList.add(priceBookEntry4);
        
        PricebookEntry priceBookEntry2 = new PricebookEntry(Pricebook2Id = priceBook.Id, Product2Id = prod2.Id, UnitPrice = 1000, IsActive = true);
        priceBookEntry2.Pricebook2Id = Test.getStandardPricebookId();
        pricebookEntryList.add(priceBookEntry2);
        
        PricebookEntry priceBookEntry5 = new PricebookEntry(Pricebook2Id = priceBook.Id, Product2Id = prod5.Id, UnitPrice = 1000, IsActive = true);
        priceBookEntry5.Pricebook2Id = Test.getStandardPricebookId();
        pricebookEntryList.add(priceBookEntry5);
        
        PricebookEntry priceBookEntry3 = new PricebookEntry(Pricebook2Id = priceBook.Id, Product2Id = prod3.Id, UnitPrice = 1000, IsActive = true);
        priceBookEntry3.Pricebook2Id = Test.getStandardPricebookId();
        pricebookEntryList.add(priceBookEntry3);
        
        PricebookEntry priceBookEntryTotal = new PricebookEntry(Pricebook2Id = priceBook.Id, Product2Id = denTotalProd.Id, UnitPrice = 1000, IsActive = true);
        priceBookEntryTotal.Pricebook2Id = Test.getStandardPricebookId();
        pricebookEntryList.add(priceBookEntryTotal);
        
        PricebookEntry priceBookEntryTotal2 = new PricebookEntry(Pricebook2Id = priceBook.Id, Product2Id = phamTotalProd.Id, UnitPrice = 1000, IsActive = true);
        priceBookEntryTotal2.Pricebook2Id = Test.getStandardPricebookId();
        pricebookEntryList.add(priceBookEntryTotal2);
        
        PricebookEntry priceBookEntryTotal3 = new PricebookEntry(Pricebook2Id = priceBook.Id, Product2Id = medTotalProd.Id, UnitPrice = 1000, IsActive = true);
        priceBookEntryTotal3.Pricebook2Id = Test.getStandardPricebookId();
        pricebookEntryList.add(priceBookEntryTotal3);
        insert pricebookEntryList;
        
        OpportunityLineItem oppItem = new OpportunityLineItem();
        oppItem.OpportunityId = opp.Id;                              
        oppItem.Estimated_Additional_New_Members__c = 20;
        oppItem.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem.Net_Results__c = 0;
        oppItem.Sold_Retained_Members__c = 0;
        oppItem.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem.Quantity = 2;
        oppItem.TotalPrice = 100;
        oppItem.PricebookEntryId = priceBookEntry1.Id;
        oppLineItemList.add(oppItem);
        
        oppLineItemList.add(new OpportunityLineItem(OpportunityId = opp.Id,                             
                                                    Estimated_Additional_New_Members__c = 10,
                                                    Existing_Membership_at_Risk__c =10,                                                                                   
                                                    Net_Results__c = 0,
                                                    Sold_Retained_Members__c = 0,
                                                    Existing_Members_Involved_in_the_Bid__c = 10,
                                                    Mbrs_Transferred_From_To_Another_Segment__c = 0,
                                                    Quantity = 2,
                                                    TotalPrice = 100,
                                                    PricebookEntryId = priceBookEntry4.Id));
        
        oppLineItemList.add(new OpportunityLineItem(OpportunityId = opp.Id,                             
                                                    Estimated_Additional_New_Members__c = 30,
                                                    Existing_Membership_at_Risk__c = 30,                                                                                   
                                                    Net_Results__c = 0,
                                                    Sold_Retained_Members__c = 0,
                                                    Existing_Members_Involved_in_the_Bid__c = 110,
                                                    Mbrs_Transferred_From_To_Another_Segment__c = 0,
                                                    Quantity = 2,
                                                    TotalPrice = 100,
                                                    PricebookEntryId = priceBookEntryTotal2.Id));
        
        OpportunityLineItem oppItem1 = new OpportunityLineItem();
        oppItem1.OpportunityId = opp1.Id;                              
        oppItem1.Estimated_Additional_New_Members__c = 10;
        oppItem1.Mbrs_Transferred_From_To_Another_Segment__c = 12;
        oppItem1.Members_Quoted_in_the_Proposal__c = 15;
        oppItem1.Quantity = 2;
        oppItem1.TotalPrice = 100;
        oppItem1.PricebookEntryId = priceBookEntry3.Id;
        oppLineItemList.add(oppItem1);
        
        OpportunityLineItem oppItem2 = new OpportunityLineItem();
        oppItem2.OpportunityId = opp1.Id;                              
        oppItem2.Estimated_Additional_New_Members__c = 0;
        oppItem2.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem2.Members_Quoted_in_the_Proposal__c = 0;
        oppItem2.Quantity = 2;
        oppItem2.TotalPrice = 100;
        oppItem2.PricebookEntryId = priceBookEntry3.Id;
        oppLineItemList.add(oppItem2);
        
        oppLineItemList.add(new OpportunityLineItem(OpportunityId = opp.Id,                             
                                                    Estimated_Additional_New_Members__c = 10,
                                                    Mbrs_Transferred_From_To_Another_Segment__c = 12, 
                                                    Members_Quoted_in_the_Proposal__c = 15,
                                                    Quantity = 2,
                                                    TotalPrice = 100,
                                                    PricebookEntryId = priceBookEntryTotal2.Id));
        
        insert oppLineItemList;
        
        List<MA_Competitor__c> competitorsList = new List<MA_Competitor__c>();
        competitorsList.add(returnMACompetitorObjData(opp.Id, accList[4].Id, 'Pharmacy', 10, 100, 10, 100));
        competitorsList.add(returnMACompetitorObjData(opp.Id, accList[4].Id, 'Dental', 20, 100, 10, 100));
        competitorsList.add(returnMACompetitorObjData(opp.Id, accList[4].Id, 'Vision', 5, 100, 10, 100));
        competitorsList.add(returnMACompetitorObjData(opp.Id, accList[4].Id, 'Other', 56, 100, 10, 100));
        competitorsList.add(returnMACompetitorObjData(opp.Id, accList[4].Id, 'Medical', 75, 100, 10, 100));
        /* National Account Competitors Data */
        competitorsList.add(returnMACompetitorObjData(opp.Id, accNA.Id, 'Pharmacy', 0, 0, 0, 0));
        competitorsList.add(returnMACompetitorObjData(opp.Id, accNA.Id, 'Dental', 0, 0, 0, 0));
        competitorsList.add(returnMACompetitorObjData(opp.Id, accNA.Id, 'Vision', 0, 0, 0, 0));
        competitorsList.add(returnMACompetitorObjData(opp.Id, accNA.Id, 'Other', 0, 0, 0, 0));
        competitorsList.add(returnMACompetitorObjData(opp.Id, accNA.Id, 'Medical', 0, 0, 0, 0));
        /* Total Competitors Data */
        competitorsList.add(returnMACompetitorObjData(opp.Id, totalAcc.Id, 'Pharmacy', 10, 100, 10, 100));
        competitorsList.add(returnMACompetitorObjData(opp.Id, totalAcc.Id, 'Dental', 20, 100, 10, 100));
        competitorsList.add(returnMACompetitorObjData(opp.Id, totalAcc.Id, 'Vision', 5, 100, 10, 100));
        competitorsList.add(returnMACompetitorObjData(opp.Id, totalAcc.Id, 'Other', 56, 100, 10, 100));
        competitorsList.add(returnMACompetitorObjData(opp.Id, totalAcc.Id, 'Medical', 75, 100, 10, 100));
        insert competitorsList;
    }
    
    public static MA_Competitor__c returnMACompetitorObjData(Id oppId, String compAccId, String compClassification, Decimal noOfMemHeld, Decimal OfMemHeld,
                                                          Decimal noOfMemAwar, Decimal OfMemAwar) {
        
		MA_Competitor__c compObj = new MA_Competitor__c(Competitor_Account__c = compAccId,
                                                  		Opportunity__c = oppId,
                                                  		Competitor_Classification__c = compClassification,
                                                  		Number_of_Members_Held__c = noOfMemHeld,
                                                  		of_Members_Held__c = OfMemHeld,
                                                        Number_of_Members_Awarded__c = noOfMemAwar,
                                                  		of_Members_Awarded__c = OfMemAwar);
            
        return compObj;
    }
    
    public testMethod static void validateGetProductsAndCompetitorsDetails() {        
        
        Test.startTest();
        
        Opportunity optObj = [SELECT Id,Disposition_Medical__c,Disposition_Dental__c,Disposition_Vision__c,Disposition_Other__c,Members_in_the_Proposal_Medical__c,Progression_Sales_Stage_Dental__c,Progression_Sales_Stage_Pharmacy__c FROM Opportunity WHERE Name='Test CM Opportunity' LIMIT 1];
        Opportunity optObj1 = [SELECT Id,Disposition_Medical__c,Disposition_Dental__c,Disposition_Vision__c,Disposition_Other__c,Members_in_the_Proposal_Medical__c FROM Opportunity WHERE Name='Test CD Opportunity' LIMIT 1];
        Id cmAccId = [SELECT Id FROM Account WHERE Name='Test CM Account' LIMIT 1].Id;
        Id cdAccId = [SELECT Id FROM Account WHERE Name='Test CD Account' LIMIT 1].Id;
        try{
            ProductsAndCompetitorsAppletController.getProductsAndCompetitorsDetails(optObj.Id,cmAccId,'NBEA','Medical','Lead','Proposal',optObj,false);
            ProductsAndCompetitorsAppletController.getProductsAndCompetitorsDetails(optObj.Id,cmAccId,'NBEA','Medical','Proposal','Notified',optObj,false);
            ProductsAndCompetitorsAppletController.getProductsAndCompetitorsDetails(optObj.Id,cmAccId,'NBEA','Dental','Notified','Notified',optObj,false);
            ProductsAndCompetitorsAppletController.getProductsAndCompetitorsDetails(optObj.Id,cmAccId,'NBEA','Medical','Lead','Notified',optObj,false);
                        
            ProductsAndCompetitorsAppletController.getMACompetitorsDetails(optObj1.Id, 'NB','Medical','Lead','Proposal', 
				ProductsAndCompetitorsAppletController.getProductsAndCompetitorsDetails(optObj1.Id,cdAccId,'NB','Medical','Lead','Proposal',optObj1,false).productsAppletWrapperClassObj, optObj1, false);
            
            ProductsAndCompetitorsAppletController.getMACompetitorsDetails(optObj1.Id, 'NB','Dental','Lead','Proposal', 
				ProductsAndCompetitorsAppletController.getProductsAndCompetitorsDetails(optObj1.Id,cdAccId,'NB','Dental','Lead','Proposal',optObj1,false).productsAppletWrapperClassObj, optObj1, false);
            
            ProductsAndCompetitorsAppletController.queryProducts('a',1,'Top_Tab','Medical and Others');
            ProductsAndCompetitorsAppletController.queryProducts('',1,'Top_Tab','Medical and Others');
            ProductsAndCompetitorsAppletController.queryProducts('',1,'Blues_Tab','Medical');
            ProductsAndCompetitorsAppletController.queryProducts('',1,'Exchange_Tab','Dental');
            ProductsAndCompetitorsAppletController.queryProducts('',1,'Others_Tab','Pharmacy');
            ProductsAndCompetitorsAppletController.queryProducts('',null,'Others_Tab','Pharmacy');
            
        }catch(Exception ex){
            System.debug('Ex message '+ex);
        }
        try{
            ProductsAndCompetitorsAppletController.getProductsAndCompetitorsDetails(optObj.Id,cmAccId,'NBEA','Medical;Other','Lead','Proposal',optObj,false);    
        }catch(Exception ex){
            System.debug('Ex message '+ex);
        }
        
        Test.stopTest();
    }
    
    public testMethod static void validateSaveProductsAndCompetitorsDetails(){        
        
        Test.startTest();
        
        Opportunity optObj = [SELECT Id,Disposition_Medical__c,Sales_Stage_Pharmacy__c,Sales_Stage_Dental__c,Sales_Stage_Medical__c FROM Opportunity WHERE Name='Test CM Opportunity' LIMIT 1];
        Id accId = [SELECT Id FROM Account WHERE Name='Test CM Account' LIMIT 1].Id;
        Id optyId= optObj.Id;
        List<OpportunityLineItem> opportunityLineItemList = [SELECT Id,Existing_Members_Retained__c,Existing_Members_Retained_Pinnacle__c,Product2.Name,Product2.Distribution_Type_Flag__c,Product2.Considered_For_StepWise_Integration__c,Termed_Members__c,Sold_New_Members__c,Opportunity.Disposition_Medical__c,Annual_Revenue_Premium__c,Product2.Product_Line__c, Estimated_Additional_New_Members__c, Existing_Members_Involved_in_the_Bid__c, Existing_Membership_at_Risk__c, Funding_Type__c, Members_Quoted_in_the_Proposal__c, Net_Results__c, Sold_Retained_Members__c,Mbrs_Transferred_From_To_Another_Segment__c,Copy_the_Membership_from_Medical__c,Disposition_Other_Buy_Up_Programs__c FROM OpportunityLineItem WHERE OpportunityId =: optyId];   
        List<MA_Competitor__c> competitorsListFromSF = [SELECT Id,Competitor_Account__r.Name,Competitor_Account__c,Number_of_Members_Held__c,of_Members_Held__c,Number_of_Members_Awarded__c,of_Members_Awarded__c,Comments__c,Competitor_Classification__c,Opportunity__r.Disposition_Medical__c FROM MA_Competitor__c where Opportunity__c=:optyId]; 
        try{                        
            ProductsAndCompetitorsAppletController.saveProductsAndCompetitorsDetails(optObj.Id,accId,'NBEA','Medical','Lead','Proposal',optObj,null,null,false,false);    
        }catch(Exception ex){
            System.debug('Ex message '+ex);
        }
        try{
            opportunityLineItemList[0].Estimated_Additional_New_Members__c = 30;
        	opportunityLineItemList[0].Existing_Membership_at_Risk__c = 30;  
            ProductsAndCompetitorsAppletController.saveProductsAndCompetitorsDetails(optObj.Id,accId,'NBEA','Medical','Lead','Proposal',optObj,competitorsListFromSF,opportunityLineItemList,false,true);    
            //ProductsAndCompetitorsAppletController.saveProductsAndCompetitorsDetails(optObj.Id,accId,'NBEA','Medical','Lead','Proposal',optObj,competitorsListFromSF,opportunityLineItemList,false,false);    
        }catch(Exception ex){
            System.debug('Ex message '+ex);
        }      
        
        Test.stopTest();
    }       
    
    public testMethod static void validateDeleteOpportunityLineItem(){        
        
        Test.startTest();
        
        Opportunity optObj = [SELECT Id,Disposition_Medical__c,Disposition_Dental__c,Disposition_Vision__c,Disposition_Other__c,Members_in_the_Proposal_Medical__c FROM Opportunity WHERE Name='Test CM Opportunity' LIMIT 1];
        Id accId = [SELECT Id FROM Account WHERE Name='Test CM Account' LIMIT 1].Id;
        Id optyId= optObj.Id;
        OpportunityLineItem opportunityLineItemObj = [SELECT Id,Existing_Members_Retained__c,Existing_Members_Retained_Pinnacle__c,Product2.Name,Product2.Distribution_Type_Flag__c,Product2.Considered_For_StepWise_Integration__c,Termed_Members__c,Sold_New_Members__c,Opportunity.Disposition_Medical__c,Annual_Revenue_Premium__c,Product2.Product_Line__c, Estimated_Additional_New_Members__c, Existing_Members_Involved_in_the_Bid__c, Existing_Membership_at_Risk__c, Funding_Type__c, Members_Quoted_in_the_Proposal__c, Net_Results__c, Sold_Retained_Members__c,Mbrs_Transferred_From_To_Another_Segment__c,Copy_the_Membership_from_Medical__c,Disposition_Other_Buy_Up_Programs__c FROM OpportunityLineItem WHERE OpportunityId =: optyId limit 1]  ;   
        List<MA_Competitor__c> competitorsListFromSF = [SELECT Id,Competitor_Account__r.Name,Competitor_Account__c,Number_of_Members_Held__c,of_Members_Held__c,Number_of_Members_Awarded__c,of_Members_Awarded__c,Comments__c,Competitor_Classification__c,Opportunity__r.Disposition_Medical__c FROM MA_Competitor__c where Opportunity__c=:optyId]; 
        try{                         
            ProductsAndCompetitorsAppletController.deleteOpportunityLineItem(opportunityLineItemObj,optyId,accId,'Medical','');    
        }catch(Exception ex){
            System.debug('Ex message '+ex);
        }
        try{
            ProductsAndCompetitorsAppletController.deleteOpportunityLineItem(null,null,null,'Medical','');    
        }catch(Exception ex){
            System.debug('Ex message '+ex);
        } 
        
        Test.stopTest();
    }
    
    public testMethod static void validateDeleteCompetitors() {
        
        Test.startTest();
        
        Opportunity optObj = [SELECT Id FROM Opportunity WHERE Name='Test CM Opportunity' LIMIT 1];
        Id accId = [SELECT Id FROM Account WHERE Name='Test CM Account' LIMIT 1].Id;
        
        try {
            MA_Competitor__c[] maCompList = [SELECT Id,Competitor_Account__r.Name,Competitor_Account__c,Number_of_Members_Held__c,of_Members_Held__c,Number_of_Members_Awarded__c,of_Members_Awarded__c,Comments__c,Competitor_Classification__c FROM MA_Competitor__c where Opportunity__c=:optObj.Id and Competitor_Classification__c='Medical' and  Competitor_Account__r.Name!='National Accounts' ORDER BY CreatedDate Asc];
            ProductsAndCompetitorsAppletController.deleteCompetitorRecord(optObj.Id,accId,'NBEA',false,'Medical','Lead','Proposal',optObj,maCompList[0],false);
        } catch(Exception e) {
            System.debug('Excpetion occurred in validateDeleteCompetitors() - '+e);
        }
        
    }
    
    /*
     * The below method validates for the No Access Exception.
     */
    public testMethod static void validateMethodsForReadOnlyUser() {
        
        User readOnlyUser = new User(
            LastName = 'LIVE1',
            FirstName='JASON2',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDev1@crmit.com',
            Position__c = 'Test User',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US');
        
        insert readOnlyUser;
        
        Opportunity optObj = [SELECT Id,Disposition_Medical__c,Disposition_Dental__c,Disposition_Vision__c,Disposition_Other__c,Members_in_the_Proposal_Medical__c FROM Opportunity WHERE Name='Test CM Opportunity' LIMIT 1];
        System.debug('optObj-'+optObj);
        Id accId = [SELECT Id FROM Account WHERE Name='Test CM Account' LIMIT 1].Id;
        System.debug('accId-'+accId);
        MA_Competitor__c[] maCompList = [SELECT Id,Competitor_Account__r.Name,Competitor_Account__c,Number_of_Members_Held__c,of_Members_Held__c,Number_of_Members_Awarded__c,of_Members_Awarded__c,Comments__c,Competitor_Classification__c FROM MA_Competitor__c where Opportunity__c=:optObj.Id and Competitor_Classification__c='Medical' and  Competitor_Account__r.Name!='National Accounts' ORDER BY CreatedDate Asc];
        System.debug('maCompList-'+maCompList);
        Test.startTest();
            System.runAs(readOnlyUser) {
                try {
                    ProductsAndCompetitorsAppletController.deleteCompetitorRecord(optObj.Id,accId,'NBEA',false,'Medical','Lead','Proposal',optObj,maCompList[0],false);
					ProductsAndCompetitorsAppletController.queryProducts('a',null,'Top_Tab','Pharmacy');
                } catch(Exception e) { 
                    System.debug('Exception occurred in validateMethodsForReadOnlyUser for deleteCompetitorRecordMethod - '+e);
                }
            }
        Test.stopTest();
        
    }
    
}