public with sharing class AccountTriggerHandler {
    static{
        
    }
    /**
    * Trigger Point : BeforeDelete
    **/
    public static void deforedelete(Account[] Accountrecords){
        try{
            Messaging.reserveMassEmailCapacity(100);
        System.debug('***************************Account Delete Email - START**************************************');
        
        Account[] a = Accountrecords;
        
        List<User> u = new List<User>([SELECT Name,Email,UserRole.Name FROM User WHERE UserRole.Name = 'CRMIT Administrator' LIMIT 10]);
        //System.debug('User Role --> '+u);
        
        List<Account> a1 = New List<Account>([select Name, RecordType.Name, Owner.Email, LastModifiedBy.Name, LastModifiedDate from Account where Id =: a.get(0).Id]);
        //System.debug('Account a1 --> '+a1);
        if(a.size()!=0){
            //String email = 'vishnushankar.s@crmit.com';
            //***********************Email to System Admin - START*****************************************************
            List<String> email1 = new List<String>();
            email1.add('merit@uhc.com');
            /*for(User u1 : u){
                email1.add(u1.Email);
            }*/
            System.debug('Emails List --> '+email1);
            //System.debug('Owner Email -->'+a1[0].Owner.Email);
            //System.debug('Account record Type Name -->'+a1.get(0).RecordType.Name);
            //System.debug('Account record Deleted by -->'+UserInfo.getFirstName());
            //System.debug('Account record deleted on -->'+System.now());
            
            List<String> emailAdmin = email1;
            String subjectAdmin = a1.get(0).RecordType.Name+' Record Deleted';
            DateTime d = System.now();
            //String BodyAdmin = 'The "'+a1.get(0).Name+'" record has been deleted by '+UserInfo.getFirstName()+' '+UserInfo.getLastName()+' on '+ System.now();
            String BodyAdmin = 'The "'+a1.get(0).Name+'" record has been deleted by '+UserInfo.getFirstName()+' '+UserInfo.getLastName()+' on '+d.month()+'/'+d.day()+'/'+d.year();
            
            EmailManager.sendMail( emailAdmin , subjectAdmin , bodyAdmin);
            //***********************Email to System Admin - END*****************************************************
            
            //***********************Email to Record Owner - START*****************************************************
            List<String> email2 = new List<String>();
            email2.add(a1[0].Owner.Email);
            
            List<String> emailOwner = email2;
            String subjectOwner = 'Merit Record Deletion';
            String BodyOwner = 'This email confirms that the '+ a1.get(0).Name +' record has been deleted in the Merit CRM application.  You can contact a system administrator below if you have any questions regarding this action.\n'+
                +'\n\n'+
                +'Thank you,\n'+
                +'Merit CRM Support Team \n'+
                +'Email: merit@uhc.com \n'+
                +'Phone: 860.702.6976';
            
            EmailManager.sendMail( emailOwner , subjectOwner , bodyOwner);    
            //***********************Email to Record Owner - END*****************************************************
        }else{
            System.debug('Email not sent');
        }
        }catch(Exception e){        
            System.debug('Exception --> '+e);
            //System.debug('Account record Deleted, But no Email sent');
       
        }finally{
        
        System.debug('***************************Account Delete Email - END**************************************');
        
    }
    }
    
    
    //Client Strategy -- Unlock updates
    public static void afterUpdate(List<Account> newList, Map<Id, Account> oldMap) {
        List<Id> accountIdsToProcess = new List<Id>();

        for(Account acc : newList){
            Account oldAcc = oldMap.get(acc.Id);
            if(acc.Unlock_Client_Strategy_Form__c == true &&
               oldAcc.Unlock_Client_Strategy_Form__c != acc.Unlock_Client_Strategy_Form__c){
                accountIdsToProcess.add(acc.Id);
            }
        }

        if(!accountIdsToProcess.isEmpty()){
            List<Client_Strategy__c> strategiesToUpdate = [ SELECT Id, Status__c, Company__c FROM Client_Strategy__c WHERE Company__c IN :accountIdsToProcess ORDER BY Year__c DESC];

            for(Client_Strategy__c cs : strategiesToUpdate){
                cs.Status__c = 'Draft';
            }

            if(!strategiesToUpdate.isEmpty()){
                update strategiesToUpdate;
            }
        }
    }

}