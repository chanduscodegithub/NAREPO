@isTest 
public class AMTBatchTest {
    static testMethod void testAmtBatch() {
        try{
            List<service_amt__c> samtList = new List<service_amt__c>();
            List<Policy_Information__c> piList = new List<Policy_Information__c>();
            
            Account acc = new Account(Name = 'Test CD Account', 
                                      Subtype__c ='Prospect',
                                      UMR_Client_Platform__c = 'USP',
                                      RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId());
            insert acc;
            
            Policy_Information__c policy = new Policy_Information__c(Name = '720455', 
                                                                     Company__c = acc.Id, 
                                                                     Policy_Type__c = 'Medical',
                                                                     policy_status__c='active',
                                                                     Policy__c = 'Test', 
                                                                     
                                                                     CSP_GSP_or_Extended_Networks__c = '1',
                                                                     Customer_Sponsored_Service_Center__c = '1',
                                                                     DHP_Diabetes_Health_Plan__c = '0',
                                                                     Eligibility__c = '0',
                                                                     FSA_c__c = '0',
                                                                     Hospital_Systemss__c = '0',
                                                                     Life__c = '0',
                                                                     Medicare_Plan__c = '0',
                                                                     ne_Business_Exchange_Transition_Factor__c = '0',
                                                                     UHG_Owned_Custom_Portal__c = '0',
                                                                     New_Product_1st_Year_1__c = 1);
            piList.add(policy);
            
            
            Policy_Information__c policy1 = new Policy_Information__c(Name = '720456', 
                                                                      Company__c = acc.Id, 
                                                                      policy_status__c='active',
                                                                      Policy__c = 'Test', 
                                                                      CSP_GSP_or_Extended_Networks__c = '1',
                                                                      Customer_Sponsored_Service_Center__c = '1',
                                                                      DHP_Diabetes_Health_Plan__c = '0',
                                                                      Eligibility__c = '0',
                                                                      FSA_c__c = '0',
                                                                      Hospital_Systemss__c = '0',
                                                                      Life__c = '0',
                                                                      Medicare_Plan__c = '0',
                                                                      ne_Business_Exchange_Transition_Factor__c = '0',
                                                                      UHG_Owned_Custom_Portal__c = '0',
                                                                      New_Product_1st_Year_1__c = 1);
            piList.add(policy1);
            insert piList;
            
            Service_AMT__c samt = new Service_AMT__c(Name = 'Test Service Amt',
                                                     Company__c = acc.Id,
                                                     User_Contact_Id__c = 'testContactId',
                                                     policy1__c = null,
                                                     Case_Management_End_Date__c=null,
                                                     Policy_Information_MultiChecKlist__c = null);
            samtList.add(samt);
            insert samtList;
            
            AMTBatch cb = New AMTBatch();
            Database.QueryLocator ql = cb.start(null);
            cb.execute(null,samtList);
            cb.Finish(null);
        }
        catch(Exception e){
            system.debug('Exception occured '+e); 
        }
    }
}