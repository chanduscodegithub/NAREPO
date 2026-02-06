public without sharing class Account_CSIAdminSectionApex {
    
    @AuraEnabled
    public static Account getAccounts(ID accountId){
        
        Account acc = new Account(); 
        if(accountId !=null){
            acc = [SELECT Id, RMO_Address__c, Toll_Free_Number__c FROM Account WHERE ID =:accountId]; 
        }
        
        return acc;
    } 
    
    @AuraEnabled
    public static Account getUpdatedAccounts(Account acc, ID accountId){
        
        if(accountId != null){
            acc.Id = accountId;
        }
        if(acc != null){
            update acc;
        }
        
        return acc;
    }
}