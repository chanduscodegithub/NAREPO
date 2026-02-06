/*****************************************************
* Name : ConsultantFirmDashboardBatch
* Developer: Gurjot Singh
* Email: gurjot.singh@crmit.com
* Purpose: 
* Date: 
* Last Modified Date:
*******************************************************/
public class ConsultantFirmDashboardBatch implements Database.Batchable<sObject>, Database.Stateful{
    
    // This method retrieves the list of Contacts to process
    public Database.QueryLocator start(Database.BatchableContext context) {
        return Database.getQueryLocator([
            SELECT Id 
            FROM Account 
            WHERE RecordType.DeveloperName = 'Consulting_Firm' 
        ]);
    }
    
    // This method processes each batch of contacts
    public void execute(Database.BatchableContext context, List<Account> accRecordsToProcess) {
        
        Map<Id, Account> accountsToUpdateMap = new Map<Id, Account>();
        try{
            if(accRecordsToProcess!=null && !accRecordsToProcess.isEmpty()){
                // Collect account IDs from the batch
                Map<Id,Account> accUpdateMap = new Map<Id,Account>();
                Set<Id> accountIds           = new Set<Id>();
                for (Account acc : accRecordsToProcess) {
                    accountIds.add(acc.Id);
                    accUpdateMap.put(acc.Id, acc); 
                }
                
                // Query AccountCFJunction__c records for the account
                List<AccountCFJunction__c> cfJunctionList = new list<AccountCFJunction__c>();/*[SELECT Id, AccountFirm__c,AccountFirm__r.Name,AccountFirm__r.Test_Type__c,
                                                             AccountFirm__r.RecordType.Name,AccountFirm__r.Owner.Name, ConsultingFirm__c 
                                                             FROM AccountCFJunction__c where ConsultingFirm__c IN: accountIds 
                                                             AND AccountFirm__c != null];*/
                
                // Query AccountContactRelation records for the account
                List<AccountContactRelation> accConRelList = [SELECT Id, Account.Id, Account.Name, Account.Category__c,Account.Test_Type__c,
                                                              Account.RecordType.Name,Account.Owner.Name, Contact.Account.Id FROM 
                                                              AccountContactRelation where Contact.Account.Id IN: accountIds AND 
                                                              IsDirect = false AND Contact.Status__c='Active'];
                
                // Query OpportunityContactRole records for the accounts where Opportunity.Product_Type_Involved_in_Opp__c 
                // includes ('Medical')
                List<OpportunityContactRole> ocrList = [
                    Select Id, Opportunity.Sales_Stage_Medical__c, OpportunityId, ContactId, Opportunity.EffectiveDate__c,
                    Opportunity.recordtype.DeveloperName,Contact.AccountId,Opportunity.Disposition_Medical__c, isPrimary,
                    Opportunity.Existing_Members_Risk_Outcome_Medical__c, Opportunity.Primary_Consulting_Firm__c FROM 
                    OpportunityContactRole  WHERE Contact.AccountId IN :accountIds  
                    AND Opportunity.Product_Type_Involved_in_Opp__c includes ('Medical')	
                ];
                
                // Get the current date
                Date todayDate = Date.today();
                
                // Calculate the start date (1st Feb 3 years ago)
                Date startDate = Date.newInstance(todayDate.year() - 2, 2, 1); // 1st Feb of 2 years ago
                
                // Calculate the end date (1st Jan of current year + 1 year)
                Date endDate   = Date.newInstance(todayDate.year() + 1, 1, 1);  // 1st Jan next year
                
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
                    if(!maIdsEmerginRisk.contains(ocr.OpportunityId)){
                        if(ocr.Opportunity.Sales_Stage_Medical__c == 'Emerging Risk\\No Upside'){
                            if (!emergeningRiskClientCountMap.containsKey(ocr.Contact.AccountId)) {
                                emergeningRiskClientCountMap.put(ocr.Contact.AccountId, 0);                
                            }
                            emergeningRiskClientCountMap.put(ocr.Contact.AccountId, emergeningRiskClientCountMap.get(ocr.Contact.AccountId) + 1);
                            maIdsEmerginRisk.add(ocr.OpportunityId);
                        }
                    }
                    if(!maIds.contains(ocr.OpportunityId)){
                        Id accountId = ocr.Contact.AccountId;
                        
                        // Add Count of Emergening risk Client to emergeningRiskClientCountMap Map if 
                        // Sales_Stage_Medical__c == 'Emerging Risk\\No Upside' for each account
                       
                        
                        //Add Count of Member Activity records to memberActivityCountMap Map for each account
                        /*if (!memberActivityCountMap.containsKey(ocr.Contact.AccountId)) {
                            memberActivityCountMap.put(ocr.Contact.AccountId, 0);                
                            }
                            memberActivityCountMap.put(ocr.Contact.AccountId, memberActivityCountMap.get(ocr.Contact.AccountId) + 1);*/
                        
                        // First, check if the Opportunity's Effective Date is within the last 3 years
                        if(ocr.Opportunity.EffectiveDate__c >= startDate && ocr.Opportunity.EffectiveDate__c <= endDate 
                           && ocr.Contact.AccountId == ocr.Opportunity.Primary_Consulting_Firm__c 
                           && DispositionMed.contains(ocr.Opportunity.Disposition_Medical__c)){
                               // Count total Medical MA records for each accounts
                               if (!totalSoldRetainedLostRetainedMACountMap.containsKey(accountId)) {
                                   totalSoldRetainedLostRetainedMACountMap.put(accountId, 0);
                               }
                               totalSoldRetainedLostRetainedMACountMap.put(accountId, totalSoldRetainedLostRetainedMACountMap.get(accountId) + 1);
                               
                               // Add Count of Sold Retained MA records to soldRetainedMACountMap Map for each contact
                               if(((ocr.Opportunity.Disposition_Medical__c == 'Sold') && ((ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == null) 
                                                                                          || (ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == 'Retained')))
                                  || ((ocr.Opportunity.Disposition_Medical__c == 'Closed Emerging Risk') && (ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == 'Retained'))){
                                      if (!soldRetainedMACountMap.containsKey(accountId)) {
                                          soldRetainedMACountMap.put(accountId, 0);
                                      }
                                      soldRetainedMACountMap.put(accountId, soldRetainedMACountMap.get(accountId) + 1);
                                  }
                               
                               // Add Count of Lost Cancel MA records to lostCancelMACountMap Map for each contact
                               if(((ocr.Opportunity.Disposition_Medical__c == 'Lost: Finalist') || (ocr.Opportunity.Disposition_Medical__c == 'Lost: Non-Finalist'))
                                  || ((ocr.Opportunity.Disposition_Medical__c == 'Sold') && (ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == 'Partial Cancellation'))
                                  || ((ocr.Opportunity.Disposition_Medical__c == 'Closed Emerging Risk') && ((ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == 'Partial Cancellation') 
                                                                                                             || (ocr.Opportunity.Existing_Members_Risk_Outcome_Medical__c == 'Full Cancellation'))))
                               {
                                   if (!lostCancelMACountMap.containsKey(accountId)) {
                                       lostCancelMACountMap.put(accountId, 0);
                                   }
                                   lostCancelMACountMap.put(accountId, lostCancelMACountMap.get(accountId) + 1);
                                   
                                   // Add Count of Lost Cancel MA records to nbeaLostCancelCountMap Map for each contact
                                   // where Opportunity Record Type is CM
                                   if (!nbeaLostCancelCountMap.containsKey(accountId)) {
                                       if(ocr.Opportunity.recordtype.DeveloperName == 'CM') {
                                           nbeaLostCancelCountMap.put(accountId, 0);
                                       }
                                   }
                                   if(ocr.Opportunity.recordtype.DeveloperName == 'CM') {
                                       nbeaLostCancelCountMap.put(accountId, nbeaLostCancelCountMap.get(accountId) + 1);
                                   }
                               }
                               maIds.add(ocr.OpportunityId);
                           }
                        
                    }
                }
                
                Map<Id, Integer> existingClientsCount = new Map<Id, Integer>();
                Map<Id, Set<Id>> accountToAccountMap  = new Map<Id, Set<Id>>();
                Set<Id> accountAllIds                 = new Set<Id>();
                
                // Get most recent year from the ClientSurveyResults__c object
                Integer maxYearNew;
                List<ClientSurveyResults__c> maxYearSurveyRec = [SELECT Id,Year__c FROM ClientSurveyResults__c where Year__c != NULL ORDER BY Year__c DESC LIMIT 1];
                if(maxYearSurveyRec.size() > 0 ){
                    maxYearNew = Integer.valueOf(maxYearSurveyRec[0].Year__c);
                }
                
                // Loop through AccountCFJunction__c records to count and gather AccountIds
                for (AccountCFJunction__c accCF : cfJunctionList) {
                    
                    // Add values to contactToAccountMap Map and existingClientTypeCountMap where Test_Type__c == 'Existing Client'
                    if (!accountToAccountMap.containsKey(accCF.ConsultingFirm__c)) {
                        accountToAccountMap.put(accCF.ConsultingFirm__c, new Set<Id>());
                    }
                    accountToAccountMap.get(accCF.ConsultingFirm__c).add(accCF.AccountFirm__c);  
                    
                    /*if(accCF.AccountFirm__r.Test_Type__c == 'Existing Client') {
                        if(!existingClientsCount.containsKey(accCF.ConsultingFirm__c)){
                            existingClientsCount.put(accCF.ConsultingFirm__c, 0);
                        }
                        existingClientsCount.put(accCF.ConsultingFirm__c, existingClientsCount.get(accCF.ConsultingFirm__c) + 1);
                    }*/
                    
                    accountAllIds.add(accCF.AccountFirm__c);  // Collecting all related AccountIds
                }
                
                // Loop through AccountContactRelation records to count and gather AccountIds
                for (AccountContactRelation accConRel : accConRelList) {
                        // Add values to the existing contactToAccountMap Map and existingClientTypeCountMap where Test_Type__c == 'Existing Client'
                        if (!accountToAccountMap.containsKey(accConRel.Contact.Account.Id)) {
                            accountToAccountMap.put(accConRel.Contact.Account.Id, new Set<Id>());
                        }
                        accountToAccountMap.get(accConRel.Contact.Account.Id).add(accConRel.Account.Id);
                        
                        /*if(accConRel.Account.Test_Type__c == 'Existing Client') {
                            if(!existingClientsCount.containsKey(accConRel.Contact.Account.Id)){
                                existingClientsCount.put(accConRel.Contact.Account.Id, 0);
                            }
                            existingClientsCount.put(accConRel.Contact.Account.Id, existingClientsCount.get(accConRel.Contact.Account.Id) + 1);
                        }*/
                    if (!accountAllIds.contains(accConRel.Account.Id)){
                        accountAllIds.add(accConRel.Account.Id);  // Collecting all related AccountIds
                    }
                }
                
                Map<Id, List<Integer>> accountYearMap     = new Map<Id, List<Integer>>();
                Map<Id, Integer> promotersAccountYearMap  = new Map<Id, Integer>();
                Map<Id, Integer> detractorsAccountYearMap = new Map<Id, Integer>();
                Integer maxYear                           = null;
                
                // Query Account records with an inner query for ClientSurveyResults__r
                if(accountIds.size() > 0){
                    List<Account> accountList = [
                        SELECT Id, Name, (SELECT Account__c, LikelihoodtoRecommendScore__c, Year__c 
                                          FROM Client_Survey_Results__r 
                                          WHERE Year__c != null AND Type__c = 'Client Survey Results'
                                          ORDER BY Year__c DESC) 
                        FROM Account 
                        WHERE Id IN :accountAllIds AND Test_Type__c = 'Existing Client'
                    ];
                    
                    // Query ClientSurveyResults__c records for accounts, ordered by Year__c DESC
                    List<AggregateResult> aggregateResults = [
                        SELECT Account__c, Year__c, COUNT(Id) recordCount
                        FROM ClientSurveyResults__c
                        WHERE Account__c IN :accountAllIds AND Year__c != null AND Type__c = 'Client Survey Results'
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
                        Id accountId      = (Id) result.get('Account__c');
                        
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
                
                for (Id accountId : accountIds) {
                    
                    Integer promotersCount  = 0;    // Initialize count as 0
                    Integer detractorsCount = 0;
                    Set<Integer> yearSet    = new Set<Integer>();
                    
                    // Loop through the account Ids associated with the related accounts object
                    if(accountToAccountMap.containsKey(accountId) && accountToAccountMap.get(accountId) != null 
                       && !accountToAccountMap.get(accountId).isEmpty()){
                           for (Id relAccountId : accountToAccountMap.get(accountId)) {
                               if(promotersAccountYearMap.containsKey(relAccountId) && promotersAccountYearMap.get(relAccountId) == maxYearNew 
                                  && promotersAccountYearMap.get(relAccountId) >= 9){
                                      promotersCount += 1;
                                  }
                               if(detractorsAccountYearMap.containsKey(relAccountId) && detractorsAccountYearMap.get(relAccountId) == maxYearNew 
                                  && (detractorsAccountYearMap.get(relAccountId) >= 0 || detractorsAccountYearMap.get(relAccountId) <= 6)){
                                      detractorsCount += 1;
                                  }
                               if (accountYearMap.containsKey(relAccountId)) {
                                   yearSet.addAll(accountYearMap.get(relAccountId));
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
                    
                    Integer totalSoldRetainedAndLostCancelRecords = totalSoldRetainedLostRetainedMACountMap.containsKey(accountId) ? totalSoldRetainedLostRetainedMACountMap.get(accountId) : 0;
                    Integer soldRetainedRecords                   = soldRetainedMACountMap.containsKey(accountId) ? soldRetainedMACountMap.get(accountId) : 0;
                    Integer lostCancelRecords                     = lostCancelMACountMap.containsKey(accountId) ? lostCancelMACountMap.get(accountId) : 0;
                    
                    // Calculate percentage of sold/retained to total Medical MAs
                    Double percentageSoldRetained = (totalSoldRetainedAndLostCancelRecords > 0) ? ((Double)soldRetainedRecords / totalSoldRetainedAndLostCancelRecords) * 100 : 0;
                    // Calculate percentage of lost/cancel to total Medical MAs
                    Double percentageLostCancel   = (totalSoldRetainedAndLostCancelRecords > 0) ? ((Double)lostCancelRecords / totalSoldRetainedAndLostCancelRecords) * 100 : 0;
                    
                    // Update the account fields
                    if(promotersCount > 0 || detractorsCount > 0 || !latestYears.isEmpty() || 
                       existingClientsCount.containsKey(accountId) || emergeningRiskClientCountMap.containsKey(accountId) ||
                       lostCancelRecords > 0 || percentageSoldRetained > 0 || percentageLostCancel > 0 || memberActivityCountMap.containsKey(accountId)
                       || nbeaLostCancelCountMap.containsKey(accountId)){
                           
                           Account accToUpdate                                  = accUpdateMap.get(accountId);
                           //accToUpdate.List_of_Accounts_Tied_to_Consultant__c   = existingClientsCount.containsKey(accountId) ? existingClientsCount.get(accountId) : 0;
                           accToUpdate.Client_Promoters__c                      = promotersCount;
                           accToUpdate.Client_Detractors__c                     = detractorsCount;
                           accToUpdate.Emerging_Risk_Clients__c                 = emergeningRiskClientCountMap.containsKey(accountId) ? emergeningRiskClientCountMap.get(accountId) : 0;
                           accToUpdate.of_Sold_Retained_Medical_MAs__c          = percentageSoldRetained;
                           accToUpdate.of_Lost_Cancelled_Medical_MAs__c         = percentageLostCancel;
                           accToUpdate.Count_of_NBEA_Lost_Cancel_Medical_MAs__c = nbeaLostCancelCountMap.containsKey(accountId) ? nbeaLostCancelCountMap.get(accountId) : 0;
                           //accToUpdate.List_of_MAs_for_consultant__c            = memberActivityCountMap.containsKey(accountId) ? memberActivityCountMap.get(accountId) : 0;
                           
                           // Add or merge into the accountsToUpdateMap
                           if (accountsToUpdateMap.containsKey(accountId)) {
                               //accountsToUpdateMap.get(accountId).List_of_Accounts_Tied_to_Consultant__c   = existingClientsCount.get(accountId);
                               accountsToUpdateMap.get(accountId).Client_Promoters__c                      = promotersCount;
                               accountsToUpdateMap.get(accountId).Client_Detractors__c                     = detractorsCount;
                               accountsToUpdateMap.get(accountId).Emerging_Risk_Clients__c                 = emergeningRiskClientCountMap.get(accountId);
                               accountsToUpdateMap.get(accountId).of_Sold_Retained_Medical_MAs__c          = percentageSoldRetained;
                               accountsToUpdateMap.get(accountId).of_Lost_Cancelled_Medical_MAs__c         = percentageLostCancel; 
                               accountsToUpdateMap.get(accountId).Count_of_NBEA_Lost_Cancel_Medical_MAs__c = nbeaLostCancelCountMap.containsKey(accountId) ? nbeaLostCancelCountMap.get(accountId) : 0;
                               //accountsToUpdateMap.get(accountId).List_of_MAs_for_consultant__c            = memberActivityCountMap.get(accountId);
                           } else {
                               accountsToUpdateMap.put(accountId, accToUpdate);
                           }
                       }
                }
            }else{
                System.debug('No Account records to process');
            }
        }catch (Exception e) {
            System.debug('Error updating accounts: ' + e.getMessage());
        }
        
        // Update the accounts in bulk
        Database.SaveResult[] consultantFirmList = Database.update(accountsToUpdateMap.values(), false);
        System.debug('consultantFirmList'+consultantFirmList);
        for (Database.SaveResult sr : consultantFirmList) {
            if (sr.isSuccess()) {
                System.debug('Successfully Updated Consultant Firm Dashboard Fields on Account for Record ID : ' + sr.getId());
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