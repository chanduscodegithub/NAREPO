/* ####################################################################################
* @author       Sudarshan Reddy
* @date         01/10/2018
* @description  This Trigger won't allow the user to create the TASK, if case Status is Closed.                
*##########################################################################################    */
trigger DontCreateTaskWithClosedIssueStatus on Task (before insert, before update) {
    
    Set<Id> caseId = new Set<Id>();
    List<Case> caseList = new List<Case>();
    
    for(Task t : Trigger.new){
        if(t.WhatId != null){
            if(String.valueof(t.WhatId).startsWith('500')){
                caseId.add(t.WhatId);
            }
        }
        
    }
    if(caseId != null && caseId.size()> 0){
        caseList = [SELECT Id, Status FROM CASE WHERE ID IN :caseId AND Status = 'Closed'];
    }
    
    for(Task t : Trigger.new){
        for(Case c : caseList){
            t.addError('Cannot add a Task to Closed Issues');
        }
    }
}