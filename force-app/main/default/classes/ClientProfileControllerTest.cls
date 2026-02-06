@isTest
public class ClientProfileControllerTest {
    
	
   @testSetup static void createTestData(){
       
       
         List<Account> testAccRecords = new List<Account>();
       testAccRecords.add(new Account(Name='testAccountSurvey',Subtype__c ='Enterprise Strategic Accounts',
                           Current_Deal_Start_Date__c= Date.newInstance(2020, 01, 01),Current_Deal_Next_Renewal_Date__c = Date.newInstance(2020, 12, 30)));
        
       
       testAccRecords.add(new Account(Name='Aetna',Subtype__c ='Competitor',
                           RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));
        testAccRecords.add(new Account(Name='Cigna',Subtype__c ='Competitor',
                           RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()));

            
        insert testAccRecords;       
        
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
                Account__c =[SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1].id));
        }
        
        insert surveyRecords;
       
       SeniorUHGExecutivesEngaged__c sen = new SeniorUHGExecutivesEngaged__c();
        sen.EnterpriseExecutiveSponsorNameOther__c ='testdata'; 
        sen.EnterpriseExecutiveSponsorName__c ='enterpriseExecutives';
        sen.EnterpriseExecutiveSponsorResponsibiliti__c ='testdata';
        sen.OptumExecutiveSponsorName__c ='testdata';
        sen.OptumExecutiveSponsorResponsibilities__c ='testdata';
        sen.OtherExecutiveName2__c ='testdata';
        sen.OtherExecutiveName1__c  ='testdata';
        sen.OtherExecutiveName3__c ='testdata';
        sen.OtherExecutiveName4__c  ='testdata';
        sen.OtherExecutiveName5__c ='testdata';
        sen.OtherExecutiveResponsibilities1__c ='testdata';
        sen.OtherExecutiveResponsibilities2__c ='testdata';
        sen.OtherExecutiveResponsibilities3__c ='testdata';
        sen.OtherExecutiveResponsibilities4__c ='testdata';
        sen.OtherExecutiveResponsibilities5__c ='testdata';
        sen.OtherExecutiveTitle1__c ='testdata';
        sen.OtherExecutiveTitle2__c ='testdata';
        sen.OtherExecutiveTitle3__c ='testdata';
        sen.OtherExecutiveTitle4__c ='testdata';
        sen.OtherExecutiveTitle5__c ='testdata';
        sen.Account__c =[SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1].Id;
        sen.UHCExecutiveSponsorName__c ='testdata';
        sen.UHCExecutiveSponsorResponsibilities__c='testdata';
        insert sen;
        
        
        SeniorUHGExecutivesEngaged__c sen2 = new SeniorUHGExecutivesEngaged__c();
        sen2.EnterpriseExecutiveSponsorNameOther__c ='testdata'; 
        sen2.EnterpriseExecutiveSponsorName__c ='enterpriseExecutives';
        sen2.EnterpriseExecutiveSponsorResponsibiliti__c =null;
        sen2.OptumExecutiveSponsorName__c ='testdata';
        sen2.OptumExecutiveSponsorResponsibilities__c =null;
        sen2.OtherExecutiveName2__c ='testdata';
        sen2.OtherExecutiveName1__c  ='testdata';
        sen2.OtherExecutiveName3__c ='testdata';
        sen2.OtherExecutiveName4__c  ='testdata';
        sen2.OtherExecutiveName5__c ='testdata';
        sen2.OtherExecutiveResponsibilities1__c =null;
        sen2.OtherExecutiveResponsibilities2__c =null;
        sen2.OtherExecutiveResponsibilities3__c =null;
        sen2.OtherExecutiveResponsibilities4__c =null;
        sen2.OtherExecutiveResponsibilities5__c =null;
        sen2.OtherExecutiveTitle1__c ='testdata';
        sen2.OtherExecutiveTitle2__c ='testdata';
        sen2.OtherExecutiveTitle3__c ='testdata';
        sen2.OtherExecutiveTitle4__c ='testdata';
        sen2.OtherExecutiveTitle5__c ='testdata';
        sen2.Account__c =[SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1].Id;
        sen2.UHCExecutiveSponsorName__c ='testdata';
        sen2.UHCExecutiveSponsorResponsibilities__c=Null;
        insert sen2;
        
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
                Company__c = [SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1].id));
        }
        financialRecords.add(new Financial__c(
                Name = 'Financial Test',
                Membership_Type__c = 'Medical',            
                Year__c =  Date.newInstance(2016, 10, 20), 
           		Last_Updated__c= Date.newInstance(2018, 4, 12),
                Financial_Type__c = 'Total',
                Company__c = [SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1].id));
        
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
                Company__c = [SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1].id));
        } 
       /* financialRecords.add(new Financial__c(
                Name = 'Financial Test',
                Membership_Type__c = 'RX',            
                Year__c =  Date.newInstance(2016, 9, 17),                            
                Company__c = acc.id));*/

        insert financialRecords;                               


       Account[] accCmptrs = [Select Id, Name from Account where Subtype__c='Competitor'];
        Id aetnaCmptrId;
        Id cignaCmptrId;
        Id blueCmptrId;
        if(accCmptrs != null && accCmptrs.size() > 0) {
            for(Account accObj : accCmptrs) {
                if(accObj != null && accObj.Name == 'Aetna') {
                    aetnaCmptrId = accObj.Id;
                } else if(accObj != null && accObj.Name == 'Cigna') {
                    cignaCmptrId = accObj.Id;
                } else if(accObj != null && accObj.Name == 'Blue') {
                    blueCmptrId = accObj.Id;
                }
            }
        }
       
        Account acct = [SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1];
        String accountId = acct.Id;
       
        Account accCF = new Account();
        accCF.Name = 'account1';
        accCF.Subtype__c ='Consulting Firm';
        accCF.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert accCF;
       
       
       Id ConsultantRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();      
       Contact c = new Contact();      
        c.AccountId=accCF.Id;
        c.CEO__c=false;
        c.FirstName ='test acconsultiongfirm1';
        c.LastName='lasr acconsultiongfirm1';
        c.OtherCountry='United States';
        c.RecordTypeId=ConsultantRecord;
        c.DecisionMakingRole__c='Consultant Practice Leader';
        c.Status__c='Active';        
        insert c;
       
       
       AccountContactRelation acc_Con_Rel = new AccountContactRelation();
        acc_Con_Rel.ContactId = c.Id;       
        acc_Con_Rel.AccountId = acct.Id;
       //acc_Con_Rel.IsDirect = false;
        insert acc_Con_Rel;
       
      Account accAgg = new Account();
        accAgg.Name = 'account BGH';
        accAgg.Subtype__c ='Business Group on Health (BGH)';
        accAgg.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();       
        insert accAgg; 
       
       BGH__c bgh = new BGH__c();
       bgh.New_Account__c = acct.id;
       bgh.BGH_Account__c = accAgg.id;
       insert bgh;
       
        List<Goal__c> goalRecords = new List<Goal__c>();
        Goal__c goalRec = new Goal__c(           
            Goal_Write_In__c = 'Test Write in',
            Sales_Season__c = 'IY 21, 1/1/2022',
            Goal__c = 'Protect / Renew Current Book of Business (Mandatory Goal)',
            Company__c = acct.Id
        );
        goalRecords.add(goalRec);
        
        Goal__c goalRec1 = new Goal__c(           
            Goal_Write_In__c = 'Test Goal Write in',
            Sales_Season__c = 'IY 21, 1/1/2022',
            Goal__c = 'Attain / Maintain NPS Promoter Rating (Mandatory Goal)',
            Company__c = acct.Id
        );
        goalRecords.add(goalRec1);
      
       insert goalRecords;
       
        List<Strategy__c> strategyRecords = new List<Strategy__c>();
        Strategy__c strategyRec = new Strategy__c(
        	Strategy_Write_In__c = 'Strategy Write in 1',
            Strategy__c = 'Offer Trend Guarantee',
            Goal__c = goalRec.Id,
            Action_Steps_PlannedTaken__c = 'Action Steps'
        );
        strategyRecords.add(strategyRec);
        
        Strategy__c strategyRec1 = new Strategy__c(
        	Strategy_Write_In__c = 'Strategy Write in 2',
            Strategy__c = 'Introduce Executive Sponsor',
            Goal__c = goalRec1.Id,
            Action_Steps_PlannedTaken__c = 'Action Steps to be taken'
        );
        strategyRecords.add(strategyRec1);
       
       insert strategyRecords;
       
       Medical_Trend__c medicalTrend = new Medical_Trend__c();
        medicalTrend.Company__c = acct.Id;
        medicalTrend.Name = 'test record';
        medicalTrend.Year__c = Date.newInstance(2021, 01, 01);
        medicalTrend.Policy_level_medical_trends__c = 9.2;
        medicalTrend.Medical_Trend_Type__c = 'Surest';
        insert medicalTrend;
       
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
        
    }
    
    @isTest
    public static void getClientProfileDataTest(){
        system.debug('accountId-------');
        
         Account acct = [SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1];
        String accountId = acct.Id;
        system.debug('accountId-------'+accountId);
        
        Account accNA = new Account();
        accNA.Name = 'National Accounts';
        accNA.Subtype__c ='Competitor';
        accNA.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert accNA;
        
        Account totalAcc = new Account();
        totalAcc.Name = 'Total';
        totalAcc.Subtype__c ='Competitor';
        totalAcc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert totalAcc;
        
        Account OptumRxAcc = new Account();
        OptumRxAcc.Name = 'Optum Rx';
        OptumRxAcc.Subtype__c ='Competitor';
        OptumRxAcc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert OptumRxAcc;
        
         Account uhcOptumAcc = new Account();
        uhcOptumAcc.Name = 'UHC-Optum';
        uhcOptumAcc.Subtype__c ='Competitor';
        uhcOptumAcc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert uhcOptumAcc;
        
         List<Competitor__c> naCompetitorsList = new List<Competitor__c>();
        naCompetitorsList.add(returnCompetitorObjData(acct.Id, accNA.id, 'Medical', 10, 100,''));
        naCompetitorsList.add(returnCompetitorObjData(acct.Id, accNA.id, 'Pharmacy', 10, 100,''));
        naCompetitorsList.add(returnCompetitorObjData(acct.Id,  accNA.id, 'Dental', 20, 100,''));
        naCompetitorsList.add(returnCompetitorObjData(acct.Id,  accNA.id, 'Vision', 0, 0,''));
       insert naCompetitorsList;

        
         List<Competitor__c> totalCompetitorsList = new List<Competitor__c>();
        totalCompetitorsList.add(returnCompetitorObjData(acct.Id, totalAcc.id, 'Medical', 10, 100,''));
        totalCompetitorsList.add(returnCompetitorObjData(acct.Id, totalAcc.id, 'Pharmacy', 10, 100,''));
        totalCompetitorsList.add(returnCompetitorObjData(acct.Id,  totalAcc.id, 'Dental', 20, 100,''));
        totalCompetitorsList.add(returnCompetitorObjData(acct.Id,  totalAcc.id, 'Vision', 0, 0,''));
       insert totalCompetitorsList;
       
       List<Competitor__c> optumRxCompetitorsList = new List<Competitor__c>();
        optumRxCompetitorsList.add(returnCompetitorObjData(acct.Id, OptumRxAcc.id, 'Medical', 10, 100,''));
        optumRxCompetitorsList.add(returnCompetitorObjData(acct.Id, OptumRxAcc.id, 'Pharmacy', 10, 100,''));
        optumRxCompetitorsList.add(returnCompetitorObjData(acct.Id, OptumRxAcc.id, 'Dental', 20, 100,''));
        optumRxCompetitorsList.add(returnCompetitorObjData(acct.Id, OptumRxAcc.id, 'Vision', 0, 0,''));
       insert optumRxCompetitorsList;
        
        List<Competitor__c> uhcOptumCompetitorsList = new List<Competitor__c>();
        uhcOptumCompetitorsList.add(returnCompetitorObjData(acct.Id, uhcOptumAcc.id, 'Other', 10, 100,'Life'));
        uhcOptumCompetitorsList.add(returnCompetitorObjData(acct.Id, uhcOptumAcc.id, 'Other', 10, 100,'Disability'));
        uhcOptumCompetitorsList.add(returnCompetitorObjData(acct.Id, uhcOptumAcc.id, 'Other', 20, 100,'Supplemental Health (APP\\CI\\HI)'));
        uhcOptumCompetitorsList.add(returnCompetitorObjData(acct.Id, uhcOptumAcc.id, 'Other', 0, 0,'Hearing'));
        uhcOptumCompetitorsList.add(returnCompetitorObjData(acct.Id, uhcOptumAcc.id, 'Other', 0, 0,'Pet Insurance'));
      
        insert uhcOptumCompetitorsList;
        
        Test.startTest();
    
        ClientProfileController.getClientProfileData(accountId);
        //System.assert(csrReturnMap.size()>0);
          Test.stopTest();
    }
    
    @isTest
    public static void getClientPlanDataTest(){
        
          Account acct = [SELECT Id FROM Account WHERE Name='testAccountSurvey' LIMIT 1];
        String accountId = acct.Id;
        
         Test.startTest();
    
        ClientProfileController.getClientPlanData(accountId);
        //System.assert(csrReturnMap.size()>0);
          Test.stopTest();
        
        
    }
    
     public static Competitor__c returnCompetitorObjData(Id accId, String compId, String compClassification, Integer noOfMemHeld, Integer OfMemHeld,String typeOfServiceProvided) {
        
		Competitor__c compObj = new Competitor__c(CompetitorAccount__c = compId,
                                                  Account__c = accId,
                                                  Type__c = 'Account Competitor',
                                                  Competitorclassification__c = compClassification,
                                                  NumberOfMembersHeld__c = noOfMemHeld,
                                                  ofMembersHeld__c = OfMemHeld,
                                                  Type_of_Products_Services_Provided__c = typeOfServiceProvided,
                                                  Comments__c = '');
            
        return compObj;
    }
}