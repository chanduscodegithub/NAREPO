@isTest
public class Disposition_Change_Audit_Trail_Test {
    static testMethod void testMethod1(){
        test.startTest();
        List<Disposition_Change_Audit_Trail.MyInvocableVariable> mivList = new List<Disposition_Change_Audit_Trail.MyInvocableVariable>();
        
		Disposition_Change_Audit_Trail dcat = new Disposition_Change_Audit_Trail();
        Disposition_Change_Audit_Trail.MyInvocableVariable miv = new Disposition_Change_Audit_Trail.MyInvocableVariable();
        
        miv.oldVal = 'Sold'; 
        miv.medVal = 'Sold';
        miv.dentVal = 'Declined';
        miv.pharmVal = 'TBD';
        miv.visVal = 'Dead';
        miv.changedField = 'Disposition_Medical__c';
        mivList.add(miv);
        Disposition_Change_Audit_Trail.printOldAndCurrentValues(mivList);
        
        miv.changedField = 'Disposition_Dental__c';
        mivList.add(miv);
        Disposition_Change_Audit_Trail.printOldAndCurrentValues(mivList);
        
        miv.changedField = 'Disposition_Pharmacy__c';
        mivList.add(miv);
        Disposition_Change_Audit_Trail.printOldAndCurrentValues(mivList);
        
        miv.changedField = 'Disposition_Vision__c';
        mivList.add(miv);
        Disposition_Change_Audit_Trail.printOldAndCurrentValues(mivList);
        
        test.stopTest();
    }
}