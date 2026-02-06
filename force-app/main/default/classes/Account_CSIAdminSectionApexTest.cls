/** ######################################################################################
* @author       Sudarshan Reddy
* @date         05/13/2019
* @description  Test Class for Account_CSIAdminSectionApex 
*##########################################################################################    */
@isTest
public class Account_CSIAdminSectionApexTest {
    
    @isTest
    static void RMO_TollFreeMethod(){
        
        Account acc = new Account(Name='Test Account', Subtype__c = 'Specialty Benefits Only',Type ='National Accounts Client',
                                  RMO_Address__c = 'Test RMO Address', Toll_Free_number__c = '9957453621',
                                  RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Existing_Client').getRecordTypeId());
        
        test.startTest(); 
        
        insert acc;
        
        Account_CSIAdminSectionApex.getAccounts(acc.Id);       
        Account_CSIAdminSectionApex.getUpdatedAccounts(acc, acc.Id); 
        
        test.stopTest();
    }
}