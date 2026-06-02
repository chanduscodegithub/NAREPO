trigger RfpTrigger on RFP__c (after update) {
    /*for (RFP__c rfp : Trigger.new) {
        RFP__c oldRfp = Trigger.oldMap.get(rfp.Id);
        if (rfp.Stage__c != oldRfp.Stage__c && (rfp.Stage__c == 'Digitization Successful' || rfp.Stage__c=='Digitization Completed with Errors'))   {
            RFPChunkService.processRFPQuestions(rfp.Id);
        }
    }*/
    
    switch on Trigger.operationType {
        
        when AFTER_UPDATE {
            RFPTriggerHandler.handleTrigger(Trigger.old,Trigger.new,Trigger.oldMap, Trigger.newMap,Trigger.operationType);
        }
        

    }
}