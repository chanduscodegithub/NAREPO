/**
* Purpose     : Iterator for Update Merit volume (count of issues in rolling 365 days) and salesforce Activity (count of issues in rolling 30 day)
* Class       : IssueCount_AggregateResultIterator
* Test class  : IssueCountMonthlyAndYearlyBatchTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
global class IssueCount_AggregateResultIterator Implements Iterator<AggregateResult>{
    AggregateResult [] results {get;set;}
    Integer index {get;set;}
    Id isRequestIssueRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Customer_Impacted').getRecordTypeId();
         Id bciReviewIssueRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('BCI_Review').getRecordTypeId();
         Id sbsSupportIssueRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Support').getRecordTypeId();
        List<Id> idList = new List<Id>();
    
    global IssueCount_AggregateResultIterator(string query){
        index = 0;
        system.debug('bciReviewIssueRecordTypeId----'+bciReviewIssueRecordTypeId);
        results = Database.query(query);
    }
    global boolean hasNext(){
        return results !=null && !results.isEmpty() && index < results.size();
    }
    global AggregateResult next(){
        return results[index++];
    }
}