/*-----------------------------------------------------------------------
Author:        Pooja U
Company:       CRMIT Solutions
Description:   Apex batch to transform existing competitor data to fit in 
			   the report aspects(there should be a record for each Competitor 
			   and other product association) for whitespace analysis and it's for one time run.
Test Class:    OthrPrdctCompetitorDataTrnsfrmBatch_Test
History:
		Date			Authors Name			Brief Description of Change
		13/02/2020		Pooja U				    Initial Development
------------------------------------------------------------------------*/
global class OtherPrdctCompetitorDataTransform_Batch implements Database.Batchable<sObject>, Database.Stateful{
    
    global final String operation;
    Long noOfRecordQueried=0;
    Long noOfRecordTobeInserted=0;
    Long noOfRecordTobeUpdated=0;
    Long noOfRecordInsertedSuccessfully=0;
    Long noOfRecordUpdatedSuccessfully=0;
    Long noOfRecordDeletedSuccessfully=0;
    Long noOfRcrdUpsrtdOrDltdSccssfully=0;
    Long noOfRecordFailed=0;
    List<ErrorInfo> errorInfoList=new List<ErrorInfo>();
    
    global OtherPrdctCompetitorDataTransform_Batch(String oprtn){
        system.debug('#####################Batch Starts########################');
        operation=oprtn;
        system.debug('operation==>'+operation);
    }
    
    /**
	 * This method queries all competitor records to upsert or delete(records that are already transformed) 
	 * based on the input param 'operation'
	 */
    global Database.QueryLocator start(Database.BatchableContext bc) {
        system.debug('start(Database.BatchableContext) - start');
        String query='';
        if(operation=='Upsert'){
            query='Select Id,Account__c,Account__r.Name,CompetitorAccount__c,CompetitorAccount__r.Name,competitorclassification__c,type__c,TypesofOtherProductsServicesProvide__c,Type_of_Products_Services_Provided__c,Comments__c from Competitor__c';
        }else if(operation=='Delete'){
            query='Select Id,Account__c,CompetitorAccount__c,competitorclassification__c from Competitor__c where Competitorclassification__c=\'Other\' and OtherPrdctCompetitorRecordTobeDeleted__c=true ';
        }
        system.debug('query==>'+query);
        system.debug('start(Database.BatchableContext) - end');
        return Database.getQueryLocator(query);
    }
    
    /**
	 * This method process(upsert/delete) the queried records based on the input param 'operation' 
	 */
    global void execute(Database.BatchableContext bc, List<Competitor__c> competitorListToProcess){
        system.debug('execute(Database.BatchableContext,List<Competitor__c>) - start');
        try{
            if(competitorListToProcess!=null && !competitorListToProcess.isEmpty()){
                system.debug('No. of competitor records to process '+'('+operation+')==>'+competitorListToProcess.size());
                noOfRecordQueried+=competitorListToProcess.size();
                
                if(operation=='Upsert'){
                    List<Competitor__c> competitorListToUpsert=new List<Competitor__c>();
                    for(Competitor__c eachCompetitor:competitorListToProcess){
                        if(!String.isEmpty(eachCompetitor.competitorclassification__c)){
                            String competitorClassification=eachCompetitor.competitorclassification__c;
                            if(competitorClassification=='Other'){
                                eachCompetitor.OtherPrdctCompetitorRecordTobeDeleted__c=true;
                                competitorListToUpsert.add(eachCompetitor);
                                noOfRecordTobeUpdated++;
                                List<Competitor__c> competitorListToInsert=OtherPrdctCompetitorDataTransform_Helper.getOtherProductCompetitorListToInsert(eachCompetitor);
                                competitorListToUpsert.addAll(competitorListToInsert);
                                noOfRecordTobeInserted+=competitorListToInsert.size();
                                
                                
                            }else if(competitorClassification=='Medical' || competitorClassification=='Dental' ||
                                     competitorClassification=='Vision' || competitorClassification=='Pharmacy'){
                                         eachCompetitor.Type_of_Products_Services_Provided__c=eachCompetitor.competitorclassification__c;
                                         competitorListToUpsert.add(eachCompetitor);
                                         noOfRecordTobeUpdated++;
                                         
                                     }/*else{
                                         system.debug('competitorclassification is not listed in picklist. Competitor record Id==>'+eachCompetitor.Id);
                                         errorInfoList.add(new ErrorInfo(eachCompetitor.Account__c
                                                                         ,eachCompetitor.CompetitorAccount__c
                                                                         ,eachCompetitor.competitorclassification__c
                                                                         ,'Competitor classification value is not listed in \'Type of Products\\Services Provided\' picklist'));
                                         noOfRecordFailed++;
                                         eachCompetitor.OtherPrdctCompetitorRecordTobeDeleted__c=true;
                                		 competitorListToUpsert.add(eachCompetitor);
                                		 noOfRecordTobeUpdated++;
                                         
                                     }*/
                        }else{
                            system.debug('competitorclassification is empty for competitor record with Id==>'+eachCompetitor.Id);
                            errorInfoList.add(new ErrorInfo(eachCompetitor.Account__c
                                                            ,eachCompetitor.CompetitorAccount__c
                                                            ,eachCompetitor.competitorclassification__c
                                                            ,'Competitor classification field is empty'));
                            noOfRecordFailed++;
                            eachCompetitor.OtherPrdctCompetitorRecordTobeDeleted__c=true;
                            competitorListToUpsert.add(eachCompetitor);
                            noOfRecordTobeUpdated++;
                        }
                        
                    }
                    if(!competitorListToUpsert.isEmpty()){
                        Database.UpsertResult[] upsertResultList = Database.upsert(competitorListToUpsert, false);
                        Integer indx=0;
                        // Iterate through each returned result
                        for (Database.UpsertResult eachUpsertResult : upsertResultList) {
                            if (eachUpsertResult.isSuccess()) {
                                if(eachUpsertResult.isCreated()){
                                    System.debug('Competitor record inserted Successfully and the record ID:' + eachUpsertResult.getId()); 
                                    noOfRecordInsertedSuccessfully++;
                                }
                                else{
                                    System.debug('Competitor record updated Successfully and the record ID:' + eachUpsertResult.getId()); 
                                    noOfRecordUpdatedSuccessfully++;
                                }
                                
                                
                            }
                            else {
                                noOfRecordFailed++;
                                String errorMessage='Error occured >> ';
                                
                                for(Database.Error err : eachUpsertResult.getErrors()) {
                                    System.debug('The following error has occurred.');                    
                                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                    System.debug('Competitor fields that affected this error: ' + err.getFields());
                                    errorMessage+= err.getMessage()+' and fields that affected this error is '+err.getFields();
                                }
                                errorInfoList.add(new ErrorInfo(competitorListToUpsert[indx].Account__c
                                                                ,competitorListToUpsert[indx].CompetitorAccount__c
                                                                ,competitorListToUpsert[indx].competitorclassification__c
                                                                ,errorMessage));
                            }
                            indx++;
                        } 
                    }
                }else if(operation=='Delete'){
                    
                    Database.DeleteResult[] deleteResultList = Database.delete(competitorListToProcess, false);
                    Integer indx=0;
                    for(Database.DeleteResult eachDeleteResult : deleteResultList) {
                        if (eachDeleteResult.isSuccess()) {
                            noOfRecordDeletedSuccessfully++;
                            System.debug('Successfully deleted competitor record with ID: ' + eachDeleteResult.getId());
                        }
                        else {
                            noOfRecordFailed++;
                            String errorMessage='Error occured >> ';
                            for(Database.Error err : eachDeleteResult.getErrors()) {
                                System.debug('The following error has occurred.');                    
                                System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                System.debug('Competitor fields that affected this error: ' + err.getFields());
                                errorMessage+= err.getMessage()+' and fields that affected this error is '+err.getFields();
                            }
                            errorInfoList.add(new ErrorInfo(competitorListToProcess[indx].Account__c
                                                            ,competitorListToProcess[indx].CompetitorAccount__c
                                                            ,competitorListToProcess[indx].competitorclassification__c
                                                            ,errorMessage));
                        }
                        indx++;
                    }
                    
                    
                }
                
            }else{
                system.debug('No. of competitor records to process '+'('+operation+')==>0');
            }
        }catch(Exception excpn){
            system.debug('Exception occured in execute() method==>'+excpn.getMessage());
        }
        
        system.debug('execute(Database.BatchableContext,List<Competitor__c>) - end');
        
    }

	/**
	 * This method sends a batch status through email
	 */    
    global void finish(Database.BatchableContext bc){
        system.debug('finish(Database.BatchableContext) - start');
        try{
            String status='Success';
            String msgText='No. of records queried to '+operation+' :- '+noOfRecordQueried+'<br/>';
            
            if(operation=='Upsert'){
                msgText+='No. of records to be inserted :- '+noOfRecordTobeInserted+'<br/>';
                msgText+='No. of records to be updated :- '+noOfRecordTobeUpdated+'<br/>';
                msgText+='No. of records inserted successfully :- '+noOfRecordInsertedSuccessfully+'<br/>';
                msgText+='No. of records updated successfully :- '+noOfRecordUpdatedSuccessfully+'<br/>';
            }
            //msgText+='No. of records '+operation+'ed successfully:- '+noOfRecordQueried+'<br/>';
            //msgText+='No. of records failed while '+operation+' :- '+noOfRecordFailed+'<br/>';
            msgText+='No. of records failed :- '+noOfRecordFailed+'<br/>';
            
            
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            
            String[] toAddresses = new String[] {'pooja.u@crmit.com'}; 			
			
            mail.setToAddresses(toAddresses);
			//mail.setCcAddresses(ccAddresses);
			
            mail.setSubject('Other Product Competitor Data Transform Batch Status  ');
            mail.setBccSender(false);
            mail.setUseSignature(false);
            
            
            
            //------------
            if(!errorInfoList.isEmpty()){
                status='Failed';
                String fileAttachmentContent='';
                string header ='AccountId\tCompetitorAccountId\tCompetitorClassification\tErrorMessage\n';
                fileAttachmentContent+=header;
                for(ErrorInfo eachErrorInfoObj:errorInfoList){
                    String errorInfoStr=eachErrorInfoObj.accountId+'\t'+eachErrorInfoObj.competitorAccountId+'\t'+
                        eachErrorInfoObj.competitorClassification+'\t'+eachErrorInfoObj.errorMessage+'\n';
                    fileAttachmentContent+=errorInfoStr;
                }
                
                Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
                
                blob excel = blob.valueOf(fileAttachmentContent);
                
                system.debug('excelblob'+fileAttachmentContent);
                
                
                
                attachment.setBody(excel);
                
                attachment.setFileName('ErrorList.xls');
                mail.setFileAttachments(new Messaging.EmailFileAttachment[]{attachment});
            }
            
            //------------
            msgText+='Status :- '+status+'<br/>';
           	mail.setHtmlBody(msgText);
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
            
        }catch(Exception excpn){
           system.debug('Exception occured in finish() method==>'+excpn.getMessage()); 
        }
        system.debug('finish(Database.BatchableContext) - end');
        system.debug('#####################Batch Ends########################');
    }  
    
    public class ErrorInfo {
        
        public Id accountId { get; set; }
        public String accountName { get; set; }
        public Id competitorAccountId { get; set; }
        public String competitorAccountName { get; set; }
        public Id competitorId { get; set; }
        public String competitorClassification { get; set; }
        public String errorMessage { get; set; }
        
        /*public ErrorInfo(String accountId,String accountName,String competitorAccountId,String competitorAccountName,
                        String competitorId,String competitorClassification,String errorMessage) {*/
         public ErrorInfo(Id accountId,Id competitorAccountId,
                        String competitorClassification,String errorMessage) {                    
            this.accountId = accountId;
            //this.accountName = accountName;
			this.competitorAccountId = competitorAccountId;
            //this.competitorAccountName = competitorAccountName;
			//this.competitorId = competitorId;
            this.competitorClassification = competitorClassification;
            this.errorMessage = errorMessage;
        }
    }
}