/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-02-2024
 * @last modified by  : Spoorthy
**/
public with sharing class StatusSnapshotController {
    public static String ROLE_SCE = 'CM SCE';
    public static String ROLE_SSCE = 'Surest CM SCE';
    public static String ROLE_CMSVP = 'Surest CM SVP';
    public static String ROLE_SPECIALITY_BENEFIT_SCE = 'Specialty Benefits SCE'; //SAMARTH
    public static String ROLE_SVP = 'CD SVP';
    public static String ROLE_SSVP = 'Surest CD SVP';
    public static String ROLE_SPCLTY = 'Specialty Benefits SVP';
    public static String ROLE_VPCR = 'CM VPCR/RVP';

    @AuraEnabled
    public static ExportWrapper getTemplateForExport(String role){
        StaticResource sr = null;
        boolean isLoggedInUserVPCR=false;
            
        
        if (role == ROLE_SVP || role == ROLE_SSVP) {
            sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'ICM_CDSVPStatusSnapshotTemplate'];    
        } 
        if (role == ROLE_SCE || role == ROLE_SSCE || role== ROLE_CMSVP) {
            sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'ICM_CMSCEStatusSnapshotTemplate'];    
        }
        if (role == ROLE_SPECIALITY_BENEFIT_SCE) {
            sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'ICM_SBSCEStatusSnapshotTemplate'];    
        }
        if (role == ROLE_SPCLTY) {
            sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'ICM_SPCLTYStatusSnapshotTemplate'];    
        }         
        if (role == ROLE_VPCR) {
            
            User userData = [Select Id,UserRole.Name,Profile.Name,Profile.UserLicense.Name,VPCR__c from User where Id=:UserInfo.getUserId()];
        	if(userData!=null) {
                isLoggedInUserVPCR=userData.VPCR__c;
            }
            
            if(!isLoggedInUserVPCR){
                sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'ICM_VPCRRVPStatusSnapshotTemplate'];    
            }else{
                sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'ICM_VPCRRVPStatusSnapshot_ProactiveRenewal_Template'];    
            }

        } 
        String xmlBodyString = sr.body.toString();

        Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
        Matcher m = p.matcher(xmlBodyString);
        String objectName  = '';     
        String fieldName = '';
        
        Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
        
        while (m.find()) {
            String itag = m.group();    
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                   IConstantsTemplate.EMPTY_STRING);
            
            Integer dotFirstIndex = itag.indexOf('.');
            if (dotFirstIndex != -1) {
                objectName = itag.substring(0,dotFirstIndex);
                fieldName = itag.substring(dotFirstIndex+1);
                        
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
        }  

        ExportWrapper ew = new ExportWrapper ();
        ew.loggedInUserRole = role;
        ew.objectItags = objectItagesMap;
        ew.xmlString = xmlBodyString;
        return ew;

    }

    
    @AuraEnabled
    public static StatusSnapshotData getStatusSnapshotData(String salesSeason){
        StatusSnapshotData ssd = new StatusSnapshotData();
        String loggedInUser = UserInfo.getUserId();
        String loggedinUserName = UserInfo.getName();
        String loggedInUserRoleID = UserInfo.getUserRoleId();
        String loggedInUserRole = [SELECT Name FROM UserRole where ID = :loggedInUserRoleID].Name;
        //System.debug(loggedInUserRoleID +' ' + loggedInUserRole);

        if (null == salesSeason || '' == salesSeason) {
            Map<String,String> icmReportSettingMap=new Map<String,String>();
            List<String> lst=new List<String>();
            lst.add('Report_Default_Month');
            lst.add('Report_Start_Year');
            
            List<ICM_Report_Setting__mdt> icmReportSettingList=[Select DeveloperName,Value__c from ICM_Report_Setting__mdt where
                                                               DeveloperName in: lst];
            for(ICM_Report_Setting__mdt eachICMReportSetting:icmReportSettingList){
                icmReportSettingMap.put(eachICMReportSetting.DeveloperName,eachICMReportSetting.Value__c);
            }
            salesSeason = GrowthIncentiveCompensationController.getDefaultSalesCycle(icmReportSettingMap.get('Report_Start_Year'), icmReportSettingMap.get('Report_Default_Month'));

        }
        /* Sales Season in Membership Activity can be of the format IY 2019 or 1/1/20 */
        List<String> salesCycleValueList=new List<String>();
        salesCycleValueList.add(salesSeason.substring(0, salesSeason.indexOf(',')).replace('IY', 'IY 20'));
        salesCycleValueList.add(salesSeason.substringAfter(',').trim().replace('1/1/', '1/1/20'));

        //loggedInUser='0056A000002F80QQAS';
        ssd.loggedInUserName = loggedinUserName;
        ssd.salesSeason = salesSeason;
        ssd.loggedInUserRole = loggedInUserRole;
        
        system.debug('loggedInUserRole '+loggedInUserRole);
        if (loggedInUserRole == ROLE_SVP || loggedInUserRole == ROLE_SSVP || loggedInUserRole == ROLE_SSCE || loggedInUserRole == ROLE_CMSVP || loggedInUserRole == ROLE_SCE || loggedInUserRole == ROLE_SPCLTY || loggedInUserRole == ROLE_SPECIALITY_BENEFIT_SCE) {
            Integer noOfProducts = 0;
            Integer noOfProductsSent = 0;
            Integer noOfProductsExtracted = 0;
            
            Integer pendingMembers = 0;
            Integer confirmedMembers = 0;
            
            List<AggregateResult> retentionData = new List<AggregateResult>();
            List<Renewal_Status__c> retentionData1 = new List<Renewal_Status__c>();
            
            Map<Id,List<Renewal_Status__c>> renewalStatusMap = new Map<Id,List<Renewal_Status__c>>();
            Map<Id,List<Integer>> productMap = new Map<Id,List<Integer>>();
            Map<Id,List<Integer>> renewalConfirmedMemebersSafeMap = new Map<Id,List<Integer>>();
            Set<Id> companyIds = new Set<Id>();
                
            //-----------------------------------------------------------------------FOR CM SCE ROLE-----------------------------------------------------------------------
            if(loggedInUserRole == ROLE_SCE|| loggedInUserRole == ROLE_SSCE || loggedInUserRole == ROLE_CMSVP ){
                retentionData1 = [SELECT Efective_Date__c, Company__c, Company__r.Name, Company__r.Owner.Name, Business_Line__c, Product_Line__c, Date_Submitted_For_Incentives__c, Date_sent_to_ISI_Site__c,Renewal_Confirmed_Members_Sale__c
                                  FROM Renewal_Status__c
                                  WHERE isRenewalStatusRecord__c=true 
                                  AND Sales_Cycle__c = :salesSeason
                                  AND Renewal_Confirmed_Members_Sale__c IN ('Confirmed; All Members Safe','Confirmed; Intersegment Transfer Out','Confirmed; Partial Cancel','Pending-Process Not Started','Pending-In Process; No Risk','Pending-In Process; With Risk')  
                                  AND ((Sales_person_1__c= :loggedInUser OR Sales_person_2__c= :loggedInUser) 
                                       OR (Eligible_for_Sales_Incentives__c='Yes' 
                                           AND Company__r.OwnerId=:loggedInUser 
                                           AND Submit_For_Sales_Incentives__c=false)) WITH USER_MODE];
                
                ssd.retentionSentData = new List<RetentionSent> ();
                ssd.retentionNotSentData = new List<RetentionNotSent> ();
                
                for(Renewal_Status__c rst : retentionData1){
                    if(renewalStatusMap.containsKey(rst.Company__c)){
                        List<Renewal_Status__c> tempList = renewalStatusMap.get(rst.Company__c);
                        tempList.add(rst);
                        renewalStatusMap.put(rst.Company__c,tempList);
                    }
                    else{
                        renewalStatusMap.put(rst.Company__c,new List<Renewal_Status__c>{rst});
                    }
                }
                
                if(renewalStatusMap != null){
                    for(Id ids : renewalStatusMap.keySet()){
                        for(Renewal_Status__c rs : renewalStatusMap.get(ids)){
                            if(rs.Product_Line__c != null){
                                noOfProducts++;
                            }
                            if(rs.Date_Submitted_For_Incentives__c != null){
                                noOfProductsSent++;
                            }
                            if(rs.Date_sent_to_ISI_Site__c != null){
                                noOfProductsExtracted++;
                            }
                            if(rs.Renewal_Confirmed_Members_Sale__c == 'Confirmed; All Members Safe' || rs.Renewal_Confirmed_Members_Sale__c == 'Confirmed; Partial Cancel' || rs.Renewal_Confirmed_Members_Sale__c == 'Confirmed; Intersegment Transfer Out'){
                                confirmedMembers++;
                            }
                            if(rs.Renewal_Confirmed_Members_Sale__c == 'Pending-Process Not Started' || rs.Renewal_Confirmed_Members_Sale__c == 'Pending-In Process; No Risk' || rs.Renewal_Confirmed_Members_Sale__c == 'Pending-In Process; With Risk'){
                                pendingMembers++;
                            }
                        }
                        if(!productMap.containsKey(ids)){
                            productMap.put(ids,new List<Integer>{noOfProducts,noOfProductsSent,noOfProductsExtracted});
                            noOfProducts = 0;
                            noOfProductsSent = 0;
                            noOfProductsExtracted = 0;
                        }
                        if(!renewalConfirmedMemebersSafeMap.containsKey(ids)){
                            renewalConfirmedMemebersSafeMap.put(ids,new List<Integer>{confirmedMembers,pendingMembers});
                            confirmedMembers = 0;
                            pendingMembers = 0;
                        }
                    }
                }
                system.debug('productMap '+productMap);
                system.debug('renewalConfirmedMemebersSafeMap '+renewalConfirmedMemebersSafeMap);
                if (null != retentionData1 && !retentionData1.isEmpty()) {
                    for(Renewal_Status__c rst : retentionData1){
                        Boolean flag = true;
                        if(!companyIds.contains(rst.Company__c)){
                            companyIds.add(rst.Company__c);
                        }
                        else{
                            flag = false;
                        }
                        if(productMap.get(rst.Company__c)[0] > productMap.get(rst.Company__c)[1] && flag == true){
                            RetentionNotSent rns = new RetentionNotSent();
                            rns.effectiveDate = rst.Efective_Date__c;
                            rns.noOfProductsNotYetConfirmed = String.valueOf(renewalConfirmedMemebersSafeMap.get(rst.Company__c)[1]);
                            rns.noOfProductsConfirmed = String.valueOf(renewalConfirmedMemebersSafeMap.get(rst.Company__c)[0]);
                            rns.company = rst.Company__r.Name;
                            rns.companyID = rst.Company__c;
                            if(rst.Business_Line__c == 'Specialty Benefits Only' || rst.Business_Line__c == '' || rst.Business_Line__c == null){
                                rns.companyOwnerName = '';
                            }
                            else{
                                rns.companyOwnerName = rst.Company__r.Owner.Name;
                            }
                            rns.companyLink = '/'+ rst.Company__c;
                            rns.noOfProductsSent = String.valueOf(productMap.get(rst.Company__c)[1]);
                            rns.noOfProductsNotYetSent = String.valueOf(renewalConfirmedMemebersSafeMap.get(rst.Company__c)[0] - productMap.get(rst.Company__c)[1]);
                            system.debug('rns '+rns);
                            ssd.retentionNotSentData.add(rns);
                        }
                        
                        if(productMap.get(rst.Company__c)[0] == productMap.get(rst.Company__c)[1] && flag == true){                            
                            RetentionSent rs = new RetentionSent();
                            rs.effectiveDate = rst.Efective_Date__c;
                            rs.company = rst.Company__r.Name;
                            rs.companyID = rst.Company__c;
                            if(rst.Business_Line__c == 'Specialty Benefits Only' || rst.Business_Line__c == '' || rst.Business_Line__c == null){
                                rs.companyOwnerName = '';
                            }
                            else{
                                rs.companyOwnerName = rst.Company__r.Owner.Name;
                            }
                            rs.companyLink = '/'+ rst.Company__c;
                            rs.noOfProductsSent = String.valueOf(productMap.get(rst.Company__c)[1]);
                            if (productMap.get(rst.Company__c)[2] == productMap.get(rst.Company__c)[1]) {
                                rs.infoExtractedByICT = 'All Info Extracted';
                            }
                            if (productMap.get(rst.Company__c)[2] < productMap.get(rst.Company__c)[1]) {
                                rs.infoExtractedByICT = 'Some Info Extracted';
                            }
                            if (productMap.get(rst.Company__c)[2] == 0) {
                                rs.infoExtractedByICT = 'No Info Extracted';
                            }
                            ssd.retentionSentData.add(rs);
                        }
                    }
                }
            }
            //-----------------------------------------------------------------------FOR CM SCE ROLE-----------------------------------------------------------------------
            
            //-----------------------------------------------------------------------FOR SBSCE ROLE-----------------------------------------------------------------------
            if(loggedInUserRole == ROLE_SPECIALITY_BENEFIT_SCE){ 
                retentionData = [SELECT Efective_Date__c, Company__c, Company__r.Name, Company__r.Owner.Name OwnerName, Business_Line__c bLine, count(Product_Line__c) noOfProducts, count(Date_Submitted_For_Incentives__c) noOfProductsSent, count(Date_sent_to_ISI_Site__c) noOfProductsExtracted
                                 FROM Renewal_Status__c
                                 WHERE isRenewalStatusRecord__c=true 
                                 AND Sales_Cycle__c = :salesSeason
                                 AND Renewal_Confirmed_Members_Sale__c IN ('Confirmed; All Members Safe','Confirmed; Partial Cancel','Confirmed; Intersegment Transfer Out')
                                 AND (((Sales_person_1__c= :loggedInUser OR Sales_person_2__c= :loggedInUser) OR (Eligible_for_Sales_Incentives__c='Yes' AND Company__r.OwnerId=:loggedInUser AND Submit_For_Sales_Incentives__c=false)) 
                                      OR (Specialty_Benefits_SCE__c=:loggedInUser AND Product_Line__c IN('Dental','Vision','Life','Disability'))) WITH USER_MODE
                                 GROUP BY Efective_Date__c, Company__c, Company__r.Name, Company__r.Owner.Name, Business_Line__c
                                 ORDER BY Company__r.Name];
                
                ssd.retentionSentData = new List<RetentionSent> ();
                ssd.retentionNotSentData = new List<RetentionNotSent> ();
                
                if (null != retentionData && !retentionData.isEmpty()) {
                    system.debug('retentionData '+retentionData);
                    for (AggregateResult ar : retentionData) {
                        system.debug('Inside for loooooppp');
                        system.debug('noOfProducts '+ar.get('noOfProducts'));
                        system.debug('noOfProductsSent '+ar.get('noOfProductsSent'));
                        system.debug('noOfProductsExtracted '+ar.get('noOfProductsExtracted'));
                        if (Integer.valueOf(ar.get('noOfProducts')) > Integer.valueOf(ar.get('noOfProductsSent'))) {
                            RetentionNotSent rns = new RetentionNotSent();
                            rns.effectiveDate = Date.valueOf(ar.get('Efective_Date__c'));
                            rns.company = String.valueOf(ar.get('Name'));
                            rns.companyID = String.valueOf(ar.get('Company__c'));
                            if(String.valueOf(ar.get('bLine')) == 'Specialty Benefits Only' || String.valueOf(ar.get('bLine')) == '' || String.valueOf(ar.get('bLine')) == null){
                                rns.companyOwnerName = '';
                            }
                            else{
                                rns.companyOwnerName = String.valueOf(ar.get('OwnerName'));
                            }
                            rns.companyLink = '/'+ String.valueOf(ar.get('Company__c'));
                            rns.noOfProductsSent = String.valueOf(ar.get('noOfProductsSent'));
                            rns.noOfProductsNotYetSent = String.valueOf(Integer.valueOf(ar.get('noOfProducts')) - Integer.valueOf(ar.get('noOfProductsSent')));
                            ssd.retentionNotSentData.add(rns);
                        }
                        
                        if (ar.get('noOfProducts') == ar.get('noOfProductsSent')) {
                            RetentionSent rs = new RetentionSent();
                            rs.effectiveDate = Date.valueOf(ar.get('Efective_Date__c'));
                            rs.company = String.valueOf(ar.get('Name'));
                            rs.companyID = String.valueOf(ar.get('Company__c'));
                            if(String.valueOf(ar.get('bLine')) == 'Specialty Benefits Only' || String.valueOf(ar.get('bLine')) == '' || String.valueOf(ar.get('bLine')) == null){
                                rs.companyOwnerName = '';
                            }
                            else{
                                rs.companyOwnerName = String.valueOf(ar.get('OwnerName'));
                            }
                            rs.companyLink = '/'+ String.valueOf(ar.get('Company__c'));
                            rs.noOfProductsSent = String.valueOf(ar.get('noOfProductsSent'));
                            if (Integer.valueOf(ar.get('noOfProductsExtracted')) == Integer.valueOf(ar.get('noOfProductsSent'))) {
                                rs.infoExtractedByICT = 'All Info Extracted';
                            }
                            if (Integer.valueOf(ar.get('noOfProductsExtracted')) < Integer.valueOf(ar.get('noOfProductsSent'))) {
                                rs.infoExtractedByICT = 'Some Info Extracted';
                            }
                            if (Integer.valueOf(ar.get('noOfProductsExtracted')) == 0) {
                                rs.infoExtractedByICT = 'No Info Extracted';
                            }
                            ssd.retentionSentData.add(rs);
                        }            
                    }
                }
            }
            //-----------------------------------------------------------------------FOR SBSCE ROLE-----------------------------------------------------------------------

            //GROWTH DATA PROCESSING - BEGINS
            ssd.growthSentData = new List<GrowthSent> ();
            ssd.growthNotSentData = new List<GrowthNotSent> ();

            AggregateResult[] growthData = null;
            if (loggedInUserRole == ROLE_SCE ||loggedInUserRole == ROLE_SVP || loggedInUserRole == ROLE_SSVP || loggedInUserRole == ROLE_CMSVP || loggedInUserRole == ROLE_SSCE || loggedInUserRole == ROLE_SPECIALITY_BENEFIT_SCE) {
                growthData = [SELECT Opportunity.EffectiveDate__c,Opportunity.Account.Name Company, Opportunity.ID moID, Opportunity.Name, count(Product2.Name) noOfProducts, 
                                    count(Date_Submitted_for_Incentives__c) noOfProductsSent, count(Date_sent_to_ISI_Site__c) noOfProductsExtracted
                                FROM OpportunityLineItem 
                                WHERE ((((((Product_Line__c = 'Medical' AND Opportunity.Disposition_Medical__c = 'Sold')
                                                OR (Product_Line__c = 'Pharmacy' AND Opportunity.Disposition_Pharmacy__c = 'Sold')
                                                OR (Product_Line__c = 'Dental'  AND Opportunity.Disposition_Dental__c = 'Sold') 
                                                OR (Product_Line__c = 'Vision' AND Opportunity.Disposition_Vision__c = 'Sold')) 
                                                AND Product2.Name = 'Total') 
                                            OR (Product_Line__c = 'Other' AND Eligible_for_Sales_Incentives__c='Yes' AND Disposition_Other_Buy_Up_Programs__c = 'Sold' )) 
                                        AND Net_Results__c > 0  
                                        AND Opportunity.EffectiveDate__c > 2019-01-01) 
                                    OR Submit_for_sales_incentives__c = true) 
                                    AND ((Sales_person_1__c = :loggedInUser OR Sales_person_2__c = :loggedInUser) 
                                            OR (Submit_for_sales_incentives__c = false AND Opportunity.OwnerId = :loggedInUser))
                                    AND Opportunity.Sales_Cycle1__c IN :salesCycleValueList WITH USER_MODE
                                GROUP BY Opportunity.EffectiveDate__c,Opportunity.Account.Name, Opportunity.ID, Opportunity.Name
                                ORDER BY Opportunity.Account.Name, Opportunity.Name ASC];
            }
            if (loggedInUserRole == ROLE_SPCLTY) {
                growthData = [SELECT  Opportunity.EffectiveDate__c,Opportunity.Account.Name Company, Opportunity.OwnerID medicalSVPorSCEID, Opportunity.Owner.Name medicalSVPorSCE, Opportunity.ID moID, Opportunity.Name, count(Product2.Name) noOfProducts, 
                                    count(Date_Submitted_for_Incentives__c) noOfProductsSent, count(Date_sent_to_ISI_Site__c) noOfProductsExtracted 
                                FROM OpportunityLineItem 
                                WHERE Net_Results__c > 0 
                                AND (((((Product_Line__c = 'Dental'  AND Opportunity.Disposition_Dental__c = 'Sold') 
                                        OR (Product_Line__c = 'Vision' AND Opportunity.Disposition_Vision__c = 'Sold')) AND Product2.Name = 'Total') 
                                        OR (Product_Line__c = 'Other' AND Eligible_for_Sales_Incentives__c='Yes' AND Disposition_Other_Buy_Up_Programs__c = 'Sold' AND Product2.Family ='Specialty Products'))) 
                                AND ((Sales_Person_1__c=:loggedInUser OR Sales_Person_2__c=:loggedInUser) 
                                OR (Submit_for_sales_incentives__c=false AND (Opportunity.OwnerId=:loggedInUser OR Opportunity.Specialty_Benefits_SVP__c=:loggedinUserName))
                                OR (Submit_for_sales_incentives__c=true AND Speciality_Benefits_SVP__c=:loggedinUserName))
                                AND Opportunity.Sales_Cycle1__c IN :salesCycleValueList WITH USER_MODE
                                GROUP BY Opportunity.EffectiveDate__c,Opportunity.Account.Name, Opportunity.OwnerID, Opportunity.Owner.Name, Opportunity.ID, Opportunity.Name
                                ORDER BY Opportunity.Account.Name, Opportunity.Name ASC];
            }
            
            if (null != growthData && !growthData.isEmpty()) {
                for (AggregateResult ar : growthData) {
                    /* If the no of Products meeting the filter conditions are more that the products submitted, then it will be added to the Retention Not Sent List*/
                    if (Integer.valueOf(ar.get('noOfProducts')) > Integer.valueOf(ar.get('noOfProductsSent'))) {
                        GrowthNotSent gns = new GrowthNotSent();
                        gns.effectiveDate =  Date.valueOf(ar.get('EffectiveDate__c'));
                        gns.company = String.valueOf(ar.get('Company'));
                        if (loggedInUserRole == ROLE_SPCLTY) {
                            if (loggedInUser == String.valueOf(ar.get('medicalSVPorSCEID'))) {
                                gns.medicalSVPorSCE = '';
                            } else {
                                gns.medicalSVPorSCE = String.valueOf(ar.get('medicalSVPorSCE'));
                            }
                            
                        }
                        gns.membershipActivityName = String.valueOf(ar.get('Name'));
                        gns.membershipActivityID = '/'+ String.valueOf(ar.get('moID'));
                        gns.noOfProductsSent = String.valueOf(ar.get('noOfProductsSent'));
                        gns.noOfProductsNotYetSent = String.valueOf(Integer.valueOf(ar.get('noOfProducts')) - Integer.valueOf(ar.get('noOfProductsSent')));
                        ssd.growthNotSentData.add(gns);
                    }
                    /* If the no of Products meeting the filter conditions are equal to the products submitted, then it will be added to the Retention Fully Sent List. 
                    Extraction data is populated based on whether all the products are extracted or some/none of the products are extracted */
                    if (ar.get('noOfProducts') == ar.get('noOfProductsSent')) {
                        GrowthSent gs = new GrowthSent();
                        gs.effectiveDate = Date.valueOf(ar.get('EffectiveDate__c'));
                        gs.company = String.valueOf(ar.get('Company'));
                        if (loggedInUserRole == ROLE_SPCLTY) {
                            if (loggedInUser == String.valueOf(ar.get('medicalSVPorSCEID'))) {
                                gs.medicalSVPorSCE = '';
                            } else {
                                gs.medicalSVPorSCE = String.valueOf(ar.get('medicalSVPorSCE'));
                            }
                        }
                        gs.membershipActivityName = String.valueOf(ar.get('Name'));
                        gs.membershipActivityID = '/'+ String.valueOf(ar.get('moID'));
                        gs.noOfProductsSent = String.valueOf(ar.get('noOfProductsSent'));
                        if (Integer.valueOf(ar.get('noOfProductsExtracted')) == Integer.valueOf(ar.get('noOfProductsSent'))) {
                            gs.infoExtractedByICT = 'All Info Extracted';
                        }
                        if (Integer.valueOf(ar.get('noOfProductsExtracted')) < Integer.valueOf(ar.get('noOfProductsSent'))) {
                            gs.infoExtractedByICT = 'Some Info Extracted';
                        }
                        if (Integer.valueOf(ar.get('noOfProductsExtracted')) == 0) {
                            gs.infoExtractedByICT = 'No Info Extracted';
                        }
                        ssd.growthSentData.add(gs);
                    }            
                }
            }
            //GROWTH DATA PROCESSING - ENDS
        }

        //VPCR ROLE HANDLING - BEGINS
        if (loggedInUserRole == 'CM VPCR/RVP') {
            Map<String, vpcrSnapshot> mapCurrentData = new Map<String, vpcrSnapshot> ();
            Map<String, vpcrSnapshot> mapPreviousData = new Map<String, vpcrSnapshot> ();
            String retentionKey = '';
            String vpcrName = loggedInUserName;
            String currentSCE = '';
            String companyVPCR = '';
            
            boolean isLoggedInUserVPCR=false;
            
            /*List<OpportunityLineItem> oliList = new List<OpportunityLineItem>();
            Map<Id,OpportunityLineItem> oliMap = new Map<Id,OpportunityLineItem>();
            oliList=[Select id,Opportunity.Account.ID,VPCR_RVP__c from OpportunityLineItem WHERE Net_Results__c > 0 and 
                    		(((((Product_Line__c = 'Medical' AND Opportunity.Disposition_Medical__c = 'Sold')OR (Product_Line__c = 'Pharmacy' AND Opportunity.Disposition_Pharmacy__c = 'Sold')
                    		OR (Product_Line__c = 'Dental'  AND Opportunity.Disposition_Dental__c = 'Sold') OR (Product_Line__c = 'Vision' AND Opportunity.Disposition_Vision__c = 'Sold')) AND Product2.Name = 'Total') OR 
                    		(Product_Line__c = 'Other' AND Eligible_for_Sales_Incentives__c='Yes' AND Disposition_Other_Buy_Up_Programs__c = 'Sold' )) or Submit_for_sales_incentives__c = true) 
                            AND ((VPCR_RVP__c=:loggedInUser) or (Submit_for_sales_incentives__c=false AND Opportunity.CM_VPCR_RVP__c=:loggedInUser))
                            AND Opportunity.Sales_Cycle1__c IN :salesCycleValueList];
            for(OpportunityLineItem oli:oliList){
                oliMap.put(oli.Opportunity.Account.ID,oli);
            }*/
            
            User userData = [Select Id,UserRole.Name,Profile.Name,Profile.UserLicense.Name,VPCR__c from User where Id=:UserInfo.getUserId()];
            if(userData!=null) {
                isLoggedInUserVPCR=userData.VPCR__c;
            }
            

            //Fetching Growth Data
            AggregateResult[] vpcrGrowthData = 
                    [SELECT Opportunity.Account.ID CompanyID, Opportunity.Account.Name Company, Opportunity.Account.CMVPCRRVP__c CompanyVPCR, 
                         Opportunity.CM_VPCR_RVP__c VPCR, Opportunity.Account.Owner.Name currentSCE, Sales_Person_1__r.Name SP1, Sales_Person_2__r.Name SP2, 
                        count(Product2.Name) noOfProducts,count(Date_Submitted_for_Incentives__c) noOfProductsSent
                        FROM OpportunityLineItem 
                        WHERE Net_Results__c > 0 and 
                    		(((((Product_Line__c = 'Medical' AND Opportunity.Disposition_Medical__c = 'Sold')OR (Product_Line__c = 'Pharmacy' AND Opportunity.Disposition_Pharmacy__c = 'Sold')
                    		OR (Product_Line__c = 'Dental'  AND Opportunity.Disposition_Dental__c = 'Sold') OR (Product_Line__c = 'Vision' AND Opportunity.Disposition_Vision__c = 'Sold')) AND Product2.Name = 'Total') OR 
                    		(Product_Line__c = 'Other' AND Eligible_for_Sales_Incentives__c='Yes' AND Disposition_Other_Buy_Up_Programs__c = 'Sold' )) or Submit_for_sales_incentives__c = true) 
                            AND ((VPCR_RVP__c=:loggedInUser) or (Submit_for_sales_incentives__c=false AND Opportunity.CM_VPCR_RVP__c=:loggedInUser))
                            AND Opportunity.Sales_Cycle1__c IN :salesCycleValueList WITH USER_MODE
                        GROUP BY Opportunity.Account.ID, Opportunity.Account.Name, Opportunity.Account.CMVPCRRVP__c, Opportunity.CM_VPCR_RVP__c, Opportunity.Account.Owner.Name, Sales_Person_1__r.Name, Sales_Person_2__r.Name
                        ORDER BY Opportunity.Account.Name];
            
            if (null != vpcrGrowthData && !vpcrGrowthData.isEmpty()) {
                for (AggregateResult ar : vpcrGrowthData) {
                    if ((null == ar.get('VPCR') || '' == String.valueOf(ar.get('VPCR')).trim()) && 
                        (null == ar.get('CompanyVPCR') || '' == String.valueOf(ar.get('CompanyVPCR')).trim())) {
                        vpcrSnapshot vpcrs = new vpcrSnapshot();
                        setGrowthDetails(ar, vpcrs);
                        vpcrName = loggedInUser;
                        currentSCE = String.valueOf(ar.get('currentSCE')).trim();  
                        retentionKey = String.valueOf(''+ar.get('Company')+vpcrName+currentSCE+ar.get('SP1')+ar.get('SP2'));
                        mapPreviousData.put(retentionKey, vpcrs);
						continue;
                    }
                    
                    if(null != ar.get('VPCR') && '' != String.valueOf(ar.get('VPCR')).trim()){
                        vpcrName = String.valueOf(ar.get('VPCR'));
                    } 
                    else{
                        vpcrName = loggedInUser;
                    }
                    
                    /*if(oliMap.containsKey(String.valueOf(ar.get('CompanyID')))){
                        if(oliMap.get(String.valueOf(ar.get('CompanyID'))).VPCR_RVP__c != null){
                            system.debug('Entering if');
                            vpcrName = String.valueOf(oliMap.get(String.valueOf(ar.get('CompanyID'))).VPCR_RVP__c);
                        }
                        else if(null != ar.get('VPCR') && '' != String.valueOf(ar.get('VPCR')).trim()){
                            system.debug('Entering else');
                            vpcrName = String.valueOf(ar.get('VPCR'));
                            system.debug('vpcrName '+vpcrName);
                        } 
                    }*/
                    
                    if(null != ar.get('CompanyVPCR') && '' != String.valueOf(ar.get('CompanyVPCR')).trim()){
                        companyVPCR = String.valueOf(ar.get('CompanyVPCR')).trim();
                    } 
                    else{
                        companyVPCR = null;
                    }
                    
                    currentSCE = String.valueOf(ar.get('currentSCE')).trim();
                    
                    if (vpcrName == companyVPCR) {
                        vpcrSnapshot vpcrs = new vpcrSnapshot();
                        setGrowthDetails(ar, vpcrs);
                        retentionKey = String.valueOf(''+ar.get('Company')+vpcrName+currentSCE+ar.get('SP1')+ar.get('SP2'));
                        mapCurrentData.put(retentionKey, vpcrs);
                        //system.debug('mapCurrentData '+mapCurrentData);
                    }
                    if (vpcrName != companyVPCR) {
                        vpcrSnapshot vpcrs = new vpcrSnapshot();
                        setGrowthDetails(ar, vpcrs);
                        retentionKey = String.valueOf(''+ar.get('Company')+vpcrName+currentSCE+ar.get('SP1')+ar.get('SP2'));
                        mapPreviousData.put(retentionKey, vpcrs);
                        system.debug('mapPreviousData after '+mapPreviousData);
                    }
                }
            }

           
            
            AggregateResult[] vpcrRetentionData = 
                    [SELECT Company__c, Company__r.name Company, VPCR_RVP__c VPCR, Company__r.CMVPCRRVP__c CompanyVPCR, Company__r.Owner.Name CurrentSCE, Sales_person_1__r.name SP1, Sales_Person_2__r.name SP2, count(Product_Line__c) noOfProducts, count(Date_Submitted_For_Incentives__c) noOfProductsSent 
                        FROM renewal_status__C
                        WHERE Renewal_Confirmed_Members_Sale__c in ('Confirmed; All Members Safe','Confirmed; Partial Cancel','Confirmed; Intersegment Transfer Out')
                        AND isRenewalStatusRecord__c=true
                        AND Sales_Cycle__c = :salesSeason
                        AND (VPCR_RVP__c=:loggedInUser and Eligible_for_Sales_Incentives__c='Yes') WITH USER_MODE
                        GROUP BY Company__c, Company__r.name, VPCR_RVP__c, Company__r.CMVPCRRVP__c, Company__r.Owner.Name, Sales_person_1__r.name, Sales_Person_2__r.name
                        ORDER BY Company__r.name];
            
            
            System.debug('vpcrRetentionData ** ' + vpcrRetentionData);        


            if (null != vpcrRetentionData && !vpcrRetentionData.isEmpty()) {
                for (AggregateResult ar : vpcrRetentionData) {
                    currentSCE = String.valueOf(ar.get('currentSCE')).trim();

                    if (null != ar.get('VPCR') && '' != String.valueOf(ar.get('VPCR')).trim()) {
                        vpcrName = String.valueOf(ar.get('VPCR'));
                    } 
                    else {
                        vpcrName = loggedInUser;
                    }
                    
                    if (null != ar.get('CompanyVPCR') && '' != String.valueOf(ar.get('CompanyVPCR')).trim()) {
                        companyVPCR = String.valueOf(ar.get('CompanyVPCR')).trim();
                    } 
                    else {
						vpcrSnapshot vpcrs = null;
                        retentionKey = String.valueOf(''+ar.get('Company')+vpcrName+currentSCE+ar.get('SP1')+ar.get('SP2'));
                        if (mapPreviousData.containsKey(retentionKey)) {
                            vpcrs = mapPreviousData.get(retentionKey);
                            setRetentionDetails(ar, vpcrs);
                        } else {
                            vpcrs = new vpcrSnapshot();
                            vpcrs.company  = String.valueOf(ar.get('Company'));
                            vpcrs.companyLink = '/'+ String.valueOf(ar.get('Company__c'));
                            vpcrs.currentSCE = currentSCE;
                            vpcrs.growthSCEReceivingCompensation = '';
                            vpcrs.growthAdditionalSCEReceivingCompensation = '';
                            vpcrs.growthNoOfProductsSent = String.valueOf(0);
                            vpcrs.growthNoOfProductsNotYetSent = String.valueOf(0);
                            setRetentionDetails(ar, vpcrs);
                            vpcrs = mapPreviousData.put(retentionKey, vpcrs);
                        }
                        continue;
                    }

                    if (vpcrName == companyVPCR) {
                        vpcrSnapshot vpcrs = null;
                        retentionKey = String.valueOf(''+ar.get('Company')+vpcrName+currentSCE+ar.get('SP1')+ar.get('SP2'));
                        if (mapCurrentData.containsKey(retentionKey)) {
                            vpcrs = mapCurrentData.get(retentionKey);
                            setRetentionDetails(ar, vpcrs);
                        } else {
                            vpcrs = new vpcrSnapshot();
                            vpcrs.company  = String.valueOf(ar.get('Company'));
                            vpcrs.companyLink = '/'+ String.valueOf(ar.get('Company__c'));
                            vpcrs.currentSCE = currentSCE;
                            vpcrs.growthSCEReceivingCompensation = '';
                            vpcrs.growthAdditionalSCEReceivingCompensation = '';
                            vpcrs.growthNoOfProductsSent = String.valueOf(0);
                            vpcrs.growthNoOfProductsNotYetSent = String.valueOf(0);
                            setRetentionDetails(ar, vpcrs);
							vpcrs = mapCurrentData.put(retentionKey,vpcrs);
                        }
                    }
                    if (vpcrName != companyVPCR) {
                        vpcrSnapshot vpcrs = null;
                        retentionKey = String.valueOf(''+ar.get('Company')+vpcrName+currentSCE+ar.get('SP1')+ar.get('SP2'));
                        if (mapPreviousData.containsKey(retentionKey)) {
                            vpcrs = mapPreviousData.get(retentionKey);
                            setRetentionDetails(ar, vpcrs);
                        } else {
                            vpcrs = new vpcrSnapshot();
                            vpcrs.company  = String.valueOf(ar.get('Company'));
                            vpcrs.companyLink = '/'+ String.valueOf(ar.get('Company__c'));
                            vpcrs.currentSCE = currentSCE;
                            vpcrs.growthSCEReceivingCompensation = '';
                            vpcrs.growthAdditionalSCEReceivingCompensation = '';
                            vpcrs.growthNoOfProductsSent = String.valueOf(0);
                            vpcrs.growthNoOfProductsNotYetSent = String.valueOf(0);
                            setRetentionDetails(ar, vpcrs);
                            vpcrs = mapPreviousData.put(retentionKey, vpcrs);
                        }
                    }
                }
            }
            
            if(isLoggedInUserVPCR){
                //Fetching Proactive Renewal Data
             List<Opportunity> proactiveRenewalDataList=[SELECT Id,Name,AccountId,Account.Name,EffectiveDate__c,Proactive_Renewal_Retention__c,
														Proactive_Renewal_Incentive_Status__c,OwnerId,Owner.Name,CM_VPCR_RVP__c,
														Account.CMVPCRRVP__c,Account.Owner.Name,Account.OwnerId
        												from Opportunity 
														where (Proactive_Renewal_Incentive_Status__c like '%Pending Qualification%' or Proactive_Renewal_Incentive_Status__c like '%Fully Validated%')
														AND CM_VPCR_RVP__c=:loggedInUser AND Sales_Cycle1__c IN :salesCycleValueList
                                                        ORDER BY Account.Name];
                
                ssd.vpcrProactiveRenewalData = proactiveRenewalDataList;
            }
             
             
            System.debug('mapCurrentData==>'+mapCurrentData);
            System.debug('mapPreviousData==>'+mapPreviousData);
            
            ssd.vpcrCurrentData = mapCurrentData.values();
            ssd.vpcrPreviousData = mapPreviousData.values();

            //System.debug('mapCurrentData ** ' + mapCurrentData);
            //System.debug('mapPreviousData ** ' + mapPreviousData);        
            //System.debug('Current Data --> ' + ssd.vpcrCurrentData);
            //System.debug('Previous Data --> ' + ssd.vpcrPreviousData);
        }
        return ssd;
    }  

    public static void setGrowthDetails(AggregateResult ar, vpcrSnapshot vpcrs) {
        vpcrs.company  = String.valueOf(ar.get('Company'));
        vpcrs.companyLink = '/'+ String.valueOf(ar.get('CompanyID'));
        vpcrs.currentSCE = String.valueOf(ar.get('currentSCE'));
        vpcrs.growthSCEReceivingCompensation = String.valueOf(ar.get('SP1'));
        vpcrs.growthAdditionalSCEReceivingCompensation = String.valueOf(ar.get('SP2'));
        if (null != vpcrs.growthNoOfProductsSent && '' != vpcrs.growthNoOfProductsSent) {
            vpcrs.growthNoOfProductsSent = String.valueOf(Integer.valueOf(vpcrs.growthNoOfProductsSent) + Integer.valueOf(ar.get('noOfProductsSent')));
        } else {
        	vpcrs.growthNoOfProductsSent = String.valueOf(ar.get('noOfProductsSent'));            
        }
        if (null != vpcrs.growthNoOfProductsNotYetSent && '' != vpcrs.growthNoOfProductsNotYetSent) {
            vpcrs.growthNoOfProductsNotYetSent = String.valueOf(Integer.valueOf(vpcrs.growthNoOfProductsNotYetSent) + ((Integer.valueOf(ar.get('noOfProducts')) - Integer.valueOf(ar.get('noOfProductsSent')))));
        } else {
        	vpcrs.growthNoOfProductsNotYetSent = String.valueOf(Integer.valueOf(ar.get('noOfProducts')) - Integer.valueOf(ar.get('noOfProductsSent')));
        }        
        vpcrs.retentionSCEReceivingCompensation = '';
        vpcrs.retentionAdditionalSCEReceivingCompensation = '';
        vpcrs.retentionNoOfProductsSent = String.valueOf(0);
        vpcrs.retentionNoOfProductsNotYetSent = String.valueOf(0);
        //---------------------
		vpcrs.proactiveRenewalSCEReceivingCompensation = '';
        vpcrs.proactiveRenewalIncentiveStatus = '';
        vpcrs.accountOwnerId = '';
        vpcrs.opportunityOwnerId = '';        
        //---------------------
    }
    public static void setRetentionDetails(AggregateResult ar, vpcrSnapshot vpcrs) {
        vpcrs.retentionSCEReceivingCompensation = String.valueOf(ar.get('SP1'));
        vpcrs.retentionAdditionalSCEReceivingCompensation = String.valueOf(ar.get('SP2'));
        if (null != vpcrs.retentionNoOfProductsSent && '' != vpcrs.retentionNoOfProductsSent) {
            vpcrs.retentionNoOfProductsSent = String.valueOf(Integer.valueOf(vpcrs.retentionNoOfProductsSent) + Integer.valueOf(ar.get('noOfProductsSent')));
        } else {
        	vpcrs.retentionNoOfProductsSent = String.valueOf(ar.get('noOfProductsSent'));            
        }
        if (null != vpcrs.retentionNoOfProductsNotYetSent && '' != vpcrs.retentionNoOfProductsNotYetSent) {
            vpcrs.retentionNoOfProductsNotYetSent = String.valueOf(Integer.valueOf(vpcrs.retentionNoOfProductsNotYetSent) + ((Integer.valueOf(ar.get('noOfProducts')) - Integer.valueOf(ar.get('noOfProductsSent')))));
        } else {
        	vpcrs.retentionNoOfProductsNotYetSent = String.valueOf(Integer.valueOf(ar.get('noOfProducts')) - Integer.valueOf(ar.get('noOfProductsSent')));
        }
        //---------------------
		vpcrs.proactiveRenewalSCEReceivingCompensation = '';
        vpcrs.proactiveRenewalIncentiveStatus = '';
        vpcrs.accountOwnerId = '';
        vpcrs.opportunityOwnerId = '';        
        //---------------------
    }
    
    public class StatusSnapshotData {
        @AuraEnabled
        public string loggedInUserName {get;set;}
        
        @AuraEnabled
        public string loggedInUserRole {get;set;}
        
        @AuraEnabled
        public string salesSeason {get;set;}

        @AuraEnabled
        public List<GrowthNotSent> growthNotSentData {get;set;}

        @AuraEnabled
        public List<GrowthSent> growthSentData {get;set;} 
        
        @AuraEnabled
        public List<RetentionNotSent> retentionNotSentData {get;set;}        
        
        @AuraEnabled
        public List<RetentionSent> retentionSentData {get;set;}            
    
        @AuraEnabled
        public List<vpcrSnapshot> vpcrCurrentData {get;set;}            

        @AuraEnabled
        public List<vpcrSnapshot> vpcrPreviousData {get;set;}  
        
        @AuraEnabled
        public List<Opportunity> vpcrProactiveRenewalData {get;set;}
        
    }
            
    

    public class GrowthNotSent {
        @AuraEnabled
        public Date effectiveDate;
        @AuraEnabled
        public String company;
        @AuraEnabled
        public String membershipActivityID;
        @AuraEnabled
        public String membershipActivityName;
        @AuraEnabled
        public String medicalSVPorSCE;
        @AuraEnabled
        public String noOfProductsNotYetSent;
        @AuraEnabled
        public String noOfProductsSent;
        @AuraEnabled
        public String actionRequiredCSSClass;
    }   

    public class GrowthSent {
        @AuraEnabled
        public Date effectiveDate;
        @AuraEnabled
        public String company;
        @AuraEnabled
        public String membershipActivityID;
        @AuraEnabled
        public String membershipActivityName;
        @AuraEnabled
        public String medicalSVPorSCE;
        @AuraEnabled
        public String noOfProductsSent;
        @AuraEnabled
        public String infoExtractedByICT;
        @AuraEnabled
        public String actionRequiredCSSClass;

    } 

    public class RetentionNotSent {
        @AuraEnabled
        public Date effectiveDate;
        @AuraEnabled
        public String company;
        @AuraEnabled
        public String companyID;
        //----SAMARTH----
        @AuraEnabled
        public String companyOwnerName;
        //----SAMARTH----
        @AuraEnabled
        public String companyLink;
        @AuraEnabled
        public String medicalSVPorSCE;
        //----STATUS SNAPSHOT ENHANCEMENT 2021 SAMARTH----
        @AuraEnabled
        public String noOfProductsNotYetConfirmed;
        @AuraEnabled
        public String noOfProductsConfirmed;
        //----STATUS SNAPSHOT ENHANCEMENT 2021 SAMARTH----
        @AuraEnabled
        public String noOfProductsNotYetSent;
        @AuraEnabled
        public String noOfProductsSent;
        @AuraEnabled
        public String actionRequiredCSSClass;
        
    }

    public class RetentionSent {
        @AuraEnabled
        public Date effectiveDate;
        @AuraEnabled
        public String company;
        @AuraEnabled
        public String companyID;
        //----SAMARTH----
        @AuraEnabled
        public String companyOwnerName;
        //----SAMARTH----
        @AuraEnabled
        public String companyLink;
        @AuraEnabled
        public String medicalSVPorSCE;
        @AuraEnabled
        public String noOfProductsSent;
        @AuraEnabled
        public String infoExtractedByICT;
        @AuraEnabled
        public String actionRequiredCSSClass;
    }

    public class vpcrSnapshot {
        @AuraEnabled
        public String company;
        @AuraEnabled
        public String companyID;
        @AuraEnabled
        public String companyLink;
        @AuraEnabled
        public String currentSCE;
        @AuraEnabled
        public String growthNoOfProductsNotYetSent;
        @AuraEnabled
        public String growthNoOfProductsSent;
        @AuraEnabled
        public String growthSCEReceivingCompensation;
        @AuraEnabled
        public String growthAdditionalSCEReceivingCompensation;        
        @AuraEnabled
        public String retentionNoOfProductsNotYetSent;
        @AuraEnabled
        public String retentionNoOfProductsSent;        
        @AuraEnabled
        public String retentionSCEReceivingCompensation;        
        @AuraEnabled
        public String retentionAdditionalSCEReceivingCompensation;
        //-----------
       	@AuraEnabled
        public String proactiveRenewalSCEReceivingCompensation;
        @AuraEnabled
        public String proactiveRenewalIncentiveStatus;
        @AuraEnabled
        public String accountOwnerId;
        @AuraEnabled
        public String opportunityOwnerId;
        //-------------
    }

     public class ExportWrapper{
        @AuraEnabled
        public Map<String,Set<String>> objectItags { get; set; }
        @AuraEnabled
        public String xmlString { get; set; }
        @AuraEnabled
        public string loggedInUserName {get;set;}
        @AuraEnabled
        public string loggedInUserRole {get;set;}
        @AuraEnabled
        public string salesSeason {get;set;}
    }


}