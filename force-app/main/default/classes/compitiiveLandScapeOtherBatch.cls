global class compitiiveLandScapeOtherBatch implements Database.Batchable<sObject>{
    global final String Query;
    public final String Entity;
    global final String Field;
    global final String Value;
    global Set<Id> allAccountIds = new Set<Id>();
    global Set<Id> successfulAccountIds = new Set<Id>();
    global Set<Id> failedAccountIds = new Set<Id>();
    global final Map <String,Map<String,String>> CmpFinalMap;
    global final Map<String,String> finalOnDemandId;
    global compitiiveLandScapeOtherBatch(Map <String,Map<String,String>> finalMapData,Map<String,String> onDemandID){
        CmpFinalMap=finalMapData;
        finalOnDemandId = onDemandID;
    }
    
    global Database.QueryLocator start(Database.BatchableContext BC){
        set<String> accIds = new set<String>();
        for(String accId:CmpFinalMap.keySet()){
            System.debug('accId'+accId);
            accIds.add(accId);
        }
        string query = 'Select Id,Category__c from Account where Id IN:accIds';
        //String query = 'SELECT Id,Merit_Row_Id__c,Account__r.Id,Account__r.Merit_Row_Id__c,CompetitorAccount__c,TypesofOtherProductsServicesProvide__c FROM Competitor__c where Account__r.Merit_Row_Id__c In:accIds;';
        System.debug('query'+query);
        return Database.getQueryLocator(query);
    }
    
    global void execute(Database.BatchableContext BC,List<sObject> scope){
        
        String AccId = '';
        String category = '';
        System.debug('start');
        listAccount lstAcc = new listAccount();
        Id accountId = lstAcc.listAccount();
        System.debug('accountId'+accountId);
        String dataImportVersion = 'DataImport_02162018_1';
        System.debug('scope'+scope);
        List<Competitor__c> myList = new List<Competitor__c>();
        for(Sobject s : scope){
            AccId = String.valueof(s.get('Id'));
            System.debug('AccId'+AccId);
            category = String.valueof(s.get('Category__c'));
            System.debug('CmpFinalMap'+CmpFinalMap);
            if(CmpFinalMap.containsKey(AccId)){
                Map<String,String> buildMAP = CmpFinalMap.get(AccId);
                System.debug('buildMAP'+buildMAP);
                if(!buildMAP.isEmpty()){
                    Boolean isNationalAccounts = false;
                    for(String getComp: buildMAP.keySet()){
                        String pickListVal = '';
                        Competitor__c a = new Competitor__c();
                        if(getComp != null && getComp != ''){
                            pickListVal = buildMAP.get(getComp);
                        }
                        System.debug('pickListVal'+pickListVal);
                        a.Account__c = AccId;
                        a.Type__c = 'Account Competitor';
                        a.TypesofOtherProductsServicesProvide__c = pickListVal;
                        a.Competitorclassification__c  ='Other';
                        if(category == 'Client Management'){
                            a.ofMembersHeld__c = 0;
                        }
                        a.NumberOfMembersHeld__c = 0;
                        a.Data_Import_Version__c = dataImportVersion;
                        if(getComp != 'AEUA-TYOE0'){
                            a.CompetitorAccount__c = finalOnDemandId.get(getComp);
                        }else{
                            isNationalAccounts = true;
                            a.CompetitorAccount__c = accountId;
                        }
                        myList.add(a);
                    }
                    /*
                    if(isNationalAccounts == false && category == 'Client Management') {
                        Competitor__c a = new Competitor__c();
                        a.Account__c = AccId;
                        a.Type__c = 'Account Competitor';
                        a.TypesofOtherProductsServicesProvide__c = '';
                        a.Competitorclassification__c  ='Other';
                        if(category == 'Client Management'){
                            a.ofMembersHeld__c = 0;
                        }
                        a.NumberOfMembersHeld__c = 0;
                        a.Data_Import_Version__c = dataImportVersion;
                        a.CompetitorAccount__c = accountId;
                        myList.add(a);
                    }*/
                } else {
                    if(category == 'Client Management'){
                        Competitor__c a = new Competitor__c();
                        a.Account__c = AccId;
                        a.Type__c = 'Account Competitor';
                        a.TypesofOtherProductsServicesProvide__c = '';
                        a.Competitorclassification__c  ='Other';
                        a.ofMembersHeld__c = 0;
                        a.NumberOfMembersHeld__c = 0;
                        a.Data_Import_Version__c = dataImportVersion;
                        a.CompetitorAccount__c = accountId;
                        myList.add(a);
                    }
                }
            }
        }
        System.debug('myList'+myList);
        Database.SaveResult[] srList = Database.insert(myList, false);
        
        // Iterate through each returned result
        for (Database.SaveResult sr : srList) {
            if (sr.isSuccess()) {
                successfulAccountIds.add(sr.getId());
                //System.debug('Successfully inserted account. Account ID: ' + sr.getId());
                System.debug('successfulAccountIds'+successfulAccountIds.size());
            }
            else {
                for(Id i : allAccountIds)
                {
                    if(!successfulAccountIds.contains(i))
                        failedAccountIds.add(i);
                }
                system.debug('#### successful ids :: '+successfulAccountIds);
                system.debug('#### failed ids :: '+failedAccountIds);
                for(Database.Error err : sr.getErrors()) {
                    System.debug('The following error has occurred.');                    
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                    System.debug('Account fields that affected this error: ' + err.getFields());
                }
            }
        }
    }
    global void finish(Database.BatchableContext BC){
        BatchJobLogs__c batchLogsObj = new BatchJobLogs__c();
        batchLogsObj.Name = 'AccountValues';
        Database.SaveResult res = Database.insert(batchLogsObj);
        String csvString = '';
        List<Attachment> accAttachment = new List<Attachment>();
        Attachment a = new Attachment();
        a.ParentId = res.getId();
        a.Name = 'compitiveLandscapeFailureRecords.csv';
        Attachment b = new Attachment();
        b.ParentId = res.getId();
        b.Name = 'compitiveLandscapeSuccessRecords.csv';
        accAttachment.add(a);
        accAttachment.add(b);
        for (String accId : failedAccountIds) {  
            csvString += accId+'\n';
        }
        System.debug('csvString'+csvString);
        a.Body = Blob.valueOf(csvString);
        b.Body = Blob.valueOf(csvString);
        /*Database.SaveResult[] srList = Database.insert(accAttachment, false);
        for (Database.SaveResult sr : srList) {
            if (sr.isSuccess()) {
                successfulAccountIds.add(sr.getId());
                System.debug('Successfully inserted Attachment: ' + sr.getId());
            }
            else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('The following error has occurred.Attachment');                    
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                    System.debug('Attachment affected this error: ' + err.getFields());
                }
            }
        }*/
    } 
    
    Global class listAccount{
        public Id listAccount(){
            Id accId = [SELECT ID FROM Account where Name='National Accounts'].Id;
            return accId;
        } 
    }
}