public with sharing class CalendarController {
/***************************************************************************** 
Name: CalendarController 
Purpose: Fetch Calendar Events from User's personal and shared calendar
         This is used in LWC : calendarDailyEvents which is added to CSI Home Page
================================================================================
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -        Satish               12/18/2019      INITIAL DEVELOPMENT   
********************************************************************************/
    public class TodaysEvent {
        @AuraEnabled public String Id;
        @AuraEnabled public String StartDate;
        @AuraEnabled public String StartTime;
        @AuraEnabled public String EndTime;
        @AuraEnabled public Boolean IsAllDayEvent;
        @AuraEnabled public String Subject;
        @AuraEnabled public String location;
    }

    @AuraEnabled(Cacheable=true)
    public static List<TodaysEvent> getTodayEvents(){
        String calId = '';
        List<Calendar> calObj = [SELECT Id, Name, Type, IsActive FROM Calendar where type='public' and Name='Events Calendar' and IsActive=true Limit 1];
        if(calObj.size() > 0){
            calId = calObj[0].Id;
        }
        //Pull Events for this week
        List<Event> todayEvts = [select Id,IsAllDayEvent,Subject,ActivityDate,StartDateTime,
                                 EndDateTime,Location from Event
                                 where (ActivityDate = THIS_WEEK OR ActivityDateTime = THIS_WEEK)
                                 //Show events assigned to 'Events Calendar' (Shared Calendar for CSI) or events assigned to user
                                 AND (OwnerId =:calId OR OwnerId =:UserInfo.getUserId())
                                 Order By StartDateTime];

        List<TodaysEvent> returnList = new List<TodaysEvent>();
        Datetime dt;
        for(Event e : todayEvts){
            TodaysEvent te = new TodaysEvent();
            te.Id = e.Id;
            te.IsAllDayEvent = e.IsAllDayEvent;
            te.Subject = e.Subject;
            te.location = e.Location;
            if(e.IsAllDayEvent == true){
                //StartDateTime is stored in UTC. Using dateGMT() instead of date() for all day event as date() would
                //convert it to a local time and return the previous datetime instead of actual date
               	te.StartDate = e.StartDateTime.dateGMT().format();
                te.StartTime = 'All Day';  
                //EndTime not needed as its an all day event
            }
            else{
                te.StartDate = e.StartDateTime.date().format();
                te.StartTime = e.StartDateTime.format('hh:mm a');
                te.EndTime = e.EndDateTime.format('hh:mm a');
                //te.StartDate = e.StartDateTime.format('hh:mm a');
                //te.EndDate =  e.EndDateTime.format();
            }
   	        returnList.add(te);
            System.debug(te);
        }
        return returnList;
    }


}