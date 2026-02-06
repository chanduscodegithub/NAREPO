/*********************************************************************** 
Name: EBDController  
Purpose: The controller used to get, save or print the data for EBD.It fetches Account information along with all related child records:
//    - EBDs, NPS records, Entertainments, Client Priorities, B2B, Advocacies, Competitors, Contacts, Consultants related to that account.
VERSION      AUTHOR              	DATE                DETAIL   	 				  
1.0 -   	 Chandrika 	 	       18/07/2024  		 INITIAL DEVELOPMENT   		  
**********************************************************************/
public with sharing class EBDController {
    
    /***********************************************
Purpose: To check access of EBD tab for CMSCE,VPCR,OWNER
Parameters: Company id.
Returns:boolean true or false.
***************************************************/    
    @AuraEnabled(cacheable = true)
    
    public static Boolean hasEditAccess(String companyId){
        String userId = UserInfo.getUserId();
        User currentUser = [SELECT Id, Profile.Name  FROM User  WHERE Id = :userId LIMIT 1];
        if (currentUser.Profile.Name == 'System Administrator') {
            return true;
        } 
        Account acc = new Account();
        acc = [SELECT Id,Name,CM_SCE__c,CM_SCE__r.Email,CMVPCRRVP__c,CMVPCRRVP__r.Email FROM Account where Id =: companyId AND (CM_SCE__c =: userId  OR CMVPCRRVP__c =: userId) With USER_MODE];
        if (acc != null) {
            return true;
        } else {
            return false;
        }
        
    }
    /***********************************************
Purpose: Fetches all EBD data for a given Account.
This includes Account info, EBD child records, NPS, Entertainments,
Client Priorities, B2B, Advocacies, Competitors, Contacts, Consultants,
financial and survey data.
Parameters: Company id.
Returns:Wrapper object containing all related data for front-end display .
***************************************************/ 
    @AuraEnabled(cacheable=true)
    public static EBDDataWrapper getEbdData(String companyId){
        system.debug('companyId....'+companyId);
        EBDDataWrapper ebdWrapper = new EBDDataWrapper();
        Account ebdAccountData = null;
        EBD__c ebdChildData =null;
        // try{
        ebdAccountData =[SELECT Id, Name,Tenure__c,Current_Deal_Start_Date__c,Current_Deal_Next_Renewal_Date__c,Surest_Current_Deal_Start_Date__c,Surest_Next_Renewal_Date__c,ParticipatingUSMembers__c,UHC_Medical_Members__c,CM_SCE__c,CMVPCRRVP__c,CM_SCE__r.Name,CMVPCRRVP__r.Name,
                         Medical_Membership_Penetration__c,EBD_Sce_Validation__c,EBD_Sce_Validated_Time__c,EBD_Sce_Validation__r.Name,EBD_Validation_Name__c,Incumbent_Primary_Pharmacy__r.Name,IncumbentPrimaryVision__r.Name,IncumbentPrimaryMedical__r.Name,IncumbentPrimaryDental__r.Name,
                         (SELECT Account__c,Name, EnterpriseExecutiveSponsorName__c, OptumExecutiveSponsorName__c,UHCExecutiveSponsorName__c, SurestExecutiveSponsorName__c  FROM Senior_UHG_Executives_Engages__r),
                         (SELECT Name,New_Account__c,BGH_Account__c,BGH_Account__r.Name FROM BGH_s1__r Where New_Account__c =:companyId AND BGH_Account__c!=null AND BGH_Account__r.Subtype__c='Business Group on Health (BGH)' ORDER By BGH_Account__r.Name),
                         (SELECT Id, Name,Brief_Company_Description__c,Relationship_History__c,Involvement_In_CAC__c,X5_Savings_Plan__c,X10_Savings_Plan__c,X20_Savings_Plan__c,Additional_Comments__c,UHC_Services__c,Client_s_Interest__c FROM EBDs__r where Company__c =:companyId ORDER BY CreatedDate DESC LIMIT 1),
                         (SELECT Primary__c, Contact.Id,Contact.MailingCity, Contact.FirstName, Contact.LastName, Contact.Title,Contact.Account.Name,Contact.Account.Location__c, Contact.Account.Id,Contact.Email ,
                          Contact.MailingStateCode FROM AccountContactRelations WHERE AccountId =: companyId  AND Contact.Status__c = 'Active'AND IsDirect=false   AND Contact.RecordType.Name='Consultant' ORDER BY Primary__c DESC,Contact.LastName ASC),
                         (SELECT Id, Name, Account__r.Name,Strength__c,Tenure__c, Account__c, Inactive_Competitor_Status__c, Competitorclassification__c, Type_of_Products_Services_Provided__c, CompetitorAccount__r.Name,Inactive_Competitor_Date__c
                          FROM Competitors__r WHERE Inactive_Competitor_Status__c = false AND Competitorclassification__c =  'Other' AND Account__c=: companyId  AND CompetitorAccount__r.Name!= 'UHC-Optum' ORDER BY CompetitorAccount__r.Name),
                         (SELECT Id, Name,LikelihoodtoRecommendScore__c,NetPromoterType__c,OverallSatisfactionScore__c,Year__c,Surest_Net_Promoter_Type__c,Surest_Likelihood_to_Recommend_Score__c FROM Client_Survey_Results__r WHERE  Year__c != null AND Type__c  ='Client Survey Results' ORDER BY Year__c DESC,LastModifiedDate DESC),
                         (SELECT Id,Name,UHGPrimaryContactwithExecutive__c, Title FROM Contacts where Status__c='Active' AND  Key_Contact__c =true order by Name asc)
                         FROM Account where Id =:companyId With USER_MODE];
        ebdWrapper.getAccountInfo = ebdAccountData;
        if(ebdAccountData.Current_Deal_Start_Date__c != null){
            String formattedDateStr = ebdAccountData.Current_Deal_Start_Date__c.month()+'/'+ebdAccountData.Current_Deal_Start_Date__c.day()+'/'+ebdAccountData.Current_Deal_Start_Date__c.year();                  
            ebdWrapper.CurrentMedicalDealStartDate = formattedDateStr;
        }
        if(ebdAccountData.Current_Deal_Next_Renewal_Date__c != null){
            String formattedDateStr = ebdAccountData.Current_Deal_Next_Renewal_Date__c.month()+'/'+ebdAccountData.Current_Deal_Next_Renewal_Date__c.day()+'/'+ebdAccountData.Current_Deal_Next_Renewal_Date__c.year();                  
            ebdWrapper.NextMedicalRenewalDate = formattedDateStr;
        }
        if(ebdAccountData.Surest_Current_Deal_Start_Date__c != null){
            String formattedDateStr = ebdAccountData.Surest_Current_Deal_Start_Date__c.month()+'/'+ebdAccountData.Surest_Current_Deal_Start_Date__c.day()+'/'+ebdAccountData.Surest_Current_Deal_Start_Date__c.year();                  
            ebdWrapper.surestCurrentMedicalRenewalDate = formattedDateStr;
        }
        if(ebdAccountData.Surest_Next_Renewal_Date__c != null){
            String formattedDateStr = ebdAccountData.Surest_Next_Renewal_Date__c.month()+'/'+ebdAccountData.Surest_Next_Renewal_Date__c.day()+'/'+ebdAccountData.Surest_Next_Renewal_Date__c.year();                  
            ebdWrapper.surestNextMedicalRenewalDate = formattedDateStr;
        }
       List<EBD__c> ebdListData = new  List<EBD__c>();
        for(EBD__c ebd: ebdAccountData.EBDs__r){
            ebdListData.add(ebd);
        }
        if (!ebdListData.isEmpty()) {
            ebdWrapper.getEbdListData = ebdListData[0];
        } 
        List<SeniorUHGExecutivesEngaged__c> seniorExecutiveList = new List<SeniorUHGExecutivesEngaged__c>();
        for (SeniorUHGExecutivesEngaged__c exec : ebdAccountData.Senior_UHG_Executives_Engages__r) {
            seniorExecutiveList.add(exec);
        }
        if (!seniorExecutiveList.isEmpty()) {
            ebdWrapper.getSeniorExecutiveListData = seniorExecutiveList[0];
        } 
        List<AccountContactRelation> companyConsultants = new List<AccountContactRelation>();
         for (AccountContactRelation ac : ebdAccountData.AccountContactRelations) {
            companyConsultants.add(ac);
        }
        ebdWrapper.getConsultantsData =companyConsultants;
        List<Contact>  companyContacts = new List<Contact>();
        for(Contact con:ebdAccountData.Contacts){
            companyContacts.add(con);
        }
        ebdWrapper.getCompanyContactsData =companyContacts;
        List<Competitor__c> companyCurrentUHCCompetitors = new List<Competitor__c>();
        for(Competitor__c comp:ebdAccountData.Competitors__r){
            companyCurrentUHCCompetitors.add(comp);
        }
        ebdWrapper.getCompetitorData =companyCurrentUHCCompetitors;
        List<ClientSurveyResults__c> companyFinDetails = new List<ClientSurveyResults__c>();
        for(ClientSurveyResults__c cr :ebdAccountData.Client_Survey_Results__r)
        {
            companyFinDetails.add(cr);
        }
        Map<String,Object> clientSurveyResult = new Map<String,Object>();
        clientSurveyResult = ClientProfileController.getClientNPSSurveyResultData(companyFinDetails);
        ebdWrapper.getFinanicalData = clientSurveyResult;
        
       /* if(ebdAccountData.Client_Survey_Results__r.size() > 0){
List<ClientSurveyResults__c> companyFinDetails = ebdAccountData.Client_Survey_Results__r;
Map<String,Object> clientSurveyResult = new Map<String,Object>();
clientSurveyResult = ClientProfileController.getClientNPSSurveyResultData(companyFinDetails);
ebdWrapper.getFinanicalData = clientSurveyResult;
}   */
        /* if(ebdAccountData.EBDs__r.size() > 0){
EBD__c ebdListData = ebdAccountData.EBDs__r[0];
ebdWrapper.getEbdListData= ebdListData;
}

if(!ebdAccountData.Senior_UHG_Executives_Engages__r.isEmpty()){
SeniorUHGExecutivesEngaged__c ebdExecutiveListData = ebdAccountData.Senior_UHG_Executives_Engages__r[0]; 
ebdWrapper.getSeniorExecutiveListData= ebdExecutiveListData;
}
if(ebdAccountData.AccountContactRelations.size()>0){
System.debug('AccountContactRelations'+ebdAccountData.AccountContactRelations.size());
List<AccountContactRelation> companyConsultants = ebdAccountData.AccountContactRelations;
ebdWrapper.getConsultantsData =companyConsultants;

}
if(ebdAccountData.Contacts.size()>0){
List<Contact> companyContacts = ebdAccountData.Contacts;
ebdWrapper.getCompanyContactsData =companyContacts;
}
if(ebdAccountData.Competitors__r.size()>0){
List<Competitor__c> companyCurrentUHCCompetitors = ebdAccountData.Competitors__r;
ebdWrapper.getCompetitorData =companyCurrentUHCCompetitors;
}
if(ebdAccountData.Client_Survey_Results__r.size() > 0){
List<ClientSurveyResults__c> companyFinDetails = ebdAccountData.Client_Survey_Results__r;
Map<String,Object> clientSurveyResult = new Map<String,Object>();
clientSurveyResult = ClientProfileController.getClientNPSSurveyResultData(companyFinDetails);
ebdWrapper.getFinanicalData = clientSurveyResult;
} */
        String bghPeopleString ='';
        if(ebdAccountData.BGH_s1__r.size() > 0){
            List<BGH__c> bghList = ebdAccountData.BGH_s1__r;
            List<String> bghNamesList = new List<String>();
            for(BGH__c bg:bghList){
                bghNamesList.add(bg.BGH_Account__r.Name);
            }
            if(bghNamesList.size() >0)
            {
                bghPeopleString = String.join(bghNamesList,';');
            }
        }
        ebdWrapper.bghData=bghPeopleString; 
        Map<String, Map<String, Object>> financialDataOfCompany = getfinancialsData(companyId);
        ebdWrapper.getDetailedFinancialData = financialDataOfCompany;
        if (ebdAccountData.EBDs__r != null && !ebdAccountData.EBDs__r.isEmpty()) {
            //EBD__c ebdListData = ebdAccountData.EBDs__r[0];
            //EBD__c ebdListData = ebdListData;
            
           // ebdWrapper.getEbdListData = ebdListData;
            ebdChildData = [
                SELECT Id, Name, Brief_Company_Description__c, Involvement_In_CAC__c, X5_Savings_Plan__c, X10_Savings_Plan__c,
                X20_Savings_Plan__c, Additional_Comments__c,
                (SELECT Id, Client_Representative_s__c, UHG_Representative_s__c, Event__c, Timing__c FROM Entertainments__r),
                (SELECT Id, Strategy__c,Other_Strategy__c, Action_Steps_Planned_Taken__c, Estimated_Completion_Date__c FROM EBD_NPS__r),
                (SELECT Id, UHG_Strategy__c, Client_Priority__c FROM Client_Priorities__r),
                (SELECT Name, UHG_Business_Segment__c,Service_Solution__c, UHG_Buyer_or_Decision_Make__c,Revenue__c FROM B2B__r),
                (SELECT Id, Name, Vendor_Model__c, Site_if_in_house__c,Service__c FROM Advocacies__r),
                (SELECT Id, Name, Product__c,Incumbent__c, Deal_Cycle__c,Status__c  FROM Anticipated_Bid_Cycle_for_Major_Products__r)
                FROM EBD__c
                WHERE Id = :ebdListData[0].Id 
                WITH USER_MODE ORDER BY CreatedDate DESC  LIMIT 1
            ];
            if(ebdChildData.EBD_NPS__r.size() >0){
                List<EBD_NPS__c>  npsDetails = ebdChildData.EBD_NPS__r;
                ebdWrapper.getNpsDetails = npsDetails;
            }
            if(ebdChildData.Entertainments__r.size() >0){
                List<Entertainment__c>  entertainmentDetails = ebdChildData.Entertainments__r;
                ebdWrapper.getEntertainmentDetails = entertainmentDetails;
            }
            if(ebdChildData.Client_Priorities__r.size() >0){
                List<Client_Priority__c>  clientPriorityDetails = ebdChildData.Client_Priorities__r;
                ebdWrapper.getClientPriorityDetails = clientPriorityDetails;
            }
            if(ebdChildData.B2B__r.size() >0){
                List<B2B__c> businessDetails = ebdChildData.B2B__r;
                ebdWrapper.getBusinessDetails = businessDetails;
            }
            if(ebdChildData.Advocacies__r.size() >0){
                List<Advocacy__c> advocacyDetails = ebdChildData.Advocacies__r;
                ebdWrapper.getAdvocacyDetails = advocacyDetails;
            }
            if(ebdChildData.Anticipated_Bid_Cycle_for_Major_Products__r.size()>0){
                List<Anticipated_Bid_Cycle_For_Major_Products__c> anticipatedDetails = ebdChildData.Anticipated_Bid_Cycle_for_Major_Products__r;
                ebdWrapper.getAnticipatedDetails = anticipatedDetails;
            }
        }
        /*}
catch(exception exp){
System.debug('Exception occured in getEbdData(String) method==> '+exp.getMessage());
System.debug('Exception occured in getEbdData(String) method==> '+exp.getLinenumber());
}*/
        System.debug('ebdWrapper'+ebdWrapper);
        return ebdWrapper; 
    }
    public EBDDataWrapper ebdWrapper { get; set; }
    public Boolean isPdf{get;private set;}
    public String ContentTypeValue{get;private set;}
    public String year1 { get; set; }
    public String year2 { get; set; }
    public String year3 { get; set; }
    public String year4 { get; set; }
    public List<String> lastFourYears { get; set; }
    public Map<String, Map<String, String>> financialMapData { get; set; }
    public Map<String, Map<String, String>> detailedFinancialDisplayData { get; set; }
    public List<String> dynamicYears { get; set; }
    public String finyear1 { get; set; }
    public String finyear2 { get; set; }
    public String finyear3 { get; set; }
    public Decimal totalMembership1 { get; set; }
    public Decimal totalMembership2 { get; set; }
    public Decimal totalMembership3 { get; set; }
    public Decimal totalRevenue1 { get; set; }
    public Decimal totalRevenue2 { get; set; }
    public Decimal totalRevenue3 { get; set; }
    public Decimal totalURS1 { get; set; }
    public Decimal totalURS2 { get; set; }
    public Decimal totalURS3 { get; set; }
    public Decimal totalUHG1 { get; set; }
    public Decimal totalUHG2 { get; set; }
    public Decimal totalUHG3 { get; set; }
    public Decimal surestRevenue1 { get; set; }
    public Decimal surestRevenue2 { get; set; }
    public Decimal surestRevenue3 { get; set; }
    public Decimal surestTotal1 { get; set; }
    public Decimal surestTotal2 { get; set; }
    public Decimal surestTotal3 { get; set; }
    public List<List<String>> csrList { get; set; }
    public EBDController() {
        String companyId = ApexPages.currentPage().getParameters().get('Id');
        ebdWrapper = getEbdData(companyId);
        if(ebdWrapper.getFinanicalData != null){
            Map<String, Object> financialData = (Map<String, Object>) ebdWrapper.getFinanicalData;
            List<String> years = (List<String>) financialData.get('LastFourYears');
            year1 = (years.size() > 0) ? years[0] : '';
            year2 = (years.size() > 1) ? years[1] : '';
            year3 = (years.size() > 2) ? years[2] : '';
            year4 = (years.size() > 3) ? years[3] : '';
            List<Object> rawList = (List<Object>) financialData.get('CSRFinalList');
            csrList = new List<List<String>>();
            for (Object row : rawList) {
                List<Object> rowItems = (List<Object>) row;
                List<String> strRow = new List<String>();
                for (Object val : rowItems) {
                    strRow.add(val != null ? String.valueOf(val) : '');
                }
                csrList.add(strRow);
            }}
        if(ebdWrapper.getDetailedFinancialData != null){
            Map<String, Map<String, Object>> data = ebdWrapper.getDetailedFinancialData;
            List<String> years = new List<String>(data.keySet());
            years.sort();
            List<String> reversedYears = new List<String>();
            for (Integer i = years.size() - 1; i >= 0; i--) {
                reversedYears.add(years[i]);
            }
            years = reversedYears; 
            if (years.size() > 0) {
                finyear1 = years[0];
                Map<String, Object> y1 = data.get(finyear1);
                totalMembership1 = (Decimal)y1.get('Total_Membership');
                totalRevenue1 = (Decimal)y1.get('Total_Revenue');
                totalURS1 = (Decimal)y1.get('Total_Urs');
                totalUHG1 = (Decimal)y1.get('Total_UHG');
                surestRevenue1 = (Decimal)y1.get('Surest_Revenue');
                surestTotal1 = (Decimal)y1.get('Surest_Membership');
            }
            if (years.size() > 1) {
                finyear2 = years[1];
                Map<String, Object> y2 = data.get(finyear2);
                totalMembership2 = (Decimal)y2.get('Total_Membership');
                totalRevenue2 = (Decimal)y2.get('Total_Revenue');
                totalURS2 = (Decimal)y2.get('Total_Urs');
                totalUHG2 = (Decimal)y2.get('Total_UHG');
                surestRevenue2 = (Decimal)y2.get('Surest_Revenue');
                surestTotal2 = (Decimal)y2.get('Surest_Membership');
            }
            if (years.size() > 2) {
                finyear3 = years[2];
                Map<String, Object> y3 = data.get(finyear3);
                totalMembership3 = (Decimal)y3.get('Total_Membership');
                totalRevenue3 = (Decimal)y3.get('Total_Revenue');
                totalURS3 = (Decimal)y3.get('Total_Urs');
                totalUHG3 = (Decimal)y3.get('Total_UHG');
                surestRevenue3 = (Decimal)y3.get('Surest_Revenue');
                surestTotal3 = (Decimal)y3.get('Surest_Membership');
            }
            
        }
        map<String,String> UrlParameterMap = ApexPages.currentPage().getParameters();
        for(String str:UrlParameterMap.keySet()){
            if(str =='wordReport'){
                this.isPdf=true;
            }
        }
        if(this.isPdf == true){
            this.ContentTypeValue = 'application/msword#';
            this.ContentTypeValue += this.getWordFileName()+'.doc';
        }
    }
    //get file name for print doc
    private String getWordFileName() {
        Integer month =Date.today().month();
        Integer yearNo =Date.today().year();
        String valMonth = System.Label.EBD_Validation_Month;
        if(month>=Integer.valueOf(valMonth)){
            yearNo =yearNo+1;
        }
        String year = String.valueOf(yearNo);
        String ebdName = ebdwrapper.getAccountInfo.Name.replaceAll('[\\.,&\\+\\/]', '_');
        String docName = 'EBD-' + ebdName + '-' + year  ;
        return docName;
    }
    
    //Deletes all ClientPriority records linked to the given EBD record which is passed as parameter.
    @AuraEnabled
    public static void deleteClientPriorityRecord(String ebdId) {
        if (ebdId != null) {
            ebdId = ebdId.replace('"', '');
        }
        if (String.isNotBlank(ebdId)) {
            List<Client_Priority__c> recordsToDelete = [
                SELECT Id 
                FROM Client_Priority__c 
                WHERE EBD__c = :ebdId WITH USER_MODE
            ];
            if (!recordsToDelete.isEmpty()) {
                delete as user recordsToDelete;
            } 
        } 
    }
    //Deletes all entertainment records linked to the given EBD record which is passed as parameter.
    
    @AuraEnabled
    public static void deleteEntertainmentRecord(String ebdId) {
        if (ebdId != null) {
            ebdId = ebdId.replace('"', '');
        }
        if (String.isNotBlank(ebdId)) {
            List<Entertainment__c> recordsToDelete = [
                SELECT Id 
                FROM Entertainment__c 
                WHERE EBD__c = :ebdId WITH USER_MODE
            ];
            if (!recordsToDelete.isEmpty()) {
                delete as user recordsToDelete ;
            } 
        } 
    }
    //Deletes all Business records linked to the given EBD record which is passed as parameter.
    @AuraEnabled
    public static void deleteBusinessRecord(String ebdId) {
        if (ebdId != null) {
            ebdId = ebdId.replace('"', '');
        }
        if (String.isNotBlank(ebdId)) {
            List<B2B__c> recordsToDelete = [
                SELECT Id 
                FROM B2B__c 
                WHERE EBD__c = :ebdId WITH USER_MODE
            ];
            if (!recordsToDelete.isEmpty()) {
                delete as user recordsToDelete;
            } 
        } 
    }
    //Deletes all Advocacy records linked to the given EBD record which is passed as parameter.
    @AuraEnabled
    public static void deleteAdvocacyRecord(String ebdId) {
        if (ebdId != null) {
            ebdId = ebdId.replace('"', '');
        }
        if (String.isNotBlank(ebdId)) {
            List<Advocacy__c> recordsToDelete = [
                SELECT Id 
                FROM Advocacy__c 
                WHERE EBD__c = :ebdId WITH USER_MODE
            ];
            if (!recordsToDelete.isEmpty()) {
                delete as user recordsToDelete;
            } 
        } 
    }
    //Clears all Strategy plan fields linked to the given EBD record which is passed as parameter.
    
    @AuraEnabled
    public static void deletePlanRecord(String ebdId) {
        if (ebdId != null) {
            ebdId = ebdId.replace('"', '');
        }
        if (String.isNotBlank(ebdId)) {
            if (Schema.sObjectType.EBD__c.isAccessible() &&
                Schema.sObjectType.EBD__c.isUpdateable() &&
                Schema.sObjectType.EBD__c.fields.X5_Savings_Plan__c.isUpdateable() &&
                Schema.sObjectType.EBD__c.fields.X10_Savings_Plan__c.isUpdateable() &&
                Schema.sObjectType.EBD__c.fields.X20_Savings_Plan__c.isUpdateable()) {
                    EBD__c ebdRecord = [
                        SELECT Id, X5_Savings_Plan__c, X10_Savings_Plan__c, X20_Savings_Plan__c
                        FROM EBD__c
                        WHERE Id = :ebdId with USER_MODE
                        LIMIT 1
                    ];
                    
                    ebdRecord.X5_Savings_Plan__c = null;
                    ebdRecord.X10_Savings_Plan__c = null;
                    ebdRecord.X20_Savings_Plan__c = null;
                    
                    update as user ebdRecord;
                }
        }
        
    }
    //Clears all Additional comments field  linked to the given EBD record which is passed as parameter.
    @AuraEnabled
    public static void deleteAdditionalComments(String ebdId) {
        if (ebdId != null) {
            ebdId = ebdId.replace('"', '');
        }
        if (String.isNotBlank(ebdId)) {
            if (Schema.sObjectType.EBD__c.isAccessible() &&
                Schema.sObjectType.EBD__c.isUpdateable() &&
                Schema.sObjectType.EBD__c.fields.Additional_Comments__c.isUpdateable()) {
                    EBD__c ebdRecord = [
                        SELECT Id,Additional_Comments__c
                        FROM EBD__c
                        WHERE Id = :ebdId with USER_MODE
                        LIMIT 1
                    ];
                    
                    ebdRecord.Additional_Comments__c ='';
                    update as user ebdRecord;
                }
        }
        
    }
    //Deletes all NPS records linked to the given EBD record.
    @AuraEnabled
    public static void deleteNpsRecord(String ebdId) {
        if (ebdId != null) {
            ebdId = ebdId.replace('"', '');
        }
        if (String.isNotBlank(ebdId)) {
            List<EBD_NPS__c> recordsToDelete = [
                SELECT Id 
                FROM EBD_NPS__c 
                WHERE EBD__c = :ebdId WITH USER_MODE
            ];
            if (!recordsToDelete.isEmpty()) {
                delete as user recordsToDelete;
            } 
        } 
    }
    //Deletes all Anticipated records linked to the given EBD record.
    @AuraEnabled
    public static void deleteAnticipatedRecord(String ebdId) {
        if (ebdId != null) {
            ebdId = ebdId.replace('"', '');
        }
        if (String.isNotBlank(ebdId)) {
            List<Anticipated_Bid_Cycle_For_Major_Products__c> recordsToDelete = [
                SELECT Id 
                FROM Anticipated_Bid_Cycle_For_Major_Products__c 
                WHERE EBD__c = :ebdId WITH USER_MODE
            ];
            if (!recordsToDelete.isEmpty()) {
                delete as user recordsToDelete;
            } 
        } 
    }
    //Deletes all child  records(Entertainment, Business, Advocacy,Anticipated,Nps records) linked to the given EBD record and also clears the ebd field data which is passed as parameter.
    
    @AuraEnabled 
    public static void clearAllDataOnEbdData(String ebdId){
        List<SObject> clearAll = new List<SObject>();
        System.debug('ebdId in delete: ' + ebdId);
        if (String.isBlank(ebdId)) {
            throw new AuraHandledException('EBD Id is required');
        }
        else  {
            ebdId = ebdId.replace('"', '');
        }
        EBD__C ebdRec=
            [SELECT Id, Name, Brief_Company_Description__c, Involvement_In_CAC__c, X5_Savings_Plan__c, X10_Savings_Plan__c,
             X20_Savings_Plan__c, Additional_Comments__c,UHC_Services__c,Client_s_Interest__c,Company__c,
             (SELECT Id, Client_Representative_s__c, UHG_Representative_s__c, Event__c, Timing__c FROM Entertainments__r),
             (SELECT Id, Strategy__c, Action_Steps_Planned_Taken__c, Estimated_Completion_Date__c FROM EBD_NPS__r),
             (SELECT Id, UHG_Strategy__c, Client_Priority__c FROM Client_Priorities__r),
             (SELECT Name, UHG_Business_Segment__c, UHG_Buyer_or_Decision_Make__c,Service_Solution__c FROM B2B__r),
             (SELECT Id, Name, Vendor_Model__c, Site_if_in_house__c,Service__c FROM Advocacies__r),
             (SELECT Id, Name, Incumbent__c, Deal_Cycle__c,Product__c,Status__c FROM Anticipated_Bid_Cycle_for_Major_Products__r)
             FROM EBD__c  WHERE Id = :ebdId WITH USER_MODE];
        clearAll.addAll(ebdRec.Entertainments__r);
        clearAll.addAll(ebdRec.EBD_NPS__r);
        clearAll.addAll(ebdRec.Client_Priorities__r);
        clearAll.addAll(ebdRec.B2B__r);
        clearAll.addAll(ebdRec.Advocacies__r);
        clearAll.addAll(ebdRec.Anticipated_Bid_Cycle_for_Major_Products__r);
        List<Competitor__c> competitors = [SELECT Id, Name, Strength__c,Account__r.Name,Tenure__c, Account__c, Inactive_Competitor_Status__c, Competitorclassification__c, Type_of_Products_Services_Provided__c, CompetitorAccount__r.Name,Inactive_Competitor_Date__c
                                           FROM Competitor__c WHERE Inactive_Competitor_Status__c = false AND Competitorclassification__c =  'Other' AND Account__c=: ebdRec.Company__c  AND CompetitorAccount__r.Name!= 'UHC-Optum'] ;
        
        Integer currentYear = Date.today().year();
        List<Integer> yearList = new List<Integer>{currentYear - 2, currentYear - 1, currentYear};
            
            List<Financial__c> financials =  [SELECT Id, Year__c, Membership__c, Revenue__c, Revenue_Total_UHG__c, Revenue_URS__c, Financial_Type__c, Membership_Type__c FROM Financial__c WHERE Company__c = :ebdRec.Company__c AND Membership_Type__c = 'Medical' AND CALENDAR_YEAR(Year__c) IN :yearList];
        
        try {
            if (!clearAll.isEmpty()) {
                delete clearAll;
            }
            if (Schema.sObjectType.EBD__c.isAccessible() &&
                Schema.sObjectType.EBD__c.isUpdateable() &&
                Schema.sObjectType.EBD__c.fields.X5_Savings_Plan__c.isUpdateable() &&
                Schema.sObjectType.EBD__c.fields.X10_Savings_Plan__c.isUpdateable() &&
                Schema.sObjectType.EBD__c.fields.X20_Savings_Plan__c.isUpdateable() && 
                Schema.sObjectType.EBD__c.fields.Additional_Comments__c.isUpdateable() ) {
                    ebdRec.X5_Savings_Plan__c = '';
                    ebdRec.X10_Savings_Plan__c = '';
                    ebdRec.X20_Savings_Plan__c = '';
                    ebdRec.Relationship_History__c = '';
                    ebdRec.Brief_Company_Description__c = '';
                    ebdRec.Additional_Comments__c = '';
                    ebdRec.Client_s_Interest__c ='';
                    ebdRec.UHC_Services__c ='';
                    ebdRec.Involvement_In_CAC__c =false;
                    update as user ebdRec;
                }
            List<Competitor__c> competitorsToUpdate = new List<Competitor__c>();
            if(!competitors.isEmpty()){
                for(Competitor__c eachRec:competitors){
                    if((Schema.sObjectType.Competitor__c.isAccessible() &&
                        Schema.sObjectType.Competitor__c.isUpdateable())){
                            eachRec.Tenure__c = '';
                            eachRec.Strength__c = '';
                            competitorsToUpdate.add(eachRec);
                        }
                }
                if (!competitorsToUpdate.isEmpty()) {
                    update competitorsToUpdate;
                }		
            }
            List<Financial__c> financialsToUpdate = new List<Financial__c>();
            if(!financials.isEmpty()){
                for(Financial__c eachRec:financials){
                    if((Schema.sObjectType.Financial__c.isAccessible() &&
                        Schema.sObjectType.Financial__c.isUpdateable())){
                            eachRec.Revenue_URS__c = null;
                            eachRec.Revenue_Total_UHG__c = null;
                            financialsToUpdate.add(eachRec);
                        }
                }
                if (!financialsToUpdate.isEmpty()) {
                    update financialsToUpdate;
                }		
            }
            
        }catch (Exception e) {
            throw new AuraHandledException('Error during clear : ' + e.getMessage());
        }
    }
    /***********
Purpose: Retrieves and organizes financial data for a company over the last three years.
Parameters: Id companyId: The Id of the company to fetch financial data for.    Parameters:- String ebdId: The Id of the EBD record to clear
Returns: Map<String, Map<String, Object>> containing structured financial information for each year.
**********/
    @AuraEnabled (cacheable=true)
    public static Map<String, Map<String, Object>> getfinancialsData(Id companyId) {
        Map<String, Map<String, Object>> financialData = new Map<String, Map<String, Object>>();
        Integer currentYear = Date.today().year();
        List<Integer> yearList = new List<Integer>{currentYear - 2, currentYear - 1, currentYear};
            List<Financial__c> records = [
                SELECT Id, Year__c, Membership__c, Revenue__c, Revenue_Total_UHG__c, Revenue_URS__c,
                Financial_Type__c, Membership_Type__c
                FROM Financial__c
                WHERE Company__c = :companyId
                AND Membership_Type__c = 'Medical' 
                AND CALENDAR_YEAR(Year__c) IN :yearList WITH USER_MODE
            ];
        
        for (Financial__c rec : records) {
            if (rec.Year__c == null || rec.Financial_Type__c == null) {
                continue;
            }
            String yearStr = String.valueOf(rec.Year__c.year());
            String type = rec.Financial_Type__c;
            if (!financialData.containsKey(yearStr)) {
                financialData.put(yearStr, new Map<String, Object>());
            }
            Map<String, Object> yearData = financialData.get(yearStr);
            if (type == 'Total') {
                yearData.put('Total_Membership', rec.Membership__c);
                yearData.put('Total_Revenue', rec.Revenue__c);
                yearData.put('Total_Id', rec.Id);
                yearData.put('Total_Urs', rec.Revenue_URS__c);
                yearData.put('Total_UHG', rec.Revenue_Total_UHG__c);
            } else if (type == 'Surest') {
                yearData.put('Surest_Membership', rec.Membership__c);
                yearData.put('Surest_Revenue', rec.Revenue__c);
            }
        }
        for (Integer year : yearList) {
            String yearStr = String.valueOf(year);
            if (!financialData.containsKey(yearStr)) {
                financialData.put(yearStr, new Map<String, Object>());
            }
            Map<String, Object> yearMap = financialData.get(yearStr);
            if (!yearMap.containsKey('Total_Membership')) yearMap.put('Total_Membership', null);
            if (!yearMap.containsKey('Total_Revenue')) yearMap.put('Total_Revenue', null);
            if (!yearMap.containsKey('Total_Id')) yearMap.put('Total_Id', null);
            if (!yearMap.containsKey('Total_Urs')) yearMap.put('Total_Urs', null);
            if (!yearMap.containsKey('Total_UHG')) yearMap.put('Total_UHG', null);
            if (!yearMap.containsKey('Surest_Membership')) yearMap.put('Surest_Membership', null);
            if (!yearMap.containsKey('Surest_Revenue')) yearMap.put('Surest_Revenue', null);
        }
        system.debug('Veera'+financialData);
        return financialData;
    }
    /********
*Purpose: Inserts or updates an EBD record along with its related child records, and deletes any specified records.
Parameters:
- EBD ebd: Parent EBD record to insert or update.
- Lists of child objects (Entertainment, Client Priority, B2B, Advocacy, EBD NPS, Anticipated Bid Cycle For Major Products)
and corresponding lists of Ids to delete.
- List<Competitor> competitors:  competitor record swill be updated.
- List<Financial> updatedFinancials: Optional financial records to update.
- Id companyId: The Id of the company associated with this EBD.
Behavior:
- Inserts or updates the parent EBD record.
- Sets the EBD Id on child records.
- Skips empty child records where all relevant fields are null.
- Upserts valid child records.
- Deletes records listed in the "ToDelete" lists.
**********************/
    @AuraEnabled
    public static void saveEbdData(EBD__c ebd,List<Entertainment__c> entertainments,List<Id> entertainmentToDelete,List<Client_Priority__c> clientPriorities,List<Id> clientPriorityToDelete,
                                   List<B2B__c> business, List<Id> businessToDelete, List<Advocacy__c> advocacy, List<Id> advocacytoDelete,List<EBD_NPS__c> npsTo,List<Id> npsToDelete,
                                   List<Anticipated_Bid_Cycle_For_Major_Products__c> anticipated,List<Id> anticipatedToDelete,List<Competitor__c> competitors, 
                                   List<Financial__c> updatedFinancials,Id companyId) {
                                       if (ebd != null) {
                                           if ((ebd.Id == null && Schema.sObjectType.EBD__c.isCreateable()) || (ebd.Id != null && Schema.sObjectType.EBD__c.isUpdateable())) {
                                               if (Schema.sObjectType.EBD__c.fields.Company__c.isUpdateable()) {
                                                   ebd.Company__c = companyId;
                                               }
                                               upsert as user ebd;
                                           }
                                       }
                                       
                                       if (entertainments != null && !entertainments.isEmpty()) {
                                           if (Schema.sObjectType.Entertainment__c.isAccessible() &&
                                               Schema.sObjectType.Entertainment__c.isUpdateable() &&
                                               Schema.sObjectType.Entertainment__c.fields.EBD__c.isUpdateable()) {
                                                   
                                                   List<Entertainment__c> validEntertainments = new List<Entertainment__c>();
                                                   List<Entertainment__c> emptyEntertainments = new List<Entertainment__c>();
                                                   
                                                   for (Entertainment__c e : entertainments) {
                                                       e.EBD__c = ebd.Id;
                                                       
                                                       // Skip only if all relevant fields are null
                                                       if ((e.Client_Representative_s__c == null || e.Client_Representative_s__c.trim() == '') &&
                                                           (e.Event__c == null || e.Event__c.trim() == '') &&
                                                           (e.UHG_Representative_s__c == null || e.UHG_Representative_s__c.trim() == '') &&
                                                           (e.Timing__c == null || e.Timing__c.trim() == ''))  {
                                                               emptyEntertainments.add(e);
                                                           } else {
                                                               validEntertainments.add(e);
                                                           }
                                                   }
                                                   
                                                   if (!validEntertainments.isEmpty()) {
                                                       upsert validEntertainments;
                                                   }
                                                   
                                               }
                                       }
                                       
                                       if (!entertainmentToDelete.isEmpty()) {
                                           List<Entertainment__c> toDelEnt = [SELECT Id FROM Entertainment__c WHERE Id IN :entertainmentToDelete];
                                           if(!toDelEnt.isEmpty()){
                                               delete as user toDelEnt;
                                           }
                                       }
                                       if (clientPriorities != null) {
                                           if (Schema.sObjectType.Client_Priority__c.isAccessible() &&
                                               Schema.sObjectType.Client_Priority__c.isUpdateable() &&
                                               Schema.sObjectType.Client_Priority__c.fields.EBD__c.isUpdateable()) {
                                                   List<Client_Priority__c> validPriority = new List<Client_Priority__c>();
                                                   List<Client_Priority__c> emptyPriority = new List<Client_Priority__c>();
                                                   for (Client_Priority__c c : clientPriorities) {
                                                       c.EBD__c = ebd.Id;
                                                       if ((c.Client_Priority__c == null || c.Client_Priority__c.trim() == '') &&
                                                           (c.UHG_Strategy__c == null || c.UHG_Strategy__c.trim() == ''))  {
                                                               emptyPriority.add(c);
                                                           } else {
                                                               validPriority.add(c);
                                                           }
                                                   }
                                                   
                                                   if (!validPriority.isEmpty()) {
                                                       upsert as user validPriority;
                                                   }
                                               }
                                       }
                                       
                                       
                                       
                                       if (!clientPriorityToDelete.isEmpty()) {
                                           List<Client_Priority__c> toDelClp = [SELECT Id FROM Client_Priority__c WHERE Id IN :clientPriorityToDelete];
                                           if(!toDelClp.isEmpty()){
                                               delete as user toDelClp;
                                           }
                                       }
                                       if (business != null) {
                                           if (Schema.sObjectType.B2B__c.isAccessible() &&
                                               Schema.sObjectType.B2B__c.isUpdateable() &&
                                               Schema.sObjectType.B2B__c.fields.EBD__c.isUpdateable()) {
                                                   List<B2B__c> validBusiness = new List<B2B__c>();
                                                   List<B2B__c> emptyBusiness = new List<B2B__c>();
                                                   for (B2B__c c : business) {
                                                       c.EBD__c = ebd.Id;
                                                       if ((c.Name == null || c.Name.trim() == '') &&
                                                           (c.UHG_Business_Segment__c == null || c.UHG_Business_Segment__c.trim() == '')&&
                                                           (c.Service_Solution__c == null || c.Service_Solution__c.trim() == '')
                                                           &&  (c.UHG_Buyer_or_Decision_Make__c == null || c.UHG_Buyer_or_Decision_Make__c.trim() == '')
                                                           && (c.Revenue__c == null ))  {
                                                               emptyBusiness.add(c);
                                                           } else {
                                                               validBusiness.add(c);
                                                           }
                                                   }
                                                   if (!validBusiness.isEmpty()) {
                                                       upsert as user validBusiness;
                                                   }
                                                   //upsert as user business;
                                               }
                                       }
                                       if (!businessToDelete.isEmpty()) {
                                           List<B2B__c> toDelBb = [SELECT Id FROM B2B__c WHERE Id IN :businessToDelete];
                                           if(!toDelBb.isEmpty()){
                                               delete as user toDelBb;
                                           }
                                       }
                                       if (advocacy != null) {
                                           if (Schema.sObjectType.Advocacy__c.isAccessible() &&
                                               Schema.sObjectType.Advocacy__c.isUpdateable() &&
                                               Schema.sObjectType.Advocacy__c.fields.EBD__c.isUpdateable()) {
                                                   List<Advocacy__c> validAdvocacy = new List<Advocacy__c>();
                                                   List<Advocacy__c> emptyAdvocacy = new List<Advocacy__c>();
                                                   for (Advocacy__c c : advocacy) {
                                                       c.EBD__c = ebd.Id;
                                                       if ((c.Name == null || c.Name.trim() == '') && 
                                                           (c.Service__c == null || c.Service__c.trim() == '') &&
                                                           (c.Vendor_Model__c == null || c.Vendor_Model__c.trim() == '')
                                                           && (c.Site_if_in_house__c == null || c.Site_if_in_house__c.trim() == ''))  {
                                                               emptyAdvocacy.add(c);
                                                           } else {
                                                               validAdvocacy.add(c);
                                                           }
                                                   }
                                                   if (!validAdvocacy.isEmpty()) {
                                                       upsert as user validAdvocacy;
                                                   }
                                                   //upsert as user advocacy;
                                               }
                                       }
                                       if (!advocacytoDelete.isEmpty()) {
                                           List<Advocacy__c> toDelAdv = [SELECT Id FROM Advocacy__c WHERE Id IN :advocacytoDelete];
                                           if(!toDelAdv.isEmpty()){
                                               delete as user toDelAdv;
                                           }
                                       }
                                       if (npsTo != null) {
                                           if (Schema.sObjectType.EBD_NPS__c.isAccessible() &&
                                               Schema.sObjectType.EBD_NPS__c.isUpdateable() &&
                                               Schema.sObjectType.EBD_NPS__c.fields.EBD__c.isUpdateable()) {
                                                   List<EBD_NPS__c> validNps = new List<EBD_NPS__c>();
                                                   List<EBD_NPS__c> emptyNps = new List<EBD_NPS__c>();
                                                   for (EBD_NPS__c c : npsTo) {
                                                       c.EBD__c = ebd.Id;
                                                       if ((c.Strategy__c == null || c.Strategy__c.trim() == '') &&
                                                           (c.Action_Steps_Planned_Taken__c == null || c.Action_Steps_Planned_Taken__c.trim() == '')
                                                           && (c.Estimated_Completion_Date__c == null))  {
                                                               emptyNps.add(c);
                                                           } else {
                                                               validNps.add(c);
                                                           }
                                                       
                                                   }
                                                   if (!validNps.isEmpty()) {
                                                       upsert as user validNps;
                                                   }
                                                   
                                                   //upsert as user npsTo;
                                               }
                                       }
                                       if (!npsToDelete.isEmpty()) {
                                           List<EBD_NPS__c> toDelNps = [SELECT Id FROM EBD_NPS__c WHERE Id IN :npsToDelete];
                                           if(!toDelNps.isEmpty()){
                                               delete as user toDelNps;
                                           }
                                       }
                                       
                                       if(anticipated != null){
                                           if (Schema.sObjectType.Anticipated_Bid_Cycle_For_Major_Products__c.isAccessible() &&
                                               Schema.sObjectType.Anticipated_Bid_Cycle_For_Major_Products__c.isUpdateable() &&
                                               Schema.sObjectType.Anticipated_Bid_Cycle_For_Major_Products__c.fields.EBD__c.isUpdateable()) {
                                                   
                                                   List<Anticipated_Bid_Cycle_For_Major_Products__c> validAnticipated = new List<Anticipated_Bid_Cycle_For_Major_Products__c>();
                                                   List<Anticipated_Bid_Cycle_For_Major_Products__c> emptyAnticipated = new List<Anticipated_Bid_Cycle_For_Major_Products__c>();
                                                   for(Anticipated_Bid_Cycle_For_Major_Products__c ab :anticipated){
                                                       ab.EBD__c = ebd.Id;
                                                       if ((ab.Product__c == null || ab.Product__c.trim() == '') &&
                                                           (ab.Incumbent__c == null || ab.Incumbent__c.trim() == '')
                                                           && (ab.Status__c == null || ab.Status__c.trim() == '') 
                                                           &&  (ab.Deal_Cycle__c == null || ab.Deal_Cycle__c.trim() == '') )  {
                                                               emptyAnticipated.add(ab);
                                                           } else {
                                                               validAnticipated.add(ab);
                                                           }
                                                   }
                                                   if (!validAnticipated.isEmpty()) {
                                                       upsert as user validAnticipated;
                                                   }
                                                   // upsert as user anticipated;
                                               }
                                       }
                                       if(!anticipatedToDelete.isEmpty()){
                                           List<Anticipated_Bid_Cycle_For_Major_Products__c> toDelAnt = [SELECT Id FROM Anticipated_Bid_Cycle_For_Major_Products__c WHERE Id IN :anticipatedToDelete];
                                           if(!toDelAnt.isEmpty()){
                                               delete as user toDelAnt;
                                           }
                                       }
                                       if (competitors != null && !competitors.isEmpty()) {
                                           List<Competitor__c> validCompetitors = new List<Competitor__c>();
                                           for (Competitor__c comp : competitors) {
                                               if (comp.Id != null) {
                                                   validCompetitors.add(new Competitor__c(
                                                       Id = comp.Id,
                                                       Strength__c = comp.Strength__c,
                                                       Tenure__c = comp.Tenure__c
                                                   ));
                                               }
                                           }
                                           
                                           if (!validCompetitors.isEmpty()) {
                                               update as user validCompetitors;
                                           }
                                       }
                                       
                                       if (updatedFinancials == null || updatedFinancials.isEmpty()) {
                                           return;
                                       }
                                       
                                       List<Financial__c> validUpdates = new List<Financial__c>();
                                       for (Financial__c rec : updatedFinancials) {
                                           if (rec.Id != null) {
                                               validUpdates.add(rec);
                                           } 
                                       }
                                       if (!validUpdates.isEmpty()) {
                                           try {
                                               update as user validUpdates;
                                           } catch (Exception e) {
                                               System.debug(' Error during update: ' + e.getMessage());
                                           }
                                       } 
                                   }
    @AuraEnabled(cacheable=true)
    public static List<String> getStrategyOptions() {
        Schema.DescribeFieldResult fieldResult = EBD_NPS__c.Strategy__c.getDescribe();
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
        List<String> options = new List<String>();
        for (Schema.PicklistEntry entry : picklistValues) {
            options.add(entry.getLabel()); 
        }
        return options;
    }
    @AuraEnabled(cacheable=true)
    public static List<String> getStatusOptions(){
        Schema.DescribeFieldResult fieldResult = Anticipated_Bid_Cycle_For_Major_Products__c.Status__c.getDescribe();
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
        List<String> options = new List<String>();
        for (Schema.PicklistEntry entry : picklistValues) {
            options.add(entry.getLabel()); 
        }
        return options;
    }
    /****************
Purpose: Updates validation information on an Account and manages associated EBD Word document storage.
Parameters:
- Id companyId: The Id of the Account to update.
Behavior:
- Validates that companyId is not null.
- Queries the current user and the Account record.
- Updates EBD_Sce_Validation__c with the current user's Id and EBD_Sce_Validated_Time__c with the current timestamp.
- Generates a Word document using a Visualforce page (Page.EBDWordDocVfPage) for the Account.
- Checks if a document for the current year already exists:
- If yes, creates a new ContentVersion for the existing document (versioning).
- If no, inserts a new ContentVersion and creates a ContentDocumentLink to the Account.
- Respects field-level security for Account, ContentVersion, and ContentDocumentLink objects.
- Throws AuraHandledException if any error occurs during processing
*********************/
    @AuraEnabled
    public static void updateSCEValidationInfo(Id companyId) {
        if (companyId == null) {
            return;
        }
        try {
            User currentUser = [SELECT Id, Name FROM User WHERE Id = :UserInfo.getUserId()];
            Account acc = [SELECT Id, Name, EBD_Sce_Validation__c, EBD_Sce_Validated_Time__c FROM Account WHERE Id = :companyId WITH USER_MODE LIMIT 1];
            if (Schema.sObjectType.Account.isUpdateable() &&
                Schema.sObjectType.Account.fields.EBD_Sce_Validation__c.isUpdateable() &&
                Schema.sObjectType.Account.fields.EBD_Sce_Validated_Time__c.isUpdateable()) {
                    acc.EBD_Sce_Validation__c = currentUser.Id;
                    acc.EBD_Sce_Validated_Time__c = system.now().format();
                    update as user acc;
                }
        }
        catch (Exception e) {
            throw new AuraHandledException('Error updating validation info: ' + e.getMessage());
        }
        
    }
    //uploades file
    @AuraEnabled
    public static void generateAndUploadEBDDocument(Id companyId,Id ebdId) {
        if (companyId == null) {
            return;
        }
        try {
            Account acc = [
                SELECT Id, Name 
                FROM Account 
                WHERE Id = :companyId 
                WITH USER_MODE 
                LIMIT 1
            ];
            
            Integer month =Date.today().month();
            Integer yearNo =Date.today().year();
            String valMonth = System.Label.EBD_Validation_Month;
            if(month>=Integer.valueOf(valMonth)){
                yearNo =yearNo+1;
            }
            String year = String.valueOf(yearNo);
            
             String companyName = acc.Name != null ? acc.Name.trim() : 'Company';
            if (companyName.length() > 40) {
                companyName = companyName.substring(0, 35);
            }
            String ebdName = companyName + '-' + year;
            //String fileName = 'EBD-' + ebdName + '.doc';
            
            
            String fileName = 'EBD-' + acc.Name + '-' + year + '.doc';
            update as user new EBD__c(
                Id = ebdId,
                Name = ebdName,
                Year__c = year
            );
            //String fileName = 'EBD-' + acc.Name + '-' + year + '.doc';
            PageReference pageRef = Page.EBDWordDocVfPage; 
            pageRef.getParameters().put('id', companyId);
            Blob body = pageRef.getContent();
            List<ContentDocumentLink> links = [
                SELECT ContentDocumentId, ContentDocument.LatestPublishedVersion.Title
                FROM ContentDocumentLink
                WHERE LinkedEntityId = :companyId WITH USER_MODE
            ];
            Id existingDocId = null;
            for (ContentDocumentLink link : links) {
                String title = link.ContentDocument.LatestPublishedVersion.Title;
                if (title != null && title.contains(year)) {
                    existingDocId = link.ContentDocumentId;
                    break;
                }
            }
            
            ContentVersion version = new ContentVersion();
            if (Schema.sObjectType.ContentVersion.fields.Title.isCreateable()) {
                //version.Title = 'EBD-' + acc.Name + '-' + year;
                version.Title = 'EBD-' + acc.Name + '-' + year;
            }
            if (Schema.sObjectType.ContentVersion.fields.PathOnClient.isCreateable()) {
                version.PathOnClient = fileName;
            }
            if (Schema.sObjectType.ContentVersion.fields.VersionData.isCreateable()) {
                version.VersionData = body;
            }
            if (existingDocId != null) {
                version.ContentDocumentId = existingDocId;
                insert as user version;
            } else {
                insert as user version;
                version = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id = :version.Id WITH USER_MODE];
                
                ContentDocumentLink link = new ContentDocumentLink();
                if (Schema.sObjectType.ContentDocumentLink.fields.ContentDocumentId.isCreateable()) {
                    link.ContentDocumentId = version.ContentDocumentId;
                }
                if (Schema.sObjectType.ContentDocumentLink.fields.LinkedEntityId.isCreateable()) {
                    link.LinkedEntityId = companyId;
                }
                if (Schema.sObjectType.ContentDocumentLink.fields.ShareType.isCreateable()) {
                    link.ShareType = 'V';
                }
                if (Schema.sObjectType.ContentDocumentLink.fields.Visibility.isCreateable()) {
                    link.Visibility = 'AllUsers';
                }
                insert as user link;
            }
            
        } catch (Exception e) {
            system.debug(e.getMessage()+''+e.getLinenumber());
            throw new AuraHandledException('Error during validation update: ' + e.getMessage()+''+e.getLinenumber());
        }
    }
    @AuraEnabled
    public static List<Map<String, String>> getEBDDocumentsForAccount(Id accountId) {
        List<Map<String, String>> fileList = new List<Map<String, String>>();
        Account acc = [SELECT Id, EBD_Sce_Validated_Time__c, Name FROM Account WHERE Id = :accountId WITH USER_MODE LIMIT 1];
        String timestamp1 = acc.EBD_Sce_Validated_Time__c;
        String yearValue = '';
        /*if (String.isNotBlank(timestamp1)) {
List<String> parts = timestamp1.split(' '); 
if (!parts.isEmpty()) {
List<String> dateParts = parts[0].split('/'); 
if (dateParts.size() == 3) {
yearValue = dateParts[2]; 
}
}
}*/
        String timestamp = yearValue;
        List<ContentDocumentLink> links = [
            SELECT ContentDocumentId, ContentDocument.Title,SystemModstamp
            FROM ContentDocumentLink 
            WHERE LinkedEntityId = :accountId 
            AND ContentDocument.Title LIKE 'EBD-%' WITH USER_MODE
            ORDER BY ContentDocument.LatestPublishedVersionId DESC
        ];
        
        for (ContentDocumentLink link : links) {
            String docId = link.ContentDocumentId;
            String fileName = link.ContentDocument.Title;
            if (String.isNotBlank(fileName)) {
                List<String> parts = fileName.split('-'); 
                yearValue = parts[parts.size()-1];
                /* if (!parts.isEmpty()) {
List<String> dateParts = parts[0].split('/'); 
if (dateParts.size() == 3) {
yearValue = dateParts[2]; 
}
}*/
            }
            if (fileName != null && fileName.startsWith('EBD-')) {
                String formattedName = acc.Name + ' EBD ' + yearValue;
                String downloadUrl = '/sfc/servlet.shepherd/document/download/' + docId;
                Map<String, String> fileInfo = new Map<String, String>{
                    'contentDocumentId' => docId,
                        'fileName' => fileName,
                        'timestamp' => yearValue,//string.valueOf(link.SystemModstamp),
                        'downloadUrl' => downloadUrl
                        };
                            fileList.add(fileInfo);
            }
        }
        return fileList;
    }
    public class FileInfo {
        @AuraEnabled public String title;
        @AuraEnabled public String documentId;
        @AuraEnabled public String versionId;
        @AuraEnabled public String timestamp; 
        @AuraEnabled public String downloadUrl;
    }    
    public class EBDDataWrapper{
        @AuraEnabled
        public String CurrentMedicalDealStartDate { get;set; }
        @AuraEnabled
        public String surestCurrentMedicalRenewalDate { get;set; }
        @AuraEnabled
        public String surestNextMedicalRenewalDate { get;set; }
        @AuraEnabled
        public String NextMedicalRenewalDate { get;set; }
        @AuraEnabled
        public String bghData { get;set; }
        @AuraEnabled
        public EBD__c getEbdListData { get;set; }
        @AuraEnabled 
        public Account getAccountInfo { get;set; }
        @AuraEnabled 
        public SeniorUHGExecutivesEngaged__c getSeniorExecutiveListData { get;set; }
        @AuraEnabled 
        public List<AccountContactRelation> getConsultantsData { get;set; }
        @AuraEnabled 
        public List<Competitor__c> getCompetitorData { get;set; }
        @AuraEnabled 
        public Map<String,Object> getFinanicalData { get;set; }
        @AuraEnabled 
        public Map<String, Map<String, Object>> getDetailedFinancialData { get; set; }
        @AuraEnabled 
        public List<Contact> getCompanyContactsData { get;set; }
        @AuraEnabled 
        public List<EBD_NPS__c> getNpsDetails { get;set; }
        @AuraEnabled 
        public List<Entertainment__c> getEntertainmentDetails { get;set; }
        @AuraEnabled 
        public List<Client_Priority__c> getClientPriorityDetails { get;set; }
        @AuraEnabled 
        public List<B2B__c> getBusinessDetails { get;set; }
        @AuraEnabled 
        public List<Anticipated_Bid_Cycle_For_Major_Products__c> getAnticipatedDetails { get;set; }
        @AuraEnabled 
        public List<Advocacy__c> getAdvocacyDetails { get;set; }
        @AuraEnabled 
        public EBD__c getEbdInfo { get;set; }
    }
}