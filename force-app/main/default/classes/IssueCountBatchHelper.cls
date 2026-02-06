/**
* Purpose     : utility class for Update Merit volume (count of issues in rolling 365 days) and salesforce Activity (count of issues in rolling 30 day)
* Class       : IssueCountBatchHelper
* Test class  : IssueCountMonthlyAndYearlyBatchTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
public class IssueCountBatchHelper {
    public static void policy_Update_With_Issue_Count (Map<String, Integer> policyId_and_Count_Map,string daterange){
        List<Policy_Information__c> policyInfoUpdateListDml = new List<Policy_Information__c>();
        for(Policy_Information__c p:[select id,Salesforce_Volume__c,Salesforce_Activity__c
                                     from Policy_Information__c where id in :policyId_and_Count_Map.keyset()]){
                                         if(policyId_and_Count_Map.containsKey(p.Id) && daterange=='year'){
                                             p.Salesforce_Volume__c= policyId_and_Count_Map.get(p.Id);
                                         }
                                         if(policyId_and_Count_Map.containsKey(p.Id) && daterange=='month'){
                                             p.Salesforce_Activity__c= policyId_and_Count_Map.get(p.Id);
                                         }
                                         policyInfoUpdateListDml.add(p);
                                     }
        if(!policyInfoUpdateListDml.isempty() && policyInfoUpdateListDml!=null ){
            update policyInfoUpdateListDml;
        }
    }
    
    
}