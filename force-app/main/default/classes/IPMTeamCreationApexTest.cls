@isTest
public class IPMTeamCreationApexTest {
    
    @isTest
    static void ipmTeamCreationTestMethod(){
        
        Date dt = system.today();
        String testCustomLabel = Label.IPM_Team_Roles;
        
        test.startTest();
        Account acc = new Account();
        acc.Name = 'testAccount';
        acc.Subtype__c ='Private Exchange';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert acc;
        
        List<Project_Template__c> ipmList = new List<Project_Template__c>();
        Project_Template__c ipm = new Project_Template__c();
        ipm.Name = 'testIPM';
        ipm.Account__c = acc.Id;
        ipm.Effective_Date__c = dt;
        ipm.Start_Date__c = dt;
        ipm.Overall_Project_Status__c='Blue';
        ipmList.add(ipm);
        insert ipmList;
        
        List<Service_AMT__c> serviceAMTList = new List<Service_AMT__c>();
        Service_AMT__c serviceAMT = new Service_AMT__c();
        serviceAMT.Name = 'testAMT';
        serviceAMT.Company__c = acc.Id;
        serviceAMT.User_Contact_Id__c = 'testUserContactId';
        serviceAMT.Contact_Role__c = 'Client Manager';
        serviceAMTList.add(serviceAMT);
        insert serviceAMTList;
        
        List<Contact> contactList = new List<Contact>();
        Contact con = new Contact();
        con.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId();
        con.LastName = 'test LastName';
        con.FirstName = 'test FirstName';
        con.AccountId = acc.Id;
        contactList.add(con);
        insert contactList;
        
        List<CM_Account_Team_History__c> NASalesTeamList = new List<CM_Account_Team_History__c>();
        CM_Account_Team_History__c NASalesTeam = new CM_Account_Team_History__c();
        NASalesTeam.Name = 'testNaSalesUser';
        NASalesTeam.Account_Firm__c = acc.Id;
        NASalesTeam.Job_Title__c = 'Strategic Client Executive';
        NASalesTeamList.add(NASalesTeam);
        insert NASalesTeamList;
        
        List<ID> ipmId = new List<ID>{ipmList[0].Id};
            List<ID> CompanyId = new List<ID>{acc.Id};
                
                IPMTeamCreationApex.invocableVariablesClass testWrap;
        testWrap= new  IPMTeamCreationApex.invocableVariablesClass();
        testWrap.projectIds = ipmId;
        testWrap.companyIds = CompanyId;
        
        IPMTeamCreationApex.IPTeamCreationForProject(new List<IPMTeamCreationApex.invocableVariablesClass>{ testWrap } );
        test.stopTest();
    }
}