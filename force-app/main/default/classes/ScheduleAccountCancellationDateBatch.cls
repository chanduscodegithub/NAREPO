global class ScheduleAccountCancellationDateBatch implements Schedulable {
    global void execute(SchedulableContext sc) {
        AccountCancellationDateBatch b = new AccountCancellationDateBatch(); 
        database.executebatch(b);
    }
}