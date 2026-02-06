/*********************************************************************** 
Name: MA_Client_Reference_Class 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Queries all referenced Companies to a MA.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Abhishek Kumar  	 	27/11/2017  		INITIAL DEVELOPMENT   		  
2.0 -
**********************************************************************/
public with sharing class MA_Client_Reference_Class {
    
    private static final String OR_STR = ' OR ';
    private static final String AND_STR = ' AND ';
    private static final String EQUAL_SIGN = '=';
    private static final String NOT_EQUAL_SIGN = '!=';
    private static final String LIKE_KEY = ' LIKE ';
    private static final String PER_SIGN = '%';
    private static final String QUOTES = '\'';
    private static final String EQUAL_TO_STR = 'Equal to';
    private static final String NOT_EQUAL_TO_STR = 'Not equal to';
    private static final String ON_OR_BEFORE = 'On or before';
    private static final String ON_OR_AFTER = 'On or after';
    private static final String IS_CHECKED = 'Is checked';
    private static final String IS_NOT_CHECKED = 'Is not checked';
    private static final String CONTAINS_ONE_VALUE = 'Contains at least one value';
    private static final String CONTAINS_ALL = 'Contains all values';
    private static final String BEGINS_WITH = 'Begins with';
    private static final String LESS_THAN ='Less than';
    private static final String GREATER_THAN = 'Greater than';
    private static final String CONTAINS_ANY = 'Contains any';
    private static final String TRUE_VAL = 'true';
    private static final String FALSE_VAL = 'false';
    private static final String INCLUDES_STR = ' includes ';
    
    private static final String FIELDS_TO_QUERY = 'Subtype__c,UHC_Vision_Members__c,UHC_Dental_Members__c,ParticipatingUSMembers__c,Client_Reference_Status_Comments__c,Client_Reference_Status__c,BillingStateCode,Cancellation_Date__c,Client_Ref_Products_Programs__c,CM_SCE__c,CM_SCE__r.Name,CVGAccount__r.Name,Health_Plan_Manager_Industry__c,Leased_Specialized_Network__c,Original_Effective_Date__c,POS_Tiering__c,Premium_Tiering__c,Private_Exchange_Client__c,PublicSector__c,ReasonforTermOtherBuyUp__c,ReasonforTermDental__c,ReasonforTermMedical__c,ReasonforTermPharmacy__c,ReasonforTermVision__c,Reason_for_Term_Comments__c,RecordType.Name,UHC_Medical_Members__c,Surest_Members__c,UMR_Client__c,TopMarket1__c ,TopMarket2__c,TopMarket3__c,TopMarket4__c,TopMarket5__c,Claim_Site__c,Call_Site__c,Clinical_Site__c';
    
    /*******************************************************************
* 
Purpose: Query the Role of the Logged In User for Add/Edit/Delete functionality
Parameters: 
Returns: boolean
Throws [Exceptions]: QueryException, Exception

********************************************************************
*/ 
    
    @AuraEnabled
    public static boolean getLoggedInUserRoles(){
        
        boolean isLoggedInUserRoleValid = true;
        
        try{
            User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()]; 
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                String[] roleNames = System.Label.MA_Client_Reference_Not_Allowed_Roles_For_Edit.split(';;');
                System.debug('roleNames-->>'+roleNames);
                System.debug('loggedInUserRole-->>'+loggedInUserRole);
                Set<String> roleNamesSet = new Set<String>(roleNames);
                if(roleNamesSet.contains(loggedInUserRole)) {
                    isLoggedInUserRoleValid = false;
                } else {
                    isLoggedInUserRoleValid = true;
                }
            }
            System.debug('isLoggedInUserRoleValid-->>'+isLoggedInUserRoleValid);
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the Role of Logged In User from SF in '+
                         'getLoggedInUserRoles() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getLoggedInUserRoles() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        return isLoggedInUserRoleValid;
    }
    
    /******************************************************************************************
* 
Purpose: Query the Referenced Companies of the MA
Parameters: 
Returns: boolean
Throws [Exceptions]: NullPointerException, NoAccessException, QueryException, Exception

*************************************************************************************************
*/ 
    
    @AuraEnabled
    public static MAReferencedAccounts queryReferenceAccounts(Id maId, Decimal pageNumber, String columnName, String sortType){
        
        MAReferencedAccounts maReferencedAccounts = null;
        
        UHGContactSOQLConstants contactSOQLConstants = new UHGContactSOQLConstants();
        UHGContactConstants contactConstants = new UHGContactConstants();
         if(columnName!=null)
        columnName = String.escapeSingleQuotes(columnName);
         if(sortType!=null)
        sortType = String.escapeSingleQuotes(sortType);
        
        try{
            if(maId != null){
                Integer pageSize = contactConstants.APPLET_PAGESIZE;
                Integer offset = ((Integer)pageNumber - 1) * pageSize;
                
                System.debug('pagesize --'+pageSize+'---offset---'+offset);
                System.debug('sortType '+sortType);
                
                if(schema.sobjecttype.Refferal_Request__c.isaccessible() && schema.sobjecttype.Refferal_Request__c.isQueryable()) {
                    maReferencedAccounts = new maReferencedAccounts();
                    
                    maReferencedAccounts.total = Database.countQuery(contactSOQLConstants.COUNT_QUERY_RR);

                    if(sortType != null){
                        system.debug('Inside if '+ contactSOQLConstants.QUERY_STRING_FOR_RR+columnName+' '+sortType+contactSOQLConstants.QUERY_SUFFIX);
                        maReferencedAccounts.refAccountRecords = Database.query(contactSOQLConstants.QUERY_STRING_FOR_RR+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType)+contactSOQLConstants.QUERY_SUFFIX);
                    }
                    else{
                        system.debug('Inside else '+contactSOQLConstants.QUERY_STRING_FOR_RR+contactSOQLConstants.QUERY_SUFFIX);
                        maReferencedAccounts.refAccountRecords = Database.query(contactSOQLConstants.QUERY_STRING_FOR_RR_NO_ORDERBY+'CreatedDate DESC '+contactSOQLConstants.QUERY_SUFFIX);
                    }
                    
                    //maReferencedAccounts.refAccountRecords = Database.query(contactSOQLConstants.QUERY_STRING_FOR_RR+columnName+' '+sortType+contactSOQLConstants.QUERY_SUFFIX);
                    system.debug('maReferencedAccounts.refAccountRecords@@@'+maReferencedAccounts.refAccountRecords);
                    maReferencedAccounts.page = (Integer)pageNumber;
                    maReferencedAccounts.pageSize = pageSize;
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
            
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Refferal_Request__c object from SF in queryReferenceAccounts() '+
                         'method -> '+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Refferal_Request__c object from SF in queryReferenceAccounts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in queryReferenceAccounts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
        }catch(QueryException queryExec){
            System.debug('Error(QueryException) occurred while querying the details of Refferal_Request__c object from SF in '+
                         'queryReferenceAccounts() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in queryReferenceAccounts() method, the Stack Trace is -> '
                         +queryExec.getStackTraceString());
        }catch(Exception e){
            System.debug('Exception occured'+e.getMessage());
        } 
        
        return maReferencedAccounts;
    }
    
    //----------------------------------------SAMARTH----------------------------------------
    @AuraEnabled 
    public static Map<String, String> getRefStatusFieldValue(){
        Map<String, String> options = new Map<String, String>();
        
        Schema.DescribeFieldResult fieldResult = Refferal_Request__c.Ref_Status__c.getDescribe();
        
        List<Schema.PicklistEntry> pValues = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry p: pValues) {
            options.put(p.getValue(), p.getLabel());
        }
        return options;
    }
    
      @AuraEnabled 
    public static Map<String, String> getApplicableforValues(){
        Map<String, String> options = new Map<String, String>();
        
        Schema.DescribeFieldResult fieldResult = Refferal_Request__c.Applicable_for__c.getDescribe();
        
        List<Schema.PicklistEntry> pValues = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry p: pValues) {
            options.put(p.getValue(), p.getLabel());
        }
        return options;
    }
    
    @AuraEnabled
    public static void saveRefRecordsParent(List<Refferal_Request__c> refRevords){
        system.debug('@@@'+refRevords);
        try{
            update refRevords;
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void saveRefReqRecord(String refReqRecords){
        system.debug('refReqRecords --- '+refReqRecords); 
        List<Refferal_Request__c> refReqList = new List<Refferal_Request__c>();
        Map<Id,JSON2Apex> groupbyRecId = new Map<Id,JSON2Apex>();
        
        List<JSON2Apex> jsonData = (List<JSON2Apex>) System.JSON.deserialize(refReqRecords, List<JSON2Apex>.class);
        system.debug('jsonData '+jsonData);
        
        for(JSON2Apex jta:jsonData){
            if(!groupbyRecId.containsKey(jta.refStatId)){
                groupbyRecId.put(jta.refStatId,jta);
            }
        }
        system.debug('groupbyRecId '+groupbyRecId);
        
        for(Id ids:groupbyRecId.keySet()){
            Refferal_Request__c refReq = new Refferal_Request__c();
            refReq.Id = ids;
            
            if(groupbyRecId.get(ids).OptionSel != null){
                refReq.Ref_Status__c = groupbyRecId.get(ids).OptionSel;
            }

            if(groupbyRecId.get(ids).OptionSel == '--None--'){
                refReq.Ref_Status__c = null;
            }
            
            if(groupbyRecId.get(ids).notesVal != null){
                refReq.Notes__c = groupbyRecId.get(ids).notesVal;
            }
            refReqList.add(refReq);
        }
        update as user refReqList;
    }
    //----------------------------------------SAMARTH----------------------------------------
    
    @AuraEnabled
    public static String[] getPLValues(String fieldApiName){
        System.debug('Input parameters -- >> fieldApiName -- '+fieldApiName);
        String[] pickListVals = new List<String>();
        Schema.sObjectType objType = null;
        String objName = 'Account';
        
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
                
                if(fieldApiName.equalsIgnoreCase('Top_Markets__c')){
                    fieldApiName = 'TopMarket1__c';
                    objName = 'Account';
                    objType = Account.getSObjectType();
                    //pickListVals.add('');
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
    public static PicklistVals getPickListValues(){
        PicklistVals picklistVals = new PicklistVals();
        List<String> apiNamesPLFields = new List<String>();
        
        //List<User> userListCMSCE = [SELECT Id, Name, Profile.Name FROM User WHERE Profile.Name = 'CM Sales Team Advanced Profile'];
        //ghanshyam c 1114  start
        /*list<account> cmsechold = [select id , name,CM_SCE__r.Name from Account  where CM_SCE__c !=null];
        set<string> cmsecname  = new set<string>();
        for(account a : cmsechold){
            cmsecname.add(a.CM_SCE__r.Name);
        }*/

         //------------------------------------------SAMARTH------------------------------------------
         //Id roleId = [SELECT Name, Id FROM UserRole where Name='CM SCE'].Id; COMMENTED BY SAMARTH
         List<UserRole> usrRoleList = new List<UserRole>();
         Set<Id> roleIdSet = new Set<Id>();
         usrRoleList = [SELECT Id FROM UserRole where Name='CM SCE' OR Name = 'Specialty Benefits SCE' OR Name = 'Surest CM SVP' OR Name = 'Surest CM SCE'];
         for(UserRole ur:usrRoleList){
            roleIdSet.add(ur.Id);
         }
         system.debug('roleIdSet '+roleIdSet);
         //------------------------------------------SAMARTH------------------------------------------
        List<User> cmsechold = [SELECT Id, Name FROM User where UserRoleId IN:roleIdSet AND IsActive =true];
        system.debug('cmsechold '+cmsechold);
        set<string> cmsecname  = new set<string>();
        for(User a : cmsechold){
            cmsecname.add(a.Name);
        }
        system.debug('a'+cmsecname);
        //ghanshyam c 1114 end
        
        List<Account> cvgAccountList = [select Id, Name, SubType__c from Account where RecordType.Name='Aggregator' AND Subtype__c='Collaborative Ventures Group (CVG)' WITH USER_MODE];
        
        String[] apiNamesSet = new List<String>();
        
        apiNamesSet = System.Label.PickList_Api_Names.split(',');
        
        apiNamesPLFields.addAll(apiNamesSet);
        
        picklistVals.CVG.add('');
        picklistVals.Industry.add('');
        picklistVals.LeasedNetwork.add('');
        picklistVals.PrivateEx.add('');
        picklistVals.ReasonForAll.add('');
        picklistVals.SubType.add('');
        pickListVals.CMSCEUsers.add('');
        
        /*for(User cmsceUser : userListCMSCE){
            pickListVals.CMSCEUsers.add(cmsceUser.Name);
        }*/
       List<string> cmscelist = new list<string>();
        cmscelist.add('');
        cmscelist.addAll(cmsecname);
        pickListVals.CMSCEUsers=cmscelist;
        
        
        //ghanshyam c 1114
        pickListVals.CMSCEUsers.sort();
        for(Account cvgAcc : cvgAccountList){
            picklistVals.CVG.add(cvgAcc.Name);
        }
        //ghanshyam c 1114
        picklistVals.CVG.sort();
        system.debug('picklistVals.CVG@@@'+picklistVals.CVG);
        
        for(String str : apiNamesPLFields){
            
            Schema.sObjectType objType = Account.getSObjectType();
            
            Schema.DescribeSObjectResult objDescribe = objType.getDescribe();   
            Map<String, Schema.SObjectField> fieldMap = objDescribe.fields.getMap(); 
            
            list<Schema.PicklistEntry> values = fieldMap.get(str).getDescribe().getPickListValues();
            
            for (Schema.PicklistEntry a : values){ 
                
                if(str.equalsIgnoreCase('Client_Ref_Products_Programs__c')){
                    picklistVals.ProdBuyUpProgs.add(a.getValue());
                }else if(str.equalsIgnoreCase('Health_Plan_Manager_Industry__c')){
                    picklistVals.Industry.add(a.getValue());
                }else if(str.equalsIgnoreCase('Leased_Specialized_Network__c')){
                    picklistVals.LeasedNetwork.add(a.getValue());
                }else if(str.equalsIgnoreCase('Private_Exchange_Client__c')){
                    picklistVals.PrivateEx.add(a.getValue());
                }else if(str.equalsIgnoreCase('ReasonforTermDental__c') || str.equalsIgnoreCase('ReasonforTermMedical__c') || str.equalsIgnoreCase('ReasonforTermOtherBuyUp__c') || str.equalsIgnoreCase('ReasonforTermPharmacy__c')|| str.equalsIgnoreCase('ReasonforTermVision__c')){
                    picklistVals.ReasonForAll.add(a.getValue());
                }else if(str.equalsIgnoreCase('Subtype__c')){
                    picklistVals.SubType.add(a.getValue());
                }
            }
        }
        
        return picklistVals;
    }
    
    @AuraEnabled
    public static MetaDataValues getMetadata(){
        MetaDataValues mdVals = new MetaDataValues();
        List<MA_Client_Reference_MD__mdt> MA_Client = [Select Field_Label__c, FIeld_Condition__c, Field_Type__c, FieldAPIName__c, Field_Order__c from MA_Client_Reference_MD__mdt ORDER BY Field_Order__c ASC];
        mdVals.fieldLabels.add('');
        for(MA_Client_Reference_MD__mdt ma_metaDataRec : MA_Client){
            List<String> concatFields = new List<String>();
            //concatFields.add(ma_metaDataRec.Field_Label__c);
            concatFields.add(ma_metaDataRec.FIeld_Condition__c);
            concatFields.add(ma_metaDataRec.Field_Type__c);
            concatFields.add(ma_metaDataRec.FieldAPIName__c);
            mdVals.mapOfMetaData.put(ma_metaDataRec.Field_Label__c, concatFields);
            mdVals.fieldLabels.add(ma_metaDataRec.Field_Label__c);
        }
        //mdVals.fieldLabels.sort();
        return mdVals;
    }
    
    /******************************************************************************************
* 
Purpose: Adding Companies as Reference to the MA
Parameters: maId, refAccountIds
Returns: boolean
Throws [Exceptions]: NullPointerException, NoAccessException, DMLException, Exception

*************************************************************************************************
*/ 
    @AuraEnabled
    public static void addRefAccountsToMA(Id maID, List<Id> refAccountIds){
        
        System.debug('Input Parameters -- Membership Activity Id-->>'+maID+', refAccountIds-->>'+refAccountIds);
        
        try{
            List<Refferal_Request__c> refRequestList = new List<Refferal_Request__c>();
            
            if(maID != null && refAccountIds != null){
                if(schema.sobjecttype.Refferal_Request__c.isaccessible() && schema.sobjecttype.Refferal_Request__c.isCreateable()){
                    
                    for(Id accId : refAccountIds){
                        Refferal_Request__c refRequest = new Refferal_Request__c(RefCompany__c=accId,MembershipActivity__c=maID);
                        refRequestList.add(refRequest);
                    }
                    
                    Database.SaveResult[] refReqSaveresults = Database.insert(refRequestList, false);
                    for(Database.SaveResult refReq : refReqSaveresults){
                        if(refReq.isSuccess()){
                            System.debug('Successfully updated in Account Contact relation');
                        }else{
                            for(Database.Error err : refReq.getErrors()) {
                                System.debug('The following error has occurred.');                   
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('Account fields that affected this error: ' + err.getFields());
                            }
                        }
                    }
                    
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
            
        }catch(NullPointerException nullPointerEx) {
            System.debug('Null Poiunter Exception in addRefAccountsToMA() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access for the current logged in user for Refferal_Request__c object from SF in addRefAccountsToMA() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in addRefAccountsToMA() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('Null Pointer Exception Occured----'+noaccessExec.getMessage());
        }catch(DmlException dmlException){
            System.debug('DML Exception(Stack Trace) occurred in addRefAccountsToMA() method while updating the '+
                         'details of Referral Request from SF -> '+dmlException.getStackTraceString());
            for (Integer i = 0; i < dmlException.getNumDml(); i++) {
                if(dmlException.getDmlStatusCode(i).equals('DUPLICATE_VALUE')){
                    System.debug('Record already exists.');
                }else{
                    System.debug('Status Code -> '+dmlException.getDmlStatusCode(i)); 
                    System.debug('DML Error Message -> '+dmlException.getDmlMessage(i)); 
                    System.debug('FieldNames -> '+dmlException.getDmlFieldNames(i)); 
                    throw new AuraHandledException('DML Exception Occured----'+dmlException.getStackTraceString());
                }
            }
        }catch(Exception e){
            System.debug('Exception message - '+e.getLineNumber()+' Message'+e.getMessage());
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
    }
    
    /******************************************************************************************
* 
Purpose: Searching for Reference Accounts as per Search criteria given
Parameters: maId, refAccountIds
Returns: boolean
Throws [Exceptions]: NullPointerException, NoAccessException, QueryException, Exception

*************************************************************************************************
*/
    
    @AuraEnabled
    public static AccountSearchResults searchForAccountsByCustomLogic(String filterMap, Id maID, Decimal pageNumber, String finalExp){
        System.debug('Input Parameters -->>filterMap--'+filterMap+', maId---'+maID+', finalExp--'+finalExp);
        
         if(filterMap!=null)
         filterMap = String.escapeSingleQuotes(filterMap);
        if(finalExp!=null)
        finalExp = String.escapeSingleQuotes(finalExp);
        
        Integer pageSize = 10;
        Integer offset = ((Integer)pageNumber - 1) * pageSize; 
        
        String numeric = '';
        
        AccountSearchResults acResults = null;
        String strForQuery = '';
        
        try{
            if(maID != null && filterMap != null && finalExp != null){
                if(schema.sobjecttype.Account.isAccessible() && schema.sobjecttype.Account.isQueryable()){
                    List<String> chars = String.escapeSingleQuotes(finalExp).split('|');
                    List<String> indices = new List<String>();
                    List<String> alpha = new List<String>();
                    List<String> logicalKeys = String.escapeSingleQuotes(finalExp).split(' ');
                    for (String s : chars)
                    {
                        if (s.isNumeric()){
                            //numeric += s;
                            indices.add(s);
                        }
                    }
                    System.debug('Indices-->>'+indices);
                    System.debug('logicalKeys-->>'+logicalKeys);
                    for(String s : logicalKeys){
                        if(s.isAlpha()){
                            alpha.add(s);
                        }
                    }
                    System.debug('alpha-->>'+alpha);
                    
                    acResults = new AccountSearchResults();
                    filterMap = filterMap.removeStart('[');
                    filterMap = filterMap.removeEnd(']');
                    
                    List<String> k = filterMap.split('},');
                    
                    for(Integer i = 0; i<k.size(); i++){
                        if(i != k.size()-1){
                            k[i] = k[i]+'}';
                        }
                    }
                    
                    List<FilterQueries> filtVals = new List<FilterQueries>();
                    
                    for(String s : k){
                        FilterQueries filterQuery1 = (FilterQueries)JSON.deserialize(s, FilterQueries.class);
                        filtVals.add(filterQuery1);
                    }
                    
                    Map<String, String> finalMapping = new Map<String, String>();
                    
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
                        
                        String queryCondition = '';
                        
                        if(apiName.equalsIgnoreCase('Original_Effective_Date__c') || apiName.equalsIgnoreCase('Cancellation_Date__c') ){
                            Date dateVal = date.valueOf(fil);
                            System.debug('condition-->>'+condition);
                            condition = condition.trim();
                            
                            if(condition.equalsIgnoreCase(EQUAL_TO_STR)){
                                String equalDate = '=:dateVal';                  
                                queryCondition = queryCondition+apiName+equalDate;   
                            }else if(condition.equalsIgnoreCase(NOT_EQUAL_TO_STR)){
                                String notEqualDate = '!=:dateVal';
                                queryCondition = queryCondition+apiName+notEqualDate;   
                            }else if(condition.equalsIgnoreCase(ON_OR_BEFORE)){
                                String onOrBef = '<=:dateVal';
                                queryCondition = queryCondition+apiName+onOrBef;   
                            }else if(condition.equalsIgnoreCase(ON_OR_AFTER)){
                                String onOrAft = '>=:dateVal';
                                queryCondition = queryCondition+apiName+onOrAft;
                            }
                            
                        }
                        else if(apiName.equalsIgnoreCase('ParticipatingUSMembers__c') || apiName.equalsIgnoreCase('UHC_Dental_Members__c') || apiName.equalsIgnoreCase('UHC_Medical_Members__c') || apiName.equalsIgnoreCase('UHC_Vision_Members__c') || apiName.equalsIgnoreCase('Surest_Members__c')){
                            condition = condition.trim();
                            
                            if(condition.equalsIgnoreCase(EQUAL_TO_STR)){
                                queryCondition = queryCondition+apiName+EQUAL_SIGN+fil;   
                            }else if(condition.equalsIgnoreCase(GREATER_THAN)){
                                queryCondition = queryCondition+apiName+'>'+fil;
                            }else if(condition.equalsIgnoreCase(LESS_THAN)){
                                queryCondition = queryCondition+apiName+'<'+fil;
                            }
                            
                        }
                        else if(apiName.equalsIgnoreCase('UMR_Client__c') || apiName.equalsIgnoreCase('POS_Tiering__c')|| apiName.equalsIgnoreCase('Premium_Tiering__c')){
                            condition = condition.trim();
                            if(condition.equalsIgnoreCase(IS_CHECKED)){
                                queryCondition = queryCondition+apiName+EQUAL_SIGN+TRUE_VAL;
                            }else if(condition.equalsIgnoreCase(IS_NOT_CHECKED)){
                                queryCondition = queryCondition+apiName+EQUAL_SIGN+FALSE_VAL;
                            }
                        }
                        else if(apiName.equalsIgnoreCase('SubType__c')){
                            queryCondition = queryCondition+'(';
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(',') > -1 ){
                                filterVals = fil.split(',');
                            }
                            System.debug('filterVals'+filterVals);
                            
                            if(filterVals.size() > 0){
                                for(Integer i = 0; i<filterVals.size(); i++){
                                    if(i == filterVals.size()-1){
                                        queryCondition = queryCondition+apiName+EQUAL_SIGN+QUOTES+filterVals[i]+QUOTES;
                                    }else{
                                        queryCondition = queryCondition+apiName+EQUAL_SIGN+QUOTES+filterVals[i]+QUOTES+OR_STR;
                                    }
                                }
                            }
                            queryCondition = queryCondition+')';
                        }
                        else if(apiName.equalsIgnoreCase('Client_Ref_Products_Programs__c') || apiName.equalsIgnoreCase('Call_Site__c') || apiName.equalsIgnoreCase('Clinical_Site__c') || apiName.equalsIgnoreCase('Claim_Site__c')){
                            queryCondition = queryCondition+'(';
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(',') > -1 ){
                                filterVals = fil.split(',');
                            }
                            System.debug('filterVals'+filterVals);
                            
                            if(condition.equalsIgnoreCase(CONTAINS_ONE_VALUE)){
                                String s = '';
                                for(Integer ii = 0; ii < filterVals.size(); ii++){
                                    if(ii == filterVals.size()-1){
                                        s += '\''+filterVals[ii]+'\'';
                                    }else{
                                        s += '\''+filterVals[ii]+'\',';
                                    }
                                }
                                queryCondition += apiName+' includes('+ s +')';
                            }
                            else if(condition.equalsIgnoreCase(CONTAINS_ALL)){
                                String s = '\'';
                                for(Integer ii = 0; ii < filterVals.size(); ii++){
                                    if(ii == filterVals.size()-1){
                                        s += filterVals[ii];
                                    }else{
                                        s += filterVals[ii]+';';
                                    }
                                }
                                s += '\'';
                                queryCondition += apiName+' includes('+ s +')';
                            }
                            queryCondition = queryCondition+')';
                        }
                        else if(apiName.equalsIgnoreCase('Top_Markets__c')){
                            List<String> plApiName = new List<String>();
                            plApiName.add('TopMarket1__c');
                            plApiName.add('TopMarket2__c');
                            plApiName.add('TopMarket3__c');
                            plApiName.add('TopMarket4__c');
                            plApiName.add('TopMarket5__c');
                            queryCondition = queryCondition+'(';
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(',') > -1 ){
                                filterVals = fil.split(',');
                            }
                            System.debug('filterVals'+filterVals);
                            if(filterVals.size() > 0){
                                for(Integer i = 0; i<plApiName.size(); i++){
                                    for(Integer j=0; j<filterVals.size(); j++){
                                        if(i == plApiName.size()-1 && j == filterVals.size()-1){
                                            queryCondition = queryCondition+plApiName[i]+EQUAL_SIGN+QUOTES+filterVals[j]+QUOTES;
                                        }else{
                                            queryCondition = queryCondition+plApiName[i]+EQUAL_SIGN+QUOTES+filterVals[j]+QUOTES+OR_STR;
                                        }
                                    }
                                }
                            }
                            queryCondition = queryCondition+')';
                            
                        }
                        else{
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(';') > -1 ){
                                filterVals = fil.split(';');
                            }
                            System.debug('filterVals'+filterVals);
                            
                            if(filterVals.size() > 0){
                                for(Integer i = 0; i<filterVals.size(); i++){
                                    if(i == filterVals.size()-1){
                                        queryCondition = queryCondition+apiName+EQUAL_SIGN+QUOTES+filterVals[i]+QUOTES;
                                    }else{
                                        queryCondition = queryCondition+apiName+EQUAL_SIGN+QUOTES+filterVals[i]+QUOTES+OR_STR;
                                    }
                                }
                            }
                        }
                        
                        System.debug('queryCondition--->>'+queryCondition);
                                                  
                        //finalExp = finalExp.replaceAll(indices[y], queryCondition);
                        
                        /*if(y<alpha.size()){
                            strForQuery = strForQuery+queryCondition+' '+alpha[y]+' ';
                        }else{
                            strForQuery = strForQuery+queryCondition;
                        }*/
                        
                        finalMapping.put(indices[y], queryCondition);
                    }
                    
                    System.debug('strForQuery--'+strForQuery);
                    System.debug('finalExp-->>'+finalExp);
                    //finalExp = strForQuery;
                    //System.debug('after finalExp-->>'+finalExp);
                    
                    List<String> finalExpBreaking = String.escapeSingleQuotes(finalExp).split('');
                    List<String> finalExpToReplace = String.escapeSingleQuotes(finalExp).split('');
                    for(Integer s1 = 0; s1<finalExpBreaking.size(); s1++){
                        if(finalExpBreaking[s1].isNumeric()){
                            finalExpToReplace[s1] = finalMapping.get(finalExpBreaking[s1]);
                        }
                    }
                    
                    System.debug('finalExpToReplace--'+finalExpToReplace);
                    
                    String finalExpression = '';
                    for(Integer g = 0; g < finalExpToReplace.size(); g++){
                        finalExpression = finalExpression+finalExpToReplace[g];
                    }
                    
                    System.debug('finalExpression--'+finalExpression);
                    
                    Set<Id> existingAccIds = new Set<Id>();
                    List<Refferal_Request__c> rf = [SELECT RefCompany__c FROM Refferal_Request__c WHERE MembershipActivity__c =:maID WITH USER_MODE];
                    
                    for(Refferal_Request__c rc : rf){
                        existingAccIds.add(rc.RefCompany__c);
                    }
                    
                    String countQuery = 'SELECT count() FROM Account WHERE Id NOT IN :existingAccIds AND (Client_Reference_Status__c =\'Green - Good Reference\' OR Client_Reference_Status__c =\'Yellow - Possible Reference (with qualifications)\') AND ( '+finalExpression+' )';
                    String query = 'SELECT Name,'+FIELDS_TO_QUERY+' FROM Account WHERE Id NOT IN :existingAccIds AND (Client_Reference_Status__c =\'Green - Good Reference\' OR Client_Reference_Status__c =\'Yellow - Possible Reference (with qualifications)\') AND ( '+finalExpression+' )'+' ORDER BY Name ASC LIMIT :pageSize OFFSET :offset';
                    String queryForAllAccounts = 'SELECT Name,'+FIELDS_TO_QUERY+' FROM Account WHERE Id NOT IN :existingAccIds AND (Client_Reference_Status__c =\'Green - Good Reference\' OR Client_Reference_Status__c =\'Yellow - Possible Reference (with qualifications)\') AND ( '+finalExpression+' )'+' ORDER BY Name ASC';
                    String queryWithoutSlash='';
                    String queryForAllAccountsWithoutSlash='';
                    String countQueryWithoutSlash='';
                    
                    
                    queryWithoutSlash = query.replace('\\', '\\\\');
                    queryForAllAccountsWithoutSlash = queryForAllAccounts.replace('\\', '\\\\');
                    countQueryWithoutSlash = countQuery.replace('\\', '\\\\');
                    System.debug('2query-->>'+queryWithoutSlash);
                    System.debug('2queryForAllAccounts-->>'+queryForAllAccountsWithoutSlash);
                    System.debug('2countQuery-->>'+countQueryWithoutSlash);
                    
                    acResults.refsearchedAccount = Database.query(queryWithoutSlash);
                    acResults.allAccountList = Database.query(queryForAllAccountsWithoutSlash);
                    acResults.total = Database.countQuery(countQueryWithoutSlash);
                    acResults.page = (Integer)pageNumber;
                    acResults.pageSize = pageSize;
                    acresults.searchedQuery = query;
                }else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer in searchForAccountsByCustomLogic() '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access Exception  in searchForAccountsByCustomLogic() '+ex.getMessage());
            System.debug('Error(NoAccessException) '+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) in searchForAccountsByCustomLogic() '+ex.getMessage());
            System.debug('Error(QueryException) in searchForAccountsByCustomLogic() '
                         +ex.getStackTraceString());
            //throw new AuraHandledException('Invalid Query expression --'+ex.getTypeName() +' Occured---> '+ex.getMessage());
            throw new AuraHandledException('Invalid Query characters in expression ---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception in searchForAccountsByCustomLogic() ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }
        
        System.debug('Output Parameters -->>acResults.refsearchedAccount-->'+acResults.refsearchedAccount);
        
        return acResults;
    }
    
    /******************************************************************************************
* 
Purpose: Searching for Reference Accounts as per Search criteria given
Parameters: maId, refAccountIds
Returns: boolean
Throws [Exceptions]: NullPointerException, NoAccessException, QueryException, Exception

*************************************************************************************************
*/
    
    @AuraEnabled
    public static AccountSearchResults searchForRefAccounts(String mapFields, String globalLiteral, Id maID, Decimal pageNumber){
        
        if(mapFields!=null)
            mapFields = String.escapeSingleQuotes(mapFields);
        if(globalLiteral!=null)
            globalLiteral = String.escapeSingleQuotes(globalLiteral);
        
        System.debug('Input Parameters -->>mapFields-->>'+mapFields+'--globalLiteral--->>'+globalLiteral);
        
        Integer pageSize = 10;
        Integer offset = ((Integer)pageNumber - 1) * pageSize;
        
        AccountSearchResults acResults = new AccountSearchResults();
        
        try{
            if(maID != null && mapFields != null && globalLiteral != null){
                if(schema.sobjecttype.Account.isAccessible() && schema.sobjecttype.Account.isQueryable()){
                    mapFields = String.escapeSingleQuotes(mapFields).removeStart('[');
                    mapFields = String.escapeSingleQuotes(mapFields).removeEnd(']');
                    
                    List<String> k = String.escapeSingleQuotes(mapFields).split('},');
                    
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
                        
                        if(apiName.equalsIgnoreCase('Original_Effective_Date__c') || apiName.equalsIgnoreCase('Cancellation_Date__c') ){
                            Date dateVal = date.valueOf(fil);
                            System.debug('condition-->>'+condition);
                            condition = condition.trim();
                            
                            if(condition.equalsIgnoreCase(EQUAL_TO_STR)){
                                String equalDate = '=:dateVal';                  
                                query1 = query1+apiName+equalDate;   
                            }else if(condition.equalsIgnoreCase(NOT_EQUAL_TO_STR)){
                                String notEqualDate = '!=:dateVal';
                                query1 = query1+apiName+notEqualDate;   
                            }else if(condition.equalsIgnoreCase(ON_OR_BEFORE)){
                                String onOrBef = '<=:dateVal';
                                query1 = query1+apiName+onOrBef;   
                            }else if(condition.equalsIgnoreCase(ON_OR_AFTER)){
                                String onOrAft = '>=:dateVal';
                                query1 = query1+apiName+onOrAft;
                            }
                            
                        }
                        else if(apiName.equalsIgnoreCase('ParticipatingUSMembers__c') || apiName.equalsIgnoreCase('UHC_Dental_Members__c') || apiName.equalsIgnoreCase('UHC_Medical_Members__c') || apiName.equalsIgnoreCase('UHC_Vision_Members__c') || apiName.equalsIgnoreCase('Surest_Members__c')){
                            condition = condition.trim();
                            
                            if(condition.equalsIgnoreCase(EQUAL_TO_STR)){
                                query1 = query1+apiName+EQUAL_SIGN+fil;   
                            }else if(condition.equalsIgnoreCase(GREATER_THAN)){
                                query1 = query1+apiName+'>'+fil;
                            }else if(condition.equalsIgnoreCase(LESS_THAN)){
                                query1 = query1+apiName+'<'+fil;
                            }
                            
                        }
                        else if(apiName.equalsIgnoreCase('UMR_Client__c') || apiName.equalsIgnoreCase('POS_Tiering__c')|| apiName.equalsIgnoreCase('Premium_Tiering__c')){
                            condition = condition.trim();
                            if(condition.equalsIgnoreCase(IS_CHECKED)){
                                query1 = query1+apiName+EQUAL_SIGN+TRUE_VAL;
                            }else if(condition.equalsIgnoreCase(IS_NOT_CHECKED)){
                                query1 = query1+apiName+EQUAL_SIGN+FALSE_VAL;
                            }
                        }
                        else if(apiName.equalsIgnoreCase('SubType__c')){
                            query1 = query1+'(';
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(',') > -1 ){
                                filterVals = fil.split(',');
                            }
                            System.debug('filterVals'+filterVals);
                            
                            if(filterVals.size() > 0){
                                for(Integer i = 0; i<filterVals.size(); i++){
                                    if(i == filterVals.size()-1){
                                        query1 = query1+apiName+EQUAL_SIGN+QUOTES+filterVals[i]+QUOTES;
                                    }else{
                                        query1 = query1+apiName+EQUAL_SIGN+QUOTES+filterVals[i]+QUOTES+OR_STR;
                                    }
                                }
                            }
                            query1 = query1+')';
                        }
                        else if(apiName.equalsIgnoreCase('Client_Ref_Products_Programs__c') || apiName.equalsIgnoreCase('Call_Site__c') || apiName.equalsIgnoreCase('Clinical_Site__c') || apiName.equalsIgnoreCase('Claim_Site__c')){
                            query1 = query1+'(';
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(',') > -1 ){
                                filterVals = fil.split(',');
                            }
                            System.debug('filterVals'+filterVals);
                            
                            if(condition.equalsIgnoreCase(CONTAINS_ONE_VALUE)){
                                String s = '';
                                for(Integer ii = 0; ii < filterVals.size(); ii++){
                                    
                                    filterVals[ii] = String.escapeSingleQuotes(filterVals[ii]);
                                    if(ii == filterVals.size()-1){
                                        s += '\''+filterVals[ii]+'\'';
                                    }else{
                                        s += '\''+filterVals[ii]+'\',';
                                    }                                    
                                    system.debug('After Replace '+filterVals[ii]);
                                }                                
                                query1 += apiName+' includes('+ s +')';
                            }
                            else if(condition.equalsIgnoreCase(CONTAINS_ALL)){
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
                        else if(apiName.equalsIgnoreCase('Top_Markets__c')){
                            List<String> plApiName = new List<String>();
                            plApiName.add('TopMarket1__c');
                            plApiName.add('TopMarket2__c');
                            plApiName.add('TopMarket3__c');
                            plApiName.add('TopMarket4__c');
                            plApiName.add('TopMarket5__c');
                            query1 = query1+'(';
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(',') > -1 ){
                                filterVals = fil.split(',');
                            }
                            System.debug('filterVals'+filterVals);
                            if(filterVals.size() > 0){
                                for(Integer i = 0; i<plApiName.size(); i++){
                                    for(Integer j=0; j<filterVals.size(); j++){
                                        if(i == plApiName.size()-1 && j == filterVals.size()-1){
                                            query1 = query1+plApiName[i]+EQUAL_SIGN+QUOTES+filterVals[j]+QUOTES;
                                        }else{
                                            query1 = query1+plApiName[i]+EQUAL_SIGN+QUOTES+filterVals[j]+QUOTES+OR_STR;
                                        }
                                    }
                                }
                            }
                            query1 = query1+')';
                            
                        }
                        else{
                            List<String> filterVals = new List<String>();
                            filterVals.add(fil);
                            if(fil.indexOf(';') > -1 ){
                                filterVals = fil.split(';');
                            }
                            System.debug('filterVals'+filterVals);
                            
                            if(filterVals.size() > 0){
                                for(Integer i = 0; i<filterVals.size(); i++){
                                    if(i == filterVals.size()-1){
                                        query1 = query1+apiName+EQUAL_SIGN+QUOTES+filterVals[i]+QUOTES;
                                    }else{
                                        query1 = query1+apiName+EQUAL_SIGN+QUOTES+filterVals[i]+QUOTES+OR_STR;
                                    }
                                }
                            }
                        }
                        
                        if(y == filtVals.size()-1){
                            query1 = query1;
                        }else{
                            query1 = query1+String.escapeSingleQuotes(globalLiteral);
                        }
                    }
                    
                    Set<Id> existingAccIds = new Set<Id>();
                    List<Refferal_Request__c> rf = [SELECT RefCompany__c FROM Refferal_Request__c WHERE MembershipActivity__c =:maID WITH USER_MODE];
                    
                    for(Refferal_Request__c rc : rf){
                        existingAccIds.add(rc.RefCompany__c);
                    }
                    
                    //String fieldToQuery = 'BillingState,Cancellation_Date__c,Client_Ref_Products_Programs__c,CM_SCE__c,CM_SCE__r.Name,CVGAccount__r.Name,Health_Plan_Manager_Industry__c,Leased_Specialized_Network__c,Original_Effective_Date__c,POS_Tiering__c,Premium_Tiering__c,Private_Exchange_Client__c,PublicSector__c,ReasonforTermOtherBuyUp__c,ReasonforTermDental__c,ReasonforTermMedical__c,ReasonforTermPharmacy__c,ReasonforTermVision__c,Reason_for_Term_Comments__c,RecordType.Name,UHC_Medical_Members__c,UMR_Client__c,TopMarket1__c ,TopMarket2__c,TopMarket3__c,TopMarket4__c,TopMarket5__c,Claim_Site__c,Call_Site__c,Clinical_Site__c';
                    
                    String query = '';
                    String queryForAllAccounts = '';
                    String countQuery = '';
                    
                    String queryWithoutSlash = '';
                    String queryForAllAccountsWithoutSlash = '';
                    String countQueryWithoutSlash = '';
                    
                    
                    if(globalLiteral.equalsIgnoreCase(' OR ')){
                        countQuery = 'SELECT count() FROM Account WHERE Id NOT IN :existingAccIds AND (Client_Reference_Status__c =\'Green - Good Reference\' OR Client_Reference_Status__c =\'Yellow - Possible Reference (with qualifications)\') AND ( '+query1+' )';
                        query = 'SELECT Name,'+FIELDS_TO_QUERY+' FROM Account WHERE Id NOT IN :existingAccIds AND (Client_Reference_Status__c =\'Green - Good Reference\' OR Client_Reference_Status__c =\'Yellow - Possible Reference (with qualifications)\') AND ( '+query1+' )'+' ORDER BY Name ASC LIMIT :pageSize OFFSET :offset';
                        queryForAllAccounts = 'SELECT Name,'+FIELDS_TO_QUERY+' FROM Account WHERE Id NOT IN :existingAccIds AND (Client_Reference_Status__c =\'Green - Good Reference\' OR Client_Reference_Status__c =\'Yellow - Possible Reference (with qualifications)\') AND ( '+query1+' )'+' ORDER BY Name ASC';
                    }else if(globalLiteral.equalsIgnoreCase(' AND ')){
                        countQuery = 'SELECT count() FROM Account WHERE Id NOT IN :existingAccIds AND (Client_Reference_Status__c =\'Green - Good Reference\' OR Client_Reference_Status__c =\'Yellow - Possible Reference (with qualifications)\') AND ( '+query1+' )';
                        query = 'SELECT Name,'+FIELDS_TO_QUERY+' FROM Account WHERE Id NOT IN :existingAccIds AND (Client_Reference_Status__c =\'Green - Good Reference\' OR Client_Reference_Status__c =\'Yellow - Possible Reference (with qualifications)\') AND '+query1+' ORDER BY Name ASC LIMIT :pageSize OFFSET :offset';
                        queryForAllAccounts = 'SELECT Name,'+FIELDS_TO_QUERY+' FROM Account WHERE Id NOT IN :existingAccIds AND (Client_Reference_Status__c =\'Green - Good Reference\' OR Client_Reference_Status__c =\'Yellow - Possible Reference (with qualifications)\') AND '+query1+' ORDER BY Name ASC';
                    }
                    //queryWithoutSlash = query.replace('\\', '\\\\');
                    //queryForAllAccountsWithoutSlash = queryForAllAccounts.replace('\\', '\\\\');
                    //countQueryWithoutSlash = countQuery.replace('\\', '\\\\');
                    System.debug('2query-->>'+query);
                    System.debug('2queryForAllAccounts-->>'+queryForAllAccounts);
                    System.debug('2countQuery-->>'+countQuery);
                    
                    queryWithoutSlash =String.escapeSingleQuotes(queryWithoutSlash);
                    
                    System.debug('2query After-->>'+queryWithoutSlash);
                    
                    //acResults.refsearchedAccount = Database.query(queryWithoutSlash);
                    //acResults.allAccountList = Database.query(queryForAllAccountsWithoutSlash);
                    //acResults.total = Database.countQuery(countQueryWithoutSlash);
                    acResults.refsearchedAccount = Database.query(query);
                    acResults.allAccountList = Database.query(queryForAllAccounts);
                    acResults.total = Database.countQuery(countQuery);
                    acResults.page = (Integer)pageNumber;
                    acResults.pageSize = pageSize;
                    acresults.searchedQuery = query1;
                }else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer in searchForRefAccounts() '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access Exception  in searchForRefAccounts() '+ex.getMessage());
            System.debug('Error(NoAccessException) '+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) in searchForRefAccounts() '+ex.getMessage());
            System.debug('Error(QueryException) in searchForRefAccounts() '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception in searchForRefAccounts() ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        } 
        
        System.debug('Output Parameters -->>acResults.refsearchedAccount-->'+acResults.refsearchedAccount);
        
        return acResults;
    }
    
     @AuraEnabled
    public static maReferencedAccounts RemoveReferenceRequest(List<Refferal_Request__c> refenceObj, Id maId, Decimal pageNumber, String columnName,String sortType){
        MAReferencedAccounts maReferencedAccounts = new MAReferencedAccounts();
        System.debug('refenceObj'+refenceObj); 
        List<Database.DeleteResult> dbDelResultList;
        if(Refferal_Request__c.sObjectType.getDescribe().isDeletable()){
       	  dbDelResultList = Database.delete(refenceObj, false);
        }
        if(dbDelResultList != null && dbDelResultList.size() > 0) {
            // Iterate through each returned result
            for (Database.DeleteResult refRequestDeleteResult : dbDelResultList) {
                if(!refRequestDeleteResult.isSuccess()) {               
                    for(Database.Error err : refRequestDeleteResult.getErrors()) {
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        System.debug('Fields that affected this error: ' + err.getFields());
                    }
                }
            }
            maReferencedAccounts = queryReferenceAccounts(maId,pageNumber,columnName,sortType);
        }
        return maReferencedAccounts;
    }
    
    
    /* Wrapper Classes */
    public class AccountSearchResults {
        
        public AccountSearchResults(){
            searchedQuery = '';
        }
        
        @AuraEnabled
        public List<Account> refsearchedAccount{ get;set; }
        
        @AuraEnabled
        public List<Account> allAccountList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public String searchedQuery { get; set;}
        
    }
    
    public class MAReferencedAccounts {
        
        @AuraEnabled
        public List<Refferal_Request__c> refAccountRecords{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
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
        
    }
    
    public class PicklistVals{
        
        public PickListVals(){
            CVG = new List<String>();
            CMSCEUsers = new List<String>();
            ProdBuyUpProgs = new List<String>();
            Industry = new List<String>();
            LeasedNetwork = new List<String>();
            PrivateEx = new List<String>();
            ReasonForAll = new List<String>();
            SubType = new List<String>();
        }
        
        @AuraEnabled
        public List<String> CVG { get;set; }
        
        @AuraEnabled
        public List<String> ProdBuyUpProgs { get; set; }
        
        @AuraEnabled
        public List<String> Industry { get;set; }
        
        @AuraEnabled
        public List<String> CMSCEUsers { get;set; }
        
        @AuraEnabled
        public List<String> LeasedNetwork { get;set; }
        
        @AuraEnabled
        public List<String> PrivateEx { get;set; }
        
        @AuraEnabled
        public List<String> ReasonForAll { get;set; }

        @AuraEnabled
        public List<String> SubType { get;set; }
        /*@AuraEnabled
public List<String> CVG { get;set; }

@AuraEnabled
public List<String> CVG { get;set; }

@AuraEnabled
public List<String> CVG { get;set; }

@AuraEnabled
public List<String> CVG { get;set; }*/
        
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
    
    //------------------------------------------------SAMARTH------------------------------------------------
    public class JSON2Apex {
        public String OptionSel;
        public String notesVal;
        public String refStatId;
        
        public List<JSON2Apex> parse(String json) {
            return (List<JSON2Apex>) System.JSON.deserialize(json, List<JSON2Apex>.class);
        }
    }
    //------------------------------------------------SAMARTH------------------------------------------------
    
}