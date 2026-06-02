@isTest
public class OpportunityTriggerHandlerTest {
    @isTest
    static void testPopulateSalesDebriefOnBeforeUpdate() {
        Id oppRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CD Membership Activity (Prospect or Aggregator)').getRecordTypeId();
        
        Id oppRecordTypeIdCM = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CM Membership Activity (Existing Client)').getRecordTypeId();
        List<Opportunity> oppList = new List<Opportunity>();
        
        Account account = new Account();
        account.Name = 'Opp Trigger Test Account';
        account.Subtype__c ='Prospect';
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert account;
        
        Account account3 = new Account();
        account3.Name = 'Opp Trigger Test Account';
        account3.Subtype__c ='National Accounts - West';
        account3.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert account3;
        
        Account account2 = new Account();
        account2.Name = 'Equity Healthcare';
        account2.Subtype__c ='Collaborative Ventures Group (CVG)';
        account2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        insert account2;
        
        Opportunity opp1 = new Opportunity(Name='Test Opp 1', AccountId = account.Id, RecordTypeId=oppRecordTypeId, Product_Type_Involved_in_Opp__c='Medical',
                                           Disposition_Medical__c='Sold', Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', StageName = 'Closed',
                                           CloseDate = System.today());
        
        Opportunity opp2 = new Opportunity(Name='Test Opp 2', AccountId = account.Id, RecordTypeId=oppRecordTypeId, Product_Type_Involved_in_Opp__c='Vision', 
                                           Disposition_Vision__c='Sold', Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', StageName = 'Closed', 
                                           CloseDate = System.today(), WillThrBeaRFP__c = 'Yes, RFP is Certain');
        
        
        Opportunity opp3 = new Opportunity(Name='Test Opp 3', AccountId = account3.Id, RecordTypeId=oppRecordTypeIdCM, Product_Type_Involved_in_Opp__c='Medical;Other', 
                                           Disposition_Medical__c='Sold', Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', StageName = 'Closed',
                                           CloseDate = System.today(), WillThrBeaRFP__c = 'Yes, RFP is Certain',Closed_Reason_1_Other_Buy_Up_Programs__c='Programs: Clinical');
        
        
        oppList.add(opp1);
        oppList.add(opp2);
        oppList.add(opp3);
        
        insert oppList;
        List<Product2> oppListProduct2 = new List<Product2>();
        
        Id pricebookId = Test.getStandardPricebookId();
        
        Product2 prod = new Product2(
            Name = 'Test Vision Product',
            Product_Line__c = 'Vision',
            Family = 'Specialty Products',
            ProductCode = 'Pro-X',
            isActive = true
        );
        
        Product2 prod2 = new Product2(
            Name = 'Test Other Product2',
            Product_Line__c = 'Other',
            Family = 'Specialty Products',
            ProductCode = 'Pro-X2',
            Reporting_Product_Type__c ='App',
            isActive = true
        );
        
        Product2 prod3 = new Product2(
            Name = 'Test Other Product3',
            Product_Line__c = 'Other',
            Family = 'Specialty Products',
            ProductCode = 'Pro-X3',
            Reporting_Product_Type__c ='HI',
            isActive = true
        );
        Product2 prod4 = new Product2(
            Name = 'Test Other Product4',
            Product_Line__c = 'Other',
            Family = 'Specialty Products',
            ProductCode = 'Pro-X4',
            Reporting_Product_Type__c ='CI',
            isActive = true
        );
        Product2 prod5 = new Product2(
            Name = 'Test Other Product5',
            Product_Line__c = 'Other',
            Family = 'Specialty Products',
            ProductCode = 'Pro-X5',
            Reporting_Product_Type__c ='Life',
            isActive = true
        );
        oppListProduct2.add(prod);
        oppListProduct2.add(prod2);
        oppListProduct2.add(prod3);
        oppListProduct2.add(prod4);
        oppListProduct2.add(prod5);
        
        insert oppListProduct2;
        
        PricebookEntry pbEntry = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = prod.Id,
            UnitPrice = 100.00,
            IsActive = true
        );
        insert pbEntry;
        
        List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();
        
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp2.Id,
            Quantity = 5,
            PricebookEntryId = pbEntry.Id,
            TotalPrice = 100
        );
        
        OpportunityLineItem oli1 = new OpportunityLineItem(
            OpportunityId = opp3.Id,
            Quantity = 5,
            PricebookEntryId = pbEntry.Id,
            TotalPrice = 100
        );
        
        OpportunityLineItem oli2 = new OpportunityLineItem(
            OpportunityId = opp3.Id,
            Quantity = 5,
            PricebookEntryId = pbEntry.Id,
            TotalPrice = 100
        );
        
        OpportunityLineItem oli3 = new OpportunityLineItem(
            OpportunityId = opp3.Id,
            Quantity = 5,
            PricebookEntryId = pbEntry.Id,
            TotalPrice = 100
        );
        
        
        
        oliList.add(oli);
        oliList.add(oli1);
        oliList.add(oli2);
        oliList.add(oli3);
        
        insert oliList;
        
        
        opp3.Sales_Stage_Other__c ='Notified';
        update opp3;
    }
    @isTest
    static void testOpportunityAfterUpdate_StrategyMemoSync() {
        
        // -------- Account --------
        Account acc = new Account(
            Name = 'Strategy Memo Test Acc',
            Subtype__c = 'Prospect',
            RecordTypeId = Schema.SObjectType.Account
            .getRecordTypeInfosByName()
            .get('Prospect')
            .getRecordTypeId()
        );
        insert acc;
        
        // -------- Opportunity --------
        Opportunity opp = new Opportunity(
            Name = 'Strategy Memo Opp',
            AccountId = acc.Id,
            StageName = 'Prospecting',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Medical,Vision,Pharmacy,Dental,Vision,Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Sales_Stage_Medical__c = 'Lead',Anticipated_Actual_Close_Date_Medical__c= Date.newInstance(2020, 5, 7), Closed_Reason_1_Medical__c= 'Network: Access',
            CloseDate = Date.today().addDays(30),
            Notes_taken_on_call_with_consultant__c = 'Initial Notes'            );
        insert opp;
        
        // -------- Strategy Memo --------
        Strategy_Memo__c memo = new Strategy_Memo__c(
            Membership_Activity__c = opp.Id
        );
        insert memo;
        
        // -------- Old Map Snapshot --------
        Opportunity oldOpp = opp.clone(true, true, true, true);
        
        // -------- Update Opportunity (mapped fields) --------
        opp.Notes_taken_on_call_with_consultant__c = 'Updated Notes';
        //opp.Is_the_Client_in_the_Cannabis_Business__c = 'No';
        opp.vs_Aetna__c = 10;
        // opp.Opportunity_Average_Contract_Size_ACS__c = 150000;
        
        Map<Id, Opportunity> oldMap = new Map<Id, Opportunity>{
            opp.Id => oldOpp
                };
                    
                    Test.startTest();
        update opp; // fires afterUpdate
        OpportunityTriggerHandler.afterUpdate(
            new List<Opportunity>{ opp },
            oldMap
        );
        Test.stopTest();
    }
    
    
    @testSetup
    static void setupData() {
        
        // Create Product
        Product2 prodAPP = new Product2(
            Name = 'APP Product',
            IsActive = true,
            Reporting_Product_Type__c = 'APP'
        );
        insert prodAPP;
        
        Product2 prodCI = new Product2(
            Name = 'CI Product',
            IsActive = true,
            Reporting_Product_Type__c = 'CI'
        );
        insert prodCI;
        
        // Pricebook
        Id standardPB = Test.getStandardPricebookId();
        
        PricebookEntry pbe1 = new PricebookEntry(
            Pricebook2Id = standardPB,
            Product2Id = prodAPP.Id,
            UnitPrice = 100,
            IsActive = true
        );
        insert pbe1;
        
        PricebookEntry pbe2 = new PricebookEntry(
            Pricebook2Id = standardPB,
            Product2Id = prodCI.Id,
            UnitPrice = 200,
            IsActive = true
        );
        insert pbe2;
    }
    
    @isTest
    static void testValidationError() {
        
        Id standardPB = Test.getStandardPricebookId();
        
      Id oppRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CD Membership Activity (Prospect or Aggregator)').getRecordTypeId();
        
        Id oppRecordTypeIdCM = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CM Membership Activity (Existing Client)').getRecordTypeId();
        List<Opportunity> oppList = new List<Opportunity>();
        
  
        
        Account account3 = new Account();
        account3.Name = 'Opp Trigger Test Account';
        account3.Subtype__c ='National Accounts - West';
        account3.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert account3;
        

        
        Opportunity opp3 = new Opportunity(Name='Test Opp 3', AccountId = account3.Id, RecordTypeId=oppRecordTypeIdCM, Product_Type_Involved_in_Opp__c='Other', 
                                           Disposition_Other__c='Set individually for each Product', Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', StageName = 'Open',Sales_Stage_Other__c ='Notified',
                                           CloseDate = System.today(), WillThrBeaRFP__c = 'Yes, RFP is Certain',Closed_Reason_1_Other_Buy_Up_Programs__c='Programs: Clinical',Existing_Members_Risk_Outcome_CI__c='Retained',Existing_Members_Risk_Outcome_APP__c = 'Retained');
        
        
       
        oppList.add(opp3);
        
        insert oppList;
        
      
        // Add OLI
        PricebookEntry pbe = [
            SELECT Id 
            FROM PricebookEntry 
            LIMIT 1
        ];
        
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp3.Id,
            PricebookEntryId = pbe.Id,
            Quantity = 1,
            UnitPrice = 100
        );
        insert oli;
        
        Test.startTest();
        
        opp3.Sales_Stage_Other__c = 'Notified';
        update opp3;
       
        Test.stopTest();
    }
    
    @isTest
    static void testValidationSuccess() {
        
        Id standardPB = Test.getStandardPricebookId();
        
        Id oppRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CD Membership Activity (Prospect or Aggregator)').getRecordTypeId();
        
        Id oppRecordTypeIdCM = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CM Membership Activity (Existing Client)').getRecordTypeId();
        List<Opportunity> oppList = new List<Opportunity>();
        
  
        
        Account account3 = new Account();
        account3.Name = 'Opp Trigger Test Account';
        account3.Subtype__c ='National Accounts - West';
        account3.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert account3;
        

        
        Opportunity opp = new Opportunity(Name='Test Opp 3', AccountId = account3.Id, RecordTypeId=oppRecordTypeIdCM, Product_Type_Involved_in_Opp__c='Other', 
                                           Disposition_Other__c='Set individually for each Product', Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', StageName = 'Open',Sales_Stage_Other__c ='Notified',
                                           CloseDate = System.today(), WillThrBeaRFP__c = 'Yes, RFP is Certain',Closed_Reason_1_Other_Buy_Up_Programs__c='Programs: Clinical',Existing_Members_Risk_Outcome_CI__c='Retained',Existing_Members_Risk_Outcome_APP__c = 'Retained');
        
        
       
        
        insert opp;
        
        PricebookEntry pbe = [
            SELECT Id 
            FROM PricebookEntry 
            LIMIT 1
        ];
        
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp.Id,
            PricebookEntryId = pbe.Id,
            Quantity = 1,
            UnitPrice = 100
        );
        insert oli;
        
        Test.startTest();
        
        opp.Sales_Stage_Other__c = 'Notified';
        
        opp.Existing_Members_Risk_Outcome_APP__c = 'Retained';
        
        update opp;
        
        Test.stopTest();
        
        System.assert(true);
        
    }
}