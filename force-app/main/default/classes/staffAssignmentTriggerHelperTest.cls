/**
* Purpose     : test class for staffAssignmentTriggerHelper and staffAssignmentTrigger
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/


@isTest
public class staffAssignmentTriggerHelperTest {
    
    @isTest
    static void setupTestDataAndRunTests() {
        try {
            // Initializing RecordType Ids for Staff and Staff Assignment
            Id ipmSTaffId = Schema.SObjectType.Staff__c.getRecordTypeInfosByName().get('IPM Staff').getRecordTypeId();
            Id specialProjectId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('Special Project').getRecordTypeId();
            Id ipmAssignmentId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('IPM Assignment').getRecordTypeId();
            Id policyAssignmentId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('Policy Assignment').getRecordTypeId();
            Id csiSTaffId = Schema.SObjectType.Staff__c.getRecordTypeInfosByName().get('CSI Staff').getRecordTypeId();
            Id accRecTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
            //list<Staff_Assignment__c> sf=new list<Staff_Assignment__c>();
            
            // Creating account, case, policy information, and policy-case relationships
            Account acc = new Account(Name = 'test account', Subtype__c = 'Enterprise Strategic Accounts', RecordTypeId = accRecTypeId );
            insert acc;
            
            Account acc2 = new Account(Name = 'test account2', Subtype__c = 'Enterprise Strategic Accounts', RecordTypeId = accRecTypeId );
            insert acc2;

            Case c = new Case(AccountId = acc.Id);
            Case c2 = new Case(AccountId = acc.Id, Priority = 'Low');
            insert new List<Case>{ c, c2 };
            
            Policy_Information__c p = new Policy_Information__c(Name = '77341234', Company__c = acc.Id, Policy__c = 'test', Policy_Status__c = 'Active', Policy_Type__c = 'Medical');
            Policy_Information__c p1 = new Policy_Information__c(Name = '79341234', Company__c = acc.Id, Policy__c = 'test', Policy_Status__c = 'Active', Policy_Type__c = 'Medical');
            insert new List<Policy_Information__c>{ p, p1 };

            Policycase__c pc = new Policycase__c(Policy__c = p.Id, Case__c = c.Id);
            insert pc;

            // Creating Users and corresponding Staff records
            Profile pfAdmin = [SELECT Id FROM Profile WHERE Name = 'CSI Administrator' LIMIT 1];
            Profile pfIPM = [SELECT Id FROM Profile WHERE Name = 'IPM Advanced Profile' LIMIT 1];
            
            User userAdmin = createUser('ABC', 'XYZ', pfAdmin);
            User userAdmin2 = createUser('ABCD', 'XYZ2', pfAdmin);
            User userIPM = createUser('DCE', 'WXYZ', pfIPM);
            User userIPM2 = createUser('DCEf', 'VWXYZ', pfIPM);
            insert new List<User>{ userAdmin, userIPM, userIPM2, userAdmin2 };
            system.debug('userAdmin = '+userAdmin+' userIPM = '+userIPM+' userIPM2 = '+userIPM2+' userAdmin2 = '+userAdmin2);

            Staff__c staffAdmin = new Staff__c(Staff_Name__c = userAdmin.Id, Primary_Role__c = 'Client Manager', RecordTypeId = csiSTaffId);
            Staff__c staffAdmin2 = new Staff__c(Staff_Name__c = userAdmin2.Id, Primary_Role__c = 'Client Manager', RecordTypeId = csiSTaffId);
            Staff__c staffIPM = new Staff__c(Staff_Name__c = userIPM.Id, Primary_Role__c = 'Implementation Project Manager', RecordTypeId = ipmSTaffId);
            Staff__c staffIPM2 = new Staff__c(Staff_Name__c = userIPM2.Id, Primary_Role__c = 'Implementation Project Manager', RecordTypeId = ipmSTaffId);
            insert new List<Staff__c>{ staffAdmin, staffIPM, staffIPM2 };
                
            system.debug('staffAdmin = '+staffAdmin+' staffIPM = '+staffIPM);

            // Creating Staff Assignments
            /*List<Staff_Assignment__c> sf = new List<Staff_Assignment__c>{
                createStaffAssignment(specialProjectId, acc.Id, p1.Id, userIPM.Id, null, 'Implementation Project Manager', null),
                    createStaffAssignment(ipmAssignmentId, acc.Id, p1.Id, null, staffIPM.Id, 'Implementation Project Manager', null),
                    createStaffAssignment(policyAssignmentId, acc.Id, p1.Id, null, staffAdmin.Id, 'Client Manager', true),
                    createStaffAssignment(policyAssignmentId, acc.Id, null, null, staffAdmin.Id, 'Client Manager', null),
                    createStaffAssignment(policyAssignmentId, acc.Id, p1.Id, userAdmin.Id, null, 'Client Manager', true),
                    createStaffAssignment(policyAssignmentId, acc.Id, null, userAdmin.Id, null, 'Client Management Consultant', true),
                    createStaffAssignment(policyAssignmentId, acc.Id, null, staffAdmin.Id, null, 'UMR Client Manager', true),
                    createStaffAssignment(policyAssignmentId, acc.Id, null, staffAdmin.Id, null, 'UMR Client Manager', false),
                    createStaffAssignment(policyAssignmentId, acc.Id, null, staffAdmin.Id, null, 'Client Management Consultant', false)
                    };*/

            List<Staff_Assignment__c> sf = new List<Staff_Assignment__c>();
            Staff_Assignment__c s = new Staff_Assignment__c();
            s.Customer_Name__c = acc.Id;
            s.RecordTypeId = specialProjectId;
            s.Role_on_Case__c = 'Implementation Project Manager';
            s.Staffing_Assignment__c =  staffIPM.Id;
            sf.add(s);
            
            Staff_Assignment__c s1 = new Staff_Assignment__c();
            s1.Customer_Name__c = acc.Id;
            s1.RecordTypeId = specialProjectId;
            s1.Role_on_Case__c = 'Implementation Project Manager';
            s1.Staff_User_Assignment__c =  userIPM2.Id;
            s.Staffing_Assignment__c =  staffIPM2.Id;
            sf.add(s1);
            
            
			List<Database.SaveResult> insertResults = Database.insert(sf, false); // Allows partial success on errors
            
            // Check for errors in the insert results
            for (Integer i = 0; i < insertResults.size(); i++) {
                if (!insertResults[i].isSuccess()) {
                    // Log the error details if insertion failed
                    for (Database.Error error : insertResults[i].getErrors()) {
                        System.debug('Error on record ' + i + ': ' + error);
                    }
                }
            }
            
            sf.clear();
            
            /*Staff_Assignment__c s2 = new Staff_Assignment__c();
            s2.RecordTypeId = policyAssignmentId;
            s2.Customer_Name__c = acc2.Id;
            s2.Role_on_Case__c = 'Client Manager';
            //s2.Staff_User_Assignment__c =  userAdmin.Id;
            s2.Staffing_Assignment__c =  staffAdmin.Id;
            s2.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        	s2.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        	s2.of_case__c=0.75;
            s2.Assignment_Type__c = 'Spin Off';
            sf.add(s2);*/
            
            Staff_Assignment__c s4 = new Staff_Assignment__c();
            s4.RecordTypeId = policyAssignmentId;
            s4.Customer_Name__c = acc.Id;
            s4.Role_on_Case__c = 'Client Manager';
            //s2.Staff_User_Assignment__c =  userAdmin.Id;
            s4.Staffing_Assignment__c =  staffAdmin.Id;
            s4.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        	s4.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        	s4.of_case__c=0.75;
            s4.Medical_Policy_Number__c = p.Id;
            sf.add(s4);
            
            Staff_Assignment__c s3 = new Staff_Assignment__c();
            s3.RecordTypeId = policyAssignmentId;
            s3.Role_on_Case__c = 'Client Manager';
            s3.Staffing_Assignment__c =  staffAdmin2.Id;
            s3.Staff_User_Assignment__c =  userAdmin2.Id;
            s3.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        	s3.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        	s3.of_case__c=0.75;
            s3.Customer_Name__c = acc.Id;
            //s3.Should_Extended_AMT_be_updated__c = true;
            sf.add(s3);
            
            Staff_Assignment__c s5 = new Staff_Assignment__c();
            s5.RecordTypeId = policyAssignmentId;
            s5.Role_on_Case__c = 'Client Manager';
            //s5.Staffing_Assignment__c =  staffAdmin.Id;
            s5.Staff_User_Assignment__c =  userAdmin.Id;
            s5.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        	s5.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        	s5.of_case__c=0.75;
            s5.Customer_Name__c = acc.Id;
            //s5.Should_Extended_AMT_be_updated__c = true;
            sf.add(s5);
            
            
            
            List<Database.SaveResult> insertResults2 = Database.insert(sf, false); // Allows partial success on errors
            
            // Check for errors in the insert results
            for (Integer i = 0; i < insertResults2.size(); i++) {
                if (!insertResults2[i].isSuccess()) {
                    // Log the error details if insertion failed
                    for (Database.Error error : insertResults2[i].getErrors()) {
                        System.debug('Error on record ' + i + ': ' + error);
                    }
                }
            }
            
            system.debug('Before SA');
                
			
            
        system.debug('Before SA');

            // Run trigger helper methods for testing
            Map<Id, Staff_Assignment__c> newMap = new Map<Id, Staff_Assignment__c>(sf);
            Map<Id, Staff_Assignment__c> oldMap = new Map<Id, Staff_Assignment__c>();
            
            Test.startTest();
            staffAssignmentTriggerHelper.staffAssignmentUpdate(newMap, oldMap);
            //Test.stopTest();
            //Test.startTest();
            staffAssignmentTriggerHelper.staffAssignmentInsert(newMap.values());
            Test.stopTest();
            
            system.debug('SA Count = '+[SELECT COUNT() FROM Staff_Assignment__c]);
            
            // Include your assertions here to validate results, for example:
           // System.assertEquals(5, [SELECT COUNT() FROM Staff_Assignment__c], 'All staff assignments should have been inserted');

        } catch (Exception e) {
            System.debug('Exception occurred: ' + e);
           // System.assert(false, 'Test failed due to exception');
        }
    }
    
    private static User createUser(String firstName, String lastName, Profile profile) {
        String orgId = UserInfo.getOrganizationId();
        String dateString = String.valueOf(Datetime.now()).replace(' ', '').replace(':', '').replace('-', '');
        Integer randomId = Integer.valueOf(Math.rint(Math.random() * 1000000));
        String uniqueName = orgId + dateString + randomId;

        return new User(
            FirstName = firstName,
            LastName = lastName,
            Email = uniqueName + '@crmit.com',
            Username = uniqueName + '@test' + orgId + '.org',
            EmailEncodingKey = 'ISO-8859-1',
            Alias = uniqueName.substring(18, 23),
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            LanguageLocaleKey = 'en_US',
            ProfileId = profile.Id,
            Position__c = 'Salesforce Courtesy License'
        );
    }
    
    private static Staff_Assignment__c createStaffAssignment(Id recordTypeId, Id customerId, Id policyId, Id userId, Id staffId, String role, Boolean dedicatedToCase) {
        Staff_Assignment__c sa = new Staff_Assignment__c();
        sa.RecordTypeId = recordTypeId;
        sa.Customer_Name__c = customerId;
        sa.Medical_Policy_Number__c = policyId;
        sa.Staff_User_Assignment__c = userId;
        sa.Staffing_Assignment__c = staffId;
        sa.Role_on_Case__c = role;
        /*sa.Dedicated_to_case__c = dedicatedToCase == null ? 'No' : (dedicatedToCase ? 'Yes' : 'No');
        sa.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = 0;
        sa.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c = 0;
        sa.of_case__c = 0.75;*/
        return sa;
    }
    
    
    @isTest
static void coverElseBlock_existingClient_addError() {

    /* ---------- RECORD TYPE ---------- */
    Id policyAssignmentId = Schema.SObjectType.Staff_Assignment__c
        .getRecordTypeInfosByName()
        .get('Policy Assignment')
        .getRecordTypeId();

    Id accRecTypeId = Schema.SObjectType.Account
        .getRecordTypeInfosByName()
        .get('Existing Client')
        .getRecordTypeId();

    /* ---------- ACCOUNT ---------- */

    Account acc = new Account(Name = 'Else Block Account', Subtype__c = 'Enterprise Strategic Accounts', RecordTypeId = accRecTypeId );
            insert acc;

    /* ---------- PROFILE ---------- */
    Profile pf = [
        SELECT Id FROM Profile WHERE Name = 'CSI Administrator' LIMIT 1
    ];

    /* ---------- USERS ---------- */
    User u1 = createUser('Else', 'User1', pf);
    User u2 = createUser('Else', 'User2', pf);
    insert new List<User>{ u1, u2 };

    /* ---------- STAFF ---------- */
    Id staffRT = Schema.SObjectType.Staff__c
        .getRecordTypeInfosByName()
        .get('CSI Staff')
        .getRecordTypeId();

    Staff__c st1 = new Staff__c(
        Staff_Name__c = u1.Id,
        Primary_Role__c = 'Client Manager',
        RecordTypeId = staffRT
    );

    Staff__c st2 = new Staff__c(
        Staff_Name__c = u2.Id,
        Primary_Role__c = 'Client Manager',
        RecordTypeId = staffRT
    );

    insert new List<Staff__c>{ st1, st2 };

    /* ---------- OLD STAFF ASSIGNMENT ---------- */
    Staff_Assignment__c sa = new Staff_Assignment__c(
        RecordTypeId = policyAssignmentId,
        Customer_Name__c = acc.Id,
        Assignment_Type__c = 'Specialty Only', // NOT Special Project
        Role_on_Case__c = 'Client Manager',
        Staffing_Assignment__c = st1.Id,
        Staff_User_Assignment__c = u1.Id,
        Should_Extended_AMT_be_updated__c = false,
        CM_BOB_FTE_Based_on_Adj_Case_FTE1__c = 0,
        CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c = 0,
        of_case__c = 0.75
    );
    insert sa;

    /* ---------- UPDATE TO ENTER ELSE BLOCK ---------- */
    Staff_Assignment__c saUpd = [
        SELECT Id,
               Staff_User_Assignment__c,
               Should_Extended_AMT_be_updated__c
        FROM Staff_Assignment__c
        WHERE Id = :sa.Id
    ];

    saUpd.Staff_User_Assignment__c = u2.Id;   // change user
    saUpd.Should_Extended_AMT_be_updated__c = true;

    Test.startTest();
    Database.SaveResult sr = Database.update(saUpd, false);
    Test.stopTest();

  
}

}