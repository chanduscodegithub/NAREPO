/****************************************************************************************************
Name    :  Disposition_Change_Audit_Trail    
Purpose :  Creates Audit trails record for the Sold case checklist when disposition changes for CD records
Author  :  Samarth Nadig                                 Date : 05/15/2020                                  

Version      Author                   Date                 Release #           Purpose   
------------------------------------------------------------------------------------------------------
1.0 -        Samarth Nadig          05/15/2020      	                   Initial Development             
1.1 -                       
*****************************************************************************************************/
public class Disposition_Change_Audit_Trail {
    public class MyInvocableVariable {
        @InvocableVariable(label='Id')
        public Id recId;
        
        @InvocableVariable(label='Old Value')
        public String oldVal;
        
        @InvocableVariable(label='Medical Value')
        public String medVal;
        
        @InvocableVariable(label='Dental Value')
        public String dentVal;
        
        @InvocableVariable(label='Pharmacy Value')
        public String pharmVal;
        
        @InvocableVariable(label='Vision Value')
        public String visVal;
        
        @InvocableVariable(label='Changed Field')
        public String changedField;
    }
    
    @InvocableMethod(label='Track Disposition Change' description='Tracks Disposition field value change.')
    public static void printOldAndCurrentValues(List<MyInvocableVariable> myInvocableVariableList) {
        try{
            String currentValue;
            String fieldChanged;
            
            List<Audit_Trail__c> audList = new List<Audit_Trail__c>();
            
            for(MyInvocableVariable myinvocvar : myInvocableVariableList){
                Id recordId = myinvocvar.recId;
                String disposition = myinvocvar.changedField;
                
                if(disposition == 'Disposition_Medical__c'){
                    fieldChanged = 'Disposition Medical';
                    currentValue = myinvocvar.medVal;
                }
                else if(disposition == 'Disposition_Dental__c'){
                    fieldChanged = 'Disposition Dental';
                    currentValue = myinvocvar.dentVal;
                }
                else if(disposition == 'Disposition_Pharmacy__c'){
                    fieldChanged = 'Disposition Pharmacy';
                    currentValue = myinvocvar.pharmVal;
                }
                else if(disposition == 'Disposition_Vision__c'){
                    fieldChanged = 'Disposition Vision';
                    currentValue = myinvocvar.visVal;
                }
                
                Audit_Trail__c audTrail = new Audit_Trail__c();
                audTrail.Field__c = fieldChanged;
                audTrail.User__c = UserInfo.getUserId();
                audTrail.Original_Value__c = myinvocvar.oldVal;
                audTrail.New_Value__c = currentValue;
                audTrail.Membership_Activity__c = recordId;
                audTrail.Event__c = 'Disposition Change';
                audList.add(audTrail);
            }
            
            if(audList.size()>0){
                insert audList;    
            }
            
            
        }
        catch(Exception e){
            system.debug('Exception '+e);
        }
        
    }
}