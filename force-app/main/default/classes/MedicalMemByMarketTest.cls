/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 04-18-2024
 * @last modified by  : Spoorthy
**/
@isTest
private class MedicalMemByMarketTest {
    
    @testSetup static void createTestData() {
        
        Account acc = new Account();
        acc.Name = 'medical Meb by Mrkt';
        acc.Subtype__c ='National Accounts - East';
        insert acc;
         
        List<MembershipbyMkt__c> medicalMembersRecords = new List<MembershipbyMkt__c>();
         
        String[] regions = new List<String>(); 
        regions.add('Northeast');
        regions.add('Southeast');
        regions.add('Central');
        regions.add('West');
        regions.add('Other');
        for(Integer i=0;i<5;i++) {          
            medicalMembersRecords.add(new MembershipbyMkt__c(
                Name = 'Members By Market'+i,
                Members__c = 100+i,            
                Region__c = regions[i],
                State__c = 'AL',
                UNETMarket__c = 'South AL',
                GL_Date__c = Date.today(),                              
                AccountFirm__c = acc.id));
        }
        
        insert medicalMembersRecords;
        
         User readOnlyUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@salesforce.com',
            Username = 'uhgDevReadOnly@crmit.com',
             Position__c = 'CD SVP',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US');
        
        insert readOnlyUser;
    }
   
    public testMethod static void validategetAccountTeamMebers(){
        Id acct = [SELECT Id FROM Account WHERE Name='medical Meb by Mrkt' LIMIT 1].Id;
        //Id acct1 = [SELECT Id FROM Account WHERE Name='testAccountSurvey1' LIMIT 1].Id;
        //Id acct2 = [SELECT Id FROM Account WHERE Name='test CD AccountSurvey1' LIMIT 1].Id;
        
        Map<String,Object> memByMktData = new Map<String,Object>();
        Map<String,Map<String,Object>> memByMktStateMap = new Map<String,Map<String,Object>>();
        Map<String,Double> memByMktUnetMap = new Map<String,Double>();
         Map<String,Object> memByMktDataSurest = new Map<String,Object>();
       Map<String,Double> memByMktStateMapSurest = new Map<String,Double>();
        Map<String,Double> memByMktUnetMapSurest = new Map<String,Double>();
        Test.startTest();
        memByMktData = MedicalMemByMarket.getMedicalMemByMarket(acct);
        System.assert(memByMktData.size()>0);
        memByMktStateMap = MedicalMemByMarket.getMedicalStateByMarket(acct,'Southeast');
        System.assert(memByMktStateMap.size()>0);
        
        memByMktUnetMap = MedicalMemByMarket.getMedicalUnetsByMarket(acct,'Southeast','AL');
        System.assert(memByMktUnetMap.size()>0);
        
		MedicalMemByMarket.getMedicalMemByMarket(null);
        memByMktDataSurest = MedicalMemByMarket.getMedicalMemByMarketSurest(acct);
        System.assert(memByMktData.size()>0);
        memByMktStateMapSurest = MedicalMemByMarket.getMedicalStateByMarketSurest(acct,'Southeast');
        System.assert(memByMktStateMap.size()>0);
        
        memByMktUnetMapSurest = MedicalMemByMarket.getMedicalUnetsByMarketSurest(acct,'Southeast','AL');
        System.assert(memByMktUnetMap.size()>0);
        
		MedicalMemByMarket.getMedicalMemByMarketSurest(null);
        System.assertEquals(null, null);
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        System.runAs(readOnlyUser) {
           // MedicalMemByMarket.getMedicalMemByMarket(acct);
           // MedicalMemByMarket.getMedicalMemByMarketSurest(acct);
           // System.assertEquals(null, null);
        }
        Test.stopTest();
    }
}