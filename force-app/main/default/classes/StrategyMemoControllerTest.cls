@isTest
public class StrategyMemoControllerTest {
     @isTest public static void setupTestData(){
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
        
        Opportunity opp2 = new Opportunity(Name='Test Opp 2', AccountId = account.Id, RecordTypeId=oppRecordTypeId,
                                            Product_Type_Involved_in_Opp__c='Vision', 
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
             //Product_Line__c = 'Medical',
            PricebookEntryId = pbEntry.Id,
            TotalPrice = 100
        );
        insert oli;
          Strategy_Memo__c memo = new Strategy_Memo__c(
            Membership_Activity__c = opp1.Id
        );
        insert memo;
         Strategy_Memo__c updatedMemo = new Strategy_Memo__c(
            Id = memo.Id,
            Membership_Activity__c = opp1.Id
        );
         Test.startTest();
         StrategyMemoController.StrategyMemoInfoWrapper wrapper = StrategyMemoController.getStrategyInformation(opp1.Id);
         List<Opportunity> relatedOpportunities = StrategyMemoController.getRelatedOpportunities(opp1.Id);
         List<OpportunityLineItem> relatedProducts = StrategyMemoController.getProductsInfo(opp1.Id);
         List<MA_Competitor__c> competitors = StrategyMemoController.getCompetitorsInAll(opp1.Id);
          //memo = StrategyMemoController.getStrategyMemo(opp1.Id);
          StrategyMemoController.saveStrategyMemo(updatedMemo, opp1.Id, updatedMemo.AMT_Names_Requested__c);
         List<String> options = StrategyMemoController.getAMTOptions();
         String result = StrategyMemoController.getEarliestProposalReceivedDate(opp1);
         String result1 = StrategyMemoController.getEarliestDueDate(opp1);
         
       Test.stopTest();
        
      
    }
    @isTest
    static void testFormatDate() {
        Date testDate1 = Date.newInstance(2024, 10, 29);
        
        String formattedDate1 = StrategyMemoController.formatDate(testDate1);
        
    }
    @isTest
    static void testStrategyMemoInfoWrapper(){
      StrategyMemoController.StrategyMemoInfoWrapper wrapper = new  StrategyMemoController.StrategyMemoInfoWrapper();
        wrapper.oppId = '098abjau8u9oiopo';
        wrapper.accountName = 'Test';
         wrapper.eligibleEesAndRetirees = '20';
        wrapper.enrolledEmployeesProposal = '10';
        wrapper.membersInProposal = '10';
        wrapper.bidStrategy = 'test bid strategy';
        wrapper.aggregatorInvolved = 'aggregatorInvolved';
        wrapper.anticipatedActualCloseDate = Date.today().format();
        wrapper.approachStrategy= 'approachStrategy';
        wrapper.billingAddress = 'test address, Los angeles,unites States';
        wrapper.bluesBidComments ='bluesBidComments';
        wrapper .businessOverview = 'businessOverview';
         wrapper.businessPressures = 'Test pressures';
        wrapper.finalistDate =  Date.today().format();
        wrapper.averageContractSize = '1000';
         wrapper.surestSvpInvolved = 'surestSvpInvolved';
         wrapper.primarySitusState = 'AR';
         wrapper.billingCity = 'Los Angeles';
         wrapper.webAddress = 'https://www.linkedin.com/pulse/setup-cicd-using-github-actions-sfdcpanther/';
         wrapper.corporateMailingCity = 'New york';
         wrapper.corporateMailingAddress = '3th Street. 47 W 13th St, New York, NY 10011, USA. 20 Cooper Square. 20 Cooper Square, New York, NY 10003, USA';
         wrapper.primaryConsultantPhone = '9287389889';
         wrapper.primaryConsultantEmail = 'test@gmail.com';
         wrapper.consultantName = 'test consultant';
        wrapper.covetedAccount ='test coveted account';
        wrapper.proposalDateReceived =Date.today().format();
        wrapper.proposalDueDate =Date.today().format();
        wrapper.financialStrategyLead ='test financialStrategyLead';
        wrapper.isClientCannabisBusiness ='test isClientCannabisBusiness';
        wrapper.cvgAccount ='test cvgAccount ';
        wrapper.ownerName ='test ownerName ';
        wrapper.effectiveDate =Date.today().format();
        wrapper.sceAssignment ='test sceAssignment';
        wrapper.executiveSponsor ='test executiveSponsor';
        wrapper.dealSponsor ='test dealSponsor';
         wrapper.privateEquity ='test privateEquity ';
        wrapper.potentialCompelling ='test potentialCompelling';
        wrapper.uniqueBusinessValues ='test uniqueBusinessValues ';
        wrapper.keyRisks ='test keyRisks';
        wrapper.outcomeDrivers ='test outcomeDrivers';
        wrapper.approachStrategy ='test approachStrategy ';
        wrapper.surestNetworkConstraints ='test surestNetworkConstraints ';
        wrapper.networkContracting ='test networkContracting ';
        wrapper.lastAction ='test lastAction ';
        wrapper.nextAction ='test nextAction ';
        wrapper.surestApproachStrategy ='test surestApproachStrategy ';
        wrapper.notesTaken ='test notesTaken ';
        wrapper.surestComments ='test vsAetna ';
        wrapper.vsAetna ='0.9 ';
        wrapper.vsAnthem ='0.7 ';
        wrapper.vsBlues ='0.7 ';
        wrapper.vsBluesAlt ='0.7 ';
        wrapper.vsCigna ='0.7 ';        
        
        }

}