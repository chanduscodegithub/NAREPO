public with sharing class EBDApex {
    @AuraEnabled
    public static EBDAndAccessData getEBD(Id linkId){
        EBDAndAccessData EBDDataAccessList = new EBDAndAccessData();
        list<ContentVersion> cdLink = new list<ContentVersion>();
        set<Id> cdIdList = new set<Id>();
        set<Id> ebdIdList = new set<Id>();
        Map<Id,Id> cdMap = new Map<Id,Id>();
        List<EBD__c> ebdList = new List<EBD__c>();
        List<EBDData> ebdListData = new List<EBDData>();
        list<ContentDocumentLink> cdLinkId =  new list<ContentDocumentLink>();
        try{
            ebdList= [select Id,Name,Year__c from EBD__c where Company__c=:linkId WITH USER_MODE Order By Year__c Desc];
            if(ebdList.size()>0){
                for(EBD__c ebdLnk : ebdList){
                    ebdIdList.add(ebdLnk.Id);
                }
                cdLinkId = [SELECT ContentDocumentId,LinkedEntityId FROM ContentDocumentLink where LinkedEntityId In:ebdIdList];
                for(ContentDocumentLink cdLnk : cdLinkId){
                    cdIdList.add(cdLnk.ContentDocumentId);
                    cdMap.put(cdLnk.LinkedEntityId,cdLnk.ContentDocumentId);
                }
                for(EBD__c ebd:ebdList){
                    EBDData ebdData = new EBDData();
                    ebdData.EBDObj = ebd;
                    ebdData.hasFile = false;
                    ebdData.DocumentId = '';
                    if(cdMap.containsKey(ebd.Id)){
                        ebdData.hasFile = true;
                        ebdData.DocumentId  = cdMap.get(ebd.Id);
                    }
                    ebdListData.add(ebdData);
                    //EBDDataAccessList.EBDList = ebdData;
                }
                EBDDataAccessList.EBDList = ebdListData;
            }
            
            EBDDataAccessList.hasAccess = true;
            EBDDataAccessList.hasUploadAccess = true;
            EBDDataAccessList.yearPickList = getselectOptions();
            
            if(linkId != null){
                boolean isEditAccess = hasEditAccessToRecord();
                EBDDataAccessList.hasAccess = isEditAccess;
                EBDDataAccessList.hasUploadAccess = isEditAccess;
            }
        }catch(Exception ex){
            System.debug('Exception Occured'+ex.getMessage());
        }
        return EBDDataAccessList;
    }
    @AuraEnabled
    public static string DownloadAttachment(Id DownloadAttachmentID)
    {
        String URlDownload = '';
        try{
            String fullFileURL = URL.getSalesforceBaseUrl().toExternalForm();
            URlDownload = fullFileURL+'/sfc/servlet.shepherd/document/download/'+DownloadAttachmentID;
            system.debug('Download URL:' +URlDownload);
            
        }catch(Exception ex){
            System.debug('Download Exception'+ex.getMessage());
        }
        return URlDownload;
    }
    
    @AuraEnabled
    public static EBDAndAccessData insertEbd(Id linkId,EBD__c ebddata,Boolean isDelete){
        EBDAndAccessData EBDDataAccessList = new EBDAndAccessData();
        try{
            System.debug('insert newEBD'+ebddata);
            if(isDelete){
               if(EBD__c.sObjectType.getDescribe().isDeletable()){
                delete ebddata;
               }
            }else{
                upsert ebddata;
            }
        }catch(Exception ex){
            System.debug('Unable to insert EBD'+ex.getMessage());
        }
        EBDDataAccessList = getEBD(linkId);
        return EBDDataAccessList;
    }
    
    @AuraEnabled
    public static List < String > getselectOptions() {
        List < String > allOpts = new list < String > ();
        Schema.sObjectType objType = EBD__c.getSObjectType();
        Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
        map < String, Schema.SObjectField > fieldMap = objDescribe.fields.getMap();
        list < Schema.PicklistEntry > values =
            fieldMap.get('Year__c').getDescribe().getPickListValues();
        allOpts.add('');
        for (Schema.PicklistEntry a: values) {
            allOpts.add(a.getValue());
        }
        return allOpts;
    }
    
    public static Boolean hasEditAccessToRecord(){
        Id profileId = UserInfo.getProfileId();
        Boolean HasAccess = true;
        String profileName = [Select Name from Profile where Id =:profileId].Name;
        if(profileName == 'General Executives' || profileName == 'Benefit Strategist' || profileName == 'Senior Executives' || profileName == 'Senior Executive - ISBA' || profileName == 'NA Services Community Profile' || profileName == 'CSI Client Director'){
            HasAccess = false;
        }
        return HasAccess;
    }
    
    public class EBDData{
        @AuraEnabled
        public EBD__c EBDObj { get; set;}
        @AuraEnabled
        public String DocumentId { get; set;}
        @AuraEnabled
        public Boolean hasFile { get; set;}
    }
    public class EBDAndAccessData{
        @AuraEnabled
        public List<EBDData> EBDList { get; set;}
        @AuraEnabled
        public Boolean hasAccess { get; set;}
        @AuraEnabled
        public Boolean hasUploadAccess { get; set;}
        @AuraEnabled
        public List<String> yearPickList { get; set;}
    }
}