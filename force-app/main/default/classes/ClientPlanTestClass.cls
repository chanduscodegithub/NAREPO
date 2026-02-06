@isTest
public class ClientPlanTestClass {
	
    @testSetup static void createTestData() {
  
        Id cmCSADUserRoleId = [select Id, Name from UserRole where name = 'CM CSAD' limit 1].id;
        Id genExecUserRoleId = [select Id, Name from UserRole where name = 'General Executive' limit 1].id;
        
        Id userProfileId= [select Id, Name from Profile where name = 'Standard User' limit 1].id;
        
        List<user> testUserRecords = new List<user>();
        testUserRecords.add(new user(LastName = 'Test1',FirstName='User1', Alias = 'tUs1', Email = 'test1.user1@crmit.com', Username = 'uhgDevWithoutId1@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = cmCSADUserRoleId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c = 'System User'));
        testUserRecords.add(new user(LastName = 'Test2',FirstName='User2', Alias = 'tUs2', Email = 'test2.user2@crmit.com', Username = 'uhgDevWithoutId2@crmit.com',
                                     ProfileId = userProfileId, TimeZoneSidKey = 'GMT', LanguageLocaleKey = 'en_US', IsActive = true, UserRoleId  = genExecUserRoleId,
                                     EmailEncodingKey = 'UTF-8', LocaleSidKey = 'en_US', Position__c = 'System User'));
        insert testUserRecords;
        
        Account account = new Account();
        account.Name = 'Test CM Account1';
        account.Subtype__c ='Prospect';
        account.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        System.runAs ( testUserRecords[0] ) {
            insert account;
        }
        
        //Code for insertion of Goals Start
        List<Goal__c> goalRecords = new List<Goal__c>();
        Goal__c goalRec = new Goal__c(           
            Goal_Write_In__c = 'Test Write in',
            Sales_Season__c = 'IY 21, 1/1/2022',
            Goal__c = 'Protect / Renew Current Book of Business (Mandatory Goal)',
            Company__c = account.Id
        );
        goalRecords.add(goalRec);
        
        Goal__c goalRec1 = new Goal__c(           
            Goal_Write_In__c = 'Test Goal Write in',
            Sales_Season__c = 'IY 20, 1/1/2021',
            Goal__c = 'Protect / Renew Current Book of Business (Mandatory Goal)',
            Company__c = account.Id
        );
        goalRecords.add(goalRec1);
        
        Goal__c goalRec2 = new Goal__c(           
            Goal_Write_In__c = 'Test Goal Write in',
            Sales_Season__c = 'IY 20, 1/1/2021',
            Goal__c = 'Grow Medical business',
            Company__c = account.Id
        );
        goalRecords.add(goalRec2);
        
        Goal__c goalRec3 = new Goal__c(           
            Goal_Write_In__c = 'Test Goal Write in',
            Sales_Season__c = 'IY 20, 1/1/2021',
            Goal__c = 'Grow Rx business',
            Company__c = account.Id
        );
        goalRecords.add(goalRec3);
        
        System.runAs ( testUserRecords[0] ) {
            insert goalRecords;
        }
        
        //Add strategies
        List<Strategy__c> strategyRecords = new List<Strategy__c>();
        Strategy__c strategyRec = new Strategy__c(
        	Strategy_Write_In__c = 'Strategy Write in 1',
            Strategy__c = 'Offer Trend Guarantee',
            Goal__c = goalRec.Id,
            Action_Steps_PlannedTaken__c = 'Action Steps'
        );
        strategyRecords.add(strategyRec);
        
        Strategy__c strategyRec1 = new Strategy__c(
        	Strategy_Write_In__c = 'Strategy Write in 2',
            Strategy__c = 'Introduce Executive Sponsor',
            Goal__c = goalRec1.Id,
            Action_Steps_PlannedTaken__c = 'Action Steps to be taken'
        );
        strategyRecords.add(strategyRec1);
        
        Strategy__c strategyRe2 = new Strategy__c(
        	Strategy_Write_In__c = 'Strategy Write in 3',
            Strategy__c = 'Offer Trend Guarantee',
            Goal__c = goalRec1.Id,
            Action_Steps_PlannedTaken__c = 'Consider Action Steps '
        );
        strategyRecords.add(strategyRe2);
        
        System.runAs ( testUserRecords[0] ) {
        	insert strategyRecords;
        }                
    }
	
	static testMethod void validateGetClientLevelBusinessPlan() {
    	Goal__c goalRec = [SELECT Id, Sales_Season__c, Company__c FROM Goal__c WHERE Goal__c = 'Protect / Renew Current Book of Business (Mandatory Goal)' AND Sales_Season__c = 'IY 21, 1/1/2022'];
        
        Goal__c goalRec1 = [SELECT Id, Sales_Season__c, Company__c FROM Goal__c WHERE Goal__c = 'Protect / Renew Current Book of Business (Mandatory Goal)' AND Sales_Season__c = 'IY 20, 1/1/2021'];
        
        //List created to add records for goalListTobeDeleted paramter in createOrUpdateClientPlanRecords method
        List<Goal__c> goalsListToDelete = [SELECT Id, Sales_Season__c, Company__c, Goal__c FROM Goal__c WHERE Sales_Season__c = 'IY 20, 1/1/2021'];
        
        //List created to add records for goalListToUpdate paramter in createOrUpdateClientPlanRecords method
        List<Goal__c> goalsRecordsToUpdate = [SELECT Id, Sales_Season__c, Company__c, Goal__c FROM Goal__c WHERE Sales_Season__c = 'IY 20, 1/1/2021' AND Goal__c = 'Grow Rx business'];        
        
        //List created to add records for goalRecordsToBeDeleted paramter in createOrUpdateClientPlanRecords method
        List<Goal__c> goalRecordsToBeDeleted = [SELECT Id, Sales_Season__c, Company__c, Goal__c FROM Goal__c WHERE Goal__c = 'Grow Medical business'];
        
        //List created to add records for strategyListTobeCreated paramter in createOrUpdateClientPlanRecords method
        List<Strategy__c> strategyRecordsToUpdate = [SELECT Id, Strategy_Write_In__c, Strategy__c, Goal__c, Action_Steps_PlannedTaken__c FROM Strategy__c WHERE Goal__c =: goalRec1.Id];
        
        //List created to add records for strategyRecordsToBeDeleted paramter in createOrUpdateClientPlanRecords method
        List<Strategy__c> strategyRecordsToBeDeleted = [Select Id,Name,Strategy__c,Action_Steps_PlannedTaken__c,Strategy_Write_In__c from Strategy__c];
        
        //Adding goals and strategy to list of SObject for delete method
        List<SObject> deleteRecords = [Select Id,Name,Sales_Season__c,Goal__c,Goal_Write_In__c,Company__c,(Select Id,Name,Strategy__c,Action_Steps_PlannedTaken__c,Strategy_Write_In__c from Strategies__r order by CreatedDate) from Goal__c where Company__c=:goalRec.Company__c and Sales_Season__c= 'IY 21, 1/1/2022'];
        
        //Updating Strategy Records where List created to add records for strategyListToUpdate paramter in createOrUpdateClientPlanRecords method
  		List<Strategy__c> strategyRecToUpdate = new List<Strategy__c>();
        for(Strategy__c updateStrategy : strategyRecordsToUpdate) {
            Strategy__c singleStrategyRecord = new Strategy__c();
            singleStrategyRecord.Id = updateStrategy.Id;
            singleStrategyRecord.Action_Steps_PlannedTaken__c = updateStrategy.Action_Steps_PlannedTaken__c;
            singleStrategyRecord.Strategy__c = updateStrategy.Strategy__c;
            //singleStrategyRecord.Goal__c = updateStrategy.Goal__c;
            strategyRecToUpdate.add(singleStrategyRecord);
        }
        
        //Goal Records to insert where List created to add records for goalAndStrategyRecordsToCreate paramter in createOrUpdateClientPlanRecords method
        List<Goal__c> goalsRecordsToInsert = new List<Goal__c>();
        Goal__c goalRec4 = new Goal__c(           
            Goal_Write_In__c = 'Test Goal Insert',
            Sales_Season__c = 'IY 20, 1/1/2021',
            Goal__c = 'Protect / Renew Current Book of Business (Mandatory Goal)',
            Company__c = goalRec.Company__c
        );
        goalsRecordsToInsert.add(goalRec4);
        
        //Insert strategy record for createGoalAndStrategyRecords method
        List<Strategy__c> strategyList = new List<Strategy__c>();
        Strategy__c strategyRec = new Strategy__c(
        			Action_Steps_PlannedTaken__c = 'Insert rec for createGoalAndStrategyRecords method',
        			Goal__c = goalRec1.Id,
        			Strategy__c = 'Drive OON Strategy (OCM/MNRP)',
        			Strategy_Write_In__c = 'Test Strategy insert');
        			strategyList.add(strategyRec);
        
        //Creating map for createGoalAndStrategyRecords method

        List<Strategy__c> strategyListForMap = new List<Strategy__c>();
        Strategy__c strategyRecMap = new Strategy__c(
        			Action_Steps_PlannedTaken__c = 'Insert rec for createGoalAndStrategyRecords method',
        			Goal__c = goalRec1.Id,
        			Strategy__c = 'Drive OON Strategy (OCM/MNRP)',
        			Strategy_Write_In__c = 'Test Strategy insert');
        			strategyListForMap.add(strategyRecMap);
        
        Map<String, List<Strategy__c>> strategyMapRecords = new Map<String, List<Strategy__c>>();
        strategyMapRecords.put('Protect / Renew Current Book of Business (Mandatory Goal)', strategyListForMap);
        
        //List to add Goal Id for createOrUpdateClientPlanRecords 
        List<Id> trackId = new List<Id>();
        for(Goal__c pushId : goalsRecordsToUpdate) {
            trackId.add(pushId.Id);
        }
        
        
        Test.startTest();
        User systemAdmin = [Select Id from User where Username = 'uhgDevWithoutId1@crmit.com' LIMIT 1]; 
        System.runAs(systemAdmin) {
            /* Test method to call onLoad method */
            ClientLevelBusinessPlanController.getClientLevelBusinessPlan(goalRec.Company__c, goalRec.Sales_Season__c);
            ClientLevelBusinessPlanController.getClientLevelBusinessPlan(goalRec.Company__c, '');
            ClientLevelBusinessPlanController.copyPreviousSalesSeasonData(goalRec.Company__c, 'IY 20, 1/1/2021', goalRec.Sales_Season__c);
            ClientLevelBusinessPlanController.getselectOptions('Goal__c','Sales_Season__c');
            ClientLevelBusinessPlanController.getTemplateInXML(goalRec.Company__c, 'IY 21, 1/1/2022');
            ClientLevelBusinessPlanController.deleteGoalStrategyRecords(deleteRecords);
            ClientLevelBusinessPlanController.createGoalAndStrategyRecords(goalsRecordsToInsert,'IY 20, 1/1/2021',strategyList);
            ClientLevelBusinessPlanController.createOrUpdateClientPlanRecords(goalsListToDelete,goalsRecordsToUpdate, strategyRecToUpdate,goalsRecordsToInsert,strategyRecordsToUpdate,goalRec.Company__c,'IY 21, 1/1/2022',strategyRecordsToBeDeleted,goalRecordsToBeDeleted,goalsRecordsToInsert, strategyMapRecords, trackId);
            ClientLevelBusinessPlanController.fetchPicklist('Goal__c','Sales_Season__c');
        }
        Test.stopTest();
    }    
}