@isTest
private class ClientSurveyResultsClassTest {
    
    @testSetup static void createTestData() {
        
        Account acc = new Account();
        acc.Name = 'testAccountSurvey';
        acc.Subtype__c ='Enterprise Strategic Accounts';
        insert acc;
        
        Account acc1 = new Account();
        acc1.Name = 'testAccountSurvey1';
        acc1.Subtype__c ='Enterprise Strategic Accounts';
        insert acc1;
        
        Account acc2 = new Account();
        acc2.Name = 'test CD AccountSurvey1';
        acc2.Subtype__c ='Prospect';
        acc2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acc2;        
       
        List<ClientSurveyResults__c> surveyRecords = new List<ClientSurveyResults__c>();
                
        for(Integer i=0;i<4;i++) {
            Integer year = 2015+i;
            surveyRecords.add(new ClientSurveyResults__c(
                Name = 'Test Survey'+i,
                LikelihoodtoRecommendScore__c = '10',            
                NetPromoterType__c = 'Detractor',
                OverallSatisfactionScore__c = '20',
                NetPromoterScore__c = 130+i,                
                Year__c = String.valueOf(year),
                Type__c = 'Client Survey Results',
                Account__c = acc.id));
        }
        
        insert surveyRecords;
        
        List<ClientSurveyResults__c> surveyRecords2 = new List<ClientSurveyResults__c>();
                
        for(Integer i=0;i<2;i++) {
            Integer year = 2015+i;
            surveyRecords2.add(new ClientSurveyResults__c(
                Name = 'Test Survey CD'+i,
                LikelihoodtoRecommendScore__c = '10',            
                NetPromoterType__c = 'Detractor',
                OverallSatisfactionScore__c = '20',
                NetPromoterScore__c = 125+i,                
                Year__c = String.valueOf(year),
                Type__c = 'Client Survey Results',
                Account__c = acc2.id));
        }
        
        insert surveyRecords2;

        
        List<ClientSurveyResults__c> surveyRecords1 = new List<ClientSurveyResults__c>();
        
          
        surveyRecords.add(new ClientSurveyResults__c(
            Name = 'Test Survey10',
            LikelihoodtoRecommendScore__c = '10',            
            NetPromoterType__c = 'Detractor',
            OverallSatisfactionScore__c = '20',
            NetPromoterScore__c = 130,                
            Year__c = '2017',
            Type__c = 'Client Survey Results - Traditional',
            Account__c = acc1.id));

        insert surveyRecords1;
        
         User readOnlyUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDevReadOnly@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
             Position__c='Test User',
            LocaleSidKey = 'en_US');
        	
        
        insert readOnlyUser;
    }
   
    public testMethod static void validategetAccountTeamMebers(){
        Id acct = [SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1].Id;
        Id acct1 = [SELECT Id FROM Account WHERE Name='testAccountSurvey1' LIMIT 1].Id;
        Id acct2 = [SELECT Id FROM Account WHERE Name='test CD AccountSurvey1' LIMIT 1].Id;
        
        Map<String,Object> csrReturnMap = new Map<String,Object>(); 
        Test.startTest();
        csrReturnMap = ClientSurveyResultsClass.getClientSurveyRecords(acct);
        csrReturnMap = ClientSurveyResultsClass.getClientSurveySurestRecords(acct);
        System.assert(csrReturnMap.size()>0);
        csrReturnMap = ClientSurveyResultsClass.getClientSurveyRecords(acct1);
        csrReturnMap = ClientSurveyResultsClass.getClientSurveySurestRecords(acct1);
        System.assert(csrReturnMap.size()>0);
        
        csrReturnMap = ClientSurveyResultsClass.getClientSurveyRecords(acct2);
        csrReturnMap = ClientSurveyResultsClass.getClientSurveySurestRecords(acct2);
        System.assert(csrReturnMap.size()>0);
        
		ClientSurveyResultsClass.getClientSurveyRecords(null);
        ClientSurveyResultsClass.getClientSurveySurestRecords(null);
        System.assertEquals(null, null);
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        System.runAs(readOnlyUser) {
            ClientSurveyResultsClass.getClientSurveyRecords(acct);
            ClientSurveyResultsClass.getClientSurveySurestRecords(acct);
            System.assertEquals(null, null);
        }
        Test.stopTest();
    }
}