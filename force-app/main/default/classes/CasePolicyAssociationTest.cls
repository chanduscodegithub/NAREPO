@isTest
public class CasePolicyAssociationTest {
    
    @testSetup static void setup() {
        Account acc = new Account(Name = 'TestAcct',Subtype__c = 'Specialty Benefits Only',Type ='National Accounts Client');
        insert acc;
      
        Account acc1 = new Account(Name = 'TestAcct1',Subtype__c = 'Specialty Benefits Only',Type ='National Accounts Client');
        insert acc1;
        
        Account acc2 = new Account(Name = 'TestAcct2',Subtype__c = 'Specialty Benefits Only',Type ='National Accounts Client');
        insert acc2;
        
         Account acc3 = new Account(Name = 'TestAcct3',Subtype__c = 'Specialty Benefits Only',Type ='National Accounts Client');
        insert acc3;
        
        
        Case case1 = new Case();
        case1.AccountId = acc.Id;
        case1.Sub_Category__c = 'Change';
        case1.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('IS Request').getRecordTypeId();
        insert case1;
        
        Case case3 = new Case();
        case3.AccountId = acc1.Id;
        case3.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('General Action').getRecordTypeId();
        insert case3;
        
        
        Case case5 = new Case();
        case5.AccountId = acc3.Id;
        case5.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('General Action').getRecordTypeId();
        insert case5;
        
        
        Policy_Information__c pol = new Policy_Information__c();
        pol.Company__c = acc.Id;
        pol.Policy__c ='test1';
        pol.Name ='12345';
        pol.Policy_Type__c = 'CERA;Dental;Medical';
        pol.Policy_Status__c ='Active';
        insert pol;
        
        Case case2 = new Case();
        case2.AccountId = acc.Id;
        case2.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('General Action').getRecordTypeId();
        case2.Primary_Medical_Policy__c = pol.id;
        insert case2;
        
        Policy_Information__c pol1 = new Policy_Information__c();
        pol1.Company__c = acc.Id;
        pol1.Name ='123456';
        pol1.Policy_Type__c = 'Medical';
        pol1.Policy__c ='test1';
        pol1.Policy_Status__c ='Active';
        insert pol1;
        
        Policy_Information__c pol2 = new Policy_Information__c();
        pol2.Company__c = acc.Id;
        pol2.Name ='123457';
        pol2.Policy_Type__c = 'Dental';
        pol2.Policy__c ='test1';
        pol2.Policy_Status__c ='Active';
        insert pol2;
        
        
        Policy_Information__c pol4 = new Policy_Information__c();
        pol4.Company__c = acc1.Id;
        pol4.Name ='1234571';
        pol4.Policy_Type__c = 'Medical';
        pol4.Policy__c ='test1';
        pol4.Policy_Status__c ='Active';
        insert pol4;

        Case case4 = new Case();
        case4.AccountId = acc2.Id;
        case4.Sub_Category__c = 'Change';
        case4.RecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('IS Request').getRecordTypeId();
        insert case4;
        
        Policy_Information__c pol5 = new Policy_Information__c();
        pol5.Company__c = acc2.Id;
        pol5.Name ='123';
        pol5.Policy_Type__c = 'Medical';
        pol5.Policy__c ='test1';
        pol5.Policy_Status__c ='Active';
        insert pol5;
        
        Policy_Information__c pol6 = new Policy_Information__c();
        pol6.Company__c = acc3.Id;
        pol6.Name ='123454';
        pol6.Policy_Type__c = 'Medical;CERA;Dental';
        pol6.Policy__c ='test1';
        pol6.Policy_Status__c ='Active';
        insert pol6;
        
        Policy_Information__c pol7 = new Policy_Information__c();
        pol7.Company__c = acc3.Id;
        pol7.Name ='1234577';
        pol7.Policy_Type__c = 'Medical;Dental';
        pol7.Policy__c ='test1';
        pol7.Policy_Status__c ='Active';
        insert pol7;
        
    }
    @isTest static void testMethod1(){
        //List<Account> acct = [SELECT Id FROM Account];
        List<Case> caseQueried = [SELECT Id FROM Case ];
        List<Id> caseId = new List<Id>();
        for(Case c :  caseQueried){
            caseId.add(c.Id); 
        }
        CasePolicyAssociation.CasePolicyAssociation(caseId);
        
    }
}