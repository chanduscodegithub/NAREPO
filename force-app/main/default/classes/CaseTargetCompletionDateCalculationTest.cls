/** ######################################################################################
* @author       Sudarshan Reddy
* @date         08/06/2018
* @description  Unit Test for CaseTargetCompletionDateCalculation class
*##########################################################################################    */

@isTest
Public class CaseTargetCompletionDateCalculationTest {
    
    
    @isTest
    static void TargetCompletionDateCalculationforSBS(){
        
        List<case> testCaseList = new List<case>();
        Case c1 = new Case(Category__c = 'BTB', Sub_Category__c = 'Update CM', Visibility__c = 'AMT', Status = 'Open',
                           recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('SBS Support').getRecordTypeId());
        
        testCaseList.add(c1);
        
        test.startTest();
        
        insert testCaseList;
        List<Id> testCaseListId = new List<Id>();
        for(Case testCase : testCaseList){
            testCaseListId.add(testCase.Id);
        }
        CaseTargetCompletionDateCalculation.TargetCompletionDateCalculation(testCaseListId);
        
        test.stopTest();
        
    }
    
    @isTest
    static void TargetCompletionDateCalculationotherthanSBS(){
        
        List<case> testCaseList = new List<case>();
        Case c1 = new Case(Visibility__c = 'AMT', Status = 'Open',
                           recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('Eligibility').getRecordTypeId());
        
        testCaseList.add(c1);
        
        test.startTest();
        
        insert testCaseList;
        List<Id> testCaseListId = new List<Id>();
        for(Case testCase : testCaseList){
            testCaseListId.add(testCase.Id);
        }
        CaseTargetCompletionDateCalculation.TargetCompletionDateCalculation(testCaseListId);
        
        test.stopTest();
        
    }
    
     @isTest
    static void TargetCompletionDateCalculationTestMethod2(){
        
        List<case> testCaseList = new List<case>();
        Case c1 = new Case(CreatedDate = system.today().addDays(-2), Status = 'Open',
                           recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('SBS Support').getRecordTypeId());
        
        testCaseList.add(c1);
        
        test.startTest();
        
        insert testCaseList;
        List<Id> testCaseListId = new List<Id>();
        for(Case testCase : testCaseList){
            testCaseListId.add(testCase.Id);
        }
        CaseTargetCompletionDateCalculation.TargetCompletionDateCalculation(testCaseListId);
        
        test.stopTest();
        
    }
   
}