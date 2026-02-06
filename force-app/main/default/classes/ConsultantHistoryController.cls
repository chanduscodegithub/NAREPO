/****************************************************************** ***** 
Name: ConsultantHistoryController 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query all Consultant History with Associated with Account for the Contact History Lightning Component.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 HARSHAVARDHAN Y R  	20/07/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/
public with sharing class ConsultantHistoryController {
    
    /******************************************************************
* 
Purpose: Query the Consultant History using Consultant History ID
Parameters: consultantHistoryId
Returns: ConsultantHistory__c(Consultant History Object)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/ 
    
    @AuraEnabled    
    public static ConsultantHistory__c getConsultantHistoryFromController(Id consultantHistoryId){
        System.debug('Enter ConsultantHistory <getConsultantHistoryFromController()>');         
        System.debug('Input Parameters - consultantHistoryId-'+consultantHistoryId);
        
        ConsultantHistory__c consultantHistory = null;                    
        try{                        
            if(consultantHistoryId != null){                           
                if(schema.sobjecttype.ConsultantHistory__c.isaccessible() && schema.sobjecttype.ConsultantHistory__c.isQueryable()) {                                        
                    String buildQueryh = UHGAccountSOQLConstants.QUERY_CONSULTANT_HISTORY+UHGAccountSOQLConstants.SINGLE_QUOTE+consultantHistoryId+UHGAccountSOQLConstants.SINGLE_QUOTE;
                    consultantHistory = Database.query(buildQueryh);                    
                }else {
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(Exception ex) {
            System.debug('Error occurred in getConsultantHistoryFromController() method while querying the details of '+
                         'ConsultantHistory from SF -> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }      
        System.debug('Output Parameters - consultantHistory-'+consultantHistory);
        System.debug('Exit <getConsultantHistoryFromController()>');        
        return consultantHistory;        
    }
    
    /******************************************************************
* 
Purpose: To check the Edit access for LoggedIn User     
Returns: Boolean
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/ 
    
    @AuraEnabled    
    public static boolean isEditAccesToThisUser(String accountId){	
        System.debug('Enter <isEditAccesToThisUser>');
        Boolean isEditAccess = false;
        try{         
            isEditAccess = UserInformationClass.hasEditAccessToRecord(accountId);           
        }
        catch(Exception ex){
            System.debug('Error occurred in isEditAccesToThisUser() method while querying the details of '+
                         'ConsultantHistory from SF -> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }
        System.debug('Output Parameters - isEditAccess-'+isEditAccess);
        System.debug('End <isEditAccesToThisUser>');
        //isEditAccess = true;
        return isEditAccess;
    }
    
    /******************************************************************
* 
Purpose: To Save the Consultant History using Id
Parameters: consultantHistoryId,startDate & endDate
Returns: ConsultantHistory__c(Consultant History Object)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException

*******************************************************************
*/     
    @AuraEnabled    
    public static ConsultantHistory__c saveConsultantHistoryFromController(ConsultantHistory__c consultantHistoryObj){
        System.debug('Enter ConsultantHistory <saveConsultantHistoryFromController()>'); 
        System.debug('Input Paramter ->: consultantHistoryObj '+consultantHistoryObj); 
        
        ConsultantHistory__c consultantHistory = null;        
        
        try{                                             
            if(consultantHistoryObj != null){                           
                createConsultantHistory(consultantHistoryObj);                                
            }else{
                throw new NullPointerException();
            }
        }catch(Exception ex) {
            System.debug('Error occurred in saveConsultantHistoryFromController() method while querying the details of '+
                         'ConsultantHistory from SF -> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }              
        System.debug('Output Parameters -> consultantHistory-'+consultantHistoryObj);
        System.debug('Exit <saveConsultantHistoryFromController()>');        
        return consultantHistoryObj;        
    }
    
    /******************************************************************
* 
Purpose: Query all Consultant History to Perticular Account
Parameters: accountId,pageNumber, columnName & sortType
Returns: ConsultantHistoryResult(List of Consultant History and Pageination List)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException

*******************************************************************
*/ 
    @AuraEnabled    
    public static ConsultantHistoryResult getConsultantHistoryData(Id accountId,Decimal pageNumber,String columnName, String sortType,boolean isPopUp){
        System.debug('Enter ConsultantHistory <ConsultantHistoryResult()>'); 
        
        System.debug('Input Parameters -> accountId-'+accountId+', columnNameToBeSorted-'+columnName+', sortOrder-'+sortType+', isPopUp-'+isPopUp);
        
        ConsultantHistoryResult consultantHistoryResult = null;
        
        try{			                        
            consultantHistoryResult = new ConsultantHistoryResult();
            consultantHistoryResult.isEditAccess = isEditAccesToThisUser(accountId);
            
            if(accountId != null && pageNumber!= null && columnName != null && sortType != null){                
                if(schema.sobjecttype.ConsultantHistory__c.isaccessible() && schema.sobjecttype.ConsultantHistory__c.isQueryable()) {                                                                            
                    Integer pageSize = 0;
                    
                    UHGAccountConstants uhgCon = new UHGAccountConstants();                    
                    
                    if(isPopUp){
                        pageSize = uhgCon.POPUP_PAGESIZE;
                    }else{
                        //pageSize = uhgCon.APPLET_PAGESIZE;
                        pageSize = uhgCon.POPUP_PAGESIZE;
                    }
                    
                    Integer offset = ((Integer)pageNumber - 1) * pageSize;
                    
                    String positionColumn  = 'FIRST';
                    if(sortType.equalsIgnoreCase('desc')){
                        positionColumn  = 'LAST';
                    }
                    
                    consultantHistoryResult.total = Database.countQuery(UHGAccountSOQLConstants.QUERY_COUNT_CONSULTANT_HISTORY_ASSOCIATED_WITH_ACCOUNT + 
                                                                        +UHGAccountSOQLConstants.SINGLE_QUOTE+accountId+UHGAccountSOQLConstants.SINGLE_QUOTE);                    
                    
                    System.debug('pageNumber '+pageNumber+' : total '+consultantHistoryResult.total);
                    if(pageNumber > 1 && (consultantHistoryResult.total == (pageNumber-1) * pageSize)){
                        pageNumber--; 
                        offset = ((Integer)pageNumber - 1) * pageSize;
                    }
                    
					System.debug('Query : '+UHGAccountSOQLConstants.QUERY_CONSULTANT_HISTORY_ASSOCIATED_WITH_ACCOUNT +
                                                                            +UHGAccountSOQLConstants.SINGLE_QUOTE+accountId+UHGAccountSOQLConstants.SINGLE_QUOTE+
                                                                            +UHGAccountSOQLConstants.QUERY_ORDER_BY+columnName+UHGAccountSOQLConstants.SPACE+sortType+' '+'NULLS'+' '+positionColumn+UHGAccountSOQLConstants.SPACE+
                                                                            +UHGAccountSOQLConstants.QUERY_LIMIT+pageSize+UHGAccountSOQLConstants.QUERY_OFFSET+offset);                                    	                                                            
			
                    consultantHistoryResult.consultantList = Database.query(UHGAccountSOQLConstants.QUERY_CONSULTANT_HISTORY_ASSOCIATED_WITH_ACCOUNT +
                                                                            +UHGAccountSOQLConstants.SINGLE_QUOTE+accountId+UHGAccountSOQLConstants.SINGLE_QUOTE+
                                                                            +UHGAccountSOQLConstants.QUERY_ORDER_BY+columnName+UHGAccountSOQLConstants.SPACE+sortType+' '+'NULLS'+' '+positionColumn+UHGAccountSOQLConstants.SPACE+
                                                                            +UHGAccountSOQLConstants.QUERY_LIMIT+pageSize+UHGAccountSOQLConstants.QUERY_OFFSET+offset);                                    	                                                            
                    consultantHistoryResult.pageSize = pageSize;
                    consultantHistoryResult.page = (Integer)pageNumber;                    
                    
                }else {
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(Exception ex) {
            System.debug('Error occurred in getConsultantHistoryRecords() method while querying the details of '+
                         'ConsultantHistory from SF -> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }      
        System.debug('Output Parameters -> ConsultantHistoryResult : '+ConsultantHistoryResult);
        return ConsultantHistoryResult;        
    }
    
    /******************************************************************
* 
Purpose: Query all contacts of Type Consultant
Parameters: searchKeyVal,pageNumber, searchField & operator
Returns: consultantHistoryResult(List of Contact and Pagination)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException

*******************************************************************
*/ 
    @AuraEnabled
    public static consultantHistoryResult getAllContactOfTypeConsultantData(String searchKeyVal, Decimal pageNumber, String searchField, String operator) {
        
        System.debug('ENTER <getAllConsultantHistoryData(String searchKeyVal, Decimal pageNumber, String searchField, String operator)>');
        
        System.debug('Input Parameters -> SearchKey-'+searchKeyVal+', PageNo-'+pageNumber+', SearchField-'+searchField
                     +' and Operator-'+operator);
        
        ConsultantHistoryResult consultantHistoryResult = new ConsultantHistoryResult();
        
        try {
            
            String searchKey = '';            
            consultantHistoryResult = new ConsultantHistoryResult();
            
            if(searchKeyVal != null && searchKeyVal.trim().length() > 0 &&
               searchField != null && searchField.trim().length() > 0 && 
               operator != null && operator.trim().length() > 0) {                   
                   searchField = searchField.trim();
                   operator = operator.trim();
                   if(searchField.equalsIgnoreCase(UHGAccountConstants.LAST_NAME)) {
                       searchField = UHGAccountConstants.LAST_NAME_ITAG;                              
                   } else if(searchField.equalsIgnoreCase(UHGAccountConstants.FIRST_NAME)) {
                       searchField = UHGAccountConstants.FIRST_NAME_ITAG;                              
                   }else if(searchField.equalsIgnoreCase(UHGAccountConstants.JOB_TITLE)) {
                       searchField = UHGAccountConstants.JOB_TITLE_ITAG;                              
                   } else if(searchField.equalsIgnoreCase(UHGAccountConstants.CONSULTING_FIRM)) {
                       searchField = UHGAccountConstants.CONSULTING_FIRM_ITAG;                              
                   }                                        
                   if(operator.equalsIgnoreCase(UHGAccountConstants.BEGINS_WITH)) {                       
                       searchKey = searchKeyVal + '%';
                   } else if(operator.equalsIgnoreCase(UHGAccountConstants.CONTAINS)) {                       
                       searchKey = '%' + searchKeyVal + '%';
                   } else if(operator.equalsIgnoreCase(UHGAccountConstants.EQUALS_TO)) {                       
                       searchKey = searchKeyVal;
                   }
               }
            
            Integer pageSize = 5;
            
            UHGAccountConstants uhgCon = new UHGAccountConstants();                    
            pageSize = uhgCon.POPUP_PAGESIZE;
                        
            Integer offset = ((Integer)pageNumber - 1) * pageSize;             
            consultantHistoryResult.total = 0;
            String buildQuery = '';
            String ORDER_BY = ' ORDER BY LastName ASC ';
                        
            if(schema.sobjecttype.Contact.isaccessible() && schema.sobjecttype.Contact.isQueryable()) {                                    
                if(searchKey != null && searchKey.trim().length() > 0) {                                        
                    String countQueryString = UHGAccountSOQLConstants.QUERY_COUNT_CONTACT_OF_TYPE_CONSULTANT+
                        						+UHGAccountSOQLConstants.AND_CONDITION+searchField+UHGAccountSOQLConstants.QUERY_LIKE+UHGAccountSOQLConstants.SINGLE_QUOTE+searchKey+UHGAccountSOQLConstants.SINGLE_QUOTE;                    
                    System.debug('countQueryString '+countQueryString);
                    consultantHistoryResult.total = Database.countQuery(countQueryString);
                    if(operator.equalsIgnoreCase(UHGAccountConstants.EQUALS_TO)) {                      
                        buildQuery = UHGAccountSOQLConstants.QUERY_CONTACT_OF_TYPE_CONSULTANT+
                            			+UHGAccountSOQLConstants.AND_CONDITION+searchField+UHGAccountSOQLConstants.EQUALS_CONDITION+UHGAccountSOQLConstants.SINGLE_QUOTE+searchKey+UHGAccountSOQLConstants.SINGLE_QUOTE+
                            			+ORDER_BY+UHGAccountSOQLConstants.QUERY_LIMIT+pageSize+UHGAccountSOQLConstants.QUERY_OFFSET+offset;                        
                        System.debug('buildQuery '+buildQuery);
                        consultantHistoryResult.consultantContactList = Database.query(buildQuery);
                    }else{
                        buildQuery = UHGAccountSOQLConstants.QUERY_CONTACT_OF_TYPE_CONSULTANT+
                            		+UHGAccountSOQLConstants.AND_CONDITION+searchField+UHGAccountSOQLConstants.QUERY_LIKE+UHGAccountSOQLConstants.SINGLE_QUOTE+searchKey+UHGAccountSOQLConstants.SINGLE_QUOTE+
                            		+ORDER_BY+UHGAccountSOQLConstants.QUERY_LIMIT+pageSize+UHGAccountSOQLConstants.QUERY_OFFSET+offset;
                        System.debug('buildQuery '+buildQuery);
                        consultantHistoryResult.consultantContactList = Database.query(buildQuery);                            
                    }                    
                }else{                
                    System.debug('Count Query '+UHGAccountSOQLConstants.QUERY_COUNT_CONTACT_OF_TYPE_CONSULTANT);
                    consultantHistoryResult.total = Database.countQuery(UHGAccountSOQLConstants.QUERY_COUNT_CONTACT_OF_TYPE_CONSULTANT);
                    buildQuery = UHGAccountSOQLConstants.QUERY_CONTACT_OF_TYPE_CONSULTANT+ORDER_BY+UHGAccountSOQLConstants.QUERY_LIMIT+pageSize+UHGAccountSOQLConstants.QUERY_OFFSET+offset;
                    System.debug('buildQuery '+buildQuery);
                    consultantHistoryResult.consultantContactList = Database.query(buildQuery);                    
                }                
                consultantHistoryResult.page = (Integer)pageNumber;
                consultantHistoryResult.pageSize = pageSize;
            }else {
                throw new NoAccessException();
            }
            
        }catch(Exception ex) {
            System.debug('Error occurred in getAllConsultantHistoryData() method while querying the details of '+
                         'ConsultantHistory from SF -> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        } 
                
        System.debug('Output Paramter -> consultantHistoryResult : '+consultantHistoryResult);
        System.debug('getAllConsultantHistoryData(String searchKeyVal, Decimal pageNumber, String searchField, String operator) - END');
        
        return consultantHistoryResult;
    }
    
    /******************************************************************
* 
Purpose: To Create Consultant History
Parameters: consultantHistory     
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException

*******************************************************************
*/ 
    @AuraEnabled
    public static void createConsultantHistory(ConsultantHistory__c consultantHistory){
        System.debug('Enter <createConsultantHistory()>');         
        System.debug('Input parameter -> consultantHistory : '+consultantHistory);
        try{
            if(consultantHistory != null){
                if(schema.sobjecttype.ConsultantHistory__c.isaccessible() && schema.sobjecttype.ConsultantHistory__c.isCreateable()) {
                    Database.UpsertResult result = Database.upsert(consultantHistory);                                         
                }else {
                    throw new NoAccessException();
                } 
            }else{
                throw new NullPointerException();
            }
        }catch(Exception ex) {
            System.debug('Error occurred in createConsultantHistory() method while querying the details of '+
                         'ConsultantHistory from SF -> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }      
        System.debug('Exit <createConsultantHistory()>');         
    }
    
    /******************************************************************
* 
Purpose: Map the Feilds from Contact of Type Consultant to Consultant Hisotry
Parameters: contact & accountId     
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException     
*******************************************************************
*/     
    @AuraEnabled
    public static void craeteAndMapConsultantHistoryWithContact(Contact contact,Id accountId){
        System.Debug('Enter <craeteAndMapConsultantHistoryWithContact>');
        System.Debug('Input paramters:> accountId : '+accountId+' Contact : '+contact);
        system.debug('Contact :'+contact);
        ConsultantHistoryResult consultantHistoryResult = null;
        try{
            if(contact != null){                
                ConsultantHistory__c consultantHistory = new ConsultantHistory__c();
                consultantHistory.CompanyName__c=accountId;                    
                //consultantHistory.ContactName__c = contact.Id;
                consultantHistory.Name=contact.FirstName;
                consultantHistory.LastName__c=contact.LastName;
                consultantHistory.JobTitle__c=contact.Title;
                consultantHistory.Consultant_ID__c = contact.Id;
                consultantHistory.Status__c = contact.Status__c;
               
                if(contact.AccountId != null && contact.Account != null && contact.Account.Name != null){
                    consultantHistory.ConsultingFirm_ID__c = contact.AccountId;
                    consultantHistory.ConsultingFirm__c = contact.Account.Name;
                }
                if(contact.Status__c != null && contact.Status__c.equals('Inactive')){
                    consultantHistory.EndDate__c = contact.InactiveDate__c;
                    consultantHistory.StatusReason__c = contact.InactiveStatusReason__c;
                }else{
                     consultantHistory.StartDate__c = Date.today();
                }
                createConsultantHistory(consultantHistory);
            }else{
                throw new NullPointerException();
            }
            
        }catch(Exception ex) {
            System.debug('Error occurred in craeteAndMapConsultantHistoryWithContact() method while querying the details of '+
                         'ConsultantHistory from SF -> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }      
        System.debug('Exit <craeteAndMapConsultantHistoryWithContact()>');         
    }
    
    /******************************************************************
* 
Purpose: Create Consultant History using selected Contact and Account
Parameters: accountId,objId
Returns: ConsultantHistoryResult(List of Consultant History and Pagination Detials)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException

*******************************************************************
*/     
    @AuraEnabled    
    public static ConsultantHistoryResult createConsultantHistoryFromAccount(Id accountId,Id objId,boolean isPopUp){
        System.Debug('Enter <createConsultantHistory>');
        System.Debug('Input paramters -> accountId : '+accountId+' Contact Id : '+objId);
        ConsultantHistoryResult consultantHistoryResult = null;
        
        try{                       
            if(accountId != null && objId != null){
                if(schema.sobjecttype.Contact.isaccessible() && schema.sobjecttype.Contact.isQueryable()) {                
                    Contact contact = Database.query(UHGAccountSOQLConstants.QUERY_CONTACT_ON_ID+UHGAccountSOQLConstants.SINGLE_QUOTE+objId+UHGAccountSOQLConstants.SINGLE_QUOTE);                
                    craeteAndMapConsultantHistoryWithContact(Contact,accountId);                    
                    consultantHistoryResult = getConsultantHistoryData(accountId,1,'LastModifiedDate','Desc',isPopUp);
                }else {
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(Exception ex) {
            System.debug('Error occurred in createConsultantHistory() method while querying the details of '+
                         'ConsultantHistory from SF -> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }      
        System.debug('Exit <createConsultantHistory()>');               
        return consultantHistoryResult;
    }
    
    /******************************************************************
* 
Purpose: Delete the Consultant History  using Consultant History Id and calling getConsultantHistoryData() to get Updated Data 
Parameters: accountId,objId,pageNumber
Returns: ConsultantHistoryResult(List of Consultant History and Pagination)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException

*******************************************************************
*/     
    @AuraEnabled    
    public static ConsultantHistoryResult deleteConsultantHistory(Id accountId,Id objId,Decimal pageNumber,boolean isPopUp,String columnName,String sortType){
        System.Debug('Enter <deleteConsultantHistory>');
        System.Debug('Input Paramters -> accountId : '+accountId+' : consultaHistoryId : '+objId);
        ConsultantHistoryResult consultantHistoryResult = null;
        try{                    
            if(accountId != null && objId != null){                                
                if(schema.sobjecttype.ConsultantHistory__c.isaccessible() && schema.sobjecttype.ConsultantHistory__c.isDeletable()) {
                    Database.DeleteResult dr = Database.delete(objId);                                                           
                    consultantHistoryResult = getConsultantHistoryData(accountId,pageNumber,columnName,sortType,isPopUp);                    
                }else {
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(System.DmlException dmlExec){                      
            for (Integer i = 0; i < dmlExec.getNumDml(); i++) {
                if(dmlExec.getDmlStatusCode(i).equals('ENTITY_IS_DELETED')){
                    consultantHistoryResult = getConsultantHistoryData(accountId,pageNumber,'LastModifiedDate','Desc',isPopUp);            
                }
                else{
                    System.debug('Status Code -> '+dmlExec.getDmlStatusCode(i)); 
                    System.debug('DML Error Message -> '+dmlExec.getDmlMessage(i)); 
                    System.debug('FieldNames -> '+dmlExec.getDmlFieldNames(i));
                    throw new AuraHandledException(dmlExec.getTypeName() +' Occured---> '+dmlExec.getDmlMessage(i));
                }
            }			
        }
        catch(Exception ex) {
            System.debug('Error occurred in deleteConsultantHistory() method while querying the details of '+
                         'ConsultantHistory from SF -> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }      
        System.debug('Output Paramter : consultantHistoryResult : '+consultantHistoryResult);
        System.debug('Exit <deleteConsultantHistory()>');               
        return consultantHistoryResult;
    }
    
    /******************************************************************
* 
Wrapper class for Returing diffrent Return Types for lighting component

*******************************************************************
*/ 
    
    public class ConsultantHistoryResult {
        
        @AuraEnabled
        public List<ConsultantHistory__c> consultantList{ get;set; }
        
        @AuraEnabled
        public List<Contact> consultantContactList{ get;set;}
        
        @AuraEnabled
        public Integer pageSize { get;set;}
        
        @AuraEnabled
        public Integer page { get;set;}
        
        @AuraEnabled
        public Integer total { get;set;}
        
        @AuraEnabled
        public Boolean isEditAccess { get;set;}
    }
    
}