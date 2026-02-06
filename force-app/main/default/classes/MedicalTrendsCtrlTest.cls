@isTest
public class MedicalTrendsCtrlTest {
    @isTest
    public static void getMedTrendsDetailsTest(){
        
        
        Account account = new Account(Name='testAccountSurvey',Subtype__c ='Enterprise Strategic Accounts',
                           Current_Deal_Start_Date__c= Date.newInstance(2020, 01, 01),Current_Deal_Next_Renewal_Date__c = Date.newInstance(2020, 12, 30));
        insert account;
        
        Medical_Trend__c medicalTrend = new Medical_Trend__c();
        medicalTrend.Company__c = account.Id;
        medicalTrend.Name = 'test record';
        medicalTrend.Year__c = Date.newInstance(2021, 01, 01);
        medicalTrend.Policy_level_medical_trends__c = 9.2;
        medicalTrend.Medical_Trend_Type__c = 'Surest';
        insert medicalTrend;
        
         Test.startTest();
    
        MedicalTrendsCtrl.getMedTrendsDetails(account.Id,'Traditional');
        MedicalTrendsCtrl.getMedTrendsDetails(account.Id,'Surest');
        //System.assert(csrReturnMap.size()>0);
          Test.stopTest();
        
    }

}