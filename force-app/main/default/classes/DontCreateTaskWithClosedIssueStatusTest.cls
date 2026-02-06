@isTest
public class DontCreateTaskWithClosedIssueStatusTest {
    
    @isTest
    static void dontCreateTaskMethod(){
        
        Boolean expectedExceptionThrown;
        List<case> caseList = new  List<case>();
        List<Task> taskList = new  List<Task>();
        
        Case c = new Case(Status = 'Pended',
                          recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('SBS Support').getRecordTypeId());
        
        caseList.add(c);
        insert caseList; 
        
        Task t = new Task(OwnerId = UserInfo.getUserId(), Subject = 'Test Task', Priority = 'Normal', Status = 'Open', whatId = caseList[0].Id,
                          recordTypeId = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName().get('NPS_Action_Task_Record_Type').getRecordTypeId());
        
        taskList.add(t);
        
        Test.startTest();
        
        
        try{     
            insert taskList;          
        }        
        catch(Exception e){            
            expectedExceptionThrown =  (e.getMessage().contains('Cannot add a Task to Closed Issues')) ? true : false;
            system.debug('e.getMessage()'+e.getMessage());
            System.AssertEquals(expectedExceptionThrown, true);            
        } 
        
        Test.stopTest();
    }
}