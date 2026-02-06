/**
* Purpose     : staff assignment does not have a policy then take values from company's fte and fte outlier (both field are rollup to the policy info.)
*               and calculate the CM BOB fte and CM BOB fte outlier
* Class       : CP_StaffAssignMultiPolicyBatch
* Test class  : CP_StaffAssignSinglePolicyBatchTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
global with sharing class CP_StaffAssignMultiPolicyBatch implements Schedulable,Database.Batchable<Sobject>, Database.Stateful {
    global static final Decimal ZERO = 0.0;
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'Select Id,Dedicated_to_case__c ,RecordTypeId, Staff_User_Assignment__r.Current_Weighting1__c ,Customer_Name__r.Capacity_Plan_Spclty_Outlier_Backend__c,Customer_Name__r.Capacity_Plan_Spl_Adj_Case_FTE_Backend__c,Customer_Name__r.Capacity_Plan_CMC_Adj_Case_FTE_Backend__c,Customer_Name__r.Capacity_Plan_UMR_Adj_Case_FTE_Backend__c,Customer_Name__r.Capacity_Plan_Surest_Outlier_Backend__c,Customer_Name__r.Capacity_Plan_SurestAdj_Case_FTE_Backend__c,Role_on_Case__c,of_case__c,CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c,CM_BOB_FTE_Based_on_Adj_Case_FTE1__c,Customer_Name__c, Medical_Policy_Number__c,   Customer_Name__r.Capacity_Planning_FTE__c, Customer_Name__r.Capacity_Planning_FTE_outlier_backend__c, End_Date__c,Medical_Policy_Number__r.CMC_ADJ_Case_FTE__c,Medical_Policy_Number__r.UMR_ADJ_Case_FTE__c, Customer_Name__r.Capacity_Plan_CMC_Outlier_Backend__c, Customer_Name__r.Capacity_Plan_UMR_Outlier_Backend__c,Staffing_Assignment__r.CMC_Override_Current_Weight__c, Staffing_Assignment__r.CMC_Current_Weight__c, Staffing_Assignment__r.Override_Current_Weight_User__c,Staffing_Assignment__r.SBC_Override_Current_Weighting__c,Staffing_Assignment__r.SBC_Current_Weighting__c From Staff_Assignment__c where Medical_Policy_Number__c = null and Customer_Name__c != null and Id = \'a0iVB000002xx1JYAQ\'',AccessLevel.USER_MODE
        );
    }
    
    global void execute(SchedulableContext context) {
        Database.executeBatch(new CP_StaffAssignMultiPolicyBatch());
    }
    
    global void execute(Database.BatchableContext bc, List<Staff_Assignment__c> scope){
        system.debug('Inside Execute ');
        
        List<Staff_Assignment__c> staffAssignmentUpdateDmlList = new List<Staff_Assignment__c>();
        
        //***********************************varun*********************************************//
        Id ipmAssignmentId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('IPM Assignment').getRecordTypeId();
        Set<Id> companyIds = new Set<Id>();
  //      Map<Id,Decimal> hocMap = new Map<Id,Decimal>();
        
        for(Staff_Assignment__c eachStaffAssign : scope){
            if(eachStaffAssign.RecordTypeId == ipmAssignmentId && eachStaffAssign.Customer_Name__c != null){
                companyIds.add(eachStaffAssign.Customer_Name__c);
            }
        }
        CP_StaffAssignMultiPolicyBatch.HocResultWrapper hocResult = calculateHOC(companyIds);
                //Added by Vignesh
        Map<Id, Decimal> hocMap       = hocResult.hocRollupMap;
        Map<Id, Decimal> totalHoursMap = hocResult.totalHoursMap;
        Map<Id, Decimal> monthImpMap   = hocResult.monthImpMap;
        
        //Added New
        Set<Id> companyIdsall = new Set<Id>();
        for (Staff_Assignment__c mulitplePolicy : scope) {
            if (mulitplePolicy.Customer_Name__c != null) {
                companyIdsall.add(mulitplePolicy.Customer_Name__c);
            }
        }
        
        System.debug('Company Ids => ' + companyIdsall);
        Map<Id, Decimal> companyToTotalPolicyAdjFte = new Map<Id, Decimal>();
        List<Policy_Information__c> policyList = [SELECT Id, Company__c, Policy_Type__c, Adj_Case_FTE__c, UMR_ADJ_Case_FTE__c, Surest_Adj_Case_FTE__c, UMR__c,Surest__c,Adj_Case_FTE_for_outlierss__c,UMR_Adj_Case_FTE_for_Outliers__c, Surest_Adj_Case_FTE_for_Outlier__c FROM Policy_Information__c WHERE Company__c IN :companyIdsall and Policy_Status__c = 'Active'];
        Decimal totalAdjCaseFte = 0;
		Decimal totalAdjOutlierCaseFte = 0;
        for (Policy_Information__c pi : policyList){
            
            String policyType = pi.Policy_Type__c != null ? pi.Policy_Type__c  : '';
            Decimal umrToAdd  = 0;
            Decimal surestToAdd  = 0;
            Decimal adjToAdd  = 0;
            Decimal umrOutlierToAdd  = 0;
            Decimal surestOutlierToAdd  = 0;
            Decimal adjOutlierToAdd  = 0;
            
            if (pi.UMR__c == true) {
                umrToAdd = pi.UMR_ADJ_Case_FTE__c;
                umrOutlierToAdd = pi.UMR_Adj_Case_FTE_for_Outliers__c;
            }
            else if (pi.Surest__c == true) {
                surestToAdd = pi.Surest_Adj_Case_FTE__c;
                surestOutlierToAdd = pi.Surest_Adj_Case_FTE_for_Outlier__c;
            }
            else {
                adjToAdd = pi.Adj_Case_FTE__c;
                adjOutlierToAdd = pi.Adj_Case_FTE_for_outlierss__c;
            }

    		totalAdjCaseFte = umrToAdd + surestToAdd + adjToAdd;
            totalAdjOutlierCaseFte = umrOutlierToAdd + surestOutlierToAdd + adjOutlierToAdd;
            companyToTotalPolicyAdjFte.put(pi.Company__c, (companyToTotalPolicyAdjFte.containsKey(pi.Company__c) ? companyToTotalPolicyAdjFte.get(pi.Company__c) : 0 ) + totalAdjCaseFte );
            companyToTotalPolicyAdjFte.put(pi.Company__c, (companyToTotalPolicyAdjFte.containsKey(pi.Company__c) ? companyToTotalPolicyAdjFte.get(pi.Company__c) : 0 ) + totalAdjOutlierCaseFte );

            System.debug('Company Total Adj FTE so far => ' + companyToTotalPolicyAdjFte.get(pi.Company__c));
        }
       
        
        
        
        
        //***********************************varun*********************************************//
        
        for(Staff_Assignment__c eachStaffAssign : scope){
            system.debug('Policy Info Id = '+eachStaffAssign.Id);
            Decimal ofCase = eachStaffAssign.of_case__c;
            eachStaffAssign.Hours_Of_Complexity_Backend__c = hocMap.get(eachStaffAssign.Customer_Name__c);
            //Added by Vignesh
            eachStaffAssign.Total_of_hours_Backend__c = totalHoursMap.get(eachStaffAssign.Customer_Name__c);
            eachStaffAssign.Months_Implementing_Backend__c = monthImpMap.get(eachStaffAssign.Customer_Name__c);
            
            //Added New
            Decimal totalPolicyAdjFte = companyToTotalPolicyAdjFte.containsKey(eachStaffAssign.Customer_Name__c) ? companyToTotalPolicyAdjFte.get(eachStaffAssign.Customer_Name__c) : 0;
            System.debug('Final Total Policy Adj FTE for Customer ' + eachStaffAssign.Customer_Name__c + ' => ' + totalPolicyAdjFte);
            System.debug('ofCase Value => ' + ofCase);
            Decimal fteOfCasefinal = ofCase*totalPolicyAdjFte;
            System.debug('Final FTE of Case => ' + fteOfCasefinal);
            
            Decimal totalPolicyAdjOutlierFte = companyToTotalPolicyAdjFte.containsKey(eachStaffAssign.Customer_Name__c) ? companyToTotalPolicyAdjFte.get(eachStaffAssign.Customer_Name__c) : 0;
            System.debug('Final Total Policy Adj FTE for Customer ' + eachStaffAssign.Customer_Name__c + ' => ' + totalPolicyAdjFte);
            System.debug('ofCase Value => ' + ofCase);
            Decimal fteOfOutlierCasefinal = ofCase*totalPolicyAdjOutlierFte;
            System.debug('Final FTE of Case => ' + fteOfCasefinal);

            
            if( eachStaffAssign.End_Date__c == null || eachStaffAssign.End_Date__c >= System.today() ){
                if(ofCase == null){
                    ofCase = CP_StaffAssignMultiPolicyBatch.ZERO;
                }
                Decimal fteRounded              = eachStaffAssign.Customer_Name__r.Capacity_Planning_FTE__c.setScale(4,RoundingMode.HALF_UP);
                Decimal fteoutlieRounded        = eachStaffAssign.Customer_Name__r.Capacity_Planning_FTE_outlier_backend__c.setScale(4,RoundingMode.HALF_UP);
                Decimal fteOfCase               = ofCase* fteRounded;
                Decimal outlierOfCase           = ofCase* fteoutlieRounded;
                Decimal currentUserWeightage    = eachStaffAssign.Staff_User_Assignment__r.Current_Weighting1__c;
                
                
                if(currentUserWeightage== null){
                    currentUserWeightage=CP_StaffAssignMultiPolicyBatch.ZERO;
                }
                if(eachStaffAssign.Dedicated_to_case__c != 'Yes'){
                    if(fteOfCase != null){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=  fteOfCase;
                    }
                    if(outlierOfCase != null){
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=outlierOfCase;
                    }
                    
                }else{
                    if(fteOfCase> currentUserWeightage && fteOfCase != null){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c= fteOfCase;
                    }else if(currentUserWeightage != null){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c= currentUserWeightage;
                    }
                    if(outlierOfCase> currentUserWeightage && outlierOfCase != null){
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c= outlierOfCase;
                    }else if(currentUserWeightage != null){
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=  currentUserWeightage;
                    }
                }
                //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//   
                Decimal cmcFteRounded = eachStaffAssign.Customer_Name__r.Capacity_Plan_CMC_Adj_Case_FTE_Backend__c.setScale(4,RoundingMode.HALF_UP);
                Decimal umrFteROunded = eachStaffAssign.Customer_Name__r.Capacity_Plan_UMR_Adj_Case_FTE_Backend__c.setScale(4,RoundingMode.HALF_UP);
                Decimal specialtyFteROunded = eachStaffAssign.Customer_Name__r.Capacity_Plan_Spl_Adj_Case_FTE_Backend__c.setScale(4,RoundingMode.HALF_UP);
                Decimal cmcBobFte = cmcFteRounded * ofCase;
                Decimal umrBobFte = umrFteROunded * ofCase;
                Decimal specialtyBobFte = specialtyFteROunded * ofCase;
                system.debug('eachStaffAssign.Id = '+eachStaffAssign.Id);
                system.debug('cmcFteRounded = '+cmcFteRounded);
                system.debug('umrFteROunded = '+umrFteROunded);
                system.debug('specialtyFteROunded = '+specialtyFteROunded);
                system.debug('cmcBobFte = '+cmcBobFte);
                system.debug('umrBobFte = '+umrBobFte);
                system.debug('specialtyBobFte = '+specialtyBobFte);
                system.debug('ofCase = '+ofCase);
                system.debug('cmcBobFte = '+cmcBobFte);
                //Added by Vignesh - Capacity Model 2025s
                Decimal surestFteROunded = eachStaffAssign.Customer_Name__r.Capacity_Plan_SurestAdj_Case_FTE_Backend__c.setScale(4,RoundingMode.HALF_UP);
                Decimal surestBobFte = surestFteROunded * ofCase;
                
         /*       Decimal allTraditionalRounded = fteRounded + umrFteROunded +surestFteROunded;
                Decimal allTraditionalBobFte = allTraditionalRounded * ofCase;
                
                System.debug('fteRounded = ' + fteRounded);
                System.debug('umrFteROunded = ' + umrFteROunded);
                System.debug('surestFteROunded = ' + surestFteROunded);
                System.debug('allTraditionalRounded = ' + allTraditionalRounded);
                System.debug('ofCase = ' + ofCase);
				System.debug('allTraditionalBobFte = ' + allTraditionalBobFte); */
                
                
                //---------------------------------------------------------SAMARTH---------------------------------------------------------
                Decimal cmcOutlierRounded = eachStaffAssign.Customer_Name__r.Capacity_Plan_CMC_Outlier_Backend__c.setScale(4,RoundingMode.HALF_UP);
                Decimal umrOutlierRounded = eachStaffAssign.Customer_Name__r.Capacity_Plan_UMR_Outlier_Backend__c.setScale(4,RoundingMode.HALF_UP);
                Decimal specialtyOutlierRounded = eachStaffAssign.Customer_Name__r.Capacity_Plan_Spclty_Outlier_Backend__c.setScale(4,RoundingMode.HALF_UP);
                Decimal cmcAdjFteOutlier = cmcOutlierRounded * ofCase;
                Decimal umrAdjFteOutlier = umrOutlierRounded * ofCase;
                Decimal specialtyAdjFteOutlier = specialtyOutlierRounded * ofCase;
                
                system.debug('cmcOutlierRounded = '+cmcOutlierRounded);
                system.debug('umrOutlierRounded = '+umrOutlierRounded);
                system.debug('specialtyOutlierRounded = '+specialtyOutlierRounded);
                system.debug('cmcAdjFteOutlier = '+cmcAdjFteOutlier);
                system.debug('umrAdjFteOutlier = '+umrAdjFteOutlier);
                system.debug('specialtyAdjFteOutlier = '+specialtyAdjFteOutlier);
                //Added by Vignesh - Capacity Model 2025s
                Decimal surestOutlierRounded = eachStaffAssign.Customer_Name__r.Capacity_Plan_Surest_Outlier_Backend__c.setScale(4,RoundingMode.HALF_UP);
                Decimal surestAdjFteOutlier = surestOutlierRounded * ofCase;
                //---------------------------------------------------------SAMARTH---------------------------------------------------------

               
                
                Decimal cmcOverRideCurrentUserWeight = eachStaffAssign.Staffing_Assignment__r.CMC_Override_Current_Weight__c != null ? eachStaffAssign.Staffing_Assignment__r.CMC_Override_Current_Weight__c : null;
                Decimal cmcCurrentUserWeight = eachStaffAssign.Staffing_Assignment__r.CMC_Current_Weight__c != null ? eachStaffAssign.Staffing_Assignment__r.CMC_Current_Weight__c : CP_StaffAssignMultiPolicyBatch.ZERO; 
                Decimal overRideCurrentWeightUser = eachStaffAssign.Staffing_Assignment__r.Override_Current_Weight_User__c != null ? eachStaffAssign.Staffing_Assignment__r.Override_Current_Weight_User__c : null;
                Decimal cmcResult = cmcOverRideCurrentUserWeight != null ? cmcOverRideCurrentUserWeight : cmcCurrentUserWeight;
                Decimal specialtyResult = eachStaffAssign.Staffing_Assignment__r.SBC_Override_Current_Weighting__c != null ? eachStaffAssign.Staffing_Assignment__r.SBC_Override_Current_Weighting__c : eachStaffAssign.Staffing_Assignment__r.SBC_Current_Weighting__c;
                Decimal userWeightFinal =  overRideCurrentWeightUser != null ? overRideCurrentWeightUser : currentUserWeightage;
                
                if(eachStaffAssign.Medical_Policy_Number__c == null){
                    if(eachStaffAssign.Dedicated_to_case__c == 'Yes' && eachStaffAssign.Role_on_Case__c == 'Client Management Consultant'){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = math.max(cmcBobFte, cmcResult);
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c	= math.max(cmcAdjFteOutlier, cmcResult); //SAMARTH
                        system.debug('eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = '+eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c);
                    }
                    else if((eachStaffAssign.Dedicated_to_case__c == 'No' || eachStaffAssign.Dedicated_to_case__c == null) && eachStaffAssign.Role_on_Case__c == 'Client Management Consultant'){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = cmcBobFte;
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c	= cmcAdjFteOutlier; //SAMARTH
                    }
                    
                    if(eachStaffAssign.Dedicated_to_case__c == 'Yes' && eachStaffAssign.Role_on_Case__c == 'Specialty Benefits Client Manager'){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = math.max(specialtyBobFte, specialtyResult);
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c	= math.max(specialtyAdjFteOutlier, specialtyResult);
                    }
                    else if((eachStaffAssign.Dedicated_to_case__c == 'No' || eachStaffAssign.Dedicated_to_case__c == null) && eachStaffAssign.Role_on_Case__c == 'Specialty Benefits Client Manager'){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = specialtyBobFte;
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c	= specialtyAdjFteOutlier;
                    }
                    
                    if(eachStaffAssign.Dedicated_to_case__c == 'Yes' && eachStaffAssign.Role_on_Case__c == 'UMR Client Manager'){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = math.max(umrBobFte, userWeightFinal);
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c	= math.max(umrAdjFteOutlier, userWeightFinal); //SAMARTH
                    }
                    else if((eachStaffAssign.Dedicated_to_case__c == 'No' || eachStaffAssign.Dedicated_to_case__c == null)&& eachStaffAssign.Role_on_Case__c == 'UMR Client Manager'){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = umrBobFte;
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c	= umrAdjFteOutlier; //SAMARTH
                        
                    }
                    if(eachStaffAssign.Dedicated_to_case__c == 'Yes' && (eachStaffAssign.Role_on_Case__c == 'Client Manager' || eachStaffAssign.Role_on_Case__c == 'Benefit Consultant')){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = math.max(fteOfCasefinal, userWeightFinal);
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c	= math.max(fteOfOutlierCasefinal, userWeightFinal);
                    }
                    else if((eachStaffAssign.Dedicated_to_case__c == 'No' || eachStaffAssign.Dedicated_to_case__c == null)  && (eachStaffAssign.Role_on_Case__c == 'Client Manager' || eachStaffAssign.Role_on_Case__c == 'Benefit Consultant')){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = fteOfCasefinal;
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c = fteOfOutlierCasefinal;
                    }
                    
                    //Added by Vignesh -- Capacity Model 2025s
                    if(eachStaffAssign.Dedicated_to_case__c == 'Yes' && eachStaffAssign.Role_on_Case__c == 'Surest Client Manager'){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = math.max(surestBobFte, userWeightFinal);
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c	= math.max(surestAdjFteOutlier, userWeightFinal); //SAMARTH
                    }
                    else if((eachStaffAssign.Dedicated_to_case__c == 'No' || eachStaffAssign.Dedicated_to_case__c == null)&& eachStaffAssign.Role_on_Case__c == 'Surest Client Manager'){
                        eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = surestBobFte;
                        eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c	= surestAdjFteOutlier; //SAMARTH                       
                    }
                }
                
                
                //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//
                
            }
            system.debug('eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c  outer= '+eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c);
            staffAssignmentUpdateDmlList.add(eachStaffAssign);
        }
        
        
        if(!staffAssignmentUpdateDmlList.isempty() && staffAssignmentUpdateDmlList!=null && Schema.sObjectType.Staff_Assignment__c.isAccessible()){
               try{
                   system.debug('Before Update = '+staffAssignmentUpdateDmlList);
                   database.update(staffAssignmentUpdateDmlList,false);
                   system.debug('After Update = '+staffAssignmentUpdateDmlList);
               }catch(Exception e){
                   system.debug('update failed staffAssignmentUpdateDmlList : '+e.getMessage()); 
               }
           }
    }
    global void finish(Database.BatchableContext bc){
        // Database.executeBatch(new staffBatch());
        Database.executeBatch(new capacityPlan_RollupToSaff());
    }
    
    private static HocResultWrapper calculateHOC(Set<Id> companyIds){
        
        Map<Id,Decimal> hocRollupMap = new Map<Id,Decimal>();
        
        Map<Id,Decimal> totalHoursMap = new Map<Id,Decimal>();
        Map<Id,Decimal> monthImpMap = new Map<Id,Decimal>();
        
        String query = 'SELECT Company__c, Sum(IPM_Total_of_Hours__c) TotalHours, Sum(IPM_Months_Implementing__c) MonthImp, SUM(IPM_Hours_Of_Complexity__c) totalComplexity FROM Policy_Information__c WHERE Company__c =:companyIds AND Policy_Status__c = \'Active\' GROUP BY Company__c';
        List<AggregateResult> results = Database.query(query);
        for (AggregateResult ar : results){
            Id companyId = (Id) ar.get('Company__c');
            Decimal totalComplexity = (Decimal) ar.get('totalComplexity');
            //Added by Vignesh - Capacity Model
            Decimal totalHours = (Decimal) ar.get('TotalHours');
            Decimal totalMonthImp = (Decimal) ar.get('MonthImp');
            
            hocRollupMap.put(companyId, totalComplexity);
            
            totalHoursMap.put(companyId, totalHours);
      	 	monthImpMap.put(companyId, totalMonthImp);
            
        }
        
        HocResultWrapper wrapper = new HocResultWrapper();
        wrapper.hocRollupMap = hocRollupMap;
        wrapper.totalHoursMap = totalHoursMap;
        wrapper.monthImpMap = monthImpMap;
        
		return wrapper;   
        //query policy info using company id and create a map of company and sum of HOC
        
    }
    
    public class HocResultWrapper {
    public Map<Id, Decimal> hocRollupMap { get; set; }
    public Map<Id, Decimal> totalHoursMap { get; set; }
    public Map<Id, Decimal> monthImpMap { get; set; }
}
}