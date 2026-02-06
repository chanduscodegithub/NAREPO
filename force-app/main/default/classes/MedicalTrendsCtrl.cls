/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 01-31-2024
 * @last modified by  : Thanushree
**/
public with sharing class MedicalTrendsCtrl {
  @AuraEnabled
    public static list<Medical_Trend__c> getMedTrendsDetails(String accountId,String recordType){
        System.debug('inside medical trends	');
        list<Medical_Trend__c> medList =new list<Medical_Trend__c>();   
        if(accountId !=null && recordType!=null){
          medList=[SELECT Id, Name,Year__c,Company__c,Policy_level_medical_trends__c FROM Medical_Trend__c WHERE (Year__c != null and Policy_level_medical_trends__c!=null) and Company__c=:accountId and Medical_Trend_Type__c =:recordType ORDER BY Year__c DESC];         
        }           
        return medList;     
    }
}