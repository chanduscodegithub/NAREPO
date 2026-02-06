/*********************************************************************** 
Name: Contact_Accounts_Class 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: 
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Abhishek Kumar  	 	16/10/2017  		INITIAL DEVELOPMENT   		  
2.0 -
**********************************************************************/

public without sharing class Contact_Accounts_Class {
    
    /******************************************************************** 
Purpose: 
Parameters: 
Returns: 
Throws [Exceptions]: 

*********************************************************************/ 
    
    @AuraEnabled
    public static contactAccountsResult queryRelatedAccounts(Id contactId, Decimal pageNumber, String columnName, String sortType){
        
        contactAccountsResult contactAccountsResult = null;
        
        UHGContactSOQLConstants contactSOQLConstants = new UHGContactSOQLConstants();
        UHGContactConstants contactConstants = new UHGContactConstants();
        
        try{
            if(contactId != null){
                Integer pageSize = contactConstants.APPLET_PAGESIZE;
                Integer offset = ((Integer)pageNumber - 1) * pageSize;
                
                System.debug('pagesize --'+pageSize+'---offset---'+offset);
                
                if(schema.sobjecttype.AccountContactRelation.isaccessible() && schema.sobjecttype.AccountContactRelation.isQueryable()) {
                    contactAccountsResult = new contactAccountsResult();
                    
                    String queryStatement = 'SELECT count() FROM AccountContactRelation WHERE ContactId = :contactId AND IsDirect=false AND Primary__c = true';
                    
                    Integer countPrimaryRecords = Database.countQuery(queryStatement);
                    
                    if((columnName.equalsIgnoreCase('Primary__c')) && (countPrimaryRecords == 0)){
                        columnName = 'Account.Name';
                        sortType = 'ASC';
                    }
                    
                    contactAccountsResult.total = Database.countQuery(contactSOQLConstants.queryForCount);
                    
                    System.debug('contactSOQLConstants.queryForCount--'+contactSOQLConstants.queryForCount+'---total--'+contactAccountsResult.total);
                    
                    contactAccountsResult.contactAccountRecords = Database.query(contactSOQLConstants.queryStringForRelatedAccounts1+columnName+' '+sortType+contactSOQLConstants.queryStringForRelatedAccounts2);
                    
                    System.debug('Query 2--'+contactSOQLConstants.queryStringForRelatedAccounts1+columnName+' '+sortType+contactSOQLConstants.queryStringForRelatedAccounts2);
                    System.debug('contactAccountsResult.contactAccountRecords---'+contactAccountsResult.contactAccountRecords);
                    
                    //contactAccountsResult.contactAccountRecords = Database.query('SELECT Account.Name, Primary__c FROM AccountContactRelation WHERE ContactId = :contactId  ORDER BY Primary__c DESC');        
                    contactAccountsResult.page = (Integer)pageNumber;
                    contactAccountsResult.pageSize = pageSize;
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
            
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the AccountContactRelation object from SF in queryRelatedAccounts() '+
                         'method -> '+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the AccountContactRelation object from SF in queryRelatedAccounts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in queryRelatedAccounts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
        }catch(QueryException queryExec){
            System.debug('Error(QueryException) occurred while querying the details of AccountContactRelation object from SF in '+
                         'queryRelatedAccounts() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in queryRelatedAccounts() method, the Stack Trace is -> '
                         +queryExec.getStackTraceString());
        }catch(Exception e){
            System.debug('Exception occured'+e.getMessage());
        } 
        
        return contactAccountsResult;
    }
    
    public class contactAccountsResult {
        
        @AuraEnabled
        public List<AccountContactRelation> contactAccountRecords{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
    }
    
}