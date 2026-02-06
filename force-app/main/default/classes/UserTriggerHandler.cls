public with sharing class UserTriggerHandler {
    
    private static final Boolean IS_CAPACITY_TRIGGER_ACTIVE = [SELECT Active__c, Id, Label 
                                                               From Capacity_Planning_trigger_flags__mdt  
                                                               WHERE Label='isCapacityPlan_UserCurrenWeightUpdateAct'].Active__c;
    
    private static final List<Capacity_Plan_Staff_Current_Weight__mdt> CAPACITY_MDT = [SELECT  Id, Label, Language, MasterLabel, NamespacePrefix, Case_Load__c,
                                                                                       DeveloperName, QualifiedApiName, Salary_Grade__c, Year_of_Experience__c 
                                                                                       From Capacity_Plan_Staff_Current_Weight__mdt];
    
    public static void handleTrigger(List<User> oldList, List<User> newList, Map<Id, User> oldMap, Map<Id, User> newMap, System.TriggerOperation triggerEvent )
    {
        switch on triggerEvent {
            
            when BEFORE_INSERT {
                UserTriggerHandler.beforeInsert(newList);
            }
            when BEFORE_UPDATE {
                UserTriggerHandler.beforeUpdate(oldMap, newList);
            }
            
        }
    }    
    
    public static void beforeInsert(List<User> newList){
        if(UserTriggerHandler.IS_CAPACITY_TRIGGER_ACTIVE){
            UserTriggerHandler.setCapacityWeightage(newList, null);
        }
    }
    
    public static void beforeUpdate(Map<Id, User> oldMap, List<User> newList){
        if(UserTriggerHandler.IS_CAPACITY_TRIGGER_ACTIVE){
            UserTriggerHandler.setCapacityWeightage(newList, oldMap);
        }
    }
    
    
    /**
    * Purpose     : update user current weight as per custom metadata below
    +----------------------------------+---------+------------------------+
    | Years of Experience              |  Expected Caseload          	  | 
    +----------------------------------+---------+------------------------+
    | 				                   | SG 26/27| SG 28/2                |          
    +----------------------------------+---------+------------------------+
    | 			<1 Year                | 0.45	 | 0.6                    |          
    +----------------------------------+---------+------------------------+
    | 1 year and greater               | 0.6	 | 0.75                   |           
    +----------------------------------+---------+------------------------+
    */
    private static void setCapacityWeightage(List<User> lstUser, Map<Id, User> oldMap){
        for(User userRecord : lstUser){
            if(oldMap == null || oldMap.get(userRecord.Id).Salary_Grade__c != userRecord.Salary_Grade__c){
                for(Capacity_Plan_Staff_Current_Weight__mdt cap : UserTriggerHandler.CAPACITY_MDT){
                    
                    if(userRecord.Salary_Grade__c == cap.Salary_Grade__c && cap.Year_of_Experience__c==1){
                        userRecord.Current_Weighting1__c = cap.Case_Load__c;
                        
                        if(integer.valueof(userRecord.Salary_Grade__c) == 29){
                            userRecord.CMC_Weighting__c = 1;
                            userRecord.Current_Weighting1__c=0.75;
                        }else{
                            userRecord.CMC_Weighting__c = null;
                        }
                    }
                }
            }
        }
    }
    
}