/**
* Purpose     : test class for CP_StaffAssignMultiPolicyBatch , CP_StaffAssignSinglePolicyBatch and CapacityPlan_RollupToSaff
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
@isTest
public class CP_StaffAssignSinglePolicyBatchTest {
    @istest
    static void setupTestData(){   
        
        Id ipmSTaffId = Schema.SObjectType.Staff__c.getRecordTypeInfosByName().get('IPM Staff').getRecordTypeId();
        Id specialProjectId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('Special Project').getRecordTypeId();
        Id ipmAssignmentId = Schema.SObjectType.Staff_Assignment__c.getRecordTypeInfosByName().get('IPM Assignment').getRecordTypeId();
        
        Date newDate = Date.today().addDays(-1);
        list<Staff_Assignment__c> sf=new list<Staff_Assignment__c>();
        
        Account acc= new account (); 
        acc.name='test account';
        acc.Subtype__c='Enterprise Strategic Accounts';
        insert acc;
        case c = new case();
        c.accountId=acc.Id;
        insert c;
        system.debug('variable@@@'+c.Priority);
        case c2 = new case();
        c2.accountId=acc.Id;
        c2.Priority='Low';
        insert c2;
        system.debug('variable@@@'+c2.Priority);
        Policy_Information__c p = new Policy_Information__c();
        p.Name='77341234';
        p.Company__c=acc.Id;
        p.Policy__c = 'test';
        p.Policy_Status__c = 'Active';
        p.Policy_Type__c = 'Medical';
        insert p;
        
        
        Policy_Information__c p1 = new Policy_Information__c();
        p1.Name='79341234';
        p1.Company__c=acc.Id;
        p1.Policy__c = 'test';
        p1.Policy_Status__c = 'Active';
        p1.Policy_Type__c = 'Medical';
        insert p1;
        
        Policycase__c pc = new Policycase__c();
        pc.Policy__c=p.Id;
        pc.Case__c=c.Id;
        insert pc;
        
        // Map<id,Staff_Assignment__c> oldmap = new Map<id,Staff_Assignment__c>();
        // Map<id,Staff_Assignment__c> newmap = new Map<id,Staff_Assignment__c>();
        Profile pf= [Select Id from profile where Name='CSI Administrator'];      //System Administrator
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
        Staff__c s =new Staff__c();
        s.Staff_Name__c=uu.id; 
        s.Primary_Role__c = 'Client Manager';
        insert s;    
        
        
        Staff_Assignment__c sa = new Staff_Assignment__c();
        sa.Customer_Name__c= acc.id;
        sa.Medical_Policy_Number__c=p1.Id;
        sa.Staffing_Assignment__c=s.Id;
        sa.Staff_User_Assignment__c=uu.Id;
        sa.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        sa.of_case__c=0.75;
        sa.Role_on_Case__c = 'Client Manager';
        sf.add(sa);
        //insert sa;
        Staff_Assignment__c sa1 = new Staff_Assignment__c();
        sa1.Customer_Name__c= acc.id;
        //sa.Medical_Policy_Number__c=p1.Id;
        sa1.Staffing_Assignment__c=s.Id;
        sa1.Staff_User_Assignment__c=uu.Id;
        sa1.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa1.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        sa1.of_case__c=0.75;
        sa1.Role_on_Case__c = 'Client Manager';
        sf.add(sa1);
        Staff_Assignment__c sa3 = new Staff_Assignment__c();
        sa3.Customer_Name__c= acc.id;
        sa3.Medical_Policy_Number__c=p1.Id;
        sa3.Staffing_Assignment__c=s.Id;
        sa3.Staff_User_Assignment__c=uu.Id;
        sa3.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa3.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        sa3.Dedicated_to_case__c='Yes';
        sa3.of_case__c=0.75;
        sa3.Role_on_Case__c = 'Client Manager';
        sf.add(sa3);
        //insert sa;
        Staff_Assignment__c sa4 = new Staff_Assignment__c();
        sa4.Customer_Name__c= acc.id;
        //sa.Medical_Policy_Number__c=p1.Id;
        sa4.Staffing_Assignment__c=s.Id;
        sa4.Dedicated_to_case__c='Yes';
        sa4.Staff_User_Assignment__c=uu.Id;
        sa4.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa4.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        sa4.of_case__c=0.75;
        sa4.Role_on_Case__c = 'Client Management Consultant';
         //---------------------------------------------------------Varun---------------------------------------------------------
        sa4.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa4.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
         //---------------------------------------------------------Varun---------------------------------------------------------
        sf.add(sa4);
        //---------------------------------------------------------Varun---------------------------------------------------------
        Staff_Assignment__c sa5 = new Staff_Assignment__c();
        sa5.Customer_Name__c= acc.id;
        sa5.Staffing_Assignment__c=s.Id;
        sa5.Dedicated_to_case__c='Yes';
        sa5.Staff_User_Assignment__c=uu.Id;
        sa5.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa5.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        sa5.of_case__c=0.75;
        sa5.Role_on_Case__c = 'UMR Client Manager';
        sa5.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa5.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        sf.add(sa5);
        
        Staff_Assignment__c sa6 = new Staff_Assignment__c();
        sa6.Customer_Name__c= acc.id;
        sa6.Staffing_Assignment__c=s.Id;
        sa6.Dedicated_to_case__c='No';
        sa6.Staff_User_Assignment__c=uu.Id;
        sa6.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa6.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        sa6.of_case__c=0.75;
        sa6.Role_on_Case__c = 'UMR Client Manager';
        sa6.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa6.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        sf.add(sa6);
        
        Staff_Assignment__c sa7 = new Staff_Assignment__c();
        sa7.Customer_Name__c= acc.id;
        sa7.Staffing_Assignment__c=s.Id;
        sa7.Dedicated_to_case__c='No';
        sa7.Staff_User_Assignment__c=uu.Id;
        sa7.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa7.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        sa7.of_case__c=0.75;
        sa7.Role_on_Case__c = 'Client Management Consultant';
        sa7.CM_BOB_FTE_Based_on_Adj_Case_FTE1__c=0;
        sa7.CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c=0;
        sf.add(sa7);
        insert sf;
        //---------------------------------------------------------Varun---------------------------------------------------------
        
        //  Test.startTest();
        
        
        list <Staff_Assignment__c> staffAssignList = [Select Id,of_case__c, Customer_Name__c, Customer_Name__r.Capacity_Plan_Surest_Outlier_Backend__c,Customer_Name__r.Capacity_Plan_SurestAdj_Case_FTE_Backend__c,
                                                      CM_BOB_FTE_Based_on_Adj_Case_FTE1__c,
                                                      CM_BOB_FTE_based_on_Adj_Case_FTE_Outlier__c, 
                                                      Medical_Policy_Number__r.Adj_Case_FTE__c,
                                                      Medical_Policy_Number__r.Adj_Case_FTE_for_Outlierss__c
                                                      From Staff_Assignment__c where Medical_Policy_Number__c != null
                                                      and Customer_Name__c != null];
        system.debug('staffAssignList@@'+staffAssignList);
       id batchid = database.executeBatch(new CP_StaffAssignSinglePolicyBatch());
        
        //Test.stopTest();
        
    }
}