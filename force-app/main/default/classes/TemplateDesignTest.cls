@isTest
public class TemplateDesignTest {
    
    @testSetup static void createTestData(){
        
        List<Account> acc = new List<Account>();
        acc.add(new Account(Name='testAccount',Subtype__c ='National Accounts - East',RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId()));
        insert acc;
        
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        
        Contact con = new Contact();
        con.FirstName = 'Test';
        con.RecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('CM Contact').getRecordTypeId();
        con.AccountId= acct;
        con.LastName = 'Tes';
        insert con;
        
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
            LocaleSidKey = 'en_US',
        	Position__c='Test User');
        
        insert readOnlyUser;
        
        Template_Design__c templateDesign= new Template_Design__c(); 
        templateDesign.Template_Type__c = 'Account';
        templateDesign.Name = 'CM Account Template';
        insert templateDesign;
        
        
        StaticResource sr1 = [SELECT Id, Body FROM StaticResource WHERE Name = 'TestAccountTemplate' LIMIT 1];
        ContentVersion cv = new ContentVersion();
        cv.ContentLocation = 'S';
        //cv.ContentDocumentId = ContentDocumentId;
        cv.VersionData = sr1.Body;
        cv.Title = 'CM_Account_Template.xml';
        cv.PathOnClient = '/CM_Account_Template.xml';	
        // cv.ContentUrl='pdf';        
        insert cv;
        
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id =: cv.Id].ContentDocumentId;
        cdl.LinkedEntityId = templateDesign.Id;
        cdl.ShareType = 'V';
        cdl.Visibility = 'AllUsers';
        insert cdl;
        
    }
    public testMethod static void validateGetRiskProfileMetaDate(){
        Id acct = [SELECT Id FROM Account WHERE Name='testAccount' LIMIT 1].Id;
        List<String> accId = new List<String>();
        accId.add(acct);
        Template_Design__c  templateDesg = [Select Id,Name,Template_Type__c from Template_Design__c];
        TemplateDesign.fetchDefaultTemplateContents();
        ReadAndGenerateXML.returnXMLbodyString(templateDesg.Name);
        ReadAndGenerateXML.getChildReleationShipNames('Account');
        TemplateDesign.getTemplateInXML(accId,'CM Account Template',templateDesg);
        TemplateDesign.getObjRelatedFields('Contact','CM Account Template');
        TemplateDesign.getPickListValues('Industry','Account');
        Map<String,List<String>> npsMap = new Map<String,List<String>>();
        //'{Owner__r.Name=(Automated, Begins With), Priority__c=(High, Equals to), Target_completion__c=(2019-03-05, Equals to)}';
        List<String> npsList = new List<String>{'Automated','Begins With'};
        npsMap.put('Owner__r.Name', npsList);
        TemplateDesign.searchForNPSTemplate(npsMap,1,1,1,'Name','ASC');
        Map<String,List<String>> npsMap1 = new Map<String,List<String>>();       
        List<String> npsList1 = new List<String>{'High','Equals to'};
        npsMap1.put('Priority__c', npsList1);
        TemplateDesign.searchForNPSTemplate(npsMap1,1,1,1,'Name','ASC');
        Map<String,List<String>> npsMap2 = new Map<String,List<String>>();       
        List<String> npsList2 = new List<String>{'2019-03-05','Equals to'};
        npsMap2.put('Target_completion__c', npsList2);
        TemplateDesign.searchForNPSTemplate(npsMap2,1,1,1,'Name','ASC');
        List<String> npsFields = new List<String>{'Owner__r.Name', 'Priority__c'};
        TemplateDesign.getNPSFields(npsFields);
        TemplateDesign.searchForRefAccounts('[{"fieldAPIName":"Name#text","fieldConditions":"Contains#test"},{"fieldAPIName":"Exchange_Competitors__c#boolean","fieldConditions":"Is checked#"},{"fieldAPIName":"Exchange_Competitors__c#boolean","fieldConditions":"Is not checked#"}]' , 1 ,'Account' , 1,1,'Name' , 'ASC');
        TemplateDesign.searchForRefAccounts('[{"fieldAPIName":"Current_Deal_Next_Renewal_Date__c#date","fieldConditions":"Equal to#2018-10-11"},{"fieldAPIName":"Current_Deal_Next_Renewal_Date__c#date","fieldConditions":"On or before#2018-10-10"},{"fieldAPIName":"Current_Deal_Next_Renewal_Date__c#date","fieldConditions":"On or after#2018-10-11"}]' , 1 ,'Account' , 1,1,'Name' , 'ASC');
        //TemplateDesign.searchForRefAccounts('[{"fieldAPIName":"Owner__c#dropdown","fieldConditions":"Equal to#Default"}]' , 1 ,'Account' , 1,1,'Name' , 'ASC');
        TemplateDesign.searchForRefAccounts('[{"fieldAPIName":"Cust_Tier_Known__c#number","fieldConditions":"Equal to#12"},{"fieldAPIName":"Cust_Tier_Known__c#number","fieldConditions":"Greater than#12"},{"fieldAPIName":"Cust_Tier_Known__c#number","fieldConditions":"Less than#12"}]' , 1 ,'Account' , 1,1,'Name' , 'ASC');
        TemplateDesign.searchForRefAccounts('[{"fieldAPIName":"Call_Site__c#search","fieldConditions":"Contains at least one value#Albuquerque - Standard (CCP)"},{"fieldAPIName":"Clinical_Site__c#search","fieldConditions":"Contains all values#Greensboro,Richardson"}] ' , 1 ,'Account' , 1,1,'Name' , 'ASC');
    }                    
}