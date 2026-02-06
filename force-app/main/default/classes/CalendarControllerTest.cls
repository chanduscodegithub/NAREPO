@isTest
public class CalendarControllerTest {
/***************************************************************************** 
Name: CalendarControllerTest 
Purpose: Test class for CalendarController
================================================================================
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -        Satish               12/18/2019           INITIAL DEVELOPMENT   
********************************************************************************/
	@isTest
    public static void getTodayEventTest(){
        Event e = new Event(Subject = 'Test Event', StartDateTime = DateTime.now().addHours(-6),EndDateTime = DateTime.now().addHours(-5),DurationInMinutes = 60);
        Insert e;
        Test.startTest();
        List<CalendarController.TodaysEvent> evts = CalendarController.getTodayEvents();
        Test.stopTest();
        System.assertEquals(1, evts.size());
        System.assertNotEquals('All Day', evts[0].StartTime);
    }

}