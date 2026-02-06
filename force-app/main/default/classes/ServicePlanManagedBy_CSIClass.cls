public class ServicePlanManagedBy_CSIClass {
    @AuraEnabled
    public static wrapLists getOpenClosedCases(Id accountId){
        list<Case> openList = new list<Case>();
        list<Case> closedList = new list<Case>();
        Boolean profileAccess;
        /**********         RecordType is the mandatory field while creating new Case       *********/
        list<sObject> recordTypeData =  [SELECT Id FROM RecordType where DeveloperName= 'Strategy'];
        
        /**********         Query to get Open Closed Cases with filter criteria        *********/
        for(Case caseObj : [SELECT Id,Status,OwnerId,Owner.Name,Subject,Extended_Description__c,Sub_Category__c,CreatedDate,ClosedDate,Case_Screenshots__c FROM Case WHERE AccountId = : accountId and RecordType.Name IN ('Strategy','General Action') and Category__c='Service Plan' and Status IN ('Open', 'Closed') ORDER BY Owner.Name ASC]){
            if(caseObj.Status == 'Open'){
            	openList.add(caseObj); 
                //System.debug('open Case List'+openList);
            } 
            else if(caseObj.Status == 'Closed'){
             	closedList.add(caseObj);	   
            }
        }
         /**********        Get userId profile base on the user logged in to view create access         *********/
        Id userId = UserInfo.getUserId();
        User cmpnyCommunitiesUsrObj = [Select id,Profile.UserLicense.Name from User where Id=: userId];
        String userLicenseVal = '';
        if(cmpnyCommunitiesUsrObj != null) {
            userLicenseVal = cmpnyCommunitiesUsrObj.Profile.UserLicense.Name;
        }
		System.debug('userLicenseVal'+userLicenseVal);
        UHGAccountConstants uhgAccConstants = new UHGAccountConstants();
        if(userLicenseVal != null && userLicenseVal.equalsIgnoreCase(uhgAccConstants.USER_LICENSE_COMPANY_COMMUNITIES)) {
            System.debug('equals to USER_LICENSE_COMPANY_COMMUNITIES '+userLicenseVal);
            profileAccess = true;
        }
        else{
            profileAccess = false; 
        }
        
        wrapLists wrap = new wrapLists();
        wrap.recordTypeId = recordTypeData[0].Id;
        wrap.profileAccess =profileAccess;
        wrap.openCaseList = openList;
        wrap.closedCaseList = closedList;
        System.debug('Cases -->'+wrap.openCaseList);
        System.debug ('Closed Cases -->'+wrap.closedCaseList);
        System.debug('profileAccess'+wrap.profileAccess);
        return wrap;
        }
	    
    public class wrapLists {
        @AuraEnabled
        public List<Case> openCaseList {get; set;}
        
        @AuraEnabled
        public List<Case> closedCaseList {get; set;}
        
        @AuraEnabled
        public String recordTypeId {get; set;}
        
        @AuraEnabled
        public Boolean profileAccess {get; set;}
        
        public wrapLists(){
            openCaseList = new List<Case>();
            closedCaseList = new List<Case>();
            recordTypeId = '';
            profileAccess = false;
        }
    }
}