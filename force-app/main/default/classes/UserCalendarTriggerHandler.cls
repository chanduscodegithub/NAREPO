/*------------------------------------------------------------------------------------
Author:        Paras Prajapati
Description:   This class will be handle UserCalendarTrigger scenario
History
Date            Author             Comments
--------------------------------------------------------------------------------------
09-09-2019      Paras Prajapati    
------------------------------------------------------------------------------------*/
public class UserCalendarTriggerHandler {
    /*----------------------------------------------------------
@description Method to handle new UserCalender records and process utilization matric records for Working day
@param userCalendarList - List Of User Calendar Records inserted
------------------------------------------------------------*/
    public static void handleUserCalenderInsert(List<User_Calendar__c> userCalendarList){
        Date currDate = Date.today().addDays(1);
        Map<String,List<User_Calendar__c>> mapOfUserWithCalender = new Map<String,List<User_Calendar__c>>();
        Map<String,List<Date>> mapOfUserWithDates = new Map<String,List<Date>>();
        List<Date> listOfDate = new List<Date>();
        List<Utilization_Metric__c>  utilizationMetricList=new List<Utilization_Metric__c>();
        
        UserCalendarTriggerService.validateStartAndEndDateWithCurrentDateAndGetRecords(currDate,userCalendarList,mapOfUserWithDates,listOfDate);

        if(!listOfDate.isEmpty()){
            utilizationMetricList = UserCalendarTriggerService.getUtilizationRecordstoProcess(mapOfUserWithDates,listOfDate);
            if(!utilizationMetricList.isEmpty()){
                for(Utilization_Metric__c utilizationMetric : utilizationMetricList ){
                    utilizationMetric.User_Working_Day__c=0;
                }
            }
        }
        if(!utilizationMetricList.isEmpty()){
            processObjectUpdate(utilizationMetricList);
        }
    }
    /*----------------------------------------------------------
@description Method to handle UserCalender records which are deleted and process utilization matric records for Working day
@param userCalendarList - List Of User Calendar Records inserted
------------------------------------------------------------*/
    public static void handleBeforeDelete(List<User_Calendar__c> userCalendarList){
        Date currDate = Date.today().addDays(1);
        List<Utilization_Metric__c>  utilizationMetricList=new List<Utilization_Metric__c>();
        Map<String,List<Date>> mapOfUserWithDates = new Map<String,List<Date>>();
        List<Date> listOfDate = new List<Date>();
        
        UserCalendarTriggerService.validateStartAndEndDateWithCurrentDateAndGetRecords(currDate,userCalendarList,mapOfUserWithDates,listOfDate);
        if(!listOfDate.isEmpty()){
            utilizationMetricList = UserCalendarTriggerService.getUtilizationRecordstoProcess(mapOfUserWithDates,listOfDate);
            if(!utilizationMetricList.isEmpty()){
                for(Utilization_Metric__c utilizationMetric : utilizationMetricList ){
                    utilizationMetric.User_Working_Day__c=1;
                }
            }
        }
        
        if(!utilizationMetricList.isEmpty()){
            processObjectUpdate(utilizationMetricList);
        }
    }
     /*----------------------------------------------------------
@description Method to handle UserCalender records which are deleted and process utilization matric records for Working day
@param userCalendarList - List Of User Calendar Records which are updated with latest value
@param newUserCalendarMap - Map of User Calendar Records which are updated with latest value
@param oldUserCalendarMap - Map of User Calendar Records which are having old values.
------------------------------------------------------------*/ 
    public static void handleUserCalenderAfterUpdate(List<User_Calendar__c> userCalendarList,Map<Id, User_Calendar__c> newUserCalendarMap, Map<Id,User_Calendar__c> oldUserCalendarMap){
        Date currDate = Date.today().addDays(1);
        List<Date> globalListOfDate = new List<Date>();
        Set<Date> holidayDates = new Set<Date>();
        List<Utilization_Metric__c>  utilizationMetricList=new List<Utilization_Metric__c>();
        
        /****************** Map and List - When Start and End Date both changes START ************************/
        Map<String,List<Date>> mapofStartDateEndDateWhenBothChangeToMark0 = new Map<String,List<Date>>();
        List<Date> listofStartDateEndDateWhenBothChangeToMark0 = new List<Date>();
        
        Map<String,List<Date>> mapofStartDateWherNewDateIsLessThenOldToMark0 = new Map<String,List<Date>>();
        List<Date> listofStartDateWherNewDateIsLessThenOldToMark0 = new List<Date>();
        
        Map<String,List<Date>> mapofStartDateWherNewDateIsMoreThenOldToMark1 = new Map<String,List<Date>>();
        List<Date> listofStartDateWherNewDateIsMoreThenOldToMark1 = new List<Date>();
        
        Map<String,List<Date>> mapofEndDateWherNewDateIsLessThenOldToMark1 = new Map<String,List<Date>>();
        List<Date> listofEndDateWherNewDateIsLessThenOldToMark1 = new List<Date>();
        
        Map<String,List<Date>> mapofEndDateWherNewDateIsMoreThenOldToMark0 = new Map<String,List<Date>>();
        List<Date> listofEndDateWherNewDateIsMoreThenOldToMark0 = new List<Date>();
        /****************** Map and List - When Start and End Date both changes END ************************/
        
        for(Id userCalenderId : newUserCalendarMap.keySet()){
            User_Calendar__c newUserCalendars = newUserCalendarMap.get(userCalenderId);
            User_Calendar__c oldUserCalendars = oldUserCalendarMap.get(userCalenderId); 
            /**
            * This If Block is to make the Matric Records mark as 0, as User is going to take the leaves between Start Date and (End Date OR Current Date)
            * whichever is lessor Dates
            */  
            if(currDate >= newUserCalendars.Leave_Start_date__c && newUserCalendars.Leave_Start_date__c != oldUserCalendars.Leave_Start_date__c && newUserCalendars.Leave_End_date__c != oldUserCalendars.Leave_End_date__c){
                Date minDate = UserCalendarTriggerService.minDate(currDate, newUserCalendars.Leave_Start_date__c);
                minDate = UserCalendarTriggerService.minDate(currDate, newUserCalendars.Leave_End_date__c);
                List<Date> tempDateBetweenList = new List<Date>();
                List<Date> datesBetweenStartAndEndDate = UserCalendarTriggerService.DateSBetweenDate(newUserCalendars.Leave_Start_date__c,minDate);
                if(mapofStartDateEndDateWhenBothChangeToMark0.containsKey(newUserCalendars.User__c)){
                    tempDateBetweenList = mapofStartDateEndDateWhenBothChangeToMark0.get(newUserCalendars.User__c);
                }
                tempDateBetweenList.addAll(datesBetweenStartAndEndDate);
                mapofStartDateEndDateWhenBothChangeToMark0.put(newUserCalendars.User__c,tempDateBetweenList);
                listofStartDateEndDateWhenBothChangeToMark0.addAll(UserCalendarTriggerService.DateSBetweenDate(newUserCalendars.Leave_Start_date__c,minDate));
                
            }
            
            if(newUserCalendars.Leave_Start_date__c != oldUserCalendars.Leave_Start_date__c && newUserCalendars.Leave_End_date__c != oldUserCalendars.Leave_End_date__c){
                if(currDate >= newUserCalendars.Leave_Start_date__c && newUserCalendars.Leave_Start_date__c<oldUserCalendars.Leave_Start_date__c){
                    UserCalendarTriggerService.handleStartDateChange(currDate,newUserCalendars,oldUserCalendars,mapofStartDateWherNewDateIsLessThenOldToMark0,listofStartDateWherNewDateIsLessThenOldToMark0);
                }else if(currDate>= oldUserCalendars.Leave_Start_date__c && newUserCalendars.Leave_Start_date__c>oldUserCalendars.Leave_Start_date__c){
                    UserCalendarTriggerService.handleStartDateChange(currDate,newUserCalendars,oldUserCalendars,mapofStartDateWherNewDateIsMoreThenOldToMark1,listofStartDateWherNewDateIsMoreThenOldToMark1);
                }
                if(currDate >= newUserCalendars.Leave_End_date__c && newUserCalendars.Leave_End_date__c<oldUserCalendars.Leave_End_date__c){
                    UserCalendarTriggerService.handleEndDateChange(currDate,newUserCalendars,oldUserCalendars,mapofEndDateWherNewDateIsLessThenOldToMark1,listofEndDateWherNewDateIsLessThenOldToMark1);
                }else if(currDate>= oldUserCalendars.Leave_End_date__c && newUserCalendars.Leave_End_date__c>oldUserCalendars.Leave_End_date__c){
                    UserCalendarTriggerService.handleEndDateChange(currDate,newUserCalendars,oldUserCalendars,mapofEndDateWherNewDateIsMoreThenOldToMark0,listofEndDateWherNewDateIsMoreThenOldToMark0);
                }
            }else if(newUserCalendars.Leave_Start_date__c != oldUserCalendars.Leave_Start_date__c){
                if(currDate>=newUserCalendars.Leave_Start_date__c && newUserCalendars.Leave_Start_date__c<oldUserCalendars.Leave_Start_date__c){
                    UserCalendarTriggerService.handleStartDateChange(currDate,newUserCalendars,oldUserCalendars,mapofStartDateWherNewDateIsLessThenOldToMark0,listofStartDateWherNewDateIsLessThenOldToMark0);
                }else if(currDate>=oldUserCalendars.Leave_Start_date__c && newUserCalendars.Leave_Start_date__c>oldUserCalendars.Leave_Start_date__c){
                    UserCalendarTriggerService.handleStartDateChange(currDate,newUserCalendars,oldUserCalendars,mapofStartDateWherNewDateIsMoreThenOldToMark1,listofStartDateWherNewDateIsMoreThenOldToMark1);
                }
            }else if(newUserCalendars.Leave_End_date__c != oldUserCalendars.Leave_End_date__c){
                if(currDate>=newUserCalendars.Leave_End_date__c && newUserCalendars.Leave_End_date__c < oldUserCalendars.Leave_End_date__c){
                    UserCalendarTriggerService.handleEndDateChange(currDate,newUserCalendars,oldUserCalendars,mapofEndDateWherNewDateIsLessThenOldToMark1,listofEndDateWherNewDateIsLessThenOldToMark1);
                }else if(currDate>=oldUserCalendars.Leave_End_date__c && newUserCalendars.Leave_End_date__c > oldUserCalendars.Leave_End_date__c){
                    UserCalendarTriggerService.handleEndDateChange(currDate,newUserCalendars,oldUserCalendars,mapofEndDateWherNewDateIsMoreThenOldToMark0,listofEndDateWherNewDateIsMoreThenOldToMark0);
                }
            }
        }
        holidayDates = UserCalendarTriggerService.getAllHolidays();
        Set<Date> globalSetOfDateToConsider = new Set<Date>();
        Set<Date> setOfDateToConsider = new Set<Date>();
        Set<Date> setOfDateToConsiderToMark1 = new Set<Date>();
        Set<Date> setOfDateToConsiderToMark0 = new Set<Date>();
        Map<String,List<Date>> globalMapWithDate = new Map<String,List<Date>>();
        Map<String,List<Date>> globalMapWithDateWhicnNeedToMark0 = new Map<String,List<Date>>();
        Map<String,List<Date>> globalMapWithDateWhicnNeedToMark1 = new Map<String,List<Date>>();
        
        
        if(!listofStartDateEndDateWhenBothChangeToMark0.isEmpty()){
            setOfDateToConsider = UserCalendarTriggerService.getDatesWhichAreNotHoliday(listofStartDateEndDateWhenBothChangeToMark0,holidayDates);
            if(!setOfDateToConsider.isEmpty()){
                setOfDateToConsiderToMark0.addAll(setOfDateToConsider);
            }
            if(mapofStartDateEndDateWhenBothChangeToMark0.size()>0){
                globalMapWithDateWhicnNeedToMark0.putAll(mapofStartDateEndDateWhenBothChangeToMark0);
            }
        }
        
        if(!listofStartDateWherNewDateIsLessThenOldToMark0.isEmpty()){
            setOfDateToConsider = UserCalendarTriggerService.getDatesWhichAreNotHoliday(listofStartDateWherNewDateIsLessThenOldToMark0,holidayDates);
            if(!setOfDateToConsider.isEmpty()){
                setOfDateToConsiderToMark0.addAll(setOfDateToConsider);
            }
            if(mapofStartDateWherNewDateIsLessThenOldToMark0.size()>0){
                globalMapWithDateWhicnNeedToMark0.putAll(mapofStartDateWherNewDateIsLessThenOldToMark0);
            }
        }
        if(!listofEndDateWherNewDateIsMoreThenOldToMark0.isEmpty()){
            setOfDateToConsider = UserCalendarTriggerService.getDatesWhichAreNotHoliday(listofEndDateWherNewDateIsMoreThenOldToMark0,holidayDates);
            if(!setOfDateToConsider.isEmpty()){
                setOfDateToConsiderToMark0.addAll(setOfDateToConsider);
            }
            if(mapofEndDateWherNewDateIsMoreThenOldToMark0.size()>0){
                globalMapWithDateWhicnNeedToMark0.putAll(mapofEndDateWherNewDateIsMoreThenOldToMark0);
            }
        }
        
        if(!listofStartDateWherNewDateIsMoreThenOldToMark1.isEmpty()){
            setOfDateToConsider = UserCalendarTriggerService.getDatesWhichAreNotHoliday(listofStartDateWherNewDateIsMoreThenOldToMark1,holidayDates);
            if(!setOfDateToConsider.isEmpty()){
                setOfDateToConsiderToMark1.addAll(setOfDateToConsider);
            }
            if(mapofStartDateWherNewDateIsMoreThenOldToMark1.size()>0){
                globalMapWithDateWhicnNeedToMark1.putAll(mapofStartDateWherNewDateIsMoreThenOldToMark1);
            }
        }
        if(!listofEndDateWherNewDateIsLessThenOldToMark1.isEmpty()){
            setOfDateToConsider = UserCalendarTriggerService.getDatesWhichAreNotHoliday(listofEndDateWherNewDateIsLessThenOldToMark1,holidayDates);
            if(!setOfDateToConsider.isEmpty()){
                setOfDateToConsiderToMark1.addAll(setOfDateToConsider);
            }
            if(mapofEndDateWherNewDateIsLessThenOldToMark1.size()>0){
                globalMapWithDateWhicnNeedToMark1.putAll(mapofEndDateWherNewDateIsLessThenOldToMark1);
            }
        }
        if(!setOfDateToConsiderToMark0.isEmpty()){
            globalSetOfDateToConsider.addAll(setOfDateToConsiderToMark0);
        }
        if(!setOfDateToConsiderToMark1.isEmpty()){
            globalSetOfDateToConsider.addAll(setOfDateToConsiderToMark1);
        }
        if(globalMapWithDateWhicnNeedToMark1.size()>0){
            globalMapWithDate.putAll(globalMapWithDateWhicnNeedToMark1);
        }
        if(globalMapWithDateWhicnNeedToMark0.size()>0){
            globalMapWithDate.putAll(globalMapWithDateWhicnNeedToMark0); 
        }
        utilizationMetricList = UserCalendarTriggerService.fetchUtilizationMetricRecords(globalSetOfDateToConsider,globalMapWithDate.keySet());
        
        if(!utilizationMetricList.isEmpty()){
            for(Utilization_Metric__c utilizationMetric : utilizationMetricList ){
                utilizationMetric.User_Working_Day__c=0;
                if(globalMapWithDateWhicnNeedToMark1.containsKey(utilizationMetric.User__c) && setOfDateToConsiderToMark1.contains(utilizationMetric.Date__c) ){
                    utilizationMetric.User_Working_Day__c=1;
                }
                
            }
        }
        if(!utilizationMetricList.isEmpty()){
            processObjectUpdate(utilizationMetricList);
        }
    }

    /*----------------------------------------------------------
@description Method to handle Updte of ECU Event Records.
@param listOfsObjectToBeProcessed - Set Of Utilization_Metric__c Records which need to be processed.
------------------------------------------------------------*/     
    public static void processObjectUpdate(List<sObject> listOfsObjectToBeProcessed){   
        Database.SaveResult[] ecuEventList = Database.update(listOfsObjectToBeProcessed, false);
        System.debug('ecuEventList'+ecuEventList);
        for (Database.SaveResult sr : ecuEventList) {
            if (sr.isSuccess()) {
                System.debug('Successfully Updated Utilization_Metric__c. Utilization_Metric__c ID is : ' + sr.getId());
            } else {
                for(Database.Error objErr : sr.getErrors()) {
                    System.debug('The following error has occurred.');
                    System.debug(objErr.getStatusCode() + ': ' + objErr.getMessage());
                    System.debug(' Utilization_Metric__c Object field which are affected by the error:'+ objErr.getFields());
                }
            }
        }
    }
    
    
}