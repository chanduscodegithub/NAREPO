@isTest
public class CM_MAConsultants_Batch_TestClass {
	static testMethod void testMethod1() {
        
        Account accCM = new Account();
        accCM.Name = 'Test CM Account 5555';
        accCM.Subtype__c = 'National Accounts - East';
        accCM.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM;                
        
        Account accCFirm = new Account();
        accCFirm.Name = 'Test Consulting Firm';
        accCFirm.Subtype__c = 'Consulting Firm';
        accCFirm.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert accCFirm;
        
        Account accCFirm1 = new Account();
        accCFirm1.Name = 'UHC - Direct, No Consultant';
        accCFirm1.Subtype__c = 'Consulting Firm';
        accCFirm1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Consulting Firm').getRecordTypeId();
        insert accCFirm1;
        
        Contact con = new Contact();
        con.AccountId = accCFirm.Id;
        con.FirstName ='Test';
        con.LastName = 'Contact';
        con.RecordTypeId = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        con.DecisionMakingRole__c = 'Consultant Practice Leader';
        con.Status__c = 'Active';        
        insert con;
        
        Contact con1 = new Contact();
        con1.AccountId = accCFirm1.Id;
        con1.FirstName ='UHC - Direct,';
        con1.LastName = ' No Consultant';
        con1.RecordTypeId = Schema.SObjectType.contact.getRecordTypeInfosByName().get('Consultant').getRecordTypeId();
        con1.Status__c = 'Active';        
        insert con1;
        
        List<Opportunity> oppList = new List<Opportunity>();
        Opportunity opp =  new Opportunity();
        opp.AccountId = accCM.Id;
        opp.Name = 'Test Opp 4444';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.EffectiveDate__c = System.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision;Dental;Pharmacy';
        opp.Has_a_Formal_RFP_Been_Issued__c = 'No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
        opp.Does_this_Oppty_Risk_Involve_Consultant__c ='';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';        
        opp.StageName='Qualification';
        opp.CloseDate=System.today();
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
        opp.Expected_Date_of_RFP__c = System.today();
        oppList.add(opp);
        
        Opportunity opp1 =  new Opportunity();
        opp1.AccountId = accCM.Id;
        opp1.Name = 'Test Opp 6666';
        opp1.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp1.EffectiveDate__c = System.today();
        opp1.Product_Type_Involved_in_Opp__c = 'Dental;Vision';
        opp1.Has_a_Formal_RFP_Been_Issued__c = 'No';
        opp1.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
        opp1.Does_this_Oppty_Risk_Involve_Consultant__c ='No';
        opp1.Is_There_Existing_Membership_at_Risk__c  = 'No';        
        opp1.StageName = 'Qualification';
        opp1.CloseDate = System.today();
        opp1.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
        opp1.Expected_Date_of_RFP__c = System.today();
        oppList.add(opp1);
        
        Opportunity opp2 =  new Opportunity();
        opp2.AccountId = accCM.Id;
        opp2.Name = 'Test Opp 5555';
        opp2.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp2.EffectiveDate__c = System.today();
        opp2.Product_Type_Involved_in_Opp__c = 'Pharmacy;Vision';
        opp2.Has_a_Formal_RFP_Been_Issued__c = 'No';
        opp2.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
        opp2.Does_this_Oppty_Risk_Involve_Consultant__c ='Yes';
        opp2.Is_There_Existing_Membership_at_Risk__c  = 'No';        
        opp2.StageName='Qualification';
        opp2.CloseDate=System.today();
        opp2.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
        opp2.Expected_Date_of_RFP__c = System.today();
        oppList.add(opp2);
        
        Opportunity opp3 =  new Opportunity();
        opp3.AccountId = accCM.Id;
        opp3.Name = 'Test Opp 7777';
        opp3.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp3.EffectiveDate__c = System.today();
        opp3.Product_Type_Involved_in_Opp__c = 'Dental;Vision';
        opp3.Has_a_Formal_RFP_Been_Issued__c = 'No';
        opp3.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
        opp3.Does_this_Oppty_Risk_Involve_Consultant__c ='';
        opp3.Is_There_Existing_Membership_at_Risk__c  = 'No';        
        opp3.StageName = 'Qualification';
        opp3.CloseDate = System.today();
        opp3.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
        opp3.Expected_Date_of_RFP__c = System.today();
        oppList.add(opp3);
        
        insert oppList;
        
        List<OpportunityContactRole> oppConRoleList = new List<OpportunityContactRole>();
        OpportunityContactRole oppConRole3 = new OpportunityContactRole();
        oppConRole3.ContactId = con1.Id;
        oppConRole3.OpportunityId = oppList[1].Id;      
        oppConRoleList.add(oppConRole3);

		OpportunityContactRole oppConRole4 = new OpportunityContactRole();
        oppConRole4.ContactId = con.Id;
        oppConRole4.OpportunityId = oppList[1].Id;     
        oppConRoleList.add(oppConRole4);       
        
        OpportunityContactRole oppConRole5 = new OpportunityContactRole();
        oppConRole5.ContactId = con.Id;
        oppConRole5.OpportunityId = oppList[2].Id;     
        oppConRoleList.add(oppConRole5);
        
        OpportunityContactRole oppConRole6 = new OpportunityContactRole();
        oppConRole6.ContactId = con1.Id;
        oppConRole6.OpportunityId = oppList[3].Id;     
        oppConRoleList.add(oppConRole6);
        
        insert oppConRoleList;
        Test.startTest();
        CM_MAConsultants_Batch cmMaConsultant = new CM_MAConsultants_Batch();
        Database.executeBatch(cmMaConsultant);
        Test.stopTest();
    }    
    
}