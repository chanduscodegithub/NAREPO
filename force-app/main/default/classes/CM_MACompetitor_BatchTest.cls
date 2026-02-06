@isTest
public class CM_MACompetitor_BatchTest {
    static testmethod void cmOppLineItemBatchTestMethod(){
                
        Id cmAdminId = [select Id, Name from UserRole where Name = 'CRM Administrator' limit 1].id;
        Id userProfileId= [select Id, Name from Profile where Name = 'Standard User' limit 1].id;
        List<User> testUserRecords = new list<User>();
        testUserRecords.add(new user(LastName = 'Test3',FirstName='User3', Alias = 'tUs3', Email = 'test33.user33@asdf.com', Username = 'test33.user133@asdf.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmAdminId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US'));
        insert testUserRecords;
        
        User testUser = testUserRecords[0];
        System.runAs(testUser){                          
       
            List<Product2> productList = new List<Product2>();
            productList.add(new Product2(Name = 'Total', Product_Line__c= 'Medical',Distribution_Type_Flag__c= false ,Family='Traditional',Considered_For_StepWise_Integration__c = 'Yes')); 
            productList.add(new Product2(Name = 'Total', Product_Line__c= 'Dental',Distribution_Type_Flag__c= false ,Family='Traditional',Considered_For_StepWise_Integration__c = 'Yes')); 
            productList.add(new Product2(Name = 'Total', Product_Line__c= 'Pharmacy',Distribution_Type_Flag__c= false ,Family='Traditional',Considered_For_StepWise_Integration__c = 'Yes')); 
            productList.add(new Product2(Name = 'Total', Product_Line__c= 'Vision',Distribution_Type_Flag__c= false ,Family='Traditional',Considered_For_StepWise_Integration__c = 'Yes'));             
            insert productList;                 
    
             List<PricebookEntry> standardPricebookEntryList = new List<PricebookEntry>();
            Id PricebookId = Test.getStandardPricebookId();
            standardPricebookEntryList.add(new PricebookEntry(Pricebook2Id = PricebookId, Product2Id = productList[0].Id,UnitPrice = 10000, IsActive = true));            
            standardPricebookEntryList.add(new PricebookEntry(Pricebook2Id = PricebookId, Product2Id = productList[1].Id,UnitPrice = 10000, IsActive = true));
            standardPricebookEntryList.add(new PricebookEntry(Pricebook2Id = PricebookId, Product2Id = productList[2].Id,UnitPrice = 10000, IsActive = true));
            standardPricebookEntryList.add(new PricebookEntry(Pricebook2Id = PricebookId, Product2Id = productList[3].Id,UnitPrice = 10000, IsActive = true));            
            insert standardPricebookEntryList;
                
            List<Account> accList = new List<Account>();        
            accList.add(new Account(Name='National Accounts',Subtype__c ='Competitor',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId())); 
            accList.add(new Account(Name='Test Competitor1',Subtype__c ='Competitor',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
            accList.add(new Account(Name='Total',Subtype__c ='Competitor',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));   
            accList.add(new Account(Name='Test CM Acc',Subtype__c ='National Accounts - East',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()));        
            accList.add(new Account(Name='Total',Subtype__c ='National Accounts - East',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()));                                
            insert accList;        
            
            List<Opportunity> opportunityList = new List<Opportunity>();     
            
            opportunityList.add(new Opportunity(Name = 'Test Opportunity31',
                                                AccountId = accList[3].Id,
                                                RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
                                                Product_Type_Involved_in_Opp__c = 'Medical;Pharmacy;Dental;Vision;Other Buy Up Programs',
                                                Anticipated_Actual_Close_Date_Medical__c =System.Today(),
                                                Anticipated_Actual_Close_Date_Dental__c =System.Today(),
                                                Anticipated_Actual_Close_Date_Pharmacy__c =System.Today(),
                                                Anticipated_Actual_Close_Date_Vision__c =System.Today(),
                                                Anticipated_Actual_Close_Date_Other__c =System.Today(),                                                
                                                Status__c = 'Open',
                                                StageName = 'Qualification',
                                                EffectiveDate__c = System.Today(),
                                                Expected_Date_of_RFP__c = system.today(),
                                                Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
                                                Has_a_Formal_RFP_Been_Issued__c ='No',
                                                Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP',
                                                Is_There_Existing_Membership_at_Risk__c  = 'No',   
                                                CloseDate = System.Today(),                                                
                                                Sales_Stage_Medical__c = 'Lead',
                                                Sales_Stage_Pharmacy__c = 'Notified',
                                                Sales_Stage_Vision__c = 'Lead',
                                                Sales_Stage_Dental__c = 'Proposal',
                                                Sales_Stage_Other__c = 'Lead',                                
                                                Disposition_Medical__c = 'Closed Emerging Risk',
                                				Disposition_Pharmacy__c = 'Closed Emerging Risk',
                                				Disposition_Dental__c = 'Sold',
                                				Disposition_Vision__c = 'Sold',
                                                Disposition_Other__c = 'Sold',
                                                Closed_Reason_1_Pharmacy__c = 'Admin: Acct Mgmt',
                                                Closed_Reason_1_Dental__c = 'Admin: Acct Mgmt',
                                                Closed_Reason_1_Vision__c = 'Admin: Acct Mgmt',
                                                Progression_Sales_Stage_Pharmacy__c = 'NBEA_Proposal_Notified',
                                                Proposal_Due_Date_Dental__c = System.today(),
                                                Proposal_Due_Date_Vision__c = System.today(),
                                                Proposal_Received_Date_Vision__c = System.today(),
                                                Proposal_Received_Date_Dental__c = System.today(),                                                
												Date_the_Vision_Quote_is_Needed_from_UW__c = Date.today(),
												Employees_in_the_Proposal_Vision__c = 10,
                                                Date_the_Dental_Quote_is_Needed_from_UW__c = System.today(),
                                                Employees_in_the_Proposal_Dental__c = 10,                                                                                             
                                                Comments_Last_Modified__c = System.now(),                                                
                                                Comments__c = 'Comments on CM VPCR/RVP',                                                
                                                Closed_Reason_1_Medical__c='Dead',
                                                Employees_in_the_Proposal_Medical__c= 10,
                                                Members_in_the_Proposal_Medical__c= 0,
                                                Members_QUOTED_in_the_Proposal_Medical__c= 10,                                                        
                                                Existing_Members_Risk_Outcome_Medical__c='Retained'));
            
            opportunityList.add(new Opportunity(Name = 'Test Opportunity32',
                                                AccountId = accList[3].Id,
                                                RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
                                                Product_Type_Involved_in_Opp__c = 'Medical;Pharmacy;Dental;Vision;Other Buy Up Programs',
                                                Anticipated_Actual_Close_Date_Medical__c =System.Today(),
                                                Anticipated_Actual_Close_Date_Dental__c =System.Today(),
                                                Anticipated_Actual_Close_Date_Pharmacy__c =System.Today(),
                                                Anticipated_Actual_Close_Date_Vision__c =System.Today(),
                                                Anticipated_Actual_Close_Date_Other__c =System.Today(),                                                
                                                Status__c = 'Open',
                                                StageName = 'Qualification',
                                                EffectiveDate__c = System.Today(),
                                                Expected_Date_of_RFP__c = system.today(),
                                                Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
                                                Has_a_Formal_RFP_Been_Issued__c ='No',                                                
                                                Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP',
                                                Is_There_Existing_Membership_at_Risk__c  = 'No',   
                                                CloseDate = System.Today(),                                                
                                                Sales_Stage_Medical__c = 'Lead',
                                                Sales_Stage_Pharmacy__c = 'Lead',
                                                Sales_Stage_Vision__c = 'Proposal',
                                                Sales_Stage_Dental__c = 'Notified',
                                                Sales_Stage_Other__c = 'Lead',
                                                Progression_Sales_Stage_Dental__c = 'NBEA_Lead_Notified' ,
                                                Proposal_Due_Date_Dental__c = System.today(),
                                                Proposal_Due_Date_Vision__c = System.today(),
                                                Proposal_Received_Date_Vision__c = System.today(),
                                                Proposal_Received_Date_Dental__c = System.today(),
                                                Closed_Reason_1_Pharmacy__c = 'Admin: Acct Mgmt',
                                                Closed_Reason_1_Dental__c = 'Admin: Acct Mgmt',
                                                Closed_Reason_1_Vision__c = 'Admin: Acct Mgmt',
                                                Date_the_Vision_Quote_is_Needed_from_UW__c = Date.today(),
												Employees_in_the_Proposal_Vision__c = 10,
                                                Date_the_Dental_Quote_is_Needed_from_UW__c = System.today(),
                                                Employees_in_the_Proposal_Dental__c = 10,
                                                Disposition_Medical__c = 'Sold',
                                				Disposition_Pharmacy__c = 'Sold',
                                				Disposition_Dental__c = 'Closed Emerging Risk',
                                				Disposition_Vision__c = 'Sold',
                                                Disposition_Other__c = 'Sold',                                                
                                                Comments_Last_Modified__c = System.now(),                                                
                                                Comments__c = 'Comments on CM VPCR/RVP',                                                
                                                Closed_Reason_1_Medical__c='Dead',
                                                Employees_in_the_Proposal_Medical__c= 10,
                                                Members_in_the_Proposal_Medical__c= 0,
                                                Members_QUOTED_in_the_Proposal_Medical__c= 10,                                                        
                                                Existing_Members_Risk_Outcome_Medical__c='Retained'));
            
            insert opportunityList;                                
            
           List<OpportunityLineItem> opportunityLineItemsList = new List<OpportunityLineItem>();  
            OpportunityLineItem oppLineItem1 = new OpportunityLineItem();            
            oppLineItem1.OpportunityId=opportunityList[0].Id;
            oppLineItem1.Product2Id = productList[0].Id;            
            oppLineItem1.Existing_Members_Retained__c=10;
            oppLineItem1.Existing_Members_Retained_Pinnacle__c = 20;
            oppLineItem1.PricebookEntryId = standardPricebookEntryList[0].Id;
            oppLineItem1.UnitPrice=100;
            oppLineItem1.Quantity=1;
            oppLineItem1.Annual_Revenue_Premium__c = 10;
            oppLineItem1.Estimated_Additional_New_Members__c = 100;
            oppLineItem1.Existing_Members_Involved_in_the_Bid__c = 10;
            oppLineItem1.Existing_Membership_at_Risk__c =20;
            oppLineItem1.Funding_Type__c ='Fully Insured';
            oppLineItem1.Members_Quoted_in_the_Proposal__c = 30;
            oppLineItem1.Net_Results__c = 10;
            oppLineItem1.Sold_Retained_Members__c = 10;
            oppLineItem1.Mbrs_Transferred_From_To_Another_Segment__c = 10;
            oppLineItem1.Copy_the_Membership_from_Medical__c = false ;
            oppLineItem1.Disposition_Other_Buy_Up_Programs__c = 'Closed Emerging Risk';
            oppLineItem1.Sales_Stage__c ='Medical';
            opportunityLineItemsList.add(oppLineItem1);           
            
            OpportunityLineItem oppLineItem2 = new OpportunityLineItem();
            oppLineItem2.OpportunityId=opportunityList[0].Id;
            oppLineItem2.Product2Id = productList[1].Id;
            oppLineItem2.Existing_Members_Retained__c=10;
            oppLineItem2.Existing_Members_Retained_Pinnacle__c = 20;
            oppLineItem2.PricebookEntryId = standardPricebookEntryList[1].Id;
            oppLineItem2.UnitPrice=100;
            oppLineItem2.Quantity=1;
            oppLineItem2.Annual_Revenue_Premium__c = 10;
            oppLineItem2.Estimated_Additional_New_Members__c = 100;
            oppLineItem2.Existing_Members_Involved_in_the_Bid__c = 10;
            oppLineItem2.Existing_Membership_at_Risk__c =20;
            oppLineItem2.Funding_Type__c ='Fully Insured';
            oppLineItem2.Members_Quoted_in_the_Proposal__c = 30;
            oppLineItem2.Net_Results__c = 10;
            oppLineItem2.Sold_Retained_Members__c = 10;
            oppLineItem2.Mbrs_Transferred_From_To_Another_Segment__c = 10;
            oppLineItem2.Disposition_Other_Buy_Up_Programs__c = 'Closed Emerging Risk';
            oppLineItem2.Sales_Stage__c ='Dental';
            opportunityLineItemsList.add(oppLineItem2);
                        
            OpportunityLineItem oppLineItem3 = new OpportunityLineItem();            
            oppLineItem3.OpportunityId = opportunityList[1].Id;
            oppLineItem3.Product2Id = productList[2].Id;
            oppLineItem3.Existing_Members_Retained__c=10;
            oppLineItem3.Existing_Members_Retained_Pinnacle__c = 20;
            oppLineItem3.PricebookEntryId = standardPricebookEntryList[2].Id;
            oppLineItem3.UnitPrice=100;
            oppLineItem3.Quantity=1;
            oppLineItem3.Annual_Revenue_Premium__c = 10;
            oppLineItem3.Estimated_Additional_New_Members__c = 100;
            oppLineItem3.Existing_Members_Involved_in_the_Bid__c = 10;
            oppLineItem3.Existing_Membership_at_Risk__c =20;
            oppLineItem3.Funding_Type__c ='Fully Insured';
            oppLineItem3.Members_Quoted_in_the_Proposal__c = 30;
            oppLineItem3.Net_Results__c = 10;
            oppLineItem3.Sold_Retained_Members__c = 10;
            oppLineItem3.Mbrs_Transferred_From_To_Another_Segment__c = 10;
            oppLineItem3.Disposition_Other_Buy_Up_Programs__c = 'Closed Emerging Risk';
            oppLineItem3.Sales_Stage__c ='Pharmacy';
            opportunityLineItemsList.add(oppLineItem3);                       
            
            insert opportunityLineItemsList ;
            
           List< MA_Competitor__c> maCompList = new List< MA_Competitor__c>();
            maCompList.add(new MA_Competitor__c(Competitor_Account__c = accList[2].Id, Opportunity__c = opportunityList[0].Id, Competitor_Classification__c = 'Medical',Number_of_Members_Held__c = 10,Number_of_Members_Awarded__c = 20)); 
            maCompList.add(new MA_Competitor__c(Competitor_Account__c = accList[0].Id, Opportunity__c = opportunityList[0].Id, Competitor_Classification__c = 'Medical')); 
            maCompList.add(new MA_Competitor__c(Competitor_Account__c = accList[2].Id, Opportunity__c = opportunityList[1].Id, Competitor_Classification__c = 'Dental'));
            maCompList.add(new MA_Competitor__c(Competitor_Account__c = accList[0].Id, Opportunity__c = opportunityList[1].Id, Competitor_Classification__c = 'Dental',Number_of_Members_Held__c = 10,Number_of_Members_Awarded__c = 20));
            maCompList.add(new MA_Competitor__c(Competitor_Account__c = accList[1].Id, Opportunity__c = opportunityList[0].Id, Competitor_Classification__c = 'Medical',Number_of_Members_Held__c = 10,Number_of_Members_Awarded__c = 20)); 
            maCompList.add(new MA_Competitor__c(Competitor_Account__c = accList[0].Id, Opportunity__c = opportunityList[0].Id, Competitor_Classification__c = 'Other',Number_of_Members_Held__c = 10,Number_of_Members_Awarded__c = 20));
            insert maCompList;
        }
        Test.startTest();
        CM_MACompetitors_Batch cmMaCompetitorBatch = new CM_MACompetitors_Batch();
        Database.executeBatch(cmMaCompetitorBatch);
        Test.stopTest();        
    }   
}