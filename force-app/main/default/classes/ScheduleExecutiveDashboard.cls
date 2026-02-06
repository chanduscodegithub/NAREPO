global class ScheduleExecutiveDashboard implements Schedulable {
    global void execute(SchedulableContext sc) {
        Pagereference dashboard = Page.ExecutiveDashboardDownload;
        Blob pdf;
        if(!Test.isRunningTest()){
            pdf = dashboard.getContentAsPDF();
        }else{
            pdf = Blob.valueOf('Test');
        }
        List<String> emails = new List<String>();
        for(Executive_Dashboard_Emails__mdt obj: [SELECT Label, DeveloperName 
                                                  FROM Executive_Dashboard_Emails__mdt])
        {
            emails.add(obj.Label);
        }
        
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        message.setToAddresses(emails); List<Messaging.EmailFileAttachment> attachments = new List<Messaging.EmailFileAttachment>();
        
        Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
        efa.setFileName('Executive Dashboard.pdf');
        efa.setBody(pdf);
        efa.setContentType('application/pdf');
        
        message.setFileAttachments(new List<Messaging.EmailFileAttachment>{efa});
        List<EmailTemplate> templates = [SELECT Id, Subject, HtmlValue FROM EmailTemplate WHERE DeveloperName = 'ExecutiveDashboardEmail'];
        message.setHtmlBody(templates[0].HtmlValue);
        message.setSubject(templates[0].Subject);
        try {
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { message });
        } catch (Exception e) {
            System.debug('Exception '+e.getMessage()+e.getStackTraceString());
        }
    }
    
}