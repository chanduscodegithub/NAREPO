/** ######################################################################################
* @author       Sudarshan Reddy M
* @date         03/22/2019
* @description  Test Class for HolidaysCountBasedOnCreatedDate Trigger
*                 
*##########################################################################################    */
@isTest
public class HolidaysCountBasedOnCreatedDateTest {
    
   
    @isTest
    public static void holidaysCountMethod(){
        Date dt = system.today();
        List<Holiday> holidaysList = new List<Holiday>();
        List<Utilization_Metric__c> umList = new List<Utilization_Metric__c>();
        
        User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        System.runAs (thisUser) {
            Profile p = [SELECT Id FROM Profile WHERE Name='Standard User'];
            UserRole r = [SELECT Id FROM UserRole WHERE Name='CRM Administrator'];
            User u = new User(alias = 'tUser', email='tUser@crmit.com', languagelocalekey='en_US', FirstName = 'User', lastname='test',
                              emailencodingkey='UTF-8',  localesidkey='en_US', profileid = p.Id, userroleid = r.Id, 
                              timezonesidkey='America/Los_Angeles',  username='jsmith@crmit.com', Position__c ='Test User');
            insert u;
            
            Holiday hol1 = new Holiday(Name='Test holiday1', activitydate = dt);
            holidaysList.add(hol1);
       
            insert holidaysList;
            
            Utilization_Metric__c um = new Utilization_Metric__c(date__c = dt);
            umList.add(um);
            
            insert umList;
            
        }
    }
}