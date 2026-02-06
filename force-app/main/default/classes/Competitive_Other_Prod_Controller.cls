/****************************************************************** ***** 
Name: Competitive_Other_Prod_Controller 
Copyright © 2023 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: To query the data required by Competitive Landscape- Other Product section and get changes made to the data in frontend  and update them to backend.
Used by competitiveLandscapeOtherSecMainComp,competitiveLandscapeAddvendorModal.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Varun MS  	 	     08/28/2023  		 INITIAL DEVELOPMENT   		  
*********************************************************************
*/


public without sharing class Competitive_Other_Prod_Controller {
    
    
/******************************************************************
Purpose: To Query Competitor Junction Records. 
Parameters: Account Id.
Returns: Wrapper Class.
*******************************************************************
*/ 
    
    @AuraEnabled
    public static competitorData getOtherProdData(Id accId){
        competitorData dataToLwc = new competitorData();
        dataToLwc.competitorList = [SELECT Id, Name, Account__r.Name, Account__c, Hub_vendor__c, Type_of_File__c, Special_MyUhc_com_Customization_column__c, Inactive_Competitor_Status__c, Competitorclassification__c, Type_of_Products_Services_Provided__c, CompetitorAccount__r.Name, Comments__c,Inactive_Competitor_Date__c FROM Competitor__c WHERE Inactive_Competitor_Status__c = false AND Competitorclassification__c =  'Other' AND Account__c=:accId AND CompetitorAccount__r.Name!= 'UHC-Optum' ORDER BY Name];
        dataToLwc.access = checkEditAccess(accId);
        return dataToLwc;
    }
    
    
/******************************************************************
Purpose: To Query Competitor Account Records From Company Object. 
Parameters: None.
Returns: List Of Account.
*******************************************************************
*/ 
    
    @AuraEnabled(cacheable=true)
    public static Account[] getVendorCarrierData(){
        string[] excludeList = new List<String>{'National Accounts', 'Optum Rx', 'UHC-Optum'};
            Id recTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        Account[] vendorList = [SELECT Id,Name, Top_Competitor__c, The_Blues_and_their_Affiliates__c, Exchange_Competitors__c FROM Account WHERE CompetitorStatus__c = 'Active' AND Name NOT IN:excludeList AND  Product_Types_Offered__c INCLUDES('Other Buy Up') AND RecordTypeId =:recTypeId ORDER BY Name ASC NULLS LAST];
        return vendorList;
    }
    
    
    
/******************************************************************
Purpose: Update Competitor Junction Records. 
Parameters: List Of Competitor Junction Records.
Returns: Nothing.
*******************************************************************
*/ 
    @AuraEnabled
    public static void updateCompetitorRecs(Competitor__c[] competitorListToUpdate){
        system.debug('competitorListToUpdate = '+competitorListToUpdate);
        if(competitorListToUpdate.size() > 0){
            update competitorListToUpdate;
        }
    }
    
    
    
/******************************************************************
Purpose: Insert and Update Competitor Junction Records. 
Parameters: List Of Competitor Junction Records.
Returns: Nothing.
*******************************************************************
*/ 
    
    @AuraEnabled
    public static void insertCompetitorRecs(Competitor__c[] competitorListToInsert, Competitor__c[] competitorListToUpdate){
        System.debug('competitorList insert= '+competitorListToInsert);
        if(competitorListToInsert.size() > 0){
            Competitor__c[] cmpListToInsert = new List<Competitor__c>();
            /*for(Competitor__c cmp:competitorListToInsert){
                Competitor__c cmpRecord = new Competitor__c();
                cmpRecord.Name = cmp.Name;
                cmpRecord.Account__c = cmp.Account__c;
                cmpRecord.Type_of_Products_Services_Provided__c = cmp.Type_of_Products_Services_Provided__c;
                cmpRecord.Competitorclassification__c = 'Other';
                cmpRecord.CompetitorAccount__c = cmp.CompetitorAccount__c;
                cmpRecord.Type__c = 'Account Competitor';
                cmpRecord.Hub_vendor__c = cmp.Hub_vendor__c;
                cmpRecord.Type_of_File__c = cmp.Type_of_File__c;
                cmpRecord.Comments__c = cmp.Comments__c;
                cmpRecord.Special_MyUhc_com_Customization_column__c = cmp.Special_MyUhc_com_Customization_column__c;
                cmpRecord.Inactive_Competitor_Status__c = cmp.Inactive_Competitor_Status__c;
                cmpRecord.Inactive_Competitor_Date__c = cmp.Inactive_Competitor_Date__c;
                
                if(cmp.Termination_Date__c != null){
                    cmpRecord.Termination_Date__c = cmp.Termination_Date__c;
                }
                cmpListToInsert.add(cmpRecord);
            }*/
            
            if(!competitorListToInsert.isEmpty()){
                //system.debug('cmpListToInsert ---> '+cmpListToInsert);
                Database.SaveResult[] saveResults = Database.insert(competitorListToInsert, false);
                for (Database.SaveResult sr : saveResults) {
                    if (sr.isSuccess()) {
                        System.debug('Account inserted with ID: ' + sr.getId());
                    } 
                    else {
                        for (Database.Error error : sr.getErrors()) {
                            System.debug('Error message: ' + error.getMessage());
                            System.debug('Fields causing the error: ' + error.getFields());
                        }
                    }
                    
                }
            }
        }

        if(competitorListToUpdate.size()>0){
            updateCompetitorRecs(competitorListToUpdate);
        }
    }
    
    
    
/******************************************************************
Purpose: To Check Access for Account Records. 
Parameters: Account Id.
Returns: Boolean.
*******************************************************************
*/ 
    @AuraEnabled(cacheable=true)
    public static Boolean checkEditAccess(String accId){
        Boolean hasAccess;
        String[] profile = System.Label.Competitive_Other_Product_Section_Profile_Access.split(',');
        String[] userPoistion = System.Label.Competitive_Other_Product_Section_User_Position_Access.split(',');
		Id userId = UserInfo.getUserId();
		Boolean recordAccess = [SELECT RecordId, HasEditAccess FROM UserRecordAccess WHERE RecordId = :accId AND UserId =:userId Limit 1].HasEditAccess;
        User loggedinUser = [SELECT Id, Name, Profile.Name, Position__c FROM User WHERE Id =: userId LIMIT 1]; 
        if(profile.contains(loggedinUser.Profile.Name) || userPoistion.contains(loggedinUser.Position__c) || recordAccess){
            hasAccess = true;
        }
        else{
            hasAccess = false;
        }
        return hasAccess;
	}
    
    
/******************************************************************
Purpose: To Query and Manupilate XML files from static resources for print functionality. 
Parameters: Account Id, Account type(CD Or CM).
Returns: Wrapper Class.
*******************************************************************
*/ 
    @AuraEnabled
    public static CompetitorDataExportWrapper getTemplateInXMLOtherProducts(String accountId,String accountType){                       
        CompetitorDataExportWrapper competitorDataExportWrapper = new  CompetitorDataExportWrapper();
        String queryString;
        String objectName  = ''; 
        String templateName='';
        if(accountType==System.Label.Client_Management){
           templateName='CM_CompetitiveLandscape_Template'; 
        }else if(accountType==System.Label.Client_Development){
            templateName='CD_CompetitiveLandscape_Template';
        }
        StaticResource sr = [SELECT Id, Body, BodyLength,Name FROM StaticResource where Name =:templateName];
        String xmlBodyString = sr.body.toString();
        
        
        
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
        
        queryString='SELECT Id,Account__c,Account__r.Name,CompetitorAccount__r.Name,CompetitorAccount__c,NumberOfMembersHeld__c,ofMembersHeld__c,Comments__c,BusinessModelforPharmacy__c,FundingType__c,Competitorclassification__c,PrimaryIncumbent__c,SecondaryIncumbent__c,AssociatedMedicalCarrier__c, Type_of_Products_Services_Provided__c, Coalition_if_applicable__c, Hub_vendor__c, Type_of_File__c, Special_MyUhc_com_Customization_column__c FROM Competitor__c where Account__c=:accountId and CompetitorAccount__r.Name!= \'UHC-Optum\' and Type__c=\'Account Competitor\'and ((Competitorclassification__c!=\'Medical\' and Competitorclassification__c!=\'Other\') or (Competitorclassification__c=\'Other\' and OtherPrdctCompetitorRecordTobeDeleted__c=false and Inactive_Competitor_Status__c = false)) ORDER BY Competitorclassification__c, CompetitorAccount__r.Name Asc';
        List<Competitor__c> competitorData = Database.query(queryString);
        
        List<String> nonOtherProductList=new List<String>{'Dental','Medical','Pharmacy','Vision'};
        //CompetitiveLandscape_OthersClass compLandOther = new CompetitiveLandscape_OthersClass();

        List<String> otherProductPicklist=CompetitiveLandscape_OthersClass.getselectOptions('Competitor__c','Type_of_Products_Services_Provided__c');
        
        if(otherProductPicklist!=null && !otherProductPicklist.isEmpty()){
            for(String eachNonOtherProduct:nonOtherProductList){
                Integer nonOtherProductIndex= otherProductPicklist.indexOf(eachNonOtherProduct);
                if(nonOtherProductIndex != -1){
                    otherProductPicklist.remove(nonOtherProductIndex);
                }
                
            }
        }

        competitorDataExportWrapper.xmlString = xmlBodyString;
        competitorDataExportWrapper.competitorData = competitorData;
        competitorDataExportWrapper.objectItags = objectItagesMap;
        competitorDataExportWrapper.otherProductPicklist=otherProductPicklist;
        
        return competitorDataExportWrapper;
    }
    
    public class competitorData{

        @AuraEnabled
        public Competitor__c[] competitorList{get;set;}
        
        @AuraEnabled
        public Boolean access{get;set;}
    }
    
    public class CompetitorDataExportWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public List<Competitor__c> competitorData { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }
        
        @AuraEnabled
        public List<String> otherProductPicklist { get; set; }
        
    }
}