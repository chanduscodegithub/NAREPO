/* ####################################################################################
* @author       Sudarshan Reddy
* @date         10/01/2018
* @description  This Trigger will update the MA_Team_Recreation__c to CHECK if it has ZERO MA Team Members             
*##########################################################################################    */
trigger MA_MATeamRecreationFieldUpdate on Opportunity (after update,after insert, before insert, before update) {
    if(Trigger.isAfter && (Trigger.isUpdate || Trigger.isInsert)){
        /*Set<Id> MAIds = new Set<Id>();
        List<Opportunity> OpportunityWithTeamMemberList = new List<Opportunity>();
        List<Opportunity> updateOpportunity = new List<Opportunity>();
        
        if(checkRecursiveClass.runOnce()){
            
            for(Opportunity opp : trigger.new){
                MAIds.add(opp.Id);
            }
            
            if(MAIds != null && MAIds.size() > 0){
                OpportunityWithTeamMemberList = [SELECT Id, MA_Team_Recreation__c, 
                                                 (SELECT Id FROM OpportunityTeamMembers) 
                                                 FROM Opportunity 
                                                 WHERE ID IN: MAIds];
            }
            
            
            for(Opportunity oppObj : OpportunityWithTeamMemberList){
                List<OpportunityTeamMember> oppTeamMemList = oppObj.OpportunityTeamMembers;
                
                if(oppTeamMemList == null || (oppTeamMemList != null && oppTeamMemList.size() == 0)) {
                    oppObj.MA_Team_Recreation__c = true;
                    updateOpportunity.add(oppObj);
                }
            }
            
            if(updateOpportunity != null && updateOpportunity.size() > 0){
                update updateOpportunity;
            }
            
        }
        Set<Id> oppIds = new Set<Id>();
        for (Opportunity opp : Trigger.new) {
            oppIds.add(opp.Id);
        }
        if (!oppIds.isEmpty()) {
            OLI_CPWHandler.syncCPWFields(oppIds);
        }*/
    }
    
    if(Trigger.isBefore && Trigger.isInsert){
            //OpportunityTriggerHandler.setSurestFlag(Trigger.new,null);

        //OpportunityTriggerHandler.populateSalesDebriefOnInsert(Trigger.New);
    }
    
    if(Trigger.isBefore && Trigger.isUpdate){
        OpportunityTriggerHandler.populateSalesDebriefOnBeforeUpdate(Trigger.New, Trigger.oldMap);
    //OpportunityTriggerHandler.setSurestFlag(Trigger.new, Trigger.oldMap);

        //OpportunityTriggerHandler.validateOpp(Trigger.new, Trigger.oldMap);
        
    }
    
    if (Trigger.isAfter && Trigger.isUpdate) {
        OpportunityTriggerHandler.afterUpdate(Trigger.new, Trigger.oldMap);
    }
    
     if(Trigger.isBefore){
        ProactiveRenewalService.process(Trigger.new, Trigger.oldMap);
    }
    
    /*if(Trigger.isAfter && Trigger.isUpdate){
        OpportunityTriggerHandler.populateSalesDebriefOnAfterUpdate(Trigger.New, Trigger.oldMap);
    }*/
}