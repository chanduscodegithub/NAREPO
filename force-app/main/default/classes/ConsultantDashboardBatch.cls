/*****************************************************
* Name : ConsultantDashboardBatch
* Developer: Gurjot Singh
* Email: gurjot.singh@crmit.com
* Purpose: 
* Test Class: 
* Date: 
* Last Modified Date:
*******************************************************/
public class ConsultantDashboardBatch implements Database.Batchable<sObject>, Database.Stateful{
    
    // This method retrieves the list of Contacts to process
    public Database.QueryLocator start(Database.BatchableContext context) {
        return Database.getQueryLocator([
            SELECT Id 
            FROM Contact 
            WHERE RecordType.DeveloperName = 'Consultant_Contact'
        ]);
    }
    
    // This method processes each batch of contacts
    public void execute(Database.BatchableContext context, List<Contact> conRecordsToProcess) {
        
        Map<Id, Contact> contactsToUpdateMap = new Map<Id, Contact>();
        try{
            if(conRecordsToProcess!=null && !conRecordsToProcess.isEmpty()){
                // Collect contact IDs from the batch
                Map<Id,Contact> conUpdateMap = new Map<Id,Contact>();
                Set<Id> contactIds           = new Set<Id>();
                
                for (Contact con : conRecordsToProcess) {
                    contactIds.add(con.Id);
                    conUpdateMap.put(con.Id, con); 
                }
                
                // Query AccountContactRelation records for the contacts where IsDirect is false and Account.Category__c = 'Client Management'
                List<AccountContactRelation> acrList = [
                    SELECT ContactId, AccountId ,Account.Test_Type__c
                    FROM AccountContactRelation 
                    WHERE ContactId IN :contactIds AND IsDirect = false
                ];
                
                // Query OpportunityContactRole records for the contacts where Opportunity.Product_Type_Involved_in_Opp__c includes ('Medical')
                List<OpportunityContactRole> ocrList = [
                    Select Id, Opportunity.Sales_Stage_Medical__c, OpportunityId, ContactId, Opportunity.EffectiveDate__c,
                    Opportunity.Disposition_Medical__c, Opportunity.Existing_Members_Risk_Outcome_Medical__c,
                    Opportunity.recordtype.DeveloperName, IsPrimary FROM 
                    OpportunityContactRole  WHERE ContactId IN :contactIds  
                    AND Opportunity.Product_Type_Involved_in_Opp__c includes ('Medical')
                ];
                
                // Get the current date
                Date todayDate = Date.today();
                
                // Calculate the start date (1st Feb 2 years ago)
                Date startDate = Date.newInstance(todayDate.year() - 2, 2, 1); // 1st Feb of 2 years ago
                
                // Calculate the end date (1st Jan of current year + 1 year)
                Date endDate   = Date.newInstance(todayDate.year() + 1, 1, 1);  // 1st Jan next year
                
                // Get most recent year from the ClientSurveyResults__c object
                Integer maxYearNew;
                List<ClientSurveyResults__c> maxYearSurveyRec = [SELECT Id,Year__c FROM ClientSurveyResults__c where 
                                                                 Year__c != NULL ORDER BY Year__c DESC LIMIT 1];
                
                if(maxYearSurveyRec.size() > 0 ){
                    maxYearNew = Integer.valueOf(maxYearSurveyRec[0].Year__c);
                }
                
                Map<Id, Integer> totalSoldRetainedLostRetainedMACountMap = new Map<Id, Integer>();
                Map<Id, Integer> soldRetainedMACountMap                  = new Map<Id, Integer>();
                Map<Id, Integer> lostCancelMACountMap                    = new Map<Id, Integer>();     
                Map<Id, Integer> emergeningRiskClientCountMap            = new Map<Id, Integer>();
                Map<Id, Integer> memberActivityCountMap                  = new Map<Id, Integer>();
                Map<Id, Integer> nbeaLostCancelCountMap                  = new Map<Id, Integer>();
                
                List<String> DispositionMed = new List<String>{'Sold', 'Lost: Finalist', 'Lost: Non-Finalist', 'Closed Emerging Risk'};
                Set<Id> maIds = new Set<Id>();
                Set<Id> maIdsEmerginRisk = new Set<Id>();
                // Iterate on OpportunityContactRole
                for(OpportunityContactRole ocr : ocrList){
                    if(ocr.Opportunity.Sales_Stage_Medical__c == 'Emerging Risk\\No Upside'){
                        if (!emergeningRiskClientCountMap.containsKey(ocr.ContactId)) {
                            emergeningRiskClientCountMap.put(ocr.ContactId, 0);                
                        }
                        emergeningRiskClientCountMap.put(ocr.ContactId, emergeningRiskClientCountMap.get(ocr.ContactId) + 1);
                    }
                    if(!maIds.contains(ocr.OpportunityId)){
                        Id contactId = ocr.ContactId;
                        
                        // Add Count of Emergening risk Client to emergeningRiskClientCountMap Map if 
                        // Sales_Stage_Medical__c == 'Emerging Risk\\No Upside' for each contact
                        
                        
                        //Add Count of Member Activity records to memberActivityCountMap Map for each contact
                        /*if (!memberActivityCountMap.containsKey(ocr.ContactId)) {
                            memberActivityCountMap.put(ocr.ContactId, 0);                
                        }
                        memberActivityCountMap.put(ocr.ContactId, memberActivityCountMap.get(ocr.ContactId) + 1);*/
                        
                        // First, check if the Opportunity's Effective Date is within the last 2 years
                        if(ocr.Opportunity.EffectiveDate__c >= startDate && ocr.Opportunity.EffectiveDate__c <= endDate
                           && DispositionMed.contains(ocr.Opportunity.Disposition_Medical__c) && ocr.IsPrimary){
                               maIds.add(ocr.OpportunityId);
                            // Add Count of total Medical MA records for each contact
                            if (!totalSoldRetainedLostRetainedMACountMap.containsKey(contactId)) {
                                totalSoldRetainedLostRetainedMACountMap.put(contactId, 0);
                            }
                            totalSoldRetainedLostRetainedMACountMap.put(contactId, totalSoldRetainedLostRetainedMACountMap.get(contactId) + 1);
                            
                            // Add Count of Sold Retained MA records to soldRetainedMACountMap Map for each contact
                            if(((ocr.Opportunity.Disposition_Medical__c == 'Sold') && ((ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == null) 
                                                                                       || (ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == 'Retained')))
                               || ((ocr.Opportunity.Disposition_Medical__c == 'Closed Emerging Risk') && (ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == 'Retained'))){
                                   if (!soldRetainedMACountMap.containsKey(contactId)) {
                                       soldRetainedMACountMap.put(contactId, 0);
                                   }
                                   soldRetainedMACountMap.put(contactId, soldRetainedMACountMap.get(contactId) + 1);
                               }
                            
                            // Add Count of Lost Cancel MA records to lostCancelMACountMap Map for each contact
                            if(((ocr.Opportunity.Disposition_Medical__c == 'Lost: Finalist') || (ocr.Opportunity.Disposition_Medical__c == 'Lost: Non-Finalist'))
                               || ((ocr.Opportunity.Disposition_Medical__c == 'Sold') && (ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == 'Partial Cancellation'))
                               || ((ocr.Opportunity.Disposition_Medical__c == 'Closed Emerging Risk') && ((ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == 'Partial Cancellation') 
                                                                                                          || (ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == 'Full Cancellation'))))
                            {
                                if (!lostCancelMACountMap.containsKey(contactId)) {
                                    lostCancelMACountMap.put(contactId, 0);
                                }
                                lostCancelMACountMap.put(contactId, lostCancelMACountMap.get(contactId) + 1);
                                
                                // Add Count of Lost Cancel MA records to nbeaLostCancelCountMap Map for each contact
                                // where Opportunity Record Type is CM 
                                if (!nbeaLostCancelCountMap.containsKey(ocr.ContactId)) {
                                    if(ocr.Opportunity.recordtype.DeveloperName == 'CM') {
                                        nbeaLostCancelCountMap.put(ocr.ContactId, 0);
                                    }
                                }
                                if(ocr.Opportunity.recordtype.DeveloperName == 'CM') {
                                    nbeaLostCancelCountMap.put(ocr.ContactId, nbeaLostCancelCountMap.get(ocr.ContactId) + 1);
                                }
                            }
                        }
                        //maIds.add(ocr.OpportunityId);
                    }
                }
                
                Map<Id, Integer> existingClientTypeCountMap = new Map<Id, Integer>();
                Map<Id, Set<Id>> contactToAccountMap        = new Map<Id, Set<Id>>();
                Set<Id> accountIds                          = new Set<Id>();
                
                // Loop through AccountContactRelation records to count and gather AccountIds
                for (AccountContactRelation acr : acrList) {
                    
                    // Add values to contactToAccountMap Map and existingClientTypeCountMap where Test_Type__c == 'Existing Client'
                    if (!contactToAccountMap.containsKey(acr.ContactId)) {
                        contactToAccountMap.put(acr.ContactId, new Set<Id>());
                    }
                    contactToAccountMap.get(acr.ContactId).add(acr.AccountId);
                    
                    /*if(acr.Account.Test_Type__c == 'Existing Client') {
                        if(!existingClientTypeCountMap.containsKey(acr.ContactId)){
                            existingClientTypeCountMap.put(acr.ContactId, 0);
                        }
                        existingClientTypeCountMap.put(acr.ContactId, existingClientTypeCountMap.get(acr.ContactId) + 1);
                    }*/
                    
                    accountIds.add(acr.AccountId);  // Collecting all related AccountIds
                    
                }     
                
                Map<Id, List<Integer>> accountYearMap     = new Map<Id, List<Integer>>();
                Map<Id, Integer> promotersAccountYearMap  = new Map<Id, Integer>();
                Map<Id, Integer> detractorsAccountYearMap = new Map<Id, Integer>();
                Integer maxYear                           = null;
                
                // Query Account records where Test_Type__c = 'Existing Client' with an inner query for ClientSurveyResults__r
                if(accountIds.size() > 0){
                    List<Account> accountList = [
                        SELECT Id, Name, (SELECT Account__c, LikelihoodtoRecommendScore__c, Year__c 
                                          FROM Client_Survey_Results__r 
                                          WHERE Year__c != null AND Type__c = 'Client Survey Results'
                                          ORDER BY Year__c DESC) 
                        FROM Account 
                        WHERE Id IN :accountIds AND Test_Type__c = 'Existing Client'
                    ];
                    
                    // Query ClientSurveyResults__c records for accounts, ordered by Year__c DESC
                    List<AggregateResult> aggregateResults = [
                        SELECT Account__c, Year__c, COUNT(Id) recordCount
                        FROM ClientSurveyResults__c
                        WHERE Account__c IN :accountIds AND Year__c != null AND Type__c = 'Client Survey Results'
                        GROUP BY Account__c, Year__c
                        ORDER BY Year__c DESC
                    ];
                    
                    String decimalPattern = '^-?\\d+(\\.\\d+)?$';
                    
                    // Loop through accounts and find the most recent Year__c from ClientSurveyResults__r
                    // for each account
                    for (Account acc : accountList) {
                        if (acc.Client_Survey_Results__r != null && !acc.Client_Survey_Results__r.isEmpty()) {
                            ClientSurveyResults__c latestSurvey = acc.Client_Survey_Results__r[0];
                            if(String.isNotBlank(latestSurvey.LikelihoodtoRecommendScore__c)){
                                String recommendScore = latestSurvey.LikelihoodtoRecommendScore__c;
                                Boolean numCheck = Pattern.matches(decimalPattern, recommendScore);
                                if(numCheck){
                                    Decimal score = Decimal.valueOf(recommendScore);
                                    // Add values to the promotersAccountYearMap Map if LikelihoodtoRecommendScore__c >= 9
                                    if(score >= 9){
                                        promotersAccountYearMap.put(acc.Id, Integer.valueOf(latestSurvey.Year__c));
                                    }
                                    // Add values to the detractorsAccountYearMap Map if LikelihoodtoRecommendScore__c >= 0 And LikelihoodtoRecommendScore__c <= 6
                                    else if(score >= 0 && score <= 6){
                                        detractorsAccountYearMap.put(acc.Id, Integer.valueOf(latestSurvey.Year__c));
                                    }
                                }
                            }
                        }
                    }
                    
                    // Iterarte on aggregateResults and add values to accountYearMap 
                    for (AggregateResult result : aggregateResults) {
                        
                        // Get the account Id
                        Id accountId = (Id) result.get('Account__c');
                        
                        // Get the year and convert it to Integer, safely handle if it's returned as String
                        String yearString = (String) result.get('Year__c');
                        Integer year;
                        
                        // Try to convert the year string to an Integer
                        try {
                            year = Integer.valueOf(yearString);
                        } catch (Exception e) {
                            System.debug('Error converting year to Integer: ' + e.getMessage());
                            continue;  // Skip this result if conversion fails
                        }
                        
                        if (!accountYearMap.containsKey(accountId)) {
                            accountYearMap.put(accountId, new List<Integer>());
                        }
                        accountYearMap.get(accountId).add(year);
                    }
                }
                
                // Loop through contactToAccountMap to process each contactId
                for (Id contactId : contactIds) {
                    
                    Integer promotersCount  = 0;    // Initialize count as 0
                    Integer detractorsCount = 0;
                    Set<Integer> yearSet    = new Set<Integer>();
                    
                    // Loop through the account Ids associated with the contact
                    if(contactToAccountMap.containsKey(contactId) && contactToAccountMap.get(contactId) != null 
                       && !contactToAccountMap.get(contactId).isEmpty()){
                           for (Id accountId : contactToAccountMap.get(contactId)) {
                               if(promotersAccountYearMap.containsKey(accountId) && promotersAccountYearMap.get(accountId) == maxYearNew 
                                  && promotersAccountYearMap.get(accountId) >= 9){
                                      promotersCount += 1;
                                  } 
                               if(detractorsAccountYearMap.containsKey(accountId) && detractorsAccountYearMap.get(accountId) == maxYearNew 
                                  && (detractorsAccountYearMap.get(accountId) >= 0 || detractorsAccountYearMap.get(accountId) <= 6)){
                                      detractorsCount += 1;
                                  }
                               
                               if (accountYearMap.containsKey(accountId)) {
                                   yearSet.addAll(accountYearMap.get(accountId));
                               }
                               
                           }
                       }
                    
                    // Convert Set to List, sort and get the top 3 years
                    List<Integer> yearList = new List<Integer>(yearSet);
                    yearList.sort();
                    
                    // Manually reverse the list
                    List<Integer> reversedYearList = new List<Integer>();
                    for (Integer i = yearList.size() - 1; i >= 0; i--) {
                        reversedYearList.add(yearList[i]);
                    }
                    
                    List<String> latestYears = new List<String>();
                    for (Integer year : reversedYearList) {
                        if (latestYears.size() < 3) {
                            latestYears.add(String.valueOf(year));
                        } else {
                            break;
                        }
                    }
                    
                    Integer totalSoldRetainedAndLostCancelRecords = totalSoldRetainedLostRetainedMACountMap.containsKey(contactId) ? totalSoldRetainedLostRetainedMACountMap.get(contactId) : 0;
                    Integer soldRetainedRecords                   = soldRetainedMACountMap.containsKey(contactId) ? soldRetainedMACountMap.get(contactId) : 0;
                    Integer lostCancelRecords                     = lostCancelMACountMap.containsKey(contactId) ? lostCancelMACountMap.get(contactId) : 0;
                    
                    // Calculate percentage of sold/retained to total Medical MAs
                    Double percentageSoldRetained = (totalSoldRetainedAndLostCancelRecords > 0) ? ((Double)soldRetainedRecords / totalSoldRetainedAndLostCancelRecords) * 100 : 0;
                    // Calculate percentage of lost/cancel to total Medical MAs
                    Double percentageLostCancel   = (totalSoldRetainedAndLostCancelRecords > 0) ? ((Double)lostCancelRecords / totalSoldRetainedAndLostCancelRecords) * 100 : 0;
                    
                    // Update the contact fields
                    if (promotersCount > 0 || detractorsCount > 0 || !latestYears.isEmpty() || 
                        existingClientTypeCountMap.containsKey(contactId) || emergeningRiskClientCountMap.containsKey(contactId) ||
                        lostCancelRecords > 0 || percentageSoldRetained > 0 || percentageLostCancel > 0 || memberActivityCountMap.containsKey(contactId)
                        || nbeaLostCancelCountMap.containsKey(contactId)){
                            
                            Contact conToUpdate                                  = conUpdateMap.get(contactId);
                            conToUpdate.Client_Promoters__c                      = promotersCount;
                            conToUpdate.Client_Detractors__c                     = detractorsCount;                 
                            //conToUpdate.List_of_Accounts_Tied_to_Consultant__c   = existingClientTypeCountMap.containsKey(contactId) ? existingClientTypeCountMap.get(contactId) : 0;
                            conToUpdate.Emerging_Risk_Clients__c                 = emergeningRiskClientCountMap.containsKey(contactId) ? emergeningRiskClientCountMap.get(contactId) : 0;
                            conToUpdate.of_Sold_Retained_Medical_MAs__c          = percentageSoldRetained;
                            conToUpdate.of_Lost_Cancelled_Medical_MAs__c         = percentageLostCancel;
                            conToUpdate.Count_of_NBEA_Lost_Cancel_Medical_MAs__c = nbeaLostCancelCountMap.containsKey(contactId) ? nbeaLostCancelCountMap.get(contactId) : 0;
                            //conToUpdate.List_of_MAs_for_consultant__c            = memberActivityCountMap.containsKey(contactId) ? memberActivityCountMap.get(contactId) : 0;
                            
                            // Add or merge into the contactsToUpdateMap
                            if (contactsToUpdateMap.containsKey(contactId)) {
                                contactsToUpdateMap.get(contactId).Client_Promoters__c                      = promotersCount;
                                contactsToUpdateMap.get(contactId).Client_Detractors__c                     = detractorsCount;
                                //contactsToUpdateMap.get(contactId).List_of_Accounts_Tied_to_Consultant__c   = existingClientTypeCountMap.containsKey(contactId) ? existingClientTypeCountMap.get(contactId) : 0;
                                contactsToUpdateMap.get(contactId).Emerging_Risk_Clients__c                 = emergeningRiskClientCountMap.containsKey(contactId) ? emergeningRiskClientCountMap.get(contactId) : 0;
                                contactsToUpdateMap.get(contactId).of_Sold_Retained_Medical_MAs__c          = percentageSoldRetained;
                                contactsToUpdateMap.get(contactId).of_Lost_Cancelled_Medical_MAs__c         = percentageLostCancel; 
                                contactsToUpdateMap.get(contactId).Count_of_NBEA_Lost_Cancel_Medical_MAs__c = nbeaLostCancelCountMap.containsKey(contactId) ? nbeaLostCancelCountMap.get(contactId) : 0;
                                //contactsToUpdateMap.get(contactId).List_of_MAs_for_consultant__c            = memberActivityCountMap.containsKey(contactId) ? memberActivityCountMap.get(contactId) : 0;
                            } else {
                                contactsToUpdateMap.put(contactId, conToUpdate);
                            }
                        }
                }
            }else{
                System.debug('No contact records to process');
            }
        }catch (Exception e) {
            System.debug('Error updating contacts: ' + e.getMessage());
        }
        
        // Update the contacts in bulk
        Database.SaveResult[] consultantList = Database.update(contactsToUpdateMap.values(), false);
        System.debug('consultantList'+consultantList);
        for (Database.SaveResult sr : consultantList) {
            if (sr.isSuccess()) {
                System.debug('Successfully Updated Consultant Dashboard Fields on Contact for Record ID : ' + sr.getId());
            } else {
                for(Database.Error objErr : sr.getErrors()) {
                    System.debug('The following error has occurred.');
                    System.debug(objErr.getStatusCode() + ': ' + objErr.getMessage());
                    System.debug(' Contact Object field which are affected by the error:'+ objErr.getFields());
                }
            }
        }
    }
    
    // This method is called after all batches are processed
    public void finish(Database.BatchableContext context) {
        try {    
            System.debug('Batch processing completed successfully.');
        } catch (Exception e) {
            // Handle any exceptions that occur during batch execution
            System.debug('An exception occurred: ' + e.getMessage());
        }
    }
    
}