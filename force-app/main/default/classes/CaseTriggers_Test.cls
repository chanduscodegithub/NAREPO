@isTest
public class CaseTriggers_Test {
    @testSetup static void createTestData() {
        //user test data
        User readandwriteUser ;
        Id userProfileId= [select Id, Name from Profile where name = 'System Administrator' limit 1].id;
        readandwriteUser = new User(
            FirstName='Naruto',
            LastName = 'Uzumaki',
            Alias = 'fox',
            Email = 'Naruto.Uzumaki@uhc.com',
            Username = 'i_will_become_hokage@uhc.com',
            position__c='System User',
            ProfileId =userProfileId,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LocaleSidKey = 'en_US');        
        insert readandwriteUser;
        
        
    }
    public testMethod static void validateMETHODNAME(){
        Test.startTest();
        User readAndWriteUser = [Select Id,FirstName from User where Username = 'i_will_become_hokage@uhc.com' LIMIT 1]; 
        
        
        System.runAs(readAndWriteUser) {
            
            Case c = new Case(Status = 'Open',Description='Test', Resolution__c='Test',Case_Screenshots__c='qwertyui',Extended_Description__c='trdytedyr', recordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('SBS Support').getRecordTypeId()); 
            insert c; 
            case c1= new case();
            c1.Id=c.Id;
            c1.Case_Screenshots__c='sdfghdfgh';
            c1.Extended_Description__c='adghvvjh';
            c1.Resolution__c ='test2';
            c1.Description ='Test3';
            update c1;
            system.debug('c1@@@'+c1.Case_Screenshots__c);
            system.debug('variable@@@'+c1.Extended_Description__c);
            
            
            
        }
        Test.stopTest();
        
    }
    
}