@isTest
public class RenewalChecklistPdfController_Test {
    
    @testSetup
    static void testSetup(){
        Account acc1 = new Account();
        acc1.Name = 'Test Renewal Acccount 1';
        acc1.UHC_Medical_Members__c = 1;
        acc1.Subtype__c = 'CVG';
        acc1.Pending_Term_Client__c = false;
        acc1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        acc1.CMVPCRRVP__c = UserInfo.getUserId();
        insert acc1;
        
        Account acc2 = new Account();
        acc2.Name = 'Test Renewal Acccount 2';
        acc2.UHC_Medical_Members__c = 1;
        acc2.Subtype__c = 'CVG';
        acc2.Pending_Term_Client__c = false;
        acc2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        acc2.CMVPCRRVP__c = UserInfo.getUserId();
        insert acc2;
        
        Account acc3 = new Account();
        acc3.Name = 'Test Renewal Acccount 3';
        acc3.UHC_Medical_Members__c = 1;
        acc3.Subtype__c = 'CVG';
        acc3.Pending_Term_Client__c = false;
        acc3.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        acc3.CMVPCRRVP__c = UserInfo.getUserId();
        insert acc3;
        
        Renewal_Checklist__c rc = new Renewal_Checklist__c();
        rc.Company__c = acc1.Id;
        rc.High_performing_network__c = 'No';
        rc.Sales_Season__c = 'SS 2024';
        insert rc;
        
        Renewal_Checklist__c rc2 = new Renewal_Checklist__c();
        rc2.Company__c = acc2.Id;
        rc2.High_performing_network__c = 'Yes';
        rc2.High_performing_network_Additional__c = 'UHC Preventative';
        rc2.Sales_Season__c = 'SS 2024';
        insert rc2;
        
        Renewal_Checklist__c rc3 = new Renewal_Checklist__c();
        rc3.Company__c = acc3.Id;
        rc3.High_performing_network__c = 'Yes';
        rc3.High_performing_network_Additional__c = 'UHC Preventative';
        rc3.Payment_Integrity_Bundles__c = 'Legacy Option 1';
        rc3.Sales_Season__c = 'SS 2024';
        insert rc3;
        
}
    
    @isTest
    public static  void testGeneratePdf(){
        
        Account[] acc = [SELECT Id FROM Account WHERE Name ='Test Renewal Acccount 1'  LIMIT 1];
        String accId = acc[0].Id;
        String showAllData = 'true';
        String currentCS = 'SS 2024';
        PageReference pageRef = Page.RenewalChecklistPdf;
        pageRef.getParameters().put('recordId',accId);
        pageRef.getParameters().put('showAllData',showAllData);
        pageRef.getParameters().put('currentSS',currentCS);
        test.setCurrentPageReference(pageRef);
        RenewalChecklistPdfController obj = new RenewalChecklistPdfController();
        system.assertEquals(1, acc.size());
    }
    
    @isTest
    public static  void testGeneratePdf2(){
        
        Account[] acc = [SELECT Id FROM Account WHERE Name ='Test Renewal Acccount 2'  LIMIT 1];
        String accId = acc[0].Id;
        String showAllData = 'true';
        String currentCS = 'SS 2024';
        PageReference pageRef = Page.RenewalChecklistPdf;
        pageRef.getParameters().put('recordId',accId);
        pageRef.getParameters().put('showAllData',showAllData);
        pageRef.getParameters().put('currentSS',currentCS);
        test.setCurrentPageReference(pageRef);
        system.assertEquals(1, acc.size());
        RenewalChecklistPdfController obj = new RenewalChecklistPdfController();
    }
    
    @isTest
    public static  void testGeneratePdf3(){
        
        Account[] acc = [SELECT Id FROM Account WHERE Name ='Test Renewal Acccount 3'  LIMIT 1];
        String accId = acc[0].Id;
        String showAllData = 'true';
        String currentCS = 'SS 2024';
        PageReference pageRef = Page.RenewalChecklistPdf;
        pageRef.getParameters().put('recordId',accId);
        pageRef.getParameters().put('showAllData',showAllData);
        pageRef.getParameters().put('currentSS',currentCS);
        test.setCurrentPageReference(pageRef);
        system.assertEquals(1, acc.size());
        RenewalChecklistPdfController obj = new RenewalChecklistPdfController();
    }
    
}