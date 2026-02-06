/*
*********************************************************
Trigger Name    : EngagementScoreScheduler
Created Date       : Feb 27, 2025
@description       : This scheduler triggers the batch class weekly or monthly once.
@author            : Satheesh Chandrasekar
Modification Log:
Ver   Date         Author                               Modification
1.0   27-02-2025   Satheesh Chandrasekar           		Initial Version

*********************************************************
*/
public class EngagementScoreScheduler implements Schedulable {
    public void execute(SchedulableContext context) {
        Datetime schedulerStartTime = Datetime.now();
        Id logId;
        try {
            // 1. Log job start
            BatchJobLogs__c jobLog = new BatchJobLogs__c(
                Name = 'EngagementScoreScheduler - ' + String.valueOf(schedulerStartTime),
                Status__c = 'Started',
                Job_Started__c = schedulerStartTime,
                Details__c = 'Scheduled engagement score calculation started.'
            );
            insert jobLog;
            logId = jobLog.Id;
            
            //  2. Email on start
          // sendStartNotification(schedulerStartTime);
            
            //  3. Collect data for past week
            /* ---------------Weekly run - Start------------------------------- */
            
            Date endDate = Date.today().toStartofWeek(); // Sunday
            // Calculate the start date (6 days before the end date)
            Date startDate = endDate.addDays(-6);
            system.debug('start Date : '+startDate+'End Date : '+ endDate);
            
            //Date startDate = Date.newInstance(2025, 6, 09);
            //Date endDate = Date.newInstance(2025, 6, 15);12,18
           
            //Date startDate = Date.newInstance(2025, 5, 12);
            //Date endDate = Date.newInstance(2025, 5, 18);
            
            Datetime startDateTime = getStartOfDay(startDate);
            Datetime endDateTime = getEndOfDay(endDate);
            String contactIds = '';
            
            Set<Id> contactQuerySet = new Set<Id>();
            for (Activity_History__c record : [
                SELECT Id, Contact__c
                FROM Activity_History__c
                WHERE Activity_Date__c >= :startDateTime
                AND Activity_Date__c <= :endDateTime
            ]) {
                contactQuerySet.add(record.Contact__c);
                contactIds =contactIds +';'+record.Contact__c;
            }
            system.debug('contactquerySET-->'+contactQuerySet);
            
            //  4. Execute batch job
            Integer EngagmentScoreProcessorBatchSize = Integer.valueOf(System.Label.EngagmentScoreProcessorBatchSize);
            EngagementScoreBulkInsertBatch batchJob = new EngagementScoreBulkInsertBatch('Activity_Date__c',startDate,endDate,contactQuerySet,'Scheduled',false);
            Database.executeBatch(batchJob, EngagmentScoreProcessorBatchSize); // Adjust the batch size
            
            // 5. Mark as Success
            jobLog.Status__c = 'Success';
            jobLog.Job_Ended__c = Datetime.now();
            Integer maxLength = 131072;
            if (contactIds != null && contactIds.length() > maxLength) {
                contactIds = contactIds.substring(0, maxLength);
            }

            jobLog.Details__c += '\nBatch executed for ' + contactIds + ' contacts.'; //contactQuerySet.size() 
            update jobLog;
            
          //sendSuccessNotification(startDateTime, Datetime.now(), contactQuerySet.size(),jobLog.Id);
            
            
            
            
            /* ---------------Weekly run - End------------------------------- */
        } catch (Exception e) {
            System.debug('Scheduler Failed: ' + e.getMessage());
            // 6. Mark as Failed
            BatchJobLogs__c failLog = new BatchJobLogs__c(
                Status__c = 'Failed',
                Job_Started__c = schedulerStartTime,
                Job_Ended__c = Datetime.now(),
                Name = 'EngagementScoreScheduler - ' + String.valueOf(schedulerStartTime),
                Details__c = 'Scheduler failed with error:\n' + e.getMessage() + '\n\nStack Trace:\n' + e.getStackTraceString()
            );
            
            if (logId != null) {
                failLog.Id = logId;
                update failLog;
            } else {
                insert failLog;
            }
            
           //sendFailureNotification(e);
        }
    }
    
    public void sendStartNotification(Datetime startTime) {
        String emailRecipients = System.Label.Batch_Error_Notification_Email;
        if (String.isBlank(emailRecipients)) return;
        
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(emailRecipients.split(','));
        mail.setSubject('Engagement Score Scheduler Started');
        mail.setPlainTextBody('Scheduler started at: ' + String.valueOf(startTime));
        Messaging.sendEmail(new Messaging.SingleEmailMessage[]{ mail });
    }
    public void sendSuccessNotification(Datetime startTime, Datetime endTime, Integer contactCount,id jobLogId) {
        String emailRecipients = System.Label.Batch_Error_Notification_Email;
        if (String.isBlank(emailRecipients)) return;
        
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setToAddresses(emailRecipients.split(','));
        mail.setSubject('Engagement Score Scheduler Success');
        mail.setPlainTextBody(
            'The Engagement Score Scheduler completed successfully.\n\n' +
            'Start Time: ' + String.valueOf(startTime) + '\n' +
            'End Time: ' + String.valueOf(endTime) + '\n' +
            'Contacts Processed: ' + contactCount + '\n\n' +
            'This job ran as part of the weekly engagement refresh. Click the below to view the log file.' +'\n\n'+ URL.getOrgDomainUrl().toExternalForm() +'/'+jobLogId +'\n\n'
            
        );
        Messaging.sendEmail(new Messaging.SingleEmailMessage[]{ mail });
    }
    
    
    
    // Convert Date to Datetime at 00:00:00 (Start of Day)
    public static Datetime getStartOfDay(Date inputDate) {
        Datetime utcDatetime = Datetime.newInstance(inputDate.year(), inputDate.month(), inputDate.day(), 0, 0, 0);
        utcDatetime = utcDatetime.addSeconds(UserInfo.getTimeZone().getOffset(utcDatetime) / 1000);
        
        return utcDatetime;
    }
    
    // Convert Date to Datetime at 23:59:59 (End of Day)
    public static Datetime getEndOfDay(Date inputDate) {
        Datetime utcDatetime = Datetime.newInstance(inputDate.year(), inputDate.month(), inputDate.day(), 23, 59, 59);
        utcDatetime = utcDatetime.addSeconds(UserInfo.getTimeZone().getOffset(utcDatetime) / 1000);
        
        return utcDatetime;
    }
    
    
    // 🔹 Method to send failure notification
    Public void sendFailureNotification(Exception e) {
        System.debug('inside sendFailureNotification method');
        // Fetch email from Custom Label
        String emailRecipients = System.Label.Batch_Error_Notification_Email; // Custom Label Name
        
        if (String.isBlank(emailRecipients)) {
            System.debug('⚠️ No email recipient found in custom label.');
            return; // Exit if no email is set
        }
        
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        
        // Email recipients (Add required recipients)
        // mail.setToAddresses(new String[]{'sample@gmail.com'});
        mail.setToAddresses(emailRecipients.split(',')); // Support multiple emails separated by comma
        
        mail.setSubject('🚨 Engagement Score Scheduler Failed');
        mail.setPlainTextBody(
            'An error occurred while executing the EngagementScoreScheduler.\n\n' +
            'Error Details: ' + e.getMessage() + '\n\n' +
            'Stack Trace: ' + e.getStackTraceString()
        );
        
        // Send email
        Messaging.sendEmail(new Messaging.SingleEmailMessage[]{ mail });
        System.debug('end of sendFailureNotification method');
        
    }
}