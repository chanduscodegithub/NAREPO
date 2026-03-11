/*********************************************************************** 
Name: workItemsController 
Copyright © 2020 CRMIT Solutions Company Inc.  
======================================================  
======================================================  
Purpose: 
=======================================================================================================================
=======================================================================================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Mohan Sai Puttagunta 	03/17/2020  		INITIAL DEVELOPMENT   		  
2.0 -
***********************************************************************************************************************
*/

public without sharing class SoldChecklistHandler {
    
    //public static final String OPT_OUT_TXT = 'Opt Out';
    @AuraEnabled(cacheable=true)
    public static oppwrapperclass getClientData(string recId){
        oppwrapperclass oppwrapper = new oppwrapperclass();
        
        if(recId != null){
            List<OpportunityLineItem> OtherOpplineitemlist = new List<OpportunityLineItem>();
            Boolean hasEditAccess = false;
            Boolean readOnlyUser = false;
            Boolean medicalEditAccess = false;
            Boolean pharmacyEditAccess = false;
            Boolean dentalEditAccess = false;
            Boolean visionEditAccess = false;
            Boolean otherProductsEditAccess = false;
            Boolean isSCCEditable =false;
            Id cmRT = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CM Membership Activity (Existing Client)').getRecordTypeId();
            Opportunity OppDatarec = [SELECT Id,BusinessType__c, Disposition_Dental__c, Disposition_Medical__c, Disposition_Pharmacy__c, Disposition_Vision__c, Name, Owner.Name,
                                      Anticipated_Actual_Close_Date_Medical__c, Proactive_Renewal_Underwriter__c, SCE_Assignment__c, Incumbent_Primary_Medical__r.Name,
                                      Account.Name,Account.BillingCountry, Account.BillingAddress, Account.BillingPostalCode, Account.BillingState,
                                      Account.BillingCity, Account.BillingStreet, Classification_NB_NBEA_Xfer__c, Account.Primary_Situs_State__c,
                                      EffectiveDate__c, Net_Results__c, Type_of_Funding_Specialty__c, Type_of_Funding_Medical__c, Funding_Type_Dental__c, Funding_Type_Vision__c,
                                      Account.Claim_Site__c, Account.Call_Site__c, Account.Clinical_Site__c,Trust_Involved__c,PPO_Network_Access_and_Discounts__c, Extended_Network_Access__c,
                                      Customer_Sponsored_CSP_Network__c, Group_Specific_Provider_GSP_Network__c,Passport_Connect_with_Harvard_Pilgrim__c, HP_Sold_Retained_Employees_Only__c,
                                      HP_Sold_Retained_Members__c, Physical_Health_Solutions__c, Disabled_Child_Coverage__c,Hospital_Bill_Audit_Program__c, Account.Current_Deal_Next_Renewal_Date__c,
                                      Pre_Implementation_Audit__c, Expanded_Online_Customer_Reporting__c, Sold_Retained_Members__c, Tiered_Benefits__c, Sold_Retained_Employees_Only__c,
                                      Claim_Fiduciary__c,Rx_Coalition__c,Core_Rx_Vendor__c,Stop_Loss__c,Credits_and_Allowances__c,Performance_Guarantees__c, IPM__c, IPM__r.Name, Status__c,
                                      Sales_Stage_Medical__c, Sales_Stage_Dental__c, Sales_Stage_Vision__c, Sales_Stage_Pharmacy__c, Sales_Stage_Other__c, Last_email_sent_by_sales__c,
                                      Last_email_sent_by_IPM__c, Completed_by_Sales__c, Completed_by_IPM__c, Specialty_Benefits_SVP__c, Offshore_Provisions__c,Bridge2Health_opt_out__c,
                                      Bridge2Health_Vision__c, Account.Call_Site_Type__c,Account.Claim_Site_Type__c,Account.Clinical_Site_Type__c, Incumbent_Primary_Pharmacy__c, Incumbent_Primary_Dental__c,
                                      Incumbent_Primary_Vision__c, Incumbent_Primary_Pharmacy__r.Name, Incumbent_Primary_Dental__r.Name, Incumbent_Primary_Vision__r.Name,
                                      Account.TopMarket1__c, Account.TopMarket1Records__c, Account.TopMarket2__c, Account.TopMarket2Records__c, Account.TopMarket3__c, Account.TopMarket3Records__c,
                                      Account.TopMarket4__c, Account.TopMarket4Records__c, Account.TopMarket5__c, Account.TopMarket5Records__c, Account.UMR_Client_Platform__c, Account.CVGAccount__r.Name 
                                      FROM Opportunity 
                                      WHERE Id=: string.escapesinglequotes(recId) WITH USER_MODE]; 
            
            
            
            Account accrecvalue = [ SELECT Id, Name, Claim_Site__c, Call_Site__c, Clinical_Site__c, Current_Deal_Next_Renewal_Date__c,
                                   Primary_Situs_State__c, Call_Site_Type__c, Claim_Site_Type__c, Clinical_Site_Type__c,
                                   TopMarket1__c, TopMarket1Records__c, TopMarket2__c, TopMarket2Records__c, TopMarket3__c,
                                   TopMarket3Records__c, TopMarket4__c, TopMarket4Records__c, TopMarket5__c,TopMarket5Records__c,
                                   UMR_Client_Platform__c, CVGAccount__r.Name 
                                   FROM Account 
                                   WHERE Id =: OppDatarec.AccountId WITH USER_MODE];
            
            List<OpportunityLineItem> OpplineItemList = new List<OpportunityLineItem>();
            oppwrapper.Net_Results_Not_Zero =false;
            oppwrapper.showCPWSection = false;
            oppwrapper.isSurestProductMed = false;
            oppwrapper.isTraditionalProductMed = false;
            oppwrapper.isSurestProductPharmacy = false;
            oppwrapper.isTraditionalProductPharmacy = false;
            
            //------------------------------------SAMARTH------------------------------------
            
            Sold_Case_Checklist__c scc = [Select id,Name,Primary_HR_Implementation_Contact__c,Rx_SVP__c,Optum_Financial_SVP__c,Optum_Solution_Sales_Exec__c,
                                          Dental_Underwriter__c,Vision_Underwriter__c,OptumRx_Underwriter__c,CI_Accident_Underwriter__c,Eligibility_Vendor__c,
                                          If_Rx_is_not_sold_add_Rx_Vendor__c,Niche_Vendors_to_Integrate__c,Historic_Data__c,Leased_Network__c,Medical_Performance_Guarantee__c,
                                          Other_Custom_Guarantee__c,Discount_Guarantee__c,Claim_Trend_Guarantee__c,Total_Cost_of_Care_Guarantee__c,Clinical_Performance_Guarantee__c,
                                          Pharmacy_Performance_Guarantee__c,Dental_Performance_Guarantees__c,Dental_Ntwk_Recruitment_Guarantees__c,
                                          Dental_In_Network_Utilization_Guarantee__c,Vision_Performance_Guarantees__c,Vision_Ntwk_Recruitment_Guarantees__c,
                                          Vision_In_Network_Utilization_Guarantee__c,Acc_Ci_Hi_Guarantee__c,Life_Guarantee__c,STD_Guarantee__c,LTD_Guarantee__c,
                                          FMLA_Guarantee__c,Dental_Guarantee__c,Vision_Guarantee__c,Communications_Year_1__c,Communications_Year_2__c,Communications_Year_3__c,
                                          Implementation_Year_1__c,Transition_Year_1__c,Dental_Implementation_Year_1__c,
                                          Dental_Cross_Sell_Year_1__c,Dental_Cross_Sell_Year_2__c,Dental_Cross_Sell_Year_3__c,Vision_Implementation_Year_1__c,
                                          Vision_Cross_Sell_Year_1__c,Vision_Cross_Sell_Year_2__c,Vision_Cross_Sell_Year_3__c,Acc_Ci_HI_Implementation_Year_1__c,Acc_CI_Hi_Cross_Sell_Year_1__c,
                                          Acc_CI_Hi_Cross_Sell_Year_2__c,Acc_CI_Hi_Cross_Sell_Year_3__c,Acc_Ci_Hi_Tech_Year_1__c,Acc_Ci_Hi_Tech_Year_2__c,Acc_Ci_Hi_Tech_Year_3__c,
                                          Life_DI_Implementation_Year_1__c,Life_Di_Cross_Sell_Year_1__c,Life_Di_Cross_Sell_Year_2__c,Life_Di_Cross_Sell_Year_3__c,
                                          Other_Custom_Credit_Year_1__c,Other_Custom_Credit_Year_2__c,Other_Custom_Credit_Year_3__c,Specialty_Savings_Credits_Year_1__c,
                                          Specialty_Savings_Credits_Year_2__c,Specialty_Savings_Credits_Year_3__c,Specialty_Implementation_Year_1__c,
                                          Specialty_Technology_Credits_Year_1__c,Specialty_Technology_Credits_Year_2__c,Specialty_Technology_Credits_Year_3__c,Additional_Sold_Case_Checklist_Details__c,
                                          Historic_Data_Medical_or_Rx__c,Pre_Implementation_Audit__c,Expanded_Online_Customer_Reporting_Sys__c,Offshore_Provisions__c,Stop_Loss__c,
                                          Rx_Coalition__c,Claim_Fiduciary__c,CAA_IDR_Service_Fees__c,Disabled_Dependent_Verification__c,Pre_Implementation_Audit_Level_2__c,Claim_Fiduciary_Other__c,
                                          Rx_Coalition_Other__c,Offshore_Provisions_Level_0__c,Offshore_Provisions_Level_7__c,CAA_Service_Fees_Write_In__c,CAA_EMT_Approval__c,IPM__c,IPM__r.Name,SCE__c,Medical_Underwriter__c,
                                          Sold_Retained_Employees_Only__c,Trust_Involved__c,PPO_Network_Access_and_Discounts__c,Type_of_Funding_Medical__c,
                                          Customer_Sponsored_CSP_Network__c,Group_Specific_Provider_GSP_Network__c,Passport_Connect_with_Harvard_Pilgrim__c,HP_Sold_Retained_Members__c,Other_Custom_Guarantee_Medical__c,STD_Guarantee_B2H__c,
                                          Standard_Communications__c,Rally_Base__c,A4Me_Core__c,eServices_Select__c,Virtual_Visits__c,Genetic_Testing_Prior_Authorization__c,
                                          Inflammatory_Medication_Site_of_Care__c,Functional_Endoscopic_Sinus_Surgery_FESS__c,Hysterectomy__c,Sinuplasty__c,
                                          Payment_Integrity__c,Payment_Policy_Prospective_Payment_Revi__c,Coordination_of_Benefits__c,Prospective_Fraud_Abuse__c,Retrospective_Fraud_Abuse__c,
                                          Enhanced_Fraud_Abuse_CCD__c,Itemized_Bill_Review__c,Focused_Claim_Review__c,Hospital_Bill_Audit_Optum__c,Hospital_Bill_Audit_Vendor__c,Credit_Balance_Recovery_Services__c,Hospital_Bill_Audit__c,
                                          Third_Party_Liability_Recovery_Subro__c,Third_Party_Liability_Recovery_ICC__c,Annual_Allowance_Year1__c,Annual_Allowance_Year2__c,
                                          Annual_Allowance_Year3__c,Annual_Audit_Year1__c,Annual_Audit_Year2__c,Annual_Audit_Year3__c,
                                          Physical_Health_Solutions_Network_Only__c,Extended_Network_Access__c,Extended_Network_Access_Level2__c,Able_To__c,Tiered_Benefits_Excluding_Nexus__c,
                                          Credits_and_Allowances_Other_Year_1__c, Credits_and_Allowances_Other_Year_2__c, Credits_and_Allowances_Other_Year_3__c,
                                          Advanced_Analytics_and_Recovery__c, COB_Vendor_Recoveries__c, Hospital_Audit_Program__c, Claims_Tracking_and_Validation_Audit__c, 
                                          Third_Party_Liability_Subrogation__c, Injury_Coverage_Coordination__c,Rx_rebates_under_medical__c,
                                          Payment_Policy_Percentage__c,Coordination_of_Benefits_Percentage__c,Prospective_Fraud_Abuse_Percentage__c,Retrospective_Fraud_Abuse_Percentage__c,
                                          Enhanced_Fraud_Abuse_CCD_Percentage__c,Itemized_Bill_Review_Percentage__c,Focused_Claim_Review_Percentage__c,Hospital_Bill_Audit_Optum_Percentage__c,Hospital_Bill_Audit_Percentage__c,
                                          Hospital_Bill_Audit_Vendor_Percentage__c,Credit_Blnce_Recvry_Services_Percentage__c,Third_Party_Liability_Subro_Percentage__c,Third_Party_ICC_Percentage__c,
                                          Advanced_Analytics_and_Recvry_Percentage__c,COB_Vendor_Recoveries_Percentage__c,Hospital_Audit_Program_Percentage__c,Claim_Trcking_Validation_Audt_Percentage__c,
                                          Thrd_Prty_Liability_Subrgatin_Percentage__c,Injury_Coverage_Coordination_Percentage__c, Do_non_pref_New_Business_Rates_apply__c,Eligibility_Vendor_2__c,
                                          Eligibility_Vendor_3__c, Eligibility_Vendor_4__c, Eligibility_Vendor_5__c, External_Vendors_to_Integrate_2__c, External_Vendors_to_Integrate_3__c,
                                          External_Vendors_to_Integrate_4__c, External_Vendors_to_Integrate_5__c, External_Vendors_to_Integrate_6__c, External_Vendors_to_Integrate_7__c,
                                          External_Vendors_to_Integrate_8__c, External_Vendors_to_Integrate_9__c, External_Vendors_to_Integrate_10__c, Other_Custom_Medical_Guarantee_2__c, Other_Custom_Medical_Guarantee_3__c,
                                          Other_Custom_Medical_Guarantee_4__c, Other_Custom_Medical_Guarantee_5__c, Other_Specialty_Custom_Guarantee_2__c, Other_Specialty_Custom_Guarantee_3__c,
                                          Other_Specialty_Custom_Guarantee_4__c, Other_Specialty_Custom_Guarantee_5__c, HP_Alliance__c, Preferred_HP__c, Will_Consultant_Participate_in_Impln__c,
                                          Are_SSO_Technology_required__c, Pre_Implementation_Audit_Write_In__c, Third_Party_Stop_Loss_Reporting_Write_In__c, UHC_Virtual_Visits_Write_In__c,
                                          Medical_Necessity__c, Claims_Tracking__c, Claims_Tracking_Percentage__c, Validation_Audit__c, Validation_Audit_Percentage__c,
                                          Other_Custom_Guarantee_Write_In__c, Other_Custom_Guarantee_Write_In_2__c, Other_Custom_Guarantee_Write_In_3__c, Other_Custom_Guarantee_Write_In_4__c, Other_Custom_Guarantee_Write_In_5__c,
                                          Othr_Spclty_Custm_Guarantee_Write_In__c, Othr_Spclty_Custm_Guarantee_Write_In_2__c, Othr_Spclty_Custm_Guarantee_Write_In_3__c, Othr_Spclty_Custm_Guarantee_Write_In_4__c, Othr_Spclty_Custm_Guarantee_Write_In_5__c,
                                          Credits_and_Allowances_Other_Write_In__c,Credits_and_Allowances_Other_Write_In_2__c,Credits_and_Allowances_Other_Write_In_3__c,Credits_and_Allowances_Other_Write_In_4__c,Credits_and_Allowances_Other_Write_In_5__c,
                                          Credits_and_Allowances_Other_Year_1_2__c,Credits_and_Allowances_Other_Year_1_3__c,Credits_and_Allowances_Other_Year_1_4__c,Credits_and_Allowances_Other_Year_1_5__c,Credits_and_Allowances_Other_Year_2_2__c,
                                          Credits_and_Allowances_Other_Year_2_3__c,Credits_and_Allowances_Other_Year_2_4__c,Credits_and_Allowances_Other_Year_2_5__c,Credits_and_Allowances_Other_Year_3_2__c,Credits_and_Allowances_Other_Year_3_3__c,
                                          Credits_and_Allowances_Other_Year_3_4__c,Credits_and_Allowances_Other_Year_3_5__c,Other_Custom_Credit_Year_1_2__c,Other_Custom_Credit_Year_1_3__c,Other_Custom_Credit_Year_1_4__c,Other_Custom_Credit_Year_1_5__c,
                                          Other_Custom_Credit_Year_2_2__c,Other_Custom_Credit_Year_2_3__c,Other_Custom_Credit_Year_2_4__c,Other_Custom_Credit_Year_2_5__c,Other_Custom_Credit_Year_3_2__c,Other_Custom_Credit_Year_3_3__c,Other_Custom_Credit_Year_3_4__c,
                                          Other_Custom_Credit_Year_3_5__c,Other_Custom_Credit_Write_In__c,Other_Custom_Credit_Write_In_2__c,Other_Custom_Credit_Write_In_3__c,Other_Custom_Credit_Write_In_4__c,Other_Custom_Credit_Write_In_5__c, Legal_Client_Name__c,
                                          EIN__c, First_Renewal_Date__c,Surest_Medical_Performance_Guarantee__c,Surest_Claim_Trend_Guarantee__c,Surest_Clinical_Performance_Guarantee__c,Surest_Total_Cost_of_Care_Guarantee__c,Surest_Discount_Guarantee__c,
                                          Surest_Other_Custom_Guarantee_1__c,Surest_Other_Custom_Guarantee_2__c,Surest_Other_Custom_Guarantee_3__c,Surest_Other_Custom_Guarantee_4__c,Surest_Other_Custom_Guarantee_5__c,Surest_Other_Custom_Guarantee_Write_In_1__c,
                                          Surest_Other_Custom_Guarantee_Write_In_2__c,Surest_Other_Custom_Guarantee_Write_In_3__c,Surest_Other_Custom_Guarantee_Write_In_4__c,Surest_Other_Custom_Guarantee_Write_In_5__c,Surest_Communications_Wellness_Year_1__c,
                                          Surest_Communications_Wellness_Year_2__c,Surest_Communications_Wellness_Year_3__c,Surest_Credits_n_Allowance_OtherWriteIn2__c,Surest_Credits_n_Allowance_OtherWriteIn3__c,Surest_Credits_n_Allowance_OtherWriteIn4__c,
                                          Surest_Credits_n_Allowance_OtherWriteIn5__c,Surest_Credits_n_Allowances_OtherWriteIn__c,Surest_Credits_n_Allowances_OtherYear1__c,Surest_Credits_n_Allowances_OtherYear1_2__c,Surest_Credits_n_Allowances_OtherYear1_3__c,
                                          Surest_Credits_n_Allowances_OtherYear1_4__c,Surest_Credits_n_Allowances_OtherYear1_5__c,Surest_Credits_n_Allowances_OtherYear2__c,Surest_Credits_n_Allowances_OtherYear2_2__c,Surest_Credits_n_Allowances_OtherYear2_3__c,
                                          Surest_Credits_n_Allowances_OtherYear2_4__c,Surest_Credits_n_Allowances_OtherYear2_5__c,Surest_Credits_n_Allowances_OtherYear3__c,Surest_Credits_n_Allowances_OtherYear3_2__c,Surest_Credits_n_Allowances_OtherYear3_3__c,
                                          Surest_Credits_n_Allowances_OtherYear3_4__c,Surest_Credits_n_Allowances_OtherYear3_5__c,Surest_Annual_Allowance_Year1__c,Surest_Annual_Allowance_Year2__c,Surest_Annual_Allowance_Year3__c,Surest_Annual_Audit_Year1__c,
                                          Surest_Annual_Audit_Year2__c,Surest_Annual_Audit_Year3__c,Surest_Pharmacy_Performance_Guarantee__c,Surest_Payment_Integrity__c,
                                          Surest_Pre_Implementation_Audit_Year_1__c,Surest_Transition_Year_1__c,Surest_Disabled_Dependent_Verification__c,Surest_Pre_Implementation_Audit__c,Surest_Pre_Implementation_Audit_Level_2__c,
                                          Surest_Pre_Implementation_Audit_Write_In__c,Surest_Offshore_Provisions__c,Surest_Offshore_Provisions_Level_0__c,Surest_Offshore_Provisions_Level_7__c,Surest_Third_Party_Stop_Loss_Write_In__c,
                                          Surest_Third_Party_Stop_Loss_Reporting__c,Surest_CAA_IDR_Service_Fees__c,Surest_CAA_IDR_Service_Fees_Write_In__c,Surest_Do_non_pref_New_Business_Rates__c,Surest_Will_Consultant_Participate__c,Surest_Are_SSO_Technology_required__c,
                                          Surest_STD_Guarantee__c,Surest_Vision_Guarantee__c,Surest_Dental_Guarantee__c,Surest_Standard_Communications__c,Surest_Member_Services__c,Surest_Clinical__c,Optum_Transplant_Resource_Services__c,Surest_Supplemental_Compensation_Payee__c,Supplemental_Compensation_Payee__c,
                                          Pre_Pay__c,Pre_Pay_Percentage__c,Post_Pay__c,Post_Pay_Percentage__c,Subrogation__c,Subrogation_Percentage__c,EDC_Analyzer__c,EDC_Analyzer_Percentage__c,Surest_Pre_Pay__c,Surest_Pre_Pay_Percentage__c,Surest_Post_Pay__c,Surest_Post_Pay_Percentage__c,Surest_Subrogation__c,
                                          Surest_Subrogation_Percentage__c,Surest_Coordination_of_Benefits__c,Surest_Coordination_of_Benefit_Percent__c,Surest_CTV_Audit__c,Surest_CTV_Audit_Percentage__c,Surest_Fraud_Waste_and_Abuse_Mgmt_prgrm__c,Surest_Credit_Balance_Rcvry_Prgrm_Prcnt__c,Surest_Subrogation_Services_Percentage__c,Enhanced_Case_Management__c,
                                          Calm_Health_app__c,Case_Management__c,National_Network_Outpatient_Inpatient_UM__c,Behavioral_Health_Virtual_Visits__c,Substance_Use_Disorder_Helpline__c,Care_Explorer__c,Virtual_Behavioral_Coaching_for_adults__c,Child_and_Family_Behavioral_Coaching__c,Family_Support__c,X24_7_in_the_moment_and_crisis_support__c,Behavioral_Care_Connect_5_Day_Access__c,
                                          Employee_Assistance_Program_Name__c,Pharmacy_Benefit_Administrator_Name__c,Pharmacy_Benefit_Administrator_Phone__c,Employee_Assistance_Program_Phone__c,Transplant_Resource_Services__c,Utilization_Management__c,BHU_Management_ABA_UM__c,Specialty_Guidance_Program_CPSurest__c,Cancer_Guidance_Program_CPSurest__c,
                                          Surest_Case_Management_CM_CPSurest__c,Optum_Physical_Health_Network__c,Optum_Behavioral_Network__c,Ardynn_Surest_Cancer_Advocacy__c,Asthma_Disease_Management__c,Bariatric_Resource_Services__c,Calm_Health__c,Canary_Surest_Disease_Management__c,Cancer_Resource_Services__c,Cancer_Support_Program_CSP__c,
                                          Clinical_Prgm_2nd_MD__c,Comprehensive_Kidney_Solutions__c,COPD_Disease_Management__c,Coronary_Artery_Disease_Management__c,Diabetes_Disease_Management__c,Emotional_Wellbeing_Solutions__c,Family_Building_Dual_Clients_only__c,Fertility_Solutions__c,Fertility_Solutions_Plus_Dual_Clients__c,Heart_Failure_Disease_Management__c,
                                          Kaia_Optum__c,Level2_Assured_Value__c,Maternity_21_month_program__c,Maven_12_month_program__c,Menopause_Dual_Clients_Only_1K_EE_s__c,Neonatal_Resource_Services__c,One_Pass_Select__c,Optum_Engage__c,Pacify_Surest_Maternity__c,Parenting_Pediatrics__c,Pivot_Surest_Smoking_Cessation__c,Progyny_Surest_Fertility__c,Pump_Carry_Dual_Clients_only_1k_EE_s__c,
                                          Pump_Check_Dual_Clients_only_1k_EE_s__c,Pump_Post_Dual_Clients_only_1k_EE_s__c,Quit_for_Life_Dual_Clients_Only__c,Real_Appeal_Optum__c,UHC_Rewards__c,Virta_Diabetes__c,Virta_Obesity__c,Virta_Pre_Diabetes__c,Wallet_Dual_Clients_Only_1K_EE_s__c,Congenital_Heart_Disease__c,Wellness_Wellos_ASO__c,One_Pass_Subsidized__c,Kindbody__c,Sword__c,
                                          Optum_Engage_Elite__c,Optum_Engage_Select__c,UHC_Rewards_Custom__c,UHC_Rewards_Premium__c,Total_Weight_Support_with_Real_Appeal_Rx__c,Doula_Benefit_Support__c,Wellness_Rally_Engage_Buy_Up__c,Wellness_Rally_Premium_Buy_Up__c,CPW__c,UHC_Rewards_Client_Fulfilled_Survey__c,UHC_Rewards_Client_Fulfilled_Custom__c,Cap_Value__c,Amount__c,Additional_Comments__c,Amount_Type__c,Cap_Type__c,Cap_Category__c,
                                          UHC_Hub_Access_Hope_APO_EAR__c,UHC_Hub_Access_Hope_APO_Only__c,UHC_Hub_Carrum_Health_Cancer_Care__c,UHC_Hub_Carrum_Health_General__c,UHC_Hub_Carrum_Health_Surgical_Care__c,UHC_Hub_Teladoc_Hypertension_Mgmt_Plus__c,
                                        UHC_Hub_Carrum_Substance_Use_Treatment__c,UHC_Hub_Cylinder_GIThrive__c,UHC_Hub_Hazelden_Recovery_Coaching__c,UHC_Hub_Hazelden_Workplace_Portal__c,UHC_Hub_Hello_Heart__c,UHC_Hub_Hinge_Health_Virtual_PT__c,UHC_Hub_Lantern_Employer_Direct_Care__c,
                                        UHC_Hub_LGC_A1c_Fingerstick_Add_On__c,UHC_Hub_LGC_A1C_HomeKit_Buy_Up__c,UHC_Hub_LGC_A1C_Lab_Visit_Buy_Up__c,UHC_Hub_LGC_A1c_Venipuncture_Add_On__c,UHC_Hub_LGC_Body_Fat__c,UHC_Hub_LGC_Colon_Cancer_Screening_Plus__c,UHC_Hub_LGC_Colon_Cancer_Screening_Prog__c,UHC_Hub_LGC_Diabetes_A1c__c,
                                        UHC_Hub_LGC_FIT_At_Home_Kit__c,UHC_Hub_LGC_Flu_Shots__c,UHC_Hub_LGC_Health_Prvdr_Screen_Form__c,UHC_Hub_LGC_Heart_Health__c,UHC_Hub_LGC_HPSF_Prov_Med_PAAF__c,UHC_Hub_LGC_KYNS_Full_Lipid_Fingerstick__c,UHC_Hub_LGC_KYNS_Full_Lpd_Venipuncture__c,UHC_Hub_LGC_KYNS_Partl_Lpd_Fingerstick__c,
                                        UHC_Hub_LGC_Lab_Visit_Full_Lipid_Ven__c,UHC_Hub_LGC_Measure_Waist__c,UHC_Hub_LGC_Waist_Hip_Ratio__c,UHC_Hub_Noom_Dual_Access__c,UHC_Hub_Noom_Dual_Access_DPP__c,UHC_Hub_Noom_Mood__c,UHC_Hub_Noom_Weight__c,UHC_Hub_Noom_Weight_DPP__c,UHC_Hub_Quest_A1c_Fingerstick_Add_On__c,
                                        UHC_Hub_Quest_A1C_HomeKit_Buy_Up__c,UHC_Hub_Quest_A1C_Lab_Visit_Buy_Up__c,UHC_Hub_Quest_A1c_Venipuncture_Add_On__c,UHC_Hub_Quest_Bilingual_Translator__c,UHC_Hub_Quest_Body_Fat__c,UHC_Hub_Quest_Cotinine_Fingerstick_Add__c,
                                        UHC_Hub_Quest_Cotinine_HomeKit_Buy_Up__c,UHC_Hub_Quest_Cotinine_Lab_Visit_Full__c,UHC_Hub_Quest_Cotinine_Venipuncture_Ad__c,UHC_Hub_Quest_Diabetes_A1c_Home_Kit__c,UHC_Hub_Quest_eGFR_Fingerstick_AddOn__c,UHC_Hub_Quest_eGFR_HomeKit_Buy_Up__c,
                                        UHC_Hub_Quest_eGFR_Venipuncture_AddOn__c,UHC_Hub_Quest_eGFR_Visit_Add_On__c,UHC_Hub_Quest_Fax_to_Physician__c,UHC_Hub_Quest_Flu_Shots__c,UHC_Hub_Quest_Heart_Health_Home_Kit__c,UHC_Hub_Quest_Hlth_Prvdr_Screening_Form__c,UHC_Hub_Quest_HPSF_Prov_Med_PA__c,
                                        UHC_Hub_Quest_KYN_Plus_Fingerstick__c,UHC_Hub_Quest_KYNS_Comprehensive__c,UHC_Hub_Quest_KYNS_Full_Lipid_Venipctr__c,UHC_Hub_Quest_KYNS_Full_Lpd_Fingerstick__c,UHC_Hub_Quest_KYNS_Partial_Lpd_Fingerst__c,UHC_Hub_Quest_Lab_Visit_Comp_Veni__c,
                                        UHC_Hub_Quest_Lab_Visit_Full_Lipid_Veni__c,UHC_Hub_Quest_Measure_Waist__c,UHC_Hub_Quest_Privacy_Screens__c,UHC_Hub_Quest_PSA_Fingerstick_Add_On__c,UHC_Hub_Quest_Waist_Hip_Ratio__c,UHC_Hub_Teladoc_Advanced_Weight_Mgmt__c,UHC_Hub_Teladoc_Chronic_Mgmt_Plus_Bundl__c,
                                        UHC_Hub_Teladoc_Diabetes_Mgmt_Plus_Bund__c,UHC_Hub_Teladoc_Diabetes_Mgmt_Standalon__c,UHC_Hub_Teladoc_Hypertension_Mgmt_Stand__c,UHC_Hub_Teladoc_Prediabetes_Mgmt_Plus__c,UHC_Hub_Weight_Watchers__c,UHC_Hub_Wellthy__c,UHC_Hub_Wondr_Health__c 
                                          from Sold_Case_Checklist__c where Membership_Activity__c =: string.escapesinglequotes(recId) WITH USER_MODE LIMIT 1];
            
            
            String[] specifyBankAdminList = new List<String>();
            String[] listAppliCustomList = new List<String>();
            String[] indicateVendorList = new List<String>();
            String[] providePlanCodeList = new List<String>();
            SCC_Level_2_Hover_Help__mdt[] sccHoverHelpMdt = [Select DeveloperName,Indicate_Vendor__c,List_any_applicable_customization__c,
                                                             Provide_plan_code_in_text_box__c,Specify_Bank_Administrator__c from SCC_Level_2_Hover_Help__mdt 
                                                             LIMIT: Limits.getLimitQueryRows()-Limits.getQueryRows()];
            oppwrapper.sccHoverHelp = sccHoverHelpMdt;
            
            if(sccHoverHelpMdt != null){
                for(SCC_Level_2_Hover_Help__mdt sccMdt : sccHoverHelpMdt){
                    if(sccMdt != null){
                        if(sccMdt.DeveloperName != null){
                            if(sccMdt.Indicate_Vendor__c != null){
                                indicateVendorList = sccMdt.Indicate_Vendor__c.split(';');
                            }
                            if(sccMdt.List_any_applicable_customization__c != null){
                                listAppliCustomList = sccMdt.List_any_applicable_customization__c.split(';');
                            }
                            if(sccMdt.Provide_plan_code_in_text_box__c != null){
                                providePlanCodeList = sccMdt.Provide_plan_code_in_text_box__c.split(';');
                            }
                            if(sccMdt.Specify_Bank_Administrator__c != null){
                                specifyBankAdminList = sccMdt.Specify_Bank_Administrator__c.split(';');
                            }
                        }
                    }
                } 
                
                /*oppwrapper.specifyBankAdminList = specifyBankAdminList;
oppwrapper.listAppliCustomList = listAppliCustomList;
oppwrapper.indicateVendorList = indicateVendorList;
oppwrapper.providePlanCodeList = providePlanCodeList;*/
            }
            
            //------------------------------------SAMARTH------------------------------------
            
            /* Logic to provide edit Access & fetch Products based on Desposition value for each product when Sales Stage is set to notified - START*/
            
            /* Fetching Medical Products - START */
            if(OppDatarec.Sales_Stage_Medical__c != 'Notified' && OppDatarec.Sales_Stage_Medical__c != 'Spin-Off' && OppDatarec.Sales_Stage_Medical__c != 'Transfer In/Out') {
                List<OpportunityLineItem> mediopplineitem =[select id,Level_2_Option__c,Level2_Info__c,ProductCode,Product2.Level_2_Options__c,Product2.Family,Product2.Name,Product_Line__c,Buyup_Product_Selection__c,Product2.Surest_Implementation_Lead_Time__c,
                                                            Disposition_Other_Buy_Up_Programs__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c,MNRP__c,MNRP_DME__c,MNRP_Lab__c,MNRP_Default_of_Billed_Charges__c,
                                                            Facility_R_C__c,ENRP__c,ENRP_Default_of_Billed_Charge__c,Non_standard_Comments__c,MNRP_Percentage__c,MNRP_DME_Percentage__c,MNRP_Lab_Percentage__c,
                                                            MNRP_Dfault_of_Billd_Chrges_Percentage__c,Facility_R_C_Percentage__c,ENRP_Percentage__c,ENRP_Dfault_of_Billd_Chrges_Percentage__c,MNRP_DME_Nonstd_Percentage__c,Opportunity.RecordTypeId,Opportunity.Disposition_Pharmacy__c,
                                                            MNRP_Lab_Nonstd_Percentage__c,MNRP_Default_Nonstd_Percentage__c from OpportunityLineItem where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c='Medical' and Opportunity.Disposition_Medical__c !='Dead Pending Transfer' and Opportunity.Disposition_Medical__c!='Dead Spin-Off' WITH USER_MODE];
                
                oppwrapper.medilineitem = mediopplineitem;
                OpplineItemList.addALL(mediopplineitem);
                oppwrapper.MedidiscValue = 'TBD';
                if(OppDatarec.Sales_Stage_Medical__c == 'Spin-Off') {
                    oppwrapper.MedidiscValue = 'Spin-Off';
                }
                if(OppDatarec.Sales_Stage_Medical__c == 'Transfer In/Out' && OppDatarec.Disposition_Medical__c == 'Transfer In') {
                    oppwrapper.MedidiscValue = 'Transfer In';
                }
                Boolean showCPWSection = false;
                for (OpportunityLineItem item : mediopplineitem) {
                if((oppwrapper.MedidiscValue == 'Spin-Off' || oppwrapper.MedidiscValue == 'Transfer In') && (item.Buyup_Product_Selection__c == 'Surest & UNET' || item.Buyup_Product_Selection__c == 'Surest Only')){
                    showCPWSection = true;
                }
                }
                oppwrapper.showCPWSection = showCPWSection;
                system.debug('mediopplineitem if '+mediopplineitem);
            } 
            else if((OppDatarec.Sales_Stage_Medical__c == 'Notified' && OppDatarec.Disposition_Medical__c == 'Sold' )|| (OppDatarec.Sales_Stage_Medical__c == 'Spin-Off' && OppDatarec.Disposition_Medical__c == 'Spin-Off') || (OppDatarec.Sales_Stage_Medical__c == 'Transfer In/Out' && OppDatarec.Disposition_Medical__c == 'Transfer In')) {
                List<OpportunityLineItem> mediopplineitem =[select id,Level_2_Option__c,Level2_Info__c,ProductCode,Product2.Level_2_Options__c,Product2.Family,Product2.Name,Product2.Surest_Applicable_Products__c,Product_Line__c,Product2.Surest_Implementation_Lead_Time__c,
                                                            Disposition_Other_Buy_Up_Programs__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c,MNRP__c,MNRP_DME__c,MNRP_Lab__c,MNRP_Default_of_Billed_Charges__c,
                                                            Facility_R_C__c,ENRP__c,ENRP_Default_of_Billed_Charge__c,Non_standard_Comments__c,MNRP_Percentage__c,MNRP_DME_Percentage__c,MNRP_Lab_Percentage__c,
                                                            MNRP_Dfault_of_Billd_Chrges_Percentage__c,Facility_R_C_Percentage__c,ENRP_Percentage__c,ENRP_Dfault_of_Billd_Chrges_Percentage__c,MNRP_DME_Nonstd_Percentage__c,Opportunity.RecordTypeId,Buyup_Product_Selection__c,Opportunity.Disposition_Pharmacy__c,
                                                            MNRP_Lab_Nonstd_Percentage__c,MNRP_Default_Nonstd_Percentage__c from OpportunityLineItem where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c='Medical' and ((Opportunity.Disposition_Medical__c = 'Sold' and Sold_Retained_Members__c!=0) Or Opportunity.Disposition_Medical__c = 'Transfer In' or Opportunity.Disposition_Medical__c = 'Spin-Off')  WITH USER_MODE];
                
                oppwrapper.medilineitem = mediopplineitem;
                OpplineItemList.addALL(mediopplineitem);
                system.debug(mediopplineitem.size());
                oppwrapper.MedidiscValue = 'Sold';
                if(OppDatarec.Sales_Stage_Medical__c == 'Spin-Off') {
                    oppwrapper.MedidiscValue = 'Spin-Off';
                }
                if(OppDatarec.Sales_Stage_Medical__c == 'Transfer In/Out' && OppDatarec.Disposition_Medical__c == 'Transfer In') {
                    oppwrapper.MedidiscValue = 'Transfer In';
                }
                medicalEditAccess = true;

                Boolean isTraditionalProductMed = false;
                Boolean isSurestProductMed = false;
                Boolean showCPWSection = false;
                for (OpportunityLineItem item : mediopplineitem) {
                    if (item.Product2.Surest_Applicable_Products__c == 'Not Available for Surest') {
                        isTraditionalProductMed = true;
                    }
                    else if(item.Product2.Surest_Applicable_Products__c == 'Available for Surest only') {
                        isSurestProductMed = true;
                    }
                    if(item.Buyup_Product_Selection__c == 'Surest & UNET' || item.Buyup_Product_Selection__c == 'Surest Only'){
                        showCPWSection = true;
                        
                    }
                }
                oppwrapper.isTraditionalProductMed = isTraditionalProductMed;
                oppwrapper.isSurestProductMed = isSurestProductMed;
                oppwrapper.showCPWSection = showCPWSection;
                
                
                system.debug('mediopplineitem else '+mediopplineitem);
            }
            /* Fetching Medical Products - END */
            
            /* Fetching Dental Products - START */
            if(OppDatarec.Sales_Stage_Dental__c != 'Notified' && OppDatarec.Sales_Stage_Dental__c != 'Spin-Off' && OppDatarec.Sales_Stage_Dental__c != 'Transfer In/Out') {
                List<OpportunityLineItem> dentalopplineitem =[select id,Level_2_Option__c,Level2_Info__c,ProductCode,Product2.Level_2_Options__c,Product2.Family,Product2.Name,Product2.Surest_Applicable_Products__c,Product_Line__c,Product2.Surest_Implementation_Lead_Time__c,
                                                             Buyup_Product_Selection__c, Disposition_Other_Buy_Up_Programs__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c,Opportunity.RecordTypeId,Opportunity.Disposition_Pharmacy__c from OpportunityLineItem 
                                                              where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c='Dental' and Opportunity.Disposition_Dental__c !='Dead Pending Transfer' and Opportunity.Disposition_Dental__c!='Dead Spin-Off' WITH USER_MODE];
                
                oppwrapper.dentallineitem = dentalopplineitem;
                OpplineItemList.addALL(dentalopplineitem);
                oppwrapper.dentdiscvalue = 'TBD';
                if(OppDatarec.Sales_Stage_Dental__c == 'Spin-Off') {
                    oppwrapper.dentdiscvalue = 'Spin-Off';
                }
                if(OppDatarec.Sales_Stage_Dental__c == 'Transfer In/Out' && OppDatarec.Disposition_Dental__c == 'Transfer In') {
                    oppwrapper.dentdiscvalue = 'Transfer In';
                }
                Boolean isTradSoldDental = false;
                Boolean isSurestSoldDental = false;
                for (OpportunityLineItem item : dentalopplineitem) {
                    if (item.Buyup_Product_Selection__c == 'Surest & UNET') {
                        isTradSoldDental = true;
                        isSurestSoldDental = true;
                    }
                    else if(item.Buyup_Product_Selection__c == 'UNET or UMR Only') {
                        isTradSoldDental = true;
                        //isSurestSoldDental = false;                    
                    }
                    else if (item.Buyup_Product_Selection__c == 'Surest only') {
                        //isTradSoldDental = false;
                        isSurestSoldDental = true;
                    }
                }
                oppwrapper.isTradSoldDental = isTradSoldDental;
                oppwrapper.isSurestSoldDental = isSurestSoldDental;
               
            } else if((OppDatarec.Sales_Stage_Dental__c == 'Notified' && OppDatarec.Disposition_Dental__c == 'Sold')|| (OppDatarec.Sales_Stage_Dental__c == 'Spin-Off' && OppDatarec.Disposition_Dental__c == 'Spin-Off') || (OppDatarec.Sales_Stage_Dental__c == 'Transfer In/Out' && OppDatarec.Disposition_Dental__c == 'Transfer In')) { 
                List<OpportunityLineItem> dentalopplineitem =[select id,Level_2_Option__c,Level2_Info__c,ProductCode,Product2.Level_2_Options__c,Product2.Family,Product2.Name,Product_Line__c,Product2.Surest_Implementation_Lead_Time__c,
                                                              Disposition_Other_Buy_Up_Programs__c,Buyup_Product_Selection__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c,Opportunity.RecordTypeId,Opportunity.Disposition_Pharmacy__c from OpportunityLineItem where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c='Dental' and ((Opportunity.Disposition_Dental__c = 'Sold' and Sold_Retained_Members__c!=0) Or Opportunity.Disposition_Dental__c = 'Transfer In' or Opportunity.Disposition_Dental__c = 'Spin-Off')  WITH USER_MODE];
                
                oppwrapper.dentallineitem = dentalopplineitem;
                OpplineItemList.addALL(dentalopplineitem);
                oppwrapper.dentdiscvalue = 'Sold';
                 if(OppDatarec.Sales_Stage_Dental__c == 'Spin-Off') {
                    oppwrapper.dentdiscvalue = 'Spin-Off';
                }
                if(OppDatarec.Sales_Stage_Dental__c == 'Transfer In/Out' && OppDatarec.Disposition_Dental__c == 'Transfer In') {
                    oppwrapper.dentdiscvalue = 'Transfer In';
                }
                dentalEditAccess = true;
                //oppwrapper.Net_Results_Not_Zero =true;
                Boolean isTradSoldDental = false;
                Boolean isSurestSoldDental = false;
                for (OpportunityLineItem item : dentalopplineitem) {
                    if (item.Buyup_Product_Selection__c == 'Surest & UNET') {
                        isTradSoldDental = true;
                        isSurestSoldDental = true;
                    }
                    else if(item.Buyup_Product_Selection__c == 'UNET or UMR Only') {
                        isTradSoldDental = true;
                        //isSurestSoldDental = false;                    
                    }
                    else if (item.Buyup_Product_Selection__c == 'Surest only') {
                        //isTradSoldDental = false;
                        isSurestSoldDental = true;
                    }
                }
                oppwrapper.isTradSoldDental = isTradSoldDental;
                oppwrapper.isSurestSoldDental = isSurestSoldDental;
            }
            /* Fetching Dental Products - END */
            
            /* Fetching Vision Products - START */
            if(OppDatarec.Sales_Stage_Vision__c != 'Notified' && OppDatarec.Sales_Stage_Vision__c != 'Spin-Off' && OppDatarec.Sales_Stage_Vision__c != 'Transfer In/Out') {
                List<OpportunityLineItem> visionOpplineitem =[select id,Level_2_Option__c,Level2_Info__c,ProductCode,Product2.Level_2_Options__c,Product2.Family,Product2.Name,Product_Line__c,Product2.Surest_Implementation_Lead_Time__c,
                                                              Disposition_Other_Buy_Up_Programs__c,Buyup_Product_Selection__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c,Opportunity.RecordTypeId,Opportunity.Disposition_Pharmacy__c from OpportunityLineItem 
                                                              where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c='Vision' and Opportunity.Disposition_Vision__c !='Dead Pending Transfer' and Opportunity.Disposition_Vision__c!='Dead Spin-Off' WITH USER_MODE];
                
                oppwrapper.visionlineitem = visionOpplineitem;
                OpplineItemList.addALL(visionOpplineitem);
                oppwrapper.visiondiscvalue = 'TBD';
                if(OppDatarec.Sales_Stage_Vision__c == 'Spin-Off') {
                    oppwrapper.visiondiscvalue = 'Spin-Off';
                }
                if(OppDatarec.Sales_Stage_Vision__c == 'Transfer In/Out' && OppDatarec.Disposition_Vision__c == 'Transfer In') {
                    oppwrapper.visiondiscvalue = 'Transfer In';
                }
                Boolean isTradSoldVision = false;
                Boolean isSurestSoldVision = false;
                for (OpportunityLineItem item : visionOpplineitem) {
                    if (item.Buyup_Product_Selection__c == 'Surest & UNET') {
                        isTradSoldVision = true;
                        isSurestSoldVision = true;
                    }
                    else if(item.Buyup_Product_Selection__c == 'UNET or UMR Only') {
                        isTradSoldVision = true;
                        //isSurestSoldVision = false;                    
                    }
                    else if (item.Buyup_Product_Selection__c == 'Surest only') {
                        //isTradSoldVision = false;
                        isSurestSoldVision = true;
                    }
                }
                oppwrapper.isTradSoldVision = isTradSoldVision;
                oppwrapper.isSurestSoldVision = isSurestSoldVision;
            } else if((OppDatarec.Sales_Stage_Vision__c == 'Notified' && OppDatarec.Disposition_Vision__c == 'Sold')|| (OppDatarec.Sales_Stage_Vision__c == 'Spin-Off' && OppDatarec.Disposition_Vision__c == 'Spin-Off') || (OppDatarec.Sales_Stage_Vision__c == 'Transfer In/Out' && OppDatarec.Disposition_Vision__c == 'Transfer In')) {
                List<OpportunityLineItem> visionOpplineitem =[select id,Level_2_Option__c,Level2_Info__c,ProductCode,Product2.Level_2_Options__c,Product2.Family,Product2.Name,Product_Line__c,Product2.Surest_Implementation_Lead_Time__c,
                                                              Disposition_Other_Buy_Up_Programs__c,Buyup_Product_Selection__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c,Opportunity.RecordTypeId,Opportunity.Disposition_Pharmacy__c from OpportunityLineItem where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c='Vision' and ((Opportunity.Disposition_Vision__c = 'Sold' and Sold_Retained_Members__c!=0) Or Opportunity.Disposition_Vision__c = 'Transfer In' or Opportunity.Disposition_Vision__c = 'Spin-Off')  WITH USER_MODE];
                
                oppwrapper.visionlineitem = visionOpplineitem;
                OpplineItemList.addALL(visionOpplineitem);
                oppwrapper.visiondiscvalue = 'Sold';
                 if(OppDatarec.Sales_Stage_Vision__c == 'Spin-Off') {
                    oppwrapper.visiondiscvalue = 'Spin-Off';
                }
                if(OppDatarec.Sales_Stage_Vision__c == 'Transfer In/Out' && OppDatarec.Disposition_Vision__c == 'Transfer In') {
                    oppwrapper.visiondiscvalue = 'Transfer In';
                }
                visionEditAccess = true;
                Boolean isTradSoldVision = false;
                Boolean isSurestSoldVision = false;
                for (OpportunityLineItem item : visionOpplineitem) {
                    if (item.Buyup_Product_Selection__c == 'Surest & UNET') {
                        isTradSoldVision = true;
                        isSurestSoldVision = true;
                    }
                    else if(item.Buyup_Product_Selection__c == 'UNET or UMR Only') {
                        isTradSoldVision = true;
                        //isSurestSoldVision = false;                    
                    }
                    else if (item.Buyup_Product_Selection__c == 'Surest only') {
                        //isTradSoldVision = false;
                        isSurestSoldVision = true;
                    }
                }
                oppwrapper.isTradSoldVision = isTradSoldVision;
                oppwrapper.isSurestSoldVision = isSurestSoldVision;
                //oppwrapper.Net_Results_Not_Zero =true;
            }
            /* Fetching Vision Products - END */
            
            /* Fetching Pharmacy Products - START */
            if(OppDatarec.Sales_Stage_Pharmacy__c != 'Notified' && OppDatarec.Sales_Stage_Pharmacy__c != 'Spin-Off' && OppDatarec.Sales_Stage_Pharmacy__c != 'Transfer In/Out') {
                List<OpportunityLineItem> pharmacyitem =[select id,Pharmacy_Carve_Out_DropDown__c,Level_2_Option__c,Level2_Info__c,ProductCode,toLabel(Product2.Level_2_Options__c),Product2.Family,Product2.Name,Product_Line__c,Product2.Product_Display_Order__c,Product2.Surest_Applicable_Products__c,Product2.Surest_Implementation_Lead_Time__c,
                                                         Disposition_Other_Buy_Up_Programs__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c, ESP_Enhanced_Savings_Program_Opt_in__c, Vital_Medication_program_Opt_in_Opt_out__c, Price_Edge_Opt_in__c,Buyup_Product_Selection__c,
                                                         If_Fully_Insured_include_quoted_Rx_plan__c,Opportunity.RecordTypeId,Opportunity.Disposition_Pharmacy__c from OpportunityLineItem 
                                                         where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c='Pharmacy' and Opportunity.Disposition_Pharmacy__c !='Dead Pending Transfer' and Opportunity.Disposition_Pharmacy__c!='Dead Spin-Off' WITH USER_MODE ORDER BY Product2.Product_Display_Order__c];
                
                oppwrapper.pharmacylineitem = pharmacyitem;
                OpplineItemList.addALL(pharmacyitem);
                oppwrapper.pharmdiscvalue = 'TBD';
                if(OppDatarec.Sales_Stage_Pharmacy__c == 'Spin-Off') {
                    oppwrapper.pharmdiscvalue = 'Spin-Off';
                }
                 if(OppDatarec.Sales_Stage_Pharmacy__c == 'Transfer In/Out' && OppDatarec.Disposition_Pharmacy__c == 'Transfer In') {
                    oppwrapper.pharmdiscvalue = 'Transfer In';
                }
               
            } else if((OppDatarec.Sales_Stage_Pharmacy__c == 'Notified' && OppDatarec.Disposition_Pharmacy__c == 'Sold')|| (OppDatarec.Sales_Stage_Pharmacy__c == 'Spin-Off' && OppDatarec.Disposition_Pharmacy__c == 'Spin-Off') || (OppDatarec.Sales_Stage_Pharmacy__c == 'Transfer In/Out' && OppDatarec.Disposition_Pharmacy__c == 'Transfer In')) {
                List<OpportunityLineItem> pharmacyitem =[select id,Pharmacy_Carve_Out_DropDown__c,Level_2_Option__c,Level2_Info__c,ProductCode,toLabel(Product2.Level_2_Options__c),Product2.Family,Product2.Name,Product_Line__c,Product2.Product_Display_Order__c,Product2.Surest_Applicable_Products__c,Product2.Surest_Implementation_Lead_Time__c,
                                                         Disposition_Other_Buy_Up_Programs__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c, ESP_Enhanced_Savings_Program_Opt_in__c, Vital_Medication_program_Opt_in_Opt_out__c, Price_Edge_Opt_in__c,Buyup_Product_Selection__c,
                                                         If_Fully_Insured_include_quoted_Rx_plan__c,Opportunity.RecordTypeId,Opportunity.Disposition_Pharmacy__c from OpportunityLineItem where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c='Pharmacy' and ((Opportunity.Disposition_Pharmacy__c = 'Sold' and Sold_Retained_Members__c!=0) Or Opportunity.Disposition_Pharmacy__c = 'Transfer In' or Opportunity.Disposition_Pharmacy__c = 'Spin-Off')  WITH USER_MODE ORDER BY Product2.Product_Display_Order__c];
                
                oppwrapper.pharmacylineitem = pharmacyitem;
                OpplineItemList.addALL(pharmacyitem);
                oppwrapper.pharmdiscvalue = 'Sold';
                  if(OppDatarec.Sales_Stage_Pharmacy__c == 'Spin-Off') {
                    oppwrapper.pharmdiscvalue = 'Spin-Off';
                }
                 if(OppDatarec.Sales_Stage_Pharmacy__c == 'Transfer In/Out' && OppDatarec.Disposition_Pharmacy__c == 'Transfer In') {
                    oppwrapper.pharmdiscvalue = 'Transfer In';
                }
                pharmacyEditAccess = true;
                Boolean isTraditionalProductPharmacy = false;
                Boolean isSurestProductPharmacy = false;
                for (OpportunityLineItem item : pharmacyitem) {
                    /*if (item.Buyup_Product_Selection__c == 'UNET or UMR Only' || item.Buyup_Product_Selection__c == 'Surest & UNET') {
                        isTraditionalProductPharmacy = true;
                    }
                    if (item.Buyup_Product_Selection__c == 'Surest only') {
                        isSurestProductPharmacy = true;
                    }*/
                    if (item.Product2.Surest_Applicable_Products__c == 'Not Available for Surest') {
                        isTraditionalProductPharmacy = true;
                    }
                    else if(item.Product2.Surest_Applicable_Products__c == 'Available for Surest only') {
                        isSurestProductPharmacy = true;
                    }
                }
                system.debug('Veera +'+isSurestProductPharmacy);
                oppwrapper.isTraditionalProductPharmacy = isTraditionalProductPharmacy;
                oppwrapper.isSurestProductPharmacy = isSurestProductPharmacy;
                //oppwrapper.Net_Results_Not_Zero =true;
            }
            /* Fetching Pharmacy Products - END */
            
            /* Fetching Other Products - START */
            if(OppDatarec.Sales_Stage_Other__c != 'Notified' && OppDatarec.Sales_Stage_Other__c != 'Spin-Off' && OppDatarec.Sales_Stage_Other__c != 'Transfer In/Out') {
                OtherOpplineitemlist =[select id,Level_2_Option__c,Buyup_Product_Selection__c,ProductCode,toLabel(Product2.Level_2_Options__c),Level2_Info__c,Product2.Family,Product2.Name,Product_Line__c,Product2.Surest_Implementation_Lead_Time__c,
                                       Disposition_Other_Buy_Up_Programs__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c,Decision_Support__c,Maternity_Support__c,
                                       Congenital_Heart_Disease__c,Transplant_TRS_COE__c,Non_Extra_Contractual_Transplant__c,HealtheNote_Reminders__c,Physical_Health_Network__c,Physical_Health_Chiro_Clinical_Support__c,
                                       Asthma_VOM__c,Diabetes_VOM__c,Congestive_Heart_Failure_VOM__c,CAD_VOM__c,COPD_VOM__c,Cancer_Support_Program_VOM__c,Kidney_Solutions_VOM__c,
                                       Kidney_Resource_Services_VOM__c,MNRP__c,MNRP_DME__c,MNRP_Lab__c,MNRP_Default_of_Billed_Charges__c,
                                       Facility_R_C__c,ENRP__c,ENRP_Default_of_Billed_Charge__c,Non_standard_Comments__c,MNRP_Percentage__c,MNRP_DME_Percentage__c,MNRP_Lab_Percentage__c,
                                       MNRP_Dfault_of_Billd_Chrges_Percentage__c,Facility_R_C_Percentage__c,ENRP_Percentage__c,ENRP_Dfault_of_Billd_Chrges_Percentage__c,MNRP_DME_Nonstd_Percentage__c,
                                       MNRP_Lab_Nonstd_Percentage__c,MNRP_Default_Nonstd_Percentage__c,Physician_R_C_OON__c,Physician_R_C_OON_Percentage__c,Opportunity.RecordTypeId,Opportunity.Disposition_Pharmacy__c,Flex_WriteIn__c,Flex_Options__c from OpportunityLineItem 
                                       where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c ='Other' and Disposition_Other_Buy_Up_Programs__c !='Dead Pending Transfer' and Disposition_Other_Buy_Up_Programs__c!='Dead Spin-Off' and Disposition_Other_Buy_Up_Programs__c!='Transfer Out' AND (NOT(product2.Family = 'Specialty Products' AND (Disposition_Other_Buy_Up_Programs__c != 'Sold' AND Disposition_Other_Buy_Up_Programs__c != 'Spin-Off' AND Disposition_Other_Buy_Up_Programs__c != 'Transfer In' AND Disposition_Other_Buy_Up_Programs__c != 'TBD (New Clients Only)' AND (Disposition_Other_Buy_Up_Programs__c != null OR Disposition_Other_Buy_Up_Programs__c != '')) )) WITH USER_MODE];
                //Specialty Spilt-up Changes - updated Above Query for Specialty Products
                oppwrapper.otheropplineitems = OtherOpplineitemlist;
                OpplineItemList.addALL(oppwrapper.otheropplineitems);
                oppwrapper.otherProductsStatus = 'TBD';
                Boolean isTradSoldOther = false;
                Boolean isSurestSoldOther = false;
                for (OpportunityLineItem item : OtherOpplineitemlist) {
                    //Specialty Spilt-up Changes
                    if(item.Product2.Family == 'Specialty Products' && (item.Disposition_Other_Buy_Up_Programs__c =='Sold' || item.Disposition_Other_Buy_Up_Programs__c =='Transfer In' || item.Disposition_Other_Buy_Up_Programs__c =='Spin-Off' )){
                        oppwrapper.otherProductsStatus = 'Sold';
                    }//END
                    if (item.Buyup_Product_Selection__c == 'Surest & UNET') {
                        isTradSoldOther = true;
                        isSurestSoldOther = true;
                    }
                    else if(item.Buyup_Product_Selection__c == 'UNET or UMR Only') {
                        isTradSoldOther = true;
                        //isSurestSoldOther = false;                    
                    }
                    else if (item.Buyup_Product_Selection__c == 'Surest only') {
                        //isTradSoldOther = false;
                        isSurestSoldOther = true;
                    }
                }
                oppwrapper.isTradSoldOther = isTradSoldOther;
                oppwrapper.isSurestSoldOther = isSurestSoldOther;
            } 
            else if(OppDatarec.Sales_Stage_Other__c == 'Notified' || OppDatarec.Sales_Stage_Other__c == 'Spin-Off'  || OppDatarec.Sales_Stage_Other__c == 'Transfer In/Out' ) {
                OtherOpplineitemlist =[select id,Level_2_Option__c,Buyup_Product_Selection__c,ProductCode,toLabel(Product2.Level_2_Options__c),Level2_Info__c,Product2.Family,Product2.Name,Product_Line__c,Product2.Surest_Implementation_Lead_Time__c,
                                       Disposition_Other_Buy_Up_Programs__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c,Decision_Support__c,Maternity_Support__c,
                                       Congenital_Heart_Disease__c,Transplant_TRS_COE__c,Non_Extra_Contractual_Transplant__c,HealtheNote_Reminders__c,Physical_Health_Network__c,Physical_Health_Chiro_Clinical_Support__c,
                                       Asthma_VOM__c,Diabetes_VOM__c,Congestive_Heart_Failure_VOM__c,CAD_VOM__c,COPD_VOM__c,Cancer_Support_Program_VOM__c,Kidney_Solutions_VOM__c,
                                       Kidney_Resource_Services_VOM__c,MNRP__c,MNRP_DME__c,MNRP_Lab__c,MNRP_Default_of_Billed_Charges__c,
                                       Facility_R_C__c,ENRP__c,ENRP_Default_of_Billed_Charge__c,Non_standard_Comments__c,MNRP_Percentage__c,MNRP_DME_Percentage__c,MNRP_Lab_Percentage__c,
                                       MNRP_Dfault_of_Billd_Chrges_Percentage__c,Facility_R_C_Percentage__c,ENRP_Percentage__c,ENRP_Dfault_of_Billd_Chrges_Percentage__c,MNRP_DME_Nonstd_Percentage__c,Flex_WriteIn__c,Flex_Options__c,
                                       MNRP_Lab_Nonstd_Percentage__c,MNRP_Default_Nonstd_Percentage__c,Physician_R_C_OON__c,Physician_R_C_OON_Percentage__c,Opportunity.RecordTypeId,Opportunity.Disposition_Pharmacy__c from OpportunityLineItem where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c ='Other' AND ((Disposition_Other_Buy_Up_Programs__c = 'Sold'  and Sold_Retained_Members__c!=0) OR Disposition_Other_Buy_Up_Programs__c = 'TBD (New Clients Only)' OR Disposition_Other_Buy_Up_Programs__c ='Transfer In' OR Disposition_Other_Buy_Up_Programs__c ='Spin-Off') WITH USER_MODE];
                oppwrapper.otherProductsStatus = 'Sold';
                oppwrapper.otheropplineitems = OtherOpplineitemlist;
                OpplineItemList.addALL(oppwrapper.otheropplineitems);
                Boolean isTradSoldOther = false;
                Boolean isSurestSoldOther = false;
                for (OpportunityLineItem item : OtherOpplineitemlist) {
                    if (item.Buyup_Product_Selection__c == 'Surest & UNET') {
                        isTradSoldOther = true;
                        isSurestSoldOther = true;
                    }
                    else if(item.Buyup_Product_Selection__c == 'UNET or UMR Only') {
                        isTradSoldOther = true;
                        //isSurestSoldOther = false;                    
                    }
                    else if (item.Buyup_Product_Selection__c == 'Surest only') {
                        //isTradSoldOther = false;
                        isSurestSoldOther = true;
                    }
                }
                oppwrapper.isTradSoldOther = isTradSoldOther;
                oppwrapper.isSurestSoldOther = isSurestSoldOther;
            }
            
            //Looping Other products to provide edit access based on Disposition_Other_Buy_Up_Programs__c field if it is sold give edit access to the Sold case checklist form
            for(Integer i = 0 ; i < OtherOpplineitemlist.size() ; i++) {
                if(OtherOpplineitemlist[i].Disposition_Other_Buy_Up_Programs__c == 'Sold') {
                    otherProductsEditAccess = true;
                    break;
                }
            }
            
            /* Fetching Other Products - END */
            
            /* Check if the user has Read only Access - START */
            Boolean isLoggedInUserRoleToBeEnabled = UserInformationClass.hasEditAccessToRecord(recId);
            Boolean isIpmUser = false;
            //Query to get the current user profile name and provide edit access if it is IPM profile
            Id userProfileId = UserInfo.getProfileId();
            String userProfileName = [SELECT Id, Name, ProfileId, Profile.Name FROM User WHERE ProfileId =: userProfileId LIMIT 1].Profile.Name;
           /* if(userProfileName == 'IPM Standard Profile' && userProfileName == 'IPM Advanced Profile') {
                isIpmUser = true;
            }
            
            if(isLoggedInUserRoleToBeEnabled == false){
                if(isIpmUser) {
                    readOnlyUser = false;
                } else {
                    readOnlyUser = false;
                }
            }*/
            /* Check if the user has Read only Access - END */
            
            
            //Check all products Individual Edit Access and provide edit accessbility.
            
            List<OpportunityLineItem> cmOppLines =[SELECT Name, ProductCode, Id, Sales_Stage__c, Net_Results__c, Product2.Family, Product_Line__c,Opportunity.RecordTypeId,Buyup_Product_Selection__c,Opportunity.Disposition_Pharmacy__c FROM OpportunityLineItem where Product_Line__c IN ('Medical', 'Dental', 'Vision', 'Pharmacy', 'Other') and ((Sales_Stage__c ='Sold' or Sales_Stage__c ='Spin-Off' or Sales_Stage__c ='Transfer In') and OpportunityId =:recId) WITH USER_MODE];
             
           
            if(cmOppLines.size()>0){
                isSCCEditable =true;
                Boolean isTraditionalProdAll = false;
                Boolean isSurestProdAll = false;    
                if(cmOppLines[0].Net_Results__c > 0){
                    oppwrapper.Net_Results_Not_Zero =true;
                }
                for (OpportunityLineItem item : cmOppLines) {
                    if (item.Buyup_Product_Selection__c == 'UNET or UMR Only' || item.Buyup_Product_Selection__c == 'Surest & UNET' || oppwrapper.isTraditionalProductMed || oppwrapper.isTraditionalProductPharmacy) {
                        isTraditionalProdAll = true;
                    }
                    if (item.Buyup_Product_Selection__c == 'Surest only' || item.Buyup_Product_Selection__c == 'Surest & UNET' || oppwrapper.isSurestProductMed || oppwrapper.isSurestProductPharmacy) {
                        isSurestProdAll = true;
                    }
                }
                 
                oppwrapper.isTraditionalProdAll = isTraditionalProdAll;
                oppwrapper.isSurestProdAll = isSurestProdAll;
                // system.debug('isTraditionalProdAll>>'+isTraditionalProdAll);
                // system.debug('isSurestProdAll>>'+isSurestProdAll);
            
            }
            else{
                isSCCEditable =false;
            }
            
            
            
            if(isSCCEditable ==true) {
                if(medicalEditAccess == true || pharmacyEditAccess == true || dentalEditAccess == true || visionEditAccess == true || otherProductsEditAccess == true) {
                    hasEditAccess = true;
                    oppwrapper.Net_Results_Not_Zero =true;
                } 
                else {
                    hasEditAccess = false;
                    oppwrapper.Net_Results_Not_Zero =false;
                }
            }else{
                hasEditAccess = false;
                oppwrapper.Net_Results_Not_Zero =false;
            }
            if(OppDatarec.Sales_Stage_Other__c == 'Spin-Off' || OppDatarec.Sales_Stage_Other__c == 'Transfer In/Out'){
                list<opportunitylineitem> OtherOpplineitemlistSpinoff =[select id,Level_2_Option__c,Buyup_Product_Selection__c,ProductCode,toLabel(Product2.Level_2_Options__c),Level2_Info__c,Product2.Family,Product2.Name,Product_Line__c,
                                                                        Disposition_Other_Buy_Up_Programs__c, R_C_Percentage__c, Physician_R_C__c, Tolerance_Level__c,Decision_Support__c,Maternity_Support__c,
                                                                        Congenital_Heart_Disease__c,Transplant_TRS_COE__c,Non_Extra_Contractual_Transplant__c,HealtheNote_Reminders__c,Physical_Health_Network__c,Physical_Health_Chiro_Clinical_Support__c,
                                                                        Asthma_VOM__c,Diabetes_VOM__c,Congestive_Heart_Failure_VOM__c,CAD_VOM__c,COPD_VOM__c,Cancer_Support_Program_VOM__c,Kidney_Solutions_VOM__c,
                                                                        Kidney_Resource_Services_VOM__c,MNRP__c,MNRP_DME__c,MNRP_Lab__c,MNRP_Default_of_Billed_Charges__c,
                                                                        Facility_R_C__c,ENRP__c,ENRP_Default_of_Billed_Charge__c,Non_standard_Comments__c,MNRP_Percentage__c,MNRP_DME_Percentage__c,MNRP_Lab_Percentage__c,
                                                                        MNRP_Dfault_of_Billd_Chrges_Percentage__c,Facility_R_C_Percentage__c,ENRP_Percentage__c,ENRP_Dfault_of_Billd_Chrges_Percentage__c,MNRP_DME_Nonstd_Percentage__c,
                                                                        MNRP_Lab_Nonstd_Percentage__c,MNRP_Default_Nonstd_Percentage__c,Physician_R_C_OON__c,Physician_R_C_OON_Percentage__c,Opportunity.RecordTypeId,Opportunity.Disposition_Pharmacy__c from OpportunityLineItem where OpportunityId =:recId and ProductCode != 'Total' and Product_Line__c ='Other' AND ((Disposition_Other_Buy_Up_Programs__c = 'Spin-Off'  Or Disposition_Other_Buy_Up_Programs__c='Transfer In')) WITH USER_MODE];
                if(OtherOpplineitemlistSpinoff.size()>0){
                    otherProductsEditAccess =true;
                }
                
            }
               
            if(otherProductsEditAccess || OppDatarec.Disposition_Medical__c=='Spin-Off'  || OppDatarec.Disposition_Medical__c=='Transfer In' || OppDatarec.Disposition_Dental__c =='Spin-Off'  || OppDatarec.Disposition_Dental__c=='Transfer In' || OppDatarec.Disposition_Pharmacy__c=='Spin-Off'  || OppDatarec.Disposition_Pharmacy__c=='Transfer In' || OppDatarec.Disposition_Vision__c=='Spin-Off'  || OppDatarec.Disposition_Vision__c=='Transfer In'){
                hasEditAccess =true;
                oppwrapper.Net_Results_Not_Zero =true;
            }
            
            //Only Read Access
            if (userProfileName == 'General Executives' || userProfileName == 'Senior Executives' || userProfileName == 'Benefit Strategist') {
                hasEditAccess = false;
            }
            
            /* Logic to provide edit Access & fetch Products based on Desposition value for each product when Sales Stage is set to notified - END */
            
            /* Query to get Help icon Instructions During on Load */
            List<Sold_Case_Check_List_Help_Texts__mdt> soldCaseInstructions = [ SELECT Field_Api_Name__c, Help_Text_Value__c 
                                                                               FROM Sold_Case_Check_List_Help_Texts__mdt 
                                                                               LIMIT: Limits.getLimitQueryRows()-Limits.getQueryRows()
                                                                              ];
            scc.CPW__c =oppwrapper.showCPWSection;
            oppwrapper.sccData = scc;

            oppwrapper.OppolineItemsList = OpplineItemList;
            oppwrapper.oppdata = OppDatarec;
            oppwrapper.accrec = accrecvalue;
            oppwrapper.soldCaseInstructions = soldCaseInstructions;
            oppwrapper.hasEditAccess = hasEditAccess;
            // oppwrapper.Net_Results_Not_Zero = hasEditAccess;
            oppwrapper.cmRecTypeId = cmRT;           
            
            //--------- code added for SoldCase Audit Trail - start -----------
            
            oppwrapper.loggedInUserId=UserInfo.getUserId();
            List<String> lst=new List<String>();
            lst.add('Opportunity_ObjPrprtyFldApiName_Mapping');
            lst.add('Account_ObjPrprtyFldApiName_Mapping');
            lst.add('OppLineItem_ObjPrprtyFldApiName_Mapping');
            
            
            
            List<Sold_Case_Checklist_Audit_Trail_Setting__mdt> auditTrailSettingList=[Select DeveloperName,Value__c 
                                                                                      from Sold_Case_Checklist_Audit_Trail_Setting__mdt 
                                                                                      where DeveloperName in: lst ];
            oppwrapper.auditTrailSettingList=auditTrailSettingList;
            
            
        }
        oppwrapper.pickListValuesList = getOppItemPickListValues('Flex_Options__c');

        return oppwrapper;
    } 
    
    
    //-------------------------------------------SAMARTH SCC 2021-------------------------------------------
    /*@AuraEnabled
public static void updateBasePrograms(Id recId){
recId = String.escapeSingleQuotes(recId);

List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();
List<Sold_Case_Checklist__c> sccUpdateList = new List<Sold_Case_Checklist__c>();

oliList = [SELECT Id, Product_Line__c, Product2.Name, OpportunityId 
FROM OpportunityLineItem 
WHERE OpportunityId =:recId AND Product_Line__c ='Other'];

Id sccId = [SELECT Id FROM Sold_Case_Checklist__c 
WHERE Membership_Activity__c =: recId ].Id;

Boolean stdComm;
Boolean wellness;
Boolean advocacy;
for(OpportunityLineItem oli : oliList){
if(oli.Product2.Name == 'Engagement Solutions'){
stdComm = true;
}

if(oli.Product2.Name == 'Wellness - Rally (Engage Buy Up)' || oli.Product2.Name == 'Wellness - Rally (Premium Buy Up)'){
wellness = true;
}

if(oli.Product2.Name == 'Advocacy - Advocate4Me - Elite - Dedicated' || oli.Product2.Name == 'Advocacy - Advocate4Me - Elite - Highly Designated' ||
oli.Product2.Name == 'Advocacy - Advocate4Me - Premier - Dedicated' || oli.Product2.Name == 'Advocacy - Advocate4Me - Premier - Highly Designated')
{
advocacy = true;
}
}

if(stdComm == true || wellness == true || advocacy == true){
Sold_Case_Checklist__c sccObj = new Sold_Case_Checklist__c();
if(sccId != null){
sccObj.Id = sccId;
}

if(stdComm == true && sccObj.Standard_Communications__c != null){
sccObj.Standard_Communications__c = String.escapeSingleQuotes(OPT_OUT_TXT);
}
if(wellness == true && sccObj.Rally_Base__c != null){
sccObj.Rally_Base__c = String.escapeSingleQuotes(OPT_OUT_TXT);
}
if(advocacy == true && sccObj.A4Me_Core__c != null){
sccObj.A4Me_Core__c = String.escapeSingleQuotes(OPT_OUT_TXT);
}
sccUpdateList.add(sccObj);
}

if(sccUpdateList.size()>0){
update sccUpdateList;
}
}*/
    //-------------------------------------------SAMARTH SCC 2021-------------------------------------------
    
    @AuraEnabled(cacheable=true)
    public static Usersearchwrapper accsearch(string searchParam, String searchField)
    {
        String ipmStandardProfile = 'IPM Standard Profile';
        String ipmAdvancedProfile = 'IPM Advanced Profile';
        Usersearchwrapper userwrap = new Usersearchwrapper();
        userwrap.LocationIcon = 'standard:user';
        
        String queryUsers = '';
        if(searchField == 'IPM') {
            queryUsers = 'SELECT Id, Name FROM User Where IsActive = true AND (Profile.Name LIKE:ipmStandardProfile OR Profile.Name LIKE:ipmAdvancedProfile) AND name like \'%'+String.escapeSingleQuotes(searchParam)+'%\' Limit 5';
        } else {
            queryUsers ='select name,id from User where IsActive = true AND name like \'%'+String.escapeSingleQuotes(searchParam)+'%\' Limit 5';
        }
        List<User> userlist = Database.Query(queryUsers);
        userwrap.UserData = userlist;
        return userwrap;
    }
    
    @AuraEnabled(cacheable=true)
    public static IncumbentSearchWrapper incumbentSearch(string searchParam, String searchField)
    {
        IncumbentSearchWrapper incWrap = new IncumbentSearchWrapper();
        incWrap.LocationIcon = 'standard:account';
        
        String queryAccs = '';
        if(searchField == 'Incumbent Primary (Medical)' || searchField == 'Incumbent Primary (Pharmacy)' || searchField == 'Incumbent Primary (Dental)' || searchField == 'Incumbent Primary (Vision)'){
            queryAccs ='select name,id from Account where name like \'%'+String.escapeSingleQuotes(searchParam)+'%\' Limit 5';
        }
        
        List<Account> acclist = Database.Query(queryAccs);
        incWrap.AccData = acclist;
        return incWrap;
    }
    
    
    @AuraEnabled(cacheable=true)
    public static metadatawrapper metadatasearch(string searchParam)
    {  
        metadatawrapper metadatawrap = new metadatawrapper();
        metadatawrap.LocationIcon = 'standard:user';        
        string queryStr ='select Underwriter_Name__c,id from Underwriter_Data__mdt where Underwriter_Name__c like \'%'+String.escapeSingleQuotes(searchParam)+'%\' Limit 5';
        List<Underwriter_Data__mdt> metdatalist = Database.Query(queryStr);
        metadatawrap.Metadatalist = metdatalist;
        return metadatawrap;
    }
    
    @AuraEnabled
    public static Opportunity UpdateSoldCheckList(Opportunity Updateddata,Account accupdate,List<OpportunityLineItem> opplineitem,
                                                  List<Audit_Trail__c> auditTrailListToInsert,Sold_Case_Checklist__c updatedSoldCaseData)
    {
        /*system.debug('Updateddata?????'+Updateddata);
system.debug('updatedSoldCaseData '+updatedSoldCaseData);
system.debug('auditTrailListToInsert '+auditTrailListToInsert);*/
        system.debug('opplineitem = '+opplineitem);
        system.debug('updatedSoldCaseData = '+updatedSoldCaseData);
        system.debug('Updateddata = '+Updateddata);
        system.debug('accupdate = '+accupdate);
        
        //-----------------------------------------SAMARTH SCC 2021-----------------------------------------
        if(updatedSoldCaseData.Historic_Data__c != 'Medical' && updatedSoldCaseData.Historic_Data__c != 'Rx' && updatedSoldCaseData.Historic_Data__c != 'Both'){
            updatedSoldCaseData.Historic_Data_Medical_or_Rx__c = ''; 
        }
        
        if(updatedSoldCaseData.Extended_Network_Access__c != 'Yes' && updatedSoldCaseData.Extended_Network_Access__c != 'Yes'){
            updatedSoldCaseData.Extended_Network_Access_Level2__c = ''; 
        }
        
        if(updatedSoldCaseData.Pre_Implementation_Audit__c != 'Yes'){
            updatedSoldCaseData.Pre_Implementation_Audit_Level_2__c = '';
            updatedSoldCaseData.Pre_Implementation_Audit_Write_In__c = '';
        }

        if(updatedSoldCaseData.Surest_Pre_Implementation_Audit__c != 'Yes'){
            updatedSoldCaseData.Surest_Pre_Implementation_Audit_Level_2__c = '';
            updatedSoldCaseData.Surest_Pre_Implementation_Audit_Write_In__c = '';
        }
        
        if(updatedSoldCaseData.Claim_Fiduciary__c != 'Other'){
            updatedSoldCaseData.Claim_Fiduciary_Other__c = ''; 
        }
        
        if(updatedSoldCaseData.Offshore_Provisions__c != 'Level 0 Individual Functions'){
            updatedSoldCaseData.Offshore_Provisions_Level_0__c = ''; 
        }
        
        if(updatedSoldCaseData.Offshore_Provisions__c != 'Level 7 All Business Operations and It Work'){
            updatedSoldCaseData.Offshore_Provisions_Level_7__c = ''; 
        }

        if(updatedSoldCaseData.Surest_Offshore_Provisions__c != 'Level 0 Individual Functions'){
            updatedSoldCaseData.Surest_Offshore_Provisions_Level_0__c = ''; 
        }
        
        if(updatedSoldCaseData.Surest_Offshore_Provisions__c != 'Level 7 All Business Operations and It Work'){
            updatedSoldCaseData.Surest_Offshore_Provisions_Level_7__c = ''; 
        }
        
        if(updatedSoldCaseData.Rx_Coalition__c != 'Other'){
            updatedSoldCaseData.Rx_Coalition_Other__c = ''; 
        }
        
        if(updatedSoldCaseData.Passport_Connect_with_Harvard_Pilgrim__c == 'No'){
            updatedSoldCaseData.HP_Sold_Retained_Members__c = '';
            updatedSoldCaseData.HP_Alliance__c = '';
            updatedSoldCaseData.Preferred_HP__c = '';
        }
        
        if(updatedSoldCaseData.Medical_Necessity__c != 'Yes'){
            updatedSoldCaseData.Genetic_Testing_Prior_Authorization__c = '';
            updatedSoldCaseData.Inflammatory_Medication_Site_of_Care__c = '';
            updatedSoldCaseData.Functional_Endoscopic_Sinus_Surgery_FESS__c = '';
            updatedSoldCaseData.Hysterectomy__c = '';
            updatedSoldCaseData.Sinuplasty__c = '';
        }
        
        if(updatedSoldCaseData.CAA_IDR_Service_Fees__c != 'Carve-out' && updatedSoldCaseData.CAA_IDR_Service_Fees__c != 'EMT Approval'){
            system.debug('updatedSoldCaseData.CAA_IDR_Service_Fees__c '+updatedSoldCaseData.CAA_IDR_Service_Fees__c);
            updatedSoldCaseData.CAA_Service_Fees_Write_In__c = ''; 
        }
        if(updatedSoldCaseData.Surest_CAA_IDR_Service_Fees__c != 'Carve-out' && updatedSoldCaseData.Surest_CAA_IDR_Service_Fees__c != 'EMT Approval'){
            updatedSoldCaseData.Surest_CAA_IDR_Service_Fees_Write_In__c = ''; 
        }
        if (opplineitem != null && !opplineitem.isEmpty()) {
        for(OpportunityLineItem oli : opplineitem){
            //purging data of level 2 hover help - START
            if(oli.Level_2_Option__c == 'Standard' || oli.Level_2_Option__c == 'Optum Bank' || oli.Level_2_Option__c == 'Carve in - OptumRx' || 
               oli.Level_2_Option__c == 'Carve In - OneRx' || oli.Level_2_Option__c == 'Carve out Flex - OptumRx' || oli.Level_2_Option__c == 'Carve out - OptumRx'){
                   system.debug('oli.Level_2_Option__c '+oli.Level_2_Option__c);
                   oli.Level2_Info__c = '';
               }
            if(oli.Level_2_Option__c == 'Carve in - OptumRx' || oli.Level_2_Option__c == 'Carve In-OneRx' || oli.Level_2_Option__c == 'Carve in - OneRx' || oli.Level_2_Option__c == 'Carve Out'){
                oli.Pharmacy_Carve_Out_DropDown__c = '';
            }
            //purging data of level 2 hover help - END
            
            if(oli.Transplant_TRS_COE__c == 'Opt Out'){
                oli.Non_Extra_Contractual_Transplant__c = null;
            }            
            
            //purging data of OON Section - START
            if(oli.MNRP__c == 'N/A'){
                oli.MNRP_Percentage__c = null;
            }
            
            if(oli.MNRP_DME__c == 'N/A'){
                oli.MNRP_DME_Percentage__c = '';
                oli.MNRP_DME_Nonstd_Percentage__c = null;
            }
            if(oli.MNRP_DME_Percentage__c != 'Nonstandard'){
                oli.MNRP_DME_Nonstd_Percentage__c = null;
            }
            
            if(oli.MNRP_Lab__c == 'N/A'){
                oli.MNRP_Lab_Percentage__c = '';
                oli.MNRP_Lab_Nonstd_Percentage__c = null;
            }
            if(oli.MNRP_Lab_Percentage__c != 'Nonstandard'){
                oli.MNRP_Lab_Nonstd_Percentage__c = null;
            }
            
            if(oli.MNRP_Default_of_Billed_Charges__c == 'N/A'){
                oli.MNRP_Dfault_of_Billd_Chrges_Percentage__c = '';
                oli.MNRP_Default_Nonstd_Percentage__c = null;
            }
            if(oli.MNRP_Dfault_of_Billd_Chrges_Percentage__c != 'Other'){
                oli.MNRP_Default_Nonstd_Percentage__c = null;
            }
            
            if(oli.Physician_R_C_OON__c == 'N/A'){
                oli.Physician_R_C_OON_Percentage__c = null;
            }
            
            if(oli.Facility_R_C__c == 'N/A'){
                oli.Facility_R_C_Percentage__c = null;
            }
            
            if(oli.ENRP__c == 'N/A'){
                oli.ENRP_Percentage__c = null;
            }
            
            if(oli.ENRP_Default_of_Billed_Charge__c == 'N/A'){
                oli.ENRP_Dfault_of_Billd_Chrges_Percentage__c = null;
            }
            //purging data of OON Section - END
        }
        //-----------------------------------------SAMARTH SCC 2021-----------------------------------------
        }
        try{
            List<SObject> Objectupdate = new List<SObject>();
            // Objectupdate.add(Updateddata);
            // Objectupdate.add(accupdate);
            // Objectupdate.add(updatedSoldCaseData);
            // Objectupdate.addALL(opplineitem);
            if (Updateddata != null) {
                Objectupdate.add(Updateddata);
            }
        
            if (accupdate != null) {
                Objectupdate.add(accupdate);
            }
        
            if (updatedSoldCaseData != null) {
                Objectupdate.add(updatedSoldCaseData);
            }
        
            if (opplineitem != null && !opplineitem.isEmpty()) {
                Objectupdate.addALL(opplineitem);
            }
            
            /* update Updateddata;     
                update accupdate;
                update opplineitem;*/
            
            //update as USER Objectupdate;
            Database.SaveResult[] srList = Database.update(Objectupdate, false);
            
            // Iterate through each returned result
            for (Database.SaveResult sr : srList) {
                if (sr.isSuccess()) {
                    // Operation was successful, so get the ID of the record that was processed
                    System.debug('Successfully inserted account. Account ID: ' + sr.getId());
                }
                else {
                    // Operation failed, so get all errors                
                    for(Database.Error err : sr.getErrors()) {
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        System.debug('Account fields that affected this error: ' + err.getFields());
                    }
                }
            }
            
            //--------- code added for SoldCase Audit Trail - start -----------
            if(auditTrailListToInsert!=null && !auditTrailListToInsert.isEmpty()){
                insertAuditTrailRecords(auditTrailListToInsert);
            }
            //--------- code added for SoldCase Audit Trail - end -----------
            
        }catch(Exception excpn){
            System.debug('Exception occured in UpdateSoldCheckList() method==> '+excpn.getMessage());
        }
        return Updateddata;
    }
    
    //--------- method added for SoldCase Audit Trail - start -----------
    public static void insertAuditTrailRecords(List<Audit_Trail__c> auditTrailListToInsert){
        system.debug('auditTrailListToInsert '+auditTrailListToInsert);
        List<Audit_Trail__c> uniqueRecords = new List<Audit_Trail__c>();
        
        for(Audit_Trail__c objAuditTrail : auditTrailListToInsert){
            if(objAuditTrail.New_Value__c.trim() != objAuditTrail.Original_Value__c.trim()){
                uniqueRecords.add(objAuditTrail);
            }
        }
        
        Database.SaveResult[] insertResultList = Database.insert(uniqueRecords, false);
        
        
        // Iterate through each returned result
        for (Database.SaveResult eachInsertResult : insertResultList) {
            if (eachInsertResult.isSuccess()) {
                System.debug('Successfully inserted audit trail. Audit Trail ID: ' + eachInsertResult.getId());
                
            }
            else {
                for(Database.Error err : eachInsertResult.getErrors()) {
                    System.debug('The following error has occurred.');                    
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                    System.debug('Account fields that affected this error: ' + err.getFields());
                }
            }
            
        } 
        
        
    }
    
    
    //--------- method added for SoldCase Audit Trail - end -----------
    
    @AuraEnabled
    public static soldCaseChecklistWrapper getTemplateInXML(){
        
        soldCaseChecklistWrapper soldCaseWrapper = new soldCaseChecklistWrapper();
        String objectName  = '';  
        StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'SoldCaseChecklist_Print'];
        String xmlBodyString = sr.body.toString();
        
        //Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
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
        soldCaseWrapper.xmlString = xmlBodyString;
        soldCaseWrapper.objectItags = objectItagesMap;
        
        return soldCaseWrapper;
        
    }
    
    @AuraEnabled
    public static String getSoldcasePdf(String recordId){
        PageReference pdf_page = new PageReference('/apex/SoldCaseCheckListPrint?Id='+recordId);
        Blob pdfBlob = pdf_page.getContentAsPDF();
        String base64Pdf = EncodingUtil.base64Encode(pdfBlob);
        return base64Pdf;
        
    }

    @AuraEnabled(cacheable=true)
    public static List<Policy_Information__c> getAccountPolicyInfoSurest(Id accountId) {
        List<Policy_Information__c> policyList = [SELECT Id, Name, Policy__c, Policy_Type__c, Policy_Status__c, Surest__c FROM Policy_Information__c WHERE Company__c = :accountId AND Surest__c = true AND Policy_Type__c INCLUDES ('Medical') AND Policy_Status__c = 'Active' WITH USER_MODE];
        
        return policyList;
    }

    @AuraEnabled(cacheable=true)
    public static List<Product2> getOtherBuyUpProducts() {
        List<Product2> productList = [SELECT Id,Name,Surest_Applicable_Products__c,ProductCode,Product_Category__c,Product_Line__c,Surest_Implementation_Lead_Time__c FROM Product2 WITH USER_MODE];
        
        return productList;
    }
    
    public class oppwrapperclass {
        @AuraEnabled
        public Opportunity oppdata {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> OppolineItemsList {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> otheropplineitems {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> medilineitem {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> dentallineitem {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> pharmacylineitem {get;set;}
        @AuraEnabled
        public List<OpportunityLineItem> visionlineitem {get;set;}
        @AuraEnabled
        public Account accrec {get;set;}
        @AuraEnabled
        public String MedidiscValue {get;set;}
        @AuraEnabled
        public String dentdiscvalue {get;set;}
        @AuraEnabled
        public String pharmdiscvalue {get;set;}
        @AuraEnabled
        public String visiondiscvalue {get;set;}
        
        @AuraEnabled
        public string otherProductsStatus {get;set;}
        
        @AuraEnabled
        public List<Sold_Case_Check_List_Help_Texts__mdt> soldCaseInstructions {get; set;}
        
        @AuraEnabled
        public List<SCC_Level_2_Hover_Help__mdt> sccHoverHelp {get;set;}
        
        @AuraEnabled
        public Boolean Net_Results_Not_Zero {get;set;}
        
        @AuraEnabled
        public Id cmRecTypeId {get;set;}

        @AuraEnabled
        public Boolean showCPWSection {get;set;}
        
        @AuraEnabled
        public Boolean isSurestProductMed {get;set;}

        @AuraEnabled
        public Boolean isTraditionalProductMed {get;set;}

        @AuraEnabled
        public Boolean isSurestProductPharmacy {get;set;}

        @AuraEnabled
        public Boolean isTraditionalProductPharmacy {get;set;}

        @AuraEnabled
        public Boolean isSurestSoldDental {get;set;}

        @AuraEnabled
        public Boolean isTradSoldDental {get;set;}

        @AuraEnabled
        public Boolean isSurestSoldVision {get;set;}

        @AuraEnabled
        public Boolean isTradSoldVision {get;set;}

        @AuraEnabled
        public Boolean isSurestSoldOther {get;set;}

        @AuraEnabled
        public Boolean isTradSoldOther {get;set;}

        @AuraEnabled
        public Boolean isSurestProdAll {get;set;}

        @AuraEnabled
        public Boolean isTraditionalProdAll {get;set;}
        
        /*@AuraEnabled
public List<String> specifyBankAdminList {get;set;}
@AuraEnabled
public List<String> listAppliCustomList {get;set;} 
@AuraEnabled
public List<String> indicateVendorList {get;set;} 
@AuraEnabled
public List<String> providePlanCodeList {get;set;}*/ 
        
        @AuraEnabled
        public Boolean hasEditAccess {get;set;}
        
        //--------- variables added for SoldCase Audit Trail - start -----------
        @AuraEnabled
        public String loggedInUserId{ get; set; }
        
        @AuraEnabled
        public List<Sold_Case_Checklist_Audit_Trail_Setting__mdt> auditTrailSettingList{ get; set; }
        //--------- variables added for SoldCase Audit Trail - end -----------
        
        
        //-----------------SOLD CASE CHECKLIST 2021 SAMARTH-----------------
        @AuraEnabled
        public Sold_Case_Checklist__c sccData {get; set;}
        //-----------------SOLD CASE CHECKLIST 2021 SAMARTH-----------------
        /* @AuraEnabled
public boolean isCMSCCTabVisible{ get; set; }*/
        
        @AuraEnabled
        public List<string> pickListValuesList { get; set; }
        
    }
    
    public class metadatawrapper{
        @AuraEnabled
        public string LocationIcon {get;set;}
        @AuraEnabled
        public List<Underwriter_Data__mdt> Metadatalist {get;set;}
    }
    
    public class Usersearchwrapper{
        @AuraEnabled
        public string LocationIcon {get;set;}
        @AuraEnabled
        public List<User> UserData {get;set;}
    }
    
    public class IncumbentSearchWrapper{
        @AuraEnabled
        public string LocationIcon {get;set;}
        @AuraEnabled
        public List<Account> AccData {get;set;}
    }
    
    public class soldCaseChecklistWrapper{
        
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        
        @AuraEnabled
        public String xmlString { get; set; }
        
    }
    
   
    
    public static List<string> getOppItemPickListValues(String fieldApiName){
        List<string> pickListValuesList= new List<string>();
       if(string.isNotBlank(fieldApiName)){
            Map<String, Schema.SObjectField> fieldsMap= OpportunityLineItem.getSobjectType().getDescribe().fields.getMap();
            List<Schema.PicklistEntry> ple = fieldsMap.get(fieldApiName).getDescribe().getPicklistValues();
            for(Schema.PicklistEntry pickListVal : ple){
                pickListValuesList.add(pickListVal.getValue());
            }
        }
        
        return pickListValuesList;
}
}