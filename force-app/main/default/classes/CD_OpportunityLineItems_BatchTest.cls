@isTest
public class CD_OpportunityLineItems_BatchTest {
    static testmethod void cmOppLineItemBatchTestMethod(){
                
        Id cmAdminId = [select Id, Name from UserRole where Name = 'CRM Administrator' limit 1].id;
        Id userProfileId= [select Id, Name from Profile where Name = 'Standard User' limit 1].id;
        List<User> testUserRecords = new list<User>();
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs2', Email = 'test22.user22@asdf.com', Username = 'test22.user22@asdf.com',
                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmAdminId,
                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US'));
        insert testUserRecords;
        
        User testUser = testUserRecords[0];
        System.runAs(testUser){                          
       
            List<Product2> prodList = new List<Product2>(); 
            prodList.add(new Product2(Name = 'Total', Product_Line__c= 'Medical',Distribution_Type_Flag__c= false ,Family='Traditional',Considered_For_StepWise_Integration__c = 'Yes')); 
            prodList.add(new Product2(Name = 'Test Med Prod', Product_Line__c= 'Medical',Distribution_Type_Flag__c= false ,Family='Traditional',Considered_For_StepWise_Integration__c = 'Yes'));            
            prodList.add(new Product2(Name = 'Test Other Prod', Product_Line__c= 'Other',Distribution_Type_Flag__c= false ,Family='Traditional',Considered_For_StepWise_Integration__c = 'Yes'));
            prodList.add(new Product2(Name = 'Test Dental Prod', Product_Line__c= 'Dental',Distribution_Type_Flag__c= false ,Family='Traditional',Considered_For_StepWise_Integration__c = 'Yes'));
            prodList.add(new Product2(Name = 'Total', Product_Line__c= 'Dental',Distribution_Type_Flag__c= false ,Family='Traditional',Considered_For_StepWise_Integration__c = 'Yes')); 
            insert prodList;                  
    
            List<PricebookEntry> standardPricebookEntryList = new List<PricebookEntry>();
            Id PricebookId = Test.getStandardPricebookId();
            standardPricebookEntryList.add(new PricebookEntry(Pricebook2Id = PricebookId, Product2Id = prodList[0].Id,UnitPrice = 10000, IsActive = true));
            standardPricebookEntryList.add(new PricebookEntry(Pricebook2Id = PricebookId, Product2Id = prodList[1].Id,UnitPrice = 10000, IsActive = true));
            standardPricebookEntryList.add(new PricebookEntry(Pricebook2Id = PricebookId, Product2Id = prodList[2].Id,UnitPrice = 10000, IsActive = true));
            standardPricebookEntryList.add(new PricebookEntry(Pricebook2Id = PricebookId, Product2Id = prodList[3].Id,UnitPrice = 10000, IsActive = true));
            standardPricebookEntryList.add(new PricebookEntry(Pricebook2Id = PricebookId, Product2Id = prodList[4].Id,UnitPrice = 10000, IsActive = true));
            insert standardPricebookEntryList;
                
                
            List<Account> accCDList = new List<Account>();        
            accCDList.add(new Account(Name='testAccount2',Subtype__c ='Prospect',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()));        
            insert accCDList;        
                                    
            List<Opportunity> opportunityList = new List<Opportunity>();        
            opportunityList.add(new Opportunity(Name = 'Test Opportunity21',Comments_Last_Modified__c = System.now(),
                                                AccountId = accCDList[0].Id,Status__c = 'Open',Comments__c = 'Comments on CM VPCR/RVP',
                                                Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP',EffectiveDate__c = System.Today()
                                                ,Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', Expected_Date_of_RFP__c = system.today(),
                                                Is_There_Existing_Membership_at_Risk__c  = 'No',Product_Type_Involved_in_Opp__c = 'Medical',
                                                CloseDate = System.Today(),Disposition_Medical__c = 'Closed Emerging Risk',CM_VPCR_RVP__c = testUser.Id ,
                                                Has_a_Formal_RFP_Been_Issued__c ='No',StageName = 'Qualification',Sales_Stage_Medical__c = 'Notified',
												Closed_Reason_1_Medical__c='Dead',Existing_Members_Risk_Outcome_Medical__c = 'Retained', Member_Size_Scoring_Medical__c= '	N/A',		                                                
                                                RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId()));   
             opportunityList.add(new Opportunity(Name = 'Test Opportunity22',Comments_Last_Modified__c = System.now(),
                                                AccountId = accCDList[0].Id,Status__c = 'Open',Comments__c = 'Comments on CM VPCR/RVP',
                                                Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP',EffectiveDate__c = System.Today()
                                                ,Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', Expected_Date_of_RFP__c = system.today(),
                                                Is_There_Existing_Membership_at_Risk__c  = 'No',Product_Type_Involved_in_Opp__c = 'Medical',
                                                CloseDate = System.Today(),Disposition_Medical__c ='Sold',CM_VPCR_RVP__c = testUser.Id ,Member_Size_Scoring_Medical__c = '	N/A',
                                                Has_a_Formal_RFP_Been_Issued__c ='No',StageName = 'Qualification',Sales_Stage_Medical__c = 'Notified',
												Closed_Reason_1_Medical__c='Dead',Employees_in_the_Proposal_Medical__c=10,Members_in_the_Proposal_Medical__c=10,
                                                Members_QUOTED_in_the_Proposal_Medical__c = 10,Proposal_Due_Date_Medical__c = System.Today(),
                                                Proposal_Received_Date_Medical__c = System.today(), Existing_Members_Risk_Outcome_Medical__c = 'Retained',
                                                RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId()));
            opportunityList.add(new Opportunity(Name = 'Test Opportunity23',Comments_Last_Modified__c = System.now(),
                                                AccountId = accCDList[0].Id,Status__c = 'Open',Comments__c = 'Comments on CM VPCR/RVP',
                                                Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP',EffectiveDate__c = System.Today()
                                                ,Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', Expected_Date_of_RFP__c = system.today(),
                                                Is_There_Existing_Membership_at_Risk__c  = 'No',Product_Type_Involved_in_Opp__c = 'Medical',
                                                CloseDate = System.Today(),Disposition_Medical__c ='Dead',CM_VPCR_RVP__c = testUser.Id ,Member_Size_Scoring_Medical__c = '	N/A',
                                                Has_a_Formal_RFP_Been_Issued__c ='No',StageName = 'Qualification',Sales_Stage_Medical__c = 'Proposal',
												Closed_Reason_1_Medical__c='Dead',Employees_in_the_Proposal_Medical__c= 10,Members_in_the_Proposal_Medical__c=10,
                                                Members_QUOTED_in_the_Proposal_Medical__c= 10,Proposal_Due_Date_Medical__c = System.Today(), Trending_Medical__c= 'Positive (for Emerging Risk)',
                                                Proposal_Received_Date_Medical__c = System.today(),Existing_Members_Risk_Outcome_Medical__c='Retained',
                                                RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId()));
            
            opportunityList.add(new Opportunity(Name = 'Test Opportunity24',Comments_Last_Modified__c = System.now(),
                                                AccountId = accCDList[0].Id,Status__c = 'Open',Comments__c = 'Comments on CM VPCR/RVP',
                                                Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP',EffectiveDate__c = System.Today()
                                                ,Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', Expected_Date_of_RFP__c = system.today(),
                                                Is_There_Existing_Membership_at_Risk__c  = 'No',Product_Type_Involved_in_Opp__c = 'Dental',
                                                CloseDate = System.Today(),Disposition_Dental__c ='Dead',CM_VPCR_RVP__c = testUser.Id ,
                                                Date_the_Dental_Quote_is_Needed_from_UW__c =System.today(),
                                                Has_a_Formal_RFP_Been_Issued__c ='No',StageName = 'Qualification',Sales_Stage_Dental__c = 'Proposal',
												Closed_Reason_1_Dental__c='Dead',Employees_in_the_Proposal_Dental__c= 10,Proposal_Due_Date_Dental__c = System.Today(),
                                                Proposal_Received_Date_Dental__c = System.today(),Existing_Members_Risk_Outcome_Dental__c='Retained',
                                                RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId()));
            
            opportunityList.add(new Opportunity(Name = 'Test Opportunity25',Comments_Last_Modified__c = System.now(),
                                                AccountId = accCDList[0].Id,Status__c = 'Open',Comments__c = 'Comments on CM VPCR/RVP',
                                                Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP',EffectiveDate__c = System.Today()
                                                ,Does_this_Oppty_Risk_Involve_Exchanges__c = 'No', Expected_Date_of_RFP__c = system.today(),
                                                Is_There_Existing_Membership_at_Risk__c  = 'No',Product_Type_Involved_in_Opp__c = 'Other',
                                                CloseDate = System.Today(),Disposition_Other__c ='Dead Lead',CM_VPCR_RVP__c = testUser.Id ,
                                                Has_a_Formal_RFP_Been_Issued__c ='No',StageName = 'Qualification',Sales_Stage_Other__c = 'Transfer In/Out',
												Closed_Reason_1_Other_Buy_Up_Programs__c ='Dead',Proposal_Due_Date_Other__c = System.Today(),
                                                Proposal_Received_Date_Other__c = System.today(),
                                                RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId()));
            insert opportunityList;             

            List<OpportunityLineItem> opportunityLineItemsList = new List<OpportunityLineItem>();  
            opportunityLineItemsList.add(new opportunityLineItem(OpportunityId=opportunityList[0].Id, Existing_Members_Retained__c=10,
                                         Existing_Members_Retained_Pinnacle__c = 20, PricebookEntryId = standardPricebookEntryList[1].Id,
                                         UnitPrice=100, Quantity=1, Annual_Revenue_Premium__c = 10, Estimated_Additional_New_Members__c = 100, 
                                      	 Existing_Members_Involved_in_the_Bid__c = 10, Existing_Membership_at_Risk__c =20, Funding_Type__c = 'Fully Insured',
                                         Members_Quoted_in_the_Proposal__c = 30, Net_Results__c = 10, Sold_Retained_Members__c = 10,
                                         Mbrs_Transferred_From_To_Another_Segment__c = 10, Copy_the_Membership_from_Medical__c = false ,
                                         Disposition_Other_Buy_Up_Programs__c = 'Closed Emerging Risk',Sales_Stage__c ='Medical')) ;
            
            opportunityLineItemsList.add(new opportunityLineItem(OpportunityId=opportunityList[1].Id, Existing_Members_Retained__c=10,
                                         Existing_Members_Retained_Pinnacle__c = 20, PricebookEntryId = standardPricebookEntryList[1].Id,
                                         UnitPrice=100, Quantity=1, Annual_Revenue_Premium__c = 10, Estimated_Additional_New_Members__c = 100, 
                                      	 Existing_Members_Involved_in_the_Bid__c = 10, Existing_Membership_at_Risk__c =20, Funding_Type__c = 'Fully Insured',
                                         Members_Quoted_in_the_Proposal__c = 30, Net_Results__c = 10, Sold_Retained_Members__c = 10,
                                         Mbrs_Transferred_From_To_Another_Segment__c = 10, Copy_the_Membership_from_Medical__c = false ,
                                         Disposition_Other_Buy_Up_Programs__c = 'Closed Emerging Risk',Sales_Stage__c ='Medical')) ;
            
            opportunityLineItemsList.add(new opportunityLineItem(OpportunityId=opportunityList[0].Id, Existing_Members_Retained__c=10,
                                         Existing_Members_Retained_Pinnacle__c = 20, PricebookEntryId = standardPricebookEntryList[2].Id,
                                         UnitPrice=100, Quantity=1, Annual_Revenue_Premium__c = 10, Estimated_Additional_New_Members__c = 100, 
                                      	 Existing_Members_Involved_in_the_Bid__c = 10, Existing_Membership_at_Risk__c =20, Funding_Type__c = 'Fully Insured',
                                         Members_Quoted_in_the_Proposal__c = 30, Net_Results__c = 10, Sold_Retained_Members__c = 10,
                                         Mbrs_Transferred_From_To_Another_Segment__c = 10, Copy_the_Membership_from_Medical__c = false ,
                                         Disposition_Other_Buy_Up_Programs__c = 'Closed Emerging Risk',Sales_Stage__c ='Other')) ;
            insert opportunityLineItemsList ;
        }
        Test.startTest();
        CD_OpportunityLineItems_Batch cdOppLineItemBatch = new CD_OpportunityLineItems_Batch();
        Database.executeBatch(cdOppLineItemBatch);
        Test.stopTest();        
    }       
}