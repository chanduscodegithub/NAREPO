/****************************************************************** ***** 
Name: Membership_Activities_CMCD
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query for Opportunities Associated with Accounts.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Shruthi G  	 		15/12/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/
public without sharing class Membership_Activities_CMCD {

    /*
    * The below method queries Opportunities records based on the associated AccountId and sorts
    * the data based on the columnName & sortType.
    */
    @AuraEnabled    
    public static MembershipActivityResult getMembershipActivitiesCMCDOnAppletLoad(Id accountId,String columnName,String sortType,Decimal pageNumber){
        
        System.debug('getMembershipActivitiesCMCDOnAppletLoad(Id accountId,String columnName,String sortType,Decimal pageNumber) - START');
        
        System.debug('Input Parameters - accountId-'+accountId+',ColumnName-'+columnName+', SortOrder-'+sortType+', pageNumber-'+pageNumber);
        
        List<Opportunity> MembershipActivityList = new List<Opportunity>();
        UHGAccountSOQLConstants MembershipActivityLisConstants = new UHGAccountSOQLConstants();
        MembershipActivityResult MembershipActivityObj = new MembershipActivityResult();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        
        try{
            if(accountId != null && columnName!=null && sortType!=null && pageNumber!=null){
                //if(schema.sobjecttype.Opportunity.isaccessible() && schema.sobjecttype.Opportunity.isQueryable() && schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                    Integer pageSize = uhgAccountConstants.Membership_Activities_CMCD_Size;
                    Integer offset = ((Integer)pageNumber - 1) * pageSize;
                    
                    MembershipActivityObj.total = Database.countQuery(MembershipActivityLisConstants.QUERY_STRING_MEMBERSHIP_ACTIVITIES_CMCD_COUNT);
                    if(pageNumber > 1 && (MembershipActivityObj.total == (pageNumber-1) * pageSize)){
                        pageNumber--; 
                        offset = ((Integer)pageNumber - 1) * pageSize;
                    }
                    
                    MembershipActivityList = Database.query(MembershipActivityLisConstants.QUERY_MEMBERSHIP_ACTIVITIES_CMCD+' '+columnName+' '+sortType+' '+MembershipActivityLisConstants.QUERY_MA_PAGINATION_DETAILS);
					MembershipActivityObj.MembershipActivityList = MembershipActivityList;                                        
                    MembershipActivityObj.page = (Integer)pageNumber;
                    MembershipActivityObj.pageSize = pageSize;
               // }else {
                //    throw new NoAccessException();
                //}
            } else{
                throw new NullPointerException();
            }
        }catch(Exception ex) {
            System.debug('Exception <getMembershipActivitiesCMCDOnAppletLoad> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }       
        
        System.debug('Ouput Parameters -> SortedList -'+MembershipActivityObj.MembershipActivityList);
        
        System.debug('getMembershipActivitiesCMCDOnAppletLoad(Id accountId,String columnName, String sortType) - END');
        
        return MembershipActivityObj;
    }
    
    @AuraEnabled
    public static ReturnQAData queryAccountsAndRecordTypeValues(Id accountId) {
        
        ReturnQAData returnQADataObj = new ReturnQAData();  
        try {
            String accCategory = '';
            String oppCategory = '';
            if(accountId != null) {
                returnQADataObj.accountData =  [SELECT Name,Category__c FROM Account where Id=:accountId];
                if(returnQADataObj.accountData != null) {
                    accCategory = returnQADataObj.accountData.Category__c;
                    if(accCategory != null && accCategory != '') {
                        if(accCategory == 'Client Development') {
                            oppCategory = 'CD';
                        } else if(accCategory == 'Client Management') {
                            oppCategory = 'CM';
                        }
                    }
                }
            } else {
                oppCategory = 'CM';
            }
            returnQADataObj.recordTypeData =  [SELECT Id FROM RecordType where DeveloperName=:oppCategory];
            
        } catch(Exception e) {
            System.debug('Exception occurred in queryAccountsAndRecordTypeValues method - '+e);
        }
        return returnQADataObj; 
    }
    
     @AuraEnabled
    public static Boolean getLoggedInUerRoleInfo() {
       
        Boolean isLoggedInUserRoleToBeEnabled = false;
           
        try {
            
            User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                String[] roleNames = new List<String>();
               
                roleNames = System.Label.Membership_Activity_CmCd_Roles_To_EnableAddOrEditButtons.split(',');
                             
                Set<String> roleNamesSet = new Set<String>(roleNames);
                if(roleNamesSet.contains(loggedInUserRole)) {
                    isLoggedInUserRoleToBeEnabled = true;
                } else {
                    isLoggedInUserRoleToBeEnabled = false;
                }
            }
            
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        
        return isLoggedInUserRoleToBeEnabled;
    }
        
	/*
    * Wrapper class to display Accounts and MembershipActivity records
    */
    
    public class MembershipActivityResult {
               
        @AuraEnabled
        public Integer pageSize { get;set;}
        
        @AuraEnabled
        public Integer page { get;set;}
        
        @AuraEnabled
        public Integer total { get;set;}
        
        @AuraEnabled
        public List<Opportunity> MembershipActivityList{ get;set; }
    }
    
    public class ReturnQAData { 
    
		@AuraEnabled
        public Account accountData {get;set;}
        
        @AuraEnabled
        public RecordType recordTypeData {get;set;}
        
        public ReturnQAData() {
            accountData = new Account();
            recordTypeData = new RecordType();
        }
        
    }
}