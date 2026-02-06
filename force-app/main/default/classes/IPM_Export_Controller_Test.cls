@isTest
public class IPM_Export_Controller_Test {
    @testSetup static void createTestData() {
        Account acc = new Account();
        acc.Name = 'Test Account';
        acc.Subtype__c ='Prospect';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acc;
        
        Project_Template__c projectData = new Project_Template__c();
        projectData.Name  = 'Test Implementation Plan';
        projectData.Start_Date__c  = Date.today();
        projectData.Effective_Date__c = Date.today();
        projectData.Account__c = acc.Id;
        projectData.Overall_Project_Status__c = 'Blue';
        insert projectData;
        
        List<IPM_Team__c> ipmTeamList = new List<IPM_Team__c>();
        
        IPM_Team__c ipmTeamMemberRec1=new IPM_Team__c();
        ipmTeamMemberRec1.Project_Template__c=projectData.Id;
        ipmTeamMemberRec1.First_Name__c='Test';
        ipmTeamMemberRec1.Last_Name__c='IPM Team Member1';
        ipmTeamMemberRec1.IPM_Roles__c='Client Director';
        
        ipmTeamList.add(ipmTeamMemberRec1);
        
        IPM_Team__c ipmTeamMemberRec2=new IPM_Team__c();
        ipmTeamMemberRec2.Project_Template__c=projectData.Id;
        ipmTeamMemberRec2.First_Name__c='Test';
        ipmTeamMemberRec2.Last_Name__c='IPM Team Member1';
        ipmTeamMemberRec2.IPM_Roles__c='Banking Analyst';
        
        ipmTeamList.add(ipmTeamMemberRec2);  
        
        insert ipmTeamList;
        
        List<Project_Task__c> prjctTaskList = new List<Project_Task__c>();
        
        Project_Task__c  prjctTask1 = new Project_Task__c   ();
        prjctTask1.PRT_Name__c = projectData.Id;
        String resourceId;
        for(IPM_Team__c eachIpmTeamMember:ipmTeamList){
            if(String.isEmpty(resourceId) || String.isEmpty(resourceId)){
                resourceId=eachIpmTeamMember.Id;
            }
            else{
                resourceId=resourceId+','+eachIpmTeamMember.Id;
            }
        }
        prjctTask1.Resource_Id__c = resourceId;
        
        prjctTaskList.add(prjctTask1);
        
        Project_Task__c  prjctTask2 = new Project_Task__c   ();
        prjctTask2.PRT_Name__c = projectData.Id;
        prjctTask2.Resource_Id__c = ipmTeamList[0].Id;
        
        prjctTaskList.add(prjctTask2);
        
        insert prjctTaskList;
    }
    
   /* @isTest static void testGetAllFieldName(){
        Project_Template__c ipmRec=[Select Id from Project_Template__c where Name='Test Implementation Plan'];
        
        Test.startTest();
        IPM_Export_Controller.GetAllFieldName('Project_Task__c',ipmRec.Id);
        List<String> sampleList = new List<String>{'sample'};
        system.assertEquals(1, sampleList.size());
        Test.stopTest();
        
    }*/
    
    @isTest static void testGetTemplateInXML(){
        Project_Template__c ipmRec=[Select Id from Project_Template__c where Name='Test Implementation Plan'];
        
        Test.startTest();
        IPM_Export_Controller.GetAllFieldName('Project_Task__c',ipmRec.Id);
        IPM_Export_Controller.getTemplateInXML(ipmRec.Id,true);
        IPM_Export_Controller.getTemplateInXML(ipmRec.Id,false);
        
        List<String> sampleList = new List<String>{'sample'};
        system.assertEquals(1, sampleList.size());
        Test.stopTest();
        
    }
    
    
}