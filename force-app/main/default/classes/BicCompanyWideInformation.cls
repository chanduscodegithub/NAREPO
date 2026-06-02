public with sharing class BicCompanyWideInformation {
    
    @AuraEnabled(cacheable = true)
    public static List<Company_Wide_BiC_Information__c> getBicInformation(String recordId){
        try{
            return [SELECT Id, Name, BiC_Last_Modified_Date__c, BiC_Source__c,
                    BiC_Source_Records__c, BiC_Source_Date__c, Company__c, Overall_BiC__c,
                    Type__c, vs_Aetna__c, vs_Anthem__c, vs_Blues__c, vs_Blues_Alt__c, vs_Cigna__c, Year__c,Date_Updated__c	
                    FROM Company_Wide_BiC_Information__c 
                    WHERE Company__c =: recordId and (Type__c !='Projected' or (Year__c!='2020'  and type__c='Projected')) and (Type__c !='Projected' or (Year__c!='2021'  and type__c='Projected'))
                    AND (Type__c !='Projected' OR (Year__c!='2022'  AND type__c='Projected'))
                    AND (NOT (Year__c = '2019' AND Type__c = 'Full Year'))
                    AND (NOT (Year__c = '2020' AND Type__c = 'Mid Year'))
                    AND (NOT (Year__c = '2020' AND Type__c = 'Full Year'))
                    AND (NOT (Year__c = '2021' AND Type__c = 'Mid Year'))
                      WITH USER_MODE
                    ORDER BY Year__c];
        }catch(Exception ex){
            throw new AuraHandledException(ex.getMessage()); 
        }
    }
    
    @AuraEnabled
    public static void updateBicInformation(List<Company_Wide_BiC_Information__c> bicInformationLst){
        try{
            for(Company_Wide_BiC_Information__c obj : bicInformationLst){
                obj.BiC_Last_Modified_Date__c = System.today();
            }
            upsert as USER bicInformationLst;
        }catch(Exception ex){
            throw new AuraHandledException(ex.getMessage()); 
        }
    }

    @AuraEnabled(cacheable = true)
    public static User userDetails(String recordId){
        try {
            return [SELECT Id, Profile.Name, UserRole.Name FROM User WHERE Id =:recordId WITH USER_MODE LIMIT 1];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable = true)
    public static UserRecordAccess checkRecordAccess(String recordId){
        
        return [SELECT RecordId, HasEditAccess 
                FROM UserRecordAccess 
                WHERE UserId =: userinfo.getUserId() AND RecordId =: recordId WITH USER_MODE
               LIMIT 1];
        
    }
    
    
}