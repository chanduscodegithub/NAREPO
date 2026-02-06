@isTest
private class KnowledgeManagementApexTest {
    public testMethod static void validategetKnowledgeManagement(){
        test.startTest();
        Knowledge__kav article= new Knowledge__kav(); 
        article.Title = 'test';
        article.UrlName = 'testNEW';
        insert article;
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
        cdl.LinkedEntityId = article.Id;
        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';
        insert cdl;
        KnowledgeManagementApex.getKnowledgeManagement(article.Id);
        String downloadLink = KnowledgeManagementApex.DownloadAttachment(cdl.ContentDocumentId);
        System.assertNotEquals(downloadLink, '');
        test.stopTest();
    }
}