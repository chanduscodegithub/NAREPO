public class HotTopics {
    @AuraEnabled
    public static string profileName(){
        String profName = [Select Id,Profile.Name from User where Id=: UserInfo.getUserId() Limit 1][0].Profile.Name;
        system.debug('profName '+profName);
        return [Select Id,Profile.Name from User where Id=: UserInfo.getUserId() Limit 1][0].Profile.Name;
    }
    
    @AuraEnabled
    public static List<Hot_Topics__c> saveLinkToHotTopics(String label, String link, String recordIdValue){
        system.debug('recordIdValue '+recordIdValue);
        
        List<Hot_Topics__c> htList = new List<Hot_Topics__c>();
        
        if(recordIdValue != null && recordIdValue != ''){
            system.debug('Inside if '+recordIdValue);
            Hot_Topics__c ht = new Hot_Topics__c();
            ht.Name = label;
            ht.Link__c = link;
            ht.Id = recordIdValue;
            htList.add(ht);
            update htList;
        }
        else{
            system.debug('Inside else '+recordIdValue);
            Hot_Topics__c ht = new Hot_Topics__c();
            ht.Name = label;
            ht.Link__c = link;
            htList.add(ht);
            insert htList;
        }
        
        return queryHotTopics();
    }
    
    @AuraEnabled
    public static List<Hot_Topics__c> queryHotTopics(){
        return [Select id,name,Link__c from Hot_Topics__c ORDER BY CreatedDate LIMIT 5];
    }
    
    @AuraEnabled
    public static List<Hot_Topics__c> deleteHotTopic(String recordIdValue){
        delete [Select id from Hot_Topics__c where Id =: recordIdValue];
        return queryHotTopics();
    }
    
}