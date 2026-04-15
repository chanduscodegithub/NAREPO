/****************************************************************** ***** 
Name: renewalChecklistCls 
Copyright © 2022 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: To query the data required by Renewal Checklist lwc component and get changes made to the data in frontend  and update them to backend.
Used by renewalChecklistMainComp,renewalSummaryTabComp,renewalDetailTabComp.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Varun MS  	 	     08/11/2022  		 INITIAL DEVELOPMENT   		  
*********************************************************************
*/

public with Sharing class renewalChecklistCls {
    
    public static Id userId = userInfo.getUserId();
    public static String userRoleId = userInfo.getUserRoleId();
    public static String userName = userInfo.getName();
    public static String userTimeZone = String.valueof(userinfo.getTimeZone().getDisplayName());
    
    /******************************************************************
* 
Purpose: To get logged in user role. 
Parameters: None.
Returns: List of string.
*******************************************************************
*/ 
    @AuraEnabled(cacheable=true)
    public static Map<String,String> userRole(){
        Map<String,String> userInfoMap = new Map<String,String>();
        String userRoleName = [SELECT Id,Name From UserRole WHERE Id =: userRoleId].Name;
        userInfoMap.put('userRoleName',userRoleName);
        userInfoMap.put('userName',userName);
        
        List<Renewal_Checklist_Visibility_Cycle__mdt> visibilityDate = [SELECT Id,Start_Date__c,End_Date__c FROM Renewal_Checklist_Visibility_Cycle__mdt LIMIT 1];
        string startDate = string.valueOf(visibilityDate[0].Start_Date__c);
        string endDate = string.valueOf(visibilityDate[0].End_Date__c);
        string dateToday = string.valueOf(system.today()); 
        
        userInfoMap.put('startDate',startDate);
        userInfoMap.put('endDate',endDate);
        userInfoMap.put('dateToday',dateToday);
        //userInfoMap.put('TimeZone',userTimeZone);
        return userInfoMap;
        
    }
    /******************************************************************
* 
Purpose: to get List of Accounts,Renewal Checklists and Opp line items and send it to summary tab.
Parameters: None.
Returns: Wrapper Class.
*******************************************************************
*/ 
    @AuraEnabled
    public static List<onLoadData> fetchData(Boolean showAllData){
        system.debug(' fetchData showAllData = '+showAllData);
        
        onLoadData allList = new onLoadData();
        List<onLoadData> onLoadDataList = new List<onLoadData>(); 
        Set<Id> accIdSet = new Set<Id>();
        Map<String,Id> recordTypes = new Map<String,Id>();
        
        Id existingClientRt = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        Id clientSubsidiaryRt = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Client Subsidiary').getRecordTypeId();
        recordTypes.put('existingClientRt',existingClientRt);
        recordTypes.put('clientSubsidiaryRt',clientSubsidiaryRt);
        //String userName = userInfo.getName();
        Id userId = userInfo.getUserId();
        
        List<Account> accList = [SELECT Id,Name,UHC_Medical_Members__c,CM_SCE__c,CMVPCRRVP__c,CM_SCE__r.Name,CMVPCRRVP__r.Name,Pending_Term_Client__c,RecordTypeId,OwnerId,Surest_Members__c,Subtype__c,(SELECT Id,Renewal_Checklist_Validated_By__c,Renewal_Checklist_Validated_Date__c, Sales_Season__c FROM Renewal_Checklists__r)  FROM Account WHERE ((CM_SCE__c =:userId AND OwnerId=:userId)  OR CMVPCRRVP__c =:userId) AND (RecordTypeId =: existingClientRt OR (RecordTypeId =: clientSubsidiaryRt AND UHC_Medical_Members__c>0)) AND Pending_Term_Client__c = false WITH USER_MODE];
        
        for(Account acc:accList){
            accIdSet.add(acc.Id);
        }
        
        List<Opportunity> onLoadOppList = [SELECT Id,Name,AccountId,Status__c,Sales_Season1__c,EffectiveDate__c,(SELECT Id,Name,TotalPrice,Net_Results__c,Members__c,product_line__c,productcode,Product2.Name,OpportunityId,Estimated_Additional_New_Members__c FROM OpportunityLineItems WHERE Product2.Name != 'Total' AND (Net_Results__c>0 OR Net_Results__c<0) ORDER BY Product2.Name)FROM Opportunity WHERE AccountId=:accIdSet WITH USER_MODE];
        
        /*List<OpportunityLineItem> dentalVisionList  = [SELECT Id, Name, OpportunityId,productcode,product_Line__c,Estimated_Additional_New_Members__c,Opportunity.Name,Opportunity.Sales_Season1__c,
Opportunity.EffectiveDate__c,Net_Results__c,Opportunity.Status__c,Opportunity.AccountId,Product2.Name FROM OpportunityLineItem 
WHERE productcode='total' AND Opportunity.AccountId=:accIdSet 
AND (Net_Results__c>0 OR Net_Results__c<0) AND (product_Line__c = 'Dental' OR product_Line__c='Vision')];*/
        
        if(!showAllData){
            allList.summaryOppList = filterJanuaryOpportunityData(onLoadOppList);
        }
        else{
            allList.summaryOppList = onLoadOppList;
        }
        //allList.dentalVisionList = dentalVisionList;
        allList.accList = accList;
        allList.rcTypes = recordTypes;
        onLoadDataList.add(allList);
        return onLoadDataList;
    }   
/******************************************************************
* 
Purpose: to get List of Renewal Checklists,Opp line items,Opportunity and send it to details tab.
Parameters: Account Id.
Returns: Wrapper Class.
*******************************************************************
*/  
    @AuraEnabled
    public static returnRenewalChecklistPoc fetchOppLnItemsData(string accId, Boolean showAllData, string currentSS){
        
        system.debug('showAllData = '+showAllData+ ' accId = '+accId);
        returnRenewalChecklistPoc rrcp = new returnRenewalChecklistPoc();
        List<OpportunityLineItem> existingProductsList = new List<OpportunityLineItem>();
        List<OpportunityLineItem> termingProductsList = new List<OpportunityLineItem>();
        List<Opportunity> openMembershipsList = new List<Opportunity>();
        Integer month = system.today().month();
        //String currentSS = month > 1 ? 'SS '+string.valueOf(system.today().year()+1):'SS '+string.valueOf(system.today().year());
        
        List<Opportunity> oppList = [SELECT Id,Name,AccountId,Account.Name FROM Opportunity WHERE AccountId =: String.escapeSingleQuotes(accId) WITH USER_MODE];
        set<Id> oppId = new set<Id>();
        
        for(Opportunity opp:oppList){
            oppId.add(opp.Id);
        }
        List<OpportunityLineItem> productList = [SELECT Id, Name, OpportunityId,productcode,Product_Line__c,Opportunity.Name,Opportunity.Sales_Season1__c,Buyup_Product_Selection__c,
                                                 Opportunity.EffectiveDate__c,Net_Results__c,Opportunity.Status__c,Product2.Name,Existing_Members_Involved_in_the_Bid__c,Product2.ProductCode,
                                                 Sold_Retained_Members__c,Existing_Members_Retained__c,Opportunity.Disposition_Medical__c,Opportunity.Disposition_Dental__c,
                                                 Opportunity.Disposition_Vision__c,Opportunity.Disposition_Pharmacy__c,Opportunity.Disposition_Other__c,Opportunity.Sales_Stage_Medical__c,
                                                 Opportunity.Sales_Stage_Pharmacy__c,Opportunity.Sales_Stage_Dental__c,Opportunity.Sales_Stage_Vision__c,Opportunity.Sales_Stage_Other__c,Disposition_Other_Buy_Up_Programs__c
                                                 FROM OpportunityLineItem WHERE OpportunityId=:oppId AND Net_Results__c != 0 AND Product2.Name != 'Total' WITH USER_MODE ORDER BY product_Line__c,Product2.Name];
        
        List<Opportunity> tempOpenMembershipsList = [SELECT Id,Name,Sales_Season1__c,Status__c,AccountId,Account.Name,EffectiveDate__c FROM Opportunity WHERE AccountId=:String.escapeSingleQuotes(accId) WITH USER_MODE];
        
        
        List<Renewal_Checklist__c>renewalCheckListData = [SELECT Id,Sales_Season__c, Name,high_performing_network_Write_In__c, Payment_Integrity_Bundle_Write_In__c,
                                                          X3rd_Party_Stop_Loss_Write_In__c, PPO_Network_Access_Write_In__c, Company__c, Offshore_Provisions_Write_In__c, 
                                                          High_performing_network__c,Payment_Integrity_Bundle__c, X3rd_Party_Stop_Loss__c, PPO_Network_Access__c,
                                                          High_performing_network_Additional__c,Offshore_Provisions__c,Additional_Comments__c,PGs_confirmed__c,PGs_confirmed_Write_In__c,
                                                          Renewal_Checklist_Validated_By__r.Name,Renewal_Checklist_Validated_Date__c, Change_to_OON_Program__c, Change_to_OON_Program_Write_In__c,
                                                          Payment_Integrity_Bundles__c, Pre_Pay_Status__c, Post_Pay_Status__c, Subrogation_Status__c, Coordination_of_Benefits_Status__c,
                                                          Itemized_Bill_Review_Status__c, Focused_Claim_Review_Status__c, Third_Party_Liability_Recovery_Subro_S__c, Third_Party_Liability_Recovery_ICC_Sta__c, 
                                                          Advanced_Analytic_and_Recovery_Service_S__c, Claims_Tracking_and_Validation_CTV_St__c, Pre_Pay_Rate__c, Post_Pay_Rate__c, Subrogation_Rate__c, 
                                                          Coordination_of_Benefits_Rate__c, Payment_Policy_Rate__c,Payment_Policy_Status__c, Prospective_Fraud_Abuse_Rate__c, Prospective_Fraud_Abuse_Status__c,
                                                          Retrospective_Fraud_Abuse_Rate__c, Retrospective_Fraud_Abuse_Status__c, Enhanced_Fraud_Abuse_CCD_Status__c,Enhanced_Fraud_Abuse_CCD_Rate__c,
                                                          EDC_Analyzer_Rate__c, EDC_Analyzer_Status__c, Itemized_Bill_Review_Rate__c, Focused_Claim_Review_Rate__c, Hospital_Bill_Audit_Rate__c, Hospital_Bill_Audit_Status__c,
                                                          Credit_Balance_Recovery_Services_Status__c, Credit_Balance_Recovery_Services_Rate__c, Third_Party_Liability_Recovery_Subro_R__c, Third_Party_Liability_Recovery_ICC_Rat__c,
                                                          Advanced_Analytic_and_Recovery_Service_R__c, Claims_Tracking_and_Validation_CTV_Rt__c, Supplemental_Compensation_Payee__c, 
                                                          Payment_Integrity_Bundles_Surest__c, Surest_Coordination_of_Benefits_Rate__c,Surest_Coordination_of_Benefits_Status__c,Surest_Credit_Balance_Recovery_Prgm_Rate__c,Surest_CTV_Audit_Rate__c,
                                                          Surest_CTV_Audit_Status__c, Surest_Fraud_Waste_and_Abuse_Mgmt_Prgrm__c, Surest_Post_Pay_Rate__c, Surest_Post_Pay_Status__c, Surest_Pre_Pay_Rate__c,Surest_Pre_Pay_Status__c, 
                                                          Surest_Subrogation_Rate__c, Surest_Subrogation_Services_Rate__c, Surest_Subrogation_Status__c, Behavioral_Care_Connect_5_Day_Access__c,Enhanced_Case_Management__c,X24_7_in_the_moment_and_crisis_support__c,
                                                          Family_Support__c,Child_and_Family_Behavioral_Coaching__c,Virtual_Behavioral_Coaching_for_adults__c,Care_Explorer__c,Substance_Use_Disorder_Helpline__c,Behavioral_Health_Virtual_Visits__c,National_Network_Outpatient_Inpatient_UM__c,
                                                          Case_Management__c,Calm_Health_app__c,Join_Surest_Go_Live_Date__c,Join_Surest_URL__c,Access_Code__c,Structure_Changes_Write_In__c,Structure_Changes__c,Changes_in_Rx__c,Rx_Changes_Write_In__c,Sures_Benefit_Plan__c,Surest_Benefit_Plan_Write_In__c,
                                                          Benefit_Admin_Vendor_Write_In__c,Benefit_Admin_Vendor_changes__c,Client_Specific_Programs_Write_In__c,Client_Specific_Programs__c,Surest_Product_Change_Write_In__c,Surest_Product_Change__c,
                                                          Employee_Assistance_Program_Name__c,Pharmacy_Benefit_Administrator_Name__c,Pharmacy_Benefit_Administrator_Phone__c,Employee_Assistance_Program_Phone__c,Transplant_Resource_Services__c,Utilization_Management__c,BHU_Management_ABA_UM__c,Specialty_Guidance_Program_CPSurest__c,Cancer_Guidance_Program_CPSurest__c,
                                                            Surest_Case_Management_CM_CPSurest__c,Optum_Physical_Health_Network__c,Optum_Behavioral_Network__c,Ardynn_Surest_Cancer_Advocacy__c,Asthma_Disease_Management__c,Bariatric_Resource_Services__c,Calm_Health__c,Canary_Surest_Disease_Management__c,Cancer_Resource_Services__c,Cancer_Support_Program_CSP__c,
                                                            Clinical_Prgm_2nd_MD__c,Comprehensive_Kidney_Solutions__c,COPD_Disease_Management__c,Coronary_Artery_Disease_Management__c,Diabetes_Disease_Management__c,Emotional_Wellbeing_Solutions__c,Family_Building_Dual_Clients_only__c,Fertility_Solutions__c,Fertility_Solutions_Plus_Dual_Clients__c,Heart_Failure_Disease_Management__c,
                                                            Kaia_Optum__c,Level2_Assured_Value__c,Maternity_21_month_program__c,Maven_12_month_program__c,Menopause_Dual_Clients_Only_1K_EE_s__c,Neonatal_Resource_Services__c,One_Pass_Select__c,Optum_Engage__c,Pacify_Surest_Maternity__c,Parenting_Pediatrics__c,Pivot_Surest_Smoking_Cessation__c,Progyny_Surest_Fertility__c,Pump_Carry_Dual_Clients_only_1k_EE_s__c,
                                                            Pump_Check_Dual_Clients_only_1k_EE_s__c,Pump_Post_Dual_Clients_only_1k_EE_s__c,Quit_for_Life_Dual_Clients_Only__c,Real_Appeal_Optum__c,UHC_Rewards__c,Virta_Diabetes__c,Virta_Obesity__c,Virta_Pre_Diabetes__c,Wallet_Dual_Clients_Only_1K_EE_s__c,Congenital_Heart_Disease__c,Wellness_Wellos_ASO__c,One_Pass_Subsidized__c,CPW__c,Sword__c,Kindbody__c,
                                                            Optum_Engage_Elite__c,Optum_Engage_Select__c,UHC_Rewards_Custom__c,UHC_Rewards_Premium__c,Doula_Benefit_Support__c,Total_Weight_Support_with_Real_Appeal_Rx__c,Open_Enrollment_Date__c,UHC_Rewards_Client_Fulfilled_Survey__c,UHC_Rewards_Client_Fulfilled_Custom__c,Cap_Value__c,Amount__c,Additional_Comments_Naviguard__c,Amount_Type__c,Cap_Type__c,Cap_Category__c,
                                                            UHC_Hub_Access_Hope_APO_EAR__c,UHC_Hub_Access_Hope_APO_Only__c,UHC_Hub_Carrum_Health_Cancer_Care__c,UHC_Hub_Carrum_Health_General__c,UHC_Hub_Carrum_Health_Surgical_Care__c,
                                                            UHC_Hub_Carrum_Substance_Use_Treatment__c,UHC_Hub_Cylinder_GIThrive__c,UHC_Hub_Hazelden_Recovery_Coaching__c,UHC_Hub_Hazelden_Workplace_Portal__c,UHC_Hub_Hello_Heart__c,UHC_Hub_Hinge_Health_Virtual_PT__c,UHC_Hub_Lantern_Employer_Direct_Care__c,
                                                            UHC_Hub_LGC_A1c_Fingerstick_Add_On__c,UHC_Hub_LGC_A1C_HomeKit_Buy_Up__c,UHC_Hub_LGC_A1C_Lab_Visit_Buy_Up__c,UHC_Hub_LGC_A1c_Venipuncture_Add_On__c,UHC_Hub_LGC_Body_Fat__c,UHC_Hub_LGC_Colon_Cancer_Screening_Plus__c,UHC_Hub_LGC_Colon_Cancer_Screening_Prog__c,UHC_Hub_LGC_Diabetes_A1c__c,
                                                            UHC_Hub_LGC_FIT_At_Home_Kit__c,UHC_Hub_LGC_Flu_Shots__c,UHC_Hub_LGC_Health_Prvdr_Screen_Form__c,UHC_Hub_LGC_Heart_Health__c,UHC_Hub_LGC_HPSF_Prov_Med_PAAF__c,UHC_Hub_LGC_KYNS_Full_Lipid_Fingerstick__c,UHC_Hub_LGC_KYNS_Full_Lpd_Venipuncture__c,UHC_Hub_LGC_KYNS_Partl_Lpd_Fingerstick__c,
                                                            UHC_Hub_LGC_Lab_Visit_Full_Lipid_Ven__c,UHC_Hub_LGC_Measure_Waist__c,UHC_Hub_LGC_Waist_Hip_Ratio__c,UHC_Hub_Noom_Dual_Access__c,UHC_Hub_Noom_Dual_Access_DPP__c,UHC_Hub_Noom_Mood__c,UHC_Hub_Noom_Weight__c,UHC_Hub_Noom_Weight_DPP__c,UHC_Hub_Quest_A1c_Fingerstick_Add_On__c,
                                                            UHC_Hub_Quest_A1C_HomeKit_Buy_Up__c,UHC_Hub_Quest_A1C_Lab_Visit_Buy_Up__c,UHC_Hub_Quest_A1c_Venipuncture_Add_On__c,UHC_Hub_Quest_Bilingual_Translator__c,UHC_Hub_Quest_Body_Fat__c,UHC_Hub_Quest_Cotinine_Fingerstick_Add__c,UHC_Hub_Teladoc_Hypertension_Mgmt_Plus__c,
                                                            UHC_Hub_Quest_Cotinine_HomeKit_Buy_Up__c,UHC_Hub_Quest_Cotinine_Lab_Visit_Full__c,UHC_Hub_Quest_Cotinine_Venipuncture_Ad__c,UHC_Hub_Quest_Diabetes_A1c_Home_Kit__c,UHC_Hub_Quest_eGFR_Fingerstick_AddOn__c,UHC_Hub_Quest_eGFR_HomeKit_Buy_Up__c,
                                                            UHC_Hub_Quest_eGFR_Venipuncture_AddOn__c,UHC_Hub_Quest_eGFR_Visit_Add_On__c,UHC_Hub_Quest_Fax_to_Physician__c,UHC_Hub_Quest_Flu_Shots__c,UHC_Hub_Quest_Heart_Health_Home_Kit__c,UHC_Hub_Quest_Hlth_Prvdr_Screening_Form__c,UHC_Hub_Quest_HPSF_Prov_Med_PA__c,
                                                            UHC_Hub_Quest_KYN_Plus_Fingerstick__c,UHC_Hub_Quest_KYNS_Comprehensive__c,UHC_Hub_Quest_KYNS_Full_Lipid_Venipctr__c,UHC_Hub_Quest_KYNS_Full_Lpd_Fingerstick__c,UHC_Hub_Quest_KYNS_Partial_Lpd_Fingerst__c,UHC_Hub_Quest_Lab_Visit_Comp_Veni__c,
                                                            UHC_Hub_Quest_Lab_Visit_Full_Lipid_Veni__c,UHC_Hub_Quest_Measure_Waist__c,UHC_Hub_Quest_Privacy_Screens__c,UHC_Hub_Quest_PSA_Fingerstick_Add_On__c,UHC_Hub_Quest_Waist_Hip_Ratio__c,UHC_Hub_Teladoc_Advanced_Weight_Mgmt__c,UHC_Hub_Teladoc_Chronic_Mgmt_Plus_Bundl__c,
                                                            UHC_Hub_Teladoc_Diabetes_Mgmt_Plus_Bund__c,UHC_Hub_Teladoc_Diabetes_Mgmt_Standalon__c,UHC_Hub_Teladoc_Hypertension_Mgmt_Stand__c,UHC_Hub_Teladoc_Prediabetes_Mgmt_Plus__c,UHC_Hub_Weight_Watchers__c,UHC_Hub_Wellthy__c,UHC_Hub_Wondr_Health__c,Surest_Member_Svcs_Clinical_Advocacy__c,Surest_Standard_Communications__c
                                                            FROM Renewal_Checklist__c WHERE Company__c =: String.escapeSingleQuotes(accId) AND Sales_Season__c =:currentSS WITH USER_MODE ];
        system.debug('renewalCheckListData = '+renewalCheckListData);

        String yearPart = currentSS.replace('SS ', '');
        Integer yearValue = Integer.valueOf(yearPart);
        String lastSS = 'SS ' + String.valueOf(yearValue - 1);

        List<Renewal_Checklist__c> lastYearChecklist = [SELECT Id,Sales_Season__c, Name,Transplant_Resource_Services__c,Utilization_Management__c,BHU_Management_ABA_UM__c,Specialty_Guidance_Program_CPSurest__c,Cancer_Guidance_Program_CPSurest__c,
                                                            Surest_Case_Management_CM_CPSurest__c,Optum_Physical_Health_Network__c,Optum_Behavioral_Network__c,Ardynn_Surest_Cancer_Advocacy__c,Asthma_Disease_Management__c,Bariatric_Resource_Services__c,Calm_Health__c,Canary_Surest_Disease_Management__c,Cancer_Resource_Services__c,Cancer_Support_Program_CSP__c,
                                                            Clinical_Prgm_2nd_MD__c,Comprehensive_Kidney_Solutions__c,COPD_Disease_Management__c,Coronary_Artery_Disease_Management__c,Diabetes_Disease_Management__c,Emotional_Wellbeing_Solutions__c,Family_Building_Dual_Clients_only__c,Fertility_Solutions__c,Fertility_Solutions_Plus_Dual_Clients__c,Heart_Failure_Disease_Management__c,
                                                            Kaia_Optum__c,Level2_Assured_Value__c,Maternity_21_month_program__c,Maven_12_month_program__c,Menopause_Dual_Clients_Only_1K_EE_s__c,Neonatal_Resource_Services__c,One_Pass_Select__c,Optum_Engage__c,Pacify_Surest_Maternity__c,Parenting_Pediatrics__c,Pivot_Surest_Smoking_Cessation__c,Progyny_Surest_Fertility__c,Pump_Carry_Dual_Clients_only_1k_EE_s__c,
                                                            Pump_Check_Dual_Clients_only_1k_EE_s__c,Pump_Post_Dual_Clients_only_1k_EE_s__c,Quit_for_Life_Dual_Clients_Only__c,Real_Appeal_Optum__c,UHC_Rewards__c,Virta_Diabetes__c,Virta_Obesity__c,Virta_Pre_Diabetes__c,Wallet_Dual_Clients_Only_1K_EE_s__c,Congenital_Heart_Disease__c,Wellness_Wellos_ASO__c,One_Pass_Subsidized__c,CPW__c,Kindbody__c,Sword__c,
                                                            Optum_Engage_Elite__c,Optum_Engage_Select__c,UHC_Rewards_Custom__c,UHC_Rewards_Premium__c,Doula_Benefit_Support__c,Total_Weight_Support_with_Real_Appeal_Rx__c,Open_Enrollment_Date__c,UHC_Rewards_Client_Fulfilled_Survey__c,UHC_Rewards_Client_Fulfilled_Custom__c,Cap_Value__c,Amount__c,Additional_Comments_Naviguard__c,Amount_Type__c,Cap_Type__c,Cap_Category__c,
                                                            UHC_Hub_Access_Hope_APO_EAR__c,UHC_Hub_Access_Hope_APO_Only__c,UHC_Hub_Carrum_Health_Cancer_Care__c,UHC_Hub_Carrum_Health_General__c,UHC_Hub_Carrum_Health_Surgical_Care__c,
                                                            UHC_Hub_Carrum_Substance_Use_Treatment__c,UHC_Hub_Cylinder_GIThrive__c,UHC_Hub_Hazelden_Recovery_Coaching__c,UHC_Hub_Hazelden_Workplace_Portal__c,UHC_Hub_Hello_Heart__c,UHC_Hub_Hinge_Health_Virtual_PT__c,UHC_Hub_Lantern_Employer_Direct_Care__c,
                                                            UHC_Hub_LGC_A1c_Fingerstick_Add_On__c,UHC_Hub_LGC_A1C_HomeKit_Buy_Up__c,UHC_Hub_LGC_A1C_Lab_Visit_Buy_Up__c,UHC_Hub_LGC_A1c_Venipuncture_Add_On__c,UHC_Hub_LGC_Body_Fat__c,UHC_Hub_LGC_Colon_Cancer_Screening_Plus__c,UHC_Hub_LGC_Colon_Cancer_Screening_Prog__c,UHC_Hub_LGC_Diabetes_A1c__c,
                                                            UHC_Hub_LGC_FIT_At_Home_Kit__c,UHC_Hub_LGC_Flu_Shots__c,UHC_Hub_LGC_Health_Prvdr_Screen_Form__c,UHC_Hub_LGC_Heart_Health__c,UHC_Hub_LGC_HPSF_Prov_Med_PAAF__c,UHC_Hub_LGC_KYNS_Full_Lipid_Fingerstick__c,UHC_Hub_LGC_KYNS_Full_Lpd_Venipuncture__c,UHC_Hub_LGC_KYNS_Partl_Lpd_Fingerstick__c,
                                                            UHC_Hub_LGC_Lab_Visit_Full_Lipid_Ven__c,UHC_Hub_LGC_Measure_Waist__c,UHC_Hub_LGC_Waist_Hip_Ratio__c,UHC_Hub_Noom_Dual_Access__c,UHC_Hub_Noom_Dual_Access_DPP__c,UHC_Hub_Noom_Mood__c,UHC_Hub_Noom_Weight__c,UHC_Hub_Noom_Weight_DPP__c,UHC_Hub_Quest_A1c_Fingerstick_Add_On__c,
                                                            UHC_Hub_Quest_A1C_HomeKit_Buy_Up__c,UHC_Hub_Quest_A1C_Lab_Visit_Buy_Up__c,UHC_Hub_Quest_A1c_Venipuncture_Add_On__c,UHC_Hub_Quest_Bilingual_Translator__c,UHC_Hub_Quest_Body_Fat__c,UHC_Hub_Quest_Cotinine_Fingerstick_Add__c,UHC_Hub_Teladoc_Hypertension_Mgmt_Plus__c,
                                                            UHC_Hub_Quest_Cotinine_HomeKit_Buy_Up__c,UHC_Hub_Quest_Cotinine_Lab_Visit_Full__c,UHC_Hub_Quest_Cotinine_Venipuncture_Ad__c,UHC_Hub_Quest_Diabetes_A1c_Home_Kit__c,UHC_Hub_Quest_eGFR_Fingerstick_AddOn__c,UHC_Hub_Quest_eGFR_HomeKit_Buy_Up__c,
                                                            UHC_Hub_Quest_eGFR_Venipuncture_AddOn__c,UHC_Hub_Quest_eGFR_Visit_Add_On__c,UHC_Hub_Quest_Fax_to_Physician__c,UHC_Hub_Quest_Flu_Shots__c,UHC_Hub_Quest_Heart_Health_Home_Kit__c,UHC_Hub_Quest_Hlth_Prvdr_Screening_Form__c,UHC_Hub_Quest_HPSF_Prov_Med_PA__c,
                                                            UHC_Hub_Quest_KYN_Plus_Fingerstick__c,UHC_Hub_Quest_KYNS_Comprehensive__c,UHC_Hub_Quest_KYNS_Full_Lipid_Venipctr__c,UHC_Hub_Quest_KYNS_Full_Lpd_Fingerstick__c,UHC_Hub_Quest_KYNS_Partial_Lpd_Fingerst__c,UHC_Hub_Quest_Lab_Visit_Comp_Veni__c,
                                                            UHC_Hub_Quest_Lab_Visit_Full_Lipid_Veni__c,UHC_Hub_Quest_Measure_Waist__c,UHC_Hub_Quest_Privacy_Screens__c,UHC_Hub_Quest_PSA_Fingerstick_Add_On__c,UHC_Hub_Quest_Waist_Hip_Ratio__c,UHC_Hub_Teladoc_Advanced_Weight_Mgmt__c,UHC_Hub_Teladoc_Chronic_Mgmt_Plus_Bundl__c,
                                                            UHC_Hub_Teladoc_Diabetes_Mgmt_Plus_Bund__c,UHC_Hub_Teladoc_Diabetes_Mgmt_Standalon__c,UHC_Hub_Teladoc_Hypertension_Mgmt_Stand__c,UHC_Hub_Teladoc_Prediabetes_Mgmt_Plus__c,UHC_Hub_Weight_Watchers__c,UHC_Hub_Wellthy__c,UHC_Hub_Wondr_Health__c 
                                                            FROM Renewal_Checklist__c WHERE Company__c =: String.escapeSingleQuotes(accId) AND Sales_Season__c =:lastSS WITH USER_MODE ];
        
        List<Service_AMT__c> amtList = [SELECT Id,Email__c,Contact_Role__c,Case_Management_End_Date__c,Name FROM Service_AMT__c WHERE Contact_Role__c IN ('Client Manager','Client Management Consultant') 
                                        AND Company__c =: accId AND (Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= TODAY) WITH USER_MODE];
        
        for(OpportunityLineItem med:productList){
            if(med.Opportunity.Sales_Season1__c == currentSS  && med.Net_Results__c > 0){
                existingProductsList.add(med);
            }
            else if(med.Opportunity.Sales_Season1__c == currentSS && med.Net_Results__c < 0){
                termingProductsList.add(med);
            }
        }
        
        for(Opportunity openMemb:tempOpenMembershipsList){
            if((openMemb.Sales_Season1__c == currentSS && openMemb.Status__c =='Open')){
                openMembershipsList.add(openMemb);
            }
        } 

        List<Service_AMT__c> amtListSurest = [SELECT Id,Email__c,Contact_Role__c,Case_Management_End_Date__c,Name FROM Service_AMT__c WHERE Contact_Role__c IN ('Client Manager','Surest Client Manager','Surest Account Partner') 
        AND Company__c =: accId AND (Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= TODAY) WITH USER_MODE];

            List<Policy_Information__c> policyList = [SELECT Id,Name,Policy__c, Policy_Type__c,Policy_Status__c, Surest__c from Policy_Information__c WHERE Company__c =: accId AND Surest__c = true AND Policy_Type__c INCLUDES ('Medical') AND Policy_Status__c = 'Active' WITH USER_MODE];

        List<Product2> otherBuyUpProductList = [SELECT Id,Name,Surest_Applicable_Products__c,ProductCode,Product_Category__c,Product_Line__c FROM Product2 where Surest_Applicable_Products__c = 'Available for Surest only with UNET' WITH USER_MODE];

        if(lastYearChecklist.isEmpty()){

            Sold_Case_Checklist__c scc = [SELECT Id,Membership_Activity__r.Sales_Season1__c, Name,Membership_Activity__C,Membership_Activity__r.AccountId,Transplant_Resource_Services__c,Utilization_Management__c,BHU_Management_ABA_UM__c,Specialty_Guidance_Program_CPSurest__c,Cancer_Guidance_Program_CPSurest__c,
                                    Surest_Case_Management_CM_CPSurest__c,Optum_Physical_Health_Network__c,Optum_Behavioral_Network__c,Ardynn_Surest_Cancer_Advocacy__c,Asthma_Disease_Management__c,Bariatric_Resource_Services__c,Calm_Health__c,Canary_Surest_Disease_Management__c,Cancer_Resource_Services__c,Cancer_Support_Program_CSP__c,
                                    Clinical_Prgm_2nd_MD__c,Comprehensive_Kidney_Solutions__c,COPD_Disease_Management__c,Coronary_Artery_Disease_Management__c,Diabetes_Disease_Management__c,Emotional_Wellbeing_Solutions__c,Family_Building_Dual_Clients_only__c,Fertility_Solutions__c,Fertility_Solutions_Plus_Dual_Clients__c,Heart_Failure_Disease_Management__c,
                                    Kaia_Optum__c,Level2_Assured_Value__c,Maternity_21_month_program__c,Maven_12_month_program__c,Menopause_Dual_Clients_Only_1K_EE_s__c,Neonatal_Resource_Services__c,One_Pass_Select__c,Optum_Engage__c,Pacify_Surest_Maternity__c,Parenting_Pediatrics__c,Pivot_Surest_Smoking_Cessation__c,Progyny_Surest_Fertility__c,Pump_Carry_Dual_Clients_only_1k_EE_s__c,
                                    Pump_Check_Dual_Clients_only_1k_EE_s__c,Pump_Post_Dual_Clients_only_1k_EE_s__c,Quit_for_Life_Dual_Clients_Only__c,Real_Appeal_Optum__c,UHC_Rewards__c,Virta_Diabetes__c,Virta_Obesity__c,Virta_Pre_Diabetes__c,Wallet_Dual_Clients_Only_1K_EE_s__c,Congenital_Heart_Disease__c,Wellness_Wellos_ASO__c,One_Pass_Subsidized__c,Kindbody__c,Sword__c,
                                    Optum_Engage_Elite__c,Optum_Engage_Select__c,UHC_Rewards_Custom__c,UHC_Rewards_Premium__c,Total_Weight_Support_with_Real_Appeal_Rx__c,Doula_Benefit_Support__c,Wellness_Rally_Engage_Buy_Up__c,Wellness_Rally_Premium_Buy_Up__c,CPW__c,UHC_Rewards_Client_Fulfilled_Survey__c,UHC_Rewards_Client_Fulfilled_Custom__c,Cap_Value__c,Amount__c,Additional_Comments__c,Amount_Type__c,Cap_Type__c,Cap_Category__c,
                                    UHC_Hub_Carrum_Substance_Use_Treatment__c,UHC_Hub_Cylinder_GIThrive__c,UHC_Hub_Hazelden_Recovery_Coaching__c,UHC_Hub_Hazelden_Workplace_Portal__c,UHC_Hub_Hello_Heart__c,UHC_Hub_Hinge_Health_Virtual_PT__c,UHC_Hub_Lantern_Employer_Direct_Care__c,
                                    UHC_Hub_LGC_A1c_Fingerstick_Add_On__c,UHC_Hub_LGC_A1C_HomeKit_Buy_Up__c,UHC_Hub_LGC_A1C_Lab_Visit_Buy_Up__c,UHC_Hub_LGC_A1c_Venipuncture_Add_On__c,UHC_Hub_LGC_Body_Fat__c,UHC_Hub_LGC_Colon_Cancer_Screening_Plus__c,UHC_Hub_LGC_Colon_Cancer_Screening_Prog__c,UHC_Hub_LGC_Diabetes_A1c__c,
                                    UHC_Hub_LGC_FIT_At_Home_Kit__c,UHC_Hub_LGC_Flu_Shots__c,UHC_Hub_LGC_Health_Prvdr_Screen_Form__c,UHC_Hub_LGC_Heart_Health__c,UHC_Hub_LGC_HPSF_Prov_Med_PAAF__c,UHC_Hub_LGC_KYNS_Full_Lipid_Fingerstick__c,UHC_Hub_LGC_KYNS_Full_Lpd_Venipuncture__c,UHC_Hub_LGC_KYNS_Partl_Lpd_Fingerstick__c,
                                    UHC_Hub_LGC_Lab_Visit_Full_Lipid_Ven__c,UHC_Hub_LGC_Measure_Waist__c,UHC_Hub_LGC_Waist_Hip_Ratio__c,UHC_Hub_Noom_Dual_Access__c,UHC_Hub_Noom_Dual_Access_DPP__c,UHC_Hub_Noom_Mood__c,UHC_Hub_Noom_Weight__c,UHC_Hub_Noom_Weight_DPP__c,UHC_Hub_Quest_A1c_Fingerstick_Add_On__c,
                                    UHC_Hub_Quest_A1C_HomeKit_Buy_Up__c,UHC_Hub_Quest_A1C_Lab_Visit_Buy_Up__c,UHC_Hub_Quest_A1c_Venipuncture_Add_On__c,UHC_Hub_Quest_Bilingual_Translator__c,UHC_Hub_Quest_Body_Fat__c,UHC_Hub_Quest_Cotinine_Fingerstick_Add__c,UHC_Hub_Teladoc_Hypertension_Mgmt_Plus__c,
                                    UHC_Hub_Quest_Cotinine_HomeKit_Buy_Up__c,UHC_Hub_Quest_Cotinine_Lab_Visit_Full__c,UHC_Hub_Quest_Cotinine_Venipuncture_Ad__c,UHC_Hub_Quest_Diabetes_A1c_Home_Kit__c,UHC_Hub_Quest_eGFR_Fingerstick_AddOn__c,UHC_Hub_Quest_eGFR_HomeKit_Buy_Up__c,
                                    UHC_Hub_Quest_eGFR_Venipuncture_AddOn__c,UHC_Hub_Quest_eGFR_Visit_Add_On__c,UHC_Hub_Quest_Fax_to_Physician__c,UHC_Hub_Quest_Flu_Shots__c,UHC_Hub_Quest_Heart_Health_Home_Kit__c,UHC_Hub_Quest_Hlth_Prvdr_Screening_Form__c,UHC_Hub_Quest_HPSF_Prov_Med_PA__c,
                                    UHC_Hub_Quest_KYN_Plus_Fingerstick__c,UHC_Hub_Quest_KYNS_Comprehensive__c,UHC_Hub_Quest_KYNS_Full_Lipid_Venipctr__c,UHC_Hub_Quest_KYNS_Full_Lpd_Fingerstick__c,UHC_Hub_Quest_KYNS_Partial_Lpd_Fingerst__c,UHC_Hub_Quest_Lab_Visit_Comp_Veni__c,
                                    UHC_Hub_Quest_Lab_Visit_Full_Lipid_Veni__c,UHC_Hub_Quest_Measure_Waist__c,UHC_Hub_Quest_Privacy_Screens__c,UHC_Hub_Quest_PSA_Fingerstick_Add_On__c,UHC_Hub_Quest_Waist_Hip_Ratio__c,UHC_Hub_Teladoc_Advanced_Weight_Mgmt__c,UHC_Hub_Teladoc_Chronic_Mgmt_Plus_Bundl__c,
                                    UHC_Hub_Teladoc_Diabetes_Mgmt_Plus_Bund__c,UHC_Hub_Teladoc_Diabetes_Mgmt_Standalon__c,UHC_Hub_Teladoc_Hypertension_Mgmt_Stand__c,UHC_Hub_Teladoc_Prediabetes_Mgmt_Plus__c,UHC_Hub_Weight_Watchers__c,UHC_Hub_Wellthy__c,UHC_Hub_Wondr_Health__c 
                                    FROM  Sold_Case_Checklist__c WHERE Membership_Activity__r.Sales_Season1__c =:lastSS AND Membership_Activity__r.AccountId =: String.escapeSingleQuotes(accId) AND CPW__c = true WITH USER_MODE LIMIT 1];
            
            if(scc!=null){
                Map<String, SObjectField> pccFields = Renewal_Checklist__c.SObjectType.getDescribe().fields.getMap();
                Map<String, SObjectField> sccFields = Sold_Case_Checklist__c.SObjectType.getDescribe().fields.getMap();
                Renewal_Checklist__c pccRecord = new Renewal_Checklist__c();
                for(String fieldName : pccFields.keySet()){
                   if(sccFields.containsKey(fieldName) && scc.get(fieldName) != null){
                        pccRecord.put(fieldName, scc.get(fieldName));
                    }
                }
                lastYearChecklist.add(pccRecord);
            }
        }

        if(!showAllData){
            system.debug('inside !showAllData');
            existingProductsList = filterJanuaryLineItemData(existingProductsList);
            termingProductsList = filterJanuaryLineItemData(termingProductsList);
            openMembershipsList = filterJanuaryOpportunityData(openMembershipsList);
        }
        
        rrcp.detailExistingProductsList = sortProductsList(existingProductsList);
        rrcp.detailTermingProductsList = sortProductsList(termingProductsList);
        rrcp.openMembership = openMembershipsList;
        rrcp.renewalCheckListData = renewalCheckListData;
        rrcp.lastYearChecklist = lastYearChecklist;
        //rrcp.dentalVision = dentalVisionList;
        rrcp.serviceAmtList = amtList;
        rrcp.timeZone = userTimeZone;
        // wrapperClassList.add(rrcp);
        rrcp.serviceAmt = amtListSurest; 
        rrcp.policyInfoList = policyList;
        rrcp.productInfoList = otherBuyUpProductList;
        
        return rrcp;
    }
    
    
    
    public static List<OpportunityLineItem> filterJanuaryLineItemData(List<OpportunityLineItem> listToFilter){
        List<OpportunityLineItem> listToReturn = new List<OpportunityLineItem>();
        if(!listToFilter.isEmpty()){
            for(OpportunityLineItem record:listToFilter){
                if(record.Opportunity.EffectiveDate__c.month() == 1){
                    listToReturn.add(record);
                }
            }
        }
        return listToReturn;
    }
    
    public static List<Opportunity> filterJanuaryOpportunityData(List<Opportunity> listToFilter){
        List<Opportunity> listToReturn = new List<Opportunity>();
        
         if(!listToFilter.isEmpty()){
            for(Opportunity record:listToFilter){
                if(record.EffectiveDate__c != null && record.EffectiveDate__c.month() == 1){
                    listToReturn.add(record);
                }
            }
        }
        return listToReturn;
    }
    
    /******************************************************************
* 
Purpose: To save renewal checklist data to backend.
Parameters: map of field api name vs field value and Account Id.
Returns: Nothing.
*******************************************************************
*/      
    // Map<string,string>
    @AuraEnabled
    public static void saveRenewalData(Renewal_Checklist__c valuesToBackend,Id accId, string currentSS){
        
        List<Renewal_Checklist__c> renewalChecklist = [SELECT Id,  high_performing_network_Write_In__c, Payment_Integrity_Bundle_Write_In__c,X3rd_Party_Stop_Loss_Write_In__c, PPO_Network_Access_Write_In__c, Offshore_Provisions_Write_In__c, High_performing_network__c,Payment_Integrity_Bundle__c, X3rd_Party_Stop_Loss__c, PPO_Network_Access__c,High_performing_network_Additional__c,Offshore_Provisions__c,Additional_Comments__c,PGs_confirmed__c,PGs_confirmed_Write_In__c,Change_to_OON_Program__c, Change_to_OON_Program_Write_In__c FROM Renewal_Checklist__c WHERE Company__c =: accId AND Sales_Season__c=:currentSS WITH USER_MODE ];
        
        if(renewalChecklist.size()>0){
            /*for (String fieldApi : valuesToBackend.keySet()) {
                renewalChecklist[0].put(fieldApi, valuesToBackend.get(fieldApi));
            }*/
            //update as USER renewalChecklist;
            valuesToBackend.Id = renewalChecklist[0].Id;
            valuesToBackend.Sales_Season__c = currentSS;
            update as USER valuesToBackend; 
         
        }
        else{
            /*Renewal_Checklist__c newRenewalChecklist = new Renewal_Checklist__c();
            newRenewalChecklist.Company__c = accId;
            List<Renewal_Checklist__c> listToInsert = new List<Renewal_Checklist__c>();
            
            for (String fieldApi : valuesToBackend.keySet()) {
                newRenewalChecklist.put(fieldApi, valuesToBackend.get(fieldApi));
            }
            listToInsert.add(newRenewalChecklist);
            insert as USER listToInsert;*/
            
            valuesToBackend.Company__c = accId;
            valuesToBackend.Sales_Season__c = currentSS;
            insert as USER valuesToBackend;
        }  
    }
    
    
    /******************************************************************
* 
Purpose: To save validated data in renewal checklist obj.
Parameters: Account Id.
Returns: List of renewal checklist.
*******************************************************************
*/      
    @AuraEnabled
    public static Boolean sceValidation(Id accId, List<String> selectedEmails, Boolean showAllData, string currentSS){
        
        List<Renewal_Checklist__c> renewalList = [SELECT Id,Renewal_Checklist_Validated_By__c,Renewal_Checklist_Validated_Date__c FROM Renewal_Checklist__c WHERE Company__c =: accId AND Sales_Season__c=:currentSS WITH USER_MODE];
        List<Renewal_Checklist__c> newRenewalList = new List<Renewal_Checklist__c>();      
        
        if(renewalList.size()>0){
            renewalList[0].Renewal_Checklist_Validated_Date__c = system.now().format();
            renewalList[0].Renewal_Checklist_Validated_By__c = userId;
            update as USER renewalList;
        }
        else{
            Renewal_Checklist__c newRenewalRecord = new Renewal_Checklist__c();
            newRenewalRecord.Sales_Season__c =currentSS;
            newRenewalRecord.Company__c = accId;
            newRenewalRecord.Renewal_Checklist_Validated_Date__c =  system.now().format();
            newRenewalRecord.Renewal_Checklist_Validated_By__c =  userId;
            newRenewalList.add(newRenewalRecord);
            insert as USER newRenewalList;
        }
        if(selectedEmails != null && !selectedEmails.isEmpty()){
            renewalChecklistCls.sendChecklistToSelectedEmails(accId,selectedEmails,showAllData,currentSS);
        }
        else {
            renewalChecklistCls.generateAndSendRenewalChecklistPdf(accId, showAllData,currentSS); //SAMARTH           
        }
       
        return true;   
        
    }

    @AuraEnabled(cacheable=true)
    public static List<EmailOption> getValidationEmails(Id accId) {

        List<EmailOption> options = new List<EmailOption>();

        Account acc = [ SELECT Name, CM_SCE__r.Email, Surest_Members__c FROM Account WHERE Id = :accId WITH USER_MODE];

        if(acc.CM_SCE__r != null && String.isNotBlank(acc.CM_SCE__r.Email)) {
            options.add(new EmailOption('SCE', acc.CM_SCE__r.Email ));
        }
        
        List<Service_AMT__c> emailList = [SELECT Email__c,Contact_Role__c,Name FROM Service_AMT__c WHERE Contact_Role__c IN ('Surest Client Manager','Client Manager', 'Client Management Consultant','UMR Client Manager','Underwriting Consultant') AND Company__c = :accId AND (Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= TODAY) WITH USER_MODE];

        for(Service_AMT__c amt : emailList){
            options.add(new EmailOption(amt.Contact_Role__c, amt.Email__c ));
        }

        if(acc.Surest_Members__c != null && acc.Surest_Members__c > 0 && String.isNotBlank(Label.PharmacyOpsEmail)) {
             options.add(new EmailOption(Label.PharmacyOpsEmail, Label.PharmacyOpsEmail ));
        }

         String labelEmails = System.Label.Surest_Fixed_Emails;
         if(String.isNotBlank(labelEmails)) {
            for(String email : labelEmails.split(';')) {
                email = email.trim();
                options.add(new EmailOption(email, email));
            }
         }

        return options;
    }

    public class EmailOption {
        @AuraEnabled public String label;
        @AuraEnabled public String value;

        public EmailOption(String label, String value){
            this.label = label;
            this.value = value;
        }
    }
    
    @future(callout=true)
    public static void generateAndSendRenewalChecklistPdf(String recordId, Boolean showAllData, string currentSS){
        SavePoint sp;
        try{
            EmailTemplate et = [SELECT Id, HtmlValue, Subject  FROM EmailTemplate WHERE DeveloperName = 'Renewal_Checklist_Validation_Email' LIMIT 1 ];
            
            List<Service_AMT__c> emailList = [SELECT Id,Email__c,Contact_Role__c,Name FROM Service_AMT__c WHERE Contact_Role__c IN ('Surest Client Manager','Client Manager','Client Management Consultant','UMR Client Manager', 'Underwriting Consultant') AND Company__c =: recordId AND (Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= TODAY) WITH USER_MODE];
            
            Account[] accList = [SELECT Id,Name,CM_SCE__c,CM_SCE__r.Name,CM_SCE__r.Email,Surest_Members__c FROM Account WHERE Id =: recordId WITH USER_MODE];
            
            String AccountName = accList[0].Name;
            String cmSceEmailId;
            String cmsce;
            if(accList[0].CM_SCE__c != null && accList[0].CM_SCE__r.Name != null && String.isNotBlank(accList[0].CM_SCE__r.Email)) {
                 cmsce = accList[0].CM_SCE__r.Name;
                 cmSceEmailId = accList[0].CM_SCE__r.Email;
            }
            String[] emailIdList = new List<String>();
            Double surestMembers = accList[0].Surest_Members__c;
            String pharmacyOpsEmail = Label.PharmacyOpsEmail;
            
            for(Service_AMT__c AMT:emailList){
                emailIdList.add(AMT.Email__c);
            }
            
            //CR - 3826 Vignesh
            if (surestMembers > 0) {
                emailIdList.add(pharmacyOpsEmail);
                emailIdList.add(cmSceEmailId);
            } else {
                emailIdList.add(cmSceEmailId);
            }
            
            PageReference pdf = Page.RenewalChecklistPdf;
            pdf.getParameters().put('recordId',recordId);
            pdf.getParameters().put('currentSS',currentSS);
            pdf.getParameters().put('showAllData',String.valueOf(showAllData));
            pdf.setRedirect(true);
            Blob blobFile;
            if(!Test.isRunningTest()){
                blobFile = pdf.getContent();
            }else{
                blobFile = blob.valueOf('Unit.Test');
            }         
            String fileName = 'Product Change Checklist - '+AccountName+' - '+System.now().format('MdYYYY')+'.pdf';
            createContentVersion(blobFile, recordId, fileName);
            sp = Database.setSavePoint();
            
            String subject	= et.Subject;
            subject 		= subject.replace('<CompanyName>', AccountName);
            String body 	= et.HtmlValue;
            body 			= body.replace('<personWhoValidated>',userName);
            body 			= body.replace('<DateVlidated>', System.now().format('M/d/YYYY hh:mm a'));
            
            //emailIdList.add(Label.MeritEmail);
            //emailIdList.add(cmSceEmailId);  //Command 06/03/2025
            //emailIdList.add('varun.seetarama@crmit.com');
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            Messaging.EmailFileAttachment efa1 = new Messaging.EmailFileAttachment();
            
            system.debug('emailIdList = '+emailIdList);
            
            efa1.setFileName(fileName);
            efa1.setBody(blobFile);
            email.setSubject(subject);
            email.setToAddresses(emailIdList);
            email.setHtmlBody(Body);
            email.setFileAttachments(new Messaging.EmailFileAttachment[] {efa1});
            email.setSaveAsActivity(true);
            email.setWhatId(accList[0].id);
            
            Messaging.SendEmailResult [] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] {email});
            for(Messaging.SendEmailResult result : results){
                String errors = '';
                if(!result.isSuccess()){
                    for(Messaging.SendEmailError err : result.getErrors()) {
                        errors = errors + err.getStatusCode() + ': ' + err.getMessage();
                    }
                }
                if(errors !=''){
                    System.debug('Error ==>'+errors);
                }
            }
        }catch(Exception ex){
            System.debug('Error'+ex.getMessage()+' '+ex.getStackTraceString());
            system.debug('ex '+ex.getLineNumber());
            Database.rollback(sp);
        }
        
    }
    
    
    @AuraEnabled
    public static void sendChecklistToSelectedEmails(String recordId, List<String> selectedEmails,  Boolean showAllData, String currentSS){
        if(selectedEmails == null || selectedEmails.isEmpty()){
            throw new AuraHandledException('No emails selected');
        }
        SavePoint sp;
        EmailTemplate et = [SELECT Id, HtmlValue, Subject  FROM EmailTemplate WHERE DeveloperName = 'Renewal_Checklist_Validation_Email' LIMIT 1 ];

        Account acc = [SELECT Id,Name,CM_SCE__c,CM_SCE__r.Name,CM_SCE__r.Email,Surest_Members__c FROM Account WHERE Id =: recordId WITH USER_MODE LIMIT 1 ];

        PageReference pdf = Page.RenewalChecklistPdf;
        pdf.getParameters().put('recordId', recordId);
        pdf.getParameters().put('currentSS', currentSS);
        pdf.getParameters().put('showAllData', String.valueOf(showAllData));
        pdf.setRedirect(true);
        Blob blobFile;
        if(!Test.isRunningTest()){
            blobFile = pdf.getContent();
        } else {
            blobFile = Blob.valueOf('Unit.Test');
        }

        String fileName = 'Product Change Checklist - ' + acc.Name +' - ' + System.now().format('MdYYYY') + '.pdf';
        createContentVersion(blobFile, recordId, fileName);
        sp = Database.setSavePoint();

        String subject = et.Subject.replace('<CompanyName>', acc.Name);
        String body = et.HtmlValue;
        body = body.replace('<DateVlidated>', System.now().format('M/d/YYYY hh:mm a'));

        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();

        attachment.setFileName(fileName);
        attachment.setBody(blobFile);

        email.setToAddresses(selectedEmails);
        email.setSubject(subject);
        email.setHtmlBody(body);
        email.setFileAttachments(new Messaging.EmailFileAttachment[] { attachment });
        email.setWhatId(recordId);
        email.setSaveAsActivity(true);

        Messaging.SendEmailResult [] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] {email});
        for(Messaging.SendEmailResult result : results){
            String errors = '';
            if(!result.isSuccess()){
                for(Messaging.SendEmailError err : result.getErrors()) {
                    errors = errors + err.getStatusCode() + ': ' + err.getMessage();
                }
            }
            if(errors !=''){
                System.debug('Error ==>'+errors);
            }
        }
    }

    
    
    public static void createContentVersion(Blob data, Id recordId, String fileName){
        
        ContentVersion objContent 			= new ContentVersion();
        objContent.PathOnClient 			= fileName;
        objContent.Title					= fileName;
        objContent.VersionData				= data;
        objContent.FirstPublishLocationId 	= recordId;
        objContent.SharingPrivacy			= 'N';
        objContent.IsMajorVersion			= true;
        objContent.OwnerId					= userId;
        insert as USER objContent;
    }
    
    
    public static List<OpportunityLineItem> sortProductsList(List<OpportunityLineItem> exisProdList){
        List<OpportunityLineItem> sortedExisProdLsit = new List<OpportunityLineItem>();
        
        if(exisProdList.size() > 0){
            for(OpportunityLineItem oppLn:exisProdList){
                if(oppLn.Product_Line__c == 'Medical'){
                    sortedExisProdLsit.add(oppLn);
                }
            }
            for(OpportunityLineItem oppLn:exisProdList){
                if(oppLn.Product_Line__c == 'Pharmacy'){
                    sortedExisProdLsit.add(oppLn);
                }
            }
            for(OpportunityLineItem oppLn:exisProdList){
                if(oppLn.Product_Line__c == 'Dental'){
                    sortedExisProdLsit.add(oppLn);
                }
            }
            for(OpportunityLineItem oppLn:exisProdList){
                if(oppLn.Product_Line__c == 'Vision'){
                    sortedExisProdLsit.add(oppLn);
                }
            }
            for(OpportunityLineItem oppLn:exisProdList){
                if(oppLn.Product_Line__c == 'Other'){
                    sortedExisProdLsit.add(oppLn);
                }
            }
        }
        return sortedExisProdLsit;
    }
    
    public class returnRenewalChecklistPoc {
        
        @AuraEnabled
        public List<OpportunityLineItem> detailExistingProductsList{get;set;}
        
        @AuraEnabled
        public List<OpportunityLineItem> detailTermingProductsList{get;set;}
        
        @AuraEnabled
        public List<Opportunity> openMembership{get;set;}
        
        @AuraEnabled
        public List<Renewal_Checklist__c> renewalCheckListData{get;set;}

        @AuraEnabled
        public List<Renewal_Checklist__c> lastYearChecklist{get;set;}
        
        /* @AuraEnabled
public List<OpportunityLineItem> dentalVision{get;set;}
*/ 
        @AuraEnabled
        public List<Service_AMT__c> serviceAmtList{get;set;}

        @AuraEnabled
        public List<Service_AMT__c> serviceAmt{get;set;}

        @AuraEnabled
        public List<Policy_Information__c> policyInfoList{get;set;}

        @AuraEnabled
        public List<Product2> productInfoList{get;set;}
        
        @AuraEnabled
        public String timeZone{get;set;}
        
    }
    
    /* public class renewalPrintWrapper {

@AuraEnabled
public List<OpportunityLineItem> ExistingProductsList{get;set;}

@AuraEnabled
public List<OpportunityLineItem> TermingProductsList{get;set;}

@AuraEnabled
public List<Opportunity> openMembership{get;set;}

@AuraEnabled
public List<Renewal_Checklist__c> renewalCheckListData{get;set;}


}
*/
    public class onLoadData{
        
        @AuraEnabled
        public List<Account> summaryAccList{get;set;}
        
        @AuraEnabled
        public List<Opportunity> summaryOppList{get;set;}
        
        @AuraEnabled
        public List<OpportunityLineItem> dentalVisionList{get;set;}
        
        @AuraEnabled
        public List<Account> accList{get;set;}
        
        @AuraEnabled
        public Map<String,Id> rcTypes{get;set;}
        
    }    
}