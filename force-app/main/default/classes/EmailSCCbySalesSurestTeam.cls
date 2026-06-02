public without sharing class EmailSCCbySalesSurestTeam {

    @AuraEnabled(cacheable = true)
    public static void sendEmailWithPDF( string salesorIPM, Id recordId, String accountName, String oppName, Date effectiveDate, List<String> selectedEmails) 
    {
        system.debug('recordId>>'+recordId);
        system.debug('accountName>>'+accountName);
        system.debug('oppName>>'+oppName);
        system.debug('effectiveDate>>'+effectiveDate);
        system.debug('selectedEmails>>'+selectedEmails);

        EmailTemplate et = [SELECT Id, Subject, Body FROM EmailTemplate  WHERE DeveloperName = 'Email_send_once_the_Completed_by_Sales_box_has_been_checked_off_SurestTeam' LIMIT 1 ];

        Blob pdfBlob = generatePDF(recordId);

        if (pdfBlob != null) {

            Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
            attachment.setFilename('Sold Change Checklist - ' + oppName + '.pdf');
            attachment.setBody(pdfBlob);
            attachment.setContentType('application/pdf');

            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();

            email.setToAddresses(selectedEmails);
            String fullRecordURL = URL.getOrgDomainURL().toExternalForm() + '/' + recordId;

            String subject = et.Subject;
            subject = subject.replace('{!Opportunity.Account}', accountName);
            subject = subject.replace('{!Opportunity.EffectiveDate__c}', effectiveDate.format());
            email.setSubject(subject);

            String body = et.Body;
            body = body.replace('{!Opportunity.Account}', accountName);
            body = body.replace('{!Opportunity.EffectiveDate__c}', effectiveDate.format());
            body = body.replace('{!Opportunity.Link}',fullRecordURL);
            body = body.replace('{!salesorIPM}',salesorIPM);
            email.setPlainTextBody(body);

            email.setFileAttachments(new Messaging.EmailFileAttachment[]{ attachment });

            Messaging.sendEmail(new Messaging.SingleEmailMessage[]{ email });
            system.debug('email>>'+email);
        }
    }

    private static Blob generatePDF(Id recordId) {

        if (Test.isRunningTest()) {
            return Blob.valueOf('Mock PDF Content');
        }

        PageReference pdfPage = Page.SoldCaseCheckListPrint;
        pdfPage.getParameters().put('id', String.valueOf(recordId));

        return pdfPage.getContent();
    }
}