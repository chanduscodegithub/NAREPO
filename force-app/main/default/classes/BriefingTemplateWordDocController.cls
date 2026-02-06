public with sharing class BriefingTemplateWordDocController {
    
    //public Account account { get; set; }
    public String recordTypeName { get; private set; }
    public String accountIds { get; private set; }
    public Account BriefingfetchQuery { get; set; }
    
   // public String renderValue{get;private set;}
    public Boolean isPdf{get;private set;}
    public String ContentTypeValue{get;private set;}
    
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunitiesOfAccount(String accountId){
        List<Opportunity> currentAccountOppList = new List<Opportunity>();
        try{
            currentAccountOppList = [SELECT Id, Name, AccountId, Owner_Name__c FROM Opportunity WHERE AccountId =: accountId AND Status__c ='open' WITH USER_MODE ];
        }
        Catch(Exception e){
            System.debug('Error has Occured' +e.getMessage());
        }
        return currentAccountOppList;
    }
    
    public BriefingTemplateWordDocController(){
        String accountId = ApexPages.currentPage().getParameters().get('accountId');
        
        if(accountId != null){
            BriefingfetchQuery = [SELECT Id, Name, RecordTypeId, Category__c, RecordType.Name,Owner.Name, Surest_SVP_Involved__c, BusinessPressures__c, PotentialCompellingEvent__c, OurPotentialUniqueBusinessValue__c,
                                  Last_Action_Taken__c, Next_Action_to_be_Taken__c,
                                  KeyRiskstoourUBV__c, OutcomeDrivers__c, 
                                     ApproachStrategy__c,
                                  Supp_Health_Strategy__c,
                                  Eligible_for_2nd_Blues_Bid__c, 
                                  X2nd_Blues_Bid_Comments__c,
                                    Surest_Last_Action_Taken__c, Surest_Next_Action_to_be_Taken__c, Network_Contracting_Issue_Other__c,
                                    Surest_Comments__c, Surest_Approach_Strategy__c, 
                                     Surest_Network_Constraints__c,  ConsultantFirm__c,IncumbentPrimaryMedical__c,ConsultantFirm__r.Name,IncumbentSecondaryMedical__c,IncumbentPrimaryMedical__r.Name,Consultant__c, Consultant__r.Name,IncumbentSecondaryMedical__r.Name, Health_Plan_Manager_Industry__c,
                                     Fortune_500_Ranking__c, FortuneWorldMostAdmiredCompanyRanking__c, ForbesGreatCompanyforWomenListing__c, ForbesUSLargestPrivateCompanyRanking__c,
                                     ForbesWorldMostValuableBrandRanking__c, Private_Equity_Relationship__c, CVGAccount__r.Name, AnnualB2BSpend__c, B2BServiceSolution__c, Buying_Strategy__c, Previous_Customer__c, Cancellation_Date__c, SCE_at_Term__c, Members_at_Term__c, Reason_for_Term_Comments__c,
                                     Current_Deal_Next_Renewal_Date__c, OptumHealth_Annual_Revenue__c, OptumInsight_Annual_Revenue__c, OptumRx_Annual_Revenue__c, UHC_Medicare_Retirement_Annual_Revenue__c, Level_of_Interest_in_Exchanges__c,
                                     TopMarket1__c, TopMarket2__c, TopMarket3__c, TopMarket4__c, TopMarket5__c, TopMarket1Records__c, TopMarket2Records__c, TopMarket3Records__c, TopMarket4Records__c, TopMarket5Records__c, Comments__c , ParticipatingUSMembers__c,
                                     (SELECT Year__c, Type__c, Overall_BiC__c, vs_Aetna__c, vs_Anthem__c, vs_Blues__c, vs_Blues_Alt__c, vs_Cigna__c, BiC_Source_Date__c, BiC_Source_Records__c, BiC_Source__c, Company__c FROM Company_Wide_BiC_Infromations__r where Company__c  =: accountId),
                                     BillingCity, BillingState, IncumbentPrimaryVision__r.Name, IncumbentPrimaryDental__r.Name, Incumbent_Primary_Pharmacy__r.Name, ConsultantFirm__r.Location__c from Account where Id =: accountId WITH USER_MODE];
            recordTypeName = BriefingfetchQuery.Category__c;
            accountIds = BriefingfetchQuery.Id;

        }
        
        map<String,String> UrlParameterMap = ApexPages.currentPage().getParameters();
        for(String str:UrlParameterMap.keySet()){
            if(str =='wordReport'){
                this.isPdf=true;
            }
        }
        
        if(this.isPdf == true){
         //   this.renderValue='word';
            this.ContentTypeValue = 'application/msword#';
            this.ContentTypeValue += this.getWordFileName()+'.doc';
        }
    }
    
    
    
     private String getWordFileName() {
        return 'GenerateWord';
    }
}