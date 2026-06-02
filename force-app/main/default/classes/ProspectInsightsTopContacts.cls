public with sharing class ProspectInsightsTopContacts {
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
        System.debug('INPUT ==> ' + input.portfolioAccounts);
        Set<Id> accountIds = getAccountIds(input.portfolioAccounts);

        List<Response> responses = new List<Response>();
        Response output = new Response();
        responses.add(output);
        
        output.Prompt = 'Top Contacts Engagement Report:\n';
        
        //List<Id> topContactIds = getTopEngagedContactIds(input.account.Id, 3);
          List<Id> topContactIds = getTopEngagedContactIds(accountIds, 3);

        if (topContactIds == null || topContactIds.isEmpty()) {
            output.Prompt += '\nNo engaged contacts found for this account.';
            return responses;
        }
        
        Map<Id, String> contactNames = new Map<Id, String>();
        for (Contact c : [SELECT Id, Name FROM Contact WHERE Id IN :topContactIds]) {
            contactNames.put(c.Id, c.Name);
        }
        
        Map<Id, Map<String, Map<String, Integer>>> contactsEngagement = new Map<Id, Map<String, Map<String, Integer>>>();
        
        for (AggregateResult ar : [ 
            SELECT ContactId__c, Channel__c, Activity__c, SUM(Activity_Count__c) total 
            FROM Engagement_Activity_Metrics__c 
            WHERE ContactId__c IN :topContactIds 
			AND End_Date__c > :filterStartDate 
    		AND End_Date__c <= :Date.today() 
            GROUP BY ContactId__c, Channel__c, Activity__c 
        ]) {
            Id contactId = (Id) ar.get('ContactId__c');
            String channel = (String) ar.get('Channel__c');
            String activity = (String) ar.get('Activity__c');
            Decimal decimalCount = (Decimal) ar.get('total');
            // CHANGE 2: Added null check for decimalCount
            Integer count = decimalCount != null ? decimalCount.intValue() : 0;
            
            // Initializing contact map if not present
            if (!contactsEngagement.containsKey(contactId)) {
                contactsEngagement.put(contactId, new Map<String, Map<String, Integer>>());
            }
            // Initializing channel map if not present
            if (!contactsEngagement.get(contactId).containsKey(channel)) {
                contactsEngagement.get(contactId).put(channel, new Map<String, Integer>());
            }
            // Store activity count under the respective channel
            contactsEngagement.get(contactId).get(channel).put(activity, count);
        }
        
        // CHANGE 3: Modified output generation to loop through topContactIds
        // instead of contactsEngagement.keySet() to ensure contacts are displayed in score order
        for (Id contactId : topContactIds) {
            String contactName = contactNames.containsKey(contactId) ? contactNames.get(contactId) : 'Unknown Contact';
            output.Prompt += '\nContact: ' + contactName + '\n';
            
            // CHANGE 4: Added check if contact has engagement data
            if (contactsEngagement.containsKey(contactId)) {
                Map<String, Map<String, Integer>> channelData = contactsEngagement.get(contactId);
                for (String channel : channelData.keySet()) {
                    output.Prompt += '  ' + channel + ':\n';
                    Map<String, Integer> activities = channelData.get(channel);
                    for (String activity : activities.keySet()) {
                        output.Prompt += '    - ' + activity + ': ' + activities.get(activity) + '\n';
                    }
                }
            } else {
                output.Prompt += '  No engagement activities found for this contact.\n';
            }
        }
        
        return responses;
    }
    
    //private static List<Id> getTopEngagedContactIds(Id accountId, Integer maxContacts) {
    private static List<Id> getTopEngagedContactIds(Set<Id> accountIds, Integer maxContacts) {
        if (maxContacts == null) {
            maxContacts = 3; 
        }
        
       // List<Contact> contacts = [SELECT Id, Name FROM Contact WHERE AccountId = :accountId];
           List<Contact> contacts = [SELECT Id, Name FROM Contact WHERE AccountId = :accountIds];

        Set<Id> contactIds = new Set<Id>();
        for(Contact c : contacts) {
            contactIds.add(c.Id);
        }
        
        // CHANGE 5: Added check for empty contactIds
        if (contactIds.isEmpty()) {
            return new List<Id>();
        }
        
        Map<Id, Contact_Engagement_Score__c> latestScores = new Map<Id, Contact_Engagement_Score__c>();
        for(Contact_Engagement_Score__c score : [
            SELECT Contact_Consultant__c, Overall_Score__c, End_Date__c	 
            FROM Contact_Engagement_Score__c 
            WHERE Contact_Consultant__c IN :contactIds 
            ORDER BY Contact_Consultant__c, End_Date__c DESC
        ]) {
            if(!latestScores.containsKey(score.Contact_Consultant__c)) {
                latestScores.put(score.Contact_Consultant__c, score);
            }
        }
        
        List<ScoredContact> scoredContacts = new List<ScoredContact>();
        for(Contact_Engagement_Score__c score : latestScores.values()) {
            scoredContacts.add(new ScoredContact(score.Contact_Consultant__c, score.Overall_Score__c));
        }
        
        scoredContacts.sort();
        
        List<Id> topContactIds = new List<Id>();
        for(Integer i = 0; i < Math.min(maxContacts, scoredContacts.size()); i++) {
            topContactIds.add(scoredContacts[i].contactId);
        }
        
        return topContactIds;
    }
    
    public class Request {
        @InvocableVariable(required=true)
        //public Account account;
        public String portfolioAccounts;

    }
    
    public class Response {
        @InvocableVariable
        public String Prompt;
    }
    
    public class ScoredContact implements Comparable {
        public Id contactId;
        public Decimal score;
    
        public ScoredContact(Id contactId, Decimal score) {
            this.contactId = contactId;
            this.score = score;
        }
    
        public Integer compareTo(Object compareTo) {
            ScoredContact compareToContact = (ScoredContact)compareTo;
            
            if (score > compareToContact.score) return -1;
            if (score < compareToContact.score) return 1;
            return 0;
        }
    }
    
    
    private static Set<Id> getAccountIds(String portfolioAccounts ){
                System.debug('PI TC portfolioAccounts....' +portfolioAccounts);

        Set<Id> accountIds = new Set<Id>();
        for(String accId : portfolioAccounts.split(',')){
                
                accountIds.add((Id)accId.trim());
            }
        return accountIds;
    }

}