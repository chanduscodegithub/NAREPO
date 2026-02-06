@isTest
public class GrowthIncntvCmpnstnControllerTest {
	@testSetup static void createTestData() {
        
        List<user> userListToInsert = new List<user>();
        Map<String, Id> userRoleMap = new Map<String, Id>();
        for (UserRole ur : [select Id, Name from UserRole where name in ('CM SCE', 'CD SVP', 'Specialty Benefits SVP', 'CM VPCR/RVP')]) {
            userRoleMap.put(ur.Name, ur.Id);
        }
        for (Profile testProfile : [select Id, Name from Profile where name in ('CM Sales Team Standard Profile', 'CD Sales Team Standard Profile')] ) {
            if (testProfile.name == 'CM Sales Team Standard Profile') {
                userListToInsert.add(new user(LastName = 'Test3r',FirstName='CM SCE', Alias = 'tUs3', Email = 'tester.uhgCMSCE@crmit.com', Username = 'uhgCMSCETest3r@crmit.com',
                                     ProfileId = testProfile.id, UserRoleId =  userRoleMap.get('CM SCE'), TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
                userListToInsert.add(new user(LastName = 'Test3r',FirstName='Specialty Benefits SVP', Alias = 'tUs3', Email = 'tester.uhgSpecialty@crmit.com', Username = 'uhgSpecialtyTest3r@crmit.com',
                                     ProfileId = testProfile.id, UserRoleId =  userRoleMap.get('Specialty Benefits SVP'), TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));
                userListToInsert.add(new user(LastName = 'Test3r',FirstName='CM VPCR/RVP', Alias = 'tUs3', Email = 'tester.uhgVPCR@crmit.com', Username = 'uhgVPCTest3rR@crmit.com',
                                     ProfileId = testProfile.id, UserRoleId =  userRoleMap.get('CM VPCR/RVP'), TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));            }
            if (testProfile.name == 'CD Sales Team Standard Profile') {
                userListToInsert.add(new user(LastName = 'Test3r',FirstName='CD SVP', Alias = 'tUs3', Email = 'tester.uhgCDSVP@crmit.com', Username = 'uhgCDSVPTest3r@crmit.com',
                                     ProfileId = testProfile.id, UserRoleId =  userRoleMap.get('CD SVP'), TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c='Test User'));            }
        }
        User thisUser = [ select Id from User where Id = :UserInfo.getUserId() ];
        System.runAs ( thisUser ) {
            insert userListToInsert;
        }
        
        List<Account> accListToInsert = new List<Account>();
        accListToInsert.add(new Account(Name = 'CRMIT IC Statement Test Account',Subtype__c ='CVG',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(),
            OwnerId=userListToInsert[0].Id
        ));
        accListToInsert.add(new Account(Name = 'CRMIT IC Statement Test Account1',Subtype__c ='Prospect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        ));
        
        insert accListToInsert;
        
        List<Opportunity> OppLstToInsert = new List<Opportunity>();
        
       OppLstToInsert.add(new Opportunity(AccountId = accListToInsert[0].Id,
            Name = 'CRMIT IC Statement Test Opportunity',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Pharmacy;Medical;Other Buy Up Programs',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            Disposition_Pharmacy__c='Sold',Disposition_Medical__c='Sold'                             
        ));
        
       OppLstToInsert.add(new Opportunity( AccountId = accListToInsert[1].Id,
            Name = 'CRMIT IC Statement Test Opportunity1',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Pharmacy;Medical;Other Buy Up Programs;Dental',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            Disposition_Pharmacy__c='Sold',Disposition_Medical__c='Sold',Disposition_Dental__c='Sold'                              
        ));
        
        insert OppLstToInsert;
        
        PriceBook2 priceBook = new PriceBook2();
        priceBook.Name = 'Test Price Book';
        insert priceBook;
        
        List<Product2> prodctListToInsert = new List<Product2>();
        
        prodctListToInsert.add(new Product2(
            Name = 'Total',
            Product_Line__c='Pharmacy',
            IsActive = true
        ));
        prodctListToInsert.add(new Product2(
            Name = 'Test Other Buy Up Prodct',
            Product_Line__c='Other',
            Family='Specialty Products',
            IsActive = true
        ));
        prodctListToInsert.add(new Product2(
            Name = 'Total',
            Product_Line__c='Medical',
            IsActive = true
        ));
        prodctListToInsert.add(new Product2(
            Name = 'CRMIT Test Other Product1',
            Product_Line__c='Other',
            Family='Specialty Products',
            IsActive = true
        ));
        prodctListToInsert.add(new Product2(
            Name = 'Test Other Product2',
            Product_Line__c='Other',
            Family='Specialty Products',
            IsActive = true
        ));
        prodctListToInsert.add(new Product2(
            Name = 'Total',
            Product_Line__c='Dental',
            IsActive = true
        ));
        
        insert prodctListToInsert;
        
        List<PricebookEntry> prcBookEntryListToInsert = new List<PricebookEntry>();
        
        for(Product2 eachPrdct:prodctListToInsert){
            PricebookEntry prcBookEntry=new PricebookEntry(Pricebook2Id = priceBook.Id, Product2Id = eachPrdct.Id, UnitPrice = 1000, IsActive = true); 
        	prcBookEntry.Pricebook2Id=Test.getStandardPricebookId();
            prcBookEntryListToInsert.add(prcBookEntry);
        }
        
        
        
        insert prcBookEntryListToInsert;
        
        List<OpportunityLineItem> OppLineItemListToInsert = new List<OpportunityLineItem>();
        
        OppLineItemListToInsert.add(new OpportunityLineItem(
            OpportunityId = OppLstToInsert[0].Id,                     
            PricebookEntryId = prcBookEntryListToInsert[0].Id,
            Net_Results__c = 20,
            Quantity = 100,
            UnitPrice = 12,
            Submit_for_sales_incentives__c=true,Will_Sales_Incentive_be_split__c='Yes',
            Sales_Person_1__c=userListToInsert[0].Id,Sales_Person_2__c=userListToInsert[1].Id,
            Sales_Person_1_split_percentage__c=60,Sales_Person_2_split_percentage__c=40,VPCR_RVP__c=userListToInsert[2].Id
            
        ));
        
        OppLineItemListToInsert.add(new OpportunityLineItem(
            OpportunityId = OppLstToInsert[0].Id,                     
            PricebookEntryId = prcBookEntryListToInsert[1].Id,
            Net_Results__c = 20,
            Quantity = 100,
            UnitPrice = 12,Eligible_for_Sales_Incentives__c='Yes',
            Disposition_Other_Buy_Up_Programs__c='Sold',
            Submit_for_sales_incentives__c=true,Will_Sales_Incentive_be_split__c='Yes',
            Sales_Person_1__c=userListToInsert[0].Id,Sales_Person_2__c=userListToInsert[1].Id,
            Sales_Person_1_split_percentage__c=60,Sales_Person_2_split_percentage__c=40,VPCR_RVP__c=userListToInsert[2].Id
        ));
        
        OppLineItemListToInsert.add(new OpportunityLineItem(
            OpportunityId = OppLstToInsert[0].Id,                     
            PricebookEntryId = prcBookEntryListToInsert[2].Id,
            Net_Results__c = 20,
            Quantity = 100,
            UnitPrice = 12,
            Submit_for_sales_incentives__c=true,Will_Sales_Incentive_be_split__c='Yes',
            Sales_Person_1__c=userListToInsert[0].Id,Sales_Person_2__c=userListToInsert[1].Id,
            Sales_Person_1_split_percentage__c=60,Sales_Person_2_split_percentage__c=40,VPCR_RVP__c=userListToInsert[2].Id
            
        ));
        
        OppLineItemListToInsert.add(new OpportunityLineItem(
            OpportunityId = OppLstToInsert[1].Id,                     
            PricebookEntryId = prcBookEntryListToInsert[1].Id,
            Net_Results__c = 20,
            Quantity = 100,
            UnitPrice = 12,Eligible_for_Sales_Incentives__c='Yes',
            Disposition_Other_Buy_Up_Programs__c='Sold',
            Submit_for_sales_incentives__c=true,Will_Sales_Incentive_be_split__c='Yes',
            Sales_Person_1__c=userListToInsert[0].Id,Sales_Person_2__c=userListToInsert[3].Id,
            Sales_Person_1_split_percentage__c=60,Sales_Person_2_split_percentage__c=40,VPCR_RVP__c=userListToInsert[2].Id
        ));
        
        OppLineItemListToInsert.add(new OpportunityLineItem(
            OpportunityId = OppLstToInsert[1].Id,                     
            PricebookEntryId = prcBookEntryListToInsert[3].Id,
            Net_Results__c = 20,
            Quantity = 100,
            UnitPrice = 12,Eligible_for_Sales_Incentives__c='Yes',
            Disposition_Other_Buy_Up_Programs__c='Sold',
            Submit_for_sales_incentives__c=true,Will_Sales_Incentive_be_split__c='Yes',
            Sales_Person_1__c=userListToInsert[0].Id,Sales_Person_2__c=userListToInsert[3].Id,
            Sales_Person_1_split_percentage__c=60,Sales_Person_2_split_percentage__c=40,VPCR_RVP__c=userListToInsert[2].Id
        ));
        
        OppLineItemListToInsert.add(new OpportunityLineItem(
            OpportunityId = OppLstToInsert[1].Id,                     
            PricebookEntryId = prcBookEntryListToInsert[4].Id,
            Net_Results__c = 20,
            Quantity = 100,
            UnitPrice = 12,Eligible_for_Sales_Incentives__c='Yes',
            Disposition_Other_Buy_Up_Programs__c='Sold',
            Submit_for_sales_incentives__c=true,Will_Sales_Incentive_be_split__c='Yes',
            Sales_Person_1__c=userListToInsert[0].Id,Sales_Person_2__c=userListToInsert[3].Id,
            Sales_Person_1_split_percentage__c=60,Sales_Person_2_split_percentage__c=40,VPCR_RVP__c=userListToInsert[2].Id
        ));
        
        OppLineItemListToInsert.add(new OpportunityLineItem(
            OpportunityId = OppLstToInsert[1].Id,                     
            PricebookEntryId = prcBookEntryListToInsert[5].Id,
            Net_Results__c = 20,
            Quantity = 100,
            UnitPrice = 12,Eligible_for_Sales_Incentives__c='Yes',
            Disposition_Other_Buy_Up_Programs__c='Sold',
            Submit_for_sales_incentives__c=true,Will_Sales_Incentive_be_split__c='Yes',
            Sales_Person_1__c=userListToInsert[0].Id,Sales_Person_2__c=userListToInsert[3].Id,
            Sales_Person_1_split_percentage__c=60,Sales_Person_2_split_percentage__c=40,VPCR_RVP__c=userListToInsert[2].Id
        ));
       
        insert OppLineItemListToInsert;
        
        
        
    }
    
    @isTest static void testGetTemplateInXML(){   
        Test.startTest();
        GrowthIncentiveCompensationController.getTemplateInXML('CM SCE');
        GrowthIncentiveCompensationController.getTemplateInXML('CD SVP');
        GrowthIncentiveCompensationController.getTemplateInXML('Specialty Benefits SVP');
        GrowthIncentiveCompensationController.getTemplateInXML('CM VPCR/RVP');
        Test.stopTest();
    }
    
    @isTest static void testGetGrowthData(){  
        Test.startTest();
        User cmsceRoleUser = [Select Id from User where Username = 'uhgCMSCETest3r@crmit.com' LIMIT 1]; 
        System.runAs(cmsceRoleUser) {
            GrowthIncentiveCompensationController.getGrowthData('CM SCE','','Opportunity.Account.Name','ASC');
            GrowthIncentiveCompensationController.getGrowthData('CM SCE','','Product2.Name','ASC');
            GrowthIncentiveCompensationController.getGrowthData('CM SCE','','Product2.Name','DESC');
        }
        User specialitySVPRoleUser = [Select Id from User where Username = 'uhgSpecialtyTest3r@crmit.com' LIMIT 1]; 
        System.runAs(specialitySVPRoleUser) {
            GrowthIncentiveCompensationController.getGrowthData('Specialty Benefits SVP','IY19, 1/1/20','Product2.Name','ASC');
        }
        User cdsvpRoleUser = [Select Id from User where Username = 'uhgCDSVPTest3r@crmit.com' LIMIT 1]; 
        System.runAs(cdsvpRoleUser) {
            GrowthIncentiveCompensationController.getGrowthData('CD SVP','IY19, 1/1/20','Product2.Name','DESC');
        }
        Test.stopTest();
    }
    
    
    @isTest static void testGetGrowthDataOfCMVPCRRVP(){ 
        Account acc=[Select Name,Owner.Name from Account where Name='CRMIT IC Statement Test Account' LIMIT 1];
        Test.startTest();
        User cmvpcrrvpRoleUser = [Select Id from User where Username = 'uhgVPCTest3rR@crmit.com' LIMIT 1]; 
        System.runAs(cmvpcrrvpRoleUser) {
            GrowthIncentiveCompensationController.getGrowthDataOfCMVPCRRVP('','Opportunity.Account.Name','ASC','',null,null,null);
            GrowthIncentiveCompensationController.getGrowthDataOfCMVPCRRVP('','Product2.Name','ASC','Current',acc.Owner.Name,null,null);
            GrowthIncentiveCompensationController.getGrowthDataOfCMVPCRRVP('IY19, 1/1/20','Opportunity.Account.Name','ASC','',null,acc.Name,null);
            GrowthIncentiveCompensationController.getGrowthDataOfCMVPCRRVP('','Product2.Name','DESC','Previous',null,null,Date.newInstance(2019, 4, 12));
        }
        Test.stopTest();
    }
    
    
}