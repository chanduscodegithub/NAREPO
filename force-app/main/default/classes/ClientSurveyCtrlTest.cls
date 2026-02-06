/*------------------------------------------------------------
* Author:          Ashutosh
* Company:         CRMIT
* Description:     This class is used for ClientSurveyCtrl code coverage   
* History:
* 2021-06-24
* ------------------------------------------------------------*/
@IsTest
public class ClientSurveyCtrlTest {
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
            Account cDAccEquity = new Account();
            cDAccEquity.Name = 'Equity Healthcare';
            cDAccEquity.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
            cDAccEquity.Subtype__c = 'Collaborative Ventures Group (CVG)';
            insert cDAccEquity;
            
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
            
        }
        
    }
    
    
    
    public static testmethod void testgetOpty(){
        List<Opportunity> lstOpp = ClientSurveyCtrl.getOpty();
        system.assertNotEquals(null, lstOpp);
    }
    
    public static testmethod void testupdateOppRecods(){
        List<Opportunity> lst = [SELECT Id,Comments_Last_Modified__c, Comments__c FROM Opportunity];
        ClientSurveyCtrl.updateOppRecods(lst);
        system.assertNotEquals(0, lst.size());
        
    }
    
    public static testmethod void testgetUserRole(){
        User u = [SELECT Id FROM User WHERE LastName ='XYZ' LIMIT 1];
        ClientSurveyCtrl.getUserRole(u.Id);
        system.assertNotEquals(null, u);
    }
    
    public static testmethod void testsaveSCEValidation(){
        Account acc = [SELECT Id FROM Account WHERE Name ='Salesforce' LIMIT 1];
        ClientSurveyCtrl.saveSCEValidation(acc.Id);
        system.assertNotEquals(null, acc);
    }
    public static testmethod void testsaveCMCValidation(){
        Account acc = [SELECT Id FROM Account WHERE Name ='Salesforce' LIMIT 1];
        ClientSurveyCtrl.saveCMCValidation(acc.Id);
        system.assertNotEquals(null, acc);
    }
    
    public static testmethod void testgetAccountsandOpportunities(){
        system.debug('%%%%'+[SELECT Id FROM ProductMix__c ]);
        Account acc = [SELECT Id FROM Account WHERE Name ='Salesforce' LIMIT 1];
        ClientSurveyCtrl.getAccountsandOpportunities(true, true, 'test' , 'test', 'test', 'test', acc.Id );
        system.assertNotEquals(null, acc);
    }
    
    public static testmethod void testgetLoggedInUserData(){
        ClientSurveyCtrl.WorkItemsClass_Wrapper ww = new ClientSurveyCtrl.WorkItemsClass_Wrapper();
        ww.sceUserList = new Set<User>();
        ww.cmSceOppList = new List<Opportunity>();
        ww.oppOwnweSetWrap =  new Set<String>();
        ww.oppCMVPCRRVPSetWrap = new Set<String>();
        ww.vpcrSCEMapWrap = new Map<String,set<String>>();
        ww.getCurrentProduct = new ProductMix__c();
        ww.clientSurveyDates = new list <Client_Survey_Account__mdt>();
        ww.cmcmcValidatedTime = system.today();
        ww.offSet = 10;
        User u = [SELECT Id FROM User WHERE LastName ='XYZ' LIMIT 1];
        //LoggedInUserData(Id userId, String loggedInAs, Boolean onLoad, Boolean onFilter, String cmvcpfilter, String ownerfilter, WorkItemsClass_Wrapper workitem, String  columnName, String sortType) 
        
        ClientSurveyCtrl.LoggedInUserData(u.Id, 'Admin' , true, true, 'All' , '', ww, 'LastModifiedById', 'DESC');
        ClientSurveyCtrl.LoggedInUserData(u.Id, 'CMVPCR' , true, true, '' , '', ww, 'LastModifiedById', 'DESC');
        ClientSurveyCtrl.LoggedInUserData(u.Id, 'CMSCE' , true, true, '' , '', ww, 'LastModifiedById', 'DESC');
        
        ClientSurveyCtrl.LoggedInUserData(u.Id, 'CMSCE' , false, true, 'All' , 'All', ww, 'LastModifiedById', 'DESC');
        ClientSurveyCtrl.LoggedInUserData(u.Id, 'Admin' , false, true, 'All' , 'All', ww, 'LastModifiedById', 'DESC');
        ClientSurveyCtrl.LoggedInUserData(u.Id, 'CMVPCR' , false, true, 'All' , 'All', ww, 'LastModifiedById', 'DESC');
        system.assertNotEquals(null, u);
        
    }
    
    public static testmethod void testfetchDefaultContacts(){
        Account acc = [SELECT Id FROM Account WHERE Name ='Salesforce' LIMIT 1];
        ClientSurveyCtrl.fetchDefaultContacts(acc.Id);
        system.assertNotEquals(null, acc);
    }
    
    public static testmethod void testsearchedContacts(){
        Account acc = [SELECT Id FROM Account WHERE Name ='Salesforce' LIMIT 1];
        ClientSurveyCtrl.searchedContacts('test','First Name','Begins With',acc.Id);
        ClientSurveyCtrl.searchedContacts('test','First Name','Equals To',acc.Id);
        ClientSurveyCtrl.searchedContacts('test','First Name','Contains',acc.Id);
        
        ClientSurveyCtrl.searchedContacts('test','Last Name','Begins With',acc.Id);
        ClientSurveyCtrl.searchedContacts('test','Last Name','Equals To',acc.Id);
        ClientSurveyCtrl.searchedContacts('test','Last Name','Contains',acc.Id);
        
        ClientSurveyCtrl.searchedContacts('Salesforce','Company','Begins With',acc.Id);
        ClientSurveyCtrl.searchedContacts('Salesforce','Company','Equals To',acc.Id);
        ClientSurveyCtrl.searchedContacts('Salesforce','Company','Contains',acc.Id);
        system.assertNotEquals(null, acc);
    }
    
    public static testmethod void testsaveNpsContactData(){
        Account acc = [SELECT Id FROM Account WHERE Name ='Salesforce' LIMIT 1];
        Contact con = new Contact();
        
        con.Lastname = 'test2';
        con.FirstName = 'test2';
        con.Email ='test2@uhc.com';
        con.AccountId = acc.Id;
        con.Status__c = 'Active';
        
        con.DoNotSendCorrespondence__c = false;
        insert con;
        ClientSurveyCtrl.saveNpsContactData(new List<Contact>{con});
        system.assertNotEquals(null, acc);
    }
    
}