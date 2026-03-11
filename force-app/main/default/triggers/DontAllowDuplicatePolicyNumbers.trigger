/**
* Purpose     : Calculate Add-on field on policy information
* Class       : DontAllowDuplicatePolicyNumbers
* Helper      : DontAllowDuplicatePolicyNumbersHelper 
* Test class  : DontAllowDuplicatePolicyNumbersTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*   1.1      Sai Sandhya                12-05-2020    Commented code of restrict duplicate policy
*==============================================================================
*/
trigger DontAllowDuplicatePolicyNumbers on Policy_Information__c(before insert, before update, before delete, after update, after insert) {
    /**[sandhya: 12-05-2020], commented code, for Performance Issue
     * Moved Restricted duplicate policy functionilty to "Duplicate Rules" Configuration Module
     * **/
    /*  if (trigger.isbefore && !trigger.isdelete) {
        Set < string > policyNames = new Set < string > ();
        list < Policy_Information__c > listOfDuplicatepolicies = new list < Policy_Information__c > ();
        for (Policy_Information__c policyVar: trigger.new) {
            String policyName = String.valueOf(policyVar.name).trim();
            policyName = '%' + policyName;
            policyNames.add(policyName);
        }
        if (policyNames != null && policyNames.size() > 0) {
            listOfDuplicatepolicies = [select id, Name from Policy_Information__c where Name LIKE: policyNames];
        }
        for (Policy_Information__c policy: trigger.new) {
            if (trigger.isInsert) {
                if (listOfDuplicatepolicies != null && listOfDuplicatepolicies.size() > 0) {
                    for (Policy_Information__c duplicatepolicy: listOfDuplicatepolicies) {
                        if (String.valueOf(Integer.valueOf(policy.name)).trim() == String.valueOf(Integer.valueOf(duplicatepolicy.name)).trim()) {
                            policy.addError('Policy already exists with this number');
                        }
                    }
                }
            }
            if (trigger.isUpdate) {
                if (listOfDuplicatepolicies != null && listOfDuplicatepolicies.size() > 0) {
                    for (Policy_Information__c duplicatepolicy: listOfDuplicatepolicies) {
                        if (Trigger.oldMap.get(policy.ID).name != policy.name) {
                            if (String.valueOf(Integer.valueOf(policy.name)).trim() == String.valueOf(Integer.valueOf(duplicatepolicy.name)).trim()) {
                                policy.addError('Policy already exists with this number');
                            }
                        }
                    }
                }
            }
        }
    }
   */ 
    if([Select Active__c, Id From Capacity_Planning_trigger_flags__mdt  where Label='isDontAllowDuplicatePolicyNumbersActive'].Active__c){
        if (!DontAllowDuplicatePolicyNumbersHelper.stopRecursive) {
            if (trigger.isBefore && trigger.isUpdate) {
               
                    system.debug('call trigger handler>>>>>>');
                	DontAllowDuplicatePolicyNumbersHelper.meritPopulatedParameters(trigger.new);
                    DontAllowDuplicatePolicyNumbersHelper.calculateAddOn(trigger.newMap,trigger.oldMap );  
                    DontAllowDuplicatePolicyNumbersHelper.complexityLoigicUpdateHandler(trigger.newMap,trigger.oldMap ); 
                
            }
        }
        if (!DontAllowDuplicatePolicyNumbersHelper.stopRecursiveForInsert) {
             if(trigger.isBefore && trigger.isInsert){
                DontAllowDuplicatePolicyNumbersHelper.meritPopulatedParameters(trigger.new);
                DontAllowDuplicatePolicyNumbersHelper.calculateAddOnInsert(trigger.new );  
                DontAllowDuplicatePolicyNumbersHelper.complexityLoigicInsertHandler(trigger.new ); 
                
            }
        }
    }
    
    if (trigger.isAfter && trigger.isUpdate) {
        DontAllowDuplicatePolicyNumbersHelper.termAmtMembers(trigger.new);
    }
}