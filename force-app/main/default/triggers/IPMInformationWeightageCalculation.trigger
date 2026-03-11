trigger IPMInformationWeightageCalculation on IPM_Information__c (before insert, before update, before delete, after update, after insert) {
   
   
    if (trigger.isBefore && trigger.isUpdate) {
        
        system.debug('call trigger handler>>>>>>');
        IPMInformationWeightageCalculationHelper.calculateAddOnUpdate(trigger.newMap,trigger.oldMap ); 
        
    }
        
    if(trigger.isBefore && trigger.isInsert){
                
        IPMInformationWeightageCalculationHelper.calculateAddOnInsert(trigger.new );  
    }
    
    if((trigger.isAfter && trigger.isInsert) || (trigger.isAfter && trigger.isUpdate)){
        system.debug('Inside IPM After Update');
        Boolean isUpdate = trigger.isUpdate ? true : false;
        //IPMInformationWeightageCalculationHelper.calculateHOCForStaff(trigger.newMap, trigger.oldMap, isUpdate);
    }
   
}