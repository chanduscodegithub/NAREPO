//Select Id, Status, NumberOfErrors, JobItemsProcessed,TotalJobItems, CreatedBy.Email, ExtendedStatus from AsyncApexJob where Id = ''
global class CompetitorCdTotalBatch implements Database.Batchable<Sobject>, Database.Stateful{
    
    global Database.QueryLocator start(Database.BatchableContext BC) {        
        System.debug('Start Competitor CD Total Batch');
        Set<String> accountIdList = new Set<String>();
        if(Test.isRunningTest()){
            List<Account> acct = [SELECT Id FROM Account where Name='Competitive Medical CD' OR Name='Competitive Medical CM' OR Name='Competitive Medical CM1'];
            if(acct != null){
                for(Account ac : acct){
                	accountIdList.add(ac.Id);   
                }                
            }
        }else{
            StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'CompMedicalCdTotalAccList'];
            String xmlBodyString = sr.body.toString();
            String[] accountIdArray = xmlBodyString.split('\n');
            Integer startIndex = 0;        
            if(accountIdArray != null && accountIdArray.size() > 0) {
                for(Integer i = startIndex; i < accountIdArray.size() ; i++){                       
                    accountIdList.add(accountIdArray.get(i).trim());                    
                }                        
            }
            System.debug('accountIdList Size-'+accountIdList.size());
            System.debug('accountIdList-'+accountIdList);
        }
        
        
        return Database.getQueryLocator('Select Id,Subtype__c,(SELECT Id,CompetitorAccount__r.Name, MembershipEstimate__c, ParticipatingActives__c, ParticipatingU65Retirees__c, ParticipatingO65Retirees__c, ParticipatingBargainedFullTimeActive__c, ParticipatingNonBargainedFullTimeAc__c, ParticipatingPartTimeActives__c,Competitorclassification__c FROM Competitors__r) from Account where Id IN :accountIdList');        
    }
    global void execute(Database.BatchableContext BC,List<Account> accountList) {             
        System.debug('Start - execute() ');
        String accType='';
        String totalAccName = 'Total';
        Account accTotal = [SELECT id FROM Account WHERE Name=:totalAccName LIMIT 1]; 
        String nationalAccName = 'National Accounts';
        Account accRecord = [SELECT id FROM Account WHERE Name=:nationalAccName LIMIT 1];
        List<Competitor__c> finalCompetitorList = new List<Competitor__c>();                
        for(Account acc : accountList){
            try{                                       
                System.debug('Account Id '+acc.Id); 
                if(acc.Subtype__c != null && (acc.Subtype__c == 'Prospect' || acc.Subtype__c == 'Suspect' || acc.Subtype__c == 'Prospect Subsidiary')){
                    accType = 'cd';
                }else{
                    accType = 'cm';
                }   
                List<Competitor__c> competitorList = acc.getSobjects('Competitors__r');                            
                if(schema.sobjecttype.Competitor__c.isaccessible() && schema.sobjecttype.Competitor__c.isCreateable()) {
                    Boolean totalExist = false;
                    Boolean nationalExist = false;
                    Decimal c1 = 0,c2 = 0,c3 = 0,c4 = 0,c5 = 0,c6 = 0,c7=0;
                    if(competitorList != null){                                                              
                        for(Competitor__c cdCompititor : competitorList){
                            if(cdCompititor != null && cdCompititor.Competitorclassification__c != null && cdCompititor.Competitorclassification__c == 'Medical') {
                                if(cdCompititor.CompetitorAccount__r != null && cdCompititor.CompetitorAccount__r.Name != null && cdCompititor.CompetitorAccount__r.Name == 'National Accounts'){
                                    nationalExist = true;                                 
                                }
                                if(cdCompititor.CompetitorAccount__r != null && cdCompititor.CompetitorAccount__r.Name != null && cdCompititor.CompetitorAccount__r.Name == 'Total'){
                                    totalExist = true;                                 
                                }else{
                                    if(cdCompititor.ParticipatingNonBargainedFullTimeAc__c != null){
                                        c1 = c1 + cdCompititor.ParticipatingNonBargainedFullTimeAc__c;
                                    }
                                    if(cdCompititor.ParticipatingBargainedFullTimeActive__c != null){
                                        c2 = c2 + cdCompititor.ParticipatingBargainedFullTimeActive__c;
                                    }
                                    if(cdCompititor.ParticipatingPartTimeActives__c != null){
                                        c3 = c3 + cdCompititor.ParticipatingPartTimeActives__c;
                                    }
                                    if(cdCompititor.ParticipatingU65Retirees__c != null){
                                        c4 = c4 + cdCompititor.ParticipatingU65Retirees__c;
                                    }
                                    if(cdCompititor.ParticipatingO65Retirees__c != null){
                                        c5 = c5 + cdCompititor.ParticipatingO65Retirees__c;
                                    }
                                    if(cdCompititor.MembershipEstimate__c != null){                        
                                        c6 = c6 + cdCompititor.MembershipEstimate__c;
                                    }
                                    if(cdCompititor.ParticipatingActives__c != null){
                                        c7 = c7 + cdCompititor.ParticipatingActives__c;
                                    }                                                                                                              
                                }
                            }
                        }
                        if(totalExist == false){
                            Competitor__c competitorTotal = new Competitor__c();
                            competitorTotal.Account__c = acc.Id;                        
                            competitorTotal.Name = 'Total';
                            competitorTotal.CompetitorAccount__c = accTotal.Id;
                            competitorTotal.Competitorclassification__c = 'Medical';
                            competitorTotal.ParticipatingO65Retirees__c = c5;
                            competitorTotal.ParticipatingPartTimeActives__c = c3;
                            competitorTotal.MembershipEstimate__c = c6;
                            competitorTotal.Type__c = 'Account Competitor';
                            competitorTotal.ParticipatingNonBargainedFullTimeAc__c = c1;
                            competitorTotal.ParticipatingBargainedFullTimeActive__c = c2;
                            competitorTotal.ParticipatingU65Retirees__c = c4;
                            competitorTotal.ParticipatingMembers__c = 0;
                            competitorTotal.ParticipatingActives__c = c7;
                            finalCompetitorList.add(competitorTotal);                                     
                        }
                        if(nationalExist == false && accType == 'cm'){
                            Competitor__c competitorNA = new Competitor__c();
                            competitorNA.Account__c = acc.Id;
                            competitorNA.CompetitorAccount__c = accRecord.Id;                           
                            competitorNA.Competitorclassification__c = 'Medical';
                            competitorNA.ParticipatingO65Retirees__c = 0;
                            competitorNA.ParticipatingPartTimeActives__c = 0;
                            competitorNA.MembershipEstimate__c = 0;
                            competitorNA.Type__c = 'Account Competitor';
                            competitorNA.ParticipatingNonBargainedFullTimeAc__c = 0;
                            competitorNA.ParticipatingBargainedFullTimeActive__c = 0;
                            competitorNA.ParticipatingU65Retirees__c = 0;
                            competitorNA.ParticipatingActives__c = 0;
                            finalCompetitorList.add(competitorNA);
                        }
                    }else{
                        if(accType == 'cm'){                            
                            Competitor__c competitorNA = new Competitor__c();
                            competitorNA.Account__c = acc.Id;
                            competitorNA.CompetitorAccount__c = accRecord.Id;                           
                            competitorNA.Competitorclassification__c = 'Medical';
                            competitorNA.ParticipatingO65Retirees__c = 0;
                            competitorNA.ParticipatingPartTimeActives__c = 0;
                            competitorNA.MembershipEstimate__c = 0;
                            competitorNA.Type__c = 'Account Competitor';
                            competitorNA.ParticipatingNonBargainedFullTimeAc__c = 0;
                            competitorNA.ParticipatingBargainedFullTimeActive__c = 0;
                            competitorNA.ParticipatingU65Retirees__c = 0;
                            competitorNA.ParticipatingActives__c = 0;
                            finalCompetitorList.add(competitorNA);
                        }
                        Competitor__c competitorTotal = new Competitor__c();
                        competitorTotal.Account__c = acc.Id;                        
                        competitorTotal.Name = 'Total';
                        competitorTotal.CompetitorAccount__c = accTotal.Id;
                        competitorTotal.Competitorclassification__c = 'Medical';
                        competitorTotal.ParticipatingO65Retirees__c = 0;
                        competitorTotal.ParticipatingPartTimeActives__c = 0;
                        competitorTotal.MembershipEstimate__c = 0;
                        competitorTotal.Type__c = 'Account Competitor';
                        competitorTotal.ParticipatingNonBargainedFullTimeAc__c = 0;
                        competitorTotal.ParticipatingBargainedFullTimeActive__c = 0;
                        competitorTotal.ParticipatingU65Retirees__c = 0;
                        competitorTotal.ParticipatingMembers__c = 0;
                        competitorTotal.ParticipatingActives__c = 0;
                        finalCompetitorList.add(competitorTotal); 
                    }
                }else {
                    throw new NoAccessException();
                }    
            }catch(Exception ex) {
                System.debug('Line Number' + ex.getLineNumber());  
                System.debug('Exception' + ex.getMessage());            
                throw new AuraHandledException(ex.getTypeName() +' Occured---> '+ex.getMessage());
            }         
            System.debug('End - execute()');   
        }   
        try{            
            System.debug('updateAccountList '+finalCompetitorList);
            List<Database.SaveResult> saveResults =  Database.insert(finalCompetitorList);
            for(Database.SaveResult saveResult : saveResults){
                if(!saveResult.isSuccess()) {
                    for(Database.Error err : saveResult.getErrors()) {                    
                        System.debug('Error Message - ' + err.getMessage()+' Id '+saveResult.getId());                    
                    }
                }
            }           
        }catch(Exception ex){
            System.debug('Error Line '+ex.getLineNumber());
            System.debug('Error Message '+ex.getMessage());
        }
    }  
    
    global void finish(Database.BatchableContext BC) {
        System.debug('Finish Competitor CD Total Batch');    
    }             
}