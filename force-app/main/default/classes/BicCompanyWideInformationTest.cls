@isTest
public class BicCompanyWideInformationTest {
    
    @TestSetup
    public static void setup(){
        Account acc = new Account(Name='testAccount1',Subtype__c ='Prospect',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId());
        insert acc;
        Company_Wide_BiC_Information__c obj = new Company_Wide_BiC_Information__c( 
            Name = 'test', Company__c =acc.Id,
            vs_Cigna__c=12, Year__c = '2019'    );
        insert obj;
        
    }
    
    public testMethod static void validategetBicInformation(){
        Account acc = [SELECT Id FROM Account WHERE Name = 'testAccount1' LIMIT 1];
        List<Company_Wide_BiC_Information__c> lstBic = BicCompanyWideInformation.getBicInformation(acc.Id);
        System.assertNotEquals(0, lstBic.size());
    }
    
    public testMethod static void validateupdateBicInformation(){
        List<Company_Wide_BiC_Information__c> bic = [SELECT Id,vs_Blues__c FROM Company_Wide_BiC_Information__c LIMIT 1];
        bic[0].vs_Blues__c = 0.12;
        BicCompanyWideInformation.updateBicInformation(bic);
        List<Company_Wide_BiC_Information__c> afterUpdatebic = [SELECT Id,vs_Blues__c FROM Company_Wide_BiC_Information__c LIMIT 1];
        System.assertEquals(afterUpdatebic[0].vs_Blues__c, 0.12);
        try{
            //for catch block
            bic[0].vs_Blues__c = 222222222222222222222222.12;
            BicCompanyWideInformation.updateBicInformation(bic);
        }catch(Exception ex){
            System.assertEquals('Script-thrown exception', ex.getMessage());
        }
    }
    
    public testMethod static void validateuserDetails(){      
        try{
            BicCompanyWideInformation.userDetails(userInfo.getUserId());
        }catch(Exception ex){
            System.assertEquals('Script-thrown exception', ex.getMessage());
        }
    }
    
    public testMethod static void validatecheckRecordAccess(){      
        
        List<Company_Wide_BiC_Information__c> bic = [SELECT Id,vs_Blues__c FROM Company_Wide_BiC_Information__c LIMIT 1];
        BicCompanyWideInformation.checkRecordAccess(bic[0].Id);
        
    }
}