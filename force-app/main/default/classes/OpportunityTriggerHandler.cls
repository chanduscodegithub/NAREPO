public class OpportunityTriggerHandler {
    
    public static void populateSalesDebriefOnBeforeUpdate(List<Opportunity> newList, Map<Id,Opportunity> oldMap){
        system.debug('OPP Trigger fired');
        Id oppRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('CD Membership Activity (Prospect or Aggregator)').getRecordTypeId();
        Id equityHealthCareId = System.Label.Equity_Healthcare_Aggregator;//[Select id from Account where name = 'Equity Healthcare' AND RecordType.Name = 'Aggregator'][0].Id; //Querying Equity Healthcare as Lookup fields will not come in trigger
        List<Opportunity> medOppList = new List<Opportunity>();
        Set<Id> specialtyOppIdSet = new Set<Id>();
        List<OpportunityLineItem> specialtyOliList = new List<OpportunityLineItem>();
        Set<Id> eligibleSpecialtyOppId = new Set<Id>();
        
        for(Opportunity opp:newList){
            if(opp.RecordTypeId == oppRecordTypeId && opp.Product_Type_Involved_in_Opp__c != null){
                if(opp.Product_Type_Involved_in_Opp__c.contains('Medical')){
                    medOppList.add(opp);
                }
                else if(!opp.Product_Type_Involved_in_Opp__c.contains('Medical') && (opp.Product_Type_Involved_in_Opp__c.contains('Vision') || opp.Product_Type_Involved_in_Opp__c.contains('Dental') || opp.Product_Type_Involved_in_Opp__c.contains('Other Buy Up Programs'))){
                    specialtyOppIdSet.add(opp.Id);
                }
            }
        }
        
        if(medOppList.size() > 0){
            for(Opportunity opp:medOppList){
                if((opp.Disposition_Medical__c == 'Sold' || opp.Disposition_Medical__c == 'Lost: Finalist' || opp.Disposition_Medical__c == 'Lost: Non-Finalist')
                   && (opp.Aggregator_Involved_in_the_Oppty_Risk__c != equityHealthCareId && opp.Membership_Activity_Type__c != 'Private Exchange')){
                       opp.Sales_Debrief__c = 'Comprehensive Medical';
                   }
                else{
                    system.debug('medical else');
                    specialtyOppIdSet.add(opp.Id);
                    opp.Sales_Debrief__c = '';
                }
            }
        }
        
        specialtyOliList = [SELECT id,name,OpportunityId,Disposition_Other_Buy_Up_Programs__c,Opportunity.Disposition_Dental__c,Opportunity.Disposition_Vision__c,Estimated_Additional_New_Members__c,Opportunity.WillThrBeaRFP__c,Opportunity.Sales_Debrief__c
                            FROM OpportunityLineItem
                            WHERE OpportunityId IN:specialtyOppIdSet AND Opportunity.Aggregator_Involved_in_the_Oppty_Risk__r.Name != 'Equity Healthcare' AND Opportunity.Membership_Activity_Type__c != 'Private Exchange'
                            AND((((Product_Line__c = 'Dental' AND Product2.Family = 'Specialty Products' AND Opportunity.Disposition_Dental__c IN ('Sold', 'Lost: Finalist', 'Lost: Non-Finalist')) 
                                  OR (Product_Line__c = 'Vision' AND Product2.Family = 'Specialty Products' AND Opportunity.Disposition_Vision__c IN ('Sold', 'Lost: Finalist', 'Lost: Non-Finalist')))
                                 AND (Opportunity.WillThrBeaRFP__c IN ('Yes, RFP is Certain', 'Yes, RFP is Likely') 
                                      OR Net_Results__c != 0 OR (Estimated_Additional_New_Members__c > 0 AND Net_Results__c = 0)))
                                OR((Product_Line__c = 'Other' AND Product2.Family = 'Specialty Products' AND Disposition_Other_Buy_Up_Programs__c IN ('Sold', 'Lost: Finalist', 'Lost: Non-Finalist'))
                                   AND (Opportunity.WillThrBeaRFP__c IN ('Yes, RFP is Certain', 'Yes, RFP is Likely')
                                        OR Net_Results__c != 0 OR (Estimated_Additional_New_Members__c > 0 AND Net_Results__c = 0))))];
        
        system.debug('specialtyOliList '+specialtyOliList);
        
        if(specialtyOliList.size() > 0){
            for(OpportunityLineItem oli:specialtyOliList){
                eligibleSpecialtyOppId.add(oli.OpportunityId);
            }
            
            for(Opportunity opp:newList){
                if(eligibleSpecialtyOppId.contains(opp.Id) && opp.Sales_Debrief__c != 'Comprehensive Medical'){
                    opp.Sales_Debrief__c = 'Specialty Only';
                }
            }
        }
        else{
            system.debug('inside specialty else');
            for(Opportunity opp:newList){
                if(!medOppList.contains(opp)){
                    system.debug('opp.RecordTypeId - '+opp.RecordTypeId);
                    system.debug('oppRecordTypeId - '+oppRecordTypeId);
                    if(opp.RecordTypeId == oppRecordTypeId){
                        system.debug('inside specialty inner if '+opp.Name);
                        opp.Sales_Debrief__c = '';
                    }
                }
            }
        }
    }
    
    public static void afterUpdate(List<Opportunity> newList, Map<Id, Opportunity> oldMap) {
        /***************************************************
* 1. Opportunity → Strategy Memo mapping table
***************************************************/
        List<FieldMapping> mappings = new List<FieldMapping>{
            new FieldMapping('Notes_taken_on_call_with_consultant__c', 'Notes_taken_on_call_with_consultant__c'),
                new FieldMapping('Is_the_Client_in_the_Cannabis_Business__c', 'Is_the_Client_in_the_Cannabis_Business__c'),
                new FieldMapping('EffectiveDate__c', 'Effective_Date__c'),
                new FieldMapping('Finalist_Date_Medical__c', 'Finalist_Date__c'),
                new FieldMapping('Anticipated_Actual_Close_Date_Medical__c', 'Anticipated_Actual_Close_Date__c'),
                new FieldMapping('Deal_Sponsor__c', 'Deal_Sponsor__c'),
                new FieldMapping('Executive_Sponsor__c', 'Executive_Sponsor__c'),
                new FieldMapping('SCE_Assignment__c', 'SCE_Assignment_Traditional__c'),
                new FieldMapping('Financial_Strategy_Lead__c', 'Financial_Strategy_Lead__c'),
                new FieldMapping('Specialty_Benefits_SVP__c', 'Specialty_SVP__c'),
                new FieldMapping('Surest_SVP_Involved__c', 'Surest_SVP__c'),
                new FieldMapping('Owner_Name__c', 'Sales_Vice_President_CD__c'),
                new FieldMapping('Proposal_Due_Date_Medical__c', 'Proposal_Date_Due__c'),
                new FieldMapping('Proposal_Received_Date_Medical__c', 'Proposal_Date_Received__c'),
                new FieldMapping('Id', 'Salesforce_Opportunity_ID__c'),
                new FieldMapping('Strategy_Call_Date__c', 'Strategy_Call_Date__c'),
                new FieldMapping('vs_Aetna__c', 'Vs_Aetna__c'),
                new FieldMapping('vs_Anthem__c', 'Vs_Anthem__c'),
                new FieldMapping('vs_Blues__c', 'Vs_Blues__c'),
                new FieldMapping('vs_Blues_Alt__c', 'Vs_Blues_Alt__c'),
                new FieldMapping('vs_Cigna__c', 'Vs_Cigna__c'),
                new FieldMapping('Opportunity_Average_Contract_Size_ACS__c', 'Acs__c'),
                new FieldMapping('Employees_in_the_Proposal_Medical__c', 'Employees_in_the_Proposal_Medical__c'),
                new FieldMapping('Members_in_the_Proposal_Medical__c', 'Members_in_the_Proposal_Medical__c'),
                new FieldMapping('EEsRetireesintheProposalMedical__c', 'EEs_Retirees_in_the_Proposal_Medical__c'),
                new FieldMapping('Aggregator_Involved_in_the_Oppty_Risk__c','Aggregator_involved_in_the_opportunity__c'),
                new FieldMapping('Bid_Strategy__c','Bid_Strategy__c'),
                new FieldMapping('Proposal_Due_Date_Medical__c','E_Ship_Date__c')
                
                
                };
                    
                    
                    /***************************************************
* 2. Detect opportunities where ANY mapped field changed
***************************************************/
                    Set<Id> changedOppIds = new Set<Id>();
        
        for (Opportunity newOpp : newList) {
            Opportunity oldOpp = oldMap.get(newOpp.Id);
            
            if (newOpp.Sales_Stage_Medical__c == 'Notified') {
                continue;
            }
            
            for (FieldMapping m : mappings) {
                Object newVal = newOpp.get(m.sourceField);
                Object oldVal = oldOpp.get(m.sourceField);
                
                if (newVal != oldVal) {
                    changedOppIds.add(newOpp.Id);
                    break; // one changed field is enough
                }
            }
        }
        if (changedOppIds.isEmpty()) return;
        
        
        /***************************************************
* 3. Query related Strategy Memos
***************************************************/
        List<Strategy_Memo__c> memoList = [
            SELECT Id, Membership_Activity__c
            FROM Strategy_Memo__c
            WHERE Membership_Activity__c IN :changedOppIds
        ];
        System.debug('memoList --> '+memoList);
        if (memoList.isEmpty()) return;
        
        
        /***************************************************
* 4. Map new Opportunity values to Memos
***************************************************/
        Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>(newList);
        List<Strategy_Memo__c> memosToUpdate = new List<Strategy_Memo__c>();
        
        for (Strategy_Memo__c memo : memoList) {
            Opportunity opp = oppMap.get(memo.Membership_Activity__c);
            if (opp == null) continue;
            
            for (FieldMapping m : mappings) {
                Object val = opp.get(m.sourceField);
                if (val == null) continue;
                
                // Get target field describe
                Schema.DescribeFieldResult targetDescribe =
                    Strategy_Memo__c.SObjectType
                    .getDescribe()
                    .fields
                    .getMap()
                    .get(m.targetField)
                    .getDescribe();
                
                Schema.DisplayType targetType = targetDescribe.getType();
                
                // === BOOLEAN TARGET ===
                if (targetType == Schema.DisplayType.Boolean) {
                    if (val instanceof Boolean) {
                        memo.put(m.targetField, (Boolean) val);
                    }
                    else if (val instanceof String) {
                        String s = ((String) val).trim().toLowerCase();
                        memo.put(m.targetField, (s == 'yes' || s == 'true'));
                    }
                    continue;
                }
                
                // === STRING TARGET ===
                if (targetType == Schema.DisplayType.String ||
                    targetType == Schema.DisplayType.TextArea) {
                        memo.put(m.targetField, String.valueOf(val));
                        continue;
                    }
                
                // === DATE TARGET ===
                if (targetType == Schema.DisplayType.Date && val instanceof Date) {
                    memo.put(m.targetField, (Date) val);
                    continue;
                }
                
                // === DATETIME TARGET ===
                if (targetType == Schema.DisplayType.DateTime && val instanceof Datetime) {
                    memo.put(m.targetField, (Datetime) val);
                    continue;
                }
                
                // === NUMBER TARGET ===
                if ((targetType == Schema.DisplayType.Double ||
                     targetType == Schema.DisplayType.Currency ||
                     targetType == Schema.DisplayType.Percent ||
                     targetType == Schema.DisplayType.Integer)
                   ) {
                       if (val instanceof Decimal) memo.put(m.targetField, (Decimal) val);
                       else if (val instanceof Double) memo.put(m.targetField, (Double) val);
                       else if (val instanceof Integer) memo.put(m.targetField, (Integer) val);
                   }
                
            }
            memosToUpdate.add(memo);
        }
        
        /***************************************************
* 5. Update Strategy Memo records
***************************************************/
        if (!memosToUpdate.isEmpty()) {
            update memosToUpdate;
        }
    }
    
    
    /***************************************************
* Helper Class for Field Mapping
***************************************************/
    public class FieldMapping {
        public String sourceField;  // Opportunity field
        public String targetField;  // Strategy Memo field
        
        public FieldMapping(String source, String target) {
            sourceField = source;
            targetField = target;
        }
        
    }
    
    public static void validateOpp(List<Opportunity> newList, Map<Id, Opportunity> oldMap) {

        Set<Id> oppIds = new Set<Id>();

         for (Opportunity opp : newList) {
            Opportunity oldOpp = oldMap != null ? oldMap.get(opp.Id) : null;

            if (opp.Sales_Stage_Other__c == 'Notified') {
                oppIds.add(opp.Id);
            }
        }

        if (oppIds.isEmpty()) return;

        // Fetch OLI + Product Reporting Type
        Map<Id, Set<String>> oppToProductTypes = new Map<Id, Set<String>>();

        for (OpportunityLineItem oli : [
            SELECT OpportunityId,
                   Product2.Reporting_Product_Type__c
            FROM OpportunityLineItem
            WHERE OpportunityId IN :oppIds
        ]) {
            if (!oppToProductTypes.containsKey(oli.OpportunityId)) {
                oppToProductTypes.put(oli.OpportunityId, new Set<String>());
            }

            if (oli.Product2.Reporting_Product_Type__c != null) {
                oppToProductTypes.get(oli.OpportunityId)
                    .add(oli.Product2.Reporting_Product_Type__c);
            }
        }

        // Validation per Opportunity
        for (Opportunity opp : newList) {

            if (!oppIds.contains(opp.Id)) continue;
            if (!oppToProductTypes.containsKey(opp.Id)) continue;

            Set<String> productTypes = oppToProductTypes.get(opp.Id);

            if (productTypes.contains('APP') &&
                String.isBlank(opp.Existing_Members_Risk_Outcome_APP__c)) {

               opp.addError(
                    'Existing Members Risk Outcome (APP) is required when APP products are part of the Opportunity.'
                );
            
                opp.Existing_Members_Risk_Outcome_APP__c.addError('Required');
            }

            if (productTypes.contains('CI') &&
                String.isBlank(opp.Existing_Members_Risk_Outcome_CI__c)) {
                    
                    opp.addError('Existing Members Risk Outcome (CI) is required when CI products are part of the Opportunity.');
                    opp.Existing_Members_Risk_Outcome_CI__c.addError('Required');
                }
            
            // HI
            if (productTypes.contains('HI') &&
                String.isBlank(opp.Existing_Members_Risk_Outcome_HI__c)) {
                    
                    opp.addError('Existing Members Risk Outcome (HI) is required when HI products are part of the Opportunity.');
                    opp.Existing_Members_Risk_Outcome_HI__c.addError('Required');
                }
            
            // Life
            if (productTypes.contains('Life') &&
                String.isBlank(opp.Existing_Members_Risk_Outcome_Life__c)) {
                    
                    opp.addError('Existing Members Risk Outcome (Life) is required when Life products are part of the Opportunity.');
                    opp.Existing_Members_Risk_Outcome_Life__c.addError('Required');
                }
            
            // STD
            if (productTypes.contains('STD') &&
                String.isBlank(opp.Existing_Members_Risk_Outcome_STD__c)) {
                    
                    opp.addError('Existing Members Risk Outcome (STD) is required when STD products are part of the Opportunity.');
                    opp.Existing_Members_Risk_Outcome_STD__c.addError('Required');
                }
            
            // LTD
            if (productTypes.contains('LTD') &&
                String.isBlank(opp.Existing_Members_Risk_Outcome_LTD__c)) {
                    
                    opp.addError('Existing Members Risk Outcome (LTD) is required when LTD products are part of the Opportunity.');
                    opp.Existing_Members_Risk_Outcome_LTD__c.addError('Required');
                }
            
            // Leave
            if (productTypes.contains('Leave') &&
                String.isBlank(opp.Existing_Members_Risk_Outcome_Leave__c)) {
                    
                    opp.addError('Existing Members Risk Outcome (Leave) is required when Leave products are part of the Opportunity.');
                    opp.Existing_Members_Risk_Outcome_Leave__c.addError('Required');
                }
        }
    }
    
  /*  private static Boolean isOliDrivenOppUpdate(Opportunity newOpp, Opportunity oldOpp) {
        if (oldOpp == null) return false;
    
        return
            newOpp.Amount != oldOpp.Amount &&
            newOpp.Sales_Stage_Other__c == oldOpp.Sales_Stage_Other__c &&
            newOpp.Existing_Members_Risk_Outcome_APP__c == oldOpp.Existing_Members_Risk_Outcome_APP__c &&
            newOpp.Existing_Members_Risk_Outcome_CI__c == oldOpp.Existing_Members_Risk_Outcome_CI__c &&
            newOpp.Existing_Members_Risk_Outcome_HI__c == oldOpp.Existing_Members_Risk_Outcome_HI__c &&
            newOpp.Existing_Members_Risk_Outcome_Life__c == oldOpp.Existing_Members_Risk_Outcome_Life__c &&
            newOpp.Existing_Members_Risk_Outcome_STD__c == oldOpp.Existing_Members_Risk_Outcome_STD__c &&
            newOpp.Existing_Members_Risk_Outcome_LTD__c == oldOpp.Existing_Members_Risk_Outcome_LTD__c &&
            newOpp.Existing_Members_Risk_Outcome_Leave__c == oldOpp.Existing_Members_Risk_Outcome_Leave__c;
    }  */
    
}