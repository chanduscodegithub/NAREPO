public with sharing class ClientStrategyController {
    
    // Checks if today falls within the allowed edit timeframe defined in metadata    
    @AuraEnabled(cacheable=true)
    public static Boolean isEditAllowed() {
        Date today = Date.today();
        try{
        // Query metadata that stores valid edit windows
        List<Client_Strategy_Edit_TimeFrame__mdt> windows = [
            SELECT Start_Date__c, End_Date__c FROM Client_Strategy_Edit_TimeFrame__mdt WHERE Start_Date__c <= :today AND End_Date__c >= :today
            LIMIT 1 ];
        // Returns true if a valid edit window exists for today
        return !windows.isEmpty();
        } catch (Exception e) { 
            throw new AuraHandledException('Error while checking edit window: ' + e.getMessage());
        }
    }
    
    // Checks if logged-in user has edit access for a given Company (Account)
    @AuraEnabled(cacheable = true)   
    public static Boolean hasEditAccess(Id companyId){
        String userId = UserInfo.getUserId();
        try{
        User currentUser = [SELECT Id, Profile.Name  FROM User  WHERE Id = :userId LIMIT 1];
        // System Admin always has access
        if (currentUser.Profile.Name == 'System Administrator') { 
            return true;
        } 
        // Check if user is assigned in Account fields CM_SCE__c or CMVPCRRVP__c
        Account acc = new Account();
        acc = [SELECT Id,Name,CM_SCE__c,CM_SCE__r.Email,CMVPCRRVP__c,CMVPCRRVP__r.Email FROM Account where Id =: companyId AND (CM_SCE__c =: userId  OR CMVPCRRVP__c =: userId) With USER_MODE];
        // If match is found, grant edit access
        if (acc != null) {
            return true;
        } else {
            return false;
        }
        } catch (Exception e) { 
            throw new AuraHandledException('Error while checking edit window: ' + e.getMessage());
        }            
    }
    
    // Fetches questions(from Config object Question and Answer)
    @AuraEnabled
    public static List<ReturnClientStrategyData> getQuestionsAndAnswers(String accRecordId){
        try{
        system.debug('id'+accRecordId );
        List<ReturnClientStrategyData> wrappperClassList = new List<ReturnClientStrategyData>();
        List<Account> accList = new List<Account>();
        List<Sales_Debrief_Config_Question__c> questionAndAnswerList = new List<Sales_Debrief_Config_Question__c>(); //for querying config quest and ans
        List<Client_Strategy__c> clientStrategySavedDataList = new List<Client_Strategy__c>();
        Map<String,String> labelVsApiMap = new Map<String,String>();       
        // Holds all SObject fields for dynamic SOQL
        List<Schema.SObjectType> objectMdtList = new List<Schema.SObjectType>{Client_Strategy__c.SObjectType};
        List<User> userRoleList = new List<User>();
        String queryFields=' ';
  
        // Determine strategy year (if today is Oct-Dec → next year, otherwise current year)
        Date today = System.today();
        Integer currentYear = today.year();
        Integer strategyYear;
        Boolean editAllowed;
        
        List<Client_Strategy_Edit_TimeFrame__mdt> windows = [
            SELECT Start_Date__c, End_Date__c FROM Client_Strategy_Edit_TimeFrame__mdt WHERE Start_Date__c <= :today LIMIT 1 ];
         if (!windows.isEmpty()){
       /*  Integer startMonth = windows[0].Start_Date__c.month();
         Integer endMonth   = windows[0].End_Date__c.month();
       // if (today.month() >= 10 && today.month() <= 12) {
       if (today.month() >= startMonth && today.month() <= endMonth) {
            strategyYear = currentYear + 1;
        } else {
            strategyYear = currentYear;
        }  */
             //26/09
            Date startDate = windows[0].Start_Date__c;
            if (today >= startDate) {
                strategyYear = currentYear + 1;
            }
             else {
                 strategyYear = currentYear;
             }
             
        }

        String acRecId = String.escapeSingleQuotes(accRecordId);
        Id loggedInUserId = UserInfo.getUserId();
       
        String [] typeOfQuestionsArray = new List<String>();
        
        accList = [SELECT id,Name,UHC_Medical_Members__c FROM Account WHERE id =: String.escapeSingleQuotes(accRecordId) WITH USER_MODE LIMIT 1 ];
        
        ReturnClientStrategyData rcsd = new ReturnClientStrategyData();
        rcsd.nonUpdateableFields = new Set<string>();    
        // Build dynamic field list and map label → API Name
        for(Schema.SObjectType objType: objectMdtList){
            for(Schema.SObjectField fld: objType.getDescribe().fields.getMap().values()){
                if( !fld.getDescribe().isUpdateable() ){
                    rcsd.nonUpdateableFields.add( fld.getDescribe().getName() );
                }
                queryFields += fld.getDescribe().getName()+','; //for querying all fields dynamically
                labelVsApiMap.put(fld.getDescribe().getLabel(),fld.getDescribe().getName());
            }
        }
        
        rcsd.labelVsApiMap = labelVsApiMap;
        
        queryFields = queryFields.substringBeforeLast(','); //to remove last comma
        // Query Client_Strategy__c for that Account + Year
        String csStringQuery = 'Select'+queryFields+' from Client_Strategy__c where Company__c =\'' + acRecId + '\' and Year__c = \'' +strategyYear+'\' WITH USER_MODE LIMIT 1';
        clientStrategySavedDataList = Database.query(csStringQuery);
        
        rcsd.csDataList = clientStrategySavedDataList;
        
        //querying config question and answers
        questionAndAnswerList = [SELECT Id, Year__c, Api__c, Name,Short_Form__c,Question__c, Section_Name__c,Type__c,Module__c,Client_Strategy_Index__c,
                                 Child_Component_Datatype__c, Child_Component_Field_Set__c, Child_Component_Options__c, Child_Component__c,Write_In__c,
                                 Controlling_Value_1__c,Controlling_Value_1__r.Value__c,Controlling_Question_1__c,Controlling_Question_1__r.Api__c,Is_Dependent_Question__c,
                                 (Select id,name,Index__c,Sales_Debrief_Config_Question__c,Value__c,Value_Type__c from Sales_Debrief_Config_Answers__r) FROM Sales_Debrief_Config_Question__c where Module__c = 'Client Strategy' 
                                 ORDER BY Client_Strategy_Index__c ASC];
        
        rcsd.sdConfigList = questionAndAnswerList;
        wrappperClassList.add(rcsd);
        return wrappperClassList;
        } catch (Exception e) { 
            throw new AuraHandledException('Error while checking edit window: ' + e.getMessage());
        }
    }
    
    
    
    //Called on Save. Saves the data in Client Strategy object
   @AuraEnabled
    public static void saveClientStrategyData(Client_Strategy__c dataToSave, String accRecordId){
        try{
   //     Id sdRecordTypeId = Schema.SObjectType.Client_Strategy__c.getRecordTypeInfosByName().get(salesDebriefType).getRecordTypeId();
        List<Client_Strategy__c> upsertSdList = new List<Client_Strategy__c>();
        List<Client_Strategy__c> isSdPresent = [Select id,Year__c from Client_Strategy__c where Company__c =: accRecordId WITH USER_MODE ];
        Date today = Date.today();
        Integer currentYear = today.year();
        Integer strategyYear;
            
        
    /*    if (today.month() >= 9 && today.month() <= 12) {
            strategyYear = currentYear + 1;
        } else {
            strategyYear = currentYear;
        }   */
            
            List<Client_Strategy_Edit_TimeFrame__mdt> windows = [
            SELECT Start_Date__c, End_Date__c FROM Client_Strategy_Edit_TimeFrame__mdt WHERE Start_Date__c <= :today
            LIMIT 1 ];
         if (!windows.isEmpty()){
    /*     Integer startMonth = windows[0].Start_Date__c.month();
         Integer endMonth   = windows[0].End_Date__c.month();
       // if (today.month() >= 10 && today.month() <= 12) {
       if (today.month() >= startMonth && today.month() <= endMonth) {
            strategyYear = currentYear + 1;
        } else {
            strategyYear = currentYear;
        }  */
             //26/09
            Date startDate = windows[0].Start_Date__c;
            if (today >= startDate) {
                strategyYear = currentYear + 1;
            }
             else {
                 strategyYear = currentYear;
             }
        }
            
        
        if(dataToSave != null){
        
        dataToSave.Status__c = 'Draft';
        dataToSave.Completion_Date_Time__c = datetime.now();
            
                if(isSdPresent.size() > 0){                 
                    
                    upsertSdList.add(dataToSave);
                    Database.update( upsertSdList, AccessLevel.USER_MODE );
                    // update as USER upsertSdList;
                    // update upsertSdList;
                }
                else{
                    dataToSave.Company__c = accRecordId;
                    dataToSave.Year__c = String.valueOf(strategyYear);
                    
                    upsertSdList.add(dataToSave);
                    Database.insert( upsertSdList, AccessLevel.USER_MODE );
                }
            }
        } catch (Exception e) { 
            throw new AuraHandledException('Error while checking edit window: ' + e.getMessage());
        }
    }
    
    //Fetch the UHC Total Medical Member Count, Subtype and Client Strategy Override Field
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getMedicalMemberCount(Id recordId) {
        try{
        Account acc = [SELECT Id, UHC_Medical_Members__c, Client_Strategy_Override__c,Subtype__c   // if you need to check for UMR, Surest, etc.
            FROM Account WHERE Id = :recordId LIMIT 1];
        
        Map<String, Object> result = new Map<String, Object>();
        result.put('memberCount', acc.UHC_Medical_Members__c != null ? acc.UHC_Medical_Members__c : 0);
        result.put('override', acc.Client_Strategy_Override__c);
        result.put('accountType', acc.Subtype__c);
        return result;
        } catch (Exception e) { 
            throw new AuraHandledException('Error while checking edit window: ' + e.getMessage());
        }
    }
    
    //While Mark as Completed Check all the question are answered
    @AuraEnabled
    public static Map<String, Object> markCompleteChecked(Id recordId, string year) {
        try{
        Map<String, Object> response = new Map<String, Object>();
        List<String> unanswered = new List<String>();

        List<String> questionFields = new List<String>{'Affordability_programs__c', 'Behavioral_health_programs__c', 'Client_experience_and_support__c', 'Clinical_management_programs__c',
    'Data_analysis_and_reporting__c', 'Fees_and_credits__c', 'Guarantees__c', 'Integration_across_programs__c', 'Member_experience_and_engagement__c', 'Network_design__c', 'Network_discounts__c',
    'Pharmacy_programs__c', 'Plan_design__c', 'Wellness_programs__c', 'Network_Access__c', 'Brand_Image__c', 'Innovation__c', 'Product_breadth__c', 'Administrative_capabilities__c', 'ESG_Issues__c',
    'CDHP_full_replacement__c', 'Voluntary_benefits__c', 'Value_based_benefits__c', 'Quality_Cost_tiering__c', 'POS_tiering__c', 'Reference_based_pricing__c', 'Intermittent_workforce__c',
    'Employee_affordability__c', 'Co_Pay_insurance__c', 'ICHRA_plan__c', 'Virtual_First_Solution__c', 'Traditional_PCP_Coordinated_Care__c', 'Site_of_Care_Steerage__c', 'Direct_Contracting_with_a_Provider__c', 
    'Advanced_Primary_Care_Strategy__c', 'Streamlined_Narrow_Networks__c', 'ACO_Centric_Networks__c', 'Prioritized_Access__c', 'Important_Network_features__c', 'Healthy_workplace__c',
    'On_site_near_site_clinics__c', 'Onsite_health_specialist__c', 'Cancer_Screening_and_Support_Programs__c', 'Medication_assisted_weight_loss__c', 'Women_s_health_solutions__c', 'Concierge_advocacy__c',
    'Tools_technologies__c', 'Engagement_Platform_Adoption__c', 'Digital_condition_mgmt__c', 'Diversity_equity_and_inclusion__c', 'LGBTQ_support__c', 'Social_Determinants_of_Health__c', 'Health_Equity__c', 
    'How_is_client_covering_GLP_1s__c', 'Preventive_drug_lists__c', 'Prescription_savings_outreach__c', 'Point_of_Sale_Rebates__c', 'Critical_affordability_drug_lists__c', 
    'Cash_price_into_member_benefit__c', 'Affordability_solutions__c', 'Stop_loss_cover_for_high_cost_therapy__c', 'Transparent_non_traditional_PBM__c', 'Biosimilar_steerage__c', 'Specialty_Pharmacy_carve_out__c',
    'Integrated_plan_administration__c', 'Member_experience_integration__c', 'Member_savings_opportunities__c', 'Integrated_benefits_provider__c', 'Integrated_Med_Pharmacy_digital__c', 'Electronic_prescribing_integration__c', 
    'Integrated_specialty_management__c', 'Specialty_pharmacy_network_solution__c', 'Cardiac_COE__c', 'Fertility_Family_Forming_COE__c', 'Neonatal_COE__c', 'Kidney_COE__c', 'Musculoskeletal_Spine_Joint_COE__c', 
    'Maternity_COE__c', 'Mental_Health_Substance_Disorder__c', 'Transgender_Health_COE__c', 'Cancer_COE__c', 'Bariatric_COE__c', 'Weight_Management_COE__c', 'EAP_Modernization__c', 'Family_Special_Needs__c', 
    'Peer_Support__c', 'Online_tools_apps_videos_webinars__c', 'Virtual_coaching_counseling_therapy__c', 'Onsite_coaching_counseling_therapy__c', 'Burnout_stress_management_programs__c', 'Pediatric_focused_mental_health_sup__c',
    'Behavioral_Health_Engagement__c', 'Linkage_to_business_measures__c', 'Data_warehouse__c', 'SDOH_and_health_equity__c', 'Population_health_management_report__c', 'Wellness_program_offered__c', 'Client_rethinking_wellness_approach__c',
    'Biometric_screenings__c', 'Health_risk_assessment__c', 'Cancer_screenings__c', 'Tobacco_cessation_programs__c', 'Physical_activity_challenges__c', 'Weight_management_programs__c',
    'Wellness_lifestyle_coaching__c', 'Sleep_management_programs__c',
    'Communication_resource_available__c', 'View_of_open_enrollment_onboarding__c','Standard_vs_custom_communications__c','Approach_to_targeted_messaging__c','Topics_communicated_to_emp_yearly__c',
    'Value_story_support_in_client_convos__c', 'Ways_to_strengthen_value_story__c', 'Competitive_landscape_updated__c', 'Annual_open_enrollment_kit_shared__c'
    };  //25/09
        
        String soql = 'SELECT Id, Status__c,Company__c,Completion_Date_Time__c,Year__c, ' + String.join(questionFields, ',') + ', Describe_Network_features__c,GLP_1_obesity_management_reqs__c,Planned_changes_to_wellness_program__c,Earned_Full_Incentive__c, Earned_Partial_Incentive__c, Did_Not_Earn_Incentive__c, NA_New_program__c, Program_administrator_vendor__c,Wellness_program_duration__c, Wellness_program_offered_to__c, Participation_in_wellness_program__c, Non_UHC_Optum_wellness_reasons__c,Max_annual_employee_reward__c,Max_annual_spouse_partner_reward__c,How_are_Rewards_distributed__c,Other_reward_distribution_method__c ' + ' FROM Client_Strategy__c WHERE Company__c = :recordId and Year__c = :year' + ' ORDER BY Year__c DESC ';
        List<Client_Strategy__c> csList = Database.query(soql);
        
        if (csList.isEmpty()) {
            response.put('success', false);
            response.put('message', 'No Client Strategy record found for this Account.');
            return response;
        }

        Client_Strategy__c cs = csList[0];

        // Validate questions
        for (String field : questionFields) {
            Object val = cs.get(field);
            if (val == null || String.valueOf(val).trim() == '') {
                unanswered.add(field);
            }
            
            if (field == 'Important_Network_features__c') {
        String rawVal = (val == null) ? '' : String.valueOf(val);
        System.debug('Checking Important_Network_features__c: >>>' + rawVal + '<<<');

        if (String.isBlank(rawVal)) {
            unanswered.add(field);
        }
        continue; // move to next field
    }
            
            
        }
        
      /*  if (String.valueOf(cs.get('How_is_client_covering_GLP_1s__c')) == 'For treatment of obesity') {          
            Object obesityReqs = cs.get('GLP_1_obesity_management_reqs__c');
            if (obesityReqs == null || String.valueOf(obesityReqs).trim() == '') {
                unanswered.add('GLP_1_obesity_management_reqs__c');
            }
        } */
            
        String glpCovering = String.valueOf(cs.get('How_is_client_covering_GLP_1s__c'));

        if (glpCovering != null && glpCovering.contains('For treatment of obesity')) {
            Object obesityReqs = cs.get('GLP_1_obesity_management_reqs__c');
            if (obesityReqs == null || String.valueOf(obesityReqs).trim() == '') {
                unanswered.add('GLP_1_obesity_management_reqs__c');
            }
        }
            
        
       /* if (String.valueOf(cs.get('Important_Network_features__c')) == 'Other') {
            Object describeNetwork = cs.get('Describe_Network_features__c');
            if (describeNetwork == null || String.valueOf(describeNetwork).trim() == '') {
                unanswered.add('Describe_Network_features__c');
            }
        } */
            
        String networkFeatures = String.valueOf(cs.get('Important_Network_features__c'));

        if (networkFeatures != null && networkFeatures.contains('Other')) {
            Object describeNetwork = cs.get('Describe_Network_features__c');
            if (describeNetwork == null || String.valueOf(describeNetwork).trim() == '') {
                unanswered.add('Describe_Network_features__c');
            }
        }  //25/09
            
        if (String.valueOf(cs.get('Client_rethinking_wellness_approach__c')) == 'Yes') {          
            Object obesityReqs = cs.get('Planned_changes_to_wellness_program__c');
            if (obesityReqs == null || String.valueOf(obesityReqs).trim() == '') {
                unanswered.add('Planned_changes_to_wellness_program__c');
            }
        }
            
        if (String.valueOf(cs.get('Wellness_program_offered__c')) == 'Yes') {          
            List<String> fieldsToCheck = new List<String>{ 'Program_administrator_vendor__c', 'Wellness_program_duration__c',
        'Wellness_program_offered_to__c', 'Participation_in_wellness_program__c', 'Non_UHC_Optum_wellness_reasons__c','Max_annual_employee_reward__c',
                'Max_annual_spouse_partner_reward__c','How_are_Rewards_distributed__c'
        };
           for (String fieldName : fieldsToCheck) {
         	Object fieldVal = cs.get(fieldName);
        		if (fieldVal == null || String.valueOf(fieldVal).trim() == '') {
            		unanswered.add(fieldName);
        		}
    		}
            
            Decimal full = (Decimal)cs.get('Earned_Full_Incentive__c');
        Decimal partial = (Decimal)cs.get('Earned_Partial_Incentive__c');
        Decimal notEarned = (Decimal)cs.get('Did_Not_Earn_Incentive__c');
        String naVal = (String)cs.get('NA_New_program__c');
            
        Boolean allIncentivesNull = (full == null && partial == null && notEarned == null);
        
    
        if (!(allIncentivesNull && String.isNotBlank(naVal))) {
            Decimal total = (full == null ? 0 : full) + (partial == null ? 0 : partial) + (notEarned == null ? 0 : notEarned);
        if (total != 100) {
            unanswered.add('Earned_Full_Incentive__c');
            unanswered.add('Earned_Partial_Incentive__c');
            unanswered.add('Did_Not_Earn_Incentive__c');
        }
        }
            
        }
            
        
                      

        if (unanswered.isEmpty()) {
       /*     cs.Status__c = 'Completed';
            cs.Completion_Date_Time__c = System.now();
            update cs; */
            response.put('success', true);
        } else {
            response.put('success', false);
            response.put('unansweredFields', unanswered);
        }
        system.debug('unansweredFieldssuccess'+JSON.serialize(unanswered) );
        system.debug('successunansweredFields'+JSON.serialize(response) );
        response.put('status', cs.Status__c);
        return response;
        } catch (Exception e) { 
            throw new AuraHandledException('Error while checking edit window: ' + e.getMessage());
        }
    }
    
    //After MarkAsCompleted updated the status to Complete and date/time in Client Strategy
    @AuraEnabled
    public static Boolean markAsComplete(Id recordId, string year) {
        try{
        List<Client_Strategy__c> csList = [SELECT Id, Year__c FROM Client_Strategy__c WHERE Company__c = :recordId and Year__c = :year ORDER BY Year__c DESC];
    
        if (csList.isEmpty()) {
            return false;
        }
    
        Client_Strategy__c cs = csList[0];
         if (Schema.sObjectType.Client_Strategy__c.isUpdateable() &&
                Schema.sObjectType.Client_Strategy__c.fields.Status__c.isUpdateable() &&
                Schema.sObjectType.Client_Strategy__c.fields.Completion_Date_Time__c.isUpdateable()) {
        cs.Status__c = 'Completed';
        cs.Completion_Date_Time__c = datetime.now();
        update AS USER cs;
                }
        return true;
        } catch (Exception e) { 
            throw new AuraHandledException('Error while checking edit window: ' + e.getMessage());
        }
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Client_Strategy_Edit_TimeFrame__mdt> getTimeFrames() {
        return [ SELECT Start_Month__c ,End_Month__c,Start_Date__c FROM Client_Strategy_Edit_TimeFrame__mdt];
    }

    public class ReturnClientStrategyData {
        @AuraEnabled
        public List<Sales_Debrief_Config_Question__c> sdConfigList {get;set;}
        
        @AuraEnabled
        public List<Client_Strategy__c> csDataList {get;set;}
        
        @AuraEnabled
        public Set<String> nonUpdateableFields { get; set; }
        
        @AuraEnabled
        public Map<String,String> labelVsApiMap {get;set;}
        
    }
    
}