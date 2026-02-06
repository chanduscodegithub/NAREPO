@isTest
public class OLI_CPWHandlerTest {

    @testSetup
    static void setupData() {

        // -------------------------------------------------------
        // 1. Create Metadata Record (CPW_Product_Checklist_Metadata__mdt)
        // -------------------------------------------------------
        CPW_Product_Checklist_Metadata__mdt md = [
            SELECT Product_Code__c, Field_API_Name__c 
            FROM CPW_Product_Checklist_Metadata__mdt
            LIMIT 1
        ];
        System.assertNotEquals(null, md, 'CMDT record was not found. Add CMDT via deployment.');

        // -------------------------------------------------------
        // 2. Create Account
        // -------------------------------------------------------
        Account acc = new Account(
            Name = 'Test Account',
            Subtype__c ='Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );
        insert acc;

        // -------------------------------------------------------
        // 3. Create Opportunity
        // -------------------------------------------------------
        Opportunity opp = new Opportunity(
            Name = 'Test Opp',
            StageName = 'Qualification',
            CloseDate = System.today(),
            AccountId = acc.Id,
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Medical,Vision,Pharmacy,Dental,Vision,Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            Platforms_Sold__c = 'SUREST',
            Sales_Stage_Medical__c = 'Notified', Disposition_Medical__c = 'Sold', Anticipated_Actual_Close_Date_Medical__c= Date.newInstance(2020, 5, 7), Closed_Reason_1_Medical__c= 'Network: Access',
            Sales_Stage_Dental__c = 'Notified', Disposition_Dental__c = 'Sold', Anticipated_Actual_Close_Date_Dental__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Dental__c = 'Network: Access',
            Sales_Stage_Vision__c = 'Notified', Disposition_Vision__c = 'Sold', Anticipated_Actual_Close_Date_Vision__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Vision__c= 'Network: Access',
            Sales_Stage_Pharmacy__c = 'Notified', Disposition_Pharmacy__c = 'Sold', Anticipated_Actual_Close_Date_Pharmacy__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Pharmacy__c= 'Network: Access',
            Sales_Stage_Other__c = 'Notified', Anticipated_Actual_Close_Date_Other__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Other_Buy_Up_Programs__c= 'Network: Access'
       
        );
        insert opp;

        // -------------------------------------------------------
        // 4. Create SCC (Sold_Case_Checklist)
        // -------------------------------------------------------
        Sold_Case_Checklist__c scc = new Sold_Case_Checklist__c(
            Name = 'Test SCC',
            Membership_Activity__c = opp.Id
        );
        insert scc;

        // -------------------------------------------------------
        // 5. Create PCC (Renewal_Checklist)
        // -------------------------------------------------------
        Renewal_Checklist__c pcc = new Renewal_Checklist__c(
            Company__c = acc.Id
        );
        insert pcc;

        // -------------------------------------------------------
        // 6. Create Product and PricebookEntry
        // -------------------------------------------------------
        Id stdPbId = Test.getStandardPricebookId();

        Product2 prod = new Product2(
            Name = 'Real APL Prod',
            ProductCode = 'TWS-REALAPL',
            IsActive = true,
            Product_Line__c = 'Other'
        );
        insert prod;

        PricebookEntry pbe = new PricebookEntry(
            Pricebook2Id = stdPbId,
            Product2Id = prod.Id,
            UnitPrice = 100,
            IsActive = true
        );
        insert pbe;

        // -------------------------------------------------------
        // 7. Create OpportunityLineItem
        // -------------------------------------------------------
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Product2Id = prod.Id,
            Quantity = 1,
            TotalPrice = 100,
            PricebookEntryId = pbe.Id,
            Disposition_Other_Buy_Up_Programs__c = 'Sold',
            Buyup_Product_Selection__c = 'Surest Only'
            
        );
        insert oli;
    }

    @isTest
    static void testSyncCPWFields() {

        // Fetch data
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];
        OpportunityLineItem oli = [SELECT Id, Disposition_Other_Buy_Up_Programs__c
                                   FROM OpportunityLineItem LIMIT 1];

        // -------------------------------------------------------
        // Build Old OLI Map (simulate update trigger context)
        // -------------------------------------------------------
        Map<Id, OpportunityLineItem> oldMap = new Map<Id, OpportunityLineItem>();
        OpportunityLineItem oldOli = oli.clone(false, true, false, false);
        oldOli.Disposition_Other_Buy_Up_Programs__c = 'Not Sold';
        oldMap.put(oli.Id, oldOli);

        // -------------------------------------------------------
        // Run Method
        // -------------------------------------------------------
        Test.startTest();
        OLI_CPWHandler.syncCPWFields(
            new Set<Id>{ opp.Id },
            oldMap
        );
        Test.stopTest();

    }
}