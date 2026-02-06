@isTest
public class WorkItemsControllerTest {
    
    @isTest static void createTestData() {
         Id cmAdminId = [select Id, Name from UserRole where Name = 'CRM Administrator' limit 1].id;
         Id cmVpcrRvpId = [select Id, Name from UserRole where Name = 'CM VPCR/RVP' limit 1].id;
         Id cmSceId = [select Id, Name from UserRole where Name = 'CM SCE' limit 1].id;
         //Id sbSceId = [select Id, Name from UserRole where name = 'Specialty Benefits SCE' limit 1].id;
         //System.debug('cmSceId -- >'+cmSceId);
        
        Id userProfileId= [select Id, Name from Profile where Name = 'Standard User' limit 1].id;
        User emptyUser = new User();
        list<User> testUserRecords = new list<User>();
        testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@crmit.com', Username = 'test1.user1@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmAdminId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs1', Email = 'test2.user2@crmit.com', Username = 'test2.user2@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmVpcrRvpId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        testUserRecords.add(new user(LastName = 'Test3',FirstName='User3', Alias = 'tUs1', Email = 'test3.user3@crmit.com', Username = 'test3.user3@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmSceId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        /*testUserRecords.add(new user(LastName = 'Test4',FirstName='User4', Alias = 'tUs4', Email = 'test4.user4@crmit.com', Username = 'test4.user4@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = sbSceId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));*/
        insert testUserRecords;
        
        User testAdminUser = testUserRecords[0];
        User testCmVpcrUser = testUserRecords[1];
        User testCmSce = testUserRecords[2];
        //System.debug('testCmSce -->'+testCmSce);
        Test.startTest();
        System.runAs(testAdminUser) {
            Account cDAccEquity = new Account();
            cDAccEquity.Name = 'Equity Healthcare';
            cDAccEquity.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
            cDAccEquity.Subtype__c = 'Collaborative Ventures Group (CVG)';
            insert cDAccEquity;
            
            Account account = new Account();
            account.Name = 'Test CM Account1';
            account.Subtype__c ='Prospect';
            account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
            insert account;
            
     		List<Opportunity> emptyOppList = new List<Opportunity>();
            List<Opportunity> oppList = new List<Opportunity>();
            Opportunity opp = new Opportunity();
            opp.Name = 'Test Opportunity1'; 
            opp.AccountId = account.Id;
            opp.Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP';
            opp.EffectiveDate__c = System.Today();
            opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
            opp.Product_Type_Involved_in_Opp__c = 'Medical';
            opp.CloseDate = System.Today();
            opp.StageName = 'Qualification';
            opp.Expected_Date_of_RFP__c = System.Today(); 
            opp.CM_VPCR_RVP__c = testAdminUser.Id;
            opp.Comments_Last_Modified__c = System.now();
            opp.Comments__c = '';
            opp.OwnerId = testAdminUser.Id;
            opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
            oppList.add(opp);
            insert oppList;
            oppList[0].Comments_Last_Modified__c = System.now().addDays(2);
            update oppList;
            system.debug('***opp***'+opp);
            //system.debug('***opp***'+opp.Owner.FirstName+ opp.CM_VPCR_RVP__r.FirstName);
            system.debug('***account***'+account);
            workItemsController.getOpty();
            workItemsController.updateOppRecods(emptyOppList);
            workItemsController.updateOppRecods(oppList);            
            workItemsController.getUserRole(testAdminUser.Id);
            workItemsController.getUserRole(emptyUser.Id);
            workItemsController.getAccountsandOpportunities(True, False, 'All', 'All', 'Name', 'ASC');
            workItemsController.getAccountsandOpportunities(False, True, 'All', 'All', 'Name', 'ASC');
            workItemsController.getAccountsandOpportunities(False, True, 'All', 'a', 'Name', 'ASC');
            workItemsController.getAccountsandOpportunities(False, True, '', '', 'Name', 'ASC');
            workItemsController.getAccountsandOpportunities(False, True, 'a', 'All', 'Name', 'ASC');
            workItemsController.getAccountsandOpportunities(False, True, 'a', 'a', 'Name', 'ASC');  
            
            //Insert Account and related Contacts
           Account accInsert = new Account(Name = 'Test CM Accounts', RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(), Subtype__c = 'National Accounts - East', CMVPCRRVP__c = testAdminUser.Id);
           insert accInsert;
            
            System.debug('Record inserted and its ID '+accInsert.CMVPCRRVP__c+' \n testCmVpcrUser.Id '+testCmVpcrUser.Id);
            List<Contact> insertContacts = new List<Contact>();
            Contact conInsert1 = new Contact(FirstName = 'Insert workItemsContact1', LastName = '1', AccountId = accInsert.Id, Correspondence_Type__c='Customer Survey - Secondary', Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId());
            Contact conInsert2 = new Contact(FirstName = 'Insert workItemsContact', LastName = '2', AccountId = accInsert.Id, Correspondence_Type__c='Customer Survey - Primary', Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId());
            Contact conInsert3 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            Contact conInsert4 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=true, Correspondence_Type__c= 'Customer Survey - Secondary;Customer Survey - Primary;CD Holiday', RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            Contact conInsert5 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=true, Correspondence_Type__c= 'Customer Survey - Secondary;Customer Survey - Primary', RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            insertContacts.add(conInsert1);
            insertContacts.add(conInsert2);
            insertContacts.add(conInsert3);
            insertContacts.add(conInsert5);
            insert insertContacts;
            
            try {
                insert conInsert4;
            } catch(Exception e) {
                System.debug('Error occured while inserting the record '+e.getMessage());
            }
            
            workItemsController.searchedContacts('Inse', 'First Name','Begins With');
            //workItemsController.searchedContacts('Insert Contact', 'First Name','Equals To');
            //workItemsController.searchedContacts('Inse', 'First Name','Contains');
            //workItemsController.searchedContacts('1', 'Last Name','Begins With');
            //workItemsController.searchedContacts('1', 'Last Name','Equals To');
            //workItemsController.searchedContacts('2', 'Last Name','Contains');
            //workItemsController.searchedContacts('Insert workItemsContact1', 'Company','Begins With');
            //workItemsController.searchedContacts('Insert Correspodence Account', 'Company','Equals To');
            //workItemsController.searchedContacts('Insert Correspodence Accoun', 'Company','Contains');
            insertContacts[2].LastName = '';
            insertContacts[3].Correspondence_Type__c= 'Customer Survey - Secondary;CD Holiday';
            workItemsController.saveNpsContactData(insertContacts);
            //workItemsController.fetchDefaultContacts();
        }
        
        /*System.runAs(testCmVpcrUser) {
           workItemsController.getAccountsandOpportunities(True, False, 'All', 'All', 'Name', 'ASC');
           workItemsController.getAccountsandOpportunities(False, True, 'All', 'All', 'Name', 'ASC');           
           workItemsController.getAccountsandOpportunities(False, True, '', 'All', 'Name', 'ASC');
           workItemsController.searchedContacts('3', 'Last Name','Contains');
        }*/
        
        /*System.runAs(testCmSce) {
            workItemsController.getAccountsandOpportunities(True, False, 'All', 'All', 'Name', 'ASC');
        }*/       
        Test.stopTest();
    }
    
     @isTest static void createTestData1() {
         Id cmAdminId = [select Id, Name from UserRole where Name = 'CRM Administrator' limit 1].id;
         Id cmVpcrRvpId = [select Id, Name from UserRole where Name = 'CM VPCR/RVP' limit 1].id;
         Id cmSceId = [select Id, Name from UserRole where Name = 'CM SCE' limit 1].id;
         //Id sbSceId = [select Id, Name from UserRole where name = 'Specialty Benefits SCE' limit 1].id;
         //System.debug('cmSceId -- >'+cmSceId);
        
        Id userProfileId= [select Id, Name from Profile where Name = 'Standard User' limit 1].id;
        User emptyUser = new User();
        list<User> testUserRecords = new list<User>();
        testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@crmit.com', Username = 'test1.user1@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmAdminId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs1', Email = 'test2.user2@crmit.com', Username = 'test2.user2@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmVpcrRvpId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        testUserRecords.add(new user(LastName = 'Test3',FirstName='User3', Alias = 'tUs1', Email = 'test3.user3@crmit.com', Username = 'test3.user3@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmSceId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        /*testUserRecords.add(new user(LastName = 'Test4',FirstName='User4', Alias = 'tUs4', Email = 'test4.user4@crmit.com', Username = 'test4.user4@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = sbSceId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));*/
        insert testUserRecords;
        
        User testAdminUser = testUserRecords[0];
        User testCmVpcrUser = testUserRecords[1];
        User testCmSce = testUserRecords[2];
        //System.debug('testCmSce -->'+testCmSce);
        Test.startTest();
        System.runAs(testAdminUser) {
            Account cDAccEquity = new Account();
            cDAccEquity.Name = 'Equity Healthcare';
            cDAccEquity.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
            cDAccEquity.Subtype__c = 'Collaborative Ventures Group (CVG)';
            insert cDAccEquity;
            
            Account account = new Account();
            account.Name = 'Test CM Account1';
            account.Subtype__c ='Prospect';
            account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
            insert account;
            
     		List<Opportunity> emptyOppList = new List<Opportunity>();
            List<Opportunity> oppList = new List<Opportunity>();
            Opportunity opp = new Opportunity();
            opp.Name = 'Test Opportunity1'; 
            opp.AccountId = account.Id;
            opp.Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP';
            opp.EffectiveDate__c = System.Today();
            opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
            opp.Product_Type_Involved_in_Opp__c = 'Medical';
            opp.CloseDate = System.Today();
            opp.StageName = 'Qualification';
            opp.Expected_Date_of_RFP__c = System.Today(); 
            opp.CM_VPCR_RVP__c = testAdminUser.Id;
            opp.Comments_Last_Modified__c = System.now();
            opp.Comments__c = '';
            opp.OwnerId = testAdminUser.Id;
            opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
            oppList.add(opp);
            insert oppList;
            oppList[0].Comments_Last_Modified__c = System.now().addDays(2);
            update oppList;
            system.debug('***opp***'+opp);
            //system.debug('***opp***'+opp.Owner.FirstName+ opp.CM_VPCR_RVP__r.FirstName);
            system.debug('***account***'+account);
           
            
            //Insert Account and related Contacts
           Account accInsert = new Account(Name = 'Test CM Accounts', RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(), Subtype__c = 'National Accounts - East', CMVPCRRVP__c = testAdminUser.Id);
           insert accInsert;
            
            System.debug('Record inserted and its ID '+accInsert.CMVPCRRVP__c+' \n testCmVpcrUser.Id '+testCmVpcrUser.Id);
            List<Contact> insertContacts = new List<Contact>();
            Contact conInsert1 = new Contact(FirstName = 'Insert workItemsContact1', LastName = '1', AccountId = accInsert.Id, Correspondence_Type__c='Customer Survey - Secondary', Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId());
            Contact conInsert2 = new Contact(FirstName = 'Insert workItemsContact', LastName = '2', AccountId = accInsert.Id, Correspondence_Type__c='Customer Survey - Primary', Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId());
            Contact conInsert3 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            Contact conInsert4 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=true, Correspondence_Type__c= 'Customer Survey - Secondary;Customer Survey - Primary;CD Holiday', RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            Contact conInsert5 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=true, Correspondence_Type__c= 'Customer Survey - Secondary;Customer Survey - Primary', RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            insertContacts.add(conInsert1);
            insertContacts.add(conInsert2);
            insertContacts.add(conInsert3);
            insertContacts.add(conInsert5);
            insert insertContacts;
            
            try {
                insert conInsert4;
            } catch(Exception e) {
                System.debug('Error occured while inserting the record '+e.getMessage());
            }
            
            //workItemsController.searchedContacts('Inse', 'First Name','Begins With');
            //workItemsController.searchedContacts('Insert Contact', 'First Name','Equals To');
            //workItemsController.searchedContacts('Inse', 'First Name','Contains');
            //workItemsController.searchedContacts('1', 'Last Name','Begins With');
            //workItemsController.searchedContacts('1', 'Last Name','Equals To');
            //workItemsController.searchedContacts('2', 'Last Name','Contains');
            //workItemsController.searchedContacts('Insert workItemsContact1', 'Company','Begins With');
            //workItemsController.searchedContacts('Insert Correspodence Account', 'Company','Equals To');
            //workItemsController.searchedContacts('Insert Correspodence Accoun', 'Company','Contains');
            insertContacts[2].LastName = '';
            insertContacts[3].Correspondence_Type__c= 'Customer Survey - Secondary;CD Holiday';
            //workItemsController.saveNpsContactData(insertContacts);
            workItemsController.fetchDefaultContacts();
        }
        
        /*System.runAs(testCmVpcrUser) {
           workItemsController.getAccountsandOpportunities(True, False, 'All', 'All', 'Name', 'ASC');
           workItemsController.getAccountsandOpportunities(False, True, 'All', 'All', 'Name', 'ASC');           
           workItemsController.getAccountsandOpportunities(False, True, '', 'All', 'Name', 'ASC');
           workItemsController.searchedContacts('3', 'Last Name','Contains');
        }*/
        
        /*System.runAs(testCmSce) {
            workItemsController.getAccountsandOpportunities(True, False, 'All', 'All', 'Name', 'ASC');
        }*/       
        Test.stopTest();
    }
    
     @isTest static void createTestData2() {
         Id cmAdminId = [select Id, Name from UserRole where Name = 'CRM Administrator' limit 1].id;
         Id cmVpcrRvpId = [select Id, Name from UserRole where Name = 'CM VPCR/RVP' limit 1].id;
         Id cmSceId = [select Id, Name from UserRole where Name = 'CM SCE' limit 1].id;
         //Id sbSceId = [select Id, Name from UserRole where name = 'Specialty Benefits SCE' limit 1].id;
         //System.debug('cmSceId -- >'+cmSceId);
        
        Id userProfileId= [select Id, Name from Profile where Name = 'Standard User' limit 1].id;
        User emptyUser = new User();
        list<User> testUserRecords = new list<User>();
        testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@crmit.com', Username = 'test1.user1@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmAdminId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs1', Email = 'test2.user2@crmit.com', Username = 'test2.user2@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmVpcrRvpId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        testUserRecords.add(new user(LastName = 'Test3',FirstName='User3', Alias = 'tUs1', Email = 'test3.user3@crmit.com', Username = 'test3.user3@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmSceId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        /*testUserRecords.add(new user(LastName = 'Test4',FirstName='User4', Alias = 'tUs4', Email = 'test4.user4@crmit.com', Username = 'test4.user4@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = sbSceId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));*/
        insert testUserRecords;
        
        User testAdminUser = testUserRecords[0];
        User testCmVpcrUser = testUserRecords[1];
        User testCmSce = testUserRecords[2];
        //System.debug('testCmSce -->'+testCmSce);
        Test.startTest();
        System.runAs(testAdminUser) {
            Account cDAccEquity = new Account();
            cDAccEquity.Name = 'Equity Healthcare';
            cDAccEquity.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
            cDAccEquity.Subtype__c = 'Collaborative Ventures Group (CVG)';
            insert cDAccEquity;
            
            Account account = new Account();
            account.Name = 'Test CM Account1';
            account.Subtype__c ='Prospect';
            account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
            insert account;
            
     		List<Opportunity> emptyOppList = new List<Opportunity>();
            List<Opportunity> oppList = new List<Opportunity>();
            Opportunity opp = new Opportunity();
            opp.Name = 'Test Opportunity1'; 
            opp.AccountId = account.Id;
            opp.Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP';
            opp.EffectiveDate__c = System.Today();
            opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
            opp.Product_Type_Involved_in_Opp__c = 'Medical';
            opp.CloseDate = System.Today();
            opp.StageName = 'Qualification';
            opp.Expected_Date_of_RFP__c = System.Today(); 
            opp.CM_VPCR_RVP__c = testAdminUser.Id;
            opp.Comments_Last_Modified__c = System.now();
            opp.Comments__c = '';
            opp.OwnerId = testAdminUser.Id;
            opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
            oppList.add(opp);
            insert oppList;
            oppList[0].Comments_Last_Modified__c = System.now().addDays(2);
            update oppList;
            system.debug('***opp***'+opp);
            //system.debug('***opp***'+opp.Owner.FirstName+ opp.CM_VPCR_RVP__r.FirstName);
            system.debug('***account***'+account);
           
            
            //Insert Account and related Contacts
           Account accInsert = new Account(Name = 'Test CM Accounts', RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(), Subtype__c = 'National Accounts - East', CMVPCRRVP__c = testAdminUser.Id);
           insert accInsert;
            
            System.debug('Record inserted and its ID '+accInsert.CMVPCRRVP__c+' \n testCmVpcrUser.Id '+testCmVpcrUser.Id);
            List<Contact> insertContacts = new List<Contact>();
            Contact conInsert1 = new Contact(FirstName = 'Insert workItemsContact1', LastName = '1', AccountId = accInsert.Id, Correspondence_Type__c='Customer Survey - Secondary', Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId());
            Contact conInsert2 = new Contact(FirstName = 'Insert workItemsContact', LastName = '2', AccountId = accInsert.Id, Correspondence_Type__c='Customer Survey - Primary', Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId());
            Contact conInsert3 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            Contact conInsert4 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=true, Correspondence_Type__c= 'Customer Survey - Secondary;Customer Survey - Primary;CD Holiday', RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            Contact conInsert5 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=true, Correspondence_Type__c= 'Customer Survey - Secondary;Customer Survey - Primary', RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            insertContacts.add(conInsert1);
            insertContacts.add(conInsert2);
            insertContacts.add(conInsert3);
            insertContacts.add(conInsert5);
            insert insertContacts;
            
            try {
                insert conInsert4;
            } catch(Exception e) {
                System.debug('Error occured while inserting the record '+e.getMessage());
            }
            
            //workItemsController.searchedContacts('Inse', 'First Name','Begins With');
            workItemsController.searchedContacts('Insert Contact', 'First Name','Equals To');
            workItemsController.searchedContacts('Inse', 'First Name','Contains');
            //workItemsController.searchedContacts('1', 'Last Name','Begins With');
            //workItemsController.searchedContacts('1', 'Last Name','Equals To');
            //workItemsController.searchedContacts('2', 'Last Name','Contains');
            //workItemsController.searchedContacts('Insert workItemsContact1', 'Company','Begins With');
            //workItemsController.searchedContacts('Insert Correspodence Account', 'Company','Equals To');
            //workItemsController.searchedContacts('Insert Correspodence Accoun', 'Company','Contains');
            insertContacts[2].LastName = '';
            insertContacts[3].Correspondence_Type__c= 'Customer Survey - Secondary;CD Holiday';
            //workItemsController.saveNpsContactData(insertContacts);
            //workItemsController.fetchDefaultContacts();
        }
        
        /*System.runAs(testCmVpcrUser) {
           workItemsController.getAccountsandOpportunities(True, False, 'All', 'All', 'Name', 'ASC');
           workItemsController.getAccountsandOpportunities(False, True, 'All', 'All', 'Name', 'ASC');           
           workItemsController.getAccountsandOpportunities(False, True, '', 'All', 'Name', 'ASC');
           workItemsController.searchedContacts('3', 'Last Name','Contains');
        }*/
        
        /*System.runAs(testCmSce) {
            workItemsController.getAccountsandOpportunities(True, False, 'All', 'All', 'Name', 'ASC');
        }*/       
        Test.stopTest();
    }
    
    @isTest static void createTestData3() {
         Id cmAdminId = [select Id, Name from UserRole where Name = 'CRM Administrator' limit 1].id;
         Id cmVpcrRvpId = [select Id, Name from UserRole where Name = 'CM VPCR/RVP' limit 1].id;
         Id cmSceId = [select Id, Name from UserRole where Name = 'CM SCE' limit 1].id;
         //Id sbSceId = [select Id, Name from UserRole where name = 'Specialty Benefits SCE' limit 1].id;
         //System.debug('cmSceId -- >'+cmSceId);
        
        Id userProfileId= [select Id, Name from Profile where Name = 'Standard User' limit 1].id;
        User emptyUser = new User();
        list<User> testUserRecords = new list<User>();
        testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@crmit.com', Username = 'test1.user1@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmAdminId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs1', Email = 'test2.user2@crmit.com', Username = 'test2.user2@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmVpcrRvpId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        testUserRecords.add(new user(LastName = 'Test3',FirstName='User3', Alias = 'tUs1', Email = 'test3.user3@crmit.com', Username = 'test3.user3@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmSceId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        /*testUserRecords.add(new user(LastName = 'Test4',FirstName='User4', Alias = 'tUs4', Email = 'test4.user4@crmit.com', Username = 'test4.user4@crmit.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = sbSceId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));*/
        insert testUserRecords;
        
        User testAdminUser = testUserRecords[0];
        User testCmVpcrUser = testUserRecords[1];
        User testCmSce = testUserRecords[2];
        //System.debug('testCmSce -->'+testCmSce);
        Test.startTest();
        System.runAs(testAdminUser) {
            Account cDAccEquity = new Account();
            cDAccEquity.Name = 'Equity Healthcare';
            cDAccEquity.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
            cDAccEquity.Subtype__c = 'Collaborative Ventures Group (CVG)';
            insert cDAccEquity;
            
            Account account = new Account();
            account.Name = 'Test CM Account1';
            account.Subtype__c ='Prospect';
            account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
            insert account;
            
     		List<Opportunity> emptyOppList = new List<Opportunity>();
            List<Opportunity> oppList = new List<Opportunity>();
            Opportunity opp = new Opportunity();
            opp.Name = 'Test Opportunity1'; 
            opp.AccountId = account.Id;
            opp.Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP';
            opp.EffectiveDate__c = System.Today();
            opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
            opp.Product_Type_Involved_in_Opp__c = 'Medical';
            opp.CloseDate = System.Today();
            opp.StageName = 'Qualification';
            opp.Expected_Date_of_RFP__c = System.Today(); 
            opp.CM_VPCR_RVP__c = testAdminUser.Id;
            opp.Comments_Last_Modified__c = System.now();
            opp.Comments__c = '';
            opp.OwnerId = testAdminUser.Id;
            opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
            oppList.add(opp);
            insert oppList;
            oppList[0].Comments_Last_Modified__c = System.now().addDays(2);
            update oppList;
            system.debug('***opp***'+opp);
            //system.debug('***opp***'+opp.Owner.FirstName+ opp.CM_VPCR_RVP__r.FirstName);
            system.debug('***account***'+account);
           
            
            //Insert Account and related Contacts
           Account accInsert = new Account(Name = 'Test CM Accounts', RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(), Subtype__c = 'National Accounts - East', CMVPCRRVP__c = testAdminUser.Id);
           insert accInsert;
            
            System.debug('Record inserted and its ID '+accInsert.CMVPCRRVP__c+' \n testCmVpcrUser.Id '+testCmVpcrUser.Id);
            List<Contact> insertContacts = new List<Contact>();
            Contact conInsert1 = new Contact(FirstName = 'Insert workItemsContact1', LastName = '1', AccountId = accInsert.Id, Correspondence_Type__c='Customer Survey - Secondary', Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId());
            Contact conInsert2 = new Contact(FirstName = 'Insert workItemsContact', LastName = '2', AccountId = accInsert.Id, Correspondence_Type__c='Customer Survey - Primary', Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId());
            Contact conInsert3 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=false, RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            Contact conInsert4 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=true, Correspondence_Type__c= 'Customer Survey - Secondary;Customer Survey - Primary;CD Holiday', RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            Contact conInsert5 = new Contact(FirstName = 'Insert workItemsContact', LastName = '3', AccountId = accInsert.Id, Status__c = 'Active', DoNotSendCorrespondence__c=true, Correspondence_Type__c= 'Customer Survey - Secondary;Customer Survey - Primary', RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId(), OwnerId=testAdminUser.Id);
            insertContacts.add(conInsert1);
            insertContacts.add(conInsert2);
            insertContacts.add(conInsert3);
            insertContacts.add(conInsert5);
            insert insertContacts;
            
            try {
                insert conInsert4;
            } catch(Exception e) {
                System.debug('Error occured while inserting the record '+e.getMessage());
            }
            
            //workItemsController.searchedContacts('Inse', 'First Name','Begins With');
            //workItemsController.searchedContacts('Insert Contact', 'First Name','Equals To');
            //workItemsController.searchedContacts('Inse', 'First Name','Contains');
            workItemsController.searchedContacts('1', 'Last Name','Begins With');
            workItemsController.searchedContacts('1', 'Last Name','Equals To');
            workItemsController.searchedContacts('2', 'Last Name','Contains');
            workItemsController.searchedContacts('Insert workItemsContact1', 'Company','Begins With');
            workItemsController.searchedContacts('Insert Correspodence Account', 'Company','Equals To');
            workItemsController.searchedContacts('Insert Correspodence Accoun', 'Company','Contains');
            insertContacts[2].LastName = '';
            insertContacts[3].Correspondence_Type__c= 'Customer Survey - Secondary;CD Holiday';
            //workItemsController.saveNpsContactData(insertContacts);
            //workItemsController.fetchDefaultContacts();
        }
        
        /*System.runAs(testCmVpcrUser) {
           workItemsController.getAccountsandOpportunities(True, False, 'All', 'All', 'Name', 'ASC');
           workItemsController.getAccountsandOpportunities(False, True, 'All', 'All', 'Name', 'ASC');           
           workItemsController.getAccountsandOpportunities(False, True, '', 'All', 'Name', 'ASC');
           workItemsController.searchedContacts('3', 'Last Name','Contains');
        }*/
        
        /*System.runAs(testCmSce) {
            workItemsController.getAccountsandOpportunities(True, False, 'All', 'All', 'Name', 'ASC');
        }*/       
        Test.stopTest();
    }
}