@isTest
public with sharing class NewRFPTemplateControllerTest {

    @TestSetup
    static void createRequiredData(){
        Account accountData = new Account(
            Name = 'Testing data',
            BillingStreet = 'Testing data',
            BillingCity = 'Bangalore',
            BillingState = 'Karnataka',
            BillingCountry = 'India',
            BillingPostalCode = '500000',
            Health_Plan_Manager_Industry__c = 'Energy',
            Coveted_Account__c = 'Erica Wessel',
            Direct_Marketing_Target__c = false,
            // CVGAccount__c = , // Account Lookup
            CVG_Top_10__c = true,
            Private_Equity_Relationship__c = 'Testing data',
            Previous_Customer__c = false,
            Cancellation_Date__c = Date.today(),
            Members_at_Term__c = 12123123.123123123,
            ReasonforTermMedical__c = 'Admin: Acct Mgmt',
            Reason_for_Term_Comments__c = 'Testing data',
            Eligible_US_EEs__c = 12123123.123123123,
            AnnualB2BSpend__c = 12123123.123123123,
            Web_Address__c = 'https://testingData.google.sf.fb.netflix.instagram.microsoft.primevideos.me.you.com',
            SVP_Top_10__c = true,
            B2BServiceSolution__c = 'Testing data',
            Subtype__c = 'Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );

        insert accountData;

        Opportunity opportunityData1 = new Opportunity(
            Name = 'Testing Opp data 1',
            Product_Type_Involved_in_Opp__c = 'After the record has been created',
            Platforms_Quoted__c = 'USP',
            EffectiveDate__c = Date.today().addYears( -1 ),
            Status__c = 'Open',
            Comments__c = 'Testing data',
            Proposal_Received_Date_Medical__c = Date.today(),
            Proposal_Due_Date_Medical__c = Date.today(),
            Anticipated_Close_Decision_Date_for_Me__c = Date.today(),
            Existing_Members_Involved_in_the_Bid__c = 12123123.123123123,
            Estimated_Members_Existing_New__c = 12123123.123123123,
            Membership_Activity_Type__c = 'Private Exchange',
            Members_in_the_Proposal_Medical__c = 12123123.123123123,
            Employees_in_the_Proposal_Medical__c = 12123123.123123123,
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            StageName = 'Closed',
            CloseDate = Date.today(),
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'Specialty Only',
            AccountId = accountData.Id
        );

        Opportunity opportunityData2 = new Opportunity(
            Name = 'Testing Opp data 2',
            Product_Type_Involved_in_Opp__c = 'After the record has been created',
            Platforms_Quoted__c = 'USP',
            EffectiveDate__c = Date.today().addYears( -2 ),
            Status__c = 'Closed',
            Comments__c = 'Testing data',
            Proposal_Received_Date_Medical__c = Date.today(),
            Proposal_Due_Date_Medical__c = Date.today(),
            Anticipated_Close_Decision_Date_for_Me__c = Date.today(),
            Existing_Members_Involved_in_the_Bid__c = 12123123.123123123,
            Estimated_Members_Existing_New__c = 12123123.123123123,
            Membership_Activity_Type__c = 'Private Exchange',
            Members_in_the_Proposal_Medical__c = 12123123.123123123,
            Employees_in_the_Proposal_Medical__c = 12123123.123123123,
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            StageName = 'Closed',
            CloseDate = Date.today(),
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'Specialty Only',
            AccountId = accountData.Id
        );

        Opportunity opportunityData3 = new Opportunity(
            Name = 'Testing Opp data 3',
            Product_Type_Involved_in_Opp__c = 'After the record has been created',
            Platforms_Quoted__c = 'USP',
            EffectiveDate__c = Date.today().addYears( 5 ),
            Status__c = 'Open',
            Comments__c = 'Testing data',
            Proposal_Received_Date_Medical__c = Date.today(),
            Proposal_Due_Date_Medical__c = Date.today(),
            Anticipated_Close_Decision_Date_for_Me__c = Date.today(),
            Existing_Members_Involved_in_the_Bid__c = 12123123.123123123,
            Estimated_Members_Existing_New__c = 12123123.123123123,
            Membership_Activity_Type__c = 'Private Exchange',
            Members_in_the_Proposal_Medical__c = 12123123.123123123,
            Employees_in_the_Proposal_Medical__c = 12123123.123123123,
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            StageName = 'Open',
            CloseDate = Date.today(),
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'Specialty Only',
            AccountId = accountData.Id
        );

        System.debug( 'Before Insert ' + JSON.serializePretty( opportunityData3 ) );

        insert new List<Opportunity>{ opportunityData1, opportunityData2, opportunityData3 };

        System.debug( 'After Insert ' + JSON.serializePretty( opportunityData3 ) );

    }

    @isTest
    public static void testMethod1(){
        test.startTest();
        Opportunity oppData = [ SELECT ID FROM Opportunity LIMIT 1 ];

        NewRFPTemplateController.ReturnNewRFPTemplate result = NewRFPTemplateController.fetchNewRFPTemplate( oppData.Id );

        Assert.isNotNull( result.newRFPTemplateXML, 'RFP Template should not be null' );
        Assert.isNotNull( result.memberShipActivityWithAccountData, 'Data Can not be null' );
        Assert.isNotNull( result.listOfBidHistory, 'Bid History Can not be null' );
        Assert.isTrue( result.isUserAuthorizedViewData, 'User is authorized' );

        System.debug( JSON.serializePretty( result.listOfBidHistory ) );

        Assert.isTrue( result.listOfBidHistory.size() == 3, 'Bid history size is ' + result.listOfBidHistory.size() + ' Expected : 3 ' );
        test.stopTest();
    }
}