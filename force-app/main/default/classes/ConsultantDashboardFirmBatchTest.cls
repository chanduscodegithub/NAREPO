/*****************************************************
* Name : ConsultantDashboardFirmBatchTest
* Developer: Gurjot Singh
* Email: gurjot.singh@crmit.com
* Purpose: Test class for Consultant Dashboard classes
* Date: 
* Last Modified Date:
*******************************************************/
@isTest
private class ConsultantDashboardFirmBatchTest {
    
    // Declare static variables for reuse in test methods
    static Account accFirm1;
    static Account accFirm2;
    static Account accFirm3;
    static Contact contact1;
    static Contact contact2;
    static Opportunity opp1;
    static Opportunity opp2;
    
    @testSetup
    static void createTestData() {
        List<Account> accList = new List<Account>();
        // Create Accounts
        Account accCF = new Account();
        accCF.Name = 'Consulting Firm Test';
        accCF.Subtype__c = 'Consulting Firm';
        accCF.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        //insert accCF;
        accList.add(accCF);
        
        accFirm1 = new Account();
        accFirm1.Name = 'account Firm1';
        accFirm1.Subtype__c = 'National Accounts - East';
        accFirm1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        //insert accFirm1;  
        accList.add(accFirm1);
        
        accFirm2 = new Account();
        accFirm2.Name = 'account Firm2';
        accFirm2.Subtype__c = 'National Accounts - East';
        accFirm2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        //insert accFirm2;
        accList.add(accFirm2);
        
        accFirm3 = new Account();
        accFirm3.Name = 'account Firm3';
        accFirm3.Subtype__c = 'National Accounts - East';
        accFirm3.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        //insert accFirm3;
        accList.add(accFirm3);
        
        Account accNA = new Account();
        accNA.Name = 'National Accounts';
        accNA.Subtype__c ='Competitor';
        accNA.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        //insert accNA;
        accList.add(accNA);
        
        insert accList;
        
        // Create Contact
        contact1 = new Contact();
        contact1.FirstName = 'Jnanesh';
        contact1.LastName = 'Avaradi';
        contact1.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        contact1.AccountId = accList[0].Id;
        insert contact1;
        
        contact2 = new Contact();
        contact2.FirstName = 'Test';
        contact2.LastName = 'Avaradi';
        contact2.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId();
        contact2.AccountId = accList[3].Id;
        insert contact2;
        
        
        
        // Create Opportunities
        opp1 = new Opportunity();
        opp1.Name = 'Opportunity 1';
        opp1.AccountId = accList[1].Id;
        opp1.StageName = 'Closed Won';
        opp1.CloseDate = Date.today().addMonths(1);
        opp1.Sales_Stage_Medical__c = 'Emerging Risk\\No Upside';
        opp1.EffectiveDate__c = Date.today().addYears(-2); // Within the last 3 years
        opp1.Anticipated_Actual_Close_Date_Medical__c = Date.today().addMonths(1);
        opp1.Disposition_Medical__c = 'Lost: Finalist'; 
        opp1.Risk_Probability_Medical__c = '20% (Unlikely)';
        opp1.Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes';
        opp1.Exchanges_the_Company_is_Looking_At__c = 'Extend Health';
        opp1.Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'No';
        opp1.Product_Type_Involved_in_Opp__c = 'Medical';
        opp1.Primary_Consulting_Firm__c = accList[0].Id;
        insert opp1;
        
        opp2 = new Opportunity();
        opp2.Name = 'Opportunity 2';
        opp2.AccountId = accList[2].Id;
        opp2.StageName = 'Closed Lost';
        opp2.CloseDate = Date.today().addMonths(1);
        opp2.Sales_Stage_Medical__c = 'Finalist'; 
        opp2.EffectiveDate__c = Date.today().addYears(-1); // Within the last 3 years
        opp2.Anticipated_Actual_Close_Date_Medical__c = Date.today().addMonths(1);
        opp2.Disposition_Medical__c = 'Lost: Finalist'; 
        opp2.Risk_Probability_Medical__c = '20% (Unlikely)';
        opp2.Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes';
        opp2.Exchanges_the_Company_is_Looking_At__c = 'Extend Health';
        opp2.Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'No';
        opp2.Finalist_Date_Detail_Medical__c = 'Mtg Expected - Date Confirmed';
        opp2.Finalist_Date_Medical__c = Date.today().addMonths(1);
        opp2.Finalist_SubStage_Medical__c = 'Named as Finalist';
        opp2.Product_Type_Involved_in_Opp__c = 'Medical';
        opp1.Primary_Consulting_Firm__c = accList[2].Id;
        insert opp2;
        
        List<OpportunityContactRole> ocrList = new List<OpportunityContactRole>();
        
        // Create OpportunityContactRoles
        OpportunityContactRole ocr1 = new OpportunityContactRole();
        ocr1.OpportunityId = opp1.Id;
        ocr1.ContactId = contact1.Id;
        ocr1.Role = 'Decision Maker';
        ocr1.IsPrimary = true;
        //ocr1.Contact.AccountId = accList[0].Id;
        //ocr1.Opportunity.Primary_Consulting_Firm__c = accList[1].Id;
        ocrList.add(ocr1);
        
        OpportunityContactRole ocr2 = new OpportunityContactRole();
        ocr2.OpportunityId = opp2.Id;
        ocr2.ContactId = contact1.Id;
        ocr2.Role = 'Influencer';
        ocrList.add(ocr2);
        
        OpportunityContactRole ocr3 = new OpportunityContactRole();
        ocr3.OpportunityId = opp2.Id;
        ocr3.ContactId = contact2.Id;
        ocr3.Role = 'Influencer';
        ocrList.add(ocr3);
        
        insert ocrList;
      
        // Create Account CF Junction 
        AccountCFJunction__c aCFJ = new AccountCFJunction__c();
        aCFJ.AccountFirm__c = accList[2].Id;
        aCFJ.ConsultingFirm__c = accCF.Id;
        insert aCFJ;
        
        // Create AccountContactRelation
        AccountContactRelation aCR = new AccountContactRelation ();
        aCR.ContactId = contact1.Id;
        aCR.AccountId = accList[3].Id;
        Insert aCR;
        
        // Create ClientSurveyResults
        ClientSurveyResults__c cSR = new ClientSurveyResults__c();
        cSR.Account__c = accList[3].Id;
        cSR.LikelihoodtoRecommendScore__c = '9';
        cSR.Year__c = '2024';
        cSR.Name = 'TestClass';
        cSR.Type__c = 'Client Survey Results';
        Insert cSR;
        
        // Create MA Competitor
        MA_Competitor__c MAComp = new MA_Competitor__c();
        MAComp.Competitor_Account__c = accNA.Id;
        MAComp.Opportunity__c = opp1.Id;
        MAComp.Competitor_Classification__c = 'Medical';
        insert MAComp;    
    }
    
    @isTest
    static void testScheduler() {
        
        Test.startTest();
        
        // Define the Cron expression (schedule for one minute in the future)
        String cronExp = '0 0 0 1 1 ? 2099';

        // Schedule the Apex Scheduler class
        String jobId = System.schedule('Test ConsultantDashboardSchBatch Job', cronExp, new ConsultantDashboardSchBatch());

        // Verify the job has been scheduled
        CronTrigger job = [SELECT Id, State, NextFireTime
                           FROM CronTrigger WHERE Id = :jobId];

        System.assertEquals('WAITING', job.State, 'Job state should be WAITING');
        System.assert(job.NextFireTime != null, 'Next fire time should be set');
        
        Test.stopTest();
        
    }
    
    @isTest
    static void testScheduler1() {
        
        Test.startTest();
        
        // Define the Cron expression (schedule for one minute in the future)
        String cronExp = '0 0 0 1 1 ? 2099';

        // Schedule the Apex Scheduler class
        String jobId = System.schedule('Test ConsultantFirmDashboardSchBatch Job', cronExp, new ConsultantFirmDashboardSchBatch());

        // Verify the job has been scheduled
        CronTrigger job = [SELECT Id, State, NextFireTime
                           FROM CronTrigger WHERE Id = :jobId];

        System.assertEquals('WAITING', job.State, 'Job state should be WAITING');
        System.assert(job.NextFireTime != null, 'Next fire time should be set');
        
        Test.stopTest();
    }
}