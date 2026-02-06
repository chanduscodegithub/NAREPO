@isTest
public class AppConstantsTest {
    
    @isTest
    static void testConstantsValues() {
        // Test a few key constants
        System.assertEquals('QualifiedApiName', AppConstants.QUALIFIED_API_NAME_ATTRIBUTE);
        System.assertEquals('FullName', AppConstants.FULL_NAME_ATTRIBUTE);
        System.assertEquals('DeveloperName', AppConstants.DEV_NAME_ATTRIBUTE);
        System.assertEquals('Select type', AppConstants.SELECT_STRING);
        System.assertEquals(
            'Header must contain atleast one of these two fields - DeveloperName, Label.',
            AppConstants.HEADER_MISSING_DEVNAME_AND_LABEL
        );
        System.assertEquals('Unauthorized endpoint, please check Setup', AppConstants.ERROR_UNAUTHORIZED_ENDPOINT);
    }
}