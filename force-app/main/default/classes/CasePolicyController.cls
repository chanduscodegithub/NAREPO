public class CasePolicyController {
    
    @AuraEnabled
    public static List<Policy_Information__c> PolicyList{ get;set; }
    
    @AuraEnabled
    public static string getContactsForToday(){
        String success = 'true';
        return success;
    }
    @AuraEnabled
    public static Void savePolicyList (List<String> CaseID ,List<Policy_Information__c> PolicyList){
        try{
            system.debug('Inside Save function');
            system.debug('Case ID : '+CaseID);
            system.debug('PolicyList to be Saved : '+PolicyList);
            List<PolicyCase__c> CasePoliciesToBeSaved = new List<PolicyCase__c>();
            for(Policy_Information__c PI :PolicyList){
                PolicyCase__c PC = new PolicyCase__c();
                PC.Case__c = CaseID[0];
                PC.Policy__c = PI.Id;
                PC.UniqueCasePolicyAssociation__c = CaseID[0]+ PI.Id;
                CasePoliciesToBeSaved.add(PC); 
                
            }
            system.debug('CasePoliciesToBeSaved  : '+CasePoliciesToBeSaved);
            upsert CasePoliciesToBeSaved;
            updatePoliciesField(CaseID);
        }catch(Exception Ex){
            System.debug('Exception '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
    }
    @AuraEnabled
    public static Void deletePolicyList (List<String> CaseID ,Id PolicyId){ 
        try{
            system.debug('Inside Delete function');
            system.debug('Case ID : '+CaseID);
            system.debug('PolicyList to be Deleted : '+PolicyId);
            PolicyCase__c  policyToBeDeleted = [Select id from PolicyCase__c where id=: PolicyId];
            delete policyToBeDeleted;
            List<PolicyCase__c> CaseAssociationPolicies = [Select id,Policy__r.Name from PolicyCase__c where Case__c IN :CaseID];
            try{
                Case PolicyUpdate = new Case();
                String appendCasePolicy ='';
                for(PolicyCase__C eachPolicy : CaseAssociationPolicies){               
                    appendCasePolicy+= ''+eachPolicy.Policy__r.Name+';';
                }      
                system.debug('appendCasePolicy  '+appendCasePolicy);
                PolicyUpdate.Policies__c = appendCasePolicy;
                PolicyUpdate.Id = CaseID[0];
                update PolicyUpdate;
                updatePoliciesField(CaseID);
            }catch(Exception ex){
                system.debug('Exception Message  :'+ex.getMessage()+'Exception Line  :'+ex.getLineNumber());
            }
        }catch(Exception Ex){
            System.debug('Exception '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
    }
    @AuraEnabled
    public static List<Policy_Information__c> getPolicies(String CaseID){
        try{
            system.debug('CaseID :'+CaseID);        
            Case caseObj = [select Id,AccountId from case where id =:CaseID]; 
            List<PolicyCase__c> CaseAssociationPolicies = [Select id,Policy__c from PolicyCase__c where Case__c = :CaseID];
            Set<Id> phIds = new Set<ID>();
            for(PolicyCase__c PC : CaseAssociationPolicies ){
                phIds.add(PC.Policy__c);
            }
            System.debug('phIds '+phIds);
            System.debug('caseObj '+caseObj.AccountId);
            List<Policy_Information__c> PolicyList = [Select id,Name,Policy__c,Policy_Type__c from Policy_Information__c where Company__c =:caseObj.AccountId and Policy_Status__c = 'Active' and Id NOT IN :phIds];
            //List<Policy_Information__c> PolicyList = [Select id,Name,Policy__c from Policy_Information__c where Company__c =:caseObj.AccountId and Id NOT IN :phIds];
            system.debug('PolicyList :'+PolicyList);
            return PolicyList;
        }catch(Exception Ex){
            System.debug('Ex'+ex.getLineNumber()+' : Message '+ex.getMessage());
            return null;
        }
    }
    @AuraEnabled
    public static List<PolicyCase__c> RelatedCasePoliciesList(String CaseID){
        try{
            system.debug('CaseID :'+CaseID);        
            //  Case caseObj = [select Id,AccountId from case where id =:CaseID]; 
            system.debug('Inside apex function');
            List<PolicyCase__c> CaseAssociationPolicies = [Select id,Policy__c,Name,Policy_Type__c,Policy__r.Name,Policy__r.Policy_Type__c,Policy__r.Policy__c from PolicyCase__c where Case__c = :CaseID];
            //List<PolicyCase__c> CaseAssociationPolicies = [Select id,Policy__c,Name,Policy_Number__c,Policy__r.Name,Policy__r.Policy__c from PolicyCase__c where Case__c = :CaseID];
            system.debug('CaseAssociationPolicies@@@'+CaseAssociationPolicies);
            /*  try{
Case PolicyUpdate = new Case();
String appendCasePolicy ='';
for(PolicyCase__C eachPolicy : CaseAssociationPolicies){               
appendCasePolicy+= ''+eachPolicy.Policy__r.Name+';';
}      
system.debug('appendCasePolicy  '+appendCasePolicy);
PolicyUpdate.Policies__c = appendCasePolicy;
PolicyUpdate.Id = CaseID;
update PolicyUpdate;
}catch(Exception ex){
system.debug('Exception Message  :'+ex.getMessage()+'Exception Line  :'+ex.getLineNumber());
}*/
            
            return CaseAssociationPolicies;
        }catch(Exception Ex){
            system.debug('Exception Line number '+Ex.getLineNumber()+'Exception Message   :'+Ex.getMessage());
            return null;
        }
        
    }
    
    @InvocableMethod(label='Populate policy Numbers in Policies ' description='Populate policy Numbers in Policies')
    public static void updatePoliciesField(List<String> CaseID){
        try{
            system.debug('CaseID :'+CaseID);        
            //  Case caseObj = [select Id,AccountId from case where id =:CaseID]; 
            system.debug('Inside apex function');
            List<PolicyCase__c> CaseAssociationPolicies = [Select id,Policy__r.Name, Policy__r.Policy__c from PolicyCase__c where Case__c IN :CaseID];
            
            system.debug('CaseAssociationPolicies@@@'+CaseAssociationPolicies);
            try{
                Case PolicyUpdate = new Case();
                String appendCasePolicy ='';
                String appendCasePolicyName ='';
                for(PolicyCase__C eachPolicy : CaseAssociationPolicies){ 
                    if(eachPolicy.Policy__r.Name!= null || eachPolicy.Policy__r.Name!=''){
                        system.debug('eachPolicy.Policy__r.Name@@@'+eachPolicy.Policy__r.Name);
                        appendCasePolicy+= ''+eachPolicy.Policy__r.Name+';';
                    }
                    if(eachPolicy.Policy__r.Policy__c!= null){
                        system.debug('eachPolicy.Policy__r.Policy__c@@@@'+eachPolicy.Policy__r.Policy__c);
                        appendCasePolicyName+= ''+eachPolicy.Policy__r.Policy__c+';';
                    }
                    
                }
                system.debug('appendCasePolicy@@@'+appendCasePolicy+'appendCasePolicyName@@@'+appendCasePolicyName);
                if (appendCasePolicy.endsWith(';')) {
                   appendCasePolicy=appendCasePolicy.substring(0, appendCasePolicy.length() - 1);  
                }
                if (appendCasePolicyName.endsWith(';')) {
                appendCasePolicyName=appendCasePolicyName.substring(0, appendCasePolicyName.length() - 1);
                }
                system.debug('Final appendCasePolicy@@@'+appendCasePolicy+'appendCasePolicyName@@@'+appendCasePolicyName);
                PolicyUpdate.Policies__c = appendCasePolicy;
                PolicyUpdate.Policy_Name_Issue__c = appendCasePolicyName;                
                PolicyUpdate.Id = CaseID[0];
                update PolicyUpdate;
            }catch(Exception ex){
                system.debug('Exception Message  :'+ex.getMessage()+'Exception Line  :'+ex.getLineNumber());
            }            
            
        }catch(Exception Ex){
            system.debug('Exception Line number '+Ex.getLineNumber()+'Exception Message   :'+Ex.getMessage());
            
        }
        
    }
    
}