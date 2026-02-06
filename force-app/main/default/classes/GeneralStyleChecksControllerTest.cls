@isTest
private class GeneralStyleChecksControllerTest {


@IsTest
    static void testGetPrompt() {
        // Create a test Proposal_Style_Guide__c record
        Proposal_Style_Guide__c testRecord = new Proposal_Style_Guide__c(
            Type__c = 'General Checks',
            Subsection_Title__c = 'Test Subsection',
            Checks__c = 'Test Checks'
            // Concise_Content__c = 'Test Concise Content'
        );
        insert testRecord;

        // Create a test request
        GeneralStyleChecksController.Request testRequest = new GeneralStyleChecksController.Request();
        List<GeneralStyleChecksController.Request> testRequests = new List<GeneralStyleChecksController.Request>{ testRequest };

        // Call the getPrompt method
        List<GeneralStyleChecksController.Response> responses = GeneralStyleChecksController.getPrompt(testRequests);

        // Assert that the response is not null and contains the expected prompt text
        System.assertEquals(1, responses.size(), 'Expected one response');
        GeneralStyleChecksController.Response response = responses[0];
        System.assertNotEquals(null, response.Prompt, 'Prompt should not be null');
        System.assertEquals('Test Checks', response.Prompt, 'Prompt text should match');
    }
}