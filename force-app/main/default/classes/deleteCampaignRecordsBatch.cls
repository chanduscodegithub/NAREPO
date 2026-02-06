global class deleteCampaignRecordsBatch implements Database.Batchable<sObject> {
   global final String deleteQuery;
   global final List<String> correspondenceTypes;
   global final List<String> surveyTypes;
   global final String emailId;
   global final String campId;

   global deleteCampaignRecordsBatch(String q1, List<String> cT, List<String> sT,String email, String cId){
             deleteQuery=q1; correspondenceTypes=cT; surveyTypes=sT; emailId=email; campId = cId;
   }

   global Database.QueryLocator start(Database.BatchableContext BC){
      System.debug('Inside Delete Batch Start q='+deleteQuery);
      return Database.getQueryLocator(deleteQuery);
   }

   global void execute(Database.BatchableContext BC, List<sObject> scope){
      delete scope;
      DataBase.emptyRecycleBin(scope);
   }

   global void finish(Database.BatchableContext BC){
       Id batchInstanceId = Database.executeBatch(new syncCampaignRecordsBatch(correspondenceTypes,surveyTypes,emailId,campId), 200);
   }
}