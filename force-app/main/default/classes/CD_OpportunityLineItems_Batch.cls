global class CD_OpportunityLineItems_Batch implements Database.Batchable<Sobject>, Database.Stateful {
    
    global Map<String, PricebookEntry> totalPriceBookEntriesMap {get;set;}
    global Map<String, Product2> totalProductsMap {get;set;}
    global Set<Id> successfulOpportunityIds = new Set<Id>();
    global Set<Id> failedOpportunityIds = new Set<Id>();
    global Set<Id> successfulOppLineItemIds = new Set<Id>();
    global Set<Id> failedOppLineItemIds = new Set<Id>();
    
    global Database.QueryLocator start(Database.BatchableContext BC) {     
        
        System.debug('CD_OpportunityLineItems_Batch - START');
        
        /* Get CD MA Id's from the CSV file in the Static Resource */
        Set<String> maIdList = new Set<String>();
        if(Test.isRunningTest()){
            List<Opportunity> oppList = [Select Id,(SELECT  Id From OpportunityLineItems) From Opportunity Where Name IN('Test Opportunity2','Test Opportunity21','Test Opportunity22','Test Opportunity23','Test Opportunity24','Test Opportunity25')];
            for(Opportunity opp : oppList){
                maIdList.add(opp.Id);
            }            
        }
        else{
            StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'CD_MA_Ids_For_OppLineitems'];
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
        
        System.debug('Total No. of CD MA Id\'s - '+maIdList.size());
        System.debug('CD MA Id\'s - '+maIdList);
        
        /* Get the Opporunity Line Items Details of all the provided MA Ids in the Static Resource */
        return Database.getQueryLocator('Select Id, Product_Type_Involved_in_Opp__c, Sales_Stage_Dental__c,Sales_Stage_Medical__c,Sales_Stage_Other__c,Sales_Stage_Pharmacy__c,Sales_Stage_Vision__c,Disposition_Dental__c, Disposition_Medical__c, Disposition_Other__c, Disposition_Pharmacy__c, Disposition_Vision__c, Existing_Members_Involved_in_the_Bid__c, Members_Trans_From_or_To_Another_Segment__c,  Estimated_Additional_New_Members__c, Estimated_Members_Existing_New__c, Existing_Membership_at_Risk__c , Net_Results__c,  Merit_Disposition_Other_Buy_Up_Programs__c, (SELECT  Id, OpportunityId, Existing_Members_Retained__c, Existing_Members_Retained_Pinnacle__c, Product2.Name,Product2.Distribution_Type_Flag__c, Product2.Considered_For_StepWise_Integration__c, Termed_Members__c, Sold_New_Members__c, Annual_Revenue_Premium__c, Product2.Product_Line__c, Estimated_Additional_New_Members__c, Existing_Members_Involved_in_the_Bid__c, Existing_Membership_at_Risk__c, Funding_Type__c, Members_Quoted_in_the_Proposal__c, Net_Results__c, Sold_Retained_Members__c, Mbrs_Transferred_From_To_Another_Segment__c, Copy_the_Membership_from_Medical__c, Disposition_Other_Buy_Up_Programs__c ,Sales_Stage__c,  Merit_Sold_Members__c From OpportunityLineItems)From Opportunity Where Id IN :maIdList');
    }
    
    global void execute(Database.BatchableContext BC,List<Opportunity> oppList) { 
        
        System.debug('CD_OpportunityLineItems_Batch - execute() START');
        
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
                                
                                Decimal memTransFromToAnoSeg = oppLineItem.Mbrs_Transferred_From_To_Another_Segment__c ;                                
                                Decimal estiAddNewMem = oppLineItem.Estimated_Additional_New_Members__c;
                                Decimal memQuotedInProposal = oppLineItem.Members_Quoted_in_the_Proposal__c;
                                Decimal soldRetMembers = oppLineItem.Sold_Retained_Members__c ;
                                Decimal netResults = oppLineItem.Net_Results__c ;	
                                
                                memTransFromToAnoSeg = (memTransFromToAnoSeg != null)? memTransFromToAnoSeg : 0;
                                estiAddNewMem = (estiAddNewMem != null) ? estiAddNewMem : 0 ;
                                memQuotedInProposal = (memQuotedInProposal != null)? memQuotedInProposal : 0;
                                netResults = (netResults != null) ? netResults : 0 ;
                                
                                /* Create the new Total Opportunity Line Item Records */
                                
                                if(oppLineItemProductline != 'Other') {
                                    if(oppLineItemMap.containsKey(oppLineItem.Product2.Product_Line__c)) {
                                        OpportunityLineItem totalOppLineItem = oppLineItemMap.get(oppLineItem.Product2.Product_Line__c);
                                        totalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c = totalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c + memTransFromToAnoSeg;
                                        totalOppLineItem.Estimated_Additional_New_Members__c = totalOppLineItem.Estimated_Additional_New_Members__c + estiAddNewMem;
                                        totalOppLineItem.Members_Quoted_in_the_Proposal__c = totalOppLineItem.Members_Quoted_in_the_Proposal__c + memQuotedInProposal;
                                        if(soldRetMembers != null) {
                                            totalOppLineItem.Sold_Retained_Members__c = (totalOppLineItem.Sold_Retained_Members__c != null) ? totalOppLineItem.Sold_Retained_Members__c : 0;
                                            totalOppLineItem.Sold_Retained_Members__c = totalOppLineItem.Sold_Retained_Members__c + soldRetMembers;
                                        }
                                        totalOppLineItem.Net_Results__c = totalOppLineItem.Net_Results__c + netResults;
                                        oppLineItemMap.put(oppLineItemProductline,totalOppLineItem);
                                    } else {
                                        OpportunityLineItem newTotalOppLineItem = new OpportunityLineItem();
                                        newTotalOppLineItem.OpportunityId = opp.Id;                                        
                                        newTotalOppLineItem.Mbrs_Transferred_From_To_Another_Segment__c = memTransFromToAnoSeg;
                                        newTotalOppLineItem.Estimated_Additional_New_Members__c = estiAddNewMem;                                        
                                        newTotalOppLineItem.Members_Quoted_in_the_Proposal__c = memQuotedInProposal;
                                        newTotalOppLineItem.Sold_Retained_Members__c = soldRetMembers;
                                        newTotalOppLineItem.Net_Results__c = netResults;
                                        newTotalOppLineItem.Existing_Members_Involved_in_the_Bid__c = 0;
                                        newTotalOppLineItem.Existing_Membership_at_Risk__c = 0;
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
                                    
                                    Decimal mbrsTranFromToAnotherSeg = totalOppLineItemObj.Mbrs_Transferred_From_To_Another_Segment__c;
                                    Decimal estAddNewMembers = totalOppLineItemObj.Estimated_Additional_New_Members__c;
                                    Decimal estMemExiNew = totalOppLineItemObj.Estimated_Members_Existing_New__c;
                                    Decimal memQuotedInProposal = totalOppLineItemObj.Members_Quoted_in_the_Proposal__c;
                                    Decimal netResults = totalOppLineItemObj.Net_Results__c;
                                    
                                    mbrsTranFromToAnotherSeg = (mbrsTranFromToAnotherSeg != null)? mbrsTranFromToAnotherSeg : 0;        
                                    estAddNewMembers = (estAddNewMembers != null)? estAddNewMembers : 0;        
                                    estMemExiNew = mbrsTranFromToAnotherSeg + estAddNewMembers;
                                    memQuotedInProposal = (memQuotedInProposal != null)? memQuotedInProposal : 0;
                                    netResults = (netResults != null) ? netResults : 0 ;
                                    
                                   /* Update the following Opportunity fields from the Medical Total Opp Line Item Record ->
                                    * Members Transferred From To Another Segment,Estimated Additional New Members,Estimated Members (Existing + New),
                                    * Members Quoted in the Proposal, Existing Members Involved in the Bid,Existing Membership at Risk,
                                    * Sold/Retained Members,Net Results 
                                    */
                                    opp.Members_Trans_From_or_To_Another_Segment__c = mbrsTranFromToAnotherSeg;
                                    opp.Estimated_Additional_New_Members__c = estAddNewMembers;
                                    opp.Estimated_Members_Existing_New__c = estMemExiNew;
                                    opp.Members_QUOTED_in_the_Proposal_Medical__c = memQuotedInProposal;
                                    opp.Sold_Retained_Members__c = totalOppLineItemObj.Sold_Retained_Members__c;
                                    opp.Net_Results__c = netResults;
                                    opp.Existing_Members_Involved_in_the_Bid__c = 0;
                                    opp.Existing_Membership_at_Risk__c = 0;
                                    
                                    /* Logic to update the Sold New Members at the Opportunity */
                                    if(netResults > 0) {
                                        opp.Sold_New_Mbrs__c = netResults;
                                    } else {
                                        opp.Sold_New_Mbrs__c = 0;
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
                                    
                                    if(productType != 'Other Buy Up Programs') {
                                        
                                        /* Create the New Total Opportunity Line Item for the selected Product Type */
                                        OpportunityLineItem newTotalOppLineItem = new OpportunityLineItem();
                                        newTotalOppLineItem.OpportunityId = opp.Id;
                                        opp.Existing_Members_Involved_in_the_Bid__c = 0;
                                        opp.Existing_Membership_at_Risk__c = 0;
                                        opp.Members_Trans_From_or_To_Another_Segment__c = 0;
                                        opp.Estimated_Additional_New_Members__c = 0;
                                        opp.Estimated_Members_Existing_New__c = 0;
                                        opp.Members_QUOTED_in_the_Proposal_Medical__c = 0;
                                        opp.Net_Results__c = 0;
                                        newTotalOppLineItem.Quantity = 1;
                                        newTotalOppLineItem.TotalPrice = 200;
                                        newTotalOppLineItem.Copy_the_Membership_from_Medical__c = false;
                                        newTotalOppLineItem.Annual_Revenue_Premium__c = 0;
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
                                opp.Members_Trans_From_or_To_Another_Segment__c = 0;
                                opp.Estimated_Additional_New_Members__c = 0;
                                opp.Estimated_Members_Existing_New__c = 0;
                                opp.Members_QUOTED_in_the_Proposal_Medical__c = 0;
                                opp.Sold_Retained_Members__c = 0;
                                opp.Net_Results__c = 0;
                                opp.Sold_New_Mbrs__c = 0;
                                opp.Existing_Members_Involved_in_the_Bid__c = 0;
                                opp.Existing_Membership_at_Risk__c = 0;
                            }                            
                        }                       
                        oppLineItemsListToBeUpserted.addAll(oppLineItemList);                  
                    }   
                    catch(Exception ex) {
                        System.debug('Error Line '+ex.getLineNumber());
                        System.debug('Error Message '+ex.getMessage());
                        System.debug('Exception occurred in CD_OpportunityLineItems_Batch execute() while iterating the Opportunities List - '+ex);
                    }            
                }
                
                if(oppLineItemsListToBeUpserted != null && oppLineItemsListToBeUpserted.size() > 0) {
                    Database.UpsertResult[] srList =  Database.upsert(oppLineItemsListToBeUpserted,false);
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
                    Database.SaveResult[] srList = Database.update(opportunitiesListToBeUpserted,false);       
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
        }
        catch(Exception e) {
            System.debug('Exception occurred in CD_OpportunityLineItems_Batch execute() while updating Opportunity or upserting the Opp Line Items Data - '+e);
        }        
        
        System.debug('CD_OpportunityLineItems_Batch - execute() END');
    }
    
    global void finish(Database.BatchableContext BC) {
        System.debug('CD_OpportunityLineItems_Batch FINISH'); 
        System.debug('CD_OpportunityLineItems_Batch - END');
        String OppLineItemString = '';
        for (String oppLineItemId : failedOppLineItemIds) {  
            OppLineItemString += oppLineItemId+'\n';
        }
        System.debug('OppLineItemString'+OppLineItemString);
        String OppString = '';
        for (String oppId : failedOpportunityIds) {  
            OppString += oppId+'\n';
        }
        System.debug('OppString'+OppString);
         System.debug('Opp Ids->'+successfulOpportunityIds.size());
    }
    
   /*
    * Formula Logic to update the Disposition OtherBuyUpPrograms, Sales Stage, Net Results field at the Opportunity Line Item Record
    */
    public OpportunityLineItem getOppLineItem(OpportunityLineItem oppLineItem, Opportunity opp, String oppLineItemProductline, Boolean isTotal) {
        
        String disposition = '';
        String oppSalesStageItag = 'Sales_Stage_'+oppLineItemProductline+'__c';               
        String oppDispositionItag = 'Disposition_'+oppLineItemProductline+'__c'; 
        Decimal soldRetMembers = oppLineItem.Sold_Retained_Members__c ;
        Decimal mbrsTranFromToAnotherSeg = oppLineItem.Mbrs_Transferred_From_To_Another_Segment__c;
        
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
        
        /* Sales Stage Field */
        String salesStageVal = (String)opp.get(oppSalesStageItag);
        salesStageVal = (salesStageVal != null) ? salesStageVal : '';
        if(salesStageVal == 'Notified' || salesStageVal == 'Transfer In/Out') {
            if(oppLineItemProductline == 'Other') {
                if(salesStageVal == 'Transfer In/Out'){
                    oppLineItem.Sales_Stage__c = salesStageVal;
                } else {
                    disposition = oppLineItem.Disposition_Other_Buy_Up_Programs__c;
                    oppLineItem.Sales_Stage__c = disposition;
                }
                
            } else {
                oppDispositionItag = 'Disposition_'+oppLineItemProductline+'__c';
                disposition = (String)opp.get(oppDispositionItag);
                oppLineItem.Sales_Stage__c = disposition;
            }                        
        } else {
            oppLineItem.Sales_Stage__c = salesStageVal;
        }                
        disposition = (disposition != null) ? disposition : '';        
        
        /* Net Results Field */
        if(isTotal == false) {
            if(disposition == 'Sold' && soldRetMembers != null && mbrsTranFromToAnotherSeg != null) {
                oppLineItem.Net_Results__c = soldRetMembers - mbrsTranFromToAnotherSeg;
            } else {
                oppLineItem.Net_Results__c = 0;
            }  
        }
        
        return oppLineItem;
    }
}