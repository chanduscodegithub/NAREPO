public with sharing class ChecklistMetadataService {
    public class ChecklistMapping {
        @AuraEnabled public String productCode;
        @AuraEnabled public String fieldApiName;
        @AuraEnabled public String label;
        @AuraEnabled public Boolean isDual;
        @AuraEnabled public Boolean yesNoOnly;
        @AuraEnabled public Boolean restrictSurestOptions; 
        @AuraEnabled public Boolean restrictDirectContractOption;
        @AuraEnabled public Decimal sortOrder;
    }

    @AuraEnabled(cacheable=true)
    public static List<ChecklistMapping> fetchChecklistMappings() {
        List<ChecklistMapping> mappings = new List<ChecklistMapping>();

        for (CPW_Product_Checklist_Metadata__mdt record : [
            SELECT MasterLabel, Product_Code__c, Field_API_Name__c, Label__c, Is_Dual__c, Yes_No_Only__c,Restrict_Surest_Options__c, Restrict_Direct_Contract_Option__c, Display_Order__c
            FROM CPW_Product_Checklist_Metadata__mdt ORDER BY Display_Order__c ASC]) {
            ChecklistMapping cm = new ChecklistMapping();
            cm.productCode = record.Product_Code__c;
            cm.fieldApiName = record.Field_API_Name__c;
            cm.label = record.Label__c;
            cm.isDual = record.Is_Dual__c;
            cm.yesNoOnly = record.Yes_No_Only__c;
            cm.restrictSurestOptions = record.Restrict_Surest_Options__c;
            cm.restrictDirectContractOption = record.Restrict_Direct_Contract_Option__c;
            cm.sortOrder = record.Display_Order__c;
            mappings.add(cm);
        }

        return mappings;
    }
}