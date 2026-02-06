public with sharing class ExecutiveDashboardDownloadCtrl {
    
    public Date todayDate{get;set;}
    public Map<String, Map<String,List<Project_Task__c>>> projectVsTasks{get;set;}
    public Map<String, Project_Template__c> idVsProjectTemplate {get;set;}
    public Map<String, ProjectTeamWrapper> projectVsTeam{get;set;}
    public List<String> projectIds{get;set;}
    public Map<String, List<String>> projectVsSection{get;set;}//for section sequencing
    
    public ExecutiveDashboardDownloadCtrl(){
        idVsProjectTemplate = new Map<String, Project_Template__c>();
        projectIds = new List<String>();
        Map<String,List<String>> statusVsIds = new Map<String,List<String>>();
        List<Project_Template__c> prjTmplt = [SELECT Id, Name, Owner.Name, Account__r.Name, LastModifiedDate, 
                                              Policy_Information__r.Name, Effective_Date__c, Template__c, 
                                              Impl_PGs__c,Number_of_Lives__c, Description__c, Overall_Project_Status__c,
                                              
                                              (SELECT Id,Description__c,Type__c,Mitigation_Plan__c,Current_Due_Date__c,Resolution_Plan__c,Name 
                                               FROM IRADs__r WHERE  (Type__c = 'Issue' or Type__c = 'Risk') AND Status__c = 'Open')
                                              FROM Project_Template__c
                                              WHERE Overall_Project_Status__c IN ('Yellow', 'Red', 'Green') AND Account__c != null
                                              ORDER BY Account__r.Name ASC
                                              LIMIT 100
                                             ];
        for(Project_Template__c objProject : prjTmplt)
        {
            objProject.Description__c = objProject.Description__c?.replace('\r\n','<br/>');
            objProject.Description__c = objProject.Description__c?.replace('○','o');
            objProject.Description__c = objProject.Description__c?.replaceAll('\t','&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
            
            idVsProjectTemplate.put(objProject.Id, objProject);
            if(!statusVsIds.keySet().Contains(objProject.Overall_Project_Status__c)){
                statusVsIds.put(objProject.Overall_Project_Status__c, new List<String>());
            }
            statusVsIds.get(objProject.Overall_Project_Status__c).add(objProject.Id);
        }
        
        if(statusVsIds.get('Red') != null){
            projectIds.addAll(statusVsIds.get('Red'));
        }
        if(statusVsIds.get('Yellow') != null){
            projectIds.addAll(statusVsIds.get('Yellow'));
        }
        if(statusVsIds.get('Green') != null){
            projectIds.addAll(statusVsIds.get('Green'));
        }
        if(statusVsIds.get('RFP') != null){
            projectIds.addAll(statusVsIds.get('RFP'));
        }
        
        projectVsTasks = new Map<String, Map<String,List<Project_Task__c>>>();
        todayDate = System.today();
        projectVsTeam = new Map<String, ProjectTeamWrapper>();
        projectVsSection = new Map<String, List<String>>();
        Map<String, Map<String, String>> subprojectVsParent = new Map<String, Map<String, String>>();
        
        Date yellowDate = Date.NewInstance(todayDate.year(),todayDate.month(),todayDate.day()).addDays(2);
        
        Integer limitRecords =  Limits.getLimitQueryRows() - Limits.getQueryRows() ;
        
        List<Project_Task__c> pTask2List = [SELECT Id, Actual_Finish__c, Project_Task_Id__c, WBS_Code__c, Project_Task_Name__c,  
                                            Start_Date__c, End_Date_Form__c, PRT_Name__c, Notes__c,
                                            Dashboard__c, Parent__c, Project_Type__c, Row_Number__c
                                            FROM Project_Task__c
                                            WHERE PRT_Name__c IN: projectIds AND PRT_Name__c != null
                                            ORDER BY PRT_Name__c,Row_Number__c ASC LIMIT : limitRecords];
        
        for(Project_Task__c objTask : pTask2List)
        {   
            if(projectVsTasks.get(objTask.PRT_Name__c) == null){
                projectVsTasks.put(objTask.PRT_Name__c, new Map<String,List<Project_Task__c>>());
            }
            if(projectVsSection.get(objTask.PRT_Name__c) == null){
                projectVsSection.put(objTask.PRT_Name__c, new List<String>());
            }
            
            if(objTask.Project_Type__c == 'project' && objTask.Parent__c != null && objTask.Parent__c !='0'){
                if(subprojectVsParent.get(objTask.PRT_Name__c) == null){
                    subprojectVsParent.put(objTask.PRT_Name__c , new Map<String, String>());
                }
                if(subprojectVsParent.get(objTask.PRT_Name__c).get(objTask.Parent__c) == null){
                    subprojectVsParent.get(objTask.PRT_Name__c).put(objTask.Project_Task_Id__c , objTask.Parent__c);
                }else{
                    subprojectVsParent.get(objTask.PRT_Name__c).put(objTask.Project_Task_Id__c , subprojectVsParent.get(objTask.PRT_Name__c).get(objTask.Parent__c));
                }
            }
            
            if(objTask.Parent__c  == '0'){
                if(objTask.End_Date_Form__c <= yellowDate && objTask.Actual_Finish__c == null){
                    if(objTask.End_Date_Form__c <= todayDate){
                        objTask.predecessors__c = 'R';
                    }else{
                        objTask.predecessors__c = 'Y';
                    }
                }else if(objTask.End_Date_Form__c > yellowDate && objTask.Actual_Finish__c == null){
                    objTask.predecessors__c = 'G';
                }else if(objTask.Actual_Finish__c != null ){
                    objTask.predecessors__c = 'B';
                }
                
                if(projectVsTasks.get(objTask.PRT_Name__c).get(objTask.Project_Task_Id__c) == null){
                    projectVsTasks.get(objTask.PRT_Name__c).put(objTask.Project_Task_Id__c , new List<Project_Task__c>{});
                }
                projectVsTasks.get(objTask.PRT_Name__c).get(objTask.Project_Task_Id__c).add(objTask);
                projectVsSection.get(objTask.PRT_Name__c).add(objTask.Project_Task_Id__c);
            }else{
                if(objTask.End_Date_Form__c <= yellowDate && objTask.Actual_Finish__c == null){
                    List<String> childCheck = objTask.WBS_Code__c.split('\\.');
                    if((objTask.Project_Type__c == 'Task' || objTask.Project_Type__c == 'project' ) && objTask.Dashboard__c == true && objTask.Parent__c != null && objTask.Parent__c != '0'){
                        
                        String parentId = '';
                        if(childCheck.size() >2 ){
                            if(subprojectVsParent.get(objTask.PRT_Name__c) == null){
                                continue;
                            }
                            parentId = subprojectVsParent.get(objTask.PRT_Name__c).get(objTask.Parent__c);
                        }else{
                            parentId = objTask.Parent__c;
                        }
                        if(objTask.End_Date_Form__c <= todayDate){
                            objTask.predecessors__c = 'R';
                        }else{
                            objTask.predecessors__c = 'Y';
                        }
                        
                        if(projectVsTasks.get(objTask.PRT_Name__c).get(parentId) != null){
                            projectVsTasks.get(objTask.PRT_Name__c).get(parentId).add(objTask);
                        }
                        
                    }
                }
            }
        }
        
        for(String projectId : projectVsTasks.keySet()){
            for(String section : projectVsTasks.get(projectId).keySet()){
                Project_Task__c sectionTask = projectVsTasks.get(projectId).get(section)[0];
                if(projectVsTasks.get(projectId).get(section).size() < 2 && 
                   (sectionTask.predecessors__c == 'G' || sectionTask.predecessors__c == 'B' || !sectionTask.Dashboard__c))
                {
                    projectVsTasks.get(projectId).remove(section);
                    projectVsSection.get(projectId).remove(projectVsSection.get(projectId).IndexOf(section));
                }
            }
        }
        
        List<IPM_Team__c> ipmTeamList = [SELECT Id, First_Name__c, Last_Name__c, IPM_Roles__c, Project_Template__c
                                         FROM IPM_Team__c
                                         WHERE Project_Template__c IN: projectIds];
        for(IPM_Team__c objTeam : ipmTeamList)
        {
            if(projectVsTeam.get(objTeam.Project_Template__c) == null){
                ProjectTeamWrapper objTeamWrapper = new ProjectTeamWrapper();
                objTeamWrapper.optumSAE = '';
                objTeamWrapper.clientManager = '';
                objTeamWrapper.implementationProjectManager = '';
                objTeamWrapper.optumIPM = '';
                objTeamWrapper.itCrm = ''; 
                objTeamWrapper.sce = '';
                objTeamWrapper.solEngineer = '';
                objTeamWrapper.cmc = '';
                projectVsTeam.put(objTeam.Project_Template__c , objTeamWrapper);
            }
            ProjectTeamWrapper objTeamWrapper = projectVsTeam.get(objTeam.Project_Template__c);
            String name = (objTeam.First_Name__c!=null ? objTeam.First_Name__c:'')
                +' '+ (objTeam.Last_Name__c != null ?objTeam.Last_Name__c:'');
            
            if(objTeam.IPM_Roles__c == 'Optum Client Executive/Manager' 
               || objTeam.IPM_Roles__c == 'Optum Strategic Account Executive' 
               || objTeam.IPM_Roles__c == 'Optum Clinical Account Executive'
               || objTeam.IPM_Roles__c == 'Optum SAE'){
                   
                objTeamWrapper.optumSAE = objTeamWrapper.optumSAE == '' ? name : (objTeamWrapper.optumSAE+','+name) ;
            }
            if(objTeam.IPM_Roles__c == 'Strategic Client Executive'){
                objTeamWrapper.sce = objTeamWrapper.sce == '' ? name : (objTeamWrapper.sce+','+name) ;
            }else if(objTeam.IPM_Roles__c == 'Client Manager' || objTeam.IPM_Roles__c == 'Senior Client Manager' ){
                objTeamWrapper.clientManager = objTeamWrapper.clientManager == '' ? name: objTeamWrapper.clientManager+ ','+name;
            }else if(objTeam.IPM_Roles__c == 'Implementation Project Manager'){
                objTeamWrapper.implementationProjectManager = objTeamWrapper.implementationProjectManager==''?name : objTeamWrapper.implementationProjectManager+','+name;
            }else if(objTeam.IPM_Roles__c == 'Optum Implementation Project Manager' 
                     || objTeam.IPM_Roles__c == 'Optum Service Delivery Lead'
                     || objTeam.IPM_Roles__c == 'Optum Director, Service Delivery Lead'
                     || objTeam.IPM_Roles__c == 'Optum Health - Service Delivery Lead'
                    )
            {
                objTeamWrapper.optumIPM = objTeamWrapper.optumIPM==''? name: objTeamWrapper.optumIPM+','+name;
            }else if(objTeam.IPM_Roles__c == 'IT Client Relationship Manager'){
                objTeamWrapper.itCrm = objTeamWrapper.itCrm == '' ? name: objTeamWrapper.itCrm+','+name;
            }else if(objTeam.IPM_Roles__c == 'Solutions Engineer'){
                objTeamWrapper.solEngineer = objTeamWrapper.solEngineer == ''? name: objTeamWrapper.solEngineer+','+name;
            }else if(objTeam.IPM_Roles__c == 'Client Management Consultant'){
                objTeamWrapper.cmc =  objTeamWrapper.cmc == ''? name:  objTeamWrapper.cmc+','+name;
            }
            
        }
        //for sequence as per account name
        for(Integer i=projectIds.size()-1; i>=0; i--){
            if(!projectVsTasks.keySet().contains(projectIds[i])){
                projectIds.remove(i);
            }
        }
       
                      
    }
    
    public class ProjectTeamWrapper{
        public String optumSAE{get;set;}
        public String optumIPM{get;set;}
        public String clientManager{get;set;}
        public String implementationProjectManager{get;set;}
        public String sce{get;set;}
        public String solEngineer{get;set;}
        public String itCrm{get;set;}
        public String scope{get;set;}
        public String cmc{get;set;}
        
    }
}