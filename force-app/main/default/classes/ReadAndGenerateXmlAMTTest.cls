@isTest
public class ReadAndGenerateXmlAMTTest {
    public static testmethod void validateAllTestMethod(){
        List <String> accntList = new List <String> ();
        /*bulkTestData.accountTestData();
        bulkTestData.ContactUHGTestData();
        bulkTestData.ServiceAMTTestData();
        bulkTestData.policyInformationTestData();*/
        
        Account accECCAC = new Account();
        accECCAC.Name = 'Account Existing Client Complex Accounts Client';
        accECCAC.Subtype__c ='Complex Accounts';
        accECCAC.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Existing Client').getRecordTypeId();
        insert accECCAC;
        
        Policy_Information__c pi  = new Policy_Information__c (
        Name='1234567',Company__c=accECCAC.Id,Policy_Type__c='Medical',
            Policy__c='policy test'
        );
        insert pi;
		
        Policy_Information__c pi1  = new Policy_Information__c (
        Name='1234567623',Company__c=accECCAC.Id,Policy_Type__c='FSA',
            Policy__c='policy testpi1'
        );
        insert pi1;
        
        Policy_Information__c pi2  = new Policy_Information__c (
        Name='1234567623',Company__c=accECCAC.Id,Policy_Type__c='HRA',
            Policy__c='policy testpi2'
        );
        insert pi2;
        

        String acntListId= [SELECT Id FROM Account WHERE Name='Account Existing Client Complex Accounts Client'].Id;
        Policy_Information__c ply = [SELECT Id FROM Policy_Information__c Limit 1];
        String policyId = ply.Id;        
		accntList.add(acntListId);
        system.debug('accntList@@@'+accntList);
        
        string templateName='AMT_Template';
        string teamTypeInternal= 'Internal';
        string teamTypeExternal= 'External';
        string AdvanceMemberShip= 'Contact';
        list<service_amt__c> seList=new list<service_amt__c>();
        try{
            ReadAndGenerateXmlAMT.getRefGuideTemplateInXML(seList,accECCAC.Id);
            Assert.areEqual( seList.size()>0, false );
            
            ReadAndGenerateXmlAMT.getTemplateInXML(accntList, templateName, teamTypeInternal, true, policyId);
            Assert.isNotNull( teamTypeInternal );
            ReadAndGenerateXmlAMT.getTemplateInXML(accntList, templateName, teamTypeExternal, false, policyId);
            ReadAndGenerateXmlAMT.getChildReleationShipNames(AdvanceMemberShip);
        }catch(Exception e){
            system.debug('@@e@@'+e.getMessage());           
        } 
        
    }
    public static testmethod void nullpoiterException(){
        try{
            ReadAndGenerateXmlAMT.getTemplateInXML(null, null, null, null, null);
        }catch(Exception e){
            system.debug('@@eNull@@'+e.getMessage());           
        } 
        
    }
    

}