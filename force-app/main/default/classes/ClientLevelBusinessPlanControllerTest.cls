@isTest
public class ClientLevelBusinessPlanControllerTest {
    @isTest
    static void testGetClientLevelBusinessPlan() {
        Test.startTest();
           ClientLevelBusinessPlanController.getClientLevelBusinessPlan('Test Account Id', '');
           ClientLevelBusinessPlanController.getClientLevelBusinessPlan('Test Account Id', 'Test Sales Season');
        Test.stopTest();
    }
    
     @isTest
    static void testCreateOrUpdateClientPlanRecords() {
        // Test data setup
        Account acc = new Account(Name = 'Test Account',Subtype__c='National Accounts - East');
        insert acc;
        
        // Create sample Goal and Strategy records
        Goal__c goal = new Goal__c(Company__c = acc.Id, Sales_Season__c = 'Test Season');
        insert goal;
        
        Strategy__c strategy = new Strategy__c(Goal__c = goal.Id);
        insert strategy;
        
        List<Goal__c> goalListToUpdate = new List<Goal__c>{goal};
        List<Strategy__c> strategyListToUpdate = new List<Strategy__c>{strategy};
        List<Goal__c> goalAndStrategyRecordsToCreate = new List<Goal__c>{};
        List<Strategy__c> strategyListTobeCreated = new List<Strategy__c>{};
        List<Strategy__c> strategyRecordsToBeDeleted = new List<Strategy__c>{};
        List<Goal__c> goalRecordsToBeDeleted = new List<Goal__c>{};
        List<Goal__c> newGoalsListToBeCreated = new List<Goal__c>{};
        Map<String, List<Strategy__c>> newMapOfStrategyToInsert = new Map<String, List<Strategy__c>>{};
        List<Id> trackRecordId = new List<Id>{};
            
        Test.startTest();
        ClientLevelBusinessPlanController.createOrUpdateClientPlanRecords(goalRecordsToBeDeleted, goalListToUpdate, 
                                                                          strategyListToUpdate, goalAndStrategyRecordsToCreate, 
                                                                          strategyListTobeCreated, acc.Id, 'Test Season', 
                                                                          strategyRecordsToBeDeleted, goalRecordsToBeDeleted, 
                                                                          newGoalsListToBeCreated, newMapOfStrategyToInsert, 
                                                                          trackRecordId);
        
        
        Test.stopTest();
    }
    
    @isTest
    static void testCreateOrUpdateClientPlanRecordsOther_RT1() {
        // Test data setup
        Account acc = new Account(Name = 'Test Account',Subtype__c='National Accounts - East');
        insert acc;
        
        // Create sample Goal and Strategy records
        Goal__c goal = new Goal__c(Company__c = acc.Id, Sales_Season__c = 'Test Season');
        insert goal;
        
        Strategy__c strategy = new Strategy__c(Goal__c = goal.Id);
        insert strategy;
        
        List<Goal__c> goalListToUpdate = new List<Goal__c>{};
        List<Strategy__c> strategyListToUpdate = new List<Strategy__c>{strategy};
        List<Goal__c> goalAndStrategyRecordsToCreate = new List<Goal__c>{goal};
        List<Strategy__c> strategyListTobeCreated = new List<Strategy__c>{};
        List<Strategy__c> strategyRecordsToBeDeleted = new List<Strategy__c>{strategy};
        List<Goal__c> goalRecordsToBeDeleted = new List<Goal__c>{goal};
        List<Goal__c> newGoalsListToBeCreated = new List<Goal__c>{goal};
        Map<String, List<Strategy__c>> newMapOfStrategyToInsert = new Map<String, List<Strategy__c>>{};
        List<Id> trackRecordId = new List<Id>{};
            
        Test.startTest();
        ClientLevelBusinessPlanController.createOrUpdateClientPlanRecords(goalRecordsToBeDeleted, goalListToUpdate, 
                                                                          strategyListToUpdate, goalAndStrategyRecordsToCreate, 
                                                                          strategyListTobeCreated, acc.Id, 'Test Season', 
                                                                          strategyRecordsToBeDeleted, goalRecordsToBeDeleted, 
                                                                          newGoalsListToBeCreated, newMapOfStrategyToInsert, 
                                                                          trackRecordId);
        
        
        Test.stopTest();
    }
    
    
    
    
    @isTest
    static void testcreateGoalAndStrategyRecords() {

        Account acc = new Account(Name = 'Test Account',Subtype__c='National Accounts - East');
        insert acc;

        Goal__c goal = new Goal__c(Company__c = acc.Id, Sales_Season__c = 'Test Season');
        insert goal;
        
        Strategy__c strategy = new Strategy__c(Goal__c = goal.Id);
        insert strategy;
        
        List<Goal__c> goalAndStrategyRecordsToCreate = new List<Goal__c>{goal};
        List<Strategy__c> strategyListTobeCreated = new List<Strategy__c>{strategy};
            
        Test.startTest();
        ClientLevelBusinessPlanController.createGoalAndStrategyRecords(goalAndStrategyRecordsToCreate, 'Test Season', strategyListTobeCreated);
        Test.stopTest();
    }
    
     @isTest
    static void testDeleteGoalStrategyRecords() {
        // Test data setup
       Account acc = new Account(Name = 'Test Account',Subtype__c='National Accounts - East');
        insert acc;

        Goal__c goal = new Goal__c(Company__c = acc.Id, Sales_Season__c = 'Test Season');
        insert goal;
        
        Strategy__c strategy = new Strategy__c(Goal__c = goal.Id);
        insert strategy;
        
        // Prepare a list of records to be deleted
        List<SObject> listOfRecordsToBeDeleted = new List<SObject>{goal, strategy};
        
        // Call the method
        Test.startTest();
        ClientLevelBusinessPlanController.deleteGoalStrategyRecords(listOfRecordsToBeDeleted);
        Test.stopTest();
    }
    
     
    
     @isTest
    static void testGetTemplateInXML() {
        Account acc = new Account(Name = 'Test Account',Subtype__c='National Accounts - East');
        insert acc;
        
         String accountId = acc.Id;
        String salesSeason = 'Test Season';
         Test.setMock(HttpCalloutMock.class, new MockHttpResponseGeneratorForClientLevel());
        // Call the method
        Test.startTest();
        ClientLevelBusinessPlanController.getTemplateInXML(accountId, salesSeason);
        Test.stopTest();
    }
    
        @isTest
    static void testCopyPreviousSalesSeasonData() {
               Account acc = new Account(Name = 'Test Account',Subtype__c='National Accounts - East');
        insert acc;

        Goal__c goal = new Goal__c(Company__c = acc.Id, Sales_Season__c = 'Previous Cycle');
        insert goal;
        
        Strategy__c strategy = new Strategy__c(Goal__c = goal.Id);
        insert strategy;
        
         String accountId = acc.Id;
        String previousSalesCycle = 'Previous Cycle';
        String presentSalesSeason = 'Present Cycle';
        
         Test.startTest();
       ClientLevelBusinessPlanController.copyPreviousSalesSeasonData(accountId, previousSalesCycle, presentSalesSeason);
        Test.stopTest();
    }
    
  

}