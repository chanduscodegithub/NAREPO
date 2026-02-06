public Without Sharing class Sales_Incentive_Export_Controller 
{
	@AuraEnabled
    public static opportunityProductAndRenewalStatusData getOpprtntyPrdctAndRnwlStatusRecords(Decimal pageNumber,String selCategoryVal,Date fromDate,Date toDate,List<String> productValues) 
    {
        Integer pageSize = 5;
        Integer offset = ((Integer)pageNumber - 1) * pageSize;
        opportunityProductAndRenewalStatusData oprtntyPrdctAndRnwlStatusData = new opportunityProductAndRenewalStatusData();
        Integer totalOpportunityLineItemRecord = 0;
        Integer totalRenewalStatusRecord= 0;
        
        List<OpportunityLineItem> opportunityLineItemLst=new List<OpportunityLineItem>();
        List<Renewal_Status__c> renewalStatusList=new List<Renewal_Status__c>();
       
        if(selCategoryVal == 'NB' || selCategoryVal == 'NBEA' || selCategoryVal == 'NB and NBEA'){
            Set<String> productLineSet = new Set<String>();
            String otherProductFilter = '';
            String otherProductFilterQuery = '';
            
            for(String productLine : productValues){
                //&& productLine != 'Other – Specialty Benefits' - Added by SAMARTH
                if(productLine != 'Other – Underwriter Validation Required' && productLine != 'Other – Financial Accounts' && productLine != 'Other – Retiree' && productLine != 'Other – Specialty Benefits' && productLine != 'Other – All Other'){
                  	productLineSet.add(productLine);  
                }
                else if(productLine == 'Other – Underwriter Validation Required'){
                    otherProductFilterQuery = 'OR (Product_Line__c = \'Other\'  AND Underwriting_Validation__c = \'Yes\' )';
                }
                else if(productLine == 'Other – Financial Accounts'){
                    otherProductFilterQuery += 'OR (Product_Line__c = \'Other\'  AND Underwriting_Validation__c = \'No\' AND Product2.Family = \'Financial Accounts\')'; //Accounts to Financial Accounts - SAMARTH
                }
                else if(productLine == 'Other – Retiree'){
                    otherProductFilterQuery += 'OR (Product_Line__c = \'Other\'  AND Underwriting_Validation__c = \'No\' AND Product2.Family = \'Retiree\')';
                }
                //--------------SAMARTH--------------
                else if(productLine == 'Other – Specialty Benefits'){
                    otherProductFilterQuery += 'OR (Product_Line__c = \'Other\'  AND Underwriting_Validation__c = \'No\' AND Product2.Family = \'Specialty Products\')';
                }
                //--------------SAMARTH--------------
                
                //AND Product2.Family != \'Specialty Products\' - Added by SAMARTH
                else if(productLine == 'Other – All Other'){
                    otherProductFilterQuery += 'OR (Product_Line__c = \'Other\'  AND Underwriting_Validation__c = \'No\' AND (Product2.Family != \'Retiree\' AND Product2.Family != \'Financial Accounts\' AND Product2.Family != \'Specialty Products\') )'; //Accounts to Financial Accounts - SAMARTH
                }
            }
            
            Set<String> selCategoryValSet = new Set<String>();            
            if(selCategoryVal == 'NB'){
                selCategoryValSet.add('Client Development');
            }
            else if(selCategoryVal == 'NBEA'){
                selCategoryValSet.add('Client Management');
            }
            else{
                selCategoryValSet.add('Client Management');
                selCategoryValSet.add('Client Development');
            }
            
            if(otherProductFilterQuery != ''){
                opportunityLineItemLst=Database.query('SELECT Id,Opportunity.Account.Name,Opportunity.AccountId,Opportunity.Account.CLP__c,Opportunity.EffectiveDate__c,Product_Line__c,Product2.Name,Product2Id,Product2.Id,Sales_person_1__c,Sales_Person_1__r.Name,Sales_Person_1__r.Id,Sales_Person_1__r.EmployeeNumber,Sales_Person_1_split_percentage__c,Sales_Person_2__r.Name,Sales_Person_2__r.Id,Sales_Person_2__r.EmployeeNumber,Sales_Person_2_split_percentage__c,Underwriter__c,Underwriter_Email__c,Opportunity.SCE__r.Name,Opportunity.Owner.Name,Opportunity.Owner.Id,Opportunity.Owner.EmployeeNumber,Opportunity.MACategory__c,Net_Results__c,Opportunity.Name,OpportunityId,VPCR_RVP__r.Name,VPCR_RVP__r.Id,VPCR_RVP__r.EmployeeNumber,Date_Submitted_for_Incentives__c from OpportunityLineItem where Submit_for_sales_incentives__c=true and ((Product2.Name=\'Total\' AND Product_Line__c in : productLineSet )'+ otherProductFilterQuery+') and (Opportunity.MACategory__c in : selCategoryValSet)  and (Opportunity.EffectiveDate__c >= :fromDate and Opportunity.EffectiveDate__c <= :toDate) and Date_sent_to_ISI_Site__c = null');
                oprtntyPrdctAndRnwlStatusData.oppProductLineItemList = opportunityLineItemLst;
            }
            else{
                opportunityLineItemLst=Database.query('SELECT Id,Opportunity.Account.Name,Opportunity.AccountId,Opportunity.Account.CLP__c,Opportunity.EffectiveDate__c,Product_Line__c,Product2.Name,Product2Id,Product2.Id,Sales_person_1__c,Sales_Person_1__r.Name,Sales_Person_1__r.Id,Sales_Person_1__r.EmployeeNumber,Sales_Person_1_split_percentage__c,Sales_Person_2__r.Name,Sales_Person_2__r.Id,Sales_Person_2__r.EmployeeNumber,Sales_Person_2_split_percentage__c,Underwriter__c,Underwriter_Email__c,Opportunity.SCE__r.Name,Opportunity.Owner.Name,Opportunity.Owner.Id,Opportunity.Owner.EmployeeNumber,Opportunity.MACategory__c,Net_Results__c,Opportunity.Name,OpportunityId,VPCR_RVP__r.Name,VPCR_RVP__r.Id,VPCR_RVP__r.EmployeeNumber,Date_Submitted_for_Incentives__c from OpportunityLineItem where Submit_for_sales_incentives__c=true and (Product2.Name=\'Total\' AND Product_Line__c in : productLineSet) and (Opportunity.MACategory__c in : selCategoryValSet)  and (Opportunity.EffectiveDate__c >= :fromDate and Opportunity.EffectiveDate__c <= :toDate) and Date_sent_to_ISI_Site__c = null'); 
                oprtntyPrdctAndRnwlStatusData.oppProductLineItemList = opportunityLineItemLst ;
            } 
        }
        else{
            Set<String> productLineSet = new Set<String>();
            String otherProductFilter = '';
            
            for(String productLine : productValues){
                system.debug('productValues : '+productLine);
                productLineSet.add(productLine); 
            }
            
            String convertedFromDate = null;
            String convertedToDate = null;
            
            if(fromDate != null && toDate != null){
                convertedFromDate = fromDate.format();
                convertedToDate = toDate.format();
            }
            renewalStatusList=Database.query('SELECT Id,Company__r.Name,Renewal_Confirmed_Members_Sale__c,Company__r.Id,Company__r.CLP__c,Efective_Date__c,Product_Line__c,Product_Confirmed__c,Sales_person_1__r.Name,Sales_person_1__r.Id,Sales_person_1__r.EmployeeNumber,Sales_Person_1_split_percentage__c,Sales_Person_2__r.Name,Sales_Person_2__r.Id,Sales_Person_2__r.EmployeeNumber,Sales_Person_2_Split_percentage__c,VPCR_RVP__r.Name,VPCR_RVP__r.Id,VPCR_RVP__r.EmployeeNumber,Date_Submitted_For_Incentives__c,Name,Company__c from Renewal_Status__c where Submit_for_sales_incentives__c=true and isRenewalStatusRecord__c=true and (Product_Line__c in : productLineSet) and (Efective_Date__c >= :fromDate and Efective_Date__c <= :toDate) and Date_sent_to_ISI_Site__c = null ');
            oprtntyPrdctAndRnwlStatusData.renewalItemList = renewalStatusList;
        }
        
        oprtntyPrdctAndRnwlStatusData.total=totalOpportunityLineItemRecord+totalRenewalStatusRecord;
        List<opportunityLineItemAndRenewalStatusWrapper> opprtuntyPrdctAndRnwlStatusRcrdLst=new List<opportunityLineItemAndRenewalStatusWrapper>();
        
        Map<String,List<String>> mp=new Map<String,List<String>>();
        mp.put('renewalProductLine',getselectOptions('Renewal_Status__c','Product_Line__c'));
        
        oprtntyPrdctAndRnwlStatusData.pckLstMap = mp;
        
        for(OpportunityLineItem eachOpportunityLineItem:opportunityLineItemLst)
        {
            opportunityLineItemAndRenewalStatusWrapper opportuntyLnItmAndRnwlStatusObj=new opportunityLineItemAndRenewalStatusWrapper();
            opportuntyLnItmAndRnwlStatusObj.recordId=eachOpportunityLineItem.Id;
            opportuntyLnItmAndRnwlStatusObj.accountName=eachOpportunityLineItem.Opportunity.Account.Name;
            opportuntyLnItmAndRnwlStatusObj.productLine=eachOpportunityLineItem.Product_Line__c;
            if(eachOpportunityLineItem.Product_Line__c != 'Other'){
                opportuntyLnItmAndRnwlStatusObj.productName=eachOpportunityLineItem.Product_Line__c;
            }
            else{
                opportuntyLnItmAndRnwlStatusObj.productName=eachOpportunityLineItem.Product2.Name;
            }
           // opportuntyLnItmAndRnwlStatusObj.sceOrsvp=eachOpportunityLineItem.Opportunity.SCE__r.Name;
            //opportuntyLnItmAndRnwlStatusObj.sceOrsvp=eachOpportunityLineItem.Opportunity.Owner.Name;
            if(eachOpportunityLineItem.Sales_person_1__r != null){
               opportuntyLnItmAndRnwlStatusObj.sceOrsvp=eachOpportunityLineItem.Sales_person_1__r.Name; 
            }else{
                opportuntyLnItmAndRnwlStatusObj.sceOrsvp='';
            }
            if(eachOpportunityLineItem.Opportunity.MACategory__c == 'Client Management'){
               opportuntyLnItmAndRnwlStatusObj.type='NBEA'; 
            }else if(eachOpportunityLineItem.Opportunity.MACategory__c == 'Client Development'){
               opportuntyLnItmAndRnwlStatusObj.type='NB'; 
            }
            
            opportuntyLnItmAndRnwlStatusObj.effectiveDate=eachOpportunityLineItem.Opportunity.EffectiveDate__c;
            opportuntyLnItmAndRnwlStatusObj.membership=eachOpportunityLineItem.Net_Results__c;
            opportuntyLnItmAndRnwlStatusObj.membershipActivityName=eachOpportunityLineItem.Opportunity.Name;
            opportuntyLnItmAndRnwlStatusObj.objectName='OpportunityLineItem';
            opportuntyLnItmAndRnwlStatusObj.isChecked=false;
            opportuntyLnItmAndRnwlStatusObj.dateReadyToSend=eachOpportunityLineItem.Date_Submitted_For_Incentives__c;
            
            opprtuntyPrdctAndRnwlStatusRcrdLst.add(opportuntyLnItmAndRnwlStatusObj);
            
        }
        
        
        for(Renewal_Status__c eachRenewalStatus:renewalStatusList)
        {
            opportunityLineItemAndRenewalStatusWrapper opportuntyLnItmAndRnwlStatusObj=new opportunityLineItemAndRenewalStatusWrapper();
            opportuntyLnItmAndRnwlStatusObj.recordId=eachRenewalStatus.Id;
            opportuntyLnItmAndRnwlStatusObj.accountName=eachRenewalStatus.Company__r.Name;
            opportuntyLnItmAndRnwlStatusObj.productLine=eachRenewalStatus.Product_Line__c;
            opportuntyLnItmAndRnwlStatusObj.productName=eachRenewalStatus.Name;
            if(eachRenewalStatus.Sales_person_1__r != null){
               opportuntyLnItmAndRnwlStatusObj.sceOrsvp=eachRenewalStatus.Sales_person_1__r.Name; 
            }else{
                opportuntyLnItmAndRnwlStatusObj.sceOrsvp='';
            }
            
            opportuntyLnItmAndRnwlStatusObj.type='Renewal';
            //opportuntyLnItmAndRnwlStatusObj.effectiveDate=eachRenewalStatus.Effective_Date__c;
            //opportuntyLnItmAndRnwlStatusObj.effectiveDate=Sales_Incentive_Export_Controller.convertStringToDate(eachRenewalStatus.Effective_Date__c);
            opportuntyLnItmAndRnwlStatusObj.effectiveDate=eachRenewalStatus.Efective_Date__c;
            //opportuntyLnItmAndRnwlStatusObj.membership='';
            //opportuntyLnItmAndRnwlStatusObj.membershipActivityName=eachopportunityLineItem.Opportunity.Name;
            opportuntyLnItmAndRnwlStatusObj.objectName='Renewal_Status__c';
            opportuntyLnItmAndRnwlStatusObj.isChecked=false;
            opportuntyLnItmAndRnwlStatusObj.dateReadyToSend=eachRenewalStatus.Date_Submitted_For_Incentives__c;
            
            opprtuntyPrdctAndRnwlStatusRcrdLst.add(opportuntyLnItmAndRnwlStatusObj);
            
        }

        system.debug('opprtuntyPrdctAndRnwlStatusRcrdLst Size==>'+opprtuntyPrdctAndRnwlStatusRcrdLst.size());

        oprtntyPrdctAndRnwlStatusData.page = (Integer)pageNumber;
        oprtntyPrdctAndRnwlStatusData.pageSize = pageSize;
        
        oprtntyPrdctAndRnwlStatusData.opprtuntyPrdctAndRnwlStatusRcrdLst=opprtuntyPrdctAndRnwlStatusRcrdLst;
        oprtntyPrdctAndRnwlStatusData.loggedInUserTimeZone = UserInfo.getTimeZone().getID();
        
        return  oprtntyPrdctAndRnwlStatusData;       
        
        
    }
    
    
    @AuraEnabled
    public static NPSWrapper getTemplateInXML(String filterType){  
        
        NPSWrapper npsWrap = new  NPSWrapper();
        String queryString = 'Select ';
        String objectName  = '';
        StaticResource sr ;
        Map<String,String> employeeNumberMap = new Map<String,String>();
        if(filterType == 'Renewal'){
            sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'ICM_Renewal_Export'];
        }else{
            sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'ICM_OppLine_Export'];
            String[] getselectOptionsValues = getselectOptions('OpportunityLineItem','Speciality_Benefits_SVP__c');
            Map<Id,User> userDetailMap=new Map<Id,User>([Select Name,EmployeeNumber from User where Name in:getselectOptionsValues]);
            for(String key:userDetailMap.keySet()){
                String keyArray = userDetailMap.get(key).EmployeeNumber;
                if(userDetailMap.get(key).EmployeeNumber != null){
                    employeeNumberMap.put(userDetailMap.get(key).Name,userDetailMap.get(key).EmployeeNumber);
                }
            }           
            
        }
        String xmlBodyString = sr.body.toString();
        
        Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
        
        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        
        Matcher m = p.matcher(xmlBodyString);
        
        System.debug('matcher '+m);
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();    
            
            system.debug('before replace prefix : '+itag);
            itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            System.debug('itag value '+itag);
            Integer dotFirstIndex = itag.indexOf('.');
            objectName = itag.substring(0,dotFirstIndex);
            String fieldName = itag.substring(dotFirstIndex+1);
            
            System.debug('objectName '+objectName);
             System.debug('fieldName '+fieldName);
            
            if(objectItagesMap.containsKey(objectName)){
                Set<String> itagSet =  objectItagesMap.get(objectName);                    
                itagSet.add(fieldName);
                objectItagesMap.put(objectName, itagSet);
                
            }else{
                Set<String> itagSet = new Set<String>();
                itagSet.add(fieldName);      
                System.debug('objectName  -> '+objectName);                     
                objectItagesMap.put(objectName, itagSet);
            }                         
            
        }  
        
        npsWrap.xmlString = xmlBodyString;
        npsWrap.objectItags = objectItagesMap;
        npsWrap.employeeNumberMap = employeeNumberMap;
        
        
        return npsWrap;
        
        
    }    
    
    
    
    
    
    /*public static Date convertStringToDate (String dateVal){
        
        if(dateVal != '' && dateVal != null){
            try{
                Date dateValue = Date.parse(dateVal);
            	return dateValue;
            }catch(Exception e){
                return null;
            }
        }

		return null;        
    }*/
    
    public static List < String > getselectOptions(String objectName, string fld) 
    {
        
        System.debug('objectName,fld==>'+objectName+' '+fld);
        List < String > allOpts = new list < String > ();
        allOpts.add('');
        
        Schema.SObjectType objType = Schema.getGlobalDescribe().get(objectName);
        
        Schema.DescribeSObjectResult objDescribe = objType.getDescribe();
        
        map < String, Schema.SObjectField > fieldMap = objDescribe.fields.getMap();
        
        // Get the list of picklist values for this field.
        list < Schema.PicklistEntry > values =
            fieldMap.get(fld).getDescribe().getPickListValues();
        
        // Add these values to the selectoption list.
        for (Schema.PicklistEntry a: values) {
            allOpts.add(a.getValue());
        }
        system.debug('allOpts ---->' + allOpts);
        //allOpts.sort();
        return allOpts;
    }
    
   /* @AuraEnabled
    public static ExportDataWrapper getOpprtntyPrdctAndRnwlStatusRecordsToExport(List<ID> idList,String recordType)
    {
       	ExportDataWrapper exprtDataWrapper = new ExportDataWrapper();
        
        List<Renewal_Status__c> renewalStatusList= new List<Renewal_Status__c>();
        List<OpportunityLineItem> opportunityLineItemLst= new List<OpportunityLineItem>();
        if(recordType == 'Renewal'){
           // renewalStatusList=[SELECT Id,Company__r.Name,Company__r.CMVPCRRVP__r.Name,Company__r.CMVPCRRVP__r.Id,Date_Submitted_For_Incentives__c,Company__r.CLP__c,Name,Company__c,Product_Confirmed__c,Product_Line__c,Sales_person_1__c,Sales_Person_1_split_percentage__c,Sales_Person_2__r.Name,Sales_Person_2_Split_percentage__c from Renewal_Status__c where Id =: idList];
              renewalStatusList=[SELECT Id,Company__r.Name,Company__r.Id,Company__r.CLP__c,Effective_Date__c,Product_Line__c,Product_Confirmed__c,Sales_Person_1__r.Name,Sales_Person_1__r.Id,Sales_Person_1_split_percentage__c,Sales_Person_2__r.Name,Sales_Person_2__r.Id,Sales_Person_2_Split_percentage__c,Company__r.CMVPCRRVP__r.Name,Company__r.CMVPCRRVP__r.Id,Date_Submitted_For_Incentives__c,Name,Company__c from Renewal_Status__c where Id =: idList];
        }else{
            opportunityLineItemLst=[SELECT Id,Opportunity.Account.Name,Opportunity.AccountId,Opportunity.Account.CLP__c,Opportunity.EffectiveDate__c,Product_Line__c,Product2.Name,Product2Id,Sales_person_1__c,Sales_Person_1_split_percentage__c,Sales_Person_2__r.Name,Sales_Person_2__r.Id,Sales_Person_2_split_percentage__c,Underwriter__c,Underwriter_Email__c,Opportunity.SCE__r.Name,Opportunity.Owner.Name,Opportunity.Owner.Id,Opportunity.Category__c,Net_Results__c,Opportunity.Name,OpportunityId,Opportunity.CM_VPCR_RVP__r.Name,Opportunity.CM_VPCR_RVP__r.Id,Date_Submitted_for_Incentives__c  from OpportunityLineItem where Id =: idList]; 
        }
        
        exprtDataWrapper.renewalStatusList=renewalStatusList; 
        exprtDataWrapper.opportunityLineItemList=opportunityLineItemLst;
        
        //exprtDataWrapper.data=getOpprtntyPrdctAndRnwlStatusRecords(1); 
        
        return exprtDataWrapper;
    }*/
    
    @AuraEnabled
    public static ExportDataWrapper getOpprtntyPrdctAndRnwlStatusRecordsToExport(List<ID> idList,String recordType)
    {
       	ExportDataWrapper exprtDataWrapper = new ExportDataWrapper();
        
        List<Renewal_Status__c> renewalStatusList= new List<Renewal_Status__c>();
        List<OpportunityLineItem> opportunityLineItemLst= new List<OpportunityLineItem>();
         List<Renewal_Status__c> processedRenewalStatusList = new List<Renewal_Status__c>();
        List<OpportunityLineItem> processedOpportunityLineItems = new List<OpportunityLineItem>();
        list<string> ProductTypes =new list<string>{'Dental','Vision','Life','Disability','Financial Protection'};
        if(recordType == 'Renewal'){  
            //SAMARTH - Queried Specialty_Benefits_SCE__r.Name,Specialty_Benefits_SCE__r.Id,Specialty_Benefits_SCE__r.EmployeeNumber
            renewalStatusList=Database.query('SELECT Id,Company__r.Name,Company__r.Id,Company__r.CLP__c,Efective_Date__c,Renewal_Confirmed_Members_Sale__c,Product_Line__c,Product_Confirmed__c,Sales_person_1__r.Name,Sales_person_1__r.Id,Sales_person_1__r.EmployeeNumber,Sales_Person_1_split_percentage__c,Sales_Person_2__c,Sales_Person_2__r.Name,Sales_Person_2__r.Id,Sales_Person_2__r.EmployeeNumber,Sales_Person_2_Split_percentage__c,VPCR_RVP__r.Name,VPCR_RVP__r.Id,VPCR_RVP__r.EmployeeNumber,Specialty_Benefits_SCE__r.Name,Specialty_Benefits_SCE__r.Id,Specialty_Benefits_SCE__r.EmployeeNumber,Date_Submitted_For_Incentives__c,Name,Company__c from Renewal_Status__c where Id =: idList');
       		
            for (Renewal_Status__c rs : renewalStatusList) {
                processedRenewalStatusList.add(rs);
                // Duplication logic for Specialty Benefits SCE
                if (rs.Specialty_Benefits_SCE__r.Name != null) {
                    String specialitySce = rs.Specialty_Benefits_SCE__r.Name;
                    /*if ((rs.Sales_Person_2__c == null || rs.Sales_Person_2__r.Name == null) && rs.Sales_person_1__r.Name != specialitySce) {

                        Renewal_Status__c duplicateRs = rs.clone(false, true, false, false);
                        //duplicateRs.Sales_Person_1__c =rs.Specialty_Benefits_SCE__c;
                        processedRenewalStatusList.add(duplicateRs);
                    } 
                    else if (rs.Sales_person_1__r.Name != specialitySce && (rs.Sales_Person_2__c != null && rs.Sales_Person_2__r.Name != specialitySce)) {

                        Renewal_Status__c duplicateRs = rs.clone(false, true, false, false);
                       // duplicateRs.Sales_Person_1__c =rs.Specialty_Benefits_SCE__c;
                        processedRenewalStatusList.add(duplicateRs);
                    }*/
                   
                    
                    if (rs.Sales_person_1__r.Name != specialitySce && ProductTypes.contains(rs.Product_Line__c)) {
                        Renewal_Status__c duplicateRs = rs.clone(false, true, false, false);
                        processedRenewalStatusList.add(duplicateRs);
                    } 
                }
            }
        }else{
            opportunityLineItemLst=Database.query('SELECT Id,Opportunity.Account.Name,Speciality_Benefits_SVP__c,Opportunity.AccountId,Opportunity.Account.CLP__c,Opportunity.EffectiveDate__c,Product_Line__c,Product2.Name,Product2.Family,Product2Id,Product2.Id,Sales_Person_1__c,Sales_Person_1__r.Name,Sales_Person_1__r.Id,Sales_Person_1__r.EmployeeNumber,Sales_Person_1_split_percentage__c,Sales_Person_2__c,Sales_Person_2__r.Name,Sales_Person_2__r.Id,Sales_Person_2__r.EmployeeNumber,Sales_Person_2_split_percentage__c,Underwriter__c,Underwriter_Email__c,Opportunity.SCE__r.Name,Opportunity.Owner.Name,Opportunity.Owner.Id,Opportunity.Owner.EmployeeNumber,Opportunity.MACategory__c,Net_Results__c,Opportunity.Name,OpportunityId,VPCR_RVP__r.Name,VPCR_RVP__r.Id,VPCR_RVP__r.EmployeeNumber,Date_Submitted_for_Incentives__c from OpportunityLineItem where Id =: idList'); 
        	
            for (OpportunityLineItem oli : opportunityLineItemLst) {
                processedOpportunityLineItems.add(oli); 
                // Duplication logic for Specialty Benefits SVP
                if (oli.Speciality_Benefits_SVP__c != null) {
                    String specialitySvp = oli.Speciality_Benefits_SVP__c;
                    
                  /*  if ((oli.Sales_Person_2__c == null || oli.Sales_Person_2__r.Name == null) && oli.Sales_Person_1__r.Name != specialitySvp) {

                        OpportunityLineItem duplicateOli = oli.clone(false, true, false, false);
                        processedOpportunityLineItems.add(duplicateOli);
                    } 
                    else if (oli.Sales_Person_1__r.Name != specialitySvp && (oli.Sales_Person_2__c != null && oli.Sales_Person_2__r.Name != specialitySvp)) {

                        OpportunityLineItem duplicateOli = oli.clone(false, true, false, false);
                        processedOpportunityLineItems.add(duplicateOli);
                    }*/
                    if (oli.Sales_Person_1__r.Name != specialitySvp && oli.Speciality_Benefits_SVP__c!='' && 
                        (oli.Product_Line__c =='Dental' || oli.Product_Line__c =='Vision' || (oli.Product_Line__c =='Other' && oli.Product2.Family =='Specialty Products'))) {
                        OpportunityLineItem duplicateOli = oli.clone(false, true, false, false);
                        processedOpportunityLineItems.add(duplicateOli);
                    } 
                }
            }
        }
        System.debug('processedRenewalStatusList : '+processedRenewalStatusList);
        System.debug('processedOpportunityLineItems : '+processedOpportunityLineItems);

        exprtDataWrapper.renewalStatusList=processedRenewalStatusList; 
        exprtDataWrapper.opportunityLineItemList=processedOpportunityLineItems;
        
        //exprtDataWrapper.data=getOpprtntyPrdctAndRnwlStatusRecords(1); 
        
        return exprtDataWrapper;
    }
    
     @AuraEnabled
    public static String upsertRecords(List<OpportunityLineItem> oppLineUpdateList,List<Renewal_Status__c> renewalUpdateList,String csvFile,String fileName,String currentDate)
    {
    	String recordStatus= 'Success';
        
        if(oppLineUpdateList != null &&  !oppLineUpdateList.isEmpty()){
            Schema.SObjectField field = OpportunityLineItem.Fields.Id;
            try{
                Database.SaveResult  [] results = Database.update(oppLineUpdateList, true);
                 for(Integer index = 0, size = results.size(); index < size; index++) {
                    if(!results[index].isSuccess()) {
                        recordStatus = 'Failed';
                    }
                }
                
                
            }catch(Exception e){
                  //recordStatus = 'Failed : '+e.getMessage();
                  system.debug('Failed : '+e.getMessage());
                  recordStatus = 'Failed';
            }finally{
                
                    if(recordStatus == 'Success'){
                        			                        
                        try{
                            blob csvBlob = Blob.valueOf(csvFile);
                            Sales_Incentive_Attachment__c	salesIncentiveRecord = new Sales_Incentive_Attachment__c(Name=fileName);
                            insert salesIncentiveRecord;
                            
                            Attachment attachment = new Attachment();
                            attachment.Body = csvBlob;
                            attachment.Name = String.valueOf(fileName);
                            attachment.ParentId = salesIncentiveRecord.Id;
                            insert attachment;
                            system.debug('Attachment Success...');

                        }catch(Exception e){
                            
                 			 system.debug('Failed : '+e.getMessage());
                 			 recordStatus = 'Failed';
            			}
                    
                            
                          /*  Attachment attachment = new Attachment();
                            attachment.Body = csvBlob;
                            attachment.Name = String.valueOf('Account.csv');
                            attachment.ParentId = '006g000000IYIuzAAH';
                            insert attachment; */
                
                
                            /*Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                            //String[] toAddresses = new list<string> {'ramachandran.subramanian@crmit.com','shruthi.mallikarjun@crmit.com'};
                            String[] toAddresses = new list<string> {'ramachandran.subramanian@crmit.com'};
                            mail.setToAddresses(toAddresses);
                            List<Messaging.SingleEmailMessage> mails =  new List<Messaging.SingleEmailMessage>();
                            List<Messaging.Emailfileattachment> fileAttachments = new List<Messaging.Emailfileattachment>();
                            Messaging.Emailfileattachment efa = new Messaging.Emailfileattachment();
                            efa.setFileName(fileName);
                            efa.setBody(csvBlob);
                            fileAttachments.add(efa);
                        	String bodyString = 'Hi Team,';
                        	bodyString += '\n';
                        	bodyString += 'Please find the attached file.';
                            mail.setPlainTextBody(bodyString);
                        	mail.setSubject(fileName);
                            mail.setFileAttachments(fileAttachments);
                            mails.add(mail);
                            Messaging.sendEmail(mails);*/
                    }
                      
                    
            }
        }
        
        if(renewalUpdateList != null &&  !renewalUpdateList.isEmpty()){
            Schema.SObjectField field = Renewal_Status__c.Fields.Id;
            try{
                Database.SaveResult  [] results = Database.update(renewalUpdateList, true);
                for(Integer index = 0, size = results.size(); index < size; index++) {
                    if(!results[index].isSuccess()) {
                        recordStatus = 'Failed';
                    }
                }
            }catch(Exception e){
                system.debug('Failed : '+e.getMessage());
                recordStatus = 'Failed';
            }finally{
                      if(recordStatus == 'Success'){
                        				
                            try{
                                blob csvBlob = Blob.valueOf(csvFile);
                                Sales_Incentive_Attachment__c	salesIncentiveRecord = new Sales_Incentive_Attachment__c(Name=fileName);
                                insert salesIncentiveRecord;
                                
                                Attachment attachment = new Attachment();
                                attachment.Body = csvBlob;
                                attachment.Name = String.valueOf(fileName);
                                attachment.ParentId = salesIncentiveRecord.Id;
                                insert attachment;
                                system.debug('Attachment Success...');
    
                            }catch(Exception e){
                                
                                 system.debug('Failed : '+e.getMessage());
                                 recordStatus = 'Failed';
                            }	
                    
                            
                          /*  Attachment attachment = new Attachment();
                            attachment.Body = csvBlob;
                            attachment.Name = String.valueOf('Account.csv');
                            attachment.ParentId = '006g000000IYIuzAAH';
                            insert attachment; */
                
                
                            /*Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                          	//String[] toAddresses = new list<string> {'ramachandran.subramanian@crmit.com','shruthi.mallikarjun@crmit.com'};
                            String[] toAddresses = new list<string> {'ramachandran.subramanian@crmit.com'};
                            mail.setToAddresses(toAddresses);
                            List<Messaging.SingleEmailMessage> mails =  new List<Messaging.SingleEmailMessage>();
                            List<Messaging.Emailfileattachment> fileAttachments = new List<Messaging.Emailfileattachment>();
                            Messaging.Emailfileattachment efa = new Messaging.Emailfileattachment();
                            efa.setFileName('Export.csv');
                            efa.setBody(csvBlob);
                            fileAttachments.add(efa);
                        	String bodyString = 'Hi Team,';
                        	bodyString += '\n';
                        	bodyString += 'Please find the attached file.';
                            mail.setPlainTextBody(bodyString);
                        	mail.setSubject(fileName);
                            mail.setFileAttachments(fileAttachments);
                            mails.add(mail);
                            Messaging.sendEmail(mails);*/
                    }
                   
            }
        }
       
        
        return recordStatus;
        
    }
    
    public class opportunityProductAndRenewalStatusData 
    {
        
       /* @AuraEnabled
        public List<OpportunityLineItem> opportunityLineItemList{ get;set; } */
        
       /* @AuraEnabled
        public List<opportunityLineItemWrapper> opportunityLineItemList{ get;set; } */
        
        @AuraEnabled
        public List<opportunityLineItemAndRenewalStatusWrapper> opprtuntyPrdctAndRnwlStatusRcrdLst {get;set;}
        
        @AuraEnabled
        public Integer pageSize { get;set; }
        
        @AuraEnabled
        public Integer page { get;set; }
        
        @AuraEnabled
        public Integer total { get;set; }
        
        @AuraEnabled
        public Map<String,List<String>> pckLstMap { get;set; }
        
        
        @AuraEnabled 
        public List<OpportunityLineItem> oppProductLineItemList {get;set;}
        
        @AuraEnabled 
        public List<Renewal_Status__c> renewalItemList {get;set;}
        
        
        @AuraEnabled 
        public String loggedInUserTimeZone {get;set;}
        
        
    }
    
     /* wrapper class */  
    public class opportunityLineItemWrapper {
        @AuraEnabled public boolean isChecked {get;set;}
        @AuraEnabled public  OpportunityLineItem opportunityLineItemRecord {get;set;}
        public opportunityLineItemWrapper(boolean isChecked, OpportunityLineItem opportunityLineItemRecord){
            this.isChecked = isChecked;
            this.opportunityLineItemRecord = opportunityLineItemRecord;
        }
    }
    
    public class opportunityLineItemAndRenewalStatusWrapper {
        @AuraEnabled public boolean isChecked {get;set;}
         @AuraEnabled public ID recordId {get;set;}
        @AuraEnabled public String accountName {get;set;}
        @AuraEnabled public String productLine {get;set;}
        @AuraEnabled public String productName {get;set;}
        @AuraEnabled public String sceOrsvp {get;set;}
        @AuraEnabled public String type {get;set;}
        @AuraEnabled public Date effectiveDate {get;set;}
        @AuraEnabled public Decimal membership {get;set;}
        @AuraEnabled public String membershipActivityName {get;set;}
        @AuraEnabled public String objectName {get;set;}
        @AuraEnabled public Datetime dateReadyToSend {get;set;}
        
        /*public opportunityLineItemAndRenewalStatusWrapper(String accountName,String productLine,String productName,
                                                          String sceOrsvp,String type,Date effectiveDate,String membership,
                                                          String membershipActivityName){
            this.accountName = accountName;
            this.productLine = productLine;
            this.productName = productName;
            this.sceOrsvp = sceOrsvp;
            this.type = type;
            this.effectiveDate = effectiveDate;
            this.membership = membership;
            this.membershipActivityName = membershipActivityName;
        }*/
        
        
        
    }
    
    public class ExportDataWrapper 
    {
        
        @AuraEnabled
        public List<OpportunityLineItem > opportunityLineItemList {get;set;}
        
        @AuraEnabled
        public List<Renewal_Status__c >  renewalStatusList{get;set;}
        
        @AuraEnabled
        public opportunityProductAndRenewalStatusData  data{get;set;}
        
       
        
        
    }
    
    
    public class NPSWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public List<OpportunityLineItem> responseFinalData { get; set; }
        @AuraEnabled
        public String xmlString { get; set; }
        @AuraEnabled
        public String UserRole { get; set; }
        @AuraEnabled
        public Map<String,String> employeeNumberMap { get; set;}

    }
    
    
}