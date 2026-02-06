public without sharing class KnowledgeManagementApex {
    @AuraEnabled
    public static kmDataAndAccessData getKnowledgeManagement(Id linkId){
        list<ContentVersion> cdLink = new list<ContentVersion>();
        set<Id> cdIdList = new set<Id>();
        list<ContentDocumentLink> cdLinkId =  new list<ContentDocumentLink>();
        kmDataAndAccessData kmDataAccessList = new kmDataAndAccessData();
        list<KMData> kmDataList = new list<KMData>();
        KMData kmData1 = new KMData();
        try{
            kmDataAccessList.hasAccess = false;
            kmDataAccessList.hasUploadAccess = false;
            id id1 = userinfo.getProfileId();
            String profileName = [select Name from profile where id =:id1].Name;
            String PublishStatus = [SELECT PublishStatus FROM Knowledge__kav where Id=:linkId].PublishStatus;
            cdLinkId = [SELECT ContentDocumentId FROM ContentDocumentLink where LinkedEntityId=:linkId];
            for(ContentDocumentLink cdLnk : cdLinkId){
                cdIdList.add(cdLnk.ContentDocumentId);
            }
            cdLink = [SELECT Id,Title,FileType,Owner.Name,ContentModifiedDate,ContentSize,ContentModifiedBy.Name,ContentDocumentId,IsLatest FROM ContentVersion where ContentDocumentId In:cdIdList AND IsLatest = true Order By ContentModifiedDate DESC];
            for(ContentVersion cdData:cdLink){
                KMData kmData = new KMData();
                kmData.fType = cdData.FileType.tolowercase();
                kmData.ContentModifiedDate = cdData.ContentModifiedDate;
                kmData.ContentSize = cdData.ContentSize;
                kmData.ContentModifiedBy = cdData.ContentModifiedBy.Name;
                kmData.ContentDocumentId = cdData.ContentDocumentId;
                kmData.Title = cdData.Title;
                kmDataList.add(kmData);
            }
            kmDataAccessList.kmDataList = kmDataList;
            if(profileName == 'System Administrator' || profileName =='CSI Administrator'){
                    kmDataAccessList.hasAccess = true;
                }
            if(PublishStatus =='Draft'){
                kmDataAccessList.hasUploadAccess = true;
            }
        }catch(Exception e){
            System.debug('Exception'+e.getMessage()); 
        }
        return kmDataAccessList;
    }
    @AuraEnabled
    public static string DownloadAttachment(Id DownloadAttachmentID)
    {
        String fullFileURL = URL.getSalesforceBaseUrl().toExternalForm();
        String URlDownload = fullFileURL+'/sfc/servlet.shepherd/document/download/'+DownloadAttachmentID;
        system.debug('Download URL:' +URlDownload);
        return URlDownload;
    } 
    
    public class KMData{
        @AuraEnabled
        public String fType { get; set;}
        @AuraEnabled
        public DateTime ContentModifiedDate { get; set;}
        @AuraEnabled
        public Integer ContentSize { get; set;}
        @AuraEnabled
        public Id ContentDocumentId { get; set;}
        @AuraEnabled
        public String ContentModifiedBy { get; set;}
        @AuraEnabled
        public String Title { get; set;}
    }
    
    public class kmDataAndAccessData{
        @AuraEnabled
        public list<KMData> kmDataList { get; set;}
        @AuraEnabled
        public Boolean hasAccess { get; set;}
        @AuraEnabled
        public Boolean hasUploadAccess { get; set;}
    }
}