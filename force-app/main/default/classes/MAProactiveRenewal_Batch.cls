/*-----------------------------------------------------------------------
Author:        Pooja U
Company:       CRMIT Solutions
Description:   Apex batch to calculate MA Proactive Renewals Retention Criteria
			   and to update the Proactive Renewal Comp Status accordingly	
Test Class:    MAProactiveRenewalBatch_Test
History:
		Date			Authors Name			Brief Description of Change
		20/03/2020		Pooja U				    Initial Development
------------------------------------------------------------------------*/
global class MAProactiveRenewal_Batch implements Database.Batchable<sObject>, Database.Stateful{
    DateTime startDateTimeOfBatchRun = System.now();
    Long noOfRecordQueried=0;
    Long noOfRecordWthEmptyEffctvDt=0;
    Long noOfRcrdForWhichPlcyAccntMmbrshpAvlbl=0;
    Long noOfRcrdForWhichPlcyAccntMmbrshpNotAvlbl=0;
    Long noOfRecordUpdatedSuccessfully=0;
    Long noOfRecordFailedWhileUpdate=0;
    List<ErrorInfo> errorInfoList=new List<ErrorInfo>();
    List<ProcessedRecInfo> successfullyUpdtdRecInfoList=new List<ProcessedRecInfo>();
    
    /**
	 * This method queries all membership activity records with the proactive renewal comp status 'Pending Qualification' 
	 * which needs to be verified for the retention criteria
	 */
    global Database.QueryLocator start(Database.BatchableContext bc) {
        system.debug('#####################Batch Starts########################');
        system.debug('start(Database.BatchableContext) - start');   
        String query='';
        query='Select Id,Name,EffectiveDate__c,AccountId,Proactive_Renewal_Incentive_Status__c,Proactive_Renewal_Retention__c'+
            ' from Opportunity where Proactive_Renewal_Incentive_Status__c like \'%Pending Qualification%\' order by AccountId';
        System.debug('query==>'+query);
        system.debug('start(Database.BatchableContext) - end');
        return Database.getQueryLocator(query);
    }
    
    /**
	 * This method queries Policy/Account Membership records for those Membership Activity records flagged as 
	 * "Pending Qualification",calculates the retention criteria and update the Proactive Renewal Comp Status 
	 * accordingly
	 */
    global void execute(Database.BatchableContext bc, List<Opportunity> oppListToProcess){
        system.debug('execute(Database.BatchableContext,List<Opportunity>) - start');
        try{
            if(oppListToProcess!=null && !oppListToProcess.isEmpty()){
                system.debug('No. of opportunity records to process ==>'+oppListToProcess.size());
                noOfRecordQueried+=oppListToProcess.size();
                List<Date> dateList=new List<Date>();
                List<Id> accountIdLst=new List<Id>();
                List<Opportunity> oppHavingEffctvDtLst=new List<Opportunity>();
                for(Opportunity eachOpp:oppListToProcess){
                    if(eachOpp.EffectiveDate__c!=null){
                        dateList.addAll(MAProactiveRenewal_Helper.getDateListToQuery(eachOpp));
                        accountIdLst.add(eachOpp.AccountId);
                        oppHavingEffctvDtLst.add(eachOpp);
                    }else{
                        noOfRecordWthEmptyEffctvDt++;
                    }
                }
                
                if(!oppHavingEffctvDtLst.isEmpty()){
                    String query='Select Id,AccountFirm__c,MembershipType__c,GLDate__c,GLMembership__c from PolicyAccountMembership__c'+ 
                        ' where MembershipType__c=\'Medical\'';
                    query+=' and GLDate__c in: dateList';
                    query+=' and AccountFirm__c in: accountIdLst';
                    query+=' order by AccountFirm__c';
                    
                    List<PolicyAccountMembership__c> plcyAccMmbrshpList=Database.query(query); 
                    
                    System.debug('plcyAccMmbrshpList size==>'+plcyAccMmbrshpList.size());
                    if(plcyAccMmbrshpList!=null && !plcyAccMmbrshpList.isEmpty()){
                        List<Opportunity> oppListToUpdate=new List<Opportunity>();
                        Map<String,Map<String,List<PolicyAccountMembership__c>>> plcyAccMmbrshpMap= MAProactiveRenewal_Helper.processPlcyAccMmbrshpRecord(plcyAccMmbrshpList);
                        if(plcyAccMmbrshpMap!=null && !plcyAccMmbrshpMap.isEmpty()){
                            for(Opportunity eachOpp:oppHavingEffctvDtLst){
                                Integer effectiveDateMonth=eachOpp.EffectiveDate__c.month();
                                Integer effectiveDateYear=eachOpp.EffectiveDate__c.year();
                                Integer effectiveDatePreviousYear=eachOpp.EffectiveDate__c.year()-1;
                                if(plcyAccMmbrshpMap.containsKey(eachOpp.AccountId)
                                  && plcyAccMmbrshpMap.get(eachOpp.AccountId).containsKey(effectiveDateMonth+'_'+effectiveDateYear)
                                  && plcyAccMmbrshpMap.get(eachOpp.AccountId).containsKey(effectiveDateMonth+'_'+effectiveDatePreviousYear)){
                                    Map<String,List<PolicyAccountMembership__c>> crrntAndPrvsYrPlcyMmbrshipMap=plcyAccMmbrshpMap.get(eachOpp.AccountId);
                                    
                                    
                                    
                                    
                                    long retentionValue=MAProactiveRenewal_Helper.calculateRetention
                                        (crrntAndPrvsYrPlcyMmbrshipMap.get(effectiveDateMonth+'_'+effectiveDateYear),
                                         crrntAndPrvsYrPlcyMmbrshipMap.get(effectiveDateMonth+'_'+effectiveDatePreviousYear));
                                    String proactvRnwlCompStatus=eachOpp.Proactive_Renewal_Incentive_Status__c;
                                    if(retentionValue>=75){
                                        eachOpp.Proactive_Renewal_Incentive_Status__c=
                                            proactvRnwlCompStatus.substring(0,proactvRnwlCompStatus.indexOf('-'))+
                                            '- Qualifies - Fully Validated';
                                    }else{
                                        eachOpp.Proactive_Renewal_Incentive_Status__c=proactvRnwlCompStatus.substring(0,proactvRnwlCompStatus.indexOf('-'))+
                                            '- Does not Qualify';
                                    }
                                    //eachOpp.Proactive_Renewal_Retention__c=retentionValue.setScale(2, RoundingMode.HALF_UP);
                                    eachOpp.Proactive_Renewal_Retention__c=retentionValue;
                                    eachOpp.GL_Membership_as_of_the_Effective_Date__c=MAProactiveRenewal_Helper.getGLMembershipValue(crrntAndPrvsYrPlcyMmbrshipMap.get(effectiveDateMonth+'_'+effectiveDateYear));
                                    eachOpp.GL_Membership_One_Year_Prior__c=MAProactiveRenewal_Helper.getGLMembershipValue(crrntAndPrvsYrPlcyMmbrshipMap.get(effectiveDateMonth+'_'+effectiveDatePreviousYear));  
                                    oppListToUpdate.add(eachOpp);
                                    noOfRcrdForWhichPlcyAccntMmbrshpAvlbl++;
                                }else{
                                    noOfRcrdForWhichPlcyAccntMmbrshpNotAvlbl++;
                                }
                                
                                
                            }
                        }
                        if(oppListToUpdate!=null && !oppListToUpdate.isEmpty()){
                            System.debug('oppListToUpdate==>'+oppListToUpdate);
                            Database.SaveResult[] updateResultList = Database.update(oppListToUpdate, false);
                            Integer indx=0;
                            // Iterate through each returned result
                            for (Database.SaveResult eachUpdateResult : updateResultList) {
                                if (eachUpdateResult.isSuccess()) {
                                    // Operation was successful, so get the ID of the record that was processed
                                    System.debug('Successfully upadted opportunity. Opp ID: ' + eachUpdateResult.getId());
                                    successfullyUpdtdRecInfoList.add(new ProcessedRecInfo(oppListToUpdate[indx].Id,
                                                                        oppListToUpdate[indx].Name));
                                    noOfRecordUpdatedSuccessfully++;
                                }
                                else {
                                    String errorMessage='Error occured >> ';
                                    // Operation failed, so get all errors                
                                    for(Database.Error err : eachUpdateResult.getErrors()) {
                                        System.debug('The following error has occurred.');                    
                                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                        System.debug('Opportunity fields that affected this error: ' + err.getFields());
                                        errorMessage+= err.getMessage()+' and fields that affected this error is '+err.getFields();
                                    }
                                    errorInfoList.add(new ErrorInfo('Opportunity Updation Failure',oppListToUpdate[indx].Id,oppListToUpdate[indx].Name,errorMessage));
                                    noOfRecordFailedWhileUpdate++;
                                }
                                indx++;
                            }
                        }
                        
                        
                    }else{
                        noOfRcrdForWhichPlcyAccntMmbrshpNotAvlbl+=oppHavingEffctvDtLst.size();
                        System.debug('Policy/AccountMembership data is not available');
                    } 
                    
                    
                    
                    
                    
                }
            }else{
                System.debug('No opportunity records to process');
            }
            
        }catch(Exception excpn){
            system.debug('Exception occured in execute() method==>'+excpn.getMessage());
            errorInfoList.add(new ErrorInfo('Business Logic Implementation Failure','','',excpn.getMessage()));
        }
        system.debug('execute(Database.BatchableContext,List<Opportunity>) - end');
    }

	/**
	 * This method updates Batch Job Logs and send an email notification if there is any error
	 */    
    global void finish(Database.BatchableContext bc){
       system.debug('finish(Database.BatchableContext) - start');
       try{
           //Update Batch Job Logs
           BatchJobLogs__c logObj = new BatchJobLogs__c();
           logObj.Name = 'MAProactiveRenewal - Batch';
           logObj.Job_Started__c = startDateTimeOfBatchRun;
           logObj.Job_Ended__c = System.now();
           String status='Success';
           Map<String,String> successErrorMsgMap=new Map<String,String>(); 
           //if(successfullyUpdtdRecInfoList.size()>0 || errorInfoList.size()>0){
           if(noOfRecordQueried>0){    
               String logDetail='No. of records queried :- '+noOfRecordQueried+'\n';
               logDetail+='No. of records for which Policy/AccountMembership data is available(records to be updated) :- '+noOfRcrdForWhichPlcyAccntMmbrshpAvlbl+'\n';
               logDetail+='No. of records for which Policy/AccountMembership data is not available :- '+noOfRcrdForWhichPlcyAccntMmbrshpNotAvlbl+'\n';
               if(noOfRecordWthEmptyEffctvDt>0){
                   logDetail+='No. of records with Empty EffectiveDate :- '+noOfRecordWthEmptyEffctvDt+'\n';
               }
               //logDetail+='------------------------------------------------------------\n';
               logDetail+='No. of records updated successfully :- '+noOfRecordUpdatedSuccessfully+'\n';
               logDetail+='No. of records failed while update :- '+noOfRecordFailedWhileUpdate+'\n';
               
               //only success
               if( successfullyUpdtdRecInfoList!=null && !successfullyUpdtdRecInfoList.isEmpty()){
                   
                   String fileAttachmentContent='';
                   string header ='OpportunityId,OpportunityName\n';
                   fileAttachmentContent+=header;
                   for(ProcessedRecInfo eachRecInfo:successfullyUpdtdRecInfoList){
                       String recInfoStr=eachRecInfo.opportunityId+','+eachRecInfo.opportunityName+'\n';
                       fileAttachmentContent+=recInfoStr;
                   }
                   successErrorMsgMap.put('SuccessfullyUpdatedRecList',fileAttachmentContent);
                   if(errorInfoList==null || errorInfoList.isEmpty()){
                       status='Success';
                   }
               }
               //both success and exception
               else if((successfullyUpdtdRecInfoList!=null && !successfullyUpdtdRecInfoList.isEmpty()) || (errorInfoList!=null && !errorInfoList.isEmpty()))
               {
                   status='Failed';String fileAttachmentContent='';
                   string header ='ErrorCategory,OpportunityId,OpportunityName,ErrorMessage\n';
                   fileAttachmentContent+=header;
                   for(ErrorInfo eachErrorInfoObj:errorInfoList){
                       String errorInfoStr=eachErrorInfoObj.errorCategory+','+eachErrorInfoObj.opportunityId+','+
                           eachErrorInfoObj.opportunityName+','+eachErrorInfoObj.errorMessage+'\n';
                       fileAttachmentContent+=errorInfoStr;
                   }
                   successErrorMsgMap.put('ErrorList',fileAttachmentContent);
               }
               logObj.Details__c= logDetail;
               
           }else{
               logObj.Details__c= 'No Opportunity Records to Process';
               status='Success';
            }
         
           logObj.Status__c=status;

           insert logObj;
           if(noOfRecordQueried>0 && successErrorMsgMap!=null && !successErrorMsgMap.isEmpty()){
               List<Attachment> attachmentList=new List<Attachment>(); 		
               for(String eachKey:successErrorMsgMap.keySet()){
                   Attachment attachment = new Attachment();
                   blob csvBlob = Blob.valueOf(successErrorMsgMap.get(eachKey));
                   attachment.Body = csvBlob;
                   attachment.Name = String.valueOf(eachKey+'.csv');
                   attachment.ParentId = logObj.Id;
                   attachmentList.add(attachment);
               }
               if(attachmentList!=null && !attachmentList.isEmpty()){
                   insert attachmentList;
               }
               if(successErrorMsgMap.containsKey('ErrorList')){
                   String subject='MAProactiveRenewal Batch Job Failed';
                   String emailBody='Please click the below link for more details <br/>';
                   emailBody+=URL.getSalesforceBaseUrl().toExternalForm()+'/'+logObj.Id;
                   String[] emailReceiverArray = MAProactiveRenewal_Helper.getListFromValueSeparatedStr(System.Label.MAProactiveRenewal_Batch_Failure_Notification_EmailId,',');
                   MAProactiveRenewal_Helper.sendEmailNotification(subject,emailBody,emailReceiverArray);
               }
           }
		   
           
           
       }catch(Exception excpn){
           system.debug('Exception occured in finish() method==>'+excpn.getMessage()); 
        }
        
       system.debug('finish(Database.BatchableContext) - end');
       system.debug('#####################Batch Ends########################');
    } 
    
    public class ErrorInfo {
        public String errorCategory { get; set; }
        public String opportunityId { get; set; }
        public String opportunityName { get; set; }
        public String errorMessage { get; set; }
        
         public ErrorInfo(String errorCategory,String opportunityId,
                        String opportunityName,String errorMessage) {     
            this.errorCategory=errorCategory;
            this.opportunityId = opportunityId;
            this.opportunityName = opportunityName;
            this.errorMessage = errorMessage;
        }
    }
    
    public class ProcessedRecInfo {
        public Id opportunityId { get; set; }
        public String opportunityName { get; set; }
        
         public ProcessedRecInfo(Id opportunityId,
                        String opportunityName) {     
            this.opportunityId = opportunityId;
            this.opportunityName = opportunityName;
        }
    }
}