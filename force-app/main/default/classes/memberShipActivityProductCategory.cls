public without sharing class memberShipActivityProductCategory {
    @AuraEnabled
    public static List < String > getselectOptions(sObject objObject, string fld) {
        system.debug('objObject --->' + objObject);
        system.debug('fld --->' + fld);
        List < String > allOpts = new list < String > ();
        // Get the object type of the SObject.
        Schema.sObjectType objType = objObject.getSObjectType();
        
        // Describe the SObject using its object type.
        Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
        
        // Get a map of fields for the SObject
        map < String, Schema.SObjectField > fieldMap = objDescribe.fields.getMap();
        
        // Get the list of picklist values for this field.
        list < Schema.PicklistEntry > values =
            fieldMap.get(fld).getDescribe().getPickListValues();
        
        // Add these values to the selectoption list.
        for (Schema.PicklistEntry a: values) {
            allOpts.add(a.getValue());
        }
        system.debug('allOpts ---->' + allOpts);
        
        return allOpts;
    }
    @AuraEnabled
    public Static fieldReturnPojo getSelectedList(Sobject objObject,String fld,Id oppId){
        System.debug('str');
        system.debug('oppId >>> '+oppId);
        fieldReturnPojo newfieldreturnPojov = new fieldReturnPojo();
        Opportunity op = [SELECT Id, Product_Type_Involved_in_Opp__c FROM Opportunity where Id =: oppId];
        String str = '';
        if(op.Product_Type_Involved_in_Opp__c != null){
            str = String.valueOf(op.Product_Type_Involved_in_Opp__c );  
        }
        system.debug('str == > '+str);
        
        newfieldreturnPojov.selectedoption = str;
        newfieldreturnPojov.alloptions = getselectOptions(objObject,fld);
        return newfieldreturnPojov;
    }
    public class fieldReturnPojo{
        @AuraEnabled
        public List<String> alloptions {get;set;}
        
        @AuraEnabled
        public String selectedoption {get;set;}
    }
    @AuraEnabled
    public static void settingSelectedList(String fld,Id oppId,Boolean ispickvalchanged,String removedValue){
        System.debug('fld in set values'+fld);
        try{
            Opportunity opp = new Opportunity();
            opp.Id = oppId;
            opp.ProductsInvolvedintheOpptyRiskCannotEdit__c = false;
            opp.Product_Type_Involved_in_Opp__c  = fld;
            // opp.ProductsInvolvedintheOpptyRiskCannotEdit__c = true;
            System.debug(' opp.Product_Type_Involved_in_Opp__c  >> '+ fld);
            Database.update(opp);
            opp.ProductsInvolvedintheOpptyRiskCannotEdit__c = true;
            Database.update(opp);
            
            if(!ispickvalchanged){
                Opportunity op = [Select Id,Name,Account.Name,EffectiveDate__c,Owner.Name from Opportunity where Id =:oppId];
                
                //DateTime d = System.now();
                DateTime yourDate = op.EffectiveDate__c;
                yourDate = yourDate.addDays(1);
                String dateOutput = yourDate.format('M/d/yyyy');
                System.debug('Debug: '+dateOutput);
                
                String receiverEmail = System.Label.MA_ProductCategory_Mail;
                List<string> emaillst =new List<string>();
                emaillst.add(receiverEmail);
                
                Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
                // Set recipients to two contact IDs.
                // Replace IDs with valid record IDs in your org.
                message.toAddresses = emaillst;
                    message.optOutPolicy = 'FILTER';
                message.subject = 'Product Type Deleted';
                String body = 'Requestor: ' + UserInfo.getFirstName()+' '+ UserInfo.getLastName()+'\n \n';
                body += 'Membership Activity Information:\n';
                body += '\nName: '+op.Name +'\n';
                body += 'Effective Date: '+dateOutput +'\n';
                body += 'Row ID : '+op.Id +'\n';
                body += 'Company: '+op.Account.Name +'\n';
                body += '\n '+'\n';
                body += 'Product Type Deleted: '+ removedValue;
                
                message.plainTextBody =body;
                Messaging.SingleEmailMessage[] messages = 
                    new List<Messaging.SingleEmailMessage> {message};
                        Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
                if (results[0].success) {
                    System.debug('The email was sent successfully.');
                } else {
                    System.debug('The email failed to send: '
                                 + results[0].errors[0].message);
                }
                
            }
            
        }catch(Exception e){
            system.debug('e.printstacktrace'+e);
        }
        
    }
    @AuraEnabled
    public static ErrorWrapper saveMARecord(Opportunity opportunityObj){
        System.debug('opportunityObj '+opportunityObj);
        ErrorWrapper errMap = new ErrorWrapper(); 
        String errorMsg = '';
        String fieldType = '';
        try{
            Database.SaveResult srList = Database.update(opportunityObj, false);
            System.debug('Successfully inserted account. Account ID: ' + srList.getErrors());
            if (srList.isSuccess()) {
                System.debug('Successfully inserted account. Account ID: ' + srList.getId());
                errMap.isSuccess = true;
                errMap.getOpportunityObject = opportunityObj;
            }
            else {
                errMap.isSuccess = false;
                List<ErrorMessageWrapper> errMsgList = new List<ErrorMessageWrapper>();
                for(Database.Error err : srList.getErrors()) {
                    system.debug('err@@@'+err);
                    ErrorMessageWrapper errMsg = new ErrorMessageWrapper(); 
                    Schema.sObjectType sobject_type = Opportunity.getSObjectType(); //grab the sobject that was passed
                    Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe(); //describe the sobject
                    Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap();
                    Schema.DescribeFieldResult dfr = field_map.get(err.getFields()[0]).getDescribe();
                    System.debug('field_map'+field_map);
                    System.debug('dfr'+dfr.getLabel());
                    System.debug('The following error has occurred.');                    
                    System.debug(err.getStatusCode() + ': ' + err.getMessage());
                    System.debug('Account fields that affected this error: ' + err.getFields());
                    fieldType = String.valueOf(dfr.getType());
                    System.debug('fieldType'+fieldType);
                    if(String.valueOf(err.getStatusCode()) == 'FIELD_INTEGRITY_EXCEPTION' && fieldType == 'DATE'){
                        errorMsg = 'Invalid date format.  Please enter the date in m/d/yyyy format.';
                    }else{
                        errorMsg = err.getMessage();
                    }
                    errMsg.FieldItag = err.getFields()[0];
                    errMsg.FieldLabel = dfr.getLabel();
                    errMsg.FieldErrorMsg = errorMsg;
                    errMsgList.add(errMsg);
                }
                errMap.errorMsgList = errMsgList;
            }  
        }catch(Exception ex){
            System.debug('ex '+ex.getMessage()+'ex.getCause'+ex.getCause()+'ex'+ex.getLineNumber());
        }
        return errMap;
    }
/*    
    @AuraEnabled
    public static AccessControl getAccessObj(String myProfile, String[] rolesReadOnly,String[] rolesReadWrite,String[] rolesFull) {
        AccessControl access = new AccessControl();
        access.readOnly = false;
        access.readWrite = false;
        access.fullAccess = false;
        access.isSystemAdmin = false;
        Set<String> rolesReadOnlySet = new Set<String>(rolesReadOnly);
        Set<String> rolesReadWriteSet = new Set<String>(rolesReadWrite);
        Set<String> rolesFullSet = new Set<String>(rolesFull);
        if(myProfile == 'System Administrator'){
            access.isSystemAdmin = true;
        }
        if(rolesReadOnlySet.contains(myProfile)) {
            access.readOnly = true;                
        }else if(rolesReadWriteSet.contains(myProfile)) {
            access.readWrite = true;                
        }else if(rolesFullSet.contains(myProfile)) {
            access.fullAccess = true;                
        }
        return access;
    }
    */
   /* @AuraEnabled
    public static AccessControl getUserProfile(String oppType,String oppActivityType) {
        AccessControl access;
        try {
            List<Profile> userProfile = [SELECT Name FROM Profile WHERE Id=:userinfo.getProfileId() LIMIT 1];
            String myProflieName = userProfile[0].Name;
            String[] rolesReadOnly = new List<String>();
            String[] rolesReadWrite = new List<String>();
            String[] rolesFull = new List<String>();
            if(oppType.equalsIgnoreCase('NBEA') && oppActivityType.equalsIgnoreCase('Traditional')){
                rolesReadOnly = System.Label.MA_CM_Tradition_ReadOnly.split(',');
                rolesReadWrite = System.Label.MA_CM_Tradition_ReadWrite.split(',');
                rolesFull = System.Label.MA_CM_Tradition_Full.split(',');
                access = getAccessObj(myProflieName,rolesReadOnly,rolesReadWrite,rolesFull);                
            }else if(oppType.equalsIgnoreCase('NBEA') && oppActivityType.equalsIgnoreCase('Private Exchange')){
                rolesReadOnly = System.Label.MA_CM_PrivateExchange_ReadOnly.split(',');
                rolesReadWrite = System.Label.MA_CM_PrivateExchange_ReadWrite.split(',');
                rolesFull = System.Label.MA_CM_PrivateExchange_Full.split(',');
                access = getAccessObj(myProflieName,rolesReadOnly,rolesReadWrite,rolesFull);       
            }else if(oppType.equalsIgnoreCase('NB') && oppActivityType.equalsIgnoreCase('Traditional')){
                rolesReadOnly = System.Label.MA_CD_Tradition_ReadOnly.split(',');
                rolesReadWrite = System.Label.MA_CD_Tradition_ReadWrite.split(',');
                rolesFull = System.Label.MA_CD_Tradition_Full.split(',');
                access = getAccessObj(myProflieName,rolesReadOnly,rolesReadWrite,rolesFull);       
            }else if(oppType.equalsIgnoreCase('NB') && oppActivityType.equalsIgnoreCase('Private Exchange')){
                rolesReadOnly = System.Label.MA_CD_PrivateExchange_ReadOnly.split(',');
                rolesReadWrite = System.Label.MA_CD_PrivateExchange_ReadWrite.split(',');
                rolesFull = System.Label.MA_CD_PrivateExchange_Full.split(',');
                access = getAccessObj(myProflieName,rolesReadOnly,rolesReadWrite,rolesFull);       
            }           
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        return access;
    }*/
    
    @AuraEnabled
    public static AccessControl getUserProfile(String accountId) {
        Boolean isLoggedInUserRoleToBeEnabled = false;
        AccessControl access = new AccessControl();
        access.readOnly = false;
        access.readWrite = false;
        access.fullAccess = false;
        access.isSystemAdmin = false;
        try {            
            List<Profile> userProfile = [SELECT Name FROM Profile WHERE Id=:userinfo.getProfileId() LIMIT 1];
            String myProflieName = userProfile[0].Name;
            if(myProflieName == 'System Administrator'){
                access.isSystemAdmin = true;
            }
            isLoggedInUserRoleToBeEnabled = UserInformationClass.hasEditAccessToRecord(accountId);
            if(isLoggedInUserRoleToBeEnabled == false){
                access.readOnly = true;
            }
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        return access;
    }
    
    @AuraEnabled
    public static Boolean getLoggedInUerRoleInfo(String accountId) {
       
        Boolean isLoggedInUserRoleToBeEnabled = false;
           
        try {                      
            isLoggedInUserRoleToBeEnabled = UserInformationClass.hasEditAccessToRecord(accountId);
        } catch(Exception e) {
            System.debug('Error occurred while setting the Boolean value to enable the buttons based on the specific roles -> '+e);
        }
        
        return isLoggedInUserRoleToBeEnabled;
    }
    @AuraEnabled
    public static List<String> splitStringToArray(String mapStr){
        List<String> strArr = new List<String>();
        if(mapStr != null && mapStr.length() > 0){
            for(string fieldName : mapStr.split(';;'))
            {
                strArr.add(fieldName.trim());                 
            }
        }        
        return strArr;
    }
    
    @AuraEnabled
    public static RequiredReadOnlyData getRequiredReadOnlyMapping(String oppType,String oppProductCatagory,List<String> progssLst,String reasonForOppRisk,Boolean isSystemAdmin,String maActivityType){
        RequiredReadOnlyData reqData = new RequiredReadOnlyData();
        System.debug('progssLst'+progssLst);              
        
        MA_GenericMapping__mdt readFieldsOnlyForNonAdmin = [SELECT Id, SaleStage_Progression_Mapping__c, Generic_Map_Text__c  FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c='StepWise_DT_NonAdmin_ReadOnly_Fields'];
        for(string stage:progssLst){
            String requiredFields = '';
            String readOnlyFields = '';
            String genReadOnlyFields = '';
            String combinedReadOnlyString = '';
            String readFieldsOnlyForNonAdminStr = '';
            stage = stage.trim().replace(' ','_');
            List<MA_GenericMapping__mdt> clearRequiredFields = new List<MA_GenericMapping__mdt>();
            List<String> updatedRequiredFields = new List<String>();
            maActivityType = maActivityType.trim().replace(' ','_');
            String fieldsRequiredKey = oppType+'_'+oppProductCatagory+'_'+stage+'_Required';
            String fieldsEditableKey = oppType+'_'+oppProductCatagory+'_'+stage+'_Readonly';
            String genFieldsEditableKey = oppType+'_'+oppProductCatagory+'_'+'General_Readonly';
            String clearRequiredFld = oppType+'_'+oppProductCatagory+'_'+stage+'_'+maActivityType+'_ClearFields';
            System.debug('genFieldsEditableKey'+genFieldsEditableKey);
            system.debug('fieldsRequiredKey : '+fieldsRequiredKey);
            system.debug('fieldsEditableKey : '+fieldsEditableKey);
            System.debug('clearRequiredFld :'+clearRequiredFld);            
            MA_GenericMapping__mdt[] readAndEditFeildsMap = [SELECT Id, SaleStage_Progression_Mapping__c, Generic_Map_Text__c  FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c IN (:fieldsRequiredKey,:fieldsEditableKey,:genFieldsEditableKey)];
            MA_GenericMapping__mdt genReadAndEditFeildsMap = [SELECT Id, SaleStage_Progression_Mapping__c, Generic_Map_Text__c  FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c =:genFieldsEditableKey];
            if(clearRequiredFld !='' && clearRequiredFld != null){
                clearRequiredFields = [SELECT Id, SaleStage_Progression_Mapping__c, Generic_Map_Text__c  FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c =:clearRequiredFld];  
            }
            readFieldsOnlyForNonAdminStr = readFieldsOnlyForNonAdmin.Generic_Map_Text__c;
            System.debug('readFieldsOnlyForNonAdminStr : '+readFieldsOnlyForNonAdminStr);
            if(readAndEditFeildsMap != null){
                for(MA_GenericMapping__mdt eachCategory : readAndEditFeildsMap){
                    if(fieldsRequiredKey.equals(eachCategory.SaleStage_Progression_Mapping__c)){                      
                        requiredFields = eachCategory.Generic_Map_Text__c;                        
                    }else if(fieldsEditableKey.equals(eachCategory.SaleStage_Progression_Mapping__c)){                       
                        readOnlyFields = eachCategory.Generic_Map_Text__c;                                             
                    }           
                }
            }
            
            if(genReadAndEditFeildsMap.Generic_Map_Text__c == null || genReadAndEditFeildsMap.Generic_Map_Text__c == ''){
                MA_GenericMapping__mdt genReadAndEditFeildsMapLong = [SELECT Id, SaleStage_Progression_Mapping__c, Generic_Map__c  FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c =:genFieldsEditableKey];
                genReadOnlyFields = genReadAndEditFeildsMapLong.Generic_Map__c;
            }else{
                genReadOnlyFields = genReadAndEditFeildsMap.Generic_Map_Text__c;
            }
            
            if(requiredFields == null || requiredFields.trim().length() == 0 || readOnlyFields == null || readOnlyFields.trim().length() == 0 || genReadOnlyFields == null || genReadOnlyFields.trim().length() == 0){
                MA_GenericMapping__mdt[] readAndEditFeildsMapLong = [SELECT Id, SaleStage_Progression_Mapping__c, Generic_Map__c  FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c IN (:fieldsRequiredKey,:fieldsEditableKey,:genFieldsEditableKey)];
                if(readAndEditFeildsMapLong != null){
                    for(MA_GenericMapping__mdt eachCategory : readAndEditFeildsMapLong){
                        if(fieldsRequiredKey.equals(eachCategory.SaleStage_Progression_Mapping__c) && (requiredFields == null || requiredFields.trim().length() == 0)){                    
                            requiredFields = eachCategory.Generic_Map__c;                       
                        }else if(fieldsEditableKey.equals(eachCategory.SaleStage_Progression_Mapping__c) && (readOnlyFields == null || readOnlyFields.trim().length() == 0)){                          
                            readOnlyFields = eachCategory.Generic_Map__c;                            
                        }
                    }
                }            
            }            
            if(oppType.equalsIgnoreCase('NBEA') && Stage.equalsIgnoreCase('Proposal') && reasonForOppRisk != null){
                String reqItag = '';
                if(!(reasonForOppRisk.equalsIgnoreCase('Proactive Renewal') || reasonForOppRisk.equalsIgnoreCase('Formal Request for Renewal') || reasonForOppRisk.equalsIgnoreCase('Merger/Acq - No Bid/No Control') || reasonForOppRisk.equalsIgnoreCase('Private Exchange Team Transaction') || reasonForOppRisk.equalsIgnoreCase('Intersegment Transfer'))){
                    if(oppProductCatagory.equalsIgnoreCase('Other_Buy_Up_Programs')){
                        reqItag = 'Proposal_Due_Date_Other__c';
                    }else{
                        reqItag = 'Proposal_Due_Date_'+oppProductCatagory+'__c';
                    }
                    if(requiredFields != null && requiredFields.length() > 0){
                        requiredFields = requiredFields+';;'+reqItag;
                    }else{
                        requiredFields = reqItag;
                    }    
                }               
            }

            if(oppType.equalsIgnoreCase('NBEA') && Stage.equalsIgnoreCase('Proposal') && reasonForOppRisk != null && !maActivityType.equalsIgnoreCase('Private_Exchange')){
                String reqItag = '';
                if(reasonForOppRisk.equalsIgnoreCase('Confirmed or Likely RFP')){
                    if(oppProductCatagory.equalsIgnoreCase('Other_Buy_Up_Programs')){
                        reqItag = 'Proposal_Received_Date_Other__c';
                    }else{
                        reqItag = 'Proposal_Received_Date_'+oppProductCatagory+'__c';
                    }
                    if(requiredFields != null && requiredFields.length() > 0){
                        requiredFields = requiredFields+';;'+reqItag;
                    }else{
                        requiredFields = reqItag;
                    }    
                }               
            }
            System.debug('oppProductCatagory'+oppProductCatagory);
            if(oppType.equalsIgnoreCase('NB') && Stage.equalsIgnoreCase('Proposal') && oppProductCatagory.contains('Medical') && !maActivityType.equalsIgnoreCase('Private_Exchange')){
                String reqItag = 'Trending_Medical__c;;Member_Size_Scoring_Medical__c';
                if(requiredFields != null && requiredFields.length() > 0){
                        requiredFields = requiredFields+';;'+reqItag;
                    }else{
                        requiredFields = reqItag;
                    }               
            }
            
            System.debug('isSystemAdmin'+isSystemAdmin);
            List<String> requiredData = splitStringToArray(requiredFields);
            if(clearRequiredFields.size() != null && clearRequiredFields.size()  != 0){
                List<string> clearRequired = splitStringToArray(clearRequiredFields[0].Generic_Map_Text__c);
                for(String requireData:requiredData){
                    for(String clrData:clearRequired){
                        if(!clrData.equalsIgnoreCase(requireData)){
                            updatedRequiredFields.add(requireData);
                        }
                    }
                }
            }else{
                updatedRequiredFields = requiredData;
            }
            
            reqData.requiredFieldsMapList.put(stage,updatedRequiredFields);
            if(!isSystemAdmin){
                if(genReadOnlyFields.length() > 0){
                    genReadOnlyFields = genReadOnlyFields +';;'+readFieldsOnlyForNonAdminStr;
                }else{
                    genReadOnlyFields = readFieldsOnlyForNonAdminStr;
                }                    
                
                if(readOnlyFields.length() >0){
                    combinedReadOnlyString = readOnlyFields+';;'+readFieldsOnlyForNonAdminStr;
                }else{
                    combinedReadOnlyString = readFieldsOnlyForNonAdminStr;
                } 
            }else{
                combinedReadOnlyString = readOnlyFields;
            }
            System.debug('combinedReadOnlyString'+combinedReadOnlyString);
            reqData.readOnlyFieldsMapList.put(stage,splitStringToArray(combinedReadOnlyString));              
            reqData.genReadOnlyFieldsMapList = splitStringToArray(genReadOnlyFields);
        }              
        return reqData;
    }
    @AuraEnabled
    public static String getAccountRecordType(String oppId){
        Opportunity AccountObj = [SELECT Id,Account.Category__c from Opportunity where Opportunity.Id = :oppId LIMIT 1];
        String accType = AccountObj.Account.Category__c;
        if(accType != null){             
            if(accType.equalsIgnoreCase('Client Development')){
                accType = 'NB';
            }else{
                accType = 'NBEA';
            }           
        } 
        return accType;
    }
    
    @AuraEnabled
    public static ProgressionAndFeildSetData getFields(String oppType,Map<String,String> selectedCategory,String oppProductCatagory,String typeName,Map<String,String> instStageMap,Map<String,String> possibleProgrssMap,List<String> progressionfeildItagList,String reasonForOppRisk,Boolean isSystemAdmin,String maActivityType) {        
        String fsName = '';
        String intialSalesStageString = '';
        String progressSalesStageString = '';
        RequiredReadOnlyData reqData = new RequiredReadOnlyData();
        List<String> progressReadRequLst = new List<String>();
        List<String> progressList = new List<String>();
        List<String> progressMOList = new List<String>();
        Map<string,List<String>> fsetMemberMapList = new Map<string,List<String>>();
        List<String> possSet = new List<String>();
        List<String> initialList = new List<String>();
        List<String> initialMOList = new List<String>();
        List<String> intialSet = new List<String>();
        Boolean isDataService = false;
        Map<String,List<String>> dispostionValuesMap = new Map<String,List<String>>();
        List<String> dispostionValuesLst = new List<String>();
        String dispositionItag = '';
        String possItag = '';
        String transitionStr = '';
        String PreviousSelectedStage = '';
        String CurrentSelectedStage = '';
        String PreviousSelectedStageMO = '';
        String CurrentSelectedStageMO = '';
        String tranStr = '';
        Set<String> ClearFieldsSet = new Set<string>();
        List<MA_GenericMapping__mdt> transtionPicklistValues = new List<MA_GenericMapping__mdt>();
        Map<String,List<String>> clearValMap = new Map<String,List<String>>();
        String ClrFldStr = '';
        System.debug('selectedCategory'+selectedCategory);
        if(!selectedCategory.isEmpty()){
            for (String fieldName : selectedCategory.keySet()){
                ClrFldStr = 'Backward_Stage_Progression_'+fieldName;
                ClearFieldsSet.add(ClrFldStr);
                if(fieldName != 'Other'){
                    dispositionItag = 'Disposition_'+fieldName+'__c';
                    dispostionValuesLst.add(dispositionItag);
                    dispostionValuesMap.put('disPositionItag',dispostionValuesLst);
                }else{
                    dispostionValuesMap.put('disPositionItag',dispostionValuesLst);
                }
            }
        }
        MA_GenericMapping__mdt isDataServiceData = [SELECT SaleStage_Progression_Mapping__c,Generic_Map_Text__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c ='isDataService'];
        isDataService = Boolean.valueOf(isDataServiceData.Generic_Map_Text__c);
        List<MA_GenericMapping__mdt> clrVals = [SELECT SaleStage_Progression_Mapping__c,Generic_Map_Text__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c IN:ClearFieldsSet];
        if(clrVals.size() == 2){
            for(MA_GenericMapping__mdt clrVal : clrVals){
                clearValMap.put(clrVal.SaleStage_Progression_Mapping__c, splitStringToArray(clrVal.Generic_Map_Text__c));
            }
        }
        if(oppType == 'NB'){
            List<MA_GenericMapping__mdt> dispostionValues = [SELECT Id,Generic_Map_Text__c, SaleStage_Progression_Mapping__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c  like 'NB%' AND (NOT SaleStage_Progression_Mapping__c  like 'NBEA%') AND SaleStage_Progression_Mapping__c  like '%_Gen_Disposition'];
            for(MA_GenericMapping__mdt dispostionVal:dispostionValues){
                dispostionValuesMap.put(dispostionVal.SaleStage_Progression_Mapping__c, splitStringToArray(dispostionVal.Generic_Map_Text__c));
            }
        }else if(oppType == 'NBEA'){
            List<MA_GenericMapping__mdt> dispostionValues = [SELECT Id,Generic_Map_Text__c, SaleStage_Progression_Mapping__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c  like 'NBEA%' AND SaleStage_Progression_Mapping__c  like '%_Gen_Disposition'];
            for(MA_GenericMapping__mdt dispostionVal:dispostionValues){
                dispostionValuesMap.put(dispostionVal.SaleStage_Progression_Mapping__c, splitStringToArray(dispostionVal.Generic_Map_Text__c));
            }
        }
        
        if(oppType == 'NB'){
            transitionStr = 'NB_Trending_Picklist';
        }else if(oppType == 'NBEA'){
            transitionStr = 'NBEA_Trending_Picklist';
        }
        
        transtionPicklistValues = [SELECT Id,Generic_Map_Text__c, SaleStage_Progression_Mapping__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c =: transitionStr];
        if(transtionPicklistValues.get(0).Generic_Map_Text__c == null || transtionPicklistValues.get(0).Generic_Map_Text__c == null){
            transtionPicklistValues = [SELECT Id,Generic_Map__c, SaleStage_Progression_Mapping__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c =: transitionStr];
            tranStr = transtionPicklistValues.get(0).Generic_Map__c;
        }else{
            tranStr = transtionPicklistValues.get(0).Generic_Map_Text__c;
        }
        
        ProgressionAndFeildSetData progressFeildSetData = new ProgressionAndFeildSetData();   
        
        if(!possibleProgrssMap.isEmpty()){
            for (String fieldName : possibleProgrssMap.keySet()){
                System.debug('field name is ' + fieldName+'possibleProgrssMap'+possibleProgrssMap+'Other'+fieldName.containsIgnoreCase('Other'));
                possSet.add(possibleProgrssMap.get(fieldName));
                if(!fieldName.containsIgnoreCase('Other')){
                    possItag = possibleProgrssMap.get(fieldName);
                }
            }
        }
        System.debug('possSet'+possSet);
        if(possSet.size() >1){
            List<MA_GenericMapping__mdt> progressValues = [SELECT Previous_Selected_Stage__c,Current_Selected_Stage__c,SaleStage_Progression_Mapping__c,Generic_Map_Text__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c IN:possSet];
            for(MA_GenericMapping__mdt progrsVal:progressValues){
                progressSalesStageString = progrsVal.Generic_Map_Text__c;
                System.debug('Previous_Selected_Stage__c'+progrsVal.Current_Selected_Stage__c);
                if(possibleProgrssMap.get('Other') == progrsVal.SaleStage_Progression_Mapping__c){
                    if(progrsVal.Previous_Selected_Stage__c != null){
                        PreviousSelectedStageMO = progrsVal.Previous_Selected_Stage__c;
                    }else{
                        PreviousSelectedStageMO = '';
                    }
                    if(progrsVal.Current_Selected_Stage__c != null){
                        CurrentSelectedStageMO = progrsVal.Current_Selected_Stage__c;
                    }else{
                        CurrentSelectedStageMO = '';
                    }
                }
                if(possibleProgrssMap.get('Medical') == progrsVal.SaleStage_Progression_Mapping__c){
                    PreviousSelectedStage = progrsVal.Previous_Selected_Stage__c;
                    CurrentSelectedStage = progrsVal.Current_Selected_Stage__c;
                }
                string[] progressSaleStageSpilt= progressSalesStageString.split(';;');
                for(string progressString: progressSaleStageSpilt)
                {
                    if(possibleProgrssMap.get('Other') == progrsVal.SaleStage_Progression_Mapping__c){
                        progressMOList.add(progressString);
                    }
                    if(possibleProgrssMap.get('Medical') == progrsVal.SaleStage_Progression_Mapping__c){
                        progressList.add(progressString);
                    }
                    //progressReadRequLst.add(progressString.trim());
                    system.debug('Stage: '+progressString.trim());
                }
                if(progressList.size() > 0){
                    reqData = getRequiredReadOnlyMapping(oppType,'Medical',progressList,reasonForOppRisk,isSystemAdmin,maActivityType);
                    system.debug('reqData.requiredFieldsMapList '+reqData.requiredFieldsMapList);
                    progressFeildSetData.requiredFieldsMap = reqData.requiredFieldsMapList;
                    progressFeildSetData.readOnlyFieldsMap = reqData.readOnlyFieldsMapList;
                    progressFeildSetData.genReadOnlyFieldsMap = reqData.genReadOnlyFieldsMapList;
                }
                if(progressMOList.size() > 0){
                    reqData = getRequiredReadOnlyMapping(oppType,'Other_Buy_Up_Programs',progressMOList,reasonForOppRisk,isSystemAdmin,maActivityType);
                    progressFeildSetData.requiredFieldsMapMO = reqData.requiredFieldsMapList;
                    progressFeildSetData.readOnlyFieldsMapMO = reqData.readOnlyFieldsMapList;
                    progressFeildSetData.genReadOnlyFieldsMapMO = reqData.genReadOnlyFieldsMapList;
                }
                
                MA_GenericMapping__mdt medicalFeildsLong = [SELECT Id, Generic_Map__c FROM MA_GenericMapping__mdt where QualifiedApiName = 'MO_Medical_Fields' LIMIT 1];
                if(medicalFeildsLong != null){
                    String medicalFeildsList = medicalFeildsLong.Generic_Map__c;
                    progressFeildSetData.medicalFieldsList =  splitStringToArray(medicalFeildsList);
                }  
                MA_GenericMapping__mdt otherFeildsLong = [SELECT Id, Generic_Map__c FROM MA_GenericMapping__mdt where QualifiedApiName = 'MO_Other_Fields' LIMIT 1];
                if(otherFeildsLong != null){
                    String otherFeildsList = otherFeildsLong.Generic_Map__c;
                    progressFeildSetData.othersFieldsList =  splitStringToArray(otherFeildsList);
                }  
                
            }
        }else{
            if(possSet.size() >0){
                MA_GenericMapping__mdt progressValues = [SELECT Previous_Selected_Stage__c,Current_Selected_Stage__c,SaleStage_Progression_Mapping__c,Generic_Map_Text__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c IN:possSet Limit 1];
                progressSalesStageString = progressValues.Generic_Map_Text__c;
                if(progressValues.Previous_Selected_Stage__c != null){
                    PreviousSelectedStage = progressValues.Previous_Selected_Stage__c;
                }else{
                    PreviousSelectedStage = '';
                }
                if(progressValues.Current_Selected_Stage__c != null){
                    CurrentSelectedStage = progressValues.Current_Selected_Stage__c;
                }else{
                    CurrentSelectedStage = '';
                } 
                string[] progressSaleStageSpilt= progressSalesStageString.split(';;');
                for(string progressString: progressSaleStageSpilt)
                {
                    progressList.add(progressString.trim());
                    progressReadRequLst.add(progressString.trim().replace(' ','_'));
                    system.debug('Stage: '+progressString.trim());
                }
                reqData = getRequiredReadOnlyMapping(oppType,oppProductCatagory,progressReadRequLst,reasonForOppRisk,isSystemAdmin,maActivityType);
                progressFeildSetData.requiredFieldsMap = reqData.requiredFieldsMapList;
                progressFeildSetData.readOnlyFieldsMap = reqData.readOnlyFieldsMapList;
                progressFeildSetData.genReadOnlyFieldsMap = reqData.genReadOnlyFieldsMapList;
            }
            
        }
        
        System.debug('instStageMap'+instStageMap);
        if(!instStageMap.isEmpty()){
            for (String fieldName : instStageMap.keySet()){
                System.debug('field name is ' + fieldName);
                if(instStageMap.get(fieldName) != '' || !String.isBlank(instStageMap.get(fieldName))){
                    intialSet.add(instStageMap.get(fieldName));
                } 
            }
        }
        System.debug('intialSet'+intialSet.size());
        if(instStageMap.size() >1){
            List<MA_GenericMapping__mdt> instValues = [SELECT SaleStage_Progression_Mapping__c,Generic_Map_Text__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c IN:intialSet];
            for(MA_GenericMapping__mdt intialVal:instValues){
                intialSalesStageString = intialVal.Generic_Map_Text__c;
                string[] initialSalesStageSpilt= intialSalesStageString.split(';;');
                for(string initialString: initialSalesStageSpilt)
                {
                    if(instStageMap.get('Other') == intialVal.SaleStage_Progression_Mapping__c){
                        initialMOList.add(initialString.trim());
                    }
                    if(instStageMap.get('Medical') == intialVal.SaleStage_Progression_Mapping__c){
                        initialList.add(initialString.trim());
                    }
                }
                
            }
        }else if(intialSet.size() >0 && intialSet.size() == 1){
            System.debug('intialSet'+intialSet);
            MA_GenericMapping__mdt instValues = [SELECT SaleStage_Progression_Mapping__c,Generic_Map_Text__c FROM MA_GenericMapping__mdt where SaleStage_Progression_Mapping__c IN:intialSet LIMIT 1];
            System.debug('instValues'+instValues);
            intialSalesStageString = instValues.Generic_Map_Text__c;
            System.debug('intialSalesStageString'+intialSalesStageString);
            string[] initialSalesStageSpilt= intialSalesStageString.split(';;');
            for(string initialString: initialSalesStageSpilt)
            {
                initialList.add(initialString.trim());
            }
        }
        
        String sectionsListKey = oppType+'_'+oppProductCatagory+'_Sections';
        system.debug('sectionsListKey : '+sectionsListKey);
        MA_GenericMapping__mdt categorySectionFeilds = [SELECT Id, Generic_Map_Text__c FROM MA_GenericMapping__mdt where QualifiedApiName =:sectionsListKey LIMIT 1];
        if(categorySectionFeilds != null){
            fsName = categorySectionFeilds.Generic_Map_Text__c;
            if(fsName == null || fsName.trim().length() == 0){
                MA_GenericMapping__mdt categorySectionFeildsLong = [SELECT Id, Generic_Map__c FROM MA_GenericMapping__mdt where QualifiedApiName =:sectionsListKey LIMIT 1];
                if(categorySectionFeildsLong != null){
                    fsName = categorySectionFeildsLong.Generic_Map__c;   
                }                     
            }
        }                
        
        Schema.sObjectType sobject_type = Opportunity.getSObjectType(); //grab the sobject that was passed
        Schema.DescribeSObjectResult sobject_describe = sobject_type.getDescribe(); //describe the sobject
        Map<String, Schema.SObjectField> field_map = sobject_describe.fields.getMap();
        System.debug('field_map'+field_map);
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(typeName);
        Schema.DescribeSObjectResult describe = targetType.getDescribe();
        Map<String, Schema.FieldSet> fsMap = describe.fieldSets.getMap();
        System.debug('fsMap'+fsMap);
        FeildSetMembemberData fsetData = new FeildSetMembemberData();    
        
        List<FeildSetMembemberData> fsetMemberData = new List<FeildSetMembemberData>();
        string[] fsNameSpilt= fsName.split(';;'); 
        List<String> itagList = new List<String>();
        for(string fldSetName: fsNameSpilt)
        {
            System.debug('fldSetName'+fldSetName);
            Schema.FieldSet fs = fsMap.get(fldSetName.trim());
            System.debug('fs'+fs);
            if(fs != null){
                fsetData = createFeildSets(field_map,fs,fldSetName,progressList,oppProductCatagory,possibleProgrssMap,progressMOList,oppType,tranStr);
                for(String iTag: fsetData.fsetItag){
                    if(!iTag.equals('BusinessType__c')){
                        itagList.add(iTag);
                    }
                }
                fsetMemberData.add(fsetData);               
            }            
        }
        for(String iTag: progressionfeildItagList){
            if(!iTag.equals('BusinessType__c')){
                itagList.add(iTag);
            }
            
        }
                
        if(!oppProductCatagory.startsWithIgnoreCase('Other')){
        	String mediaclCopyFieldItags = 'Risk_Probability_Medical__c;;Anticipated_Actual_Close_Date_Medical__c;;Proposal_Due_Date_Medical__c;;Proposal_Received_Date_Medical__c;;Finalist_SubStage_Medical__c;;Finalist_Date_Detail_Medical__c;;Finalist_Date_Medical__c;;Product_Type_Involved_in_Opp__c'
                +';;Risk_Probability_Vision__c;;Anticipated_Actual_Close_Date_Vision__c;;Proposal_Due_Date_Vision__c;;Proposal_Received_Date_Vision__c;;Finalist_Date_Detail_Vision__c;;Finalist_Date_Vision__c'
                +';;Risk_Probability_Dental__c;;Anticipated_Actual_Close_Date_Dental__c;;Proposal_Due_Date_Dental__c;;Proposal_Received_Date_Dental__c;;Finalist_Date_Detail_Dental__c;;Finalist_Date_Dental__c'
                +';;Risk_Probability_Pharmacy__c;;Anticipated_Actual_Close_Date_Pharmacy__c;;Proposal_Due_Date_Pharmacy__c;;Proposal_Received_Date_Pharmacy__c;;Finalist_Date_Detail_Pharmacy__c;;Finalist_Date_Pharmacy__c';
            for(String itag : mediaclCopyFieldItags.split(';;')){
                itagList.add(itag);
            }    
        }
        
        // Code written by Harshavardhan Y R, To get Itags for Opportunity Line Itage to save Opportunity.
        String productsItag = UHGMASOQLConstants.OPP_ITAGS_FOR_OPP_LINE_ITEMS;
        for(String itag : productsItag.split(';')){
            itagList.add(itag);
        }
        
        String clearSalesStageItag = 'isEmpty_Sales_Stage_Dental__c;;isEmpty_Sales_Stage_Medical__c;;isEmpty_Sales_Stage_Vision__c;;isEmpty_Sales_Stage_Other__c;;isEmpty_Sales_Stage_Pharmacy__c';
        for(String itag : clearSalesStageItag.split(';;')){
            itagList.add(itag);
        }
        itagList.add('Comments_Last_Modified__c');
        itagList.add('Comments_Reporting__c');
        itagList.add('Competitive_Non_Competitive_calculated__c'); //SAMARTH
        progressFeildSetData.fsetMemberMap = fsetMemberData;
        progressFeildSetData.layoutFieldsItag = itagList;
        progressFeildSetData.intialSalesStageList = initialList;
        progressFeildSetData.possibleSaleStageList =  progressList;
        progressFeildSetData.possibleMOSaleStageList = progressMOList;
        progressFeildSetData.intialSalesStageMOList = initialMOList;
        progressFeildSetData.dispostionValMap = dispostionValuesMap;
        progressFeildSetData.clearValMap = clearValMap;
        progressFeildSetData.isComments = fsetData.isComments;
        progressFeildSetData.isAdditionalInfo = fsetData.isAdditionalInfo;
        progressFeildSetData.isAdditionalInfo2 = fsetData.isAdditionalInfo2;
        progressFeildSetData.isProdCat = fsetData.isProdCat;
        progressFeildSetData.possItag = possItag;
        progressFeildSetData.PreviousSelectedStage  = PreviousSelectedStage;
        progressFeildSetData.CurrentSelectedStage  = CurrentSelectedStage;
        progressFeildSetData.PreviousSelectedStageMO  = PreviousSelectedStageMO;
        progressFeildSetData.CurrentSelectedStageMO  = CurrentSelectedStageMO;
        progressFeildSetData.isDataService  = isDataService;
        System.debug('progressFeildSetData'+progressFeildSetData);
        return progressFeildSetData;
    }
        
    
    public static FeildSetMembemberData createFeildSets(Map<String, Schema.SObjectField> field_map,Schema.FieldSet fs,String fldSName,List<String> progressList,String productCatagory,Map<String,String> possMap,List<String> possMOLst,String oppType, String transtionPicklistValues){
        List<Schema.FieldSetMember> fieldSet = fs.getFields();
        List<FieldSetMember> fset = new List<FieldSetMember>();
        FeildSetMembemberData fsetData = new FeildSetMembemberData();
        List<MultiPickListWrapper> multioptions = new List<MultiPickListWrapper>();
        List<String> fieldItagList = new List<String>();
        fieldItag fieldItaglst = new fieldItag();
        for (Schema.FieldSetMember f: fieldSet) {
            List<String> option = new List<String>();
            fieldItagList.add(f.fieldPath);
            Schema.DescribeFieldResult dfr = field_map.get(f.fieldPath).getDescribe();
            String positionText = dfr.getInlineHelpText();
            String helpOrInstText;
            Boolean left = true;
            Boolean right = false;
            Boolean inst = false;
            Boolean help = false;
            
            String posKey = oppType;
            if(productCatagory.equalsIgnoreCase('Medical_And_Other_Buy_Up')){
                posKey = posKey + 'MO';
            }
            System.debug('Pos Key'+posKey);
            
            if(positionText != null && positionText.length() > 0){               
                string[] positionTextSpilt = positionText.split(';;');
                for(string eachText : positionTextSpilt){
                    if(eachText.startsWithIgnoreCase(posKey)){
                        positionText = eachText;
                        break;
                    }
                }
            }
            System.debug('Pos Text'+positionText);
            
            if(positionText != null && positionText.length() > 0){ 
                positionText = positionText.substringBetween('[', ']');
                System.debug('Pos Value'+positionText);
                if(positionText != null){
                    string[] positionTextSpilt = positionText.split(':');
                    for(string eachText : positionTextSpilt){
                        if(eachText != null ){
                            if(eachText.equalsIgnoreCase('left')){                            
                                left = true;
                            }else if(eachText.equalsIgnoreCase('right')){                           
                                right = true;
                                left = false;
                            }if(eachText.equalsIgnoreCase('inst')){                            
                                inst = true;
                            }else if(eachText.equalsIgnoreCase('help')){                           
                                help = true;
                            }
                        }                	                      
                    }                                                                               
                }                
            }
            
            if(help || inst){
                String helpInstItag;
                if(help){
                    helpInstItag = posKey+'_'+f.fieldPath+'_Help';                  
                }else{
                    helpInstItag = posKey+'_'+f.fieldPath+'_Inst';
                }
                System.debug('helpInstItag'+helpInstItag);
                MA_GenericMapping__mdt helpOrInstTextObj = [SELECT Id, Generic_Map_Text__c FROM MA_GenericMapping__mdt where Help_Instuction_Text__c =:helpInstItag LIMIT 1];
                if(helpOrInstTextObj != null){
                    helpOrInstText = helpOrInstTextObj.Generic_Map_Text__c;
                }                
                if(helpOrInstText == null || helpOrInstText.trim().length() == 0){
                    helpOrInstTextObj = [SELECT Id, Generic_Map__c FROM MA_GenericMapping__mdt where Help_Instuction_Text__c =:helpInstItag LIMIT 1];
                    if(helpOrInstTextObj != null){
                        helpOrInstText = helpOrInstTextObj.Generic_Map__c;
                    }                   
                }
            }            
            multioptions =new list<MultiPickListWrapper>();
            if(f.getType() == Schema.DisplayType.MULTIPICKLIST || f.getType() == Schema.DisplayType.PICKLIST){
                String label = f.fieldPath;
                List<Schema.PicklistEntry> pick_list_values = field_map.get(f.fieldPath).getDescribe().getPickListValues();
                if(f.getType() == Schema.DisplayType.MULTIPICKLIST){
                    for (Schema.PicklistEntry a : pick_list_values) {
                        MultiPickListWrapper multiopt = new MultiPickListWrapper();
                        multiopt.label = a.getLabel();
                        multiopt.value = a.getValue();
                        multioptions.add(multiopt);
                        }
                }else{
                    if(label.containsIgnoreCase('Sales_Stage_')){
                        List<String> possList = new List<String>();
                        possList.add('--none--');
                        if(possMap.containsKey('Medical') && possMap.containsKey('Other')){
                            if(label.equalsIgnoreCase('Sales_Stage_Other__c')){
                                possList = possMOLst;
                            }else{
                                possList = progressList;
                            }
                        }else{
                            possList = progressList;
                        }
                        option.add('');
                        for(string eachText : possList){
                            option.add(eachText);
                        }
                    }else if(label.containsIgnoreCase('Trending_')){
                        List<String> possList = splitStringToArray(transtionPicklistValues);
                        option.add('');
                        for(string eachText : possList){
                            option.add(eachText);
                        }
                    }else{
                        option.add('');
                        for (Schema.PicklistEntry a : pick_list_values) {
                            option.add(a.getValue());
                        }
                    }
                }
                fset.add(new FieldSetMember(f,multioptions,option,dfr,left,right,inst,help,helpOrInstText));
            }else{
                option.add(null);
                fset.add(new FieldSetMember(f,multioptions,option,dfr,left,right,inst,help,helpOrInstText));
            }
            
        }        
        fsetData.fsetMember = fset;
        fsetData.fsetItag = fieldItagList;
        fsetData.fSetName = fldSName;
        fsetData.isComments = false;
        fsetData.isAdditionalInfo = false;
        fsetData.isAdditionalInfo2 = false;
        fsetData.isProdCat = false;
        string[] fsHeading = fs.getDescription().split(';;');
        if(fsHeading[0] != null && fsHeading[0].trim().length() != 0){
            System.debug('fsHeading[0]'+fsHeading[0]);
            if(fsHeading[0] == 'Comments Section'){
                fsetData.fsetSectionLabel = fsHeading[1];
                fsetData.isComments = true;
            }
            else if(fsHeading[0] == 'Additional Info'){
                fsetData.fsetSectionLabel = fsHeading[1];
                fsetData.isAdditionalInfo = true;
            }else if(fsHeading[0] == 'Additional Info CSAD'){
                fsetData.fsetSectionLabel = fsHeading[1];
                fsetData.isAdditionalInfo2 = true;
            }else{
                fsetData.fsetSectionLabel = fsHeading[0];
                fsetData.isProdCat = true;
            }
        }
        if(fsHeading.size() == 2 && fsHeading[1] != null && fsHeading[1].trim().length() != 0){
            if(fsHeading[0] != 'Additional Info' && fsHeading[0] != 'Comments Section' && fsHeading[0] != 'Additional Info CSAD'){
                fsetData.fsetSectionSubLabel = fsHeading[1];
            }
        }
        
        return fsetData;
    }
    
    public class FieldSetMember {
        
        public FieldSetMember(Schema.FieldSetMember f,List<MultiPickListWrapper> multioption,List<String> opt,Schema.DescribeFieldResult dfr,Boolean left,Boolean right,Boolean inst,Boolean help,String helpOrInstText) {        
            this.fieldPath = f.fieldPath;
            this.label = f.label;   
            this.type = '' + f.getType();
            this.picklistoptions = opt;     
            this.multipicklistoptions = multioption;
            this.DefalutValue = dfr.getDefaultValue();
            this.FormulaValue = dfr.getDefaultValueFormula();
            this.name = dfr.getName();
            this.help = help;
            this.left = left;
            this.right = right;
            this.inst = inst;
            this.helpOrInstText = helpOrInstText;
        }        
        
        @AuraEnabled
        public String fieldPath { get;set; }
        
        @AuraEnabled
        public String label { get;set; }
        
        @AuraEnabled
        public String name { get;set; } 
        
        @AuraEnabled
        public String type { get; set; }
        
        @AuraEnabled
        public Object DefalutValue { get; set; }
        
        @AuraEnabled
        public String FormulaValue { get; set; }
        
        @AuraEnabled
        public List<String> picklistoptions { get; set;}
        
         @AuraEnabled
        public List<MultiPickListWrapper> multipicklistoptions { get; set;}
        
        @AuraEnabled
        public Boolean left { get;set; }
        
        @AuraEnabled
        public Boolean right { get;set; }
        
        @AuraEnabled
        public Boolean inst { get;set; }
        
        @AuraEnabled
        public Boolean help { get;set; }
        
        @AuraEnabled
        public String helpOrInstText { get;set; }
    }
    
    public class fieldItag{
        @AuraEnabled
        public Set<String> feildItagsSet { get; set;}
    }
    
    public class FeildSetMembemberData{
        @AuraEnabled
        public List<FieldSetMember> fsetMember { get; set;}
        
        @AuraEnabled
        public String fSetName { get; set;}
        
        @AuraEnabled
        public String fsetSectionLabel { get; set;}        
        
        @AuraEnabled
        public List<String> fsetItag { get; set;}
        
        @AuraEnabled
        public String fsetSectionSubLabel { get; set;}
        
        @AuraEnabled
        public Boolean isComments { get; set;} 
        
        @AuraEnabled
        public Boolean isAdditionalInfo{get; set;}
        
        @AuraEnabled
        public Boolean isAdditionalInfo2{get; set;}
        
        @AuraEnabled
        public Boolean isProdCat{get; set;}
        
    } 
    
    public class ProgressionAndFeildSetData{
        @AuraEnabled
        public List<FeildSetMembemberData> fsetMemberMap { get; set;}
        
        @AuraEnabled
        public MAP<String,List<String>> requiredFieldsMap { get; set;}
        
        @AuraEnabled
        public MAP<String,List<String>> readOnlyFieldsMap { get; set;}
        
        @AuraEnabled
        public MAP<String,List<String>> requiredFieldsMapMO { get; set;}
        
        @AuraEnabled
        public MAP<String,List<String>> readOnlyFieldsMapMO { get; set;}  
        
        @AuraEnabled
        public List<String> genReadOnlyFieldsMap { get; set;}  
        
        @AuraEnabled
        public List<String> genReadOnlyFieldsMapMO { get; set;}  
        
        @AuraEnabled
        public List<String> medicalFieldsList { get; set;}
        
        @AuraEnabled
        public List<String> othersFieldsList { get; set;}
        
        @AuraEnabled
        public List<String> layoutFieldsItag { get; set;}
        
        @AuraEnabled
        public List<String> intialSalesStageList { get; set;}  
        
        @AuraEnabled
        public List<String> intialSalesStageMOList { get; set;}
        
        @AuraEnabled
        public List<String> possibleSaleStageList { get; set;}
        
        @AuraEnabled
        public List<String> possibleMOSaleStageList { get; set;}
        
        @AuraEnabled
        public Map<String,List<String>> dispostionValMap { get; set;}
        
        @AuraEnabled
        public Map<String,List<String>> clearValMap { get; set;}
        
        @AuraEnabled
        public Boolean isComments { get; set;} 
        
        @AuraEnabled
        public Boolean isAdditionalInfo{get; set;}
        
        @AuraEnabled
        public Boolean isAdditionalInfo2{get; set;}
        
        @AuraEnabled
        public Boolean isProdCat{get; set;}
        
        @AuraEnabled
        public Boolean isDataService { get; set;} 
        
        @AuraEnabled
        public String possItag { get; set;}
        
        @AuraEnabled
        public String PreviousSelectedStage { get; set;}  
        
        @AuraEnabled
        public String CurrentSelectedStage { get; set;}
        
        @AuraEnabled
        public String PreviousSelectedStageMO { get; set;}  
        
        @AuraEnabled
        public String CurrentSelectedStageMO { get; set;}
    }  
    
    public class RequiredReadOnlyData{
        
        @AuraEnabled
        public List<String> genReadOnlyFieldsMapList { get; set;}  
        
        @AuraEnabled
        public Map<string,List<String>> requiredFieldsMapList = new Map<string,List<String>>();
        
        @AuraEnabled
        public Map<string,List<String>> readOnlyFieldsMapList = new Map<string,List<String>>();
        
    }
    
    public class AccessControl{
        @AuraEnabled
        public Boolean fullAccess { get; set;}  
        @AuraEnabled
        public Boolean readWrite { get; set;}
        @AuraEnabled
        public Boolean readOnly { get; set;}
        @AuraEnabled
        public Boolean isSystemAdmin { get; set;}
    }
    
    public class ErrorWrapper{
        @AuraEnabled
        public Boolean isSuccess { get; set;}  
        @AuraEnabled
        public List<ErrorMessageWrapper> errorMsgList { get; set;}
        @AuraEnabled
        public Opportunity getOpportunityObject { get; set;}
    }
    
    public class ErrorMessageWrapper{
        @AuraEnabled
        public String FieldItag { get; set;}
        @AuraEnabled
        public String FieldLabel { get; set;}
        @AuraEnabled
        public String FieldErrorMsg { get; set;} 
    }
    
    public class MultiPickListWrapper{
        @AuraEnabled
        public String label {get;set;}
        
        @AuraEnabled
        public String value {get;set;}
    }
}