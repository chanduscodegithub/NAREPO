public with sharing class AccountEngagementPerformanceFetcher {
    
    @InvocableMethod
    public static List<Response> getPrompt(List<Request> requests) {
        // CHANGE 1: Added error handling for custom label
        Date filterStartDate;
        try {
            filterStartDate = Date.valueOf(Label.Engagement_Filter_Start_Date);
        } catch (Exception e) {
            // Handle missing or invalid label in test context
            filterStartDate = Date.today().addDays(-360); // Default to 30 days ago if label issue
        }
        
        Request input = requests[0];
        List<Response> responses = new List<Response>();
        Response output = new Response();
        responses.add(output);
        
        output.Prompt = 'Channel Performance Report for Account\n';
        
        
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
            WHERE AccountId__c = :input.account.Id 
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
            
            for (String channel : channelPerformance.keySet()) {
                Double totalWeight =0;
                output.Prompt += '\n' + channel + ':\n';
                Map<String, Integer> activities = channelPerformance.get(channel);
                for (String activity : activities.keySet()) {
                    output.Prompt += ' - ' + activity + ': ' + activities.get(activity) + '\n';
                    if(channelToScoreMap.get(channel+'_'+activity)!=null)
                        totalWeight +=channelToScoreMap.get(channel+'_'+activity) * activities.get(activity);

                }
                output.Prompt += 'Channel Activity Score : '+totalWeight+'\n';
            }
        }
        
        return responses;
    }
    
    public class Request {
        @InvocableVariable(required=true)
        public Account account;
    }
    
    public class Response {
        @InvocableVariable
        public String Prompt;
    }
}