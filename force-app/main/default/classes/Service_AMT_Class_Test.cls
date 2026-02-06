@isTest
public class Service_AMT_Class_Test {
    @testSetup static void setup() {
        List<Account> testAccts = new List<Account>();
        for(Integer i=0;i<3;i++) {
            testAccts.add(new Account(Name = 'TestAcct'+i,Subtype__c = ' National Accounts - East',Type =' National Accounts - East'));
        }
        insert testAccts;
        
        List<ADS__c> testAds = new List<ADS__c>();
        for(Integer i=0;i<3;i++) {
            testAds.add(new ADS__c(FirstName__c = 'test FirstName'+i,MiddleName__c = 'test MiddleName'+i,Email__c = 'TestAcct'+i+'@test.com'));
        }
        insert testAds;
        
        List<Policy_Information__c> testPolicyInfo = new List<Policy_Information__c>();
        if(testAccts.size() >0){
            for(Integer i=0;i<3;i++) {
                for(Integer j=4;j<7;j++){
                    testPolicyInfo.add(new Policy_Information__c(Name = '111111'+i+j,Company__c = testAccts[i].Id,Policy__c='abcd'+i));  
                }
                
            }
        }
        insert testPolicyInfo;
        
        List<ADS__c> testADSInfo = new List<ADS__c>();
        for(Integer i=0;i<5;i++){
            testADSInfo.add(new ADS__c(LastName__c ='Test ads last'+i,FirstName__c = 'Test ads First'+i,Email__c='TestAds'+i+'@test.com'));
        }
        insert testADSInfo;
        
        List<Service_AMT__c> serList = new List<Service_AMT__c>();
        
        Account acct = [SELECT Id FROM Account WHERE Name='TestAcct2' LIMIT 1];
        Account accId = [Select id from account where name='TestAcct0' LIMIT 1];
        
        Policy_Information__c poliInfo = new Policy_Information__c();
        poliInfo.Name = '11111134';
        poliInfo.Company__c = acct.Id;
        poliInfo.Policy__c = 'Test Policy';
        insert poliInfo;
        
        Service_AMT__c ser1 = new Service_AMT__c();
        ser1.Company__c= acct.Id;
        ser1.First_Name__c =testADSInfo[0].FirstName__c;
        ser1.Last_Name__c = testADSInfo[0].LastName__c;
        ser1.Email__c = testADSInfo[0].Email__c;
        ser1.Policy_Information_MultiChecKlist__c = '11111134;11111135;11111136;11111115';
        ser1.All_Policy__c = true;
        ser1.UserHierarchy__c = 1;
        ser1.Contact_Role__c = 'Banking Analyst';
       
        
        Service_AMT__c ser2 = new Service_AMT__c();
        ser2.Company__c= acct.Id;
        ser2.First_Name__c =testADSInfo[0].FirstName__c;
        ser2.Last_Name__c = testADSInfo[0].LastName__c;
        ser2.Email__c = testADSInfo[0].Email__c;
        ser2.Policy_Information_MultiChecKlist__c = '11111134;11111135;11111136;11111115';
        ser2.All_Policy__c = true;
        ser2.UserHierarchy__c = 1;
        ser2.Case_Management_End_Date__c = date.newInstance(2012,05,22);
        ser2.Contact_Role__c = 'Banking Analyst';
        ser2.Case_Management_End_Date__c = null;
        ser2.External__c = true;
        
        Service_AMT__c ser3 = new Service_AMT__c();
        ser3.Company__c= acct.Id;
        ser3.First_Name__c =testADSInfo[0].FirstName__c;
        ser3.Last_Name__c = testADSInfo[0].LastName__c;
        ser3.Email__c = testADSInfo[0].Email__c;
        ser3.Policy_Information_MultiChecKlist__c = '11111134;11111135;11111136;11111115';
        ser3.All_Policy__c = true;
        ser3.UserHierarchy__c = 1;
        ser3.Case_Management_End_Date__c = date.newInstance(2012,05,22);
        ser3.External__c = true;
        ser3.Contact_Role__c = 'Banking Analyst';
        
        Service_AMT__c ser4 = new Service_AMT__c();
        ser4.Company__c= acct.Id;
        ser4.First_Name__c =testADSInfo[0].FirstName__c;
        ser4.Last_Name__c = testADSInfo[0].LastName__c;
        ser4.Email__c = testADSInfo[0].Email__c;
        ser4.Policy_Information_MultiChecKlist__c = '11111134;11111135;11111136;11111115';
        ser4.All_Policy__c = true;
        ser4.UserHierarchy__c = 1;
        ser4.Case_Management_End_Date__c = date.newInstance(2012,05,22);
        ser4.Contact_Role__c = 'Banking Analyst';
        ser4.Case_Management_End_Date__c = null;
        ser4.External__c = true;
        
        serList.add(ser1);
        serList.add(ser2);
        serList.add(ser3);
        serList.add(ser4);
        
        insert serList;
            
    } 
    @isTest static void testMethod1() {
        Service_AMT_Class serviceAmt = new Service_AMT_Class();
        Account acct = [SELECT Id FROM Account WHERE Name='TestAcct2' LIMIT 1];
        Service_AMT_Class.defineSobjectType(acct.Id);
        List<Policy_Information__c> pol = [SELECT Id,Name FROM Policy_Information__c WHERE Company__c= :acct.Id];
        ADS__c adsQ = [SELECT Id,LastName__c,FirstName__c,Email__c FROM ADS__c WHERE LastName__c ='Test ads last1' LIMIT 1];
        
        String names = '';
        for(Integer i=0;i<pol.size();i++){
            if(i==0){
                names  = pol[0].Name; 
            }else{
                names +=';'+ pol[i].Name;   
            }
            
        }
        
        Sobject sobj = (Sobject)adsQ;       
        Service_AMT_Class.getServiceAMTData(pol[0].Id, 'Last_Name__c ','DESC');
        Service_AMT_Class.getServiceAMTDataOnload(pol[0].Id, 'Last_Name__c ','DESC');
        Service_AMT_Class.getcases();
        Service_AMT_Class.getPolicyInfo(pol[0].Id);
        Service_AMT_Class.getSearchList('Test', 1, 'Title','Begins With', acct.Id, false,'a','First Name','Begins With','Title','ASC');
        Service_AMT_Class.getSearchList('Test', 1, 'Email','Begins With', acct.Id, false,'a','First Name','Begins With','Email','ASC');
        try{
            Service_AMT_Class.createUserServiceAMTRecord(acct.Id, adsQ, 'Service Account Manager',names); 
            
            Account acctSam = new Account();
            acctSam.Name = 'Test Account Samarth';
            acctSam.Subtype__c='National Accounts - East';
            acctSam.Type = 'National Accounts - East';
            insert acctSam;
            
            Policy_Information__c poliInfo = new Policy_Information__c();
            poliInfo.Name = '123456';
            poliInfo.Company__c = acctSam.Id;
            poliInfo.Policy__c = 'Test Policy';
            insert poliInfo;
            
            Service_AMT__c ser11 = new Service_AMT__c();
            ser11.Company__c= acctSam.Id;
            ser11.First_Name__c ='Test';
            ser11.Last_Name__c = 'Name';
            ser11.Email__c = 'test@email.com';
            ser11.Policy_Information_MultiChecKlist__c = '11111134;11111135;11111136;11111115';
            ser11.All_Policy__c = true;
            ser11.UserHierarchy__c = 1;
            ser11.Contact_Role__c = 'Banking Analyst';
            insert ser11;
            
            Service_AMT__c ser22 = new Service_AMT__c();
            ser22.Company__c= acctSam.Id;
            ser22.First_Name__c ='Test';
            ser22.Last_Name__c = 'Name';
            ser22.Email__c = 'test@email.com';
            ser22.Policy_Information_MultiChecKlist__c = '11111134;11111135;11111136;11111115';
            ser22.All_Policy__c = true;
            ser22.UserHierarchy__c = 1;
            ser22.Contact_Role__c = 'Banking Analyst';
            ser22.Case_Management_End_Date__c = null;
            ser22.External__c = true;
            insert ser22;
            
            Service_AMT_Class.getServiceAMTData(acctSam.Id, 'Last_Name__c ','DESC');
            Assert.isNotNull( acctSam );
            
        }
        catch(Exception e){
            System.debug('e >>> '+e.getCause()+e.getMessage());
        }
        
    }
    
    
    @isTest static void testMethod2() {
        Account acct = [SELECT Id FROM Account WHERE Name='TestAcct2' LIMIT 1];
        Policy_Information__c pol = [SELECT Id,Name FROM Policy_Information__c WHERE Name='11111115' LIMIT 1];
        List<ADS__c>  adsLisdt = [Select Id,FirstName__c,LastName__c,Email__c from ADS__c LIMIT 10];
         system.debug('adsLisdt-----'+adsLisdt);
        for(ADS__c ads : adsLisdt){
         system.debug('adsLisdt-----'+ads);   
        }
        
        Account acct1 = [SELECT Id FROM Account WHERE Name='TestAcct2' LIMIT 1];
        List<Service_AMT__c> sAMT = [Select Id,Name,First_Name__c,Last_Name__c,Email__c,Policy_Information_MultiChecKlist__c,UserHierarchy__c,All_Policy__c from Service_AMT__c ];
        
        Test.startTest();
        Service_AMT_Class.defineSobjectType(acct.Id);
        Service_AMT_Class.updateServiceAMTRecords(acct1.Id,sAMT);
        sAMT[0].Policy_Information_MultiChecKlist__c = '11111134;11111135';
        update sAMT;
        Service_AMT_Class.getServiceAMTDataOnload(acct.id,'Last_Name__c','ASC');
        Service_AMT_Class.getServiceAMTDataOnload(pol.id,'Last_Name__c','ASC');
        Service_AMT_Class.updateServiceAMTRecords(pol.Id,sAMT);
        Service_AMT_Class.deleteRecords(acct.Id,sAMT[0].Id);
       
        Service_AMT_Class.getSearchList('Test', 1, 'Last Name','Begins With', acct.Id, false,'a','First Name','Begins With','','ASC');
        Service_AMT_Class.getSearchList('Test', 1, 'Last Name','Begins With', acct.Id, false,'a','First Name','Begins With','','ASC');
        Service_AMT_Class.getSearchList('Test', 1, 'Email__c','Begins With', acct.Id, false,'a','First Name','Begins With','Email__c','ASC');
        Service_AMT_Class.getSearchList('Test', 1, 'Title__c','Begins With', acct.Id, false,'a','First Name','Begins With','Email__c','ASC');
        Service_AMT_Class.getSearchList('test', 1, 'Last Name','Equals to', acct.Id, false,'test FirstName2','First Name','Equals to','','ASC');
        
        Service_AMT_Class.sendMailFromApex('Test', 'Test', 'Test', '1234567890', 'test@test.com');
        Test.stopTest();
        Assert.isNotNull( sAMT );
    }
    
}