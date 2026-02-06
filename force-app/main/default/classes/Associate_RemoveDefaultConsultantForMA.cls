public class Associate_RemoveDefaultConsultantForMA {
    
    public class MyInvocableVariable {
        
        @InvocableVariable(label='Id' )
        public Id recId;
        
        @InvocableVariable(label='Old Value' )
        public String oldVal;
        
        @InvocableVariable(label='Current Value')
        public String currVal;
        
        @InvocableVariable(label='IS New')
        public String isNew;
        
        @InvocableVariable(label='Account Id')
        public String accId;
    }
    
    @InvocableMethod(label='Associate/Remove Default Consultant For MA' description='1. On creation of new MA -> If the value of "Does this Oppty\Risk Involve Consultant" is No, then associate the "UHC - Direct, No Consultant" to the MA. 2. On change of value in Does this Oppty\Risk Involve Consultant from No to Yes/TBD, then delete the "UHC - Direct, No Consultant" Consultant.')
    public static void associateOrRemoveConsultant(List<MyInvocableVariable> myInvocableVariableList) {
        
        if(myInvocableVariableList != null && myInvocableVariableList.size() > 0) {
            MyInvocableVariable myInvocableVariable = myInvocableVariableList[0];
            if(myInvocableVariable != null) {
                
                String isOppNew = (myInvocableVariable.isNew != null) ? myInvocableVariable.isNew : '';
                Id oppId = myInvocableVariable.recId;
                String doesThisOpptyInvolveConsultantVal = myInvocableVariable.currVal;
                String accountId = (myInvocableVariable.accId != null) ? myInvocableVariable.accId : '';
                System.debug('oppId' +oppId+'doesThisOpptyInvolveConsultantVal'+doesThisOpptyInvolveConsultantVal+'accountId'+ accountId);
                
                if(isOppNew != '' && oppId != null) {
                    
                    String defaultConsultantName = System.Label.No_Consultant_Name;
                    defaultConsultantName = (defaultConsultantName != null) ? defaultConsultantName : '';        
                    System.debug('defaultConsultantName->'+defaultConsultantName);                                
                    List<Contact> defaultConsultantList =  [SELECT Id,Name,Type__c,RecordType.Name FROM Contact WHERE Contact.Status__c = 'Active' AND Name =: System.Label.No_Consultant_Name AND RecordType.Name = 'Consultant' LIMIT 1];
                    
                    if(isOppNew == 'True') {
                        
                        if(doesThisOpptyInvolveConsultantVal == 'No' && defaultConsultantList != null && defaultConsultantList.size() > 0) {
                            
                            List<String> consultantIdsList = new List<String>();
                            consultantIdsList.add(defaultConsultantList[0].Id);
                            Membership_QA_Controller.saveOpportunityContacts(oppId, consultantIdsList, accountId, true);
                        }
                        
                    } else if(isOppNew == 'False') {
                        
                        String doesThisOpptyInvolveConsultantOldVal = myInvocableVariable.oldVal;
                        doesThisOpptyInvolveConsultantOldVal = (doesThisOpptyInvolveConsultantOldVal != null) ? doesThisOpptyInvolveConsultantOldVal : '';
                        
                        if(doesThisOpptyInvolveConsultantOldVal == 'No' && (doesThisOpptyInvolveConsultantVal == 'Yes' || 
								doesThisOpptyInvolveConsultantVal == 'TBD') && defaultConsultantList != null && defaultConsultantList.size() > 0) {
                                                        
                            List<OpportunityContactRole> oppContactRoleList = [SELECT Id, ContactId FROM OpportunityContactRole WHERE OpportunityId =:oppId AND IsPrimary=true];
                            MA_Consultants_Class.deleteRelationship(oppId, defaultConsultantList[0].Id, '');
                            
                            if(oppContactRoleList != null && oppContactRoleList.size() > 0 && (oppContactRoleList[0].ContactId == defaultConsultantList[0].Id)) {
                                MA_Consultants_Class.updatePrimaryId(oppId, defaultConsultantList[0].Id, true, '');
                            }
                        } else if((doesThisOpptyInvolveConsultantOldVal == '' || doesThisOpptyInvolveConsultantOldVal == 'Yes' || 
										doesThisOpptyInvolveConsultantOldVal == 'TBD') && doesThisOpptyInvolveConsultantVal == 'No' && 
                                  			defaultConsultantList != null && defaultConsultantList.size() > 0) { 
                        
							List<OpportunityContactRole> oppContactsList = [SELECT Id,ContactId,IsPrimary,Contact.Name FROM OpportunityContactRole WHERE OpportunityId =:oppId];
							if(oppContactsList != null) {
                                
                                List<String> consultantIdsList = new List<String>();
                                if(oppContactsList.size() == 0) {
                                    
                                    consultantIdsList.add(defaultConsultantList[0].Id);
                                	Membership_QA_Controller.saveOpportunityContacts(oppId, consultantIdsList, accountId, true); 
                                } else if(oppContactsList.size() > 0) {
                                    
                                    Boolean isPrimaryConsultantExists = false;
                                    Boolean isUHCDirectNoConsultantExists = false;
                                    
                                    for(OpportunityContactRole oppContactObj : oppContactsList) {
                                        
                                        if(oppContactObj.IsPrimary != null && oppContactObj.IsPrimary) {
                                            isPrimaryConsultantExists = true;
                                        }
                                        if(oppContactObj.Contact.Name != null && oppContactObj.Contact.Name == System.Label.No_Consultant_Name) {
                                            isUHCDirectNoConsultantExists = true;
                                        }
                                    }
                                    
                                    if(isUHCDirectNoConsultantExists != null && isUHCDirectNoConsultantExists == false) {
                                        consultantIdsList.add(defaultConsultantList[0].Id);
                                        if(isPrimaryConsultantExists) {
                                            Membership_QA_Controller.saveOpportunityContacts(oppId, consultantIdsList, accountId, false);
                                        } else {
                                            Membership_QA_Controller.saveOpportunityContacts(oppId, consultantIdsList, accountId, true);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
        } else {
            System.debug('Input Values from the Process builder "Associate/Remove Default Consultant For MA" are not available.');
        }
        
    }
}