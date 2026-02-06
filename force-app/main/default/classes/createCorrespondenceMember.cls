/*********************************************************************** 
Name: workItemsController 
Copyright © 2020 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
Purpose: 
=======================================================================================================================
=======================================================================================================================  
History 
------- 
VERSION      AUTHOR              	DATE                DETAIL   	 				FEATURES/CSR/TTP  
1.0 -   	 Mohan Sai Puttagunta 	03/17/2020  		INITIAL DEVELOPMENT   		  
2.0 -
***********************************************************************************************************************
*/

public class createCorrespondenceMember {
    
    @AuraEnabled
    public static String createCorrespondenceRecords(Id recordId) {
        System.debug('Creation of Correspondence members based on Correspondence Type and Survey Type -- START ');
        //Boolean recInsertionStatus = true;
        Date todayDate = Date.today();
        String errorMessage = '';
        System.StatusCode errorStatusCode;
        List<CampaignMember> campaignRecords = new List<CampaignMember>();
        List<Contact> listOfContacts = new List<Contact>();
        
        try {
            Campaign correspondenceRec = [SELECT Id, Name,Owner.Email,Last_Sync_Status__c, Status, Correspondence_Type__c, Survey_Type_MultiSelect__c, StartDate, EndDate FROM Campaign WHERE Id =: recordId];
            List<String> existingMembers = new List<String>();
            //Validate start date & End date and throw Exception if the end date is passed already
            if(correspondenceRec != null) {
                if(correspondenceRec.Status != 'Completed' && correspondenceRec.Status != 'Aborted'){
                    
                    List<String> surveyTypes = new List<String>();
                    List<String> correspondenceTypes = new List<String>();
                    String email = correspondenceRec.Owner.Email;
                    if(correspondenceRec.Correspondence_Type__c != null) {
                        correspondenceTypes = correspondenceRec.Correspondence_Type__c.split(';');
                        Boolean isSurveyTypeRequired = false;
                        if(correspondenceTypes.contains('Customer Survey - Primary') || correspondenceTypes.contains('Customer Survey - Secondary')){
                            isSurveyTypeRequired = true;
                        }
                        if(isSurveyTypeRequired == true && correspondenceRec.Survey_Type_MultiSelect__c == null){
                            errorMessage = 'Survey Type is required for the correspondence type Customer Survey - Primary or Customer Survey - Secondary.';
                        }  else {
                            if(correspondenceRec.Survey_Type_MultiSelect__c != null){
                                surveyTypes = correspondenceRec.Survey_Type_MultiSelect__c.split(';');
                            }                                                        
                            AggregateResult[] campMemResults = [select count(Id)totRec from CampaignMember WHERE CampaignId = :recordId];
                            Integer recCount = Integer.valueOf(campMemResults[0].get('totRec'));
                            if(recCount > 0){                              
                                correspondenceRec.Last_Sync_Status__c = 'In Progress';                                                                   
                                update correspondenceRec;
                                System.debug('From Inside Delete');
                                String q1 = 'select Id from CampaignMember WHERE CampaignId = \''+recordId+'\'';                                                                       
                                Id batchInstanceId = Database.executeBatch(new deleteCampaignRecordsBatch(q1,correspondenceTypes,surveyTypes,email,recordId), 200);                                                           
                            }else{
                                System.debug('From Inside Insert');                                    
                                Id batchInstanceId = Database.executeBatch(new syncCampaignRecordsBatch(correspondenceTypes,surveyTypes,email,recordId), 200);
                            }
                            errorMessage = 'Sync Process has been initiated, it may take a few minutes to complete. Notification email will be sent to '+email+', please click on cancel to close the window. ';
                        }                                                   
                    } else {
                        errorMessage = 'Please specify the Correspondence Type for the correspondence';
                    }                                                                                                                                                   
                } else {
                    System.debug('Status is Completed ');
                    errorMessage= 'Cannot Sync the correspondance which is '+correspondenceRec.Status;
                }
            }
            
        } catch(Exception e) {
            System.debug('Error while creating the records -> '+e);
            throw new AuraHandledException(errorMessage);
        }
        
        return errorMessage;
    }
}