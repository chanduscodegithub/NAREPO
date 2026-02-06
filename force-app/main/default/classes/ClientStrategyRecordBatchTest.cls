@IsTest
public class ClientStrategyRecordBatchTest {

    @IsTest
    static void testBatchClonesStrategies() {
        Account acc = new Account( Name = 'Test Account', UHC_Medical_Members__c = 1500, Subtype__c = 'Enterprise Strategic Accounts');
        insert acc;

        Client_Strategy__c cs = new Client_Strategy__c( Company__c = acc.Id, Year__c = String.valueOf(Date.today().year()),
            Status__c = 'Completed', Completion_Date_Time__c = DateTime.now(), Affordability_programs__c = 'Test Program' );
        insert cs;

        Test.startTest();
       
        Database.executeBatch(new ClientStrategyRecordCopyBatch(), 1);
        Test.stopTest();

    }

    @IsTest
    static void testBatchWithNoRecords() {
        Test.startTest();
        Database.executeBatch(new ClientStrategyRecordCopyBatch(), 1);
        Test.stopTest();
    }
}