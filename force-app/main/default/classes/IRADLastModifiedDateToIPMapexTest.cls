@isTest
public class IRADLastModifiedDateToIPMapexTest {
    
    @isTest
    static void iradLastModDateTestMethod(){
        
        Date dt = system.today();
        test.startTest();
        
        Account acc = new Account();
        acc.Name = 'testAccount';
        acc.Subtype__c ='Private Exchange';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert acc;
        
        Project_Template__c ipm = new Project_Template__c();
        ipm.Name = 'testIPM';
        ipm.Account__c = acc.Id;
        ipm.Effective_Date__c = dt;
        ipm.Start_Date__c = dt;
        insert ipm;
        
        List<IRAD__c> iradList = new List<IRAD__c>();
        IRAD__c irad = new IRAD__c();
        irad.Project__c = ipm.Id;
        irad.Internal_External__c = 'Internal';
        iradList.add(irad);
        insert iradList;
        
        string iradId = iradList[0].Id;
        List<String> iradIdList = new List<String>();
        iradIdList.add(iradId);
        IRADLastModifiedDateToIPMapex.IRADLastModifiedDatePopulatingToIPMRecord(iradIdList);
        
        test.stopTest();
    }
}