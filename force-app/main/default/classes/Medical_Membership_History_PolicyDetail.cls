/****************************************************************** ***** 
Name: Medical_Membership_History_PolicyDetail
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: The below method queries the PolicyAccountMembership__c records based on the associated AccountId and latest year policy records and calculates the Total values.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Shruthi G  	 		19/11/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/

public without sharing class Medical_Membership_History_PolicyDetail {
            
    /*
    * The below method queries the PolicyAccountMembership__c records based on the associated AccountId and 
    * latest year policy records and calculates the Total values.
    */
    @AuraEnabled
    public static AccountMembershipPolicyDetailsResult getAccountMembershipPolicyDetailsOnAppletLoad(Id accountId){
        
        System.debug('getAccountMembershipPolicyDetailsOnAppletLoad(Id accountId) - START');
        
        System.debug('Input Parameters - accountId-'+accountId);
        
        List<PolicyAccountMembership__c> accountMembershipPolicyDetailsList = new List<PolicyAccountMembership__c>();
        UHGAccountSOQLConstants accountMembershipPolicyConstants = new UHGAccountSOQLConstants();
        AccountMembershipPolicyDetailsResult AccountMembershipPolicyDetailsResultObj = new AccountMembershipPolicyDetailsResult();
        List<PolicyAccountMembership__c> policyMembershipTypeList = new List<PolicyAccountMembership__c>();
        List<PolicyAccountMembership__c> policyMembershipDetailsList = new List<PolicyAccountMembership__c>();
        Map<String,List<PolicyDetails>> policyAccountMembershipDetailsMap = new Map<String,List<PolicyDetails>>();
        Set<String> uniquePolicy = new Set<String>();
        
        try{
            if(accountId != null){
                if(schema.sobjecttype.PolicyAccountMembership__c.isaccessible() && schema.sobjecttype.PolicyAccountMembership__c.isQueryable() && schema.sobjecttype.Account.isaccessible()) {
                    
                    accountMembershipPolicyDetailsList  = Database.query(accountMembershipPolicyConstants.QUERY_ACCOUNT_MEMBERSHIP_POLICY_DETAILS);
                                 
                    Integer latestMonth = 0;
                    Integer latestYear = 0;
                    Integer startYear = 0;
                    boolean firstTime = true;
                    String monthName = 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sept,Oct,Nov,Dec';
                    String[] monthNameArray = monthName.split(',');
                    
                    for(PolicyAccountMembership__c policyObj : accountMembershipPolicyDetailsList){                                                                        
                        
                        Date glDate = policyObj.GLDate__c ;            
                        if(policyObj.GLMembership__c == null){
                            policyObj.GLMembership__c = 0;
                        }
                        if(policyAccountMembershipDetailsMap.containsKey(policyObj.Name)){
                            LIST<PolicyDetails> policyList = policyAccountMembershipDetailsMap.get(policyObj.Name);
                            if(policyList != null && policyList.size() == 1){
                                if(glDate != null && glDate.month() == 2 && glDate.year() == startYear){
                                    PolicyDetails policyDetails1 = setPolicyDetails(policyObj);
                                    policyDetails1.glRevenue = policyObj.GLMembership__c;
                                    policyList.add(policyDetails1);  
                                    policyAccountMembershipDetailsMap.put(policyObj.Name, policyList);
                                }      
                            }                            
                        }else{      
                            uniquePolicy.add(policyObj.Name);                            
                            LIST<PolicyDetails> policyList = new LIST<PolicyDetails>();                            
                            if(firstTime){                   
                                latestMonth = glDate.month();
                                latestYear = glDate.year();
                                firstTime = false;
                                if(latestMonth < 3){
                                    startYear = latestYear-1;
                                }else{
                                    startYear = latestYear;
                                }
                                PolicyDetails policyDetails1 = setPolicyDetails(policyObj);
                                policyDetails1.glRevenue = policyObj.GLMembership__c;
                                policyList.add(policyDetails1);  
                                policyAccountMembershipDetailsMap.put(policyObj.Name, policyList);
                                if(glDate != null && glDate.month() == 2 && glDate.year() == startYear){
                                    PolicyDetails policyDetails2 = setPolicyDetails(policyObj);
                                    policyDetails2.glRevenue = policyObj.GLMembership__c;
                                    policyList.add(policyDetails2); 
                                }     
                                policyAccountMembershipDetailsMap.put(policyObj.Name, policyList);                                
                                AccountMembershipPolicyDetailsResultObj.latestMonthAndYear = monthNameArray[latestMonth-1] +' '+latestYear;
                                AccountMembershipPolicyDetailsResultObj.previousFebYear = startYear;
                                
                            }else if(latestMonth == glDate.month() && latestYear == glDate.year()){
                                PolicyDetails policyDetails1 = setPolicyDetails(policyObj);
                                policyDetails1.glRevenue = policyObj.GLMembership__c;
                                policyList.add(policyDetails1);
                                policyAccountMembershipDetailsMap.put(policyObj.Name, policyList);
                                if(glDate != null && glDate.month() == 2 && glDate.year() == startYear){
                                    PolicyDetails policyDetails2 = setPolicyDetails(policyObj);
                                    policyDetails2.glRevenue = policyObj.GLMembership__c;
                                    policyList.add(policyDetails2);                                   
                                } 
                                policyAccountMembershipDetailsMap.put(policyObj.Name, policyList);
                            }else{
                                if(glDate != null && glDate.month() == 2 && glDate.year() == startYear){                                                                                                                                                
                                    PolicyDetails policyDetails1 = setPolicyDetails(policyObj);
                                    policyDetails1.glRevenue = 0;                                       
                                    PolicyDetails policyDetails2 = setPolicyDetails(policyObj);
                                    policyDetails2.glRevenue = policyObj.GLMembership__c;	                               	                     
                                    policyList.add(policyDetails1);
                                    policyList.add(policyDetails2);  
                                } else{
                                    PolicyDetails policyDetails = setPolicyDetails(policyObj);
                                    policyDetails.glRevenue = 0;                                    
                                    policyList.add(policyDetails);                                       
                                }                                
                                policyAccountMembershipDetailsMap.put(policyObj.Name, policyList);                                
                            }                                                                    
                        }                                                                      
                    }
                    
                    List<PolicyDetails> policyObjList = new List<PolicyDetails>();
                                                            
                    Map<string,PolicyDetails> policyMap = new Map<string,PolicyDetails>();
                    
                    
                    AccountMembershipPolicyDetailsResultObj.totalCurrentGLrevenue = 0;
                    AccountMembershipPolicyDetailsResultObj.totalStartingGLrevenue = 0;
                    AccountMembershipPolicyDetailsResultObj.totalYTD = 0;
                    Double CurrentMonthTotalValue = 0;
                    
                    for(String policyNumber : uniquePolicy){ 
                        if(policyAccountMembershipDetailsMap.containsKey(policyNumber)){
                            List<PolicyDetails> listPolicy = policyAccountMembershipDetailsMap.get(policyNumber);
                            if(listPolicy != null){
                                PolicyDetails policy = null;
                                if(listPolicy.size() > 0){                                    
                                    policy = listPolicy[0];                                    
                                    policy.glRevenueLatest = policy.glRevenue;
                                    AccountMembershipPolicyDetailsResultObj.totalCurrentGLrevenue += policy.glRevenueLatest;
                                    CurrentMonthTotalValue = AccountMembershipPolicyDetailsResultObj.totalCurrentGLrevenue;
                                }
                                if(listPolicy.size() > 1){    
                                    policy.glRevenueFeb = listPolicy[1].glRevenue;
                                    policy.YTD = policy.glRevenueLatest - policy.glRevenueFeb;
                                    AccountMembershipPolicyDetailsResultObj.totalYTD += policy.YTD;
                                    AccountMembershipPolicyDetailsResultObj.totalStartingGLrevenue += policy.glRevenueFeb;
                                }else{          
                                    policy.glRevenueFeb = 0;
                                    policy.YTD = policy.glRevenueLatest - policy.glRevenueFeb;
                                    AccountMembershipPolicyDetailsResultObj.totalYTD += policy.YTD;
                                }
                                if((policy.glRevenueFeb !=null && policy.glRevenueFeb > 0) || (policy.glRevenueLatest !=null && policy.glRevenueLatest > 0)){
                                 //policyObjList.add(policy);   
                                 policyMap.put(policy.policyName+policy.policyNumber, policy);
                                }
                            }
                        }
                    }
                    
                    if(policyMap != null  && policyMap.size() > 0){
                        Set<string> policeKeyName = policyMap.keySet();
                        List<string> policeKeyListName =new List<string>();
                        policeKeyListName.addAll(policeKeyName);                        
                        policeKeyListName.sort();						
                        for(string name : policeKeyListName){
                            policyObjList.add(policyMap.get(name));
                        }                    
                    }
                                       
                   AccountMembershipPolicyDetailsResultObj.policyList = policyObjList; 
                
              	   AccountMembershipPolicyDetailsResultObj.accountMembershipRevenueList = updateMedicalDentalVisionInAccount(accountId,CurrentMonthTotalValue).accountMembershipRevenueList;
                    
                   AccountMembershipPolicyDetailsResultObj.previousTotalMemberRevenue = getLatestFourYearPolicyRevenue(accountId,startYear).previousTotalMemberRevenue;
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getAccountMembershipPolicyDetailsOnAppletLoad> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(NoAccessException ex) {
            System.debug('No Access <getAccountMembershipPolicyDetailsOnAppletLoad> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getAccountMembershipPolicyDetailsOnAppletLoad> '+ex.getMessage());
            System.debug('Error(QueryException) <getAccountMembershipPolicyDetailsOnAppletLoad> '
                         +ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(Exception ex) {
            System.debug('Exception <getAccountMembershipPolicyDetailsOnAppletLoad> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }         
        
       	System.debug('Ouput Parameters -> SortedList -'+AccountMembershipPolicyDetailsResultObj.policyList);
        
        System.debug('getAccountMembershipPolicyDetailsOnAppletLoad(Id accountId) - END');
        
        return AccountMembershipPolicyDetailsResultObj;
    }

    /*
    * Below logic is to get Latest Four Years Policy Revenue to display in UI
    */
    @AuraEnabled
    public static AccountMembershipPolicyDetailsResult getLatestFourYearPolicyRevenue(Id accountId, Integer startYear){
        
        List<PolicyAccountMembership__c> accountMembershipTotalGLMembershipList = new List<PolicyAccountMembership__c>();
        List<PreviousYearRevenue> previousTotalMemberRevenue = new List<PreviousYearRevenue>();
        UHGAccountSOQLConstants accountMembershipPolicyRevenueConstants = new UHGAccountSOQLConstants();
        AccountMembershipPolicyDetailsResult AccountMembershipPolicyRevenueResultObj = new AccountMembershipPolicyDetailsResult();
       
        try{
            if(accountId != null){
                if(schema.sobjecttype.PolicyAccountMembership__c.isaccessible() && schema.sobjecttype.PolicyAccountMembership__c.isQueryable() && schema.sobjecttype.Account.isaccessible()) {
                    
                    accountMembershipTotalGLMembershipList  = Database.query(accountMembershipPolicyRevenueConstants.QUERY_ACCOUNT_MEMBERSHIP_REVENUE_VALUES);
                    
                    if(accountMembershipTotalGLMembershipList != null && accountMembershipTotalGLMembershipList.size()>0){
                        Integer lastYear = accountMembershipTotalGLMembershipList[accountMembershipTotalGLMembershipList.size()-1].GLDate__c.year()-(4-accountMembershipTotalGLMembershipList.size());
                        
                        Integer j=accountMembershipTotalGLMembershipList.size();
                        for(;j<4;j++){
                            PreviousYearRevenue previousPolicy = new PreviousYearRevenue(); 
                            previousPolicy.glDate = lastYear++;
                            previousTotalMemberRevenue.add(previousPolicy);
                        }   
                        for(Integer i = accountMembershipTotalGLMembershipList.size()-1;i>=0;i--){
                            PolicyAccountMembership__c policy = accountMembershipTotalGLMembershipList[i];
                            PreviousYearRevenue previousPolicy = new PreviousYearRevenue();
                            if(policy.GLMembership__c==null){
                                policy.GLMembership__c=0;
                            }
                            previousPolicy.previusYear = policy.GLMembership__c;
                            previousPolicy.glDate = policy.GLDate__c.year();  
                            previousTotalMemberRevenue.add(previousPolicy);
                            lastYear = policy.GLDate__c.year();
                        } 
                    }else{
                        for(Integer i = 3;i>=0;i--){                                                        
                            PreviousYearRevenue previousPolicy = new PreviousYearRevenue();
                            previousPolicy.previusYear = null;
                            previousPolicy.glDate = startYear-i;
                            previousTotalMemberRevenue.add(previousPolicy);
                        }                         
                    }
                    AccountMembershipPolicyRevenueResultObj.previousTotalMemberRevenue = previousTotalMemberRevenue;
                }else {
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException ex) {
            System.debug('Null Pointer <getLatestFourYearPolicyRevenue> '+ex.getMessage());
            throw ex;
        }catch(NoAccessException ex) {
            System.debug('No Access <getLatestFourYearPolicyRevenue> '+ex.getMessage());
            System.debug('Error(NoAccessException) '+ex.getStackTraceString());
            throw ex;
        }catch(QueryException ex){
            System.debug('Error(QueryException) <getLatestFourYearPolicyRevenue> '+ex.getMessage());
            System.debug('Error(QueryException) <getLatestFourYearPolicyRevenue> '
                         +ex.getStackTraceString());
            throw ex;
        }catch(Exception ex) {
            System.debug('Exception <getLatestFourYearPolicyRevenue> ' + ex.getMessage());
            throw ex;
        }  
        return AccountMembershipPolicyRevenueResultObj;
    }
    
    /*
    * The below logic is to update UHC_Medical_Members__c,UHC_Vision_Members__c, UHC_Dental_Members__c field in Account detail page.
    */
    @AuraEnabled
    public static AccountMembershipPolicyDetailsResult updateMedicalDentalVisionInAccount(Id accountId,Double CurrentMonthTotalValue){
     
        List<PolicyAccountMembership__c> accountMembershipRevenueList = new List<PolicyAccountMembership__c>();
        UHGAccountSOQLConstants accountMembershipRevenueConstants = new UHGAccountSOQLConstants();
        AccountMembershipPolicyDetailsResult AccountMembershipRevenueResultObj = new AccountMembershipPolicyDetailsResult();
       
         try{
            if(accountId != null){
                if(schema.sobjecttype.PolicyAccountMembership__c.isaccessible() && schema.sobjecttype.PolicyAccountMembership__c.isQueryable() && schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isUpdateable()) {
                  
                    accountMembershipRevenueList  = Database.query(accountMembershipRevenueConstants.QUERY_DENTAL_VISION_REVENUE_VALUES);
                   		
                    Boolean dental=false,vison=false;
                    Date dentalMaxDate,visionMaxDate;
                    Double dentalLatestMonthRevenue = 0;
                    Double visionLatestMonthRevenue = 0;
                    
                    for(PolicyAccountMembership__c revenueObj : accountMembershipRevenueList){      
                        Date glDate1 = revenueObj.GLDate__c ;
                    	String membershipType = revenueObj.MembershipType__c;
                        if(revenueObj.GLMembership__c==null){
                            revenueObj.GLMembership__c=0;
                        }
                        
                        if(membershipType!=null && membershipType.equalsIgnoreCase('Dental') && !dental){
                            dental=true;
                            dentalMaxDate= glDate1;
                            dentalLatestMonthRevenue = revenueObj.GLMembership__c;
                        }
                        else if(membershipType!=null && membershipType.equalsIgnoreCase('Vision') && !vison){
                            vison=true;
                            visionMaxDate= glDate1;
                            visionLatestMonthRevenue = revenueObj.GLMembership__c;
                        }
                        if(dental && vison){
                            break;
                        }
                    }
                   
                   /* Account accountUpdate = new Account();
                    accountUpdate.Id = accountId;
                    
                    if(CurrentMonthTotalValue !=null || dentalLatestMonthRevenue!=null || visionLatestMonthRevenue !=null){      
    	               accountUpdate.UHC_Medical_Members__c = CurrentMonthTotalValue;
                       accountUpdate.UHC_Dental_Members__c = dentalLatestMonthRevenue;
                       accountUpdate.UHC_Vision_Members__c = visionLatestMonthRevenue;
                    } else{
                       accountUpdate.UHC_Medical_Members__c = 0;
                       accountUpdate.UHC_Dental_Members__c = 0;
                       accountUpdate.UHC_Vision_Members__c = 0;
                    } 
                    
                    Database.SaveResult dbupdateResult = Database.update(accountUpdate, false);
                    
                    if(!dbupdateResult.isSuccess()) {
                        for(Database.Error err : dbupdateResult.getErrors()) {
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                            System.debug('Fields that affected this error: ' + err.getFields());
                        }
                    }*/
                    
                    AccountMembershipRevenueResultObj.accountMembershipRevenueList = accountMembershipRevenueList;
                }else {
                   // throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
         }catch(NullPointerException ex) {
            System.debug('Null Pointer <updateMedicalDentalVisionInAccount> '+ex.getMessage());
            throw ex;
        }catch(NoAccessException ex) {
            System.debug('No Access <updateMedicalDentalVisionInAccount> '+ex.getMessage());
            System.debug('Error(NoAccessException)'+ex.getStackTraceString());
            throw ex;
        }catch(QueryException ex){
            System.debug('Error(QueryException) <updateMedicalDentalVisionInAccount> '+ex.getMessage());
            System.debug('Error(QueryException) <updateMedicalDentalVisionInAccount> '
                         +ex.getStackTraceString());
            throw ex;
        }catch(Exception ex) {
            System.debug('Exception <updateMedicalDentalVisionInAccount> ' + ex.getMessage());
            throw ex;
        }     
        return AccountMembershipRevenueResultObj;
    }
    
    @AuraEnabled
    public static PolicyDetails setPolicyDetails(PolicyAccountMembership__c policyObj){
        PolicyDetails policyDetails = new PolicyDetails();
        policyDetails.policyNumber = policyObj.Name;
        policyDetails.policyName = policyObj.PolicyName__c;
        policyDetails.glDate = policyObj.GLDate__c;                                
        return policyDetails;
    }
    
    /*
    * Wrapper class to display Policy Records
    */
    public class AccountMembershipPolicyDetailsResult {
                        
		@AuraEnabled
        public List<PreviousYearRevenue> previousTotalMemberRevenue{ get;set;}            
            
        @AuraEnabled
        public List<PolicyAccountMembership__c> accountMembershipPolicyDetailsList{ get;set;}
        
        @AuraEnabled
        public List<PolicyAccountMembership__c> accountMembershipTotalGLMembershipList{ get;set;}
        
        @AuraEnabled
        public Map<String,List<PolicyDetails>> policyAccountMembershipDetailsMap { get;set;}
        
        @AuraEnabled
        public List<PolicyAccountMembership__c> accountMembershipRevenueList{ get;set;}
        
        @AuraEnabled
        public List<PolicyDetails> policyList { get;set;}
        
        @AuraEnabled
        public string latestMonthAndYear { get;set;}
        
        @AuraEnabled
        public Double previousFebYear { get;set;}                
        
        @AuraEnabled
        public Double totalStartingGLrevenue { get;set;}                
        
        @AuraEnabled
        public Double totalCurrentGLrevenue { get;set;}                
        
        @AuraEnabled
        public Double totalYTD { get;set;}
        
        @AuraEnabled
        public Date glDate1 { get;set;}  
    }
    
    public class PreviousYearRevenue {
        
        @AuraEnabled
        public Double previusYear { get;set;}
        
        @AuraEnabled
        public Decimal glDate { get;set;}
    }
    
    public class PolicyDetails {
        
        @AuraEnabled
        public Double glRevenueLatest { get;set;}
        
        @AuraEnabled
        public Double glRevenueFeb { get;set;}
        
        @AuraEnabled
        public Double glRevenue { get;set;}
        
        @AuraEnabled
        public string policyNumber { get;set;}                          
        
        @AuraEnabled
        public string policyName { get;set;}                  
        
        @AuraEnabled
        public Date glDate { get;set;}                  
        
        @AuraEnabled
        public Double YTD { get;set;}
    }
}