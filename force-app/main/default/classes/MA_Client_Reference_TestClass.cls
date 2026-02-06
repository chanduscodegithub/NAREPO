@isTest
private class MA_Client_Reference_TestClass {
    @testSetup static void createTestData() {
        
        Account acc = new Account();
        acc.Name = 'testAccount';
        acc.Subtype__c ='Prospect';
        acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert acc;
        
        Opportunity opp =  new Opportunity();
        opp.AccountId=acc.Id;
        opp.Name='Test Opportunity';
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp.Expected_Date_of_RFP__c = system.today();
        opp.StageName = 'Qualification';
        opp.CloseDate=System.today();
        insert opp;
        
        Refferal_Request__c ref = new Refferal_Request__c();
        ref.Name = 'Test1';
        ref.MembershipActivity__c = opp.Id;
        ref.RefCompany__c = acc.Id;
        insert ref;
        
        Refferal_Request__c ref2 = new Refferal_Request__c();
        ref2.Name = 'Test2';
        ref2.MembershipActivity__c = opp.Id;
        ref2.RefCompany__c = acc.Id;
        insert ref2;
        
    }
    
    public testMethod static void ValidateClientReference(){
        test.startTest();
        Id oppId = [Select Id from Opportunity].Id;
        Id accId = [Select Id from Account].Id;
        
        List<Id> accIdList = new List<Id>();
        accIdList.add(accId);
        
        List<Refferal_Request__c> refList = [Select Id from Refferal_Request__c];
        
        MA_Client_Reference_Class.getLoggedInUserRoles();
        MA_Client_Reference_Class.queryReferenceAccounts(oppId,1,'Name','ASC');
        MA_Client_Reference_Class.queryReferenceAccounts(null,null,null,null);
        MA_Client_Reference_Class.getMetadata();
        MA_Client_Reference_Class.getPickListValues();
        MA_Client_Reference_Class.getApplicableforValues();
        MA_Client_Reference_Class.getRefStatusFieldValue();
        MA_Client_Reference_Class.saveRefRecordsParent(refList);
       // MA_Client_Reference_Class.saveRefReqRecord(String.valueOf(refList));
        MA_Client_Reference_Class.RemoveReferenceRequest(refList,oppId,1,'Applicable_for__c','Asc');
        MA_Client_Reference_Class.getPLValues('Industry');
        MA_Client_Reference_Class.getPLValues('Top_Markets__c');
        MA_Client_Reference_Class.addRefAccountsToMA(oppId,accIdList);
        Ma_Client_Reference_Class.searchForRefAccounts('[{"fieldAPIName":"Top_Markets__c#dropdown","fieldConditions":"Equal to#AK-ANCHORAGE"},{"fieldAPIName":"UMR_Client__c#checkbox","fieldConditions":"Is checked#"},{"fieldAPIName":"UMR_Client__c#checkbox","fieldConditions":" Is not checked#"}]', ' OR ',oppId , 1);
        Ma_Client_Reference_Class.searchForRefAccounts('[{"fieldAPIName":"SubType__c#search","fieldConditions":"Contains at least one value#Prospect"},{"fieldAPIName":"Client_Ref_Products_Programs__c#search","fieldConditions":"Contains at least one value#Dental"}]', ' OR ',oppId , 1);
        Ma_Client_Reference_Class.searchForRefAccounts('[{"fieldAPIName":"SubType__c#search","fieldConditions":"Contains at least one value#Prospect"},{"fieldAPIName":"Client_Ref_Products_Programs__c#search","fieldConditions":"Contains at least one value#Dental"}]', ' AND ',oppId , 1);
        Ma_Client_Reference_Class.searchForRefAccounts('[{"fieldAPIName":"ParticipatingUSMembers__c#number","fieldConditions":"Equal to#123"},{"fieldAPIName":"ParticipatingUSMembers__c#number","fieldConditions":" Greater than#12"},{"fieldAPIName":"Original_Effective_Date__c#date","fieldConditions":"Equal to#2018-10-09"},{"fieldAPIName":"Original_Effective_Date__c#date","fieldConditions":" Not equal to#2018-10-09"},{"fieldAPIName":"Original_Effective_Date__c#date","fieldConditions":" On or before#2018-10-10"},{"fieldAPIName":"Original_Effective_Date__c#date","fieldConditions":" On or after#2018-10-17"},{"fieldAPIName":"ParticipatingUSMembers__c#number","fieldConditions":" Less than#13"}]', ' AND ',oppId , 1);
        Ma_Client_Reference_Class.searchForAccountsByCustomLogic('[{"fieldAPIName":"Top_Markets__c#dropdown","fieldConditions":"Equal to#AK-ANCHORAGE"},{"fieldAPIName":"SubType__c#search","fieldConditions":"Contains at least one value#Prospect"}]',oppId,1,'(1 And 2)');
        Ma_Client_Reference_Class.searchForAccountsByCustomLogic('[{"fieldAPIName":"UMR_Client__c#checkbox","fieldConditions":"Is checked#"},{"fieldAPIName":"UMR_Client__c#checkbox","fieldConditions":" Is not checked#"}]',oppId,1,'(1 And 2)');
        Ma_Client_Reference_Class.searchForAccountsByCustomLogic('[{"fieldAPIName":"ParticipatingUSMembers__c#number","fieldConditions":"Equal to#123"},{"fieldAPIName":"ParticipatingUSMembers__c#number","fieldConditions":" Greater than#12"},{"fieldAPIName":"ParticipatingUSMembers__c#number","fieldConditions":" Less than#13"}]',oppId,1,'(1 And 2) OR 3');
        Ma_Client_Reference_Class.searchForAccountsByCustomLogic('[{"fieldAPIName":"Original_Effective_Date__c#date","fieldConditions":"Equal to#2018-10-24"},{"fieldAPIName":"Call_Site__c#search","fieldConditions":"Contains at least one value#San Antonio Public Sector"},{"fieldAPIName":"Call_Site__c#search","fieldConditions":"Contains all values#San Antonio - HA"},{"fieldAPIName":"Original_Effective_Date__c#date","fieldConditions":"Equal to#2018-10-09"},{"fieldAPIName":"Original_Effective_Date__c#date","fieldConditions":" Not equal to#2018-10-09"},{"fieldAPIName":"Original_Effective_Date__c#date","fieldConditions":" On or before#2018-10-11"}]',oppId,1,'(1)OR(3 ANd 4)OR(5 AND 6 AND 7)');
        test.stopTest();
    }
}