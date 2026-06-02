public with sharing class IPM_Export_Controller 
{
    
    @AuraEnabled
    public static FiledWrapper  getAllFieldName(String objectName,ID ipmId) 
    {
        
        FiledWrapper filedWrapper=new FiledWrapper();
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Schema.SObjectType leadSchema = schemaMap.get(objectName);
        Map<String, Schema.SObjectField> fieldMap = leadSchema.getDescribe().fields.getMap();
        Map<String,String> fieldLabelMap = new Map<String,String>();  
        for(Schema.SObjectField sfield : fieldMap.Values()){
            schema.describefieldresult dfield = sfield.getDescribe();
            fieldLabelMap.put(dfield.getLabel(),dfield.getname());
        }
        filedWrapper.fieldLabelMap = fieldLabelMap;
        filedWrapper.recordsCount = Database.countQuery('Select count() from Project_Task__c where PRT_Name__c=: ipmId');
        filedWrapper.FieldSetMap=getFieldInfo();
        filedWrapper.ipmPlanData= Database.query('SELECT Id, Account__c, Template__c FROM Project_Template__c' 
                                                 +' where Id=: ipmId');
        return filedWrapper;
        
    }
    
    
    @AuraEnabled
    public static NPSWrapper getTemplateInXML(String ipmId, Boolean isExternal){                       
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString = 'SELECT ';
        String objectName  = '';     
        Id userId = UserInfo.getUserId();
        String loggedInUserRole = getUserRole(userId);
        String srName;
        
        if(!isExternal){
           srName = 'IPMTemplate';  
        }
        else{
            srName = 'IPMTemplateExternal';
        }
        
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource WHERE Name =: srName];
        
        String xmlBodyString = sr.body.toString();
        
        Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            
            String itag = m.group();    
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            
            Integer dotFirstIndex = itag.indexOf('.');
            objectName = itag.substring(0,dotFirstIndex);
            String fieldName = itag.substring(dotFirstIndex+1);
            
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
        List<Project_Task__c> prjctTaskData;
        List<Project_Task__c> extrnlChckdPrjctTskWthMainTskList;
        List<String> prjctTskParentIdLst=new List<String>();
        
        
        prjctTaskData = [SELECT Id,WBS_Code__c, Project_Type__c, Project_Task_Name__c, Start_Date__c, End_Date__c,
                         Duration__c, Owner__c, Resource_Id__c, Priority__c, Predecessors__c, Lag__c, Mark_as_Milestone__c,
                         Progress__c, Notes__c, End_Date_Form__c, Actual_Finish__c, Actual_Finish_Form__c, Checked__c, Additional_Comments__c
                         FROM Project_Task__c 
                         WHERE PRT_Name__c =: ipmId 
                         ORDER BY Row_Number__c ASC];
        
        List<Id> ipmTeamIdList=new List<Id>();
        for(Project_Task__c eachTask:prjctTaskData){
            
            String resourceId=eachTask.Resource_Id__c;
            ID[] resourceIdArray=new List<ID>();
            
            if(resourceId!=null && resourceId!=''){
                if(resourceId.contains(',')){
                    resourceIdArray=resourceId.split(',');
                }else{
                    resourceIdArray.add(resourceId);
                }
                
            }
            
            for(ID eachIpmTeamId:resourceIdArray){
                ipmTeamIdList.add(eachIpmTeamId);
            }
            
        }
        
        
        Map<Id,IPM_Team__c> ipmTeamMap = new Map<Id,IPM_Team__c>([SELECT Id, First_Name__c, Last_Name__c, IPM_Roles__c 
                                                                  FROM IPM_Team__c 
                                                                  WHERE Id IN:ipmTeamIdList]);
        
        Project_Template__c prjctTmplt = [SELECT Id,Name,Owner.Name,Account__r.Name,LastModifiedDate,Policy_Information__r.Name ,Project_Type__c
                                          FROM Project_Template__c 
                                          WHERE Id=:ipmId];
        
        List<Holiday> holidayData = [SELECT Id, ActivityDate 
                                     FROM Holiday 
                                     ORDER BY ActivityDate ASC];
        
        String timeZone = UserInfo.getTimeZone().getID();
        
        npsWrap.xmlString = xmlBodyString;
        npsWrap.IPMFinalData = prjctTaskData;
        npsWrap.objectItags = objectItagesMap;
        npsWrap.UserRole = loggedInUserRole;
        
        
        
        npsWrap.FieldSetMap=getFieldInfo();
        npsWrap.ipmData=prjctTmplt;
        npsWrap.ipmTeamData=ipmTeamMap;
        npsWrap.holidayData = holidayData;
        npsWrap.timeZone = timeZone;
        
        //npsWrap.extrnlChckdPrjctTskWthMainTskData = extrnlChckdPrjctTskWthMainTskList;
        
        return npsWrap;
    }
    
    public static String getUserRole(Id userId) {
        String loggedInUserRole = '';
        try {
            User user = [Select UserRole.Name,Id,Name from User where Id=:userId]; 
            System.debug('user.UserRole.Name >> '+user.UserRole.Name);
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                loggedInUserRole = user.UserRole.Name;
            }
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        return loggedInUserRole;
    }
    
    
    public static Map<String,FieldSetResult> getFieldInfo(){
        
        Map<String,FieldSetResult> fieldSetResultMap = new Map<String,FieldSetResult>() ;
        Map <String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get('Project_Task__c').getDescribe().fields.getMap();
        for(Schema.SObjectField sfield : fieldMap.Values()){
            
            schema.describefieldresult dfield = sfield.getDescribe();
            if(dfield.isCustom() && String.valueOf(dfield.getType())!='REFERENCE'){
                
                FieldSetResult fieldSetRslt= new FieldSetResult();
                fieldSetRslt.label=dfield.getLabel();
                fieldSetRslt.type=String.valueOf(dfield.getType());
                fieldSetRslt.name=dfield.getName();
                fieldSetResultMap.put(fieldSetRslt.name,fieldSetRslt);
                
            }
        }
        return fieldSetResultMap;
    }
    
    
    
    public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public List<Project_Task__c> IPMFinalData { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }
        @AuraEnabled
        public String UserRole { get; set; }
        @AuraEnabled
        public Map<String,FieldSetResult> FieldSetMap { get; set; }
        @AuraEnabled
        public Project_Template__c ipmData { get; set; }
        @AuraEnabled
        public Map<Id,IPM_Team__c> ipmTeamData { get; set; }
        
        @AuraEnabled
        public List<Holiday> holidayData { get; set; } 
        
        @AuraEnabled
        public List<Project_Task__c> extrnlChckdPrjctTskWthMainTskData { get; set; }
        
        @AuraEnabled
        public String timeZone{ get;set; }
        
    }
    
    public class FiledWrapper{
        
        @AuraEnabled
        public Map<String,String> fieldLabelMap { get;set; }
        
        @AuraEnabled
        public Integer recordsCount { get;set; }
        
        @AuraEnabled
        public Map<String,FieldSetResult> FieldSetMap { get; set; }
        
        @AuraEnabled
        public Project_Template__c ipmPlanData { get;set; }
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