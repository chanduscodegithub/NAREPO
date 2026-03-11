/***********************************************************************
Name: PimController
TestClass:PimControllerTest
Purpose: To Create/Update the products Review PIM Stage vs Product fields and publish Stage values to Product2 after validation
This controller handles PIM Product Stage publishing functionality.
It supports:
• Creating Product2 records from PIM_Product_Stage__c
• Updating Product2 records during publish
• Comparing Stage vs Product values
• Handling display order reordering logic
• Bulk publish (Create + Update)
• Audit Trail generation
• Quick Publish summary email notifications
VERSION      DATE        DETAIL
1.0         28/01/2026  INITIAL DEVELOPMENT
***********************************************************************/
public with sharing class PimController {
    private static final String MEDICAL = 'Medical';
    /***********************************************************************
Wrapper Class : DiffWrapper
Purpose :Represents field-level differences between
PIM_Product_Stage__c and Product2 records
Used by UI to display comparison grid.
Fields :
• stageField        – API name of Stage field
• snapshotField     – API name of Prod field in Pim Stage Object
• productField      – API name of Product2 field
• stageLabel        – Label of Stage field
• snapShotLabel     – Label of snapshot field
• prodLabel         – Label of Product2 field
• stageValue        – Current Stage value from PIM Product Stage Object
• prodValue         – Current Product value from PIM Product Stage Object
• hasValueMismatch  – True if invalid picklist/multipicklist value
• mismatchMessage   – Validation error message
• productId         – Related Product Id
• stageRecordId     – Stage record Id
***********************************************************************/
    public class DiffWrapper {
        @AuraEnabled public String stageField;
        @AuraEnabled public String stageLabel;
        @AuraEnabled public String snapShotLabel;
        @AuraEnabled public String productField;
        @AuraEnabled public String prodLabel;
        @AuraEnabled public String snapshotField;
        @AuraEnabled public String stageValue;
        @AuraEnabled public String prodValue;
        @AuraEnabled public Boolean hasValueMismatch;
        @AuraEnabled public String mismatchMessage;
        @AuraEnabled public Id productId;
        @AuraEnabled public Id stageRecordId;
    }
    public class PublishSummary {
        @AuraEnabled public Integer successCount;
        @AuraEnabled public Integer errorCount;
        @AuraEnabled public Integer totalCount;
        @AuraEnabled public String message;
        @AuraEnabled public Id productId;
        @AuraEnabled public String productName;
    }
    
    /***********************************************************************
Method Name : createProduct2
Purpose :Creates a new Product2 record from a single PIM_Product_Stage__c record.
Also:
• Creates PricebookEntry
• Creates Audit Trail record
• Handles display order reordering
• Updates Stage status to 'In Sync'
Input :
• stageRecordId (Id)
→ Id of PIM_Product_Stage__c record
Output :
• Map<String, String>
→ productId   : Created Product2 Id
→ productName : Created Product Name
Throws :
• AuraHandledException if DML fails
***********************************************************************/
    /*@AuraEnabled
    public static Map<String, String> createProduct2(Id stageRecordId){
        if (stageRecordId == null) {
            throw new AuraHandledException('Stage Record Id is required');
        }
        PIM_Product_Stage__c pim = [
            SELECT PIM_ID_Stage__c,PIM_Name_Stage__c,PIM_Name_Prod__c,PIM_ID_Prod__c,Product_Family_Stage__c,PIM_Parent_ID_Stage__c,PIM_Parent_Name_Stage__c, PIM_SME_Name_Stage__c,
            PIM_ID_Composite_Stage__c, PIM_Availability_Stage__c,Program_Code_Stage__c,Supplier_Code_Stage__c, Id_Stage__c,
            Product_Name_Stage__c,Product_Code_Stage__c,IsActiveStage__c,Funding_Type_Stage__c,Product_Line_Stage__c,
            Level_2_Options_Stage__c, Surest_Applicable_Products_Stage__c, CPW_Applicable_Product_Stage__c,  SFGO_Applicable_Product_Stage__c,
            Considered_For_StepWise_Integration__c, Distribution_Type_Flag__c,StepWise_Product_Name__c,StepWise_Product_RowID__c,Underwriting_Validation__c,
            Do_Not_Include_in_Total__c,Key_Growth_Drivers__c, Eligible_for_Sales_Incentives__c, Enterprise_Growth_Product__c,Product_Display_Order_Stage__c,Reporting_Product_Type__c,
            Surest_Implementation_Lead_Time_Stage__c,Standard_Implementation_LeadTime_Stage__c 
            FROM PIM_Product_Stage__c  WHERE Id = :stageRecordId With USER_MODE LIMIT 1];
        Id standardPricebookId = [SELECT Id FROM Pricebook2 WHERE IsStandard = true With USER_MODE  LIMIT 1].Id;
        Product2 prod = new Product2();
        if (pim.Product_Code_Stage__c != null) {
            prod.ProductCode = pim.Product_Code_Stage__c;
        }
        if (pim.PIM_ID_Stage__c != null) {
            prod.PIM_ID__c = pim.PIM_ID_Stage__c;
        }
        if (pim.Product_Name_Stage__c != null) {
            prod.Name = pim.Product_Name_Stage__c;
        }
        
        if (pim.IsActiveStage__c != null) {
            prod.IsActive = pim.IsActiveStage__c;
        }
        if (pim.PIM_Name_Stage__c != null) {
            prod.PIM_Name__c = pim.PIM_Name_Stage__c;
        }
        
        if (pim.PIM_Parent_ID_Stage__c != null) {
            prod.PIM_PARENT_ID__c = pim.PIM_Parent_ID_Stage__c;
        }
        
        if (pim.PIM_Parent_Name_Stage__c != null) {
            prod.PIM_PARENT_NAME__c = pim.PIM_Parent_Name_Stage__c;
        }
        
        if (pim.PIM_SME_Name_Stage__c != null) {
            prod.PIM_SME_NAME__c = pim.PIM_SME_Name_Stage__c;
        }
        
        if (pim.PIM_ID_Composite_Stage__c != null) {
            prod.PIM_ID_COMPOSITE__c = pim.PIM_ID_Composite_Stage__c;
        }
        
        if (pim.PIM_Availability_Stage__c != null) {
            prod.PIM_AVAILABILITY__c = pim.PIM_Availability_Stage__c;
        }
        
        if (pim.Program_Code_Stage__c != null) {
            prod.PIM_PROGRAM_CODE__c = pim.Program_Code_Stage__c;
        }
        
        if (pim.Supplier_Code_Stage__c != null) {
            prod.PIM_SUPPLIER_CODE__c = pim.Supplier_Code_Stage__c;
        }
        
        if (pim.Funding_Type_Stage__c != null) {
            prod.Funding_Type__c = pim.Funding_Type_Stage__c;
        }
        
        if (pim.Product_Line_Stage__c != null) {
            prod.Product_Line__c = pim.Product_Line_Stage__c;
        }
        
        if (pim.Level_2_Options_Stage__c != null) {
            prod.Level_2_Options__c = pim.Level_2_Options_Stage__c;
        }
        
        if (pim.Surest_Applicable_Products_Stage__c != null) {
            prod.Surest_Applicable_Products__c = pim.Surest_Applicable_Products_Stage__c;
        }
        
        if (pim.CPW_Applicable_Product_Stage__c != null) {
            prod.CPW_Applicable_Product__c = pim.CPW_Applicable_Product_Stage__c;
        }
        
        if (pim.SFGO_Applicable_Product_Stage__c != null) {
            prod.SFGO_Applicable_Product__c =  pim.SFGO_Applicable_Product_Stage__c;
        }
        
        if (pim.Distribution_Type_Flag__c != null) {
            prod.Distribution_Type_Flag__c =  pim.Distribution_Type_Flag__c;
        }
        
        if (pim.Do_Not_Include_in_Total__c != null) {
            prod.Do_Not_Include_in_Total__c = pim.Do_Not_Include_in_Total__c;
        }
        
        if (pim.Enterprise_Growth_Product__c != null) {
            prod.Enterprise_Growth_Product__c = pim.Enterprise_Growth_Product__c;
        }
        
        if (pim.StepWise_Product_Name__c != null) {
            prod.StepWise_Product_Name__c =   pim.StepWise_Product_Name__c;
        }
        
        if (pim.StepWise_Product_RowID__c != null) {
            prod.StepWise_Product_RowID__c = pim.StepWise_Product_RowID__c;
        }
        
        if (pim.Considered_For_StepWise_Integration__c != null) {
            prod.Considered_For_StepWise_Integration__c =
                pim.Considered_For_StepWise_Integration__c;
        }
        
        if (pim.Underwriting_Validation__c != null) {
            prod.Underwriting_Validation__c =
                pim.Underwriting_Validation__c;
        }
        if (pim.Product_Family_Stage__c != null) {
            validateProductFamily(pim.Product_Family_Stage__c);
            prod.Family = pim.Product_Family_Stage__c;
        }
        if (pim.Surest_Implementation_Lead_Time_Stage__c != null) {
            prod.Surest_Implementation_Lead_Time__c = pim.Surest_Implementation_Lead_Time_Stage__c;
        }
        if (pim.Standard_Implementation_LeadTime_Stage__c != null) {
            prod.Standard_Implementation_Lead_Time__c = pim.Standard_Implementation_LeadTime_Stage__c;
        }
        
        
        if (pim.Eligible_for_Sales_Incentives__c != null) {
            prod.Eligible_for_Sales_Incentives__c =
                pim.Eligible_for_Sales_Incentives__c;
        }
        
        
        /*if (pim.Product_Display_Order_Stage__c != null) {
prod.Product_Display_Order__c = pim.Product_Display_Order_Stage__c;
// PimController.reorderOnInsert(prod.Id,  pim.Product_Display_Order_Stage__c, pim.Product_Line_Stage__c );
}*/
        
       /* if (pim.Reporting_Product_Type__c != null) {
            prod.Reporting_Product_Type__c =  pim.Reporting_Product_Type__c;
        }
        /* if (pim.Surest_Implementation_Lead_Time_Stage__c != null) {
prod.Surest_Implementation_Lead_Time__c =  pim.Surest_Implementation_Lead_Time_Stage__c;
}
if (pim.Standard_Implementation_LeadTime_Stage__c != null) {
prod.Standard_Implementation_Lead_Time__c =  pim.Standard_Implementation_LeadTime_Stage__c;
}*/
        
       /* if (pim.Key_Growth_Drivers__c != null) {
            prod.TCOC_Hit_List__c =
                pim.Key_Growth_Drivers__c;
        }
        try {
            prod.Product_Display_Order__c = pim.Product_Display_Order_Stage__c;
            Database.insert(prod, false,AccessLevel.USER_MODE);
            //insert as user prod;
            String auditDesc = buildCreateAuditDescription(pim);
            if (!String.isBlank(auditDesc)) {
                PIM_Audit_Trail__c auditRecord1 = new PIM_Audit_Trail__c(
                    //insert as user  new PIM_Audit_Trail__c(
                    Product__c           = prod.Id,
                    PIM_Product_Stage__c = pim.Id,
                    Action_Type__c       = 'Create',
                    Source_of_Action__c = 'Individual Publish',
                    Description__c       = auditDesc
                );
                Database.insert(auditRecord1, true, AccessLevel.USER_MODE);
                
            }
            
            if (pim.Product_Display_Order_Stage__c != null &&  pim.Product_Line_Stage__c != null) {
                PimController.reorderOnInsert(prod.Id,pim.Product_Display_Order_Stage__c,pim.Product_Line_Stage__c );
                prod.Product_Display_Order__c = pim.Product_Display_Order_Stage__c;
                //update as user prod;
                Database.update(prod, false, AccessLevel.USER_MODE);
                
            }
            pim.Product_Name_Prod__c = prod.Id;                
            pim.Status__c = 'In Sync';
            pim.Product_Change_Type__c = 'No Change';
            pim.Change_Tracker__c  = '';
            pim.Product_Display_Order_Stage__c = prod.Product_Display_Order__c;
            Database.update(pim, false,AccessLevel.USER_MODE);
            //update as user pim;
            System.debug('New Product created with ID: ' + prod.Id);
            PricebookEntry standardEntry = new PricebookEntry(Pricebook2Id = standardPricebookId,Product2Id = prod.Id, UnitPrice = 1,IsActive = true);
            Database.insert(standardEntry, false,AccessLevel.USER_MODE);
            //insert as user standardEntry;
            System.debug('Standard PricebookEntry created with ID: ' + standardEntry.Id);
            Map<String, String> result = new Map<String, String>();
            result.put('productId', prod.Id);
            result.put('productName', prod.Name);
            return result;
        } catch (DmlException e) {
            throw new AuraHandledException(
                'Product creation failed: ' + e.getMessage()
            );
        }
        
    }*/
    
    /***********************************************************************
Method Name : updateProductOnPublish
Purpose : Updates an existing Product2 record using Stage values.
• Compares Stage vs Snapshot values
• Updates only changed fields
• Handles display order shift logic
• Creates Audit Trail record
• Updates Stage status to 'In Sync'
Input :
• stageRecordId (Id) → Id of PIM_Product_Stage__c record
Output :
• Map<String, String> → productId   : Updated Product2 Id
→ productName : Product NameThrows :
• AuraHandledException for picklist validation or DML errors
***********************************************************************/
   /* @AuraEnabled
    public static Map<String, String> updateProductOnPublish(Id stageRecordId) {
        // if (stageRecordId == null) return;
        Map<String, String> result = new Map<String, String>();
        if (stageRecordId == null) {
            result.put('status', 'error');
            result.put('message', 'Stage Record Id cannot be null.');
            return result;
        }
        Savepoint sp = Database.setSavepoint();
        try {
            PIM_Product_Stage__c s = [SELECT Product_Name_Prod__c,Product_Name_Stage__c,Product_Name__c,Product_Line_Prod__c,Product_Line_Stage__c,Active_Prod__c,IsActiveStage__c,Product_Display_Order_Prod__c, Product_Display_Order_Stage__c,
                                      PIM_ID_Stage__c,PIM_Name_Stage__c,PIM_Parent_ID_Stage__c,PIM_Parent_Name_Stage__c,PIM_SME_Name_Stage__c,PIM_ID_Composite_Stage__c, PIM_Availability_Stage__c,Program_Code_Stage__c,Supplier_Code_Stage__c,Product_Code_Stage__c,Product_Family_Stage__c,Funding_Type_Stage__c, Level_2_Options_Stage__c,Surest_Applicable_Products_Stage__c,CPW_Applicable_Product_Stage__c,
                                      SFGO_Applicable_Product_Stage__c,PIM_ID_Prod__c,PIM_Name_Prod__c, PIM_Parent_ID_Prod__c,PIM_Parent_Name_Prod__c,PIM_SME_Name_Prod__c,PIM_ID_Composite_Prod__c,PIM_Availability_Prod__c,Program_Code_Prod__c,Supplier_Code_Prod__c,Product_Code_Prod__c,Product_Family_Prod__c,Funding_Type_Prod__c,Level2_Options_Prod__c,Surest_Applicable_Products_Prod__c, CPW_Applicable_Product_Prod__c, SFGO_Applicable_Product_Prod__c,
                                      Surest_Implementation_Lead_Time_Stage__c,Surest_Implementation_Lead_Time_Prod__c,Standard_Implementation_LeadTime_Stage__c,Standard_Implementation_Lead_Time_Prod__c 
                                      FROM PIM_Product_Stage__c WHERE Id = :stageRecordId With USER_MODE];
            Id productId = s.Product_Name_Prod__c;
            Integer oldOrder = toInt(s.Product_Display_Order_Prod__c);
            Integer newOrder = toInt(s.Product_Display_Order_Stage__c);
            if (s.Active_Prod__c != s.IsActiveStage__c || s.Product_Line_Prod__c != s.Product_Line_Stage__c || oldOrder != newOrder) {
                handleDisplayOrderShift(productId,s.Product_Line_Prod__c,s.Product_Line_Stage__c,s.Active_Prod__c,s.IsActiveStage__c,oldOrder,newOrder);
            }
            Product2 p = new Product2(Id = productId);
            for (String stageField : FIELD_CONFIG.keySet()) {
                Map<String, String> cfg = FIELD_CONFIG.get(stageField);
                Object stageVal = s.get(stageField);
                Object prodVal  = s.get(cfg.get('snapshot'));
                if ((stageVal == null && prodVal == null) ||
                    (stageVal != null && prodVal != null &&
                     String.valueOf(stageVal) == String.valueOf(prodVal))) {
                         continue;
                     }
                if (cfg.get('product') == 'Family') {
                    validateProductFamily(String.valueOf(stageVal));   
                }
                p.put(cfg.get('product'), stageVal);
            }
            //update as user p;
            Database.update(p, true,AccessLevel.USER_MODE);
            // ---------- AUDIT TRAIL (UPDATE) ----------
            String auditDesc = buildAuditDescription(s);
            if (!String.isBlank(auditDesc)) {
                PIM_Audit_Trail__c auditRecord = new PIM_Audit_Trail__c(
                    //insert as user new PIM_Audit_Trail__c(
                    Product__c           = productId,
                    PIM_Product_Stage__c = s.Id,
                    Action_Type__c       = 'Update',
                    Source_of_Action__c = 'Individual Publish',
                    Description__c       = auditDesc);
                Database.insert(auditRecord, false, AccessLevel.USER_MODE);
                
            }
            s.Status__c = 'In Sync';
            s.Change_Tracker__c ='';
            s.Product_Change_Type__c = 'No Change';
            Database.update(s, false,AccessLevel.USER_MODE);
            //update as user s;
            result.put('productId', productId);
            result.put('productName', s.Product_Name_Stage__c);
            return result;
            
        } /*catch (Exception e) {
Database.rollback(sp);
throw new AuraHandledException(e.getMessage());
}*/
/*        catch (DmlException e) {
            Database.rollback(sp);
            
            if (e.getMessage().contains('INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST')) {
                String fieldLabel = 'Picklist field';
                String badValue   = '';
                // Try to extract value (best-effort)
                if (e.getMessage().contains(':')) {
                    badValue = e.getMessage().substringAfter(':').substringBefore('[').trim();
                }
                
                throw new AuraHandledException(
                    'Invalid picklist value "' + badValue +
                    '". Please select a valid value before publishing.'
                );
            }
            
            throw new AuraHandledException('Update failed'+e.getMessage());
        }
        
    } */
    
    /***********************************************************************
Method Name : getStageValues
Purpose :Fetches selected Stage record values.
Input :
• stageRecordId (Id) → Id of PIM_Product_Stage__c
Output :
• List<PIM_Product_Stage__c> → List containing the requested stage record
***********************************************************************/
    @AuraEnabled
    public static List<PIM_Product_Stage__c>  getStageValues(Id stageRecordId){
        List<PIM_Product_Stage__c> pimProductList = [SELECT  PIM_ID_Stage__c, PIM_Name_Stage__c, PIM_Parent_ID_Stage__c,PIM_Parent_Name_Stage__c, PIM_SME_Name_Stage__c,PIM_ID_Composite_Stage__c, PIM_Availability_Stage__c,
                                                     Id_Stage__c,Program_Code_Stage__c,Supplier_Code_Stage__c,Product_Name_Stage__c,IsActiveStage__c, Funding_Type_Stage__c, Product_Line_Stage__c, Level_2_Options_Stage__c,
                                                     Surest_Applicable_Products_Stage__c,Product_Code_Stage__c,
                                                     CPW_Applicable_Product_Stage__c, SFGO_Applicable_Product_Stage__c,
                                                     Considered_For_StepWise_Integration__c, Distribution_Type_Flag__c, 
                                                     StepWise_Product_Name__c,StepWise_Product_RowID__c,Underwriting_Validation__c,Product_Family_Stage__c,
                                                     Do_Not_Include_in_Total__c, Key_Growth_Drivers__c, Eligible_for_Sales_Incentives__c,Enterprise_Growth_Product__c,
                                                     Product_Display_Order_Stage__c,Reporting_Product_Type__c,Surest_Implementation_Lead_Time_Stage__c,Standard_Implementation_LeadTime_Stage__c
                                                     FROM PIM_Product_Stage__c WHERE Id = :stageRecordId With USER_MODE LIMIT 1];
        if (!pimProductList.isEmpty()) {
            PIM_Product_Stage__c pim = pimProductList[0];
        } else {
            System.debug('No record Found') ;
        }
        return pimProductList;
    }
    /***********************************************************************
Method Name : getDifferences
Purpose :
Compares Stage fields with Product snapshot fields
and returns field-level differences.
Validates picklist and multipicklist values.
Input : stageRecordId (Id)
Output :List<DiffWrapper>
→ List of field differences
***********************************************************************/
    @AuraEnabled(cacheable=true)
    public static List<DiffWrapper> getDifferences(Id stageRecordId) {
        Set<String> fields = new Set<String>{ 'Id', 'Product_Name_Prod__c' };
            for (String f : FIELD_CONFIG.keySet()) {
                fields.add(f);
                fields.add(FIELD_CONFIG.get(f).get('snapshot'));
            }
        PIM_Product_Stage__c stage = Database.query('SELECT ' + String.join(new List<String>(fields), ',') +' FROM PIM_Product_Stage__c WHERE Id = :stageRecordId With USER_MODE');
        Map<String, Schema.SObjectField> stageDescribe = Schema.SObjectType.PIM_Product_Stage__c.fields.getMap();
        Map<String, Schema.SObjectField> prodDescribe = Schema.SObjectType.Product2.fields.getMap();
        List<DiffWrapper> diffs = new List<DiffWrapper>();
        for (String stageField : FIELD_CONFIG.keySet()) {
            String snapshot = FIELD_CONFIG.get(stageField).get('snapshot');
            String productField = FIELD_CONFIG.get(stageField).get('product');
            Object sVal = stage.get(stageField);
            Object pVal = stage.get(snapshot);
            // MULTI-PICKLIST
            if (prodDescribe.get(productField).getDescribe().getType() == Schema.DisplayType.MultiPicklist) {
                Set<String> sSet = normalize(sVal);
                Set<String> pSet = normalize(pVal);
                if (sSet.equals(pSet)) 
                    continue;
                DiffWrapper dw = buildDiff(
                    stageField, snapshot, productField,
                    String.join(new List<String>(sSet), ';'),
                    String.join(new List<String>(pSet), ';'),
                    stageDescribe, prodDescribe
                );
                // validate multipicklist values
                Set<String> allowed = allowedValues(prodDescribe.get(productField));
                for (String v : sSet) {
                    if (!allowed.contains(v)) {
                        dw.hasValueMismatch = true;
                        dw.mismatchMessage =
                            'Value "' + v + '" not allowed';
                    }
                }
                diffs.add(dw);
                continue;
            }
            
            String sStr = String.valueOf(sVal);
            String pStr = String.valueOf(pVal);
            if (sStr == pStr) 
                //if (valuesAreEqual(sVal, pVal))
                continue;
            DiffWrapper dw = buildDiff(
                stageField, snapshot, productField,
                sStr, pStr, stageDescribe, prodDescribe
            );
            // PICKLIST VALIDATION
            if (prodDescribe.get(productField).getDescribe().getType() == Schema.DisplayType.Picklist) {
                if (!allowedValues(prodDescribe.get(productField)).contains(sStr)) {
                    dw.hasValueMismatch = true;
                    dw.mismatchMessage =
                        'Value "' + sStr + '" not allowed';
                }
            }
            
            diffs.add(dw);
        }
        return diffs;
    }
    /***********************************************************************
Method Name : reorderOnInsert
Purpose :Adjusts Product_Display_Order__c when inserting for single record(record page)a new product within the same Product Line.
Input :
• newProductId (Id)
• newOrderStr  (String) – New display order
• productLine  (String)
Output :• void
***********************************************************************/
    /*@AuraEnabled
    public static void reorderOnInsert(Id newProductId,String newOrderStr,String productLine) {
        if (String.isBlank(newOrderStr) || String.isBlank(productLine))
            return;
        Integer newOrder;
        try {
            newOrder = Integer.valueOf(newOrderStr);
        } catch (Exception e) {
            return;
        }
        // Determine grouping (Medical separate, others shared)
        String groupKey = orderGroup(productLine);
        // Query all active products
        List<Product2> existingProducts = [SELECT Id, Product_Display_Order__c, Product_Line__c
                                           FROM Product2 WHERE IsActive = true AND Product_Display_Order__c != null AND Name != 'Total'AND Id != :newProductId WITH USER_MODE];
        List<Product2> toShift = new List<Product2>();
        for (Product2 p : existingProducts) {
            // Apply grouping logic
            if (orderGroup(p.Product_Line__c) != groupKey)
                continue;
            Integer curr = Integer.valueOf(p.Product_Display_Order__c);
            if (curr >= newOrder) {
                p.Product_Display_Order__c =
                    String.valueOf(curr + 1).leftPad(4, '0');
                
                toShift.add(p);
            }
        }
        
        if (!toShift.isEmpty()) {
            //update as user toShift;
            Database.update(toShift, false,AccessLevel.USER_MODE);
        }
    }*/
    /***********************************************************************
Method Name : getProducts
Purpose :Fetches Stage records filtered by Product_Change_Type__c for Bulk Publish.
Input :filterType (String)
Output : List<PIM_Product_Stage__c>
***********************************************************************/
    @AuraEnabled
    public static List<PIM_Product_Stage__c> getProducts(String filterType){
        List<PIM_Product_Stage__c> allProducts = new List<PIM_Product_Stage__c>();
        try{
            allProducts = [SELECT Id, PIM_ID_Stage__c, Product_Name_Stage__c, Product_Name__c, PIM_Name_Stage__c, PIM_Parent_ID_Stage__c,
                           PIM_Parent_Name_Stage__c, PIM_SME_Name_Stage__c, PIM_ID_Composite_Stage__c, PIM_Availability_Stage__c, Program_Code_Stage__c, Supplier_Code_Stage__c,
                           Product_Code_Stage__c, IsActiveStage__c, Change_Tracker__c, Product_Family_Stage__c, Funding_Type_Stage__c, Product_Line_Stage__c,
                           Level_2_Options_Stage__c, Product_Display_Order_Stage__c, Surest_Applicable_Products_Stage__c, CPW_Applicable_Product_Stage__c, SFGO_Applicable_Product_Stage__c, PIM_ID_Prod__c,
                           Product_Change_Type__c, PIM_Name_Prod__c, PIM_Parent_ID_Prod__c, PIM_Parent_Name_Prod__c, PIM_SME_Name_Prod__c, PIM_ID_Composite_Prod__c,
                           PIM_Availability_Prod__c, Eligible_for_Sales_Incentives__c, Program_Code_Prod__c, Supplier_Code_Prod__c, Product_Code_Prod__c, Do_Not_Include_in_Total__c,
                           Key_Growth_Drivers__c, Active_Prod__c, Enterprise_Growth_Product__c, Product_Family_Prod__c, Underwriting_Validation__c, Funding_Type_Prod__c,
                           Product_Line_Prod__c, Level2_Options_Prod__c, Distribution_Type_Flag__c, StepWise_Product_Name__c, Product_Display_Order_Prod__c, StepWise_Product_RowID__c,
                           Surest_Applicable_Products_Prod__c, CPW_Applicable_Product_Prod__c, SFGO_Applicable_Product_Prod__c, Product_Name_Prod__c, Considered_For_StepWise_Integration__c, Surest_Implementation_Lead_Time_Stage__c,
                           Standard_Implementation_LeadTime_Stage__c,Reporting_Product_Type__c 
                           FROM PIM_Product_Stage__c where Product_Change_Type__c =:filterType  AND Product_Line_Stage__c!=NULL With USER_MODE Order by Product_Line_Stage__c ASC,Product_Display_Order_Prod__c];
        }
        catch(Exception e){
            System.debug('No Records  Found');
        }
        System.debug('allProducts'+ allProducts);
        return allProducts;
    }
    /***********************************************************************
Method Name : bulkCreateProducts
Purpose :Bulk creates Product2 records from Stage records.
Also:
• Creates PricebookEntries
• Creates Audit Trail records
• Updates Stage records
• Sends Quick Publish summary email
Input :stageIds (List<Id>)
Output : PublishSummary
→ successCount
→ errorCount
→ totalCount
***********************************************************************/
    @AuraEnabled
    public static PublishSummary bulkCreateProducts(List<Id> stageIds,Boolean isListView) {
        Boolean isRecordPage = !isListView;
        PublishSummary summary = new PublishSummary();
        if (stageIds == null || stageIds.isEmpty()) {
            summary.successCount = 0;
            summary.errorCount = 0;
            summary.totalCount = 0;
            return summary;
        }
        Integer successCount = 0;
        Integer errorCount   = 0;
        Integer totalCount   = stageIds.size();
        List<String> successRows = new List<String>();
        List<String> errorRows   = new List<String>();
        List<PIM_Audit_Trail__c> auditRecords = new List<PIM_Audit_Trail__c>();
        String baseUrl = URL.getOrgDomainUrl().toExternalForm();
        List<PIM_Product_Stage__c> stages = [SELECT Id,PIM_ID_Stage__c,Product_Name_Stage__c,Product_Name__c, PIM_Name_Stage__c,PIM_Parent_ID_Stage__c,PIM_Parent_Name_Stage__c,PIM_SME_Name_Stage__c,PIM_ID_Composite_Stage__c,PIM_Availability_Stage__c,
                                             Program_Code_Stage__c,Supplier_Code_Stage__c,Product_Code_Stage__c,IsActiveStage__c,Change_Tracker__c,Product_Family_Stage__c,Funding_Type_Stage__c,
                                             Product_Line_Stage__c,Level_2_Options_Stage__c,Product_Display_Order_Stage__c,Surest_Applicable_Products_Stage__c,CPW_Applicable_Product_Stage__c,SFGO_Applicable_Product_Stage__c,
                                             PIM_ID_Prod__c,Product_Change_Type__c,PIM_Name_Prod__c,PIM_Parent_ID_Prod__c,PIM_Parent_Name_Prod__c,PIM_SME_Name_Prod__c,
                                             PIM_ID_Composite_Prod__c,PIM_Availability_Prod__c,Eligible_for_Sales_Incentives__c,Program_Code_Prod__c,Supplier_Code_Prod__c,
                                             Product_Code_Prod__c,Do_Not_Include_in_Total__c,Key_Growth_Drivers__c,Active_Prod__c,Enterprise_Growth_Product__c, Product_Family_Prod__c,Underwriting_Validation__c,Funding_Type_Prod__c, Product_Line_Prod__c,Level2_Options_Prod__c,Distribution_Type_Flag__c,StepWise_Product_Name__c,
                                             Product_Display_Order_Prod__c,StepWise_Product_RowID__c,Surest_Applicable_Products_Prod__c,CPW_Applicable_Product_Prod__c,SFGO_Applicable_Product_Prod__c,Product_Name_Prod__c,Considered_For_StepWise_Integration__c,
                                             Surest_Implementation_Lead_Time_Stage__c,Standard_Implementation_LeadTime_Stage__c,Reporting_Product_Type__c 
                                             FROM PIM_Product_Stage__c WHERE Id IN :stageIds With USER_MODE];
        List<Product2> productsToInsert = new List<Product2>();
        for (PIM_Product_Stage__c s : stages) {
            //Integer orderVal = toInt(s.Product_Display_Order_Stage__c);
            Product2 p = new Product2();            
            p.PIM_ID__c                = s.PIM_ID_Stage__c;
            p.PIM_Name__c              = s.PIM_Name_Stage__c;
            p.PIM_PARENT_ID__c         = s.PIM_Parent_ID_Stage__c;
            p.PIM_PARENT_NAME__c       = s.PIM_Parent_Name_Stage__c;
            p.PIM_SME_NAME__c          = s.PIM_SME_Name_Stage__c;
            p.PIM_ID_COMPOSITE__c      = s.PIM_ID_Composite_Stage__c;
            p.PIM_AVAILABILITY__c      = s.PIM_Availability_Stage__c;
            p.PIM_PROGRAM_CODE__c      = s.Program_Code_Stage__c;
            p.PIM_SUPPLIER_CODE__c     = s.Supplier_Code_Stage__c;        
            p.Name                     = s.Product_Name_Stage__c;
            p.ProductCode              = s.Product_Code_Stage__c;
            p.IsActive                 = s.IsActiveStage__c;
            // ---- Validate ALL picklists first ----
            List<String> picklistErrors = validatePicklists(s);
            
            if (!picklistErrors.isEmpty()) {
                errorCount++;
                if(!isListView){
                    throw new AuraHandledException(String.join(picklistErrors, '/'));
                }
                errorRows.add(
                    '<tr>' +
                    '<td>' + s.Product_Name_Stage__c + '</td>' +
                    '<td>' + s.Product_Code_Stage__c + '</td>' +
                    '<td><a href="' + baseUrl + '/' + s.Id + '">' +
                    s.Product_Name_Stage__c + '</a></td>' +
                    '<td>' + s.Product_Change_Type__c + '</td>' +
                    '<td>' + String.join(picklistErrors, '<br/>') + '</td>' +
                    '</tr>'
                );
                
                continue; 
            }
            /* String pfError = validateProductFamilyBulk(s.Product_Family_Stage__c);

            if (pfError != null) {
                errorCount++;
                errorRows.add(
                    '<tr>' +
                    '<td>' + s.Product_Name_Stage__c + '</td>' +
                    '<td>' + s.Product_Code_Stage__c + '</td>' +
                    '<td><a href="' + baseUrl + '/' + s.Id + '">' +
                    s.Product_Name_Stage__c + '</a></td>' +
                    '<td>' + s.Product_Change_Type__c + '</td>' +
                    // '<td>' + s.Change_Tracker__c  + '</td>' +
                    '<td>' + pfError + '</td>' +
                    '</tr>'
                );
                continue;  
            }*/
            
            
            p.Family = s.Product_Family_Stage__c;
            //validateProductFamily(s.Product_Family_Stage__c);   
            //p.Family                   = s.Product_Family_Stage__c;
            p.Funding_Type__c          = s.Funding_Type_Stage__c;
            p.Product_Line__c          = s.Product_Line_Stage__c;
            p.Level_2_Options__c       = s.Level_2_Options_Stage__c;
            p.Surest_Applicable_Products__c = s.Surest_Applicable_Products_Stage__c;
            p.CPW_Applicable_Product__c     = s.CPW_Applicable_Product_Stage__c;
            p.SFGO_Applicable_Product__c    = s.SFGO_Applicable_Product_Stage__c;
            p.Considered_For_StepWise_Integration__c =s.Considered_For_StepWise_Integration__c;
            p.Distribution_Type_Flag__c = s.Distribution_Type_Flag__c;
            p.StepWise_Product_RowID__c = s.StepWise_Product_RowID__c;
            p.StepWise_Product_Name__c = s.StepWise_Product_Name__c;
            p.Underwriting_Validation__c =s.Underwriting_Validation__c;
            p.Do_Not_Include_in_Total__c = s.Do_Not_Include_in_Total__c;
            p.TCOC_Hit_List__c =s.Key_Growth_Drivers__c;
            p.Eligible_for_Sales_Incentives__c = s.Eligible_for_Sales_Incentives__c;
            p.Enterprise_Growth_Product__c =s.Enterprise_Growth_Product__c;
            p.Surest_Implementation_Lead_Time__c = s.Surest_Implementation_Lead_Time_Stage__c;
            p.Standard_Implementation_Lead_Time__c = s.Standard_Implementation_LeadTime_Stage__c;
            p.Reporting_Product_Type__c  = s.Reporting_Product_Type__c;
            Integer orderVal = toInt(s.Product_Display_Order_Stage__c);
            p.Product_Display_Order__c = orderVal == null ? null : padOrder(orderVal);
            productsToInsert.add(p);            
        }
        handleBulkDisplayOrderInsert(productsToInsert);
        
        if (!Schema.sObjectType.Product2.isCreateable()) {
            throw new AuraHandledException('You do not have permission to create Products.');
        }
        Database.SaveResult[] productResults = Database.insert(productsToInsert, false,AccessLevel.USER_MODE);
        Id standardPricebookId =[SELECT Id FROM Pricebook2 WHERE IsStandard = true With USER_MODE LIMIT 1].Id;
        List<PricebookEntry> pricebookEntries = new List<PricebookEntry>();
        List<PIM_Product_Stage__c> stageUpdates = new List<PIM_Product_Stage__c>();
        for (Integer i = 0; i < productResults.size(); i++) {
            PIM_Product_Stage__c s = stages[i];
            if (productResults[i].isSuccess()) {
                Product2 p = productsToInsert[i];
                successCount++;
                if(isRecordPage){
                    summary.productId   = p.Id;
                    summary.productName = s.Product_Name_Stage__c;
                }
                String auditDesc = buildCreateAuditDescription(s);
                auditRecords.add(
                    new PIM_Audit_Trail__c(
                        Product__c            = p.Id,
                        PIM_Product_Stage__c  = s.Id,
                        Action_Type__c        = 'Create',
                        Source_of_Action__c = isRecordPage ? 'Individual Publish' : 'Bulk Publish',
                       // Source_of_Action__c   = 'Bulk Publish',
                        Description__c        = auditDesc) );
                successRows.add(
                    '<tr>' +
                    '<td><a href="' + baseUrl + '/' + p.Id + '">' + s.Product_Name_Stage__c + '</a></td>' +
                    //'<td>' +<a href="' + baseUrl + '/' + p.Id + '">'+ s.Product_Name_Stage__c + '</td>' +
                    '<td>' + s.Product_Code_Stage__c + '</td>' +
                    '<td>' + s.Product_Change_Type__c + '</td>' +
                    //'<td>' + s.Change_Tracker__c + '</td>' +
                    '</tr>'
                );
                pricebookEntries.add(
                    new PricebookEntry(
                        Pricebook2Id = standardPricebookId,
                        Product2Id   = p.Id,
                        UnitPrice    = 1,
                        IsActive     = true,
                        UseStandardPrice = false
                    )
                );
                
                stageUpdates.add(
                    new PIM_Product_Stage__c(
                        Id = s.Id,
                        Product_Name_Prod__c = p.Id,
                        Status__c = 'In Sync',
                        Change_Tracker__c ='',
                        Product_Change_Type__c = 'No Change',
                        Level2_Options_Prod__c = s.Level_2_Options_Stage__c,
                        Product_Display_Order_Stage__c = p.Product_Display_Order__c
                    )
                );
                
            } else {
                errorCount++;
               
                Database.Error err = productResults[i].getErrors()[0];
                if(!isListView){
                    throw new AuraHandledException(err.getMessage());
                }
                errorRows.add(
                    '<tr>' +
                    '<td>' + s.Product_Name_Stage__c + '</td>' +
                    '<td>' + s.Product_Code_Stage__c + '</td>' +
                    '<td><a href="' + baseUrl + '/' + s.Id + '">'+ s.Product_Name_Stage__c +'</a></td>' +
                    '<td>' + s.Product_Change_Type__c + '</td>' +
                    //'<td>' + s.Change_Tracker__c  + '</td>' +
                    //'<td><a href="' + baseUrl + '/' + s.Id + '">View</a></td>' +
                    '<td>' + err.getMessage() + '</td>' +
                    '</tr>'
                );
            }
        }
        
        
        
        if (!pricebookEntries.isEmpty()) {
            if (!Schema.sObjectType.PricebookEntry.isCreateable()) {
                throw new AuraHandledException('You do not have permission to create Pricebook Entries.');
            }
            Database.insert(pricebookEntries, false,AccessLevel.USER_MODE);
        }
        if (!stageUpdates.isEmpty()) {
            // update as user stageUpdates;
            Database.update(stageUpdates, false,AccessLevel.USER_MODE);
            
        }
        if (!auditRecords.isEmpty()) {
            Database.insert(auditRecords, false,AccessLevel.USER_MODE);
            //insert as user auditRecords;
        }
        if(isListView)
        {
                    sendQuickPublishEmail( successCount,errorCount, totalCount,successRows,errorRows,false);

        }
        summary.successCount = successCount;
        summary.errorCount   = errorCount;
        summary.totalCount   = totalCount;
        if(!isListView){
            if(successCount == 1){
                summary.message = 'Product published successfully.';
            } else {
                summary.message = 'Product publish failed.';
            }
        }
        else{
            summary.message ='Bulk Publish Completed. ' +successCount + ' Success, ' + errorCount + ' Failed.';
        }
        return summary;
    }
    ///***************Bulk Order shift*************/
    private static void handleBulkDisplayOrderInsert(List<Product2> newProducts) {
        if (newProducts == null || newProducts.isEmpty()) return;
        // Map Product_Line__c → insert positions
        Map<String, List<Integer>> lineToInsertPositions = new Map<String, List<Integer>>();
        Set<String> productLines = new Set<String>();
        // STEP 1: Collect insert positions per product line
        for (Product2 p : newProducts) {
            if (p.IsActive == true &&
                p.Product_Line__c != null &&
                p.Product_Display_Order__c != null) {
                    Integer pos = Integer.valueOf(p.Product_Display_Order__c);
                    String groupKey = orderGroup(p.Product_Line__c);
                    if (!lineToInsertPositions.containsKey(groupKey)) {
                        lineToInsertPositions.put(groupKey, new List<Integer>());
                    }
                    lineToInsertPositions.get(groupKey).add(pos);
                    productLines.add(groupKey);
                }
        }
        
        if (productLines.isEmpty()) return;
        // STEP 2: Sort insert positions for each line
        for (String line : lineToInsertPositions.keySet()) {
            lineToInsertPositions.get(line).sort();
        }
        // STEP 3: Single query for ALL product lines
        List<Product2> existingProducts = [
            SELECT Id, Product_Display_Order__c, Product_Line__c
            FROM Product2 WHERE IsActive = true AND Product_Display_Order__c != null AND Name != 'Total'];
        if (existingProducts.isEmpty()) return;
        // STEP 4: Track updated positions
        Map<Id, Integer> updatedPositions = new Map<Id, Integer>();
        for (Product2 ex : existingProducts) {
            updatedPositions.put(
                ex.Id,
                Integer.valueOf(ex.Product_Display_Order__c)
            );
        }
        // STEP 5: Apply cascading shift per line
        for (String line : lineToInsertPositions.keySet()) {
            List<Integer> insertPositions = lineToInsertPositions.get(line);
            for (Integer insertPos : insertPositions) {
                for (Product2 ex : existingProducts) {
                    if (orderGroup(ex.Product_Line__c) != line) continue;
                    Integer currentPos = updatedPositions.get(ex.Id);
                    if (currentPos >= insertPos) {
                        updatedPositions.put(ex.Id, currentPos + 1);
                    }
                }
            }
        }
        // STEP 6: Prepare update list
        List<Product2> productsToUpdate = new List<Product2>();
        for (Product2 ex : existingProducts) {
            Integer originalPos =
                Integer.valueOf(ex.Product_Display_Order__c);
            Integer newPos = updatedPositions.get(ex.Id);
            if (newPos != originalPos) {
                productsToUpdate.add(new Product2(
                    Id = ex.Id,
                    Product_Display_Order__c =
                    String.valueOf(newPos).leftPad(4, '0')
                ));
            }
        }
        // STEP 7: Single bulk update
        if (!productsToUpdate.isEmpty()) {
            //update as user productsToUpdate;
            Database.update(productsToUpdate, false,AccessLevel.USER_MODE);
        }
    }
    private static List<DiffWrapper> buildDiffs(PIM_Product_Stage__c stage,Map<String, Schema.SObjectField> stageDescribe) {
        List<DiffWrapper> diffs = new List<DiffWrapper>();
        for (String stageField : FIELD_CONFIG.keySet()) {
            Map<String, String> cfg = FIELD_CONFIG.get(stageField);
            String snapshotField = cfg.get('snapshot');
            String productField  = cfg.get('product');
            String stageVal =stage.get(stageField) == null ? '' : String.valueOf(stage.get(stageField));
            String snapVal =stage.get(snapshotField) == null ? '' :String.valueOf(stage.get(snapshotField));
            if (stageVal == snapVal) 
                continue;
            DiffWrapper dw = new DiffWrapper();
            dw.stageField = stageField;
            dw.snapshotField = snapshotField;
            dw.productField = productField;
            dw.stageLabel =stageDescribe.get(stageField).getDescribe().getLabel();
            dw.prodLabel =stageDescribe.get(snapshotField).getDescribe().getLabel();
            dw.stageValue = stageVal;
            dw.prodValue  = snapVal;
            diffs.add(dw);
        }
        return diffs;
    }
    @AuraEnabled(cacheable=true)
   public static Map<Id, List<DiffWrapper>> getDifferencesBulk(List<Id> stageIds) {

    Map<Id, List<DiffWrapper>> result = new Map<Id, List<DiffWrapper>>();

    if (stageIds == null || stageIds.isEmpty()) {
        return result;
    }

    /* BUILD FIELD LIST */
    Set<String> fields = new Set<String>{ 'Id' };
    for (String stageField : FIELD_CONFIG.keySet()) {
        fields.add(stageField);
        fields.add(FIELD_CONFIG.get(stageField).get('snapshot'));
    }

    /* QUERY ONCE */
    List<PIM_Product_Stage__c> stages =
        Database.query(
            'SELECT ' + String.join(new List<String>(fields), ',') +
            ' FROM PIM_Product_Stage__c' +
            ' WHERE Id IN :stageIds' +
            ' WITH USER_MODE'
        );

    /* MAP FOR FAST LOOKUP */
    Map<Id, PIM_Product_Stage__c> stageMap =
        new Map<Id, PIM_Product_Stage__c>(stages);

    Map<String, Schema.SObjectField> stageDescribe =
        Schema.SObjectType.PIM_Product_Stage__c.fields.getMap();

    /* BUILD DIFFS IN INPUT ORDER */
    for (Id stageId : stageIds) {

        if (stageMap.containsKey(stageId)) {

            PIM_Product_Stage__c stage = stageMap.get(stageId);

            List<DiffWrapper> diffs =
                buildDiffs(stage, stageDescribe);

            if (!diffs.isEmpty()) {
                result.put(stageId, diffs);
            }
        }
    }

    return result;
}
    
    /***********************************************************************
Method Name : updateProductsBulk
Purpose :Bulk updates Product2 records from Stage values.
• Handles display order shifts
• Updates changed fields only
• Creates Audit Trail records
• Updates Stage status
• Sends Quick Publish summary email
Input :stageIds (List<Id>)
Output : PublishSummary
***********************************************************************/
    @AuraEnabled
    public static PublishSummary updateProductsBulk(List<Id> stageIds,Boolean isListView) {
        PublishSummary summary = new PublishSummary();
        if (stageIds == null || stageIds.isEmpty()) {
            summary.successCount = 0;
            summary.errorCount = 0;
            summary.totalCount = 0;
            return summary;
        }
        Map<Id, PIM_Product_Stage__c> productToStage = new Map<Id, PIM_Product_Stage__c>();
        Integer successCount = 0;
        Integer errorCount   = 0;
        Integer totalCount   = stageIds.size();
        List<String> successRows = new List<String>();
        List<String> errorRows   = new List<String>();
        List<PIM_Audit_Trail__c> auditRecords = new List<PIM_Audit_Trail__c>();
        String baseUrl = URL.getOrgDomainUrl().toExternalForm();
        List<PIM_Product_Stage__c> stages = [SELECT Id, PIM_ID_Stage__c, Product_Name_Stage__c, Product_Name__c, PIM_Name_Stage__c, PIM_Parent_ID_Stage__c, PIM_Parent_Name_Stage__c, Enterprise_Growth_Product__c, PIM_SME_Name_Stage__c, PIM_ID_Composite_Stage__c, PIM_Availability_Stage__c, Program_Code_Stage__c, Supplier_Code_Stage__c, Product_Code_Stage__c, IsActiveStage__c, Change_Tracker__c, Product_Family_Stage__c, Key_Growth_Drivers__c,
                                             Eligible_for_Sales_Incentives__c, Funding_Type_Stage__c, Product_Line_Stage__c, Level_2_Options_Stage__c, Product_Display_Order_Stage__c, Surest_Applicable_Products_Stage__c, CPW_Applicable_Product_Stage__c, SFGO_Applicable_Product_Stage__c,
                                             PIM_ID_Prod__c, Product_Change_Type__c, Underwriting_Validation__c, PIM_Name_Prod__c, PIM_Parent_ID_Prod__c, Do_Not_Include_in_Total__c, PIM_Parent_Name_Prod__c, PIM_SME_Name_Prod__c, PIM_ID_Composite_Prod__c, PIM_Availability_Prod__c, Program_Code_Prod__c, Supplier_Code_Prod__c,
                                             Product_Code_Prod__c, Active_Prod__c, Product_Family_Prod__c, Funding_Type_Prod__c, Product_Line_Prod__c, Level2_Options_Prod__c, Product_Display_Order_Prod__c,
                                             Surest_Applicable_Products_Prod__c, CPW_Applicable_Product_Prod__c, StepWise_Product_RowID__c, StepWise_Product_Name__c, SFGO_Applicable_Product_Prod__c, Distribution_Type_Flag__c, Product_Name_Prod__c, Considered_For_StepWise_Integration__c,
                                             Surest_Implementation_Lead_Time_Stage__c,Standard_Implementation_LeadTime_Stage__c,Surest_Implementation_Lead_Time_Prod__c,Standard_Implementation_Lead_Time_Prod__c 
                                             FROM PIM_Product_Stage__c WHERE Id IN :stageIds With USER_MODE ORDER BY Product_Display_Order_Stage__c]; 
        List<Product2> products = [SELECT Id, Product_Line__c, Product_Display_Order__c, IsActive
                                   FROM Product2 WHERE  Name != 'Total' With USER_MODE ORDER BY Product_Display_Order__c];
        Map<String, List<Product2>> groupMap = new Map<String, List<Product2>>();
        map<string,string> groupMapDisplayOrderbefore = new Map<string,string>();
        map<string,string> finalOrderMap = new Map<string,string>();
        Map<Id, Product2> orderUpdates = new Map<Id, Product2>();
        
        for (Product2 p : products) {
            finalOrderMap.put(p.Id,p.Product_Display_Order__c);
            groupMapDisplayOrderbefore.put(p.Id,p.Product_Display_Order__c);
            String grp = orderGroup(p.Product_Line__c);
            if (!groupMap.containsKey(grp)) {
                groupMap.put(grp, new List<Product2>());
            }
            groupMap.get(grp).add(p);
        }
        List<Product2> updates = new List<Product2>();
        //Map<Integer, PIM_Product_Stage__c> indexToStage = new Map<Integer, PIM_Product_Stage__c>();
        
        for (PIM_Product_Stage__c s : stages) {
            /*String pfError = validateProductFamilyBulk(s.Product_Family_Stage__c);
            
            if (pfError != null) {
                errorCount++;
                
                errorRows.add(
                    '<tr>' +
                    '<td><a href="' + baseUrl + '/' + s.Product_Name_Prod__c + '">' +
                    s.Product_Name_Stage__c + '</a></td>' +
                    '<td>' + (String.isBlank(s.Product_Code_Stage__c) ? '-' : s.Product_Code_Stage__c) + '</td>' +
                    '<td><a href="' + baseUrl + '/' + s.Id + '">' +
                    s.Product_Name_Stage__c + '</a></td>' +
                    '<td>' + s.Product_Change_Type__c + '</td>' +
                    '<td>' + s.Change_Tracker__c  + '</td>' +
                    '<td>' + pfError + '</td>' +
                    '</tr>'
                );
                
                continue; 
            }*/
            // ---- Validate ALL picklists first ----
            List<String> picklistErrors = validatePicklists(s);
            
            if (!picklistErrors.isEmpty()) {
                if(!isListView){
                    throw new AuraHandledException(String.join(picklistErrors, ' | '));
                }
                
                errorCount++;
                
                
                errorRows.add(
                    '<tr>' +
                    '<td><a href="' + baseUrl + '/' + s.Product_Name_Prod__c + '">' +
                    s.Product_Name_Stage__c + '</a></td>' +
                    '<td>' + (String.isBlank(s.Product_Code_Stage__c) ? '-' : s.Product_Code_Stage__c) + '</td>' +
                    '<td><a href="' + baseUrl + '/' + s.Id + '">' +
                    s.Product_Name_Stage__c + '</a></td>' +
                    '<td>' + s.Product_Change_Type__c + '</td>' +
                    '<td>' + s.Change_Tracker__c + '</td>' +
                    '<td>' + String.join(picklistErrors, '<br/>') + '</td>' +
                    '</tr>'
                );
                
                continue; 
            }
            Id productId = s.Product_Name_Prod__c;
            
            Integer oldOrder  = toInt(s.Product_Display_Order_Prod__c);
            Integer newOrder  = toInt(s.Product_Display_Order_Stage__c);
            String oldGroup   = orderGroup(s.Product_Line_Prod__c);
            String newGroup   = orderGroup(s.Product_Line_Stage__c);
            Boolean oldActive = s.Active_Prod__c;
            Boolean newActive = s.IsActiveStage__c;
            
            List<Product2> oldGroupProducts = groupMap.get(oldGroup);

            if (oldActive && !newActive) {
                 Integer incValue =1;
                for (Product2 p : oldGroupProducts) {
                    //if(p.Product_Line__c ==s.Product_Line_Prod__c){
                        Integer ord = toInt(p.Product_Display_Order__c);
                        if (p.Id == productId){
                            
                            p.Product_Display_Order__c =null;
                            finalOrderMap.put(p.Id,p.Product_Display_Order__c);
                            orderUpdates.put(
                                p.Id,
                                new Product2(Id = p.Id,Product_Display_Order__c = null)
                            );
                            continue;
                        } 
                        if (ord != null && toInt(groupMapDisplayOrderbefore.get(p.id)) > oldOrder) {
                            p.Product_Display_Order__c =pad(ord - incValue);
                            finalOrderMap.put(p.Id,p.Product_Display_Order__c);
                            orderUpdates.put(
                                p.Id,
                                new Product2(Id = p.Id,Product_Display_Order__c = pad(ord - incValue))
                            );
                       // }
                    }
                }
                //shiftDown(groupMap.get(oldGroup), oldOrder, orderUpdates, productId);
            }
            else if (!oldActive && newActive) {
                //shiftUp(groupMap.get(newGroup), newOrder, orderUpdates, productId);
                
              
                    for (Product2 p : groupMap.get(newGroup)) {
                        if (p.Id == productId){
                            p.Product_Display_Order__c =pad(newOrder);
                            finalOrderMap.put(p.Id,p.Product_Display_Order__c);
                            continue;
                        } 
                        Integer ord = toInt(p.Product_Display_Order__c);
                        if (ord != null && ord >= newOrder) {
                            p.Product_Display_Order__c =pad(ord + 1);
                            finalOrderMap.put(p.Id,p.Product_Display_Order__c);
                            
                            orderUpdates.put(
                                p.Id,
                                new Product2(
                                    Id = p.Id,
                                    Product_Display_Order__c = pad(ord + 1)
                                )
                            );
                        }
                    }
                    
                
            }
            else if (oldActive && newActive && oldGroup == newGroup && oldOrder != newOrder) {
                //shiftRange(groupMap.get(newGroup), oldOrder, newOrder, orderUpdates, productId);
               
                Integer min = Math.min(oldOrder, newOrder);
                Integer max = Math.max(oldOrder, newOrder);
                for (Product2 p : groupMap.get(newGroup)) {
                    if (p.Id == productId){
                        p.Product_Display_Order__c =pad(newOrder);
                        finalOrderMap.put(p.Id,p.Product_Display_Order__c);

                        continue;
                    } 
                    Integer ord = toInt(p.Product_Display_Order__c);
                    if (ord == null) continue;
                    
                    // MOVING UP (example: 10 → 5)
                    if (newOrder < oldOrder) {
                        
                        if (ord >= newOrder && ord < oldOrder) {
                            
                            Integer updatedOrder = ord + 1;
                            
                            p.Product_Display_Order__c = pad(updatedOrder);
                            finalOrderMap.put(p.Id, p.Product_Display_Order__c);
                            
                            orderUpdates.put(
                                p.Id,
                                new Product2(
                                    Id = p.Id,
                                    Product_Display_Order__c = pad(updatedOrder)
                                )
                            );
                        }
                    }
                    // MOVING DOWN (example: 5 → 10)
                    else if (newOrder > oldOrder) {
                        
                        if (ord > oldOrder && ord <= newOrder) {
                            
                            Integer updatedOrder = ord - 1;
                            
                            p.Product_Display_Order__c = pad(updatedOrder);
                            finalOrderMap.put(p.Id, p.Product_Display_Order__c);
                            
                            orderUpdates.put(
                                p.Id,
                                new Product2(
                                    Id = p.Id,
                                    Product_Display_Order__c = pad(updatedOrder)
                                )
                            );
                        }
                    }
                }
            }
            
            else if (oldActive && newActive && oldGroup != newGroup) {
                 Integer incValue =1;
                for (Product2 p : oldGroupProducts) {
                    //if(p.Product_Line__c ==s.Product_Line_Prod__c){
                        Integer ord = toInt(p.Product_Display_Order__c);
                        if (p.Id == productId){
                            p.Product_Display_Order__c =null;
                            finalOrderMap.put(p.Id,p.Product_Display_Order__c);
                            orderUpdates.put(
                                p.Id,
                                new Product2(Id = p.Id,Product_Display_Order__c = null)
                            );
                            continue;
                        } 
                        if (ord != null && toInt(groupMapDisplayOrderbefore.get(p.id)) > oldOrder) {
                            p.Product_Display_Order__c =pad(ord - incValue);
                            finalOrderMap.put(p.Id,p.Product_Display_Order__c);
                            orderUpdates.put(
                                p.Id,
                                new Product2(Id = p.Id,Product_Display_Order__c = pad(ord - incValue))
                            );
                       // }
                    }
                }
                //shiftDown(groupMap.get(oldGroup), oldOrder, orderUpdates, productId);
                //shiftUp(groupMap.get(newGroup), newOrder, orderUpdates, productId);
                 for (Product2 p : groupMap.get(newGroup)) {
                        if (p.Id == productId){
                            p.Product_Display_Order__c =pad(newOrder);
                            finalOrderMap.put(p.Id,p.Product_Display_Order__c);
                            continue;
                        } 
                        Integer ord = toInt(p.Product_Display_Order__c);
                        if (ord != null && ord >= newOrder) {
                            p.Product_Display_Order__c =pad(ord + 1);
                            finalOrderMap.put(p.Id,p.Product_Display_Order__c);
                            
                            orderUpdates.put(
                                p.Id,
                                new Product2(
                                    Id = p.Id,
                                    Product_Display_Order__c = pad(ord + 1)
                                )
                            );
                        }
                    }
            }
            if (newActive && newOrder != null) {
                orderUpdates.put(
                    productId,
                    new Product2(
                        Id = productId,
                        Product_Display_Order__c = pad(newOrder)
                    )
                );
            }
            
            
            /* ----- update only changed fields ----- */
            Product2 p = new Product2(Id = s.Product_Name_Prod__c);
            for (String stageField : FIELD_CONFIG.keySet()) {
                Map<String, String> cfg = FIELD_CONFIG.get(stageField);
                Object stageVal = s.get(stageField);
                Object prodVal  = s.get(cfg.get('snapshot'));
                system.debug(String.valueOf(stageVal) +'--'+cfg.get('product')+'--'+String.valueOf(prodVal));
                IF(cfg.get('product') == 'Product_Display_Order__c'){
                    p.put(cfg.get('product'),finalOrderMap.get(p.Id));
                                }
                if (String.valueOf(stageVal) != String.valueOf(prodVal) && cfg.get('product') != 'Product_Display_Order__c') {
                    p.put(cfg.get('product'), stageVal);
                }
            }
        	System.debug('veera Prod++++++'+p);
            updates.add(p);
            productToStage.put(p.Id, s);
        }
        // Merge order updates into existing updates list safely
        for (Id pid : orderUpdates.keySet()) {
            
            Boolean found = false;
            
            for (Product2 existing : updates) {
                
                if (existing.Id == pid) {
                    System.debug('veera Prod+++finalOrderMap.get(pid)+++'+finalOrderMap.get(pid));
                    existing.Product_Display_Order__c = finalOrderMap.get(pid);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                updates.add(orderUpdates.get(pid));
            }
        }
        if (!Schema.sObjectType.Product2.isUpdateable()) {
            throw new AuraHandledException('You do not have permission to Update Products.');
        }
        Database.SaveResult[] results = Database.update(updates, false,AccessLevel.USER_MODE);
        List<PIM_Product_Stage__c> stageUpdates = new List<PIM_Product_Stage__c>();
        for (Integer i = 0; i < results.size(); i++) {
            Product2 updatedProduct = updates[i];
            
            if (!productToStage.containsKey(updatedProduct.Id)) {
                continue;
            }
            /* if (!indexToStage.containsKey(i)) {
continue; 
}*/
            PIM_Product_Stage__c s = productToStage.get(updatedProduct.Id);
            //PIM_Product_Stage__c s = indexToStage.get(i);
            if (results[i].isSuccess()) {
                if(!isListView){
                    summary.productId   = updatedProduct.Id;
                    summary.productName = s.Product_Name_Stage__c;
                }
                successCount++;
                String auditDesc = buildAuditDescription(s);
                auditRecords.add(
                    new PIM_Audit_Trail__c(
                        Product__c            = updates[i].Id,
                        PIM_Product_Stage__c  = s.Id,
                        Action_Type__c        = 'Update',
                        //Source_of_Action__c = 'Bulk Publish',
                         Source_of_Action__c   = (isListView == true ? 'Bulk Publish' : 'Individual Publish'),
                        Description__c        = auditDesc
                    )
                );
                successRows.add(
                    '<tr>' +
                    '<td><a href="' + baseUrl + '/' + updates[i].Id + '">' +
                    s.Product_Name_Stage__c +
                    '</a></td>' +
                    '<td>' + s.Product_Code_Stage__c + '</td>' +
                    '<td>' + s.Product_Change_Type__c + '</td>' +
                    '<td>' + s.Change_Tracker__c + '</td>' +
                    '</tr>'
                );
                
                stageUpdates.add(
                    new PIM_Product_Stage__c(
                        Id = s.Id,
                        Status__c = 'In Sync',
                        Change_Tracker__c = '',
                        Level2_Options_Prod__c = s.Level_2_Options_Stage__c,
                        Product_Change_Type__c = 'No Change'
                    )
                );
                
            } else {
                
                List<String> allErrors = new List<String>();
                
                for(Database.Error e : results[i].getErrors()){
                    allErrors.add(e.getMessage());
                }
                
                if(!isListView){
                    throw new AuraHandledException(
                        String.join(allErrors, ' | ')
                    );
                }

                errorCount++;
                
                Database.Error err = results[i].getErrors()[0];
               /* if(!isListView){
                    throw new AuraHandledException(err.getMessage());
                }*/
                errorRows.add(
                    '<tr>' +
                    '<td><a href="' + baseUrl + '/' + s.Product_Name_Prod__c + '">' + s.Product_Name_Stage__c + '</a></td>' +
                    //'<td><a href="' + baseUrl + '/' + s.Id + '">View</a></td>' +
                    '<td>' + (String.isBlank(s.Product_Code_Stage__c) ? '-' : s.Product_Code_Stage__c) +'</td>' +
                    '<td><a href="' + baseUrl + '/' + s.Id + '">'+ s.Product_Name_Stage__c +'</a></td>' +
                    //'<td>' + s.Product_Code_Stage__c + '</td>' +
                    '<td>' + s.Product_Change_Type__c + '</td>' +
                    '<td>' + s.Change_Tracker__c + '</td>' +
                    '<td>' + err.getMessage() + '</td>' +
                    '</tr>'
                );
            }
        }
        if (!stageUpdates.isEmpty()) {
            //update as user stageUpdates;
            Database.update(stageUpdates, false,AccessLevel.USER_MODE);
        }
        if (!auditRecords.isEmpty()) {
            Database.insert(auditRecords, false,AccessLevel.USER_MODE);
            //insert as user auditRecords;
        }
        if(isListView){
            sendQuickPublishEmail(successCount,errorCount,totalCount,successRows,errorRows,true);
            
        }
       // sendQuickPublishEmail(successCount,errorCount,totalCount,successRows,errorRows,true);
        summary.successCount = successCount;
        summary.errorCount   = errorCount;
        summary.totalCount   = totalCount;
        if(!isListView){
            if(successCount == 1){
                summary.message = 'Product updated successfully.';
            } else {
                summary.message = 'Product update failed.';
            }
        } else {
            summary.message =
                'Bulk Update Completed. ' +
                successCount + ' Success, ' +
                errorCount + ' Failed.';
        }
        return summary;
    }
    /*----Bulk Update order Changes---*/
    private static void shiftRange(List<Product2> list1,Integer oldOrder, Integer newOrder,Map<Id, Product2> updates,Id excludeId) {
        if (list1 == null || oldOrder == null || newOrder == null) return;
        Integer min = Math.min(oldOrder, newOrder);
        Integer max = Math.max(oldOrder, newOrder);
        for (Product2 p : list1) {
            if (p.Id == excludeId){
                
              
                continue;
            } 
            Integer ord = toInt(p.Product_Display_Order__c);
            if (ord == null) continue;
            
            // Moving UP (e.g., 10 → 5)
            if (newOrder < oldOrder) {
                if (ord >= newOrder && ord < oldOrder) {
                    updates.put(
                        p.Id,
                        new Product2(
                            Id = p.Id,
                            Product_Display_Order__c = pad(ord + 1)
                        )
                    );
                }
            }
            // Moving DOWN (e.g., 5 → 10)
            else {
                if (ord > oldOrder && ord <= newOrder) {
                    updates.put(p.Id,new Product2(Id = p.Id,Product_Display_Order__c = pad(ord - 1)));
                }
            }
        }
    }
    
    private static void shiftDown(List<Product2> list1, Integer fromOrder,Map<Id, Product2> updates,Id excludeId) {
        if (list1 == null || fromOrder == null) return;
        for (Product2 p : list1) {
            if (p.Id == excludeId) continue;
            Integer ord = toInt(p.Product_Display_Order__c);
            if (ord != null && ord > fromOrder) {
                updates.put(
                    p.Id,
                    new Product2(Id = p.Id,Product_Display_Order__c = pad(ord - 1))
                );
            }
        }
    }
    private static void shiftUp(List<Product2> list1,Integer fromOrder,Map<Id, Product2> updates,Id excludeId ) {
        if (list1 == null || fromOrder == null) return;
        for (Product2 p : list1) {
            if (p.Id == excludeId) continue;
            Integer ord = toInt(p.Product_Display_Order__c);
            if (ord != null && ord >= fromOrder) {
                updates.put(
                    p.Id,
                    new Product2(
                        Id = p.Id,
                        Product_Display_Order__c = pad(ord + 1)
                    )
                );
            }
        }
    }
    private static final Map<String, Map<String, String>> FIELD_CONFIG = new Map<String, Map<String, String>>{
        'PIM_ID_Stage__c' => new Map<String, String>{'snapshot' => 'PIM_ID_Prod__c','product'  => 'PIM_ID__c'},
            'PIM_Name_Stage__c' => new Map<String, String>{'snapshot' => 'PIM_Name_Prod__c','product'  => 'PIM_Name__c'},  
                'PIM_Parent_ID_Stage__c' => new Map<String, String>{'snapshot' => 'PIM_Parent_ID_Prod__c','product'  => 'PIM_PARENT_ID__c'},
                    'PIM_Parent_Name_Stage__c' => new Map<String, String>{'snapshot' => 'PIM_Parent_Name_Prod__c','product'  => 'PIM_PARENT_NAME__c'},
                        'PIM_SME_Name_Stage__c' => new Map<String, String>{'snapshot' => 'PIM_SME_Name_Prod__c','product'  => 'PIM_SME_NAME__c'},
                            'PIM_ID_Composite_Stage__c' => new Map<String, String>{'snapshot' => 'PIM_ID_Composite_Prod__c','product'  => 'PIM_ID_COMPOSITE__c'},
                                'PIM_Availability_Stage__c' => new Map<String, String>{'snapshot' => 'PIM_Availability_Prod__c','product'  => 'PIM_AVAILABILITY__c'},
                                    'Program_Code_Stage__c' => new Map<String, String>{'snapshot' => 'Program_Code_Prod__c','product'  => 'PIM_PROGRAM_CODE__c'},
                                        'Supplier_Code_Stage__c' => new Map<String, String>{'snapshot' => 'Supplier_Code_Prod__c','product'  => 'PIM_SUPPLIER_CODE__c'},
                                            //'Product_Name_Stage__c' => new Map<String, String>{'snapshot' => 'Product_Name_Prod__c','product'  => 'Name'},
                                            'Product_Code_Stage__c' => new Map<String, String>{'snapshot' => 'Product_Code_Prod__c','product'  => 'ProductCode'},
                                                'IsActiveStage__c' => new Map<String, String>{'snapshot' => 'Active_Prod__c','product'  => 'IsActive'}, 
                                                    'Product_Family_Stage__c' => new Map<String, String>{'snapshot' => 'Product_Family_Prod__c','product'  => 'Family'},
                                                        'Funding_Type_Stage__c' => new Map<String, String>{'snapshot' => 'Funding_Type_Prod__c','product'  => 'Funding_Type__c'},
                                                            'Product_Line_Stage__c' => new Map<String, String>{'snapshot' => 'Product_Line_Prod__c','product'  => 'Product_Line__c'},
                                                                'Level_2_Options_Stage__c' => new Map<String, String>{ 'snapshot' => 'Level2_Options_Prod__c','product' => 'Level_2_Options__c' },
                                                                    'Product_Display_Order_Stage__c'=> new Map<String, String>{ 'snapshot' => 'Product_Display_Order_Prod__c','product' => 'Product_Display_Order__c' },
                                                                        'Surest_Applicable_Products_Stage__c' => new Map<String, String>{'snapshot' => 'Surest_Applicable_Products_Prod__c','product'  => 'Surest_Applicable_Products__c' },
                                                                            'CPW_Applicable_Product_Stage__c' => new Map<String, String>{ 'snapshot' => 'CPW_Applicable_Product_Prod__c', 'product' => 'CPW_Applicable_Product__c' },
                                                                                'SFGO_Applicable_Product_Stage__c' => new Map<String, String>{ 'snapshot' => 'SFGO_Applicable_Product_Prod__c', 'product' => 'SFGO_Applicable_Product__c' },
                                                                                    'Surest_Implementation_Lead_Time_Stage__c' => new Map<String, String>{ 'snapshot' => 'Surest_Implementation_Lead_Time_Prod__c','product'  => 'Surest_Implementation_Lead_Time__c'},
                                                                                        'Standard_Implementation_LeadTime_Stage__c' => new Map<String, String>{ 'snapshot' => 'Standard_Implementation_Lead_Time_Prod__c','product'  => 'Standard_Implementation_Lead_Time__c'},
                                                                                            'Product_Name_Stage__c' => new Map<String, String>{'snapshot' => 'Product_Name__c','product'  => 'Name'}
        
        
        
        
    };
        private static DiffWrapper buildDiff( String stageField, String snapshot, String productField, String sVal, String pVal, Map<String, Schema.SObjectField> stageDesc, Map<String, Schema.SObjectField> prodDesc) {
            DiffWrapper dw = new DiffWrapper();
            dw.stageField = stageField;
            dw.snapshotField = snapshot;
            dw.productField = productField;
            dw.stageLabel = stageDesc.get(stageField).getDescribe().getLabel();
            dw.snapShotLabel = stageDesc.get(snapshot).getDescribe().getLabel();
            dw.prodLabel = prodDesc.get(productField).getDescribe().getLabel();
            dw.stageValue = sVal;
            dw.prodValue = pVal;
            dw.hasValueMismatch = false;
            return dw;
        }
    private static Set<String> normalize(Object val) {
        if (val == null) return new Set<String>();
        return new Set<String>(String.valueOf(val).split(';'));
    }
    private static Integer toInt(String v) {
        if (String.isBlank(v) || v.trim() == '#N/A') 
            return null;
        return Integer.valueOf(v);
    }
    private static String pad(Integer v) {
        if (v == null) return null;
        String s = String.valueOf(v);
        while (s.length() < 4) s = '0' + s;
        return s;
    }
    private static String orderGroup(String productLine) {
        if (productLine == 'Medical') return 'MEDICAL';
        return 'NON_MEDICAL';
    }
    /*****Helper methods**********/
    /***Converts String to Integer**/
    /* private static Integer toInt(Object val) {
if (val == null) 
return null;
try {
return Integer.valueOf(String.valueOf(val));
} catch (Exception e) {
return null;
}
}*/
    /**** Pads integer with leading zeros (length 4)
I/p:Integer o/p:String***/
    private static String padOrder(Integer value) {
        if (value == null) return null;
        return String.valueOf(value).leftPad(4, '0'); // 4 = padding length
    }
    private static Set<String> allowedValues(Schema.SObjectField f) {
        Set<String> vals = new Set<String>();
        for (Schema.PicklistEntry p :
             f.getDescribe().getPicklistValues()) {
                 vals.add(p.getValue());
             }
        return vals;
    }
   /*private static void handleDisplayOrderShift(Id productId,String oldLine,String newLine,Boolean oldActive,Boolean newActive,Integer oldOrder, Integer newOrder) {
        List<Product2> toChange = new List<Product2>();
        String oldGroup = orderGroup(oldLine);
        String newGroup = orderGroup(newLine);
        
        if (oldActive && !newActive) {
            toChange.addAll(queryShift(oldGroup, oldOrder, '>', -1, productId));
            toChange.add(new Product2(
                Id = productId,
                Product_Display_Order__c = null
            ));
        }
        else if (!oldActive && newActive) {
            toChange.addAll(queryShift(newGroup, newOrder, '>=', 1, productId));
        }
        
        else if (oldActive && newActive && oldGroup == newGroup && oldOrder != newOrder) {
            
            if (newOrder < oldOrder)
                toChange.addAll(queryRange(newGroup, newOrder, oldOrder, 1, productId));
            else
                toChange.addAll(queryRange(newGroup, oldOrder, newOrder, -1, productId));
        }
        
        else if (oldActive && newActive && oldGroup != newGroup) {
            toChange.addAll(queryShift(oldGroup, oldOrder, '>', -1, productId));
            toChange.addAll(queryShift(newGroup, newOrder, '>=', 1, productId));
        }
        
        if (!toChange.isEmpty())
            if (Schema.sObjectType.Product2.isUpdateable()) {
                Database.update(toChange, false,AccessLevel.USER_MODE);
            }
        //update as user updates;
    }*/
  /* private static List<Product2> queryRange(String groupKey,Integer fromOrder, Integer toOrder,Integer delta,Id excludeProductId) {
        
        if (groupKey == null || fromOrder == null || toOrder == null)
            return new List<Product2>();
        
        Integer minVal = Math.min(fromOrder, toOrder);
        Integer maxVal = Math.max(fromOrder, toOrder);
        
        List<Product2> products = [
            SELECT Id, Product_Display_Order__c, Product_Line__c
            FROM Product2
            WHERE IsActive = true
            AND Product_Display_Order__c != null
            AND Name != 'Total'
            AND Id != :excludeProductId
            WITH USER_MODE
        ];
        
        List<Product2> updates = new List<Product2>();
        
        for (Product2 p : products) {
            
            if (orderGroup(p.Product_Line__c) != groupKey)
                continue;
            
            Integer ord = toInt(p.Product_Display_Order__c);
            
            if (ord != null && ord >= minVal && ord <= maxVal) {
                p.Product_Display_Order__c = padOrder(ord + delta);
                updates.add(p);
            }
        }
        
        return updates;
    }*/
   /* private static List<Product2> queryShift(String groupKey,Integer orderValue,String operator,Integer delta,Id excludeProductId ) {
        if (groupKey == null || orderValue == null)
            return new List<Product2>();
        List<Product2> products = [
            SELECT Id, Product_Display_Order__c, Product_Line__c  FROM Product2 WHERE IsActive = true  AND Product_Display_Order__c != null AND Name != 'Total' AND Id != :excludeProductId  WITH USER_MODE];
        List<Product2> updates = new List<Product2>();
        for (Product2 p : products) {
            if (orderGroup(p.Product_Line__c) != groupKey)
                continue;
            Integer ord = toInt(p.Product_Display_Order__c);
            if (ord == null)
                continue;
            Boolean match =
                (operator == '>'  && ord >  orderValue) ||
                (operator == '>=' && ord >= orderValue);
            if (match) {
                p.Product_Display_Order__c = padOrder(ord + delta);
                updates.add(p);
            }
        }
        return updates;
    }*/
    /*******************************************
Sends Quick Validate Picklist Values
Input  : String
Output : void
*********************************************/
    
    
   /* private static void validateProductFamily(String familyValue) {
        if (String.isBlank(familyValue)) return;
        
        Set<String> allowed = new Set<String>();
        for (Schema.PicklistEntry pe : Product2.Family.getDescribe().getPicklistValues()) {
            if (pe.isActive()) { // Only active values
                allowed.add(pe.getValue());
            }
        }
        
        if (!allowed.contains(familyValue)) {
            throw new AuraHandledException(
                'Invalid Picklist value for Product Family : "' + familyValue + '".'
            );
        }
    }*/
    
   /* private static String validateProductFamilyBulk(String familyValue) {
        
        if (String.isBlank(familyValue)) return null;
        
        Set<String> allowed = new Set<String>();
        for (Schema.PicklistEntry pe : Product2.Family.getDescribe().getPicklistValues()) {
            if (pe.isActive()) {
                allowed.add(pe.getValue());
            }
        }
        
        if (!allowed.contains(familyValue)) {
            return 'Invalid Product Family value: "' + familyValue + '"';
        }
        
        return null;
    }*/
    /*******************************************
Sends Quick Publish summary email
Input  : successCount, errorCount, totalCount, successRows, errorRows
Output : void
*********************************************/
    private static void sendQuickPublishEmail(Integer successCount, Integer errorCount,Integer totalCount,List<String> successRows, List<String> errorRows,Boolean includeChangeTracker) {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        /*OrgWideEmailAddress owea = [SELECT Id, Address, DisplayName 
FROM OrgWideEmailAddress 
WHERE DisplayName = 'Merit' LIMIT 1];*/
        OrgWideEmailAddress[] owea = [SELECT Id FROM OrgWideEmailAddress WHERE DisplayName = 'Merit' LIMIT 1];
        //OrgWideEmailAddress owea = [SELECT Id FROM OrgWideEmailAddress WHERE Address = 'exploregearset@gmail.com' LIMIT 1];

        mail.setToAddresses(new List<String>{ UserInfo.getUserEmail() });
        if (errorCount > 0) {
            String ccLabel = System.Label.PIM_CC_Emails_on_error_notification;
            List<String> ccList = ccLabel.split(',');
            mail.setCcAddresses(ccList);
           // mail.setOrgWideEmailAddressId(owea.Id);
           mail.setOrgWideEmailAddressId(owea.get(0).Id);
            // mail.setOrgWideEmailAddressId(owea.Id);
            //mail.setCcAddresses(new List<String>{'chandrikakottanuru@gmail.com','chandukottanuru11@gmail.com'} );
        }
        mail.setSubject('PIM Product Stage - Quick Publish Summary');
        String body =
            'Hi ' + UserInfo.getName() + ',<br/><br/>' +
            'Below is the summary of your Quick Publish activity:<br/><br/>' +
            '<b>Successfully Published Products:</b> ' + successCount + '<br/>' +
            '<b>Unsuccessful Records with Error:</b> ' + errorCount + '<br/>' +
            '<b>Total Records:</b> ' + totalCount + '<br/><br/>';
        // Success table
        // if(!successRows.isEmpty()){
        /* if(!successRows.isEmpty()){
body +=
'<b>Successfully Published Products</b><br/>' +
'<table border="1" cellpadding="6" cellspacing="0" width="100%">' +
'<tr>' +
'<th>Product Name</th>' +
'<th>Product Code</th>' +
'<th>Change Type</th>' +
if (includeChangeTracker) {
body += '<th>Change Tracker</th>';
}
body += '</tr>' +
String.join(successRows, '') +
'</table><br/><br/>';
'<th>Change Tracker</th>' +
'</tr>' +
String.join(successRows, '') +
'</table><br/><br/>';
}*/
        if (!successRows.isEmpty()) {
            
            body +=
                '<b>Successfully Published Products</b><br/>' +
                '<table border="1" cellpadding="6" cellspacing="0" width="100%">' +
                '<tr>' +
                '<th>Product Name</th>' +
                '<th>Product Code</th>' +
                '<th>Change Type</th>';
            
            if (includeChangeTracker) {
                body += '<th>Change Tracker</th>';
            }
            
            body +=
                '</tr>' +
                String.join(successRows, '') +
                '</table><br/><br/>';
        }
        // Error table
        /*if (!errorRows.isEmpty()) {
body +=
'<b>Unsuccessful Records with Error</b><br/>' +
'<table border="1" cellpadding="6" cellspacing="0" width="100%">' +
'<tr>' +
'<th>Product Name</th>' +
'<th>Product Code</th>' +
'<th>Staging Record</th>' +
'<th>Change Type</th>' +
'<th>Change Tracker</th>' +
'<th>Reason for Error</th>' +
'</tr>' +
String.join(errorRows, '') +
'</table><br/><br/>';
}*/
        // Error table
        if (!errorRows.isEmpty()) {
            
            body +=
                '<b>Unsuccessful Records with Error</b><br/>' +
                '<table border="1" cellpadding="6" cellspacing="0" width="100%">' +
                '<tr>' +
                '<th>Product Name</th>' +
                '<th>Product Code</th>' +
                '<th>Staging Record</th>' +
                '<th>Change Type</th>';
            
            if (includeChangeTracker) {
                body += '<th>Change Tracker</th>';
            }
            
            body +=
                '<th>Reason for Error</th>' +
                '</tr>' +
                String.join(errorRows, '') +
                '</table><br/><br/>';
        }
        body += 'Thank you,<br/>MERIT Team';
        mail.setHtmlBody(body);
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ mail });
    }
    /******************************************
Builds audit description for Update publish
Input  : PIM_Product_Stage__c
Output : String
********************************************/
    private static String buildAuditDescription(PIM_Product_Stage__c stage) {
        List<String> changes = new List<String>();
        Map<String, Schema.SObjectField> stageDescribe = Schema.SObjectType.PIM_Product_Stage__c.fields.getMap();
        for (String stageField : FIELD_CONFIG.keySet()) {
            Map<String, String> cfg = FIELD_CONFIG.get(stageField);
            Object newVal = stage.get(stageField);              
            Object oldVal = stage.get(cfg.get('snapshot'));    
            String newStr = newVal == null ? 'NULL' : String.valueOf(newVal);
            String oldStr = oldVal == null ? 'NULL' : String.valueOf(oldVal);
            if (newStr != oldStr) {
                //String label = stageDescribe.get(stageField).getDescribe().getLabel();
                 String label = stageDescribe.get(cfg.get('snapshot')).getDescribe().getLabel();
                changes.add(label + ': ' + oldStr + ' → ' + newStr);
                //changes.add(label + ': ' +(oldStr == '' ? '—' : oldStr) + ' → ' +(newStr == '' ? '—' : newStr));
            }
        }
        return changes.isEmpty() ? 'No field changes detected.': String.join(changes, '\n');
    }
    /****************************
     Validates picklist values before dml
input : stage record
output:error message
****************************************************/
    private static List<String> validatePicklists(PIM_Product_Stage__c s) {
        
        List<String> errors = new List<String>();
        
        Map<String, Schema.SObjectField> prodFields =
            Schema.SObjectType.Product2.fields.getMap();
        
        for (String stageField : FIELD_CONFIG.keySet()) {
            
            Map<String, String> cfg = FIELD_CONFIG.get(stageField);
            String productField = cfg.get('product');
            
            Object stageVal = s.get(stageField);
            if (stageVal == null) continue;
            
            Schema.DescribeFieldResult dfr =
                prodFields.get(productField).getDescribe();
            
            // PICKLIST
            if (dfr.getType() == Schema.DisplayType.Picklist) {
                
                Set<String> allowed = allowedValues(prodFields.get(productField));
                
                if (!allowed.contains(String.valueOf(stageVal))) {
                    errors.add(
                        dfr.getLabel() +
                        ' has invalid value: "' +
                        String.valueOf(stageVal) + '"'
                    );
                }
            }
            
            // MULTIPICKLIST
            if (dfr.getType() == Schema.DisplayType.MultiPicklist) {
                
                Set<String> allowed = allowedValues(prodFields.get(productField));
                Set<String> stageSet = new Set<String>(
                    String.valueOf(stageVal).split(';')
                );
                
                for (String v : stageSet) {
                    if (!allowed.contains(v)) {
                        errors.add(
                            dfr.getLabel() +
                            ' has invalid value: "' + v + '"'
                        );
                    }
                }
            }
        }
        
        return errors;
    }
    /*******************************
Builds audit description for Create 
Input  : PIM_Product_Stage__c
Output : String
*********************************/
    private static String buildCreateAuditDescription(PIM_Product_Stage__c stage) {
        List<String> changes = new List<String>();
        Map<String, Schema.SObjectField> stageDescribe =Schema.SObjectType.PIM_Product_Stage__c.fields.getMap();
        for (String stageField : FIELD_CONFIG.keySet()) {
           Map<String, String> cfg = FIELD_CONFIG.get(stageField);
            Object newVal = stage.get(stageField);
            if (newVal != null) {
                //String label = stageDescribe.get(stageField).getDescribe().getLabel();
                String label = stageDescribe.get(cfg.get('snapshot')).getDescribe().getLabel();
                String newStr = String.valueOf(newVal);
                changes.add(label + ': ' + newStr);
            }
        }
        return changes.isEmpty()? 'Product created with no field values.': String.join(changes, '\n');
    }
}