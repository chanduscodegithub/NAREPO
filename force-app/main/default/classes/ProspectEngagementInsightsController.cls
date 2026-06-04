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
        public List<String> svpUsers     = new List<String>(); // SVP tile emails
        @AuraEnabled
        public List<String> quad4Users   = new List<String>(); 
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
        accessresponse.defaultTeam = access.Is_SVP__c ? 'SVP' : 'Quad4';
        Set<String> visibleEmails = new Set<String>();
        //Parse emails into visibileEMailsList from visibleTiles
        if(access.Full_Access__c){
            for(Prospect_Insight_Access__mdt pr:[SELECT Email__c FROM   Prospect_Insight_Access__mdt  WHERE  Email__c != null]){
                visibleEmails.add(pr.Email__c.trim().toLowercase());
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
        if(!visibleEmails.isEmpty()){
            for(Prospect_Insight_Access__mdt  pi:[SELECT  Email__c, Access_Type__c FROM    Prospect_Insight_Access__mdt WHERE   Email__c IN :visibleEmails])
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
        }
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
    
// Method 1 — returns tab flags as a Map
/*@AuraEnabled(cacheable=true)
public static Map<String, Boolean> getAccessFlags() {
    String currentEmail = UserInfo.getUserEmail();
    List<Prospect_Insight_Access__mdt> records = [
        SELECT Is_SVP__c, IS_Quad4__c, Full_Access__c
        FROM   Prospect_Insight_Access__mdt
        WHERE  Email__c = :currentEmail
        WITH   USER_MODE
        LIMIT  1
    ];
    Map<String, Boolean> flags = new Map<String, Boolean>{
        'canViewSVP'   => false,
        'canViewQuad4' => false,
        'fullAccess'   => false
    };
    if (!records.isEmpty()) {
        flags.put('canViewSVP',   records[0].Is_SVP__c   || records[0].Full_Access__c);
        flags.put('canViewQuad4', records[0].IS_Quad4__c  || records[0].Full_Access__c);
        flags.put('fullAccess',   records[0].Full_Access__c);
    }
    return flags;
}

// Method 2 — returns tile emails split by tab, no wrapper, no duplicates
@AuraEnabled(cacheable=true)
public static Map<String, List<String>> getTileUsers() {
    String currentEmail = UserInfo.getUserEmail();

     ── Get logged-in user's CMT record ── *
    List<Prospect_Insight_Access__mdt> records = [
        SELECT  Visible_Tiles__c,
                Full_Access__c
        FROM    Prospect_Insight_Access__mdt
        WHERE   Email__c = :currentEmail
        WITH    USER_MODE
        LIMIT   1
    ];

    Map<String, List<String>> result = new Map<String, List<String>>{
        'SVP'   => new List<String>(),
        'Quad4' => new List<String>()
    };

    if (records.isEmpty()) return result;

    Prospect_Insight_Access__mdt myRecord = records[0];

    ── Parse visible emails into a Set — no duplicates ── 
    Set<String> visibleEmails = new Set<String>();

    if (myRecord.Full_Access__c) {
        for (Prospect_Insight_Access__mdt r : [
            SELECT Email__c
            FROM   Prospect_Insight_Access__mdt
            WHERE  Email__c != null
            AND    Is_Active__c = TRUE
        ]) {
            visibleEmails.add(r.Email__c.trim().toLowerCase());
        }
    } else if (String.isNotBlank(myRecord.Visible_Tiles__c)) {
        for (String e : myRecord.Visible_Tiles__c.split(',')) {
            String cleaned = e.trim().toLowerCase();
            if (String.isNotBlank(cleaned)) {
                visibleEmails.add(cleaned); // Set handles duplicates
            }
        }
    }

    /* ── Look up Access_Type for each visible email ──
       One query — routes each email to SVP or Quad4 list ── 
    if (!visibleEmails.isEmpty()) {
        for (Prospect_Insight_Access__mdt r : [
            SELECT  Email__c,
                    Access_Type__c
            FROM    Prospect_Insight_Access__mdt
            WHERE   Email__c IN :visibleEmails
        ]) {
            String email = r.Email__c.trim().toLowerCase();
            String type  = r.Access_Type__c;

            if (type == 'SVP') {
                result.get('SVP').add(email);
            } else if (type == 'Quad4') {
                result.get('Quad4').add(email);
            } else if (type == 'Both') {
                result.get('SVP').add(email);
                result.get('Quad4').add(email);
            }
        }
    }

    return result;
}*/
    
    
    
}