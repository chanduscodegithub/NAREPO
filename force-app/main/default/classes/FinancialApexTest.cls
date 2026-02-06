@isTest
private class FinancialApexTest {
    
    @testSetup static void createTestData() {
        
        Account acc = new Account();
        acc.Name = 'testFinancial';
        acc.Subtype__c ='Enterprise Strategic Accounts';
        insert acc;
              
       
        List<Financial__c> financialRecords = new List<Financial__c>();
                
        for(Integer i=0;i<3;i++) {
            Integer year = 2017+i;           
            financialRecords.add(new Financial__c(
                Name = 'Financial Test'+i,
                Membership_Type__c = 'Medical',            
                //Current_Year__c = Date.Today(),               
                Deal_years__c = 20,
                Margin__c = 500,                
                Revenue__c = 1000,
                Membership__c = 100,
                Current_Year__c=2,
               	Last_Updated__c=Date.newInstance(year, 4, 12),
                Year__c =  Date.newInstance(year, 2, 17),
                Financial_Type__c = 'Total',
                Company__c = acc.id));
        }
        Integer year1 = 2017;           
        financialRecords.add(new Financial__c(
                Name = 'Financial Test',
                Membership_Type__c = 'Medical',            
                Year__c =  Date.newInstance(2016, 10, 20),  
                Financial_Type__c = 'Total',
                Last_Updated__c= Date.newInstance(year1, 4, 12),
                Company__c = acc.id));
        
        //insert financialRecords;
        
        //List<Financial__c> financialRecords1 = new List<Financial__c>();
                
         for(Integer i=0;i<3;i++) {
            Integer year = 2017+i;
            financialRecords.add(new Financial__c(
                Name = 'Financial Test'+i,
                Membership_Type__c = 'RX',            
                //Current_Year__c = Date.Today(),
                Deal_years__c = 20,
                Margin__c = 500,                
                Revenue__c = 1000,
                Membership__c = 100,                
                TotExp__c = 50,
                TotExpRx__c = 25,
                Last_Updated__c= Date.newInstance(year, 4, 12),
                Year__c = Date.newInstance(year, 2, 17),
                Financial_Type__c = 'Surest',
                Company__c = acc.id));
        } 
       /* financialRecords.add(new Financial__c(
                Name = 'Financial Test',
                Membership_Type__c = 'RX',            
                Year__c =  Date.newInstance(2016, 9, 17),                            
                Company__c = acc.id));*/

        insert financialRecords;                               

        
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
            Position__c = 'Test User',
            LocaleSidKey = 'en_US');
        
        insert readOnlyUser;
    }
   
    public testMethod static void validategetAccountTeamMebers(){
        Id acct = [SELECT Id FROM Account WHERE Name='testFinancial' LIMIT 1].Id;
      
        Map<String,Object> finReturnMap = new Map<String,Object>(); 
        Test.startTest();
        finReturnMap = FinancialsApex.getfinancialsData(acct,'Total');
        //System.assert(finReturnMap.size()>0);       
        
		FinancialsApex.getfinancialsData(null,null);
        //System.assertEquals(null, null);
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        System.runAs(readOnlyUser) {
            FinancialsApex.getfinancialsData(acct,'Surest');
            //System.assertEquals(null, null);
        }
        Test.stopTest();
    }
}