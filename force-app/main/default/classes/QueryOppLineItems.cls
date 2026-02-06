/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-02-2024
 * @last modified by  : Spoorthy
**/
public with sharing class QueryOppLineItems { 
    @AuraEnabled
    public static Records getOppProductLineItemData(Id recordId){
        Records fetchRecords = new Records();
        System.debug('Opportunity Line Item START');
        try{
            fetchRecords.QueryOppList = [SELECT Id,Product2.Name,Product2.Product_Line__c,Opportunity.Account.Name,Opportunity.EffectiveDate__c,Opportunity.CM_VPCR_RVP__c,Product2Id,Opportunity.Specialty_Benefits_SVP__c ,Opportunity.Name,OpportunityId, Product_Line__c,Opportunity.OwnerId, Opportunity.Owner_Name__c, Net_Results__c , Will_Sales_Incentive_be_split__c, OpportunityLineItem.Underwriting_Validation__c, Underwriter_Email__c, Underwriter__c, Sales_Person_2__r.Name, Sales_Person_2_split_percentage__c, Submit_for_sales_incentives__c,  Date_Submitted_for_Incentives__c, Date_sent_to_ISI_Site__c, Sales_Person_1__r.Name, Sales_Person_1_split_percentage__c,Product2.Family FROM OpportunityLineItem where OpportunityId =: recordId  AND ((((((Product_Line__c = 'Medical' AND Opportunity.Disposition_Medical__c = 'Sold')OR (Product_Line__c = 'Pharmacy' AND Opportunity.Disposition_Pharmacy__c = 'Sold')OR (Product_Line__c = 'Dental'  AND Opportunity.Disposition_Dental__c = 'Sold') OR (Product_Line__c = 'Vision' AND Opportunity.Disposition_Vision__c = 'Sold')) AND Product2.Name = 'Total') OR (Product_Line__c = 'Other' AND Eligible_for_Sales_Incentives__c='Yes' AND Disposition_Other_Buy_Up_Programs__c = 'Sold' )) AND Net_Results__c > 0  AND Opportunity.EffectiveDate__c > 2019-01-01) OR Submit_for_sales_incentives__c = true) Order By Date_Submitted_for_Incentives__c];
            //fetchRecords.QueryOppList = [SELECT Id,Product2.Name, Product2.Product_Line__c,Opportunity.Account.Name,Opportunity.EffectiveDate__c,Opportunity.Name, Opportunity.Owner_Name__c, Net_Results__c , Will_Sales_Incentive_be_split__c, Underwriter_Email__c, Underwriter__c, Sales_Person_2__r.Name, Sales_Person_2_split_percentage__c, Submit_for_sales_incentives__c,  Date_Submitted_for_Incentives__c, Date_sent_to_ISI_Site__c, Sales_person_1__c, Sales_Person_1_split_percentage__c,Product2.Family FROM OpportunityLineItem where OpportunityId =: recordId  AND (((((Product_Line__c = 'Medical' AND Opportunity.Disposition_Medical__c = 'Sold')OR (Product_Line__c = 'Pharmacy' AND Opportunity.Disposition_Pharmacy__c = 'Sold')OR (Product_Line__c = 'Dental'  AND Opportunity.Disposition_Dental__c = 'Sold') OR (Product_Line__c = 'Vision' AND Opportunity.Disposition_Vision__c = 'Sold')) AND Product2.Eligible_for_Sales_Incentives__c='Yes' AND Product2.Underwriting_Validation__c='No')AND Product2.Name = 'Total') OR (Product_Line__c = 'Other' AND Product2.Eligible_for_Sales_Incentives__c='Yes' AND Disposition_Other_Buy_Up_Programs__c = 'Sold' )) AND Net_Results__c > 0 Order By Date_Submitted_for_Incentives__c];
            fetchRecords.QueryUnderWriters = [SELECT Id, Underwriter_Name__c, Email_Address__c FROM Underwriter_Data__mdt order by Underwriter_Name__c];
            system.debug('Query Data '+fetchRecords.QueryOppList);
            if(fetchRecords.QueryOppList != null) {
                List<OpportunityLineItem> oppLineItemsList = fetchRecords.QueryOppList;
                if(oppLineItemsList != null && oppLineItemsList.size() > 0) {
                    String opportunityId = oppLineItemsList[0].Opportunity.Id;
                    fetchRecords.readOnly = getUserProfile(opportunityId);
                }
            }
            String timeZone = UserInfo.getTimeZone().getID();
            //String UserRole = QueryOppLineItems.getUserRole(recordId);
            
            fetchRecords.isLoggedInUserRoleToBeEnabled = getLoggedInUerRoleInfo();
            fetchRecords.timeZone = timeZone;
            List<String> pickListfieldNameList= new List<String>{/*'Sales_Person_1_split_percentage__c','Sales_Person_2_split_percentage__c',*/ 'Will_Sales_Incentive_be_split__c'};
                Map<String,List<String>> mp=new Map<String,List<String>>();
            for(String eachPickListfieldName:pickListfieldNameList) 
            {
                System.debug('eachPickListfieldName'+getselectOptions('OpportunityLineItem',eachPickListfieldName));
                mp.put(eachPickListfieldName,getselectOptions('OpportunityLineItem',eachPickListfieldName));
            }
            
            fetchRecords.pckLstMap = mp;
            System.debug('Opportunity data '+fetchRecords.pckLstMap);
        }catch(Exception ex){
            System.debug('exception Occured'+ex.getMessage());
        }
        return fetchRecords;
    }
    
    public static List < String > getselectOptions(String objectName, string fld) 
    {
        
        System.debug('objectName,field ==>'+objectName+' '+fld);
        List < String > allOpts = new list < String > ();
        allOpts.add('');
        
        Schema.SObjectType objType = Schema.getGlobalDescribe().get(objectName);
        
        Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
        
        map < String, Schema.SObjectField > fieldMap = objDescribe.fields.getMap();
        
        // Get the list of picklist values for this field.
        list < Schema.PicklistEntry > values =
            fieldMap.get(fld).getDescribe().getPickListValues();
        
        // Add these values to the selectoption list.
        for (Schema.PicklistEntry a : values) {
            allOpts.add(a.getValue());
        }
        system.debug('allOpts ---->' + allOpts);
        allOpts.sort();
        return allOpts;
    }
    
    @AuraEnabled
    public static List<OpportunityLineItem> saveOpportunityLineData(List<OpportunityLineItem> OppData){
        system.debug('Opp data '+OppData);
        List<OpportunityLineItem> listTobeUpdated = new List<OpportunityLineItem>();
        for(OpportunityLineItem OppDataloop : OppData){
            listTobeUpdated.add((OpportunityLineItem)OppDataloop);
        }
        System.debug('The following data has to be upserted in OpportunityLineItem -> '+listTobeUpdated);
        
        Database.SaveResult[] dbUpdateResultList = Database.update(listTobeUpdated, false);
        
        if(dbUpdateResultList != null && dbUpdateResultList.size() > 0) {
            for (Database.SaveResult UpdtResult : dbUpdateResultList) {
                System.debug('UpdtResult---'+UpdtResult);
                if(!UpdtResult.isSuccess()) {
                    for(Database.Error err : UpdtResult.getErrors()) {
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        System.debug('Fields that affected this error: ' + err.getFields());
                    }
                }
            }
        }
        else {
            throw new NoAccessException();
        }
        return listTobeUpdated;
    }
    
    @AuraEnabled
    public static List < sObject > fetchLookUpValues(String searchKeyWord, Id recordId) {
        String searchKey = '%' + searchKeyWord + '%';
        String sQuery;
        String userRole = 'CM SCE';

        //--------------------------------SAMARTH--------------------------------
        List<String> userRoleList = new List<String>();
        userRoleList.add('CM SCE');
        userRoleList.add('Surest CM SCE');
        userRoleList.add('Surest CM SVP');
        userRoleList.add('Specialty Benefits SCE');
        //--------------------------------SAMARTH--------------------------------

        List < sObject > returnList = new List < sObject > ();
        List < sObject > lstOfRecords = new List < sObject > ();
        if(searchKeyWord != ''){
            sQuery = 'select id, Name from User where Name LIKE: searchKey order by Name limit 5';
            lstOfRecords = Database.query(sQuery);
            system.debug('sQuery '+sQuery);
            
            for (sObject obj: lstOfRecords) {
                returnList.add(obj);
            }
        } else {
            Id accId = [Select AccountId From Opportunity Where Id =: recordId WITH USER_MODE].AccountId;
            system.debug('Fetch Look values for Sales Person 2 and its accId is  '+accId); 
            //sQuery = 'select Name,Last_Name__c from CM_Account_Team_History__c where User__r.UserRole.Name=: userRole AND Account_Firm__c =: accId order by Name limit 5';
            sQuery = 'select Name,Last_Name__c from CM_Account_Team_History__c where User__r.UserRole.Name IN: userRoleList AND Account_Firm__c =: accId order by Name limit 5';
            lstOfRecords = Database.query(sQuery);
            system.debug('sQuery '+sQuery);
            
            for (sObject obj: lstOfRecords) {
                returnList.add(obj);
            }
            system.debug('lstOfRecords '+lstOfRecords.size());
            if(lstOfRecords.isEmpty() || lstOfRecords.size() < 5){
                List < sObject > lstOfRemainingRecords = new List < sObject > ();
                Integer recordCount = 5 - lstOfRecords.size();
                system.debug('recordCount '+recordCount);
                //sQuery = 'select id, Name from User where IsActive = true AND User_Role__c =: userRole order by Name limit: recordCount';
                sQuery = 'select id, Name from User where IsActive = true AND User_Role__c IN: userRoleList order by Name limit: recordCount';
                lstOfRemainingRecords = Database.query(sQuery);
                system.debug('sQuery '+sQuery);
                
                for (sObject obj: lstOfRemainingRecords) {
                    returnList.add(obj);
                }
            }
        }
        
        return returnList;
    }
    
    @AuraEnabled
    public static NPSWrapper getTemplateInXML(Id recordId){                       
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString = 'Select ';
        String objectName  = '';     
        Id userId = UserInfo.getUserId();
        String loggedInUserRole = getUserRole(userId); 
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'CompensationTrackingandSplitSales'];
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
        List<OpportunityLineItem> accData = [SELECT Id,Product2.Name, Sales_person_1__r.Name,Product2.Family , Product_Line__c,Opportunity.Specialty_Benefits_SVP__c,Product2.Product_Line__c,Opportunity.Account.Name,Opportunity.EffectiveDate__c,Opportunity.Name, Opportunity.Owner_Name__c, Net_Results__c , Will_Sales_Incentive_be_split__c, Underwriter_Email__c, Underwriter__c, Sales_Person_2__r.Name, Sales_Person_2_split_percentage__c, Submit_for_sales_incentives__c,  Date_Submitted_for_Incentives__c, Date_sent_to_ISI_Site__c, Sales_person_1__c, Sales_Person_1_split_percentage__c FROM OpportunityLineItem where OpportunityId =: recordId  AND ((((Product_Line__c = 'Medical' AND Opportunity.Disposition_Medical__c = 'Sold')OR (Product_Line__c = 'Pharmacy' AND Opportunity.Disposition_Pharmacy__c = 'Sold')OR (Product_Line__c = 'Dental'  AND Opportunity.Disposition_Dental__c = 'Sold') OR (Product_Line__c = 'Vision' AND Opportunity.Disposition_Vision__c = 'Sold')) AND Product2.Name = 'Total') OR (Product_Line__c = 'Other' AND Product2.Eligible_for_Sales_Incentives__c='Yes' AND Disposition_Other_Buy_Up_Programs__c = 'Sold' )) AND Net_Results__c > 0 Order By Date_Submitted_for_Incentives__c ];
        
        System.debug('accData : '+accData);
        List<OpportunityLineItem> processedData = new List<OpportunityLineItem>();
    
        for (OpportunityLineItem oli : accData) {
            processedData.add(oli);  // Add the original row
            /*if (oli.Opportunity.Specialty_Benefits_SVP__c != null) {
                String specialitySvp = oli.Opportunity.Specialty_Benefits_SVP__c;
                if (oli.Sales_person_1__r.Name != specialitySvp && (oli.Product_Line__c =='Dental' || oli.Product_Line__c =='Vision' || (oli.Product_Line__c =='Other' && oli.Product2.Family =='Specialty Products'))) { 
                    // Create a duplicate row with the Speciality Benefit SVP set
                    OpportunityLineItem duplicateOli = oli.clone(false, true, false, false);
                    processedData.add(duplicateOli);
                }
            }*/
        }
        System.debug('processedData : '+processedData);
        
        npsWrap.xmlString = xmlBodyString;
        npsWrap.opportunityProductFinalData = processedData;
        npsWrap.objectItags = objectItagesMap;
        npsWrap.UserRole = loggedInUserRole;
        
        npsWrap.FieldSetMap=getFieldInfo();
        return npsWrap;
    }
    
    public static String getUserRole(Id recordId) {
        String loggedInUserRole = '';
        try {
            	User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                loggedInUserRole = user.UserRole.Name;
            }
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        return loggedInUserRole;
    }
    
    public static Map<String,FieldSetResult> getFieldInfo()
    {
        Map<String,FieldSetResult> fieldSetResultMap = new Map<String,FieldSetResult>() ;
        Map <String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get('OpportunityLineItem').getDescribe().fields.getMap();
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
    
    @AuraEnabled
    public static Boolean getUserProfile(String opportunityId) {
        Boolean readOnly = false;
        try {            
            Profile userProfile = [SELECT Name FROM Profile WHERE Id=:userinfo.getProfileId() LIMIT 1];
            String profileName = userProfile.Name;
            if(profileName != null && profileName == 'Compensation Team') {
               readOnly = true; 
            } else {
                Boolean isLoggedInUserRoleToBeEnabled = UserInformationClass.hasEditAccessToRecord(opportunityId);
                if(isLoggedInUserRoleToBeEnabled == false){
                    readOnly = true;
                }  
            }
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        return readOnly;
    }
    
    @AuraEnabled
    public static boolean sendMailFromApex(String lName, String fName, String maId){
        System.debug('Input Parameters -- lName--'+lName+' ,fName--'+fName+', maId'+maId);
        boolean is_success = false;
        Boolean isOpty = false;
        Opportunity opp = new Opportunity();
        String emptyDate = '';
        boolean isDateNull = false;
        String sObjName ='';
        String MaName = '';
         Id id ;
        if(maId != null &&  maId != ''){
           id = (Id)maId;
           MaName = [Select Name from Opportunity where Id =: string.escapesinglequotes(maId) WITH USER_MODE].Name;
        }    
       
            if(id != null){
                sObjName   = id.getSObjectType().getDescribe().getName();
            }
        String rowId = maId;
        DateTime effectiveDate ;
        String companyName = '';

        
        String receiverEmail = System.Label.MA_Underwriter_Send_Email_Receiver;
        System.debug(' receiverEmail  > >>>>> '+receiverEmail);
        List<string> emaillst =new List<string>();
        emaillst.add(receiverEmail);
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        message.toAddresses = emaillst;
        message.optOutPolicy = 'FILTER';
        
        //message.subject = System.Label.MA_Consultant_Send_Email_Subject;
        message.subject = 'Unable to Find UnderWriter';
        String emailBody = 'Requestor:'+' ';
        emailBody += UserInfo.getName()+'<br/><br/>';
       
        
        emailBody += 'Membership Activity Name: '+MaName+'<br/>';
        emailBody += 'Row Id: '+rowId+'<br/>';
        emailBody += '<br/>';
        emailBody += 'Underwriter Information:<br/> ';
        emailBody += 'First Name: '+fName+'<br/>';
        emailBody += 'Last Name: '+lName+'<br/>';
        //emailBody += 'Email: '+email+'<br/>';
        //emailBody += 'Phone #: '+phone+'<br/>';
        
        message.setHtmlBody(emailBody);
        
        Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {message};
            Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
        if (results[0].success) {
            is_success=true;           
        } else {
            is_success=false;
            System.debug('The email failed to send: '+ results[0].errors[0].message);
        }
        return is_success;
    }
    
    
    @AuraEnabled
    public static Boolean getLoggedInUerRoleInfo() {
        
        Boolean isLoggedInUserRoleToBeEnabled = false;
        
        try {
            
            User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                String[] roleNames = System.Label.MA_Sales_Incentives_Roles.split(';');
                system.debug('MA_Sales_Incentives_Roles '+roleNames);
                Set<String> roleNamesSet = new Set<String>(roleNames);
                System.debug('loggedInUserRole-'+loggedInUserRole);
                if(roleNamesSet.contains(loggedInUserRole)) {
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
    
    
    public class AccessControl{
        @AuraEnabled
        public Boolean fullAccess { get; set;}  
        @AuraEnabled
        public Boolean readWrite { get; set;}
        @AuraEnabled
        public Boolean readOnly { get; set;}
        @AuraEnabled
        public Boolean isSystemAdmin { get; set;}
    }
    
    public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public List<OpportunityLineItem> opportunityProductFinalData { get; set; }
        @AuraEnabled
        public String xmlString { get; set; }
        @AuraEnabled
        public String UserRole { get; set; }
        @AuraEnabled
        public Map<String,FieldSetResult> FieldSetMap { get; set; }
        @AuraEnabled
        public OpportunityLineItem OppLineData { get; set; }
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
    
    public class Records {
        
        @AuraEnabled
        public List<OpportunityLineItem> QueryOppList{ get;set; }
        
        @AuraEnabled 
        public List<OpportunityLineItem> SalesPerson1_PercentagePickList{ get;set; }
        
        @AuraEnabled 
        public List<OpportunityLineItem> SalesPerson2_PercentagePickList{ get;set; }
        
        @AuraEnabled
        public Map<String,List<String>> pckLstMap { get;set; }
        
        @AuraEnabled
        public List<Underwriter_Data__mdt> QueryUnderWriters{ get;set; }
        
        @AuraEnabled
        public Boolean isLoggedInUserRoleToBeEnabled{ get;set; }
        
        @AuraEnabled
        public Boolean readOnly{ get;set; }
        
        @AuraEnabled
        public String timeZone{ get;set; }
    }
    
}