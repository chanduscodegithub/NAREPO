/***************************************************************************************************** 
Name: Service_AMT_Class 
Copyright © 2018 CRMIT Solutions Company Inc.  
====================================================== 
======================================================
Purpose: 
====================================================== 
======================================================  
History 
------- 
VERSION      AUTHOR                 DATE                DETAIL                      FEATURES/CSR/TTP  
1.0 -        Abhishek Kumar         13/03/2018          INITIAL DEVELOPMENT           
2.0 -
******************************************************************************************************
*/

public with sharing class Service_AMT_Class {
    
    @AuraEnabled
    public static ServiceAMT_Records getServiceAMTData(Id accId, String columnName, String sortType){
        String sobjName = accId.getSObjectType().getDescribe().getName();
        String policyName = '';
        Boolean isPolicyAmt = false ;
        ServiceAMT_Records service_amt_rec = new ServiceAMT_Records();
        
        columnName = String.escapeSingleQuotes(columnName);
        sortType = String.escapeSingleQuotes(sortType);
        
        if(sobjName.equalsIgnoreCase('Policy_Information__c')){
            Policy_Information__c poliInfo = [SELECT Id, Company__c,Name FROM Policy_Information__c where Id =: accId WITH USER_MODE];
            // Added null check - Case:2216 -- START
            if(poliInfo != null){
                accId = poliInfo.Company__c;
                policyName = poliInfo.Name;
            }
            // Added null check - Case:2216 -- END
            isPolicyAmt = true;
        }
        System.debug('Input Parameters - accId-->>'+accId+' ,ColumnName-'+columnName+', SortOrder-'+sortType);
        //Set<Id> policyIdSet = new Set<Id>();
        
        service_amt_rec.PolicyAmtApplet = isPolicyAmt;
        String queryStatement = 'SELECT Id, Company__c,ACIS_Distribution__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c,Company__r.CM_SCE__r.Name,Company__r.CM_SCE__r.Phone,Company__r.CM_SCE__r.Email,Company__r.Name,Primary__c FROM Service_AMT__c WHERE Company__c=: accId  ORDER BY '+columnName +' '+sortType;
        String externalQueryStatement = 'SELECT Id, Company__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c FROM Service_AMT__c WHERE External__c = true AND Company__c=: accId AND Case_Management_End_Date__c = null AND Contact_Role__c != null ORDER BY '+columnName +' '+sortType;
        List<Service_AMT__c> serviceAMTRecords = Database.query(queryStatement);
        List<Service_AMT__c> externalServiceAMTRecords = Database.query(externalQueryStatement);
        
        system.debug('serviceAMTRecords '+serviceAMTRecords);
        system.debug('externalServiceAMTRecords '+externalServiceAMTRecords);
        
        List<Service_AMT__c> activeAMTList = new List<Service_AMT__c>();
        List<Service_AMT__c> inActiveAMTList = new List<Service_AMT__c>();
        //List<Service_AMT__c> policyAMTList = new List<Service_AMT__c>();
        
        
        
        
        
        Schema.DescribeFieldResult contactRoleFieldResult = Service_AMT__c.Contact_Role__c.getDescribe();
        List<Schema.PicklistEntry> plv2 = contactRoleFieldResult.getPicklistValues();
        
        List<Policy_Information__c> policy = new List<Policy_Information__c>();
        policy= [SELECT Id,Name,Company__c FROM Policy_Information__c where Company__c =: accId and Policy_Status__c = 'Active'];
        
        
        
        // List<Boolean> allPolicyList = new List<Boolean>();
        if(serviceAMTRecords.size() >0){
            for(Integer j=0;j<serviceAMTRecords.size();j++){
                String policyMultipicklist = serviceAMTRecords[j].Policy_Information_MultiChecKlist__c;
                if(policyMultipicklist != null && policyMultipicklist != ''){
                    String[] arrTest = policyMultipicklist.split(';');
                    if(arrTest.size()==policy.size()){
                        
                        serviceAMTRecords[j].All_Policy__c = true;
                        
                    }else{
                        
                        serviceAMTRecords[j].All_Policy__c = false;
                        
                    }
                } 
            }
        }
        
        
        List<Policy_Information__c> policyList1 = new  List<Policy_Information__c>();
        policyList1.addAll(policy);
        policy = policyList1;        
        service_amt_rec.PolicyId = policy;
        
        //service_amt_rec.roleValues2.add('');
        for( Schema.PicklistEntry f : plv2)
        {
            
            service_amt_rec.roleValues2.add(f.getValue());   
        }
        
        List<Service_AMT__c> serviceAMTRecordsFinal = new  List<Service_AMT__c>();
        List<Service_AMT__c> externalServiceAMTRecordsFinal = new  List<Service_AMT__c>();
        if(sobjName.equalsIgnoreCase('Policy_Information__c')){
            for(Integer j=0;j<serviceAMTRecords.size();j++){
                String nameofPolicy = serviceAMTRecords[j].Policy_Information_MultiChecKlist__c;
                List<String> policyNamesList = new List<String>();
                if(nameofPolicy != null) {
                    policyNamesList = nameofPolicy.split(';');   
                }
                if(policyNamesList != null && policyNamesList.contains(policyName)){
                    serviceAMTRecordsFinal.add(serviceAMTRecords[j]);
                }
            }
            for(Integer j=0;j<externalServiceAMTRecords.size();j++){
                String nameofPolicy = externalServiceAMTRecords[j].Policy_Information_MultiChecKlist__c;
                List<String> policyNamesList = new List<String>();               
                if(policyNamesList != null) {
                    policyNamesList = nameofPolicy.split(';');   
                }
                if(policyNamesList != null && policyNamesList.contains(policyName)){
                    externalServiceAMTRecordsFinal.add(externalServiceAMTRecords[j]);
                }
            }
            
        }else{
            
            serviceAMTRecordsFinal = serviceAMTRecords;
            externalServiceAMTRecordsFinal = externalServiceAMTRecordsFinal;
            
        }
        
        if(serviceAMTRecordsFinal.size() >0){
            for(Integer i=0;i<serviceAMTRecordsFinal.size();i++){
                if(serviceAMTRecordsFinal[i].Case_Management_End_Date__c >= System.today() || serviceAMTRecordsFinal[i].Case_Management_End_Date__c == null){
                    activeAMTList.add(serviceAMTRecordsFinal[i]); 
                }
                if(serviceAMTRecordsFinal[i].Case_Management_End_Date__c < System.today()){
                    inActiveAMTList.add(serviceAMTRecordsFinal[i]);
                }
                
            }
        }
        
        service_amt_rec.externalServiceAMTRecords = externalServiceAMTRecordsFinal;
        
        //------------------------------------------------------SAMARTH------------------------------------------------------
        String activeAMTListQuery = 'SELECT Id, Company__c,ACIS_Distribution__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c,Company__r.CM_SCE__r.Name,Company__r.CM_SCE__r.Phone,Company__r.CM_SCE__r.Email,Company__r.Name, Company__r.RecordTypeId, Company__r.Test_Type__c,Primary__c FROM Service_AMT__c WHERE ID IN:activeAMTList AND Company__c=: accId  ORDER BY '+columnName +' '+sortType;
        List<Service_AMT__c> activeAMTListFinal = new List<Service_AMT__c>();
        system.debug('activeAMTListQuery----'+activeAMTListQuery);
        activeAMTListFinal = Database.query(activeAMTListQuery);
        
        service_amt_rec.activeAMTList = activeAMTListFinal;
        
        String inActiveAMTListQuery = 'SELECT Id, Company__c,ACIS_Distribution__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c FROM Service_AMT__c WHERE ID IN:inActiveAMTList AND Company__c=: accId  ORDER BY '+columnName +' '+sortType;
        List<Service_AMT__c> inActiveAMTListFinal = new List<Service_AMT__c>();
        inActiveAMTListFinal = Database.query(inActiveAMTListQuery);
        service_amt_rec.inActiveAMTList = inActiveAMTListFinal;
        //------------------------------------------------------SAMARTH------------------------------------------------------
        
        
        return service_amt_rec;
    }
    
    //-------------------------------------------------------------------------------------------------------------------------------------//   
    
    @AuraEnabled
    public static ServiceAMT_Records getServiceAMTDataOnload(Id accId, String columnName, String sortType){
        String sobjName = accId.getSObjectType().getDescribe().getName();
        String policyName = '';
        Boolean isPolicyAmt = false ;
        
        ServiceAMT_Records service_amt_rec = new ServiceAMT_Records();
        
        columnName = String.escapeSingleQuotes(columnName);
        sortType = String.escapeSingleQuotes(sortType);
        
        if(sobjName.equalsIgnoreCase('Policy_Information__c')){
            Policy_Information__c poliInfo = [SELECT Id, Company__c,Name FROM Policy_Information__c where Id =: accId WITH USER_MODE] ;
            // Added null check - Case:2216 -- START
            if(poliInfo != null){
                accId = poliInfo.Company__c;
                policyName = poliInfo.Name;
            }
            // Added null check - Case:2216 -- END
            isPolicyAmt = true;
        }
        System.debug('Input Parameters - accId-->>'+accId+' ,ColumnName-'+columnName+', SortOrder-'+sortType);
        //Set<Id> policyIdSet = new Set<Id>();
        
        service_amt_rec.PolicyAmtApplet = isPolicyAmt;
        String queryStatement = 'SELECT Id, Company__c,ACIS_Distribution__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c,Company__r.CM_SCE__r.Name,Company__r.CM_SCE__r.Phone,Company__r.CM_SCE__r.Email,Company__r.Name,Company__r.RecordTypeId, Company__r.Test_Type__c,Primary__c FROM Service_AMT__c WHERE Company__c=: accId  ORDER BY '+columnName +' '+sortType;
        String externalQueryStatement = 'SELECT Id, Company__c,ACIS_Distribution__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c FROM Service_AMT__c WHERE External__c = true AND Company__c=: accId AND (Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= Today)  AND Contact_Role__c != null ORDER BY '+columnName +' '+sortType;
        List<Service_AMT__c> serviceAMTRecords = Database.query(queryStatement);
        List<Service_AMT__c> externalServiceAMTRecords = Database.query(externalQueryStatement); 
        
        List<Service_AMT__c> activeAMTList = new List<Service_AMT__c>();
        List<Service_AMT__c> inActiveAMTList = new List<Service_AMT__c>();
        // List<Service_AMT__c> policyAMTList = new List<Service_AMT__c>();
        
        
        
        
        
        Schema.DescribeFieldResult contactRoleFieldResult = Service_AMT__c.Contact_Role__c.getDescribe();
        List<Schema.PicklistEntry> plv2 = contactRoleFieldResult.getPicklistValues();
        
        List<Policy_Information__c> policy = new List<Policy_Information__c>();
        policy= [SELECT Id,Name,Company__c FROM Policy_Information__c where Company__c =: accId and Policy_Status__c = 'Active' WITH USER_MODE];
        
        //List<Boolean> allPolicyList = new List<Boolean>();
        if(serviceAMTRecords.size() >0){
            for(Integer j=0;j<serviceAMTRecords.size();j++){
                String policyMultipicklist = serviceAMTRecords[j].Policy_Information_MultiChecKlist__c;
                if(policyMultipicklist != null && policyMultipicklist != ''){
                    String[] arrTest = policyMultipicklist.split(';');
                    if(arrTest.size()==policy.size()){
                        
                        serviceAMTRecords[j].All_Policy__c = true;
                        
                    }else{
                        
                        serviceAMTRecords[j].All_Policy__c = false;
                        
                    }
                } 
            }
        }
        
        List<Policy_Information__c> policyList1 = new  List<Policy_Information__c>();
        policyList1.addAll(policy);
        policy = policyList1;        
        service_amt_rec.PolicyId = policy;
        
        //service_amt_rec.roleValues2.add('');
        for( Schema.PicklistEntry f : plv2)
        {
            
            service_amt_rec.roleValues2.add(f.getValue());   
        }
        
        List<Service_AMT__c> serviceAMTRecordsFinal = new  List<Service_AMT__c>();
        List<Service_AMT__c> externalServiceAMTRecordsFinal = new  List<Service_AMT__c>();
        system.debug('sobjName'+sobjName);
        if(sobjName.equalsIgnoreCase('Policy_Information__c')){
            //system.debug('serviceAMTRecords.size()---'+serviceAMTRecords.size());
            for(Integer j=0;j<serviceAMTRecords.size();j++){
                String nameofPolicy = serviceAMTRecords[j].Policy_Information_MultiChecKlist__c;
                List<String> policyNamesList = new List<String>();
                if(nameofPolicy != null) {
                    policyNamesList = nameofPolicy.split(';');   
                }
                if(policyNamesList.size() > 0 && policyNamesList.contains(policyName)){
                    serviceAMTRecordsFinal.add(serviceAMTRecords[j]);
                }
            }
            for(Integer j=0;j<externalServiceAMTRecords.size();j++){
                String nameofPolicy = externalServiceAMTRecords[j].Policy_Information_MultiChecKlist__c;
                List<String> policyNamesList = new List<String>();               
                /*if(policyNamesList.size() > 0) {
policyNamesList = nameofPolicy.split(';');   
}*/
                if(nameofPolicy!=null) {
                    policyNamesList = nameofPolicy.split(';');   
                }
                if(policyNamesList.size() > 0 && policyNamesList.contains(policyName)){
                    externalServiceAMTRecordsFinal.add(externalServiceAMTRecords[j]);
                }
                system.debug('policyNamesList'+policyNamesList);
            }
            
        }else{
            
            serviceAMTRecordsFinal = serviceAMTRecords;
            externalServiceAMTRecordsFinal = externalServiceAMTRecordsFinal;
            
        }
        
        if(serviceAMTRecordsFinal.size() >0){
            for(Integer i=0;i<serviceAMTRecordsFinal.size();i++){
                if(serviceAMTRecordsFinal[i].Case_Management_End_Date__c >= System.today() || serviceAMTRecordsFinal[i].Case_Management_End_Date__c == null){
                    activeAMTList.add(serviceAMTRecordsFinal[i]); 
                }
                if(serviceAMTRecordsFinal[i].Case_Management_End_Date__c < System.today()){
                    inActiveAMTList.add(serviceAMTRecordsFinal[i]);
                }
                
            }
        }
        
        service_amt_rec.externalServiceAMTRecords = externalServiceAMTRecordsFinal;
        List<Service_AMT__c> activeAMTListWithRole = new List<Service_AMT__c>();
        List<Service_AMT__c> activeAMTListWithOutRole = new List<Service_AMT__c>();
        
        if(activeAMTList.size() >0){
            for(Integer i=0;i<activeAMTList.size();i++){
                if(activeAMTList[i].Contact_Role__c == 'Unassigned'){
                    activeAMTListWithOutRole.add(activeAMTList[i]); 
                }else{
                    activeAMTListWithRole.add(activeAMTList[i]);
                }
                
            }
        }
        system.debug('activeAMTListWithRole--'+activeAMTListWithRole);
        system.debug('activeAMTListWithOutRole--'+activeAMTListWithOutRole);
        List<Service_AMT__c> activeAMTListWithRoleAsc = new List<Service_AMT__c>();
        List<Service_AMT__c> activeAMTListWithOutRoleAsc = new List<Service_AMT__c>(); 
        Map<Id,Service_AMT__c> mapIdandObject = new  Map<Id,Service_AMT__c>();
        if(activeAMTListWithRole.size() >0){
            for(Integer i=0;i<activeAMTListWithRole.size();i++){
                Service_AMT__c serviceAmt = new Service_AMT__c();                
                serviceAmt.Id = activeAMTListWithRole[i].Id;
                serviceAmt.Last_Name__c = activeAMTListWithRole[i].Last_Name__c;
                activeAMTListWithRoleAsc.add(serviceAmt); 
                mapIdandObject.put(activeAMTListWithRole[i].Id,activeAMTListWithRole[i]);               
            }
        }
        
        
        if(activeAMTListWithOutRole.size() >0){
            for(Integer i=0;i<activeAMTListWithOutRole.size();i++){
                
                Service_AMT__c serviceAmt = new Service_AMT__c();               
                serviceAmt.Id = activeAMTListWithOutRole[i].Id;
                serviceAmt.Last_Name__c = activeAMTListWithOutRole[i].Last_Name__c;
                activeAMTListWithOutRoleAsc.add(serviceAmt); 
                mapIdandObject.put(activeAMTListWithOutRole[i].Id,activeAMTListWithOutRole[i]);                
            }
        }
        
        system.debug('activeAMTListWithRoleAsc--'+activeAMTListWithRoleAsc);
        system.debug('activeAMTListWithOutRoleAsc--'+activeAMTListWithOutRoleAsc);
        if(activeAMTListWithRoleAsc.size() >0){
            activeAMTListWithRoleAsc.sort();
        }
        
        if(activeAMTListWithOutRoleAsc.size() >0){
            activeAMTListWithOutRoleAsc.sort();
        }
        system.debug('activeAMTListWithRoleAsc2--'+activeAMTListWithRoleAsc);
        system.debug('activeAMTListWithOutRoleAsc2--'+activeAMTListWithOutRoleAsc);
        List<Service_AMT__c> activeAMTListFinal = new List<Service_AMT__c>();
        if((activeAMTListWithRoleAsc.size() >0) ){
            for(Integer i=0;i<activeAMTListWithRoleAsc.size();i++){                
                activeAMTListFinal.add( mapIdandObject.get(activeAMTListWithRoleAsc[i].Id));
            }            
        }
        if((activeAMTListWithOutRoleAsc.size() >0) ){
            for(Integer i=0;i<activeAMTListWithOutRoleAsc.size();i++){                
                activeAMTListFinal.add( mapIdandObject.get(activeAMTListWithOutRoleAsc[i].Id));
            }            
        }
        
        system.debug('activeAMTListFinal---'+activeAMTListFinal);
        
        //------------------------------------------------------SAMARTH------------------------------------------------------
        // String activeAMTListQuery = 'SELECT Id, Company__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c,Company__r.CM_SCE__r.Name,Company__r.CM_SCE__r.Phone,Company__r.CM_SCE__r.Email,Company__r.Name FROM Service_AMT__c WHERE ID IN:activeAMTList AND Company__c=: accId  ORDER BY '+columnName +' '+sortType;
        
        // activeAMTListFinal = Database.query(activeAMTListQuery);
        
        
        service_amt_rec.activeAMTList = activeAMTListFinal;
        
        List<Service_AMT__c> inActiveAMTListWithRole = new List<Service_AMT__c>();
        List<Service_AMT__c> inActiveAMTListWithOutRole = new List<Service_AMT__c>();
        
        if(inActiveAMTList.size() >0){
            for(Integer i=0;i<inActiveAMTList.size();i++){
                if(inActiveAMTList[i].Contact_Role__c == 'Unassigned'){
                    inActiveAMTListWithOutRole.add(inActiveAMTList[i]); 
                }else{
                    inActiveAMTListWithRole.add(inActiveAMTList[i]);
                }
                
            }
        }
        system.debug('inActiveAMTListWithRole--'+inActiveAMTListWithRole);
        system.debug('inActiveAMTListWithOutRole--'+inActiveAMTListWithOutRole);
        List<Service_AMT__c> inActiveAMTListWithRoleAsc = new List<Service_AMT__c>();
        List<Service_AMT__c> inActiveAMTListWithOutRoleAsc = new List<Service_AMT__c>(); 
        
        if(inActiveAMTListWithRole.size() >0){
            for(Integer i=0;i<inActiveAMTListWithRole.size();i++){
                Service_AMT__c serviceAmt = new Service_AMT__c();                
                serviceAmt.Id = inActiveAMTListWithRole[i].Id;
                serviceAmt.Last_Name__c = inActiveAMTListWithRole[i].Last_Name__c;
                inActiveAMTListWithRoleAsc.add(serviceAmt); 
                mapIdandObject.put(inActiveAMTListWithRole[i].Id,inActiveAMTListWithRole[i]);               
            }
        }
        
        
        if(inActiveAMTListWithOutRole.size() >0){
            for(Integer i=0;i<inActiveAMTListWithOutRole.size();i++){
                
                Service_AMT__c serviceAmt = new Service_AMT__c();               
                serviceAmt.Id = inActiveAMTListWithOutRole[i].Id;
                serviceAmt.Last_Name__c = inActiveAMTListWithOutRole[i].Last_Name__c;
                inActiveAMTListWithOutRoleAsc.add(serviceAmt); 
                mapIdandObject.put(inActiveAMTListWithOutRole[i].Id,inActiveAMTListWithOutRole[i]);                
            }
        }
        
        system.debug('inActiveAMTListWithRoleAsc--'+inActiveAMTListWithRoleAsc);
        system.debug('inActiveAMTListWithOutRoleAsc--'+inActiveAMTListWithOutRoleAsc);
        if(inActiveAMTListWithRoleAsc.size() >0){
            inActiveAMTListWithRoleAsc.sort();
        }
        
        if(inActiveAMTListWithOutRoleAsc.size() >0){
            inActiveAMTListWithOutRoleAsc.sort();
        }
        system.debug('inActiveAMTListWithRoleAsc2--'+inActiveAMTListWithRoleAsc);
        system.debug('inActiveAMTListWithOutRoleAsc2--'+inActiveAMTListWithOutRoleAsc);
        List<Service_AMT__c> inActiveAMTListFinal = new List<Service_AMT__c>();
        if((inActiveAMTListWithRoleAsc.size() >0) ){
            for(Integer i=0;i<inActiveAMTListWithRoleAsc.size();i++){                
                inActiveAMTListFinal.add( mapIdandObject.get(inActiveAMTListWithRoleAsc[i].Id));
            }            
        }
        if((inActiveAMTListWithOutRoleAsc.size() >0) ){
            for(Integer i=0;i<inActiveAMTListWithOutRoleAsc.size();i++){                
                inActiveAMTListFinal.add( mapIdandObject.get(inActiveAMTListWithOutRoleAsc[i].Id));
            }            
        }
        
        system.debug('inActiveAMTListFinal---'+inActiveAMTListFinal);
        
        //------------------------------------------------------SAMARTH------------------------------------------------------
        // String activeAMTListQuery = 'SELECT Id, Company__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c,Company__r.CM_SCE__r.Name,Company__r.CM_SCE__r.Phone,Company__r.CM_SCE__r.Email,Company__r.Name FROM Service_AMT__c WHERE ID IN:activeAMTList AND Company__c=: accId  ORDER BY '+columnName +' '+sortType;
        
        // activeAMTListFinal = Database.query(activeAMTListQuery);
        
        
        service_amt_rec.activeAMTList = activeAMTListFinal;
        
        //String inActiveAMTListQuery = 'SELECT Id, Company__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c FROM Service_AMT__c WHERE ID IN:inActiveAMTList AND Company__c=: accId  ORDER BY '+columnName +' '+sortType;
        //List<Service_AMT__c> inActiveAMTListFinal = new List<Service_AMT__c>();
        //inActiveAMTListFinal = Database.query(inActiveAMTListQuery);
        service_amt_rec.inActiveAMTList = inActiveAMTListFinal;
        //------------------------------------------------------SAMARTH------------------------------------------------------
        
        
        
        
        return service_amt_rec;
    }
    
    
    
    
    
    
    
    @AuraEnabled
    public static void updateServiceAMTRecords(Id accId, List<Service_AMT__c> objToUpdate){
        System.debug('updateServiceAMTRecords objToUpdate : '+objToUpdate);
        
        //boolean istruepolicynotnull = true;
        if(objToUpdate != null){
            List<Policy_Information__c> policy = new List<Policy_Information__c>();
            policy= [SELECT Id,Name FROM Policy_Information__c where Company__c =: accId];
            
            try{
                
                if(objToUpdate.size() >0){
                    for(Integer j=0;j<objToUpdate.size();j++){
                        String userHierarchy = String.valueOf(objToUpdate[j].UserHierarchy__c);
                        
                        
                        System.debug('userHierarchy >>> '+userHierarchy);
                        if(userHierarchy != null){
                            if(userHierarchy.length() > 3 ){
                                userHierarchy = userHierarchy.substring(0, 3);  
                            }
                            
                            Integer userhierarchyint= Integer.valueOf(userHierarchy.trim());
                            objToUpdate[j].UserHierarchy__c = userhierarchyint;   
                        }
                        String policyMultipicklist = objToUpdate[j].Policy_Information_MultiChecKlist__c;
                        
                        if(policyMultipicklist != null && policyMultipicklist != ''){
                            String[] arrTest = policyMultipicklist.split(';');
                            if(arrTest.size()==policy.size()){
                                System.debug('arrTest');
                                objToUpdate[j].All_Policy__c = true;
                                System.debug(' objToUpdate[j].All_Policy__c >> '+ objToUpdate[j].All_Policy__c);
                            }else{
                                System.debug('arrTest else');
                                objToUpdate[j].All_Policy__c = false;
                                System.debug(' objToUpdate[j].All_Policy__c >> '+ objToUpdate[j].All_Policy__c);
                            } } 
                        system.debug('objToUpdate[j].Contact_Role__c=='+objToUpdate[j].Contact_Role__c);
                        system.debug('objToUpdate[j].Primary__c=='+objToUpdate[j].Primary__c);
                        /* if((objToUpdate[j].Contact_Role__c == 'Client Manager' ) || (objToUpdate[j].Contact_Role__c == 'Client Management Consultant') || (objToUpdate[j].Contact_Role__c == 'Service Account Manager') ){

}*/
                        /*Removed Else block for showing Main Role Checkbox to all Role ****SHRUTI*****/
                        /*else{
objToUpdate[j].Primary__c = false;
} */
                        
                        
                    } 
                }
                update as user objToUpdate;
                //Database.update( objToUpdate, AccessLevel.USER_MODE );
            }catch(Exception ex){
                System.debug('Exception : '+ex);
            }            
        }
    }
    
    @AuraEnabled
    public static ServiceAMT_Records createUserServiceAMTRecord(Id accId, Sobject objForCreation,String userRole,String Policy_Information){
        System.debug('objForCreation--'+objForCreation);
        Id sId = objForCreation.Id;
        String sobjectType = sId.getSObjectType().getDescribe().getName();
        List<Policy_Information__c> policy = new List<Policy_Information__c>();
        policy= [SELECT Id,Name FROM Policy_Information__c where Company__c =: accId and Policy_Status__c = 'Active' WITH USER_MODE];
        String PolicyInformationMultiChecKlist= '';
        if( policy != null && policy.size()>0){
            if(policy.size() == 1){                
                PolicyInformationMultiChecKlist = policy[0].Name;             
            }
            
        }
        System.debug('sobjectType >>>' +sobjectType);
        
        ADS__c objForCreation1 = (ADS__c)objForCreation;
        
        try{
            Service_AMT__c ser_amt_Rec = new Service_AMT__c(Company__c = accId,
                                                            Last_Name__c = objForCreation1.LastName__c,
                                                            First_Name__c = objForCreation1.FirstName__c,
                                                            Email__c = objForCreation1.Email__c,
                                                            UserHierarchy__c = 1,
                                                            // User_Contact_Id__c= objForCreation1.Id,
                                                            Case_Management_Start_Date__c = Date.today(),
                                                            Phone__c=objForCreation1.Contact_Phone__c,
                                                            //All_Policy__c = true,
                                                            External__c = false
                                                           );
            
            if(PolicyInformationMultiChecKlist != null && PolicyInformationMultiChecKlist != ''){
                ser_amt_Rec.Policy_Information_MultiChecKlist__c  = PolicyInformationMultiChecKlist;   
            }
            insert as user ser_amt_Rec;
            //Database.insert( ser_amt_Rec, AccessLevel.USER_MODE );
            // Database.SaveResult srList = Database.insert(ser_amt_Rec, false, AccessLevel.USER_MODE);
            
        }catch(Exception e){
            System.debug('Exception occured >> '+e.getCause());
            System.debug('Exception occured line number >> '+e.getLineNumber());
            System.debug('Exception Occured TypeName'+e.getTypeName());
            throw new AuraHandledException('DML Exception occurred ---- '+e.getMessage());
        }
        ServiceAMT_Records service_amt_rec = new ServiceAMT_Records();
        service_amt_rec = getServiceAMTData(accId, 'CreatedDate', 'DESC');
        return service_amt_rec;
    }
    
    @AuraEnabled
    public static ServiceAMT_Records deleteRecords(Id accId, Id recordId){
        Service_AMT__c ser_AMT_Rec = new Service_AMT__c();
        ser_AMT_Rec = [SELECT Id FROM Service_AMT__c WHERE Id=: recordId];
        delete as user ser_AMT_Rec;
        //database.delete(ser_AMT_Rec,AccessLevel.USER_MODE);
        
        // Id user_Contact_Id = ser_AMT_Rec.User_Contact_Id__c;
        
        // String objectAPIName = user_Contact_Id.getSObjectType().getDescribe().getName();
        
        // if(objectAPIName.equalsIgnoreCase('User')){
        // deleteFromAccountTeam(accId, user_Contact_Id);   
        //}
        
        ServiceAMT_Records service_amt_rec = new ServiceAMT_Records();
        service_amt_rec = getServiceAMTData(accId, 'Last_Name__c', 'ASC');
        
        return service_amt_rec;
    }
    
    @AuraEnabled
    public static UserSearchResults getSearchList(String searchKeyVal, Decimal pageNumber, String searchField, String operator, Id accountId, boolean isUser, String searchKeyValSec, String searchFieldSec, String operatorSec,String columnNameFromHelper, String sortOrderFromHelper) {
        
        System.debug('Input Parameters -> searchKeyVal-'+searchKeyVal+', pageNumber-'+pageNumber+', searchField-'+searchField+'and operator-'+operator+'--accountId---'+accountId+', isUser--'+isUser+',searchKeyValSec--'+searchKeyValSec+',searchFieldValSec--'+searchFieldSec+',operatorSec--'+operatorSec);
        
        //UHGAccountSOQLConstants uhgQueryConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        UserSearchResults userResultObj = new UserSearchResults();
        List<SObject> UserList = new List<SObject>();
        List<SObject> TotalUserList = new List<SObject>();
        Integer totaladscount = 00;
        Set<SObject> aDSusers = new Set<SObject>();
        
        try {
            
            String searchKey = '';
            searchField = String.escapeSingleQuotes(searchField);
            searchKeyVal = String.escapeSingleQuotes(searchKeyVal);
            operator = String.escapeSingleQuotes(operator);
            accountId = String.escapeSingleQuotes(accountId);
            searchKeyValSec = String.escapeSingleQuotes(searchKeyValSec);
            searchFieldSec = String.escapeSingleQuotes(searchFieldSec);
            operatorSec = String.escapeSingleQuotes(operatorSec);
            
            if(searchField != null && searchField.trim().length() > 0 && 
               operator != null && operator.trim().length() > 0) {    
                   if(searchField.equalsIgnoreCase(uhgAccountConstants.LAST_NAME)) {
                       searchField = uhgAccountConstants.LAST_NAME_ITAG_ADS;       
                   } else  if(searchField.equalsIgnoreCase(uhgAccountConstants.FIRST_NAME)) {
                       searchField = uhgAccountConstants.FIRST_NAME_ITAG_ADS;       
                   }  else  if(searchField.equalsIgnoreCase('Title')) {
                       searchField = uhgAccountConstants.JOB_TITLE_ITAG_USER_ADS;       
                   }  else  if(searchField.equalsIgnoreCase('Email')) {
                       searchField = 'Email__c';       
                   }
               }      
            if(searchKeyVal != null && searchKeyVal.trim().length() > 0 ){
                if(operator.equalsIgnoreCase(uhgAccountConstants.BEGINS_WITH)) {
                    searchKey = searchKeyVal + '%';
                } else if(operator.equalsIgnoreCase(uhgAccountConstants.CONTAINS)) {
                    searchKey = '%' + searchKeyVal + '%';
                } else if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                    searchKey = searchKeyVal;
                }
            }else{
                searchKey = null;
            }
            
            String searchKeySec = '';
            
            if(searchFieldSec != null && searchFieldSec.trim().length() > 0 && 
               operatorSec != null && operatorSec.trim().length() > 0) {    
                   if(searchFieldSec.equalsIgnoreCase(uhgAccountConstants.LAST_NAME)) {
                       searchFieldSec = uhgAccountConstants.LAST_NAME_ITAG_ADS;       
                   } else  if(searchFieldSec.equalsIgnoreCase(uhgAccountConstants.FIRST_NAME)) {
                       searchFieldSec = uhgAccountConstants.FIRST_NAME_ITAG_ADS;       
                   }  else  if(searchFieldSec.equalsIgnoreCase('Title')) {
                       searchFieldSec = uhgAccountConstants.JOB_TITLE_ITAG_USER_ADS;       
                   }  else  if(searchFieldSec.equalsIgnoreCase('Email')) {
                       searchFieldSec = 'Email__c';       
                   }
               }      
            if(searchKeyValSec != null && searchKeyValSec.trim().length() > 0){  
                if(operatorSec.equalsIgnoreCase(uhgAccountConstants.BEGINS_WITH)) {
                    searchKeySec = searchKeyValSec + '%';
                } else if(operatorSec.equalsIgnoreCase(uhgAccountConstants.CONTAINS)) {
                    searchKeySec = '%' + searchKeyValSec + '%';
                } else if(operatorSec.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                    searchKeySec = searchKeyValSec;
                }
            }else{
                searchKeySec = null;
            }
            
            System.debug('searchKeySec--->'+searchKeySec);
            System.debug('searchFieldSec--->'+searchFieldSec);
            Integer pageSize = uhgAccountConstants.POPUP_PAGESIZE;
            Integer offset = ((Integer)pageNumber - 1) * pageSize; 
            
            if(schema.sobjecttype.User.isAccessible()) {
                
                List<Service_AMT__c> existingRecords = new List<Service_AMT__c>();
                existingRecords = [SELECT Id,Email__c FROM Service_AMT__c WHERE Company__c =: accountId AND (Case_Management_End_Date__c >= Today OR Case_Management_End_Date__c = null) WITH USER_MODE];
                
                //Set<Id> addedRecordIds = new Set<Id>();
                Set<String> addedEmail = new Set<String>();
                
                for(Service_AMT__c existingRec : existingRecords){
                    System.debug('existingRec.Email__c >>> '+existingRec.Email__c);
                    addedEmail.add(existingRec.Email__c);                   
                }
                
                userResultObj.existingServiceAmt = addedEmail;
                String total_query_ADS = 'SELECT count() FROM ADS__c WHERE  ';
                system.debug('count');
                
                if(searchKey == null ) {
                    system.debug('if');
                    System.debug(total_query_ADS+searchFieldSec+' LIKE \''+searchKeySec+'\' LIMIT 50000');
                    totaladscount = Database.countQuery(total_query_ADS+searchFieldSec+' LIKE \''+searchKeySec+'\' LIMIT 50000');
                    
                }else if(searchKeySec == null ){
                    system.debug('else if 1');
                    System.debug(total_query_ADS+searchField+' LIKE \''+searchKey+'\' LIMIT 50000');
                    totaladscount = Database.countQuery(total_query_ADS+searchField+' LIKE \''+searchKey+'\' LIMIT 50000');
                    
                } else{
                    system.debug('eslse');
                    System.debug(total_query_ADS+searchField+' LIKE \''+searchKey+'\' and '+searchFieldSec+' LIKE \''+searchKeySec+'\' LIMIT 50000');
                    totaladscount = Database.countQuery(total_query_ADS+searchField+' LIKE \''+searchKey+'\' and '+searchFieldSec+' LIKE \''+searchKeySec+'\' LIMIT 50000');                 
                }                   
                system.debug('totaladscount==='+totaladscount);
                String queryStatement1 = 'SELECT Id, Name, Title__c, LastName__c, MiddleName__c, FirstName__c,Email__c,Contact_Phone__c   FROM ADS__c where status__c=\'Active\' And (';
                //String queryStatement3 = ' ORDER BY LastName__c LIMIT :pageSize OFFSET :offset';
                
                //-------------------------------------------SAMARTH CODE FOR SORTING-------------------------------------------
                String queryStatement3;
                if(columnNameFromHelper == NULL && sortOrderFromHelper == NULL){
                    queryStatement3 = ' ORDER BY LastName__c,FirstName__c LIMIT :pageSize OFFSET :offset';
                }
                else{
                    sortOrderFromHelper = String.escapeSingleQuotes(sortOrderFromHelper);
                    columnNameFromHelper = String.escapeSingleQuotes(columnNameFromHelper);
                    queryStatement3 = ' ORDER BY ' +columnNameFromHelper+' '+sortOrderFromHelper+' LIMIT :pageSize OFFSET :offset';
                }
                //-------------------------------------------SAMARTH CODE FOR SORTING-------------------------------------------
                
                String queryEqualStat = String.escapeSingleQuotes(' LIKE :searchKey)');
                String queryStat = String.escapeSingleQuotes('=:searchKey)');
                String queryStatement4 = String.escapeSingleQuotes(' and ('+searchFieldSec);
                String queryStatement5 = String.escapeSingleQuotes(' LIKE :searchKeySec)');
                String queryStatSec = String.escapeSingleQuotes('=:searchKeySec)');
                
                if(totaladscount !=0 && (operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO) || operatorSec.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO))) {
                    
                    if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)){
                        if(operatorSec.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)){
                            if(searchKey == null){
                                UserList = Database.query(queryStatement1+searchFieldSec+queryStatSec+queryStatement3);
                            }else if(searchKeySec == null){
                                UserList = Database.query(queryStatement1+searchField+queryStat+queryStatement3);
                            }else{
                                UserList = Database.query(queryStatement1+searchField+queryStat+queryStatement4+queryStatSec+queryStatement3);
                            }
                            
                        }else{
                            
                            if(searchKey == null){
                                UserList = Database.query(queryStatement1+searchFieldSec+queryStatement5+queryStatement3);
                            }else if(searchKeySec == null){
                                UserList = Database.query(queryStatement1+searchField+queryStat+queryStatement3);
                            }else{
                                UserList = Database.query(queryStatement1+searchField+queryStat+queryStatement4+queryStatement5+queryStatement3);
                            }
                            
                        }
                    }else{
                        if(operatorSec.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)){
                            
                            if(searchKey == null){
                                UserList = Database.query(queryStatement1+searchFieldSec+queryStatSec+queryStatement3);
                            }else if(searchKeySec == null){
                                UserList = Database.query(queryStatement1+searchField+queryEqualStat+queryStatement3);
                            }else{
                                UserList = Database.query(queryStatement1+searchField+queryEqualStat+queryStatement4+queryStatSec+queryStatement3);
                            }
                            
                        }else{
                            
                            if(searchKey == null){
                                UserList = Database.query(queryStatement1+searchFieldSec+queryStatement5+queryStatement3);
                            }else if(searchKeySec == null){
                                system.debug('changes--'+queryStatement1+searchField+queryEqualStat+queryStatement3);
                                UserList = Database.query(queryStatement1+searchField+queryEqualStat+queryStatement3);
                            }else{
                                UserList = Database.query(queryStatement1+searchField+queryEqualStat+queryStatement4+queryStatement5+queryStatement3);
                            }
                            
                        }
                    }
                    
                    
                    // System.debug('queryStatement1+searchField+queryStat+queryStatement3@@@@@@@@@   '+queryStatement1+searchField+queryStat+queryStatement4+queryStatSec+queryStatement3);
                    
                }else if(totaladscount != 0 && searchKey == null){
                    System.debug('queryStatement1+searchField+queryEqualStat+queryStatement3---'+queryStatement1+searchField+queryEqualStat+queryStatement3);
                    System.debug('queryStatement1+searchField+queryEqualStat+queryStatement3---'+queryStatement1+searchField+queryEqualStat+queryStatement4+queryStatement5+queryStatement3);
                    UserList = Database.query(queryStatement1+searchFieldSec+queryStatement5+queryStatement3);
                }else if(totaladscount != 0 && searchKeySec == null){
                    System.debug('queryStatement1+searchField+queryEqualStat+queryStatement3---'+queryStatement1+searchField+queryEqualStat+queryStatement4+queryStatement5+queryStatement3);
                    UserList = Database.query(queryStatement1+searchField+queryEqualStat+queryStatement3);    
                }else if(totaladscount != 0 ){
                    System.debug('queryStatement1+searchField+queryEqualStat+queryStatement3---'+queryStatement1+searchField+queryEqualStat+queryStatement4+queryStatement5+queryStatement3);
                    UserList = Database.query(queryStatement1+searchField+queryEqualStat+queryStatement4+queryStatement5+queryStatement3);    
                    
                }
                
                if(UserList.size() > 0){
                    aDSusers.addAll(UserList);
                }
                
                
                TotalUserList.addAll(aDSusers);
                userResultObj.userList = TotalUserList;
                userResultObj.page = (Integer)pageNumber;
                userResultObj.pageSize = pageSize;
                userResultObj.total = totaladscount;
            } else {
                throw new NoAccessException();
            }
            
        }catch(Exception e) {
            system.debug(e.getLineNumber());
            System.debug('Error occurred in getSearchList() method while querying the User details from SF -> '+e.getMessage());
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        System.debug('Output Parameters -> Returned Results-'+userResultObj.userList+', Page-'+userResultObj.page+
                     ', PageSize-'+userResultObj.pageSize+'and TotalNoOfPages-'+userResultObj.total);
        
        System.debug('getConsultantFirms(String searchKeyVal, Decimal pageNumber, String searchField, String operator) - END');
        
        return userResultObj;
    }
    
    @AuraEnabled
    public static RecordAccess defineSobjectType(Id accId){
        Boolean isSalesProfile = false;
        RecordAccess recordAccess = new RecordAccess();
        recordAccess.sobjectType = accId.getSObjectType().getDescribe().getName();
        isSalesProfile = Service_AMT_Class.isSalesProfile();
        recordAccess.isSalesProfile = isSalesProfile;
        if(isSalesProfile){
            recordAccess.isAccountEnabled = UserInformationClass.hasEditAccessToRecord(accId);
        }else{
            recordAccess.isAccountEnabled = true;
        }
        System.debug('sobjectType'+recordAccess);
        return recordAccess;
    }
    
    @AuraEnabled
    public static void getcases(){
        List<Policy_Information__c> productLine = [Select Id,Name from Policy_Information__c];  
    }
    
    @AuraEnabled
    public static List<Service_AMT__c> getPolicyInfo(Id accId ){
        List<Service_AMT__c> policyselected = [Select Policy_Information_MultiChecKlist__c  from Service_AMT__c  where company__c =:accId ];
        return policyselected;
    }
    
    @AuraEnabled
    public static Boolean isSalesProfile() {
        Boolean isSales = false;
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        try {           
            User cmpnyCommunitiesUsrObj = [Select id,Profile.UserLicense.Name from User where Id=: userinfo.getUserId()];
            User csiAdmUsrObj = [SELECT Id,Profile.Name  FROM User WHERE Id=: userinfo.getUserId() ];        
            String csiAdmVal = '';
            String userLicenseVal = '';
            String[] IPMProfileNames = System.Label.IPM_Profile_Names_Acc_Team_Access.split(';;');
            Set<String> IPMProfileNamesSet = new Set<String>(IPMProfileNames);
            if(cmpnyCommunitiesUsrObj != null) {
                userLicenseVal = cmpnyCommunitiesUsrObj.Profile.UserLicense.Name;
            }
            if(csiAdmUsrObj != null){
                csiAdmVal = csiAdmUsrObj.Profile.Name;
            }
            if(userLicenseVal != null && userLicenseVal.equalsIgnoreCase(uhgAccountConstants.USER_LICENSE_COMPANY_COMMUNITIES)) {
                isSales = false;
            }else if(csiAdmVal != null && csiAdmVal.equalsIgnoreCase(uhgAccountConstants.USER_ROLE_CSI_Admin)){
                isSales = false;
            }else if(IPMProfileNamesSet.contains(csiAdmVal)){
                isSales = false;
            }else{
                isSales = true;
            }
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        return isSales;
    }
    
    public class UserSearchResults {
        
        @AuraEnabled
        public List<Sobject> userList{ get;set; }
        
        @AuraEnabled
        public List<Contact> contactList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled 
        public boolean isuser{get;set;}
        
        @AuraEnabled
        public Set<String> existingServiceAmt{ get;set; }
        
    }
    
    public class recordAccess {
        @AuraEnabled
        public String sobjectType { get; set; }
        
        @AuraEnabled
        public Boolean isSalesProfile { get; set; }
        
        @AuraEnabled
        public Boolean isAccountEnabled { get; set; }
        
    }
    
    public class ServiceAMT_Records {
        
        @AuraEnabled
        public List<Service_AMT__c> serviceAMTRecords{ get;set; }
        
        @AuraEnabled
        public List<Service_AMT__c> externalServiceAMTRecords{ get;set; }
        
        @AuraEnabled
        public List<Service_AMT__c> activeAMTList{ get;set; }
        
        @AuraEnabled
        public List<Service_AMT__c> inActiveAMTList{ get;set; }
        
        
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public String[] roleValues1 { get; set; }
        
        @AuraEnabled
        public String[] roleValues2 { get; set; }
        
        @AuraEnabled
        public List<Policy_Information__c> PolicyId {get;set;}
        
        @AuraEnabled 
        public String PolicyInfoSelected {get;set;}
        
        @AuraEnabled 
        public Boolean PolicyAmtApplet {get;set;}
        
        public ServiceAMT_Records(){
            roleValues1 = new List<String>();
            roleValues2 = new List<String>();
            
        }
        
    }
    @AuraEnabled
    public static boolean sendMailFromApex(String lName, String fName, String mName, String phone, String email){
        // System.debug('Input Parameters -- lName--'+lName+' ,fName--'+fName+' , '+phone+' phone, '+ email--'+email+');
        boolean is_success = false;
        
        //String emptyDate = '';
        //boolean isDateNull = false;
        //String sObjName = maId.getSObjectType().getDescribe().getName();
        //String name = '';
        //String rowId = '';
        // Datetime effectiveDate ;
        //String companyName = '';
        
        
        
        String receiverEmail = System.Label.addServiceAMTMemberEmailId;
        List<string> emaillst =new List<string>();
        emaillst.add(receiverEmail);
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        message.toAddresses = emaillst;
        message.optOutPolicy = 'FILTER';
        
        message.subject = System.Label.serviceAMTMAilSubject;
        
        String  emailBody = 'Request you to Add new AMT User with following details.'+'<br/><br/>';
        
        emailBody += 'Requestor:'+'<br/>';
        emailBody += UserInfo.getName()+'<br/><br/><br/>';
        
        emailBody += 'AMT USER Information:<br/><br/>';    
        emailBody += 'First Name: '+fName+'<br/>';
        emailBody += 'Last Name: '+lName+'<br/>';
        emailBody += 'Middle Name: '+mName+'<br/>';
        emailBody += 'Email: '+email+'<br/>';
        if(phone != null){
            emailBody += 'Phone #: '+phone+'<br/>'; 
        }
        
        
        message.setHtmlBody(emailBody);
        try{
            Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {message};
                Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
            if (results[0].success) {
                is_success=true;           
            } else {
                is_success=false;
                System.debug('The email failed to send: '+ results[0].errors[0].message);
            }
        }
        catch(exception e){
            
        }
        return is_success;
    }
    
}