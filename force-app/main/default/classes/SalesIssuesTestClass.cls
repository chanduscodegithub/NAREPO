@isTest
public class SalesIssuesTestClass {
    
    @isTest 
    public static void setup(){
        
        Account acc = new Account(Name = 'TestAcct',Subtype__c = 'National Accounts - West',Type ='National Accounts - West');
        insert acc;
        
        List<case> openCases = new List<Case>();
            openCases.add(new case(AccountId = acc.Id,Status = 'Open',
                                   RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Operations').getRecordTypeId()));  
        
        insert openCases;
        
        List<case> closedCases = new List<Case>();
            closedCases.add(new case(AccountId = acc.Id,Status = 'Closed',
                                     RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('Operations').getRecordTypeId()));  
        insert closedCases;
        SalesIssuesApexClass.getOpenClosedCases(acc.Id);
        
    }
}