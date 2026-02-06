/**
* Purpose     : Iterable for Update Merit volume (count of issues in rolling 365 days) and salesforce Activity (count of issues in rolling 30 day)
* Class       : IssueCount_AggregateResultIterable
* Test class  : IssueCountMonthlyAndYearlyBatchTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
global class IssueCount_AggregateResultIterable implements Iterable<AggregateResult>{
    public String query;
    global IssueCount_AggregateResultIterable(String soql){
        query = soql;
    }
    global Iterator<AggregateResult> Iterator(){
        return new IssueCount_AggregateResultIterator(query);
    }
}