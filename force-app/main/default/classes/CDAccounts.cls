/****************************************************************** ***** 
Name: AccountContactController 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query all the contacts related to perticular account of type CM or CD defending on the account type for the AccountContact Contact Custom Lightning Component.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Jnanesh Avaradi  	 	07/07/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/

public with sharing class CDAccounts {
    
    
    @AuraEnabled    
    public static accountContactInitialValues getAccountType(Id accountId){
        String accountType = null;
        Id contactrecordTypeId = null;
        accountContactInitialValues accountContactInitialResults = null;
        try{
            if(accountId != null){
                if(schema.sobjecttype.Contact.isaccessible() && schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.Account.isaccessible()) {
                    accountContactInitialResults = new accountContactInitialValues();
                    Account accountCategory = [select Category__c from Account where Id=:accountId];
                    if(accountCategory.Category__c == 'Client Management'){
                        contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId();
                    }else if(accountCategory.Category__c == 'Client Development'){
                        contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
                    }else if(accountCategory.Category__c == 'Consulting Firm'){
                        System.debug('test');
                        contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
                    }
                    else if(accountCategory.Category__c == 'Aggregator'){
                        contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Aggregator Contact').getRecordTypeId();
                    }else{
                        contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
                    }
                    accountContactInitialResults.isLoggedInUserRole = false;
                    /*User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];
                    System.debug('user'+user.UserRole);
                    if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                        String loggedInUserRole = user.UserRole.Name;
                        String[] roleNames = System.Label.BusinessGroupHealth_Not_Allowed_Roles_For_Edit.split(',');
                        System.debug('roleNames'+roleNames);
                        Set<String> roleNamesSet = new Set<String>(roleNames);
                        if(roleNamesSet.contains(loggedInUserRole)) {
                            accountContactInitialResults.isLoggedInUserRole = false;
                        } else {
                            accountContactInitialResults.isLoggedInUserRole = true;
                        }
                    }*/
                    boolean isEditAccess = UserInformationClass.isContactCreateable();
                    accountContactInitialResults.isLoggedInUserRole = isEditAccess;
                    accountContactInitialResults.accountType = accountCategory.Category__c;
                    accountContactInitialResults.contactTypeId = contactrecordTypeId;
                    Id profileId=userinfo.getProfileId();
                    String profileName=[Select Id,Name from Profile where Id=:profileId].Name;
                    system.debug('ProfileName@@@@'+profileName);
                    if((profileName=='NA Services Community Profile' || profileName=='CSI Client Director') && accountCategory.Category__c != 'Client Management'){
                        accountContactInitialResults.showNewButton=false;
                        system.debug('profiletrue'+profileName);
                    }else{
                        accountContactInitialResults.showNewButton=true;
                        system.debug('profileXX'+profileName);
                    }
                }
            }
        }catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }
        System.debug('accountContactInitialResults'+accountContactInitialResults);
        return accountContactInitialResults;
    }
    
    
    
    
    /******************************************************************
* 
Purpose: Query all contacts related to perticular account of type CM Or CD Defending on Contact Type
Parameters: pageNumber, columnName, sortType & contactType
Returns: cmContactsResult(List of contacts of type CM or CD)
Throws [Exceptions]: [optional] 

*******************************************************************
*/ 
    @AuraEnabled    
    public static cmCdCfContactsResult getAccountContacts(Id accountId,Decimal pageNumber,String columnName, String sortType,String currentContactType){
        System.debug('Enter AccountContactController <getAccountContacts()>'); 
        System.debug('Input Parameters'+'  '+'accountId--'+accountId+'pageNumber--'+pageNumber+'columnName--'+columnName+'sortType--'+sortType+'currentContactType--'+currentContactType); 
        cmCdCfContactsResult cmCdCfContactResult = null;
        try{
            if(accountId != null && pageNumber!= null && columnName != null && sortType != null){
                
                UHGAccountConstants accountContactConstants = new UHGAccountConstants();
                UHGAccountSOQLConstants accountContactSOQLConstants = new UHGAccountSOQLConstants();
                //Integer pageSize = 2;
                Integer pageSize = accountContactConstants.APPLET_PAGESIZE;
                Integer offset = ((Integer)pageNumber - 1) * pageSize;
                string accountStatus = accountContactConstants.CONTACT_STATUS_ACTIVE;
                if(schema.sobjecttype.Contact.isaccessible() && schema.sobjecttype.Contact.isQueryable() && schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                    cmCdCfContactResult = new cmCdCfContactsResult();
                    Account accountType = [select Category__c from Account where Id=:accountId];
                    //cmCdCfContactResult.total = [SELECT count() FROM Contact Where AccountId =:accountId AND Status__c =:accountStatus AND Type__c =:currentContactType];
                    cmCdCfContactResult.total = [SELECT count() FROM Contact Where AccountId =:accountId AND Status__c =:accountStatus AND RecordType.Id =:currentContactType];
                    System.debug('cmCdCfContactResult.total'+cmCdCfContactResult.total);
                    if(pageNumber > 1 && (cmCdCfContactResult.total == (pageNumber-1) * pageSize)){
                        pageNumber--; 
                        offset = ((Integer)pageNumber - 1) * pageSize;
                    }
                    //cmCdCfContactResult.cmCdCfContactsList = Database.query(accountContactSOQLConstants.queryStringForTypeCmCdContacts+columnName+' '+sortType+accountContactSOQLConstants.queryStringForTypeCmCd2Contacts);
                    cmCdCfContactResult.cmCdCfContactsList = Database.query(accountContactSOQLConstants.queryStringForTypeCmCdContacts+columnName+' '+sortType+accountContactSOQLConstants.queryStringForTypeCmCd2Contacts);
                    System.debug(cmCdCfContactResult.cmCdCfContactsList.size());
                    for(Contact con :cmCdCfContactResult.cmCdCfContactsList){
                        String mailingAddress = '';
                        if(con.MailingStreet != null){
                            mailingAddress = con.MailingStreet;
                        }
                        if(con.MailingCity != null){
                            if(mailingAddress != null && mailingAddress.length() > 0){
                                mailingAddress = mailingAddress+', '+con.MailingCity;
                            }else{
                                mailingAddress = con.MailingCity;
                            }
                            
                        }
                        if(con.MailingStateCode != null){
                            if(mailingAddress != null && mailingAddress.length() > 0){
                                mailingAddress = mailingAddress+', '+con.MailingStateCode;
                            }else{
                                mailingAddress = con.MailingStateCode;
                            }
                            
                        }
                        if(con.MailingPostalCode != null){
                            if(mailingAddress != null && mailingAddress.length() > 0){
                                mailingAddress =mailingAddress+' '+con.MailingPostalCode;
                            }else{
                                mailingAddress = con.MailingPostalCode;
                            }
                            
                        }
                        con.AddressCFBackend__c = mailingAddress;
                    }
                    System.debug('Result...'+cmCdCfContactResult.cmCdCfContactsList);      
                    
                    cmCdCfContactResult.page = (Integer)pageNumber;
                    cmCdCfContactResult.pageSize = pageSize;
                    cmCdCfContactResult.accountType = accountType.Category__c;
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured');
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountContacts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('You dont have permission to Create/View this record');
        } catch(QueryException queryExec){
            System.debug('Error(QueryException) occurred while querying the details of Conatct object from SF in '+
                         'getAccountContacts() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getAccountContacts() method, the Stack Trace is -> '
                         +queryExec.getStackTraceString());
            throw new AuraHandledException('Query Excetion Occured----');
        }catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }      
        System.debug('Exit CMAccounts <getAccountContacts()>');     
        return cmCdCfContactResult;        
    }
    
    public class cmCdCfContactsResult {
        
        @AuraEnabled
        public List<Contact> cmCdCfContactsList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public String accountType { get;set; }
        
    }
    
    public class accountContactInitialValues {
        
        @AuraEnabled
        public String accountType{ get;set; }
        
        @AuraEnabled
        public  Id contactTypeId{ get;set; }
        
        @AuraEnabled
        public Boolean isLoggedInUserRole { get;set; }
        
         @AuraEnabled
        public Boolean showNewButton { get;set; }
        
        
        
    }
}