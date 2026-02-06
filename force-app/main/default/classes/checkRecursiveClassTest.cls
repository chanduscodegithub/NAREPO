@isTest
public class checkRecursiveClassTest {
    
    @isTest
    static void testRunOnceMethod() {
       
        Boolean firstCall = checkRecursiveClass.runOnce();
        Boolean secondCall = checkRecursiveClass.runOnce();
    }
}