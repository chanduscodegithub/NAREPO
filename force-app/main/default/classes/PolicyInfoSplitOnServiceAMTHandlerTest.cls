@isTest
public class PolicyInfoSplitOnServiceAMTHandlerTest {
    
    @isTest
    static void dontAllowDuplicatePolicies(){
        
        Boolean expectedExceptionThrown;
        
        list<Policy_Information__c> listOfpolicies = new list<Policy_Information__c>();
         Test.startTest();
        Account acc = new Account(Name = 'Test CD Account', Subtype__c ='Prospect',
                                  RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId());
        
        insert acc;
        
        Policy_Information__c policy = new Policy_Information__c(Policy__c = '720455',Name = '720455', Company__c = acc.Id,Policy_Type__c='Medical');
        insert policy;
        Policy_Information__c policy1 = new Policy_Information__c(Policy__c = '00886737',Name = '00886737',Company__c = acc.Id,Policy_Type__c='OptumRx');
        insert policy1;
        Policy_Information__c policy3 = new Policy_Information__c(Policy__c = '008867372',Name = '008867372', Company__c = acc.Id,Policy_Type__c='Dental');
        insert policy3;
        Policy_Information__c policy4 = new Policy_Information__c(Policy__c = '008867374',Name = '008867374', Company__c = acc.Id,Policy_Type__c='Vision');
        insert policy4;
        Policy_Information__c policy5 = new Policy_Information__c(Policy__c = '008867375',Name = '008867375', Company__c = acc.Id,Policy_Type__c='Life/Di');
        insert policy5;
       
        Service_AMT__c sa1 =new Service_AMT__c(Name='Test',Company__c = acc.Id,Policy_Information_MultiChecKlist__c='720455;00886737;008867372;008867374;008867375;');
        try{  
            insert sa1;
        }catch(exception e){}
        Test.stopTest();
    }
}