@isTest
public class IRAD_LOG_ControllerTest {

    @testSetup static void createTestData(){
        
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
        projectData.Overall_Project_Status__c = 'Blue';
        insert projectData;
        system.debug('projectData : '+projectData);
        
        List<IRAD__c> iradList=new List<IRAD__c>();
        
        IRAD__c iradRec1 = new IRAD__c();
        iradRec1.Project__c = projectData.Id;
        iradRec1.Internal_External__c = 'External';	
        iradRec1.Description__c = 'Test Description';
        
        iradList.add(iradRec1);
        
        IRAD__c iradRec2 = new IRAD__c();
        iradRec2.Project__c = projectData.Id;
        iradRec2.Internal_External__c = 'Internal';	
        iradRec2.Description__c = 'Test Description';
        
        iradList.add(iradRec2);
          
        insert iradList;

        
    } 
    
    
    @isTest static void getAllFieldNameTest(){
        
		Project_Template__c projectTemplate = [SELECT Id FROM Project_Template__c Where Name = 'Test Project Template' Limit 1];        
        String objectName = 'IRAD__c';
        IRAD_LOG_Controller.getAllFieldName(objectName,projectTemplate.Id);
        
    }  
    
    @isTest static void upsertIradRecordsTest(){
        
		Project_Template__c projectTemplate = [SELECT Id FROM Project_Template__c Where Name = 'Test Project Template' Limit 1];        
        
        Id projectTemplateId = projectTemplate.Id;
        List<IRAD__c> iradJson = [SELECT Id FROM IRAD__c Where Project__c = : projectTemplateId]; 
        system.debug('iradJson : '+iradJson);
        system.debug('projectTemplateId : '+projectTemplateId);
        IRAD_LOG_Controller.upsertIradRecords(iradJson,projectTemplateId,1,'Status__c','ASC');
        
    }  
    
    @isTest static void testGetTemplateInXML(){
        Project_Template__c ipmRec=[Select Id from Project_Template__c where Name='Test Project Template'];
        
        Test.startTest();
        IRAD_LOG_Controller.getTemplateInXML(ipmRec.Id,true);
        IRAD_LOG_Controller.getTemplateInXML(ipmRec.Id,false);
        Test.stopTest();
        
    }
    
    @isTest static void testGetIRADRecords(){
        Project_Template__c ipmRec=[Select Id from Project_Template__c where Name='Test Project Template'];
        
        Test.startTest();
        IRAD_LOG_Controller.getIRADRecords(ipmRec.Id,1,'Status__c','ASC');
        IRAD_LOG_Controller.getIRADRecords(ipmRec.Id,2,'Status__c','DESC');
        Test.stopTest();
        
    }
    
    
    
    
    
}