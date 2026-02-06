/****************************************************************** ***** 
Name: SeniorUHGClass 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Query all executives engaged in a particular account Senior UHG Executives Engaged In The Account Custom Lightning Component.
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Abhishek Kumar  	 	11/07/2017  		INITIAL DEVELOPMENT   		  
2.0 -
*********************************************************************
*/

public with sharing class SeniorUHGExecutivesClass {
    
    @AuraEnabled
    public static boolean getLoggedInUserRoles(String accountId){
        
        boolean isLoggedInUserRole = true;
        
        try{
           /* User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                String[] roleNames = System.Label.SeniorUHG_Not_Allowed_Roles_For_Edit.split(',');
                
                System.debug('loggedInUserRole-->>'+loggedInUserRole+'---roleNames---->>>'+roleNames.size());
                
                Set<String> roleNamesSet = new Set<String>(roleNames);
                if(roleNamesSet.contains(loggedInUserRole)) {
                    isLoggedInUserRole = false;
                } else {
                    isLoggedInUserRole = true;
                }
            } */
            isLoggedInUserRole = UserInformationClass.hasEditAccessToRecord(accountId);            
        }catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the Role of Logged In User from SF in '+
                         'getLoggedInUserRoles() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getLoggedInUserRoles() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('QueryException Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        return isLoggedInUserRole;
    }
    
    
    /*******************************************************************
* 
Purpose: Query Senior UHG Executives Engaged in a particular account
Parameters: accountId
Returns: SeniorUHGExecutivesEngaged__c
Throws [Exceptions]: QueryException, Exception

********************************************************************
*/ 
    
    @AuraEnabled
    public static SeniorUHGExecutivesEngaged__c getSeniorUHGExecutivesRecords(String accountId){
        System.debug('Enter getSeniorUHGExecutivesRecords()'); 
        
        UHGAccountSOQLConstants sUHGExeConstants = new UHGAccountSOQLConstants();
        
        List<SeniorUHGExecutivesEngaged__c> seniorExecutiveRecords = new List<SeniorUHGExecutivesEngaged__c>();
        SeniorUHGExecutivesEngaged__c seniorExecutiveRecord = new SeniorUHGExecutivesEngaged__c();
        
        try{
            if(accountId != null){
                if(schema.sobjecttype.SeniorUHGExecutivesEngaged__c.isaccessible() && schema.sobjecttype.SeniorUHGExecutivesEngaged__c.isQueryable()){
                    seniorExecutiveRecords = Database.query(sUHGExeConstants.QUERY_SENIOR_UHG); 
                    
                    if(seniorExecutiveRecords.size() > 0){
                        seniorExecutiveRecord = seniorExecutiveRecords[0];
                    }
                    
                        if(seniorExecutiveRecord.EnterpriseExecutiveSponsorResponsibiliti__c == null){
                            seniorExecutiveRecord.EnterpriseExecutiveSponsorResponsibiliti__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OptumExecutiveSponsorResponsibilities__c == null){
                            seniorExecutiveRecord.OptumExecutiveSponsorResponsibilities__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.UHCExecutiveSponsorResponsibilities__c == null){
                            seniorExecutiveRecord.UHCExecutiveSponsorResponsibilities__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OtherExecutiveResponsibilities1__c == null){
                            seniorExecutiveRecord.OtherExecutiveResponsibilities1__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OtherExecutiveResponsibilities2__c == null){
                            seniorExecutiveRecord.OtherExecutiveResponsibilities2__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OtherExecutiveResponsibilities3__c == null){
                            seniorExecutiveRecord.OtherExecutiveResponsibilities3__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OtherExecutiveResponsibilities4__c == null){
                            seniorExecutiveRecord.OtherExecutiveResponsibilities4__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OtherExecutiveResponsibilities5__c == null){
                            seniorExecutiveRecord.OtherExecutiveResponsibilities5__c = '';    
                        }
                        if(seniorExecutiveRecord.SurestExecutiveSponsorResponsibilities__c == null){
                            seniorExecutiveRecord.SurestExecutiveSponsorResponsibilities__c = '';    
                        }
                        
                }else{
                    throw new NoAccessException();
                } 
                
            }else{
                throw new NullPointerException();
            }
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the SeniorUHGExecutivesEngaged__c object from SF in getSeniorUHGExecutivesRecords() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getSeniorUHGExecutivesRecords() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No AccessException Occured----'+noaccessExec.getMessage());
        }catch(NullPointerException nullPointerException) {
            System.debug('Error(NullPointerException) occurred while querying the details of SeniorUHGExecutivesEngaged__c object from SF in '+
                         'getSeniorUHGExecutivesRecords() method ->'+nullPointerException.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerException.getMessage());
        }
        catch(QueryException queryException){
            System.debug('Error(QueryException) occurred while querying the details of SeniorUHGExecutivesEngaged__c object from SF in '+
                         'getSeniorUHGExecutivesRecords() method -> '+queryException.getMessage());
            System.debug('Error(QueryException) in getSeniorUHGExecutivesRecords() method, the Stack Trace is -> '+queryException.getStackTraceString());
            throw new AuraHandledException('Query Exception Occured----'+queryException.getMessage());
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        if(seniorExecutiveRecord.Id == null)
        {
            seniorExecutiveRecord.EnterpriseExecutiveSponsorResponsibiliti__c = '';    
            seniorExecutiveRecord.OptumExecutiveSponsorResponsibilities__c = '';    
            seniorExecutiveRecord.SurestExecutiveSponsorResponsibilities__c = '';    
            seniorExecutiveRecord.UHCExecutiveSponsorResponsibilities__c = '';    
            seniorExecutiveRecord.OtherExecutiveResponsibilities1__c = '';    
            seniorExecutiveRecord.OtherExecutiveResponsibilities2__c = '';    
            seniorExecutiveRecord.OtherExecutiveResponsibilities3__c = '';    
            seniorExecutiveRecord.OtherExecutiveResponsibilities4__c = '';    
            seniorExecutiveRecord.OtherExecutiveResponsibilities5__c = '';    
        }
        
        System.debug('seniorExecutiveRecord-->>'+seniorExecutiveRecord);
        System.debug('Exit getSeniorUHGExecutivesRecords()'); 
        
        return seniorExecutiveRecord;
    }
    
    /******************************************************************
* 
Purpose: Saves Senior UHG Executives Engaged in a particular account
Parameters: seniorUHGRecord
Returns: SeniorUHGExecutivesEngaged__c
Throws [Exceptions]: DmlException, SObjectException

*******************************************************************
*/ 
    
    @AuraEnabled
    public static SeniorUHGExecutivesEngaged__c saveSeniorUHGExecutivesRecords(SeniorUHGExecutivesEngaged__c seniorUHGRecord, Id accountId){
        
        System.debug('Enter saveSeniorUHGExecutivesRecords()'); 
        
        UHGAccountConstants seConstants = new UHGAccountConstants();
        UHGAccountSOQLConstants soqlConstants = new UHGAccountSOQLConstants();
        
        try{
            if(accountId != null){
                if(schema.sobjecttype.SeniorUHGExecutivesEngaged__c.isaccessible() && schema.sobjecttype.SeniorUHGExecutivesEngaged__c.isCreateable()){
                    
                    System.debug('seniorUHGRecord in save -->>'+seniorUHGRecord.Id);
                    
                    //if(seniorUHGRecord.Id == null){
                    seniorUHGRecord.Name = accountId+seConstants.suffixSeniorUHGRecordName;		//for name of the Record
                    seniorUHGRecord.Account__c = accountId;										//linking Account to the Record
                    upsert as user seniorUHGRecord;	  
                    //}else{
                    //  update seniorUHGRecord;
                    //}
                    
                    /*SeniorUHGExecutivesEngaged__c[] seniorExecutiveRecord = Database.query(soqlConstants.QUERY_SENIOR_UHG); 

if(seniorExecutiveRecord.size() > 0){
if(seniorUHGRecord.Id == null){

}
if((seniorExecutiveRecord[0].Id).equals(seniorUHGRecord.Id)){
upsert seniorUHGRecord;														//Upsert operation     

}    
}else{
seniorUHGRecord.Account__c = accountId;										//linking Account to the Record
upsert seniorUHGRecord;	
}

*/
                    
                    
                }else{
                    throw new NoAccessException();
                }
            }else{
                throw new NullPointerException();
            }
            
        }catch(NullPointerException nullPointerException) {
            System.debug('Error(NullPointerException) occurred while inserting/ updating the details of SeniorUHGExecutivesEngaged__c object from SF in '+
                         'saveSeniorUHGExecutivesRecords() method ->'+nullPointerException.getMessage());
            throw new AuraHandledException('Null Pointer Exception Occured----'+nullPointerException.getMessage());
        }catch(NoAccessException noaccessExec) {
            System.debug('No Access to update SeniorUHGExecutivesEngaged__c object from SF in saveSeniorUHGExecutivesRecords() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in saveSeniorUHGExecutivesRecords() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception Occured----'+noaccessExec.getMessage());
        }catch(DmlException dmlException){
            System.debug('DML Exception(Stack Trace) occurred in saveSeniorUHGExecutivesRecords() method while updating the '+
                         'details of SeniorUHGExecutivesEngaged__c from SF -> '+dmlException.getStackTraceString());
            for (Integer i = 0; i < dmlException.getNumDml(); i++) {
                System.debug('Status Code -> '+dmlException.getDmlStatusCode(i)); 
                System.debug('DML Error Message -> '+dmlException.getDmlMessage(i)); 
                System.debug('FieldNames -> '+dmlException.getDmlFieldNames(i)); 
            }
            throw new AuraHandledException('DML Exception Occured----'+dmlException.getMessage());
        }
        catch(Exception e){
            System.debug('Exception message - '+e.getLineNumber()+' Message'+e.getMessage());
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        System.debug('Exit saveSeniorUHGExecutivesRecords()'); 
        
        return seniorUHGRecord;
    }
    
    
    /******************************************************************
* 
Purpose: Queries Senior UHG Executives Names from SeniorUHGExecutivesEngaged__c Object
Parameters: searchKeyWord, designation
Returns: SeniorUHGExecutivesEngaged__c
Throws [Exceptions]: QueryException, Exception

*******************************************************************
*/ 
    
    @AuraEnabled
    public static List<String> getSeniorUHGExecutiveNames(String searchKeyWord, String designation){
        
        System.debug('Enter getSeniorUHGExecutiveNames()'); 
        
        System.debug('The designation is -->'+ designation);
        searchKeyWord = '%'+searchKeyWord+'%';
        UHGAccountSOQLConstants seConstants = new UHGAccountSOQLConstants();
        List<SeniorUHGExecutivesEngaged__c> seniorExecutiveNames = null;
        Set<String> namesList = New Set<String>();
        
        String[] recordNames = new List<String>();
        
        try{
            if(schema.sobjecttype.SeniorUHGExecutivesEngaged__c.isaccessible() && schema.sobjecttype.SeniorUHGExecutivesEngaged__c.isQueryable()){
                if(designation.equalsIgnoreCase('enterpriseExecutives')){
                    System.debug('Fetching Enterprise Executives Names');
                    seniorExecutiveNames = Database.query(seConstants.QUERY_ENTERPRISE_EXECUTIVE_NAMES);
                    
                    if(!seniorExecutiveNames.isEmpty()){
                        for(SeniorUHGExecutivesEngaged__c seniorExeNames : seniorExecutiveNames){
                            recordNames.add(seniorExeNames.EnterpriseExecutiveSponsorName__c);
                        }    
                    }
                    
                }
                
                if(designation.equalsIgnoreCase('optumExecutives')){
                    System.debug('Fetching Optum Executives Names');
                    seniorExecutiveNames = Database.query(seConstants.QUERY_OPTUM_EXECUTIVE_NAMES);
                    if(!seniorExecutiveNames.isEmpty()){
                        for(SeniorUHGExecutivesEngaged__c seniorExeNames : seniorExecutiveNames){
                            recordNames.add(seniorExeNames.OptumExecutiveSponsorName__c);
                        }    
                    }
                }
                
                if(designation.equalsIgnoreCase('UHCExecutives')){
                    System.debug('Fetching UHG Executives Names');
                    seniorExecutiveNames = Database.query(seConstants.QUERY_UHC_EXECUTIVE_NAMES);
                    if(!seniorExecutiveNames.isEmpty()){
                        for(SeniorUHGExecutivesEngaged__c seniorExeNames : seniorExecutiveNames){
                            recordNames.add(seniorExeNames.UHCExecutiveSponsorName__c);
                        }    
                    }
                }

                if(designation.equalsIgnoreCase('surestExecutives')){
                    seniorExecutiveNames = Database.query(seConstants.QUERY_UHC_SUREST_EXECUTIVE_NAMES);
                    if(!seniorExecutiveNames.isEmpty()){
                        for(SeniorUHGExecutivesEngaged__c seniorExeNames : seniorExecutiveNames){
                            recordNames.add(seniorExeNames.SurestExecutiveSponsorName__c);
                        }    
                    }
                }
                
            }else{
                throw new NoAccessException();
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
        
        return recordNames;
    }
    
    
}