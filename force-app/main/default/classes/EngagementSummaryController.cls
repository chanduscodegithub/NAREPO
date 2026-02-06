public with sharing class EngagementSummaryController {
    
    
        public class PromptWrapperClass {
        @AuraEnabled
        public String finalContent;
        
        @AuraEnabled
        public DateTime lastRunDate; // New field to store last run date
    }


	public class CustomException extends Exception {}



		public static Map<String, Object> populateContactDetails(Map<String, Object> topEngagedContacts, Id accountId) {
            if (topEngagedContacts == null) {
                return null;
            }
            
            // The keys in the map are assumed to be the contact names.
            Set<String> contactNames = topEngagedContacts.keySet();

			System.debug('contactname-->'+contactNames);
            
            // Query Contact records using the retrieved names and accountId.
            Map<String, Contact> contactMap = new Map<String, Contact>();
            for (Contact c : [SELECT Name, Title, Email FROM Contact WHERE Name IN :contactNames AND AccountId = :accountId]) {
                contactMap.put(c.Name, c);
            }
            


            // Update each contact entry with Title and Email if available.
            for (String contactName : topEngagedContacts.keySet()) {
                if (contactMap.containsKey(contactName)) {
                    Contact c = contactMap.get(contactName);
                    // Assuming each value is a map representing contact details.
                    Map<String, Object> contactDetails = (Map<String, Object>) topEngagedContacts.get(contactName);
                    contactDetails.put('title', c.Title);
                    contactDetails.put('email', c.Email);
                }
            }
            
            return topEngagedContacts;
        }
    
           @AuraEnabled(cacheable=true)
        public static Map<String, Object> getEngagementSummary(Id accountId) {
    // Querying the Engagement_Summary__c records
    List<Engagement_Summary__c> summaries = [
        SELECT 
            Engagement_Channels_and_Performance__c,
            Contacts_Engaged__c,
            Preferred_Channels_by_Top_Contacts__c,
            Collective_Engagement_Insights__c,
            Key_Takeaways_and_Recommendations__c,
            CreatedDate  // Include the last run date
        FROM Engagement_Summary__c
        WHERE Company__c = :accountId
        ORDER BY CreatedDate DESC 
        LIMIT 1
    ];

    Map<String, Object> responseMap = new Map<String, Object>();

    // ✅ Check if any records were found before accessing fields
    if (!summaries.isEmpty()) {
        Engagement_Summary__c summary = summaries[0]; // Get the first record

        responseMap.put('__metadata', new Map<String, Object>{
            'lastRunDate' => summary.CreatedDate.format('MMM dd, yyyy, hh:mm a')
        });

        responseMap.put('Engagement Channels & Performance', 
            String.isNotBlank(summary.Engagement_Channels_and_Performance__c) ? 
            (Map<String, Object>) JSON.deserializeUntyped(summary.Engagement_Channels_and_Performance__c) : null);

        responseMap.put('Top Engaged Contacts', 
            String.isNotBlank(summary.Contacts_Engaged__c) ? 
            (Map<String, Object>) JSON.deserializeUntyped(summary.Contacts_Engaged__c) : null);

        responseMap.put('Preferred Channels for our Top Contacts', 
            String.isNotBlank(summary.Preferred_Channels_by_Top_Contacts__c) ? 
            (Map<String, Object>) JSON.deserializeUntyped(summary.Preferred_Channels_by_Top_Contacts__c) : null);

        responseMap.put('Engagement Insights (Top 3 Contacts)', 
            String.isNotBlank(summary.Collective_Engagement_Insights__c) ? 
            (Map<String, Object>) JSON.deserializeUntyped(summary.Collective_Engagement_Insights__c) : null);

        responseMap.put('Key Takeaways & Recommendations', 
            String.isNotBlank(summary.Key_Takeaways_and_Recommendations__c) ? 
            (List<Object>) JSON.deserializeUntyped(summary.Key_Takeaways_and_Recommendations__c) : null);
    }

    // ✅ Ensure Top Engaged Contacts exist before processing further
    if (responseMap.containsKey('Top Engaged Contacts') && responseMap.get('Top Engaged Contacts') != null) {
        Map<String, Object> topEngagedContacts = (Map<String, Object>) responseMap.get('Top Engaged Contacts');
        Map<String, Object> enrichedContacts = populateContactDetails(topEngagedContacts, accountId);
        responseMap.put('Top Engaged Contacts', enrichedContacts);
    }

    return responseMap;
}

         @AuraEnabled
    public static PromptWrapperClass sendEngagementPrompt(String recId) {
    PromptWrapperClass wp = new PromptWrapperClass();
    try {
system.debug('inside engagement generate method');  
        system.debug('recid'+recId);
        if (String.isEmpty(recId) || recId.length() != 18) {
        throw new CustomException('Invalid or missing Account Id.');
        }
        
           List<Account> accList = [SELECT Id, Name FROM Account WHERE Id = :recId LIMIT 1];
            if (accList.isEmpty()) {
                throw new CustomException('No Account found for the given Id: ' + recId);
            }
            Account account = accList[0];
        if (account == null) {
            throw new CustomException('Account record does not exist.');
        }
        
          
        Map<String, String> accountInput = new Map<String, String>();
        accountInput.put('id', account.Id);
                system.debug('recidmap'+accountInput);

        ConnectApi.WrappedValue accountValue = new ConnectApi.WrappedValue();
        accountValue.value = accountInput;
        
        Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();
        inputParams.put('Input:account', accountValue);
        
        ConnectApi.EinsteinPromptTemplateGenerationsInput executeTemplateInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        
        
        executeTemplateInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        //executeTemplateInput.additionalConfig.applicationName = 'EngagementSummaryApp';
        
        executeTemplateInput.isPreview = false;  // Resolve and generate completion
       // executeTemplateInput.numGenerations = 1;  // Number of responses to generate
       // executeTemplateInput.temperature = 0.7;  // Moderate creativity
       // executeTemplateInput.frequencyPenalty = 0.5;  // Moderate repetition reduction
        
        executeTemplateInput.inputParams = inputParams;
        system.debug('before calling llm');
        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput = 
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(
                'Engagement_Summary', // Replace with your actual Prompt Template API Name
                executeTemplateInput
            );
        
        System.debug('after calling pt');
        if (generationsOutput != null && !generationsOutput.generations.isEmpty()) {
            
            ConnectApi.EinsteinLLMGenerationItemOutput response = generationsOutput.generations[0];
            String generatedText = response.text;
                         system.debug('output'+generatedText);

            
            Id newSummaryId = createEngagementSummary(recId, 'Prompt Template Invocation', generatedText);
            
           
            createAttachment(newSummaryId, 'Prompt Template Input', generatedText);
            
            wp.finalContent = 'New Engagement Summary created successfully.';
            
           System.debug('Resolved Prompt:'+newSummaryId);
        } else {
            throw new CustomException('No generations found in Prompt Template output.');
        }
    } catch (CustomException ce) {
        wp.finalContent = 'Custom Exception: ' + ce.getMessage();
    } catch (Exception ex) {
        wp.finalContent = 'General Exception: ' + ex.getMessage();
    }
    return wp;
}
    
    
            @TestVisible private static String extractJsonFromString(String input) {
            if (input == null) return null;
            
            // Find the start and end of the JSON object
            Integer startIndex = input.indexOf('{');
            Integer endIndex = input.lastIndexOf('}');
            
            if (startIndex >= 0 && endIndex > startIndex) {
                return input.substring(startIndex, endIndex + 1);
            }
            return null;
        }

    
    @TestVisible private static Id createEngagementSummary(String accId, String prompt, String response) {
            Engagement_Summary__c engagementSummary = new Engagement_Summary__c();
            
            engagementSummary.Company__c = accId; 
            engagementSummary.Summary__c = response;
            engagementSummary.Prompt__c = prompt;
            engagementSummary.Created_Date__c = System.now();
            
        String cleanJson = response
            .replace('```json', '')
            .replace('```', '')
            .trim();
        
        Map<String, Object> jsonData = (Map<String, Object>) JSON.deserializeUntyped(cleanJson);
           // Map<String, Object> jsonData = (Map<String, Object>) JSON.deserializeUntyped(response);
        
    
            if (jsonData.containsKey('Engagement_Channels_and_Performance__c')) {
            engagementSummary.Engagement_Channels_and_Performance__c = JSON.serialize(jsonData.get('Engagement_Channels_and_Performance__c'));
            }
            
            if (jsonData.containsKey('Contacts_Engaged__c')) {
                engagementSummary.Contacts_Engaged__c = JSON.serialize(jsonData.get('Contacts_Engaged__c'));
            }
            
            if (jsonData.containsKey('Preferred_Channels_by_Top_Contacts__c')) {
                engagementSummary.Preferred_Channels_by_Top_Contacts__c = JSON.serialize(jsonData.get('Preferred_Channels_by_Top_Contacts__c'));
            }
            
            if (jsonData.containsKey('Collective_Engagement_Insights__c')) {
                engagementSummary.Collective_Engagement_Insights__c = JSON.serialize(jsonData.get('Collective_Engagement_Insights__c'));
            }
            
            if (jsonData.containsKey('Key_Takeaways_and_Recommendations__c')) {
                engagementSummary.Key_Takeaways_and_Recommendations__c = JSON.serialize(jsonData.get('Key_Takeaways_and_Recommendations__c'));
            }
        
            
            insert AS USER engagementSummary;
            
            return engagementSummary.Id;
        }


    @TestVisible private static void createAttachment(String recordId, String prompt, String response) {
        
        //create attachment
        Attachment attachment = new Attachment();
        attachment.ParentId = recordId;
        attachment.Name = 'Engagement_Summary_' + System.now().format('yyyy-MM-dd_HH-mm-ss') + '.txt';
        attachment.Body = Blob.valueOf('Prompt:\n' + prompt + '\n\nResponse:\n' + response);
        attachment.ContentType = 'text/plain';
        insert AS USER attachment;
        }

        @AuraEnabled(cacheable=true)
  public static Account getAccountDetails(String accountId) {
        try {
            List<Account> accounts = [SELECT Id, Name FROM Account WHERE Id = :accountId LIMIT 1];
            if (accounts.isEmpty()) {
                return null; 
            }
            return accounts[0]; 
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving account details: ' + e.getMessage());
        }
    }
    
}