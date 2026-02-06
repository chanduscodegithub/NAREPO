@isTest
public class IPMInformationWeightageCalculationTest {

    
    @testSetup
    static void testSetup(){
        
        Account acc = new Account(Name = 'Test CD Account', 
                                      Subtype__c ='Prospect',
                                      RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId());
            insert acc;
        
        Policy_Information__c policy = new Policy_Information__c(Name = '720455', 
                                                                     Company__c = acc.Id, 
                                                                     Policy__c = 'Test',
                                                                     CSP_GSP_or_Extended_Networks__c = '0 that require ongoing activity after setup',
                                                                     Customer_Sponsored_Service_Center__c = '1',
                                                                     Eligibility__c = '0',
                                                                     FSA_c__c = '0',
                                                                     Hospital_Systemss__c = '0',
                                                                     Life__c	= '0',
                                                                     Medicare_Plan__c = '0',
                                                                     ne_Business_Exchange_Transition_Factor__c = '0',
                                                                     UHG_Owned_Custom_Portal__c = '0',
                                                                     New_Product_1st_Year_1__c = 1,
                                                                     UMR_SBC__c = 5,
                                                                     Rental_Networks__c = 'Yes',
                                                                	 Policy_Status__c = 'Active');
        insert policy;
        
        
        
        List<IPM_Information__c> ipmList = new List<IPM_Information__c>();
        IPM_Information__c ipm1 = new IPM_Information__c();
        ipm1.Company__c = acc.Id;
        ipm1.Policy_Information__c = policy.Id;
        ipm1.PPM_Optics__c = 4;
        ipm1.Attending_Open_Enrollment_Meetings__c = 3;
        ipm1.Total_of_External_Data_Files__c = 2;
        ipmList.add(ipm1);
        
        IPM_Information__c ipm2 = new IPM_Information__c();
        ipm2.Company__c = acc.Id;
        ipm2.Policy_Information__c = policy.Id;
        ipm2.PPM_Optics__c = 4;
        ipm2.Attending_Open_Enrollment_Meetings__c = 3;
        ipm2.Total_of_External_Data_Files__c = 2;
        ipmList.add(ipm2);
        
        //insert ipmList;
        
        Database.SaveResult[] results = Database.insert(ipmList, false);
        
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                System.debug('Successfully inserted record with ID: ' + sr.getId());
            } else {
                // Handle errors
                for (Database.Error err : sr.getErrors()) {
                    System.debug('Error: ' + err.getMessage());
                    System.debug('Error: ' + err.getFields());
                }
            }
        }
    }
    
    @isTest
    static void testMethod1(){
        Map<Id,IPM_Information__c> ipmMap = new Map<Id,IPM_Information__c>([SELECT Id,Company__c,Policy_Information__c,PPM_Optics__c,Attending_Open_Enrollment_Meetings__c,Total_of_External_Data_Files__c,
                                                                            Anticipated_Number_of_NEW_Benefit_Sets__c,Vision__c, Dental__c, Benefit_Tiering__c, Nexus_ACO__c, Other_Gated_Products__c,Pre_Implementation_Audit__c,
                                                                            History_Conversion_Transition__c, Engagement_Solutions__c, Pre_Member_Website__c, of_Eligibility_File_Feeds__c, OptumRX_Pharmacy__c, Financial_Protection__c,
                                                                            FSA_Dependent_Care__c, FSA_Healthcare__c, FSA_Limited_Purpose__c, HRA_Limited_Purpose__c, HRA_Post_Deductible__c, HRA_Traditional__c, HIA__c, HCSC__c, OptumBank_HSA__c,
                                                                            CERA__c, OptumHealth_Services__c, Optum_Disease_Management_Buy_Ups__c, Rally_Portal__c,Optum_Worksite_Wellness__c, Optum_Personal_Coaching__c, Optum_Behavioral_Health__c,
                                                                            Optum_Behavioral_Health_Buy_Ups__c, Optum_EAP__c, Cross_Carrier_Set_up__c, Advocate4Me__c, C3__c, Personal_Rewards__c, COBRA__c, FlexWork__c, Stop_Loss_by_UHC__c, 
                                                                            Incremental_Products_Services_Complexity__c, Administrative__c, Meetings__c, Travel_Time__c, Regulatory_for_FI__c, Portfolio_Grid_for_FI__c, 
                                                                            OptumHealth_Services_Buy_Ups__c, Non_Standard_Network_Set_up__c, OptumHealth_Services_Buy_Ups_Score_2__c, Staff_Assignment__c
                                                                            FROM IPM_Information__c]);
        Map<Id,IPM_Information__c> oldIpmMap = new Map<Id,IPM_Information__c>();
        System.assertEquals(2,ipmMap.values().size());
        
        Test.startTest();
        IPMInformationWeightageCalculationHelper.calculateAddOnInsert(ipmMap.values());
        IPMInformationWeightageCalculationHelper.calculateAddOnUpdate(ipmMap, ipmMap);
        //IPMInformationWeightageCalculationHelper.calculateHOCForStaff(ipmMap, ipmMap, true);
        Test.stopTest();
        
    }
}