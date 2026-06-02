/**
* @description       : 
* @author            : Spoorthy
* @group             : 
* @last modified on  : 04-02-2024
* @last modified by  : Spoorthy
**/
global with sharing class NASalesTeamEmailNotoficationBatch implements Database.Batchable<Sobject>, Database.Stateful {
    
    global Map<String,String> accOrNaSalesDataFailureList {get;set;}
    
    global Database.QueryLocator start(Database.BatchableContext BC) {     
        
        System.debug('NA Sales Team Batch Apex for clearing out CM SCE and VPCR/RVP - START');
        
        String query = 'Select Id,Future_Specialty_SCE_Start_Date__c,Specialty_SCE__c, Future_Specialty_SCE__c,Name,Future_CM_VPCR_RVP__c,Future_CM_VPCR_RVP_Start_Date__c,Future_CM_SCE__c,Future_CM_SCE_Start_Date__c,CM_SCE__c,CMVPCRRVP__c,Future_CM_VPCR_RVP__r.Name,Future_CM_VPCR_RVP__r.LastName,Future_CM_SCE__r.Name,Future_CM_SCE__r.LastName, (Select Id,Case_Management_End_Date__c, Role__c, Last_Name__c,user__c, Name from CM_Account_Team_Historys__r where (Role__c = \'CM VPCR/RVP\' OR Role__c = \'CM SCE\' OR Role__c = \'Surest CM SCE\' OR Role__c = \'Surest CM SVP\' OR Role__c = \'Specialty Benefits SCE\')) from Account where (Future_Specialty_SCE_Start_Date__c !=null OR Future_CM_SCE_Start_Date__c != null OR Future_CM_VPCR_RVP_Start_Date__c != null)';
        
        System.debug('Query '+query);
        return Database.getQueryLocator(query);        
    } 
    
    global void execute(Database.BatchableContext BC,List<Account> accountDataList) { 
        
        Map<Id, Account> listOfAccsMap = new Map<Id, Account>();
        //Map<Id, String> emailNotiMsgsForAccts = new Map<Id, String>();
        
        String subject = 'Reminder: Upcoming Case Assignment Change';
        String emailBody = '<br /><div style="font-style: italic;font-size: 15px;">As a reminder the case assignment listed below is changing soon.</div>';
        Boolean toBeMailSent = false;
        
        if(accountDataList==null || accountDataList.size()==0){
            system.debug('No account records to process');
        }
        
        
        for(Account accDataObj : accountDataList) {
            
            
            try {
                
                Id accId = accDataObj.Id;        
                Integer daysLeftForSCE = -1;
                Integer daysLeftForVPCR = -1;
                Boolean isSCE = false;
                
                String emailBody1 = '';
                
                if(accDataObj.Future_CM_SCE_Start_Date__c != null) {
                    
                    daysLeftForSCE = Date.today().daysBetween(accDataObj.Future_CM_SCE_Start_Date__c);
                    //System.debug('days left '+daysLeft+'\n Email body '+emailBody);
                    if(daysLeftForSCE>=0 && daysLeftForSCE <= 3) {
                        emailBody1 += '<br /><br /><b>Company Name : </b>'+accDataObj.Name+'<br /><br />';
                        isSCE = true;
                        emailBody1 += 'Future CM SCE : '+accDataObj.Future_CM_SCE__r.Name+'<br />';
                        Date d = accDataObj.Future_CM_SCE_Start_Date__c;
                        String dt = DateTime.newInstance(d.year(),d.month(),d.day()).format('M/dd/YYYY'); 
                        emailBody1 += 'Start Date : '+dt;
                        toBeMailSent = true;
                        
                    }                    
                }
                
                if(accDataObj.Future_CM_VPCR_RVP_Start_Date__c != null) {
                    
                    daysLeftForVPCR = Date.today().daysBetween(accDataObj.Future_CM_VPCR_RVP_Start_Date__c);                 
                    //System.debug('days left '+daysLeft+'\n Email body '+emailBody);
                    if(daysLeftForVPCR>=0 && daysLeftForVPCR <= 3) {
                        if(isSCE) {
                            emailBody1 += '<br />Future CM VPCR/RVP : '+accDataObj.Future_CM_VPCR_RVP__r.Name+'<br />';    
                        } else {
                            emailBody1 += '<br /><br /><b>Company Name : </b>'+accDataObj.Name+'<br /><br />';
                            emailBody1 += 'Future CM VPCR/RVP : '+accDataObj.Future_CM_VPCR_RVP__r.Name+'<br />';
                        }                        
                        Date d = accDataObj.Future_CM_VPCR_RVP_Start_Date__c;
                        String dt = DateTime.newInstance(d.year(),d.month(),d.day()).format('M/dd/YYYY');
                        emailBody1 += 'Start Date : '+dt;
                        toBeMailSent = true;
                        
                    }
                }  
                
                System.debug('Acc Name-'+accDataObj.Name+',Days Left for SCE-'+daysLeftForSCE+', Days Left for VPCR-'+daysLeftForVPCR);
                
                /*if(daysLeftForSCE <= 3 || daysLeftForVPCR <= 3) {

System.debug('Send email prior to 3 days to Future SCE/VPCR ');
emailBody += emailBody1;
toBeMailSent = true;

}*/
                
                if(toBeMailSent){
                    emailBody += emailBody1;
                }
                
                List<CM_Account_Team_History__c> naSalesTeamDataList = accDataObj.getSobjects('CM_Account_Team_Historys__r');
                boolean isCurrentCMSCE =false;
                boolean isCurrentSpecialtySCE =false;
                boolean isCurrentVPCR =false;
                boolean isCMSCERoleExist =false;
                for(CM_Account_Team_History__c naSalesTeamRec : naSalesTeamDataList) {
                    if((naSalesTeamRec.Role__c == 'CM SCE' || naSalesTeamRec.Role__c == 'Surest CM SCE' || naSalesTeamRec.Role__c == 'Surest CM SVP') ) {
                        isCMSCERoleExist =true;
                    }
                    Date endDate = naSalesTeamRec.Case_Management_End_Date__c;
                    if(endDate != null && Date.today() <= endDate){
                        if((naSalesTeamRec.Role__c == 'CM SCE' || naSalesTeamRec.Role__c == 'Surest CM SCE' || naSalesTeamRec.Role__c == 'Surest CM SVP') ) {
                            isCurrentCMSCE =true;
                        }
                        if((naSalesTeamRec.Role__c == 'Specialty Benefits SCE') ) {
                            isCurrentSpecialtySCE =true;
                        }
                        if(naSalesTeamRec.Role__c == 'CM VPCR/RVP') {
                            isCurrentVPCR =true;
                        }
                        
                    }
                }
                
                for(CM_Account_Team_History__c naSalesTeamRec : naSalesTeamDataList) {
                    Date endDate = naSalesTeamRec.Case_Management_End_Date__c;
                    if(endDate != null && Date.today() > endDate) {
                        System.debug('Nullify the Future SCE/VPCR Date');
                        Boolean isDataAvailable = false;
                        Account accObj;
                        
                        Account accObj1 = listOfAccsMap.get(accId);
                        if(accObj1 != null) {
                            accObj = accObj1; 
                        } else {
                            accObj = new Account();
                        }
                        if((naSalesTeamRec.Role__c == 'CM SCE' || naSalesTeamRec.Role__c == 'Surest CM SCE' || naSalesTeamRec.Role__c == 'Surest CM SVP' ) && accDataObj.Future_CM_SCE__c != null) {
                            if(!isCurrentCMSCE){
                                isDataAvailable = true;
                                accObj.CM_SCE__c = accDataObj.Future_CM_SCE__c; 
                                accObj.Future_CM_SCE__c = null;
                                accObj.Future_CM_SCE_Start_Date__c = null;                   
                            }
                        } 
                        else  if(naSalesTeamRec.Role__c == 'CM VPCR/RVP' && accDataObj.Future_CM_VPCR_RVP__c != null) {
                            if(!isCurrentVPCR){
                                isDataAvailable = true;
                                accObj.CMVPCRRVP__c = accDataObj.Future_CM_VPCR_RVP__c;
                                accObj.Future_CM_VPCR_RVP__c = null;
                                accObj.Future_CM_VPCR_RVP_Start_Date__c = null;      
                            }
                        } else if(naSalesTeamRec.Role__c == 'Specialty Benefits SCE' && accDataObj.Future_Specialty_SCE__c != null){
                            if(!isCurrentSpecialtySCE){
                                isDataAvailable = true;
                                accObj.Specialty_SCE__c = accDataObj.Future_Specialty_SCE__c;
                                 if(!isCMSCERoleExist){
                                    accObj.CM_SCE__c = accDataObj.Future_Specialty_SCE__c; 
                                }
                                accObj.Future_Specialty_SCE__c = null;
                                accObj.Future_Specialty_SCE_Start_Date__c = null;
                                if(!isCMSCERoleExist){
                                    accObj.CM_SCE__c = accDataObj.Future_Specialty_SCE__c; 
                                }
                            }
                        }
                        System.debug('isDataAvailable-'+isDataAvailable);
                        if(isDataAvailable) {                        
                            listOfAccsMap.put(accId, accObj);
                        } 
                    }         
                    
                }
                
            } catch(Exception e) {
                System.debug('Error Message in the execute Method while performing the logic -> ' + e.getMessage()); 
                String errmsgContent = accOrNaSalesDataFailureList.get('Business Logic Implementation Failure => ');
                errmsgContent = (errmsgContent != null) ? errmsgContent : '';
                accOrNaSalesDataFailureList.put('Business Logic Implementation Failure => ', errmsgContent + ' :: ' + e.getMessage());
            }
        }
        
        if(toBeMailSent) {                
            List<String> emailList =new List<string>();
            String receiverEmail = System.Label.NA_Sales_Team_Email_Receiver;
            if(receiverEmail != null && receiverEmail.length() > 0) {
                String[] receiverEmailArray = receiverEmail.split(',');
                sendEmailNotification(subject, emailBody, receiverEmailArray);
            }		            
        }
        
        if(listOfAccsMap != null && listOfAccsMap.size() > 0) {
            
            List<Account> listOfAcctsToBeUpdated = new List<Account>();
            for(Id accId : listOfAccsMap.keySet()) { 
                Account accObj = listOfAccsMap.get(accId);
                accObj.Id = accId;
                listOfAcctsToBeUpdated.add(accObj);
            }
            List<Database.SaveResult> saveAccountResults =  Database.update(listOfAcctsToBeUpdated, true, AccessLevel.USER_MODE);
            for(Database.SaveResult saveResult : saveAccountResults){
                if(!saveResult.isSuccess()) {
                    for(Database.Error err : saveResult.getErrors()) {                    
                        System.debug('Error occurred while updating the Account Records - ' + err.getMessage()+' Id '+saveResult.getId()); 
                        String errmsgContent = accOrNaSalesDataFailureList.get('Account Updation Failure => ');
                        errmsgContent = (errmsgContent != null) ? errmsgContent : '';
                        accOrNaSalesDataFailureList.put('Account Updation Failure => ', errmsgContent + ' :: ' + err.getMessage());
                    }
                }
            }
            //update listOfAcctsToBeUpdated;
        }
    }
    
    global void finish(Database.BatchableContext BC) {
        
        if(accOrNaSalesDataFailureList != null && accOrNaSalesDataFailureList.size() > 0) {
            
            String subject = 'Batch Job Failure - NA Sales Team Email Notification Batch';
            String emailBody = 'Please check the below error details -'+'<br />'+'<br />';
            
            for(String errMsg : accOrNaSalesDataFailureList.keySet()) {
                String errMsgContent = accOrNaSalesDataFailureList.get(errMsg);
                emailBody = emailBody + errMsg + ' -> ' + errMsgContent +'<br />'+'<br />';
            }            
            
            List<String> emailList = new List<string>();
            String receiverEmail = System.Label.NA_Sales_Team_Batch_Failure_Notification;
            if(receiverEmail != null && receiverEmail.length() > 0) {
                String[] receiverEmailArray = receiverEmail.split(',');
                sendEmailNotification(subject, emailBody, receiverEmailArray);
            }
        }
        System.debug('NA Sales Team Batch Apex for clearing out CM SCE and VPCR RVP  - END');    
    }
    
    public void sendEmailNotification(String subject, String emailBody, String[] emailArray) {                
        
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        message.toAddresses = emailArray;
        message.optOutPolicy = 'FILTER';        
        message.subject = subject;
        message.setHtmlBody(emailBody);
        
        Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {message};
            Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
        
        if(results[0].success) {
            system.debug('Mail sent successfully');
        } else {
            System.debug('The email failed to send: '+ results[0].errors[0].message);
            String errmsgContent = accOrNaSalesDataFailureList.get('Mail Failure => ');
            errmsgContent = (errmsgContent != null) ? errmsgContent : '';
            accOrNaSalesDataFailureList.put('Mail Failure => ', errmsgContent + ' :: ' + results[0].errors[0].message);
        }        
    }                                            
    
}