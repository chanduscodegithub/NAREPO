@isTest
private class StrategyMemoInputTest {


@IsTest
    static void testGetPromptInput() {
        // Create a test Strategy Memo record
        Strategy_Memo__c testMemo = new Strategy_Memo__c(
            People__c = 'Test People',
            Company_Name_as_per_RFP__c = 'Test Company',
            Business_Overview__c = 'Test Overview',
            Business_Pressures__c = 'Test Pressures',
            Potential_Compelling_Event__c = 'Test Event',
            Unique_Business_Value__c = 'Test UBV',
            Key_Risks_to_our_UBV__c = 'Test Risks',
            Outcome_Drivers__c = 'Test Drivers',
            Approach_Strategy__c = 'Test Strategy'
        );
        insert testMemo;

        // Create a test request
        StrategyMemoInput.Request testRequest = new StrategyMemoInput.Request();
        testRequest.Strategy_Memo_Input = testMemo.Id;

        // Call the method
        Test.startTest();
        List<StrategyMemoInput.Response> responses = StrategyMemoInput.getPromptInput(new List<StrategyMemoInput.Request>{testRequest});
        Test.stopTest();

        // Verify the response
        System.assertEquals(1, responses.size());
        StrategyMemoInput.Response response = responses[0];
        System.assertNotEquals(null, response.Prompt);
    }
}