global class IPMNotificationEmail implements Schedulable{
    global void execute(SchedulableContext SC) {
      IPMNotificationEmail.sendBulkEmail();
   }

    public static void sendBulkEmail(){
        try{
            Datetime dt = System.now()+2;
            Date todayDate = Date.today()+2;
            Boolean isWeekEnd = true;
            Integer count = 0;
            List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>(); 
            List<Holiday> holidayList = [SELECT Id, ActivityDate FROM Holiday];
            //EmailTemplate et = [SELECT Id,Subject, Body FROM EmailTemplate WHERE DeveloperName ='IPM_Notification'];
            List<String> dateStr = new List<String>();
            for(Holiday str:holidayList){
                dateStr.add(String.valueOf(str.ActivityDate));
            }
            while(isWeekEnd){
                if((dt.format('EEEE') == 'Sunday' || dt.format('EEEE') == 'Saturday') || dateStr.contains(String.valueOf(todayDate))){
                    dt = dt+1;
                    todayDate = todayDate+1;
                }else{
                    isWeekEnd = false;
                }
            }
            for(Project_Task__c projObj:[SELECT Id, Owner.Email,Project_Task_Name__c,End_Date_Form__c,Owner.Name,PRT_Name__r.Name,PRT_Name__r.Account__r.Name FROM Project_Task__c where PRT_Name__c !='' AND End_Date_Form__c=:todayDate AND Project_Type__c !='project' AND PRT_Name__r.Template__c = false]){
                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                String emailTemplate = 'Hi <b>'+projObj.Owner.Name+'</b>,</br></br> Company Name:<b>'+projObj.PRT_Name__r.Account__r.Name+'</b></br> Project Name:<b>'+projObj.PRT_Name__r.Name+'</b></br> Project Task:<b>'+projObj.Project_Task_Name__c+'</b></br> Due Date:<b>'+projObj.End_Date_Form__c+'</b>';
                List<String> toAddresses = new List<String>(); 
                toAddresses.add(projObj.Owner.Email);
                //toAddresses.add('ravi.ramaiah@crmit.com');
                mail.setSubject('IPM Task Notification');
                mail.setSaveAsActivity(false);
                //mail.setTemplateId(et.Id);
                //mail.setWhatId(projObj.Id);
                mail.setHtmlBody(emailTemplate);
                //mail.setHtmlBody(et.Body);
                mail.setToAddresses(toAddresses);
                mails.add(mail);
            }        
            Messaging.sendEmail(mails);
        }catch(Exception ex){
            System.debug('exception Occured'+ex.getMessage());
        }
    }
}