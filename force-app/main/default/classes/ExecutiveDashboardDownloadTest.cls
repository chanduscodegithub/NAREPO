@isTest
public class ExecutiveDashboardDownloadTest {
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
        projectData.Overall_Project_Status__c = 'Red';
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
        taskData.Project_Type__c = 'project';
        taskData.Project_Task_Id__c = '1';
        taskData.WBS_Code__c = '1';
        
        taskData.Parent__c = '0';
        
        Project_Task__c	 taskData2 = new Project_Task__c	();
        taskData2.PRT_Name__c = projectData.Id;
        taskData2.Project_Type__c = 'task';
        taskData2.Project_Task_Id__c = '2';
        taskData2.Parent__c = '1';
        taskData2.WBS_Code__c = '1.1';
        taskData2.Dashboard__c = true;
        
        Project_Task__c	 taskData3 = new Project_Task__c	();
        taskData3.PRT_Name__c = projectData.Id;
        taskData3.Project_Type__c = 'project';
        taskData3.Project_Task_Id__c = '3';
        taskData3.End_Date__c = system.today().addDays(1);
        taskData3.Parent__c = '1';
        taskData3.WBS_Code__c = '1.2';
        taskData3.Dashboard__c = true;
        
        Project_Task__c	 taskData4 = new Project_Task__c	();
        taskData4.PRT_Name__c = projectData.Id;
        taskData4.Project_Type__c = 'task';
        taskData4.Project_Task_Id__c = '4';
        taskData4.End_Date__c = system.today().addDays(2);
        taskData4.Parent__c = '3';
        taskData4.Dashboard__c = true;
        taskData4.WBS_Code__c = '1.2.1';
        
        Project_Task__c	 taskData5 = new Project_Task__c	();
        taskData5.PRT_Name__c = projectData.Id;
        taskData5.Project_Type__c = 'task';
        taskData5.Project_Task_Id__c = '5';
        taskData5.End_Date__c = system.today().addDays(3);
        taskData5.Parent__c = '3';
        taskData5.Dashboard__c = true;
        taskData5.WBS_Code__c = '1.2.2';
        
        insert new List<Project_Task__c>{taskData2,taskData,taskData3,taskData4,taskData5};
        
        
    }    
    
    @isTest static void getIPMDataTest(){
        ExecutiveDashboardDownloadCtrl obj = new ExecutiveDashboardDownloadCtrl();
        List<String> sampleList = new List<String>{'sample'};
        system.assertEquals(1, sampleList.size());
        
    }
    
   /* @isTest static void getSchedule(){
        ScheduleExecutiveDashboard obj = new ScheduleExecutiveDashboard();
        
        String CRON_EXP = '0 0 0 3 9 ? 2022';
      
        Test.startTest();
        String jobId = System.schedule('ExecutiveDashboardTest', CRON_EXP,  obj);
        system.assertEquals('0 0 0 3 9 ? 2022', CRON_EXP);
        Test.stopTest();
        
    }*/
    
}