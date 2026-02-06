@isTest
private class NPSActionPlanTemplateTest {
    
    @testSetup static void createTestData(){
        
        List<Account> acc = new List<Account>();
        acc.add(new Account(Name='testAccount',Subtype__c ='National Accounts - East',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()));
        insert acc;
        
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        
        Action_Service_Plan__c case1 = new Action_Service_Plan__c();
        case1.RecordTypeId = Schema.SObjectType.Action_Service_Plan__c.getRecordTypeInfosByDeveloperName().get('NPS_Action').getRecordTypeId();
        case1.Company_Name__c = acct;
        case1.Status__c = 'Open';
        case1.Category__c = 'Innovation';
        case1.Year__c = '2018';
        case1.CreatedDate = System.now();        
        insert case1;        
    }
    public testMethod static void validateGetRiskProfileMetaDate(){
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        Id npsId = [SELECT Id FROM Action_Service_Plan__c LIMIT 1].Id;
        List<String> npsIds = new List<String>();
        npsIds.add(npsId);
        NPSActionPlanTemplate.getTemplateInXML(acct,npsIds);
        //NPSActionPlanTemplate.buildNPSTemplate();
        NPSActionPlanTemplate.getTemplateOnLoad(npsIds);
    }                    
}