/* ####################################################################################
* @author       Sudarshan Reddy
* @date         10/01/2018
* @description  Test Class for MA_MATeamRecreationFieldUpdate Trigger        
*##########################################################################################    */
@isTest
public class MA_MATeamRecreationFieldUpdateTest {
    
    @isTest
    public static void updateMATeamRecreationFieldtestMethod(){
        
        User u = new User(
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'System Administrator'].Id, FirstName = 'FirstName',
            LastName = 'LastName', Username = 'puser000@crmit.com' + System.currentTimeMillis(), Position__c = 'Test User',
            Email = 'puser000@crmit.com', CompanyName = 'TEST', Title = 'title', TimeZoneSidKey = 'America/Los_Angeles', 
            Alias = 'alias', EmailEncodingKey = 'UTF-8', LanguageLocaleKey = 'en_US', LocaleSidKey = 'en_US');
        insert u;
        
        Account acc = new Account(Name = 'TestAcct',Subtype__c = 'National Accounts - East',Type ='National Accounts - East',
                                  RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Existing_Client').getRecordTypeId());
        insert acc;
        
        List<Opportunity> oppList = new List<Opportunity>();
        Opportunity opp = new Opportunity(Name = 'test MA', MA_Team_Recreation__c = false, AccountId = acc.Id, StageName = 'Qualification',
                                          CloseDate = system.today(), Does_this_Oppty_Risk_Involve_Exchanges__c = 'Yes', ownerId = UserInfo.getUserId(),
                                          Exchanges_the_Company_is_Looking_At__c = 'Extend Health', Is_the_PEX_Team_Creating_this_Oppty_Risk__c = 'Yes',
                                          RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId());
        oppList.add(opp);
        insert oppList;
        
        OpportunityTeamMember oppteamMem = new OpportunityTeamMember(OpportunityId  = oppList[0].Id, UserId = UserInfo.getUserId());
        insert oppteamMem;
        
        oppList[0].ownerId = u.id;
        update oppList;
        
    }
}