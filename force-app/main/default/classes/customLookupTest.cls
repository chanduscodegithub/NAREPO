@isTest
public class customLookupTest {
    @isTest
    static void testGetAccountNames() {
        
        Account testAccount = new Account(Name = 'Test Account',Subtype__c='Competitor', Product_Types_Offered__c = 'Medical', RecordTypeId = [SELECT Id FROM RecordType WHERE SObjectType = 'Account' AND Name = 'Competitor' LIMIT 1].Id);
        insert testAccount;
        try{
            
            customLookup.getAccountNames('testAccount');
        }
        catch(Exception e){
           System.debug('Exception message - '+e);
        }
    }
    
     @isTest
    static void testGetAccountDetails() {
     
        Account testAccount = new Account(Name = 'Test Account', Subtype__c='National Accounts - East');
        insert testAccount;

        customLookup.getAccountDetails(testAccount.Id);
    }
    
    @isTest
    static void testGetAccountDetails_null() {
     
        Account testAccount = new Account(Name = 'Data Account', Subtype__c='National Accounts - East', Id=null);
        insert testAccount;
        
        // Call the method with the test account's Id
        Account result = customLookup.getAccountDetails(NULL);
    }
    
}