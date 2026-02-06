@isTest
public class NavigationHelpTest {
    @testSetup static void setup() {
     
 
        List<Account> testAccts = new List<Account>();
        for(Integer i=0;i<5;i++) {
            testAccts.add(new Account(Name = 'TestAcct'+i));
        }
        
        //Collaborative Ventures Group (CVG)
        testAccts[0].Subtype__c = ' National Accounts - East';
        testAccts[0].RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        testAccts[1].Subtype__c = 'Prospect';
        testAccts[1].RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        testAccts[2].Subtype__c = 'Consulting Firm';
        testAccts[2].RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        
        testAccts[3].CompetitorGroup__c='Cigna';
        testAccts[3]. Product_Types_Offered__c = 'Medical';
        testAccts[3].RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        testAccts[4].Subtype__c = 'Collaborative Ventures Group (CVG)';
        testAccts[4].RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        insert testAccts;
        
        Lead lead =new Lead();
        lead.LastName = 'test LastName Lead';
        lead.FirstName = 'test FirstNameLead';
        lead.Company=testAccts[0].Id;
        insert lead;
        
        List<Contact> testContact = new List<Contact>();
        for(Integer j=0;j<3;j++){
            testContact.add(new Contact(LastName = 'TestContact'+j,FirstName ='Test FirstName '+j));
        }
        
        testContact[0].RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
        testContact[0].AccountId = testAccts[1].Id;
        testContact[1].RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId();
        testContact[1].AccountId = testAccts[0].Id;
        testContact[2].RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        testContact[2].AccountId =  testAccts[2].Id;
        insert testContact;

        try {
            
            List<Opportunity> testOpportunity = new List<Opportunity>();
            for(Integer i=0;i<2;i++) {
                testOpportunity.add(new Opportunity(
                    Name='Test Opportunity'+i,
                    
                    Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
                    EffectiveDate__c = system.today(),
                    Product_Type_Involved_in_Opp__c = 'Medical;Vision;Dental',
                    Has_a_Formal_RFP_Been_Issued__c ='No',
                    Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No',
                    Is_There_Existing_Membership_at_Risk__c  = 'No',
                    Expected_Date_of_RFP__c = system.today(),
                    StageName = 'Proposal',
                    CloseDate = System.today()
                ));
            }
            
            testOpportunity[0].RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CD Membership Activity  (Prospect or Aggregator)').getRecordTypeId();
            testOpportunity[0].AccountId = testAccts[1].Id;
            testOpportunity[1].RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CM Membership Activity (Existing Client)').getRecordTypeId();
            testOpportunity[1].AccountId = testAccts[0].Id;
            insert testOpportunity;
        } catch(Exception e) {
            System.debug('Exception occured '+e.getCause());
        }
        
        List<JobAid__c> testjobAid = new List<JobAid__c>();
        for(Integer i=0;i<5;i++) 
        {
            testjobAid.add(new JobAid__c(Name ='testjobAid'+i,IsActive__c = true));
        }
        // insert testjobAid;
        
        testjobAid[0].DocumentType__c = 'Client Management';
        testjobAid[1].DocumentType__c = 'Client Development';
        testjobAid[2].DocumentType__c = 'Consulting Firms-Consultants';
        testjobAid[3].DocumentType__c = 'Aggregators';
        testjobAid[4].DocumentType__c = 'Competitors';
        insert testjobAid;  
        
        ContentVersion contentVersion_1 = new ContentVersion(
            Title = 'Test',
            PathOnClient = 'Penguins.pdf',
            VersionData = Blob.valueOf('Test Content'),
            IsMajorVersion = true
        );
        upsert contentVersion_1;
        ContentVersion contentVersion_2 = [SELECT Id, Title, ContentDocumentId FROM ContentVersion WHERE Id = :contentVersion_1.Id LIMIT 1];
        List<ContentDocument> documents = [SELECT Id, Title, LatestPublishedVersionId FROM ContentDocument];
        List<ContentDocumentLink> contentDocumentLink = new List<ContentDocumentLink>();
        for(Integer i=0;i<5;i++){
            contentDocumentLink.add (new ContentDocumentLink(LinkedEntityId=testjobAid[i].Id,ShareType='V',ContentDocumentId=documents[0].Id,Visibility ='AllUsers')); 
        }
        upsert contentDocumentLink;
    }
    @isTest static void testMethod1() {
        List<Account> acc = [Select Id,Name from Account where Name Like 'TestAcct0'];
        NavigationHelp.getTheDocument(acc[0].Id);
       }
     @isTest static void testMethod2() {
         try {
             List<Opportunity> opp = [Select Id,Name from Opportunity where Name Like 'Test Opportunity%'];
             NavigationHelp.getTheDocument(opp[0].Id); 
         } catch(Exception e) {
             System.debug('Exception occurred in NavigationHelpTest in testMethod2 - '+e);
         }
       }
     @isTest static void testMethod3() {
        List<Contact> con = [Select Id,LastName from Contact where Name Like 'Test%'];
        NavigationHelp.getTheDocument(con[0].Id);
    }
     @isTest static void testMethod4() {
        List<Contact> con = [Select Id,LastName from Contact where Name Like 'Test%'];
        NavigationHelp.getTheDocument(con[0].Id);
    }
     @isTest static void testMethod5() {
        List<Account> acc = [Select Id,Name from Account where Name Like 'TestAcct3'];
        NavigationHelp.getTheDocument(acc[0].Id);
       }
     @isTest static void testMethod6() {
        List<Account> acc = [Select Id,Name from Account where Name Like 'TestAcct4'];
        NavigationHelp.getTheDocument(acc[0].Id);
       }
     @isTest static void testMethod7() {
        List<Account> acc = [Select Id,Name from Account where Name Like 'TestAcct2'];
        NavigationHelp.getTheDocument(acc[0].Id);
       }
     @isTest static void testMethod8() {
        List<Contact> con = [Select Id,LastName from Contact where LastName Like 'TestContact1'];
        NavigationHelp.getTheDocument(con[0].Id);
       }
    @isTest static void testMethod9() {
        Lead lead = [Select Id,LastName from Lead where LastName Like 'test LastName Lead'];
        NavigationHelp.getTheDocument(lead.Id);
       }
    
}