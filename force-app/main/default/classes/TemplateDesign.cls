/****************************************************************** ***** 
Name: TemplateDesign 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Class for Templates Lightning Component.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR                 DATE                DETAIL                      FEATURES/CSR/TTP  
1.0 -        Abhishek Kumar         19/12/2017          INITIAL DEVELOPMENT           
2.0 -
*********************************************************************
*/
public class TemplateDesign {
    
    @AuraEnabled
    public static TemplateData fetchDefaultTemplateContents(){
        TemplateData tData = new TemplateData();
        
        try{
            if(schema.sobjecttype.Template_Design__c.isQueryable() && schema.sobjecttype.Template_Design__c.isAccessible()){
                tData.templateList = [select Name, Template_Type__c from Template_Design__c where Available_for_User__c = true ORDER BY Template_Type__c ASC];
                
                Map<String, String> templateObjMapping = new Map<String, String>();
                templateObjMapping.put('Account', 'Account');
                templateObjMapping.put('Contact', 'Contact');
                templateObjMapping.put('Consultant', 'Contact');
                templateObjMapping.put('Membership Activity', 'Opportunity');
                templateObjMapping.put('Adv Membership Activity', 'Opportunity');
                
                String defaultOption = 'Select Template Design';
                List<String> templateOptions = new List<String>();
                
                //tData.templateOptions.add();
                for(Template_Design__c tDesign : tData.templateList){
                    templateOptions.add(tDesign.Name);
                    tData.templateDetails.put(tDesign.Name, templateObjMapping.get(tDesign.Template_Type__c));
                }
                templateOptions.sort();
                tData.templateOptions.add(defaultOption);
                tData.templateOptions.addAll(templateOptions);
            }else{
                throw new NoAccessException();
            }
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Template_Design__c object from SF in fetchDefaultTemplateContents() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in fetchDefaultTemplateContents() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'fetchDefaultTemplateContents() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in fetchDefaultTemplateContents() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        return tData;
    }
    
    @AuraEnabled
    public static TemplateWrapperClass getTemplateInXML(List<String> selectedIds,String templateName,Template_Design__c templateObj){
        try{
            System.debug('templateName '+templateName);
            System.debug('templateObj '+templateObj);
            Set<String> parentObjIdList = new Set<String>();      
            parentObjIdList.addAll(selectedIds);            
            return ReadAndGenerateXML.readXMLfile(parentObjIdList,templateName,templateObj);
        }catch(AuraHandledException ex){
            System.debug('AuraHandledException '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured Whlie downloading Template---> '+ex.getMessage());
        }catch(Exception ex){
            System.debug('Exception '+ex.getMessage());
            System.debug('Exception Line Number '+ex.getLineNumber());
            throw new AuraHandledException(ex.getTypeName() +' Occured Whlie downloading Template---> '+ex.getMessage());
        }
        return null;
    }
    
    @AuraEnabled
    public static String[] getPickListValues(String fieldApiName, String objName){
        System.debug('Input parameters -- >> objName--'+objName+' ,fieldApiName -- '+fieldApiName);
        String[] pickListVals = new List<String>();
        Schema.sObjectType objType = null;
        
        try{
            if(fieldApiName != null && objName != null){
                if(objName.equalsIgnoreCase('Account')){
                    objType = Account.getSObjectType();    
                }
                else if(objName.equalsIgnoreCase('Contact')){
                    objType = Contact.getSObjectType();
                }else if(objName.equalsIgnoreCase('Opportunity')){
                    objType = Opportunity.getSObjectType();
                }
                
                Schema.DescribeSObjectResult objDescribe = objType.getDescribe();   
                Map<String, Schema.SObjectField> fieldMap = objDescribe.fields.getMap(); 
                
                list<Schema.PicklistEntry> values = fieldMap.get(fieldApiName).getDescribe().getPickListValues();
                
                for (Schema.PicklistEntry a : values){
                    System.debug('a.getValue()-->>'+a.getValue());
                    pickListVals.add(a.getValue());
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Null Pointer Exception occured in getPickListValues() '+'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        System.debug('Output Parameters - > pickListVals- >'+pickListVals);
        return pickListVals;
    }
    
    @AuraEnabled
    public static MetaDataValues getObjRelatedFields(String objName, String templateName){
        
        MetaDataValues mdVals = new MetaDataValues();
        
        Map<String, String> fieldMapping = new Map<String, String>();
        fieldMapping.put('ID', 'text#Equal to');
        fieldMapping.put('EMAIL', 'text#Equal to,Contains,Begins with');
        fieldMapping.put('BOOLEAN', 'boolean#Is checked,Is not checked');
        fieldMapping.put('REFERENCE', 'search#Equal to');
        fieldMapping.put('STRING', 'text#Equal to,Contains,Begins with');
        fieldMapping.put('PICKLIST', 'dropdown#Equal to');
        fieldMapping.put('TEXTAREA', 'text#Equal to,Contains,Begins with');
        fieldMapping.put('DOUBLE', 'number#Equal to,Greater than,Less than');
        fieldMapping.put('URL', 'text#Equal to');
        fieldMapping.put('ADDRESS', 'text#Equal to,Contains,Begins with');
        fieldMapping.put('PHONE', 'text#Equal to');
        fieldMapping.put('INTEGER', 'number#Equal to,Greater than,Less than');
        fieldMapping.put('DATE', 'date#Equal to,On or before,On or after');
        fieldMapping.put('DATETIME', 'date#Equal to,On or before,On or after');
        fieldMapping.put('CURRENCY', 'number#Equal to,Greater than,Less than');
        fieldMapping.put('MULTIPICKLIST', 'search#Contains at least one value,Contains all values');
        fieldMapping.put('PERCENT', 'number#Equal to,Greater than,Less than');
        
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Schema.SObjectType sObjectSchema = schemaMap.get(objName);
        Map<String, Schema.SObjectField> fieldMap = sObjectSchema.getDescribe().fields.getMap();
        Set<String> fieldDataSet = new Set<String>();
        
        try{
            if(objName != null && templateName != null){
                if(schema.sobjecttype.Template_Design__c.isQueryable() && schema.sobjecttype.Template_Design__c.isAccessible()){
                    mdVals.templateDetails = [select Name, Template_Type__c from Template_Design__c where Name=:templateName];
                    mdVals.fieldLabels.add('');
                    
                    for(String fieldName : fieldMap.keySet()){
                        List<String> concatFields = new List<String>();
                        //System.debug('API Name-->>'+fieldMap.get(fieldName));    
                        String fieldLabel = fieldMap.get(fieldName).getDescribe().getLabel();
                        if(!fieldLabel.startsWithIgnoreCase('zz') && !fieldLabel.startsWithIgnoreCase('copycheckbox') ){
                            //System.debug('fieldLabel-->>'+fieldLabel);
                            Schema.DisplayType fielddataType = fieldMap.get(fieldName).getDescribe().getType();
                            if(!String.valueOf(fielddataType).equalsIgnoreCase('REFERENCE') && !String.valueOf(fielddataType).equalsIgnoreCase('TEXTAREA')){
                                fieldDataSet.add(String.valueOf(fielddataType));
                                //system.debug('field type--->>'+String.valueOf(fielddataType));
                                concatFields.add(String.valueOf(fieldMap.get(fieldName)));
                                //concatFields.add(String.valueOf(fielddataType));
                                //System.debug('fieldMapping.get(String.valueOf(fielddataType))-->>'+fieldMapping.get(String.valueOf(fielddataType)));
                                concatFields.add(fieldMapping.get(String.valueOf(fielddataType)));
                                mdVals.mapOfMetaData.put(fieldLabel, concatFields);
                                mdVals.fieldLabels.add(fieldLabel);  
                            }
                        }
                        
                    }
                    mdVals.fieldLabels.sort();
                    system.debug('mdVals@@@'+mdVals);
                    
                }else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Null Pointer Exception Occured in getObjRelatedFields() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Template_Design__c object from SF in getObjRelatedFields() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getObjRelatedFields() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Template_Design__c object from SF in '+
                         'getObjRelatedFields() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getObjRelatedFields() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        return mdVals;
    }
    
    @AuraEnabled
    public static AccountSearchResults searchForRefAccounts(String mapFields, Decimal pageNumber, String objectName, Decimal pageMin, Decimal pageMax, String columnName, String sortType){
        
        System.debug('Input Parameters -->>mapFields-->>'+mapFields+' , pageNumber- '+pageNumber+' , objectName- '+objectName+' , columnName- '+columnName+' , sortType- '+sortType);
        System.debug('Input paramters -> pageMin->'+pageMin+' ,pageMax -> '+pageMax);
        
        Integer pageSize = 15;
        Integer offset = ((Integer)pageNumber - 1) * pageSize; 
        
        final String globalLiteral = ' AND ';
        final String orStr = ' OR ';
        final String andStr = ' AND ';
        final String equalSign = '=';
        final String lessSign ='<';
        final String graterSign ='>';
        final String notEqualSign = '!=';
        final String likekey = ' LIKE ';
        final String perSign = '%';
        final String quotes = '\'';
        final String equalToStr = 'Equal to';
        final String notEqualTo = 'Not equal to';
        final String onOrBefore = 'On or before';
        final String onOrAfter = 'On or after';
        final String isChecked = 'Is checked';
        final String isNotChecked = 'Is not checked';
        final String contains1Val = 'Contains at least one value';
        final String containsAll = 'Contains all values';
        final String beginsWith = 'Begins with';
        final String lessThan ='Less than';
        final String greaterThan = 'Greater than';
        final String containsAny = 'Contains any';
        final String contains = 'Contains';
        final String trueval = 'true';
        final String falseVal = 'false';
        final String includesStr = ' includes ';
        
        AccountSearchResults acResults = new AccountSearchResults();
        
        try{
            if(mapFields != null){
                if(schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.Account.isAccessible()){
                    mapFields = mapFields.removeStart('[');
                    mapFields = mapFields.removeEnd(']');
                    
                    List<String> k = mapFields.split('},');
                    System.debug('k-->>'+k);
                    System.debug(k.size());
                    
                    for(Integer i = 0; i<k.size(); i++){
                        if(i != k.size()-1){
                            k[i] = k[i]+'}';
                        }
                    }
                    
                    List<FilterQueries> filtVals = new List<FilterQueries>();
                    
                    for(String s : k){
                        FilterQueries l = (FilterQueries)JSON.deserialize(s, FilterQueries.class);
                        filtVals.add(l);
                    }
                    
                    String query1 = '';
                    System.debug('filtVals-->>'+filtVals.get(0).fieldAPIName);
                    for(Integer y = 0; y < filtVals.size(); y++){
                        System.debug(filtVals[y].fieldAPIName);
                        System.debug(filtVals[y].fieldConditions);
                        String apiName = filtVals[y].fieldAPIName.split('#')[0];
                        System.debug('apiName-->>'+apiName);
                        String dataType = filtVals[y].fieldAPIName.split('#')[1];
                        System.debug('dataType-->>'+dataType);
                        String str = filtVals[y].fieldConditions;
                        List<String> str1 = str.split('#');
                        String condition = str1[0];
                        String fil = '';
                        
                        if(str1.size() > 1){
                            fil = str1[1];
                        }
                        
                        if(dataType.equalsIgnoreCase('text')){
                            condition = condition.trim();
                            
                            if(apiName.equalsIgnoreCase('CM_SCE__c')){
                                apiName ='CM_SCE__r.Name';
                            }
                            
                            if(condition.equalsIgnoreCase(equalToStr)){
                                query1 = query1+apiName+equalSign+quotes+fil+quotes;   
                            }else if(condition.equalsIgnoreCase(notEqualTo)){
                                query1 = query1+apiName+notEqualSign+quotes+fil+quotes;   
                            }else if(condition.equalsIgnoreCase(beginsWith)){
                                query1 = query1+apiName+likekey+quotes+fil+perSign+quotes;   
                            }else if(condition.equalsIgnoreCase(contains)){
                                query1 = query1+apiName+likekey+quotes+perSign+fil+perSign+quotes;
                            }
                        }
                        
                        else if(dataType.equalsIgnoreCase('date')){
                            Date dateVal = date.valueOf(fil);
                            System.debug('condition-->>'+condition);
                            condition = condition.trim();
                            
                            if(condition.equalsIgnoreCase(equalToStr)){
                                String equalDate = '=:dateVal';                  
                                query1 = query1+apiName+equalDate;   
                            }else if(condition.equalsIgnoreCase(notEqualTo)){
                                String notEqualDate = '!=:dateVal';
                                query1 = query1+apiName+notEqualDate;   
                            }else if(condition.equalsIgnoreCase(onOrBefore)){
                                String onOrBef = '<=:dateVal';
                                query1 = query1+apiName+onOrBef;   
                            }else if(condition.equalsIgnoreCase(onOrAfter)){
                                String onOrAft = '>=:dateVal';
                                query1 = query1+apiName+onOrAft;
                            }
                        }
                        
                        else if(dataType.equalsIgnoreCase('search')){
                            query1 = query1+'(';
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(',') > -1 ){
                                filterVals = fil.split(',');
                            }
                            System.debug('filterVals'+filterVals);
                            
                            if(apiName.equalsIgnoreCase('Type')){
                                apiName = 'RecordType.Name';
                            }
                            
                            if(condition.equalsIgnoreCase(equalToStr)){
                                if(filterVals.size() > 0){
                                    for(Integer i = 0; i<filterVals.size(); i++){
                                        if(i == filterVals.size()-1){
                                            query1 = query1+apiName+equalSign+quotes+filterVals[i]+quotes;
                                        }else{
                                            query1 = query1+apiName+equalSign+quotes+filterVals[i]+quotes+orStr;
                                        }
                                    }
                                }   
                            }
                            else if(condition.equalsIgnoreCase(contains1Val)){
                                String s = '';
                                for(Integer ii = 0; ii < filterVals.size(); ii++){
                                    if(ii == filterVals.size()-1){
                                        s += '\''+filterVals[ii]+'\'';
                                    }else{
                                        s += '\''+filterVals[ii]+'\',';
                                    }
                                }
                                query1 += apiName+' includes('+ s +')';
                            }
                            else if(condition.equalsIgnoreCase(containsAll)){
                                String s = '\'';
                                for(Integer ii = 0; ii < filterVals.size(); ii++){
                                    if(ii == filterVals.size()-1){
                                        s += filterVals[ii];
                                    }else{
                                        s += filterVals[ii]+';';
                                    }
                                }
                                s += '\'';
                                query1 += apiName+' includes('+ s +')';
                            }
                            query1 = query1+')';
                        }
                        
                        else if(dataType.equalsIgnoreCase('boolean')){
                            condition = condition.trim();
                            if(condition.equalsIgnoreCase(isChecked)){
                                query1 = query1+apiName+equalSign+trueval;
                            }else if(condition.equalsIgnoreCase(isNotChecked)){
                                query1 = query1+apiName+equalSign+falseVal;
                            }
                        }
                        
                        else if(dataType.equalsIgnoreCase('dropdown')){
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(';') > -1 ){
                                filterVals = fil.split(';');
                            }
                            System.debug('filterVals'+filterVals);
                            
                            if(filterVals.size() > 0){
                                for(Integer i = 0; i<filterVals.size(); i++){
                                    if(i == filterVals.size()-1){
                                        query1 = query1+apiName+equalSign+quotes+filterVals[i]+quotes;
                                    }else{
                                        query1 = query1+apiName+equalSign+quotes+filterVals[i]+quotes+orStr;
                                    }
                                }
                            }
                        }
                        
                        else if(dataType.equalsIgnoreCase('number')){
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(';') > -1 ){
                                filterVals = fil.split(';');
                            }
                            System.debug('filterVals'+filterVals);
                            if(condition.equalsIgnoreCase(equalToStr)){
                                if(filterVals.size() > 0){
                                    for(Integer i = 0; i<filterVals.size(); i++){
                                        if(i == filterVals.size()-1){
                                            query1 = query1+apiName+equalSign+Decimal.valueOf(filterVals[i]);
                                        }else{
                                            query1 = query1+apiName+equalSign+Decimal.valueOf(filterVals[i])+orStr;
                                        }
                                    }
                                }
                            }else if(condition.equalsIgnoreCase(greaterThan)){
                                if(filterVals.size() > 0){
                                    for(Integer i = 0; i<filterVals.size(); i++){
                                        if(i == filterVals.size()-1){
                                            query1 = query1+apiName+graterSign+Decimal.valueOf(filterVals[i]);
                                        }else{
                                            query1 = query1+apiName+graterSign+Decimal.valueOf(filterVals[i])+orStr;
                                        }
                                    }
                                }
                            }else if(condition.equalsIgnoreCase(lessThan)){
                                if(filterVals.size() > 0){
                                    for(Integer i = 0; i<filterVals.size(); i++){
                                        if(i == filterVals.size()-1){
                                            query1 = query1+apiName+lessSign+Decimal.valueOf(filterVals[i]);
                                        }else{
                                            query1 = query1+apiName+lessSign+Decimal.valueOf(filterVals[i])+orStr;
                                        }
                                    }
                                }
                            }
                        }
                        
                        if(y == filtVals.size()-1){
                            query1 = query1;
                        }else{
                            query1 = query1+globalLiteral;
                        }
                        
                    }
                    
                    System.debug('query1 -->>'+query1);
                    
                    String query = '';
                    String countQuery = '';
                    
                    if(objectName.equalsIgnoreCase('Account')){
                        System.debug('inside account');
                        query = 'SELECT Name, Type, RecordType.Name FROM Account WHERE '+query1+' ORDER BY '+columnName+' '+sortType+' LIMIT :pageSize OFFSET :offset';
                        countQuery = 'SELECT count() FROM Account WHERE '+query1;
                    }
                    else if(objectName.equalsIgnoreCase('Contact')){
                        System.debug('inside contact');
                        query = 'SELECT Name, Account.Name FROM Contact WHERE RecordType.Name != \'Consultant Contact\' AND '+query1+' ORDER BY '+columnName+' '+sortType+' LIMIT :pageSize OFFSET :offset';
                        countQuery = 'SELECT count() FROM Contact WHERE RecordType.Name != \'Consultant Contact\' AND '+query1;
                    }
                    else if(objectName.equalsIgnoreCase('Opportunity')){
                        System.debug('inside MA');
                        query = 'SELECT Name, Account.Name FROM Opportunity WHERE '+query1+' ORDER BY '+columnName+' '+sortType+' LIMIT :pageSize OFFSET :offset';
                        countQuery = 'SELECT count() FROM Opportunity WHERE '+query1;
                    }
                    
                    acResults.total = Database.countQuery(countQuery);
                    System.debug('query-->>'+query);
                    acResults.refsearchedAccount = Database.query(query);
                    acResults.page = (Integer)pageNumber;
                    acResults.pageSize = pageSize;
                    
                    System.debug('pageNumber-->'+pageNumber);
                    
                    if(acResults.refsearchedAccount.size() < offset){
                        acResults.pageMax = acResults.total;
                    }else{
                        acResults.pageMax = (acResults.page * acResults.pageSize);
                    }
                    
                    if(acResults.page == 1){
                        acResults.pageMin = acResults.page;    
                    }else{
                        //acResults.pageMin = (Integer)pageMin+pageSize;
                        //acResults.pageMin = ((acResults.page * acResults.pageSize)-acResults.pageSize)+1;
                        //acResults.pageMin = (Integer)pageMax+1;
                        //acResults.pageMin = (acResults.pageSize+1);\
                        acResults.pageMin = (acResults.pageMax - pageSize)+1;
                    }
                    
                    acResults.pageMax = pageSize;
                    
                    System.debug('Ouput Parameters -> Returned Results -'+acResults.refsearchedAccount);
                    System.debug('Output paramters -> pageMin->'+acResults.pageMin+' ,pageMax -> '+acResults.pageMax);
                }else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Null Pointer Exception Occured in searchForRefAccounts() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in searchForRefAccounts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in searchForRefAccounts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'searchForRefAccounts() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in searchForRefAccounts() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        return acResults;
    }
    
    
    @AuraEnabled
    public static AccountSearchResults searchForNPSTemplate(Map<String,List<String>> filterMap, Decimal pageNumber,Decimal pageMin,Decimal pageMax,String columnName, String sortType){
        System.debug('Input paramters -> pageMin->'+pageMin+' ,pageMax -> '+pageMax);
        Integer pageSize = 15;
        Integer offset = ((Integer)pageNumber - 1) * pageSize; 
        AccountSearchResults acResults = new AccountSearchResults();
        final String orStr = ' OR ';
        final String andStr = ' AND ';
        final String equalSign = '=';
        final String lessSign ='<';
        final String graterSign ='>';
        final String notEqualSign = '!=';
        final String likekey = ' LIKE ';
        final String perSign = '%';
        final String quotes = '\'';
        final String equalToStr = 'Equals to';
        final String notEqualTo = 'Not equal to';
        final String onOrBefore = 'On or before';
        final String onOrAfter = 'On or after';
        final String isChecked = 'Is checked';
        final String isNotChecked = 'Is not checked';
        final String contains1Val = 'Contains at least one value';
        final String containsAll = 'Contains all values';
        final String beginsWith = 'Begins with';
        final String lessThan ='Less than';
        final String greaterThan = 'Greater than';
        final String containsAny = 'Contains any';
        final String contains = 'Contains';
        final String trueval = 'true';
        final String falseVal = 'false';
        final String includesStr = ' includes ';
        try{
            String query = '';
            String countQuery = '';
            String filter = '';
            Date dateVal = null;
            Schema.sObjectType sobject_type = Action_Service_Plan__c.getSObjectType();
            Map<String, Schema.SObjectField> fieldMap = sobject_type.getDescribe().fields.getMap();
            for(String fltrMap:filterMap.keySet()){
                String condition = '';
                String dateFilterCriteria = '';
                String stringFilterCriteria = '';
                System.debug('condition-->>'+filterMap.get(fltrMap)[1]);
                condition = filterMap.get(fltrMap)[1].trim();
                System.debug('fltrMap'+fltrMap);
                if(!fltrMap.contains('__r.')){
                    Schema.DisplayType fieldDataType =  fieldMap.get(fltrMap).getDescribe().getType();
                    System.debug('fieldDataType'+fieldDataType);
                    System.debug(filterMap.get(fltrMap)[0]);
                    if(fieldDataType == Schema.DisplayType.DATE){
                        if(filterMap.get(fltrMap)[0] != null && filterMap.get(fltrMap)[0] != ''){
                            dateVal = date.valueOf(filterMap.get(fltrMap)[0]);
                        }
                        System.debug('condition.equalsIgnoreCase(equalToStr)'+condition.equalsIgnoreCase(equalToStr));
                        if(condition.equalsIgnoreCase(equalToStr)){
                            dateFilterCriteria = '=:dateVal';                     
                        }else if(condition.equalsIgnoreCase(notEqualTo)){
                            dateFilterCriteria = '!=:dateVal';  
                        }else if(condition.equalsIgnoreCase(onOrBefore)){
                            dateFilterCriteria = '<=:dateVal';  
                        }else if(condition.equalsIgnoreCase(onOrAfter)){
                            dateFilterCriteria = '>=:dateVal';
                        }
                    }else if(fieldDataType == Schema.DisplayType.STRING){
                        if(condition.equalsIgnoreCase(equalToStr)){ 
                            stringFilterCriteria = ' = '+'\''+filterMap.get(fltrMap)[0]+'\'';
                        }else if(condition.equalsIgnoreCase(notEqualTo)){
                            stringFilterCriteria = ' != '+'\''+filterMap.get(fltrMap)[0]+'\'';
                        }else if(condition.equalsIgnoreCase(beginsWith)){
                            stringFilterCriteria = ' Like \''+filterMap.get(fltrMap)[0]+'%\'';
                        }else if(condition.equalsIgnoreCase(contains)){
                            stringFilterCriteria = ' Like \'%'+filterMap.get(fltrMap)[0]+'%\'';
                        }else{
                            stringFilterCriteria = ' Like \''+filterMap.get(fltrMap)[0]+'%\'';
                        }
                    }else if(fieldDataType == Schema.DisplayType.PICKLIST){
                            stringFilterCriteria = ' = '+'\''+filterMap.get(fltrMap)[0]+'\'';
                    }
                }else{
                    if(condition.equalsIgnoreCase(equalToStr)){ 
                        stringFilterCriteria = ' = '+'\''+filterMap.get(fltrMap)[0]+'\'';
                    }else if(condition.equalsIgnoreCase(notEqualTo)){
                        stringFilterCriteria = ' != '+'\''+filterMap.get(fltrMap)[0]+'\'';
                    }else if(condition.equalsIgnoreCase(beginsWith)){
                        stringFilterCriteria = ' Like \''+filterMap.get(fltrMap)[0]+'%\'';
                    }else if(condition.equalsIgnoreCase(contains)){
                        stringFilterCriteria = ' Like \'%'+filterMap.get(fltrMap)[0]+'%\'';
                    }else{
                        stringFilterCriteria = ' Like \''+filterMap.get(fltrMap)[0]+'%\'';
                    }
                }
                System.debug('stringFilterCriteria'+stringFilterCriteria);
                System.debug('dateFilterCriteria'+dateFilterCriteria);
                if(filter == ''){
                    if(fltrMap.contains('Target_completion__c') || fltrMap.contains('Date_Completed__c')){
                        filter += fltrMap+dateFilterCriteria;
                    }else{
                        filter += fltrMap+stringFilterCriteria;
                    } 
                }else{
                    if(fltrMap.contains('Target_completion__c') || fltrMap.contains('Date_Completed__c')){
                        filter += ' AND '+fltrMap+dateFilterCriteria;
                    }else{
                        filter += ' AND '+fltrMap+stringFilterCriteria;
                    }
                }
            } 
            System.debug('filter'+filter);
            query = 'SELECT Name,Company_Name__r.Name FROM Action_Service_Plan__c WHERE '+filter+' ORDER BY '+columnName+' '+sortType+' LIMIT :pageSize OFFSET :offset';
            countQuery = 'SELECT count() FROM Action_Service_Plan__c WHERE '+filter;
            System.debug('query-->>'+query);
            acResults.total = Database.countQuery(countQuery);
            acResults.refsearchedAccount = Database.query(query);
            acResults.page = (Integer)pageNumber;
            acResults.pageSize = pageSize;
            
            System.debug('pageNumber-->'+pageNumber);
            
            if(acResults.refsearchedAccount.size() < offset){
                acResults.pageMax = acResults.total;
            }else{
                acResults.pageMax = (acResults.page * acResults.pageSize);
            }
            
            if(acResults.page == 1){
                acResults.pageMin = acResults.page;    
            }else{
                acResults.pageMin = (acResults.pageMax - pageSize)+1;
            }
            
            acResults.pageMax = pageSize;
            
            System.debug('Ouput Parameters -> Returned Results -'+acResults.refsearchedAccount);
            System.debug('Output paramters -> pageMin->'+acResults.pageMin+' ,pageMax -> '+acResults.pageMax);
        }catch(NullPointerException nullPointerEx) {
            System.debug('Null Pointer Exception Occured in searchForRefAccounts() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in searchForRefAccounts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in searchForRefAccounts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'searchForRefAccounts() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in searchForRefAccounts() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        return acResults;
    }
    
    @AuraEnabled
    public static NPSActionWrapperList getNPSFields(List<String> objectFields){
        Map<String,NPSActionFieldsWrapper> NPSWrapMap = new Map<String,NPSActionFieldsWrapper>();
        set<String> fieldAPIList = new set<String>();
        NPSActionWrapperList NPSWrapList = new NPSActionWrapperList();
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Schema.SObjectType NPSSchema = schemaMap.get('Action_Service_Plan__c');
        fieldAPIList.add('');
        Map<String, Schema.SObjectField> fieldMap = NPSSchema.getDescribe().fields.getMap(); 
        for(Schema.SObjectField sfield : fieldMap.Values()){
            List<String> option = new List<String>();
            if(sfield.getDescribe().getType() != Schema.DisplayType.REFERENCE && sfield.getDescribe().getType() != Schema.DisplayType.ID && sfield.getDescribe().getType() != Schema.DisplayType.TEXTAREA && sfield.getDescribe().getType() != Schema.DisplayType.BOOLEAN){
                NPSActionFieldsWrapper NpsPickListWrapper = new NPSActionFieldsWrapper();
                schema.describefieldresult dfield = sfield.getDescribe();
                NpsPickListWrapper.fieldLabel = dfield.getLabel();
                NpsPickListWrapper.fieldAPIName = dfield.getname();
                NpsPickListWrapper.fieldType = String.valueOf(dfield.getType());
                if(sfield.getDescribe().getType() == Schema.DisplayType.PICKLIST){
                    List<Schema.PicklistEntry> pick_list_values = dfield.getPickListValues();
                    option.add('');
                    for (Schema.PicklistEntry a : pick_list_values) {
                        option.add(a.getValue()); //add the value and label to our final list
                    }
                    NpsPickListWrapper.PickListOptions = option;
                }else{
                    NpsPickListWrapper.PickListOptions = null;
                } 
                if(sfield.getDescribe().getType() == Schema.DisplayType.DATE || sfield.getDescribe().getType() == Schema.DisplayType.DATETIME){
                    if(NpsPickListWrapper.fieldAPIName.contains('Date_Completed__c') || NpsPickListWrapper.fieldAPIName.contains('Target_completion__c')){
                        //NpsPickListWrapperList.add(NpsPickListWrapper);
                        NPSWrapMap.put(NpsPickListWrapper.fieldLabel,NpsPickListWrapper);
                        fieldAPIList.add(NpsPickListWrapper.fieldLabel);
                    }
                }else{
                    //NpsPickListWrapperList.add(NpsPickListWrapper);
                    NPSWrapMap.put(NpsPickListWrapper.fieldLabel,NpsPickListWrapper);
                    fieldAPIList.add(NpsPickListWrapper.fieldLabel);
                } 
            }
        }
        for(String refFields:objectFields){
            NPSActionFieldsWrapper NpsPickListWrapper = new NPSActionFieldsWrapper();
            String[] splitField = refFields.split('_');
            if(refFields.contains('Owner')){
                NpsPickListWrapper.fieldLabel = splitField[0];
            }else{
                NpsPickListWrapper.fieldLabel = splitField[0]+' '+splitField[1];
            }
            NpsPickListWrapper.fieldAPIName = refFields;
            NpsPickListWrapper.fieldType = 'STRING';
            NpsPickListWrapper.PickListOptions = null;
            //NpsPickListWrapperList.add(NpsPickListWrapper);
            NPSWrapMap.put(NpsPickListWrapper.fieldLabel,NpsPickListWrapper);
            fieldAPIList.add(NpsPickListWrapper.fieldLabel);
        }
        NPSWrapList.NPSActionFieldsWrapMap = NPSWrapMap;
        NPSWrapList.fieldAPINameList = fieldAPIList;
        return NPSWrapList;
    }
    
    
    public class AccountSearchResults {
        
        @AuraEnabled
        public List<sObject> refsearchedAccount{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public Integer pageMin { get;set; }
        
        @AuraEnabled
        public Integer pageMax { get;set; }
        
    }
    
    public class MetaDataValues {
        
        public MetaDataValues(){
            fieldLabels = new List<String>();
            mapOfMetaData = new Map<String, String[]>();
        }
        
        @AuraEnabled
        public Map<String, String[]> mapOfMetaData { get;set; }
        
        @AuraEnabled
        public List<String> fieldLabels { get;set; } 
        
        @AuraEnabled
        public Template_Design__c templateDetails { get;set; }
        
    }
    
    public class TemplateData{
        public TemplateData(){
            templateOptions = new List<String>();
            templateFieldsData = new Map<String, String[]>();
            templateDetails = new Map<String, String>();
            pickListVals = new List<String[]>();
        }
        
        @AuraEnabled
        public Map<String, String[]> templateFieldsData { get;set; }
        
        @AuraEnabled
        public Map<String, String> templateDetails { get;set; }
        
        @AuraEnabled
        public List<String> templateOptions { get;set; } 
        
        @AuraEnabled
        public List<Template_Design__c> templateList { get;set; }
        
        @AuraEnabled
        public List<String[]> pickListVals { get;set;}
    }
    
    public class FilterQueries{
        
        public FilterQueries(){
            fieldAPIName = '';
            fieldConditions = '';
        }
        
        
        @AuraEnabled
        String fieldAPIName { get; set; }
        
        @AuraEnabled
        String fieldConditions { get; set; }
    }
    
    Public class NPSActionFieldsWrapper{
        @AuraEnabled
        String fieldAPIName { get; set; }
        
        @AuraEnabled
        String fieldLabel { get; set; }
        
        @AuraEnabled
        List<String> PickListOptions { get; set; }
        
        @AuraEnabled
        String fieldType { get; set; }
        
    }
    
    Public class NPSActionWrapperList{
        @AuraEnabled
        set<String> fieldAPINameList { get; set; }
        
        @AuraEnabled
        Map<String,NPSActionFieldsWrapper> NPSActionFieldsWrapMap { get; set; }
    }
    
}