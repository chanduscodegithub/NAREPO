public with sharing class ProspectInsightsAccountPerformance {
    @InvocableMethod
    public static List<Response> getPrompt(List<Request> requests) {
        // CHANGE 1: Added error handling for custom label
        Request input = requests[0];
       /* Date filterStartDate;
        if (input.dateRange != null && input.dateRange > 0) {
            filterStartDate = Date.today().addDays(-input.dateRange);
        } else {
            try {
                filterStartDate = Date.valueOf(Label.Engagement_Filter_Start_Date);
            } catch (Exception e) {
                filterStartDate = Date.today().addDays(-700);
            }
        }*/
        Date filterStartDate;
        try {
            /*if (input.dateRange != null && input.dateRange > 0) {
                filterStartDate = Date.today().addDays(-input.dateRange);
                System.debug('filterStartDate'+filterStartDate);
            }*/
            filterStartDate = Date.valueOf(Label.Engagement_Filter_Start_Date);
        } catch (Exception e) {
            // Handle missing or invalid label in test context
            filterStartDate = Date.today().addDays(-360); // Default to 30 days ago if label issue
        }
        
        System.debug('INPUT ==> ' + input.portfolioAccounts);
        Set<Id> accountIds = getAccountIds(input.portfolioAccounts);
        List<Response> responses = new List<Response>();
        Response output = new Response();
        responses.add(output);
        
        //output.Prompt = 'Channel Performance Report for Account\n';
        output.Prompt = 'Channel Performance Report for Portfolio\n';
        
        // ── ADD THIS BLOCK ──────────────────────────────────────────────
        // Query account details and add to prompt
        // ── ACCOUNT DETAILS ──────────────────────────────────────────────
        Map<Id, Account> accountMap = new Map<Id, Account>([
            SELECT Id, Name, Industry_Vertical__c, Company_Tier_Medical__c
            FROM Account
            WHERE Id IN :accountIds
            WITH USER_MODE
        ]);
        
        if (!accountMap.isEmpty()) {
            output.Prompt += '\nPortfolio Account Details:\n';
            for (Account acc : accountMap.values()) {
                output.Prompt += '- Account: ' + acc.Name
                    + ' | Industry: ' + (acc.Industry_Vertical__c != null ? acc.Industry_Vertical__c : 'N/A')
                    + ' | Tier: ' + (acc.Company_Tier_Medical__c != null ? acc.Company_Tier_Medical__c : 'N/A')
                    + '\n';
            }
        }
        
        // ── END
        
        
        
        Map<String, Map<String, Integer>> channelPerformance = new Map<String, Map<String, Integer>>();
        Map<String, Decimal> channelToScoreMap = new Map<String, Decimal>();
        
        list<Channel_Activity__c> channelWeightages =[SELECT Channel__r.Name, Per_Activity_Score__c, Activity_type__c FROM Channel_Activity__c];
        for (Channel_Activity__c act : channelWeightages) {
            //system.debug('act.Channel__c act.Activity_type__c'+act.Channel__c+'_'+act.Activity_type__c);
            channelToScoreMap.put(act.Channel__r.Name+'_'+act.Activity_type__c, act.Per_Activity_Score__c);
        }  
        
        for (AggregateResult ar : [ 
            SELECT Channel__c, Activity__c, SUM(Activity_Count__c) total 
            FROM Engagement_Activity_Metrics__c 
            // WHERE AccountId__c = :input.account.Id
            WHERE AccountId__c = :accountIds
            AND End_Date__c > :filterStartDate 
            AND End_Date__c <= :Date.today() 
            GROUP BY Channel__c, Activity__c 
        ]) {
            String channel = (String) ar.get('Channel__c');
            String activity = (String) ar.get('Activity__c');
            Decimal decimalCount = (Decimal) ar.get('total');
            
            // CHANGE 2: Added null check for decimalCount
            Integer count = decimalCount != null ? decimalCount.intValue() : 0;
            
            // CHANGE 3: Added null checks for channel and activity
            if (channel == null || activity == null) {
                continue; // Skip this record if channel or activity is null
            }
            
            if (!channelPerformance.containsKey(channel)) {
                channelPerformance.put(channel, new Map<String, Integer>());
            }
            
            channelPerformance.get(channel).put(activity, count);
        }
        if (channelPerformance.isEmpty()) {
            output.Prompt += '\nNo engagement activities found for this account.';
        } else {
            
            Integer totalEngagements = 0;
            Integer totalPositive    = 0;
            Double  totalWeightedSum = 0; // ← NEW
            
            for (String channel : channelPerformance.keySet()) {
                Double totalWeight = 0;
                output.Prompt += '\n' + channel + ':\n';
                Map<String, Integer> activities = channelPerformance.get(channel);
                
                for (String activity : activities.keySet()) {
                    Integer count = activities.get(activity);
                    output.Prompt += ' - ' + activity + ': ' + count + '\n';
                    
                    totalEngagements += count;
                    
                    Decimal weight = channelToScoreMap.get(channel + '_' + activity);
                    if (weight != null) {
                        totalWeight      += weight * count;
                        totalWeightedSum += weight * count; // ← NEW
                        if (weight > 0) {
                            totalPositive += count;
                        }
                    }
                }
                output.Prompt += 'Channel Activity Score: ' + totalWeight + '\n';
            }
            
            // ← NEW — WES formula
            Decimal wes = totalEngagements > 0
                ? (Decimal.valueOf(totalWeightedSum) / totalEngagements).setScale(3)
                : 0;
            
            // ← NEW — Engagement Rate formula
            Decimal engagementRate = totalEngagements > 0
                ? (Decimal.valueOf(totalPositive) / totalEngagements * 100).setScale(1)
                : 0;
            
            output.Prompt += '\nEngagement Summary:';
            output.Prompt += '\nTotal Engagements: '         + totalEngagements;
            output.Prompt += '\nTotal Positive Responses: '  + totalPositive;
            output.Prompt += '\nWeighted Engagement Score: ' + wes;          // ← NEW
            output.Prompt += '\nEngagement Rate: '           + engagementRate + '%\n'; // ← NEW
        }  
        return responses;
    }
    
    public class Request {
        @InvocableVariable(required=true)
        //public Account account;
        public String portfolioAccounts;
        //@InvocableVariable(required=true)
       //public Integer dateRange;
        @InvocableVariable(required=false label='Start Date')
        public Date startDate;
        
        @InvocableVariable(required=false label='End Date')
        public Date endDate;
        
    }
    
    public class Response {
        @InvocableVariable
        public String Prompt;
    }
    
    private static Set<Id> getAccountIds(String portfolioAccounts ){
        System.debug('PI AP portfolioAccounts....' +portfolioAccounts);
        Set<Id> accountIds = new Set<Id>();
        for(String accId : portfolioAccounts.split(',')){
            
            accountIds.add((Id)accId.trim());
        }
        return accountIds;
    }
    
}