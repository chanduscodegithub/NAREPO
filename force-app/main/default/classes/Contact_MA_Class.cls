/************************************************************************************************************ 
Name: Contact_MA_Class 
Copyright © 2018 CRMIT Solutions Company Inc.  
============================================================================================================   
============================================================================================================  
Purpose: Lightning component controller class to fetch Membership Activites for the Consultant.
============================================================================================================   
============================================================================================================   
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Abhishek Kumar  	 	12/02/2018  		INITIAL DEVELOPMENT   		  
2.0 -
*************************************************************************************************************/

public without sharing class Contact_MA_Class {
    
    @AuraEnabled
    public static contactMAResults queryRelatedMA(Id contactId, Decimal pageNumber, String columnName, String sortType){
        
        System.debug('Input Parameters -- contactId--'+contactId+' , pageNumber --'+pageNumber+ ', columnName--'+columnName+' , sortType--'+sortType);
        
        contactMAResults contactMAResults = null;
        
        UHGContactSOQLConstants contactSOQLConstants = new UHGContactSOQLConstants();
        UHGContactConstants contactConstants = new UHGContactConstants();
        
        try{
            if(contactId != null){
                Integer pageSize = contactConstants.APPLET_PAGESIZE;
                Integer offset = ((Integer)pageNumber - 1) * pageSize;
                
                if(schema.sobjecttype.OpportunityContactRole.isaccessible() && schema.sobjecttype.OpportunityContactRole.isQueryable()) {
                    contactMAResults = new contactMAResults();
                    
                    String queryStatement = 'SELECT count() FROM OpportunityContactRole WHERE ContactId = :contactId AND IsPrimary = true';
                    
                    Integer countPrimaryRecords = Database.countQuery(queryStatement);
                    
                    if((columnName.equalsIgnoreCase('IsPrimary')) && (countPrimaryRecords == 0)){
                        columnName = 'Opportunity.Name';
                        sortType = 'ASC';
                    }
                    
                    contactMAResults.total = Database.countQuery(contactSOQLConstants.queryForMACount);
                    
                    System.debug('contactSOQLConstants.queryForMACount--'+contactSOQLConstants.queryForMACount+'---total--'+contactMAResults.total);
                    system.debug('columnName@@@:'+columnName);
                    system.debug('sortType@@@:'+sortType);
					if(columnName=='IsPrimary'&& sortType=='DESC'){
						system.debug('counter 0');
						contactMAResults.contactMARecords = Database.query(contactSOQLConstants.queryStringForRelatedMA1+columnName+' '+sortType+' ,Opportunity.EffectiveDate__c DESC '+contactSOQLConstants.queryStringForRelatedMA2);
					}else if(columnName=='IsPrimary'&& sortType=='ASC'){
					
						system.debug('counter else if');
						contactMAResults.contactMARecords = Database.query(contactSOQLConstants.queryStringForRelatedMA1+columnName+' '+sortType+' ,Opportunity.EffectiveDate__c ASC '+contactSOQLConstants.queryStringForRelatedMA2);
						
					}else{
						system.debug('counter else ');
						contactMAResults.contactMARecords = Database.query(contactSOQLConstants.queryStringForRelatedMA1+columnName+' '+sortType+contactSOQLConstants.queryStringForRelatedMA2);
					}
                    
                    
                    System.debug('Query 2--'+contactSOQLConstants.queryStringForRelatedMA1+columnName+' '+sortType+contactSOQLConstants.queryStringForRelatedMA2);
                    System.debug('contactMAResults.contactMARecords---'+contactMAResults.contactMARecords);
                    
                    contactMAResults.page = (Integer)pageNumber;
                    contactMAResults.pageSize = pageSize;
                }else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
            
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the OpportunityContactRole object from SF in queryRelatedMA() '+
                         'method -> '+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the OpportunityContactRole object from SF in queryRelatedMA() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in queryRelatedMA() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
        }catch(QueryException queryExec){
            System.debug('Error(QueryException) occurred while querying the details of OpportunityContactRole object from SF in '+
                         'queryRelatedMA() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in queryRelatedMA() method, the Stack Trace is -> '
                         +queryExec.getStackTraceString());
        }catch(Exception e){
            System.debug('Exception occured'+e.getMessage());
        } 
        
        System.debug('Output Parameters-- contactMAResults.contactMARecords---'+contactMAResults.contactMARecords);
        
        return contactMAResults;
    }
    
    public class contactMAResults {
        
        @AuraEnabled
        public List<OpportunityContactRole> contactMARecords{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
    }
    
    
}