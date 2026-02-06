@isTest
public class OpportunityTriggerHandlerTest {
    @isTest
    static void testPopulateSalesDebriefOnBeforeUpdate() {
        Id oppRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CD Membership Activity (Prospect or Aggregator)').getRecordTypeId();
        List<Opportunity> oppList = new List<Opportunity>();
        
        Account account = new Account();
        account.Name = 'Opp Trigger Test Account';
        account.Subtype__c ='Prospect';
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert account;
        
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
        
        oppList.add(opp1);
        oppList.add(opp2);
        
        insert oppList;
        
        Id pricebookId = Test.getStandardPricebookId();
        
        Product2 prod = new Product2(
            Name = 'Test Vision Product',
            Product_Line__c = 'Vision',
            Family = 'Specialty Products',
            ProductCode = 'Pro-X',
            isActive = true
        );
        insert prod;
        
        PricebookEntry pbEntry = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = prod.Id,
            UnitPrice = 100.00,
            IsActive = true
        );
        insert pbEntry;
        
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp2.Id,
            Quantity = 5,
            PricebookEntryId = pbEntry.Id,
            TotalPrice = 100
        );
        insert oli;
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
}