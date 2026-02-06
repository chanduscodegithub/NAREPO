/** ######################################################################################
* @author       Ram Mohan Reddy
* @date         23/02/2018
* @description  Unit Test for CreateCompetitorRecordsForCMAccount class
*
*
*##########################################################################################    */

@IsTest(SeeAllData = false)
public class CreateCompetitorRecordsForCMAccountTest {
	
	@TestSetup
    static void setupTestData()
    {
    	User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        
        System.runAs (thisUser)
        {
        	// Getting Recordtype ID of Contact
            //recordtype accountRT = [SELECT Id, DeveloperName, Name FROM RecordType 
                                 //   WHERE SObjectType = 'Account' 
                                 //   AND Name = 'Existing Client' limit 1]; 

            List<Account> accList = new List<Account>();

            Account cmAccount = new Account(
            		Name = 'Test CM Account',
            		recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(),
            		Subtype__c =' National Accounts - East'

            	);

            accList.add(cmAccount);

            Account cdAccount = new Account(

            		Name ='Test CD Account',
            		recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
            	);
            accList.add(cdAccount);

            Account competitorAccount = new Account(

            		Name ='National Accounts',
            		recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId()
            	);

            accList.add(competitorAccount);


            insert accList;

            Competitor__c competitorRec = new Competitor__c(

            		Account__c=cdAccount.Id,
            		Type__c = 'Account Competitor',
            		Competitorclassification__c='Medical',
            		CompetitorAccount__c=competitorAccount.Id
            	);

            insert competitorRec;

        }
    }

    @IsTest
    static void testMethodOne(){    	     

         User thisUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        
        Boolean isSuccess = true;
        
        System.runAs (thisUser)
        {
            try{

                System.Test.startTest();
                List<Id> accountIdList = new List<Id>();

                Account cmAccount = [select Id  from Account where Name = 'Test CM Account' limit 1];

                accountIdList.add(cmAccount.Id);

                CreateCompetitorRecordsForCMAccount.CreateCompetitorRecords(accountIdList);

               Account cdAccount = [select Id  from Account where Name = 'Test CD Account' limit 1];

               	cdAccount.recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
            	cdAccount.Subtype__c =' National Accounts - East';

            	update cdAccount;

                List<Id> accountCDIdList = new List<Id>();
                accountCDIdList.add(cmAccount.Id);

               CreateCompetitorRecordsForCMAccount.CreateCompetitorRecords(accountIdList);


                System.Test.stopTest();
                }catch(Exception ex){ 

                	isSuccess = false;
                	System.debug('~~Handle_handleIspartner() :: Exception==>'+ex.getMessage());
            }
            System.assert(isSuccess);
        }
    }
}