/**
* Purpose     : Test class for DontAllowDuplicatePolicyNumbersTest
* =============================================================================
* History
* -----------------------
* VERSION     AUTHOR                     DATE            DETAIL
*   1.0      GHANSHYAM CHOUDHARI         Nov 2019     Initial Class
*==============================================================================
*/
@isTest
public class DontAllowDuplicatePolicyNumbersTest {
    
    @isTest
    static void dontAllowDuplicatePolicies(){
        
            Boolean expectedExceptionThrown;
            
            list<Policy_Information__c> listOfpolicies = new list<Policy_Information__c>();
            Map<Id,Policy_Information__c> newMap = new Map<Id,Policy_Information__c>();
            Map<Id,Policy_Information__c> oldMap = new Map<Id,Policy_Information__c>();
            
            Account acc = new Account(Name = 'Test CD Account', 
                                      Subtype__c ='Prospect',
                                      RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId());
            insert acc;
            
            Policy_Information__c policy = new Policy_Information__c(Name = '720455', 
                                                                     Company__c = acc.Id, 
                                                                     Policy__c = 'Test',
                                                                     CSP_GSP_or_Extended_Networks__c = '0 that require ongoing activity after setup',
                                                                     Customer_Sponsored_Service_Center__c = '1',
                                                                     DHP_Diabetes_Health_Plan__c = '0',
                                                                     Eligibility__c = '0',
                                                                     FSA_c__c = '0',
                                                                     Hospital_Systemss__c = '0',
                                                                     Life__c	= '0',
                                                                     Medicare_Plan__c = '0',
                                                                     ne_Business_Exchange_Transition_Factor__c = '0',
                                                                     UHG_Owned_Custom_Portal__c = '0',
                                                                     New_Product_1st_Year_1__c = 1,
                                                                     UMR_SBC__c = 5,
                                                                     Rental_Networks__c = 'Yes');
            insert policy;
            
            
            policy.Eligibility__c = '1';
            
            update policy;
            
            
            Policy_Information__c updatedPolicyInfo = new Policy_Information__c(Id=policy.Id, Name = '00886737', 
                                                                                Company__c = acc.Id,Policy__c = 'Test', 
                                                                                CSP_GSP_or_Extended_Networks__c = '0 that require ongoing activity after setup',
                                                                                Customer_Sponsored_Service_Center__c = '1',
                                                                                DHP_Diabetes_Health_Plan__c = '0',
                                                                                Eligibility__c = '0',
                                                                                FSA_c__c = '0',
                                                                                Hospital_Systemss__c = '0',
                                                                                Life__c	= '0',
                                                                                Medicare_Plan__c = '0',
                                                                                ne_Business_Exchange_Transition_Factor__c = '0',
                                                                                UHG_Owned_Custom_Portal__c = '0',
                                                                                New_Product_1st_Year_1__c = 1,
                                                                                UMR_SBC__c = 5,
                                                                                Rental_Networks__c = 'Yes');
            update updatedPolicyInfo;
            
            
            
            Policy_Information__c policy1 = new Policy_Information__c(Name = '00886737', 
                                                                      Company__c = acc.Id,Policy__c = 'Test', 
                                                                      CSP_GSP_or_Extended_Networks__c = '0 that require ongoing activity after setup',
                                                                      Customer_Sponsored_Service_Center__c = '1',
                                                                      DHP_Diabetes_Health_Plan__c = '0',
                                                                      Eligibility__c = '0',
                                                                      FSA_c__c = '0',
                                                                      Hospital_Systemss__c = '0',
                                                                      Life__c	= '0',
                                                                      Medicare_Plan__c = '0',
                                                                      ne_Business_Exchange_Transition_Factor__c = '0',
                                                                      UHG_Owned_Custom_Portal__c = '0',
                                                                      New_Product_1st_Year_1__c = 1,
                                                                      UMR_SBC__c = 5,
                                                                      Rental_Networks__c = 'Yes');
            insert policy1;  
            
            
            Policy_Information__c pupdate= [select id ,Salesforce_Volume__c,Add_ons_Sum_of_total_input__c from Policy_Information__c where id=:policy1.Id];
            pupdate.Add_ons_Sum_of_total_input__c=100;
            pupdate.Salesforce_Volume__c=100;
            update pupdate;
            
            newMap.put(policy.id,policy);
            oldMap.put(updatedPolicyInfo.id,updatedPolicyInfo);
            DontAllowDuplicatePolicyNumbersHelper.calculateAddOn(newMap,oldMap);
            
            newMap.put(policy.id,policy);
            oldMap.put(policy.id,policy);
            DontAllowDuplicatePolicyNumbersHelper.calculateAddOn(newMap,oldMap);
            
            DontAllowDuplicatePolicyNumbersHelper.complexityLoigicUpdateHandler(newMap,oldMap);
            
            policy.CSP_GSP_or_Extended_Networks__c = null;
            policy.Customer_Sponsored_Service_Center__c = null;
            policy.DHP_Diabetes_Health_Plan__c = null;
            policy.Eligibility__c = null;
            policy.FSA_c__c = null;
            policy.Hospital_Systemss__c = null;
            policy.Life__c	= null;
            policy.Medicare_Plan__c = null;
            policy.ne_Business_Exchange_Transition_Factor__c = null;
            policy.UHG_Owned_Custom_Portal__c = null;
            policy.New_Product_1st_Year_1__c = null;
            //policy.Add_ons_Sum_of_total_input__c = null;
            update policy;
            
            updatedPolicyInfo.CSP_GSP_or_Extended_Networks__c = null;
            updatedPolicyInfo.Customer_Sponsored_Service_Center__c = null;
            updatedPolicyInfo.DHP_Diabetes_Health_Plan__c = null;
            updatedPolicyInfo.Eligibility__c = null;
            updatedPolicyInfo.FSA_c__c = null;
            updatedPolicyInfo.Hospital_Systemss__c = null;
            updatedPolicyInfo.Life__c	= null;
            updatedPolicyInfo.Medicare_Plan__c = null;
            updatedPolicyInfo.ne_Business_Exchange_Transition_Factor__c = null;
            updatedPolicyInfo.UHG_Owned_Custom_Portal__c = null;
            updatedPolicyInfo.New_Product_1st_Year_1__c = null;
            //updatedPolicyInfo.Add_ons_Sum_of_total_input__c = null;
            update updatedPolicyInfo;
            
            newMap.put(policy.id,policy);
            oldMap.put(updatedPolicyInfo.id,updatedPolicyInfo);
            DontAllowDuplicatePolicyNumbersHelper.calculateAddOn(newMap,oldMap);
            
            newMap.put(policy.id,policy);
            oldMap.put(policy.id,policy);
            DontAllowDuplicatePolicyNumbersHelper.calculateAddOn(newMap,oldMap);
            
            DontAllowDuplicatePolicyNumbersHelper.complexityLoigicUpdateHandler(newMap,oldMap);
        	
        	System.assertEquals(1, [SELECT count() FROM Account WHERE Name = 'Test CD Account' ]);
    }
}