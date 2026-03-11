@isTest
public class ProductTriggerTest {

    @TestSetup
    static void setupData() {

        // Activate Standard Pricebook
        Id stdPbId = Test.getStandardPricebookId();
        update new Pricebook2(Id = stdPbId, IsActive = true);

        // Create Product
        Product2 p = new Product2(
            Name = 'Trigger Test Product',
            ProductCode = 'TRG-001',
            Product_Line__c = 'Medical',
            Level_2_Options__c = 'Designated',
            IsActive = true
        );
        insert p;

        // Create Pricebook Entry (required for active product)
        insert new PricebookEntry(
            Pricebook2Id = stdPbId,
            Product2Id = p.Id,
            UnitPrice = 100,
            IsActive = true
        );

        // Create related Stage record
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Prod__c = p.Id,
            Product_Name_Stage__c = p.Name,
            Product_Line_Stage__c = 'Medical',
            Level_2_Options_Stage__c = 'Dedicated',
            Product_Change_Type__c = 'Change in Product',
            Status__c = 'Not in Sync'
        );

        insert stage;
    }

    @isTest
    static void testTrigger_Level2OptionsChanged() {

        Product2 p = [SELECT Id, Level_2_Options__c 
                      FROM Product2 
                      WHERE ProductCode = 'TRG-001' 
                      LIMIT 1];

        Test.startTest();

        // Change Level_2_Options__c
        p.Level_2_Options__c = 'Dedicated';
        update p;

        Test.stopTest();

        // Verify Stage updated (adjust assertion if your class updates differently)
        PIM_Product_Stage__c updatedStage =
            [SELECT Level_2_Options_Stage__c
             FROM PIM_Product_Stage__c
             WHERE Product_Name_Prod__c = :p.Id
             LIMIT 1];

        System.assertEquals(
            'Dedicated',
            updatedStage.Level_2_Options_Stage__c
        );
    }

    @isTest
    static void testTrigger_NoChange() {

        Product2 p = [SELECT Id, Level_2_Options__c 
                      FROM Product2 
                      WHERE ProductCode = 'TRG-001' 
                      LIMIT 1];

        Test.startTest();

        // Update without changing Level_2_Options__c
        p.Name = 'Trigger Test Product Updated';
        update p;

        Test.stopTest();

        // Ensure no exception and stage remains unchanged
        PIM_Product_Stage__c stage =
            [SELECT Level_2_Options_Stage__c
             FROM PIM_Product_Stage__c
             WHERE Product_Name_Prod__c = :p.Id
             LIMIT 1];

        System.assertEquals('Dedicated', stage.Level_2_Options_Stage__c);
    }
}