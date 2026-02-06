@isTest
public class EmailSCCbySalesSurestTeamTest {
    @testSetup
    public static void setupTestData() {
        Account acc = new Account();
            acc.Name = 'Test Method Account';
            acc.Subtype__c = 'Complex Accounts';
            insert acc;
        
        Opportunity opp = new Opportunity();
            opp.name = 'Test Method Opportunity';
            opp.AccountId = acc.Id;
            opp.EffectiveDate__c = Date.newInstance(2020, 1, 1);
            opp.BusinessType__c = 'Client Management';
            opp.Product_Type_Involved_in_Opp__c = 'Medical'; 
            opp.Sales_Stage_Medical__c = 'Notified';
            opp.Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal';
            opp.Disposition_Medical__c = 'Sold';
            //opp.Existing_Members_Risk_Outcome_Medical__c = 'Retained';
            opp.Proactive_Renewal_Additional_Info__c = 'Medical Contract WAS Extended for at Least 2 Years';
            opp.Closed_Reason_1_Medical__c = 'Other: Consultant Relationship';
            opp.Employees_in_the_Proposal_Medical__c = 5;
            opp.Members_in_the_Proposal_Medical__c = 6;
            opp.Members_QUOTED_in_the_Proposal_Medical__c = 7;
            opp.StageName = 'Open';
            opp.CloseDate = System.today();
            opp.Proactive_Renewal_Retention__c = 80;
            opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes';
            opp.Exchanges_the_Company_is_Looking_At__c = 'RightOpt';
            opp.Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes';
            opp.Does_this_Oppty_Risk_Involve_Consultant__c = 'Yes';
            opp.Has_a_Formal_RFP_Been_Issued__c = 'Yes';
            opp.Is_There_Existing_Membership_at_Risk__c = 'Yes';
            opp.Primary_Risk_Reason__c = 'Affordability';
            opp.Can_the_Membership_Move_Without_a_Bid__c = 'Yes';
            opp.Estimated_Membership_Impact__c = 'Full';
            opp.Secondary_Risk_Reason__c = 'Competition';
            
            insert opp;
        
        
    }
    
    @isTest
    static void testSendEmailWithPDF() {
        // Fetch test data
        Account acc = [SELECT Id, Name FROM Account LIMIT 1];
        Opportunity opp = [SELECT Id, Name, Account.Name, EffectiveDate__c FROM Opportunity LIMIT 1];
        
        Test.startTest();
        
        // Prepare request list
        List<EmailSCCbySalesSurestTeam.EmailRequest> requests = new List<EmailSCCbySalesSurestTeam.EmailRequest>();
        EmailSCCbySalesSurestTeam.EmailRequest req = new EmailSCCbySalesSurestTeam.EmailRequest();
        req.recordId = opp.Id;
        req.AccountName = acc.Name;
        req.oppName = opp.Name;
        req.EffectiveDate = opp.EffectiveDate__c;
        requests.add(req);
        
        // Invoke the method
        EmailSCCbySalesSurestTeam.sendEmailWithPDF(requests);
        
        Test.stopTest();
        
    }
    
    

    

}