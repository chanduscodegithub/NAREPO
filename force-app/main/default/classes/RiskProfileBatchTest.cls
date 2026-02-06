@isTest
public class RiskProfileBatchTest {
    @testSetup static void createTestData() {
        
         // Creating the test Accoun        
         List<Account> accList = new List<Account>();
        for(Integer i = 0; i< 11 ; i++){
            Account acc = new Account();
            acc.Name = 'testAccount';
            acc.Subtype__c ='National Accounts - East';
            acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
            accList.add(acc);
        }
        insert accList;
        
        List<RiskProfile__c> riskProfileList = new List<RiskProfile__c>();
        
        Integer accCount = 0;
        
        for(Account acc : accList){
            accCount++;
            if(accCount > 9){
                break;
            }
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
            if(accCount == 2){
                riskProfile.RiskFactorValue__c = '$47987jhdsf';
            }
            riskProfile.WeightMultiplier__c = 5;
            riskProfile.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
            riskProfileList.add(riskProfile);
            
            RiskProfile__c riskProfile1 = new RiskProfile__c();            
            riskProfile1.SCERiskTypeAddlRiskFactorType__c = 'Bid Risk';            
            riskProfile1.AccountFirm__c = acc.Id;
            riskProfile.RiskFactorValue__c = 'Yes';
            if(accCount == 2){
                riskProfile.RiskFactorValue__c = 'Yesdsf';
            }
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
            riskProfile.WeightMultiplier__c = 5;
            if(accCount == 2){
                riskProfile3.RiskFactorValue__c = '100%dsjklf%';                
            }
            riskProfile3.WeightMultiplier__c = 5;
            riskProfile3.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
            riskProfileList.add(riskProfile3);
            
            RiskProfile__c riskProfile4 = new RiskProfile__c();            
            riskProfile4.SCERiskTypeAddlRiskFactorType__c = 'Renewal Risk';            
            riskProfile4.AccountFirm__c = acc.Id;
            riskProfile4.WeightMultiplier__c = 5;
            riskProfile4.RiskFactorValue__c = 'Yes';
            if(accCount == 2){
                 riskProfile4.RiskFactorValue__c = 'Yeskhj';
            }
            riskProfile4.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
            riskProfileList.add(riskProfile4);
            
            RiskProfile__c riskProfile5 = new RiskProfile__c();            
            riskProfile5.SCERiskTypeAddlRiskFactorType__c = 'Overall Satisfaction with AMT';            
            riskProfile5.AccountFirm__c = acc.Id;
            riskProfile5.RiskFactorValue__c = '10';
            if(accCount == 2){
                 riskProfile5.RiskFactorValue__c = 'slkjdf';
            }
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
            if(accCount == 2){
                 riskProfile7.RiskFactorValue__c = 'slkjdf';
            }
            riskProfile7.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
            riskProfileList.add(riskProfile7);
            
            RiskProfile__c riskProfile8 = new RiskProfile__c();            
            riskProfile8.SCERiskTypeAddlRiskFactorType__c = 'Optum LTR Score';            
            riskProfile8.AccountFirm__c = acc.Id;
            riskProfile8.RiskFactorValue__c = '100';
            if(accCount == 2){
                 riskProfile8.RiskFactorValue__c = 'sdg';
            }
            riskProfile8.WeightMultiplier__c = 5;
            riskProfile8.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
            riskProfileList.add(riskProfile8);
            
            RiskProfile__c riskProfile9 = new RiskProfile__c();            
            riskProfile9.SCERiskTypeAddlRiskFactorType__c = 'LTR Score';            
            riskProfile9.AccountFirm__c = acc.Id;
            riskProfile9.WeightMultiplier__c = 5;            
            riskProfile9.RiskFactorValue__c = '100';
             if(accCount == 2){
                 riskProfile9.RiskFactorValue__c = 'sdg';
            }

            riskProfile9.RiskProfileType__c = UHGAccountSOQLConstants.ADDITIONAL_RISK_FACTOR;
            riskProfileList.add(riskProfile9);
        }
        
        insert riskProfileList;
        
        User readOnlyUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@asdf.com',
            Username = 'uhgDevReadOnly@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US');
        
        insert readOnlyUser;    
        
        //Risk_Profile__mdt[] riskProfileMetaData = [SELECT Id, Language, NamespacePrefix, Label, QualifiedApiName, Risk_Profile_Type__c, Order__c, Data_Type__c, Additional_Information__c, Weight_Multiplier__c, Raw_Score__c, Impact__c, DeveloperName, MasterLabel FROM Risk_Profile__mdt]; 
        
    }
    
    public testMethod static void validateGetRiskProfileMetaDate(){
        
        Test.startTest();
        
        Set<String> accountIdList  = new Set<String>();
        List<Account> accountList = [select id from account];
        for(Account acc : accountList)accountIdList.add(acc.Id);
        
        Database.executeBatch(new RiskProfileBatch(accountIdList));
        
        try{
            User readOnlyUser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
            System.runAs(readOnlyUser) {
                Database.executeBatch(new RiskProfileBatch(accountIdList));
            }
        }catch(Exception ex){
            System.debug('Line Number '+ex.getLineNumber()+' Message '+ex.getMessage());
        }
        
        Test.stopTest();
        
    }
    
}