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
}