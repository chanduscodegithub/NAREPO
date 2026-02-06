@isTest
public class renewalChecklistCls_Test {
    
    @testSetup
    static void testSetup(){
        
        List<Account> accList = new List<Account>();
        
        Account acc1 = new Account();
        acc1.Name = 'Test Renewal Acccount 1';
        acc1.UHC_Medical_Members__c = 1;
        acc1.Subtype__c = 'CVG';
        acc1.Pending_Term_Client__c = false;
        acc1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        acc1.CMVPCRRVP__c = UserInfo.getUserId();
        accList.add(acc1);
        
        Account account2 = new Account();
        account2.Name = 'Equity Healthcare';
        account2.Subtype__c ='Collaborative Ventures Group (CVG)';
        account2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        accList.add(account2);
        
        Account acc2 = new Account();
        acc2.Name = 'Test Renewal Acccount 2';
        acc2.UHC_Medical_Members__c = 1;
        acc2.Subtype__c = 'CVG';
        acc2.Pending_Term_Client__c = false;
        acc2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Client Subsidiary').getRecordTypeId();
        acc2.CMVPCRRVP__c = UserInfo.getUserId();
        accList.add(acc2);
        insert accList;
        
        Renewal_Checklist__c rc = new Renewal_Checklist__c();
        rc.Company__c = acc1.Id;
        insert rc;
        
        Pricebook2 standardPricebook = new Pricebook2(
            IsActive = true,
            Id = Test.getStandardPricebookId()
        );
        update standardPricebook;
        
        PriceBook2 book1 = new PriceBook2();
        book1.Name = 'Test book1';
        insert book1;
        
        List<Product2> pdList = new List<Product2>(); 
        
        Product2 visionProd = new Product2();
        visionProd.Name = 'Vision - Voluntary';
        visionProd.Product_Line__c = 'Vision';
        visionProd.IsActive = true;
        pdList.add(visionProd);
        
        Product2 rxProd = new Product2();
        rxProd.Name = 'Pharmacy';
        rxProd.Product_Line__c = 'Pharmacy';
        rxProd.IsActive = true;
        pdList.add(rxProd);
        
        Product2 medProd = new Product2();
        medProd.Name = 'Executive Medical';
        medProd.Product_Line__c = 'Medical';
        medProd.IsActive = true;
        pdList.add(medProd);
        
        Product2 dentalProd = new Product2();
        dentalProd.Name = 'Dental Indemnity - Voluntary';
        dentalProd.Product_Line__c = 'Dental';
        dentalProd.IsActive = true;
        pdList.add(dentalProd);
        
        Product2 otherProd = new Product2();
        otherProd.Name = 'Advocacy - Optum health Care Advisor';
        otherProd.Product_Line__c = 'Other';
        otherProd.IsActive = true;
        pdList.add(otherProd);
        
        insert pdList;

		PricebookEntry[] pbeList = new List<PricebookEntry>();         
        PricebookEntry pbe1 = new PricebookEntry();
        pbe1.Pricebook2Id = standardPricebook.Id;
        pbe1.Product2Id = medProd.Id;
        pbe1.UnitPrice = 1000;
        pbe1.IsActive = true;
        pbeList.add(pbe1);
        
        PricebookEntry pbe2 = new PricebookEntry();
        pbe2.Pricebook2Id = standardPricebook.Id;
        pbe2.Product2Id = rxProd.Id;
        pbe2.UnitPrice = 1000;
        pbe2.IsActive = true;
        pbeList.add(pbe2);
        
        PricebookEntry pbe3 = new PricebookEntry();
        pbe3.Pricebook2Id = standardPricebook.Id;
        pbe3.Product2Id = dentalProd.Id;
        pbe3.UnitPrice = 1000;
        pbe3.IsActive = true;
         pbeList.add(pbe3);
        
        PricebookEntry pbe4 = new PricebookEntry();
        pbe4.Pricebook2Id = standardPricebook.Id;
        pbe4.Product2Id = visionProd.Id;
        pbe4.UnitPrice = 1000;
        pbe4.IsActive = true;
        pbeList.add(pbe4);
        
        PricebookEntry pbe5 = new PricebookEntry();
        pbe5.Pricebook2Id = standardPricebook.Id;
        pbe5.Product2Id = otherProd.Id;
        pbe5.UnitPrice = 1000;
        pbe5.IsActive = true;
        pbeList.add(pbe5);
        
        insert pbeList;
        
        Opportunity opp =  new Opportunity();
        opp.AccountId=acc1.Id;
        opp.Name='Test Opportunity CM';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
        opp.EffectiveDate__c = system.today()+60;
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Pharmacy;Dental;Vision;Other Buy Up Programs';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp.Expected_Date_of_RFP__c = system.today();
        opp.StageName = 'Proposal';
        opp.CloseDate=System.today();
        opp.Sales_Stage_Medical__c = 'Notified';
        opp.Sales_Stage_Other__c =  'Notified';
        opp.Anticipated_Actual_Close_Date_Medical__c = system.today();
        opp.Anticipated_Actual_Close_Date_Other__c = system.today();
        opp.Employees_in_the_Proposal_Medical__c  = 100;
        opp.Retirees_in_the_Proposal_Medical__c = 100;
        opp.Members_in_the_Proposal_Medical__c =300;
        opp.Members_QUOTED_in_the_Proposal_Medical__c = 1;
        opp.Disposition_Medical__c = 'Sold';
        opp.Closed_Reason_1_Medical__c = 'Declined to Quote';
        opp.Disposition_Other__c = 'Sold';
        opp.Closed_Reason_1_Other_Buy_Up_Programs__c = 'Dead-RFP no Longer Expected';
        opp.Proactive_Renewal_Incentive_Status__c = 'SS 2023 - Does not Qualify';
        opp.Existing_Members_Risk_Outcome_Pharmacy__c = 'Partial Cancellation';
        opp.Sales_Stage_Pharmacy__c = 'Notified';
        opp.Anticipated_Actual_Close_Date_Pharmacy__c = system.today();
        opp.Disposition_Pharmacy__c = 'Sold';
        opp.Closed_Reason_1_Pharmacy__c = 'Cost: Fees & Fixed Costs';
        opp.Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes';
        insert opp;
        List<OpportunityLineItem> oppLnList = new List<OpportunityLineItem>();
        
        OpportunityLineItem oppItem1 = new OpportunityLineItem();
        oppItem1.OpportunityId = opp.Id;                              
        oppItem1.Estimated_Additional_New_Members__c = 20;
        oppItem1.Existing_Membership_at_Risk__c =100;                                                                                   
        oppItem1.Net_Results__c = 100;
        oppItem1.Sold_Retained_Members__c = 200;
        oppItem1.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem1.PricebookEntryId = pbe1.Id;
        oppItem1.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem1.Quantity = 2;
        oppItem1.TotalPrice = 100;
        oppLnList.add(oppItem1);
        
        OpportunityLineItem oppItem2 = new OpportunityLineItem();
        oppItem2.OpportunityId = opp.Id;                              
        oppItem2.Estimated_Additional_New_Members__c = 10;
        oppItem2.Existing_Membership_at_Risk__c =100;                                                                                   
        oppItem2.Net_Results__c = -100;
        oppItem2.Sold_Retained_Members__c = 0;
        oppItem2.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem2.PricebookEntryId = pbe5.Id;
        oppItem2.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem2.Quantity = 2;
        oppItem2.TotalPrice = 100;
        oppLnList.add(oppItem2);
        
        OpportunityLineItem oppItem3 = new OpportunityLineItem();
        oppItem3.OpportunityId = opp.Id;                              
        oppItem3.Estimated_Additional_New_Members__c = 10;
        oppItem3.Existing_Membership_at_Risk__c =100;                                                                                   
        oppItem3.Net_Results__c = 100;
        oppItem3.Sold_Retained_Members__c = 0;
        oppItem3.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem3.PricebookEntryId = pbe2.Id;
        oppItem3.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem3.Quantity = 2;
        oppItem3.TotalPrice = 100;
        oppLnList.add(oppItem3);
        insert oppLnList;
    }
    
    
    @isTest
    static void test1(){
        Boolean showAll = true;
        List<Account> accList = [SELECT Id,Name FROM Account LIMIT 2];
        Renewal_Checklist__c rc  = [SELECT Id,Name FROM Renewal_Checklist__c LIMIT 1];
        system.debug('accList test class---> '+accList);
        Map<String,String>paraMap = new Map<String,String>();
        paraMap.put('Offshore_Provisions__c','Yes');
        
        system.assertEquals(accList.size(),2);
        
        Test.startTest();
        //renewalChecklistCls.userRole();
        renewalChecklistCls.fetchData(showAll);
        renewalChecklistCls.fetchOppLnItemsData(accList[0].Id, showAll,'SS 2024');
        renewalChecklistCls.sceValidation(accList[0].Id, showAll,'SS 2024');
        //renewalChecklistCls.saveRenewalData(rc,accList[0].Id,'SS 2024');
        renewalChecklistCls.sceValidation(accList[1].Id, showAll,'SS 2024');
        
        showAll = false;
        renewalChecklistCls.fetchData(showAll);
        renewalChecklistCls.fetchOppLnItemsData(accList[0].Id, showAll,'SS 2024');
        renewalChecklistCls.sceValidation(accList[0].Id, showAll,'SS 2024');
        Test.stopTest();
        
        
    }
    
    @isTest
    static void test2(){
        Boolean showAll = true;
        List<Account> accList = [SELECT Id,Name FROM Account LIMIT 2];
        Renewal_Checklist__c rc  = [SELECT Id,Name FROM Renewal_Checklist__c LIMIT 1];
        Map<String,String>paraMap = new Map<String,String>();
        paraMap.put('Offshore_Provisions__c','Yes');
        system.assertEquals(accList.size(),2);
        
        OpportunityLineItem[] oppItemList = [SELECT Id,Product_Line__c FROM OpportunityLineItem LIMIT 3];

        //renewalChecklistCls.saveRenewalData(rc,accList[1].Id,'SS 2024');
        renewalChecklistCls.sceValidation(accList[1].Id, showAll,'SS 2024');
        renewalChecklistCls.sortProductsList(oppItemList);
        
        showAll = false;
        renewalChecklistCls.sceValidation(accList[1].Id, showAll,'SS 2024');
    }

}