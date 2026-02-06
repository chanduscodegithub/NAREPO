/**
* Purpose     : Update Merit volume (count of issues in rolling 365 days)
* Class       : CP_IssueCountYearlyBatch
* Test class  : IssueCountMonthlyAndYearlyBatchTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
global without sharing class CP_IssueCountYearlyBatch implements Schedulable, Database.Batchable<AggregateResult>, Database.Stateful
{
    global Set<Id> policyInfoUpdateIdList = new Set<Id>();
   // global Map<Id,Integer> policyInfoUpdateMap = new Map<Id,Integer>();
    global Iterable<AggregateResult> start(Database.BatchableContext BC){ 
        //get the policy case for rolling 365 days 
         
        String query = 'SELECT COUNT (Id) pid, Policy__c FROM Policycase__c where createddate=LAST_N_DAYS:365 and Case__r.RecordTypeId NOT IN (:isRequestIssueRecordTypeId, :bciReviewIssueRecordTypeId, :sbsSupportIssueRecordTypeId) group by Policy__c'; 
      
        return new IssueCount_AggregateResultIterable(query); 
    }
    global void execute(SchedulableContext context) {
        Database.executeBatch(new CP_IssueCountYearlyBatch(),100);
    }
    global void execute(Database.BatchableContext bc, List<AggregateResult> scope){
        List<Policy_Information__c> policyInfoUpdateListDml = new List<Policy_Information__c>();
        system.debug('scope==='+scope);
        for(sObject aggRes: scope){
            Id policyId = (Id) aggRes.get('Policy__c');
            Integer policyCount = (Integer) aggRes.get('pid');
            if(policyId!=null && policyCount!=null){
                policyInfoUpdateListDml.add(new Policy_Information__c(Id=policyId,Salesforce_Volume__c=policyCount));
                policyInfoUpdateIdList.add(policyId);  
            }
        }
        if(!policyInfoUpdateListDml.isempty() && policyInfoUpdateListDml!=null ){
            update policyInfoUpdateListDml;
        }
    }
    global void finish(Database.BatchableContext bc){
        database.executeBatch(new CP_IssueCountNonYearlyBatch(policyInfoUpdateIdList),100);
    }
}