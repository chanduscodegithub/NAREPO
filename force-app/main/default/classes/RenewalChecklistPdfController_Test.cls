@isTest
public class RenewalChecklistPdfController_Test {
    
    @testSetup
    static void testSetup(){
        Account acc1 = new Account();
        acc1.Name = 'Test Renewal Acccount 1';
        acc1.UHC_Medical_Members__c = 1;
        acc1.Subtype__c = 'CVG';
        acc1.Surest_Members__c = 100;
        acc1.Pending_Term_Client__c = false;
        acc1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        acc1.CMVPCRRVP__c = UserInfo.getUserId();
        insert acc1;
        
        Account acc2 = new Account();
        acc2.Name = 'Test Renewal Acccount 2';
        acc2.UHC_Medical_Members__c = 1;
        acc2.Subtype__c = 'CVG';
        acc2.Surest_Members__c = 10;
        acc2.Pending_Term_Client__c = false;
        acc2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        acc2.CMVPCRRVP__c = UserInfo.getUserId();
        insert acc2;
        
        Account acc3 = new Account();
        acc3.Name = 'Test Renewal Acccount 3';
        acc3.UHC_Medical_Members__c = 1;
        acc3.Subtype__c = 'Surest Only';  //CR-3939 Prathima
        acc3.Surest_Members__c = 20;
        acc3.Pending_Term_Client__c = false;
        acc3.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        acc3.CMVPCRRVP__c = UserInfo.getUserId();
        insert acc3;
        
        Renewal_Checklist__c rc = new Renewal_Checklist__c();
        rc.Company__c = acc1.Id;
        rc.High_performing_network__c = 'No';
        rc.Sales_Season__c = 'SS 2024';
        rc.Payment_Integrity_Bundles_Surest__c	='Simplified Option 1';
        insert rc;
        
        Renewal_Checklist__c rc2 = new Renewal_Checklist__c();
        rc2.Company__c = acc2.Id;
        rc2.High_performing_network__c = 'Yes';
        rc2.High_performing_network_Additional__c = 'UHC Preventative';
        rc2.Sales_Season__c = 'SS 2024';
        rc.Payment_Integrity_Bundles_Surest__c	='Simplified Option 1';
        insert rc2;
        
        Renewal_Checklist__c rc3 = new Renewal_Checklist__c();
        rc3.Company__c = acc3.Id;
        rc3.High_performing_network__c = 'Yes';
        rc3.High_performing_network_Additional__c = 'UHC Preventative';
        rc3.Payment_Integrity_Bundles__c = 'Legacy Option 1';
        rc3.Sales_Season__c = 'SS 2024';
        rc.Payment_Integrity_Bundles_Surest__c	='Simplified Option 1';
        insert rc3;
        Id PriceBook2Id = Test.getStandardPricebookId();
        
         Product2 prod = new Product2(Name = 'Test Product', ProductCode = 'BH-BHSP1', Surest_Applicable_Products__c = 'Available for Surest only with UNET');
        insert prod;
        
        PricebookEntry pbe = new PricebookEntry(
            Product2Id = prod.Id,
            Pricebook2Id = PriceBook2Id,
            UnitPrice = 100,
            IsActive = true
        );
        insert pbe;

        // OpportunityLineItem
        Opportunity opp = new Opportunity(Name='Test Opp', StageName='Closed Won',AccountId = acc1.Id,Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Medical,Vision,Pharmacy,Dental,Vision,Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true, CloseDate=Date.today(),Pricebook2Id = PriceBook2Id
);
        insert opp;

        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp.Id,
            Product2Id = prod.Id,
            Quantity = 1,
            UnitPrice = 100,
            PricebookEntryId = pbe.Id,
            Buyup_Product_Selection__c = 'Surest & UNET',
            Disposition_Other_Buy_Up_Programs__c = 'Sold',
            Sold_Retained_Members__c = 10
        );
        insert oli;
        
        
        List<OpportunityLineItem> oppLnList = new List<OpportunityLineItem>();
        
        OpportunityLineItem oppItem1 = new OpportunityLineItem();
        oppItem1.OpportunityId = opp.Id;                              
        oppItem1.Estimated_Additional_New_Members__c = 20;
        oppItem1.Existing_Membership_at_Risk__c =100;                                                                                   
        oppItem1.Net_Results__c = 100;
        oppItem1.Sold_Retained_Members__c = 200;
        oppItem1.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem1.PricebookEntryId = pbe.Id;
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
        oppItem2.PricebookEntryId = pbe.Id;
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
        oppItem3.PricebookEntryId = pbe.Id;
        oppItem3.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem3.Quantity = 2;
        oppItem3.TotalPrice = 100;
        oppLnList.add(oppItem3);
        insert oppLnList;

        Service_AMT__c amt = new Service_AMT__c(Name = 'Test CM', Contact_Role__c = 'Client Manager',Company__c=acc1.Id);
        insert amt;
        
        Service_AMT__c amt1 = new Service_AMT__c(Name = 'Test CM', Contact_Role__c = 'Surest Client Manager',Company__c=acc1.Id);
        insert amt1;
        
        Service_AMT__c amt2 = new Service_AMT__c(Name = 'Test CM', Contact_Role__c = 'Surest Account Partner',Company__c=acc1.Id);
        insert amt2;
        
        Policy_Information__c policy = new Policy_Information__c(
            Name = 'Policy 1',
            Policy__c = 'P-123',
            Policy_Type__c = 'Medical;Dental',
            Policy_Status__c = 'Active',
            Surest__c = true,
            Company__c = acc1.Id
        );
        insert policy;

        
}
    
    @isTest
    public static  void testGeneratePdf(){
        
        Account[] acc = [SELECT Id FROM Account WHERE Name ='Test Renewal Acccount 1'  LIMIT 1];
        String accId = acc[0].Id;
        String showAllData = 'true';
        String currentCS = 'SS 2024';
        PageReference pageRef = Page.RenewalChecklistPdf;
        pageRef.getParameters().put('recordId',accId);
        pageRef.getParameters().put('showAllData',showAllData);
        pageRef.getParameters().put('currentSS',currentCS);
        test.setCurrentPageReference(pageRef);
        RenewalChecklistPdfController obj = new RenewalChecklistPdfController();
        system.assertEquals(1, acc.size());
    }
    
    @isTest
    public static  void testGeneratePdf2(){
        
        Account[] acc = [SELECT Id FROM Account WHERE Name ='Test Renewal Acccount 2'  LIMIT 1];
        String accId = acc[0].Id;
        String showAllData = 'true';
        String currentCS = 'SS 2024';
        PageReference pageRef = Page.RenewalChecklistPdf;
        pageRef.getParameters().put('recordId',accId);
        pageRef.getParameters().put('showAllData',showAllData);
        pageRef.getParameters().put('currentSS',currentCS);
        test.setCurrentPageReference(pageRef);
        system.assertEquals(1, acc.size());
        RenewalChecklistPdfController obj = new RenewalChecklistPdfController();
    }
    
    @isTest
    public static  void testGeneratePdf3(){
        
        Account[] acc = [SELECT Id FROM Account WHERE Name ='Test Renewal Acccount 3'  LIMIT 1];
        String accId = acc[0].Id;
        String showAllData = 'true';
        String currentCS = 'SS 2024';
        PageReference pageRef = Page.RenewalChecklistPdf;
        pageRef.getParameters().put('recordId',accId);
        pageRef.getParameters().put('showAllData',showAllData);
        pageRef.getParameters().put('currentSS',currentCS);
        test.setCurrentPageReference(pageRef);
        system.assertEquals(1, acc.size());
        RenewalChecklistPdfController obj = new RenewalChecklistPdfController();
    }
    
}