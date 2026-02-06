public with sharing class ETSBECase {
    @AuraEnabled
    public static caseRecordType getRecordType(String sobjectName){
        // Map<String,String> recordtypeDetails = new Map<String,string>();
        Id id1 = userinfo.getProfileId();
        String profileName = [select Name from profile where id =:id1].Name;
        caseRecordType  caseRecordTypeList = new caseRecordType();
        if(profileName == 'System Administrator'){
            caseRecordTypeList.caseRecordTypeId = [SELECT Id,Name, DeveloperName, SobjectType FROM RecordType where SobjectType  =: sobjectName];
        } else {
            String[] recordTypeDevNamesArray = System.Label.RecordType_ETSBECase_ExcludedValues.split(';');
            if(recordTypeDevNamesArray != null && recordTypeDevNamesArray.size() > 0) {
                Set<String> recordTypeDevNamesList = new Set<String>();
                for(String recordTypeDevName : recordTypeDevNamesArray) {
                    recordTypeDevNamesList.add(recordTypeDevName);
                }
                caseRecordTypeList.caseRecordTypeId = [SELECT Id,Name, DeveloperName, SobjectType FROM RecordType where SobjectType  =: sobjectName AND DeveloperName NOT IN :recordTypeDevNamesList];
            }
            
        }
        caseRecordTypeList.DefaultId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('General Action').getRecordTypeId();
        return caseRecordTypeList;
    }
    @AuraEnabled
    public static etsDataResult getETSCase(Id accId,Decimal pageNumber,String columnName,String sortType){
        etsDataResult etsDataRslt = new etsDataResult();
        try{
            if(accId != null && pageNumber!= null){
                Integer pageSize = 10;
                Integer offset = ((Integer)pageNumber - 1) * pageSize;
                etsDataRslt.total = [SELECT count() FROM Case where RecordType.Name !='ETS-BE Request' And AccountId=:accId];
                System.debug('cmCdCfContactResult.total'+etsDataRslt.total);
                if(pageNumber > 1 && (etsDataRslt.total == (pageNumber-1) * pageSize)){
                    pageNumber--; 
                    offset = ((Integer)pageNumber - 1) * pageSize;
                }
                System.debug('SELECT Id,CaseNumber,Priority,Subject,Status,Age__c,RecordType.Name,Sub_Category__c,Category__c,Owner.Name FROM Case where RecordType.Name !=\'ETS-BE Request\' And AccountId=:accId Order By '+columnName+' '+sortType+' LIMIT :pageSize OFFSET :offset');
                etsDataRslt.etsList =  Database.query('SELECT Id,CaseNumber,Priority,Subject,Status,Age__c,RecordType.Name,Sub_Category__c,Category__c,Owner.Name FROM Case where RecordType.Name !=\'ETS-BE Request\' And AccountId=:accId Order By '+columnName+' '+sortType+' LIMIT :pageSize OFFSET :offset');
                //etsDataRslt.etsList = [SELECT Id,CaseNumber,Priority,Subject,Status,Age__c,RecordType.Name,Sub_Category__c,Category__c,Owner.Name FROM Case where RecordType.Name !='ETS-BE Request' And AccountId=:accId Order By CreatedDate Desc  LIMIT :pageSize OFFSET :offset];
                etsDataRslt.page = (Integer)pageNumber;
                etsDataRslt.pageSize = pageSize;
            }
        }catch(Exception e){
            System.debug('Exception'+e.getMessage()); 
        }
        return etsDataRslt;
    }
    public class etsDataResult {
        
        @AuraEnabled
        public List<Case> etsList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
    }
    
    public class caseRecordType {
        
        @AuraEnabled
        public List<Sobject> caseRecordTypeId{ get;set; }
        
        @AuraEnabled
        public Id DefaultId { get;set; }
        
    }
}