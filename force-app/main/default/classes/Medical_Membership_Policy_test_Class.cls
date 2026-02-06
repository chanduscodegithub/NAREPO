@isTest
public class Medical_Membership_Policy_test_Class {
    
    @testSetup static void createTestData(){
        
         Account accC = new Account();
        accC.Name = 'Competitive Medical CD';
        accC.Subtype__c ='Prospect';
        accC.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accC; 
        
         Account accCD123 = new Account();
        accCD123.Name = 'Competitive Medical CD';
        accCD123.Subtype__c ='Prospect';
        accCD123.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCD123;  
        
        Account accCD1 = new Account();
        accCD1.Name = 'testCFAccount';
        accCD1.Type = 'Consulting Firm';
        accCD1.Subtype__c = 'Consulting Firm';        
        accCD1.RecordTypeId =  Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert accCD1; 
        
        List<PolicyAccountMembership__c> testPolicyRecords = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testPolicyRecords.add(new PolicyAccountMembership__c(
                Name = 'testPolicy1',
                PolicyName__c = '0012354'+i,
                GLMembership__c = 6543,
                AccountFirm__c = accCD1.id,
                MembershipType__c = 'Medical',
                Surest_Policy_No__c = '20',
                GLDate__c = Date.newInstance(2017,2,20)));
        }
        insert testPolicyRecords;
        
        List<PolicyAccountMembership__c> testPolicyRecords4 = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testPolicyRecords4.add(new PolicyAccountMembership__c(
                Name = 'testPolicy1',
                PolicyName__c = '001'+i,
                GLMembership__c = 1111,
                AccountFirm__c = accCD1.id,
                MembershipType__c = 'Medical',
                Surest_Policy_No__c = '2',
                GLDate__c = Date.newInstance(2017,2,5)));
        }
        insert testPolicyRecords4;
        
        List<PolicyAccountMembership__c> testPolicyRecords1 = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testPolicyRecords1.add(new PolicyAccountMembership__c(
                Name = 'testPolicy2',
                PolicyName__c = '0012674'+i,
                GLMembership__c = 6543,
                AccountFirm__c = accCD1.id,
                MembershipType__c = 'Medical',
                Surest_Policy_No__c = '15',
                GLDate__c = Date.newInstance(2016,8,20)));
        }
        insert testPolicyRecords1;
        
        List<PolicyAccountMembership__c> testPolicyRecordsv = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testPolicyRecordsv.add(new PolicyAccountMembership__c(
                Name = 'testPolicy2',
                PolicyName__c = '0012674'+i,
                GLMembership__c = 6543,
                AccountFirm__c = accCD1.id,
                MembershipType__c = 'Vision',
                 Surest_Policy_No__c = '12',
                GLDate__c = Date.newInstance(2016,8,20)));
        }
        insert testPolicyRecordsv;
        
        List<PolicyAccountMembership__c> testPolicyRecordsd = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testPolicyRecordsd.add(new PolicyAccountMembership__c(
                Name = 'testPolicy2',
                PolicyName__c = '0012674'+i,
                GLMembership__c = 6543,
                AccountFirm__c = accCD1.id,
                MembershipType__c = 'Dental',
                 Surest_Policy_No__c = '7',
                GLDate__c = Date.newInstance(2016,8,20)));
        }
        insert testPolicyRecordsd;
        
        List<PolicyAccountMembership__c> testPolicyRecords2 = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testPolicyRecords2.add(new PolicyAccountMembership__c(
                Name = 'testPolicy2',
                PolicyName__c = '0012674'+i,
                GLMembership__c = 0,
                AccountFirm__c = accCD1.id,
                MembershipType__c = 'Medical',
                GLDate__c = Date.newInstance(2016,2,20)));
        }
        insert testPolicyRecords2;
        
         List<PolicyAccountMembership__c> testPolicyRecords3 = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testPolicyRecords3.add(new PolicyAccountMembership__c(
                Name = 'testPolicy2',
                PolicyName__c = '0012674'+i,
                GLMembership__c = 230,
                AccountFirm__c = accCD123.id,
                MembershipType__c = 'Medical',
                Surest_Policy_No__c = '20',
                GLDate__c = Date.newInstance(2016,2,20)));
        }
        insert testPolicyRecords3;
                
        List<PolicyAccountMembership__c> testGLRevenueRecords = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testGLRevenueRecords.add(new PolicyAccountMembership__c(
                Name = 'Total GL Membership',
                PolicyName__c = 'Total GL Membership'+i,
                GLMembership__c = 9999,
                AccountFirm__c = accCD1.id,
                GLDate__c = Date.newInstance(2015,2,20)));
        }
        insert testGLRevenueRecords;
        
        List<PolicyAccountMembership__c> testGLRevenueRecords1 = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testGLRevenueRecords1.add(new PolicyAccountMembership__c(
                Name = 'Total GL Membership',
                PolicyName__c = 'Total GL Membership'+i,
                GLMembership__c = 9959,
                AccountFirm__c = accCD1.id,
                GLDate__c = Date.newInstance(2017,2,20)));
        }
        insert testGLRevenueRecords1;
        
        List<PolicyAccountMembership__c> testGLRevenueRecords2 = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testGLRevenueRecords2.add(new PolicyAccountMembership__c(
                Name = 'Total GL Membership',
                PolicyName__c = 'Total GL Membership'+i,
                GLMembership__c = 343,
                AccountFirm__c = accCD1.id,
                GLDate__c = Date.newInstance(2016,3,20)));
        }
        insert testGLRevenueRecords2;
        
           List<PolicyAccountMembership__c> testGLRevenueRecords3 = new List<PolicyAccountMembership__c>();
        for(Integer i=0;i<5;i++) {
            testGLRevenueRecords2.add(new PolicyAccountMembership__c(               
                PolicyName__c = 'Total GL Membership'+i,
                GLMembership__c = 343,
                AccountFirm__c = accCD1.id,
                GLDate__c = Date.newInstance(0,0,20)));
        }
        insert testGLRevenueRecords3;
        
        User readOnlyUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@surest.com',
            Username = 'uhgDevReadOnly@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        Position__c = 'CD SVP');
        
        insert readOnlyUser;
    }
    
    public testMethod static void validategetAccountMembershipPolicyDetailsOnAppletLoad(){
        
        Id acct = [SELECT Id FROM Account WHERE Name='testCFAccount' LIMIT 1].Id;
        Id acct1 = [SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        Test.startTest();

        try{
	  Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobject1 = Medical_Membership_History_PolicyDetail.getAccountMembershipPolicyDetailsOnAppletLoad(acct);  
      Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectSurest1 =  Medical_Membership_History_Policy_Surest.getAccountMembershipPolicyDetailsOnAppletLoad(acct);
                           Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectSurestt1 =  Medical_Membership_History_Policy_Surest.getAccountMembershipPolicyDetailsOnAppletLoad(acct1);

        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
       try{
	   Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobject3 = Medical_Membership_History_PolicyDetail.getAccountMembershipPolicyDetailsOnAppletLoad(null);
       Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectSurest3 = Medical_Membership_History_Policy_Surest.getAccountMembershipPolicyDetailsOnAppletLoad(null);
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
        try{
	    Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobject4 = Medical_Membership_History_PolicyDetail.getAccountMembershipPolicyDetailsOnAppletLoad(readOnlyUser.Id);
        Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectSurest4 = Medical_Membership_History_Policy_Surest.getAccountMembershipPolicyDetailsOnAppletLoad(readOnlyUser.Id);
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
        try{
          System.runAs(readOnlyUser) {
            Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobject2 = Medical_Membership_History_PolicyDetail.getAccountMembershipPolicyDetailsOnAppletLoad(acct);
            Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectSurest2 = Medical_Membership_History_Policy_Surest.getAccountMembershipPolicyDetailsOnAppletLoad(acct);
        }  
        }catch(Exception ex){
           system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage()); 
        }
        
        
        Test.stopTest();
    }
    
    public testMethod static void validategetLatestFourYearPolicyRevenue(){
        
        Id acct = [SELECT Id FROM Account WHERE Name='testCFAccount' LIMIT 1].Id;
        Id Wrongacct = [SELECT Id FROM Account WHERE Name='Competitive Medical CD' LIMIT 1].Id;
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        Test.startTest();
         try{
	    Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobject6 = Medical_Membership_History_PolicyDetail.getLatestFourYearPolicyRevenue(acct,2108);
        Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectSurest6 = Medical_Membership_History_Policy_Surest.getLatestFourYearPolicyRevenue(acct,2108);
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
        try{
	    Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobject9 = Medical_Membership_History_PolicyDetail.getLatestFourYearPolicyRevenue(Wrongacct,2108);
        Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectSurest9 = Medical_Membership_History_Policy_Surest.getLatestFourYearPolicyRevenue(Wrongacct,2108);
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
        try{
	     Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobject7 = Medical_Membership_History_PolicyDetail.getLatestFourYearPolicyRevenue(null,null);
         Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectSurest7 = Medical_Membership_History_Policy_Surest.getLatestFourYearPolicyRevenue(null,null);
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
       try{
	     Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobject10 = Medical_Membership_History_PolicyDetail.getLatestFourYearPolicyRevenue(null,2018);
         Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectSurest10 = Medical_Membership_History_Policy_Surest.getLatestFourYearPolicyRevenue(null,2018);
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
       
         try{
          System.runAs(readOnlyUser) {
           Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobject5 = Medical_Membership_History_PolicyDetail.getLatestFourYearPolicyRevenue(acct,2108);
           Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectSurest5 = Medical_Membership_History_Policy_Surest.getLatestFourYearPolicyRevenue(acct,2108);
		}  
        }catch(Exception ex){
           system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage()); 
        }
        
        Test.stopTest();
    } 
    
    public testMethod static void validateupdateMedicalDentalVisionInAccount(){
        
        Id acct = [SELECT Id FROM Account WHERE Name='testCFAccount' LIMIT 1].Id;
        User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1]; 
        Test.startTest();
         try{
	     Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobjectd = Medical_Membership_History_PolicyDetail.updateMedicalDentalVisionInAccount(acct, 2098);
       	 Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobjectdSurest = Medical_Membership_History_PolicyDetail.updateMedicalDentalVisionInAccount(acct, 2098);
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
        try{
	    Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobjectd1 = Medical_Membership_History_PolicyDetail.updateMedicalDentalVisionInAccount(acct, null);
	    Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectdSurest1 = Medical_Membership_History_Policy_Surest.updateMedicalDentalVisionInAccount(acct, null);
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
         try{
	     Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobjectd2 = Medical_Membership_History_PolicyDetail.updateMedicalDentalVisionInAccount(null, null);
	     Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectdSurest2 = Medical_Membership_History_Policy_Surest.updateMedicalDentalVisionInAccount(null, null);
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
        try{
	     Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobjectd4 = Medical_Membership_History_PolicyDetail.updateMedicalDentalVisionInAccount(acct, 0);
	     Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectdSurest4 = Medical_Membership_History_Policy_Surest.updateMedicalDentalVisionInAccount(acct, 0);
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
       try{
	      System.runAs(readOnlyUser) {
        	Medical_Membership_History_PolicyDetail.AccountMembershipPolicyDetailsResult policyobjectd3 = Medical_Membership_History_PolicyDetail.updateMedicalDentalVisionInAccount(acct,2098);
        	Medical_Membership_History_Policy_Surest.AccountMembershipPolicyDetailsResult policyobjectdSurest3 = Medical_Membership_History_Policy_Surest.updateMedicalDentalVisionInAccount(acct,2098);
        }
        }catch(Exception ex){
            system.debug('Exception Line Number  :'+ex.getLineNumber());
            system.debug('Exception Message  :'+ex.getMessage());
        }
       
        Test.stopTest();

    } 
}