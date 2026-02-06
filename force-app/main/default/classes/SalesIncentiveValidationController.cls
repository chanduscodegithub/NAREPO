/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-02-2024
 * @last modified by  : Spoorthy
**/
public with sharing class SalesIncentiveValidationController {
    
    @AuraEnabled
    public static Map<String,String> getLoggedInUerRoleInfo() {

        Map<String,String> userInfoMap=new Map<string,String>();
        Boolean isLoggedInUserRoleToBeEnabled = false;
        
        try {
            

           User userData = [Select Id,UserRole.Name,Profile.Name from User where Id=:UserInfo.getUserId()]; 
            String loggedInUserRole;
            if(userData.UserRole != null && userData.UserRole.Name != null && userData.UserRole.Name.trim().length() > 0) {
                //String loggedInUserRole = userData.UserRole.Name;
                loggedInUserRole = userData.Profile.Name;
                String[] roleNames=new List<String>();
                String accountRenewalStatusAdminRolesStr=System.Label.AccountRenewalStatus_Admin_Profiles;
                if(accountRenewalStatusAdminRolesStr!=null && accountRenewalStatusAdminRolesStr!='')
                {
                    if(accountRenewalStatusAdminRolesStr.contains(','))
                    {
                        roleNames= accountRenewalStatusAdminRolesStr.split(',');
                        
                    }
                    else
                    {
                        roleNames.add(accountRenewalStatusAdminRolesStr);
                    }
                    
                }
                

                /*String[] roleNames=new List<String>();
                roleNames.add('CRM Administrator');
                roleNames.add('General Executive');*/
                Set<String> roleNamesSet = new Set<String>(roleNames);
                if(roleNamesSet!= null && roleNamesSet.contains(loggedInUserRole)) {
                    isLoggedInUserRoleToBeEnabled = true;
                } else {
                    isLoggedInUserRoleToBeEnabled = false;
                }
                

            }
            
            userInfoMap.put('isLoggedInUserAnAdmin',string.valueOf(isLoggedInUserRoleToBeEnabled));
            //userInfoMap.put('loggedInUserName',UserInfo.getName());
            userInfoMap.put('loggedInUserName',UserInfo.getUserId());
            userInfoMap.put('loggedInUserTimeZone',UserInfo.getTimeZone().getID());
            userInfoMap.put('loggedInUserProfile',loggedInUserRole);
            
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }

       // return isLoggedInUserRoleToBeEnabled;
       return userInfoMap;
    }
    
        @AuraEnabled
    public static LoggedInUserInfoWrapper getLoggedInUserInfo(String accountId) {
		System.debug('Inside getLoggedInUserInfo LoggedInUserInfoWrapper'+accountId);
        LoggedInUserInfoWrapper loggedInUsrInfoWrpr=new LoggedInUserInfoWrapper(); 
        Boolean isLoggedInUserAnAdmin = false;
        Boolean isLoggedInUserAServiceUser=false;
        Boolean isLggdInUsrHsViewAccessToKeyRnwlDtSctn=false;
        Boolean isLggdInUsrHsViewAccessToRnwlStatusSctn=false;
        Boolean isLggdInUsrHsEditAccessToKeyRnwlDtSctn=false;
        Boolean isLggdInUsrHsEditAccessToRnwlStatusSctn=false;

        
        try {
            

           User userData = [Select Id,UserRole.Name,Profile.Name,Profile.UserLicense.Name from User where Id=:UserInfo.getUserId()]; 
            String loggedInUserProfile;
            if(userData!=null) {
				
                if(userData.Profile != null && userData.Profile.Name != null && userData.Profile.Name.trim().length() > 0){
                loggedInUserProfile = userData.Profile.Name;
                String[] accountRenewalStatusAdminProfileLst=new List<String>();
                String accountRenewalStatusAdminProfileStr=System.Label.AccountRenewalStatus_Admin_Profiles;
                if(accountRenewalStatusAdminProfileStr!=null && accountRenewalStatusAdminProfileStr!=''){
                    if(accountRenewalStatusAdminProfileStr.contains(',')){
                        accountRenewalStatusAdminProfileLst= accountRenewalStatusAdminProfileStr.split(',');
                        
                    }
                    else{
                        accountRenewalStatusAdminProfileLst.add(accountRenewalStatusAdminProfileStr);
                    }
                    
                }
                

                /*String[] roleNames=new List<String>();
                roleNames.add('CRM Administrator');
                roleNames.add('General Executive');*/
                Set<String> accountRenewalStatusAdminProfileSet = new Set<String>(accountRenewalStatusAdminProfileLst);
                if(accountRenewalStatusAdminProfileSet!= null && accountRenewalStatusAdminProfileSet.contains(loggedInUserProfile)) {
                    isLoggedInUserAnAdmin = true;
                    isLggdInUsrHsViewAccessToKeyRnwlDtSctn=true;
                    isLggdInUsrHsViewAccessToRnwlStatusSctn=true;
                    isLggdInUsrHsEditAccessToKeyRnwlDtSctn=true;
                    isLggdInUsrHsEditAccessToRnwlStatusSctn=true;
                } else {
                    isLoggedInUserAnAdmin = false;
                }
                
                }
                
                if(!isLoggedInUserAnAdmin){
                    if(userData.Profile != null && userData.Profile.Name != null && userData.Profile.Name.trim().length() > 0
                       && userData.Profile.Name=='Compensation Team Profile'){
                           isLggdInUsrHsViewAccessToKeyRnwlDtSctn=true;
                           isLggdInUsrHsViewAccessToRnwlStatusSctn=true;

                       }
                    else{
                    isLoggedInUserAServiceUser=isServiceProfile(userData);
                    if(isLoggedInUserAServiceUser){
                        isLggdInUsrHsViewAccessToKeyRnwlDtSctn=true;
                        
                    }
                    else if(!isLoggedInUserAServiceUser){
                        isLggdInUsrHsViewAccessToKeyRnwlDtSctn=true;
                        
                        if(isSalesUserToBeEnabledWithAllAccess(userData)){
                            isLggdInUsrHsViewAccessToRnwlStatusSctn=true;
                            if(hasEditAccessToRecord(accountId)){
                                isLggdInUsrHsEditAccessToKeyRnwlDtSctn=true;
                                isLggdInUsrHsEditAccessToRnwlStatusSctn=true;
                            }
                        }
                        else{
							if(hasEditAccessToRecord(accountId)){
                                isLggdInUsrHsEditAccessToKeyRnwlDtSctn=true;
                            }
                            
                            

                        }
                        
                    }
                    }
                }
            }
            

            loggedInUsrInfoWrpr.isLoggedInUserAnAdmin=isLoggedInUserAnAdmin;
            loggedInUsrInfoWrpr.loggedInUserName=UserInfo.getName();
            loggedInUsrInfoWrpr.loggedInUserId=UserInfo.getUserId();
            loggedInUsrInfoWrpr.loggedInUserTimeZone=UserInfo.getTimeZone().getID();
            loggedInUsrInfoWrpr.loggedInUserProfile=loggedInUserProfile;
            loggedInUsrInfoWrpr.isLoggedInUserAServiceUser=isLoggedInUserAServiceUser;
            loggedInUsrInfoWrpr.isLggdInUsrHsViewAccessToKeyRnwlDtSctn=isLggdInUsrHsViewAccessToKeyRnwlDtSctn;
            loggedInUsrInfoWrpr.isLggdInUsrHsViewAccessToRnwlStatusSctn=isLggdInUsrHsViewAccessToRnwlStatusSctn;
            loggedInUsrInfoWrpr.isLggdInUsrHsEditAccessToKeyRnwlDtSctn=isLggdInUsrHsEditAccessToKeyRnwlDtSctn;
            loggedInUsrInfoWrpr.isLggdInUsrHsEditAccessToRnwlStatusSctn=isLggdInUsrHsEditAccessToRnwlStatusSctn;
            loggedInUsrInfoWrpr.isCompanyTypeSpecialityOnly=companyEnabledForFieldCriteria('Subtype__c',
                                                              System.Label.AccountLifeAndDisabilityKeyRenewalDate_CompanyType_TobeEnabled,accountId);

			System.debug('loggedInUsrInfoWrpr==>'+loggedInUsrInfoWrpr);
            
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }

       // return isLoggedInUserRoleToBeEnabled;
       return loggedInUsrInfoWrpr;
    }
    
    
    @AuraEnabled
    public static Boolean isServiceProfile(User userData) {
        Boolean isService = false;
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        try {           
            //User userObj = [Select Id,Profile.Name,Profile.UserLicense.Name from User where Id=: userinfo.getUserId()];
            User userObj = userData;
            String csiAdmVal = '';
            String userLicenseVal = '';
            if(userObj != null) {
                userLicenseVal = userObj.Profile.UserLicense.Name;
                csiAdmVal = userObj.Profile.Name;
            }
            
            if(userLicenseVal != null && userLicenseVal.equalsIgnoreCase(uhgAccountConstants.USER_LICENSE_COMPANY_COMMUNITIES)) {
                isService = true;
            }else if(csiAdmVal != null && csiAdmVal.equalsIgnoreCase(uhgAccountConstants.USER_ROLE_CSI_Admin)){
                isService = true;
            }
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the sections based on the specific roles -> '+e);
        }
        return isService;
    }
    
    @AuraEnabled
    public static Boolean isSalesUserToBeEnabledWithAllAccess(User userData) {
        
        Boolean isLoggedInUserRoleToBeEnabled = false;
        
        try {
            
            User user = userData;                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                String[] roleNames=new List<String>();
                String salesUserRoleNamesToBeEnabledWithAllAccessStr = System.Label.RenewalDetails_SalesRoles_To_EnableWithAllAccess;
                if(salesUserRoleNamesToBeEnabledWithAllAccessStr!=null && salesUserRoleNamesToBeEnabledWithAllAccessStr!=''){
                    if(salesUserRoleNamesToBeEnabledWithAllAccessStr.contains(',')){
                        roleNames= salesUserRoleNamesToBeEnabledWithAllAccessStr.split(',');
                        
                    }
                    else{
                        roleNames.add(salesUserRoleNamesToBeEnabledWithAllAccessStr);
                    }
                    
                }
                

                /*String[] roleNames=new List<String>();
                roleNames.add('CRM Administrator');
                roleNames.add('General Executive');*/
                Set<String> roleNamesSet = new Set<String>(roleNames);
                if(roleNamesSet!= null && roleNamesSet.contains(loggedInUserRole)) {
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
    
    @AuraEnabled
    public static Boolean companyEnabledForFieldCriteria(String criteriaField,String criteriaValue,String accountId) {
        Boolean companyEnabledForFieldCriteria = false;
        
        if(!String.isEmpty(criteriaField) && !String.isEmpty(criteriaValue)){
            
            criteriaField = String.escapeSingleQuotes(criteriaField);
            criteriaValue = String.escapeSingleQuotes(criteriaValue);
            
            String accntQueryStr='Select Id,'+String.escapeSingleQuotes(criteriaField)+' from Account where Id=\''+String.escapeSingleQuotes(accountId)+'\'';
            Account acc=Database.query(accntQueryStr);
            
            if(!String.isEmpty(((String)acc.get(criteriaField)).trim())){
                String accCriteriaFieldValue=(String)acc.get(criteriaField);
                
                System.debug('accCriteriaFieldValue===>'+accCriteriaFieldValue);
                              
                String[] criteriaValueLst=new List<String>();
                
                if(criteriaValue.contains(',')){
                    criteriaValueLst= criteriaValue.split(',');
                    
                }
                else{
                    criteriaValueLst.add(criteriaValue);
                }
                
               
                Set<String> criteriaValueLstSet = new Set<String>(criteriaValueLst);
                if(criteriaValueLstSet!= null && criteriaValueLstSet.contains(accCriteriaFieldValue)) {
                    companyEnabledForFieldCriteria=true;
                } 
                
            }
        }
        return companyEnabledForFieldCriteria;
    }
    
    @AuraEnabled
    public static Map<String,FieldSetResult> getAccountFieldInfo(){
        Map<String,FieldSetResult> accountFieldInfoMap=new Map<String,FieldSetResult>();
        try{
            accountFieldInfoMap=getFieldInfo('Account');
        }
        catch(Exception e)
        {
            System.debug('Exception occured while getting Account Field info==>'+e);
        }
        return accountFieldInfoMap;
    }
    
    
    @AuraEnabled
    public static ReturnSalesIncentiveData getRenewalStatus(String accountId,String year,boolean isLoggedInUserAnAdmin){ 
        
        System.debug('isLoggedInUserAnAdmin==>'+isLoggedInUserAnAdmin);
        ReturnSalesIncentiveData returnSalesIncentiveDataObj = new ReturnSalesIncentiveData();
        
        try {
            System.debug('Acc Id-'+accountId);
            /*
* Return the Renewal Status Data
*/ 			
            List<Integer> yearList=new List<Integer>();
            yearList.add(system.today().year());
            yearList.add(system.today().year()-1);
            
            List<String> salesCyclePickListValuesOfCurrentAndFutureYear=new List<String>();
            integer currentYear =  Date.Today().Year();
            integer currentMonth =Date.today().month();
            if(currentMonth>2)
           // salesCyclePickListValuesOfCurrentAndFutureYear.add('IY'+string.valueof(currentYear).right(2)+', 1/1/'+string.valueof(currentYear+1).right(2));
            salesCyclePickListValuesOfCurrentAndFutureYear.add('IY'+string.valueof(currentYear).right(2)+', 1/1/'+string.valueof(currentYear+1).right(2));
            //salesCyclePickListValuesOfCurrentAndFutureYear.add('IY'+string.valueof(currentYear+1).right(2)+', 1/1/'+string.valueof(currentYear+2).right(2));
            	else if(currentMonth<=2)
                                salesCyclePickListValuesOfCurrentAndFutureYear.add('IY'+string.valueof(currentYear-1).right(2)+', 1/1/'+string.valueof(currentYear).right(2));

            system.debug('salesCyclePickListValuesOfCurrentAndFutureYear==>'+salesCyclePickListValuesOfCurrentAndFutureYear);
            
            List<Renewal_Status__c> renewalStatusList;
            Map<Id,String> sbSceMap = new Map<Id,String>();//SAMARTH
            List<User> usrList = new List<User>();//SAMARTH
            Map<Id,Id> renStatSbSceMap = new Map<Id,Id>(); //SAMARTH
            //List<Renewal_Status__c> renewalStatusList = [SELECT Id,Name,Sales_Person_2__c, Sales_Person_2__r.Name,Date_sent_to_ISI_Site__c, Sales_Person_2_Split_percentage__c, Sales_person_1__c, Sales_Person_1_split_percentage__c, Will_sales_incentives_be_split__c, Product_Confirmed__c, Confirmed_Date__c, Confirmed_By__c, Renewal_Confirmed_Members_Sale__c, Company__r.Owner.Name,isRenewalStatusRecord__c FROM Renewal_Status__c where Company__c=:accountId and isRenewalStatusRecord__c=true];
            if(year!='')
            {
                //Integer yr=integer.valueof(year);
                //renewalStatusList = [SELECT Id,Name,Sales_Person_2__c, Sales_Person_2__r.Name,Date_sent_to_ISI_Site__c, Sales_Person_2_Split_percentage__c, Sales_person_1__c, Sales_Person_1_split_percentage__c, Will_sales_incentives_be_split__c, Product_Confirmed__c, Confirmed_Date__c, Confirmed_By__c, Renewal_Confirmed_Members_Sale__c, Company__r.Owner.Name,isRenewalStatusRecord__c FROM Renewal_Status__c where Company__c=:accountId and isRenewalStatusRecord__c=true];
                /*if(isLoggedInUserAnAdmin == true)
                {
                    renewalStatusList = [SELECT Id,Name,Date_Submitted_For_Incentives__c,Sales_Person_2__c, Sales_Person_2__r.Name,Sales_person_1__c,Sales_person_1__r.Name,Date_sent_to_ISI_Site__c, Sales_Person_2_Split_percentage__c, Sales_Person_1_split_percentage__c, Will_sales_incentives_be_split__c, Product_Confirmed__c, Confirmed_Date__c, Confirmed_By__c, Renewal_Confirmed_Members_Sale__c, Company__r.OwnerId,Company__r.Owner.Name,isRenewalStatusRecord__c,Sales_Cycle__c,Submit_For_Sales_Incentives__c FROM Renewal_Status__c where Company__c=:accountId and Sales_Cycle__c =: year];
                }
                else
                {
                    renewalStatusList = [SELECT Id,Name,Date_Submitted_For_Incentives__c,Sales_Person_2__c, Sales_Person_2__r.Name,Sales_person_1__c,Sales_person_1__r.Name,Date_sent_to_ISI_Site__c, Sales_Person_2_Split_percentage__c, Sales_Person_1_split_percentage__c, Will_sales_incentives_be_split__c, Product_Confirmed__c, Confirmed_Date__c, Confirmed_By__c, Renewal_Confirmed_Members_Sale__c, Company__r.OwnerId,Company__r.Owner.Name,isRenewalStatusRecord__c,Sales_Cycle__c,Submit_For_Sales_Incentives__c FROM Renewal_Status__c where Company__c=:accountId and isRenewalStatusRecord__c=true and Sales_Cycle__c =: year];
                }*/
                
                //Included Company__r.Specialty_SCE_Involved__c - SAMARTH -----Company__r.Specialty_SCE_Involved__c,
                renewalStatusList = [SELECT Id,Name,Company__r.Specialty_SCE__c,Company__r.Specialty_SCE__r.Name,Date_Submitted_For_Incentives__c,Sales_Person_2__c, Sales_Person_2__r.Name,Sales_person_1__c,Sales_person_1__r.Name,Date_sent_to_ISI_Site__c, Sales_Person_2_Split_percentage__c, Sales_Person_1_split_percentage__c, Will_sales_incentives_be_split__c, Product_Confirmed__c, Confirmed_Date__c, Confirmed_By__c, Renewal_Confirmed_Members_Sale__c, Company__r.OwnerId,Company__r.Owner.Name,isRenewalStatusRecord__c,Sales_Cycle__c,Submit_For_Sales_Incentives__c,Product_Line__c,Company__r.CMVPCRRVP__c,Eligible_for_Sales_Incentives__c  FROM Renewal_Status__c where Company__c=:accountId and isRenewalStatusRecord__c=true and Sales_Cycle__c =: year WITH USER_MODE];
                //----------------------SAMARTH----------------------
                for(Renewal_Status__c rs:renewalStatusList){
                    sbSceMap.put(rs.Id,rs.Company__r.Specialty_SCE__r.Name);
                }
                usrList = [Select id,name from User where Name IN:sbSceMap.values()];
                for(Id ids:sbSceMap.keySet()){
                    for(User u:usrList){
                        if(u.name == sbSceMap.get(ids)){
                            renStatSbSceMap.put(ids,u.Id);
                        }
                    }
                }
                //----------------------SAMARTH----------------------
            }
            else
            {
                //renewalStatusList = [SELECT Id,Name,Sales_Person_2__c, Sales_Person_2__r.Name,Date_sent_to_ISI_Site__c, Sales_Person_2_Split_percentage__c, Sales_person_1__c, Sales_Person_1_split_percentage__c, Will_sales_incentives_be_split__c, Product_Confirmed__c, Confirmed_Date__c, Confirmed_By__c, Renewal_Confirmed_Members_Sale__c, Company__r.Owner.Name,isRenewalStatusRecord__c FROM Renewal_Status__c where Company__c=:accountId and isRenewalStatusRecord__c=true ];
            	/*if(isLoggedInUserAnAdmin == true)
                {
                    renewalStatusList = [SELECT Id,Name,Date_Submitted_For_Incentives__c,Sales_Person_2__c, Sales_Person_2__r.Name,Sales_person_1__c,Sales_person_1__r.Name,Date_sent_to_ISI_Site__c, Sales_Person_2_Split_percentage__c, Sales_Person_1_split_percentage__c, Will_sales_incentives_be_split__c, Product_Confirmed__c, Confirmed_Date__c, Confirmed_By__c, Renewal_Confirmed_Members_Sale__c, Company__r.OwnerId,Company__r.Owner.Name,isRenewalStatusRecord__c,Sales_Cycle__c,Submit_For_Sales_Incentives__c FROM Renewal_Status__c where Company__c=:accountId and Sales_Cycle__c =: salesCyclePickListValuesOfCurrentAndFutureYear];
                }
                else
                {
                    renewalStatusList = [SELECT Id,Name,Date_Submitted_For_Incentives__c,Sales_Person_2__c, Sales_Person_2__r.Name,Sales_person_1__c,Sales_person_1__r.Name,Date_sent_to_ISI_Site__c, Sales_Person_2_Split_percentage__c, Sales_Person_1_split_percentage__c, Will_sales_incentives_be_split__c, Product_Confirmed__c, Confirmed_Date__c, Confirmed_By__c, Renewal_Confirmed_Members_Sale__c, Company__r.OwnerId,Company__r.Owner.Name,isRenewalStatusRecord__c,Sales_Cycle__c,Submit_For_Sales_Incentives__c FROM Renewal_Status__c where Company__c=:accountId and isRenewalStatusRecord__c=true and Sales_Cycle__c =: salesCyclePickListValuesOfCurrentAndFutureYear];
                }*/
                
                //Included Company__r.Specialty_SCE_Involved__c - SAMARTH ------Company__r.Specialty_SCE_Involved__c,
                renewalStatusList = [SELECT Id,Name,Company__r.Specialty_SCE__c,Company__r.Specialty_SCE__r.Name,Date_Submitted_For_Incentives__c,Sales_Person_2__c, Sales_Person_2__r.Name,Sales_person_1__c,Sales_person_1__r.Name,Date_sent_to_ISI_Site__c, Sales_Person_2_Split_percentage__c, Sales_Person_1_split_percentage__c, Will_sales_incentives_be_split__c, Product_Confirmed__c, Confirmed_Date__c, Confirmed_By__c, Renewal_Confirmed_Members_Sale__c, Company__r.OwnerId,Company__r.Owner.Name,isRenewalStatusRecord__c,Sales_Cycle__c,Submit_For_Sales_Incentives__c,Product_Line__c,Company__r.CMVPCRRVP__c,Eligible_for_Sales_Incentives__c  FROM Renewal_Status__c where Company__c=:accountId and isRenewalStatusRecord__c=true and Sales_Cycle__c =: salesCyclePickListValuesOfCurrentAndFutureYear WITH USER_MODE];
                //----------------------SAMARTH----------------------
                for(Renewal_Status__c rs:renewalStatusList){
                    sbSceMap.put(rs.Id,rs.Company__r.Specialty_SCE__r.Name);
                }
                usrList = [Select id,name from User where Name IN:sbSceMap.values()];
                for(Id ids:sbSceMap.keySet()){
                    for(User u:usrList){
                        if(u.name == sbSceMap.get(ids)){
                            renStatSbSceMap.put(ids,u.Id);
                        }
                    }
                }
                //----------------------SAMARTH----------------------
            }
            
            
            system.debug('renewalStatusList==>'+renewalStatusList);
            
            returnSalesIncentiveDataObj.renewalStatusList = renewalStatusList;
            returnSalesIncentiveDataObj.specialityBenefitMap = renStatSbSceMap; //SAMARTH

            
            Map<Integer, List<Renewal_Status__c>> rnwlStatusMap=new Map<Integer, List<Renewal_Status__c>>();
            
            Map<String, List<Renewal_Status__c>> rnwlStatusMap1=new Map<String, List<Renewal_Status__c>>();
            
            
            
            for(Renewal_Status__c eachRenewalStatus:renewalStatusList)
            {
                List<Renewal_Status__c> rnwlStatusLst;
                if(!rnwlStatusMap1.isEmpty() && rnwlStatusMap1.containsKey(eachRenewalStatus.Sales_Cycle__c))
                {
                    
                    rnwlStatusLst=rnwlStatusMap1.get(eachRenewalStatus.Sales_Cycle__c);
                    rnwlStatusLst.add(eachRenewalStatus);
                    
                }
                else
                {
                    rnwlStatusLst=new List<Renewal_Status__c>();
                    rnwlStatusLst.add(eachRenewalStatus);
                    
                }
                rnwlStatusMap1.put(eachRenewalStatus.Sales_Cycle__c,rnwlStatusLst);          
            }
            
            
            List<EachYearSalesIncentiveData> eachYearSalesIncentiveDataList=new List<EachYearSalesIncentiveData>();
            
            
            /*if(!rnwlStatusMap.isEmpty())
            {
                for(Integer eachYear:yearList)
                {
                    EachYearSalesIncentiveData eachYearSalesIncentiveData=new EachYearSalesIncentiveData();
                    eachYearSalesIncentiveData.year=eachYear;
                    eachYearSalesIncentiveData.eachYearRenewalStatusList=rnwlStatusMap.get(eachYear);
                    eachYearSalesIncentiveDataList.add(eachYearSalesIncentiveData);
                }
            }*/
            
            if(year!='')
            {
                EachYearSalesIncentiveData eachYearSalesIncentiveData=new EachYearSalesIncentiveData();
                if(!rnwlStatusMap1.isEmpty())
                {
                    
                        
                        eachYearSalesIncentiveData.salesCycle=year;
                        eachYearSalesIncentiveData.eachYearRenewalStatusList=rnwlStatusMap1.get(year);
                        
                        
                        
                        eachYearSalesIncentiveDataList.add(eachYearSalesIncentiveData);

                }
                else
                {

                    eachYearSalesIncentiveData.salesCycle=year;
                    eachYearSalesIncentiveDataList.add(eachYearSalesIncentiveData);
                    
                }
                
            }
            else
            {
                if(!rnwlStatusMap1.isEmpty())
                {
                    for(String eachSalesCycle:salesCyclePickListValuesOfCurrentAndFutureYear)
                    {
                        EachYearSalesIncentiveData eachYearSalesIncentiveData=new EachYearSalesIncentiveData();
                        //eachYearSalesIncentiveData.year=eachYear;
                        eachYearSalesIncentiveData.salesCycle=eachSalesCycle;
                        eachYearSalesIncentiveData.eachYearRenewalStatusList=rnwlStatusMap1.get(eachSalesCycle);
                        
                        
                        
                        eachYearSalesIncentiveDataList.add(eachYearSalesIncentiveData);
                    }
                }
                else
                {
                    for(String eachSalesCycle:salesCyclePickListValuesOfCurrentAndFutureYear)
                    {
                        EachYearSalesIncentiveData eachYearSalesIncentiveData=new EachYearSalesIncentiveData();
                        //eachYearSalesIncentiveData.year=eachYear;
                        eachYearSalesIncentiveData.salesCycle=eachSalesCycle;
                        eachYearSalesIncentiveDataList.add(eachYearSalesIncentiveData);
                    }
                    
                }
            }
            
            //returnSalesIncentiveDataObj.renewalStatusMap = rnwlStatusMap;
            returnSalesIncentiveDataObj.renewalStatusMap1 = rnwlStatusMap1;
            
            /*
* Get all the Renewal Status Picklist field values
*/ 
            String picklistItags = System.Label.AccountRenewalStatus_PicklistFields;
            Map<String,List<String>> picklistValMap = new Map<String,List<String>>();
            List<String> picklistItagsList = picklistItags.split(',');
            system.debug('1'+ picklistItagsList);
            
            /* Schema.sObjectType sobject_type = Renewal_Status__c.getSObjectType();
Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe();
Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap();
system.debug('map-' + field_map);*/
            list<string> salescycleList =new list<string>();
            for(Integer i=2020;i<=currentYear+2;i++){
                salescycleList.add('IY'+string.valueof(i-1).right(2)+', 1/1/'+string.valueof(i).right(2));
            }
            
            //picklistValMap.put(picklistItag, getselectOptions('Renewal_Status__c',picklistItag));
            system.debug(salescycleList);
            
            List<String> willSalesIncentivesBeSplitList = new List<String>();
            willSalesIncentivesBeSplitList.add('');
            willSalesIncentivesBeSplitList.add('No');
            willSalesIncentivesBeSplitList.add('Yes');
            picklistValMap.put('Will_sales_incentives_be_split__c', willSalesIncentivesBeSplitList);
            
            picklistValMap.put('Sales_Cycle__c', salescycleList);
            
            if(picklistItagsList != null && picklistItagsList.size() > 0) {
                for(String picklistItag : picklistItagsList) {
                    /*system.debug('picklistItag' + picklistItag);
List<Schema.PicklistEntry> picklistDataList = field_map.get(picklistItag).getDescribe().getPickListValues();
system.debug('picklistdatalist-' + picklistDataList);
List<String> picklistValuesList = new List<String>();
for(Schema.PicklistEntry entry : picklistDataList) {
picklistValuesList.add(entry.getValue());
system.debug('entryvalue-' + (entry.getValue()));
}
picklistValMap.put(picklistItag, picklistValuesList);*/
                    //returnSalesIncentiveDataObj.picklistFieldsMap.put(picklistItag, picklistValuesList);
                    //picklistValMap.put(picklistItag, getselectOptions('Renewal_Status__c',picklistItag));
                }
                
                //##########################
                    List<String> renewalConfrmdBasedOnPdtTypeCustomMetadataApiNames=System.Label.RenewalConfrmd_BasedOnPdtTypeMetadataApi.split(';');
                	Map<String,List<String>> renewalConfirmedPicklistValueMap = new Map<String,List<String>>();
                	for(String eachPrdctTypeWithRenewalConfirmedApiName:renewalConfrmdBasedOnPdtTypeCustomMetadataApiNames)
                    {
                        List<String> eachPrdctTypeWithRenewalConfirmedApiNameStrLst=eachPrdctTypeWithRenewalConfirmedApiName.split('=');
						renewalConfirmedPicklistValueMap.put(eachPrdctTypeWithRenewalConfirmedApiNameStrLst[0], 
                                           getselectOptions('Account_Renewal_Status_Picklist__mdt',eachPrdctTypeWithRenewalConfirmedApiNameStrLst[1]));                        
                    }
                	
                
                
                //##########################

                returnSalesIncentiveDataObj.picklistFieldsMap = picklistValMap;
                
                returnSalesIncentiveDataObj.renewalConfirmedPicklistBasedOnPdtTypeMap=renewalConfirmedPicklistValueMap;
                
                returnSalesIncentiveDataObj.accountId=accountId;
                
                returnSalesIncentiveDataObj.EachYearSalesIncentiveDataList=eachYearSalesIncentiveDataList;
                
               // returnSalesIncentiveDataObj.loggedInUserName=UserInfo.getName();
                
               returnSalesIncentiveDataObj.FieldSetMap=getFieldInfo('Account');
            }
            
        } catch(Exception e) {
            System.debug('Exception occurred in getRenewalStatus(String oppId) method in SalesIncentiveValidationController class -> '+e);
        }
        
        return returnSalesIncentiveDataObj;   
    }
    @AuraEnabled
    public static ReturnSalesIncentiveData updateRenewalStatusRecords(List<Renewal_Status__c> renewalStatusRecordsTobeUpdated,
                                                                      String accountId,String year,boolean isLoggedInUserAnAdmin )
    {
        
        system.debug('updateRenewalStatusRecords(renewalStatusRecordsTobeUpdated)-- start');
        
        //renewalStatusRecordsTobeUpdated[0].Date_Submitted_For_Incentives__c=System.now();
        
        try
        {
            Database.SaveResult[] renewalStatusUpdateResultList = Database.update(renewalStatusRecordsTobeUpdated);
            
            // Iterate through each returned result
            for (Database.SaveResult sr : renewalStatusUpdateResultList) {
                
                if(!sr.isSuccess()) 
                {
                    
                    for(Database.Error err : sr.getErrors()) 
                    {
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        
                    }
                }
                
            } 
        }
        catch(Exception e)
        {
            System.debug('Exception Occured in updateRenewalStatusRecords(List<Renewal_Status__c>,String) method==>'+e.getMessage());
        }
        
        system.debug('updateRenewalStatusRecords(renewalStatusRecordsTobeUpdated)-- end');
        
        return getRenewalStatus(accountId,year,isLoggedInUserAnAdmin);
    }
    
    public static List < String > getselectOptions(String objectName, string fld)
    {
        
        System.debug('objectName,fld==>'+objectName+' '+fld);
        List < String > allOpts = new list < String > ();
        allOpts.add('');
        
        // Get the object type of the SObject.
        Schema.SObjectType objType = Schema.getGlobalDescribe().get(objectName);
        
        
        // Schema.sObjectType objType = objObject.getSObjectType();
        
        // Describe the SObject using its object type.
        Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
        
        // Get a map of fields for the SObject
        map < String, Schema.SObjectField > fieldMap = objDescribe.fields.getMap();
        
        // Get the list of picklist values for this field.
        list < Schema.PicklistEntry > values =
            fieldMap.get(fld).getDescribe().getPickListValues();
        
        // Add these values to the selectoption list.
        for (Schema.PicklistEntry a: values) {
            allOpts.add(a.getValue());
        }
        system.debug('allOpts ---->' + allOpts);
        //allOpts.sort();
        return allOpts;
    }
    
    @AuraEnabled
    public static List< sObject > fetchLookUpValues(String searchKeyWord, String accountId) {
        System.debug('account ID'+accountId);
       String searchKey = '%'+searchKeyWord + '%';
       //String searchKey2 = searchKeyWord2 + '%';
       
        List< sObject > returnList =new List< sObject> ();
        String sQuery;
       
       //String sQuery = 'select id, Name from User where IsActive = true AND Name LIKE: searchKey order by createdDate DESC limit 5';
       //String sQuery = 'select id, Name from User where IsActive = true AND Name LIKE: searchKey order by Name ASC limit 5';
        if(searchKeyWord=='')
        {
            sQuery = 'select User__c,User__r.Id,Name,Last_Name__c,User__r.UserRole.Name,Account_Firm__c from CM_Account_Team_History__c where (User__r.UserRole.Name=\'CM SCE\' OR User__r.UserRole.Name=\'Surest CM SCE\' OR User__r.UserRole.Name=\'Surest CM SVP\' OR User__r.UserRole.Name=\'Specialty Benefits SCE\') AND User__r.IsActive=true AND Account_Firm__c =:accountId order by Name ASC limit 5';
        }
        else
        {
            sQuery = 'select id,Name,UserRole.Name from User where Name LIKE: searchKey order by Name ASC limit 5';
        }
       
       system.debug('sQuery '+sQuery);
       List<SObject> queriedList = Database.query(sQuery);
       
        for(sObject eachSobject:queriedList)
            {
                returnList.add(eachSobject);
                
            }
       
       if(returnList.isEmpty() && searchKeyWord==''){
           
           
           sQuery = 'select id,Name,UserRole.Name from User where (UserRole.Name=\'CM SCE\' OR UserRole.Name=\'Surest CM SCE\' OR UserRole.Name=\'Surest CM SVP\' OR UserRole.Name=\'Specialty Benefits SCE\') AND IsActive = true order by Name ASC limit 5';
           returnList = Database.query(sQuery);
           
           
       }
        else if(!returnList.isEmpty() && returnList.size()<5 && searchKeyWord==''){
           integer limitsize = 5 - returnList.size();
            sQuery = 'select id,Name,UserRole.Name from User where (UserRole.Name=\'CM SCE\' OR UserRole.Name=\'Surest CM SCE\' OR UserRole.Name=\'Surest CM SVP\' OR UserRole.Name=\'Specialty Benefits SCE\') AND IsActive = true order by Name ASC limit '+limitsize;
          List<sObject> returnList1 = Database.query(sQuery);
            for(sObject eachSobject:returnList1)
            {
                returnList.add(eachSobject);
                
            }
            
            
       }
        system.debug('returnList==>'+returnList);
       return returnList;
   }
   
    
    public static Map<String,FieldSetResult> getFieldInfo(String objectName)
    {
        Map<String,FieldSetResult> fieldSetResultMap = new Map<String,FieldSetResult>() ;
        Map <String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
		for(Schema.SObjectField sfield : fieldMap.Values())
		{
			schema.describefieldresult dfield = sfield.getDescribe();
    		if(dfield.isCustom() && String.valueOf(dfield.getType())!='REFERENCE')
    		{
                FieldSetResult fieldSetRslt= new FieldSetResult();

                fieldSetRslt.label=dfield.getLabel();
                fieldSetRslt.type=String.valueOf(dfield.getType());
                fieldSetRslt.name=dfield.getName();
                    
                fieldSetResultMap.put(fieldSetRslt.name,fieldSetRslt);
    		}
		}
        return fieldSetResultMap;
    }
    
    
   /* public static FieldSetResult getFieldInfoByFieldName(String fldName)
    {

       Schema.DescribeFieldResult dfield = Schema.getGlobalDescribe().get('Account').getDescribe().fields.fldName;





                FieldSetResult fieldSetRslt= new FieldSetResult();

                fieldSetRslt.label=dfield.getLabel();
                fieldSetRslt.type=String.valueOf(dfield.getType());
                fieldSetRslt.name=dfield.getName();
                    



        
        return fieldSetRslt;
    }*/
    
    
    @AuraEnabled
    public static NPSWrapper getTemplateInXML(String accntId,String salesCycle ){                       
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString = 'Select ';
        String objectName  = '';     
        Id userId = UserInfo.getUserId();
        String loggedInUserRole = getUserRole(userId); 
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'RenewalStatusTemplate'];
        String xmlBodyString = sr.body.toString();
        
        Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        System.debug('matcher '+m);
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();    
            
            system.debug('before replace prefix : '+itag);
            itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            System.debug('itag value '+itag);
            Integer dotFirstIndex = itag.indexOf('.');
            objectName = itag.substring(0,dotFirstIndex);
            String fieldName = itag.substring(dotFirstIndex+1);
            
             System.debug('fieldName '+fieldName);
            
            if(objectItagesMap.containsKey(objectName)){
                Set<String> itagSet =  objectItagesMap.get(objectName);                    
                itagSet.add(fieldName);
                objectItagesMap.put(objectName, itagSet);
                
            }else{
                Set<String> itagSet = new Set<String>();
                itagSet.add(fieldName);      
                System.debug('objectName  -> '+objectName);                     
                objectItagesMap.put(objectName, itagSet);
            }                         
            
        }  
        String buildApiKey = '';
        List<Renewal_Status__c> accData = [SELECT Id,Company__r.Name,Name,Sales_Person_2__c, Sales_Person_2__r.Name,Sales_person_1__c,Sales_person_1__r.Name,Date_sent_to_ISI_Site__c, Sales_Person_2_Split_percentage__c, Sales_Person_1_split_percentage__c, Will_sales_incentives_be_split__c, Product_Confirmed__c, Renewal_Confirmed_Members_Sale__c,isRenewalStatusRecord__c,Sales_Cycle__c,Submit_For_Sales_Incentives__c,Product_Line__c,Eligible_for_Sales_Incentives__c,Date_Submitted_For_Incentives__c  FROM Renewal_Status__c where Company__c=:accntId and isRenewalStatusRecord__c=true and Sales_Cycle__c =: salesCycle];
        
        System.debug('accData : '+accData);
        
        
        
        npsWrap.xmlString = xmlBodyString;
        npsWrap.renewalStatusFinalData = accData;
        npsWrap.objectItags = objectItagesMap;
        npsWrap.UserRole = loggedInUserRole;
        
        
        
        npsWrap.FieldSetMap=getFieldInfo('Renewal_Status__c');
        return npsWrap;
    }
    
    public static String getUserRole(Id recordId) {
        String profileName = '';
         try {
            Id profileId=userinfo.getProfileId();
            profileName=[Select Id,Name from Profile where Id=:profileId].Name;
            system.debug('ProfileName retrived '+profileName);
            
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        return profileName;
    }
    
    
    public class ReturnSalesIncentiveData {
        
        @AuraEnabled
        public List<Renewal_Status__c> renewalStatusList {get;set;}
        
        @AuraEnabled
        public Map<String, List<String>> picklistFieldsMap {get;set;}
        
        @AuraEnabled
        public Map<Integer, List<Renewal_Status__c>> renewalStatusMap {get;set;}
        
         @AuraEnabled
        public Map<String, List<Renewal_Status__c>> renewalStatusMap1 {get;set;}
        
        @AuraEnabled
        public ID accountId {get;set;}
        
        @AuraEnabled
        public String loggedInUserName {get;set;}
        
        @AuraEnabled
        public List<EachYearSalesIncentiveData> EachYearSalesIncentiveDataList {get;set;}
        
        
        @AuraEnabled
        public Map<String,FieldSetResult> FieldSetMap { get; set; }
        
        @AuraEnabled
        public Map<String, List<String>> renewalConfirmedPicklistBasedOnPdtTypeMap {get;set;}
        
        @AuraEnabled
        public Map<Id, Id> specialityBenefitMap {get;set;} //SAMARTH
        
    }
    
    
    public class EachYearSalesIncentiveData {
        
        @AuraEnabled
        public List<Renewal_Status__c> eachYearRenewalStatusList {get;set;}
        
        @AuraEnabled
        public Integer year{get;set;}
        
        @AuraEnabled
        public String salesCycle{get;set;}
        
         @AuraEnabled
        public boolean isRenewalStatusListEmpty{get;set;}
        
    }
    
    
    public class FieldSetResult 
    {
        
        @AuraEnabled
        public String label{ get;set; }
        
        @AuraEnabled
        public boolean required { get;set; }
        
        @AuraEnabled
        public String type { get;set; }
        
        @AuraEnabled
        public String name { get;set; }
        
        
        
    }
    
    
    public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public List<Renewal_Status__c> renewalStatusFinalData { get; set; }
        @AuraEnabled
        public String xmlString { get; set; }
        @AuraEnabled
        public String UserRole { get; set; }
        @AuraEnabled
        public Map<String,FieldSetResult> FieldSetMap { get; set; }
        
    }
    
    public class LoggedInUserInfoWrapper{
        @AuraEnabled
        public boolean isLoggedInUserAnAdmin{ get; set; }
        @AuraEnabled
        public String loggedInUserName{ get; set; }
        @AuraEnabled
        public String loggedInUserId{ get; set; }
        @AuraEnabled
        public String loggedInUserTimeZone{ get; set; }
        @AuraEnabled
        public String loggedInUserProfile{ get; set; }
        @AuraEnabled
        public boolean isLoggedInUserAServiceUser{ get; set; }
        @AuraEnabled
        public boolean isLggdInUsrHsViewAccessToKeyRnwlDtSctn{ get; set; }
        @AuraEnabled
        public boolean isLggdInUsrHsViewAccessToRnwlStatusSctn{ get; set; }
        @AuraEnabled
        public boolean isLggdInUsrHsEditAccessToKeyRnwlDtSctn{ get; set; }
        @AuraEnabled
        public boolean isLggdInUsrHsEditAccessToRnwlStatusSctn{ get; set; }
        @AuraEnabled
        public boolean isCompanyTypeSpecialityOnly{ get; set; }


        
        
    }
    
    
    
}