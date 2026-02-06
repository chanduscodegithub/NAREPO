public with sharing class ReadAndGenerateXML {       
   
    public static TemplateWrapperClass readXMLfile(Set<String> parentObjIdList,String templateName,Template_Design__c templateObj){
            
        	TemplateWrapperClass templateWrapper = new TemplateWrapperClass();
        
            String parentObj = templateObj.Template_Type__c;                
            
            System.debug('Object Name'+parentObj);
        
        if(templateObj.Name != null && templateObj.Name.equals('CM Account Template')){
            IConstantsTemplate.OBJECT_CONDITIONS_MAP.put('Contacts', 'WHERE Status__c  = \'Active\' AND RecordType.Name = \'CM Contact\'');   
        }
        
        if(templateObj.Name != null && templateObj.Name.equals('CD Coveted Account Template')){
            IConstantsTemplate.OBJECT_CONDITIONS_MAP.put('Contacts', 'WHERE Status__c  = \'Active\'');   
        }

        if(templateObj.Name != null && templateObj.Name.equals('Prospect Template')){
            IConstantsTemplate.OBJECT_CONDITIONS_MAP.put('Contacts', 'WHERE Status__c  = \'Active\'');   
        }
        
            if(parentObj.equals('Adv Membership Activity')){
                parentObj = 'AdvanceMemberShip'; 
            }else if(parentObj.equals('Membership Activity')){
                parentObj = 'Opportunity'; 
            }else if(parentObj.equals('Consultant')){
                parentObj = 'Contact';
            }
            
            System.debug('Parent Object Name '+parentObj);
            
        	templateWrapper.parentObj = parentObj;
        
            // Reading Templete
            //String xmlTempleteString  = ReadAndGenerateXML.returnXMLbodyString(templateName);          
        	String xmlTempleteString  = ReadAndGenerateXML.returnXMLbodyStringFromObj(templateObj.Id);          
                    
            // Map Containes Object name as a key and ChildReleationShip Name as a Value
            //Map<String,String> parentObjchildReleationShipMap = ReadAndGenerateXML.getChildReleationShipNames(parentObj);        
            
            //Map Containes Object name as key and Set of Itags as a Value
            Map<String,Set<String>> objectItagesMap = ReadAndGenerateXML.getObjectMapWithItags(xmlTempleteString,parentObj);        
        
        	templateWrapper.objectItagesMap = objectItagesMap;
            
            System.debug('parentObjIdList : '+parentObjIdList);                      
           
            SOQLqueryWrapper soqlQueryWrapper = ReadAndGenerateXML.returnFinalObjSOQLquery(objectItagesMap,parentObj);
            System.debug('finalSOQLquery '+soqlQueryWrapper.finalSOQLquery);                                       
            System.debug('AdvanceMemberShip '+soqlQueryWrapper.advanceMemberShipSOQLquery);                                       
            System.debug('AggregatorCompaniesSoqlQueryForCVG '+soqlQueryWrapper.AggregatorCompaniesSoqlQueryForCVG);                                       
            
            Map<String,SobjectRecordWrapperClass> sobjectRecordMap = new Map<String,SobjectRecordWrapperClass>();    
            
            List<SobjectRecordWrapperClass> sobjectRecordWrapperClassList = new List<SobjectRecordWrapperClass>();
            Map<String,List<String>> oppAccMap = new Map<String,List<String>>();
            Set<String> accountIdsSet = new Set<String>();
          
            if(soqlQueryWrapper.advanceMemberShipSOQLquery != null){
                List<SObject> advanceMembShipListDetails = Database.query(soqlQueryWrapper.advanceMemberShipSOQLquery);
                for(SObject sobj : advanceMembShipListDetails){
                    SobjectRecordWrapperClass sobjectRecordWrapperClass = new SobjectRecordWrapperClass();
                    sobjectRecordWrapperClass.advanceMembShipObj = sobj;
                    sobjectRecordMap.put(String.valueOf(sobj.get('Id')) , sobjectRecordWrapperClass);
                    if(oppAccMap.containsKey(String.valueOf(sobj.get('AccountId')))){
                        List<String> oppAccList = oppAccMap.get(String.valueOf(sobj.get('AccountId')));
                        oppAccList.add(String.valueOf(sobj.get('Id')));
                        oppAccMap.put(String.valueOf(sobj.get('AccountId')), oppAccList);
                    }else{
                        List<String> oppAccList = new List<String>();
                        oppAccList.add(String.valueOf(sobj.get('Id')));
                        oppAccMap.put(String.valueOf(sobj.get('AccountId')), oppAccList);
                    } 
                    accountIdsSet.add(String.valueOf(sobj.get('AccountId')));
                }
                parentObjIdList = accountIdsSet;
                System.debug('parentObjIdList '+parentObjIdList);
                
                List<SObject> parentSobjectListDetails = Database.query(soqlQueryWrapper.finalSOQLquery);
                for(SObject sobj : parentSobjectListDetails){
                    System.debug('Account sobj '+sobj);
                    if(oppAccMap.containsKey(String.valueOf(sobj.Id))){
                        List<String> oppAccList = oppAccMap.get(String.valueOf(sobj.Id));
                        for(String optyId : oppAccList){
                            if(sobjectRecordMap.containsKey(optyId)){
                                SobjectRecordWrapperClass sobjectRecordWrapperClass = sobjectRecordMap.get(optyId);
                                sobjectRecordWrapperClass.parentSobject = sobj;                        
                                sobjectRecordWrapperClassList.add(SobjectRecordWrapperClass);
                            }       
                        }
                    }                    
                }
            }else{
            	List<SObject> parentSobjectListDetails = Database.query(soqlQueryWrapper.finalSOQLquery); 
                for(SObject sobj : parentSobjectListDetails){
                    System.debug('Account sobj '+sobj);                    
                    SobjectRecordWrapperClass sobjectRecordWrapperClass = new SobjectRecordWrapperClass();
                    sobjectRecordWrapperClass.parentSobject = sobj;
                    sobjectRecordWrapperClassList.add(SobjectRecordWrapperClass);                 
                }
            }
            
            System.debug('sobjectRecordMap '+sobjectRecordMap);
            templateWrapper.xmlTempleteString = xmlTempleteString;
            templateWrapper.sobjectRecordWrapperClassList = sobjectRecordWrapperClassList;        
            templateWrapper.CUSTOM_OBJECT_MAP = IConstantsTemplate.CUSTOM_OBJECT_MAP;        
            templateWrapper.OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;                
              
            return templateWrapper;       
    }
    
    
    @AuraEnabled
    public static string returnXMLbodyStringFromObj(Id templateId){        
        ContentDocumentLink cl= [SELECT Id, LinkedEntityId, ContentDocumentId, Visibility, IsDeleted, ShareType, 
                                 ContentDocument.Title, ContentDocument.createdDate, 
                                 ContentDocument.FileType FROM ContentDocumentLink WHERE LinkedEntityId = :templateId];
        ContentVersion cv =	[SELECT Checksum,ContentBodyId,
                             ContentDocumentId,ContentLocation,
                             Title,VersionData,VersionNumber
                             FROM ContentVersion WHERE ContentDocumentId =:cl.ContentDocumentId];        
        
        blob b= cv.VersionData;        
        return EncodingUtil.base64Decode(EncodingUtil.base64Encode(b)).toString();
    }
    
    @AuraEnabled
    public static string returnXMLbodyString(String templateName){        
        templateName = templateName.replace(' ', '_');
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = :templateName];
        String xmlBodyString = sr.body.toString();
        return xmlBodyString;
    }
	
    @AuraEnabled
    public static Map<String,String> getChildReleationShipNames(String objectName){
               
        if(objectName.equals('AdvanceMemberShip')){
            objectName = 'Account';
        }
        
        //System.debug('objectName in child Relation'+objectName);           
        
        Map<String,String> parentObjchildReleationShipMap = new Map<String,String>();        
        Schema.DescribeSObjectResult objSchema = Schema.getGlobalDescribe().get(objectName).getDescribe();
        List<Schema.ChildRelationship> childList = objSchema.getChildRelationships();
        String name = '';
        for(Schema.ChildRelationship child : childList){            
		
            Schema.SObjectType objName = child.getChildSObject();            
            
            if(child.getRelationshipName() != null && child.getChildSObject() != null){ 
                System.debug('Child Object '+String.valueOf(child.getChildSObject())+'Relation : '+child.getRelationshipName());                
                if(!parentObjchildReleationShipMap.containsKey(String.valueOf(child.getChildSObject())))
                    parentObjchildReleationShipMap.put(String.valueOf(child.getChildSObject()), child.getRelationshipName());
            }
        }        
       // System.debug('childReleationShipMap : '+parentObjchildReleationShipMap.size());
		return parentObjchildReleationShipMap;
    }
               
    public static SOQLqueryWrapper returnFinalObjSOQLquery(Map<String,Set<String>> objectItagesMap,String parentObj){
		
        List<String> childQueryString = new List<String>();                
        String parentSobject = parentObj.equals('AdvanceMemberShip')?'Account':parentObj;
        String finalSOQLquery = 'Select parentItagsSet,childObjectsQuery from '+parentSobject+' Where Id = :parentObjIdList';                      
        Map<String,Set<String>> finalChildFieldsMap = new Map<String,Set<String>>();
        Map<String,String> CUSTOM_OBJECT_MAP = IConstantsTemplate.CUSTOM_OBJECT_MAP;
        
        for (String objectName : objectItagesMap.keySet()) {
            if((objectName.equals(parentObj) && !objectName.equals('AdvanceMemberShip')) || objectName.equals('Account')){
                String queryItagString = '';
                Set<String> itagSet = objectItagesMap.get(objectName);
                itagSet.add('Id');
                
                for(String itag : itagSet){
                    queryItagString += itag+',';
                }
                queryItagString = queryItagString.removeEnd(',');
                finalSOQLquery = finalSOQLquery.replace('parentItagsSet', queryItagString);
            }            
            else{   
                Set<String> itagSet = objectItagesMap.get(objectName);
                for(String itag : itagSet){
                    if(CUSTOM_OBJECT_MAP.containsKey(objectName)){
                        if(finalChildFieldsMap.containsKey(CUSTOM_OBJECT_MAP.get(objectName))){
                            Set<String> eachItagSets = finalChildFieldsMap.get(CUSTOM_OBJECT_MAP.get(objectName));
                            eachItagSets.add(itag);
                            finalChildFieldsMap.put(CUSTOM_OBJECT_MAP.get(objectName), eachItagSets);
                        }else{
                            Set<String> eachItagSets = new Set<String>();
                            eachItagSets.add(itag);
                            finalChildFieldsMap.put(CUSTOM_OBJECT_MAP.get(objectName), eachItagSets);
                        }                        
                    }else{
                        if(finalChildFieldsMap.containsKey(objectName)){
                            Set<String> eachItagSets = finalChildFieldsMap.get(objectName);
                            eachItagSets.add(itag);
                            finalChildFieldsMap.put(objectName, eachItagSets);
                        }else{
                            Set<String> eachItagSets = new Set<String>();
                            eachItagSets.add(itag);
                            finalChildFieldsMap.put(objectName, eachItagSets);
                        }
                    }
                }
                
            }
        }
        
        SOQLqueryWrapper soqlQueryWrapper = new  SOQLqueryWrapper();
        
        for(String objectName : finalChildFieldsMap.keySet()){                        
        
            String condition = '';
            String childReleationshipName = '';
            Map<String,String> OBJECT_CONDITIONS_MAP = IConstantsTemplate.OBJECT_CONDITIONS_MAP;   
            if(OBJECT_CONDITIONS_MAP.containsKey(objectName)){
                condition = ' '+OBJECT_CONDITIONS_MAP.get(objectName);
            }
            if(CUSTOM_OBJECT_MAP.containsKey(objectName)){                
                childReleationshipName = CUSTOM_OBJECT_MAP.get(objectName);
            }else{                
                childReleationshipName = objectName;
            }                        
            
            if(objectName.equals('AdvanceMemberShip')){                
                childReleationshipName = 'Opportunity';                
            }   
            Map<String,String> ORDER_BY_RECORDS = IConstantsTemplate.ORDER_BY_RECORDS;
            String orderByRecords = '';
            if(ORDER_BY_RECORDS.containsKey(childReleationshipName)){
                orderByRecords = ORDER_BY_RECORDS.get(childReleationshipName);
			}
            
            String queryObjectString = '(Select itagSet from '+childReleationshipName+condition+orderByRecords+')';
           
            String queryItagString = '';            
            Set<String> itagSet = finalChildFieldsMap.get(objectName);
            
            if(objectName.equals('AdvanceMemberShip')){                              
                queryObjectString = 'Select itagSet from '+childReleationshipName+' Where Id = :parentObjIdList';   
                itagSet.add('AccountId ');
            } 
           
            for(String itag : itagSet){
                queryItagString += itag+',';
            }
            queryItagString = queryItagString.removeEnd(',');
            queryObjectString = queryObjectString.replace('itagSet', queryItagString);
            
            if(objectName.equals('AggregatorCompany')){                
				soqlQueryWrapper.AggregatorCompaniesSoqlQueryForCVG = queryObjectString.replace(childReleationshipName, 'Account');
            }   
            if(objectName.equals('AdvanceMemberShip')){                
               soqlQueryWrapper.advanceMemberShipSOQLquery = queryObjectString;
            }else{
             	childQueryString.add(queryObjectString);                               
            }            
        }
        
        String childObjectsQuery = '';
        for(String childQuery : childQueryString){
            childObjectsQuery += childQuery+',';
        }
        childObjectsQuery = childObjectsQuery.removeEnd(',');
        finalSOQLquery = finalSOQLquery.replace('childObjectsQuery', childObjectsQuery); 
        
        soqlQueryWrapper.finalSOQLquery = finalSOQLquery;        
        
        return soqlQueryWrapper;
    }
        
    public static Map<String,Set<String>> getObjectMapWithItags(String xmlBodyString,String parentObj){                       
        
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
            String objectName = itag.substring(0,dotFirstIndex);
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
                if(OBJECT_FILTER_RECORDS.containsKey(objectName)){
                    String columnName = OBJECT_FILTER_RECORDS.get(objectName);
                    itagSet.add(columnName.split('::')[0]);
                }                
                objectItagesMap.put(objectName, itagSet);
            }                         
            
        }                        
        return objectItagesMap;
    }   
    
    public class SOQLqueryWrapper {
        @AuraEnabled
        public string finalSOQLquery { get;set; }  
        
        @AuraEnabled
        public string advanceMemberShipSOQLquery { get;set; }  
        
        @AuraEnabled
        public string AggregatorCompaniesSoqlQueryForCVG { get;set; }  
    } 
    
     public class SobjectRecordWrapperClass {
        @AuraEnabled
        public SObject advanceMembShipObj { get;set; }  
        
        @AuraEnabled
        public SObject parentSobject { get;set; }          
    }       
}