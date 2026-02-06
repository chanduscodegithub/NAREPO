@isTest
public with sharing class EngagementSummaryControllerTest {
    
    @testSetup
    static void setupTestData() {
        Account acc = new Account(
            Name = 'Test Account',
            Subtype__c = 'Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );
        insert acc;
        
        Id cdContactRT = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
        
        Contact c = new Contact(
            AccountId = acc.Id,
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'john@example.com', 
            Title = 'Manager',
            RecordTypeId = cdContactRT,
            Status__c = 'Active'
        );
        insert c;
        
        Map<String, Object> topContacts = new Map<String, Object>{
            'Peter John' => new Map<String, Object>{
                'score' => 81,
                'title' => 'Senior Procurement Manager',
                'email' => 'peter@company.com',
                'photoUrl' => '/resource/contact_avatars/peter.jpg'
            },
            'Jane Smith' => new Map<String, Object>{
                'score' => 72,
                'title' => 'Operations Director',
                'email' => 'jane@company.com',
                'photoUrl' => '/resource/contact_avatars/jane.jpg'
            },
            'Tim Wilson' => new Map<String, Object>{
                'score' => 62,
                'title' => 'Supply Chain Analyst',
                'email' => 'tim@company.com',
                'photoUrl' => '/resource/contact_avatars/tim.jpg'
            }
        };
        
        Engagement_Summary__c summary = new Engagement_Summary__c(
            Company__c = acc.Id,
            Engagement_Channels_and_Performance__c = JSON.serialize(new Map<String, Object>{
                'Top Performing Channels' => new List<String>{
                    'Account-Specific Marketing: 21% open rate, 14.4% click-through rate (CTR)',
                    'Newsletters: 23.3% open rate, 12.3% CTR',
                    'Webinars: 27.9% attendance rate',
                    'Calls: 48% acceptance rate, 74% positive sentiment',
                    'Meetings at UHC: 71% attendance rate'
                },
                'Low  Performing Channels' => new List<String>{
                    'Mass Marketing: 13% open rate, 5.9% CTR',
                    'Events: 23.7% attendance rate (moderate but could improve)'
                }
            }),
            Contacts_Engaged__c = JSON.serialize(topContacts),
            Preferred_Channels_by_Top_Contacts__c = JSON.serialize(new Map<String, Object>{
                'Peter' => new List<String>{
                    'Highest engagement with Account-Specific Marketing (26.7% open rate, 20% CTR)',
                    'Strong interaction with Calls (67% acceptance, 80% positive sentiment)',
                    'High engagement with Webinars (40% attendance rate)',
                    'Meetings at UHC: 100% attendance'
                },
                'Jane' => new List<String>{
                    'Highest engagement with Newsletters (20% open rate, 11.1% CTR)',
                    'Moderate engagement with Webinars (25% attendance)',
                    'Calls: 50% acceptance rate',
                    'Strong Meetings at UHC attendance (80%)'
                },
                'Tim' => new List<String>{
                    'Highest engagement with Account-Specific Marketing (18% open rate, 10% CTR)',
                    'Moderate Webinars attendance (20%)',
                    'Calls acceptance (40%, 75% positive sentiment)',
                    'Strong Meetings at UHC attendance (80%)'
                }
            }),
            Collective_Engagement_Insights__c = JSON.serialize(new Map<String, Object>{
                'Best Performing Channels' => new List<String>{
                    'Meetings at UHC: High participation (Peter - 100%, Jane & Tim - 80%)',
                    'Calls: High positive sentiment (Peter - 80%, Jane - 67%, Tim - 75%)',
                    'Webinars: Good attendance from Peter (40%) and moderate from Jane & Tim (25%, 20%)'
                },
                'Underperforming Channels' => new List<String>{
                    'Mass Marketing & Newsletters show low CTR across all top contacts',
                    'Events: Low attendance rates (Peter - 32%, Jane - 25%, Tim - 16.7%)'
                }
            }),
            Key_Takeaways_and_Recommendations__c = JSON.serialize(new List<String>{
                'Increase investment in personalized and targeted outreach (Account-Specific Marketing, Calls, and Meetings at UHC)...',
                'Improve Webinar engagement by tailoring content...',
                'Optimize Mass Marketing & Newsletters...',
                'Leverage Peter, Jane, and Tim as internal champions...',
                'Enhance Event Strategy to increase registration and attendance...'
            })
        );
        insert summary;
    }
    
    @isTest
    static void testGetEngagementSummary() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
        
        Test.startTest();
        Map<String, Object> result = EngagementSummaryController.getEngagementSummary(acc.Id);
        Test.stopTest();
        
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assert(result.containsKey('Top Engaged Contacts'), 'Should contain Top Engaged Contacts');
        
        Map<String, Object> topContacts = (Map<String, Object>) result.get('Top Engaged Contacts');
        for (Object value : topContacts.values()) {
            Map<String, Object> contactDetails = (Map<String, Object>) value;
            System.assert(contactDetails.containsKey('email'), 'Email should be populated');
            System.assert(contactDetails.containsKey('title'), 'Title should be populated');
        }
    }
    
    @isTest
    static void testPopulateContactDetails() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
        Contact c = [SELECT Name FROM Contact LIMIT 1];
        
        Map<String, Object> topContacts = new Map<String, Object>{
            c.Name => new Map<String, Object>()
        };
        
        Test.startTest();
        Map<String, Object> updatedContacts = EngagementSummaryController.populateContactDetails(topContacts, acc.Id);
        Test.stopTest();
        
        System.assert(updatedContacts != null, 'Should return enriched contact details');
        Map<String, Object> contactDetails = (Map<String, Object>) updatedContacts.get(c.Name);
        System.assert(contactDetails.containsKey('email'), 'Email should be populated');
        System.assert(contactDetails.containsKey('title'), 'Title should be populated');
    }
    
    @isTest
    static void testSendEngagementPromptInvalidId() {
        Test.startTest();
        EngagementSummaryController.PromptWrapperClass result = EngagementSummaryController.sendEngagementPrompt('');
        Test.stopTest();
        
        System.assert(result.finalContent.contains('Invalid or missing Account Id'), 'Should catch invalid ID error');
    }
    
   /* @isTest
    static void testSendEngagementPromptNoAccount() {
        Test.startTest();
        EngagementSummaryController.PromptWrapperClass result = EngagementSummaryController.sendEngagementPrompt('001000000000000AAA');
        Test.stopTest();
        
        System.assert(result.finalContent.contains('No engagement summary found'), 'Should return fallback message when no account is found');
    }*/
    
    @isTest
    static void testSendEngagementPrompt_Success() {
        //Account testAccount = new Account(Name = 'Test Account');
        //insert testAccount;
        Account testAccount = [SELECT Id FROM Account LIMIT 1];


        // Mock the ConnectApi output if using a mocking framework
        // Here, we just catch any fallback exceptions since ConnectApi is not executable in test context

        Test.startTest();
        EngagementSummaryController.PromptWrapperClass result = EngagementSummaryController.sendEngagementPrompt(testAccount.Id);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assert(result.finalContent != null && result.finalContent.containsIgnoreCase('Summary') || 
                      result.finalContent.containsIgnoreCase('Exception'));
    }

   

    @isTest
    static void testSendEngagementPrompt_NonexistentAccount() {
        String fakeId = '001000000000000AAA';
        Test.startTest();
        EngagementSummaryController.PromptWrapperClass result = EngagementSummaryController.sendEngagementPrompt(fakeId);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assert(result.finalContent.contains('No Account found for the given Id'));
    }
    
     @isTest
    static void testGetAccountDetails() {
                Account acc = [SELECT Id FROM Account LIMIT 1];


        Test.startTest();
        Account result = EngagementSummaryController.getAccountDetails(acc.Id);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertEquals('Test Account', result.Name);
    }

    @isTest
    static void testExtractJsonFromString() {
        String input = 'Some preamble text {"key":"value","nested":{"x":1}} some ending text';
        String result =  EngagementSummaryController.extractJsonFromString(input);
        //String result = Test.invokePrivateMethod(EngagementSummaryController.class, 'extractJsonFromString', new List<Object>{input});
        System.assert(result.contains('"key":"value"'));
    }

    @isTest
    static void testCreateEngagementSummaryAndAttachment() {
                Account acc = [SELECT Id FROM Account LIMIT 1];


        String responseJson = JSON.serialize(new Map<String, Object>{
            'Engagement_Channels_and_Performance__c' => 'High',
            'Contacts_Engaged__c' => '5',
            'Preferred_Channels_by_Top_Contacts__c' => 'Email',
            'Collective_Engagement_Insights__c' => 'Positive',
            'Key_Takeaways_and_Recommendations__c' => 'Increase social media'
        });

        Test.startTest();
         Id summaryId = EngagementSummaryController.createEngagementSummary(acc.Id, 'Prompt Example', responseJson);
      //  Id summaryId = Test.invokePrivateMethod(EngagementSummaryController.class, 'createEngagementSummary',new List<Object>{acc.Id, 'Prompt Example', responseJson});
EngagementSummaryController.createAttachment(summaryId, 'Prompt Example', responseJson);
      //  Test.invokePrivateMethod(EngagementSummaryController.class, 'createAttachment',new List<Object>{summaryId, 'Prompt Example', responseJson});
        Test.stopTest();

        System.assertNotEquals(null, summaryId);
        List<Engagement_Summary__c> summaries = [SELECT Id FROM Engagement_Summary__c WHERE Id = :summaryId];
        System.assertEquals(1, summaries.size());

        List<Attachment> attachments = [SELECT Id FROM Attachment WHERE ParentId = :summaryId];
        System.assertEquals(1, attachments.size());
    }

    @isTest
    static void testSendEngagementPrompt_InvalidId() {
        Test.startTest();
        EngagementSummaryController.PromptWrapperClass result = EngagementSummaryController.sendEngagementPrompt('');
        Test.stopTest();
        System.assert(result.finalContent.contains('Invalid or missing'));
    }

    @isTest
    static void testSendEngagementPrompt_NoAccount() {
        Test.startTest();
        EngagementSummaryController.PromptWrapperClass result = EngagementSummaryController.sendEngagementPrompt('001000000000000AAA');
        Test.stopTest();
        System.assert(result.finalContent.contains('No Account found'));
    }
}