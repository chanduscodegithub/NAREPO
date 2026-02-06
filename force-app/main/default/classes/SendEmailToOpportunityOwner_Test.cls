@isTest
public class SendEmailToOpportunityOwner_Test {
    
    @isTest
    public static void testSendEmailWithTemplate() {
        
        List<Opportunity> oppList = new List<Opportunity>();
        Account cDAccEquity = new Account();
        cDAccEquity.Name = 'Equity Healthcare';
        cDAccEquity.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        cDAccEquity.Subtype__c = 'Collaborative Ventures Group (CVG)';
        Database.SaveResult resultacc3 = Database.insert(cDAccEquity, false);
        
        Account cDAccount = new Account();
        cDAccount.Name = 'Test CD Accopunt';
        cDAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        cDAccount.Subtype__c = 'Collaborative Ventures Group (CVG)';
        Database.SaveResult resultacc2 = Database.insert(cDAccount, false);
        
        Account cDAccount1 = new Account();
        cDAccount1.Name = 'Test CD Accopunt';
        cDAccount1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        cDAccount1.Subtype__c = 'Prospect';
        Database.SaveResult resultacc1 = Database.insert(cDAccount1, false);
        
        Opportunity opp =  new Opportunity();
        opp.Name='Test Opportunity CD';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision;Dental';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.StageName = 'Open';
        opp.CloseDate=System.today();
        opp.Disposition_Medical__c = 'Sold';
        opp.Membership_Activity_Type__c = 'Traditional';
        opp.Aggregator_Involved_in_the_Oppty_Risk__c = cDAccount.Id;
        opp.Proposal_Due_Date_Other__c = system.today();
        opp.Proposal_Due_Date_Dental__c = system.today();
        opp.Proposal_Due_Date_Vision__c = system.today();
        opp.Retirees_in_the_Proposal_CI_AP_HI__c = 10;
        opp.Employees_in_the_Proposal_CI_AP_HI__c = 10;
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
        opp.Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'No';
        opp.ownerId =[select id from user where email='veera.nandimandalam@crmit.com'][0].Id;
        oppList.add(opp);
        Database.SaveResult[] results = Database.insert(oppList, false);
        
        // Start the test execution context
        Test.startTest();
        SendEmailToOpportunityOwner.sendEmailWhenMedicalPrdSold(oppList);
        System.assertEquals(true, results[0].isSuccess());
        // Stop the test execution context
        Test.stopTest();  
    }
}