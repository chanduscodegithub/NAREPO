public class SendEmailToOpportunityOwner {
    @InvocableMethod
    public static void sendEmailWhenMedicalPrdSold(List<Opportunity> oppList){
        Opportunity op = [Select Id, Account.Name, Owner.Email From Opportunity WHERE id=:oppList[0].Id];
        system.debug('op email'+op.Owner.Email);
        // Query the custom metadata records to get the email addresses
        Send_Email_Notification_Post_Sale__mdt emailMetadata = [SELECT SC_Email_Id__c, Owner_Email_id__c, To_User__c, Owner_Name__c,
                                                                CDD_Email_ID__c 
                                                                FROM Send_Email_Notification_Post_Sale__mdt 
                                                                WHERE Owner_Email_id__c=:op.Owner.Email];
        
        // Create a list to hold the email addresses
        String[] toAddresses = new String[]{};
        List<String> ccAddresses = new List<String>();
        List<String> toUser = new List<String>();
        List<String> toOwner = new List<String>();
        
        // Extract the email addresses from the custom metadata records
        if (emailMetadata.CDD_Email_ID__c != null) {
            String[] cddList = new String[]{};
                cddList =emailMetadata.CDD_Email_ID__c.Split(';');
            for(string cdd:cddList){
                toAddresses.add(cdd);
            }
            
            toUser.add(emailMetadata.To_User__c);
            toOwner.add(emailMetadata.Owner_Name__c);
            
            ccAddresses.add(emailMetadata.Owner_Email_id__c);
            String[] scList = new String[]{};
                scList =emailMetadata.SC_Email_Id__c.split(';');
            for(string sc:scList){
                ccAddresses.add(sc);
            }
            //ccAddresses.add(emailMetadata.SC_Email_Id__c);
            
        }
        
        // Retrieve the Classic Email Template by its name
        EmailTemplate classicTemplate = [SELECT Id, Subject, HtmlValue, Body FROM EmailTemplate WHERE DeveloperName = 'Medical_Product_Sold_Email_Template'];
        String subject = classicTemplate.Subject;
        String htmlBody = classicTemplate.HtmlValue;
        htmlBody = htmlBody.replace(']]>','');
        htmlBody = htmlBody.replace('{!User.Name}', toUser[0]);
        htmlBody = htmlBody.replace('{!Opportunity.OwnerFullName}', toOwner[0]);
        htmlBody = htmlBody.replace('{!Opportunity.AccountId}', op.Account.Name);
        String plainBody = classicTemplate.Body;
        plainBody = plainBody.replace('{!User.Name}', toUser[0]);
        plainBody = plainBody.replace('{!Opportunity.OwnerFullName}', toOwner[0]);
        plainBody = plainBody.replace('{!Opportunity.AccountId}', op.Account.Name);
        
        // Create a new email message
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        
        // Set the recipients
        //String[] emailIds= new String[]{'veera.nandimandalam@crmit.com'};
        email.setToAddresses(toAddresses);
        email.setCcAddresses(ccAddresses);
        
        // Set the email template ID
        //email.setTemplateId(classicTemplate.Id);
        email.setSubject(subject);
        email.setHtmlBody(htmlBody);
        email.setPlainTextBody(plainBody);
        //email.setTargetObjectId(u.id);
        email.setSaveAsActivity(false);
        
        // Send the email
        Messaging.SendEmailResult[] sendResults = Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });
        
        // Check the send results
        for (Messaging.SendEmailResult result : sendResults) {
            if (result.isSuccess()) {
                System.debug('Email sent successfully.');
            } else {
                System.debug('Email send error: ' + result.getErrors()[0].getMessage());
            }
        }    
    }
}