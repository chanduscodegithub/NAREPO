@isTest
public class ganttcontrollerTestClass {
    
    @testSetup
    public static void createData(){
        
        Account acc= new Account();
        acc.Name = 'Dummy Company';
        acc.Subtype__c = 'Enterprise Strategic Accounts';
        insert acc;
        
        Project_Template__c projectTemplate= new Project_Template__c();
        //projectTemplate.Template__c= true;
        projectTemplate.Name = 'project';
        projectTemplate.Start_Date__c =Date.Today();
        projectTemplate.Effective_Date__c = Date.Today();
        projectTemplate.Account__c = acc.id;
        projectTemplate.Overall_Project_Status__c ='Red';
        insert projectTemplate;
        
        Project_Template__c projectTemplate1= new Project_Template__c();
        //projectTemplate.Template__c= true;
        projectTemplate1.Name = 'project';
        projectTemplate1.Start_Date__c =Date.Today();
        projectTemplate1.Effective_Date__c = Date.Today();
        projectTemplate1.Account__c = acc.id;
        projectTemplate1.Overall_Project_Status__c ='Red';
        projectTemplate1.Project_Template__c = projectTemplate.id;
        insert projectTemplate1;
        
        
        Project_Template__c projectTemplate2= new Project_Template__c();
        //projectTemplate.Template__c= true;
        projectTemplate2.Name = 'project';
        projectTemplate2.Start_Date__c =Date.Today();
        projectTemplate2.Effective_Date__c = Date.Today();
        projectTemplate2.Account__c = acc.id;
        projectTemplate2.Overall_Project_Status__c = 'Red';
        //projectTemplate2.Project_Template__c = projectTemplate.id;
        insert projectTemplate2;
        
        
        List<IPM_Team__c> IpmteamList = new List<IPM_Team__c>();
        IPM_Team__c Ipmteam = new IPM_Team__c();
        Ipmteam.IPM_Roles__c='Vendor';
        Ipmteam.Project_Template__c =projectTemplate.Id;
        Ipmteam.Last_Name__c = 'LN';
        Ipmteam.First_Name__c ='FN';
        insert Ipmteam;   
        
        List<IPM_Team__c> IpmteamList1 = new List<IPM_Team__c>();
        IPM_Team__c Ipmteam1 = new IPM_Team__c();
        Ipmteam1.IPM_Roles__c='Vendor';
        Ipmteam1.Project_Template__c =projectTemplate1.Id;
        Ipmteam1.Last_Name__c = 'LN';
        Ipmteam1.First_Name__c ='FN';
        IpmteamList1.add(Ipmteam1);
        insert IpmteamList1;   
        
        
        
        Project_Task__c projectTask1 = new Project_Task__c();
        projectTask1.PRT_Name__c= projectTemplate2.id;
        projectTask1.Project_Task_Name__c = 'New task';
        projectTask1.Actual_Finish__c = Date.Today();
        projectTask1.WBS_Code__c = '1';
        projectTask1.Start_Date__c= Date.Today();
        projectTask1.End_Date__c= Date.Today();
        projectTask1.Duration__c=1;
        projectTask1.priority__c ='low';
        projectTask1.predecessors__c = '2SF+0days';
        projectTask1.Project_Type__c = 'task';
        projectTask1.Checked__c = true;
        projectTask1.Progress__c = 100;
        projectTask1.Notes__c = 'test notes';
        projectTask1.Dashboard__c = true;
        projectTask1.Mark_as_Milestone__c = true;
        projectTask1.Parent__c = '0';
        projectTask1.Row_Number__c = 1;
        projectTask1.Resource_Id__c = 'Ipmteam.id';
        insert projectTask1;
        
        
        //IpmteamList.add(Ipmteam);
        
        List<Project_Task__c> projTaskList = new List<Project_Task__c>();
        Project_Task__c projectTask= new Project_Task__c();
        projectTask.PRT_Name__c= projectTemplate.id;
        projectTask.Project_Task_Name__c = 'New task';
        projectTask.Actual_Finish__c = Date.Today();
        projectTask.WBS_Code__c = '1';
        projectTask.Start_Date__c= Date.Today();
        projectTask.End_Date__c= Date.Today();
        projectTask.Duration__c=1;
        projectTask.priority__c ='low';
        projectTask.predecessors__c = '2SF+0days';
        projectTask.Project_Type__c = 'task';
        projectTask.Checked__c = true;
        projectTask.Progress__c = 100;
        projectTask.Notes__c = 'test notes';
        projectTask.Dashboard__c = true;
        projectTask.Mark_as_Milestone__c = true;
        projectTask.Parent__c = '0';
        projectTask.Row_Number__c = 1;
        projectTask.Resource_Id__c = 'Ipmteam.id';
        insert projectTask;
        projTaskList.add(projectTask);
        

        ganttcontroller.csvVals = 'Gantt';
        ganttcontroller.RHSValuesForFields= 'Gantt';
        ganttcontroller.predvalue= 'Gantt';
        ganttcontroller.statusvalue= 'Gantt';
        ganttcontroller.typevalue= 'Gantt';
        ganttcontroller.deletetaskvalues= 'Gantt';
        ganttcontroller.linkValues= 'Gantt';
        ganttcontroller.linkidsValues= 'Gantt';
        ganttcontroller.templname= 'Gantt';
        ganttcontroller.jsonStringValue = 'Gantt';
        ganttcontroller.ProjtaskData = projTaskList;
        ganttcontroller.ProjtaskData1 = projTaskList;
        ganttcontroller.ProjtaskData2 = projTaskList;
        ganttcontroller.ProjtaskData1_2 = projTaskList;
        
    }
    
    public testMethod static void testProjectData(){
        test.startTest();
        
        Project_Template__c projTemplate = new Project_Template__c();
        
        List<Project_Template__c> projTemplateList = [Select Id from Project_Template__c];
        
        List<Project_Task__c> projTaskList = [Select Id from Project_Task__c];
        
        List<String> deleteIds = new List<String>();
        
        deleteIds.add(String.valueOf(projTemplateList.get(1).Id));
        
        List<String> lstStr = new List<string>();
        
        String jsonStr = '{"Project_Task_Id__c":1562911705802,"WBS_Code__c":"38","Project_Task_Name__c":"New task","Start_Date__c":"2019-06-02T00:00:00.000Z","End_Date__c":"2019-06-03T00:00:00.000Z","Duration__c":1,"priority__c":"Low","predecessors__c":"","Project_Type__c":"task","Resource_Id__c":"","Checked__c":"true","Dashboard__c":"true","Mark_as_Milestone__c":"false","Actual_Finish__c":"2019-06-03T00:00:00.000Z"}';
        String jsonStr1 = '{"Project_Task_Id__c":1562911705802,"WBS_Code__c":"38","Project_Task_Name__c":"New task","Start_Date__c":"2019-06-02T00:00:00.000Z","End_Date__c":"2019-06-03T00:00:00.000Z","Duration__c":1,"priority__c":"Low","predecessors__c":"","Project_Type__c":"task","Resource_Id__c":"","Checked__c":"true","Dashboard__c":"true"}';
        
        lstStr.add(jsonStr);
        lstStr.add(jsonStr1);
        
        ApexPages.StandardController sc = new ApexPages.StandardController(projTemplate);
        
        
        PageReference pageRef = Page.GanttChart;
        pageRef.getParameters().put('id', String.valueOf(projTemplateList.get(0).Id));
        Test.setCurrentPage(pageRef);
        ganttcontroller gntController = new ganttcontroller(sc);
        gntController.getProjDatatest();
        
        
        PageReference pageRef1 = Page.GanttChart;
        pageRef1.getParameters().put('id', String.valueOf(projTemplateList.get(1).Id));
        Test.setCurrentPage(pageRef1);
        ganttcontroller gntController1 = new ganttcontroller(sc);
        gntController1.getProjDatatest();
        ganttcontroller.calltemplateFunc('test',String.valueOf(projTemplateList.get(1).Id));
        ganttcontroller.callToSetSelectedFieldsFunc(lstStr,String.valueOf(projTemplateList.get(1).Id),deleteIds,false);
        
        PageReference pageRef2 = Page.GanttChart;
        pageRef2.getParameters().put('id', String.valueOf(projTemplateList.get(2).Id));
        Test.setCurrentPage(pageRef2);
        ganttcontroller gntController2 = new ganttcontroller(sc);
        gntController2.getProjDatatest();
        ganttcontroller.calltemplateFunc('test',String.valueOf(projTemplateList.get(2).Id));
        
        system.assertEquals(2, lstStr.size());
        test.stopTest();
    }
}