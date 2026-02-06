@isTest
public class testMedicalPersistencyController {
    static testMethod void method1() {
        User sce = [Select Id,UserRole.Name,VPCR__c from User where VPCR__c != TRUE and UserRole.Name like '%CRM Administrator%' and IsActive = true ][0];
        User vpcr = [Select Id,UserRole.Name,VPCR__c from User where VPCR__c = TRUE][0];
        
        Date sampleDate1 = Date.newInstance(2019, 1, 1);
        Date sampleDate2 = Date.newInstance(2020, 2, 15);
        
        System.debug('userId>>'+vpcr.Id);
        Account acc = new Account();
        acc.Name = 'Sample Account';
        acc.Subtype__c = 'Complex Accounts';
        insert acc;
        
        CM_Account_Team_History__c cmat = new CM_Account_Team_History__c();
        cmat.Account_Firm__c = acc.Id;
        cmat.User__c = sce.Id;
        cmat.Job_Title__c = 'Strategic Client Executive';
        cmat.Case_Management_Start_Date__c = sampleDate1;
        cmat.Case_Management_End_Date__c = Date.newInstance(2020, 1, 1);
        insert cmat;
        
        CM_Account_Team_History__c cmat1 = new CM_Account_Team_History__c();
        cmat1.Account_Firm__c = acc.Id;
        cmat1.User__c = vpcr.Id;
        cmat1.Case_Management_Start_Date__c = sampleDate1;
        cmat1.Case_Management_End_Date__c = Date.newInstance(2020, 1, 1);
        insert cmat1;
        
         CM_Account_Team_History__c cmat2 = new CM_Account_Team_History__c();
        cmat2.Account_Firm__c = acc.Id;
        cmat2.User__c = vpcr.Id;
        cmat2.Case_Management_Start_Date__c = Date.newInstance(2024, 1, 1);
        cmat2.Case_Management_End_Date__c = null;
        insert cmat2;
        
        PolicyAccountMembership__c pam = new PolicyAccountMembership__c();
        pam.Name = 'Total GL Membership';
        pam.AccountFirm__c = acc.Id;
        pam.GLDate__c = sampleDate2;
        pam.MembershipType__c = 'Medical';
        pam.Prior_Year_GL_Membership__c = 10;
        pam.GLMembership__c = 20;
        pam.Transfer_In__c = 30;
        pam.Transfer_Out__c = 40;
        pam.Adjusted_Prior_Year_GL_Membership__c = 50;
        pam.Adjusted_Current_GL_Membership__c = 60;
        pam.Override_Current_GL_Membership__c = 70;
        //pam.Membership_Persistency__c = 50;
        //pam.Override_Membership_Persistency__c = 60;
        insert pam;
        
       
        System.runAs(sce){
            medicalPersistencyController.fetchPicklist();          
            medicalPersistencyController.getTemplateInXML();
            medicalPersistencyController.medicalPersistencyData2('IY19, 1/1/20','Asc');            
        }

        System.runAs(vpcr){
            medicalPersistencyController.fetchPicklist();        
            medicalPersistencyController.getTemplateInXML(); 
            medicalPersistencyController.medicalPersistencyData2('IY19, 1/1/20','Asc');
            medicalPersistencyController.medicalPersistencyData2('','Asc');
            medicalPersistencyController.medicalPersistencyData2('IY19, 1/1/20','');
        }
               
    }
}