/** ######################################################################################
* @author       Ram Mohan Reddy
* @date         28/03/2018
* @description  This invocable class is to Associate Company Policy to Case
*                 
*##########################################################################################    */
public with sharing class CasePolicyAssociation {
    
    @InvocableMethod(label='Policy Association for Case ' description='Policy Association for Case ')
    public static void CasePolicyAssociation (List<string> inputParams) {
        //TODO: update method return type and input parameters (they do need to be List)
        
        Set<string> policyTypeValues;
        List<Id> accountIDList= new List<Id>();
        List<Policy_Information__C> policyList;
        List<Policy_Information__C> policyMedicalList= new List<Policy_Information__C>();
        Map<Id, List<Policy_Information__C>> accountPolicyMap = new Map<Id, List<Policy_Information__C>>();
        List <PolicyCase__c> casePolicyList = new List<PolicyCase__c>();
        
        
        System.debug('Inside CasePolicyAssociation class');
        try
        {
            // Getting Case details
            List<Case> caseList = [SELECT Id, AccountId, RecordTypeId, Primary_Medical_Policy__c  
                                   FROM Case WHERE Id in :inputParams AND AccountId != Null]; 
            
            // Getting IS Request recordType Id of Case
            ID isRequestTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('IS Request').getRecordTypeId();
            
            for(Case currentCase : caseList)
            {
                // preparing account list to Query accounts policies 
                accountIDList.add(currentCase.AccountId);
            }
            System.debug('After Case Query...'+caseList.size());
            if(accountIDList.size() > 0 && accountIDList != Null)
            {
                // Getting Policy list for accounts
                List<Policy_Information__C> policyInformationList = [SELECT Id, Company__C, Policy_Type__c 
                                                                     FROM Policy_Information__C 
                                                                     WHERE Company__C in :accountIDList and Policy_Status__c ='Active'
                                                                     ORDER BY Company__C];
                
                System.debug('After Account Policy Query...'+policyInformationList.size());
                
                if(policyInformationList != Null && policyInformationList.size() > 0)
                {
                    Id accountId = Null;
                    Integer accountCount ;
                    Integer forloopCount = 0;
                    
                    // checking number of policies for each account associated 
                    for(Policy_Information__C policy : policyInformationList)
                    {
                        
                        forloopCount ++;
                        if(accountId != policy.Company__c)
                        {
                            accountId = policy.Company__c ; 
                            accountCount = 1;
                            policyList= new List<Policy_Information__C>();
                            
                        }else
                        {
                            accountCount ++;
                        }
                        
                        if ((forloopCount > 1 && accountCount == 1) || policyInformationList.size()== 1 )
                        {
                            // policy id adding into map if account have single policy
                            policyList.add(policy);
                            accountPolicyMap.put(accountId, policyList);
                            
                        } else if(policyInformationList.size() > 1 && policy.Policy_Type__c != null && policy.Policy_Type__c.contains('Medical'))
                        {
                            policyList.add(policy);
                            accountPolicyMap.put(accountId, policyList);
                        } 
                    }
                    
                }
            }
            System.debug('After accountPolicyMap...'+accountPolicyMap.size());
            if(accountPolicyMap.size() > 0)
            {
                for(Case currentCase : caseList)
                {
                    if(currentCase.Primary_Medical_Policy__c != Null){
                        
                        PolicyCase__c casePolicy = new PolicyCase__c();
                        casePolicy.Case__c = currentCase.Id;
                        casePolicy.Policy__c = currentCase.Primary_Medical_Policy__c;
                        casePolicyList.add(casePolicy);
                    }
                    else if(currentCase.Primary_Medical_Policy__c == Null) 
                    {
                        if(accountPolicyMap.containsKey(currentCase.AccountId))
                        {
                            policyMedicalList = accountPolicyMap.get(currentCase.AccountId);
                            
                            if(policyMedicalList != Null && policyMedicalList.size() >0){
                                
                                for(Policy_Information__C policyInfo : policyMedicalList){
                                    
                                    //Adding policy Type Picklist Values to a Set of String
                                    policyTypeValues = new Set<String>(policyInfo.Policy_Type__c.split(';'));
                                    
                                    //Associate policy which has Single MEDICAL policyType to IS REQUEST Case Record Type
                                    if(currentCase.RecordTypeId == isRequestTypeId){
                                        
                                        if(policyInfo.Policy_Type__c.contains('Medical') &&  policyMedicalList.size() == 1){
                                            PolicyCase__c casePolicy = new PolicyCase__c();
                                            casePolicy.Case__c = currentCase.Id;
                                            casePolicy.Policy__c = policyInfo.Id;
                                            casePolicyList.add(casePolicy);
                                        }else {
                                            PolicyCase__c casePolicy = new PolicyCase__c();
                                            casePolicy.Case__c = null;
                                            casePolicy.Policy__c = null;
                                            casePolicyList.add(casePolicy);
                                        }
                                    } 
                                    else if(currentCase.RecordTypeId != isRequestTypeId){
                                        if((policyMedicalList.size() == 1 && policyTypeValues.size() ==1) || policyMedicalList.size() == 1){
                                            PolicyCase__c casePolicy = new PolicyCase__c();
                                            casePolicy.Case__c = currentCase.Id;
                                            casePolicy.Policy__c = policyInfo.Id;
                                            casePolicyList.add(casePolicy);
                                        }
                                        else {
                                            PolicyCase__c casePolicy = new PolicyCase__c();
                                            casePolicy.Case__c = null;
                                            casePolicy.Policy__c = null;
                                            casePolicyList.add(casePolicy);
                                        } 
                                    }
                                    
                                }
                            }
                        } 
                    }
                    
                }
            }
            
            if(inputParams.size() > 0 ){
                
                System.debug('SELECT Id FROM PolicyCase__c WHERE Case__c in :'+ inputParams);
                
                // deleting existing policy case relation
                delete [SELECT Id FROM PolicyCase__c WHERE Case__c in : inputParams];
            }
            
            if(casePolicyList.size() > 0){
                
                System.debug('Inside insert'+casePolicyList.size());
                // inserting new policy case records
                insert casePolicyList;
            }
            
        }Catch (Exception e){
            System.debug('Inside Exception for CasePolicyAssociation Class .....'+e);
        }
        
    }
}