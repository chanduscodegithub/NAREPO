@isTest
public class membShipActivityProdCatTest {
    
    @testSetup static void setupAccount() {
        // Create common test accounts
        Account accCM_No_Child = new Account();
        accCM_No_Child.Name = 'Test Account';
        accCM_No_Child.Subtype__c ='Prospect';
        accCM_No_Child.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        insert accCM_No_Child;
        
        
        Opportunity opp =  new Opportunity();
        opp.AccountId=accCM_No_Child.Id;
        opp.Name='Test Opportunity';
        opp.Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP';
        opp.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CD').getRecordTypeId();
        opp.EffectiveDate__c = system.today();
        opp.Product_Type_Involved_in_Opp__c = 'Medical;Vision';
        opp.Has_a_Formal_RFP_Been_Issued__c ='No';
        opp.Does_this_Oppty_Risk_Involve_Exchanges__c  = 'No';
        opp.Is_There_Existing_Membership_at_Risk__c  = 'No';
        opp.Expected_Date_of_RFP__c = system.today();
        opp.StageName = 'Qualification';
        opp.CloseDate=System.today();
        insert opp;
        
        
        
    }
    
    
    @isTest static void testMethod1() {
        Id RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();
        
        Account acct = [SELECT Id FROM Account WHERE Name='Test Account' LIMIT 1];
        acct.RecordTypeId = RecordTypeId;
        update acct;
        
        Opportunity op = [SELECT Id FROM Opportunity WHERE Name='Test Opportunity' LIMIT 1];
        
        memberShipActivityProductCategory.fieldReturnPojo fpr = new  memberShipActivityProductCategory.fieldReturnPojo();
        fpr=memberShipActivityProductCategory.getSelectedList(op,'Product_Type_Involved_in_Opp__c',op.Id);
        
        op.Product_Type_Involved_in_Opp__c = 'Dental';
        //update op;
        //settingSelectedList(String fld,Id oppId,Boolean ispickvalchanged,String removedValue){
        memberShipActivityProductCategory.settingSelectedList('Product_Type_Involved_in_Opp__c',op.Id,false,'Medical');
        
        memberShipActivityProductCategory.saveMARecord(op);
        op.Name = '';
        memberShipActivityProductCategory.saveMARecord(op);
        
        memberShipActivityProductCategory.getUserProfile(op.AccountId);
        
        memberShipActivityProductCategory.getAccountRecordType(op.id);
        
        memberShipActivityProductCategory.getLoggedInUerRoleInfo(op.AccountId);
        
        // Perform some testing
    }
    
    
    public testMethod static void validateNBEAFieldSet(){
        Map<String,String> selCat = new Map<String,String>();
        selCat.put('Medical','');
        Map<String,String> instStageMap = new Map<String,String>();
        instStageMap.put('Medical','Initial_NBEA_Lead');
        Map<String,String> possibleProgrssMap = new Map<String,String>();
        possibleProgrssMap.put('Medical','NBEA_Lead');
        List<String> progressionfeildItagList = new List<String>();
        progressionfeildItagList.add('Id');
        progressionfeildItagList.add('RecordTypeId');
        progressionfeildItagList.add('Sales_Stage_Medical__c');
        Test.startTest();
        memberShipActivityProductCategory.getFields('NBEA', 
                                                    selCat, 
                                                    'Medical', 
                                                    'Opportunity', instStageMap, possibleProgrssMap, progressionfeildItagList, '', true, 'Tradional');
    }
    
    public testMethod static void validateCombineTabFieldSet(){
        Map<String,String> selCat = new Map<String,String>();
        selCat.put('Medical','');
        selCat.put('Other','');
        Map<String,String> instStageMap = new Map<String,String>();
        instStageMap.put('Medical','Initial_NB_Lead');
        instStageMap.put('Other','Initial_NB_Lead');
        Map<String,String> possibleProgrssMap = new Map<String,String>();
        possibleProgrssMap.put('Medical','NB_Lead');
        possibleProgrssMap.put('Other','NB_Lead');
        List<String> progressionfeildItagList = new List<String>();
        progressionfeildItagList.add('Id');
        progressionfeildItagList.add('RecordTypeId');
        progressionfeildItagList.add('Sales_Stage_Medical__c');
        progressionfeildItagList.add('Sales_Stage_Other__c');
        Test.startTest();
        /*memberShipActivityProductCategory.getFields('NB', 
                                                    selCat, 
                                                    'Medical_And_Other_Buy_Up', 
                                                    'Opportunity', instStageMap, possibleProgrssMap, progressionfeildItagList, '', true, 'Tradional');*/
    }
}