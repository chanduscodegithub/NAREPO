@isTest
public class createCorrespondenceMemberTest {

    @testSetup static void createTestData() {
		//Account and Contact insertion
		Account accInsert = new Account(Name = 'Insert Correspodence Account', RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(), Subtype__c = 'CVG');
        insert accInsert;
        System.debug('Record inserted and its ID '+accInsert.Id);
        Contact conInsert = new Contact(FirstName = 'Insert Contact', LastName = 'for Correspondence', AccountId = accInsert.Id, Correspondence_Type__c='Customer Survey - Primary' ,Survey_Type__c='Online' ,RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId());
        insert conInsert;
        //List to insert Correspondence Records
        List<Campaign> correspondenceRecords = new List<Campaign>();
        Campaign createCorrespondence = new Campaign(Name = 'Insert Correspondence', StartDate = Date.newInstance(2020, 07, 19), Correspondence_Type__c = 'Customer Survey - Primary', Survey_Type_MultiSelect__c = 'Online');
        Campaign createCorrespondence1 = new Campaign(Name = 'Insert Correspondence 2', StartDate = Date.newInstance(2020, 07, 19), Correspondence_Type__c = 'Customer Survey - Secondary', Survey_Type_MultiSelect__c = 'Paper');
        Campaign createCorrespondence2 = new Campaign(Name = 'Insert Correspondence 3', StartDate = Date.newInstance(2020, 07, 19), Correspondence_Type__c = 'CD Holiday', Survey_Type_MultiSelect__c = 'Paper');
        correspondenceRecords.add(createCorrespondence);
        correspondenceRecords.add(createCorrespondence1);
        correspondenceRecords.add(createCorrespondence2);
        insert correspondenceRecords;
        
        List<CampaignMember> correspondenceMembers = new List<CampaignMember>();
        CampaignMember campaignMember1 = new CampaignMember(CampaignId = correspondenceRecords[0].Id, ContactId = conInsert.Id);
        insert campaignMember1;
    }
    
    static testMethod void validateCreateCorrespondenceMembers() {
        Campaign campaignRecord = [SELECT Id, Name FROM Campaign WHERE Name = 'Insert Correspondence']; 
        Campaign campaignRecord2 = [SELECT Id, Name FROM Campaign WHERE Name = 'Insert Correspondence 3']; 
        System.Test.startTest();
        createCorrespondenceMember.createCorrespondenceRecords(campaignRecord.Id);
        createCorrespondenceMember.createCorrespondenceRecords(campaignRecord2.Id);
        System.Test.stopTest();
    }
}