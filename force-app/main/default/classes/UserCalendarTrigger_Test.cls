@isTest
public class UserCalendarTrigger_Test {
    
    public static List<User> createUsers(Integer numberOfUsers){
        Profile p = [SELECT Id FROM Profile WHERE Name='NA Services Community Profile'];
        UserRole r = [SELECT Id FROM UserRole WHERE Name='CRM Administrator'];
        List<User> listOfUsers = new List<User>();
        for(Integer index=0 ; index<numberOfUsers ; index++){
            User userRecord = new User(alias = 'tUser', email='User'+index+'@crmit.com', languagelocalekey='en_US', FirstName = 'User', lastname='test',
                                       emailencodingkey='UTF-8',  localesidkey='en_US', profileid = p.Id, userroleid = r.Id, 
                                       timezonesidkey='America/Los_Angeles',  username='utilization'+index+'@test.com', Position__c ='Test User');
            listOfUsers.add(userRecord);
        }
        insert listOfUsers;
        return listOfUsers;
    }
    
    public static Utilization_Metric__c createUtilizationRecord(User userRecord){
        Utilization_Metric__c utilizationMetricRecord = new Utilization_Metric__c();
        utilizationMetricRecord.Date__c = System.today();
        utilizationMetricRecord.User__c = userRecord.Id;
        utilizationMetricRecord.Manager_New__c=userRecord.ManagerId;
        utilizationMetricRecord.User_Working_Day__c=1;
        return utilizationMetricRecord;
    }
    
    public static User_Calendar__c createUserCalenderRecord(Date startDate,Date endDate, User userRecord){
        User_Calendar__c calendarRecord = new User_Calendar__c();
        calendarRecord.Leave_Start_date__c = startDate;
        calendarRecord.Leave_End_date__c=endDate;
        calendarRecord.User__c = userRecord.Id;
        return calendarRecord;
    }
    
    public testmethod static void whenUserCalendarRecordStartDateUpdate(){
        List<Utilization_Metric__c> listOfUtilizationMetric = new List<Utilization_Metric__c>();
        Date dateFromWhichRecordNeedToCreated = date.valueOf('2019-09-09'); 

        List<Holiday> holidaysList = new List<Holiday>();
        User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        System.runAs (thisUser) {
            Profile p = [SELECT Id FROM Profile WHERE Name='NA Services Community Profile'];
            UserRole r = [SELECT Id FROM UserRole WHERE Name='CRM Administrator'];
            List<User> listOfUsers = createUsers(1);
            Utilization_Metric__c utilizationMetricRecord1 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord1.Date__c = dateFromWhichRecordNeedToCreated;
            
            Utilization_Metric__c utilizationMetricRecord2 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord2.Date__c = dateFromWhichRecordNeedToCreated.addDays(1);
            
            Utilization_Metric__c utilizationMetricRecord3 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord3.Date__c = dateFromWhichRecordNeedToCreated.addDays(2);
            
            Utilization_Metric__c utilizationMetricRecord4 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord4.Date__c = dateFromWhichRecordNeedToCreated.addDays(3);
            
            Utilization_Metric__c utilizationMetricRecord5 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord5.Date__c = dateFromWhichRecordNeedToCreated.addDays(4);
            
            listOfUtilizationMetric.add(utilizationMetricRecord1);
            listOfUtilizationMetric.add(utilizationMetricRecord2);
            listOfUtilizationMetric.add(utilizationMetricRecord3);
            listOfUtilizationMetric.add(utilizationMetricRecord4);
            listOfUtilizationMetric.add(utilizationMetricRecord5);
            insert listOfUtilizationMetric; 
           
            User_Calendar__c calendarRecord = createUserCalenderRecord(dateFromWhichRecordNeedToCreated,dateFromWhichRecordNeedToCreated.addDays(4), listOfUsers.get(0));
            insert calendarRecord;
            
            // Change Start Date
            calendarRecord.Leave_Start_date__c = dateFromWhichRecordNeedToCreated.addDays(2);
            update calendarRecord;
            System.debug('calendarRecord>>>>>>' + calendarRecord);
            List<Utilization_Metric__c> utilizationMetric = [Select Id,User__c,Date__c,User_Working_Day__c from Utilization_Metric__c where Date__c=:dateFromWhichRecordNeedToCreated.addDays(2)];
            System.debug('utilizationMetric' + utilizationMetric);
            System.assertEquals(utilizationMetric.get(0).User_Working_Day__c, 0, 'Working day will be updated to 0');
            
            calendarRecord.Leave_Start_date__c = dateFromWhichRecordNeedToCreated.addDays(1);
            update calendarRecord;
            System.debug('calendarRecord>>>>>>' + calendarRecord);
            utilizationMetric = [Select Id,User__c,Date__c,User_Working_Day__c from Utilization_Metric__c where Date__c=:dateFromWhichRecordNeedToCreated.addDays(1)];
            System.debug('utilizationMetric>>>>>>' + utilizationMetric);
            System.assertEquals(utilizationMetric.get(0).User_Working_Day__c, 0, 'Working day will be updated to 0');
        }
    }
    
    public testmethod static void whenUserCalendarRecordEndDateUpdate(){
        List<Utilization_Metric__c> listOfUtilizationMetric = new List<Utilization_Metric__c>();
        Date dateFromWhichRecordNeedToCreated = date.valueOf('2019-09-09');

        List<Holiday> holidaysList = new List<Holiday>();
        User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        System.runAs (thisUser) {
            Profile p = [SELECT Id FROM Profile WHERE Name='NA Services Community Profile'];
            UserRole r = [SELECT Id FROM UserRole WHERE Name='CRM Administrator'];
            List<User> listOfUsers = createUsers(1);
            Utilization_Metric__c utilizationMetricRecord1 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord1.Date__c = dateFromWhichRecordNeedToCreated;
            
            Utilization_Metric__c utilizationMetricRecord2 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord2.Date__c = dateFromWhichRecordNeedToCreated.addDays(1);
            
            Utilization_Metric__c utilizationMetricRecord3 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord3.Date__c = dateFromWhichRecordNeedToCreated.addDays(2);
            
            Utilization_Metric__c utilizationMetricRecord4 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord4.Date__c = dateFromWhichRecordNeedToCreated.addDays(3);
            
            Utilization_Metric__c utilizationMetricRecord5 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord5.Date__c = dateFromWhichRecordNeedToCreated.addDays(4);
            
            Utilization_Metric__c utilizationMetricRecord7 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord7.Date__c = dateFromWhichRecordNeedToCreated.addDays(7);
            
            listOfUtilizationMetric.add(utilizationMetricRecord1);
            listOfUtilizationMetric.add(utilizationMetricRecord2);
            listOfUtilizationMetric.add(utilizationMetricRecord3);
            listOfUtilizationMetric.add(utilizationMetricRecord4);
            listOfUtilizationMetric.add(utilizationMetricRecord5);
            listOfUtilizationMetric.add(utilizationMetricRecord7);
            insert listOfUtilizationMetric; 
            System.debug('listOfUtilizationMetric>>>' + listOfUtilizationMetric);
            User_Calendar__c calendarRecord = createUserCalenderRecord(dateFromWhichRecordNeedToCreated,dateFromWhichRecordNeedToCreated.addDays(4), listOfUsers.get(0));
           
            insert calendarRecord;
             System.debug('calendarRecord' + calendarRecord);
            // Change Start Date
            calendarRecord.Leave_End_date__c = dateFromWhichRecordNeedToCreated.addDays(3);
            update calendarRecord;
            System.debug('calendarRecord2' + calendarRecord);
            List<Utilization_Metric__c> utilizationMetric = [Select Id,User__c,Date__c,User_Working_Day__c from Utilization_Metric__c where Date__c=:dateFromWhichRecordNeedToCreated.addDays(4)];
            System.debug('utilizationMetric' + utilizationMetric);
            System.assertEquals(utilizationMetric.get(0).User_Working_Day__c, 1, 'Working day will be updated to 1');
            
            calendarRecord.Leave_End_date__c = dateFromWhichRecordNeedToCreated.addDays(7);
            update calendarRecord;
            System.debug('calendarRecord2' + calendarRecord);
            utilizationMetric = [Select Id,User__c,Date__c,User_Working_Day__c from Utilization_Metric__c where Date__c=:dateFromWhichRecordNeedToCreated.addDays(7)];
            System.debug('utilizationMetric' + utilizationMetric);
            System.assertEquals(utilizationMetric.get(0).User_Working_Day__c, 0, 'Working day will be updated to 1');
        }
    }
    
    public testmethod static void whenUserCalendarRecordStartAndEndDateUpdate(){
        List<Utilization_Metric__c> listOfUtilizationMetric = new List<Utilization_Metric__c>();
        Date dateFromWhichRecordNeedToCreated = date.valueOf('2019-09-09');

        List<Holiday> holidaysList = new List<Holiday>();
        User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        System.runAs (thisUser) {
            Profile p = [SELECT Id FROM Profile WHERE Name='NA Services Community Profile'];
            UserRole r = [SELECT Id FROM UserRole WHERE Name='CRM Administrator'];
            List<User> listOfUsers = createUsers(1);
            Utilization_Metric__c utilizationMetricRecord1 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord1.Date__c = dateFromWhichRecordNeedToCreated;
            
            Utilization_Metric__c utilizationMetricRecord2 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord2.Date__c = dateFromWhichRecordNeedToCreated.addDays(1);
            
            Utilization_Metric__c utilizationMetricRecord3 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord3.Date__c = dateFromWhichRecordNeedToCreated.addDays(2);
            
            Utilization_Metric__c utilizationMetricRecord4 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord4.Date__c = dateFromWhichRecordNeedToCreated.addDays(3);
            
            Utilization_Metric__c utilizationMetricRecord5 = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord5.Date__c = dateFromWhichRecordNeedToCreated.addDays(4);
            
            listOfUtilizationMetric.add(utilizationMetricRecord1);
            listOfUtilizationMetric.add(utilizationMetricRecord2);
            listOfUtilizationMetric.add(utilizationMetricRecord3);
            listOfUtilizationMetric.add(utilizationMetricRecord4);
            listOfUtilizationMetric.add(utilizationMetricRecord5);
            insert listOfUtilizationMetric; 
            System.debug('listOfUtilizationMetric>>>' + listOfUtilizationMetric);
            User_Calendar__c calendarRecord = createUserCalenderRecord(dateFromWhichRecordNeedToCreated,dateFromWhichRecordNeedToCreated.addDays(4), listOfUsers.get(0));
           
            insert calendarRecord;
             System.debug('calendarRecord' + calendarRecord);
            // Change Start Date
            calendarRecord.Leave_Start_date__c = dateFromWhichRecordNeedToCreated.addDays(1);
            calendarRecord.Leave_End_date__c = dateFromWhichRecordNeedToCreated.addDays(3);
            update calendarRecord;
            System.debug('calendarRecord2' + calendarRecord);
            List<Utilization_Metric__c> utilizationMetric = [Select Id,User__c,Date__c,User_Working_Day__c from Utilization_Metric__c where 
                                                             Date__c=:dateFromWhichRecordNeedToCreated];
            System.debug('utilizationMetric' + utilizationMetric);
            System.assertEquals(utilizationMetric.get(0).User_Working_Day__c, 1, 'Working day will be updated to 1');
            
            List<Utilization_Metric__c> utilizationMetric2 = [Select Id,User__c,Date__c,User_Working_Day__c from Utilization_Metric__c where Date__c=:dateFromWhichRecordNeedToCreated.addDays(4)];
            System.debug('utilizationMetric' + utilizationMetric2);
            System.assertEquals(utilizationMetric2.get(0).User_Working_Day__c, 1, 'Working day will be updated to 1');
        }
    }
    public testmethod static void whenUserCalendarRecordInsert(){
       Date dateFromWhichRecordNeedToCreated = date.valueOf('2019-09-09');
        User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        System.runAs (thisUser) {
            Profile p = [SELECT Id FROM Profile WHERE Name='NA Services Community Profile'];
            UserRole r = [SELECT Id FROM UserRole WHERE Name='CRM Administrator'];
            List<User> listOfUsers = createUsers(5);
            Utilization_Metric__c utilizationMetricRecord = createUtilizationRecord(listOfUsers.get(0));
            utilizationMetricRecord.Date__c = dateFromWhichRecordNeedToCreated;
            insert utilizationMetricRecord; 
            
            User_Calendar__c calendarRecord = new User_Calendar__c();
            calendarRecord.Leave_Start_date__c = dateFromWhichRecordNeedToCreated;
            calendarRecord.Leave_End_date__c=dateFromWhichRecordNeedToCreated.addDays(1);
            calendarRecord.User__c = listOfUsers.get(0).Id;
            insert calendarRecord;
            List<Utilization_Metric__c> listOfUtilizationMetric = [Select Id,User__c,User_Working_Day__c from Utilization_Metric__c where User__c=:listOfUsers.get(0).Id];
            System.assertEquals(listOfUtilizationMetric.get(0).User_Working_Day__c, 0, 'Working day will be updated to 0');
            
            delete calendarRecord;
            
            listOfUtilizationMetric = [Select Id,User__c,User_Working_Day__c from Utilization_Metric__c where User__c=:listOfUsers.get(0).Id];
            System.assertEquals(listOfUtilizationMetric.get(0).User_Working_Day__c, 1, 'Working day will be updated to 0');
        }
    }
    
    
}