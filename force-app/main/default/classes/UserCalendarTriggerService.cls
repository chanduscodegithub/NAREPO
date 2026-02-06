/*------------------------------------------------------------------------------------
Author:        Paras Prajapati
Description:   UserCalendarTrigger Service Class to manage service methods
History
Date            Author             Comments
--------------------------------------------------------------------------------------
09-09-2019      Paras Prajapati    
------------------------------------------------------------------------------------*/
public class UserCalendarTriggerService { 
    /*----------------------------------------------------------
@description Method varify the current date with the Calendar records, so that records can be processed for Utilization Matric
@param currDate - Contains Current Date, which will be used to compare the Calendar Records
@param userCalendarList - List Of User_Calendar__c Records which need to be processed.
@param mapOfUserWithDates - Map of Users and Dates which will be used to filter Utilization Matric Records
@param listOfDate - keep the Dates which need to be used to filter Utilization Matric records
------------------------------------------------------------*/ 
    public static void validateStartAndEndDateWithCurrentDateAndGetRecords(Date currDate,List<User_Calendar__c> userCalendarList,Map<String,List<Date>> mapOfUserWithDates,List<Date> listOfDate){
        for(User_Calendar__c userCalendar : userCalendarList){
            if(currDate >= userCalendar.Leave_Start_date__c){
                
                Date minDate = minDate(currDate, userCalendar.Leave_Start_date__c);
                minDate = minDate(currDate, userCalendar.Leave_End_date__c);
                List<Date> tempDateBetweenList = new List<Date>();
                
                List<Date> datesBetweenStartAndEndDate = DateSBetweenDate(userCalendar.Leave_Start_date__c,minDate);
                if(mapOfUserWithDates.containsKey(userCalendar.User__c)){
                    tempDateBetweenList = mapOfUserWithDates.get(userCalendar.User__c);
                }
                tempDateBetweenList.addAll(datesBetweenStartAndEndDate);
                mapOfUserWithDates.put(userCalendar.User__c,tempDateBetweenList);
                listOfDate.addAll(DateSBetweenDate(userCalendar.Leave_Start_date__c,minDate));
            }
        }
    }
       /*----------------------------------------------------------
@description Method varify the Start Date changes and prepare unique list and map to process furture
@param currDate - Contains Current Date, which will be used to compare the Calendar Records
@param newUserCalendars - List Of User_Calendar__c Records which contains new values.
@param oldUserCalendars - List Of User_Calendar__c Records which contains old values.
@param mapOfUserWithDates - Map of Users and Dates which will be used to filter Utilization Matric Records
@param listOfDate - keep the Dates which need to be used to filter Utilization Matric records
------------------------------------------------------------*/  
    public static void handleStartDateChange(Date currDate,User_Calendar__c newUserCalendars,User_Calendar__c oldUserCalendars,Map<String,List<Date>> mapOfUserAndListOfDate,List<Date> listOfDate){
        if(currDate>=newUserCalendars.Leave_Start_date__c && newUserCalendars.Leave_Start_date__c<oldUserCalendars.Leave_Start_date__c){
            // Old Start Date - 9
            // New Start Date - 6
            // Current Date - 5 Or 6 Or 10
            // Mark the days as 0 - as user is extending leave 
            Date minDate = minDate(currDate, oldUserCalendars.Leave_Start_date__c);
            List<Date> tempDateBetweenList = new List<Date>();
            List<Date> datesBetweenStartAndEndDate = DateSBetweenDate(newUserCalendars.Leave_Start_date__c,minDate);
            if(mapOfUserAndListOfDate.containsKey(newUserCalendars.User__c)){
                tempDateBetweenList = mapOfUserAndListOfDate.get(newUserCalendars.User__c);
            }
            tempDateBetweenList.addAll(datesBetweenStartAndEndDate);
            mapOfUserAndListOfDate.put(newUserCalendars.User__c,tempDateBetweenList);
            listOfDate.addAll(DateSBetweenDate(newUserCalendars.Leave_Start_date__c,minDate));
        }else if(currDate>=oldUserCalendars.Leave_Start_date__c && newUserCalendars.Leave_Start_date__c>oldUserCalendars.Leave_Start_date__c){
            // Old Start Date - 9
            // New Start Date - 11
            // Current Date - 12 or 10
            // Mark the days as 1 as user is reducing the leaves
            Date minDate = minDate(currDate, newUserCalendars.Leave_Start_date__c);
            List<Date> tempDateBetweenList = new List<Date>();
            List<Date> datesBetweenStartAndEndDate = DateSBetweenDateForStartDateChange(oldUserCalendars.Leave_Start_date__c,minDate);
            if(mapOfUserAndListOfDate.containsKey(newUserCalendars.User__c)){
                tempDateBetweenList = mapOfUserAndListOfDate.get(newUserCalendars.User__c);
            }
            tempDateBetweenList.addAll(datesBetweenStartAndEndDate);
            mapOfUserAndListOfDate.put(newUserCalendars.User__c,tempDateBetweenList);
            listOfDate.addAll(DateSBetweenDateForStartDateChange(oldUserCalendars.Leave_Start_date__c,minDate));
        }
    }
       /*----------------------------------------------------------
@description Method varify the End Date changes and prepare unique list and map to process furture
@param currDate - Contains Current Date, which will be used to compare the Calendar Records
@param newUserCalendars - List Of User_Calendar__c Records which contains new values.
@param oldUserCalendars - List Of User_Calendar__c Records which contains old values.
@param mapOfUserWithDates - Map of Users and Dates which will be used to filter Utilization Matric Records
@param listOfDate - keep the Dates which need to be used to filter Utilization Matric records
------------------------------------------------------------*/     
    public static void handleEndDateChange(Date currDate,User_Calendar__c newUserCalendars,User_Calendar__c oldUserCalendars,Map<String,List<Date>> mapOfUserAndListOfDate,List<Date> listOfDate){
        if(currDate>=newUserCalendars.Leave_End_date__c && newUserCalendars.Leave_End_date__c < oldUserCalendars.Leave_End_date__c){
            // Old Start Date - 9
            // New Start Date - 6
            // Current Date - 5 Or 6 Or 10
            // Mark the days as 1 - reducing the leaves
            Date minDate = minDate(currDate, oldUserCalendars.Leave_End_date__c);
            System.debug('minDate' + minDate);
            Date dateFromWhichFindDays = newUserCalendars.Leave_End_date__c.addDays(1);
            System.debug('dateFromWhichFindDays' + dateFromWhichFindDays);
            List<Date> datesBetweenStartAndEndDate = DateSBetweenDate(dateFromWhichFindDays,minDate);
            System.debug('datesBetweenStartAndEndDate' + datesBetweenStartAndEndDate);
            List<Date> tempDateBetweenList = new List<Date>();
            if(mapOfUserAndListOfDate.containsKey(newUserCalendars.User__c)){
                tempDateBetweenList = mapOfUserAndListOfDate.get(newUserCalendars.User__c);
            }
            tempDateBetweenList.addAll(datesBetweenStartAndEndDate);
            mapOfUserAndListOfDate.put(newUserCalendars.User__c,tempDateBetweenList);
            listOfDate.addAll(DateSBetweenDate(dateFromWhichFindDays,minDate));
        }else if(currDate>=oldUserCalendars.Leave_End_date__c && newUserCalendars.Leave_End_date__c > oldUserCalendars.Leave_End_date__c){
            // Old End Date - 12
            // New End Date - 14
            // Current Date - 15
            // Mark the days as 0 - Extending the Leaves
            Date minDate = minDate(currDate, newUserCalendars.Leave_End_date__c);
            System.debug('minDate>> ' + minDate);

            Date dateFromWhichFindDays = oldUserCalendars.Leave_End_date__c.addDays(1);
            System.debug('dateFromWhichFindDays>> ' + dateFromWhichFindDays);
            
            List<Date> datesBetweenStartAndEndDate = DateSBetweenDate(dateFromWhichFindDays,minDate);
            System.debug('datesBetweenStartAndEndDate>> ' + datesBetweenStartAndEndDate);
            List<Date> tempDateBetweenList = new List<Date>();
            if(mapOfUserAndListOfDate.containsKey(newUserCalendars.User__c)){
                tempDateBetweenList = mapOfUserAndListOfDate.get(newUserCalendars.User__c);
            }
            tempDateBetweenList.addAll(datesBetweenStartAndEndDate);
            mapOfUserAndListOfDate.put(newUserCalendars.User__c,tempDateBetweenList);
            listOfDate.addAll(DateSBetweenDate(dateFromWhichFindDays,minDate));
        }
    }
        /*----------------------------------------------------------
@description Method to fetch the List of holiday and compare whether utilization matric records need to process or not.
@param mapOfUserWithDates - Map of Users and Dates which will be used to filter Utilization Matric Records
@param listOfDate - keep the Dates which need to be used to filter Utilization Matric records
------------------------------------------------------------*/    
    public static List<Utilization_Metric__c>  getUtilizationRecordstoProcess(Map<String,List<Date>> mapOfUserWithDates,List<Date> listOfDate){
        List<Utilization_Metric__c>  utilizationMetricList=new List<Utilization_Metric__c>();
        Set<Date> holidayDates = new Set<Date>();
        if(!listOfDate.isEmpty()){
            holidayDates = getAllHolidays();
            Set<Date> setOfDateToConsider = getDatesWhichAreNotHoliday(listOfDate,holidayDates);
            utilizationMetricList = fetchUtilizationMetricRecords(setOfDateToConsider,mapOfUserWithDates.keySet());
        }
        return utilizationMetricList;
    }
  /*----------------------------------------------------------
@description Method to fetch Company Holiday based on Holiday
------------------------------------------------------------*/      
    public static Set<Date> getAllHolidays(){
        Set<Date> holidayDates = new Set<Date>();
        for(Holiday hol : [SELECT ActivityDate FROM Holiday]){
            holidayDates.add(hol.ActivityDate);
        }
        return holidayDates;
    }
         /*----------------------------------------------------------
@description Method to fetch the List of Dates which are not in Company Holiday and not weekends.
@param listOfDate - list of Dates which need to be compared with Holidays
@param holidayDates - set of holidays
------------------------------------------------------------*/    
    public static Set<Date> getDatesWhichAreNotHoliday(List<Date> listOfDates,Set<Date> holidayDates){
        Set<Date> listOfDateToConsider = new Set<Date>();
        if(!listOfDates.isEmpty()){
            for(integer index=0;index<listOfDates.size();index++){
                Date runnngDate = listOfDates.get(index);
                DateTime dateAndTime = DateTime.newInstance(runnngDate.year(), runnngDate.month(), runnngDate.day());
                String todayDay = dateAndTime.format('EEEE'); 
                if(todayDay != 'Saturday' && todayDay != 'Sunday' && !holidayDates.contains(runnngDate)){
                    listOfDateToConsider.add(runnngDate);
                }
            }  
        }
        return listOfDateToConsider;
    }
          /*----------------------------------------------------------
@description Method to fetch the List of Utilization_Metric__c based on Date and User.
@param setOfDateToConsider - set of Date to be used to filter Utilization Matric record.
@param setOfUserIds - set of user ids.
------------------------------------------------------------*/    
    public static List<Utilization_Metric__c> fetchUtilizationMetricRecords(Set<Date> setOfDateToConsider,Set<String> setOfUserIds){
        List<Utilization_Metric__c>  utilizationMetricList = [SELECT id, Utilization__c, Date__c, User__c, Holidays__c, 
                                                              Description__c,User_Working_Day__c
                                                              from Utilization_Metric__c 
                                                              WHERE Date__c IN:setOfDateToConsider  AND User__c IN:setOfUserIds ];
        return utilizationMetricList;
    }
    
    /**
*   @description Check if a date is lesser than the other
*   @param date1 - Given Date
*   @param date2 - Given Date
*/
    public static Date minDate(Date date1, Date date2) { 
        if (date1 != null || date2 != null) {
            if (date1 == null) {
                return date2;
            } else if (date2 == null) {
                return date1;
            } else {
                return date1 < date2 ? date1 : date2;
            }
        }
        return null;
    }
    
     /**
*   @description Check if a date is greater than the other
*   @param date1 - Given Date
*   @param date2 - Given Date
*/
    public static List<Date> DateSBetweenDate(Date startDate, Date EndDate) { 
        List<Date> listOfDate = new List<Date>();
        Integer numberDays = startDate.daysBetween(EndDate);
        if(startDate==EndDate){
            listOfDate.add(startDate);
        }else{
            for(integer index=0;index<=numberDays;index++){
                listOfDate.add(startDate.addDays(index));
            }
        }
        
        return listOfDate;
    }
    
    /**
*   @description Check if a date is greater than the other
*   @param date1 - Given Date
*   @param date2 - Given Date
*/
    public static List<Date> DateSBetweenDateForStartDateChange(Date startDate, Date EndDate) { 
        List<Date> listOfDate = new List<Date>();
        Integer numberDays = startDate.daysBetween(EndDate);
        if(startDate==EndDate || numberDays==1){
            listOfDate.add(startDate);
        }else{
            for(integer index=0;index<numberDays;index++){
                listOfDate.add(startDate.addDays(index));
            }
        }
        
        return listOfDate;
    }
}