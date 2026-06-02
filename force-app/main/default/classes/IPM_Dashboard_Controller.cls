/**
* @description       : 
* @author            : Spoorthy
* @group             : 
* @last modified on  : 09-05-2024
* @last modified by  : Spoorthy
**/
public class IPM_Dashboard_Controller {
    
    @AuraEnabled
    public static NPSWrapper getTemplateInXML(String ipmId,List<String> NPSId,Boolean isExternal){                       
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString = 'Select ';
        String objectName  = '';     
        Id userId = UserInfo.getUserId();
        String dashboradFile ='IPMDashboard';
        
        List<Project_Task__c> accData;
        
        accData = [SELECT Id, Actual_Finish__c, WBS_Code__c,Project_Task_Name__c,Notes__c,Start_Date__c,
                   End_Date_Form__c,Duration__c,Owner__c,Resource_Id__c,priority__c,predecessors__c,
                   lag__c,Progress__c,Checked__c,Dashboard__c
                   FROM Project_Task__c 
                   WHERE PRT_Name__c =: ipmId 
                   ORDER BY Row_Number__c ASC];
        
         Project_Template__c prjctTmplt = [SELECT Id,Name, Owner.Name,Account__r.Name, LastModifiedDate, Policy_Information__r.Name,Project_Type__c,
                                          Effective_Date__c, Template__c, Impl_PGs__c, Number_of_Lives__c, Description__c 
                                          FROM Project_Template__c 
                                          WHERE Id=:ipmId];
        
        
        if(prjctTmplt.Project_Type__c=='Surest'){
            dashboradFile='IPM_Dashboard_Surest';
        }
        if(prjctTmplt.Project_Type__c=='UHC/Surest'){
            dashboradFile='IPM_Dashboard_Dual';
        }
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name =:dashboradFile];
        String xmlBodyString = sr.body.toString();
        
        Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        System.debug('matcher '+m);
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();    
            
            system.debug('before replace prefix : '+itag);
            itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            //System.debug('itag '+itag);
            System.debug('itag value '+itag);
            Integer dotFirstIndex = itag.indexOf('.');
            objectName = itag.substring(0,dotFirstIndex);
            String fieldName = itag.substring(dotFirstIndex+1);
            
            // System.debug('iTagFormatField '+iTagFormatField);
            
            if(objectItagesMap.containsKey(objectName)){
                Set<String> itagSet =  objectItagesMap.get(objectName);                    
                itagSet.add(fieldName);
                objectItagesMap.put(objectName, itagSet);
                
            }else{
                Set<String> itagSet = new Set<String>();
                itagSet.add(fieldName);      
                System.debug('objectName  -> '+objectName);                     
                objectItagesMap.put(objectName, itagSet);
            }                         
            
        }  
        String buildApiKey = '';      
       
        
        List <IRAD__c> iradData;
        
        if(isExternal== true){
            iradData=[SELECT Id, Name, Description__c, Type__c, Mitigation_Plan__c,
                      Current_Due_Date__c, Resolution_Plan__c, Notes_Comments__c,Applicable_To__c 
                      FROM IRAD__c 
                      WHERE Project__c=:ipmId AND Internal_External__c='External' 
                      AND (Type__c = 'Issue' or Type__c = 'Risk') AND Status__c = 'Open'];
        }else{
            iradData=[SELECT Id, Name, Description__c, Type__c, Mitigation_Plan__c,
                      Current_Due_Date__c, Resolution_Plan__c, Notes_Comments__c,Applicable_To__c 
                      FROM IRAD__c 
                      WHERE Project__c=:ipmId AND (Type__c = 'Issue' or Type__c = 'Risk') AND Status__c = 'Open'];
        }
        
        
        List <IPM_Team__c> ipmTeamData=[SELECT Id, First_Name__c, Last_Name__c, IPM_Roles__c 
                                        FROM IPM_Team__c 
                                        WHERE Project_Template__c =: ipmId];
        
        List<Holiday> holidayData = [SELECT Id, ActivityDate FROM Holiday ORDER BY ActivityDate ASC];
        System.debug('objectItagesMap===>'+objectItagesMap);
        
        npsWrap.xmlString = xmlBodyString;
        npsWrap.IPMFinalData = accData;
        npsWrap.objectItags = objectItagesMap;
        npsWrap.iradData = iradData;
        npsWrap.ipmTeamData = ipmTeamData;
        npsWrap.ipmData=prjctTmplt;
        npsWrap.holidayData = holidayData;
        return npsWrap;
    }
    
    @AuraEnabled
    public static NPSWrapper  getIPMData(ID ipmId){
        
        
        Project_Template__c ipmPlanData= Database.query('SELECT Id, Account__c, Template__c, Project_Type__c FROM Project_Template__c' 
                                                        +' where Id=: ipmId');
        
        List<Project_Task__c> accData = [Select Id,WBS_Code__c,Project_Task_Name__c,Start_Date__c,End_Date_Form__c,Duration__c,Owner__c,Resource_Id__c,priority__c,predecessors__c,lag__c,Progress__c,Checked__c,Dashboard__c from Project_Task__c where PRT_Name__c =: ipmId order by Row_Number__c ASC];
        
        NPSWrapper npsWrap = new  NPSWrapper();
        npsWrap.IPMFinalData = accData;
        npsWrap.ipmData=ipmPlanData;
        return npsWrap;
    }    
    
    
    /*@AuraEnabled
public static Project_Task__c getProjectByWBS(String wbsCode,String ipmId){

Project_Task__c proTask = [Select Id,WBS_Code__c,Project_Task_Name__c,Start_Date__c,End_Date_Form__c,Duration__c,Owner__c,Resource_Id__c,priority__c,predecessors__c,lag__c,Progress__c from Project_Task__c where PRT_Name__c =: ipmId and WBS_Code__c =: wbsCode] ;
return proTask;
}*/     
    
    
    public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public List<Project_Task__c> IPMFinalData { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }
        /*@AuraEnabled
public String UserRole { get; set; }*/
        
        @AuraEnabled
        public Map<String,FieldSetResult> FieldSetMap { get; set; }
        @AuraEnabled
        public Project_Template__c ipmData { get; set; }
        
        @AuraEnabled
        public List<IRAD__c> iradData { get; set; }
        
        @AuraEnabled
        public List<IPM_Team__c> ipmTeamData { get; set; } 
        
        @AuraEnabled
        public List<Holiday> holidayData { get; set; } 
        
        
    }
    public class FieldSetResult{
        
        @AuraEnabled
        public String label{ get;set; }
        
        @AuraEnabled
        public boolean required { get;set; }
        
        @AuraEnabled
        public String type { get;set; }
        
        @AuraEnabled
        public String name { get;set; }
        
        
        
    }
    
}