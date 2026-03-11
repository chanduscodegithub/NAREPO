trigger CTM_Deletion_Log on AccountTeamMember (before delete) {
    
    CTM_Log_Metadata__mdt turnOnTrigger = [SELECT Id, Turn_on_CTM_Logs__c FROM CTM_Log_Metadata__mdt LIMIT 1];
    
    if(turnOnTrigger.Turn_on_CTM_Logs__c == 'Yes'){
        if(trigger.isBefore && trigger.isDelete){
            CTM_Deletion_Log_Helper.createCtmRecord(trigger.old);
        }
    }
}