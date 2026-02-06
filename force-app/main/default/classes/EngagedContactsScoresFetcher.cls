public with sharing class EngagedContactsScoresFetcher {
    
     @InvocableMethod
    public static List<Response> getPrompt(List<Request> requests) {
        Request input = requests[0];
        List<Response> responses = new List<Response>();
        Response output = new Response();
        responses.add(output);
        
        output.Prompt = '\nEngaged Contacts:';
        
        List<Contact> contacts = [SELECT Id, Name FROM Contact WHERE AccountId = :input.account.Id];
        Set<Id> contactIds = new Set<Id>();
        Map<Id, String> contactNames = new Map<Id, String>();
        
        for(Contact c : contacts) {
            contactIds.add(c.Id);
            contactNames.put(c.Id, c.Name);
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
        
        if (scoredContacts.isEmpty()) {
            output.Prompt += '\nNo engagement scores found for contacts in this account.';
        } else {
            for(ScoredContact sc : scoredContacts) {
                String contactName = contactNames.get(sc.contactId);
                String formattedScore = String.valueOf(sc.score.setScale(2));
                output.Prompt += '\n' + contactName + ': ' + formattedScore;
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
    

}