/****************************************************************** ***** 
Name: Account_Consultants_Class 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query all Consultants/ Consulting Firms of a particular Account In The Account Consultants(CM)/ Consultants(CD) Lightning Component.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Abhishek Kumar  	 	20/07/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/

public without sharing class Account_Consultants_Class {
    
    /*******************************************************************
* 
Purpose: Query the Role of the Logged In User for Add/Edit/Delete functionality
Parameters: 
Returns: boolean
Throws [Exceptions]: QueryException, Exception

********************************************************************
*/ 
    
    @AuraEnabled
    public static boolean getLoggedInUserRoles(String accountId){
        
        boolean isLoggedInUserRoleValid = true;
        
        try{
            /*User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                String[] roleNames = System.Label.CM_CD_Consultants_Not_Allowed_Roles_For_Edit.split(',');
                System.debug('roleNames-->>'+roleNames);
                System.debug('loggedInUserRole-->>'+loggedInUserRole);
                Set<String> roleNamesSet = new Set<String>(roleNames);
                if(roleNamesSet.contains(loggedInUserRole)) {
                    isLoggedInUserRoleValid = false;
                } else {
                    isLoggedInUserRoleValid = true;
                }
            }
            System.debug('isLoggedInUserRoleValid-->>'+isLoggedInUserRoleValid);*/
           isLoggedInUserRoleValid = UserInformationClass.hasEditAccessToRecord(accountId);            

        }/*catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the Role of Logged In User from SF in '+
                         'getLoggedInUserRoles() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getLoggedInUserRoles() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }*/catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        return isLoggedInUserRoleValid;
    }
    
    /************************************************************************************
* 
Purpose: Query the Record Type of Account 
Parameters: accountId
Returns: accountConsultantsInitialValues
Throws [Exceptions]: NullPointerException, NoAccessException, QueryException, Exception

******************************************************************************************
*/ 
    
    @AuraEnabled    
    public static accountConsultantsInitialValues getAccountType(Id accountId){
        String accountType = null;
        Id contactrecordTypeId = null;
        
        UHGAccountConstants uhgConstants = new UHGAccountConstants();
        accountConsultantsInitialValues accountConsultantsInitialResults = null;
        
        try{
            if(accountId != null){
                if(schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.Account.isAccessible()) {
                    
                    accountConsultantsInitialResults = new accountConsultantsInitialValues();
                    accountConsultantsInitialResults.pageSize = uhgConstants.APPLET_PAGESIZE;
                    
                    Account accountCategory = Database.query('select Category__c from Account where Id=:accountId');
                    
                    contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
                    accountConsultantsInitialResults.accountType = accountCategory.Category__c;	
                    
                    accountConsultantsInitialResults.contactTypeId = contactrecordTypeId;
                    
                }else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Contact object from SF in getAccountType() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in getAccountType() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountType() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'getAccountType() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getAccountType() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        System.debug('accountConsultantsInitialResults'+accountConsultantsInitialResults);
        return accountConsultantsInitialResults;
    }
    
        /************************************************************************************ 
Purpose: Query the sorted list of consultants & account consultants associated to the Account
Parameters: aaccountId, contactRecordType
Returns: sortList
Throws [Exceptions]: NoAccessException, NullPointerException, QueryException, Exception

*****************************************************************************************/ 
    
	@AuraEnabled 
    public static sortList getSortedList(Id accountId,String contactRecordType){
        System.debug('Input parameters -- accountId--- >>'+accountId+'---contactRecordType-->>'+contactRecordType);
        
        String status = 'Active';
        
        sortList sortedList = new sortList();
        
        UHGAccountSOQLConstants uhgQyeryConstants = new UHGAccountSOQLConstants();
        
        List<AccountContactRelation> acc = new List<AccountContactRelation>();
        
        List<AccountContactRelation> accountContactRelationPrimaryRecord = new List<AccountContactRelation>();
        List<AccountContactRelation> accountContactRelationNonPrimaryRecord = new List<AccountContactRelation>();
        
        List<AccountContactRelation> accountContactRelationRecords = new List<AccountContactRelation>();
        
        List<Account> accDetailsList = new List<Account>();
        List<AccountCFJunction__c> partnerAccounts  = new List<AccountCFJunction__c>();
        
        try{
            if(accountId != null){
                if(schema.sobjecttype.Contact.isQueryable() && schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.Account.isaccessible()){
                    accountContactRelationPrimaryRecord = Database.query(uhgQyeryConstants.QUERY_STRING_CMCD_ACCOUNT_CONSULTANTS_PRIMARY);  
                    accountContactRelationNonPrimaryRecord = Database.query(uhgQyeryConstants.QUERY_STRING_CMCD_ACCOUNT_CONSULTANTS_NON_PRIMARY);
                    
                    if(!accountContactRelationPrimaryRecord.isEmpty()){
                        accountContactRelationRecords.add(accountContactRelationPrimaryRecord[0]);
                    }
                    
                    if(!accountContactRelationNonPrimaryRecord.isEmpty()){
                        
                        accountContactRelationRecords.addAll(accountContactRelationNonPrimaryRecord);
                    }
                    
                    if(!accountContactRelationRecords.isEmpty())	{
                        for(AccountContactRelation acRecord : accountContactRelationRecords){
                            if(acRecord.Contact.Title == null){
                                acRecord.Contact.Title = '';
                            }
                            if(acRecord.Contact.ConsultantTier__c == null){
                                acRecord.Contact.ConsultantTier__c = '';
                            }
                            if(acRecord.Contact.MailingCity == null){
                                acRecord.Contact.MailingCity = '';
                            }
                            if(acRecord.Contact.MailingState == null){
                                acRecord.Contact.MailingState = '';
                            }
                        }
                    }
                    
                    sortedList.consultantList = accountContactRelationRecords;
                    
                    partnerAccounts = Database.query(uhgQyeryConstants.QUERY_STRING_CMCD_ACCOUNT_CONSULTANT_FIRM);  
                    
                    if(!partnerAccounts.isEmpty()){
                        for(Integer i = 0; i < partnerAccounts.size(); i++ ){
                            String accId = partnerAccounts.get(i).ConsultingFirm__c;
                            Account accList = getPartnerAccountDetails(accId);   
                            accDetailsList.add(accList);
                        }
                    }
                    
                    System.debug('accDetailsList--->>'+accDetailsList);
                    sortedList.accountList = accDetailsList;
                    
                }
                else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'getAllConsultants() method ->'+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in getAllConsultants() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAllConsultants() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'getAllConsultants() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getAllConsultants() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        return sortedList;
    }
    
    
    /************************************************************************************ 
Purpose: Query the consultants associated to the Account
Parameters: aaccountId
Returns: List<AccountContactRelation>
Throws [Exceptions]: NoAccessException, NullPointerException, QueryException, Exception

*****************************************************************************************/ 
    
    @AuraEnabled
    public static List<AccountContactRelation> getAllConsultants(String accountId, String contactRecordType){
        
        System.debug('Input parameters -- accountId--- >>'+accountId+'---contactRecordType-->>'+contactRecordType);
        
        String status = 'Active';
        
        UHGAccountSOQLConstants uhgQyeryConstants = new UHGAccountSOQLConstants();
        
        List<AccountContactRelation> acc = new List<AccountContactRelation>();
        
        List<AccountContactRelation> accountContactRelationPrimaryRecord = new List<AccountContactRelation>();
        List<AccountContactRelation> accountContactRelationNonPrimaryRecord = new List<AccountContactRelation>();
        
        List<AccountContactRelation> accountContactRelationRecords = new List<AccountContactRelation>();
        
        try{
            if(accountId != null){
                if(schema.sobjecttype.Contact.isQueryable() && schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.Account.isaccessible()){
                    // acc = Database.query('SELECT Id, (SELECT IsDirect, Contact.Id, Contact.FirstName, Contact.LastName, Contact.Title, Contact.ConsultantTier__c, Contact.MailingCountry, Contact.MailingCity, Contact.MailingState, Contact.Account.Name, Contact.Account.Id FROM AccountContactRelations WHERE IsDirect=false AND Contact.Status__c=: status) FROM Account WHERE Id =:accountId');     
                    accountContactRelationPrimaryRecord = Database.query(uhgQyeryConstants.QUERY_STRING_CMCD_ACCOUNT_CONSULTANTS_PRIMARY);  
                    accountContactRelationNonPrimaryRecord = Database.query(uhgQyeryConstants.QUERY_STRING_CMCD_ACCOUNT_CONSULTANTS_NON_PRIMARY);
                    
                    if(!accountContactRelationPrimaryRecord.isEmpty()){
                        accountContactRelationRecords.add(accountContactRelationPrimaryRecord[0]);
                    }
                    
                    if(!accountContactRelationNonPrimaryRecord.isEmpty()){
                        
                        accountContactRelationRecords.addAll(accountContactRelationNonPrimaryRecord);
                    }
                    
                    if(!accountContactRelationRecords.isEmpty())	{
                        for(AccountContactRelation acRecord : accountContactRelationRecords){
                            if(acRecord.Contact.Title == null){
                                acRecord.Contact.Title = '';
                            }
                            if(acRecord.Contact.ConsultantTier__c == null){
                                acRecord.Contact.ConsultantTier__c = '';
                            }
                            if(acRecord.Contact.MailingCity == null){
                                acRecord.Contact.MailingCity = '';
                            }
                            if(acRecord.Contact.MailingState == null){
                                acRecord.Contact.MailingState = '';
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
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'getAllConsultants() method ->'+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in getAllConsultants() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAllConsultants() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'getAllConsultants() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getAllConsultants() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        //List<Account> acc = [SELECT Id, (SELECT IsDirect, Contact.Id, Contact.FirstName, Contact.LastName, Contact.Title, Contact.MailingCountry, Contact.Account.Name, Contact.Account.Id FROM AccountContactRelations WHERE IsDirect=false AND Contact.Status__c=: status) FROM Account WHERE Id =:accountId];
        return accountContactRelationRecords;
    }
    
    /*************************************************************************************
* 
Purpose: Query the accounts associated to the account 
Parameters: accountId
Returns: List<Account>
Throws [Exceptions]: NoAccessException, NullPointerException, QueryException, Exception

******************************************************************************************
*/ 
    
    @AuraEnabled
    public static List<Account> getPartnerAccounts(String accountId){
        System.debug('Input Parameters -- accountId -->>'+accountId);
        
        UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        
        List<Account> accDetailsList = new List<Account>();
        List<AccountCFJunction__c> partnerAccounts  = new List<AccountCFJunction__c>();
        
        try{
            if(accountId != null){
                if(schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.Account.isAccessible()){
                    System.debug('QUERY_STRING_CMCD_ACCOUNT_CONSULTANT_FIRM-->>'+uhgQueryConstants.QUERY_STRING_CMCD_ACCOUNT_CONSULTANT_FIRM);
                    partnerAccounts = Database.query(uhgQueryConstants.QUERY_STRING_CMCD_ACCOUNT_CONSULTANT_FIRM);  
                    
                    if(!partnerAccounts.isEmpty()){
                        for(Integer i = 0; i < partnerAccounts.size(); i++ ){
                            String accId = partnerAccounts.get(i).ConsultingFirm__c;
                            Account accList = getPartnerAccountDetails(accId);   
                            accDetailsList.add(accList);
                        }
                    }
                    
                    System.debug('accDetailsList--->>'+accDetailsList);
                }
                else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'getPartnerAccounts() method ->'+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in getPartnerAccounts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getPartnerAccounts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('NoAccessException Occured----'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'getPartnerAccounts() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getPartnerAccounts() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        
        //   List<AccountCFJunction__c> par = [SELECT AccountFirm__c, ConsultingFirm__c FROM AccountCFJunction__c WHERE AccountFirm__c=: accountId];
        /*for(Integer i = 0; i < par.size(); i++ ){
String accId = par.get(i).ConsultingFirm__c;
Account accList = getPartnerAccountDetails(accId);   
accDetailsList.add(accList);
}
System.debug('----.....accDetailsList--- -'+accDetailsList);*/
        return accDetailsList; 
    }
    
    /*****************************************************************************************
Purpose: Query the accounts details of the associated account
Parameters: accountId
Returns: Account
Throws [Exceptions]: NoAccessException, NullPointerException, QueryException, Exception
*****************************************************************************************/
    
    @AuraEnabled
    public static Account getPartnerAccountDetails(String accountId){
        
        UHGAccountSOQLConstants uhgQyeryConstants = new UHGAccountSOQLConstants();
        Account accountDetail = new Account();
        try{
            if(accountId != null){
                if(schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.Account.isAccessible()){
                    accountDetail = Database.query(uhgQyeryConstants.ACCOUNT_COMMON_QUERY_STATEMENT);     
                    
                }
                else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'getPartnerAccountDetails() method ->'+nullPointerEx.getMessage());
            throw new MyException('Null Pointer Exception -->>'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in getPartnerAccountDetails() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getPartnerAccountDetails() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new MyException('No Access Exception -->>'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'getPartnerAccountDetails() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getPartnerAccountDetails() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new MyException('Query Exception Occured -->>'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new MyException('Exception -->>'+e.getMessage());
        }
        
        return accountDetail;
    }
    
    /************************************************************************************
* 
Purpose: Delete the association of the Consultant/ Consulting Firm
Parameters: accountId, recordId, primaryId
Returns: String
Throws [Exceptions]: NoAccessException, NullPointerException, QueryException, Exception

*****************************************************************************************
*/ 
    
    @AuraEnabled
    public static String deleteRelationship(String accountId, String recordId, String primaryId){
        
        System.debug('Input parameters -- >> accountId'+accountId+'----recordId--->>'+recordId+'----primaryId--->>'+primaryId);
        UHGAccountSOQLConstants uhgQyeryConstants = new UHGAccountSOQLConstants();
        boolean deleteSuccess = false;
        String sobjectName = null;
        Database.DeleteResult[] deleteResults = null;
        
        if(primaryId == null){
            primaryId = '';
        }
        
        try{
            if(accountId != null && recordId != null){
                if(schema.sobjecttype.AccountContactRelation.isQueryable() && schema.sobjecttype.AccountCFJunction__c.isQueryable() && schema.sobjecttype.AccountContactRelation.isDeletable() && schema.sobjecttype.AccountCFJunction__c.isDeletable()){
                    Id recId = Id.valueOf(recordId);
                    
                    Schema.SObjectType sobjectType = recId.getSObjectType();
                    sobjectName = sobjectType.getDescribe().getName();
                    system.debug('object type ==  >>'+sobjectName);
                    
                    if(sobjectName.equalsIgnoreCase('Contact')){
                        String accId = getRelatedAccountId(recordId);
                        system.debug('deleting contactrelation'+accId);
                        AccountContactRelation[] conRel = Database.query(uhgQyeryConstants.ACCOUNT_CONTACT_RELATION_QUERY_DELETE);
                        if(!conRel.isEmpty()){
                            deleteResults = Database.delete(conRel, false);
                            deleteSuccess = deleteResults[0].isSuccess();
                            System.debug('deleteSuccess-->>'+deleteSuccess);    
                        }
                        
                        
                        if(deleteResults != null && deleteResults.size() > 0){
                            for(Database.DeleteResult accountConsultantResult : deleteResults){
                                if(!accountConsultantResult.isSuccess()){
                                    String errMsg = '';
                                 	String errStatusCode = '';
                                    boolean flag = false;
                                    for(Database.Error err : accountConsultantResult.getErrors()){
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
                        
                        if(deleteSuccess == true && primaryId.equalsIgnoreCase(recordId)){
                                boolean clearPrimaryFields = true;
                                updatePrimaryId(accountId, recordId, clearPrimaryFields, primaryId, 'apex');
                        }
                        
                        if(deleteSuccess == true){
                            system.debug('inside deletesuccess check');
                            relateAccountToAccount(accountId, accId, 'apex');
                        }
                    }
                    
                    else if(sobjectName.equalsIgnoreCase('Account')){
                        system.debug('deleting accountrelation');
                        AccountCFJunction__c[] accRel = Database.query(uhgQyeryConstants.ACCOUNT_CF_JUNCTION_QUERY_DELETE);
                        if(!accRel.isEmpty()){
                            deleteResults = Database.delete(accRel, false);
                            deleteSuccess = deleteResults[0].isSuccess();
                            System.debug('deleteSuccess-->>'+deleteSuccess);    
                        }
                        
                        
                        if(deleteResults != null && deleteResults.size() > 0){
                            // Iterate through each returned result
                            for (Database.DeleteResult accountCFDeleteResult : deleteResults){
                                if(!accountCFDeleteResult.isSuccess()) {
                                    String errMsg = '';
                                    String errStatusCode = '';
                                    boolean flag = false;
                                    for(Database.Error err : accountCFDeleteResult.getErrors()){
                                        System.debug('err.getStatusCode()-->>>'+err.getStatusCode());
                                        errStatusCode = String.valueOf(err.getStatusCode());
                                        if(errStatusCode.equals('ENTITY_IS_DELETED')){
                                            System.debug('No Exception to throw!');
                                        }else{
                                            System.debug('The following error has occurred.');                    
                                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                            System.debug('Fields that affected this error: ' + err.getFields());
                                            errMsg = errMsg+err.getMessage();
                                        }
                                    }
                                    if(flag){
                                        throw new MyException('DML Exception -->>'+errMsg);
                                    }
                                    
                                }
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
        return sobjectName;
    }
    
    /**************************************************************************************
* 
Purpose: Query the related account Id of the contact to be deleted
Parameters: recId
Returns: String
Throws [Exceptions]: NoAccessException, NullPointerException, QueryException, Exception

*******************************************************************************************
*/ 
    
    public static String getRelatedAccountId(String recId){
        
        System.debug('Input Parameters -- recId-->>'+recId);
        
        UHGAccountSOQLConstants uhgQyeryConstants = new UHGAccountSOQLConstants();
        String accountId = '';
        System.debug('recordId-->>'+recId);
        Contact contactRecord = new Contact();
        
        try{
            if(recId != null){
                if(schema.sobjecttype.Contact.isAccessible() && schema.sobjecttype.Contact.isQueryable()){
                    contactRecord = Database.query(uhgQyeryConstants.CONTACT_COMMON_QUERY_STATEMENT);
                    accountId = contactRecord.AccountId;
                }
                else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'getRelatedAccountId() method ->'+nullPointerEx.getMessage());
            throw new MyException('Null Pointer Exception -->>'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in getRelatedAccountId() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getRelatedAccountId() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new MyException('No Access Exception -->>'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'getRelatedAccountId() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getRelatedAccountId() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new MyException('Query Exception -->>'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new MyException('Exception -->>'+e.getMessage());
        }
        
        return accountId;
    }
    
    /*******************************************************************************************************
* 
Purpose: To establish relation between contact and account 
Parameters: accountId, contactId, markPrimary
Returns: AccountContactRelation
Throws [Exceptions]: NullPointerException, NoAccessException, DmlException, QueryException, Exception

************************************************************************************************************
*/ 
    
    @AuraEnabled
    public static AccountContactRelation relateContactToAccount(String accountId ,String contactId, boolean markPrimary){
        system.debug('Input Parameters -- accountId--->>'+accountId+'-- contactId-->>'+contactId);
        
        AccountContactRelation cn = null;
        
        try{
            if(accountId != null && contactId != null){
                if(schema.sobjecttype.AccountContactRelation.isAccessible() && schema.sobjecttype.AccountContactRelation.isQueryable()){
                    Contact c = [SELECT AccountId FROM Contact WHERE Id = :contactId];
                    Id contactCFId = c.AccountId;
                    cn = new AccountContactRelation(AccountId = accountId, ContactId = contactId, Primary__c = markPrimary, CompanyConsultantFirm__c = accountId+contactCFId);
                    insert cn;
                    
                    if(cn.Id != null || cn.Id != ''){
                        String cfAccId = getRelatedAccountId(contactId);
                        //relateAccountToAccount(accountId, accId, 'apex');
                        deleteRelationship(accountId, cfAccId, '');
                    }
                }
                else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'relateContactToAccount() method ->'+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in relateContactToAccount() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in relateContactToAccount() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(DmlException dmlException){
            System.debug('DML Exception(Stack Trace) occurred in relateContactToAccount() method while updating the '+
                         'details of AccountContactRelation from SF -> '+dmlException.getStackTraceString());
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
        
        //AccountContactRelation cn = new AccountContactRelation(AccountId = accountId, ContactId = contactId);
        return cn;        
    }
    
    /***************************************************************************************
* 
Purpose: To establish relationship between Account and Account on AccountCFJunction Object
Parameters: accFromId, accToId
Returns: AccountCFJunction__c
Throws [Exceptions]: NoAccessException, NullPointerException, DmlException, Exception

********************************************************************************************
*/ 
    
    @AuraEnabled
    public static AccountCFJunction__c relateAccountToAccount(String accFromId, String accToId, String operation){
        system.debug('Input parameters -- accFromId--->>>'+accFromId+'---accToId--->'+accToId);
        AccountCFJunction__c accLink = new AccountCFJunction__c();
        
        try{
            if(accFromId != null && accToId != null){
                if(schema.sobjecttype.AccountCFJunction__c.isAccessible() && schema.sobjecttype.AccountCFJunction__c.isQueryable()){
                    accLink.AccountFirm__c = accFromId;
                    accLink.ConsultingFirm__c = accToId;
                    accLink.AccountConsultants__c = accFromId+accToId;
                   system.debug('accLink.AccountConsultants__c@@'+accLink.AccountConsultants__c);
                    
                    insert accLink;
                }
                else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'relateAccountToAccount() method ->'+nullPointerEx.getMessage());
            if(operation.equalsIgnoreCase('helper')){
                throw new AuraHandledException('Null Pointer Exception Occurred -->>'+nullPointerEx.getMessage());    
            }else if(operation.equalsIgnoreCase('apex')){
                throw new MyException('Null Pointer Exception -->>'+nullPointerEx.getMessage());    
            }
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in relateAccountToAccount() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in relateAccountToAccount() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            if(operation.equalsIgnoreCase('helper')){
                throw new AuraHandledException('No Access Exception Occurred-->>'+noaccessExec.getMessage());    
            }else if(operation.equalsIgnoreCase('apex')){
                throw new MyException('No Access Exception -->>'+noaccessExec.getMessage());    
            }
        }catch(DmlException dmlException){
            System.debug('DML Exception(Stack Trace) occurred in relateAccountToAccount() method while updating the '+
                         'details of AccountCFJunction__c from SF -> '+dmlException.getStackTraceString());
            boolean isNotDuplicateValue = true;
            for (Integer i = 0; i < dmlException.getNumDml(); i++) {
                System.debug('Status Code -> '+dmlException.getDmlStatusCode(i)); 
                System.debug('DML Error Message -> '+dmlException.getDmlMessage(i)); 
                System.debug('FieldNames -> '+dmlException.getDmlFieldNames(i)); 
                if(dmlException.getDmlStatusCode(i) == 'DUPLICATE_VALUE'){
                    isNotDuplicateValue = false;
                }
            }
            if(isNotDuplicateValue){
                if(operation.equalsIgnoreCase('helper')){
                    throw new AuraHandledException('DML Exception Occurred-->>'+dmlException.getStackTraceString());    
                }else if(operation.equalsIgnoreCase('apex')){
                    throw new MyException('DML Exception -->>'+dmlException.getMessage());
                }
            }
        }
        catch(Exception e){
            System.debug('Exception message - '+e.getLineNumber()+' Message'+e.getMessage());
            if(operation.equalsIgnoreCase('helper')){
                throw new AuraHandledException('Exception Occurred-->>'+e.getMessage());
            }else if(operation.equalsIgnoreCase('apex')){
                throw new MyException('Exception Occurred-->>'+e.getMessage());
            }
        }
        return accLink;
    }
    
    /***************************************************************************************************************
* 
Purpose: To update the Primary Consultant Details on Account Object 
Parameters: accountId, recordId, clearPrimaryFields, primaryRoleContactId, operation
Returns: Account
Throws [Exceptions]: NullPointerException, NoAccessException, DML Exception, QueryException, Exception, MyException

********************************************************************************************************************
*/ 
    
    @AuraEnabled
    public static Account updatePrimaryId(String accountId, String recordId, boolean clearPrimaryFields, String primaryRoleContactId, String operation){
        
        System.debug('Input Parameters -- updatePrimaryId--  accountId->>>'+accountId+'---consultantId-->>'+recordId+'--clearPrimaryFields-->>>'+clearPrimaryFields+'--primaryRoleContactId-->>>'+primaryRoleContactId+'--operation-->>'+operation);
        
        List<Account> accountList = new List<Account>();
        Account accDetail = new Account();
        
        try{
            if(accountId != null && recordId != null){
                if(schema.sobjecttype.Account.isAccessible() && schema.sobjecttype.Account.isQueryable()){
                    
                    if(clearPrimaryFields == null){
                        clearPrimaryFields = false;
                    }
                    
                    if(recordId != null && recordId.length() > 0){
                        Contact retrievedConsultantDetails = getAccountDetails(recordId);
                        System.debug('retrievedConsultantDetails-->>'+retrievedConsultantDetails);
                        accDetail = [SELECT Id, Consultant__c, ConsultantFirm__c FROM Account WHERE Id=: accountId];
                        System.debug('accDetail-->>'+accDetail);
                        if(clearPrimaryFields){
                            /*acc.Primary_Consultant_Id__c = '';
                            acc.PrimaryConsultant__c = '';
                            acc.PrimaryConsultingFirmRowID__c = '';
                            acc.Primary_Consulting_Firm__c = '';
                            acc.PrimaryConsultingFirmGroup__c = '';   */
                            //accDetail.Primary_Consultant_LU__c = null;
                           	//accDetail.Primary_Consulting_Firm_LU__c = null;
                            //System.debug('accDetail-->>'+accDetail);
                            /*For ST Pod*/
                            accDetail.Consultant__c = null;
                           	accDetail.ConsultantFirm__c = null;
                            clearPrimaryRoleFieldForAllRecords(accountId);
                            //updateRoleInAccountContactRelation(accountId, recordId);
                        }
                        else{
                            /*acc.Primary_Consultant_Id__c = recordId;
                            acc.PrimaryConsultant__c = retrievedConsultantDetails.Name;
                            acc.PrimaryConsultingFirmRowID__c = retrievedConsultantDetails.Account.Id;
                            acc.Primary_Consulting_Firm__c = retrievedConsultantDetails.Account.Name;
                            acc.PrimaryConsultingFirmGroup__c = retrievedConsultantDetails.Account.ConsultingFirmGroup__c;    */
                            //accDetail.Primary_Consultant_LU__c = recordId;
                            //accDetail.Primary_Consulting_Firm_LU__c = retrievedConsultantDetails.Account.Id;
                            /*For ST Pod*/
                            accDetail.Consultant__c = recordId;
                           	accDetail.ConsultantFirm__c = retrievedConsultantDetails.Account.Id;
                            
                            clearPrimaryRoleFieldForAllRecords(accountId);
                            updateRoleInAccountContactRelation(accountId, recordId);
                        }
                        
                        accountList.add(accDetail);
                        
                        Database.SaveResult[] saveResults = Database.update(accountList, false);
                        
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
                        
                        // update acc;
                        
                    }
                }
                else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'updatePrimaryId() method ->'+nullPointerEx.getMessage());
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
        
        return accDetail;
    }
    
    /************************************************************************************
* 
Purpose: Query the details of the parent account of the consultant
Parameters: consultantId
Returns: Contact
Throws [Exceptions]: NullPointerException, NoAccessException, QueryException, Exception

******************************************************************************************
*/ 
    
    @AuraEnabled
    public static Contact getAccountDetails(Id consultantId){
        
        System.debug('Input Parameters --- consultantId-->>'+consultantId);
        
		UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        Contact consultant = new Contact();
        
        try{
            if(consultantId != null){
                if(schema.sobjecttype.Contact.isAccessible() && schema.sobjecttype.Contact.isQueryable()){
                    consultant = Database.query(uhgQueryConstants.QUERY_FOR_CONTACT_DETAILS_STATEMENT);
                    System.debug('consultant -- >>'+consultant);
                }
                else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('Error(NullPointerException) occurred while querying the details of Account object from SF in '+'getAccountDetails() method ->'+nullPointerEx.getMessage());
            throw new MyException('Null Pointer Exception -->>'+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in getAccountDetails() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountDetails() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new MyException('No Access Exception -->>'+noaccessExec.getMessage());
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of Contact object from SF in '+
                         'getAccountDetails() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getAccountDetails() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new MyException('Query Exception -->>'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e.getLineNumber()+' Message'+e.getMessage());
            throw new MyException('Exception -->>'+e.getMessage());
        }
        
        return consultant;
    }
    
    /****************************************************************************************************
Purpose: To clear the Primary__c field from all records of the AccountContactRelation of the account
Parameters: accountId
Returns: void
Throws [Exceptions]: NullPointerException, NullPointerException, QueryException, Exception
*****************************************************************************************************/ 
    
    @AuraEnabled
    public static void clearPrimaryRoleFieldForAllRecords(String accountId){
        
        System.debug('Input Parameters -- accountId--->>'+accountId);
        
        UHGAccountSOQLConstants uhgAccountQuery = new UHGAccountSOQLConstants();
        List<AccountContactRelation> recordList = new List<AccountContactRelation>();
        try{
            if(accountId != null){
                if(schema.sobjecttype.AccountContactRelation.isAccessible() && schema.sobjecttype.AccountContactRelation.isQueryable()){
                    recordList = Database.query(uhgAccountQuery.ACCOUNT_CONTACT_RELATION_COMMON_QUERY_STATEMENT);
                    
                    for(AccountContactRelation record : recordList){
                        record.Primary__c = false;    
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
                    
                    //update recordList;
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
    
    /******************************************************************************************************************
Purpose: To update the Primary__c field of the primary consultant record in the AccountContactRelation of the account
Parameters: accountId, contactId
Returns: void
Throws [Exceptions]: NullPointerException, NoAccessException QueryException, Exception
***********************************************************************************************************************/ 
    
    @AuraEnabled
    public static void updateRoleInAccountContactRelation(String accountId, String contactId){
        
        System.debug('Input Parameters---  accountId-->>'+accountId+'--contactId-->>'+contactId);
        
        List<AccountContactRelation> acRdataRecords = new List<AccountContactRelation>();
        AccountContactRelation acR = new AccountContactRelation();
        try{
            if(accountId != null && contactId != null){
                if(schema.sobjecttype.AccountContactRelation.isAccessible() && schema.sobjecttype.AccountContactRelation.isQueryable()){
                    acR = [SELECT Id FROM AccountContactRelation WHERE AccountId =: accountId AND ContactId =: contactId];
                    acR.Primary__c = true;
                    
                    acRdataRecords.add(acR);
                    
                    Database.SaveResult[] saveResults = Database.update(acRdataRecords, false);
                    
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
                    
                    //update acR;
                }
                
                else{
                    throw new NoAccessException();
                }
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
    
    /****************************************************************************************************
Purpose: Query contacts of recordType consultant and active status
Parameters: searchKeyVal, pageNumber, searchField, operator, contactRecordTypeId, accountId
Returns: ConsultantSearchResult
Throws [Exceptions]: NoAccessException, QueryException, Exception
*****************************************************************************************************/ 
    
    @AuraEnabled
    public static ConsultantSearchResult getConsultants(String searchKeyVal, Decimal pageNumber, String searchField, String operator, String contactRecordTypeId, Id accountId) {
        
        System.debug('Input Parameters -> searchKeyVal-'+searchKeyVal+', pageNumber-'+pageNumber+
                     ', searchField-'+searchField+'and operator-'+operator+'---accountId---'+accountId+'----contactRecordTypeId-----'+contactRecordTypeId);
        
        UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        ConsultantSearchResult consultantResultObj = new ConsultantSearchResult();
        
        try {
            
            String searchKey = '';
            
            if(searchKeyVal != null && searchKeyVal.trim().length() > 0 &&
               searchField != null && searchField.trim().length() > 0 && 
               operator != null && operator.trim().length() > 0) {    
                   if(searchField.equalsIgnoreCase(uhgAccountConstants.LAST_NAME)) {
                       searchField = uhgAccountConstants.LAST_NAME_ITAG;       
                   } else  if(searchField.equalsIgnoreCase(uhgAccountConstants.FIRST_NAME)) {
                       searchField = uhgAccountConstants.FIRST_NAME_ITAG;       
                   }  else  if(searchField.equalsIgnoreCase(uhgAccountConstants.JOB_TITLE)) {
                       searchField = uhgAccountConstants.JOB_TITLE_ITAG_USER;       
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
                
                List<AccountContactRelation> accContactRelation = new List<AccountContactRelation>();
                
                accContactRelation = Database.query('SELECT Primary__c, ContactId FROM AccountContactRelation WHERE AccountId =: accountId AND IsDirect=false AND Contact.Status__c=: userStatus');
                Set<Id> contactIds = new Set<Id>();
                consultantResultObj.recordExists = false;
                if(!accContactRelation.isEmpty()){
                    for(AccountContactRelation acR : accContactRelation){
                        contactIds.add(acR.ContactId);
                    }
                }else{
                    consultantResultObj.recordExists = true;
                }
                
                System.debug('contact Ids --->>'+contactIds);
                
                if(searchKey != null && searchKey.trim().length() > 0) {
                    //consultantResultObj.total = Database.countQuery('Select count() from Contact where Type__c=\'Consultant\' AND Status__c = \'Active\' and '+searchField+' LIKE :searchKey');
                    consultantResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_STRING_COUNT_CMCD_ACCOUNT_CONSULTANTS_COUNT+' and '+searchField+' LIKE :searchKey');
                    if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                        
                        consultantResultObj.consultantList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH+searchField+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH4+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH3);
                    } else {
                        
                        consultantResultObj.consultantList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH+searchField+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH1+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH3); 
                        System.debug('consultantResultObj.consultantList'+consultantResultObj.consultantList);
                    }
                    
                } else {
                    consultantResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_STRING_COUNT_CMCD_ACCOUNT_CONSULTANTS_COUNT);
                    consultantResultObj.consultantList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS);
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
    
    /****************************************************************************************************
Purpose: Query accounts of Category Type consulting firm
Parameters: searchKeyVal, pageNumber, searchField, operator, accountId
Returns: ConsultantFirmSearchResult
Throws [Exceptions]: NoAccessException, QueryException, Exception
*****************************************************************************************************/ 
    
    @AuraEnabled
    public static ConsultantFirmSearchResult getConsultantFirms(String searchKeyVal, Decimal pageNumber, String searchField, String operator, Id accountId) {
        
        System.debug('Input Parameters -> searchKeyVal-'+searchKeyVal+', pageNumber-'+pageNumber+', searchField-'+searchField+'and operator-'+operator+'--accountId---'+accountId);
        
        UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        ConsultantFirmSearchResult cfResultObj = new ConsultantFirmSearchResult();
        
        try {
            
            String searchKey = '';
            
            if(searchKeyVal != null && searchKeyVal.trim().length() > 0 &&
               searchField != null && searchField.trim().length() > 0 && 
               operator != null && operator.trim().length() > 0) {    
                   if(searchField.equalsIgnoreCase(uhgAccountConstants.CONSULTING_FIRM)) {
                       searchField = uhgAccountConstants.CONSULTING_FIRM_ITAG;       
                   } else  if(searchField.equalsIgnoreCase(uhgAccountConstants.FIRM_CITY)) {
                       searchField = uhgAccountConstants.FIRM_CITY_ITAG;       
                   }  else  if(searchField.equalsIgnoreCase(uhgAccountConstants.FIRM_STATE)) {
                       searchField = uhgAccountConstants.FIRM_STATE_ITAG;       
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
            
            
            if(schema.sobjecttype.Account.isAccessible()) {
                
                List<AccountCFJunction__c> accContactRelation = new List<AccountCFJunction__c>();
                List<AccountContactRelation> accContRel = new List<AccountContactRelation>();
                
                accContRel = Database.query('SELECT Contact.Account.Id FROM AccountContactRelation WHERE AccountId =: accountId AND IsDirect=false AND Contact.Status__c=: userStatus');
                System.debug('accContRel-->>'+accContRel);
                accContactRelation = Database.query('SELECT ConsultingFirm__c FROM AccountCFJunction__c WHERE AccountFirm__c=: accountId');
                Set<Id> addedAccIds = new Set<Id>();
                for(AccountCFJunction__c acR : accContactRelation){
                    addedAccIds.add(acR.ConsultingFirm__c);
                }
                
                for(AccountContactRelation acR1 : accContRel){
                    addedAccIds.add(acR1.Contact.Account.Id);
                }
                
                System.debug('added Account Ids --->>'+addedAccIds);
                
                if(searchKey != null && searchKey.trim().length() > 0) {
                    cfResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_STRING_COUNT_CMCD_ACCOUNT_CONSULTANT_FIRM_COUNT+' and '+searchField+' LIKE :searchKey');
                    
                    if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                        
                        cfResultObj.accountList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANT_FIRM_SEARCH+searchField+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH4+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_FIRM_SEARCH); 
                    } else {
                        
                        cfResultObj.accountList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANT_FIRM_SEARCH+searchField+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH1+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_FIRM_SEARCH); 
                        System.debug('cfResultObj.accountList'+cfResultObj.accountList);
                    }
                    
                } else {
                    System.debug('--->>>'+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANT_FIRM_UNIQUE);
                    System.debug('--->>>'+uhgQueryConstants.QUERY_STRING_COUNT_CMCD_ACCOUNT_CONSULTANT_FIRM_COUNT);
                    cfResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_STRING_COUNT_CMCD_ACCOUNT_CONSULTANT_FIRM_COUNT);
                    cfResultObj.accountList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANT_FIRM_UNIQUE);
                }
                
                cfResultObj.page = (Integer)pageNumber;
                cfResultObj.pageSize = pageSize;
                
            } else {
                throw new NoAccessException();
            }
            
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the User object from SF in getConsultantFirms() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getConsultantFirms() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('NoAccessException Occured----'+noaccessExec.getMessage());
        } catch(QueryException queryExec) {
            System.debug('Error(QueryException) occurred while querying the details of User object from SF in '+
                         'getConsultantFirms() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getConsultantFirms() method, the Stack Trace is -> '+queryExec.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryExec.getMessage());
        } catch(Exception e) {
            System.debug('Error occurred in getConsultantFirms() method while querying the User details from SF -> '+e.getMessage());
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        System.debug('Output Parameters -> Consulting Firms-'+cfResultObj.accountList+', Page-'+cfResultObj.page+
                     ', PageSize-'+cfResultObj.pageSize+'and TotalNoOfPages-'+cfResultObj.total);
        
        System.debug('getConsultantFirms(String searchKeyVal, Decimal pageNumber, String searchField, String operator) - END');
        
        return cfResultObj;
    }
    
    /****************************************************************************************************
Purpose: Query contacts of RecordType consultant and active status of the searched account
Parameters: searchKeyVal, pageNumber, searchField, operator, accountId, contactRecordTypeId
Returns: ConsultantSearchResult
Throws [Exceptions]: NoAccessException, QueryException, Exception
*****************************************************************************************************/ 
    
    @AuraEnabled
    public static ConsultantSearchResult getConsultantOfAccount(String searchKeyVal, Decimal pageNumber, String searchField, String operator, Id accountId, String contactRecordTypeId) {
        
        System.debug('Input Parameters -> searchKeyVal-'+searchKeyVal+', pageNumber-'+pageNumber+
                     ', searchField-'+searchField+'and operator-'+operator+'----contactRecordTypeId-----'+contactRecordTypeId);
        
        UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        ConsultantSearchResult consultantResultObj = new ConsultantSearchResult();
        
        try {
            
            String searchKey = '';
            
            if(searchKeyVal != null && searchKeyVal.trim().length() > 0 &&
               searchField != null && searchField.trim().length() > 0 && 
               operator != null && operator.trim().length() > 0) {    
                   if(searchField.equalsIgnoreCase(uhgAccountConstants.LAST_NAME)) {
                       searchField = uhgAccountConstants.LAST_NAME_ITAG;       
                   } else  if(searchField.equalsIgnoreCase(uhgAccountConstants.FIRST_NAME)) {
                       searchField = uhgAccountConstants.FIRST_NAME_ITAG;       
                   }  else  if(searchField.equalsIgnoreCase(uhgAccountConstants.JOB_TITLE)) {
                       searchField = uhgAccountConstants.JOB_TITLE_ITAG_USER;       
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
                
                List<AccountContactRelation> accContactRelation = new List<AccountContactRelation>();
                
                accContactRelation = Database.query('SELECT ContactId FROM AccountContactRelation WHERE AccountId =: accountId AND IsDirect=false AND Contact.Status__c=: userStatus');
                Set<Id> contactIds = new Set<Id>();
                for(AccountContactRelation acR : accContactRelation){
                    contactIds.add(acR.ContactId);
                }
                System.debug('contact Ids --->>'+contactIds);
                
                if(searchKey != null && searchKey.trim().length() > 0) {
                    consultantResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_STRING_COUNT_CMCD_ACCOUNT_CONSULTANTS_COUNT2+' and '+searchField+' LIKE :searchKey');
                    
                    if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                        
                        consultantResultObj.consultantList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH22+searchField+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH4+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH3);
                    } else {
                        
                        consultantResultObj.consultantList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH22+searchField+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH1+uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS_SEARCH3);
                        System.debug('consultantResultObj.consultantList'+consultantResultObj.consultantList);
                    }
                    
                } else {
                    consultantResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_STRING_COUNT_CMCD_ACCOUNT_CONSULTANTS_COUNT2);
                    consultantResultObj.consultantList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_CMCD_CONSULTANTS2);
                }
                
                consultantResultObj.page = (Integer)pageNumber;
                consultantResultObj.pageSize = pageSize;
                
            } else {
                throw new NoAccessException();
            }
            
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the User object from SF in getConsultantOfAccount() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getConsultantOfAccount() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('Exception Occured----'+noaccessExec.getMessage());
        } catch(QueryException queryExec) {
            System.debug('Error(QueryException) occurred while querying the details of User object from SF in '+
                         'getConsultantOfAccount() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getConsultantOfAccount() method, the Stack Trace is -> '+queryExec.getStackTraceString());
            throw new AuraHandledException('Exception Occured----'+queryExec.getMessage());
        } catch(Exception e) {
            System.debug('Error occurred in getConsultantOfAccount() method while querying the User details from SF -> '+e.getMessage());
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        System.debug('Output Parameters -> Consultants List--'+consultantResultObj.consultantList+', Page-'+consultantResultObj.page+
                     ', PageSize-'+consultantResultObj.pageSize+'and TotalNoOfPages-'+consultantResultObj.total);
        
        System.debug('getConsultantOfAccount(String searchKeyVal, Decimal pageNumber, String searchField, String operator) - END');
        
        return consultantResultObj;
    }
    
    //Wrapper Classes 
    
    public class accountConsultantsInitialValues {
        
        @AuraEnabled
        public String accountType{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public  Id contactTypeId{ get;set; }
        
    }
    
    public class ConsultantSearchResult {
        
        @AuraEnabled
        public List<Contact> consultantList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public boolean recordExists { get;set; }
        
    }
    
    public class ConsultantFirmSearchResult {
        
        @AuraEnabled
        public List<Account> accountList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
    }
    //For sorted list of records
    public class sortList {

         @AuraEnabled
        public List<AccountContactRelation> consultantList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
      
        @AuraEnabled
        public List<Account> accountList{ get;set; }
        
    }
}