@isTest
public class SBS_Support_Issue_TeamMembersTest {
    
    public testMethod static void valiupdateTriggers(){
        Test.startTest();
        Id recordTypeId = [SELECT Id, Name FROM RecordType where name = 'SBS Support' and SobjectType = 'Case' Limit 1].Id;    
        List<Case> caseObjList = new List<Case>();
        for(Integer i  = 0; i < 10 ; i++){
            Case caseObj=new Case();
            caseObj.Status = 'Open';
            caseObj.RecordTypeId = recordTypeId;
            caseObjList.add(caseObj);
        }
        insert caseObjList;
        Test.stopTest();
        
    }
    
}