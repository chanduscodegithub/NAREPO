global class CD_MACompetitors_Batch implements Database.Batchable<Sobject>, Database.Stateful {
    
    global Id totalAccountId;
    global Id nationalAccountId;
    global Set<Id> successfulMACompetitorIds = new Set<Id>();
    global Set<Id> failedMACompetitorIds = new Set<Id>();
    
    
    global Database.QueryLocator start(Database.BatchableContext BC) {     
        
        System.debug('CD_MACompetitors_Batch - START');
        /*Account accountObj = Database.query('Select Id,Name from Account where Name= \'Total\' ORDER BY CreatedDate Asc Limit 1');
        if(accountObj != null){
            totalAccountId = accountObj.Id; 
        }*/
        Set<String> accountNames = new Set<String>();
        accountNames.add(Label.National_Account_Name);
        accountNames.add(Label.Total);
        
        List<Account> accountList = Database.query('Select Id,Name from Account where Name IN :accountNames ORDER BY CreatedDate Asc');
        if(accountList != null && accountList.size() > 0) {
            for(Account accObj : accountList) {
                if(accObj.Name == Label.National_Account_Name) {
                    nationalAccountId = accObj.Id; 
                } else if(accObj.Name == Label.Total) {
                    totalAccountId = accObj.Id;
                }
            }
        }
        
        /* Get CD MA Id's from the CSV file in the Static Resource */
        Set<String> maIdList = new Set<String>();
        if(Test.isRunningTest()){
            List<Opportunity> oppList = [Select Id,(SELECT  Id From OpportunityLineItems),(Select Id From MA_Competitor__r) From Opportunity Where Name IN('Test Opportunity41','Test Opportunity42')];
            for(Opportunity opp : oppList){
                maIdList.add(opp.Id);
            }            
        }
        else{
            StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'CD_MA_Ids_For_Competitors'];
            String xmlBodyString = sr.body.toString();
            String[] maIdArray = xmlBodyString.split(',');
            Integer startIndex = 0;        
            if(maIdArray != null && maIdArray.size() > 0) {
                for(Integer i = startIndex; i < maIdArray.size() ; i++){                       
                    maIdList.add(maIdArray.get(i).trim());                    
                }                        
            }   
        }
        System.debug('Total No. of CD MA Id\'s - '+maIdList.size());
        System.debug('CD MA Id\'s - '+maIdList);
        
        /* Get the Opporunity Line Items & MA COmpetitors Details of all the provided MA Ids in the Static Resource */
        return Database.getQueryLocator('Select Id,Product_Type_Involved_in_Opp__c,Members_in_the_Proposal_Medical__c,Sales_Stage_Other__c,Sales_Stage_Dental__c,Sales_Stage_Medical__c,Sales_Stage_Pharmacy__c,Sales_Stage_Vision__c,Disposition_Dental__c,Disposition_Medical__c,Disposition_Pharmacy__c,Disposition_Vision__c,Disposition_Other__c,(Select Product2.Name,Product2.Product_Line__c,Estimated_Members_Existing_New__c,Estimated_Additional_New_Members__c,Existing_Membership_at_Risk__c,Existing_Members_Involved_in_the_Bid__c ,Sold_Retained_Members__c ,Mbrs_Transferred_From_To_Another_Segment__c,Members_Quoted_in_the_Proposal__c from OpportunityLineitems Where Product2.Name=\'Total\'),(Select Id,Competitor_Account__r.Name,Competitor_Classification__c,Number_of_Members_Held__c,Number_of_Members_Awarded__c,of_Members_Awarded__c,of_Members_Held__c from MA_Competitor__r) from Opportunity Where Id IN : maIdList');
    }
    
    global void execute(Database.BatchableContext BC,List<Opportunity> oppList) { 
        
        System.debug('CD_MACompetitors_Batch - execute() START');
        
        List<MA_Competitor__c> maCompetitorToBeUpserted = new List<MA_Competitor__c>();
        
        try { 
            
            if(oppList != null && oppList.size() > 0) { 
                
                for(Opportunity opp : oppList) {
                    
                    try {                                                                                       
                        //System.debug('Opportunity Id '+opp.Id);                        
                        Map<String,OpportunityLineItem> totalOppLineItemsMap = new Map<String,OpportunityLineItem>();
                        Map<String,MA_Competitor__c> totalMACompetitorsMap = new Map<String,MA_Competitor__c>();
                        
                        List<OpportunityLineItem> totalOppLineItemsList = opp.getSobjects('OpportunityLineItems');
                        List<MA_Competitor__c> maCompetitorsList = opp.getSobjects('MA_Competitor__r');
                        totalOppLineItemsList = (totalOppLineItemsList != null) ? totalOppLineItemsList : new List<OpportunityLineItem>(); 
                        maCompetitorsList = (maCompetitorsList != null) ? maCompetitorsList : new List<MA_Competitor__c>(); 
                        
                        //System.debug('Opp Line Items List -> '+totalOppLineItemsList);
                        //System.debug('MA Competitors List ->'+maCompetitorsList);
                        String oppProductTypes = opp.Product_Type_Involved_in_Opp__c;
                        String[] oppPdtTypesArray = oppProductTypes.split(';');
                        String[] oppPdtTypes_NATotalArray = new String[]{};

                        if(maCompetitorsList != null){
                            for(MA_Competitor__c maCompetitor : maCompetitorsList) {
                                String compClas = maCompetitor.Competitor_Classification__c;
                                if(compClas == 'Other'){
                                    compClas = 'Other Buy Up Programs';                                    
                                }
                                if(oppPdtTypesArray.contains(compClas)) {
                                    oppPdtTypes_NATotalArray.add(compClas);
                                }
                            }
                        } /*else {
                            oppPdtTypes_NATotalArray = oppPdtTypesArray;
                        }*/
                        
                        if(oppPdtTypesArray != NULL){
                            for(String oppPdtTy : oppPdtTypesArray){
                                if(!oppPdtTypes_NATotalArray.contains(oppPdtTy)) {
                                    //System.debug('oppPdtTy-'+oppPdtTy);
                                    MA_Competitor__c newNACompetitor = new MA_Competitor__c();
                                    newNACompetitor.Number_of_Members_Held__c = 0;
                                    newNACompetitor.Number_of_Members_Awarded__c = 0;
                                    newNACompetitor.of_Members_Held__c = 0;
                                    newNACompetitor.of_Members_Awarded__c = 0;
                                    newNACompetitor.Comments__c = '';
                                    newNACompetitor.Opportunity__c = opp.Id;
                                    newNACompetitor.Competitor_Account__c = nationalAccountId;
                                    if(oppPdtTy == 'Other Buy Up Programs'){
                                    	newNACompetitor.Competitor_Classification__c = 'Other';    
                                    }
                                    else{
                                    	newNACompetitor.Competitor_Classification__c = oppPdtTy;    
                                    }
                                    maCompetitorsList.add(newNACompetitor);   
                                }                                                                
                            }                            
                        }
                        
                        if(totalOppLineItemsList != null && totalOppLineItemsList.size() > 0) {
                            /* Creating the Total Opp Line Items Map with key as Comp Classification and value as Total Opp Line Item record */
                            for(OpportunityLineItem totalOppLineItem : totalOppLineItemsList) {                                
                                String oppLineItemProductline = totalOppLineItem.Product2.Product_Line__c;
                                oppLineItemProductline = (oppLineItemProductline != null) ? oppLineItemProductline : '';
                                totalOppLineItemsMap.put(oppLineItemProductline, totalOppLineItem);
                            }
                        }
                        //System.debug('totalOppLineItemsMap ->'+totalOppLineItemsMap);
                        if(maCompetitorsList != null && maCompetitorsList.size() > 0) {                            
                            
                            for(MA_Competitor__c maCompetitor : maCompetitorsList) {
                                
                                String competitorClassification = maCompetitor.Competitor_Classification__c;
                                competitorClassification = (competitorClassification !=  null) ? competitorClassification : '';
                                
                                /* Logic to get the Members Involved in the MA value */
                                Decimal membersInvolvedInTheMA = 0;
                                //System.debug('totalOppLineItemsMap ->'+totalOppLineItemsMap+'  '+totalOppLineItemsMap.get(competitorClassification));
                                if(competitorClassification != 'Other') {
                                    if(competitorClassification.equalsIgnoreCase(System.Label.Medical)) {
                                        membersInvolvedInTheMA = opp.Members_in_the_Proposal_Medical__c;
                                        if(membersInvolvedInTheMA == null || (membersInvolvedInTheMA != null && membersInvolvedInTheMA <= 0)) {
                                            if(totalOppLineItemsMap != null && totalOppLineItemsMap.get(competitorClassification) != null) {
                                                OpportunityLineItem totalOppLineItemObj = totalOppLineItemsMap.get(competitorClassification);
                                                if(totalOppLineItemObj != null) {
                                                    Decimal mbrTransFrmAnotherSeg = totalOppLineItemObj.Mbrs_Transferred_From_To_Another_Segment__c;
                                                    mbrTransFrmAnotherSeg = (mbrTransFrmAnotherSeg != null) ? mbrTransFrmAnotherSeg : 0;
                                                    Decimal estAddNewMem = totalOppLineItemObj.Estimated_Additional_New_Members__c;
                                                    estAddNewMem = (estAddNewMem != null) ? estAddNewMem : 0;
                                                    membersInvolvedInTheMA = mbrTransFrmAnotherSeg + estAddNewMem;
                                                }
                                            }
                                        }
                                    } else {
                                        if(totalOppLineItemsMap != null && totalOppLineItemsMap.get(competitorClassification) != null) {
                                            OpportunityLineItem totalOppLineItemObj = totalOppLineItemsMap.get(competitorClassification);
                                            if(totalOppLineItemObj != null) {
                                                membersInvolvedInTheMA = totalOppLineItemObj.Members_Quoted_in_the_Proposal__c;
                                                if(membersInvolvedInTheMA == null || (membersInvolvedInTheMA != null && membersInvolvedInTheMA <= 0)) {
                                                    Decimal mbrTransFrmAnotherSeg = totalOppLineItemObj.Mbrs_Transferred_From_To_Another_Segment__c;
                                                    mbrTransFrmAnotherSeg = (mbrTransFrmAnotherSeg != null) ? mbrTransFrmAnotherSeg : 0;
                                                    Decimal estAddNewMem = totalOppLineItemObj.Estimated_Additional_New_Members__c;
                                                    estAddNewMem = (estAddNewMem != null) ? estAddNewMem : 0;
                                                    membersInvolvedInTheMA = mbrTransFrmAnotherSeg + estAddNewMem; 
                                                }
                                            }
                                        }                                    
                                    }                                    
                                    membersInvolvedInTheMA = (membersInvolvedInTheMA != null) ? membersInvolvedInTheMA : 0;                                                                        
                                }                               
                                
                                /* Calculating the % of Members of Held &  % of Members of Awarded based on the Members Involved in the MA for the MA Competitor records */
                                if(membersInvolvedInTheMA != null && membersInvolvedInTheMA > 0) {
                                    if(maCompetitor.Number_of_Members_Held__c != null && membersInvolvedInTheMA >= maCompetitor.Number_of_Members_Held__c) {
                                        maCompetitor.of_Members_Held__c = Math.round((maCompetitor.Number_of_Members_Held__c/membersInvolvedInTheMA)*100);
                                    } else {
                                        maCompetitor.of_Members_Held__c = 0;
                                    }
                                    if(maCompetitor.Number_of_Members_Awarded__c != null && membersInvolvedInTheMA >= maCompetitor.Number_of_Members_Awarded__c) {
                                        maCompetitor.of_Members_Awarded__c = Math.round((maCompetitor.Number_of_Members_Awarded__c/membersInvolvedInTheMA)*100);
                                    } else {
                                        maCompetitor.of_Members_Awarded__c = 0;
                                    }
                                } /*else {
                                    maCompetitor.of_Members_Held__c = 0;
                                    maCompetitor.of_Members_Awarded__c = 0;
                                }*/
                                
                                /* Calculating the % of Members of Held &  % of Members of Awarded */                                
                                Decimal noOfMemHeld = maCompetitor.Number_of_Members_Held__c;
                                noOfMemHeld = (noOfMemHeld != null) ? noOfMemHeld : 0;
                                Decimal noOfMemAwa = maCompetitor.Number_of_Members_Awarded__c;
                                noOfMemAwa = (noOfMemAwa != null) ? noOfMemAwa : 0;  
                                Decimal ofMemHeld = maCompetitor.of_Members_Held__c;
                                ofMemHeld = (ofMemHeld != null) ? ofMemHeld : 0;
                                Decimal ofMemAwa = maCompetitor.of_Members_Awarded__c;
                                ofMemAwa = (ofMemAwa != null) ? ofMemAwa : 0;
                                
                                /* Creating TOTAL Records */
                                if(totalMACompetitorsMap != null && totalMACompetitorsMap.containsKey(competitorClassification)) {
                                    MA_Competitor__c newTotalCompetitor = totalMACompetitorsMap.get(competitorClassification);
                                    newTotalCompetitor.Number_of_Members_Held__c = newTotalCompetitor.Number_of_Members_Held__c + noOfMemHeld;
                                    newTotalCompetitor.Number_of_Members_Awarded__c = newTotalCompetitor.Number_of_Members_Awarded__c + noOfMemAwa;
                                    newTotalCompetitor.of_Members_Held__c = newTotalCompetitor.of_Members_Held__c + ofMemHeld;
                                    newTotalCompetitor.of_Members_Awarded__c = newTotalCompetitor.of_Members_Awarded__c + ofMemAwa;
                                    totalMACompetitorsMap.put(competitorClassification, newTotalCompetitor);
                                } 
                                else {
                                    MA_Competitor__c newTotalCompetitor = new MA_Competitor__c();
                                    newTotalCompetitor.Number_of_Members_Held__c = noOfMemHeld;
                                    newTotalCompetitor.Number_of_Members_Awarded__c = noOfMemAwa;
                                    newTotalCompetitor.of_Members_Held__c = ofMemHeld;
                                    newTotalCompetitor.of_Members_Awarded__c = ofMemAwa;
                                    newTotalCompetitor.Comments__c = '';
                                    newTotalCompetitor.Opportunity__c = opp.Id;
                                    newTotalCompetitor.Competitor_Account__c = totalAccountId;
                                    newTotalCompetitor.Competitor_Classification__c = competitorClassification;
                                    totalMACompetitorsMap.put(competitorClassification, newTotalCompetitor);
                                }   
                                
                                if(competitorClassification == 'Other') {       
                                    MA_Competitor__c totalMACompetitorObj = totalMACompetitorsMap.get(competitorClassification); 
                                    if(maCompetitor.Number_of_Members_Held__c != null && totalMACompetitorObj.Number_of_Members_Held__c != null && totalMACompetitorObj.Number_of_Members_Held__c > 0) {
                                        maCompetitor.of_Members_Held__c = Math.round((maCompetitor.Number_of_Members_Held__c/totalMACompetitorObj.Number_of_Members_Held__c)*100);
                                    } else {
                                        maCompetitor.of_Members_Held__c = 0;
                                    }
                                    if(maCompetitor.Number_of_Members_Awarded__c != null && totalMACompetitorObj.Number_of_Members_Awarded__c != null && totalMACompetitorObj.Number_of_Members_Awarded__c > 0) {
                                        maCompetitor.of_Members_Awarded__c = Math.round((maCompetitor.Number_of_Members_Awarded__c/totalMACompetitorObj.Number_of_Members_Awarded__c)*100);
                                    } else {
                                        maCompetitor.of_Members_Awarded__c = 0;
                                    }                                    
                                }
                                
                                maCompetitorToBeUpserted.add(maCompetitor);
                                
                            }
                        }
                        //System.debug('maCompetitorToBeUpserted-'+maCompetitorToBeUpserted);
                        if(totalMACompetitorsMap != null && totalMACompetitorsMap.size() > 0) {                                                           
                            for(String compClassification : totalMACompetitorsMap.keySet()) {                                
                                MA_Competitor__c totalMACompetitor = totalMACompetitorsMap.get(compClassification);
                                maCompetitorToBeUpserted.add(totalMACompetitor);                                                               
                            }                             
                            //System.debug('totalMACompetitorsMap ->'+totalMACompetitorsMap);
                        }
                    }
                    catch(Exception ex) {
                        System.debug('Error Line '+ex.getLineNumber());
                        System.debug('Error Message '+ex.getMessage());
                        System.debug('Exception occurred in CM_MACompetitors_Batch execute() while iterating the Opportunities List - '+ex);
                    }                       
                }                         
                if(maCompetitorToBeUpserted != null && maCompetitorToBeUpserted.size() > 0) {
                    Database.UpsertResult[] srList =  Database.upsert(maCompetitorToBeUpserted, false) ;
                    System.debug('MA Competitors Successfully Upserted');
                    for (Database.UpsertResult upsertRes : srList) {
                        if (upsertRes.isSuccess()) {
                            successfulMACompetitorIds.add(upsertRes.getId());
                        } else {
                            failedMACompetitorIds.add(upsertRes.getId());                                                        
                            for(Database.Error err : upsertRes.getErrors()) {
                                System.debug('The following error has occurred.');                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('MA Competitor field that affected this error: ' + err.getFields());
                            }
                        }
                    }          
                    System.debug('#### Successful MA Competitor Ids Size :: '+successfulMACompetitorIds.size());
                    System.debug('#### Failed MA Competitor Ids Size :: '+failedMACompetitorIds.size());                                                          
                }
            } 
        } catch(Exception e){            
            System.debug('Exception occurred in CD_MACompetitors_Batch execute() while updating MA Competitors Data - '+e);
        }
        System.debug('CD_MACompetitors_Batch - execute() END');
    }
    
    global void finish(Database.BatchableContext BC) {
        
        System.debug('CD_MACompetitors_Batch FINISH');
        System.debug('CD_MACompetitors_Batch - END');
    }
    
}