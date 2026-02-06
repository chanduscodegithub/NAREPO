@isTest
public class UnderwriterDataTest {
	@isTest 
    static void testMethod1(){
        test.startTest();
        String searchText = 'Sample Text';
        UnderwriterData.getUnderwriters(searchText);
        UnderwriterData.getUnderwriters('');
        UnderwriterData.getUnderwriters(null);
        test.stopTest();
    }
}