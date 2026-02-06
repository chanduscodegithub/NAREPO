/****************************************************************************************************
Name    :  calculateNpsController    
Purpose :  my Customer Satisfaction Data Sheet Report Controller
Author  :  Samarth Nadig                                 Date : 27-Oct-2020                                  

Version      Author                   Date                 Release #           Purpose   
------------------------------------------------------------------------------------------------------
1.0 -        Samarth Nadig           27-Oct-2020    	                   Initial Development             
1.1 -                       
*****************************************************************************************************/
public with sharing class calculateNpsController {
    public static String SALES_SEASON_PREFIX = 'IY';
    public static String SALES_SEASON_INFIX = ', 1/1/';
    @AuraEnabled(cacheable=true)
    public static List<SelectOption> fetchPicklist() {
        List<SelectOption> options = new List<SelectOption>();
        
        Integer startYear = Integer.valueOf([SELECT DeveloperName, Value__C
                                             FROM ICM_Report_Setting__mdt 
                                             WHERE DeveloperName ='Report_Start_Year'].Value__c)+1; //2019
        
        Integer currentYear = Date.today().year();
        Integer currentMonth = Date.today().month();
        String salesCycle = '';
        while (startYear <= currentYear+1) {
            salesCycle = SALES_SEASON_PREFIX + String.valueOf(startYear-2000) + SALES_SEASON_INFIX + String.valueOf(startYear-1999);
            options.add(new SelectOption(salesCycle, salesCycle));
            startYear++;
        }
        
        return options;
    }
    
    public class SelectOption {
        public SelectOption(String value, String label) {
            this.value = value;
            this.label = label;
        }
        @AuraEnabled
        public String label { get;set; }
        @AuraEnabled
        public String value { get;set; }
    }
    
    @AuraEnabled
    public static List<calculateNpsWrapper> clientSurveyResultsData(String SalesCycle, String SortByOrder, String SortByColumnName){
        //system.debug('SalesCycle '+SalesCycle);
        //system.debug('SortByOrder '+SortByOrder);
        //system.debug('SortByColumnName '+SortByColumnName);
        Id currentUserId = UserInfo.getUserId();
        List<CM_Account_Team_History__c> naSalesTeamList = new List<CM_Account_Team_History__c>();
        Set<Id> accId = new Set<Id>();
        List<ClientSurveyResults__c> csrList = new List<ClientSurveyResults__c>();
        List<calculateNpsWrapper> calcNpsWrapList = new List<calculateNpsWrapper>();
        String salesCycleFromBackEnd = '';
        Integer currentYear;
        Integer previousYear;
        
        User userDetails =[SELECT Id, Name, Email, VPCR__c, Profile.Name, UserRole.Name FROM User where Id=:currentUserId ];
        
        Map<String,String> icmReportSettingMap=new Map<String,String>();
        List<String> lst=new List<String>();
        lst.add('Report_Default_Month');
        lst.add('Report_Start_Year');
        
        List<ICM_Report_Setting__mdt> icmReportSettingList=[Select DeveloperName,Value__c from ICM_Report_Setting__mdt where
                                                            DeveloperName in: lst];
        
        for(ICM_Report_Setting__mdt eachICMReportSetting:icmReportSettingList){
            icmReportSettingMap.put(eachICMReportSetting.DeveloperName,eachICMReportSetting.Value__c);
        }
        
        if(SalesCycle == ''){
            //system.debug('Entering SalesCycle Null');
            Date todayDate = System.today();
            
            String defaultSalesSeason='';
            defaultSalesSeason=GrowthIncentiveCompensationController.getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'), icmReportSettingMap.get('Report_Default_Month'));
            
            String subString1 = defaultSalesSeason.substring(2,4);
            previousYear = Integer.valueOf(String.valueOf(20)+subString1);
            
            String subString2 = defaultSalesSeason.substring(10);
            currentYear = Integer.valueOf(String.valueOf(20)+subString2);
            
            salesCycleFromBackEnd = SALES_SEASON_PREFIX+subString1+SALES_SEASON_INFIX+subString2;
            
            SortByOrder='Asc';
            SortByColumnName = 'Account__r.Name';
        }
        else{
            //system.debug('Entering SalesCycle not null');
            salesCycleFromBackEnd = SalesCycle;
            
            String subString1 = salesCycleFromBackEnd.substring(2,4);
            previousYear = Integer.valueOf(String.valueOf(20)+subString1);
            
            String subString2 = salesCycleFromBackEnd.substring(10);
            currentYear = Integer.valueOf(String.valueOf(20)+subString2);
        }        
        //system.debug('Current Year '+currentYear);
        //system.debug('Previous Year '+previousYear);
        
        //-----------------------------------------------------------SORTING-----------------------------------------------------------
        
        if(SortByOrder == '' && SortByColumnName ==''){
            SortByOrder = 'Asc';
            SortByColumnName = 'Account__r.Name';
        }
        
        //-----------------------------------------------------------SORTING-----------------------------------------------------------
        
        naSalesTeamList = [SELECT Id, Account_Firm__r.Name, Case_Management_Start_Date__c, Case_Management_End_Date__c
                           FROM CM_Account_Team_History__c
                           WHERE User__c =: currentUserId WITH USER_MODE ORDER BY Case_Management_Start_Date__c, Case_Management_End_Date__c];        
        //system.debug('naSalesTeamList '+naSalesTeamList);
        //system.debug('Logged In Role '+userDetails.UserRole.Name);
        
        //----------FOR SCE----------
        //New Role Specialty Benefits SCE added - SAMARTH 
        if(userDetails.UserRole.Name == 'CM SCE' || userDetails.UserRole.Name == 'Surest CM SCE' || userDetails.UserRole.Name == 'Surest CM SVP' || userDetails.UserRole.Name == 'Specialty Benefits SCE'){
            //system.debug('Entering SCE');
            csrList = [Select id,Account__c,Account__r.Name, Year__c, LikelihoodtoRecommendScore__c,NetPromoterType__c,Fully_Termed_Client__c,Subtype__c,SCE__c,SCE__r.Name, Overall_Satisfaction_with_SCE_Score__c from ClientSurveyResults__c where Type__c = 'Client Survey Results' 
                       AND ((Year__c =: String.valueOf(previousYear) AND SCE__c =: currentUserId) OR Year__c =: String.valueOf(previousYear-1)) WITH USER_MODE];          
        }
        
        //----------FOR VPCR----------
        if(userDetails.VPCR__c == TRUE){
            //system.debug('Entering VPCR');
            csrList = [Select id,Account__c,Account__r.Name, Year__c, LikelihoodtoRecommendScore__c,NetPromoterType__c,Fully_Termed_Client__c,Subtype__c,SCE__c,SCE__r.Name, Overall_Satisfaction_with_SCE_Score__c from ClientSurveyResults__c where Type__c = 'Client Survey Results' 
                       AND ((Year__c =: String.valueOf(previousYear) AND VPCRRVP__c =: currentUserId) OR Year__c =: String.valueOf(previousYear-1)) WITH USER_MODE];
        }
        
        //----------FOR RVP----------
        if(userDetails.UserRole.Name == 'CM VPCR/RVP' && userDetails.VPCR__c == FALSE){
            csrList = [Select id,Account__c,Account__r.Name, Year__c, LikelihoodtoRecommendScore__c,NetPromoterType__c,Fully_Termed_Client__c,Subtype__c,SCE__c,SCE__r.Name, Overall_Satisfaction_with_SCE_Score__c 
                       from ClientSurveyResults__c where Type__c = 'Client Survey Results' 
                       AND ((Year__c =: String.valueOf(previousYear) AND VPCRRVP__c =: currentUserId) OR Year__c =: String.valueOf(previousYear-1)) WITH USER_MODE];   
        }
        
        system.debug('userDetails.UserRole.Name = '+userDetails.UserRole.Name+' previousYear = '+previousYear+' currentUserId'+currentUserId+'csrList = '+csrList.size());
        
        Map<String,List<ClientSurveyResults__c>> accVsCsrRvpMap = new Map<String,List<ClientSurveyResults__c>>();
        system.debug(csrList.size());
        if(csrList.size()>0){
            for(ClientSurveyResults__c csr:csrList){
                //system.debug('NPT - '+csr.NetPromoterType__c);
                if(accVsCsrRvpMap.containsKey(csr.Account__r.Name)){
                    List<ClientSurveyResults__c> tempList = accVsCsrRvpMap.get(csr.Account__r.Name);
                    tempList.add(csr);
                    accVsCsrRvpMap.put(csr.Account__r.Name,tempList);
                }
                else{
                    accVsCsrRvpMap.put(csr.Account__r.Name,new List<ClientSurveyResults__c>{csr});
                }
            }
        }
        List<sortWrapperData> sortedList = new List<sortWrapperData>();
        if(!accVsCsrRvpMap.isEmpty()){
            for(String accName: accVsCsrRvpMap.keySet()){
                calculateNpsWrapper wrapObj = new calculateNpsWrapper();
                
                wrapObj.salesCycleBackEnd = salesCycleFromBackEnd;
                wrapObj.thisYear = currentYear;
                wrapObj.prevYear = previousYear;
                
                if(userDetails.VPCR__c == FALSE && userDetails.UserRole.Name == 'CM VPCR/RVP'){
                    wrapObj.userRole = 'rvp';
                }
                else{
                    //system.debug('Entering non Rvp');
                    wrapObj.userRole = 'nonRvp';
                }
                
                for(ClientSurveyResults__c csr:accVsCsrRvpMap.get(accName)){
                    if(csr.Year__c == String.valueOf(previousYear)){
                        wrapObj.currentYearRecordId = csr.Id; 
                        if(accName != NULL){
                            wrapObj.accountName = accName;
                        }
                        //ICM 2021 - SAMARTH
                        if(csr.Overall_Satisfaction_with_SCE_Score__c != NULL){
                            wrapObj.currentOverallSatisfactionWithSceScore = csr.Overall_Satisfaction_with_SCE_Score__c;
                        }
                        //ICM 2021 - SAMARTH
                        if(csr.Account__c != NULL){
                            wrapObj.companyLink = '/'+ String.valueOf(csr.Account__c);
                        }
                        if(csr.LikelihoodtoRecommendScore__c != NULL){
                            wrapObj.currentYearLikelihood = csr.LikelihoodtoRecommendScore__c;
                        }
                        if(csr.NetPromoterType__c != NULL){
                            wrapObj.currentNetPromoterType = csr.NetPromoterType__c;
                        }
                        if(csr.Fully_Termed_Client__c == TRUE){
                            wrapObj.fullyTermedClient = csr.Fully_Termed_Client__c;
                        }
                        if(csr.Subtype__c == 'Specialty Benefits Only'){
                            wrapObj.isSpecialityBenefit = TRUE;
                        }
                        if(csr.Subtype__c != 'Specialty Benefits Only'){
                            wrapObj.isSpecialityBenefit = FALSE;
                        }
                        if(csr.SCE__c != NULL){
                            wrapObj.currentSce = csr.SCE__r.Name;
                        }
                    }
                    if(csr.Year__c == String.valueOf(previousYear-1)){ 
                        if(accName != NULL){
                            wrapObj.accountName = accName;
                        }
                        //ICM 2021 - SAMARTH
                        if(csr.Overall_Satisfaction_with_SCE_Score__c != NULL){
                            wrapObj.priorOverallSatisfactionWithSceScore = csr.Overall_Satisfaction_with_SCE_Score__c;
                        }
                        //ICM 2021 - SAMARTH
                        if(csr.Account__c != NULL){
                            wrapObj.companyLink = '/'+ String.valueOf(csr.Account__c);
                        }
                        if(csr.LikelihoodtoRecommendScore__c != NULL){
                            wrapObj.previousYearLikelihood = csr.LikelihoodtoRecommendScore__c;
                        }
                        if(csr.NetPromoterType__c != NULL){
                            wrapObj.previousNetPromoterType = csr.NetPromoterType__c;
                        }
                    }
                }
                
                for(CM_Account_Team_History__c cmat:naSalesTeamList){
                    if(cmat.Account_Firm__r.Name == accName){
                        if(cmat.Case_Management_Start_Date__c != null){
                            wrapObj.cmStartDate = cmat.Case_Management_Start_Date__c.format();
                        }
                        if(cmat.Case_Management_End_Date__c == null){
                            wrapObj.cmEndDate = '';
                        }
                        else if(cmat.Case_Management_End_Date__c != null){
                            wrapObj.cmEndDate = cmat.Case_Management_End_Date__c.format();
                        }
                    }
                }                               
                calcNpsWrapList.add(wrapObj); 
                sortedList.add(new sortWrapperData(wrapObj));                
            }
            List<calculateNpsWrapper>  sortedListFinal = new List<calculateNpsWrapper>(); 
            if(SortByOrder == 'Asc'){
                sortOrder = 'acs';
            }else{
                sortOrder = 'dsc';
            }           
            compareField = SortByColumnName;
            sortedList.sort();
            
            for(sortWrapperData swd:sortedList){
                sortedListFinal.add(swd.wrapperData);
            }
            system.debug('sortedListFinal '+sortedListFinal);
            return sortedListFinal;
            //return calcNpsWrapList;
        }
        else{
            calculateNpsWrapper wrapObj = new calculateNpsWrapper();
            
            wrapObj.salesCycleBackEnd = salesCycleFromBackEnd;
            wrapObj.thisYear = currentYear;
            wrapObj.prevYear = previousYear;
            
            if(userDetails.VPCR__c != TRUE && userDetails.UserRole.Name == 'CM VPCR/RVP'){
                wrapObj.userRole = 'rvp';
            }
            else{
                wrapObj.userRole = 'nonRvp';
            }
            
            calcNpsWrapList.add(wrapObj);                      
            system.debug('calcNpsWrapList '+calcNpsWrapList);
            return calcNpsWrapList;
        }
        
    }
    
    @AuraEnabled 
    public static NPSWrapper getTemplateInXML(String loggedInUserRole){   
        system.debug('user role print '+loggedInUserRole);
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString='SELECT Id, Body, BodyLength, Name FROM StaticResource where ';
        String objectName  = ''; 
        StaticResource sr;
        boolean isLoggedInUserVPCR=false;
        
        User userData = [Select Id,UserRole.Name,Profile.Name,Profile.UserLicense.Name,VPCR__c from User where Id=:UserInfo.getUserId()];
        if(userData!=null) {
            isLoggedInUserVPCR=userData.VPCR__c;
        }
        String loggedInUserRole2 = userData.UserRole.Name;
        system.debug('User Role '+loggedInUserRole2);
        //system.debug('User Role '+loggedInUserRole2);
        //system.debug('isLoggedInUserVPCR '+isLoggedInUserVPCR);
        
        //FOR RVP
        if(loggedInUserRole2=='CM VPCR/RVP' && !isLoggedInUserVPCR){
            //system.debug('Entering rvp');
            queryString=queryString+'Name = \'NPS_RVP\' ';
        }
        //FOR VPCR
        else if(loggedInUserRole2=='CM VPCR/RVP' && isLoggedInUserVPCR){
            //system.debug('Entering vpcr');
            queryString=queryString+'Name = \'NPS_Non_RVP\' ';
        }
        
        //-------ICM2021 - SAMARTH-------
        else if(loggedInUserRole2=='Specialty Benefits SCE'){
            queryString=queryString+'Name = \'NPS_Non_RVP\' ';
        }
        //-------ICM2021 - SAMARTH-------
        
        //FOR SCE
        else{
            //system.debug('Entering sce');
            queryString=queryString+'Name = \'NPS_SCE\' ';
        }
        
        sr = Database.query(queryString);
        String xmlBodyString = sr.body.toString();
        
        Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        //System.debug('matcher '+m);
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();    
            
            //system.debug('before replace prefix : '+itag);
            itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            //System.debug('itag '+itag);
            System.debug('itag value '+itag);
            Integer dotFirstIndex = itag.indexOf('.');
            objectName = itag.substring(0,dotFirstIndex);
            String fieldName = itag.substring(dotFirstIndex+1);
            
            // System.debug('iTagFormatField '+iTagFormatField);
            
            if(objectItagesMap.containsKey(objectName)){
                Set<String> itagSet =  objectItagesMap.get(objectName);                    
                itagSet.add(fieldName);
                objectItagesMap.put(objectName, itagSet);
                
            }else{
                Set<String> itagSet = new Set<String>();
                itagSet.add(fieldName);      
                //System.debug('objectName  -> '+objectName);                     
                objectItagesMap.put(objectName, itagSet);
            }                         
            
        }  
        
        
        npsWrap.xmlString = xmlBodyString;       
        npsWrap.objectItags = objectItagesMap;
        
        return npsWrap;
    }
    
    public class calculateNpsWrapper{
        @AuraEnabled
        public Integer thisYear {get;set;}
        
        @AuraEnabled
        public Integer prevYear {get;set;}
        
        @AuraEnabled
        public String salesCycleBackEnd {get;set;}
        
        @AuraEnabled
        public String currentYearRecordId {get;set;}
        
        @AuraEnabled
        public String accountId {get;set;}
        
        @AuraEnabled
        public String accountName {get;set;}
        
        @AuraEnabled
        public String companyLink {get;set;}
        
        @AuraEnabled
        public String currentYearLikelihood {get;set;}
        
        @AuraEnabled
        public String previousYearLikelihood {get;set;}
        
        @AuraEnabled
        public String currentNetPromoterType {get;set;}
        
        @AuraEnabled
        public String previousNetPromoterType {get;set;}
        
        //---------------For sending user role to lwc---------------
        @AuraEnabled
        public String userRole {get;set;}
        //---------------For sending user role to lwc---------------
        
        @AuraEnabled
        public String cmStartDate {get;set;}
        
        @AuraEnabled
        public String cmEndDate {get;set;}
        
        @AuraEnabled
        public Boolean fullyTermedClient {get;set;}
        
        @AuraEnabled
        public Boolean isSpecialityBenefit {get;set;}
        
        @AuraEnabled
        public String currentSce {get;set;}
        
        @AuraEnabled
        public String currentOverallSatisfactionWithSceScore {get;set;} //ICM 2021 - SAMARTH
        
        @AuraEnabled
        public String priorOverallSatisfactionWithSceScore {get;set;} //ICM 2021 - SAMARTH
    }
    
    public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }  
    }      
    
    public static String compareField {get; set;}  
    public static String sortOrder{get; set;}  
    
    public class sortWrapperData implements Comparable{
        public calculateNpsWrapper wrapperData {get; set;}                           
        
        public sortWrapperData(calculateNpsWrapper cnw){ 
            wrapperData = cnw;         
        }
        
        public Integer compareTo(Object objToCompare) {
            sortWrapperData sWrapData = (sortWrapperData)objToCompare;
            if(compareField == 'Account__r.Name' && (String)wrapperData.accountName > (String)sWrapData.wrapperData.accountName){
                return sortOrder.equals('acs') ? 1 : 0;         
            }else if(compareField == 'currentNetPromoter' && (String)wrapperData.currentNetPromoterType > (String)sWrapData.wrapperData.currentNetPromoterType){
                return sortOrder.equals('acs') ? 1 : 0;         
            }else if(compareField == 'priorNetPromoter' && (String)wrapperData.previousNetPromoterType > (String)sWrapData.wrapperData.previousNetPromoterType){               
                return sortOrder.equals('acs') ? 1 : 0;            		            	
            }else if(compareField == 'currentSce' && (String)wrapperData.currentSce > (String)sWrapData.wrapperData.currentSce){
                return sortOrder.equals('acs') ? 1 : 0;         
            }else{
                return sortOrder.equals('acs') ? 0 : 1;  
            }                                 
        }
    }
}