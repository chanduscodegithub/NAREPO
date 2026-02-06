@isTest
public class RVPTableauInsightsController_Test {

    @testSetup static void testData(){
        UserRole[] userRoleList = new List<UserRole>();
        UserRole obj1=new UserRole(Name= 'CM VPCR/RVP');
        UserRole obj2=new UserRole(Name= 'CM SCE');
        userRoleList.add(obj1);
        userRoleList.add(obj2);
        insert userRoleList;
        
        Profile pf= [Select Id from profile where Name='CM Sales Team Standard Profile - Tableau Insights'];
        String orgId=UserInfo.getOrganizationId(); 
        String dateString=String.valueof(Datetime.now()).replace(' ','').replace(':','').replace('-','');
        Integer RandomId=Integer.valueOf(Math.rint(Math.random()*1000000)); 
        String uniqueName=orgId+dateString+RandomId;
        
        User cmVpcrUser = new User(firstname = 'ABC', 
                                 lastName = 'XYZ', 
                                 email = uniqueName + '@uhg.com', 
                                 Username = uniqueName + '@test' + orgId + '.org', 
                                 EmailEncodingKey = 'ISO-8859-1', 
                                 Alias = uniqueName.substring(18, 23), 
                                 TimeZoneSidKey = 'America/Los_Angeles', 
                                 LocaleSidKey = 'en_US', 
                                 LanguageLocaleKey = 'en_US', 
                                 ProfileId = pf.Id, 
                                 UserRoleId = obj1.Id,
                                 Position__c = 'RVP'
                                ); 
        insert cmVpcrUser;
        
        User abc = [SELECT Id,FirstName FROM User WHERE FirstName = 'ABC' LIMIT 1];
        
        User sce_user = new User(firstname = 'EFG', 
                                 lastName = 'HIJ', 
                                 email = uniqueName + 'sce@uhg.com', 
                                 Username = uniqueName + 'sse@test' + orgId + '.org', 
                                 EmailEncodingKey = 'ISO-8859-1', 
                                 Alias = uniqueName.substring(18, 23), 
                                 TimeZoneSidKey = 'America/Los_Angeles', 
                                 LocaleSidKey = 'en_US', 
                                 LanguageLocaleKey = 'en_US', 
                                 ProfileId = pf.Id, 
                                 UserRoleId = obj2.Id,
                                 SCE_Director__c = true,
                                 Position__c = 'SCE',
                                 ManagerId = abc.Id
                                ); 
        insert sce_user;
    }
    
    @isTest
    static void vpcrRvpTest(){
        User rvp = [SELECT Id,FirstName,LastName,UserRole.Name FROM User WHERE UserRole.Name = 'CM VPCR/RVP' LIMIT 1];
        system.runAs(rvp){
         RVPTableauInsightsController tableau = new RVPTableauInsightsController();   
        }
    }
    @isTest
    static void cmSceTest(){
        User sce = [SELECT Id,FirstName,LastName,UserRole.Name FROM User WHERE UserRole.Name = 'CM SCE' LIMIT 1];
        system.runAs(sce){
         RVPTableauInsightsController tableau2 = new RVPTableauInsightsController();   
        }
    }
}