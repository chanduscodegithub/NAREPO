/**
* Purpose     : test class for IssueCountBatchHelper and IssueCountMonthlyAndYearlyBatch
* Class       : IssueCountBatchHelper
* Test class  : IssueCountMonthlyAndYearlyBatchTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
@isTest
public class IssueCountMonthlyAndYearlyBatchTest {
    @isTest static void check(){
        Account acc= new account (); 
        acc.name='test account';
        acc.Subtype__c='Enterprise Strategic Accounts';
        insert acc;
        
        list<policy_information__c>c=new list<policy_information__c>();
        // for(integer i=0;i<200;i++){
        policy_information__c g=new policy_information__c();
        g.Name='77341234';
        g.Company__c=acc.Id;
        c.add(g);
        // }
        insert c;
        
        case ca = new case();
        ca.accountId=acc.Id;
        insert ca;
        
        Policycase__c pc = new Policycase__c();
        pc.Policy__c=g.Id;
        pc.Case__c=ca.Id;
        insert pc;
        
        List<AggregateResult> ar =new list<AggregateResult>();
        
        Test.startTest();
        IssueCountMonthlyAndYearlyBatch bc = new IssueCountMonthlyAndYearlyBatch();
        database.executeBatch(bc);
        Datetime dt = Datetime.now().addMinutes(1);
        String CRON_EXP = '0 '+ dt.minute() + ' * ' + dt.day() + ' ' + dt.month() + ' ? ' + dt.year();
        System.schedule('Test  Batch', CRON_EXP, new IssueCountMonthlyAndYearlyBatch_Se() );   
        Test.stopTest();
    }
}