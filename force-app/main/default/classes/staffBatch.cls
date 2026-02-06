global with sharing class staffBatch implements Database.Batchable<Sobject>, Database.Stateful {
    
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator('Select Id FROM Staff__c');
    }
    global void execute(Database.BatchableContext bc, List<Staff__c> scope){
        Id specialProjectId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('Special Project').getRecordTypeId();
        Id ipmAssignmentId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('IPM Assignment').getRecordTypeId();
        Set<Id> staffIds = new Set<Id>();
        List<Staff__c> staffList = new List<Staff__c>();
        for(Staff__c staffRec:scope){
            staffIds.add(staffRec.Id);
        }
        
        List<Staff_Assignment__c> ipmList = [SELECT Id, Case_FTE_s__c FROM Staff_Assignment__c WHERE Staffing_Assignment__c = 'a0jVB000001lL3dYAE'];
        for(Staff_Assignment__c s:ipmList){
            system.debug('s = '+s);
        }
        for(AggregateResult ar: [SELECT Id,Sum(Hours_Of_Complexity_Backend__c) HoursComplexity,Sum(Case_FTE_s__c) caseFte,Staffing_Assignment__c FROM Staff_Assignment__c WHERE Staffing_Assignment__c =: staffIds GROUP BY Staffing_Assignment__c,Id]){
            system.debug('ar = '+ar);
        }
        
        for(AggregateResult ar: [SELECT Sum(Hours_Of_Complexity_Backend__c) HoursComplexity,Sum(Case_FTE_s__c) caseFte,Staffing_Assignment__c FROM Staff_Assignment__c WHERE Staffing_Assignment__c =: staffIds AND RecordTypeId IN (:specialProjectId, :ipmAssignmentId) GROUP BY Staffing_Assignment__c]){
            Id staffId = (Id) ar.get('Staffing_Assignment__c');
            Decimal THC = (Decimal) ar.get('HoursComplexity');
            Decimal caseFtes = (Decimal) ar.get('caseFte');
            Staff__c st = new Staff__c();
            st.Id = staffId;
            st.Hours_Of_Complexity_Backend__c = THC;
            st.IPM_BOB_Case_FTE__c = caseFtes;
            staffList.add(st);
        }
        
        if(!staffList.isempty() && staffList!=null){
            try{
                database.update(staffList,false);
            }catch(Exception e){
                system.debug('update failed staffList : '+e.getMessage()); 
            }
        }
    }
    global void finish(Database.BatchableContext bc){
       
    }    
}