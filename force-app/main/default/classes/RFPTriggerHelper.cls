// /****************************************************************** *****
// Name: RFPTriggerHelper.cls
// Copyright © 2025 CRMIT Solutions Company Inc.  
// ======================================================
// ======================================================  
// Purpose: This helper class drives the processing logic for RFP__c records based on selected flow modes—
// *        StrategicOnly, StandardOnly, or Both. It orchestrates the invocation of strategic and standard
// *        batch processors, prepares product blobs, and builds mapping between Opportunities and Strategic Questions.
// ======================================================
// ======================================================  
// History
// -------
// VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
// 1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT      Handle Trigger events

// *********************************************************************
// */


public with sharing class RFPTriggerHelper {

    // Enum representing the modes in which RFPs can be processed.
    public enum RFPFlowMode {
        StrategicOnly,
        StandardOnly,
        Both
    }

    public static void processRfpChunk(List<RFP__c> rfpList, RFPFlowMode flowMode, String reason) {
        if (rfpList == null || rfpList.isEmpty()) return;

        // Build RFP -> parsed strategic tokens map (tokens will be either "QNO" for word
        // or "SheetName|QNO" for excel)
        Map<Id, Set<String>> rfpToStrategicQNoMap = getRfpStrategyMap(rfpList);

        // Collect Opportunity Ids (Membership_Activity__c) to fetch strategy memos and others
        Set<Id> oppIdSet = new Set<Id>();
        for (RFP__c r : rfpList) {
            if (r.Membership_Activity__c != null) oppIdSet.add(r.Membership_Activity__c);
        }

        Map<Id, Strategy_Memo__c> oppStrategyMemoMap = getStrategyMemoMap(new List<Id>(oppIdSet));      // Fetch Strategy Memo Data
        String blobOfAllActiveProducts = getAllActiveProductsAsBlob();

        if (flowMode == RFPFlowMode.StrategicOnly || flowMode == RFPFlowMode.Both) {
            SA_StrategyProcessor processor = new SA_StrategyProcessor();
            // Pass the rfpList and the RFP->strategic tokens map
            processor.processStrategicQuestions(rfpList, rfpToStrategicQNoMap, oppStrategyMemoMap, reason, blobOfAllActiveProducts);
        }

        if (flowMode == RFPFlowMode.Both) {
            Database.executeBatch(new SA_StandardBatchProcessor2(rfpList, oppStrategyMemoMap, blobOfAllActiveProducts, SA_StandardBatchProcessor2.RunMode.Standard), 20);
        }

        if (flowMode == RFPFlowMode.StandardOnly) {
            Database.executeBatch(new SA_StandardBatchProcessor2(rfpList, oppStrategyMemoMap, blobOfAllActiveProducts, SA_StandardBatchProcessor2.RunMode.Strategic), 20);
        }
    }

    /**
     * Parse Strategic_Question_No__c per-RFP. Returns a map keyed by RFP Id,
     * each value is a Set<String> of tokens that represent strategic questions for that RFP.
     *
     * Tokens:
     *  - For word/normal files: "QUESTION_NO" (e.g. "3", "2a")
     *  - For excel files: "SHEET_NAME|QUESTION_NO" (e.g. "Sheet1|1.1.2")
     *
     * We use the RFP.File_Type__c to decide whether to parse as excel style or normal.
     */
    public static Map<Id, Set<String>> getRfpStrategyMap(List<RFP__c> rfpList) {
        Map<Id, Set<String>> rfpMap = new Map<Id, Set<String>>();
        if (rfpList == null || rfpList.isEmpty()) return rfpMap;

        // Build set of opp ids to query their Strategy Memo(s)
        Set<Id> oppIds = new Set<Id>();
        for (RFP__c r : rfpList) {
            if (r.Membership_Activity__c != null) oppIds.add(r.Membership_Activity__c);
        }

        if (oppIds.isEmpty()) {
            // still initialize empty sets for each RFP
            for (RFP__c r : rfpList) rfpMap.put(r.Id, new Set<String>());
            return rfpMap;
        }

        // Query Strategy_Memo__c by Membership_Activity__c (Opportunity)
        // We expect one memo per opportunity; if multiple, we'll merge them (concatenate tokens).
        Map<Id, List<Strategy_Memo__c>> oppToMemos = new Map<Id, List<Strategy_Memo__c>>();
        for (Strategy_Memo__c memo : [
            SELECT Id, Membership_Activity__c, Strategic_Question_No__c
            FROM Strategy_Memo__c
            WHERE Membership_Activity__c IN :oppIds
        ]) {
            if (!oppToMemos.containsKey(memo.Membership_Activity__c)) oppToMemos.put(memo.Membership_Activity__c, new List<Strategy_Memo__c>());
            oppToMemos.get(memo.Membership_Activity__c).add(memo);
        }

        // For each RFP, pick the memo(s) for its Opportunity and parse according to file type
        for (RFP__c r : rfpList) {
            Set<String> tokens = new Set<String>();
            // Default: if no memo, empty set
            if (r.Membership_Activity__c != null && oppToMemos.containsKey(r.Membership_Activity__c)) {
                List<Strategy_Memo__c> memos = oppToMemos.get(r.Membership_Activity__c);
                // Combine all strategic strings from memos
                String combined = '';
                for (Strategy_Memo__c m : memos) {
                    if (String.isNotBlank(m.Strategic_Question_No__c)) {
                        if (combined == '') combined = m.Strategic_Question_No__c;
                        else combined += ',' + m.Strategic_Question_No__c;
                    }
                }
                if (String.isNotBlank(combined)) {
                    // Decide parsing mode by RFP.File_Type__c
                    String fileType = (r.File_Type__c == null) ? '' : r.File_Type__c.toLowerCase();
                    Boolean isExcel = fileType.contains('excel') || fileType.contains('xls') || fileType.contains('xlsx');
                    if (isExcel) {
                        tokens.addAll(parseExcelStyleStrategicString(combined));
                    } else {
                        // Normal word-like comma separated values
                        for (String q : combined.split(',')) {
                            if (String.isNotBlank(q)) tokens.add(q.trim());
                        }
                    }
                }
            }
            rfpMap.put(r.Id, tokens);
        }
        return rfpMap;
    }

   
    public static Set<String> parseExcelStyleStrategicString(String input) {
        Set<String> tokens = new Set<String>();
        if (String.isBlank(input)) return tokens;

        Integer len = input.length();
        Integer idx = 0;

        while (idx < len) {
            // Skip whitespace and commas by peeking the single-character substring
            while (idx < len) {
                String ch = input.substring(idx, idx + 1);
                if (ch == ',' || ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r' || ch == '\f') {
                    idx++;
                    continue;
                }
                break;
            }
            if (idx >= len) break;

            // Find next '(' from idx
            Integer openIdx = input.indexOf('(', idx);
            if (openIdx == -1) break; // no more valid groups

            // sheet name is substring idx..openIdx-1 (trimmed)
            String sheetName = input.substring(idx, openIdx).trim();

            // Find closing ')'. If not found, use len (substring end is exclusive, so it's safe)
            Integer closeIdx = input.indexOf(')', openIdx + 1);
            if (closeIdx == -1) {
                closeIdx = len;
            }

            // Extract numbers between parentheses (or to end if malformed)
            // substring(start, end) requires 0 <= start < = end <= len, which we ensure
            String nums = '';
            if (openIdx + 1 <= closeIdx) {
                nums = input.substring(openIdx + 1, closeIdx).trim();
            }

            if (String.isNotBlank(sheetName) && String.isNotBlank(nums)) {
                for (String n : nums.split(',')) {
                    if (String.isNotBlank(n)) {
                        String token = sheetName + '|' + n.trim();
                        tokens.add(token);
                    }
                }
            }

            // Advance idx to after closeIdx
            idx = closeIdx + 1;
        }

        return tokens;
    }


    public static Map<Id, Strategy_Memo__c> getStrategyMemoMap(List<Id> oppIds) {
        Map<Id, Strategy_Memo__c> oppMemoMap = new Map<Id, Strategy_Memo__c>();
        if (oppIds == null || oppIds.isEmpty()) return oppMemoMap;
        for (Strategy_Memo__c memo : [
            SELECT Id, Strategic_Question_No__c, People__c, Company_Name_as_per_RFP__c, Membership_Activity__c
            FROM Strategy_Memo__c
            WHERE Membership_Activity__c IN :oppIds
        ]) {
            // If multiple memos exist per opportunity, last one will win here.
            oppMemoMap.put(memo.Membership_Activity__c, memo);
        }
        return oppMemoMap;
    }

    public static String getAllActiveProductsAsBlob() {
        List<String> names = new List<String>();
        for (Product2 p : [SELECT Name FROM Product2 WHERE IsActive = true]) {
            if (String.isNotBlank(p.Name)) names.add(p.Name.trim());
        }
        return String.join(names, '\n');
    }
}