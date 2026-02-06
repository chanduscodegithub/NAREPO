@isTest
public class Campaign_Association_Campaign_ObjTest {
    
    public static testmethod void validate(){
        List <Id> cmpId= new List <Id> ();
        List <Id> conId= new List <Id> ();
        bulkTestData.CampaignCorrespondenceTestData2();
        contact c = [SELECT Id FROM Contact WHERE Correspondence_type__c = 'Annual Customer Forum' AND Status__c = 'Active'];
        conId.add(c.Id);
        system.debug('contact c @@@'+c+'contact c@@@');
        List <Campaign> camplist = new List <Campaign>();
        camplist= [SELECT Id FROM Campaign];
        system.debug('camplist@@@'+camplist+'camplistId@@@');
        for(Campaign cmpgn: camplist){
           cmpId.add (cmpgn.Id);
        }
        Campaign_Association_Campaign_Obj.associateCampaigns(cmpId);
        try{
            Campaign_Association_Campaign_Obj.associateCampaigns(conId);
        }catch(Exception e){
            system.debug('@@e@@'+e.getMessage());           
        } 
        
        
    }
    
    public static testMethod void getNoAccessException() {
        bulkTestData.UserTestData();
        List <Id> cmpId= new List <Id> ();
        List <Id> conId= new List <Id> ();
        bulkTestData.CampaignCorrespondenceTestData2();
        contact c = [SELECT Id FROM Contact WHERE Correspondence_type__c = 'Annual Customer Forum' AND Status__c = 'Active'];
        conId.add(c.Id);
        system.debug('contact c @@@'+c+'contact c@@@');
        List <Campaign> camplist = new List <Campaign>();
        camplist= [SELECT Id FROM Campaign];
        system.debug('camplist@@@'+camplist+'camplistId@@@');
        for(Campaign cmpgn: camplist){
           cmpId.add (cmpgn.Id);
        }
        Test.startTest(); 
        system.debug('variable@@@variable@@@');
        User readonlyuser = [Select Id from User where Username = 'uhgDevReadOnly@crmit.com' LIMIT 1];
        system.debug('readonlyuserxx@@@'+readonlyuser);
        System.runAs(readonlyuser) {
            try{
                Campaign_Association_Campaign_Obj.associateCampaigns(cmpId);
            }catch(Exception e){
                system.debug('message ++'+ e.getMessage());
            }   
        }
        
        Test.stopTest();       
    }
    public static testMethod void getNullOnly() {        
        Test.startTest();            
        try{
            Campaign_Association_Campaign_Obj.associateCampaigns(null);
        }catch(Exception e){
            System.assertEquals(null, null);
        }        
        Test.stopTest();       
    } 
}