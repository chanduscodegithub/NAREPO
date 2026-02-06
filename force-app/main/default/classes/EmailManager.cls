/****************************************************************** ***** 
Name: EmailManager 
Copyright © 2017 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: Email Manager is the class used to send emails
====================================================== 
======================================================  
History 
 ------- 
  VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
  1.0 -      S Vishnu Shankar       05/09/2017      INITIAL DEVELOPMENT         
  2.0 -
*********************************************************************
*/

public with sharing class EmailManager {
  // Public method
    //public static void sendMail(String address, String subject, String body) {
     /******************************************************************
    * 
     Purpose: This method Sends Emails 
     Parameters: Email Address, Mail Subject, Mail Body
     Returns: results (i.e if Email is sent successfully or not)
     Throws [Exceptions]: [optional] 
     
    *******************************************************************
    */ 
    //public static Messaging.SendEmailResult[] sendMail(String address, String subject, String body) {
        public static Messaging.SendEmailResult[] sendMail(List<String> address, String subject, String body) {
        // Create an email message object
       Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        //String[] toAddresses = new String[] {address};
        List<String> toAddresses = new List<String>(address);
        mail.setToAddresses(toAddresses);
        mail.setSubject(subject);
        mail.setPlainTextBody(body);
        //mail.setHtmlBody(body);
        // Pass this email message to the built-in sendEmail method 
        // of the Messaging class
        Messaging.SendEmailResult[] results = Messaging.sendEmail(
                                 new Messaging.SingleEmailMessage[] { mail });
        
        // Call a helper method to inspect the returned results
        inspectResults(results);
        System.debug('results-->'+results);
        return results;
    }
    
    // Helper method
    private static Boolean inspectResults(Messaging.SendEmailResult[] results) {
        Boolean sendResult = true;
        
        // sendEmail returns an array of result objects.
        // Iterate through the list to inspect results. 
        // In this class, the methods send only one email, 
        // so we should have only one result.
        for (Messaging.SendEmailResult res : results) {
            if (res.isSuccess()) {
                System.debug('Email sent successfully');
            }
            else {
                sendResult = false;
                System.debug('The following errors occurred: ' + res.getErrors());                 
            }
        }
        
        return sendResult;
    }
}