/****************************************************************** ***** 
Name: RFPEmailService 
Copyright © 2025 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
* Purpose      : Handles email notifications related to RFP processing
*                outcomes—success or error. Includes dynamic link 
*                generation and message construction.
* Use Case     : Used by RFP processing batches or controller classes
*                to notify RFP owners and the admin team.
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT     

**********************************************************************/


public with sharing class RFPEmailService {
    
    // Encapsulates metadata used for composing dynamic email messages including org base URLs and related record links.
    public with sharing class EmailContext {
        public Id rfpId;
        public User rfpOwner;
        public RFP__c rfpRecord;
        public String orgBaseUrl;
        public String rfpUrl;
        public String oppUrl;
        public String batchLogsUrl;
        public Integer totalQuestions;

        // Constructor to build the context required for email generation.
        public EmailContext(Id rfpId) {
            this.rfpId = rfpId;
            this.rfpRecord = [
                SELECT Id, Name, Membership_Activity__r.Id, Membership_Activity__r.Name
                FROM RFP__c WHERE Id = :rfpId LIMIT 1
            ];
            this.rfpOwner = [SELECT Name, Email FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            this.orgBaseUrl = URL.getOrgDomainUrl().toExternalForm();
            this.rfpUrl = orgBaseUrl + '/lightning/r/RFP__c/' + rfpRecord.Id + '/view';
            this.oppUrl = orgBaseUrl + '/lightning/r/Opportunity/' + rfpRecord.Membership_Activity__r.Id + '/view';
            this.batchLogsUrl = orgBaseUrl + '/lightning/r/RFP__c/' + rfpRecord.Id + '/related/Batch_Job_Logs__r/view';
        }
    }


    // Sends a success email to the RFP owner summarizing the operation.
    public static void sendSuccessEmail(EmailContext ctx, String subject, String customBody, List<String> additionalRecipients) {

        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        OrgWideEmailAddress owea = getMeritOWEA();
        if (owea != null) {
            email.setOrgWideEmailAddressId(owea.Id);
        }
       
        List<String> recipients = new List<String>{ctx.rfpOwner.Email};
        // if (additionalRecipients != null) recipients.addAll(additionalRecipients);
        email.setToAddresses(recipients);
        email.setSubject(subject);

        
        String questionLabel = subject.containsIgnoreCase('strategy')
            ? 'Total Number of Strategy Questions'
            : 'Total Number of Questions Processed';

            String body = 'Dear ' + ctx.rfpOwner.Name + ',<br/><br/>' + customBody +
                '<ul>' +
                    '<li><strong>RFP Name:</strong> <a href="' + ctx.rfpUrl + '">' + ctx.rfpRecord.Name + '</a></li>' +
                    '<li><strong>Associated Opportunity:</strong> <a href="' + ctx.oppUrl + '">' + ctx.rfpRecord.Membership_Activity__r.Name + '</a></li>' +
                    '<li><strong>' + questionLabel + ':</strong> ' + ctx.totalQuestions + '</li>' +
                '</ul>' +
                'If you have any questions regarding the AI-generated responses, please contact the Merit team: <br/>'+ 
                '• <a href="mailto:lbpoluru@uhc.com">lbpoluru@uhc.com</a><br/>' +
                '• <a href="mailto:merit@uhc.com">merit@uhc.com</a><br/><br/>' +
                '<p>Best regards,<br/><strong>RFP SMART Analyzer</strong></p>';

            email.setHtmlBody(body);
            Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{email});
    }


    // Sends two emails—one to the Merit Admin team and one to the RFP owner when a failure occurs during RFP digitization or response generation.
    public static void sendErrorEmails(EmailContext ctx, String adminSubject, String userSubject, String errorTypeLabel) {
        // Admin Email

        OrgWideEmailAddress owea = getMeritOWEA();
        Messaging.SingleEmailMessage adminEmail = new Messaging.SingleEmailMessage();
        if (owea != null) adminEmail.setOrgWideEmailAddressId(owea.Id);
        adminEmail.setToAddresses(Label.RFP_Emails.split(','));
        adminEmail.setSubject(adminSubject);

        String adminBody = '<p>Dear Merit Admin Team,</p>' +
            + (
                    errorTypeLabel == 'digitization process'
                    ? '<p>The digitization process for the following RFP encountered errors.</p>'
                    : '<p>The uploaded RFP questions have been successfully processed; however, the ' + errorTypeLabel + ' encountered errors.</p>'
                ) +
            '<ul>' +
                '<li><strong>RFP Name:</strong> <a href="' + ctx.rfpUrl + '">' + ctx.rfpRecord.Name + '</a></li>' +
                '<li><strong>Requested User:</strong> ' + ctx.rfpOwner.Name + '</li>' +
                '<li><strong>Associated Opportunity:</strong> <a href="' + ctx.oppUrl + '">' + ctx.rfpRecord.Membership_Activity__r.Name + '</a></li>' +
            '</ul>' +
            '<p>You can view the batch job log details <a href="' + ctx.batchLogsUrl + '">Click here</a>.</p>' +
            '<p>Please reach out to the respective RFP Owner to assist with further troubleshooting steps.</p>' +
            '<p>Best regards,<br/><strong>RFP SMART Analyzer</strong></p>';

        adminEmail.setHtmlBody(adminBody);

        // RFP Owner Email
        Messaging.SingleEmailMessage ownerEmail = new Messaging.SingleEmailMessage();
        if (owea != null) ownerEmail.setOrgWideEmailAddressId(owea.Id);
        ownerEmail.setToAddresses(new List<String>{ctx.rfpOwner.Email});
        ownerEmail.setSubject(userSubject);

        String ownerBody = '<p>Dear ' + ctx.rfpOwner.Name + ',</p>' +
           + (
                    errorTypeLabel == 'digitization process'
                    ? '<p>The digitization process for your RFP encountered errors.</p>'
                    : '<p>The uploaded RFP questions have been successfully processed; however, the ' + errorTypeLabel + ' encountered errors.</p>'
                )  +        
            '<ul>' +
                '<li><strong>RFP Name:</strong> <a href="' + ctx.rfpUrl + '">' + ctx.rfpRecord.Name + '</a></li>' +
                '<li><strong>Associated Opportunity:</strong> <a href="' + ctx.oppUrl + '">' + ctx.rfpRecord.Membership_Activity__r.Name + '</a></li>' +
            '</ul>' +
            '<p>A notification has been sent to the Merit team along with the batch job log details for their review. If you do not hear from them, please contact:<br/>' +
            '• <a href="mailto:lbpoluru@uhc.com">lbpoluru@uhc.com</a><br/>' +
            '• <a href="mailto:merit@uhc.com">merit@uhc.com</a></p>' +
            '<p>Thank you for your attention to this matter.</p>' +
            '<p>Best regards,<br/><strong>RFP SMART Analyzer</strong></p>';

        ownerEmail.setHtmlBody(ownerBody);

        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{adminEmail, ownerEmail});
    }

 private static OrgWideEmailAddress getMeritOWEA() {
    List<OrgWideEmailAddress> oweaList = [
            SELECT Id FROM OrgWideEmailAddress
            WHERE Address = 'merit@uhc.com'
            LIMIT 1
        ];
        return oweaList.isEmpty() ? null : oweaList[0];
    }

}