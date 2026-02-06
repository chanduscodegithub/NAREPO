@isTest
public class CompetitiveLandscapeOthersTestClass {

    @testSetup static void createTestData() { 
    
        List<Account> testAccRecords = new List<Account>();
        testAccRecords.add(new Account(Name='Test CM Account 1',Subtype__c ='Specialty Benefits Only',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Test CM Account 2',Subtype__c ='Specialty Benefits Only',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Test CD Account 1',Subtype__c ='Prospect',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Test Agg Account 1',Subtype__c ='Business Group on Health (BGH)',
                                       RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Aetna',Subtype__c ='Competitor',
                           RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Cigna',Subtype__c ='Competitor',
                           RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Blue',Subtype__c ='Competitor',
                           RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        
        insert testAccRecords;
        
    }
         
    static testMethod void validateLoggedInUserRecords() { 
        
        Account accountObj = [SELECT Id,Name FROM Account WHERE Name='Test CM Account 1' LIMIT 1];
        Test.startTest();
        CompetitiveLandscape_OthersClass.getLoggedInUerRoleInfo(accountObj.Id);
        try {
            CompetitiveLandscape_OthersClass.getLoggedInUerRoleInfo(null);
        } catch(Exception e) {
            System.debug('Exception occurred in CompetitiveLandscapeOthersTestClass in validateLoggedInUserRecords method - '+e);
        }
        Test.stopTest();
    
    }
    
    static testMethod void validateOtherMethods() {
        
        Account accountCMObj = [SELECT Id,Name FROM Account WHERE Name='Test CM Account 1' LIMIT 1];
        Account accountCMObj1 = [SELECT Id,Name FROM Account WHERE Name='Test CM Account 2' LIMIT 1];
        Account accountCDObj = [SELECT Id,Name FROM Account WHERE Name='Test CD Account 1' LIMIT 1];
        Account accountAggObj = [SELECT Id,Name FROM Account WHERE Name='Test Agg Account 1' LIMIT 1];
        
        Account accNA = new Account();
        accNA.Name = 'National Accounts';
        accNA.Subtype__c ='Competitor';
        accNA.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert accNA;
        
        Account totalAcc = new Account();
        totalAcc.Name = 'Total';
        totalAcc.Subtype__c ='Competitor';
        totalAcc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert totalAcc;
        
        Account[] accCmptrs = [Select Id, Name from Account where Subtype__c='Competitor'];
        Id aetnaCmptrId;
        Id cignaCmptrId;
        Id blueCmptrId;
        if(accCmptrs != null && accCmptrs.size() > 0) {
            for(Account accObj : accCmptrs) {
                if(accObj != null && accObj.Name == 'Aetna') {
                    aetnaCmptrId = accObj.Id;
                } else if(accObj != null && accObj.Name == 'Cigna') {
                    cignaCmptrId = accObj.Id;
                } else if(accObj != null && accObj.Name == 'Blue') {
                    blueCmptrId = accObj.Id;
                }
            }
        }
            
        Test.startTest();

        List<Competitor__c> allCompetitorsList = new List<Competitor__c>();
        
        CompetitiveLandscape_OthersClass.getAccountType(accountCMObj.Id);
                
        List<Competitor__c> competitorsList = new List<Competitor__c>();
        competitorsList.add(returnCompetitorObjData(accountCMObj.Id, aetnaCmptrId, 'Pharmacy', 10, 100));       
        competitorsList.add(returnCompetitorObjData(accountCMObj.Id, aetnaCmptrId, 'Dental', 10, 50));
        competitorsList.add(returnCompetitorObjData(accountCMObj.Id, blueCmptrId, 'Dental', 10, 50));
        competitorsList.add(returnCompetitorObjData(accountCMObj.Id, aetnaCmptrId, 'Vision', 0, 0));
        competitorsList.add(returnCompetitorObjData(accountCMObj.Id, aetnaCmptrId, 'Other', 0, 0));
        competitorsList.add(returnCompetitorObjData(accountCDObj.Id, aetnaCmptrId, 'Pharmacy', 10, 100));
        competitorsList.add(returnCompetitorObjData(accountCDObj.Id, aetnaCmptrId, 'Dental', 10, 100));
        competitorsList.add(returnCompetitorObjData(accountCDObj.Id, aetnaCmptrId, 'Vision', 10, 100));
        competitorsList.add(returnCompetitorObjData(accountCDObj.Id, aetnaCmptrId, 'Other', 0, 0));
        competitorsList.add(new Competitor__c(Account__c = accountCDObj.Id, CompetitorAccount__c = aetnaCmptrId, Competitorclassification__c = 'Medical',
											  ParticipatingO65Retirees__c = 0, ParticipatingPartTimeActives__c = 0, MembershipEstimate__c = 10, 
                                              Type__c = 'Account Competitor', ParticipatingNonBargainedFullTimeAc__c = 0, ParticipatingBargainedFullTimeActive__c = 0,
											  ParticipatingU65Retirees__c = 0,  ParticipatingMembers__c = 0, ParticipatingActives__c = 0));
        insert competitorsList;
        
        List<Competitor__c> totalCompetitorsList = new List<Competitor__c>();
        totalCompetitorsList.add(returnCompetitorObjData(accountCMObj.Id, null, 'Pharmacy', 10, 100));
        totalCompetitorsList.add(returnCompetitorObjData(accountCMObj.Id, null, 'Dental', 20, 100));
        totalCompetitorsList.add(returnCompetitorObjData(accountCMObj.Id, null, 'Vision', 0, 0));
        totalCompetitorsList.add(returnCompetitorObjData(accountCDObj.Id, null, 'Pharmacy', 10, 0));
        totalCompetitorsList.add(returnCompetitorObjData(accountCDObj.Id, null, 'Dental', 10, 0));
        totalCompetitorsList.add(returnCompetitorObjData(accountCDObj.Id, null, 'Vision', 10, 0));
        insert totalCompetitorsList;
        
        CompetitiveLandscape_OthersClass.getAccountCompetitorRecords(accountCMObj.Id, 'Client Management', '', true);
        CompetitiveLandscape_OthersClass.getAccountCompetitorRecords(accountCMObj.Id, 'Client Management', 'UpsertOperation', true);
        CompetitiveLandscape_OthersClass.getAccountCompetitorRecords(accountCMObj.Id, 'Client Management', 'DeleteOperation', true);
        CompetitiveLandscape_OthersClass.getAccountCompetitorRecords(accountCDObj.Id, 'Client Development', '', true);      
        CompetitiveLandscape_OthersClass.getAccountCompetitorRecords(accountAggObj.Id, 'Aggregator', '', true);
        CompetitiveLandscape_OthersClass.CompetitorDataExportWrapper dataExport = CompetitiveLandscape_OthersClass.getTemplateInXML(accountCMObj.Id,'Client Management');
        
        Competitor__c compObj = returnCompetitorObjData(accountCMObj.Id, aetnaCmptrId, 'Pharmacy', 10, 25);
        compObj.Id = competitorsList[0].Id;
        allCompetitorsList.add(compObj);
        allCompetitorsList.add(returnCompetitorObjData(accountCMObj.Id, cignaCmptrId, 'Pharmacy', 10, 25));
        allCompetitorsList.add(returnCompetitorObjData(accountCMObj.Id, blueCmptrId, 'Pharmacy', 20, 50));        
        allCompetitorsList.add(returnCompetitorObjData(accountCMObj.Id, cignaCmptrId, 'Dental', 10, 100));
        allCompetitorsList.add(returnCompetitorObjData(accountCMObj.Id, cignaCmptrId, 'Vision', 0, 0));
        allCompetitorsList.add(returnCompetitorObjData(accountCMObj.Id, cignaCmptrId, 'Other', 0, 0));
        
        CompetitiveLandscape_OthersClass.upsertAccountCompetitorRecords('Carve In', 'ASO', 'FI', allCompetitorsList, accountCMObj.Id, new List<Competitor__c>());        
        
        List<Competitor__c> pharmacyCmptrsList1 = new List<Competitor__c>();
        pharmacyCmptrsList1.add(competitorsList[0]);
        allCompetitorsList.remove(0);
        
        CompetitiveLandscape_OthersClass.upsertAccountCompetitorRecords('Carve In', 'ASO', 'FI', allCompetitorsList, accountCMObj.Id, pharmacyCmptrsList1);
        
        List<Competitor__c> pharmacyCmptrsList = new List<Competitor__c>();
        pharmacyCmptrsList.add(competitorsList[1]);
        allCompetitorsList.remove(0);
        
        CompetitiveLandscape_OthersClass.deleteAccountCompetitorRecord('Client Management', pharmacyCmptrsList, allCompetitorsList, totalCompetitorsList[0]);
        
        try {
            CompetitiveLandscape_OthersClass.getAccountCompetitorRecords('1234', 'Client Management', '', true);
        } catch(Exception e) {
            System.debug('Exception occurred in CompetitiveLandscapeOthersTestClass in validateOtherMethods method - '+e);
        }
        
        try {
            CompetitiveLandscape_OthersClass.getAccountCompetitorRecords(accountAggObj.Id, 'Client Development', null, false);
        } catch(Exception e) {
            System.debug('Exception occurred in CompetitiveLandscapeOthersTestClass in validateOtherMethods method - '+e);
        }
        Test.stopTest();
        
    }
    
    public static Competitor__c returnCompetitorObjData(Id accId, String compId, String compClassification, Integer noOfMemHeld, Integer OfMemHeld) {
        
		Competitor__c compObj = new Competitor__c(CompetitorAccount__c = compId,
                                                  Account__c = accId,
                                                  Type__c = 'Account Competitor',
                                                  Competitorclassification__c = compClassification,
                                                  NumberOfMembersHeld__c = noOfMemHeld,
                                                  ofMembersHeld__c = OfMemHeld,
                                                  Comments__c = '');
            
        return compObj;
    }
    
    static testMethod void validateAppPopUpData() {
        
        Account accountCMObj = [SELECT Id,Name FROM Account WHERE Name='Test CM Account 1' LIMIT 1];
        Account accCmptr = [Select Id from Account where Name='Aetna'];
        
        CompetitiveLandscapeAddPopUpClass.getAccountCompetitors('Top Competitors', 'Test', 1, false);
        CompetitiveLandscapeAddPopUpClass.getAccountCompetitors('The Blues and their Affiliates', 'Test', 1, false);
        CompetitiveLandscapeAddPopUpClass.getAccountCompetitors('Exchange Competitors', 'Test', 1, false);
        CompetitiveLandscapeAddPopUpClass.getAccountCompetitors('All Other Competitors', 'Test', 1, true);
        
        List<Competitor__c> allPharmacySpecialtyOtherscompetitorsList = new List<Competitor__c>();
        allPharmacySpecialtyOtherscompetitorsList.add(returnCompetitorObjData(accountCMObj.Id, accCmptr.Id, 'Pharmacy', 0, 0));
        
        CompetitiveLandscapeAddPopUpClass.addPharmacySpecialtyOtherCompetitorsToAccount(accountCMObj.Id, allPharmacySpecialtyOtherscompetitorsList);
        
        List<Account> accList = new List<Account>();
        accList.add(new Account(Id=accCmptr.Id));
        CompetitiveLandscapeAddPopUpClass.addCompititorsToAccount(accountCMObj.Id, accList);
        
        try {
            CompetitiveLandscapeAddPopUpClass.getAccountCompetitors('Top Competitors', 'Test', null, false);
        } catch(Exception e) { 
            System.debug('Exception occurred in validateAppPopUpData for getAccountCompetitors - '+e);
        }
        try {
            CompetitiveLandscapeAddPopUpClass.getAccountCompetitors('Top Competitors', 'Test', 20000, false);
        } catch(Exception e) { 
            System.debug('Exception occurred in validateAppPopUpData for getAccountCompetitors - '+e);
        }
        try {
            CompetitiveLandscapeAddPopUpClass.addPharmacySpecialtyOtherCompetitorsToAccount(accountCMObj.Id, new List<Competitor__c>());
        } catch(Exception e) { 
            System.debug('Exception occurred in validateAppPopUpData for addPharmacySpecialtyOtherCompetitorsToAccount - '+e);
        }
        try {
            CompetitiveLandscapeAddPopUpClass.addPharmacySpecialtyOtherCompetitorsToAccount(null, new List<Competitor__c>());
        } catch(Exception e) { 
            System.debug('Exception occurred in validateAppPopUpData for addPharmacySpecialtyOtherCompetitorsToAccount - '+e);
        }
        try {
            List<Competitor__c> cmptrsList1 = new List<Competitor__c>();
        	cmptrsList1.add(returnCompetitorObjData(accountCMObj.Id, accCmptr.Id, 'Pharmacy1', 0, 0));
            CompetitiveLandscapeAddPopUpClass.addPharmacySpecialtyOtherCompetitorsToAccount(accountCMObj.Id, cmptrsList1);
        } catch(Exception e) { 
            System.debug('Exception occurred in validateAppPopUpData for addPharmacySpecialtyOtherCompetitorsToAccount - '+e);
        }
        try {
            List<Account> accList1 = new List<Account>();
            accList1.add(new Account(Name='Test Acc'));
            CompetitiveLandscapeAddPopUpClass.addCompititorsToAccount(accountCMObj.Id, accList1);
        } catch(Exception e) { 
            System.debug('Exception occurred in validateAppPopUpData for addCompititorsToAccount - '+e);
        }
        try {
            CompetitiveLandscapeAddPopUpClass.addCompititorsToAccount(null, new List<Account>());
        } catch(Exception e) { 
            System.debug('Exception occurred in validateAppPopUpData for addCompititorsToAccount - '+e);
        }
        try {
            CompetitiveLandscapeAddPopUpClass.addCompititorsToAccount(accountCMObj.Id, null);
        } catch(Exception e) { 
            System.debug('Exception occurred in validateAppPopUpData for addCompititorsToAccount - '+e);
        }
    }
    
    /*
     * The below method validates for the No Access Exception.
     */
    public testMethod static void validateMethodsForReadOnlyUser() {
        
        User readOnlyUser = new User(
            LastName = 'LIVE1',
            FirstName='JASON2',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDev1@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            Position__c='Test User',
            LocaleSidKey = 'en_US');
        
        insert readOnlyUser;
        
        Account account = [SELECT Id FROM Account WHERE Name='Test CM Account 1' LIMIT 1];
		Id accountId = account.Id;
        List<Competitor__c> pharmacyCmptrsList1 = [SELECT CompetitorAccount__r.Name,CompetitorAccount__c,NumberOfMembersHeld__c,ofMembersHeld__c,Comments__c,BusinessModelforPharmacy__c,FundingType__c,Competitorclassification__c,PrimaryIncumbent__c,SecondaryIncumbent__c,AssociatedMedicalCarrier__c,TypesofOtherProductsServicesProvide__c FROM Competitor__c where Account__c=:accountId and Type__c='Account Competitor' ORDER BY CreatedDate Asc];
        Account accCmptr = [Select Id from Account where Name='Aetna'];
        
        Test.startTest();
            System.runAs(readOnlyUser) {
                try {
                    CompetitiveLandscape_OthersClass.getAccountType(account.Id);
                } catch(Exception e) { 
                    System.debug('Exception occurred in validateMethodsForReadOnlyUser - '+e);
                }
                try {
                    CompetitiveLandscape_OthersClass.getAccountCompetitorRecords(account.Id, 'Client Management', '', true);
                } catch(Exception e) { 
                    System.debug('Exception occurred in validateMethodsForReadOnlyUser for getAccountCompetitorRecords - '+e);
                }
                try {
                    
                    List<Competitor__c> pharmacyCmptrsList = new List<Competitor__c>();
                    pharmacyCmptrsList.add(new Competitor__c(CompetitorAccount__c = accCmptr.Id,Account__c = account.Id, Type__c = 'Account Competitor',
                                                             Competitorclassification__c = 'Pharmacy', NumberOfMembersHeld__c = 10, ofMembersHeld__c = 50, Comments__c = ''));
                    CompetitiveLandscape_OthersClass.upsertAccountCompetitorRecords('Carve In', '', '', pharmacyCmptrsList, account.Id, new List<Competitor__c>());
                } catch(Exception e) { 
                    System.debug('Exception occurred in validateMethodsForReadOnlyUser for upsertAccountCompetitorRecords - '+e);
                }
                try {
                    CompetitiveLandscape_OthersClass.deleteAccountCompetitorRecord('Client Management', pharmacyCmptrsList1, new List<Competitor__c>(), new Competitor__c());
                } catch(Exception e) { 
                    System.debug('Exception occurred in validateMethodsForReadOnlyUser for deleteAccountCompetitorRecord - '+e);
                }
                try {
                    CompetitiveLandscapeAddPopUpClass.getAccountCompetitors('Top Competitors', 'Test', 1, false);
                } catch(Exception e) { 
                    System.debug('Exception occurred in validateMethodsForReadOnlyUser for getAccountCompetitors - '+e);
                }
                try {
                    CompetitiveLandscapeAddPopUpClass.addPharmacySpecialtyOtherCompetitorsToAccount(account.Id, pharmacyCmptrsList1);
                } catch(Exception e) { 
                    System.debug('Exception occurred in validateMethodsForReadOnlyUser for addPharmacySpecialtyOtherCompetitorsToAccount - '+e);
                }
                try {
                    List<Account> accList = new List<Account>();
                    accList.add(new Account(Id=accCmptr.Id));
                    CompetitiveLandscapeAddPopUpClass.addCompititorsToAccount(account.Id, accList);
                } catch(Exception e) {
                    System.debug('Exception occurred in validateMethodsForReadOnlyUser for addCompititorsToAccount - '+e);
                }
            }
        Test.stopTest();
        
    }
}