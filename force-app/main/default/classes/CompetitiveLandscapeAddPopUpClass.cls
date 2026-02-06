/****************************************************************** ***** 
Name: CompetitiveLandscapeAddPopUpClass 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: 
====================================================== 
======================================================  
History 
 ------- 
	VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
	1.0 -   	 Jnanesh Avaradi  	 	03/08/2017  		INITIAL DEVELOPMENT   		  
	2.0 -
*********************************************************************
*/

public with sharing class CompetitiveLandscapeAddPopUpClass {
    
    /******************************************************************
    * 
     Purpose: The below method returns the List of Accounts of type Competitors.
     Parameters: category,searchKey,pageNumber
     Returns: competitorsList
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */ 
    @AuraEnabled
    public static competitorsList getAccountCompetitors(String category,String searchKey,Decimal pageNumber,Boolean isMedical) {
        
        System.debug('getAccountCompetitors(String category,String searchKey,Decimal pageNumber) - START');
        
        System.debug('Input Parameters-> Category-'+category+', SearchKey'+searchKey+', PageNumber-'+pageNumber+' Boolean isMedical '+isMedical);
            
        competitorsList compititorsAccountList = new competitorsList();
        
        try { 
            
            UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
            UHGAccountSOQLConstants uhgAccountSOQLConstants = new UHGAccountSOQLConstants();
            
            Boolean topCompetitors = false;
            Boolean theBlues = false;
            Boolean exchannge = false;
            String categoryItag = '';
            
            if(category == 'Top Competitors'){
               topCompetitors = true;
               categoryItag = 'AND Top_Competitor__c = true';
            } else if(category == 'The Blues and their Affiliates') {
               theBlues = true;
               categoryItag = 'AND The_Blues_and_their_Affiliates__c = true';
            } else if(category == 'Exchange Competitors') {
               exchannge = true;
               categoryItag = 'AND Exchange_Competitors__c = true';
            } else if(category == 'All Other Competitors') {
               categoryItag = 'AND Exchange_Competitors__c = false AND The_Blues_and_their_Affiliates__c = false AND Top_Competitor__c = false';
            }            
            
            String AccountType = uhgAccountConstants.ACCOUNT_TYPE;
            String nationalAccounts = uhgAccountConstants.NATIONAL_ACCOUNTS_RECORD;
            String competitorStatus = uhgAccountConstants.COMPETITOR_STATUS;
            Integer pageSize = uhgAccountConstants.POPUP_PAGESIZE;
            Boolean draftRecord = false;
            Boolean deleteRecord = false;
                        
            Integer offset = ((Integer)pageNumber - 1) * pageSize; 
            String searchKeyString = '';
            String UHC_OPTUM_RECORD = 'UHC-Optum';
            String OPTUM_RX = 'Optum Rx';
            String TOTAL = 'Total';
            searchKey = searchKey.trim();
            if(searchKey != null && searchKey.length() > 0) {
            	searchKeyString = 'AND Name LIKE \'%' + searchKey + '%\'';
                categoryItag = '';
            }
            
            if(schema.sobjecttype.Account.isaccessible() && schema.sobjecttype.Account.isQueryable()) {
                if(isMedical){
                    compititorsAccountList.total =  Database.countQuery(uhgAccountSOQLConstants.QUERY_COUNT_STRING_ACCOUNT_COMPETITORS + categoryItag + uhgAccountSOQLConstants.QUERY_COUNT_STRING_ACCOUNT_COMPETITORS1 + searchKeyString +' '+ uhgAccountSOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS3);
                    compititorsAccountList.competitorList =  Database.query(uhgAccountSOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS + categoryItag + uhgAccountSOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS1 + searchKeyString + uhgAccountSOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS3 +' '+ uhgAccountSOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS2);
                }else{
                    compititorsAccountList.total =  Database.countQuery(uhgAccountSOQLConstants.QUERY_COUNT_STRING_ACCOUNT_COMPETITORS + categoryItag + uhgAccountSOQLConstants.QUERY_COUNT_STRING_ACCOUNT_COMPETITORS1 + searchKeyString);
                	compititorsAccountList.competitorList =  Database.query(uhgAccountSOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS + categoryItag + uhgAccountSOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS1 + searchKeyString + uhgAccountSOQLConstants.QUERY_STRING_ACCOUNT_COMPETITORS2);
                }               	
                compititorsAccountList.page = (Integer)pageNumber;
                compititorsAccountList.pageSize = pageSize;
            } else {
                throw new NoAccessException();
            }
            
        } catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Account object from SF in getAccountCompetitors() method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception occurred ---- '+nullPointerEx.getMessage());
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Account object from SF in getAccountCompetitors() method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getAccountCompetitors() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception occurred ---- '+noaccessExec.getMessage());
        } catch(QueryException queryExec){
            System.debug('Error(QueryException) occurred while querying the details of Account object from SF in '+
                         'getAccountCompetitors() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getAccountCompetitors() method, the Stack Trace is -> '+queryExec.getStackTraceString());
            throw new AuraHandledException('Query Exception occurred ---- '+queryExec.getMessage());
        } catch(Exception e) {
            System.debug('Error occurred in getAccountCompetitors() method while querying the details of Accounts from SF -> ' + e.getMessage());
            throw new AuraHandledException('Exception occurred ---- '+e.getMessage());
        }
        
        System.debug('Output Parameters-> Account Competitors List-'+compititorsAccountList); 
        
        System.debug('getAccountCompetitors(String category,String searchKey,Decimal pageNumber) - END');
        
        return compititorsAccountList;        
    }
    
    
   /******************************************************************
    * 
    Purpose: This method adds the AccountCompetitors as the Medical Competitors & associates to SF Account.
    Parameters: currentAccountId, competitorsList
    Returns: 
    Throws [Exceptions]: [optional] 
    
    *******************************************************************
    */ 
    @AuraEnabled    
    public static void addCompititorsToAccount(Id currentAccountId,List<Account> competitorsList){
       
        System.debug('addCompititorsToAccount(Id currentAccountId,List<Account> competitorsList) - START');
        
        System.debug('Input Parameters -> AccountId-'+currentAccountId+', CompetitorsList-'+competitorsList);
        
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        
        try {
            
            if(currentAccountId != null) {
                
                if(schema.sobjecttype.Competitor__c.isaccessible() && schema.sobjecttype.Competitor__c.isCreateable()) {
                    
                    List<Competitor__c> competitorsListToInsert = new List<Competitor__c>();
                    
                    for(Account accCompetitor : competitorsList) { 
                        
                        Competitor__c competitor = new Competitor__c();
                        competitor.Account__c = currentAccountId;
                        competitor.CompetitorAccount__c = accCompetitor.Id;
                        competitor.Competitorclassification__c = uhgAccountConstants.COMPETITOR_CLASIFICATION_MEDICAL;
                        //competitor.Name = accCompetitor.Name;
                        competitor.ParticipatingO65Retirees__c = 0;
                        competitor.ParticipatingPartTimeActives__c = 0;
                        competitor.MembershipEstimate__c = 0;
                        competitor.Type__c = uhgAccountConstants.COMPETITOR_TYPE;
                        competitor.ParticipatingNonBargainedFullTimeAc__c = 0;
                        competitor.ParticipatingBargainedFullTimeActive__c = 0;
                        competitor.ParticipatingU65Retirees__c = 0;
                        competitor.ParticipatingActives__c = 0;
                        competitorsListToInsert.add(competitor); 
                    } 
                    
                    insert competitorsListToInsert; 
                    
                } else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to insert the data into Competitor__c object in SF in addCompititorsToAccount() '+
                         'method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception occurred ---- '+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to insert the data into Competitor__c object in SF in addCompititorsToAccount() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in addCompititorsToAccount() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception occurred ---- '+noaccessExec.getMessage());
        } catch(Exception e) {
            System.debug('Error occurred in addCompititorsToAccount() method while inserting the records to '+
                         'Competitor__c -> ' + e.getMessage());
            throw new AuraHandledException('Exception occurred ---- '+e.getMessage());
        }      
        
        System.debug('addCompititorsToAccount(Id currentAccountId,List<Account> competitorsList) - END');
    }
    
    
   /******************************************************************
    * 
    Purpose: This method inserts the selected Account Competitors as the Pharmacy, Dental, Vision, Others Competitors associated to this Account.
    Parameters: currentAccountId, allPharmacySpecialtyOtherscompetitorsList
    Returns: 
    Throws [Exceptions]: [optional] 
    
    *******************************************************************
    */ 
    @AuraEnabled    
    public static void addPharmacySpecialtyOtherCompetitorsToAccount(Id currentAccountId, 
                                                     List<Competitor__c> allPharmacySpecialtyOtherscompetitorsList) {
       
        System.debug('addPharmacySpecialtyOtherCompetitorsToAccount(Id currentAccountId, '+
                     	'List<Competitor__c> allPharmacySpecialtyOtherscompetitorsList) - START');
        
        System.debug('Input Parameters -> AccountId-'+currentAccountId+', All Records List->'+allPharmacySpecialtyOtherscompetitorsList);
        
        List<Competitor__c> competitorsListToInsert = new List<Competitor__c>();
        
        try{
            if(currentAccountId != null){
                if(schema.sobjecttype.Competitor__c.isaccessible() && schema.sobjecttype.Competitor__c.isCreateable()) {
                    
                    if(allPharmacySpecialtyOtherscompetitorsList != null && allPharmacySpecialtyOtherscompetitorsList.size() > 0) {
                    	Database.SaveResult[] dbResult = Database.insert(allPharmacySpecialtyOtherscompetitorsList, false);
                        for(Database.SaveResult cmUpdtResult : dbResult) {
                            if(!cmUpdtResult.isSuccess()) {
                                // Operation failed, so get all errors                
                                for(Database.Error err : cmUpdtResult.getErrors()) {
                                    System.debug('The following error has occurred.');                    
                                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                    System.debug('Fields that affected this error: ' + err.getFields());
                                }
                            }
                        }
                    }
                                                           
                } else {
                    throw new NoAccessException();
                }
            } else{
                throw new NullPointerException();
            }
        }catch(NullPointerException nullPointerEx) {
            System.debug('No associated AccountId to insert the data into the Competitor__c object in '+
                         		'addPharmacySpecialtyOtherCompetitorsToAccount() method -> '+nullPointerEx.getMessage());
            throw new AuraHandledException('Null Pointer Exception occurred ---- '+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to insert the data into the Competitor__c object from SF in '+
                         		'addPharmacySpecialtyOtherCompetitorsToAccount() method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in addPharmacySpecialtyOtherCompetitorsToAccount() method, the Line Number is -> '+
                         	noaccessExec.getLineNumber()+'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception occurred ---- '+noaccessExec.getMessage());
        } catch(Exception e) {
            System.debug('Error occurred in addPharmacySpecialtyOtherCompetitorsToAccount() method while inserting the records to '+
                         	'Competitor__c object in SF -> ' + e.getMessage());
            throw new AuraHandledException('Exception occurred ---- '+e.getMessage());
        }      
        
        System.debug('addPharmacySpecialtyOtherCompetitorsToAccount(Id currentAccountId, '+
                     	'List<Competitor__c> allPharmacySpecialtyOtherscompetitorsList) - END');       	               
    }
    
    /*
     * Wrapper class to display Users 
     */
   
    public class competitorsList {
        
    @AuraEnabled
    public List<Account> competitorList{ get;set; }
    
    @AuraEnabled
    public Integer pageSize { get;set; }
    
    @AuraEnabled
    public Integer page { get;set; }
    
     @AuraEnabled
    public Integer total { get;set; }
        
    } 
}