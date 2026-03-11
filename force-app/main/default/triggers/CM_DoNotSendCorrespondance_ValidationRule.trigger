//Validation Rule: Allowing Only Correspondence Type "Customer Survey - Primary" and "Customer Survey - Secondary" to add or remove when the "Do Not Send Correspondence" box is checked for the CM Contacts

trigger CM_DoNotSendCorrespondance_ValidationRule on Contact (before insert,before update, after update) {
    Id conRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId();
    if(Trigger.isUpdate){
        if(RecursiveTriggerHandler.isFirstTime){
            RecursiveTriggerHandler.isFirstTime = false;
            for(Contact con:trigger.new){  
                Contact conOld = trigger.oldMap.get(con.Id);
                System.debug('newCheckbox'+con.DoNotSendCorrespondence__c);
                System.debug('oldCheckbox'+conOld.DoNotSendCorrespondence__c);
                if(con.DoNotSendCorrespondence__c == true && conOld.DoNotSendCorrespondence__c == true && con.RecordTypeId == conRecordTypeId){            
                    Boolean isOtherType = false;
                    List<String> oldCorrTypes = new List<String>();
                    List<String> selectedTypes = new List<String>();
                    List<String> newList = new List<String>();
                    if(conOld.Correspondence_Type__c != null){
                        oldCorrTypes = conOld.Correspondence_Type__c.split(';');
                    }  
                    if(con.Correspondence_Type__c != null){
                        selectedTypes = con.Correspondence_Type__c.split(';');
                    }                                
                    
                    for(string newType:selectedTypes){
                        if(!oldCorrTypes.contains(newType)){
                            newList.add(newType);
                        }
                    }
                    
                    for(string oldType:oldCorrTypes){
                        if(!selectedTypes.contains(oldType)){
                            newList.add(oldType);
                        }
                    }            
                    System.debug('newList='+newList);                
                    for(string cType:newList){               
                        if(!(cType == 'Customer Survey - Primary' || cType == 'Customer Survey - Secondary')){
                            isOtherType = true;
                        }
                    } 
                    if(isOtherType){
                        con.Correspondence_Type__c.addError('Only Correspondence Type "Customer Survey - Primary" and "Customer Survey - Secondary" can be added or removed when the "Do Not Send Correspondence" box is checked');
                    }
                }      
            }
        }  
    }else if(Trigger.isInsert){
        for(Contact con:trigger.new){
            if(con.DoNotSendCorrespondence__c == true && con.RecordTypeId == conRecordTypeId){
                List<String> newList = new List<String>();
                if(con.Correspondence_Type__c != null){
                    newList = con.Correspondence_Type__c.split(';');
                }
                Boolean isOtherType = false;
                for(string cType:newList){               
                    if(!(cType == 'Customer Survey - Primary' || cType == 'Customer Survey - Secondary')){
                        isOtherType = true;
                    }
                }
                if(isOtherType){
                    con.Correspondence_Type__c.addError('Only Correspondence Type "Customer Survey - Primary" and "Customer Survey - Secondary" can be added or removed when the "Do Not Send Correspondence" box is checked');
                }
            }
        }          
    } 
    if (Trigger.isAfter && Trigger.isUpdate) {
        System.debug('inside after update');
        RecursiveTriggerHandler.afterUpdate(Trigger.new, Trigger.oldMap);
    }
}