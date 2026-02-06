@IsTest
public class ClientSurveyDML_Test {
    
      @testSetup static void setupTestData() {
        UserRole obj=new UserRole(Name= 'ABC'); 
        insert obj; 
        
        Profile pf= [Select Id from profile where Name='System Administrator'];         
        String orgId=UserInfo.getOrganizationId(); 
        String dateString=String.valueof(Datetime.now()).replace(' ','').replace(':','').replace('-','');
        Integer RandomId=Integer.valueOf(Math.rint(Math.random()*1000000)); 
        String uniqueName=orgId+dateString+RandomId; 
        
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
                                 Position__c = 'SCE'
                                ); 
        insert sce_user;
        system.runAs(sce_user){
            Account acc = new Account();
            acc.Name = 'Salesforce';
            acc.CM_SCE__c = sce_user.Id;
            acc.CM_CMC_Validation_By__c = cmc_user.Id;
            acc.SCE_Validation_DateTime__c = system.now();
            acc.Subtype__c ='Prospect';
            acc.Specialty_SCE_Involved__c = 'Sarah Theodossopoulos';
            acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
            insert acc;
            
            Service_AMT__c SAMTobj = new Service_AMT__c();
            SAMTobj.First_Name__c = 'test';
            SAMTobj.Last_Name__c = 'test';
            SAMTobj.Contact_Role__c = 'Specialty Benefits Client Manager';
            SAMTobj.Company__c = acc.Id;
            SAMTobj.Case_Management_End_Date__c = system.today().addDays(10);
            SAMTobj.Primary__c = true;
            insert SAMTobj;
            
            List<Opportunity> oppList = new List<Opportunity>();
            Opportunity opp = new Opportunity();
            opp.Name = 'Test Opportunity1'; 
            opp.AccountId = acc.Id;
            opp.Reason_for_the_Opportunity_Risk__c ='Confirmed or Likely RFP';
            opp.EffectiveDate__c = System.Today();
            opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
            opp.Product_Type_Involved_in_Opp__c = 'Medical';
            opp.CloseDate = System.Today();
            opp.StageName = 'Qualification';
            opp.Expected_Date_of_RFP__c = System.Today(); 
            opp.CM_VPCR_RVP__c = cmc_user.Id;
            opp.Comments_Last_Modified__c = System.now();
            opp.Comments__c = 'ttttt';
            opp.OwnerId = cmc_user.Id;
            opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
            oppList.add(opp);
            insert oppList;
            
            Contact con = new Contact();
            con.Lastname = 'test';
            con.FirstName = 'test';
            con.Email ='test@uhc.com';
            con.AccountId = acc.Id;
            con.Status__c = 'Active';
            
            con.DoNotSendCorrespondence__c = false;
            insert con;
            
            ProductMix__c pmix = new ProductMix__c();
            pmix.Name = 'Test Pmix';
            pmix.AccountFirm__c = acc.Id;
            insert pmix; 
            
        }
        
    }
    
    public static testmethod void testUpdateContact(){
        Contact con = [SELECT Id FROM Contact WHERE LastName ='test' LIMIT 1];
        ClientSurveyDML.updateContacts(new List<Contact>{con});
    }
    
    public static testmethod void testUpdateCurrentProd(){
        ProductMix__c obj = [SELECT Id FROM ProductMix__c WHERE Name = 'Test Pmix' LIMIT 1];
        ClientSurveyDML.updateProductMix(obj);
    }
    

}