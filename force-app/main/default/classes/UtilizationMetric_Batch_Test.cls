/*------------------------------------------------------------------------------------
Author:        Paras Prajapati
Description:   This will be the test class for UtilizationMetric_Batch and UtilizationMatric_Batch_Handler Apex Class
History
Date            Author             Comments
--------------------------------------------------------------------------------------
09-09-2019      Paras Prajapati    
------------------------------------------------------------------------------------*/
@isTest
public class UtilizationMetric_Batch_Test { 
    public testmethod static void whenNoCalenderRecordsAndCurrentDayHaveHoliday(){
        Date dt = system.today();
        List<Holiday> holidaysList = new List<Holiday>();
        User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        System.runAs (thisUser) {
            Profile p = [SELECT Id FROM Profile WHERE Name='NA Services Community Profile'];
            UserRole r = [SELECT Id FROM UserRole WHERE Name='CRM Administrator'];
            User userRecord = new User(alias = 'tUser', email='tUser@crmit.com', languagelocalekey='en_US', FirstName = 'User', lastname='test',
                              emailencodingkey='UTF-8',  localesidkey='en_US', profileid = p.Id, userroleid = r.Id, 
                              timezonesidkey='America/Los_Angeles', Exclude_from_Utilization_Metric__c=false, username='utilization@test.com', Position__c ='Test User');
            insert userRecord;
            List<User> testUser = [Select id,profile.name,ManagerId from User where profile.name='NA Services Community Profile' AND id=:userRecord.Id ];
            System.debug('testUser size' + testUser);
            Holiday hol1 = new Holiday(Name='Test holiday1', activitydate = dt);
            Holiday hol2 = new Holiday(Name='Test holiday2', activitydate = dt.addDays(1));
            holidaysList.add(hol1);
            holidaysList.add(hol2);
            insert holidaysList;
            Test.startTest();
            Database.executeBatch(new UtilizationMetric_Batch());
            Test.stopTest();
            List<Utilization_Metric__c> listOfUtilizationMetric = [Select Id,User__c,User_Working_Day__c from Utilization_Metric__c ];
            System.assertEquals(listOfUtilizationMetric.size(), 1, 'No Utilization_Metric__c Records will be created on holiday');
        }
    }
    
    public testmethod static void whenNoCalenderRecordsAndNoHoliday(){
        Date dt = system.today();
        List<Holiday> holidaysList = new List<Holiday>();
        User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        System.runAs (thisUser) {
            Profile p = [SELECT Id FROM Profile WHERE Name='NA Services Community Profile'];
            UserRole r = [SELECT Id FROM UserRole WHERE Name='CRM Administrator'];
            User userRecord = new User(alias = 'tUser', email='tUser@crmit.com', languagelocalekey='en_US', FirstName = 'User', lastname='test',
                              emailencodingkey='UTF-8',  localesidkey='en_US', profileid = p.Id, userroleid = r.Id, 
                              timezonesidkey='America/Los_Angeles', Exclude_from_Utilization_Metric__c=false, username='utilization@test.com', Position__c ='Test User');
            insert userRecord;
            List<User> testUser = [Select id,profile.name,ManagerId from User where profile.name='NA Services Community Profile' AND id=:userRecord.Id ];
            System.debug('testUser size' + testUser);
            Holiday hol1 = new Holiday(Name='Test holiday1', activitydate = dt.addDays(1));
            holidaysList.add(hol1);
            insert holidaysList;
            Test.startTest();
            Database.executeBatch(new UtilizationMetric_Batch());
            Test.stopTest();
            List<Utilization_Metric__c> listOfUtilizationMetric =  [Select Id,User__c,User_Working_Day__c from Utilization_Metric__c ];
            System.assertEquals(listOfUtilizationMetric.size(), 1, 'Utilization_Metric__c Records will be created');
            //System.assertEquals(listOfUtilizationMetric[0].User_Working_Day__c, 1, 'Utilization_Metric__c Records will be created');
        }
    }
    
    public testmethod static void withCalenderRecordsAndNoHoliday(){
        Date dt = system.today();
        List<Holiday> holidaysList = new List<Holiday>();
        User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        System.runAs (thisUser) {
            Profile p = [SELECT Id FROM Profile WHERE Name='NA Services Community Profile'];
            UserRole r = [SELECT Id FROM UserRole WHERE Name='CRM Administrator'];
            User userRecord = new User(alias = 'tUser', email='tUser@crmit.com', languagelocalekey='en_US', FirstName = 'User', lastname='test',
                              emailencodingkey='UTF-8',  localesidkey='en_US', profileid = p.Id, userroleid = r.Id, 
                              timezonesidkey='America/Los_Angeles', Exclude_from_Utilization_Metric__c=false, username='utilization@test.com', Position__c ='Test User');
            insert userRecord;
            
            User_Calendar__c calendarRecord = new User_Calendar__c();
            calendarRecord.Leave_Start_date__c = dt;
            calendarRecord.Leave_End_date__c=dt;
            calendarRecord.User__c = userRecord.Id;
            insert calendarRecord;

            Holiday hol1 = new Holiday(Name='Test holiday1', activitydate = dt.addDays(1));
            holidaysList.add(hol1);
            insert holidaysList;
            
            Test.startTest();
            Database.executeBatch(new UtilizationMetric_Batch());
            Test.stopTest();
            List<Utilization_Metric__c> listOfUtilizationMetric = [Select Id,User__c,User_Working_Day__c from Utilization_Metric__c ];
            System.assertEquals(listOfUtilizationMetric.size(), 1, 'Utilization_Metric__c Records will be created');
            //System.assertEquals(listOfUtilizationMetric[0].User_Working_Day__c, 1, 'Utilization_Metric__c Records will be created, but user is not working');
            
        }
    }
}