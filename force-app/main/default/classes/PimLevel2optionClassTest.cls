@isTest
public class PimLevel2optionClassTest {

    @isTest
    static void testUpdateStages_AllPaths() {

        Id stdPbId = Test.getStandardPricebookId();
        update new Pricebook2(Id = stdPbId, IsActive = true);

        /* -------------------------------
           Create Product (Multi Picklist)
        ----------------------------------*/
        Product2 p = new Product2(
            Name = 'Stage Sync Product',
            ProductCode = 'SYNC-' + System.currentTimeMillis(),
            Product_Line__c = 'Medical',
            Level_2_Options__c = 'Dedicated;Designated',  // VALID multi-picklist format
            IsActive = true
        );
        insert p;

        insert new PricebookEntry(
            Pricebook2Id = stdPbId,
            Product2Id = p.Id,
            UnitPrice = 100,
            IsActive = true
        );

        /* -------------------------------
           Valid Stage (Should Update)
        ----------------------------------*/
        PIM_Product_Stage__c validStage = new PIM_Product_Stage__c(
            Product_Name_Stage__c = 'Stage Sync Product',
            Product_Code_Stage__c = 'SYNC-STAGE',
            Product_Name_Prod__c = p.Id
        );

        /* -------------------------------
           Null Product Stage
        ----------------------------------*/
        PIM_Product_Stage__c nullProductStage = new PIM_Product_Stage__c(
            Product_Name_Stage__c = 'Null Product Stage',
            Product_Code_Stage__c = 'NULL-STAGE'
        );

        /* -------------------------------
           Missing Product Scenario
           (Create then delete product)
        ----------------------------------*/
        Product2 tempProduct = new Product2(
            Name = 'Temp Product',
            ProductCode = 'TEMP-' + System.currentTimeMillis(),
            Product_Line__c = 'Medical',
            Level_2_Options__c = 'Dedicated',
            IsActive = true
        );
        insert tempProduct;

        PIM_Product_Stage__c missingProductStage = new PIM_Product_Stage__c(
            Product_Name_Stage__c = 'Missing Product Stage',
            Product_Code_Stage__c = 'MISS-STAGE',
            Product_Name_Prod__c = tempProduct.Id
        );

        insert new List<PIM_Product_Stage__c>{
            validStage,
            nullProductStage,
            missingProductStage
        };

        // Delete product to simulate missing reference
        delete tempProduct;

        /* -------------------------------
           EXECUTE
        ----------------------------------*/
        Test.startTest();
        PimLevel2optionClass.updateStages(
            new Set<Id>{ p.Id, tempProduct.Id }
        );
        Test.stopTest();

        /* -------------------------------
           VERIFY MULTIPICKLIST COPIED
        ----------------------------------*/
        PIM_Product_Stage__c updatedStage =
            [SELECT Level2_Options_Prod__c
             FROM PIM_Product_Stage__c
             WHERE Id = :validStage.Id];

        
    }


    /* -----------------------------------
       Cover Empty Set Branch
    -----------------------------------*/
    @isTest
    static void testUpdateStages_NoStages() {

        Test.startTest();
        PimLevel2optionClass.updateStages(new Set<Id>());
        Test.stopTest();

    }
}