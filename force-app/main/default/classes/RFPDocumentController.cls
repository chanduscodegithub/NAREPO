/****************************************************************** ***** 
Name: RFPDocumentController 
Copyright © 2025 CRMIT Solutions Company Inc.  
====================================================== 
======================================================  
* Purpose      : (LWC) Visualforce controller for generating, sorting, and 
*                downloading RFP question-answer data as a document.
*                Includes logic to filter finalized/strategic responses,
*                and audit downloads. 
*                Used by Visualforce or Aura components to prepare
*                Smart Analyzer-style documents from RFP data.
======================================================  
History 
------- 
VERSION      AUTHOR                DATE                DETAIL              FEATURES/CSR/TTP  
1.0 -      CRMIT Solutions       23/06/2025      INITIAL DEVELOPMENT     

**********************************************************************/


	public with sharing class RFPDocumentController {

    // -------------------
    // Document Metadata
    // -------------------
    public Id rfpId { get; set; }
    public String rfpName { get; set; }
    public String membershipActivityName { get; set; }
    public String primaryConsultant { get; set; }
    public String generatedByUserName { get; set; }
    public String generatedDateTime { get; set; }
    public String documentFileName { get; set; }

    // -------------------
    // Question Tracking
    // -------------------
    public List<RFP_Question_And_Answer__c> questions { get; set; }

    public Integer totalCount { get; set; }
    public Integer finalizedCount { get; set; }
    public Integer notFinalizedCount { get; set; }
    public Integer totalStrategicQuestionsCount { get; set; }
    public Integer strategicFinalized { get; set; }
    public Integer strategicNotFinalized { get; set; }
    public Integer totalNonStrategicQuestionsCount { get; set; }
    public Integer nonStrategicFinalized { get; set; }
    public Integer nonStrategicNotFinalized { get; set; }

    // -------------------
    // Download Options
    // -------------------
    public Boolean isDownload { get; set; }
    public Boolean downloadOnlyFinalized { get; set; }
    public String questionFilterType { get; set; }

    // -------------------
    // INIT METHOD
    // -------------------
    public PageReference init() {
        try {
            parsePageParameters();

            RFP__c rfp = fetchRFP();
            setDocumentMetadata(rfp);

            documentFileName = getDocumentFileName(rfpId);

            // Fetch filtered questions and set stats consistently
            questions = getFilteredQuestions(rfpId, downloadOnlyFinalized, questionFilterType);
            setQuestionStatsFromQuestions(questions);

            return null;
        } catch(Exception e) {
            ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR,
                'Error generating document: ' + e.getMessage()));
            return null;
        }
    }

    // -------------------
    // PARAMETER PARSING
    // -------------------
    private void parsePageParameters() {
        rfpId = ApexPages.currentPage().getParameters().get('id');
        if (rfpId == null) {
            throw new AuraHandledException('RFP Id is required.');
        }

        isDownload = Boolean.valueOf(ApexPages.currentPage().getParameters().get('download'));
        downloadOnlyFinalized = Boolean.valueOf(ApexPages.currentPage().getParameters().get('finalizedOnly'));
        questionFilterType = ApexPages.currentPage().getParameters().get('questionFilterType');
    }

    // -------------------
    // FETCH RFP
    // -------------------
    private RFP__c fetchRFP() {
        List<RFP__c> rfpList = [
            SELECT Id, Name,
                   Membership_Activity__r.Name,
                   Membership_Activity__r.PrimaryConsultant__r.Name
            FROM RFP__c
            WHERE Id = :rfpId
            LIMIT 1
        ];
        if (rfpList.isEmpty()) {
            throw new AuraHandledException('RFP not found.');
        }
        return rfpList[0];
    }

    // -------------------
    // DOCUMENT METADATA
    // -------------------
    private void setDocumentMetadata(RFP__c rfp) {
        rfpName = rfp.Name;
        membershipActivityName = rfp.Membership_Activity__r?.Name;
        primaryConsultant = rfp.Membership_Activity__r?.PrimaryConsultant__r?.Name;
        generatedByUserName = UserInfo.getName();
        generatedDateTime = DateTime.now().format('M/d/yyyy HH:mm');
    }

    // -------------------
    // GENERATE DOCUMENT FILE NAME
    // -------------------
    @AuraEnabled(cacheable=true)
    public static String getDocumentFileName(Id rfpId) {
        String defaultName = 'RFP_Answers_' + DateTime.now().format('yyyyMMdd');

        List<ContentDocumentLink> cdlList = [
            SELECT ContentDocumentId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :rfpId
            LIMIT 1
        ];

        if (!cdlList.isEmpty()) {
            Set<Id> docIds = new Set<Id>();
            for (ContentDocumentLink cdl : cdlList) docIds.add(cdl.ContentDocumentId);

            List<ContentVersion> cvs = [
                SELECT Title, PathOnClient, CreatedDate
                FROM ContentVersion
                WHERE ContentDocumentId IN :docIds
                ORDER BY CreatedDate DESC, VersionNumber DESC
                LIMIT 1
            ];

            if (!cvs.isEmpty()) {
                ContentVersion cv = cvs[0];
                String name = String.isNotBlank(cv.PathOnClient) ? cv.PathOnClient : cv.Title;
                name = name.substringBeforeLast('.');
                name = String.isBlank(name) ? defaultName : name.replaceAll('[^a-zA-Z0-9_\\- ]', '_').trim().replace(' ', '_');
                if (name.length() > 200) name = name.substring(0, 200);
                return name + ' (generated by Smart Analyzer)';
            }
        }

        return defaultName + ' (generated by Smart Analyzer)';
    }

    // -------------------
    // FETCH FILTERED QUESTIONS
    // -------------------
    @AuraEnabled
    public static List<RFP_Question_And_Answer__c> getFilteredQuestions(Id rfpId, Boolean finalizedOnly, String questionFilterType) {
        String query = 'SELECT Id, RFP_Question_Number__c, RFP_Question__c, Final_Answer__c, Proposal_Gateway_Response__c, Rephrased_Response__c, IsFinalised__c, IsStrategicQuestion__c, Sheet_Name__c ' +
                       'FROM RFP_Question_And_Answer__c WHERE RFP__c = :rfpId AND Tabular_Record__c = false';

        if (finalizedOnly) query += ' AND IsFinalised__c = true';
        if (questionFilterType == 'strategic') query += ' AND IsStrategicQuestion__c = true';
        else if (questionFilterType == 'non-strategic') query += ' AND (IsStrategicQuestion__c = false OR IsStrategicQuestion__c = null)';

        List<RFP_Question_And_Answer__c> allQuestions = Database.query(query);
        List<RFP_Question_And_Answer__c> filteredQuestions = new List<RFP_Question_And_Answer__c>();

        for (RFP_Question_And_Answer__c q : allQuestions) {
            if (!String.isBlank(q.Proposal_Gateway_Response__c)) {
                filteredQuestions.add(q);
            }
        }

        filteredQuestions.sort(new QuestionNumberComparator());
        return filteredQuestions;
    }

    // -------------------
    // SET QUESTION STATS FROM QUESTIONS
    // -------------------
    private void setQuestionStatsFromQuestions(List<RFP_Question_And_Answer__c> filteredQuestions) {
        totalCount = finalizedCount = notFinalizedCount = 0;
        totalStrategicQuestionsCount = strategicFinalized = strategicNotFinalized = 0;
        totalNonStrategicQuestionsCount = nonStrategicFinalized = nonStrategicNotFinalized = 0;

        for (RFP_Question_And_Answer__c q : filteredQuestions) {
            Boolean isStrategic = q.IsStrategicQuestion__c == true;
            Boolean isFinal = q.IsFinalised__c == true;

            totalCount++;
            if (isFinal) finalizedCount++;

            if (isStrategic) {
                totalStrategicQuestionsCount++;
                if (isFinal) strategicFinalized++;
            } else {
                totalNonStrategicQuestionsCount++;
                if (isFinal) nonStrategicFinalized++;
            }
        }

        notFinalizedCount = totalCount - finalizedCount;
        strategicNotFinalized = totalStrategicQuestionsCount - strategicFinalized;
        nonStrategicNotFinalized = totalNonStrategicQuestionsCount - nonStrategicFinalized;
    }

    // -------------------
    // QUESTION NUMBER COMPARATOR
    // -------------------
    public class QuestionNumberComparator implements Comparator<RFP_Question_And_Answer__c> {
        public Integer compare(RFP_Question_And_Answer__c q1, RFP_Question_And_Answer__c q2) {
            return compareQuestionNumbers(q1.RFP_Question_Number__c, q2.RFP_Question_Number__c);
        }

        private Integer compareQuestionNumbers(String num1, String num2) {
            num1 = num1 != null ? num1.trim() : '';
            num2 = num2 != null ? num2.trim() : '';

            if (String.isEmpty(num1) && String.isEmpty(num2)) return 0;
            if (String.isEmpty(num1)) return -1;
            if (String.isEmpty(num2)) return 1;

            List<String> parts1 = num1.split('\\.');
            List<String> parts2 = num2.split('\\.');
            Integer minParts = Math.min(parts1.size(), parts2.size());

            for (Integer i = 0; i < minParts; i++) {
                Integer val1 = 0, val2 = 0;
                Boolean isNum1 = true, isNum2 = true;

                try { val1 = Integer.valueOf(parts1[i]); } catch(Exception e){ isNum1=false; }
                try { val2 = Integer.valueOf(parts2[i]); } catch(Exception e){ isNum2=false; }

                if (isNum1 && isNum2) { if (val1 != val2) return val1 - val2; }
                else if (!isNum1 && !isNum2) { Integer cmp = parts1[i].compareTo(parts2[i]); if (cmp != 0) return cmp; }
                else return isNum1 ? -1 : 1;
            }

            return parts1.size() - parts2.size();
        }
    }

    // -------------------
    // DOWNLOAD AUDIT
    // -------------------
    @AuraEnabled
    public static void downloadAudit(String downloadType, Integer numberOfQuestions, Id rfpId) {
        try {
            insert new RFP_Download_Audit__c(
                Download_Option__c = downloadType,
                RFP__c = rfpId
            );
        } catch (Exception e) {
            // Optionally log error
            System.debug('Download Audit failed: ' + e.getMessage());
        }
    }

    // -------------------
    // GET QUESTION STATS FOR AURA
    // -------------------
    @AuraEnabled
    public static Map<String, Integer> getQuestionStats(Id rfpId) {
        List<RFP_Question_And_Answer__c> filteredQuestions = getFilteredQuestions(rfpId, false, null);

        RFPDocumentController controller = new RFPDocumentController();
        controller.setQuestionStatsFromQuestions(filteredQuestions);

        return new Map<String, Integer>{
            'totalCount' => controller.totalCount,
            'finalizedCount' => controller.finalizedCount,
            'notFinalizedCount' => controller.notFinalizedCount,
            'totalStrategicQuestionsCount' => controller.totalStrategicQuestionsCount,
            'strategicFinalized' => controller.strategicFinalized,
            'strategicNotFinalized' => controller.strategicNotFinalized,
            'totalNonStrategicQuestionsCount'=> controller.totalNonStrategicQuestionsCount,
            'nonStrategicFinalized' => controller.nonStrategicFinalized,
            'nonStrategicNotFinalized' => controller.nonStrategicNotFinalized
        };
    }
}