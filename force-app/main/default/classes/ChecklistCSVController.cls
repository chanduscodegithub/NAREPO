public with sharing class ChecklistCSVController {
    
    public ChecklistCSVController() {
         Date today = Date.today();
         DateTime dt = DateTime.newInstance(today, Time.newInstance(0, 0, 0, 0));
         String formattedDate = dt.format('M-d-yyyy'); 
  	     String fileName = 'UHC NA - CPW SAI BOT Export - ' + formattedDate + '.csv';
         ApexPages.currentPage().getHeaders().put('Content-Disposition', 'attachment; filename="' + fileName + '"');
     }
    
    @AuraEnabled(cacheable=false)
    public static String getCsvContentLwc() {
        ChecklistCSVController ctrl = new ChecklistCSVController();
        return ctrl.getCsvContent(); // reuse your existing generator
    }

    public String getCsvContent() {
        // Step 1: Get metadata-driven fields
        List<CPW_Product_Checklist_Metadata__mdt> mappings = [
            SELECT Product_Code__c, Field_API_Name__c, Label__c, Is_Dual__c, Yes_No_Only__c, Restrict_Surest_Options__c, Display_Order__c,IsActive__c
            FROM CPW_Product_Checklist_Metadata__mdt
            ORDER BY Display_Order__c ASC
        ];

        // Step 2: Add extra fields manually (not in metadata)
        Map<String, String> extraFields = new Map<String, String>{
            'Pharmacy Benefit Administrator Name' => 'Pharmacy_Benefit_Administrator_Name__c',
            'Employee Assistance Program Name' => 'Employee_Assistance_Program_Name__c',
            'Transplant Resource Services' => 'Transplant_Resource_Services__c',
            'Utilization Management' => 'Utilization_Management__c',
            'Specialty Guidance Program' => 'Specialty_Guidance_Program_CPSurest__c',
            'Cancer Guidance Program' => 'Cancer_Guidance_Program_CPSurest__c',
            'Behavioral Health Utilization Management, ABA UM' => 'BHU_Management_ABA_UM__c',
            'Surest Case Management (CM)' => 'Surest_Case_Management_CM_CPSurest__c',
            'Optum Behavioral Network' => 'Optum_Behavioral_Network__c',
            'Optum Physical Health Network' => 'Optum_Physical_Health_Network__c',
            'Standard Communications' => 'Surest_Standard_Communications__c',
            'Surest Member Services and Surest Clinical Advocacy' => 'Surest_Member_Services__c'
        };

        String soldSoql = 'SELECT Id,' + String.join(extraFields.values(), ',') + 
                          ', Membership_Activity__c, Membership_Activity__r.AccountId, Membership_Activity__r.Account.EID_Name__c, Membership_Activity__r.Account.EID_Number__c, Membership_Activity__r.Name, Membership_Activity__r.RecordType.Name, Membership_Activity__r.RecordType.DeveloperName, Membership_Activity__r.EffectiveDate__c, One_Pass_Subsidized__c' +
                          buildMetadataSoql(mappings) +
                          ' FROM Sold_Case_Checklist__c where CPW__c = true WITH USER_MODE';

        String renewalSoql = 'SELECT Id,' + String.join(extraFields.values(), ',') +
                             ', Company__c, Company__r.Name, Company__r.EID_Name__c, Company__r.EID_Number__c, One_Pass_Subsidized__c,Client_Specific_Programs__c' +
                             buildMetadataSoql(mappings) +
                             ' FROM Renewal_Checklist__c where CPW__c = true WITH USER_MODE';

        List<SObject> soldRecords = Database.query(soldSoql);
        List<SObject> renewalRecords = Database.query(renewalSoql);

        Set<Id> accIds = new Set<Id>();
        for (SObject rec : soldRecords) {
            if (rec.getSObject('Membership_Activity__r') != null) {
                accIds.add((Id)rec.getSObject('Membership_Activity__r').get('AccountId'));
            }
        }
        for (SObject rec : renewalRecords) {
            if (rec.get('Company__c') != null) {
                accIds.add((Id)rec.get('Company__c'));
            }
        }

        Map<Id, List<Policy_Information__c>> accountPolicies = new Map<Id, List<Policy_Information__c>>();
        if (!accIds.isEmpty()) {
            for (Policy_Information__c p : [SELECT Id, Name, Policy__c, Company__c
                FROM Policy_Information__c
                WHERE Company__c IN :accIds
                AND Surest__c = true
                AND Policy_Type__c INCLUDES ('Medical')
                AND Policy_Status__c = 'Active'
            ]) {
                if (!accountPolicies.containsKey(p.Company__c)) {
                    accountPolicies.put(p.Company__c, new List<Policy_Information__c>());
                }
                accountPolicies.get(p.Company__c).add(p);
            }
        }
        
        Map<Id, List<Opportunity>> oppMap = new Map<Id, List<Opportunity>>();
        if (!accIds.isEmpty()) {
            for (Opportunity p : [ SELECT Id,Name, EffectiveDate__c, Status__c,AccountId,Account.Name FROM Opportunity WHERE AccountId IN :accIds and Status__c = 'Closed']) {
                if (!oppMap.containsKey(p.AccountId)) {
                    oppMap.put(p.AccountId, new List<Opportunity>());
                }
                oppMap.get(p.AccountId).add(p);
            }
        }
        
        Set<String> finalFieldSet = new Set<String>();

        for (SObject rec : soldRecords) {
            Id accId = null;
        
            if (rec.getSObject('Membership_Activity__r') != null) {
                accId = (Id)rec.getSObject('Membership_Activity__r').get('AccountId');
            }
        
            if (accId == null || !accountPolicies.containsKey(accId)) {
                continue; // Skip — no policy
            }
        
            // Now process metadata for this record
            for (CPW_Product_Checklist_Metadata__mdt m : mappings) {
                Boolean isActive = m.IsActive__c;
                String val = safeGet(rec, m.Field_API_Name__c);
        
                if (isActive || !String.isBlank(val)) {
                    finalFieldSet.add(m.Field_API_Name__c);
                }
            }
        }
        
        List<String> headers = new List<String>{
            escapeCsv('Customer EID Name'),
            escapeCsv('Customer EID Number'),
            escapeCsv('Business Type'),
            escapeCsv('Policy Numbers'),
            escapeCsv('Policy Names')
        };

        for (String lbl : extraFields.keySet()) {
            headers.add(escapeCsv(lbl));
        }

        for (CPW_Product_Checklist_Metadata__mdt m : mappings) {
            if (finalFieldSet.contains(m.Field_API_Name__c)) {
                headers.add(escapeCsv(String.valueOf(m.Label__c)));
                if (m.Field_API_Name__c == 'One_Pass_Select__c') {
                    headers.add(escapeCsv('One Pass Subsidized'));
                }
            }
        }
	   
        headers.add(escapeCsv('Effective Date'));
        headers.add(escapeCsv('Client Specific Programs'));
        String csv = String.join(headers, ',');


        csv += buildRows('Sold_Case_Checklist__c', soldRecords, accountPolicies, oppMap, extraFields, mappings, finalFieldSet);
        csv += buildRows('Renewal_Checklist__c', renewalRecords, accountPolicies, oppMap, extraFields, mappings, finalFieldSet);

        return csv;
    }

    // Helper: add metadata fields in SOQL
    private String buildMetadataSoql(List<CPW_Product_Checklist_Metadata__mdt> mappings) {
        List<String> fields = new List<String>();
        for (CPW_Product_Checklist_Metadata__mdt m : mappings) {
            fields.add(m.Field_API_Name__c);
        }
        return (fields.isEmpty() ? '' : ',' + String.join(fields, ','));
    }

    private String buildRows(String sourceName, List<SObject> records,
                             Map<Id, List<Policy_Information__c>> accountPolicies,
                             Map<Id, List<Opportunity>> oppMap,
                             Map<String, String> extraFields,
                             List<CPW_Product_Checklist_Metadata__mdt> mappings,
                             Set<String> finalFieldSet) {
        String out = '';
        for (SObject rec : records) {
            Id accId;
            String companyEIDName = '';
            String companyEIDNumber = '';
            String businessType = '';
            //String MA = ''; //extra
            String effectiveDate;
            
            if (sourceName == 'Sold_Case_Checklist__c') {
                if (rec.getSObject('Membership_Activity__r') != null) {
                    accId = (Id)rec.getSObject('Membership_Activity__r').get('AccountId');
                    SObject acc = rec.getSObject('Membership_Activity__r').getSObject('Account');
                    if (acc != null && acc.get('EID_Name__c') != null) {
                        companyEIDName = String.valueOf(acc.get('EID_Name__c'));
                    }
                    if (acc != null && acc.get('EID_Number__c') != null) {
                        companyEIDNumber = String.valueOf(acc.get('EID_Number__c'));
                    }
                   // MA = (String)rec.getSObject('Membership_Activity__r').get('Name');
                    Date eff = (Date) rec.getSObject('Membership_Activity__r').get('EffectiveDate__c');
                    effectiveDate = eff != null ? eff.month() + '/' + eff.day() + '/' + eff.year(): '';
                    
                    if ((String)rec.getSObject('Membership_Activity__r').getSObject('RecordType').get('DeveloperName')!=null){
                        if ((String)rec.getSObject('Membership_Activity__r').getSObject('RecordType').get('DeveloperName')=='CM'){
                         businessType = 'SCC - Existing';
                        }
                        else{
                         businessType = 'SCC - New Business';
                        }
                    }
                    //companyEIDName = (String)rec.getSObject('Membership_Activity__r').getSObject('Account').get('EID_Name__c');
                    //companyEIDNumber = (String)rec.getSObject('Membership_Activity__r').getSObject('Account').get('EID_Number__c');
				} else {
                    accId = null;
                }
               //businessType = 'SCC - New Business';
            } else {
                accId = (Id)rec.get('Company__c');
                    if (rec.getSObject('Company__r') != null && rec.getSObject('Company__r').get('EID_Name__c') != null) {
                        companyEIDName = String.valueOf(rec.getSObject('Company__r').get('EID_Name__c'));
    				}
                    if (rec.getSObject('Company__r') != null && rec.getSObject('Company__r').get('EID_Number__c') != null) {
                        companyEIDNumber = String.valueOf(rec.getSObject('Company__r').get('EID_Number__c'));
    				}
                    //companyEIDName = (String)rec.getSObject('Company__r').get('EID_Name__c');
                    //companyEIDNumber = (String)rec.getSObject('Company__r').get('EID_Number__c');
                	businessType = 'PCC - Existing/Renewals';
                                 
                List<Opportunity> oppList = (accId != null && oppMap.containsKey(accId))? oppMap.get(accId) : new List<Opportunity>();
                Date maxClosedMA = null;

                for (Opportunity ma1 : oppList) {
                    if (maxClosedMA == null || ma1.EffectiveDate__c > maxClosedMA) {
                        maxClosedMA = ma1.EffectiveDate__c;
                        system.debug('maxClosedMA'+ ma1.EffectiveDate__c + 'AccountName'+ ma1.Account.Name +'oppname'+ma1.Name);
                    }
                }
            
                if (maxClosedMA != null) {
                    effectiveDate = maxClosedMA.month() + '/' + maxClosedMA.day() + '/' + maxClosedMA.year();
                }
                else{
                    effectiveDate = ' ';
                } 
            }

            List<Policy_Information__c> pols = (accId != null && accountPolicies.containsKey(accId))
                ? accountPolicies.get(accId)
                : new List<Policy_Information__c>();

            if (pols.isEmpty()) {
                continue; // ✅ skip if no policies
            }

            List<String> policyNumbers = new List<String>();
            List<String> policyNames = new List<String>();
            for (Policy_Information__c p : pols) {
                if (p.Name != null) policyNumbers.add(p.Name);
                if (p.Policy__c != null) policyNames.add(p.Policy__c);
            }

            if (policyNumbers.isEmpty() && policyNames.isEmpty()) {
                continue; // ✅ skip if no values
            }

            List<String> row = new List<String>();
            
             // Policies
            row.add('"' + companyEIDName.replace('"','""') + '"');
            row.add('"' + companyEIDNumber.replace('"','""') + '"');
            row.add('"' + businessType.replace('"','""') + '"');
            //row.add('"' + MA.replace('"','""') + '"');
			row.add('"' + String.valueOf(String.join(policyNumbers, '; ')) + '"');
            row.add('"' + String.join(policyNames, '; ') + '"');
            
            // Extra fields
            for (String apiName : extraFields.values()) {
                String val = safeGet(rec, apiName);
                row.add('"' + val.replace('"','""') + '"');
            }

            // Metadata-driven fields
            for (CPW_Product_Checklist_Metadata__mdt m : mappings) {
				if (!finalFieldSet.contains(m.Field_API_Name__c)) {
                    continue; // Skip this metadata field entirely
                }
                String val = safeGet(rec, m.Field_API_Name__c);                
                row.add('"' + val.replace('"','""') + '"');
                if (m.Field_API_Name__c == 'One_Pass_Select__c') {
                    String subsidized = rec.get('One_Pass_Subsidized__c') != null ? String.valueOf(rec.get('One_Pass_Subsidized__c')): '';
                    row.add('"' + subsidized.replace('"','""') + '"');
            	}
            }
            row.add('="' + String.valueOf(effectiveDate) + '"');
            String csp = safeGet(rec, 'Client_Specific_Programs__c');
            row.add('"' + csp.replace('"','""') + '"');
            out += '\n' + String.join(row, ',');
        }
        return out;
    }

    private static String escapeCsv(String value) {
        if (value == null) return '""';
        String escaped = value.replace('"', '""');
        return '"' + escaped + '"';
    }

    private String safeGet(SObject rec, String apiName) {
        try {
            Object rawVal = rec.get(apiName);
            return (rawVal != null) ? String.valueOf(rawVal) : '';
        } catch (Exception e) {
            return '';
        }
    }
    
    private String cleanString(String input) {
        if (String.isBlank(input)) return '';
        // Replace smart quotes and other non-ASCII with normal equivalents
        String cleaned = input
            .replace('’', '\'')  
            .replace('‘', '\'')  
            .replace('“', '\"')  
            .replace('”', '\"')  
            .replaceAll('[^\\x20-\\x7E]', ''); // removes non-ASCII chars
        return cleaned;
    }
    
}