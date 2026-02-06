@isTest
public class RetentionStatusController_Test {
    
    @isTest 
    static void GetAllRenewalDataTest(){
        try{
            test.startTest();
            System.debug('Inside try');
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
            
            System.debug('Account inserted successfully');
            
            
            Renewal_Status__c createNewRenewalStatus=new Renewal_Status__c();
            createNewRenewalStatus.Company__c=testAccountExistingClient.Id;
            createNewRenewalStatus.Name='TestRenewal';
            createNewRenewalStatus.Efective_Date__c=System.today().addDays(-1);
            createNewRenewalStatus.isRenewalStatusRecord__c=true;
            createNewRenewalStatus.Date_sent_to_ISI_Site__c=System.now();
            createNewRenewalStatus.Sales_Cycle__c='IY19, 1/1/20';
            createNewRenewalStatus.Date_Submitted_For_Incentives__c=System.now();
            createNewRenewalStatus.Sales_person_1__c=UserInfo.getUserId();
            createNewRenewalStatus.Sales_Person_1_split_percentage__c=50;
            createNewRenewalStatus.Sales_Person_2__c=UserInfo.getUserId();
            createNewRenewalStatus.Sales_Person_2_Split_percentage__c=50;
            createNewRenewalStatus.Will_sales_incentives_be_split__c='Yes';
            createNewRenewalStatus.Eligible_for_Sales_Incentives__c='Yes';
            createNewRenewalStatus.Product_Line__c='Dental';
            createNewRenewalStatus.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';
            createNewRenewalStatus.Product_Confirmed__c='APP';    
            insert createNewRenewalStatus;
            
            Renewal_Status__c createNewRenewalStatus1=new Renewal_Status__c();
            createNewRenewalStatus1.Company__c=testAccountExistingClient.Id;
            createNewRenewalStatus1.Name='TestRenewal';
            createNewRenewalStatus1.Efective_Date__c=System.today();
            createNewRenewalStatus1.isRenewalStatusRecord__c=true;
            // createNewRenewalStatus1.Date_sent_to_ISI_Site__c=System.now();
            createNewRenewalStatus1.Sales_Cycle__c='IY19, 1/1/20';
            // createNewRenewalStatus1.Date_Submitted_For_Incentives__c=System.now();
            createNewRenewalStatus1.Sales_person_1__c=UserInfo.getUserId();
            createNewRenewalStatus1.Sales_Person_1_split_percentage__c=50;
            createNewRenewalStatus1.Sales_Person_2__c=UserInfo.getUserId();
            createNewRenewalStatus1.Sales_Person_2_Split_percentage__c=50;
            createNewRenewalStatus1.Will_sales_incentives_be_split__c='Yes';
            createNewRenewalStatus1.Eligible_for_Sales_Incentives__c='Yes';
            createNewRenewalStatus1.Product_Line__c='Dental';
            createNewRenewalStatus1.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';
            createNewRenewalStatus1.Product_Confirmed__c='APP';    
            insert createNewRenewalStatus1;
            System.debug('Successfully inserted--renewals');
            RetentionStatusController.GetAllRenewalData('IY19, 1/1/20','Company__r.name','ASC');
            RetentionStatusController.GetAllRenewalData('IY20, 1/1/21','Company__r.name','ASC');
            RetentionStatusController.GetAllRenewalData('','','');
            RetentionStatusController.GetAllRenewalData('IY19, 1/1/20','','');
            RetentionStatusController.fetchPicklist('Renewal_Status__c', 'Sales_Cycle__c');
             System.assert(true);
            test.stopTest();
        }
        catch(Exception e){
            System.debug('Exception occured @-->'+e.getLineNumber()+'Because'+e.getMessage());  
        }
    }
    @isTest 
    static void GetAllRenewalDataforVPCRTest(){
        try{
            test.startTest();
            System.debug('Inside try');
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
            testAccountExistingClient.CMVPCRRVP__c=UserInfo.getUserId();
            insert testAccountExistingClient;
            
            System.debug('Account inserted successfully');
            
            Renewal_Status__c createNewRenewalStatus=new Renewal_Status__c();
            createNewRenewalStatus.Company__c=testAccountExistingClient.Id;
            createNewRenewalStatus.Name='TestRenewal';
            createNewRenewalStatus.Efective_Date__c=System.today().addDays(-1);
            createNewRenewalStatus.isRenewalStatusRecord__c=true;
            createNewRenewalStatus.Date_sent_to_ISI_Site__c=System.now();
            createNewRenewalStatus.Sales_Cycle__c='IY19, 1/1/20';
            createNewRenewalStatus.Date_Submitted_For_Incentives__c=System.now();
            createNewRenewalStatus.Sales_person_1__c=UserInfo.getUserId();
            createNewRenewalStatus.Sales_Person_1_split_percentage__c=50;
            createNewRenewalStatus.Sales_Person_2__c=UserInfo.getUserId();
            createNewRenewalStatus.Sales_Person_2_Split_percentage__c=50;
            createNewRenewalStatus.Will_sales_incentives_be_split__c='Yes';
            createNewRenewalStatus.Eligible_for_Sales_Incentives__c='Yes';
            createNewRenewalStatus.VPCR_RVP__c=UserInfo.getUserId();
            createNewRenewalStatus.Product_Line__c='Dental';
            createNewRenewalStatus.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';
            createNewRenewalStatus.Product_Confirmed__c='APP';    
            insert createNewRenewalStatus;
            System.debug('Successfully inserted--renewals');
            Renewal_Status__c createNewRenewalStatus1=new Renewal_Status__c();
            createNewRenewalStatus1.Company__c=testAccountExistingClient.Id;
            createNewRenewalStatus1.Name='TestRenewal';
            createNewRenewalStatus1.Efective_Date__c=System.today();
            createNewRenewalStatus1.isRenewalStatusRecord__c=true;
            // createNewRenewalStatus1.Date_sent_to_ISI_Site__c=System.now();
            createNewRenewalStatus1.Sales_Cycle__c='IY19, 1/1/20';
            // createNewRenewalStatus1.Date_Submitted_For_Incentives__c=System.now();
            createNewRenewalStatus1.Sales_person_1__c=UserInfo.getUserId();
            createNewRenewalStatus1.Sales_Person_1_split_percentage__c=50;
            createNewRenewalStatus1.Sales_Person_2__c=UserInfo.getUserId();
            createNewRenewalStatus1.VPCR_RVP__c=UserInfo.getUserId();
            createNewRenewalStatus1.Sales_Person_2_Split_percentage__c=50;            createNewRenewalStatus1.Will_sales_incentives_be_split__c='Yes';
            createNewRenewalStatus1.Eligible_for_Sales_Incentives__c='Yes';
            createNewRenewalStatus1.Product_Line__c='Dental';
           // createNewRenewalStatus1.Renewal_Confirmed_Members_Sale__c='Confirmed; Partial Cancel';
            createNewRenewalStatus1.Product_Confirmed__c='APP';    
            insert createNewRenewalStatus1;
            String loggedInUserName=UserInfo.getName();
            RetentionStatusController.GetAllRenewalDataforVPCR('IY19, 1/1/20','Company__r.name','ASC','',loggedInUserName,'TestUniversity',System.today());
            RetentionStatusController.GetAllRenewalDataforVPCR('','','','',null,'TestUniversity',null);
            RetentionStatusController.GetAllRenewalDataforVPCR('IY19, 1/1/20','','','',null,'TestUniversity',null);
            RetentionStatusController.GetAllRenewalDataforVPCR('IY20, 1/1/21','','','',null,'TestUniversity',null);
            RetentionStatusController.GetAllRenewalDataforVPCR('IY19, 1/1/20','Company__r.name','ASC','Current',null,'TestUniversity',null);
            RetentionStatusController.GetAllRenewalDataforVPCR('IY19, 1/1/20','Company__r.name','ASC','Previous',null,'TestUniversity',null);
             System.assert(true);
            test.stopTest();
            
        }
        catch(Exception e){
            System.debug('Exception occured @-->'+e.getLineNumber()+'Because'+e.getMessage());  
        }
    }
    @isTest 
    static void getTemplateInXMLTest(){
        try{
            List<user> userListToInsert = new List<user>();
            
            userListToInsert.add(new User(
                LastName = 'User 123',
                FirstName='Test',
                Alias = 'tstusr12',
                Email = 'vpcrtestuser1@crmit.com',
                Username = 'vpcrtestuser1@crmit.com',
                ProfileId = [select Id, Name from Profile where name = 'CM Sales Team Standard Profile' limit 1].id,
                UserRoleId = [select Id, Name from UserRole where name = 'CM VPCR/RVP' limit 1].id,
                TimeZoneSidKey = 'GMT',
                LanguageLocaleKey = 'en_US',
                EmailEncodingKey = 'UTF-8',
                LocaleSidKey = 'en_US',
                Position__c='Test User',VPCR__c=true));
            
           
            
            insert userListToInsert;
            
            test.startTest();
            
            RetentionStatusController.getTemplateInXML('CM VPCR/RVP');
            RetentionStatusController.getTemplateInXML('CM SCE');
            RetentionStatusController.getTemplateInXML('Specialty Benefits SCE');
            System.assert(true);
            System.runAs (userListToInsert[0]) {
                RetentionStatusController.getTemplateInXML('CM VPCR/RVP');
            }
            test.stopTest();
        }
        catch(Exception e){
            
        }
    }
}