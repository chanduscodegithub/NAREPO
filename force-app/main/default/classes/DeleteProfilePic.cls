public class DeleteProfilePic implements Database.Batchable<sObject>, Database.Stateful{
    public Database.QueryLocator start(Database.BatchableContext context) {
        string s =System.Label.deleteProfilePicLimit;
        string sQuery = ' SELECT Id FROM user limit  ' + Integer.valueOf(s);

        return Database.getQueryLocator(sQuery);
    }
    public void execute(Database.BatchableContext context, List<user> conRecordsToProcess) {
        for (User u: conRecordsToProcess)
        {
            ConnectApi.UserProfiles.deletePhoto(null, u.id);
        }
    }
    public void finish(Database.BatchableContext context) {
        
    }
}