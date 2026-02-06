/**
* Purpose     : Test class for StaffDuplicateCheck
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      JNANESH AVARADI         	Oct 2020     Initial Class
*==============================================================================
*/

@isTest
private class StaffDuplicateCheck_Test {
   
    @isTest
    static void setupTestData(){       
 
        test.startTest();
        Map<Id,Policy_Information__c> policyMap = new Map<Id,Policy_Information__c>();
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
        
        Staff__c s =new Staff__c();
        s.Staff_Name__c=uu.id; 
        insert s;
        
        try{
            Staff__c s1 =new Staff__c();
            s1.Staff_Name__c=uu.id; 
            insert s1;
        }catch(Exception e){
            System.Assert(e.getMessage().contains('Duplicate Staff Found. Use Existing Staff.'));
        }
        test.stopTest();
    }
}