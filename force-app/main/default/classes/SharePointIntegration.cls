public class SharePointIntegration {
        
    // Retrieve SharePoint settings from Custom Settings
    private static SharePoint_Configuration__c getSettings() {
        
        SharePoint_Configuration__c settings = SharePoint_Configuration__c.getOrgDefaults();
        if (settings == null) {
            System.debug('SharePoint Configuration is missing in Custom Settings.');
            return null;
        }
        return settings;
    }
   
    // This method will upload the file to SharePoint
    @future (callout=true)
    public static void uploadFileToSharePoint(Id contentVersionId) {
        try {
            // Retrieve settings
            SharePoint_Configuration__c settings = getSettings();
            
            ContentVersion contentVersion = [
                SELECT Id, Title, VersionData, FileExtension, ContentDocumentId
                FROM ContentVersion
                WHERE Id = :contentVersionId
                LIMIT 1
            ];
            
            
            List<ContentDocumentLink> contentLinks = [
                SELECT Id, ContentDocumentId, LinkedEntityId, LinkedEntity.Type 
                FROM ContentDocumentLink 
                WHERE ContentDocumentId = :contentVersion.ContentDocumentId
            ];
            
            List<ContentDocumentLink> filteredLinks = new List<ContentDocumentLink>();
            for (ContentDocumentLink contentLink : contentLinks) {
                if (contentLink.LinkedEntity.Type != 'User') {
                    filteredLinks.add(contentLink);
                }
            }
            system.debug('filteredLinks::'+filteredLinks);
            
            String folName = filteredLinks[0].LinkedEntity.Type;
            String recordFolderName = filteredLinks[0].LinkedEntityId;
            
            String accessToken = getSharePointAccessToken(settings);
            
            String fileName = contentVersion.Title + '.' + contentVersion.FileExtension;
            String encodedFileName = EncodingUtil.urlEncode(fileName, 'UTF-8').replace('+', '%20');
            
            String folderName = EncodingUtil.urlEncode(settings.FOLDER_NAME__c, 'UTF-8').replace('+', '%20');
            String subFolderName = String.isNotBlank(folName) 
            ? EncodingUtil.urlEncode(folName, 'UTF-8').replace('+', '%20') 
            : '';
            
            String sitePath = settings.SITE_URL__c.substringAfter('.com');
            
            String folderPath = sitePath +'/' + folderName ;
            if (String.isNotBlank(subFolderName)) {
                folderPath += '/' + subFolderName;
            }
            
            // Get all Folder Names
           if (folName != null && folName != '') {
               
               List<Object> folderResults = getAllFolder(settings.SITE_URL__c, folderName, accessToken);
               System.debug('folderResults::'+folderResults);
               
               // Flag to track if the folder exists
                Boolean folderExists = false;

               if (folderResults != null && !folderResults.isEmpty()) {
                   for (Object folderObj : folderResults) {
                       Map<String, Object> folder = (Map<String, Object>) folderObj;
                       String foldName = (String) folder.get('Name');
                       System.debug('foldName::' + foldName);
                       
                       // Check if the folder exists
                       if (foldName == folName) {
                           folderExists = true;
                           break;
                       }
                   }
               }
               
               // If the folder does not exist, create it
            //    if (!folderExists) {
            //        System.debug('Creating Folder: ' + folderPath);
            //        createFolder(accessToken, folderPath, settings.SITE_URL__c);
            //    }
               
               String recordFolderPath = folderPath + '/' +recordFolderName ;
               system.debug('recordFolderPath::'+recordFolderPath);
                   
               if (recordFolderName != null && recordFolderName != '') {
                   // Check if Record folder exists
                   system.debug('Record Folder');
                   system.debug('folderPath::' + folderPath);
                   
                   List<Object> recordFolderResults = getAllFolder(settings.SITE_URL__c, folderPath, accessToken);
                   system.debug('Record Folder Results::' + recordFolderResults);
                   
                   String newRecordFolder = folderPath + '/' + recordFolderName;
                   system.debug('newRecordFolder::' + newRecordFolder);
                   
                   // Flag to track if folder creation is needed
                   Boolean recordFolderRes = false;
                   
                   if (recordFolderResults != null && !recordFolderResults.isEmpty()) {
                       for (Object recordFolderObj : recordFolderResults) {
                           Map<String, Object> recordFolder = (Map<String, Object>) recordFolderObj;
                           String recordFoldName = (String) recordFolder.get('Name');
                           
                           // Check if the folder exists
                           if (recordFoldName == recordFolderName) {
                               recordFolderRes = true;
                               break;
                           }
                       }
                   }
                   
                   // Create the folder if it doesn't exist
                //    if (!recordFolderRes) {
                //        system.debug('Creating Record Folder: ' + newRecordFolder);
                //        createFolder(accessToken, newRecordFolder, settings.SITE_URL__c);
                //    }
                   
                   // Upload the file to the folder
                   system.debug('Uploading file to folder: ' + newRecordFolder);
                   uploadFile(accessToken, newRecordFolder, settings.SITE_URL__c, encodedFileName, contentVersionId, contentVersion.VersionData, settings.APP_DOMAIN__c);
               }
               
           }
        }
        catch (Exception e) {
            System.debug('Exception occurred: ' + e.getMessage());
        }
    }

	// Get All Folder 
    public static List<Object> getAllFolder(String siteURL, String folderName, String accessToken){
        System.debug('accessToken::' + accessToken);
        String checkFoldersEndpoint = siteURL + '/_api/web/GetFolderByServerRelativeUrl(\'' + folderName + '\')';
      // String checkFoldersEndpoint = 'https://crmitindia.sharepoint.com/sites/UHCPOC1/_api/web/Salesforce%20to%20Sharepoint';
        System.debug('checkFoldersEndpoint::' + checkFoldersEndpoint);
        
        HttpRequest reqs = new HttpRequest();
        reqs.setEndpoint(checkFoldersEndpoint);
        reqs.setMethod('GET');
        reqs.setHeader('Authorization', 'Bearer ' + accessToken);
        reqs.setHeader('Accept', 'application/json;odata=verbose');
        reqs.setHeader('Content-Type', 'application/json;odata=verbose');
        
        Http https = new Http();
        HttpResponse rest = https.send(reqs);
        
        if (rest.getStatusCode() == 200 || rest.getStatusCode() == 201) {
            System.debug('Response: ' + rest.getBody());
            
            Map<String, Object> jsonResponse = (Map<String, Object>) JSON.deserializeUntyped(rest.getBody());
            Map<String, Object> d = (Map<String, Object>) jsonResponse.get('d');
            
            List<Object> folderResults = (List<Object>) d.get('results');
            
            return folderResults;
        } else {
            System.debug('Error: Unable to retrieve folders. Response code: ' + rest.getStatusCode());
            return null;
        }
    }

    
    // Upload File API
    public static void uploadFile(String accessToken, String folderPath, String siteURL, String encodedFileName, String contentVersionId, Blob versionData, String appDomain) {
        String endpoint = siteURL + '/_api/web/GetFolderByServerRelativeUrl(\'' + folderPath + '\')/Files/Add(url=\'' + encodedFileName + '\',%20overwrite=true)';
        system.debug('endpoint::'+endpoint);
        
        // Set up the HTTP request
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setHeader('Authorization', 'Bearer ' + accessToken);
        req.setHeader('Accept', 'application/json;odata=verbose');
        req.setHeader('Content-Type', 'application/json;odata=verbose');
        req.setBodyAsBlob(versionData); 
        
        // Send the request
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        // Check the response
        if (res.getStatusCode() == 200 || res.getStatusCode() == 201) {
            System.debug('File uploaded successfully: ' + res.getBody());
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            Map<String, Object> fileData = (Map<String, Object>) responseMap.get('d');
            String serverRelativeUrl = (String) fileData.get('ServerRelativeUrl');
            
            String name = (String) fileData.get('Name');
            String fileUrl = appDomain + serverRelativeUrl;
            System.debug('Name:' + name);
            System.debug('File URL: ' + fileUrl);
            String parentId = null;
            if (fileUrl != null && name != null) {
                String trimmedUrl = fileUrl.replace('/' + name, ''); // Remove the file name
                List<String> urlParts = trimmedUrl.split('/');
                parentId = urlParts[urlParts.size() - 1]; // Get the last part as ParentId
            }
                        
            // Create a record in the custom File object
            Files__c fileRecord = new Files__c(
                Name = name,
                File_URL__c = fileUrl,
                ParentId__c = parentId
            );
            insert fileRecord;
            System.debug('File record created successfully: ' + fileRecord.Id); 
            deleteFileFromSalesforce(contentVersionId);
            
        } else {
            System.debug('Failed to upload file. Response: ' + res.getBody());
        }
    }
    
    // Create Folder API
    // public static void createFolder(String accessToken, String folderPath, String siteURL) {
    //     String createEndpoint = siteURL + '/_api/web/folders';
    //     system.debug('createEndpoint::'+createEndpoint);
    //     system.debug('folderPath::'+folderPath);
    //     system.debug('accessToken::'+accessToken);
        
    //     // Prepare the metadata payload
    //     String payload = JSON.serialize(new Map<String, Object>{
    //         '__metadata' => new Map<String, String>{ 'type' => 'SP.Folder' },
    //             'ServerRelativeUrl' => folderPath
    //             });
    //     system.debug('payload::'+payload);
    //     String formDigestValue = getFormDigestValue(accessToken);
    //     System.debug('formDigestValue::'+formDigestValue);
       
        
    //     HttpRequest createReq = new HttpRequest();
    //     createReq.setEndpoint(createEndpoint);
    //     createReq.setMethod('POST');
    //     createReq.setHeader('Authorization', 'Bearer ' + accessToken);
    //     createReq.setHeader('Accept', 'application/json;odata=verbose');
    //     createReq.setHeader('Content-Type', 'application/json;odata=verbose');
    //     createReq.setHeader('X-RequestDigest', formDigestValue);
    //     createReq.setBody(payload);
        
    //     // Send the request
    //     Http http = new Http();
    //     HttpResponse res = http.send(createReq);

        
    //     if (res.getStatusCode() == 200 || res.getStatusCode() == 201) {
    //         System.debug('Folder created successfully: ' + res.getBody());
    //     }
    // }
    
    // Get FormDigestValue API
    // public static String getFormDigestValue(String accessToken) {
    //     SharePoint_Configuration__c settings = getSettings();
        
    //     String formDigestEndPoint = settings.SITE_URL__c + '/_api/contextinfo';
        
    //     HttpRequest request = new HttpRequest();
    //     request.setEndpoint(formDigestEndPoint);
    //     request.setHeader('Authorization', 'Bearer ' + accessToken);
    //     request.setMethod('POST');
    //     request.setHeader('Accept', 'application/json;odata=verbose');
    //     request.setHeader('Content-Type', 'application/json;odata=verbose');
    //     request.setBody('{}');
        
    //     Http http = new Http();
    //     HttpResponse response = http.send(request);
        
    //     system.debug('Response Status: ' + response.getStatusCode());
    //     system.debug('HTTP Response Body: ' + response.getBody());
        
    //     if (response.getStatusCode() == 200) {
    //         Map<String, Object> resp = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
    //         Map<String, Object> d = (Map<String, Object>) resp.get('d');
    //         Map<String, Object> contextWebInfo = (Map<String, Object>) d.get('GetContextWebInformation');
    //         String formDigestValue = (String) contextWebInfo.get('FormDigestValue');
    //         return formDigestValue;
    //     } else {
    //         System.debug('Error retrieving SharePoint Form Digest Value: ' + response.getBody());
    //         return null;
    //     }
    // }

    // Display File Records from Files__c
    @AuraEnabled(cacheable=true)
    public static List<Files__c> fileRecords(String recordId) {
        return [
            SELECT Id, Name, File_URL__c, ParentId__c, CreatedDate 
            FROM Files__c 
            WHERE ParentId__c = :recordId
        ];
    }

    // Delete file after upload
    public static void deleteFileFromSalesforce(Id contentVersionId) {
        try {
            ContentVersion contentVersion = [
                SELECT Id, ContentDocumentId
                FROM ContentVersion
                WHERE Id = :contentVersionId
                LIMIT 1
            ];
            
            ContentDocument documentToDelete = [
                SELECT Id 
                FROM ContentDocument 
                WHERE Id = :contentVersion.ContentDocumentId 
                LIMIT 1
            ];
            delete documentToDelete;
            System.debug('ContentDocument deleted successfully: ' + documentToDelete.Id);
        } catch (Exception ex) {
            System.debug('Failed to delete file from Salesforce: ' + ex.getMessage());
        }
    }
    
   
    // Retrieve the access token for SharePoint
    public static String getSharePointAccessToken(SharePoint_Configuration__c settings) {
        
        String body = 'grant_type=client_credentials' +
            '&client_id=' + settings.CLIENT_ID__c +'@'+ settings.TENANT_ID__c +
            '&client_secret=' + settings.CLIENT_SECRET__c +
            '&resource=00000003-0000-0ff1-ce00-000000000000/'+settings.TENANT_NAME__c+'.sharepoint.com@'+settings.TENANT_ID__c;
           
        system.debug('urlbody:'+body);

        HttpRequest request = new HttpRequest();
        request.setMethod('POST');
        request.setEndpoint('https://accounts.accesscontrol.windows.net/'+settings.TENANT_ID__c+'/tokens/OAuth/2');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setBody(body);
       
        Http http = new Http();
        HttpResponse response = http.send(request);
        system.debug('Response Status: '+response.getStatusCode());
        system.debug('HTTP Response Body: ' + response.getBody());
       
        if (response.getStatusCode() == 200) {
            System.debug('body ' + response.getBody());
            Map<String, Object> resp = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            return (String) resp.get('access_token');
        } else {
            System.debug('Error retrieving SharePoint access token: ' + response.getBody());
            return null;
        }
    }

}