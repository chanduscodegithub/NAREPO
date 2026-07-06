public with sharing class ProspectEngagementInsightsController {
    public class AccessResponse {
        @AuraEnabled
        public Boolean canViewSvpTab;
        @AuraEnabled
        public Boolean canViewQuad4Tab;
        @AuraEnabled
        public Boolean fullAccess;
        @AuraEnabled
        public String defaultTeam;
        @AuraEnabled
        public List<String> users;
         @AuraEnabled
        public List<String> svpLabels1    = new List<String>(); // SVP tile emails
        @AuraEnabled
        public List<String> quad4Labels1   = new List<String>();
    }
    @AuraEnabled 
    public static AccessResponse getUserInfo(){
        String  currentEmail = UserInfo.getUserEmail();
        List<Prospect_Insight_Access__mdt> accessList = [SELECT Visible_Tiles__c,Is_SVP__c,IS_Quad4__c,Full_Access__c,Email__c,
                                                         Access_Type__c,Label From Prospect_Insight_Access__mdt 
                                                         where Email__c =:currentEmail with USER_MODE Limit 1];
        AccessResponse accessresponse = new AccessResponse();
        if (accessList.isEmpty()) {
            return accessresponse;
        }
        Prospect_Insight_Access__mdt access = accessList[0];
        Boolean isFull = access.Full_Access__c;
        Boolean isSVP  = access.Is_SVP__c;
        Boolean isQ4   = access.IS_Quad4__c;
        accessresponse.fullAccess       = isFull;
        //accessresponse.canViewSvpTab    = isFull || isSVP || !svpLabels.isEmpty();
        //accessresponse.canViewQuad4Tab  = isFull || isQ4 || !quad4Labels.isEmpty();
        accessresponse.defaultTeam      = (isFull || isSVP) ? 'SVP' : 'Quad4';
        Set<String> visibleEmails = new Set<String>();
        //Parse emails into visibileEMailsList from visibleTiles
        if(access.Full_Access__c){
            for(Prospect_Insight_Access__mdt pr:[SELECT Visible_Tiles__c FROM   Prospect_Insight_Access__mdt]){
                if(String.isNotBlank(pr.Visible_Tiles__c)){
                    visibleEmails.addAll(pr.Visible_Tiles__c.split(','));
                }
            }
        }
        else if(String.isNotBlank(access.Visible_Tiles__c)){
            for(String sr:access.Visible_Tiles__c.split(',')){
                string cleaned = sr.trim().toLowerCase();
                if(String.isNotBlank(cleaned)){
                    visibleEmails.add(cleaned);
                }
            }
        }
        if(visibleEmails.isEmpty()) {
            return accessresponse;
        }
        Set<String> svpLabels   = new Set<String>();
        Set<String> quad4Labels = new Set<String>();
        Map<String, Prospect_Insight_Access__mdt> emailToMdt = new Map<String, Prospect_Insight_Access__mdt>();
        for(Prospect_Insight_Access__mdt  pi:[SELECT  Email__c, Access_Type__c,Label FROM    Prospect_Insight_Access__mdt WHERE   Email__c IN :visibleEmails with USER_MODE]){
            String email = pi.Email__c.trim().toLowerCase();    
            emailToMdt.put(email, pi);
            if(pi.Access_Type__c == 'SVP' || pi.Access_Type__c == 'FULL_ACCESS'){
                svpLabels.add(pi.Label);
            }
            if(pi.Access_Type__c == 'Quad4' || pi.Access_Type__c == 'FULL_ACCESS'){
                quad4Labels.add(pi.Label);
            }
        }
        System.debug('svpLabels'+svpLabels);
        System.debug('quad4Labels'+quad4Labels);
       List<String> svpLabels1 = new List<String>(svpLabels);
       List<String> quad4Labels1 = new List<String>(quad4Labels);
       accessresponse.svpLabels1 =svpLabels1 ;
       accessresponse.quad4Labels1 =quad4Labels1;
       accessresponse.canViewSvpTab =isFull || isSVP || !svpLabels.isEmpty();
       accessresponse.canViewQuad4Tab = isFull || isQ4 || !quad4Labels.isEmpty();

       
        return accessresponse;
    }
    @AuraEnabled(cacheable=true)
    public static List<String> getTierPicklistValues() {
        List<String> values = new List<String>();
        for (Schema.PicklistEntry entry : 
             Account.Company_Tier_Medical__c.getDescribe().getPicklistValues()) {
                 if (entry.isActive()) {
                     values.add(entry.getValue());
                 }
             }
        return values;
    }
    @AuraEnabled
    public static Map<String, List<Id>> getAccountIdsPerUser(List<String> svpUserNames,List<String> quad4UserNames,List<String> tiers) {
        Map<String, List<Id>> accountIdsForEachUser = new Map<String, List<Id>>();
        for(String s:svpUserNames){
            accountIdsForEachUser.put('SVP_'+s,new List<Id>());
        }
        for(String s:quad4UserNames){
            accountIdsForEachUser.put('QUAD4_'+s,new List<Id>());
        }
        if(!svpUserNames.isEmpty()){
            for(Account a: [SELECT Id, Name,Owner.Name FROM Account WHERE SVP_Top_10__c = true AND Direct_Marketing_Target__c = true AND Owner.Name IN :svpUserNames AND Company_Tier_Medical__c IN :tiers with USER_MODE]){
                accountIdsForEachUser.get('SVP_'+a.Owner.Name).add(a.Id);
            }
        }
        if(!quad4UserNames.isEmpty()){
            for(Account a: [SELECT Id, Name, Coveted_Account__c  FROM Account WHERE SVP_Top_10__c = true AND Direct_Marketing_Target__c = true AND Coveted_Account__c  IN :quad4UserNames AND Company_Tier_Medical__c IN :tiers with USER_MODE]){
                accountIdsForEachUser.get('QUAD4_'+a.Coveted_Account__c ).add(a.Id);
            }
        }
        return accountIdsForEachUser;
        
    }
    
    @AuraEnabled
    public static String getPromptDataForUser(List<Id> accountIds) {
        try {
            if (accountIds == null || accountIds.isEmpty()) return null;
            String portfolioAccounts = String.join(accountIds, ',');
            System.debug('portfolioAccounts ===> ' + portfolioAccounts);
            // pass to Einstein prompt template
            ConnectApi.WrappedValue portfolioValue = new ConnectApi.WrappedValue();
            portfolioValue.value = portfolioAccounts;
            
            Map<String, ConnectApi.WrappedValue> inputParams =new Map<String, ConnectApi.WrappedValue>();
            inputParams.put('Input:portfolioAccounts', portfolioValue);
            
            ConnectApi.EinsteinPromptTemplateGenerationsInput executeTemplateInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
            executeTemplateInput.additionalConfig =new ConnectApi.EinsteinLlmAdditionalConfigInput();
            executeTemplateInput.isPreview   = false;
            executeTemplateInput.inputParams = inputParams;
            System.debug('Calling Einstein prompt for accounts: ' + portfolioAccounts);
            ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput = ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('Engagement_Summary_Insights',executeTemplateInput);
            if (generationsOutput != null && generationsOutput.generations != null && !generationsOutput.generations.isEmpty()) {
                    String generatedText = generationsOutput.generations[0].text;
                    System.debug('Generated JSON: ' + generatedText);
                    return generatedText;
                }
            return null;
            
        } catch(Exception ex) {
            System.debug('Error in getPromptDataForUser: ' + ex.getMessage() + ex.getStackTraceString());
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    
   @AuraEnabled
public static String getOverallPortfolioSummary(String userSummariesJson) {
    try {
        ConnectApi.WrappedValue summaryValue = new ConnectApi.WrappedValue();
        summaryValue.value = userSummariesJson;

        Map<String, ConnectApi.WrappedValue> inputParams =
            new Map<String, ConnectApi.WrappedValue>();
        inputParams.put('Input:UserSummaries', summaryValue);

        ConnectApi.EinsteinPromptTemplateGenerationsInput executeTemplateInput =
            new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        executeTemplateInput.additionalConfig =
            new ConnectApi.EinsteinLlmAdditionalConfigInput();
        executeTemplateInput.isPreview = false;
        executeTemplateInput.inputParams = inputParams;

        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation result =
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(
                'Portfolio_Overall_Summary',
                executeTemplateInput
            );

        if (result != null
            && result.generations != null
            && !result.generations.isEmpty()) {
            return result.generations[0].text;
        }
        return null;
    } catch(Exception ex) {
        throw new AuraHandledException(ex.getMessage());
    }
}
    
    
    
}
    
   /* @AuraEnabled
    public static List<Id> getAccountsForSurestOrQuad(){
        List<Id> accountIds = new List<Id>();
        List<Account> accounts = new List<Account>();
        //Id userId = UserInfo.getUserId();
        String currentUserName = UserInfo.getName();
        accounts = [Select id,name from Account where SVP_Involved__c = :currentUserName OR Coveted_Account__c = :currentUserName with USER_MODE];
        for(ACcount acc:accounts){
            accountIds.add(acc.Id);
        }
        return accountIds;
    }*/
    
   /* @AuraEnabled
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
    public class CustomException extends Exception {}*/
    
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