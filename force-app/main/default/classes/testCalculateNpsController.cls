@isTest
public class testCalculateNpsController {
    static testMethod void sceMethod() {
        User sce = [Select Id,UserRole.Name,VPCR__c from User where VPCR__c != TRUE AND (UserRole.Name = 'CM SCE') AND IsActive = TRUE and id='0053s000002mOQrAAM'][0]; //OR UserRole.Name = 'Specialty Benefits SCE'
        User vpcr = [Select Id,UserRole.Name,VPCR__c from User where UserRole.Name = 'CM VPCR/RVP' AND VPCR__c = TRUE AND IsActive = TRUE and id='0056A000002F8kfQAC'][0];
        User rvp = [Select Id,UserRole.Name,VPCR__c from User where UserRole.Name = 'CM VPCR/RVP' AND VPCR__c != TRUE AND IsActive = TRUE and id='0056A000002F8jmQAC'][0];
        
        Date sampleDate1 = Date.newInstance(2019, 3, 28);
        Date sampleDate2 = Date.newInstance(2020, 2, 15);
        
        Account acc = new Account();
        acc.Name = 'Sample Account';
        acc.Subtype__c = 'Complex Accounts';
        insert acc;
        
        CM_Account_Team_History__c cmat = new CM_Account_Team_History__c();
        cmat.Account_Firm__c = acc.Id;
        cmat.User__c = sce.Id;
        cmat.Job_Title__c = 'Strategic Client Executive';
        cmat.Case_Management_Start_Date__c = sampleDate1;
        cmat.Case_Management_End_Date__c = Date.newInstance(2019, 10, 28);
        insert cmat;
        
        ClientSurveyResults__c csr = new ClientSurveyResults__c();
        csr.Type__c = 'Client Survey Results';
        csr.SCE__c = sce.Id;
        csr.Year__c = '2019';
        csr.Account__c = acc.Id;
        csr.LikelihoodtoRecommendScore__c = '10';
        csr.NetPromoterType__c = 'Detractor';
        csr.Fully_Termed_Client__c = TRUE;
        insert csr;
        
        System.runAs(sce){
            calculateNpsController.fetchPicklist();
            calculateNpsController.clientSurveyResultsData('','','');
            calculateNpsController.clientSurveyResultsData('IY19, 1/1/20','Asc','Account__r.Name');
            calculateNpsController.getTemplateInXML('sce');
        }
        
        System.runAs(vpcr){
            calculateNpsController.fetchPicklist();
            calculateNpsController.clientSurveyResultsData('','','');
            calculateNpsController.clientSurveyResultsData('IY19, 1/1/20','Asc','Account__r.Name');
            calculateNpsController.getTemplateInXML('vpcr'); 
        }
        
        System.runAs(rvp){
            calculateNpsController.fetchPicklist();
            calculateNpsController.clientSurveyResultsData('','','');
            calculateNpsController.clientSurveyResultsData('IY19, 1/1/20','Asc','Account__r.Name');
            calculateNpsController.getTemplateInXML('rvp');
        }
    }
}