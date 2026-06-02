public with sharing class ProspectEngagementInsightsController {
    
    @AuraEnabled
    public static List<Id> getAccountsForSurestOrQuad(){
        List<Id> accountIds = new List<Id>();
        List<Account> accounts = new List<Account>();
        //Id userId = UserInfo.getUserId();
        String currentUserName = UserInfo.getName();
        accounts = [Select id,name from Account where SVP_Involved__c = :currentUserName OR Coveted_Account__c = :currentUserName];
        for(ACcount acc:accounts){
            accountIds.add(acc.Id);
        }
        return accountIds;
    }
    
    @AuraEnabled
   public static PromptWrapperClass sendPortfolioEngagementPrompt() {
    PromptWrapperClass wp = new PromptWrapperClass();
    try {
        List<Id> accountIds = getAccountsForSurestOrQuad();
        String accountIdsString = String.join(new List<String>((List<String>)accountIds),',');
        System.debug('Portfolio Account Ids: ' + accountIds);
        if(accountIds == null || accountIds.isEmpty()) {
            throw new CustomException('No accounts found for the current user.' );
        }
        Map<String,Object> portfolioInput = new Map<String,Object>();
        portfolioInput.put('accountIds',accountIds);
        ConnectApi.WrappedValue portfolioValue = new ConnectApi.WrappedValue();
        portfolioValue.value = accountIdsString;
        Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();
        inputParams.put( 'Input:PortfolioAccounts', portfolioValue);
        System.debug('PI TC portfolioAccounts....' +inputParams);
               // System.debug('PI TC portfolioAccounts portfolioAccounts....' +portfolioAccounts);


        ConnectApi.EinsteinPromptTemplateGenerationsInput executeTemplateInput =new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        executeTemplateInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        executeTemplateInput.isPreview = false;
        executeTemplateInput.inputParams = inputParams;
        System.debug('Before Portfolio Prompt Call');
        System.debug('portfolioValue.value ==> ' + portfolioValue.value);
       // ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput = ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate 'Prospect_Engagement_Summary',executeTemplateInput);
         ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput = 
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('Prospect_Engagement_Summary',executeTemplateInput);
        System.debug('After Portfolio Prompt Call');
        if(generationsOutput != null &&  generationsOutput.generations != null &&  !generationsOutput.generations.isEmpty()) {
            ConnectApi.EinsteinLLMGenerationItemOutput response = generationsOutput.generations[0];
            String generatedText = response.text;
            System.debug('Generated Portfolio Summary: ' + generatedText);
            wp.finalContent = generatedText;
        } else {
            throw new CustomException(
                'No generations found in Portfolio Prompt output.'
            );
        }

    } catch(CustomException ce) {
        wp.finalContent = 'Custom Exception: ' + ce.getMessage();
    } catch(Exception ex) {

        wp.finalContent = 'General Exception: ' + ex.getMessage();
        System.debug( 'Portfolio Prompt Error: ' +ex.getMessage());
    }
       System.debug('FINAL AI RESPONSE =====>');
System.debug(wp.finalContent);

    return wp;
}
    
    
    public class PromptWrapperClass {
        @AuraEnabled
        public String finalContent;
    }
    public class CustomException extends Exception {}

   /* @AuraEnabled
    public static PromptWrapperClass sendEngagementPrompt() {
        PromptWrapperClass wp = new PromptWrapperClass();
        
        try {
            
            List<Id> accountIds = getAccountsForSurestOrQuad();
            
            if(accountIds.isEmpty()) {
                throw new CustomException('No accounts found');
            }
            
            Map<String,Object> portfolioInput = new Map<String,Object>();
            portfolioInput.put('accountIds', accountIds);
            
            ConnectApi.WrappedValue portfolioValue =new ConnectApi.WrappedValue();
            
            portfolioValue.value = portfolioInput;
            
            Map<String, ConnectApi.WrappedValue> inputParams =new Map<String, ConnectApi.WrappedValue>();
            
            inputParams.put( 'Input:portfolioAccounts',portfolioValue);
            
            ConnectApi.EinsteinPromptTemplateGenerationsInput executeTemplateInput =new ConnectApi.EinsteinPromptTemplateGenerationsInput();
            
            executeTemplateInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
            
            executeTemplateInput.isPreview = false;
            executeTemplateInput.inputParams = inputParams;
            ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput = ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('Portfolio_Engagement_Summary',executeTemplateInput);
            if(generationsOutput != null &&
               !generationsOutput.generations.isEmpty()) {
                   String generatedText = generationsOutput.generations[0].text;
                   wp.finalContent = generatedText;
               } else {
                   throw new CustomException(
                       'No generations found in Prompt output.'
                   );
               }
            
        } catch(CustomException ce) {
            
            wp.finalContent =
                'Custom Exception: ' + ce.getMessage();
            
        } catch(Exception ex) {
            
            wp.finalContent =
                'General Exception: ' + ex.getMessage();
        }
        
        return wp;
    }*/
    
    


}