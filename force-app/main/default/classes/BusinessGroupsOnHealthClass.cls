/****************************************************************** ***** 
Name: BusinessGroupOnHealth
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query for an Account of particualr type to get the related Sub Accounts(I.e BGH).
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Shruthi G  	 		07/11/2017  		INITIAL DEVELOPMENT   		  
2.0 -		 Abhishek Kumar			11/08/2017
*********************************************************************
*/

public with sharing class BusinessGroupsOnHealthClass {
    
    /*
    * The below method queries the BGH__c records based on the associated AccountId and sorts
    * the data based on the columnName & sortType which returns the List<BGH__c>.
    */
    @AuraEnabled    
    public static AccountBusinessGroupHealthResult getBusinessGroupsonHealthOnAppletLoad(Id accountId,String columnName, String sortType, boolean isContact){
        
        System.debug('getBusinessGroupsonHealthOnAppletLoad(Id accountId,String columnName, String sortType) - START');
        
        System.debug('Input Parameters - accountId-'+accountId+',ColumnName-'+columnName+', SortOrder-'+sortType);
        if(columnName!=null)
         columnName = String.escapeSingleQuotes(columnName);
        if(sortType!=null)
        sortType = String.escapeSingleQuotes(sortType);
        List<BGH__c> accountBusinessGroupsonHealth = new List<BGH__c>();
        List<BGHContact__c> contactBusinessGroupsonHealth = new List<BGHContact__c>();
      //  List<Account> accountCategoryList = new List<Account>();
        UHGAccountSOQLConstants businessGroupsOnHealthConstants = new UHGAccountSOQLConstants();
        AccountBusinessGroupHealthResult accountBusinessGroupHealthResultObj = new AccountBusinessGroupHealthResult();
        Account accountToUpdate;
        try{
            if(accountId != null && columnName!=null && sortType!=null){
                if(schema.sobjecttype.BGH__c.isaccessible() && schema.sobjecttype.BGH__c.isQueryable() && schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.BGHContact__c.isaccessible() && schema.sobjecttype.BGHContact__c.isQueryable()) {
                    if(isContact){
                        contactBusinessGroupsonHealth  = Database.query(businessGroupsOnHealthConstants.QUERY_FOR_BUSINESS_GROUPS_ON_HEALTH_CONTACT+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType));
                        accountBusinessGroupHealthResultObj.contactBusinessGroupsonHealth = contactBusinessGroupsonHealth;
                    }else{
                    	accountBusinessGroupsonHealth  = Database.query(businessGroupsOnHealthConstants.QUERY_FOR_BUSINESS_GROUPS_ON_HEALTH+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType));    
                        accountBusinessGroupHealthResultObj.accountBusinessGroupsonHealth = accountBusinessGroupsonHealth;
                    }
                    
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
    public static List<Account> getAccountBusinessGroupsForPopup(Id accountId, boolean isContact){
        
        System.debug('getAccountBusinessGroupsForPopup(Id accountId) - START');
        
        System.debug('Input Parameters - accountId-'+accountId);
        
        List<Account> accountBusinessGroups = new List<Account>();
        List<BGH__c> accountBusinessGroupsUnique = new List<BGH__c>();
        List<BGHContact__c> contactBusinessGroupsUnique = new List<BGHContact__c>();
        Set<Id> removeDuplicate = new Set<Id>();
        UHGAccountSOQLConstants businessGroupsOnHealthConstants = new UHGAccountSOQLConstants();
        try{
            if(accountId != null){
                if(schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.BGH__c.isaccessible() && schema.sobjecttype.BGH__c.isQueryable() && schema.sobjecttype.BGHContact__c.isaccessible() && schema.sobjecttype.BGHContact__c.isQueryable()) {
                    
                    if(isContact){
                        
                        Id contactId = accountId;
                        
                        contactBusinessGroupsUnique = Database.query(businessGroupsOnHealthConstants.QUERY_BGH_CONTACT);
                        system.debug('contactBusinessGroupsUnique '+contactBusinessGroupsUnique);
                        for(BGHContact__c bghAccountId : contactBusinessGroupsUnique){
                            removeDuplicate.add(bghAccountId.CompanyBGH__c);
                        }
                        
                        Contact contactRecForAccId = [SELECT AccountId FROM Contact WHERE Id = :contactId WITH USER_MODE];
                        
                        removeDuplicate.add(contactRecForAccId.AccountId);
                    
                    }else{
                        accountBusinessGroupsUnique = Database.query(businessGroupsOnHealthConstants.QUERY_BGH_ACCOUNT);    
                        
                        for(BGH__c bghAccountId : accountBusinessGroupsUnique){
                            removeDuplicate.add(bghAccountId.BGH_Account__c);
                        }
                    
                        removeDuplicate.add(accountId);

                    }
                                        
                    accountBusinessGroups = Database.query(businessGroupsOnHealthConstants.QUERY_AND_REMOVE_DUPLICATE_BGH_FROM_POPUP);
                    
                    accountBusinessGroups.sort();
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getAccountBusinessGroupsForPopup> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <getAccountBusinessGroupsForPopup> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getAccountBusinessGroupsForPopup> '+ex.getMessage());
            System.debug('Error(QueryException) <getAccountBusinessGroupsForPopup> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <getAccountBusinessGroupsForPopup> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }       
        
        System.debug('Output Parameters - accountBusinessGroups-'+accountBusinessGroups); 
        
        System.debug('getAccountBusinessGroupsForPopup(Id accountId) - END');
        
        return accountBusinessGroups;
    }
    
    /*
* The below method inserts the BGH__C records into SF Account which returns the updated List<BGH__C>.
*/
    @AuraEnabled    
    public static AccountBusinessGroupHealthResult addBusinessGroupsToAccount(List<Id> selectedBGHId,Id accountId, boolean isContact){
        
        System.debug('addBusinessGroupsToAccount(List<Id> selectedBGHId,Id accountId) - START');
        
        System.debug('Input Parameters -> selectedBGHId-'+selectedBGHId+',accountId-'+accountId);
        
        List<BGH__c> insertBusinessGroupsonHealth = new List<BGH__c>();
        List<BGH__c> bghList = new List<BGH__c>();
        List<BGHContact__c> bghContactList = new List<BGHContact__c>();
        AccountBusinessGroupHealthResult accountBusinessGroupHealthResultObj = new AccountBusinessGroupHealthResult();
            
        try{
            if(accountId != null && selectedBGHId !=null){
                if(schema.sobjecttype.BGH__c.isaccessible() && schema.sobjecttype.BGH__c.isCreateable() && schema.sobjecttype.BGHContact__c.isaccessible() && schema.sobjecttype.BGHContact__c.isCreateable() ) {
                    if(isContact){
                        for(Id bghAccId : selectedBGHId){
                            BGHContact__c bghCon = new BGHContact__c();
                            bghCon.BGHContact__c = accountId;
                            bghCon.CompanyBGH__c = bghAccId;
                            bghCon.BGH_Unique_Value__c = accountId +''+ bghAccId;
                            bghContactList.add(bghCon);
                        }  
                    	Database.insert(bghContactList, false);
                    }else{
                        for(Id bghAccId :selectedBGHId){
                            BGH__c bgh = new BGH__c();
                            bgh.BGH_Account__c = bghAccId;
                            bgh.New_Account__c  = accountId;
                            bgh.BGH_Unique_Value__c = accountId +''+ bghAccId;
                            bghList.add(bgh);       
                        }
                    	Database.insert(bghList,false);
                    }
                    
                    
                    if(isContact){
                        accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(accountId,'BGHContact__r.Name','Asc', isContact);
                    }else{
                        accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(accountId,'BGH_Account__r.Name','Asc', isContact);    
                    }
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <addBusinessGroupsToAccount> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <addBusinessGroupsToAccount> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(System.DmlException dmlExec){                      
            System.debug('DML Exception');
            for (Integer i = 0; i < dmlExec.getNumDml(); i++) {
                if(dmlExec.getDmlStatusCode(i).equals('DUPLICATE_VALUE')){
                    if(isContact){
                        accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(accountId,'BGHContact__r.Name','Asc', isContact);
                    }else{
                    	accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(accountId,'BGH_Account__r.Name','Asc', isContact);
                    }
                }
                else{
                    System.debug('Status Code -> '+dmlExec.getDmlStatusCode(i)); 
                    System.debug('DML Error Message -> '+dmlExec.getDmlMessage(i)); 
                    System.debug('FieldNames -> '+dmlExec.getDmlFieldNames(i));
                    throw new AuraHandledException(dmlExec.getTypeName() +' Occured---> '+dmlExec.getDmlMessage(i));
                }
            }
        }catch(Exception ex) {
            System.debug('Exception <addBusinessGroupsToAccount> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }        
        
        System.debug('addBusinessGroupsToAccount(List<Id> selectedBGHId,Id currentAccountId) - END');       	
        
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
            if(schema.sobjecttype.BGH__c.isaccessible() && schema.sobjecttype.BGH__c.isUpdateable() && schema.sobjecttype.BGHContact__c.isaccessible() && schema.sobjecttype.BGHContact__c.isUpdateable()) {
                
                if(accountBGHRecordId != null && currentRecordId !=null) {
                    
                    Database.DeleteResult dbDelResultList = null;
                    
                    if(isContact){
                        BGHContact__c bghContact = new BGHContact__c();
                        bghContact.Id = accountBGHRecordId;
                        if(BGHContact__c.sObjectType.getDescribe().isDeletable()){
                        	dbDelResultList = Database.delete(bghContact);   
                        }
                    }else{
                        BGH__c bgh = new BGH__c();
                        bgh.Id = accountBGHRecordId;
                        if(BGH__c.sObjectType.getDescribe().isDeletable()){
                       	 dbDelResultList = Database.delete(bgh);  
                        }
                    }
                    
                    if(!dbDelResultList.isSuccess()) {
                        for(Database.Error err : dbDelResultList.getErrors()) {
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                            System.debug('Fields that affected this error: ' + err.getFields());
                        }
                    }
                    
                    if(isContact){
                        accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(currentRecordId,'BGHContact__r.Name','Asc', isContact);
                    }else{
                        accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(currentRecordId,'BGH_Account__r.Name','Asc', isContact);
                    }
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
                    if(isContact){
                        accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(currentRecordId,'BGHContact__r.Name','Asc', isContact);
                    }else{
                        accountBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(currentRecordId,'BGH_Account__r.Name','Asc', isContact);
                    }
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
    public static boolean hasBGHeditAccesToThisUser(Id accountId, boolean isContact){	
        
        System.debug('isContact-->>'+isContact);
        
        String categoryAccount = '';
        boolean isEditAccess = false;
        
        if(isContact){
            Id profileId=userinfo.getProfileId();
            String profileName=[Select Id,Name from Profile where Id=:profileId].Name;
            system.debug('ProfileName'+profileName);
            if(profileName=='NA Services Community Profile' || profileName=='CSI Client Director'){
                isEditAccess=false;
            }else{
                User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()]; 
            
            Id contactId = accountId;
            Contact contactDetails = [select RecordType.Name, Account.Category__c from Contact where Id=:contactId WITH USER_MODE];
            
            String contactType = contactDetails.RecordType.Name;
            
            System.debug('contactType-->>'+contactType);
            
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                
                String loggedInUserRoleName = user.UserRole.Name;  
                //String[] roleNamesExecutives = System.Label.BGH_Contact_No_Edit_Access.split(',');
                String[] roleNamesExecutives = new String[]{'General Executive','Senior Executives','Benefit Strategist'};
                System.debug('roleNames-->>'+roleNamesExecutives);
                System.debug('loggedInUserRole-->>'+loggedInUserRoleName);
                Set<String> roleNamesSet = new Set<String>(roleNamesExecutives);
                if(!roleNamesSet.contains(loggedInUserRoleName)){
                    //if(contactType.equalsIgnoreCase('Consultant')){
                    //Quick Fix for Role Names issue for CMCSAD
                    String[] consultantRoleNamesArray = new String[]{'CM CSAD','CM VPCR/RVP','CM SCE', 'Surest CM SCE', 'Surest CM SVP', 'Specialty Benefits SCE','CM VP','CM AA','Specialty Benefits SVP'};
                        if(contactType.equalsIgnoreCase('Consultant') && consultantRoleNamesArray.contains(loggedInUserRoleName)) {
                            isEditAccess = false;
                        } else {
                            isEditAccess = true; 
                        }
                } else {
                    isEditAccess = false;
                } 
                //}
            }
                
            }
            
        }else{
            /*
            Account accountCategory = [select Category__c from Account where Id=:accountId];
            
            if(accountCategory !=null && accountCategory.Category__c !=null){
                categoryAccount = accountCategory.Category__c;
            }
            
            User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                  
            if(user.UserRole != null && user.UserRole.Name != null &&
               user.UserRole.Name.trim().length() > 0) {
                   
                   String loggedInUserRoleName = user.UserRole.Name;  
                   String[] roleNamesExecutives = System.Label.BusinessGroupHealth_Not_Allowed_Roles_For_Edit.split(',');
                   String[] cmRoleNames = System.Label.BGH_CM_Access_Role_Names.split(',');
                   String[] cdRoleNames = System.Label.BGH_CD_Access_Role_Names.split(',');
                   
                   Set<String> roleNamesSet = new Set<String>(roleNamesExecutives);
                   if(!roleNamesSet.contains(loggedInUserRoleName)) {
                       isEditAccess = true;
                   } else {
                       isEditAccess = false;
                   }
                   
                   Set<String> cmRoleNamesSet = new Set<String>(cmRoleNames);
                   if(cmRoleNamesSet.contains(loggedInUserRoleName)){
                       if(categoryAccount.equalsIgnoreCase('Competitor') || categoryAccount.equalsIgnoreCase('Consulting Firm')){
                           isEditAccess = false;
                       }else{
                           isEditAccess = true;
                       }
                   }
                   
                   Set<String> cdRoleNamesSet = new Set<String>(cdRoleNames);
                   if(cdRoleNamesSet.contains(loggedInUserRoleName)){
                       if(categoryAccount.equalsIgnoreCase('Competitor')){
                           isEditAccess = false;
                       }else{
                           isEditAccess = true;
                       }
                   }					
               }*/

            Id profileId=userinfo.getProfileId();
            String profileName=[Select Id,Name from Profile where Id=:profileId].Name;
            system.debug('ProfileName'+profileName);
            if(profileName=='NA Services Community Profile' || profileName=='CSI Client Director'){
                isEditAccess=false;
            }else{
                isEditAccess = UserInformationClass.hasEditAccessToRecord(accountId);
            }
            
        }
        
        System.debug('isEditAccess-->>'+isEditAccess);
        
        /*UserRecordAccess ura = [SELECT RecordId, HasEditAccess FROM UserRecordAccess WHERE UserId = :UserInfo.getUserId() AND RecordId =: accountId];
        
        if(!ura.HasEditAccess){
            isEditAccess = false;
        }*/
        
        return isEditAccess;
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
    
    //Abhishek
    
    public class RecordDetailsDoInit{
        @AuraEnabled
        public String[] roleValues { get; set; }
        
        @AuraEnabled 
        public String objectType { get; set; }
        
        public RecordDetailsDoInit(){
            roleValues = new List<String>();
            objectType = '';
        }
    }
    
    @AuraEnabled
    public static RecordDetailsDoInit getObjectType(Id recordId){
        RecordDetailsDoInit recordDetails = new RecordDetailsDoInit();
        
        recordDetails.objectType = String.valueOf(recordId.getSobjectType());
        
        Schema.DescribeFieldResult fieldResult = BGHContact__c.Role__c.getDescribe();
        List<Schema.PicklistEntry> plv = fieldResult.getPicklistValues();
        
        for( Schema.PicklistEntry f : plv)
        {
            System.debug('Field Label ' + f.getLabel());
            System.debug('Field Value ' + f.getValue());
            recordDetails.roleValues.add(f.getValue());   
        }
        
        System.debug('objectType::-->>'+recordDetails.objectType);
        System.debug('Role PickList values::-->>'+recordDetails.roleValues);
        
        return recordDetails;
    }
    
    
    /*
* The below method updates the role of BGHContact_c records.
*/
    
    @AuraEnabled
    public static AccountBusinessGroupHealthResult updateBGHRole(Id bghContactRecordId, String updatedRole, Id currentRecordId, boolean isContact){
        System.debug('updateBGHRole(Id bghContactRecordId, String updatedRole, Id currentRecordId, boolean isContact) - START');
        
        System.debug('Input Parameters -> bghContactRecordId-'+bghContactRecordId+', updatedRole--'+updatedRole+',currentRecordId-'+currentRecordId);        
        
        List<BGHContact__c> getBusinessGroupsonHealth = new List<BGHContact__c>();
        AccountBusinessGroupHealthResult contactBusinessGroupHealthResultObj = new AccountBusinessGroupHealthResult();
        UHGAccountSOQLConstants uhgAccountConstants = new UHGAccountSOQLConstants();
        
        try {
            if(schema.sobjecttype.BGHContact__c.isaccessible() && schema.sobjecttype.BGHContact__c.isUpdateable()){
                BGHContact__c bghContact = new BGHContact__c();
                bghContact.Id = bghContactRecordId;
                bghContact.Role__c = updatedRole;
                
                update bghContact;
                
                contactBusinessGroupHealthResultObj = getBusinessGroupsonHealthOnAppletLoad(currentRecordId,'BGHContact__r.Name','Asc', isContact);
                
            }else {
                throw new NoAccessException();      
            }
        }catch(NoAccessException ex) {
            System.debug('No Access <updateBGHRole> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        } catch(System.DmlException dmlExec) {
            System.debug('DML Exception(Stack Trace) occurred in updateBGHRole() method while updating the '+
                         'details of BGH from SF -> '+dmlExec.getStackTraceString());
            for (Integer i = 0; i < dmlExec.getNumDml(); i++) {
                    System.debug('Status Code -> '+dmlExec.getDmlStatusCode(i)); 
                    System.debug('DML Error Message -> '+dmlExec.getDmlMessage(i)); 
                    System.debug('FieldNames -> '+dmlExec.getDmlFieldNames(i));
                    throw new AuraHandledException(dmlExec.getTypeName() +' Occured---> '+dmlExec.getDmlMessage(i));
            }
        }catch(Exception ex){
            System.debug('Exception <updateBGHRole> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }
         
        System.debug('updateBGHRole(Id bghContactRecordId, String updatedRole, Id currentRecordId, boolean isContact) - END');
        return contactBusinessGroupHealthResultObj;
    }
    
    
}