public class Correspondence_From_Contact_Obj {
    
    public static Map<String, String[]> addMap = new Map<String, String[]>();
    public static Map<String, String[]> removeMap = new Map<String, String[]>();
    
    public static List<CampaignMember> cMemberListToAdd = new List<CampaignMember>();
    public static List<CampaignMember> cMemberListToRemove = new List<CampaignMember>();
    
    @InvocableMethod(label='Correspondence FROM Contact Obj' description='Associates correspondence with contacts.')
    public static void associateCampaignsOnCreation(List<ID> params){
        Id contactId = null;
        
        UHGContactSOQLConstants uhgContactSQOLConstants = new UHGContactSOQLConstants();
        UHGContactConstants uhgContactConstants = new UHGContactConstants();
        
        List<CampaignMember> masterCampaignMemberList = new List<CampaignMember>();
        List<Contact> contactsListWithFields = Database.query(uhgContactSQOLConstants.QUERY_FOR_CONTACTS_DETAILS);
        
        
        for(Contact con : contactsListWithFields){
            System.debug('con.Correspondence_Previous__c--->>'+con.Correspondence_Previous__c);
            if(con.Correspondence_Previous__c == null){
                generalFunction(con.Id, 'insert', con);
            }/*else{
                generalFunction(con.Id, 'update', con);
            }*/
        }
        
        String[] campaignStatus = new List<String>{uhgContactConstants.PLANNED,uhgContactConstants.INPROGRESS};
            
            System.debug('addMap -->>'+addMap.keySet());
          /*  for(String addMapKey :  addMap.keySet()){
                List<Campaign> campaingsList = Database.query(uhgContactSQOLConstants.QUERY_FOR_CAMPAIGNS_TO_ADD) ;
                if(campaingsList.size() != 0){
                    for(Campaign c : campaingsList){
                        String[] contactIds = addMap.get(addMapKey);
                        System.debug('In add contactIds-->>'+contactIds);
                        for(String cId : contactIds){
                            CampaignMember cm = new CampaignMember(CampaignId = c.Id, ContactId = cId);
                            cMemberListToAdd.add(cm);    
                        }
                    }
                }
            }*/
        
        System.debug('removeMap -->>'+removeMap.keySet());
      /*  for(String removeMapKey :  removeMap.keySet()){
            List<Campaign> campaingsList1 = Database.query(uhgContactSQOLConstants.QUERY_FOR_CAMPAIGNS_TO_REMOVE);
            if(campaingsList1.size() != 0){
                for(Campaign c : campaingsList1){
                    String[] contactIds = removeMap.get(removeMapKey);
                    
                    List<CampaignMember> cm = [SELECT Id FROM CampaignMember WHERE CampaignId = :c.Id AND ContactId IN :contactIds];
                    cMemberListToRemove.addAll(cm);
                }
            }
        } */
        
        System.debug('cMemberListToAdd-->>'+cMemberListToAdd);
        
      /*  if(!cMemberListToAdd.isEmpty()){
            Database.SaveResult[] lsr = Database.insert(cMemberListToAdd, false);
            
            for (Database.SaveResult sr : lsr) {
                if (sr.isSuccess()) {
                    System.debug('Successfully inserted record. Record ID: ' + sr.getId());
                }
                else {
                    for(Database.Error err : sr.getErrors()) {
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        System.debug('Fields that affected this error: ' + err.getFields());
                    }
                }
            }
        } */
        
        
        System.debug('cMemberListToRemove-->>'+cMemberListToRemove);
       /* if(!cMemberListToRemove.isEmpty())
            delete cMemberListToRemove; */
     
        System.debug('contactsListWithFields-->>'+contactsListWithFields);
        if(!contactsListWithFields.isEmpty())
            update contactsListWithFields;
        
    }
    
    public static void generalFunction(Id contactId, String operation, Contact contactRecord){
        List<CampaignMember> campaignMemberList = new List<CampaignMember>();
        if(operation.equalsIgnoreCase('insert')){
            System.debug('insert operation');
            String[] contactCorrespondenceTypes = new List<String>();
            
            if(contactRecord.Correspondence_type__c != null){
                contactCorrespondenceTypes = contactRecord.Correspondence_type__c.split(';');
            }
            
            System.debug('contactId-->>'+contactId+'--contactCorrespondenceTypes-->>'+contactCorrespondenceTypes);
            //associateContacts(contactId, contactCorrespondenceTypes);
            
            for(String corrType : contactCorrespondenceTypes){
                    if(addMap.containsKey(corrType)){
                        List<String> idArray = addMap.get(corrType);
                        idArray.add(contactId);
                        addMap.put(corrType, idArray);
                    }else{
                        List<String> idArray = new List<String>();
                        idArray.add(contactId);
                        addMap.put(corrType, idArray);
                    }
                }
            contactRecord.Correspondence_Previous__c = contactRecord.Correspondence_type__c;
            
        }
        
        if(operation.equalsIgnoreCase('update')){
            System.debug('update operation');
            String[] updatedCorrespondenceTypes = new List<String>();
            String[] earlierCorrespondenceTypes = new List<String>();
            
            if(contactRecord.Correspondence_type__c != null){
                updatedCorrespondenceTypes = contactRecord.Correspondence_type__c.split(';');    
            }
            if(contactRecord.Correspondence_Previous__c != null){
                earlierCorrespondenceTypes = contactRecord.Correspondence_Previous__c.split(';');    
            }
            
            System.debug('updatedCorrespondenceTypes-->>'+updatedCorrespondenceTypes);
            System.debug('earlierCorrespondenceTypes-->>'+earlierCorrespondenceTypes);
            
            String[] typeToDelete = new List<String>();
            String[] typeToCreate = new List<String>();
            
            if(updatedCorrespondenceTypes.size() > earlierCorrespondenceTypes.size()){
                for(Integer i=0; i<updatedCorrespondenceTypes.size(); i++){
                    boolean valueExits = false;
                    for(Integer j=0; j<earlierCorrespondenceTypes.size(); j++){
                        valueExits = false;
                       /* if(updatedCorrespondenceTypes[i].equals(earlierCorrespondenceTypes[j])){
                            valueExits = true;
                            earlierCorrespondenceTypes.remove(j);
                            break;
                        } */
                    }
                    if(!valueExits){
                        typeToCreate.add(updatedCorrespondenceTypes[i]);
                    }
                }
                
                System.debug('typeToCreate-->>'+typeToCreate);
                System.debug('earlierCorrespondenceTypes-->>'+earlierCorrespondenceTypes);    
                
               /* for(String corrType : typeToCreate){
                    if(addMap.containsKey(corrType)){
                        List<String> idArray = addMap.get(corrType);
                        idArray.add(contactId);
                        addMap.put(corrType, idArray);
                    }else{
                        List<String> idArray = new List<String>();
                        idArray.add(contactId);
                        addMap.put(corrType, idArray);
                    }
                } */
                
               /* if(!earlierCorrespondenceTypes.isEmpty()){
                    for(String corrType : earlierCorrespondenceTypes){
                        if(removeMap.containsKey(corrType)){
                            List<String> idArray = removeMap.get(corrType);
                            idArray.add(contactId);
                            removeMap.put(corrType, idArray);
                        }else{
                            List<String> idArray = new List<String>();
                            idArray.add(contactId);
                            removeMap.put(corrType, idArray);
                        }
                    }    
                } */
                
                
                /*if(earlierCorrespondenceTypes != null){
boolean deassociationSuccess = deAssociateContacts(contactId, earlierCorrespondenceTypes);	//For De-associating contacts    
}        

if(typeToCreate != null){
List<CampaignMember> associationSuccess = associateContacts(contactId, typeToCreate);	//For Associating contacts   
}*/
                
            }
            else{
               /* for(Integer i=0; i<earlierCorrespondenceTypes.size(); i++){
                    boolean valueExists = false;
                    for(Integer j=0; j<updatedCorrespondenceTypes.size(); j++){
                        if(earlierCorrespondenceTypes[i].equals(updatedCorrespondenceTypes[j])){
                            valueExists = true;
                            updatedCorrespondenceTypes.remove(j);
                            break;
                        }
                    }
                    if(!valueExists){
                        typeToDelete.add(earlierCorrespondenceTypes[i]);
                    }
                }*/
                
                System.debug('typeToDelete-->>'+typeToDelete);
                System.debug('updatedCorrespondenceTypes-->>'+updatedCorrespondenceTypes);            
                
              /*  for(String corrType : updatedCorrespondenceTypes){
                    if(addMap.containsKey(corrType)){
                        List<String> idArray = addMap.get(corrType);
                        idArray.add(contactId);
                        addMap.put(corrType, idArray);
                    }else{
                        List<String> idArray = new List<String>();
                        idArray.add(contactId);
                        addMap.put(corrType, idArray);
                    }
                }
                
                for(String corrType : typeToDelete){
                    if(removeMap.containsKey(corrType)){
                        List<String> idArray = removeMap.get(corrType);
                        idArray.add(contactId);
                        removeMap.put(corrType, idArray);
                    }else{
                        List<String> idArray = new List<String>();
                        idArray.add(contactId);
                        removeMap.put(corrType, idArray);
                    }
                }*/
                
                /*if(typeToDelete != null){
boolean deassociationSuccess = deAssociateContacts(contactId, typeToDelete);	//For De-associating contacts    
}        

if(updatedCorrespondenceTypes != null){
List<CampaignMember> associationSuccess = associateContacts(contactId, updatedCorrespondenceTypes);	//For Associating contacts   
}*/
                
            }
            
            System.debug('addMap-->>'+addMap);
            System.debug('removeMap-->>'+removeMap);
            
            contactRecord.Correspondence_Previous__c = contactRecord.Correspondence_type__c;
            
            //update contactRecord;
        }
        
        // return campaignMemberList;
    }
    
    public static boolean deAssociateContacts(Id contactId, String[] earlierCorrespondenceTypes){
        boolean deleteSuccess = true;
        String campaignStatus = 'Planned';
        List<Campaign> campaingsList = new List<Campaign>();
        List<CampaignMember> cMemberList = new List<CampaignMember>();
        Database.DeleteResult[] deleteResults = null;
        
        campaingsList = [SELECT Id, Name FROM Campaign WHERE /*Correspondence_Type__c IN :earlierCorrespondenceTypes AND*/ Status =: campaignStatus];
        Set<Id> campiagnIds = new Set<Id>();
        System.debug('campaingsList-->>'+campaingsList);
        if(campaingsList.size() != 0){
            for(Campaign c : campaingsList){
                campiagnIds.add(c.Id);
            }
        }
        
        cMemberList = [SELECT Id FROM CampaignMember WHERE ContactId =: contactId AND CampaignId IN :campiagnIds];
        
        deleteResults = Database.delete(cMemberList, false);
        if(!deleteResults.isEmpty()){
            deleteSuccess = deleteResults[0].isSuccess();
            System.debug('deleteSuccess-->>'+deleteSuccess); 
            
            if(deleteResults != null && deleteResults.size() > 0){
                for(Database.DeleteResult campaignMember : deleteResults){
                    if(!campaignMember.isSuccess()){
                        String errMsg = '';
                        String errStatusCode = '';
                        for(Database.Error err : campaignMember.getErrors()){
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ':' + err.getMessage());
                            System.debug('Fields that affected this error: ' + err.getFields());
                            errMsg = errMsg+err.getMessage();
                        }                                    
                    }
                }
            }
        }
        
        
        return deleteSuccess;
    }
    
    public static List<CampaignMember> associateContacts(Id contactId, String[] updatedCorrespondenceTypes){
        boolean createSuccess = true;
        String[] campaignStatus = new List<String>{'Planned','In Progress'};
            List<Campaign> campaingsList = new List<Campaign>();
        List<CampaignMember> cMemberList = new List<CampaignMember>();
        campaingsList = [SELECT Id FROM Campaign WHERE /*Correspondence_Type__c IN : updatedCorrespondenceTypes AND */Status IN :campaignStatus];
        System.debug('campaingsList-->>'+campaingsList);
        if(campaingsList.size() != 0){
            for(Campaign c : campaingsList){
                CampaignMember cm = new CampaignMember(CampaignId = c.Id, ContactId = contactId);
                cMemberList.add(cm);
            }
        }

        if(cMemberList != null){
            Database.SaveResult[] lsr = Database.insert(cMemberList, false);
            
            for (Database.SaveResult sr : lsr) {
                if (sr.isSuccess()) {
                    System.debug('Successfully inserted record. Record ID: ' + sr.getId());
                }
                else {
                    for(Database.Error err : sr.getErrors()) {
                        createSuccess = false;
                        System.debug('The following error has occurred.');                    
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        System.debug('Fields that affected this error: ' + err.getFields());
                    }
                }
                
                //insert cMemberList;
            }
        }
        return cMemberList;
    }

}