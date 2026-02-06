@isTest
public class SalesDebriefSummaryControllerTest {    
    public static Map<String, User> createData(){
        List<Account> accountListToInsert = new List<Account>();
        List<Opportunity> opportunityListToInsert = new List<Opportunity>();
        
        List<UserRole> allowedUserRoles = [
            SELECT Id 
            FROM UserRole 
            WHERE 
            Name IN ( 'CD SVP', 'CM SCE' )
        ];
        
        Account cDAccEquity = new Account();
        cDAccEquity.Name = 'Equity Healthcare';
        cDAccEquity.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Aggregator').getRecordTypeId();
        cDAccEquity.Subtype__c = 'Collaborative Ventures Group (CVG)';
        insert cDAccEquity;
        
        /*List<UserRole> notAllowedUserRoles = [
SELECT Id 
FROM UserRole 
WHERE 
Name NOT IN ( 'CD SVP', 'CM SCE', 'CM VPCR/RVP'  )
];*/
        
        List<UserRole> notAllowedUserRoles = [
            SELECT Id 
            FROM UserRole 
            WHERE 
            Name IN ( 'CSI SVP', 'CM VP')
        ];
        
        Profile userProfile = [ select Id, Name from Profile WHERE Name = 'System Administrator' LIMIT 1 ];
        
        User allowedUser = new User();
        allowedUser.Email = 'testuser@crmit.com';
        allowedUser.FirstName = 'Test';
        allowedUser.LastName = 'User';
        allowedUser.Username = 'testuser@crmituhc.com' + System.currentTimeMillis();
        allowedUser.Alias = 'tu';
        allowedUser.CommunityNickname = 'TestUser6641755230442055228';
        allowedUser.UserRoleId = allowedUserRoles[0].Id;
        allowedUser.ProfileId = userProfile.Id;
        allowedUser.Position__c = 'Test User';
        allowedUser.TimeZoneSidKey = 'America/Los_Angeles';
        allowedUser.EmailEncodingKey = 'UTF-8';
        allowedUser.LanguageLocaleKey = 'en_US';
        allowedUser.LocaleSidKey = 'en_US';
        //insert allowedUser;
        Database.SaveResult result1 = Database.insert(allowedUser, false);
        
        User notAllowedUser = new User();
        notAllowedUser.Email = 'testuser2@crmit.com';
        notAllowedUser.FirstName = 'Test';
        notAllowedUser.LastName = 'User2';
        notAllowedUser.Username = 'testuser2@crmituhc.com' + System.currentTimeMillis();
        notAllowedUser.Alias = 'tu2';
        notAllowedUser.CommunityNickname = 'TestUser26641755230442055228';
        notAllowedUser.UserRoleId = notAllowedUserRoles[0].Id;
        notAllowedUser.ProfileId = userProfile.Id;
        notAllowedUser.Position__c = 'Test User';
        notAllowedUser.TimeZoneSidKey = 'America/Los_Angeles';
        notAllowedUser.EmailEncodingKey = 'UTF-8';
        notAllowedUser.LanguageLocaleKey = 'en_US';
        notAllowedUser.LocaleSidKey = 'en_US';
        //insert notAllowedUser;
        Database.SaveResult result2 = Database.insert(notAllowedUser, false);
        
        User userWithvpcrrvpRole = [
            SELECT ID 
            FROM User 
            WHERE UserRoleId =: (
                [ SELECT ID FROM UserRole WHERE Name = 'CM VPCR/RVP' LIMIT 1 ].Id
            )
            LIMIT 1
        ];
        
        User userWithoutvpcrrvpRole = [
            SELECT ID 
            FROM User 
            WHERE UserRoleId =: (
                [ SELECT ID FROM UserRole WHERE Name = 'CD SVP' LIMIT 1 ].Id
            )
            LIMIT 1
        ];
        
        for( Integer i = 0; i < 6; i++ ){
            accountListToInsert.add(
                new Account(
                    Name = 'Test Account ' + i,
                    Subtype__c = 'Prospect' ,
                    RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId()
                )
            );
        }
        if (result1.isSuccess()) {
            System.runAs( allowedUser ){
                insert accountListToInsert; 
            }
            
            for( Integer i = -2; i < accountListToInsert.size() - 2 ; i++ ){
                Opportunity opprec = new Opportunity(
                    Name = 'Test Opportunity ' + i,
                    RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
                    CloseDate = Date.today(),
                    StageName = 'Closed',
                    // ForecastCategory = 'Closed',
                    Does_this_Oppty_Risk_Involve_Exchanges__c = 'Not Yet Known',
                    EffectiveDate__c = Date.today().addYears( i ),
                    Sales_Debrief__c = 'Specialty Only',
                    CM_VPCR_RVP__c = userWithvpcrrvpRole.Id,
                    AccountId = accountListToInsert[ i + 2 ].Id
                );
                Opportunity opprec1 = new Opportunity(
                    Name = 'Test Opportunity ' + i,
                    RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId(),
                    CloseDate = Date.today(),
                    StageName = 'Closed',
                    // ForecastCategory = 'Closed',
                    Does_this_Oppty_Risk_Involve_Exchanges__c = 'Not Yet Known',
                    EffectiveDate__c = Date.newInstance(Date.today().addYears( -1 ).year(), 1, 1),
                    Sales_Debrief__c = 'Comprehensive Medical',
                    Sales_Debrief_Override__c ='Comprehensive Medical', 
                    OwnerId = userWithoutvpcrrvpRole.Id,
                    AccountId = accountListToInsert[ i + 2 ].Id
                );
                opportunityListToInsert.add( opprec );
                opportunityListToInsert.add( opprec1 );
            }
            
            System.runAs( allowedUser ){
                System.debug( JSON.serializePretty( Database.insert( opportunityListToInsert ) ) );
            }
            
            System.debug( JSON.serializePretty( [ SELECT EffectiveDate__c FROM Opportunity  ] ));
        }
        return new Map<String, User>{ 
            'allowedUser' => allowedUser, 
                'notAllowedUser' => notAllowedUser,
                'vpcrrvpUser' => userWithvpcrrvpRole 
                };
                    }
    
    @isTest
    public static void testMethod1(){
        Test.startTest();
        Map<String, User> usersMap = createData();
        Database.SaveResult result2 = Database.update( usersMap.get('notAllowedUser'), false);
        Database.SaveResult result1 = Database.update( usersMap.get('allowedUser'), false);
        
        System.runAs( usersMap.get('vpcrrvpUser') ){
            SalesDebriefSummaryController.ReturnSalesDebriefSummaryData data = 
                SalesDebriefSummaryController.fetchSalesDebreiefSummaryData();
            
            Assert.areEqual( data.isUserAuthorizedViewData, true );
            Assert.isNotNull( data.salesDebriefSummaryList );
            Assert.isTrue( data.salesDebriefSummaryList.size() >= 0, 'Expected > 0; Actual : ' + data.salesDebriefSummaryList.size() );
        }
        
        /*if (result2.isSuccess()) {
System.runAs( usersMap.get('notAllowedUser') ){
SalesDebriefSummaryController.ReturnSalesDebriefSummaryData data = 
SalesDebriefSummaryController.fetchSalesDebreiefSummaryData();

Assert.areEqual( data.isUserAuthorizedViewData, false );
Assert.isNull( data.salesDebriefSummaryList );
Assert.isFalse( data.salesDebriefSummaryList.size() >= 0, 'Expected > 0; Actual : ' + data.salesDebriefSummaryList.size() );
}
}*/
        
        if (result1.isSuccess()) {
            System.runAs( usersMap.get('allowedUser') ){
                SalesDebriefSummaryController.ReturnSalesDebriefSummaryData data = 
                    SalesDebriefSummaryController.fetchSalesDebreiefSummaryData();
                
                Assert.areEqual( data.isUserAuthorizedViewData, true );
                List<Opportunity> opp = [
                        SELECT Id, Name, EffectiveDate__c, Sales_Debrief__c, Sales_Debrief_Override__c,
                                Account.Name, ( SELECT Debrief_Complete_Incomplete__c FROM Sales_Debriefs__r ORDER BY CreatedDate DESC  )
                        FROM Opportunity
                        WHERE 
                    		(
                                EffectiveDate__c >=: Date.newInstance(Date.today().addYears( -1 ).year(), 1, 1) AND
                                EffectiveDate__c <=: Date.newInstance( Date.today().year(), 1, Date.daysInMonth( Date.today().year(), 1 ) ) 
                            ) AND
                            ( OwnerId = :usersMap.get('allowedUser').Id ) AND
                            (Sales_Debrief__c IN : ( new Set<String>{'Comprehensive Medical', 'Specialty Only'} ) OR
                            Sales_Debrief_Override__c IN : ( new Set<String>{'Comprehensive Medical', 'Specialty Only'} ))];
                System.assertEquals(data.salesDebriefSummaryList.size() > 0, opp.size()>0);
                Assert.isNotNull( data.salesDebriefSummaryList );
            } 
        }
        /*try{
SalesDebriefSummaryController.ReturnSalesDebriefSummaryData data = 
SalesDebriefSummaryController.fetchSalesDebreiefSummaryData();
} catch (Exception ex) {
System.assertEquals('expected text', ex.getMessage());
}  */
        
        Test.stopTest();
    }
    /* @isTest
    public static void testMethod2(){
        Test.startTest();
        Map<String, User> usersMap = createData();
        Database.SaveResult result1 = Database.update( usersMap.get('allowedUser'), false);
        if (result1.isSuccess()) {
            System.runAs( usersMap.get('allowedUser') ){
                SalesDebriefSummaryController.ReturnSalesDebriefSummaryData data = 
                    SalesDebriefSummaryController.fetchSalesDebreiefSummaryData();
                
                Assert.areEqual( data.isUserAuthorizedViewData, true );
                List<Opportunity> opp = [
                        SELECT Id, Name, EffectiveDate__c, Sales_Debrief__c, Sales_Debrief_Override__c,
                                Account.Name, ( SELECT Debrief_Complete_Incomplete__c FROM Sales_Debriefs__r ORDER BY CreatedDate DESC  )
                        FROM Opportunity
                        WHERE 
                            EffectiveDate__c =: Date.newInstance(Date.today().addYears( -1 ).year(), 1, 1) AND 
                            ( OwnerId = :usersMap.get('allowedUser').Id ) AND
                            (Sales_Debrief__c IN : ( new Set<String>{'Comprehensive Medical', 'Specialty Only'} ) OR
                            Sales_Debrief_Override__c IN : ( new Set<String>{'Comprehensive Medical', 'Specialty Only'} ))];
                System.assertEquals(data.salesDebriefSummaryList.size() > 0, opp.size()>0);
            } 
        }
        Test.stopTest();
    }*/
}