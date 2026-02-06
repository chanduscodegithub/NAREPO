@isTest
public class SalesDebriefControllerTest {
    @testSetup static void setup() {
        Profile p = [SELECT Id FROM Profile WHERE Name='CM Sales Team Standard Profile'];
        User testUser = new User(
            FirstName = 'Test',
            LastName = 'User',
            Alias = 'testuser',
            Email = 'testuser@crmit.com',
            Username = 'test@uhc.com.na.uat',
            ProfileId = p.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            Position__c = 'Test User'
        );
        insert testUser;
        
        Account cDAccount = new Account();
        cDAccount.Name = 'Test CD Accopunt';
        cDAccount.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        cDAccount.Subtype__c = 'Collaborative Ventures Group (CVG)';
        insert cDAccount;
        
        Account cDAccEquity = new Account();
        cDAccEquity.Name = 'Equity Healthcare';
        cDAccEquity.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        cDAccEquity.Subtype__c = 'Collaborative Ventures Group (CVG)';
        insert cDAccEquity;
        
        Account cDAccount1 = new Account();
        cDAccount1.Name = 'Test CD Accopunt';
        cDAccount1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        cDAccount1.Subtype__c = 'Prospect';
        insert cDAccount1;
        
        Opportunity opp =  new Opportunity();
        opp.Name='Test Opportunity CD';
        //opp.Platforms_Quoted__c = 'UNET';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision;Dental';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        // opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        //opp.Expected_Date_of_RFP__c = system.today();
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
        // opp.Reason_for_the_Opportunity_Risk__c = 'RFI';
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
        insert opp;
        
        Opportunity opp2 =  new Opportunity();
        opp2.Name='Test Opportunity CD2';
        //opp2.Platforms_Quoted__c = 'UNET';
        opp2.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp2.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp2.EffectiveDate__c = system.today();
        opp2.Product_Type_Involved_in_Opp__c = 'Medical;Vision;Dental';
        opp2.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp2.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp2.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp2.Expected_Date_of_RFP__c = system.today();
        opp2.StageName = 'Open';
        opp2.CloseDate=System.today();
        //opp2.Membership_Activity_Type__c = 'Traditional';
        opp2.Proposal_Due_Date_Other__c = system.today();
        opp2.Proposal_Due_Date_Dental__c = system.today();
        opp2.Proposal_Due_Date_Vision__c = system.today();
        opp2.Retirees_in_the_Proposal_CI_AP_HI__c = 10;
        opp2.Employees_in_the_Proposal_CI_AP_HI__c = 10;
        //opp2.Reason_for_the_Opportunity_Risk__c = 'RFI';
        opp2.Date_the_Dental_Quote_is_Needed_from_UW__c = system.today();
        opp2.Date_the_Vision_Quote_is_Needed_from_UW__c = system.today();
        opp2.Date_the_CI_APP_HIPP_Quote_is_Needed__c = system.today();
        opp2.Sales_Stage_vision__c = 'Notified';
        opp2.Sales_Stage_Other__c = 'Notified';
        opp2.Sales_Stage_Dental__c = 'Notified';
        opp2.Disposition_Dental__c = 'Sold';
        opp2.Disposition_Other__c = 'Sold';
        opp2.Disposition_Vision__c = 'Sold';
        opp2.Closed_Reason_1_Dental__c = 'Cost: Fees & Fixed Costs';
        opp2.Closed_Reason_1_Other_Buy_Up_Programs__c='Cost: Fees & Fixed Costs';
        opp2.Closed_Reason_1_Vision__c = 'Cost: Fees & Fixed Costs';
        opp2.Employees_in_the_Proposal_Dental__c = 10;
        opp2.Employees_in_the_Proposal_CI_AP_HI__c = 10;
        opp2.Employees_in_the_Proposal_Vision__c = null;
        opp2.Retirees_in_the_Proposal_Dental__c =null;
        opp2.Retirees_in_the_Proposal_Vision__c = 10;
        opp2.AccountId=cDAccount.Id;
        insert opp2;
        
        String printData = '[{"sectionName":"Strategy","question":"Were you able to establish a relationship with the employer before the RFP was released? (Select one)","answer":"We established a relationship prior to the release of the RFP","writeInValue":"","shortForm":"Relationship with employer before RFP","apiName":"Relationship_with_employer_before_RFP__c","rendered":true}]';
        
        
        Sales_Debrief__c sd = new Sales_Debrief__c();
        sd.Print_Data__c = printData;
        
        Sales_Debrief__c sd2 = new Sales_Debrief__c();
        sd2.Print_Data__c = printData;
        
        Test.startTest();
        SalesDebriefController.saveSalesDebriefData(sd, opp.Id, '2023', 'Comprehensive Medical');
        SalesDebriefController.saveSalesDebriefData(sd2, opp2.Id, '2023', 'Comprehensive Medical');
        
            
        PageReference pageRef = Page.SalesDebriefPrint;
        pageRef.getParameters().put('Id', String.valueOf(opp.Id));
        Test.setCurrentPage(pageRef);
        
       SalesDebriefPrintCtrl sdpc = new SalesDebriefPrintCtrl();
       System.assertNotEquals(null, sdpc.offset);
        
        SalesDebriefController.ReturnSalesDebriefData wrapper = new SalesDebriefController.ReturnSalesDebriefData();
        SalesDebriefPrintCtrl.SalesDebriefPrintWrapper wrapper2 = new SalesDebriefPrintCtrl.SalesDebriefPrintWrapper();
        Test.stopTest();
        
        System.assertEquals(null, wrapper2.sectionName);
        System.assertEquals(null, wrapper2.question);
        System.assertEquals(null, wrapper2.answer);
        System.assertEquals(null, wrapper2.writeInValue);
        System.assertEquals(null, wrapper2.shortForm);
        System.assertEquals(null, wrapper2.apiName);
        System.assertEquals(null, wrapper2.otherContent);
    }
    @isTest static void testMethod1() {
        String printData2 = 'Sample Text';
        
        Opportunity opp = [select Id from Opportunity where name='Test Opportunity CD'];
        Sales_Debrief__c sd = [Select id from Sales_Debrief__c LIMIT 1][0];
        Test.startTest();
        SalesDebriefController.getQuestionsAndAnswers(opp.Id);
        SalesDebriefController.getSalesDebriefPdf(opp.Id,printData2,sd.Id);
        //SalesDebriefController.printDocument(opp.Id); 
        /*PageReference pageRef = Page.SalesDebriefPrint;
        Test.setCurrentPage(pageRef);
        Blob content == Blob.valueOf('UNIT.TEST');      
        String base64Pdf = SalesDebriefController.printDocument(opp.Id);*/
        Test.stopTest();
    }
}