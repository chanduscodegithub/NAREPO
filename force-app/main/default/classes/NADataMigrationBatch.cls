global class NADataMigrationBatch implements Database.Batchable<sObject> {
    
    
    global Database.QueryLocator start(Database.BatchableContext BC) {
        
        System.debug('NADataMigration Batch APEX START');
        List<String> accountIdList = new List<String>();
        if(Test.isRunningTest()){
            List<Account> accList = [Select Id From Account Where Name IN('Test NA Batch Account 11','Test NA Batch Account 12') ];
            for(Account acc : accList){
                accountIdList.add(acc.Id);
            }            
        }
        else{            
            StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'NAOneTimeBatchAccountIdsList'];
            String xmlBodyString = sr.body.toString();
            String[] accountIdArray = xmlBodyString.split(',');
            if(accountIdArray != null && accountIdArray.size() > 0) {
                for(Id accountId : accountIdArray) {
                    accountIdList.add(accountId);
                }
            }
        }
        System.debug('accountIdList-'+accountIdList);
        String query = 'Select Id,(Select Id,Last_Name__c,Name,Case_Management_Start_Date__c,Case_Management_End_Date__c,Job_Title__c,IsVPCR__c,Role__c,User__c,Account_Firm__r.OwnerId from CM_Account_Team_Historys__r) from Account where Id IN :accountIdList';
        
        return Database.getQueryLocator(query);
    }
    
    global void execute(Database.BatchableContext BC, List<Account> accountsList) {
        
        System.debug('NADataMigrationBatch Execute - START');
        
        List<Account> accountDataListToBeUpdated = new List<Account>();

        for(Account accountObj : accountsList) {
            
            List<CM_Account_Team_History__c> returnResultList = accountObj.getSobjects('CM_Account_Team_Historys__r');
            
            if(returnResultList != null && returnResultList.size() > 0) {
                
                NationalAccountSalesTeamClass.CMAccountTeamHistoryResult cmAccountTeamHistoryResultObj = NationalAccountSalesTeamClass.getActiveCMAccountTeamHistoryRecords(returnResultList, '');

                if(cmAccountTeamHistoryResultObj != null) {
                    
                    Account accountdata = new Account();
                    accountdata.Id = accountObj.Id;
                    
                    if(cmAccountTeamHistoryResultObj.vpcr != null || cmAccountTeamHistoryResultObj.rvp != null) {
                        accountdata.CMVPCRRVP__c = cmAccountTeamHistoryResultObj.cmVPCRRVPRowID;
                    } else {
                        accountdata.CMVPCRRVP__c = null;
                    }                   
                    
                    if(cmAccountTeamHistoryResultObj.sce != null){
                        accountdata.CM_SCE__c = cmAccountTeamHistoryResultObj.cmSCERowID;
                    }else {
                        accountdata.CM_SCE__c = null;
                    }
                    if(cmAccountTeamHistoryResultObj.sce1 != null){
                        accountdata.CM_SCE_2__c  = cmAccountTeamHistoryResultObj.cmSCERowID1;
                    }else {
                        accountdata.CM_SCE_2__c = null;
                    }
                    accountDataListToBeUpdated.add(accountdata);
                }
            }
        }
        
        Database.update(accountDataListToBeUpdated);
        
        System.debug('NADataMigrationBatch Execute - END');
        
    }
    
    global void finish(Database.BatchableContext BC) {
        
        /*Account accObj = new Account();
        accObj.Id = '001e000001AllhdAAB';
        accObj.Name = 'Test DataMigration Success Account1';
        update accObj;*/
        
        System.debug('NADataMigration Batch Finish');
        System.debug('NADataMigration Batch APEX END');
    }
    
}