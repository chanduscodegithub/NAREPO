@isTest
private class SpecialCharacterBatchMetadataQueryTest {
    @testSetup static void createTestData() {
        
        Account acc = new Account();
        acc.Name = 'testAccount';
        acc.Subtype__c ='Prospect';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acc;
        
        Account accWithoutId = new Account();
        accWithoutId.Name = 'testAccountWitoutId';
        accWithoutId.Subtype__c ='Prospect';
        accWithoutId.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accWithoutId;
        
        Opportunity opp =  new Opportunity();
        opp.AccountId=acc.Id;
        opp.Name='Test Opportunity';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp.Expected_Date_of_RFP__c = system.today();
        opp.StageName = 'Qualification';
        opp.CloseDate=System.today();
        insert opp;
        
        
    }
    public testMethod static void validate(){
        SpecialCharacterBatchMetadataQuery.getApiNames('Account');
        SpecialCharacterBatchMetadataQuery.getobjectNames();
    }
}