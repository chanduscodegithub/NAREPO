@isTest
private class ImportDataFromCSVTest {
    @testSetup static void createTestData() {
        List<Account> testAccRecords = new List<Account>();
        testAccRecords.add(new Account(Name='Test CM Account 1',Subtype__c ='National Accounts - East',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()));        
        testAccRecords.add(new Account(Name='Test CD Account 1',Subtype__c ='Prospect',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()));        
        testAccRecords.add(new Account(Name='Aetna',Subtype__c ='Competitor',Merit_Row_Id__c='AEUA-34X4X7',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Cigna',Subtype__c ='Competitor',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        testAccRecords.add(new Account(Name='National Accounts',Subtype__c ='Competitor',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));        
        insert testAccRecords;
        
        List<Competitor__c> competitorsList = new List<Competitor__c>();
        competitorsList.add(new Competitor__c(CompetitorAccount__c = testAccRecords[2].Id,
                                              Account__c = testAccRecords[0].Id,
                                              Type__c = 'Account Competitor',
                                              Competitorclassification__c = 'Other',
                                              NumberOfMembersHeld__c = 0,
                                              ofMembersHeld__c = 0,
                                              Comments__c = ''));
        insert competitorsList;        
    }
    
    public testMethod static void validateReadFromCSV(){
        Id accId = [Select Id from Account where Name='Test CM Account 1'].Id;
        String competitveData = 'ST Account ID,401(k) Administrator - Carrier for UHC Population,Behavioral Health - Carrier for UHC Population,Benefit Administration - Carrier for UHC Population,Banking - Carrier for UHC Population,Care Management - Carrier for UHC Population,Data Aggregator - Carrier for UHC Population,Disability - Carrier for UHC Population,Disease Management - Carrier for UHC Population,EAP - Carrier for UHC Population,FSA - Carrier for UHC Population,Health Risk Assessment - Carrier for UHC Population,Onsite Clinics - Carrier for UHC Population,Rewards Program - Carrier for UHC Population,Stop Loss - Carrier for UHC Population,Telehealth - Carrier for UHC Population,Transparency - Carrier for UHC Population,Web Portal - Carrier for UHC Population\n'+
            +accId+',#N/A,Do not migrate,#N/A,Do not migrate,Do not migrate,Do not migrate,#N/A,Do not migrate,Do not migrate,Do not migrate,Do not migrate,#N/A,#N/A,Do not migrate,#N/A,#N/A,Do not migrate\n'+
            +accId+',AEUA-34X4X7,AEUA-34X4X7,AEUA-34X4X7,AEUA-34X4X7,Do not migrate,AEUA-34X4X7,AEUA-34X4X7,AEUA-34X4X7,AEUA-34X4X7,AEUA-34X4X7,AEUA-34X4X7,AEUA-34X4X7,AEUA-34X4X7,AEUA-34X4X7,Do not migrate,AEUA-34X4X7,AEUA-34X4X7';
        Blob myBlob1 = Blob.valueof(competitveData);
        Integer size1 = myBlob1.size();
        importDataFromCSVController impData1 = new importDataFromCSVController();
        impData1.csvFileBody = myBlob1;
        impData1.readFromFile();
    }
}