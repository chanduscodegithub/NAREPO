/**********************************************************************
Name: PimControllerTest
Purpose: Test class for PimController
Coverage: Tests Create, Update, Bulk operations, Display Order logic
VERSION      DATE        DETAIL
1.0         12/02/2026  INITIAL DEVELOPMENT
**********************************************************************/
@isTest
public class PimControllerTest {
    @TestSetup
    static void setupTestData() {
        Id stdPbId = Test.getStandardPricebookId();
        update new Pricebook2(
            Id = stdPbId,
            IsActive = true
        );
        List<Product2> productsList = new List<Product2>{
            new Product2(Name='Advocacy - Optum Guide', Product_Line__c='Medical', IsActive=true),
                new Product2(Name='Kidney Resource Services', Product_Line__c='Pharmacy', IsActive=true)
                };
                    insert as user productsList;
        
        // Insert pricebook entries
        List<PricebookEntry> pbes = new List<PricebookEntry>();
        for(Product2 p : productsList){
            pbes.add(new PricebookEntry(
                Pricebook2Id = stdPbId,
                Product2Id = p.Id,
                UnitPrice = 100,
                IsActive = true
            ));
        }
        insert as user pbes;
        List<PIM_Product_Stage__c> stageRecords = new List<PIM_Product_Stage__c>{
            new PIM_Product_Stage__c(
                Product_Name_Stage__c = 'New Medical Product',
                Product_Code_Stage__c = 'MED-NEW-001',
                PIM_ID_Stage__c = 'PIM-NEW-001',
                PIM_Name_Stage__c = 'New Medical PIM',
                IsActiveStage__c = true,
                Product_Line_Stage__c = 'Medical',
                Product_Display_Order_Stage__c = '0003',
                Funding_Type_Stage__c = 'Fully Insured',
                Product_Change_Type__c = 'New Product',
                Status__c = 'Not in Sync'
            )
                };
                    
                    insert as user stageRecords;
        
        
        List<PIM_Product_Stage__c> stageRecordsChangeInProduct = new List<PIM_Product_Stage__c>{
            new PIM_Product_Stage__c(
                Product_Name_Stage__c = 'New Medical Product',
                Product_Code_Stage__c = 'MED-NEW-0012',
                PIM_ID_Stage__c = 'PIM-NEW-001',
                PIM_Name_Stage__c = 'New Medical PIM',
                IsActiveStage__c = true,
                Product_Line_Stage__c = 'Medical',
                Product_Display_Order_Stage__c = '0003',
                Funding_Type_Stage__c = 'Fully Insured',
                Product_Change_Type__c = 'Change in Product',
                Status__c = 'Not in Sync'
            )
                };
                    
                    insert as user stageRecordsChangeInProduct;
        
        
        
        
        
    }
    
    /* @isTest
static void testCreateProduct2_Success() {
PIM_Product_Stage__c stage =[SELECT Id, Product_Name_Stage__c FROM PIM_Product_Stage__c
WHERE Product_Name_Stage__c = 'New Medical Product' LIMIT 1];
Test.startTest();
Map<String, String> result = PimController.createProduct2(stage.Id);
Test.stopTest();
System.assertNotEquals(null, result.get('productId'));
System.assertEquals('New Medical Product', result.get('productName'));
Product2 createdProduct = [SELECT Id, Name, ProductCode FROM Product2 WHERE Id = :result.get('productId')];
System.assertEquals('New Medical Product', createdProduct.Name);
System.assertEquals('MED-NEW-001', createdProduct.ProductCode);
PricebookEntry pbe = [SELECT Id FROM PricebookEntry WHERE Product2Id = :createdProduct.Id LIMIT 1];
System.assertNotEquals(null, pbe);
}*/
    @isTest
    static void testGetProducts() {
        Test.startTest();
        List<PIM_Product_Stage__c> newProducts = PimController.getProducts('New Product');
        Test.stopTest();
        
        System.assert(newProducts.size() > 0);
    }
    
    @isTest
    static void testBulkCreateProducts_Success() {
        List<PIM_Product_Stage__c> bulkStages = [SELECT Id,Product_Change_Type__c FROM PIM_Product_Stage__c WHERE Product_Code_Stage__c LIKE 'Med%'];
        List<Id> stageIds = new List<Id>();
        for (PIM_Product_Stage__c s : bulkStages) {
            stageIds.add(s.Id);
        }
        
        Test.startTest();
        PimController.PublishSummary summary = PimController.bulkCreateProducts(stageIds,true,'New Product');
        Test.stopTest();
        
    }
    
    
    
    @isTest
    static void testGetStageValues() {
        PIM_Product_Stage__c stage = [SELECT Id FROM PIM_Product_Stage__c WHERE Product_Code_Stage__c = 'MED-NEW-001' LIMIT 1];
        
        Test.startTest();
        List<PIM_Product_Stage__c> result = PimController.getStageValues(stage.Id);
        Test.stopTest();
        
        System.assertEquals(1, result.size());
        System.assertEquals('New Medical Product', result[0].Product_Name_Stage__c);
    }
    
    @isTest
    static void testGetDifferences() {
        PIM_Product_Stage__c stage = [SELECT Id FROM PIM_Product_Stage__c WHERE Product_Code_Stage__c = 'MED-NEW-0012' AND Product_Change_Type__c = 'Change in Product' LIMIT 1];
        
        Test.startTest();
        List<PimController.DiffWrapper> diffs = PimController.getDifferences(stage.Id);
        Test.stopTest();
    }
    
    @isTest
    static void testShiftRange_Bulk() {
        
        Id stdPbId = Test.getStandardPricebookId();
        update new Pricebook2(Id = stdPbId, IsActive = true);
        
        // Create 3 Medical products with orders 1,2,3
        List<Product2> products = new List<Product2>();
        
        for(Integer i=1; i<=3; i++){
            products.add(new Product2(
                Name='ShiftRange '+i,
                ProductCode='SR-'+i+System.currentTimeMillis(),
                Product_Line__c='Medical',
                Product_Display_Order__c='000'+i,
                IsActive=true
            ));
        }
        
        insert products;
        
        insert new List<PricebookEntry>{
            new PricebookEntry(Pricebook2Id=stdPbId, Product2Id=products[0].Id, UnitPrice=100, IsActive=true),
                new PricebookEntry(Pricebook2Id=stdPbId, Product2Id=products[1].Id, UnitPrice=100, IsActive=true),
                new PricebookEntry(Pricebook2Id=stdPbId, Product2Id=products[2].Id, UnitPrice=100, IsActive=true)
                };
                    
                    PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
                        Product_Name_Stage__c='ShiftRange 3 Updated',
                        Product_Code_Stage__c=products[2].ProductCode,
                        Product_Line_Stage__c='Medical',
                        Product_Display_Order_Stage__c='0001',
                        IsActiveStage__c=true,
                        //Product_Line_Prod__c='Medical',
                        // Product_Display_Order_Prod__c='0003',
                        //Active_Prod__c=true,
                        Product_Name_Prod__c=products[2].Id,
                        Product_Change_Type__c='Change in Product',
                        Status__c='Not in Sync');
        insert stage;
        Test.startTest();
        PimController.updateProductsBulk(new List<Id>{stage.Id},false,'New Product');
        Test.stopTest();
    }
    
    
    
    
    @isTest
    static void testGetDifferences_Single() {
        
        Id stdPbId = Test.getStandardPricebookId();
        update new Pricebook2(Id = stdPbId, IsActive = true);
        
        Product2 p = new Product2(
            Name = 'Medical Product',
            ProductCode = 'DIFF-001',
            Product_Line__c = 'Medical',
            Funding_Type__c = 'Fully Insured',
            IsActive = true
        );
        insert p;
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c = 'Medical Product Updated',
            Product_Code_Stage__c = 'DIFF-001',
            Funding_Type_Stage__c = 'Self Funded',   
            Product_Line_Stage__c = 'Medical',
            Product_Name_Prod__c = p.Id,
            Product_Change_Type__c = 'Change in Product',
            Status__c = 'Not in Sync'
        );
        insert stage;
        
        Test.startTest();
        List<PimController.DiffWrapper> diffs =
            PimController.getDifferences(stage.Id);
        Test.stopTest();
        
        
        Boolean foundMismatch = false;
        
        for (PimController.DiffWrapper d : diffs) {
            if (d.hasValueMismatch == true) {
                foundMismatch = true;
            }
        }
        
    }
    @isTest
    static void testShiftUp_Bulk() {
        
        Product2 p = new Product2(
            Name='ShiftUp',
            ProductCode='SU-'+System.currentTimeMillis(),
            Product_Line__c='Medical',
            Product_Display_Order__c='0002',
            IsActive=false
        );
        insert p;
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c='ShiftUp',
            Product_Code_Stage__c=p.ProductCode,
            
            IsActiveStage__c=true,
            Product_Line_Stage__c='Medical',
            Product_Display_Order_Stage__c='0002',
            Product_Name_Prod__c=p.Id,
            Product_Change_Type__c='Change in Product'
        );
        
        insert stage;
        
        Test.startTest();
        PimController.updateProductsBulk(new List<Id>{stage.Id},false,'Change in Product');
        Test.stopTest();
    }
    
    @isTest
    static void testShiftDown_Bulk() {
        
        Product2 p = new Product2(
            Name='ShiftDown',
            ProductCode='SD-'+System.currentTimeMillis(),
            Product_Line__c='Medical',
            Product_Display_Order__c='0002',
            IsActive=true
        );
        insert p;
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c='ShiftDown',
            Product_Code_Stage__c=p.ProductCode,
            
            IsActiveStage__c=false,
            Product_Line_Stage__c='Medical',
            Product_Display_Order_Stage__c='0002',
            Product_Name_Prod__c=p.Id,
            Product_Change_Type__c='Change in Product');
        
        insert stage;
        
        Test.startTest();
        PimController.updateProductsBulk(new List<Id>{stage.Id},false,'Change in Product');
        Test.stopTest();
    }
    
    
    @isTest
    static void testGetDifferences_Bulk() {
        
        Id stdPbId = Test.getStandardPricebookId();
        update new Pricebook2(Id = stdPbId, IsActive = true);
        
        List<Product2> products = new List<Product2>();
        List<PIM_Product_Stage__c> stages = new List<PIM_Product_Stage__c>();
        List<Id> stageIds = new List<Id>();
        
        for (Integer i = 1; i <= 2; i++) {
            
            Product2 p = new Product2(
                Name = 'Bulk Product ' + i,
                ProductCode = 'BULKDIFF-' + i + System.currentTimeMillis(),
                Product_Line__c = 'Medical',
                Funding_Type__c = 'Fully Insured',
                IsActive = true
            );
            products.add(p);
        }
        
        insert products;
        
        for (Product2 p : products) {
            
            PIM_Product_Stage__c s = new PIM_Product_Stage__c(
                Product_Name_Stage__c = p.Name + ' Updated',
                Product_Code_Stage__c = p.ProductCode,
                Funding_Type_Stage__c = 'Self Funded',   // mismatch
                Product_Line_Stage__c = 'Medical',
                Product_Name_Prod__c = p.Id,
                Product_Change_Type__c = 'Change in Product',
                Status__c = 'Not in Sync'
            );
            
            stages.add(s);
        }
        
        insert as user stages;
        
        for (PIM_Product_Stage__c s : stages) {
            stageIds.add(s.Id);
        }
        
        Test.startTest();
        Map<Id, List<PimController.DiffWrapper>> result =
            PimController.getDifferencesBulk(stageIds);
        Test.stopTest();
        
        
        
    }
    
    @isTest
    static void testBulkCreate_InvalidProductFamily() {
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c = 'Invalid Family Product',
            Product_Code_Stage__c = 'INV-001',
            Product_Family_Stage__c = 'INVALID_FAMILY_VALUE', // force error
            Product_Line_Stage__c = 'Medical',
            IsActiveStage__c = true,
            Product_Change_Type__c = 'New Product',
            Status__c = 'Not in Sync'
        );
        insert stage;
        
        Test.startTest();
        PimController.PublishSummary summary =
            PimController.bulkCreateProducts(new List<Id>{stage.Id},true,'New Product');
        Test.stopTest();
        
        System.assertEquals(1, summary.errorCount);
    }
    
    @isTest
    static void testBulkCreate_RecordPageBranch() {
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c = 'RecordPage Product',
            Product_Code_Stage__c = 'REC-001',
            Product_Line_Stage__c = 'Medical',
            IsActiveStage__c = true,
            Product_Change_Type__c = 'New Product',
            Status__c = 'Not in Sync'
        );
        insert stage;
        
        Test.startTest();
        PimController.PublishSummary summary =
            PimController.bulkCreateProducts(
                new List<Id>{stage.Id},
                false,'New Product');
        Test.stopTest();
        
        System.assertEquals(1, summary.successCount);
    }
    @isTest
    static void testUpdateProductsBulk_ListViewBranch() {
        
        Product2 p = new Product2(
            Name='ListView Update',
            ProductCode='LV-001',
            Product_Line__c='Medical',
            Product_Display_Order__c='0001',
            IsActive=true
        );
        insert p;
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c='ListView Update Changed',
            Product_Code_Stage__c=p.ProductCode,
            Product_Line_Stage__c='Medical',
            Product_Display_Order_Stage__c='0002',
            IsActiveStage__c=true,
            Product_Name_Prod__c=p.Id,
            Product_Change_Type__c='Change in Product'
        );
        insert stage;
        
        Test.startTest();
        PimController.updateProductsBulk( new List<Id>{stage.Id},true,'Change in Product');
        Test.stopTest();
    }
    @isTest
    static void testMoveBetweenGroups() {
        
        Product2 p = new Product2(
            Name='Move Group',
            ProductCode='MG-001',
            Product_Line__c='Medical',
            Product_Display_Order__c='0001',
            IsActive=true
        );
        insert p;
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c='Move Group',
            Product_Code_Stage__c=p.ProductCode,
            Product_Line_Stage__c='Pharmacy', // different group
            Product_Display_Order_Stage__c='0001',
            IsActiveStage__c=true,
            Product_Name_Prod__c=p.Id,
            Product_Change_Type__c='Change in Product'
        );
        insert stage;
        
        Test.startTest();
        PimController.updateProductsBulk(new List<Id>{stage.Id},false,'Change in Product');
        Test.stopTest();
    }
    @isTest
    static void testUpdate_InvalidPicklist() {
        
        Product2 p = new Product2(
            Name='Invalid Picklist Update',
            ProductCode='INV-UP-001',
            Product_Line__c='Medical',
            IsActive=true
        );
        insert p;
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c='Invalid Picklist Update',
            Product_Code_Stage__c=p.ProductCode,
            Funding_Type_Stage__c='INVALID_VALUE',
            Product_Line_Stage__c='Medical',
            Product_Name_Prod__c=p.Id,
            Product_Change_Type__c='Change in Product'
        );
        insert stage;
        
        Test.startTest();
        PimController.updateProductsBulk(new List<Id>{stage.Id},true,'Change in Product');
        Test.stopTest();
    }
    
    @isTest
    static void testUpdateProductsBulk_DmlFailure() {
        
        Product2 p = new Product2(
            Name='DML Fail',
            ProductCode='DML-001',
            Product_Line__c='Medical',
            IsActive=true
        );
        insert p;
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c=null, // will blank Name during update
            Product_Code_Stage__c=p.ProductCode,
            Product_Line_Stage__c='Medical',
            IsActiveStage__c=true,
            Product_Name_Prod__c=p.Id,
            Product_Change_Type__c='Change in Product'
        );
        insert stage;
        
        Test.startTest();
        PimController.updateProductsBulk( new List<Id>{stage.Id},true,'Change in Product');
        Test.stopTest();
    }
    
   /* @isTest
    static void testBulkCreate_DmlFailure() {
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c = null, // required field missing
            Product_Code_Stage__c = 'FAIL-001',
            Product_Line_Stage__c = 'Medical',
            IsActiveStage__c = true,
            Product_Change_Type__c = 'New Product'
        );
        insert stage;
        
        Test.startTest();
        PimController.bulkCreateProducts(new List<Id>{stage.Id},true,'New Product');
        Test.stopTest();
    }*/
    @isTest
    static void testMultiPicklistValidation() {
        
        PIM_Product_Stage__c stage = new PIM_Product_Stage__c(
            Product_Name_Stage__c = 'Multi Pick Test',
            Product_Code_Stage__c = 'MP-001',
            Product_Line_Stage__c = 'Medical',
            Level_2_Options_Stage__c = 'Designated;Dedicated',
            IsActiveStage__c = true,
            Product_Change_Type__c = 'New Product'
        );
        insert stage;
        
        Test.startTest();
        PimController.bulkCreateProducts(new List<Id>{stage.Id},true,'New Product');
        Test.stopTest();
    }    
    
}