@isTest
public class OutreachActivityTableCtrlTest {

 @isTest
    public static void testFetchAccountData() {
      
        Account testAccount = new Account(Name = 'Test Account', RecordTypeId='0126A000000T7jIQAS', Cancellation_Date__c = System.today().addDays(-1), Subtype__c='Prospect');
        insert testAccount;
        
         Event testEvent = new Event(
            Subject = 'Test Event',
            Type = 'Social Interaction',
            StartDateTime = Datetime.now(),
            EndDateTime=Datetime.now().addHours(1),            
            WhatId = testAccount.Id,
            RecordType = new RecordType(Name = 'Event CD Activities')
        );
        insert testEvent;

        Task testTask = new Task(
            Subject = 'Test Task',
            ActivityDate = System.today(),
            WhatId = testAccount.Id,
            RecordType = new RecordType(Name = 'CD Activities')
        );
        insert testTask;
    
        Test.startTest();
        OutreachActivityTableCtrl.AccountWrapper result = OutreachActivityTableCtrl.fetchAccountData(testAccount.Id);
        Test.stopTest();
            
    }  
}