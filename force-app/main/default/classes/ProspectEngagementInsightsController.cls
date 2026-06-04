public with sharing class ProspectEngagementInsightsController {
    
    public class AccessResponse {
        @AuraEnabled
        public Boolean canViewSVP;
        @AuraEnabled
        public Boolean canViewQuad4;
        @AuraEnabled
        public Boolean fullAccess;
        @AuraEnabled
        public String defaultTeam;
        @AuraEnabled
        public List<String> users;
        @AuraEnabled
        public List<TileData> svpUsers     = new List<TileData>(); // SVP tile emails
        @AuraEnabled
        public List<TileData> quad4Users   = new List<TileData>(); 
    }
    public class TileData {
        @AuraEnabled public String      name;
        @AuraEnabled public String      email;
        @AuraEnabled public String      accessType;   // SVP, Quad4, Both
        @AuraEnabled public List<Id>    accountIds = new List<Id>();
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
        accessresponse.fullAccess =access.Full_Access__c;
        accessresponse.canViewSVP = access.Is_SVP__c;
        accessresponse.canViewQuad4 = access.IS_Quad4__c;
        accessresponse.defaultTeam = access.Full_Access__c ? 'SVP' : 'Quad4';
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
        for(Prospect_Insight_Access__mdt  pi:[SELECT  Email__c, Access_Type__c,Label FROM    Prospect_Insight_Access__mdt WHERE   Email__c IN :visibleEmails]){
            String email = pi.Email__c.trim().toLowerCase();    
            emailToMdt.put(email, pi);
            if(pi.Access_Type__c == 'SVP' || pi.Access_Type__c == 'FULL_ACCESS'){
                svpLabels.add(pi.Label);
            }
            if(pi.Access_Type__c == 'Quad4' || pi.Access_Type__c == 'FULL_ACCESS'){
                quad4Labels.add(pi.Label);
            }
        }
        if(emailToMdt.isEmpty()) return accessresponse;
        Map<String, List<Id>> labelToAccountIds = new Map<String, List<Id>>();
        if(!svpLabels.isEmpty()){
            for(Account acc : [SELECT Id, SVP_Involved__c FROM Account WHERE SVP_Involved__c IN :svpLabels]){
                String key = acc.SVP_Involved__c;
                if(!labelToAccountIds.containsKey(key)) 
                    labelToAccountIds.put(key, new List<Id>());
                labelToAccountIds.get(key).add(acc.Id);
            }
        }
        if(!quad4Labels.isEmpty()){
            for(Account acc : [SELECT Id, Coveted_Account__c FROM Account 
                               WHERE Coveted_Account__c IN :quad4Labels]){
                                   String key = acc.Coveted_Account__c;
                                   if(!labelToAccountIds.containsKey(key)) labelToAccountIds.put(key, new List<Id>());
                                   labelToAccountIds.get(key).add(acc.Id);
                               }
        }
        
        for(String email : emailToMdt.keySet()){
            Prospect_Insight_Access__mdt pi = emailToMdt.get(email);
            String accessType = pi.Access_Type__c;
            
            TileData td   = new TileData();
            td.name       = pi.Label;
            td.email      = email;
            td.accessType = accessType;
            td.accountIds = labelToAccountIds.containsKey(pi.Label)
                ? labelToAccountIds.get(pi.Label)
                : new List<Id>();
            
            if(accessType == 'SVP' || accessType == 'Both'){
                accessresponse.svpUsers.add(td);
            }
            if(accessType == 'Quad4' || accessType == 'Both'){
                accessresponse.quad4Users.add(td);
            }
        }
        
        
        
        /*if(!visibleEmails.isEmpty()){
for(Prospect_Insight_Access__mdt  pi:[SELECT  Email__c, Access_Type__c,Label FROM    Prospect_Insight_Access__mdt WHERE   Email__c IN :visibleEmails])
{
String email = pi.Email__c.trim().toLowerCase();
String accessType = pi.Access_Type__c;
if(accessType =='SVP'){
accessresponse.svpUsers.add(email);
}
else if(accessType =='QUAD4'){
accessresponse.quad4Users.add(email);
}
else if (accessType == 'Both') {
// Person appears in both tabs
accessresponse.svpUsers.add(email);
accessresponse.quad4Users.add(email);
}

}
}*/
        return accessresponse;
    }
    
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