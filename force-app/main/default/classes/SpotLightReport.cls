public with Sharing class SpotLightReport {
 @AuraEnabled
    public static List<Project_Template__c> getIPMData(){
        List<Project_Template__c> projTemp = [Select Id,Name,Account__r.Name, Effective_Date__c, Owner.Name, Number_of_Lives__c, Description__c, (Select Id,Start_Date__c,PRT_Name__c,Project_Task_Name__c from Project_Tasks__r WHERE Project_Task_Name__c='Effective Date') from Project_Template__c where Spotlight__c= true ORDER BY Name ASC];
        return projTemp;
    }
    
    
    @AuraEnabled
    public static void getSpotLightReportData(List<string> ipmId){ 
        List<Project_Template__c> projTemp = [Select Id,Name,Account__c from Project_Template__c where Id IN:ipmId];
        List<SeniorUHGExecutivesEngaged__c> seniorUHG = [SELECT Id, UHCExecutiveSponsorName__c FROM SeniorUHGExecutivesEngaged__c where Account__c='001g0000022L00jAAC'];
        List<Project_Task__c> proTask = [SELECT Id,PRT_Name__c,Project_Task_Name__c,Start_Date__c FROM Project_Task__c where Project_Task_Name__c='Effective Date' AND Id In:ipmId];
    }
    
    
    @AuraEnabled
    public static NPSWrapper getTemplateInXML(List<String> spotlightChckdIpmIdLst){  
        System.debug('idlst==>'+spotlightChckdIpmIdLst);
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString = 'Select ';
        String objectName  = '';     
        Id userId = UserInfo.getUserId();
        String loggedInUserRole = getUserRole(userId);
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'SpotlightClientTemplate'];
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
        List<Project_Template__c> ipmData = new List<Project_Template__c>();
        
            ipmData = [Select Id,Account__c,Account__r.Name,Account__r.ParticipatingUSMembers__c,Reason_for_Spotlight__c,Elevate_Type__c,Account__r.RecordType.Name,Number_of_Lives__c,Effective_Date__c,Overall_Project_Status__c,(Select Id,WBS_Code__c,Project_Task_Name__c,End_Date_Form__c,Actual_Finish__c from Project_Tasks__r where (NOT WBS_Code__c like '%.%')) from Project_Template__c where Id in :spotlightChckdIpmIdLst ORDER BY Name ASC];
        system.debug('IPM Data==>'+ipmData);
        Set<Id> accountIdSet=new Set<Id>();
        for(Project_Template__c eachPrjctTmplt:ipmData){
            if(eachPrjctTmplt.Account__c!=null){
                system.debug(eachPrjctTmplt.Account__c);
                accountIdSet.add(eachPrjctTmplt.Account__c);
            }
            
        }
        
		List<SeniorUHGExecutivesEngaged__c> snrExecData;
        if(!accountIdSet.isEmpty()){
            snrExecData=[Select Id,UHCExecutiveSponsorName__c,Account__c from SeniorUHGExecutivesEngaged__c where Account__c in :accountIdSet];
        }
        
        List<Project_Task__c> taskData;
           
           taskData = [Select Id,Start_Date__c,PRT_Name__c,Project_Task_Name__c from Project_Task__c where PRT_Name__c in :spotlightChckdIpmIdLst and Project_Task_Name__c='Effective Date' order by Row_Number__c ASC];
           
         /*List<String> iradTypeList=new List<String>();
           iradTypeList.add('Risk');
           iradTypeList.add('Issue');*/
        
        String[] iradTypeList=new List<String>();
        String iradTypeStr=System.Label.SpotlightClient_IRAD_Type_ToBeEnabled;
        if(iradTypeStr!=null && iradTypeStr!='')
        {
            if(iradTypeStr.contains(','))
            {
                iradTypeList= iradTypeStr.split(',');
                
            }
            else
            {
                iradTypeList.add(iradTypeStr);
            }
            
        }
        
        String[] iradStatusList=new List<String>();
        String iradStatusStr=System.Label.SpotlightClient_IRAD_Status_ToBeEnabled;
        if(iradStatusStr!=null && iradStatusStr!='')
        {
            if(iradStatusStr.contains(','))
            {
                iradStatusList= iradStatusStr.split(',');
                
            }
            else
            {
                iradStatusList.add(iradStatusStr);
            }
            
        }
        
        
        
        
        List<IRAD__c> IRADData;
           
           //IRADData=[Select Id,Status__c,Type__c,Description__c,Notes_Comments__c,Resolution_Plan__c,Project__c,Completed_Date__c from IRAD__c where Project__c in :spotlightChckdIpmIdLst and (Status__c='Open' or Status__c='Closed') and Type__c in :iradTypeList ORDER BY Date_Reported__c DESC];
           IRADData=[Select Id,Status__c,Type__c,Description__c,Notes_Comments__c,Resolution_Plan__c,Project__c,Completed_Date__c,Applicable_To__c from IRAD__c where Project__c in :spotlightChckdIpmIdLst and Status__c in :iradStatusList and Type__c in :iradTypeList ORDER BY Date_Reported__c DESC];
        
        List<Holiday> holidayData = [SELECT Id, ActivityDate FROM Holiday ORDER BY ActivityDate ASC];
        
        
        npsWrap.IPMData=ipmData;
        npsWrap.snrExecData=snrExecData;
        npsWrap.taskData=taskData;
        npsWrap.IRADData=IRADData;
        npsWrap.holidayData = holidayData;
           
        npsWrap.xmlString = xmlBodyString;
        npsWrap.objectItags = objectItagesMap;
        npsWrap.UserRole = loggedInUserRole;
        
        
        


        return npsWrap;
    }
    
    public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public List<IRAD__c> IRADData { get; set; }
        @AuraEnabled
        public List<Project_Template__c> IPMData { get; set; }
        @AuraEnabled
        public List<Project_Task__c> taskData { get; set; }
        @AuraEnabled
        public List<SeniorUHGExecutivesEngaged__c> snrExecData { get; set; }
        @AuraEnabled
        public List<Holiday> holidayData { get; set; }      
        @AuraEnabled
        public String xmlString { get; set; }
        @AuraEnabled
        public String UserRole { get; set; }
        
         
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
	
    
}