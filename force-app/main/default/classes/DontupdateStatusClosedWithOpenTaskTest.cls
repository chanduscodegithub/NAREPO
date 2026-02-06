@isTest
public class DontupdateStatusClosedWithOpenTaskTest {
    
    @isTest
    static void dontUpdateIssueTestMethod(){
        
        Boolean expectedExceptionThrown;
        List<case> caseList = new  List<case>();
        List<Task> taskList = new  List<Task>();
        
        Case c = new Case(Status = 'Open', 
                          recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('SBS Support').getRecordTypeId());
        
        caseList.add(c);
        insert caseList;
        
        Task t = new Task(OwnerId = UserInfo.getUserId(), Subject = 'Test Task', Priority = 'Normal', Status = 'Open',whatId = caseList[0].Id,
                          recordTypeId = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName().get('NPS_Action_Task_Record_Type').getRecordTypeId());
        
        taskList.add(t);
        
        
        Case cQuery = new case();
        cQuery.Id = c.id;
        cQuery.Status = 'closed';
        
        
        Test.startTest();
        insert taskList;
        
        try{     
            // policy1.Name = '720455';
            update cQuery;           
        }        
        catch(Exception e){            
            expectedExceptionThrown =  (e.getMessage().contains('Cannot Change the Status to closed if Case has Open Activities')) ? true : false;
            system.debug('e.getMessage()'+e.getMessage());
            System.AssertEquals(expectedExceptionThrown, true);            
        } 
        Test.stopTest();
        
    }
    
    /**   @isTest
static void dontUpdateIssueTestMethod2(){

Boolean expectedExceptionThrown;
List<case> caseList = new  List<case>();
List<Task> taskList = new  List<Task>();

Case c = new Case(Status = 'Open', Date_Completed__c = system.today(),
recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('SBS Support').getRecordTypeId());

caseList.add(c);
insert caseList;

Task t = new Task(OwnerId = UserInfo.getUserId(), Subject = 'Test Task', Priority = 'Normal', Status = 'Open',whatId = caseList[0].Id,
recordTypeId = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName().get('NPS_Action_Task_Record_Type').getRecordTypeId());

taskList.add(t);


Case cQuery = new case();
cQuery.Id = c.id;
cQuery.Date_Completed__c = null;

Test.startTest();
insert taskList;
try{     
// policy1.Name = '720455';
update cQuery;         
}        
catch(Exception e){            
expectedExceptionThrown =  (e.getMessage().contains('Cannot Change the Status to closed if Case has Open Activities')) ? true : false;
system.debug('e.getMessage()'+e.getMessage());
System.AssertEquals(expectedExceptionThrown, true);            
} 
Test.stopTest();

} **/
}