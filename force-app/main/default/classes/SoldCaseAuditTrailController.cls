/*-----------------------------------------------------------------------
Author:        Pooja U
Company:       CRMIT Solutions
Description:   Apex Controller to retrieve SoldCase Custom Audit Trail data
Test Class:    SoldCaseAuditTrailController_Test
History:
Date			Authors Name			Brief Description of Change
7/05/2020		Pooja U				    Initial Development
------------------------------------------------------------------------*/
public without sharing class SoldCaseAuditTrailController {
    
    /**
* This method queries all custom audit trail records associated to the membership activity
*/
    @AuraEnabled(cacheable=true)
    public static SoldCaseAuditTrailWrapper getAuditTrailData(String oppId){
        system.debug('getAuditTrailData(String)-- start');
        System.debug('oppId==>'+oppId);
        SoldCaseAuditTrailWrapper soldCaseAuditTrailWrppr=new SoldCaseAuditTrailWrapper();
        Integer recordCount=0;
        
        try{
            recordCount=[Select count() from  Audit_Trail__c where Membership_Activity__c =: oppId];
            List<Audit_Trail__c> soldCaseAuditTrailList=[Select Id,CreatedDate,Event__c,Field__c,User__c,User__r.Name,Original_Value__c,New_Value__c,Membership_Activity__c 
                                                         from Audit_Trail__c 
                                                         where Membership_Activity__c =: oppId
                                                         Order By CreatedDate desc LIMIT 20];
            List<String> lst=new List<String>();
            lst.add('AuditTrail_ObjPrprtyFldApiName_Mapping');
            
            
            List<Sold_Case_Checklist_Audit_Trail_Setting__mdt> auditTrailSettingList=[Select DeveloperName,Value__c 
                                                                                      from Sold_Case_Checklist_Audit_Trail_Setting__mdt 
                                                                                      where DeveloperName in: lst];   
            
            soldCaseAuditTrailWrppr.soldCaseAuditTrailList=soldCaseAuditTrailList;
            soldCaseAuditTrailWrppr.auditTrailSettingList=auditTrailSettingList;
            soldCaseAuditTrailWrppr.recordCount=recordCount;   
            soldCaseAuditTrailWrppr.loggedInUserTimeZone=UserInfo.getTimeZone().getID();
        }catch(Exception e){
            System.debug('Exception occured in getAuditTrailData(String) method==> '+e.getMessage());
        }
        system.debug('getAuditTrailData(String)-- end');
        return soldCaseAuditTrailWrppr;
    }
    
    public class SoldCaseAuditTrailWrapper {
        
        @AuraEnabled
        public List<Audit_Trail__c> soldCaseAuditTrailList {get;set;}
        
        @AuraEnabled
        public String loggedInUserTimeZone{ get; set; }
        
        @AuraEnabled
        public Integer recordCount{ get; set; }
        
        @AuraEnabled
        public List<Sold_Case_Checklist_Audit_Trail_Setting__mdt> auditTrailSettingList{ get; set; }
        
    }
    
}