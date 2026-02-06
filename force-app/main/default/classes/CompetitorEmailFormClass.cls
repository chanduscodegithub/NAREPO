public class CompetitorEmailFormClass {
    
    @AuraEnabled
    public static List<MultiPickListWrapper> getProductsInvolved(){
        List<String> options = new List<String>();
        List<MultiPickListWrapper> multioptions = new List<MultiPickListWrapper>();
        Schema.DescribeFieldResult fieldResult = Opportunity.Product_Type_Involved_in_Opp__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry a: ple) {
            //options.add(f.getLabel());
            MultiPickListWrapper multiopt = new MultiPickListWrapper();
                        multiopt.label = a.getLabel();
                        multiopt.value = a.getValue();
                        multioptions.add(multiopt);
        }        
        return multioptions;
    }
    
    @AuraEnabled
    public static boolean sendMailCompetitor(String companyName, String webAddress, String prodTypesOffered, String address, String additionalComments,String compRowId){
        System.debug('Input Parameters -- comName--'+companyName+' ,webAddress--'+webAddress+' ,prodTypesOffered--'+prodTypesOffered+', address--'+address+', additionalComments--'+additionalComments+', compRowId--'+compRowId);
        Boolean is_success = false;
        String accName;
        if(compRowId != null){
            Account acc = [Select Id,Name From Account where Id=:compRowId WITH USER_MODE LIMIT 1];
        	accName = acc.Name;
        }
       
        
        String receiverEmail = System.Label.Competitve_Landscape_Send_Email_Reciever;
        System.debug(' receiverEmail  > >>>>> '+receiverEmail);
        List<string> emaillst =new List<string>();
        emaillst = receiverEmail.split(',');
        //emaillst.add('prathima_gaddam@uhc.com');
        //emaillst.add(receiverEmail);
        system.debug('emaillst = '+emaillst);
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        message.toAddresses = emaillst;
        message.optOutPolicy = 'FILTER';
        
        message.subject = System.Label.Competitve_Landscape_Send_Email_Subject;
        
        String emailBody = '<b>Requestor:</b>'+'<br/>';
        emailBody += UserInfo.getName()+'<br/><br/>';
        
        emailBody += '<b>Company Information:</b><br/>'; 
      
        emailBody += 'Name: '+accName+'<br/>';
        
        emailBody += 'Row Id: '+compRowId+'<br/>';
      
        emailBody += '<b>Competitor Information:</b><br/> ';
        emailBody += 'Company Name: '+companyName+'<br/>';
        emailBody += 'Address: '+address+'<br/>';        
        emailBody += 'Web Address: '+webAddress+'<br/>';
        emailBody += 'Product Types Offered: '+prodTypesOffered+'<br/>';
        emailBody += 'Addtional Comments: '+additionalComments+'<br/>';
        
        message.setHtmlBody(emailBody);
        
        Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {message};
            Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
        if (results[0].success) {
            is_success=true;           
        } else {
            is_success=false;
            System.debug('The email failed to send: '+ results[0].errors[0].message);
        }
        return is_success;
    }
     public class MultiPickListWrapper{
        @AuraEnabled
        public String label {get;set;}
        
        @AuraEnabled
        public String value {get;set;}
    }
}