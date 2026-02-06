@isTest
public class PersistencyCalculationBatchTest {
    
    static testMethod void testMethod1() 
    { 
        List<Account> lstAccount= new List<Account>();
        for(Integer i=0 ;i <20;i++)
        {
            account acc =new account();
            acc.Name ='test account'+i;
            acc.Subtype__c ='CVG';
            lstAccount.add(acc);
        }
        
        insert lstAccount;
        integer j=0;
        List<PolicyAccountMembership__c> lstPol= new List<PolicyAccountMembership__c>();
        for(Integer i=0 ;i <20;i++)
        {
            PolicyAccountMembership__c pol = new PolicyAccountMembership__c();
            pol.Name ='Total GL Membership';
            pol.MembershipType__c='Medical';
            pol.AccountFirm__c =lstAccount[j].Id;
            pol.GLMembership__c =1200;
            pol.Business_Line__c ='abc';
            if(i<10)
                pol.GLDate__c =Date.newInstance(2019, 2, 28);
            else if(i>=10)
                pol.GLDate__c =Date.newInstance(2020, 2, 29);
            lstPol.add(pol);
            j++;
            if(j>=10){
                j=0;
            } 
        }
        PolicyAccountMembership__c pol = new PolicyAccountMembership__c();
        pol.Name ='Total GL Membership';
        pol.MembershipType__c='Medical';
        pol.AccountFirm__c =lstAccount[18].Id;
        pol.GLMembership__c =1200;
        pol.Business_Line__c ='abc';
        pol.GLDate__c =Date.newInstance(2019, 2, 28);
        lstPol.add(pol);
        insert lstPol;
        
        Test.startTest();
        
        PersistencyCalculationBatch obj = new PersistencyCalculationBatch();
        DataBase.executeBatch(obj); 
        
        Test.stopTest();
        
    }
}