@isTest
private class ExecutiveSummaryReportsTest {
    
    @testSetup static void createTestData() {
        Account accNA = new Account();
        accNA.Name = 'National Accounts';
        accNA.Subtype__c ='Competitor';
        accNA.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert accNA;
        
        Account accCM_No_Child = new Account();
        accCM_No_Child.Name = 'Test Account';
        accCM_No_Child.Subtype__c ='Prospect';
        accCM_No_Child.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCM_No_Child;
        
        Account accCM = new Account();
        accCM.Name = 'Competitive Medical CM';
        accCM.Subtype__c =' Specialty Benefits Only';
        accCM.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM;
        
        Opportunity opp =  new Opportunity();
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp.AccountId=accCM_No_Child.Id;
        opp.Name='Test Opportunity';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp.Expected_Date_of_RFP__c = system.today();
        opp.StageName = 'Qualification';
        opp.CloseDate=System.today();
        insert opp;
        
        PriceBook2 book2 = new PriceBook2();
        book2.Name = 'Test book2';
        insert book2;
 
         Product2 prod = new Product2();
        prod.Name = 'Total';
        prod.IsActive = true;
        insert prod;
        
        /*Pricebook2 standardPB = [select id from Pricebook2 where isStandard=true limit 1];
        
        PricebookEntry standardPBE = new PricebookEntry(Pricebook2Id = standardPB.Id, Product2Id = prod.Id, UnitPrice = 1000, IsActive = true);
        insert standardPBE; */
        
        PricebookEntry pbe = new PricebookEntry(Pricebook2Id = book2.Id, Product2Id = prod.Id, UnitPrice = 1000, IsActive = true);
        pbe.Pricebook2Id = Test.getStandardPricebookId();
        insert pbe;    
            
       /* PricebookEntry myPrice = new PricebookEntry();
        myPrice.UnitPrice = 10;
        myPrice.Product2Id = prod.Id;
        myPrice.Pricebook2Id = book2.Id;
        myPrice.UseStandardPrice = false;
        myPrice.IsActive = true;
        insert myPrice;*/      
        
        OpportunityLineItem oppItem = new OpportunityLineItem();
        oppItem.OpportunityId = opp.Id;                              
        oppItem.Estimated_Additional_New_Members__c = 20;
        oppItem.Existing_Membership_at_Risk__c =20;                                                                                   
        oppItem.Net_Results__c = -80;
        oppItem.Sold_Retained_Members__c = 20;
        oppItem.Existing_Members_Involved_in_the_Bid__c = 100;
        oppItem.Mbrs_Transferred_From_To_Another_Segment__c = 0;
        oppItem.Quantity = 2;
        oppItem.TotalPrice = 100;
        oppItem.PricebookEntryId = pbe.Id;
        insert oppItem;
        
        MA_Competitor__c comp = new MA_Competitor__c();
        comp.Competitor_Classification__c = 'Medical';      
        comp.Number_of_Members_Held__c = 10;
        comp.of_Members_Held__c = 0;
        comp.Number_of_Members_Awarded__c = 10;
        comp.of_Members_Awarded__c = 0;
        comp.Opportunity__c = opp.Id;
        comp.Competitor_Account__c =  accNA.Id;       
        insert comp;
        
        MA_Competitor__c comp1 = new MA_Competitor__c();
        comp1.Competitor_Classification__c = 'Vision';      
        comp1.Number_of_Members_Held__c = 5;
        comp1.of_Members_Held__c = 0;
        comp1.Number_of_Members_Awarded__c = 5;
        comp1.of_Members_Awarded__c = 0;
        comp1.Opportunity__c = opp.Id;
        comp1.Competitor_Account__c =  accNA.Id;       
        insert comp1;
    }
    
    public testMethod static void validateExecutiveSummary(){
        Id acctCM = [SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id;
        Test.startTest();
        ExecutiveSummaryReports.getTabularReportResponse(acctCM);
        ExecutiveSummaryReports.getCompetitorReportResponse(acctCM);
        Test.stopTest();
    }
}