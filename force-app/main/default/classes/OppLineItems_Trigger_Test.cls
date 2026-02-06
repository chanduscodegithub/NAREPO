@isTest
public class OppLineItems_Trigger_Test {
    static testMethod void testMethod1(){
        test.startTest();
        List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();
        Map<Id,OpportunityLineItem> oliMap = new Map<Id,OpportunityLineItem>();
        Id accRecordTypeId = [Select id,name from RecordType where RecordType.Name = 'Prospect'].Id;
        Id oppRecordTypeId = [Select id,name from RecordType where RecordType.DeveloperName = 'CD'].Id;
        
        Account cDAccEquity = new Account();
        cDAccEquity.Name = 'Equity Healthcare';
        cDAccEquity.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        cDAccEquity.Subtype__c = 'Collaborative Ventures Group (CVG)';
        insert cDAccEquity;
        
        Account acc = new Account();
        acc.Name = 'Test Method Account';       
        acc.RecordTypeId = accRecordTypeId; 
        insert acc;
        
        Opportunity opp = new Opportunity();
        opp.name = 'Test Method Opportunity';
        opp.RecordTypeId = oppRecordTypeId;
        opp.AccountId = acc.Id;
        opp.EffectiveDate__c = system.today();
        opp.BusinessType__c = 'Client Development';
        opp.Product_Type_Involved_in_Opp__c = 'Medical'; 
        opp.Sales_Stage_Medical__c = 'Notified';
        opp.Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal';
        opp.Disposition_Medical__c = 'Sold';
        opp.Existing_Members_Risk_Outcome_Medical__c = 'Retained';     
        opp.Closed_Reason_1_Medical__c = 'Dead: Shifting Priorities';
        opp.Employees_in_the_Proposal_Medical__c = 5;
        opp.Members_in_the_Proposal_Medical__c = 6;
        opp.Members_QUOTED_in_the_Proposal_Medical__c = 7;
        opp.StageName = 'Open';
        opp.CloseDate = System.today();     
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes';
        opp.Exchanges_the_Company_is_Looking_At__c = 'RightOpt';
        opp.Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes';
        opp.Does_this_Oppty_Risk_Involve_Consultant__c = 'Yes';
        opp.Has_a_Formal_RFP_Been_Issued__c = 'Yes';
        opp.Is_There_Existing_Membership_at_Risk__c = 'Yes';
        opp.Primary_Risk_Reason__c = 'Affordability';
        opp.Can_the_Membership_Move_Without_a_Bid__c = 'Yes';      
        opp.Estimated_Membership_Impact__c = 'Full';
        opp.Secondary_Risk_Reason__c = 'Competition';
        opp.Proactive_Renewal_Underwriter__c = 'Adam R Cohen';
        opp.Is_email_sent_to_implementation_team__c = false;
        insert opp;                
        		
    	Product2 prod = new Product2(Name = 'Anti-infectives 2007', Family = 'Best Practices', IsActive = true, Product_Line__c = 'Other');
    	insert prod;

        PricebookEntry standardPrice = new PricebookEntry(Pricebook2Id = Test.getStandardPricebookId(), Product2Id = prod.Id, UnitPrice = 10000, IsActive = true);
        insert standardPrice;
        
        OpportunityLineItem oli = new OpportunityLineItem();
        oli.PricebookEntryId = standardPrice.Id;
        oli.Product2Id = prod.Id;
        oli.Quantity = 10;
        oli.OpportunityId = opp.Id;
        oli.TotalPrice = 20;
        oli.Disposition_Other_Buy_Up_Programs__c = 'Sold';
        oliList.add(oli);
        insert oliList;  
        
        OpportunityLineItem oppLIUpdate = new OpportunityLineItem();
        oppLIUpdate.Id = oliList[0].Id;
        oppLIUpdate.Disposition_Other_Buy_Up_Programs__c = 'Dead';
        update oppLIUpdate;
        
        OpportunityLineItem oppLIUpdate2 = new OpportunityLineItem();
        oppLIUpdate2.Id = oliList[0].Id;
        oppLIUpdate2.Disposition_Other_Buy_Up_Programs__c = 'Sold';
        oppLIUpdate2.Sold_Retained_Members__c = 10;
        update oppLIUpdate2;
        
        OpportunityLineItem oppLIDelete = new OpportunityLineItem();
        oppLIDelete.Id = oliList[0].Id;
        delete oppLIDelete;
             
        test.stopTest();
    }
    
    static testMethod void testMethod2(){
        test.startTest();
        List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();
        Map<Id,OpportunityLineItem> oliMap = new Map<Id,OpportunityLineItem>();
        Id accRecordTypeId = [Select id,name from RecordType where RecordType.Name = 'Prospect'].Id;
        Id oppRecordTypeId = [Select id,name from RecordType where RecordType.DeveloperName = 'CD'].Id;
        
        Account cDAccEquity = new Account();
        cDAccEquity.Name = 'Equity Healthcare';
        cDAccEquity.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        cDAccEquity.Subtype__c = 'Collaborative Ventures Group (CVG)';
        insert cDAccEquity;
        
        Account acc = new Account();
        acc.Name = 'Test Method Account';       
        acc.RecordTypeId = accRecordTypeId; 
        insert acc;
        
        Opportunity opp = new Opportunity();
        opp.name = 'Test Method Opportunity';
        opp.RecordTypeId = oppRecordTypeId;
        opp.AccountId = acc.Id;
        opp.EffectiveDate__c = system.today();
        opp.BusinessType__c = 'Client Development';
        opp.Product_Type_Involved_in_Opp__c = 'Medical'; 
        opp.Sales_Stage_Medical__c = 'Notified';
        opp.Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal';
        opp.Disposition_Medical__c = 'Sold';
        opp.Existing_Members_Risk_Outcome_Medical__c = 'Retained';     
        opp.Closed_Reason_1_Medical__c = 'Dead: Shifting Priorities';
        opp.Employees_in_the_Proposal_Medical__c = 5;
        opp.Members_in_the_Proposal_Medical__c = 6;
        opp.Members_QUOTED_in_the_Proposal_Medical__c = 7;
        opp.StageName = 'Open';
        opp.CloseDate = System.today();     
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes';
        opp.Exchanges_the_Company_is_Looking_At__c = 'RightOpt';
        opp.Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes';
        opp.Does_this_Oppty_Risk_Involve_Consultant__c = 'Yes';
        opp.Has_a_Formal_RFP_Been_Issued__c = 'Yes';
        opp.Is_There_Existing_Membership_at_Risk__c = 'Yes';
        opp.Primary_Risk_Reason__c = 'Affordability';
        opp.Can_the_Membership_Move_Without_a_Bid__c = 'Yes';      
        opp.Estimated_Membership_Impact__c = 'Full';
        opp.Secondary_Risk_Reason__c = 'Competition';
        opp.Proactive_Renewal_Underwriter__c = 'Adam R Cohen';
        opp.Is_email_sent_to_implementation_team__c = false;
        insert opp;                
        		
    	Product2 prod = new Product2(Name = 'Anti-infectives 2007', Family = 'Best Practices', IsActive = true, Product_Line__c = 'Medical');
    	insert prod;

        PricebookEntry standardPrice = new PricebookEntry(Pricebook2Id = Test.getStandardPricebookId(), Product2Id = prod.Id, UnitPrice = 10000, IsActive = true);
        insert standardPrice;
        
        OpportunityLineItem oli = new OpportunityLineItem();
        oli.PricebookEntryId = standardPrice.Id;
        oli.Product2Id = prod.Id;
        oli.Quantity = 10;
        oli.OpportunityId = opp.Id;
        oli.TotalPrice = 20;
        oli.Disposition_Other_Buy_Up_Programs__c = 'Sold';
        oli.Sold_Retained_Members__c = 30;
        oliList.add(oli);
        insert oliList;  
        
        OpportunityLineItem oppLIUpdate = new OpportunityLineItem();
        oppLIUpdate.Id = oliList[0].Id;
        oppLIUpdate.Disposition_Other_Buy_Up_Programs__c = 'Dead';
        oppLIUpdate.Sold_Retained_Members__c = 20;
        update oppLIUpdate;
        
        OpportunityLineItem oppLIUpdate2 = new OpportunityLineItem();
        oppLIUpdate2.Id = oliList[0].Id;
        oppLIUpdate2.Disposition_Other_Buy_Up_Programs__c = 'Sold';
        oppLIUpdate2.Sold_Retained_Members__c = 10;
        update oppLIUpdate2;
        
        OpportunityLineItem oppLIDelete = new OpportunityLineItem();
        oppLIDelete.Id = oliList[0].Id;
        delete oppLIDelete;
             
        test.stopTest();
    }
}