global class PersistencyEmailNotification implements Schedulable {
    global void execute(SchedulableContext sc){
        String emailString = System.Label.Persistency_Email;
        string userId =userinfo.getUserId();
        //User usr = [Select id from User where name='Automated Process' limit 1];
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        //message.setTargetObjectId(usr.Id);
        //message.setSenderDisplayName('UHG Merit');
        message.setTargetObjectId(userId);
        message.setSaveAsActivity(false);
        EmailTemplate emailTemplate = [Select Id,Subject,Description,HtmlValue,DeveloperName,Body from EmailTemplate where name = 'Persistency Reminder'];
        message.setTemplateID(emailTemplate.Id); 
        message.toAddresses = new String[] {emailString}; //here give senders name
            Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {message};
                Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
        
        if(results[0].success){
            System.debug('The email was sent successfully');
        } 
        else{
            System.debug('The email failed to send: ' +  results[0].errors[0].message);
        }
    }
}