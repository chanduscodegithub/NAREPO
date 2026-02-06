/** ######################################################################################
* @author       Sudarshan Reddy
* @date         08/06/2018
* @description  Unit Test for CaseTargetCompletionDateforEmailCase class
*##########################################################################################    */

@isTest
Public class CaseTargetCompletionDateforEmailCaseTest {
    
    
    @isTest
    static void TargetCompletionDateCalculationEmailTestMethod(){
        
        List<case> testCaseList1 = new List<case>();
        Case c1 = new Case(Category__c = 'BAR', Sub_Category__c = 'Appeal', Visibility__c = 'AMT', Status = 'Open', origin = 'Email',
                           recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('General Action').getRecordTypeId());
        
        testCaseList1.add(c1);
        test.startTest();
        
        insert testCaseList1;
        List<Id> testCaseListId = new List<Id>();
        for(Case testCase : testCaseList1){
            testCaseListId.add(testCase.Id);
        }
        CaseTargetCompletionDateCalculation.TargetCompletionDateCalculation(testCaseListId);
        
        test.stopTest();
        
    }
     @isTest
    static void TargetCompletionDateCalculationEmailTestMethod2(){
        
        List<case> testCaseList1 = new List<case>();
        Case c1 = new Case(Category__c = 'BAR', Sub_Category__c = 'Appeal', Visibility__c = 'AMT', Status = 'Open', 
                           recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('General Action').getRecordTypeId());
        
        testCaseList1.add(c1);
        test.startTest();
        
        insert testCaseList1;
        List<Id> testCaseListId = new List<Id>();
       // for(Case testCase : testCaseList1){
      //      testCaseListId.add(testCase.Id);
       // }
        CaseTargetCompletionDateCalculation.TargetCompletionDateCalculation(testCaseListId);
        
        test.stopTest();
        
    
    }
}