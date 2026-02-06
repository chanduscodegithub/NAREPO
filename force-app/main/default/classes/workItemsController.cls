/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-02-2024
 * @last modified by  : Spoorthy
**/
public with sharing class workItemsController {
    @AuraEnabled
    public static List<opportunity> getOpty() {
        List<Opportunity> opps =
            [Select Id,Name,AccountId,
             Account.Name,Account.Owner.UserRole.Name,
             Comments_Last_Modified__c,
             CM_VPCR_RVP__r.Name,Comments__c,
             OwnerId,Owner.Name from opportunity
             where status__c = 'open' and CM_VPCR_RVP__r.Name !=null
             limit 1000];
        //Add isAccessible() check
        return opps;
    }
    
    @AuraEnabled
    public static boolean updateOppRecods(list<opportunity> opplist) {
        system.debug('opplist@@@'+opplist);
        list<opportunity> updatedOpplist = new list<opportunity>();
        if(opplist.size()>0 && opplist != null){
            for(Opportunity op: opplist){
                op.Comments_Last_Modified__c=System.now();
                String comments = op.Comments__c;
                comments = comments.trim();
                if(comments != null && comments.length() > 0 && comments.length() > 4095) {
                    op.Comments_Reporting__c = comments.substring(0, 4095);
                } else {
                    op.Comments_Reporting__c = comments;
                }
                updatedOpplist.add(op);
            }
            update updatedOpplist;
            return true;
        }else{
            return false;
        }
    }
   
    @AuraEnabled
    public static String getUserRole(Id userId) {
        String loggedInUserRole = '';
        
        try {
            User user = [Select UserRole.Name,Id,Name from User where Id=:userId]; 
            System.debug('user.UserRole.Name >> '+user.UserRole.Name);
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                loggedInUserRole = user.UserRole.Name;
            }
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        return loggedInUserRole;
    }  
    
    @AuraEnabled
    public static WorkItemsClass_Wrapper getAccountsandOpportunities(Boolean OnLoad , Boolean OnFilter, String cmvcpfilter , String ownerfilter, String columnName, String sortType ) {
        
        System.debug('getAccountsandOpportunities Start-->');
        WorkItemsClass_Wrapper workitem = new WorkItemsClass_Wrapper();
        try {
            Id userId = UserInfo.getUserId();
            String loggedInUserRole = getUserRole(userId);
            if(loggedInUserRole != null && loggedInUserRole != ''){
                workitem.loggedInUserRoleName = loggedInUserRole;
                if(loggedInUserRole.equals('CRM Administrator') || loggedInUserRole.equals('CM CSAD') ){
                    workitem = LoggedInUserData(null,'Admin',OnLoad, OnFilter,cmvcpfilter,ownerfilter, workitem, columnName, sortType);
                }
                else if(loggedInUserRole.contains('CM VPCR/RVP')){
                    workitem = LoggedInUserData(userId,'CMVPCR',OnLoad, OnFilter,cmvcpfilter, ownerfilter, workitem, columnName, sortType);
                }
                else if(loggedInUserRole.contains('CM SCE') || loggedInUserRole.contains('Surest CM SCE') || loggedInUserRole.contains('Surest CM SVP') || loggedInUserRole.contains('Specialty Benefits SCE')){
                    workitem = LoggedInUserData(userId,'CMSCE',OnLoad,OnFilter,cmvcpfilter,ownerfilter, workitem, columnName, sortType);
                }
                
                /* Get Start date and end date for work items tab to show/hide the tab - START */
                Boolean isCustomTabVisible = false;
                Work_Items_Setting__mdt retriveDates = [SELECT Start_Date__c, Soft_Due_Date__c, End_Date__c FROM Work_Items_Setting__mdt WHERE DeveloperName = 'Client_NPS_Due_Date'];
                if(retriveDates.Start_Date__c != null && System.now() >= retriveDates.Start_Date__c && retriveDates.End_Date__c != null && System.now() <= retriveDates.End_Date__c) {
                    isCustomTabVisible = true;
                }
                
                if(retriveDates.End_Date__c != null) {
                    workitem.customSettingEndDate = retriveDates.End_Date__c.format('MM/dd/YYYY');
                }
                
                if(retriveDates.Soft_Due_Date__c != null) {
                    workitem.customSettingSoftDueDate = retriveDates.Soft_Due_Date__c.format('MM/dd/YYYY');
                }
                
                workitem.isCustomTabVisible = isCustomTabVisible;
                /* Get Start date and end date for work items tab to show/hide the tab - END */
                
                workitem.getContacts = getContactRecords();
            }
            
        } catch(Exception e){
            System.debug('Error occurred in getAccountsandOpportunities method - '+e);
        }
        
        System.debug('getAccountsandOpportunities End-->');
        System.debug('workitem-->'+workitem);
        return workitem;        
    }
       
    @AuraEnabled
    public static WorkItemsClass_Wrapper LoggedInUserData(Id userId, String loggedInAs, Boolean onLoad, Boolean onFilter, String cmvcpfilter, String ownerfilter, WorkItemsClass_Wrapper workitem, String  columnName, String sortType) {
        
        System.debug('WorkItemsClass_Wrapper >> START');
        if(loggedInAs!=null)
            loggedInAs = String.escapeSingleQuotes(loggedInAs);
        if(cmvcpfilter!=null)
            cmvcpfilter = String.escapeSingleQuotes(cmvcpfilter);
        if(ownerfilter!=null)
            ownerfilter = String.escapeSingleQuotes(ownerfilter);
        if(columnName!=null)
            columnName = String.escapeSingleQuotes(columnName);
        if(sortType!=null)
            sortType = String.escapeSingleQuotes(sortType);
        
        UHGMASOQLConstants uhgMASOQLConstantsObj = new UHGMASOQLConstants();
            
        loggedInAs = (loggedInAs != null) ? loggedInAs : '';
        onLoad = (onLoad != null) ? onLoad : false;
        onFilter = (onFilter != null) ? onFilter : false;
		cmvcpfilter = (cmvcpfilter != null) ? cmvcpfilter : '';
        ownerfilter = (ownerfilter != null) ? ownerfilter : '';
        columnName = (columnName != null)? columnName : 'Name';
        sortType = (sortType != null)? sortType : 'ASC';
        sortType = sortType + ' nulls last';
        
        List<Opportunity> oppList = new List<Opportunity>();
        String queryVal = '';
        if(onLoad) {
            if(loggedInAs == 'Admin') {
                queryVal = ' ORDER BY '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType);
                oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal);
                System.debug('oppList'+oppList);
            }else if(loggedInAs == 'CMVPCR'){
                queryVal = ' AND CM_VPCR_RVP__r.Id=:userId ORDER BY '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType);
                oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
            }else if (loggedInAs == 'CMSCE'){
                queryVal = ' AND OwnerId=:userId ORDER BY '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType);
                oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal);
            }  
        } else if (onFilter) {
            if(loggedInAs == 'Admin') {
                if(cmvcpfilter != '' && ownerfilter != '') {
                    if(cmvcpfilter == 'All' && ownerfilter == 'All') {
                        queryVal = ' ORDER BY '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType);
                        oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                    } else if(cmvcpfilter == 'All') {
                        queryVal = ' AND Owner.Name=:ownerfilter ORDER BY '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType);
                        oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                    } else if(ownerfilter == 'All') {
                        queryVal = ' AND CM_VPCR_RVP__r.Name=:cmvcpfilter ORDER BY '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType);
                        oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                    } else {
                        queryVal = ' AND Owner.Name=:ownerfilter AND Owner.Name=:ownerfilter ORDER BY '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType);
                        oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                    }
                } else {
                    queryVal = ' ORDER BY columnName '+String.escapeSingleQuotes(sortType);
                    oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal);
                }
            } else if(loggedInAs == 'CMVPCR') {
                if(cmvcpfilter == '' && ownerfilter == 'All') { 
                     queryVal = ' AND CM_VPCR_RVP__r.Id=:userId ORDER BY '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType);
                	oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                } else if(ownerfilter != '') { 
                    queryVal = ' AND CM_VPCR_RVP__r.Id=:userId AND Owner.Name=:ownerfilter ORDER BY '+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType);
                    oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                }
            }           
        }
        
        if(oppList !=null && oppList.size() > 0) {
            workitem.cmSceOppList = oppList;
        }
        
        if(loggedInAs == 'Admin' || loggedInAs == 'CMVPCR') {
            
            set<String> oppOwnweSet = new set<String>();
            set<String> oppCMVPCRRVPSet = new set<String>();
            
            Map<String,set<String>> vpcrSCEMap = new Map<String,set<String>>();
            for(Opportunity obj : oppList) {
                if(vpcrSCEMap != null && vpcrSCEMap.size() > 0 && vpcrSCEMap.containsKey(obj.CM_VPCR_RVP__r.Name)) {
                    set<String> sceOwnersList = vpcrSCEMap.get(obj.CM_VPCR_RVP__r.Name);
                    sceOwnersList.add(obj.owner.Name);
                    vpcrSCEMap.put(obj.CM_VPCR_RVP__r.Name, sceOwnersList);
                } else {
                    set<String> sceOwnersList = new set<String>();
                    sceOwnersList.add(obj.owner.Name);
                    vpcrSCEMap.put(obj.CM_VPCR_RVP__r.Name, sceOwnersList);
                }
                
                oppOwnweSet.add(obj.owner.Name);
                oppCMVPCRRVPSet.add(obj.CM_VPCR_RVP__r.Name); 
            }
            system.debug('vpcrSCEMap@@@'+vpcrSCEMap);
            system.debug('oppOwnweSet@@@ '+oppOwnweSet+' @@@oppCMVPCRRVPSet@@@ '+oppCMVPCRRVPSet);
            
            if(vpcrSCEMap !=null && vpcrSCEMap.size() > 0) {
                workitem.vpcrSCEMapWrap =vpcrSCEMap ;
            }
            if(oppOwnweSet != null && oppOwnweSet.size() > 0){
                workitem.oppOwnweSetWrap = oppOwnweSet;
            }
            if(oppCMVPCRRVPSet != null && oppCMVPCRRVPSet.size() > 0){
                workitem.oppCMVPCRRVPSetWrap = oppCMVPCRRVPSet;
            }
        }
        System.debug('workitem-'+workitem.loggedInUserRoleName);
        System.debug('WorkItemsClass_Wrapper >> END');
        
        return workitem;
        
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactRecords() {
        List<Contact> contactRecords = new List<Contact>();
        Id userId = UserInfo.getUserId();
        User userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Name FROM User where Id=:userId ];
        if(userDetails.UserRole.Name == 'CM VPCR/RVP') {
            contactRecords = [SELECT Id, Account.Name,Correspondence_Type__c,Survey_Type__c,FirstName, LastName, Email FROM Contact WHERE Account.CMVPCRRVP__c =: userId AND Correspondence_Type__c INCLUDES ('Customer Survey - Secondary' , 'Customer Survey - Primary') AND Status__c = 'Active' Order by Account.Name];
        } else {
            contactRecords = [SELECT Id, Account.Name,Correspondence_Type__c,Survey_Type__c,FirstName, LastName, Email FROM Contact WHERE OwnerId =:userId AND Correspondence_Type__c INCLUDES ('Customer Survey - Secondary' , 'Customer Survey - Primary') AND Status__c = 'Active' Order by Account.Name];
        }
        System.debug(' contactRecords '+contactRecords);
        return contactRecords;
    }
    
    @AuraEnabled
    public static contactsAndRecordTypeId fetchDefaultContacts() {
        Id userId = UserInfo.getUserId();
        contactsAndRecordTypeId conAndRecTypeId = new contactsAndRecordTypeId();
        User userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Name FROM User where Id=:userId ];
        
        List<Contact> contactRecords = new List<Contact>();
        List<Contact> workItemsContacts = new List<Contact>();
        List<Contact> nonWorkItemsContacts = new List<Contact>();
        List<Contact> defaultContacts = new List<Contact>();
        
        if(userDetails.UserRole.Name == 'CM VPCR/RVP') {
            contactRecords = [SELECT Id, FirstName, LastName, Email, Account.Name, Correspondence_Type__c, Survey_Type__c  FROM Contact WHERE Account.CMVPCRRVP__c =: userId AND Status__c = 'Active' Order by Account.Name];
        } else {
            contactRecords = [SELECT Id, FirstName, LastName, Email, Account.Name, Correspondence_Type__c, Survey_Type__c  FROM Contact WHERE OwnerId =:userId AND Status__c = 'Active' Order by Account.Name];
        }
        
        /* Sort records based on Non-Work items Records to come at top of the list and then Work Item Records adds to the List - START */
        for(Integer i = 0 ; i < contactRecords.size() ; i++) {
            if(contactRecords[i].Correspondence_Type__c != null && (contactRecords[i].Correspondence_Type__c.contains('Customer Survey - Primary') || contactRecords[i].Correspondence_Type__c.contains('Customer Survey - Secondary'))) {
                //Add work items records to workItemsContacts List
                workItemsContacts.add(contactRecords[i]);
            } else {
                nonWorkItemsContacts.add(contactRecords[i]);
            }
        }
        
        if(nonWorkItemsContacts.size() > 0) {
            defaultContacts.addAll(nonWorkItemsContacts);
        }
        
        if(workItemsContacts.size() > 0) {
            defaultContacts.addAll(workItemsContacts);
        }
        conAndRecTypeId.returnDefaultContacts = defaultContacts;
        
        /* Sort records based on Non-Work items Records to come at top of the list and then Work Item Records adds to the List - END */
        
        conAndRecTypeId.recordTypeId = [SELECT id from RecordType where Name ='CM Contact' WITH USER_MODE].Id;
        return conAndRecTypeId;
    }
    
    @AuraEnabled
    public static List<Contact> searchedContacts(String searchValue, String filterSelected, String operator) {
        if(searchValue!=null)
            searchValue = String.escapeSingleQuotes(searchValue);
        if(filterSelected!=null)
            filterSelected = String.escapeSingleQuotes(filterSelected);
        if(operator!=null)
            operator = String.escapeSingleQuotes(operator);
        
        Id userId = UserInfo.getUserId();
        Id userRoleId = UserInfo.getUserRoleId();
        System.debug('searchValue '+searchValue+' filterSelected '+filterSelected+' operator '+operator);
        String filterCriteria = filterSelected;
        List<Contact> returnContacts = new List<Contact>();
        List<Contact> contactRecords = new List<Contact>();
        List<Contact> workItemsContacts = new List<Contact>();
        List<Contact> nonWorkItemsContacts = new List<Contact>();
        String searchKeyString = '';
        String whereString = ' WHERE ';
        String andString = ' AND ';
        String activeStatus = 'Status__c = \'Active\'';
        String ownerId = 'OwnerId =:userId';
        String cmVpcrRvp = 'Account.CMVPCRRVP__c =:userId';
        String doNotSendForCorrespondence = 'DoNotSendCorrespondence__c = false';
        String operatorChoosen = '';
                
        searchValue = searchValue.trim();
        if(searchValue != null && searchValue.length() > 0 && filterSelected != null) {
            if(filterSelected == 'First Name') {
                if(operator == 'Begins With') {
                    operatorChoosen = String.escapeSingleQuotes(searchValue) + '%';
                    searchKeyString = 'FirstName LIKE: operatorChoosen';
                } else if(operator == 'Equals To') {
                    searchKeyString = 'FirstName LIKE: searchValue';
                } else if(operator == 'Contains') {
                    operatorChoosen =  '%' + String.escapeSingleQuotes(searchValue) + '%';
                    searchKeyString = 'FirstName LIKE \'%' + String.escapeSingleQuotes(searchValue) + '%\'';
                }
                System.debug('searchKeyString '+searchKeyString);
            } else if(filterSelected == 'Last Name') {
                if(operator == 'Begins With') {
                    operatorChoosen = String.escapeSingleQuotes(searchValue) + '%';
                    searchKeyString = 'LastName LIKE: operatorChoosen';
                } else if(operator == 'Equals To') {
                    searchKeyString = 'LastName LIKE: searchValue';
                } else if(operator == 'Contains') {
                    operatorChoosen =  '%' + String.escapeSingleQuotes(searchValue) + '%';
                    searchKeyString = 'LastName LIKE \'%' + String.escapeSingleQuotes(searchValue) + '%\'';
                }
                System.debug('searchKeyString '+searchKeyString);
            } else if(filterSelected == 'Company') {
                if(operator == 'Begins With') {
                    operatorChoosen = String.escapeSingleQuotes(searchValue) + '%';
                    searchKeyString = 'Account.Name LIKE: operatorChoosen';
                } else if(operator == 'Equals To') {
                    operatorChoosen = String.escapeSingleQuotes(searchValue) + '%';
                    searchKeyString = 'Account.Name LIKE: searchValue';
                } else if(operator == 'Contains') {
                    operatorChoosen =  '%' + String.escapeSingleQuotes(searchValue) + '%';
                    searchKeyString = 'Account.Name LIKE \'%' + String.escapeSingleQuotes(searchValue) + '%\'';
                }
                System.debug('searchKeyString '+searchKeyString);
            }
        }
        
        User userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Name FROM User where Id=:userId ];
        
        if(userDetails.UserRole.Name == 'CM VPCR/RVP') {
            String contactQuery = 'SELECT Id, Account.Name, FirstName, LastName, Email, Correspondence_Type__c,Survey_Type__c FROM Contact ';
            contactRecords = Database.query(contactQuery + whereString + searchKeyString + andString + activeStatus + andString + cmVpcrRvp);
        } else {
            String contactQuery = 'SELECT Id, Account.Name, FirstName, LastName, Email, Correspondence_Type__c,Survey_Type__c FROM Contact ';
            contactRecords = Database.query(contactQuery + whereString + searchKeyString + andString + activeStatus + andString + ownerId);
        }
        
        /* Sort records based on Non-Work items Records to come at top of the list and then Work Item Records adds to the List - START */
        for(Integer i = 0 ; i < contactRecords.size() ; i++) {
            if(contactRecords[i].Correspondence_Type__c != null && (contactRecords[i].Correspondence_Type__c.contains('Customer Survey - Primary') || contactRecords[i].Correspondence_Type__c.contains('Customer Survey - Secondary'))) {
                //Add work items records to workItemsContacts List
                workItemsContacts.add(contactRecords[i]);
            } else {
                nonWorkItemsContacts.add(contactRecords[i]);
            }
        }
        
        if(nonWorkItemsContacts.size() > 0) {
            returnContacts.addAll(nonWorkItemsContacts);
        }
        
        if(workItemsContacts.size() > 0) {
            returnContacts.addAll(workItemsContacts);
        }
        
        /* Sort records based on Non-Work items Records to come at top of the list and then Work Item Records adds to the List - END */
        
        return returnContacts;
    }
    
    @AuraEnabled
    public static void saveNpsContactData(List<Contact> contactData){
        List<Contact> listTobeUpdated = new List<Contact>();
        List<Contact> updatedcontactRecords = new List<Contact>();
        System.debug('Record receiveds to update \n  '+contactData);
        /* Updating Contact Data */
        if(contactData != null && contactData.size() > 0) {
            
            for(Contact conDataloop : contactData){
                listTobeUpdated.add((Contact)conDataloop);
            }
            System.debug('The following data has to be updated -> '+listTobeUpdated);
            
            Database.SaveResult[] dbUpdateResultList = Database.update(listTobeUpdated, false);
            
            if(dbUpdateResultList != null && dbUpdateResultList.size() > 0) {
                for (Database.SaveResult UpdtResult : dbUpdateResultList) {
                    System.debug('UpdtResult---'+UpdtResult);
                    if(!UpdtResult.isSuccess()) {
                        for(Database.Error err : UpdtResult.getErrors()) {
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                            System.debug('Fields that affected this error: ' + err.getFields());
                        }
                    }
                }
            } else {
                throw new NoAccessException();
            }
            
        }
        //updatedcontactRecords = getContactRecords();
        //return updatedcontactRecords;
    }
    
    public class WorkItemsClass_Wrapper {
        
        @AuraEnabled
        public Set<User> sceUserList{ get;set; }
        
        @AuraEnabled
        public List<Opportunity> cmSceOppList { get;set; }
        
        @AuraEnabled
        public String loggedInUserRoleName {get;set;}
        
        @AuraEnabled
        public set<String> oppOwnweSetWrap{ get;set; }
		
		@AuraEnabled
        public set<String> oppCMVPCRRVPSetWrap { get;set; }
        
        @AuraEnabled
        public Map<String,set<String>> vpcrSCEMapWrap { get;set; }
        
        @AuraEnabled
        public List<Contact> getContacts { get;set; }
        
        @AuraEnabled
        public boolean isCustomTabVisible {get;set;}
        
        @AuraEnabled
        public String customSettingEndDate {get; set;}
        
        @AuraEnabled
        public String customSettingSoftDueDate {get; set;}
        
    }
    
    public class contactsAndRecordTypeId {
        
        @AuraEnabled
        public List<Contact> returnDefaultContacts {get;set;}
        
        @AuraEnabled
        public Id recordTypeId {get;set;}
    }
}