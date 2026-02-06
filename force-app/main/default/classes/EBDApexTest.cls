@isTest
private class EBDApexTest {
    public testMethod static void validategetKnowledgeManagement(){
        test.startTest();
        Account acc = new Account();
        acc.Name = 'testAccount';
        acc.Subtype__c ='Prospect';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acc;
        
        EBD__c ebd= new EBD__c(); 
        ebd.Name = 'test';
        ebd.Year__c = '2013';
        ebd.Company__c = acc.Id;
        insert ebd;
        
        Blob body;
        body = Blob.valueOf('Some Text');
        ContentVersion cv = new ContentVersion();
        cv.ContentLocation = 'S';
        //cv.ContentDocumentId = ContentDocumentId;
        cv.VersionData = body;
        cv.Title = 'TestArticle.pdf';
        cv.PathOnClient = '/TestFilePreview.pdf';	
        // cv.ContentUrl='pdf';        
        insert cv;
        
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id =: cv.Id].ContentDocumentId;
        cdl.LinkedEntityId = ebd.Id;
        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';
        insert cdl;
        EBDApex.getEBD(acc.Id);
        EBDApex.DownloadAttachment(cdl.ContentDocumentId);
        EBDApex.insertEbd(acc.Id,ebd,false);
        test.stopTest();
    }
}