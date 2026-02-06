@IsTest
public class EBDBatchApexTest {

    /* =========================
       TEST SETUP
    ========================== */
    @testSetup
    static void setupData() {

        /* ---- Get CM Account Record Type ---- */
        Map<String, Schema.RecordTypeInfo> rtMap =
            Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName();

        Id cmRtId = rtMap.get('Existing_Client').getRecordTypeId();

        /* ---- Create CM Account ---- */
        Account acc = new Account(
            Name = 'Test CM Account12',Subtype__c ='National Accounts - East',
            RecordTypeId = cmRtId
        );
        insert acc;

        /* ---- Create 2025 EBD ---- */
        EBD__c ebd2025 = new EBD__c(
            Name = 'Test CM Account-2025',
            Company__c = acc.Id,
            Year__c = '2025'
        );
        insert ebd2025;

        /* ---- Create Child Records ---- */

        insert new Entertainment__c(
            EBD__c = ebd2025.Id,
            Event__c = 'Client Dinner'
        );

        insert new Client_Priority__c(
            EBD__c = ebd2025.Id,
            Client_Priority__c = 'Cost Optimization'
        );

        insert new B2B__c(
            EBD__c = ebd2025.Id,
            Name = 'Medical Services'
        );

        insert new Advocacy__c(
            EBD__c = ebd2025.Id,
            Name = 'Advocacy Test'
        );

        insert new EBD_NPS__c(
            EBD__c = ebd2025.Id,
            Strategy__c = 'Affordability'
        );

        insert new Anticipated_Bid_Cycle_For_Major_Products__c(
            EBD__c = ebd2025.Id,
            Product__c = 'Medical'
        );
    }

    /* =========================
       TEST BATCH EXECUTION
    ========================== */
    @IsTest
    static void testEbdCloneBatch() {

        Test.startTest();

        EBDBatchApex batch = new EBDBatchApex();
        Database.executeBatch(batch, 1); // batch size 1 for easy debugging

        Test.stopTest();

        /* ---- Validate 2026 EBD ---- */
        List<EBD__c> ebd2026 = [
            SELECT Id, Name, Company__c, Year__c
            FROM EBD__c
            WHERE Year__c = '2026'
        ];

        System.assertEquals(
            1,
            ebd2026.size(),
            'One 2026 EBD should be created'
        );

        /* ---- Validate Child Records ---- */
        Id newEbdId = ebd2026[0].Id;

        System.assertEquals(
            1,
            [SELECT COUNT() FROM Entertainment__c WHERE EBD__c = :newEbdId],
            'Entertainment should be cloned'
        );

        System.assertEquals(
            1,
            [SELECT COUNT() FROM Client_Priority__c WHERE EBD__c = :newEbdId],
            'Client Priority should be cloned'
        );

        System.assertEquals(
            1,
            [SELECT COUNT() FROM B2B__c WHERE EBD__c = :newEbdId],
            'B2B should be cloned'
        );

        System.assertEquals(
            1,
            [SELECT COUNT() FROM Advocacy__c WHERE EBD__c = :newEbdId],
            'Advocacy should be cloned'
        );

        System.assertEquals(
            1,
            [SELECT COUNT() FROM EBD_NPS__c WHERE EBD__c = :newEbdId],
            'NPS should be cloned'
        );

        System.assertEquals(
            1,
            [SELECT COUNT() FROM Anticipated_Bid_Cycle_For_Major_Products__c
             WHERE EBD__c = :newEbdId],
            'Anticipated Bid Cycle should be cloned'
        );
    }
}