global class CM_OpportunityLineItems_Batch implements Database.Batchable<Sobject>, Database.Stateful {
    
    global Map<String, PricebookEntry> totalPriceBookEntriesMap {get;set;}
    global Map<String, Product2> totalProductsMap {get;set;}
    global Set<Id> allOpportunityIds = new Set<Id>();
    global Set<Id> successfulOpportunityIds = new Set<Id>();
    global Set<Id> failedOpportunityIds = new Set<Id>();
    global Set<Id> successfulOppLineItemIds = new Set<Id>();
    global Set<Id> failedOppLineItemIds = new Set<Id>();
    
    global Database.QueryLocator start(Database.BatchableContext BC) {     
        
        System.debug('CM_OpportunityLineItems_Batch - START');
        
        /* Get CM MA Id's from the CSV file in the Static Resource */
        Set<String> maIdList = new Set<String>();
        if(Test.isRunningTest()){
            List<Opportunity> oppList = [Select Id,(SELECT  Id From OpportunityLineItems) From Opportunity Where Name IN('Test Opportunity1','Test Opportunity7','Test Opportunity8','Test Opportunity9','Test Opportunity10')];
            for(Opportunity opp : oppList){
                maIdList.add(opp.Id);
            }
            //return Database.getQueryLocator('Select Id From Opportunity Where Name=\'Test Opportunity1\'');
        }else{
            StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'CM_MA_Ids_For_OppLineitems'];
            String xmlBodyString = sr.body.toString();
            String[] maIdArray = xmlBodyString.split(',');
            Integer startIndex = 0;        
            if(maIdArray != null && maIdArray.size() > 0) {
                for(Integer i = startIndex; i < maIdArray.size() ; i++){                       
                    maIdList.add(maIdArray.get(i).trim());                    
                }                        
            }
        }
        
        /* Get Total Price Book Entry Details of all the Product Types [Medical, Pharmacy, Dental, Vision] */
        totalPriceBookEntriesMap = new Map<String, PricebookEntry>();
        List<PricebookEntry> pricebookEntriesList = Database.query('SELECT Id, Pricebook2Id, Product2Id, Product2.Product_Line__c FROM PricebookEntry where Product2.Name = \'Total\'');            
        if(pricebookEntriesList != null && pricebookEntriesList.size() > 0) {
            for(PricebookEntry priceBookEntryObj : pricebookEntriesList) {
                totalPriceBookEntriesMap.put(priceBookEntryObj.Product2.Product_Line__c, priceBookEntryObj);
            }
        } 
        
        /* Get Total Product Details of all the Product Types [Medical, Pharmacy, Dental, Vision] */
        totalProductsMap = new Map<String, Product2>();
        List<Product2> totalProductsList = Database.query('Select Id,Name,Product_Line__c,Distribution_Type_Flag__c,Family from Product2 where Name = \'Total\'');            
        if(totalProductsList != null && totalProductsList.size() > 0) {
            for(Product2 totalProdObj : totalProductsList) {
                totalProductsMap.put(totalProdObj.Product_Line__c, totalProdObj);
            }
        }
        
        System.debug('Total No. of CM MA Id\'s - '+maIdList.size());
        System.debug('CM MA Id\'s - '+maIdList);
        
        /* Get the Opporunity Line Items Details of all the provided MA Ids in the Static Resource */
        return Database.getQueryLocator('Select Id, Product_Type_Involved_in_Opp__c,Sales_Stage_Dental__c,Sales_Stage_Medical__c,Sales_Stage_Other__c,Sales_Stage_Pharmacy__c,Sales_Stage_Vision__c, Disposition_Dental__c, Disposition_Medical__c, Disposition_Other__c, Disposition_Pharmacy__c, Disposition_Vision__c, Existing_Members_Involved_in_the_Bid__c, Members_Trans_From_or_To_Another_Segment__c,  Estimated_Additional_New_Members__c, Estimated_Members_Existing_New__c, Existing_Membership_at_Risk__c , Net_Results__c, Existing_Members_Risk_Outcome_Medical__c,Existing_Members_Risk_Outcome_Dental__c, Existing_Members_Risk_Outcome_Pharmacy__c, Existing_Members_Risk_Outcome_Vision__c, Merit_Disposition_Other_Buy_Up_Programs__c, (SELECT  Id, OpportunityId, Existing_Members_Retained__c, Existing_Members_Retained_Pinnacle__c, Product2.Name,Product2.Distribution_Type_Flag__c, Product2.Considered_For_StepWise_Integration__c, Termed_Members__c, Sold_New_Members__c, Annual_Revenue_Premium__c, Product2.Product_Line__c, Estimated_Additional_New_Members__c, Existing_Members_Involved_in_the_Bid__c, Existing_Membership_at_Risk__c, Funding_Type__c, Members_Quoted_in_the_Proposal__c, Net_Results__c, Sold_Retained_Members__c, Mbrs_Transferred_From_To_Another_Segment__c, Copy_the_Membership_from_Medical__c, Disposition_Other_Buy_Up_Programs__c , Sales_Stage__c , Merit_Sold_Members__c, Merit_Actual_Membership_Loss__c From OpportunityLineItems)From Opportunity Where Id IN :maIdList');
    }
    
    global void execute(Database.BatchableContext BC,List<Opportunity> oppList) { 
        
        System.debug('CM_OpportunityLineItems_Batch - execute() START');
        
        List<OpportunityLineItem> oppLineItemsListToBeUpserted = new List<OpportunityLineItem>();
        List<Opportunity> opportunitiesListToBeUpserted = new List<Opportunity>();
        
        try {
            
            if(oppList != null && oppList.size() > 0) {
                
                for(Opportunity opp : oppList) {
                    
                    try {                                       
                        
                        Map<String,OpportunityLineItem> oppLineItemMap = new Map<String,OpportunityLineItem>();
                        
                        List<OpportunityLineItem> oppLineItemList = opp.getSobjects('OpportunityLineItems');
                        oppLineItemList = (oppLineItemList != null) ? oppLineItemList : new List<OpportunityLineItem>(); 
                        
                        if(oppLineItemList != null && oppLineItemList.size() > 0) {
                            
                            for(OpportunityLineItem oppLineItem : oppLineItemList) {
                                
                                String oppLineItemProductline = oppLineItem.Product2.Product_Line__c;
                                oppLineItemProductline = (oppLineItemProductline != null) ? oppLineItemProductline : '';
                                
                                oppLineItem = getOppLineItem(oppLineItem, opp, oppLineItemProductline, false);
                                
                                Decimal existingMbrsInvInBid = oppLineItem.Existing_Members_Involved_in_the_Bid__c ;                                
                                Decimal estiAddNewMem = oppLineItem.Estimated_Additional_New_Members__c;
                                Decimal existingMemAtRisk = oppLineItem.Existing_Membership_at_Risk__c;
                                Decimal soldRetMembers = oppLineItem.Sold_Retained_Members__c ;
                                Decimal netResults = oppLineItem.Net_Results__c ;
                                Decimal memTransFromToAnoSeg = oppLineItem.Mbrs_Transferred_From_To_Another_Segment__c ; 
                                
                                existingMbrsInvInBid = (existingMbrsInvInBid != null)? existingMbrsInvInBid : 0;
                                estiAddNewMem = (estiAddNewMem != null) ? estiAddNewMem : 0 ;
                                existingMemAtRisk = (existingMemAtRisk != null)? existingMemAtRisk : 0;
                                netResults = (netResults != null) ? netResults : 0 ;
                                memTransFromToAnoSeg = (memTransFromToAnoSeg != null)? memTransFromToAnoSeg : 0;  
                                
                                /* Create the new Total Opportunity Line Item Records */
                                
                                if(oppLineItemProductline != 'Other') {
                                    if(oppLineItemMap.containsKey(oppLineItem.Product2.Product_Line__c)) {
                                        OpportunityLineItem totalOppLineItem = oppLineItemMap.get(oppLineItem.Product2.Product_Line__c);
                                        totalOppLineItem.Existing_Members_Involved_in_the_Bid__c = totalOppLineItem.Existing_Members_Involved_in_the_Bid__c + existingMbrsInvInBid;
                                        totalOppLineItem.Estimated_Additional_New_Members__c = totalOppLineItem.Estimated_Additional_New_Members__c + estiAddNewMem;
                                        totalOppLineItem.Existing_Membership_at_Risk__c = totalOppLineItem.Existing_Membership_at_Risk__c + existingMemAtRisk;
                                        if(soldRetMembers != null) {
                                            totalOppLineItem.Sold_Retained_Members__c = (totalOppLineItem.Sold_Retained_Members__c != null) ? totalOppLineItem.Sold_Retained_Members__c : 0;
                                            totalOppLineItem.Sold_Retained_Members__c = totalOppLineItem.Sold_Retained_Members__c + soldRetMembers;
                                        }
                                        totalOppLineItem.Net_Results__c = totalOppLineItem.Net_Results__c + netResults;
                                        totalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c = totalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c + memTransFromToAnoSeg;
                                        oppLineItemMap.put(oppLineItemProductline,totalOppLineItem);
                                    } else {
                                        OpportunityLineItem newTotalOppLineItem = new OpportunityLineItem();
                                        newTotalOppLineItem.OpportunityId = opp.Id;
                                        newTotalOppLineItem.Existing_Members_Involved_in_the_Bid__c = existingMbrsInvInBid;
                                        newTotalOppLineItem.Estimated_Additional_New_Members__c = estiAddNewMem;
                                        newTotalOppLineItem.Existing_Membership_at_Risk__c = existingMemAtRisk;
                                        newTotalOppLineItem.Sold_Retained_Members__c = soldRetMembers;
                                        newTotalOppLineItem.Net_Results__c = netResults;
                                        newTotalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c = memTransFromToAnoSeg;
                                        newTotalOppLineItem.Members_Quoted_in_the_Proposal__c = 0;
                                        newTotalOppLineItem.Annual_Revenue_Premium__c = 0; 
                                        newTotalOppLineItem.Quantity = 1;
                                        newTotalOppLineItem.TotalPrice = 200;                                        
                                        newTotalOppLineItem.Copy_the_Membership_from_Medical__c = false;
                                        
                                        /* Get the Total Product details of the selected Product Type  */
                                        if(totalPriceBookEntriesMap != null && totalPriceBookEntriesMap.size() > 0 && 
                                           totalPriceBookEntriesMap.get(oppLineItemProductline) != null) {
                                               PricebookEntry pricebookEntryObj = totalPriceBookEntriesMap.get(oppLineItemProductline);
                                               newTotalOppLineItem.PricebookEntryId = pricebookEntryObj.Id;
                                               newTotalOppLineItem.Product2Id  = pricebookEntryObj.Product2Id;  
                                               if(totalProductsMap != null && totalProductsMap.size() > 0 && totalProductsMap.get(oppLineItemProductline) != null) { 
                                                   newTotalOppLineItem.Product2 = totalProductsMap.get(oppLineItemProductline);
                                               }
                                               
                                           }
                                        oppLineItemMap.put(oppLineItemProductline,newTotalOppLineItem);
                                    }
                                }
                            }
                        }
                        
                        if(oppLineItemMap != null && oppLineItemMap.size() > 0) {
                            
                           /*
                            * Adds the Total Opp Line Items Records to the existing Opp Line items List which will be upserted into SF.
                            * Adds the Opportunity Records to the Opp List which will updated in SF.
                            */
                            for(String oppLineItemProductline : oppLineItemMap.keySet()) {
                                
                                OpportunityLineItem totalOppLineItemObj = oppLineItemMap.get(oppLineItemProductline);
                                totalOppLineItemObj = getOppLineItem(totalOppLineItemObj, opp, oppLineItemProductline, true);                                
                                oppLineItemList.add(totalOppLineItemObj);
                                
                                /* Updates the Opportunity fields from the Medical Total Opp Line Item Record */
                                if(oppLineItemProductline == System.Label.Medical) {
                                    
                                    String disposition = opp.Disposition_Medical__c;                                    
                                    Decimal existingMbrsInvInBid = totalOppLineItemObj.Existing_Members_Involved_in_the_Bid__c;
                                    Decimal mbrsTranFromToAnotherSeg = totalOppLineItemObj.Mbrs_Transferred_From_To_Another_Segment__c;
                                    Decimal estAddNewMems = totalOppLineItemObj.Estimated_Additional_New_Members__c;
                                    Decimal estMemExiNew = totalOppLineItemObj.Estimated_Members_Existing_New__c;
                                    Decimal existingMemAtRisk = totalOppLineItemObj.Existing_Membership_at_Risk__c;                                    
                                    Decimal soldRetMembers = totalOppLineItemObj.Sold_Retained_Members__c;
                                    Decimal netResults = totalOppLineItemObj.Net_Results__c;
                                    
                                    disposition = (disposition != null) ? disposition : '';		
                                    existingMbrsInvInBid = (existingMbrsInvInBid != null)? existingMbrsInvInBid : 0;   
                                    mbrsTranFromToAnotherSeg = (mbrsTranFromToAnotherSeg != null)? mbrsTranFromToAnotherSeg : 0;
                                    estAddNewMems = (estAddNewMems != null)? estAddNewMems : 0;   
                                    estMemExiNew = existingMbrsInvInBid + estAddNewMems;  
                                    existingMemAtRisk = (existingMemAtRisk != null)? existingMemAtRisk : 0;
                                    soldRetMembers = (soldRetMembers != null)? soldRetMembers : 0;
                                    netResults = (netResults != null)? netResults : 0;                                    
                                    
                                   /* Update the following Opportunity fields from the Medical Total Opp Line Item Record ->
                                    * Existing Members Involved in the Bid,Members Transferred From To Another Segment,Estimated Additional New Members,
                                    * Estimated Members (Existing + New),Existing Membership at Risk,Sold/Retained Members,Net Results 
                                    */									
                                    
                                    opp.Existing_Members_Involved_in_the_Bid__c = existingMbrsInvInBid;
                                    opp.Members_Trans_From_or_To_Another_Segment__c = mbrsTranFromToAnotherSeg;
                                    opp.Estimated_Additional_New_Members__c = estAddNewMems;
                                    opp.Estimated_Members_Existing_New__c = estMemExiNew;
                                    opp.Existing_Membership_at_Risk__c = existingMemAtRisk;
                                    opp.Sold_Retained_Members__c = soldRetMembers;
                                    opp.Net_Results__c = netResults;
                                    
                                    /* Logic to update the Existing Members Retained at the Opportunity*/
                                    if(disposition == 'Closed Emerging Risk') { 
                                        opp.Existing_Members_Retained__c = soldRetMembers;
                                    } else {
                                        if(soldRetMembers >= existingMbrsInvInBid) {
                                            opp.Existing_Members_Retained__c = existingMbrsInvInBid;
                                        } else {
                                            opp.Existing_Members_Retained__c = soldRetMembers;
                                        }
                                    }
                                    
                                    /* Logic to update the Existing Members Retained Pinnacle at the Opportunity */
                                    if(soldRetMembers >= existingMemAtRisk){
                                        opp.Existing_Members_Retained_Pinnacle__c = existingMemAtRisk;
                                    }else{
                                        opp.Existing_Members_Retained_Pinnacle__c = soldRetMembers;
                                    }
                                    
                                    /* Logic to update the Sold New Members and Termed Members at the Opportunity */
                                    if(netResults > 0) {
                                        opp.Sold_New_Mbrs__c = netResults;
                                        opp.Termed_Mbrs__c = 0;
                                    } else if(netResults < 0) {
                                        opp.Termed_Mbrs__c = netResults;
                                        opp.Sold_New_Mbrs__c = 0;
                                    } else {
                                        opp.Sold_New_Mbrs__c = 0;
                                        opp.Termed_Mbrs__c = 0;
                                    }
                                    
                                    opportunitiesListToBeUpserted.add(opp);                        
                                }
                            } 
                        } else {
                            
                           /*
                            * Create the New Total Opp Line Items for the associated Opportunity as there are NO associated OppLine Items.
                            * Update the Opportunity Fields to 0 as there are NO associated OppLine Items.
                            */
                            String productTypes = opp.Product_Type_Involved_in_Opp__c;
                            productTypes = (productTypes != null) ? productTypes : '';
                            String[] productTypesArray = productTypes.split(';');
                            
                            if(productTypesArray != null && productTypesArray.size() > 0) {
                                
                                for(String productType : productTypesArray) {
                                    System.debug('productType-'+productType);
                                    if(productType != 'Other Buy Up Programs') {
                                        
                                        /* Create the New Total Opportunity Line Item for the selected Product Type */
                                        OpportunityLineItem newTotalOppLineItem = new OpportunityLineItem();
                                        newTotalOppLineItem.OpportunityId = opp.Id;
                                        newTotalOppLineItem.Existing_Members_Involved_in_the_Bid__c = 0;
                                        newTotalOppLineItem.Estimated_Additional_New_Members__c = 0;
                                        newTotalOppLineItem.Existing_Membership_at_Risk__c = 0;
                                        newTotalOppLineItem.Net_Results__c = 0;
                                        newTotalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c = 0;
                                        newTotalOppLineItem.Members_Quoted_in_the_Proposal__c = 0;
                                        newTotalOppLineItem.Annual_Revenue_Premium__c = 0;
                                        newTotalOppLineItem.Quantity = 1;
                                        newTotalOppLineItem.TotalPrice = 200;
                                        newTotalOppLineItem.Copy_the_Membership_from_Medical__c = false;
                                        /* Get the Total Product details of the selected Product Type  */
                                        if(totalPriceBookEntriesMap != null && totalPriceBookEntriesMap.size() > 0 && 
                                           totalPriceBookEntriesMap.get(productType) != null) {
                                               PricebookEntry pricebookEntryObj = totalPriceBookEntriesMap.get(productType);
                                               newTotalOppLineItem.PricebookEntryId = pricebookEntryObj.Id;
                                               newTotalOppLineItem.Product2Id  = pricebookEntryObj.Product2Id; 
                                               if(totalProductsMap != null && totalProductsMap.size() > 0 && totalProductsMap.get(productType) != null) { 
                                                   newTotalOppLineItem.Product2 = totalProductsMap.get(productType);
                                               }
                                           }
                                        oppLineItemList.add(newTotalOppLineItem);
                                        
                                        
                                    }                                    
                                } 
                                
                                /* Update the Opportunity fields with the default value as 0*/                                
                                opp.Existing_Members_Involved_in_the_Bid__c = 0;
                                opp.Members_Trans_From_or_To_Another_Segment__c = 0;
                                opp.Estimated_Additional_New_Members__c = 0;
                                opp.Estimated_Members_Existing_New__c = 0;
                                opp.Existing_Membership_at_Risk__c = 0;
                                opp.Existing_Members_Retained__c = 0;
                                opp.Existing_Members_Retained_Pinnacle__c = 0;
                                opp.Sold_New_Mbrs__c = 0;
                                opp.Termed_Mbrs__c = 0;
                                
                            }                            
                        }    
                        System.debug('oppLineItemList');
                        oppLineItemsListToBeUpserted.addAll(oppLineItemList);                  
                    } 
                    
                    catch(Exception ex) {
                        System.debug('Error Line '+ex.getLineNumber());
                        System.debug('Error Message '+ex.getMessage());
                        System.debug('Exception occurred in CM_OpportunityLineItems_Batch execute() while iterating the Opportunities List - '+ex);
                    }            
                }
                
                if(oppLineItemsListToBeUpserted != null && oppLineItemsListToBeUpserted.size() > 0) {
                    Database.UpsertResult[] srList =  Database.upsert(oppLineItemsListToBeUpserted, false) ;
                    System.debug('Opp line Items Successfully Inserted');
                    for (Database.UpsertResult upsertRes : srList) {
                        if (upsertRes.isSuccess()) {
                            successfulOppLineItemIds.add(upsertRes.getId());
                        } else {
                            failedOppLineItemIds.add(upsertRes.getId());                                                        
                            for(Database.Error err : upsertRes.getErrors()) {
                                System.debug('The following error has occurred.');                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('Opp Line Items fields that affected this error: ' + err.getFields());
                            }
                        }
                    }
                }
                
                System.debug('#### Successful Opp Line Item Ids Size :: '+successfulOppLineItemIds.size());
                System.debug('#### Failed Opp Line Item Ids Size :: '+failedOppLineItemIds.size());
                System.debug('#### Successful Opp Line Item Ids :: '+successfulOppLineItemIds);
                System.debug('#### Failed Opp Line Item Ids :: '+failedOppLineItemIds);
                
                if(opportunitiesListToBeUpserted != null && opportunitiesListToBeUpserted.size() > 0) {
                    Database.SaveResult[] srList = Database.update(opportunitiesListToBeUpserted, false);   
                    System.debug('Opportunities Successfully Inserted');
                    for (Database.SaveResult savRes : srList) {
                        if (savRes.isSuccess()) {
                            successfulOpportunityIds.add(savRes.getId());
                        } else {
                            failedOpportunityIds.add(savRes.getId());
                            for(Database.Error err : savRes.getErrors()) {
                                System.debug('The following error has occurred.');                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('Opp fields that affected this error: ' + err.getFields());
                            }
                        }
                    }
                }
                
                System.debug('#### Successful Opp Ids Size :: '+successfulOpportunityIds.size());
                System.debug('#### Failed Opp Ids Size :: '+failedOpportunityIds.size());
                System.debug('#### Successful Opp Ids :: '+successfulOpportunityIds);
                System.debug('#### Failed Opp Ids :: '+failedOpportunityIds);
            }
        }  catch(Exception e) {
            System.debug('Exception occurred in CM_OpportunityLineItems_Batch execute() while updating Opportunity or upserting the Opp Line Items Data - '+e);
        }        
        
        System.debug('CM_OpportunityLineItems_Batch - execute() END');
    }
    
    global void finish(Database.BatchableContext BC) {
        
        System.debug('CM_OpportunityLineItems_Batch FINISH');
        System.debug('CM_OpportunityLineItems_Batch - END');
        /* String OppLineItemString = '';
			for (String oppLineItemId : failedOppLineItemIds) {  
			OppLineItemString += oppLineItemId+'\n';
		}
		System.debug('OppLineItemString'+OppLineItemString);*/
        String OppString = '';
        for (String oppId : failedOpportunityIds) {  
            OppString += oppId+'\n';
        }
        System.debug('OppString'+OppString);
        System.debug('Opp Ids->'+successfulOpportunityIds.size());
    }
    
    /*
     * Formula Logic to update the  Disposition OtherBuyUpPrograms, Sold/Retained Members, Sales Stage, Net Results, Existing Members Retained, Existing Members Retained Pinnacle,
     * Sold New Members, Termed Members fields at the Opportunity Line Item Record
     */ 
    public OpportunityLineItem getOppLineItem(OpportunityLineItem oppLineItem, Opportunity opp, String oppLineItemProductline, Boolean isTotal) {
        
        String disposition = '';
        if(oppLineItemProductline == 'Other') { 
            disposition = oppLineItem.Disposition_Other_Buy_Up_Programs__c;
            disposition = (disposition != null) ? disposition : '';
        } else {
            String oppDispositionItag = 'Disposition_'+oppLineItemProductline+'__c';
            disposition = (String)opp.get(oppDispositionItag);
            disposition = (disposition != null) ? disposition : '';
        }
        
        String oppSalesStageItag = 'Sales_Stage_'+oppLineItemProductline+'__c';
        String salesStageVal = (String)opp.get(oppSalesStageItag);
        salesStageVal = (salesStageVal != null) ? salesStageVal : '';
        
        Decimal existingMbrsInvInBid = oppLineItem.Existing_Members_Involved_in_the_Bid__c ;
        existingMbrsInvInBid = (existingMbrsInvInBid != null)? existingMbrsInvInBid : 0;
        Decimal existingMemAtRisk = oppLineItem.Existing_Membership_at_Risk__c;
        existingMemAtRisk = (existingMemAtRisk != null)? existingMemAtRisk : 0;
        Decimal soldRetMembers;
        
        Decimal soldMembers = oppLineItem.Merit_Sold_Members__c;
        soldMembers = (soldMembers != null) ? soldMembers : 0;
        
        /* Disposition OtherBuyUpPrograms at the Opportunity Line Item Record */
        if(oppLineItemProductline == 'Other') { 
            String maDispositionMerit = opp.Merit_Disposition_Other_Buy_Up_Programs__c;
            maDispositionMerit = (maDispositionMerit != null) ? maDispositionMerit : '';
            if(maDispositionMerit == 'Closed Emerging Risk') {
                oppLineItem.Disposition_Other_Buy_Up_Programs__c = 'Closed Emerging Risk';   
            } else if((maDispositionMerit == 'Dead' ||maDispositionMerit == 'Declined' || maDispositionMerit == 'Passed to Another Segment' || 
                       maDispositionMerit == 'Lost: Finalist' || maDispositionMerit == 'Lost: Non-Finalist') && soldMembers > 0) {
                           oppLineItem.Disposition_Other_Buy_Up_Programs__c = 'Sold';
                       } else if(maDispositionMerit == 'Sold') {
                           oppLineItem.Disposition_Other_Buy_Up_Programs__c = 'Sold';
                       } else {
                           oppLineItem.Disposition_Other_Buy_Up_Programs__c = maDispositionMerit;
                       }            
        }
        
        /* Sold/Retained Members Field */
        if(isTotal == false) {
            
            Decimal actualMemLoss = oppLineItem.Merit_Actual_Membership_Loss__c;
            actualMemLoss = (actualMemLoss != null) ? actualMemLoss : 0;
            System.debug('oppLineItemProductline-'+oppLineItemProductline+'  '+'disposition-'+disposition +'  '+'existingMemAtRisk-'+existingMemAtRisk+'  '+'actualMemLoss-'+actualMemLoss+'  '+'soldRetMembers-'+soldRetMembers);
            
            if(oppLineItemProductline == 'Other') { 
                
                if(disposition == 'Closed Emerging Risk' && (existingMemAtRisk - actualMemLoss) > 0) {
                    soldRetMembers = (existingMemAtRisk - actualMemLoss);
                } else if(disposition == 'Sold') {
                    soldRetMembers = soldMembers;
                } else if(disposition == 'Dead'){
                    soldRetMembers = existingMbrsInvInBid;
                } else if(salesStageVal == 'Notified') {
                    soldRetMembers = 0;
                }
                System.debug('After soldRetMembers-'+soldRetMembers);
            } else {  
                //System.debug('oppLineItemProductline-'+oppLineItemProductline+'  '+'disposition-'+disposition +'  '+'existingMemAtRisk-'+existingMemAtRisk+'  '+'actualMemLoss-'+actualMemLoss+'  '+'soldRetMembers-'+soldRetMembers);
                String extMemRiskOutcomItag = 'Existing_Members_Risk_Outcome_'+oppLineItemProductline+'__c';
                extMemRiskOutcomItag = (extMemRiskOutcomItag != null) ? extMemRiskOutcomItag : '';
                String extMemRiskOutcom = (String)opp.get(extMemRiskOutcomItag);
                extMemRiskOutcom = (extMemRiskOutcom != null) ? extMemRiskOutcom : '';
                if(disposition == 'Closed Emerging Risk' &&  extMemRiskOutcom != 'Full Cancellation' && (existingMemAtRisk - actualMemLoss) > 0){
                    soldRetMembers = (existingMemAtRisk - actualMemLoss);
                } else if(disposition == 'Sold' && extMemRiskOutcom != 'Full Cancellation'){
                    soldRetMembers = soldMembers;
                } else if(disposition == 'Dead'){
                    soldRetMembers = existingMbrsInvInBid;
                } else if(salesStageVal == 'Notified') {
                    soldRetMembers = 0;
                }
            }
            oppLineItem.Sold_Retained_Members__c = soldRetMembers; 
            System.debug('After soldRetMembers1'+soldRetMembers);
        } else {
            soldRetMembers = oppLineItem.Sold_Retained_Members__c;
        }
        
        /* Sales Stage Field */
        if(salesStageVal == 'Notified' || salesStageVal == 'Transfer In/Out') {
            if(oppLineItemProductline == 'Other') {
                if(salesStageVal == 'Transfer In/Out'){
                    oppLineItem.Sales_Stage__c = salesStageVal;
                } else {
                    oppLineItem.Sales_Stage__c = disposition;
                }
                
            } else {
                oppLineItem.Sales_Stage__c = disposition;
            }                        
        } else {
            oppLineItem.Sales_Stage__c = salesStageVal;
        }
        
        /* Existing Members Retained Field */
        if(disposition == 'Closed Emerging Risk') { 
            oppLineItem.Existing_Members_Retained__c = soldRetMembers;
        } else {
            if(soldRetMembers != null && soldRetMembers >= existingMbrsInvInBid) {                
                oppLineItem.Existing_Members_Retained__c = existingMbrsInvInBid;
            } else {
                oppLineItem.Existing_Members_Retained__c = soldRetMembers;
            }            
        }
        oppLineItem.Existing_Members_Retained__c = (oppLineItem.Existing_Members_Retained__c != null) ? oppLineItem.Existing_Members_Retained__c : 0;
        
        /* Existing Members Retained Pinnacle Field */
        if(soldRetMembers != null && soldRetMembers >= existingMemAtRisk) {
            oppLineItem.Existing_Members_Retained_Pinnacle__c = existingMemAtRisk;
        } else {
            oppLineItem.Existing_Members_Retained_Pinnacle__c = soldRetMembers;
        }
        oppLineItem.Existing_Members_Retained_Pinnacle__c = (oppLineItem.Existing_Members_Retained_Pinnacle__c != null) ? oppLineItem.Existing_Members_Retained_Pinnacle__c : 0;
        
        /* Net Results Field */
        if(isTotal == false) {
            if(disposition == 'Dead Lead' || disposition == 'Dead RFI' || disposition == 'Dead' ||disposition == 'Declined' ||disposition == 'Passed to Another Segment'){
                oppLineItem.Net_Results__c = 0;
            } else if(soldRetMembers != null && (disposition == 'Sold' || disposition == 'Lost: Finalist' || disposition == 'Lost: Non-Finalist')) {
                oppLineItem.Net_Results__c = soldRetMembers - existingMbrsInvInBid;
            } else if(soldRetMembers != null && disposition == 'Closed Emerging Risk'){
                oppLineItem.Net_Results__c = soldRetMembers - existingMemAtRisk;
            }
        }
        
        return oppLineItem;
    }
}