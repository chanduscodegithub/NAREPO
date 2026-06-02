/**
 * Class Name: ProactiveRenewalService / ProactiveRenewalServiceTest
 *
 * Description:
 * This service class evaluates Opportunities for Proactive Renewal Incentive eligibility
 * and updates related fields based on defined business rules.
 *
 * Key Responsibilities:
 * - Determines eligibility for Proactive Renewal Incentive based on:
 *   • Entry criteria (business type, stage, product involvement)
 *   • Additional qualification conditions (risk outcome, disposition, etc.)
 * - Checks prior Opportunities (previous 1–2 seasons) for qualification status
 * - Updates the following fields:
 *   • Proactive_Renewal_Incentive_Status__c
 *   • Proactive_Renewal_Disqualify_Prior_Year__c
 *
 * Logic Highlights:
 * - Skips processing if:
 *   • Sales Season or Account is missing
 *   • Override field is populated or changed
 *   • Incentive Status is manually modified
 * - Fetches historical Opportunities for the same Account to determine prior qualification
 * - Applies special handling for specific conditions (e.g., SS 2027 contract extension case)
 *
 * Methods:
 * - process(): Main method to evaluate and update Opportunities
 * - entryCriteriaMet(): Validates initial eligibility conditions
 * - additionalConditionsMet(): Validates detailed qualification rules
 *
 * Usage:
 * - Intended to be called from Trigger (before insert / before update)
 * - Bulk-safe and optimized for large data volumes
 *
 * Author: [Veera Reddy N]
 * Last Modified: [30/03/2026]
 */
public with sharing class ProactiveRenewalService {
    
    public static void process(List<Opportunity> oppList, Map<Id,Opportunity> oldMap){
        
        Set<Id> accountIds = new Set<Id>();
        Set<String> seasonsToCheck = new Set<String>();
        
        Map<Id,Integer> oppSeasonYear = new Map<Id,Integer>();
        
        for(Opportunity opp : oppList){
            
            if(String.isBlank(opp.Sales_Season1__c) || opp.AccountId == null){
                continue;
            }
            
            Integer seasonYear;
            if(opp.Sales_Season1__c.replace('SS ', '')!=''){
                seasonYear = Integer.valueOf(opp.Sales_Season1__c.replace('SS ', ''));
                
                oppSeasonYear.put(opp.Id, seasonYear);
                
                seasonsToCheck.add('SS ' + (seasonYear - 1));
                seasonsToCheck.add('SS ' + (seasonYear - 2));
                
                accountIds.add(opp.AccountId);
            }
        }
        
        Map<Id,List<Opportunity>> previousOpps = new Map<Id,List<Opportunity>>();
        
        if(!accountIds.isEmpty()){
            
            for(Opportunity o : [
                SELECT Id,
                AccountId,
                Sales_Season1__c,
                Proactive_Renewal_Incentive_Status__c
                FROM Opportunity
                WHERE AccountId IN :accountIds
                AND Sales_Season1__c IN :seasonsToCheck AND Id NOT IN :oppList
            ]){
                
                if(!previousOpps.containsKey(o.AccountId)){
                    previousOpps.put(o.AccountId,new List<Opportunity>());
                }
                
                previousOpps.get(o.AccountId).add(o);
            }
        }
        
        
        for(Opportunity opp : oppList){
            
            Opportunity oldOpp =
                oldMap != null ? oldMap.get(opp.Id) : null;
            
          /*  if(
                opp.Proactive_Renewal_Override__c != null ||
                (oldOpp != null &&
                 oldOpp.Proactive_Renewal_Override__c != opp.Proactive_Renewal_Override__c)
            ){
                continue;
            }
            
              if(
                opp.Proactive_Renewal_Retention__c != null ||
                (oldOpp != null &&
                 oldOpp.Proactive_Renewal_Retention__c != opp.Proactive_Renewal_Retention__c)
            ){
                continue;
            }
            
            if(oldOpp != null &&
               opp.Proactive_Renewal_Incentive_Status__c !=
               oldOpp.Proactive_Renewal_Incentive_Status__c){
                   continue;
               }
            
              if(oldOpp != null &&
               opp.Existing_Members_Risk_Outcome_Medical__c !=
               oldOpp.Existing_Members_Risk_Outcome_Medical__c){
                   continue;
               } 
            if(oldOpp != null &&
               opp.Reason_for_the_Opportunity_Risk__c !=
               oldOpp.Reason_for_the_Opportunity_Risk__c){
                   continue;
               } 
            if(oldOpp != null &&
               opp.Disposition_Medical__c !=
               oldOpp.Disposition_Medical__c){
                   continue;
               } 
            if(oldOpp != null &&
               opp.Competitive_Non_Competitive_calculated__c !=
               oldOpp.Competitive_Non_Competitive_calculated__c){
                   continue;
               }
            */
            if(!entryCriteriaMet(opp)){
                continue;
            }
            
            if(
                opp.Proactive_Renewal_Override__c != null ||
                (oldOpp != null &&
                 oldOpp.Proactive_Renewal_Override__c != opp.Proactive_Renewal_Override__c)
            ){
                continue;
            }
            
            Boolean isChanged = false;
            
            if(oldOpp != null){
                isChanged =opp.Sales_Stage_Medical__c!=oldOpp.Sales_Stage_Medical__c ||
                    opp.Proactive_Renewal_Additional_Info__c != oldOpp.Proactive_Renewal_Additional_Info__c ||
                    opp.Existing_Members_Risk_Outcome_Medical__c != oldOpp.Existing_Members_Risk_Outcome_Medical__c ||
                    opp.Reason_for_the_Opportunity_Risk__c != oldOpp.Reason_for_the_Opportunity_Risk__c ||
                    opp.Disposition_Medical__c != oldOpp.Disposition_Medical__c ||
                    opp.Competitive_Non_Competitive_calculated__c != oldOpp.Competitive_Non_Competitive_calculated__c;
            }
            
            if(!isChanged){
                continue;
            }
            
           
            
            String season = opp.Sales_Season1__c;
            
            Boolean priorQualified = false;
            if(previousOpps.containsKey(opp.AccountId)){
                
                for(Opportunity prev : previousOpps.get(opp.AccountId)){
                    
                    if(prev.Proactive_Renewal_Incentive_Status__c != null &&
                       prev.Proactive_Renewal_Incentive_Status__c
                       .contains('Qualifies - Fully Validated')){
                           
                           priorQualified = true;
                           break;
                       }
                }
            }
            Boolean additionalMet = additionalConditionsMet(opp);

            
            if(!additionalMet){                
                if(priorQualified)
                    opp.Proactive_Renewal_Disqualify_Prior_Year__c = true;
                
                opp.Proactive_Renewal_Incentive_Status__c =
                    season + ' - Does Not Qualify';
               
                continue;
            }
            
            if(additionalMet){
                
                Integer seasonYearforOpp = Integer.valueOf(opp.Sales_Season1__c.replace('SS ', ''));

                
                if(opp.Proactive_Renewal_Additional_Info__c
                   == 'Medical Contract WAS Extended for 5+ Years' && seasonYearforOpp >=2027 ){
                       
                       opp.Proactive_Renewal_Incentive_Status__c =
                           season + ' - Pending Qualification';
                       
                       continue;
                   }
                
                if(priorQualified){
                    
                    opp.Proactive_Renewal_Disqualify_Prior_Year__c = true;
                    
                    opp.Proactive_Renewal_Incentive_Status__c =
                        season + ' - Does Not Qualify';
                }
                else{
                    
                    if(opp.Proactive_Renewal_Incentive_Status__c !=
                       season + ' - Pending Qualification'){
                           
                           opp.Proactive_Renewal_Incentive_Status__c =
                               season + ' - Pending Qualification';
                       }
                }
                
            }
        }
    }
    
    
    
    private static Boolean entryCriteriaMet(Opportunity opp){
        
        return opp.BusinessType__c == 'Client Management'
            && opp.Sales_Stage_Medical__c == 'Notified'
            && opp.Product_Type_Involved_in_Opp__c != null
            && opp.Product_Type_Involved_in_Opp__c.contains('Medical');
    }
    
    
    
    private static Boolean additionalConditionsMet(Opportunity opp){
        
        Boolean outcome =
            opp.Existing_Members_Risk_Outcome_Medical__c == 'Retained'
            || opp.Existing_Members_Risk_Outcome_Medical__c
            == 'Partial Cancellation';
        
        return opp.Reason_for_the_Opportunity_Risk__c == 'Proactive Renewal'
            && opp.Disposition_Medical__c == 'Sold'
            && opp.Competitive_Non_Competitive_calculated__c == 'Non Competitive'
            && outcome;
    }
    
}