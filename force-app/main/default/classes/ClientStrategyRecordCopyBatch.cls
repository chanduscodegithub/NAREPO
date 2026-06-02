public class ClientStrategyRecordCopyBatch implements Database.Batchable<SObject>, Database.Stateful {
    
    
    // Track success/failure counts across batch execution
    private Integer successCount = 0;
    private Integer failureCount = 0;
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        // Query latest Client_Strategy__c records per Account
        return Database.getQueryLocator([SELECT Id, Company__c, Year__c, Affordability_programs__c, Behavioral_health_programs__c,
               Client_experience_and_support__c,Clinical_management_programs__c,Data_analysis_and_reporting__c, Fees_and_credits__c, Guarantees__c, 
               Integration_across_programs__c, Member_experience_and_engagement__c, Network_design__c, Network_discounts__c, Pharmacy_programs__c, 
               Plan_design__c, Wellness_programs__c, Network_Access__c, Brand_Image__c, Innovation__c, Product_breadth__c, Administrative_capabilities__c, 
               ESG_Issues__c, Additional_factors__c, CDHP_full_replacement__c, Voluntary_benefits__c, Value_based_benefits__c, Quality_Cost_tiering__c, 
               POS_tiering__c, Reference_based_pricing__c, Intermittent_workforce__c, Employee_affordability__c, Co_Pay_insurance__c, ICHRA_plan__c,
               Virtual_First_Solution__c, Traditional_PCP_Coordinated_Care__c, Site_of_Care_Steerage__c, Direct_Contracting_with_a_Provider__c, 
               Advanced_Primary_Care_Strategy__c, Streamlined_Narrow_Networks__c, ACO_Centric_Networks__c, Prioritized_Access__c, Important_Network_features__c,
               Describe_Network_features__c, Healthy_workplace__c, On_site_near_site_clinics__c, Onsite_health_specialist__c, Cancer_Screening_and_Support_Programs__c, 
               Medication_assisted_weight_loss__c, Women_s_health_solutions__c, Concierge_advocacy__c, Tools_technologies__c, Engagement_Platform_Adoption__c, 
               Digital_condition_mgmt__c, Diversity_equity_and_inclusion__c, LGBTQ_support__c, Social_Determinants_of_Health__c, Health_Equity__c, How_is_client_covering_GLP_1s__c, 
               GLP_1_obesity_management_reqs__c,GLP_1_Reqs_Write_In__c, Preventive_drug_lists__c, Prescription_savings_outreach__c, Integrated_plan_administration__c, Member_experience_integration__c, 
               Member_savings_opportunities__c, Integrated_benefits_provider__c, Integrated_Med_Pharmacy_digital__c, Electronic_prescribing_integration__c, Integrated_specialty_management__c, 
               Specialty_pharmacy_network_solution__c, Point_of_Sale_Rebates__c, Critical_affordability_drug_lists__c, Cash_price_into_member_benefit__c, Affordability_solutions__c, 
               Stop_loss_cover_for_high_cost_therapy__c, Transparent_non_traditional_PBM__c, Biosimilar_steerage__c, Specialty_Pharmacy_carve_out__c, Cardiac_COE__c, 
               Fertility_Family_Forming_COE__c, Neonatal_COE__c, Kidney_COE__c, Musculoskeletal_Spine_Joint_COE__c, Maternity_COE__c, Mental_Health_Substance_Disorder__c, 
               Transgender_Health_COE__c, Cancer_COE__c, Bariatric_COE__c, Weight_Management_COE__c, EAP_Modernization__c, Family_Special_Needs__c, Peer_Support__c, 
               Online_tools_apps_videos_webinars__c, Virtual_coaching_counseling_therapy__c, Onsite_coaching_counseling_therapy__c, Burnout_stress_management_programs__c, 
               Pediatric_focused_mental_health_sup__c, Behavioral_Health_Engagement__c, Linkage_to_business_measures__c, Data_warehouse__c, SDOH_and_health_equity__c, 
               Population_health_management_report__c, Wellness_program_offered__c, Program_administrator_vendor__c, Wellness_program_duration__c, Wellness_program_offered_to__c,Annual_Open_Kit_Shared_Write_In__c,
               Wellness_Programs_Offered_Write_In__c, Value_Story_Supp_Other_Write_In__c,Doesnt_UHC_Optum_reason_Write_In__c, 
               Participation_in_wellness_program__c, Non_UHC_Optum_wellness_reasons__c, Client_rethinking_wellness_approach__c, Planned_changes_to_wellness_program__c, Max_annual_employee_reward__c, 
               Max_annual_spouse_partner_reward__c, Earned_Full_Incentive__c, Earned_Partial_Incentive__c, Did_Not_Earn_Incentive__c, NA_New_program__c, How_are_Rewards_distributed__c, Other_reward_distribution_method__c, 
               Biometric_screenings__c, Health_risk_assessment__c, Cancer_screenings__c, Tobacco_cessation_programs__c, Physical_activity_challenges__c, Weight_management_programs__c, Wellness_lifestyle_coaching__c, 
               Sleep_management_programs__c, Communication_resource_available__c, 
               View_of_open_enrollment_onboarding__c, Standard_vs_custom_communications__c, Approach_to_targeted_messaging__c, Topics_communicated_to_emp_yearly__c, 
               Value_story_support_in_client_convos__c, Ways_to_strengthen_value_story__c, Competitive_landscape_updated__c, 
               Annual_open_enrollment_kit_shared__c FROM Client_Strategy__c
            WHERE Year__c != null ORDER BY Company__c, Year__c DESC]);
    }  //25/09
    
    public void execute(Database.BatchableContext bc, List<Client_Strategy__c> scope) {
        Map<Id, Client_Strategy__c> latestByAccount = new Map<Id, Client_Strategy__c>();
        
        // latest record for each account
        for (Client_Strategy__c cs : scope) {
            if (!latestByAccount.containsKey(cs.Company__c)) {
                latestByAccount.put(cs.Company__c, cs);
            }
        }
        
        List<Client_Strategy__c> recordsToInsert = new List<Client_Strategy__c>();
        //Clone to the next year
        for (Client_Strategy__c latest : latestByAccount.values()) {
            Client_Strategy__c newCS = latest.clone(false, true, false, false);
             if (Schema.sObjectType.Client_Strategy__c.isCreateable() &&
                Schema.sObjectType.Client_Strategy__c.fields.Year__c.isCreateable() &&
                Schema.sObjectType.Client_Strategy__c.fields.Status__c.isCreateable() && Schema.sObjectType.Client_Strategy__c.fields.Completion_Date_Time__c.isCreateable() ) {
            newCS.Year__c = String.valueOf(Integer.valueOf(latest.Year__c) + 1);
            newCS.Status__c = 'In Progress';
            newCS.Completion_Date_Time__c = null;
            recordsToInsert.add(newCS);
                }
        }
        
        if (!recordsToInsert.isEmpty()) {
            //insert AS USER recordsToInsert;
            Database.SaveResult[] results = Database.insert(recordsToInsert, false); // allow partial success
            for (Database.SaveResult sr : results) {
                if (sr.isSuccess()) {
                    successCount++;
                } else {
                    failureCount++;
                    for (Database.Error err : sr.getErrors()) {
                        System.debug('Insert failed: ' + err.getMessage());
                    }
                }
            }
        }
    }
    
    public void finish(Database.BatchableContext bc) {
        System.debug('Client Strategy copy batch finished.');
        System.debug('Total successes: ' + successCount);
        System.debug('Total failures: ' + failureCount);
    }
}