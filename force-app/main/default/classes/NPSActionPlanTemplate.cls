public without sharing class NPSActionPlanTemplate {
    
    @AuraEnabled
    public static NPSWrapper getTemplateInXML(String accID,List<String> NPSId){                       
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString = 'Select ';
        String objectName  = '';     
        Id userId = UserInfo.getUserId();
        String loggedInUserRole = getUserRole(userId);
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'NPSActionPlanTemplate'];
        String xmlBodyString = sr.body.toString();
        
        Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        System.debug('matcher '+m);
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();    
            
            
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
        for(String key : objectItagesMap.keySet()){
            for(String apikey:objectItagesMap.get(key)){
                if(String.isEmpty(buildApiKey)){
                    buildApiKey = apikey;
                }else{
                    buildApiKey = apikey+','+buildApiKey;
                }
            }
        }
        System.debug('NPSId'+NPSId);
        //buildApiKey += ',Company_Name__r.Name';
        Id taskRecordTypeId = Schema.SObjectType.Task.getRecordTypeInfosByDeveloperName().get('NPS_Action_Task_Record_Type').getRecordTypeId();
        buildApiKey +=',(Select id,Status,Priority,Subject,Type,ActivityDate,Description from Tasks where RecordTypeId=:taskRecordTypeId AND (status =\'Open\' OR status=\'Completed\'))';
        if(accID == null || accID == ''){
            //queryString = queryString+''+buildApiKey+' From '+objectName+' where Company_Name__r.OwnerId =:userId';
            queryString = queryString+''+buildApiKey+' From '+objectName+' where Id In:NPSId';
        }else{
            queryString = queryString+''+buildApiKey+' From '+objectName+' where Company_Name__r.Id =:accID';
        }
        
        System.debug('queryString'+queryString);
        Map<ID, List<Action_Service_Plan__c >> NPSMap = new Map<ID, List<Action_Service_Plan__c >>();
        List<Action_Service_Plan__c > NPSData = Database.query(queryString);
        for(Action_Service_Plan__c  actionData:NPSData){
            System.debug('actionData.Company_Name__c'+actionData.Company_Name__c);
            if(NPSMap.containsKey(actionData.Company_Name__c)){
                List<Action_Service_Plan__c > NPSList = NPSMap.get(actionData.Company_Name__c);
                NPSList.add(actionData);
            }else{
                List<Action_Service_Plan__c > NPSNewList = new List<Action_Service_Plan__c >();
                NPSNewList.add(actionData);
                NPSMap.put(actionData.Company_Name__c, NPSNewList);
            }
        }
        System.debug('objectItagesMap'+objectItagesMap);
        npsWrap.xmlString = xmlBodyString;
        npsWrap.NPSFinalData = NPSMap;
        npsWrap.objectItags = objectItagesMap;
        npsWrap.UserRole = loggedInUserRole;
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
    
    @AuraEnabled
    public static NPSWrapper getTemplateOnLoad(List<String> NPSId) {
        NPSWrapper npsWrap = new  NPSWrapper();
        Id userId = UserInfo.getUserId();
        String loggedInUserRole = getUserRole(userId);
        /*if(loggedInUserRole.contains('CM SCE')){
              npsWrap =  getTemplateInXML('',NPSId);
            }*/
        npsWrap =  getTemplateInXML('',NPSId);
        return npsWrap;
    }
    
    
    public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public Map<ID, List<Action_Service_Plan__c >> NPSFinalData { get; set; }
        @AuraEnabled
        public String xmlString { get; set; }
        @AuraEnabled
        public String UserRole { get; set; }
    }
}