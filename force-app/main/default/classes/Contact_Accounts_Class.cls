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
        //Changes on 25/11/24
        list<ClientSurveyResults__c> CSRList=new list<ClientSurveyResults__c>();
        List<AccountContactRelation> contactAccountRecords =new List<AccountContactRelation>();
        set<string> accountIdList =new set<string>();
        
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
                    /* Added as part of CR on 08th Oct 2024 */
                    contactAccountsResult.existingClientTotal = Database.countQuery(contactSOQLConstants.queryForExistingClientCount);
                    /* End of CR Modification */
                    /* Added by Vignesh*/
                    contactAccountsResult.allProspect = Database.countQuery(contactSOQLConstants.queryForAllProspectCount);
                    contactAccountsResult.allCompaniesCount = Database.countQuery(contactSOQLConstants.queryForAllCompaniesCount);
                    
                    list<ClientSurveyResults__c> CSR =  Database.query(contactSOQLConstants.queryForClientSurveyYear);
                    contactAccountsResult.yearValue =CSR[0].year__c;
                    contactAccountRecords =Database.query(contactSOQLConstants.queryStringForRelatedAccounts1+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType)+contactSOQLConstants.queryStringForRelatedAccounts2);
                    contactAccountsResult.contactAccountRecords = contactAccountRecords;//Database.query(contactSOQLConstants.queryStringForRelatedAccounts1+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType)+contactSOQLConstants.queryStringForRelatedAccounts2);
                    for(AccountContactRelation ac:contactAccountRecords){
                        accountIdList.add(ac.AccountId);
                    }
                    CSRList =[SELECT Id, Name, LikelihoodtoRecommendScore__c, Account__r.Name,Account__c,year__c FROM ClientSurveyResults__c where Account__c IN:accountIdList and year__c=:CSR[0].Year__c and type__c='Client Survey Results'];//Database.query(contactSOQLConstants.queryLRTValues); 
                    contactAccountsResult.CSRList =CSRList;
                    /* End*/
                    //contactAccountsResult.contactAccountRecords = Database.query(contactSOQLConstants.queryStringForRelatedAccounts1+String.escapeSingleQuotes(columnName)+' '+String.escapeSingleQuotes(sortType)+contactSOQLConstants.queryStringForRelatedAccounts2);
                    
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
        
        /* Added as part of CR on 08th Oct 2024 */
        @AuraEnabled
        public Integer existingClientTotal { get;set; }
        /* End of CR Modification */
        
         /* Added by Vignesh*/
        @AuraEnabled
        public Integer allProspect { get;set; }
        
         @AuraEnabled
        public Integer allCompaniesCount { get;set; }
        
         @AuraEnabled
        public string yearValue { get;set; }
        
         @AuraEnabled
        public Integer allLRTValues { get;set; }
        
         @AuraEnabled
        public List<ClientSurveyResults__c> CSRList{ get;set; }

        /* End */
        
    }
    
}