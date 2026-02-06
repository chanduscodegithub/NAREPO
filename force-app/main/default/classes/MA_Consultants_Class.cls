/****************************************************************** ***** 
Name: Account_Consultants_Class 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query all Consultants of a particular Membership Activity in The MA Consultants Lightning Component.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Abhishek Kumar  	 	11/14/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*******************************************************************************************************************
*/
public class MA_Consultants_Class { 
    
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
                String[] roleNames = System.Label.MA_Consultant_Not_Allowed_Roles_For_Edit1.split(';;');
                System.debug('roleNames-->>'+roleNames);
                System.debug('loggedInUserRole-->>'+loggedInUserRole);
                Set<String> roleNamesSet = new Set<String>(roleNames);
                if(loggedInUserRole == null || (loggedInUserRole != null && roleNamesSet.contains(loggedInUserRole))) {
                   isLoggedInUserRoleValid = false; 
                } else {
                   isLoggedInUserRoleValid = true; 
                }
                /*if(roleNamesSet.contains(loggedInUserRole)) {
                    isLoggedInUserRoleValid = false;
                } else {
                    isLoggedInUserRoleValid = true;
                } */
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
    
    
    @AuraEnabled
    public static MA_ConsultantsResult fetchMAConsultants(Id maId, Decimal pageNumber, String columnName, String sortType){
        System.debug('fetchMAConsultants(Id maId,String columnName, String sortType) - START');
        
        System.debug('Input Parameters - maId-'+maId+' , pageNumber- '+pageNumber+' ,ColumnName-'+columnName+', SortOrder-'+sortType);
        
        List<OpportunityContactRole> maRecord = new List<OpportunityContactRole>();
        
        UHGMASOQLConstants uhgMASOQLConstants = new UHGMASOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        
        MA_ConsultantsResult maConsultantsResultResultObj = new MA_ConsultantsResult();
        
        try{
            
            Integer pageSize = uhgAccountConstants.APPLET_PAGESIZE;
            Integer offset = ((Integer)pageNumber - 1) * pageSize; 
            
            if(maId != null && columnName!=null && sortType!=null){
               // if(schema.sobjecttype.OpportunityContactRole.isaccessible() && schema.sobjecttype.OpportunityContactRole.isQueryable()) {
                    
                    String countQueryForPrimary = 'SELECT count() FROM OpportunityContactRole WHERE OpportunityId = :maId AND IsPrimary = true';
                    
                    Integer countForPrimaryRecord = Database.countQuery(countQueryForPrimary);
                    
                    maConsultantsResultResultObj.total = Database.countQuery(uhgMASOQLConstants.QUERY_FOR_MA_CONSULTANTS_COUNT);
                    
                    if(countForPrimaryRecord > 0){
                        String columnName2 = 'Contact.LastName';
                        String sortType2 = 'ASC';
                        System.debug('queryString -->>'+uhgMASOQLConstants.QUERY_FOR_MA_CONSULTANTS+columnName+' '+sortType+', '+columnName2+' '+sortType2+' '+uhgMASOQLConstants.QUERY_FOR_MA_CONSULTANTS_PAGESIZE);
                        maRecord  = Database.query(uhgMASOQLConstants.QUERY_FOR_MA_CONSULTANTS+columnName+' '+sortType+', '+columnName2+' '+sortType2+' '+uhgMASOQLConstants.QUERY_FOR_MA_CONSULTANTS_PAGESIZE);
                    }else{
                        columnName = 'Contact.LastName';
                        sortType = 'ASC';
                        maRecord  = Database.query(uhgMASOQLConstants.QUERY_FOR_MA_CONSULTANTS+columnName+' '+sortType+' '+uhgMASOQLConstants.QUERY_FOR_MA_CONSULTANTS_PAGESIZE);
                    }
                    
                    maConsultantsResultResultObj.maConsultants = maRecord;
                    maConsultantsResultResultObj.page = (Integer)pageNumber;
                    maConsultantsResultResultObj.pageSize = pageSize;
               /* }else {
                    throw new NoAccessException();
                }*/
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <fetchMAConsultants> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <fetchMAConsultants> '+ex.getMessage());
            System.debug('Error(NoAccessException) '+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <fetchMAConsultants> '+ex.getMessage());
            System.debug('Error(QueryException) <fetchMAConsultants> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <fetchMAConsultants> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }        
        
        System.debug('Ouput Parameters -> SortedList -'+maConsultantsResultResultObj.maConsultants);
        
        System.debug('fetchMAConsultants(Id accountId,String columnName, String sortType) - END');
        
        return maConsultantsResultResultObj;
    }
    
    @AuraEnabled
    public static List<OpportunityContactRole> relateContactToMA(String maId ,List<String> consultantIds, boolean isAllContacts){
        system.debug('Input Parameters -- maId--->>'+maId+'-- consultantIds-->>'+consultantIds);
        
        List<OpportunityContactRole> optyMemList = null;
        
        try{
            if(maId != null && consultantIds != null){
               // if(schema.sobjecttype.OpportunityContactRole.isAccessible() && schema.sobjecttype.OpportunityContactRole.isQueryable()){
                    boolean recordExists = false;
                    optyMemList = new List<OpportunityContactRole>();
                    
                    String queryStr = 'SELECT count() FROM OpportunityContactRole WHERE OpportunityId =: maId';
                    Integer recordCount = Database.countQuery(queryStr);
                    if(recordCount != 0){
                        recordExists = true;
                    }
                    
                    for(Integer i = 0; i<consultantIds.size(); i++){
                        OpportunityContactRole maRec = null;
                        if(i == 0){
                            if(recordExists){
                                maRec = new OpportunityContactRole(OpportunityId = maId, ContactId = consultantIds[i]);    
                            }else{
                                maRec = new OpportunityContactRole(OpportunityId = maId, ContactId = consultantIds[i], IsPrimary = true);
                            }
                            
                        }else{
                            maRec = new OpportunityContactRole(OpportunityId = maId, ContactId = consultantIds[i]);
                        }
                        optyMemList.add(maRec);
                    }
                    System.debug('optyMemList-->>'+optyMemList);
                    Database.SaveResult[] srList = Database.insert(optyMemList, false);
                    
                    for(Database.SaveResult sr : srList){
                        if(sr.isSuccess()){
                            System.debug('Successfully inserted');
                            if(!recordExists){
                                updatePrimaryId(maId, consultantIds[0], false, 'apex');
                            }
                            System.debug('isAllContacts-->>'+isAllContacts);
                            if(isAllContacts){
                                List<AccountContactRelation> acrList = new List<AccountContactRelation>();
                                Opportunity conDetails = [SELECT AccountId FROM Opportunity WHERE Id = :maId];
                                Id accId = conDetails.AccountId;
                                boolean acrRecordExists = false;
                                
                                System.debug('accId--->>'+accId);
                                
                                String countquery = 'SELECT count() FROM AccountContactRelation WHERE AccountId = :accId AND IsDirect = false';
                                Integer countACRRecords = Database.countQuery(countQuery);
                                if(countACRRecords != 0){
                                    acrRecordExists = true;
                                }
                                
                                List<Contact> noDirectConsultantList =  [SELECT Id FROM Contact WHERE Contact.Status__c = 'Active' AND Name =: System.Label.No_Consultant_Name AND RecordType.Name = 'Consultant' LIMIT 1];
                                Id uhgNoDirectConsultantId;
                                if(noDirectConsultantList != null && noDirectConsultantList.size() > 0) {
                                    uhgNoDirectConsultantId = noDirectConsultantList[0].Id;
                                }
                                
                                for(Integer i = 0; i<consultantIds.size(); i++){
                                    AccountContactRelation acrrecord = null;
                                    
                                    Boolean isUHGNoDirectConsultantExists = false;
                                    if(uhgNoDirectConsultantId != null && uhgNoDirectConsultantId == consultantIds[i]) {
										isUHGNoDirectConsultantExists = true;  
                                    } else {
										isUHGNoDirectConsultantExists = false;  
                                    } 
                                    
                                    if(isUHGNoDirectConsultantExists == false) {
                                        if(i == 0){
                                            if(acrRecordExists){
                                                acrrecord = new AccountContactRelation(AccountId = accId, ContactId = consultantIds[i]);
                                            }else{
                                                acrrecord = new AccountContactRelation(AccountId = accId, ContactId = consultantIds[i], Primary__c = true);
                                            }
                                            
                                        }else{
                                            acrrecord = new AccountContactRelation(AccountId = accId, ContactId = consultantIds[i]);
                                        }
                                        acrList.add(acrrecord);
                                    }
                                }
                                
                                Database.SaveResult[] acrSaveresults = Database.insert(acrList, false);
                                for(Database.SaveResult acrRes : acrSaveresults){
                                    if(acrRes.isSuccess()){
                                        System.debug('Successfully updated in Account Contact relation');
                                    }else{
                                        for(Database.Error err : acrRes.getErrors()) {
                                            System.debug('The following error has occurred.');                   
                                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                            System.debug('Account fields that affected this error: ' + err.getFields());
                                        }
                                    }
                                }
                                
                            }
                        }else{
                            for(Database.Error err : sr.getErrors()) {
                                System.debug('The following error has occurred.');                   
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('Account fields that affected this error: ' + err.getFields());
                            }
                        }
                    }
               /* }
                else{
                    throw new NoAccessException();
                }*/
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of MA object from SF in '+'relateContactToMA() method ->'+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in relateContactToMA() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in relateContactToMA() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(DmlException dmlException){
            System.debug('DML Exception(Stack Trace) occurred in relateContactToMA() method while updating the '+
                         'details of OpportunityContactRole from SF -> '+dmlException.getStackTraceString());
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
        }
        catch(Exception e){
            System.debug('Exception message - '+e.getLineNumber()+' Message'+e.getMessage());
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        return optyMemList;        
    }
    
    @AuraEnabled
    public static boolean deleteRelationship(String maId, String consultantId, String primaryId){
        
        System.debug('Input parameters -- >> maId'+maId+'----consultantId--->>'+consultantId+'----primaryId--->>'+primaryId);
        UHGMASOQLConstants uhgQyeryConstants = new UHGMASOQLConstants();
        boolean deleteSuccess = false;
        String sobjectName = null;
        Database.DeleteResult[] deleteResults = null;
        
        if(primaryId == null){
            primaryId = '';
        }
        
        try{
            if(maId != null && consultantId != null){
                //if(schema.sobjecttype.OpportunityContactRole.isAccessible() && schema.sobjecttype.OpportunityContactRole.isQueryable()){
                    
                    String q = 'SELECT Id FROM OpportunityContactRole WHERE OpportunityId = :maId AND ContactId = :consultantId';
                    OpportunityContactRole[] conRel = Database.query(q);
                    if(!conRel.isEmpty()){
                        deleteResults = Database.delete(conRel, false);
                        deleteSuccess = deleteResults[0].isSuccess();
                        System.debug('deleteSuccess-->>'+deleteSuccess);    
                    }
                    
                    
                    if(deleteResults != null && deleteResults.size() > 0){
                        for(Database.DeleteResult maConsultantResult : deleteResults){
                            if(!maConsultantResult.isSuccess()){
                                String errMsg = '';
                                String errStatusCode = '';
                                boolean flag = false;
                                for(Database.Error err : maConsultantResult.getErrors()){
                                    System.debug('err.getStatusCode()-->>>'+err.getStatusCode());
                                    errStatusCode = String.valueOf(err.getStatusCode());
                                    if(errStatusCode.equals('ENTITY_IS_DELETED')){
                                        System.debug('No Exception to throw!');
                                    }else{
                                        System.debug('The following error has occurred.');                    
                                        System.debug(err.getStatusCode() + ':' + err.getMessage());
                                        System.debug('Fields that affected this error: ' + err.getFields());
                                        errMsg = errMsg+err.getMessage();
                                        flag = true;
                                    }
                                }
                                if(flag){
                                    throw new MyException('DML Exception --delete contact -->>'+errMsg);    
                                }
                                
                            }
                        }
                    }
                //}
                //else{
                   // throw new NoAccessException();
                //}
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'deleteRelationship() method ->'+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in deleteRelationship() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in deleteRelationship() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'deleteRelationship() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in deleteRelationship() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        return deleteSuccess;
    }
    
    @AuraEnabled
    public static Opportunity updatePrimaryId(String maId, String consultantId, boolean clearPrimaryFields, String operation){
        
        System.debug('Input Parameters -- updatePrimaryId--  maId->>>'+maId+'---consultantId-->>'+consultantId+'--operation-->>'+operation+'---clearPrimaryFields-->>'+clearPrimaryFields);
        
        List<Opportunity> optyList = new List<Opportunity>();
        Opportunity optyDetail = new Opportunity();
        
        try{
            if(maId != null && consultantId != null){
                //if(schema.sobjecttype.Opportunity.isAccessible() && schema.sobjecttype.Opportunity.isQueryable()){
                    
                    optyDetail = [SELECT Id FROM Opportunity WHERE Id=: maId];
                    System.debug('optyDetail-->>'+optyDetail);
                    
                    if(clearPrimaryFields){
                        optyDetail.PrimaryConsultant__c = null;
                        optyDetail.Primary_Consulting_Firm__c = null;
                        clearPrimaryRoleFieldForAllRecords(maId);
                    }
                    else{
                        
                        Contact conDetail = [SELECT AccountId FROM Contact WHERE Id= :consultantId];
                        System.debug('conDetail->>'+conDetail.AccountId);
                        
                        optyDetail.PrimaryConsultant__c = consultantId;
                        optyDetail.Primary_Consulting_Firm__c = conDetail.AccountId;
                        
                        clearPrimaryRoleFieldForAllRecords(maId);
                        updateRoleInMA(maId, consultantId);
                    }
                    
                    optyList.add(optyDetail);
                    
                    Database.SaveResult[] saveResults = Database.update(optyList, false);
                    
                    if(saveResults != null && saveResults.size() > 0) {
                        // Iterate through each returned result
                        for (Database.SaveResult updateAcctFieldsResult : saveResults) {
                            if(!updateAcctFieldsResult.isSuccess()) {
                                String errMsg = '';
                                for(Database.Error err : updateAcctFieldsResult.getErrors()) {
                                    System.debug('The following error has occurred.');                    
                                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                    System.debug('Fields that affected this error: ' + err.getFields());
                                    errMsg = errMsg+err.getMessage();
                                }
                                throw new MyException('DML Exception -->>'+errMsg);
                            }
                        }
                    }
                /*}
                else{
                    throw new NoAccessException();
                }*/
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Contact object from SF in '+'updatePrimaryId() method ->'+nullPointerEx.getMessage());
            if(operation.equalsIgnoreCase('helper')){
                throw new AuraHandledException('Null Pointer Exception Occurred -->>'+nullPointerEx.getMessage());    
            }else if(operation.equalsIgnoreCase('apex')){
                throw new MyException('Null Pointer Exception -->>'+nullPointerEx.getMessage());    
            }
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in updatePrimaryId() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in updatePrimaryId() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            if(operation.equalsIgnoreCase('helper')){
                throw new AuraHandledException('No Access Exception Occurred -->>'+noaccessExec.getMessage());    
            }else if(operation.equalsIgnoreCase('apex')){
                throw new MyException('No Access Exception -->>'+noaccessExec.getMessage());    
            }
        }catch(Exception e){
            System.debug('Exception message - '+e.getLineNumber()+' Message--'+e.getMessage());
            if(operation.equalsIgnoreCase('helper')){
                throw new AuraHandledException('Exception Occured -->>'+e.getMessage());    
            }else if(operation.equalsIgnoreCase('apex')){
                throw new MyException('-->>'+e.getMessage());    
            }
        }
        
        return optyDetail;
    }
    
    @AuraEnabled
    public static void updateRoleInMA(String maId, String contactId){
        
        System.debug('Input Parameters---  maId-->>'+maId+'--contactId-->>'+contactId);
        
        List<OpportunityContactRole> maContactJunctionRecords = new List<OpportunityContactRole>();
        OpportunityContactRole maCRecord = new OpportunityContactRole();
        try{
            if(maId != null && contactId != null){
                //if(schema.sobjecttype.OpportunityContactRole.isAccessible() && schema.sobjecttype.OpportunityContactRole.isQueryable()){
                    maCRecord = [SELECT Id FROM OpportunityContactRole WHERE OpportunityId =: maId AND ContactId =: contactId];
                    maCRecord.IsPrimary = true;
                    
                    maContactJunctionRecords.add(maCRecord);
                    
                    Database.SaveResult[] saveResults = Database.update(maContactJunctionRecords, false);
                    
                    if(saveResults != null && saveResults.size() > 0) {
                        // Iterate through each returned result
                        for (Database.SaveResult updateFieldsResult : saveResults) {
                            if(!updateFieldsResult.isSuccess()) {
                                String errMsg = '';
                                for(Database.Error err : updateFieldsResult.getErrors()) {
                                    System.debug('The following error has occurred.');                    
                                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                    System.debug('Fields that affected this error: ' + err.getFields());
                                    errMsg = errMsg+err.getMessage();
                                }
                                throw new MyException('DML Exception -->>'+errMsg);
                            }
                        }
                    }
                /*}
                
                else{
                    throw new NoAccessException();
                }*/
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'updateRoleInAccountContactRelation() method ->'+nullPointerEx.getMessage());
            throw new MyException('Null Pointer Exception -->>'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in updateRoleInAccountContactRelation() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in updateRoleInAccountContactRelation() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new MyException('No Access Exception -->>'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Contact object from SF in '+
                         'updateRoleInAccountContactRelation() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in updateRoleInAccountContactRelation() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new MyException('Query Exception -->>'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e.getLineNumber()+' Message'+e.getMessage());
            throw new MyException('Exception -->>'+e.getMessage());
        }
        
    }
    
    @AuraEnabled
    public static void clearPrimaryRoleFieldForAllRecords(String maId){
        
        System.debug('Input Parameters -- maId--->>'+maId);
        
        UHGMASOQLConstants uhgAccountQuery = new UHGMASOQLConstants();
        List<OpportunityContactRole> recordList = new List<OpportunityContactRole>();
        try{
            if(maId != null){
                if(schema.sobjecttype.AccountContactRelation.isAccessible() && schema.sobjecttype.AccountContactRelation.isQueryable()){
                    String query1 = 'SELECT Id FROM OpportunityContactRole WHERE OpportunityId =: maId';
                    recordList = Database.query(query1);
                    
                    for(OpportunityContactRole record : recordList){
                        record.IsPrimary = false;    
                    }
                    Database.SaveResult[] saveResults = Database.update(recordList, false);
                    
                    if(saveResults != null && saveResults.size() > 0) {
                        // Iterate through each returned result
                        for (Database.SaveResult clearAcctFieldsResult : saveResults) {
                            if(!clearAcctFieldsResult.isSuccess()) {
                                String errMsg = '';
                                for(Database.Error err : clearAcctFieldsResult.getErrors()) {
                                    System.debug('The following error has occurred.');                    
                                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                    System.debug('Fields that affected this error: ' + err.getFields());
                                    errMsg = errMsg+err.getMessage();
                                }
                                throw new MyException('DML Exception -->>'+errMsg);
                            }
                        }
                    }
                }
                
                else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of AccountContactRelation object from SF in '+'clearPrimaryRoleFieldForAllRecords() method ->'+nullPointerEx.getMessage());
            throw new MyException('Null Pointer Exception -->>'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in clearPrimaryRoleFieldForAllRecords() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in clearPrimaryRoleFieldForAllRecords() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new MyException('No Access Exception -->>'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Contact object from SF in '+
                         'clearPrimaryRoleFieldForAllRecords() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in clearPrimaryRoleFieldForAllRecords() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new MyException('Query Exception -->>'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e.getLineNumber()+' Message'+e.getMessage());
            throw new MyException('Exception -->>'+e.getMessage());
        }
    }
    
    @AuraEnabled
    public static ConsultantSearchResult getConsultants(String searchKeyVal, Decimal pageNumber, String searchField, String operator, String contactRecordTypeId, Id maID, boolean allContacts, List<String> existingConIds) {
        System.debug('inside getConsultants');
        System.debug('Input Parameters -> searchKeyVal-'+searchKeyVal+', pageNumber-'+pageNumber+
                     ', searchField-'+searchField+'and operator-'+operator+'---maID---'+maID+'----contactRecordTypeId-----'+contactRecordTypeId);
        
        System.debug('allContacts-->>'+allContacts);
        
        boolean isFromQA = false;
        
        String sobjectType = maID.getSObjectType().getDescribe().getName();
        
        if(sobjectType.equalsIgnoreCase('Account')){
            isFromQA = true;
        }
        
        UHGMASOQLConstants uhgQueryConstants = new UHGMASOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        ConsultantSearchResult consultantResultObj = new ConsultantSearchResult();
        //contactRecordTypeId = '012c00000001CxeAAE';
        System.debug('contactRecordTypeId.length()-->>'+contactRecordTypeId.length());
        if(contactRecordTypeId.length() == 0)
        {
            contactRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        }   
        System.debug('contactRecordTypeId-->>'+contactRecordTypeId);
        
        try {
            
            String searchKey = '';
            
            if(searchKeyVal != null && searchKeyVal.trim().length() > 0 &&
               searchField != null && searchField.trim().length() > 0 && 
               operator != null && operator.trim().length() > 0) {    
                   if(searchField.equalsIgnoreCase(uhgAccountConstants.LAST_NAME)) {
                       searchField = uhgAccountConstants.LAST_NAME_ITAG;       
                   } else  if(searchField.equalsIgnoreCase(uhgAccountConstants.FIRST_NAME)) {
                       searchField = uhgAccountConstants.FIRST_NAME_ITAG;       
                   }  else  if(searchField.equalsIgnoreCase(uhgAccountConstants.CONSULTING_FIRM)) {
                       searchField = uhgAccountConstants.CONTACT_CONSULTING_FIRM_ITAG;       
                   }
                   
                   if(operator.equalsIgnoreCase(uhgAccountConstants.BEGINS_WITH)) {
                       searchKey = searchKeyVal + '%';
                   } else if(operator.equalsIgnoreCase(uhgAccountConstants.CONTAINS)) {
                       searchKey = '%' + searchKeyVal + '%';
                   } else if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                       searchKey = searchKeyVal;
                   }
               } 
            
            String userStatus = 'Active';
            Integer pageSize = uhgAccountConstants.POPUP_PAGESIZE;
            Integer offset = ((Integer)pageNumber - 1) * pageSize; 
            
            
            if(schema.sobjecttype.Contact.isAccessible()) {
                
                List<OpportunityContactRole> maConRecord = new List<OpportunityContactRole>();
                
                maConRecord = Database.query('SELECT ContactId FROM OpportunityContactRole WHERE OpportunityId =:maID');
                Set<Id> contactIds = new Set<Id>();
                consultantResultObj.recordExists = false;
                if(!maConRecord.isEmpty()){
                    for(OpportunityContactRole acR : maConRecord){
                        System.debug(acR.ContactId);
                        contactIds.add(acR.ContactId);
                    }
                }else{
                    consultantResultObj.recordExists = true;
                }
                
                System.debug('contact Ids --->>'+contactIds);
                
                if(isFromQA){
                    for(String s : existingConIds){
                        contactIds.add(s);
                    }
                }
                
                if(searchKey != null && searchKey.trim().length() > 0) {
                    if(allContacts){
                        System.debug('allContacts--');
                        consultantResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_COUNT_ALLCONSULTANTS+' and '+searchField+' LIKE :searchKey');
                        if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                            
                            consultantResultObj.consultantList = Database.query(uhgQueryConstants.QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_SEARCH_ALLCONSULTANTS+searchField+uhgQueryConstants.QUERY_MA_CONSULTANTS_EQUALS+uhgQueryConstants.QUERY_MA_CONSULTANTS_PAGINATION_OFFSET);
                        } else {
                            
                            consultantResultObj.consultantList = Database.query(uhgQueryConstants.QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_SEARCH_ALLCONSULTANTS+searchField+uhgQueryConstants.QUERY_MA_CONSULTANTS_CONTAINS_LIKE+uhgQueryConstants.QUERY_MA_CONSULTANTS_PAGINATION_OFFSET); 
                            System.debug('consultantResultObj.consultantList'+consultantResultObj.consultantList);
                        }
                    }
                    else{
                        Id maParentAccId = null;
                        if(isFromQA){
                            maParentAccId = maID;
                        }else{
                            Opportunity opty = [SELECT AccountId FROM Opportunity WHERE Id =:maID];    
                            maParentAccId = opty.AccountId;
                        }
                        System.debug('maParentAccId-->>'+maParentAccId);
                        if(searchField.equalsIgnoreCase('LastName')){
                            searchField = 'Contact.LastName';    
                        }
                        else if(searchField.equalsIgnoreCase('FirstName')){
                            searchField = 'Contact.FirstName';    
                        }
                        else if(searchField.equalsIgnoreCase('Account.Name')){
                            searchField = 'Contact.Account.Name';    
                        }
                        
                        consultantResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_COUNT+' and '+searchField+' LIKE :searchKey');
                        if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                            
                            consultantResultObj.relatedConsultantList = Database.query(uhgQueryConstants.QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_SEARCH+searchField+uhgQueryConstants.QUERY_MA_CONSULTANTS_EQUALS+uhgQueryConstants.QUERY_MA_CONSULTANTS_PAGINATION_OFFSET1);
                        } else {
                            consultantResultObj.relatedConsultantList = Database.query(uhgQueryConstants.QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_SEARCH+searchField+uhgQueryConstants.QUERY_MA_CONSULTANTS_CONTAINS_LIKE+uhgQueryConstants.QUERY_MA_CONSULTANTS_PAGINATION_OFFSET1); 
                            System.debug('consultantResultObj.consultantList'+consultantResultObj.consultantList);
                        }
                    }
                    
                    
                }
                else {
                    if(allContacts){
                        System.debug('allContacts--');
                        consultantResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_COUNT_ALLCONSULTANTS);
                        consultantResultObj.consultantList = Database.query(uhgQueryConstants.QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_CONTACT_ALLCONSULTANTS);
                    }
                    else{
                        Id maParentAccId = null;
                        if(isFromQA){
                            maParentAccId = maID;
                        }else{
                            Opportunity opty = [SELECT AccountId FROM Opportunity WHERE Id =:maID];    
                            maParentAccId = opty.AccountId;
                        }
                        consultantResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_COUNT);
                        consultantResultObj.relatedConsultantList = Database.query(uhgQueryConstants.QUERY_AND_REMOVE_DUPLICATE_MA_CONSULTANTS_FROM_POPUP_CONTACT_CONTACT);
                    }
                    
                }
                
                consultantResultObj.page = (Integer)pageNumber;
                consultantResultObj.pageSize = pageSize;
                
            } else {
                throw new NoAccessException();
            }
            
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the User object from SF in getConsultants() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getConsultants() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('NoAccessException Occured----'+noaccessExec.getMessage());
        } catch(QueryException queryExec) {
            System.debug('Error(QueryException) occurred while querying the details of User object from SF in '+
                         'getConsultants() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getConsultants() method, the Stack Trace is -> '+queryExec.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryExec.getMessage());
        } catch(Exception e) {
            System.debug('Error occurred in getConsultants() method while querying the User details from SF -> '+e.getMessage());
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        System.debug('Output Parameters -> Consultants List-'+consultantResultObj.consultantList+', Page-'+consultantResultObj.page+
                     ', PageSize-'+consultantResultObj.pageSize+'and TotalNoOfPages-'+consultantResultObj.total);
        
        System.debug('getConsultants(String searchKeyVal, Decimal pageNumber, String searchField, String operator) - END');
                    
        
        return consultantResultObj;
    }
    
    @AuraEnabled
    public static boolean sendMailFromApex(String lName, String fName, String account, String address, String phone, String email,String jobTitle,Opportunity opportunityData,boolean isFromQA,String maId,String accName){
        System.debug('Input Parameters -- lName--'+lName+' ,fName--'+fName+' ,account--'+account+', address--'+address+', phone--'+phone+', email--'+email+', maId'+maId+'opportunityData-'+opportunityData+', jobTitle-'+jobTitle);
        boolean is_success = false;
        Boolean isOpty = false;
        Opportunity opp = new Opportunity();
        String emptyDate = '';
        boolean isDateNull = false;
        String sObjName ='';
         Id id ;
        if(maId != null &&  maId != ''){
           id = (Id)maId;   
        }    
       
            if(id != null){
                sObjName   = id.getSObjectType().getDescribe().getName();
            }
        String name = '';
        String rowId = '';
        DateTime effectiveDate ;
        String companyName = '';
        
        if(opportunityData != null &&(sObjName == '') && isFromQA ){
            
            rowId = '';
            name = opportunityData.Name;
            
            effectiveDate = opportunityData.EffectiveDate__c;
            companyName = accName;
            
        }
        
        if(sObjName != null && sObjName != '' && sObjName.equalsIgnoreCase('Opportunity') && isFromQA == false ){
           isOpty = true; 
        }
        
        if(isOpty){
            opp = [SELECT Id, Name, Account.Name, EffectiveDate__c FROM Opportunity WHERE Id=: id LIMIT 1];
            rowId = opp.Id;
            if(opp.EffectiveDate__c == null){
                isDateNull = true;
            } 
            name = opp.Name;
            effectiveDate = opp.EffectiveDate__c;
            companyName = opp.Account.Name;
            
        }else if(sObjName != null && sObjName != '' && sObjName.equalsIgnoreCase('Account')){
            Account acc = [Select Id,Name From Account where Id=:id LIMIT 1];
            name = acc.Name;
            rowId = acc.Id;
        }
        
        
        String receiverEmail = System.Label.MA_Consultant_Send_Email_Receiver;
        System.debug(' receiverEmail  > >>>>> '+receiverEmail);
        List<string> emaillst =new List<string>();
        emaillst.add(receiverEmail);
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        message.toAddresses = emaillst;
        message.optOutPolicy = 'FILTER';
        
        message.subject = System.Label.MA_Consultant_Send_Email_Subject;
        
        String emailBody = 'Requestor:'+'<br/>';
        emailBody += UserInfo.getName()+'<br/><br/>';
       
        
        if((isFromQA) || (isOpty)){
            emailBody += 'Membership Activity Information:<br/>';    
        }else{
            emailBody += 'Company Information:<br/>'; 
        }
        
        emailBody += 'Name: '+name+'<br/>';
        if((isFromQA) ||(isOpty)){
            if(isDateNull){
                emailBody += 'Effective Date: '+emptyDate+'<br/>';    
            }else{
                if(effectiveDate != null){
                DateTime yourDate = effectiveDate;
                yourDate= yourDate.addDays(1);
                String dateOutput = yourDate.format('M/d/yyyy');
                emailBody += 'Effective Date: '+dateOutput+'<br/>';
                }
                else{
                   emailBody += 'Effective Date: '+emptyDate+'<br/>';     
                }
               
            }
        }
        emailBody += 'Row Id: '+rowId+'<br/>';
        if((isFromQA) ||(isOpty)){
            emailBody += 'Company: '+companyName+'<br/><br/>';
        }
        emailBody += 'Consultant Information:<br/> ';
        emailBody += 'First Name: '+fName+'<br/>';
        emailBody += 'Last Name: '+lName+'<br/>';
        emailBody += 'Job Title: '+jobTitle+'<br/>';
        emailBody += 'Consulting Firm\\ Office Location: '+account+'<br/>';
        emailBody += 'Address: '+address+'<br/>';
        emailBody += 'Email: '+email+'<br/>';
        emailBody += 'Phone #: '+phone+'<br/>';
        
        message.setHtmlBody(emailBody);
        
        Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {message};
            Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
        if (results[0].success) {
            is_success=true;           
        } else {
            is_success=false;
            System.debug('The email failed to send: '+ results[0].errors[0].message);
        }
        return is_success;
    }
    
    public class MA_ConsultantsResult {
        
        @AuraEnabled
        public List<OpportunityContactRole> maConsultants{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
    }
    
    public class ConsultantSearchResult {
        
        @AuraEnabled
        public List<Contact> consultantList{ get;set; }
        
        @AuraEnabled
        public List<AccountContactRelation> relatedConsultantList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public boolean recordExists { get;set; }
        
    }
}