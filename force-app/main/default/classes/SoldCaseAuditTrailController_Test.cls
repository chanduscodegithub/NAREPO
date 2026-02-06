@isTest
public class SoldCaseAuditTrailController_Test {
    @testSetup static void createTestData() {
        
        
        Account accToInsert=new Account(Name = 'Sold Case Checklist Test Account',Subtype__c ='Suspect',
                                        RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Suspect').getRecordTypeId());
        insert accToInsert;
        
        Account account2 = new Account();
        account2.Name = 'Equity Healthcare';
        account2.Subtype__c ='Collaborative Ventures Group (CVG)';
        account2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        insert account2;

        Opportunity oppToInsert=new Opportunity(AccountId = accToInsert.Id,
                                                Name = 'Sold Case Checklist Test Opportunity',
                                                Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
                                                Product_Type_Involved_in_Opp__c = 'Pharmacy;Medical;Other Buy Up Programs',
                                                Has_a_Formal_RFP_Been_Issued__c = 'No',
                                                Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
                                                Is_There_Existing_Membership_at_Risk__c  = 'No',
                                                Is_Created_by_QA__c = true,
                                                StageName='Qualification',
                                                CloseDate=System.today(),
                                                EffectiveDate__c = Date.newInstance(2019, 4, 12),
                                                RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
                                                Expected_Date_of_RFP__c = System.today(),
                                                Disposition_Pharmacy__c='Sold',Disposition_Medical__c='Sold'                             
                                               );        
        insert oppToInsert;
        
        List<Audit_Trail__c> auditTrailListToInsert=new List<Audit_Trail__c>();
        
        auditTrailListToInsert.add(new Audit_Trail__c(User__c=UserInfo.getUserId(),Event__c='Field Change',
                                                      Field__c='Trust Involved',Original_Value__c='VEBA',
                                                      New_Value__c='MEWA',Membership_Activity__c=oppToInsert.Id));
        auditTrailListToInsert.add(new Audit_Trail__c(User__c=UserInfo.getUserId(),Event__c='Field Change',
                                                      Field__c='SCE Assignment',Original_Value__c='Anna Vollmoeller',
                                                      New_Value__c='CM SCE Test User',Membership_Activity__c=oppToInsert.Id));
        auditTrailListToInsert.add(new Audit_Trail__c(User__c=UserInfo.getUserId(),Event__c='Field Change',
                                                      Field__c='Claim Site',Original_Value__c='Buffalo;Chico;Duluth;Frederick',
                                                      New_Value__c='Frederick',Membership_Activity__c=oppToInsert.Id));
        auditTrailListToInsert.add(new Audit_Trail__c(User__c=UserInfo.getUserId(),Event__c='Field Change',
                                                      Field__c='Other -> Care Management - Custom Personal Health Support -> Level 2',
                                                      Original_Value__c='',New_Value__c='Designated',Membership_Activity__c=oppToInsert.Id));
        auditTrailListToInsert.add(new Audit_Trail__c(User__c=UserInfo.getUserId(),Event__c='Product Added',
                                                      Field__c='Other->Facility R&C',Original_Value__c='NA',
                                                      New_Value__c='NA',Membership_Activity__c=oppToInsert.Id));
        
        insert auditTrailListToInsert;
        
    }
    
    @isTest static void testGetAuditTrailData(){
        Opportunity opp=[Select Id from Opportunity where Name='Sold Case Checklist Test Opportunity'];
        Test.startTest();
        System.assertEquals(5,SoldCaseAuditTrailController.getAuditTrailData(opp.Id).soldCaseAuditTrailList.size());
        Test.stopTest();
        
    }
    
    
}