@isTest
public class CreateCompetitorRecordsForMATestClass {
    
    public static testMethod void testMethod1() {
        
        List<Account> accList = new List<Account>();
        
        Account cmAccount = new Account(Name = 'Test CM Account',
                                        recordTypeId=Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId(),
            							Subtype__c ='Specialty Benefits Only');        
        accList.add(cmAccount);
        
        Account cdAccount = new Account(Name ='Test CD Account',
                                        recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId());
        accList.add(cdAccount);                
        
        Account competitorAccount = new Account(Name ='National Accounts',
            									recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId());        
        accList.add(competitorAccount);
        
        Account totalAccount = new Account(Name ='Total',
            									recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId());        
        accList.add(totalAccount);
        
        Account competitorAccount1 = new Account(Name ='Aetna',
            									recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId());        
        accList.add(competitorAccount1);
        
        Account competitorAccount2 = new Account(Name ='Aetna',
            									recordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Competitor').getRecordTypeId());        
        accList.add(competitorAccount2);
        
        insert accList;
        
        Competitor__c competitorRec = new Competitor__c(Account__c = cmAccount.Id,
            											Type__c = 'Account Competitor',
            											Competitorclassification__c = 'Medical',
            											CompetitorAccount__c = competitorAccount1.Id);
        insert competitorRec;
		Competitor__c competitorRec1 = new Competitor__c(Account__c = cmAccount.Id,
            											Type__c = 'Account Competitor',
            											Competitorclassification__c = 'Medical',
            											CompetitorAccount__c = competitorAccount2.Id);
        insert competitorRec1;
        
        
        List<Opportunity> oppList = new List<Opportunity>();
        
        Opportunity opp =  new Opportunity(AccountId = cmAccount.Id,
                                           Name = 'Test CM Opp 1111',
                                           Reason_for_the_Opportunity_Risk__c = 'Confirmed or Likely RFP',
                                           EffectiveDate__c = System.today(),
                                           Product_Type_Involved_in_Opp__c = 'Medical;Vision',
                                           Has_a_Formal_RFP_Been_Issued__c = 'No',
                                           Does_this_Oppty_Risk_Involve_Exchanges__c = 'No',
                                           Does_this_Oppty_Risk_Involve_Consultant__c ='No',
                                           Is_There_Existing_Membership_at_Risk__c  = 'No',       
                                           StageName='Qualification',
                                           CloseDate=System.today(),
                                           RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByDeveloperName().get('CM').getRecordTypeId(),
                                           Expected_Date_of_RFP__c = System.today());
        oppList.add(opp);
        
        insert oppList;
        
        List<String> inputList = new List<String>();
        for(Opportunity oppObj : oppList) {
            inputList.add(oppObj.Id);
        }
        CreateCompetitorRecordsForMA.CreateCompetitorRecords(inputList);        
    }
}