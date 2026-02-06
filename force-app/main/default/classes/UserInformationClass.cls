/****************************************************************** ***** 
Name: UserInformationClass 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Get all the Edit acces to all applets for the Account and releated Information
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 HARSHAVARDHAN Y R  	13/09/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/

public without sharing class UserInformationClass {
    
    
    /******************************************************************
* 
Purpose: Get all the Edit acces to all applets for the Account and releated Information
Parameters: accountId
Returns: AccountGenericInformation(Wrapper Class)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/ 
   @AuraEnabled 
    public static AccountGenericInformation getGeneralInfomationMethod(Id accountId){
        
        String loggedInUserRoleName = '';
        
        UHGAccountConstants constants = new UHGAccountConstants();
        
    	AccountGenericInformation genericInformation = new AccountGenericInformation();
        genericInformation.isEmptyUserRoleName = false;
        genericInformation.accountType = '';
        genericInformation.pageSize = constants.APPLET_PAGESIZE;
        genericInformation.isContactCreateable = isContactCreateable();
        genericInformation.isMACreateable = isMACreateable();
        
        
        try{
            System.debug('accountId '+accountId);
            getAccountType(accountId,genericInformation);
            
            Boolean HasEditAccess = UserInformationClass.hasEditAccessToRecord(accountId);            
            
            Map<String,boolean> userEditAccessMap = new Map<String,boolean>();
            
            Map<String,String> userEditRoleNamesAccessMap = UHGAccountConstants.userHasEditRoleNamesAccessMap;
            Map<String,String> userNoEditRoleNamesAccessMap = UHGAccountConstants.userNoEditRoleNamesAccessMap;
            
            // getting the role name
			loggedInUserRoleName = getUserInformationMethod();
            //loggedInUserRoleName = 'CRM Administrator';
            if(loggedInUserRoleName != null && loggedInUserRoleName.length() > 0){
                for (String appletName : userEditRoleNamesAccessMap.keySet()){
                    userEditAccessMap.put(appletName, hasEditAccesToThisUser(loggedInUserRoleName,userEditRoleNamesAccessMap.get(appletName)));                        
                }        
                
                for (String appletName : userNoEditRoleNamesAccessMap.keySet()){
                    if(appletName.equals(UHGAccountConstants.RISK_PROFILE_APPLET_NAME_PARTIAL_ACCESS)){
                        if(userEditAccessMap.containsKey(UHGAccountConstants.RISK_PROFILE_APPLET_NAME_FULL_ACCESS) && !userEditAccessMap.get(UHGAccountConstants.RISK_PROFILE_APPLET_NAME_FULL_ACCESS)){
                            userEditAccessMap.put(appletName, hasEditAccesForNotAllowedUser(loggedInUserRoleName,userNoEditRoleNamesAccessMap.get(appletName)));
                        }else{
                            userEditAccessMap.put(appletName, false);
                        }                
                    }else{
                        userEditAccessMap.put(appletName, hasEditAccesForNotAllowedUser(loggedInUserRoleName,userNoEditRoleNamesAccessMap.get(appletName)));                           
                    }            
                }     
                
                userEditAccessMap.put(UHGAccountConstants.BUSSINESS_GROUP_HEALTH, hasBGHeditAccesToThisUser(loggedInUserRoleName,genericInformation.accountType));
                
            }else{
                genericInformation.isEmptyUserRoleName = true;
            }     
            
            if(userEditAccessMap != null && userEditAccessMap.containsKey('RiskProfileFullAccess') && !userEditAccessMap.get('RiskProfileFullAccess')){
                userEditAccessMap.put('RiskProfilePartialAccess', HasEditAccess);
            }
            genericInformation.userEditAccessMap = userEditAccessMap;
            genericInformation.HasEditAccess = HasEditAccess;
            System.debug('genericInformation '+genericInformation);
        }catch(Exception ex){
            loggedInUserRoleName = '';
            System.debug('Exception Line Number '+ex.getLineNumber());
            System.debug('Exception Message '+ex.getMessage());
        }    
        return genericInformation;
    }    
    
    public static Boolean isMACreateable(){
        return schema.sobjecttype.Opportunity.isCreateable();
    }
    
    public static Boolean isContactCreateable(){
        return schema.sobjecttype.Contact.isCreateable();
    }
    
    @AuraEnabled    
    public static Boolean hasEditAccessToRecord(String accountId){
        try{
            String userId = UserInfo.getUserId();
            
            UserRecordAccess userRecordAccs = [SELECT RecordId, HasEditAccess FROM UserRecordAccess where RecordId = :accountId AND UserId =:userId  Limit 1];
            
            return userRecordAccs.HasEditAccess;                
        }catch(Exception ex){
            System.debug('Error Occured in Querying AccoutShare Object '+ex);
        }
        return false;
    }
   
    /******************************************************************
* 
Purpose: Get the Logged User Role Name
Returns: string(Logged User Role Name)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/ 
    @AuraEnabled    
    public static string getUserInformationMethod(){
        System.debug('Enter <getUserInfomationMethod>');                                
        string loggedInUserRoleName = null;
        try{
            if(schema.sobjecttype.User.isaccessible() && schema.sobjecttype.User.isQueryable()) {
                User userDetails = [SELECT Id, Username, UserRole.Name FROM User where Id=:UserInfo.getUserId()];
                if(userDetails.UserRole != null && userDetails.UserRole.Name != null){
                 	loggedInUserRoleName = userDetails.UserRole.Name;   
                }                
            }else{
                throw new NoAccessException();
            }            
        }catch(Exception ex){
            System.debug('Exception <getUserInfomationMethod> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }                    
        return loggedInUserRoleName;
    }
    
    /******************************************************************
* 
Purpose: Check the Edit acces if contains the user role array
Parameters: loggedInUserRoleName,roleNamesHasEditAccessStr
Returns: boolean(isEditAccess)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/ 
    @AuraEnabled    
    public static boolean hasEditAccesToThisUser(String loggedInUserRoleName ,String roleNamesHasEditAccessStr){	
        System.debug('Enter <isEditAccesToThisUser>');
        Boolean isEditAccess = false;
        try{                                               
            String[] roleNamesHasEditAccess = roleNamesHasEditAccessStr.split(',');
            if(roleNamesHasEditAccess != null && roleNamesHasEditAccess.size() > 0){
                Set<String> roleNamesHasEditAccessSet = new Set<String>(roleNamesHasEditAccess);
                if(roleNamesHasEditAccessSet.contains(loggedInUserRoleName)) {
                    isEditAccess = true;
                } else {
                    isEditAccess = false;
                }        
            }
        }
        catch(Exception ex){
            System.debug('Error occurred in isEditAccesToThisUser()' + ex.getMessage());            
        }            
        System.debug('Output Parameters - isEditAccess-'+isEditAccess);
        System.debug('End <isEditAccesToThisUser>');        
        return isEditAccess;
    }

    /******************************************************************
* 
Purpose: Check the Edit acces if not contains the user role array
Parameters: loggedInUserRoleName,roleNamesHasNotEditAccessStr
Returns: boolean(isEditAccess)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/ 
    @AuraEnabled    
    public static boolean hasEditAccesForNotAllowedUser(String loggedInUserRoleName ,String roleNamesHasNotEditAccessStr){	
        System.debug('Enter <hasNoEditAccesToThisUser>');
        Boolean isEditAccess = false;
        try{                                               
            String[] roleNamesHasNotEditAccess = roleNamesHasNotEditAccessStr.split(',');
            if(roleNamesHasNotEditAccess != null && roleNamesHasNotEditAccess.size() > 0){
                Set<String> roleNamesHasNotEditAccessSet = new Set<String>(roleNamesHasNotEditAccess);                
                if(!roleNamesHasNotEditAccessSet.contains(loggedInUserRoleName)) {
                    isEditAccess = true;
                } else {
                    isEditAccess = false;
                }        
            }
        }
        catch(Exception ex){
            System.debug('Error occurred in hasNoEditAccesToThisUser()' + ex.getMessage());            
        }            
        System.debug('Output Parameters - hasNoEditAccesToThisUser-'+isEditAccess);
        System.debug('End <hasNoEditAccesToThisUser>');        
        return isEditAccess;
    }
    /******************************************************************
* 
Purpose: Get the Account releated Information
Parameters: accountId,genericInformation
Returns: AccountGenericInformation(Wrapper Class contains Account Information)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/ 
     @AuraEnabled    
    public static AccountGenericInformation getAccountType(Id accountId,AccountGenericInformation genericInformation){
        String accountType = null;
        String accountTypeForAggregator = null;        
        Id contactrecordTypeId = null;                        
        Id contactTypeIdforAccConsultant = null;        
        
        try{
            if(accountId != null){
                if(schema.sobjecttype.Contact.isaccessible() && schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.Account.isaccessible()) {                    
                    Account accountCategory = [select Category__c,Subtype__c from Account where Id=:accountId];                                            
                    if(accountCategory.Category__c == 'Client Management'){
                        contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId();
                    }else if(accountCategory.Category__c == 'Client Development'){
                        contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
                    }else if(accountCategory.Category__c == 'Consulting Firm'){
                        contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
                    }
                    else if(accountCategory.Category__c == 'Aggregator'){
                        contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Aggregator Contact').getRecordTypeId();
                    }else{
                        contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
                    }            
                    
                    if(accountCategory.Category__c == 'Aggregator' && accountCategory.Subtype__c =='Collaborative Ventures Group (CVG)'){
                        accountTypeForAggregator = 'CVGAccount';
                    }else if(accountCategory.Category__c == 'Aggregator' && accountCategory.Subtype__c =='Business Group on Health (BGH)'){
                        accountTypeForAggregator = 'BGHAccount';
                    }else{
                        accountTypeForAggregator = 'CVGAccount';
                    }
                    
                    contactTypeIdforAccConsultant = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();                    
                    
                    genericInformation.accountType = accountCategory.Category__c;
                    genericInformation.accountTypeForAggregator = accountTypeForAggregator;
                    genericInformation.contactTypeId = contactrecordTypeId;
					genericInformation.contactTypeIdforAccConsultant = contactTypeIdforAccConsultant;                    
                    
                }else{
                    throw new NoAccessException();
                }
            }else{
                throw new NoAccessException();
            }
        }catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }
        System.debug('accountContactInitialResults'+genericInformation);
        return genericInformation;
    }
    
    /******************************************************************
* 
Purpose: Checking edit access for BGH
Parameters: loggedInUserRoleName,categoryAccount
Returns: boolean(isEditAccess)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/ 
    @AuraEnabled    
    public static boolean hasBGHeditAccesToThisUser(String loggedInUserRoleName,String categoryAccount){	
        
        boolean isEditAccess = false;
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
        return isEditAccess;
    }
    /******************************************************************
* 
Wrapper class for Returing diffrent Return Types for lighting component

*******************************************************************
*/ 
    public class AccountGenericInformation {
        @AuraEnabled
        public String accountType{ get;set; }                
        
        @AuraEnabled
        public boolean HasEditAccess { get;set; } 
        
        @AuraEnabled
        public boolean isContactCreateable { get;set; } 
        
        @AuraEnabled
        public boolean isMACreateable { get;set; } 
        
        @AuraEnabled
        public String accountTypeForAggregator{ get;set; }
        
        @AuraEnabled
        public String contactTypeIdforAccConsultant{ get;set; } 
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public  Id contactTypeId{ get;set; }
        
        @AuraEnabled
        public boolean isEmptyUserRoleName { get;set; }
        
        @AuraEnabled
        public Map<String,boolean> userEditAccessMap { get;set; }
    }    
     
}