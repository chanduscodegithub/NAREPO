@isTest
public class RFPDocumentControllerTest {

    @testSetup
    static void setupTestData() {
        Account acc = new Account(
            Name = 'Test Method Account',
            Subtype__c = 'Private Exchange',
            Type = 'Customer'
        );
        insert acc;

        Opportunity testOpp = new Opportunity(
            Name = 'Test Opportunity',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30), 
            AccountId = acc.Id,
            Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes',
            Exchanges_the_Company_is_Looking_At__c = 'Aon Benefit Experience',
            Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes'
            //PrimaryConsultant__c = UserInfo.getUserId()
        );
        insert testOpp;
    }

    // Helper to create RFP__c for tests
    private static RFP__c createTestRFP(String status) {
        Opportunity testOpp = [SELECT Id FROM Opportunity LIMIT 1];
        RFP__c rfp = new RFP__c(
            Membership_Activity__c = testOpp.Id,
            Stage__c = 'New',
            FailedChunks__c = 0
        ); 
        insert rfp;
        return rfp;
    }

    @isTest
    static void testInitWithContentDocument() {
        RFP__c rfp = createTestRFP('New');
        List<RFP_Question_And_Answer__c> questions = new List<RFP_Question_And_Answer__c>{
            new RFP_Question_And_Answer__c(RFP__c=rfp.Id, RFP_Question_Number__c='1.1', IsFinalised__c=true, IsStrategicQuestion__c=true),
            new RFP_Question_And_Answer__c(RFP__c=rfp.Id, RFP_Question_Number__c='2.1', IsFinalised__c=false, IsStrategicQuestion__c=false)
        };
        insert questions;

        ContentVersion cv = new ContentVersion(
            Title='TestDoc', PathOnClient='TestDoc.docx', VersionData=Blob.valueOf('abc')
        );
        insert cv;
        cv = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id];
        ContentDocumentLink cdl = new ContentDocumentLink(
            ContentDocumentId=cv.ContentDocumentId, LinkedEntityId=rfp.Id, ShareType='V'
        );
        insert cdl;

        Test.setCurrentPage(new ApexPages.PageReference('/apex/RFPDocument'));
        ApexPages.currentPage().getParameters().put('id', rfp.Id);
        ApexPages.currentPage().getParameters().put('download', 'true');
        ApexPages.currentPage().getParameters().put('finalizedOnly', 'true');
        ApexPages.currentPage().getParameters().put('questionFilterType', 'strategic');

        Test.startTest();
        RFPDocumentController ctrl = new RFPDocumentController();
        ctrl.init();
        Test.stopTest();

    /*    System.assertEquals(rfp.Id, ctrl.rfpId);
        System.assert(ctrl.documentFileName != null);
        System.assertEquals(2, ctrl.totalCount);
        System.assertEquals(1, ctrl.finalizedCount);
        System.assertEquals(1, ctrl.notFinalizedCount);
        System.assertEquals(1, ctrl.totalStrategicQuestionsCount);
        System.assertEquals(1, ctrl.strategicFinalized);
        System.assertEquals(0, ctrl.strategicNotFinalized);
        System.assertEquals(1, ctrl.totalNonStrategicQuestionsCount);
        System.assertEquals(0, ctrl.nonStrategicFinalized);
        System.assertEquals(1, ctrl.nonStrategicNotFinalized); */
    }

    @isTest
    static void testInitWithoutContentDocument() {
        RFP__c rfp = createTestRFP('Draft');
        RFP_Question_And_Answer__c q = new RFP_Question_And_Answer__c(RFP__c=rfp.Id, RFP_Question_Number__c='3.1', IsFinalised__c=false, IsStrategicQuestion__c=false);
        insert q;
        Test.setCurrentPage(new ApexPages.PageReference('/apex/RFPDocument'));
        ApexPages.currentPage().getParameters().put('id', rfp.Id);
        ApexPages.currentPage().getParameters().put('download', 'false');
        ApexPages.currentPage().getParameters().put('finalizedOnly', 'false');
        ApexPages.currentPage().getParameters().put('questionFilterType', 'all');
        Test.startTest();
        RFPDocumentController ctrl = new RFPDocumentController();
        ctrl.init();
        Test.stopTest();
        System.assert(ctrl.documentFileName.startsWith('RFP_Answers_'));
    }

    @isTest
    static void testInitWithNonStrategicFilter() {
        RFP__c rfp = createTestRFP('Draft');
        insert new RFP_Question_And_Answer__c(RFP__c=rfp.Id, RFP_Question_Number__c='1', IsFinalised__c=true, IsStrategicQuestion__c=false);
        insert new RFP_Question_And_Answer__c(RFP__c=rfp.Id, RFP_Question_Number__c='2', IsFinalised__c=false, IsStrategicQuestion__c=true);

        Test.setCurrentPage(new ApexPages.PageReference('/apex/RFPDocument'));
        ApexPages.currentPage().getParameters().put('id', rfp.Id);
        ApexPages.currentPage().getParameters().put('download', 'false');
        ApexPages.currentPage().getParameters().put('finalizedOnly', 'false');
        ApexPages.currentPage().getParameters().put('questionFilterType', 'non-strategic');
        Test.startTest();
        RFPDocumentController ctrl = new RFPDocumentController();
        ctrl.init();
        Test.stopTest();
    }

    @isTest
    static void testInitHandlesException() {
        Test.setCurrentPage(new ApexPages.PageReference('/apex/RFPDocument'));
        ApexPages.currentPage().getParameters().put('id', 'a00xxxxxxxxxxxx');
        Test.startTest();
        RFPDocumentController ctrl = new RFPDocumentController();
        ctrl.init();
        Test.stopTest();
        System.assertEquals(null, ctrl.rfpName);
    }

    @isTest
    static void testGetQuestionStats() {
        RFP__c rfp = createTestRFP('Draft');
        List<RFP_Question_And_Answer__c> qas = new List<RFP_Question_And_Answer__c>{
            new RFP_Question_And_Answer__c(RFP__c=rfp.Id, IsFinalised__c=true, IsStrategicQuestion__c=true),
            new RFP_Question_And_Answer__c(RFP__c=rfp.Id, IsFinalised__c=false, IsStrategicQuestion__c=true),
            new RFP_Question_And_Answer__c(RFP__c=rfp.Id, IsFinalised__c=true, IsStrategicQuestion__c=false),
            new RFP_Question_And_Answer__c(RFP__c=rfp.Id, IsFinalised__c=false, IsStrategicQuestion__c=false)
        };
        insert qas;
        Map<String, Integer> stats = RFPDocumentController.getQuestionStats(rfp.Id);
    /*   System.assertEquals(4, stats.get('totalCount'));
        System.assertEquals(2, stats.get('finalizedCount'));
        System.assertEquals(2, stats.get('notFinalizedCount'));
        System.assertEquals(2, stats.get('totalStrategicQuestionsCount'));
        System.assertEquals(1, stats.get('strategicFinalized'));
        System.assertEquals(1, stats.get('strategicNotFinalized'));
        System.assertEquals(2, stats.get('totalNonStrategicQuestionsCount'));
        System.assertEquals(1, stats.get('nonStrategicFinalized'));
        System.assertEquals(1, stats.get('nonStrategicNotFinalized')); */
    }

    @isTest
    static void testDownloadAudit() {
        RFP__c rfp = createTestRFP('Audit');
        Test.startTest();
        RFPDocumentController.downloadAudit('All Finalized Answers', 5, rfp.Id);
        Test.stopTest();
        List<RFP_Download_Audit__c> audits = [SELECT Id, Download_Option__c, RFP__c FROM RFP_Download_Audit__c WHERE RFP__c = :rfp.Id];
        System.assertEquals(1, audits.size());
        System.assertEquals('All Finalized Answers', audits[0].Download_Option__c);
    }

    @isTest
    static void testInitWithLongFilename() {
        RFP__c rfp = createTestRFP('LongFile');
        RFP_Question_And_Answer__c qa = new RFP_Question_And_Answer__c(
            RFP__c=rfp.Id, RFP_Question_Number__c='3.1', IsFinalised__c=true, IsStrategicQuestion__c=false
        );
        insert qa;

        String longTitle = 'Doc' + String.valueOf(Crypto.getRandomLong()).repeat(5);
        ContentVersion cv = new ContentVersion(
            Title=longTitle,
            PathOnClient=longTitle + '.docx',
            VersionData=Blob.valueOf('abc')
        );
        insert cv;
        cv = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id];
        ContentDocumentLink cdl = new ContentDocumentLink(
            ContentDocumentId=cv.ContentDocumentId, LinkedEntityId=rfp.Id, ShareType='V'
        );
        insert cdl;

        Test.setCurrentPage(new ApexPages.PageReference('/apex/RFPDocument'));
        ApexPages.currentPage().getParameters().put('id', rfp.Id);
        ApexPages.currentPage().getParameters().put('download', 'true');
        ApexPages.currentPage().getParameters().put('finalizedOnly', 'true');
        ApexPages.currentPage().getParameters().put('questionFilterType', 'all');

        Test.startTest();
        RFPDocumentController ctrl = new RFPDocumentController();
        ctrl.init();
        Test.stopTest();

        System.assert(ctrl.documentFileName.length() <= 230, 'Filename should be truncated and safe');
    }

    @isTest
    static void testQuestionNumberComparator() {
        RFP_Question_And_Answer__c q1 = new RFP_Question_And_Answer__c(RFP_Question_Number__c = '1.1');
        RFP_Question_And_Answer__c q2 = new RFP_Question_And_Answer__c(RFP_Question_Number__c = '1.10');
        RFP_Question_And_Answer__c q3 = new RFP_Question_And_Answer__c(RFP_Question_Number__c = '1.2');
        RFP_Question_And_Answer__c q4 = new RFP_Question_And_Answer__c(RFP_Question_Number__c = '2');
        RFP_Question_And_Answer__c q5 = new RFP_Question_And_Answer__c(RFP_Question_Number__c = '1.2.1');
        List<RFP_Question_And_Answer__c> questions = new List<RFP_Question_And_Answer__c>{q2, q3, q1, q4, q5};
        questions.sort(new RFPDocumentController.QuestionNumberComparator());
        System.assertEquals('1.1', questions[0].RFP_Question_Number__c);
        System.assertEquals('1.2', questions[1].RFP_Question_Number__c);
        System.assertEquals('1.2.1', questions[2].RFP_Question_Number__c);
        System.assertEquals('1.10', questions[3].RFP_Question_Number__c);
        System.assertEquals('2', questions[4].RFP_Question_Number__c);
    }
}