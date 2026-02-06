@isTest
public class AccountTeamMemberDeletionTest{

       public static testmethod void testopportunity() 
	   {

            Account acc = new Account();
            acc.Name = 'testAccount';
            acc.Subtype__c ='Prospect';
            acc.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
            insert acc;
 
            AccountTeamMember accTeamRec=new AccountTeamMember(AccountId=acc.id,UserId=UserInfo.getUserId());             
            insert accTeamRec;
			
			
            Test.startTest();							
            delete accTeamRec;
            Test.stopTest();

       }

}