/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 02-05-2024
 * @last modified by  : Spoorthy
**/
public with sharing class CurrentProductsRestructuredController {
    @AuraEnabled
    public static Id getRecordIdCurrentProduct(Id RecordId){
        system.debug('RecordId '+RecordId);
        Id currentProductId = [Select id from ProductMix__c where AccountFirm__c =: RecordId][0].Id;
        system.debug('currentProductId '+currentProductId);
        return currentProductId;
    }
    
    @AuraEnabled
    public static String currentProfile(){
        Id currentProfileId = UserInfo.getProfileId();
        String profileName = [Select name from Profile where Id =:currentProfileId][0].Name;
        return profileName;
    }
    
    @AuraEnabled
    public static ProductMix__c getProductMixRecord(Id RecordId){
        //List<ProductMix__c> prodMixList = new List<ProductMix__c>();
        ProductMix__c prodMixList = new ProductMix__c();
        
        prodMixList = [SELECT Id, IsDeleted,Global_Products__c, Name, CreatedDate, CreatedBy.Name, LastModifiedDate, LastModifiedBy.Name, SystemModstamp, LastActivityDate, 
                       LastViewedDate, LastReferencedDate, AccountFirm__c, AccountFirm__r.Name, Current_Product_Name__c, Medical_Products__c, Funding_Arrangements__c, 
                       Tiered_Benefits__c, Pharmacy__c, Dental__c, Vision__c, Supplemental_Health__c, Life__c, Disability__c, 
                       Financial_Accounts__c, Care_Management__c, Centers_of_Excellence__c, Decision_Support__c, Disease_Management__c, Women_s_Health__c, Worksite_Wellness__c, 
                       Wellness_and_Wellness_Coaching__c, Rally_Client_above_base__c, Incentive_Products__c, Medical_Necessity__c, Behavioral_Health__c, EAP_Domestic__c, 
                       EAP_Global__c, Retiree_Products__c, Accident_Protection__c, Critical_Illness__c, Hospital_Indemnity__c, Basic_Life__c, 
                       Dependent_Life__c, Supplemental_Life__c, Short_Term_Disability__c, Long_Term_Disability__c, Absence_Managaement__c, 
                       Flexible_Spending_Account_FSA__c, Health_Incentive_Account_HIA__c, Health_Reimbursement_Account_HRA__c, Health_Savings_Account_HSA__c, 
                       Retiree_Reimbursement_Account_RRA__c, Advocate4Me__c, Bariatric_Resource_Services__c, Cancer_Resource_Services__c, 
                       Cancer_Support_Program__c, Kidney_Resource_Services__c, Personal_Health_Support_PHS_Program__c, ER_Decision_Support__c, 
                       Nurseline_Program__c, Second_Opinion_Services_2nd_MD__c, Asthma_Program__c, Coronary_Artery_Disease_Program__c, 
                       Heart_Failure_Program__c, Diabetes_Program__c,UMR_Ongoing_Condition_CARE__c,UMR_Emerging_CARE__c, Fertility_Solutions__c, Neonatal_Resource_Services__c,Maven_Maternity__c,
                       Doula_Support_programs__c,UMR_Maternity_CARE__c,Wellness_Rally__c,UMR_Wellness_CARE__c,Smoking_Cessation__c, 
                       Real_Appeal__c, UHC_Motion__c, Wellness_Coaching__c, Shared_Savings_Program_Facility_R_C__c,
                       Site_of_Service_SOS_Office_Based__c, Arthroscopy__c, Foot_Surgery__c, Infertility__c, 
                       Radiology_Services__c, Cardiology_Services__c, ECRS_client__c, ECRS_Type__c, Engagement_Solutions_Client__c, Engagement_Solutions_Tier__c, 
                       UHC_Cobra_Administration__c, Stop_Loss__c, UHC_UMR_Telehealth_Solutions__c, UHC_UMR_Member_Service_and_Tools__c, UMR_COBRA_Services__c, Member_Service_Vendor__c,
                       Transplant_Resource_Services__c, Orthopedic_Solutions__c, Buoy__c, Surgical_Management_Solution_SMS__c,Stride__c, Complex_Care_Concierge_C3__c, 
                       Cancer_Guidance_Program__c, Site_of_Service_SOS_Outpatient_Facility__c, Commuter_Expense_Reimbursement_Account__c, Chronic_Obstructive_Pulmonary_Disease__c,
                       Care_Mgmt_Decision_Supprt_Women_s_Health__c, Pet_Insurance_FIGO__c, Payment_Integrity__c, Adult_Flu_Clinic__c, Biometric_Screening__c, Onsite_Fitness__c, 
                       Optum_Onsite_Health_Promotion_Specialist__c,Surest__c,uhc_hub__c FROM ProductMix__c where AccountFirm__c =: RecordId][0];
        
        return prodMixList;
    }
    
    @AuraEnabled
    public static void saveRecords(ProductMix__c ProductMix){
        update ProductMix;
    }
    
    @AuraEnabled
    public static void additionalComments(String comments, Id RecordId){
        system.debug('Comments '+comments);
        system.debug('RecordId '+RecordId);
        Boolean is_success = false; 
        
        Account acc = [Select id,name from Account where id=:RecordId WITH USER_MODE][0];
        String accName = acc.Name;
        String accId = String.valueOf(acc.Id);
        
        ProductMix__c pmix = [Select id,name from ProductMix__c where AccountFirm__c =: RecordId][0];
        
        if(comments != null){
            system.debug('Entering if');
            List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            
            /*List<String> sendTo = new List<String>();
            sendTo.add('samarth.nadig@crmit.com');
            sendTo.add('nnikhila@crmit.com');
            sendTo.add('kavitha.mallela@crmit.com');
            sendTo.add('shruthi.mallikarjun@crmit.com');
            sendTo.add('michele_m_dube@uhc.com');
            mail.setToAddresses(sendTo);*/
            
            String emailList = Label.Current_Product_Email_List;
            system.debug('emailList '+emailList);
            List<String> sendTo = new List<String>();
            sendTo.addAll(emailList.split(','));
            system.debug('sendTo '+sendTo);
            mail.setToAddresses(sendTo);
             
            mail.setSubject('Request to Update Missing\\Incorrect Information within the UHG Products Tab');
            //String body = 'Please find the additional comments - ' + comments; 
            String body = '<b>Requestor:</b><br/>'+UserInfo.getName()+'<br/><br/> <b>Company Information: </b><br/>Name: '+accName+'<br/> Row Id: '+accId+'<br/><br/><b>Missing\\Incorrect Information:</b><br/>'+comments;
            mail.setHtmlBody(body);
            mails.add(mail);
            Messaging.sendEmail(mails);
        }
    }
    
    @AuraEnabled
    public static string getClientPlatformValue(Id RecordId){
        return [Select id,name,UMR_Client_Platform__c from Account where Id =: RecordId][0].UMR_Client_Platform__c;
    }
}