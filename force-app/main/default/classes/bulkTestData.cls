@isTest
public class bulkTestData {
    public static Account accCD;
    public static Account acconsultiongfirm1 ;
    public static Account accECCAC;
    public static Account accAgg;
    public static Account accAgg2;
    public static Account accOpp;
    public static Account accCompetitor;
    public static Account accCM;
    public static Account accCM2;
    public static Account acconrole;
    public static Account accFirm1;
    public static AccountCFJunction__c acc_Con_Firm;
    public static BGHContact__c  bghcontact1;
    
    public static  Opportunity opp;
    public static  Opportunity opp2;
    public static contact a;
    public static contact b;
    public static contact c;
    public static contact d;
    public static contact e;
    public static contact f;
    public static contact g;
    public static contact i;
    public static contact cmpcont;
    public static contact cmpcont1;
    public static contact cmpcont2;
    public static contact cmpcont3;
    
    public static OpportunityContactRole ocr;
    public static OpportunityContactRole ocr2;   
    public static User readOnlyUser ;
    public static User readandwriteUser ;
    public static User noaccessUser ;
    
    //public static User cmCSADUserRoleuser;
    //accountcontactrelation data creation
    public static Account accOppacr;
    public static Account acconsultiongfirm1acr;
    public static Account accCFdata;
    public static contact conacr;
    public static contact conacr1;
    public static Account acconroleacr;
    public static contact conaacr;
    public static AccountContactRelation acr;
    public static AccountContactRelation acrPF;
    
    public static OpportunityContactRole ocrf;
    public static void UserTestData() {
        Id userProfileId= [select Id, Name from Profile where name = 'System Administrator' limit 1].id;
        readOnlyUser = new User(
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
        	Position__c='Test User');        
        insert readOnlyUser;
        
        noaccessUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDevReadOnlyandnoaccessUser@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User');        
        insert noaccessUser;
        

        
        readandwriteUser = new User(
            LastName = 'LIVEE',
            FirstName='JASONN',
            Alias = 'jlivv',
            Email = 'jasonn.livestonn@crmit.com',
            Username = 'readandwriteUser@crmit.com',
            ProfileId =userProfileId,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US',
        	Position__c='Test User');        
        insert readandwriteUser;
        
    }
    
    public static void accountTestData() {
        
        acconsultiongfirm1 = new Account();
        acconsultiongfirm1.Name = 'Consulting Accounts';
        acconsultiongfirm1.Subtype__c ='Consulting Firm';
        acconsultiongfirm1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert acconsultiongfirm1;
        
        Account accNA = new Account();
        accNA.Name = 'National Accounts';
        accNA.Subtype__c ='Competitor';
        accNA.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert accNA;
        
        Account accNotNA = new Account();
        accNotNA.Name = 'Test Accounts';
        accNotNA.Subtype__c ='Competitor';
        accNotNA.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert accNotNA;
        
        Account accNotNA1 = new Account();
        accNotNA1.Name = 'Accounts Test';
        accNotNA1.Subtype__c ='Competitor';
        accNotNA1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        insert accNotNA1;
        
        Account accCM_No_Child = new Account();
        accCM_No_Child.Name = 'Competitive Medical CM No Child';
        accCM_No_Child.Subtype__c ='Specialty Benefits Only';
        accCM_No_Child.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM_No_Child;
        
        accECCAC = new Account();
        accECCAC.Name = 'Account Existing Client Complex Accounts Client';
        accECCAC.Subtype__c ='Complex Accounts';
        accECCAC.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accECCAC;
        
        
        
        accCM = new Account();
        accCM.Name = 'Competitive Medical CM';
        accCM.Subtype__c ='Specialty Benefits Only';
        accCM.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM;
        
        accCM2 = new Account();
        accCM2.Name = 'Competitive Medical CM2';
        accCM2.Subtype__c ='Specialty Benefits Only';
        accCM2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM2;
        
     
        
        accOpp = new Account();
        accOpp.Name = 'oppaccount1';
        accOpp.Subtype__c ='Consulting Firm';
        accOpp.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert accOpp;
        
        accCD = new Account();
        accCD.Name = 'Competitive Medical CD';
        accCD.Subtype__c ='Prospect';
        accCD.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCD;  
        
        accAgg = new Account();
        accAgg.Name = 'account BGH';
        accAgg.Subtype__c ='Business Group on Health (BGH)';
        accAgg.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        //accAgg.Record_Type_Group__c='Prospects';
        insert accAgg; 
        
        accAgg2 = new Account();
        accAgg2.Name = 'account BGH2';
        accAgg2.Subtype__c ='Business Group on Health (BGH)';
        accAgg2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        //accAgg.Record_Type_Group__c='Prospects';
        insert accAgg2; 
        
            
    }
    public static void ContactUHGTestData() {
        Id CMContactRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId();
        Id AggregatorContactRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Aggregator Contact').getRecordTypeId();
        Id CDContactRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
        Id ConsultantRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        
        a = new contact();
        a.AccountId=accCD.Id;
        a.CEO__c=false;
        a.FirstName ='test qwerty';
        a.LastName='lasr qwerty';
        a.OtherCountry='United States';
        a.RecordTypeId=CDContactRecord;
        a.Status__c='Active';
        insert a;
        system.debug('a@@@'+a.id);
        
        b = new contact();
        b.AccountId=accCD.Id;
        b.CEO__c=false;
        b.FirstName ='test qwerty2';
        b.LastName='lasr qwerty2';
        b.OtherCountry='United States';
        b.RecordTypeId=CDContactRecord;
        b.Status__c='Inactive';
        b.InactiveStatusReason__c='Duplicate';
        insert b;
        
        c = new contact();
        c.AccountId=acconsultiongfirm1.Id;
        c.CEO__c=false;
        c.FirstName ='test acconsultiongfirm1';
        c.LastName='lasr acconsultiongfirm1';
        c.OtherCountry='United States';
        c.RecordTypeId=ConsultantRecord;
        c.DecisionMakingRole__c='Consultant Practice Leader';
        c.Status__c='Active';        
        insert c;
        
        acconrole = new Account();
        acconrole.Name = 'acconroleacconrole';
        acconrole.Subtype__c =' National Accounts - East';
        acconrole.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        acconrole.Consultant__c=c.Id;
        acconrole.ConsultantFirm__c=[select id from Account where Name='oppaccount1' limit 1].Id;
        //accAgg.Record_Type_Group__c='Prospects';
        insert acconrole; 
        
        
        d = new contact();
        d.AccountId=accAgg.Id;
        //d.CEO__c=false;
        d.FirstName ='test aggfname';
        d.LastName='lasr agglname';
        d.OtherCountry='United States';
        d.RecordTypeId=AggregatorContactRecord;
        //d.DecisionMakingRole__c='Consultant Practice Leader';
        d.Status__c='Active';        
        insert d;
        
        e = new contact();
        e.AccountId=accAgg2.Id;
        //d.CEO__c=false;
        e.FirstName ='test aggfname';
        e.LastName='lasr agglname';
        e.OtherCountry='United States';
        e.RecordTypeId=AggregatorContactRecord;
        //d.DecisionMakingRole__c='Consultant Practice Leader';
        e.Status__c='Active';        
        insert e;
        
        f = new contact();
        f.AccountId=accOpp.Id;
        f.CEO__c=false;
        f.FirstName ='test accOppfname';
        f.LastName='lasr accOppfname';
        f.OtherCountry='United States';
        f.RecordTypeId=ConsultantRecord;
        f.DecisionMakingRole__c='Consultant Practice Leader';
        f.Status__c='Active';        
        insert f;
        
        g = new contact();
        g.AccountId=accOpp.Id;
        g.CEO__c=false;
        g.FirstName ='test accOppfname delete';
        g.LastName='lasr accOppfname delete';
        g.OtherCountry='United States';
        g.RecordTypeId=ConsultantRecord;
        g.DecisionMakingRole__c='Consultant Practice Leader';
        g.Status__c='Active';        
        insert g;
        
        i = new contact();
        i.AccountId=accECCAC.Id;
        i.CEO__c=false;
        i.FirstName ='test amt';
        i.LastName='lasr amt';
        i.OtherCountry='United States';
        i.RecordTypeId=CMContactRecord;
        i.DecisionMakingRole__c='Consultant Practice Leader';
        i.Status__c='Active';
        i.AMT_Log__c =true;       
        insert i;
        
    }
    public static void BGHContactTestData() {
        bghcontact1 = new BGHContact__c();
        bghcontact1.CompanyBGH__c=accAgg2.Id;
        bghcontact1.BGHContact__c=e.Id;
        bghcontact1.Role__c='Director';
        insert bghcontact1;
        
    }
    public static void AccountContactRelationTestData(){
        Id ConsultantRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        Id CDContactRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
        accOppacr = new Account();
        accOppacr.Name = 'oppaccount1acr';
        accOppacr.Subtype__c ='Consulting Firm';
        accOppacr.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert accOppacr;
        
        acconsultiongfirm1acr = new Account();
        acconsultiongfirm1acr.Name = 'testConsulting Accounts';
        acconsultiongfirm1acr.Subtype__c ='Consulting Firm';
        acconsultiongfirm1acr.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert acconsultiongfirm1acr;
        
        conacr = new contact();
        conacr.AccountId=acconsultiongfirm1acr.Id;
        conacr.CEO__c=false;
        conacr.FirstName ='test acconsultiongfirm1acr';
        conacr.LastName='lasr acconsultiongfirm1acr';
        conacr.OtherCountry='United States';
        conacr.RecordTypeId=ConsultantRecord;
        conacr.DecisionMakingRole__c='Consultant Practice Leader';
        conacr.Status__c='Active';        
        insert conacr;
        
        conacr1 = new contact();
        conacr1.AccountId=acconsultiongfirm1acr.Id;
        conacr1.CEO__c=false;
        conacr1.FirstName ='test1 acconsultiongfirm1acr1';
        conacr1.LastName='lasr1 acconsultiongfirm1acr1';
        conacr1.OtherCountry='United States';
        conacr1.RecordTypeId=ConsultantRecord;
        conacr1.DecisionMakingRole__c='Consultant Practice Leader';
        conacr1.Status__c='Active';        
        insert conacr1;
        
        acconroleacr = new Account();
        acconroleacr.Name = 'testacconroleacconroleacr';
        acconroleacr.Subtype__c ='Suspect';
        acconroleacr.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Suspect').getRecordTypeId();
        acconroleacr.ConsultantFirm__c=[select id from Account where Name='oppaccount1acr' limit 1].Id;
        insert acconroleacr; 
        
        
        conaacr = new contact();
        conaacr.AccountId=acconroleacr.Id;
        conaacr.CEO__c=false;
        conaacr.FirstName ='test qwertywacr';
        conaacr.LastName='lasr qwertywacr';
        conaacr.OtherCountry='United States';
        conaacr.RecordTypeId=CDContactRecord;
        conaacr.Status__c='Active';
        insert conaacr;
        
        acr = new AccountContactRelation ();
        acr.AccountId= acconroleacr.Id;
        acr.ContactId=conacr.id;
        acr.Primary__c=true;
		//acr.IsDirect= false;
        insert acr; 
        
        /*acrPF = new AccountContactRelation ();
        acrPF.AccountId= acconsultiongfirm1acr.Id;
        acrPF.ContactId=conacr1.id;
        acrPF.Primary__c=false;
        insert acrPF; */
        
        system.debug('acr'+acr);

    } 
    public static  void accountcontactrelationtestdata2(){
        accCFdata = new Account();
        accCFdata.Name = 'Consulting Firm Testdata';
        accCFdata.Subtype__c ='Consulting Firm';
        accCFdata.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert accCFdata;
        
        accFirm1 = new Account();
        accFirm1.Name = 'account Firm1data';
        accFirm1.Subtype__c ='Enterprise Strategic Accounts';
        accFirm1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accFirm1;               
        
        Account accFirm2 = new Account();
        accFirm2.Name = 'account Firm2';
        accFirm2.Subtype__c ='Enterprise Strategic Accounts';
        accFirm2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accFirm2;
        
        Contact contact1 = new Contact();
        contact1.FirstName = 'Jnanesh';
        contact1.LastName = 'Avaradi';
        contact1.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        contact1.AccountId = accCFdata.Id;
        insert contact1;
        
        acc_Con_Firm = new AccountCFJunction__c();
        acc_Con_Firm.ConsultingFirm__c = accCFdata.Id;
        acc_Con_Firm.AccountFirm__c = accFirm1.Id;
        insert acc_Con_Firm;
        
        AccountContactRelation acc_Con_Rel = new AccountContactRelation();
        acc_Con_Rel.ContactId = contact1.Id;       
        acc_Con_Rel.AccountId = accFirm2.Id;
        insert acc_Con_Rel;
        
    }
    
    public static void createAccountCFJunctionData(){
        Account acconsultiongfirm1 = new Account();
        acconsultiongfirm1.Name = 'testtest Accounts';
        acconsultiongfirm1.Subtype__c ='Consulting Firm';
        acconsultiongfirm1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        
        Account accOppacr = new Account();
        accOppacr.Name = 'oppaccount1acr';
        accOppacr.Subtype__c ='Consulting Firm';
        accOppacr.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert accOppacr;
        
        Account acconroleacr = new Account();
        acconroleacr.Name = 'testacconroleacconroleacr';
        acconroleacr.Subtype__c ='Suspect';
        acconroleacr.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Suspect').getRecordTypeId();
        acconroleacr.ConsultantFirm__c=[select id from Account where Name='oppaccount1acr' limit 1].Id;
        insert acconroleacr;
        
        
        
        AccountCFJunction__c  acntfirm = new AccountCFJunction__c ();
        acntfirm.ConsultingFirm__c=acconsultiongfirm1.Id;
        acntfirm.AccountFirm__c= acconroleacr.Id;
        insert acntfirm;
    }
    public static void SeniorUHGTestData() {
        //accountTestData() ;
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
        sen.Account__c =[SELECT Id FROM Account WHERE Name='Competitive Medical CM' LIMIT 1].Id;
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
        sen2.Account__c =[SELECT Id FROM Account WHERE Name='Competitive Medical CM2' LIMIT 1].Id;
        sen2.UHCExecutiveSponsorName__c ='testdata';
        sen2.UHCExecutiveSponsorResponsibilities__c=Null;
        insert sen2;
        
    }
    public static void opportunityTestData() {
        opp =  new Opportunity();
        opp.AccountId=accCD.Id;
        opp.Name='Test Opportunity';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp.Expected_Date_of_RFP__c = system.today();
        opp.StageName = 'Qualification';
        opp.CloseDate=System.today();
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        insert opp;
        
        opp2 =  new Opportunity();
        opp2.AccountId=accCD.Id;
        opp2.Name='Test OpportunityaccOpp';
        opp2.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp2.EffectiveDate__c = system.today();
        opp2.Product_Type_Involved_in_Opp__c = 'Medical;Vision';
        opp2.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp2.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp2.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp2.Expected_Date_of_RFP__c = system.today();
        opp2.StageName = 'Qualification';
        opp2.CloseDate=System.today();
        opp2.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        
        insert opp2;
    }
    
    
    
    
    
    public static void opportunityContactRoleTestData() {
       
        ocr = new OpportunityContactRole();
        ocr.ContactId=a.Id;
        ocr.OpportunityId=opp.Id;
        ocr.IsPrimary=true;
        insert ocr; 
        
        ocr2 = new OpportunityContactRole();
        ocr2.ContactId=b.Id;
        ocr2.OpportunityId=opp.Id;
        ocr2.IsPrimary=false;
        insert ocr2; 
        
        
    }
    public static void opportunityContactRoleFailRecordsTestData() {
       
        ocrf = new OpportunityContactRole();
        ocrf.ContactId=e.Id;
        ocrf.OpportunityId=opp.Id;
        ocrf.IsPrimary=true;
        insert ocrf; 
    }
	public static void policyInformationTestData() {
        List <Policy_Information__c> policyList = new List <Policy_Information__c>();
        Policy_Information__c pi  = new Policy_Information__c (
        Name='1234567',Company__c=accECCAC.Id,Policy_Type__c='Medical',
            Policy__c='policy test'
        );
		policyList.add(pi);
        Policy_Information__c pi1  = new Policy_Information__c (
        Name='1234567623',Company__c=accECCAC.Id,Policy_Type__c='FSA',
            Policy__c='policy testpi1'
        );
        policyList.add(pi1);
        Policy_Information__c pi2  = new Policy_Information__c (
        Name='1234567623',Company__c=accECCAC.Id,Policy_Type__c='HRA',
            Policy__c='policy testpi2'
        );
        policyList.add(pi2);
        insert policyList;  
    }
    public static void ServiceAMTTestData() {
        Service_AMT__c sa = new Service_AMT__c (
            Company__c=accECCAC.Id,
            First_Name__c='test fname',
            Last_Name__c ='test lname',
            Email__c='test@crmit.com',
            Contact_Role__c='Optum Strategic Account Executive',
            UserHierarchy__c=6,
            Policy_Information_MultiChecKlist__c='12',
            Phone__c='23456789',
            User_Contact_Id__c='user',
            External__c=true,
            Case_Management_End_Date__c=null
        );
        insert sa;
        Service_AMT__c sa1 = new Service_AMT__c (
            Company__c=accECCAC.Id,
            First_Name__c='fname',
            Last_Name__c ='lname',
            Email__c='test1@crmit.com',
            Contact_Role__c='Optum Strategic Account Executive',
            UserHierarchy__c=3,
            Policy_Information_MultiChecKlist__c='23',
            Phone__c='234567891',
            User_Contact_Id__c='useridid',
            External__c=false,
            Case_Management_End_Date__c=null
        );
        insert sa1;
    }
    public static void CampaignCorrespondenceTestData() {
        Campaign cmp= new Campaign ();
        cmp.Type='Seminar / Conference';
        //cmp.Correspondence_Type__c='Annual Customer Forum';
        cmp.Name='test';
        cmp.Status='Planned';
        insert cmp;
        
        Campaign cmp1= new Campaign ();
        cmp1.Type='Seminar / Conference';
        //cmp1.Correspondence_Type__c='Annual Customer Forum';
        cmp1.Name='test one';
        cmp1.Status='Planned';
        insert cmp1;
        
        Account acccmp = new Account();
        acccmp.Name = 'accnt campigns';
        acccmp.Subtype__c ='Prospect';
        acccmp.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acccmp;
        


        Id CDContactRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
        cmpcont = new contact();
        cmpcont.AccountId=acccmp.Id;
        cmpcont.CEO__c=false;
        cmpcont.FirstName ='test Campaign';
        cmpcont.LastName='lasr Campaign';
        cmpcont.OtherCountry='United States';
        cmpcont.RecordTypeId=CDContactRecord;
        cmpcont.DecisionMakingRole__c='Consultant Practice Leader';
        cmpcont.Status__c='Active';
        cmpcont.Correspondence_Previous__c='Annual Customer Forum;New Client Welcome Kit';
        cmpcont.Correspondence_Type__c='Annual Customer Forum;Sutter Attestation Contact;HTA Campaign;New Client Welcome Kit';
        insert cmpcont;
        
        
        cmpcont1 = new contact();
        cmpcont1.AccountId=acccmp.Id;
        cmpcont1.CEO__c=false;
        cmpcont1.FirstName ='test Campaign1';
        cmpcont1.LastName='lasr Campaign1';
        cmpcont1.OtherCountry='United States';
        cmpcont1.RecordTypeId=CDContactRecord;
        cmpcont1.DecisionMakingRole__c='Consultant Practice Leader';
        cmpcont1.Status__c='Active';
        cmpcont1.Correspondence_Previous__c='Annual Customer Forum;New Client Welcome Kit';
        cmpcont1.Correspondence_Type__c='Annual Customer Forum;Sutter Attestation Contact;HTA Campaign;New Client Welcome Kit';
        insert cmpcont1;
        system.debug('variable@@@'+cmpcont1.Correspondence_Previous__c);
        
        
        
    }
    
    public static void CampaignCorrespondenceTestData2() {
        Campaign cmp= new Campaign ();
        cmp.Type='Seminar / Conference';
        //cmp.Correspondence_Type__c='Annual Customer Forum';
        cmp.Name='test';
        cmp.Status='Planned';
        insert cmp;
        
        Campaign cmp1= new Campaign ();
        cmp1.Type='Seminar / Conference';
        //cmp1.Correspondence_Type__c='Annual Customer Forum';
        cmp1.Name='test one';
        cmp1.Status='Planned';
        insert cmp1;
        
        Account acccmp = new Account();
        acccmp.Name = 'accnt campigns';
        acccmp.Subtype__c ='Prospect';
        acccmp.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acccmp;
        


        Id CDContactRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
        
        
        cmpcont2 = new contact();
        cmpcont2.AccountId=acccmp.Id;
        cmpcont2.CEO__c=false;
        cmpcont2.FirstName ='test Campaign2';
        cmpcont2.LastName='lasr Campaign2';
        cmpcont2.OtherCountry='United States';
        cmpcont2.RecordTypeId=CDContactRecord;
        cmpcont2.DecisionMakingRole__c='Consultant Practice Leader';
        cmpcont2.Status__c='Active';
        cmpcont2.Correspondence_Previous__c=null;
        cmpcont2.Correspondence_Type__c='Annual Customer Forum';
        insert cmpcont2;
        system.debug('variable@@@'+cmpcont2.Correspondence_Previous__c);
        
        
        
    }
    public static void CampaignCorrespondenceTestData3() {
        Campaign cmp= new Campaign ();
        cmp.Type='Seminar / Conference';
        //cmp.Correspondence_Type__c='Annual Customer Forum';
        cmp.Name='test';
        cmp.Status='Planned';
        insert cmp;
        
        Campaign cmp1= new Campaign ();
        cmp1.Type='Seminar / Conference';
        //cmp1.Correspondence_Type__c='Annual Customer Forum';
        cmp1.Name='test one';
        cmp1.Status='Planned';
        insert cmp1;
        
        Account acccmp = new Account();
        acccmp.Name = 'accnt campigns';
        acccmp.Subtype__c ='Prospect';
        acccmp.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acccmp;
        


        Id CDContactRecord = Schema.SObjectType.contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
        
        
        cmpcont3 = new contact();
        cmpcont3.AccountId=acccmp.Id;
        cmpcont3.CEO__c=false;
        cmpcont3.FirstName ='test Campaign3';
        cmpcont3.LastName='lasr Campaign3';
        cmpcont3.OtherCountry='United States';
        cmpcont3.RecordTypeId=CDContactRecord;
        cmpcont3.DecisionMakingRole__c='Consultant Practice Leader';
        cmpcont3.Status__c='Active';
        cmpcont3.Correspondence_Previous__c=null;
        cmpcont3.Correspondence_Type__c='Annual Customer Forum';
        insert cmpcont3;
        system.debug('variable@@@'+cmpcont3.Correspondence_Previous__c);
        
        
        
    }
    
}