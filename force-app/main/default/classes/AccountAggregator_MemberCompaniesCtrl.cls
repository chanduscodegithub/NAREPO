/****************************************************************** ***** 
Name: AccountAggregator_MemberCompaniesCtrl 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query all the Account related to particular account of type Agrregator.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Prashanth.R  	 	18/08/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/

public with sharing class AccountAggregator_MemberCompaniesCtrl {
    
    
    @AuraEnabled    
    public static AccountAggregator_MemberCompaniesInitialValues getAccountType(Id accountId){
        String accountType = null;
        AccountAggregator_MemberCompaniesInitialValues AccountAggregator_MemberCompaniesInitialResults = null;
        try{
            if(accountId != null){
                if(schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.BGH__C.isaccessible() && schema.sobjecttype.BGH__C.isQueryable()) {
                    AccountAggregator_MemberCompaniesInitialResults = new AccountAggregator_MemberCompaniesInitialValues();
                    Account accountCategory = [select Category__c,Subtype__c from Account where Id=:accountId];
                    if(accountCategory.Category__c == 'Aggregator' && accountCategory.Subtype__c =='Collaborative Ventures Group (CVG)'){
                        AccountAggregator_MemberCompaniesInitialResults.accountType = 'CVGAccount';
                    }else if(accountCategory.Category__c == 'Aggregator' && accountCategory.Subtype__c =='Business Group on Health (BGH)'){
                        AccountAggregator_MemberCompaniesInitialResults.accountType = 'BGHAccount';
                    }else{
                        AccountAggregator_MemberCompaniesInitialResults.accountType = 'CVGAccount';
                    }
                }else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured');
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountContacts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('You dont have permission to Create/View this record');
        }catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }
        System.debug('AccountAggregator_MemberCompaniesInitialResults'+AccountAggregator_MemberCompaniesInitialResults);
        return AccountAggregator_MemberCompaniesInitialResults;
    }
    
    
    
    
    /******************************************************************
* 
Purpose: Query all Accounts related to particular account of type Agreegator and  Subtype CVG Or BGH
Parameters: pageNumber, columnName, sortType
Returns: CVG_BGH_AccountResult(List of Accounts of type Agreegator and Subtype CVG Or BGH)
Throws [Exceptions]: [optional] 

*******************************************************************
*/ 
    @AuraEnabled    
    public static CVG_BGH_AccountResult getAccountAggregator_MemberCompanies(Id accountId,Decimal pageNumber,String columnName, String sortType){
        System.debug('Enter AccountAggregator_MemberCompaniesCtrl <getAccountAggregator_MemberCompanies()>'); 
        System.debug('Input Parameters'+'  '+'accountId--'+accountId+'pageNumber--'+pageNumber+'columnName--'+columnName+'sortType--'+sortType); 
        CVG_BGH_AccountResult CVG_BGH_AccResult = null;
        try{
            if(accountId != null && pageNumber!= null && columnName != null && sortType != null){
                
                UHGAccountConstants accountMemberCompaniesConstants = new UHGAccountConstants();
                UHGAccountSOQLConstants accountaccountMemberCompaniesSOQLConstants = new UHGAccountSOQLConstants();
                Integer pageSize = accountMemberCompaniesConstants.APPLET_PAGESIZE;
                //Integer pageSize = 2;
                CVG_BGH_AccResult = new CVG_BGH_AccountResult();
                Integer offset = ((Integer)pageNumber - 1) * pageSize;
                String Order = 'LAST';
                if(sortType == 'ASC'){
                    Order = 'FIRST';
                }
                if(schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable() && schema.sobjecttype.BGH__C.isaccessible() && schema.sobjecttype.BGH__C.isQueryable()) {
                    Account accountCategory = [select Category__c,Subtype__c from Account where Id=:accountId];
                    if(accountCategory.Category__c == 'Aggregator' && accountCategory.Subtype__c =='Collaborative Ventures Group (CVG)'){
                        CVG_BGH_AccResult.total = [SELECT count() FROM Account Where CVGAccount__c =:accountId];
                        if(pageNumber > 1 && (CVG_BGH_AccResult.total == (pageNumber-1) * pageSize)){
                            pageNumber--; 
                            offset = ((Integer)pageNumber - 1) * pageSize;
                        }
                        CVG_BGH_AccResult.CVG_AccountList = Database.query(accountaccountMemberCompaniesSOQLConstants.queryStringForAccountTypeCVG+columnName+' '+sortType+' NULLS '+Order+' '+accountaccountMemberCompaniesSOQLConstants.queryStringForAccountTypeCVG1);
                        
                        
                    }else if(accountCategory.Category__c == 'Aggregator' && accountCategory.Subtype__c =='Business Group on Health (BGH)'){
                        CVG_BGH_AccResult.total = [SELECT count() FROM BGH__c Where BGH_Account__c =:accountId];
                        if(pageNumber > 1 && (CVG_BGH_AccResult.total == (pageNumber-1) * pageSize)){
                            pageNumber--; 
                            offset = ((Integer)pageNumber - 1) * pageSize;
                        }
                        CVG_BGH_AccResult.BGH_AccountList = Database.query(accountaccountMemberCompaniesSOQLConstants.queryStringForAccountTypeBGH+columnName+' '+sortType+' NULLS '+Order+' '+accountaccountMemberCompaniesSOQLConstants.queryStringForAccountTypeBGH1); 
                        
                        
                    }else{
                        CVG_BGH_AccResult.total = [SELECT count() FROM Account Where Id =:accountId];
                        CVG_BGH_AccResult.CVG_AccountList = Database.query(accountaccountMemberCompaniesSOQLConstants.queryStringForAccountTypeCVG+columnName+' '+sortType+' NULLS '+Order+' '+accountaccountMemberCompaniesSOQLConstants.queryStringForAccountTypeCVG1);
                        if(pageNumber > 1 && CVG_BGH_AccResult.CVG_AccountList.size() == 0){
                            pageNumber--; 
                            offset = ((Integer)pageNumber - 1) * pageSize;
                            CVG_BGH_AccResult.CVG_AccountList = Database.query(accountaccountMemberCompaniesSOQLConstants.queryStringForAccountTypeCVG+columnName+' '+sortType+' NULLS '+Order+' '+accountaccountMemberCompaniesSOQLConstants.queryStringForAccountTypeCVG1);
                        }
                    }
                    CVG_BGH_AccResult.page = (Integer)pageNumber;
                    CVG_BGH_AccResult.pageSize = pageSize;
                    CVG_BGH_AccResult.accountType = accountCategory.Subtype__c;
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured'+nullPointerEx.getStackTraceString());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in getAccountContacts() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountContacts() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('You dont have permission to Create/View this record');
        } catch(QueryException queryExec){
            System.debug('Error(QueryException) occurred while querying the details of Conatct object from SF in '+
                         'getAccountContacts() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getAccountContacts() method, the Stack Trace is -> '
                         +queryExec.getStackTraceString());
            throw new AuraHandledException('Query Excetion Occured----'+queryExec.getMessage());
        }catch(Exception e) {
            System.debug('Error occurred in getAccountContacts() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Technical Exception Occured Please Contact Admin');
        }      
        System.debug('Exit CMAccounts <getAccountContacts()>');     
        return CVG_BGH_AccResult;        
    }
    
    public class CVG_BGH_AccountResult {
        
        @AuraEnabled
        public List<Account> CVG_AccountList { get;set; }
        
        @AuraEnabled
        public List<BGH__c> BGH_AccountList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public String accountType { get;set; }
        
    }
    
    public class AccountAggregator_MemberCompaniesInitialValues {
        
        @AuraEnabled
        public String accountType { get;set; }
        
    }
}