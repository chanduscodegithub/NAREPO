@isTest(SeeAllData=true)
private class NotesMigrationBatchTest {
    public testMethod static void validateReadFromCSV(){
        Test.startTest();
        Database.executeBatch(new NotesMigrationBatch(), 200);
        Test.stopTest();
    }
}