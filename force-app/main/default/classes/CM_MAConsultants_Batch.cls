global class CM_MAConsultants_Batch implements Database.Batchable<Sobject>, Database.Stateful {
    
    // Variables to hold the Success/Failure Opportunity ID's and Error Message
    Set<String> successIds = new Set<String>();
    Set<String> failureIds = new Set<String>();
    List<String> statusCode_message = new List<String>();
    List<String> failureFields = new List<String>();
    
    String customLabelValue = System.Label.No_Consultant_Name;
    
    global Database.QueryLocator start(Database.BatchableContext BC) {     
        
        // Get CM MA Consultant Id's from the CSV file in the Static Resource 
        Set<String> maIdList = new Set<String>();
        if(Test.isRunningTest()){
            List<Opportunity> oppList = [Select Id,(SELECT Contact.Account.Name From OpportunityContactRoles) From Opportunity Where Name IN ('Test Opp 4444','Test Opp 5555','Test Opp 6666','Test Opp 7777','Test Opp 8888')];
            for(Opportunity opp : oppList){
                maIdList.add(opp.Id);
            }
            //return Database.getQueryLocator('Select Id From Opportunity Where Name=\'Test Opportunity1\'');
        }
        else{
            StaticResource sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'CM_MA_Ids_For_Consultants'];
            String xmlBodyString = sr.body.toString();
            String[] maIdArray = xmlBodyString.split(',');
            Integer startIndex = 0;        
            if(maIdArray != null && maIdArray.size() > 0) {
                for(Integer i = startIndex; i < maIdArray.size() ; i++){                       
                    maIdList.add(maIdArray.get(i).trim());                    
                }                        
            }
        }
        
        System.debug('OpportunityIdList'+maIdList);
        string oppContactRoleQuery =  'SELECT Id, Does_this_Oppty_Risk_Involve_Consultant__c, (SELECT Contact.FirstName, Contact.LastName, Contact.Account.Name FROM OpportunityContactRoles) FROM Opportunity WHERE Id IN :maIdList';        
        return Database.getQueryLocator(oppContactRoleQuery);
    }
    
    global void execute(Database.BatchableContext BC,List<Opportunity> opportunityList) { 
        
        List<Opportunity> opportunityListToBeUpdated = new List<Opportunity>();
        try{
            if(opportunityList != null && opportunityList.size() > 0) {
                
                for(opportunity opp : opportunityList){
                    
                    List<OpportunityContactRole> oppContRoleList = opp.getSobjects('OpportunityContactRoles');
                    //System.debug('Consultants -->'+oppContRoleList);
                    if(oppContRoleList != null) {   
                        if(oppContRoleList.size() == 0) {
                            //System.debug('Consultant size() is Empty'+oppContRoleList.size());
                            opp.Does_this_Oppty_Risk_Involve_Consultant__c = 'TBD';
                            opportunityListToBeUpdated.add(opp);
                        } else if(oppContRoleList.size() == 1) {
                            String contactRoleName = oppContRoleList[0].Contact.FirstName +' '+ oppContRoleList[0].Contact.LastName;                            
                            contactRoleName = (contactRoleName != null) ? contactRoleName : '';
                            if(contactRoleName == customLabelValue){
                                opp.Does_this_Oppty_Risk_Involve_Consultant__c = 'No';
                                opportunityListToBeUpdated.add(opp);
                            } else {                                
                                opp.Does_this_Oppty_Risk_Involve_Consultant__c = 'Yes';
                                opportunityListToBeUpdated.add(opp);
                            }
                        } else if(oppContRoleList.size() > 1) {
                            opp.Does_this_Oppty_Risk_Involve_Consultant__c = 'Yes';
                            opportunityListToBeUpdated.add(opp);                            
                        }                    
                    } else {
                        opp.Does_this_Oppty_Risk_Involve_Consultant__c = 'TBD';
                        opportunityListToBeUpdated.add(opp);
                    }
                    System.debug('Opportunity Updated Field--->'+ opp.Does_this_Oppty_Risk_Involve_Consultant__c);
                }
                
                if(opportunityListToBeUpdated != null && opportunityListToBeUpdated.size() > 0){
                    //system.debug('inside update'+opportunityListToBeUpdated);
                    Database.SaveResult[] srList = Database.update(opportunityListToBeUpdated, false);
                    
                    // Iterate through each returned result
                    for (Database.SaveResult sr : srList) {
                        if (sr.isSuccess()) {
                            // Success Opportunity ID's
                            successIds.add(sr.getId());
                            //system.debug('Success Ids '+sr.getId());
                        }
                        else {
                            // Failure Opportunity ID's
                            failureIds.add(sr.getId());
                            
                            for(Database.Error err : sr.getErrors()) {
                                statusCode_message.add(err.getStatusCode() + ': ' + err.getMessage());
                                system.debug('Failure Message '+err.getStatusCode() + ': ' + err.getMessage());
                            }
                        }
                    }
                    
                }
            }
        } catch(Exception e) {
            System.debug('Exception occurred in CM_MAConsultants_Batch execute() while updating Opportunity - '+e);
        }      
        
    }
    
    global void finish(Database.BatchableContext BC) {
        
        System.debug('CM_MAConsultants_Batch - FINISH'); 
        System.debug('****Successfully Updated Opportunity Ids*****'+successIds);
        System.debug('The following error has occurred.'); 
        System.debug('****Failed Opportunity Ids*****'+failureIds);
        System.debug('****Status Code : Message*****'+statusCode_message);
        System.debug('CM_MAConsultants_Batch - END'); 
    }   
}