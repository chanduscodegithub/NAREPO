@IsTest
public class AccountStrategyMemoHandlerTest {
    @testSetup
    static void setupData() {

        Account acc = new Account(
            Name = 'Test Account',
            Subtype__c ='Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId(),
            BusinessPressures__c = 'Initial Pressure',
            Comments__c = 'Initial Comment',
            Web_Address__c = 'https://initial.com',
            BillingCity = 'Bangalore'
        );
        insert acc;

        Opportunity opp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = acc.Id,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Medical,Vision,Pharmacy,Dental,Vision,Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            Platforms_Sold__c = 'SUREST',
            Sales_Stage_Medical__c = 'Lead',Anticipated_Actual_Close_Date_Medical__c= Date.newInstance(2020, 5, 7), Closed_Reason_1_Medical__c= 'Network: Access'
        );
        insert opp;

        Strategy_Memo__c memo = new Strategy_Memo__c(
            Membership_Activity__c = opp.Id
        );
        insert memo;
    }

    /* ------------------------------
     * Positive Test: Account change updates memo
     * ------------------------------ */
    @IsTest
    static void testMemoUpdateOnAccountChange() {

       Account accNew = [
            SELECT Id, BusinessPressures__c,
               Comments__c,
               PotentialCompellingEvent__c,
               OurPotentialUniqueBusinessValue__c,
               KeyRiskstoourUBV__c,
               OutcomeDrivers__c,
               ApproachStrategy__c,
               Surest_Last_Action_Taken__c,
               Surest_Next_Action_to_be_Taken__c,
               Surest_Approach_Strategy__c,
               Surest_Network_Constraints__c,
               Surest_Comments__c,
               Network_Contracting_Issue_Other__c,
               Private_Equity_Relationship__c,
               Coveted_Account__c,
               Web_Address__c,
               Primary_Situs_State__c,
               BillingAddress,
               BillingCity,
               Health_Plan_Manager_Industry__c,
               AnnualRevenue__c,
               X2nd_Blues_Bid_Comments__c,
               Eligible_for_2nd_Blues_Bid__c
            FROM Account
            LIMIT 1
        ];
        
        // Clone ONLY for oldMap reference (no DML on this)
        Account accOld = accNew.clone(true, true, true, true);
        
        accNew.BusinessPressures__c = 'Updated Pressure';
        accNew.Comments__c = 'Updated Comment';
        accNew.Web_Address__c = 'https://updated.com';
        
        Map<Id, Account> oldMap = new Map<Id, Account>{
            accNew.Id => accOld
        };
        
        Test.startTest();
            update accNew; // ✅ valid update (Id exists)
            AccountStrategyMemoHandler.updateStrategyMemos(
                new List<Account>{ accNew },
                oldMap
            );
        Test.stopTest();


        Strategy_Memo__c memo = [
            SELECT Business_Pressures__c,
                   Business_Overview__c,
                   Website_URL__c
            FROM Strategy_Memo__c
            LIMIT 1
        ];

        System.assertEquals(
            'Updated Pressure',
            memo.Business_Pressures__c,
            'Business Pressures should sync'
        );
        System.assertEquals(
            'Updated Comment',
            memo.Business_Overview__c,
            'Comments should sync'
        );
        System.assertEquals(
            'https://updated.com',
            memo.Website_URL__c,
            'Website should sync'
        );
    }

}