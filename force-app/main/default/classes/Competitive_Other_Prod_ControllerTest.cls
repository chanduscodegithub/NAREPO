@isTest
private class Competitive_Other_Prod_ControllerTest {

    @isTest
    static void testGetOtherProdData() {
        // Create test data
        Account testAccount = new Account(Name = 'Test Account',
        Subtype__c = 'National Accounts - East' );
        insert testAccount;
        
        Account competitorAccount = new Account(
            Name = 'Competitor Account',
            //Point_Solution__c = 'Yes',
            //Hub_vendor__c = 'Yes',
            Subtype__c = 'National Accounts - East'
        );
        insert competitorAccount;
        
    	 Competitor__c testCompetitor = new Competitor__c(
            Name = 'Test Competitor',
            Account__c = testAccount.Id,
            Competitorclassification__c = 'Other',
            Type_of_File__c = 'Utilization Management File',
            //Point_Solution__c = 'Yes',
            Hub_vendor__c = 'UHC Hub',
            Inactive_Competitor_Status__c = false,
            CompetitorAccount__c = competitorAccount.Id
        );
        insert testCompetitor;

        // Call the method to be tested
        Competitive_Other_Prod_Controller.competitorData result = Competitive_Other_Prod_Controller.getOtherProdData(testAccount.Id);
    }

    @isTest
    static void testGetVendorCarrierData() {
        // Create test data
        Account testAccount = new Account(Name = 'Test Account',
        Subtype__c = 'National Accounts - East',
        CompetitorStatus__c = 'Active');
        insert testAccount;

        // Call the method to be tested
        List<Account> result = Competitive_Other_Prod_Controller.getVendorCarrierData();
    }

    @isTest
    static void testUpdateCompetitorRecs() {
        // Create test data
         Account testAccount = new Account(Name = 'Test Account',
        Subtype__c = 'National Accounts - East' );
        insert testAccount;
        
        Competitor__c testCompetitor = new Competitor__c(
            Name = 'Test Competitor',
            Account__c = testAccount.Id,
            Competitorclassification__c = 'Other'
        );
        insert testCompetitor;

        // Call the method to be tested
        Competitive_Other_Prod_Controller.updateCompetitorRecs(new List<Competitor__c>{testCompetitor});
    }

    @isTest
    static void testInsertCompetitorRecs() {
        // Create test data
        Account testAccount = new Account(Name = 'Test Account',
        Subtype__c = 'National Accounts - East' );
        insert testAccount;

        Competitor__c testCompetitor = new Competitor__c(
            Name = 'Test Competitor',
            Account__c = testAccount.Id,
            Competitorclassification__c = 'Other'
        );

        // Call the method to be tested
        Competitive_Other_Prod_Controller.insertCompetitorRecs(new List<Competitor__c>{testCompetitor}, new List<Competitor__c>{});

    }

    @isTest
    static void testCheckEditAccess() {
        // Create test data
        Account testAccount = new Account(Name = 'Test Account',
        Subtype__c = 'National Accounts - East' );
        insert testAccount;

        // Call the method to be tested
        Boolean result = Competitive_Other_Prod_Controller.checkEditAccess(testAccount.Id);
        
    }

    @isTest
    static void testGetTemplateInXMLOtherProducts() {
        // Create test data
        Account testAccount = new Account(Name = 'Test Account',
        Subtype__c = 'National Accounts - East' );
        insert testAccount;

        // Call the method to be tested
        Competitive_Other_Prod_Controller.CompetitorDataExportWrapper result = Competitive_Other_Prod_Controller.getTemplateInXMLOtherProducts(testAccount.Id, 'Client Management');

    }
}