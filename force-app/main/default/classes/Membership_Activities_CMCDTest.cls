@isTest
public class Membership_Activities_CMCDTest {
      PUBLIC STATIC STRING columnName='EffectiveDate__c';
    PUBLIC STATIC STRING sortType='ASC';
    public static  string sorttypeDESC ='DESC';
    public static  string sorttypelse='else';
    @testSetup static void createTestData() {
        Account accAgg = new Account();
        accAgg.Name = 'account BGH';
        accAgg.Subtype__c ='Business Group on Health (BGH)';
        accAgg.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        //accAgg.Record_Type_Group__c='Prospects';
        insert accAgg;
    }
    public static testMethod void positiveTest() {
        Membership_Activities_CMCD.getLoggedInUerRoleInfo();
        Membership_Activities_CMCD.getMembershipActivitiesCMCDOnAppletLoad([select id from account where name='account BGH'].Id,columnName, sorttypeDESC, 1);
        Membership_Activities_CMCD.queryAccountsAndRecordTypeValues([select id from account where name='account BGH'].Id);
    }     

}