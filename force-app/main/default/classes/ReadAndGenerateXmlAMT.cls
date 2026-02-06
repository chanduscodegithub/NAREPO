public with sharing class ReadAndGenerateXmlAMT {
    
    @AuraEnabled
    public static PrintWrapper getRefGuideTemplateInXML(List<Service_AMT__c> referenceGuideAmtList, String accId){
        
        system.debug('referenceGuideAmtList===='+referenceGuideAmtList);
        system.debug('accId===='+accId);
        PrintWrapper printWrapper = new  PrintWrapper();
        
        List<Service_AMT__c> referenceGuideAmtListFinal = new List<Service_AMT__c>();
        List<Service_AMT__c> referenceGuideAmtListFinalSorted = new List<Service_AMT__c>();
        Map<String,String> roleRespMap = new Map<String,String>();
        List<String> roleSpecifiedInGuide = new List<String>();
        Map<String,Service_AMT__c> idObjectMap = new Map<String,Service_AMT__c>();
        Map<String,Decimal> roleOrderMap = new Map<String,Decimal>();
        Map<Decimal,String> orderRoleMap = new Map<Decimal,String>();
        List<Decimal> roleSortOrder = new List<Decimal>();
        List<String> toAvoidDuplicatesIdRole = new List<String>();
        List<String> toAvoidDuplicatesRole = new List<String>();
        Map<String, String> roleAliasMap = new Map<String, String>();
        AMT_Reference_Guide_Role_Responsibility__mdt[] roleRespData = [SELECT Role__c,Responsibility__c,Sorting_Order__c FROM AMT_Reference_Guide_Role_Responsibility__mdt];
        for (AMT_Reference_Guide_Role_Responsibility__mdt roleResp : roleRespData) {
            if(roleResp != null && roleResp.Role__c != null){
                roleRespMap.put(roleResp.Role__c, roleResp.Responsibility__c); 
                roleSpecifiedInGuide.add(roleResp.Role__c);
                roleOrderMap.put(roleResp.Role__c,roleResp.Sorting_Order__c);
                orderRoleMap.put(roleResp.Sorting_Order__c,roleResp.Role__c);
            }                               
        }
        
        Account accQuery = new Account();
        List<String> roleInServiceAmt = new List<String>();
        
        if(referenceGuideAmtList.size() <= 0){
            system.debug('inside referenceGuideAmtList null condition');
            
            if(Pattern.matches('[a-zA-Z0-9]{18}', accId) && !String.isEmpty(accId)){
                accId =String.escapeSingleQuotes(accId);
                accQuery =	[select Name,CM_SCE__r.Name,CM_SCE__r.Phone,CM_SCE__r.Email from Account where id = :accId with USER_MODE];
            }
            system.debug('accQuery--'+accQuery);
        }else{
            for (Service_Amt__C eachServiceAmt : referenceGuideAmtList) {
                
              // roleInServiceAmt.add(eachServiceAmt.Contact_Role__c+'&&'+eachServiceAmt.Id);
                roleInServiceAmt.add(getContactRoleLabel(eachServiceAmt.Contact_Role__c) + '&&' + eachServiceAmt.Id);

                idObjectMap.put(eachServiceAmt.Id, eachServiceAmt);
            }
        }
        
        if(roleInServiceAmt.size() > 0 && roleSpecifiedInGuide.size() > 0){
            for (String eachServiceAmtRoleandId : roleInServiceAmt) {
                String[] serviceAmtRoleId = eachServiceAmtRoleandId.split('&&');
                String eachServiceAmtRole = serviceAmtRoleId[0];
                if(roleSpecifiedInGuide.contains(eachServiceAmtRole)){
                    referenceGuideAmtListFinal.add(idObjectMap.get(serviceAmtRoleId[1]));
                }
            }
        }
        
        
        if(referenceGuideAmtListFinal.size() > 0){
            for(Service_Amt__c selectedServiceAmt : referenceGuideAmtListFinal){
                //String roleName = selectedServiceAmt.Contact_Role__c;
                String roleName = getContactRoleLabel(selectedServiceAmt.Contact_Role__c);

                roleSortOrder.add(roleOrderMap.get(roleName));
            }
            system.debug('roleSortOrder1=='+roleSortOrder);
            roleSortOrder.sort();
            system.debug('roleSortOrder2=='+roleSortOrder);
            Decimal previousOrderNumber = 0;
            for(Decimal roleOrderNum : roleSortOrder){
                String orderdRoleName = orderRoleMap.get(roleOrderNum);
                system.debug('orderdRoleName=='+orderdRoleName);
                for (String eachServiceAmtRoleandId : roleInServiceAmt) {
                    system.debug('eachServiceAmtRoleandId=='+eachServiceAmtRoleandId);
                    String[] serviceAmtRoleId = eachServiceAmtRoleandId.split('&&');
                    String eachServiceAmtRole = serviceAmtRoleId[0];
                    //String eachServiceAmtId = serviceAmtRoleId[1];
                    
                    if(orderdRoleName == eachServiceAmtRole){
                        system.debug(' previousOrderNumber  '+previousOrderNumber);
                        system.debug('roleOrderNum '+roleOrderNum);
                        if(previousOrderNumber != roleOrderNum){
                            system.debug('same order ');
                            referenceGuideAmtListFinalSorted.add(idObjectMap.get(serviceAmtRoleId[1]));
                            toAvoidDuplicatesIdRole.add(serviceAmtRoleId[0]+serviceAmtRoleId[1]);
                            toAvoidDuplicatesRole.add(idObjectMap.get(serviceAmtRoleId[1]).Contact_Role__c);
                        }else{
                            if(toAvoidDuplicatesRole.size() > 0){
                                for(String addedServiceAmtRole : toAvoidDuplicatesRole){
                                    
                                    if(addedServiceAmtRole == serviceAmtRoleId[0]){
                                        
                                        if((serviceAmtRoleId[0]+serviceAmtRoleId[1]) != (addedServiceAmtRole+serviceAmtRoleId[1])){
                                            referenceGuideAmtListFinalSorted.add(idObjectMap.get(serviceAmtRoleId[1]));
                                        } 
                                    }
                                }
                            }
                            
                        }   
                        
                    }
                    
                }
                previousOrderNumber =   roleOrderNum;  
            }
        }
        
        String objectName  = ''; 
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'AmtReferenceGuide'];
        String xmlBodyString = sr.body.toString();
        
        // Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
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
        
        printWrapper.xmlString = xmlBodyString;       
        printWrapper.objectItags = objectItagesMap;
        printWrapper.roleResp = roleRespMap;
        printWrapper.cmsceInfo = accQuery;
        printWrapper.sortedServiceAmtList = referenceGuideAmtListFinalSorted;
        
        return printWrapper;
        
    }
    
    public class PrintWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }  
        
        @AuraEnabled
        public Map<String,String> roleResp{get; set;}
        
        @AuraEnabled
        public List<Service_Amt__c> sortedServiceAmtList{get; set;}
        
        @AuraEnabled
        public Account cmsceInfo { get; set; }  
    }
    
    
    @AuraEnabled
    public static TemplateWrapperClass getTemplateInXML(List<String> selectedIds,String templateName,String teamType,Boolean isPolicyAmt, String policyId){
        system.debug('selectedIds@@@111111111'+selectedIds+'teamType@@@'+teamType);
        System.debug('isPolicyAmt 1 +++++++++' +isPolicyAmt);
        try{
            if(!string.isBlank(policyId))
                policyId =String.escapeSingleQuotes(policyId);
            System.debug('templateName '+templateName);         
            Set<String> parentObjIdList = new Set<String>();      
            parentObjIdList.addAll(selectedIds);      
            system.debug('parentObjIdList'+parentObjIdList); 
            Map<String,String> OBJECT_CONDITIONS_MAP = IConstantsTemplate.OBJECT_CONDITIONS_MAP;   
            if(teamType != null && teamType == 'Internal'){
                
                OBJECT_CONDITIONS_MAP.put('Service_AMT__r','WHERE (Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= Today) AND Contact_Role__c != null ORDER By Order__c ASC nulls last,Last_Name__c ASC'); 
                
            }else{
                OBJECT_CONDITIONS_MAP.put('Service_AMT__r','WHERE External__c  = true AND (Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= Today) AND Contact_Role__c != null ORDER By Order__c ASC nulls last,Last_Name__c ASC'); 
                
            }
            system.debug('OBJECT_CONDITIONS_MAP===='+OBJECT_CONDITIONS_MAP);
            return ReadAndGenerateXmlAMT.readXMLfile(parentObjIdList,templateName,isPolicyAmt,policyId);
        }catch(AuraHandledException ex){
            System.debug('AuraHandledException '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured Whlie downloading Template---> '+ex.getMessage());
        }catch(Exception ex){
            System.debug('Exception '+ex.getMessage());
            System.debug('Exception Line Number '+ex.getLineNumber());
            throw new AuraHandledException(ex.getTypeName() +' Occured Whlie downloading Template---> '+ex.getMessage());
        }
        //return null;
    }
    public static TemplateWrapperClass readXMLfile(Set<String> parentObjIdList,String templateName,Boolean isPolicyAmt,String policyId){
        System.debug('isPolicyAmt 2++++++++' +isPolicyAmt);
        TemplateWrapperClass templateWrapper = new TemplateWrapperClass();
        
        Map<String,String> roleRespMap = new Map<String,String>();
        AMT_Template_Role__mdt[] roleRespData = [SELECT Role__c,Responsibility__c FROM AMT_Template_Role__mdt];
        for (AMT_Template_Role__mdt roleResp : roleRespData) {
            if(roleResp != null && roleResp.Role__c != null){
                roleRespMap.put(roleResp.Role__c, roleResp.Responsibility__c); 
            }                               
        }
        List<Policy_Information__c> policyInfoData = new List<Policy_Information__c>();
        System.debug('isPolicyAmt'+isPolicyAmt);
        if(isPolicyAmt == true){
            System.debug('isPolicyAmt'+isPolicyAmt +'inside loop');
            system.debug('policyId---'+policyId);
            if(Pattern.matches('[a-zA-Z0-9]{18}', policyId) && !String.isEmpty(policyId)){
                policyId = String.escapeSingleQuotes(policyId);
                policyInfoData = [Select Name,Policy_Type__c, Policy_Status__c,Company__r.Toll_Free_number__c from Policy_Information__c where Id = :policyId WITH USER_MODE];  
            }
        }else{
            policyInfoData = [Select Name,Policy_Type__c, Policy_Status__c,Company__r.Toll_Free_number__c from Policy_Information__c where Company__c = :parentObjIdList WITH USER_MODE]; 
        } 
        System.debug('policyInfoData'+policyInfoData);
        String medicalPolicy = '';
        String fsa_Policy = '';
        String hra_Policy = '';
        String tollFreeNo = '';        
        for (Policy_Information__c policyInfo : policyInfoData) {
            if(policyInfo.Company__r.Toll_Free_number__c != null && tollFreeNo == ''){
                tollFreeNo = policyInfo.Company__r.Toll_Free_number__c;   
            }                
            if(policyInfo != null && policyInfo.Policy_Type__c != null){
                String[] policyTypes = policyInfo.Policy_Type__c.split(';');
                if(policyInfo.Policy_Status__c=='Active'){
                    for(String policyType : policyTypes){
                        if(policyType == 'Medical' ){
                            medicalPolicy = medicalPolicy + policyInfo.Name+';';
                        }else if(policyType == 'FSA'){
                            fsa_Policy = fsa_Policy + policyInfo.Name+';';
                        }else if(policyType == 'HRA'){
                            hra_Policy = hra_Policy + policyInfo.Name+';';
                        }
                    }
                }                       }        
        }
        medicalPolicy = medicalPolicy.removeEnd(';');
        fsa_Policy = fsa_Policy.removeEnd(';');
        hra_Policy = hra_Policy.removeEnd(';');
        System.debug('medicalPolicy'+medicalPolicy); 
        System.debug('fsa_Policy'+fsa_Policy); 
        System.debug('hra_Policy'+hra_Policy); 
        System.debug('Template Name'+templateName);                                             
        String parentObj = 'Account';
        templateWrapper.parentObj = parentObj;
        
        // Reading Templete
        String xmlTempleteString  = ReadAndGenerateXmlAMT.returnXMLbodyString(templateName);
        xmlTempleteString = xmlTempleteString.replaceAll('AMT_Template_Toll_Free_No', tollFreeNo);
        if(medicalPolicy != null && medicalPolicy.length() > 0){
            xmlTempleteString = xmlTempleteString.replaceAll('AMT_Service_Medical_Policy_No', medicalPolicy);
        }else{
            //xmlTempleteString = xmlTempleteString.replaceAll('<w:t>Medical Policy : AMT_Service_Medical_Policy_No</w:t>','');                
            Integer index = xmlTempleteString.indexOf('AMT_Service_Medical_Policy_No');         
            Integer startIndex = xmlTempleteString.lastIndexOf('<w:p ',index);
            Integer endIndex = xmlTempleteString.indexOf('</w:p>',index);        
            
            if (startIndex == -1) {
                startIndex = 0;
            }                                  
            
            endIndex = endIndex + 5;                    
            String rowToDelete = xmlTempleteString.substring(startIndex, endIndex); 
            xmlTempleteString = xmlTempleteString.replaceAll(rowToDelete,'');
        }
        if(fsa_Policy.length() == 0 && hra_Policy.length() == 0){
            Integer index = xmlTempleteString.indexOf('AMT_Service_FSA_Policy_No');         
            Integer startIndex = xmlTempleteString.lastIndexOf('<w:p ',index);
            Integer endIndex = xmlTempleteString.indexOf('</w:p>',index);        
            
            if (startIndex == -1) {
                startIndex = 0;
            }                                  
            
            endIndex = endIndex + 5;                    
            String rowToDelete = xmlTempleteString.substring(startIndex, endIndex); 
            xmlTempleteString = xmlTempleteString.replaceAll(rowToDelete,''); 
        }
        if(fsa_Policy != null && fsa_Policy.length() > 0){
            xmlTempleteString = xmlTempleteString.replaceAll('AMT_Service_FSA_Policy_No', fsa_Policy);                
        }else{
            xmlTempleteString = xmlTempleteString.replaceAll('<w:t>FSA Policy </w:t>','');
            xmlTempleteString = xmlTempleteString.replaceAll('<w:t>:AMT_Service_FSA_Policy_No</w:t>','');
            xmlTempleteString = xmlTempleteString.replaceAll('<w:t> / </w:t>','');                
        }
        if(hra_Policy != null && hra_Policy.length() > 0){
            xmlTempleteString = xmlTempleteString.replaceAll('AMT_Service_HRA_Policy_No', hra_Policy);
        }else{                
            xmlTempleteString = xmlTempleteString.replaceAll('<w:t> / </w:t>','');
            xmlTempleteString = xmlTempleteString.replaceAll('<w:t>HRA Policy</w:t>','');
            xmlTempleteString = xmlTempleteString.replaceAll('<w:t>: AMT_Service_HRA_Policy_No</w:t>','');                
        }           
        //String xmlTempleteString  = ReadAndGenerateXML.returnXMLbodyStringFromObj(templateObj.Id);          
        
        // Map Containes Object name as a key and ChildReleationShip Name as a Value
        //Map<String,String> parentObjchildReleationShipMap = ReadAndGenerateXML.getChildReleationShipNames(parentObj);        
        
        //Map Containes Object name as key and Set of Itags as a Value
        //System.debug('xmlTempleteString : '+xmlTempleteString);
        Map<String,Set<String>> objectItagesMap = ReadAndGenerateXmlAMT.getObjectMapWithItags(xmlTempleteString);        
        
        templateWrapper.objectItagesMap = objectItagesMap;
        
        System.debug('objectItagesMap : '+objectItagesMap);
        System.debug('parentObjIdList : '+parentObjIdList);                      
        
        SOQLqueryWrapper soqlQueryWrapper = ReadAndGenerateXmlAMT.returnFinalObjSOQLquery(objectItagesMap);
        System.debug('finalSOQLquery '+soqlQueryWrapper.finalSOQLquery);                                       
        System.debug('AdvanceMemberShip '+soqlQueryWrapper.advanceMemberShipSOQLquery);                                       
        System.debug('AggregatorCompaniesSoqlQueryForCVG '+soqlQueryWrapper.AggregatorCompaniesSoqlQueryForCVG);                                       
        
        Map<String,SobjectRecordWrapperClass> sobjectRecordMap = new Map<String,SobjectRecordWrapperClass>();    
        
        List<SobjectRecordWrapperClass> sobjectRecordWrapperClassList = new List<SobjectRecordWrapperClass>();
        //Map<String,List<String>> oppAccMap = new Map<String,List<String>>();
        //Set<String> accountIdsSet = new Set<String>();
        /* string aparentObjIdList ='0016A00000U4qvqQAB';
string Active='Active';
string query ='Select CM_SCE__r.UserRole.Name,CM_SCE__r.Name,CM_SCE__r.Phone,CM_SCE__r.Email,Name,RMO_Address__c,Id,(Select Contact_Role__c,Policy_Information_MultiChecKlist__c,First_Name__c,Last_Name__c,Phone__c,Email__c from Service_AMT__r WHERE External__c  = true AND (Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= Today) AND Contact_Role__c != null ORDER By Order__c ASC nulls last,Last_Name__c ASC),(Select Title,FirstName,LastName,Phone,Email from Contacts WHERE Status__c  =:Active AND AMT_Log__c = true) from Account Where Id = :aparentObjIdList';
*/
        List<SObject> parentSobjectListDetails = Database.query(soqlQueryWrapper.finalSOQLquery); 
        system.debug('parentSobjectListDetails--'+parentSobjectListDetails);
        for(SObject sobj : parentSobjectListDetails){
            System.debug('Account sobj '+sobj);                    
            SobjectRecordWrapperClass sobjectRecordWrapperClass = new SobjectRecordWrapperClass();
            sobjectRecordWrapperClass.parentSobject = sobj;
            sobjectRecordWrapperClassList.add(SobjectRecordWrapperClass);                 
        }
        
        if(sobjectRecordWrapperClassList.size() > 0){
            system.debug('parentsobject---'+sobjectRecordWrapperClassList[0].parentSobject); 
            SObject accSobj = sobjectRecordWrapperClassList[0].parentSobject;
            String spltySCEName = String.valueOf(accSobj.get('Specialty_SCE__c')); 
            if(spltySCEName != null){
                User userDetails = [select Name,Email, Phone from User where Id = :spltySCEName];
                templateWrapper.spltySCEDetails = userDetails;
            }
        }
        
        
        System.debug('sobjectRecordMap '+sobjectRecordMap);         
        templateWrapper.xmlTempleteString = xmlTempleteString;
        templateWrapper.sobjectRecordWrapperClassList = sobjectRecordWrapperClassList;        
        templateWrapper.CUSTOM_OBJECT_MAP = IConstantsTemplate.CUSTOM_OBJECT_MAP;        
        templateWrapper.OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        templateWrapper.roleRespMap = roleRespMap;
        System.debug('roleRespMap'+roleRespMap);
        
        return templateWrapper;       
    }
    
    @AuraEnabled
    public static string returnXMLbodyString(String templateName){    
        templateName =string.escapeSingleQuotes(templateName);
        templateName = templateName.replace(' ', '_');
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = :templateName];
        String xmlBodyString = sr.body.toString();
        return xmlBodyString;
    }
    
    @AuraEnabled
    public static Map<String,String> getChildReleationShipNames(String objectName){                      
        
        System.debug('objectName in child Relation'+objectName);           
        
        Map<String,String> parentObjchildReleationShipMap = new Map<String,String>();        
        Schema.DescribeSObjectResult objSchema = Schema.getGlobalDescribe().get(objectName).getDescribe();
        List<Schema.ChildRelationship> childList = objSchema.getChildRelationships();
        // String name = '';
        for(Schema.ChildRelationship child : childList){            
            
            // Schema.SObjectType objName = child.getChildSObject();            
            
            if(child.getRelationshipName() != null && child.getChildSObject() != null){ 
                System.debug('Child Object '+String.valueOf(child.getChildSObject())+'Relation : '+child.getRelationshipName());                
                if(!parentObjchildReleationShipMap.containsKey(String.valueOf(child.getChildSObject())))
                    parentObjchildReleationShipMap.put(String.valueOf(child.getChildSObject()), child.getRelationshipName());
            }
        }        
        // System.debug('childReleationShipMap : '+parentObjchildReleationShipMap.size());
        return parentObjchildReleationShipMap;
    }
    
    public static SOQLqueryWrapper returnFinalObjSOQLquery(Map<String,Set<String>> objectItagesMap){
        system.debug('objectItagesMap@@@'+objectItagesMap);
        List<String> childQueryString = new List<String>();                
        //String parentSobject = parentObj.equals('AdvanceMemberShip')?'Account':parentObj;
        String parentSobject = 'Account';
        String finalSOQLquery = 'Select parentItagsSet,childObjectsQuery from '+parentSobject+' Where Id = :parentObjIdList';                      
        Map<String,Set<String>> finalChildFieldsMap = new Map<String,Set<String>>();
        Map<String,String> CUSTOM_OBJECT_MAP = IConstantsTemplate.CUSTOM_OBJECT_MAP;
        
        for (String objectName : objectItagesMap.keySet()) {
            if(objectName.equals('Account')){
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
        system.debug('finalChildFieldsMap.keySet()@@@'+finalChildFieldsMap.keySet()+'finalChildFieldsMap@@@'+finalChildFieldsMap);
        
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
            
            Map<String,String> ORDER_BY_RECORDS = IConstantsTemplate.ORDER_BY_RECORDS;
            String orderByRecords = '';
            if(ORDER_BY_RECORDS.containsKey(childReleationshipName)){
                orderByRecords = ORDER_BY_RECORDS.get(childReleationshipName);
            }
            
            String queryObjectString = '(Select itagSet from '+childReleationshipName+condition+orderByRecords+')';
            
            String queryItagString = '';            
            Set<String> itagSet = finalChildFieldsMap.get(objectName);                        
            
            for(String itag : itagSet){
                queryItagString += itag+',';
            }
            queryItagString = queryItagString.removeEnd(',');
            queryObjectString = queryObjectString.replace('itagSet', queryItagString);
            
            childQueryString.add(queryObjectString);  
        }
        
        String childObjectsQuery = '';
        for(String childQuery : childQueryString){
            childObjectsQuery += childQuery+',';
        }
        childObjectsQuery = childObjectsQuery.removeEnd(',');
        finalSOQLquery = finalSOQLquery.replace('childObjectsQuery', childObjectsQuery); 
        System.debug('childObjectsQuery'+childObjectsQuery);
        soqlQueryWrapper.finalSOQLquery = finalSOQLquery;        
        System.debug(' soqlQueryWrapper.finalSOQLquery'+finalSOQLquery);
        return soqlQueryWrapper;
    }
    
    public static Map<String,Set<String>> getObjectMapWithItags(String xmlBodyString){                       
        
        Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        System.debug('matcher '+m);
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        Map<String, String> contactRoleLabelMap = new Map<String, String>();
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
                if(objectItagesMap.containsKey('Service_AMT__r')){
                    Set<String> itagSet1 = objectItagesMap.get('Service_AMT__r');
                    itagSet1.add('Policy_Information_MultiChecKlist__c');
                    objectItagesMap.put('Service_AMT__r',itagSet1);
                }
            }                         
            
        }                     
        if(!objectItagesMap.containsKey('Account')){
            Set<String> itagSet = new Set<String>();
            itagSet.add('Id');              
            objectItagesMap.put('Account',itagSet);
        }
        
        return objectItagesMap;
    }   
    //
  public static String getContactRoleLabel(String apiName) {
    Schema.DescribeFieldResult fieldResult = Service_AMT__c.Contact_Role__c.getDescribe();
    List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
    
    for (Schema.PicklistEntry entry : picklistValues) {
        if (entry.getValue() == apiName) {
            return entry.getLabel(); 
        }
    }
    return apiName; 
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
    public class TemplateWrapperClass {    
        @AuraEnabled
        public string xmlTempleteString { get;set; }               
        
        @AuraEnabled
        public Map<String,String> roleRespMap = new Map<String,String>();
        
        @AuraEnabled
        public string parentObj { get;set; }   
        
        @AuraEnabled
        public Map<String,Set<String>> objectItagesMap { get;set; } 
        
        @AuraEnabled
        public List<ReadAndGenerateXmlAMT.SobjectRecordWrapperClass> sobjectRecordWrapperClassList { get;set; } 
        
        @AuraEnabled
        public Map<String,String> CUSTOM_OBJECT_MAP { get;set; } 
        
        @AuraEnabled
        public Map<String,String> OBJECT_FILTER_RECORDS { get;set; }
        
        @AuraEnabled
        public User spltySCEDetails { get;set; }
        
    }
    
}