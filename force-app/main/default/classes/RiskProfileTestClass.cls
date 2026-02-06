@isTest
public class RiskProfileTestClass {
    @testSetup static void createTestData() {
        
         // Creating the test Account
        Account acc = new Account();
        acc.Name = 'testAccount';
        acc.Subtype__c ='National Accounts - West';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert acc;
        
        List<RiskProfile__c> riskProfileList = new List<RiskProfile__c>();
        
        RiskProfile__c riskProfileR1 = new RiskProfile__c();            
        riskProfileR1.SCERiskTypeAddlRiskFactorType__c = 'Key Contact Change';            
        riskProfileR1.AccountFirm__c = acc.Id;
        riskProfileR1.WeightMultiplier__c = 5;
        riskProfileR1.Impact__c = 'High';
        riskProfileR1.DateRiskClosed__c = Date.today();
        riskProfileR1.RiskProfileType__c = 'Risk Tracked by SCE';
        riskProfileList.add(riskProfileR1);
        
        RiskProfile__c riskProfile = new RiskProfile__c();            
        riskProfile.SCERiskTypeAddlRiskFactorType__c = 'SSP';            
        riskProfile.AccountFirm__c = acc.Id;
        riskProfile.RiskFactorValue__c = '$4';
        riskProfile.WeightMultiplier__c = 5;
        riskProfile.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        riskProfileList.add(riskProfile);
        
        RiskProfile__c riskProfile1 = new RiskProfile__c();            
        riskProfile1.SCERiskTypeAddlRiskFactorType__c = 'Bid Risk';            
        riskProfile1.AccountFirm__c = acc.Id;
        riskProfile.RiskFactorValue__c = 'Yes';
        riskProfile1.WeightMultiplier__c = 5;
        riskProfile1.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        riskProfileList.add(riskProfile1);
        
        RiskProfile__c riskProfile2 = new RiskProfile__c();            
        riskProfile2.SCERiskTypeAddlRiskFactorType__c = 'Management Risk Adjustment';            
        riskProfile2.AccountFirm__c = acc.Id;
        riskProfile2.WeightMultiplier__c = 5;
        riskProfile2.RiskFactorValue__c = '100';
        riskProfile2.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        riskProfileList.add(riskProfile2);
        
        RiskProfile__c riskProfile3 = new RiskProfile__c();            
        riskProfile3.SCERiskTypeAddlRiskFactorType__c = 'Top Market Risk';            
        riskProfile3.AccountFirm__c = acc.Id;
        riskProfile3.RiskFactorValue__c = '100%';
        riskProfile3.WeightMultiplier__c = 5;
        riskProfile3.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        riskProfileList.add(riskProfile3);
        
        RiskProfile__c riskProfile4 = new RiskProfile__c();            
        riskProfile4.SCERiskTypeAddlRiskFactorType__c = 'Renewal Risk';            
        riskProfile4.AccountFirm__c = acc.Id;
        riskProfile4.WeightMultiplier__c = 5;
        riskProfile4.RiskFactorValue__c = 'Yes';
        riskProfile4.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        riskProfileList.add(riskProfile4);
        
        RiskProfile__c riskProfile5 = new RiskProfile__c();            
        riskProfile5.SCERiskTypeAddlRiskFactorType__c = 'Overall Satisfaction with AMT';            
        riskProfile5.AccountFirm__c = acc.Id;
        riskProfile5.RiskFactorValue__c = '10';
        riskProfile5.WeightMultiplier__c = 5;
        riskProfile5.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        riskProfileList.add(riskProfile5);
        
        RiskProfile__c riskProfile6 = new RiskProfile__c();            
        riskProfile6.SCERiskTypeAddlRiskFactorType__c = 'Overall Satisfaction with SCE';            
        riskProfile6.AccountFirm__c = acc.Id;
        riskProfile6.RiskFactorValue__c = '100';
        riskProfile6.WeightMultiplier__c = 5;
        riskProfile6.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        riskProfileList.add(riskProfile6);
        
        RiskProfile__c riskProfile7 = new RiskProfile__c();            
        riskProfile7.SCERiskTypeAddlRiskFactorType__c = 'Optum Rx LTR Score';            
        riskProfile7.AccountFirm__c = acc.Id;
        riskProfile7.WeightMultiplier__c = 5;
        riskProfile7.RiskFactorValue__c = '100';
        riskProfile7.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        riskProfileList.add(riskProfile7);
        
        RiskProfile__c riskProfile8 = new RiskProfile__c();            
        riskProfile8.SCERiskTypeAddlRiskFactorType__c = 'Optum LTR Score';            
        riskProfile8.AccountFirm__c = acc.Id;
        riskProfile8.RiskFactorValue__c = '100';
        riskProfile8.WeightMultiplier__c = 5;
        riskProfile8.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        riskProfileList.add(riskProfile8);
        
        RiskProfile__c riskProfile9 = new RiskProfile__c();            
        riskProfile9.SCERiskTypeAddlRiskFactorType__c = 'LTR Score';            
        riskProfile9.AccountFirm__c = acc.Id;
        riskProfile9.WeightMultiplier__c = 5;
        riskProfile9.RiskFactorValue__c = '100';
        riskProfile9.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        riskProfileList.add(riskProfile9);
        
        insert riskProfileList;
        
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
            LocaleSidKey = 'en_US',
        Position__c = 'Test User');
        	
        
        insert readOnlyUser;    
        
        //Risk_Profile__mdt[] riskProfileMetaData = [SELECT Id, Language, NamespacePrefix, Label, QualifiedApiName, Risk_Profile_Type__c, Order__c, Data_Type__c, Additional_Information__c, Weight_Multiplier__c, Raw_Score__c, Impact__c, DeveloperName, MasterLabel FROM Risk_Profile__mdt]; 
        
    }
    
    public testMethod static void validateGetRiskProfileMetaDate(){
        
        Test.startTest();
         try{
            RiskApexController.getRiskProfileMetaDate(UHGAccountSOQLConstants.RISK_TRACKED_BY_SCE);
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
            RiskApexController.getRiskProfileMetaDate(UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR);
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
        	RiskApexController.getRiskProfileMetaDate(null);    
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
        	RiskApexController.getRiskProfileMetaDate('sdfsdfdsf');    
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
            User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
            System.runAs(readOnlyUser) {
                RiskApexController.getRiskProfileMetaDate(null);
            }
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        
        Test.stopTest();
    }
    
    public testMethod static void valideleteRiskProfileObj(){
        
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        Id riskProfile = [SELECT Id FROM RiskProfile__c LIMIT 1].Id;
        List<String> riskProfileId = new List<String>();
        riskProfileId.add(riskProfile);
        Test.startTest();
        try{
            RiskApexController.deleteRiskProfileObj(null,null,false);
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
            RiskApexController.deleteRiskProfileObj(riskProfileId,null,false);
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
            RiskApexController.deleteRiskProfileObj(null,acct,false);
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
            RiskApexController.deleteRiskProfileObj(riskProfileId,null,false);
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
         	RiskApexController.deleteRiskProfileObj(riskProfileId,acct,true);   
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }       	        
        try{
            User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
            System.runAs(readOnlyUser) {
                RiskApexController.deleteRiskProfileObj(riskProfileId,acct,false);   
            }
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        Test.stopTest();
    }
    
    public testMethod static void valiupdateAccountReviewDate(){
        
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;        
        
        Test.startTest();
        try{
        	RiskApexController.updateAccountReviewDate(null,null);    
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
        	RiskApexController.updateAccountReviewDate(acct,null);        
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
       	
        try{
            User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
            System.runAs(readOnlyUser) {
                RiskApexController.updateAccountReviewDate(acct,null);        
            }
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        
        Test.stopTest();
    }
    
     public testMethod static void validsaveRiskProfile(){
        
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        List<RiskProfile__c> riskProfileList = [SELECT Id FROM RiskProfile__c LIMIT 2];
        
        Test.startTest();
         try{
        	RiskApexController.saveRiskProfile(null,null);     
         }catch(Exception ex){
             System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
         }
         try{
        	RiskApexController.saveRiskProfile(riskProfileList,null);     
         }catch(Exception ex){
             System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
         }
       	try{
            User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
            System.runAs(readOnlyUser) {
                RiskApexController.saveRiskProfile(riskProfileList,null);           
            }
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
         
        Test.stopTest();
    }
    
     public testMethod static void validEditAccesToThisUser(){
        
        Test.startTest();
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
       	RiskApexController.isEditAccesToThisUser(acct);        
         User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        System.runAs(readOnlyUser) {
            RiskApexController.isEditAccesToThisUser(acct);        
        }
         
        Test.stopTest();
    }
    
     public testMethod static void validateRiskProfileData(){
        
         Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
         
         Test.startTest();
         try{
         	RiskApexController.getRiskProfileData(null);            
         }catch(Exception ex){
             System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
         }
         try{
         	RiskApexController.getRiskProfileData(acct);            
         }catch(Exception ex){
             System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
         }
         try{
             User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
             System.runAs(readOnlyUser) {
                 RiskApexController.getRiskProfileData(acct);                   
             }
         }catch(Exception ex){
             System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
         }
         
         Test.stopTest();
    }
    public testMethod static void validateSaveAndUpdateRiskProfile(){
        
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        String riskType1 = UHGAccountSOQLConstants.RISK_TRACKED_BY_SCE;
        String riskType2 = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
        List<RiskProfile__c> riskProfileList1 = [SELECT Id FROM RiskProfile__c where RiskProfileType__c = :riskType1];
        List<RiskProfile__c> riskProfileList2 = [SELECT Id FROM RiskProfile__c where RiskProfileType__c = :riskType2];
        Id riskProfile = [SELECT Id FROM RiskProfile__c LIMIT 1].Id;
        List<String> riskProfileId = new List<String>();
        Test.startTest();
        try{
            RiskApexController.saveAndUpdateRiskProfile(null,null,acct,false,null,riskProfileId);            
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
            RiskApexController.saveAndUpdateRiskProfile(riskProfileList1,riskProfileList2,acct,false,null,riskProfileId);            
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        
        try{
            User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
            System.runAs(readOnlyUser) {
                RiskApexController.saveAndUpdateRiskProfile(riskProfileList1,riskProfileList2,acct,false,null,riskProfileId);                           
            }
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        
        Test.stopTest();
    }
    public testMethod static void validategetAccoutDetails(){
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        Test.startTest();
        try{
            RiskApexController.getAccoutDetails(acct);     
            RiskApexController.getAccoutDetails(null);            
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
            User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
            System.runAs(readOnlyUser) {
                 RiskApexController.getAccoutDetails(acct);     
            }
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        
        Test.stopTest();
    }
     public testMethod static void validategetupdateAccountRiskScore(){
        Account acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1];
        Test.startTest();
        try{
            RiskApexController.updateAccountRiskScore(acct);            
            RiskApexController.updateAccountRiskScore(null);            
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
         try{
             User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
             System.runAs(readOnlyUser) {
                 RiskApexController.updateAccountRiskScore(acct);            
             }
         }catch(Exception ex){
             System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
         }
         
        Test.stopTest();
    }
    public testMethod static void validategetupdateAccountReviewDate(){
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;        
        Test.startTest();
        try{
            RiskApexController.updateAccountReviewDate('acctdsklfjkdsl',null);                                
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        try{
            RiskApexController.updateAccountReviewDate(acct,null);                                
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        Test.stopTest();
    }
    
}