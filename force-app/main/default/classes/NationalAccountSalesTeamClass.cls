public with sharing class NationalAccountSalesTeamClass {
    
    /*
* The below method returns the boolean value which is used to be enable Add, Edit & Delete buttons to the specific Roles.
*/
    
    @AuraEnabled
    public static Boolean getLoggedInUerRoleInfo() {
        
        Boolean isLoggedInUserRoleToBeEnabled = false;
        
        try {
            
            User user = [Select UserRole.Name from User where Id=:UserInfo.getUserId()];                                    
            if(user.UserRole != null && user.UserRole.Name != null && user.UserRole.Name.trim().length() > 0) {
                String loggedInUserRole = user.UserRole.Name;
                String[] roleNames = System.Label.NationalAccountSalesTeam_Roles_To_EnableAddOrEditButtons.split(',');
                Set<String> roleNamesSet = new Set<String>(roleNames);
                if(roleNamesSet.contains(loggedInUserRole)) {
                    isLoggedInUserRoleToBeEnabled = true;
                } else {
                    isLoggedInUserRoleToBeEnabled = false;
                }
            }
            
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        
        return isLoggedInUserRoleToBeEnabled;
    }
    
    
    /*
* The below method queries the CM_Account_Team_History__c records based on the AccountId and sorts
* the data based on the columnName & sortType which returns the List<CM_Account_Team_History__c>.
*/
    @AuraEnabled
    public static CMAccountTeamHistoryResult getCMAccountTeamHistoryRecords(Id accountId,String columnName, String sortType, String operation) {
        
        
        
        UHGAccountSOQLConstants uhgAccountSOQLConstants = new UHGAccountSOQLConstants();                    
        CMAccountTeamHistoryResult cmAccountTeamHistoryResultObj = new CMAccountTeamHistoryResult();
        
        try {
            
            List<CM_Account_Team_History__c> cmAccountTeamHistoryList = new List<CM_Account_Team_History__c>();
            List<CM_Account_Team_History__c> cmAccountTeamHistoryResultList = new List<CM_Account_Team_History__c>();
            
            if(schema.sobjecttype.CM_Account_Team_History__c.isaccessible()) {
                if(accountId != null && columnName != null && sortType != null) {
                    cmAccountTeamHistoryList = Database.query(uhgAccountSOQLConstants.QUERY_STRING_CMACCOUNT_TEAMHISTORY+columnName+' '+sortType);
                }
                
                /*
*  The below logic returns the active VPCR, RVP & SCE records from the CM Account Team History Result List.
*/
                
                cmAccountTeamHistoryResultObj.cmAccountTeamHistoryList = cmAccountTeamHistoryList;
                
                if(cmAccountTeamHistoryList != null && cmAccountTeamHistoryList.size() > 0) {
                    System.debug('1st');
                    CMAccountTeamHistoryResult cmAccountTeamHistoryResultObj1 = 
                        getActiveCMAccountTeamHistoryRecords(cmAccountTeamHistoryList, operation);
                    if(cmAccountTeamHistoryResultObj1 != null) {
                        cmAccountTeamHistoryResultObj.vpcr = cmAccountTeamHistoryResultObj1.vpcr;
                        cmAccountTeamHistoryResultObj.vpcr1 = cmAccountTeamHistoryResultObj1.vpcr1;
                        cmAccountTeamHistoryResultObj.rvp = cmAccountTeamHistoryResultObj1.rvp;                        
                        cmAccountTeamHistoryResultObj.sce = cmAccountTeamHistoryResultObj1.sce;
                        cmAccountTeamHistoryResultObj.sce1 = cmAccountTeamHistoryResultObj1.sce1;                        
                        cmAccountTeamHistoryResultObj.cmVPCRRVPRowID = cmAccountTeamHistoryResultObj1.cmVPCRRVPRowID; 
                        cmAccountTeamHistoryResultObj.cmVPCRRVPRowID1 = cmAccountTeamHistoryResultObj1.cmVPCRRVPRowID1; 
                        cmAccountTeamHistoryResultObj.futureCMVpcrRVPStartDate = cmAccountTeamHistoryResultObj1.futureCMVpcrRVPStartDate; 
                        cmAccountTeamHistoryResultObj.cmSCERowID = cmAccountTeamHistoryResultObj1.cmSCERowID;
                        cmAccountTeamHistoryResultObj.cmSCERowID1 = cmAccountTeamHistoryResultObj1.cmSCERowID1;
                        cmAccountTeamHistoryResultObj.futureCMSCEStartDate = cmAccountTeamHistoryResultObj1.futureCMSCEStartDate;
                        
                        cmAccountTeamHistoryResultObj.Specialtysce = cmAccountTeamHistoryResultObj1.Specialtysce;
                        cmAccountTeamHistoryResultObj.Specialtysce1 = cmAccountTeamHistoryResultObj1.Specialtysce1;                        
                        cmAccountTeamHistoryResultObj.SpecialtycmSCERowID = cmAccountTeamHistoryResultObj1.SpecialtycmSCERowID;
                        cmAccountTeamHistoryResultObj.SpecialtycmSCERowID1 = cmAccountTeamHistoryResultObj1.SpecialtycmSCERowID1;
                        cmAccountTeamHistoryResultObj.futureSpecialtySCEDate = cmAccountTeamHistoryResultObj1.futureSpecialtySCEDate;
                        
                        cmAccountTeamHistoryResultObj.futureSCEValidationMsg = cmAccountTeamHistoryResultObj1.futureSCEValidationMsg;
                        cmAccountTeamHistoryResultObj.futureVpcrRvpValidationMsg = cmAccountTeamHistoryResultObj1.futureVpcrRvpValidationMsg;
                        /*cmAccountTeamHistoryResultObj.scePlayerCoach = cmAccountTeamHistoryResultObj1.scePlayerCoach;
cmAccountTeamHistoryResultObj.cmVPCRRVPName = cmAccountTeamHistoryResultObj1.cmVPCRRVPName;
cmAccountTeamHistoryResultObj.cmSCEName = cmAccountTeamHistoryResultObj1.cmSCEName;                        
cmAccountTeamHistoryResultObj.cmSCEName1 = cmAccountTeamHistoryResultObj1.cmSCEName1;*/
                    }
                }
                
                System.debug(operation+' => VPCR Active-'+cmAccountTeamHistoryResultObj.vpcr+', RVP Active-'+
                             cmAccountTeamHistoryResultObj.rvp+', VPCR Id-'+cmAccountTeamHistoryResultObj.cmVPCRRVPRowID +', VPCR Name-'+ 
                             cmAccountTeamHistoryResultObj.cmVPCRRVPName);
                
                /*
* The below logic is to update the Report fields after upsertion or removal of Records.
*/ 
                if(accountId != null && operation != null && (operation.equalsIgnoreCase('deleteOperation') || 
                                                              operation.equalsIgnoreCase('upsertOperation')) && cmAccountTeamHistoryResultObj != null) {
                                                                  updateAccountRecords(accountId, cmAccountTeamHistoryResultObj);
                                                              }
                
            } else {
                throw new NoAccessException();
            }
            
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the CM_Account_Team_History__c object from SF in getCMAccountTeamHistoryRecords() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getCMAccountTeamHistoryRecords() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            System.debug('Operation '+operation);
            if(operation != null && (operation.equalsIgnoreCase('deleteOperation') || operation.equalsIgnoreCase('upsertOperation'))) {
                throw noaccessExec;
            } else {
                throw new AuraHandledException('No Access Exception occurred ---- '+noaccessExec.getMessage());
            }
            
        } catch(QueryException queryExec){
            System.debug('Error(QueryException) occurred while querying the details of CM_Account_Team_History__c object from SF in '+
                         'getCMAccountTeamHistoryRecords() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getCMAccountTeamHistoryRecords() method, the Stack Trace is -> '
                         +queryExec.getStackTraceString());
            if(operation != null && (operation.equalsIgnoreCase('deleteOperation') || operation.equalsIgnoreCase('upsertOperation'))) {
                throw queryExec;
            } else {
                throw new AuraHandledException('Query Exception occurred ---- '+queryExec.getMessage());
            }
        } catch(Exception e) {
            System.debug('Error occurred in getCMAccountTeamHistoryRecords() method while querying the details of '+
                         'CMAccountTeamHistory from SF -> ' + e.getMessage());
            if(operation != null && (operation.equalsIgnoreCase('deleteOperation') || operation.equalsIgnoreCase('upsertOperation'))) {
                throw e;
            } else {
                throw new AuraHandledException('Exception occurred ---- '+e.getMessage());
            }
        }
        
        
        return cmAccountTeamHistoryResultObj;       
    }
    
    
    /*
* The below method sorts the data (Only editable fields in the Component) based on the
* columnName & sortType which returns the List<CM_Account_Team_History__c>.
*/
    @AuraEnabled
    public static CMAccountTeamHistoryResult sortCMAccountTeamHistoryRecords(String columnName, String sortType,List<CM_Account_Team_History__c> toBeSortedList) {        
        
        CMAccountTeamHistoryResult cmAccountTeamHistoryResultObj = new CMAccountTeamHistoryResult();
        try {
            if(columnName != null && columnName.trim().length() > 0 && sortType != null && sortType.trim().length() > 0) {
                List<CM_Account_Team_History__c> sortedCMAccountTeamHistoryList = new List<CM_Account_Team_History__c>();
                Boolean sortOrder = true;
                if(sortType.equalsIgnoreCase('Desc')) {
                    sortOrder = false;  
                }              
                
                /*
* The below logic manually sorts the Case Management Start Date &  Case Management End Date fields
* in ascending or descending order based on the Sort Order parameter using Comparable Interface.
*/ 
                
                List<CMAccountTeamHistorySortWrapper> sortedList = new List<CMAccountTeamHistorySortWrapper>();
                List<CM_Account_Team_History__c> sortedListWithNullValues = new List<CM_Account_Team_History__c>();
                List<CM_Account_Team_History__c> sortedListFromComparator = new List<CM_Account_Team_History__c>();
                
                for(CM_Account_Team_History__c obj : toBeSortedList) {
                    
                    if((columnName.equalsIgnoreCase('Case_Management_Start_Date__c') && 
                        obj.Case_Management_Start_Date__c == null) ||
                       (columnName.equalsIgnoreCase('Case_Management_End_Date__c') && 
                        obj.Case_Management_End_Date__c == null) ||
                       (columnName.equalsIgnoreCase('Job_Title__c') && 
                        (obj.Job_Title__c == null || obj.Job_Title__c.trim().length() == 0))) {
                            
                            sortedListWithNullValues.add(obj);    
                            
                        } else {
                            
                            sortedList.add(new CMAccountTeamHistorySortWrapper(new CM_Account_Team_History__c(
                                Id=obj.Id,
                                Last_Name__c=obj.Last_Name__c,
                                Name=obj.Name,
                                Case_Management_Start_Date__c=obj.Case_Management_Start_Date__c,
                                Case_Management_End_Date__c=obj.Case_Management_End_Date__c,
                                Job_Title__c=obj.Job_Title__c,
                                IsVPCR__c=obj.IsVPCR__c,
                                Role__c=obj.Role__c
                            ),columnName,sortOrder));
                        }
                }
                
                sortedList.sort();
                
                for(CMAccountTeamHistorySortWrapper obj : sortedList) {
                    sortedListFromComparator.add(obj.cmAccountTeamHistoryObj);
                }
                sortedCMAccountTeamHistoryList.addAll(sortedListWithNullValues);
                sortedCMAccountTeamHistoryList.addAll(sortedListFromComparator);
                
                cmAccountTeamHistoryResultObj.cmAccountTeamHistoryList = sortedCMAccountTeamHistoryList;
                
            } else {
                
                cmAccountTeamHistoryResultObj.cmAccountTeamHistoryList = toBeSortedList;
            }
            
        } catch(Exception e) {
            System.debug('Error occurred in sortCMAccountTeamHistoryRecords() method while sorting the '+
                         'CMAccountTeamHistory records -> ' + e.getMessage());
        }
        
        
        
        return cmAccountTeamHistoryResultObj;
    }
    
    
    /*
* The below method upserts the CM_Account_Team_History__c records into SF which returns the
* updated List<CM_Account_Team_History__c>.
*/
    @AuraEnabled
    public static CMAccountTeamHistoryResult upsertCMAccountTeamHistoryRecords(Id accountId,List<CM_Account_Team_History__c> cmAccountTeamHistoryDataTobeUpserted) {
        System.debug('2nd');
        System.debug('UPsert called');
        CMAccountTeamHistoryResult cmAccountTeamHistoryResultObj = new CMAccountTeamHistoryResult();
        
        try {
            if(cmAccountTeamHistoryDataTobeUpserted != null && cmAccountTeamHistoryDataTobeUpserted.size() > 0) {
                
                if(schema.sobjecttype.CM_Account_Team_History__c.isUpdateable()) {
                    /*
* Explicit type casting to be done for UPSERT operation as the List of generic SObject is not supported.
*/
                    List<CM_Account_Team_History__c> listTobeUpserted = new List<CM_Account_Team_History__c>();
                    for(CM_Account_Team_History__c cmAccountTeamHistory : cmAccountTeamHistoryDataTobeUpserted){
                        listTobeUpserted.add((CM_Account_Team_History__c)cmAccountTeamHistory);
                    }
                    Database.UpsertResult[] dbUpsertResultList = Database.upsert(listTobeUpserted, false);
                    
                    if(dbUpsertResultList != null && dbUpsertResultList.size() > 0) {
                        // Iterate through each returned result
                        for (Database.UpsertResult cmUpdtResult : dbUpsertResultList) {
                            if(!cmUpdtResult.isSuccess()) {
                                // Operation failed, so get all errors                
                                for(Database.Error err : cmUpdtResult.getErrors()) {
                                    System.debug('The following error has occurred.');                    
                                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                    System.debug('Fields that affected this error: ' + err.getFields());
                                }
                            }
                        }
                    }
                    
                } else {
                    throw new NoAccessException();
                }
                
            }
            if(accountId != null) {
                
                cmAccountTeamHistoryResultObj = 
                    getCMAccountTeamHistoryRecords(accountId, 'Case_Management_End_Date__c', 'Desc', 'upsertOperation');
                
            }
            
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to an CM_Account_Team_History__c object in SF in upsertCMAccountTeamHistoryRecords() method -> '+
                         noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in upsertCMAccountTeamHistoryRecords() method, the Line Number is -> '
                         +noaccessExec.getLineNumber()+' and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception occurred ---- '+noaccessExec.getMessage());
        } catch(System.DmlException dmlExec) {
            System.debug('DML Exception(Stack Trace) occurred in upsertCMAccountTeamHistoryRecords() method while upserting the '+
                         'details of CMAccountTeamHistory from SF -> '+dmlExec.getStackTraceString());
            for (Integer i = 0; i < dmlExec.getNumDml(); i++) {
                // Process exception here
                System.debug('Status Code -> '+dmlExec.getDmlStatusCode(i)); 
                System.debug('DML Error Message -> '+dmlExec.getDmlMessage(i)); 
                System.debug('Field Names -> '+dmlExec.getDmlFieldNames(i)); 
            }
            throw new AuraHandledException('DML Exception occurred ---- '+dmlExec.getMessage());
        } catch(Exception e) {
            System.debug('Error occurred in upsertCMAccountTeamHistoryRecords() method while upserting the details' +
                         ' into CMAccountTeamHistory from SF -> ' + e.getMessage());
            throw new AuraHandledException('Exception occurred ---- '+e.getMessage());
        }
        
        
        
        return cmAccountTeamHistoryResultObj;
    }
    
    
    /*
* The below method deletes the CM_Account_Team_History__c record from SF based on the Row Id.
*/
    @AuraEnabled
    public static void deleteCMAccountTeamHistoryRecord(Id cmAccountTeamHistoryRecordId) {
        
        
        try {
            if(schema.sobjecttype.CM_Account_Team_History__c.isaccessible() && 
               schema.sobjecttype.CM_Account_Team_History__c.isDeletable()) {
                   
                   if(cmAccountTeamHistoryRecordId != null) {
                       
                       CM_Account_Team_History__c[] cmAccountTeamHistoryArray = [SELECT id FROM CM_Account_Team_History__c WHERE id=:cmAccountTeamHistoryRecordId]; 
                       Database.DeleteResult[] dbDelResultList = Database.delete(cmAccountTeamHistoryArray, false);
                       
                       Boolean isRecordDeleted = true;
                       // Iterate through each returned result
                       if(dbDelResultList != null && dbDelResultList.size() > 0) {
                           for (Database.DeleteResult cmDelResult : dbDelResultList) {
                               if(!cmDelResult.isSuccess()) {
                                   // Operation failed, so get all errors    
                                   isRecordDeleted = false;            
                                   for(Database.Error err : cmDelResult.getErrors()) {
                                       System.debug('The following error has occurred.');                    
                                       System.debug(err.getStatusCode() + ': ' + err.getMessage());
                                       System.debug('Fields that affected this error: ' + err.getFields());
                                   }
                               }
                           }
                       }
                   }
               } else {
                   throw new NoAccessException();      
               }       
            
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to an CM_Account_Team_History__c object in SF in deleteCMAccountTeamHistoryRecord() method -> '+
                         noaccessExec.getMessage());
            System.debug('Error in deleteCMAccountTeamHistoryRecord() method, the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception occurred ---- '+noaccessExec.getMessage());
        } catch(System.DmlException dmlExec) {
            System.debug('DML Exception(Stack Trace) occurred in deleteCMAccountTeamHistoryRecord() method while deleting the '+
                         'details of CMAccountTeamHistory from SF -> '+dmlExec.getStackTraceString());
            for (Integer i = 0; i < dmlExec.getNumDml(); i++) {
                // Process exception here
                if(!dmlExec.getDmlStatusCode(i).equals('ENTITY_IS_DELETED')) {
                    System.debug('Status Code -> '+dmlExec.getDmlStatusCode(i)); 
                    System.debug('DML Error Message -> '+dmlExec.getDmlMessage(i)); 
                    System.debug('FieldNames -> '+dmlExec.getDmlFieldNames(i));
                    throw new AuraHandledException('DML Exception occurred ---- '+dmlExec.getDmlMessage(i));  
                }
            }
        } catch(Exception e){
            System.debug('Error occurred in deleteCMAccountTeamHistoryRecord while deleting the details of '+
                         'CMAccountTeamHistory from SF -> ' + e.getMessage());
            throw new AuraHandledException('Exception occurred ---- '+e.getMessage());
        }
        
        System.debug('deleteCMAccountTeamHistoryRecord(Id cmAccountTeamHistoryRecordId) - END');
    }
    
    
    /*
* The below method updates the CM SCE, Future CM SCE, CM VPCR/RVP, Future CM VPCR/RVP fields at the Account records in SF.
*/
    
    public static void updateAccountRecords(Id accountId, CMAccountTeamHistoryResult cmAccountTeamHistoryResultObj) {
        
        UHGAccountSOQLConstants uhgAccountSOQLConstants = new UHGAccountSOQLConstants();
        
        try {
            system.debug('cmAccountTeamHistoryResultObj'+cmAccountTeamHistoryResultObj);
            /*
* The below logic updates the CM VPCR/RVP Row ID & CM VPCR/RVP fields at the Account level.
*/
            Account accountdata = new Account();
            accountdata.Id = accountId;
            
            if(cmAccountTeamHistoryResultObj.vpcr != null || cmAccountTeamHistoryResultObj.rvp != null) {
                accountdata.CMVPCRRVP__c = cmAccountTeamHistoryResultObj.cmVPCRRVPRowID;
            } else {
                accountdata.CMVPCRRVP__c = null;
            } 
            
            if(cmAccountTeamHistoryResultObj.vpcr1 != null) {
                accountdata.Future_CM_VPCR_RVP__c = cmAccountTeamHistoryResultObj.cmVPCRRVPRowID1;
                accountdata.Future_CM_VPCR_RVP_Start_Date__c = cmAccountTeamHistoryResultObj.futureCMVpcrRVPStartDate;
            } else {
                accountdata.Future_CM_VPCR_RVP__c = null;
                accountdata.Future_CM_VPCR_RVP_Start_Date__c = null;
            }
            
            if(cmAccountTeamHistoryResultObj.sce != null){
                accountdata.CM_SCE__c = cmAccountTeamHistoryResultObj.cmSCERowID;
            }else {
                accountdata.CM_SCE__c = null;
            }
            if(cmAccountTeamHistoryResultObj.sce1 != null) {
                //accountdata.CM_SCE_2__c  = cmAccountTeamHistoryResultObj.cmSCERowID1;
                accountdata.Future_CM_SCE__c = cmAccountTeamHistoryResultObj.cmSCERowID1;
                accountdata.Future_CM_SCE_Start_Date__c = cmAccountTeamHistoryResultObj.futureCMSCEStartDate;
            } else {
                //accountdata.CM_SCE_2__c = null;
                accountdata.Future_CM_SCE__c = null;
                accountdata.Future_CM_SCE_Start_Date__c = null;
            }
            
            if(cmAccountTeamHistoryResultObj.Specialtysce != null){
                system.debug('veera');
                accountdata.Specialty_SCE__c = cmAccountTeamHistoryResultObj.SpecialtycmSCERowID;
            }else {
                accountdata.Specialty_SCE__c = null;
            }
            if(cmAccountTeamHistoryResultObj.Specialtysce1 != null) {
                //accountdata.CM_SCE_2__c  = cmAccountTeamHistoryResultObj.cmSCERowID1;
                accountdata.Future_Specialty_SCE__c = cmAccountTeamHistoryResultObj.SpecialtycmSCERowID1;
                accountdata.Future_Specialty_SCE_Start_Date__c = cmAccountTeamHistoryResultObj.futureSpecialtySCEDate;
            } else {
                //accountdata.CM_SCE_2__c = null;
                accountdata.Future_Specialty_SCE__c = null;
                accountdata.Future_Specialty_SCE_Start_Date__c = null;
            }
            
            
            if(accountdata != null) {
                system.debug('veera2'+accountdata);
                update accountdata; 
            }
            
        } catch(Exception e) {
            System.debug('Exception occurred while updating the Backend reporting fields in Account - '+e);
            throw e;
        }
        
    }
    
    /*
* The below method queries the Users based on the Page size & Offset which returns the List<User>.
*/
    @AuraEnabled
    public static UserResult getUserRecords(String searchKeyVal, Decimal pageNumber, String searchField, String operator) {
        
        
        
        UHGAccountSOQLConstants uhgAccountSOQLConstants = new UHGAccountSOQLConstants();
        UHGAccountConstants uhgAccountConstants = new UHGAccountConstants();
        UserResult userResultObj = new UserResult();
        
        try {
            
            String searchKey = '';
            
            if(searchKeyVal != null && searchKeyVal.trim().length() > 0 &&
               searchField != null && searchField.trim().length() > 0 && 
               operator != null && operator.trim().length() > 0) {    
                   if(searchField.equalsIgnoreCase(uhgAccountConstants.LAST_NAME)) {
                       searchField = uhgAccountConstants.LAST_NAME_ITAG;       
                   } else if(searchField.equalsIgnoreCase(uhgAccountConstants.FIRST_NAME)) {
                       searchField = uhgAccountConstants.FIRST_NAME_ITAG;       
                   } else if(searchField.equalsIgnoreCase(uhgAccountConstants.JOB_TITLE)) {
                       searchField = uhgAccountConstants.JOB_TITLE_ITAG_USER;       
                   }
                   
                   if(operator.equalsIgnoreCase(uhgAccountConstants.BEGINS_WITH)) {
                       searchKey = searchKeyVal + '%';
                   } else if(operator.equalsIgnoreCase(uhgAccountConstants.CONTAINS)) {
                       searchKey = '%' + searchKeyVal + '%';
                   } else if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                       searchKey = searchKeyVal;
                   }
               }
            
            Boolean userStatus = true;
            Integer pageSize = uhgAccountConstants.POPUP_PAGESIZE;
            Integer offset = ((Integer)pageNumber - 1) * pageSize; 
            
            if(schema.sobjecttype.User.isaccessible()) {
                
                //userResultObj.userList = [SELECT LastName,FirstName,EmployeeNumber,Email,Job_Title__c,UserRole.Name,Manager.Name FROM User WHERE IsActive=:userStatus ORDER BY LastName LIMIT : pageSize OFFSET :offset] ;
                if(searchKey != null && searchKey.trim().length() > 0) {
                    
                    userResultObj.total = Database.countQuery('SELECT count() FROM User WHERE IsActive=:userStatus and '+searchField+' LIKE :searchKey');
                    if(operator.equalsIgnoreCase(uhgAccountConstants.EQUALS_TO)) {
                        userResultObj.userList = Database.query(uhgAccountSOQLConstants.QUERY_STRING_USER_SEARCH+searchField+uhgAccountSOQLConstants.QUERY_STRING_USER_SEARCH2+uhgAccountSOQLConstants.QUERY_STRING_USER_SEARCH3);
                    } else {
                        userResultObj.userList = Database.query(uhgAccountSOQLConstants.QUERY_STRING_USER_SEARCH+searchField+uhgAccountSOQLConstants.QUERY_STRING_USER_SEARCH1+uhgAccountSOQLConstants.QUERY_STRING_USER_SEARCH3); 
                    }
                    
                } else {
                    
                    userResultObj.total = Database.countQuery('SELECT count() FROM User WHERE IsActive=:userStatus');
                    userResultObj.userList = Database.query(uhgAccountSOQLConstants.QUERY_STRING_USER);
                }
                
                userResultObj.page = (Integer)pageNumber;
                userResultObj.pageSize = pageSize;
                
            } else {
                throw new NoAccessException();
            }
            
        } catch(NoAccessException noaccessExec) {
            System.debug('No Access to query the User object from SF in getUserRecords() '+
                         'method -> '+noaccessExec.getMessage());
            System.debug('Error(NoAccessException) in getUserRecords() method, the Line Number is -> '+noaccessExec.getLineNumber()+
                         'and the Stack Trace is -> '+noaccessExec.getStackTraceString());
            throw new AuraHandledException('No Access Exception occurred ---- '+noaccessExec.getMessage());
        } catch(QueryException queryExec) {
            System.debug('Error(QueryException) occurred while querying the details of User object from SF in '+
                         'getUserRecords() method -> '+queryExec.getMessage());
            System.debug('Error(QueryException) in getUserRecords() method, the Stack Trace is -> '+queryExec.getStackTraceString());
            throw new AuraHandledException('Query Exception occurred ---- '+queryExec.getMessage());
        } catch(Exception e) {
            System.debug('Error occurred in getUserRecords() method while querying the User details from SF -> '+e.getMessage());
            throw new AuraHandledException('Exception occurred ---- '+e.getMessage());
        }
        
        return userResultObj;
    }
    
    
    /*
*  The below method returns the active and inactive VPCR, RVP, SCE CMAccountTeamHistory records
*/
    
    public static CMAccountTeamHistoryResult getActiveCMAccountTeamHistoryRecords(List<CM_Account_Team_History__c> cmAccountTeamHistoryList, String operation) {
        CMAccountTeamHistoryResult cmAccountTeamHistoryResObj = new CMAccountTeamHistoryResult();
        try {
            
            if(cmAccountTeamHistoryList != null && cmAccountTeamHistoryList.size() > 0) {
                
                List<CM_Account_Team_History__c> activeVPCRRecordsList = new List<CM_Account_Team_History__c>();
                List<CM_Account_Team_History__c> activeRVPRecordsList = new List<CM_Account_Team_History__c>();
                List<CM_Account_Team_History__c> activeSCERecordsList = new List<CM_Account_Team_History__c>();
                Id accountOwnerId = cmAccountTeamHistoryList[0].Account_Firm__r.OwnerId;			
                Map<String, List<CM_Account_Team_History__c>> sceVpcrsDataMap = new Map<String, List<CM_Account_Team_History__c>>();
                Boolean isVPCRExists = false;
                
                for(CM_Account_Team_History__c cmAccountTeamHistoryObj : cmAccountTeamHistoryList) {
                    
                    Date startDate = cmAccountTeamHistoryObj.Case_Management_Start_Date__c;
                    Date endDate = cmAccountTeamHistoryObj.Case_Management_End_Date__c;
                    String roleName = cmAccountTeamHistoryObj.Role__c;                    
                    
                    
                    if(roleName != null && roleName.trim().length() > 0 && startDate != null) {
                        if(roleName.equalsIgnoreCase(System.Label.CM_RVP) && cmAccountTeamHistoryObj.IsVPCR__c != null) {
                            if(endDate != null && endDate >= System.today()) {
                                if(cmAccountTeamHistoryObj.IsVPCR__c) {
                                    sceVpcrsMapData('VPCRWithEndDate', sceVpcrsDataMap, cmAccountTeamHistoryObj);
                                    isVPCRExists = true;
                                } else if(cmAccountTeamHistoryObj.IsVPCR__c == false) {
                                    sceVpcrsMapData('RVPWithEndDate', sceVpcrsDataMap, cmAccountTeamHistoryObj);                                        
                                }
                            } else if(endDate == null) {
                                if(cmAccountTeamHistoryObj.IsVPCR__c) {
                                    sceVpcrsMapData('VPCRWithoutEndDate', sceVpcrsDataMap, cmAccountTeamHistoryObj); 
                                    isVPCRExists = true;
                                } else if(cmAccountTeamHistoryObj.IsVPCR__c == false) {
                                    sceVpcrsMapData('RVPWithoutEndDate', sceVpcrsDataMap, cmAccountTeamHistoryObj);                                        
                                }
                            }
                        } else if(roleName.equalsIgnoreCase(System.Label.CM_SCE) || roleName.equalsIgnoreCase('Surest CM SCE')) { //|| roleName.equalsIgnoreCase(System.Label.Specialty_Benefit_SCE) - Added by SAMARTH                     
                            if(endDate != null && endDate >= System.today()) {
                                sceVpcrsMapData('SCEWithEndDate', sceVpcrsDataMap, cmAccountTeamHistoryObj);                                     
                            } else if(endDate == null) {
                                sceVpcrsMapData('SCEWithoutEndDate', sceVpcrsDataMap, cmAccountTeamHistoryObj);                                    
                            }
                        }           
                        if(roleName.equalsIgnoreCase(System.Label.Specialty_Benefit_SCE)){
                            system.debug('In'+System.Label.Specialty_Benefit_SCE +'roleName'+roleName);
                            if(endDate != null && endDate >= System.today()) {
                                sceVpcrsMapData('SpecialtySCEWithEndDate', sceVpcrsDataMap, cmAccountTeamHistoryObj);                                     
                            } else if(endDate == null) {
                                sceVpcrsMapData('SpecialtySCEWithoutEndDate', sceVpcrsDataMap, cmAccountTeamHistoryObj);                                    
                            }
                        }
                    }                    
                    
                }
                
                
                
                if(sceVpcrsDataMap != null && sceVpcrsDataMap.size() > 0) {
                    
                    List<CM_Account_Team_History__c> sceListWithEndDate = sceVpcrsDataMap.get('SCEWithEndDate');
                    sceListWithEndDate = (sceListWithEndDate != null && sceListWithEndDate.size() > 0) ? sceListWithEndDate : new List<CM_Account_Team_History__c>(); 
                    
                    List<CM_Account_Team_History__c> sceListWithoutEndDate = sceVpcrsDataMap.get('SCEWithoutEndDate');
                    sceListWithoutEndDate = (sceListWithoutEndDate != null && sceListWithoutEndDate.size() > 0) ? sceListWithoutEndDate : new List<CM_Account_Team_History__c>(); 
                    
                    Integer sceListWithEndDateSize = sceListWithEndDate.size();
                    Integer sceListWithoutEndDateSize = sceListWithoutEndDate.size();
                    
                    // For Specialty SCE
                    List<CM_Account_Team_History__c> SpecialtysceListWithEndDate = sceVpcrsDataMap.get('SpecialtySCEWithEndDate');
                    SpecialtysceListWithEndDate = (SpecialtysceListWithEndDate != null && SpecialtysceListWithEndDate.size() > 0) ? SpecialtysceListWithEndDate : new List<CM_Account_Team_History__c>(); 
                    
                    List<CM_Account_Team_History__c> SpecialtysceListWithoutEndDate = sceVpcrsDataMap.get('SpecialtySCEWithoutEndDate');
                    SpecialtysceListWithoutEndDate = (SpecialtysceListWithoutEndDate != null && SpecialtysceListWithoutEndDate.size() > 0) ? SpecialtysceListWithoutEndDate : new List<CM_Account_Team_History__c>(); 
                    
                    Integer SpecialtysceListWithEndDateSize = SpecialtysceListWithEndDate.size();
                    Integer SpecialtysceListWithoutEndDateSize = SpecialtysceListWithoutEndDate.size();
                    
                    
                    //system.debug('sceListWithEndDateSize '+sceListWithEndDateSize);
                    //system.debug('sceListWithoutEndDateSize '+sceListWithoutEndDateSize);
                    if(sceListWithEndDateSize > 0 || sceListWithoutEndDateSize > 0) {
                        //system.debug('inside 1st if');
                        if(sceListWithEndDateSize == 1 && sceListWithoutEndDateSize == 1) {
                            updateVpcrRvpScesData(false, true, sceListWithEndDate, cmAccountTeamHistoryResObj);
                            cmAccountTeamHistoryResObj.sce1 = true;
                            cmAccountTeamHistoryResObj.cmSCERowID1 = sceListWithoutEndDate[0].User__c;
                            cmAccountTeamHistoryResObj.cmSCEName1 = sceListWithoutEndDate[0].Name+' '+sceListWithoutEndDate[0].Last_Name__c;
                            cmAccountTeamHistoryResObj.futureCMSCEStartDate = sceListWithoutEndDate[0].Case_Management_Start_Date__c;
                            
                        } else {
                            
                            List<CM_Account_Team_History__c> naSalesTeamList = new List<CM_Account_Team_History__c>();
                            
                            if(sceVpcrsDataMap.get('SCEWithoutEndDate') != null && sceVpcrsDataMap.get('SCEWithoutEndDate').size() > 0) {
                                naSalesTeamList.addAll(sceVpcrsDataMap.get('SCEWithoutEndDate'));
                            }
                            if(sceVpcrsDataMap.get('SCEWithEndDate') != null && sceVpcrsDataMap.get('SCEWithEndDate').size() > 0) {
                                naSalesTeamList.addAll(sceVpcrsDataMap.get('SCEWithEndDate'));  
                            }                            
                            cmAccountTeamHistoryResObj.sce1 = true;
                            cmAccountTeamHistoryResObj.cmSCERowID1 = null;
                            cmAccountTeamHistoryResObj.cmSCEName1 = null;
                            cmAccountTeamHistoryResObj.futureCMSCEStartDate = null;
                            
                            Boolean isAccOwnerFound = false;
                            
                            for(CM_Account_Team_History__c cmAccTeamHisObj : naSalesTeamList) {
                                
                                if(cmAccTeamHisObj.User__c == accountOwnerId) {
                                    
                                    isAccOwnerFound = true;
                                    cmAccountTeamHistoryResObj.sce = true;
                                    cmAccountTeamHistoryResObj.cmSCERowID = cmAccTeamHisObj.User__c;
                                    cmAccountTeamHistoryResObj.cmSCEName = cmAccTeamHisObj.Name+' '+cmAccTeamHisObj.Last_Name__c;                                
                                    break;
                                }
                            } 
                            //System.debug('isAccOwnerFound-'+isAccOwnerFound);
                            if(isAccOwnerFound == false) {
                                naSalesTeamList = sortListForStartDateInAscOrDesc(naSalesTeamList, null, true);
                                //system.debug('naSalesTeamList-'+naSalesTeamList);
                                updateVpcrRvpScesData(false, true, naSalesTeamList, cmAccountTeamHistoryResObj);
                            }
                        }
                    }
                    
                    if(SpecialtysceListWithEndDateSize > 0 || SpecialtysceListWithoutEndDateSize > 0) {
                        system.debug('inside 1st if Specialty'+cmAccountTeamHistoryResObj.sce);
                        System.debug('cmAccountTeamHistoryResObj'+cmAccountTeamHistoryResObj);
                        System.debug('SpecialtysceListWithEndDate'+SpecialtysceListWithEndDate);
                        if(SpecialtysceListWithEndDateSize == 1 && SpecialtysceListWithoutEndDateSize == 1) {
                            system.debug('inside 2nd if Specialty'+cmAccountTeamHistoryResObj.sce);
                            if(cmAccountTeamHistoryResObj.sce ==null)
                                updateVpcrRvpScesData(false, true, SpecialtysceListWithEndDate, cmAccountTeamHistoryResObj);
                            else if(cmAccountTeamHistoryResObj.sce ==false)
                                updateVpcrRvpScesData(false, true, SpecialtysceListWithEndDate, cmAccountTeamHistoryResObj);
                            cmAccountTeamHistoryResObj.Specialtysce = true;
                            cmAccountTeamHistoryResObj.SpecialtycmSCERowID = SpecialtysceListWithEndDate[0].User__c;
                            cmAccountTeamHistoryResObj.Specialtysce1 = true;
                            cmAccountTeamHistoryResObj.SpecialtycmSCERowID1 = SpecialtysceListWithoutEndDate[0].User__c;
                            cmAccountTeamHistoryResObj.SpecialtycmSCEName1 = SpecialtysceListWithoutEndDate[0].Name+' '+SpecialtysceListWithoutEndDate[0].Last_Name__c;
                            system.debug('SpecialtysceListWithoutEndDate[0].Case_Management_Start_Date__c'+SpecialtysceListWithoutEndDate[0].Case_Management_Start_Date__c);
                            cmAccountTeamHistoryResObj.futureSpecialtySCEDate = SpecialtysceListWithoutEndDate[0].Case_Management_Start_Date__c;
                            
                        } else {
                            
                            List<CM_Account_Team_History__c> naSalesTeamList = new List<CM_Account_Team_History__c>();
                            
                            if(sceVpcrsDataMap.get('SpecialtySCEWithoutEndDate') != null && sceVpcrsDataMap.get('SpecialtySCEWithoutEndDate').size() > 0) {
                                naSalesTeamList.addAll(sceVpcrsDataMap.get('SpecialtySCEWithoutEndDate'));
                            }
                            if(sceVpcrsDataMap.get('SpecialtySCEWithEndDate') != null && sceVpcrsDataMap.get('SpecialtySCEWithEndDate').size() > 0) {
                                naSalesTeamList.addAll(sceVpcrsDataMap.get('SpecialtySCEWithEndDate'));  
                            } 
                            if(cmAccountTeamHistoryResObj.sce ==null)
                                updateVpcrRvpScesData(false, true, naSalesTeamList, cmAccountTeamHistoryResObj);
                            else if(cmAccountTeamHistoryResObj.sce ==false)
                                updateVpcrRvpScesData(false, true, naSalesTeamList, cmAccountTeamHistoryResObj);
                            cmAccountTeamHistoryResObj.Specialtysce1 = true;
                            cmAccountTeamHistoryResObj.SpecialtycmSCERowID1 = null;
                            cmAccountTeamHistoryResObj.SpecialtycmSCEName1 = null;
                            cmAccountTeamHistoryResObj.futureSpecialtySCEDate = null;
                            
                            for(CM_Account_Team_History__c cmAccTeamHisObj : naSalesTeamList) {
                                if(cmAccTeamHisObj.Role__c == System.Label.Specialty_Benefit_SCE) {
                                    system.debug('Specialty'+cmAccTeamHisObj.Name+' '+cmAccTeamHisObj.Last_Name__c);
                                    cmAccountTeamHistoryResObj.Specialtysce = true;
                                    cmAccountTeamHistoryResObj.SpecialtycmSCERowID = cmAccTeamHisObj.User__c;
                                    cmAccountTeamHistoryResObj.SpecialtycmSCEName = cmAccTeamHisObj.Name+' '+cmAccTeamHisObj.Last_Name__c;                                
                                    break;
                                }
                            } 
                        }
                    }
                    
                    
                    /* Reminder Alerts for more than one SCE in the NA Sales Team Applet  */
                    if((sceListWithEndDateSize > 1 && sceListWithoutEndDateSize > 1) || (SpecialtysceListWithEndDateSize > 1 && SpecialtysceListWithoutEndDateSize > 1)) {
                        
                        cmAccountTeamHistoryResObj.futureSCEValidationMsg = System.Label.NA_Sales_Team_SCE_Reminder_EndDates_Msg;
                        
                    } else if(sceListWithoutEndDateSize > 1 || SpecialtysceListWithoutEndDateSize > 1 ) {
                        
                        cmAccountTeamHistoryResObj.futureSCEValidationMsg = System.Label.NA_Sales_Team_SCE_Reminder_NoEndDate_Msg;
                        
                    } else if(sceListWithEndDateSize > 1 || SpecialtysceListWithEndDateSize > 1) {
                        
                        cmAccountTeamHistoryResObj.futureSCEValidationMsg = System.Label.NA_Sales_Team_SCE_Reminder_EndDate_Msg;
                        
                    }
                    
                    if(isVPCRExists) {                                                                    
                        updateVPCRRVPsData('VPCR', sceVpcrsDataMap, cmAccountTeamHistoryResObj);                        
                    } else {                        
                        updateVPCRRVPsData('RVP', sceVpcrsDataMap, cmAccountTeamHistoryResObj);                        
                    }                    
                }
            }
            
        } catch(Exception e) {
            System.debug('Error occurred in getActiveCMAccountTeamHistoryRecords() method - '+e);
            System.debug('Error occurred in getActiveCMAccountTeamHistoryRecords() method - '+e.getMessage());
            System.debug(e.getLinenumber());
        }
        return cmAccountTeamHistoryResObj;
    }
    
    public static void sceVpcrsMapData(String roleNameMapKey, Map<String, List<CM_Account_Team_History__c>>sceVpcrsDataMap, CM_Account_Team_History__c cmAccountTeamHistoryObj) {
        
        List<CM_Account_Team_History__c> sCEOrVpcrsList = new List<CM_Account_Team_History__c>();
        if(sceVpcrsDataMap.get(roleNameMapKey) != null && sceVpcrsDataMap.get(roleNameMapKey).size() > 0) {
            sCEOrVpcrsList = sceVpcrsDataMap.get(roleNameMapKey);
            sCEOrVpcrsList.add(cmAccountTeamHistoryObj);
        } else {
            sCEOrVpcrsList = new List<CM_Account_Team_History__c>();
            sCEOrVpcrsList.add(cmAccountTeamHistoryObj);                                            
        }   
        sceVpcrsDataMap.put(roleNameMapKey, sCEOrVpcrsList);
        
    }
    
    public static void updateVPCRRVPsData(String vpcrRvpName, Map<String, List<CM_Account_Team_History__c>>sceVpcrsDataMap, CMAccountTeamHistoryResult cmAccountTeamHistoryResObj) {
        
        List<CM_Account_Team_History__c> vpcrRVPsListWithEndDate = sceVpcrsDataMap.get(vpcrRvpName+'WithEndDate');
        vpcrRVPsListWithEndDate = (vpcrRVPsListWithEndDate != null && vpcrRVPsListWithEndDate.size() > 0) ? vpcrRVPsListWithEndDate : new List<CM_Account_Team_History__c>(); 
        
        List<CM_Account_Team_History__c> vpcrRVPsListWithoutEndDate = sceVpcrsDataMap.get(vpcrRvpName+'WithoutEndDate');
        vpcrRVPsListWithoutEndDate = (vpcrRVPsListWithoutEndDate != null && vpcrRVPsListWithoutEndDate.size() > 0) ? vpcrRVPsListWithoutEndDate : new List<CM_Account_Team_History__c>();
        
        Integer vpcrRVPsListWithEndDateSize = vpcrRVPsListWithEndDate.size();
        Integer vpcrRVPsListWithoutEndDateSize = vpcrRVPsListWithoutEndDate.size();                
        
        List<CM_Account_Team_History__c> rvpListWithEndDate = new List<CM_Account_Team_History__c>();
        List<CM_Account_Team_History__c> rvpListWithoutEndDate = new List<CM_Account_Team_History__c>();
        Integer rvpsListWithEndDateSize = 0;
        Integer rvpsListWithoutEndDateSize = 0;                
        
        if(vpcrRvpName == 'VPCR') {
            
            rvpListWithEndDate = sceVpcrsDataMap.get('RVPWithEndDate');
            rvpListWithEndDate = (rvpListWithEndDate != null && rvpListWithEndDate.size() > 0) ? rvpListWithEndDate : new List<CM_Account_Team_History__c>(); 
            
            rvpListWithoutEndDate = sceVpcrsDataMap.get('RVPWithoutEndDate');
            rvpListWithoutEndDate = (rvpListWithoutEndDate != null && rvpListWithoutEndDate.size() > 0) ? rvpListWithoutEndDate : new List<CM_Account_Team_History__c>();
            
            rvpsListWithEndDateSize = rvpListWithEndDate.size();
            rvpsListWithoutEndDateSize = rvpListWithoutEndDate.size();
            
        }
        
        
        if(vpcrRVPsListWithEndDateSize == 1 && vpcrRVPsListWithoutEndDateSize == 1 && rvpsListWithEndDateSize == 0 && rvpsListWithoutEndDateSize == 0) {
            
            updateVpcrRvpScesData(true, true, vpcrRVPsListWithEndDate, cmAccountTeamHistoryResObj);
            cmAccountTeamHistoryResObj.vpcr1 = true;
            cmAccountTeamHistoryResObj.cmVPCRRVPRowID1 = vpcrRVPsListWithoutEndDate[0].User__c;
            cmAccountTeamHistoryResObj.cmVPCRRVPName1 = vpcrRVPsListWithoutEndDate[0].Name+' '+vpcrRVPsListWithoutEndDate[0].Last_Name__c;
            cmAccountTeamHistoryResObj.futureCMVpcrRVPStartDate = vpcrRVPsListWithoutEndDate[0].Case_Management_Start_Date__c;
            
        } else {
            
            if(vpcrRVPsListWithoutEndDateSize == 0 && vpcrRVPsListWithEndDateSize > 0) {
                
                if(vpcrRVPsListWithEndDateSize == 1) {
                    
                    List<CM_Account_Team_History__c> naSalesTeamList = new List<CM_Account_Team_History__c>();
                    if(vpcrRvpName == 'VPCR') {                        
                        if(rvpsListWithEndDateSize > 0) {
                            cmAccountTeamHistoryResObj.futureVpcrRvpValidationMsg = System.Label.NA_Sales_Team_VPCR_Reminder_EndDate_Msg;   
                        } else if(rvpsListWithoutEndDateSize > 1) {
                            cmAccountTeamHistoryResObj.futureVpcrRvpValidationMsg = System.Label.NA_Sales_Team_VPCR_Reminder_NoEndDate_Msg;
                            naSalesTeamList.addAll(vpcrRVPsListWithEndDate);
                        } else {
                            naSalesTeamList.addAll(vpcrRVPsListWithEndDate);
                        }                        
                    } else {
                        naSalesTeamList.addAll(vpcrRVPsListWithEndDate);
                    }
                    updateVpcrRvpScesData(true, false, naSalesTeamList, cmAccountTeamHistoryResObj);
                    
                    if(rvpsListWithoutEndDateSize == 1 && rvpsListWithEndDateSize == 0) {
                        
                        cmAccountTeamHistoryResObj.vpcr1 = true;
                        cmAccountTeamHistoryResObj.cmVPCRRVPRowID1 = rvpListWithoutEndDate[0].User__c;
                        cmAccountTeamHistoryResObj.cmVPCRRVPName1 = rvpListWithoutEndDate[0].Name+' '+rvpListWithoutEndDate[0].Last_Name__c;
                        cmAccountTeamHistoryResObj.futureCMVpcrRVPStartDate = rvpListWithoutEndDate[0].Case_Management_Start_Date__c;
                    }
                    
                } else {
                    
                    cmAccountTeamHistoryResObj.futureVpcrRvpValidationMsg = System.Label.NA_Sales_Team_VPCR_Reminder_EndDate_Msg;
                    
                    cmAccountTeamHistoryResObj.vpcr = true;
                    cmAccountTeamHistoryResObj.cmVPCRRVPRowID = null;
                    cmAccountTeamHistoryResObj.cmVPCRRVPName = null;
                    
                    updateVpcrRvpScesData(true, false, null, cmAccountTeamHistoryResObj);
                }
                
                
            } else if(vpcrRVPsListWithoutEndDateSize >= 1) {
                
                if(vpcrRVPsListWithEndDateSize == 0 && vpcrRVPsListWithoutEndDateSize == 1) {
                    
                    List<CM_Account_Team_History__c> naSalesTeamList = new List<CM_Account_Team_History__c>();
                    
                    if(rvpsListWithoutEndDateSize > 0) {
                        cmAccountTeamHistoryResObj.futureVpcrRvpValidationMsg = System.Label.NA_Sales_Team_VPCR_Reminder_NoEndDate_Msg;
                    }                    
                    
                    if(rvpsListWithEndDateSize == 1 && rvpsListWithoutEndDateSize == 0) {
                        
                        naSalesTeamList.addAll(rvpListWithEndDate);
                        updateVpcrRvpScesData(true, false, naSalesTeamList, cmAccountTeamHistoryResObj);
                        
                        cmAccountTeamHistoryResObj.vpcr1 = true;
                        cmAccountTeamHistoryResObj.cmVPCRRVPRowID1 = vpcrRVPsListWithoutEndDate[0].User__c;
                        cmAccountTeamHistoryResObj.cmVPCRRVPName1 = vpcrRVPsListWithoutEndDate[0].Name+' '+vpcrRVPsListWithoutEndDate[0].Last_Name__c;
                        cmAccountTeamHistoryResObj.futureCMVpcrRVPStartDate = vpcrRVPsListWithoutEndDate[0].Case_Management_Start_Date__c;
                        
                    } else if(rvpsListWithEndDateSize != null && rvpsListWithEndDateSize > 1) {
                        
                        cmAccountTeamHistoryResObj.futureVpcrRvpValidationMsg = System.Label.NA_Sales_Team_VPCR_Reminder_EndDate_Msg;                        
                        
                    } else if(rvpListWithoutEndDate != null && rvpListWithoutEndDate.size() > 0) {
                        
                        if(rvpsListWithEndDateSize > 0) {
                            naSalesTeamList.addAll(rvpListWithEndDate); 
                        } else {
                            naSalesTeamList.addAll(vpcrRVPsListWithoutEndDate); 
                        }
                        
                        /*naSalesTeamList.addAll(rvpListWithoutEndDate);

List<CMAccountTeamHistorySortWrapper> sortedList = new List<CMAccountTeamHistorySortWrapper>();
for(CM_Account_Team_History__c obj : naSalesTeamList) {
sortedList.add(new CMAccountTeamHistorySortWrapper(new CM_Account_Team_History__c(
Id=obj.Id,
Last_Name__c=obj.Last_Name__c,
Name=obj.Name,
User__c=obj.User__c,
Case_Management_Start_Date__c=obj.Case_Management_Start_Date__c
), 'Case_Management_Start_Date__c', true));                                                        
}
sortedList.sort();

naSalesTeamList = new List<CM_Account_Team_History__c>();
naSalesTeamList.add(sortedList[0].cmAccountTeamHistoryObj);*/
                        updateVpcrRvpScesData(true, false, naSalesTeamList, cmAccountTeamHistoryResObj);
                        
                    } else {
                        
                        naSalesTeamList.addAll(vpcrRVPsListWithoutEndDate);
                        updateVpcrRvpScesData(true, false, naSalesTeamList, cmAccountTeamHistoryResObj);
                    }
                    
                } else if(vpcrRVPsListWithEndDateSize > 1) { 
                    
                    cmAccountTeamHistoryResObj.futureVpcrRvpValidationMsg = System.Label.NA_Sales_Team_VPCR_Reminder_EndDate_Msg;
                    
                    cmAccountTeamHistoryResObj.vpcr = true;
                    cmAccountTeamHistoryResObj.cmVPCRRVPRowID = null;
                    cmAccountTeamHistoryResObj.cmVPCRRVPName = null;
                    
                    updateVpcrRvpScesData(true, false, null, cmAccountTeamHistoryResObj);
                    
                } else {
                    
                    cmAccountTeamHistoryResObj.futureVpcrRvpValidationMsg = System.Label.NA_Sales_Team_VPCR_Reminder_NoEndDate_Msg;
                    
                    List<CMAccountTeamHistorySortWrapper> sortedList = new List<CMAccountTeamHistorySortWrapper>();
                    for(CM_Account_Team_History__c obj : vpcrRVPsListWithoutEndDate) {
                        sortedList.add(new CMAccountTeamHistorySortWrapper(new CM_Account_Team_History__c(
                            Id=obj.Id,
                            Last_Name__c=obj.Last_Name__c,
                            Name=obj.Name,
                            User__c=obj.User__c,
                            Case_Management_Start_Date__c=obj.Case_Management_Start_Date__c
                        ), 'Case_Management_Start_Date__c', false));                                                        
                    } 
                    
                    if(sortedList != null && sortedList.size() > 0) {
                        
                        Integer sortedListSize = sortedList.size() - 1;
                        sortedList.sort();                                
                        CM_Account_Team_History__c cmAccTeamHisObj = sortedList[sortedListSize].cmAccountTeamHistoryObj;
                        
                        if(vpcrRVPsListWithEndDateSize == 1) {
                            
                            cmAccountTeamHistoryResObj.vpcr = true;
                            cmAccountTeamHistoryResObj.cmVPCRRVPRowID = vpcrRVPsListWithEndDate[0].User__c;
                            cmAccountTeamHistoryResObj.cmVPCRRVPName = vpcrRVPsListWithEndDate[0].Name+' '+vpcrRVPsListWithEndDate[0].Last_Name__c;
                            
                            /*cmAccountTeamHistoryResObj.vpcr1 = true;
cmAccountTeamHistoryResObj.cmVPCRRVPRowID1 = cmAccTeamHisObj.User__c;
cmAccountTeamHistoryResObj.cmVPCRRVPName1 = cmAccTeamHisObj.Name+' '+cmAccTeamHisObj.Last_Name__c;
cmAccountTeamHistoryResObj.futureCMVpcrRVPStartDate = cmAccTeamHisObj.Case_Management_Start_Date__c;*/
                            cmAccountTeamHistoryResObj.vpcr1 = true;
                            cmAccountTeamHistoryResObj.cmVPCRRVPRowID1 = null;
                            cmAccountTeamHistoryResObj.cmVPCRRVPName1 = null;
                            cmAccountTeamHistoryResObj.futureCMVpcrRVPStartDate = null;
                            
                        } else {
                            
                            cmAccountTeamHistoryResObj.vpcr = true;
                            cmAccountTeamHistoryResObj.cmVPCRRVPRowID = cmAccTeamHisObj.User__c;
                            cmAccountTeamHistoryResObj.cmVPCRRVPName = cmAccTeamHisObj.Name+' '+cmAccTeamHisObj.Last_Name__c;
                            
                            updateVpcrRvpScesData(true, false, null, cmAccountTeamHistoryResObj);                            
                        }                                                
                    }                    
                }                
            } 
        }
        
    }
    
    public static void updateVpcrRvpScesData(Boolean isVPCRRVP, Boolean isfuture, List<CM_Account_Team_History__c> naSalesTeamList, CMAccountTeamHistoryResult cmAccountTeamHistoryResObj) {        
        
        if(isVPCRRVP) {
            
            if(naSalesTeamList != null && naSalesTeamList.size() > 0) {
                cmAccountTeamHistoryResObj.vpcr = true;
                cmAccountTeamHistoryResObj.cmVPCRRVPRowID = naSalesTeamList[0].User__c;
                cmAccountTeamHistoryResObj.cmVPCRRVPName = naSalesTeamList[0].Name+' '+naSalesTeamList[0].Last_Name__c;  
            }            
            if(isfuture == false) {            
                cmAccountTeamHistoryResObj.vpcr1 = true;
                cmAccountTeamHistoryResObj.cmVPCRRVPRowID1 = null;
                cmAccountTeamHistoryResObj.cmVPCRRVPName1 = null;
                cmAccountTeamHistoryResObj.futureCMVpcrRVPStartDate = null;
            }
            
        } else {
            
            if(naSalesTeamList != null && naSalesTeamList.size() > 0) {
                cmAccountTeamHistoryResObj.sce = true;
                cmAccountTeamHistoryResObj.cmSCERowID = naSalesTeamList[0].User__c;
                cmAccountTeamHistoryResObj.cmSCEName = naSalesTeamList[0].Name+' '+naSalesTeamList[0].Last_Name__c;  
            }            
            if(isfuture == false) {            
                cmAccountTeamHistoryResObj.sce1 = true;
                cmAccountTeamHistoryResObj.cmSCERowID1 = null;
                cmAccountTeamHistoryResObj.cmSCEName1 = null;
                cmAccountTeamHistoryResObj.futureCMSCEStartDate = null;
            } 
        }            
        
    }
    
    public static List<CM_Account_Team_History__c> sortListForStartDateInAscOrDesc(List<CM_Account_Team_History__c> listtoBeSorted, Id accountOwnerId, Boolean ascOrDescOrder) {
        
        List<CM_Account_Team_History__c> cmAccountTeamHistoryObjList = new List<CM_Account_Team_History__c>();
        CM_Account_Team_History__c cmAccountTeamHistoryObj = new CM_Account_Team_History__c();
        
        try {
            
            if(listtoBeSorted.size() == 1) {
                
                cmAccountTeamHistoryObjList.add(listtoBeSorted[0]);
                
            } else {
                
                /*
* The below logic manually sorts the Case Management Start Date field in the active VPCR/RVP OR SCE List in descending order
* to update the latest Start Date record to the Account & Related Contacts Reporting fields using Comparable Interface.
*/ 
                
                List<CMAccountTeamHistorySortWrapper> sortedList = new List<CMAccountTeamHistorySortWrapper>();
                for(CM_Account_Team_History__c obj : listtoBeSorted) {
                    sortedList.add(new CMAccountTeamHistorySortWrapper(new CM_Account_Team_History__c(
                        Id=obj.Id,
                        Last_Name__c=obj.Last_Name__c,
                        Name=obj.Name,
                        User__c=obj.User__c,
                        Case_Management_Start_Date__c=obj.Case_Management_Start_Date__c
                    ), 'Case_Management_Start_Date__c', ascOrDescOrder));
                    
                }
                
                if(sortedList != null && sortedList.size() > 0) {
                    
                    sortedList.sort();
                    
                    if(accountOwnerId != null) {
                        
                        List<CM_Account_Team_History__c> cmAccountTeamHistoryList = new List<CM_Account_Team_History__c>();
                        for(CMAccountTeamHistorySortWrapper cmAccTeamHisWrapperObj : sortedList) {
                            CM_Account_Team_History__c cmAccTeamHisObj = cmAccTeamHisWrapperObj.cmAccountTeamHistoryObj;
                            if(cmAccTeamHisObj.User__c == accountOwnerId) {
                                cmAccountTeamHistoryObjList.add(cmAccTeamHisObj);
                            } else {
                                cmAccountTeamHistoryList.add(cmAccTeamHisObj); 
                            }
                        } 
                        
                        if(cmAccountTeamHistoryObjList.size() == 1 && cmAccountTeamHistoryList.size() > 0) {
                            cmAccountTeamHistoryObjList.add(cmAccountTeamHistoryList[0]);        
                        } else {
                            cmAccountTeamHistoryObjList.add(cmAccountTeamHistoryList[0]);
                            cmAccountTeamHistoryObjList.add(cmAccountTeamHistoryList[1]);
                        }
                        
                    } else {
                        
                        cmAccountTeamHistoryObjList.add((sortedList[0]).cmAccountTeamHistoryObj);
                    }
                }
            }
            
        } catch(Exception e) {
            System.debug('Exception occurred in sortListForStartDateInDesc() method while sorting the data -> ' + e);
        }
        
        return cmAccountTeamHistoryObjList;
    }
    
    /*
* Wrapper class to display National Account Sales Team Records
*/
    
    public class CMAccountTeamHistoryResult {
        
        @AuraEnabled
        public List<CM_Account_Team_History__c> cmAccountTeamHistoryList{ get;set; }
        
        @AuraEnabled
        public Boolean vpcr { get;set; }
        
        @AuraEnabled
        public Boolean vpcr1 { get;set; }
        
        @AuraEnabled
        public Boolean rvp { get;set; }
        
        @AuraEnabled
        public Boolean scePlayerCoach { get;set; }
        
        @AuraEnabled
        public Boolean sce { get;set; }
        
        @AuraEnabled
        public Boolean sce1 { get;set; }
        
        @AuraEnabled
        public Id cmVPCRRVPRowID { get;set; }
        
        @AuraEnabled
        public String cmVPCRRVPName { get;set; }
        
        @AuraEnabled
        public Id cmVPCRRVPRowID1{ get;set; }
        
        @AuraEnabled
        public String cmVPCRRVPName1 { get;set; }                
        
        @AuraEnabled
        public Date futureCMVpcrRVPStartDate { get;set; }
        
        @AuraEnabled
        public Id cmSCERowID { get;set; }
        
        @AuraEnabled
        public String cmSCEName { get;set; }
        
        @AuraEnabled
        public Id cmSCERowID1{ get;set; }
        
        @AuraEnabled
        public String cmSCEName1 { get;set; }
        
        @AuraEnabled
        public Date futureCMSCEStartDate { get;set; }
        
        @AuraEnabled
        public Id SpecialtycmSCERowID1{ get;set; }
        
        @AuraEnabled
        public String SpecialtycmSCEName1 { get;set; }
        
        @AuraEnabled
        public Date futureSpecialtySCEDate { get;set; }
        
        @AuraEnabled
        public Boolean Specialtysce { get;set; }
        
        @AuraEnabled
        public Boolean Specialtysce1 { get;set; }
        
        
        
        @AuraEnabled
        public Id SpecialtycmSCERowID { get;set; }
        
        @AuraEnabled
        public String SpecialtycmSCEName { get;set; }
        
        @AuraEnabled
        public String futureSCEValidationMsg { get;set; }
        
        @AuraEnabled
        public String futureVpcrRvpValidationMsg { get;set; }
        
        @AuraEnabled
        public Boolean isLoggedInUserRole { get;set; }
        
        public CMAccountTeamHistoryResult() {
            
            vpcr = false;
            rvp = false;
            scePlayerCoach = false;
        }
        
    }
    
    /*
* Wrapper class to display Users 
*/
    
    public class UserResult {
        
        @AuraEnabled
        public List<User> userList{ get;set; }
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
    }
}