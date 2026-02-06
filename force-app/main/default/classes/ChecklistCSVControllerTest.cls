@isTest
public class ChecklistCSVControllerTest {
    
    @testSetup
    static void setupData() {
        // Create Account
        Account account = new Account();
        account.Name = 'Test CM Account1';
        account.Subtype__c ='Prospect';
        account.EID_Name__c = 'TestEIDName';
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert account;
        
        Opportunity opp3 =  new Opportunity(
            AccountId = account.Id,
            Name = 'Test Opportunity insert Record 3',
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Medical,Vision,Pharmacy,Dental,Vision,Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            StageName='Qualification',
            CloseDate=System.today(),
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            Platforms_Sold__c = 'SUREST',
            Sales_Stage_Medical__c = 'Notified', Disposition_Medical__c = 'Sold', Anticipated_Actual_Close_Date_Medical__c= Date.newInstance(2020, 5, 7), Closed_Reason_1_Medical__c= 'Network: Access',
            Sales_Stage_Dental__c = 'Notified', Disposition_Dental__c = 'Sold', Anticipated_Actual_Close_Date_Dental__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Dental__c = 'Network: Access',
            Sales_Stage_Vision__c = 'Notified', Disposition_Vision__c = 'Sold', Anticipated_Actual_Close_Date_Vision__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Vision__c= 'Network: Access',
            Sales_Stage_Pharmacy__c = 'Notified', Disposition_Pharmacy__c = 'Sold', Anticipated_Actual_Close_Date_Pharmacy__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Pharmacy__c= 'Network: Access',
            Sales_Stage_Other__c = 'Notified', Anticipated_Actual_Close_Date_Other__c = Date.newInstance(2020, 5, 7), Closed_Reason_1_Other_Buy_Up_Programs__c= 'Network: Access'
        );
       insert opp3;
        

        

        // Create Policy
        Policy_Information__c pol = new Policy_Information__c(
            Name = 'PN-123',
            Policy__c = 'POLICY-NAME',
            Company__c = account.Id,
            Surest__c = true,
            Policy_Type__c = 'Medical',
            Policy_Status__c = 'Active'
        );
        insert pol;

        // Create Sold Case Checklist
        Sold_Case_Checklist__c sold = new Sold_Case_Checklist__c(
            CPW__c = true,
            Membership_Activity__c = opp3.Id
        );
        insert sold;

        // Create Renewal Checklist
        Renewal_Checklist__c renewal = new Renewal_Checklist__c(
            CPW__c = true,
            Company__c = account.Id
        );
        insert renewal;
       
    }

    @isTest
    static void testCsvGeneration() {
        Test.startTest();
        String csvContent = ChecklistCSVController.getCsvContentLwc();
        Test.stopTest();

        System.assertNotEquals(null, csvContent, 'CSV should not be null');
        System.assert(csvContent.contains('Customer EID Name'), 'CSV should contain headers');
        System.assert(csvContent.contains('TestEIDName'), 'CSV should contain the Account EID Name');
        System.assert(csvContent.contains('PN-123'), 'CSV should contain the policy number');
        System.assert(csvContent.contains('POLICY-NAME'), 'CSV should contain the policy name');
    }
}