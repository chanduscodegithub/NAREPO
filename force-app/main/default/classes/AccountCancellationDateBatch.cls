global class AccountCancellationDateBatch implements Database.Batchable<sObject>, Database.Stateful{
    
    global Integer accCount {get;set;}        
    
    global Database.QueryLocator start(Database.BatchableContext BC) {        
        accCount = 0;
        String query = 'SELECT Id,CancelledCustomer__c,Previous_Customer__c,Cancellation_Date__c,LastModifiedDate FROM Account where (Previous_Customer__c = true and CancelledCustomer__c = false and Cancellation_Date__c =  NEXT_N_DAYS:730) or (Previous_Customer__c = true and CancelledCustomer__c = true and Cancellation_Date__c != NEXT_N_DAYS:730)';
        
        return Database.getQueryLocator(query);
        
    }
    global void execute(Database.BatchableContext BC,List<sObject> sObjectList) {        
		List<Account> accList = (List<Account>)sObjectList;      
        List<Account> accUpdateList = new List<Account>();        
        Date today = Date.today();
        for(Account acc : accList){
            Date cancellationDate = acc.Cancellation_Date__c; 
            boolean cancelledCustomer = acc.CancelledCustomer__c;
            if(cancellationDate != null &&  today <= cancellationDate){
             	Integer diffDays = Date.today().daysBetween(cancellationDate); 
                if(diffDays < 730 && !cancelledCustomer){
                    acc.CancelledCustomer__c = true;
                    accUpdateList.add(acc);
                }else if(cancelledCustomer && diffDays > 730){
                    acc.CancelledCustomer__c = false;
                    accUpdateList.add(acc);
                }
            }else if(cancelledCustomer){
                acc.CancelledCustomer__c = false;
                accUpdateList.add(acc);
            }            
        }
        accCount += accUpdateList.size();
        Database.update(accUpdateList,false);
    }  
    
    global void finish(Database.BatchableContext BC) {        
        System.debug('Total Number of Accounts Updated : '+accCount);
        System.debug('Finish');		
    }         
}