public class SoldCaseCheckListTriggerHelper {
    public static void createAuditRecord(Map<Id, SObject> oldMap,Map<Id, SObject> newMap){
        try{
            Map<String, Schema.SObjectField> mapFields 	= Schema.SObjectType.Sold_Case_Checklist__c.fields.getMap();
            List<Audit_Trail__c> auditLst 				= new List<Audit_Trail__c>(); 
            List<Audit_Trail__c> lookupAuditforInsert 	= new List<Audit_Trail__c>();
            Set<String> ipmUserIds	 					= new Set<String>();
            List<Opportunity> updateIpmOppList          = new List<Opportunity>();
            
            for(SObject objSoldCase:newMap.values()){
                for (String fieldApiName : mapFields.keyset()){
                    if((String.valueOf(objSoldCase.get(fieldApiName)) != String.valueOf(oldMap.get(objSoldCase.Id).get(fieldApiName)))
                       && mapFields.get(fieldApiName).getDescribe().isUpdateable()
                      ){
                          Id recordId = String.valueOf(objSoldCase.get('Id'));
                          String dataType   = String.valueOf( mapFields.get(fieldApiName).getDescribe().getType());
                          String label 		= String.valueOf( mapFields.get(fieldApiName).getDescribe().getLabel());
                          
						  String newValue = String.valueOf(objSoldCase.get(mapFields.get(fieldApiName)));
                          String oldValue = String.valueOf(oldMap.get(recordId).get(fieldApiName));
                          if(dataType == 'MULTIPICKLIST'){
                              newValue = newValue.replace(',', ';');
                          }
                          //-----SAMARTH - To change date format 09-Feb-2023-----
                          if(fieldApiName == 'first_renewal_date__c'){
                              Date tempDateNew = Date.valueOf(newValue);
                              newValue = tempDateNew.format();
                              
                              Date tempDateOld = Date.valueOf(oldValue);
                              oldValue = tempDateOld.format();
                          }
                          
                           if(fieldApiName == 'IPM__c'){
                              Opportunity opp = new Opportunity();
                              opp.Id = String.valueOf(objSoldCase.get('Membership_Activity__c'));
                              opp.IPM__c = String.valueOf(objSoldCase.get(fieldApiName));
                              updateIpmOppList.add(opp);
                          }
                          //-----SAMARTH - To change date format 09-Feb-2023-----

                          Audit_Trail__c auditInstance 			= new Audit_Trail__c();
                          auditInstance.Field__c 				= label;
                          auditInstance.Membership_Activity__c 	= String.valueOf(objSoldCase.get('Membership_Activity__c'));
                          auditInstance.New_Value__c 			= newValue;
                          auditInstance.Original_Value__c 		= oldValue;
                          auditInstance.User__c 				= String.valueOf(objSoldCase.get('LastModifiedById'));
                          auditInstance.Event__c 				= 'Field Change';
                          if(fieldApiName == 'IPM__c'){
                              ipmUserIds.add(auditInstance.New_Value__c);
                              ipmUserIds.add(auditInstance.Original_Value__c);
                              lookupAuditforInsert.add(auditInstance);
                          }else{
                              auditLst.add(auditInstance);
                          }
                      }
                } 
            }
            
            if(updateIpmOppList.size() > 0){
                update updateIpmOppList;
            }
            
            if(ipmUserIds.size() > 0){
                Map<Id, User> mpUser = new Map<Id, User>([SELECT Id, Name FROM User WHERE Id IN:ipmUserIds ]);
                for(Audit_Trail__c auditInstance :lookupAuditforInsert){
                    auditInstance.New_Value__c 		=  mpUser.get(auditInstance.New_Value__c).Name;
                    auditInstance.Original_Value__c =  mpUser.get(auditInstance.Original_Value__c).Name;
                }
                auditLst.addAll(lookupAuditforInsert);
            }
            
            if(auditLst.size() > 0){
                Database.SaveResult[] saveResult = Database.insert(auditLst, false);
                for(Database.SaveResult result: saveResult){
                    if(!result.IsSuccess()){
                        system.debug('@@@'+result);
                    }
                    
                }
            }
            
           
        }catch(Exception ex){
            System.debug('Execption'+ex);
        }
    }
    
    
}