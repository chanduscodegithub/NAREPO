@isTest
private class ProposalStyleGuideControllerTest {


@IsTest
    static void testGetPrompt() {
        // Create a test Proposal_Style_Guide__c record
        Proposal_Style_Guide__c styleGuide = new Proposal_Style_Guide__c(
            Subsection_Title__c = 'Test Title',
            Guideline__c = 'Test Guideline',
            IsActive__c = true,
            Type__c = 'Style Guide'
        );
        insert styleGuide;

        // Create a test Request object
        ProposalStyleGuideController.Request request = new ProposalStyleGuideController.Request();
        List<ProposalStyleGuideController.Request> requests = new List<ProposalStyleGuideController.Request>{request};

        // Call the getPrompt method
        List<ProposalStyleGuideController.Response> responses = ProposalStyleGuideController.getPrompt(requests);

        // Verify the response
        System.assertEquals(1, responses.size());
        ProposalStyleGuideController.Response response = responses[0];
        System.assertNotEquals(null, response.Prompt);
        System.assert(response.Prompt.contains('Test Title'));
        System.assert(response.Prompt.contains('Test Guideline'));
    }
}