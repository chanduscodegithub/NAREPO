@isTest
public class CompetitorDentalVisionCDTotalTestBatch {

    static testmethod void cmDentalVisionCDBatchTestMethod(){
    	List<Account> accList = new List<Account>();
        accList.add(new Account(Name='TestAccount11',Subtype__c ='Prospect',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()));        
        accList.add(new Account(Name='Aetna',Subtype__c ='Competitor', RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        accList.add(new Account(Name='Total',Subtype__c ='Competitor', RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        accList.add(new Account(Name='TestAccount12',Subtype__c ='Prospect',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()));
        insert accList;
        
        List<Competitor__c> competitorList = new List<Competitor__c>();
        competitorList.add(new Competitor__c(Name='Test Dental Comp',Account__c=accList[0].Id,CompetitorAccount__c=accList[1].Id, Type__c='Account Competitor',Competitorclassification__c='Dental',NumberOfMembersHeld__c=10,Comments__c = ''));
        competitorList.add(new Competitor__c(Name='Test Vision Comp',Account__c=accList[0].Id, CompetitorAccount__c=accList[1].Id,Type__c='Account Competitor',Competitorclassification__c='Vision',NumberOfMembersHeld__c=20,Comments__c = ''));
        competitorList.add(new Competitor__c(Name='Dental Comp1',Account__c=accList[3].Id,CompetitorAccount__c=accList[1].Id, Type__c='Account Competitor',Competitorclassification__c='Dental',NumberOfMembersHeld__c=20,Comments__c = ''));
        competitorList.add(new Competitor__c(Name='Vision Comp1',Account__c=accList[3].Id,CompetitorAccount__c=accList[1].Id, Type__c='Account Competitor',Competitorclassification__c='Vision',NumberOfMembersHeld__c=20,Comments__c = ''));
        competitorList.add(new Competitor__c(Name='Total Dental Comp',Account__c=accList[3].Id,CompetitorAccount__c=accList[2].Id, Type__c='Account Competitor',Competitorclassification__c='Dental',NumberOfMembersHeld__c=0,Comments__c = ''));
        competitorList.add(new Competitor__c(Name='Total Vision Comp',Account__c=accList[3].Id, CompetitorAccount__c=accList[2].Id,Type__c='Account Competitor',Competitorclassification__c='Vision',NumberOfMembersHeld__c=0,Comments__c = ''));
        insert competitorList;
        
        Test.startTest();
        CompetitorDentalVisionCDTotalBatch compDenVisCdTotalBatch = new CompetitorDentalVisionCDTotalBatch();
        Database.executeBatch(compDenVisCdTotalBatch);
        Test.stopTest();
    }
}