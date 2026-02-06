public class ContactEngagementScoreHandler {
    public static void processEngagementScores(List<Contact_Engagement_Score__c> engagementScores) {
        Set<Id> contactIds = new Set<Id>();
        Set<Id> accountIds = new Set<Id>();

        // Collect all Contact IDs and their associated Account IDs
        for (Contact_Engagement_Score__c score : engagementScores) {
            if (score.Contact_Consultant__c != null) {
                contactIds.add(score.Contact_Consultant__c);
            }
        }

        if (contactIds.isEmpty()) {
            return; // No contacts to process
        }

        // Query Contacts with their latest Engagement Score
        Map<Id, Contact> contactsToUpdate = new Map<Id, Contact>();
        Map<Id, AccountProcessingInfo> accountLatestTimestampMap = new Map<Id, AccountProcessingInfo>();

        List<Contact> contactsWithLatestScores = [ 
            SELECT Id, AccountId,
                   (SELECT Id, Overall_Score__c, End_Date__c, Is_temporary__c,Processing_Method__c  
                    FROM Contact_Engagement_Scores__r
                    ORDER BY End_Date__c DESC 
                    LIMIT 1) 
            FROM Contact 
            WHERE Id IN :contactIds
        ];

        for (Contact contact : contactsWithLatestScores) {
            if (!contact.Contact_Engagement_Scores__r.isEmpty()) {
                Contact_Engagement_Score__c latestScore = contact.Contact_Engagement_Scores__r[0];

                Contact updatedContact = new Contact(Id = contact.Id);
                updatedContact.Engagement_Score__c = latestScore.Overall_Score__c;

                // Update timestamp only if Is_temporary__c = false
               // if (!latestScore.Is_temporary__c) {
                    updatedContact.Last_Engagement_Score_Run_TimeStamp__c = latestScore.End_Date__c;
                //}

                system.debug('contactId-->'+contact.Id + ' Date '+latestScore.End_Date__c);
                contactsToUpdate.put(contact.Id, updatedContact);

                // Store the latest timestamp for the Account
                if (contact.AccountId != null && !latestScore.Is_temporary__c) {
                    accountIds.add(contact.AccountId);
                    AccountProcessingInfo AccountProcessingInfoTemp = accountLatestTimestampMap.get(contact.AccountId);
                    if (AccountProcessingInfoTemp == null || latestScore.End_Date__c > AccountProcessingInfoTemp.lastRunDateTime) {
                        
                        accountLatestTimestampMap.put(contact.AccountId, new AccountProcessingInfo(latestScore.End_Date__c, latestScore.Processing_Method__c));
                    }
                }
            }
        }

        // Perform bulk update for contacts
        if (!contactsToUpdate.isEmpty()) {
            update contactsToUpdate.values();
        }

        // Update Accounts with the latest timestamp
        if (!accountLatestTimestampMap.isEmpty()) {
            List<Account> accountsToUpdate = new List<Account>();
            for (Id accountId : accountLatestTimestampMap.keySet()) {
                accountsToUpdate.add(new Account(
                    Id = accountId, 
                    Last_Calculate_Engagement_Score_Run__c = accountLatestTimestampMap.get(accountId).lastRunDateTime,
                    Processing_Method__c = accountLatestTimestampMap.get(accountId).processingMethod

                ));
            }
            update accountsToUpdate;
        }
    }
     
    
    public class AccountProcessingInfo {
        public DateTime lastRunDateTime;
        public String processingMethod;
        
        // Constructor
        public AccountProcessingInfo(DateTime lastRun, String method) {
            this.lastRunDateTime = lastRun;
            this.processingMethod = method;
        }
        
    }
}