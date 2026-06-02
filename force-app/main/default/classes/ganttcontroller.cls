global without sharing class ganttcontroller{
    
    public static String csvVals{get; set;}
    public static String RHSValuesForFields { get; set; }
    public static String predvalue {get; set;}
    public static String statusvalue {get; set;}
    public static String typevalue {get; set;}
    public static String linkValues {get; set;}
    public static String deletetaskvalues{get; set;}
    public static String linkidsValues {get; set;}
    public static String templname{get; set;}
    public static String jsonStringValue {get; set;}
    public static String resValues{get; set;}
    public static Boolean ifcondition{get; set;}
    public static Integer listLimit1;
    
    public static List<Project_Task__c> ProjtaskData{get; set;}
    public static List<Project_Task__c> ProjtaskData1{get; set;}
    public static List<Project_Task__c> ProjtaskData2{get; set;}
    public static List<Project_Task__c> ProjtaskData1_2{get; set;}
    public static List<IPM_Team__c> IPMupdateList {get; set;}
    public static List<IPM_Team__c> IPMRoleIdList {get; set;}
    public static List<Holiday> holidayData {get; set;}
    public static List<user> UsData {get; set;}
    public static List<IPM_Team__c> resData {get; set;}
    public static Project_Template__c ProjectTemplateobj{get; set;}
    public static errorWrapper[] thousandBlocksSave = new errorWrapper[]{};
    
    public String currentRecordId {get; set;}
    public String currentRecordIdtemp{get; set;}
    public String CreatedByIDUser {get; set;}
    public String CurrentUserID {get; set;}
    public String CurrentUserProfileID{get; set;}
    public String ProjectTemplate {get; set;}
    public String projecttemplateFlag{get; set;}
    public String success{get; set;}
    public Boolean ButtonAccessFlag{get; set;}
    
    public limitWrapper[] thousandBlocks{get;set;}
    private final Integer listLimit;
    
    public ganttcontroller(ApexPages.StandardController controller){
        
        currentRecordId  = ApexPages.CurrentPage().getparameters().get('id');
        listLimit = 1000;
        listLimit1 = 1000;
        currentRecordIdtemp = ApexPages.CurrentPage().getparameters().get('id');
        ProjectTemplateobj =[SELECT Id, Project_Template__c, Template__c, CreatedById,OwnerID 
                             FROM Project_Template__c 
                             WHERE Id =: currentRecordId];
        
        ProjectTemplate = ProjectTemplateobj.Project_Template__c;
        
        if(ProjectTemplateobj.Template__c == true){
            projecttemplateFlag = 'true';
        }else{
            projecttemplateFlag = 'false';
        }
        
        CurrentUserID = UserInfo.getUserId();
        CurrentUserProfileID = UserInfo.getProfileId();
        
        Profile profileDetails = [SELECT Name 
                                  FROM Profile 
                                  WHERE Id =: CurrentUserProfileID];
        
        List<Project_Template__share> lstProjShare =[SELECT Id FROM Project_Template__Share 
                                                     WHERE ParentId =:ProjectTemplateobj.Id 
                                                     AND UserOrGroupId =:CurrentUserID AND AccessLevel = 'EDIT' ];
        String ProfileName = profileDetails.Name;
        
        if(lstProjShare.Size() >0){
            ButtonAccessFlag = true;
        }else if(ProfileName == 'IPM Standard Profile'){
            
            if(ProjectTemplateobj.OwnerID == CurrentUserID){
                ButtonAccessFlag = true;
            }else{
                ButtonAccessFlag = false;
            }
        }else if(ProfileName == 'IPM Advanced Profile' || ProfileName == 'System Administrator'){
            ButtonAccessFlag = true;
        }
        
        
        this.getholiData();
        this.getresData();
        this.getuserData();
        
    }
    
    // code for save task in  template
    @RemoteAction
    public static List<IPM_Team__c> calltemplateFunc(string templname,string currentRecordIdtemp){
        
        String temp=templname.remove('"');
        
        List<Project_Task__c> ProdtaskList = new List<Project_Task__c>();
        List<IPM_Team__c> TeamList = new List<IPM_Team__c>();
        for(Project_Template__c ProjData : [SELECT Id, Name, Account__c, Project_Template__c, Effective_Date__c, Start_Date__c, Template__c,
                                                (SELECT Id, Duration__c, linkId__c, Source_Link_Id__c, lag__c, Row_Number__c, Project_Type__c,
                                                 Target_Link_Id__c, Project_Task_Name__c, Project_Task_Id__c, Target__c, Source__c, Parent__c,
                                                 type__c, ParentId__c, WBS_Code__c, Start_Date__c, End_Date__c, Predecessors__c,
                                                 Status__c, PRT_Name__c, Resource_Id__c, Owner__c, Checked__c, Progress__c, Mark_as_Milestone__c,
                                                 Additional_Comments__c
                                                 FROM Project_Tasks__r LIMIT 1) 
                                            FROM Project_Template__c 
                                            WHERE Id =:currentRecordIdtemp])
        {
            
            
            if(ProjData.Project_Tasks__r.size() != 0){
                
                List<IPM_Team__c> ipmteam = [SELECT Id,Name,Last_Name__c,First_Name__c,IPM_Roles__c,Project_Template__c 
                                             FROM IPM_Team__c 
                                             WHERE Project_Template__c =: currentRecordIdtemp AND IPM_Roles__c !=''];   // to get all the records from project ipm team removing empty roles
                
                
                Project_Template__c proTemplate = new Project_Template__c();
                proTemplate.Effective_Date__c = ProjData.Effective_Date__c;
                proTemplate.Name = temp;                                    // make as dynamic from popup
                proTemplate.Start_Date__c = ProjData.Start_Date__c;
                proTemplate.Template__c = true;
                insert proTemplate;                                         //inserting template
                
                
                Map<String,String> ipmteamMap = new Map<String,String>();   //map to key=>role, value=>id
                Set<String> setrol = new Set<String>();                     //Set to remove duplicate role
                for(IPM_Team__c teamipm :ipmteam){
                    setrol.add(teamipm.IPM_Roles__c);
                }
                
                for(String UniqueRole:setrol){
                    
                    IPM_Team__c IPM = new IPM_Team__c();  
                    IPM.Project_Template__c = proTemplate.id;
                    IPM.IPM_Roles__c = UniqueRole;
                    TeamList.add(IPM);
                }
                insert TeamList; 
                
            }else{
                TeamList  =  null;
            }
            
        }
        
        return TeamList;
    }
    
    public pageReference getProjDatatest(){
        generateThousandBlocks();
        return null;
    }

    
    public void generateThousandBlocks(){
        
        thousandBlocks = new limitWrapper[]{};
        Integer counter = 0;
        Integer loopCount = 0;
        Project_Task__c[] tmpcase = new Project_Task__c[]{};
        String s = '\\';
        String p = '\\'+s;
        List<IPM_Team__c> IPMupdateList1 = [SELECT Id,Name,IPM_Roles__c,Last_Name__c,First_Name__c 
                                            FROM IPM_Team__c 
                                            WHERE Project_Template__c =: currentRecordId];
        
        List<Project_Task__c> testData1 = [SELECT Id, Duration__c, Dashboard__c, Notes__c, Actual_Finish__c, PRT_Name__r.Project_Template__c, linkId__c,
                                           Progress__c,Source_Link_Id__c,lag__c,Row_Number__c,Project_Type__c,Target_Link_Id__c,Project_Task_Name__c,
                                           Project_Task_Id__c,target__c,source__c,Parent__c,type__c,ParentId__c,WBS_Code__c,Start_Date__c,End_Date__c,
                                           predecessors__c,Status__c,PRT_Name__c,Resource_Id__c,Owner__c,Checked__c,Mark_as_Milestone__c,
                                           Additional_Comments__c
                                           FROM Project_Task__c 
                                           WHERE PRT_Name__c =: currentRecordId 
                                           ORDER BY Row_Number__c ASC 
                                           LIMIT 3];
        
        
        if(ProjectTemplate !=null && testData1.size() < 1){
            
            ifcondition = true;
            
            List<IPM_Team__c> IPMList = IPMupdateList1.clone();
            List<IPM_Team__c> IPMNew = new List<IPM_Team__c>();
            
            Set<String> roles=new set<String>();
            for(IPM_Team__c protask : IPMList){
                if(protask.IPM_Roles__c != null && protask.IPM_Roles__c != ''){
                    roles.add(protask.IPM_Roles__c);
                }
            }
            
            List<String> RoleId = new List<String>();
            String roleIdStr = '';
            String bindvalue;
            String bindroles;
            
            for(Project_Task__c projtask : [SELECT Id, Duration__c, Dashboard__c, Notes__c, Actual_Finish__c, PRT_Name__r.Project_Template__c, linkId__c,Progress__c,
                                            Source_Link_Id__c, lag__c, Row_Number__c, Project_Type__c, Target_Link_Id__c, Project_Task_Name__c, Project_Task_Id__c,
                                            target__c, source__c, Parent__c, type__c, ParentId__c, WBS_Code__c, Start_Date__c, End_Date__c, predecessors__c,
                                            Status__c, PRT_Name__c, Resource_Id__c, Owner__c, Checked__c, Mark_as_Milestone__c, Additional_Comments__c 
                                            FROM Project_Task__c 
                                            WHERE PRT_Name__c =: ProjectTemplate 
                                            ORDER BY Row_Number__c ASC])
            {
                if(projtask.Resource_Id__c != null && projtask.Resource_Id__c != ''){
                    if(roleIdStr == ''){
                        roleIdStr = projtask.Resource_Id__c;
                    }else{
                        roleIdStr = roleIdStr+','+projtask.Resource_Id__c;
                    }
                }
            }
            
            RoleId = roleIdStr.split(',');
            
            Map<Id,String> IPMMap = new Map<Id,String>();
            IPMRoleIdList = [SELECT Id,Name,IPM_Roles__c,Last_Name__c,First_Name__c 
                             FROM IPM_Team__c 
                             WHERE Project_Template__c =: ProjectTemplate AND Id IN : RoleId];
            
            for(IPM_Team__c MAkMap : IPMRoleIdList){
                IPMMap.put(MAkMap.id,MAkMap.IPM_Roles__c);
                if(!roles.contains(MAkMap.IPM_Roles__c)){
                    if(MAkMap.IPM_Roles__c == 'Client Manager' || MAkMap.IPM_Roles__c == 'Senior Client Manager'){
                        if(roles.contains('Client Manager') || roles.contains('Senior Client Manager')){
                            
                        }else{
                            IPM_Team__c IPLcreate = new IPM_Team__c();
                            IPLcreate.IPM_Roles__c = MAkMap.IPM_Roles__c;
                            IPLcreate.Project_Template__c = currentRecordId;
                            IPMNew.add(IPLcreate);
                            roles.add(MAkMap.IPM_Roles__c);
                            
                        }
                        
                    }else{
                        IPM_Team__c IPLcreate = new IPM_Team__c();
                        IPLcreate.IPM_Roles__c = MAkMap.IPM_Roles__c;
                        IPLcreate.Project_Template__c = currentRecordId;
                        IPMNew.add(IPLcreate);
                        roles.add(MAkMap.IPM_Roles__c);
                    }
                    
                }
            }
            
            insert IPMNew;
            
            IPMupdateList = [SELECT Id, Name, IPM_Roles__c, Last_Name__c, First_Name__c 
                             FROM IPM_Team__c 
                             WHERE Project_Template__c =: currentRecordId];
            
            Integer count = 0;
            for(Project_Task__c c: [SELECT Id,Duration__c,Dashboard__c,Notes__c,Actual_Finish__c,PRT_Name__r.Project_Template__c,linkId__c,
                                   Progress__c,Source_Link_Id__c,lag__c,Row_Number__c,Project_Type__c,Target_Link_Id__c,Project_Task_Name__c,
                                   Project_Task_Id__c,target__c,source__c,Parent__c,type__c,ParentId__c,WBS_Code__c,Start_Date__c,
                                   End_Date__c,predecessors__c,Status__c,PRT_Name__c,Resource_Id__c,Owner__c,Checked__c, 
                                   Mark_as_Milestone__c, Additional_Comments__c
                                   FROM Project_Task__c 
                                   WHERE PRT_Name__c =: ProjectTemplate 
                                   ORDER BY Row_Number__c ASC ])
            {
                count++;
                
                
                if(c.Project_Task_Name__c != null && c.Project_Task_Name__c.contains('"')){
                    c.Project_Task_Name__c = c.Project_Task_Name__c.replace('"','\\"');
                    
                }else if(c.Project_Task_Name__c != null && c.Project_Task_Name__c.contains(s)){
                    c.Project_Task_Name__c = c.Project_Task_Name__c.replace(s,p);
                }
                
                if(c.Notes__c != null && c.Notes__c.contains('"')){
                    c.Notes__c = c.Notes__c.replace('"','\\"');
                    
                }else if(c.Notes__c != null && c.Notes__c.contains(s)){
                    c.Notes__c = c.Notes__c.replace(s,p);
                }else if(c.Notes__c != null && c.Notes__c.contains('\n')){
                    c.Notes__c = c.Notes__c.replace('\n',' ');
                }
                 if(c.Additional_Comments__c != null && c.Additional_Comments__c.contains('"')){
                    c.Additional_Comments__c = c.Additional_Comments__c.replace('"','\\"');
                    
                }else if(c.Additional_Comments__c != null && c.Additional_Comments__c.contains(s)){
                    c.Additional_Comments__c = c.Additional_Comments__c.replace(s,p);
                }else if(c.Additional_Comments__c != null && c.Additional_Comments__c.contains('\n')){
                    c.Additional_Comments__c = c.Additional_Comments__c.replace('\n',' ');
                }
               
               
                if(counter < listLimit){
                    tmpcase.add(c);
                    counter++;
                    
                }else{
                    loopCount++;
                    
                    thousandBlocks.add(new limitWrapper(tmpcase,loopCount));
                    tmpcase = new Project_Task__c[]{};
                        tmpcase.add(c);
                    counter = 0;
                }            
            }
            
            if(thousandBlocks.size() == 0)
            {
                loopCount++;
                thousandBlocks.add(new limitWrapper(tmpcase,loopCount));
            }else{
                thousandBlocks.add(new limitWrapper(tmpcase,loopCount));
            }
            
        }else{
            
            IPMupdateList = IPMupdateList1;
            for(Project_Task__c c:[SELECT Id,Duration__c,Dashboard__c,Notes__c,Actual_Finish__c,PRT_Name__r.Project_Template__c,
                                   linkId__c,Progress__c,Source_Link_Id__c,lag__c,Row_Number__c,Project_Type__c,Target_Link_Id__c,
                                   Project_Task_Name__c,Project_Task_Id__c,target__c,source__c,Parent__c,type__c,ParentId__c,
                                   WBS_Code__c,Start_Date__c,End_Date__c,predecessors__c,Status__c,PRT_Name__c,
                                   Resource_Id__c,Owner__c,Checked__c ,Mark_as_Milestone__c, Additional_Comments__c 
                                   FROM Project_Task__c 
                                   WHERE PRT_Name__c =: currentRecordId 
                                   ORDER BY Row_Number__c ASC ])
            {
                if(c.Project_Task_Name__c.contains('"')){
                    c.Project_Task_Name__c = c.Project_Task_Name__c.replace('"','\\"');
                }else if(c.Project_Task_Name__c.contains(s)){
                    c.Project_Task_Name__c = c.Project_Task_Name__c.replace(s,p);
                }
                
                if(c.Notes__c != null && c.Notes__c.contains('"')){
                    c.Notes__c = c.Notes__c.replace('"','\\"');
                    
                }else if(c.Notes__c != null && c.Notes__c.contains(s)){
                    c.Notes__c = c.Notes__c.replace(s,p);
                }else if(c.Notes__c != null && c.Notes__c.contains('\n')){
                    c.Notes__c = c.Notes__c.replace('\n',' ');
                }
                
                  if(c.Additional_Comments__c != null && c.Additional_Comments__c.contains('"')){
                    c.Additional_Comments__c = c.Additional_Comments__c.replace('"','\\"');
                    
                }else if(c.Additional_Comments__c != null && c.Additional_Comments__c.contains(s)){
                    c.Additional_Comments__c = c.Additional_Comments__c.replace(s,p);
                }else if(c.Additional_Comments__c != null && c.Additional_Comments__c.contains('\n')){
                    c.Additional_Comments__c = c.Additional_Comments__c.replace('\n',' ');
                }
               
                if(counter < listLimit){
                    tmpcase.add(c);
                    counter++;
                }else{
                    loopCount++;
                    thousandBlocks.add(new limitWrapper(tmpcase,loopCount));
                    tmpcase = new Project_Task__c[]{};
                    tmpcase.add(c);
                    counter = 0;
                }            
            }
            
            if(thousandBlocks.size() == 0)
            {
                loopCount++;
                thousandBlocks.add(new limitWrapper(tmpcase,loopCount));
            }else{
                thousandBlocks.add(new limitWrapper(tmpcase,loopCount));
            }
            
        }
        
    }
    
    public class limitWrapper{
        public Project_Task__c [] cases {get;set;}
        public integer blockNumber {get;set;}
        public limitWrapper(Project_Task__c[] accs, integer i)
        {
            cases = accs;
            blockNumber = i;
        }
        
    }
    
    public List<user> getuserData(){
        UsData = [SELECT Id, Name 
                  FROM User where isActive = true
                  LIMIT 100000];
        
        return UsData;
    }
    
    public List<IPM_Team__c> getresData(){
        
        resdata = [SELECT Id, Name, Last_Name__c, First_Name__c, IPM_Roles__c, Project_Template__c  
                   FROM IPM_Team__c 
                   WHERE Project_Template__c=: currentRecordId];
        
        return resdata;
    }
    
    public List<Holiday> getholiData()
    {
        holidayData = [SELECT Id, ActivityDate 
                       FROM Holiday LIMIT 1000];
        
        return holidayData;
    }
    
    @RemoteAction 
    public static errorWrapper[] callToSetSelectedFieldsFunc(List<String> projectTaskVal, String currenrecordid, List<String> deletetaskvalue, Boolean isSaveAsTemplate) {
        errorWrapper[] errwrap = new errorWrapper[]{};
        thousandBlocksSave = new errorWrapper[]{};
        Integer counter = 0;
        Integer loopCount = 0;
        Project_Task__c[] tmpcase = new Project_Task__c[]{};
            
        try{  
            
            List<Project_Task__c> sobjectList = new List<Project_Task__c>();
            List<Project_Task__c> insertsobjectList = new List<Project_Task__c>();
            List<Project_Task__c> taskdelete = new List<Project_Task__c>();
            List<Project_Task__c> insertProjTempLst = new List<Project_Task__c>();
            Project_Template__c projectUpdate = new Project_Template__c();
            
            if(!isSaveAsTemplate){
                taskdelete = [SELECT Id 
                              FROM Project_Task__c 
                              WHERE Id IN: deletetaskvalue];
                
                projectUpdate = [SELECT Id, IRAD_Last_Modified_Date__c, Project_Template__c 
                                 FROM Project_Template__c 
                                 WHERE Id =: currenrecordid];
                
            }
            
            for(String myObj:projectTaskVal){
                
                Object projVal = myObj;
                List<String> dateStr = new List<String>(); 
                List<String> enddateStr = new List<String>(); 
                List<String> ActualFinishdateStr = new List<String>(); 
                Map<String, Object> customerAttributes = (Map<String, Object>)JSON.deserializeUntyped(myObj);
                Project_Task__c projObj = new Project_Task__c();
                
                
                // projObj.Actual_Finish__c = date.valueOf(customerAttributes.get('Actual_Finish__c'));
                projObj.Checked__c = Boolean.valueOf(customerAttributes.get('Checked__c'));
                projObj.Dashboard__c = Boolean.valueOf(customerAttributes.get('Dashboard__c'));
                projObj.Duration__c = (decimal)customerAttributes.get('Duration__c');
                projObj.Project_Task_Id__c = String.valueOf(customerAttributes.get('Project_Task_Id__c'));
                projObj.lag__c = String.valueOf(customerAttributes.get('lag__c'));
                projObj.linkId__c = String.valueOf(customerAttributes.get('linkId__c'));
                projObj.Notes__c = String.valueOf(customerAttributes.get('Notes__c'));
                projObj.Resource_Id__c = String.valueOf(customerAttributes.get('Resource_Id__c'));
                projObj.source__c = String.valueOf(customerAttributes.get('source__c'));
                //projObj.priority__c = string.valueOf(customerAttributes.get('priority__c'));
                projObj.target__c = String.valueOf(customerAttributes.get('target__c'));
                projObj.type__c = String.valueOf(customerAttributes.get('type__c'));
                projObj.Project_Type__c = String.valueOf(customerAttributes.get('Project_Type__c'));
                projObj.WBS_Code__c = String.valueOf(customerAttributes.get('WBS_Code__c'));
                projObj.Mark_as_Milestone__c = Boolean.valueOf(customerAttributes.get('Mark_as_Milestone__c'));
                projObj.Project_Task_Name__c = String.valueOf(customerAttributes.get('Project_Task_Name__c'));
                projObj.Parent__c = String.valueOf(customerAttributes.get('Parent__c'));
                projObj.predecessors__c = String.valueOf(customerAttributes.get('predecessors__c'));
                projObj.Progress__c = (Decimal)customerAttributes.get('Progress__c');
                projObj.Row_Number__c = Integer.valueof(customerAttributes.get('Row_Number__c'));
                projObj.Additional_Comments__c = String.valueOf(customerAttributes.get('Additional_Comments__c'));
                
                String date1 = String.valueOf(customerAttributes.get('Start_Date__c'));
                dateStr = date1.split('T');
                date1 = dateStr[0]+'T00:00:00.000Z';
                Date SdT = date.ValueOf(date1);
                projObj.Start_Date__c = SdT;
                
                String EDdate = String.valueOf(customerAttributes.get('End_Date__c'));
                enddateStr = EDdate.split('T');
                EDdate = enddateStr[0]+'T00:00:00.000Z';
                Date dT = date.ValueOf(EDdate);
                projObj.End_Date__c = dT;
                
                String ActualFinishdate = String.valueOf(customerAttributes.get('Actual_Finish__c'));
                
                if(ActualFinishdate != null && ActualFinishdate!= ''){
                    ActualFinishdateStr = ActualFinishdate.split('T');
                    ActualFinishdate = ActualFinishdateStr[0]+'T00:00:00.000Z';
                   	Date AdT = date.ValueOf(ActualFinishdate);
                    projObj.Actual_Finish__c = AdT;
                }else{
                    projObj.Actual_Finish__c = null;
                }
                
                if(isSaveAsTemplate){
                    projObj.PRT_Name__c=(id)customerAttributes.get('sfdcid');
                    insertProjTempLst.add(projObj);
                    
                }else{
                    if(customerAttributes.containsKey('sfdcid')){
                        //edit
                        projObj.id=(id)customerAttributes.get('sfdcid');
                        sobjectList.add(projObj);
                    }else{
                        system.debug('first else$$$>>>>>>>>>>');
                        projObj.PRT_Name__c =currenrecordid;
                        system.debug('currenrecordid>>>>'+currenrecordid);
                        insertsobjectList.add(projObj);
                    }
                }
            }
            
            projectUpdate.IRAD_Last_Modified_Date__c = Date.today();
            if(isSaveAsTemplate){
                insert insertProjTempLst;
                thousandBlocksSave.add(new errorWrapper(null,0,true,'Success'));
            }else{
                update sobjectList;
                insert insertsobjectList;
                update projectUpdate;
                delete  taskdelete; 
                for(Project_Task__c c : [SELECT Id, Duration__c, Dashboard__c, Notes__c, Actual_Finish__c, PRT_Name__r.Project_Template__c,
                                         linkId__c,Progress__c,Source_Link_Id__c,lag__c,Row_Number__c,Project_Type__c,Target_Link_Id__c,
                                         Project_Task_Name__c,Project_Task_Id__c,target__c,source__c,Parent__c,type__c,ParentId__c,
                                         WBS_Code__c,Start_Date__c,End_Date__c,predecessors__c,Status__c,PRT_Name__c,
                                         Resource_Id__c,Owner__c,Checked__c ,Mark_as_Milestone__c,Additional_Comments__c 
                                         FROM Project_Task__c 
                                         WHERE  PRT_Name__c =: currenrecordid 
                                         ORDER BY Row_Number__c ASC ])
                {
                    if(counter < listLimit1){
                        tmpcase.add(c);
                        counter++;
                    }else{
                        loopCount++;
                        thousandBlocksSave.add(new errorWrapper(tmpcase,loopCount,true,'Success'));
                        tmpcase = new Project_Task__c[]{};
                        tmpcase.add(c);
                        counter = 0;
                    }
                }
                if(thousandBlocksSave.size() == 0){
                    loopCount++;
                    thousandBlocksSave.add(new errorWrapper(tmpcase,loopCount,true,'Success'));
                }else{
                    thousandBlocksSave.add(new errorWrapper(tmpcase,loopCount,true,'Success'));
                }
            } 
        }catch(Exception ex){
            thousandBlocksSave.add(new errorWrapper(null, 0, false, ex.getMessage()));
            System.debug('Excetion Message'+ex.getMessage());
        }
        return thousandBlocksSave;
    }
    
    public class errorWrapper{
        public boolean isSuccess {get;set;}
        public String ErrorMsg {get;set;}
        public Project_Task__c [] cases {get;set;}
        public integer blockNumber {get;set;}
        public errorWrapper(Project_Task__c[] accs, Integer i, Boolean success,String ErMsg)
        {
            cases = accs;
            blockNumber = i;
            isSuccess = success;
            ErrorMsg = ErMsg;
        }
    }
    
    
}