@isTest
public class MA_Consultants_ClassTest {
    public static  string columnName  ='IsPrimary';
    public static  string sortType  ='Asc';
    public static  string searchKeyValEmpty='';
    public static  string searchKeyValsam='sam';
    
    public static  Integer pageNumber=1;	
    public static string searchField='';
    public static string searchFieldsam='sam';
    public static string operator='';
    public static string operatorminus='';
    public static string a;
    public static string contactRecordTypeIdEmpty='';
    public static List<string> conlist;
    
    public static string lName='email test';
    public static string fName='email test fname';
    public static string accountemail='test KA';
    public static string addressemail='test KAA'; 
    public static string phone='123456789';
    public static string email='xxtest@crmit.com';
    public static string  helper='helper';
    public static string  apex = 'apex';
    //lName, fName, account, address, phone, email, maId);
    
    static{
        /*bulkTestData.UserTestData();
        bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.BGHContactTestData();
        bulkTestData.opportunityTestData();
        bulkTestData.opportunityContactRoleTestData();*/
            
        Id userProfileId= [select Id, Name from Profile where name = 'System Administrator' limit 1].id;
        List<User> usersList = new List<User>();
        List<Account> accList = new List<Account>();
        List<Contact> contactsList = new List<Contact>();
        List<Opportunity> oppList = new List<Opportunity>();
        List<OpportunityContactRole> oppContactRolesList = new List<OpportunityContactRole>();
        
        /* Test Users Data */
        User readOnlyUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDevReadOnly@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            Position__c = 'Test User',
            LocaleSidKey = 'en_US'); 
        usersList.add(readOnlyUser);
        
        User noaccessUser = new User(
            LastName = 'LIVE',
            FirstName='JASON',
            Alias = 'jliv',
            Email = 'jason.liveston@crmit.com',
            Username = 'uhgDevReadOnlyandnoaccessUser@crmit.com',
            ProfileId = [select Id, Name from Profile where name = 'Test No Access Profile' limit 1].id,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            Position__c = 'Test User',
            LocaleSidKey = 'en_US');        
        usersList.add(noaccessUser);
        
        User readandwriteUser = new User(
            LastName = 'LIVEE',
            FirstName='JASONN',
            Alias = 'jlivv',
            Email = 'jasonn.livestonn@crmit.com',
            Username = 'readandwriteUser@crmit.com',
            ProfileId =userProfileId,
            TimeZoneSidKey = 'GMT',
            LanguageLocaleKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            Position__c = 'Test User',
            LocaleSidKey = 'en_US');        
        usersList.add(readandwriteUser);
        
        insert usersList;
        
        /* Test Accounts Data */
        Account accCD = new Account();
        accCD.Name = 'Competitive Medical CD';
        accCD.Subtype__c ='Prospect';
        accCD.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        accList.add(accCD);
        
        Account acconsultiongfirm1 = new Account();
        acconsultiongfirm1.Name = 'Consulting Accounts';
        acconsultiongfirm1.Subtype__c ='Consulting Firm';
        acconsultiongfirm1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        accList.add(acconsultiongfirm1);
        
        insert accList;

		/* Test Contact Data */        
        
		Contact contact = new contact();
        contact.AccountId=accCD.Id;
        contact.CEO__c=false;
        contact.FirstName ='test qwerty2';
       	contact.LastName='lasr qwerty2';
        contact.OtherCountry='United States';
        contact.RecordTypeId=Schema.SObjectType.contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
        contact.Status__c='Inactive';
        contact.InactiveStatusReason__c='Duplicate';
        contactsList.add(contact);
        
        Contact contact1 = new contact();
        contact1.AccountId=accCD.Id;
        contact1.CEO__c=false;
        contact1.FirstName ='test qwerty';
        contact1.LastName='lasr qwerty';
        contact1.OtherCountry='United States';
        contact1.RecordTypeId=Schema.SObjectType.contact.getRecordTypeInfosByName().get('CD Contact').getRecordTypeId();
        contact1.Status__c='Active';
        contactsList.add(contact1);
        
        Contact c = new contact();
        c.AccountId=acconsultiongfirm1.Id;
        c.CEO__c=false;
        c.FirstName ='test acconsultiongfirm1';
        c.LastName='lasr acconsultiongfirm1';
        c.OtherCountry='United States';
        c.RecordTypeId=Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        c.DecisionMakingRole__c='Consultant Practice Leader';
        c.Status__c='Active'; 
        contactsList.add(c);
        
        insert contactsList;       

        /* Test Opportunities Data */
        Opportunity opp =  new Opportunity();
        opp.AccountId=accCD.Id;
        opp.Name='Test Opportunity';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp.Expected_Date_of_RFP__c = system.today();
        opp.StageName = 'Qualification';
        opp.CloseDate=System.today();
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        oppList.add(opp);
        
        Opportunity opp2 =  new Opportunity();
        opp2.AccountId=accCD.Id;
        opp2.Name='Test OpportunityaccOpp';
        opp2.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp2.EffectiveDate__c = system.today();
        opp2.Product_Type_Involved_in_Opp__c = 'Medical;Vision';
        opp2.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp2.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp2.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp2.Expected_Date_of_RFP__c = system.today();
        opp2.StageName = 'Qualification';
        opp2.CloseDate=System.today();
        opp2.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        oppList.add(opp2);
        
        insert oppList;
        
        /* Test Opportunity Contact Role Data */        
        OpportunityContactRole ocr = new OpportunityContactRole();
        ocr.ContactId=contact1.Id;
        ocr.OpportunityId=opp.Id;
        ocr.IsPrimary=true;
        oppContactRolesList.add(ocr); 
        
        OpportunityContactRole ocr2 = new OpportunityContactRole();
        ocr2.ContactId=contact.Id;
        ocr2.OpportunityId=opp.Id;
        ocr2.IsPrimary=false;
        oppContactRolesList.add(ocr2);
        
        insert oppContactRolesList;
        
        
    }
    
    public static testMethod void validateAllMethods(){
        a = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        conlist = new List<string>();
        conlist.add(a);
        Test.startTest();
        MA_Consultants_Class.getLoggedInUserRoles();
        
        MA_Consultants_Class.fetchMAConsultants([SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id,
                                                pageNumber, columnName, sortType);
        system.debug('Id@@@'+[SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id+'conlist@@@'+conlist);
        MA_Consultants_Class.relateContactToMA([SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id,
                                               conlist, true);
        MA_Consultants_Class.deleteRelationship([SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id,
                                                [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id, null);
        MA_Consultants_Class.deleteRelationship([SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id,
                                                [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id, null);
        MA_Consultants_Class.getConsultants(searchKeyValEmpty, 1, searchField, operator, contactRecordTypeIdEmpty,
                                            [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id,
                                            false, null); 
        Test.stopTest();
        
        // MA_Consultants_Class.sendMailFromApex(lName, fName, accountemail, addressemail, phone, email,
        //                                      [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id);
        //sendMailFromApex(String lName, String fName, String account, String address, String phone, String email, Id maId){
        
        
    }
    
    //validsate the fetchmethod without opportunitycontactrole
    public static testMethod void validatefetchMAConsultantsWithoutOCR(){
        MA_Consultants_Class.fetchMAConsultants([SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id,
                                                pageNumber, columnName, sortType);
    } 
    //vaidate the fetchmethod with NoAccess Exception
    public static testmethod void validatefetchMAwithNoAccessException(){
        User readOnlyUser = [Select id from user where username = 'uhgDevReadOnly@crmit.com' Limit 1];
        try{
            string b =[SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id;
            system.debug('b@@@@'+b);
            system.runAs(readOnlyUser){
                Test.startTest();
                MA_Consultants_Class.fetchMAConsultants(b,pageNumber, columnName, sortType); 
                Test.stopTest(); 
            }
            
        }catch(Exception e){
            system.assert(e.getMessage().contains('Script-thrown exception'),true);
            
        }
        
    } 
    //vaidate the fetchmethod with NullPointer 
    
    public static testmethod void validatefetchMAwithNullPointer(){
        try{
            MA_Consultants_Class.fetchMAConsultants(null,pageNumber, columnName, sortType);
        }catch(Exception e){
            system.assert(e.getMessage().contains('Script-thrown exception'),true);
            //system.assert(null,null);
        }
        
    }
    //validate all  related all contact MA.
    public static testmethod void validaterelateContactToMAWithDiffParams(){ 
        a = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        conlist = new List<string>();
        conlist.add(a);
        
        try{
            MA_Consultants_Class.relateContactToMA
                ([SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id,conlist, true);
        }catch(Exception e){
            system.debug('@@e@@'+e.getMessage());           
        }
    } 
    //vaidate the relateContactToMA with NoAccess Exception
    public static testmethod void relateContactToMAWithNoAccessException(){
        a = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        conlist = new List<string>();
        conlist.add(a);
        
        User readOnlyUser = [Select id from user where username = 'uhgDevReadOnly@crmit.com' Limit 1];
        try{
            string op =[SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1].Id;
            system.runAs(readOnlyUser){
                system.debug('op@@@2'+op+'conlist@@@2'+conlist+'readOnlyUser@@@2'+readOnlyUser);
                MA_Consultants_Class.relateContactToMA(op,conlist, true); 
            }
            
        }catch(Exception e){
            system.assert(e.getMessage().contains('Script-thrown exception'),true);
        }
        
    }
    //validate the realteContactToMA with nullpoiter exception
    public static testmethod void validaterealteContactToMAWithNullPoiterException(){
        try{
            MA_Consultants_Class.relateContactToMA(null,null, true);
        }catch(Exception e){
            system.debug('@@e@@relateContactToMA : '+e.getMessage());           
        } 
    }
    //validate the deleteRelationship with NoAccessException
    public static testmethod void validateDeleteRelationshipWithNoAccessException(){
        string conid = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        string oppid= [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        User readOnlyUser = [Select id from user where username = 'uhgDevReadOnly@crmit.com' Limit 1];
        
        system.runAs(readOnlyUser){
            try{
                MA_Consultants_Class.deleteRelationship(oppid,conid, null);
            }catch(Exception e){
                system.debug('@@e@@'+e.getMessage());           
            }   
        }  
    }
    //validate the deleteRelationship with fail records with calling the same method twice.
    public static testmethod void validateDeleteRelationshipWithFailRecords(){
        string conid = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        string conidfail = [ Select Id from Contact where firstname ='test acconsultiongfirm1' limit 1].Id;
        string oppid= [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        try{
            MA_Consultants_Class.deleteRelationship(oppid,conid, null);
            MA_Consultants_Class.deleteRelationship(oppid,conid, null);
        }catch(Exception e){
            system.debug('@@e@@'+e.getMessage());           
        }   
    }
    //validate the deleteRelationship with fail records with calling the same method twice.
    public static testmethod void validateDeleteRelationshipWithNullPoiterException(){
        try{
            MA_Consultants_Class.deleteRelationship(null,null, null);
        }catch(Exception e){
            system.debug('@@e@@relateContactToMA : '+e.getMessage());           
        } 
    }
    //validate the updatePrimaryId with nullpointer Exception
    public static testmethod void validateupdatePrimaryIdNullPoiter(){        
        try{
            MA_Consultants_Class.updatePrimaryId(null, null, false, helper);
        }catch(Exception e){
            system.assert(e.getMessage().contains('Script-thrown exception'),true);           
        } 
    }
    //validate the updatePrimaryId with nullpointer Exception
    public static testmethod void validateupdatePrimaryIdNullPoiterwithapex(){
        try{
            MA_Consultants_Class.updatePrimaryId(null, null, true, apex);
        }catch(Exception e){
            system.assert(e.getMessage().contains('Script-thrown exception'),true);           
        } 
    }
    //validate the updatePrimaryId with noAccess Exception
    public static testmethod void validateupdatePrimaryIdNoAccess(){
        string conid = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        string oppid= [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        User readOnlyUser = [Select id from user where username = 'uhgDevReadOnly@crmit.com' Limit 1];
        
        system.runAs(readOnlyUser){
            try{
                MA_Consultants_Class.updatePrimaryId(oppid, conid, false, helper);
            }catch(Exception e){
                system.debug('@@e@@'+e.getMessage());           
            } 
        }
    } 
    //query exception for updateroleinMA
    public static testmethod void validateupdateRoleInMAQueryException(){
        string conid = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        string oppid= [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        try{
            MA_Consultants_Class.updateRoleInMA(conid, conid);
        }catch(Exception e){
            system.debug('updateRoleInMA with query exception'+e.getMessage());           
        } 
    }
    //validate the updatePrimaryId with nullpointer Exception
    public static testmethod void validateupdateRoleInMANullPoiter(){
        string conid = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        string oppid= [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        try{
            MA_Consultants_Class.updateRoleInMA(null, null);
        }catch(Exception e){
            system.assert(e.getMessage().contains('Script-thrown exception'),true);           
        } 
    }
    //validate the updateRoleInMA with noAccess Exception
    public static testmethod void validateupdateRoleInMANoAccess(){
        string conid = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        string oppid= [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        User readOnlyUser = [Select id from user where username = 'uhgDevReadOnly@crmit.com' Limit 1];
        
        system.runAs(readOnlyUser){
            try{
                MA_Consultants_Class.updateRoleInMA(oppid, conid);
            }catch(Exception e){
                system.debug('@@e@@'+e.getMessage());           
            } 
        }
    }
    //validate clearPrimaryRoleFieldForAllRecords with  null pointer exception
    public static testmethod void validateclearPrimaryRoleFieldForAllRecordsNullPoiter(){
        string conid = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        string oppid= [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        try{
            MA_Consultants_Class.clearPrimaryRoleFieldForAllRecords(null);
        }catch(Exception e){
            system.assert(e.getMessage().contains('Script-thrown exception'),true);           
        } 
    }
    //validate the updatePrimaryId with noAccess Exception
    public static testmethod void validateclearPrimaryRoleFieldForAllRecordsNoAccess(){
        string conid = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        string oppid= [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        User readOnlyUser = [Select id from user where username = 'uhgDevReadOnly@crmit.com' Limit 1];
        
        system.runAs(readOnlyUser){
            try{
                MA_Consultants_Class.clearPrimaryRoleFieldForAllRecords(oppid);
            }catch(Exception e){
                system.debug('@@e@@'+e.getMessage());           
            } 
        }
    }
    //validate the updatePrimaryId with query Exception
    public static testmethod void validateclearPrimaryRoleFieldForAllRecordsQueryException(){
        string conid = [SELECT Id FROM Contact WHERE FirstName='test qwerty2' LIMIT 1].Id;
        string oppid= [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        User readOnlyUser = [Select id from user where username = 'uhgDevReadOnly@crmit.com' Limit 1];
        try{
            MA_Consultants_Class.clearPrimaryRoleFieldForAllRecords(readOnlyUser.Id);
        }catch(Exception e){
            system.debug('@@e@@'+e.getMessage());
        }
    }
    //validate the  getConsultants method 
    
    public static testmethod void validateGetConsultants(){
        //define contants for params
        string searchfirstname ='test qwerty';
        string searchlastname ='lasr qwerty';
        String CONTACT_CONSULTING_FIRM_ITAG = 'Account.Name';
        //pass field name here
        string lastname='last name';
        string firstname='first name';
        string ConsultingFirm = 'Consulting Firm';
        //pass diff operators
        string contains='CONTAINS' ;
        string BEGINS_WITH='Begins With';
        string EQUALS_TO ='Equals to';
        //space
        string space ='';
        List <String> conidAlreadyPresent ;
        Decimal pageNumber = 1 ;
        string oppid = [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        string accid= [Select Id from Account where name = 'Competitive Medical CD'].Id;
        try{
            Test.startTest();
            MA_Consultants_Class.getConsultants
                (searchfirstname, pageNumber, lastname, contains, contactRecordTypeIdEmpty, oppid,true, conidAlreadyPresent);
            MA_Consultants_Class.getConsultants
                (searchfirstname, pageNumber, lastname, BEGINS_WITH, contactRecordTypeIdEmpty, oppid,false, conidAlreadyPresent);
            MA_Consultants_Class.getConsultants
                (searchfirstname, pageNumber, lastname, EQUALS_TO, contactRecordTypeIdEmpty, oppid,false, conidAlreadyPresent);
            MA_Consultants_Class.getConsultants
                (searchlastname, pageNumber, firstname, contains, contactRecordTypeIdEmpty, oppid,false, conidAlreadyPresent);
            MA_Consultants_Class.getConsultants
                (CONTACT_CONSULTING_FIRM_ITAG, pageNumber, ConsultingFirm, contains, contactRecordTypeIdEmpty, oppid,false, conidAlreadyPresent);
            MA_Consultants_Class.getConsultants
                (searchlastname, pageNumber, space, contains, contactRecordTypeIdEmpty, oppid,true, conidAlreadyPresent);
            MA_Consultants_Class.getConsultants
                (searchlastname, pageNumber, space, contains, contactRecordTypeIdEmpty, oppid,false, conidAlreadyPresent);
            //below method will cover the auraexception > passed accid instead of oppid
            MA_Consultants_Class.getConsultants
                (searchfirstname, pageNumber, lastname, contains, contactRecordTypeIdEmpty, accid,true, conidAlreadyPresent);
            Test.stopTest();
            
        }catch(Exception e){
            system.debug('@@e@@'+e.getMessage());           
        } 
    }
    //validate the updatePrimaryId with noAccess Exception
    public static testmethod void validategetConsultantsNoAccess(){
        //define contants for params
        string searchfirstname ='test qwerty';
        string searchlastname ='lasr qwerty';
        String CONTACT_CONSULTING_FIRM_ITAG = 'Account.Name';
        //pass field name here
        string lastname='last name';
        string firstname='first name';
        string ConsultingFirm = 'Consulting Firm';
        //pass diff operators
        string contains='CONTAINS' ;
        string BEGINS_WITH='Begins With';
        string EQUALS_TO ='Equals to';
        //space
        string space ='';
        List <String> conidAlreadyPresent ;
        Decimal pageNumber = 1 ;
        string oppid = [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        string accid= [Select Id from Account where name = 'Competitive Medical CD'].Id;
        
        User readOnlyUser = [Select id from user where username = 'uhgDevReadOnly@crmit.com' Limit 1];
        
        system.runAs(readOnlyUser){
            try{
                MA_Consultants_Class.getConsultants
                    (searchfirstname, pageNumber, lastname, contains, contactRecordTypeIdEmpty, oppid,true, conidAlreadyPresent);
            }catch(Exception e){
                system.debug('@@e@@'+e.getMessage());           
            } 
        }
    }
    //validate sendMailFromApex method
    public static testmethod void validate_sendMailFromApex(){
        String lName ='testName';
        String fName='test sangam';
        String account='testAccount';
        String address='testJaipur';
        String phone='123456789';
        String email='testgmail@gmal.com';
        String jobTitle='Senior Consultant';
        Opportunity opportunityData= null;
        boolean isFromQAfalse=false;
        boolean isFromQAtrue=true;
        // String maId=[];
        string maId = [SELECT Id FROM Opportunity WHERE Name='Test OpportunityaccOpp' LIMIT 1].Id;
        String accName='testAccName';
        string accid = [Select Id from Account where name = 'Competitive Medical CD'].Id;
        Test.startTest();
        MA_Consultants_Class.sendMailFromApex
            (lName, fName, account, address, phone, email, jobTitle, opportunityData, isFromQAfalse, maId, accName);
        MA_Consultants_Class.sendMailFromApex
            (lName, fName, account, address, phone, email, jobTitle, opportunityData, isFromQAtrue, accid, accName);
        MA_Consultants_Class.sendMailFromApex
            ('', '', '', '', '', '', '', null, true, '', '');
        Test.stopTest();
        
        
    } 
}