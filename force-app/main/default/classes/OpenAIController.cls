/************************************************************************************************** 
* Name         : OpenAIBatchReprocessor
* Copyright ©  : 2025 CRMIT Solutions Company Inc.
* ===============================================================================================
* Purpose      : Utility class to reprocess failed LLM digitization chunks for an RFP__c record
*                by leveraging the OpenAIBatchProcessor batch class.
*
*                This class is typically called when retrying failed or missed chunks after 
*                initial digitization attempts.
*
* ===============================================================================================
* History
* -----------------------------------------------------------------------------------------------
* VERSION   | AUTHOR           | DATE        | DETAIL                       | FEATURES/CSR/TTP
* -----------------------------------------------------------------------------------------------
* 1.0       | CRMIT Solutions  | 23/06/2025  | Initial Development           | 
*
**************************************************************************************************/

/**
 * @description This Apex class serves as a controller for handling various file and RFP-related operations.
 * It provides methods for uploading files, managing associated RFP records, and initiating batch processing for digitization.
 * The class is designed to be called from Lightning Web Components (LWC) and other client-side technologies.
 */
public with sharing class OpenAIController {
    /**
     * @description An inner class used to structure the response for the uploadFile method.
     * It encapsulates the IDs of the newly created RFP record and the ContentDocumentLink.
     * This class ensures a consistent and type-safe return value for the file upload operation.
     */
    public class UploadResponse {
        @AuraEnabled public String rfpId;
        @AuraEnabled public String contentDocumentLinkId;

        public UploadResponse(String rfpId, String cdlId) {
            this.rfpId = rfpId;
            this.contentDocumentLinkId = cdlId;
        }
    }

    /**
     * @description Uploads a file, creates a new custom RFP record, and links them.
     */
    @AuraEnabled
    public static UploadResponse uploadFile(String base64, String filename, String recordId, String company, String primaryConsultant, String consultingFirm, String status) {
        try {
            List<RFP__c> rfpList = [SELECT Id FROM RFP__c WHERE Membership_Activity__c = :recordId];
            Opportunity opp = [SELECT Id, AccountId, PrimaryConsultant__c, Primary_Consulting_Firm__c, Sales_Season1__c FROM Opportunity WHERE Id = :recordId];
            RFP__c newRfp = new RFP__c();
            newRfp.Company__c = opp.AccountId;
            newRfp.Membership_Activity__c = recordId;
            newRfp.Consulting_Firm__c = opp.Primary_Consulting_Firm__c;
            newRfp.Primary_Consultant__c = opp.PrimaryConsultant__c;
            newRfp.Stage__c = 'New';
            newRfp.File_Name__c = filename;
            // Set File_Type__c based on filename extension
            String lowerFilename = filename != null ? filename.trim().toLowerCase() : '';
            if (lowerFilename.endsWith('.xlsx') || lowerFilename.endsWith('.xls')) {
                newRfp.File_Type__c = 'Excel';
            } else if (lowerFilename.endsWith('.docx') || lowerFilename.endsWith('.doc')) {
                newRfp.File_Type__c = 'Word';
            }
            insert AS USER newRfp;

            ContentVersion cv = createContentVersion(base64, filename);
            ContentDocumentLink cdl = createContentLink(cv.Id, newRfp.Id);

            if (cv == null || cdl == null) {
                return null;
            }

            return new UploadResponse(newRfp.Id, cdl.Id);

        } catch (Exception e) {
            throw new AuraHandledException('Error uploading file: ' + e.getMessage());
        }
    }

    /**
     * @description Creates a ContentVersion record from a Base64 encoded file string and a filename.
     */
    public static ContentVersion createContentVersion(String base64, String filename) {
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode(base64);
        cv.Title = filename;
        cv.PathOnClient = filename;
        try {
            insert AS USER cv;
            return cv;
        } catch (DMLException e) {
            return null;
        }
    }

    /**
     * @description Links a ContentDocument to a specific Salesforce record using ContentDocumentLink.
     */
    public static ContentDocumentLink createContentLink(String contentVersionId, String recordId) {
        if (contentVersionId == null || recordId == null) {
            return null;
        }
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersionId].ContentDocumentId;
        cdl.LinkedEntityId = recordId;
        cdl.ShareType = 'V';
        try {
            insert AS USER cdl;
            return cdl;
        } catch (DMLException e) {
            return null;
        }
    }

    /**
     * @description Retrieves the latest file content and filename associated with a record.
     */
    @AuraEnabled
    public static Map<String, String> getFileContent(String recordId) {
        try {
            List<ContentDocumentLink> cdLinks = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId LIMIT 1];
            if (cdLinks.isEmpty()) {
                throw new AuraHandledException('No file found for this record.');
            }
            ContentVersion cv = [SELECT VersionData, Title FROM ContentVersion WHERE ContentDocumentId = :cdLinks[0].ContentDocumentId AND IsLatest = true LIMIT 1];
            if (cv == null) {
                throw new AuraHandledException('No file content found.');
            }
            Map<String, String> result = new Map<String, String>();
            result.put('content', EncodingUtil.base64Encode(cv.VersionData));
            result.put('fileName', cv.Title);
            return result;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching file content: ' + e.getMessage());
        }
    }

    /**
     * @description Initiates a batch job for processing file content related to an RFP.
     */
    @AuraEnabled
    public static void startBatchProcessing(Id rfpId, List<String> chunks) {
        system.debug('Veera'+rfpId);
        try {
            if (rfpId == null) {
                logError(rfpId, null, null, 'RFP ID cannot be null');
                return;
            }
            if (chunks == null || chunks.isEmpty()) {
                logError(rfpId, null, null, 'No chunks provided for processing');
                return;
            }
            OpenAIBatchProcessor batch = new OpenAIBatchProcessor(rfpId, chunks);
            Database.executeBatch(batch, 1);
        } catch (Exception e) {
            logError(rfpId, null, null, 'Error starting batch: ' + e.getMessage() + '\nStack Trace: ' + e.getStackTraceString());
        }
    }

    /**
     * @description Updates the Stage__c field of a specific RFP record.
     */
    @AuraEnabled
    public static void updateRFPStatus(Id rfpId, String newStatus) {
        try {
            RFP__c rfp = new RFP__c(Id = rfpId, Stage__c = newStatus);
            Database.SaveResult result = Database.update(rfp, AccessLevel.USER_MODE);
            if (!result.isSuccess()) {
                String errorMsg = 'Database errors: ';
                for (Database.Error err : result.getErrors()) {
                    errorMsg += err.getMessage() + '; ';
                }
                logError(rfpId, null, null, errorMsg);
            }
        } catch (Exception e) {
            logError(rfpId, null, null, 'Exception updating status: ' + e.getMessage() + '\nStack Trace: ' + e.getStackTraceString());
        }
    }

    /**
     * @description Updates the digitization status (Stage__c) of an RFP record.
     */
    @AuraEnabled
    public static void updateRFPDigitize(Id rfpId, String newStatusDigitize) {
        try {
            RFP__c rfp = new RFP__c(Id = rfpId, Stage__c = newStatusDigitize);
            Database.SaveResult result = Database.update(rfp, AccessLevel.USER_MODE);
            if (!result.isSuccess()) {
                String errorMsg = 'Database errors: ';
                for (Database.Error err : result.getErrors()) {
                    errorMsg += err.getMessage() + '; ';
                }
                logError(rfpId, null, null, errorMsg);
            }
        } catch (Exception e) {
            logError(rfpId, null, null, 'Exception updating digitization: ' + e.getMessage() + '\nStack Trace: ' + e.getStackTraceString());
        }
    }

    /**
     * @description Retrieves the current status (Stage__c) of a specific RFP record.
     */
    @AuraEnabled(cacheable=true)
    public static String getRFPStatus(Id rfpId) {
        try {
            RFP__c rfp = [SELECT Stage__c FROM RFP__c WHERE Id = :rfpId LIMIT 1];
            return rfp.Stage__c;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching RFP status: ' + e.getMessage());
        }
    }

    /**
     * @description Logs a job error into a custom BatchJobLogs__c object for auditing.
     */
    public static void logError(Id rfpId, String chunk, String response, String errorMessage) {
        try {
            BatchJobLogs__c log = new BatchJobLogs__c();
            log.Prompt_Input__c = chunk;
            log.Prompt_Response__c = response;
            log.ErrorChunk__c = errorMessage;
            log.Job_Started__c = DateTime.now();
            log.Job_Ended__c = DateTime.now();
            log.Error_Component__c = 'Digitization';
            log.RFP__c = rfpId;
            insert AS USER log;
        } catch (Exception logEx) {
            // Fallback: Do nothing if logging fails
        }
    }


    @AuraEnabled
    public static List<String> insertQuestions(List<RFP_Question_And_Answer__c> questions, Id rfpId) {
        List<String> results = new List<String>();
        
        if (questions == null || questions.isEmpty()) {
            results.add('No records provided.');
            return results;
        }

        try {

            Database.SaveResult[] saveResults = Database.insert(questions, AccessLevel.USER_MODE);

            for (Integer i = 0; i < saveResults.size(); i++) {
                if (saveResults[i].isSuccess()) {
                    results.add('Row ' + i + ' inserted successfully (Id: ' + saveResults[i].getId() + ')');
                } else {
                    for (Database.Error err : saveResults[i].getErrors()) {
                        results.add('Row ' + i + ' failed: ' + err.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            results.add('Unexpected error: ' + e.getMessage());
            logError(rfpId, null, null, 'Exception updating excel digitization: ' + e.getMessage() + '\nStack Trace: ' + e.getStackTraceString());
        }

        return results;
    }

}