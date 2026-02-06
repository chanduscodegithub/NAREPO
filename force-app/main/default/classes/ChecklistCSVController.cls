public with sharing class ChecklistCSVController {
    @AuraEnabled(cacheable=false)
    public static String getCsvContentLwc() {
        ChecklistCSVController ctrl = new ChecklistCSVController();
        return ctrl.getCsvContent(); // reuse your existing generator
    }

    public String getCsvContent() {
        // Step 1: Get metadata-driven fields
        List<CPW_Product_Checklist_Metadata__mdt> mappings = [
            SELECT Product_Code__c, Field_API_Name__c, Label__c, Is_Dual__c, Yes_No_Only__c, Display_Order__c,IsActive__c
            FROM CPW_Product_Checklist_Metadata__mdt
            ORDER BY Display_Order__c ASC
        ];

        // Step 2: Add extra fields manually (not in metadata)
        Map<String, String> extraFields = new Map<String, String>{
            'Pharmacy Benefit Administrator Name' => 'Pharmacy_Benefit_Administrator_Name__c',
            'Pharmacy Benefit Administrator Phone #' => 'Pharmacy_Benefit_Administrator_Phone__c',
            'Employee Assistance Program Name' => 'Employee_Assistance_Program_Name__c',
            'Employee Assistance Program Phone #' => 'Employee_Assistance_Program_Phone__c',
            'Transplant Resource Services' => 'Transplant_Resource_Services__c',
            'Utilization Management' => 'Utilization_Management__c',
            'Specialty Guidance Program' => 'Specialty_Guidance_Program_CPSurest__c',
            'Cancer Guidance Program' => 'Cancer_Guidance_Program_CPSurest__c',
            'Behavioral Health Utilization Management ABA UM' => 'BHU_Management_ABA_UM__c',
            'Surest Case Management (CM)' => 'Surest_Case_Management_CM_CPSurest__c',
            'Optum Behavioral Network' => 'Optum_Behavioral_Network__c',
            'Optum Physical Health Network' => 'Optum_Physical_Health_Network__c'
        };

        String soldSoql = 'SELECT Id,' + String.join(extraFields.values(), ',') + 
                          ', Membership_Activity__c, Membership_Activity__r.AccountId, Membership_Activity__r.Account.EID_Name__c, Membership_Activity__r.Account.EID_Number__c, Membership_Activity__r.Name, Membership_Activity__r.RecordType.Name, One_Pass_Subsidized__c' +
                          buildMetadataSoql(mappings) +
                          ' FROM Sold_Case_Checklist__c where CPW__c = true';

        String renewalSoql = 'SELECT Id,' + String.join(extraFields.values(), ',') +
                             ', Company__c, Company__r.Name, Company__r.EID_Name__c, Company__r.EID_Number__c, One_Pass_Subsidized__c' +
                             buildMetadataSoql(mappings) +
                             ' FROM Renewal_Checklist__c where CPW__c = true';

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
        List<String> headers = new List<String>();
        headers.add('Customer EID Name');
        headers.add('Customer EID Number');
        headers.add('Business Type');
        headers.add('MA Name'); //extra
        headers.add('Policy Numbers');
        headers.add('Policy Names');

        for (String lbl : extraFields.keySet()) {
            headers.add(cleanString(lbl));
        }
        for (CPW_Product_Checklist_Metadata__mdt m : mappings) {
            if (finalFieldSet.contains(m.Field_API_Name__c)) {
                headers.add(cleanString(m.Label__c));
            }
        }
        Integer insertIndex = 6 + extraFields.size() + 38; 
		headers.add(insertIndex, 'One Pass Subsidized');

        String csv = String.join(headers, ',');


        csv += buildRows('Sold_Case_Checklist__c', soldRecords, accountPolicies, extraFields, mappings, finalFieldSet);
        csv += buildRows('Renewal_Checklist__c', renewalRecords, accountPolicies, extraFields, mappings, finalFieldSet);

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
                             Map<String, String> extraFields,
                             List<CPW_Product_Checklist_Metadata__mdt> mappings,
                             Set<String> finalFieldSet) {
        String out = '';
        for (SObject rec : records) {
            Id accId;
            String companyEIDName = '';
            String companyEIDNumber = '';
            String businessType = '';
            String MA = ''; //extra
            Integer insertIndex1 = 6 + extraFields.size() + 38;
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
                    MA = (String)rec.getSObject('Membership_Activity__r').get('Name');
                    if ((String)rec.getSObject('Membership_Activity__r').getSObject('RecordType').get('Name')!=null){
                        if ((String)rec.getSObject('Membership_Activity__r').getSObject('RecordType').get('Name')=='CM Membership Activity (Existing Client)'){
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
            row.add('"' + MA.replace('"','""') + '"');
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
            }
            row.add(insertIndex1, rec.get('One_Pass_Subsidized__c') != null ? String.valueOf(rec.get('One_Pass_Subsidized__c')) : '');
            out += '\n' + String.join(row, ',');
        }
        return out;
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