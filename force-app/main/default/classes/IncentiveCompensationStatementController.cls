public class IncentiveCompensationStatementController 
{
    @AuraEnabled
    public static LoggedInUserInfoWrapper getLoggedInUserInfo() {
        system.debug('getLoggedInUserInfo()-- start');
        LoggedInUserInfoWrapper loggedInUsrInfoWrpr=new LoggedInUserInfoWrapper(); 
        Boolean isLggdInUsrHsAccessToICStatmnt = false;
        Boolean isLggdInUsrHsAccessToGrowthTab=false;
        Boolean isLggdInUsrHsAccessToRetentionTab=false;
        Boolean isLggdInUsrHsAccessToStatusSnapshotTab=false;
        Boolean isLoggedInUserVPCR=false;
        
        try {
            User userData = [Select Id,UserRole.Name,Profile.Name,Profile.UserLicense.Name,VPCR__c from User where Id=:UserInfo.getUserId()]; 
            String loggedInUserRole;
            if(userData!=null) {
                
                if(userData.UserRole != null && userData.UserRole.Name != null && userData.UserRole.Name.trim().length() > 0){
                    loggedInUserRole = userData.UserRole.Name;
                    String[] roleNames=getListFromValueSeparatedStr(System.Label.ICM_UserRoles_ToBe_Enabled,',');
                    isLggdInUsrHsAccessToICStatmnt=listContainsStrValue(roleNames,loggedInUserRole);
                    if(isLggdInUsrHsAccessToICStatmnt){
                        isLggdInUsrHsAccessToGrowthTab=true;
                        isLggdInUsrHsAccessToStatusSnapshotTab=true;
                        if(listContainsStrValue(getListFromValueSeparatedStr(System.Label.ICM_Retention_UserRoles_ToBe_Enabled,','),loggedInUserRole)){
                            isLggdInUsrHsAccessToRetentionTab=true;
                        }
                    }
                    
                }
              	isLoggedInUserVPCR=userData.VPCR__c;
            }
            
            
            loggedInUsrInfoWrpr.loggedInUserName=UserInfo.getName();
            loggedInUsrInfoWrpr.loggedInUserId=UserInfo.getUserId();
            loggedInUsrInfoWrpr.loggedInUserTimeZone=UserInfo.getTimeZone().getID();
            //loggedInUsrInfoWrpr.loggedInUserProfile=loggedInUserProfile;
            loggedInUsrInfoWrpr.loggedInUserRole=loggedInUserRole;
            loggedInUsrInfoWrpr.isLggdInUsrHsAccessToICStatmnt=isLggdInUsrHsAccessToICStatmnt;
            loggedInUsrInfoWrpr.isLggdInUsrHsAccessToGrowthTab=isLggdInUsrHsAccessToGrowthTab;
            loggedInUsrInfoWrpr.isLggdInUsrHsAccessToRetentionTab=isLggdInUsrHsAccessToRetentionTab;
            loggedInUsrInfoWrpr.isLggdInUsrHsAccessToStatusSnapshotTab=isLggdInUsrHsAccessToStatusSnapshotTab;
            
            loggedInUsrInfoWrpr.isLoggedInUserVPCR=isLoggedInUserVPCR;
             

			System.debug('loggedInUsrInfoWrpr==>'+loggedInUsrInfoWrpr);
            
        }catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }

       system.debug('getLoggedInUserInfo()-- end');
       return loggedInUsrInfoWrpr;
        
        
    }
    
    
    
    
    
    public static List <String> getListFromValueSeparatedStr(String valueSeparatedStr, string valueSeparator)
    {
        String[] returnList=new List<String>();
        if(valueSeparatedStr!=null && valueSeparatedStr!='')
        {
            if(valueSeparatedStr.contains(valueSeparator))
            {
                returnList= valueSeparatedStr.split(valueSeparator);
                
            }
            else
            {
                returnList.add(valueSeparatedStr);
            }
            
        }
        return returnList;
    }
    
    public static boolean listContainsStrValue(String[] lst,String strVal)
    {
        boolean listContainsStrValue=false;
        Set<String> strSet = new Set<String>(lst);
        if(strVal!=null && strVal.trim().length() > 0 && strSet!= null && strSet.contains(strVal)) {
            listContainsStrValue = true;
        } 
        return listContainsStrValue;
    }
    
    public class LoggedInUserInfoWrapper{
        @AuraEnabled
        public String loggedInUserName{ get; set; }
        @AuraEnabled
        public String loggedInUserId{ get; set; }
        @AuraEnabled
        public String loggedInUserTimeZone{ get; set; }
        @AuraEnabled
        public String loggedInUserProfile{ get; set; }
        @AuraEnabled
        public String loggedInUserRole{ get; set; }
        @AuraEnabled
        public boolean isLggdInUsrHsAccessToICStatmnt{ get; set; }
        @AuraEnabled
        public boolean isLggdInUsrHsAccessToGrowthTab{ get; set; }
        @AuraEnabled
        public boolean isLggdInUsrHsAccessToRetentionTab{ get; set; }
        @AuraEnabled
        public boolean isLggdInUsrHsAccessToStatusSnapshotTab{ get; set; }
        
        @AuraEnabled
        public boolean isLoggedInUserVPCR{ get; set; }
    
        
    }
    
    

}