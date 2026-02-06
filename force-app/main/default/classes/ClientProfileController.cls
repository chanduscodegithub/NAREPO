/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-23-2024
 * @last modified by  : Spoorthy
**/
public with sharing class ClientProfileController {
    @AuraEnabled
    public static boolean getUserProfile() {
        Id profileId = UserInfo.getProfileId();
        Boolean HasAccess = true;
        String profileName = [Select Name from Profile where Id =:profileId].Name;
        if( profileName == 'Senior Executive - ISBA'){
            HasAccess = false;
        }
        return HasAccess;
    }
    @AuraEnabled(cacheable=true)
    public static List<Service_AMT__c> uhgAccountTeamEnhancement(String accountId){
        List<Service_AMT__c> servAmtList = new List<Service_AMT__c>();
        servAmtList = [SELECT Id, Name, Company__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c 
                        FROM Service_AMT__c 
                        WHERE Company__c =: accountId AND Case_Management_End_Date__c = null 
                            AND (Contact_Role__c = 'Specialty Benefits Consultant' OR
                                 Contact_Role__c = 'Client Manager' OR
                                 Contact_Role__c = 'Client Management Consultant' OR
                                 Contact_Role__c = 'Service Account Manager' OR
                                 Contact_Role__c = 'UHC Medical Director' OR
                                 Contact_Role__c = 'Clinical Account Executive' OR
                                 Contact_Role__c = 'Health Analytics Consultant' OR
                                 Contact_Role__c = 'Specialty Benefits Consultant' OR
                                 Contact_Role__c = 'Engagement Solutions Consultant')
                        ORDER BY Last_Name__c ASC];
        return servAmtList;
    }

    @AuraEnabled(cacheable=true)
    public static ClientProfileDataWpr getClientProfileData(String accountId){
        System.debug('accountId=='+accountId);
        SeniorUHGExecutivesEngaged__c seniorExecutiveRecord = new SeniorUHGExecutivesEngaged__c();
        UHGAccountConstants clientSurveyResultsConstants = new UHGAccountConstants();
               
        ClientProfileDataWpr clientProfileDataWpr = new ClientProfileDataWpr();
        Account clientProfileQueryResult = null;
        String csrType = clientSurveyResultsConstants.CLIENT_SURVEY_RESULTS_TYPE;
         Id contactrecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
                    
                
        try{           //Specialty_SCE_Involved__c
             clientProfileQueryResult=[Select Id,Specialty_SCE__c,Specialty_SCE__r.Name,AnnualB2BSpend__c,Current_Deal_Start_Date__c,Current_Deal_Next_Renewal_Date__c,Tenure__c,Subtype__c,Fortune_500_Ranking__c,AnnualRevenue__c,Eligible_US_EEs__c,Worldwide_EEs__c,Health_Plan_Manager_Industry__c,BillingAddress,Primary_Situs_State__c,CMVPCRRVP__r.Name,CM_SCE__r.Name,Surest_Current_Deal_Start_Date__c,Surest_Next_Renewal_Date__c,
                                       (SELECT Account__c,Name, EnterpriseExecutiveSponsorName__c,EnterpriseExecutiveSponsorResponsibiliti__c, OptumExecutiveSponsorName__c, OptumExecutiveSponsorResponsibilities__c, OtherExecutiveName1__c, OtherExecutiveName2__c, OtherExecutiveName3__c, OtherExecutiveName4__c, OtherExecutiveName5__c, OtherExecutiveResponsibilities1__c, OtherExecutiveResponsibilities2__c, OtherExecutiveResponsibilities3__c, OtherExecutiveResponsibilities4__c, OtherExecutiveResponsibilities5__c, OtherExecutiveTitle1__c, OtherExecutiveTitle2__c, OtherExecutiveTitle3__c, OtherExecutiveTitle4__c, OtherExecutiveTitle5__c, UHCExecutiveSponsorName__c, UHCExecutiveSponsorResponsibilities__c, SurestExecutiveSponsorName__c, SurestExecutiveSponsorResponsibilities__c FROM Senior_UHG_Executives_Engages__r),
                                       (SELECT Id, Name, Company__c, Last_Name__c, First_Name__c, Job_Title__c,Order__c,Email__c,Phone__c,Policy_Information_MultiChecKlist__c, Case_Management_Start_Date__c,UserHierarchy__c, Case_Management_End_Date__c,Contact_Role__c,External__c 
                                        FROM Service_AMT__r 
                                        WHERE (Case_Management_End_Date__c = null OR Case_Management_End_Date__c >=TODAY) AND
                                        (Contact_Role__c = 'Specialty Benefits Client Manager' OR
                                        Contact_Role__c = 'Client Manager' OR
                                        Contact_Role__c = 'Client Management Consultant' OR
                                        Contact_Role__c = 'Service Account Manager' OR
                                        Contact_Role__c = 'UHC Medical Director' OR
                                        Contact_Role__c = 'Clinical Account Executive' OR
                                        Contact_Role__c = 'Health Analytics Consultant' OR
                                        Contact_Role__c = 'Specialty Benefits Client Manager' OR
                                        Contact_Role__c = 'Engagement Solutions Consultant' OR
                                        Contact_Role__c = 'Surest Client Manager' OR
                                        Contact_Role__c = 'Surest Account Partner')
                                        ORDER BY Last_Name__c ASC),
                                       (SELECT Membership_Type__c,Current_Year__c,Deal_years__c, Margin__c, Revenue__c, Year__c, Membership__c, Company__c,Id,Last_Updated__c, TotExp__c, TotExpRx__c,Financial_Type__c FROM Financials__r where (Membership_Type__c = 'Medical' or Membership_Type__c = 'RX') ORDER BY Year__c DESC, LastModifiedDate DESC),
                                       (SELECT Id,CompetitorAccount__r.Name,MembershipEstimate__c,CompetitorAccount__c,NumberOfMembersHeld__c,Competitorclassification__c,Account__c, Type_of_Products_Services_Provided__c FROM Competitors__r where Type__c='Account Competitor' and (Competitorclassification__c!='Other' or (Competitorclassification__c='Other' and OtherPrdctCompetitorRecordTobeDeleted__c=false)) ORDER BY CompetitorAccount__r.Name, Type_of_Products_Services_Provided__c Asc),
                                       (SELECT Id, Name,LikelihoodtoRecommendScore__c,NetPromoterType__c,OverallSatisfactionScore__c,Year__c,Surest_Likelihood_to_Recommend_Score__c,Surest_Net_Promoter_Type__c FROM Client_Survey_Results__r WHERE Type__c = :csrType AND Year__c != null ORDER BY Year__c DESC,LastModifiedDate DESC),                              
                                       (SELECT Primary__c, Contact.Id, Contact.FirstName, Contact.LastName, Contact.Title, Contact.ConsultantTier__c, Contact.MailingCountry, Contact.MailingCity, Contact.MailingState, Contact.Account.Name, Contact.Account.Id,Contact.Email , Contact.MailingStateCode FROM AccountContactRelations WHERE IsDirect=false AND Contact.Status__c='Active' AND Contact.RecordTypeId=:contactRecordTypeId ORDER BY Primary__c DESC, Contact.LastName   )
                                       from Account Where Id = :accountId WITH USER_MODE];
            System.debug('clientProfileQueryResult====='+clientProfileQueryResult); 
            list<Medical_Trend__c> medList =new list<Medical_Trend__c>();
            medList=[SELECT Id, Name,Year__c,Company__c,Policy_level_medical_trends__c,Medical_Trend_Type__c FROM Medical_Trend__c WHERE (Year__c != null and Policy_level_medical_trends__c!=null) and Company__c=:accountId WITH USER_MODE ORDER BY Year__c DESC];
            
            List<BGH__c> bghList = new List<BGH__c>();
            bghList = [select BGH_Account__r.Name FROM BGH__c Where New_Account__c =:accountId and BGH_Account__c!=null AND BGH_Account__r.Subtype__c='Business Group on Health (BGH)' WITH USER_MODE ORDER By BGH_Account__r.Name];
            
            String bghString = '';
            if(bghList.size() > 0){
                List<String> bghNameList = new List<String>();
                for(BGH__c eachBgh : bghList){
                    bghNameList.add(eachBgh.BGH_Account__r.Name);
                }
                bghString = String.join(bghNameList,'; ');
            }
            clientProfileDataWpr.bghData =bghString;
            
            if(clientProfileQueryResult != null){
                if(clientProfileQueryResult.Specialty_SCE__c != null){
                    clientProfileDataWpr.specialtyBenefitInvolved = clientProfileQueryResult.Specialty_SCE__r.Name;
                }
                else{
                    clientProfileDataWpr.specialtyBenefitInvolved = null;
                }

                if(clientProfileQueryResult.Current_Deal_Start_Date__c != null){
                   
					String formattedDateStr = clientProfileQueryResult.Current_Deal_Start_Date__c.month()+'/'+clientProfileQueryResult.Current_Deal_Start_Date__c.day()+'/'+clientProfileQueryResult.Current_Deal_Start_Date__c.year();                  
                	  system.debug('formattedDateStr==='+formattedDateStr);
                    clientProfileDataWpr.currentDealStartDate = formattedDateStr;
                    system.debug('----------'+clientProfileQueryResult.Current_Deal_Start_Date__c);
                } 
                if(clientProfileQueryResult.Current_Deal_Next_Renewal_Date__c != null){
                   
					String formattedDateStr = clientProfileQueryResult.Current_Deal_Next_Renewal_Date__c.month()+'/'+clientProfileQueryResult.Current_Deal_Next_Renewal_Date__c.day()+'/'+clientProfileQueryResult.Current_Deal_Next_Renewal_Date__c.year();                  
                	  system.debug('formattedDateStr==='+formattedDateStr);
                   
                    clientProfileDataWpr.currentDealRenewalDate = formattedDateStr;
                }
                if(clientProfileQueryResult.Surest_Current_Deal_Start_Date__c != null){
                   
					String formattedDateStr = clientProfileQueryResult.Surest_Current_Deal_Start_Date__c.month()+'/'+clientProfileQueryResult.Surest_Current_Deal_Start_Date__c.day()+'/'+clientProfileQueryResult.Surest_Current_Deal_Start_Date__c.year();                                     
                    clientProfileDataWpr.surestCurrentDealStartDate = formattedDateStr;
                } 
                if(clientProfileQueryResult.Surest_Next_Renewal_Date__c != null){
                   
					String formattedDateStr = clientProfileQueryResult.Surest_Next_Renewal_Date__c.month()+'/'+clientProfileQueryResult.Surest_Next_Renewal_Date__c.day()+'/'+clientProfileQueryResult.Surest_Next_Renewal_Date__c.year();                                     
                    clientProfileDataWpr.surestNextRenewalDate = formattedDateStr;
                } 
            	clientProfileDataWpr.getCorporationOverviewData = clientProfileQueryResult;
            }
           
            if(clientProfileQueryResult.Senior_UHG_Executives_Engages__r.size() > 0){
                List<SeniorUHGExecutivesEngaged__c> seniorExecutiveList = clientProfileQueryResult.Senior_UHG_Executives_Engages__r;
                    seniorExecutiveRecord = getSeniorUHGExecutivesData(seniorExecutiveList);
                        clientProfileDataWpr.getSeniorExecutiveData = seniorExecutiveRecord;
            }
            
            if(clientProfileQueryResult.Service_AMT__r.size() > 0){
                List<Service_AMT__c> serviceAMTRecordsList = clientProfileQueryResult.Service_AMT__r;
                     clientProfileDataWpr.getCoreUHGTeamData = serviceAMTRecordsList;
            }
            
            if(clientProfileQueryResult.AccountContactRelations.size() > 0){
                 List<AccountContactRelation> accountContactRelationsList= clientProfileQueryResult.AccountContactRelations;
                system.debug('accountContactRelationsList===='+accountContactRelationsList);    
                clientProfileDataWpr.getCompanyConsultantData = accountContactRelationsList;
            }
            
            if(clientProfileQueryResult.Financials__r.size() > 0){
                List<Financial__c> financialListUNET = new List<Financial__c>();
                List<Financial__c> financialListSurest = new List<Financial__c>();
                for(Financial__c fn : clientProfileQueryResult.Financials__r){
                    if(fn.Financial_Type__c == 'Total'){
                        financialListUNET.add(fn);
                    }else if(fn.Financial_Type__c == 'Surest'){
                        financialListSurest.add(fn);
                    }
                }
                if(financialListUNET.size()>0){
                    Map<String,Object> financialData = new  Map<String,Object>();
                    financialData = getfinancialsData(financialListUNET);
                    clientProfileDataWpr.getFinancialData = financialData;
                }
                if(financialListSurest.size()>0){
                    Map<String,Object> financialDataSurest = new  Map<String,Object>();
                    financialDataSurest = getfinancialsData(financialListSurest);
                    clientProfileDataWpr.getFinancialDataSurest = financialDataSurest;
                }
            }
            
             if(clientProfileQueryResult.Competitors__r.size() > 0){
                List<Competitor__c> competitorsList = clientProfileQueryResult.Competitors__r;
                CompetitorResult competitorResult = new CompetitorResult();
                    competitorResult = getCompetitorsData(competitorsList);
                        clientProfileDataWpr.getCompetitorData = competitorResult;
            }
                
             if(clientProfileQueryResult.Client_Survey_Results__r.size() > 0){
                List<ClientSurveyResults__c> clientSurveyResultList = clientProfileQueryResult.Client_Survey_Results__r;
                Map<String,Object> clientSurveyResultData = new  Map<String,Object>();
                    clientSurveyResultData = getClientNPSSurveyResultData(clientSurveyResultList);
                        clientProfileDataWpr.getClientSurveyResultData = clientSurveyResultData;
            }
            System.debug('cclientProfileDataWpr.getClientSurveyResultData'+clientProfileDataWpr.getClientSurveyResultData);
            
            if(medList.size()>0){
                List<Medical_Trend__c> medicalUNET = new  List<Medical_Trend__c>();
                List<Medical_Trend__c> medicalSurest = new  List<Medical_Trend__c>();
                for(Medical_Trend__c medRec : medList){
                    if(medRec.Medical_Trend_Type__c == 'Traditional'){
                        medicalUNET.add(medRec);
                    }else if(medRec.Medical_Trend_Type__c == 'Surest'){
                        medicalSurest.add(medRec);
                    }
                }
                if(medicalUNET.size()>0){
                    clientProfileDataWpr.medList = medicalUNET;
                }
                if(medicalSurest.size()>0){
                    clientProfileDataWpr.medListSurest = medicalSurest;
                }
            }
        	
                   
        }catch(Exception exp){
            System.debug('Exception occured in getCorporationOverviewData(String) method==> '+exp.getMessage());
        }
        return clientProfileDataWpr;
    }
    
     @AuraEnabled(cacheable=true)
    public static SeniorUHGExecutivesEngaged__c getSeniorUHGExecutivesData(List<SeniorUHGExecutivesEngaged__c> seniorExecutiveList){
        
         UHGAccountSOQLConstants sUHGExeConstants = new UHGAccountSOQLConstants();
        
          SeniorUHGExecutivesEngaged__c seniorExecutiveRecord = new SeniorUHGExecutivesEngaged__c();
        
        try{
                                
                    if(seniorExecutiveList.size() > 0){
                        seniorExecutiveRecord = seniorExecutiveList[0];
                    }
                    
                        if(seniorExecutiveRecord.EnterpriseExecutiveSponsorResponsibiliti__c == null){
                            seniorExecutiveRecord.EnterpriseExecutiveSponsorResponsibiliti__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OptumExecutiveSponsorResponsibilities__c == null){
                            seniorExecutiveRecord.OptumExecutiveSponsorResponsibilities__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.UHCExecutiveSponsorResponsibilities__c == null){
                            seniorExecutiveRecord.UHCExecutiveSponsorResponsibilities__c = '';    
                        }

                        if(seniorExecutiveRecord.SurestExecutiveSponsorResponsibilities__c == null){
                            seniorExecutiveRecord.SurestExecutiveSponsorResponsibilities__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OtherExecutiveResponsibilities1__c == null){
                            seniorExecutiveRecord.OtherExecutiveResponsibilities1__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OtherExecutiveResponsibilities2__c == null){
                            seniorExecutiveRecord.OtherExecutiveResponsibilities2__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OtherExecutiveResponsibilities3__c == null){
                            seniorExecutiveRecord.OtherExecutiveResponsibilities3__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OtherExecutiveResponsibilities4__c == null){
                            seniorExecutiveRecord.OtherExecutiveResponsibilities4__c = '';    
                        }
                        
                        if(seniorExecutiveRecord.OtherExecutiveResponsibilities5__c == null){
                            seniorExecutiveRecord.OtherExecutiveResponsibilities5__c = '';    
                        }
                 
        }catch(Exception e){
            System.debug('Exception message - '+e);
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        
        if(seniorExecutiveRecord.Id == null)
        {
            seniorExecutiveRecord.EnterpriseExecutiveSponsorResponsibiliti__c = '';    
            seniorExecutiveRecord.OptumExecutiveSponsorResponsibilities__c = '';    
            seniorExecutiveRecord.UHCExecutiveSponsorResponsibilities__c = '';  
            seniorExecutiveRecord.SurestExecutiveSponsorResponsibilities__c = '';  
            seniorExecutiveRecord.OtherExecutiveResponsibilities1__c = '';    
            seniorExecutiveRecord.OtherExecutiveResponsibilities2__c = '';    
            seniorExecutiveRecord.OtherExecutiveResponsibilities3__c = '';    
            seniorExecutiveRecord.OtherExecutiveResponsibilities4__c = '';    
            seniorExecutiveRecord.OtherExecutiveResponsibilities5__c = '';    
        }
        
        System.debug('seniorExecutiveRecord-->>'+seniorExecutiveRecord);
        System.debug('Exit getSeniorUHGExecutivesRecords()'); 
        
        return seniorExecutiveRecord;
    }
    
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getfinancialsData(List<Financial__c> financialList){
        
        Map<String,Object> financialReturnMap = null;
        Integer [] arrayOfYearsMed = new List<Integer>();
        Integer [] arrayOfYearsRx = new List<Integer>();
        try{
            if(financialList != null){                
                UHGAccountConstants financialConstants = new UHGAccountConstants();
                UHGAccountSOQLConstants financialSOQLConstants = new UHGAccountSOQLConstants();                
                financialReturnMap = new Map<String,Object>();
                Integer [] lastFourYearsMed = new List<Integer>();//getLastFourYears();
                Integer [] lastFourYearsRx = new List<Integer>();                
                //system.debug('Years : '+arrayOfYears);
                
                for(Financial__c fin1: financialList)
                {	
                  
                    if(fin1.Membership_Type__c == 'Medical' && !lastFourYearsMed.contains(fin1.Year__c.year()) && lastFourYearsMed.size() < 4){
                        lastFourYearsMed.add(fin1.Year__c.year());                                                                                
                    }else if(fin1.Membership_Type__c == 'RX' && !lastFourYearsRx.contains(fin1.Year__c.year()) && lastFourYearsRx.size() < 4){
                        lastFourYearsRx.add(fin1.Year__c.year());
                    }                        
                }
                if(lastFourYearsMed.size() <4){
                    for(Integer i=lastFourYearsMed.size();i<4;i++){
                        lastFourYearsMed.add(0);   
                    }
                }
                if(lastFourYearsRx.size() <4){
                    for(Integer i=lastFourYearsRx.size();i<4;i++){
                        lastFourYearsRx.add(0);   
                    }
                }
                lastFourYearsMed.sort();
                lastFourYearsRx.sort();
                List<Integer> finalList = new List<Integer>();
                for(Integer i = lastFourYearsMed.size()-1; i>=0;i--)
                {
                    arrayOfYearsMed.add(lastFourYearsMed.get(i));
                }
                for(Integer i = lastFourYearsRx.size()-1; i>=0;i--)
                {
                    arrayOfYearsRx.add(lastFourYearsRx.get(i));
                }
                system.debug('arrayOfYears : '+arrayOfYearsMed);
                
                List<String []> medicalList = new LIST<String []>();
                String [] membershipData = new List<String>(); 
                membershipData.add('Membership');
                String [] revenueData = new List<String>(); 
                revenueData.add('Revenue');  
                String [] marginData = new List<String>(); 
                marginData.add('Margin');  
                String [] dealYearsData = new List<String>(); 
                dealYearsData.add('Deal Years');  
                String [] currentYearsData = new List<String>(); 
                currentYearsData.add('Current Year');
                String [] LastUpdated = new List<String>(); 
                LastUpdated.add('Last Updated');
                
                List<String []> rxList = new LIST<String []>();
                String [] membershipDataRx = new List<String>(); 
                membershipDataRx.add('Membership');
                String [] revenueDataRx = new List<String>(); 
                revenueDataRx.add('Revenue');  
                String [] marginDataRx = new List<String>(); 
                marginDataRx.add('Margin'); 
                String [] LastUpdatedRx = new List<String>(); 
                LastUpdatedRx.add('Last Updated');
                // Integer i = 3;
                for(Integer i=3; i>=0; i--){
                    Boolean isRxAdded = false,isMedicalAdded = false;
                    Boolean isMedicalExist = false,isRxExist = false;
                    Decimal membershipMed=0,revenueMed=0,marginMed=0;
                    Decimal membershipRx=0,revenueRx=0,marginRx=0;
                    Date lastUpdated_Medical = date.newinstance(1700, 1, 1);
                    Date lastUpdated_Rx = date.newinstance(1700, 1, 1);
					String dealYear = '',currentYear = '';                    
                    for(Financial__c fin : financialList)
                    {                          
                        if(fin.Membership_Type__c == 'Medical'){                            
                            if(fin.Year__c.year() == arrayOfYearsMed[i]){                                
                                isMedicalExist = true;
                                /*if(fin.Membership__c != null){
                                    membershipMed = membershipMed + fin.Membership__c;
                                }
                                if(fin.Revenue__c != null){
                                    revenueMed = revenueMed + fin.Revenue__c;                               
                                }      
                                if(fin.Margin__c != null){
                                    marginMed = marginMed + fin.Margin__c;                                
                                }*/
                                if(fin.Last_Updated__c > lastUpdated_Medical){
                                    lastUpdated_Medical = fin.Last_Updated__c;
                                    if(fin.Membership__c != null){
                                    	membershipMed = fin.Membership__c;
                                    }
                                    if(fin.Revenue__c != null){
                                        revenueMed = fin.Revenue__c;                               
                                    }      
                                    if(fin.Margin__c != null){
                                        marginMed = fin.Margin__c;                                
                                    }
                                    
                                }                                                                                                             
                            }                            
                        }else{
                            if(fin.Year__c.year() == arrayOfYearsRx[i]){                              
                                isRxExist = true;                                                                                                                                  
                                if(fin.Last_Updated__c > lastUpdated_Rx){
                                    lastUpdated_Rx = fin.Last_Updated__c;
                                    if(fin.Membership__c != null){
                                        membershipRx = fin.Membership__c;
                                    }  
                                    if(fin.Revenue__c != null){
                                        revenueRx = fin.Revenue__c;                               
                                    }                              
                                    if(fin.TotExp__c != null && fin.TotExpRx__c != null){
                                        /*Decimal margin_Rx = fin.TotExp__c - fin.TotExpRx__c; 
                                        marginRx = marginRx + margin_Rx;  */
                                        marginRx = fin.TotExp__c - fin.TotExpRx__c; 
                                    }
                                }                                   
                            }                           
                        }                       
                    }
                    if(!isMedicalExist){
                        membershipData.add('');
                        revenueData.add('');
                        marginData.add('');
                        
                    }else{
                        membershipData.add(membershipMed.format());
                        revenueData.add('$'+revenueMed.format());
                        marginData.add('$'+marginMed.format()); 
                    }
                    if(!isRxExist){
                        membershipDataRx.add('');
                        revenueDataRx.add('');
                        marginDataRx.add('');
                        
                    }else{
                        membershipDataRx.add(membershipRx.format());
                        revenueDataRx.add('$'+revenueRx.format());
                        marginDataRx.add('$'+marginRx.format());
                                                
                    }                    
                }
                
                medicalList.add(membershipData);
                medicalList.add(revenueData);
                medicalList.add(marginData);
                
                rxList.add(membershipDataRx);
                rxList.add(revenueDataRx);
                rxList.add(marginDataRx);
                
                financialReturnMap.put('Medical',medicalList);
                financialReturnMap.put('rxData',rxList);
                financialReturnMap.put('YearArrayMed',arrayOfYearsMed);
                financialReturnMap.put('YearArrayRx',arrayOfYearsRx);         
            } else{
                throw new NullPointerException();
            }
            
        }catch(Exception e) {
            System.debug('Error occurred in FinancialsApex() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
        }      
        System.debug('Exit CMAccounts <FinancialsApex()>');     
        return financialReturnMap; 
        
    }
    
     @AuraEnabled(cacheable=true)
    public static CompetitorResult getCompetitorsData(List<Competitor__c> competitorsList){
        
        CompetitorResult competitorResult = new CompetitorResult();
        
        List<Competitor__c> pharmacyOptumRxRecords = new List<Competitor__c>();
        List<Competitor__c> pharmacyOtherRecords = new List<Competitor__c>();
        List<Competitor__c> dentalNationalRecords = new List<Competitor__c>();
        List<Competitor__c> dentalNonNationalRecords = new List<Competitor__c>();
        List<Competitor__c> visionNationalRecords = new List<Competitor__c>();
        List<Competitor__c> visionNonNationalRecords = new List<Competitor__c>();
         List<Competitor__c> medicalNationalRecords = new List<Competitor__c>();
        List<Competitor__c> medicalNonNationalRecords = new List<Competitor__c>();
        
        
       
        System.debug('competitorsList==='+competitorsList); 
        List<Competitor__c> sortedCompetitorsList = new List<Competitor__c>();
                    List<Competitor__c> nonUhcOptumRecords = new List<Competitor__c>();
                    for(Integer i = 0 ; i < competitorsList.size() ; i++) {
                        if(competitorsList[i].CompetitorAccount__r != null && competitorsList[i].CompetitorAccount__r.Name == 'UHC-Optum') {
                            sortedCompetitorsList.add(competitorsList[i]);
                            //competitorsList.remove(i);
                        } else {
                            nonUhcOptumRecords.add(competitorsList[i]);
                        }
                    }
                    
                    if(sortedCompetitorsList.size() > 0 && nonUhcOptumRecords.size() > 0) {
                        sortedCompetitorsList.addAll(nonUhcOptumRecords);
                    } else if (sortedCompetitorsList.size() == 0 && nonUhcOptumRecords.size() > 0) {
                        sortedCompetitorsList.addAll(nonUhcOptumRecords);
                    }
        system.debug('sortedCompetitorsList===='+sortedCompetitorsList);
        string Type_of_Products_Services_Provided;
        List<String> lifeCarrierList = new List<String>();
        List<String> disabilityCarrierList = new List<String>();
        List<String> supplementalCarrierList = new List<String>();
        List<String> hearingCarrierList = new List<String>();
        List<String> petInsuranceCarrierList = new List<String>();
        if(sortedCompetitorsList != null && sortedCompetitorsList.size() > 0) {
            for(Competitor__c competitorObj : sortedCompetitorsList){
                 if(competitorObj.Competitorclassification__c.equalsIgnoreCase('Other')) {
                       
                       
                        if(competitorObj.Type_of_Products_Services_Provided__c!=null){
                                   system.debug('inside else if ------'+competitorObj.Type_of_Products_Services_Provided__c);
                                if(competitorObj.Type_of_Products_Services_Provided__c == 'Life'){
                                    competitorObj.Type_of_Products_Services_Provided__c = null;
                                    system.debug('inside if life');
                                lifeCarrierList.add(competitorObj.CompetitorAccount__r.Name);
                                    system.debug('lifeCarrierList=='+lifeCarrierList);
                                }
                           
                      if(competitorObj.Type_of_Products_Services_Provided__c == 'Disability'){
                                    competitorObj.Type_of_Products_Services_Provided__c = null;
                                    system.debug('inside if life');
                                disabilityCarrierList.add(competitorObj.CompetitorAccount__r.Name);
                                    system.debug('lifeCarrierList=='+disabilityCarrierList);
                        }
                            
                         if(competitorObj.Type_of_Products_Services_Provided__c == 'Supplemental Health (APP\\CI\\HI)'){
                                    competitorObj.Type_of_Products_Services_Provided__c = null;
                                    system.debug('inside if life');
                                supplementalCarrierList.add(competitorObj.CompetitorAccount__r.Name);
                                    system.debug('lifeCarrierList=='+supplementalCarrierList);
                        }
                            if(competitorObj.Type_of_Products_Services_Provided__c == 'Hearing'){
                                    competitorObj.Type_of_Products_Services_Provided__c = null;
                                    system.debug('inside if life');
                                hearingCarrierList.add(competitorObj.CompetitorAccount__r.Name);
                                    system.debug('lifeCarrierList=='+hearingCarrierList);
                        }
                            if(competitorObj.Type_of_Products_Services_Provided__c == 'Pet Insurance'){
                                    competitorObj.Type_of_Products_Services_Provided__c = null;
                                    system.debug('inside if life');
                                petInsuranceCarrierList.add(competitorObj.CompetitorAccount__r.Name);
                                    system.debug('lifeCarrierList=='+petInsuranceCarrierList);
                        }
                     
                      }    
                       
                   }
            }
            for(Competitor__c competitorObj : sortedCompetitorsList) {
            system.debug('competitorObj----'+competitorObj);
                if(competitorObj != null && competitorObj.Competitorclassification__c != null && competitorObj.Competitorclassification__c.trim().length() > 0 &&
                  		competitorObj.CompetitorAccount__r.Name != null) {
                       system.debug('-----'+competitorObj.Competitorclassification__c);
                    if(competitorObj.Competitorclassification__c.equalsIgnoreCase('Pharmacy')) {
                          system.debug('in pharmacy');
                        if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase('Total')) {
                            competitorResult.pharmacyTotalCompetitorObj = competitorObj;
                        } else if(competitorObj.CompetitorAccount__r.Name == 'Optum Rx') {
                            //competitorResultObj.pharmacyCompetitorList.add(competitorObj);
                            pharmacyOptumRxRecords.add(competitorObj);
                        } else {
                            pharmacyOtherRecords.add(competitorObj);
                        }
                    }else if(competitorObj.Competitorclassification__c.equalsIgnoreCase('Dental')) {
                       
                  		if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase('Total')) {
                        	//competitorResultObj.isTotalActiveInDental = true;
                            competitorResult.dentalTotalCompetitorObj = competitorObj;	
                       	} else if(competitorObj.CompetitorAccount__r.Name == 'National Accounts'){
                            //competitorResultObj.dentalCompetitorList.add(competitorObj);
                            dentalNationalRecords.add(competitorObj);
                        } else {
                            dentalNonNationalRecords.add(competitorObj);
                        }
                       
                   	} else if(competitorObj.Competitorclassification__c.equalsIgnoreCase('Vision')) {
                       
                   		if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase('Total')) {
                        	//competitorResultObj.isTotalActiveInVision = true;
                            competitorResult.visionTotalCompetitorObj = competitorObj;	
                       	} else if(competitorObj.CompetitorAccount__r.Name == 'National Accounts') {
                            //competitorResultObj.visionCompetitorList.add(competitorObj);
                            visionNationalRecords.add(competitorObj);
                        } else {
                            visionNonNationalRecords.add(competitorObj);
                        }
                       
                    } else if(competitorObj.Competitorclassification__c.equalsIgnoreCase('Other')) {
                       
                        if(competitorObj.Type_of_Products_Services_Provided__c == null) {
                       		competitorObj.Type_of_Products_Services_Provided__c = '';
                        }
                        if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase('UHC-Optum')) {
                            system.debug(competitorObj.Competitorclassification__c+'cla Veera');
                            system.debug('checcking for semicolon'+Type_of_Products_Services_Provided);
                            system.debug('checking for semicolon'+competitorObj.Type_of_Products_Services_Provided__c);
                            if(Type_of_Products_Services_Provided==null)
                                Type_of_Products_Services_Provided =competitorObj.Type_of_Products_Services_Provided__c;
                            else{
                                if(competitorObj.Type_of_Products_Services_Provided__c != ''){
                                	system.debug('checking for null condition');
                                    Type_of_Products_Services_Provided =Type_of_Products_Services_Provided+'; '+competitorObj.Type_of_Products_Services_Provided__c;
                                }
                            }
                                competitorObj.Type_of_Products_Services_Provided__c = Type_of_Products_Services_Provided;
                            //competitorResultObj.isTotalActiveInVision = true;
                            competitorResult.otherproductsCompetitor = competitorObj;	
                       	}
                      
                       System.debug('competitorObj before ADD '+competitorObj);
                   	   //competitorResult.otherproductsCompetitorList.add(competitorObj);
                       
                   } else if(competitorObj.Competitorclassification__c.equalsIgnoreCase('Medical')) {
                       
                   		if(competitorObj.CompetitorAccount__r.Name.equalsIgnoreCase('Total')) {
                        	//competitorResultObj.isTotalActiveInVision = true;
                            competitorResult.medicalTotalCompetitorObj = competitorObj;	
                       	} else if(competitorObj.CompetitorAccount__r.Name == 'National Accounts') {
                            //competitorResultObj.visionCompetitorList.add(competitorObj);
                            medicalNationalRecords.add(competitorObj);
                        } else {
                            medicalNonNationalRecords.add(competitorObj);
                        }
                       
                    } 
                 }
            }
        }
        
                    String toRemoveSemicolon = competitorResult.otherproductsCompetitor.Type_of_Products_Services_Provided__c;
        		system.debug('toRemoveSemicolon==='+toRemoveSemicolon);
        if(toRemoveSemicolon != null){
           system.debug('index==='+toRemoveSemicolon.indexOf(';'));
            if(toRemoveSemicolon.indexOf(';') == 0){
                toRemoveSemicolon = toRemoveSemicolon.replaceFirst('; ','');
            }
            system.debug('toRemoveSemicolon2==='+toRemoveSemicolon);
            competitorResult.otherproductsCompetitor.Type_of_Products_Services_Provided__c = toRemoveSemicolon;

        }
        
        String lifeCarrierString = '';
        if(lifeCarrierList.size()>0){
            if(lifeCarrierList.contains('UHC-Optum')){
                if(lifeCarrierList.size() != 1){
                    lifeCarrierList.remove(lifeCarrierList.indexOf('UHC-Optum'));               
                    lifeCarrierList.sort();
                    lifeCarrierList.add(0,'UHC-Optum');
                    lifeCarrierString = String.join(lifeCarrierList,'; ');
                }else{
                   lifeCarrierString = String.join(lifeCarrierList,'; '); 
                }
            }else{
            lifeCarrierList.sort();
            lifeCarrierString = String.join(lifeCarrierList,'; ');
            }
        }
        system.debug('lifeCarrierString=='+lifeCarrierString);
        competitorResult.lifeCarrierListString = lifeCarrierString;
        
        String disabilityCarrierString = '';
        if(disabilityCarrierList.size()>0){
            if(disabilityCarrierList.contains('UHC-Optum')){
                if(disabilityCarrierList.size() != 1){
                    disabilityCarrierList.remove(disabilityCarrierList.indexOf('UHC-Optum'));               
                    disabilityCarrierList.sort();
                    disabilityCarrierList.add(0,'UHC-Optum');
                    disabilityCarrierString = String.join(disabilityCarrierList,'; ');
                }else{
                   disabilityCarrierString = String.join(disabilityCarrierList,'; '); 
                }
            }else{
            disabilityCarrierList.sort();
            disabilityCarrierString = String.join(disabilityCarrierList,'; ');
            }
        }
        
        competitorResult.disabilityCarrierListString = disabilityCarrierString;
        
        String supplementalCarrierString = '';
        if(supplementalCarrierList.size()>0){
            if(supplementalCarrierList.contains('UHC-Optum')){
                if(supplementalCarrierList.size() != 1){
                    supplementalCarrierList.remove(supplementalCarrierList.indexOf('UHC-Optum'));               
                    supplementalCarrierList.sort();
                    supplementalCarrierList.add(0,'UHC-Optum');
                    supplementalCarrierString = String.join(supplementalCarrierList,'; ');
                }else{
                   supplementalCarrierString = String.join(supplementalCarrierList,'; '); 
                }
            }else{
            supplementalCarrierList.sort();
            supplementalCarrierString = String.join(supplementalCarrierList,'; ');
            }
        }
      
        competitorResult.supplementalCarrierListString = supplementalCarrierString;
        
        String hearingCarrierString = '';
        if(hearingCarrierList.size()>0){
            if(hearingCarrierList.contains('UHC-Optum')){
                if(hearingCarrierList.size() != 1){
                    hearingCarrierList.remove(hearingCarrierList.indexOf('UHC-Optum'));               
                    hearingCarrierList.sort();
                    hearingCarrierList.add(0,'UHC-Optum');
                    hearingCarrierString = String.join(hearingCarrierList,'; ');
                }else{
                   hearingCarrierString = String.join(hearingCarrierList,'; '); 
                }
            }else{
            hearingCarrierList.sort();
            hearingCarrierString = String.join(hearingCarrierList,'; ');
            }
        }
        system.debug('lifeCarrierString=='+lifeCarrierString);
        competitorResult.hearingCarrierListString = hearingCarrierString;
        
        String petInsuranceCarrierListString = '';
        if(petInsuranceCarrierList.size()>0){
            if(petInsuranceCarrierList.contains('UHC-Optum')){
                if(petInsuranceCarrierList.size() != 1){
                    petInsuranceCarrierList.remove(petInsuranceCarrierList.indexOf('UHC-Optum'));               
                    petInsuranceCarrierList.sort();
                    petInsuranceCarrierList.add(0,'UHC-Optum');
                    petInsuranceCarrierListString = String.join(petInsuranceCarrierList,'; ');
                }else{
                   petInsuranceCarrierListString = String.join(petInsuranceCarrierList,'; '); 
                }
            }else{
            petInsuranceCarrierList.sort();
            petInsuranceCarrierListString = String.join(petInsuranceCarrierList,'; ');
            }
        }
        system.debug('lifeCarrierString=='+lifeCarrierString);
        competitorResult.petInsuranceCarrierListString = petInsuranceCarrierListString;
        
        if(pharmacyOptumRxRecords != null && pharmacyOptumRxRecords.size() > 0) {
                competitorResult.pharmacyCompetitorList.addAll(pharmacyOptumRxRecords);
            }
            if(pharmacyOtherRecords != null && pharmacyOtherRecords.size() > 0) {
                competitorResult.pharmacyCompetitorList.addAll(pharmacyOtherRecords);
            }
            
            if(dentalNationalRecords != null && dentalNationalRecords.size() > 0) {
                competitorResult.dentalCompetitorList.addAll(dentalNationalRecords);
            }
            if(dentalNonNationalRecords != null && dentalNonNationalRecords.size() > 0) {
                competitorResult.dentalCompetitorList.addAll(dentalNonNationalRecords);
            }
            
            if(visionNationalRecords != null && visionNationalRecords.size() > 0) {
                competitorResult.visionCompetitorList.addAll(visionNationalRecords);
            }
            if(visionNonNationalRecords != null && visionNonNationalRecords.size() > 0) {
                competitorResult.visionCompetitorList.addAll(visionNonNationalRecords);
            }
        
        	if(medicalNationalRecords != null && medicalNationalRecords.size() > 0) {
                competitorResult.medicalCompetitorList.addAll(medicalNationalRecords);
            }
        	if(medicalNonNationalRecords != null && medicalNonNationalRecords.size() > 0) {
                competitorResult.medicalCompetitorList.addAll(medicalNonNationalRecords);
            }
        
        return competitorResult;
    }
    
    public class CompetitorResult {
        
        @AuraEnabled
        public List<Competitor__c> pharmacyCompetitorList { get;set; }
        
        @AuraEnabled
        public List<Competitor__c> dentalCompetitorList { get;set; }
        
        @AuraEnabled
        public List<Competitor__c> visionCompetitorList { get;set; }
        
        @AuraEnabled
        public Competitor__c otherproductsCompetitor { get;set; }
        
        @AuraEnabled
        public List<Competitor__c> medicalCompetitorList { get;set; }
        
         @AuraEnabled        
        public List<String> typeOfOtherProductsProvided { get;set; }
        
        @AuraEnabled
        public Competitor__c pharmacyTotalCompetitorObj { get;set; }
        
        @AuraEnabled
        public Competitor__c dentalTotalCompetitorObj { get;set; }
        
        @AuraEnabled
        public Competitor__c visionTotalCompetitorObj { get;set; }
        
        @AuraEnabled
        public Competitor__c medicalTotalCompetitorObj { get;set; }
        
         @AuraEnabled
        public String lifeCarrierListString { get;set; }
        
        @AuraEnabled
        public String petInsuranceCarrierListString { get;set; }
        
        @AuraEnabled
        public String hearingCarrierListString { get;set; }
        
        @AuraEnabled
        public String supplementalCarrierListString { get;set; }
        
        @AuraEnabled
        public String disabilityCarrierListString { get;set; }
        
        
        public CompetitorResult() {
            
            lifeCarrierListString = '';
            disabilityCarrierListString ='';
            supplementalCarrierListString = '';
            hearingCarrierListString = '';
            petInsuranceCarrierListString ='';
        pharmacyCompetitorList = new List<Competitor__c>();
            dentalCompetitorList = new List<Competitor__c>();
            visionCompetitorList = new List<Competitor__c>();
            otherproductsCompetitor = new Competitor__c();
            medicalCompetitorList = new List<Competitor__c>();
            typeOfOtherProductsProvided = new List<String>();
            pharmacyTotalCompetitorObj = new Competitor__c();
            dentalTotalCompetitorObj = new Competitor__c();
            visionTotalCompetitorObj = new Competitor__c();
           medicalTotalCompetitorObj = new Competitor__c();
        }
    
    }
    @AuraEnabled(cacheable=true)
    public static Map<String,Object> getClientNPSSurveyResultData(List<ClientSurveyResults__c> csrList1){
        Map<String,Object> csrReturnMap = null;
        try{
            if(csrList1 != null){                
                 UHGAccountSOQLConstants crsSOQLConstants = new UHGAccountSOQLConstants();
                csrReturnMap = new Map<String,Object>();
                //String [] arrayOfYears = getLastFourYears();
                if(schema.sobjecttype.ClientSurveyResults__c.isaccessible() && schema.sobjecttype.ClientSurveyResults__c.isQueryable()) {
                    
                                     
                    List<ClientSurveyResults__c> csrList = new List<ClientSurveyResults__c>();
                    List<ClientSurveyResultsWrapper> csrList2 = new List<ClientSurveyResultsWrapper>();
                    String [] isYearAdded = new List<String>();
                   
                    for(ClientSurveyResults__c csr : csrList1)
                    {
                        system.debug('isYearAdded : '+isYearAdded.contains(csr.Year__c));
                        if(!isYearAdded.contains(csr.Year__c) && csrList2.size() < 4){
                            isYearAdded.add(String.valueOf(csr.Year__c));                              
                            csrList2.add(new ClientSurveyResultsWrapper(csr));                                
                        }                                                  
                    }
                    csrList2.sort(); 
                    System.debug('After Sort List : '+csrList2);
                    for(ClientSurveyResultsWrapper csr : csrList2)
                    {                                                    
                        csrList.add(csr.oppy);								                                                                             
                    } 
                   	           
                    System.debug('Query List : '+csrList);
                    List<String []> csrReturnList = new LIST<String []>();
                    String [] csrLikelyHood = new List<String>(); 
                    csrLikelyHood.add(Label.Likelihood_To_Recommend_Score);       
                    String [] csrOverAllSatisfaction = new List<String>(); 
                    csrOverAllSatisfaction.add(Label.Overall_Satisfaction_Score);
                    String [] csrNetPromoter = new List<String>(); 
                    csrNetPromoter.add(Label.Net_Promoter_Type);
                    
                    String [] csrSurestLikelyHood = new List<String>(); 
                    String [] csrSurestNetPromoter = new List<String>(); 
                    csrSurestLikelyHood.add(Label.Surest_Likelihood_To_Recommend_Score);  
                    csrSurestNetPromoter.add(Label.Surest_Net_Promoter_Type);  
                               
                    set<string> availableYears = new set<string>();                                  
                    
                    for(ClientSurveyResults__c csr : csrList)
                    {
                        availableYears.add(String.valueOf(csr.Year__c));
                    }
                    String [] arrayOfYears = new List<String>();
                    for(ClientSurveyResults__c csr : csrList)
                    {
                        arrayOfYears.add(String.valueOf(csr.Year__c));
                        
                    }
                    if(arrayOfYears.size() < 4){
                        while(arrayOfYears.size() < 4){
                            arrayOfYears.add('');
                        }
                    }
                    
                    Integer j = (availableYears.size()-1);
                    for(Integer i = (arrayOfYears.size()-1); i>=0; i--)
                    {                       
                        if(availableYears.contains(arrayOfYears[i])){                                                     
                          ClientSurveyResults__c csr1 = csrList[j];
                            if(csr1.LikelihoodtoRecommendScore__c != null){
                                csrLikelyHood.add(String.valueOf(csr1.LikelihoodtoRecommendScore__c));
                            }else{
                                csrLikelyHood.add('');
                            }
                            if(csr1.OverallSatisfactionScore__c != null){
                                csrOverAllSatisfaction.add(String.valueOf(csr1.OverallSatisfactionScore__c));
                            }else{
                                csrOverAllSatisfaction.add('');
                            }
                            if(csr1.NetPromoterType__c != null){
                                csrNetPromoter.add(csr1.NetPromoterType__c);
                            }else{
                                csrNetPromoter.add('');
                            }                           
                            
                            if(csr1.Surest_Likelihood_to_Recommend_Score__c != null){
                                csrSurestLikelyHood.add(csr1.Surest_Likelihood_to_Recommend_Score__c);
                            }else{
                                csrSurestLikelyHood.add('');
                            }   
                            
                            if(csr1.Surest_Net_Promoter_Type__c != null){
                                csrSurestNetPromoter.add(csr1.Surest_Net_Promoter_Type__c);
                            }else{
                                csrSurestNetPromoter.add('');
                            }   
                                              
                          j--;
                        }else{
                          csrLikelyHood.add('');
                          csrOverAllSatisfaction.add('');
                          csrNetPromoter.add('');
                             csrSurestLikelyHood.add('');
                            csrSurestNetPromoter.add('');
                         // csrNetPromoterScore.add('');
                        }
                    }                
                    csrReturnList.add(csrLikelyHood);
                    csrReturnList.add(csrOverAllSatisfaction);
                    csrReturnList.add(csrNetPromoter);
                    csrReturnList.add(csrSurestLikelyHood);
                    csrReturnList.add(csrSurestNetPromoter);
                   // csrReturnList.add(csrNetPromoterScore);
            
                    csrReturnMap.put('LastFourYears', arrayOfYears);
                    csrReturnMap.put('CSRFinalList', csrReturnList);
                    
                }else {
                    throw new NoAccessException();
                }           
            } else{
                throw new NullPointerException();
            }
            
        }catch(Exception e) {
            System.debug('Error occurred in getClientSurveyRecords() method while querying the details of '+
                         'CMContacts from SF -> ' + e.getMessage());
        }      
        System.debug('Exit CMAccounts <getClientSurveyRecords()>');     
        return csrReturnMap; 
    }
   
     
    public class ClientSurveyResultsWrapper implements Comparable {

    public ClientSurveyResults__c oppy;
    
    // Constructor
    public ClientSurveyResultsWrapper(ClientSurveyResults__c op) {
        system.debug('INside Con..');
        oppy = op;
    }
    
    // Compare opportunities based on the opportunity amount.
    public Integer compareTo(Object compareTo) {
        // Cast argument to OpportunityWrapper
        ClientSurveyResultsWrapper compareToOppy = (ClientSurveyResultsWrapper)compareTo;
        
        // The return value of 0 indicates that both elements are equal.
        Integer returnValue = 0;
        system.debug('Inside Compare '+oppy.Year__c+' > '+compareToOppy.oppy.Year__c +' : '+ Integer.valueOf(oppy.Year__c) +' : ' +Integer.valueOf(compareToOppy.oppy.Year__c));
        if (Integer.valueOf(oppy.Year__c) > Integer.valueOf(compareToOppy.oppy.Year__c)) {
            // Set return value to a positive value.
            returnValue = -1;
        } else if (Integer.valueOf(oppy.Year__c) < Integer.valueOf(compareToOppy.oppy.Year__c)) {
            // Set return value to a negative value.
            returnValue = 1;
        }
        
        return returnValue;       
    }
}
   @AuraEnabled(cacheable=true)
    public static ClientSurveyResult getClientPlanData(String accountId){
       
        ClientSurveyResult clientSurveyResult = new ClientSurveyResult();
          String SALES_SEASON_PREFIX = 'IY ';
    	  String SALES_SEASON_INFIX = ', 1/1/';
        Date todayDate=system.today();
        Map<String,Goal__c> clientPlanReturnMap = new Map<String,Goal__c>();
        Map<String,String> salesSeasonSettingMap = new Map<String,String>();
        List<String> salesSeasonParams =new List<String>();
            salesSeasonParams.add('SalesCycle_Default_Month');
            salesSeasonParams.add('SalesCycle_Default_Year');
        String defaultSalesSeason='';
        
         List<ClientPlan_SalesCycle__mdt> clientPlanSettingList = [Select DeveloperName,Value__c from ClientPlan_SalesCycle__mdt where DeveloperName in: salesSeasonParams];
            
            for(ClientPlan_SalesCycle__mdt eachSalesSeasonSetting : clientPlanSettingList){
                salesSeasonSettingMap.put(eachSalesSeasonSetting.DeveloperName,eachSalesSeasonSetting.Value__c);
            }
        
         if(Integer.valueOf(salesSeasonSettingMap.get('SalesCycle_Default_Year')) <= todayDate.year()+1){
                    if(todayDate.month() <= Integer.valueOf(salesSeasonSettingMap.get('SalesCycle_Default_Month'))){
                        defaultSalesSeason='IY '+string.valueof(todayDate.year()).right(2)+', 1/1/'+string.valueof(todayDate.year()+1);
                   	         }else{
                        defaultSalesSeason='IY '+string.valueof(todayDate.year()+1).right(2)+', 1/1/'+string.valueof(todayDate.year()+2);
                    	  }
                }
        
        List<Goal__c> goalList = [SELECT Id , Name, Sales_Season__c,Goal__c, Goal_Write_In__c ,(Select Id,Name,Strategy__c,Action_Steps_PlannedTaken__c,Strategy_Write_In__c,Applicable_for__c from Strategies__r order by CreatedDate) FROM Goal__c where Company__c= :accountId and Sales_Season__c=:defaultSalesSeason and Goal__c IN ('Protect / Renew Current Book of Business (Mandatory Goal)','Attain / Maintain NPS Promoter Rating (Mandatory Goal)') WITH USER_MODE];
       
        system.debug('defaultSalesSeason=='+defaultSalesSeason);
        
         system.debug('goalList=='+goalList);
        if(goalList.size()>0){
            for(Goal__c eachGoal : goalList){
                if(eachGoal.Goal__c == 'Protect / Renew Current Book of Business (Mandatory Goal)'){
                    system.debug('inside if');
                    system.debug('----'+eachGoal);
                    clientPlanReturnMap.put('Protect_Renew_Current_Goal',eachGoal);
                      }else if(eachGoal.Goal__c == 'Attain / Maintain NPS Promoter Rating (Mandatory Goal)'){
                    system.debug('inside elseif');
                    clientPlanReturnMap.put('Atain_Maintain_Nps_Goal',eachGoal);
                }
            }
        }
        clientSurveyResult.clientPlanReturnMap = clientPlanReturnMap;
        clientSurveyResult.defaultSalesSeason = defaultSalesSeason;
        return clientSurveyResult;
    }
    
    public class ClientSurveyResult{
        
         @AuraEnabled
        public Map<String,Object> clientPlanReturnMap { get;set; }
        
         @AuraEnabled
        public String defaultSalesSeason { get;set; }
        
    }
   
    public class ClientProfileDataWpr{
         
        @AuraEnabled
        public SeniorUHGExecutivesEngaged__c getSeniorExecutiveData { get;set; }
        
         @AuraEnabled
        public Account getCorporationOverviewData { get;set; }
        
        @AuraEnabled
        public List<Service_AMT__c> getCoreUHGTeamData { get;set; }
       
         @AuraEnabled
        public List<AccountContactRelation> getCompanyConsultantData { get;set; }  
        
        @AuraEnabled
        public Map<String,Object> getFinancialData { get;set; }
        
         @AuraEnabled
        public CompetitorResult getCompetitorData { get;set; }
       
         @AuraEnabled
        public Map<String,Object> getClientSurveyResultData { get;set; }
        
         @AuraEnabled
        public String currentDealStartDate { get;set; }
        
         @AuraEnabled
        public String currentDealRenewalDate { get;set; }
        
         @AuraEnabled
        public list<Medical_Trend__c> medList { get;set; }
        
         @AuraEnabled
        public String bghData { get;set; }

        @AuraEnabled
        public String specialtyBenefitInvolved {get;set;}
        
        @AuraEnabled
        public String surestCurrentDealStartDate { get;set; }

        @AuraEnabled
        public String surestNextRenewalDate { get;set; }
        
        @AuraEnabled
        public Map<String,Object> getFinancialDataSurest { get;set; }

        @AuraEnabled
        public list<Medical_Trend__c> medListSurest { get;set; }
        
    }
    

}