/**
* Purpose     : test class for capacityPlan_UserCurrenWeightUpdate
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
@istest
public class capacityPlan_UserCurrenWeightUpdateTest {
    
    @testSetup static void createTestData(){
        Date myDate = Date.newInstance(2055, 2, 17);
        Date newDate = mydate.addDays(2);
        
        User readOnlyUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDevReadOnly@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
            Start_Date__c=newDate,
            Salary_Grade__c='26',
            Position__c='Test User');
        
        
        insert readOnlyUser;  
        System.assertequals('LIVE',readOnlyUser.LastName,'user lastname');
        System.assertequals('uhgDevReadOnly@crmit.com',readOnlyUser.Username,'username of the user');
        
    }
    public testMethod static void validateDeleteTeamMembers(){
        Date myDate = Date.newInstance(1992, 2, 17);
        Date newDate = mydate.addDays(2);
        
        User readOnlyUser1 = [Select Id ,Start_Date__c, Email,Years_of_Experience__c from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        readOnlyUser1.Email='jjjjjjjjj@crmit.com';
        readOnlyUser1.Start_Date__c=newDate;
        update readOnlyUser1;
        system.debug('readOnlyUser1'+readOnlyUser1.Years_of_Experience__c);
        
        Integer num = [select count() from User where Username = 'uhgDevReadOnly@crmit.com'];
        System.assertEquals(1, num,'total number of users created');
    }
}