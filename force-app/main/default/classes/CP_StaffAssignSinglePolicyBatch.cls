/**
* Purpose     : Staff assignment have a single policy then take fte and fte outlier from policy information and update to CM BOB FTE and CM BOB FTE outlier
* Class       : CP_StaffAssignSinglePolicyBatch
* Test class  :
*
* =============================================================================
* History
* ------------------\-----
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
global with sharing class CP_StaffAssignSinglePolicyBatch implements Schedulable,Database.Batchable<Sobject>, Database.Stateful {
    global static final Decimal ZERO = 0.0;
    global Database.QueryLocator start(Database.BatchableContext bc) {
        String activePolicy = 'Active';
        return Database.getQueryLocator(
            'SELECT Id,Dedicated_to_case__c , Staff_User_Assignment__r.Current_Weighting1__c,Role_on_Case__c, of_case__c, Customer_Name__c, CM_BOB_FTE_Based_on_Adj_Case_FTE1__c, CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c,Medical_Policy_Number__r.Name,Medical_Policy_Number__r.Policy_Type__c, Medical_Policy_Number__r.IPM_Hours_Of_Complexity__c,Medical_Policy_Number__r.IPM_Total_of_Hours__c,Medical_Policy_Number__r.IPM_Months_Implementing__c, RecordTypeId,'+
            'Medical_Policy_Number__r.Adj_Case_FTE__c,Medical_Policy_Number__r.Adj_Case_FTE_for_Outlierss__c ,Medical_Policy_Number__r.CMC_Adj_Case_FTE_for_Outliers__c, Medical_Policy_Number__r.UMR_Adj_Case_FTE_for_Outliers__c,Medical_Policy_Number__r.surest__c,Medical_Policy_Number__r.Specialty_Adj_Case_FTE__c,Medical_Policy_Number__r.Specialty_Adj_Case_FTE_for_Outliers__c,Medical_Policy_Number__r.Surest_Adj_Case_FTE__c,Medical_Policy_Number__r.Surest_Adj_Case_FTE_for_Outlier__c,'+
            'End_Date__c From Staff_Assignment__c where Medical_Policy_Number__c != null and Medical_Policy_Number__r.Policy_Status__c = :activePolicy and Customer_Name__c != null '
        );
    }
    global void execute(SchedulableContext context) {
        Database.executeBatch(new CP_StaffAssignSinglePolicyBatch());
    }
    global void execute(Database.BatchableContext bc, List<Staff_Assignment__c> scope){
        Id ipmAssignmentId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('IPM Assignment').getRecordTypeId();
        List<Staff_Assignment__c> staffAssignmentUpdateDmlList = new List<Staff_Assignment__c>();
        Map<Id,Policy_Information__c> policyInfoMap = new Map <Id,Policy_Information__c>(); 
        Set<Id> policyIds = new Set<Id>();
        List<String> medicalPolicy = new List<String>{'Medical'};
		List<String> specialtyPolicy = new List<String>{'Dental','Vision','Accident Protection','Critical Illness','Hospital Indemnity','Life/Di','Pet', 'Flexwork'};  //Added by Vignesh - Capacity Model 2025s
        
        for(Staff_Assignment__c st : scope){
            system.debug('Inside policy Id For ---> '+st.Medical_Policy_Number__c);
            policyIds.add(st.Medical_Policy_Number__c);
        }
        system.debug('PolicyId ---> '+policyIds);
        List<Policy_Information__c> policyInfoList = [SELECT Id,CMC_ADJ_Case_FTE__c,UMR_ADJ_Case_FTE__c,CMC_Adj_Case_FTE_for_Outliers__c,UMR_Adj_Case_FTE_for_Outliers__c,Specialty_Adj_Case_FTE_for_Outliers__c,Specialty_Adj_Case_FTE__c,surest__c,
                                                      Surest_Adj_Case_FTE__c, Surest_Adj_Case_FTE_for_Outlier__c FROM Policy_Information__c WHERE Id = : policyIds]; //,CMC_Adj_Case_FTE_for_Outliers__c,UMR_Adj_Case_FTE_for_Outliers__c
        system.debug('policyInfoList ---> '+policyInfoList);
        for(Policy_Information__c p : policyInfoList){
            policyInfoMap.put(p.Id,p);
        }
        system.debug('policyInfoMap ---> '+policyInfoMap);
        
        for(Staff_Assignment__c eachStaffAssign:scope){
            system.debug('eachStaffAssign = '+eachStaffAssign.Medical_Policy_Number__r.Name);
            Decimal calFte = CP_StaffAssignSinglePolicyBatch.ZERO;
            Decimal claFteOutlier = CP_StaffAssignSinglePolicyBatch.ZERO;
            Decimal ofCase = eachStaffAssign.of_case__c;
            
            eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c = CP_StaffAssignSinglePolicyBatch.ZERO;
            eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = CP_StaffAssignSinglePolicyBatch.ZERO;
			String[] policyType = eachStaffAssign.Medical_Policy_Number__r.Policy_Type__c != null ? eachStaffAssign.Medical_Policy_Number__r.Policy_Type__c.split(';') : new List<String>();
            Boolean isMedical = false;
            Boolean isSpecialty = false;
            
            //*********************************varun*****************************************//
            if(eachStaffAssign.RecordTypeId == ipmAssignmentId){
                eachStaffAssign.Hours_Of_Complexity_Backend__c = eachStaffAssign.Medical_Policy_Number__r.IPM_Hours_Of_Complexity__c;
            }
            //*********************************varun*****************************************//
            //*********************************Added by Vignesh - Capacity Model 2025s*****************************************//
            if(eachStaffAssign.RecordTypeId == ipmAssignmentId){
                eachStaffAssign.Total_of_hours_Backend__c = eachStaffAssign.Medical_Policy_Number__r.IPM_Total_of_Hours__c;
            }
            if(eachStaffAssign.RecordTypeId == ipmAssignmentId){
                eachStaffAssign.Months_Implementing_Backend__c = eachStaffAssign.Medical_Policy_Number__r.IPM_Months_Implementing__c;
            }
            //**************************************************************************//
            for (String type : policyType) {
                if (medicalPolicy.contains(type)) {
                    isMedical = true;
                }
                if (specialtyPolicy.contains(type)) {
                    isSpecialty = true;
                }
            }

            
            if(ofCase== null){
                ofCase=CP_StaffAssignSinglePolicyBatch.ZERO;
            }
            Decimal fte= CP_StaffAssignSinglePolicyBatch.ZERO;
            Decimal fteoutlier =CP_StaffAssignSinglePolicyBatch.ZERO;
            fte =eachStaffAssign.Medical_Policy_Number__r.Adj_Case_FTE__c;
            if(fte==null){
                fte =CP_StaffAssignSinglePolicyBatch.ZERO;
            }
            fteoutlier = eachStaffAssign.Medical_Policy_Number__r.Adj_Case_FTE_for_Outlierss__c;
            if(fteoutlier== null){
                fteoutlier=CP_StaffAssignSinglePolicyBatch.ZERO;
            }
            Decimal fteRounded = fte;
            Decimal fteoutlieRounded = fteoutlier;
            calFte=(ofCase * fteRounded).setScale(4,RoundingMode.HALF_UP);
            claFteOutlier = (ofCase * fteoutlieRounded).setScale(4,RoundingMode.HALF_UP); 
            
            decimal currentUserWeightage=eachStaffAssign.Staff_User_Assignment__r.Current_Weighting1__c;
            if(currentUserWeightage== null){
                currentUserWeightage=CP_StaffAssignSinglePolicyBatch.ZERO;
            }
            string isDedicated= eachStaffAssign.Dedicated_to_case__c;
            /**if(isDedicated=='Yes'){
if(calFte> currentUserWeightage){
eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c= calFte;
}else{
eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c= currentUserWeightage;
}
if(claFteOutlier> currentUserWeightage){
eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c= claFteOutlier;
}else{
eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=  currentUserWeightage;
}
}else{
eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c= calFte;
eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c= claFteOutlier;
}**/
            /** remove below to lines */
            //}
            if(calFte != null && isMedical){
                eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c= calFte;
            }
            if(claFteOutlier != null && isMedical){
                eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c= claFteOutlier;
            }
            
            
            
            //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//
            Policy_Information__c tempPolicy = policyInfoMap.get(eachStaffAssign.Medical_Policy_Number__c);
            
            if(eachStaffAssign.Medical_Policy_Number__c == tempPolicy.Id ){
                
                if(tempPolicy.CMC_ADJ_Case_FTE__c != null && eachStaffAssign.Role_on_Case__c == 'Client Management Consultant' && isMedical){
                    eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = ofCase * tempPolicy.CMC_ADJ_Case_FTE__c;
                }
                 if(tempPolicy.Specialty_Adj_Case_FTE__c != null && eachStaffAssign.Role_on_Case__c == 'Specialty Benefits Client Manager' && ((isSpecialty && isMedical)|| isSpecialty)){
                    eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = ofCase * tempPolicy.Specialty_Adj_Case_FTE__c;
                }
                if(tempPolicy.UMR_ADJ_Case_FTE__c != null &&  eachStaffAssign.Role_on_Case__c == 'UMR Client Manager' && isMedical){
                    eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = ofCase * tempPolicy.UMR_ADJ_Case_FTE__c;
                }
                //Added by Vignesh - Capacity Model 2025s
                 if(tempPolicy.Surest_Adj_Case_FTE__c != null &&  eachStaffAssign.Role_on_Case__c == 'Surest Client Manager' && isMedical){
                    eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = ofCase * tempPolicy.Surest_Adj_Case_FTE__c;
                }
                
                //------------- SAMARTH - FOR CALCULATION OF CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c IF ROLE IS CMC OR UMR - SAMARTH -------------
                if(tempPolicy.CMC_Adj_Case_FTE_for_Outliers__c != null && eachStaffAssign.Role_on_Case__c == 'Client Management Consultant' && isMedical){
                    eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c = ofCase * tempPolicy.CMC_Adj_Case_FTE_for_Outliers__c;
                }
                if(tempPolicy.UMR_Adj_Case_FTE_for_Outliers__c != null && eachStaffAssign.Role_on_Case__c == 'UMR Client Manager' && isMedical){
                    eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c = ofCase * tempPolicy.UMR_Adj_Case_FTE_for_Outliers__c;
                }
                //Added by Vignesh - capacity Model 2025s
                if(tempPolicy.Surest_Adj_Case_FTE_for_Outlier__c != null && eachStaffAssign.Role_on_Case__c == 'Surest Client Manager' && isMedical){
                    eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c = ofCase * tempPolicy.Surest_Adj_Case_FTE_for_Outlier__c;
                }   
                if(tempPolicy.Specialty_Adj_Case_FTE_for_Outliers__c != null && eachStaffAssign.Role_on_Case__c == 'Specialty Benefits Client Manager' && ((isSpecialty && isMedical)|| isSpecialty)){
                    eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c = ofCase * tempPolicy.Specialty_Adj_Case_FTE_for_Outliers__c;
                }
                if(isMedical && !isSpecialty && eachStaffAssign.Role_on_Case__c == 'Specialty Benefits Client Manager'){
                    eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c = 0;
                    eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = 0;
                }
              system.debug('isMedical = '+isMedical+' isSpecialty = '+isSpecialty+' eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = '+eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c);
                //------------- SAMARTH - FOR CALCULATION OF CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c IF ROLE IS CMC OR UMR - SAMARTH -------------
            }
            //--------------------------------------------------------------------- Varun ---------------------------------------------------------------------//
            
            // Commented by varun as per requiremnts of #3551
            /*if(eachStaffAssign.Medical_Policy_Number__r.Surest__c==true){
                eachStaffAssign.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c =0;
                eachStaffAssign.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c =0;
                
            }*/
            
            staffAssignmentUpdateDmlList.add(eachStaffAssign);
        }
        if(!staffAssignmentUpdateDmlList.isempty() && staffAssignmentUpdateDmlList!=null){
            try{
                database.update(staffAssignmentUpdateDmlList,false);
            }catch(Exception e){
                system.debug('update failed staffAssignmentUpdateDmlList : '+e.getMessage()); 
            }
        }
    }
    global void finish(Database.BatchableContext bc){
        database.executeBatch(new CP_StaffAssignMultiPolicyBatch());
    }
}