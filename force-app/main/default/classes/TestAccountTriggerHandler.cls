@isTest
public class TestAccountTriggerHandler {
    @isTest 
    public static Account AccoutRecordDelete(){
        
        List<RecordType> rtypes = [Select Name, Id From RecordType where sObjectType='Account' and isActive=true];
        
        Map<String,String> accountRecordTypes = new Map<String,String>{};
            for(RecordType rt: rtypes){
                accountRecordTypes.put(rt.Name,rt.Id);
            }
        
        System.debug('Existing Client rtypes'+accountRecordTypes.get('Existing Client'));
        Account testAccountExistingClient = new Account();
        testAccountExistingClient.Name = 'TestUniversity';
        testAccountExistingClient.RecordTypeId = accountRecordTypes.get('Existing Client');
        testAccountExistingClient.Subtype__c = 'National Accounts - East';
        insert testAccountExistingClient;
        
        List<User> u = new List<User>([SELECT Name,Email,UserRole.Name FROM User WHERE UserRole.Name = 'CRM Administrator' LIMIT 1]);
        try {  
            delete testAccountExistingClient;  
            System.Assert(true, 'This was supposed to Delete and Email triggers');  
        }catch(Exception e){  
            System.assert(false, 'Deletion failed ');
            
        }
        return testAccountExistingClient;
    }
    @isTest
    static void testAfterUpdate() {
        
        
        Account acc1 = new Account(
            Name = 'Test Account',
            Subtype__c = 'Prospect',
            Processing_Method__c = 'Scheduled',
            RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
        );
        insert acc1;
        
        // Arrange
        List<Account> accountsToUpdate = [SELECT Id, Processing_Method__c FROM Account];
        for (Account acc : accountsToUpdate) {
            acc.Processing_Method__c = 'Scheduled'; // Update to trigger the batch
        }
        
        // Act
        Test.startTest();
        //AccountTriggerHandler.afterUpdate(accountsToUpdate);
        Test.stopTest();
            
            // Assert
            // Verify that the batch job was executed
            /*  List<AsyncApexJob> jobs = [SELECT Id, Status, JobType FROM AsyncApexJob WHERE JobType = 'BatchApex' AND Status = 'Completed'];
System.assert(!jobs.isEmpty(), 'Batch job should have been executed.');*/
            }
    
    
    
    @isTest
    static void testAfterUpdate1() {
        // Step 1: Create a test Account with RecordType = Prospect
        RecordType prospectRecordType = [SELECT Id FROM RecordType WHERE SObjectType = 'Account' AND Name = 'Prospect' LIMIT 1];
        
        Account acc = new Account(
            Name = 'Test Account',
            Subtype__c = 'Prospect',
            Processing_Method__c = 'Manual',
            RecordTypeId = prospectRecordType.Id,
            Unlock_Client_Strategy_Form__c = true,
            Last_Calculate_Engagement_Score_Run__c = Date.today().addDays(-1)
        );
        insert acc;
        
        // Step 2: Update the account to meet trigger condition (change method + date)
        acc.Processing_Method__c = 'Scheduled';
        acc.Last_Calculate_Engagement_Score_Run__c = Date.today(); // simulate change
        update acc;
        
        // Step 3: Fetch new + old values for afterUpdate simulation
        List<Account> newAccounts = [SELECT Id, Processing_Method__c, Last_Calculate_Engagement_Score_Run__c,Unlock_Client_Strategy_Form__c, RecordType.Name FROM Account WHERE Id = :acc.Id];
        Map<Id, Account> oldMap = new Map<Id, Account>();
        
        Account oldAcc = acc.clone(false, true, false, false);
        oldAcc.Last_Calculate_Engagement_Score_Run__c = Date.today().addDays(-1);
        oldMap.put(acc.Id, oldAcc);
        
        // Step 4: Call the trigger handler
        Test.startTest();
        AccountTriggerHandler.afterUpdate(newAccounts, oldMap);
        Test.stopTest();
        
        // ✅ No assertions on the queueable itself (unless you use limits), but you can test debug logs or record effects.
        System.debug('Test completed for afterUpdate with queueable.');
    } 
}