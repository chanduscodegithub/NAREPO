@isTest
private class IPM_Dashboard_ControllerTest {
    
    
    @testSetup static void setup(){
        
        Account acc = new Account();
        acc.Name = 'Test Account';
        acc.Subtype__c ='Prospect';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acc;
        system.debug('accData : '+acc);
        
        Project_Template__c projectData = new Project_Template__c();
        projectData.Name  = 'Test Project Template';
        projectData.Start_Date__c  = Date.today();
        projectData.Effective_Date__c = Date.today();
        projectData.Account__c = acc.Id;
        projectData.Overall_Project_Status__c='Blue';
        insert projectData;
        system.debug('projectData : '+projectData);
        
        IRAD__c iradData = new IRAD__c();
        iradData.Project__c = projectData.Id;
        iradData.Internal_External__c = 'External';	
        iradData.Description__c = 'Test Description';
        
        insert iradData;
        system.debug('iradData : '+iradData);
        
        
        Project_Task__c	 taskData = new Project_Task__c	();
        taskData.PRT_Name__c = projectData.Id;
        
        insert taskData;
        system.debug('iradData : '+taskData);
        
    }    
    
        
     @isTest static void getIPMDataTest(){
        
        Project_Template__c projectTemplate = [SELECT Id FROM Project_Template__c Where Name = 'Test Project Template' Limit 1];
         IPM_Dashboard_Controller.getIPMData(projectTemplate.Id);
    }
    
    
    @isTest static void getTemplateInXMLTest(){
        List<String> idList = new List<String>();
        Project_Template__c projectTemplate = [SELECT Id FROM Project_Template__c Where Name = 'Test Project Template'];
         IPM_Dashboard_Controller.getTemplateInXML(projectTemplate.Id,idList,true);
        IPM_Dashboard_Controller.getTemplateInXML(projectTemplate.Id,idList,false);
    }
    
   

}