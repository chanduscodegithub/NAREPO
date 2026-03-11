trigger UploadFileToSharePoint on ContentVersion (after insert) {
    // Iterate through the ContentVersion records in the trigger
    for (ContentVersion triggeredContentVersion : Trigger.new) {
        try {

            System.debug('VersionData for ContentVersion ID ' + triggeredContentVersion.Id);

            // Call the SharePoint upload method
            SharePointIntegration.uploadFileToSharePoint(triggeredContentVersion.Id);
       		 
        } catch (Exception e) {
            System.debug('Error processing ContentVersion ID ' + triggeredContentVersion.Id + ': ' + e.getMessage());
        }
    }
}