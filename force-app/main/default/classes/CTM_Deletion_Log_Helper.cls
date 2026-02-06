public class CTM_Deletion_Log_Helper {
    
    public static void createCtmRecord(AccountTeamMember[] triggerOld){
        try{
            CTM_Log__c[] ctmList = new list<CTM_Log__c>();
            if(!triggerOld.isEmpty()){
                for(AccountTeamMember atm:triggerOld){
                    CTM_Log__c ctmLog = new CTM_Log__c();
                    ctmLog.Account__c = atm.AccountId;
                    ctmLog.Deleted_By__c = userinfo.getFirstName() +' '+ userinfo.getLastName();
                    ctmLog.Deleted_User__c = atm.UserId;
                    ctmLog.Deletion_Time__c = System.now();
                    ctmList.add(ctmLog);
                }
            }
            if(!ctmList.isEmpty()){
                insert ctmList;
            }
        }
        catch(Exception e){
            system.debug('Exception = '+e.getMessage()+' in '+e.getLineNumber());
        }
    }
}