@isTest
public class TestCaseTriggers {
/* ####################################################################################
* @author       Satish S
* @date         10/04/2019
* @description  Test Class for Trigger - CaseTriggers            
*##########################################################################################    */
   @isTest 
    public static void UpdateResolutionTest(){
        List<RecordType> GeneralActionRecIds = [Select Id From RecordType where sObjectType='Case' and Name = 'General Action' and isActive=true LIMIT 1];
        Id GeneralActionRecId = GeneralActionRecIds.get(0).Id;
        Case testCase = new Case(Subject = 'Test Case',RecordTypeId = GeneralActionRecId);
        insert testCase;
        testCase.Case_Screenshots__c = 'Resolution Comment 1';//update Resolution Comments on Case
        Test.startTest();
        update testCase;
        Test.stopTest();
        Utilization_Metric__c um = [Select Description__c from Utilization_Metric__c where User__c = :UserInfo.getUserId()
                                          and Date__c = :date.today() LIMIT 1];
        //Assert the Utilization record has captured the resolution comment activity by checking the Description
        System.assert(um.Description__c.contains('Updated Resolution Comments'));
    }

}