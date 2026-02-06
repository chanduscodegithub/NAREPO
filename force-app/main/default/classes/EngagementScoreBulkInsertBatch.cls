global class EngagementScoreBulkInsertBatch implements Database.Batchable<sObject>,Database.Stateful { 
    
    global String activityHistoryDynamicDateField;
    global Date startDate;
    global Date endDate;
    global Set<Id> contactQuerySet;
    global String processingMethod;
    global Boolean isTemporaryFlag;
    public Boolean hasFailed = false; // Track batch failure
    public List<String> errorMessages = new List<String>(); // Store all error messages
    public Datetime schedulerStartTime = Datetime.now();
    
    global EngagementScoreBulkInsertBatch( String activityHistoryDynamicDateField, Date startDate, Date endDate, Set<Id> contactQuerySet, String processingMethod,Boolean isTemporaryFlag) {
        this.activityHistoryDynamicDateField = activityHistoryDynamicDateField;
        this.startDate = startDate;
        this.endDate = endDate;
        this.contactQuerySet = contactQuerySet;
        this.processingMethod = processingMethod;
        this.isTemporaryFlag = isTemporaryFlag;
    }
    
    global List<Contact> start(Database.BatchableContext BC) {
        // Create a list of Contact records from the contactQuerySet
        List<Contact> contactList = [SELECT Id FROM Contact WHERE Id IN :contactQuerySet];
        return contactList;
    }
    
    global void execute(Database.BatchableContext BC, List<sObject> scope) {
        
        // Convert the scope (List<Contact>) back into a Set<Id>
        Set<Id> contactIdSet = new Set<Id>();
        for (sObject record : scope) {
            contactIdSet.add(((Contact) record).Id);
        }
        
        // Call the EngagementScoreProcessor with the contactIdSet
        try {
            System.debug('Processing engagement scores in batch execute.');
            EngagementScoreBulkInsertBatchHandler.processEngagementScores(
                activityHistoryDynamicDateField,
                startDate,
                endDate,
                contactIdSet,
                processingMethod,
                isTemporaryFlag
            );
        } catch (Exception e) {
            // Handle exceptions as needed
            System.debug('Error in batch execute: ' + e.getMessage());
            hasFailed = true; 
            errorMessages.add(e.getMessage() + '\nStackTrace: ' + e.getStackTraceString()); 
            System.debug('Batch failed: ' + e.getMessage());
        }
    }
    
    global void finish(Database.BatchableContext BC) {
        System.debug('Inside finish method..'+hasFailed);
        if (hasFailed) {
            sendFailureEmail(BC.getJobId()); // Send email with job details
            
        }
        else{
            System.debug('Engagement Score Batch Processing Completed..');
        }
        
        // Perform any post-processing if needed
    }
    
    
    public void sendFailureEmail(String jobId) {
        
         String subject = '⚠️ Engagement Score Batch Failed - Job ID: ' + jobId;
        String body = 'The Engagement Score batch job has failed.\n\n';
        body += 'Job ID: ' + jobId + '\n';
        body += 'Error Count: ' + errorMessages.size() + '\n\n';
        
        for (String errorMessage : errorMessages) {
            body += 'Error Details: ' + errorMessage + '\n\n';
        }
        
            BatchJobLogs__c failLog = new BatchJobLogs__c(
                Status__c = 'Failed',
                Job_Started__c = schedulerStartTime,
                Job_Ended__c = Datetime.now(),
                Name = 'EngagementScoreBulkInsertBatch - ' + String.valueOf(schedulerStartTime),
                Details__c = body
            );
            
            
            insert failLog;
        
        
        
       
        // Fetch email from Custom Label
        String emailRecipients = System.Label.Batch_Error_Notification_Email; // Custom Label Name
        
        if (String.isBlank(emailRecipients)) {
            System.debug('⚠️ No email recipient found in custom label.');
            return; // Exit if no email is set
        }
        
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        //mail.setToAddresses(new String[]{'admin@example.com', 'support@example.com'}); // Add multiple recipients
        //mail.setToAddresses(new String[]{'satheesh.chandrasekar@crmit.com'}); // Add multiple recipients
        mail.setToAddresses(emailRecipients.split(',')); // Support multiple emails separated by comma
        //mail.setCcAddresses(new String[]{'manager@example.com'}); // Add CC recipients if needed
        mail.setSubject(subject);
        mail.setPlainTextBody(body);
       Messaging.sendEmail(new Messaging.SingleEmailMessage[]{mail});
    }
}