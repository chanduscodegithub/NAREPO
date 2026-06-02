@isTest
public class ClientStrategyCtrlTest {
        
    public static Account createTestAccount() {
        Account acc = new Account( Name = 'Test Account', UHC_Medical_Members__c = 1500, Subtype__c = 'Enterprise Strategic Accounts');
        insert acc;
        return acc;
    }
    
    public static Client_Strategy__c createClientStrategy(Account acc, Integer yearVal) {
        Client_Strategy__c cs = new Client_Strategy__c(Company__c = acc.Id, Year__c = String.valueOf(yearVal),Status__c = 'Draft');
        insert cs;
        return cs;
    }
    
    
    @isTest
    static void testHasEditAccess_SystemAdmin() {
        Profile p = [SELECT Id FROM Profile WHERE Name = 'System Administrator' LIMIT 1];
        User u = new User(Alias = 'testsa', Email='sa@test.uhc.com', EmailEncodingKey='UTF-8', LastName='SysAdmin', FirstName = 'Vision',
            LanguageLocaleKey='en_US', LocaleSidKey='en_US', TimeZoneSidKey='America/Los_Angeles',Position__c = 'Test User',
            ProfileId=p.Id,UserName='sauser' + DateTime.now().getTime() + '@test.com' );
        insert u;
        
        Account acc = createTestAccount();
        
        System.runAs(u) {
            Test.startTest();
            Boolean result = ClientStrategyController.hasEditAccess(acc.Id);
            Test.stopTest();
        }
    }
    
    
    @isTest
    public static void testGetQuestionsAndAnswers() {
        Account acc = createTestAccount();
        Integer yearVal = Date.today().year();
        createClientStrategy(acc, yearVal);

        Sales_Debrief_Config_Question__c q = new Sales_Debrief_Config_Question__c(
            Api__c = 'Affordability_programs__c', Module__c = 'Client Strategy', Client_Strategy_Index__c = 1, Question__c = 'Sample Q');
        insert q;
        
        Test.startTest();
        List<ClientStrategyController.ReturnClientStrategyData> result = ClientStrategyController.getQuestionsAndAnswers(acc.Id);
        Test.stopTest();  
    }
    
    
    @isTest
    static void testSaveClientStrategyData_InsertUpdate() {
        Account acc = createTestAccount();
        Date today = Date.today();
        Integer yearVal = today.month() >= 10 ? today.year() + 1 : today.year();
        
        Client_Strategy__c cs = new Client_Strategy__c(
            Company__c = acc.Id,
            Year__c = String.valueOf(yearVal)
        );
        
        Test.startTest();
        ClientStrategyController.saveClientStrategyData(cs, acc.Id);
        Test.stopTest();
        
    }
    
    @isTest
    static void testGetMedicalMemberCount() {
        Account acc = createTestAccount();
        acc.Client_Strategy_Override__c = true;
        update acc;
        
        Test.startTest();
        Map<String,Object> result = ClientStrategyController.getMedicalMemberCount(acc.Id);
        Test.stopTest();
        
    }
    
    @isTest
    static void testMarkCompleteCheckedAndMarkAsComplete() {
        Account acc = createTestAccount();
        Client_Strategy__c cs = new Client_Strategy__c(
            Company__c = acc.Id,
            Year__c = String.valueOf(Date.today().year()),
            Affordability_programs__c = 'Yes',
            Wellness_program_offered__c = 'Yes',
            Client_rethinking_wellness_approach__c = 'Yes'
        );
        insert cs;
        
        Test.startTest();
        Map<String,Object> result = ClientStrategyController.markCompleteChecked(acc.Id, cs.Year__c);
        //Boolean markResult = ClientStrategyController.markAsComplete(acc.Id,cs.Year__c );
        
        Test.stopTest();
        
    }
    
    
    @IsTest
    static void testIsEditAllowed() {
        Test.startTest();
        Boolean result = ClientStrategyController.isEditAllowed();
        Test.stopTest();
    }
    
    
    
    @isTest
    static void testMarkAsComplete_Success() {
        // Arrange
        Account acc = createTestAccount();
        String currentYear = String.valueOf(Date.today().year());

        Client_Strategy__c cs = new Client_Strategy__c(
            Company__c = acc.Id,
            Year__c = currentYear,
            Affordability_programs__c = 'Yes',
            Wellness_program_offered__c = 'Yes'
        );
        insert cs;

        Test.startTest();
        Boolean result = ClientStrategyController.markAsComplete(acc.Id, currentYear);
        Test.stopTest();

    }

    @isTest
    static void testMarkAsComplete_NoRecord() {
        // Arrange
        Account acc = createTestAccount();
        String nonExistentYear = String.valueOf(Date.today().year() + 1); // future year with no CS record

        Test.startTest();
        Boolean result = ClientStrategyController.markAsComplete(acc.Id, nonExistentYear);
        Test.stopTest();

    }
    
    
    
    
    
    
    
    
    
    
}