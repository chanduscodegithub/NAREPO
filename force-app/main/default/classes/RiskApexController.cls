/****************************************************************** ***** 
Name: RiskApexController 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query all Risk Profile with Associated with Account for the Lightning Component.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 HARSHAVARDHAN Y R  	08/08/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/
public without sharing class RiskApexController {
    
    /******************************************************************
* 
Purpose: Query all the Risk Profile MetaData
Parameters: riskType
Returns: RiskProfileWrapperClass
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/
    
    @AuraEnabled
    public static RiskProfileWrapperClass getRiskProfileMetaDate(String riskType){
        System.debug('Enter <getRiskProfileMetaDate()>');
        List<Risk_Profile__mdt> riskProfileMetaDataList = null;
        
        RiskProfileWrapperClass riskProfileWrapperClass = new RiskProfileWrapperClass();
        
        Map<string,RiskProfileMetaDataWrapperClass> riskProfileMetaDataWrapperClass = new Map<string,RiskProfileMetaDataWrapperClass>();
        
        Set<string> riskTypePickSet = new Set<string>();
        riskTypePickSet.add('');
        
        Set<string> riskTypAddRiskFacorList = new Set<string>();
        Set<RiskProfileHelpTextWrapper> riskHelptTextSet = new Set<RiskProfileHelpTextWrapper>();
        
        try{                            
            if(schema.sobjecttype.Risk_Profile__mdt.isaccessible() && schema.sobjecttype.Risk_Profile__mdt.isQueryable()) {                                                        
                string buildQuery = '';
                if(riskType != null && riskType.trim().length() > 0){
                    buildQuery = UHGAccountSOQLConstants.QUERY_RISK_PROFILE_METADATA+UHGAccountSOQLConstants.WHERE_CONDITION+UHGAccountSOQLConstants.QUERY_RISK_TYPE_VALUE+UHGAccountSOQLConstants.SINGLE_QUOTE+riskType+UHGAccountSOQLConstants.SINGLE_QUOTE+UHGAccountSOQLConstants.QUERY_SPACE+UHGAccountSOQLConstants.QUERY_ORDER_BY_NUMBER;
                }else{
                    buildQuery = UHGAccountSOQLConstants.QUERY_RISK_PROFILE_METADATA+UHGAccountSOQLConstants.QUERY_SPACE+UHGAccountSOQLConstants.QUERY_ORDER_BY_NUMBER;
                }
                System.debug('buildQuery'+buildQuery);
                riskProfileMetaDataList = Database.query(buildQuery);                
                if(riskProfileMetaDataList != null){                    
                    for(Risk_Profile__mdt  riskProfileMDT : riskProfileMetaDataList){                          
                        try{
                            String riskProfileTypeStr = riskProfileMDT.Risk_Profile_Type__c;
                            if(riskProfileTypeStr.equals(UHGAccountSOQLConstants.RISK_TRACKED_BY_SCE)){
                                RiskProfileMetaDataWrapperClass riskProfileMTA = new RiskProfileMetaDataWrapperClass();
                                riskProfileMTA.riskProfileType = riskProfileTypeStr;
                                Map<string,double> impactValueMap = new Map<string,double>();
                                Set<string> impactList = new Set<string>();
                                impactList.add('');              
                                impactValueMap.put('',Double.valueOf(1));                            
                                for(string eachImpack : riskProfileMDT.Impact__c.split(',')){
                                    string[] impactVal = eachImpack.split(':');
                                    impactList.add(impactVal[0]);
                                    impactValueMap.put(impactVal[0], Double.valueOf(impactVal[1]));
                                }                            
                                Set<string> addInfoSet = new Set<string>();
                                addInfoSet.add('');
                                for(string eachAddInfo : riskProfileMDT.Additional_Information__c.split(',')){
                                    addInfoSet.add(eachAddInfo);
                                }
                                
                                riskProfileMTA.impactValueMap = impactValueMap;
                                riskProfileMTA.impact = impactList;
                                riskProfileMTA.addInfo = addInfoSet;
                                riskProfileMTA.riskScore = riskProfileMDT.Raw_Score__c;
                                RiskProfileHelpTextWrapper riskProfileHelpText = new RiskProfileHelpTextWrapper();
                                riskProfileHelpText.riskName = riskProfileMDT.Label;
                                riskProfileHelpText.helpText = riskProfileMDT.HelpText__c;                            
                                riskTypePickSet.add(riskProfileMDT.Label);
                                riskHelptTextSet.add(riskProfileHelpText);
                                riskProfileMetaDataWrapperClass.put(riskProfileMDT.Label, riskProfileMTA);                                                    	
                                
                            }else if(riskProfileTypeStr.equals(UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR)){
                                RiskProfileMetaDataWrapperClass riskProfileMTA = new RiskProfileMetaDataWrapperClass();
                                riskProfileMTA.riskProfileType = riskProfileTypeStr;
                                riskProfileMTA.fieldType = riskProfileMDT.Data_Type__c;
                                riskTypAddRiskFacorList.add(riskProfileMDT.Label);                            
                                if(riskProfileMDT.Data_Type__c.equals(UHGAccountConstants.NUMEBR_FIELD)){
                                    Map<string,Double> addRiskPickListMap = new Map<string,Double>();                                                                
                                    for(string eachImpack : riskProfileMDT.Raw_Score__c.split(';')){
                                        string[] addRisk = eachImpack.split('=');
                                        addRiskPickListMap.put(addRisk[0], Double.valueOf(addRisk[1]));
                                    }     
                                    riskProfileMTA.addRiskPickListMap = addRiskPickListMap;
                                }else if(riskProfileMDT.Data_Type__c.equals(UHGAccountConstants.PICKLIST_FIELD)){                                
                                    Map<string,Double> addRiskPickListMap = new Map<string,Double>();
                                    Set<string> addRiskList = new Set<string>();
                                    addRiskList.add('');  
                                    addRiskPickListMap.put('', 0);
                                    for(string eachImpack : riskProfileMDT.Raw_Score__c.split(',')){
                                        string[] addRisk = eachImpack.split(':');
                                        addRiskList.add(addRisk[0]);
                                        addRiskPickListMap.put(addRisk[0], Double.valueOf(addRisk[1]));
                                    }                                 
                                    riskProfileMTA.addRiskList = addRiskList;
                                    riskProfileMTA.addRiskPickListMap = addRiskPickListMap;
                                }else if(riskProfileMDT.Data_Type__c.equals(UHGAccountConstants.CURRENCY_FIELD)){
                                    Map<string,Double> addRiskPickListMap = new Map<string,Double>();                                                                
                                    for(string eachImpack : riskProfileMDT.Raw_Score__c.split(';')){
                                        string[] addRisk = eachImpack.split('=');
                                        addRiskPickListMap.put(addRisk[0], Double.valueOf(addRisk[1]));
                                    } 
                                    riskProfileMTA.addRiskPickListMap = addRiskPickListMap;
                                }else if(riskProfileMDT.Data_Type__c.equals(UHGAccountConstants.PERCENTAGE_FIELD)){
                                    Map<string,Double> addRiskPickListMap = new Map<string,Double>();                                                                
                                    for(string eachImpack : riskProfileMDT.Raw_Score__c.split(';')){
                                        string[] addRisk = eachImpack.split('=');
                                        addRiskPickListMap.put(addRisk[0], Double.valueOf(addRisk[1]));
                                    }    
                                    riskProfileMTA.addRiskPickListMap = addRiskPickListMap;
                                }else if(riskProfileMDT.Data_Type__c.equals(UHGAccountConstants.INTEGER_FIELD)){                                
                                    riskProfileMTA.rawScore = Double.valueOf(riskProfileMDT.Raw_Score__c);
                                }
                                riskProfileMTA.weightMultiplier = Double.valueOf(riskProfileMDT.Weight_Multiplier__c);
                                riskProfileMetaDataWrapperClass.put(riskProfileMDT.Label, riskProfileMTA);                                                    	                            
                            }                                 
                        }catch(Exception ex){
                            System.debug('Exception Line Number '+ex.getLineNumber());
                            System.debug('Exception Reason '+ex.getMessage());
                            throw ex;
                        }
                    }                
                    
                    riskProfileWrapperClass.riskTypePickSet = riskTypePickSet;
                    riskProfileWrapperClass.riskHelptTextSet = riskHelptTextSet;
                    riskProfileWrapperClass.riskTypAddRiskFacorList = riskTypAddRiskFacorList;
                    riskProfileWrapperClass.riskProfileMetaDataWrapperClass = riskProfileMetaDataWrapperClass;                                                
                }                
            }              
        }catch(Exception ex) {
            System.debug('Exception <getRiskProfileMetaDate> ' + ex.getMessage());
            throw ex;
        }         
        System.debug('End <getRiskProfileMetaDate()>');
        return riskProfileWrapperClass;
    }
    
    /******************************************************************
* 
Purpose: Delete the Risk Profile based on Id
Parameters: riskProfileId,accountId
Returns: RiskProfileWrapperClass
Throws [Exceptions]: NullPointerException,NoAccessException,Exception

*******************************************************************
*/    
    @AuraEnabled
    public static RiskProfileWrapperClass deleteRiskProfileObj(List<String> riskProfileId,String accountId,Boolean isEditEnabled){
        System.debug('Enter <deleteRiskProfileObj>');
        System.debug('Input Paramter : riskProfileId : '+riskProfileId);
         RiskProfileWrapperClass riskProfileWrapperClass = new RiskProfileWrapperClass();   
        try{                                     
            if(riskProfileId != null && riskProfileId.size() >0){                                
                if(schema.sobjecttype.RiskProfile__c .isaccessible() && schema.sobjecttype.RiskProfile__c .isDeletable()) {
                    Database.DeleteResult[] dr = Database.delete(riskProfileId);
                    for (Database.DeleteResult sr : dr) {
                        if (sr.isSuccess()) {                    
                            System.debug('Successfully deleted <deleteRiskProfileObj> with ID: ' + sr.getId());
                        }
                        else {                                
                            for(Database.Error err : sr.getErrors()) {
                                System.debug('<deleteRiskProfileObj()> The following error has occurred.');                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('<deleteRiskProfileObj()> ConsultantHistory fields that affected this error: ' + err.getFields());
                            }
                        }   
                    }
                    
                }else {
                    throw new NoAccessException();
                }
            } 
            if(!isEditEnabled){
                riskProfileWrapperClass = getRiskProfileData(accountId);
            }            
        }catch(NoAccessException ex) {
            System.debug('No Access <deleteRiskProfileObj> '+ex.getMessage());
            System.debug('Error(NoAccessException) <deleteRiskProfileObj> '+ex.getStackTraceString());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }catch(System.DmlException dmlExec){                      
            for (Integer i = 0; i < dmlExec.getNumDml(); i++) {
                if(dmlExec.getDmlStatusCode(i).equals('ENTITY_IS_DELETED')){
                   // riskProfileWrapperClass = getRiskProfileData(accountId);
                }
                else{
                    System.debug('Status Code -> '+dmlExec.getDmlStatusCode(i)); 
                    System.debug('DML Error Message -> '+dmlExec.getDmlMessage(i)); 
                    System.debug('FieldNames -> '+dmlExec.getDmlFieldNames(i));
                    throw new AuraHandledException(dmlExec.getTypeName() +' Occured---> '+dmlExec.getDmlMessage(i));
                }
            }			
        }
        catch(Exception ex){
            System.debug('Exception <deleteRiskProfileObj> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }
        System.debug('End <deleteRiskProfileObj> ');
        return riskProfileWrapperClass;
    }
    
    /******************************************************************
* 
Purpose: Query the Account based on Id
Parameters: accountId
Returns: Account
Throws [Exceptions]: NullPointerException,NoAccessException,Exception

*******************************************************************
*/    
    
    @AuraEnabled
    public static Account getAccoutDetails(Id accountId){
        System.debug('Enter <getAccoutDetails> ');
        Account acc = null;
        try{                       
            if(schema.sobjecttype.Account .isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                acc = Database.query(UHGAccountSOQLConstants.QUERY_ACCOUNT_RISK_PROFILE);
                System.debug('Output Paramter acc : '+acc);   
            }            
        }catch(Exception ex){
            System.debug('Exception '+ex.getMessage());
            throw ex;
        }            
        System.debug('Exit <getAccoutDetails> ');
        return acc;
    }
    
    /******************************************************************
* 
Purpose: Update the Account ReviewDate in Account
Parameters: accountId
Returns: RiskProfileWrapperClass
Throws [Exceptions]: NullPointerException,NoAccessException,Exception

*******************************************************************
*/        
    @AuraEnabled
    public static void updateAccountRiskScore(Account acc){
        System.debug('Enter <updateAccountRiskScore>');
        System.debug('Input Paramter : accountId :'+acc);
        RiskProfileWrapperClass riskProfileWrapperClass = new RiskProfileWrapperClass();        
        try{            
            if(acc != null){
                if(schema.sobjecttype.Account .isaccessible() && schema.sobjecttype.Account.isUpdateable()) {
                    Database.upsert(acc);
                }else{
                    throw new NoAccessException();
                }                
            }                  
        }catch(Exception ex){
            System.debug('Exception <updateAccountRiskScore> '+ex.getMessage());
            throw ex;
        }   
        System.debug('Exit <updateAccountRiskScore>');        
    }
    
    /******************************************************************
* 
Purpose: Update the Account ReviewDate in Account
Parameters: accountId
Returns: RiskProfileWrapperClass
Throws [Exceptions]: NullPointerException,NoAccessException,Exception

*******************************************************************
*/        
    @AuraEnabled
    public static RiskProfileWrapperClass updateAccountReviewDate(Id accountId,String today){
        System.debug('Enter <updateAccountReviewDate>');
        System.debug('Input Paramter : accountId :'+accountId+' : today :'+today);
        RiskProfileWrapperClass riskProfileWrapperClass = new RiskProfileWrapperClass();   
        
        try{            
            if(accountId != null){
                if(schema.sobjecttype.Account .isaccessible() && schema.sobjecttype.Account.isUpdateable()) {
                    Account acc = new Account();
                    acc.Id = accountId;
                    /*if(today != null){
acc.SCEReviewedDate__c = Date.valueOf(today);
} 
Datetime now = Datetime.now();
Integer offset = UserInfo.getTimezone().getOffset(now);
Datetime local = now.addSeconds(offset/1000);

acc.SCEReviewedDate__c = local.dateGMT(); */
                    acc.Risk_Profile_SCE_Reviewed__c = true;
                    upsert acc;
                    riskProfileWrapperClass.riskProfileAccount = getAccoutDetails(accountId);   
                }else{
                    throw new NoAccessException();
                }                
            }                  
        }catch(Exception ex){
            System.debug('Exception <updateAccountReviewDate> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }   
        System.debug('Exit <updateAccountReviewDate>');
        return riskProfileWrapperClass;
    }
    
    /******************************************************************
* 
Purpose: Save the Risk Profile
Parameters: riskProfileList
Throws [Exceptions]: NullPointerException,NoAccessException,Exception

*******************************************************************
*/        
    @AuraEnabled
    public static LIST<RiskProfile__c> saveRiskProfile(RiskProfile__c[] riskProfileList,String today){
        System.debug('Enter <saveRiskProfile>'+today);
        LIST<RiskProfile__c> riskProfileListForInsert = new LIST<RiskProfile__c>(); 
        try{               
            System.debug('Input Paramter riskProfileList: '+riskProfileList);
            if(schema.sobjecttype.RiskProfile__c.isaccessible() && schema.sobjecttype.RiskProfile__c.isCreateable()) {              
                for(RiskProfile__c riskProfile : riskProfileList){   
                    Datetime now = Datetime.now();
                    Integer offset = UserInfo.getTimezone().getOffset(now);
                    Datetime local = now.addSeconds(offset/1000);
                    
                    //riskProfile.DateRiskAdded__c = Date.valueOf(today);
                    //riskProfile.DateRiskModified__c = Date.valueOf(today);                         
                    riskProfile.DateRiskAdded__c = local.dateGMT();
                    riskProfile.DateRiskModified__c = local.dateGMT();
                    riskProfileListForInsert.add(riskProfile);
                }
                //Database.insert(riskProfileListForInsert);
            }                       
        }catch(Exception ex){
            System.debug('Exception <saveRiskProfile> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }        
        System.debug('End <saveRiskProfile> ');
        return riskProfileListForInsert;
    }
    
    /******************************************************************
* 
Purpose: Save the Risk Profile with Modified Date
Parameters: saveAndUpdateRiskProfile
Returns: RiskProfileWrapperClass
Throws [Exceptions]: NullPointerException,NoAccessException,Exception

*******************************************************************
*/        
    @AuraEnabled
    public static RiskProfileWrapperClass saveAndUpdateRiskProfile(RiskProfile__c[] riskProfileList,RiskProfile__c[] riskProfileAddRiskList,Id accountId,Boolean canUpdateReviewOnSave,String today,List<String> riskProfileIds){
        System.debug('Enter <saveAndUpdateRiskProfile> ');        
        RiskProfileWrapperClass riskProfileWrapperClass = new RiskProfileWrapperClass();        
        try{            
            System.debug('Input Paramter : riskProfileList :'+riskProfileList);
            System.debug('Input Paramter  : riskProfileAddRiskList :'+riskProfileAddRiskList);
            System.debug('Input Paramter : canUpdateReviewOnSave :'+canUpdateReviewOnSave);
            
            if(canUpdateReviewOnSave){
                //updateAccountReviewDate(accountId);   
            }          
            
            if(riskProfileIds!= null && riskProfileIds.size()>0){
                deleteRiskProfileObj(riskProfileIds,accountId,true);
            }
            
            LIST<RiskProfile__c> riskProfileListForInsert = new LIST<RiskProfile__c>();
            
            if(schema.sobjecttype.RiskProfile__c.isaccessible() && schema.sobjecttype.RiskProfile__c.isUpdateable()) {
                if(riskProfileList != null && riskProfileList.size() > 0){
                    for(RiskProfile__c riskProfile : riskProfileList){                        
                        //riskProfile.DateRiskModified__c = Date.valueOf(today);				
                        Datetime now = Datetime.now();
                        Integer offset = UserInfo.getTimezone().getOffset(now);
                        Datetime local = now.addSeconds(offset/1000);                    
                        riskProfile.DateRiskModified__c = local.dateGMT();
                        
                        riskProfileListForInsert.add(riskProfile);                
                    }                   
                }                
                if(riskProfileAddRiskList != null && riskProfileAddRiskList.size() > 0){
                    for(RiskProfile__c riskProfile : riskProfileAddRiskList){                                                      
                        riskProfileListForInsert.add(riskProfile);                                                        
                    }     
                }                                             
                if(riskProfileListForInsert != null && riskProfileListForInsert.size() > 0){
                    Database.UpsertResult[] results = Database.upsert(riskProfileListForInsert);   
                    for(Database.UpsertResult result: results){
                        if(result.isSuccess()){
                            System.debug('Successfully inserted riskProfile.  ID: ' + result.getId());
                        }else{
                            for(Database.Error err : result.getErrors()) {
                                System.debug('<saveAndUpdateRiskProfile> The following error has occurred.');                    
                                System.debug('<saveAndUpdateRiskProfile> : '+err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('<saveAndUpdateRiskProfile> Consultant fields that affected this error: ' + err.getFields());            
                            }
                        }                         
                    } 
                }               
            }
            
            riskProfileWrapperClass = getRiskProfileData(accountId);
            
        }catch(Exception ex){
            System.debug('Exception <saveAndUpdateRiskProfile> '+ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }      
        System.debug('End <saveAndUpdateRiskProfile> '); 
        return riskProfileWrapperClass;
    }
    
    /******************************************************************
* 
Purpose: Create the default Risk Profile Records for Every New Account
Parameters: accountId,riskProfileWrapperClass
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/    
    @AuraEnabled
    public static void createAdditionalRiskFactor(Id accountId,RiskProfileWrapperClass riskProfileWrapperClass){
        System.debug('Enter <createAdditionalRiskFactor>');
        try{                                
            LIST<RiskProfile__c> inserAdditionRiskProfileList = new LIST<RiskProfile__c>();
            
            if(schema.sobjecttype.RiskProfile__c.isaccessible() && schema.sobjecttype.RiskProfile__c.isCreateable()) {                 
                List<RiskProfile__c> additionRiskNameList = Database.query(UHGAccountSOQLConstants.QUERY_RISK_PROFILE_OF_TYPE_ADDITIONAL_RISK);                
                for(RiskProfile__c riskProfile : additionRiskNameList){                    
                    if(riskProfileWrapperClass.riskTypAddRiskFacorList.contains(riskProfile.SCERiskTypeAddlRiskFactorType__c)){
                        riskProfileWrapperClass.riskTypAddRiskFacorList.remove(riskProfile.SCERiskTypeAddlRiskFactorType__c);
                    }
                }                                
                System.debug('riskTypAddRiskFacorList --> '+riskProfileWrapperClass.riskTypAddRiskFacorList);
                for(String SCERiskTypeAddlRiskFactorType : riskProfileWrapperClass.riskTypAddRiskFacorList){
                    RiskProfile__c riskProfile = new RiskProfile__c();                    
                    riskProfile.SCERiskTypeAddlRiskFactorType__c = SCERiskTypeAddlRiskFactorType;
                    riskProfile.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
                    riskProfile.AccountFirm__c = accountId;
                    Double rawScoreDefaultVal = 0.00;
                    riskProfile.RiskScore__c = rawScoreDefaultVal;
                    inserAdditionRiskProfileList.add(riskProfile);
                }                                                
                Database.insert(inserAdditionRiskProfileList);
            }
        }catch(Exception ex) {
            System.debug('Exception <createAdditionalRiskFactor>' + ex.getMessage()); 
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }
        System.debug('Exit <createAdditionalRiskFactor>');
    }
    
    
    public static void updateRiskProfileRiskScoreValues(List<RiskProfile__c> riskProfileAllList){
        try{            
            RiskProfileWrapperClass riskProfileWrapperClass = getRiskProfileMetaDate(null);
            Map<String,RiskProfileMetaDataWrapperClass> riskProfileMTAmap= riskProfileWrapperClass.riskProfileMetaDataWrapperClass;
            
            List<RiskProfile__c> riskProfileUpdatedList = new List<RiskProfile__c>();
            
            if(schema.sobjecttype.RiskProfile__c.isaccessible() && schema.sobjecttype.RiskProfile__c.isQueryable()) {                
                
                for(RiskProfile__c riskProfile : riskProfileAllList){                    
                    if(riskProfileMTAmap.containsKey(riskProfile.SCERiskTypeAddlRiskFactorType__c)){
                        
                        String riskName = riskProfile.SCERiskTypeAddlRiskFactorType__c;                        
                        
                        if(riskProfile.RiskProfileType__c.equals(UHGAccountSOQLConstants.RISK_TRACKED_BY_SCE)){
                            Map<string,Double> impactValueMap = riskProfileMTAmap.get(riskName).impactValueMap;
                            if(impactValueMap.containsKey(riskProfile.Impact__c)){
                                try{
                                    System.debug('riskProfile : '+riskProfile);
                                    System.debug('riskProfile Map Value : '+riskProfileMTAmap.get(riskName));   
                                    
                                    boolean isDataRiskCloseChanged = false;
                                    
                                    if(riskProfile.DateRiskClosed__c != null && riskProfile.RiskScore__c != null && riskProfile.RiskScore__c != 0){
                                        isDataRiskCloseChanged = true;
                                    }
                                    
                                    if(isDataRiskCloseChanged || Double.valueOf(riskProfileMTAmap.get(riskName).riskScore) != riskProfile.RawScore__c || impactValueMap.get(riskProfile.Impact__c) != riskProfile.WeightMultiplier__c || riskProfile.RiskScore__c != impactValueMap.get(riskProfile.Impact__c)* riskProfile.RawScore__c){
                                        riskProfile.RawScore__c = Double.valueOf(riskProfileMTAmap.get(riskName).riskScore);
                                        riskProfile.WeightMultiplier__c = impactValueMap.get(riskProfile.Impact__c);
                                        riskProfile.RiskScore__c = impactValueMap.get(riskProfile.Impact__c)* riskProfile.RawScore__c;      
                                        if(riskProfile.DateRiskClosed__c != null){
                                            riskProfile.RiskScore__c = 0;    
                                        }
                                        riskProfileUpdatedList.add(riskProfile);
                                    }
                                    
                                }catch(Exception ex){                                    
                                    System.debug('Exception occur while setting the values of RiskName '+riskName+' Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
                                    riskProfile.RawScore__c = 0;
                                    riskProfile.WeightMultiplier__c = 0;
                                    riskProfile.RiskScore__c = 0;
                                    riskProfileUpdatedList.add(riskProfile);
                                }
                            }            
                        }else if(riskProfile.RiskProfileType__c.equals(UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR)){
                            String fieldType = riskProfileMTAmap.get(riskName).fieldType;                            
                            if(fieldType.equals(UHGAccountConstants.INTEGER_FIELD)){
                                try{                                    
                                    if((riskProfile.WeightMultiplier__c != null && riskProfile.RiskFactorValue__c != null && riskProfile.RiskFactorValue__c.length() > 0) && riskProfileMTAmap.get(riskName).weightMultiplier != riskProfile.WeightMultiplier__c){
                                        riskProfile.WeightMultiplier__c = riskProfileMTAmap.get(riskName).weightMultiplier;
                                        riskProfile.RiskScore__c = Double.valueOf(riskProfile.RiskFactorValue__c) * riskProfileMTAmap.get(riskName).weightMultiplier;   
                                        riskProfileUpdatedList.add(riskProfile);
                                    }
                                }catch(Exception  ex){
                                    System.debug('Exception Occourred in Interger field '+fieldType);
                                    riskProfile.RiskScore__c = 0;
                                    riskProfileUpdatedList.add(riskProfile);
                                }                                
                            }else if(fieldType.equals(UHGAccountConstants.PERCENTAGE_FIELD) || fieldType.equals(UHGAccountConstants.CURRENCY_FIELD) || fieldType.equals(UHGAccountConstants.NUMEBR_FIELD)){
                                Map<string,Double> riskPickListMap = riskProfileMTAmap.get(riskName).addRiskPickListMap;                                
                                try{                                                       
                                    System.debug('riskProfile.WeightMultiplier__c'+riskProfile.WeightMultiplier__c+' filed '+fieldType);
                                    System.debug('riskProfileMTAmap.get(riskName).weightMultiplier'+riskProfileMTAmap.get(riskName).weightMultiplier+' filed '+fieldType);
                                    if(fieldType.equals(UHGAccountConstants.PERCENTAGE_FIELD)){
                                        if(riskProfile.RiskFactorValue__c != null){                                            
                                            riskProfile.RiskFactorValue__c = riskProfile.RiskFactorValue__c.replace('%','');                                         	
                                        }                                        
                                    }
                                    if(fieldType.equals(UHGAccountConstants.CURRENCY_FIELD)){
                                        if(riskProfile.RiskFactorValue__c != null){                                                                                        
                                            riskProfile.RiskFactorValue__c = riskProfile.RiskFactorValue__c.replace('$','');                                            
                                        }                                        
                                    }
                                    
                                    boolean isDataChange = false;
                                    
                                    if(riskProfile.RiskFactorValue__c != null && riskProfile.RiskFactorValue__c.length() > 0){
                                        for (String key : riskPickListMap.keySet()) {                                            
                                            if(riskProfile.WeightMultiplier__c != riskProfileMTAmap.get(riskName).weightMultiplier || riskProfile.RawScore__c != riskPickListMap.get(key)){
                                                String[] keyRangeVal = key.split(',');                                                
                                                if(keyRangeVal[1].equals('MAXLIMIT') && Double.valueOf(riskProfile.RiskFactorValue__c) >= Double.valueOf(keyRangeVal[0])){                                                    
                                                    isDataChange = true;
                                                    riskProfile.WeightMultiplier__c = riskProfileMTAmap.get(riskName).weightMultiplier;
                                                    riskProfile.RawScore__c  = riskPickListMap.get(key);
                                                    riskProfile.RiskScore__c = riskProfile.WeightMultiplier__c * riskProfile.RawScore__c;                                                                                                                                                        
                                                    break;   
                                                }else if(!keyRangeVal[1].equals('MAXLIMIT') && Double.valueOf(riskProfile.RiskFactorValue__c) >= Double.valueOf(keyRangeVal[0]) && Double.valueOf(riskProfile.RiskFactorValue__c) <= Double.valueOf(keyRangeVal[1])){                                                    
                                                    isDataChange = true;
                                                    riskProfile.WeightMultiplier__c = riskProfileMTAmap.get(riskName).weightMultiplier;
                                                    riskProfile.RawScore__c  = riskPickListMap.get(key);
                                                    riskProfile.RiskScore__c = riskProfile.WeightMultiplier__c * riskProfile.RawScore__c;                                                                                                       
                                                    break;
                                                }
                                            }
                                        } 
                                        if(fieldType.equals(UHGAccountConstants.PERCENTAGE_FIELD)){
                                            if(riskProfile.RiskFactorValue__c != null){                                                
                                                riskProfile.RiskFactorValue__c = riskProfile.RiskFactorValue__c+'%';
                                            }
                                        }
                                        if(fieldType.equals(UHGAccountConstants.CURRENCY_FIELD)){
                                            if(riskProfile.RiskFactorValue__c != null){                                                                                            
                                                riskProfile.RiskFactorValue__c = '$'+riskProfile.RiskFactorValue__c;                                                
                                            }
                                        }
                                        if(isDataChange){                                            
                                            riskProfileUpdatedList.add(riskProfile);   
                                        }                                        
                                    }else{                                        
                                        //riskProfileUpdatedList.add(riskProfile);
                                    }
                                }catch(Exception ex){
                                    System.debug('Exception occur while setting the values '+fieldType);
                                    riskProfile.RawScore__c = 0;
                                    riskProfile.WeightMultiplier__c = 0;
                                    riskProfile.RiskScore__c = 0;
                                    riskProfileUpdatedList.add(riskProfile);
                                }                                                                                     
                            }else if(fieldType.equals(UHGAccountConstants.PICKLIST_FIELD)){
                                Map<string,Double> riskPickListMap = riskProfileMTAmap.get(riskName).addRiskPickListMap;
                                if(riskPickListMap.containsKey(riskProfile.RiskFactorValue__c)){
                                    try{
                                        if(riskProfile.RawScore__c != riskPickListMap.get(riskProfile.RiskFactorValue__c) || riskProfile.WeightMultiplier__c != riskProfileMTAmap.get(riskName).weightMultiplier){
                                            riskProfile.RawScore__c = riskPickListMap.get(riskProfile.RiskFactorValue__c);
                                            riskProfile.WeightMultiplier__c = riskProfileMTAmap.get(riskName).weightMultiplier;
                                            riskProfile.RiskScore__c = riskProfile.RawScore__c * riskProfile.WeightMultiplier__c;   
                                            riskProfileUpdatedList.add(riskProfile);
                                        }                                        
                                    }catch(Exception ex){
                                        System.debug('Exception occur while setting the values '+fieldType);
                                        riskProfile.RawScore__c = 0;
                                        riskProfile.WeightMultiplier__c = 0;
                                        riskProfile.RiskScore__c = 0;
                                        riskProfileUpdatedList.add(riskProfile);
                                    }                                
                                }                            
                            }                            
                        }
                    }
                }                                
                
                if(riskProfileUpdatedList != null && riskProfileUpdatedList.size() > 0){                    
                    Database.upsert(riskProfileUpdatedList);
                }
            }else{
                throw new NoAccessException();
            }
        }catch(Exception ex){
            System.debug(ex.getTypeName() +' Occured---> '+ex.getMessage());
            throw ex;
        }
        
    }
    
    
    /******************************************************************
* 
Purpose: Query to get all the Risk Profile Releated to Account
Parameters: accountId
Returns: RiskProfileWrapperClass
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/    
    
    @AuraEnabled
    public static RiskProfileWrapperClass getRiskProfileData(Id accountId){
        System.debug('Enter <getRiskProfileData()>');
        
        RiskProfileWrapperClass riskProfileWrapperClass = new RiskProfileWrapperClass();        
        try{                
            Account accountRecord = new Account();
            accountRecord.Id = accountId;
            riskProfileWrapperClass = getRiskProfileMetaDate(null);                
            Set<String> riskTypAddRiskFacorListCopy = riskProfileWrapperClass.riskTypAddRiskFacorList.clone();
            List<RiskProfile__c> riskProfileList = new List<RiskProfile__c>();
            Set<RiskProfile__c> riskProfileAdditionRiskFactorList = new Set<RiskProfile__c>();
            Set<RiskProfile__c> riskProfileAdditionRiskFactorListInOrder = new Set<RiskProfile__c>();
            List<RiskProfile__c> riskProfileAllList = new List<RiskProfile__c>();        
            EditAccess editAccess = isEditAccesToThisUser(accountId);
            riskProfileWrapperClass.totalSize = 0;            
            Double overallRiskScore = 0;
            id id1 = userinfo.getProfileId();
            Boolean noAccess = true;
            String profileName = [select Name from profile where id =:id1].Name;
            if(profileName =='CSI Administrator' || profileName =='NA Services Community Profile' || profileName =='CSI Client Director'){
                noAccess = false;
            }
            if(schema.sobjecttype.RiskProfile__c.isaccessible() && schema.sobjecttype.RiskProfile__c.isQueryable()) {
                
                if(noAccess){
                    createAdditionalRiskFactor(accountId,riskProfileWrapperClass);                    
                }                
                riskProfileAllList = Database.query(UHGAccountSOQLConstants.QUERY_RISK_PROFILE_DATA);                
                if(noAccess){                    
                    updateRiskProfileRiskScoreValues(riskProfileAllList);
                }                
                
                System.debug('riskProfileAllList --> '+riskProfileAllList);
                
                // seperating the list based on Type and caluculating the Overall Risk Score
                for(RiskProfile__c riskProfile : riskProfileAllList){
                    accountRecord.OverallRiskScore__c = riskProfile.AccountFirm__r.OverallRiskScore__c;
                    accountRecord.SCEReviewedDate__c = riskProfile.AccountFirm__r.SCEReviewedDate__c;
                    if(riskProfile.RiskProfileType__c != null && riskProfile.RiskProfileType__c.equals(UHGAccountSOQLConstants.RISK_TRACKED_BY_SCE)){
                        if(riskProfile.RiskScore__c != null){
                            overallRiskScore += riskProfile.RiskScore__c;
                        }
                        riskProfileList.add(riskProfile);
                    }else if(riskProfile.RiskProfileType__c != null && riskProfile.RiskProfileType__c.equals(UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR)){
                        riskProfileAdditionRiskFactorList.add(riskProfile);
                    }
                }
                Map<string,RiskProfile__c> riskAddListInOrderMap = new Map<string,RiskProfile__c>();
                for(RiskProfile__c riskProfile : riskProfileAdditionRiskFactorList){
                    riskAddListInOrderMap.put(riskProfile.SCERiskTypeAddlRiskFactorType__c, riskProfile);
                }
                
                for(String riskName : riskTypAddRiskFacorListCopy){   
                    if(riskAddListInOrderMap.containsKey(riskName)){
                        if(riskAddListInOrderMap.get(riskName).RiskScore__c != null){
                            overallRiskScore += riskAddListInOrderMap.get(riskName).RiskScore__c;    
                        }                        
                        riskProfileAdditionRiskFactorListInOrder.add(riskAddListInOrderMap.get(riskName));   
                    }                     
                }                                             
                
                riskProfileWrapperClass.totalSize = (riskProfileList != null )?riskProfileList.size() : 0;
                riskProfileWrapperClass.riskProfileList = riskProfileList;                
                
                System.debug('Overall Risk Score ***** '+overallRiskScore);
                System.debug('Overall Risk Score ***** '+accountRecord.OverallRiskScore__c);
                if(noAccess){
                    if(accountRecord.OverallRiskScore__c != overallRiskScore){
                        accountRecord.OverallRiskScore__c = overallRiskScore;
                        updateAccountRiskScore(accountRecord);
                    }
                }
                //System.debug('now time******************* '+Datetime.now());
                //Integer temp = 5/0;
                
                /*  System.debug('accountRecord.SCEReviewedDate__c '+accountRecord.SCEReviewedDate__c);
if(accountRecord.SCEReviewedDate__c != null){
DateTime sceReview = accountRecord.SCEReviewedDate__c;                    
TimeZone tz = UserInfo.getTimeZone();
Datetime local = sceReview.AddSeconds(tz.getOffset(accountRecord.SCEReviewedDate__c)/1000);
accountRecord.SCEReviewedDate__c = local.date();
}  */
                
                //System.debug('accountRecord.SCEReviewedDate__c after '+accountRecord.SCEReviewedDate__c);
                
                riskProfileWrapperClass.riskProfileAccount = accountRecord;
                riskProfileWrapperClass.riskProfileAdditionRiskFactorList = riskProfileAdditionRiskFactorListInOrder;                
            }else {
                throw new NoAccessException();
            }       
        }catch(Exception ex) {
            System.debug('Exception <getRiskProfileData> ' + ex.getMessage());            
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }         
        System.debug('End <getRiskProfileData()>');
        return riskProfileWrapperClass;
    }        
    
    /******************************************************************
* 
Purpose: To check the Edit access for LoggedIn User     
Returns: Boolean
Throws [Exceptions]: NullPointerException,NoAccessException,QueryException,Exception

*******************************************************************
*/      
    @AuraEnabled    
    public static EditAccess isEditAccesToThisUser(String accountId){	
        System.debug('Enter <isEditAccesToThisUser>');        
        EditAccess editAccess = new EditAccess();
        editAccess.isEditAccess = false;
        editAccess.isParitalAccess = false;
        
        try{                                       
            if(schema.sobjecttype.User.isaccessible() && schema.sobjecttype.User.isQueryable()) {
                User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
                System.debug('user.UserRole.Name'+user.UserRole.Name);
                if(user.UserRole != null && user.UserRole.Name != null &&
                   user.UserRole.Name.trim().length() > 0) {                
                       String loggedInUserRole = user.UserRole.Name;    
                       String[] roleNames = System.Label.Risk_Profile_Allowed_Roles_For_Edit.split(',');
                       Set<String> roleNamesSet = new Set<String>(roleNames);
                       if(roleNamesSet.contains(loggedInUserRole)) {
                           editAccess.isEditAccess = true;
                       } else {
                           editAccess.isParitalAccess = UserInformationClass.hasEditAccessToRecord(accountId)                           ;
                           /*roleNames = System.Label.Risk_Profile_Not_Allowed_Roles_For_Edit.split(',');
roleNamesSet = new Set<String>(roleNames);
if(!roleNamesSet.contains(loggedInUserRole)) {                               
editAccess.isParitalAccess = true;
} */
                       }                       
                   }
            }else{
                throw new NoAccessException();
            }            
        }catch(Exception ex){
            System.debug('Exception <isEditAccesToThisUser> ' + ex.getMessage());
            throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
        }            
        System.debug('Output Parameters - editAccess-'+editAccess);
        System.debug('End <isEditAccesToThisUser>');      
        //editAccess.isEditAccess = true;
        return editAccess;
    }
    
    
    /******************************************************************
* 
Wrapper class for Returing diffrent Return Types for lighting component

*******************************************************************
*/ 
    
    public class RiskProfileWrapperClass {
        
        @AuraEnabled
        public List<RiskProfile__c> riskProfileList{ get;set; }                
        
        @AuraEnabled
        public Set<RiskProfile__c> riskProfileAdditionRiskFactorList{ get;set; }        
        
        @AuraEnabled
        public List<Risk_Profile__mdt> riskProfileOfTypeRiskTrackedbySceList{ get;set; }
        
        @AuraEnabled
        public Set<RiskProfileHelpTextWrapper> riskHelptTextSet { get;set; }
        
        @AuraEnabled
        public Set<string> riskTypePickSet { get;set; }
        
        @AuraEnabled
        public Integer totalSize { get;set; }
        
        @AuraEnabled
        public Set<string> riskTypAddRiskFacorList{ get;set; }
        
        @AuraEnabled
        public Map<string,RiskProfileMetaDataWrapperClass> riskProfileMetaDataWrapperClass { get;set; }
        
        @AuraEnabled
        public List<Risk_Profile__mdt> riskProfileOfTypeAdditionalRiskFactor{ get;set;}
        
        @AuraEnabled
        public Account riskProfileAccount { get;set;}                
    }
    
    /******************************************************************
* 
Wrapper class for EditAccess

*******************************************************************
*/ 
    public class EditAccess {
        @AuraEnabled
        public boolean isEditAccess { get;set;}
        
        @AuraEnabled
        public boolean isParitalAccess { get;set;}
    }
    
    /******************************************************************
* 
Wrapper class for Risk Profile Meta Data

*******************************************************************
*/   
    public class RiskProfileMetaDataWrapperClass {
        
        @AuraEnabled
        public Double weightMultiplier { get;set; }
        
        @AuraEnabled
        public Set<string> addInfo { get;set; }
        
        @AuraEnabled
        public Map<string,Double> addRiskPickListMap { get;set; }
        
        @AuraEnabled
        public Set<string> impact { get;set; }
        
        @AuraEnabled
        public Set<string> addRiskList { get;set; }
        
        @AuraEnabled
        public Map<string,Double> impactValueMap { get;set; }
        
        @AuraEnabled
        public string riskScore { get;set; }
        
        @AuraEnabled
        public Double rawScore { get;set; }      
        
        @AuraEnabled
        public string fieldType { get;set; }      
        
        @AuraEnabled
        public string riskProfileType { get;set; }      
        
    }
    
    public class RiskProfileHelpTextWrapper {
        @AuraEnabled
        public string riskName { get;set; }  
        
        @AuraEnabled
        public string helpText { get;set; }  
    }    
}