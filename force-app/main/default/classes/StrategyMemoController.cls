/** 
* @description      : This controller is to retrieve data for Startegy Memo template
**/
public with sharing class StrategyMemoController {
    
    @AuraEnabled(cacheable=true)
    public static StrategyMemoInfoWrapper getStrategyInformation(String membershipActivityId){
        StrategyMemoInfoWrapper strategyMemoInfoWrapper = new StrategyMemoInfoWrapper();
        strategyMemoInfoWrapper.isRFPUser = false; 
        String profileName = [SELECT Profile.Name FROM User WHERE Id = :UserInfo.getUserId()].Profile.Name;
        if(profileName =='Proposal Gateway - RFP Reviewer'){
           strategyMemoInfoWrapper.isRFPUser = true;
        }

        Opportunity strategyMemoOppQueryResult = null;
        try
        {
            strategyMemoOppQueryResult = [select id,Name,Account.Eligible_for_2nd_Blues_Bid__c,Sales_Stage_Medical__c,Strategy_Call_Date__c, Bid_Strategy__c,RecordType.name,Members_in_the_Proposal_Medical__c,EEsRetireesintheProposalMedical__c,
                                          Proposal_Received_Date_Medical__c, Proposal_Received_Date_Dental__c,Proposal_Received_Date_Vision__c, Proposal_Received_Date_Pharmacy__c,Employees_in_the_Proposal_Medical__c,
                                          Proposal_Received_Date_Other__c,vs_Aetna__c, vs_Anthem__c, vs_Blues__c,vs_Blues_Alt__c, vs_Cigna__c,
                                          Proposal_Due_Date_Medical__c, Proposal_Due_Date_Dental__c ,Proposal_Due_Date_Other__c,Proposal_Due_Date_Pharmacy__c,Proposal_Due_Date_Vision__c,
                                          Surest_SVP_Involved__c, Specialty_Benefits_SVP__c, Financial_Strategy_Lead__c, SCE_Assignment__c, Executive_Sponsor__c, Deal_Sponsor__c, 
                                          Finalist_Date_Medical__c,Anticipated_Actual_Close_Date_Medical__c,EffectiveDate__c, Is_the_Client_in_the_Cannabis_Business__c,
                                          Notes_taken_on_call_with_consultant__c,Aggregator_Involved_in_the_Oppty_Risk__c,Aggregator_Involved_in_the_Oppty_Risk__r.Name, Opportunity_Average_Contract_Size_ACS__c, 
                                          Account.Name,
                                          Account.X2nd_Blues_Bid_Comments__c,
                                          Account.BillingAddress, account.Primary_Situs_State__c, Account.BillingCity,Account.Web_Address__c, Account.Coveted_Account__c, 
                                          Account.Comments__c, Account.BusinessPressures__c, Account.PotentialCompellingEvent__c, 
                                          Account.OurPotentialUniqueBusinessValue__c, Account.KeyRiskstoourUBV__c, Account.OutcomeDrivers__c,Account.Health_Plan_Manager_Industry__c,Account.AnnualRevenue__c,
                                          Account.ApproachStrategy__c,
                                          Account.Surest_Last_Action_Taken__c, Account.Surest_Next_Action_to_be_Taken__c, Account.Network_Contracting_Issue_Other__c, 
                                          Account.Surest_Approach_Strategy__c,Account.CVGAccount__r.Name,
                                          Account.Surest_Network_Constraints__c,
                                          Account.Surest_Comments__c,Account.Private_Equity_Relationship__c, 
                                          Owner_Name__c, PrimaryConsultant__r.MailingCity,PrimaryConsultant__r.Name, 
                                          PrimaryConsultant__r.Phone,PrimaryConsultant__r.MailingAddress,  PrimaryConsultant__r.Email
                                          from Opportunity where id = :membershipActivityId With USER_MODE Limit 1];
            if(strategyMemoOppQueryResult!=null)
            {
                system.debug('strategyMemoOppQueryResult'+strategyMemoOppQueryResult);
                strategyMemoInfoWrapper.stageMedical= strategyMemoOppQueryResult.Sales_Stage_Medical__c != null ? strategyMemoOppQueryResult.Sales_Stage_Medical__c:'';
                strategyMemoInfoWrapper.strategyCallDat  = strategyMemoOppQueryResult.Strategy_Call_Date__c!= null ? formatDate(strategyMemoOppQueryResult.Strategy_Call_Date__c) :'';
                strategyMemoInfoWrapper.accountName  = strategyMemoOppQueryResult.Account.Name!= null ? String.valueOf(strategyMemoOppQueryResult.Account.Name) :'';
                strategyMemoInfoWrapper.bidStrategy  = strategyMemoOppQueryResult.Bid_Strategy__c!= null ? String.valueOf(strategyMemoOppQueryResult.Bid_Strategy__c) :'';
                strategyMemoInfoWrapper.oppName  = strategyMemoOppQueryResult.Name!= null ? String.valueOf(strategyMemoOppQueryResult.Name) :'';
                strategyMemoInfoWrapper.finalistDate  = strategyMemoOppQueryResult.Finalist_Date_Medical__c!= null ? formatDate(strategyMemoOppQueryResult.Finalist_Date_Medical__c) :''; 
                strategyMemoInfoWrapper.proposalDateReceived = getEarliestProposalReceivedDate(strategyMemoOppQueryResult);
                strategyMemoInfoWrapper.proposalDueDate = getEarliestDueDate(strategyMemoOppQueryResult);
                strategyMemoInfoWrapper.oppId = strategyMemoOppQueryResult.Id != null ? String.valueOf(strategyMemoOppQueryResult.Id):''; 
                strategyMemoInfoWrapper.vsAetna = strategyMemoOppQueryResult.vs_Aetna__c != null ? String.valueOf(strategyMemoOppQueryResult.vs_Aetna__c):''; 
                strategyMemoInfoWrapper.vsAnthem = strategyMemoOppQueryResult.vs_Anthem__c != null ? String.valueOf(strategyMemoOppQueryResult.vs_Anthem__c):'';
                strategyMemoInfoWrapper.vsBlues = strategyMemoOppQueryResult.vs_Blues__c != null ? String.valueOf(strategyMemoOppQueryResult.vs_Blues__c):''; 
                strategyMemoInfoWrapper.vsBluesAlt = strategyMemoOppQueryResult.vs_Blues_Alt__c != null ? String.valueOf(strategyMemoOppQueryResult.vs_Blues_Alt__c):''; 
                strategyMemoInfoWrapper.vsCigna = strategyMemoOppQueryResult.vs_Cigna__c != null ? String.valueOf(strategyMemoOppQueryResult.vs_Cigna__c):''; 
                strategyMemoInfoWrapper.averageContractSize = strategyMemoOppQueryResult.Opportunity_Average_Contract_Size_ACS__c != null ? String.valueOf(strategyMemoOppQueryResult.Opportunity_Average_Contract_Size_ACS__c):''; 
                strategyMemoInfoWrapper.aggregatorInvolved = strategyMemoOppQueryResult.Aggregator_Involved_in_the_Oppty_Risk__r.Name != null ? String.valueOf(strategyMemoOppQueryResult.Aggregator_Involved_in_the_Oppty_Risk__r.Name):''; 
                strategyMemoInfoWrapper.surestSvpInvolved = strategyMemoOppQueryResult.Surest_SVP_Involved__c != null ? String.valueOf(strategyMemoOppQueryResult.Surest_SVP_Involved__c):''; 
                strategyMemoInfoWrapper.specialityBenefits = strategyMemoOppQueryResult.Specialty_Benefits_SVP__c != null ? String.valueOf(strategyMemoOppQueryResult.Specialty_Benefits_SVP__c):''; 
                strategyMemoInfoWrapper.enrolledEmployeesProposal  = strategyMemoOppQueryResult.Employees_in_the_Proposal_Medical__c!= null ? String.valueOf(strategyMemoOppQueryResult.Employees_in_the_Proposal_Medical__c) :'';
                if (strategyMemoOppQueryResult != null && strategyMemoOppQueryResult.Account.BillingAddress != null) {
                    Address billingAddress = strategyMemoOppQueryResult.Account.BillingAddress; 
                    if (billingAddress != null) {
                        String strAccountBillingAddress = '';
                        if (billingAddress.street != null) {
                            strAccountBillingAddress += billingAddress.street + ', ';
                        }
                        if (billingAddress.city != null) {
                            strAccountBillingAddress += billingAddress.city + ', ';
                        }
                        if (billingAddress.state != null) {
                            strAccountBillingAddress += billingAddress.state + ' ';
                        }
                        if (billingAddress.postalCode != null) {
                            strAccountBillingAddress += billingAddress.postalCode + ', ';
                        }
                        if (billingAddress.country != null) {
                            strAccountBillingAddress += billingAddress.country;
                        }
                        strAccountBillingAddress = strAccountBillingAddress.trim().replaceAll(',\\s*$', '');                        
                        strategyMemoInfoWrapper.billingAddress = strAccountBillingAddress;
                    }
                }
                system.debug('strategyMemoInfoWrapper.billingCity'+strategyMemoInfoWrapper.billingCity);
                if(strategyMemoOppQueryResult.Account.Web_Address__c != null){
                    String strCompanyWebAddress = strategyMemoOppQueryResult.Account.Web_Address__c;
                    strategyMemoInfoWrapper.webAddress = strCompanyWebAddress;
                }
                strategyMemoInfoWrapper.healthPlan =strategyMemoOppQueryResult.Account.Health_Plan_Manager_Industry__c != null ? String.valueOf(strategyMemoOppQueryResult.Account.Health_Plan_Manager_Industry__c) :'';
                strategyMemoInfoWrapper.annualRevenue =strategyMemoOppQueryResult.Account.AnnualRevenue__c != null ? String.valueOf(strategyMemoOppQueryResult.Account.AnnualRevenue__c) :'';
                strategyMemoInfoWrapper.membersInProposal  = strategyMemoOppQueryResult.Members_in_the_Proposal_Medical__c!= null ? String.valueOf(strategyMemoOppQueryResult.Members_in_the_Proposal_Medical__c) :'';
                strategyMemoInfoWrapper.recordType =strategyMemoOppQueryResult.RecordType.name != null ? String.valueOf(strategyMemoOppQueryResult.RecordType.name) :'';
                strategyMemoInfoWrapper.primarySitusState =strategyMemoOppQueryResult.Account.Primary_Situs_State__c != null ? String.valueOf(strategyMemoOppQueryResult.Account.Primary_Situs_State__c) :'';
                strategyMemoInfoWrapper.billingCity = strategyMemoOppQueryResult.Account.BillingCity != null ? String.valueOf(strategyMemoOppQueryResult.Account.BillingCity) : '';
                strategyMemoInfoWrapper.corporateMailingCity =  strategyMemoOppQueryResult.PrimaryConsultant__r.MailingCity != null? String.valueOf(strategyMemoOppQueryResult.PrimaryConsultant__r.MailingCity): '';
                strategyMemoInfoWrapper.corporateMailingCity =  strategyMemoOppQueryResult.PrimaryConsultant__r.MailingCity != null? String.valueOf(strategyMemoOppQueryResult.PrimaryConsultant__r.MailingCity): '';
                strategyMemoInfoWrapper.consultantName = strategyMemoOppQueryResult.PrimaryConsultant__r.Name != null ?String.valueOf(strategyMemoOppQueryResult.PrimaryConsultant__r.Name) : '';
                strategyMemoInfoWrapper.primaryConsultantPhone = strategyMemoOppQueryResult.PrimaryConsultant__r.Phone != null ?formatPhoneNumber(strategyMemoOppQueryResult.PrimaryConsultant__r.Phone) : '';
                strategyMemoInfoWrapper.primaryConsultantEmail = strategyMemoOppQueryResult.PrimaryConsultant__r.Email != null ?String.valueOf(strategyMemoOppQueryResult.PrimaryConsultant__r.Email) : '';
                strategyMemoInfoWrapper.covetedAccount = strategyMemoOppQueryResult.Account.Coveted_Account__c != null ? String.ValueOf(strategyMemoOppQueryResult.Account.Coveted_Account__c): '';
                strategyMemoInfoWrapper.financialStrategyLead = strategyMemoOppQueryResult.Financial_Strategy_Lead__c != null ? String.ValueOf(strategyMemoOppQueryResult.Financial_Strategy_Lead__c): '';
                strategyMemoInfoWrapper.anticipatedActualCloseDate = strategyMemoOppQueryResult.Anticipated_Actual_Close_Date_Medical__c != null ? formatDate(strategyMemoOppQueryResult.Anticipated_Actual_Close_Date_Medical__c): '';
                strategyMemoInfoWrapper.bluesBidComments = strategyMemoOppQueryResult.Account.X2nd_Blues_Bid_Comments__c != null ? String.ValueOf(strategyMemoOppQueryResult.Account.X2nd_Blues_Bid_Comments__c): '';
                strategyMemoInfoWrapper.isClientCannabisBusiness = strategyMemoOppQueryResult.Is_the_Client_in_the_Cannabis_Business__c != null ? String.ValueOf(strategyMemoOppQueryResult.Is_the_Client_in_the_Cannabis_Business__c): '';
                strategyMemoInfoWrapper.aggregatorInvolved = strategyMemoOppQueryResult.Aggregator_Involved_in_the_Oppty_Risk__r.Name != null ? String.ValueOf(strategyMemoOppQueryResult.Aggregator_Involved_in_the_Oppty_Risk__r.Name ): '';
                strategyMemoInfoWrapper.averageContractSize = strategyMemoOppQueryResult.Opportunity_Average_Contract_Size_ACS__c != null ? String.valueOf(strategyMemoOppQueryResult.Opportunity_Average_Contract_Size_ACS__c):''; 
                strategyMemoInfoWrapper.eligible = strategyMemoOppQueryResult.Account.Eligible_for_2nd_Blues_Bid__c != null ? String.valueOf(strategyMemoOppQueryResult.Account.Eligible_for_2nd_Blues_Bid__c):''; 
                strategyMemoInfoWrapper.cvgAccount = strategyMemoOppQueryResult.Account.CVGAccount__r.Name != null ? String.valueOf(strategyMemoOppQueryResult.Account.CVGAccount__r.Name):''; 
                strategyMemoInfoWrapper.ownerName = strategyMemoOppQueryResult.Owner_Name__c != null ? String.valueOf(strategyMemoOppQueryResult.Owner_Name__c):''; 
                strategyMemoInfoWrapper.effectiveDate = strategyMemoOppQueryResult.EffectiveDate__c != null ? formatDate(strategyMemoOppQueryResult.EffectiveDate__c):''; 
                strategyMemoInfoWrapper.sceAssignment = strategyMemoOppQueryResult.SCE_Assignment__c != null ? strategyMemoOppQueryResult.SCE_Assignment__c:''; 
                strategyMemoInfoWrapper.executiveSponsor = strategyMemoOppQueryResult.Executive_Sponsor__c != null ? strategyMemoOppQueryResult.Executive_Sponsor__c:''; 
                strategyMemoInfoWrapper.dealSponsor = strategyMemoOppQueryResult.Deal_Sponsor__c != null ? strategyMemoOppQueryResult.Deal_Sponsor__c:''; 
                strategyMemoInfoWrapper.privateEquity = strategyMemoOppQueryResult.Account.Private_Equity_Relationship__c != null ? String.valueOf(strategyMemoOppQueryResult.Account.Private_Equity_Relationship__c):''; 
                strategyMemoInfoWrapper.businessOverview = strategyMemoOppQueryResult.Account.Comments__c != null ? strategyMemoOppQueryResult.Account.Comments__c:''; 
                strategyMemoInfoWrapper.businessPressures = strategyMemoOppQueryResult.Account.BusinessPressures__c != null ? strategyMemoOppQueryResult.Account.BusinessPressures__c:''; 
                strategyMemoInfoWrapper.potentialCompelling = strategyMemoOppQueryResult.Account.PotentialCompellingEvent__c != null ? strategyMemoOppQueryResult.Account.PotentialCompellingEvent__c:''; 
                strategyMemoInfoWrapper.uniqueBusinessValues = strategyMemoOppQueryResult.Account.OurPotentialUniqueBusinessValue__c != null ? strategyMemoOppQueryResult.Account.OurPotentialUniqueBusinessValue__c:''; 
                strategyMemoInfoWrapper.keyRisks = strategyMemoOppQueryResult.Account.KeyRiskstoourUBV__c != null ? strategyMemoOppQueryResult.Account.KeyRiskstoourUBV__c:''; 
                strategyMemoInfoWrapper.outcomeDrivers = strategyMemoOppQueryResult.Account.OutcomeDrivers__c != null ? strategyMemoOppQueryResult.Account.OutcomeDrivers__c:''; 
                strategyMemoInfoWrapper.approachStrategy = strategyMemoOppQueryResult.Account.ApproachStrategy__c != null ? strategyMemoOppQueryResult.Account.ApproachStrategy__c:''; 
                strategyMemoInfoWrapper.surestNetworkConstraints = strategyMemoOppQueryResult.Account.Surest_Network_Constraints__c != null ? strategyMemoOppQueryResult.Account.Surest_Network_Constraints__c:''; 
                strategyMemoInfoWrapper.networkContracting = strategyMemoOppQueryResult.Account.Network_Contracting_Issue_Other__c != null ? strategyMemoOppQueryResult.Account.Network_Contracting_Issue_Other__c:''; 
                strategyMemoInfoWrapper.surestComments = strategyMemoOppQueryResult.Account.Surest_Comments__c != null ? strategyMemoOppQueryResult.Account.Surest_Comments__c:''; 
                strategyMemoInfoWrapper.lastAction= strategyMemoOppQueryResult.Account.Surest_Last_Action_Taken__c != null ? strategyMemoOppQueryResult.Account.Surest_Last_Action_Taken__c:'';
                strategyMemoInfoWrapper.nextAction= strategyMemoOppQueryResult.Account.Surest_Next_Action_to_be_Taken__c != null ? strategyMemoOppQueryResult.Account.Surest_Next_Action_to_be_Taken__c:'';
                strategyMemoInfoWrapper.surestApproachStrategy= strategyMemoOppQueryResult.Account.Surest_Approach_Strategy__c != null ? strategyMemoOppQueryResult.Account.Surest_Approach_Strategy__c:'';
                strategyMemoInfoWrapper.eligibleEesAndRetirees  = strategyMemoOppQueryResult.EEsRetireesintheProposalMedical__c!= null ? String.valueOf(strategyMemoOppQueryResult.EEsRetireesintheProposalMedical__c) :'';
                strategyMemoInfoWrapper.notesTaken= strategyMemoOppQueryResult.Notes_taken_on_call_with_consultant__c != null ? strategyMemoOppQueryResult.Notes_taken_on_call_with_consultant__c:'';
                if(strategyMemoOppQueryResult.PrimaryConsultant__r.MailingAddress!=null){
                    Address corporateMailingAddress = strategyMemoOppQueryResult.PrimaryConsultant__r.MailingAddress;
                    if(corporateMailingAddress!=null){
                        String strCorporateMailingAddress ='';
                        if(corporateMailingAddress.street!=null){
                            strCorporateMailingAddress += corporateMailingAddress.street + ',';
                        }
                        if(corporateMailingAddress.city != null){
                            strCorporateMailingAddress += corporateMailingAddress.city + ',';
                        }
                        if(corporateMailingAddress.state != null){
                            strCorporateMailingAddress += corporateMailingAddress.state + ',';  
                        }
                        if(corporateMailingAddress.postalCode != null){
                            strCorporateMailingAddress += corporateMailingAddress.postalCode + ',';     
                        }
                        if(corporateMailingAddress.country != null){
                            strCorporateMailingAddress += corporateMailingAddress.country + ','; 
                        }
                        strCorporateMailingAddress = strCorporateMailingAddress.trim().replaceAll(',\\s*$', '');
                        strategyMemoInfoWrapper.corporateMailingAddress = strCorporateMailingAddress;   
                    } 
                }
            } 
            String objectName  = '';
            StaticResource sr;
            if(strategyMemoInfoWrapper.recordType == 'CD Membership Activity (Prospect or Aggregator)'){
                sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'StrategicMemo'];
            }
            else if(strategyMemoInfoWrapper.recordType == 'CM Membership Activity (Existing Client)'){
                sr = [SELECT Id, Body, BodyLength, Name FROM StaticResource where Name = 'StrategyMemoCM'];
            }
            String xmlBodyString = sr.body.toString();
            Map<String,String> OBJECT_FILTER_RECORDS = IConstantsTemplate.OBJECT_FILTER_RECORDS;
            Pattern p = Pattern.compile(IConstantsTemplate.TEMPLATE_PREFIX_SUFFIX_REG_EXPRESSION);
            Matcher m = p.matcher(xmlBodyString);
            Map<String,Set<String>> objectItagesMap = new Map<String,Set<String>>();
            
            while (m.find()) {
                String itag = m.group(); 
                itag = itag.replaceAll(IConstantsTemplate.ITAG_PREFIX,
                                       IConstantsTemplate.EMPTY_STRING);
                
                itag = itag.replaceAll(IConstantsTemplate.ITAG_SUFFIX,
                                       IConstantsTemplate.EMPTY_STRING);
                Integer dotFirstIndex = itag.indexOf('.');
                objectName = itag.substring(0,dotFirstIndex);
                String fieldName = itag.substring(dotFirstIndex+1);
                
                if(objectItagesMap.containsKey(objectName)){
                    Set<String> itagSet =  objectItagesMap.get(objectName);                    
                    itagSet.add(fieldName);
                    objectItagesMap.put(objectName, itagSet);
                    
                }else{
                    Set<String> itagSet = new Set<String>();
                    itagSet.add(fieldName);      
                    
                    objectItagesMap.put(objectName, itagSet);
                }                         
                
            }
            strategyMemoInfoWrapper.xmlString = xmlBodyString;
            
            strategyMemoInfoWrapper.objectItags = objectItagesMap;
        } 
        catch(Exception e){
            System.debug('Exception message - '+e);
            System.debug('Exception message - '+e.getLinenumber());
            throw new AuraHandledException('Exception Occured----'+e.getMessage());
        }
        return strategyMemoInfoWrapper;
    }
    @AuraEnabled(cacheable=true)
    public static String getEarliestProposalReceivedDate(Opportunity opp) {
        if (opp.Proposal_Received_Date_Medical__c != null) {
            return formatDate(opp.Proposal_Received_Date_Medical__c);
        }
        List<Date> otherReceivedDates = new List<Date>();
        
        if (opp.Proposal_Received_Date_Dental__c != null) {
            otherReceivedDates.add(opp.Proposal_Received_Date_Dental__c);
        }
        if (opp.Proposal_Received_Date_Vision__c != null) {
            otherReceivedDates.add(opp.Proposal_Received_Date_Vision__c);
        }
        if (opp.Proposal_Received_Date_Other__c != null) {
            otherReceivedDates.add(opp.Proposal_Received_Date_Other__c);
        }
        if (opp.Proposal_Received_Date_Pharmacy__c!= null) {
            otherReceivedDates.add(opp.Proposal_Received_Date_Pharmacy__c);
        }
        
        if (!otherReceivedDates.isEmpty()) {
            Date earliestProposalDate = otherReceivedDates[0];
            for (Date proposalDate : otherReceivedDates) {
                if (proposalDate < earliestProposalDate) {
                    earliestProposalDate = proposalDate;
                }
            }
            return formatDate(earliestProposalDate);
        } else {
            return null;
        }
        
    }
    @AuraEnabled(cacheable=true)
    public static String getEarliestDueDate(Opportunity opp) {
        if (opp.Proposal_Due_Date_Medical__c != null) {
            return formatDate(opp.Proposal_Due_Date_Medical__c);
        }
        
        List<Date> otherReceivedDates = new List<Date>();
        if (opp.Proposal_Due_Date_Dental__c != null) {
            otherReceivedDates.add(opp.Proposal_Due_Date_Dental__c);
        }
        if (opp.Proposal_Due_Date_Other__c != null) {
            otherReceivedDates.add(opp.Proposal_Due_Date_Other__c);
        }
        if (opp.Proposal_Due_Date_Vision__c != null) {
            otherReceivedDates.add(opp.Proposal_Due_Date_Vision__c);
        }
        if (opp.Proposal_Due_Date_Pharmacy__c != null) {
            otherReceivedDates.add(opp.Proposal_Due_Date_Pharmacy__c);
        }
        
        if (!otherReceivedDates.isEmpty()) {
            Date earliestProposalDate = otherReceivedDates[0];
            for (Date proposalDate : otherReceivedDates) {
                if (proposalDate < earliestProposalDate) {
                    earliestProposalDate = proposalDate;
                }
            }
            return formatDate(earliestProposalDate);
        } else {
            return null;
        }
        
    }
    public static String formatDate(Date inputDate) {
        return inputDate.month() + '/' + inputDate.day() + '/' + inputDate.year();
    }
    public static String formatPhoneNumber(String phone) {
        if (phone == null || phone.length() != 10) {
            return phone; 
        }
        return '(' + phone.substring(0, 3) + ') ' + phone.substring(3, 6) + '-' + phone.substring(6);
    }
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getRelatedOpportunities(String membershipActivityId) {
        
        Opportunity opp = [SELECT AccountId FROM Opportunity WHERE Id = :membershipActivityId WITH USER_MODE LIMIT 1  ];
        List<Opportunity> relatedOpportunities = new List<Opportunity>();
        try{
            relatedOpportunities = [SELECT Id, Name,Membership_Activity_Type__c, EffectiveDate__c, Status__c, Product_Type_Involved_in_Opp__c 
                                    FROM Opportunity 
                                    WHERE AccountId = :opp.AccountId WITH USER_MODE ORDER BY EffectiveDate__c Desc];
        }
        catch (Exception e) {
            System.debug('Error fetching  Products: ' + e.getMessage());
        }
        return relatedOpportunities;        
    }
    @AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> getProductsInfo(String membershipActivityId)
    {
        List<OpportunityLineItem> allProducts = new List<OpportunityLineItem>();
        try{
            allProducts = [SELECT Id,Product_Line__c ,Product2.Name,Mbrs_Transferred_From_To_Another_Segment__c,Members_Quoted_in_the_Proposal__c , Existing_Members_Involved_in_the_Bid__c, 
                           Estimated_Additional_New_Members__c,Annual_Revenue_Premium__c, Estimated_Members_Existing_New__c,Disposition_Other_Buy_Up_Programs__c,
                           Product_Conversion__c, Existing_Membership_at_Risk__c, Sold_Retained_Members__c,
                           Net_Results__c, Funding_Type__c,Buyup_Product_Selection__c FROM OpportunityLineItem where opportunityId = :membershipActivityId AND Product_Line__c != null WITH USER_MODE ];
        }
        catch (Exception e) {
            System.debug('Error fetching Medical Products: ' + e.getMessage());
        }
        return allProducts;
    }
    @AuraEnabled (cacheable = true)
    public static List<MA_Competitor__c> getCompetitorsInAll(String membershipActivityId){
        List<MA_Competitor__c> competitorsInAll = new List<MA_Competitor__c>();
        try{
            competitorsInAll = [SELECT of_Members_Awarded__c, Competitor_Classification__c, Terms__c, MA_Opp_Id__c, Competitor_Group__c, Opportunity__c,
                                Id, Name, of_Members_Held__c, Number_of_Members_Awarded__c,Comments__c,
                                Number_of_Members_Held__c, Competitor_Account__r.Name FROM MA_Competitor__c 
                                where (Opportunity__c =: membershipActivityId AND Competitor_Classification__c != null) AND Competitor_Account__r.Name != 'Optum Rx' WITH USER_MODE ORDER BY CreatedDate Asc];
        }
        catch(Exception e){
            System.debug('Exception' +e.getMessage());
        }
        return competitorsInAll;
    }
    @AuraEnabled (cacheable = true)
    public static List<OpportunityContactRole> getSecondaryConsultants(String membershipActivityId){
        List<OpportunityContactRole> secondaryConsultants = new List<OpportunityContactRole>();
        try{
            secondaryConsultants = [SELECT Id, OpportunityId, Opportunity.Name, ContactId, Contact.FirstName,
                                    Contact.LastName, Contact.Account.Name, Contact.MailingCity,
                                    IsPrimary FROM OpportunityContactRole
                                    WHERE OpportunityId =:membershipActivityId ANd IsPrimary =false   ORDER BY Contact.LastName asc];
        }
        catch(Exception e){
            System.debug('Exception' +e.getMessage());
        }
        return secondaryConsultants;
        
    }
    
    @AuraEnabled(cacheable=true)
    public static Strategy_Memo__c getStrategyMemo(String membershipActivityId) {
        system.debug('recordID'+membershipActivityId);
        try{
            Strategy_Memo__c memo = [SELECT Id,Name,Strategy_Call_Date__c, Strategy_Call_Time__c,Record_Type__c,Proposal_Date_Received__c, Proposal_Date_Due__c,  
                                     Membership_Activity__c, Company_Name_as_per_RFP__c, People__c, Spotlight_RFP__c, Reference_Attributes__c,Account_Name__c, 
                                     File_Passwords_If_so_please_provide__c, Headquarters_City__c, Primary_Situs_State__c,Client_Manager_Traditional__c,Client_Manager_Surest__c,   
                                     Contact_Names__c, Address__c, Website_URL__c, Consultant_Firm_Loc__c,  Salesforce_Opportunity_ID__c,
                                     RFP_Primary_Consultant_s__c, Consultant_Address__c, Phone_Number__c, Consultant_Email__c,  
                                     Sales_Vice_President_CD__c, Coveted_Account_SVP__c, Surest_SVP__c, Specialty_SVP__c,  
                                     Financial_Strategy_Lead__c, OPTUM_Financial_Sales__c, SCE_Assignment_Surest__c,SCE_Assignment_Traditional__c,  
                                     Client_Dev_Director__c, Strategic_Coordinator_CD__c, NPS_Business_Dev_Mgr_BDM__c,  
                                     Proposal_Writers_Med__c, Proposal_Writers_Clin__c, Proposal_Writers_Spec__c,  
                                     Proposal_Writers_Rx__c, NPS_Quality_Reviewer_SQC__c, Network_Analysis_Consultant__c,  
                                     NA_Network_Solutions__c, Actuarial_Support__c, Underwriter_Medical__c,  
                                     Underwriter_Specialty__c, Underwriter_Optum_Health__c, Underwriter_Optum_Rx__c,  
                                     IT_Data_Security__c, Optum_CTO_BDC__c, Optum_Surest_SME__c, Wellness_Lead__c,  
                                     Behavioural_Solutions_Lead__c, X2nd_MD_Sales_Contact__c, Optum_Rx_Sales__c,  
                                     Optum_Financial_Services__c, Implementation_Manager_Traditional__c,  
                                     Implementation_Manager_Surest__c, Executive_Sponsor__c, Deal_Sponsor__c, Other_Sponsor__c,  
                                     Intent_to_Bid_Due__c, Bidder_s_Conference_Call_Date__c, Questions_to_Consultant_Due__c,  
                                     Q_A_Responses_Due_Back__c, NAC_Deliverables_Due_to_CD_Dir__c,  
                                     All_Optum_Pricing_Due_to_NPS_and_Sales__c, Executive_Summary_Cover_Letter_Due__c,  
                                     E_Ship_Date__c, Internal_E_Ship_Recipients__c, External_E_Ship_Recipients__c,  
                                     Submission_Instructions__c, Finalist_Date__c, Anticipated_Actual_Close_Date__c,  
                                     Implementation_Kick_Off_Date__c, Effective_Date__c, RFP_Release_NDA__c,  
                                     Repricing_NDA_for_Line_by_Line__c, Other_NDA__c, Is_the_Client_in_the_Cannabis_Business__c,  
                                     DIVERSITY_EQUITY_and_INCLUSION_DEI__c, MWBE_Requirements__c,  
                                     Eligible_for_second_Blues_bid__c,
                                     Bidding_Blue_Plans__c, 
                                     Company_Overview__c,  
                                     Business_Strategy__c, Census_Data__c, PHI_PII_Removed__c, Eligibility_Criteria__c,  
                                     Enrollment_History__c, Current_Contract_ASA__c, Large_Claims_Data__c,  
                                     Current_Plan_Design_s__c, Proposed_Plan_Design_s__c, RFP_Current_Rates_Fees__c,  
                                     RFP_Renewal_Rates_Fees__c, Repricing_File__c, Repricing_File_Data_Included__c,  
                                     Repricing_File_Data_to_Follow__c, Disruption_File__c, Disruption_File_Data_Included__c,  
                                     Disruption_File_Data_to_Follow__c, Questionnaire__c, References__c,  
                                     Client_Specific_Bid_Forms__c, Contract_Legal_Review_Red_lined_review__c,  
                                     Actuarial_DRGs_ETGs_Claim_Repricing__c, Plan_Design_Compatibility_Review__c,  
                                     Total_Cost_of_Care_Analysis__c, Customer_Service_Model__c, HAI_Analysis_If_data_available__c,  
                                     Implementation_Timeline__c, Response_Current_Plan_Design_s__c, Required_Response_Other__c,  
                                     AMT_Names_Requested__c, Call_Site__c, Claim__c, Clinical__c, Advocacy__c, PHS_Tier__c,  
                                     C3_SNI__c, NETWORK_ANALYSIS_File_Passwords_Here__c,Network_Analysis_Requirements__c, COMP_QD__c, GeoAccess_Reports__c,  
                                     GEO_TEMPLATES__c, GEOs_for_Specific_Products__c, Provider_Counts__c,Disruption_Analysis_text__c,Provider_Count__c, Disruption_Analysis__c,  
                                     Nexus_ACO__c, Freestanding_Facility_Report__c, Network_Market_Placemats_Needed__c,  
                                     Other_Network_Resources__c, Network_360_Reports__c, Generational_Analysis__c,  
                                     Service_Area_Report__c, ASO__c, EPO__c, FI_HMOs__c, POS__c, PPO__c, CDHP__c,  
                                     Currently_in_an_ACO__c, Business_Overview__c, Business_Pressures__c,  
                                     Potential_Compelling_Event__c, Unique_Business_Value__c, Key_Risks_to_our_UBV__c,  
                                     Outcome_Drivers__c, Approach_Strategy__c, 
                                     Surest_Last_Action_Taken__c, Surest_Next_Action_to_be_Taken__c,Network_Contracting_Issue_Other__c,  
                                      Surest_Approach_strategy__c, Surest_Netwok__c,  
                                     Surest_Comments__c, Special_Notes_RFP__c,  
                                     Discussion_Points__c, Notes_Taken_on_call_with_Consultant__c, 
                                     Quoting_CVG__c, Aggregator_involved_in_the_opportunity__c, CVG_Association__c,  
                                     Private_Equity_Relationship__c, Acs__c, EEs_Retirees_in_the_Proposal_Medical__c,  
                                     Employees_in_the_Proposal_Medical__c, Members_in_the_Proposal_Medical__c, Vs_Aetna__c,  
                                     Vs_Anthem__c, Vs_Cigna__c, Vs_Blues__c, Vs_Blues_Alt__c, New_Business_Rate_Report_from_Actuarial__c,  
                                     Claim_Fiduciary__c, Banking_Arrangement__c, Contribution_Strategy__c, Years_Fees_to_Quote__c,  
                                     Current_Rates_Fees__c, Renewal_Rates_Fees__c, Pricing_by_Enrollment_Tiers__c,  
                                     Nonstandard_Performance_Guarantee__c, Network_Discount_Guarantees__c, Strategic_Question_No__c, 
                                     Nexus_ACO_Plan_Savings_PPT__c, Network_Development_Guarantee__c, Claim_Trend_Guarantee__c,  
                                     Trend_Guarantee__c, Other_Guarantees__c, Platform_Stability__c, Optum_CLINICAL_PGs__c,  
                                     Clinical_Integration__c, Pre_Implementation_Audit__c, Transition_Credit__c,  
                                     Communication_Credit__c, Wellness_Credit__c, Specialty_Package_Credit__c,  
                                     Passport_HP_Pricing_Needed__c, Pre_member_Web_Site__c, Onshoring_Domestic_Level__c,  
                                     Onsite_Resource__c, Texting_an_E_mail_campaigns__c, Vendor_Integration_Needs__c,  
                                     Additional_Levers_AI_1__c, Additional_Levers_AI_2__c, Additional_Levers_AI_3__c,  
                                     Additional_Levers_AI_4__c, Additional_Levers_AI_5__c, Additional_Levers_AI_6__c, Notes_Taken_During_Call__c, 
                                     Special_EMT_Requested__c, SPDs_Submitted_for_compatibility_Review__c,  SPDs_Availability_and_Compatibility_Docs__c,
                                     What_EMTs_will_be_Submitted__c, Any_Non_Standard_PGs__c, Non_Standard_Requests_and_EMT_Needs__c,  
                                     Vendor_Integration_File_Feeds__c, Confirm_Dates_for_Finalist_Kick_Off__c,Approach__c,Health_Plan_Manager_Industry__c,Annual_Revenue__c,Bid_Strategy__c  
                                     FROM Strategy_Memo__c 
                                     WHERE Membership_Activity__c =: membershipActivityId With USER_MODE LIMIT 1 ];
                        System.debug('memo'+memo);

            return memo;
        }
        catch (Exception e) {
            throw new AuraHandledException('Error retrieving Strategy Memo: ' + e.getMessage());
        }        
    }
    
    @AuraEnabled(cacheable=true)
    public static List<String> getAMTOptions() {
        Schema.DescribeFieldResult fieldResult = Strategy_Memo__c.AMT_Names_Requested__c.getDescribe();
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
        
        List<String> options = new List<String>();
        for (Schema.PicklistEntry entry : picklistValues) {
            options.add(entry.getLabel()); 
        }
        return options;
    }
    @AuraEnabled
    public static void saveStrategyMemo(Strategy_Memo__c memoData,Id maRecordId,String selectedValues ){
        system.debug('selectedValues'+selectedValues);
        Id userId = UserInfo.getUserId();
        Datetime currentDateTime = Datetime.now();

        List<Strategy_Memo__c> existingMemo = [SELECT Id ,Membership_Activity__c 
                                               FROM Strategy_Memo__c 
                                               WHERE Membership_Activity__c = :maRecordId WITH USER_MODE
                                               LIMIT 1];
		        
      
        if (!existingMemo.isEmpty()) {
            memoData.Id = existingMemo[0].Id;
            update as user memoData; 
        } else {
            String maName = [SELECT Name FROM opportunity WHERE Id = :maRecordId  WITH USER_MODE LIMIT 1].Name;
            memoData.Membership_Activity__c = maRecordId;
            insert as user memoData;
        }
    }
    
    public class StrategyMemoInfoWrapper {
        @AuraEnabled   public String oppId { get; set; }   
        @AuraEnabled   public String strategyCallDat { get; set; } 
        @AuraEnabled   public String bidStrategy { get; set; } 
        @AuraEnabled   public String eligibleEesAndRetirees { get; set; } 
        @AuraEnabled   public String enrolledEmployeesProposal { get; set; } 
        @AuraEnabled   public String  membersInProposal  { get; set; } 
        @AuraEnabled   public String proposalDateReceived { get; set; }
        @AuraEnabled   public String proposalDueDate { get; set; }
        @AuraEnabled   public String finalistDate { get; set; }
        @AuraEnabled   public String aggregatorInvolved { get; set; }
        @AuraEnabled   public String averageContractSize { get; set; }
        @AuraEnabled   public String surestSvpInvolved { get; set; }
        @AuraEnabled   public String specialityBenefits { get; set; }
        @AuraEnabled public String billingAddress {get; set; }
        @AuraEnabled public String primarySitusState {get ; set;}
        @AuraEnabled  public String billingCity { get; set; }
        @AuraEnabled  public String webAddress { get; set; }
        @AuraEnabled  public String corporateMailingCity { get; set; }
        @AuraEnabled  public String  corporateMailingAddress { get; set; }
        @AuraEnabled  public String primaryConsultantPhone{ get; set; }
        @AuraEnabled  public String primaryConsultantEmail{ get; set; }
        @AuraEnabled  public String consultantName{ get; set; }
        @AuraEnabled  public String covetedAccount   { get; set; }
        @AuraEnabled  public String financialStrategyLead   { get; set; }
        @AuraEnabled public String  anticipatedActualCloseDate {get; set;}
        @AuraEnabled public String  isClientCannabisBusiness {get; set;} 
        @AuraEnabled public String  cvgAccount {get; set;} 
        @AuraEnabled public String  ownerName  {get; set;}
        @AuraEnabled public String  effectiveDate {get; set;}
        @AuraEnabled public String  sceAssignment {get; set;}
        @AuraEnabled public String executiveSponsor {get; set;}
        @AuraEnabled public String dealSponsor {get; set;}
        @AuraEnabled public String privateEquity {get; set;}
        @AuraEnabled public String businessOverview {get; set;}
        @AuraEnabled public String businessPressures {get; set;}
        @AuraEnabled public String potentialCompelling {get; set;}
        @AuraEnabled public String uniqueBusinessValues {get; set;}
        @AuraEnabled public String keyRisks {get; set;}
        @AuraEnabled public String outcomeDrivers {get; set;}
        @AuraEnabled public String approachStrategy {get; set;}
        @AuraEnabled public String surestNetworkConstraints {get; set;}
        @AuraEnabled public String networkContracting {get; set;}
        @AuraEnabled public String surestComments {get; set;}
        @AuraEnabled public String lastAction {get; set;}
        @AuraEnabled public String nextAction {get; set;}
        @AuraEnabled public String surestApproachStrategy {get; set;}
        @AuraEnabled public String notesTaken {get; set;}
        @AuraEnabled public String accountName {get; set;}
        @AuraEnabled public String vsAetna {get ;set;}
        @AuraEnabled public String vsAnthem {get ;set;}
        @AuraEnabled public String vsBlues {get ;set;}
        @AuraEnabled public String vsBluesAlt {get ;set;}
        @AuraEnabled public String vsCigna {get ;set;}
        @AuraEnabled public String eligible {get;set;}
        @AuraEnabled public String recordType {get;set;}
        @AuraEnabled public String oppName{get; set;}
        @AuraEnabled public String stageMedical{get;set;}
        @AuraEnabled public String healthPlan{get;set;}
        @AuraEnabled public String annualRevenue{get;set;}
        @AuraEnabled public Boolean isRFPUser{get;set;}
        @AuraEnabled 
        public String bluesBidComments {get; set;}
        @AuraEnabled
        public String xmlString { get;set; }
        @AuraEnabled
        public  Map<String,Set<String>> objectItags{ get;set; }
    }
}