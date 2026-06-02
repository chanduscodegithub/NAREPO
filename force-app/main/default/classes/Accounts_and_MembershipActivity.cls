/****************************************************************** ***** 
Name: Accounts And MembershipActivity
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query for Accounts & Opportunities Associated with Consulting Firm Accounts.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Shruthi G  	 		08/16/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/

public without sharing class Accounts_and_MembershipActivity {

    /*
    * The below method queries Accounts & Opportunities records based on the associated AccountId and sorts
    * the data based on the columnName & sortType.
    */
    @AuraEnabled    
    public static AccountandMembershipActivityResult getAccountsAndMembershipActivityOnAppletLoad(Id accountId,String columnName,String columnName1, String sortType){
        
        System.debug('getAccountsAndMembershipActivityOnAppletLoad(Id accountId,String columnName,String columnName1, String sortType) - START');
        
        System.debug('Input Parameters - accountId-'+accountId+',ColumnName-'+columnName+',ColumnName1-'+columnName1+', SortOrder-'+sortType);
        
        List<AccountCFJunction__c> accountandMembershipActivity = new List<AccountCFJunction__c>();
        List<AccountContactRelation> accountContactRel = new List<AccountContactRelation>();
        List<OpportunityContactRole> MembershipActivityList = new List<OpportunityContactRole>();
        UHGAccountSOQLConstants accountCurrentRelationshipConstants = new UHGAccountSOQLConstants();
        AccountandMembershipActivityResult accountandMembershipActivityObj = new AccountandMembershipActivityResult();
        //Added as a part of CR on 09th Oct 2024
        Set<Id> allCompanies = new Set<Id>();
        Set<Id> allProspectCompanies = new Set<Id>();
        //CR changes ends
        list<ClientSurveyResults__c> CSRList=new list<ClientSurveyResults__c>();        
        set<string> accountIdList =new set<string>();
        
        String columnName2 = 'Contact.Account.Name';
        try{
            if(accountId != null && columnName!=null && sortType!=null){
                System.debug('schema.sobjecttype.AccountCFJunction__c.isaccessible()@@@@'+schema.sobjecttype.AccountCFJunction__c.isaccessible()+' xxxx schema.sobjecttype.AccountCFJunction__c.isQueryable()@@@ '+schema.sobjecttype.AccountCFJunction__c.isQueryable()+' xxxx schema.sobjecttype.OpportunityContactRole.isaccessible() @@@'
                             +schema.sobjecttype.OpportunityContactRole.isaccessible() +'xxxx schema.sobjecttype.OpportunityContactRole.isQueryable()@@@'+schema.sobjecttype.OpportunityContactRole.isQueryable()+'xxxx schema.sobjecttype.Account.isaccessible() @@@'+schema.sobjecttype.Account.isaccessible()+'schema.sobjecttype.Account.isQueryable()@@@'+schema.sobjecttype.Account.isQueryable());
               // if(schema.sobjecttype.AccountCFJunction__c.isaccessible() && schema.sobjecttype.AccountCFJunction__c.isQueryable() && schema.sobjecttype.OpportunityContactRole.isaccessible() && schema.sobjecttype.OpportunityContactRole.isQueryable() && schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                    accountandMembershipActivity = Database.query(accountCurrentRelationshipConstants.QUERY_ACCOUNTS_CURRENT_RELATIONSHIPS+' '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType));
                    accountContactRel = Database.query(accountCurrentRelationshipConstants.QUERY_ACCOUNTS_CURRENT_RELATIONSHIPS2+' '+columnName2+' '+String.escapeSingleQuotes(sortType));
                    //MembershipActivityList = Database.query(accountCurrentRelationshipConstants.QUERY_MEMBERSHIP_ACTIVITIES+' '+columnName1+' '+sortType+' '+accountCurrentRelationshipConstants.LIMIT_DISPALY_RECORDS);
                    accountandMembershipActivityObj.accountandMembershipActivity = accountandMembershipActivity;
                    accountandMembershipActivityObj.accountContactRel = accountContactRel;
					//accountandMembershipActivityObj.MembershipActivityList = MembershipActivityList;
			
                //Added by Vignesh  25/11/24
                list<ClientSurveyResults__c> CSR =  Database.query(accountCurrentRelationshipConstants.queryForClientSurveyYear);
                accountandMembershipActivityObj.yearValue =CSR[0].year__c;
                
                accountandMembershipActivityObj.accountContactRel = accountContactRel;//Database.query(contactSOQLConstants.queryStringForRelatedAccounts1+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType)+contactSOQLConstants.queryStringForRelatedAccounts2);
                for(AccountContactRelation ac:accountContactRel){
                    accountIdList.add(ac.AccountId);
                }
                for(AccountCFJunction__c ac:accountandMembershipActivity){
                    accountIdList.add(ac.AccountFirm__c);
                }
                CSRList =[SELECT Id, Name, LikelihoodtoRecommendScore__c, Account__r.Name,Account__c,year__c FROM ClientSurveyResults__c where Account__c IN:accountIdList and year__c=:CSR[0].Year__c and type__c='Client Survey Results'];//Database.query(contactSOQLConstants.queryLRTValues); 
                accountandMembershipActivityObj.CSRList =CSRList;
                
					//Added as a part of CR on 09th Oct 2024                                        
                if(accountandMembershipActivity != null && accountandMembershipActivity.size()>0){
                    for(AccountCFJunction__c accCF : accountandMembershipActivity){
                        if(accCF.AccountFirm__r.RecordType.DeveloperName == 'Existing_Client'){
                           allCompanies.add(accCF.AccountFirm__c);
                        }
                    }
                }
                
                if(accountContactRel != null && accountContactRel.size()>0){
                    for(AccountContactRelation accRel : accountContactRel){
                        if(accRel.Account.RecordType.DeveloperName == 'Existing_Client'){
                           allCompanies.add(accRel.AccountId);
                        }
                    }
                }
                
                accountandMembershipActivityObj.existingClientCompanies = allCompanies.size();
                    //CR changes ends
                    
                //Added Vignesh 8/11/24 -- Start
                 if(accountandMembershipActivity != null && accountandMembershipActivity.size()>0){
                    for(AccountCFJunction__c accCF : accountandMembershipActivity){
                        if(accCF.AccountFirm__r.RecordType.DeveloperName == 'Prospect'){
                           allProspectCompanies.add(accCF.AccountFirm__c);
                        }
                    }
                }
                
                if(accountContactRel != null && accountContactRel.size()>0){
                    for(AccountContactRelation accRel : accountContactRel){
                        if(accRel.Account.RecordType.DeveloperName == 'Prospect'){
                           allProspectCompanies.add(accRel.AccountId);
                        }
                    }
                }
                
                accountandMembershipActivityObj.prospectCompanies = allProspectCompanies.size();
                system.debug('prospectCompanies'+allProspectCompanies.size());
                
               //Added Vignesh 8/11/24 -- End 
                   
                /*}else {
                    throw new NoAccessException();
                }*/
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getAccountsAndMembershipActivityOnAppletLoad> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <getAccountsAndMembershipActivityOnAppletLoad> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getAccountsAndMembershipActivityOnAppletLoad> '+ex.getMessage());
            System.debug('Error(QueryException) <getAccountsAndMembershipActivityOnAppletLoad> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <getAccountsAndMembershipActivityOnAppletLoad> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }       
        
        System.debug('Ouput Parameters -> SortedList -'+accountandMembershipActivityObj.accountandMembershipActivity);
        
        System.debug('getAccountsAndMembershipActivityOnAppletLoad(Id accountId,String columnName, String sortType) - END');
        
        return accountandMembershipActivityObj;
    }
    
    
    @AuraEnabled    
    public static AccountandMembershipActivityResult getMembersipActivities(Id accountId, String columnName, String sortType){
        
        System.debug('getMembersipActivities(Id accountId,String columnName,String columnName1, String sortType) - START');
        
        System.debug('Input Parameters - accountId-'+accountId+',ColumnName-'+columnName+', SortOrder-'+sortType);
        
        List<OpportunityContactRole> MembershipActivityList = new List<OpportunityContactRole>();
        UHGAccountSOQLConstants accountCurrentRelationshipConstants = new UHGAccountSOQLConstants();
        AccountandMembershipActivityResult accountandMembershipActivityObj = new AccountandMembershipActivityResult();
        try{
            if(accountId != null && columnName!=null && sortType!=null){
                //if(schema.sobjecttype.AccountCFJunction__c.isaccessible() && schema.sobjecttype.AccountCFJunction__c.isQueryable() && schema.sobjecttype.OpportunityContactRole.isaccessible() && schema.sobjecttype.OpportunityContactRole.isQueryable() && schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                    
                    //accountandMembershipActivityObj.MembershipActivityList = Database.query(accountCurrentRelationshipConstants.QUERY_MEMBERSHIP_ACTIVITIES+' '+columnName+' '+sortType+' '+accountCurrentRelationshipConstants.LIMIT_DISPALY_RECORDS);
                    accountandMembershipActivityObj.MembershipActivityList = Database.query(accountCurrentRelationshipConstants.QUERY_MEMBERSHIP_ACTIVITIES+' '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType));
                    System.debug('Query--'+accountCurrentRelationshipConstants.QUERY_MEMBERSHIP_ACTIVITIES+' '+columnName+' '+sortType);
                    
               /* }else {
                    throw new NoAccessException();
                }*/
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getMembersipActivities> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <getMembersipActivities> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getMembersipActivities> '+ex.getMessage());
            System.debug('Error(QueryException) <getMembersipActivities> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <getMembersipActivities> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }       
        
        System.debug('Ouput Parameters -> SortedList -'+accountandMembershipActivityObj.MembershipActivityList);
        
        System.debug('getMembersipActivities(Id accountId,String columnName, String sortType) - END');
        
        return accountandMembershipActivityObj;
    }
    
    
    /*
    * The below method queries Opportunities records based on the associated AccountId and sorts
    * the data based on the columnName & sortType.
    */
    @AuraEnabled    
    public static AccountandMembershipActivityResult getMembershipActivityOnSortLoad(Id accountId, String columnName1, String sortType){
        
        System.debug('getAccountsAndMembershipActivityOnAppletLoad(Id accountId,String columnName1, String sortType) - START');
        
        System.debug('Input Parameters - accountId-'+accountId+',ColumnName1-'+columnName1+', SortOrder-'+sortType);
        
        List<OpportunityContactRole> MembershipActivityList = new List<OpportunityContactRole>();
        UHGAccountSOQLConstants accountCurrentRelationshipConstants = new UHGAccountSOQLConstants();
        AccountandMembershipActivityResult MAObj = new AccountandMembershipActivityResult();
        try{
            if(accountId != null && columnName1!=null && sortType!=null){
                //if(schema.sobjecttype.OpportunityContactRole.isaccessible() && schema.sobjecttype.OpportunityContactRole.isQueryable() && schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                    
                    MembershipActivityList = Database.query(accountCurrentRelationshipConstants.QUERY_MEMBERSHIP_ACTIVITIES+' '+String.escapeSingleQuotes(columnName1)+' '+String.escapeSingleQuotes(sortType)+' '+accountCurrentRelationshipConstants.LIMIT_DISPALY_RECORDS);
                    MAObj.MembershipActivityList = MembershipActivityList;                                        
                    
               /* }else {
                    throw new NoAccessException();
                }*/
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getAccountsAndMembershipActivityOnAppletLoad> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <getAccountsAndMembershipActivityOnAppletLoad> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getAccountsAndMembershipActivityOnAppletLoad> '+ex.getMessage());
            System.debug('Error(QueryException) <getAccountsAndMembershipActivityOnAppletLoad> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <getAccountsAndMembershipActivityOnAppletLoad> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }       
        
        System.debug('Ouput Parameters -> SortedList -'+MAObj.MembershipActivityList);
        
        System.debug('getAccountsAndMembershipActivityOnAppletLoad(Id accountId,String columnName, String sortType) - END');
        
        return MAObj;
    }
    
    /*
    * The below method queries Accounts records based on the associated AccountId and sorts
    * the data based on the columnName & sortType.
    */
    @AuraEnabled    
    public static AccountandMembershipActivityResult getAccountsSortOnAppletLoad(Id accountId, String columnName, String sortType){
        
        System.debug('getAccountsSortOnAppletLoad(Id accountId,String columnName, String sortType) - START');
        
        System.debug('Input Parameters - accountId-'+accountId+',ColumnName-'+columnName+', SortOrder-'+sortType);
        
        List<AccountCFJunction__c> accountsList = new List<AccountCFJunction__c>();
        UHGAccountSOQLConstants accountCurrentRelationshipConstants = new UHGAccountSOQLConstants();
        AccountandMembershipActivityResult accountsObj = new AccountandMembershipActivityResult();
        try{
            if(accountId != null && columnName!=null && sortType!=null){
               // if(schema.sobjecttype.AccountCFJunction__c.isaccessible() && schema.sobjecttype.AccountCFJunction__c.isQueryable() && schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                    
                    accountsList  = Database.query(accountCurrentRelationshipConstants.QUERY_ACCOUNTS_CURRENT_RELATIONSHIPS+' '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType)+' '+accountCurrentRelationshipConstants.LIMIT_DISPALY_RECORDS);
                                       
                    accountsObj.accountsList = accountsList;
				/*}else {
                    throw new NoAccessException();
                }*/
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getAccountsAndMembershipActivityOnAppletLoad> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <getAccountsAndMembershipActivityOnAppletLoad> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getAccountsAndMembershipActivityOnAppletLoad> '+ex.getMessage());
            System.debug('Error(QueryException) <getAccountsAndMembershipActivityOnAppletLoad> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <getAccountsAndMembershipActivityOnAppletLoad> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }       
        
        System.debug('Ouput Parameters -> SortedList -'+accountsObj.accountsList);
        
        System.debug('getAccountsAndMembershipActivityOnAppletLoad(Id accountId,String columnName, String sortType) - END');
        
        return accountsObj;
    }
    
    /*
    * The below method queries Accounts records based on the associated AccountId and sorts
    * the data based on the columnName & sortType.
    */
    @AuraEnabled    
    public static AccountandMembershipActivityResult getAccountsAndMembershipActivityOnShowFullListLoad(Id accountId,String columnName, String sortType,Decimal pageNumber){
        
        System.debug('getAccountsAndMembershipActivityOnShowFullListLoad(Id accountId,String columnName, String sortType,Decimal pageNumber) - START');
        
        System.debug('Input Parameters - accountId-'+accountId+',ColumnName-'+columnName+', SortOrder-'+sortType+', pageNumber'+pageNumber);
        
        List<AccountCFJunction__c> accountsCurrentRelShowFullList = new List<AccountCFJunction__c>();
        UHGAccountSOQLConstants accountCurrentRelationshipConstants = new UHGAccountSOQLConstants();
        AccountandMembershipActivityResult accountandMAShowFullListObj = new AccountandMembershipActivityResult();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        
        try{
           
            if(accountId != null && columnName!=null && sortType!=null && pageNumber!=null){
                //if(schema.sobjecttype.AccountCFJunction__c.isaccessible() && schema.sobjecttype.AccountCFJunction__c.isQueryable() && schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                    Integer pageSize = uhgAccountConstants.Accounts_Current_Relationship_Pagination_Size;
                    Integer offset = ((Integer)pageNumber - 1) * pageSize;
                    
                    accountandMAShowFullListObj.total = Database.countQuery(accountCurrentRelationshipConstants.QUERY_STRING_ACCOUNTS_CURRENT_RELATIONSHIPS_COUNT);
                    if(pageNumber > 1 && (accountandMAShowFullListObj.total == (pageNumber-1) * pageSize)){
                        pageNumber--; 
                        offset = ((Integer)pageNumber - 1) * pageSize;
                    }
                    
                    accountsCurrentRelShowFullList  = Database.query(accountCurrentRelationshipConstants.QUERY_ACCOUNTS_CURRENT_RELATIONSHIPS+' '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType)+' '+accountCurrentRelationshipConstants.QUERY_PAGINATION_DETAILS);
                    accountandMAShowFullListObj.accountsCurrentRelShowFullList = accountsCurrentRelShowFullList;
                    accountandMAShowFullListObj.page = (Integer)pageNumber;
                    accountandMAShowFullListObj.pageSize = pageSize;
                    
               /* }else {
                    throw new NoAccessException();
                }*/
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getAccountsAndMembershipActivityOnShowFullListLoad> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <getAccountsAndMembershipActivityOnShowFullListLoad> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getAccountsAndMembershipActivityOnShowFullListLoad> '+ex.getMessage());
            System.debug('Error(QueryException) <getAccountsAndMembershipActivityOnShowFullListLoad> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <getAccountsAndMembershipActivityOnShowFullListLoad> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }       
        
        System.debug('Ouput Parameters -> SortedList -'+accountandMAShowFullListObj.accountsCurrentRelShowFullList);
        
        System.debug('getAccountsAndMembershipActivityOnShowFullListLoad(Id accountId,String columnName, String sortType,Decimal pageNumber) - END');
        
        return accountandMAShowFullListObj;
    }
    
    /*
    * The below method queries Opportunities records based on the associated AccountId and sorts
    * the data based on the columnName & sortType.
    */
    @AuraEnabled    
    public static AccountandMembershipActivityResult getMembershipActivityOnShowFullListLoad(Id accountId,String columnName, String sortType,Decimal pageNumber){
        
        System.debug('getMembershipActivityOnShowFullListLoad(Id accountId,String columnName, String sortType,Decimal pageNumber) - START');
        
        System.debug('Input Parameters - accountId-'+accountId+',ColumnName-'+columnName+', SortOrder-'+sortType+', pageNumber'+pageNumber);
        
        List<OpportunityContactRole> membershipActivityShowFullList = new List<OpportunityContactRole>();
        UHGAccountSOQLConstants accountCurrentRelationshipConstants = new UHGAccountSOQLConstants();
        AccountandMembershipActivityResult membershipActivityShowFullListObj = new AccountandMembershipActivityResult();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        
        try{
           
            if(accountId != null && columnName!=null && sortType!=null && pageNumber!=null){
               // if(schema.sobjecttype.OpportunityContactRole.isaccessible() && schema.sobjecttype.OpportunityContactRole.isQueryable() && schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                    Integer pageSize = 1000;//uhgAccountConstants.Accounts_Current_Relationship_Pagination_Size;
                    Integer offset = ((Integer)pageNumber - 1) * pageSize;
                    
                    membershipActivityShowFullListObj.total = Database.countQuery(accountCurrentRelationshipConstants.QUERY_STRING_MEMBERSHIP_ACTIVITIES_COUNT);
                    if(pageNumber > 1 && (membershipActivityShowFullListObj.total == (pageNumber-1) * pageSize)){
                        pageNumber--; 
                        offset = ((Integer)pageNumber - 1) * pageSize;
                    }
                    
                    membershipActivityShowFullList  = Database.query(accountCurrentRelationshipConstants.QUERY_MEMBERSHIP_ACTIVITIES+' '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType));
                    System.debug('membershipActivityShowFullList'+membershipActivityShowFullList);
                    membershipActivityShowFullListObj.membershipActivityShowFullList = membershipActivityShowFullList;
                    membershipActivityShowFullListObj.page = (Integer)pageNumber;
                    membershipActivityShowFullListObj.pageSize = pageSize;
                    
                /*}else {
                    throw new NoAccessException();
                }*/
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getMembershipActivityOnShowFullListLoad> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <getMembershipActivityOnShowFullListLoad> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getMembershipActivityOnShowFullListLoad> '+ex.getMessage());
            System.debug('Error(QueryException) <getMembershipActivityOnShowFullListLoad> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <getMembershipActivityOnShowFullListLoad> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }       
        
        System.debug('Ouput Parameters -> SortedList -'+membershipActivityShowFullListObj.membershipActivityShowFullList);
        
        System.debug('getMembershipActivityOnShowFullListLoad(Id accountId,String columnName, String sortType,Decimal pageNumber) - END');
        
        return membershipActivityShowFullListObj;
    }
        
	/*
    * Wrapper class to display Accounts and MembershipActivity records
    */
    
    public class AccountandMembershipActivityResult {
        
        @AuraEnabled
        public List<AccountCFJunction__c> accountandMembershipActivity{ get;set; }
        
        @AuraEnabled
        public List<AccountContactRelation> accountContactRel { get;set; }
        
        @AuraEnabled
        public List<OpportunityContactRole> MembershipActivityList{ get;set; }
        
        @AuraEnabled
        public List<AccountCFJunction__c> accountsList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set;}
        
        @AuraEnabled
        public Integer page { get;set;}
        
        @AuraEnabled
        public Integer total { get;set;}
        
        @AuraEnabled
        public List<AccountCFJunction__c> accountsCurrentRelShowFullList{ get;set; }
        
        @AuraEnabled
        public List<OpportunityContactRole> membershipActivityShowFullList{ get;set; }
        
        //Added as a part of CR on 09th Oct 2024
        @AuraEnabled
        public Integer existingClientCompanies { get;set;}
        //CR changes ends
       
         //Added Vignesh 8/11/24 -- Start
        @AuraEnabled
        public Integer prospectCompanies { get;set;}
        
         @AuraEnabled
        public string yearValue { get;set;}
        
          @AuraEnabled
        public List<ClientSurveyResults__c> CSRList{ get;set; }
        
    }
}