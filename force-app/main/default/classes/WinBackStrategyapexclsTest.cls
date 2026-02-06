@isTest
public class WinBackStrategyapexclsTest {

    @isTest
    public static void testGetCurrentRecord() {
        Account testAccount = new Account(Name = 'Test Account', RecordTypeId='0126A000000T7jIQAS', Subtype__c='Prospect');
        insert testAccount;

       Account result = WinBackStrategyapexcls.getCurrentRecord(testAccount.Id);        
    }

    @isTest
    public static void testUpdateRecord() {
        Account testAccount = new Account(Name = 'Test Account', RecordTypeId='0126A000000T7jIQAS', Subtype__c='Prospect');
        insert testAccount;

        test.startTest();
        WinBackStrategyapexcls.updateRecord(testAccount);
        test.stopTest();
    }

    @isTest
    public static void testGetRelatedContacts() {
        Account testAccount1 = new Account(Name = 'Test Account ', RecordTypeId='0126A000000T7jIQAS', Subtype__c='Prospect');
        insert testAccount1;
        
        Contact testContact = new Contact(FirstName='First Contact',LastName = 'Test Contact',AccountId = testAccount1.Id, Status__c = 'Active');
        insert testContact;
        List<Contact> result = WinBackStrategyapexcls.getRelatedContacts(testAccount1.Id);
    }
    
    @isTest
    public static void testGetUserInfo() {
        Account testAccount2 = new Account(Name = 'Test Account2', RecordTypeId = '0126A000000T7jIQAS', Subtype__c = 'Prospect');
        insert testAccount2;

        Boolean hasEditAccess = WinBackStrategyapexcls.getUserInfo(testAccount2.Id);
        
    }
}