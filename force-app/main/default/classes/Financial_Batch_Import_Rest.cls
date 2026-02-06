/** ######################################################################################
* @author       Jnanesh
* @date         12/12/2018
* @description  This Rest Webservices is to Create or Update Financial Data
*                 
*##########################################################################################    */

@RestResource(urlMapping='/FinancialDataImport/*')
global class Financial_Batch_Import_Rest {
    
    @HttpPost 
    global static List<JsonResponse> createORUpdateFinancialRecords(List<JsonRequest> financials){        
        System.debug('Financial Import method start');
        List<JsonResponse> listOfResponses = new List<JsonResponse>();
        JsonResponse responseClass = null;
        List<Financial__c> finalUpsertData = new List<Financial__c>();
        
        Map<String,JsonRequest> medicalIdAndFinancialMap = new Map<String,JsonRequest>();
        
        Integer noRecord_Updated = 0;
        Integer noRecord_Inserted = 0;
        Integer noRecord_Failed = 0;
        Integer policyOrCompanyNotExist = 0;
        Integer noRecord_Skipped = 0;
        
        Set<String> accountIds = new set<String>();
        System.debug('Request size ==>'+financials.size());
        try{
            
            //List<String> issueAndPolicy = new Lis if(financials.size() > 0){
            
            if(financials.size() > 0){
                List<String> policyNumbersSet = new List<String>();
                for(JsonRequest rs : financials){
                    if(rs.companyId_Medical != null){                       
                        policyNumbersSet.add(rs.companyId_Medical);
						medicalIdAndFinancialMap.put(rs.externalUniqueId_Medical,rs);                        
                    }else{
                        System.debug('Policy Number Empty');  
                        policyOrCompanyNotExist++;
                    }                        
                }
                List<Policy_Information__c> PolicyInformationList = Financial_Batch_Import_Rest.queryPolicyInformation(policyNumbersSet);
                Map<String,Id> policyNumberandAccountId = new Map<String,Id>(); 	
                if(PolicyInformationList.size()>0){                               
                    //System.debug('PolicyInformationList size ==>'+PolicyInformationList.size());                            
                    for(Policy_Information__c PolicyInformation : PolicyInformationList){                        
                        if(PolicyInformation.Id != null){                            
                            policyNumberandAccountId.put(PolicyInformation.Name,PolicyInformation.Company__c);
                            if(PolicyInformation.Company__c == null){
                                System.debug('Company Not Exist for the Policy No '+PolicyInformation.Name);
                                policyOrCompanyNotExist++;
                            }
                            //System.debug('policyInformationIdandAccountId ==>'+policyNumberandAccountId);
                        }
                        if(PolicyInformation.Company__c != null){
                            accountIds.add(PolicyInformation.Company__c);
                        }
                    }
                    
                }
                Set<String> queriedPolicyNumbers = policyNumberandAccountId.keySet();
                for(String modelId : medicalIdAndFinancialMap.keySet()){
                    System.debug('Model Id'+modelId);
                	JsonRequest rs = medicalIdAndFinancialMap.get(modelId);
                    if(!queriedPolicyNumbers.contains(rs.companyId_Medical)){
                        JsonRequest issueRs = medicalIdAndFinancialMap.get(modelId);                        
                        System.debug('Policy Number does not exists in salesforce '+rs.companyId_Medical);                                  
                        responseClass = new JsonResponse('PolicyInformation',modelId,rs.companyId_Medical,issueRs.name_Medical,String.valueOf(issueRs.lastUpdated_Medical),'Policy Number does not exists in salesforce',0,0,0,0,0);
                        listOfResponses.add(responseClass);
                        policyOrCompanyNotExist = policyOrCompanyNotExist + 2;                               
                    }
                }
                
                List<Account> financialExistingData = queryFinancialInfo(accountIds);
                System.debug('Financial Existing Data==> '+financialExistingData);
                
                Map<String,List<Financial__c>> accountFinancialDataMap = new Map<String,List<Financial__c>>();
                if(financialExistingData.size()>0){   
                    for(Account compInfo : financialExistingData){
                        accountFinancialDataMap.put(compInfo.Id,compInfo.Financials__r);
                    }
                }
                System.debug('Financial Existing Data Map ==> '+accountFinancialDataMap);
              /*  Set<String> queriedPolicyNumbers = policyNumberandAccountId.keySet();
                for(String policyNum : policyNumbersSet){                    
                    if(!queriedPolicyNumbers.contains(policyNum)){
                        System.debug('Policy Number does not exists in salesforce '+policyNum);                                  
                        responseClass = new JsonResponse('PolicyInformation','',policyNum,'Policy Number does not exists in salesforce',0,0,0,0);
                        listOfResponses.add(responseClass);
                        policyOrCompanyNotExist = policyOrCompanyNotExist + 2;                               
                    }
                }*/
                
                Set<Case> caseList = new Set<Case>();
                Integer count = 0;
                Integer i = 0;               
                
                System.debug('json Request Financial==>'+financials);
                for(JsonRequest rs : financials){
                    
                    System.debug('Rs Financial==>'+rs);
                    i=i+1;
                    count=count+1;
                    
                    Financial__c financialMed = new Financial__c();
                    Financial__c financialRx = new Financial__c(); 
                    
                    Id companyId;
                    String finRxExtId = '';
                    String finMedExtId = '';
                    if(rs.companyId_Medical != null){
                    	companyId = policyNumberandAccountId.get(rs.companyId_Medical);
                    }
                    if(rs.externalUniqueId_Rx != null){
                        financialRx.External_Unique_Id__c=rs.externalUniqueId_Rx+'_RX';
                        finRxExtId = rs.externalUniqueId_Rx+'_RX';
                    }
                    if(rs.externalUniqueId_Medical != null){
                        financialMed.External_Unique_Id__c=rs.externalUniqueId_Medical;
                        finMedExtId = rs.externalUniqueId_Medical;
                    }
                    Boolean updateFinancialRx = false;
                    Boolean isNewRx = true;
                    Boolean updateFinancialMed = false;
                    Boolean isNewMed = true;
                    if(companyId != null){
                        financialRx.Company__c = companyId;
                        financialMed.Company__c = companyId; 
                        List<Financial__c> financialReletedList = accountFinancialDataMap.get(companyId);
                        system.debug('Child Financial Records : '+financialReletedList);
                        for(Financial__c fin : financialReletedList){
                            if(fin.Membership_Type__c == 'RX' && rs.year_Rx == fin.Year__c && financialRx.External_Unique_Id__c == fin.External_Unique_Id__c){
                                isNewRx = false;
                                if(rs.lastUpdated_Rx != fin.Last_Updated__c){
                                    updateFinancialRx = true;
                                    /*if(fin.External_Unique_Id__c != null){
                                        financialRx.External_Unique_Id__c = fin.External_Unique_Id__c;
                                    }*/
                                }else{
                                    updateFinancialRx = false;
                                }                                
                            }else if(fin.Membership_Type__c == 'Medical' && rs.year_Rx == fin.Year__c && rs.externalUniqueId_Medical == fin.External_Unique_Id__c){
                                isNewMed = false;
                                if(rs.lastUpdated_Rx != fin.Last_Updated__c){
                                    updateFinancialMed = true;
                                    /*if(fin.External_Unique_Id__c != null){
                                        financialMed.External_Unique_Id__c = fin.External_Unique_Id__c;
                                    }*/
                                }else{
                                    updateFinancialMed = false;
                                }                                
                            }
                            if(isNewRx == false && isNewMed == false){
                                break;
                            }
                        }                       					                      
                    } 
                    
                    
                    if(updateFinancialRx || isNewRx){  
                        if(rs.membership_Rx != null && (rs.membership_Rx).trim() != ''){
                            financialRx.Membership__c = Decimal.valueOf(rs.membership_Rx);
                        }if(rs.totExpRx_Rx != null && (rs.totExpRx_Rx).trim() != ''){
                            financialRx.TotExpRx__c=Decimal.valueOf(rs.totExpRx_Rx);
                        }if(rs.revenue_Rx != null && (rs.revenue_Rx).trim() != ''){
                            financialRx.Revenue__c=Decimal.valueOf(rs.revenue_Rx);
                            financialRx.TotExp__c =Decimal.valueOf(rs.revenue_Rx);
                        }if(rs.year_Rx != null){
                            financialRx.Year__c=rs.year_Rx;
                        }if(rs.lastUpdated_Rx != null){
                            financialRx.Last_Updated__c=rs.lastUpdated_Rx;
                        }if(rs.name_Rx != null){
                            financialRx.name =rs.name_Rx;
                        }                   
                        system.debug('Company Id : '+companyId);
                        financialRx.Membership_Type__c = 'RX';
                        if(companyId != null){
                        	finalUpsertData.add(financialRx);
                        }
                    }else{
                        noRecord_Skipped++;
                    }
                    
                    system.debug('Financial Rx Object : '+financialRx);
                    if(updateFinancialMed || isNewMed){
                        if(rs.margin_Medical != null && (rs.margin_Medical).trim() != ''){
                            financialMed.Margin__c = Decimal.valueOf(rs.margin_Medical);
                        }if(rs.currentYear_Medical != null && (rs.currentYear_Medical).trim() != ''){
                            financialMed.Current_Year__c=Decimal.valueOf(rs.currentYear_Medical);
                        }if(rs.membership_Medical != null && (rs.membership_Medical).trim() != ''){
                            financialMed.Membership__c=Decimal.valueOf(rs.membership_Medical);
                        }if(rs.revenue_Medical != null && (rs.revenue_Medical).trim() != ''){
                            financialMed.Revenue__c=Decimal.valueOf(rs.revenue_Medical);
                        }if(rs.lastUpdated_Medical != null){
                            financialMed.Last_Updated__c=rs.lastUpdated_Medical;
                        }if(rs.year_Medical != null){
                            financialMed.Year__c=rs.year_Medical;
                        }if(rs.name_Medical != null){
                            financialMed.name =rs.name_Medical;
                        }if(rs.dealYears_Medical != null && (rs.dealYears_Medical).trim() != ''){
                            financialMed.Deal_years__c=Decimal.valueOf(rs.dealYears_Medical);
                        }                    
                        financialMed.Membership_Type__c = 'Medical';
                        if(companyId != null){
                        	finalUpsertData.add(financialMed);
                        }
                    }else{
                        noRecord_Skipped++;
                    }
                    system.debug('Financial Medical Object : '+financialMed);
                }
                if(finalUpsertData.size()>0){
                    //List<Case> updateIssuesList = new List<Case>();                    
                    //updateIssuesList.addAll(financial_UpdateList);
                    System.debug('Upsert Object ==>' +finalUpsertData);
                    Schema.SObjectField extId = Financial__c.Fields.External_Unique_Id__c;
                    Database.UpsertResult [] srList = Database.upsert(finalUpsertData,extId, false);                   
                    Integer c = 0;
                    // Iterate through each returned result
                    for (Database.UpsertResult sr : srList) {
                        //System.debug('Each Sr ==>' +finalUpsertData[c].get('External_Unique_Id__c'));
                        if (sr.isSuccess()) {
                            if(sr.isCreated()){
                                noRecord_Inserted++;
                                System.debug('Successfully created Issue records. Issue ID: ' + sr.getId());  
                            }else{
                                noRecord_Updated++;
                                System.debug('Successfully updated Issue records. Issue ID: ' + sr.getId());  
                            }                                                                             
                        } else {
                            // Operation failed, so get all errors                
                            for(Database.Error err : sr.getErrors()) {
                                noRecord_Failed++;
                                //System.debug('The following error has occurred while updating issue record ==>.'+finalUpsertData[c].get('External_Unique_Id__c'));                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('Issue fields that affected this error: ' + err.getFields());
                                String model_Id = 'Model Id Not Specified';
                                String customErrorMsg = '';
                                if(finalUpsertData[c].get('External_Unique_Id__c') != null){
                                    model_Id = String.valueOf(finalUpsertData[c].get('External_Unique_Id__c'));
                                    String mod_id;                                   
                                    if(model_Id.endsWith('_RX')){
                                        mod_id = model_Id.substringBefore('_RX');
                                    }else{
                                        mod_id = model_Id;
                                    }
                                    JsonRequest issueRs = medicalIdAndFinancialMap.get(mod_id);
                                    if(err.getMessage() != null && err.getMessage().contains('Attempting to update (as part of an upsert) parent field Company__c with new value')){
                                        String isId = '';
                                        if(issueRs != null){
                                            isId = issueRs.companyId_Medical;
                                        }
                                        customErrorMsg = ': Policy number '+isId+' is associated with multiple companies.';
                                    }
                                    if(issueRs != null){
                                        responseClass = new JsonResponse('Issue',model_Id,issueRs.companyId_Medical,issueRs.name_Medical,String.valueOf(issueRs.lastUpdated_Medical),err.getMessage()+' '+customErrorMsg,0,0,0,0,0);                                     	   
                                    }else{
                                        responseClass = new JsonResponse('Issue',model_Id,'','','',err.getMessage()+' '+customErrorMsg,0,0,0,0,0);
                                    } 
                                }                                 
                                listOfResponses.add(responseClass);
                            }
                        }
                        c++;
                    }                                                                            
                }else{
                    System.debug('No issue records to update');
                }             
            }
        }catch(Exception e){
            System.debug('error occurred in Main method ==>' + e.getMessage());
            responseClass = new JsonResponse('Error occurred in Main method','','','','',e.getMessage(),0,0,0,0,0);
            listOfResponses.add(responseClass);
            
        }
        System.debug('queryPolicyInfo method End');
        responseClass = new JsonResponse('RequestResult','','','','','',noRecord_Inserted,noRecord_Updated,noRecord_Failed,policyOrCompanyNotExist,noRecord_Skipped);
        listOfResponses.add(responseClass);
        System.debug('Inserted '+noRecord_Inserted+' Updated '+noRecord_Updated+' Failed '+noRecord_Failed+' Policy Not Exist '+policyOrCompanyNotExist+' No of records skipped '+noRecord_Skipped);
 
        return listOfResponses;
    }
    
    public static List<Policy_Information__c> queryPolicyInformation(List<String> policyIdList){
        System.debug('queryPolicyInformation method start');
        
        List<Policy_Information__c> PolicyInformationList = new List<Policy_Information__c>();
        try{
            System.debug('policyNumbersSet in separate method ==>'+policyIdList);
            PolicyInformationList = [SELECT Id, Name, Company__c FROM Policy_Information__c Where Name IN:policyIdList];
            
            System.debug('after querying PolicyInformationList==>'+PolicyInformationList);
            
        }catch(Exception e) {
            System.debug('An error has occurred: while querying policyInformation' + e.getMessage());
            
        }
        System.debug('queryPolicyInformation method end');
        return PolicyInformationList;
    }
    
    public static List<Account> queryFinancialInfo(Set<String> companyIdList){
        System.debug('queryPolicyInformation method start');
        
        List<Account> accountInformationList = new List<Account>();
        try{
            System.debug('Account Ids Set in separate method ==>'+companyIdList);
            accountInformationList = [select id, (select id, Year__c,Last_Updated__c,Membership_Type__c,External_Unique_Id__c from Financials__r) from account where id IN:companyIdList];                        
            
        }catch(Exception e) {
            System.debug('An error has occurred: while querying policyInformation' + e.getMessage());
            
        }
        System.debug('queryPolicyInformation method end');
        return accountInformationList;
    }
    
    
    global class JsonRequest {        
        global String medicalModel_Id;
        global String membership_Rx;        
        global String totExpRx_Rx;
        global String revenue_Rx;
        global String totExp_Rx;       
        global Date year_Rx;
        global String name_Rx;
        global String externalUniqueId_Rx;
        global String membershipType_Rx;        
        global Date lastUpdated_Rx;
        global String company_Rx;
        global String margin_Medical;
        global String currentYear_Medical;
        global String membership_Medical;
        global String revenue_Medical;
        global String externalUniqueId_Medical;
        global Date year_Medical;
        global String name_Medical;
        global String dealYears_Medical;
        global Date lastUpdated_Medical;
        global String companyId_Medical;
    }
    
    global class JsonResponse {
        public String objectName;
        public String modelId;
        public String id;
        public String errorMessage;
        public String customer;
        public String dts;
        public Integer noRecord_Updated;
        public Integer noRecord_Inserted;
        public Integer noRecord_Failed;
        public Integer policyNoAccNotExist;
        public Integer noRecord_Skipped;
        
        public JsonResponse(String objectName,String modelId, String id,String customer,String dts,String errorMessage,Integer noRecord_Inserted,Integer noRecord_Updated,Integer noRecord_Failed,Integer policyNoAccNotExist,Integer noRecord_Skipped) {
            this.objectName = objectName;
            this.modelId = modelId;
            this.id = id;
            this.errorMessage = errorMessage;
            this.customer = customer;
            this.dts = dts;
            this.noRecord_Inserted = noRecord_Inserted;
            this.noRecord_Updated = noRecord_Updated;
            this.noRecord_Failed = noRecord_Failed;
            this.policyNoAccNotExist = policyNoAccNotExist;
            this.noRecord_Skipped = noRecord_Skipped;
        }
    }                          
    
}