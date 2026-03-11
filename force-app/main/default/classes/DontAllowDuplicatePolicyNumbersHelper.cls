/**
* Purpose     : calculate the  sum of Add-on field of policy info.
* Class       : DontAllowDuplicatePolicyNumbersHelper
* Test class  : DontAllowDuplicatePolicyNumbersTest
* =============================================================================+===============
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*   1.1      Sai Sandhya                 11-05-2020   Updated code in calculateAddOn,complexityLoigicUpdateHandler Methods
*===============================================================================================
*/
public with sharing class DontAllowDuplicatePolicyNumbersHelper {
    public static boolean stopRecursive = false;
    public static boolean stopRecursiveForInsert = false;
    public static final Map<String, List<Capacity_Plan_Common_Metadata__mdt>> fieldVsRanges =  generateRangeMap();
    public static Capacity_Planning_Calculation_Weightage__mdt cplan = [SELECT Add_onmultipplier__c, Salesforce_Volume__c,of_Member_Meetings__c,
                                                                        X3_or_4_Tier_Benefit_5__c,Accum_Files__c,
                                                                        Carve_In_Pharmacy__c,COBRA__c,Communications__c,Critical_Illness__c,
                                                                        CSP_GSP_or_Extended_Networks__c,Customer_Sponsored_Service_Center__c,Dental__c,
                                                                        Eligibility__c,
                                                                        External_Audits__c,FSA__c,Hospital_Systems__c,Incentives_Rewards__c,KA_to_NA_transition__c,
                                                                        Life__c,Medicare_Plans__c,New_Business_Exchange_Transition_Factor__c,New_Product_1st_Year__c,
                                                                        Non_Eligibility_Vendor_Feeds__c,Optum_Partnership__c,SBC__c,SPD__c,UHG_Owned_Custom_Portal__c,
                                                                        Vision__c,Reporting__c, Customer_layers_incl_consultants__c,Frozen_ASO_Plans__c,Frozen_FI_Plans__c,
                                                                        Frozen_UMR_Plans_Weightage__c
                                                                        FROM Capacity_Planning_Calculation_Weightage__mdt WHERE DeveloperName = 'Capacity_Planning_Weightage' LIMIT 1];
    
    public static List<Reporting__mdt> reportMdt = [select DeveloperName, Start_Range__c, End_Range__c, Weightage__c from Reporting__mdt LIMIT 1000];
    
    public static List<Total_Active_Benefit_Sets_Count__mdt> totalActiveBenefitSetsCountmdt = [select DeveloperName, Start_Range__c, End_Range__c, Weightage__c from Total_Active_Benefit_Sets_Count__mdt LIMIT 1000];
    
    public static List<Total_FI_Benefit_Sets_Count__mdt> totalFIBenefitSetsCountmdt = [select DeveloperName, Start_Range__c, End_Range__c, Weightage__c from Total_FI_Benefit_Sets_Count__mdt LIMIT 1000]; 
    
    public static List<Plan_Variation_Count__mdt> planVariationCountmdt = [select DeveloperName, Start_Range__c, End_Range__c, Weightage__c from Plan_Variation_Count__mdt LIMIT 1000];
    
    
    public static void calculateAddOn(Map<Id, Policy_Information__c> policyInfoNewMap, Map<Id, Policy_Information__c> policyInfoOldMap ){
        Map<String, Map<String,Decimal>> weightages = DontAllowDuplicatePolicyNumbersHelper.getPicklistWeightage();
        
        List<Policy_Information__c> filteredPolicyInfoList = new List<Policy_Information__c>();
        for(Policy_Information__c pNew : policyInfoNewMap.values()){
            //[sandhya:11-05-2020],added below single line of code instead of looping policyInfoOldMap values
            Policy_Information__c pOld = policyInfoOldMap.get(pNew.id);
            if(pNew.Migration__c != pOld.Migration__c ||
               pNew.Salesforce_Volume_Backend__c   != pOld.Salesforce_Volume_Backend__c ||
               pNew.of_Member_Meetings_Range_Backend__c   != pOld.of_Member_Meetings_Range_Backend__c ||
               pNew.X3_or_4_Tier_Benefit_Backend__c   != pOld.X3_or_4_Tier_Benefit_Backend__c ||
               pNew.Accum_Files_Range_Backend__c   != pOld.Accum_Files_Range_Backend__c ||
               pNew.Carve_In_Pharmacy__c   != pOld.Carve_In_Pharmacy__c  ||
               pNew.COBRA_Backend__c   != pOld.COBRA_Backend__c ||
               pNew.Communication_Backend__c   != pOld.Communication_Backend__c ||
               pNew.CSP_GSP_or_Extended_Networks__c   != pOld.CSP_GSP_or_Extended_Networks__c  ||
               pNew.Customer_Sponsored_Service_Center__c   != pOld.Customer_Sponsored_Service_Center__c ||
               pNew.Eligibility__c   != pOld.Eligibility__c ||
               pNew.External_Audits_Range_Backend__c   != pOld.External_Audits_Range_Backend__c ||
               pNew.FSA_c__c   != pOld.FSA_c__c ||
               pNew.Hospital_Systemss__c   != pOld.Hospital_Systemss__c ||
               pNew.Incentives_Rewards_Range_Backend__c   != pOld.Incentives_Rewards_Range_Backend__c ||
               pNew.Life__c   != pOld.Life__c ||
               pNew.Medicare_Plan__c   != pOld.Medicare_Plan__c ||
               pNew.ne_Business_Exchange_Transition_Factor__c   != pOld.ne_Business_Exchange_Transition_Factor__c ||
               pNew.New_Product_1st_Year_1__c   != pOld.New_Product_1st_Year_1__c ||
               pNew.Non_Eligibility_Vendor_Fee_Range_Backend__c   != pOld.Non_Eligibility_Vendor_Fee_Range_Backend__c ||
               pNew.Optum_Partnership_Range_Backend__c   != pOld.Optum_Partnership_Range_Backend__c ||
               pNew.SBC_Range_Backend__c   != pOld.SBC_Range_Backend__c ||
               pNew.SPD_Range_Backend__c   != pOld.SPD_Range_Backend__c ||
               pNew.UHG_Owned_Custom_Portal__c   != pOld.UHG_Owned_Custom_Portal__c ||
               pNew.VisionBackend__c   != pOld.VisionBackend__c || 
               pNew.Virtual_Visits_Telemedicine__c   != pOld.Virtual_Visits_Telemedicine__c ||
               pNew.Onsite_Clinics__c != pOld.Onsite_Clinics__c ||
               pNew.Gated_Plans__c != pOld.Gated_Plans__c ||
               pNew.Concierge_Vendor__c != pOld.Concierge_Vendor__c	||               
               pNew.Rental_Networks__c != pOld.Rental_Networks__c ||
               pNew.UMR_SBC__c != pOld.UMR_SBC__c ||
               pNew.UMR_Incentives_Rewards__c != pOld.UMR_Incentives_Rewards__c ||
               pNew.Single_Sign_On__c != pOld.Single_Sign_On__c ||
               pNew.UMR_SPD__c != pOld.UMR_SPD__c || 
               pNew.UMR_Stop_Loss__c != pOld.UMR_Stop_Loss__c || 
               pNew.of_Customer_Related_Meetings__c != pOld.of_Customer_Related_Meetings__c || 
               pNew.Surest_Helath_Plan__c != pOld.Surest_Helath_Plan__c ||                
               pNew.Surest_Monthly_Reporting_Score__c != pOld.Surest_Monthly_Reporting_Score__c || pNew.SurestConcierge_Vendor_50_Score__c != pOld.SurestConcierge_Vendor_50_Score__c || pNew.KA_to_NA_Transition_5_Score__c != pOld.KA_to_NA_Transition_5_Score__c ||
               pNew.SurestNew_Product_1st_Year_1_Score__c != pOld.SurestNew_Product_1st_Year_1_Score__c || pNew.Carve_in_Pharmacy_0_5_Score__c != pOld.Carve_in_Pharmacy_0_5_Score__c ||
               pNew.SurestCSP_GSP_Extended_Networks_25_Score__c != pOld.SurestCSP_GSP_Extended_Networks_25_Score__c|| pNew.SurestIncentives_Rewards_50_Score__c != pOld.SurestIncentives_Rewards_50_Score__c || pNew.OBM_Score__c != pOld.OBM_Score__c ||
               pNew.Surest_SBC_Score__c != pOld.Surest_SBC_Score__c || pNew.Surest_SPD_Score__c != pOld.Surest_SPD_Score__c
              ){//Added Capacity Model 2025s
                  filteredPolicyInfoList.add(pNew);                  
              }
            
        }
       
        Decimal Salesforce_Volume_Backend ;
        Decimal of_Member_Meetings_Range_Backend;
        Decimal X3_or_4_Tier_Benefit_Backend;
        Decimal Accum_Files_Range_Backend;
        Decimal Carve_In_Pharmacy_Backend;
        Decimal COBRA_Backend;
        Decimal Communication_Backend;
        Decimal CSP_GSP_or_Extended_Networks;
        Decimal Eligibility;
        Decimal External_Audits_Range_Backend;
        Decimal FSA;
        Decimal Hospital_Systemss;
        Decimal Incentives_Rewards_Range_Backend;
        Decimal Life;
        Decimal Medicare_Plan;
        Decimal ne_Business_Exchange_Transition_Factor;
        Decimal New_Product_1st_Year_1;
        Decimal Non_Eligibility_Vendor_Fee_Range_Backend;
        Decimal Optum_Partnership_Range_Backend ;
        Decimal SBC_Range_Backend;
        Decimal SPD_Range_Backend;
        Decimal UHG_Owned_Custom_Portal;
        Decimal VisionBackend;
        Decimal Customer_Sponsored_Service_Center;
        Decimal KA_to_NA_transition_5;
        Decimal Virtual_Visits_Telemedicine;
        Decimal Onsite_Clinics;
        Decimal Gated_Plans;
        Decimal Concierge_Vendor;   
        Decimal Rental_Networks_Weightage;
        Decimal UMR_Incentives_Weightage;
        Decimal UMR_SBC_Weightage;
        Decimal Single_Sign_On_Weightage;
        Decimal UMR_SPD_Weightage;
        Decimal UMR_StopLoss_Weightage;
        
        //--------------------------------Varun---------------------------------------//
        Decimal of_Customer_Related_Meetings_Backend = 0;
        Decimal Surest_Helath_Plan_Backend = 0;
        //--------------------------------Varun---------------------------------------//
        //--------------------------------Added Capacity Model 2025---------------------------------------//
        Decimal Surest_Monthly_Reporting_Score = 0;
        Decimal SurestConcierge_Vendor_50_Score = 0;
        Decimal KA_to_NA_Transition_5_Score = 0;
        Decimal SurestNew_Product_1st_Year_1_Score = 0;
        Decimal Carve_in_Pharmacy_0_5_Score = 0;
        Decimal SurestCSP_GSP_Extended_Networks_25_Score = 0;
        Decimal SurestIncentives_Rewards_50_Score = 0;
        Decimal OBM_Score = 0;
        Decimal Surest_SBC_Score = 0;
        Decimal Surest_SPD_Score = 0;
        Decimal Life_Score_Surest = 0;
        //-----------------------------------------------------------------------//      
        if(filteredPolicyInfoList!=null && filteredPolicyInfoList.size()>0){
            for(Policy_Information__c p : filteredPolicyInfoList){
                Salesforce_Volume_Backend=0;
                of_Member_Meetings_Range_Backend=0;
                X3_or_4_Tier_Benefit_Backend=0;
                Accum_Files_Range_Backend=0;
                Carve_In_Pharmacy_Backend=0;
                COBRA_Backend=0;
                Communication_Backend=0;
                CSP_GSP_or_Extended_Networks=0;
                Eligibility=0;
                External_Audits_Range_Backend=0;
                FSA=0;
                Hospital_Systemss=0;
                Incentives_Rewards_Range_Backend=0;
                Life=0;
                Medicare_Plan=0;
                ne_Business_Exchange_Transition_Factor=0;
                New_Product_1st_Year_1=0;
                Non_Eligibility_Vendor_Fee_Range_Backend=0;
                Optum_Partnership_Range_Backend=0;
                SBC_Range_Backend=0;
                SPD_Range_Backend=0;
                UHG_Owned_Custom_Portal=0;
                VisionBackend=0;
                Customer_Sponsored_Service_Center=0;
                KA_to_NA_transition_5=0;                
                Rental_Networks_Weightage= 0;
                UMR_Incentives_Weightage= 0;
                UMR_SBC_Weightage= 0;
                Single_Sign_On_Weightage= 0;
                UMR_SPD_Weightage= 0;
                UMR_StopLoss_Weightage= 0;
                
                //Carve_In_Pharmacy_Backend = p.Carve_In_Pharmacy__c != null ? weightages.get('Carve_In_Pharmacy__c').get(p.Carve_In_Pharmacy__c) :0;
                Virtual_Visits_Telemedicine = p.Virtual_Visits_Telemedicine__c != null ? weightages.get('Virtual_Visits_Telemedicine__c').get(p.Virtual_Visits_Telemedicine__c) :0;
                Onsite_Clinics = p.Onsite_Clinics__c != null ? weightages.get('Onsite_Clinics__c').get(p.Onsite_Clinics__c) :0;
                Gated_Plans = p.Gated_Plans__c != null ? weightages.get('Gated_Plans__c').get(p.Gated_Plans__c) :0;
                Concierge_Vendor = p.Concierge_Vendor__c!= null ? weightages.get('Concierge_Vendor__c').get(p.Concierge_Vendor__c) :0; 
                KA_to_NA_transition_5 = p.Migration__c != null ? weightages.get('Migration__c').get(p.Migration__c) :0;                 
                Rental_Networks_Weightage = (p.Rental_Networks__c != null) ? weightages.get('Rental_Networks__c').get(p.Rental_Networks__c) : 0;
                UMR_Incentives_Weightage = (p.UMR_Incentives_Rewards__c != null) ? weightages.get('UMR_Incentives_Rewards__c').get(p.UMR_Incentives_Rewards__c) : 0;
                Single_Sign_On_Weightage = (p.Single_Sign_On__c != null) ? weightages.get('Single_Sign_On__c').get(p.Single_Sign_On__c) : 0 ;
                UMR_StopLoss_Weightage = (p.UMR_Stop_Loss__c != null) ? weightages.get('UMR_Stop_Loss__c').get(p.UMR_Stop_Loss__c) : 0;
                UMR_SPD_Weightage = getWeightageFromRange('UMR_SPD__c', p.UMR_SPD__c);
                UMR_SBC_Weightage = getWeightageFromRange('UMR_SBC__c', p.UMR_SBC__c);
                
                //--------------------------------Varun---------------------------------------//
                of_Customer_Related_Meetings_Backend = p.of_Customer_Related_Meetings_Backend__c != null ? p.of_Customer_Related_Meetings_Backend__c : 0;
                Surest_Helath_Plan_Backend = p.Surest_Helath_Plan_Backend__c != null ? p.Surest_Helath_Plan_Backend__c : 0;
                //--------------------------------Varun---------------------------------------//
                //--------------------------------Added Capacity Model 2025s---------------------------------------//
                Surest_Monthly_Reporting_Score = p.Surest_Monthly_Reporting_Score__c != null ? p.Surest_Monthly_Reporting_Score__c : 0;
                SurestConcierge_Vendor_50_Score = p.SurestConcierge_Vendor_50_Score__c != null ? p.SurestConcierge_Vendor_50_Score__c : 0;
                KA_to_NA_Transition_5_Score = p.KA_to_NA_Transition_5_Score__c != null ? p.KA_to_NA_Transition_5_Score__c : 0;
                SurestNew_Product_1st_Year_1_Score = p.SurestNew_Product_1st_Year_1_Score__c != null ? p.SurestNew_Product_1st_Year_1_Score__c : 0;
                Carve_in_Pharmacy_0_5_Score = p.Carve_in_Pharmacy_0_5_Score__c != null ? p.Carve_in_Pharmacy_0_5_Score__c : 0;
                SurestCSP_GSP_Extended_Networks_25_Score = p.SurestCSP_GSP_Extended_Networks_25_Score__c != null ? p.SurestCSP_GSP_Extended_Networks_25_Score__c : 0;
                SurestIncentives_Rewards_50_Score = p.SurestIncentives_Rewards_50_Score__c != null ? p.SurestIncentives_Rewards_50_Score__c : 0;
                OBM_Score = p.OBM_Score__c != null ? p.OBM_Score__c : 0;
                Surest_SBC_Score = p.Surest_SBC_Score__c != null ? p.Surest_SBC_Score__c : 0;
                Surest_SPD_Score = p.Surest_SPD_Score__c != null ? p.Surest_SPD_Score__c : 0;
                Life_Score_Surest = p.Life_Score_Surest__c != null ? p.Life_Score_Surest__c : 0;
                //-----------------------------------------------------------------------//
                
                
                if(p.Salesforce_Volume_Backend__c != null)
                {
                    Salesforce_Volume_Backend= p.Salesforce_Volume_Backend__c;
                }else{
                    Salesforce_Volume_Backend=0;
                }
                if(p.of_Member_Meetings_Range_Backend__c != null)
                {
                    of_Member_Meetings_Range_Backend = p.of_Member_Meetings_Range_Backend__c;
                }else {
                    of_Member_Meetings_Range_Backend = 0;
                }
                if(p.X3_or_4_Tier_Benefit_Backend__c != null)
                {
                    X3_or_4_Tier_Benefit_Backend =p.X3_or_4_Tier_Benefit_Backend__c;
                }else{
                    X3_or_4_Tier_Benefit_Backend=0;
                }
                if(p.Accum_Files_Range_Backend__c != null)
                {
                    Accum_Files_Range_Backend = p.Accum_Files_Range_Backend__c;
                }else{
                    Accum_Files_Range_Backend = 0;
                }
                if(p.Carve_In_Pharmacy__c != null)
                {
                    Carve_In_Pharmacy_Backend = p.Carve_In_Pharmacy__c != null ? weightages.get('Carve_In_Pharmacy__c').get(p.Carve_In_Pharmacy__c) :0;                   
                }else{
                    Carve_In_Pharmacy_Backend=0;
                }
                if(p.COBRA_Backend__c != null)
                {
                    COBRA_Backend = p.COBRA_Backend__c;
                }else{
                    COBRA_Backend=0;
                }
                if(p.Communication_Backend__c != null)
                {
                    Communication_Backend = p.Communication_Backend__c;
                }else{
                    Communication_Backend= 0;
                }
                if(p.CSP_GSP_or_Extended_Networks__c != null)
                {
                    CSP_GSP_or_Extended_Networks = weightages.get('CSP_GSP_or_Extended_Networks__c').get(p.CSP_GSP_or_Extended_Networks__c);
                }else{
                    CSP_GSP_or_Extended_Networks=0;
                }
                if(p.Customer_Sponsored_Service_Center__c != null)
                {
                    Customer_Sponsored_Service_Center = Decimal.valueOf(p.Customer_Sponsored_Service_Center__c); 
                }else{
                    Customer_Sponsored_Service_Center=0;
                }
                if(p.Eligibility__c != null)
                {
                    Eligibility = Decimal.valueOf(p.Eligibility__c);
                }else{
                    Eligibility=0;
                }
                if(p.External_Audits_Range_Backend__c != null)
                {
                    External_Audits_Range_Backend = p.External_Audits_Range_Backend__c;
                }else{
                    External_Audits_Range_Backend = 0;
                }
                if(p.FSA_c__c != null)
                {
                    FSA = Decimal.valueOf(p.FSA_c__c);
                }else{
                    FSA= 0;
                }
                if(p.Hospital_Systemss__c != null)
                {
                    Hospital_Systemss = Decimal.valueOf(p.Hospital_Systemss__c);
                }else{
                    Hospital_Systemss= 0;
                }
                if(p.Incentives_Rewards_Range_Backend__c != null)
                {
                    Incentives_Rewards_Range_Backend = p.Incentives_Rewards_Range_Backend__c;
                }else{
                    Incentives_Rewards_Range_Backend=0;
                }
                if(p.Life__c != null)
                {
                    Life= Decimal.valueOf(p.Life__c);
                }else{
                    Life= 0;
                }
                if(p.Medicare_Plan__c != null)
                {
                    Medicare_Plan = Decimal.valueOf(p.Medicare_Plan__c);
                }else{
                    Medicare_Plan = 0;
                }
                if(p.ne_Business_Exchange_Transition_Factor__c != null)
                {
                    ne_Business_Exchange_Transition_Factor = Decimal.valueOf(p.ne_Business_Exchange_Transition_Factor__c);
                }else{
                    ne_Business_Exchange_Transition_Factor = 0;
                }
                if(p.New_Product_1st_Year_1__c != null)
                {
                    New_Product_1st_Year_1 = p.New_Product_1st_Year_1__c;
                }else{
                    New_Product_1st_Year_1 =0;
                }
                if(p.Non_Eligibility_Vendor_Fee_Range_Backend__c != null)
                {
                    Non_Eligibility_Vendor_Fee_Range_Backend = p.Non_Eligibility_Vendor_Fee_Range_Backend__c;
                }else{
                    Non_Eligibility_Vendor_Fee_Range_Backend= 0 ;
                }
                if(p.Optum_Partnership_Range_Backend__c != null)
                {
                    Optum_Partnership_Range_Backend = p.Optum_Partnership_Range_Backend__c;
                }else{
                    Optum_Partnership_Range_Backend=0;
                }
                if(p.SBC_Range_Backend__c != null)
                {
                    SBC_Range_Backend = p.SBC_Range_Backend__c;
                }else{
                    SBC_Range_Backend=0;
                }
                if(p.SPD_Range_Backend__c != null)
                {
                    SPD_Range_Backend = p.SPD_Range_Backend__c;
                }else{
                    SPD_Range_Backend=0;
                }
                if(p.UHG_Owned_Custom_Portal__c != null)
                {
                    UHG_Owned_Custom_Portal = Decimal.valueOf(p.UHG_Owned_Custom_Portal__c);
                }else{
                    UHG_Owned_Custom_Portal=0;
                }
                                
                decimal addonssum=
                    Salesforce_Volume_Backend*cplan.Salesforce_Volume__c +
                    of_Member_Meetings_Range_Backend*cplan.of_Member_Meetings__c
                    + X3_or_4_Tier_Benefit_Backend *cplan.X3_or_4_Tier_Benefit_5__c
                    + Accum_Files_Range_Backend *cplan.Accum_Files__c +
                    Carve_In_Pharmacy_Backend+
                    COBRA_Backend*cplan.COBRA__c +
                    Communication_Backend*cplan.Communications__c                   
                    +CSP_GSP_or_Extended_Networks
                    + Customer_Sponsored_Service_Center *cplan.Customer_Sponsored_Service_Center__c +                   
                    Eligibility *cplan.Eligibility__c +
                    External_Audits_Range_Backend*cplan.External_Audits__c +
                    FSA *cplan.FSA__c+
                    Hospital_Systemss * cplan.Hospital_Systems__c +
                    Incentives_Rewards_Range_Backend*cplan.Incentives_Rewards__c +
                    KA_to_NA_transition_5 +                    
                    Medicare_Plan*cplan.Medicare_Plans__c +
                    ne_Business_Exchange_Transition_Factor* cplan.New_Business_Exchange_Transition_Factor__c +
                    New_Product_1st_Year_1*cplan.New_Product_1st_Year__c +
                    Non_Eligibility_Vendor_Fee_Range_Backend * cplan.Non_Eligibility_Vendor_Feeds__c +
                    Optum_Partnership_Range_Backend*cplan.Optum_Partnership__c+
                    SBC_Range_Backend *cplan.SBC__c +
                    SPD_Range_Backend*cplan.SPD__c +
                    UHG_Owned_Custom_Portal*cplan.UHG_Owned_Custom_Portal__c + Concierge_Vendor + Gated_Plans +
                    Onsite_Clinics + Virtual_Visits_Telemedicine +                 
                    Rental_Networks_Weightage + UMR_Incentives_Weightage + UMR_SBC_Weightage + Single_Sign_On_Weightage + 
                    UMR_SPD_Weightage + UMR_StopLoss_Weightage + Surest_Helath_Plan_Backend + of_Customer_Related_Meetings_Backend;
                
                p.Add_ons_Sum_of_total_input__c=addonssum * cplan.Add_onmultipplier__c;
                
                
                system.debug('on an update');  
system.debug('Surest_Monthly_Reporting_Score '+Surest_Monthly_Reporting_Score);
system.debug('of_Member_Meetings_Range_Backend '+of_Member_Meetings_Range_Backend*cplan.of_Member_Meetings__c);
system.debug('X3_or_4_Tier_Benefit_Backend '+X3_or_4_Tier_Benefit_Backend *cplan.X3_or_4_Tier_Benefit_5__c);
system.debug('Accum_Files_Range_Backend '+Accum_Files_Range_Backend *cplan.Accum_Files__c);
                system.debug('Accum_Files_Range_Backend1 '+ Accum_Files_Range_Backend +' ----  ' +Accum_Files_Range_Backend *cplan.Accum_Files__c);
system.debug('Carve_In_Pharmacy_Backend '+Carve_in_Pharmacy_0_5_Score);
system.debug('COBRA_Backend '+COBRA_Backend*cplan.COBRA__c);
system.debug('Communication_Backend '+Communication_Backend*cplan.Communications__c);
           system.debug('SurestConcierge_Vendor_50_Score '+SurestConcierge_Vendor_50_Score);     
system.debug('SurestCSP_GSP_Extended_Networks_25_Score '+SurestCSP_GSP_Extended_Networks_25_Score );
system.debug('Customer_Sponsored_Service_Center'+Customer_Sponsored_Service_Center *cplan.Customer_Sponsored_Service_Center__c);
system.debug('Eligibility '+ Eligibility +' ----  ' +cplan.Eligibility__c);
system.debug('External_Audits_Range_Backend '+External_Audits_Range_Backend*cplan.External_Audits__c);
system.debug('FSA '+FSA *cplan.FSA__c);
system.debug('Hospital_Systemss '+Hospital_Systemss * cplan.Hospital_Systems__c);
system.debug('SurestIncentives_Rewards_50_Score '+SurestIncentives_Rewards_50_Score);
system.debug('KA_to_NA_Transition_5_Score '+KA_to_NA_Transition_5_Score );
system.debug('Life '+Life_Score_Surest );
system.debug('Medicare_Plan '+Medicare_Plan+' ----  ' +Medicare_Plan*cplan.Medicare_Plans__c);
system.debug('ne_Business_Exchange_Transition_Factor '+ne_Business_Exchange_Transition_Factor* cplan.New_Business_Exchange_Transition_Factor__c);
system.debug('SurestNew_Product_1st_Year_1_Score '+SurestNew_Product_1st_Year_1_Score );
                
system.debug('Non_Eligibility_Vendor_Fee_Range_Backend '+Non_Eligibility_Vendor_Fee_Range_Backend * cplan.Non_Eligibility_Vendor_Feeds__c  );
system.debug('Optum_Partnership_Range_Backend '+Optum_Partnership_Range_Backend*cplan.Optum_Partnership__c  );

system.debug('UHG_Owned_Custom_Portal '+UHG_Owned_Custom_Portal*cplan.UHG_Owned_Custom_Portal__c ); 

system.debug('Onsite_Clinics__c) '+Onsite_Clinics);
system.debug('Virtual_Visits_Telemedicine__c) '+Virtual_Visits_Telemedicine);
                
                system.debug('Surest_SBC_Score) '+Surest_SBC_Score);
                system.debug('Surest_SPD_Score) '+Surest_SPD_Score);
                
                
                                 
                //Added Capacity Model 2025s
                decimal surestAddonSum = Surest_Monthly_Reporting_Score + of_Member_Meetings_Range_Backend*cplan.of_Member_Meetings__c + X3_or_4_Tier_Benefit_Backend *cplan.X3_or_4_Tier_Benefit_5__c + Accum_Files_Range_Backend *cplan.Accum_Files__c +
                    Carve_in_Pharmacy_0_5_Score + COBRA_Backend*cplan.COBRA__c + Communication_Backend*cplan.Communications__c + SurestConcierge_Vendor_50_Score + SurestCSP_GSP_Extended_Networks_25_Score + Customer_Sponsored_Service_Center *cplan.Customer_Sponsored_Service_Center__c +
                    Eligibility *cplan.Eligibility__c + External_Audits_Range_Backend*cplan.External_Audits__c + FSA *cplan.FSA__c + Hospital_Systemss * cplan.Hospital_Systems__c + SurestIncentives_Rewards_50_Score + KA_to_NA_Transition_5_Score +
                    Medicare_Plan*cplan.Medicare_Plans__c + ne_Business_Exchange_Transition_Factor* cplan.New_Business_Exchange_Transition_Factor__c + SurestNew_Product_1st_Year_1_Score + Non_Eligibility_Vendor_Fee_Range_Backend * cplan.Non_Eligibility_Vendor_Feeds__c +
                    Onsite_Clinics + Optum_Partnership_Range_Backend*cplan.Optum_Partnership__c + UHG_Owned_Custom_Portal*cplan.UHG_Owned_Custom_Portal__c + Virtual_Visits_Telemedicine + Life_Score_Surest + Surest_SBC_Score + Surest_SPD_Score;
                system.debug('Total surest add '+surestAddonSum);
                Decimal factor = Decimal.valueOf(Label.X48_Factor);
                system.debug('factor '+factor);
                p.Surest_Add_Ons__c = surestAddonSum * factor;
                system.debug('Total surest addtoal '+ p.Surest_Add_Ons__c);
            }            
        }  
        calculateSbcAddOnUpdate(policyInfoNewMap,policyInfoOldMap);
    }
    
    public static void complexityLoigicUpdateHandler(Map<Id, Policy_Information__c> policyInfoNewMap,Map<Id, Policy_Information__c> policyInfoOldMap){
        stopRecursive=true;
        List<Policy_Information__c> filteredPolicyInfoList = new List<Policy_Information__c>();
        List<Id> policyInformationIdList = new List<Id>();
        Decimal reportingRange = 0.00;
        Decimal reportingRangeMoreThan51 = 0.00;
        Decimal reportingScore = 0.00;
        Decimal CustomerlayersScoreinclconsultants = 0.00;
        Decimal TotalActiveBenefitSetCountWeightage = 0.00;
        Decimal totalActiveBenefitSetsCountRange101 = 0.00;
        Decimal totalActiveBenefitSetsCount = 0.00;
        Decimal activeASOBenefitSetsScore = 0.00;
        Decimal totalFIBenefitSetsCountRange101More = 0.00;
        Decimal totalActiveFIBenefitSetsCount = 0.00;
        Decimal activeFIBenefitSetsScore = 0.00;
        Decimal frozenASOScore = 0.00;
        Decimal frozenFIScore = 0.00;
        Decimal totalASOFIBenefitSetsScore = 0.00;
        Decimal planVariationCountRange751 = 0.00;
        Decimal planVariationCount = 0.00;
        Decimal planVariationScore = 0.00;
        
        
        for(Policy_Information__c pNew : policyInfoNewMap.values()){
            //[sandhya:11-05-2020],added below single line of code instead of looping policyInfoOldMap values
            Policy_Information__c pOld = policyInfoOldMap.get(pNew.id);

            if(pNew.Reporting__c == null ){
                pNew.Reporting__c = 0;
            }
            
            if(pNew.Customer_layers_incl_consultants__c == null ){
                pNew.Customer_layers_incl_consultants__c = 0;
            }
            
            if(pNew.Total_Active_ASO_Benefit_Sets_Count__c == null ){
                pNew.Total_Active_ASO_Benefit_Sets_Count__c = 0;
            }
            
            if(pNew.Total_Active_FI_Benefit_Sets_Count__c == null ){
                pNew.Total_Active_FI_Benefit_Sets_Count__c = 0;
            }
            
            if(pNew.Plan_Variation_count_PVC__c == null ){
                pNew.Plan_Variation_count_PVC__c = 0;
            }
            
            if(pNew.Frozen_ASO_Plans__c == null ){
                pNew.Frozen_ASO_Plans__c = 0;
            }
            
            if(pNew.Frozen_FI_Plans__c == null ){
                pNew.Frozen_FI_Plans__c = 0;
            }
            
            if(pNew.Add_ons_Sum_of_total_input__c == null ){
                pNew.Add_ons_Sum_of_total_input__c = 0;
            }
                        
            for(Reporting__mdt eachreportMdt : reportMdt){                               
                if(eachreportMdt.DeveloperName == 'Range_51_more'){
                    reportingRangeMoreThan51 =  eachreportMdt.Weightage__c; 
                }                
                if(pNew.Reporting__c >= eachreportMdt.Start_Range__c && pNew.Reporting__c <= eachreportMdt.End_Range__c){
                    reportingRange = eachreportMdt.Weightage__c;
                }                             
            }
            
            if(pNew.Reporting__c != 0 && reportingRange == 0.00){
                reportingRange = reportingRangeMoreThan51;  
            }
            
            reportingScore = reportingRange * cplan.Reporting__c;
            CustomerlayersScoreinclconsultants = pNew.Customer_layers_incl_consultants__c * cplan.Customer_layers_incl_consultants__c;
            
            for(Total_Active_Benefit_Sets_Count__mdt eachtotalActiveBenefitSetsCountmdt : totalActiveBenefitSetsCountmdt){                
               
                if(eachtotalActiveBenefitSetsCountmdt.DeveloperName == 'Range_101'){
                    totalActiveBenefitSetsCountRange101 =  eachtotalActiveBenefitSetsCountmdt.Weightage__c; 
                }                
                if(pNew.Total_Active_ASO_Benefit_Sets_Count__c >= eachtotalActiveBenefitSetsCountmdt.Start_Range__c && pNew.Total_Active_ASO_Benefit_Sets_Count__c <= eachtotalActiveBenefitSetsCountmdt.End_Range__c){
                    totalActiveBenefitSetsCount = eachtotalActiveBenefitSetsCountmdt.Weightage__c;
                }                             
            }
            
            if(pNew.Total_Active_ASO_Benefit_Sets_Count__c != 0 && totalActiveBenefitSetsCount == 0.00){
                totalActiveBenefitSetsCount = totalActiveBenefitSetsCountRange101;  
            }
            activeASOBenefitSetsScore = pNew.Total_Active_ASO_Benefit_Sets_Count__c * totalActiveBenefitSetsCount;
       
            for(Total_FI_Benefit_Sets_Count__mdt eachtotalFIBenefitSetsCountmdt : totalFIBenefitSetsCountmdt){                
             
                if(eachtotalFIBenefitSetsCountmdt.DeveloperName == 'Range_101_More'){
                    totalFIBenefitSetsCountRange101More =  eachtotalFIBenefitSetsCountmdt.Weightage__c; 
                }               
                if(pNew.Total_Active_FI_Benefit_Sets_Count__c >= eachtotalFIBenefitSetsCountmdt.Start_Range__c && pNew.Total_Active_FI_Benefit_Sets_Count__c <= eachtotalFIBenefitSetsCountmdt.End_Range__c){
                    if(pNew.Company_private_exchange__c == 'Aon Active Health Exchange'){
                        totalActiveFIBenefitSetsCount = eachtotalFIBenefitSetsCountmdt.Weightage__c * 2; 
                    }else{
                        totalActiveFIBenefitSetsCount = eachtotalFIBenefitSetsCountmdt.Weightage__c;
                    }
                    
                }                             
            }
            if(pNew.Total_Active_FI_Benefit_Sets_Count__c != 0 && totalActiveFIBenefitSetsCount == 0.00){
                totalActiveFIBenefitSetsCount = totalFIBenefitSetsCountRange101More;  
            }
            
            activeFIBenefitSetsScore = pNew.Total_Active_FI_Benefit_Sets_Count__c * totalActiveFIBenefitSetsCount;            
            frozenASOScore = pNew.Frozen_ASO_Plans__c * cplan.Frozen_ASO_Plans__c;
            frozenFIScore = pNew.Frozen_FI_Plans__c * cplan.Frozen_FI_Plans__c;            
            totalASOFIBenefitSetsScore = activeASOBenefitSetsScore + activeFIBenefitSetsScore + frozenASOScore + frozenFIScore;
            
            for(Plan_Variation_Count__mdt eachplanVariationCountmdt : planVariationCountmdt){                
             
                if(eachplanVariationCountmdt.DeveloperName == 'Range_751'){
                    planVariationCountRange751 =  Decimal.ValueOf(eachplanVariationCountmdt.Weightage__c); 
                }               
                if(pNew.Plan_Variation_count_PVC__c >= eachplanVariationCountmdt.Start_Range__c && pNew.Plan_Variation_count_PVC__c <= eachplanVariationCountmdt.End_Range__c){
                    planVariationCount = Decimal.ValueOf(eachplanVariationCountmdt.Weightage__c);
                }                             
            }
            
            if(pNew.Plan_Variation_count_PVC__c != 0 && planVariationCount == 0.00){
                planVariationCount = planVariationCountRange751;  
            }
            
            planVariationScore = pNew.Plan_Variation_count_PVC__c * planVariationCount;
                        
            Decimal complexityScoreHourstoMaintain = pNew.Add_ons_Sum_of_total_input__c + reportingScore + customerlayersScoreinclconsultants + totalASOFIBenefitSetsScore + planVariationScore;
            
			if(complexityScoreHourstoMaintain!=pOld.Complexity_Score_Hours_to_Maintain__c && complexityScoreHourstoMaintain!=null &&complexityScoreHourstoMaintain!=0 ){
                pNew.Capacity_Plan__c=complexityScoreHourstoMaintain /1920;
                filteredPolicyInfoList.add(pNew);
            }else if(complexityScoreHourstoMaintain!=null && complexityScoreHourstoMaintain==0 && pNew.Company_private_exchange__c=='Aon Active Health Exchange'  ){
                pNew.Capacity_Plan__c=0.1;
            }else if(complexityScoreHourstoMaintain!=null && complexityScoreHourstoMaintain==0 && pNew.Company_private_exchange__c!='Aon Active Health Exchange'  ){
                pNew.Capacity_Plan__c=0.16;
            }
                        
            if(pNew.Manual_Adj_Case_FTE_for_Outliers__c==null ){
                if(pNew.Exchange_Factor__c != null){
                    //pNew.Adj_Case_FTE_for_outlierss__c =  (pNew.Capacity_Plan__c/ pNew.Exchange_Factor__c)/pNew.Multiple_Policy_Factor__c;  
                    pNew.Adj_Case_FTE_for_outlierss__c =  ((pNew.Capacity_Plan__c/ pNew.Exchange_Factor__c)/pNew.Multiple_Policy_Factor__c).setScale(2,RoundingMode.HALF_UP); 
                    system.debug('--pNew.Adj_Case_FTE_for_outlierss__c = '+pNew.Adj_Case_FTE_for_outlierss__c);
                } 
                filteredPolicyInfoList.add(pNew);
            }
            else if(pNew.Manual_Adj_Case_FTE_for_Outliers__c!=null ){
                pNew.Adj_Case_FTE_for_outlierss__c=pNew.Manual_Adj_Case_FTE_for_Outliers__c;
                filteredPolicyInfoList.add(pNew);
            }
                        
            //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------// 
            if(pNew.CMC_Complexity_Score__c != null && pNew.CMC_Complexity_Score__c != null){
                pNew.CMC_CASE_FTE__c = (pNew.CMC_Complexity_Score__c).setScale(2,RoundingMode.HALF_UP);
            }
            
            if(pNew.UMR_Complexity_Score__c != null){
                pNew.UMR_CASE_FTE__c = (pNew.UMR_Complexity_Score__c/1920).setScale(2,RoundingMode.HALF_UP);
            }
            
            // Added Capacity Model 2025s
            if(pNew.Specialty_Complexity_Score_2__c != null && pNew.Specialty_Complexity_Score_2__c != 0){
                pNew.Specialty_Case_FTE__c = (pNew.Specialty_Complexity_Score_2__c/1920).setScale(2,RoundingMode.HALF_UP);
            } else {
                pNew.Specialty_Case_FTE__c = 0.50;
            }
            
            if (pNew.Surest_Complexity_Score_Hrs_to_Maintain__c != null && pNew.Surest_Complexity_Score_Hrs_to_Maintain__c != 0) {
                pNew.Surest_Case_FTE__c = (pNew.Surest_Complexity_Score_Hrs_to_Maintain__c/1920).setScale(2, RoundingMode.HALF_UP);
            } else {
                pNew.Surest_Case_FTE__c = 0.10;
            }
            //End
            
            //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//
            
            //----------- SAMARTH - FOR CALCULATION OF CMC ADJ CASE FTE FOR OUTLIERS AND UMR ADJ CASE FTE FOR OUTLIERS - SAMARTH -----------
            
            if(pNew.CMC_Override_Adj_Case_FTE_for_Outliers__c == null ){
                pNew.CMC_Adj_Case_FTE_for_Outliers__c = pNew.CMC_CASE_FTE__c;
                filteredPolicyInfoList.add(pNew);
            }
            else if(pNew.CMC_Override_Adj_Case_FTE_for_Outliers__c != null ){
                pNew.CMC_Adj_Case_FTE_for_Outliers__c = pNew.CMC_Override_Adj_Case_FTE_for_Outliers__c;
                filteredPolicyInfoList.add(pNew);
            }          
            
            if(pNew.UMR_Override_Adj_Case_FTE_for_Outliers__c == null  ){
                if((pNew.Exchange_Factor__c != null || pNew.Exchange_Factor__c != 0) && (pNew.Multiple_Policy_Factor__c != null && pNew.Multiple_Policy_Factor__c != 0)){
                    pNew.UMR_Adj_Case_FTE_for_Outliers__c = ((pNew.UMR_CASE_FTE__c/ pNew.Exchange_Factor__c)/pNew.Multiple_Policy_Factor__c).setScale(2,RoundingMode.HALF_UP);   
                }
                else{
                    pNew.UMR_Adj_Case_FTE_for_Outliers__c = null;
                }
                filteredPolicyInfoList.add(pNew);
            }
            else if(pNew.UMR_Override_Adj_Case_FTE_for_Outliers__c != null ){
                pNew.UMR_Adj_Case_FTE_for_Outliers__c = pNew.UMR_Override_Adj_Case_FTE_for_Outliers__c;
                filteredPolicyInfoList.add(pNew);
            }
            //----------- SAMARTH - FOR CALCULATION OF CMC ADJ CASE FTE FOR OUTLIERS AND UMR ADJ CASE FTE FOR OUTLIERS - SAMARTH -----------            
        }        
    }
    
    public static void complexityLoigicInsertHandler(List<Policy_Information__c> policyInfoNewList){
        
        stopRecursiveForInsert=true;
        stopRecursive = true;
        List<Policy_Information__c> filteredPolicyInfoList = new List<Policy_Information__c>();
        Decimal reportingRange = 0.00;
        Decimal reportingRangeMoreThan51 = 0.00;
        Decimal reportingScore = 0.00;
        Decimal CustomerlayersScoreinclconsultants = 0.00;
        Decimal TotalActiveBenefitSetCountWeightage = 0.00;
        Decimal totalActiveBenefitSetsCountRange101 = 0.00;
        Decimal totalActiveBenefitSetsCount = 0.00;
        Decimal activeASOBenefitSetsScore = 0.00;
        Decimal totalFIBenefitSetsCountRange101More = 0.00;
        Decimal totalActiveFIBenefitSetsCount = 0.00;
        Decimal activeFIBenefitSetsScore = 0.00;
        Decimal frozenASOScore = 0.00;
        Decimal frozenFIScore = 0.00;
        Decimal totalASOFIBenefitSetsScore = 0.00;
        Decimal planVariationCountRange751 = 0.00;
        Decimal planVariationCount = 0.00;
        Decimal planVariationScore = 0.00;
        
        for(Policy_Information__c pNew : policyInfoNewList){  
            if(pNew.Customer_layers_incl_consultants__c == null ){
                pNew.Customer_layers_incl_consultants__c = 0;
            }
            
            if(pNew.Total_Active_ASO_Benefit_Sets_Count__c == null ){
                pNew.Total_Active_ASO_Benefit_Sets_Count__c = 0;
            }
            
            if(pNew.Total_Active_FI_Benefit_Sets_Count__c == null ){
                pNew.Total_Active_FI_Benefit_Sets_Count__c = 0;
            }
            
            if(pNew.Plan_Variation_count_PVC__c == null ){
                pNew.Plan_Variation_count_PVC__c = 0;
            }
            
            for(Reporting__mdt eachreportMdt : reportMdt){                
              
                if(eachreportMdt.DeveloperName == 'Range_51_more'){
                    reportingRangeMoreThan51 =  eachreportMdt.Weightage__c; 
                }
                
                if(pNew.Reporting__c >= eachreportMdt.Start_Range__c && pNew.Reporting__c <= eachreportMdt.End_Range__c){
                    reportingRange = eachreportMdt.Weightage__c;
                }                             
            }
            
            if(pNew.Reporting__c != 0 && reportingRange == 0.00){
                reportingRange = reportingRangeMoreThan51;  
            }
            
            reportingScore = reportingRange * cplan.Reporting__c;
            CustomerlayersScoreinclconsultants = pNew.Customer_layers_incl_consultants__c * cplan.Customer_layers_incl_consultants__c;
            
            for(Total_Active_Benefit_Sets_Count__mdt eachtotalActiveBenefitSetsCountmdt : totalActiveBenefitSetsCountmdt){                
              
                if(eachtotalActiveBenefitSetsCountmdt.DeveloperName == 'Range_101'){
                    totalActiveBenefitSetsCountRange101 =  eachtotalActiveBenefitSetsCountmdt.Weightage__c; 
                }
                
                if(pNew.Total_Active_ASO_Benefit_Sets_Count__c >= eachtotalActiveBenefitSetsCountmdt.Start_Range__c && pNew.Total_Active_ASO_Benefit_Sets_Count__c <= eachtotalActiveBenefitSetsCountmdt.End_Range__c){
                    totalActiveBenefitSetsCount = eachtotalActiveBenefitSetsCountmdt.Weightage__c;
                }                             
            }
            
            if(pNew.Total_Active_ASO_Benefit_Sets_Count__c  != 0 && totalActiveBenefitSetsCount == 0.00){
                totalActiveBenefitSetsCount = totalActiveBenefitSetsCountRange101;  
            }
            
            activeASOBenefitSetsScore = pNew.Total_Active_ASO_Benefit_Sets_Count__c * totalActiveBenefitSetsCount;
      
            for(Total_FI_Benefit_Sets_Count__mdt eachtotalFIBenefitSetsCountmdt : totalFIBenefitSetsCountmdt){                
              
                if(eachtotalFIBenefitSetsCountmdt.DeveloperName == 'Range_101_More'){
                    totalFIBenefitSetsCountRange101More =  eachtotalFIBenefitSetsCountmdt.Weightage__c; 
                }
                
                if(pNew.Total_Active_FI_Benefit_Sets_Count__c >= eachtotalFIBenefitSetsCountmdt.Start_Range__c && pNew.Total_Active_FI_Benefit_Sets_Count__c <= eachtotalFIBenefitSetsCountmdt.End_Range__c){
                    if(pNew.Company_private_exchange__c == 'Aon Active Health Exchange'){
                        totalActiveFIBenefitSetsCount = eachtotalFIBenefitSetsCountmdt.Weightage__c * 2; 
                    }else{
                        totalActiveFIBenefitSetsCount = eachtotalFIBenefitSetsCountmdt.Weightage__c;
                    }                    
                }                             
            }
            
            if(pNew.Total_Active_FI_Benefit_Sets_Count__c != 0 && totalActiveFIBenefitSetsCount == 0.00){
                totalActiveFIBenefitSetsCount = totalFIBenefitSetsCountRange101More;  
            }
            
            activeFIBenefitSetsScore = pNew.Total_Active_FI_Benefit_Sets_Count__c * totalActiveFIBenefitSetsCount;            
            frozenASOScore = pNew.Frozen_ASO_Plans__c * cplan.Frozen_ASO_Plans__c;
            frozenFIScore = pNew.Frozen_FI_Plans__c * cplan.Frozen_FI_Plans__c;            
            totalASOFIBenefitSetsScore = activeASOBenefitSetsScore + activeFIBenefitSetsScore + frozenASOScore + frozenFIScore;
            
            for(Plan_Variation_Count__mdt eachplanVariationCountmdt : planVariationCountmdt){                
              
                if(eachplanVariationCountmdt.DeveloperName == 'Range_751'){
                    planVariationCountRange751 =  Decimal.ValueOf(eachplanVariationCountmdt.Weightage__c); 
                }
                
                if(pNew.Plan_Variation_count_PVC__c >= eachplanVariationCountmdt.Start_Range__c && pNew.Plan_Variation_count_PVC__c <= eachplanVariationCountmdt.End_Range__c){
                    planVariationCount = Decimal.ValueOf(eachplanVariationCountmdt.Weightage__c);
                }                             
            }
            
            if(pNew.Plan_Variation_count_PVC__c != 0 && planVariationCount == 0.00){
                planVariationCount = planVariationCountRange751;  
            }
            
            planVariationScore = pNew.Plan_Variation_count_PVC__c * planVariationCount;
         
            Decimal complexityScoreHourstoMaintain = pNew.Add_ons_Sum_of_total_input__c + reportingScore + customerlayersScoreinclconsultants + totalASOFIBenefitSetsScore + planVariationScore;
            
            if( complexityScoreHourstoMaintain != null && complexityScoreHourstoMaintain != 0 ){
                pNew.Capacity_Plan__c=complexityScoreHourstoMaintain /1920;
                filteredPolicyInfoList.add(pNew);
            }else if( complexityScoreHourstoMaintain!=null &&complexityScoreHourstoMaintain==0 && pNew.Company_private_exchange__c!='Aon Active Health Exchange'){
                pNew.Capacity_Plan__c=0.16;
            }
            else if( complexityScoreHourstoMaintain!=null &&complexityScoreHourstoMaintain==0 && pNew.Company_private_exchange__c=='Aon Active Health Exchange'){
                pNew.Capacity_Plan__c=0.1;
            }
            
            if(pNew.Manual_Adj_Case_FTE_for_Outliers__c==null ){
                if(pNew.Exchange_Factor__c != null){
                    pNew.Adj_Case_FTE_for_outlierss__c =  ((pNew.Capacity_Plan__c/ pNew.Exchange_Factor__c)/pNew.Multiple_Policy_Factor__c).setScale(2,RoundingMode.HALF_UP);   
                } 
                filteredPolicyInfoList.add(pNew);
            }
            else if(pNew.Manual_Adj_Case_FTE_for_Outliers__c!=null ){
                pNew.Adj_Case_FTE_for_outlierss__c=pNew.Manual_Adj_Case_FTE_for_Outliers__c;
                filteredPolicyInfoList.add(pNew);
            }
            
            //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//
            if(pNew.CMC_Complexity_Score__c != null && pNew.CMC_Complexity_Score__c != null){
                pNew.CMC_CASE_FTE__c = (pNew.CMC_Complexity_Score__c).setScale(2,RoundingMode.HALF_UP);
            }            
            if(pNew.UMR_Complexity_Score__c != null){
                pNew.UMR_CASE_FTE__c = (pNew.UMR_Complexity_Score__c/1920).setScale(2,RoundingMode.HALF_UP);
            }            
            
            // Added Capacity Model 2025s
            if(pNew.Specialty_Complexity_Score_2__c != null && pNew.Specialty_Complexity_Score_2__c != 0){
                pNew.Specialty_Case_FTE__c = (pNew.Specialty_Complexity_Score_2__c/1920).setScale(2,RoundingMode.HALF_UP);
            } else {
                pNew.Specialty_Case_FTE__c = 0.50;
            }
            

            if (pNew.Surest_Complexity_Score_Hrs_to_Maintain__c != null && pNew.Surest_Complexity_Score_Hrs_to_Maintain__c != 0) {
                pNew.Surest_Case_FTE__c = (pNew.Surest_Complexity_Score_Hrs_to_Maintain__c/1920).setScale(2, RoundingMode.HALF_UP);
            } else {
                pNew.Surest_Case_FTE__c = 0.10;
            }
          
            //End
            //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//
            
            //----------- SAMARTH - FOR CALCULATION OF CMC ADJ CASE FTE FOR OUTLIERS AND UMR ADJ CASE FTE FOR OUTLIERS - SAMARTH -----------
            
            if(pNew.CMC_Override_Adj_Case_FTE_for_Outliers__c == null ){
                pNew.CMC_Adj_Case_FTE_for_Outliers__c = pNew.CMC_CASE_FTE__c;    
                filteredPolicyInfoList.add(pNew);
            }
            else if(pNew.CMC_Override_Adj_Case_FTE_for_Outliers__c != null ){
                pNew.CMC_Adj_Case_FTE_for_Outliers__c = pNew.CMC_Override_Adj_Case_FTE_for_Outliers__c;
                filteredPolicyInfoList.add(pNew);
            }
            
            if(pNew.UMR_Override_Adj_Case_FTE_for_Outliers__c == null ){
                pNew.UMR_Adj_Case_FTE_for_Outliers__c = ((pNew.UMR_CASE_FTE__c/ pNew.Exchange_Factor__c)/pNew.Multiple_Policy_Factor__c).setScale(2,RoundingMode.HALF_UP);
                filteredPolicyInfoList.add(pNew);
            }
            else if(pNew.UMR_Override_Adj_Case_FTE_for_Outliers__c != null ){
                pNew.UMR_Adj_Case_FTE_for_Outliers__c = pNew.UMR_Override_Adj_Case_FTE_for_Outliers__c;
                filteredPolicyInfoList.add(pNew);
            }            
            //----------- SAMARTH - FOR CALCULATION OF CMC ADJ CASE FTE FOR OUTLIERS AND UMR ADJ CASE FTE FOR OUTLIERS - SAMARTH -----------            
        }
    }
    
    public static void calculateAddOnInsert(List<Policy_Information__c> policyInfoNewList){
        Map<String, Map<String,Decimal>> weightages = DontAllowDuplicatePolicyNumbersHelper.getPicklistWeightage();
        
        decimal Salesforce_Volume_Backend ;
        decimal of_Member_Meetings_Range_Backend;
        decimal X3_or_4_Tier_Benefit_Backend;
        decimal Accum_Files_Range_Backend;
        decimal Carve_In_Pharmacy_Backend;
        decimal COBRA_Backend;
        Decimal Communication_Backend;
        Decimal CSP_GSP_or_Extended_Networks;
        Decimal DentalBackend;
        Decimal Eligibility;
        Decimal External_Audits_Range_Backend;
        Decimal FSA;
        Decimal Hospital_Systemss;
        Decimal Incentives_Rewards_Range_Backend;
        Decimal Life;
        Decimal Medicare_Plan;
        Decimal ne_Business_Exchange_Transition_Factor;
        Decimal New_Product_1st_Year_1;
        Decimal Non_Eligibility_Vendor_Fee_Range_Backend;
        Decimal Optum_Partnership_Range_Backend ;
        Decimal SBC_Range_Backend;
        Decimal SPD_Range_Backend;
        Decimal UHG_Owned_Custom_Portal;
        Decimal VisionBackend;
        Decimal Customer_Sponsored_Service_Center;
        Decimal KA_to_NA_transition_5;
        Decimal Virtual_Visits_Telemedicine;
        Decimal Onsite_Clinics;
        Decimal Gated_Plans;
        Decimal Concierge_Vendor; Decimal Rental_Networks_Weightage;
        Decimal UMR_Incentives_Weightage;
        Decimal UMR_SBC_Weightage;
        Decimal Single_Sign_On_Weightage;
        Decimal UMR_SPD_Weightage;
        Decimal UMR_StopLoss_Weightage;        
        //--------------------------------Varun---------------------------------------//
        Decimal of_Customer_Related_Meetings_Backend = 0;
        Decimal Surest_Helath_Plan_Backend = 0;
        //--------------------------------Varun---------------------------------------//
        //--------------------------------Added Capacity Model 2025---------------------------------------//
        Decimal Surest_Monthly_Reporting_Score = 0;
        Decimal SurestConcierge_Vendor_50_Score = 0;
        Decimal KA_to_NA_Transition_5_Score = 0;
        Decimal SurestNew_Product_1st_Year_1_Score = 0;
        Decimal Carve_in_Pharmacy_0_5_Score = 0;
        Decimal SurestCSP_GSP_Extended_Networks_25_Score = 0;
        Decimal SurestIncentives_Rewards_50_Score = 0;
        Decimal OBM_Score = 0;
        Decimal Surest_SBC_Score = 0;
        Decimal Surest_SPD_Score = 0;
        Decimal Life_Score_Surest = 0;
        //-----------------------------------------------------------------------//
        
        for(Policy_Information__c p : policyInfoNewList){
            Salesforce_Volume_Backend=0;
            of_Member_Meetings_Range_Backend=0;
            X3_or_4_Tier_Benefit_Backend=0;
            Accum_Files_Range_Backend=0;
            Carve_In_Pharmacy_Backend=0;
            COBRA_Backend=0;
            Communication_Backend=0;
            CSP_GSP_or_Extended_Networks=0;
            DentalBackend=0;
            Eligibility=0;
            External_Audits_Range_Backend=0;
            FSA=0;
            Hospital_Systemss=0;
            Incentives_Rewards_Range_Backend=0;
            Life=0;
            Medicare_Plan=0;
            ne_Business_Exchange_Transition_Factor=0;
            New_Product_1st_Year_1=0;
            Non_Eligibility_Vendor_Fee_Range_Backend=0;
            Optum_Partnership_Range_Backend=0;
            SBC_Range_Backend=0;
            SPD_Range_Backend=0;
            UHG_Owned_Custom_Portal=0;
            VisionBackend=0;
            Customer_Sponsored_Service_Center=0;
            KA_to_NA_transition_5=0; Rental_Networks_Weightage= 0;
            UMR_Incentives_Weightage= 0;
            UMR_SBC_Weightage= 0;
            Single_Sign_On_Weightage= 0;
            UMR_SPD_Weightage= 0;
            UMR_StopLoss_Weightage= 0;
            
            Virtual_Visits_Telemedicine = p.Virtual_Visits_Telemedicine__c != null ? weightages.get('Virtual_Visits_Telemedicine__c').get(p.Virtual_Visits_Telemedicine__c) :0;
            Onsite_Clinics = p.Onsite_Clinics__c != null ? weightages.get('Onsite_Clinics__c').get(p.Onsite_Clinics__c) :0;
            Gated_Plans = p.Gated_Plans__c != null ? weightages.get('Gated_Plans__c').get(p.Gated_Plans__c) :0;
            Concierge_Vendor = p.Concierge_Vendor__c != null ? weightages.get('Concierge_Vendor__c').get(p.Concierge_Vendor__c) :0;  
            KA_to_NA_transition_5 = p.Migration__c != null ? weightages.get('Migration__c').get(p.Migration__c) :0;           
            Rental_Networks_Weightage = (p.Rental_Networks__c != null) ? weightages.get('Rental_Networks__c').get(p.Rental_Networks__c) : 0;
            UMR_Incentives_Weightage = (p.UMR_Incentives_Rewards__c != null) ? weightages.get('UMR_Incentives_Rewards__c').get(p.UMR_Incentives_Rewards__c) : 0;
            Single_Sign_On_Weightage = (p.Single_Sign_On__c != null) ? weightages.get('Single_Sign_On__c').get(p.Single_Sign_On__c) : 0 ; 
            UMR_StopLoss_Weightage = (p.UMR_Stop_Loss__c != null) ? weightages.get('UMR_Stop_Loss__c').get(p.UMR_Stop_Loss__c) : 0;
            UMR_SPD_Weightage = getWeightageFromRange('UMR_SPD__c', p.UMR_SPD__c);
            UMR_SBC_Weightage = getWeightageFromRange('UMR_SBC__c', p.UMR_SBC__c);            
            //--------------------------------Varun---------------------------------------//
            of_Customer_Related_Meetings_Backend = p.of_Customer_Related_Meetings_Backend__c != null ? p.of_Customer_Related_Meetings_Backend__c : 0;
            Surest_Helath_Plan_Backend = p.Surest_Helath_Plan_Backend__c != null ? p.Surest_Helath_Plan_Backend__c : 0;
            //--------------------------------Varun---------------------------------------//
            //--------------------------------Added Capacity Model 2025s---------------------------------------//
            Surest_Monthly_Reporting_Score = p.Surest_Monthly_Reporting_Score__c != null ? p.Surest_Monthly_Reporting_Score__c : 0;
            SurestConcierge_Vendor_50_Score = p.SurestConcierge_Vendor_50_Score__c != null ? p.SurestConcierge_Vendor_50_Score__c : 0;
            KA_to_NA_Transition_5_Score = p.KA_to_NA_Transition_5_Score__c != null ? p.KA_to_NA_Transition_5_Score__c : 0;
            SurestNew_Product_1st_Year_1_Score = p.SurestNew_Product_1st_Year_1_Score__c != null ? p.SurestNew_Product_1st_Year_1_Score__c : 0;
            Carve_in_Pharmacy_0_5_Score = p.Carve_in_Pharmacy_0_5_Score__c != null ? p.Carve_in_Pharmacy_0_5_Score__c : 0;
            SurestCSP_GSP_Extended_Networks_25_Score = p.SurestCSP_GSP_Extended_Networks_25_Score__c != null ? p.SurestCSP_GSP_Extended_Networks_25_Score__c : 0;
            SurestIncentives_Rewards_50_Score = p.SurestIncentives_Rewards_50_Score__c != null ? p.SurestIncentives_Rewards_50_Score__c : 0;
            OBM_Score = p.OBM_Score__c != null ? p.OBM_Score__c : 0;
            Surest_SBC_Score = p.Surest_SBC_Score__c != null ? p.Surest_SBC_Score__c : 0;
            Surest_SPD_Score = p.Surest_SPD_Score__c != null ? p.Surest_SPD_Score__c : 0;
            Life_Score_Surest = p.Life_Score_Surest__c != null ? p.Life_Score_Surest__c : 0;
            //-----------------------------------------------------------------------//            
            
            if(p.Salesforce_Volume_Backend__c != null)
            {
                Salesforce_Volume_Backend= p.Salesforce_Volume_Backend__c;
            }else{
                Salesforce_Volume_Backend=0;
            }
            if(p.of_Member_Meetings_Range_Backend__c != null)
            {
                of_Member_Meetings_Range_Backend = p.of_Member_Meetings_Range_Backend__c;
            }else {
                of_Member_Meetings_Range_Backend = 0;
            }
            if(p.X3_or_4_Tier_Benefit_Backend__c != null)
            {
                X3_or_4_Tier_Benefit_Backend =p.X3_or_4_Tier_Benefit_Backend__c;
            }else{
                X3_or_4_Tier_Benefit_Backend=0;
            }
            if(p.Accum_Files_Range_Backend__c != null)
            {
                Accum_Files_Range_Backend = p.Accum_Files_Range_Backend__c;
            }else{
                Accum_Files_Range_Backend = 0;
            }
            if(p.Carve_In_Pharmacy__c != null)
            {
                Carve_In_Pharmacy_Backend= weightages.get('Carve_In_Pharmacy__c').get(p.Carve_In_Pharmacy__c);
            }else{
                Carve_In_Pharmacy_Backend=0;
            }
            if(p.COBRA_Backend__c != null)
            {
                COBRA_Backend = p.COBRA_Backend__c;
            }else{
                COBRA_Backend=0;
            }
            if(p.Communication_Backend__c != null)
            {
                Communication_Backend = p.Communication_Backend__c;
            }else{
                Communication_Backend= 0;
            }
            
            if(p.CSP_GSP_or_Extended_Networks__c != null)
            {
                CSP_GSP_or_Extended_Networks = weightages.get('CSP_GSP_or_Extended_Networks__c').get(p.CSP_GSP_or_Extended_Networks__c);
            }else{
                CSP_GSP_or_Extended_Networks=0;
            }
            if(p.Customer_Sponsored_Service_Center__c != null)
            {
                Customer_Sponsored_Service_Center = Decimal.valueOf(p.Customer_Sponsored_Service_Center__c); 
            }else{
                Customer_Sponsored_Service_Center=0;
            }
            if(p.Eligibility__c != null)
            {
                Eligibility = Decimal.valueOf(p.Eligibility__c);
            }else{
                Eligibility=0;
            }
            if(p.External_Audits_Range_Backend__c != null)
            {
                External_Audits_Range_Backend = p.External_Audits_Range_Backend__c;
            }else{
                External_Audits_Range_Backend = 0;
            }
            if(p.FSA_c__c != null)
            {
                FSA = Decimal.valueOf(p.FSA_c__c);
            }else{
                FSA= 0;
            }
            if(p.Hospital_Systemss__c != null)
            {
                Hospital_Systemss = Decimal.valueOf(p.Hospital_Systemss__c);
            }else{
                Hospital_Systemss= 0;
            }
            if(p.Incentives_Rewards_Range_Backend__c != null)
            {
                Incentives_Rewards_Range_Backend = p.Incentives_Rewards_Range_Backend__c;
            }else{
                Incentives_Rewards_Range_Backend=0;
            }
            if(p.Life__c != null)
            {
                Life= Decimal.valueOf(p.Life__c);
            }else{
                Life= 0;
            }
            if(p.Medicare_Plan__c != null)
            {
                Medicare_Plan = Decimal.valueOf(p.Medicare_Plan__c);
            }else{
                Medicare_Plan = 0;
            }
            if(p.ne_Business_Exchange_Transition_Factor__c != null)
            {
                ne_Business_Exchange_Transition_Factor = Decimal.valueOf(p.ne_Business_Exchange_Transition_Factor__c);
            }else{
                ne_Business_Exchange_Transition_Factor = 0;
            }
            if(p.New_Product_1st_Year_1__c != null)
            {
                New_Product_1st_Year_1 = p.New_Product_1st_Year_1__c;
            }else{
                New_Product_1st_Year_1 =0;
            }
            if(p.Non_Eligibility_Vendor_Fee_Range_Backend__c != null)
            {
                Non_Eligibility_Vendor_Fee_Range_Backend = p.Non_Eligibility_Vendor_Fee_Range_Backend__c;
            }else{
                Non_Eligibility_Vendor_Fee_Range_Backend= 0 ;
            }
            if(p.Optum_Partnership_Range_Backend__c != null)
            {
                Optum_Partnership_Range_Backend = p.Optum_Partnership_Range_Backend__c;
            }else{
                Optum_Partnership_Range_Backend=0;
            }
            if(p.SBC_Range_Backend__c != null)
            {
                SBC_Range_Backend = p.SBC_Range_Backend__c;
            }else{
                SBC_Range_Backend=0;
            }
            if(p.SPD_Range_Backend__c != null)
            {
                SPD_Range_Backend = p.SPD_Range_Backend__c;
            }else{
                SPD_Range_Backend=0;
            }
            if(p.UHG_Owned_Custom_Portal__c != null)
            {
                UHG_Owned_Custom_Portal = Decimal.valueOf(p.UHG_Owned_Custom_Portal__c);
            }else{
                UHG_Owned_Custom_Portal=0;
            }
            
            
            if(p.Add_ons_Sum_of_total_input__c == null ){ 
             
                decimal addonssum=
                    Salesforce_Volume_Backend*cplan.Salesforce_Volume__c +
                    of_Member_Meetings_Range_Backend*cplan.of_Member_Meetings__c
                    + X3_or_4_Tier_Benefit_Backend *cplan.X3_or_4_Tier_Benefit_5__c
                    + Accum_Files_Range_Backend *cplan.Accum_Files__c + Carve_In_Pharmacy_Backend 
                    +COBRA_Backend*cplan.COBRA__c + Communication_Backend*cplan.Communications__c +CSP_GSP_or_Extended_Networks 
                    + Customer_Sponsored_Service_Center *cplan.Customer_Sponsored_Service_Center__c +
                    +Eligibility *cplan.Eligibility__c + External_Audits_Range_Backend*cplan.External_Audits__c + FSA *cplan.FSA__c+
                    Hospital_Systemss * cplan.Hospital_Systems__c +
                    Incentives_Rewards_Range_Backend*cplan.Incentives_Rewards__c +
                    KA_to_NA_transition_5 + Medicare_Plan*cplan.Medicare_Plans__c +
                    ne_Business_Exchange_Transition_Factor* cplan.New_Business_Exchange_Transition_Factor__c +
                    New_Product_1st_Year_1*cplan.New_Product_1st_Year__c +
                    Non_Eligibility_Vendor_Fee_Range_Backend * cplan.Non_Eligibility_Vendor_Feeds__c +
                    Optum_Partnership_Range_Backend*cplan.Optum_Partnership__c+
                    SBC_Range_Backend *cplan.SBC__c +
                    SPD_Range_Backend*cplan.SPD__c +
                    UHG_Owned_Custom_Portal*cplan.UHG_Owned_Custom_Portal__c +Concierge_Vendor + Gated_Plans +
                    Onsite_Clinics + Virtual_Visits_Telemedicine +Rental_Networks_Weightage + UMR_Incentives_Weightage + UMR_SBC_Weightage + Single_Sign_On_Weightage + 
                    UMR_SPD_Weightage + UMR_StopLoss_Weightage + Surest_Helath_Plan_Backend + of_Customer_Related_Meetings_Backend ;
                
                p.Add_ons_Sum_of_total_input__c=addonssum * cplan.Add_onmultipplier__c ;              
                 
            }
            
            //Added Capacity Model 2025s
            decimal surestAddonSum = Surest_Monthly_Reporting_Score + of_Member_Meetings_Range_Backend*cplan.of_Member_Meetings__c + X3_or_4_Tier_Benefit_Backend *cplan.X3_or_4_Tier_Benefit_5__c + Accum_Files_Range_Backend *cplan.Accum_Files__c +
                Carve_in_Pharmacy_0_5_Score + COBRA_Backend*cplan.COBRA__c + Communication_Backend*cplan.Communications__c + SurestConcierge_Vendor_50_Score + SurestCSP_GSP_Extended_Networks_25_Score + Customer_Sponsored_Service_Center *cplan.Customer_Sponsored_Service_Center__c +
                Eligibility *cplan.Eligibility__c + External_Audits_Range_Backend*cplan.External_Audits__c + FSA *cplan.FSA__c + Hospital_Systemss * cplan.Hospital_Systems__c + SurestIncentives_Rewards_50_Score + KA_to_NA_Transition_5_Score +
                Medicare_Plan*cplan.Medicare_Plans__c + ne_Business_Exchange_Transition_Factor* cplan.New_Business_Exchange_Transition_Factor__c + SurestNew_Product_1st_Year_1_Score + Non_Eligibility_Vendor_Fee_Range_Backend * cplan.Non_Eligibility_Vendor_Feeds__c +
                Onsite_Clinics + Optum_Partnership_Range_Backend*cplan.Optum_Partnership__c + UHG_Owned_Custom_Portal*cplan.UHG_Owned_Custom_Portal__c + Virtual_Visits_Telemedicine + Life_Score_Surest + Surest_SBC_Score + Surest_SPD_Score;
            Decimal factor = Decimal.valueOf(Label.X48_Factor);
            p.Surest_Add_Ons__c = surestAddonSum * factor;
            
        }
        calculateSbcAddOnInsert(policyInfoNewList);
    }
    
    //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//
    public static void calculateSbcAddOnInsert(List<Policy_Information__c> policyInfoNewList){
        Map<String, Map<String,Decimal>> weightages = DontAllowDuplicatePolicyNumbersHelper.getSbcPicklistWeightage(); 
        Capacity_Planning_SBC_Calculation_Weight__mdt weightageMdt = [SELECT Id, Specialty_Open_Enrollment_Meeting_Weight__c FROM Capacity_Planning_SBC_Calculation_Weight__mdt WHERE DeveloperName = 'Weightages' LIMIT 1];
        
        for(Policy_Information__c piRecord: policyInfoNewList){
            Decimal ASO_Funding = piRecord.ASO_Funding__c != null ? weightages.get('ASO_Funding__c').get(piRecord.ASO_Funding__c) :0;
            Decimal Vision = piRecord.Vision__c != null ? weightages.get('Vision__c').get(piRecord.Vision__c) :0;
            Decimal Dental = piRecord.Dental__c != null ? weightages.get('Dental__c').get(piRecord.Dental__c) :0;
            Decimal DHMO_Dental = piRecord.DHMO_Dental__c != null ? weightages.get('DHMO_Dental__c').get(piRecord.DHMO_Dental__c) :0;
            Decimal Life = piRecord.Life__c != null ? weightages.get('Life__c').get(piRecord.Life__c) :0;
            Decimal FMLA = piRecord.FMLA__c != null ? weightages.get('FMLA__c').get(piRecord.FMLA__c) :0;
            Decimal Disability_Insurance = piRecord.Disability_Insurance__c != null ? weightages.get('Disability_Insurance__c').get(piRecord.Disability_Insurance__c) :0;
            Decimal Flex_Work = piRecord.Flex_Work__c != null ? weightages.get('Flex_Work__c').get(piRecord.Flex_Work__c) :0;
            Decimal Exec_Med = piRecord.Exec_Med__c != null ? weightages.get('Exec_Med__c').get(piRecord.Exec_Med__c) :0;
            Decimal Critical_Illness = piRecord.Critical_Illness__c != null ? weightages.get('Critical_Illness__c').get(piRecord.Critical_Illness__c) :0;
            Decimal Accident = piRecord.Accident__c != null ? weightages.get('Accident__c').get(piRecord.Accident__c) :0;
            Decimal HIPP = piRecord.HIPP__c != null ? weightages.get('HIPP__c').get(piRecord.HIPP__c) :0;
            Decimal B2H = piRecord.B2H__c != null ? weightages.get('B2H__c').get(piRecord.B2H__c) :0;
            Decimal FIGO = piRecord.FIGO__c != null ? weightages.get('FIGO__c').get(piRecord.FIGO__c) :0;
            Decimal Other_Platforms = piRecord.Other_Platforms__c != null ? weightages.get('Other_Platforms__c').get(piRecord.Other_Platforms__c) :0;
            Decimal Embedded_Status = piRecord.Embedded_Status__c != null ? weightages.get('Embedded_Status__c').get(piRecord.Embedded_Status__c) :0;
            Decimal Specialty_New_Product_1st_Year = piRecord.Specialty_New_Product_1st_Year__c != null ? weightages.get('Specialty_New_Product_1st_Year__c').get(piRecord.Specialty_New_Product_1st_Year__c) :0;
            Decimal Specialty_Vendor_Feeds = piRecord.Specialty_Vendor_Feeds__c != null ? weightages.get('Specialty_Vendor_Feeds__c').get(piRecord.Specialty_Vendor_Feeds__c) :0;
            Decimal Vision_Hard_ID_Cards = piRecord.Vision_Hard_ID_Cards__c != null ? weightages.get('Vision_Hard_ID_Cards__c').get(piRecord.Vision_Hard_ID_Cards__c) :0;
            system.debug('piRecord.Specialty_Open_Enrollment_Meetings__c = '+piRecord.Specialty_Open_Enrollment_Meetings__c+' weightageMdt.Specialty_Open_Enrollment_Meeting_Weight__c');
            
            Decimal addOns_Sum = ASO_Funding + Vision + Dental + DHMO_Dental + Life + FMLA + Disability_Insurance + Flex_Work + Exec_Med + Critical_Illness + Accident + HIPP + 
                B2H + FIGO + Other_Platforms + Embedded_Status + Specialty_New_Product_1st_Year + piRecord.Specialty_Open_Enrollment_Meetings_Score__c + Specialty_Vendor_Feeds + Vision_Hard_ID_Cards +
                piRecord.Specialty_Customer_Meetings_Score__c + piRecord.Specialty_Communications_Score__c + piRecord.Specialty_Standard_Reports_Score__c + piRecord.Specialty_SPD_s_COC_s_Score__c +
                piRecord.Eligibility_Financial_Protection_Score__c + piRecord.Specialty_Claim_Research_Score__c;   //Added by Vignesh -- Capacity Model 2025s
          
            Decimal factor = Decimal.valueOf(Label.X48_Factor);
            piRecord.Specialty_Add_Ons_Score__c = addOns_Sum * factor;
          
            piRecord.Total_Specialty_Sets_Score__c = piRecord.ASO_Specialty_Sets_Score__c + piRecord.FI_Specialty_Sets_Score__c;
             
            piRecord.Specialty_Complexity_Score_2__c = piRecord.Specialty_Add_Ons_Score__c + piRecord.Specialty_Custom_Reporting_Score__c + piRecord.Specialty_Membership_Make_up_Score__c +
                piRecord.Specialty_Internal_Customer_Layers_Score__c + piRecord.Specialty_External_Customer_Layers_Score__c + piRecord.Total_Specialty_Sets_Score__c  + piRecord.Specialty_PVRC_Score__c;              
        }
    }
    
    public static void calculateSbcAddOnUpdate(Map<Id, Policy_Information__c> policyInfoNewMap, Map<Id, Policy_Information__c> policyInfoOldMap){
        Map<String, Map<String,Decimal>> weightages = DontAllowDuplicatePolicyNumbersHelper.getSbcPicklistWeightage(); 
        List<Policy_Information__c> filteredPolicyInfoList = new List<Policy_Information__c>();
        Capacity_Planning_SBC_Calculation_Weight__mdt weightageMdt = [SELECT Id, Specialty_Open_Enrollment_Meeting_Weight__c FROM Capacity_Planning_SBC_Calculation_Weight__mdt WHERE DeveloperName = 'Weightages' LIMIT 1];
        
        
        System.debug('filteredPolicyInfoList = '+filteredPolicyInfoList);
        for(Policy_Information__c piRecord: policyInfoNewMap.values()){
            System.debug('Inside for');
            Decimal ASO_Funding = piRecord.ASO_Funding__c != null ? weightages.get('ASO_Funding__c').get(piRecord.ASO_Funding__c) :0;
            Decimal Vision = piRecord.Vision__c != null ? weightages.get('Vision__c').get(piRecord.Vision__c) :0;
            Decimal Dental = piRecord.Dental__c != null ? weightages.get('Dental__c').get(piRecord.Dental__c) :0;
            Decimal DHMO_Dental = piRecord.DHMO_Dental__c != null ? weightages.get('DHMO_Dental__c').get(piRecord.DHMO_Dental__c) :0;
            Decimal Life = piRecord.Life__c != null ? weightages.get('Life__c').get(piRecord.Life__c) :0;
            Decimal FMLA = piRecord.FMLA__c != null ? weightages.get('FMLA__c').get(piRecord.FMLA__c) :0;
            Decimal Disability_Insurance = piRecord.Disability_Insurance__c != null ? weightages.get('Disability_Insurance__c').get(piRecord.Disability_Insurance__c) :0;
            Decimal Flex_Work = piRecord.Flex_Work__c != null ? weightages.get('Flex_Work__c').get(piRecord.Flex_Work__c) :0;
            Decimal Exec_Med = piRecord.Exec_Med__c != null ? weightages.get('Exec_Med__c').get(piRecord.Exec_Med__c) :0;
            Decimal Critical_Illness = piRecord.Critical_Illness__c != null ? weightages.get('Critical_Illness__c').get(piRecord.Critical_Illness__c) :0;
            Decimal Accident = piRecord.Accident__c != null ? weightages.get('Accident__c').get(piRecord.Accident__c) :0;
            Decimal HIPP = piRecord.HIPP__c != null ? weightages.get('HIPP__c').get(piRecord.HIPP__c) :0;
            Decimal B2H = piRecord.B2H__c != null ? weightages.get('B2H__c').get(piRecord.B2H__c) :0;
            Decimal FIGO = piRecord.FIGO__c != null ? weightages.get('FIGO__c').get(piRecord.FIGO__c) :0;
            Decimal Other_Platforms = piRecord.Other_Platforms__c != null ? weightages.get('Other_Platforms__c').get(piRecord.Other_Platforms__c) :0;
            Decimal Embedded_Status = piRecord.Embedded_Status__c != null ? weightages.get('Embedded_Status__c').get(piRecord.Embedded_Status__c) :0;
            Decimal Specialty_New_Product_1st_Year = piRecord.Specialty_New_Product_1st_Year__c != null ? weightages.get('Specialty_New_Product_1st_Year__c').get(piRecord.Specialty_New_Product_1st_Year__c) :0;
            Decimal Specialty_Vendor_Feeds = piRecord.Specialty_Vendor_Feeds__c != null ? weightages.get('Specialty_Vendor_Feeds__c').get(piRecord.Specialty_Vendor_Feeds__c) :0;
            Decimal Vision_Hard_ID_Cards = piRecord.Vision_Hard_ID_Cards__c != null ? weightages.get('Vision_Hard_ID_Cards__c').get(piRecord.Vision_Hard_ID_Cards__c) :0;

            Decimal addOns_Sum = ASO_Funding + Vision + Dental + DHMO_Dental + Life + FMLA + Disability_Insurance + Flex_Work + Exec_Med + Critical_Illness + Accident + HIPP + 
                B2H + FIGO + Other_Platforms + Embedded_Status + Specialty_New_Product_1st_Year + piRecord.Specialty_Open_Enrollment_Meetings_Score__c + Specialty_Vendor_Feeds + Vision_Hard_ID_Cards +
                piRecord.Specialty_Customer_Meetings_Score__c + piRecord.Specialty_Communications_Score__c + piRecord.Specialty_Standard_Reports_Score__c + piRecord.Specialty_SPD_s_COC_s_Score__c +
                piRecord.Eligibility_Financial_Protection_Score__c + piRecord.Specialty_Claim_Research_Score__c;   //Added by Vignesh -- Capacity Model 2025s
            Decimal factor = Decimal.valueOf(Label.X48_Factor);
            piRecord.Specialty_Add_Ons_Score__c = addOns_Sum * factor;
            piRecord.Total_Specialty_Sets_Score__c = piRecord.ASO_Specialty_Sets_Score__c + piRecord.FI_Specialty_Sets_Score__c;

            piRecord.Specialty_Complexity_Score_2__c = piRecord.Specialty_Add_Ons_Score__c + piRecord.Specialty_Custom_Reporting_Score__c + piRecord.Specialty_Membership_Make_up_Score__c +
                piRecord.Specialty_Internal_Customer_Layers_Score__c + piRecord.Specialty_External_Customer_Layers_Score__c + piRecord.Total_Specialty_Sets_Score__c  + piRecord.Specialty_PVRC_Score__c;             
        }
    }
    
    //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//
    
    public static void termAmtMembers(list<Policy_Information__c> policyInfoNewMap){
        
        list<account> accList =new list<account>();
        list<Service_amt__c> serviceAmtList =new list<Service_amt__c>();
        set<id> accIdlist =new set<id>();
        map<id,list<policy_information__c>> policyMap =new map<id,list<policy_information__c>>();
        map<id,list<policy_information__c>> policyMultiMap =new map<id,list<policy_information__c>>();
        list<Policy_Information__c> policyListInactive =new list<Policy_Information__c>();
        
        for(Policy_Information__c p:policyInfoNewMap){
            if(p.Policy_Status__c=='Inactive'){
                accIdlist.add(p.Company__c);
                policyListInactive.add(p);
            }
        }
        serviceAmtList = [select Id,name,Case_Management_End_Date__c,Policy_Information_MultiChecKlist__c,Company__c from service_amt__c where Company__c in:accIdlist and (Case_Management_End_Date__c=null or Case_Management_End_Date__c>=today)];
        
        
        accList=[select id, name,(select id,name,Policy_Status__c,Policy_End_Date__c,LastModifiedDate,Policy_Type__c,company__c from policy_information__r) from account where id in:accIdlist];
        for(account acc:accList){
            if(acc.policy_information__r.size()==1){
                if(acc.policy_information__r[0].Policy_Status__c=='Inactive')
                    policyMap.put(acc.Id, acc.policy_information__r);
            }
            else if(acc.policy_information__r.size()>1){
                policyMultiMap.put(acc.Id, acc.policy_information__r);
            }
        }
        
        for(service_amt__c sm:serviceAmtList){
            if(policyMap.get(sm.company__c)!=null){
                if(sm.Policy_Information_MultiChecKlist__c!=null){
                    if(sm.Policy_Information_MultiChecKlist__c==policyMap.get(sm.company__c)[0].Name){
                        if(policyMap.get(sm.company__c)[0].Policy_End_Date__c!=null)
                            sm.Case_Management_End_Date__c =policyMap.get(sm.company__c)[0].Policy_End_Date__c;
                        else
                            sm.Case_Management_End_Date__c =Date.today();
                    }
                }
            }else if(policyMultiMap.get(sm.company__c)!=null){
                boolean isExist =false;
                string c='';
                Date policyEndDate= date.today();
                Datetime modDate =date.today();
                boolean isSingle=false;
                for(policy_information__c p:policyMultiMap.get(sm.company__c)){
                    if(p.Policy_Status__c=='Inactive' && !isSingle){
                        
                        if(sm.Policy_Information_MultiChecKlist__c!=null){
                            if(p.Name==sm.Policy_Information_MultiChecKlist__c){
                                if(p.Policy_End_Date__c!=null){
                                    sm.Case_Management_End_Date__c =p.Policy_End_Date__c;
                                }else{
                                    sm.Case_Management_End_Date__c =date.newinstance(p.LastModifiedDate.year(), p.LastModifiedDate.month(), p.LastModifiedDate.day());
                                }
                                isSingle=true;
                            }else{
                                //isSingle=false;
                            }
                        }
                        if(!isSingle){
                            if(modDate<p.LastModifiedDate){
                                policyEndDate=p.Policy_End_Date__c;
                                modDate=p.LastModifiedDate;
                            }
                            if(c==''){
                                c=p.Name;
                                if(p.Policy_End_Date__c!=null){
                                    policyEndDate=p.Policy_End_Date__c;
                                }
                                modDate=p.LastModifiedDate;
                            }else{
                                c=c+';'+p.Name;
                            }
                        }                 
                    }
                }
                
                if(sm.Policy_Information_MultiChecKlist__c!=null){
                    for(String policy: sm.Policy_Information_MultiChecKlist__c.split(';')){
                        isExist=false;
                        for(String inC:c.split(';')){
                            if(inC==policy){
                                isExist =true;
                            }
                        }
                        if(!isExist){
                            break;
                        }
                    }
                }
                if(isExist && !isSingle){
                    if(policyEndDate!=null){
                        sm.Case_Management_End_Date__c =policyEndDate;
                    }else{
                        sm.Case_Management_End_Date__c =date.newinstance(modDate.year(), modDate.month(), modDate.day());
                    }
                }
                
            }
        }
        update serviceAmtList;
    }
    
    //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//
    private static Map<String, Map<String,Decimal>> getSbcPicklistWeightage(){
        Map<String, Map<String,Decimal>> fieldsVsPicklists = new Map<String, Map<String,Decimal>>();
        for(Capacity_plan_SBC_picklist_weightage__mdt obj : [SELECT Id, Field__c,Label__c,Value__c,Weightage__c FROM Capacity_plan_SBC_picklist_weightage__mdt LIMIT 1000]){
            if(fieldsVsPicklists.get(obj.Field__c) == null){
                fieldsVsPicklists.put(obj.Field__c, new Map<String,Decimal>());
            }
            fieldsVsPicklists.get(obj.Field__c).put(obj.Label__c, obj.Weightage__c * obj.Value__c);
        }
        
        return fieldsVsPicklists;
    }
    
    Public static void meritPopulatedParameters(List<Policy_Information__c> policyInfoNewList){
        Set<Id> accIdSet = new Set<Id>();
        for(Policy_Information__c piRecord: policyInfoNewList){
            accIdSet.add(piRecord.Company__c);
        }
        Map<Id,Account> accMap = new Map<Id,Account>([SELECT Id, UHC_APP_Members__c, UHC_CI_Members__c, UHC_STD_Members__c,UHC_LTD_Members__c,UHC_Dental_Members__c,Pet_Insurance_FIGO_Members__c,UHC_HI_Members__c,UHC_Life_Members__c,UHC_Vision_Members__c FROM Account WHERE Id =: accIdSet]);
        
        for(Policy_Information__c piRecord: policyInfoNewList){
            Account acc = accMap.get(piRecord.Company__c);
            if(acc!=null){
                piRecord.Accident__c = acc.UHC_APP_Members__c > 0 ? '1 - Yes' : '0 - No';
                piRecord.Critical_Illness__c = acc.UHC_CI_Members__c > 0 ? '1 - Yes' : '0 - No';
                piRecord.Dental__c = acc.UHC_Dental_Members__c > 0 ? '1 - Yes' : '0 - No';
                piRecord.FIGO__c = acc.Pet_Insurance_FIGO_Members__c > 0 ? '1 - Yes' : '0 - No';
                piRecord.HIPP__c = acc.UHC_HI_Members__c > 0 ? '1 - Yes' : '0 - No';
                piRecord.Life__c = acc.UHC_HI_Members__c > 0 ? '1' : '0';
                piRecord.Vision__c = acc.UHC_Vision_Members__c > 0 ? '1 - Yes' : '0 - No';
                
                system.debug('acc.UHC_STD_Members__c = '+acc.UHC_STD_Members__c+'acc.UHC_LTD_Members__c = '+acc.UHC_LTD_Members__c);
                if((acc.UHC_STD_Members__c != null && acc.UHC_STD_Members__c > 0) || ( acc.UHC_LTD_Members__c != null && acc.UHC_LTD_Members__c > 0)){                    system.debug('inside > 0');
                    piRecord.Disability_Insurance__c = '1 - Yes';
                    system.debug('piRecord.Disability_Insurance__c = '+piRecord.Disability_Insurance__c);
                }
                else{
                    system.debug('inside else');
                    piRecord.Disability_Insurance__c =  '0 - No';
                }
            }
        }
    }
    //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//
    
    
    //--------------------------------------------------------------------- Ashutosh ---------------------------------------------------------------------//
    private static Map<String, Map<String,Decimal>> getPicklistWeightage(){
        Map<String, Map<String,Decimal>> fieldsVsPicklists = new Map<String, Map<String,Decimal>>();
        for(Policy_Picklist_Weightage__mdt obj : [SELECT Id, Field_Name__c, Picklist_Value__c, Weightage__c FROM Policy_Picklist_Weightage__mdt LIMIT 1000]){
            if(fieldsVsPicklists.get(obj.Field_Name__c) == null){
                fieldsVsPicklists.put(obj.Field_Name__c, new Map<String,Decimal>());
            }
            fieldsVsPicklists.get(obj.Field_Name__c).put(obj.Picklist_Value__c, obj.Weightage__c);
        }
        
        return fieldsVsPicklists;
    }
    
    
    private static Map<String, List<Capacity_Plan_Common_Metadata__mdt>> generateRangeMap(){
        
        Map<String, List<Capacity_Plan_Common_Metadata__mdt>> fieldVsRanges = new Map<String, List<Capacity_Plan_Common_Metadata__mdt>>();
        
        for(Capacity_Plan_Common_Metadata__mdt objRangeMdt : [SELECT End_Range__c, Start_Range__c, Weightage__c, Field_Name__c 
                                                              FROM Capacity_Plan_Common_Metadata__mdt LIMIT 1000])
        {
            if(fieldVsRanges.get(objRangeMdt.Field_Name__c) == null){
                fieldVsRanges.put(objRangeMdt.Field_Name__c, new List<Capacity_Plan_Common_Metadata__mdt>());
            }
            fieldVsRanges.get(objRangeMdt.Field_Name__c).add(objRangeMdt);
        }
        //system.debug('fieldVsRanges 2 -----> '+fieldVsRanges);
        return fieldVsRanges;
    }
    
    private static Decimal getWeightageFromRange(String fieldName, Decimal value){
        Decimal weightage = 0;
        if(value != null && value != 0){
            for(Capacity_Plan_Common_Metadata__mdt mdtRecord : fieldVsRanges.get(fieldName)){
                if((value >= mdtRecord.Start_Range__c && value <= mdtRecord.End_Range__c ) ||
                   (value >= mdtRecord.Start_Range__c && mdtRecord.End_Range__c == null) 
                  ){
                      weightage = mdtRecord.Weightage__c;
                  }
            }
        }
        
        return weightage;
        
    }
    
    //--------------------------------------------------------------------- Ashutosh ---------------------------------------------------------------------//
    
}