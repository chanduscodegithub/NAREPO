/*********************************************************************** 
Name: SalesDebriefController 
Copyright © 2022 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query and save the data required by Sales Debrief Tab (Membership Activity)
Used by SalesDebriefComp,SalesDebriefChildComp
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Samarth Nadig  	 	09/26/2022  		INITIAL DEVELOPMENT   		  
*********************************************************************/
public with sharing class SalesDebriefController {
    /*Objective - Query data from the following objects - 
	1. Sales Debrief Config Question
	2. Sales Debrief Config Answer
	3. Sales Debrief
	4. Membership Activity
	and send to front end*/
    
    @AuraEnabled
    public static List<ReturnSalesDebriefData> getQuestionsAndAnswers(String oppRecordId){
        List<ReturnSalesDebriefData> wrappperClassList = new List<ReturnSalesDebriefData>();
        List<Opportunity> oppList = new List<Opportunity>();
        List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();
        List<Sales_Debrief_Config_Question__c> questionAndAnswerList = new List<Sales_Debrief_Config_Question__c>(); //for querying config quest and ans
        List<Sales_Debrief__c> salesDebriefSavedDataList = new List<Sales_Debrief__c>(); //for querying actual data
        Map<String,String> labelVsApiMap = new Map<String,String>(); //for table components
        List<Schema.SObjectType> objectMdtList = new List<Schema.SObjectType>{Sales_Debrief__c.SObjectType};
        List<User> userRoleList = new List<User>();
        String oppSalesDebriefType = '';
        String pharmacySalesDebriefValue = '';
        
        String queryFields=' ';

        Integer currentYear = System.today().year();

        if( System.Today().month() != 1 ){
            currentYear = System.today().addYears(1).year();
        }

        String maRecId = String.escapeSingleQuotes(oppRecordId);
        Id loggedInUserId = UserInfo.getUserId();
        list<string> externalUserList = System.Label.Sales_Debrief_External_Access.split(';');
        // added WITH USER_MODE
        userRoleList = [select Id, Name, UserRole.Name from User where UserRole.Name IN :( System.Label.Sales_Debrief_Role_Access.split(';') )];
        // added WITH USER_MODE
        User loggedInUser = [Select id,name,UserRole.Name,Email from User where Id =: loggedInUserId  LIMIT 1 ];
        String loggedInUserRoleName = loggedInUser.UserRole.Name;
        
        String [] typeOfQuestionsArray = new List<String>();
        
        oppList = [SELECT id,name,Platforms_Quoted__c,Sales_Season1__c,EffectiveDate__c,Account.Name,RecordType.DeveloperName,Status__c,Account.Coveted_Account__c,
                   Closed_Reason_1_Medical__c,Closed_Reason_1_Pharmacy__c,Closed_Reason_1_Vision__c,Closed_Reason_1_Dental__c,Closed_Reason_1_Surest__c,
                   PrimaryConsultant__c,PrimaryConsultant__r.Name,Primary_Consulting_Firm__c,Primary_Consulting_Firm__r.Name,
                   Disposition_Medical__c,Disposition_Pharmacy__c,Disposition_Vision__c,Disposition_Dental__c,Surest_Stage__c,Offer_Nationally__c,
                   Existing_Members_Risk_Outcome_Medical__c,Existing_Members_Risk_Outcome_Pharmacy__c,Existing_Members_Risk_Outcome_Vision__c,Existing_Members_Risk_Outcome_Dental__c,
                   Winner_Primary_Medical__c,Winner_Primary_Medical__r.Name,Winner_Primary_Pharmacy__c,Winner_Primary_Pharmacy__r.Name,Winner_Primary_Medical__r.CompetitorGroup__c,
                   Winner_Primary_Vision__c,Winner_Primary_Vision__r.Name,Winner_Primary_Dental__c,Winner_Primary_Dental__r.Name,Sales_Debrief__c, Sales_Debrief_Override__c,
                   Product_Type_Involved_in_Opp__c, Reconciliation_Complete_Record_Locked__c,Pharmacy_Sales_Debrief__c, Surest_Strategy__c, Platforms_Sold__c,
                   vs_Blues_Alt__c,vs_Blues__c,vs_Cigna__c,vs_Anthem__c,vs_Aetna__c
                   FROM Opportunity 
                   WHERE id =: String.escapeSingleQuotes(oppRecordId) WITH USER_MODE LIMIT 1 ];
        
        String medicalOpportunitySalesSeason = oppList[0].Sales_Season1__c;
        Integer salesSeasonYear = Integer.valueOf(oppList[0].Sales_Season1__c.substring(3));
        Integer salesSeason = salesSeasonYear;

        // New override requirement
        if( oppList[0].Sales_Debrief_Override__c != null ){
            oppList[0].Sales_Debrief__c = oppList[0].Sales_Debrief_Override__c;
        }
        
        if(oppList[0].Sales_Debrief__c != null){
            oppSalesDebriefType = oppList[0].Sales_Debrief__c;
        }
        
        if(oppList[0].Pharmacy_Sales_Debrief__c != null){
            pharmacySalesDebriefValue = oppList[0].Pharmacy_Sales_Debrief__c;
        }
        
        if(oppSalesDebriefType == 'Comprehensive Medical'){
            typeOfQuestionsArray.clear();
            typeOfQuestionsArray.add('Medical');
            typeOfQuestionsArray.add('Both');
        }
        else if(oppSalesDebriefType == 'Specialty Only'){
            typeOfQuestionsArray.clear();
            typeOfQuestionsArray.add('Specialty');
            typeOfQuestionsArray.add('Both');
        }
        
        ReturnSalesDebriefData rsdd = new ReturnSalesDebriefData();
        rsdd.opportunityRecord = oppList[0];
        rsdd.effectiveDateYear = salesSeason;
        rsdd.currentYear = currentYear;
        rsdd.validUserRole = false;
        rsdd.salesDebriefType = oppSalesDebriefType;
        rsdd.pharmacySalesDebriefValue = pharmacySalesDebriefValue;
        // added WITH USER_MODE
        rsdd.isRecordLocked = ![ SELECT RecordId, HasEditAccess FROM UserRecordAccess WHERE UserId = :loggedInUserId AND RecordId = :oppRecordId WITH USER_MODE LIMIT 1].HasEditAccess;
        rsdd.nonUpdateableFields = new Set<string>();

        
        for(User us:userRoleList){
            if(loggedInUserRoleName == us.UserRole.Name){
                rsdd.validUserRole = true;
            }
        }
        
         for(String em:externalUserList){
            if(loggedInUser.Email ==em){
                rsdd.validUserRole = true;
            }
        }

        // Override access if the the logged in user is System Administrator
        if( !rsdd.validUserRole ){
            // added WITH USER_MODE
            rsdd.validUserRole = ( [ SELECT ID FROM User WHERE Id =: loggedInUserId AND Profile.Name IN :( System.Label.Sales_Debrief_Profile_Access.split(';') ) WITH USER_MODE ].size() > 0 );
        }

        // Override edit access when Reconciliation_Complete_Record_Locked__c is checked
        if(!rsdd.isRecordLocked)
        rsdd.isRecordLocked = rsdd.opportunityRecord.Reconciliation_Complete_Record_Locked__c;
        
        
        List<OpportunityLineItem> specialtyOli = new List<OpportunityLineItem>();
        specialtyOli = [SELECT id 
                        FROM OpportunityLineItem 
                        WHERE OpportunityId =: oppRecordId AND 
                        Product2.Family = 'Specialty Products' AND 
                        Disposition_Other_Buy_Up_Programs__c IN ('Sold','Lost: Finalist','Lost: Non-Finalist') 
                        WITH USER_MODE ];
        
        system.debug('specialtyOli '+specialtyOli);
        rsdd.isSpecialtyProdPresent = false;
        
        if(specialtyOli.size() > 0){
            rsdd.isSpecialtyProdPresent = true;
        }
        else{
            List<OpportunityLineItem> specialtyProducts = [SELECT id, Name, Product2.Name, Product_Line__c, Opportunity.Disposition_Dental__c, Opportunity.Disposition_vision__c FROM OpportunityLineItem WHERE OpportunityId =: oppRecordId AND Product2.Family = 'Specialty Products' WITH USER_MODE];

            for( OpportunityLineItem oliIterator: specialtyProducts ){
                if( oliIterator.Product_Line__c == 'Dental' &&  ( new List<String>{'Sold', 'Lost: Finalist','Lost: Non-Finalist'} ).contains( oliIterator.Opportunity.Disposition_Dental__c ) ){
                    rsdd.isSpecialtyProdPresent = true;
                    break;
                } else if( oliIterator.Product_Line__c == 'Vision' &&  ( new List<String>{'Sold', 'Lost: Finalist','Lost: Non-Finalist'} ).contains( oliIterator.Opportunity.Disposition_vision__c ) ){
                    rsdd.isSpecialtyProdPresent = true;
                    break;
                }
            }
        }
        
        oliList = [SELECT id,Product2Id,Product2.Name,Product2.ProductCode,Product2.Family,Product2.Reporting_Product_Type__c,Disposition_Other_Buy_Up_Programs__c, Product2.Product_Display_Order__c 
                   FROM OpportunityLineItem 
                   WHERE OpportunityId =: oppRecordId AND Product2.Reporting_Product_Type__c IN ('APP','CI','HI','Life','LTD', 'STD') AND Disposition_Other_Buy_Up_Programs__c IN ('Sold','Lost: Finalist','Lost: Non-Finalist') WITH USER_MODE];
        rsdd.oliList = oliList;
        
        for(Schema.SObjectType objType: objectMdtList){
            for(Schema.SObjectField fld: objType.getDescribe().fields.getMap().values()){
                if( !fld.getDescribe().isUpdateable() ){
                    rsdd.nonUpdateableFields.add( fld.getDescribe().getName() );
                }
                queryFields += fld.getDescribe().getName()+','; //for querying all fields dynamically
                labelVsApiMap.put(fld.getDescribe().getLabel(),fld.getDescribe().getName());
            }
        }
        
        rsdd.labelVsApiMap = labelVsApiMap;
        
        queryFields = queryFields.substringBeforeLast(','); //to remove last comma
        String sdStringQuery = 'Select'+queryFields+' from Sales_Debrief__c where Membership_Activity__c =\'' + maRecId + '\' and Year__c = \'' + salesSeason + '\' WITH USER_MODE LIMIT 1';
        salesDebriefSavedDataList = Database.query(sdStringQuery);
        
        rsdd.sdDataList = salesDebriefSavedDataList;
        
        //querying config question and answers
        questionAndAnswerList = [Select id,name,Medical_Index__c,Specialty_Index__c,Sales_Debrief_Type__c,
                                 Additional_Information__c,All_Conditions_Met__c,Api__c,Controlling_Value_1__c,Controlling_Value_2__c,Controlling_Value_3__c,
                                 Controlling_Value_1__r.Value__c,Controlling_Value_2__r.Value__c,Controlling_Value_3__r.Value__c,
                                 Controlling_Question_1__c,Controlling_Question_2__c,Controlling_Question_3__c,
                                 Controlling_Question_1__r.Api__c,Controlling_Question_2__r.Api__c,Controlling_Question_3__r.Api__c,
                                 Is_Dependent_Question__c,Dependency_Logic__c,Question__c,Required__c,Section_Name__c,
                                 Short_Form__c,Type__c,Year__c,Child_Component__c,Child_Component_Datatype__c,Child_Component_Field_Set__c,
                                 Child_Component_Options__c, Write_In__c,(Select id,name,Index__c,Sales_Debrief_Config_Question__c,Value__c,Value_Type__c from Sales_Debrief_Config_Answers__r)
                                 from Sales_Debrief_Config_Question__c where Year__c =: String.valueOf(salesSeason) AND Sales_Debrief_Type__c IN: typeOfQuestionsArray WITH USER_MODE];
        
        rsdd.sdConfigList = questionAndAnswerList;
        wrappperClassList.add(rsdd);
        return wrappperClassList;
    }
    
    //Called on Save. Saves the data in Sales Debrief object
    @AuraEnabled
    public static void saveSalesDebriefData(Sales_Debrief__c dataToSave, String oppRecordId, String salesSeason, String salesDebriefType){
        Id sdRecordTypeId = Schema.SObjectType.Sales_Debrief__c.getRecordTypeInfosByName().get(salesDebriefType).getRecordTypeId();
        List<Sales_Debrief__c> upsertSdList = new List<Sales_Debrief__c>();
        List<Sales_Debrief__c> isSdPresent = [Select id from Sales_Debrief__c where Membership_Activity__c =: oppRecordId AND Year__c =: salesSeason WITH USER_MODE ];
            if(dataToSave != null){
                if(isSdPresent.size() > 0){
                    upsertSdList.add(dataToSave);
                    Database.update( upsertSdList, AccessLevel.USER_MODE );
                    // update as USER upsertSdList;
                    // update upsertSdList;
                }
                else{
                    dataToSave.Membership_Activity__c = oppRecordId;
                    dataToSave.Year__c = salesSeason;
                    dataToSave.RecordTypeId = sdRecordTypeId;
                    
                    upsertSdList.add(dataToSave);
                    Database.insert( upsertSdList, AccessLevel.USER_MODE );
                }
            }
    }
    
    /*Called on click of print. Saves Print data in Print_Data__c field of Sales_Debrief__c object.
	Instantiates SalesDebriefPrint VF page by passing Opp Record Id as URL parameter*/
    @AuraEnabled
    public static String getSalesDebriefPdf(String oppRecordId, String printData, String sdRecordId){
        system.debug('printData '+printData);
        String printData1 = '';
        String printData2 = '';
        
        if(printData.length() > 131072){
            printData1 = printData.substring(0, 131072);
            printData2 = printData.substring(131072, printData.length());
        }
        else{
            printData1 = printData;
        }
        
        system.debug('printData1 '+printData1);
        system.debug('printData2 '+printData2);
        
        Sales_Debrief__c sd = new Sales_Debrief__c();
        sd.Id = sdRecordId;
        sd.Print_Data__c = printData1;
        sd.Print_Data_2__c = printData2;
        Database.update( sd, AccessLevel.USER_MODE );
        
        system.debug('Print_Data__c '+sd.Print_Data__c);
        system.debug('Print_Data_2__c '+sd.Print_Data_2__c);
        return 'success';
    }
    
    @AuraEnabled
    public static string printDocument(String oppRecordId){
        system.debug('Entering printDocument');
        PageReference pdf_page = new PageReference('/apex/SalesDebriefPrint?Id='+oppRecordId);
        Blob pdfBlob = pdf_page.getContentAsPDF();
        String base64Pdf = EncodingUtil.base64Encode(pdfBlob);
        return base64Pdf;
    }
    
    //Wrapper class to hold all the queried data
    public class ReturnSalesDebriefData {
        @AuraEnabled
        public Boolean validUserRole {get;set;}
        
        @AuraEnabled
        public String accountName {get;set;}
        
        @AuraEnabled
        public String opportunityName {get;set;}
        
        @AuraEnabled
        public List<Sales_Debrief_Config_Question__c> sdConfigList {get;set;}
        
        @AuraEnabled
        public List<Sales_Debrief__c> sdDataList {get;set;}
        
        @AuraEnabled
        public Integer effectiveDateYear {get;set;}
        
        @AuraEnabled
        public String fieldsList {get;set;}
        
        @AuraEnabled
        public Map<String,List<String>> allPicklistValues {get;set;}
        
        @AuraEnabled
        public Map<String,String> labelVsApiMap {get;set;}
        
        @AuraEnabled
        public String oppRecType {get;set;}
        
        @AuraEnabled
        public Opportunity opportunityRecord {get;set;}
        
        @AuraEnabled
        public List<OpportunityLineItem> oliList {get;set;}
        
        @AuraEnabled
        public Integer currentYear{get;set;}
        
        @AuraEnabled
        public String pharmacySalesDebriefValue{get;set;}
        
        @AuraEnabled
        public String salesDebriefType{get;set;}
        
        @AuraEnabled
        public Boolean isSpecialtyProdPresent{get;set;}

        @AuraEnabled
        public Boolean isRecordLocked { get; set; }

        @AuraEnabled
        public Set<String> nonUpdateableFields { get; set; }
    }
}