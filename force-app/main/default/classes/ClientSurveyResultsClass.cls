/****************************************************************** ***** 
Name: ClientSurveyResultsClass 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Client Survey Results will be queried last 4 years data from Custom object of the corresponding Account for the Client Survey Results Custom Lightning Component.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Jnanesh Avaradi  	 	018/07/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/

public with sharing class ClientSurveyResultsClass {
    
    public class ClientSurveyResultsWrapper implements Comparable {
        
        public ClientSurveyResults__c oppy;
        
        // Constructor
        public ClientSurveyResultsWrapper(ClientSurveyResults__c op) {
            system.debug('INside Con..');
            oppy = op;
        }
        
        // Compare opportunities based on the opportunity amount.
        public Integer compareTo(Object compareTo) {
            // Cast argument to OpportunityWrapper
            ClientSurveyResultsWrapper compareToOppy = (ClientSurveyResultsWrapper)compareTo;
            
            // The return value of 0 indicates that both elements are equal.
            Integer returnValue = 0;
            system.debug('Inside Compare '+oppy.Year__c+' > '+compareToOppy.oppy.Year__c +' : '+ Integer.valueOf(oppy.Year__c) +' : ' +Integer.valueOf(compareToOppy.oppy.Year__c));
            if (Integer.valueOf(oppy.Year__c) > Integer.valueOf(compareToOppy.oppy.Year__c)) {
                // Set return value to a positive value.
                returnValue = -1;
            } else if (Integer.valueOf(oppy.Year__c) < Integer.valueOf(compareToOppy.oppy.Year__c)) {
                // Set return value to a negative value.
                returnValue = 1;
            }
            
            return returnValue;       
        }
    }
    
    
    /******************************************************************
* 
Purpose: Client Survey Results will be queried last 4 years data from Custom object of the corresponding Account for the Client Survey Results Custom Lightning Component.
Parameters: AccountId
Returns: csrReturnMap
Throws [Exceptions]: [optional] 

*******************************************************************
*/ 
    @AuraEnabled
    public static  Map<String,Object> getClientSurveyRecords(Id AccountId){
        Map<String,Object> csrReturnMap = null;
        String meritId = '';
        try{
            if(AccountId != null){                
                UHGAccountConstants clientSurveyResultsConstants = new UHGAccountConstants();
                UHGAccountSOQLConstants crsSOQLConstants = new UHGAccountSOQLConstants();
                String csrType = clientSurveyResultsConstants.CLIENT_SURVEY_RESULTS_TYPE;
                csrReturnMap = new Map<String,Object>();
                //String [] arrayOfYears = getLastFourYears();
                if(schema.sobjecttype.ClientSurveyResults__c.isaccessible() && schema.sobjecttype.ClientSurveyResults__c.isQueryable()) {
                    Account accObj = [SELECT Id,Category__c,Merit_Row_Id__c from Account where Id= :AccountId WITH USER_MODE];
                    String accType = '';
                    if(accObj != null){
                        accType = accObj.Category__c;
                        meritId = accObj.Merit_Row_Id__c;
                    }
                    List<ClientSurveyResults__c> csrList1;                   
                    List<ClientSurveyResults__c> csrList = new List<ClientSurveyResults__c>();
                    List<ClientSurveyResultsWrapper> csrList2 = new List<ClientSurveyResultsWrapper>();
                    String [] isYearAdded = new List<String>();
                    csrList1 = [SELECT Id, Name,LikelihoodtoRecommendScore__c,NetPromoterType__c,OverallSatisfactionScore__c,Year__c,Surest_Likelihood_to_Recommend_Score__c,Surest_Net_Promoter_Type__c FROM ClientSurveyResults__c WHERE Account__c = :AccountId AND Type__c = :csrType AND Year__c != null WITH USER_MODE ORDER BY Year__c DESC,LastModifiedDate DESC];
                    for(ClientSurveyResults__c csr : csrList1)
                    {
                        system.debug('isYearAdded : '+isYearAdded.contains(csr.Year__c));
                        if(!isYearAdded.contains(csr.Year__c) && csrList2.size() < 4){
                            isYearAdded.add(String.valueOf(csr.Year__c));                              
                            csrList2.add(new ClientSurveyResultsWrapper(csr));                                
                        }                                                  
                    }
                    csrList2.sort(); 
                    System.debug('After Sort List : '+csrList2);
                    for(ClientSurveyResultsWrapper csr : csrList2)
                    {                                                    
                        csrList.add(csr.oppy);								                                                                             
                    } 
                    /*if(accType == 'Client Development'){
csrList1 = [SELECT Id, Name,LikelihoodtoRecommendScore__c,NetPromoterType__c,OverallSatisfactionScore__c,NetPromoterScore__c,Year__c FROM ClientSurveyResults__c WHERE Account__c = :AccountId AND Type__c = :csrType AND Year__c != null ORDER BY Year__c DESC,LastModifiedDate DESC];
for(ClientSurveyResults__c csr : csrList1)
{
system.debug('isYearAdded : '+isYearAdded.contains(csr.Year__c));
if(!isYearAdded.contains(csr.Year__c) && csrList2.size() < 4){
isYearAdded.add(String.valueOf(csr.Year__c));                              
csrList2.add(new ClientSurveyResultsWrapper(csr));                                
}                                                  
}
csrList2.sort(); 
System.debug('After Sort List : '+csrList2);
for(ClientSurveyResultsWrapper csr : csrList2)
{                                                    
csrList.add(csr.oppy);								                                                                             
}                       
}else{
csrList1 = [SELECT Id, Name,LikelihoodtoRecommendScore__c,NetPromoterType__c,OverallSatisfactionScore__c,NetPromoterScore__c,Year__c FROM ClientSurveyResults__c WHERE Account__c = :AccountId AND Type__c = :csrType AND (Year__c = :arrayOfYears[0] OR Year__c = :arrayOfYears[1] OR Year__c = :arrayOfYears[2] OR Year__c = :arrayOfYears[3]) ORDER BY Year__c DESC,LastModifiedDate DESC];
for(ClientSurveyResults__c csr : csrList1)
{
system.debug('isYearAdded : '+isYearAdded.contains(csr.Year__c));
if(!isYearAdded.contains(csr.Year__c)){
isYearAdded.add(String.valueOf(csr.Year__c));
csrList.add(csr);                                
}                            
}
}*/        	           
                    System.debug('Query List : '+csrList);
                    List<String []> csrReturnList = new LIST<String []>();
                    String [] csrLikelyHood = new List<String>(); 
                    String [] csrSurestLikelyHood = new List<String>(); 
                    String [] csrSurestNetPromoter = new List<String>(); 
                    csrLikelyHood.add(Label.Likelihood_To_Recommend_Score);  
                    csrSurestLikelyHood.add(Label.Surest_Likelihood_To_Recommend_Score);  
                    csrSurestNetPromoter.add(Label.Surest_Net_Promoter_Type);  
                    //String [] csrOverAllSatisfaction = new List<String>(); 
                    //csrOverAllSatisfaction.add(Label.Overall_Satisfaction_Score);
                    String [] csrNetPromoter = new List<String>(); 
                    csrNetPromoter.add(Label.Net_Promoter_Type);
                    /* String [] csrNetPromoterScore = new List<String>(); 
csrNetPromoterScore.add(Label.Net_Promoter_Score);*/
                    
                    
                    set<string> availableYears = new set<string>();                                  
                    
                    for(ClientSurveyResults__c csr : csrList)
                    {
                        availableYears.add(String.valueOf(csr.Year__c));
                    }
                    String [] arrayOfYears = new List<String>();
                    for(ClientSurveyResults__c csr : csrList)
                    {
                        arrayOfYears.add(String.valueOf(csr.Year__c));
                    }
                    if(arrayOfYears.size() < 4){
                        while(arrayOfYears.size() < 4){
                            arrayOfYears.add('');
                        }
                    }
                    /*if(accType == 'Client Development'){
String [] arrayOfYears = new List<String>();
for(ClientSurveyResults__c csr : csrList)
{
arrayOfYears.add(String.valueOf(csr.Year__c));
}
if(arrayOfYears.size() < 4){
while(arrayOfYears.size() < 4){
arrayOfYears.add('');
}
}
}*/
                    Integer j = (availableYears.size()-1);
                    for(Integer i = (arrayOfYears.size()-1); i>=0; i--)
                    {                       
                        if(availableYears.contains(arrayOfYears[i])){                                                     
                            ClientSurveyResults__c csr1 = csrList[j];
                            if(csr1.LikelihoodtoRecommendScore__c != null){
                                csrLikelyHood.add(String.valueOf(csr1.LikelihoodtoRecommendScore__c));
                            }else{
                                csrLikelyHood.add('');
                            }
                            /*  if(csr1.OverallSatisfactionScore__c != null){
csrOverAllSatisfaction.add(String.valueOf(csr1.OverallSatisfactionScore__c));
}else{
csrOverAllSatisfaction.add('');
}*/
                            if(csr1.NetPromoterType__c != null){
                                csrNetPromoter.add(csr1.NetPromoterType__c);
                            }else{
                                csrNetPromoter.add('');
                            }   
                            
                            if(csr1.Surest_Likelihood_to_Recommend_Score__c != null){
                                csrSurestLikelyHood.add(csr1.Surest_Likelihood_to_Recommend_Score__c);
                            }else{
                                csrSurestLikelyHood.add('');
                            }   
                            
                            if(csr1.Surest_Net_Promoter_Type__c != null){
                                csrSurestNetPromoter.add(csr1.Surest_Net_Promoter_Type__c);
                            }else{
                                csrSurestNetPromoter.add('');
                            }   
                            /*String netPromoterScore = String.valueOf(csr1.NetPromoterScore__c);
if(netPromoterScore != null && netPromoterScore.length() > 0){
netPromoterScore = netPromoterScore + clientSurveyResultsConstants.PERCENTAGE_SYMBOL;
csrNetPromoterScore.add(netPromoterScore);
}else{
csrNetPromoterScore.add('');
} */                         
                            j--;
                        }else{
                            csrLikelyHood.add('');
                            // csrOverAllSatisfaction.add('');
                            csrNetPromoter.add('');
                            csrSurestLikelyHood.add('');
                            csrSurestNetPromoter.add('');
                            // csrNetPromoterScore.add('');
                        }
                    }                
                    csrReturnList.add(csrLikelyHood);
                    // csrReturnList.add(csrOverAllSatisfaction);
                    csrReturnList.add(csrNetPromoter);
                    csrReturnList.add(csrSurestLikelyHood);
                    csrReturnList.add(csrSurestNetPromoter);
                    // csrReturnList.add(csrNetPromoterScore);
                    
                    csrReturnMap.put('LastFourYears', arrayOfYears);
                    csrReturnMap.put('CSRFinalList', csrReturnList);
                    csrReturnMap.put('MeritId', meritId);
                    csrReturnMap.put('AccountType', accType);
                }else {
                    throw new NoAccessException();
                }           
            } else{
                throw new NullPointerException();
            }
            
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Contact object from SF in getClientSurveyRecords() '+
                         'method -> '+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in getClientSurveyRecords() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getClientSurveyRecords() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
        }catch(Exception e) {
            System.debug('Error occurred in getClientSurveyRecords() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
        }      
        System.debug('Exit CMAccounts <getClientSurveyRecords()>');     
        return csrReturnMap;        
    } 
    
    @AuraEnabled
    public static  Map<String,Object> getClientSurveySurestRecords(Id AccountId){
        Map<String,Object> csrReturnMap = null;
        String meritId = '';
        try{
            if(AccountId != null){                
                UHGAccountConstants clientSurveyResultsConstants = new UHGAccountConstants();
                UHGAccountSOQLConstants crsSOQLConstants = new UHGAccountSOQLConstants();
                String csrType = clientSurveyResultsConstants.CLIENT_SURVEY_RESULTS_TYPE_SUREST;
                csrReturnMap = new Map<String,Object>();
                //String [] arrayOfYears = getLastFourYears();
                if(schema.sobjecttype.ClientSurveyResults__c.isaccessible() && schema.sobjecttype.ClientSurveyResults__c.isQueryable()) {
                    Account accObj = [SELECT Id,Category__c,Merit_Row_Id__c from Account where Id= :AccountId WITH USER_MODE];
                    String accType = '';
                    if(accObj != null){
                        accType = accObj.Category__c;
                        meritId = accObj.Merit_Row_Id__c;
                    }
                    List<ClientSurveyResults__c> csrList1;                   
                    List<ClientSurveyResults__c> csrList = new List<ClientSurveyResults__c>();
                    List<ClientSurveyResultsWrapper> csrList2 = new List<ClientSurveyResultsWrapper>();
                    String [] isYearAdded = new List<String>();
                    csrList1 = [SELECT Id, Name,LikelihoodtoRecommendScore__c,NetPromoterType__c,OverallSatisfactionScore__c,Year__c,Surest_Net_Promoter_Type__c,Surest_Likelihood_to_Recommend_Score__c FROM ClientSurveyResults__c WHERE Account__c = :AccountId AND Type__c = :csrType AND Year__c != null WITH USER_MODE ORDER BY Year__c DESC,LastModifiedDate DESC];
                    for(ClientSurveyResults__c csr : csrList1)
                    {
                        system.debug('isYearAdded : '+isYearAdded.contains(csr.Year__c));
                        if(!isYearAdded.contains(csr.Year__c) && csrList2.size() < 4){
                            isYearAdded.add(String.valueOf(csr.Year__c));                              
                            csrList2.add(new ClientSurveyResultsWrapper(csr));                                
                        }                                                  
                    }
                    csrList2.sort(); 
                    System.debug('After Sort List : '+csrList2);
                    for(ClientSurveyResultsWrapper csr : csrList2)
                    {                                                    
                        csrList.add(csr.oppy);								                                                                             
                    } 
                    
                    System.debug('Query List : '+csrList);
                    List<String []> csrReturnList = new LIST<String []>();
                    String [] csrLikelyHood = new List<String>(); 
                    csrLikelyHood.add(Label.Likelihood_To_Recommend_Score);       
                    String [] csrNetPromoter = new List<String>(); 
                    csrNetPromoter.add(Label.Net_Promoter_Type);
                    
                    String [] csrSurestLikelyHood = new List<String>(); 
                    String [] csrSurestNetPromoter = new List<String>(); 
                    csrSurestLikelyHood.add(Label.Surest_Likelihood_To_Recommend_Score);  
                    csrSurestNetPromoter.add(Label.Surest_Net_Promoter_Type);  
                    
                    set<string> availableYears = new set<string>();                                  
                    
                    for(ClientSurveyResults__c csr : csrList)
                    {
                        availableYears.add(String.valueOf(csr.Year__c));
                    }
                    String [] arrayOfYears = new List<String>();
                    for(ClientSurveyResults__c csr : csrList)
                    {
                        arrayOfYears.add(String.valueOf(csr.Year__c));
                    }
                    if(arrayOfYears.size() < 4){
                        while(arrayOfYears.size() < 4){
                            arrayOfYears.add('');
                        }
                    }
                    Integer j = (availableYears.size()-1);
                    for(Integer i = (arrayOfYears.size()-1); i>=0; i--)
                    {                       
                        if(availableYears.contains(arrayOfYears[i])){                                                     
                            ClientSurveyResults__c csr1 = csrList[j];
                            if(csr1.LikelihoodtoRecommendScore__c != null){
                                csrLikelyHood.add(String.valueOf(csr1.LikelihoodtoRecommendScore__c));
                            }else{
                                csrLikelyHood.add('');
                            }
                            if(csr1.NetPromoterType__c != null){
                                csrNetPromoter.add(csr1.NetPromoterType__c);
                            }else{
                                csrNetPromoter.add('');
                            } 
                            
                            if(csr1.Surest_Likelihood_to_Recommend_Score__c != null){
                                csrSurestLikelyHood.add(csr1.Surest_Likelihood_to_Recommend_Score__c);
                            }else{
                                csrSurestLikelyHood.add('');
                            }   
                            
                            if(csr1.Surest_Net_Promoter_Type__c != null){
                                csrSurestNetPromoter.add(csr1.Surest_Net_Promoter_Type__c);
                            }else{
                                csrSurestNetPromoter.add('');
                            }   
                            
                            j--;
                        }else{
                            csrLikelyHood.add('');
                            csrSurestLikelyHood.add('');
                            // csrOverAllSatisfaction.add('');
                            csrNetPromoter.add('');
                            csrSurestNetPromoter.add('');
                            // csrNetPromoterScore.add('');
                        }
                    }                
                    csrReturnList.add(csrLikelyHood);
                    csrReturnList.add(csrSurestLikelyHood);
                    csrReturnList.add(csrSurestNetPromoter);
                    // csrReturnList.add(csrOverAllSatisfaction);
                    csrReturnList.add(csrNetPromoter);
                    // csrReturnList.add(csrNetPromoterScore);
                    
                    csrReturnMap.put('LastFourYears', arrayOfYears);
                    csrReturnMap.put('CSRFinalList', csrReturnList);
                    csrReturnMap.put('MeritId', meritId);
                    csrReturnMap.put('AccountType', accType);
                }else {
                    throw new NoAccessException();
                }           
            } else{
                throw new NullPointerException();
            }
            
        }catch(NullPointerException nullPointerEx) {
            System.debug('No Access to query the Contact object from SF in getClientSurveySurestRecords() '+
                         'method -> '+nullPointerEx.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the Contact object from SF in getClientSurveySurestRecords() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getClientSurveySurestRecords() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
        }catch(Exception e) {
            System.debug('Error occurred in getClientSurveySurestRecords() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
        }      
        System.debug('Exit CMAccounts <getClientSurveySurestRecords()>');     
        return csrReturnMap;        
    } 
}