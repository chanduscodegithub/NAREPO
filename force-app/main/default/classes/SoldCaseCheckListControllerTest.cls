@isTest
public class SoldCaseCheckListControllerTest {
    @testSetup static void setup() {
        Test.startTest();
        List<Account> accList = new List<Account>();
        List<Opportunity> oppList = new List<Opportunity>();
        List<OpportunityLineItem> oppLiList = new List<OpportunityLineItem>();
        
        Account cDAccount = new Account();
        cDAccount.Name = 'Test CD Accopunt';
        cDAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        cDAccount.Subtype__c = 'Prospect';
        /*cDAccount.BillingCity = 'Bangalore';
        cDAccount.BillingCountry = 'United States';
        cDAccount.BillingState = 'NJ';
        cDAccount.BillingPostalCode = '560036';
        cDAccount.BillingStreet = 'Test Street';*/
        
        Account cDAccount1 = new Account();
        cDAccount1.Name = 'Test CD Accopunt';
        cDAccount1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        cDAccount1.Subtype__c = 'Prospect';
        //cDAccount1.Primary_Situs_State__c = 'NY';
        
        Account account2 = new Account();
        account2.Name = 'Equity Healthcare';
        account2.Subtype__c ='Collaborative Ventures Group (CVG)';
        account2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        
        accList.add(account2);
        accList.add(cDAccount1);
        accList.add(cDAccount);
        
        insert accList;
        
        Opportunity opp =  new Opportunity();
        opp.Name='Test Opportunity CD';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision;Dental';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp.Expected_Date_of_RFP__c = system.today();
        opp.StageName = 'Proposal';
        opp.CloseDate=System.today();
        // opp.BusinessType__c = 'Client Management';
        //opp.Business_Line__c = 'Client Subsidiary';
        opp.Membership_Activity_Type__c = 'Traditional';
        opp.Proposal_Due_Date_Other__c = system.today();
        opp.Proposal_Due_Date_Dental__c = system.today();
        opp.Proposal_Due_Date_Vision__c = system.today();
        opp.Retirees_in_the_Proposal_CI_AP_HI__c = 10;
        opp.Employees_in_the_Proposal_CI_AP_HI__c = 10;
        opp.Reason_for_the_Opportunity_Risk__c = 'RFI';
        opp.Date_the_Dental_Quote_is_Needed_from_UW__c = system.today();
        opp.Date_the_Vision_Quote_is_Needed_from_UW__c = system.today();
        opp.Date_the_CI_APP_HIPP_Quote_is_Needed__c = system.today();
        opp.Sales_Stage_vision__c = 'Notified';
        opp.Sales_Stage_Other__c = 'Notified';
        opp.Sales_Stage_Dental__c = 'Notified';
        opp.Disposition_Dental__c = 'Sold';
        opp.Disposition_Other__c = 'Sold';
        opp.Disposition_Vision__c = 'Sold';
        opp.Closed_Reason_1_Dental__c = 'Cost: Fees & Fixed Costs';
        opp.Closed_Reason_1_Other_Buy_Up_Programs__c='Cost: Fees & Fixed Costs';
        opp.Closed_Reason_1_Vision__c = 'Cost: Fees & Fixed Costs';
        opp.Employees_in_the_Proposal_Dental__c = 10;
        opp.Employees_in_the_Proposal_CI_AP_HI__c = 10;
        opp.Employees_in_the_Proposal_Vision__c = null;
        opp.Retirees_in_the_Proposal_Dental__c =null;
        opp.Retirees_in_the_Proposal_Vision__c = 10;
        opp.AccountId=cDAccount.Id;
        
        
        Opportunity opp1 =  new Opportunity();
        opp1.Name='Test Opportunity CD1';
        opp1.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp1.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        //opp1.EffectiveDate__c = system.today();
        opp1.Product_Type_Involved_in_Opp__c = 'Medical;Vision;Dental';
        opp1.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp1.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp1.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp1.Expected_Date_of_RFP__c = system.today();
        opp1.StageName = 'Proposal';
        opp1.CloseDate=System.today();
        // opp.BusinessType__c = 'Client Management';
        //opp.Business_Line__c = 'Client Subsidiary';
        opp1.Membership_Activity_Type__c = 'Traditional';
        opp1.Proposal_Due_Date_Other__c = system.today();
        opp1.Proposal_Due_Date_Dental__c = system.today();
        opp1.Proposal_Due_Date_Vision__c = system.today();
        opp1.Retirees_in_the_Proposal_CI_AP_HI__c = 10;
        opp1.Employees_in_the_Proposal_CI_AP_HI__c = 10;
        opp1.Reason_for_the_Opportunity_Risk__c = 'RFI';
        opp1.Date_the_Dental_Quote_is_Needed_from_UW__c = system.today();
        opp1.Date_the_Vision_Quote_is_Needed_from_UW__c = system.today();
        opp1.Date_the_CI_APP_HIPP_Quote_is_Needed__c = system.today();
        opp1.Sales_Stage_vision__c = 'Notified';
        opp1.Sales_Stage_Other__c = 'Notified';
        opp1.Sales_Stage_Dental__c = 'Notified';
        opp1.Disposition_Dental__c = 'Sold';
        opp1.Disposition_Other__c = 'Sold';
        opp1.Disposition_Vision__c = 'Sold';
        opp1.Closed_Reason_1_Dental__c = 'Cost: Fees & Fixed Costs';
        opp1.Closed_Reason_1_Other_Buy_Up_Programs__c='Cost: Fees & Fixed Costs';
        opp1.Closed_Reason_1_Vision__c = 'Cost: Fees & Fixed Costs';
        opp1.Employees_in_the_Proposal_Dental__c = 10;
        opp1.Employees_in_the_Proposal_CI_AP_HI__c = 10;
        opp1.Employees_in_the_Proposal_Vision__c = null;
        opp1.Retirees_in_the_Proposal_Dental__c =null;
        opp1.Retirees_in_the_Proposal_Vision__c = 10;
        opp1.AccountId=cDAccount1.Id;
        
        oppList.add(opp1);
        oppList.add(opp);
        
        insert oppList;
        
        PriceBook2 book2 = new PriceBook2();
        book2.Name = 'Test book2';
        insert book2;
        List<Product2> productsList = new List<Product2>();
        for(Integer i=0;i<1;i++){
            productsList.add(new Product2(
                Name = 'Traditional In-Network Only Plan (Choice)',
                IsActive = true,
                Considered_For_StepWise_Integration__c = 'Yes',
                StepWise_Product_Name__c = 'Test step wise product',
                StepWise_Product_RowID__c = 'A123456'+i
            ));
        }
        insert productsList;
        
        productsList[0].Product_Line__c = 'Vision';
        
        update productsList;
        
        List<PricebookEntry> pbe = new List<PricebookEntry>();
        for(Integer i=0;i<1;i++){
            pbe.add(new PricebookEntry(Pricebook2Id = book2.Id, Product2Id = productsList[0].Id, UnitPrice = 1000, IsActive = true  ));
            pbe[i].Pricebook2Id=Test.getStandardPricebookId();
        }
        insert pbe; 
        
        PriceBook2 book3 = new PriceBook2();
        book3.Name = 'Test book2';
        insert book3;
        List<Product2> productsList1 = new List<Product2>();
        for(Integer i=0;i<1;i++){
            productsList1.add(new Product2(
                Name = 'Traditional In-&-Out of Network Plan (Choice Plus)',
                IsActive = true,
                Considered_For_StepWise_Integration__c = 'Yes',
                StepWise_Product_Name__c = 'Test step wise producttwo',
                StepWise_Product_RowID__c = 'A1234567'+i
            ));
        }
        insert productsList1;
        
        productsList1[0].Product_Line__c = 'Vision';
        
        update productsList;
        
        List<PricebookEntry> pbe1 = new List<PricebookEntry>();
        for(Integer i=0;i<1;i++){
            pbe1.add(new PricebookEntry(Pricebook2Id = book3.Id, Product2Id = productsList1[i].Id, UnitPrice = 1000, IsActive = true  ));
            pbe1[i].Pricebook2Id=Test.getStandardPricebookId();
        }
        insert pbe1;
        
        OpportunityLineItem oppItem1 = new OpportunityLineItem();
        oppItem1.OpportunityId = opp1.Id;                              
        oppItem1.Estimated_Additional_New_Members__c = 20;
        oppItem1.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem1.Net_Results__c = -80;
        oppItem1.Sold_Retained_Members__c = 20;
        oppItem1.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem1.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem1.Quantity = 2;
        oppItem1.TotalPrice = 100;
        oppItem1.PricebookEntryId = pbe1[0].Id;
        insert oppItem1;
        
        OpportunityLineItem oppItem = new OpportunityLineItem();
        oppItem.OpportunityId = opp.Id;                              
        oppItem.Estimated_Additional_New_Members__c = 20;
        oppItem.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem.Net_Results__c = -80;
        //oppItem.Sold_Retained_Members__c = 20;
        oppItem.Existing_Members_Involved_in_the_Bid__c = 00;
        oppItem.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem.Quantity = 2;
        oppItem.TotalPrice = 100;
        oppItem.PricebookEntryId = pbe[0].Id;
        insert oppItem;
        
        oppLiList.add(oppItem);
        oppLiList.add(oppItem1);
        
        Test.stopTest();
        
    }
    @isTest static void testMethod1() {
        Opportunity opp = [select Id from Opportunity where name='Test Opportunity CD' LIMIT 1];
        Test.startTest();
        SoldCaseCheckListController.getTheXMLFileFromSR(opp.Id);
        Test.stopTest();
    }
    @isTest static void testMethod2() {
        
        Opportunity opp = [select Id from Opportunity where name='Test Opportunity CD1' LIMIT 1];
        Test.startTest();
        SoldCaseCheckListController.getTheXMLFileFromSR(opp.Id);
        Test.stopTest();
    }
}