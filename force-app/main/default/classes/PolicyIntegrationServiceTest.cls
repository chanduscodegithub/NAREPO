@isTest
private class PolicyIntegrationServiceTest {

    @isTest
    static void testSendPolicyData() {

        Account acc = new Account( Name = 'Test Account', Subtype__c = 'CVG');
        insert acc;
        
        Policy_Information__c policy = new Policy_Information__c(RecordTypeId = '012VB000003Z4F7YAK', Name = 'Policy 1', Policy__c = 'Policy 1', Policy_Type__c = 'Medical',
                                                                Company__c = acc.id);
        insert policy;

        Product2 p1 = new Product2(Name='Accident Protection Plan - Voluntary', IsActive=true, Product_Line__c = 'Medical');
        Product2 p2 = new Product2(Name='Critical Illness Protection Plan - Voluntary', IsActive=true, Product_Line__c = 'Medical');
        insert new List<Product2>{p1, p2};
        Id stdPbId = Test.getStandardPricebookId();

        PricebookEntry pbe = new PricebookEntry( Pricebook2Id = stdPbId, Product2Id = p1.Id, UnitPrice = 100, IsActive = true);
        PricebookEntry pbe1 = new PricebookEntry( Pricebook2Id = stdPbId, Product2Id = p2.Id, UnitPrice = 100, IsActive = true );
        insert new List<PricebookEntry>{pbe, pbe1};
              
        Opportunity opp = new Opportunity( Name = 'Test Opp',EffectiveDate__c = Date.today(), AccountId = acc.Id, Pricebook2Id = stdPbId,
                                         Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',CloseDate = Date.today() + 10, StageName = 'Open');
        insert opp;
        
        /*Opportunity opp1 = new Opportunity( Name = 'Test Opp 1',EffectiveDate__c = Date.today() + 2, AccountId = acc.Id, Pricebook2Id = stdPbId,
                                         Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',CloseDate = Date.today() + 10, StageName = 'Open');
        insert opp1; */



        OpportunityLineItem oli = new OpportunityLineItem( OpportunityId = opp.Id, PricebookEntryId = pbe.Id,Quantity = 1, UnitPrice = 200, Sales_Stage__c = 'Lost');      
        OpportunityLineItem oli2 = new OpportunityLineItem(  OpportunityId = opp.Id,  PricebookEntryId = pbe1.Id,Quantity = 1, UnitPrice = 200, Sales_Stage__c = 'Sold');
        //OpportunityLineItem oli3 = new OpportunityLineItem( OpportunityId = opp1.Id,  PricebookEntryId = pbe1.Id,Quantity = 1, UnitPrice = 200, Sales_Stage__c = 'Sold');
        insert new List<OpportunityLineItem>{oli, oli2};
        

        Test.setMock(HttpCalloutMock.class, new PolicyApiMock());

        Test.startTest();
        AccountAPI.sendPolicyData(policy.Policy__c, opp.EffectiveDate__c);

        Test.stopTest();

    }
}