@isTest
private class AutocreatedRegHandlerTest {

    private static Auth.UserData createUserData() {
        String jsonString = '{"username": "testuser", "email": "test@example.com", "firstName": "Test", "lastName": "User"}';
        return (Auth.UserData) System.JSON.deserialize(jsonString, Auth.UserData.class);
    }
    
    private static Auth.UserData createUserData1(String username, String email, String firstName, String lastName) {
        String jsonString = '{"username": "' + username + '", "email": "' + email + '", "firstName": "' + firstName + '", "lastName": "' + lastName + '"}';
        return (Auth.UserData) System.JSON.deserialize(jsonString, Auth.UserData.class);
    }

    @isTest
    static void testCanCreateUserFalse() {
        Auth.UserData data = createUserData();

        AutocreatedRegHandler1541150443895 handler = new AutocreatedRegHandler1541150443895();

        Boolean result = handler.canCreateUser(data);
    }

    @isTest
    static void testCreateUserBlocked() {
        Auth.UserData data = createUserData();

        AutocreatedRegHandler1541150443895 handler = new AutocreatedRegHandler1541150443895();

        User user = handler.createUser(UserInfo.getUserId(), data);
    }
    
    
    
    @isTest
    static void testCreateUser_AllPaths() {
        Auth.UserData data = createUserData1('verylongusername123', 'user@example.com', 'Long', 'Name');
        AutocreatedRegHandler1541150443895 handler = new AutocreatedRegHandler1541150443895(); 

        Test.startTest();
        User u = handler.createUser(UserInfo.getUserId(), data);
        Test.stopTest();

    }

    @isTest
    static void testUpdateUser() {
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        User u = new User(
            username = 'originaluser@test.com',
            email = 'oldemail@crmit.com',
            lastName = 'Old',
            firstName = 'User',
            alias = 'oldalias',
            timeZoneSidKey = 'America/Los_Angeles',
            localeSidKey = 'en_US',
            emailEncodingKey = 'UTF-8',
            languageLocaleKey = 'en_US',Position__c = 'Test User',
            profileId = p.Id
        );
        insert u;
        Auth.UserData newData = createUserData1('newalias', 'newemail@crmit.com', 'NewFirst', 'NewLast');

        AutocreatedRegHandler1541150443895 handler = new AutocreatedRegHandler1541150443895();
        Test.startTest();
        handler.updateUser(u.Id, UserInfo.getUserId(), newData);
        Test.stopTest();

    }
    
}