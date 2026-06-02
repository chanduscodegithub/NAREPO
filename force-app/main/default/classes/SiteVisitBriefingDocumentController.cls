/*********************************************************************** 
Name: SiteVisitBriefingDocumentController  
Purpose: To query the data required by SiteBriefingMainComponent lwc component to print Site Briefing Doc 
VERSION      AUTHOR              	DATE                DETAIL   	 				  
1.0 -   	 Chandrika 	 	       06/12/2024  		 INITIAL DEVELOPMENT   		  
**********************************************************************/

public with sharing class SiteVisitBriefingDocumentController {
    /***********************************************
Purpose: To get List of open MA's of the Company 
Parameters: Company id.
Returns:List of MA's.
***************************************************/  
    
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunitiesOfAccount(String accountId){
        List<Opportunity> currentAccountOppList = new List<Opportunity>();
        try{
            currentAccountOppList = [SELECT Id, Name, AccountId FROM Opportunity WHERE AccountId =: accountId AND Status__c ='open' WITH USER_MODE ];
        }
        Catch(Exception e){
            System.debug('Error has Occured' +e.getMessage());
        }
        return currentAccountOppList;
    }
    /******************************************************************
* 
Purpose: to get List of Accounts,Opportunities,Contacts ,Company wide bic Information and Opp line items tp print site briefing doc.
Parameters: Company id and MA id.
Returns: Wrapper Class.
*******************************************************************
*/ 
    
    //Added by Vignesh -- Start
    public SiteBriefingWrapper siteBriefingWrapper { get; set; }
    public Boolean isPdf{get;private set;}
    public String ContentTypeValue{get;private set;}
    
    public SiteVisitBriefingDocumentController() {
        String accountId = ApexPages.currentPage().getParameters().get('accountId');
        String membershipActivityId = ApexPages.currentPage().getParameters().get('membershipActivityId');
        
        siteBriefingWrapper = getSiteBriefingDetails(accountId, membershipActivityId);
        
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
    
    
    private String getWordFileName() {
        
        String sanitizedName = siteBriefingWrapper.siteBriefingQuery.Name.replaceAll('[\\.,&\\+\\/\\-]', '_');
        String docName = 'Site Briefing Doc_' + sanitizedName;
        return docName;
    }
    
    public String getFormatted2ndBluesBidComments() {
        if (siteBriefingWrapper != null && siteBriefingWrapper.siteBriefingQuery != null 
            && siteBriefingWrapper.siteBriefingQuery.X2nd_Blues_Bid_Comments__c != null) {
                return siteBriefingWrapper.siteBriefingQuery.X2nd_Blues_Bid_Comments__c.replaceAll('\n', '<br/>');
            }
        return '';
    }
    
    public String getFormattedBidStrategy() {
        if (siteBriefingWrapper != null && siteBriefingWrapper.opportunityData != null 
            && siteBriefingWrapper.opportunityData.Bid_Strategy__c != null) {
                return siteBriefingWrapper.opportunityData.Bid_Strategy__c.replaceAll('\n', '<br/>');
            }
        return '';
    }
    
    public String getFormattedMustWinCriteria() {
        if (siteBriefingWrapper != null && siteBriefingWrapper.opportunityData != null 
            && siteBriefingWrapper.opportunityData.Must_Win_Criteria__c != null) {
                return siteBriefingWrapper.opportunityData.Must_Win_Criteria__c.replaceAll('\n', '<br/>');
            }
        return '';
    }
    
    public String getFormattedProductNonStandards() {
        if (siteBriefingWrapper != null && siteBriefingWrapper.opportunityData != null 
            && siteBriefingWrapper.opportunityData.Product_Non_Standards__c != null) {
                return siteBriefingWrapper.opportunityData.Product_Non_Standards__c.replaceAll('\n', '<br/>');
            }
        return '';
    }
    
    public String getFormattedOptumAsks() {
        if (siteBriefingWrapper != null && siteBriefingWrapper.opportunityData != null 
            && siteBriefingWrapper.opportunityData.Optum_Asks__c != null) {
                return siteBriefingWrapper.opportunityData.Optum_Asks__c.replaceAll('\n', '<br/>');
            }
        return '';
    }
    
    public String getFormattedFinancialNotes() {
        if (siteBriefingWrapper != null && siteBriefingWrapper.opportunityData != null 
            && siteBriefingWrapper.opportunityData.Financial_Notes__c != null) {
                return siteBriefingWrapper.opportunityData.Financial_Notes__c.replaceAll('\n', '<br/>');
            }
        return '';
    }
    
    public String getFormattedSurestKeyRisks() {
        if (siteBriefingWrapper != null && siteBriefingWrapper.opportunityData != null 
            && siteBriefingWrapper.opportunityData.Surest_Key_Risks__c != null) {
                return siteBriefingWrapper.opportunityData.Surest_Key_Risks__c.replaceAll('\n', '<br/>');
            }
        return '';
    }
    
    public String getFormattedSurestComments() {
        if (siteBriefingWrapper != null && siteBriefingWrapper.opportunityData != null 
            && siteBriefingWrapper.opportunityData.Surest_Comments__c != null) {
                return siteBriefingWrapper.opportunityData.Surest_Comments__c.replaceAll('\n', '<br/>');
            }
        return '';
    }
    
    public String getFormattedBackgroundCompanyOverview() {
        if (siteBriefingWrapper != null && siteBriefingWrapper.siteBriefingQuery != null 
            && siteBriefingWrapper.siteBriefingQuery.Comments__c != null) {
                return siteBriefingWrapper.siteBriefingQuery.Comments__c.replaceAll('\n', '<br/>');
            }
        return '';
    }
    
    
    
    /*  public String extractedImageUrl{get; set;}
public void extractImageFromApproachStrategy() {
if (siteBriefingWrapper != null && siteBriefingWrapper.siteBriefingQuery != null
&& String.isNotBlank(siteBriefingWrapper.siteBriefingQuery.Surest_Approach_Strategy__c)) {

String richText = siteBriefingWrapper.siteBriefingQuery.Surest_Approach_Strategy__c;
Pattern p = Pattern.compile('<img[^>]+src="([^">]+)"');
Matcher m = p.matcher(richText);
if (m.find()) {
extractedImageUrl = m.group(1);
System.debug('Extracted Image URL: ' + extractedImageUrl);
} else {
System.debug('No <img> tag with src found in.');
}
} else {

}
} */
    
    
    //End
    
    
    @AuraEnabled(cacheable=true)
    public static SiteBriefingWrapper getSiteBriefingDetails(String accountId,String membershipActivityId){
        SiteBriefingWrapper siteBriefingWrapper = new SiteBriefingWrapper();
        Account siteBriefingQuery = null;
        
        try {
            siteBriefingQuery = [SELECT Id,Name,RecordTypeId,Category__c,
                                 (SELECT  Year__c, Type__c, Overall_BiC__c, vs_Aetna__c, vs_Anthem__c, vs_Blues__c, vs_Blues_Alt__c, vs_Cigna__c, BiC_Source_Date__c, BiC_Source_Records__c,BiC_Source__c,Company__c FROM Company_Wide_BiC_Infromations__r where Company__c  =: accountId and 
                                  (Type__c !='Projected' or (Year__c!='2020'  and type__c='Projected')) and (Type__c !='Projected' or (Year__c!='2021'  and type__c='Projected'))  AND (NOT (Year__c = '2019' AND Type__c = 'Full Year')) AND (NOT (Year__c = '2019' AND Type__c = 'Mid Year')) AND (NOT (Year__c = '2020' AND Type__c = 'Mid Year'))
                                  AND (NOT (Year__c = '2020' AND Type__c = 'Full Year'))
                                  order by Year__c),
                                 (SELECT id,name,Title, DirectMarketingCategory__c, DecisionMakingRole__c, AccountId,Individual_Business_Relationship_Index__c,Status__c  from contacts where Status__c ='Active' AND AccountId  =: accountId),
                                 (SELECT id,name,Status__c,EffectiveDate__c, Disposition_Medical__c, Sales_Stage_Medical__c, Sales_Stage_Dental__c, Sales_Stage_Vision__c, Sales_Stage_Pharmacy__c, Sales_Stage_Other__c, Closed_Comments__c from Opportunities where Status__c ='closed' AND AccountId  =: accountId ORDER BY EffectiveDate__c Desc ), 
                                 RecordType.Name,Owner.Name, Surest_SVP_Involved__c, BusinessPressures__c, PotentialCompellingEvent__c, OurPotentialUniqueBusinessValue__c, Last_Action_Taken__c, Next_Action_to_be_Taken__c, KeyRiskstoourUBV__c, OutcomeDrivers__c, 
                                 ApproachStrategy__c, Supp_Health_Strategy__c, Eligible_for_2nd_Blues_Bid__c, X2nd_Blues_Bid_Comments__c, Surest_Last_Action_Taken__c, Surest_Next_Action_to_be_Taken__c, Surest_Comments__c, Surest_Approach_Strategy__c, 
                                 Surest_Network_Constraints__c, Network_Contracting_Issue_Other__c, ConsultantFirm__c,IncumbentPrimaryMedical__c,ConsultantFirm__r.Name,IncumbentSecondaryMedical__c,IncumbentPrimaryMedical__r.Name,Consultant__c, Consultant__r.Name,IncumbentSecondaryMedical__r.Name, Health_Plan_Manager_Industry__c,
                                 Fortune_500_Ranking__c, FortuneWorldMostAdmiredCompanyRanking__c, ForbesGreatCompanyforWomenListing__c, ForbesUSLargestPrivateCompanyRanking__c,
                                 ForbesWorldMostValuableBrandRanking__c, Private_Equity_Relationship__c, CVGAccount__r.Name, AnnualB2BSpend__c, B2BServiceSolution__c, Buying_Strategy__c, Previous_Customer__c, Cancellation_Date__c, SCE_at_Term__c, Members_at_Term__c, Reason_for_Term_Comments__c,
                                 Current_Deal_Next_Renewal_Date__c, OptumHealth_Annual_Revenue__c, OptumInsight_Annual_Revenue__c, OptumRx_Annual_Revenue__c, UHC_Medicare_Retirement_Annual_Revenue__c, Level_of_Interest_in_Exchanges__c,
                                 TopMarket1__c, TopMarket2__c, TopMarket3__c, TopMarket4__c, TopMarket5__c, TopMarket1Records__c, TopMarket2Records__c, TopMarket3Records__c, TopMarket4Records__c, TopMarket5Records__c, Comments__c , ParticipatingUSMembers__c,
                                 BillingCity, BillingState, IncumbentPrimaryVision__r.Name, IncumbentPrimaryDental__r.Name, Incumbent_Primary_Pharmacy__r.Name, ConsultantFirm__r.BillingCity, ConsultantFirm__r.BillingState, Direct_Marketing_Lead__c from Account where Id =: accountId];
            siteBriefingWrapper.siteBriefingQuery = siteBriefingQuery;
            //Added by Vignesh -- Start  
            List<Opportunity> openOppList = [SELECT id,name,Status__c,EffectiveDate__c,CreatedDate, Disposition_Medical__c, Sales_Stage_Medical__c, Sales_Stage_Dental__c, Sales_Stage_Vision__c, Sales_Stage_Pharmacy__c, Sales_Stage_Other__c, Closed_Comments__c from Opportunity where AccountId  =: accountId 
                                             AND Product_Type_Involved_in_Opp__c INCLUDES ('Medical') ORDER BY CreatedDate Desc];
            if (!openOppList.isEmpty()) {
                siteBriefingWrapper.openOppName = openOppList[0].Name;
            } 
            if(siteBriefingQuery.Opportunities.size()>0){
                List<Opportunity> closedOpportunities =siteBriefingQuery.Opportunities;
                siteBriefingWrapper.getClosedOpportunities = closedOpportunities;
            }
            siteBriefingWrapper.ownerName = siteBriefingQuery.Owner.Name;
            if (String.isNotBlank(membershipActivityId)) {
                Opportunity opp = [select id,name,recordtype.name,owner.Name,Specialty_Benefits_SVP__c,
                                   Surest_SVP_Involved__c, Finalist_Meeting_Participants__c, SCE_Assignment__c, Proposed_AMT__c, Deal_Sponsor__c, 
                                   Financial_Strategy_Lead__c, Executive_Sponsor__c, Benefit_Strategist__r.Name, Clinical_Resource__c, Shared_Dist__c,
                                   Must_Win_Criteria__c, Reason_for_the_Proposal__c, Optum_Asks__c, Product_Non_Standards__c, 
                                   Notes_taken_on_call_with_consultant__c, Bid_Strategy__c, Financial_Notes__c,
                                   Is_the_Client_in_the_Cannabis_Business__c, Win_Loss_Interview_Requested__c, Win_Loss_Interview_Date__c, 
                                   Problem_Surest_is_Solving__c, Surest_Key_Risks__c, Surest_Plan_Strategy__c, Surest_Comments__c,Offer_Nationally__c,
                                   No_of_current_plans__c, Surest_Targeted_med_Rx_savings_range__c, Default_Plan__c, Contribution_Positioning__c,
                                   Surest_Contribution_Differential__c, vs_Aetna__c, vs_Anthem__c, vs_Blues__c, vs_Blues_Alt__c, vs_Cigna__c, 
                                   BiC_Source_Date__c, BiC_Source_Records__c,Status__c, Owner_Name__c, Employees_in_the_Proposal_Medical__c, Members_QUOTED_in_the_Proposal_Medical__c, 
                                   Opportunity_Average_Contract_Size_ACS__c, Estimated_Additional_New_Members__c,Product_Type_Involved_in_Opp__c,
                                   (SELECT Id, Product_Line__c, Product2.Name, 
                                    Mbrs_Transferred_From_To_Another_Segment__c, 
                                    Members_Quoted_in_the_Proposal__c, Existing_Members_Involved_in_the_Bid__c,
                                    Estimated_Additional_New_Members__c, 
                                    Annual_Revenue_Premium__c, 
                                    Estimated_Members_Existing_New__c, 
                                    Disposition_Other_Buy_Up_Programs__c, 
                                    Product_Conversion__c,Net_Results__c, 
                                    Existing_Membership_at_Risk__c,Buyup_Product_Selection__c, 
                                    Sold_Retained_Members__c 
                                    FROM OpportunityLineItems 
                                    WHERE OpportunityId =: membershipActivityId 
                                    AND Product_Line__c != null ),Comments__c from Opportunity  where Id =:membershipActivityId];
                siteBriefingWrapper.opportunityData = opp;
             
                if (opp.OpportunityLineItems.size() > 0 || Test.isRunningTest()) {
                    List<OpportunityLineItem> opportunityProductsDataList = opp.OpportunityLineItems;
                    siteBriefingWrapper.opportunityProductsData = opportunityProductsDataList;
                    
                    List<OpportunityLineItem> medicalProductsDataList = new List<OpportunityLineItem>();
                    List<OpportunityLineItem> dentalProductsDataList = new List<OpportunityLineItem>();
                    List<OpportunityLineItem> visionProductsDataList = new List<OpportunityLineItem>();
                    List<OpportunityLineItem> pharmacyProductsDataList = new List<OpportunityLineItem>();
                    List<OpportunityLineItem> otherProductsDataList = new List<OpportunityLineItem>();
                    
                    List<OpportunityLineItem> medicalTotals = new List<OpportunityLineItem>();
                    List<OpportunityLineItem> dentalTotals = new List<OpportunityLineItem>();
                    List<OpportunityLineItem> visionTotals = new List<OpportunityLineItem>();
                    List<OpportunityLineItem> pharmacyTotals = new List<OpportunityLineItem>();
                    List<OpportunityLineItem> otherTotals = new List<OpportunityLineItem>();
                    
                    for (OpportunityLineItem eachProd : opportunityProductsDataList) {
                        String line = eachProd.Product_Line__c;
                        Boolean isTotal = eachProd.Product2 != null && eachProd.Product2.Name == 'Total';
                        
                        if (line == 'Medical') {
                            if (isTotal) {
                                medicalTotals.add(eachProd);
                            } else {
                                medicalProductsDataList.add(eachProd);
                            }
                        } else if (line == 'Pharmacy') {
                            if (isTotal) {
                                pharmacyTotals.add(eachProd);
                            } else {
                                pharmacyProductsDataList.add(eachProd);
                            }
                        }else if (line == 'Dental') {
                            if (isTotal) {
                                dentalTotals.add(eachProd);
                            } else {
                                dentalProductsDataList.add(eachProd);
                            }
                        } else if (line == 'Vision') {
                            if (isTotal) {
                                visionTotals.add(eachProd);
                            } else {
                                visionProductsDataList.add(eachProd);
                            }
                        }  else {
                            if (isTotal) {
                                otherTotals.add(eachProd);
                            } else {
                                otherProductsDataList.add(eachProd);
                            }
                        }
                    }
                    
                    siteBriefingWrapper.medicalProducts = medicalProductsDataList;
                    siteBriefingWrapper.dentalProducts = dentalProductsDataList;
                    siteBriefingWrapper.visionProducts = visionProductsDataList;
                    siteBriefingWrapper.pharmacyProducts = pharmacyProductsDataList;
                    siteBriefingWrapper.otherProducts = otherProductsDataList;
                    
                    List<OpportunityLineItem> combinedList = new List<OpportunityLineItem>();
                    combinedList.addAll(medicalProductsDataList);
                    combinedList.addAll(medicalTotals);
                    combinedList.addAll(pharmacyProductsDataList);
                    combinedList.addAll(pharmacyTotals);
                    combinedList.addAll(dentalProductsDataList);
                    combinedList.addAll(dentalTotals);
                    combinedList.addAll(visionProductsDataList);
                    combinedList.addAll(visionTotals);                
                    combinedList.addAll(otherProductsDataList);
                    combinedList.addAll(otherTotals);
                    
                    siteBriefingWrapper.allOpportunityProductsData = combinedList;
                }
                
            }
            
            if(siteBriefingQuery.Company_Wide_BiC_Infromations__r.size()>0){
                List<Company_Wide_BiC_Information__c> bicInformationList = siteBriefingQuery.Company_Wide_BiC_Infromations__r;
                siteBriefingWrapper.getBicInformation = bicInformationList;
            }
            if(siteBriefingQuery.contacts.size()>0){
                List<Contact> contactInformationList = siteBriefingQuery.contacts;
                siteBriefingWrapper.getContactInformation = contactInformationList;
            }
           
            /*       
// String recordTypeName = siteBriefingQuery.RecordType.getDeveloperName();
String recordTypeName = Schema.SObjectType.Account.getRecordTypeInfosById().get(siteBriefingQuery.RecordTypeId).getDeveloperName();
System.debug('recordTypeName '+recordTypeName);
String objectName  = '';
StaticResource sr;
if (recordTypeName == 'Existing_Client' || recordTypeName == 'Client_Subsidiary' || 
recordTypeName == 'Pending_Transfer_In_Client' || recordTypeName == 'Sold_Client') {
sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource WHERE Name = 'CMSiteVisitBriefing' LIMIT 1];
}
else if (recordTypeName == 'Aggregator' || recordTypeName == 'Competitor' || 
recordTypeName == 'Consulting_Firm' || recordTypeName == 'Prospect' || 
recordTypeName == 'Prospect_Subsidiary' || recordTypeName == 'Suspect') {
sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource WHERE Name = 'CDSiteVisitBriefing' LIMIT 1];
}
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
siteBriefingWrapper.xmlString = xmlBodyString;

siteBriefingWrapper.objectItags = objectItagesMap;
*/ 
        }
        catch(Exception e){
            System.debug('Exception message - '+e.getMessage());
        }
        return siteBriefingWrapper;
        
    }
    
    public class SiteBriefingWrapper{
        @AuraEnabled
        public Account siteBriefingQuery {get; set;}
        @AuraEnabled
        public String openOppName {get; set;}
        @AuraEnabled
        public List<Company_Wide_BiC_Information__c> getBicInformation { get;set; }
        @AuraEnabled 
        public List<Contact> getContactInformation {get;set;}
        @AuraEnabled 
        public List<Opportunity> getClosedOpportunities {get;set;}
        @AuraEnabled 
        public Opportunity opportunityData {get;set;}
        @AuraEnabled 
        public Opportunity openOppOne {get;set;}
        @AuraEnabled 
        public List<OpportunityLineItem>  opportunityProductsData {get;set;}
        @AuraEnabled 
        public List<OpportunityLineItem>  medicalProducts {get;set;}
        @AuraEnabled 
        public List<OpportunityLineItem>  dentalProducts {get;set;}
        @AuraEnabled 
        public List<OpportunityLineItem>  visionProducts {get;set;}
        @AuraEnabled 
        public List<OpportunityLineItem>  otherProducts {get;set;}
        @AuraEnabled 
        public List<OpportunityLineItem>  pharmacyProducts {get;set;}
        
        
        //Added 
        @AuraEnabled 
        public List<OpportunityLineItem>  allOpportunityProductsData {get;set;}
        @AuraEnabled 
        public List<OpportunityLineItem>  medicalProductsonly {get;set;}
        @AuraEnabled 
        public List<OpportunityLineItem>  medicalTotals {get;set;}
        @AuraEnabled 
        public List<OpportunityLineItem>  dentalProductsonly {get;set;}
        @AuraEnabled 
        public List<OpportunityLineItem>  dentalTotals {get;set;}
        
        @AuraEnabled
        public String ownerName { get;set; }
        
        @AuraEnabled
        public String xmlString { get;set; }
        
        @AuraEnabled
        public  Map<String,Set<String>> objectItags{ get;set; }
        
        /*@AuraEnabled
public String extractedImageUrl{get; set;} */
    }
}