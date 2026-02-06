@isTest
private class CompetitorCdTotalBatchTest {
    
    @testSetup static void createTestData() {
        Account accTotal = new Account();
        accTotal.Name = 'Total';
        accTotal.Subtype__c ='Prospect';
        accTotal.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accTotal;
        
        Account accNA = new Account();
        accNA.Name = 'National Accounts';
        accNA.Subtype__c ='Prospect';
        accNA.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accNA;
        
        Account accCD = new Account();
        accCD.Name = 'Competitive Medical CD';
        accCD.Subtype__c ='Prospect';
        accCD.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCD;
        
        Account accCD1 = new Account();
        accCD1.Name = 'Competitive Medical CD1';
        accCD1.Subtype__c ='Prospect';
        accCD1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCD1;
        
        Account accCM = new Account();
        accCM.Name = 'Competitive Medical CM';
        accCM.Subtype__c ='Specialty Benefits Only';
        accCM.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM; 
        
        Account accCM1 = new Account();
        accCM1.Name = 'Competitive Medical CM1';
        accCM1.Subtype__c ='Specialty Benefits Only';
        accCM1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM1; 
        
        Account accCM_No_Child = new Account();
        accCM_No_Child.Name = 'Competitive Medical CM No Child';
        accCM_No_Child.Subtype__c ='Specialty Benefits Only';
        accCM_No_Child.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM_No_Child;
        
        Account accCD_No_Child = new Account();
        accCD_No_Child.Name = 'Competitive Medical CD No Child';
        accCD_No_Child.Subtype__c ='Prospect';
        accCD_No_Child.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCD_No_Child;
        
        List<Competitor__c> competitiveMedCDRecords = new List<Competitor__c>();
               
        competitiveMedCDRecords.add(new Competitor__c(           
            Account__c = accCD.Id,
            CompetitorAccount__c = accCD_No_Child.Id,      
            Competitorclassification__c = 'Medical',
            ParticipatingO65Retirees__c = 0,
            ParticipatingPartTimeActives__c = 0,
            MembershipEstimate__c = 10,
            Type__c = 'Account Competitor',
            ParticipatingNonBargainedFullTimeAc__c = 0,
            ParticipatingBargainedFullTimeActive__c = 0,
            ParticipatingU65Retirees__c = 0,
            ParticipatingMembers__c = 0,
            ParticipatingActives__c = 0,
        	PrimaryIncumbent__c = true,
        	SecondaryIncumbent__c = false));
        
        competitiveMedCDRecords.add(new Competitor__c(           
            Account__c = accCM.Id,
            CompetitorAccount__c = accCM_No_Child.Id,      
            Competitorclassification__c = 'Medical',
            ParticipatingO65Retirees__c = 0,
            ParticipatingPartTimeActives__c = 0,
            MembershipEstimate__c = 10,
            Type__c = 'Account Competitor',
            ParticipatingNonBargainedFullTimeAc__c = 0,
            ParticipatingBargainedFullTimeActive__c = 0,
            ParticipatingU65Retirees__c = 0,
            ParticipatingMembers__c = 0,
            ParticipatingActives__c = 0,
        	PrimaryIncumbent__c = true,
        	SecondaryIncumbent__c = false));
        insert competitiveMedCDRecords;
    }
    
    public testMethod static void validateTotalBatch(){
        Test.startTest();
        CompetitorCdTotalBatch comTotal = new CompetitorCdTotalBatch();
        Id batchId = Database.executeBatch(comTotal);
        Test.stopTest();
        // after the testing stops, assert records were updated properly
        //System.assertEquals(10, [select count() from contact where MailingCity = 'New York']);
    }
}