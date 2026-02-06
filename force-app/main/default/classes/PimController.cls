/***********************************************************************
Name: PimController
Purpose: Review PIM Stage vs Product  fields and publish Stage values to Product2 after validation
VERSION     DATE        DETAIL
1.0         28/01/2026  INITIAL DEVELOPMENT
***********************************************************************/
public with sharing class PimController {
    private static final String MEDICAL = 'Medical';
    public class DiffWrapper {
        @AuraEnabled public String stageField;
        @AuraEnabled public String stageLabel;
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
    // Method To compare prod and stage snapshots
    private static final Map<String, Map<String, String>> FIELD_CONFIG = new Map<String, Map<String, String>>{
        'PIM_Name_Stage__c' => new Map<String, String>{
            'snapshot' => 'PIM_Name_Prod__c',
                'product'  => 'PIM_Name__c'
                },
                    'IsActiveStage__c' => new Map<String, String>{
                        'snapshot' => 'Active_Prod__c',
                            'product'  => 'IsActive'
                            },
                                
                                'Product_Line_Stage__c' => new Map<String, String>{
                                    'snapshot' => 'Product_Line_Prod__c',
                                        'product'  => 'Product_Line__c'
                                        },
                                            
                                            'Level_2_Options_Stage__c' => new Map<String, String>{
                                                'snapshot' => 'Level2_Options_Prod__c',
                                                    'product'  => 'Level_2_Options__c'
                                                    },
                                                        
                                                        'Product_Display_Order_Stage__c' => new Map<String, String>{
                                                            'snapshot' => 'Product_Display_Order_Prod__c',
                                                                'product'  => 'Product_Display_Order__c'
                                                                }
    };
    private static DiffWrapper buildDiff( String stageField, String snapshot, String productField, String sVal, String pVal, Map<String, Schema.SObjectField> stageDesc, Map<String, Schema.SObjectField> prodDesc) {
        DiffWrapper dw = new DiffWrapper();
        dw.stageField = stageField;
        dw.snapshotField = snapshot;
        dw.productField = productField;
        dw.stageLabel = stageDesc.get(stageField).getDescribe().getLabel();
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
      @AuraEnabled(cacheable=true)
        public static List<DiffWrapper> getDifferences(Id stageRecordId) {
            Set<String> fields = new Set<String>{ 'Id', 'Product_Name_Prod__c' };
                for (String f : FIELD_CONFIG.keySet()) {
                    fields.add(f);
                    fields.add(FIELD_CONFIG.get(f).get('snapshot'));
                }
            PIM_Product_Stage__c stage = Database.query('SELECT ' + String.join(new List<String>(fields), ',') +' FROM PIM_Product_Stage__c WHERE Id = :stageRecordId');
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
    @AuraEnabled
    public static void updateProductOnPublish(Id stageRecordId) {
        PIM_Product_Stage__c stage =[SELECT Product_Name_Prod__c,PIM_Name_Stage__c, PIM_Name_Prod__c,
                                     IsActiveStage__c, Active_Prod__c,Product_Line_Stage__c, Product_Line_Prod__c,Level_2_Options_Stage__c, Level2_Options_Prod__c,
                                     Product_Display_Order_Stage__c,Product_Display_Order_Prod__c FROM PIM_Product_Stage__c WHERE Id = :stageRecordId];
        Integer oldOrder = toInt(stage.Product_Display_Order_Prod__c);
        Integer newOrder = toInt(stage.Product_Display_Order_Stage__c);
        handleDisplayOrderShift( stage.Product_Name_Prod__c,stage.Product_Line_Prod__c,stage.Product_Line_Stage__c,stage.Active_Prod__c,stage.IsActiveStage__c,oldOrder,newOrder);
        Product2 prod = new Product2( Id = stage.Product_Name_Prod__c,
                                     PIM_Name__c = stage.PIM_Name_Stage__c,
                                     IsActive = stage.IsActiveStage__c,
                                     Product_Line__c = stage.Product_Line_Stage__c,
                                     Level_2_Options__c = stage.Level_2_Options_Stage__c,
                                     Product_Display_Order__c = padOrder(newOrder));
        update prod;
        stage.Status__c = 'In Sync';
        stage.Product_Change_Type__c = 'No Change';
        update stage;
    }
    private static void handleDisplayOrderShift(Id productId,String oldLine,String newLine,Boolean oldActive,Boolean newActive,Integer oldOrder,Integer newOrder) {
        List<Product2> updates = new List<Product2>();
        if (oldActive && !newActive) {
            updates.addAll(queryShift(oldLine, oldOrder, '>', -1, productId));
        }
        else if (!oldActive && newActive) {
            updates.addAll(queryShift(newLine, newOrder, '>=', 1, productId));
        }
        else if (oldActive && newActive && oldLine == newLine && oldOrder != newOrder) {
            if (newOrder < oldOrder)
                updates.addAll(queryRange(newLine, newOrder, oldOrder, 1, productId));
            else
                updates.addAll(queryRange(newLine, oldOrder, newOrder, -1, productId));
        }
        else if (oldActive && newActive && oldLine != newLine) {
            updates.addAll(queryShift(oldLine, oldOrder, '>', -1, productId));
            updates.addAll(queryShift(newLine, newOrder, '>=', 1, productId));
        }
        if (!updates.isEmpty()) update updates;
    }
    private static List<Product2> queryRange(String productLine, Integer fromOrder,Integer toOrder,Integer delta,Id excludeProductId) {
        if (productLine == null || fromOrder == null || toOrder == null) {
            return new List<Product2>();
        }
        Integer minVal = Math.min(fromOrder, toOrder);
        Integer maxVal = Math.max(fromOrder, toOrder);
        //  NO ORDER FILTER IN SOQL
        List<Product2> products = [ SELECT Id, Product_Display_Order__c FROM Product2 WHERE IsActive = true  AND Product_Line__c = :productLine AND Id != :excludeProductId];
        List<Product2> updates = new List<Product2>();
        for (Product2 p : products) {
            Integer ord = toInt(p.Product_Display_Order__c);
            if (ord != null && ord >= minVal && ord <= maxVal) {
                p.Product_Display_Order__c =
                    padOrder(ord + delta);
                updates.add(p);
            }
        }
        return updates;
    }
    private static List<Product2> queryShift(String productLine, Integer orderValue, String operator, Integer delta, Id excludeProductId) {
        if (productLine == null || orderValue == null) {
            return new List<Product2>();
        }
        // NO ORDER FILTER IN SOQL
        List<Product2> products = [ SELECT Id, Product_Display_Order__c FROM Product2 WHERE IsActive = true AND Product_Line__c = :productLine AND Id != :excludeProductId];
        List<Product2> updates = new List<Product2>();
        for (Product2 p : products) {
            Integer ord = toInt(p.Product_Display_Order__c);
            if (ord == null) 
                continue;
            Boolean match =
                (operator == '>'  && ord >  orderValue) ||
                (operator == '>=' && ord >= orderValue);
            if (match) {
                p.Product_Display_Order__c =
                    padOrder(ord + delta);
                updates.add(p);
            }
        }
        return updates;
    }
    /*****Helper methods**********/
    private static Integer toInt(Object val) {
        if (val == null) 
            return null;
        try {
            return Integer.valueOf(String.valueOf(val));
        } catch (Exception e) {
            return null;
        }
    }
    private static String padOrder(Integer value) {
        if (value == null) return null;
        return String.valueOf(value).leftPad(4, '0'); // 4 = padding length
    }
    private static Set<String> splitMulti(String val) {
        if (String.isBlank(val))
            return new Set<String>();
        return new Set<String>(val.split(';'));
    }
    private static Set<String> allowedValues(Schema.SObjectField f) {
        Set<String> vals = new Set<String>();
        for (Schema.PicklistEntry p :
             f.getDescribe().getPicklistValues()) {
                 vals.add(p.getValue());
             }
        return vals;
    }
    /* ================= HELPER ================= */
    private static Set<String> normalizeToSet(Object val) {
        Set<String> result = new Set<String>();
        if (val == null) return result;
        
        String str = String.valueOf(val).trim();
        if (str == '') return result;
        
        for (String v : str.split(';')) {
            result.add(v.trim());
        }
        return result;
    }
    
    //Method to get Picklist comparision
    @AuraEnabled(cacheable=true)
    public static Map<String, List<String>> getProductPicklists() {
        Map<String, List<String>> result = new Map<String, List<String>>();
        Schema.DescribeSObjectResult prodDesc = Product2.SObjectType.getDescribe();
        Map<String, Schema.SObjectField> fieldMap = prodDesc.fields.getMap();
        List<String> fields = new List<String>{'Funding_Type__c', 'Family','Product_Line__c','Level_2_Options__c','Surest_Applicable_Products__c'};
            List<String> values = new List<String>();
        for (String fieldName : fields) {
            for (Schema.PicklistEntry ple :
                 fieldMap.get(fieldName).getDescribe().getPicklistValues()) {
                     values.add(ple.getValue());
                 }
            result.put(fieldName, values);
        }
        return result;
    }
    
    //Method to get Stage values to show in UI for Create
    @AuraEnabled(cacheable=true)
    public static List<PIM_Product_Stage__c>  getStageValues(Id stageRecordId){
        List<PIM_Product_Stage__c> pimProductList = [SELECT  PIM_ID_Stage__c, PIM_Name_Stage__c, PIM_Parent_ID_Stage__c,PIM_Parent_Name_Stage__c, PIM_SME_Name_Stage__c,PIM_ID_Composite_Stage__c, PIM_Availability_Stage__c,
                                                     Id_Stage__c,Program_Code_Stage__c,Supplier_Code_Stage__c,Product_Name_Stage__c,IsActiveStage__c, Funding_Type_Stage__c, Product_Line_Stage__c, Level_2_Options_Stage__c,
                                                     Surest_Applicable_Products_Stage__c,Product_Code_Stage__c,
                                                     CPW_Applicable_Product_Stage__c, SFGO_Applicable_Product_Stage__c,
                                                     Considered_For_StepWise_Integration__c, Distribution_Type_Flag__c, 
                                                     StepWise_Product_Name__c,StepWise_Product_RowID__c,Underwriting_Validation__c,
                                                     Do_Not_Include_in_Total__c, Key_Growth_Drivers__c, Eligible_for_Sales_Incentives__c,Enterprise_Growth_Product__c,
                                                     Product_Display_Order_Stage__c,Reporting_Product_Type__c
                                                     FROM PIM_Product_Stage__c WHERE Id = :stageRecordId LIMIT 1];
        if (!pimProductList.isEmpty()) {
            PIM_Product_Stage__c pim = pimProductList[0];
        } else {
            System.debug('No record Found') ;
        }
        return pimProductList;
    }
    
    private static void handleOrderShift(Id productId,String productLine,String oldOrderRaw,String newOrderRaw,Boolean oldActive,Boolean newActive) {
        if (String.isBlank(productLine)) return;
        // Normalize order strings (already padded in DB)
        String oldOrder = String.isBlank(oldOrderRaw) ? null : oldOrderRaw;
        String newOrder = String.isBlank(newOrderRaw) ? null : newOrderRaw;
        Set<String> orderLines = getOrderGroupLines(productLine);
        List<Product2> toUpdate = new List<Product2>();
        /* -------- ACTIVE → INACTIVE -------- */
        if (oldActive == true && newActive == false && oldOrder != null) {
            toUpdate = [SELECT Id, Product_Display_Order__c
                        FROM Product2 WHERE Product_Line__c IN :orderLines
                        AND IsActive = true
                        AND Product_Display_Order__c > :oldOrder
                        AND Id != :productId];
            for (Product2 p : toUpdate) {
                Integer curr = Integer.valueOf(p.Product_Display_Order__c);
                p.Product_Display_Order__c =
                    String.valueOf(curr - 1).leftPad(4, '0');
            }
        }
        /* -------- INACTIVE → ACTIVE -------- */
        else if (oldActive == false && newActive == true && newOrder != null) {
            toUpdate = [
                SELECT Id, Product_Display_Order__c
                FROM Product2
                WHERE Product_Line__c IN :orderLines
                AND IsActive = true
                AND Product_Display_Order__c >= :newOrder
                AND Id != :productId ];
            for (Product2 p : toUpdate) {
                Integer curr = Integer.valueOf(p.Product_Display_Order__c);
                p.Product_Display_Order__c = String.valueOf(curr + 1).leftPad(4, '0');
            }
        }
        /* -------- ACTIVE → ACTIVE (REORDER) -------- */
        else if (
            oldActive == true && newActive == true &&
            oldOrder != null && newOrder != null &&
            oldOrder != newOrder
        ) {
            if (newOrder > oldOrder) {
                toUpdate = [
                    SELECT Id, Product_Display_Order__c
                    FROM Product2
                    WHERE Product_Line__c IN :orderLines
                    AND IsActive = true
                    AND Product_Display_Order__c > :oldOrder
                    AND Product_Display_Order__c <= :newOrder
                    AND Id != :productId];
                for (Product2 p : toUpdate) {
                    Integer curr = Integer.valueOf(p.Product_Display_Order__c);
                    p.Product_Display_Order__c =
                        String.valueOf(curr - 1).leftPad(4, '0');
                }
            } else {
                toUpdate = [
                    SELECT Id, Product_Display_Order__c
                    FROM Product2
                    WHERE Product_Line__c IN :orderLines
                    AND IsActive = true
                    AND Product_Display_Order__c >= :newOrder
                    AND Product_Display_Order__c < :oldOrder
                    AND Id != :productId];
                for (Product2 p : toUpdate) {
                    Integer curr = Integer.valueOf(p.Product_Display_Order__c);
                    p.Product_Display_Order__c =
                        String.valueOf(curr + 1).leftPad(4, '0');
                }
            }
        }
        
        if (!toUpdate.isEmpty()) {
            update toUpdate;
        }
    }
    private static Set<String> getOrderGroupLines(String productLine) {
        if (productLine == 'Medical') {
            return new Set<String>{ 'Medical' };
                }
        return new Set<String>{ 'Other','Pharmacy','Dental', 'Vision'};
            }
    //Method to Create Product 
    @AuraEnabled
    public static void createProduct2(Id stageRecordId){
        if (stageRecordId == null) {
            throw new AuraHandledException('Stage Record Id is required');
        }
        PIM_Product_Stage__c pim = [
            SELECT PIM_ID_Stage__c,PIM_Name_Stage__c, PIM_Parent_ID_Stage__c,PIM_Parent_Name_Stage__c, PIM_SME_Name_Stage__c,
            PIM_ID_Composite_Stage__c, PIM_Availability_Stage__c,Program_Code_Stage__c,Supplier_Code_Stage__c, Id_Stage__c,
            Product_Name_Stage__c,Product_Code_Stage__c,IsActiveStage__c,Funding_Type_Stage__c,Product_Line_Stage__c,
            Level_2_Options_Stage__c, Surest_Applicable_Products_Stage__c, CPW_Applicable_Product_Stage__c,  SFGO_Applicable_Product_Stage__c,
            Considered_For_StepWise_Integration__c, Distribution_Type_Flag__c,StepWise_Product_Name__c,StepWise_Product_RowID__c,Underwriting_Validation__c,
            Do_Not_Include_in_Total__c,Key_Growth_Drivers__c, Eligible_for_Sales_Incentives__c, Enterprise_Growth_Product__c,Product_Display_Order_Stage__c,Reporting_Product_Type__c
            FROM PIM_Product_Stage__c WHERE Id = :stageRecordId LIMIT 1];
        Id standardPricebookId = [SELECT Id FROM Pricebook2 WHERE IsStandard = true  LIMIT 1].Id;
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
        
        if (pim.Eligible_for_Sales_Incentives__c != null) {
            prod.Eligible_for_Sales_Incentives__c =
                pim.Eligible_for_Sales_Incentives__c;
        }
        
        /*if (pim.Product_Display_Order_Stage__c != null) {
prod.Product_Display_Order__c = pim.Product_Display_Order_Stage__c;
// PimController.reorderOnInsert(prod.Id,  pim.Product_Display_Order_Stage__c, pim.Product_Line_Stage__c );
}*/
        
        if (pim.Reporting_Product_Type__c != null) {
            prod.Reporting_Product_Type__c =  pim.Reporting_Product_Type__c;
        }
        
        if (pim.Key_Growth_Drivers__c != null) {
            prod.TCOC_Hit_List__c =
                pim.Key_Growth_Drivers__c;
        }
        try {
            prod.Product_Display_Order__c = pim.Product_Display_Order_Stage__c;
            insert prod;
            if (pim.Product_Display_Order_Stage__c != null &&  pim.Product_Line_Stage__c != null) {
                PimController.reorderOnInsert(prod.Id,pim.Product_Display_Order_Stage__c,  pim.Product_Line_Stage__c );
                prod.Product_Display_Order__c = pim.Product_Display_Order_Stage__c;
                update prod;
            }
            pim.Product_Name_Prod__c = prod.Id;                
            pim.Status__c = 'In Sync';
            pim.Product_Change_Type__c = 'No Change';
            pim.Product_Display_Order_Stage__c = prod.Product_Display_Order__c;
            update pim;
            System.debug('New Product created with ID: ' + prod.Id);
            PricebookEntry standardEntry = new PricebookEntry(
                Pricebook2Id = standardPricebookId,
                Product2Id = prod.Id,
                UnitPrice = 1,
                IsActive = true);
            insert standardEntry;
            System.debug('Standard PricebookEntry created with ID: ' + standardEntry.Id);
        } catch (DmlException e) {
            System.debug('An error occurred during DML operation: ' + e.getMessage());
        }
        
    }
    //Method to Change display order  
    @AuraEnabled
    public static void reorderOnInsert(Id newProductId,String newOrderStr,String productLine) {
        if (String.isBlank(newOrderStr) || String.isBlank(productLine)) 
            return;
        Integer newOrder;
        try {
            newOrder = Integer.valueOf(newOrderStr);
        }
        catch (Exception e) {
            return;
        }
        List<Product2> toShift = [SELECT Id, Product_Display_Order__c FROM Product2 WHERE Product_Line__c = :productLine AND Product_Display_Order__c >= :newOrderStr AND Id != :newProductId];
        for (Product2 p : toShift) {
            Integer curr = Integer.valueOf(p.Product_Display_Order__c);
            p.Product_Display_Order__c = String.valueOf(curr + 1).leftPad(4, '0');
        }
        if (!toShift.isEmpty()) {
            update toShift;
        }
    }
    @AuraEnabled
    public static void reorderOnUpdate(Id productId,String oldOrderStr,String newOrderStr,String productLine) {
        if (String.isBlank(oldOrderStr)|| String.isBlank(newOrderStr)|| oldOrderStr == newOrderStr) {
            return;
        }
        List<Product2> toShift = new List<Product2>();
        if (oldOrderStr < newOrderStr) {
            toShift = [
                SELECT Id, Product_Display_Order__c
                FROM Product2
                WHERE Product_Line__c = :productLine
                AND Product_Display_Order__c > :oldOrderStr
                AND Product_Display_Order__c <= :newOrderStr
                AND Id != :productId];
            
            for (Product2 p : toShift) {
                Integer curr = Integer.valueOf(p.Product_Display_Order__c);
                p.Product_Display_Order__c =
                    String.valueOf(curr - 1).leftPad(4, '0');
            }
        }
        else {
            toShift = [
                SELECT Id, Product_Display_Order__c FROM Product2
                WHERE Product_Line__c = :productLine
                AND Product_Display_Order__c >= :newOrderStr
                AND Product_Display_Order__c < :oldOrderStr
                AND Id != :productId];
            for (Product2 p : toShift) {
                Integer curr = Integer.valueOf(p.Product_Display_Order__c);
                p.Product_Display_Order__c =
                    String.valueOf(curr + 1).leftPad(4, '0');
            }
        }
        
        if (!toShift.isEmpty()) {
            update toShift;
        }
    }
    @AuraEnabled
    public static List<PIM_Product_Stage__c> getProducts(String filterType){
        List<PIM_Product_Stage__c> allProducts = new List<PIM_Product_Stage__c>();
        try{
            allProducts = [SELECT Id,Product_Name_Stage__c, Product_Code_Stage__c, Product_Change_Type__c,Change_Tracker__c,
                           PIM_ID_Stage__c,PIM_Parent_ID_Stage__c,PIM_Name_Stage__c, PIM_Parent_Name_Stage__c, PIM_SME_Name_Stage__c,
                           Program_Code_Stage__c,Supplier_Code_Stage__c,PIM_Availability_Stage__c,Product_Line_Stage__c,Funding_Type_Stage__c,
                           Level_2_Options_Stage__c,Product_Family_Stage__c,Product_Display_Order_Stage__c  from PIM_Product_Stage__c where Product_Change_Type__c =:filterType];
        }
        catch(Exception e){
            System.debug('No Records  Found');
        }
        System.debug('allProducts'+ allProducts);
        return allProducts;
    }
    @AuraEnabled
    public static Map<Id, List<DiffWrapper>> getBulkDifferences(List<Id> stageRecordIds) {
        Map<Id, List<DiffWrapper>> result = new Map<Id, List<DiffWrapper>>();
        for (Id stageId : stageRecordIds) {
            result.put(stageId, getDifferences(stageId));
        }
        return result;
    }
    //Bulk Create
    @AuraEnabled
    public static void bulkCreateProducts(List<Id> stageIds) {
        Savepoint sp = Database.setSavepoint();
        
        try {
            /* LOAD STAGE RECORDS*/
            List<PIM_Product_Stage__c> stages = [
                SELECT Id,PIM_Name_Stage__c, Product_Name_Stage__c,Product_Code_Stage__c,
                IsActiveStage__c,Product_Line_Stage__c,Level_2_Options_Stage__c,
                Product_Display_Order_Stage__c FROM PIM_Product_Stage__c WHERE Id IN :stageIds];
            if (stages.isEmpty()) return;
            /* 2. FIND CURRENT MAX ORDER PER LINE */
            Map<String, Integer> maxOrderByLine = new Map<String, Integer>();
            for (Product2 p : [SELECT Product_Line__c, Product_Display_Order__c
                               FROM Product2 WHERE IsActive = true]) {
                                   Integer ord = toInt(p.Product_Display_Order__c);
                                   if (ord == null) 
                                       continue;
                                   Integer curr = maxOrderByLine.get(p.Product_Line__c);
                                   if (curr == null || ord > curr) {
                                       maxOrderByLine.put(p.Product_Line__c, ord);
                                   }
                               }
            
            /*  COLLECT MIN ORDER PER LINE*/
            Map<String, Integer> minOrderByLine = new Map<String, Integer>();
            for (PIM_Product_Stage__c s : stages) {
                if (!s.IsActiveStage__c) continue;
                Integer ord = toInt(s.Product_Display_Order_Stage__c);
                if (ord == null) 
                    continue;
                if (!minOrderByLine.containsKey(s.Product_Line_Stage__c) || ord < minOrderByLine.get(s.Product_Line_Stage__c)) {
                    minOrderByLine.put(s.Product_Line_Stage__c, ord);
                }
            }
            
            /*  SHIFT EXISTING PRODUCTS (ONCE PER LINE) */
            List<Product2> orderUpdates = new List<Product2>();
            for (String line : minOrderByLine.keySet()) {
                orderUpdates.addAll(
                    shiftOrdersForInsert(
                        line,
                        minOrderByLine.get(line)
                    )
                );
            }
            
            if (!orderUpdates.isEmpty()) {
                update orderUpdates;
            }
            
            /*  INSERT NEW PRODUCTS */
            List<Product2> toInsert = new List<Product2>();
            for (PIM_Product_Stage__c s : stages) {
                Integer nextOrder = toInt(s.Product_Display_Order_Stage__c);
                if (nextOrder == null) {
                    nextOrder = (maxOrderByLine.get(s.Product_Line_Stage__c) == null) ? 1 : maxOrderByLine.get(s.Product_Line_Stage__c) + 1;
                }
                maxOrderByLine.put(s.Product_Line_Stage__c, nextOrder);
                Product2 p = new Product2(
                    Name                     = s.Product_Name_Stage__c,
                    ProductCode              = s.Product_Code_Stage__c,
                    PIM_Name__c              = s.PIM_Name_Stage__c,
                    IsActive                 = s.IsActiveStage__c,
                    Product_Line__c          = s.Product_Line_Stage__c,
                    Level_2_Options__c       = s.Level_2_Options_Stage__c,
                    Product_Display_Order__c = padOrder(nextOrder)
                );
                
                toInsert.add(p);
            }
            
            insert toInsert;
            /*  ADD STANDARD PRICEBOOK */
            // Get Standard Price Book
            Id standardPricebookId = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1].Id;
            List<PricebookEntry> pricebookEntries = new List<PricebookEntry>();
            for (Integer i = 0; i < toInsert.size(); i++) {
                PIM_Product_Stage__c s = stages[i];
                Product2 p = toInsert[i];
                pricebookEntries.add(
                    new PricebookEntry(
                        Pricebook2Id = standardPricebookId,
                        Product2Id   = p.Id,
                        UnitPrice    = 1,
                        IsActive     = true,
                        UseStandardPrice = false ));
            }
            if (!pricebookEntries.isEmpty()) {
                insert pricebookEntries;
            }
            
            
            /* ============================
* 6. UPDATE STAGE STATUS
* ============================ */
            for (PIM_Product_Stage__c s : stages) {
                s.Status__c = 'In Sync';
                s.Product_Change_Type__c = 'No Change';
            }
            update stages;
        } catch (DmlException e) {
            Database.rollback(sp);
            String msg = e.getDmlMessage(0);
            if (msg.contains('INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST')) {
                throw new AuraHandledException(
                    'One or more picklist values do not match Product configuration.'
                );
            }
            throw new AuraHandledException(msg);
        }
        catch (Exception e) {
            Database.rollback(sp);
            throw new AuraHandledException(e.getMessage());
        }
    }
    private static List<Product2> shiftOrdersForInsert(String productLine,Integer fromOrder) {
        List<Product2> updates = new List<Product2>();
        if (productLine == null || fromOrder == null) {
            return updates;
        }
        List<Product2> products = [SELECT Id, Product_Display_Order__c
                                   FROM Product2 WHERE IsActive = true AND Product_Line__c = :productLine];
        for (Product2 p : products) {
            Integer ord = toInt(p.Product_Display_Order__c);
            if (ord != null && ord >= fromOrder) {
                p.Product_Display_Order__c =
                    padOrder(ord + 1);
                updates.add(p);
            }
        }
        return updates;
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
        /*  BUILD FIELD LIST */
        Set<String> fields = new Set<String>{ 'Id' };
            for (String stageField : FIELD_CONFIG.keySet()) {
                fields.add(stageField);
                fields.add(FIELD_CONFIG.get(stageField).get('snapshot'));
            }
        /*  QUERY ALL STAGE RECORDS (ONCE) */
        List<PIM_Product_Stage__c> stages =Database.query('SELECT ' + String.join(new List<String>(fields), ',') +' FROM PIM_Product_Stage__c WHERE Id IN :stageIds');
        Map<String, Schema.SObjectField> stageDescribe =Schema.SObjectType.PIM_Product_Stage__c.fields.getMap();
        /*  BUILD DIFFS PER RECORD */
        for (PIM_Product_Stage__c stage : stages) {
            List<DiffWrapper> diffs =
                buildDiffs(stage, stageDescribe);
            if (!diffs.isEmpty()) {
                result.put(stage.Id, diffs);
            }
        }
        return result;
    }
    
    @AuraEnabled
    public static void updateProductsBulk(List<Id> stageIds) {
        if (stageIds == null || stageIds.isEmpty()) return;
        
        Savepoint sp = Database.setSavepoint();
        
        try {
            /* Load Stage Records */
            List<PIM_Product_Stage__c> stages = [
                SELECT Id, PIM_Name_Prod__c,Product_Name_Prod__c,
                Product_Line_Stage__c,
                Product_Line_Prod__c,
                Product_Display_Order_Stage__c,
                Product_Display_Order_Prod__c,
                IsActiveStage__c,
                Active_Prod__c,
                PIM_Name_Stage__c,
                Level_2_Options_Stage__c,
                Level2_Options_Prod__c FROM PIM_Product_Stage__c WHERE Id IN :stageIds ];
            
            /* Load ALL active Products once */
            List<Product2> products = [ SELECT Id,
                                       Product_Line__c,
                                       Product_Display_Order__c,
                                       IsActive
                                       FROM Product2
                                       WHERE IsActive = true
                                      ];
            /*  Group products by order group*/
            Map<String, List<Product2>> groupMap =new Map<String, List<Product2>>();
            for (Product2 p : products) {
                String grp = orderGroup(p.Product_Line__c);
                if (!groupMap.containsKey(grp)) {
                    groupMap.put(grp, new List<Product2>());
                }
                groupMap.get(grp).add(p);
            }
            
            /* Apply order shifts + product updates */
            Map<Id, Product2> productUpdates = new Map<Id, Product2>();
            List<PIM_Product_Stage__c> stageUpdates = new List<PIM_Product_Stage__c>();
            for (PIM_Product_Stage__c s : stages) {
                Integer oldOrder = toInt(s.Product_Display_Order_Prod__c);
                Integer newOrder = toInt(s.Product_Display_Order_Stage__c);
                String oldGroup = orderGroup(s.Product_Line_Prod__c);
                String newGroup = orderGroup(s.Product_Line_Stage__c);
                Boolean oldActive = s.Active_Prod__c;
                Boolean newActive = s.IsActiveStage__c;
                // deactivate
                if (oldActive && !newActive) {
                    shiftDown(groupMap.get(oldGroup), oldOrder, productUpdates);
                }
                // activate
                else if (!oldActive && newActive) {
                    shiftUp(groupMap.get(newGroup), newOrder, productUpdates);
                }
                // reorder within same group
                else if (oldActive && newActive && oldGroup == newGroup && oldOrder != newOrder) {
                    shiftRange(groupMap.get(newGroup),oldOrder,newOrder,productUpdates);
                }
                // move between groups
                else if (oldActive && newActive && oldGroup != newGroup) {
                    shiftDown(groupMap.get(oldGroup), oldOrder, productUpdates);
                    shiftUp(groupMap.get(newGroup), newOrder, productUpdates);
                }
                
                /* Update ONLY changed fields on Product */
                Product2 p = new Product2(Id = s.Product_Name_Prod__c);
                for (String stageField : FIELD_CONFIG.keySet()) {
                    Map<String, String> cfg = FIELD_CONFIG.get(stageField);
                    Object stageVal = s.get(stageField);
                    Object prodVal  = s.get(cfg.get('snapshot'));
                    if (String.valueOf(stageVal) != String.valueOf(prodVal)) {
                        p.put(cfg.get('product'), stageVal);
                    }
                }
                p.Product_Line__c = s.Product_Line_Stage__c;
                p.IsActive = s.IsActiveStage__c;
                p.Product_Display_Order__c = pad(newOrder);
                p.PIM_Name__c = s.PIM_Name_Stage__c;
                p.Level_2_Options__c = s.Level_2_Options_Stage__c;
                productUpdates.put(p.Id, p);
                stageUpdates.add(
                    new PIM_Product_Stage__c(
                        Id = s.Id,
                        Status__c = 'In Sync',
                        Product_Change_Type__c = 'No Change'
                    )
                );
            }
            
            /*  DML */
            if (!productUpdates.isEmpty()) {
                update productUpdates.values();
            }
            if (!stageUpdates.isEmpty()) {
                update stageUpdates;
            }
            
        } catch (DmlException e) {
            Database.rollback(sp);
            
            if (e.getMessage().contains(
                'INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST'
            )) {
                throw new AuraHandledException(
                    'Picklist value mismatch detected.'
                );
            }
            throw new AuraHandledException(e.getMessage());
            
        } catch (Exception e) {
            Database.rollback(sp);
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    /* ============================================================
ORDER SHIFT HELPERS
============================================================ */
    
    private static void shiftUp(List<Product2> list1,Integer fromOrder,Map<Id, Product2> updates
                               ) {
                                   if (list1 == null || fromOrder == null) return;
                                   for (Product2 p : list1) {
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
    
    private static void shiftDown( List<Product2> list1,  Integer fromOrder,Map<Id, Product2> updates) {
        if (list1 == null || fromOrder == null) 
            return;
        for (Product2 p : list1) {
            Integer ord = toInt(p.Product_Display_Order__c);
            if (ord != null && ord > fromOrder) {
                updates.put( p.Id,new Product2( Id = p.Id,Product_Display_Order__c = pad(ord - 1)   ) );
            }
        }
    }
    
    private static void shiftRange(List<Product2> list1,Integer oldOrder,Integer newOrder,Map<Id, Product2> updates) {
        if (list1 == null) return;
        Integer min = Math.min(oldOrder, newOrder);
        Integer max = Math.max(oldOrder, newOrder);
        Integer delta = newOrder < oldOrder ? 1 : -1;
        for (Product2 p : list1) {
            Integer ord = toInt(p.Product_Display_Order__c);
            if (ord != null && ord >= min && ord <= max) {
                updates.put(p.Id,new Product2(Id = p.Id,Product_Display_Order__c = pad(ord + delta) ) );
            }
        }
    }
    
    /* UTILITIES  */
    private static Integer toInt(String v) {
        if (String.isBlank(v)) 
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
    
}