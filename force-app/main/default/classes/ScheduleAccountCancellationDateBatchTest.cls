@isTest
public class ScheduleAccountCancellationDateBatchTest {
    @testSetup static void createTestData() {
        List<Account> accList = new List<Account>();
        for(Integer i =0;i < 100; i++){
            Account acc = new Account();
            acc.Name = 'Test Account'+i;
            acc.Subtype__c ='Prospect';
            acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
            acc.Previous_Customer__c= true;    
            acc.CancelledCustomer__c = false;
            if(math.mod(i,3) == 0){            
                acc.Cancellation_Date__c= System.today() + 5;    
                acc.CancelledCustomer__c = false;
            }else if(math.mod(i,4) == 0){
                acc.CancelledCustomer__c = true;
                acc.Cancellation_Date__c= System.today() + 60;    
            }else if(math.mod(i,6) == 0){
                acc.Cancellation_Date__c= System.today() + 400;    
                acc.CancelledCustomer__c = true;
            }
            else if(math.mod(i,5) == 0){
                acc.Cancellation_Date__c= System.today() - 3;    
                acc.CancelledCustomer__c = false;
            }else if(math.mod(i,7) == 0){
                acc.Cancellation_Date__c= null; 
                acc.CancelledCustomer__c = true;
            }   
            accList.add(acc);
        }   
        insert accList;
    }    
    public testMethod static void validateBatch(){        
        Test.startTest();
        Datetime dt = Datetime.now().addMinutes(1);
        String CRON_EXP = '0 '+ dt.minute() + ' * ' + dt.day() + ' ' + dt.month() + ' ? ' + dt.year();
        System.schedule('Test Account Cancellation Batch', CRON_EXP, new ScheduleAccountCancellationDateBatch() );   
        Test.stopTest();
    }
}