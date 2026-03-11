/**
* Purpose     : Test class for DontAllowDuplicatePolicyNumbersTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
@isTest
public class DontAllowDuplicatePolicyNumbersTest {
    
    @isTest
    static void dontAllowDuplicatePolicies(){
        
            Boolean expectedExceptionThrown;
            
            list<Policy_Information__c> listOfpolicies = new list<Policy_Information__c>();
            Map<Id,Policy_Information__c> newMap = new Map<Id,Policy_Information__c>();
            Map<Id,Policy_Information__c> oldMap = new Map<Id,Policy_Information__c>();
            
            Account acc = new Account(Name = 'Test CD Account', 
                                      Subtype__c ='Prospect',
                                      RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId());
            insert acc;
            
            Policy_Information__c policy = new Policy_Information__c(Name = '720455', 
                                                                     Company__c = acc.Id, 
                                                                     Policy__c = 'Test',
                                                                     CSP_GSP_or_Extended_Networks__c = '0 that require ongoing activity after setup',
                                                                     Customer_Sponsored_Service_Center__c = '1',                                                                 
                                                                     Eligibility__c = '0',
                                                                     FSA_c__c = '0',
                                                                     Hospital_Systemss__c = '0',
                                                                     Life__c	= '0',
                                                                     Medicare_Plan__c = '0',
                                                                     ne_Business_Exchange_Transition_Factor__c = '0',
                                                                     UHG_Owned_Custom_Portal__c = '0',
                                                                     New_Product_1st_Year_1__c = 1,
                                                                     UMR_SBC__c = 5,
                                                                     Rental_Networks__c = 'Yes',
                                                                     Specialty_Open_Enrollment_Meetings__c = 5,		
																	 Custom_Reporting__c = '2 - Quarterly',
																	 Membership_Make_up__c = '0 - None',
																	 Internal_Customer_Layers__c = 2,
																	 External_Customer_Layers__c = 2,
	            													 Total_Specialty_Sets_Score__c = 5,
                                                                     Policy_Type__c = 'Medical',
																	 Specialty_Plan_Variation_Count__c = 6);
            insert policy;
            
            
            policy.Eligibility__c = '1';
        	system.debug('policy.policy = '+[select id ,Specialty_Open_Enrollment_Meetings_Score__c from Policy_Information__c where id=:policy.Id]);
            
            update policy;
            
            
            Policy_Information__c updatedPolicyInfo = new Policy_Information__c(Id=policy.Id, Name = '00886737', 
                                                                                Company__c = acc.Id,Policy__c = 'Test', 
                                                                                CSP_GSP_or_Extended_Networks__c = '0 that require ongoing activity after setup',
                                                                                Customer_Sponsored_Service_Center__c = '1',
                                                                                
                                                                                Eligibility__c = '0',
                                                                                FSA_c__c = '0',
                                                                                Hospital_Systemss__c = '0',
                                                                                Life__c	= '0',
                                                                                Medicare_Plan__c = '0',
                                                                                ne_Business_Exchange_Transition_Factor__c = '0',
                                                                                UHG_Owned_Custom_Portal__c = '0',
                                                                                New_Product_1st_Year_1__c = 1,
                                                                                UMR_SBC__c = 5,
                                                                                Rental_Networks__c = 'Yes',
                                                                                Specialty_Open_Enrollment_Meetings__c = 5,		
																	 			Custom_Reporting__c = '2 - Quarterly',
																	 			Membership_Make_up__c = '0 - None',
																	 			Internal_Customer_Layers__c = 2,
																	 			External_Customer_Layers__c = 2,
	            													 			Total_Specialty_Sets_Score__c = 5,
																	 			Specialty_Plan_Variation_Count__c = 6);
            update updatedPolicyInfo;
            
            
            
            Policy_Information__c policy1 = new Policy_Information__c(Name = '00886737', 
                                                                      Company__c = acc.Id,Policy__c = 'Test', 
                                                                      CSP_GSP_or_Extended_Networks__c = '0 that require ongoing activity after setup',
                                                                      Customer_Sponsored_Service_Center__c = '1',                                                                    
                                                                      Eligibility__c = '0',
                                                                      FSA_c__c = '0',
                                                                      Hospital_Systemss__c = '0',
                                                                      Life__c	= '0',
                                                                      Medicare_Plan__c = '0',
                                                                      ne_Business_Exchange_Transition_Factor__c = '0',
                                                                      UHG_Owned_Custom_Portal__c = '0',
                                                                      New_Product_1st_Year_1__c = 1,
                                                                      UMR_SBC__c = 5,
                                                                      Rental_Networks__c = 'Yes',
                                                                      Specialty_Open_Enrollment_Meetings__c = 5,		
																	  Custom_Reporting__c = '2 - Quarterly',
																	  Membership_Make_up__c = '0 - None',
																	  Internal_Customer_Layers__c = 2,
																	  External_Customer_Layers__c = 2,
	            													  Total_Specialty_Sets_Score__c = 5,
                                                                      Policy_Type__c = 'Medical',
																	  Specialty_Plan_Variation_Count__c = 6);
            insert policy1;  
            
            
            Policy_Information__c pupdate= [select id ,Salesforce_Volume__c,Add_ons_Sum_of_total_input__c from Policy_Information__c where id=:policy1.Id];
            pupdate.Add_ons_Sum_of_total_input__c=100;
            pupdate.Salesforce_Volume__c=100;
            update pupdate;
            Set<Id> policyIds = new Set<Id>();
        	policyIds.add(policy1.Id);
        	policyIds.add(policy.Id);
        	List<Policy_Information__c> policyList = [SELECT Id, IsDeleted, Name, Company__c, Additional_Transaction_Commentary__c, CASESAFEID__c, Data_Import_Version__c, 
                                                      ExternalUniqueID__c, Fund_Type__c, Is_Medical__c, Policy_Status__c, Policy_Type__c, Policy__c, Policy_Count__c, 
                                                      Company_UHC_CI_Members__c, Date_Moved_Off_Shore__c, Date_of_Off_Shore_Restriction_Update__c, 
                                                      Medica_Harvard_Pilgrim_Mercer_Health_Adv__c, Model__c, Off_Shore_Claim_Restriction__c, Off_Shore_Keying_Restriction__c, 
                                                      Off_Shore_Restriction_BAR_Approval__c, Off_Shore_Restriction_Reason__c, Transaction_Site_if_Offshore_Vendor_Na__c,
                                                      Accum_Files_50__c, Accum_Files_Range_Backend__c, Active_ASO_Benefit_Sets_Score__c, Active_FI_Benefit_Sets_Score__c, 
                                                      Add_ons_Column_V_through_Column_AX__c, Add_ons_Sum_of_total_input__c, Adj_Case_FTE__c, Adj_Case_FTE_for_Outliers__c, 
                                                      Adj_Case_FTE_for_outlierss__c, COBRA_Backend__c, COBRA__c, CSP_GSP_or_Extended_Networks_25__c, 
                                                      CSP_GSP_or_Extended_Networks__c, Capacity_Plan__c, Carve_In_Pharmacy_Backend__c, Carve_In_Pharmacy__c, Case_FTEs__c, 
                                                      Communication_Backend__c, Communication__c, Complexity_Score_Hours_to_Maintain__c, Critical_Illness__c, Customer_Layers__c, 
                                                      Customer_Sponsored_Service_Center_25__c, Customer_Sponsored_Service_Center__c, Customer_layers_Score_incl_consultants__c, 
                                                      Customer_layers_incl_consultants__c, DHP_Diabetes_Health_Plan__c, DentalBackend__c, Dental__c, Eligibility__c, Exchange_Factor__c, 
                                                      External_Audits_Range_Backend__c, External_Audits__c, Frozen_ASO_Plans__c, Frozen_ASO_Score__c, Frozen_FI_Plans__c, 
                                                      Frozen_FI_Score__c, Hospital_Systems__c, Hospital_Systemss__c, Incentives_Rewards_50__c, Incentives_Rewards_Range_Backend__c, 
                                                      Incentives_Rewards__c, Indi_Portion_of_Case_FTE_based__c, Indiv_Portion_of_Case_FTE_based__c, Indiv_Portion_of_case_FTE_based_on_AdjCF__c, 
                                                      Issue_updated_date__c, KA_to_NA_Transition_Date__c, KA_to_NA_transition_5__c, Life__c, Manual_Adj_Case_FTE_for_Outliers__c, Medicare_Plan__c, 
                                                      Multiple_Policy_Factor__c, Multiple_Policy_Type__c, NB_Exc_Date__c, New_Product_1st_Year_1__c, New_Product_1st_Year_Description__c,
                                                      Non_Eligibility_Vendor_Fee_Range_Backend__c, Non_Eligibility_Vendor_Feeds_15__c, Optum_Partnership_30__c, Optum_Partnership_Range_Backend__c, 
                                                      Outlier_Override_Value__c, Outlier_Reason__c, Outlier__c, Override_Adj_Case_FTE_for_Outliers__c, Plan_Variation_Score__c, Plan_Variation_count_PVC__c,
                                                      Reporting_Range__c, Reporting_Score__c, Reporting__c, SBC_Range_Backend__c, SBC__c, SPD_Range_Backend__c, SPD__c, Salesforce_Activity__c, 
                                                      Salesforce_Volume_Backend__c, Salesforce_Volume__c, Total_ASO_FI_Benefit_Sets_Score__c, Total_Active_ASO_Benefit_Sets_Count__c, 
                                                      Total_Active_Benefit_Set_Count_Weightage__c, Total_Active_FI_Benefit_Sets_Count__c, Total_FI_Benefit_Sets_Count_Weightage__c, Transition_DDate__c, 
                                                      Transition_Date__c, UHG_Owned_Custom_Portal__c, UIT_Volume__c, VisionBackend__c, Vision__c, Weightage__c, X3_or_4_Tier_Benefit_Backend__c,
                                                      Y3_or_4_Tier_Benefit_5__c, criticalIllnessBackend__c, ne_Business_Exchange_Transition_Factor__c, of_Active_ASO_Sets__c, of_Active_FI_Sets__c, 
                                                      of_Frozen_ASO_Sets__c, of_Frozen_FI_sets__c, of_Member_Meetings_10__c, of_Member_Meetings_Range_Backend__c, of_case__c, FSA_c__c, 
                                                      Company_private_exchange__c, SPD_Create_Review__c, Policy_Start_Date__c, Policy_End_Date__c, A4Me_Mini_Scorecard__c, Additional_Customer_Care_Commentary__c, 
                                                      Adjustment_Trending__c, Advocate_Model_Dedicated_or_Designated__c, Appeals__c, BAR_Approval_and_Target_Implementati__c, BAR_Description_of_Request__c, 
                                                      CES_Number__c, COB_Ingenix_Call_Opt_Out__c, Cal_Year_vs_Plan_Year__c, Call_Containment__c, Call_Data_Report__c, Customer_Care_Site__c,
                                                      Customer_Name_Prior__c, HAC_Service_Model__c, HCT_CAMS_etc__c, High_Dollar__c, IST_Alert__c, PG_Reporting__c, Not_NA__c, Peoplesoft_No__c, 
                                                      Finance__c, Service_Model_Enhanced_Service_Model_or__c, Surest__c, Concierge_Vendor_Manual__c, Transaction_Site_Domestic__c, Transactional_Internal_Model__c, 
                                                      UES__c, UW_Policy_Number__c, UW_Revenue_Policy__c, VDSA_Data_Exchange__c, clt_ops_primary_indicator__c, Company_UHC_Dental_Members__c, Company_UHC_Vision_Members__c,
                                                      UMR__c, Primary_Policy__c, CLP__c, Exec_Med__c, FIGO__c, FMLA__c, Flex_Work__c, HIPP__c, IsPolicyValidForSAcal2__c, Membership_Make_up__c, Other_Platforms__c, 
                                                      Specialty_New_Product_1st_Year__c, Specialty_Status__c, Specialty_Type_of_Customer__c, Specialty_Vendor_Feeds__c, Surest_Helath_Plan__c, Vision_Hard_ID_Cards__c, 
                                                      ASO_Specialty_Sets__c, External_Customer_Layers__c, FI_Specialty_Sets__c, Internal_Customer_Layers__c, Override_Specialty_Adj_Case_FTE_for_outl__c, Specialty_Add_Ons_Score__c,
                                                      Specialty_Complexity_Score_2__c, Specialty_New_Product_1st_Year_Descripti__c, Specialty_Open_Enrollment_Meetings__c, Specialty_Plan_Variation_Count__c, Total_Specialty_Sets_Score__c, 
                                                      ASO_Specialty_Sets_Score__c, FI_Specialty_Sets_Score__c, Specialty_Adj_Case_FTE__c, Specialty_Adj_Case_FTE_for_Outliers__c, Specialty_Custom_Reporting_Score__c, Specialty_External_Customer_Layers_Score__c,
                                                      Specialty_Internal_Customer_Layers_Score__c, Specialty_Membership_Make_up_Score__c, Specialty_Open_Enrollment_Meetings_Score__c, Specialty_PVRC_Score__c, Surest_Helath_Plan_Backend__c, 
                                                      of_Customer_Related_Meetings_Backend__c, IPM_Hours_Of_Complexity__c, Concierge_Vendor__c, Gated_Plans__c, Migration__c, Onsite_Clinics__c, Virtual_Visits_Telemedicine__c, Account_Structure__c,
                                                      Active_UMR_Plans__c, CMC_Adj_Case_FTE_for_Outliers__c, CMC_CASE_FTE__c, CMC_Override_Adj_Case_FTE_for_Outliers__c, Carved_Out_Vendor_Management__c, Complex_Customer_Specific_Projects__c, Complex_External_Audits__c, 
                                                      Complex_Reporting__c, Frozen_UMR_Plans__c, Merger_Acquisition_Divestiture__c, Network_Strategy_Development__c, New_Product_1_st_Year_External__c, Rental_Networks__c, Single_Sign_On__c, Technology_Custom_IT_Involvement__c, 
                                                      UMR_Adj_Case_FTE_for_Outliers__c, UMR_CASE_FTE__c, UMR_Incentives_Rewards__c, UMR_Override_Adj_Case_FTE_for_Outliers__c, UMR_SBC__c, UMR_SPD__c, UMR_Stop_Loss__c, Account_Structure_2__c, Active_UMR_Plans_2__c, CMC_ADJ_Case_FTE__c,
                                                      CMC_Complexity_Score__c, Carved_Out_Vendor_Management_2__c, Complex_Customer_Specific_Projects_2__c, Complex_External_Audits_2__c, Complex_Reporting_2__c, Frozen_UMR_Plans_2__c, Merger_Acquisition_Divestiture_2__c,
                                                      Network_Strategy_Development_2__c, New_Product_1st_Year_External_2__c, Rental_Networks_2__c, Single_Sign_on_2__c, Technology_Custom_IT_Involvement_2__c, UMR_ADJ_Case_FTE__c, UMR_Complexity_Score__c, 
                                                      UMR_Incentives_2__c, UMR_SBC_2__c, UMR_SPD_2__c, UMR_Stop_Loss_2__c, IS_UMR_or_SUREST__c, Cirrus_Number__c, Eligibility_Vendor_Name__c, of_Customer_Related_Meetings__c, CSP_GSP_or_Extended_Networks_2_Backend__c,
                                                      Concierge_Vendor_2__c, Financial_Products_2_Backend__c, Gated_plans_2_Backend__c, Hospital_Systems_2_Backend__c, Migration_2_Backend__c, New_Business_Exchange_Factor_2_Backend__c, UHG_Owned_Custom_Portal2_Backend__c, 
                                                      Virtual_Visits_Telemedicine_2_Backend__c, onsite_clinics_2_Backend__c, ASO_Funding__c, Accident__c, B2H__c, Custom_Reporting__c, DHMO_Dental__c, Disability_Insurance__c, Embedded_Status__c,Surest_Monthly_Reporting_Score__c,
                                                      SurestConcierge_Vendor_50_Score__c,KA_to_NA_Transition_5_Score__c, SurestNew_Product_1st_Year_1_Score__c, OBM_Score__c, Surest_SPD_Score__c, Surest_SBC_Score__c, Carve_in_Pharmacy_0_5_Score__c,
                                                      SurestCSP_GSP_Extended_Networks_25_Score__c,SurestIncentives_Rewards_50_Score__c,Specialty_Customer_Meetings_Score__c, Specialty_Communications_Score__c, Specialty_Standard_Reports_Score__c, Specialty_SPD_s_COC_s_Score__c,
                                                      Eligibility_Financial_Protection_Score__c, Specialty_Claim_Research_Score__c, Surest_Complexity_Score_Hrs_to_Maintain__c,Life_Score_Surest__c
                                                      FROM Policy_Information__c WHERE Id =: policyIds LIMIT 2];
        
        	policy = policyList[0];
        	updatedPolicyInfo = new Policy_Information__c(Id = policy.Id, Internal_Customer_Layers__c = 5 );
        	update updatedPolicyInfo;
        	policy1 = policyList[1];
        	
            newMap.put(policy.id,policy);
            oldMap.put(updatedPolicyInfo.id,updatedPolicyInfo);
            DontAllowDuplicatePolicyNumbersHelper.calculateAddOn(newMap,oldMap);
            
            newMap.put(policy.id,policy);
            oldMap.put(policy.id,policy);
            DontAllowDuplicatePolicyNumbersHelper.calculateAddOn(newMap,oldMap);
            
            DontAllowDuplicatePolicyNumbersHelper.complexityLoigicUpdateHandler(newMap,oldMap);
            
            policy.CSP_GSP_or_Extended_Networks__c = null;
            policy.Customer_Sponsored_Service_Center__c = null;
            policy.DHP_Diabetes_Health_Plan__c = null;
            policy.Eligibility__c = null;
            policy.FSA_c__c = null;
            policy.Hospital_Systemss__c = null;
            policy.Life__c	= null;
            policy.Medicare_Plan__c = null;
            policy.ne_Business_Exchange_Transition_Factor__c = null;
            policy.UHG_Owned_Custom_Portal__c = null;
            policy.New_Product_1st_Year_1__c = null;
            //policy.Add_ons_Sum_of_total_input__c = null;
            update policy;
            
            updatedPolicyInfo.CSP_GSP_or_Extended_Networks__c = null;
            updatedPolicyInfo.Customer_Sponsored_Service_Center__c = null;
            updatedPolicyInfo.DHP_Diabetes_Health_Plan__c = null;
            updatedPolicyInfo.Eligibility__c = null;
            updatedPolicyInfo.FSA_c__c = null;
            updatedPolicyInfo.Hospital_Systemss__c = null;
            updatedPolicyInfo.Life__c	= null;
            updatedPolicyInfo.Medicare_Plan__c = null;
            updatedPolicyInfo.ne_Business_Exchange_Transition_Factor__c = null;
            updatedPolicyInfo.UHG_Owned_Custom_Portal__c = null;
            updatedPolicyInfo.New_Product_1st_Year_1__c = null;
            //updatedPolicyInfo.Add_ons_Sum_of_total_input__c = null;
            update updatedPolicyInfo;
            
            newMap.put(policy.id,policy);
            oldMap.put(updatedPolicyInfo.id,updatedPolicyInfo);
            DontAllowDuplicatePolicyNumbersHelper.calculateAddOn(newMap,oldMap);
            
            newMap.put(policy.id,policy);
            oldMap.put(policy.id,policy);
            DontAllowDuplicatePolicyNumbersHelper.calculateAddOn(newMap,oldMap);
            
            DontAllowDuplicatePolicyNumbersHelper.complexityLoigicUpdateHandler(newMap,oldMap);
        	
        	System.assertEquals(1, [SELECT count() FROM Account WHERE Name = 'Test CD Account' ]);
    }
}