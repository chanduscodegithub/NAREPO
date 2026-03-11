/**************************
 * Trigger Name : ProductTrigger
 * Test class   : ProductTriggerTest
 * Object       : Product2
 * Events       : After Update
 * Description  :
 * This trigger monitors changes to the Level_2_Options__c field on Product2.
 * If the field value changes, it collects the affected Product Ids and
 * invokes PimLevel2optionClass to sync the value to related PIM_Product_Stage__c records.
********************/
trigger ProductTrigger on Product2 (after update) {

    Set<Id> changedProductIds = new Set<Id>();

    for (Product2 p : Trigger.new) {
        Product2 oldP = Trigger.oldMap.get(p.Id);

        if (p.Level_2_Options__c != oldP.Level_2_Options__c) {
            changedProductIds.add(p.Id);
        }
    }

    if (!changedProductIds.isEmpty()) {
        PimLevel2optionClass.updateStages(changedProductIds);
    }
}