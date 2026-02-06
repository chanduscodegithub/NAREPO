/****************************************************************** ***** 
Name: BGH Member Contacts
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query for contacts to which this Account is associated as a BGH Account
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 ABHISHEK KUMAR	 		11/10/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/
public class BGH_Member_Contacts_Class {
    
    /*
    * The below method queries the BGH__c records based on the associated AccountId and sorts
    * the data based on the columnName & sortType which returns the List<BGH__c>.
    */
    @AuraEnabled    
    public static AccountBusinessGroupHealthResult getBusinessGroupsonHealthOnAppletLoad(Id accountId,String columnName, String sortType, boolean isContact){
        
        System.debug('getBusinessGroupsonHealthOnAppletLoad(Id accountId,String columnName, String sortType) - START');
        
        System.debug('Input Parameters - accountId-'+accountId+',ColumnName-'+columnName+', SortOrder-'+sortType);
        
        List<BGH__c> accountBusinessGroupsonHealth = new List<BGH__c>();
        List<BGHContact__c> contactBusinessGroupsonHealth = new List<BGHContact__c>();
      //  List<Account> accountCategoryList = new List<Account>();
        UHGContactSOQLConstants businessGroupsOnHealthConstants = new UHGContactSOQLConstants();
        AccountBusinessGroupHealthResult accountBusinessGroupHealthResultObj = new AccountBusinessGroupHealthResult();
        Account accountToUpdate;
        try{
            if(accountId != null && columnName!=null && sortType!=null){
                if(schema.sobjecttype.BGH__c.isaccessible() && schema.sobjecttype.BGH__c.isQueryable() && schema.sobjecttype.Account.isaccessible()) {
                        contactBusinessGroupsonHealth  = Database.query(businessGroupsOnHealthConstants.QUERY_FOR_BGH_MEMBER_CONTACTS+columnName+' '+sortType);
                        accountBusinessGroupHealthResultObj.contactBusinessGroupsonHealth = contactBusinessGroupsonHealth;
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getBusinessGroupsonHealthOnAppletLoad> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <getBusinessGroupsonHealthOnAppletLoad> '+ex.getMessage());
            System.debug('Error(NoAccessException) '+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getBusinessGroupsonHealthOnAppletLoad> '+ex.getMessage());
            System.debug('Error(QueryException) <getBusinessGroupsonHealthOnAppletLoad> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <getBusinessGroupsonHealthOnAppletLoad> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }        
        
        System.debug('Ouput Parameters -> SortedList -'+accountBusinessGroupHealthResultObj.accountBusinessGroupsonHealth);
        
        System.debug('getBusinessGroupsonHealthOnAppletLoad(Id accountId,String columnName, String sortType) - END');
        
        return accountBusinessGroupHealthResultObj;
    }  
    
    /*
* The below method queries all the BGH__c records and sorts the data to display in popup which returns the List<BGH__c>.
*/
    @AuraEnabled    
    public static ContactSearchResult getBGHMembersForPopup(String searchKeyVal, Decimal pageNumber, String searchField, String operator, Id accountId){
        
        System.debug('getBGHMembersForPopup(Id accountId) - START');
        
        System.debug('Input Parameters -> searchKeyVal-'+searchKeyVal+', pageNumber-'+pageNumber+', searchField-'+searchField+'and operator-'+operator+'--accountId---'+accountId);
        
        ContactSearchResult contactSearchList = new ContactSearchResult();
        List<Contact> contactList = new List<Contact>();
        List<BGHContact__c> existingContactIds = new List<BGHContact__c>();

        Set<Id> removeDuplicate = new Set<Id>();
        UHGContactSOQLConstants bghMemberConstants = new UHGContactSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        
        try{
            String searchKey = '';
            
            if(searchKeyVal != null && searchKeyVal.trim().length() > 0 &&
               searchField != null && searchField.trim().length() > 0 && 
               operator != null && operator.trim().length() > 0) {    
                   if(searchField.equalsIgnoreCase(uhgAccountConstants.FIRST_NAME)) {
                       searchField = uhgAccountConstants.FIRST_NAME_ITAG;       
                   } else  if(searchField.equalsIgnoreCase(uhgAccountConstants.LAST_NAME)) {
                       searchField = uhgAccountConstants.LAST_NAME_ITAG;       
                   }
                   
                   if(operator.equalsIgnoreCase(uhgAccountConstants.BEGINS_WITH)) {
                       searchKey = searchKeyVal + '%';
                   } else if(operator.equalsIgnoreCase(uhgAccountConstants.CONTAINS)) {
                       searchKey = '%' + searchKeyVal + '%';
                   } else if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                       searchKey = searchKeyVal;
                   }
               } 
            
            String contactStatus = 'Active';
            Integer pageSize = uhgAccountConstants.POPUP_PAGESIZE;
            //Integer pageSize = 10;
            Integer offset = ((Integer)pageNumber - 1) * pageSize; 
            
            if(accountId != null){
                if(schema.sobjecttype.Contact.isaccessible() && schema.sobjecttype.Contact.isQueryable() && schema.sobjecttype.BGHContact__c.isaccessible() && schema.sobjecttype.BGHContact__c.isQueryable()) {
                    
                    existingContactIds = Database.query(bghMemberConstants.QUERY_BGH_CONTACT_BGH_MEMBER_CONTACTS);
                    
                    for(BGHContact__c bghContactId : existingContactIds){
                        removeDuplicate.add(bghContactId.BGHContact__c);
                    }
                    System.debug('removeDuplicate-->>'+removeDuplicate);
                    
                    if(searchKey != null && searchKey.trim().length() > 0){
                        contactSearchList.total = Database.countQuery(bghMemberConstants.QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP_CONTACT_BGH_MEMBER_CONTACT_COUNT+' and '+searchField+' LIKE :searchKey');
                        if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)){
                            contactSearchList.contactList = Database.query(bghMemberConstants.QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP_CONTACT_BGH_MEMBER_CONTACT_SEARCH+searchField+bghMemberConstants.QUERY_BGH_MEMBER_CONTACTS_EQUALS+bghMemberConstants.QUERY_BGH_MEMBER_CONTACTS_PAGINATION_OFFSET);
                        }else{
                            contactSearchList.contactList = Database.query(bghMemberConstants.QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP_CONTACT_BGH_MEMBER_CONTACT_SEARCH+searchField+bghMemberConstants.QUERY_BGH_MEMBER_CONTACTS_CONTAINS_LIKE+bghMemberConstants.QUERY_BGH_MEMBER_CONTACTS_PAGINATION_OFFSET);
                        }
                    }else{
                        contactSearchList.total = Database.countQuery(bghMemberConstants.QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP_CONTACT_BGH_MEMBER_CONTACT_COUNT);
                        contactSearchList.contactList = Database.query(bghMemberConstants.QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP_CONTACT_BGH_MEMBER_CONTACT);
                    }
                    
                    contactSearchList.page = (Integer)pageNumber;
                    contactSearchList.pageSize = pageSize;
                    
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getBGHMembersForPopup> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <getBGHMembersForPopup> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getBGHMembersForPopup> '+ex.getMessage());
            System.debug('Error(QueryException) <getBGHMembersForPopup> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <getBGHMembersForPopup> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }       
        
        System.debug('Output Parameters - contactSearchList-'+contactSearchList); 
        
        System.debug('getBGHMembersForPopup(Id accountId) - END');
        
        return contactSearchList;
    }
    
    /*
* The below method inserts the BGH__C records into SF Account which returns the updated List<BGH__C>.
*/
    @AuraEnabled    
    public static AccountBusinessGroupHealthResult addContactToBGHAccount(Id selectedContactId,Id accountId, boolean isContact){
        
        System.debug('addContactToBGHAccount(Id selectedBGHId,Id accountId) - START');
        
        System.debug('Input Parameters -> selectedContactId-'+selectedContactId+',accountId-'+accountId);
        
        List<BGH__c> insertBusinessGroupsonHealth = new List<BGH__c>();
        List<BGH__c> bghList = new List<BGH__c>();
        List<BGHContact__c> bghContactList = new List<BGHContact__c>();
        AccountBusinessGroupHealthResult accountBusinessGroupHealthResultObj = new AccountBusinessGroupHealthResult();
            
        try{
            if(accountId != null && selectedContactId !=null){
                if(schema.sobjecttype.BGHContact__c.isaccessible() && schema.sobjecttype.BGHContact__c.isCreateable()) {
                    
                    BGHContact__c bghCon = new BGHContact__c();
                    bghCon.BGHContact__c = selectedContactId;
                    bghCon.CompanyBGH__c = accountId;
                    bghCon.BGH_Unique_Value__c = selectedContactId +''+ accountId;
                    
                    insert bghCon;
                    
                    accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(accountId,'BGHContact__r.LastName','Asc', isContact);
                    
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <addContactToBGHAccount> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <addContactToBGHAccount> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(System.DmlException dmlExec){                      
            System.debug('DML Exception');
            for (Integer i = 0; i < dmlExec.getNumDml(); i++) {
                if(dmlExec.getDmlStatusCode(i).equals('DUPLICATE_VALUE')){
                   
                    accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(accountId,'BGHContact__r.LastName','Asc', isContact);
                }
                else{
                    System.debug('Status Code -> '+dmlExec.getDmlStatusCode(i)); 
                    System.debug('DML Error Message -> '+dmlExec.getDmlMessage(i)); 
                    System.debug('FieldNames -> '+dmlExec.getDmlFieldNames(i));
                    throw new AuraHandledException(dmlExec.getTypeName() +' Occured---> '+dmlExec.getDmlMessage(i));
                }
            }
        }catch(Exception ex) {
            System.debug('Exception <addContactToBGHAccount> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }        
        
        System.debug('addContactToBGHAccount(Id selectedBGHId,Id currentAccountId) - END');       	
        
        System.debug('Output Parameters -> SortedList-'+accountBusinessGroupHealthResultObj); 
        
        return accountBusinessGroupHealthResultObj;
    }
    
    /*
    * The below method deletes/disassociates the BGH__C records from SF Account.
    */
    @AuraEnabled
    public static AccountBusinessGroupHealthResult deleteBGHRecordFromApplet(Id accountBGHRecordId,Id currentRecordId, boolean isContact) {
        
        System.debug('deleteBGHRecordFromApplet(Id accountBGHRecordId,Id currentRecordId) - START');
        
        System.debug('Input Parameters -> accountBGHRecordId-'+accountBGHRecordId+',currentRecordId-'+currentRecordId);        
        
        List<BGH__c> getBusinessGroupsonHealth = new List<BGH__c>();
        AccountBusinessGroupHealthResult accountBusinessGroupHealthResultObj = new AccountBusinessGroupHealthResult();
        
        try {
            if(schema.sobjecttype.BGHContact__c.isaccessible() && schema.sobjecttype.BGHContact__c.isUpdateable()) {
                
                if(accountBGHRecordId != null && currentRecordId !=null) {
                    
                    Database.DeleteResult dbDelResultList = null;
                    
                    BGHContact__c bghContact = new BGHContact__c();
                    bghContact.Id = accountBGHRecordId;
                    System.debug('bghContact-->>'+bghContact);
                    dbDelResultList = Database.delete(bghContact);                        
                    
                    if(!dbDelResultList.isSuccess()) {
                        for(Database.Error err : dbDelResultList.getErrors()) {
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                            System.debug('Fields that affected this error: ' + err.getFields());
                        }
                    }
                    
                    accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(currentRecordId,'BGHContact__r.LastName','Asc', isContact);
                    
                } 
            } else {
                throw new NoAccessException();      
            }       
            
        } catch(NoAccessException ex) {
            System.debug('No Access <deleteBGHRecordFromApplet> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        } catch(System.DmlException dmlExec) {
            System.debug('DML Exception(Stack Trace) occurred in deleteBGHRecordFromApplet() method while deleting the '+
                         'details of BGH from SF -> '+dmlExec.getStackTraceString());
            for (Integer i = 0; i < dmlExec.getNumDml(); i++) {
                // Process exception here
                if(dmlExec.getDmlStatusCode(i).equals('ENTITY_IS_DELETED')){
                        accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(currentRecordId,'BGHContact__r.LastName','Asc', isContact);
                }
                else{
                    System.debug('Status Code -> '+dmlExec.getDmlStatusCode(i)); 
                    System.debug('DML Error Message -> '+dmlExec.getDmlMessage(i)); 
                    System.debug('FieldNames -> '+dmlExec.getDmlFieldNames(i));
                    throw new AuraHandledException(dmlExec.getTypeName() +' Occured---> '+dmlExec.getDmlMessage(i));
                }
            }
        }catch(Exception ex) {
            System.debug('Exception <deleteBGHRecordFromApplet> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        } 
        
        System.debug('Output Parameters -> SortedList-'+accountBusinessGroupHealthResultObj);
        
        System.debug('deleteBGHRecordFromApplet(Id accountBGHRecordId,Id currentRecordId) - END');
        
        return accountBusinessGroupHealthResultObj;
    }
    
    /*
    * The below logic is to enable Add button & Remove link only to the specified User Roles.
*/ 
    @AuraEnabled    
    public static boolean hasBGHMemberContactseditAccesToThisUser(Id accountId){	
       boolean isLoggedInUserRole = true;
        
        try{
            User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                String[] roleNames = System.Label.BGH_Member_Contacts_No_Access_Users.split(',');
                
                System.debug('loggedInUserRole-->>'+loggedInUserRole+'---roleNames---->>>'+roleNames.size());
                
                Set<String> roleNamesSet = new Set<String>(roleNames);
                if(roleNamesSet.contains(loggedInUserRole)) {
                    isLoggedInUserRole = false;
                } else {
                    isLoggedInUserRole = true;
                }
            }
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the Role of Logged In User from SF in '+
                         'hasBGHMemberContactseditAccesToThisUser() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in hasBGHMemberContactseditAccesToThisUser() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('QueryException Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        return isLoggedInUserRole;
       
    }
    
    /*
    * Wrapper class to display BGH Records
    */
    
    public class AccountBusinessGroupHealthResult {
        
        @AuraEnabled
        public List<BGH__c> accountBusinessGroupsonHealth{ get;set; }

		@AuraEnabled
        public List<BGHContact__c> contactBusinessGroupsonHealth{ get;set; }
        
        @AuraEnabled
        public Boolean isEditAccess { get;set; }
        
        @AuraEnabled
        public List<Account> accountCategoryList{ get;set; }
    }
    
    public class ContactSearchResult {
        
        @AuraEnabled
        public List<Contact> contactList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
    }

}