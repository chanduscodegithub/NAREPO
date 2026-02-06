public with sharing class NPSAccountStragergyAndActionPlanApex { 
    
    @AuraEnabled
    public static wrapLists getOpenClosedCases(Id accountId,String columnName,String sortType){
        if(columnName!=null)
         columnName = String.escapeSingleQuotes(columnName);
        if(sortType!=null)
        sortType = String.escapeSingleQuotes(sortType);
        
        list<Action_Service_Plan__c> openList = new list<Action_Service_Plan__c>();
        list<Action_Service_Plan__c> closedList = new list<Action_Service_Plan__c>();
        List<Action_Service_Plan__c> openPartialList =  new List<Action_Service_Plan__c>();
        List<Action_Service_Plan__c> closePartialList =  new List<Action_Service_Plan__c>();
        Boolean profileAccess;
        String queryStatement = 'SELECT Id,Status__c,Company_Name__r.Owner.Name,Year__c,Category__c,Priority__c,Date_Completed__c,Name,Description_Comments__c,Resolution_Comments__c, CreatedDate,Target_Completion__c,(Select id,Status,Priority,Subject,Type,ActivityDate,Description from Tasks where status =\'Open\' OR status=\'Completed\' Order By Priority Desc) FROM Action_Service_Plan__c WHERE Company_Name__c = : accountId Order By Status__c '+String.escapeSingleQuotes(sortType)+' nulls last,Year__c DESC nulls last';
        Database.query(queryStatement);
        for(Action_Service_Plan__c caseObj : Database.query(queryStatement)){
                                                  openList.add(caseObj);  
                                                  if(openPartialList.size() < 5){
                                                      openPartialList.add(caseObj);
                                                  }                                                  
                                              }
        /**********        Get userId profile base on the user logged in to view create access         *********/
        
        Id userId = UserInfo.getUserId();
        User cmpnyCommunitiesUsrObj = [Select id, Profile.UserLicense.Name, profile.name from User where Id=: userId];
        String userLicenseVal = '';
        String loggedInUserProfile = '';
        String[] IPMProfileNames = System.Label.IPM_Profile_Names_Acc_Team_Access.split(';;');
        Set<String> IPMProfileNamesSet = new Set<String>(IPMProfileNames);
        
        if(cmpnyCommunitiesUsrObj != null) {
            userLicenseVal = cmpnyCommunitiesUsrObj.Profile.UserLicense.Name;
            loggedInUserProfile = cmpnyCommunitiesUsrObj.Profile.Name;
        }
        System.debug('userLicenseVal'+userLicenseVal);
        UHGAccountConstants uhgAccConstants = new UHGAccountConstants();
        if((userLicenseVal != null && userLicenseVal.equalsIgnoreCase(uhgAccConstants.USER_LICENSE_COMPANY_COMMUNITIES)) || (loggedInUserProfile == 'General Executives' || loggedInUserProfile == 'Benefit Strategist' || loggedInUserProfile == 'Senior Executives' || IPMProfileNamesSet.contains(loggedInUserProfile))) {
            profileAccess = false;
        }
        else{
            profileAccess = true; 
        }
        
        wrapLists wrap = new wrapLists(openList, closedList,openPartialList,closePartialList,userId);
        wrap.profileAccess = profileAccess;
        System.debug('Cases -->'+wrap.openCaseList);
        System.debug ('Closed Cases -->'+wrap.closedCaseList);
        System.debug('profileAccess'+wrap.profileAccess);
        return wrap;
        
    }
    
    public class wrapLists {
        @AuraEnabled
        public list<Action_Service_Plan__c> openCaseList;
        
        @AuraEnabled
        public list<Action_Service_Plan__c> closedCaseList;
        
        @AuraEnabled
        public list<Action_Service_Plan__c> openCasePartialList;
        
        @AuraEnabled
        public list<Action_Service_Plan__c> closeCasePartialList;
        
        @AuraEnabled
        public Boolean profileAccess {get; set;}
        
        @AuraEnabled
        public String loginUser {get; set;}
        
        public wrapLists(list<Action_Service_Plan__c> openCsList, list<Action_Service_Plan__c> closedCsList,list<Action_Service_Plan__c> openCasePartialList, list<Action_Service_Plan__c> closeCasePartialList,String loginUser){
            this.openCaseList = openCsList; 
            this.closedCaseList = closedCsList;
            this.openCasePartialList = openCasePartialList; 
            this.closeCasePartialList = closeCasePartialList;
            this.profileAccess =profileAccess;
            this.loginUser =loginUser;
        }
    }
}