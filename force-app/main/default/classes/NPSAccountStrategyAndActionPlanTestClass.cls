@isTest
public class NPSAccountStrategyAndActionPlanTestClass {
    @isTest 
    public static void createData(){
        
        /*Account acc = new Account(Name = 'TestAcct');
insert acc;

List<Action_Service_Plan__c> openCases = new List<Action_Service_Plan__c>();
openCases.add(new Action_Service_Plan__c(Company_Name__c = acc.Id,Status__c = 'Open'));  

insert openCases;

List<Action_Service_Plan__c> closedCases = new List<Action_Service_Plan__c>();
closedCases.add(new Action_Service_Plan__c(Company_Name__c = acc.Id,Status__c = 'Closed'));  
insert closedCases;
NPSAccountStragergyAndActionPlanApex.getOpenClosedCases(acc.Id);*/
        
        Account account = new Account();
        account.Name = 'Test CM Account1';
        account.Subtype__c ='Prospect';
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert account;  
        
        Action_Service_Plan__c case1 = new Action_Service_Plan__c();
        case1.RecordTypeId = Schema.SObjectType.Action_Service_Plan__c.getRecordTypeInfosByDeveloperName().get('NPS_Action').getRecordTypeId();
        case1.Company_Name__c = account.Id;
        case1.Status__c = 'Open';
        case1.Category__c = 'Innovation';
        case1.Year__c = '2018';
        case1.CreatedDate = System.now();        
        insert case1;
        
        NPSAccountStragergyAndActionPlanApex.getOpenClosedCases(account.Id, 'columnName', 'DESC');
        case1.Status__c = 'Closed';
        update case1;
        
        NPSAccountStragergyAndActionPlanApex.getOpenClosedCases(account.Id, 'columnName', 'DESC');
        
    }
    
}