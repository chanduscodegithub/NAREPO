public without sharing class SceCMValidation {

    public static account saveSCEValidation(account accDetails){
        update accDetails;
        account returnAcc =[select id,SCE_Validation_By__r.Name,SCE_Validation_DateTime__c from account where id=:accDetails.Id];
        return returnAcc;
    }
    
    
    //Updating Client Survey SCE Validation CR-3847 -- Added
    public static void updatingServiceAMTFields(Id accId,Datetime CMCField){
        List<Service_AMT__c> allUpdatedValues = new List<Service_AMT__c>();
        List<String> finalAMTRole = new List<String>();
        List < Roles_For_AMT_SBC_Client_Survey__mdt > fetchMetaSBC =[SELECT Id, MasterLabel, AMT_Role__c, DeveloperName, Order__c FROM Roles_For_AMT_SBC_Client_Survey__mdt where active__c=true Order by Order__c ASC];
        for(Roles_For_AMT_SBC_Client_Survey__mdt each:fetchMetaSBC){
            finalAMTRole.add(each.AMT_Role__c);
        }
        List<Service_AMT__c> serviceAMTList = [SELECT Id, Contact_Role__c, Primary__c, First_Name__c, Last_Name__c, Case_Management_End_Date__c, Email__c,Case_Management_Start_Date__c
                                               FROM Service_AMT__c WHERE company__c = :accId AND ((Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= TODAY) AND Case_Management_Start_Date__c <= TODAY) WITH USER_MODE];
        for(Service_AMT__c allServiceAmt: serviceAMTList ){
            if(finalAMTRole.contains(allServiceAmt.Contact_Role__c)){
                allServiceAmt.SCE_Validated__c = true;
                allServiceAmt.Survey_Validated_Date_time__c = CMCField; 
                allUpdatedValues.add(allServiceAmt);
            }
        }
        Update as User allUpdatedValues; 
    }
    
    
    public static void updatingNATeamMemberFields(Id accId,Datetime CMCField){

        List<CM_Account_Team_History__c> allUpdatedValues = new List<CM_Account_Team_History__c>();
        List<String> finalAMTRole = new List<String>();        
        List < Roles_For_AcctTeamMembers_Section__mdt > fetchMetaSBC =[SELECT Id, MasterLabel, AMT_Role__c, DeveloperName, Order__c FROM Roles_For_AcctTeamMembers_Section__mdt where active__c=true Order by Order__c ASC];
        for(Roles_For_AcctTeamMembers_Section__mdt each:fetchMetaSBC){
            finalAMTRole.add(each.AMT_Role__c);
        }
       
        List<CM_Account_Team_History__c> NAsaleTeamList = [SELECT Id, Role__c, Case_Management_End_Date__c,Case_Management_Start_Date__c
                                               FROM CM_Account_Team_History__c WHERE Account_Firm__c = :accId AND ((Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= TODAY) AND Case_Management_Start_Date__c <= TODAY) AND (Role__c = 'CM SCE' OR Role__c = 'Specialty Benefits SCE')  WITH USER_MODE];
        
      /*  for(CM_Account_Team_History__c allNASaleRec: NAsaleTeamList ){
                    System.debug('Processing Record: ' + allNASaleRec.Id + ' with Role: ' + allNASaleRec.Role__c);

            if(finalAMTRole.contains(allNASaleRec.Role__c)){
                System.debug('inside if');
                allNASaleRec.SCE_Validated__c = true;
                allNASaleRec.Survey_Validated_Date_time__c = CMCField; 
                allUpdatedValues.add(allNASaleRec);
                            System.debug('Record added for update: ' + allNASaleRec.Id);

            }
        } */
        if(NAsaleTeamList != null && !NAsaleTeamList.isEmpty()){
        for(CM_Account_Team_History__c allNASaleRec: NAsaleTeamList ){
                allNASaleRec.SCE_Validated__c = true;
                allNASaleRec.Survey_Validated_Date_time__c = CMCField; 
                allUpdatedValues.add(allNASaleRec);
            }
        }
        Update allUpdatedValues; 
    }

    
    
    
      public static account saveCMCValidation(account accDetails){
        update accDetails;
        account returnAcc =[select id,CM_CMC_Validation_By__r.Name,CM_CMC_Validation_DateTime__c from account where id=:accDetails.Id];
        return returnAcc;
    }
}