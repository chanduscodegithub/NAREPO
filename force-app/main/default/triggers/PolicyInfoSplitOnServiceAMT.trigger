/**
* Purpose     : Split the policy values(Semicolon seperated) into individual policy field on Service AMT
* Class       : PolicyInfoSplitOnServiceAMT
* Helper      : PolicyInfoSplitOnServiceAMTHandler 
* Test class  : PolicyInfoSplitOnServiceAMTHandlerTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      Veera Reddy               Mar 2021     Initial Class
*==============================================================================
*/

trigger PolicyInfoSplitOnServiceAMT on Service_AMT__c (before insert,before update) {
    if ((trigger.isBefore && trigger.isUpdate)|| (trigger.isBefore && trigger.isInsert)) {
        set<string> policySet =new set<string>();
        for(Service_AMT__c sa:trigger.new){
                if(sa.Policy_Information_MultiChecKlist__c!=null){
                    for(String policy: sa.Policy_Information_MultiChecKlist__c.split(';')){
                        policySet.add(policy.trim());
                    }
                }
        }
        list<Policy_Information__c> policyListTypes = new list<Policy_Information__c>();
        map<string,string> policyTypeMap =new map<string,string>();
        policyListTypes =[select id,Name,Policy__c,Policy_Type__c from Policy_Information__c where Name in:policySet];
        for(Policy_Information__c pp:policyListTypes){
            policyTypeMap.put(pp.Name, pp.Policy_Type__c);
        }
        
        
        PolicyInfoSplitOnServiceAMTHandler.policySplit(trigger.new,policyTypeMap);
    }
 /*   if(trigger.isBefore && trigger.isInsert){
        PolicyInfoSplitOnServiceAMTHandler.policySplit(trigger.new);
    }
  */  
}