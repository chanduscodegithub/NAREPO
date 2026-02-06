@isTest
public class CasePolicyControllerTest {
    @testSetup static void setup() {
        List<Account> testAccts = new List<Account>();
        for(Integer i=0;i<3;i++) {
            testAccts.add(new Account(Name = 'TestAcct'+i,Subtype__c = ' National Accounts - East',Type =' National Accounts - East'));
        }
        insert testAccts;
        
        List<Policy_Information__c> testPolicyInfo = new List<Policy_Information__c>();
        for(Integer i=0;i<3;i++) {
            for(Integer j=0;j<3;j++){
                testPolicyInfo.add(new Policy_Information__c(Name = 'Test policy'+i+j,Company__c = testAccts[i].Id,Policy__c = 'Test_Policy_crmit'));  
            }
        }
        insert testPolicyInfo;
        
        List<case> testCases = new List<Case>();
        for(Integer i=0;i<3;i++) {
            testCases.add(new case(AccountId = testAccts[i].Id,Status = 'Open'));  
        }
        insert testCases;
        PolicyCase__c PC = new PolicyCase__c();
        PC.Case__c = testCases[0].Id;
        PC.Policy__c = testPolicyInfo[0].Id;
        PC.UniqueCasePolicyAssociation__c = string.valueOf(testCases[0].Id)+ testPolicyInfo[0].Id;
        insert pc;
        
        PolicyCase__c PC1 = new PolicyCase__c();
        PC1.Case__c = testCases[0].Id;
        PC1.Policy__c = testPolicyInfo[1].Id;
        PC1.UniqueCasePolicyAssociation__c = string.valueOf(testCases[0].Id)+ testPolicyInfo[1].Id;
        insert pc1;
    }
    @isTest static void testMethod1() {
        Account acct = [SELECT Id FROM Account WHERE Name='TestAcct0' LIMIT 1];
        List<Policy_Information__c> pol = [SELECT Id,Name FROM Policy_Information__c WHERE Company__c= :acct.Id];
        Case caseQueried = [SELECT Id,CaseNumber FROM Case WHERE AccountId= :acct.Id LIMIT 1];
        PolicyCase__c polcase = [SELECT Id,Case__c,Policy__c FROM PolicyCase__c LIMIT 1];
        List<String> caseIdsList = new List<String>();
        caseIdsList.add(caseQueried.Id);
        List<String> polCaseIdsList = new List<String>();
        polCaseIdsList.add(polcase.Case__c);
        CasePolicyController.savePolicyList(caseIdsList, pol);
        CasePolicyController.deletePolicyList(polCaseIdsList, polcase.Id);
    }
    
    @isTest static void testMethod2() {
        Account acct = [SELECT Id FROM Account WHERE Name='TestAcct0' LIMIT 1];
        List<Policy_Information__c> pol = [SELECT Id,Name FROM Policy_Information__c WHERE Company__c= :acct.Id];
        Case caseQueried = [SELECT Id,CaseNumber FROM Case WHERE AccountId= :acct.Id LIMIT 1];
        CasePolicyController.RelatedCasePoliciesList(caseQueried.Id);
        CasePolicyController.RelatedCasePoliciesList('');
        CasePolicyController.getPolicies('');
        CasePolicyController.getPolicies(caseQueried.Id);
        CasePolicyController.getContactsForToday();
    }
    @isTest static void testMethod3(){
       Account acct = [SELECT Id FROM Account WHERE Name='TestAcct0' LIMIT 1];
        List<Case> caseQueried = [SELECT Id FROM Case WHERE AccountId= :acct.Id LIMIT 2];
        List<String> caseId = new List<String>();
        for(Integer i=0;i<caseQueried.size();i++){
           caseId.add(String.valueof(caseQueried[i].Id)); 
        }
        CasePolicyAssociation.CasePolicyAssociation(caseId);
           
    }
    
}