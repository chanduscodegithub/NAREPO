@isTest
public class ProactiveRenewalServiceTest {
	
    
    static Account createAccount(){
        Account acc = new Account(Name = 'Test Account',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(),Subtype__c='National Accounts - West');
        insert acc;
        return acc;
    }

    static Opportunity createOpportunity(
        Id accountId,
        integer season,
        String incentiveStatus
    ){
        Opportunity opp = new Opportunity(
            RecordtypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CM Membership Activity (Existing Client)').getRecordTypeId(),
            Name = 'Test Opp ' + season,
            AccountId = accountId,
            StageName = 'Prospecting',
            CloseDate = Date.today(),
            EffectiveDate__c =Date.newInstance(season, 2, 1),
            BusinessType__c = 'Client Management',
            Sales_Stage_Medical__c = 'Notified',
            Product_Type_Involved_in_Opp__c = 'Medical',
            Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal',
            Disposition_Medical__c = 'Sold',
            Overall_New_Membership_Impact__c =0,
            Existing_Members_Risk_Outcome_Medical__c = 'Retained',
            Closed_Reason_1_Medical__c ='Cost: Overall',
            Members_in_the_Proposal_Medical__c =10,
            Members_QUOTED_in_the_Proposal_Medical__c =20,
            Employees_in_the_Proposal_Medical__c =20,
            Proactive_Renewal_Additional_Info__c ='Test',
            Proactive_Renewal_Underwriter__c ='Test',
            Does_this_Oppty_Risk_Involve_Exchanges__c ='No',
            Proactive_Renewal_Incentive_Status__c =incentiveStatus

        );

        if(incentiveStatus != null){
            opp.Proactive_Renewal_Incentive_Status__c = incentiveStatus;
        }

        insert opp;
        return opp;
    }

    @isTest
    static void testPendingQualification(){

        Account acc = createAccount();

        Opportunity opp = createOpportunity(
            acc.Id,
            2027,
            null
        );

        Test.startTest();
        opp.Existing_Members_Risk_Outcome_Medical__c = 'Partial Cancellation';
        update opp;
        Test.stopTest();

        Opportunity updatedOpp = [
            SELECT Proactive_Renewal_Incentive_Status__c
            FROM Opportunity
            WHERE Id = :opp.Id
        ];

        System.assert(
            updatedOpp.Proactive_Renewal_Incentive_Status__c.contains('Pending Qualification')
        );
    }


    @isTest
    static void testPriorYearDisqualification(){

        Account acc = createAccount();

        // Prior season qualified
        createOpportunity(
            acc.Id,
            2025,
            'SS 2026 - Qualifies - Fully Validated'
        );

        Opportunity opp = createOpportunity(
            acc.Id,
            2025,
            null
        );

        Test.startTest();
        opp.Existing_Members_Risk_Outcome_Medical__c = 'Partial Cancellation';
        update opp;
        Test.stopTest();

        Opportunity updatedOpp = [
            SELECT Proactive_Renewal_Incentive_Status__c,
                   Proactive_Renewal_Disqualify_Prior_Year__c
            FROM Opportunity
            WHERE Id = :opp.Id
        ];
        System.assert(
            updatedOpp.Proactive_Renewal_Incentive_Status__c.contains('Pending Qualification')
        );

    }


    @isTest
    static void testFiveYearExtension(){

        Account acc = createAccount();

        Opportunity opp = new Opportunity(
            RecordtypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CM Membership Activity (Existing Client)').getRecordTypeId(),
            Name = '5 Year Extension',
            AccountId = acc.Id,
            StageName = 'Prospecting',
            CloseDate = Date.today(),
            EffectiveDate__c =Date.newInstance(2026, 2, 1),
            BusinessType__c = 'Client Management',
            Sales_Stage_Medical__c = 'Notified',
            Product_Type_Involved_in_Opp__c = 'Medical',
            Reason_for_the_Opportunity_Risk__c = 'Proactive Renewal',
            Disposition_Medical__c = 'Sold',
            Existing_Members_Risk_Outcome_Medical__c = 'Partial Cancellation',
            Overall_New_Membership_Impact__c =0,
            Closed_Reason_1_Medical__c='Admin: Claims',
            Employees_in_the_Proposal_Medical__c=20,
            Members_in_the_Proposal_Medical__c =20,
            Members_QUOTED_in_the_Proposal_Medical__c =20,
            Proactive_Renewal_Underwriter__c ='test',
            Does_this_Oppty_Risk_Involve_Exchanges__c ='No',
            Proactive_Renewal_Additional_Info__c =
                'Medical Contract WAS Extended for 5+ Years'
        );

        insert opp;

        Test.startTest();
        opp.Existing_Members_Risk_Outcome_Medical__c = 'Retained';
        update opp;
        Test.stopTest();

        Opportunity updatedOpp = [
            SELECT Proactive_Renewal_Incentive_Status__c
            FROM Opportunity
            WHERE Id = :opp.Id
        ];
		system.debug(updatedOpp.Proactive_Renewal_Incentive_Status__c+'Veerqa');

        System.assert(
            updatedOpp.Proactive_Renewal_Incentive_Status__c.contains('Pending Qualification')
        );
    }


    @isTest
    static void testAdditionalConditionFailure(){

        Account acc = createAccount();

        Opportunity opp = new Opportunity(
            Name = 'Condition Failure',
            AccountId = acc.Id,
            StageName = 'Closed',
            CloseDate = Date.today(),
            EffectiveDate__c =Date.newInstance(2026, 2, 1),
            BusinessType__c = 'Client Management',
            Sales_Stage_Medical__c = 'Notified',
            Product_Type_Involved_in_Opp__c = 'Medical',
            Overall_New_Membership_Impact__c =1,
            Reason_for_the_Opportunity_Risk__c = 'RFI', // fail condition
            Disposition_Medical__c = 'Sold',
            Existing_Members_Risk_Outcome_Medical__c = 'Retained',        
            Closed_Reason_1_Medical__c='Admin: Claims',
            Employees_in_the_Proposal_Medical__c=20,
            Members_in_the_Proposal_Medical__c =20,
            Members_QUOTED_in_the_Proposal_Medical__c =20,
            Proactive_Renewal_Underwriter__c ='test',
            Does_this_Oppty_Risk_Involve_Exchanges__c ='No',
            RecordtypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CM Membership Activity (Existing Client)').getRecordTypeId()

        );

        insert opp;

        Test.startTest();
        opp.Existing_Members_Risk_Outcome_Medical__c = 'Partial Cancellation';
        update opp;
        Test.stopTest();

        Opportunity updatedOpp = [
            SELECT Proactive_Renewal_Incentive_Status__c
            FROM Opportunity
            WHERE Id = :opp.Id
        ];
		system.debug(updatedOpp.Proactive_Renewal_Incentive_Status__c+'Veerqa');

        System.assert(
            updatedOpp.Proactive_Renewal_Incentive_Status__c.contains('Does Not Qualify')
        );
    }
}