/*------------------------------------------------------------
 * Author:          Ashutosh
 * Company:         CRMIT
 * Description:     This class is used for GenerateClientSurveyController code coverage   
 * History:
 * 2021-06-24
 * ------------------------------------------------------------*/
@isTest
public class GenerateClientSurveyController_Test {
    @testSetup static void setupTestData() {
        UserRole obj=new UserRole(Name= 'ABC'); 
        insert obj; 
        
        Profile pf= [Select Id from profile where Name='System Administrator'];         
        String orgId=UserInfo.getOrganizationId(); 
        String dateString=String.valueof(Datetime.now()).replace(' ','').replace(':','').replace('-','');
        Integer RandomId=Integer.valueOf(Math.rint(Math.random()*1000000)); 
        String uniqueName=orgId+dateString+RandomId; 
        Id CDContactRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
        
        User cmc_user = new User(firstname = 'ABC', 
                                 lastName = 'XYZ', 
                                 email = uniqueName + '@uhg.com', 
                                 Username = uniqueName + '@test' + orgId + '.org', 
                                 EmailEncodingKey = 'ISO-8859-1', 
                                 Alias = uniqueName.substring(18, 23), 
                                 TimeZoneSidKey = 'America/Los_Angeles', 
                                 LocaleSidKey = 'en_US', 
                                 LanguageLocaleKey = 'en_US', 
                                 ProfileId = pf.Id, 
                                 UserRoleId = obj.Id,
                                 
                                 Position__c = 'Client Management Consultant'
                                ); 
        insert cmc_user;
        
        cmc_user.Salary_Grade__c = '27';
        update cmc_user;
        User sce_user = new User(firstname = 'ABC', 
                                 lastName = 'XYZ', 
                                 email = uniqueName + 'sce@uhg.com', 
                                 Username = uniqueName + 'sse@test' + orgId + '.org', 
                                 EmailEncodingKey = 'ISO-8859-1', 
                                 Alias = uniqueName.substring(18, 23), 
                                 TimeZoneSidKey = 'America/Los_Angeles', 
                                 LocaleSidKey = 'en_US', 
                                 LanguageLocaleKey = 'en_US', 
                                 ProfileId = pf.Id, 
                                 UserRoleId = obj.Id,
                                 Salary_Grade__c = '27',
                                 Position__c = 'SCE'
                                ); 
        insert sce_user;
        system.runAs(sce_user){
            list<account> acList =new List<account>();
            Account acc = new Account();
            acc.Name = 'Salesforce';
            acc.CM_SCE__c = sce_user.Id;
            acc.CM_CMC_Validation_By__c = cmc_user.Id;
            acc.SCE_Validation_DateTime__c = system.now();
            acc.Subtype__c = 'Prospect' ;
            acc.Specialty_SCE_Involved__c = 'Sarah Theodossopoulos';
            acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
            
            acList.add(acc);
            
            Account acc1 = new Account();
            acc1.Name = 'Salesforce1';
            acc1.CM_SCE__c = sce_user.Id;
            acc1.CM_CMC_Validation_By__c = cmc_user.Id;
            acc1.SCE_Validation_DateTime__c = system.now();
            acc1.Subtype__c = 'Specialty Benefits Only' ;
            acc1.Specialty_SCE_Involved__c = 'Sarah Theodossopoulos';
            acc1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
            
            acList.add(acc1);
            insert acList;
            
            Contact con = new Contact();
            con.FirstName ='test';
            con.LastName = 'test';
            con.AccountId = acc.Id;
            con.Correspondence_Type__c = 'Customer Survey - Secondary';
            con.Status__c = 'Active';
            con.RecordTypeId=CDContactRecord;
            insert con;
            
            Service_AMT__c SAMTobj = new Service_AMT__c();
            SAMTobj.First_Name__c = 'test';
            SAMTobj.Last_Name__c = 'test';
            SAMTobj.Contact_Role__c = 'Service Account Manager';
            SAMTobj.Company__c = acc.Id;
            SAMTobj.Case_Management_Start_Date__c = system.today().addDays(-10);
            SAMTobj.Primary__c = true;
            insert SAMTobj;
            Service_AMT__c SAMTobj11= new Service_AMT__c();
            SAMTobj11.First_Name__c = 'test1';
            SAMTobj11.Last_Name__c = 'test2';
            SAMTobj11.Contact_Role__c = 'Client Manager';
            SAMTobj11.Company__c = acc1.Id;
            SAMTobj11.Case_Management_Start_Date__c = system.today().addDays(-10);
            SAMTobj11.Primary__c = true;
            insert SAMTobj11;
        }

    }
    
    public static testmethod void testGeneratePdf(){
        Account acc = [SELECT Id FROM Account WHERE Name = 'Salesforce' LIMIT 1];
        String accId = acc.Id;
      
        PageReference pageRef = Page.GenerateClientSurveyPdf;
        pageRef.getParameters().put('recordId',acc.Id);
        test.setCurrentPageReference(pageRef);
        GenerateClientSurveyController obj = new GenerateClientSurveyController();
        Double x = obj.offset;
        system.assertNotEquals(null, x);
        
    }
    
    public static testmethod void testGeneratePdf2(){
        Account acc = [SELECT Id FROM Account WHERE Name = 'Salesforce1' LIMIT 1];
        String accId = acc.Id;
      
        PageReference pageRef = Page.GenerateClientSurveyPdf;
        pageRef.getParameters().put('recordId',acc.Id);
        test.setCurrentPageReference(pageRef);
        GenerateClientSurveyController obj = new GenerateClientSurveyController();
        Double x = obj.offset;
        system.assertNotEquals(null, x);
        
    }
}