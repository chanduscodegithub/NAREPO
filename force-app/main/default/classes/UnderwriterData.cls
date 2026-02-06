public with sharing class UnderwriterData {

    @AuraEnabled(cacheable = true)
    public static List<Underwriter_Data__mdt> getUnderwriters(String searchText){
        if(searchText != null && searchText != ''){
            String  sKey = '%'+searchText+'%';      
            return [select Id,Underwriter_Name__c from Underwriter_Data__mdt where Underwriter_Name__c like :sKey];
        }else if(searchText != null && searchText == ''){
            return [select Id,Underwriter_Name__c from Underwriter_Data__mdt order by Underwriter_Name__c limit 5];
        }
        return new List<Underwriter_Data__mdt>();             
    }
}