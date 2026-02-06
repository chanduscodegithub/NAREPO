/****************************************************************************************************
Name    :  medicalPersistencyController    
Purpose :  my Medical Persistency Data Sheet Report Controller
Author  :  Samarth Nadig                                 Date :28-Sept-2020                             

Version      Author                   Date                 Release #           Purpose   
------------------------------------------------------------------------------------------------------
1.0 -        Samarth Nadig           28-Sept-2020     	                   Initial Development             
1.1 -                       
*****************************************************************************************************/
public with sharing class medicalPersistencyController {
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
    public static List<medicalPersistencyWrapper> medicalPersistencyData2(String SalesCycle, String SortByOrder){
        system.debug('SalesCycle coming to backend '+SalesCycle);
        Id currentUserId = UserInfo.getUserId();        
        List<CM_Account_Team_History__c> naSalesTeamList = new List<CM_Account_Team_History__c>();
        Set<Id> accId = new Set<Id>();
        List<PolicyAccountMembership__c> pamList = new List<PolicyAccountMembership__c>();
        List<medicalPersistencyWrapper> mpwList = new List<medicalPersistencyWrapper>();
        String salesCycleFromBackEnd = '';
        Integer currentYear;
        Integer previousYear;
        
        User userData = [Select Id,UserRole.Name,VPCR__c from User where Id=:currentUserId];
        String userRoleName = userData.UserRole.Name;
        
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
            system.debug('Entering SalesCycle Null');
            Date todayDate = System.today();
            
            String defaultSalesSeason='';
            defaultSalesSeason=GrowthIncentiveCompensationController.getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'), icmReportSettingMap.get('Report_Default_Month'));
            
            String subString1 = defaultSalesSeason.substring(2,4);
            previousYear = Integer.valueOf(String.valueOf(20)+subString1);
            
            String subString2 = defaultSalesSeason.substring(10);
            currentYear = Integer.valueOf(String.valueOf(20)+subString2);
            
            salesCycleFromBackEnd = SALES_SEASON_PREFIX+subString1+SALES_SEASON_INFIX+subString2;
            
            SortByOrder='Asc';
        }
        else{
            system.debug('Entering SalesCycle not null');
            salesCycleFromBackEnd = SalesCycle;
            
            String subString1 = salesCycleFromBackEnd.substring(2,4);
            previousYear = Integer.valueOf(String.valueOf(20)+subString1);
            
            String subString2 = salesCycleFromBackEnd.substring(10);
            currentYear = Integer.valueOf(String.valueOf(20)+subString2);
        }
        system.debug('Current Year '+currentYear);
        system.debug('Previous Year '+previousYear);
        
        //-----------------------------------------------------------SORTING-----------------------------------------------------------
        
        if(SortByOrder == ''){
            SortByOrder = 'Asc';
        }
        
        //-----------------------------------------------------------SORTING-----------------------------------------------------------
        
        if(userData.VPCR__c != TRUE){
            system.debug('Inside SCE query');
            //AND Account_Firm__r.Category__c = 'Client Management'
            naSalesTeamList = [SELECT Id, Name, Account_Firm__c, Case_Management_Start_Date__c, Case_Management_End_Date__c, Role__c, User__c
                               FROM CM_Account_Team_History__c
                               WHERE (Job_Title__c = 'Strategic Client Executive' OR Role__c = 'CM SCE' OR Role__c = 'Surest CM SCE' OR Role__c = 'Surest CM SVP' OR Role__c = 'Specialty Benefits SCE') AND User__c =: currentUserId AND
                               CALENDAR_YEAR(Case_Management_Start_Date__c) <=: previousYear AND (Case_Management_End_Date__c = NULL OR CALENDAR_YEAR(Case_Management_End_Date__c) >=: previousYear) WITH USER_MODE];
        }
        else{
            system.debug('Inside VPCR query');
            //AND Account_Firm__r.Category__c = 'Client Management'
            naSalesTeamList = [SELECT Id, Name, Account_Firm__c, Case_Management_Start_Date__c, Case_Management_End_Date__c, Role__c, User__c
                               FROM CM_Account_Team_History__c
                               WHERE User__r.VPCR__c = TRUE AND User__c =: currentUserId AND
                               CALENDAR_YEAR(Case_Management_Start_Date__c) <=: previousYear AND (Case_Management_End_Date__c = NULL OR CALENDAR_YEAR(Case_Management_End_Date__c) >=: previousYear) WITH USER_MODE];
        }
        system.debug('naSalesTeamList '+naSalesTeamList);
        
        if(naSalesTeamList.size()>0){
            for(CM_Account_Team_History__c nast:naSalesTeamList){
                accId.add(nast.Account_Firm__c);
            }
            system.debug('accId '+accId);   
        }
        
        if(accId.size()>0){
            if(SortByOrder == 'Asc'){
                pamList = [SELECT Id, Name, AccountFirm__c,AccountFirm__r.Name,Prior_Year_GL_Membership__c,Transfer_In__c,Transfer_Out__c,
                           Adjusted_Current_GL_Membership__c,Adjusted_Prior_Year_GL_Membership__c,GLMembership__c,Membership_Persistency__c,GLDate__c,
                           Override_Membership_Persistency__c,Override_Current_GL_Membership__c
                           FROM PolicyAccountMembership__c 
                           WHERE AccountFirm__c IN:accId AND GL_Membership_Status__c != 'New Business' AND CALENDAR_YEAR(GLDate__c) =:currentYear AND CALENDAR_MONTH(GLDate__c) = 2 AND 
                           MembershipType__c = 'Medical' AND Name = 'Total GL Membership' WITH USER_MODE
                           ORDER BY AccountFirm__r.Name];
            }
            else{
                pamList = [SELECT Id, Name, AccountFirm__c,AccountFirm__r.Name,Prior_Year_GL_Membership__c,Transfer_In__c,Transfer_Out__c,
                           Adjusted_Current_GL_Membership__c,Adjusted_Prior_Year_GL_Membership__c,GLMembership__c,Membership_Persistency__c,GLDate__c,
                           Override_Membership_Persistency__c,Override_Current_GL_Membership__c
                           FROM PolicyAccountMembership__c 
                           WHERE AccountFirm__c IN:accId AND GL_Membership_Status__c != 'New Business' AND CALENDAR_YEAR(GLDate__c) =:currentYear AND CALENDAR_MONTH(GLDate__c) = 2 AND 
                           MembershipType__c = 'Medical' AND Name = 'Total GL Membership' WITH USER_MODE
                           ORDER BY AccountFirm__r.Name Desc];
            }
        }
        
        system.debug('pamList '+pamList);
        
        if(pamList.size()>0){
            system.debug('Entering Data if');
            for(PolicyAccountMembership__c pam:pamList){
                medicalPersistencyWrapper mpw = new medicalPersistencyWrapper();
                system.debug('salesCycleFromBackEnd '+salesCycleFromBackEnd);
                
                mpw.salesCycleBackEnd = salesCycleFromBackEnd;
                mpw.thisYear = currentYear;
                mpw.prevYear = previousYear;
                mpw.isVpcr = userData.VPCR__c;
                
                if(pam.AccountFirm__c != null){
                    mpw.accountId = pam.AccountFirm__c;
                    mpw.companyLink = '/'+ String.valueOf(pam.AccountFirm__c);
                }
                if(pam.AccountFirm__c != null){
                    mpw.accountName = pam.AccountFirm__r.Name;
                }
                if(pam.Prior_Year_GL_Membership__c != null){
                    mpw.previousYearGlMembership = Integer.valueOf(pam.Prior_Year_GL_Membership__c);
                }
                if(pam.GLMembership__c != null){
                    mpw.currentYearGlMembership = Integer.valueOf(pam.GLMembership__c);
                }
                if(pam.Transfer_In__c != null){
                    mpw.transferIn = Integer.valueOf(pam.Transfer_In__c);
                }
                if(pam.Transfer_Out__c != null){
                    mpw.transferOut = Integer.valueOf(pam.Transfer_Out__c);
                }
                if(pam.Adjusted_Prior_Year_GL_Membership__c != null){
                    mpw.adjustedPreviousYearGlMembership = Integer.valueOf(pam.Adjusted_Prior_Year_GL_Membership__c);
                }
                if(pam.Adjusted_Current_GL_Membership__c != null && pam.Override_Current_GL_Membership__c == NULL){ 
                    mpw.adjustedCurrentYearGlMembership = Integer.valueOf(pam.Adjusted_Current_GL_Membership__c);
                }
                if(pam.Override_Current_GL_Membership__c != NULL){ 
                    mpw.adjustedCurrentYearGlMembership = Integer.valueOf(pam.Override_Current_GL_Membership__c);
                }
                if(pam.Membership_Persistency__c != null && pam.Override_Membership_Persistency__c == NULL){
                    mpw.medicalPersistency = String.valueOf(pam.Membership_Persistency__c.setScale(2))+'%'; //.setScale(2) to round to 2 decimal places
                }
                if(pam.Override_Membership_Persistency__c != NULL){
                    mpw.medicalPersistency = String.valueOf(pam.Override_Membership_Persistency__c.setScale(2))+'%'; //.setScale(2) to round to 2 decimal places
                }
                
                for(CM_Account_Team_History__c cmat:naSalesTeamList){
                    if(String.valueOf(cmat.Account_Firm__c) == mpw.accountId){
                        if(cmat.Case_Management_Start_Date__c != null){
                            mpw.cmStartDate = cmat.Case_Management_Start_Date__c.format();
                        }
                        if(cmat.Case_Management_End_Date__c != null){
                            mpw.cmEndDate = cmat.Case_Management_End_Date__c.format();
                        }
                    }
                }
                
                mpwList.add(mpw);
            }
            system.debug('mpwList '+mpwList);
            
            return mpwList;
        }
        else{
            system.debug('Entering Data else');
            medicalPersistencyWrapper mpw = new medicalPersistencyWrapper();
            system.debug('salesCycleFromBackEnd '+salesCycleFromBackEnd);
            
            mpw.salesCycleBackEnd = salesCycleFromBackEnd;
            mpw.thisYear = currentYear;
            mpw.prevYear = previousYear;
            mpw.isVpcr = userData.VPCR__c;
            mpwList.add(mpw);
            
            return mpwList;
        }
    }
    
    public class medicalPersistencyWrapper {
        @AuraEnabled
        public Integer thisYear {get;set;}
        
        @AuraEnabled
        public Integer prevYear {get;set;}
        
        @AuraEnabled
        public String salesCycleBackEnd {get;set;}
        
        @AuraEnabled
        public Boolean isVpcr {get;set;}
        
        @AuraEnabled
        public String companyLink {get;set;}
        
        @AuraEnabled
        public String accountId {get;set;}
        
        @AuraEnabled
        public String accountName {get;set;}
        
        @AuraEnabled
        public Integer previousYearGlMembership {get;set;}
        
        @AuraEnabled
        public Integer currentYearGlMembership {get;set;}
        
        @AuraEnabled
        public Integer transferIn {get;set;}
        
        @AuraEnabled
        public Integer transferOut {get;set;}
        
        @AuraEnabled
        public Integer adjustedPreviousYearGlMembership {get;set;}
        
        @AuraEnabled
        public Integer adjustedCurrentYearGlMembership {get;set;}
        
        @AuraEnabled
        public String medicalPersistency {get;set;}
        
        @AuraEnabled
        public String cmStartDate {get;set;}
        
        @AuraEnabled
        public String cmEndDate {get;set;}
    }
    
     @AuraEnabled 
    public static PrintWrapper getTemplateInXML(){                     
        PrintWrapper printWrapper = new  PrintWrapper();
        
        String objectName  = ''; 
       StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'Medical_Persistency'];
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
                System.debug('objectName  -> '+objectName);                     
                objectItagesMap.put(objectName, itagSet);
            }                         
            
        }  
        
        
        printWrapper.xmlString = xmlBodyString;       
        printWrapper.objectItags = objectItagesMap;
        
        return printWrapper;
    }
    
     public class PrintWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }  
    }
}