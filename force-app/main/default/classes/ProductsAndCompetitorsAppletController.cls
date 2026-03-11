public without sharing class ProductsAndCompetitorsAppletController {
    
    @AuraEnabled
    public static ProductsAndCompetitorsWrapperClass getProductsAndCompetitorsDetails(Id opportunityId, Id accountId, String opportunityCategory, String selectedProductTypes, String prevSalesStage, String currentSalesStage, Opportunity opportunityObj, Boolean isReadOnly) {
        
        ProductsAndCompetitorsWrapperClass productsAndCompetitorsWrapperClassObj = new ProductsAndCompetitorsWrapperClass();
        
        try{
            productsAndCompetitorsWrapperClassObj.productsAppletWrapperClassObj = getOpportunityLineItem(opportunityId, accountId, selectedProductTypes);
            System.debug('Product Data-'+productsAndCompetitorsWrapperClassObj.productsAppletWrapperClassObj.productsDetailsList[0].opportunityLineList); 
            
            if(!(opportunityId == null && opportunityCategory == 'NBEA')) {
            	productsAndCompetitorsWrapperClassObj.competitorsWrapperClassObj = getMACompetitorsDetails(opportunityId, opportunityCategory, selectedProductTypes, 
                                                                                                       prevSalesStage, currentSalesStage, productsAndCompetitorsWrapperClassObj.productsAppletWrapperClassObj, opportunityObj, isReadOnly); 
            }
            
            productsAndCompetitorsWrapperClassObj.BuyupProductList =ProductsSearchController.getPicklistvalues('OpportunityLineItem','Buyup_Product_Selection__c');
            return productsAndCompetitorsWrapperClassObj;    
        }catch(AuraHandledException ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw ex;
        }catch(Exception ex) {
            System.debug('Exception occurred in getting Opportunit Products and Competitros in SF-'+ex);
            throw new AuraHandledException(' Error Occurred while getting Opportunit Products and Competitros: Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
        }
        
        
    }
    
    @AuraEnabled
    public static boolean saveProductsAndCompetitorsDetails(Id opportunityId,Id accountId, String opportunityCategory, String selectedProductTypes, String prevSalesStage, String currentSalesStage, Opportunity opportunityObj, List<MA_Competitor__c> competitorsListToBeUpserted, List<OpportunityLineItem> productsListToBeUpserted, Boolean isReadOnly, Boolean isTotalAccIdNotFound) { 
        
        
        System.debug('saveProductsAndCompetitorsDetails>>'+productsListToBeUpserted);                                                                                                                 
        //	ProductsAndCompetitorsWrapperClass productsAndCompetitorsWrapperClassObj = new ProductsAndCompetitorsWrapperClass();
        boolean isSuccess = false;
        
        try {            
            if(saveOpportunityLineItem(productsListToBeUpserted,selectedProductTypes,opportunityObj)){
                isSuccess = saveMACompetitors(competitorsListToBeUpserted, isTotalAccIdNotFound);
            }
            
            //productsAndCompetitorsWrapperClassObj = getProductsAndCompetitorsDetails(opportunityId,accountId, opportunityCategory, selectedProductTypes, prevSalesStage, 
            //currentSalesStage, opportunityObj);
            
            
        }catch(AuraHandledException ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw ex;
        }catch(Exception ex) {
            System.debug('Exception occurred in saveProductsAndCompetitorsDetails method while saving the details in SF-'+ex);
            throw new AuraHandledException(' Error Occurred while saving Opportunity Products and Competitors: Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
        }
        
        return isSuccess;
        
    }    
    
    @AuraEnabled
    public static ProductsAppletWrapperClass deleteOpportunityLineItem(OpportunityLineItem opportunityLineItemsObj,Id MArecordId,Id accountId,String productTypesValues,String medicalProductsInvolved){
        try{                                  
            if(schema.sobjecttype.OpportunityLineItem.isaccessible() && schema.sobjecttype.OpportunityLineItem.isDeletable()) {              	                
                Database.delete(opportunityLineItemsObj,AccessLevel.SYSTEM_MODE);                              
            }
            if(MArecordId != null) {
                Opportunity oppObj = new Opportunity();
                oppObj.Id = MArecordId;
                oppObj.Medical_Products_Involved__c = medicalProductsInvolved;
                update as user oppObj;
            }
            //return getOpportunityLineItem(MArecordId,accountId,productTypesValues);
        }catch(AuraHandledException ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw ex;
        }
        catch(Exception ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw new AuraHandledException(' Error Occurred while deleting Opportunity Products: Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
        }
        return null;
    }
    
    @AuraEnabled
    public static boolean saveOpportunityLineItem(List<OpportunityLineItem> productsList, String selectedProductTypes, Opportunity opportunityObj){
        
        System.debug('Enter saveOpportunityLineItem');
        boolean isSuccess = false;        
        try {                      
            
            if(schema.sobjecttype.OpportunityLineItem.isaccessible() && schema.sobjecttype.OpportunityLineItem.isUpdateable() && schema.sobjecttype.OpportunityLineItem.iscreateable()) {              	                
                
                System.debug('All Size '+productsList.size());
                System.debug('Input parameters-> ProductsList --'+productsList+', SelectedProductTypes -- '+selectedProductTypes);  
                
                String productType = '';
                if(selectedProductTypes != null && selectedProductTypes.contains('_And_Other')) {
                    productType = 'Medical';
                } else { 
                    productType = selectedProductTypes;
                }
                String totalRecordName = 'Total';
                
                PricebookEntry pricebookEntryObj = new PricebookEntry();
                Product2 totalProductObj = new Product2();
                
                if(productType != null && productType != '' && productType != 'Other_Buy_Up_Programs') {
                    pricebookEntryObj = Database.query('SELECT Id, Pricebook2Id, Product2Id FROM PricebookEntry where Product2.Name = :totalRecordName and Product2.Product_Line__c =: productType Limit 1');
                    totalProductObj = Database.query('Select Distribution_Type_Flag__c,Family,Id,Name,Product_Line__c,Reporting_Product_Type__c from Product2 where Product2.Name = :totalRecordName and Product2.Product_Line__c =: productType Limit 1');
                }
                List<OpportunityLineItem> upsertProductsList = new List<OpportunityLineItem>();
                
                for(OpportunityLineItem opportunityProducts : productsList) {
                    if(opportunityProducts.Product2.Product_Line__c != 'Other' && (opportunityProducts.Product2Id == null && opportunityProducts.PricebookEntryId == null)) {                       
                        System.debug('Inside IF '+opportunityProducts.Id);
                        if(opportunityProducts.Id == null){
                            opportunityProducts.PricebookEntryId = pricebookEntryObj.Id;
                            opportunityProducts.Product2Id  = pricebookEntryObj.Product2Id;
                            opportunityProducts.Product2 = totalProductObj;
                        }                                                
                    } 
                    
                    /* Shruthi: Tracker: 3246 
                    * This code updates the Sales Stage at the opportunity line item with the corresponding Disposition.
                    */
                      String oppLineItemProductline = opportunityProducts.Product2.Product_Line__c;
                    oppLineItemProductline = (oppLineItemProductline != null) ? oppLineItemProductline : '';
                    String oppSalesStageItag = 'Sales_Stage_'+oppLineItemProductline+'__c';
                    String salesStageVal = (String)opportunityObj.get(oppSalesStageItag);
                    salesStageVal = (salesStageVal != null) ? salesStageVal : '';

                  if(salesStageVal == 'Notified' || salesStageVal == 'Transfer In/Out' || salesStageVal == 'Spin-Off') {
                        String oppDispositionItag = '';
                        if(oppLineItemProductline == 'Other') {
                                opportunityProducts.Sales_Stage__c = opportunityProducts.Disposition_Other_Buy_Up_Programs__c;    
                            }
                            
                        else {
                            oppDispositionItag = 'Disposition_'+oppLineItemProductline+'__c';
                            opportunityProducts.Sales_Stage__c = (String)opportunityObj.get(oppDispositionItag);
                        }                        
                    } else {
                        opportunityProducts.Sales_Stage__c = salesStageVal;
                    }
/* End */

                    upsertProductsList.add(opportunityProducts);
                }
                System.debug('upsertProductsList : '+upsertProductsList);
                upsert upsertProductsList;
                isSuccess = true; 
            } 
            
        } catch(Exception ex) {
            
            System.debug(' Error Occurred while saving  Opportunity Products: Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
            throw new AuraHandledException(' Error Occurred while saving  Opportunity Products: Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
        }
        
        System.debug('Exit saveOpportunityLineItem');
        return isSuccess;
    }
    @AuraEnabled
    
    public static ProductsAppletWrapperClass getOpportunityLineItem(Id MArecordId, Id accountId, String productTypesValues){
        
        System.debug('Enter ProductsAppletWrapperClass '+productTypesValues);
        ProductsAppletWrapperClass productsAppletWrapperClass = new ProductsAppletWrapperClass();
        productsAppletWrapperClass.isMedicalAndOthersTab = false;                
        
        Boolean hasMedical = false;
        
        String productType = '';
        
        Set<String> productTypesValuesSet = new Set<String>();
        
        if(productTypesValues != null && productTypesValues.containsIgnoreCase('Medical') && productTypesValues.containsIgnoreCase('Other')){
            productTypesValues = System.Label.Medical+';'+System.Label.Other_Buy_Up_Program;
        }
        
        for(String type : productTypesValues.split(';')){
            if(type.containsIgnoreCase('Other'))
            {
                productTypesValuesSet.add(System.Label.Other_Buy_Up_Program);  
            }else{
                productTypesValuesSet.add(type);
                productType = type;
            }            
        }
        
        if(productTypesValuesSet.contains(System.Label.Medical) && productTypesValuesSet.contains(System.Label.Other_Buy_Up_Program)){
            productsAppletWrapperClass.isMedicalAndOthersTab = true;
        }
        
        System.debug('productTypesValuesSet '+productTypesValuesSet);
        
        List<String> ma_Category_List = new List<String>();
        ma_Category_List.add(System.Label.Medical);
        ma_Category_List.add(System.Label.Pharmarcy);
        ma_Category_List.add(System.Label.Dental);
        ma_Category_List.add(System.Label.Vision);
        ma_Category_List.add(System.Label.Other_Buy_Up_Program);
        
        Map<String,ProductsDetails> productsDetailsMap = new Map<String,ProductsDetails>(); 
        List<ProductsDetails> productsDetailsList = new List<ProductsDetails>();
        productsAppletWrapperClass.totalOppLineItemObj = new OpportunityLineItem();
        
        boolean isStepWiseProduct = false;
        
        try{  
            
            if(schema.sobjecttype.OpportunityLineItem.isaccessible() && schema.sobjecttype.OpportunityLineItem.isQueryable()) { 
                
                String QUERY_GET_OPPTY_LINE_ITEMS = 'SELECT Id,Buyup_Product_Selection__c,Product2.Surest_Applicable_Products__c,Existing_Members_Retained__c,Existing_Members_Retained_Pinnacle__c,Product2.Name,Product2.Distribution_Type_Flag__c,Product2.Considered_For_StepWise_Integration__c,Termed_Members__c,Sold_New_Members__c,Annual_Revenue_Premium__c,Product2.Product_Line__c, Estimated_Additional_New_Members__c, Existing_Members_Involved_in_the_Bid__c, Existing_Membership_at_Risk__c, Funding_Type__c, Members_Quoted_in_the_Proposal__c, Net_Results__c, Sold_Retained_Members__c, Mbrs_Transferred_From_To_Another_Segment__c,Copy_the_Membership_from_Medical__c,Disposition_Other_Buy_Up_Programs__c ,Product2.Do_Not_Include_in_Total__c,Product_Conversion__c,Product2.Family,Product2.Reporting_Product_Type__c FROM OpportunityLineItem WHERE OpportunityId =:MArecordId AND product2.Product_Line__c IN :productTypesValuesSet ORDER BY Product2.Name';
                
                System.debug('QUERY_GET_OPPTY_LINE_ITEMS : '+QUERY_GET_OPPTY_LINE_ITEMS);
                
                List<OpportunityLineItem> opportunityLineItemList = Database.query(QUERY_GET_OPPTY_LINE_ITEMS);                
                
                Map<String,ProductsDetails> opportunityLineItemMap = new Map<String,ProductsDetails>(); 
                
                for(OpportunityLineItem opportunityLineItem : opportunityLineItemList){
                    if(opportunityLineItem.Product2.Name != null && opportunityLineItem.Product2.Name == 'Total'){
                        productsAppletWrapperClass.totalOppLineItemObj = opportunityLineItem;
                        continue;
                    } 
                    if(opportunityLineItemMap.containsKey(opportunityLineItem.Product2.Product_Line__c)){
                        ProductsDetails productsDetails = opportunityLineItemMap.get(opportunityLineItem.Product2.Product_Line__c);
                        //productsDetails.opportunityLineList.add(opportunityLineItem);
                        if(opportunityLineItem.Product2 != null && opportunityLineItem.Product2.Product_Line__c != null && opportunityLineItem.Product2.Product_Line__c.equals('Other') && opportunityLineItem.Product2.Considered_For_StepWise_Integration__c != null &&  opportunityLineItem.Product2.Considered_For_StepWise_Integration__c.equals('Yes')){
                            isStepWiseProduct = true;
                        }
                        if(opportunityLineItem.Product2 != null && opportunityLineItem.Product2.Product_Line__c != null && opportunityLineItem.Product2.Product_Line__c.equals('Other') && opportunityLineItem.Product2.Family != null &&  opportunityLineItem.Product2.Family.equals('Specialty Products')){
                            productsDetails.isSpecialityProduct = true;
                            productsDetails.opportunitySpecialityLineList.add(opportunityLineItem);
                        }
                        else {
                            productsDetails.opportunityLineList.add(opportunityLineItem); 
                        }
                        opportunityLineItemMap.put(opportunityLineItem.Product2.Product_Line__c, productsDetails);
                    }else{
                        ProductsDetails productsDetails = new ProductsDetails();                       
                        productsDetails.opportunityLineList = new List<OpportunityLineItem>();
                        productsDetails.opportunitySpecialityLineList = new List<OpportunityLineItem>();                     
                        //productsDetails.opportunityLineList.add(opportunityLineItem);
                        productsDetails.MA_Category = opportunityLineItem.Product2.Product_Line__c;   
                        if(opportunityLineItem.Product2 != null && opportunityLineItem.Product2.Product_Line__c != null && opportunityLineItem.Product2.Product_Line__c.equals('Other') && opportunityLineItem.Product2.Considered_For_StepWise_Integration__c != null &&  opportunityLineItem.Product2.Considered_For_StepWise_Integration__c.equals('Yes')){
                            isStepWiseProduct = true;
                        }
                        if(opportunityLineItem.Product2 != null && opportunityLineItem.Product2.Product_Line__c != null && opportunityLineItem.Product2.Product_Line__c.equals('Other') && opportunityLineItem.Product2.Family != null &&  opportunityLineItem.Product2.Family.equals('Specialty Products')){
                            productsDetails.isSpecialityProduct = true;
                            productsDetails.opportunitySpecialityLineList.add(opportunityLineItem);
                        }
                        else {
                             productsDetails.opportunityLineList.add(opportunityLineItem);
                        }
                        opportunityLineItemMap.put(opportunityLineItem.Product2.Product_Line__c, productsDetails);
                    }
                }
                
                for(String ma_Catagery : productTypesValuesSet){
                    if(opportunityLineItemMap.containsKey(ma_Catagery)){
                        if(ma_Catagery.equalsIgnoreCase(System.Label.Medical)){
                            hasMedical = true;
                        }
                        ProductsDetails eachProductsDetails = opportunityLineItemMap.get(ma_Catagery);
                        List<OpportunityLineItem> opportunityLineList = eachProductsDetails.opportunityLineList;                        
                        // List<OpportunityLineItem> opportunitySpecialityLineList = eachProductsDetails.opportunitySpecialityLineList; 
                        // if (opportunitySpecialityLineList != null) {
                        //     opportunityLineList.addAll(opportunitySpecialityLineList);
                        // }                       
                        Map<String,Integer> totalRecordMap = new Map<String,Integer>();
                        Set<String> TOTAL_OBJECT_KEYSETS = UHGMASOQLConstants.TOTAL_OBJECT_KEYSETS;  
                        
                        for(OpportunityLineItem oppLineItems : opportunityLineList){   
                            Boolean doNotIncludeInTotal = oppLineItems.Product2.Do_Not_Include_in_Total__c;
                            if(doNotIncludeInTotal == null || (doNotIncludeInTotal != null && doNotIncludeInTotal != true)) {
                                for(String itag : TOTAL_OBJECT_KEYSETS){   
                                    if(totalRecordMap.containsKey(itag)){
                                        Integer total =  totalRecordMap.get(itag);                                    
                                        if(oppLineItems.get(itag) != null){
                                            if(Integer.valueOf(oppLineItems.get(itag)) != null){
                                                total += Integer.valueOf(oppLineItems.get(itag));
                                            }                                        
                                        }
                                        totalRecordMap.put(itag, total);
                                    }else{
                                        Integer total = 0;
                                        if(oppLineItems.get(itag) != null){
                                            if(Integer.valueOf(oppLineItems.get(itag)) != null){
                                                total = Integer.valueOf(oppLineItems.get(itag));
                                            }                                        
                                        }
                                        totalRecordMap.put(itag, total);   
                                    }                                
                                }
                            }   
                        }                                         
                        eachProductsDetails.totalRecordMap = totalRecordMap;
                        //productsDetailsList.add(opportunityLineItemMap.get(ma_Catagery));
                        productsDetailsList.add(eachProductsDetails);
                    }else{
                        ProductsDetails eachProductsDetails = new ProductsDetails();
                        eachProductsDetails.MA_Category = ma_Catagery;
                        eachProductsDetails.opportunityLineList = new List<OpportunityLineItem>();
                        eachProductsDetails.opportunitySpecialityLineList = new List<OpportunityLineItem>();
                        Map<String,Integer> totalRecordMap = new Map<String,Integer>();
                        Set<String> TOTAL_OBJECT_KEYSETS = UHGMASOQLConstants.TOTAL_OBJECT_KEYSETS;  
                        for(String itag : TOTAL_OBJECT_KEYSETS){   
                            totalRecordMap.put(itag, 0);
                        }   
                        eachProductsDetails.totalRecordMap = totalRecordMap;
                        productsDetailsList.add(eachProductsDetails);
                        
                    }
                }               
                Account account = getAccountDetails(accountId);
                productsAppletWrapperClass.account = account;
                productsAppletWrapperClass.hasMedical = hasMedical;                
                productsAppletWrapperClass.isStepWiseProduct = isStepWiseProduct;
                productsAppletWrapperClass.ProductsDetailsList = ProductsDetailsList;  
                productsAppletWrapperClass.fundingTypePicklistVals = getFundingPickListValues();
                productsAppletWrapperClass.dispositionPicklistVals = getDispositionPickListValues();
                
                System.debug('productsAppletWrapperClass : '+productsAppletWrapperClass);
                
            }
        }catch(AuraHandledException ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw ex;
        }catch(Exception ex){
            System.debug('Exception '+ex.getStackTraceString());
            System.debug('Exception '+ex.getLineNumber());
            System.debug('Exception '+ex.getMessage());
            throw new AuraHandledException(' Error Occurred while getting Products : Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
        }
        return productsAppletWrapperClass;  
    }
    
    @AuraEnabled
    public static Account getAccountDetails(Id accountId){
        Account account = null;        
        try{
            account = [SELECT Id,UHC_Medical_Members__c,UHC_Dental_Members__c,UHC_Vision_Members__c,Optum_Rx_Members__c FROM Account WHERE Id = :accountId Limit 1];
            return account;
        }catch(Exception Ex){
            System.debug('Ex '+Ex);
            throw new AuraHandledException(' Error Occurred while getting Account Details: Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
        }
       // return account;
    }
    
    public static List<String> getFundingPickListValues() {
        List<String> options = new List<String>();
        options.add('');
        Schema.DescribeFieldResult fieldResult = OpportunityLineItem.Funding_Type__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        
        for( Schema.PicklistEntry f : ple)
        {
            options.add(f.getValue());
        }     
        
        return options;
    }
    
    public static List<String> getDispositionPickListValues() {
        List<String> options = new List<String>();
        options.add('');
        Schema.DescribeFieldResult fieldResult = OpportunityLineItem.Disposition_Other_Buy_Up_Programs__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        
        for( Schema.PicklistEntry f : ple)
        {
            options.add(f.getValue());
        }     
        
        return options;
    }
    
    @AuraEnabled
    public static CompetitorsWrapperClass getMACompetitorsDetails(Id opportunityId, String opportunityCategory, String selectedProductTypes, String prevSalesStage, String currentSalesStage, ProductsAppletWrapperClass productsAppletWrapperClassObj, Opportunity opportunityObj, Boolean isReadOnly) {
       
        System.debug('getMACompetitorsDetails START');
        CompetitorsWrapperClass competitorsWrapperClassObj = new CompetitorsWrapperClass();
        
        try {
            
            Set<String> selectedProductTypesSet = new Set<String>();
            String optumRx = 'Optum Rx';
            
            if(selectedProductTypes != null && selectedProductTypes.containsIgnoreCase('Medical') && selectedProductTypes.containsIgnoreCase('Other')){
                selectedProductTypes = System.Label.Medical+';'+System.Label.Other_Buy_Up_Program;
            }
            
            for(String productType : selectedProductTypes.split(';')) {
                if(productType.containsIgnoreCase('Other')) {
                    selectedProductTypesSet.add(System.Label.Other_Buy_Up_Program);  
                } else {
                    selectedProductTypesSet.add(productType);   
                }            
            }
            
            if(selectedProductTypesSet.contains(System.Label.Medical) && selectedProductTypesSet.contains(System.Label.Other_Buy_Up_Program)) {
                competitorsWrapperClassObj.isMedicalAndOthersTab = true;
            }
            //System.debug('selectedProductTypesSet-'+selectedProductTypesSet);
            //System.debug('isMedicalAndOthersTab-'+competitorsWrapperClassObj.isMedicalAndOthersTab);
            if(schema.sobjecttype.MA_Competitor__c.isaccessible() && schema.sobjecttype.MA_Competitor__c.isQueryable()) {  
                
                List<MA_Competitor__c> competitorsListFromSF = Database.query(UHGMASOQLConstants.QUERY_STRING_CM_COMPETITORS);
                System.debug('competitorsListFromSF-'+competitorsListFromSF);
                Map<String, Map<String, Integer>> alltotalRecordMap = new Map<String,Map<String, Integer>>();
                List<ProductsDetails> productsDetailsObjList = productsAppletWrapperClassObj.productsDetailsList;
                for(ProductsDetails productsDetailsObj : productsDetailsObjList) {
                    for(String selectedProductType : selectedProductTypesSet) {
                        if(selectedProductType.equalsIgnoreCase(productsDetailsObj.MA_Category)) {
                            Map<String, Integer> totalRecordMap = productsDetailsObj.totalRecordMap;
                            alltotalRecordMap.put(selectedProductType, totalRecordMap);
                        }
                    }
                }
                
                Map<String,CompetitorsDetailsWrapperClass> competitorsDetailsMap = new Map<String,CompetitorsDetailsWrapperClass>(); 
                List<CompetitorsDetailsWrapperClass> competitorsDetailsWrapperClassList = new List<CompetitorsDetailsWrapperClass>();
                
                Map<String, Map<String,String>> numberOfMembersHeldMappingValues = 
                    returnMap(UHGMAConstants.NATIONAL_ACCOUNTS_NOOFMEMBERS_HELD_TOTALRECORD);
                
                Map<String, Map<String,String>> membersInvolvedInMAMappingValues = returnMap(UHGMAConstants.MEMBERS_INVOLVED_IN_MA);
                
                if(competitorsListFromSF != null && competitorsListFromSF.size() > 0) {
                    
                    for(MA_Competitor__c maCompetitorObj : competitorsListFromSF) {
                        
                        if(competitorsDetailsMap.containsKey(maCompetitorObj.Competitor_Classification__c)) {
                            
                            CompetitorsDetailsWrapperClass competitorsDetailsObj = competitorsDetailsMap.get(maCompetitorObj.Competitor_Classification__c);
                            
                            if(maCompetitorObj.Competitor_Account__r.Name == 'National Accounts') {
                                
                                competitorsDetailsObj.isNationalAccountsRecord = true;
                                List<MA_Competitor__c> maCompetitorList = new List<MA_Competitor__c>();
                                maCompetitorList.add(maCompetitorObj);
                                maCompetitorList.addAll(competitorsDetailsObj.competitorsDetailsList);
                                competitorsDetailsObj.competitorsDetailsList = maCompetitorList;
                                competitorsDetailsMap.put(maCompetitorObj.Competitor_Classification__c, competitorsDetailsObj);
                                
                            } else if(maCompetitorObj.Competitor_Account__r.Name == 'Total') { 
                            	competitorsDetailsObj.totalCompetitorRecordObj.Id = maCompetitorObj.Id;
                            } else{
                                competitorsDetailsObj.competitorsDetailsList.add(maCompetitorObj);
                                competitorsDetailsMap.put(maCompetitorObj.Competitor_Classification__c, competitorsDetailsObj);
                            }                                                        
                            
                        } else {
                            
                            CompetitorsDetailsWrapperClass competitorsDetailsObj = new CompetitorsDetailsWrapperClass();
                            if(maCompetitorObj.Competitor_Account__r.Name == 'Total') { 
                            	competitorsDetailsObj.totalCompetitorRecordObj.Id = maCompetitorObj.Id;
                            } else {
                                if(maCompetitorObj.Competitor_Account__r.Name == 'National Accounts') {
                                    competitorsDetailsObj.isNationalAccountsRecord = true;
                                }
                                competitorsDetailsObj.competitorsDetailsList.add(maCompetitorObj);
                                competitorsDetailsObj.ProductTypesInvolvedInMA = maCompetitorObj.Competitor_Classification__c;
                                competitorsDetailsMap.put(maCompetitorObj.Competitor_Classification__c, competitorsDetailsObj);
                            }
                        }
                    }
                }
                System.debug('competitorsDetailsMap-'+competitorsDetailsMap);
                for(String productType : selectedProductTypesSet) {
                    
                    String dispositionItagVal = (String) opportunityObj.get('Disposition_'+productType+'__c');
                    if(competitorsDetailsMap != null && competitorsDetailsMap.size() > 0 &&
                       competitorsDetailsMap.containsKey(productType)) {
                           
                           CompetitorsDetailsWrapperClass competitorsDetailsObj = competitorsDetailsMap.get(productType);
                           
                           competitorsDetailsObj.totalRecordProductMap = alltotalRecordMap.get(productType);
                           Map<String, Integer> totalRecordMap = competitorsDetailsObj.totalRecordProductMap;
                           System.debug('totalRecordMap-'+totalRecordMap);
                           
                           if(productType != null && !productType.equalsIgnoreCase(System.Label.Other_Buy_Up_Program)) {
                               if(totalRecordMap != null && totalRecordMap.size() > 0) {
                                   if(opportunityCategory != null && opportunityCategory.equalsIgnoreCase('NB')) {
                                       if(productType != null && productType.equalsIgnoreCase(System.Label.Medical)) {
                                           competitorsDetailsObj.membersInvolvedInMA = opportunityObj.Members_in_the_Proposal_Medical__c;
                                           if(competitorsDetailsObj.membersInvolvedInMA == null || (competitorsDetailsObj.membersInvolvedInMA != null && competitorsDetailsObj.membersInvolvedInMA <= 0)) {
                                               competitorsDetailsObj.membersInvolvedInMA = totalRecordMap.get('Mbrs_Transferred_From_To_Another_Segment__c')+totalRecordMap.get('Estimated_Additional_New_Members__c');
                                           }
                                       } else if(productType != null && (productType.equalsIgnoreCase(System.Label.Dental) || productType.equalsIgnoreCase(System.Label.Pharmacy) || productType.equalsIgnoreCase(System.Label.Vision))) {
                                           competitorsDetailsObj.membersInvolvedInMA = totalRecordMap.get('Members_Quoted_in_the_Proposal__c');
                                           if(competitorsDetailsObj.membersInvolvedInMA == null || (competitorsDetailsObj.membersInvolvedInMA != null && competitorsDetailsObj.membersInvolvedInMA <= 0)) {
                                               competitorsDetailsObj.membersInvolvedInMA = totalRecordMap.get('Mbrs_Transferred_From_To_Another_Segment__c')+totalRecordMap.get('Estimated_Additional_New_Members__c');
                                           }
                                       } else {
                                           competitorsDetailsObj.membersInvolvedInMA = 0;
                                       }
                                   } else {
                                       
                                       System.debug('membersInvolvedInMAMappingValues->'+membersInvolvedInMAMappingValues);
                                       System.debug('opportunityCategory&productType->'+opportunityCategory+'-'+productType);
                                       String maTypeCompetitorClassification = opportunityCategory+'-'+productType;
                                       Map<String,String> salesStageProductTotalMap = membersInvolvedInMAMappingValues.get(maTypeCompetitorClassification);
                                       System.debug('salesStageProductTotalMap->'+salesStageProductTotalMap);
                                       if(salesStageProductTotalMap != null && salesStageProductTotalMap.size() > 0) {
                                           if(currentSalesStage != null && currentSalesStage.equalsIgnoreCase(System.Label.Notified)) {
                                               if(prevSalesStage != null) {
                                                   if(prevSalesStage == currentSalesStage) {
                                                       String itag = 'Progression_Sales_Stage_'+productType+'__c';
                                                       String salesStageValues = (String) opportunityObj.get(itag);
                                                       System.debug('Progression Sales Stage -'+salesStageValues);
                                                       String[] salesStageValuesArray = salesStageValues.split('_');
                                                       if(salesStageValuesArray != null && salesStageValuesArray.size() > 0) {
                                                           if(salesStageValuesArray[1] == 'In' && salesStageValuesArray.size() >= 4 ){
                                                               prevSalesStage = 'In Review';
                                                               currentSalesStage = salesStageValuesArray[3]; 
                                                           }else{
                                                               prevSalesStage = salesStageValuesArray[1];
                                                               currentSalesStage = salesStageValuesArray[2];    
                                                           }
                                                       }  
                                                   }
                                                   
                                                   String notifiedSalesStageVal = prevSalesStage+'->'+currentSalesStage;
                                                   if(notifiedSalesStageVal != null && notifiedSalesStageVal == 'Lead->Notified' && dispositionItagVal != null && dispositionItagVal == 'Sold') {
                                                     
                                                       competitorsDetailsObj.membersInvolvedInMA = opportunityObj.Members_in_the_Proposal_Medical__c;
                                                           
                                                   } else {
                                                       
                                                       if(salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage) != null && salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage) == 'Estimated_Members_Existing_New__c') {
                                                           Integer existingMembers = totalRecordMap.get('Existing_Members_Involved_in_the_Bid__c');
                                                           Integer newMembers = totalRecordMap.get('Estimated_Additional_New_Members__c');
                                                           newMembers = newMembers != null ? newMembers : 0;
                                                           existingMembers = existingMembers != null ? existingMembers : 0;
                                                           competitorsDetailsObj.membersInvolvedInMA = newMembers + existingMembers;                                                
                                                       } else { 
                                                           competitorsDetailsObj.membersInvolvedInMA = 
                                                               totalRecordMap.get(salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage)) != null ?
                                                               totalRecordMap.get(salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage)) : 
                                                           opportunityObj.Members_in_the_Proposal_Medical__c; 
                                                       }
                                                       
                                                   }
                                               } 
                                           } else if(currentSalesStage != null) {
                                               if(salesStageProductTotalMap.get(currentSalesStage) != null &&
                                                  salesStageProductTotalMap.get(currentSalesStage) == 'Estimated_Members_Existing_New__c') {
                                                      Integer existingMembers = totalRecordMap.get('Existing_Members_Involved_in_the_Bid__c');
                                                      Integer newMembers = totalRecordMap.get('Estimated_Additional_New_Members__c');
                                                      newMembers = newMembers != null ? newMembers : 0;
                                                      existingMembers = existingMembers != null ? existingMembers : 0;
                                                      competitorsDetailsObj.membersInvolvedInMA = newMembers + existingMembers;                                                
                                                  } else { 
                                                      competitorsDetailsObj.membersInvolvedInMA = 
                                                          totalRecordMap.get(salesStageProductTotalMap.get(currentSalesStage)) != null ?
                                                          totalRecordMap.get(salesStageProductTotalMap.get(currentSalesStage)) : opportunityObj.Members_in_the_Proposal_Medical__c; 
                                                  }
                                           }
                                           if(competitorsDetailsObj.membersInvolvedInMA == null) {
                                           		competitorsDetailsObj.membersInvolvedInMA = 0;
                                           }
                                           System.debug('currentSalesStage->'+currentSalesStage);
                                           System.debug('prevSalesStage->'+prevSalesStage);
                                           System.debug('prevSalesStage->currentSalesStage->'+totalRecordMap.get(salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage)));
                                           System.debug('currentSalesStage->'+totalRecordMap.get(salesStageProductTotalMap.get(currentSalesStage)));
                                           System.debug('membersInvolvedInMA->'+competitorsDetailsObj.membersInvolvedInMA);
                                           System.debug('Members_in_the_Proposal_Medical__c->'+opportunityObj.Members_in_the_Proposal_Medical__c);
                                       }                                    
                                   }
                               }
                           }
                           List<MA_Competitor__c> maCompetitorsList = competitorsDetailsObj.competitorsDetailsList;

                           if(competitorsDetailsObj.isNationalAccountsRecord == false && isReadOnly != null && isReadOnly == false) {
                               //System.debug('If');
                               competitorsDetailsObj.competitorsDetailsList = new List<MA_Competitor__c>();
                               Id nationalAccountsOrTotalAccountId;
                               String nationalAccounts = UHGMAConstants.NATIONAL_ACCOUNTS;
                               List<Account> accountList = Database.query('Select Id from Account where Name=:nationalAccounts ORDER BY CreatedDate Asc LIMIT 1');
                               if(accountList != null && accountList.size() > 0) {
                                   nationalAccountsOrTotalAccountId = accountList[0].Id;           
                               }

                               if(nationalAccountsOrTotalAccountId != null && productType != null && opportunityCategory != null && opportunityId != null) {
                                   MA_Competitor__c nationalAccountsRecordData = 
                                       returnNationalAccountsRecordData(opportunityId, opportunityCategory, productType, prevSalesStage, 
                                                                        nationalAccountsOrTotalAccountId, currentSalesStage, totalRecordMap, 
                                                                        numberOfMembersHeldMappingValues, true, null, opportunityObj, competitorsDetailsObj.membersInvolvedInMA);
                                   competitorsDetailsObj.competitorsDetailsList.add(nationalAccountsRecordData);
                               }
                               competitorsDetailsObj.competitorsDetailsList.addAll(maCompetitorsList);
                               competitorsDetailsWrapperClassList.add(competitorsDetailsObj);
                           } else {
                               for(Integer i=0; i<maCompetitorsList.size(); i++) {
                                   if(maCompetitorsList[i].Competitor_Account__r.Name != null && 
                                      maCompetitorsList[i].Competitor_Account__r.Name.equalsIgnoreCase('National Accounts') && isReadOnly != null && isReadOnly == false) {
                                          if(productType != null && opportunityCategory != null && opportunityId != null) {
                                              MA_Competitor__c nationalAccountsRecordData = 
                                                  returnNationalAccountsRecordData(opportunityId, opportunityCategory, productType, prevSalesStage, 
                                                                                   null, currentSalesStage, totalRecordMap, numberOfMembersHeldMappingValues, false, maCompetitorsList[i], opportunityObj, competitorsDetailsObj.membersInvolvedInMA);
                                              maCompetitorsList[i] = nationalAccountsRecordData;
                                              competitorsDetailsObj.competitorsDetailsList = maCompetitorsList;
                                              break;
                                          }
                                      }
                               }
                               competitorsDetailsWrapperClassList.add(competitorsDetailsMap.get(productType));
                           }
                           
                       } else {
                           
                           CompetitorsDetailsWrapperClass competitorsDetailsObj = new CompetitorsDetailsWrapperClass();
                           if(isReadOnly != null && isReadOnly == false) {
                               competitorsDetailsObj.totalRecordProductMap = alltotalRecordMap.get(productType);
                               competitorsDetailsObj.ProductTypesInvolvedInMA = productType;
                               competitorsDetailsObj.isNationalAccountsRecord = true;
                               System.debug('productType & totalRecordMap-'+productType+', '+competitorsDetailsObj.totalRecordProductMap);
                               Map<String, Integer> totalRecordMap = competitorsDetailsObj.totalRecordProductMap;
                               if(productType != null && !productType.equalsIgnoreCase(System.Label.Other_Buy_Up_Program)) {
                                   if(totalRecordMap != null && totalRecordMap.size() > 0) {
                                       if(opportunityCategory != null && opportunityCategory.equalsIgnoreCase('NB')) {
                                           if(productType != null && productType.equalsIgnoreCase(System.Label.Medical)) {
                                               competitorsDetailsObj.membersInvolvedInMA = opportunityObj.Members_in_the_Proposal_Medical__c;
                                               if(competitorsDetailsObj.membersInvolvedInMA == null || (competitorsDetailsObj.membersInvolvedInMA != null && competitorsDetailsObj.membersInvolvedInMA <= 0)) {
                                                   competitorsDetailsObj.membersInvolvedInMA = totalRecordMap.get('Mbrs_Transferred_From_To_Another_Segment__c')+totalRecordMap.get('Estimated_Additional_New_Members__c');
                                               }
                                           } else if(productType != null && (productType.equalsIgnoreCase(System.Label.Dental) || productType.equalsIgnoreCase(System.Label.Pharmacy) || productType.equalsIgnoreCase(System.Label.Vision))) {
                                               competitorsDetailsObj.membersInvolvedInMA = totalRecordMap.get('Members_Quoted_in_the_Proposal__c');
                                               if(competitorsDetailsObj.membersInvolvedInMA == null || (competitorsDetailsObj.membersInvolvedInMA != null && competitorsDetailsObj.membersInvolvedInMA <= 0)) {
                                                   competitorsDetailsObj.membersInvolvedInMA = totalRecordMap.get('Mbrs_Transferred_From_To_Another_Segment__c')+totalRecordMap.get('Estimated_Additional_New_Members__c');
                                               }
                                           }
                                       } else {
                                           
                                           System.debug('membersInvolvedInMAMappingValues->'+membersInvolvedInMAMappingValues);
                                           System.debug('opportunityCategory&productType->'+opportunityCategory+'-'+productType);
                                           String maTypeCompetitorClassification = opportunityCategory+'-'+productType;
                                           Map<String,String> salesStageProductTotalMap = membersInvolvedInMAMappingValues.get(maTypeCompetitorClassification);
                                           System.debug('salesStageProductTotalMap->'+salesStageProductTotalMap);
                                           if(salesStageProductTotalMap != null && salesStageProductTotalMap.size() > 0) {
                                               if(currentSalesStage != null && currentSalesStage.equalsIgnoreCase(System.Label.Notified)) {
                                                   if(prevSalesStage != null) {
                                                       if(prevSalesStage == currentSalesStage) {
                                                           String itag = 'Progression_Sales_Stage_'+productType+'__c';
                                                           String salesStageValues = (String) opportunityObj.get(itag);
                                                           System.debug('Progression Sales Stage -'+salesStageValues);
                                                           String[] salesStageValuesArray = salesStageValues.split('_');
                                                           if(salesStageValuesArray != null && salesStageValuesArray.size() > 0) {
                                                               if(salesStageValuesArray[1] == 'In' && salesStageValuesArray.size() >= 4 ){
                                                                   prevSalesStage = 'In Review';
                                                                   currentSalesStage = salesStageValuesArray[3]; 
                                                               }else{
                                                                   prevSalesStage = salesStageValuesArray[1];
                                                                   currentSalesStage = salesStageValuesArray[2];    
                                                               }
                                                           }  
                                                       }
                                                       
                                                       String notifiedSalesStageVal = prevSalesStage+'->'+currentSalesStage;
                                                       if(notifiedSalesStageVal != null && notifiedSalesStageVal == 'Lead->Notified' && dispositionItagVal != null && dispositionItagVal == 'Sold') {
                                                           
                                                           competitorsDetailsObj.membersInvolvedInMA = opportunityObj.Members_in_the_Proposal_Medical__c;
                                                           
                                                       } else {
                                                           
                                                           if(salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage) != null && salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage) == 'Estimated_Members_Existing_New__c') {
                                                               Integer existingMembers = totalRecordMap.get('Existing_Members_Involved_in_the_Bid__c');
                                                               Integer newMembers = totalRecordMap.get('Estimated_Additional_New_Members__c');
                                                               newMembers = newMembers != null ? newMembers : 0;
                                                               existingMembers = existingMembers != null ? existingMembers : 0;
                                                               competitorsDetailsObj.membersInvolvedInMA = newMembers + existingMembers;                                                
                                                           } else { 
                                                               competitorsDetailsObj.membersInvolvedInMA = 
                                                                   totalRecordMap.get(salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage)) != null ?
                                                                   totalRecordMap.get(salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage)) : 
                                                               opportunityObj.Members_in_the_Proposal_Medical__c; 
                                                           }
                                                       }
                                                   } 
                                               } else if(currentSalesStage != null) {
                                                   if(salesStageProductTotalMap.get(currentSalesStage) != null &&
                                                      salesStageProductTotalMap.get(currentSalesStage) == 'Estimated_Members_Existing_New__c') {
                                                          Integer existingMembers = totalRecordMap.get('Existing_Members_Involved_in_the_Bid__c');
                                                          Integer newMembers = totalRecordMap.get('Estimated_Additional_New_Members__c');
                                                          newMembers = newMembers != null ? newMembers : 0;
                                                          existingMembers = existingMembers != null ? existingMembers : 0;
                                                          competitorsDetailsObj.membersInvolvedInMA = newMembers + existingMembers;                                                
                                                      } else { 
                                                          competitorsDetailsObj.membersInvolvedInMA = 
                                                              totalRecordMap.get(salesStageProductTotalMap.get(currentSalesStage)) != null ?
                                                              totalRecordMap.get(salesStageProductTotalMap.get(currentSalesStage)) : opportunityObj.Members_in_the_Proposal_Medical__c; 
                                                      }
                                               }
                                               System.debug('currentSalesStage->'+currentSalesStage);
                                               System.debug('prevSalesStage->'+prevSalesStage);
                                               System.debug('prevSalesStage->currentSalesStage->'+totalRecordMap.get(salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage)));
                                               System.debug('currentSalesStage->'+totalRecordMap.get(salesStageProductTotalMap.get(currentSalesStage)));
                                               System.debug('membersInvolvedInMA->'+competitorsDetailsObj.membersInvolvedInMA);
                                               System.debug('Members_in_the_Proposal_Medical__c->'+opportunityObj.Members_in_the_Proposal_Medical__c);
                                           }
                                           
                                       }
                                   }
                               }
                               
                               Id nationalAccountsOrTotalAccountId = null;
                               String nationalAccounts = UHGMAConstants.NATIONAL_ACCOUNTS;
                               List<Account> accountList = Database.query('Select Id from Account where Name=:nationalAccounts ORDER BY CreatedDate Asc LIMIT 1');
                               if(accountList != null && accountList.size() > 0) {
                                   nationalAccountsOrTotalAccountId = accountList[0].Id;           
                               }
                               if(nationalAccountsOrTotalAccountId != null && productType != null && opportunityCategory != null && opportunityId != null) {
                                      
                                      MA_Competitor__c nationalAccountsRecordData = 
                                          returnNationalAccountsRecordData(opportunityId, opportunityCategory, productType, prevSalesStage, 
                                                                           nationalAccountsOrTotalAccountId, currentSalesStage, totalRecordMap, 
                                                                           numberOfMembersHeldMappingValues, true, null, opportunityObj, competitorsDetailsObj.membersInvolvedInMA);
                                      competitorsDetailsObj.competitorsDetailsList.add(nationalAccountsRecordData);
                                      
                                  } else { 
                                      competitorsDetailsObj.competitorsDetailsList = new List<MA_Competitor__c>();
                                  }
                               competitorsDetailsWrapperClassList.add(competitorsDetailsObj);
                           } else {
                               competitorsDetailsObj.competitorsDetailsList = new List<MA_Competitor__c>();
                               competitorsDetailsWrapperClassList.add(competitorsDetailsObj);
                           }
                       }
                    
                }
                
                competitorsWrapperClassObj.competitorsList = competitorsDetailsWrapperClassList;
            }
            
        } catch(AuraHandledException ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw ex;
        }catch(Exception ex) {
            
            System.debug('Exception occurred in getMACompetitorsDetails method - '+ex);
            throw new AuraHandledException(' Error Occurred while saving  Competitors : Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
        }
        
        System.debug('getMACompetitorsDetails END');
        
        return competitorsWrapperClassObj;
    }
    
    public static MA_Competitor__c returnNationalAccountsRecordData(Id opportunityId, String opportunityCategory, String competitorClassification, String prevSalesStage, Id nationalAccountsOrTotalAccountId, String currentSalesStage, Map<String, Integer> totalRecordMap, Map<String, Map<String,String>> numberOfMembersHeldMappingValues, Boolean isInsert, MA_Competitor__c maCompetitorObj1, Opportunity opportunityObj, Decimal membersInvolvedInMA)  {
        
        System.debug('returnNationalAccountsRecordData START');                                                              
        
        System.debug('Input Paremeters->Opportunity Id-'+opportunityId+', Opportunity Category-'+opportunityCategory+', Competitor Classification-'+
                     competitorClassification+', Prev SalesStage'+prevSalesStage+', NationalAccountsOrTotalAccountId-'+nationalAccountsOrTotalAccountId+
                     ', Current SalesStage-'+currentSalesStage+', totalRecordMap-'+totalRecordMap+', NumberOfMembersHeldMappingValues-'+
                     numberOfMembersHeldMappingValues+', isInsert-'+isInsert+', maCompetitorObj1-'+maCompetitorObj1+', opportunityObj-'+opportunityObj+', membersInvolvedInMA-'+membersInvolvedInMA);
        
        membersInvolvedInMA = (membersInvolvedInMA != null) ? membersInvolvedInMA : 0;
        MA_Competitor__c maCompetitorResultObj = new MA_Competitor__c();
        isInsert = isInsert != null ? isInsert : true;
        Boolean toBeUpserted = false;
        
        try {
            
            System.debug('Before Nat Acc Data-'+maCompetitorObj1);   
            
            MA_Competitor__c maCompetitorObj = new MA_Competitor__c();
            if(isInsert == false) {
                maCompetitorObj = maCompetitorObj1;
            } else {
                maCompetitorObj = new MA_Competitor__c();
                maCompetitorObj.Opportunity__c = opportunityId;
                maCompetitorObj.Competitor_Account__c = nationalAccountsOrTotalAccountId;
                maCompetitorObj.Competitor_Classification__c = competitorClassification;
                maCompetitorObj.Competitor_Group__c = UHGMAConstants.NATIONAL_ACCOUNTS_COMPETITOR_GROUP;
                maCompetitorObj.Comments__c = '';
            }
            
            if(competitorClassification != null && !competitorClassification.equalsIgnoreCase(System.Label.Other_Buy_Up_Programs)) {
                if(totalRecordMap != null && totalRecordMap.size() > 0) {
                    String maTypeCompetitorClassification = opportunityCategory+'-'+competitorClassification;
                    Map<String,String> salesStageProductTotalMap = numberOfMembersHeldMappingValues.get(maTypeCompetitorClassification);
                    if(salesStageProductTotalMap != null && salesStageProductTotalMap.size() > 0) {
                        if(currentSalesStage != null) {
                            if(currentSalesStage.equalsIgnoreCase(System.Label.Notified)) {
                                if(prevSalesStage != null) {
                                    if(prevSalesStage == currentSalesStage) {
                                        String itag = 'Progression_Sales_Stage_'+competitorClassification+'__c';
                                        String salesStageValues = (String) opportunityObj.get(itag);
                                        System.debug('Progression Sales Stage -'+salesStageValues);
                                        String[] salesStageValuesArray = salesStageValues.split('_');
                                        if(salesStageValuesArray != null && salesStageValuesArray.size() > 0) {
                                            if(salesStageValuesArray[1] == 'In' && salesStageValuesArray.size() >= 4 ){
                                                prevSalesStage = 'In Review';
                                                currentSalesStage = salesStageValuesArray[3]; 
                                            }else{
                                                prevSalesStage = salesStageValuesArray[1];
                                                currentSalesStage = salesStageValuesArray[2];    
                                            }
                                        }  
                                    }
                                    if(isInsert == false && maCompetitorObj.Number_of_Members_Held__c != totalRecordMap.get(salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage))) {
                                        if(toBeUpserted == false) {
                                            toBeUpserted = true;
                                        }
                                    }
                                    maCompetitorObj.Number_of_Members_Held__c = totalRecordMap.get(salesStageProductTotalMap.get(prevSalesStage+'->'+currentSalesStage));
                                } 
                            } else {
                                if(isInsert == false && maCompetitorObj != null && 
                                   maCompetitorObj.Number_of_Members_Held__c != totalRecordMap.get(salesStageProductTotalMap.get(currentSalesStage))) {
                                       if(toBeUpserted == false) {
                                           toBeUpserted = true;
                                       }
                                   }
                                maCompetitorObj.Number_of_Members_Held__c = totalRecordMap.get(salesStageProductTotalMap.get(currentSalesStage)); 
                            }
                        } else {
                            maCompetitorObj.Number_of_Members_Held__c = 0;
                            maCompetitorObj.of_Members_Held__c = 0;
                        }
                    }
                    
                    if(membersInvolvedInMA > 0 && maCompetitorObj.Number_of_Members_Held__c != null) {
                        Decimal perOfMembersHeld = Math.round((maCompetitorObj.Number_of_Members_Held__c/membersInvolvedInMA)*100);
                        maCompetitorObj.of_Members_Held__c = perOfMembersHeld;
                    }
                    
					String dispositionItagVal = (String) opportunityObj.get('Disposition_'+competitorClassification+'__c');
                    if(dispositionItagVal != null && dispositionItagVal == 'Dead') {
                        if(isInsert == false) {
                            if(toBeUpserted == false) {
                                toBeUpserted = true;
                            }
                        }
                        maCompetitorObj.Number_of_Members_Awarded__c = maCompetitorObj.Number_of_Members_Held__c;
                    } else {
                        if(maCompetitorObj.Competitor_Classification__c != System.Label.Other_Buy_Up_Program) {
                            if(isInsert == false && maCompetitorObj != null && 
                               		maCompetitorObj.Number_of_Members_Awarded__c != totalRecordMap.get(UHGMAConstants.NATIONAL_ACCOUNTS_NOOFAWARDED_HELD_TOTALRECORD)) {
                                if(toBeUpserted == false) {
                                    toBeUpserted = true;
                                }
                            }
                            
                            Integer noOfAwardedValues = totalRecordMap.get(UHGMAConstants.NATIONAL_ACCOUNTS_NOOFAWARDED_HELD_TOTALRECORD);
                            if(noOfAwardedValues != null) {
                            	maCompetitorObj.Number_of_Members_Awarded__c = noOfAwardedValues;
                            } else {
								maCompetitorObj.Number_of_Members_Awarded__c = 0;
                                maCompetitorObj.of_Members_Awarded__c = 0;
                            }
                        }
                    }
                }
            }
            
            if(maCompetitorObj != null) {
                if(toBeUpserted) {
                    system.debug('maCompetitorObj'+maCompetitorObj);
                    update  maCompetitorObj;
                } else if(isInsert) {
                    insert  maCompetitorObj;
                }
                
                String nationalAccounts = UHGMAConstants.NATIONAL_ACCOUNTS;
                String optumRx = 'Optum Rx';
                maCompetitorResultObj = Database.query(UHGMASOQLConstants.QUERY_STRING_NATIONALACCOUNT_COMPETITORS);
            }
            
        } catch(AuraHandledException ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw ex;
        }catch(Exception e) {
            System.debug('Exception occurred in returnMap(Map<String, Map<String,String>>, String) method while preparing ITAG map'+
                         ' (Sets Data for the fields MembersInvolvedInMA, NatAccMembersHeld&Awarded) from the Constants ->'+e);
            throw new AuraHandledException(' Error Occurred while returnNationalAccountsRecordData : Line Number ---> '+e.getLineNumber() +' : Error Message ---> '+e.getMessage());
        }
        
        System.debug('Nat Acc Data-'+maCompetitorResultObj);                                                                        
        System.debug('returnNationalAccountsRecordData END');
        
        return maCompetitorResultObj;
    }
    
    public static Map<String, Map<String,String>> returnMap(String mapConstant) {
        
        Map<String, Map<String,String>> numberOfMembersHeldMappingValues = new Map<String, Map<String,String>>();
        
        try {
            
            if(mapConstant != null && mapConstant.length() > 0) {
                String nationalAccountsNoOfMembersHeldConstant = mapConstant;
                String[] nationalAccountsNoOfMembersHeldConstantArray = nationalAccountsNoOfMembersHeldConstant.split('::');
                for(String str : nationalAccountsNoOfMembersHeldConstantArray) {
                    String[] maTypeProductTypeArray = str.split(':');
                    String[] salesStageProductsTotalArray = maTypeProductTypeArray[1].split(',');
                    Map<String,String> salesStageProductsTotalMap = new Map<String,String>();
                    for(String str1 : salesStageProductsTotalArray) {
                        String[] salesStageProductsTotalArray1 = str1.split(';');
                        salesStageProductsTotalMap.put(salesStageProductsTotalArray1[0], salesStageProductsTotalArray1[1]);
                    }
                    numberOfMembersHeldMappingValues.put(maTypeProductTypeArray[0], salesStageProductsTotalMap);
                }
            }
        } catch(AuraHandledException ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw ex;
        } catch(Exception e) {
            System.debug('Exception occurred in returnMap(Map<String, Map<String,String>>, String) method while preparing ITAG map'+
                         ' (Sets Data for the fields MembersInvolvedInMA, NatAccMembersHeld&Awarded) from the Constants ->'+e);
            throw new AuraHandledException(' Error Occurred in returnMap : Line Number ---> '+e.getLineNumber() +' : Error Message ---> '+e.getMessage());
        }
        
        return numberOfMembersHeldMappingValues;
    }
    
    @AuraEnabled
    public static boolean saveMACompetitors(List<MA_Competitor__c> competitorsList, Boolean isTotalAccIdNotFound) {
        boolean isSuccess = false;
        System.debug('Competitors List which is to be upserted into SF -> '+competitorsList);
        
        Id totalAccountRowId;
        
        if(competitorsList != null && competitorsList.size() > 0) {
            
            if(isTotalAccIdNotFound != null && isTotalAccIdNotFound) {
                List<Account> totalAccountList = [Select Id from Account where Name='Total' WITH USER_MODE ORDER BY CreatedDate Asc LIMIT 1];
                if(totalAccountList != null && totalAccountList.size() > 0) {
                    totalAccountRowId = totalAccountList[0].Id;
                }
            }
            List<MA_Competitor__c> competitorsListToBeUpserted = new List<MA_Competitor__c>();
            for(MA_Competitor__c obj : competitorsList) {
                if(isTotalAccIdNotFound != null && isTotalAccIdNotFound && obj.Id == null && (obj.Competitor_Account__c == null || obj.Competitor_Account__r == null || 
                   		(obj.Competitor_Account__r != null && obj.Competitor_Account__r.Name == null))) {
                    obj.Competitor_Account__c = totalAccountRowId;
                }
                competitorsListToBeUpserted.add(obj);
            }
            upsert competitorsListToBeUpserted;
            isSuccess = true;
        }
        return isSuccess;
    }
    
    @AuraEnabled
    public static ProductsAndCompetitorsWrapperClass deleteCompetitorRecord(Id opportunityId,Id accountId, String opportunityCategory, Boolean isEdit, String selectedProductTypes, String prevSalesStage, String currentSalesStage, Opportunity opportunityObj, MA_Competitor__c competitorDataToBeRemoved, Boolean isReadOnly) {

        System.debug('deleteCompetitorRecord START');
        ProductsAndCompetitorsWrapperClass productsAndCompetitorsWrapperClassObj = null;
        Boolean isRecordDeleted = false;
        
        try { 
            
            if(competitorDataToBeRemoved.Id != null) {
                
                if(schema.sobjecttype.MA_Competitor__c.isaccessible() && schema.sobjecttype.MA_Competitor__c.isDeletable()) { 
                    Database.delete(competitorDataToBeRemoved,AccessLevel.SYSTEM_MODE);
                    isRecordDeleted = true;
                }
            }
            System.debug('isRecordDeleted-'+isRecordDeleted);
            if(isRecordDeleted && isEdit != null && isEdit == false) {
                productsAndCompetitorsWrapperClassObj = new ProductsAndCompetitorsWrapperClass();
                productsAndCompetitorsWrapperClassObj = getProductsAndCompetitorsDetails(opportunityId,accountId, opportunityCategory, 
                                                                                         selectedProductTypes, prevSalesStage, currentSalesStage, opportunityObj, isReadOnly);
                
            }        
        }catch(AuraHandledException ex){
            System.debug('Exception in Save '+ex.getMessage());
            throw ex;
        }catch(Exception ex) {
            System.debug('Exception occurred in deleteCompetitorRecord() method while deleting the record in SF -> '+ex);
            throw new AuraHandledException(' Error Occurred while deleting  Competitors : Line Number ---> '+ex.getLineNumber() +' : Error Message ---> '+ex.getMessage());
        }
        
        System.debug('deleteCompetitorRecord END');
        
        return productsAndCompetitorsWrapperClassObj;
        
    }
    
    @AuraEnabled
    public static CompetitorResult queryProducts(String searchKeyVal1, Decimal pageNumber,String selectedTab,String productLine) {
        System.debug('queryProducts-'+searchKeyVal1+pageNumber+selectedTab+productLine);
        UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        CompetitorResult ProductResultObj = new CompetitorResult();
        if(searchKeyVal1!=null)
            searchKeyVal1 = String.escapeSingleQuotes(searchKeyVal1);
        if(selectedTab!=null)
            selectedTab = String.escapeSingleQuotes(selectedTab);
        if(productLine!=null)
            productLine = String.escapeSingleQuotes(productLine);
        
        try {
            String searchKeyString = '';
            if(searchKeyVal1 != null && searchKeyVal1.length() > 0) {
                searchKeyVal1 = searchKeyVal1.trim();
                searchKeyString = ' AND Name LIKE \'%' + String.escapeSingleQuotes(searchKeyVal1) + '%\'';
            }
            
            
            String competitorStatus = 'Active';
            Integer pageSize = uhgAccountConstants.POPUP_PAGESIZE;
            Integer offset = ((Integer)pageNumber - 1) * pageSize;
            
            Boolean topCompetitors = false;
            Boolean theBlues = false;
            Boolean exchannge = false;
            String categoryItag = '';
            
            if(searchKeyString == null || searchKeyString == '' || searchKeyString.length() == 0) { 
                if(selectedTab == 'Top_Tab'){
                    topCompetitors = true;
                    categoryItag = 'AND Top_Competitor__c = true';
                } else if(selectedTab == 'Blues_Tab') {
                    theBlues = true;
                    categoryItag = 'AND The_Blues_and_their_Affiliates__c = true';
                } else if(selectedTab == 'Exchange_Tab') {
                    exchannge = true;
                    categoryItag = 'AND Exchange_Competitors__c = true';
                } else if(selectedTab == 'Others_Tab') {
                    categoryItag = 'AND Exchange_Competitors__c = false AND The_Blues_and_their_Affiliates__c = false AND Top_Competitor__c = false';
                }
            }
             
            if(productLine != null) {
                if(productLine == 'Medical and Others') {
                    categoryItag = categoryItag + ' AND Product_Types_Offered__c INCLUDES (\'Medical\',\'Other Buy Up\')';  
                } else {
                    categoryItag = categoryItag + ' AND Product_Types_Offered__c INCLUDES (\''+String.escapeSingleQuotes(productLine)+'\') ';  
                }
               
            }
            if(schema.sobjecttype.Account.isaccessible()) {
                //List<Account> prodt = new List<Account>();
                //System.debug('prodLine'+productLine+'prodStatus'+competitorStatus+'searchKey1'+searchKey1);
                //System.debug('Count'+UHGMASOQLConstants.QUERY_STRING_ACCOUNT);
                System.debug('Competitors List Query String ->' + UHGMASOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS + categoryItag + searchKeyString+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS2);
                ProductResultObj.total = Database.countQuery(UHGMASOQLConstants.QUERY_COUNT_STRING_ACCOUNT_COMPETITORS + categoryItag+searchKeyString);
                ProductResultObj.ProductList = Database.query(UHGMASOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS + categoryItag + searchKeyString+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS2);
                ProductResultObj.page = (Integer)pageNumber;
                ProductResultObj.pageSize = pageSize;
                
                /*if(searchKeyString != null && searchKeyString != '' && searchKeyString.length() > 0) {
                    List<Account> competitorsAccountList = ProductResultObj.ProductList;
                    if(competitorsAccountList != null && competitorsAccountList.size() > 0) {
                        Map<String, Boolean> tabMap = new Map<String, Boolean>();
                        tabMap.put('Top_Tab', false);
                        tabMap.put('Blues_Tab', false);
                        tabMap.put('Exchange_Tab', false);
                        tabMap.put('Others_Tab', false);
                        
                        for(Account accountObj : competitorsAccountList) {
                            if(accountObj != null) {
                                Boolean isTab = false;
                                if(accountObj.Top_Competitor__c != null && accountObj.Top_Competitor__c) {
                                    tabMap.put('Top_Tab', true);
                                    isTab = true;
                                }
                                if(accountObj.The_Blues_and_their_Affiliates__c != null && accountObj.The_Blues_and_their_Affiliates__c) {
                                    tabMap.put('Blues_Tab', true);
                                    isTab = true;
                                }
                                if(accountObj.Exchange_Competitors__c != null && accountObj.Exchange_Competitors__c) {
                                    tabMap.put('Exchange_Tab', true);
                                    isTab = true;
                                }
                                if(isTab == false) {
                                    tabMap.put('Others_Tab', true);
                                }
                            }
                        }
                        ProductResultObj.activeTabsMap = tabMap;
                    }
                }*/
                //System.debug('Query '+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH);
                //System.debug('Query '+UHGMASOQLConstants.QUERY_STRING_ACCOUNT_SEARCH);
            } /*else {
                throw new NoAccessException();
            }*/
            
        } catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured');
        } /*catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountContacts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('You dont have permission to Create/View this record');
        } catch(QueryException queryExec){
            System.debug('Error(QueryException) occurred while querying the details of Conatct object from SF in '+
                         'getAccountContacts() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getAccountContacts() method, the Stack Trace is -> '
                         +queryExec.getStackTraceString());
            throw new AuraHandledException('Query Excetion Occured----');
        }*/ catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }
        
        System.debug('Output Parameters -> Competitors List-'+ProductResultObj.ProductList+', Page-'+ProductResultObj.page+
                     ', PageSize-'+ProductResultObj.pageSize+'and TotalNoOfPages-'+ProductResultObj.total);
        
        System.debug('getUserRecords(String searchKeyVal, Decimal pageNumber, String searchField, String operator) - END');
        
        return ProductResultObj;
    }
    
    @AuraEnabled
    public static Account returnUnknownAccountCompetitor() {
        
        Account unknownAccCompObj = new Account();
        try {
            
            String unknownAccCmptrName = System.Label.Unknown_Competitor_In_Proposal;
            String competitorStatus = 'Active';
            System.debug('returnUnknownAccountCompetitor-'+UHGMASOQLConstants.QUERY_STRING_UNKNOWN_ACCOUNT_COMPETITOR);
            unknownAccCompObj = Database.query(UHGMASOQLConstants.QUERY_STRING_UNKNOWN_ACCOUNT_COMPETITOR);
        } catch(Exception e) {
            System.debug('Exception occurred in returnUnknownAccountCompetitor -> '+e);
        }
        
        return unknownAccCompObj;
    }
    
    public class CompetitorResult {
        
        @AuraEnabled
        public List<Account> ProductList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        //@AuraEnabled
        //public Map<String, Boolean> activeTabsMap { get;set; }
        
    }
    
    public class ProductsDetails{
        
        @AuraEnabled
        public String MA_Category { get;set; }
        
        @AuraEnabled
        public List<OpportunityLineItem> opportunityLineList { get;set; }
        
        @AuraEnabled
        public Map<String, Integer> totalRecordMap {get;set;}

        @AuraEnabled
        public Boolean isSpecialityProduct { get;set; }

        @AuraEnabled
        public List<OpportunityLineItem> opportunitySpecialityLineList { get;set; }
        
    }
    
    public class ProductsAppletWrapperClass {
        
        @AuraEnabled
        public OpportunityLineItem totalOppLineItemObj {get;set;}
        
        @AuraEnabled
        public List<ProductsDetails> productsDetailsList { get;set; }
        
        @AuraEnabled
        public List<String> fundingTypePicklistVals { get;set; }
        
        @AuraEnabled
        public List<String> dispositionPicklistVals { get;set; }
        
        @AuraEnabled
        public Account account { get;set; }
        
        @AuraEnabled
        public Boolean isStepWiseProduct { get;set; }
        
        @AuraEnabled
        public Boolean hasMedical { get;set; }
        
        @AuraEnabled
        public Boolean isMedicalAndOthersTab { get;set; }
    } 
    
    public class CompetitorsDetailsWrapperClass {
        
        @AuraEnabled
        public String productTypesInvolvedInMA {get;set;}
        
        @AuraEnabled
        public List<MA_Competitor__c> competitorsDetailsList {get;set;}
        
        @AuraEnabled
        public Boolean isNationalAccountsRecord {get;set;}
        
        @AuraEnabled
        public Map<String, Integer> totalRecordProductMap {get;set;}
        
        @AuraEnabled
        public Decimal membersInvolvedInMA {get;set;}
        
        @AuraEnabled
        public MA_Competitor__c totalCompetitorRecordObj {get;set;}
        
        public CompetitorsDetailsWrapperClass() {
            productTypesInvolvedInMA = '';
            isNationalAccountsRecord = false;
            competitorsDetailsList = new List<MA_Competitor__c>();
            totalRecordProductMap = new Map<String, Integer>();
            membersInvolvedInMA = 0;
            totalCompetitorRecordObj = new MA_Competitor__c();
        }
        
    }
    
    public class CompetitorsWrapperClass {
        
        @AuraEnabled
        public List<CompetitorsDetailsWrapperClass> competitorsList {get;set;}
        
        @AuraEnabled
        public Boolean isMedicalAndOthersTab {get;set;}
    }
    
    public class ProductsAndCompetitorsWrapperClass {
        @AuraEnabled
        public List<String> BuyupProductList { get;set; }
        
        @AuraEnabled
        public ProductsAppletWrapperClass productsAppletWrapperClassObj {get;set;}
        
        @AuraEnabled
        public CompetitorsWrapperClass competitorsWrapperClassObj {get;set;}
        
        public ProductsAndCompetitorsWrapperClass() {
            
            productsAppletWrapperClassObj = new ProductsAppletWrapperClass();
            competitorsWrapperClassObj = new CompetitorsWrapperClass();
        }
        
    }
}