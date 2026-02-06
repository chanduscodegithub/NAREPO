@isTest
public class HotTopicsTestClass {
    static testMethod void validateHotTopics(){
        String label = 'Test Label';
        String link = 'https://www.google.com';
        
        Hot_Topics__c ht = new Hot_Topics__c();
        ht.name = 'Test ht';
        
        Test.startTest();
        insert ht;
        Test.stopTest();
        
        HotTopics.profileName();
        HotTopics.saveLinkToHotTopics(label,link,null);
        HotTopics.saveLinkToHotTopics(label,link,ht.Id);
        HotTopics.deleteHotTopic(ht.Id);
    }
}