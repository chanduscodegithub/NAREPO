public with sharing class IPMInformationWeightageCalculationHelper {
    
    public static void calculateAddOnInsert(List<IPM_Information__c> ipmInfoNewList){
        
        Map<String, Map<String,Decimal>> weightages = IPMInformationWeightageCalculationHelper.getPicklistWeightage(); 
        
        for(IPM_Information__c iiRecord: ipmInfoNewList){

                Boolean isException = false;
                if(iiRecord.PPM_Optics__c != null && iiRecord.PPM_Optics__c > 5){
                    iiRecord.PPM_Optics__c.addError('Please enter number between 0-5');
                    isException = true;
                }
                if(iiRecord.Attending_Open_Enrollment_Meetings__c != null && iiRecord.Attending_Open_Enrollment_Meetings__c > 5){
                    iiRecord.Attending_Open_Enrollment_Meetings__c.addError('Please enter number between 0-5');
                    isException = true;
                }
                
                
                iiRecord.Total_Benefit_Sets_Score__c = iiRecord.Anticipated_Number_of_NEW_Benefit_Sets__c != null ? weightages.get('Anticipated_Number_of_NEW_Benefit_Sets__c').get(iiRecord.Anticipated_Number_of_NEW_Benefit_Sets__c) :0;
                iiRecord.Vision_Score__c = iiRecord.Vision__c != null ? weightages.get('Vision__c').get(iiRecord.Vision__c) :0;
                iiRecord.Dental_Score__c = iiRecord.Dental__c != null ? weightages.get('Dental__c').get(iiRecord.Dental__c) :0;
                iiRecord.Benefit_Tiering_Score__c = iiRecord.Benefit_Tiering__c != null ? weightages.get('Benefit_Tiering__c').get(iiRecord.Benefit_Tiering__c) :0;
                iiRecord.Nexus_ACO_Score__c = iiRecord.Nexus_ACO__c != null ? weightages.get('Nexus_ACO__c').get(iiRecord.Nexus_ACO__c) :0;
                iiRecord.Other_Gated_Products_Score__c = iiRecord.Other_Gated_Products__c != null ? weightages.get('Other_Gated_Products__c').get(iiRecord.Other_Gated_Products__c) :0;
                iiRecord.Pre_Implementation_Audit_Score__c = iiRecord.Pre_Implementation_Audit__c != null ? weightages.get('Pre_Implementation_Audit__c').get(iiRecord.Pre_Implementation_Audit__c) :0;
                iiRecord.History_Conversion_Transition_Score__c = iiRecord.History_Conversion_Transition__c != null ? weightages.get('History_Conversion_Transition__c').get(iiRecord.History_Conversion_Transition__c) :0;
                iiRecord.Engagement_Solutions_Score__c = iiRecord.Engagement_Solutions__c != null ? weightages.get('Engagement_Solutions__c').get(iiRecord.Engagement_Solutions__c) :0;
                iiRecord.Pre_Member_Website_Score__c = iiRecord.Pre_Member_Website__c != null ? weightages.get('Pre_Member_Website__c').get(iiRecord.Pre_Member_Website__c) :0;
                iiRecord.of_Eligibility_File_Feeds_Score__c = iiRecord.of_Eligibility_File_Feeds__c != null ? weightages.get('of_Eligibility_File_Feeds__c').get(iiRecord.of_Eligibility_File_Feeds__c) :0;
                iiRecord.OptumRX_Pharmacy_Score__c = iiRecord.OptumRX_Pharmacy__c != null ? weightages.get('OptumRX_Pharmacy__c').get(iiRecord.OptumRX_Pharmacy__c) :0;
                iiRecord.Financial_Protection_Score__c = iiRecord.Financial_Protection__c != null ? weightages.get('Financial_Protection__c').get(iiRecord.Financial_Protection__c) :0;
                iiRecord.FSA_Dependent_Care_Score__c = iiRecord.FSA_Dependent_Care__c != null ? weightages.get('FSA_Dependent_Care__c').get(iiRecord.FSA_Dependent_Care__c) :0;
                iiRecord.FSA_Healthcare_Score__c = iiRecord.FSA_Healthcare__c != null ? weightages.get('FSA_Healthcare__c').get(iiRecord.FSA_Healthcare__c) :0;
                iiRecord.FSA_Limited_Purpose_Score__c = iiRecord.FSA_Limited_Purpose__c != null ? weightages.get('FSA_Limited_Purpose__c').get(iiRecord.FSA_Limited_Purpose__c) :0;
                iiRecord.HRA_Limited_Purpose_Score__c = iiRecord.HRA_Limited_Purpose__c != null ? weightages.get('HRA_Limited_Purpose__c').get(iiRecord.HRA_Limited_Purpose__c) :0;
                iiRecord.HRA_Post_Deductible_Score__c = iiRecord.HRA_Post_Deductible__c != null ? weightages.get('HRA_Post_Deductible__c').get(iiRecord.HRA_Post_Deductible__c) :0;
                iiRecord.HRA_Traditional_Score__c = iiRecord.HRA_Traditional__c != null ? weightages.get('HRA_Traditional__c').get(iiRecord.HRA_Traditional__c) :0;
                iiRecord.HIA_Score__c = iiRecord.HIA__c != null ? weightages.get('HIA__c').get(iiRecord.HIA__c) :0;
                iiRecord.HCSC_Score__c = iiRecord.HCSC__c != null ? weightages.get('HCSC__c').get(iiRecord.HCSC__c) :0;
                iiRecord.OptumBank_HSA_Score__c = iiRecord.OptumBank_HSA__c != null ? weightages.get('OptumBank_HSA__c').get(iiRecord.OptumBank_HSA__c) :0;
                iiRecord.CERA_Score__c = iiRecord.CERA__c != null ? weightages.get('CERA__c').get(iiRecord.CERA__c) :0;
                iiRecord.OptumHealth_Services_Score__c = iiRecord.OptumHealth_Services__c != null ? weightages.get('OptumHealth_Services__c').get(iiRecord.OptumHealth_Services__c) :0;
                iiRecord.Optum_Disease_Management_Buy_Ups_Score__c = iiRecord.Optum_Disease_Management_Buy_Ups__c != null ? weightages.get('Optum_Disease_Management_Buy_Ups__c').get(iiRecord.Optum_Disease_Management_Buy_Ups__c) :0;
                iiRecord.Rally_Portal_Score__c = iiRecord.Rally_Portal__c != null ? weightages.get('Rally_Portal__c').get(iiRecord.Rally_Portal__c) :0;
                iiRecord.Optum_Worksite_Wellness_Score__c = iiRecord.Optum_Worksite_Wellness__c != null ? weightages.get('Optum_Worksite_Wellness__c').get(iiRecord.Optum_Worksite_Wellness__c) :0;
                iiRecord.Optum_Behavioral_Health_Score__c = iiRecord.Optum_Behavioral_Health__c != null ? weightages.get('Optum_Behavioral_Health__c').get(iiRecord.Optum_Behavioral_Health__c) :0;
                iiRecord.Optum_Behavioral_Health_Buy_Ups_Score__c = iiRecord.Optum_Behavioral_Health_Buy_Ups__c != null ? weightages.get('Optum_Behavioral_Health_Buy_Ups__c').get(iiRecord.Optum_Behavioral_Health_Buy_Ups__c) :0;
                iiRecord.Optum_EAP_Score__c = iiRecord.Optum_EAP__c != null ? weightages.get('Optum_EAP__c').get(iiRecord.Optum_EAP__c) :0;
                iiRecord.Cross_Carrier_Set_up_Score__c = iiRecord.Cross_Carrier_Set_up__c != null ? weightages.get('Cross_Carrier_Set_up__c').get(iiRecord.Cross_Carrier_Set_up__c) :0;
                iiRecord.Advocate4Me_Score__c = iiRecord.Advocate4Me__c != null ? weightages.get('Advocate4Me__c').get(iiRecord.Advocate4Me__c) :0;
                iiRecord.C3_Score__c = iiRecord.C3__c != null ? weightages.get('C3__c').get(iiRecord.C3__c) :0;
                iiRecord.Personal_Rewards_Score__c = iiRecord.Personal_Rewards__c != null ? weightages.get('Personal_Rewards__c').get(iiRecord.Personal_Rewards__c) :0;
                iiRecord.COBRA_Score__c = iiRecord.COBRA__c != null ? weightages.get('COBRA__c').get(iiRecord.COBRA__c) :0;
                iiRecord.FlexWork_Score__c = iiRecord.FlexWork__c != null ? weightages.get('FlexWork__c').get(iiRecord.FlexWork__c) :0;
                iiRecord.Stop_Loss_by_UHC_Score__c = iiRecord.Stop_Loss_by_UHC__c != null ? weightages.get('Stop_Loss_by_UHC__c').get(iiRecord.Stop_Loss_by_UHC__c) :0;
                iiRecord.Incremental_Prdcts_Srvc_Complexity_Score__c = iiRecord.Incremental_Products_Services_Complexity__c != null ? weightages.get('Incremental_Products_Services_Complexity__c').get(iiRecord.Incremental_Products_Services_Complexity__c) :0;
                iiRecord.Administrative_Score__c = iiRecord.Administrative__c != null ? weightages.get('Administrative__c').get(iiRecord.Administrative__c) :0;
                iiRecord.Meetings_Score__c = iiRecord.Meetings__c != null ? weightages.get('Meetings__c').get(iiRecord.Meetings__c) :0;
                iiRecord.Travel_Time_Score__c = iiRecord.Travel_Time__c != null ? weightages.get('Travel_Time__c').get(iiRecord.Travel_Time__c) :0;
                iiRecord.Regulatory_for_FI_Score__c = iiRecord.Regulatory_for_FI__c != null ? weightages.get('Regulatory_for_FI__c').get(iiRecord.Regulatory_for_FI__c) :0;
                iiRecord.Portfolio_Grid_for_FI_Score__c = iiRecord.Portfolio_Grid_for_FI__c != null ? weightages.get('Portfolio_Grid_for_FI__c').get(iiRecord.Portfolio_Grid_for_FI__c) :0;
                iiRecord.Total_of_External_Data_Files_Score__c = iiRecord.Total_of_External_Data_Files__c != null && iiRecord.Total_of_External_Data_Files__c >= 1 ?(iiRecord.Total_of_External_Data_Files__c <= 5 ? weightages.get('Total_of_External_Data_Files__c').get(String.valueOf(iiRecord.Total_of_External_Data_Files__c)) : 26) :0;
                iiRecord.OptumHealth_Services_Buy_Ups_Score__c = iiRecord.OptumHealth_Services_Buy_Ups__c != null ? weightages.get('OptumHealth_Services_Buy_Ups__c').get(String.valueOf(iiRecord.OptumHealth_Services_Buy_Ups__c)) :0;
                iiRecord.PPM_Optics_Score__c = iiRecord.PPM_Optics__c != null ? weightages.get('PPM_Optics__c').get(String.valueOf(iiRecord.PPM_Optics__c)) :0;
                iiRecord.Attending_Open_Enrollment_Meetings_Score__c = iiRecord.Attending_Open_Enrollment_Meetings__c != null ? weightages.get('Attending_Open_Enrollment_Meetings__c').get(String.valueOf(iiRecord.Attending_Open_Enrollment_Meetings__c)) :0;
                iiRecord.Non_Standard_Network_Set_up_Score__c = iiRecord.Non_Standard_Network_Set_up__c != null ? Integer.valueOf(iiRecord.Non_Standard_Network_Set_up__c) * 4 : 0;
             //Added By Vignesh -- Capacity Model 2025s
                iiRecord.OBM_Score__c = iiRecord.OBM__c != null ? weightages.get('OBM__c').get(iiRecord.OBM__c) :0;
                iiRecord.UHC_Hub_Score__c = iiRecord.UHC_Hub__c != null ? weightages.get('UHC_Hub__c').get(iiRecord.UHC_Hub__c) :0;
                iiRecord.Rally_Score__c = iiRecord.Rally__c != null ? weightages.get('Rally__c').get(iiRecord.Rally__c) :0;
                iiRecord.Surest_Score__c = iiRecord.Surest__c != null ? weightages.get('Surest__c').get(iiRecord.Surest__c) :0;             
                
                
                if(!isException)
                    iiRecord.Hours_of_complexity__c = iiRecord.Total_Benefit_Sets_Score__c + iiRecord.Vision_Score__c + iiRecord.Dental_Score__c + iiRecord.Benefit_Tiering_Score__c + iiRecord.Nexus_ACO_Score__c + iiRecord.Other_Gated_Products_Score__c +
                    iiRecord.Pre_Implementation_Audit_Score__c + iiRecord.History_Conversion_Transition_Score__c + iiRecord.Engagement_Solutions_Score__c + iiRecord.Pre_Member_Website_Score__c + iiRecord.of_Eligibility_File_Feeds_Score__c + 
                    iiRecord.OptumRX_Pharmacy_Score__c + iiRecord.Financial_Protection_Score__c + iiRecord.FSA_Dependent_Care_Score__c + iiRecord.FSA_Healthcare_Score__c + iiRecord.FSA_Limited_Purpose_Score__c + iiRecord.HRA_Limited_Purpose_Score__c + 
                    iiRecord.HRA_Post_Deductible_Score__c + iiRecord.HRA_Traditional_Score__c + iiRecord.HIA_Score__c + iiRecord.HCSC_Score__c + iiRecord.OptumBank_HSA_Score__c + iiRecord.CERA_Score__c + iiRecord.OptumHealth_Services_Score__c + 
                    iiRecord.Optum_Disease_Management_Buy_Ups_Score__c + iiRecord.Rally_Portal_Score__c + iiRecord.Optum_Worksite_Wellness_Score__c + iiRecord.Optum_Behavioral_Health_Score__c + iiRecord.Optum_Behavioral_Health_Buy_Ups_Score__c + 
                    iiRecord.Optum_EAP_Score__c + iiRecord.Cross_Carrier_Set_up_Score__c + iiRecord.Advocate4Me_Score__c + iiRecord.C3_Score__c + iiRecord.Personal_Rewards_Score__c + iiRecord.COBRA_Score__c + iiRecord.FlexWork_Score__c + iiRecord.Stop_Loss_by_UHC_Score__c + 
                    iiRecord.Incremental_Prdcts_Srvc_Complexity_Score__c + iiRecord.Administrative_Score__c + iiRecord.Meetings_Score__c + iiRecord.Travel_Time_Score__c + iiRecord.Regulatory_for_FI_Score__c + iiRecord.Portfolio_Grid_for_FI_Score__c + iiRecord.Total_of_External_Data_Files_Score__c + 
                    iiRecord.OptumHealth_Services_Buy_Ups_Score_2__c + iiRecord.PPM_Optics_Score__c + iiRecord.Attending_Open_Enrollment_Meetings_Score__c + iiRecord.Non_Standard_Network_Set_up_Score__c + iiRecord.OBM_Score__c +
                    iiRecord.UHC_Hub_Score__c + iiRecord.Rally_Score__c + iiRecord.Surest_Score__c;//Added By Vignesh -- Capacity Model 2025s
        }
    }
    
    public static void calculateAddOnUpdate(Map<Id, IPM_Information__c> ipmInfoNewMap, Map<Id, IPM_Information__c> ipmInfoOldMap){
        Map<String, Map<String,Decimal>> weightages = IPMInformationWeightageCalculationHelper.getPicklistWeightage(); 
        List<IPM_Information__c> filteredIPMInfoList = new List<IPM_Information__c>();
        
       /* for(IPM_Information__c iNew : ipmInfoNewMap.values()){
            IPM_Information__c iOld = ipmInfoOldMap.get(iNew.Id);
            if(inew.Anticipated_Number_of_NEW_Benefit_Sets__c != iOld.Anticipated_Number_of_NEW_Benefit_Sets__c || inew.Vision__c != iOld.Vision__c || inew.Dental__c != iOld.Dental__c ||  inew.Benefit_Tiering__c != iOld.Benefit_Tiering__c ||
               inew.Nexus_ACO__c != iOld.Nexus_ACO__c || inew.Other_Gated_Products__c != iOld.Other_Gated_Products__c || inew.Pre_Implementation_Audit__c != iOld.Pre_Implementation_Audit__c || inew.History_Conversion_Transition__c != iOld.History_Conversion_Transition__c || 
               inew.Engagement_Solutions__c != iOld.Engagement_Solutions__c || inew.Pre_Member_Website__c != iOld.Pre_Member_Website__c || inew.of_Eligibility_File_Feeds__c != iOld.of_Eligibility_File_Feeds__c || inew.OptumRX_Pharmacy__c != iOld.OptumRX_Pharmacy__c || 
               inew.Financial_Protection__c != iOld.Financial_Protection__c || inew.FSA_Dependent_Care__c != iOld.FSA_Dependent_Care__c || inew.FSA_Healthcare__c != iOld.FSA_Healthcare__c || inew.FSA_Limited_Purpose__c != iOld.FSA_Limited_Purpose__c || 
               inew.HIA__c != iOld.HIA__c || inew.HCSC__c != iOld.HCSC__c || inew.OptumBank_HSA__c != iOld.OptumBank_HSA__c || inew.CERA__c != iOld.CERA__c || 
               inew.OptumHealth_Services__c != iOld.OptumHealth_Services__c || inew.Optum_Disease_Management_Buy_Ups__c != iOld.Optum_Disease_Management_Buy_Ups__c || inew.Rally_Portal__c != iOld.Rally_Portal__c || inew.Optum_Worksite_Wellness__c != iOld.Optum_Worksite_Wellness__c || 
               inew.HRA_Limited_Purpose__c != iOld.HRA_Limited_Purpose__c || inew.HRA_Post_Deductible__c != iOld.HRA_Post_Deductible__c ||
               inew.Optum_Behavioral_Health__c != iOld.Optum_Behavioral_Health__c || inew.Optum_Behavioral_Health_Buy_Ups__c != iOld.Optum_Behavioral_Health_Buy_Ups__c || inew.Optum_EAP__c != iOld.Optum_EAP__c || inew.Cross_Carrier_Set_up__c != iOld.Cross_Carrier_Set_up__c || 
               inew.Advocate4Me__c != iOld.Advocate4Me__c || inew.C3__c != iOld.C3__c || inew.Personal_Rewards__c != iOld.Personal_Rewards__c || inew.COBRA__c != iOld.COBRA__c || inew.Total_of_External_Data_Files__c != iOld.Total_of_External_Data_Files__c ||
               inew.FlexWork__c != iOld.FlexWork__c || inew.Stop_Loss_by_UHC__c != iOld.Stop_Loss_by_UHC__c || inew.Incremental_Products_Services_Complexity__c != iOld.Incremental_Products_Services_Complexity__c || inew.Administrative__c != iOld.Administrative__c || 
               inew.Meetings__c != iOld.Meetings__c || inew.Travel_Time__c != iOld.Travel_Time__c || inew.Regulatory_for_FI__c != iOld.Regulatory_for_FI__c || inew.Portfolio_Grid_for_FI__c != iOld.Portfolio_Grid_for_FI__c || 
               inew.HRA_Traditional__c != iOld.HRA_Traditional__c || inew.OptumHealth_Services_Buy_Ups__c != iOld.OptumHealth_Services_Buy_Ups__c || inew.PPM_Optics__c != iOld.PPM_Optics__c || inew.Attending_Open_Enrollment_Meetings__c != iOld.Attending_Open_Enrollment_Meetings__c || 
               inew.Non_Standard_Network_Set_up__c != iOld.Non_Standard_Network_Set_up__c || inew.OBM__c != iOld.OBM__c || inew.UHC_Hub__c != iOld.UHC_Hub__c || inew.Rally__c != iOld.Rally__c || inew.Surest__c != iOld.Surest__c){ //Added By Vignesh -- Capacity Model 2025s
                   filteredIPMInfoList.add(iNew);
               }
        }  */
        
        for(IPM_Information__c iiRecord: ipmInfoNewMap.values()){
            /*Decimal Anticipated_Number_of_NEW_Benefit_Sets = iiRecord.Anticipated_Number_of_NEW_Benefit_Sets__c != null ? weightages.get('Anticipated_Number_of_NEW_Benefit_Sets__c').get(iiRecord.Anticipated_Number_of_NEW_Benefit_Sets__c) :0;
Decimal Vision = iiRecord.Vision__c != null ? weightages.get('Vision__c').get(iiRecord.Vision__c) :0;
Decimal Dental = iiRecord.Dental__c != null ? weightages.get('Dental__c').get(iiRecord.Dental__c) :0;
Decimal Benefit_Tiering = iiRecord.Benefit_Tiering__c != null ? weightages.get('Benefit_Tiering__c').get(iiRecord.Benefit_Tiering__c) :0;
Decimal Nexus_ACO = iiRecord.Nexus_ACO__c != null ? weightages.get('Nexus_ACO__c').get(iiRecord.Nexus_ACO__c) :0;
Decimal Other_Gated_Products = iiRecord.Other_Gated_Products__c != null ? weightages.get('Other_Gated_Products__c').get(iiRecord.Other_Gated_Products__c) :0;
Decimal Pre_Implementation_Audit = iiRecord.Pre_Implementation_Audit__c != null ? weightages.get('Pre_Implementation_Audit__c').get(iiRecord.Pre_Implementation_Audit__c) :0;
Decimal History_Conversion_Transition = iiRecord.History_Conversion_Transition__c != null ? weightages.get('History_Conversion_Transition__c').get(iiRecord.History_Conversion_Transition__c) :0;
Decimal Engagement_Solutions = iiRecord.Engagement_Solutions__c != null ? weightages.get('Engagement_Solutions__c').get(iiRecord.Engagement_Solutions__c) :0;
Decimal Pre_Member_Website = iiRecord.Pre_Member_Website__c != null ? weightages.get('Pre_Member_Website__c').get(iiRecord.Pre_Member_Website__c) :0;
Decimal of_Eligibility_File_Feeds = iiRecord.of_Eligibility_File_Feeds__c != null ? weightages.get('of_Eligibility_File_Feeds__c').get(iiRecord.of_Eligibility_File_Feeds__c) :0;
Decimal OptumRX_Pharmacy = iiRecord.OptumRX_Pharmacy__c != null ? weightages.get('OptumRX_Pharmacy__c').get(iiRecord.OptumRX_Pharmacy__c) :0;
Decimal Financial_Protection = iiRecord.Financial_Protection__c != null ? weightages.get('Financial_Protection__c').get(iiRecord.Financial_Protection__c) :0;
Decimal FSA_Dependent_Care = iiRecord.FSA_Dependent_Care__c != null ? weightages.get('FSA_Dependent_Care__c').get(iiRecord.FSA_Dependent_Care__c) :0;
Decimal FSA_Healthcare = iiRecord.FSA_Healthcare__c != null ? weightages.get('FSA_Healthcare__c').get(iiRecord.FSA_Healthcare__c) :0;
Decimal FSA_Limited_Purpose = iiRecord.FSA_Limited_Purpose__c != null ? weightages.get('FSA_Limited_Purpose__c').get(iiRecord.FSA_Limited_Purpose__c) :0;
Decimal HRA_Limited_Purpose = iiRecord.HRA_Limited_Purpose__c != null ? weightages.get('HRA_Limited_Purpose__c').get(iiRecord.HRA_Limited_Purpose__c) :0;
Decimal HRA_Post_Deductible = iiRecord.HRA_Post_Deductible__c != null ? weightages.get('HRA_Post_Deductible__c').get(iiRecord.HRA_Post_Deductible__c) :0;
Decimal HRA_Traditional = iiRecord.HRA_Traditional__c != null ? weightages.get('HRA_Traditional__c').get(iiRecord.HRA_Traditional__c) :0;
Decimal HIA = iiRecord.HIA__c != null ? weightages.get('HIA__c').get(iiRecord.HIA__c) :0;
Decimal HCSC = iiRecord.HCSC__c != null ? weightages.get('HCSC__c').get(iiRecord.HCSC__c) :0;
Decimal OptumBank_HSA = iiRecord.OptumBank_HSA__c != null ? weightages.get('OptumBank_HSA__c').get(iiRecord.OptumBank_HSA__c) :0;
Decimal CERA = iiRecord.CERA__c != null ? weightages.get('CERA__c').get(iiRecord.CERA__c) :0;
Decimal OptumHealth_Services = iiRecord.OptumHealth_Services__c != null ? weightages.get('OptumHealth_Services__c').get(iiRecord.OptumHealth_Services__c) :0;
Decimal Optum_Disease_Management_Buy_Ups = iiRecord.Optum_Disease_Management_Buy_Ups__c != null ? weightages.get('Optum_Disease_Management_Buy_Ups__c').get(iiRecord.Optum_Disease_Management_Buy_Ups__c) :0;
Decimal Rally_Portal = iiRecord.Rally_Portal__c != null ? weightages.get('Rally_Portal__c').get(iiRecord.Rally_Portal__c) :0;
Decimal Optum_Worksite_Wellness = iiRecord.Optum_Worksite_Wellness__c != null ? weightages.get('Optum_Worksite_Wellness__c').get(iiRecord.Optum_Worksite_Wellness__c) :0;
Decimal Optum_Behavioral_Health = iiRecord.Optum_Behavioral_Health__c != null ? weightages.get('Optum_Behavioral_Health__c').get(iiRecord.Optum_Behavioral_Health__c) :0;
Decimal Optum_Behavioral_Health_Buy_Ups = iiRecord.Optum_Behavioral_Health_Buy_Ups__c != null ? weightages.get('Optum_Behavioral_Health_Buy_Ups__c').get(iiRecord.Optum_Behavioral_Health_Buy_Ups__c) :0;
Decimal Optum_EAP = iiRecord.Optum_EAP__c != null ? weightages.get('Optum_EAP__c').get(iiRecord.Optum_EAP__c) :0;
Decimal Cross_Carrier_Set_up = iiRecord.Cross_Carrier_Set_up__c != null ? weightages.get('Cross_Carrier_Set_up__c').get(iiRecord.Cross_Carrier_Set_up__c) :0;
Decimal Advocate4Me = iiRecord.Advocate4Me__c != null ? weightages.get('Advocate4Me__c').get(iiRecord.Advocate4Me__c) :0;
Decimal C3 = iiRecord.C3__c != null ? weightages.get('C3__c').get(iiRecord.C3__c) :0;
Decimal Personal_Rewards = iiRecord.Personal_Rewards__c != null ? weightages.get('Personal_Rewards__c').get(iiRecord.Personal_Rewards__c) :0;
Decimal COBRA = iiRecord.COBRA__c != null ? weightages.get('COBRA__c').get(iiRecord.COBRA__c) :0;
Decimal FlexWork = iiRecord.FlexWork__c != null ? weightages.get('FlexWork__c').get(iiRecord.FlexWork__c) :0;
Decimal Stop_Loss_by_UHC = iiRecord.Stop_Loss_by_UHC__c != null ? weightages.get('Stop_Loss_by_UHC__c').get(iiRecord.Stop_Loss_by_UHC__c) :0;
Decimal Incremental_Products_Services_Complexity = iiRecord.Incremental_Products_Services_Complexity__c != null ? weightages.get('Incremental_Products_Services_Complexity__c').get(iiRecord.Incremental_Products_Services_Complexity__c) :0;
Decimal Administrative = iiRecord.Administrative__c != null ? weightages.get('Administrative__c').get(iiRecord.Administrative__c) :0;
Decimal Meetings = iiRecord.Meetings__c != null ? weightages.get('Meetings__c').get(iiRecord.Meetings__c) :0;
Decimal Travel_Time = iiRecord.Travel_Time__c != null ? weightages.get('Travel_Time__c').get(iiRecord.Travel_Time__c) :0;
Decimal Regulatory_for_FI = iiRecord.Regulatory_for_FI__c != null ? weightages.get('Regulatory_for_FI__c').get(iiRecord.Regulatory_for_FI__c) :0;
Decimal Portfolio_Grid_for_FI = iiRecord.Portfolio_Grid_for_FI__c != null ? weightages.get('Portfolio_Grid_for_FI__c').get(iiRecord.Portfolio_Grid_for_FI__c) :0;
Decimal Total_of_External_Data_Files = iiRecord.Total_of_External_Data_Files__c != null ?(iiRecord.Total_of_External_Data_Files__c <= 5 ? weightages.get('Total_of_External_Data_Files__c').get(String.valueOf(iiRecord.Total_of_External_Data_Files__c)) : 26) :0;
Decimal OptumHealth_Services_Buy_Ups = iiRecord.OptumHealth_Services_Buy_Ups__c != null ? (iiRecord.OptumHealth_Services_Buy_Ups__c <= 5 ? weightages.get('OptumHealth_Services_Buy_Ups__c').get(String.valueOf(iiRecord.OptumHealth_Services_Buy_Ups__c)) : 48) :0;
Decimal PPM_Optics = iiRecord.PPM_Optics__c != null ? weightages.get('PPM_Optics__c').get(String.valueOf(iiRecord.PPM_Optics__c)) :0;
Decimal Attending_Open_Enrollment_Meetings = iiRecord.Attending_Open_Enrollment_Meetings__c != null ? weightages.get('Attending_Open_Enrollment_Meetings__c').get(String.valueOf(iiRecord.Attending_Open_Enrollment_Meetings__c)) :0;

Decimal addOns_Sum = Anticipated_Number_of_NEW_Benefit_Sets + Vision + Dental + Benefit_Tiering + Nexus_ACO + Other_Gated_Products + Pre_Implementation_Audit + Engagement_Solutions + History_Conversion_Transition + of_Eligibility_File_Feeds + Pre_Member_Website + OptumRX_Pharmacy + Total_of_External_Data_Files + 
Financial_Protection + FSA_Dependent_Care + FSA_Healthcare + FSA_Limited_Purpose + HRA_Post_Deductible  + HRA_Traditional + HRA_Limited_Purpose + HIA + HCSC + OptumBank_HSA + CERA + OptumHealth_Services + Optum_Disease_Management_Buy_Ups + Rally_Portal + Optum_Worksite_Wellness + Optum_Personal_Coaching +
Optum_Behavioral_Health + Optum_Behavioral_Health_Buy_Ups + Optum_EAP + Cross_Carrier_Set_up + Advocate4Me  + C3 + Personal_Rewards + COBRA + FlexWork + Stop_Loss_by_UHC + Incremental_Products_Services_Complexity + Administrative + Meetings + Travel_Time + Regulatory_for_FI + Portfolio_Grid_for_FI +
OptumHealth_Services_Buy_Ups + PPM_Optics + Attending_Open_Enrollment_Meetings;*/
            
            Boolean isException = false;
            if(iiRecord.PPM_Optics__c != null && iiRecord.PPM_Optics__c > 5){
                iiRecord.PPM_Optics__c.addError('Please enter number between 0-5');
                isException = true;
            }
            if(iiRecord.Attending_Open_Enrollment_Meetings__c != null && iiRecord.Attending_Open_Enrollment_Meetings__c > 5){
                iiRecord.Attending_Open_Enrollment_Meetings__c.addError('Please enter number between 0-5');
                isException = true;
            }
            
            iiRecord.Total_Benefit_Sets_Score__c = iiRecord.Anticipated_Number_of_NEW_Benefit_Sets__c != null ? weightages.get('Anticipated_Number_of_NEW_Benefit_Sets__c').get(iiRecord.Anticipated_Number_of_NEW_Benefit_Sets__c) :0;
            iiRecord.Vision_Score__c = iiRecord.Vision__c != null ? weightages.get('Vision__c').get(iiRecord.Vision__c) :0;
            iiRecord.Dental_Score__c = iiRecord.Dental__c != null ? weightages.get('Dental__c').get(iiRecord.Dental__c) :0;
            iiRecord.Benefit_Tiering_Score__c = iiRecord.Benefit_Tiering__c != null ? weightages.get('Benefit_Tiering__c').get(iiRecord.Benefit_Tiering__c) :0;
            iiRecord.Nexus_ACO_Score__c = iiRecord.Nexus_ACO__c != null ? weightages.get('Nexus_ACO__c').get(iiRecord.Nexus_ACO__c) :0;
            iiRecord.Other_Gated_Products_Score__c = iiRecord.Other_Gated_Products__c != null ? weightages.get('Other_Gated_Products__c').get(iiRecord.Other_Gated_Products__c) :0;
            iiRecord.Pre_Implementation_Audit_Score__c = iiRecord.Pre_Implementation_Audit__c != null ? weightages.get('Pre_Implementation_Audit__c').get(iiRecord.Pre_Implementation_Audit__c) :0;
            iiRecord.History_Conversion_Transition_Score__c = iiRecord.History_Conversion_Transition__c != null ? weightages.get('History_Conversion_Transition__c').get(iiRecord.History_Conversion_Transition__c) :0;
            iiRecord.Engagement_Solutions_Score__c = iiRecord.Engagement_Solutions__c != null ? weightages.get('Engagement_Solutions__c').get(iiRecord.Engagement_Solutions__c) :0;
            iiRecord.Pre_Member_Website_Score__c = iiRecord.Pre_Member_Website__c != null ? weightages.get('Pre_Member_Website__c').get(iiRecord.Pre_Member_Website__c) :0;
            iiRecord.of_Eligibility_File_Feeds_Score__c = iiRecord.of_Eligibility_File_Feeds__c != null ? weightages.get('of_Eligibility_File_Feeds__c').get(iiRecord.of_Eligibility_File_Feeds__c) :0;
            iiRecord.OptumRX_Pharmacy_Score__c = iiRecord.OptumRX_Pharmacy__c != null ? weightages.get('OptumRX_Pharmacy__c').get(iiRecord.OptumRX_Pharmacy__c) :0;
            iiRecord.Financial_Protection_Score__c = iiRecord.Financial_Protection__c != null ? weightages.get('Financial_Protection__c').get(iiRecord.Financial_Protection__c) :0;
            iiRecord.FSA_Dependent_Care_Score__c = iiRecord.FSA_Dependent_Care__c != null ? weightages.get('FSA_Dependent_Care__c').get(iiRecord.FSA_Dependent_Care__c) :0;
            iiRecord.FSA_Healthcare_Score__c = iiRecord.FSA_Healthcare__c != null ? weightages.get('FSA_Healthcare__c').get(iiRecord.FSA_Healthcare__c) :0;
            iiRecord.FSA_Limited_Purpose_Score__c = iiRecord.FSA_Limited_Purpose__c != null ? weightages.get('FSA_Limited_Purpose__c').get(iiRecord.FSA_Limited_Purpose__c) :0;
            iiRecord.HRA_Limited_Purpose_Score__c = iiRecord.HRA_Limited_Purpose__c != null ? weightages.get('HRA_Limited_Purpose__c').get(iiRecord.HRA_Limited_Purpose__c) :0;
            iiRecord.HRA_Post_Deductible_Score__c = iiRecord.HRA_Post_Deductible__c != null ? weightages.get('HRA_Post_Deductible__c').get(iiRecord.HRA_Post_Deductible__c) :0;
            iiRecord.HRA_Traditional_Score__c = iiRecord.HRA_Traditional__c != null ? weightages.get('HRA_Traditional__c').get(iiRecord.HRA_Traditional__c) :0;
            iiRecord.HIA_Score__c = iiRecord.HIA__c != null ? weightages.get('HIA__c').get(iiRecord.HIA__c) :0;
            iiRecord.HCSC_Score__c = iiRecord.HCSC__c != null ? weightages.get('HCSC__c').get(iiRecord.HCSC__c) :0;
            iiRecord.OptumBank_HSA_Score__c = iiRecord.OptumBank_HSA__c != null ? weightages.get('OptumBank_HSA__c').get(iiRecord.OptumBank_HSA__c) :0;
            iiRecord.CERA_Score__c = iiRecord.CERA__c != null ? weightages.get('CERA__c').get(iiRecord.CERA__c) :0;
            iiRecord.OptumHealth_Services_Score__c = iiRecord.OptumHealth_Services__c != null ? weightages.get('OptumHealth_Services__c').get(iiRecord.OptumHealth_Services__c) :0;
            iiRecord.Optum_Disease_Management_Buy_Ups_Score__c = iiRecord.Optum_Disease_Management_Buy_Ups__c != null ? weightages.get('Optum_Disease_Management_Buy_Ups__c').get(iiRecord.Optum_Disease_Management_Buy_Ups__c) :0;
            iiRecord.Rally_Portal_Score__c = iiRecord.Rally_Portal__c != null ? weightages.get('Rally_Portal__c').get(iiRecord.Rally_Portal__c) :0;
            iiRecord.Optum_Worksite_Wellness_Score__c = iiRecord.Optum_Worksite_Wellness__c != null ? weightages.get('Optum_Worksite_Wellness__c').get(iiRecord.Optum_Worksite_Wellness__c) :0;
            iiRecord.Optum_Behavioral_Health_Score__c = iiRecord.Optum_Behavioral_Health__c != null ? weightages.get('Optum_Behavioral_Health__c').get(iiRecord.Optum_Behavioral_Health__c) :0;
            iiRecord.Optum_Behavioral_Health_Buy_Ups_Score__c = iiRecord.Optum_Behavioral_Health_Buy_Ups__c != null ? weightages.get('Optum_Behavioral_Health_Buy_Ups__c').get(iiRecord.Optum_Behavioral_Health_Buy_Ups__c) :0;
            iiRecord.Optum_EAP_Score__c = iiRecord.Optum_EAP__c != null ? weightages.get('Optum_EAP__c').get(iiRecord.Optum_EAP__c) :0;
            iiRecord.Cross_Carrier_Set_up_Score__c = iiRecord.Cross_Carrier_Set_up__c != null ? weightages.get('Cross_Carrier_Set_up__c').get(iiRecord.Cross_Carrier_Set_up__c) :0;
            iiRecord.Advocate4Me_Score__c = iiRecord.Advocate4Me__c != null ? weightages.get('Advocate4Me__c').get(iiRecord.Advocate4Me__c) :0;
            iiRecord.C3_Score__c = iiRecord.C3__c != null ? weightages.get('C3__c').get(iiRecord.C3__c) :0;
            iiRecord.Personal_Rewards_Score__c = iiRecord.Personal_Rewards__c != null ? weightages.get('Personal_Rewards__c').get(iiRecord.Personal_Rewards__c) :0;
            iiRecord.COBRA_Score__c = iiRecord.COBRA__c != null ? weightages.get('COBRA__c').get(iiRecord.COBRA__c) :0;
            iiRecord.FlexWork_Score__c = iiRecord.FlexWork__c != null ? weightages.get('FlexWork__c').get(iiRecord.FlexWork__c) :0;
            iiRecord.Stop_Loss_by_UHC_Score__c = iiRecord.Stop_Loss_by_UHC__c != null ? weightages.get('Stop_Loss_by_UHC__c').get(iiRecord.Stop_Loss_by_UHC__c) :0;
            iiRecord.Incremental_Prdcts_Srvc_Complexity_Score__c = iiRecord.Incremental_Products_Services_Complexity__c != null ? weightages.get('Incremental_Products_Services_Complexity__c').get(iiRecord.Incremental_Products_Services_Complexity__c) :0;
            iiRecord.Administrative_Score__c = iiRecord.Administrative__c != null ? weightages.get('Administrative__c').get(iiRecord.Administrative__c) :0;
            iiRecord.Meetings_Score__c = iiRecord.Meetings__c != null ? weightages.get('Meetings__c').get(iiRecord.Meetings__c) :0;
            iiRecord.Travel_Time_Score__c = iiRecord.Travel_Time__c != null ? weightages.get('Travel_Time__c').get(iiRecord.Travel_Time__c) :0;
            iiRecord.Regulatory_for_FI_Score__c = iiRecord.Regulatory_for_FI__c != null ? weightages.get('Regulatory_for_FI__c').get(iiRecord.Regulatory_for_FI__c) :0;
            iiRecord.Portfolio_Grid_for_FI_Score__c = iiRecord.Portfolio_Grid_for_FI__c != null ? weightages.get('Portfolio_Grid_for_FI__c').get(iiRecord.Portfolio_Grid_for_FI__c) :0;
            iiRecord.Total_of_External_Data_Files_Score__c = iiRecord.Total_of_External_Data_Files__c != null && iiRecord.Total_of_External_Data_Files__c >= 1 ?(iiRecord.Total_of_External_Data_Files__c <= 5 ? weightages.get('Total_of_External_Data_Files__c').get(String.valueOf(iiRecord.Total_of_External_Data_Files__c)) : 26) :0;
            iiRecord.OptumHealth_Services_Buy_Ups_Score__c = iiRecord.OptumHealth_Services_Buy_Ups__c != null ? weightages.get('OptumHealth_Services_Buy_Ups__c').get(String.valueOf(iiRecord.OptumHealth_Services_Buy_Ups__c)) :0;
            iiRecord.PPM_Optics_Score__c = iiRecord.PPM_Optics__c != null ? weightages.get('PPM_Optics__c').get(String.valueOf(iiRecord.PPM_Optics__c)) :0;
            iiRecord.Attending_Open_Enrollment_Meetings_Score__c = iiRecord.Attending_Open_Enrollment_Meetings__c != null ? weightages.get('Attending_Open_Enrollment_Meetings__c').get(String.valueOf(iiRecord.Attending_Open_Enrollment_Meetings__c)) :0;
            iiRecord.Non_Standard_Network_Set_up_Score__c = iiRecord.Non_Standard_Network_Set_up__c != null ? Integer.valueOf(iiRecord.Non_Standard_Network_Set_up__c) * 4 : 0;
         //Added By Vignesh -- Capacity Model 2025s
            iiRecord.OBM_Score__c = iiRecord.OBM__c != null ? weightages.get('OBM__c').get(iiRecord.OBM__c) :0;
            iiRecord.UHC_Hub_Score__c = iiRecord.UHC_Hub__c != null ? weightages.get('UHC_Hub__c').get(iiRecord.UHC_Hub__c) :0;
            iiRecord.Rally_Score__c = iiRecord.Rally__c != null ? weightages.get('Rally__c').get(iiRecord.Rally__c) :0;
            iiRecord.Surest_Score__c = iiRecord.Surest__c != null ? weightages.get('Surest__c').get(iiRecord.Surest__c) :0;             
                	
            
            if(!isException)
                iiRecord.Hours_of_complexity__c = iiRecord.Total_Benefit_Sets_Score__c + iiRecord.Vision_Score__c + iiRecord.Dental_Score__c + iiRecord.Benefit_Tiering_Score__c + iiRecord.Nexus_ACO_Score__c + iiRecord.Other_Gated_Products_Score__c +
                iiRecord.Pre_Implementation_Audit_Score__c + iiRecord.History_Conversion_Transition_Score__c + iiRecord.Engagement_Solutions_Score__c + iiRecord.Pre_Member_Website_Score__c + iiRecord.of_Eligibility_File_Feeds_Score__c + 
                iiRecord.OptumRX_Pharmacy_Score__c + iiRecord.Financial_Protection_Score__c + iiRecord.FSA_Dependent_Care_Score__c + iiRecord.FSA_Healthcare_Score__c + iiRecord.FSA_Limited_Purpose_Score__c + iiRecord.HRA_Limited_Purpose_Score__c + 
                iiRecord.HRA_Post_Deductible_Score__c + iiRecord.HRA_Traditional_Score__c + iiRecord.HIA_Score__c + iiRecord.HCSC_Score__c + iiRecord.OptumBank_HSA_Score__c + iiRecord.CERA_Score__c + iiRecord.OptumHealth_Services_Score__c + 
                iiRecord.Optum_Disease_Management_Buy_Ups_Score__c + iiRecord.Rally_Portal_Score__c + iiRecord.Optum_Worksite_Wellness_Score__c + iiRecord.Optum_Behavioral_Health_Score__c + iiRecord.Optum_Behavioral_Health_Buy_Ups_Score__c + 
                iiRecord.Optum_EAP_Score__c + iiRecord.Cross_Carrier_Set_up_Score__c + iiRecord.Advocate4Me_Score__c + iiRecord.C3_Score__c + iiRecord.Personal_Rewards_Score__c + iiRecord.COBRA_Score__c + iiRecord.FlexWork_Score__c + iiRecord.Stop_Loss_by_UHC_Score__c + 
                iiRecord.Incremental_Prdcts_Srvc_Complexity_Score__c + iiRecord.Administrative_Score__c + iiRecord.Meetings_Score__c + iiRecord.Travel_Time_Score__c + iiRecord.Regulatory_for_FI_Score__c + iiRecord.Portfolio_Grid_for_FI_Score__c + iiRecord.Total_of_External_Data_Files_Score__c + 
                iiRecord.OptumHealth_Services_Buy_Ups_Score_2__c + iiRecord.PPM_Optics_Score__c + iiRecord.Attending_Open_Enrollment_Meetings_Score__c + iiRecord.Non_Standard_Network_Set_up_Score__c + iiRecord.OBM_Score__c +
                    iiRecord.UHC_Hub_Score__c + iiRecord.Rally_Score__c + iiRecord.Surest_Score__c;//Added By Vignesh -- Capacity Model 2025s
            
        }
    }
    
    private static Map<String, Map<String,Decimal>> getPicklistWeightage(){
        Map<String, Map<String,Decimal>> fieldsVsPicklists = new Map<String, Map<String,Decimal>>();
        for(IPM__mdt obj : [SELECT Id, Field_Name__c, Picklist_Value__c, Weightage__c FROM IPM__mdt LIMIT 1000]){
            if(fieldsVsPicklists.get(obj.Field_Name__c) == null){
                fieldsVsPicklists.put(obj.Field_Name__c, new Map<String,Decimal>());
            }
            fieldsVsPicklists.get(obj.Field_Name__c).put(obj.Picklist_Value__c, obj.Weightage__c);
        }
        
        return fieldsVsPicklists;
    }
    
    private static void fieldsValidation(IPM_Information__c ipmRecord, Boolean isException){
        if(ipmRecord.PPM_Optics__c != null && ipmRecord.PPM_Optics__c > 5){
            ipmRecord.PPM_Optics__c.addError('Please enter number between 0-5');
            isException = true;
        }
        if(ipmRecord.Attending_Open_Enrollment_Meetings_Score__c != null && ipmRecord.Attending_Open_Enrollment_Meetings_Score__c > 5){
            ipmRecord.Attending_Open_Enrollment_Meetings_Score__c.addError('Please enter number between 0-5');
            isException = true;
        }
    }
    public static void calculateHOCForStaff(Map<Id, IPM_Information__c> ipmInfoNewMap, Map<Id, IPM_Information__c> ipmInfoOldMap, Boolean isUpdate) {
        Set<Id> staffAssignmentIds = new Set<Id>();
        Set<Id> saWithCompany = new Set<Id>();
        Set<Id> saWithoutCompany = new Set<Id>();
        Map<Id, Staff__c> staffMap = new Map<Id, Staff__c>();
        List<Staff_Assignment__c> staffAssignmentList = new List<Staff_Assignment__c>();
        Map<Id,Decimal> HocAccountRollupMap = new Map<Id,Decimal>();
        //Added by Vignesh - Capacity Model 2025s
        Map<Id,Decimal> TOHAccountRollupMap = new Map<Id,Decimal>();
        Map<Id,Decimal> MOIAccountRollupMap = new Map<Id,Decimal>();
        
        // Collect all staff assignment IDs
        for (IPM_Information__c ipmInfo : ipmInfoNewMap.values()) { 
            
            if(isUpdate){
                IPM_Information__c oldRecord = ipmInfoOldMap.get(ipmInfo.Id);
                if(oldRecord.Staff_Assignment__c != ipmInfo.Staff_Assignment__c){
                    staffAssignmentIds.add(oldRecord.Staff_Assignment__c);
                }
            }
            /*if (ipmInfo.Staff_Assignment__c != null) {
                staffAssignmentIds.add(ipmInfo.Staff_Assignment__c);
            }*/
            if(ipmInfo.Company__c != null){
                saWithCompany.add(ipmInfo.Company__c);
            }
            if(ipmInfo.Staff_Assignment__c != null && ipmInfo.Company__c == null){
                saWithoutCompany.add(ipmInfo.Staff_Assignment__c);
            }
        }
        
        if(!saWithCompany.isEmpty()){
            List<AggregateResult> arList = [SELECT Company__c, SUM(Hours_of_Complexity__c) totalComplexity, SUM(Total_of_hours__c) totalhours, SUM(Months_implementing__c) totalMonthimp FROM IPM_Information__c WHERE Company__c =:saWithCompany GROUP BY Company__c];
            if(!arList.isEmpty()){
                for (AggregateResult ar : arList){
                    Id AccountId = (Id) ar.get('Company__c');
                    Decimal totalComplexity = (Decimal) ar.get('totalComplexity');
                    //Added by Vignesh 
                    Decimal totalhourslist = (Decimal) ar.get('totalhours');
                    Decimal totalMonthimplist = (Decimal) ar.get('totalMonthimp');
                    TOHAccountRollupMap.put(AccountId,totalhourslist);
                    MOIAccountRollupMap.put(AccountId,totalMonthimplist);
                    
                    HocAccountRollupMap.put(AccountId,totalComplexity);
                }
            }
        }
        List<Staff_Assignment__c> saWithCompanyList = [SELECT Id, Customer_Name__c,Hours_Of_Complexity_Backend__c,Total_of_hours_Backend__c,Months_Implementing_Backend__c FROM Staff_Assignment__c WHERE Customer_Name__c =:saWithCompany];
        
        for(Staff_Assignment__c sa:saWithCompanyList){
            sa.Hours_Of_Complexity_Backend__c = HocAccountRollupMap.get(sa.Customer_Name__c);
            
            sa.Total_of_hours_Backend__c = TOHAccountRollupMap.get(sa.Customer_Name__c);
            sa.Months_Implementing_Backend__c = MOIAccountRollupMap.get(sa.Customer_Name__c);
            
            staffAssignmentList.add(sa);
        }

        if (!saWithoutCompany.isEmpty()) {
            List<AggregateResult> arList = [SELECT Staff_Assignment__c, SUM(Hours_of_Complexity__c) totalComplexity, SUM(Total_of_hours__c) totalhours, SUM(Months_implementing__c) totalMonthimp FROM IPM_Information__c WHERE Staff_Assignment__c IN :saWithoutCompany GROUP BY Staff_Assignment__c];
            
            if(arList.isEmpty() && !saWithoutCompany.isEmpty()){
                for(Id saId :staffAssignmentIds){
                    Staff_Assignment__c sa = new Staff_Assignment__c();
                    sa.Id = saId;
                    sa.Hours_Of_Complexity_Backend__c = 0;
                    
                    sa.Total_of_hours_Backend__c = 0;
           			sa.Months_Implementing_Backend__c = 0;
                    
                    staffAssignmentList.add(sa);
                }
            }
            
            for (AggregateResult ar : arList) {
                // Cast the AggregateResult fields to their appropriate types
                Id staffAssignmentId = (Id) ar.get('Staff_Assignment__c');
                Decimal totalComplexity = (Decimal) ar.get('totalComplexity');
                //Added by Vignesh
                Decimal totalHours = (Decimal) ar.get('totalhours');
                Decimal totalMonth = (Decimal) ar.get('totalMonthimp');
                
                if(staffAssignmentId != null){
                    Staff_Assignment__c saRecord = new Staff_Assignment__c();
                    saRecord.Id = staffAssignmentId;
                    saRecord.Hours_Of_Complexity_Backend__c = totalComplexity;
                    
                    saRecord.Total_of_hours_Backend__c = totalHours;
                    saRecord.Months_Implementing_Backend__c = totalMonth;
                    
                    staffAssignmentList.add(saRecord);
                }
            }
        }
        if(!staffAssignmentList.isEmpty()){
            update staffAssignmentList;
        }
    }
    
    public static void rollupHocToCompany(Map<Id, IPM_Information__c> ipmInfoNewMap, Map<Id, IPM_Information__c> ipmInfoOldMap, Boolean isUpdate){
        
    }
    
    
    
    
}