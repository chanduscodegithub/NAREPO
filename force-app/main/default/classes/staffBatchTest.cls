@istest
public class staffBatchTest {
    
    @testSetup
    static void setupData() {
        // Create record types for Staff_Assignment__c if they don't exist
        Id specialProjectId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('Special Project').getRecordTypeId();
        Id ipmAssignmentId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('IPM Assignment').getRecordTypeId();
        Id ipmSTaffId = Schema.SObjectType.Staff__c.getRecordTypeInfosByName().get('IPM Staff').getRecordTypeId();
        
        Profile pf= [Select Id from profile where Name='IPM Advanced Profile'];      //System Administrator
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
       
        
        // Insert test Staff__c records
        List<Staff__c> staffList = new List<Staff__c>();
         Staff__c s =new Staff__c();
        s.Staff_Name__c=uu.id; 
        s.Primary_Role__c = 'Implementation Project Manager';
        s.RecordTypeId = ipmSTaffId;
        staffList.add(s);
        insert staffList;
        
        // Insert test Staff_Assignment__c records with special project and IPM assignment record types
        List<Staff_Assignment__c> assignments = new List<Staff_Assignment__c>();
        for (Staff__c staff : staffList) {
            assignments.add(new Staff_Assignment__c(
                Staffing_Assignment__c = staff.Id,
                RecordTypeId = specialProjectId,
                Hours_Of_Complexity_Backend__c = 10,
                Role_on_Case__c = 'Implementation Project Manager'
            ));
            assignments.add(new Staff_Assignment__c(
                Staffing_Assignment__c = staff.Id,
                RecordTypeId = ipmAssignmentId,
                Hours_Of_Complexity_Backend__c = 5,
                Role_on_Case__c = 'Implementation Project Manager'
            ));
        }
        insert assignments;
    }
    
    @isTest
    static void testBatchExecution() {
        // Run the batch
        Test.startTest();
        staffBatch batch = new staffBatch();
        Database.executeBatch(batch);
        Test.stopTest();
        
        // Verify that Staff__c records were updated with aggregated values
        /*for (Staff__c staff : [SELECT Id, Hours_Of_Complexity_Backend__c, IPM_BOB_Case_FTE__c FROM Staff__c]) {
            System.assertEquals(15, staff.Hours_Of_Complexity_Backend__c, 'Total Hours Complexity should be aggregated correctly');
            System.assertEquals(2.5, staff.IPM_BOB_Case_FTE__c, 'Total Case FTE should be aggregated correctly');
        }*/
    }

}