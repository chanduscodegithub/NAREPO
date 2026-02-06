/**
* Purpose     : test class for staffAssignmentTriggerHelper and staffAssignmentTrigger
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/

@isTest
private class staffAssignmentTriggerHelperTest {
    //staff
    //customer
    //user
    @isTest
    static void setupTestData(){       
        try{
            
            Map<Id,Staff_Assignment__c> newMap = new Map<Id,Staff_Assignment__c>();
            Map<Id,Staff_Assignment__c> oldMap = new Map<Id,Staff_Assignment__c>();
            
            Date newDate = Date.today().addDays(-1);
            Map<id,Staff_Assignment__c> maplist = new Map<id,Staff_Assignment__c>();
            
            List<Account> accountList = new List<Account>();
            List<Case> caseList = new List<Case>();
            List<Policy_Information__c> policyInfnList = new List<Policy_Information__c>();
            
            Account acc= new account (); 
            acc.name='test account';
            acc.Subtype__c='Enterprise Strategic Accounts';
            accountList.add(acc);
            Account acc1= new account ();
            acc1.name='test account1';
            acc1.Subtype__c='Enterprise Strategic Accounts';
            accountList.add(acc1);
            insert accountList;
            case c = new case();
            c.accountId=accountList[0].Id;
            caseList.add(c);
            system.debug('variable@@@'+c.Priority);
            case c2 = new case();
            c2.accountId=accountList[0].Id;
            c2.Priority='Low';
            insert caseList;
            
            
            Policy_Information__c p = new Policy_Information__c();
            p.Name='77341234';
            p.Policy_Status__c = 'Active';
            p.Policy__c = '77341234';
            p.Company__c=accountList[0].Id;
            policyInfnList.add(p);
            
            Policy_Information__c p1 = new Policy_Information__c();
            p1.Name='79341234';
            p1.Policy__c = '79341234';
            p1.Company__c=accountList[0].Id;
            policyInfnList.add(p1);
            
            insert policyInfnList;
            
            Policycase__c pc = new Policycase__c();
            pc.Policy__c=policyInfnList[0].Id;
            pc.Case__c=caseList[0].Id;
            insert pc;
            
            Map<Id,Policy_Information__c> policyMap = new Map<Id,Policy_Information__c>();
            Profile pf= [Select Id from Profile where Name='System Administrator'];     
            String orgId=UserInfo.getOrganizationId(); 
            String dateString=String.valueof(Datetime.now()).replace(' ','').replace(':','').replace('-','') ;
            Integer RandomId=Integer.valueOf(Math.rint(Math.random()*1000000)); 
            String uniqueName=orgId+dateString+RandomId; 
            String uniqueName2=orgId+dateString+RandomId+'zz'; 
            
            User uu=new User(firstname = 'ABC', 
                             lastName = 'XYZ', 
                             email = uniqueName + '@crmit' + '.com', 
                             Username = uniqueName + '@test' + orgId + '.org', 
                             EmailEncodingKey = 'ISO-8859-1', 
                             Alias = uniqueName.substring(18, 23), 
                             TimeZoneSidKey = 'America/Los_Angeles', 
                             LocaleSidKey = 'en_US', 
                             LanguageLocaleKey = 'en_US', 
                             ProfileId = pf.Id,
                             Position__c='Salesforce Courtesy License'
                            );  
            insert uu;       
            
            Staff__c s =new Staff__c();
            s.Staff_Name__c=uu.id; 
            insert s;
            
            
            list<Staff_Assignment__c> ls = new list<Staff_Assignment__c>();
            list<Staff_Assignment__c> ls1 = new list<Staff_Assignment__c>();
            
            Staff_Assignment__c sa = new Staff_Assignment__c();
            sa.Customer_Name__c= acc.id;
            sa.Staff_User_Assignment__c=uu.Id;
            sa.Staffing_Assignment__c=s.id;
            sa.Role_on_Case__c='Client Manager';    
            sa.Medical_Policy_Number__c =p.id;
            ls.add(sa);
            
            Staff_Assignment__c sa1 = new Staff_Assignment__c();
            sa1.Customer_Name__c= acc.id;
            sa1.Staffing_Assignment__c=s.id;
            sa1.Role_on_Case__c='Client Manager'; 
            ls.add(sa1);
            
            Staff_Assignment__c sa2 = new Staff_Assignment__c();
            sa2.Customer_Name__c= acc.id;
            sa2.Staff_User_Assignment__c=uu.Id;
            sa2.Role_on_Case__c='Client Manager';
            ls.add(sa2);
            
            
            Staff_Assignment__c sa3 = new Staff_Assignment__c();
            sa3.Customer_Name__c= acc.id;
            sa3.Role_on_Case__c='Client Manager'; 
            ls.add(sa3);  
            
            Service_AMT__c ser = new Service_AMT__c();
            ser.Company__c= acc.id;
            ser.First_Name__c ='test';
            ser.Last_Name__c = 'test';
            ser.Email__c = 'test@test.com';
            ser.All_Policy__c = true;
            ser.UserHierarchy__c = 1;
            insert ser;   

            Database.insert(ls,false);
            
            newMap.put(sa.id,sa);
            oldMap.put(sa1.id,sa1);
            staffAssignmentTriggerHelper.staffAssignmentUpdate(newMap,oldMap);
            staffAssignmentTriggerHelper.staffAssignmentUpdate(oldMap,newMap);
            
            newMap.clear();
            oldMap.clear();
            
        }
        catch(Exception e){
            //System.Assert(e.getMessage().contains('Please select matching staff or leave this field blank'));
            system.debug('Exception occured '+e);
        }
        
        /*list<Staff_Assignment__c> updateSA = new list<Staff_Assignment__c>();
list<Staff_Assignment__c> sUpdate1 = [select id from Staff_Assignment__c where Staffing_Assignment__c=:s.id];


for(Staff_Assignment__c eachSA : sUpdate1){
eachSA.Should_Extended_AMT_be_updated__c = true;
}

update sUpdate1;

System.assertequals('XYZ',uu.LastName,'user last name');
Integer num = [select count() from Policy_Information__c];
System.assertEquals(2, num,'total number of policy information created'); 
System.assertequals('Low',c2.Priority,'priority of case 2');
Integer num1 = [select count() from Staff_Assignment__c];
System.debug('Staff_Assignment__c count: '+num1); 
System.assertEquals(1, num1,'total number of staff assignment created');*/
        
    }
}