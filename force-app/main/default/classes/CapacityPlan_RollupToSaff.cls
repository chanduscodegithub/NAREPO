/**
* Purpose     : Summing up FTE and FTE outlier from staff assignmnet and calculate the CM BOB Weighting
*               CM BOB Weighting outlier
* Class       : CapacityPlan_RollupToSaff
* Test class  : CP_StaffAssignSinglePolicyBatchTest
* =============================================================================
* History 
* ----------------------- 
* VERSION     AUTHOR                     DATE            DETAIL    
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class 
*============================================================================== 
*/
global without sharing class CapacityPlan_RollupToSaff implements Database.Batchable<sObject>, Database.Stateful {
    
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'Select Name, CM_BOB_Weighting__c, CM_BOB_Weighting_Outlier__c, IPM_BOB_Case_FTE__c, Staff_Name__r.Current_Weighting1__c,(select Id,Name ,Medical_Policy_Number__c,Medical_Policy_Number__r.Policy_Status__c,CM_BOB_FTE_Based_on_Adj_Case_FTE1__c ,CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c,Assignment_Type__c, Case_FTE_s__c,End_Date__c from Staffing_Information__r) From Staff__c'
        );
    }
    global void execute(Database.BatchableContext bc, List<Staff__c> scope){
        List<Staff__c> staffList = new List<staff__c>();
        for(Staff__c st : scope){
            Decimal normal = 0.0;
            Decimal outliner = 0.0;
            Decimal totalCaseFTE = 0.0;
            for(Staff_Assignment__c sa : st.Staffing_Information__r){
                
                if(sa.End_Date__c == null || sa.End_Date__c >= System.today()){
                    
                    if(sa.Medical_Policy_Number__c != null){
                        if(sa.Medical_Policy_Number__r.Policy_Status__c == 'Active'){
                            if(sa.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c!=null){
                                Decimal tempFte = sa.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c;
                                normal+=tempFte;
                            }
                            if(sa.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c!=null){
                                Decimal tempOutliner = sa.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c;
                                outliner+=tempOutliner;
                            }
                        }
                          
                    }
                    else{
                        if(sa.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c!=null){
                            Decimal tempFte = sa.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c;
                            normal+=tempFte;
                        }
                        if(sa.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c!=null){
                            Decimal tempOutliner = sa.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c;
                            outliner+=tempOutliner;
                        }
                    } 
                     if (sa.Assignment_Type__c != null) {
                        totalCaseFTE += sa.Case_FTE_s__c != null ? sa.Case_FTE_s__c : 0;
                    }
                }
            }
            /**
            * double currentweight = Staff_Name__r.Current_Weighting1__c;
            double cmbob = staff.CM_BOB_Weighting__c;
            
            **/
            
            system.debug('StaffName = '+st.Name);
            system.debug('normal=='+normal);
            system.debug('outliner=='+outliner);
            
            Decimal fteRounded = normal.setScale(2,RoundingMode.HALF_UP);
            Decimal fteoutlieRounded = outliner.setScale(2,RoundingMode.HALF_UP);
            //Decimal caseFTERounded = totalCaseFTE.setScale(2, RoundingMode.HALF_UP);

            system.debug('fteRounded=='+fteRounded);
            if(fteRounded<st.Staff_Name__r.Current_Weighting1__c){
                st.Current__c=fteRounded;
            }else{
                st.Current__c=st.Staff_Name__r.Current_Weighting1__c;
            }
            st.CM_BOB_Weighting__c=fteRounded;
            st.CM_BOB_Weighting_Outlier__c=fteoutlieRounded;
            //st.IPM_BOB_Case_FTE__c = caseFTERounded;
            
            staffList.add(st);
        }
        if(!staffList.isempty() && staffList!=null){
            try{
                database.update(staffList,false);
                
            }catch(Exception e){
                system.debug('@@class CapacityPlan_RollupToSaff @@'+e.getMessage()); 
            } 
        }
        
        
    }    
    global void finish(Database.BatchableContext bc){
        Database.executeBatch(new staffBatch());
    }    
    
}