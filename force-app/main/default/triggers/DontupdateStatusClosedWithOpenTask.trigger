/* ####################################################################################
* @author       Sudarshan Reddy
* @date         13/04/2018
* @description  This Trigger won't allow the user to close the case(status to Closed), if case has Open Activities(Tasks).                
*##########################################################################################    */

trigger DontupdateStatusClosedWithOpenTask on Case (before update) {
    
    Boolean status;
    
    //Querying the Tasks that are not Recurring (IsRecurrence != true)
    List<Task> t = [SELECT Id, WhatId,Status,Subject,IsClosed FROM Task WHERE IsClosed=false AND IsRecurrence != true AND WhatId IN :trigger.new Limit 1];
    if(t.size()> 0){
        status = t.get(0).IsClosed;
    }
    //iterate through updated cases and add errors if any open Tasks exist
    for(Case c : Trigger.new){ 
        if(c.status != Trigger.oldMap.get(c.ID).status){
            if(status == false && c.Status == 'Closed'){
                c.status.addError('Cannot Change the Status to closed if Case has Open Activities');
            }  
        }
        else if(c.Date_Completed__c != Trigger.oldMap.get(c.ID).Date_Completed__c){
            if(c.Date_Completed__c != null  && status == false){
                c.status.addError('Cannot Change the Status to closed if Case has Open Activities');
            }
        }
    }
}