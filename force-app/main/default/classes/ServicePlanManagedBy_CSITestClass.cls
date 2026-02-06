@isTest
public class ServicePlanManagedBy_CSITestClass {
    @isTest static void createData(){
        Account account = new Account();
            account.Name = 'Test CM Account1';
            account.Subtype__c ='National Accounts - East';
            account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert account;        
        Case case1 = new Case();
        case1.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get('Strategy').getRecordTypeId();
        case1.AccountId = account.Id;
        case1.Status = 'Open';
        case1.Category__c = 'Service Plan';
        case1.ClosedDate = System.now();
        case1.CreatedDate = System.now();        
        insert case1;
        ServicePlanManagedBy_CSIClass.getOpenClosedCases(account.Id);
        case1.Status = 'Closed';
        update case1;
        ServicePlanManagedBy_CSIClass.getOpenClosedCases(account.Id);
    }    

}