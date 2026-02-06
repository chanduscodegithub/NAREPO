/*------------------------------------------------------------------------------------
Author:        Paras Prajapati
Description:   This class will be Handle Creation of utilization Matric Records
History
Date            Author             Comments
--------------------------------------------------------------------------------------
09-09-2019      Paras Prajapati    
------------------------------------------------------------------------------------*/
public class UtilizationMatric_Batch_Handler { 
    
    /*----------------------------------------------------------------------------------------------------------
@description : This method will prepare Unique Map of status for Each Event per all the tickets links to same contact or Lead 
@param listOfUserWhoNeedsMatricRecords - List Of User for which Utilization Matric records will be created for Next Day
-----------------------------------------------------------------------------------------------------------*/
    public static void processUserForUtilizationMatric(List<User> listOfUserWhoNeedsMatricRecords){
        Set<Date> holidayDates = new Set<Date>();
        Date currDate = Date.today().addDays(1);
       
        Set<ID> setOfUserIdsToProcess = new Set<ID>();
        Set<ID> setOfUserId = new Set<ID>();
        List<Utilization_Metric__c> listOfUtilizationMetric = new List<Utilization_Metric__c>();
        List<Utilization__mdt> userHoliday = new List<Utilization__mdt>(); 
        userHoliday =[select id,DeveloperName,Email__c,Holidays__c from Utilization__mdt];
        map<id,string> holidayMap =new map<id,string>();
        for(User userRecord : listOfUserWhoNeedsMatricRecords){
            setOfUserId.add(userRecord.Id);
             //Added by veera
            if(userHoliday.size()>0){
                for(Utilization__mdt hol:userHoliday){
                    if(hol.Email__c==userRecord.Email){
                        holidayMap.put(userRecord.Id,hol.Holidays__c);
                    }
                }
            }//ENd
            
        }
        
        /*
         * Check whether Current date is holiday or not, if holiday then no need to do any thing exit the batch
		*/ 
        //if(!getHolidaysForDates(currDate)){ 
        
        //The above Holiday code is commented because the UM records has to be created for Holidays with UserWorkingDay=0.

        DateTime currDateAndTime = DateTime.newInstance(currDate.year(), currDate.month(), currDate.day());  
        String todayDay = currDateAndTime.format('EEEE');
        Boolean isWeekend = false;
        Boolean isHoliday = false;
        
        List<Holiday> holidaysList = [select id, name, ActivityDate FROM Holiday WHERE ActivityDate =: currDate LIMIT 1];
        

        if(!holidaysList.isEmpty()){
            isHoliday= true;
        }
        
        if(todayDay == 'Saturday' || todayDay == 'Sunday') {
            
            isWeekend = true;
            
        } else if(isHoliday == false) {
            
            // Check wether user has taken a holiday for current date or not.
            List<User_Calendar__c> userCalenderRecords = [SELECT Id, Leave_Start_date__c, Leave_End_date__c, Leave_Type__c, Comments__c, 
                                                          User__c FROM User_Calendar__c where User__c IN: setOfUserId 
                                                          AND Leave_Start_date__c <=: currDate AND Leave_End_date__c >=: currDate];
            if(!userCalenderRecords.isEmpty()){
                for(User_Calendar__c userCalendarRecord : userCalenderRecords){
                    setOfUserIdsToProcess.add(userCalendarRecord.User__c);
                } 
            }                
        }            
        
        processUserToCreateUtilizationMatricRecords(listOfUserWhoNeedsMatricRecords,setOfUserIdsToProcess,listOfUtilizationMetric,isWeekend,isHoliday,holidayMap);
        if(!listOfUtilizationMetric.isEmpty()){
            processObjectInsert(listOfUtilizationMetric);
        }
        //}
    }
    /*----------------------------------------------------------
@description Method to processUserToCreateUtilizationMatricRecords
@param listOfUserWhoNeedsMatricRecords - List of Users which are considered for processing.
@param setOfUserIdsToProcess - Set of User Ids for which Leaves exist.
@param listOfUtilizationMetric - List of Utilization_Metric__c records which will be created.
------------------------------------------------------------*/    
    public static void processUserToCreateUtilizationMatricRecords(List<User> listOfUserWhoNeedsMatricRecords,Set<ID> setOfUserIdsToProcess,List<Utilization_Metric__c> listOfUtilizationMetric,Boolean isWeekend,Boolean isHoliday,map<id,string> holidayMap){
        
         //Added by veera
        DateTime currDate = Date.today().addDays(1);
       currDate= currDate.addHours(7);
        string weekday = currDate.format('EEEE');
        //End
        for(User userRecord : listOfUserWhoNeedsMatricRecords){
            Utilization_Metric__c utilizationMetricRecord = new Utilization_Metric__c();
            utilizationMetricRecord.Date__c = System.today().addDays(1);
            utilizationMetricRecord.User__c = userRecord.Id;
            utilizationMetricRecord.OwnerId = userRecord.Id;
            utilizationMetricRecord.Manager_New__c=userRecord.Manager.Name;
            utilizationMetricRecord.User_Working_Day__c=1;
            if(setOfUserIdsToProcess.contains(userRecord.Id) || isWeekend || isHoliday){
                utilizationMetricRecord.User_Working_Day__c=0;
            }
            if(isHoliday) {
            	utilizationMetricRecord.Holidays__c = 'Holiday';    
            }
            
            //Added by veera
            if(holidayMap.containsKey(userRecord.Id)){
                string [] holList;
                holList =(holidayMap.get(userRecord.Id)).split(';');
                if(holList.contains(weekday)){
                    utilizationMetricRecord.User_Working_Day__c=0;
                    utilizationMetricRecord.Holidays__c = 'Holiday';   
                }
            }//End
            listOfUtilizationMetric.add(utilizationMetricRecord);
        }
    }
    
    /*----------------------------------------------------------
@description Method to handle Updte of ECU Event Records.
@param listOfsObjectToBeProcessed - Set Of Utilization_Metric__c Records which need to be processed.
------------------------------------------------------------*/     
    public static void processObjectInsert(List<sObject> listOfsObjectToBeProcessed){   
        Database.SaveResult[] ecuEventList = Database.insert(listOfsObjectToBeProcessed, false);
        System.debug('ecuEventList'+ecuEventList);
        for (Database.SaveResult sr : ecuEventList) {
            if (sr.isSuccess()) {
                System.debug('Successfully Created Utilization_Metric__c. Utilization_Metric__c ID is : ' + sr.getId());
            } else {
                for(Database.Error objErr : sr.getErrors()) {
                    System.debug('The following error has occurred.');
                    System.debug(objErr.getStatusCode() + ': ' + objErr.getMessage());
                    System.debug(' Utilization_Metric__c Object field which are affected by the error:'+ objErr.getFields());
                }
            }
        }
    }
    
    /*----------------------------------------------------------
@description Method to getHolidaysForDates
@param currDate - Date for which holiday will be checked.
------------------------------------------------------------*     
    public static Boolean getHolidaysForDates(Date currDate){
        Boolean isHoliday = false;
        DateTime currDateAndTime = DateTime.newInstance(currDate.year(), currDate.month(), currDate.day());  
        String todayDay = currDateAndTime.format('EEEE'); 
        List<Holiday> holidaysList = [select id, name, ActivityDate FROM Holiday WHERE ActivityDate =: currDate LIMIT 1];
        if(!holidaysList.isEmpty()){
            isHoliday= true;
        }
        System.Debug('isHoliday ' + isHoliday);
        if(test.isRunningTest()){
            return false;
        }
        return isHoliday;
    }*/
    
   
}