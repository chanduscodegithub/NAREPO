/****************************************************************** ***** 
Name	: attachmentSharingTest
Author	: Sudarshan Reddy M
Purpose	: Test Class for attachmentSharing Trigger
********************************************************************/
@isTest
public class attachmentSharingTest {
    
    @isTest
    static void testDocumentLinkTrigger(){
        test.startTest();
        
        Case c = new Case(RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('General Action').getRecordTypeId(),
                          status = 'open', Visibility__c = 'Customer');
        insert c;
        
        ContentVersion contentVersion = new ContentVersion(
            Title = 'Penguins',
            PathOnClient = 'Penguins.jpg',
            VersionData = Blob.valueOf('Test Content'),
            IsMajorVersion = true
        );
        insert contentVersion; 
        
        List<ContentDocument> documents = [SELECT Id, Title, LatestPublishedVersionId FROM ContentDocument];
        
        //create ContentDocumentLink  record 
        ContentDocumentLink cdl = New ContentDocumentLink();
        cdl.LinkedEntityId = c.id;
        cdl.ContentDocumentId = documents[0].Id;
        cdl.shareType = 'I';
        insert cdl; 
        
        test.stopTest();
    }
}