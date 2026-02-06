@isTest
public class Contact_MA_ClassTest {
     
    public static  string sorttype ='ASC';
    public static  string sorttypeDESC ='DESC';
    public static  string sorttypelse='else';
    public static testMethod void positiveTest() {
        bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.opportunityTestData();
        
        bulkTestData.opportunityContactRoleTestData();     
           string opp = string.valueOf(OpportunityContactRole.IsPrimary)  ;
          // boolean prim = boolean.valueOf(OpportunityContactRole.IsPrimary);
       Contact_MA_Class.contactMAResults wrapper= new Contact_MA_Class.contactMAResults ();
wrapper.pageSize = 5;
wrapper.page=1;
        
      Contact_MA_Class.queryRelatedMA([SELECT Id FROM contact WHERE FirstName='test qwerty' LIMIT 1].Id, 1, opp, sorttype);
         Contact_MA_Class.queryRelatedMA([SELECT Id FROM contact WHERE FirstName='test qwerty' LIMIT 1].Id, 1, opp, sorttypeDESC);
         Contact_MA_Class.queryRelatedMA([SELECT Id FROM contact WHERE FirstName='test qwerty' LIMIT 1].Id, 1, opp, sorttypelse);
        
        Contact_MA_Class.queryRelatedMA([SELECT Id FROM contact WHERE FirstName='test qwerty2' LIMIT 1].Id, 1, opp, sorttype);
        
       // Contact_MA_Class.queryRelatedMA(contactId, pageNumber, columnName, sortType)
        
    }
    
    
}