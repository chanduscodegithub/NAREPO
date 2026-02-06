public class EmailSCCbySalesSurestTeam {
   
    @InvocableMethod
    public static void sendEmailWithPDF(List<EmailRequest> requests) {
        EmailTemplate et = [SELECT Id, HtmlValue, Subject,Body  FROM EmailTemplate WHERE DeveloperName = 'Email_send_once_the_Completed_by_Sales_box_has_been_checked_off_SurestTeam' LIMIT 1 ];
        String pharmacyOpsEmail = Label.PharmacyOpsEmail;

        for (EmailRequest req : requests) {
          
            Blob pdfBlob = generatePDF(req.recordId);
            String oppName = req.oppName;
            if (pdfBlob != null) {
                
                Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
                attachment.setFilename('Sold Change Checklist - '+oppName+'.pdf');
                attachment.setBody(pdfBlob);
                attachment.setContentType('application/pdf');

                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setToAddresses(new String[]{pharmacyOpsEmail});
                String subject = et.subject;
 				subject 	= subject.replace('{!Opportunity.Account}',req.AccountName);
                subject 	= subject.replace('{!Opportunity.EffectiveDate__c}', req.EffectiveDate.format()); 
                email.setSubject(subject);
                String body 	= et.body;
                body 	= body.replace('{!Opportunity.Account}',req.AccountName);
                body 	= body.replace('{!Opportunity.EffectiveDate__c}', req.EffectiveDate.format());
                email.setPlainTextBody(body);
                email.setFileAttachments(new Messaging.EmailFileAttachment[]{attachment});
                
                Messaging.sendEmail(new Messaging.SingleEmailMessage[]{email});
            }
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

    public class EmailRequest {      
        @InvocableVariable(required=true)
        public Id recordId;   
        
        @InvocableVariable(required=true)
        public String AccountName;
        
        @InvocableVariable(required=true)
        public String oppName;
        
        @InvocableVariable(required=true)
        public Date EffectiveDate;
    }

}