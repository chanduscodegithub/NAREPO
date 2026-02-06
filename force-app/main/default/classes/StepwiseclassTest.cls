@isTest
public class StepwiseclassTest {
    @testSetup static void setup() {
        Id cmAccountId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(); 
        Id cdAccountId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        
        Account accCM = new Account();
        accCM.Name = 'Competitive Medical CM';
        accCM.Subtype__c ='Specialty Benefits Only';
       	accCM.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM;
        
        Account cDAccount = new Account();
        cDAccount.Name = 'Test CD Accopunt';
        cDAccount.RecordTypeId = cdAccountId;
        cDAccount.Subtype__c = 'Prospect';
        insert cDAccount;
        
        Account cdAccE = new Account();
        cdAccE.Name = 'Equity Healthcare';
        cdAccE.Subtype__c ='Business Group on Health (BGH)';
        cdAccE.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        insert cdAccE;
        
        DateTime yourDate = Datetime.now();
        String dateOutput = yourDate.format('M/d/yyyy');
        System.debug('Debug: '+dateOutput);
        
       // Date formDate = Date.valueof(dateOutput);
        list<Opportunity> ol =new list<Opportunity>();
        Opportunity opp =  new Opportunity();
        opp.Name='Test Opportunity CD';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
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
        opp.Sales_Stage_vision__c = 'Proposal';
        opp.Sales_Stage_Other__c = 'Proposal';
        opp.Sales_Stage_Dental__c = 'Proposal';
        opp.Employees_in_the_Proposal_Dental__c = 10;
        opp.Employees_in_the_Proposal_CI_AP_HI__c = 10;
        opp.Employees_in_the_Proposal_Vision__c = null;
        opp.Retirees_in_the_Proposal_Dental__c =null;
        opp.Retirees_in_the_Proposal_Vision__c = 10;
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp.AccountId=cDAccount.Id;
        ol.add(opp);
        
        Opportunity opp2 =  new Opportunity();
        opp2.Name='Test Opportunity CM';
        opp2.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
        opp2.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp2.EffectiveDate__c = system.today();
        opp2.Product_Type_Involved_in_Opp__c = 'Medical;Vision;Dental';
        opp2.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp2.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp2.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp2.Expected_Date_of_RFP__c = system.today();
        opp2.StageName = 'Proposal';
        opp2.CloseDate=System.today();
        opp2.BusinessType__c = 'Client Management';
        opp2.Business_Line__c = 'Client Subsidiary';
        opp2.Membership_Activity_Type__c = 'Traditional';
        opp2.Proposal_Due_Date_Other__c = system.today();
        opp2.Proposal_Due_Date_Dental__c = system.today();
        opp2.Proposal_Due_Date_Vision__c = system.today();
        opp2.Retirees_in_the_Proposal_CI_AP_HI__c = 10;
        opp2.Employees_in_the_Proposal_CI_AP_HI__c = 10;
        opp2.Reason_for_the_Opportunity_Risk__c = 'RFI';
        opp2.Date_the_Dental_Quote_is_Needed_from_UW__c = system.today();
        opp2.Date_the_Vision_Quote_is_Needed_from_UW__c = system.today();
        opp2.Date_the_CI_APP_HIPP_Quote_is_Needed__c = system.today();
        opp2.Sales_Stage_vision__c = 'Proposal';
        opp2.Sales_Stage_Other__c = 'Proposal';
        opp2.Sales_Stage_Dental__c = 'Proposal';
        opp2.Employees_in_the_Proposal_Dental__c = 10;
        opp2.Employees_in_the_Proposal_CI_AP_HI__c = 10;
        opp2.Employees_in_the_Proposal_Vision__c = null;
        opp2.Retirees_in_the_Proposal_Dental__c =null;
        opp2.Retirees_in_the_Proposal_Vision__c = 10;
        opp2.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
        opp2.AccountId=accCM.Id;
        ol.add(opp2);
        insert ol;
        
       }
    @isTest static void testMethod1() {
        Account acc = [select Id from Account where name='Test CD Accopunt'];
        Opportunity opp = [select Id from Opportunity where name='Test Opportunity CD'];
        Opportunity oppCm = [select Id from Opportunity where name='Test Opportunity CM'];
       
        PriceBook2 book2 = new PriceBook2();
        book2.Name = 'Test book2';
        insert book2;
        List<Product2> productsList = new List<Product2>();
        for(Integer i=0;i<6;i++){
            productsList.add(new Product2(
                Name = 'Test Product'+i,
                IsActive = true,
                Considered_For_StepWise_Integration__c = 'Yes',
                StepWise_Product_Name__c = 'Test step wise product',
                StepWise_Product_RowID__c = 'A123456'+i
            ));
        }
        insert productsList;
        
        productsList[0].Product_Line__c = 'Vision';
        productsList[1].Product_Line__c = 'Dental';
        productsList[2].Product_Line__c = 'Other';
        productsList[3].Product_Line__c = 'Vision';
        productsList[4].Product_Line__c = 'Dental';
        productsList[5].Product_Line__c = 'Other';
       
        
        update productsList;
        
        List<PricebookEntry> pbe = new List<PricebookEntry>();
        for(Integer i=0;i<6;i++){
            pbe.add(new PricebookEntry(Pricebook2Id = book2.Id, Product2Id = productsList[i].Id, UnitPrice = 1000, IsActive = true  ));
            pbe[i].Pricebook2Id=Test.getStandardPricebookId();
        }
        insert pbe; 
        
        list<OpportunityLineItem> oli =new list<OpportunityLineItem>();
        OpportunityLineItem oppItem = new OpportunityLineItem();
        oppItem.OpportunityId = opp.Id;     
        oppItem.Estimated_Additional_New_Members__c = 20;
        oppItem.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem.Net_Results__c = -80;
        oppItem.Sold_Retained_Members__c = 20;
        oppItem.Existing_Members_Involved_in_the_Bid__c = 00;
        oppItem.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem.Quantity = 2;
        oppItem.TotalPrice = 100;
        oppItem.PricebookEntryId = pbe[0].Id;
        oli.add(oppItem);
        
        
        OpportunityLineItem oppItem1 = new OpportunityLineItem();
        oppItem1.OpportunityId = opp.Id;                              
        oppItem1.Estimated_Additional_New_Members__c = 20;
        oppItem1.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem1.Net_Results__c = -80;
        oppItem1.Sold_Retained_Members__c = 20;
        oppItem1.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem1.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem1.Quantity = 2;
        oppItem1.TotalPrice = 100;
        oppItem1.PricebookEntryId = pbe[1].Id;
        //insert oppItem1;
        oli.add(oppItem1);
        OpportunityLineItem oppItem2 = new OpportunityLineItem();
        oppItem2.OpportunityId = opp.Id;                              
        oppItem2.Estimated_Additional_New_Members__c = 20;
        oppItem2.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem2.Net_Results__c = -80;
        oppItem2.Sold_Retained_Members__c = 20;
        oppItem2.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem2.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem2.Quantity = 2;
        oppItem2.TotalPrice = 100;
        oppItem2.PricebookEntryId = pbe[2].Id;
        //insert oppItem2;
        oli.add(oppItem2);
        
        
         OpportunityLineItem oppItem3 = new OpportunityLineItem();
        oppItem3.OpportunityId = opp.Id;                              
        oppItem3.Estimated_Additional_New_Members__c = 20;
        oppItem3.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem3.Net_Results__c = -80;
        oppItem3.Sold_Retained_Members__c = 20;
        oppItem3.Existing_Members_Involved_in_the_Bid__c = 00;
        oppItem3.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem3.Quantity = 2;
        oppItem3.TotalPrice = 100;
        oppItem3.PricebookEntryId = pbe[3].Id;
        //insert oppItem3;
        oli.add(oppItem3);
        
        OpportunityLineItem oppItem4 = new OpportunityLineItem();
        oppItem4.OpportunityId = opp.Id;                              
        oppItem4.Estimated_Additional_New_Members__c = 20;
        oppItem4.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem4.Net_Results__c = -80;
        oppItem4.Sold_Retained_Members__c = 20;
        oppItem4.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem4.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem4.Quantity = 2;
        oppItem4.TotalPrice = 100;
        oppItem4.PricebookEntryId = pbe[4].Id;
        oli.add(oppItem4);
        
        OpportunityLineItem oppItem5 = new OpportunityLineItem();
        oppItem5.OpportunityId = opp.Id;                              
        oppItem5.Estimated_Additional_New_Members__c = 20;
        oppItem5.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem5.Net_Results__c = -80;
        oppItem5.Sold_Retained_Members__c = 20;
        oppItem5.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem5.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem5.Quantity = 2;
        oppItem5.TotalPrice = 100;
        oppItem5.PricebookEntryId = pbe[5].Id;
        oli.add(oppItem5);
        
        OpportunityLineItem oppItem6 = new OpportunityLineItem();
        oppItem6.OpportunityId = oppCm.Id;     
        oppItem6.Estimated_Additional_New_Members__c = 20;
        oppItem6.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem6.Net_Results__c = -80;
        oppItem6.Sold_Retained_Members__c = 20;
        oppItem6.Existing_Members_Involved_in_the_Bid__c = 00;
        oppItem6.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem6.Quantity = 2;
        oppItem6.TotalPrice = 100;
        oppItem6.PricebookEntryId = pbe[0].Id;
        oli.add(oppItem6);
        
        
        OpportunityLineItem oppItem7 = new OpportunityLineItem();
        oppItem7.OpportunityId = oppCm.Id;                              
        oppItem7.Estimated_Additional_New_Members__c = 20;
        oppItem7.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem7.Net_Results__c = -80;
        oppItem7.Sold_Retained_Members__c = 20;
        oppItem7.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem7.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem7.Quantity = 2;
        oppItem7.TotalPrice = 100;
        oppItem7.PricebookEntryId = pbe[1].Id;
        oli.add(oppItem7);
        
        OpportunityLineItem oppItem8 = new OpportunityLineItem();
        oppItem8.OpportunityId = oppCm.Id;                              
        oppItem8.Estimated_Additional_New_Members__c = 20;
        oppItem8.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem8.Net_Results__c = -80;
        oppItem8.Sold_Retained_Members__c = 20;
        oppItem8.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem8.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem8.Quantity = 2;
        oppItem8.TotalPrice = 100;
        oppItem8.PricebookEntryId = pbe[2].Id;
        oli.add(oppItem8);
        
        
         OpportunityLineItem oppItem9 = new OpportunityLineItem();
        oppItem9.OpportunityId = oppCm.Id;                              
        oppItem9.Estimated_Additional_New_Members__c = 20;
        oppItem9.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem9.Net_Results__c = -80;
        oppItem9.Sold_Retained_Members__c = 20;
        oppItem9.Existing_Members_Involved_in_the_Bid__c = 00;
        oppItem9.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem9.Quantity = 2;
        oppItem9.TotalPrice = 100;
        oppItem9.PricebookEntryId = pbe[3].Id;
        oli.add(oppItem9);
        
        
        OpportunityLineItem oppItem10 = new OpportunityLineItem();
        oppItem10.OpportunityId = oppCm.Id;                              
        oppItem10.Estimated_Additional_New_Members__c = 20;
        oppItem10.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem10.Net_Results__c = -80;
        oppItem10.Sold_Retained_Members__c = 20;
        oppItem10.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem10.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem10.Quantity = 2;
        oppItem10.TotalPrice = 100;
        oppItem10.PricebookEntryId = pbe[4].Id;
        oli.add(oppItem10);
        
        OpportunityLineItem oppItem11 = new OpportunityLineItem();
        oppItem11.OpportunityId = oppCm.Id;                              
        oppItem11.Estimated_Additional_New_Members__c = 20;
        oppItem11.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem11.Net_Results__c = -80;
        oppItem11.Sold_Retained_Members__c = 20;
        oppItem11.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem11.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem11.Quantity = 2;
        oppItem11.TotalPrice = 100;
        oppItem11.PricebookEntryId = pbe[5].Id;
        oli.add(oppItem11); 
        
        insert oli;
        
        List<Id> opId = new List<Id>();
        opId.add(opp.Id);
        
        List<Id> opIdcm = new List<Id>();
        opIdcm.add(oppCm.Id);
        
        Stepwiseclass.returnListOfOpportunitiesForDisplay('CDType', 20);
        Stepwiseclass.returnListOfOpportunitiesForDisplay('CmType', 20); 
        Stepwiseclass.generateXMLFile(opId, 'CDType');
        Stepwiseclass.generateXMLFile(opIdcm, 'CmType');
    }
}