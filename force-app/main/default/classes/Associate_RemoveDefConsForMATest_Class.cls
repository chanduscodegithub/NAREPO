@isTest
public class Associate_RemoveDefConsForMATest_Class {
    
	static testMethod void testMethod1() {
        
        Account accCM = new Account();
        accCM.Name = 'Test CM Account 1111';
        accCM.Subtype__c = 'Specialty Benefits Only';
        accCM.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM;
        
        Account accCM1 = new Account();
        accCM1.Name = 'Test CM Account 2222';
        accCM1.Subtype__c = 'Specialty Benefits Only';
        accCM1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accCM1;
        
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
        
        Opportunity opp =  new Opportunity();
        opp.AccountId = accCM.Id;
        opp.Name = 'Test Opp 1111';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.EffectiveDate__c = System.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision';
        opp.Has_a_Formal_RFP_Been_Issued__c = 'No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c = 'No';
        opp.Does_this_Oppty_Risk_Involve_Consultant__c ='No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';        
        opp.StageName='Qualification';
        opp.CloseDate=System.today();
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId();
        opp.Expected_Date_of_RFP__c = System.today();
        insert opp;
        
        Opportunity opp1 =  new Opportunity();
        opp1.AccountId = accCM1.Id;
        opp1.Name = 'Test Opp 2222';
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
        insert opp1;
        
        Opportunity opp2 =  new Opportunity();
        opp2.AccountId = accCM.Id;
        opp2.Name = 'Test Opp 3333';
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
        insert opp2;
        
        OpportunityContactRole oppConRole1 = new OpportunityContactRole();
        oppConRole1.ContactId = con.Id;
        oppConRole1.OpportunityId = opp1.Id;      
        insert oppConRole1;

		OpportunityContactRole oppConRole = new OpportunityContactRole();
        oppConRole.ContactId = con.Id;
        oppConRole.OpportunityId = opp2.Id;     
        insert oppConRole;
        
        Test.startTest();  
        
        Associate_RemoveDefaultConsultantForMA.MyInvocableVariable inputVariable = new Associate_RemoveDefaultConsultantForMA.MyInvocableVariable();
        inputVariable.accId = accCM.Id;
        inputVariable.currVal = 'No';
        inputVariable.isNew = 'True';
        inputVariable.oldVal = 'TBD';
        inputVariable.recId = opp.Id;
        
        Associate_RemoveDefaultConsultantForMA.MyInvocableVariable inputVariable1 = new Associate_RemoveDefaultConsultantForMA.MyInvocableVariable();
        inputVariable1.accId = accCM.Id;
        inputVariable1.currVal = 'No';
        inputVariable1.isNew = 'False';
        inputVariable1.oldVal = 'TBD';
        inputVariable1.recId = opp.Id;
        
        Associate_RemoveDefaultConsultantForMA.MyInvocableVariable inputVariable2 = new Associate_RemoveDefaultConsultantForMA.MyInvocableVariable();
        inputVariable2.accId = accCM1.Id;
        inputVariable2.currVal = 'Yes';
        inputVariable2.isNew = 'False';
        inputVariable2.oldVal = 'No';
        inputVariable2.recId = opp1.Id;
        
        Associate_RemoveDefaultConsultantForMA.MyInvocableVariable inputVariable3 = new Associate_RemoveDefaultConsultantForMA.MyInvocableVariable();
        inputVariable3.accId = accCM.Id;
        inputVariable3.currVal = 'No';
        inputVariable3.isNew = 'False';
        inputVariable3.oldVal = 'Yes';
        inputVariable3.recId = opp2.Id;
        
        List<Associate_RemoveDefaultConsultantForMA.MyInvocableVariable> inputList = new List<Associate_RemoveDefaultConsultantForMA.MyInvocableVariable>();
        inputList.add(inputVariable1);          
        Associate_RemoveDefaultConsultantForMA.associateOrRemoveConsultant(inputList);
        
        List<Associate_RemoveDefaultConsultantForMA.MyInvocableVariable> inputList1 = new List<Associate_RemoveDefaultConsultantForMA.MyInvocableVariable>();
        inputList1.add(inputVariable2);        
        Associate_RemoveDefaultConsultantForMA.associateOrRemoveConsultant(inputList1);
        
        List<Associate_RemoveDefaultConsultantForMA.MyInvocableVariable> inputList2 = new List<Associate_RemoveDefaultConsultantForMA.MyInvocableVariable>();
        inputList2.add(inputVariable3);        
        Associate_RemoveDefaultConsultantForMA.associateOrRemoveConsultant(inputList2);

        Test.stopTest();
    }        
}