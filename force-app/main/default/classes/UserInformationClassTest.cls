@isTest
public class UserInformationClassTest {
    
    @testSetup static void createTestData() {
        
        List<Account> accList = new List<Account>();
        
         // Creating the test Account
        Account acc = new Account();
        acc.Name = 'testAccount';
        acc.Subtype__c ='National Accounts - East';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        accList.add(acc);
        
        Account acc1 = new Account();
        acc1.Name = 'testAccount1';
        acc1.Subtype__c ='Competitor';
        acc1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId();
        accList.add(acc1);
        
        Account acc2 = new Account();
        acc2.Name = 'testAccount2';
        acc2.Subtype__c ='Consulting Firm';
        acc2.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        accList.add(acc2);
        
        Account acc3 = new Account();
        acc3.Name = 'testAccount3';
        acc3.Subtype__c ='Prospect';
        acc3.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        accList.add(acc3);
        
        Account acc4 = new Account();
        acc4.Name = 'testAccount4';
        acc4.Subtype__c ='Suspect';
        acc4.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Suspect').getRecordTypeId();
        accList.add(acc4);
        
        Account acc5 = new Account();
        acc5.Name = 'testAccount5';
        acc5.Subtype__c ='Business Group on Health (BGH)';
        acc5.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        accList.add(acc5);
        
        Account acc6 = new Account();
        acc6.Name = 'testAccount5';
        acc6.Subtype__c ='Collaborative Ventures Group (CVG)';
        acc6.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        accList.add(acc6);
                        
        insert accList;
    }
        
    public testMethod static void validateGetGeneralInfomationMethod(){
        Test.startTest();
        List<Account> accList = [Select Id,Category__c from Account];
        Account acc1 = new Account();        
        accList.add(acc1);
        for(Account acc: accList){
            System.debug('acc Category '+acc.Category__c);
            try{
            	UserInformationClass.getGeneralInfomationMethod(acc.Id);       
            }catch(Exception ex){
               System.debug('Ex '+ex.getLineNumber()+' Message '+ex.getMessage());
            }
         	
        }        	
        Test.stopTest();
    }
}