global class CompetitorDentalVisionCDTotalBatch implements Database.Batchable<Sobject>, Database.Stateful {

    global Database.QueryLocator start(Database.BatchableContext BC) {     
        
        System.debug('Competitor Dental&Vision CD Total Batch - START');
        Set<String> accountIdList = new Set<String>();
        if(Test.isRunningTest()){
            List<Account> accList = [Select Id,(SELECT Id,CompetitorAccount__r.Name,NumberOfMembersHeld__c, Competitorclassification__c FROM Competitors__r) from Account where Name IN ('TestAccount11','TestAccount12','Total')];
            for(Account acc : accList){
                accountIdList.add(acc.Id);
            }            
        } else{
            StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'CDCompetitorsOneTimeBatchAccountIdsList'];
            String xmlBodyString = sr.body.toString();
            String[] accountIdArray = xmlBodyString.split(',');
            Integer startIndex = 0;        
            if(accountIdArray != null && accountIdArray.size() > 0) {
                for(Integer i = startIndex; i < accountIdArray.size() ; i++){                       
                    accountIdList.add(accountIdArray.get(i).trim());                    
                }                        
            }
        }
        
        
        System.debug('accountIdList Size-'+accountIdList.size());
        System.debug('accountIdList-'+accountIdList);
        
        return Database.getQueryLocator('Select Id,(SELECT Id,CompetitorAccount__r.Name,NumberOfMembersHeld__c, Competitorclassification__c FROM Competitors__r) from Account where Id IN :accountIdList');        
    }
    global void execute(Database.BatchableContext BC,List<Account> accountList) { 
        
        System.debug('Competitor Dental&Vision CD Total Batch Start - execute() ');
        System.debug('accountList - '+accountList);
        List<Competitor__c> finalCompetitorListToBeInserted = new List<Competitor__c>();
        List<Competitor__c> finalCompetitorListToBeUpdated = new List<Competitor__c>();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        String totalAccountName = uhgAccountConstants.TOTAL;
        for(Account acc : accountList) {
            try{                                       
                System.debug('Account Id '+acc.Id);                   
                List<Competitor__c> competitorList = acc.getSobjects('Competitors__r');  
                System.debug('Competitors List -> '+competitorList);
				if(schema.sobjecttype.Competitor__c.isaccessible() && schema.sobjecttype.Competitor__c.isCreateable()) {
                    
                    Boolean totalExist = false;
					Decimal dentalNumberOfMembersHeld = 0;
					Decimal visionNumberOfMembersHeld = 0;
                    Boolean isDental = false;
                    Boolean isVision = false;
                    Map<String, Competitor__c> existingTotalCompObjMap = new Map<String, Competitor__c>();
                    for(Competitor__c cdCompetitorObj : competitorList) {
                        if(cdCompetitorObj.Competitorclassification__c != null && (cdCompetitorObj.Competitorclassification__c == 'Dental' || cdCompetitorObj.Competitorclassification__c == 'Vision')) {
                            //if(cdCompetitorObj.CompetitorAccount__r == null || cdCompetitorObj.CompetitorAccount__r.Name == null || (cdCompetitorObj.CompetitorAccount__r.Name != null && cdCompetitorObj.CompetitorAccount__r.Name.trim().length() == 0)){
                            if(cdCompetitorObj.CompetitorAccount__r.Name != null  && cdCompetitorObj.CompetitorAccount__r.Name == uhgAccountConstants.TOTAL) {
                                totalExist = true;
                                existingTotalCompObjMap.put(cdCompetitorObj.Competitorclassification__c, cdCompetitorObj);
                            } else {
                                if(cdCompetitorObj.NumberOfMembersHeld__c == null) {
                                    cdCompetitorObj.NumberOfMembersHeld__c = 0;
                                }
                                if(cdCompetitorObj.Competitorclassification__c == 'Dental') {
                                    isDental = true;
                                    dentalNumberOfMembersHeld = dentalNumberOfMembersHeld + cdCompetitorObj.NumberOfMembersHeld__c;
                                } else if(cdCompetitorObj.Competitorclassification__c == 'Vision') {
                                    isVision = true;
                                    visionNumberOfMembersHeld = visionNumberOfMembersHeld + cdCompetitorObj.NumberOfMembersHeld__c;
                                }                                                                                                            
                            }
                        }
                    }
                    if(totalExist) { 
                        if(isDental == true && existingTotalCompObjMap != null && existingTotalCompObjMap.size() > 0 && 
                           		existingTotalCompObjMap.get('Dental') != null) {
                           Competitor__c competitorTotal =  existingTotalCompObjMap.get('Dental');
                           competitorTotal.NumberOfMembersHeld__c = dentalNumberOfMembersHeld;
                           finalCompetitorListToBeUpdated.add(competitorTotal);
                        } 
                        if(isVision == true && existingTotalCompObjMap != null && existingTotalCompObjMap.size() > 0 && 
                           		existingTotalCompObjMap.get('Vision') != null) {
                           Competitor__c competitorTotal =  existingTotalCompObjMap.get('Vision');
                           competitorTotal.NumberOfMembersHeld__c = visionNumberOfMembersHeld;
                           finalCompetitorListToBeUpdated.add(competitorTotal);
                        }
                        
                    } else if(totalExist == false) {
                        
                        Id totalAccountId = null;
                        List<Account> totalAccountList = Database.query('Select Id from Account where Name=:totalAccountName ORDER BY CreatedDate Asc LIMIT 1');
                        if(totalAccountList != null && totalAccountList.size() > 0) {
                            totalAccountId = totalAccountList[0].Id;           
                        }
                        
                        if(isDental == true) {
                            Competitor__c competitorTotal = new Competitor__c();
                            competitorTotal.Account__c = acc.Id;
                            competitorTotal.Competitorclassification__c = 'Dental';
                            competitorTotal.Type__c = 'Account Competitor';
                            competitorTotal.NumberOfMembersHeld__c = dentalNumberOfMembersHeld;
                            competitorTotal.CompetitorAccount__c = totalAccountId;
                            finalCompetitorListToBeInserted.add(competitorTotal);   
                        }
                        if(isVision == true) {
                            Competitor__c competitorTotal = new Competitor__c();
                            competitorTotal.Account__c = acc.Id;
                            competitorTotal.Competitorclassification__c = 'Vision';
                            competitorTotal.Type__c = 'Account Competitor';
                            competitorTotal.NumberOfMembersHeld__c = visionNumberOfMembersHeld;
                            competitorTotal.CompetitorAccount__c = totalAccountId;
                            finalCompetitorListToBeInserted.add(competitorTotal);  
                        }
                    }                                                
                } else {
                    throw new NoAccessException();
                }    
            } catch(Exception ex) {
                System.debug('Line Number' + ex.getLineNumber());  
                System.debug('Exception occurred in CompetitorDentalVisionCDTotalBatch -> ' + ex.getMessage());
            }         
        }   
        try {            
            System.debug('Competitors List to be inserted -> '+finalCompetitorListToBeInserted);
            List<Database.SaveResult> saveResults =  Database.insert(finalCompetitorListToBeInserted);
            for(Database.SaveResult saveResult : saveResults){
                if(!saveResult.isSuccess()) {
                    for(Database.Error err : saveResult.getErrors()) {                    
                        System.debug('Error Message in CompetitorDentalVisionCDTotalBatch while inserting the records - ' + err.getMessage()+' Id '+saveResult.getId());                    
                    }
                }
            }    
            System.debug('Competitors List to be updated -> '+finalCompetitorListToBeUpdated);
            List<Database.SaveResult> saveResults1 =  Database.update(finalCompetitorListToBeUpdated);
            for(Database.SaveResult saveResult : saveResults1){
                if(!saveResult.isSuccess()) {
                    for(Database.Error err : saveResult.getErrors()) {                    
                        System.debug('Error Message in CompetitorDentalVisionCDTotalBatch while updating the records - ' + err.getMessage()+' Id '+saveResult.getId());                    
                    }
                }
            }
        } catch(Exception ex){
            System.debug('Error Line '+ex.getLineNumber());
            System.debug('Error Message '+ex.getMessage());
        }
        System.debug('Competitor Dental&Vision CD Total Batch End - execute()');  
    }  
    
    global void finish(Database.BatchableContext BC) {
         System.debug('Competitor Dental&Vision CD Total Batch - END');    
    }
}