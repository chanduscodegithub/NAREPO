/** ######################################################################################
* @author       Sudarshan Reddy M
* @date         04/1/2019
* @description  Test Class for UtilizationMetricApex 
*                 
*##########################################################################################    */
@isTest
public class UtilizationMetricApexTest {
    
    @isTest
    static void taskUtilizationMethod(){
        test.startTest();
        Date dt = system.today(); 
        User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        System.runAs (thisUser) {
            //SELECT id, Utilization__c, Date__c, User__c, Holidays__c, Description__c from Utilization_Metric__c WHERE Date__c =:currentDay  AND User__c =:userId
            Utilization_Metric__c u = new Utilization_Metric__c();
            u.Date__c=system.today();
            u.User__c=userinfo.getUserId();
            insert u;
            system.debug('variable@@@'+u);
            
            
            Holiday hol = new Holiday(Name='Test holiday1', activitydate = dt);          
            insert hol;
            
            Case c = new Case(Status = 'Open', recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('SBS Support').getRecordTypeId()); 
            insert c; 
            
            Task t = new Task(OwnerId = UserInfo.getUserId(), Subject = 'Test Task', Priority = 'Normal', Status = 'Open', whatId = c.Id,
                              recordTypeId = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName().get('Task_Record_Type').getRecordTypeId());
            insert t;  
            
            string taskStatus = 'test String';
            List<ID> testtaskIds = new List<ID>{c.Id};
                
                UtilizationMetricApex.TaskIdsAndStringFromProcess testWrap;
            testWrap= new  UtilizationMetricApex.TaskIdsAndStringFromProcess();
            testWrap.taskCreated_Closed = taskStatus;
            testWrap.taskIds = testtaskIds;
            
            // Creation of Utilization Record 
            UtilizationMetricApex.utilizationMetricCalculations(new List<UtilizationMetricApex.TaskIdsAndStringFromProcess>{ testWrap } );
            
            t.Status = 'Completed';
            update t;
            
            string taskStatus2 = 'test String';
            List<ID> testtaskIds2 = new List<ID>{c.Id};
                
                UtilizationMetricApex.TaskIdsAndStringFromProcess testWrap2;
            testWrap2= new  UtilizationMetricApex.TaskIdsAndStringFromProcess();
            testWrap2.taskCreated_Closed = taskStatus2;
            testWrap2.taskIds = testtaskIds2;
            
            // Updation of Utilization Record
            UtilizationMetricApex.utilizationMetricCalculations(new List<UtilizationMetricApex.TaskIdsAndStringFromProcess>{ testWrap2 } );
            test.stopTest(); 
            
        } 
    }    
}