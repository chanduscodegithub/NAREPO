/**
* Purpose     : Schedulabler for IssueCountMonthlyAndYearlyBatch
* Class       : IssueCountMonthlyAndYearlyBatch_Se
* Test class  : IssueCountMonthlyAndYearlyBatchTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
global without sharing class IssueCountMonthlyAndYearlyBatch_Se  implements Schedulable {
    
    global void execute(SchedulableContext sc) {
        IssueCountMonthlyAndYearlyBatch ic1 = new IssueCountMonthlyAndYearlyBatch();
        database.executebatch(ic1);
    }
}