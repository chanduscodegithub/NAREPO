/**
* Purpose     : Schedulabler for 
* Class       : CP_IssueMonthlyAndYearly_Schedule
* Test class  : IssueCountMonthlyAndYearlyBatchTest 
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
global without sharing class CP_IssueMonthlyAndYearly_Schedule  implements Schedulable {
    
    global void execute(SchedulableContext sc) {
        CP_IssueCountYearlyBatch ic1 = new CP_IssueCountYearlyBatch();
        database.executebatch(ic1,100);
    }
}