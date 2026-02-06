@isTest
public class SiteVisitBriefingDocumentControllerTest {
         @isTest public static void setupTestData(){
         Id oppRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CD Membership Activity (Prospect or Aggregator)').getRecordTypeId();

        List<Opportunity> oppList = new List<Opportunity>();
             List<Contact> conList = new List<Contact>();
        
        Account account = new Account();
        account.Name = 'Opp Trigger Test Account';
        account.Subtype__c ='Prospect';
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert account;
        
        Account account2 = new Account();
        account2.Name = 'Equity Healthcare';
        account2.Subtype__c ='Collaborative Ventures Group (CVG)';
        account2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        insert account2;
         Company_Wide_BiC_Information__c bicInfo1 = new Company_Wide_BiC_Information__c(
            Company__c = account.Id,
            Year__c = '2024',
            Type__c = 'Test Type'
        );
        insert bicInfo1;  
            Company_Wide_BiC_Information__c bicInfo2 = new Company_Wide_BiC_Information__c(
            Company__c = account2.Id,
            Year__c = '2024',
            Type__c = 'Test Type'
        );
        insert bicInfo2;
        Opportunity opp1 = new Opportunity(Name='Test Opp 1', AccountId = account.Id, RecordTypeId=oppRecordTypeId, Product_Type_Involved_in_Opp__c='Medical',
                                           Disposition_Medical__c='Sold', Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', StageName = 'Closed',
                                           CloseDate = System.today());
        
        Opportunity opp2 = new Opportunity(Name='Test Opp 2', AccountId = account.Id, RecordTypeId=oppRecordTypeId,
                                            Product_Type_Involved_in_Opp__c='Medical', 
                                           Disposition_Vision__c='Sold', Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', StageName = 'Closed', 
                                           CloseDate = System.today(), WillThrBeaRFP__c = 'Yes, RFP is Certain' , Status__c ='closed');
        
        oppList.add(opp1);
        oppList.add(opp2);
        
        insert oppList;
       
        Id pricebookId = Test.getStandardPricebookId();
        
        Product2 prod = new Product2(
            Name = 'Test Vision Product',
            Product_Line__c = 'Medical',
            Family = 'Specialty Products',
            ProductCode = 'Pro-X',
            isActive = true
        );
        insert prod;
             
             List<Product2> prodList = new List<Product2>{
                 new Product2(Name = 'Medical Product', Product_Line__c = 'Medical', Family = 'Specialty Products', ProductCode = 'Med1', isActive = true),
                     new Product2(Name = 'Dental Product', Product_Line__c = 'Dental', Family = 'Specialty Products', ProductCode = 'Dent1', isActive = true),
                     new Product2(Name = 'Vision Product', Product_Line__c = 'Vision', Family = 'Specialty Products', ProductCode = 'Vis1', isActive = true),
                     new Product2(Name = 'Pharmacy Product', Product_Line__c = 'Pharmacy', Family = 'Specialty Products', ProductCode = 'Pharm1', isActive = true),
                     new Product2(Name = 'Other Product', Product_Line__c = 'Other', Family = 'Specialty Products', ProductCode = 'Other1', isActive = true),
                     new Product2(Name = 'Total', Product_Line__c = 'Medical', Family = 'Specialty Products', ProductCode = 'Tot1', isActive = true)
                     };
                         insert prodList;
        
        PricebookEntry pbEntry = new PricebookEntry(
            Pricebook2Id = pricebookId,
            Product2Id = prod.Id,
            UnitPrice = 100.00,
            IsActive = true
        );
        insert pbEntry;
        
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp2.Id,
            Quantity = 5,
            Product2Id = prod.Id,
           // Product_Line__c = 'Vision', 
            PricebookEntryId = pbEntry.Id,
            TotalPrice = 100
        );
        insert oli;
        Contact con = new Contact(
             LastName ='Test con1',
            FirstName ='first',
             Title ='test title',
                 AccountId = account.Id
             );
             insert con;
             Contact con1 = new Contact(
             LastName ='Test con2',
                 FirstName ='first1',
             Title ='test title2',
                 AccountId = account.Id);
             insert con1;
             conList.add(con);
             conList.add(con1);     
     /*    Test.startTest();
              SiteVisitBriefingDocumentController.SiteBriefingWrapper wrapper = SiteVisitBriefingDocumentController.getSiteBriefingDetails(account.Id,opp1.Id);
              List<Opportunity> opportunities = SiteVisitBriefingDocumentController.getOpportunitiesOfAccount(account.Id);
              //List<Company_Wide_BiC_Information__c> bicInformationList = SiteVisitBriefingDocumentController.getBicInformation;
             Test.stopTest();  */
             
             
             Test.startTest();
             SiteVisitBriefingDocumentController.SiteBriefingWrapper wrapper = SiteVisitBriefingDocumentController.getSiteBriefingDetails(account.Id, opp1.Id);
             List<Opportunity> opportunities = SiteVisitBriefingDocumentController.getOpportunitiesOfAccount(account.Id);
             PageReference pageRef = Page.BriefingWordDocVfPage;
             Test.setCurrentPage(pageRef);
             ApexPages.currentPage().getParameters().put('accountId', account.Id);
             ApexPages.currentPage().getParameters().put('membershipActivityId', opp1.Id);
             ApexPages.currentPage().getParameters().put('wordReport', '1');
             
             
             
             SiteVisitBriefingDocumentController controller = new SiteVisitBriefingDocumentController();
             
             String bid = controller.getFormattedBidStrategy();
             String must = controller.getFormattedMustWinCriteria();
             String prodDesc = controller.getFormattedProductNonStandards();
             String asks = controller.getFormattedOptumAsks();
             String notes = controller.getFormattedFinancialNotes();
             String risks = controller.getFormattedSurestKeyRisks();
             String comments = controller.getFormattedSurestComments();
             String blues = controller.getFormatted2ndBluesBidComments();
             String background = controller.getFormattedBackgroundCompanyOverview();
             
        ApexPages.currentPage().getParameters().clear();
        ApexPages.currentPage().getParameters().put('accountId', account.Id);
        SiteVisitBriefingDocumentController controller2 = new SiteVisitBriefingDocumentController();
      

        Test.stopTest();


                                     }

}