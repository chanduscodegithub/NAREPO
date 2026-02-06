@isTest
public class Correspondence_From_Contact_ObjTest {
    public static testmethod void validate(){
        bulkTestData.CampaignCorrespondenceTestData3();
        List <contact> conlist = new List <contact>();
       List <Id> conids = new List <Id>(); 
        conlist=[ SELECT Id,Correspondence_Type__c FROM contact];
        for(contact c:conlist){
            conids.add(c.Id);
        }
       Correspondence_From_Contact_Obj.associateCampaignsOnCreation(conids);
    }
    public static testmethod void generalvalidation(){
        Test.startTest();
		string addupdate='update';
        string addinsert='insert';
        bulkTestData.CampaignCorrespondenceTestData();
        List <contact> conlist = new List <contact> ();
        List <Id> conids= new List <Id>();
        conlist = [SELECT Id FROM contact];
        for(contact i : conlist){
            conids.add(i.Id);
        }
        //Campaign_Association_Contact_Obj.associateCampaignsOnCreation(conids);
        contact con= [SELECT Id,Correspondence_Type__c,Correspondence_Previous__c FROM contact WHERE LastName='lasr Campaign'];
        con.Correspondence_Previous__c ='CD Holiday';
        system.debug('conconcon@@@'+con+'conconcon@@@');
        
        Correspondence_From_Contact_Obj.generalFunction(con.id, addupdate, con);
        Correspondence_From_Contact_Obj.generalFunction(con.id, addinsert, con);
        
            List <String> elist = new List <String>();
        elist.add('Annual Customer Forum');
        elist.add('CD Holiday');
        elist.add('CD United in Health Level 1');
        elist.add('HTA Campaign');
        
            
            Correspondence_From_Contact_Obj.associateContacts(con.Id, elist);
		Correspondence_From_Contact_Obj.deAssociateContacts(con.Id, elist);

        
        
        Test.stopTest();
    }

}