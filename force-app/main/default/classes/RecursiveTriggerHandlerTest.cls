@IsTest
public class RecursiveTriggerHandlerTest {

    @testSetup
    static void setupData() {

       Account acc = new Account(
            Name = 'Test Account',
            Subtype__c ='Suspect',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Suspect').getRecordTypeId(),
            BusinessPressures__c = 'Initial Pressure',
            Comments__c = 'Initial Comment',
            Web_Address__c = 'https://initial.com',
            BillingCity = 'Bangalore'
        );
        insert acc;
        
         // ---------- Contact ----------
        Contact con = new Contact(
            FirstName = 'John',
            MiddleName = 'M',
            LastName = 'Doe',
            Salutation = 'Mr.',
            RecordTypeId = Schema.SObjectType.contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId(),
            Email = 'john@test.com',
            Phone = '1234567890',
            MailingStreet = '123 Main St',
            MailingCity = 'Bangalore',
            AccountId = acc.Id
        );
        insert con;

        Opportunity opp = new Opportunity(
            Name = 'Test Opportunity',
            AccountId = acc.Id,
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
            Product_Type_Involved_in_Opp__c = 'Medical,Vision,Pharmacy,Dental,Vision,Other',
            Has_a_Formal_RFP_Been_Issued__c = 'No',
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
            Is_There_Existing_Membership_at_Risk__c  = 'No',
            Is_Created_by_QA__c = true,
            EffectiveDate__c = Date.newInstance(2019, 4, 12),
            RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
            Expected_Date_of_RFP__c = System.today(),
            PrimaryConsultant__c = con.Id,
            Platforms_Sold__c = 'SUREST',
            Sales_Stage_Medical__c = 'Lead',Anticipated_Actual_Close_Date_Medical__c= Date.newInstance(2020, 5, 7), Closed_Reason_1_Medical__c= 'Network: Access'
        );
        insert opp;

       
        // ---------- Strategy Memo ----------
        Strategy_Memo__c memo = new Strategy_Memo__c(
            Membership_Activity__c = opp.Id
        );
        insert memo;
    }

    // --------------------------------------------------
    // POSITIVE TEST: Contact update syncs Strategy Memo
    // --------------------------------------------------
    @IsTest
    static void testContactAfterUpdate_UpdatesStrategyMemo() {

        Contact con = [
            SELECT Id,
                   FirstName,
                   MiddleName,
                   LastName,
                   Salutation,
                   Phone,
                   Email,
                   MailingStreet,
                   MailingCity,
                   MailingAddress
            FROM Contact
            LIMIT 1
        ];

        // Old snapshot
        Contact oldCon = con.clone(true, true, true, true);

        // Change mapped + name fields
        con.Phone = '9999999999';
        con.Email = 'updated@test.com';
        con.MailingStreet = '456 Updated St';
        con.MailingCity = 'Mumbai';
        con.FirstName = 'Johnny';

        Map<Id, Contact> oldMap = new Map<Id, Contact>{
            con.Id => oldCon
        };

        Test.startTest();
            update con;
            RecursiveTriggerHandler.afterUpdate(
                new List<Contact>{ con },
                oldMap
            );
        Test.stopTest();
}
    
}