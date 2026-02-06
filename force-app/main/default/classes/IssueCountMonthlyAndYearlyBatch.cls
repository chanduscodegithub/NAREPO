/**
* Purpose     : Update Merit volume (count of issues in rolling 365 days) and salesforce Activity (count of issues in rolling 30 day)
* Class       : IssueCountMonthlyAndYearlyBatch
* Test class  : IssueCountMonthlyAndYearlyBatchTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
global without sharing class IssueCountMonthlyAndYearlyBatch implements Database.Batchable<AggregateResult>, Database.Stateful
{
    global Iterable<AggregateResult> start(Database.BatchableContext BC){ 
        String query = 'SELECT COUNT (Id) pid, Policy__c FROM Policycase__c where createddate=LAST_N_DAYS:365 group by Policy__c'; 
        return new IssueCount_AggregateResultIterable(query); 
    }
    public List<String> pidsListfinal = new List<String>();
    public Map<String,Integer> policyId_and_Count_365_Map = new Map<String,Integer>();
    Map<String,Integer> policyId_and_Count_30_Map = new Map<string,Integer>(); 
    global void execute(Database.BatchableContext bc, List<AggregateResult> scope){
        for(sObject aggRes: scope){
            String policyId = (String) aggRes.get('Policy__c');
            Integer policyCount = (Integer) aggRes.get('pid');
            pidsListfinal.add(policyId);
            policyId_and_Count_365_Map.put(policyId ,policyCount);
        }
        List<Policy_Information__c> policy_case_last_list2 = [SELECT Id FROM Policy_Information__c where ID NOT IN :pidsListfinal and Salesforce_Volume__c!=0 ];
    }
    global void finish(Database.BatchableContext bc){
        List<AggregateResult> policy_case_last_365_list =
            [SELECT count(Id) pid, Policy__c FROM Policycase__c 
             where id not in : pidsListfinal   group by Policy__c ];
        for(AggregateResult aggRes:policy_case_last_365_list){
            Id policyId = (Id) aggRes.get('Policy__c');
            Integer policyCount = (Integer) aggRes.get('pid');
            policyId_and_Count_365_Map.put(aggRes.id ,0);
        }
        List<AggregateResult> policy_case_last_30_list = [SELECT count(Id) pid, Policy__c FROM Policycase__c where createddate=LAST_N_DAYS:30  group by Policy__c ];
        for(AggregateResult aggRes:policy_case_last_30_list){
            string policyId = (string) aggRes.get('Policy__c');
            Integer policyCount = (Integer) aggRes.get('pid');
            policyId_and_Count_30_Map.put(policyId ,policyCount);
        }
        List<Policy_Information__c> policy_case_last_list3 = [SELECT Id FROM Policy_Information__c where ID not in :policyId_and_Count_30_Map.keyset() and Salesforce_Activity__c!=0 ];
        for(Policy_Information__c aggRes:policy_case_last_list3){
            id policyId= aggRes.id;
            policyId_and_Count_30_Map.put(aggRes.id ,0);
        }
        IssueCountBatchHelper.policy_Update_With_Issue_Count(policyId_and_Count_365_Map, 'year');
        IssueCountBatchHelper.policy_Update_With_Issue_Count(policyId_and_Count_30_Map, 'month');
    }
}