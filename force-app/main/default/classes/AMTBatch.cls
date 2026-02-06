/**
* Purpose     : For existing AMT members where policy field is blank
                    If the client has only one policy, we will assign that policy
                    If a client has multiple policies, we will assign all active medical policies
* Class       : AMTBatch
* Test class  : AMTBatchTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      Veera Reddy               May 06 2021     Initial Class
*==============================================================================
*/

global class AMTBatch implements Database.Batchable<SObject> {
    
    global Database.QueryLocator start(Database.BatchableContext BC) {
        // string query ='select id, name,(select id,name,Policy_Type__c,company__c from policy_information__r where policy_status__c='+'active'+') from account';
        return Database.getQueryLocator([select id,name,company__c,Policy_Information_MultiChecKlist__c from service_amt__c where policy1__c=null and (Case_Management_End_Date__c=null or Case_Management_End_Date__c>=today)]);
    }
    global void execute (Database.BatchableContext BC, List<service_amt__c> scope) {
        List<service_amt__c> serviceAmtList = scope;
        List<account> accList = new List<account>();
        set<string> accIdList = new set<string>();
        List<string> policyIdList = new List<string>();
        List<string> accPrevIdList = new List<string>();
        map<id,string> multiPol =new map<id,string>();
        map<id,list<policy_information__c>> policyMap =new map<id,list<policy_information__c>>();
        map<id,list<policy_information__c>> policyMultiMap =new map<id,list<policy_information__c>>();
        map<id,service_amt__c> serviceAmtMap =new map<id,service_amt__c>();
        for(service_amt__c sa:serviceAmtList){
            accIdList.add(sa.company__c);
        }
        accList=[select id, name,(select id,name,Policy_Type__c,company__c from policy_information__r where policy_status__c='active') from account where id in:accIdList and UMR_Client_Platform__c!='UMR - CPS;UNET'];
        system.debug('accList '+accList);
        // serviceAmtList =[select id,name,company__c,Policy_Information_MultiChecKlist__c from service_amt__c where policy1__c=null];
        for(account acc:accList){
            if(acc.policy_information__r.size()==1){
                policyMap.put(acc.Id, acc.policy_information__r);
            }
            else if(acc.policy_information__r.size()>1){
                policyMultiMap.put(acc.Id, acc.policy_information__r);
            }
        }
        
        system.debug('policyMultiMap '+policyMultiMap);
        
        for(list<policy_information__c> pp:policyMultiMap.values()){
            string multiPolVal ='';
            id cid;
            for(policy_information__c pol:pp){
                if(pol.Policy_Type__c!=null)
                    if(pol.Policy_Type__c.contains('Medical')){
                        if(multiPolVal!=''){
                             multiPolVal =multiPolVal+';'+pol.name;
                        }else multiPolVal=pol.name;
                       
                    }
                cid=pol.company__c;
            }
            system.debug('multiPolVal'+multiPolVal);
            multiPol.put(cid, multiPolVal);
        }
        for(service_amt__c sa:serviceAmtList){
            if(sa.Policy_Information_MultiChecKlist__c==null){
                if(policyMap.get(sa.company__c)!=null){
                    if(policyMap.get(sa.company__c).size()==1){
                        sa.Policy_Information_MultiChecKlist__c =policyMap.get(sa.company__c)[0].name;
                    }
                }else if(multiPol.get(sa.company__c)!=null){
                        sa.Policy_Information_MultiChecKlist__c =multiPol.get(sa.company__c);
                }
                //serviceAmtMap.put(sa.company__c, sa);
            }
        }
        system.debug(serviceAmtList);
        update serviceAmtList;
    }
    
    global void finish(Database.BatchableContext BC) {
        
    }
}