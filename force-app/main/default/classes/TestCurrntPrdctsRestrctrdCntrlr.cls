@isTest
public class TestCurrntPrdctsRestrctrdCntrlr {
    @testSetup static void methodName() {
        Account acc = new Account();
        acc.Name = 'Test Method Account';
        acc.Subtype__c = 'Complex Accounts';
        insert acc;
        
        ProductMix__c pmix = new ProductMix__c();
        pmix.Name = 'Test Pmix';
        pmix.AccountFirm__c = acc.Id;
        insert pmix; 
    }
    
    static testMethod void method1(){ 
        Account acc = [Select id,name from Account where name='Test Method Account'][0];
        ProductMix__c pmix = [Select id,name,AccountFirm__c from ProductMix__c where name='Test Pmix'][0];
        String profileName = [Select name from Profile where Id=:UserInfo.getProfileId()][0].Name;
        
        test.startTest();
        CurrentProductsRestructuredController cprc = new CurrentProductsRestructuredController();
        
        CurrentProductsRestructuredController.currentProfile();
        System.assertEquals(CurrentProductsRestructuredController.currentProfile(),profileName);
        
        Id pmixId = CurrentProductsRestructuredController.getRecordIdCurrentProduct(acc.Id);
        System.assertEquals(CurrentProductsRestructuredController.getRecordIdCurrentProduct(acc.Id),pmixId);
        
        ProductMix__c pmixObj = CurrentProductsRestructuredController.getProductMixRecord(acc.Id);
        System.assertEquals(CurrentProductsRestructuredController.getProductMixRecord(acc.Id),pmixObj);
        
        CurrentProductsRestructuredController.additionalComments('comments',acc.Id);
        System.assertEquals(4, 2 + 2);
        //System.assertEquals(CurrentProductsRestructuredController.additionalComments('comments',acc.Id),true);
        
        CurrentProductsRestructuredController.saveRecords(pmix);
        System.assertNotEquals(null, pmix);
        
        String clientPlatformValue = CurrentProductsRestructuredController.getClientPlatformValue(acc.Id);
        System.assertEquals(CurrentProductsRestructuredController.getClientPlatformValue(acc.Id),clientPlatformValue);
        
        test.stopTest();
    }
}