public with sharing class ClientSurveyCtrl {
    
    @AuraEnabled
    public static List<opportunity> getOpty() {
        List<Opportunity> opps =
            [Select Id,Name,AccountId,
             Account.Name,Account.Owner.UserRole.Name,
             Comments_Last_Modified__c,
             CM_VPCR_RVP__r.Name,Comments__c,
             OwnerId,Owner.Name from opportunity
             where status__c = 'open' and CM_VPCR_RVP__r.Name !=null
             limit 1000];
        //Add isAccessible() check
        return opps;
    }
    
    @AuraEnabled
    public static boolean updateOppRecods(list<opportunity> opplist) {
        
        list<opportunity> updatedOpplist = new list<opportunity>();
        if(opplist.size()>0 && opplist != null){
            for(Opportunity op: opplist){
                op.Comments_Last_Modified__c=System.now();
                String comments = op.Comments__c;
                comments = comments.trim();
                if(comments != null && comments.length() > 0 && comments.length() > 4095) {
                    op.Comments_Reporting__c = comments.substring(0, 4095);
                } else {
                    op.Comments_Reporting__c = comments;
                }
                updatedOpplist.add(op);
            }
            update as user updatedOpplist;
            //Database.update( updatedOpplist, AccessLevel.USER_MODE );
            return true;
        }else{
            return false;
        }
    }
    
    @AuraEnabled
    public static User getUserRole(Id userId) {
        //String loggedInUserRole = '';
        User userDetails= new user();
        
        try {
            userDetails = [Select UserRole.Name,Id,Name,position__c, Email from User where Id=:userId];  //Added Vignesh CR - 3847
            
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        return userDetails;
    }  
    
    
    @AuraEnabled
    public static accountWrapper saveSCEValidation(Id accId){
        accountWrapper aw =new accountWrapper();
        Id userId = UserInfo.getUserId();
        //Datetime dtValue = datetime.now();
        account accDetails =new account();
        accDetails.Id =accId;
        accDetails.SCE_Validation_By__c =userId;
        /*Datetime now = Datetime.now();
Integer offset = UserInfo.getTimezone().getOffset(now);
Datetime local = now.addSeconds(offset/1000);*/
      accDetails.SCE_Validation_DateTime__c =datetime.now();
         SceCMValidation.updatingServiceAMTFields(accDetails.Id,accDetails.SCE_Validation_DateTime__c);
        SceCMValidation.updatingNATeamMemberFields(accDetails.Id,accDetails.SCE_Validation_DateTime__c);
        //SceCMValidation.saveSCEValidation(accDetails);
        //update accDetails;
        account returnAcc =SceCMValidation.saveSCEValidation(accDetails);
        if(returnAcc.SCE_Validation_DateTime__c!=null){
            Datetime now = returnAcc.SCE_Validation_DateTime__c;
            //Integer offset = UserInfo.getTimezone().getOffset(now);
            //Datetime local = now.addSeconds(offset/1000);
            //aw.validatedDate =local;
            //workitem.offset =offset;
            aw.validatedDate = returnAcc.SCE_Validation_DateTime__c;
        }
        aw.userName = returnAcc.SCE_Validation_By__r.Name;
        ClientSurveyCtrl.generateAndSendCleintSurveyPdf(returnAcc.Id);
        return aw;
    }
    
    
    
    @AuraEnabled
    public static accountWrapper saveCMCValidation(Id accId){
        accountWrapper aw =new accountWrapper();
        Id userId = UserInfo.getUserId();
        //Datetime dtValue = datetime.now();
        account accDetails =new account();
        accDetails.Id =accId;
        accDetails.CM_CMC_Validation_By__c =userId;
        accDetails.CM_CMC_Validation_DateTime__c =datetime.now();
        account returnAcc = SceCMValidation.saveCMCValidation(accDetails);
        if(returnAcc.CM_CMC_Validation_DateTime__c!=null){
            Datetime now = returnAcc.CM_CMC_Validation_DateTime__c;
            //Integer offset = UserInfo.getTimezone().getOffset(now);
            // Datetime local = now.addSeconds(offset/1000);
            aw.validatedDate =returnAcc.CM_CMC_Validation_DateTime__c;
            //workitem.offset =offset;
        }
        aw.userName = returnAcc.CM_CMC_Validation_By__r.Name;
        
        return aw;
        //return returnAcc;
    }
    
    @AuraEnabled
    public static WorkItemsClass_Wrapper getAccountsandOpportunities(Boolean OnLoad , Boolean OnFilter, String cmvcpfilter , String ownerfilter, String columnName, String sortType,string accId ) {
        WorkItemsClass_Wrapper workitem = new WorkItemsClass_Wrapper();
        try {
            Id userId = UserInfo.getUserId();
            User loggedInUserRole = getUserRole(userId);
            if(loggedInUserRole.UserRole.Name != null && loggedInUserRole.UserRole.Name != ''){
                workitem.loggedInUserRoleName = loggedInUserRole;
                
                Boolean isCustomTabVisible = false;
                Work_Items_Setting__mdt retriveDates = [SELECT Start_Date__c, Soft_Due_Date__c, End_Date__c FROM Work_Items_Setting__mdt WHERE DeveloperName = 'Client_NPS_Due_Date'];
                
                if(retriveDates.Start_Date__c != null && System.now() >= retriveDates.Start_Date__c && retriveDates.End_Date__c != null && System.now() <= retriveDates.End_Date__c) {
                    isCustomTabVisible = true;
                }
                
                if(retriveDates.End_Date__c != null) {
                    workitem.customSettingEndDate = retriveDates.End_Date__c.format('MM/dd/YYYY');
                }
                
                if(retriveDates.Soft_Due_Date__c != null) {
                    workitem.customSettingSoftDueDate = retriveDates.Soft_Due_Date__c.format('MM/dd/YYYY');
                }
                
                workitem.isCustomTabVisible = isCustomTabVisible;
                
                list<Client_Survey_Account__mdt> clientSurveyRecords = [SELECT Start_Date__c, End_Date__c,DeveloperName,label,Type__c,Message__c FROM Client_Survey_Account__mdt LIMIT 50000];
                workitem.getContacts = getContactRecords(accId);
                workitem.getAMTList  = getAMTListRecords(accId);
                workitem.clientSurveyCustomPermission = FeatureManagement.checkPermission('ClientSurveyPermission');
                
                if(workitem.getAMTList[0].CM_CMC_Validation_DateTime__c!=null){
                    Datetime now = workitem.getAMTList[0].CM_CMC_Validation_DateTime__c;
                    Integer offset = UserInfo.getTimezone().getOffset(workitem.getAMTList[0].CM_CMC_Validation_DateTime__c);
                    Datetime local = now.addSeconds(offset/1000);
                    workitem.cmcmcValidatedTime = local;
                    
                }
                
                if(workitem.getAMTList[0].SCE_Validation_DateTime__c!=null){
                    Datetime now   = workitem.getAMTList[0].SCE_Validation_DateTime__c;
                    Integer offset = UserInfo.getTimezone().getOffset(workitem.getAMTList[0].SCE_Validation_DateTime__c);
                    Datetime local = now.addSeconds(offset/1000);
                    workitem.sceValidatedTime =local;
                }
                //Account businessLine =[select id,Subtype__c from account where id=:accId limit 1];
                workitem.businessLine = workItem.getAMTList[0].Subtype__c;
                System.debug('clientSurveyRecords==>'+clientSurveyRecords);
                workitem.getCurrentProduct = getCurrentProductRecords(accId);
                workitem.clientSurveyDates = clientSurveyRecords;
                System.debug('workitem.clientSurveyDates==>'+workitem.clientSurveyDates);
                
                
                //Added Vignesh - CR 3847
                AMTRoleWrapper wrapper = new AMTRoleWrapper();
                Id currentUserId = UserInfo.getUserId();
                String currentUserEmail = [SELECT Email FROM User WHERE Id = :currentUserId LIMIT 1].Email;
                Boolean isclientManagersCheck = false;
                Boolean issurestClientManagersCheck = false;
                Boolean isspecialtyClientManagersCheck = false;
                Boolean isCMLoggedin =false;
                Boolean isSBCMLoggedin =false;
                Boolean isSCMLoggedin =false;
                
                List<Account> accountsWithAMT = [ SELECT Id, Name,(SELECT Id, Contact_Role__c, Primary__c, First_Name__c, Last_Name__c, Case_Management_End_Date__c, Email__c,Case_Management_Start_Date__c
                    FROM Service_AMT__r WHERE company__c = :accId AND ((Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= TODAY) AND Case_Management_Start_Date__c <= TODAY)) FROM Account WHERE Id = :accId WITH USER_MODE];
                               
                
                if (!accountsWithAMT.isEmpty()) {
                    for (Service_AMT__c record : accountsWithAMT[0].Service_AMT__r) {
                       String role = record.Contact_Role__c;

                        if (role == 'Client Manager') {
                            wrapper.clientManagers.add(record);
                            isclientManagersCheck = true;
                            if(record.Email__c==currentUserEmail){
                                isCMLoggedin =true;
                            }
                            
                        } else if (role == 'Surest Client Manager') {
                            wrapper.surestClientManagers.add(record);
                            issurestClientManagersCheck = true;
                            if(record.Email__c==currentUserEmail){
                                isSCMLoggedin =true;
                            }
                        }
                        
                        else if (role == 'Specialty Benefits Client Manager') {
                            wrapper.specialtyClientManagers.add(record);
                            isspecialtyClientManagersCheck = true;
                            if(record.Email__c==currentUserEmail){
                                isSBCMLoggedin =true;
                            }
                        }
                        
                        
                        
                    }

                    workitem.isCMLoggedin = isCMLoggedin;
                    workitem.isSBCMLoggedin = isSBCMLoggedin;
                    workitem.isSCMLoggedin = isSCMLoggedin;
                    workitem.isclientManagersCheck = isclientManagersCheck;
                    workitem.isspecialtyClientManagersCheck = isspecialtyClientManagersCheck;
                    workitem.issurestClientManagersCheck = issurestClientManagersCheck;
                }
            
                //Added Vignesh - 25/06/25 CS 2026
                Boolean iscmsceCheck = false;
                Boolean issurestCmsceCheck = false;
                Boolean isspecialtybenefitsSceCheck = false;
                Boolean isCmsceLoggedin =false;
                Boolean isSpeBenSceLoggedin =false;
                Boolean isSurestCmsceLoggedin =false;
                
                List<Account> accountsWithNASaleTeam = [ SELECT Id, Name,(SELECT Id, Role__c, Name, Last_Name__c, Case_Management_End_Date__c,Case_Management_Start_Date__c,User__c, User__r.Email from CM_Account_Team_Historys__r 
                                   WHERE Account_Firm__c = :accId AND ((Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= TODAY) AND Case_Management_Start_Date__c <= TODAY)) FROM Account WHERE Id = :accId WITH USER_MODE];
                               
               if (!accountsWithNASaleTeam.isEmpty()) {
                    for (CM_Account_Team_History__c allRecord : accountsWithNASaleTeam[0].CM_Account_Team_Historys__r) {
                       String role = allRecord.Role__c;

                        if (role == 'CM SCE') {
                            wrapper.cmSce.add(allRecord);
                            iscmsceCheck = true;
                            if(allRecord.User__r.Email==currentUserEmail){
                                isCmsceLoggedin =true;
                            }
                            
                        } else if (role == 'Surest CM SCE') {
                            wrapper.surestCmSce.add(allRecord);
                            issurestCmsceCheck = true;
                            if(allRecord.User__r.Email==currentUserEmail){
                                isSurestCmsceLoggedin =true;
                            }
                        }
                        
                        else if (role == 'Specialty Benefits SCE') {
                            wrapper.specialtybenefitSce.add(allRecord);
                            isspecialtybenefitsSceCheck = true;
                            if(allRecord.User__r.Email==currentUserEmail){
                                isSpeBenSceLoggedin =true;
                            }
                        }
                        
                        
                        
                    }

                    workitem.isCmsceLoggedin = isCmsceLoggedin;
                    workitem.isSpeBenSceLoggedin = isSpeBenSceLoggedin;
                    workitem.isSurestCmsceLoggedin = isSurestCmsceLoggedin;
                    workitem.iscmsceCheck = iscmsceCheck;
                    workitem.isspecialtybenefitsSceCheck = isspecialtybenefitsSceCheck;
                    workitem.issurestCmsceCheck = issurestCmsceCheck;
                } 
                
            } 
            
        } catch(Exception e){
            system.debug('Error Line Number'+e.getLineNumber());
            System.debug(e.getMessage()+e.getStackTraceString());
            System.debug('Error occurred in getAccountsandOpportunities method - '+e);
            
        }
        return workitem;        
    }
    
    @AuraEnabled
    public static WorkItemsClass_Wrapper LoggedInUserData(Id userId, String loggedInAs, Boolean onLoad, Boolean onFilter, String cmvcpfilter, String ownerfilter, WorkItemsClass_Wrapper workitem, String  columnName, String sortType) {
        
        
        UHGMASOQLConstants uhgMASOQLConstantsObj = new UHGMASOQLConstants();
        
        loggedInAs = String.escapeSingleQuotes(loggedInAs);
        cmvcpfilter = String.escapeSingleQuotes(cmvcpfilter);
        ownerfilter = String.escapeSingleQuotes(ownerfilter);
        sortType = String.escapeSingleQuotes(sortType);
        columnName = String.escapeSingleQuotes(columnName);
        
        loggedInAs = (loggedInAs != null) ? loggedInAs : '';
        onLoad = (onLoad != null) ? onLoad : false;
        onFilter = (onFilter != null) ? onFilter : false;
        cmvcpfilter = (cmvcpfilter != null) ? cmvcpfilter : '';
        ownerfilter = (ownerfilter != null) ? ownerfilter : '';
        columnName = (columnName != null)? columnName : 'Name';
        sortType = (sortType != null)? sortType : 'ASC';
        sortType = sortType + ' nulls last';
        
        List<Opportunity> oppList = new List<Opportunity>();
        String queryVal = '';
        if(onLoad) {
            if(loggedInAs == 'Admin') {
                queryVal = ' ORDER BY '+columnName+' '+sortType;
                oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal);
                System.debug('oppList'+oppList);
            }else if(loggedInAs == 'CMVPCR'){
                queryVal = ' AND CM_VPCR_RVP__r.Id=:userId ORDER BY '+columnName+' '+sortType;
                oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
            }else if (loggedInAs == 'CMSCE'){
                queryVal = ' AND OwnerId=:userId ORDER BY '+columnName+' '+sortType;
                oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal);
            }  
        } else if (onFilter) {
            if(loggedInAs == 'Admin') {
                if(cmvcpfilter != '' && ownerfilter != '') {
                    if(cmvcpfilter == 'All' && ownerfilter == 'All') {
                        queryVal = ' ORDER BY '+columnName+' '+sortType;
                        oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                    } else if(cmvcpfilter == 'All') {
                        queryVal = ' AND Owner.Name=:ownerfilter ORDER BY '+columnName+' '+sortType;
                        oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                    } else if(ownerfilter == 'All') {
                        queryVal = ' AND CM_VPCR_RVP__r.Name=:cmvcpfilter ORDER BY '+columnName+' '+sortType;
                        oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                    } else {
                        queryVal = ' AND Owner.Name=:ownerfilter AND Owner.Name=:ownerfilter ORDER BY '+columnName+' '+sortType;
                        oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                    }
                } else {
                    queryVal = ' ORDER BY columnName sortType ';
                    oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal);
                }
            } else if(loggedInAs == 'CMVPCR') {
                if(cmvcpfilter == '' && ownerfilter == 'All') { 
                    queryVal = ' AND CM_VPCR_RVP__r.Id=:userId ORDER BY '+columnName+' '+sortType;
                    oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                } else if(ownerfilter != '') { 
                    queryVal = ' AND CM_VPCR_RVP__r.Id=:userId AND Owner.Name=:ownerfilter ORDER BY '+columnName+' '+sortType;
                    oppList = Database.query(uhgMASOQLConstantsObj.QUERY_FOR_WORK_ITEMS+queryVal); 
                }
            }           
        }
        
        if(oppList !=null && oppList.size() > 0) {
            workitem.cmSceOppList = oppList;
        }
        
        if(loggedInAs == 'Admin' || loggedInAs == 'CMVPCR') {
            
            set<String> oppOwnweSet = new set<String>();
            set<String> oppCMVPCRRVPSet = new set<String>();
            
            Map<String,set<String>> vpcrSCEMap = new Map<String,set<String>>();
            for(Opportunity obj : oppList) {
                if(vpcrSCEMap != null && vpcrSCEMap.size() > 0 && vpcrSCEMap.containsKey(obj.CM_VPCR_RVP__r.Name)) {
                    set<String> sceOwnersList = vpcrSCEMap.get(obj.CM_VPCR_RVP__r.Name);
                    sceOwnersList.add(obj.owner.Name);
                    vpcrSCEMap.put(obj.CM_VPCR_RVP__r.Name, sceOwnersList);
                } else {
                    set<String> sceOwnersList = new set<String>();
                    sceOwnersList.add(obj.owner.Name);
                    vpcrSCEMap.put(obj.CM_VPCR_RVP__r.Name, sceOwnersList);
                }
                
                oppOwnweSet.add(obj.owner.Name);
                oppCMVPCRRVPSet.add(obj.CM_VPCR_RVP__r.Name); 
            }
            
            
            if(vpcrSCEMap !=null && vpcrSCEMap.size() > 0) {
                workitem.vpcrSCEMapWrap =vpcrSCEMap ;
            }
            if(oppOwnweSet != null && oppOwnweSet.size() > 0){
                workitem.oppOwnweSetWrap = oppOwnweSet;
            }
            if(oppCMVPCRRVPSet != null && oppCMVPCRRVPSet.size() > 0){
                workitem.oppCMVPCRRVPSetWrap = oppCMVPCRRVPSet;
            }
        }
        
        return workitem;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactRecords(string accId) {
        
        List<Contact> contactRecords = new List<Contact>();
        contactRecords = [SELECT Id, Account.Name, Correspondence_Type__c, Survey_Type__c, FirstName, LastName, Email, Contact_Source__c, CSI_Survey_Contact__c FROM Contact WHERE  Account.Id =: accId AND Correspondence_Type__c INCLUDES ('Customer Survey - Secondary' , 'Customer Survey - Primary') AND Status__c = 'Active' WITH USER_MODE];
        return contactRecords;
    }
    
    @AuraEnabled(cacheable=true)
    public static list<account> getAMTListRecords(string accId) {
        
        accId = String.escapeSingleQuotes(accId);
        return new list<account>([SELECT Id, Name, UMR_Client_Platform__c, CM_SCE__r.Email, recordtype.Name, CM_SCE__r.LastName, CM_SCE__r.FirstName,Exclude_Specialty_Benefits_SCE_Survey__c,Subtype__c, CM_CMC_Validation_By__r.Name, Specialty_SCE__r.Name,Specialty_SCE__r.FirstName,Specialty_SCE__r.LastName,Specialty_SCE__c,CM_CMC_Validation_By__r.Email,CM_CMC_Validation_DateTime__c,SCE_Validation_By__r.Name, SCE_Validation_By__r.Email,SCE_Validation_DateTime__c,(SELECT Id, Contact_Role__c, Exclude_AMT_Role_from_Survey__c, Primary__c, First_Name__c, Last_Name__c, Case_Management_End_Date__c, Email__c,Case_Management_Start_Date__c FROM Service_AMT__r WHERE company__c=:accId AND ((Case_Management_End_Date__c = null OR Case_Management_End_Date__c >= TODAY) AND Case_Management_Start_Date__c <= TODAY)) FROM Account WHERE Id=:accId WITH USER_MODE]);
    }
    
    @AuraEnabled(cacheable=true)
    public static ProductMix__c getCurrentProductRecords(string accId) {
        
        accId = String.escapeSingleQuotes(accId);
        ProductMix__c cpRecords = new ProductMix__c();
         if(Pattern.matches('[a-zA-Z0-9]{18}', accId) && !String.isEmpty(accId)){
                cpRecords = [SELECT Id, AccountFirm__c, Pharmacy__c, Dental__c,Vision__c,Supplemental_Health__c,CHD_Center_of_Excellence__c,
                     Care_Management__c,Decision_Support__c,Women_s_Health__c,Disease_Management__c,Wellness_and_Wellness_Coaching__c,Worksite_Wellness__c,
                     Rally_Client_above_base__c, Incentive_Products__c, Health_Savings_Account_HSA__c,Health_Reimbursement_Account_HRA__c,
                     Flexible_Spending_Account_FSA__c,Behavioral_Health__c,EAP_Domestic__c,EAP_Global__c,Retiree_Products__c,Centers_of_Excellence__c,
                     UHC_UMR_Member_Service_and_Tools__c,UHC_UMR_Telehealth_Solutions__c,UMR_COBRA_Services__c,Member_Service_Vendor__c,UHC_Cobra_Administration__c,Surest__c,UHC_Hub__c,Financial_Accounts__c 
                     FROM ProductMix__c WHERE AccountFirm__c =: string.escapesinglequotes(accId)];
            }        
        return cpRecords;
    }
    
    @AuraEnabled
    public static ProductMix__c saveCurrentProductData(ProductMix__c ProductMix){
        return ClientSurveyDML.updateProductMix(ProductMix);
    }
    
    @AuraEnabled
    public static contactsAndRecordTypeId fetchDefaultContacts(string accId) {
        Id userId = UserInfo.getUserId();
        contactsAndRecordTypeId conAndRecTypeId = new contactsAndRecordTypeId();
        User userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Name FROM User where Id=:userId];
        
        List<Contact> contactRecords = new List<Contact>();
        List<Contact> workItemsContacts = new List<Contact>();
        List<Contact> nonWorkItemsContacts = new List<Contact>();
        List<Contact> defaultContacts = new List<Contact>();
        
        if(userDetails.UserRole.Name == 'CM VPCR/RVP') {
            contactRecords = [SELECT Id, FirstName, LastName, Email, Account.Name, Correspondence_Type__c, Survey_Type__c,Contact_Source__c,CSI_Survey_Contact__c FROM Contact WHERE Account.Id =: accId AND Status__c = 'Active' WITH USER_MODE];
        } else {
            contactRecords = [SELECT Id, FirstName, LastName, Email, Account.Name, Correspondence_Type__c, Survey_Type__c,Contact_Source__c,CSI_Survey_Contact__c FROM Contact WHERE Account.Id =: accId AND Status__c = 'Active' WITH USER_MODE];
        }
        
        /* Sort records based on Non-Work items Records to come at top of the list and then Work Item Records adds to the List - START */
        for(Integer i = 0 ; i < contactRecords.size() ; i++) {
            if(contactRecords[i].Correspondence_Type__c != null && (contactRecords[i].Correspondence_Type__c.contains('Customer Survey - Primary') || contactRecords[i].Correspondence_Type__c.contains('Customer Survey - Secondary'))) {
                //Add work items records to workItemsContacts List
                workItemsContacts.add(contactRecords[i]);
            } else {
                nonWorkItemsContacts.add(contactRecords[i]);
            }
        }
        
        if(nonWorkItemsContacts.size() > 0) {
            defaultContacts.addAll(nonWorkItemsContacts);
        }
        
        if(workItemsContacts.size() > 0) {
            defaultContacts.addAll(workItemsContacts);
        }
        conAndRecTypeId.returnDefaultContacts = defaultContacts;
        
        /* Sort records based on Non-Work items Records to come at top of the list and then Work Item Records adds to the List - END */
        
        conAndRecTypeId.recordTypeId = [SELECT id from RecordType where Name ='CM Contact' WITH USER_MODE].Id;
        return conAndRecTypeId;
    }
    
    @AuraEnabled
    public static List<Contact> searchedContacts(String searchValue, String filterSelected, String operator,string accId) {
        Id userId = UserInfo.getUserId();
        //Id userRoleId = UserInfo.getUserRoleId();
        System.debug('searchValue '+searchValue+' filterSelected '+filterSelected+' operator '+operator);
        //String filterCriteria = filterSelected;
        List<Contact> returnContacts = new List<Contact>();
        
        searchValue = String.escapeSingleQuotes(searchValue);
        filterSelected = String.escapeSingleQuotes(filterSelected);       
        operator = String.escapeSingleQuotes(operator);
        accId = String.escapeSingleQuotes(accId);
        
        List<Contact> contactRecords = new List<Contact>();
        List<Contact> workItemsContacts = new List<Contact>();
        List<Contact> nonWorkItemsContacts = new List<Contact>();
        String searchKeyString = '';
        String whereString = ' WHERE ';
        String andString = ' AND ';
        String activeStatus = 'Status__c = \'Active\'';
        String accountId = 'Account.Id=:accId';
        //String cmVpcrRvp = 'Account.CMVPCRRVP__c =:userId';
        //String doNotSendForCorrespondence = 'DoNotSendCorrespondence__c = false';
        String operatorChoosen = '';
        
        searchValue = searchValue.trim();
        if(searchValue != null && searchValue.length() > 0 && filterSelected != null) {
            if(filterSelected == 'First Name') {
                if(operator == 'Begins With') {
                    operatorChoosen = searchValue + '%';
                    searchKeyString = 'FirstName LIKE: operatorChoosen';
                } else if(operator == 'Equals To') {
                    searchKeyString = 'FirstName LIKE: searchValue';
                } else if(operator == 'Contains') {
                    operatorChoosen =  '%' + searchValue + '%';
                    searchKeyString = 'FirstName LIKE \'%' + searchValue + '%\'';
                }
                System.debug('searchKeyString '+searchKeyString);
            } else if(filterSelected == 'Last Name') {
                if(operator == 'Begins With') {
                    operatorChoosen = searchValue + '%';
                    searchKeyString = 'LastName LIKE: operatorChoosen';
                } else if(operator == 'Equals To') {
                    searchKeyString = 'LastName LIKE: searchValue';
                } else if(operator == 'Contains') {
                    operatorChoosen =  '%' + searchValue + '%';
                    searchKeyString = 'LastName LIKE \'%' + searchValue + '%\'';
                }
                System.debug('searchKeyString '+searchKeyString);
            } else if(filterSelected == 'Company') {
                if(operator == 'Begins With') {
                    operatorChoosen = searchValue + '%';
                    searchKeyString = 'Account.Name LIKE: operatorChoosen';
                } else if(operator == 'Equals To') {
                    operatorChoosen = searchValue + '%';
                    searchKeyString = 'Account.Name LIKE: searchValue';
                } else if(operator == 'Contains') {
                    operatorChoosen =  '%' + searchValue + '%';
                    searchKeyString = 'Account.Name LIKE \'%' + searchValue + '%\'';
                }
                System.debug('searchKeyString '+searchKeyString);
            }
        }
        
        User userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Name FROM User where Id=:userId];
        
        if(userDetails.UserRole.Name == 'CM VPCR/RVP') {
            String contactQuery = 'SELECT Id, Account.Name, FirstName, LastName, Email, Correspondence_Type__c,Survey_Type__c,Contact_Source__c,CSI_Survey_Contact__c FROM Contact ';
            contactRecords = Database.query(contactQuery + whereString + searchKeyString + andString + activeStatus + andString + accountId);
        } else {
            String contactQuery = 'SELECT Id, Account.Name, FirstName, LastName, Email, Correspondence_Type__c,Survey_Type__c,Contact_Source__c,CSI_Survey_Contact__c FROM Contact ';
            contactRecords = Database.query(contactQuery + whereString + searchKeyString + andString + activeStatus + andString + accountId);
        }
        
        /* Sort records based on Non-Work items Records to come at top of the list and then Work Item Records adds to the List - START */
        for(Integer i = 0 ; i < contactRecords.size() ; i++) {
            if(contactRecords[i].Correspondence_Type__c != null && (contactRecords[i].Correspondence_Type__c.contains('Customer Survey - Primary') || contactRecords[i].Correspondence_Type__c.contains('Customer Survey - Secondary'))) {
                //Add work items records to workItemsContacts List
                workItemsContacts.add(contactRecords[i]);
            } else {
                nonWorkItemsContacts.add(contactRecords[i]);
            }
        }
        
        if(nonWorkItemsContacts.size() > 0) {
            returnContacts.addAll(nonWorkItemsContacts);
        }
        
        if(workItemsContacts.size() > 0) {
            returnContacts.addAll(workItemsContacts);
        }
        
        
        
        return returnContacts;
    }
    
    @AuraEnabled
    public static void saveNpsContactData(List<Contact> contactData){
        List<Contact> listTobeUpdated = new List<Contact>();
        //List<Contact> updatedcontactRecords = new List<Contact>();
        
        if(contactData != null && contactData.size() > 0) {
            
            for(Contact conDataloop : contactData){
                listTobeUpdated.add((Contact)conDataloop);
            }
            
            
            Database.SaveResult[] dbUpdateResultList = ClientSurveyDML.updateContacts(listTobeUpdated);
            
            if(dbUpdateResultList != null && dbUpdateResultList.size() > 0) {
                for (Database.SaveResult UpdtResult : dbUpdateResultList) {
                    
                    if(!UpdtResult.isSuccess()) {
                        for(Database.Error err : UpdtResult.getErrors()) {
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                            System.debug('Fields that affected this error: ' + err.getFields());
                        }
                    }
                }
            } else {
                throw new NoAccessException();
            }
            
        }
        
    }
    
    @future(callout=true)
    public static void generateAndSendCleintSurveyPdf( String recordId){
        SavePoint sp;
        try{
            EmailTemplate et = [SELECT Id, HtmlValue, Subject FROM EmailTemplate WHERE DeveloperName = 'Client_Survey_Email'];
            List<Account> lstAccount = ClientSurveyCtrl.getAMTListRecords(recordId);
            String AccountName = lstAccount[0].Name;
            
            PageReference pdf = Page.GenerateClientSurveyPdf;
            pdf.getParameters().put('recordId',recordId);
            pdf.setRedirect(true);
            Blob blobFile;
            if(!Test.isRunningTest()){
                blobFile = pdf.getContent();
            }else{
                blobFile = blob.valueOf('Unit.Test');
            }
            
            String fileName = 'Client Survey - '+AccountName+' - '+System.now().format('MdYYYY')+'.pdf';
            String thisYear = System.now().format('YYYY');
            ClientSurveyCtrl.createContentVersion(blobFile, recordId, fileName);
            sp = Database.setSavePoint();
            
            String subject	= et.Subject;
            subject 		= subject.replace('<CompanyName>', AccountName+' '+thisYear);
            String body 	= et.HtmlValue;
            body 			= body.replace('<personWhoValidated>',lstAccount[0].SCE_Validation_By__r.Name);
            body 			= body.replace('<DateVlidated>', System.now().format('M/d/YYYY hh:mm a'));
            
            List<String> EmailIds = new List<String>{Label.MeritEmail,lstAccount[0].CM_SCE__r.Email};
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            Messaging.EmailFileAttachment efa1 = new Messaging.EmailFileAttachment();
            
            efa1.setFileName(fileName);
            efa1.setBody(blobFile);
            email.setSubject(subject);
            email.setToAddresses(EmailIds);
            email.setHtmlBody(Body);
            email.setFileAttachments(new Messaging.EmailFileAttachment[] {efa1});
            
            Messaging.SendEmailResult [] results = Messaging.sendEmail(new Messaging.SingleEmailMessage[] {email});
            for(Messaging.SendEmailResult result : results){
                String errors = '';
                if(!result.isSuccess()){
                    for(Messaging.SendEmailError err : result.getErrors()) {
                        errors = errors + err.getStatusCode() + ': ' + err.getMessage();
                    }
                }
                if(errors !=''){
                    System.debug('Error ==>'+errors);
                }
            }
        }catch(Exception ex){
            System.debug('Error'+ex.getMessage()+' '+ex.getStackTraceString());
            Database.rollback(sp);
        }
        
    }
    
    @AuraEnabled
    public static void saveServiceAMT(List<sObject> lstServiceAMT, Account objCompany){
        try{
            if(lstServiceAMT?.size()>0){
                update lstServiceAMT;
            }
            SceCMValidation.saveSCEValidation(objCompany);
            
        }catch(Exception ex){
            throw new AuraHandledException(ex.getMessage()+ex.getStackTraceString());
        }
    }
    /*SHRUTI ***** START ***** */
    @AuraEnabled
    public static List<Service_AMT__c> fetchServiceAMT(Id accId){
        List<Service_AMT__c> samt = new List<Service_AMT__c>();
        if(accId!=null){
            Account businessLine =[select id,Subtype__c from account where id=:accId limit 1];
            List<String> roles = getAMTRoles(businessLine.Subtype__c);
            System.debug('Roles >>>'+roles);
            samt = [Select id, Company__c, Contact_Role__c, Email__c, Exclude_AMT_Role_from_Survey__c, First_Name__c, Last_Name__c, Primary__c, Case_Management_End_Date__c, Case_Management_Start_Date__c From Service_AMT__c WHERE Company__c=:accId AND ((Case_Management_End_Date__c >= TODAY OR Case_Management_End_Date__c = null) AND Case_Management_Start_Date__c <= TODAY) AND Contact_Role__c IN :roles];
        }
        return samt;
    }
    /*SHRUTI ***** END ***** */ 
    
    public static void createContentVersion(Blob data, Id recordId, String fileName){
        
        ContentVersion objContent 			= new ContentVersion();
        objContent.PathOnClient 			= fileName;
        objContent.Title					= fileName;
        objContent.VersionData				= data;
        objContent.FirstPublishLocationId 	= recordId;
        objContent.SharingPrivacy			= 'P';
        objContent.IsMajorVersion			= true;
        objContent.OwnerId					= Label.ClientSurveyPdfOwner;
        insert as user objContent;
        //Database.insert( objContent, AccessLevel.USER_MODE );
    }
    
    /** Added getAMTRoles() method to fetch role from Custom Metadata ****SHRUTI****START**** **/
    @AuraEnabled
    public static List<String> getAMTRoles(string bLine) {
        List<String> finalAMTRole = new List<String>();
        List < Roles_For_AcctTeamMembers_Section__mdt > fetchMeta =new List < Roles_For_AcctTeamMembers_Section__mdt >();
        List < Roles_For_AMT_SBC_Client_Survey__mdt > fetchMetaSBC =new List < Roles_For_AMT_SBC_Client_Survey__mdt >();
        if(String.escapesinglequotes(bLine)!='Specialty Benefits Only'){
            fetchMeta = [SELECT Id, MasterLabel, AMT_Role__c, DeveloperName, Order__c FROM Roles_For_AcctTeamMembers_Section__mdt where active__c=true Order by Order__c ASC];
            for(Roles_For_AcctTeamMembers_Section__mdt amtRole:fetchMeta){
                finalAMTRole.add(amtRole.AMT_Role__c);
            }
        }
        else{
            fetchMetaSBC = [SELECT Id, MasterLabel, AMT_Role__c, DeveloperName, Order__c FROM Roles_For_AMT_SBC_Client_Survey__mdt where active__c=true Order by Order__c ASC];
            for(Roles_For_AMT_SBC_Client_Survey__mdt amtRole:fetchMetaSBC){
                finalAMTRole.add(amtRole.AMT_Role__c);
            }
        }
        return finalAMTRole;
    }
    /** ****SHRUTI****END**** **/
    
    
    
    
    //Added Vignesh CR - 3847
    public class AMTRoleWrapper {
        @AuraEnabled 
        public List<Service_AMT__c> clientManagers { get; set; }
        @AuraEnabled 
        public List<Service_AMT__c> surestClientManagers { get; set; }
        @AuraEnabled 
        public List<Service_AMT__c> specialtyClientManagers { get; set; }
        public AMTRoleWrapper() {
            clientManagers = new List<Service_AMT__c>();
            specialtyClientManagers = new List<Service_AMT__c>();
            surestClientManagers = new List<Service_AMT__c>();
            
            cmSce = new List<CM_Account_Team_History__c>();
            surestCmSce = new List<CM_Account_Team_History__c>();
            specialtybenefitSce = new List<CM_Account_Team_History__c>();
        }
        @AuraEnabled 
        public Boolean isclientManagersCheck { get; set; }
        @AuraEnabled 
        public Boolean issurestClientManagersCheck { get; set; }
        @AuraEnabled 
        public Boolean isspecialtyClientManagersCheck { get; set; }
        
        
        @AuraEnabled 
        public Boolean iscmsceCheck { get; set; }
        @AuraEnabled 
        public Boolean issurestCmsceCheck { get; set; }
        @AuraEnabled 
        public Boolean isspecialtybenefitsSceCheck { get; set; }
        
        @AuraEnabled 
        public List<CM_Account_Team_History__c> cmSce { get; set; }
        @AuraEnabled 
        public List<CM_Account_Team_History__c> surestCmSce { get; set; }
        @AuraEnabled 
        public List<CM_Account_Team_History__c> specialtybenefitSce { get; set; }
        
    }
    
    
    public class WorkItemsClass_Wrapper {
        
        @AuraEnabled
        public Set<User> sceUserList{ get;set; }
        
        @AuraEnabled
        public List<Opportunity> cmSceOppList { get;set; }
        
        @AuraEnabled
        public User loggedInUserRoleName {get;set;}
        
        @AuraEnabled
        public set<String> oppOwnweSetWrap{ get;set; }
        
        @AuraEnabled
        public set<String> oppCMVPCRRVPSetWrap { get;set; }
        
        @AuraEnabled
        public Map<String,set<String>> vpcrSCEMapWrap { get;set; }
        
        @AuraEnabled
        public List<Contact> getContacts { get;set; }
        
        @AuraEnabled
        public boolean isCustomTabVisible {get;set;}
        
        @AuraEnabled
        public String customSettingEndDate {get; set;}
        
        @AuraEnabled
        public String customSettingSoftDueDate {get; set;}
        
        @AuraEnabled
        public List<account> getAMTList {get; set;}
        
        @AuraEnabled
        public ProductMix__c getCurrentProduct {get; set;}
        
        @AuraEnabled
        public list <Client_Survey_Account__mdt> clientSurveyDates {get;set;}
        
        @AuraEnabled
        public Datetime cmcmcValidatedTime {get; set;}
        
        @AuraEnabled
        public Datetime sceValidatedTime {get; set;}
        
        @AuraEnabled
        public Integer offSet {get; set;}
        
        @AuraEnabled
        public Boolean clientSurveyCustomPermission {get; set;}
        
        @AuraEnabled
        public string businessLine {get; set;}
        
        @AuraEnabled   //Added Vignesh CR - 3847
        public AMTRoleWrapper amtRoleWrapper;
        
        @AuraEnabled 
        public Boolean isclientManagersCheck { get; set; }       
        @AuraEnabled 
        public Boolean issurestClientManagersCheck { get; set; }
        @AuraEnabled 
        public Boolean isspecialtyClientManagersCheck { get; set; }
        
         @AuraEnabled 
        public Boolean isCMLoggedin { get; set; }       
        @AuraEnabled 
        public Boolean isSBCMLoggedin { get; set; }
        @AuraEnabled 
        public Boolean isSCMLoggedin { get; set; }
        
        
        @AuraEnabled 
        public Boolean isCmsceLoggedin { get; set; }       
        @AuraEnabled 
        public Boolean isSurestCmsceLoggedin { get; set; }
        @AuraEnabled 
        public Boolean isSpeBenSceLoggedin { get; set; }
        
        @AuraEnabled 
        public Boolean iscmsceCheck { get; set; }       
        @AuraEnabled 
        public Boolean issurestCmsceCheck { get; set; }
        @AuraEnabled 
        public Boolean isspecialtybenefitsSceCheck { get; set; }
       
    }
    
    public class contactsAndRecordTypeId {
        
        @AuraEnabled
        public List<Contact> returnDefaultContacts {get;set;}
        
        @AuraEnabled
        public Id recordTypeId {get;set;}
    }
    public class accountWrapper {
        
        @AuraEnabled
        public String userName {get;set;}
        
        @AuraEnabled
        public DateTime validatedDate {get;set;}

    }
    
}