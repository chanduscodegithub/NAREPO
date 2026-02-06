@isTest
public class CTM_Deletion_Log_Test {

    @testSetup
    static void testSetup(){
        
        Profile pf= [Select Id from profile where Name='System Administrator'];     
        String orgId=UserInfo.getOrganizationId(); 
        String dateString=String.valueof(Datetime.now()).replace(' ','').replace(':','').replace('-','') ;
        Integer RandomId=Integer.valueOf(Math.rint(Math.random()*1000000)); 
        String uniqueName=orgId+dateString+RandomId; 
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
        
        Account account1 = new Account();
        account1.Name = 'Equity Healthcare';
        account1.Subtype__c ='Collaborative Ventures Group (CVG)';
        account1.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        insert account1;
        
        AccountTeamMember atm = new AccountTeamMember();
        atm.AccountId = account1.Id;
        atm.AccountAccessLevel = 'READ';
        atm.ContactAccessLevel = 'READ';
        atm.CaseAccessLevel = 'READ';
        atm.OpportunityAccessLevel = 'READ';
        atm.TeamMemberRole = 'Account Manager';
        atm.UserId = uu.Id;
        insert atm;
    }
    
    @isTest
    static void test1(){
        AccountTeamMember[] atmList = [SELECT Id FROM AccountTeamMember];
        system.assertEquals(1, atmList.size());
        delete atmList;
    }
}