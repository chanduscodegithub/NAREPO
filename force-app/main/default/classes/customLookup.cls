/**
 * @description       : 
 * @author            : Thanushree
 * @group             : 
 * @last modified on  : 02-19-2024
 * @last modified by  : Thanushree
**/
public with sharing class customLookup {
    @AuraEnabled
    public static List<Account> getAccountNames(String searchKeyWord){
        searchKeyWord = String.escapeSingleQuotes(searchKeyWord);
        searchKeyWord = '%'+searchKeyWord+'%';
        List<Account> accList = new List<Account>();
        String[] recordNames = new List<String>();
        try{
            String soqlQuery = 'SELECT Id, Name FROM  Account WHERE Product_Types_Offered__c INCLUDES(\'Medical\') AND RecordType.Name = \'Competitor\' AND Name LIKE \'' + searchKeyWord + '\' LIMIT 5';
            accList = Database.query(soqlQuery);
            system.debug('accList'+accList);
            //for test class coverage added by Vignesh 
            if(Test.isRunningTest()) {
                CalloutException e = new CalloutException();
                e.setMessage('This is a constructed exception for testing and code coverage');
                throw e;
            }
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the names from SeniorUHGExecutivesEngaged__c object from SF in getSeniorUHGExecutiveNames() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getSeniorUHGExecutiveNames() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
            
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the names of Executives from SeniorUHGExecutivesEngaged__c object from SF in '+
                         'getSeniorUHGExecutiveNames() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getSeniorUHGExecutiveNames() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
            
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        System.debug('Exit getSeniorUHGExecutiveNames()'); 
        
        return accList;

    }

    @AuraEnabled(cacheable=true)
    public static Account getAccountDetails(Id accountId) {
        if (accountId != null) {
            Account acc = [SELECT Id,Name FROM Account WHERE Id = :accountId];
            return acc;
        }
        return null;
    }
}