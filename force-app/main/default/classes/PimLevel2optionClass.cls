/******************
 * Class Name   : PimLevel2optionClass
 * Description  :
 * Handles synchronization of Level_2_Options__c field
 * from Product2 to related PIM_Product_Stage__c records.
 *
 * Sharing      : With Sharing (Respects org sharing rules)
 * Bulk Safe    : Yes
 *******************/
public with sharing class PimLevel2optionClass {
    
/**************************     
* Method Name : updateStages
* @param productIds Set of Product2 record Ids whose Level_2_Options__c field was updated.
* Description  :
* Retrieves related PIM_Product_Stage__c records and updates Level2_Options_Prod__c field to match the current Product2 value.
***** ***************************/
    public static void updateStages(Set<Id> productIds) {
        List<PIM_Product_Stage__c> stages = [SELECT Id, Product_Name_Prod__c FROM PIM_Product_Stage__c WHERE Product_Name_Prod__c IN :productIds with USER_MODE];
        if (stages.isEmpty()) 
            return;
        Map<Id, Product2> prodMap = new Map<Id, Product2>( [SELECT Id, Level_2_Options__c FROM Product2 WHERE Id IN :productIds with USER_MODE]);
        for (PIM_Product_Stage__c ps : stages) {
            if (ps.Product_Name_Prod__c == null) {
                continue;
            }
            Product2 p = prodMap.get(ps.Product_Name_Prod__c);
            if (p == null) {
                System.debug('Product not found for Stage: ' + ps.Id);
                continue;
            }
            ps.Level2_Options_Prod__c = p.Level_2_Options__c;
        }
        update as user stages; 
    }

}