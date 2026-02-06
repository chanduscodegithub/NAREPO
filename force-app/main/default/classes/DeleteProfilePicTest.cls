@isTest(SeeAllData=true)
public class DeleteProfilePicTest {
    
    public testmethod static void testDeleteProfilePicBatch() {
        List<User> usersToInsert = new List<User>();
        Profile p = [SELECT Id FROM Profile WHERE Name='NA Services Community Profile'];
        UserRole r = [SELECT Id FROM UserRole WHERE Name='CRM Administrator'];
        User userRecord = new User(alias = 'tUser', email='tUser@crmit.com', languagelocalekey='en_US', FirstName = 'User', lastname='test',
                                   emailencodingkey='UTF-8',  localesidkey='en_US', profileid = p.Id, userroleid = r.Id, 
                                   timezonesidkey='America/Los_Angeles', Exclude_from_Utilization_Metric__c=false, username='utilization@test.com', Position__c ='Test User');
        insert userRecord;
        //DeleteProfilePic batchJob = new DeleteProfilePic();
        Test.startTest();
        Database.executeBatch(new DeleteProfilePic(),100);
        Test.stopTest();
        
        
        
    }
    
    
}