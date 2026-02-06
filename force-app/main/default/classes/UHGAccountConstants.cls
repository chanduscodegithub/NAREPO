/**
 * @description       : 
 * @author            : Spoorthy
 * @group             : 
 * @last modified on  : 02-22-2024
 * @last modified by  : Spoorthy
**/
public class UHGAccountConstants {
    
    /*
     * Page Size used for the Pagination which is used across all the Applets - START
     */ 
    public Integer APPLET_PAGESIZE = 5;
    
    public Integer POPUP_PAGESIZE = 10;
    
    /*
     * Page Size used for the Pagination which is used across all the Applets - END
     */ 
        
    //Contact and AccountContact Applet Constants
    
    public String CONTACT_TYPE_CM = 'CM Contact';
    
    public String CONTACT_TYPE_CD = 'CD Contact';
    
    public string CONTACT_STATUS_ACTIVE = 'Active';
    
    public Integer ACCOUNTCONTACT_PAGE_SIZE = 4;
    
    public String BEGINS_WITH = 'Begins With';
    
    public String CONTAINS = 'Contains';
    
    public String EQUALS_TO = 'Equals to';
    
    public String JOB_TITLE_ITAG = 'Job_Title__c';
    
    public String JOB_TITLE = 'Job Title';
    
    public String JOB_TITLE_ITAG_USER = 'Title';
    
    public String LAST_NAME_ITAG = 'LastName';
    
    public String LAST_NAME = 'Last Name';
    
    public String FIRST_NAME_ITAG = 'FirstName';
    
    public String FIRST_NAME = 'First Name';
    
    public Integer USER_POPUP_PAGE_SIZE = 8;
    
    public String CONSULTING_FIRM_ITAG = 'Name';
    
    public String CONSULTING_FIRM = 'Consulting Firm';
    
    public String FIRM_CITY_ITAG = 'BillingCity';
    
    public String FIRM_CITY = 'Firm City';
    
    public String FIRM_STATE_ITAG = 'BillingState';
    
    public String FIRM_STATE = 'Firm State';
    
    public String CONTACT_CONSULTING_FIRM_ITAG = 'Account.Name';
    
    /* Account Team Member Constant start */
    
    public String ACCOUNT_TEAM_ROLE = 'Account Manager';
    
    public String ACCOUNT_TEAM_ACCESS_LEVEL = 'Edit';
    
    public String ACCOUNT_TEAM_SORT_DESC = 'DESC';
    
    public String ACCOUNT_TEAM_ACCESS_LEVEL_READONLY = 'Read';
    
    public String ACCOUNT_TEAM_ACCESS_LEVEL_PRIVATE = 'None';
    
    public String USER_LICENSE_COMPANY_COMMUNITIES = 'Company Communities';
    
    public String USER_ROLE_CSI_Admin ='CSI Administrator';
    
    /* Account Team Member Constant end */
    
    /* Opportunity Team Member Constant start */
    
    public String OPPORTUNITY_TEAM_ROLE = 'Account Manager';
    
    public String OPPORTUNITY_TEAM_ACCESS_LEVEL = 'Edit';
    
    public String OPPORTUNITY_TEAM_SORT_DESC = 'DESC';
    
    /* Opportunity Team Member Constant end */
    
    
    /* Client Survey Results Constants Start */
    public String CLIENT_SURVEY_RESULTS_TYPE = 'Client Survey Results';
    public String CLIENT_SURVEY_RESULTS_TYPE_SUREST = 'Client Survey Results';
    public string PERCENTAGE_SYMBOL = '%';
    /* Client Survey Results Constants End */

    /* Senior UHG Executives Engaged in the Account - START */
    public String suffixSeniorUHGRecordName = '-Senior UHG Executives';
    /* Senior UHG Executives Engaged in the Account - END */    	
    
    
    // Operator values
	public static final String BEGINS_WITH = 'Begins With';    
    public static final String CONTAINS = 'Contains';    
    public static final String EQUALS_TO = 'Equals to';
    
	// Contact Field Names    
    public static final String FIRST_NAME = 'First Name';    
    public static final String LAST_NAME = 'Last Name';
    public static final String JOB_TITLE = 'Job Title';
    public static final String CONSULTING_FIRM = 'Consulting Firm';
    
    // Contact Field Itag Names
    public static final String FIRST_NAME_ITAG = 'FirstName';
    public static final String LAST_NAME_ITAG = 'LastName';
    public static final String JOB_TITLE_ITAG = 'Title';
    public static final String CONSULTING_FIRM_ITAG = 'Account.Name';
    
 
	// Risk Profile Constants
        
    public static string PERCENTAGE_FIELD = 'Percentage';
    public static string NUMEBR_FIELD = 'Number';
    public static string PICKLIST_FIELD = 'Picklist';
    public static string CURRENCY_FIELD = 'Currency';
    public static string INTEGER_FIELD = 'Integer';
    
 	//Compititors Landscape Medical CM Constants
    public String COMPETITOR_TYPE = 'Account Competitor';
    public String NATIONAL_ACCOUNTS_COMPETITOR_NAME = 'National Accounts';
    public String NATIONAL_ACCOUNTS_COMPETITOR_GROUP = 'UnitedHealthcare';
    public String NATIONAL_ACCOUNTS_COMPETITOR_TYPE = 'Account Competitor';
    
    //Competitive Landscape - Pharmacy/Specialty/OtherProducts Constants
    public String PHARMACY = 'Pharmacy';
    public String DENTAL = 'Dental';
    public String VISION = 'Vision';
    public String OTHERS = 'Other';
    public String MEDICAL = 'Medical';
    public String NATIONAL_ACCOUNTS_RECORD = 'National Accounts';
    public String TOTAL = 'Total';
    
    //Competitive Landscape - Add PopUp Constants
    public String ACCOUNT_TYPE = 'Competitor';
    public String COMPETITOR_STATUS = 'Active';
    public String COMPETITOR_CLASIFICATION_MEDICAL = 'Medical';
    
    // Accounts & MA
	public Integer Accounts_Current_Relationship_Pagination_Size = 10;
 
    //Membership Activities
    public Integer Membership_Activities_CMCD_Size = 6;
    
    // Applets Names
    public static string CONSULTANT_HISTORY_APPLET_NAME = 'ConsultantHistory';
    public static string RISK_PROFILE_APPLET_NAME_FULL_ACCESS = 'RiskProfileFullAccess';
    public static string COMPETITIVE_LANDSCAPE_MEDICAL_CD  = 'CompetitiveLandscapeMedicalCD';
    public static string COMPETITIVE_LANDSCAPE_MEDICAL_CM  = 'CompetitiveLandscapeMedicalCM';
    public static string COMP_LANDSCAPE_PHARMACY_SPECIAL_OTHERS_PRODUCT  = 'CompetitiveLandscapeRolesSpecialOthersProduct';    
    public static string NATIONAL_ACCOUNT_SALES_TEAM  = 'NationalAccountSalesTeam';    
    
    public static string BUSSINESS_GROUP_HEALTH  = 'BussinessGroupHealth';
    
    public static string RISK_PROFILE_APPLET_NAME_PARTIAL_ACCESS = 'RiskProfilePartialAccess';
    public static string ACCOUNT_CONSULTANTS  = 'AccountConsultants';
    public static string SENIOR_UHG  = 'SeniorUHG';    
    public static string CD_ACCOUNTS  = 'CdAccounts';
    public static string ACCOUNT_Team  = 'AccountTeam';
    public static string AGGREGATOR  = 'Aggregator';    
    
    //Roles
    public static string roleNamesExecutives = System.Label.BusinessGroupHealth_Not_Allowed_Roles_For_Edit;
    public static string cmRoleNames = System.Label.BGH_CM_Access_Role_Names;
    public static string cdRoleNames = System.Label.BGH_CD_Access_Role_Names;
    
    
    public static Map<String,String> userHasEditRoleNamesAccessMap = new Map<String,String>();
    public static Map<String,String> userNoEditRoleNamesAccessMap = new Map<String,String>();
    
    static{
        // checking for contains the Role
        userHasEditRoleNamesAccessMap.put(CONSULTANT_HISTORY_APPLET_NAME, System.Label.Consultant_History_Allowed_Roles_For_Edit);
        userHasEditRoleNamesAccessMap.put(RISK_PROFILE_APPLET_NAME_FULL_ACCESS, System.Label.Risk_Profile_Allowed_Roles_For_Edit);
        userHasEditRoleNamesAccessMap.put(COMPETITIVE_LANDSCAPE_MEDICAL_CD, System.Label.Competitive_Landscape_Medical_CD_Roles_To_EnableAddOrEditButtons);
        userHasEditRoleNamesAccessMap.put(COMPETITIVE_LANDSCAPE_MEDICAL_CM, System.Label.Competitive_Landscape_Medical_CM_Roles_To_EnableAddOrEditButtons);
        userHasEditRoleNamesAccessMap.put(NATIONAL_ACCOUNT_SALES_TEAM, System.Label.NationalAccountSalesTeam_Roles_To_EnableAddOrEditButtons);
        
        // checking for does not contains the Role
        userNoEditRoleNamesAccessMap.put(RISK_PROFILE_APPLET_NAME_PARTIAL_ACCESS, System.Label.Risk_Profile_Not_Allowed_Roles_For_Edit);
        userNoEditRoleNamesAccessMap.put(ACCOUNT_CONSULTANTS, System.Label.CM_CD_Consultants_Not_Allowed_Roles_For_Edit);
        userNoEditRoleNamesAccessMap.put(SENIOR_UHG, System.Label.SeniorUHG_Not_Allowed_Roles_For_Edit);
        userNoEditRoleNamesAccessMap.put(COMP_LANDSCAPE_PHARMACY_SPECIAL_OTHERS_PRODUCT, System.Label.CompetitiveLandscape_Roles_To_DisableAddOrEditButtons);
        userNoEditRoleNamesAccessMap.put(CD_ACCOUNTS, System.Label.BusinessGroupHealth_Not_Allowed_Roles_For_Edit);
        userNoEditRoleNamesAccessMap.put(ACCOUNT_Team, System.Label.BusinessGroupHealth_Not_Allowed_Roles_For_Edit);
        userNoEditRoleNamesAccessMap.put(AGGREGATOR, System.Label.BusinessGroupHealth_Not_Allowed_Roles_For_Edit);
    
        
    }
    
    /*Service AMT Applet Constants */
     public String LAST_NAME_ITAG_ADS = 'LastName__c';
    
    public String FIRST_NAME_ITAG_ADS = 'FirstName__c';
    
    public String JOB_TITLE_ITAG_USER_ADS = 'Title__c';
   
    
}