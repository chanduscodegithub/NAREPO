/**
* Purpose     : test class for
* 			    CP_IssueCountYearlyBatch
CP_IssueCountNonYearlyBatch
CP_IssueCountMonthlyBatch
CP_IssueCountNonMonthlyBatch
CP_IssueMonthlyAndYearly_Schedule
* 
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Feb 2020     Initial Class
*==============================================================================
*/
@isTest
public class CP_IssueCountMonthlyAndYearlyBatchTest {
    @isTest static void check(){
        List<Account> accList = new List<Account>();
        Account acc= new account (); 
        acc.name='test account';
        acc.Subtype__c='Enterprise Strategic Accounts';
        accList.add(acc);
        Account acc2= new account (); 
        acc2.name='test account2';
        acc2.Subtype__c='Enterprise Strategic Accounts';
        accList.add(acc2);
        insert accList;
        
        
        list<policy_information__c>c=new list<policy_information__c>();
        
        policy_information__c g=new policy_information__c();
        g.Name='773412344';
        g.Company__c=acc.Id;
        g.Salesforce_Activity__c=20;
        g.Salesforce_Volume__c=144;
        g.Policy__c = 'test';
        c.add(g);
        
        policy_information__c g1=new policy_information__c();
        g1.Name='7734123454';
        g1.Company__c=acc.Id;
        g1.Salesforce_Activity__c=2;
        g1.Salesforce_Volume__c=14;
        g1.Policy__c = 'test';
        c.add(g1);
        insert c;
        
        List<case> cas = new List<case>();
        case ca = new case();
        ca.accountId=acc.Id;
        cas.add(ca);
        
        case ca1 = new case();
        ca1.accountId=acc.Id;
        cas.add(ca1);
        
        insert cas;
        
        List<Policycase__c> pcaselist = new List<Policycase__c>();
        Policycase__c pc = new Policycase__c();
        pc.Policy__c=c[0].Id;
        pc.Case__c=cas[0].Id;
        pc.CreatedDate=system.today()-400;
        pcaselist.add(pc);
        Policycase__c pc1 = new Policycase__c();
        pc1.Policy__c=c[0].Id;
        pc1.Case__c=cas[0].Id;
        pc1.CreatedDate=system.today()-500;
        pcaselist.add(pc1);
        Policycase__c pc2 = new Policycase__c();
        pc2.Policy__c=c[1].Id;
        pc2.Case__c=cas[1].Id;
        pcaselist.add(pc2);
        Policycase__c pc3 = new Policycase__c();
        pc3.Policy__c=c[1].Id;
        pc3.Case__c=cas[1].Id;
        pcaselist.add(pc3);
        insert pcaselist;
        
        
        list<Policy_Information__c> policyList = [SELECT Id ,Salesforce_Volume__c  FROM Policy_Information__c where Id !=:pc1.id and Salesforce_Volume__c!=0];
        system.debug('policyListpolicyList@@'+policyList);
        List<AggregateResult> ar =new list<AggregateResult>();
        
        Test.startTest();
        List<AggregateResult> scope360 =[SELECT COUNT (Id) pid, Policy__c FROM Policycase__c where createddate=LAST_N_DAYS:365 group by Policy__c] ;
        List<AggregateResult> scopenon360 =[SELECT COUNT (Id) pid, Policy__c FROM Policycase__c where createddate!=LAST_N_DAYS:365 group by Policy__c];
        List<AggregateResult> scope30 =[SELECT COUNT (Id) pid, Policy__c FROM Policycase__c where createddate=LAST_N_DAYS:30 group by Policy__c];
        List<AggregateResult> scopenon30 =[SELECT COUNT (Id) pid, Policy__c FROM Policycase__c where createddate!=LAST_N_DAYS:30 group by Policy__c];
        system.debug('scope360@@@' +scope360);
        system.debug('scopenon360@@@' +scopenon360);
        system.debug('scope30@@@' +scope30);
        system.debug('scopenon30@@@' +scopenon30);
        CP_IssueCountYearlyBatch bc = new CP_IssueCountYearlyBatch();
        database.executeBatch(bc);
        Datetime dt = Datetime.now().addMinutes(1);
        String CRON_EXP = '0 '+ dt.minute() + ' * ' + dt.day() + ' ' + dt.month() + ' ? ' + dt.year();
        System.schedule('Test  Batch', CRON_EXP, new CP_IssueMonthlyAndYearly_Schedule() );   
        Test.stopTest();
    }
}