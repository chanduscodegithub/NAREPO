/** ######################################################################################
* @author       Sudarshan Reddy M
* @date         03/29/2019
* @description  Invocable Apex used in Task Process Builder to insert/update the Utilization Metric Record
*                 
*##########################################################################################    */
public class UtilizationMetricApex {
    
    @InvocableMethod(label='Utilization Metric Process Apex' description='Inserting and Updating Utilization Metric Fields')
    public static void utilizationMetricCalculations(TaskIdsAndStringFromProcess[] taskParams){
        
        Date currentDay  = System.today();
        String userId = UserInfo.getUserId();
        //String holiday = 'Holiday';        
        Integer taskIdsCount = 0;
        if(taskParams != null && taskParams.size() > 0) {
        	taskIdsCount = taskParams.size();   
        }
        Set<Date> holidayDates = new Set<Date>();
        List<Utilization_Metric__c> utlilizationMetricsListToBeUpdated = new List<Utilization_Metric__c>(); 
        
        List<Holiday> holidaysList = [SELECT ActivityDate FROM Holiday];
        if(holidaysList != null && holidaysList.size() > 0) {
            for(Holiday hol : holidaysList){
                holidayDates.add(hol.ActivityDate);
            }
        }        
        
        List<Utilization_Metric__c>  utilizationMetricList = [SELECT id, Utilization__c, Date__c, User__c, Holidays__c, Description__c 
                                                              from Utilization_Metric__c WHERE Date__c =:currentDay  AND User__c =:userId];
        
        if(utilizationMetricList != null && utilizationMetricList.size() > 0) {
            
            for(Utilization_Metric__c utilMetricRec : utilizationMetricList) {
                
                if(utilMetricRec.Utilization__c != null) {
                    utilMetricRec.Utilization__c = utilMetricRec.Utilization__c + taskIdsCount;    
                } else {
                    utilMetricRec.Utilization__c = taskIdsCount;
                }
                
                System.debug('Initial Desc-'+utilMetricRec.Description__c);
                
                if(taskParams != null && taskIdsCount > 0) {
                    
                    String taskDesc = '';
                    if(taskParams[0].taskCreated_Closed == 'Added a Task') { 
                        taskDesc = taskParams[0].taskCreated_Closed+'('+String.valueOf(taskIdsCount)+')';
                    } else {
                        taskDesc = taskParams[0].taskCreated_Closed;
                    }
                    if(utilMetricRec.Description__c == null || utilMetricRec.Description__c == '') {
                        utilMetricRec.Description__c = taskDesc;
                    } else {
                        utilMetricRec.Description__c = utilMetricRec.Description__c + ';'+ taskDesc;
                    }
                    System.debug('Task Status Val-'+taskParams[0].taskCreated_Closed);
                }                
                System.debug('Update Desc1-'+utilMetricRec.Description__c);
                
                if(holidayDates != null && holidayDates.size() > 0 && holidayDates.contains(currentDay)){
                    utilMetricRec.Holidays__c = 'Holiday';
                }

                utlilizationMetricsListToBeUpdated.add(utilMetricRec);
            }                        
            
            if(utlilizationMetricsListToBeUpdated != null && utlilizationMetricsListToBeUpdated.size() > 0) {
                update utlilizationMetricsListToBeUpdated; 
            }
            
        } 
         /*
         *  As part of Utilization Enhancement - No need to create the Utilization records on updates of Task.
         * Batch will create the records as per current requirement.
         *
        else {
            Utilization_Metric__c newUM = new Utilization_Metric__c();
            newUM.Date__c = currentDay;
            newUM.Utilization__c = taskIdsCount;
            newUM.User__c = userId;
            if(taskParams[0].taskCreated_Closed == 'Added a Task'){
                newUM.Description__c = taskParams[0].taskCreated_Closed+'('+string.valueOf(taskIdsCount)+')';
            }else {
                newUM.Description__c = taskParams[0].taskCreated_Closed;
            }
            if(holidayDates.contains(currentDay)){
                newUM.Holidays__c = 'Holiday';
            }
            insert newUM;
        }*/
    }
    
    Public class TaskIdsAndStringFromProcess {
        
        @InvocableVariable
        Public String taskCreated_Closed;
        
        @InvocableVariable
        Public List<ID> taskIds;
    }
}