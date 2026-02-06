public class IRAD_LOG_Controller 
{
	@AuraEnabled
    public static IRADResult getIRADRecords(ID accountId,Decimal pageNumber,String columnName, String sortType) 
    {
        
        Integer pageSize = 5;
        Integer offset = ((Integer)pageNumber - 1) * pageSize;
        IRADResult iradRslt=new IRADResult();
        iradRslt.total = Database.countQuery('Select count() from IRAD__c where Project__c=: accountId');
        if(pageNumber > 1 && (iradRslt.total == (pageNumber-1) * pageSize)){
            pageNumber--; 
            offset = ((Integer)pageNumber - 1) * pageSize;
        }
        
        iradRslt.iradList=Database.query('SELECT Id, Status__c, Date_Reported__c, Description__c, Type__c, Notes_Comments__c, Internal_External__c, Priority__c, Current_Due_Date__c, Completed_Date__c, Category__c,Applicable_To__c,Owner.Name FROM IRAD__c' 
                                         +' where Project__c=: accountId ORDER BY '+columnName+' '+sortType+' LIMIT :pageSize OFFSET :offset');
        iradRslt.page = (Integer)pageNumber;
        iradRslt.pageSize = pageSize;
        
        List<String> pickListfieldNameList= new List<String>{'Status__c','Type__c','Internal_External__c','Priority__c','Category__c','Applicable_To__c'};        
            
            Map<String,List<String>> mp=new Map<String,List<String>>();
        for(String eachPickListfieldName:pickListfieldNameList) 
        {
            mp.put(eachPickListfieldName,getselectOptions('IRAD__c',eachPickListfieldName));
            
        }
        for (String key : mp.keySet()) {

            List<String> toAddresses = mp.get(key);
            system.debug(toAddresses);

        }
        
        iradRslt.pckLstMap=mp;
        
        
        
        
        //System.debug('iradList'+iradRslt.iradList);
        return  iradRslt;       
        
    }
     
    public static List < String > getselectOptions(String objectName, string fld) 
    {
        
        System.debug('objectName,fld==>'+objectName+' '+fld);
        List < String > allOpts = new list < String > ();
        allOpts.add('');
        
        // Get the object type of the SObject.
        Schema.SObjectType objType = Schema.getGlobalDescribe().get(objectName);
        
        
        // Schema.sObjectType objType = objObject.getSObjectType();
        
        // Describe the SObject using its object type.
        Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
        
        // Get a map of fields for the SObject
        map < String, Schema.SObjectField > fieldMap = objDescribe.fields.getMap();
        
        // Get the list of picklist values for this field.
        list < Schema.PicklistEntry > values =
            fieldMap.get(fld).getDescribe().getPickListValues();
        
        // Add these values to the selectoption list.
        for (Schema.PicklistEntry a: values) {
            allOpts.add(a.getValue());
        }
        system.debug('allOpts ---->' + allOpts);
        allOpts.sort();
        return allOpts;
    }
    
    
   /* @AuraEnabled
    public static IRADResult updateDeleteIRAdRecord(Id accountId,IRAD__c iradRec,Boolean isDelete,
                                                          Decimal pageNumber,String columnName, String sortType){
        IRADResult iradRslt=new IRADResult();
        try{
            System.debug('IRAD==>'+iradRec);
            if(isDelete){
                delete iradRec;
            }else{
                update iradRec;
            }
        }catch(Exception ex){
            System.debug('Exception occured while updateDeleteIRAdRecord==>'+ex.getMessage());
        }
        iradRslt = getIRADRecords(accountId,pageNumber,columnName,sortType);
        return iradRslt;
    }*/
    
     @AuraEnabled
    public static IRADResult upsertIradRecords(List<IRAD__C> iradJson,ID accountId,Decimal pageNumber,String columnName, String sortType){
        //system.debug('upsertIradRecords method');
        system.debug('iradJson-----> : '+iradJson);
        String recordStatus = '';
        List<IRAD__C> filteredList = new List<IRAD__C>();

        try{
            
            Map<Id,IRAD__c> iradMap=new Map<Id,IRAD__c>([Select Id from IRAD__c where Project__c=:accountId]);
            
            for(IRAD__c eachIradJson:iradJson)
            {
                if(eachIradJson.Id == null){
                    filteredList.add(eachIradJson);
                }
				else if(eachIradJson.Id != null && iradMap.containsKey(eachIradJson.Id)==false )
                {
                    eachIradJson.Id=null;
                    filteredList.add(eachIradJson);
                    System.debug('filteredList 2nd if : '+filteredList);
                }else if(eachIradJson.Id != null){
                    Boolean duplicatefound = false;
                    Integer count = -1;
                    for(IRAD__c filteredRec : filteredList){
                        if(eachIradJson.Id == filteredRec.Id){
                            //system.debug('Inside filter condition');
                            duplicatefound = true;
                            
                            count ++;
                        }
                    }
                    if(duplicatefound){
                        filteredList.remove(count);
                    }
                    
                    filteredList.add(eachIradJson);
                    //System.debug('filteredList 3rd if: '+filteredList);
                }
            }
        
            
            
            Schema.SObjectField f = IRAD__C.Fields.Id;
        	Database.UpsertResult [] results = Database.upsert(filteredList, f, false);
            recordStatus = 'Success';
        for(Integer index = 0, size = results.size(); index < size; index++) {
            if(results[index].isSuccess()) {
                if(results[index].isCreated()) {
                    //System.debug('Record was created');
                } else {
                   // System.debug('Record was updated');
                }
            }else{
                	Database.Error[] error=results[index].getErrors();
                	 recordStatus = 'Failed';
                	//System.debug('Record is not inserted : '+error);
            }
        }
        }catch(Exception e){
            System.debug('Exception Occured : '+e.getMessage());
            recordStatus = 'Failed';
        }
        IRADResult  iradResult ;
        if(recordStatus == 'Success'){
         	 iradResult= getIRADRecords(accountId,pageNumber,columnName,sortType);
             iradResult.recordStatus = 'Success';
        }else{
            iradResult.recordStatus = 'Failure';
        }
        return iradResult;
    }
    
    @AuraEnabled
    public static FiledWrapper  getAllFieldName(String objectName,ID accountId) {
        
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
        filedWrapper.recordsCount = Database.countQuery('Select count() from IRAD__c where Project__c=: accountId');
        filedWrapper.FieldSetMap=getFieldInfo();
        filedWrapper.impPlanData= Database.query('SELECT Id, Account__c,OwnerId, Template__c FROM Project_Template__c' 
                                         +' where Id=: accountId');
        return filedWrapper;
    
    }
    
    
    @AuraEnabled
    public static NPSWrapper getTemplateInXML(String ipmID,Boolean isExternal){                       
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString = 'Select ';
        String objectName  = '';     
        Id userId = UserInfo.getUserId();
        String loggedInUserRole = getUserRole(userId);
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'IRADTemplate'];
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
        List<IRAD__c> iradData;
        if(isExternal== true)
        {
            iradData = [Select Id,Status__c,Date_Reported__c,Description__c,Type__c,Notes_Comments__c,Internal_External__c,Priority__c,Current_Due_Date__c,Completed_Date__c,Category__c,Resolution_Plan__c,Responsible_Person__c,Applicable_To__c,Owner.Name from IRAD__c where Project__c=:ipmID and Internal_External__c='External' ORDER BY Date_Reported__c DESC];
        }
        else
        {
            iradData = [Select Id,Status__c,Date_Reported__c,Description__c,Type__c,Notes_Comments__c,Internal_External__c,Priority__c,Current_Due_Date__c,Completed_Date__c,Category__c,Resolution_Plan__c,Responsible_Person__c,Applicable_To__c,Owner.Name from IRAD__c where Project__c=:ipmID ORDER BY Date_Reported__c DESC];
        }
        
        
        //List<Account> iradData = [Select Name,Type,Website,Industry,NumberOfEmployees,Category__c,Subtype__c,AARSExistingCustomer__c,Active__c,Aetna_BiC__c,Aggregator_Membership_Status__c,Aggregator_Type__c from Account limit 2];
        System.debug('iradData : '+iradData);
        
        Project_Template__c prjctTmplt=[Select Id,Name,Owner.Name,Account__r.Name,LastModifiedDate,Policy_Information__r.Name from Project_Template__c where Id=:ipmID];
        String timeZone = UserInfo.getTimeZone().getID();
        
        npsWrap.xmlString = xmlBodyString;
        npsWrap.IRADFinalData = iradData;
        npsWrap.objectItags = objectItagesMap;
        npsWrap.UserRole = loggedInUserRole;
        
        
        
        npsWrap.FieldSetMap=getFieldInfo();
        npsWrap.ipmData=prjctTmplt;
        npsWrap.timeZone = timeZone;
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
    
	    
    public class IRADResult 
    {
        
        @AuraEnabled
        public List<IRAD__C> iradList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public Map<String,List<String>> pckLstMap { get;set; }
        
        @AuraEnabled
        public String recordStatus{ get;set; }
        
    }
    
    public static Map<String,FieldSetResult> getFieldInfo()
    {
        Map<String,FieldSetResult> fieldSetResultMap = new Map<String,FieldSetResult>() ;
        Map <String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get('IRAD__c').getDescribe().fields.getMap();
		for(Schema.SObjectField sfield : fieldMap.Values())
		{
			schema.describefieldresult dfield = sfield.getDescribe();
    		if(dfield.isCustom() && String.valueOf(dfield.getType())!='REFERENCE')
    		{
                FieldSetResult fieldSetRslt= new FieldSetResult();

                fieldSetRslt.label=dfield.getLabel();
                fieldSetRslt.type=String.valueOf(dfield.getType());
                fieldSetRslt.name=dfield.getName();
                    
                fieldSetResultMap.put(fieldSetRslt.name,fieldSetRslt);
    		}
		}
        return fieldSetResultMap;
    }
          
    /*@AuraEnabled
    public static ReportWrapper getData(String accID){                       
        ReportWrapper reportWrapp = new  ReportWrapper();
       
        String objectName  = '';     
        String loginUserId = UserInfo.getUserId();
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'ModReport'];
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
            
            System.debug('itag value '+itag);
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
            system.debug('objectItagesMap : '+objectItagesMap.size());
            
                     
            
            
        }  
        /*String buildApiKey = '';
        for(String key : objectItagesMap.keySet()){
            for(String apikey:objectItagesMap.get(key)){
                if(String.isEmpty(buildApiKey)){
                    buildApiKey = apikey;
                }else{
                    buildApiKey = apikey+','+buildApiKey;
                }
            }
        }*/
        
       /* for (String key : objectItagesMap.keySet()) {
    		//Set<String> setItagKey = objectItagesMap.get(key);
            //system.debug('Map key : '+key);
            //system.debug('Map Value : '+listValue);
    		//key abc = 'select Id,Name from '+ key;
            //system.debug(select Id,Name from IRAD__c);
            String buildApiKey = '';
            String objName = key;
             String queryString = 'Select ';
            
                for(String apikey:objectItagesMap.get(key)){
                    if(String.isEmpty(buildApiKey)){
                        buildApiKey = apikey;
                    }else{
                        buildApiKey = apikey+','+buildApiKey;
                    }
                }
                if(objName == 'IRAD__c'){
                    queryString = queryString+''+buildApiKey+' From '+ objName+ ' where Project__c =: accID';
                }else{
                    queryString = queryString+''+buildApiKey+' From '+ objName+ ' where Id =: accID';
                }
            	
            	system.debug('queryString ::::::::: '+queryString);
            	
                if(objName == 'IRAD__c'){
                    System.debug('objName : '+objName + ' ,queryString : '+queryString);
                    Map<String, List<SObject>> objValMap = new Map<String, List<SObject>>();
                    List<IRAD__c> iradList = Database.query(queryString);
                    system.debug('iradList result : '+iradList);
                    objValMap.put(objName, iradList);
                    reportWrapp.iradData = objValMap;
                }else if(objName == 'Project_Template__c'){
                    System.debug('objName : '+objName + ' ,queryString : '+queryString);
                    Map<String, List<SObject>> objValMap = new Map<String, List<SObject>>();
                    List<Project_Template__c> impList = Database.query(queryString);
                    objValMap.put(objName, impList);
                    reportWrapp.ipmData = objValMap;
                    system.debug('impList result : '+impList);
                }
            	 
            
			}
        
        reportWrapp.xmlString = xmlBodyString;
        reportWrapp.objectItags = objectItagesMap;
        return reportWrapp;
    } */   
    
    
     public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public List<IRAD__c> IRADFinalData { get; set; }
        /*@AuraEnabled
        public List<Account> IRADFinalData { get; set; }*/
        @AuraEnabled
        public String xmlString { get; set; }
        @AuraEnabled
        public String UserRole { get; set; }
         @AuraEnabled
        public Map<String,FieldSetResult> FieldSetMap { get; set; }
         @AuraEnabled
        public Project_Template__c ipmData { get; set; }
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
        public Project_Template__c	impPlanData { get;set; }
    }
    
    public class FieldSetResult 
    {
        
        @AuraEnabled
        public String label{ get;set; }
        
        @AuraEnabled
        public boolean required { get;set; }
        
        @AuraEnabled
        public String type { get;set; }
        
        @AuraEnabled
        public String name { get;set; }
        
        
        
    }
    
    /*public class ReportWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public Map<String, List<IRAD__c>> iradData { get; set; }
        @AuraEnabled
        public Map<String, List<Project_Template__c>> ipmData { get; set; }
        @AuraEnabled
        public String xmlString { get; set; }
    }*/
    
}