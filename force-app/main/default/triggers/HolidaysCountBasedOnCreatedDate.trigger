/** ######################################################################################
* @author       Sudarshan Reddy M
* @date         03/22/2019
* @description  This trigger is used to calculate the working Days(excluding weekend Days and Holidays) for particular month based on the Date Field
*                 
*##########################################################################################    */
trigger HolidaysCountBasedOnCreatedDate on Utilization_Metric__c (before insert, before update) {
    
    Set<Date> holidayDates = new Set<Date>();
    Date firstDayOfMonth;
    Date lastDayOfMonth;
    Date dt;
    DateTime currDate;
    String todayDay;
    Integer workingDays = 0;
    
    for(Holiday hol : [SELECT ActivityDate FROM Holiday]){
        holidayDates.add(hol.ActivityDate);
    }
    
    for(Utilization_Metric__c UM : trigger.new){
        if(UM.date__c != null){
            firstDayOfMonth = UM.date__c.toStartOfMonth();
            lastDayOfMonth = firstDayOfMonth.addDays(Date.daysInMonth(firstDayOfMonth.year(), firstDayOfMonth.month()) - 1);
        }
    }
    
    if(firstDayOfMonth != null && lastDayOfMonth != null){
        for(integer i=0; i <= firstDayOfMonth.daysBetween(lastDayOfMonth); i++)   {  
            dt = firstDayOfMonth + i;  
            currDate = DateTime.newInstance(dt.year(), dt.month(), dt.day());  
            todayDay = currDate.format('EEEE'); 
            if(todayDay != 'Saturday' && todayDay !='Sunday' && (!holidayDates.contains(dt)))  {  
                workingDays = workingDays + 1;  
            }     
        }
    }  
    
    for(Utilization_Metric__c UM : trigger.new){
        if(workingDays > 0){
            UM.Working_Days__c = workingDays;
        }
    }
}