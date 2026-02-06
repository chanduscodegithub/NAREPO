@isTest
public class testPersistencyEmailNotification {
    static testMethod void method1() {
        test.startTest();
        PersistencyEmailNotification sh1 = new PersistencyEmailNotification();
        String sch = '0 0 23 * * ?'; system.schedule('Test Persistency Email', sch, sh1); 
        Test.stopTest();
    }
}