@isTest
public class Contact_Accounts_ClassTest {
    PUBLIC STATIC STRING columnName='ACCOUNT.NAME';
    PUBLIC STATIC STRING sortType='ASC';
    public static Integer pageName = 1;
    public static testMethod void positive(){
        
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.BGHContactTestData();
        bulkTestData.opportunityTestData();
        Id conid = [SELECT ID FROM CONTACT WHERE FirstName ='test acconsultiongfirm1'].ID;
        Contact_Accounts_Class.queryRelatedAccounts(conid,pageName, columnName, sortType);
        Contact_Accounts_Class.queryRelatedAccounts(null,pageName, columnName, sortType);
        
        User readOnlyUser = [Select id from user where username = 'uhgDevReadOnly@crmit.com' Limit 1];
        try{
            string b =[SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id;
            system.debug('b@@@@'+b);
            system.runAs(readOnlyUser){
                Test.startTest();
                Contact_Accounts_Class.queryRelatedAccounts(conid,pageName, columnName, sortType); 
                Test.stopTest(); 
            }
            
        }catch(Exception e){
            system.assert(e.getMessage().contains('Script-thrown exception'),true);
            
        }

     
 }
        
}