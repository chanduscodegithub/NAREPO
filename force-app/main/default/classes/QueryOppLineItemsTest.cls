@isTest
public class QueryOppLineItemsTest {
    
    @testSetup static void createTestData() {
        
        /*Id cmAdminUserRoleId = [select Id, Name from UserRole where name = 'CRM Administrator' limit 1].id;
Id cmCSADUserRoleId = [select Id, Name from UserRole where name = 'CM CSAD' limit 1].id;
Id genExecUserRoleId = [select Id, Name from UserRole where name = 'CM VPCR/RVP' limit 1].id;

Id userProfileId= [select Id, Name from Profile where name = 'Standard User' limit 1].id;*/
        Id userProfileId1= [select Id, Name from Profile where name = 'System Administrator' limit 1].id;
        List<user> testUserRecords = new List<user>();
        /*testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@crmit.com', Username = 'uhgDevWithoutId1@crmit.com',
ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId = cmCSADUserRoleId,
EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US'));
testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs2', Email = 'test2.user2@crmit.com', Username = 'uhgDevWithoutId2@crmit.com',
ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = genExecUserRoleId,
EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US'));*/
        testUserRecords.add(new user(LastName = 'Test3',FirstName='User3', Alias = 'tUs3', Email = 'test3.user3@crmit.com', Username = 'uhgDevWithoutId3@crmit.com',
                                     ProfileId = userProfileId1, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
        
        insert testUserRecords;
        system.debug('Insert of test users Success');
        
        //QueryOppLineItemsTest.createData();
        User testUserRecords1 = [Select Id from User where LastName='Test3'];
        
        /* Creating Account */
        List<Account> acc = new List<Account>();
        Account a = new Account(
            Name = 'Test Account',
            Subtype__c ='CVG',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()
        );
        acc.add(a);
        system.debug('acc data '+acc);
        insert acc;
        system.debug('Creation of Account  Success');
        
        
        /*
* The below method Inserts data into Pricebook2, Product2, Opportunity and OpportunityLineItem Records in SF
*/
        
        PriceBook2 book2 = new PriceBook2();
        book2.Name = 'Test book2';
        insert book2;
        
        List<Product2> prod = new List<Product2>();
        
        Product2 prod1 = new Product2(
            Name = 'Test Prod1',
            Product_Line__c='Pharmacy',
            IsActive = true
            
        );
        insert prod1;
        prod.add(prod1);
        
        /* Product2 prod2 = new Product2(
Name = 'Test Prod2',
Product_Line__c='Dental',
IsActive = true
);
prod.add(prod2);

Product2 prod3 = new Product2(
Name = 'Test Prod3',
Product_Line__c='Vision',
IsActive = true
);
prod.add(prod3);

Product2 prod4 = new Product2(
Name = 'Test Prod4',
Product_Line__c='Other',
IsActive = true
);
prod.add(prod4);
insert prod;*/
        
        PricebookEntry pbe1 = new PricebookEntry(Pricebook2Id = book2.Id, Product2Id = prod1.Id, UnitPrice = 1000, IsActive = true);
        pbe1.Pricebook2Id = Test.getStandardPricebookId();
        insert pbe1;
        
        system.debug('Creation of Product2  Success');
        List<Opportunity> OpportunityData = new List<Opportunity>();
        
        Opportunity opp1 =  new Opportunity(
            AccountId = acc[0].Id,
            Name = 'Test Opp123',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Medical,Vision',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today()
        );
        OpportunityData.add(opp1);
        insert OpportunityData;
        
        List<OpportunityLineItem> OpportunityLineItemList = new List<OpportunityLineItem>();
        
        OpportunityLineItem oppItem1 = new OpportunityLineItem(
            OpportunityId = OpportunityData[0].Id,                     
            PricebookEntryId = pbe1.Id,
            Net_Results__c = 20,
            Quantity = 100,
            UnitPrice = 12
        );
        OpportunityLineItemList.add(oppItem1);
        insert OpportunityLineItemList;
        
        system.debug('Insert of Opp Line Items test users success');
    }
    
    @isTest static void testGetLoggedInUserRoleInfo(){
        Opportunity opp=[Select Id from Opportunity where Name='Test Opp123']; 
        Test.startTest();
        
        QueryOppLineItems.getLoggedInUerRoleInfo();
        
        User salesUserWhoseRoleListed = new User(
            LastName = 'User4',
            FirstName='Test',
            Alias = 'slsusr',
            Email = 'testuser4@crmit.com',
            Username = 'crmittestuser4@test.com',
            ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
            UserRoleId = [select Id, Name from UserRole where name = 'CD SVP' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User'
        	);
        
        User salesUserWhoseRoleisNotListed = new User(
            LastName = 'User5',
            FirstName='Test1',
            Alias = 'slsuser',
            Email = 'testuser5@crmit.com',
            Username = 'crmittestuser5@test.com',
            ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
            UserRoleId = [select Id, Name from UserRole where name = 'CSI Assoc, Director IL(SHAYNE)' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
            Position__c='Test User'
        );
        
        insert salesUserWhoseRoleisNotListed;
        System.runAs(salesUserWhoseRoleListed) {
            QueryOppLineItems.getLoggedInUerRoleInfo();
        }
        
        System.runAs(salesUserWhoseRoleisNotListed) {
            QueryOppLineItems.getLoggedInUerRoleInfo();
        }
        
        Test.stopTest();
    }
    
    static testMethod void validateFetchOppLineItemDetails() {
        Opportunity opp=[Select Id from Opportunity where Name='Test Opp123'];
        
        Test.startTest();
        User systemAdmin = [Select Id from User where Username = 'uhgDevWithoutId3@crmit.com' LIMIT 1]; 
        System.runAs(systemAdmin) {
            QueryOppLineItems.getOppProductLineItemData(opp.Id);
            QueryOppLineItems.getTemplateInXML(opp.Id);
            System.debug('XML completed');
        }
        Test.stopTest();
    }
    
      static testMethod void testFetchLookUpValues(){
         Opportunity opp=[Select Id from Opportunity where Name='Test Opp123'];
        Test.startTest();
        QueryOppLineItems.fetchLookUpValues('',opp.Id);
        QueryOppLineItems.fetchLookUpValues('a',opp.Id);
        Test.stopTest();
    }
    
    static testMethod void testgetUserProfile(){
        Opportunity opp=[Select Id from Opportunity where Name='Test Opp123'];
        List<OpportunityLineItem> oppDataToTest = [SELECT Id,Submit_for_sales_incentives__c, Will_Sales_Incentive_be_split__c, Sales_Person_1_split_percentage__c FROM OpportunityLineItem WHERE OpportunityId =: opp.Id];
        Test.startTest();
        QueryOppLineItems.getUserProfile(opp.Id);
        QueryOppLineItems.getUserRole(opp.Id);
        Test.stopTest();
    }
    
    static testMethod void testsendMailFromApex(){
        Opportunity opp=[Select Id from Opportunity where Name='Test Opp123'];
        Test.startTest();
        QueryOppLineItems.sendMailFromApex('Test ','CRMIT ',opp.Id);
        Test.stopTest();
    }
    
    static testMethod void validateSaveOppLineItems(){
        Opportunity opp=[Select Id from Opportunity where Name='Test Opp123'];
        List<OpportunityLineItem> oppDataToTest = [SELECT Id,Submit_for_sales_incentives__c, Will_Sales_Incentive_be_split__c, Sales_Person_1_split_percentage__c FROM OpportunityLineItem WHERE OpportunityId =: opp.Id];
       system.debug('Opp Data to Test '+oppDataToTest);
        for(OpportunityLineItem updateOppData : oppDataToTest){
            updateOppData.Sales_Person_1_split_percentage__c = 100;
            updateOppData.Will_Sales_Incentive_be_split__c = 'No';
            updateOppData.Submit_for_sales_incentives__c = true;
        }
        
        for(OpportunityLineItem updateWrongOppData : oppDataToTest){
            updateWrongOppData.Sales_Person_1_split_percentage__c = 100.2;
            updateWrongOppData.Will_Sales_Incentive_be_split__c = 'NoN';
            updateWrongOppData.Submit_for_sales_incentives__c = true;
        }
        
        List<OpportunityLineItem> updateData =new List<OpportunityLineItem>();
        List<OpportunityLineItem> updateWrongData =new List<OpportunityLineItem>();
        updateData.add(oppDataToTest[0]);
        updateWrongData.add(oppDataToTest[0]);
        system.debug('Updating save data '+updateData);
        User systemAdmin = [Select Id from User where Username = 'uhgDevWithoutId3@crmit.com' LIMIT 1]; 
        System.runAs(systemAdmin) {
            Test.startTest();
            QueryOppLineItems.saveOpportunityLineData(updateData);
            QueryOppLineItems.saveOpportunityLineData(updateWrongData);
            Test.stopTest();
        }
    }
    
}