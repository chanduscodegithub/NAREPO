/***************************************************************************************************** 
Name: WinBackStrategyapexcls  
====================================================== 
======================================================
Purpose: Fetching and Updating CM Prior Client WinBack Activity in Prior Client Details Tab.
====================================================== 
======================================================  
History 
------- 
VERSION     AUTHOR                DATE                 DETAIL                       
1.0 -       Vignesh             08/02/2024          INITIAL DEVELOPMENT           
******************************************************************************************************
*/

public with sharing class WinBackStrategyapexcls {
    
    //Fetching the data for WinBackActivity Section.
    @AuraEnabled
    public static Account getCurrentRecord(Id recId) {

        String query = 'SELECT Owner.Name,';
        Map<String, SObjectField> fields = Schema.getGlobalDescribe().get('Account').getDescribe().fields.getMap();
        
        for (String fieldName : fields.keySet()) {
            query += fieldName + ', ';
        }
   
        query = query.substring(0, query.length() - 2);  
        query += ' FROM Account' + ' WHERE Id = :recId';

        return Database.query(query);
    }
    
     //Updating the data for WinBackActivity Section.
    @AuraEnabled
    public static void updateRecord(Account winBack) {

        try{
            update as User winBack;
        }
        catch(exception e){

            throw new AuraHandledException(e.getMessage());
        }
    }
    
     @AuraEnabled(cacheable=true)
    public static Boolean getUserInfo(Id recId){
        String userId = UserInfo.getUserId();
        Boolean hasReadAccess;
         
        UserRecordAccess userRecordAccs = [SELECT RecordId,HasReadAccess,HasEditAccess FROM UserRecordAccess where RecordId = :recId AND UserId =:userId  Limit 1];
        hasReadAccess = userRecordAccs.HasEditAccess;


       return hasReadAccess;
    }
    
    
     @AuraEnabled(cacheable=true)
    public static List<Contact> getRelatedContacts(String accountId)  {

        return [SELECT Id, Name FROM Contact WHERE AccountId = :accountId AND Status__c = 'Active' AND Recordtype.Name ='CD Contact' WITH USER_MODE];

    }
}