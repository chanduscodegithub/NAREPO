/**
* Purpose     : Update Merit volume (count of issues in non rolling 365 days)
* Class       : CP_IssueCountNonMonthlyBatch
* Test class  : IssueCountMonthlyAndYearlyBatchTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class*==============================================================================

*/
global class CP_IssueCountNonMonthlyBatch implements Database.Batchable <SObject>{
    String query;
    set<Id> policyInfoUpdateIdHoldList;
    global CP_IssueCountNonMonthlyBatch(Set<Id> policyInfoUpdateIdHold) {
         policyInfoUpdateIdHoldList = new set<Id> ();
        policyInfoUpdateIdHoldList.addAll(policyInfoUpdateIdHold);
        if(policyInfoUpdateIdHoldList.size()>0){
             query = 'SELECT Id ,Salesforce_Activity__c  FROM Policy_Information__c where Id not in:policyInfoUpdateIdHoldList and Salesforce_Activity__c!=0';
        }else{
            query = 'SELECT Id ,Salesforce_Activity__c  FROM Policy_Information__c where Salesforce_Activity__c!=0';
        }
       
    }
    global Database.QueryLocator start (Database.BatchableContext bc)
    {
        return Database.getQueryLocator(query);
    }
    global void execute(Database.BatchableContext bc, List<Policy_Information__c> policyInfoList)
    {
        system.debug('policyInfoList@@'+policyInfoList.size());
         
        List<Policy_Information__c> policyInfoActivityupdateList = new List<Policy_Information__c> ();
        for(Policy_Information__c pi :policyInfoList)
        {
            pi.Salesforce_Activity__c=0;
            policyInfoActivityupdateList.add(pi);
            
            
        }
        
        update policyInfoActivityupdateList;
    }
    
    global void finish(Database.BatchableContext bc)
    {
    }
    
}