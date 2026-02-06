global class syncCampaignRecordsBatch implements Database.Batchable<sObject> {
    global final List<String> correspondenceTypes;
    global final List<String> surveyTypes;
    global final String emailId;
    global final String campId;
    
    global syncCampaignRecordsBatch(List<String> cT, List<String> sT,String email, String cId){
        correspondenceTypes=cT; surveyTypes=sT; emailId = email; campId = cId;
    }
    
    global Database.QueryLocator start(Database.BatchableContext BC){
        System.debug('Inside Insert Batch Start q='+correspondenceTypes);    
        String correspondenceTypeOthers = '';
        String correspondencePriSec = '';
        String priSecStr = '';
        String otherStr = '';
        Boolean isPriSecExist = false;
        Boolean isOtherExist = false;
        for(String corr:correspondenceTypes){
            if(corr != 'Customer Survey - Primary' && corr != 'Customer Survey - Secondary'){
                otherStr += '\''+corr+'\','; 
                isOtherExist = true;
            }else{
                isPriSecExist = true;
                priSecStr += '\''+corr+'\',';                 
            }            
        }               
        correspondencePriSec = '('+priSecStr.removeEnd(',')+')';
        correspondenceTypeOthers = '('+otherStr.removeEnd(',')+')';
        String conActive = 'Active';       
        System.debug('isPriSecExist='+isPriSecExist);			
        if(isPriSecExist == true && isOtherExist == true && surveyTypes != null && surveyTypes.size() > 0){            
             String qStr = 'SELECT Id, Correspondence_Type__c,Survey_Type__c FROM Contact WHERE ((Correspondence_Type__c includes '+correspondencePriSec+
            			' AND Survey_Type__c IN :surveyTypes) OR Correspondence_Type__c includes '+correspondenceTypeOthers+') AND Status__c =:conActive';
            System.debug('Primary str='+qStr);  
            return Database.getQueryLocator(qStr);
        }else if(isPriSecExist == true && surveyTypes != null && surveyTypes.size() > 0){            
             String qStr = 'SELECT Id, Correspondence_Type__c,Survey_Type__c FROM Contact WHERE (Correspondence_Type__c includes '+correspondencePriSec+
            			' AND Survey_Type__c IN :surveyTypes) AND Status__c =:conActive';
            System.debug('Primary str='+qStr);  
            return Database.getQueryLocator(qStr);
        }else{ 
             String qStr = 'SELECT Id, Correspondence_Type__c,Survey_Type__c FROM Contact WHERE Correspondence_Type__c includes '+correspondenceTypeOthers+
            			   ' AND Status__c =: conActive';
             System.debug('Other str='+qStr);  
            return Database.getQueryLocator(qStr);   
        }        
    }
    
    global void execute(Database.BatchableContext BC, List<Contact> scope){
        List<CampaignMember> campaignRecords = new List<CampaignMember>();
        for(Contact conRec : scope) {
            CampaignMember campaignRec = new CampaignMember();
            campaignRec.CampaignId = campId;
            campaignRec.ContactId = conRec.Id;
            if(conRec.Survey_Type__c != null){
                campaignRec.Survey_Type__c = conRec.Survey_Type__c;
            }           
            campaignRec.Status = 'Sent';
            //campaignRec.Contact_Type__c = conRec.Correspondence_Type__c;
            campaignRec.Correspondence_Type__c = conRec.Correspondence_Type__c;
            campaignRecords.add(campaignRec);
        }
        if(campaignRecords.size() > 0){
            insert campaignRecords;
        }
    }
    
    global void finish(Database.BatchableContext BC){
        Campaign cm = new Campaign();
        cm.Last_Sync_Status__c = 'Completed';
        cm.Last_Sync_Date__c = datetime.now();
        cm.Id = campId;
        update cm;
        
        String corrType = '';
        String corrName = '';
        
        Campaign campaignData = [SELECT Id, Name, Correspondence_Type__c, StartDate, EndDate FROM Campaign WHERE Id =: campId];
        if(campaignData != null){
            corrType = campaignData.Correspondence_Type__c;
            corrName = campaignData.Name;
        }
        // Get the ID of the AsyncApexJob representing this batch job
        // from Database.BatchableContext.
        // Query the AsyncApexJob object to retrieve the current job's information.
        AsyncApexJob a = [SELECT Id, Status, NumberOfErrors, JobItemsProcessed,
                          TotalJobItems, CreatedBy.Email
                          FROM AsyncApexJob WHERE Id =
                          :BC.getJobId()];
        // Send an email to the Apex job's submitter notifying of job completion.
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        String[] toAddresses = new String[] {emailId};
        //String[] toAddresses = new String[] {'jnanesh.avaradi@crmit.com'};
            mail.setToAddresses(toAddresses);
        mail.setSubject('Sync Recipents job ' + a.Status);
        String body = 'The Sync Recipients Apex job process has been completed successfully with '+ a.NumberOfErrors + ' failures.';
        body += '<br><br>Correspondance Name: <a href='+URL.getSalesforceBaseUrl().getHost()+'/'+campId+'>'+corrName+'</a>';
        body += '<br>Correspondance Type: '+corrType;
        if(campaignData != null && campaignData.StartDate != null){
            body += '<br>Campaign Start Date: '+campaignData.StartDate.format();
        }else{
            body += '<br>Campaign Start Date: ';
        }
         if(campaignData != null && campaignData.EndDate != null){
            body += '<br>Campaign End Date: '+campaignData.EndDate.format();
        }else{
            body += '<br>Campaign End Date: ';
        }       
        body += '<br>Last Sync Date: '+datetime.now().format()+'<br>';
        mail.setHtmlBody(body);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
}