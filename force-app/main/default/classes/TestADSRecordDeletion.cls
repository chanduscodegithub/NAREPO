@isTest
private class TestADSRecordDeletion {
/****************************************************************** ***** 
Name: TestADSRecordDeletion 
Copyright © 2018 United Health Care.  
====================================================== 
======================================================  
Purpose: Test class for Trigger:ADSRecordDeletion on AMT(ADS__c) Object
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL             
1.0 -      Satish S             09/25/2018      INITIAL DEVELOPMENT      
**********************************************************************/
    @isTest static void TestDeleteADS() {
        // Test data setup
        // Create an account with an opportunity, and then try to delete it
        ADS__c newADS = new ADS__c(Name = 'Test User',FirstName__c = 'Test',LastName__c = 'User',MSid__c ='tuser',Email__c = 'test.user@abc.com');
        insert newADS;
        Case newCase = new Case(Subject = 'Test Issue',AMT_Member__c = newADS.Id);
        insert newCase;
        
        // Perform test
        Test.startTest();
        Database.DeleteResult result = Database.delete(newADS, false);
        Test.stopTest();
        // Verify 
        // In this case the deletion should have been stopped by the trigger,
        // so verify that we got back an error.
        System.assert(!result.isSuccess());
        System.assert(result.getErrors().size() > 0);
        String validMessage = 'Cannot delete AMT (MSId='+ newADS.MSid__c + ') with related Cases(UHG Internal Contact).';
       // System.assertEquals('Cannot delete account with related opportunities.',
        //                     result.getErrors()[0].getMessage());
    }
    
}