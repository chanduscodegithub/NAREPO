global class RiskProfileBatch implements Database.Batchable<Sobject>, Database.Stateful{

    global Map<String,String> accountFailureList {get;set;}
    global Map<String,String> riskProfileFailureList {get;set;}
    
    global RiskApexController.RiskProfileWrapperClass riskProfileWrapperClass {get;set;}
        
    global Set<String> accountIdList {get;set;}
    
    global RiskProfileBatch(Set<String> accountIdList){
        this.accountIdList = accountIdList;
    }
    
    global Database.QueryLocator start(Database.BatchableContext BC) {                        
        riskProfileWrapperClass = RiskApexController.getRiskProfileMetaDate(null);
        return Database.getQueryLocator('Select Id, SCEReviewedDate__c, OverallRiskScore__c,(SELECT RiskProfileType__c, RiskFactorValue__c, AdditionalInformation1__c, Comments__c, DateRiskClosed__c, DateRiskAdded__c, DateRiskModified__c, RawScore__c, RiskFactorasof__c, RiskScore__c, SCERiskTypeAddlRiskFactorType__c, WeightMultiplier__c, Impact__c, ExternalUniqueID__c, Id, Name, AccountFirm__c,AccountFirm__r.OverallRiskScore__c,AccountFirm__r.SCEReviewedDate__c FROM Risk_Profiles__r) from Account where Id IN :accountIdList');        
    }
    global void execute(Database.BatchableContext BC,List<Sobject> sobjectList) {             
        getRiskProfileData(sobjectList);
    }  
    
    global void finish(Database.BatchableContext BC) {
        System.debug('Finish');		        
    }
    
    public void getRiskProfileData(List<Account> accountList){
        System.debug('Start - getRiskProfileData(');
        List<Account> updateAccountList = new List<Account>();
        List<RiskProfile__c> updateRiskProfileList = new List<RiskProfile__c>();
        for(Account acc : accountList){
            try{                
                Account accountRecord = new Account();
                accountRecord.Id = acc.Id;                          
                System.debug('Account Id '+accountRecord.Id);
                System.debug('SubType'+accountRecord.SubType__c);
                Set<String> riskTypAddRiskFacorListCopy = riskProfileWrapperClass.riskTypAddRiskFacorList.clone();
                List<RiskProfile__c> riskProfileList = new List<RiskProfile__c>();
                Set<RiskProfile__c> riskProfileAdditionRiskFactorList = new Set<RiskProfile__c>();
                Set<RiskProfile__c> riskProfileAdditionRiskFactorListInOrder = new Set<RiskProfile__c>();                
                List<RiskProfile__c> riskProfileAllList = acc.getSobjects('Risk_Profiles__r');                
                riskProfileWrapperClass.totalSize = 0;            
                Double overallRiskScore = 0;
                
                
                LIST<RiskProfile__c> inserAdditionRiskProfileList = new LIST<RiskProfile__c>();
                
                if(riskProfileAllList != null && !riskProfileAllList.isEmpty()){
                    for(RiskProfile__c riskProfile : riskProfileAllList){                    
                        if(riskTypAddRiskFacorListCopy.contains(riskProfile.SCERiskTypeAddlRiskFactorType__c)){
                            riskTypAddRiskFacorListCopy.remove(riskProfile.SCERiskTypeAddlRiskFactorType__c);
                        }
                    }
                }  
                
                // System.debug('riskTypAddRiskFacorList --> '+riskTypAddRiskFacorListCopy);
                for(String SCERiskTypeAddlRiskFactorType : riskTypAddRiskFacorListCopy){
                    RiskProfile__c riskProfile = new RiskProfile__c();                    
                    riskProfile.SCERiskTypeAddlRiskFactorType__c = SCERiskTypeAddlRiskFactorType;
                    riskProfile.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
                    riskProfile.AccountFirm__c = acc.Id;
                    Double rawScoreDefaultVal = 0.00;
                    riskProfile.RiskScore__c = rawScoreDefaultVal;
                    inserAdditionRiskProfileList.add(riskProfile);
                }                                                               
                updateRiskProfileList.addAll(inserAdditionRiskProfileList);     
                updateRiskProfileRiskScoreValues(riskProfileAllList,updateRiskProfileList);                    
                //System.debug('updateRiskProfileList*******'+updateRiskProfileList);
                
                if(riskProfileAllList != null && !riskProfileAllList.isEmpty()){
                    for(RiskProfile__c riskProfile : riskProfileAllList){    
                        
                        if(riskProfile.RiskProfileType__c != null && riskProfile.RiskProfileType__c.equals(UHGAccountSOQLConstants.RISK_TRACKED_BY_SCE)){
                            System.debug('riskProfile 1 '+riskProfile);
                            if(riskProfile.RiskScore__c != null){
                                overallRiskScore += riskProfile.RiskScore__c;
                            }                            
                        }else if(riskProfile.RiskProfileType__c != null && riskProfile.RiskProfileType__c.equals(UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR)){
                            System.debug('riskProfile 2 '+riskProfile);
                            if(riskProfileWrapperClass.riskTypAddRiskFacorList.contains(riskProfile.SCERiskTypeAddlRiskFactorType__c) && riskProfile.RiskScore__c != null){
                                overallRiskScore += riskProfile.RiskScore__c;
                            }
                        }
                    }
                }
                
                accountRecord.OverallRiskScore__c = overallRiskScore;
                updateAccountList.add(accountRecord);                    
            }catch(Exception ex) {
                System.debug('Line Number <getRiskProfileData> ' + ex.getLineNumber());  
                System.debug('Exception <getRiskProfileData> ' + ex.getMessage());            
                throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
            }         
            System.debug('End - getRiskProfileData(');   
        }                           
        System.debug('updateAccountList '+updateAccountList);
        List<Database.SaveResult> saveAccountResults =  Database.update(updateAccountList,true);
        for(Database.SaveResult saveResult : saveAccountResults){
            if(!saveResult.isSuccess()) {
                for(Database.Error err : saveResult.getErrors()) {                    
                    System.debug('Error Message - ' + err.getMessage()+' Id '+saveResult.getId());   
                    accountFailureList.put(saveResult.getId(), err.getMessage());
                }
            }
        }
        List<Database.UpsertResult> upsertRiskProfileResults =  Database.upsert(updateRiskProfileList,true);
        for(Database.UpsertResult upsertResult : upsertRiskProfileResults){
            if(!upsertResult.isSuccess()) {
                for(Database.Error err : upsertResult.getErrors()) {                    
                    System.debug('Error Message - ' + err.getMessage()+' Id '+upsertResult.getId());     
                    riskProfileFailureList.put(upsertResult.getId(), err.getMessage());
                }
            }
        }      
    }    
    public void updateRiskProfileRiskScoreValues(List<RiskProfile__c> riskProfileAllList,List<RiskProfile__c> updateRiskProfileList){
        try{                        
            Map<String,RiskApexController.RiskProfileMetaDataWrapperClass> riskProfileMTAmap= riskProfileWrapperClass.riskProfileMetaDataWrapperClass;
                        
            List<RiskProfile__c> riskProfileUpdatedList = new List<RiskProfile__c>();
            
            if(schema.sobjecttype.RiskProfile__c.isaccessible() && schema.sobjecttype.RiskProfile__c.isQueryable()) {                
                if(riskProfileAllList != null && !riskProfileAllList.isEmpty()){
                    for(RiskProfile__c riskProfile : riskProfileAllList){                    
                        if(riskProfileMTAmap.containsKey(riskProfile.SCERiskTypeAddlRiskFactorType__c)){
                            
                            String riskName = riskProfile.SCERiskTypeAddlRiskFactorType__c;                        
                            
                            if(riskProfile.RiskProfileType__c.equals(UHGAccountSOQLConstants.RISK_TRACKED_BY_SCE)){
                                Map<string,Double> impactValueMap = riskProfileMTAmap.get(riskName).impactValueMap;
                                if(impactValueMap.containsKey(riskProfile.Impact__c)){
                                    try{
                                        System.debug('riskName object : '+riskName);
                                        System.debug('riskName object riskProfileMTAmap.get(riskName) : '+riskProfileMTAmap.get(riskName));
                                        if(Double.valueOf(riskProfileMTAmap.get(riskName).riskScore) != riskProfile.RawScore__c || impactValueMap.get(riskProfile.Impact__c) != riskProfile.WeightMultiplier__c){
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
                                        }                                
                                    }                            
                                }                            
                            }
                        }
                    }                                
                }
                if(riskProfileUpdatedList != null && riskProfileUpdatedList.size() > 0){                    
                    updateRiskProfileList.addAll(riskProfileUpdatedList);
                }
            }
        }catch(Exception ex){
            System.debug(ex.getTypeName() +' Occured---> '+ex.getMessage());
            throw ex;
        }
        
    }
   
}