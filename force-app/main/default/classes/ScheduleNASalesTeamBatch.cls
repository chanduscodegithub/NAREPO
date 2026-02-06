global class ScheduleNASalesTeamBatch implements Schedulable {
    global void execute(SchedulableContext sc) {
        NASalesTeamEmailNotoficationBatch b = new NASalesTeamEmailNotoficationBatch(); 
        database.executebatch(b);
    }
}