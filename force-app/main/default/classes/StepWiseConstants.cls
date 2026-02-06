public class StepWiseConstants {
    
    public static final String ITAG_SUFFIX='##';
    public static final String ITAG_PREFIX='%%';
    public static final String EMPTY_STRING='';
    public static final String DELIMETER_DOT='\\.';
    public static final String REG_EXPRESSION='[##]+[a-zA-Z0-9_.]*[%%]+';
    public static final String PERCENTAGE_WITH_BRACKET='[%%]';
	public static final String COMMENT_PREFIX = '<!--##';
	public static final String COMMENT_SUFFIX = '%%-->';
	public static final String DOT_SEPARATOR = '.';
    public static final String CRITICAL_ILLNESS_PROTECTION_PLAN_PRODUCT1 = 'Critical Illness Protection Plan - Employer Paid (Fully or Partially)';
    public static final String CRITICAL_ILLNESS_PROTECTION_PLAN_PRODUCT2 = 'Critical Illness Protection Plan - Voluntary';
    public static final String ACCIDENT_PROTECTION_PLAN_PRODUCT1 = 'Accident Protection Plan - Employer Paid (Fully or Partially)';
    public static final String ACCIDENT_PROTECTION_PLAN_PRODUCT2 = 'Accident Protection Plan - Voluntary';
    public static final String HOSPITAL_INDEMNITY_VOLUNTARY_PRODUCT1 = 'Hospital Indemnity - Voluntary';
    
    public static final String DELIMITER_UNDERSCORE = '_';
    
    public static final String OPPORTUNITY_PRODUCTS_LIST = 'Critical Illness Protection Plan - Employer Paid (Fully or Partially),Critical Illness Protection Plan - Voluntary,Accident Protection Plan - Employer Paid (Fully or Partially),Accident Protection Plan - Voluntary';
    
	public static final String CHILD_QUERY = '(Select Existing_Membership_at_Risk__c,Estimated_Members_Existing_New__c,Existing_Members_Involved_in_the_Bid__c ,Product2.Id,Product2.Name,Product_Line__c,Product2.StepWise_Product_Name__c, Product2.StepWise_Product_RowID__c,Product2.Considered_For_StepWise_Integration__c,Product2.Reporting_Product_Type__c from OpportunityLineItems)';
	public static final String MISSING_FIELDS ='BusinessType__c,Account.UHC_Medical_Members__c,Membership_Activity_Type__c ,Estimated_Members_Existing_New__c,CreateNB__c,CreateRen__c,Proposal_Due_Date_Dental__c, Proposal_Due_Date_Other__c, Proposal_Due_Date_Vision__c,Merit_Row_Id__c,Retirees_in_the_Proposal_CI_AP_HI__c,Category__c,Employees_in_the_Proposal_CI_AP_HI__c,Existing_Members_Involved_in_the_Bid__c, Reason_for_the_Opportunity_Risk__c ,Date_the_Dental_Quote_is_Needed_from_UW__c, Date_the_Vision_Quote_is_Needed_from_UW__c,Date_the_CI_APP_HIPP_Quote_is_Needed__c,Sales_Stage_vision__c,Sales_Stage_Dental__c,Sales_Stage_Other__c,Employees_in_the_Proposal_Dental__c  ,Employees_in_the_Proposal_Vision__c,Retirees_in_the_Proposal_Dental__c,Retirees_in_the_Proposal_Vision__c,Owner.Name';
	public static final String STEPWISE_FIELDS = 'DateTime_Sent_to_Stepwise_Leave__c,DateTime_Sent_to_Stepwise_Life__c,DateTime_Sent_to_Stepwise_LTD__c,DateTime_Sent_to_Stepwise_STD__c,DateTime_Sent_to_StepWise_APP__c,DateTime_Sent_to_StepWise_CIPP__c,DateTime_Sent_to_StepWise_Dental__c,DateTime_Sent_to_StepWise_HIPP__c,DateTime_Sent_to_StepWise_Vision__c';
    public static final String QUERY_CONDITIONS = ' (RecordType.Name = \'CM Membership Activity (Existing Client)\') AND (Membership_Activity_Type__c = \'Traditional\')';
	public static final String QUERY_CONDITIONS_CD = '(RecordType.Name = \'CD Membership Activity (Prospect or Aggregator)\') AND (Membership_Activity_Type__c = \'Traditional\')';
}