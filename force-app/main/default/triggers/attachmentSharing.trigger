/****************************************************************** ***** 
Name: attachmentSharing
Author: Jnanesh
Purpose: This trigger executes when new ContentDocumentLink link is created. ContentDocumentLink creates when note or attachment is added.
********************************************************************/
trigger attachmentSharing on ContentDocumentLink (before insert,after insert) {
        /*
      * Assigning Inferred permission to the user for this document. The user’s permission is determined by the related record. 
      * For shares with a library, this is defined by the permissions the user has in that library.     
        */ 
    if(Trigger.isBefore){
        for(ContentDocumentLink cdl: Trigger.new){
         //  cdl.shareType = 'I';
        }
    }
        /**
        Below Logic invokes the utility Metric Flow when a Note is added for Issue and updates the Description field at Utilization Metric record.
        **/ 
    if(Trigger.isAfter){
        List<Id> caseIds = new List<Id>();
        List<Case> issuesList = new List<Case>();
        List<Id> documentIdList = new List<Id>();
        Map<String,String> contentTypeMap = new Map<String,String>();
        String objectName = '';
        for(ContentDocumentLink cdl: Trigger.new){
            //Getting recordId under which the note is created.
            Id parentId = cdl.LinkedEntityId;
            objectName = String.valueOf(parentId.getsobjecttype());           
            if(objectName == 'Case'){
                caseIds.add(parentId);               
                documentIdList.add(cdl.ContentDocumentId);
            }            
        }
        //If the recordId is of type case object, Getting its file type.
        if(objectName == 'Case'){
            if(documentIdList != null && documentIdList.size()>0){
                List<ContentDocumentLink> docList = [select id,LinkedEntityId,ContentDocument.FileType from ContentDocumentLink where ContentDocumentId in:documentIdList];               
                for(ContentDocumentLink docs : docList){                   
                    contentTypeMap.put(docs.LinkedEntityId,docs.ContentDocument.FileType);                   
                }
            }
          
            if(caseIds != null && caseIds.size()>0){
                for (integer i = 0; i < caseIds.size(); i++){
                    String fileType = contentTypeMap.get(caseIds[i]);
                    system.debug('Note Type '+fileType);
                    if(fileType != null && fileType == 'SNOTE'){
                        Map<String, String> params = new Map<String, String>();
                        String notesAdded = 'Added Notes';
                        Id loggedinuserId = UserInfo.getUserId();
                        params.put('IssueCreated', notesAdded);
                        params.put('UserId', loggedinuserId);
                        Flow.Interview.Utilization_Metric_Flow utilityMetricFlow = new Flow.Interview.Utilization_Metric_Flow(params);
                        utilityMetricFlow.start();
                    }            
                }
            }
        }
    }   
}