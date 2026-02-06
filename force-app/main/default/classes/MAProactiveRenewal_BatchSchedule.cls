global class MAProactiveRenewal_BatchSchedule implements Schedulable {
	global void execute(SchedulableContext ctx) {
        MAProactiveRenewal_Batch maProactiveRenewalBatchObj = new MAProactiveRenewal_Batch(); 
        database.executebatch(maProactiveRenewalBatchObj);
    }
}