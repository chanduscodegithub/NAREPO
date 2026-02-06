/****************************************************************** ***** 
Name: AccountTeamController 
Copyright © 2017 CRMIT Solutions Company Inc.  
================================================================================================== 
==================================================================================================
Purpose: Query all AccountTeamMembers related to particular account/ 
OpportunityTeamMembers related to a particulat MA Custom Lightning Component.
==================================================================================================
==================================================================================================
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Prashanth R  	 	17/07/2017  		INITIAL DEVELOPMENT   		  
2.0 -		 Abhishek Kumar		25/11/2017			DEVELOPMENT 2.0
3.0 - 
********************************************************************************************************
*/

public without sharing class AccountTeamController {
    
    @AuraEnabled
    public static String getObjectType(Id recordId){
        return recordId.getSObjectType().getDescribe().getName();
    }
    
    @AuraEnabled    
    public static accountTeamInitialValues getAccountTeamRole(Id accountId){
        Id contactrecordTypeId = null;
        accountTeamInitialValues accountTeamInitialResults = null;
        try{
            if(accountId != null){
                accountTeamInitialResults = new accountTeamInitialValues();
                accountTeamInitialResults.isLoggedInUserRole = false;
                boolean isEditAccess = UserInformationClass.hasEditAccessToRecord(accountId);
                accountTeamInitialResults.isLoggedInUserRole = isEditAccess;
                
                accountTeamInitialResults.recordIdObjectType = accountId.getSObjectType().getDescribe().getName();
                
            }
        }catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }
        System.debug('accountContactInitialValues'+accountTeamInitialResults);
        return accountTeamInitialResults;
    }
    
    /**********************************************************************************************************************************
* 
Purpose: Query all AccountTeamMembers related to particular account/ OpportunityTeamMember related to an Opportunity
Parameters: accountId,pageNumber, columnName & sortType
Returns: getAccountTeamMemberRecords(List of AccountTeamMembers/ OpportunityTeamMembers)
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException

**************************************************************************************************************************************
*/ 
    
    @AuraEnabled    
    public static accountTeamMemberResult getAccountTeamMemberRecords(Id accountId,Decimal pageNumber,String columnName, String sortType){
        System.debug('Enter AccountTeamController <getAccountTeamMembers()>'); 
        System.debug('columnName  ...'+columnName+'....sortType..'+sortType);
        if(columnName == 'UserRole'){
            columnName = 'UserRole.Name'; 
        }
        if(columnName == 'JobTitle'){
            columnName = 'Title'; 
        }
        
        UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        AccountTeamMemberResult accountTeamMembersResult = null;
        boolean isOpty = false;
        
        try{
            String recordIdobjectType = accountId.getSObjectType().getDescribe().getName();
            isOpty = recordIdobjectType.equalsIgnoreCase('Opportunity');
            if(accountId != null && pageNumber!= null && columnName != null && sortType != null){
                Integer pageSize = uhgAccountConstants.APPLET_PAGESIZE;
                Integer offset = ((Integer)pageNumber - 1) * pageSize;
                
                if(isOpty){
                    if(schema.sobjecttype.OpportunityTeamMember.isaccessible() && schema.sobjecttype.OpportunityTeamMember.isQueryable()) {
                        accountTeamMembersResult = new AccountTeamMemberResult();
                        Id optyId = accountId;
                        List<OpportunityTeamMember> teamMemberUser = Database.query(uhgQueryConstants.QUERY_STRING_OPTY_TEAM_MEMEBER_USERS);
                        Set<Id> userIds = new Set<Id>();
                        for(OpportunityTeamMember id :teamMemberUser){
                            userIds.add(id.UserId);
                        }
                        accountTeamMembersResult.total = Database.countQuery(uhgQueryConstants.QUERY_STRING_USER_COUNT);
                        if(pageNumber > 1 && (accountTeamMembersResult.total == (pageNumber-1) * pageSize)){
                            pageNumber--; 
                            offset = ((Integer)pageNumber - 1) * pageSize;
                        }
                        accountTeamMembersResult.accountTeamMembers = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_MEMBERS+' '+columnName+' '+sortType+' '+uhgQueryConstants.QUERY_STRING_PAGESIZE_LIMIT);
                        accountTeamMembersResult.page = (Integer)pageNumber;
                        accountTeamMembersResult.pageSize = pageSize;
                    }else {
                        throw new NoAccessException();
                    }
                }else{
                    if(schema.sobjecttype.AccountTeamMember.isaccessible() && schema.sobjecttype.AccountTeamMember.isQueryable()) {
                        accountTeamMembersResult = new AccountTeamMemberResult();
                        List<AccountTeamMember> teamMemberUser = Database.query(uhgQueryConstants.QUERY_STRING_TEAM_MEMEBER_USERS);
                        Set<Id> userIds = new Set<Id>();
                        for(AccountTeamMember id :teamMemberUser){
                            userIds.add(id.UserId);
                        }
                        accountTeamMembersResult.total = Database.countQuery(uhgQueryConstants.QUERY_STRING_USER_COUNT);
                        if(pageNumber > 1 && (accountTeamMembersResult.total == (pageNumber-1) * pageSize)){
                            pageNumber--; 
                            offset = ((Integer)pageNumber - 1) * pageSize;
                        }
                        accountTeamMembersResult.accountTeamMembers = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_MEMBERS+' '+columnName+' '+sortType+' '+uhgQueryConstants.QUERY_STRING_PAGESIZE_LIMIT);
                        accountTeamMembersResult.page = (Integer)pageNumber;
                        accountTeamMembersResult.pageSize = pageSize;
                    }else {
                        throw new NoAccessException();
                    }
                }
            }else{
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
        System.debug('Exit AccountTeamController <getAccountTeamMembers()>');        
        return accountTeamMembersResult;        
    }
    
    
    /*
* The below method queries the Users based on the Page size & Offset which returns the List<User>.
*/
    @AuraEnabled
    public static UserResult getUserRecords(String searchKeyVal, Decimal pageNumber, String searchField, String operator,Id accountId) {
        
        UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        UserResult userResultObj = new UserResult();
        boolean isOpty = false;
        
        try {
            
            String searchKey = '';
            
            if(searchKeyVal != null && searchKeyVal.trim().length() > 0 &&
               searchField != null && searchField.trim().length() > 0 && 
               operator != null && operator.trim().length() > 0) {    
                   if(searchField.equalsIgnoreCase(uhgAccountConstants.LAST_NAME)) {
                       searchField = uhgAccountConstants.LAST_NAME_ITAG;       
                   } else  if(searchField.equalsIgnoreCase(uhgAccountConstants.FIRST_NAME)) {
                       searchField = uhgAccountConstants.FIRST_NAME_ITAG;       
                   }else  if(searchField.equalsIgnoreCase(uhgAccountConstants.JOB_TITLE)) {
                       searchField = uhgAccountConstants.JOB_TITLE_ITAG_USER;       
                   }  
                   
                   if(operator.equalsIgnoreCase(uhgAccountConstants.BEGINS_WITH)) {
                       searchKey = searchKeyVal + '%';
                   } else if(operator.equalsIgnoreCase(uhgAccountConstants.CONTAINS)) {
                       searchKey = '%' + searchKeyVal + '%';
                   } else if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                       searchKey = searchKeyVal;
                   }
               } 
            
            Boolean userStatus = true;
            Integer pageSize = uhgAccountConstants.POPUP_PAGESIZE;
            //Integer pageSize = 8;
            Integer offset = ((Integer)pageNumber - 1) * pageSize; 
            
            String recordIdobjectType = accountId.getSObjectType().getDescribe().getName();
            isOpty = recordIdobjectType.equalsIgnoreCase('Opportunity');
            
            if(schema.sobjecttype.User.isaccessible() && schema.sobjecttype.AccountTeamMember.isaccessible() && schema.sobjecttype.OpportunityTeamMember.isaccessible()) {
                
                List<AccountTeamMember> accTM = new List<AccountTeamMember>();
                List<OpportunityTeamMember> oppTM = new List<OpportunityTeamMember>();
                Set<Id> userIds = new Set<Id>();
                
                if(isOpty){
                    Id optyId = accountId;
                    oppTM = Database.query(uhgQueryConstants.QUERY_STRING_OPTY_TEAM_MEMEBER_USERS);
                    
                    for(OpportunityTeamMember oppTeamId : oppTM){
                        userIds.add(oppTeamId.UserId);
                    }
                }else{
                    accTM = Database.query(uhgQueryConstants.QUERY_STRING_TEAM_MEMEBER_USERS);
                    
                    for(AccountTeamMember accountTeamId : accTM){
                        userIds.add(accountTeamId.UserId);
                    }   
                }
                
                if(searchKey != null && searchKey.trim().length() > 0) {
                    userResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_COUNT+' and '+searchField+' LIKE :searchKey');
                    if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                        //userResultObj.userList = Database.query('SELECT LastName,FirstName,EmployeeNumber,Email,UserRole.Name,Manager.Name,VPCR__c FROM User WHERE IsActive=:userStatus AND Id NOT In :userIds and ('+searchField+' =:searchKey) ORDER BY LastName LIMIT :pageSize OFFSET :offset');
                        userResultObj.userList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH+searchField+uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH2+uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH3);
                        //system.debug('userResultObj.userList @@@1'+userResultObj.userList );
                    } else {
                        System.debug(uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH+searchField+uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH1+uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH3);
                        //userResultObj.userList = Database.query('SELECT LastName,FirstName,EmployeeNumber,Email,UserRole.Name,Manager.Name,VPCR__c FROM User WHERE IsActive=:userStatus AND Id NOT In :userIds and ('+searchField+' LIKE :searchKey) ORDER BY LastName LIMIT :pageSize OFFSET :offset'); 
                        userResultObj.userList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH+searchField+uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH1+uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_SEARCH3); 
                        //system.debug('userResultObj.userList @@@2'+userResultObj.userList );
                        System.debug('userResultObj.userList'+userResultObj.userList+'userIds'+userIds);
                    }
                    
                } else {
                    //system.debug('userResultObj.userList @@@3'+userResultObj.userList );
                    userResultObj.total = Database.countQuery(uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER_COUNT);
                    userResultObj.userList = Database.query(uhgQueryConstants.QUERY_STRING_ACCOUNT_TEAM_USER);
                }
                
                userResultObj.page = (Integer)pageNumber;
                userResultObj.pageSize = pageSize;
                
            } else {
                throw new NoAccessException();
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
        
        System.debug('Output Parameters -> UserList-'+userResultObj.userList+', Page-'+userResultObj.page+
                     ', PageSize-'+userResultObj.pageSize+'and TotalNoOfPages-'+userResultObj.total);
        
        System.debug('getUserRecords(String searchKeyVal, Decimal pageNumber, String searchField, String operator) - END');
        
        return userResultObj;
    }
    
    
    /*
* The below method creates the Record of AccountTeamMember/ OpportunityTeamMember Object based on the Object Type(Account/ Opprtunity).
*/
    @AuraEnabled
    public static accountTeamMemberResult createAccountTeamMember(Id accountId,Id userID){
        AccountTeamMemberResult accountTeamMembersResult = null;
        AccountTeamMember acctTM = null;
        OpportunityTeamMember oppTeam = null;
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        List<Opportunity> accountOpportunity = null;
        boolean isOpty = false;
        try{
            if(schema.sobjecttype.Opportunity.isAccessible() && schema.sobjecttype.AccountTeamMember.isAccessible() && schema.sobjecttype.AccountTeamMember.isCreateable() && schema.sobjecttype.OpportunityTeamMember.isCreateable()) {
                
                if(accountId != null && userID != null){
                    
                    accountTeamMembersResult = new AccountTeamMemberResult();
                    String recordIdobjectType = accountId.getSObjectType().getDescribe().getName();
                    isOpty = recordIdobjectType.equalsIgnoreCase('Opportunity');
                    
                    User cmpnyCommunitiesUsrObj = [Select id,Profile.UserLicense.Name,Profile.Name from User where Id=: userID];
                    String userLicenseVal = '';
                    if(cmpnyCommunitiesUsrObj != null) {
                        userLicenseVal = cmpnyCommunitiesUsrObj.Profile.UserLicense.Name;
                    }
                    
                    if(isOpty){
                        oppTeam = new OpportunityTeamMember();
                        oppTeam.OpportunityId = accountId;
                        oppTeam.UserId = userID;
                        oppTeam.TeamMemberRole = uhgAccountConstants.OPPORTUNITY_TEAM_ROLE;
                        oppTeam.OpportunityAccessLevel = uhgAccountConstants.OPPORTUNITY_TEAM_ACCESS_LEVEL;
                        Database.SaveResult dbInsertResultList = Database.insert(oppTeam,false);
                        if(!dbInsertResultList.isSuccess()){
                            // Operation failed, so get all errors                
                            for(Database.Error err : dbInsertResultList.getErrors()) {
                                System.debug('The following error has occurred.');                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('Fields that affected this error: ' + err.getFields());
                            }
                            throw new DmlException();
                        }
                        
                    }else{
                        
                        acctTM = new AccountTeamMember();
                        acctTM.AccountId = accountId;
                        acctTM.UserId = userID;
                        acctTM.TeamMemberRole = uhgAccountConstants.ACCOUNT_TEAM_ROLE;
                        Boolean CsiPrivateAcc = [Select CSI_Private_Account__c  from Account where Id=: accountId].CSI_Private_Account__c;
                        if(userLicenseVal != null && userLicenseVal.equalsIgnoreCase(uhgAccountConstants.USER_LICENSE_COMPANY_COMMUNITIES)) {
                            
                            //acctTM.AccountAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL_READONLY;
                            //acctTM.ContactAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL;
                            //acctTM.OpportunityAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL_PRIVATE;
                            if(CsiPrivateAcc) {
                                acctTM.ContactAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL_READONLY;
                                acctTM.CaseAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL_READONLY;
                            }
                            //acctTM.CaseAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL;
                            
                        } else {
                            
                            String[] IPMProfileNames = System.Label.IPM_Profile_Names_Acc_Team_Access.split(';;');
                            Set<String> IPMProfileNamesSet = new Set<String>(IPMProfileNames);
                            String loggedInUsrProfileName = cmpnyCommunitiesUsrObj.Profile.Name;
                            if(IPMProfileNamesSet.contains(loggedInUsrProfileName) && CsiPrivateAcc) {
                                
                                acctTM.ContactAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL_READONLY;
                                acctTM.OpportunityAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL_READONLY; 
                                acctTM.CaseAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL_READONLY; 
                                
                            } else {
                                acctTM.AccountAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL;
                                acctTM.ContactAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL;
                                acctTM.OpportunityAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL;
                                acctTM.CaseAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL_READONLY;
                            }
                        }
                        
                        Database.SaveResult dbInsertResultList = Database.insert(acctTM,false);
                        if(!dbInsertResultList.isSuccess()){
                            // Operation failed, so get all errors             
                            for(Database.Error err : dbInsertResultList.getErrors()) {
                                System.debug('The following error has occurred.');                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('Fields that affected this error: ' + err.getFields());
                            }
                            throw new DmlException();
                        }
                        
                        accountOpportunity = new List<Opportunity>();
                        accountOpportunity = [select id from Opportunity where AccountId=:accountId];
                        List<OpportunityTeamMember> opportunityTeamList = new List<OpportunityTeamMember>();
                        for(Opportunity opportunityData : accountOpportunity){
                            OpportunityTeamMember oppTM = new OpportunityTeamMember(); 
                            oppTM.OpportunityId = opportunityData.Id;
                            oppTM.UserId = userID;
                            oppTM.TeamMemberRole = uhgAccountConstants.ACCOUNT_TEAM_ROLE;
                            oppTM.OpportunityAccessLevel = uhgAccountConstants.ACCOUNT_TEAM_ACCESS_LEVEL;
                            opportunityTeamList.add(oppTM);
                        }
                        Database.SaveResult[] dbInsertOpportunityResultList = Database.insert(opportunityTeamList, false);
                        if(dbInsertOpportunityResultList != null && dbInsertOpportunityResultList.size() > 0) {
                            // Iterate through each returned result
                            for (Database.SaveResult opportunityInsertResult : dbInsertOpportunityResultList) {
                                if(!opportunityInsertResult.isSuccess()) {               
                                    for(Database.Error err : opportunityInsertResult.getErrors()) {
                                        System.debug('The following error has occurred.');                    
                                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                        System.debug('Fields that affected this error: ' + err.getFields());
                                    }
                                    
                                }
                            }
                        }
                    }
                    
                    accountTeamMembersResult = getAccountTeamMemberRecords(accountId,1,uhgAccountConstants.LAST_NAME_ITAG,uhgAccountConstants.ACCOUNT_TEAM_SORT_DESC);
                }else{
                    throw new NullPointerException();
                }
                
            }else{
                throw new NoAccessException();
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
        }catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }
        
        return accountTeamMembersResult;
    } 
    
    
    /*
* The below method deleted the Record of AccountTeamMember/ OpportunityTeamMember Object based on the Object Type(Account/ Opprtunity).
*/
    
    @AuraEnabled
    public static AccountTeamMemberResult removeAccountTeamMember(Id accountId,Decimal pageNumber,Id userID){
        AccountTeamMemberResult accountTeamMembersResult = null;
        System.debug('deleteCMAccountTeamHistoryRecord(Id cmAccountTeamHistoryRecordId) - START');
        UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        List<OpportunityTeamMember> accountOpportunityTeamMbr = null;
        boolean isOpty = false;
        boolean isAccountTeamDeleted = false;
        set<Id> accErrId = new set<Id>();
        try {
            if(schema.sobjecttype.AccountTeamMember.isaccessible() && schema.sobjecttype.AccountTeamMember.isDeletable() && schema.sobjecttype.OpportunityTeamMember.isaccessible() && schema.sobjecttype.OpportunityTeamMember.isDeletable()) {
                accountTeamMembersResult = new AccountTeamMemberResult();
                if(userID != null) {
                    
                    String recordIdobjectType = accountId.getSObjectType().getDescribe().getName();
                    System.debug('recordIdobjectType'+recordIdobjectType);
                    isOpty = recordIdobjectType.equalsIgnoreCase('Opportunity');
                    System.debug('isOpty'+isOpty);
                    if(isOpty){
                        Id opptyId = accountId;
                        System.debug('uhgQueryConstants.QUERY_STRING_USERS_OPTY-->>'+uhgQueryConstants.QUERY_STRING_USERS_OPTY);
                        OpportunityTeamMember[] optyTeamMemberArray = Database.query(uhgQueryConstants.QUERY_STRING_USERS_OPTY);
                        Database.DeleteResult[] dbDelResultList = Database.delete(optyTeamMemberArray, false);
                        if(dbDelResultList != null && dbDelResultList.size() > 0) {
                            // Iterate through each returned result
                            for (Database.DeleteResult optyTeamDeleteResult : dbDelResultList) {
                                if(!optyTeamDeleteResult.isSuccess()) {               
                                    for(Database.Error err : optyTeamDeleteResult.getErrors()) {
                                        System.debug('The following error has occurred.');                    
                                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                        System.debug('Fields that affected this error: ' + err.getFields());
                                    }
                                    throw new DmlException();
                                }
                            }
                        }
                    }else{
                        AccountTeamMember[] accountTeamMemberArray = [SELECT id FROM AccountTeamMember WHERE Userid=:userID and AccountId=:accountId];
                        Database.DeleteResult[] dbDelResultList = Database.delete(accountTeamMemberArray, false);
                        if(dbDelResultList != null && dbDelResultList.size() > 0) {
                            // Iterate through each returned result
                            for (Database.DeleteResult accountTeamDeleteResult : dbDelResultList) {
                                if(!accountTeamDeleteResult.isSuccess()) { 
                                    accErrId.add(accountTeamDeleteResult.getId());
                                    for(Database.Error err : accountTeamDeleteResult.getErrors()) {
                                        System.debug('The following error has occurred.');                    
                                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                        System.debug('Fields that affected this error: ' + err.getFields());
                                    }
                                    throw new DmlException();
                                }else{
                                    if(accErrId.size() ==0){
                                        isAccountTeamDeleted = true;
                                    }
                                }
                            }
                        }
                        if(isAccountTeamDeleted){
                            accountOpportunityTeamMbr = new List<OpportunityTeamMember>();
                            accountOpportunityTeamMbr = [select id from OpportunityTeamMember where userId=:userID And Opportunity.AccountId=:accountId];
                            Database.DeleteResult[] oppdbDelResultList = Database.delete(accountOpportunityTeamMbr, false);
                            if(oppdbDelResultList != null && oppdbDelResultList.size() > 0) {
                                // Iterate through each returned result
                                for (Database.DeleteResult accountTeamDeleteResult : oppdbDelResultList) {
                                    if(!accountTeamDeleteResult.isSuccess()) {               
                                        for(Database.Error err : accountTeamDeleteResult.getErrors()) {
                                            System.debug('The following error has occurred.');                    
                                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                            System.debug('Fields that affected this error: ' + err.getFields());
                                        }
                                        throw new DmlException();
                                    }
                                }
                            }
                        }
                        
                    }
                    
                }
                
                accountTeamMembersResult = getAccountTeamMemberRecords(accountId,pageNumber,uhgAccountConstants.LAST_NAME_ITAG,uhgAccountConstants.ACCOUNT_TEAM_SORT_DESC);
                
            } else {
                throw new NoAccessException();      
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
        }catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }
        System.debug('deleteCMAccountTeamHistoryRecord(Id cmAccountTeamHistoryRecordId) - END');
        return accountTeamMembersResult;        
    }
    
    /******************************************************************
* 
Wrapper class for Returing diffrent Return Types for lighting component

*******************************************************************
*/ 
    
    public class AccountTeamMemberResult {
        
        @AuraEnabled
        public List<User> accountTeamMembers{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
    }
    
    public class UserResult {
        
        @AuraEnabled
        public List<User> userList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
    }
    
    public class accountTeamInitialValues {
        
        @AuraEnabled
        public Boolean isLoggedInUserRole { get;set; }
        
        @AuraEnabled
        public String recordIdObjectType { get;set;}
        
        
    }
}